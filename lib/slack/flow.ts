/**
 * Flow orchestrator: given a user id and an action, advance their state
 * and post / update the appropriate Slack surface.
 *
 * Surfaces involved:
 *   - DM card  — one evolving message in the user's Synko DM. Most stage
 *                transitions update it in place via chat.update.
 *   - Modal    — used only for the hatch reveal. Opens with the egg, then
 *                updates after a 2s pause to show the pet.
 *   - App Home — the "side panel" tab. Republished after major state changes
 *                (species hatched, reflection delivered).
 *
 * The hatch reveal is the only stage that touches all three.
 */

import type { KnownBlock, View } from "@slack/web-api";
import { COACHING_MOMENTS } from "@/content/coachingMoments";
import { pickSpeciesFromIntentions } from "@/lib/match";
import { getSlackClient } from "@/lib/slack/client";
import {
  ACTIONS,
  PETS_BY_ID,
  analysisBlocks,
  coachingBlocks,
  endBlocks,
  hatchingModalEggView,
  hatchingModalRevealView,
  hatchingPreBlocks,
  hatchingRevealBlocks,
  homeView,
  intentionsBlocks,
  introBlocks,
  reflectionBlocks,
} from "@/lib/slack/blocks";
import {
  channelPickerView,
  listJoinableChannels,
} from "@/lib/slack/onboarding";
import { getState, resetState, setState } from "@/lib/slack/state";

/* -------------------------------------------------------------------------- */
/*  Slack surface helpers                                                     */
/* -------------------------------------------------------------------------- */

async function ensureDm(userId: string): Promise<string> {
  const slack = getSlackClient();
  const state = getState(userId);
  if (state.dmChannelId) return state.dmChannelId;

  const opened = await slack.conversations.open({ users: userId });
  const channelId = opened.channel?.id;
  if (!channelId) throw new Error(`Failed to open DM with user ${userId}`);
  setState(userId, { dmChannelId: channelId });
  return channelId;
}

async function postCard(
  userId: string,
  blocks: KnownBlock[],
  fallbackText: string,
): Promise<void> {
  const slack = getSlackClient();
  const channel = await ensureDm(userId);
  const res = await slack.chat.postMessage({ channel, blocks, text: fallbackText });
  setState(userId, { activeMessageTs: res.ts ?? null });
}

async function updateActiveCard(
  userId: string,
  blocks: KnownBlock[],
  fallbackText: string,
): Promise<void> {
  const slack = getSlackClient();
  const state = getState(userId);
  if (!state.dmChannelId || !state.activeMessageTs) {
    await postCard(userId, blocks, fallbackText);
    return;
  }
  await slack.chat.update({
    channel: state.dmChannelId,
    ts: state.activeMessageTs,
    blocks,
    text: fallbackText,
  });
}

async function openModal(userId: string, triggerId: string, view: View): Promise<void> {
  const slack = getSlackClient();
  const res = await slack.views.open({ trigger_id: triggerId, view });
  setState(userId, { activeModalViewId: res.view?.id ?? null });
}

async function updateModal(userId: string, view: View): Promise<void> {
  const slack = getSlackClient();
  const state = getState(userId);
  if (!state.activeModalViewId) return; // Modal already dismissed.
  try {
    await slack.views.update({ view_id: state.activeModalViewId, view });
  } catch (err) {
    // If the user dismissed the modal between open and update, Slack returns
    // not_found / view_expired — fine to swallow.
    console.warn("[synko] views.update failed (modal likely closed):", err);
  }
}

async function publishHome(userId: string): Promise<void> {
  const slack = getSlackClient();
  const state = getState(userId);
  await slack.views.publish({ user_id: userId, view: homeView(state) });
}

/* -------------------------------------------------------------------------- */
/*  Public flow entrypoints                                                   */
/* -------------------------------------------------------------------------- */

/** Called from the slash command (or the App Home "start a new session" button). */
export async function startFlow(userId: string): Promise<void> {
  resetState(userId);
  await postCard(userId, introBlocks(), "Hi. I'm Synko.");
  setState(userId, { stage: "intro" });
  // Refresh the home tab so it reflects the reset state on next open.
  await publishHome(userId).catch(() => {});
}

/** Called from app_home_opened events. */
export async function refreshHome(userId: string): Promise<void> {
  await publishHome(userId);
}

/* -------------------------------------------------------------------------- */
/*  Channel onboarding                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Open the channel picker modal. Called from a slash command or an App Home
 * button click — both supply a fresh trigger_id.
 */
export async function openChannelPicker(
  userId: string,
  triggerId: string,
): Promise<void> {
  const slack = getSlackClient();
  const candidates = await listJoinableChannels(userId);
  await slack.views.open({
    trigger_id: triggerId,
    view: channelPickerView(candidates),
  });
}

/**
 * Auto-join the channels the user picked, then DM them a summary.
 * Called from the view_submission handler.
 */
export async function joinPickedChannels(
  userId: string,
  channelIds: string[],
): Promise<void> {
  const slack = getSlackClient();

  if (channelIds.length === 0) {
    await postPlain(
      userId,
      "No channels picked. I'll stay in your DMs for now.",
    );
    return;
  }

  const joined: string[] = [];
  const failed: { id: string; reason: string }[] = [];

  for (const id of channelIds) {
    try {
      const res = await slack.conversations.join({ channel: id });
      const name = res.channel?.name ?? id;
      joined.push(name);
    } catch (err) {
      const reason =
        err instanceof Error ? err.message : "unknown error";
      failed.push({ id, reason });
    }
  }

  const lines: string[] = [];
  if (joined.length > 0) {
    lines.push(
      `Joined ${joined.map((n) => `#${n}`).join(", ")}. Your teammates can see I'm there.`,
    );
  }
  if (failed.length > 0) {
    lines.push(
      `Couldn't join ${failed.length} channel${failed.length === 1 ? "" : "s"} (probably private — try \`/invite @Synko\` in each).`,
    );
  }
  lines.push(
    "For private channels, type `/invite @Synko` in each. I can't auto-join those.",
  );

  await postPlain(userId, lines.join("\n\n"));
}

/** Post a plain text message to the user's DM (no card). */
async function postPlain(userId: string, text: string): Promise<void> {
  const slack = getSlackClient();
  const channel = await ensureDm(userId);
  await slack.chat.postMessage({ channel, text });
}

/**
 * Handle a button / checkbox / etc. interaction.
 *
 * `triggerId` is required for any action that opens a modal — Slack only
 * accepts trigger ids within ~3 seconds of issuing them, so we have to act
 * promptly. For non-modal actions, `triggerId` is ignored.
 */
export async function handleAction(
  userId: string,
  actionId: string,
  selectedValues?: string[],
  triggerId?: string,
): Promise<void> {
  const state = getState(userId);

  switch (actionId) {
    case ACTIONS.introAdvance: {
      setState(userId, { stage: "analysis" });
      await updateActiveCard(userId, analysisBlocks(), "Reading your last 30 days...");
      return;
    }

    case ACTIONS.analysisAdvance: {
      setState(userId, { stage: "intentions" });
      await updateActiveCard(
        userId,
        intentionsBlocks([]),
        "Pick what you want to work on.",
      );
      return;
    }

    case ACTIONS.intentionsToggle: {
      const incoming = selectedValues ?? [];
      const previous = state.intentions;
      const stillSelected = previous.filter((id) => incoming.includes(id));
      const newlyAdded = incoming.filter((id) => !previous.includes(id));
      const next = [...stillSelected, ...newlyAdded];
      setState(userId, { intentions: next });
      await updateActiveCard(
        userId,
        intentionsBlocks(next),
        "Pick what you want to work on.",
      );
      return;
    }

    case ACTIONS.intentionsSubmit: {
      if (state.intentions.length === 0) return;
      const species = pickSpeciesFromIntentions(state.intentions);
      setState(userId, { stage: "hatching", speciesId: species.id });

      // Three things in parallel-ish:
      //   1. Open the hatch modal (needs triggerId, must happen first)
      //   2. Update the DM card to "egg"
      //   3. Wait 2s, then update both modal and DM card to the reveal
      if (triggerId) {
        try {
          await openModal(userId, triggerId, hatchingModalEggView());
        } catch (err) {
          // If the modal can't open (trigger expired etc.), fall back to
          // the DM-only experience. Don't block.
          console.warn("[synko] openModal failed, falling back to DM only:", err);
        }
      }
      await updateActiveCard(userId, hatchingPreBlocks(), "Something's hatching…");

      await sleep(2000);

      await updateModal(userId, hatchingModalRevealView(species));
      await updateActiveCard(
        userId,
        hatchingRevealBlocks(species),
        `${species.name} hatched`,
      );

      // Refresh App Home now that the user has a pet.
      await publishHome(userId).catch(() => {});
      return;
    }

    case ACTIONS.hatchingAdvance: {
      const pet = state.speciesId ? PETS_BY_ID[state.speciesId] : null;
      if (!pet) return;
      setState(userId, { stage: "coaching1", activeModalViewId: null });
      await postCard(
        userId,
        coachingBlocks(COACHING_MOMENTS[0], pet, ACTIONS.coaching1Send),
        "Drafting a message to Mary…",
      );
      return;
    }

    case ACTIONS.coaching1Send: {
      const pet = state.speciesId ? PETS_BY_ID[state.speciesId] : null;
      if (!pet) return;
      setState(userId, { stage: "coaching2" });
      await postCard(
        userId,
        coachingBlocks(COACHING_MOMENTS[1], pet, ACTIONS.coaching2Send),
        "Posting in #marketing-launch…",
      );
      return;
    }

    case ACTIONS.coaching2Send: {
      const pet = state.speciesId ? PETS_BY_ID[state.speciesId] : null;
      if (!pet) return;
      setState(userId, { stage: "reflection" });
      await postCard(userId, reflectionBlocks(pet), "End of day.");
      // Reflection is when App Home gets its richest content — refresh.
      await publishHome(userId).catch(() => {});
      return;
    }

    case ACTIONS.reflectionDone: {
      const pet = state.speciesId ? PETS_BY_ID[state.speciesId] : null;
      if (!pet) return;
      setState(userId, { stage: "end" });
      await postCard(userId, endBlocks(pet), "That's the day.");
      return;
    }

    case ACTIONS.endReset:
    case ACTIONS.homeStartSession: {
      await startFlow(userId);
      return;
    }

    case ACTIONS.homeOpenChannelPicker: {
      if (!triggerId) return;
      try {
        await openChannelPicker(userId, triggerId);
      } catch (err) {
        console.error("[synko] openChannelPicker failed:", err);
      }
      return;
    }

    default:
      return;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

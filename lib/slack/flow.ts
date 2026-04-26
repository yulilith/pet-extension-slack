/**
 * Flow orchestrator: given a user id and an action, advance their state
 * and post / update the appropriate Slack message.
 *
 * Each stage owns one Slack message ("the active card"). We update it in
 * place via `chat.update` whenever possible so the user sees a single
 * evolving conversation rather than a wall of new messages. The hatching
 * stage is special — we send the egg message, wait, then post the reveal
 * as a new message (so the egg moment lands).
 */

import type { ChatPostMessageResponse } from "@slack/web-api";
import { COACHING_MOMENTS } from "@/content/coachingMoments";
import { pickSpeciesFromIntentions } from "@/lib/match";
import { getSlackClient } from "@/lib/slack/client";
import {
  ACTIONS,
  PETS_BY_ID,
  analysisBlocks,
  coachingBlocks,
  endBlocks,
  hatchingPreBlocks,
  hatchingRevealBlocks,
  intentionsBlocks,
  introBlocks,
  reflectionBlocks,
} from "@/lib/slack/blocks";
import { getState, resetState, setState } from "@/lib/slack/state";

/** Open a DM with the user (or get the existing one) and return its channel id. */
async function ensureDm(userId: string): Promise<string> {
  const slack = getSlackClient();
  const state = getState(userId);
  if (state.dmChannelId) return state.dmChannelId;

  const opened = await slack.conversations.open({ users: userId });
  const channelId = opened.channel?.id;
  if (!channelId) {
    throw new Error(`Failed to open DM with user ${userId}`);
  }
  setState(userId, { dmChannelId: channelId });
  return channelId;
}

/**
 * Post a fresh card message in the user's DM and remember its ts so we can
 * update it on subsequent stage transitions.
 */
async function postCard(
  userId: string,
  blocks: ReturnType<typeof introBlocks>,
  fallbackText: string,
): Promise<ChatPostMessageResponse> {
  const slack = getSlackClient();
  const channel = await ensureDm(userId);
  const res = await slack.chat.postMessage({
    channel,
    blocks,
    text: fallbackText, // accessibility / notification fallback
  });
  setState(userId, { activeMessageTs: res.ts ?? null });
  return res;
}

/**
 * Update the existing active card in place. Used when transitioning between
 * stages that should feel like one continuous message.
 */
async function updateActiveCard(
  userId: string,
  blocks: ReturnType<typeof introBlocks>,
  fallbackText: string,
): Promise<void> {
  const slack = getSlackClient();
  const state = getState(userId);
  if (!state.dmChannelId || !state.activeMessageTs) {
    // No active card; post a fresh one.
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

/* -------------------------------------------------------------------------- */
/*  Public flow entrypoints                                                   */
/* -------------------------------------------------------------------------- */

/** Called from the slash command. Sets stage=intro and posts the intro card. */
export async function startFlow(userId: string): Promise<void> {
  resetState(userId);
  await postCard(userId, introBlocks(), "Hi. I'm Pando.");
  setState(userId, { stage: "intro" });
}

/** Called from the interactions handler when the user clicks an advance button. */
export async function handleAction(
  userId: string,
  actionId: string,
  /** Selected option values from a checkboxes element, when applicable. */
  selectedValues?: string[],
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
      // Slack reports the *current* set of selected checkboxes, not the
      // order. Preserve order on our side: keep existing order for items
      // still selected, append newly-added items.
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

      // First update the active card to "something's hatching"
      await updateActiveCard(userId, hatchingPreBlocks(), "Something's hatching…");
      // Brief pause so the egg moment lands
      await sleep(2000);
      // Then update again to reveal the pet
      await updateActiveCard(userId, hatchingRevealBlocks(species), `${species.name} hatched`);
      return;
    }

    case ACTIONS.hatchingAdvance: {
      const pet = state.speciesId ? PETS_BY_ID[state.speciesId] : null;
      if (!pet) return;
      setState(userId, { stage: "coaching1" });
      // Coaching scenes are heavy / scene-resetting, so post a fresh card
      // rather than updating the hatch reveal — preserves the hatch moment.
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
      return;
    }

    case ACTIONS.reflectionDone: {
      const pet = state.speciesId ? PETS_BY_ID[state.speciesId] : null;
      if (!pet) return;
      setState(userId, { stage: "end" });
      await postCard(userId, endBlocks(pet), "That's the day.");
      return;
    }

    case ACTIONS.endReset: {
      await startFlow(userId);
      return;
    }

    default:
      // Unknown action — ignore silently. Slack retries on errors so we
      // don't want to surface this back.
      return;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

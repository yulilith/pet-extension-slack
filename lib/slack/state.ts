import type { Stage, SpeciesId } from "@/types";

/**
 * In-memory per-user flow state for the demo bot.
 *
 * Keyed by Slack user id. Lost on server restart, which is fine for the
 * prototype. When we deploy to Vercel and want state to survive cold
 * starts / multiple instances, replace this with Vercel KV (or any KV
 * provider) keeping the same shape.
 *
 * NOTE: this is *not* the same FlowState as the web demo, which has stages
 * for the visual hatch animation etc. This is a sibling state machine
 * tailored to Slack message exchanges.
 */
export type SlackFlowState = {
  stage: Stage;
  /** Intentions selected so far, in selection order. */
  intentions: string[];
  /** Set after the user submits intentions. */
  speciesId: SpeciesId | null;
  /** Slack channel id of the user's DM with the bot. Set after first message. */
  dmChannelId: string | null;
  /** Slack message ts of the active stage card, so we can update it in place. */
  activeMessageTs: string | null;
  /** Slack view id of the open hatch modal, so we can update it after the pause. */
  activeModalViewId: string | null;
};

const states = new Map<string, SlackFlowState>();

export function getState(userId: string): SlackFlowState {
  let s = states.get(userId);
  if (!s) {
    s = {
      stage: "intro",
      intentions: [],
      speciesId: null,
      dmChannelId: null,
      activeMessageTs: null,
      activeModalViewId: null,
    };
    states.set(userId, s);
  }
  return s;
}

export function setState(userId: string, patch: Partial<SlackFlowState>): SlackFlowState {
  const current = getState(userId);
  const next = { ...current, ...patch };
  states.set(userId, next);
  return next;
}

export function resetState(userId: string): SlackFlowState {
  const fresh: SlackFlowState = {
    stage: "intro",
    intentions: [],
    speciesId: null,
    dmChannelId: null,
    activeMessageTs: null,
    activeModalViewId: null,
  };
  states.set(userId, fresh);
  return fresh;
}

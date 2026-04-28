/**
 * OBSERVATIONS — what Synko "found" in the user's Slack.
 *
 * In the prototype these are hardcoded. In production an LLM surfaces real
 * patterns. Keep each line short and concrete.
 */

import type { Observation } from "@/types";

export const OBSERVATIONS: Observation[] = [
  {
    kind: "neutral",
    text: "1,247 messages in the last 30 days.",
  },
  {
    kind: "positive",
    text: "You wrote '~80%' 8 times. That's honest.",
  },
  {
    kind: "noticing",
    text: "47 'just's last week. That's a tic.",
  },
  {
    kind: "noticing",
    text: "12 messages started with 'sorry to bother.' You don't need that.",
  },
];

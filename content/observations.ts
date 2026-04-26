/**
 * OBSERVATIONS, fake findings shown during the "Pando read your Slack" scene.
 * ============================================================================
 *
 * In the prototype these are hardcoded. In the real product, an AI would
 * surface real patterns from the user's actual messages.
 *
 * Voice rules:
 *   - No em-dashes.
 *   - First item is the stat line that sets scale (makes it feel like a
 *     real scan).
 *   - One affirming line. Don't over-flatter.
 *   - One or two things worth noticing. Specific phrases beat vague claims.
 *     "47 instances of 'just'" beats "you tend to soften your language."
 *   - Stop when the point is made.
 *
 * Order matters; first item renders first.
 */

import type { Observation } from "@/types";

export const OBSERVATIONS: Observation[] = [
  {
    kind: "neutral",
    text: "1,247 messages across 8 channels in the last 30 days.",
  },
  {
    kind: "positive",
    text: "You wrote '~80%' or 'roughly there' 8 times. Most people round that up.",
  },
  {
    kind: "noticing",
    text: "47 'just's last week. Maybe a hedge, maybe a tic.",
  },
  {
    kind: "noticing",
    text: "12 messages started with 'sorry to bother' or 'no rush, but.' The 'no rush' ones still got answered first.",
  },
];

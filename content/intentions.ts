/**
 * INTENTIONS, what the user can choose to work on.
 * ====================================================
 *
 * After the simulated "Synko read your last 30 days" analysis, the user
 * picks one or more intentions. The first one they pick is treated as
 * their primary, and determines which pet hatches.
 *
 * Each intention maps 1:1 to a species. To change which pet appears for
 * which intention, edit `speciesId` below.
 *
 * Voice rules for these labels:
 *   - First-person, present-tense aspirational ("Saying", "Asking").
 *   - Concrete enough to imagine doing tomorrow.
 *   - No em-dashes. No corporate-speak.
 *   - Description spells out what it looks like in practice.
 */

import type { Intention } from "@/types";

export const INTENTIONS: Intention[] = [
  {
    id: "saying-less",
    label: "Saying less, more clearly",
    description:
      "Tighter messages. Constraint first, context after.",
    speciesId: "lumio",
  },
  {
    id: "speaking-up",
    label: "Speaking up before grinding solo",
    description:
      "Asking sooner instead of grinding it out alone.",
    speciesId: "mossle",
  },
  {
    id: "saying-what-i-mean",
    label: "Saying what I actually mean",
    description:
      "Less hedging, less softening. More of the real thing, kindly.",
    speciesId: "wisp",
  },
  {
    id: "asking-without-apologizing",
    label: "Asking for help without apologizing",
    description:
      "No more 'sorry to bother' before a normal question.",
    speciesId: "sprout",
  },
  {
    id: "firm-and-kind",
    label: "Saying the firm thing kindly",
    description:
      "Direct and warm at the same time, without softening to vagueness.",
    speciesId: "ember",
  },
];

export const INTENTIONS_BY_ID: Record<string, Intention> = Object.fromEntries(
  INTENTIONS.map((i) => [i.id, i]),
);

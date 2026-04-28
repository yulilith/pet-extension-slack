/**
 * END-OF-DAY REFLECTIONS — one short affirmation + one short invitation
 * per species. Kept tight so the reflection scene can show them as small
 * captions next to the day's "treats earned."
 */

import type { Reflection, SpeciesId } from "@/types";

export const REFLECTIONS: Record<SpeciesId, Reflection> = {
  lumio: {
    affirmation: "You put the timeline up top in your reply to Mary.",
    invitation: "Try it without 'could probably' tomorrow.",
  },
  mossle: {
    affirmation: "You said what wasn't done. No pretending.",
    invitation: "Tag one person on the legal sign-off tomorrow.",
  },
  wisp: {
    affirmation: "You wrote '~80%' instead of 'almost done.'",
    invitation: "In the Mary draft you almost said the firm thing. Trust that next time.",
  },
  sprout: {
    affirmation: "You posted in #marketing-launch instead of solving it alone.",
    invitation: "Tag one person tomorrow. 'Anyone' is too open.",
  },
  ember: {
    affirmation: "Your message to Mary was direct and warm.",
    invitation: "Three 'just's. Drop them. Mary can take it.",
  },
};

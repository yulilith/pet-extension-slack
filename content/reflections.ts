/**
 * END-OF-DAY REFLECTIONS, PER SPECIES
 * ===================================
 *
 * The pet appears in the user's DMs at "end of day" with one specific thing
 * the user did well + one thing worth noticing.
 *
 * Voice rules (same as coachingMoments):
 *   - No em-dashes.
 *   - No "I noticed…" preface.
 *   - No metaphors ("let it breathe", "honesty most people round off").
 *   - No aphoristic closings.
 *   - Specific to today's two coaching moments. Avoid generic praise.
 *   - Stop when the point is made. Don't pad.
 */

import type { Reflection, SpeciesId } from "@/types";

export const REFLECTIONS: Record<SpeciesId, Reflection> = {
  lumio: {
    affirmation:
      "You put the constraint up top when you wrote Mary today. That's not your default.",
    invitation:
      "'Could probably' showed up twice. You don't need it both times.",
  },
  mossle: {
    affirmation:
      "You named what's actually unfinished in the channel update instead of pretending it's all on track.",
    invitation:
      "Two days now on those legal sign-offs and no name tagged. Try asking one specific person tomorrow.",
  },
  wisp: {
    affirmation:
      "You wrote '~80%' instead of 'almost done.' Most people round that up.",
    invitation:
      "In the Mary draft you almost said the firmer thing and then pulled back. You knew. Worth trusting that the next time.",
  },
  sprout: {
    affirmation:
      "You posted in marketing-launch instead of trying to solve it alone. That counts.",
    invitation:
      "Three blockers today, nobody tagged on any of them. Try pulling someone in earlier next time.",
  },
  ember: {
    affirmation:
      "Your message to Mary was direct and warm at the same time. You didn't make her guess where you stood.",
    invitation:
      "Three 'just's before you sent. You don't need that many. Mary can handle the ungentled version.",
  },
};

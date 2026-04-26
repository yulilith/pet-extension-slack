/**
 * Miscellaneous UI strings: intro, analysis, intentions, hatch flavor, end.
 * Kept here so the designer can tune copy without touching component code.
 */

export const COPY = {
  intro: {
    petName: "Pando",
    /** First message the user sees in the Pando DM. */
    greeting:
      "Hi. I'm Pando.\n\nGive me a minute to read what you've been up to lately. Then we'll talk about where I can help.",
    beginButton: "Let it read",
  },
  analysis: {
    /** Lead-in shown above the observations list. */
    leadIn: "Reading your last 30 days…",
    /** Sub-line that appears once observations finish revealing. */
    handoff: "A few things I noticed.",
    /** Prompt before the user advances to intentions. */
    closing: "OK. Where do you want me to actually help?",
    nextButton: "Tell it",
  },
  intentions: {
    headline: "Pick what you want to work on.",
    sub: "More than one is fine. The first one you pick is what I'll mostly be. I'll keep the others in mind.",
    submitButton: "Hatch",
  },
  hatching: {
    /** Shown while the egg is wiggling, before it cracks. */
    pre: "Something's hatching…",
    /** Shown briefly after the crack, before the pet appears. */
    cracking: "…",
  },
  coaching: {
    setupLabel: "Scene",
    composerPlaceholder: "Message…",
    sendLabel: "Send",
    petBubbleHint:
      "Pando saw you drafting this. Just for you, not in the channel.",
  },
  reflection: {
    /** Header line above the affirmation message. */
    leadIn: "End of day. A couple things.",
  },
  end: {
    headline: "That's the day.",
    body:
      "You met your pet. They saw you draft a couple of messages. They had a few thoughts, quietly.\n\nIn the real product this would keep going for weeks. The pet getting to know your patterns, the team's tree growing alongside it.",
    resetButton: "Start over",
  },
} as const;

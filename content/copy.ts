/**
 * Miscellaneous UI strings: intro, analysis, intentions, hatch flavor, end.
 * Kept here so the designer can tune copy without touching component code.
 */

export const COPY = {
  intro: {
    petName: "Synko",
    greeting:
      "Hi, I'm Synko.\n\nLet me read what you've been up to. One minute.",
    beginButton: "Read it",
  },
  analysis: {
    leadIn: "Reading your last 30 days…",
    handoff: "Here's what I saw.",
    closing: "What do you want help with?",
    nextButton: "Pick",
  },
  intentions: {
    headline: "Pick what you want to work on.",
    sub: "More than one is fine. The first one decides which pet hatches.",
    submitButton: "Hatch",
  },
  hatching: {
    pre: "Something's hatching…",
    cracking: "…",
  },
  coaching: {
    setupLabel: "Scene",
    composerPlaceholder: "Message…",
    sendLabel: "Send",
    petBubbleHint: "Just for you. Not in the channel.",
  },
  reflection: {
    leadIn: "End of day. Here's what you fed me.",
  },
  end: {
    headline: "Goodnight.",
    body:
      "You met your pet. They watched you write two messages.\n\nIn the real product, this keeps going. Pet learns your patterns. The team's tree grows.",
    resetButton: "Start over",
  },
} as const;

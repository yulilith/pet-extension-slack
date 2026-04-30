/**
 * Vague-commitment / timeline analyzer.
 *
 * Tiny port of the pattern engine from meeting-pet-v2 (Annie's repo) — keeps
 * the most-useful patterns. Used by the floating pet in /demo to surface
 * gentle nudges as the user is composing a Slack message.
 *
 * Detection is intentionally simple: case-insensitive substring match on the
 * trimmed message. First pattern wins.
 */

export type CommHit = {
  /** What we found in the user's text. */
  original: string;
  /** Short uppercase label (drives the badge color in the panel). */
  type: "VAGUE COMMITMENT" | "VAGUE TIMELINE" | "MISSING OWNER" | "AMBIGUOUS PRONOUN";
  /** A reframed message Synko offers as a starting point. */
  suggestion: string;
};

type Pattern = {
  match: string;
  type: CommHit["type"];
  suggestion: string;
};

const PATTERNS: Pattern[] = [
  // ── VAGUE COMMITMENT ────────────────────────────────────────────────────
  {
    match: "i'll handle it",
    type: "VAGUE COMMITMENT",
    suggestion:
      "I'll handle the [specific task] and post the result in #proj-pomegranate by Thursday EOD.",
  },
  {
    match: "i'll take care of it",
    type: "VAGUE COMMITMENT",
    suggestion:
      "I'll take care of the [specific task] and post a confirmation here by Thursday EOD.",
  },
  {
    match: "i'll do it",
    type: "VAGUE COMMITMENT",
    suggestion:
      "I'll do [specific thing] and post the result in #proj-pomegranate by Thursday EOD.",
  },
  {
    match: "i'll get to it",
    type: "VAGUE COMMITMENT",
    suggestion:
      "I'll start on [specific thing] today and have a draft in this thread by Thursday EOD.",
  },
  {
    match: "i can do that",
    type: "VAGUE COMMITMENT",
    suggestion:
      "I can do [specific thing] — I'll have it ready by Thursday EOD and post here.",
  },
  {
    match: "on it",
    type: "VAGUE COMMITMENT",
    suggestion:
      "On [specific task] — I'll post the result by Thursday EOD.",
  },
  {
    match: "got it",
    type: "VAGUE COMMITMENT",
    suggestion:
      "Got it — I'll [specific action] by Thursday EOD and confirm here.",
  },

  // ── VAGUE TIMELINE ──────────────────────────────────────────────────────
  {
    match: "asap",
    type: "VAGUE TIMELINE",
    suggestion:
      "I'll prioritize this and have it done by tomorrow at 10 AM — I'll post a confirmation here.",
  },
  {
    match: "as soon as possible",
    type: "VAGUE TIMELINE",
    suggestion:
      "I'll prioritize this and have it done by tomorrow at 10 AM — I'll post a confirmation here.",
  },
  {
    match: "soon",
    type: "VAGUE TIMELINE",
    suggestion:
      "I'll have it done by Thursday EOD — let me know if you need it sooner.",
  },
  {
    match: "tmr",
    type: "VAGUE TIMELINE",
    suggestion:
      "I'll have it done by tomorrow 5 PM (Thursday) and post in this thread.",
  },
  {
    match: "tomorrow",
    type: "VAGUE TIMELINE",
    suggestion:
      "I'll have it done by tomorrow 5 PM and post in this thread — flag if anything blocks it.",
  },
  {
    match: "later today",
    type: "VAGUE TIMELINE",
    suggestion:
      "I'll have it done by 5 PM today and post in this thread.",
  },
  {
    match: "in a bit",
    type: "VAGUE TIMELINE",
    suggestion:
      "I'll have this done by 3 PM today and post an update in this thread.",
  },
  {
    match: "when i get a chance",
    type: "VAGUE TIMELINE",
    suggestion:
      "I'll get to this by Wednesday noon — I'll post an update in this thread.",
  },
  {
    match: "eventually",
    type: "VAGUE TIMELINE",
    suggestion:
      "I'll commit to a date — I'll have this done by [specific date] and notify the team here.",
  },
  {
    match: "whenever",
    type: "VAGUE TIMELINE",
    suggestion:
      "Let's set a deadline — I'll have this done by [specific date]. Does that work for the team?",
  },

  // ── MISSING OWNER ───────────────────────────────────────────────────────
  {
    match: "someone should",
    type: "MISSING OWNER",
    suggestion:
      "@[name], can you take this? Reply here once you've got it so we have a clear owner.",
  },
  {
    match: "we should",
    type: "MISSING OWNER",
    suggestion:
      "I'll take this — or @[name], could you? Let's name an owner so it doesn't drift.",
  },
  {
    match: "anyone",
    type: "MISSING OWNER",
    suggestion:
      "@[specific person], could you take this? Naming a person makes it more likely to actually happen.",
  },

  // ── AMBIGUOUS PRONOUN ───────────────────────────────────────────────────
  {
    match: "ask steve",
    type: "AMBIGUOUS PRONOUN",
    suggestion:
      "@Steve — can you confirm [specific question] in this thread? That way the rest of the team has the answer too.",
  },
];

export function analyzeText(text: string): CommHit | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  for (const p of PATTERNS) {
    if (t.includes(p.match)) {
      return {
        original: text.trim(),
        type: p.type,
        suggestion: p.suggestion,
      };
    }
  }
  return null;
}

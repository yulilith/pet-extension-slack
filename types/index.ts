// Core type definitions for Pando.

/**
 * 16x16 grid of palette indices.
 * Index 0 = transparent. Indices 1+ refer to entries in the pet's `palette`.
 */
export type Sprite = number[][];

export type SpeciesId = "lumio" | "mossle" | "wisp" | "sprout" | "ember";

/**
 * The linear stages of the prototype flow.
 *
 * Iteration 2 — replaced the diagnostic questionnaire with two lighter
 * touchpoints: a simulated "Pando read your last 30 days" analysis, then
 * a multi-select intentions screen where the user picks what they want
 * help with. The pet hatches based on the user's primary (first-picked)
 * intention.
 *
 * Order is meaningful: see lib/stages.ts.
 */
export type Stage =
  | "intro"
  | "analysis"
  | "intentions"
  | "hatching"
  | "coaching1"
  | "coaching2"
  | "reflection"
  | "end";

/** Persisted flow state. Lives in React + localStorage. */
export type FlowState = {
  stage: Stage;
  /**
   * IDs of intentions the user picked, in selection order.
   * The first entry is treated as the user's primary intention and
   * determines which species hatches.
   */
  intentions: string[];
  /** Set when the user submits intentions. Null before that. */
  speciesId: SpeciesId | null;
};

/** One thing the user can choose to work on; tied to a primary species. */
export type Intention = {
  id: string;
  /** Short label shown on the option card. */
  label: string;
  /** A line below the label, expanding what this looks like in practice. */
  description: string;
  /** Primary species that hatches if this is the user's primary intention. */
  speciesId: SpeciesId;
};

/** A fake stat or pattern Pando "noticed" while reading the user's Slack. */
export type Observation = {
  text: string;
  kind: "positive" | "noticing" | "neutral";
};

/** A Slack-style message in the simulated chat. */
export type FauxMessage = {
  /** Display name (e.g. "Mary Chen", "Pando", "you"). */
  author: string;
  /** Visual avatar — letter for humans, "pet" to render the user's pet sprite. */
  avatar: { kind: "letter"; letter: string; color: string } | { kind: "pet" };
  /** Pretty time like "2:14 PM". */
  time: string;
  /** Message body. Markdown not parsed — keep it plain text. */
  body: string;
  /** If true, render in the warm/magical "Pando" treatment. */
  fromPet?: boolean;
};

/**
 * One coaching scene. The user is "drafting" a message to a teammate
 * and the pet appears with feedback. Defined per species so the pet's
 * voice differs.
 */
export type CoachingMoment = {
  /** Sidebar context: where this conversation lives. */
  channel: { kind: "dm"; name: string; avatarLetter: string; avatarColor: string }
         | { kind: "channel"; name: string };
  /** Short framing that orients the user before the scene. */
  setup: string;
  /** Earlier messages already in the conversation. */
  history: FauxMessage[];
  /** The message the user is drafting. Pre-filled in the composer. */
  draft: string;
  /** Pet feedback bubble — keyed by species. 1–3 sentences each. */
  petFeedback: Record<SpeciesId, string>;
};

/** End-of-day digest, per species. */
export type Reflection = {
  /** Specific thing the user did well today. */
  affirmation: string;
  /** One thing worth noticing — invitation, not correction. */
  invitation: string;
};

export type PetSpecies = {
  id: SpeciesId;
  name: string;
  /** One-line vibe descriptor used in dev preview / hatch flavor. */
  tagline: string;
  /**
   * Internal note for designers — what this pet quietly coaches the user on.
   * Not shown to the user verbatim.
   */
  coachingFocus: string;
  /** 1–3 sentences spoken on hatch. */
  intro: string;
  /** Hex colors. Index 0 in sprite means transparent (palette[0] is unused). */
  palette: string[];
  sprite: Sprite;
};

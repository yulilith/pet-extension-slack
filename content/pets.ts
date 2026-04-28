/**
 * THE FIVE SYNKO PETS
 * ===================
 *
 * Each pet points to a PNG inside /public/sprites. Designers can replace those
 * files directly and refresh /dev to review the art in context.
 */

import type { PetSpecies } from "@/types";

/* -------------------------------------------------------------------------- */
/*  LUMIO: yellow cat.                                                        */
/*  Coaches over-explainers toward clarity.                                   */
/* -------------------------------------------------------------------------- */
const lumio: PetSpecies = {
  id: "lumio",
  name: "Yellow Cat",
  spriteFile: "cat_yellow.png",
  tagline: "(placeholder)",
  coachingFocus:
    "Helps over-explainers tighten messages. Constraint first, context after.",
  intro:
    "Hi, I'm Yellow Cat. I'll be around. Mostly when you've written more than you needed to.",
};

/* -------------------------------------------------------------------------- */
/*  MOSSLE: brown dog.                                                        */
/*  Coaches quiet patient operators to ask sooner.                            */
/* -------------------------------------------------------------------------- */
const mossle: PetSpecies = {
  id: "mossle",
  name: "Brown Dog",
  spriteFile: "dog-brown.png",
  tagline: "(placeholder)",
  coachingFocus:
    "Helps quiet operators ask sooner instead of grinding solo for too long.",
  intro:
    "Took me a while to come out. That's how I am. We can go at your speed. Or slower.",
};

/* -------------------------------------------------------------------------- */
/*  WISP: purple cat.                                                         */
/*  Coaches strategic/hedging users toward more transparency.                 */
/* -------------------------------------------------------------------------- */
const wisp: PetSpecies = {
  id: "wisp",
  name: "Purple Cat",
  spriteFile: "cat_purple.png",
  tagline: "(placeholder)",
  coachingFocus:
    "Helps people who hedge, strategize their phrasing, or hide uncertainty.",
  intro:
    "Hi. I'm Purple Cat. I see what you don't say. I'll only mention it when it matters.",
};

/* -------------------------------------------------------------------------- */
/*  SPROUT: purple dog.                                                       */
/*  Coaches independent operators toward more help-seeking.                   */
/* -------------------------------------------------------------------------- */
const sprout: PetSpecies = {
  id: "sprout",
  name: "Purple Dog",
  spriteFile: "dog-purple.png",
  tagline: "(placeholder)",
  coachingFocus:
    "Helps people who default to solo execution to reach for teammates earlier.",
  intro:
    "Hi, I'm Purple Dog. I'm new here. I'm going to push you to ask for help more than your instinct says to.",
};

/* -------------------------------------------------------------------------- */
/*  EMBER: pink dog.                                                          */
/*  Coaches over-softeners toward warm directness.                            */
/* -------------------------------------------------------------------------- */
const ember: PetSpecies = {
  id: "ember",
  name: "Pink Dog",
  spriteFile: "dog-pink.png",
  tagline: "(placeholder)",
  coachingFocus:
    "Helps people who hedge or soften too much to say the real thing kindly.",
  intro:
    "Hey, I'm Pink Dog. I run hot. I'll tell you straight and I'll mean it kindly. That's the deal.",
};

export const PETS: PetSpecies[] = [lumio, mossle, wisp, sprout, ember];

export const PETS_BY_ID: Record<PetSpecies["id"], PetSpecies> = {
  lumio,
  mossle,
  wisp,
  sprout,
  ember,
};

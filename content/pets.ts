/**
 * THE FIVE SYNKO PET SPECIES
 * ==========================
 *
 * Each pet species points to a PNG inside /public/sprites. The user picks a
 * species during /init and gives the pet a custom name — the `name` field
 * here is just the human-readable species type (e.g. "Yellow Cat") used until
 * the user names theirs. The `id` field is an internal stable key — it is
 * never shown in the UI; do not surface it.
 */

import type { PetSpecies } from "@/types";

// Species 1 — yellow cat. Coaches over-explainers toward clarity.
const lumio: PetSpecies = {
  id: "lumio",
  name: "Yellow Cat",
  spriteFile: "cat_yellow.png",
  tagline: "(placeholder)",
  kind: "yellow cat",
  coachingFocus:
    "Helps over-explainers tighten messages. Constraint first, context after.",
  intro: "I'll be around. Mostly when you've written more than you needed to.",
  accentColor: "#ecb22e",
};

// Species 2 — brown dog. Coaches quiet patient operators to ask sooner.
const mossle: PetSpecies = {
  id: "mossle",
  name: "Brown Dog",
  spriteFile: "dog-brown.png",
  tagline: "(placeholder)",
  kind: "brown dog",
  coachingFocus:
    "Helps quiet operators ask sooner instead of grinding solo for too long.",
  intro:
    "Took me a while to come out. That's how I am. We can go at your speed. Or slower.",
  accentColor: "#a0703a",
};

// Species 3 — purple cat. Coaches hedging users toward more transparency.
const wisp: PetSpecies = {
  id: "wisp",
  name: "Purple Cat",
  spriteFile: "cat_purple.png",
  tagline: "(placeholder)",
  kind: "purple cat",
  coachingFocus:
    "Helps people who hedge, strategize their phrasing, or hide uncertainty.",
  intro: "I see what you don't say. I'll only mention it when it matters.",
  accentColor: "#a259e6",
};

// Species 4 — purple dog. Coaches independent operators toward help-seeking.
const sprout: PetSpecies = {
  id: "sprout",
  name: "Purple Dog",
  spriteFile: "dog-purple.png",
  tagline: "(placeholder)",
  kind: "purple dog",
  coachingFocus:
    "Helps people who default to solo execution to reach for teammates earlier.",
  intro:
    "I'm new here. I'm going to push you to ask for help more than your instinct says to.",
  accentColor: "#7c5fd6",
};

// Species 5 — pink dog. Coaches over-softeners toward warm directness.
const ember: PetSpecies = {
  id: "ember",
  name: "Pink Dog",
  spriteFile: "dog-pink.png",
  tagline: "(placeholder)",
  kind: "pink dog",
  coachingFocus:
    "Helps people who hedge or soften too much to say the real thing kindly.",
  intro:
    "I run hot. I'll tell you straight and I'll mean it kindly. That's the deal.",
  accentColor: "#e8559e",
};

// Species 6 — capybara. The team-energy / cozy-presence pet — coaches teams
// that run hot, frantic, or anxious to slow the cadence down without losing
// momentum. Default placeholder is an SVG; swap to capybara.png when the
// finished sprite lands in /public/sprites/.
const river: PetSpecies = {
  id: "river",
  name: "Capybara",
  spriteFile: "capybara.svg",
  tagline: "(placeholder)",
  kind: "capybara",
  coachingFocus:
    "Helps teams running anxious or frantic ease the cadence — same momentum, less heat.",
  intro:
    "I take it slow. I'll show up when the team's pace is running ahead of its breath.",
  accentColor: "#b8794a",
};

// Species 7 — orange beaver. Builder energy — coaches teams toward shared
// rhythms and visible milestones. Sprite at /public/sprites/beaver-orange.png.
const beaverOrange: PetSpecies = {
  id: "beaver-orange",
  name: "Orange Beaver",
  spriteFile: "beaver-orange.png",
  tagline: "(placeholder)",
  kind: "orange beaver",
  coachingFocus:
    "Helps teams turn loose work into visible milestones and shared rhythms.",
  intro:
    "I build. I'll point at the load-bearing pieces when things start sagging.",
  accentColor: "#e88c47",
};

// Species 8 — pink beaver. Warmer, social variant — coaches the team's
// emotional rhythm. Sprite at /public/sprites/beaver-pink.png.
const beaverPink: PetSpecies = {
  id: "beaver-pink",
  name: "Pink Beaver",
  spriteFile: "beaver-pink.png",
  tagline: "(placeholder)",
  kind: "pink beaver",
  coachingFocus:
    "Helps teams keep warmth in the build — checking in on people, not just tasks.",
  intro:
    "Soft on the outside, sturdy underneath. Lean on me when the work's getting heavy.",
  accentColor: "#e89aa7",
};

// Species 9 — baby capybara. Smaller / softer cousin to river — coaches
// new or small teams to find a calm pace early. Sprite at
// /public/sprites/baby-capybara.png.
const babyCapybara: PetSpecies = {
  id: "baby-capybara",
  name: "Baby Capybara",
  spriteFile: "baby-capybara.png",
  tagline: "(placeholder)",
  kind: "baby capybara",
  coachingFocus:
    "Helps small or new teams find a steady pace before patterns harden.",
  intro:
    "Still figuring it out — same as you. We can take this slow together.",
  accentColor: "#d4a78a",
};

export const PETS: PetSpecies[] = [
  lumio,
  mossle,
  wisp,
  sprout,
  ember,
  river,
  beaverOrange,
  beaverPink,
  babyCapybara,
];

export const PETS_BY_ID: Record<PetSpecies["id"], PetSpecies> = {
  lumio,
  mossle,
  wisp,
  sprout,
  ember,
  river,
  "beaver-orange": beaverOrange,
  "beaver-pink": beaverPink,
  "baby-capybara": babyCapybara,
};

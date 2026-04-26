/**
 * THE FIVE PANDO PETS
 * ===================
 *
 * Each pet is a 16x16 sprite plus a small palette and copy.
 *
 * SPRITE FORMAT — for designer-friendly editing:
 *   - Each sprite is 16 strings of exactly 16 characters.
 *   - "." means transparent (no pixel).
 *   - "1"-"9" and "a"-"f" map to palette[1]..palette[15] (hex digit).
 *   - palette[0] is reserved as "transparent" — leave it as "" and never use
 *     index 0 in the sprite chars.
 *
 * To tweak a pet visually: just edit the 16 strings below. <PixelPet />
 * renders directly from these — no other code changes needed.
 *
 * Column ruler:    0123456789ABCDEF
 *                  ────────────────
 */

import type { PetSpecies, Sprite } from "@/types";

// Helper: parse 16 strings of 16 chars each into a 2D number grid.
// Throws loudly at module load time if any pet sprite is malformed.
function s(rows: string[]): Sprite {
  if (rows.length !== 16) {
    throw new Error(`Sprite must have 16 rows, got ${rows.length}`);
  }
  return rows.map((row, r) => {
    if (row.length !== 16) {
      throw new Error(
        `Sprite row ${r} must be 16 chars, got ${row.length}: "${row}"`,
      );
    }
    return row.split("").map((c) => (c === "." ? 0 : parseInt(c, 16)));
  });
}

/* -------------------------------------------------------------------------- */
/*  LUMIO — soft glowing yellow blob.                                         */
/*  Coaches over-explainers toward clarity.                                   */
/* -------------------------------------------------------------------------- */
const lumio: PetSpecies = {
  id: "lumio",
  name: "Lumio",
  tagline: "round, yellow, knows when to wrap up",
  coachingFocus:
    "Helps over-explainers tighten messages. Constraint first, context after.",
  intro:
    "Hi, I'm Lumio. I'll be around. Mostly when you've written more than you needed to.",
  // 1=body, 2=outline, 3=highlight, 4=eye, 5=dot/sparkle, 6=mouth
  palette: ["", "#FFD93D", "#C99213", "#FFF1A6", "#2D2A1F", "#FFFFFF", "#FFB3BA"],
  sprite: s([
    //0123456789ABCDEF
    "................", // 0
    ".......5........", // 1  sparkle
    ".....222222.....", // 2
    "...2211111122...", // 3
    "..211133331112..", // 4  highlight
    ".21113331111112.", // 5
    "2111111111111112", // 6
    "2114411111441112", // 7  eyes
    "2114511111451112", // 8  eye sparkles
    "2114411111441112", // 9
    "2111111111111112", // 10
    ".21111666611112.", // 11 mouth
    ".21111166111112.", // 12 mouth narrows
    "..211111111112..", // 13
    ".....222222.....", // 14
    "................", // 15
  ]),
};

/* -------------------------------------------------------------------------- */
/*  MOSSLE — mossy turtle-shaped, brown shell + green moss.                   */
/*  Coaches quiet patient operators to ask sooner.                            */
/* -------------------------------------------------------------------------- */
const mossle: PetSpecies = {
  id: "mossle",
  name: "Mossle",
  tagline: "slow, mossy, doesn't rush",
  coachingFocus:
    "Helps quiet operators ask sooner instead of grinding solo for too long.",
  intro:
    "Took me a while to come out. That's how I am. We can go at your speed. Or slower.",
  // 1=brown shell, 2=outline, 3=moss, 4=moss-light, 5=eye, 6=eye-dot, 7=belly
  palette: [
    "",
    "#8B6F47",
    "#5D4A2E",
    "#7BA05B",
    "#A8C682",
    "#2D2A1F",
    "#FFFFFF",
    "#E8D5B7",
  ],
  sprite: s([
    //0123456789ABCDEF
    "................", // 0
    "......4334......", // 1  moss tufts
    "....33333333....", // 2
    "...3433433433...", // 3  moss highlights
    "..333333333333..", // 4
    ".23333333333332.", // 5  shell rim
    ".21156111156112.", // 6  eye row
    "2111111111111112", // 7
    "2111111111111112", // 8
    "2117777777777112", // 9  cream belly begins
    ".21177777777112.", // 10
    "..211777777112..", // 11
    "...2211111122...", // 12 bottom curve
    "....22222222....", // 13 base
    "................", // 14
    "................", // 15
  ]),
};

/* -------------------------------------------------------------------------- */
/*  WISP — pale blue feathery teardrop with trailing tail.                    */
/*  Coaches strategic/hedging users toward more transparency.                 */
/* -------------------------------------------------------------------------- */
const wisp: PetSpecies = {
  id: "wisp",
  name: "Wisp",
  tagline: "blue, quiet, says less than it sees",
  coachingFocus:
    "Helps people who hedge, strategize their phrasing, or hide uncertainty.",
  intro:
    "Hi. I'm Wisp. I see what you don't say. I'll only mention it when it matters.",
  // 1=pale blue, 2=outline, 3=highlight, 4=eye, 5=eye-dot
  palette: ["", "#B8D4E3", "#6B9DBD", "#F4FAFC", "#1F2A36", "#FFFFFF"],
  sprite: s([
    //0123456789ABCDEF
    ".......2........", // 0  tip
    "......212.......", // 1
    ".....21112......", // 2
    "....2113112.....", // 3
    "...211333112....", // 4
    "..21113311112...", // 5
    ".211111111112...", // 6
    ".214511114512...", // 7  eyes
    ".211111111112...", // 8
    ".211111111112...", // 9
    "..2111111112....", // 10
    "...21111112.....", // 11
    "....211112......", // 12
    "...211112.......", // 13 tail trails left
    "..211112........", // 14
    ".211112.........", // 15
  ]),
};

/* -------------------------------------------------------------------------- */
/*  SPROUT — round green creature with a leaf on top.                         */
/*  Coaches independent operators toward more help-seeking.                   */
/* -------------------------------------------------------------------------- */
const sprout: PetSpecies = {
  id: "sprout",
  name: "Sprout",
  tagline: "leafy, eager, doesn't like solo work",
  coachingFocus:
    "Helps people who default to solo execution to reach for teammates earlier.",
  intro:
    "Hi, I'm Sprout. I'm new here. I'm going to push you to ask for help more than your instinct says to.",
  // 1=body, 2=outline, 3=highlight, 4=eye, 5=eye-dot, 6=leaf, 7=stem
  palette: [
    "",
    "#66BB6A",
    "#2E7D32",
    "#A5D6A7",
    "#1F2A1F",
    "#FFFFFF",
    "#8BC34A",
    "#5D4037",
  ],
  sprite: s([
    //0123456789ABCDEF
    ".......7........", // 0  stem
    "......676.......", // 1  leaf
    ".....66766......", // 2
    "....6667666.....", // 3
    ".....66766......", // 4
    "...2211111122...", // 5  body top
    "..211331111112..", // 6  highlight
    ".21113311111112.", // 7
    "2114411111441112", // 8  eyes
    "2114511111451112", // 9  sparkles
    "2114411111441112", // 10
    "2111111111111112", // 11
    ".21111111111112.", // 12
    "..211111111112..", // 13
    "...2211111122...", // 14
    ".....222222.....", // 15
  ]),
};

/* -------------------------------------------------------------------------- */
/*  EMBER — flame-shape orange/red creature.                                  */
/*  Coaches over-softeners toward warm directness.                            */
/* -------------------------------------------------------------------------- */
const ember: PetSpecies = {
  id: "ember",
  name: "Ember",
  tagline: "small fire, says it straight",
  coachingFocus:
    "Helps people who hedge or soften too much to say the real thing kindly.",
  intro:
    "Hey, I'm Ember. I run hot. I'll tell you straight and I'll mean it kindly. That's the deal.",
  // 1=orange, 2=outline, 3=yellow tip, 4=eye, 5=eye-dot, 6=deep red
  palette: ["", "#FF7F2A", "#B23B00", "#FFD93D", "#2D1A00", "#FFFFFF", "#C41E3A"],
  sprite: s([
    //0123456789ABCDEF
    ".......3........", // 0  tip
    "......333.......", // 1
    ".....23132......", // 2  flame top
    "....21111112....", // 3
    "...2111111112...", // 4
    "..211111111112..", // 5
    "..214411114412..", // 6  eyes
    "..214511114512..", // 7  eye sparkles
    ".21111111111112.", // 8
    ".21111111111112.", // 9
    "2111611111161112", // 10 deep red flickers
    "2116611111166112", // 11
    "2116661111666112", // 12
    ".21666666666612.", // 13 red base
    "..266666666662..", // 14
    "...2222222222...", // 15
  ]),
};

export const PETS: PetSpecies[] = [lumio, mossle, wisp, sprout, ember];

export const PETS_BY_ID: Record<PetSpecies["id"], PetSpecies> = {
  lumio,
  mossle,
  wisp,
  sprout,
  ember,
};

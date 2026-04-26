import { INTENTIONS_BY_ID } from "@/content/intentions";
import { PETS_BY_ID } from "@/content/pets";
import type { PetSpecies } from "@/types";

/**
 * Pick the species that hatches from the user's selected intentions.
 *
 * Each intention is tied to a primary species. The user's *first-picked*
 * intention determines the pet (we treat that as their primary). Other
 * intentions are recorded but don't affect species selection — the pet
 * "embodies" the primary intention but the user can still acknowledge
 * the others matter.
 *
 * Designer-tweakable: see content/intentions.ts to change which species
 * a given intention maps to.
 */
export function pickSpeciesFromIntentions(intentionIds: string[]): PetSpecies {
  for (const id of intentionIds) {
    const intent = INTENTIONS_BY_ID[id];
    if (intent) return PETS_BY_ID[intent.speciesId];
  }
  // Fallback — UI should prevent this (submit button disabled until ≥ 1 picked).
  return PETS_BY_ID.lumio;
}

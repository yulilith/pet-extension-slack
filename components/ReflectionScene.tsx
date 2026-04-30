"use client";

/**
 * End-of-day reflection — modeled on the /zoom report.
 *
 * The two coaching moments earlier today get translated into "treats" the
 * pet ate. Plus one empty bowl (the move the pet wanted but didn't get).
 * Plus a one-line per-species reflection. Plus tomorrow's tiny goal.
 *
 * Same vocabulary as /zoom (🎂, ⭐, 🍎, etc.) so the demo feels coherent.
 */

import { COPY } from "@/content/copy";
import { REFLECTIONS } from "@/content/reflections";
import { PixelPet } from "@/components/PixelPet";
import type { PetSpecies, SpeciesId } from "@/types";

type Props = {
  pet: PetSpecies;
  onDone: () => void;
};

/* -------------------------------------------------------------------------- */
/*  Treat catalogue (kept inline — the same eight from /zoom)                 */
/* -------------------------------------------------------------------------- */

type TreatId = "apple" | "cake" | "cookie" | "star" | "candy" | "blueberry";

const TREAT: Record<TreatId, { emoji: string; meaning: string }> = {
  apple: { emoji: "🍎", meaning: "Clarifying question" },
  cake: { emoji: "🎂", meaning: "Deadline / timeline" },
  cookie: { emoji: "🍪", meaning: "Process question" },
  star: { emoji: "⭐", meaning: "Action item named" },
  candy: { emoji: "🍬", meaning: "Cross-team alignment" },
  blueberry: { emoji: "🫐", meaning: "Follow-up scheduled" },
};

/** Today's earned treats — derived from the two coaching moments. */
const TODAYS_TREATS: { treatId: TreatId; moment: string; where: string }[] = [
  {
    treatId: "cake",
    moment: "Named the launch timeline to Mary.",
    where: "DM with Mary · 2:14pm",
  },
  {
    treatId: "star",
    moment: "Posted launch status in #marketing-launch.",
    where: "#marketing-launch · 4:02pm",
  },
  {
    treatId: "candy",
    moment: "Found agreement with Devon on the asset window.",
    where: "#marketing-launch · 4:08pm",
  },
];

/** One empty bowl, same across species — keeps the demo legible. */
const EMPTY_BOWL = {
  treatId: "apple" as TreatId,
  cue: "You didn't ask Mary what 'on track' means to her.",
};

/** Tomorrow's tiny goal — nudge per species. */
const TOMORROW_GOAL: Record<SpeciesId, { emoji: string; line: string }> = {
  lumio: { emoji: "🍎", line: "Drop 'could probably' for one day." },
  mossle: { emoji: "🍪", line: "Tag one person on a blocker." },
  wisp: { emoji: "🍎", line: "Say the firm thing once. No softener." },
  sprout: { emoji: "🍪", line: "Ask one specific person, not 'anyone.'" },
  ember: { emoji: "⭐", line: "End one message with a clear ask." },
  river: { emoji: "🫐", line: "(placeholder)" },
  "beaver-orange": { emoji: "🍪", line: "(placeholder)" },
  "beaver-pink": { emoji: "🍎", line: "(placeholder)" },
  "baby-capybara": { emoji: "🫐", line: "(placeholder)" },
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function ReflectionScene({ pet, onDone }: Props) {
  const reflection = REFLECTIONS[pet.id];
  const tomorrow = TOMORROW_GOAL[pet.id];
  const empty = TREAT[EMPTY_BOWL.treatId];

  return (
    <section className="flex flex-1 flex-col bg-white min-w-0 min-h-0">
      <header className="border-b border-stone-200 px-5 py-3 shrink-0">
        <h2 className="font-semibold text-stone-900 text-base">Synko</h2>
        <p className="text-xs text-stone-500 mt-0.5">End of day · 5:48pm</p>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-xl px-6 py-6 space-y-5">
          {/* Pet greeting */}
          <div className="rounded-xl synko-warm p-4 flex items-center gap-3">
            <PixelPet pet={pet} size={48} animated={false} />
            <p className="text-sm text-stone-800">
              <span className="font-semibold">{pet.name}:</span>{" "}
              {COPY.reflection.leadIn}
            </p>
          </div>

          {/* Treats earned */}
          <div className="rounded-lg border border-stone-200">
            <div className="px-4 py-2.5 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Treats today
              </h3>
              <span className="text-xs text-stone-500">
                {TODAYS_TREATS.length} earned
              </span>
            </div>
            <ul className="divide-y divide-stone-100">
              {TODAYS_TREATS.map((t, i) => {
                const treat = TREAT[t.treatId];
                return (
                  <li key={i} className="px-4 py-3 flex items-start gap-3">
                    <span className="text-2xl leading-none">{treat.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-stone-800">{t.moment}</div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {treat.meaning} · {t.where}
                      </div>
                    </div>
                  </li>
                );
              })}
              <li className="px-4 py-3 flex items-start gap-3 bg-rose-50/40">
                <span className="text-2xl leading-none grayscale opacity-60">
                  {empty.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-rose-800">
                    Empty bowl: {empty.meaning}
                  </div>
                  <p className="text-xs text-stone-700 mt-0.5">
                    {EMPTY_BOWL.cue}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Per-species reflection */}
          <div className="rounded-lg border border-stone-200 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
              {pet.name} noticed
            </div>
            <p className="text-sm text-stone-800">{reflection.affirmation}</p>
            <p className="text-sm text-stone-700 mt-2">{reflection.invitation}</p>
          </div>

          {/* Tomorrow */}
          <div className="rounded-lg border border-stone-200 p-4 flex items-start gap-3">
            <span className="text-2xl leading-none">{tomorrow.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Tomorrow
              </div>
              <p className="text-sm text-stone-800 mt-0.5">{tomorrow.line}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex justify-end pt-1">
            <button
              onClick={onDone}
              className="px-5 py-2.5 rounded-md bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              Goodnight
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

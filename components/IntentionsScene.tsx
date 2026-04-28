"use client";

import { useState } from "react";
import { INTENTIONS } from "@/content/intentions";
import { COPY } from "@/content/copy";

type Props = {
  /**
   * Called when the user submits. The array is in selection order;
   * the first id is treated as the user's primary intention.
   */
  onSubmit: (intentionIds: string[]) => void;
};

export function IntentionsScene({ onSubmit }: Props) {
  // Array (not Set) so we preserve selection order — first-picked is primary.
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <section className="flex-1 flex flex-col bg-white min-w-0">
      <header className="border-b border-stone-200 px-5 py-3">
        <h2 className="font-semibold text-stone-900 text-base">Synko</h2>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-10 flex flex-col items-center">
        <div className="max-w-xl w-full synko-fade-in">
          <h3 className="text-2xl font-semibold text-stone-900 mb-2">
            {COPY.intentions.headline}
          </h3>
          <p className="text-sm text-stone-500 mb-8">{COPY.intentions.sub}</p>

          <ul className="grid gap-3 mb-8">
            {INTENTIONS.map((intent) => {
              const order = selected.indexOf(intent.id);
              const isSelected = order >= 0;
              const isPrimary = order === 0 && isSelected;

              return (
                <li key={intent.id}>
                  <button
                    onClick={() => toggle(intent.id)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-colors flex gap-4 items-start ${
                      isSelected
                        ? "border-stone-900 bg-stone-50"
                        : "border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {/* Checkbox / order indicator */}
                    <span
                      className={`shrink-0 mt-0.5 w-6 h-6 rounded inline-flex items-center justify-center text-xs font-semibold ${
                        isSelected
                          ? "bg-stone-900 text-white"
                          : "border border-stone-300 text-transparent"
                      }`}
                      aria-hidden
                    >
                      {isSelected ? order + 1 : "·"}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-stone-900">
                          {intent.label}
                        </span>
                        {isPrimary && (
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                            primary
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                        {intent.description}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="text-center">
            <button
              onClick={() => onSubmit(selected)}
              disabled={selected.length === 0}
              className="px-6 py-2.5 rounded-md bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              {COPY.intentions.submitButton}
              {selected.length > 0 && (
                <span className="text-stone-400 ml-2">
                  ({selected.length})
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

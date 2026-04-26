"use client";

import { PixelPet } from "@/components/PixelPet";
import { COPY } from "@/content/copy";
import type { PetSpecies } from "@/types";

type Props = {
  pet: PetSpecies;
  onReset: () => void;
};

export function EndScene({ pet, onReset }: Props) {
  return (
    <section className="flex-1 flex flex-col bg-white min-w-0 items-center justify-center px-8 py-10">
      <div className="pando-warm rounded-3xl px-12 py-12 max-w-xl w-full text-center shadow-md pando-fade-in">
        <div className="flex justify-center mb-6">
          <PixelPet pet={pet} size={128} />
        </div>
        <h2 className="text-2xl font-semibold text-stone-900 mb-4">
          {COPY.end.headline}
        </h2>
        <p className="text-stone-700 leading-relaxed whitespace-pre-wrap mb-8">
          {COPY.end.body}
        </p>
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-md bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          {COPY.end.resetButton}
        </button>
      </div>
    </section>
  );
}

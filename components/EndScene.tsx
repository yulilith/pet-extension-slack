"use client";

import Link from "next/link";
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
      <div className="synko-warm rounded-2xl px-10 py-10 max-w-md w-full text-center shadow-md synko-fade-in">
        <div className="flex justify-center mb-5">
          <PixelPet pet={pet} size={112} />
        </div>
        <h2 className="text-2xl font-semibold text-stone-900 mb-3">
          {COPY.end.headline}
        </h2>
        <p className="text-stone-700 leading-relaxed whitespace-pre-wrap mb-6 text-sm">
          {COPY.end.body}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/tree"
            className="text-sm text-stone-600 underline hover:text-stone-900"
          >
            See the team Grove
          </Link>
          <button
            onClick={onReset}
            className="px-5 py-2.5 rounded-md bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            {COPY.end.resetButton}
          </button>
        </div>
      </div>
    </section>
  );
}

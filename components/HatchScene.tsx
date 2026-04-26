"use client";

import { useEffect, useState } from "react";
import { PixelPet } from "@/components/PixelPet";
import { COPY } from "@/content/copy";
import type { PetSpecies } from "@/types";

type Props = {
  pet: PetSpecies;
  onDone: () => void;
};

type Phase = "wiggle" | "cracking" | "revealed";

export function HatchScene({ pet, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>("wiggle");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("cracking"), 2200);
    const t2 = setTimeout(() => setPhase("revealed"), 3700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <section className="flex-1 flex flex-col bg-white min-w-0">
      <header className="border-b border-stone-200 px-5 py-3">
        <div className="flex items-baseline gap-2">
          <h2 className="font-semibold text-stone-900 text-base">Pando</h2>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
        <div className="pando-warm rounded-3xl px-12 py-14 flex flex-col items-center max-w-xl w-full shadow-md">
          {phase === "wiggle" && (
            <>
              <Egg className="pando-egg-wiggle" />
              <p className="mt-8 text-stone-700 italic">{COPY.hatching.pre}</p>
            </>
          )}
          {phase === "cracking" && (
            <>
              <Egg className="pando-egg-crack" />
              <p className="mt-8 text-stone-700 italic">{COPY.hatching.cracking}</p>
            </>
          )}
          {phase === "revealed" && (
            <div className="pando-fade-in flex flex-col items-center">
              <PixelPet pet={pet} size={224} />
              <h2 className="text-3xl font-semibold mt-6 text-stone-900">
                {pet.name}
              </h2>
              <p className="text-stone-700 italic mt-1">{pet.tagline}</p>
              <p className="mt-6 text-stone-800 max-w-md text-center leading-relaxed">
                {pet.intro}
              </p>
              <button
                onClick={onDone}
                className="mt-8 px-5 py-2.5 rounded-md bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
              >
                Say hi back
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Egg({ className = "" }: { className?: string }) {
  // Simple SVG egg — pale gradient, soft cracks for the cracking phase.
  return (
    <svg
      width="160"
      height="200"
      viewBox="0 0 160 200"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="egg-grad" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#fff7df" />
          <stop offset="60%" stopColor="#f5dfa7" />
          <stop offset="100%" stopColor="#d8b878" />
        </radialGradient>
      </defs>
      <ellipse cx="80" cy="115" rx="62" ry="80" fill="url(#egg-grad)" stroke="#a08355" strokeWidth="2" />
      {/* speckles */}
      <circle cx="55" cy="100" r="3" fill="#a08355" opacity="0.5" />
      <circle cx="100" cy="80" r="2" fill="#a08355" opacity="0.5" />
      <circle cx="95" cy="140" r="2.5" fill="#a08355" opacity="0.5" />
      <circle cx="65" cy="155" r="2" fill="#a08355" opacity="0.5" />
      {/* crack lines (visible always but subtle until the crack phase scales up) */}
      <path
        d="M 80 50 L 75 65 L 88 80 L 78 95"
        stroke="#7a5f30"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

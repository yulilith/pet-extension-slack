"use client";

import { useEffect, useState } from "react";
import { PixelPet, type PetState } from "@/components/PixelPet";
import type { CommHit } from "@/lib/analyzeText";
import type { PetSpecies } from "@/types";

type Props = {
  pet: PetSpecies | null;
  petState: PetState;
  /** Result of analyzing the user's current composer text (or null). */
  hit: CommHit | null;
  /** Loads the suggestion into the composer. */
  onUseSuggestion: (text: string) => void;
  /** User dismissed the panel — bypass detection for this message. */
  onDismiss?: () => void;
};

/**
 * The pet that lives in the bottom-right corner of the channel, above the
 * composer. Mirrors meeting-pet-v2's slack.html behavior: silently bops in
 * place, lights up when it spots a vague-commitment pattern, and reveals the
 * suggestion panel on click.
 *
 * Positioning: absolute. Mount this inside a relative-positioned container
 * (the channel section in /demo).
 */
export function ChannelFloatingPet({
  pet,
  petState,
  hit,
  onUseSuggestion,
  onDismiss,
}: Props) {
  const [open, setOpen] = useState(false);

  // Auto-close the panel if the hit clears (user finished editing the message
  // into a clearer form, or sent it).
  useEffect(() => {
    if (!hit) setOpen(false);
  }, [hit]);

  if (!pet) return null;

  const hasHit = hit !== null;
  const accent = pet.accentColor;

  return (
    <div
      className="absolute right-4 z-30 flex flex-col items-end gap-1 pointer-events-none"
      style={{ width: 280, bottom: 78 }}
    >
      {/* Suggestion panel — only shown when open + hit exists */}
      {open && hit && (
        <div
          className="relative w-full bg-white rounded-xl border shadow-xl synko-fade-in pointer-events-auto"
          style={{ borderColor: accent }}
        >
          <div className="px-4 pt-3 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span
                className="font-pixelify font-bold text-stone-700"
                style={{ fontSize: 12, letterSpacing: "0.4px" }}
              >
                ✦ SYNKO SUGGESTION
              </span>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
              style={{ background: `${accent}20`, color: accent }}
            >
              {hit.type}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-bold mb-1">
              You typed
            </div>
            <div className="text-[13px] text-stone-700 italic bg-stone-50 border border-stone-200 rounded-md px-2 py-1.5 mb-3">
              “{hit.original}”
            </div>
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-bold mb-1">
              Try this instead
            </div>
            <div
              className="text-[13px] text-stone-800 leading-relaxed rounded-md px-2 py-1.5 mb-3"
              style={{ background: `${accent}12`, borderLeft: `2px solid ${accent}` }}
            >
              {hit.suggestion}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onUseSuggestion(hit.suggestion);
                  setOpen(false);
                }}
                className="flex-1 px-3 py-1.5 rounded-md text-white text-[12px] font-semibold hover:opacity-90"
                style={{ background: accent }}
              >
                USE THIS
              </button>
              <button
                onClick={() => {
                  onDismiss?.();
                  setOpen(false);
                }}
                className="px-3 py-1.5 rounded-md border border-stone-300 text-stone-600 text-[12px] font-semibold hover:bg-stone-50"
              >
                Dismiss
              </button>
            </div>
          </div>
          {/* Tail pointing toward the pet sprite */}
          <span
            aria-hidden
            className="absolute -bottom-2 right-7 h-3 w-3 rotate-45 bg-white border-r border-b"
            style={{ borderColor: accent }}
          />
        </div>
      )}

      {/* The pet sprite — clickable, with a pulsing alert when hasHit */}
      <button
        onClick={() => hasHit && setOpen((o) => !o)}
        className="relative pointer-events-auto"
        style={{
          ["--pet-accent" as string]: accent,
          width: 56,
          height: 56,
        }}
        title={hasHit ? "Synko has something to say" : "Synko is here"}
      >
        {/* Pulsing halo when there's a pending suggestion (quiet-mode signal). */}
        {hasHit && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${accent}99 0%, ${accent}00 65%)`,
              animation: "synko-channel-pulse 1.4s ease-out infinite",
            }}
          />
        )}
        <span className="relative z-10 inline-block">
          <PixelPet pet={pet} size={56} animated state={petState} />
        </span>
        {/* Alert badge */}
        {hasHit && !open && (
          <span
            className="absolute -top-1 -right-1 z-20 inline-flex items-center justify-center text-[10px] font-bold text-white rounded-full"
            style={{
              width: 18,
              height: 18,
              background: accent,
              border: "2px solid #fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            }}
            aria-label="Synko has a suggestion"
          >
            !
          </span>
        )}
      </button>
    </div>
  );
}

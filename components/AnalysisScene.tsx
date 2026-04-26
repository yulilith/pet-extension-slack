"use client";

import { useEffect, useState } from "react";
import { OBSERVATIONS } from "@/content/observations";
import { COPY } from "@/content/copy";
import type { Observation } from "@/types";

type Props = {
  onDone: () => void;
};

/** Lead-in delay before the first observation appears (ms). */
const LEAD_IN = 700;
/** Stagger between observations (ms). */
const STEP = 1100;
/** Delay between last observation and the closing prompt + button (ms). */
const CLOSING = 700;

export function AnalysisScene({ onDone }: Props) {
  const [revealed, setRevealed] = useState(0);
  const [showClosing, setShowClosing] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    OBSERVATIONS.forEach((_, i) => {
      timers.push(
        setTimeout(() => setRevealed(i + 1), LEAD_IN + i * STEP),
      );
    });
    timers.push(
      setTimeout(
        () => setShowClosing(true),
        LEAD_IN + OBSERVATIONS.length * STEP + CLOSING,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="flex-1 flex flex-col bg-white min-w-0">
      <header className="border-b border-stone-200 px-5 py-3">
        <div className="flex items-baseline gap-2">
          <h2 className="font-semibold text-stone-900 text-base">Pando</h2>
          <span className="text-xs text-stone-500">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 align-middle animate-pulse" />
            reading…
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-10 flex flex-col items-center">
        <div className="max-w-xl w-full">
          <p className="text-stone-500 italic mb-6">{COPY.analysis.leadIn}</p>

          <ul className="space-y-3 mb-10">
            {OBSERVATIONS.map((obs, i) => (
              <li
                key={i}
                className={`flex items-start gap-3 ${
                  i < revealed ? "pando-fade-in" : "invisible"
                }`}
              >
                <span
                  className="shrink-0 w-6 h-6 inline-flex items-center justify-center rounded-full text-xs"
                  style={{
                    background: bgFor(obs.kind),
                    color: fgFor(obs.kind),
                  }}
                  aria-hidden
                >
                  {iconFor(obs.kind)}
                </span>
                <span className="text-stone-800 leading-relaxed">{obs.text}</span>
              </li>
            ))}
          </ul>

          {showClosing && (
            <div className="pando-fade-in border-t border-stone-200 pt-6 text-center">
              <p className="text-stone-700 mb-4">{COPY.analysis.closing}</p>
              <button
                onClick={onDone}
                className="px-5 py-2.5 rounded-md bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
              >
                {COPY.analysis.nextButton}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function iconFor(kind: Observation["kind"]): string {
  switch (kind) {
    case "positive":
      return "✦";
    case "noticing":
      return "·";
    case "neutral":
      return "•";
  }
}

function bgFor(kind: Observation["kind"]): string {
  switch (kind) {
    case "positive":
      return "#FFF1A6";
    case "noticing":
      return "#E5E5E4";
    case "neutral":
      return "#F4F4F3";
  }
}

function fgFor(kind: Observation["kind"]): string {
  switch (kind) {
    case "positive":
      return "#8B6F00";
    case "noticing":
      return "#5b5b5a";
    case "neutral":
      return "#888";
  }
}

"use client";

import { useEffect, useState } from "react";
import { PixelPet } from "@/components/PixelPet";
import { PETS_BY_ID } from "@/content/pets";
import { COMPANY, PROJECT } from "@/content/storyContext";

/**
 * Synko Communication Wrapped — extracted to a reusable component so it works
 * inline inside the /demo modal without the iframe-in-iframe weirdness.
 *
 * Auto-advances every ~6s. Tap to advance, Space to pause, Esc to restart.
 */

type Card =
  | { kind: "intro"; eyebrow: string; title: string; subtitle: string; bg: string; fg: string }
  | { kind: "stat"; eyebrow: string; bigNumber: string; bigUnit: string; caption: string; bg: string; fg: string }
  | { kind: "topMove"; eyebrow: string; move: string; count: number; bg: string; fg: string }
  | { kind: "improved"; eyebrow: string; area: string; from: string; to: string; bg: string; fg: string }
  | { kind: "petGrowth"; eyebrow: string; line1: string; line2: string; bg: string; fg: string }
  | { kind: "moment"; eyebrow: string; quote: string; attribution: string; bg: string; fg: string }
  | { kind: "intentions"; eyebrow: string; title: string; intentions: string[]; bg: string; fg: string }
  | { kind: "outro"; title: string; subtitle: string; bg: string; fg: string };

const PET = PETS_BY_ID.mossle;

const CARDS: Card[] = [
  {
    kind: "intro",
    eyebrow: `SYNKO · ${COMPANY.name.toUpperCase()} · 2026`,
    title: "Your team's communication, wrapped.",
    subtitle: `${PROJECT.publicName} · ${PROJECT.codename} · 12 weeks`,
    bg: "linear-gradient(135deg, #2b1840 0%, #4a154b 60%, #c060ff 100%)",
    fg: "#ffffff",
  },
  {
    kind: "stat",
    eyebrow: "You showed up",
    bigNumber: "472",
    bigUnit: "messages",
    caption: "across 3 channels and 12 meetings",
    bg: "#fff8e8",
    fg: "#2a1840",
  },
  {
    kind: "topMove",
    eyebrow: "Your team's signature move",
    move: "Clarifying questions",
    count: 38,
    bg: "linear-gradient(160deg, #ffd166 0%, #ff8040 100%)",
    fg: "#2a1840",
  },
  {
    kind: "improved",
    eyebrow: "Most-improved area",
    area: "Closing loops on action items",
    from: "Week 1 · 41% closed within 2 days",
    to: "Week 12 · 89% closed within 2 days",
    bg: "linear-gradient(135deg, #2bac76 0%, #1264a3 100%)",
    fg: "#ffffff",
  },
  {
    kind: "petGrowth",
    eyebrow: "How Synko worked",
    line1: "Week 1 · I stepped in 14 times.",
    line2: "Week 12 · I stepped in 2 times.",
    bg: "linear-gradient(135deg, #fbeacd 0%, #f3d9a5 60%, #d8b878 100%)",
    fg: "#2a1840",
  },
  {
    kind: "moment",
    eyebrow: "A moment your team caught early",
    quote:
      "“I'll send the legal-marked copy back to legal by Wed EOD and post the cleared draft in #proj-pomegranate by Thu noon.”",
    attribution: "Steve, after Synko nudged a clearer commitment · week 4",
    bg: "#ffffff",
    fg: "#1d1c1d",
  },
  {
    kind: "intentions",
    eyebrow: "What you said you wanted to work on",
    title: "And here's what you grew into.",
    intentions: [
      "Speaking up before grinding solo",
      "Asking for help without apologizing",
      "Saying the firm thing kindly",
    ],
    bg: "linear-gradient(135deg, #1d1c1d 0%, #4a154b 100%)",
    fg: "#ffffff",
  },
  {
    kind: "outro",
    title: "See you on the next one.",
    subtitle: `Synko · ${PROJECT.codename} · 2026`,
    bg: "linear-gradient(135deg, #2bac76 0%, #2a1840 100%)",
    fg: "#ffffff",
  },
];

const CARD_DURATION_MS = 6000;

export function WrappedDemo() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => {
      setIdx((i) => (i + 1) % CARDS.length);
    }, CARD_DURATION_MS);
    return () => clearTimeout(t);
  }, [idx, paused]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key === "ArrowRight") {
        setIdx((i) => (i + 1) % CARDS.length);
      } else if (e.key === "ArrowLeft") {
        setIdx((i) => (i - 1 + CARDS.length) % CARDS.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const card = CARDS[idx];

  return (
    <div
      className="w-full h-full flex items-center justify-center p-6 cursor-pointer select-none"
      style={{ background: "#0a0818" }}
      onClick={() => setIdx((i) => (i + 1) % CARDS.length)}
    >
      <div
        className="w-full max-w-md aspect-[9/16] rounded-3xl overflow-hidden relative shadow-2xl flex flex-col"
        style={{ background: card.bg, color: card.fg }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress segments */}
        <div className="absolute top-0 left-0 right-0 z-20 px-3 pt-3 flex gap-1">
          {CARDS.map((_, i) => (
            <div
              key={i}
              className="h-0.5 flex-1 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.25)" }}
            >
              <div
                className="h-full transition-all"
                style={{
                  background: card.fg,
                  width: i < idx ? "100%" : i === idx ? (paused ? "0%" : "100%") : "0%",
                  transitionDuration: i === idx && !paused ? `${CARD_DURATION_MS}ms` : "0ms",
                  transitionTimingFunction: "linear",
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col px-7 pt-12 pb-8 relative">
          <CardContent card={card} />
        </div>

        <div
          className="px-7 py-3 flex items-center justify-between text-xs opacity-70"
          style={{ borderTop: `1px solid ${card.fg}22` }}
        >
          <div className="flex items-center gap-2">
            <div style={{ width: 18, height: 18 }}>
              <PixelPet pet={PET} size={18} animated={false} />
            </div>
            <span className="font-bold tracking-wide">SYNKO</span>
          </div>
          <span>
            {idx + 1}/{CARDS.length}
          </span>
        </div>

        <button
          className="absolute top-2 right-3 text-xs opacity-60 hover:opacity-100 z-30"
          style={{ color: card.fg }}
          onClick={(e) => {
            e.stopPropagation();
            setPaused((p) => !p);
          }}
          title={paused ? "Resume" : "Pause"}
        >
          {paused ? "▶" : "❚❚"}
        </button>
      </div>
    </div>
  );
}

function CardContent({ card }: { card: Card }) {
  switch (card.kind) {
    case "intro":
      return (
        <div className="flex-1 flex flex-col justify-between">
          <div className="text-xs uppercase tracking-[0.2em] opacity-80">{card.eyebrow}</div>
          <div>
            <h1 className="text-4xl font-black leading-tight">{card.title}</h1>
            <p className="mt-3 text-sm opacity-80">{card.subtitle}</p>
          </div>
          <div className="self-start" style={{ width: 80, height: 80 }}>
            <PixelPet pet={PET} size={80} />
          </div>
        </div>
      );
    case "stat":
      return (
        <div className="flex-1 flex flex-col justify-between">
          <div className="text-xs uppercase tracking-[0.2em] font-bold opacity-70">{card.eyebrow}</div>
          <div>
            <div className="text-8xl font-black leading-none tabular-nums">{card.bigNumber}</div>
            <div className="text-2xl font-bold mt-2">{card.bigUnit}</div>
            <p className="mt-3 text-sm opacity-70">{card.caption}</p>
          </div>
          <div />
        </div>
      );
    case "topMove":
      return (
        <div className="flex-1 flex flex-col justify-between">
          <div className="text-xs uppercase tracking-[0.2em] font-bold opacity-80">{card.eyebrow}</div>
          <div>
            <h2 className="text-5xl font-black leading-tight">{card.move}</h2>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black tabular-nums">{card.count}</span>
              <span className="text-sm font-medium opacity-80">moments this project</span>
            </div>
          </div>
          <div className="text-sm opacity-70 italic">
            You asked “what would help me?” more than any other team move.
          </div>
        </div>
      );
    case "improved":
      return (
        <div className="flex-1 flex flex-col justify-between">
          <div className="text-xs uppercase tracking-[0.2em] font-bold opacity-80">{card.eyebrow}</div>
          <div>
            <h2 className="text-3xl font-black leading-tight">{card.area}</h2>
            <div className="mt-6 space-y-2 text-sm">
              <div className="opacity-70">{card.from}</div>
              <div className="text-2xl font-bold">↓</div>
              <div className="font-bold">{card.to}</div>
            </div>
          </div>
          <div className="text-xs opacity-70 italic">+48 percentage points across the project.</div>
        </div>
      );
    case "petGrowth":
      return (
        <div className="flex-1 flex flex-col justify-between">
          <div className="text-xs uppercase tracking-[0.2em] font-bold opacity-70">{card.eyebrow}</div>
          <div>
            <p className="text-2xl font-bold leading-tight">{card.line1}</p>
            <p className="text-2xl font-bold leading-tight mt-2">{card.line2}</p>
            <p className="mt-5 text-sm opacity-80">
              The pet's job is to get quieter. You all are doing this on your own now.
            </p>
          </div>
          <div className="self-end" style={{ width: 96, height: 96 }}>
            <PixelPet pet={PET} size={96} />
          </div>
        </div>
      );
    case "moment":
      return (
        <div className="flex-1 flex flex-col justify-between">
          <div className="text-xs uppercase tracking-[0.2em] font-bold opacity-60">{card.eyebrow}</div>
          <div>
            <blockquote className="text-xl font-medium leading-snug">{card.quote}</blockquote>
            <p className="mt-4 text-xs opacity-60">{card.attribution}</p>
          </div>
          <div />
        </div>
      );
    case "intentions":
      return (
        <div className="flex-1 flex flex-col justify-between">
          <div className="text-xs uppercase tracking-[0.2em] font-bold opacity-70">{card.eyebrow}</div>
          <div>
            <h2 className="text-3xl font-black leading-tight">{card.title}</h2>
            <ul className="mt-5 space-y-2.5 text-base font-medium">
              {card.intentions.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="opacity-50">·</span>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
          <div />
        </div>
      );
    case "outro":
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div style={{ width: 140, height: 140 }}>
            <PixelPet pet={PET} size={140} />
          </div>
          <h1 className="text-3xl font-black mt-6 leading-tight">{card.title}</h1>
          <p className="mt-3 text-sm opacity-80">{card.subtitle}</p>
        </div>
      );
  }
}

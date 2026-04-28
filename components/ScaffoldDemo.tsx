"use client";

/**
 * ScaffoldDemo — the headline learning-design moment.
 *
 * Steve (the vague-commitment teammate from the Pomegranate channel) keeps
 * writing similar shapes of messages across the project. Synko's coaching
 * shrinks as the team's habit grows. Reusable in /scaffold (standalone) and
 * inside the /demo modal.
 */

import { useState } from "react";
import { PixelPet } from "@/components/PixelPet";
import { PETS_BY_ID } from "@/content/pets";
import { TEAMMATES } from "@/content/storyContext";

type Week = 1 | 4 | 8;

const WEEKS: { week: Week; label: string; subtitle: string }[] = [
  { week: 1, label: "Week 1", subtitle: "High support" },
  { week: 4, label: "Week 4", subtitle: "Medium support" },
  { week: 8, label: "Week 8", subtitle: "Low support" },
];

type ScaffoldContent = {
  prompt: { author: string; color: string; time: string; body: string };
  draft: string;
  petResponse:
    | { kind: "full-coach"; headline: string; reframed: string; reasoning: string }
    | { kind: "socratic"; question: string }
    | { kind: "glyph" };
};

const STEVE = TEAMMATES.steve;
const LESLEY = TEAMMATES.lesley;

const SCAFFOLDS: Record<Week, ScaffoldContent> = {
  1: {
    prompt: {
      author: LESLEY.name,
      color: LESLEY.avatarColor,
      time: "10:42 AM",
      body: "@Steve — where are we on the launch copy review with legal? leadership review is Friday.",
    },
    draft: "I'll handle it ASAP, will keep you posted.",
    petResponse: {
      kind: "full-coach",
      headline: "Want to be more specific with Lesley?",
      reframed:
        "I'll send the legal-marked copy back to legal by Wed EOD and post the cleared draft in #proj-pomegranate by Thu noon. Will flag in this thread if anything blocks it.",
      reasoning:
        "“ASAP” means different things to different people — Lesley needs to know whether to expect this in time for Friday's leadership review. Naming the artifact, the channel, and a concrete time lets her plan around it.",
    },
  },
  4: {
    prompt: {
      author: LESLEY.name,
      color: LESLEY.avatarColor,
      time: "9:15 AM",
      body: "Steve, can you take the launch-deck pass before the brand sync tomorrow?",
    },
    draft: "yep will get it done by tmr",
    petResponse: {
      kind: "socratic",
      question: "When is “tomorrow” for you, and where will Lesley find the updated deck?",
    },
  },
  8: {
    prompt: {
      author: LESLEY.name,
      color: LESLEY.avatarColor,
      time: "2:08 PM",
      body: "@Steve any update on the press post?",
    },
    draft: "Will have the press post fixed by next Tue.",
    petResponse: { kind: "glyph" },
  },
};

const PET = PETS_BY_ID["mossle"];

export function ScaffoldDemo() {
  const [week, setWeek] = useState<Week>(1);
  const content = SCAFFOLDS[week];

  return (
    <div className="flex flex-col h-full bg-white min-h-0">
      {/* Demo intro bar */}
      <div className="border-b border-stone-200 bg-stone-50/60 shrink-0">
        <div className="px-5 pt-3 pb-1">
          <div className="text-[11px] uppercase tracking-wider text-stone-500 font-bold">
            Scaffolding fade · the same Steve, three different weeks
          </div>
          <div className="text-sm text-stone-700">
            Steve's vague-commitment habit is the same shape across the project.
            Watch how Synko's coaching gets quieter as Steve gets clearer.
          </div>
        </div>
        <div className="px-5 pb-3 flex gap-2">
          {WEEKS.map((w) => (
            <button
              key={w.week}
              onClick={() => setWeek(w.week)}
              data-active={week === w.week}
              className="px-3 py-1.5 rounded-md text-sm border transition-colors data-[active=true]:bg-stone-900 data-[active=true]:text-white data-[active=true]:border-stone-900 data-[active=false]:bg-white data-[active=false]:text-stone-700 data-[active=false]:border-stone-300 hover:border-stone-500"
            >
              <span className="font-bold">{w.label}</span>
              <span className="ml-2 text-xs opacity-80">· {w.subtitle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Channel framing */}
      <div className="border-b border-stone-200 px-5 py-2.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-stone-500 text-base">#</span>
          <h2 className="font-bold text-stone-900 text-[15px]">proj-pomegranate</h2>
        </div>
        <p className="text-xs text-stone-500">
          Smart Threads launch · Steve is drafting his reply…
        </p>
      </div>

      {/* The prompt message Steve is replying to */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="slack-msg">
          <div className="slack-msg-time-rail">{content.prompt.time}</div>
          <div
            className="slack-msg-avatar text-white text-sm font-bold flex items-center justify-center"
            style={{ background: content.prompt.color }}
          >
            {content.prompt.author[0]}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-stone-900">{content.prompt.author}</span>
            <span className="text-xs text-stone-500">{content.prompt.time}</span>
          </div>
          <div className="text-stone-800 whitespace-pre-wrap leading-relaxed">
            {content.prompt.body}
          </div>
        </div>
      </div>

      {/* Steve's draft + Synko's coaching */}
      <ScaffoldComposer petResponse={content.petResponse} draft={content.draft} />

      {/* Footnote — pitch-deck legend */}
      <div className="px-5 pb-3 pt-1 text-[11px] text-stone-500 italic shrink-0">
        Week {week} ·{" "}
        {content.petResponse.kind === "full-coach"
          ? "Full correction · why-it-matters spelled out"
          : content.petResponse.kind === "socratic"
            ? "Single Socratic question · the user catches the gap themselves"
            : "Question-mark glyph only · pure self-noticing"}
      </div>
    </div>
  );
}

function ScaffoldComposer({
  petResponse,
  draft,
}: {
  petResponse: ScaffoldContent["petResponse"];
  draft: string;
}) {
  return (
    <div className="relative shrink-0">
      {/* HIGH SUPPORT: full coach card sits above composer */}
      {petResponse.kind === "full-coach" && (
        <div className="px-5 pt-3">
          <div className="synko-fade-in flex gap-3 items-start mb-2">
            <div
              className="rounded-md overflow-hidden p-0.5 synko-warm shrink-0 relative"
              style={{ width: 40, height: 40 }}
            >
              <PixelPet pet={PET} size={36} animated={false} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-stone-500 mb-1">
                Synko has a suggestion for Steve · this could be clearer
              </div>
              <div className="synko-warm rounded-xl px-4 py-3 text-stone-800 leading-relaxed">
                <div className="font-bold text-stone-900 mb-2">
                  {petResponse.headline}
                </div>
                <div className="text-sm mb-3">
                  <span className="text-stone-500">Try: </span>
                  <span className="font-medium">{petResponse.reframed}</span>
                </div>
                <div className="text-xs text-stone-600 border-t border-amber-200/70 pt-2">
                  <b className="text-stone-700">Why this matters · </b>
                  {petResponse.reasoning}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEDIUM SUPPORT: pet next to composer with one Socratic prompt */}
      {petResponse.kind === "socratic" && (
        <div className="px-5 pt-3">
          <div className="synko-fade-in flex gap-3 items-start mb-2">
            <div className="shrink-0" style={{ width: 36, height: 36 }}>
              <PixelPet pet={PET} size={36} animated />
            </div>
            <div className="flex-1">
              <div className="inline-block rounded-2xl rounded-tl-sm bg-stone-100 px-3 py-2 text-sm text-stone-800">
                {petResponse.question}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOW SUPPORT: tiny pet + ? glyph only */}
      {petResponse.kind === "glyph" && (
        <div className="px-5 pt-3">
          <div className="synko-fade-in flex items-center gap-2 mb-1 text-stone-500">
            <div style={{ width: 20, height: 20 }}>
              <PixelPet pet={PET} size={20} animated={false} />
            </div>
            <span className="text-base font-bold">?</span>
          </div>
        </div>
      )}

      {/* Steve's draft, locked-looking (read-only feel) */}
      <div className="px-5 pb-2">
        <div className="border border-stone-300 rounded-lg bg-white">
          <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wider text-stone-500 font-bold">
            Steve · drafting
          </div>
          <div className="px-3 pb-2 text-[15px] text-stone-700 italic">{draft}</div>
        </div>
      </div>
    </div>
  );
}

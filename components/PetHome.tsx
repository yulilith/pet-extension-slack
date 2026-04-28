"use client";

import { useState } from "react";
import { PixelPet } from "@/components/PixelPet";
import type { PetSpecies } from "@/types";

export type Treat = {
  id: string;
  emoji: string;
  name: string;
  meaning: string;
  /** Where the treat came from — Zoom meeting, Slack milestone, etc. */
  source: string;
};

type Props = {
  pet: PetSpecies | null;
  /** 0–100. Drives the pet's ambient mood expression. */
  health: number;
  treats: Treat[];
  /** Called when user feeds a treat. */
  onFeed: (treat: Treat) => void;
  /** Called when user submits a "pet the pet" anonymous compliment/feedback. */
  onPetThePet: (text: string, kind: "compliment" | "feedback") => void;
  /** Optional collapse handle. */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

/**
 * The persistent right-rail "pet's home." Shows the pet living in the channel,
 * its health/mood, treats earned, a feed button, and the anonymous "pet the
 * pet" compliment/feedback form.
 */
export function PetHome({
  pet,
  health,
  treats,
  onFeed,
  onPetThePet,
  collapsed = false,
  onToggleCollapse,
}: Props) {
  const [petText, setPetText] = useState("");
  const [petKind, setPetKind] = useState<"compliment" | "feedback">("compliment");
  const [justSubmitted, setJustSubmitted] = useState(false);

  if (collapsed) {
    return (
      <aside className="w-12 shrink-0 border-l border-stone-200 bg-stone-50 flex flex-col items-center py-3 gap-2">
        <button
          onClick={onToggleCollapse}
          className="w-9 h-9 rounded-md hover:bg-stone-200 text-stone-500 flex items-center justify-center"
          title="Open pet home"
        >
          ›
        </button>
        {pet && (
          <div className="mt-2" style={{ width: 36, height: 36 }}>
            <PixelPet pet={pet} size={36} animated />
          </div>
        )}
      </aside>
    );
  }

  function submitPetThePet() {
    const text = petText.trim();
    if (!text) return;
    onPetThePet(text, petKind);
    setPetText("");
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 2200);
  }

  const mood = healthToMood(health);

  return (
    <aside
      className="w-80 shrink-0 border-l border-stone-200 flex flex-col bg-white min-h-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200">
        <div className="text-[11px] uppercase tracking-wider text-stone-500 font-bold">
          {pet ? `${pet.name}'s home` : "Pet home"}
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-6 h-6 rounded hover:bg-stone-100 text-stone-500 flex items-center justify-center"
            title="Collapse"
          >
            ‹
          </button>
        )}
      </div>

      {/* Pet living in its garden */}
      <div className="px-4 py-5 border-b border-stone-200 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: gardenGradient(health), opacity: 0.85 }}
          aria-hidden
        />
        <div className="relative flex flex-col items-center">
          {pet ? (
            <div style={{ width: 96, height: 96 }}>
              <PixelPet pet={pet} size={96} animated />
            </div>
          ) : (
            <div className="text-stone-500 text-sm italic">
              No pet yet — type{" "}
              <code className="bg-stone-100 px-1 rounded">/init</code> to hatch one.
            </div>
          )}
          {pet && (
            <>
              <div className="mt-3 text-stone-800 font-semibold">{pet.name}</div>
              <div className="text-xs text-stone-600 italic mt-0.5 text-center px-2">
                {mood.line}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Health bar */}
      <div className="px-4 py-3 border-b border-stone-200">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-stone-500 font-bold mb-1.5">
          <span>Communication health</span>
          <span className="tabular-nums">{Math.round(health)} / 100</span>
        </div>
        <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${health}%`, background: mood.barColor }}
          />
        </div>
        <div className="text-[11px] text-stone-500 mt-1.5">{mood.bar}</div>
      </div>

      {/* Treat inventory + feed */}
      <div className="px-4 py-3 border-b border-stone-200">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] uppercase tracking-wider text-stone-500 font-bold">
            Treats earned
          </div>
          <div className="text-xs text-stone-500 tabular-nums">{treats.length}</div>
        </div>
        {treats.length === 0 ? (
          <div className="text-xs text-stone-500 italic">
            No treats yet. Earn them from meetings (
            <code className="bg-stone-100 px-1 rounded">/zoom</code>) or
            communication milestones in this channel.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {treats.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-stone-200 hover:border-stone-300"
              >
                <span className="text-xl leading-none">{t.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-stone-800">
                    {t.name}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">
                    {t.meaning} · from {t.source}
                  </div>
                </div>
                <button
                  onClick={() => onFeed(t)}
                  className="text-[11px] px-2 py-1 rounded-md bg-stone-900 text-white hover:bg-stone-700"
                  disabled={!pet}
                  title={pet ? "Feed the pet" : "Hatch a pet first"}
                >
                  Feed
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pet the pet — anonymous compliment / feedback */}
      <div className="px-4 py-3 flex-1 min-h-0 overflow-y-auto">
        <div className="text-[11px] uppercase tracking-wider text-stone-500 font-bold mb-1.5">
          Pet the pet · anonymous
        </div>
        <p className="text-[11px] text-stone-500 mb-2 leading-relaxed">
          Drop the pet a kind word about a teammate, or a quiet bit of feedback
          about how communication is going. The pet keeps it anonymous and uses
          it to read the team's mood.
        </p>
        <div className="flex gap-1 mb-2">
          {(["compliment", "feedback"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setPetKind(k)}
              data-active={petKind === k}
              className="flex-1 text-[12px] py-1 rounded-md border data-[active=true]:bg-stone-900 data-[active=true]:text-white data-[active=true]:border-stone-900 data-[active=false]:bg-white data-[active=false]:text-stone-700 data-[active=false]:border-stone-300"
            >
              {k === "compliment" ? "🌟 Compliment" : "💭 Feedback"}
            </button>
          ))}
        </div>
        <textarea
          value={petText}
          onChange={(e) => setPetText(e.target.value)}
          placeholder={
            petKind === "compliment"
              ? "e.g. Mary's eval write-up today made the trade-offs really clear."
              : "e.g. Long threads keep getting too long before someone summarizes."
          }
          rows={3}
          className="w-full px-3 py-2 text-[13px] border border-stone-300 rounded-md outline-none focus:border-stone-500 resize-none"
        />
        <button
          onClick={submitPetThePet}
          disabled={!petText.trim() || !pet}
          className="w-full mt-2 px-4 py-2 rounded-md bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed"
        >
          {justSubmitted ? "Thanks — sent anonymously ✓" : "Pet the pet"}
        </button>
      </div>
    </aside>
  );
}

/* ─────────────────────────── helpers ─────────────────────────── */

function healthToMood(h: number) {
  if (h >= 80) return { line: "Bright-eyed and curious. The team's flowing.", bar: "Thriving", barColor: "#2bac76" };
  if (h >= 60) return { line: "Settled. Keeping watch.", bar: "Doing okay", barColor: "#7ab800" };
  if (h >= 40) return { line: "A little restless. Some loops are dangling.", bar: "Mid", barColor: "#ecb22e" };
  if (h >= 20) return { line: "Low energy. Things are slipping.", bar: "Needs attention", barColor: "#ff8040" };
  return { line: "Curled up. Communication has gone quiet for too long.", bar: "Low", barColor: "#e01e5a" };
}

function gardenGradient(h: number) {
  // Warmer / brighter when healthier; cooler / dimmer when low.
  if (h >= 70) return "radial-gradient(110% 110% at 50% 30%, #fff7df 0%, #fbeacd 60%, #f3d9a5 100%)";
  if (h >= 40) return "radial-gradient(110% 110% at 50% 30%, #f6f6f0 0%, #ece9dd 70%, #d8d3bf 100%)";
  return "radial-gradient(110% 110% at 50% 30%, #eaeaf2 0%, #d8d8e2 70%, #b8b8c4 100%)";
}

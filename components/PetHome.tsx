"use client";

import { useState } from "react";
import { PixelPet, healthToState } from "@/components/PixelPet";
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

const TREAT_DRAG_MIME = "application/x-synko-treat-id";

/**
 * Right-rail pet panel. Plain UI — placeholder styling, ready to be
 * re-themed from Figma. Drag-to-feed is wired up.
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

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropHover, setDropHover] = useState(false);

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

  const petState = healthToState(health);

  function feedTreat(t: Treat) {
    if (!pet) return;
    onFeed(t);
  }

  function submitPetThePet() {
    const text = petText.trim();
    if (!text) return;
    onPetThePet(text, petKind);
    setPetText("");
    setJustSubmitted(true);
    window.setTimeout(() => setJustSubmitted(false), 2200);
  }

  const isDragging = draggingId !== null;

  return (
    <aside className="w-80 shrink-0 border-l border-stone-200 flex flex-col bg-white min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200">
        <div className="font-pixelify text-[15px] font-bold text-stone-800">
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

      {/* Pet area — also the drop zone */}
      <div
        onDragOver={(e) => {
          if (!pet) return;
          if (Array.from(e.dataTransfer.types).includes(TREAT_DRAG_MIME)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            if (!dropHover) setDropHover(true);
          }
        }}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
          setDropHover(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDropHover(false);
          const id = e.dataTransfer.getData(TREAT_DRAG_MIME);
          const t = treats.find((tt) => tt.id === id);
          if (t) feedTreat(t);
        }}
        className="px-4 py-6 border-b border-stone-200 flex flex-col items-center"
        style={{
          background: dropHover ? "#f5f5f4" : "white",
          outline: isDragging
            ? `2px dashed ${dropHover ? "#78716c" : "#d6d3d1"}`
            : "none",
          outlineOffset: -8,
        }}
      >
        {pet ? (
          <div style={{ width: 96, height: 96 }}>
            <PixelPet pet={pet} size={96} animated state={petState} />
          </div>
        ) : (
          <div className="text-stone-500 text-sm italic text-center py-6">
            No pet yet — type{" "}
            <code className="bg-stone-100 px-1 rounded">/init</code> to hatch one.
          </div>
        )}
        {pet && (
          <>
            <div className="mt-3 font-pixelify font-bold text-stone-900" style={{ fontSize: 20 }}>
              {pet.name}
            </div>
            {isDragging && (
              <div className="mt-1 text-[11px] text-stone-500">
                drop a treat here to feed
              </div>
            )}
          </>
        )}
      </div>

      {/* Health bar */}
      <div className="px-4 py-3 border-b border-stone-200">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="font-pixelify font-bold text-stone-700 text-[13px]">Health</span>
          <span className="text-xs tabular-nums text-stone-700">{Math.round(health)} / 100</span>
        </div>
        <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${health}%`, background: healthBarColor(health) }}
          />
        </div>
      </div>

      {/* Treats */}
      <div className="px-4 py-3 border-b border-stone-200">
        <div className="flex items-center justify-between mb-2">
          <div className="font-pixelify font-bold text-stone-700 text-[13px]">Treats</div>
          <div className="text-xs text-stone-500 tabular-nums">
            {treats.length}
          </div>
        </div>
        {treats.length === 0 ? (
          <div className="text-xs text-stone-500 italic">
            No treats yet. Earn them from{" "}
            <code className="bg-stone-100 px-1 rounded">/zoom</code> or
            communication milestones.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {treats.map((t) => {
              const dragging = draggingId === t.id;
              return (
                <li
                  key={t.id}
                  draggable={!!pet}
                  onDragStart={(e) => {
                    if (!pet) return;
                    e.dataTransfer.setData(TREAT_DRAG_MIME, t.id);
                    e.dataTransfer.effectAllowed = "copy";
                    setDraggingId(t.id);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  className={[
                    "flex items-center gap-2 px-2 py-1.5 rounded-md border border-stone-200 select-none",
                    pet ? "cursor-grab hover:border-stone-300" : "opacity-60",
                    dragging ? "opacity-40" : "",
                  ].join(" ")}
                >
                  <span className="text-xl leading-none" aria-hidden>
                    {t.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-stone-800">
                      {t.name}
                    </div>
                    <div className="text-[11px] text-stone-500 truncate">
                      {t.meaning}
                    </div>
                  </div>
                  <button
                    onClick={() => feedTreat(t)}
                    disabled={!pet}
                    className="text-[11px] px-2 py-1 rounded-md bg-stone-900 text-white hover:bg-stone-700 disabled:bg-stone-300"
                  >
                    Feed
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {treats.length > 0 && pet && (
          <div className="text-[11px] text-stone-500 italic mt-2">
            Drag a treat onto the pet, or click Feed.
          </div>
        )}
      </div>

      {/* Pet the pet */}
      <div className="px-4 py-3 flex-1 min-h-0 overflow-y-auto">
        <div className="font-pixelify font-bold text-stone-700 text-[13px] mb-1">
          Pet the pet · anonymous
        </div>
        <p className="text-[11px] text-stone-500 mb-2 leading-relaxed">
          A kind word about a teammate, or a quiet note about how communication
          is going. Stays anonymous.
        </p>
        <div className="flex gap-1 mb-2">
          {(["compliment", "feedback"] as const).map((k) => {
            const active = petKind === k;
            const palette =
              k === "compliment"
                ? { activeBg: "#e8a93b", activeBorder: "#c98a1f", idleBg: "#fdf4e3", idleBorder: "#e8d3a1", idleText: "#8a6a1f" }
                : { activeBg: "#3a7bb8", activeBorder: "#1f5a92", idleBg: "#eaf2fa", idleBorder: "#bcd3ea", idleText: "#1f5a92" };
            return (
              <button
                key={k}
                onClick={() => setPetKind(k)}
                className="flex-1 font-pixelify font-bold text-[13px] py-1.5 rounded-md border transition-colors"
                style={{
                  background: active ? palette.activeBg : palette.idleBg,
                  borderColor: active ? palette.activeBorder : palette.idleBorder,
                  color: active ? "white" : palette.idleText,
                }}
              >
                {k === "compliment" ? "Compliment" : "Feedback"}
              </button>
            );
          })}
        </div>
        <textarea
          value={petText}
          onChange={(e) => setPetText(e.target.value)}
          placeholder={
            petKind === "compliment"
              ? "e.g. Mary's eval write-up made the trade-offs really clear."
              : "e.g. Long threads keep getting too long before someone summarizes."
          }
          rows={3}
          className="w-full px-3 py-2 text-[13px] border border-stone-300 rounded-md outline-none focus:border-stone-500 resize-none"
        />
        <button
          onClick={submitPetThePet}
          disabled={!petText.trim() || !pet}
          className="w-full mt-2 px-4 py-2 rounded-md bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 disabled:bg-stone-300 disabled:cursor-not-allowed"
        >
          {justSubmitted ? "Sent anonymously" : "Send"}
        </button>
      </div>
    </aside>
  );
}

function healthBarColor(h: number) {
  if (h >= 80) return "#2bac76"; // green — thriving
  if (h >= 60) return "#7ab800"; // lime — doing okay
  if (h >= 40) return "#ecb22e"; // amber — fidgety
  if (h >= 20) return "#ff8040"; // orange — needs attention
  return "#e01e5a";              // red — low
}

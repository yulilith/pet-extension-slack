"use client";

/**
 * /tree — "Tree Space" demo.
 *
 * Synko is named after the aspen colony — many trees, one root system. This
 * demo extends that metaphor: every team member has their own pet, but the
 * team shares one Grove. When someone has a moment of clearer communication,
 * a leaf appears on the tree. The Grove is where the pets visibly co-exist.
 *
 * Walkthrough:
 *   intro    — Synko DM: "Your team has a Grove. Open it?"
 *   grove    — Big SVG tree, four teammate pets idling around it, recent
 *              leaves (each leaf = a real moment from a teammate). User can
 *              click a leaf to read its story.
 *   add      — Pet prompts user to add today's leaf (3 prompt options).
 *   added    — Leaf animates onto the tree; pet acknowledges.
 *
 * Self-contained — no shared state with /, /needs, or the bot.
 */

import { useReducer, useState } from "react";
import { DMPanel } from "@/components/DMPanel";
import { PixelPet } from "@/components/PixelPet";
import { Sidebar } from "@/components/Sidebar";
import { SlackFrame } from "@/components/SlackFrame";
import { PETS_BY_ID } from "@/content/pets";
import type { FauxMessage, PetSpecies } from "@/types";

/* -------------------------------------------------------------------------- */
/*  Demo data                                                                 */
/* -------------------------------------------------------------------------- */

type Leaf = {
  id: string;
  /** Which teammate's pet planted it. */
  ownerName: string;
  ownerPetId: keyof typeof PETS_BY_ID;
  /** Position on the tree crown — % from left/top of the crown box. */
  x: number;
  y: number;
  /** Color tier — green = recent, yellow = a few days old. */
  age: "fresh" | "settled";
  /** The moment it represents, in the pet's voice. */
  moment: string;
  /** Where in Slack the moment happened. */
  context: string;
};

const USER_PET = PETS_BY_ID.wisp;

const TEAMMATES: { name: string; pet: PetSpecies; x: number; y: number }[] = [
  { name: "Mary", pet: PETS_BY_ID.ember, x: 14, y: 78 },
  { name: "Devon", pet: PETS_BY_ID.mossle, x: 70, y: 82 },
  { name: "Priya", pet: PETS_BY_ID.lumio, x: 86, y: 70 },
];

const SEED_LEAVES: Leaf[] = [
  {
    id: "l1",
    ownerName: "Mary",
    ownerPetId: "ember",
    x: 28,
    y: 22,
    age: "fresh",
    moment: "Mary said the launch slipped two days. No softening.",
    context: "DM with you, this morning",
  },
  {
    id: "l2",
    ownerName: "Devon",
    ownerPetId: "mossle",
    x: 60,
    y: 18,
    age: "fresh",
    moment: "Devon asked Priya for help instead of grinding solo for an hour.",
    context: "#design, yesterday",
  },
  {
    id: "l3",
    ownerName: "Priya",
    ownerPetId: "lumio",
    x: 78,
    y: 30,
    age: "settled",
    moment: "Priya cut a six-paragraph reply down to three sentences.",
    context: "#marketing-launch, two days ago",
  },
  {
    id: "l4",
    ownerName: "you",
    ownerPetId: "wisp",
    x: 44,
    y: 12,
    age: "settled",
    moment: "You named the real risk to Mary instead of hedging it.",
    context: "DM with Mary, three days ago",
  },
  {
    id: "l5",
    ownerName: "Devon",
    ownerPetId: "mossle",
    x: 18,
    y: 36,
    age: "settled",
    moment: "Devon picked one option in #design instead of listing four.",
    context: "#design, last week",
  },
];

const LEAF_PROMPTS = [
  {
    id: "p1",
    label: "Said the real thing",
    body: "Told Mary the auth migration won't make Friday. Asked for Tuesday.",
    context: "DM with Mary",
  },
  {
    id: "p2",
    label: "Asked instead of guessing",
    body: "Asked Priya which of the two onboarding flows she'd run with.",
    context: "DM with Priya",
  },
  {
    id: "p3",
    label: "Closed a thread",
    body: "Picked Devon as owner for the launch announcement, Thursday 2pm checkpoint.",
    context: "#project-x",
  },
];

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

type Stage = "intro" | "grove" | "add" | "added";

type State = {
  stage: Stage;
  leaves: Leaf[];
  selectedLeafId: string | null;
};

type Action =
  | { type: "openGrove" }
  | { type: "selectLeaf"; id: string | null }
  | { type: "openAdd" }
  | { type: "submitLeaf"; promptId: string }
  | { type: "reset" };

const INITIAL: State = {
  stage: "intro",
  leaves: SEED_LEAVES,
  selectedLeafId: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "openGrove":
      return { ...state, stage: "grove" };
    case "selectLeaf":
      return { ...state, selectedLeafId: action.id };
    case "openAdd":
      return { ...state, stage: "add", selectedLeafId: null };
    case "submitLeaf": {
      const prompt = LEAF_PROMPTS.find((p) => p.id === action.promptId);
      if (!prompt) return state;
      const newLeaf: Leaf = {
        id: `user-${Date.now()}`,
        ownerName: "you",
        ownerPetId: USER_PET.id,
        x: 50,
        y: 26,
        age: "fresh",
        moment: prompt.body,
        context: prompt.context,
      };
      return {
        ...state,
        stage: "added",
        leaves: [newLeaf, ...state.leaves],
        selectedLeafId: newLeaf.id,
      };
    }
    case "reset":
      return INITIAL;
  }
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function TreeSpacePage() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const sidebarItems: Parameters<typeof Sidebar>[0]["items"] = [
    { id: "general", label: "general", kind: "channel" },
    { id: "project-x", label: "project-x", kind: "channel" },
    { id: "design", label: "design", kind: "channel" },
    {
      id: "synko-grove",
      label: "Synko Grove",
      kind: "channel",
    },
    {
      id: "synko",
      label: "Synko",
      kind: "dm",
      avatar: { letter: "P", color: "#FFB347" },
      isPet: true,
    },
    {
      id: "mary",
      label: "Mary Chen",
      kind: "dm",
      avatar: { letter: "M", color: "#7c3aed" },
    },
  ];

  const activeId = state.stage === "intro" ? "synko" : "synko-grove";

  let main: React.ReactNode = null;
  switch (state.stage) {
    case "intro":
      main = <IntroScene onOpen={() => dispatch({ type: "openGrove" })} />;
      break;
    case "grove":
    case "add":
    case "added":
      main = (
        <GroveScene
          state={state}
          onSelectLeaf={(id) => dispatch({ type: "selectLeaf", id })}
          onOpenAdd={() => dispatch({ type: "openAdd" })}
          onSubmit={(promptId) => dispatch({ type: "submitLeaf", promptId })}
          onBackToGrove={() => dispatch({ type: "selectLeaf", id: null })}
        />
      );
      break;
  }

  return (
    <SlackFrame
      sidebar={
        <Sidebar
          items={sidebarItems}
          activeId={activeId}
          onReset={() => dispatch({ type: "reset" })}
        />
      }
    >
      {main}
    </SlackFrame>
  );
}

/* -------------------------------------------------------------------------- */
/*  Intro: Synko DM invitation                                                */
/* -------------------------------------------------------------------------- */

function IntroScene({ onOpen }: { onOpen: () => void }) {
  const messages: FauxMessage[] = [
    {
      author: "Synko",
      avatar: { kind: "letter", letter: "P", color: "#FFB347" },
      time: "9:14 AM",
      body: "Your team has a Grove now. It's where everyone's pets live, and where moments of clearer communication show up as leaves.",
      fromPet: true,
    },
    {
      author: "Synko",
      avatar: { kind: "letter", letter: "P", color: "#FFB347" },
      time: "9:14 AM",
      body: "Mary, Devon, and Priya are already there. There are four leaves waiting for you to read.",
      fromPet: true,
    },
  ];

  return (
    <DMPanel
      channelLabel="Synko"
      subline="Just you and Synko"
      messages={messages}
      composer={
        <div className="flex items-center gap-2">
          <button
            onClick={onOpen}
            className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 transition-colors"
          >
            Open Grove
          </button>
          <button
            disabled
            className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-400"
          >
            Maybe later
          </button>
        </div>
      }
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Grove: tree + pets + leaves                                               */
/* -------------------------------------------------------------------------- */

type GroveProps = {
  state: State;
  onSelectLeaf: (id: string | null) => void;
  onOpenAdd: () => void;
  onSubmit: (promptId: string) => void;
  onBackToGrove: () => void;
};

function GroveScene({
  state,
  onSelectLeaf,
  onOpenAdd,
  onSubmit,
  onBackToGrove,
}: GroveProps) {
  const selectedLeaf = state.leaves.find((l) => l.id === state.selectedLeafId);

  return (
    <section className="flex flex-1 flex-col bg-white min-w-0">
      <header className="border-b border-stone-200 px-5 py-3">
        <div className="flex items-baseline gap-2">
          <span className="text-stone-500">#</span>
          <h2 className="font-semibold text-stone-900 text-base">Synko Grove</h2>
        </div>
        <p className="text-xs text-stone-500 mt-0.5">
          Your team{"’"}s shared space — 4 members, {state.leaves.length} leaves
        </p>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <TreeCanvas
            leaves={state.leaves}
            selectedId={state.selectedLeafId}
            onSelect={onSelectLeaf}
          />

          {/* Right rail-ish: leaf detail or actions */}
          <div className="mt-6">
            {state.stage === "add" ? (
              <AddLeafCard onSubmit={onSubmit} />
            ) : selectedLeaf ? (
              <LeafDetailCard
                leaf={selectedLeaf}
                isJustAdded={state.stage === "added"}
                onClose={onBackToGrove}
              />
            ) : (
              <GroveActionRow leafCount={state.leaves.length} onAdd={onOpenAdd} />
            )}
          </div>

          <RecentLeavesList
            leaves={state.leaves}
            selectedId={state.selectedLeafId}
            onSelect={onSelectLeaf}
          />
        </div>
      </div>
    </section>
  );
}

function TreeCanvas({
  leaves,
  selectedId,
  onSelect,
}: {
  leaves: Leaf[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div
      className="relative w-full rounded-2xl border border-stone-200 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #f7faf2 0%, #eef4e2 60%, #e3ecd0 100%)",
        height: 420,
      }}
    >
      {/* The tree itself */}
      <svg
        viewBox="0 0 600 420"
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        {/* Ground line */}
        <ellipse cx="300" cy="395" rx="260" ry="14" fill="#cdd9b1" opacity="0.6" />
        {/* Trunk */}
        <path
          d="M285 395 Q278 320 290 250 Q295 220 310 220 Q325 220 320 260 Q318 320 318 395 Z"
          fill="#7a4f2a"
        />
        <path
          d="M295 270 Q280 250 270 230"
          stroke="#7a4f2a"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M315 260 Q330 240 350 230"
          stroke="#7a4f2a"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        {/* Crown — three overlapping organic blobs */}
        <ellipse cx="220" cy="180" rx="120" ry="90" fill="#8fb24a" />
        <ellipse cx="380" cy="170" rx="135" ry="100" fill="#9cc154" />
        <ellipse cx="300" cy="120" rx="140" ry="90" fill="#a9cd5f" />
        {/* Highlights on crown */}
        <ellipse cx="270" cy="100" rx="60" ry="22" fill="#bedb7a" opacity="0.7" />
      </svg>

      {/* Leaves layer — absolute positioned over the crown */}
      <div
        className="absolute"
        style={{ left: "8%", top: "4%", right: "8%", bottom: "42%" }}
      >
        {leaves.map((leaf) => (
          <LeafDot
            key={leaf.id}
            leaf={leaf}
            isSelected={leaf.id === selectedId}
            onClick={() => onSelect(leaf.id === selectedId ? null : leaf.id)}
          />
        ))}
      </div>

      {/* Pets — user front-and-center, teammates around */}
      <div
        className="absolute"
        style={{ left: "44%", bottom: "6%", width: 88 }}
      >
        <PixelPet pet={USER_PET} size={88} />
        <div className="text-center text-[11px] font-medium text-stone-700 mt-1">
          you
        </div>
      </div>
      {TEAMMATES.map((t) => (
        <div
          key={t.name}
          className="absolute"
          style={{ left: `${t.x}%`, top: `${t.y}%`, width: 64 }}
        >
          <PixelPet pet={t.pet} size={64} />
          <div className="text-center text-[10px] text-stone-600 mt-0.5">
            {t.name}
          </div>
        </div>
      ))}
    </div>
  );
}

function LeafDot({
  leaf,
  isSelected,
  onClick,
}: {
  leaf: Leaf;
  isSelected: boolean;
  onClick: () => void;
}) {
  const base =
    leaf.age === "fresh"
      ? "#eaf68a" // bright lime
      : "#f6d978"; // warm yellow
  return (
    <button
      onClick={onClick}
      className={`absolute group transition-transform ${
        isSelected ? "scale-150 z-10" : "hover:scale-125"
      }`}
      style={{
        left: `${leaf.x}%`,
        top: `${leaf.y}%`,
        width: 18,
        height: 18,
        transform: "translate(-50%, -50%)",
      }}
      aria-label={`Leaf from ${leaf.ownerName}`}
    >
      <svg viewBox="0 0 20 20" className="w-full h-full drop-shadow-sm">
        <path
          d="M10 1 C 16 4, 18 11, 14 17 C 11 19, 7 19, 5 16 C 1 11, 4 4, 10 1 Z"
          fill={base}
          stroke="#5e7a2a"
          strokeWidth="0.8"
        />
        <path
          d="M10 3 L 10 17"
          stroke="#5e7a2a"
          strokeWidth="0.6"
          opacity="0.6"
        />
      </svg>
      {isSelected && (
        <span className="absolute inset-0 rounded-full ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent" />
      )}
    </button>
  );
}

function GroveActionRow({
  leafCount,
  onAdd,
}: {
  leafCount: number;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
      <p className="text-sm text-stone-600">
        Click a leaf to read what it stands for. {leafCount} leaves so far this
        week.
      </p>
      <button
        onClick={onAdd}
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition-colors"
      >
        Add today{"’"}s leaf
      </button>
    </div>
  );
}

function LeafDetailCard({
  leaf,
  isJustAdded,
  onClose,
}: {
  leaf: Leaf;
  isJustAdded: boolean;
  onClose: () => void;
}) {
  const ownerPet = PETS_BY_ID[leaf.ownerPetId];
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 synko-fade-in">
      <div className="flex items-start gap-3">
        <PixelPet pet={ownerPet} size={48} animated={false} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-800">
              {leaf.ownerName}
              {"’s leaf"}
            </span>
            <span className="text-xs text-stone-500">{leaf.context}</span>
          </div>
          <p className="mt-1 text-stone-800">{leaf.moment}</p>
          {isJustAdded && (
            <p className="mt-2 text-xs text-emerald-700">
              {USER_PET.name}: that one{"’"}s worth marking. The Grove sees it.
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-xs text-stone-500 hover:text-stone-700"
        >
          close
        </button>
      </div>
    </div>
  );
}

function AddLeafCard({ onSubmit }: { onSubmit: (id: string) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="rounded-lg border border-stone-200 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md p-1 synko-warm">
          <PixelPet pet={USER_PET} size={40} animated={false} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-stone-700">
            <span className="font-semibold">{USER_PET.name}:</span> what
            happened today that the Grove should keep?
          </p>
          <ul className="mt-3 space-y-2">
            {LEAF_PROMPTS.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setPicked(p.id)}
                  className={`w-full text-left rounded-md border px-3 py-2 transition-colors ${
                    picked === p.id
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <div className="text-xs font-semibold text-stone-700">
                    {p.label}
                  </div>
                  <div className="text-sm text-stone-800 mt-0.5">{p.body}</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {p.context}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end">
            <button
              disabled={!picked}
              onClick={() => picked && onSubmit(picked)}
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:bg-stone-300 transition-colors"
            >
              Plant the leaf
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentLeavesList({
  leaves,
  selectedId,
  onSelect,
}: {
  leaves: Leaf[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-8">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
        Recent leaves
      </h3>
      <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
        {leaves.slice(0, 6).map((leaf) => {
          const ownerPet = PETS_BY_ID[leaf.ownerPetId];
          const isSelected = leaf.id === selectedId;
          return (
            <li key={leaf.id}>
              <button
                onClick={() => onSelect(leaf.id)}
                className={`w-full text-left px-3 py-2 flex items-start gap-3 ${
                  isSelected ? "bg-amber-50" : "hover:bg-stone-50"
                }`}
              >
                <PixelPet pet={ownerPet} size={32} animated={false} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-stone-800 truncate">
                    {leaf.moment}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {leaf.ownerName} · {leaf.context}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

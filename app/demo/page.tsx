"use client";

/**
 * /demo — the canonical Synko playtest experience.
 *
 * One project channel (#proj-pomegranate) with a persistent right-side
 * PetHome panel. All demo flows are triggered by slash commands typed into
 * the composer:
 *
 *   /help     — list all commands
 *   /init     — hatch the project pet (modal)
 *   /zoom     — simulate a Zoom meeting; post a meeting report; earn treats
 *   /scaffold — show the three-stage scaffolding-fade demo (fullscreen)
 *   /wrapped  — show end-of-project Communication Wrapped (fullscreen)
 *   /pet      — focus the pet panel (no-op when expanded)
 *   /feed     — feed the next treat to the pet
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { SlackFrame } from "@/components/SlackFrame";
import { Sidebar } from "@/components/Sidebar";
import { PetHome, type Treat } from "@/components/PetHome";
import { Modal } from "@/components/Modal";
import { PixelPet, healthToState, type PetState } from "@/components/PixelPet";
import { HatchScene } from "@/components/HatchScene";
import { ScaffoldDemo } from "@/components/ScaffoldDemo";
import { WrappedDemo } from "@/components/WrappedDemo";
import { ChannelFloatingPet } from "@/components/ChannelFloatingPet";
import { analyzeText } from "@/lib/analyzeText";
import { PETS } from "@/content/pets";
import {
  CHANNELS,
  COMPANY,
  PROJECT,
  TEAMMATES,
  YOU,
  type Teammate,
} from "@/content/storyContext";
import {
  PROJ_POMEGRANATE_HISTORY,
  PROJ_POMEGRANATE_TOPIC,
  type FauxChannelMessage,
} from "@/content/channelHistory";
import type { PetSpecies } from "@/types";

type ChannelMessage =
  | { kind: "human"; authorId: string; time: string; body: string }
  | { kind: "user"; time: string; body: string }
  | { kind: "synko-public"; time: string; body: React.ReactNode }
  | { kind: "synko-ephemeral"; time: string; body: React.ReactNode }
  | { kind: "system"; time: string; body: string };

type ActiveModal = null | "init" | "scaffold" | "wrapped";

const HISTORY: ChannelMessage[] = PROJ_POMEGRANATE_HISTORY.map(
  (m: FauxChannelMessage) => ({
    kind: "human",
    authorId: m.authorId,
    time: m.time,
    body: m.body,
  }),
);

/* ─── Treat library — mirrors the meeting-pet-v2 vocabulary ─────────────── */
const TREATS = {
  apple:     { emoji: "🍎", name: "Apple",     meaning: "Clarifying question" },
  cake:      { emoji: "🎂", name: "Cake",      meaning: "Deadline named" },
  cookie:    { emoji: "🍪", name: "Cookie",    meaning: "Process question" },
  carrot:    { emoji: "🥕", name: "Carrot",    meaning: "Jargon translated" },
  star:      { emoji: "⭐", name: "Star",      meaning: "Action item defined" },
  candy:     { emoji: "🍬", name: "Candy",     meaning: "Cross-team alignment" },
  blueberry: { emoji: "🫐", name: "Blueberry", meaning: "Follow-up scheduled" },
  gem:       { emoji: "💎", name: "Gem",       meaning: "Problem resolved" },
} as const;

/* ─── Slash commands metadata for /help and autocomplete ─────────────────── */
const COMMANDS = [
  { name: "/init", desc: "Hatch the project pet (leader sets the project up)" },
  { name: "/zoom", desc: "Simulate a Zoom meeting → post a meeting report → earn treats" },
  { name: "/scaffold", desc: "See how Synko's coaching fades over time" },
  { name: "/wrapped", desc: "End-of-project Communication Wrapped recap" },
  { name: "/pet", desc: "Focus the pet's home panel" },
  { name: "/feed", desc: "Feed the next treat to the pet" },
  { name: "/help", desc: "Show this list" },
];

export default function DemoPage() {
  // ── Pet + reward state
  const [pet, setPet] = useState<PetSpecies | null>(null);
  const [health, setHealth] = useState(62);
  const [treats, setTreats] = useState<Treat[]>([]);
  const [petCollapsed, setPetCollapsed] = useState(false);

  // ── Channel state
  const [messages, setMessages] = useState<ChannelMessage[]>(HISTORY);
  const [composer, setComposer] = useState("");
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  // Text the user explicitly dismissed Synko's suggestion for — silences
  // the floating pet until the composer text changes.
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  // After the user *sends* a vague message, we keep the hit alive for a few
  // seconds so the pet has time to visibly react ("hey — that one was vague").
  const [postSendHit, setPostSendHit] = useState<ReturnType<typeof analyzeText>>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Live analysis of what the user is composing — falls back to the
  // post-send hit when the composer is empty (typical right after sending).
  const composerHit = useMemo(() => {
    const t = composer.trim();
    if (t.length === 0) return postSendHit;
    if (t.length < 3) return null;
    if (dismissedFor === t) return null;
    return analyzeText(composer) ?? null;
  }, [composer, dismissedFor, postSendHit]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  // ── Helpers ────────────────────────────────────────────────────────────
  function postMessage(m: ChannelMessage) {
    setMessages((prev) => [...prev, m]);
  }
  function nowTime() {
    return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  // ── Slash command dispatch ─────────────────────────────────────────────
  function runCommand(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed.startsWith("/")) return false;
    const [cmd] = trimmed.split(/\s+/);
    switch (cmd) {
      case "/help":
        postMessage({
          kind: "synko-ephemeral",
          time: nowTime(),
          body: <HelpList />,
        });
        return true;
      case "/init":
        setActiveModal("init");
        return true;
      case "/zoom":
        runZoomCommand();
        return true;
      case "/scaffold":
        setActiveModal("scaffold");
        return true;
      case "/wrapped":
        setActiveModal("wrapped");
        return true;
      case "/pet":
        setPetCollapsed(false);
        postMessage({
          kind: "synko-ephemeral",
          time: nowTime(),
          body: <span>Pet panel is right there →</span>,
        });
        return true;
      case "/feed":
        if (treats[0] && pet) feedTreat(treats[0]);
        else
          postMessage({
            kind: "synko-ephemeral",
            time: nowTime(),
            body: <span>{pet ? "No treats yet — try /zoom first." : "Hatch a pet first with /init."}</span>,
          });
        return true;
      default:
        postMessage({
          kind: "synko-ephemeral",
          time: nowTime(),
          body: (
            <span>
              Unknown command <code className="bg-stone-100 px-1 rounded">{cmd}</code> — type{" "}
              <code className="bg-stone-100 px-1 rounded">/help</code> to see what's available.
            </span>
          ),
        });
        return true;
    }
  }

  function handleSend() {
    const text = composer.trim();
    if (!text) return;
    if (text.startsWith("/")) {
      const handled = runCommand(text);
      setComposer("");
      if (handled) return;
    }
    postMessage({ kind: "user", time: nowTime(), body: text });
    // Keep Synko's reaction visible after the message is sent — even though
    // the composer cleared. The hit auto-dismisses after ~12s if untouched.
    const hit = analyzeText(text);
    if (hit && dismissedFor !== text) {
      setPostSendHit(hit);
      window.setTimeout(() => {
        setPostSendHit((prev) => (prev === hit ? null : prev));
      }, 12000);
    }
    setComposer("");
    setDismissedFor(null);
  }

  // ── /zoom: simulate a meeting ──────────────────────────────────────────
  function runZoomCommand() {
    postMessage({
      kind: "system",
      time: nowTime(),
      body: "📞 You joined a Zoom call: 'Smart Threads · Eng + DS sync' (28 min). Synko is listening…",
    });
    setTimeout(() => {
      postMessage({
        kind: "synko-public",
        time: nowTime(),
        body: <ZoomReportCard />,
      });
      const earned: Treat[] = [
        { id: `t-${Date.now()}-1`, emoji: TREATS.apple.emoji, name: TREATS.apple.name, meaning: TREATS.apple.meaning, source: "Eng + DS sync" },
        { id: `t-${Date.now()}-2`, emoji: TREATS.cake.emoji, name: TREATS.cake.name, meaning: TREATS.cake.meaning, source: "Eng + DS sync" },
        { id: `t-${Date.now()}-3`, emoji: TREATS.star.emoji, name: TREATS.star.name, meaning: TREATS.star.meaning, source: "Eng + DS sync" },
        { id: `t-${Date.now()}-4`, emoji: TREATS.gem.emoji, name: TREATS.gem.name, meaning: TREATS.gem.meaning, source: "Eng + DS sync" },
      ];
      setTreats((prev) => [...prev, ...earned]);
    }, 1800);
  }

  // ── Feeding ────────────────────────────────────────────────────────────
  function feedTreat(treat: Treat) {
    setTreats((prev) => prev.filter((t) => t.id !== treat.id));
    setHealth((h) => Math.min(100, h + 6));
    postMessage({
      kind: "synko-public",
      time: nowTime(),
      body: (
        <span>
          Someone just fed me a {treat.emoji} <b>{treat.name}</b> — {treat.meaning.toLowerCase()}.
          Quietly celebrating that with the team 🤍
        </span>
      ),
    });
  }

  function handlePetThePet(text: string, kind: "compliment" | "feedback") {
    setHealth((h) => Math.min(100, h + (kind === "compliment" ? 3 : 2)));
    // Synko's faux evaluation reply (anonymous — doesn't quote the user).
    postMessage({
      kind: "synko-public",
      time: nowTime(),
      body: (
        <span>
          {kind === "compliment"
            ? "Someone on the team noticed something kind today and dropped it in my home. I'll pass that warmth along — anonymously, of course. 🤍"
            : "Got an anonymous note about how communication is going. Logged it. I'll surface a pattern back to the team if I see it more than once."}
        </span>
      ),
    });
  }

  // ── /init: hatch ─────────────────────────────────────────────────────────
  function handleInitComplete(chosenPet: PetSpecies, projectName: string) {
    setPet(chosenPet);
    setActiveModal(null);
    postMessage({
      kind: "synko-public",
      time: nowTime(),
      body: (
        <div>
          <div
            className="font-pixelify text-stone-900 mb-2 font-bold"
            style={{ fontSize: 18, lineHeight: 1.4 }}
          >
            Hi team — I'm {chosenPet.name}, a {chosenPet.kind}.
          </div>
          <p className="mb-2">{chosenPet.intro}</p>
          <p className="text-sm text-stone-700">
            <b>What I'll be paying attention to:</b> {chosenPet.coachingFocus}
          </p>
          <p className="text-xs text-stone-500 mt-3 italic">
            I'll mostly stay quiet. Type{" "}
            <code className="bg-stone-100 px-1 rounded">/help</code> to see what
            you can do with me.
          </p>
        </div>
      ),
    });
    if (projectName) {
      // Defer for a bit of breathing room
      setTimeout(() => {
        postMessage({
          kind: "system",
          time: nowTime(),
          body: `Pet hatched for project: ${projectName}`,
        });
      }, 400);
    }
  }

  // ── Sidebar items ──────────────────────────────────────────────────────
  const sidebarItems: Parameters<typeof Sidebar>[0]["items"] = [
    ...CHANNELS.map((c) => ({
      id: c.id,
      label: c.label,
      kind: "channel" as const,
      unread: c.id === "proj-pomegranate",
    })),
    {
      id: "synko",
      label: "Synko",
      kind: "dm" as const,
      avatar: { letter: "S", color: "#FFB347" },
      isPet: true,
      presence: "active" as const,
    },
    ...Object.values(TEAMMATES).slice(0, 4).map((t: Teammate) => ({
      id: `dm-${t.id}`,
      label: t.shortName,
      kind: "dm" as const,
      avatar: { letter: t.avatarLetter, color: t.avatarColor },
      presence: "active" as const,
    })),
  ];

  // ── Composer placeholder hint ──────────────────────────────────────────
  const showSlashHint = composer.trim().startsWith("/");
  const filteredCommands = useMemo(() => {
    if (!showSlashHint) return [];
    const q = composer.trim().toLowerCase();
    return COMMANDS.filter((c) => c.name.startsWith(q));
  }, [composer, showSlashHint]);

  return (
    <SlackFrame
      sidebar={
        <Sidebar
          workspaceName={`${COMPANY.name} HQ`}
          items={sidebarItems}
          activeId="proj-pomegranate"
        />
      }
    >
      <div className="flex flex-1 min-h-0">
        {/* Main channel column */}
        <section className="flex-1 flex flex-col bg-white min-w-0 min-h-0 relative">
          {/* Channel header */}
          <header className="border-b border-stone-200 px-5 py-2.5 flex items-center gap-3 shrink-0">
            <div className="min-w-0 flex-1">
              <button className="flex items-center gap-1.5 -mx-1 px-1 py-0.5 rounded hover:bg-stone-100">
                <span className="text-stone-500 text-base">#</span>
                <h2 className="font-bold text-stone-900 text-[15px] leading-tight">
                  proj-pomegranate
                </h2>
                <Caret />
              </button>
              <p className="text-xs text-stone-500 mt-0.5 truncate">
                {PROJ_POMEGRANATE_TOPIC}
              </p>
            </div>
            <div className="text-[11px] text-stone-500 italic">
              {PROJECT.weekOfPlaytest}
            </div>
          </header>

          {/* Messages — bottom padding reserves space so the floating pet
               doesn't overlap the most-recent message. */}
          <div className="flex-1 overflow-y-auto pt-4 pb-20">
            <ChannelDayDivider label="Today" />
            {messages.map((m, i) => (
              <ChannelRow key={i} msg={m} pet={pet} petState={healthToState(health)} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating pet — sits above the composer, alerts on vague input. */}
          <ChannelFloatingPet
            pet={pet}
            petState={healthToState(health)}
            hit={composerHit}
            onUseSuggestion={(s) => {
              setComposer(s);
              setDismissedFor(null);
              setPostSendHit(null);
            }}
            onDismiss={() => {
              const t = composer.trim();
              if (t) setDismissedFor(t);
              setPostSendHit(null);
            }}
          />

          {/* Composer */}
          <div className="px-5 pb-4 shrink-0">
            {showSlashHint && filteredCommands.length > 0 && (
              <div className="mb-1 border border-stone-300 rounded-lg bg-white shadow-sm overflow-hidden">
                <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-stone-500 font-bold border-b border-stone-200">
                  Commands
                </div>
                <ul>
                  {filteredCommands.map((c) => (
                    <li
                      key={c.name}
                      onClick={() => setComposer(c.name + " ")}
                      className="px-3 py-2 hover:bg-stone-50 cursor-pointer flex items-baseline gap-3"
                    >
                      <code className="font-mono text-[13px] font-bold text-stone-900">
                        {c.name}
                      </code>
                      <span className="text-xs text-stone-600">{c.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="border border-stone-300 rounded-lg bg-white focus-within:border-stone-500 transition-colors flex items-end">
              <textarea
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  } else if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message #proj-pomegranate · try /help"
                rows={1}
                className="flex-1 resize-none outline-none px-3 py-2.5 text-[15px] leading-snug text-stone-900 bg-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!composer.trim()}
                className="m-1.5 px-3 py-1.5 rounded-md bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-600 disabled:bg-stone-300"
              >
                Send
              </button>
            </div>
          </div>
        </section>

        {/* Pet home side panel */}
        <PetHome
          pet={pet}
          health={health}
          treats={treats}
          onFeed={feedTreat}
          onPetThePet={handlePetThePet}
          collapsed={petCollapsed}
          onToggleCollapse={() => setPetCollapsed((c) => !c)}
        />
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <Modal
        open={activeModal === "init"}
        onClose={() => setActiveModal(null)}
        width="md"
        title="Hatch your project's pet"
      >
        <InitFlow onComplete={handleInitComplete} />
      </Modal>

      <Modal
        open={activeModal === "scaffold"}
        onClose={() => setActiveModal(null)}
        width="lg"
      >
        <div className="h-[80vh] flex flex-col">
          <ScaffoldDemo />
        </div>
      </Modal>

      <Modal
        open={activeModal === "wrapped"}
        onClose={() => setActiveModal(null)}
        width="fullscreen"
      >
        <WrappedDemo />
      </Modal>
    </SlackFrame>
  );
}

/* ─────────────────────────── Components ─────────────────────────── */

function ChannelDayDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-5 my-2">
      <div className="flex-1 h-px bg-stone-200" />
      <span className="text-[11px] font-semibold text-stone-600 px-3 py-0.5 rounded-full border border-stone-200 bg-white">
        {label}
      </span>
      <div className="flex-1 h-px bg-stone-200" />
    </div>
  );
}

function ChannelRow({
  msg,
  pet,
  petState,
}: {
  msg: ChannelMessage;
  pet: PetSpecies | null;
  petState: PetState;
}) {
  if (msg.kind === "system") {
    return (
      <div className="px-5 py-1 text-xs text-stone-500 italic">{msg.body}</div>
    );
  }

  if (msg.kind === "synko-ephemeral") {
    return (
      <div className="px-5 py-2">
        <div className="flex gap-3 items-start bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <SynkoAvatar pet={pet} small petState={petState} />
          <div className="flex-1 text-sm text-stone-800">
            <div className="text-[11px] uppercase tracking-wider text-amber-700 font-bold mb-0.5">
              Only visible to you · from Synko
            </div>
            {msg.body}
          </div>
        </div>
      </div>
    );
  }

  if (msg.kind === "synko-public") {
    const accent = pet?.accentColor ?? "#9aa0a6";
    return (
      <div className="slack-msg">
        <div className="slack-msg-time-rail">{msg.time}</div>
        <div className="slack-msg-avatar flex items-center justify-center bg-transparent">
          {pet ? (
            <PixelPet pet={pet} size={28} animated={false} state={petState} />
          ) : (
            <span className="text-xs font-bold text-stone-700">S</span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className="font-pixelify text-stone-900 font-bold"
            style={{ fontSize: 17 }}
          >
            Synko
          </span>
          <span className="inline-block px-1.5 py-0 text-[10px] rounded bg-stone-200 text-stone-600 font-medium">
            APP
          </span>
          <span className="text-xs text-stone-500">{msg.time}</span>
        </div>
        <div
          className="mt-1 max-w-prose pl-3 text-stone-800 leading-relaxed"
          style={{ borderLeft: `3px solid ${accent}` }}
        >
          {msg.body}
        </div>
      </div>
    );
  }

  if (msg.kind === "user") {
    return (
      <div className="slack-msg">
        <div className="slack-msg-time-rail">{msg.time}</div>
        <div
          className="slack-msg-avatar text-white text-sm font-bold flex items-center justify-center"
          style={{ background: YOU.avatarColor }}
        >
          {YOU.avatarLetter}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-stone-900">{YOU.name}</span>
          <span className="text-xs text-stone-500">{msg.time}</span>
        </div>
        <div className="text-stone-800 whitespace-pre-wrap leading-relaxed">
          {msg.body}
        </div>
      </div>
    );
  }

  // Human teammate
  const t = TEAMMATES[msg.authorId];
  return (
    <div className="slack-msg">
      <div className="slack-msg-time-rail">{msg.time}</div>
      <div
        className="slack-msg-avatar text-white text-sm font-bold flex items-center justify-center"
        style={{ background: t.avatarColor }}
      >
        {t.avatarLetter}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-stone-900">{t.name}</span>
        <span className="text-xs text-stone-500">{msg.time}</span>
      </div>
      <div className="text-stone-800 whitespace-pre-wrap leading-relaxed">
        {msg.body}
      </div>
    </div>
  );
}

function SynkoAvatar({
  pet,
  small,
  petState,
}: {
  pet: PetSpecies | null;
  small?: boolean;
  petState?: PetState;
}) {
  const size = small ? 24 : 36;
  return (
    <div
      className="rounded-md overflow-hidden flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {pet ? (
        <PixelPet pet={pet} size={size - 4} animated={false} state={petState} />
      ) : (
        <span className="text-xs font-bold text-stone-800">S</span>
      )}
    </div>
  );
}

function HelpList() {
  return (
    <div>
      <div className="font-semibold text-stone-900 mb-1">Synko commands</div>
      <ul className="space-y-1">
        {COMMANDS.map((c) => (
          <li key={c.name} className="flex items-baseline gap-2 text-sm">
            <code className="font-mono text-[13px] font-bold text-stone-900">
              {c.name}
            </code>
            <span className="text-stone-700">{c.desc}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-stone-500 italic mt-2">
        Tip: also try the panel on the right — feed treats, leave anonymous
        compliments or feedback for the team.
      </p>
    </div>
  );
}

function ZoomReportCard() {
  return (
    <div>
      <div className="font-bold text-stone-900 mb-1">📞 Meeting recap · Smart Threads · Eng + DS sync</div>
      <p className="text-sm text-stone-700 mb-2">
        I listened in. Here's what I noticed:
      </p>
      <ul className="text-sm text-stone-800 space-y-1.5 mb-3">
        <li>🍎 <b>Mary</b> asked a clarifying question about the eval rubric — that unblocked Devon.</li>
        <li>🎂 <b>Devon</b> committed to a fix by <b>Thursday EOD</b>. Concrete deadline ✓</li>
        <li>⭐ <b>Priya</b> defined the next action: "loop in platform team about context window."</li>
        <li>💎 The long-thread regression got root-caused. Closed loop on a 5-day uncertainty.</li>
      </ul>
      <p className="text-xs text-stone-600 border-t border-amber-200/70 pt-2">
        4 treats earned — they're in my home (panel right). Anyone on the team can feed me with them when there's a moment.
      </p>
    </div>
  );
}

function Caret() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="text-stone-500"
      aria-hidden
    >
      <path d="M5 8l5 5 5-5z" />
    </svg>
  );
}

/* ─────────────────────────── /init flow inside modal ─────────────────────── */

function InitFlow({
  onComplete,
}: {
  onComplete: (pet: PetSpecies, projectName: string) => void;
}) {
  const [step, setStep] = useState<"leader" | "choose" | "hatching">("leader");
  const [project, setProject] = useState({
    name: PROJECT.codename,
    goal: PROJECT.goal,
    context: PROJECT.context,
    deadline: PROJECT.deadline,
  });
  const [selectedSpecies, setSelectedSpecies] = useState<PetSpecies | null>(null);
  const [petName, setPetName] = useState("");

  /** Final pet object: chosen species + custom name. */
  const finalPet: PetSpecies | null = selectedSpecies
    ? { ...selectedSpecies, name: petName.trim() || selectedSpecies.name }
    : null;

  if (step === "leader") {
    return (
      <div className="px-6 py-6">
        <div className="text-[11px] uppercase tracking-wider text-stone-500 font-bold">
          Step 1 of 3 · project leader
        </div>
        <h1 className="text-xl font-bold text-stone-900 mt-1">Set up your project</h1>
        <p className="text-stone-600 text-sm mt-1 mb-4">
          You're the project leader. Tell Synko what your team is here to do —
          this is what shapes the pet that hatches.
        </p>

        <div className="space-y-3">
          <Field label="Project name">
            <input
              value={project.name}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-md outline-none focus:border-stone-500"
            />
          </Field>
          <Field label="Project goal">
            <textarea
              value={project.goal}
              onChange={(e) => setProject({ ...project, goal: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-stone-300 rounded-md outline-none focus:border-stone-500 resize-none"
            />
          </Field>
          <Field label="Context the pet should know">
            <textarea
              value={project.context}
              onChange={(e) => setProject({ ...project, context: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-stone-300 rounded-md outline-none focus:border-stone-500 resize-none"
            />
          </Field>
          <Field label="Deadline">
            <input
              value={project.deadline}
              onChange={(e) => setProject({ ...project, deadline: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-md outline-none focus:border-stone-500"
            />
          </Field>
        </div>
        <button
          onClick={() => setStep("choose")}
          disabled={!project.name.trim()}
          className="mt-5 px-5 py-2.5 rounded-md bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 disabled:bg-stone-300"
        >
          Choose your pet →
        </button>
      </div>
    );
  }

  if (step === "choose") {
    return (
      <div className="px-6 py-6">
        <div className="text-[11px] uppercase tracking-wider text-stone-500 font-bold">
          Step 2 of 3 · pick &amp; name
        </div>
        <h1 className="text-xl font-bold text-stone-900 mt-1">
          Choose your team's pet
        </h1>
        <p className="text-stone-600 text-sm mt-1 mb-4">
          Pick the one your team will raise together. You can name it whatever
          you want.
        </p>

        {/* Species grid */}
        <div className="grid grid-cols-6 gap-2 mb-5">
          {PETS.map((p) => {
            const isSelected = selectedSpecies?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedSpecies(p)}
                data-active={isSelected}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors data-[active=true]:bg-stone-50 data-[active=false]:border-stone-200 hover:border-stone-400"
                style={{ borderColor: isSelected ? p.accentColor : undefined }}
              >
                <div style={{ width: 56, height: 56 }}>
                  <PixelPet
                    pet={p}
                    size={56}
                    animated={isSelected}
                    state={isSelected ? "healthy" : "normal"}
                  />
                </div>
                <div className="text-[11px] font-semibold text-stone-700 text-center">
                  {p.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected pet preview + custom name input */}
        {selectedSpecies && (
          <div className="border-t border-stone-200 pt-4">
            <div className="flex items-start gap-4">
              <div
                className="rounded-lg p-2"
                style={{ background: `${selectedSpecies.accentColor}15` }}
              >
                <PixelPet pet={selectedSpecies} size={72} animated state="healthy" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-stone-500 font-bold mb-1">
                  Coaching focus
                </div>
                <p className="text-sm text-stone-700 mb-3">
                  {selectedSpecies.coachingFocus}
                </p>
                <Field label="Give your pet a name">
                  <input
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="e.g. Pomi, Bubbles, Mango"
                    maxLength={20}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md outline-none focus:border-stone-500 font-pixelify text-base"
                  />
                </Field>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-2 mt-5">
          <button
            onClick={() => setStep("leader")}
            className="px-4 py-2.5 rounded-md text-sm font-semibold text-stone-700 hover:bg-stone-100"
          >
            ← Back
          </button>
          <button
            onClick={() => setStep("hatching")}
            disabled={!selectedSpecies || !petName.trim()}
            className="px-5 py-2.5 rounded-md bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 disabled:bg-stone-300"
          >
            Hatch the pet →
          </button>
        </div>
      </div>
    );
  }

  // hatching (step 3 of 3)
  return (
    <HatchScene
      pet={finalPet!}
      onDone={() => onComplete(finalPet!, project.name)}
    />
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

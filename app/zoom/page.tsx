"use client";

/**
 * /zoom — How Synko-in-Slack uses Zoom meeting-pet reports.
 *
 * Premise: the Meeting Pet Chrome extension lives in Zoom. While the user is
 * in a call, it captures the transcript and awards "treats" (🎂 deadline
 * question, ⭐ action item, 🍎 clarifying question, etc. — the meeting-pet
 * vocabulary). When the call ends, the extension ships a structured report
 * over to Synko's Slack DM.
 *
 * THIS PAGE is what happens *after* that handoff — the Slack-side experience:
 *
 *   inbox     — Synko DM card: "your report from Mary just landed". Tiny
 *               summary (treat counts, talk-time, one missing-treat callout).
 *   review    — full report opens inline: synchronous moments per treat,
 *               translated into asynchronous-communication implications by
 *               the pet.
 *   goals     — Synko proposes 1-3 weekly async goals derived from the
 *               report (e.g. "ask one clarifying question per long thread").
 *               User picks which to commit to.
 *   nudge     — three days later: an in-the-moment async nudge that fires
 *               because the user is about to repeat a pattern the meeting
 *               flagged. Shows the loop closing.
 *   trend     — a weekly trend digest after several meetings + nudges, so
 *               the feedback loop is legible: synchronous treats → async
 *               goals → async behavior → trend.
 *
 * No pixel-art treat-eating happens here — that's the Chrome extension's job.
 * Here the report is *data*, and Synko turns it into asynchronous coaching.
 */

import { useReducer, useState } from "react";
import Link from "next/link";
import { DMPanel } from "@/components/DMPanel";
import { PixelPet } from "@/components/PixelPet";
import { Sidebar } from "@/components/Sidebar";
import { SlackFrame } from "@/components/SlackFrame";
import { PETS_BY_ID } from "@/content/pets";
import type { FauxMessage } from "@/types";

const PET = PETS_BY_ID.wisp;

/* -------------------------------------------------------------------------- */
/*  The "incoming report" from the Zoom Chrome extension                      */
/* -------------------------------------------------------------------------- */

type TreatId =
  | "apple"
  | "cake"
  | "cookie"
  | "carrot"
  | "star"
  | "candy"
  | "blueberry"
  | "gem";

type TreatDef = {
  emoji: string;
  name: string;
  meaning: string;
};

const TREAT_LIBRARY: Record<TreatId, TreatDef> = {
  apple: { emoji: "🍎", name: "Apple", meaning: "Clarifying Question" },
  cake: { emoji: "🎂", name: "Cake", meaning: "Deadline Question" },
  cookie: { emoji: "🍪", name: "Cookie", meaning: "Process Question" },
  carrot: { emoji: "🥕", name: "Carrot", meaning: "Jargon Translation" },
  star: { emoji: "⭐", name: "Star", meaning: "Action Item Defined" },
  candy: { emoji: "🍬", name: "Candy", meaning: "Cross-Team Alignment" },
  blueberry: { emoji: "🫐", name: "Blueberry", meaning: "Follow-Up Scheduled" },
  gem: { emoji: "💎", name: "Gem", meaning: "Problem Resolved" },
};

/** Shape of the report the extension delivers. */
type MeetingReport = {
  meetingId: string;
  title: string;
  startedAt: string;
  durationLabel: string;
  participants: string[];
  /** % share of speaking time. */
  talkTime: { you: number; them: number };
  /** Treats actually earned, with the transcript moment that triggered each. */
  earned: {
    treatId: TreatId;
    speaker: "you" | string;
    time: string;
    quote: string;
  }[];
  /** Treats the analyzer expected but didn't see (the "missing bowls"). */
  missing: {
    treatId: TreatId;
    /** Why the analyzer thought one should have been earned. */
    cue: string;
  }[];
  /** Pet-shaped headline observation, written by the extension's LLM step. */
  observationHeadline: string;
  observationBody: string;
};

const REPORT: MeetingReport = {
  meetingId: "z-1041",
  title: "Launch sync · Mary Chen",
  startedAt: "10:00 AM",
  durationLabel: "28 min",
  participants: ["you", "Mary Chen"],
  talkTime: { you: 71, them: 29 },
  earned: [
    { treatId: "cake", speaker: "Mary", time: "03:14", quote: "When does QA finish their pass?" },
    { treatId: "cake", speaker: "Mary", time: "11:48", quote: "By when do you need legal sign-off?" },
    { treatId: "apple", speaker: "you", time: "06:02", quote: "Can you clarify what you mean by 'risk' here?" },
    { treatId: "star", speaker: "you", time: "21:30", quote: "I'll send you the migration risk doc by EOD." },
    { treatId: "candy", speaker: "you", time: "23:11", quote: "Tuesday works for both teams." },
    { treatId: "blueberry", speaker: "Mary", time: "26:40", quote: "Let's sync tomorrow morning to confirm." },
  ],
  missing: [
    {
      treatId: "apple",
      cue: "Mary asked twice whether Friday was realistic. You hedged both times instead of asking what she actually needed.",
    },
    {
      treatId: "gem",
      cue: "The auth-migration blocker stayed unnamed at the end of the call. No one explicitly resolved or owned it.",
    },
  ],
  observationHeadline: "Mary asked you 4 questions. You asked her 1.",
  observationBody:
    "When the meeting got tight, you stopped asking and started narrating. The treats you earned were good — but the empty bowls are where Mary needed you, and you weren't there.",
};

/* -------------------------------------------------------------------------- */
/*  The async coaching loop Synko builds from the report                      */
/* -------------------------------------------------------------------------- */

/** A weekly async goal Synko proposes based on a missing-treat pattern. */
type ProposedGoal = {
  id: string;
  treatId: TreatId;
  title: string;
  /** Plain-English commitment shown to the user. */
  commitment: string;
  /** What "doing this" looks like in Slack threads. */
  asyncTranslation: string;
  /** How the goal will be measured this week. */
  measure: string;
};

const PROPOSED_GOALS: ProposedGoal[] = [
  {
    id: "g-clarify",
    treatId: "apple",
    title: "Ask one 🍎 in long Slack threads.",
    commitment:
      "When a thread runs past 5 replies, ask a clarifying question before adding more.",
    asyncTranslation:
      "Synko will nudge you once when a thread crosses that line.",
    measure: "3 long threads this week.",
  },
  {
    id: "g-name-risk",
    treatId: "gem",
    title: "Name the risk in writing within 1 hour.",
    commitment:
      "After meetings with a blocker, post the risk in-channel within an hour.",
    asyncTranslation: "Synko will DM you 45 min after each meeting.",
    measure: "Every meeting this week.",
  },
];

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

type Stage = "inbox" | "review" | "goals" | "nudge" | "trend";

type State = {
  stage: Stage;
  selectedGoals: string[];
  /** Whether the user "ran with" the in-the-moment nudge (drives the trend). */
  nudgeAccepted: boolean;
};

type Action =
  | { type: "open" }
  | { type: "review" }
  | { type: "toggleGoal"; id: string }
  | { type: "commitGoals" }
  | { type: "actOnNudge" }
  | { type: "skipNudge" }
  | { type: "showTrend" }
  | { type: "reset" };

const INITIAL: State = {
  stage: "inbox",
  selectedGoals: [PROPOSED_GOALS[0].id, PROPOSED_GOALS[1].id],
  nudgeAccepted: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "open":
      return { ...state, stage: "inbox" };
    case "review":
      return { ...state, stage: "review" };
    case "toggleGoal": {
      const has = state.selectedGoals.includes(action.id);
      return {
        ...state,
        selectedGoals: has
          ? state.selectedGoals.filter((g) => g !== action.id)
          : [...state.selectedGoals, action.id],
      };
    }
    case "commitGoals":
      return { ...state, stage: "nudge" };
    case "actOnNudge":
      return { ...state, stage: "trend", nudgeAccepted: true };
    case "skipNudge":
      return { ...state, stage: "trend", nudgeAccepted: false };
    case "showTrend":
      return { ...state, stage: "trend" };
    case "reset":
      return INITIAL;
  }
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function ZoomToSlackPage() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const sidebarItems: Parameters<typeof Sidebar>[0]["items"] = [
    { id: "general", label: "general", kind: "channel" },
    { id: "marketing-launch", label: "marketing-launch", kind: "channel" },
    { id: "design", label: "design", kind: "channel" },
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

  let main: React.ReactNode = null;
  switch (state.stage) {
    case "inbox":
      main = <InboxScene onReview={() => dispatch({ type: "review" })} />;
      break;
    case "review":
      main = (
        <ReviewScene onNext={() => dispatch({ type: "commitGoals" })} />
      );
      break;
    case "goals":
      // (Reserved — currently rolled into "review" via the goals card.
      //  Kept in the union so the user can be deep-linked here later.)
      main = (
        <ReviewScene onNext={() => dispatch({ type: "commitGoals" })} />
      );
      break;
    case "nudge":
      main = (
        <NudgeScene
          state={state}
          onAct={() => dispatch({ type: "actOnNudge" })}
          onSkip={() => dispatch({ type: "skipNudge" })}
        />
      );
      break;
    case "trend":
      main = (
        <TrendScene
          state={state}
          onReset={() => dispatch({ type: "reset" })}
        />
      );
      break;
  }

  return (
    <SlackFrame
      sidebar={
        <Sidebar
          items={sidebarItems}
          activeId="synko"
          onReset={() => dispatch({ type: "reset" })}
        />
      }
    >
      <div className="flex-1 flex flex-col min-h-0">
        <FlowChips
          stage={state.stage}
          onJump={(s) => {
            if (s === "inbox") dispatch({ type: "open" });
            if (s === "review") dispatch({ type: "review" });
            if (s === "nudge") dispatch({ type: "commitGoals" });
            if (s === "trend") dispatch({ type: "showTrend" });
          }}
        />
        <div className="flex-1 min-h-0 flex">{main}</div>
      </div>
    </SlackFrame>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tiny breadcrumb so reviewers can jump between the four stages of the loop */
/* -------------------------------------------------------------------------- */

function FlowChips({
  stage,
  onJump,
}: {
  stage: Stage;
  onJump: (s: Stage) => void;
}) {
  const steps: { id: Stage; label: string }[] = [
    { id: "inbox", label: "1. Report lands" },
    { id: "review", label: "2. Review + goals" },
    { id: "nudge", label: "3. Async nudge" },
    { id: "trend", label: "4. Weekly trend" },
  ];
  return (
    <div className="border-b border-stone-200 bg-stone-50 px-4 py-2 flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-stone-500 mr-1">demo loop:</span>
      {steps.map((s) => {
        const active = s.id === stage || (stage === "goals" && s.id === "review");
        return (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              active
                ? "bg-stone-900 text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:border-stone-400"
            }`}
          >
            {s.label}
          </button>
        );
      })}
      <Link
        href="/tree"
        className="ml-auto text-xs text-stone-500 hover:text-stone-800"
      >
        → /tree
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stage 1 — Inbox: the DM card from Synko about the incoming report         */
/* -------------------------------------------------------------------------- */

function InboxScene({ onReview }: { onReview: () => void }) {
  const earnedSummary = countTreats(REPORT.earned.map((e) => e.treatId));
  const missingSummary = REPORT.missing.map((m) => TREAT_LIBRARY[m.treatId].emoji);

  const messages: FauxMessage[] = [
    {
      author: "Synko",
      avatar: { kind: "letter", letter: "P", color: "#FFB347" },
      time: "10:31 AM",
      body: `Your Meeting Pet just sent over the report from "${REPORT.title}". I read it.`,
      fromPet: true,
    },
  ];

  return (
    <DMPanel
      channelLabel="Synko"
      subline="Just you and Synko"
      messages={messages}
      composerOverlay={
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="h-7 w-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: "#2D8CFF" }}
            >
              Z
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-stone-800">
                Meeting Pet → Synko
              </div>
              <div className="text-xs text-stone-500">
                {REPORT.title} · {REPORT.durationLabel} · just now
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-wide rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5">
              report received
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-stone-500 mb-1">
                Treats earned
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(earnedSummary).map(([id, n]) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded bg-stone-100 px-1.5 py-0.5 text-xs"
                  >
                    <span className="text-base leading-none">
                      {TREAT_LIBRARY[id as TreatId].emoji}
                    </span>
                    <span className="text-stone-700">×{n}</span>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-stone-500 mb-1">
                Empty bowls
              </div>
              <div className="flex items-center gap-1.5 text-base">
                {missingSummary.map((e, i) => (
                  <span key={i} className="grayscale opacity-70">
                    {e}
                  </span>
                ))}
                <span className="text-xs text-stone-500 ml-1">
                  ({missingSummary.length} missing)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-md synko-warm p-3 text-sm text-stone-800">
            <span className="font-semibold">{PET.name}:</span>{" "}
            {REPORT.observationHeadline}
          </div>
        </div>
      }
      composer={
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-stone-500">
            Synko turns this report into async goals you can actually run on.
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-400"
            >
              Mute this meeting
            </button>
            <button
              onClick={onReview}
              className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 transition-colors"
            >
              Open the report
            </button>
          </div>
        </div>
      }
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Stage 2 — Review: full report, then proposed async goals                  */
/* -------------------------------------------------------------------------- */

function ReviewScene({ onNext }: { onNext: () => void }) {
  return (
    <section className="flex flex-1 flex-col bg-white min-w-0 min-h-0">
      <header className="border-b border-stone-200 px-5 py-3 shrink-0">
        <h2 className="font-semibold text-stone-900 text-base">
          Synko · Async coaching from your meeting
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          {REPORT.title} · {REPORT.startedAt} · {REPORT.durationLabel}
        </p>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6 space-y-6">
          <ReportFromExtension />
          <SyncToAsyncBridge />
          <GoalsCard onCommit={onNext} />
        </div>
      </div>
    </section>
  );
}

function ReportFromExtension() {
  const earnedByTreat = groupEarned(REPORT.earned);
  return (
    <div className="rounded-lg border border-stone-200">
      <div className="px-4 py-2.5 border-b border-stone-200 flex items-center gap-2">
        <div
          className="h-6 w-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
          style={{ background: "#2D8CFF" }}
        >
          Z
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Report from Meeting Pet (Zoom)
        </h3>
        <span className="ml-auto text-[10px] text-stone-500">
          talk-time {REPORT.talkTime.you}/{REPORT.talkTime.them}
        </span>
      </div>

      <ul className="divide-y divide-stone-100">
        {Object.entries(earnedByTreat).map(([id, items]) => {
          const treat = TREAT_LIBRARY[id as TreatId];
          return (
            <li key={id} className="px-4 py-3 flex items-start gap-3">
              <span className="text-2xl leading-none mt-0.5">{treat.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-stone-800">
                  {treat.name} ×{items.length}
                  <span className="ml-2 text-xs font-normal text-stone-500">
                    {treat.meaning}
                  </span>
                </div>
                <ul className="mt-1 space-y-1">
                  {items.map((m, i) => (
                    <li key={i} className="text-xs text-stone-600">
                      <span className="font-mono text-stone-400 mr-2">
                        {m.time}
                      </span>
                      <span className="font-medium text-stone-700">
                        {m.speaker}:
                      </span>{" "}
                      <span className="italic">{m.quote}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}

        {REPORT.missing.map((m, i) => {
          const treat = TREAT_LIBRARY[m.treatId];
          return (
            <li
              key={`missing-${i}`}
              className="px-4 py-3 flex items-start gap-3 bg-rose-50/40"
            >
              <span className="text-2xl leading-none mt-0.5 grayscale opacity-60">
                {treat.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-rose-800">
                  Empty bowl: {treat.name}
                </div>
                <p className="mt-1 text-xs text-stone-700">{m.cue}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Short bridge card — one line in the pet's voice. */
function SyncToAsyncBridge() {
  return (
    <div className="rounded-xl synko-warm p-4 flex items-center gap-3">
      <PixelPet pet={PET} size={44} animated={false} />
      <p className="text-sm text-stone-800">
        <span className="font-semibold">{PET.name}:</span>{" "}
        {REPORT.observationHeadline} Same shape shows up in your Slack
        threads — let{"’"}s work on it there.
      </p>
    </div>
  );
}

function GoalsCard({ onCommit }: { onCommit: () => void }) {
  return (
    <div className="rounded-lg border border-stone-200">
      <div className="px-4 py-2.5 border-b border-stone-200">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          This week{"’"}s goals
        </h3>
      </div>
      <ul className="divide-y divide-stone-100">
        {PROPOSED_GOALS.map((g) => {
          const treat = TREAT_LIBRARY[g.treatId];
          return (
            <li key={g.id} className="px-4 py-3 flex items-start gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="mt-1 h-4 w-4 rounded border-stone-300"
              />
              <span className="text-2xl leading-none">{treat.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-stone-900">
                  {g.title}
                </div>
                <p className="mt-0.5 text-xs text-stone-600">{g.commitment}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="px-4 py-3 border-t border-stone-200 flex justify-end">
        <button
          onClick={onCommit}
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 transition-colors"
        >
          Commit to this week
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stage 3 — Async nudge (loop closing)                                      */
/* -------------------------------------------------------------------------- */

function NudgeScene({
  state,
  onAct,
  onSkip,
}: {
  state: State;
  onAct: () => void;
  onSkip: () => void;
}) {
  const messages: FauxMessage[] = [
    {
      author: "Devon Park",
      avatar: { kind: "letter", letter: "D", color: "#0ea5e9" },
      time: "Wed 2:36 PM",
      body: "we've been on the launch copy for two days, can we land it?",
    },
  ];

  const SUGGESTION = "Devon — what does 'land it' look like for you today?";
  const INITIAL_DRAFT =
    "Ok let me lay out the tradeoffs as I see them: option one reads cleaner but option two has the comparison context we need…";

  const [draft, setDraft] = useState(INITIAL_DRAFT);

  void state;

  return (
    <DMPanel
      channelLabel="marketing-launch"
      isChannel
      subline="14 replies · 6 members"
      messages={messages}
      pet={PET}
      composerOverlay={
        <div className="synko-fade-in flex gap-3 items-start mb-2">
          <div
            className="rounded-md overflow-hidden p-0.5 synko-warm shrink-0"
            style={{ width: 36, height: 36 }}
          >
            <PixelPet pet={PET} size={32} animated={false} />
          </div>
          <div className="flex-1">
            <div className="text-xs text-stone-500 mb-1">
              🍎 Just for you. Not in the channel.
            </div>
            <div className="synko-warm rounded-xl px-4 py-3 text-stone-800 leading-relaxed text-sm">
              Same shape as your call with Mary. Try a clarifying question?
              <button
                onClick={() => setDraft(SUGGESTION)}
                className="ml-2 underline text-stone-700 hover:text-stone-900"
              >
                use this
              </button>
            </div>
          </div>
        </div>
      }
      composer={
        <div className="space-y-2">
          <div className="text-xs text-stone-500 italic">
            You{"’"}re typing a reply in #marketing-launch.
          </div>
          <div className="border border-stone-300 rounded-md focus-within:border-stone-500 transition-colors">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full px-3 py-2 outline-none resize-none bg-transparent text-stone-900 leading-relaxed text-sm"
              rows={4}
              placeholder="Message #marketing-launch…"
            />
            <div className="flex justify-between items-center px-2 pb-2">
              <button
                onClick={onSkip}
                className="text-xs text-stone-500 hover:text-stone-700"
              >
                dismiss suggestion
              </button>
              <button
                onClick={onAct}
                className="px-4 py-1.5 rounded bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Stage 4 — Trend digest (the loop made legible)                            */
/* -------------------------------------------------------------------------- */

function TrendScene({
  state,
  onReset,
}: {
  state: State;
  onReset: () => void;
}) {
  const accepted = state.nudgeAccepted;

  return (
    <section className="flex flex-1 flex-col bg-white min-w-0 min-h-0">
      <header className="border-b border-stone-200 px-5 py-3 shrink-0">
        <h2 className="font-semibold text-stone-900 text-base">
          Synko · Weekly check-in
        </h2>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-xl px-6 py-8 space-y-5">
          <div className="rounded-xl synko-warm p-4 flex items-center gap-3">
            <PixelPet pet={PET} size={48} animated={false} />
            <p className="text-sm text-stone-800">
              <span className="font-semibold">{PET.name}:</span>{" "}
              {accepted
                ? "you took the nudge on Wednesday. Devon answered in 4 minutes."
                : "you skipped the nudge — that's okay, the pattern just shifts slower."}
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 p-5">
            <div className="flex items-baseline justify-between mb-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Empty bowls this week
              </div>
              <span className="text-[10px] text-stone-400">
                across 4 meetings + 12 threads
              </span>
            </div>
            <p className="text-xs text-stone-500 mb-3 leading-relaxed">
              An <span className="font-semibold">empty bowl</span> is a moment
              where a treat could{"’"}ve been earned but wasn{"’"}t — a
              question Synko expected you to ask, an action item that didn
              {"’"}t get named. Fewer empty bowls = better follow-through.
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-emerald-700">9</span>
              <span className="text-sm text-stone-500 line-through">
                14 last week
              </span>
              <span className="text-xs text-emerald-700 font-semibold">
                ↓ 5
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link href="/tree" className="text-xs text-stone-500 underline">
              See it in the Grove →
            </Link>
            <button
              onClick={onReset}
              className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 transition-colors"
            >
              Replay loop
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function countTreats(ids: TreatId[]): Partial<Record<TreatId, number>> {
  const out: Partial<Record<TreatId, number>> = {};
  for (const id of ids) out[id] = (out[id] ?? 0) + 1;
  return out;
}

function groupEarned(earned: MeetingReport["earned"]) {
  const out: Partial<Record<TreatId, MeetingReport["earned"]>> = {};
  for (const e of earned) (out[e.treatId] ??= []).push(e);
  return out as Record<TreatId, MeetingReport["earned"]>;
}

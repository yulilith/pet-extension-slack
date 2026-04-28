/**
 * Pre-scripted message history for #proj-pomegranate.
 *
 * Sets the stage for the playtester walking into the channel mid-week, week 8
 * of the launch. The thread shows recent context — Mary's eval miss, Steve's
 * vague reply about copy, Alex's brand callout, Devon's silence, Priya's
 * hedging — every comm pattern Synko would coach is present somewhere here.
 */

import { TEAMMATES } from "./storyContext";

export type FauxChannelMessage = {
  authorId: string;
  time: string;
  body: string;
  /** Optional system tags — e.g. a "joined channel" notice instead of a real message. */
  kind?: "message" | "system";
};

const T = TEAMMATES;

export const PROJ_POMEGRANATE_HISTORY: FauxChannelMessage[] = [
  /* ── Earlier today: Mary surfaces an eval problem ─────────────────────── */
  {
    authorId: T.mary.id,
    time: "9:14 AM",
    body:
      "morning team — pulling together this week's eval numbers for the leadership review. headline: long-thread summarization accuracy is down 12% week-over-week. attribution looks like the longer-context inference path; we may be hitting context-window degradation on threads >300 messages. tagging @Devon to look at the inference pipeline.",
  },
  {
    authorId: T.devon.id,
    time: "9:32 AM",
    body: "looking",
  },

  /* ── Lesley pushes for clarity / coordinates ──────────────────────────── */
  {
    authorId: T.lesley.id,
    time: "10:02 AM",
    body:
      "team 👋 leadership review is Friday. let's all chip in here so I can pull together a status doc by EOD Wed. specifically I need:\n• Devon — status on the long-thread accuracy fix\n• Steve — copy review timeline (still in legal?)\n• Alex — final brand sign-off on the two flagged frames\n• Mary — eval cuts we want to highlight vs. cuts we want to suppress\nthanks all 🙏",
  },

  /* ── Steve replies vaguely (a Synko coaching target) ──────────────────── */
  {
    authorId: T.steve.id,
    time: "10:14 AM",
    body:
      "I'll handle the copy timeline ASAP, will keep you posted",
  },

  /* ── Alex direct, slightly curt (another coaching target) ─────────────── */
  {
    authorId: T.alex.id,
    time: "10:31 AM",
    body:
      "Brand team's flagged frames are not actually problems — they were misreading our color contrast. I'll tell them to drop it. Frames are fine.",
  },

  /* ── Priya hedges (third coaching target) ─────────────────────────────── */
  {
    authorId: T.priya.id,
    time: "10:48 AM",
    body:
      "@Devon do you maybe think it might be worth looping in the platform team on the context-window thing? just a thought, totally up to you, no pressure though, only if you think it'd be useful",
  },

  /* ── Devon stays mostly silent (fourth pattern) ───────────────────────── */
  {
    authorId: T.devon.id,
    time: "11:09 AM",
    body: "ok",
  },

  /* ── Mary jargon-dense (fifth pattern) ────────────────────────────────── */
  {
    authorId: T.mary.id,
    time: "11:24 AM",
    body:
      "for the leadership cuts: I'd suppress the BLEU-on-summarization metric — it's noisy, doesn't correlate well with our human-eval rubric, and in the GA window we want to lean on rouge-L plus the qualitative panel results since that's what mirrors what users actually feel. also might be worth flagging the 95th-percentile latency tail since that's the long-thread regression's downstream signature. ok with that?",
  },

  /* ── Lesley plays coordinator, slightly micromanaging (sixth pattern) ── */
  {
    authorId: T.lesley.id,
    time: "11:38 AM",
    body:
      "Mary thanks! @Steve can you reply to my question above? I asked at 10:02 — still need the copy timeline. @Alex, can you message brand directly with your point so we have a paper trail? @Devon, are you still investigating? Quick yes/no please.",
  },

  /* ── A brand-side message that hints at simmering tension ─────────────── */
  {
    authorId: T.alex.id,
    time: "11:44 AM",
    body: "messaging brand now",
  },

  /* ── A user-arrival hook — frames the playtester's entrance ───────────── */
  {
    authorId: T.lesley.id,
    time: "11:52 AM",
    body:
      "@You — welcome to the channel 👋 you're picking up the launch UX from here. catch up on the thread above when you can. let me know what you're starting with today.",
  },
];

/** Used by the channel header. */
export const PROJ_POMEGRANATE_TOPIC =
  "Smart Threads launch · VP review Friday · all hands on deck";

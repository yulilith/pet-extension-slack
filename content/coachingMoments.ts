/**
 * THE TWO COACHING MOMENTS — one DM with Mary, one channel post.
 *
 * Pet voice: 1-2 short sentences. Plain. Specific to the draft. No metaphor,
 * no aphorisms, no "I noticed" preface.
 */

import type { CoachingMoment } from "@/types";

const MOMENT_1_DRAFT = `Hey, quick flag: we might need 2-3 more days on the launch. The auth refactor is taking longer than expected and we didn't fully scope the migration story. Could probably figure it out though if you need it sooner. Let me know what works!`;

const moment1: CoachingMoment = {
  channel: {
    kind: "dm",
    name: "Mary Chen",
    avatarLetter: "M",
    avatarColor: "#7c3aed",
  },
  setup: "Mary asked if launch is still on track. You drafted a reply.",
  history: [
    {
      author: "Mary Chen",
      avatar: { kind: "letter", letter: "M", color: "#7c3aed" },
      time: "2:08 PM",
      body: "hey! quick check, are we still on track for the launch friday? 🙏",
    },
  ],
  draft: MOMENT_1_DRAFT,
  petFeedback: {
    lumio:
      "Timeline is up top. Good. 'Could probably figure it out' walks it back. Drop that line.",
    mossle:
      "You said why, not just what. Now ask Mary what she actually needs by Friday.",
    wisp:
      "The hard part is in there. Then 'could probably' walks it back. Drop it. Mary can take the firm version.",
    sprout:
      "You told her what's hard. Now ask what she needs from you. You're trying to do her job too.",
    ember:
      "Real timeline, named. 'Could probably figure it out though' is three softeners in one sentence. End with: 'What's the latest we can ship?'",
    river: "(placeholder)",
    "beaver-orange": "(placeholder)",
    "beaver-pink": "(placeholder)",
    "baby-capybara": "(placeholder)",
  },
};

const MOMENT_2_DRAFT = `hey team, quick update: design files are ~80% there. waiting on a few sign-offs from legal but i'll have the final exports by friday. let me know if anyone has Qs`;

const moment2: CoachingMoment = {
  channel: {
    kind: "channel",
    name: "marketing-launch",
  },
  setup:
    "4pm Wednesday. You're posting status in #marketing-launch. Eng, PM, marketing, legal will see it.",
  history: [
    {
      author: "Devon Park",
      avatar: { kind: "letter", letter: "D", color: "#0ea5e9" },
      time: "3:52 PM",
      body: "anyone have a status on the design assets? launch comms going out monday and we need them locked",
    },
  ],
  draft: MOMENT_2_DRAFT,
  petFeedback: {
    lumio:
      "Status, date, scannable. 'Let me know if anyone has Qs' is a question to no one. Tag who you actually need.",
    mossle:
      "You said what's not done. Now name which sign-offs and who. Tagging tends to unstick.",
    wisp:
      "'~80%' reads honest. Now name who you're waiting on. Same move, more useful.",
    sprout:
      "Posting works. 'Let me know if anyone has Qs' won't catch anyone. Tag the one person who can unblock you.",
    ember:
      "Clean status. Then a question pointed at no one. End with: 'Sarah, can you unblock the legal review by Wed?'",
    river: "(placeholder)",
    "beaver-orange": "(placeholder)",
    "beaver-pink": "(placeholder)",
    "baby-capybara": "(placeholder)",
  },
};

export const COACHING_MOMENTS: [CoachingMoment, CoachingMoment] = [moment1, moment2];

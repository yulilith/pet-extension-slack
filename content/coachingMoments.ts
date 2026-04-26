/**
 * THE TWO COACHING MOMENTS
 * ========================
 *
 * Each moment is a scripted scene where the user is "drafting" a Slack
 * message to a cross-functional teammate. The user's draft is pre-filled
 * in the composer. The pet appears with feedback above the composer.
 *
 * Pet voice rules (must hold for every petFeedback line):
 *   - No em-dashes. Use periods or commas.
 *   - No "I noticed…" preface. Just state the observation.
 *   - No writerly metaphors ("rounds off your edges", "feels like a
 *     partnership"). No aphoristic closings ("that's how good decisions
 *     get made", "that combination is rare").
 *   - No corporate-speak ("synergy", "alignment", "stakeholders").
 *   - 1–3 sentences, short ones welcome.
 *   - Specific to *this draft*. Quote the actual phrase or name a move.
 *   - Don't perform warmth. Just be plain.
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
  setup:
    "Mary (PM) just asked you for an update on the launch. You've drafted a reply.",
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
      "You put the timeline up top instead of burying it. That's the part Mary needs. Then 'could probably figure it out though' walks the same sentence back.",
    mossle:
      "You said why, not just what. Worth asking Mary one thing back: does she even need it Friday? You don't have to answer that for her.",
    wisp:
      "'We didn't fully scope the migration story' is the harder version of that sentence. Most people round it. Then 'could probably figure it out though' walks it back. Try the firmer version. She can take it.",
    sprout:
      "You told her what's hard. That's most of the work. Now ask what she needs from you to make a call. Right now you're trying to do her job and yours.",
    ember:
      "Real timeline, named. Good. 'Could probably figure it out though if you need it sooner' is three softeners in one sentence. End with the question: 'What's the latest we can ship?'",
  },
};

const MOMENT_2_DRAFT = `hey team, quick update: design files are ~80% there. waiting on a few sign-offs from legal but i'll have the final exports by friday. let me know if anyone has Qs`;

const moment2: CoachingMoment = {
  channel: {
    kind: "channel",
    name: "marketing-launch",
  },
  setup:
    "It's 4pm Wednesday. You're about to post a status update in #marketing-launch. Eng, PM, marketing, and legal will all see it.",
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
      "Status, date, scannable. People in this channel can read this in two seconds. '~80%' reads honest. The 'let me know if anyone has Qs' is a question to no one. Tag the one or two people whose answer actually matters.",
    mossle:
      "You said what's not done instead of pretending. Worth saying which sign-offs. Naming a person tends to unstick things faster than waiting for them to see a channel post.",
    wisp:
      "'~80%' reads honest. Most people would write 'almost done' even if it isn't. 'Waiting on a few sign-offs from legal' is also true and also vague. Naming who is the same move, scaled up.",
    sprout:
      "Posting in the channel works. 'Let me know if anyone has Qs' is too open to actually catch anyone. Is there one person whose reply would unblock you? Pull them in by name.",
    ember:
      "Status, date, caveat. Clean. Then 'let me know if anyone has Qs' which is a question pointed at no one and answered by no one. End with what you want: 'Sarah, can you unblock the legal review by Wed?'",
  },
};

export const COACHING_MOMENTS: [CoachingMoment, CoachingMoment] = [moment1, moment2];

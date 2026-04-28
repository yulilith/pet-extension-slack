/**
 * FLOATING PET NEEDS
 * ==================
 *
 * Each need starts as a creature need, then maps to a concrete Slack move.
 *
 * Voice rules:
 *   - No em-dashes.
 *   - No "I noticed" preface.
 *   - No coachy closings.
 *   - 1-3 sentences, usually shorter.
 *   - Specific to the message or channel context.
 */

import type { PetNeed } from "@/types";

export const PET_NEEDS: PetNeed[] = [
  {
    id: "hungry",
    label: "Hungry",
    petLine: "I'm hungry. Send Chan a status update with the date up top.",
    actionLabel: "Feed me",
    placeholder: "Write the status update to Chan...",
    draftingLine:
      "Put the date where Chan can see it. If someone owns the blocker, name them.",
    channel: { kind: "channel", name: "project-x" },
    setup:
      "Chan asked whether launch assets are still on track. You have one open legal review.",
    history: [
      {
        author: "Chan",
        avatar: { kind: "letter", letter: "C", color: "#d97706" },
        time: "4:49 PM",
        body: "Let's sync on Tuesday.",
      },
      {
        author: "Tiny Malviya",
        avatar: { kind: "letter", letter: "T", color: "#92400e" },
        time: "4:49 PM",
        body: "Who is the POC for xxx?",
      },
    ],
    afterSendLine:
      "Friday 3 PM gives Chan something to plan around. Naming Sarah turns the wait into an ask.",
  },
  {
    id: "lonely",
    label: "Lonely",
    petLine: "I'm lonely. Ask Priya the question you're working around.",
    actionLabel: "Play with me",
    placeholder: "Ask Priya for the help you actually need...",
    draftingLine:
      "Give Priya the two options. A real question is easier to answer than a vague check-in.",
    channel: {
      kind: "dm",
      name: "Priya Shah",
      avatarLetter: "P",
      avatarColor: "#0f766e",
    },
    setup:
      "You are stuck choosing between two onboarding flows. Priya has the research notes.",
    history: [
      {
        author: "Priya Shah",
        avatar: { kind: "letter", letter: "P", color: "#0f766e" },
        time: "11:18 AM",
        body: "send me the two options when you have them and I can sanity check",
      },
    ],
    afterSendLine:
      "That is a real question. You gave Priya the two options instead of making her guess what help means.",
  },
  {
    id: "wobbly",
    label: "Wobbly",
    petLine: "I'm wobbly. Tell Mary the launch needs two more days.",
    actionLabel: "Steady me",
    placeholder: "Tell Mary where the launch stands...",
    draftingLine:
      "Say the timeline first. Then say why. Do not hide the ask inside extra context.",
    channel: {
      kind: "dm",
      name: "Mary Chen",
      avatarLetter: "M",
      avatarColor: "#7c3aed",
    },
    setup:
      "Mary asked whether Friday still works. The auth migration is not ready.",
    history: [
      {
        author: "Mary Chen",
        avatar: { kind: "letter", letter: "M", color: "#7c3aed" },
        time: "2:08 PM",
        body: "hey! quick check, are we still on track for the launch friday?",
      },
    ],
    afterSendLine:
      "You did not hide the risk inside context. The ask is clear: move to Tuesday.",
  },
  {
    id: "restless",
    label: "Restless",
    petLine: "I'm restless. Pick the next step and name who owns it.",
    actionLabel: "Settle me",
    placeholder: "Name the next step and owner...",
    draftingLine:
      "This thread needs an owner and a check point. Put both in the message.",
    channel: { kind: "channel", name: "project-x" },
    setup:
      "The channel has three loose updates and no owner for the announcement copy.",
    history: [
      {
        author: "Mary Heer",
        avatar: { kind: "letter", letter: "M", color: "#64748b" },
        time: "2:49 PM",
        body: "Just updated the user journey on Figma!",
      },
      {
        author: "robnilas",
        avatar: { kind: "letter", letter: "R", color: "#111827" },
        time: "4:49 PM",
        body: "Just pushed new feature to prod",
      },
    ],
    afterSendLine:
      "Devon owns the draft, Thursday 2 PM is the check point. The thread has somewhere to go now.",
  },
];

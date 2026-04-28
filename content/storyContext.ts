/**
 * THE STORY
 * =========
 * Synko playtest scenario — a fictional Q3 launch at a fictional FAANG-scale
 * tech company. Rich enough that the slash-command demos feel grounded.
 *
 * Continuity note: the names Lesley / Steve / Alex are kept from the original
 * meeting-pet-v2 scripts so anything Annie's repo says about them still reads
 * as the same people.
 */

export const COMPANY = {
  name: "Helix",
  description:
    "A fictional large tech company. Helix Messenger is its consumer chat app — the launch is for a new AI feature inside it.",
};

export const PROJECT = {
  codename: "Pomegranate",
  channel: "proj-pomegranate",
  publicName: "Smart Threads",
  oneLine: "AI-powered thread summarization in Helix Messenger.",
  goal:
    "Ship Smart Threads with a confident, well-coordinated launch — no last-minute scrambles, no rollback.",
  context:
    "VP-sponsored cross-functional launch. First major AI feature in Helix Messenger this year. Leadership is watching closely. Comms surfaces include a marketing site update, a press blog post, and a launch video.",
  deadline: "Tuesday, July 14, 2026",
  weekOfPlaytest: "Week 8 of 12 — into the crunch period.",
};

export type Teammate = {
  id: string;
  name: string;
  shortName: string;
  role: string;
  avatarLetter: string;
  avatarColor: string;
  /** How they tend to communicate — useful for the pet's coaching framing. */
  commPattern: string;
  /** A specific habit Synko would coach them on. */
  growthEdge: string;
};

export const TEAMMATES: Record<string, Teammate> = {
  lesley: {
    id: "lesley",
    name: "Lesley Chen",
    shortName: "Lesley",
    role: "Senior Product Manager · launch lead",
    avatarLetter: "L",
    avatarColor: "#7c3aed",
    commPattern:
      "Coordinator. Often plays peacekeeper between functions. Long messages with many @-mentions.",
    growthEdge:
      "Tendency to over-coordinate — sometimes adds friction by re-routing messages instead of letting people work directly.",
  },
  steve: {
    id: "steve",
    name: "Steve Patel",
    shortName: "Steve",
    role: "Marketing Manager · launch comms",
    avatarLetter: "S",
    avatarColor: "#ecb22e",
    commPattern:
      "Detail-oriented but writes hedge-y. Lots of 'asap', 'I'll handle it', 'soon as possible'. Avoids hard commitments in writing.",
    growthEdge:
      "Vague commitments. Synko's home-run coaching target.",
  },
  alex: {
    id: "alex",
    name: "Alex Rivera",
    shortName: "Alex",
    role: "Design Lead · brand & launch creative",
    avatarLetter: "A",
    avatarColor: "#2bac76",
    commPattern:
      "Direct. Sometimes lands harsh in writing without intending to — what reads as warm in person reads as curt in Slack.",
    growthEdge:
      "Softening directness without losing it. Saying the firm thing kindly.",
  },
  devon: {
    id: "devon",
    name: "Devon Park",
    shortName: "Devon",
    role: "Engineering Lead · Smart Threads model integration",
    avatarLetter: "D",
    avatarColor: "#0ea5e9",
    commPattern:
      "Heads-down operator. Goes silent for long stretches. Doesn't ping for help when stuck — re-emerges when the deadline is in danger.",
    growthEdge:
      "Speaking up before grinding solo. Asking sooner.",
  },
  mary: {
    id: "mary",
    name: "Mary Liu",
    shortName: "Mary",
    role: "Data Scientist · model evaluation & metrics",
    avatarLetter: "M",
    avatarColor: "#e01e5a",
    commPattern:
      "Precise but jargon-dense. Uses ML terminology that the marketing and design folks don't fully parse, then is confused when the team makes scope decisions she'd have flagged.",
    growthEdge:
      "Translating jargon. Saying the technical thing in human language.",
  },
  priya: {
    id: "priya",
    name: "Priya Anand",
    shortName: "Priya",
    role: "Engineering Manager · oversees Devon's team",
    avatarLetter: "P",
    avatarColor: "#FF8040",
    commPattern:
      "Asks great clarifying questions in meetings, but defers too much in writing — softens her recommendations into questions until they lose their force.",
    growthEdge:
      "Saying what she actually thinks. Less hedging in writing.",
  },
};

export const TEAM_LIST: Teammate[] = Object.values(TEAMMATES);

/** The user's character — they play themselves but with a defined role on the team. */
export const YOU = {
  id: "you",
  name: "You",
  shortName: "You",
  role: "Product Designer · launch UX",
  avatarLetter: "Y",
  avatarColor: "#1264a3",
  joined: "Joined the team for this launch — newer than Lesley, Steve, Alex, Devon, Mary, Priya.",
};

export const CHANNELS = [
  { id: "proj-pomegranate", label: "proj-pomegranate", topic: PROJECT.oneLine, isPrimary: true },
  { id: "general", label: "general", topic: "Helix-wide announcements" },
  { id: "design-launch", label: "design-launch", topic: "Launch creative + brand" },
  { id: "eng-smart-threads", label: "eng-smart-threads", topic: "Engineering for Smart Threads" },
  { id: "data-launch", label: "data-launch", topic: "Metrics, eval, launch dashboards" },
];

export const STORY_BEATS = [
  "Lesley kicked off Pomegranate eight weeks ago with leadership buy-in.",
  "Mary's eval results last week showed 12% lower summarization accuracy for long threads — Devon's been heads-down trying to fix it.",
  "Marketing copy is in review with Legal — Steve is the bottleneck and has been vague about timing.",
  "Alex's launch video storyboard was approved Wednesday but the brand team flagged two frames yesterday.",
  "VP review is next Friday. Whatever isn't ready by then probably gets cut from the launch.",
];

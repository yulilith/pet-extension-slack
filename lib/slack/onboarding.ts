/**
 * Channel onboarding: helps the user pick which channels Pando should join.
 *
 * Flow:
 *   1. List the user's public channels via users.conversations
 *   2. Filter out channels Pando is already in
 *   3. Score each by name pattern + member count to guess "likely project channel"
 *   4. Render a modal with checkboxes, top 10 by score, with the likely-project
 *      ones pre-checked
 *   5. On submit, call conversations.join for each selected channel
 *   6. DM the user a summary + a reminder about private channels
 *
 * Slack constraints worth knowing:
 *   - `checkboxes` block elements are limited to 10 options. We hard-cap.
 *   - Bots can only auto-join *public* channels (channels:join scope).
 *     Private channels still need a manual /invite.
 *   - When the bot joins, every channel member sees a "Pando has joined"
 *     system message — there's no ghost mode.
 */

import type { View } from "@slack/web-api";
import { getSlackClient } from "@/lib/slack/client";

/** Names that look like cross-functional/project channels. */
const PROJECT_PATTERNS: RegExp[] = [
  /^proj-/i,
  /^project-/i,
  /^eng-/i,
  /^design-/i,
  /^marketing-/i,
  /^launch/i,
  /^team-/i,
  /^squad-/i,
  /^crew-/i,
  /-launch$/i,
  /-eng$/i,
  /-design$/i,
];

/** Names that almost certainly aren't project channels. */
const SKIP_PATTERNS: RegExp[] = [
  /^random$/i,
  /^general$/i,
  /^lounge$/i,
  /^watercooler$/i,
  /^social$/i,
  /^chat$/i,
  /^memes?$/i,
  /^dogs/i,
  /^cats/i,
  /^food$/i,
  /^announcements$/i,
];

const SUSPECT_MEMBER_MIN = 3;
const SUSPECT_MEMBER_MAX = 25;

export type ChannelCandidate = {
  id: string;
  name: string;
  members: number;
  /** True if our heuristics say this looks like a project channel. */
  isLikelyProject: boolean;
};

/** Decide if a channel looks like one Pando should default to joining. */
function isLikelyProject(name: string, members: number): boolean {
  if (SKIP_PATTERNS.some((re) => re.test(name))) return false;
  if (PROJECT_PATTERNS.some((re) => re.test(name))) return true;
  return members >= SUSPECT_MEMBER_MIN && members <= SUSPECT_MEMBER_MAX;
}

/**
 * Returns up to ~50 of the user's public channels that Pando is *not*
 * already a member of, scored and sorted (likely-project first).
 */
export async function listJoinableChannels(
  userId: string,
): Promise<ChannelCandidate[]> {
  const slack = getSlackClient();

  const res = await slack.users.conversations({
    user: userId,
    types: "public_channel",
    exclude_archived: true,
    limit: 200,
  });

  // The SDK's Channel type is conservative; a few fields we want
  // (`is_member`, `num_members`) are returned by Slack but not in the typedef.
  // Re-shape with our own minimal type.
  type SlackChannel = {
    id?: string;
    name?: string;
    is_member?: boolean;
    num_members?: number;
  };
  const channels = (res.channels ?? []) as SlackChannel[];

  const candidates: ChannelCandidate[] = channels
    .filter((c) => c.is_member !== true) // skip ones Pando is already in
    .filter((c): c is SlackChannel & { id: string; name: string } => !!c.id && !!c.name)
    .map((c) => {
      const members = c.num_members ?? 0;
      return {
        id: c.id,
        name: c.name,
        members,
        isLikelyProject: isLikelyProject(c.name, members),
      };
    });

  // Sort: likely-project first, then by member count ascending (smaller =
  // more likely to be a working group).
  candidates.sort((a, b) => {
    if (a.isLikelyProject !== b.isLikelyProject) {
      return a.isLikelyProject ? -1 : 1;
    }
    return a.members - b.members;
  });

  return candidates.slice(0, 50);
}

/* -------------------------------------------------------------------------- */
/*  Modal view                                                                */
/* -------------------------------------------------------------------------- */

export const PICKER_CALLBACK_ID = "channel_picker";
export const PICKER_BLOCK_ID = "channel_select";
export const PICKER_ACTION_ID = "picked_channels";

/**
 * Build the picker modal. Slack's `checkboxes` element caps at 10 options,
 * so we render up to 10 channels (the top of the sorted candidate list).
 */
export function channelPickerView(candidates: ChannelCandidate[]): View {
  const top = candidates.slice(0, 10);

  if (top.length === 0) {
    return {
      type: "modal",
      callback_id: PICKER_CALLBACK_ID,
      title: { type: "plain_text", text: "Add me to channels" },
      close: { type: "plain_text", text: "Close" },
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "I'm already in every public channel you're in (or you don't have any). Nothing to do here.",
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "For private channels, type `/invite @Pando` in each.",
            },
          ],
        },
      ],
    };
  }

  const options = top.map((c) => ({
    text: { type: "plain_text" as const, text: `#${c.name}` },
    description: {
      type: "plain_text" as const,
      text: `${c.members} member${c.members === 1 ? "" : "s"}${c.isLikelyProject ? " · likely project" : ""}`,
    },
    value: c.id,
  }));

  const initialOptions = options.filter((opt) => {
    const c = top.find((x) => x.id === opt.value);
    return c?.isLikelyProject ?? false;
  });

  return {
    type: "modal",
    callback_id: PICKER_CALLBACK_ID,
    title: { type: "plain_text", text: "Add me to channels" },
    submit: { type: "plain_text", text: "Join selected" },
    close: { type: "plain_text", text: "Cancel" },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Pick the channels where I should hang out. Your teammates will see I joined — there's no quiet mode for Slack apps.",
        },
      },
      {
        type: "input",
        block_id: PICKER_BLOCK_ID,
        optional: true,
        label: { type: "plain_text", text: "Channels" },
        element: {
          type: "checkboxes",
          action_id: PICKER_ACTION_ID,
          options,
          ...(initialOptions.length > 0 ? { initial_options: initialOptions } : {}),
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "For private channels, type `/invite @Pando` in each. I can't auto-join those.",
          },
        ],
      },
    ],
  };
}

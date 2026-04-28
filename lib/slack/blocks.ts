/**
 * Block Kit message + view builders for the demo flow inside Slack.
 *
 * Three kinds of output here:
 *   - chat blocks  (KnownBlock[]) for chat.postMessage / chat.update
 *   - modal view   (object) for views.open / views.update — the hatch popup
 *   - home view    (object) for views.publish — the App Home tab
 *
 * Pet sprites are rendered server-side as SVG by /api/sprites/[species]/route.ts
 * and pulled into Slack via image blocks. URLs are absolute so Slack can fetch
 * them from the public internet (SYNKO_PUBLIC_URL → ngrok or Vercel).
 */

import type { KnownBlock, View } from "@slack/web-api";
import { COACHING_MOMENTS } from "@/content/coachingMoments";
import { COPY } from "@/content/copy";
import { INTENTIONS } from "@/content/intentions";
import { OBSERVATIONS } from "@/content/observations";
import { PETS_BY_ID } from "@/content/pets";
import { REFLECTIONS } from "@/content/reflections";
import { getPublicBaseUrl } from "@/lib/slack/client";
import type { SlackFlowState } from "@/lib/slack/state";
import type { CoachingMoment, PetSpecies, SpeciesId } from "@/types";

/* -------------------------------------------------------------------------- */
/*  Action ids — the source of truth for interaction routing.                 */
/* -------------------------------------------------------------------------- */
export const ACTIONS = {
  introAdvance: "intro_advance",
  analysisAdvance: "analysis_advance",
  intentionsToggle: "intentions_toggle",
  intentionsSubmit: "intentions_submit",
  hatchingAdvance: "hatching_advance",
  coaching1Send: "coaching1_send",
  coaching2Send: "coaching2_send",
  reflectionDone: "reflection_done",
  endReset: "end_reset",
  homeStartSession: "home_start_session",
  homeOpenChannelPicker: "home_open_channel_picker",
} as const;

/* -------------------------------------------------------------------------- */
/*  Image URL helpers                                                         */
/* -------------------------------------------------------------------------- */

export function petImageUrl(speciesId: SpeciesId): string {
  // Pet images are static assets in /public/sprites — see PetSpecies.spriteFile.
  // We point Slack image blocks directly at them; no API route involved.
  const pet = PETS_BY_ID[speciesId];
  return `${getPublicBaseUrl()}/sprites/${pet.spriteFile}`;
}

export function eggImageUrl(): string {
  // The egg is still generated server-side (no static asset for it yet).
  return `${getPublicBaseUrl()}/api/sprites/egg`;
}

/* -------------------------------------------------------------------------- */
/*  STAGE BLOCKS — for messages in the Synko DM                               */
/* -------------------------------------------------------------------------- */

export function introBlocks(): KnownBlock[] {
  return [
    {
      type: "header",
      text: { type: "plain_text", text: "Hi. I'm Synko." },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: COPY.intro.greeting.replace(/^Hi\. I'm Synko\.\n\n/, ""),
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: COPY.intro.beginButton },
          action_id: ACTIONS.introAdvance,
          style: "primary",
        },
      ],
    },
  ];
}

export function analysisBlocks(): KnownBlock[] {
  const blocks: KnownBlock[] = [
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: `*${COPY.analysis.leadIn}*` }],
    },
    { type: "divider" },
  ];

  for (const obs of OBSERVATIONS) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `${iconFor(obs.kind)}  ${obs.text}` },
    });
  }

  blocks.push({ type: "divider" });
  blocks.push({
    type: "section",
    text: { type: "mrkdwn", text: COPY.analysis.closing },
  });
  blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        text: { type: "plain_text", text: COPY.analysis.nextButton },
        action_id: ACTIONS.analysisAdvance,
        style: "primary",
      },
    ],
  });

  return blocks;
}

export function intentionsBlocks(selected: string[]): KnownBlock[] {
  const allOptions = INTENTIONS.map((intent) => ({
    text: { type: "plain_text" as const, text: intent.label },
    description: { type: "plain_text" as const, text: intent.description },
    value: intent.id,
  }));
  const initialOptions = allOptions.filter((opt) => selected.includes(opt.value));

  const submitDisabled = selected.length === 0;
  const submitLabel = submitDisabled
    ? COPY.intentions.submitButton
    : `${COPY.intentions.submitButton} (${selected.length})`;

  const orderLine =
    selected.length > 0
      ? selected
          .map((id, i) => {
            const intent = INTENTIONS.find((x) => x.id === id);
            return `${i + 1}. ${intent?.label ?? id}${i === 0 ? "  *(primary)*" : ""}`;
          })
          .join("\n")
      : "_(none picked yet)_";

  return [
    {
      type: "header",
      text: { type: "plain_text", text: COPY.intentions.headline },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: COPY.intentions.sub },
    },
    {
      type: "actions",
      elements: [
        {
          type: "checkboxes",
          options: allOptions,
          ...(initialOptions.length > 0 ? { initial_options: initialOptions } : {}),
          action_id: ACTIONS.intentionsToggle,
        },
      ],
    },
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: orderLine }],
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: submitLabel },
          action_id: ACTIONS.intentionsSubmit,
          style: submitDisabled ? undefined : "primary",
        },
      ],
    },
  ];
}

/** Brief "egg appears in the DM" placeholder, shown while the modal also runs. */
export function hatchingPreBlocks(): KnownBlock[] {
  return [
    {
      type: "image",
      image_url: eggImageUrl(),
      alt_text: "A speckled egg",
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*${COPY.hatching.pre}*` },
    },
  ];
}

export function hatchingRevealBlocks(pet: PetSpecies): KnownBlock[] {
  return [
    {
      type: "image",
      image_url: petImageUrl(pet.id),
      alt_text: `${pet.name} sprite`,
    },
    {
      type: "header",
      text: { type: "plain_text", text: pet.name },
    },
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: `_${pet.tagline}_` }],
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: pet.intro },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Say hi back" },
          action_id: ACTIONS.hatchingAdvance,
          style: "primary",
        },
      ],
    },
  ];
}

export function coachingBlocks(
  moment: CoachingMoment,
  pet: PetSpecies,
  sendActionId: string,
): KnownBlock[] {
  const channelLabel =
    moment.channel.kind === "channel"
      ? `#${moment.channel.name}`
      : moment.channel.name;

  const historyLines = moment.history
    .map((m) => `> *${m.author}*  _${m.time}_\n> ${m.body}`)
    .join("\n\n");

  const draftQuoted = moment.draft
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");

  return [
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: `*Scene:* ${channelLabel}` }],
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: moment.setup },
    },
    { type: "divider" },
    {
      type: "section",
      text: { type: "mrkdwn", text: historyLines },
    },
    { type: "divider" },
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: "*Your draft:*" }],
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: draftQuoted },
    },
    { type: "divider" },
    // Pet identity row — tiny pet sprite next to the bubble hint.
    {
      type: "context",
      elements: [
        {
          type: "image",
          image_url: petImageUrl(pet.id),
          alt_text: pet.name,
        },
        {
          type: "mrkdwn",
          text: `*${pet.name}*  ·  ${COPY.coaching.petBubbleHint}`,
        },
      ],
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: moment.petFeedback[pet.id] },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: COPY.coaching.sendLabel },
          action_id: sendActionId,
          style: "primary",
        },
      ],
    },
  ];
}

export function reflectionBlocks(pet: PetSpecies): KnownBlock[] {
  const r = REFLECTIONS[pet.id];
  return [
    {
      type: "header",
      text: { type: "plain_text", text: COPY.reflection.leadIn },
    },
    {
      type: "context",
      elements: [
        {
          type: "image",
          image_url: petImageUrl(pet.id),
          alt_text: pet.name,
        },
        { type: "mrkdwn", text: `*${pet.name}*` },
      ],
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: r.affirmation },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: r.invitation },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Goodnight" },
          action_id: ACTIONS.reflectionDone,
        },
      ],
    },
  ];
}

export function endBlocks(pet: PetSpecies): KnownBlock[] {
  return [
    {
      type: "header",
      text: { type: "plain_text", text: COPY.end.headline },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: COPY.end.body },
    },
    {
      type: "context",
      elements: [
        {
          type: "image",
          image_url: petImageUrl(pet.id),
          alt_text: pet.name,
        },
        { type: "mrkdwn", text: `*${pet.name}*` },
      ],
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: COPY.end.resetButton },
          action_id: ACTIONS.endReset,
        },
      ],
    },
  ];
}

/* -------------------------------------------------------------------------- */
/*  MODAL VIEWS — the hatch popup                                             */
/* -------------------------------------------------------------------------- */

/** Modal shown immediately when user clicks Hatch. Egg image, no buttons. */
export function hatchingModalEggView(): View {
  return {
    type: "modal",
    title: { type: "plain_text", text: "Hatching" },
    close: { type: "plain_text", text: "Close" },
    blocks: [
      {
        type: "image",
        image_url: eggImageUrl(),
        alt_text: "A speckled egg",
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*${COPY.hatching.pre}*` },
      },
    ],
  };
}

/** Modal updated after the pause. Shows the revealed pet. */
export function hatchingModalRevealView(pet: PetSpecies): View {
  return {
    type: "modal",
    title: { type: "plain_text", text: pet.name },
    close: { type: "plain_text", text: "Close" },
    blocks: [
      {
        type: "image",
        image_url: petImageUrl(pet.id),
        alt_text: `${pet.name} sprite`,
      },
      {
        type: "header",
        text: { type: "plain_text", text: pet.name },
      },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: `_${pet.tagline}_` }],
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: pet.intro },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "_Close this and head back to the DM to keep going._",
          },
        ],
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*  APP HOME VIEW — the persistent pet space                                  */
/* -------------------------------------------------------------------------- */

/**
 * The pet's home tab, rendered for `views.publish`.
 * If the user hasn't hatched a pet yet, shows a welcome card pointing them
 * at /synko-demo. Otherwise shows pet identity + intentions + last reflection.
 */
export function homeView(state: SlackFlowState): View {
  const pet = state.speciesId ? PETS_BY_ID[state.speciesId] : null;

  if (!pet) {
    return {
      type: "home",
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "Hi. I'm Synko." },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "I haven't met your pet yet. Type `/synko-demo` anywhere in this workspace to start.",
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Add me to your channels" },
              action_id: ACTIONS.homeOpenChannelPicker,
            },
          ],
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "_Once your pet hatches, this is where they'll live._",
            },
          ],
        },
      ],
    };
  }

  const reflection = REFLECTIONS[pet.id];

  // Selected intentions, with primary marked.
  const intentionLines =
    state.intentions.length > 0
      ? state.intentions
          .map((id, i) => {
            const intent = INTENTIONS.find((x) => x.id === id);
            const label = intent?.label ?? id;
            return i === 0 ? `• *${label}*  _(primary)_` : `• ${label}`;
          })
          .join("\n")
      : "_(no intentions saved yet)_";

  return {
    type: "home",
    blocks: [
      {
        type: "image",
        image_url: petImageUrl(pet.id),
        alt_text: `${pet.name} sprite`,
      },
      {
        type: "header",
        text: { type: "plain_text", text: pet.name },
      },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: `_${pet.tagline}_` }],
      },
      { type: "divider" },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*What you're working on*\n${intentionLines}` },
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Latest from ${pet.name}*\n${reflection.affirmation}\n\n${reflection.invitation}`,
        },
      },
      { type: "divider" },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Start a new session" },
            action_id: ACTIONS.homeStartSession,
            style: "primary",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Add me to your channels" },
            action_id: ACTIONS.homeOpenChannelPicker,
          },
        ],
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function iconFor(kind: "positive" | "noticing" | "neutral"): string {
  switch (kind) {
    case "positive":
      return "✨";
    case "noticing":
      return "👀";
    case "neutral":
      return "🔹";
  }
}

/** Convenience re-export so consumers don't need to re-import PETS_BY_ID. */
export { PETS_BY_ID };

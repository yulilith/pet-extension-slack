/**
 * Block Kit message builders for the demo flow inside Slack.
 *
 * Each builder returns the `blocks` array for `chat.postMessage`. We reuse
 * content from /content (intentions, observations, coachingMoments, etc.)
 * so the bot stays voice-consistent with the web demo.
 *
 * Pixel-pet sprites don't render in Slack (no arbitrary HTML/CSS). Instead
 * we use an emoji proxy per species for ambient identity. Generating real
 * sprite PNGs server-side and uploading them as files is a future iteration.
 */

import type { KnownBlock } from "@slack/web-api";
import { COACHING_MOMENTS } from "@/content/coachingMoments";
import { COPY } from "@/content/copy";
import { INTENTIONS } from "@/content/intentions";
import { OBSERVATIONS } from "@/content/observations";
import { PETS_BY_ID } from "@/content/pets";
import { REFLECTIONS } from "@/content/reflections";
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
} as const;

export const PET_EMOJI: Record<SpeciesId, string> = {
  lumio: "✨",
  mossle: "🌿",
  wisp: "💨",
  sprout: "🌱",
  ember: "🔥",
};

/* -------------------------------------------------------------------------- */
/*  STAGE BLOCKS                                                              */
/* -------------------------------------------------------------------------- */

export function introBlocks(): KnownBlock[] {
  return [
    {
      type: "header",
      text: { type: "plain_text", text: "Hi. I'm Pando." },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: COPY.intro.greeting.replace(/^Hi\. I'm Pando\.\n\n/, "") },
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
  // Slack checkboxes can pre-fill a current selection via `initial_options`.
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

  // Show the selection order under the checkboxes so the user understands
  // which one is treated as primary.
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

export function hatchingPreBlocks(): KnownBlock[] {
  return [
    {
      type: "section",
      text: { type: "mrkdwn", text: `🥚  *${COPY.hatching.pre}*` },
    },
  ];
}

export function hatchingRevealBlocks(pet: PetSpecies): KnownBlock[] {
  const emoji = PET_EMOJI[pet.id];
  return [
    {
      type: "header",
      text: { type: "plain_text", text: `${emoji} ${pet.name}` },
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
  const emoji = PET_EMOJI[pet.id];
  const channelLabel =
    moment.channel.kind === "channel"
      ? `#${moment.channel.name}`
      : moment.channel.name;

  // Render the conversation history as quoted message previews.
  const historyLines = moment.history
    .map((m) => `> *${m.author}*  _${m.time}_\n> ${m.body}`)
    .join("\n\n");

  // The "draft" rendered as a blockquote so it visually reads as the
  // user's pre-typed message.
  const draftQuoted = moment.draft
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");

  return [
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `*Scene:* ${channelLabel}` },
      ],
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
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `${emoji}  *${pet.name}* — ${COPY.coaching.petBubbleHint}` },
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
  const emoji = PET_EMOJI[pet.id];
  return [
    {
      type: "header",
      text: { type: "plain_text", text: COPY.reflection.leadIn },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `${emoji}  ${r.affirmation}` },
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
  const emoji = PET_EMOJI[pet.id];
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
      elements: [{ type: "mrkdwn", text: `${emoji} ${pet.name}` }],
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

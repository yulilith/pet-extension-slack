/**
 * Interactivity webhook: POST /api/slack/interactions
 *
 * Slack POSTs here when the user clicks a button, toggles a checkbox,
 * submits a modal, etc. Payload is form-encoded with a single `payload`
 * field whose value is JSON.
 *
 * Two payload types we care about:
 *   - block_actions     → button click, checkbox toggle, etc. → handleAction
 *   - view_submission   → modal Submit button → handleViewSubmission
 *
 * We ack immediately with 200 and dispatch the work asynchronously via
 * Next's after() so we stay within Slack's 3-second budget.
 */

import { after } from "next/server";
import { getSigningSecret } from "@/lib/slack/client";
import { handleAction, joinPickedChannels } from "@/lib/slack/flow";
import {
  PICKER_ACTION_ID,
  PICKER_BLOCK_ID,
  PICKER_CALLBACK_ID,
} from "@/lib/slack/onboarding";
import { verifySlackSignature } from "@/lib/slack/signing";

export const runtime = "nodejs";

type BlockActionsPayload = {
  type: "block_actions";
  user: { id: string };
  trigger_id?: string;
  actions: Array<{
    action_id: string;
    type: string;
    value?: string;
    selected_options?: Array<{ value: string }>;
  }>;
};

type ViewSubmissionPayload = {
  type: "view_submission";
  user: { id: string };
  view: {
    callback_id: string;
    state: {
      values: Record<
        string,
        Record<
          string,
          {
            type: string;
            selected_options?: Array<{ value: string }>;
          }
        >
      >;
    };
  };
};

type InteractionPayload = BlockActionsPayload | ViewSubmissionPayload | { type: string };

export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text();

  const valid = verifySlackSignature(
    rawBody,
    req.headers.get("x-slack-signature"),
    req.headers.get("x-slack-request-timestamp"),
    getSigningSecret(),
  );
  if (!valid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const params = new URLSearchParams(rawBody);
  const rawPayload = params.get("payload");
  if (!rawPayload) {
    return new Response("Missing payload", { status: 400 });
  }

  let payload: InteractionPayload;
  try {
    payload = JSON.parse(rawPayload);
  } catch {
    return new Response("Bad payload JSON", { status: 400 });
  }

  // ── view_submission: modal "Submit" button ──────────────────────────────
  if (payload.type === "view_submission") {
    const v = payload as ViewSubmissionPayload;
    if (v.view.callback_id === PICKER_CALLBACK_ID) {
      const selected =
        v.view.state.values[PICKER_BLOCK_ID]?.[PICKER_ACTION_ID]
          ?.selected_options ?? [];
      const channelIds = selected.map((o) => o.value);
      after(async () => {
        try {
          await joinPickedChannels(v.user.id, channelIds);
        } catch (err) {
          console.error("[synko] joinPickedChannels failed:", err);
        }
      });
    }
    // Empty 200 closes the modal. Slack also accepts a JSON
    // response_action to keep it open / show errors / push another view.
    return new Response("", { status: 200 });
  }

  // ── block_actions: button click, checkbox toggle, etc. ──────────────────
  if (payload.type === "block_actions") {
    const ba = payload as BlockActionsPayload;
    const action = ba.actions[0];
    if (!action) return new Response("", { status: 200 });

    const selectedValues = action.selected_options?.map((o) => o.value);

    after(async () => {
      try {
        await handleAction(
          ba.user.id,
          action.action_id,
          selectedValues,
          ba.trigger_id,
        );
      } catch (err) {
        console.error("[synko] handleAction failed:", err);
      }
    });

    return new Response("", { status: 200 });
  }

  // Anything else — just ack so Slack doesn't retry.
  return new Response("", { status: 200 });
}

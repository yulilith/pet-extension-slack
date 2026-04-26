/**
 * Interactivity webhook: POST /api/slack/interactions
 *
 * Slack POSTs here when the user clicks a button, toggles a checkbox,
 * etc. Payload is form-encoded with a single `payload` field whose
 * value is JSON. We ack immediately with 200 and dispatch the action
 * asynchronously.
 */

import { after } from "next/server";
import { getSigningSecret } from "@/lib/slack/client";
import { handleAction } from "@/lib/slack/flow";
import { verifySlackSignature } from "@/lib/slack/signing";

export const runtime = "nodejs";

// Minimal shape of the interaction payload we care about.
type InteractionPayload = {
  type: string;
  user: { id: string };
  actions?: Array<{
    action_id: string;
    type: string;
    value?: string;
    selected_options?: Array<{ value: string }>;
  }>;
};

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

  // For block_actions payloads, actions[] has the click info.
  const action = payload.actions?.[0];
  if (!action) {
    // Some interaction types (view_submission etc.) don't use actions[].
    // We don't handle those yet — ack and move on.
    return new Response("", { status: 200 });
  }

  // Checkboxes & multi-selects send selected_options; buttons send a value.
  const selectedValues = action.selected_options?.map((o) => o.value);

  // Run after the response — we ack Slack within its 3-second budget.
  after(async () => {
    try {
      await handleAction(payload.user.id, action.action_id, selectedValues);
    } catch (err) {
      console.error("[pando] handleAction failed:", err);
    }
  });

  return new Response("", { status: 200 });
}

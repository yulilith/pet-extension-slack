/**
 * Events API webhook: POST /api/slack/events
 *
 * Used for two things in this prototype:
 *   1. URL verification handshake when you wire up the Events API in your
 *      Slack app config (Slack POSTs `{ type: "url_verification", challenge }`
 *      and expects the challenge back).
 *   2. Future: real event subscriptions (message.im, app_home_opened, etc.)
 *      to do ambient stuff like greeting users when they first open the DM.
 *      Not implemented yet.
 */

import { getSigningSecret } from "@/lib/slack/client";
import { verifySlackSignature } from "@/lib/slack/signing";

export const runtime = "nodejs";

type EventPayload =
  | { type: "url_verification"; challenge: string }
  | { type: "event_callback"; event: { type: string; user?: string; channel?: string } };

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

  let payload: EventPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  if (payload.type === "url_verification") {
    // Slack expects the challenge string echoed back in plain text.
    return new Response(payload.challenge, {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  }

  // Future: dispatch on payload.event.type for app_home_opened,
  // message.im, etc. For now we ack and move on so Slack doesn't retry.
  return new Response("", { status: 200 });
}

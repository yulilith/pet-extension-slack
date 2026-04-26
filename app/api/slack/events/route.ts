/**
 * Events API webhook: POST /api/slack/events
 *
 * Used for two things:
 *   1. URL verification handshake when you first wire up the Events API.
 *      Slack POSTs `{ type: "url_verification", challenge }` and expects the
 *      challenge string echoed back.
 *   2. `app_home_opened` events — fired when the user opens the Pando bot DM
 *      or its Home tab. We use this to publish the latest App Home view so
 *      the user always sees their pet's current state.
 */

import { after } from "next/server";
import { getSigningSecret } from "@/lib/slack/client";
import { refreshHome } from "@/lib/slack/flow";
import { verifySlackSignature } from "@/lib/slack/signing";

export const runtime = "nodejs";

type AppHomeOpened = {
  type: "app_home_opened";
  user: string;
  channel?: string;
  /** "home" or "messages" — Slack tells us which tab the user is viewing. */
  tab?: "home" | "messages";
};

type EventPayload =
  | { type: "url_verification"; challenge: string }
  | { type: "event_callback"; event: AppHomeOpened | { type: string } };

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

  // Slack URL verification handshake — happens once when you set the URL.
  if (payload.type === "url_verification") {
    return new Response(payload.challenge, {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  }

  if (payload.type === "event_callback") {
    const event = payload.event;
    if (event.type === "app_home_opened") {
      const homeEvent = event as AppHomeOpened;
      // Publish on the home tab. Slack also fires this for the messages tab
      // but we only need to refresh once.
      if (homeEvent.tab === "home" || !homeEvent.tab) {
        after(async () => {
          try {
            await refreshHome(homeEvent.user);
          } catch (err) {
            console.error("[pando] refreshHome failed:", err);
          }
        });
      }
    }
  }

  // Always ack with 200 so Slack doesn't retry.
  return new Response("", { status: 200 });
}

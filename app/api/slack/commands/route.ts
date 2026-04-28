/**
 * Slash command webhook: POST /api/slack/commands
 *
 * Routes:
 *   /synko-demo     → starts the demo flow in the user's Synko DM
 *   /synko-channels → opens the channel picker modal so the user can choose
 *                     which channels Synko should auto-join
 *
 * We ack within Slack's 3-second budget. Modal-opening commands have to
 * call views.open *quickly* (the trigger_id expires in ~3s), so we do it
 * inside `after()` which runs immediately after the response is sent.
 */

import { after, NextResponse } from "next/server";
import { getSigningSecret } from "@/lib/slack/client";
import { openChannelPicker, startFlow } from "@/lib/slack/flow";
import { verifySlackSignature } from "@/lib/slack/signing";

export const runtime = "nodejs";

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
  const command = params.get("command");
  const userId = params.get("user_id");
  const triggerId = params.get("trigger_id") ?? undefined;

  if (!userId) {
    return NextResponse.json({ text: "Missing user_id." });
  }

  switch (command) {
    case "/synko-demo": {
      after(async () => {
        try {
          await startFlow(userId);
        } catch (err) {
          console.error("[synko] startFlow failed:", err);
        }
      });
      return NextResponse.json({
        response_type: "ephemeral",
        text: "Starting your Synko session in DMs. Check the Synko bot.",
      });
    }

    case "/synko-channels": {
      if (!triggerId) {
        return NextResponse.json({
          response_type: "ephemeral",
          text: "Couldn't open the picker — no trigger id from Slack.",
        });
      }
      after(async () => {
        try {
          await openChannelPicker(userId, triggerId);
        } catch (err) {
          console.error("[synko] openChannelPicker failed:", err);
        }
      });
      // No user-visible ephemeral — the modal opening *is* the response.
      return new Response("", { status: 200 });
    }

    default:
      return NextResponse.json({
        response_type: "ephemeral",
        text: `Unknown command: ${command}`,
      });
  }
}

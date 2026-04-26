/**
 * Slash command webhook: POST /api/slack/commands
 *
 * Slack invokes this when a user types `/pando-demo` in any channel.
 * We ack with an ephemeral message immediately (Slack requires < 3s)
 * and kick off the flow asynchronously by posting the intro card to
 * the user's DM with the bot.
 */

import { after, NextResponse } from "next/server";
import { getSigningSecret } from "@/lib/slack/client";
import { startFlow } from "@/lib/slack/flow";
import { verifySlackSignature } from "@/lib/slack/signing";

// Force Node runtime — we use node:crypto for signing and the Slack SDK,
// neither of which run on the Edge runtime.
export const runtime = "nodejs";

// Slash commands are sent as application/x-www-form-urlencoded.
// Next.js doesn't auto-parse that for us, but we read it as text first
// for signature verification anyway.
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

  if (!userId) {
    return NextResponse.json({ text: "Missing user_id." });
  }

  if (command !== "/pando-demo") {
    return NextResponse.json({
      response_type: "ephemeral",
      text: `Unknown command: ${command}`,
    });
  }

  // Kick off the flow asynchronously via after() — work runs after the
  // response is sent, with the platform keeping the function alive until
  // it completes. Slack's 3-second ack budget is preserved.
  after(async () => {
    try {
      await startFlow(userId);
    } catch (err) {
      console.error("[pando] startFlow failed:", err);
    }
  });

  return NextResponse.json({
    response_type: "ephemeral",
    text: "Starting your Pando session in DMs. Check the Pando bot.",
  });
}

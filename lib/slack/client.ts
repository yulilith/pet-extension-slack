import { WebClient } from "@slack/web-api";

/**
 * Single-workspace bot client.
 *
 * We're not supporting multi-workspace install / OAuth in this iteration.
 * The bot token from the workspace where you installed the app lives in
 * SLACK_BOT_TOKEN; we instantiate one WebClient with it.
 *
 * To add multi-workspace later: replace this with a function that takes a
 * teamId and returns a WebClient instantiated with the matching stored token.
 */
let cachedClient: WebClient | null = null;

export function getSlackClient(): WebClient {
  if (cachedClient) return cachedClient;
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    throw new Error(
      "SLACK_BOT_TOKEN is not set. See .env.local.example.",
    );
  }
  cachedClient = new WebClient(token);
  return cachedClient;
}

/** Required for signing verification. */
export function getSigningSecret(): string {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) {
    throw new Error(
      "SLACK_SIGNING_SECRET is not set. See .env.local.example.",
    );
  }
  return secret;
}

/**
 * Public base URL where this Next.js app is reachable from the internet.
 * Slack image blocks need an absolute URL Slack can fetch — so we have to
 * tell our blocks where we live (typically the ngrok tunnel URL in dev,
 * or the *.vercel.app URL in production).
 */
export function getPublicBaseUrl(): string {
  const url = process.env.SYNKO_PUBLIC_URL;
  if (!url) {
    throw new Error(
      "SYNKO_PUBLIC_URL is not set. Set it to the ngrok URL (or your Vercel URL). See .env.local.example.",
    );
  }
  // Trim trailing slash for predictable concatenation.
  return url.replace(/\/+$/, "");
}


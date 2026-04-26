import crypto from "node:crypto";

/**
 * Verify a Slack request signature against the raw body.
 *
 * Slack signs every request with HMAC-SHA256(signing_secret,
 * `v0:${timestamp}:${rawBody}`). We must verify against the *raw* body
 * (not parsed JSON / form data), and we reject requests older than 5
 * minutes to prevent replay attacks.
 *
 * Reference: https://api.slack.com/authentication/verifying-requests-from-slack
 */
export function verifySlackSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
  signingSecret: string,
): boolean {
  if (!signature || !timestamp) return false;

  // Replay protection: reject anything older than 5 minutes.
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp, 10);
  if (Number.isNaN(ts) || Math.abs(now - ts) > 60 * 5) return false;

  const baseString = `v0:${timestamp}:${rawBody}`;
  const computed =
    "v0=" +
    crypto
      .createHmac("sha256", signingSecret)
      .update(baseString)
      .digest("hex");

  // Constant-time comparison to avoid timing attacks.
  const a = Buffer.from(computed);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

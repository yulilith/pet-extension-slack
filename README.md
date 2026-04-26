# Pando

A coaching pet that lives in Slack. This repo contains both:

1. **Web demo** — a clickable Slack-styled prototype for design iteration and user testing.
2. **Real Slack app** — a Next.js-hosted Slack bot that runs the same flow inside an actual Slack workspace.

Both surfaces share content (`/content`) and types (`/types`) so the pet's voice stays consistent across them.

---

## Repo layout

```
app/
  page.tsx                # web demo (visual prototype)
  dev/page.tsx            # sprite preview (designer reference)
  api/slack/
    commands/route.ts     # /pando-demo slash command webhook
    interactions/route.ts # button / checkbox click webhook
    events/route.ts       # Slack Events API (URL verification + future)
components/               # web-demo React components only
content/                  # shared: pets, intentions, observations, copy, etc.
lib/
  match.ts                # shared species matcher
  storage.ts              # web-demo localStorage helpers
  slack/                  # real-bot only: signing, client, blocks, flow, state
slack/
  manifest.yml            # Slack app config (paste into api.slack.com)
types/                    # shared types
```

---

## Run the web demo

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sprite preview at `/dev`.

No env vars or Slack setup needed for the web demo.

---

## Run the real Slack bot locally

The bot needs a public URL so Slack can webhook into it. We use ngrok in dev.

### 1. Create the Slack app

1. Go to <https://api.slack.com/apps> → **Create New App** → **From an app manifest**.
2. Pick your dev workspace. (Use a personal workspace for testing — don't use a team workspace where coworkers could be confused by the bot.)
3. Paste the contents of `slack/manifest.yml`. Before pasting, replace `REPLACE_WITH_YOUR_PUBLIC_URL` with your ngrok URL (you'll get this in step 3) — or edit the URLs in the Slack UI after creating the app.
4. Slack creates the app and shows you the config screen.

### 2. Set up env vars

```bash
cp .env.local.example .env.local
```

Then fill in:

- `SLACK_SIGNING_SECRET` — from your Slack app's **Basic Information** → **App Credentials** → **Signing Secret**.
- `SLACK_BOT_TOKEN` — from your Slack app's **OAuth & Permissions** → **Bot User OAuth Token** (starts with `xoxb-`). You'll only see this *after* you install the app to your workspace (next step).

### 3. Start the dev server and a tunnel

```bash
# terminal 1
npm run dev

# terminal 2
ngrok http 3000
```

Copy the ngrok HTTPS URL (e.g. `https://abc123.ngrok.app`).

### 4. Wire the public URL into your Slack app

In the Slack app config UI:

- **Slash Commands** → `/pando-demo` → set request URL to `<ngrok-url>/api/slack/commands`
- **Interactivity & Shortcuts** → set request URL to `<ngrok-url>/api/slack/interactions`
- **Event Subscriptions** → set request URL to `<ngrok-url>/api/slack/events` (Slack pings this once to verify; the URL goes green when the handshake works)

### 5. Install the app to your workspace

In the Slack app config: **Install App** → **Install to Workspace** → authorize. This generates the bot token. Copy it into `SLACK_BOT_TOKEN` in `.env.local` and restart `npm run dev`.

### 6. Try it

In any Slack channel in your dev workspace, type:

```
/pando-demo
```

You'll see an ephemeral confirmation in the channel, and Pando will DM you with the intro card. Click through the buttons to walk the full flow.

---

## What the bot currently does

Replays the same flow as the web demo, in real Slack DMs:

`intro` → `analysis` (4 fake "Pando read your messages" observations) → `intentions` (multi-select checkboxes; first-picked is primary) → `hatching` (egg → reveal) → `coaching1` (DM with Mary) → `coaching2` (#marketing-launch post) → `reflection` (end-of-day digest) → `end` (with reset).

Per-user state is held **in memory** in the Node process. It's lost on server restart. Fine for prototyping; replace with Vercel KV when deploying.

Pixel-pet sprites don't render in Slack, so we use emoji proxies for ambient identity (`✨ 🌿 💨 🌱 🔥`). Real sprite PNGs uploaded as Slack files is a future iteration.

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import into Vercel.
3. Add the same env vars (`SLACK_SIGNING_SECRET`, `SLACK_BOT_TOKEN`) in **Project Settings → Environment Variables**.
4. After the first deploy, replace your ngrok URL in the Slack app config with the `*.vercel.app` URL.

When you want state to survive across deploys / cold starts:

- Add Vercel KV (or any KV provider) and replace the `Map`-based persistence in `lib/slack/state.ts` with KV calls. The shape of `SlackFlowState` doesn't change.

---

## What's intentionally not done yet

- **OAuth distribution.** This is a single-workspace bot via env-var token. Multi-workspace install would add `app/api/slack/oauth/{install,callback}` routes plus token storage keyed by `team_id`.
- **LLM-powered analysis.** The "Reading your last 30 days…" observations are hardcoded — same for every user. Wire up Anthropic / OpenAI when we want real per-user analysis.
- **Pet visuals in Slack.** Emoji proxies only. Generating PNGs from sprite arrays + uploading via `files.upload` is the next step.
- **Persistent state.** In-memory only.

---

## Iterating between the web demo and the bot

Both surfaces import from `/content` and `/types`. To change a coaching line, an intention, or an observation:

1. Edit the relevant file in `/content/*.ts`.
2. The web demo picks it up on the next refresh.
3. The bot picks it up on the next request (or restart, depending on what you change).

So you can do voice/content iteration in one place and have it land in both surfaces.

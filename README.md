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
    events/route.ts       # Slack Events API (URL verification + app_home_opened)
  api/sprites/
    [species]/route.ts    # SVG renderer for pet sprites + the egg
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
The order below avoids the chicken-and-egg of "the manifest needs a URL but you
don't have the URL yet."

### 1. Get a public URL first (start ngrok)

```bash
# terminal 1
npm run dev

# terminal 2
ngrok http 3000
```

Copy the ngrok HTTPS URL (e.g. `https://abc123.ngrok.app`). Keep both terminals
running. Note: free ngrok URLs change every restart — if your tunnel drops, the
new URL needs to be updated in the Slack app config.

### 2. Create the Slack app from the manifest

1. Open `slack/manifest.yml` in this repo.
2. Find every `REPLACE_WITH_YOUR_PUBLIC_URL` and replace with the ngrok URL from step 1.
3. Go to <https://api.slack.com/apps> → **Create New App** → **From an app manifest**.
4. Pick your dev workspace. (Use a personal workspace — don't use a team workspace where coworkers could be confused by the bot.)
5. Paste the edited manifest YAML. Slack creates the app and shows the config screen.

### 3. Set up env vars

```bash
cp .env.local.example .env.local
```

Then fill in:

- `SLACK_SIGNING_SECRET` — from your Slack app's **Basic Information** → **App Credentials** → **Signing Secret**.
- `SLACK_BOT_TOKEN` — leave blank for now. You'll get this in the next step.
- `PANDO_PUBLIC_URL` — your ngrok URL (same one used in the manifest). Pet sprite images need this so Slack can fetch them.

### 4. Install the app to your workspace

In the Slack app config: **Install App** → **Install to Workspace** → authorize. This generates the bot token (starts with `xoxb-`). Copy it into `SLACK_BOT_TOKEN` in `.env.local` and **restart `npm run dev`** so it picks up the env var.

### 5. Try it

In any Slack channel in your dev workspace, type:

```
/pando-demo
```

You'll see an ephemeral confirmation in the channel, and Pando will DM you with the intro card. Click through the buttons to walk the full flow.

### If your ngrok URL changes

Every time you restart ngrok (on the free plan), the URL changes. When that happens, update **three places in your Slack app config** AND **`PANDO_PUBLIC_URL` in `.env.local`**:

- **Slash Commands** → `/pando-demo` request URL
- **Interactivity & Shortcuts** request URL
- **Event Subscriptions** request URL
- **`.env.local`** → `PANDO_PUBLIC_URL`, then restart `npm run dev`

The signing secret and bot token don't change.

### If you already created the app before channel onboarding was added

A new feature added scopes and a slash command that didn't exist when the app was first installed. To pick them up on your existing app:

1. <https://api.slack.com/apps> → your Pando app → **OAuth & Permissions** → **Bot Token Scopes** → add:
   - `channels:read`
   - `channels:join`
   - `channels:history`
   - `groups:read`
2. Same page → **Reinstall to Workspace** (Slack will ask you to re-authorize for the new scopes). After reinstall, **copy the new Bot User OAuth Token** and update `SLACK_BOT_TOKEN` in `.env.local` if it changed. Restart `npm run dev`.
3. **Slash Commands** in the left sidebar → click **Create New Command** → set:
   - Command: `/pando-channels`
   - Request URL: same as `/pando-demo` (your `<ngrok>/api/slack/commands`)
   - Short description: "Pick which channels Pando should join."
4. Save.

After all that, in any channel type `/pando-channels` and Pando will open the picker modal. Or open the Pando App Home — there's now an "Add me to your channels" button.

### If you already created the app before App Home was added

The manifest now declares an **App Home** tab where the pet lives, plus an enabled **Messages tab**. If your existing Slack app was created from the older manifest, you'll see neither. Toggle them on manually:

1. <https://api.slack.com/apps> → your Pando app → **App Home** in the left sidebar
2. **Show Tabs** section:
   - Check **Home Tab** (gives you the pet's persistent home)
   - Check **Messages Tab**
   - Check **"Allow users to send Slash commands and messages from the messages tab"** (this is what re-enables the input bar in the DM)
3. Save. Reload Slack. The Home tab appears next to Messages in the Pando DM.

---

## What the bot currently does

Replays the same flow as the web demo, in real Slack DMs:

`intro` → `analysis` (4 fake "Pando read your messages" observations) → `intentions` (multi-select checkboxes; first-picked is primary) → `hatching` (egg modal opens, then reveals the pet) → `coaching1` (DM with Mary) → `coaching2` (#marketing-launch post) → `reflection` (end-of-day digest) → `end` (with reset).

Per-user state is held **in memory** in the Node process. It's lost on server restart. Fine for prototyping; replace with Vercel KV when deploying.

### Channel onboarding

After install, the user picks which of their public channels Pando should join. Two ways to open the picker:

- Type `/pando-channels` in any channel
- Click **Add me to your channels** on the Pando App Home tab

The picker shows up to 10 of the user's public channels with checkboxes. Channels matching naming patterns like `project-`, `eng-`, `marketing-`, `launch-`, `design-` (and channels with 3–25 members) are pre-checked as "likely project channel." On submit, Pando calls `conversations.join` for each selected channel and DMs the user a summary. Private channels still need a manual `/invite @Pando` (no API path around it). All visible to the channel members — Slack has no ghost mode.

Heuristics live in `lib/slack/onboarding.ts` — adjust `PROJECT_PATTERNS` and `SKIP_PATTERNS` to retune.

### Pet visuals

Pet sprites (and the egg) are rendered as SVG by `app/api/sprites/[species]/route.ts` from the same sprite arrays that drive the web demo. The bot pulls them in via Block Kit image blocks, so:

- The **hatch reveal** opens as a popup modal in Slack — egg first, then a 2-second pause, then the pet image and intro.
- **Coaching cards** and **reflection** show a small pet avatar inline next to the bot's name.
- The **App Home tab** (next to "Messages" in the Pando DM) is the pet's persistent home — pet image at top, current intentions, latest reflection, and a "Start a new session" button.

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
- **Persistent state.** In-memory only.

---

## Iterating between the web demo and the bot

Both surfaces import from `/content` and `/types`. To change a coaching line, an intention, or an observation:

1. Edit the relevant file in `/content/*.ts`.
2. The web demo picks it up on the next refresh.
3. The bot picks it up on the next request (or restart, depending on what you change).

So you can do voice/content iteration in one place and have it land in both surfaces.

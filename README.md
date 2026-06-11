# AI Agent Master HUD

A unified Electron control center for the OpenClaw agent ecosystem: voice interaction via the
OpenAI Realtime API, real-time agent monitoring, multi-agent chat-room visibility, and an
idea-to-product pipeline orchestrator. See [`agent-hud-spec.md`](agent-hud-spec.md) for the full
specification.

## Quick start

```bash
npm install
npm run dev      # Vite dev server + Electron with hot reload
npm start        # production build + Electron
```

The app launches in **demo mode** (simulated agents, stats, chat, and pipeline) until you point it
at a real gateway — every screen is fully exercisable without any backend.

## Configuration (⚙ in the top bar)

| Setting | Purpose |
| --- | --- |
| OpenClaw gateway URL | WebSocket URL of the gateway on your home lab (e.g. `ws://homelab.local:18789`). Leave empty for demo mode. For remote access, use a Tailscale Funnel / ngrok tunnel URL. |
| Gateway auth token | Sent as `{ type: "auth", token }` on connect. |
| OpenAI API key | Enables the Realtime speech-to-speech voice pipeline (`gpt-4o-realtime-preview`). |

Settings persist locally (localStorage) and never leave the machine.

## The four tabs

1. **Voice Chat** — pixelated matrix-style agent face, live waveform (green = you, cyan = agent),
   home-lab stats panel (CPU/MEM/DISK/NET, firewall, threats), transcript, and command feedback.
   The Realtime session registers a `run_command` tool so the agent can execute whitelisted
   commands on the home lab through the gateway.
2. **Agents** — roster with status dots (green idle / blue processing / orange warning / red
   offline), per-agent details (task, model, provider), and settings (voice toggle, stability,
   latency tier, context window, read-only system prompt).
3. **Chat Room** — foreman banner, color-coded agent-to-agent chat log with system messages,
   command input routed through the foreman, and the agent hierarchy tree.
4. **Idea Pipeline** — six-stage flow (Capture → Research → Planning → ⭐ Review Gate → Build →
   Done) with color-coded bubbles (gray pending / blue active / yellow waiting / green complete),
   a human-in-the-loop review gate ("Good, go ahead" / "Need changes" with feedback loop), and
   expandable build logs.

A floating 🛠 button opens the **Troubleshooting Wiki**: searchable issue/resolution entries
indexed by agent, error type, and date, with manual logging.

## Gateway protocol

The client (`src/services/gateway.js`) speaks a small JSON protocol over WebSocket and reconnects
with exponential backoff (2s/4s/8s/16s):

```
client → gateway:  auth, exec, chat_command, idea_capture, idea_review
gateway → client:  stats, agents, chat, ideas, idea_new, idea_update, wiki, exec_result
```

Implement these message types in an OpenClaw skill/plugin to go live. Command execution is
expected to be validated against a whitelist on the gateway side and logged there.

## Project layout

```
electron/          main + preload (contextIsolation on, mic permission handler)
src/services/      realtime.js (OpenAI Realtime voice), gateway.js (real + demo), mockData.js
src/state/         AppState.jsx — global store wired to the gateway
src/components/    voice/ agents/ chatroom/ pipeline/ wiki/ settings/
```

## Porting notes (e.g. Hermes)

This build is OpenClaw-specific: Realtime speech-to-speech, gateway `exec` routing, and the
foreman coordination model. The spec's "Integration Notes" section documents what to swap for a
Hermes port.

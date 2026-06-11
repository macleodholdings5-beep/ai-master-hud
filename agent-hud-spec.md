# AI Agent Master HUD - Electron App Specification

## Project Overview
A unified control center for your OpenClaw agent ecosystem, enabling seamless voice interaction, real-time agent monitoring, idea-to-product workflow orchestration, and collaborative agent troubleshooting—all accessible locally on Mac/PC or remotely via tunnel.

---

## Architecture

### Core Stack
- **Frontend**: Electron app (macOS/Windows compatible)
- **Voice Pipeline**: OpenAI Realtime API (speech-to-speech, 200-300ms latency)
- **Agent Backend**: OpenClaw Gateway running on home lab PC
- **Command Execution**: OpenClaw skills system + terminal integration
- **UI Framework**: React or Vue (lightweight for older MacBook Air)
- **Audio**: Web Audio API for local mic/speaker handling
- **Networking**: WebSocket to OpenClaw gateway + tunneling (Tailscale/ngrok for remote access)

### Data Flow
1. User speaks into mic → Web Audio API captures raw audio
2. Audio streams to OpenAI Realtime API via WebSocket
3. Realtime API returns agent response audio in real-time
4. Electron app plays response + manages UI state
5. Command execution requests route through OpenClaw gateway to your home lab
6. Results stream back and display in the UI

---

## UI Structure (4 Tabs)

### Tab 1: Active Agent Voice Chat (Primary)
**Purpose**: Direct voice interface with selected agent

**Layout**:
- **Center**: Pixelated matrix-style animated face of active agent (represents agent personality/state)
- **Background stats panel**:
  - CPU / Memory / Disk usage (from home lab PC)
  - Network latency to cloud APIs
  - Security status (firewall, threat detection if available)
  - Optional: Home security feed placeholder (for future expansion)
- **Voice indicator**: Animated waveform showing when user is speaking vs. agent responding
- **Transcript display** (optional): Real-time transcript of conversation
- **Command feedback**: Last executed command + result status

**Interaction**:
- Always listening (when app is focused or in voice mode)
- User speaks naturally; agent responds via speakers
- Agent can execute terminal commands on your home lab
- Visual feedback for command execution in real-time

---

### Tab 2: Agent Management & Settings
**Purpose**: Overview and control of all running agents

**Layout**:
- **Left sidebar**: List of all active agents with status indicators
  - Green dot = online and idle
  - Blue dot = currently processing
  - Orange dot = warning/slow response
  - Red dot = offline
- **Center panel**: Selected agent details
  - Agent name and description
  - Current task/status
  - Model being used (e.g., claude-opus-4.6)
  - API provider (OpenRouter, Anthropic, etc.)
- **Right panel**: Agent-specific settings
  - Toggle voice on/off
  - Adjust Realtime API stability (0.0, 0.5, 1.0)
  - Latency tier preference
  - Memory/context window settings
  - Custom prompt/system message (read-only view)
- **Controls**: Switch between agents, restart agent, view logs

---

### Tab 3: Multi-Agent Chat Room
**Purpose**: Watch agents collaborate or issue batch commands through foreman agent

**Layout**:
- **Top**: Foreman agent display (your "head agent" / primary coordinator)
- **Below**: Scrolling chat log showing agent-to-agent communication
  - Each message tagged with agent name + timestamp
  - Different colors for different agents
  - System messages for task assignments/completions
- **Bottom**: Command input (voice or text)
  - Voice: "Hey, tell the team to [task]"
  - Text fallback for typing commands
- **Right sidebar**: Agent hierarchy tree
  - Foreman at top
  - Sub-agents indented below
  - Visual indication of who's working on what

**Interaction**:
- View live coordination between agents
- Issue commands through foreman that cascade to subordinates
- Monitor task distribution and completion

---

### Tab 4: Idea Pipeline (Workflow Orchestrator)
**Purpose**: Visual workflow from raw idea capture to finished product

**Layout**: Horizontal flow with 6 stages (left to right):

1. **Capture Zone**
   - Voice idea input: "Hey, capture this idea: [concept]"
   - Agent asks: "Want me to explore this?" or "Anything you want me to expand on first?"
   - Idea card created with timestamp

2. **Research Phase**
   - Agent automatically gathers research
   - Bubble card shows progress (animated)
   - Displays: "Researching...", sources found, YouTube videos queued

3. **Planning Phase**
   - Agent synthesizes research into structured plan
   - Bubble shows: "Planning...", outline preview

4. **Review Gate** ⭐ (Human-in-the-loop)
   - Idea card shows full research summary + proposed plan
   - You review in app (visual summary + optional full details)
   - Voice or click options: "Good, go ahead" / "Need changes"
   - If changes: feedback loops back to planning agent

5. **Build Handoff**
   - Plan converts to requirements document
   - Agent hands off to Claude Code in your terminal
   - Status: "Building...", progress updates streamed back
   - Build logs visible in expandable section

6. **Final Output**
   - Completion status: ✓ Built
   - Link to finished product (GitHub repo, deployed app, file path, etc.)
   - Build summary and any notes

**Visual Design**:
- Each stage is a rounded rectangular bubble
- Active stage highlighted/animated
- Arrows showing progression
- Color coding: Gray (pending) → Blue (in progress) → Green (complete)
- Hover to see details; click to expand full logs

**Additional Feature: Troubleshooting Wiki**
- Floating icon/tab in corner
- Searchable log of agent failures + resolutions
- Indexed by: agent name, error type, date, resolution
- Accessible to all agents for lookup during execution
- Auto-populated when agents log issues + fixes

---

## Voice Chat Implementation (Realtime API)

### Why OpenAI Realtime API
- Single WebSocket connection (speech-to-speech)
- 200-300ms end-to-end latency vs. 500-1000ms+ traditional STT→LLM→TTS chain
- Reduces vendor hops (no separate STT provider needed)
- Natural conversation flow

### Setup
1. OpenClaw gateway exposes `/v1/chat/completions` endpoint
2. Electron app connects to OpenAI Realtime API with model `gpt-4o-realtime-preview`
3. Audio captured locally via Web Audio API
4. Realtime stream sends raw audio to OpenAI, receives response audio
5. Response audio plays through local speakers
6. Transcript updates UI in real-time

### Configuration
```
Realtime Model: gpt-4o-realtime-preview
Stability: 0.5 (balanced)
Latency Tier: 3 (default, acceptable for most use cases)
Input: PCM 16-bit, 24kHz or 16kHz
Output: PCM 16-bit, 24kHz
```

---

## Command Execution & Security

### How Commands Work
1. User says: "Run [shell command]" or agent executes as part of response
2. Electron app sends command request to OpenClaw gateway
3. Gateway validates command against whitelist
4. If approved, command executes on your home lab PC
5. Output streams back to app and displays in UI

### Security Layer
- Whitelist of allowed commands/scripts on home lab
- Commands logged with timestamp, user, output
- Sensitive commands (system-level) require explicit approval
- Sandbox consideration: Run non-critical commands in isolated shell if possible

---

## Deployment Paths

### Local (Home Lab)
- Electron app runs on MacBook Air
- Connects to OpenClaw gateway on home lab PC via local network
- Low latency, no external dependencies

### Remote (Via Tunnel)
- Same Electron app on any Mac/PC
- Tailscale Funnel or ngrok tunnel to home lab gateway
- Access from phone browser or remote laptop
- Slight latency increase but same architecture

---

## Integration Notes: OpenClaw-Specific

⚠️ **Important for Future Ports (e.g., Hermes)**:

This specification is built explicitly for **OpenClaw** and relies on:
1. **OpenClaw Gateway Architecture**: The app assumes a running OpenClaw gateway that exposes `/v1/chat/completions` and skill execution endpoints.
2. **Realtime API Integration**: Uses OpenAI's speech-to-speech Realtime API, which OpenClaw supports natively but Hermes does not (Hermes uses separate STT→LLM→TTS chain).
3. **Skill System**: Command execution routes through OpenClaw's skill/tool system; Hermes uses a different tool invocation model.
4. **Agent Coordination**: Foreman agent assumes OpenClaw's multi-agent orchestration model; Hermes has different sub-agent spawning.

**If rebuilding for Hermes**:
- Replace Realtime API with Hermes's native `/voice` mode (slower but works)
- Reroute command execution through Hermes's tool system
- Adjust agent coordination for Hermes's spawn model
- Remove OpenClaw-specific gateway calls; use Hermes gateway instead

---

## Development Checklist

- [ ] Electron app scaffold (React/Vue + Electron IPC)
- [ ] Web Audio API integration (mic capture + playback)
- [ ] OpenAI Realtime WebSocket connection
- [ ] OpenClaw gateway communication (auth + command routing)
- [ ] Tab 1: Agent voice chat + stats panel
- [ ] Tab 2: Agent list + management controls
- [ ] Tab 3: Multi-agent chat room visualization
- [ ] Tab 4: Idea pipeline workflow (6 stages + visual flow)
- [ ] Troubleshooting wiki search + display
- [ ] Command execution + security whitelist
- [ ] Tunnel setup (Tailscale/ngrok) for remote access
- [ ] Error handling + reconnection logic
- [ ] Logging + debugging interface

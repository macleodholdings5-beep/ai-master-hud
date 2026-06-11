// Seed data for demo mode (no OpenClaw gateway configured).

export const seedAgents = [
  {
    id: 'foreman',
    name: 'Foreman',
    description: 'Head agent / primary coordinator. Delegates tasks to sub-agents.',
    status: 'online', // online | processing | warning | offline
    task: 'Idle — awaiting commands',
    model: 'claude-opus-4.6',
    provider: 'Anthropic',
    parent: null,
    voiceEnabled: true,
    stability: 0.5,
    latencyTier: 3,
    contextWindow: 200000,
    systemPrompt:
      'You are Foreman, the coordinator of the OpenClaw agent fleet. Receive operator commands, break them into tasks, and delegate to sub-agents.',
  },
  {
    id: 'scout',
    name: 'Scout',
    description: 'Research agent. Gathers sources, articles, and videos for new ideas.',
    status: 'processing',
    task: 'Researching: local-first sync engines',
    model: 'claude-sonnet-4.6',
    provider: 'OpenRouter',
    parent: 'foreman',
    voiceEnabled: false,
    stability: 0.5,
    latencyTier: 3,
    contextWindow: 200000,
    systemPrompt: 'You are Scout. Research topics thoroughly and return structured source lists.',
  },
  {
    id: 'draftsman',
    name: 'Draftsman',
    description: 'Planning agent. Turns research into structured build plans.',
    status: 'online',
    task: 'Idle',
    model: 'claude-sonnet-4.6',
    provider: 'Anthropic',
    parent: 'foreman',
    voiceEnabled: false,
    stability: 0.5,
    latencyTier: 3,
    contextWindow: 200000,
    systemPrompt: 'You are Draftsman. Synthesize research into actionable build plans.',
  },
  {
    id: 'builder',
    name: 'Builder',
    description: 'Build agent. Hands plans off to Claude Code and streams progress.',
    status: 'warning',
    task: 'Slow response — retrying terminal handoff',
    model: 'claude-opus-4.6',
    provider: 'Anthropic',
    parent: 'foreman',
    voiceEnabled: false,
    stability: 0.5,
    latencyTier: 2,
    contextWindow: 200000,
    systemPrompt: 'You are Builder. Convert plans to requirements docs and drive Claude Code builds.',
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    description: 'Home lab monitor. Watches system health and security status.',
    status: 'offline',
    task: '—',
    model: 'claude-haiku-4.5',
    provider: 'OpenRouter',
    parent: 'foreman',
    voiceEnabled: false,
    stability: 0.5,
    latencyTier: 3,
    contextWindow: 200000,
    systemPrompt: 'You are Sentinel. Report system metrics and flag anomalies.',
  },
];

export const seedChat = [
  { id: 1, agent: 'System', text: 'Multi-agent session started.', ts: Date.now() - 360000, system: true },
  { id: 2, agent: 'Foreman', text: 'Team status check. Report in.', ts: Date.now() - 300000 },
  { id: 3, agent: 'Scout', text: 'Online. Research queue: 1 active topic.', ts: Date.now() - 290000 },
  { id: 4, agent: 'Draftsman', text: 'Online. No pending plans.', ts: Date.now() - 280000 },
  { id: 5, agent: 'Builder', text: 'Online. Terminal bridge latency elevated (1.2s).', ts: Date.now() - 270000 },
  { id: 6, agent: 'System', text: 'Task assigned: research "local-first sync engines" → Scout.', ts: Date.now() - 120000, system: true },
];

export const seedIdeas = [
  {
    id: 'idea-1',
    title: 'Voice-controlled home lab dashboard',
    capturedAt: Date.now() - 86400000 * 3,
    stage: 5, // 0..5 -> capture, research, planning, review, build, done
    stageStatus: 'complete',
    research: { sources: 14, videos: 3, summary: 'Strong prior art: Home Assistant voice, OpenHAB. Gap: agent-native control.' },
    plan: 'Electron HUD + Realtime API voice + OpenClaw gateway command routing.',
    buildLog: ['Scaffolded repo', 'Voice pipeline wired', 'Gateway integration complete', '✓ Built'],
    output: 'github.com/you/ai-master-hud',
  },
  {
    id: 'idea-2',
    title: 'Local-first notes sync engine',
    capturedAt: Date.now() - 86400000,
    stage: 1,
    stageStatus: 'active',
    research: { sources: 6, videos: 2, summary: 'Researching…' },
    plan: null,
    buildLog: [],
    output: null,
  },
  {
    id: 'idea-3',
    title: 'Agent-written morning briefing podcast',
    capturedAt: Date.now() - 3600000 * 4,
    stage: 3,
    stageStatus: 'waiting',
    research: { sources: 9, videos: 1, summary: 'TTS pipelines mature; differentiator is personal context from agent memory.' },
    plan: '1) Nightly cron agent gathers calendar/news. 2) Script generation. 3) TTS render. 4) Push to podcast feed.',
    buildLog: [],
    output: null,
  },
];

export const seedWiki = [
  {
    id: 'w1',
    agent: 'Builder',
    errorType: 'TerminalTimeout',
    date: '2026-06-08',
    title: 'Claude Code handoff hangs when terminal session is stale',
    resolution: 'Kill stale tmux session before handoff: `tmux kill-session -t build || true`, then respawn.',
  },
  {
    id: 'w2',
    agent: 'Scout',
    errorType: 'RateLimit429',
    date: '2026-06-05',
    title: 'Research bursts hit OpenRouter rate limits',
    resolution: 'Added exponential backoff (2s/4s/8s) and batched source fetches to 5 concurrent.',
  },
  {
    id: 'w3',
    agent: 'Foreman',
    errorType: 'WebSocketDrop',
    date: '2026-06-01',
    title: 'Gateway WS drops on home lab sleep',
    resolution: 'Disabled PC sleep via `systemsetup -setcomputersleep Never`; client auto-reconnects with backoff.',
  },
];

export function randomStats(prev) {
  const drift = (v, amt, min, max) =>
    Math.min(max, Math.max(min, v + (Math.random() - 0.5) * amt));
  const p = prev || { cpu: 34, mem: 58, disk: 71, latency: 42 };
  return {
    cpu: drift(p.cpu, 12, 3, 97),
    mem: drift(p.mem, 4, 20, 95),
    disk: drift(p.disk, 0.4, 50, 92),
    latency: drift(p.latency, 18, 12, 240),
    firewall: true,
    threats: 0,
  };
}

// OpenClaw gateway client.
//
// Real mode: maintains a WebSocket to the gateway with exponential-backoff
// reconnection. Message protocol (JSON, `type` discriminated):
//   -> { type: 'auth', token }
//   -> { type: 'exec', id, command }            execute whitelisted command
//   -> { type: 'chat_command', text }            command routed via foreman
//   -> { type: 'idea_capture', title }
//   -> { type: 'idea_review', ideaId, approved, feedback }
//   <- { type: 'stats', data }                   home lab system stats
//   <- { type: 'agents', data }                  full agent roster
//   <- { type: 'chat', message }                 agent-to-agent chat line
//   <- { type: 'ideas', data }                   pipeline state
//   <- { type: 'wiki', data }                    troubleshooting entries
//   <- { type: 'exec_result', id, ok, output }
//
// Demo mode: when no gateway URL is configured, a local simulator emits the
// same events so every part of the UI is exercisable.

import { seedAgents, seedChat, seedIdeas, seedWiki, randomStats } from './mockData.js';

class Emitter {
  constructor() {
    this.handlers = {};
  }
  on(event, fn) {
    (this.handlers[event] ||= []).push(fn);
    return () => {
      this.handlers[event] = (this.handlers[event] || []).filter((h) => h !== fn);
    };
  }
  emit(event, payload) {
    (this.handlers[event] || []).forEach((fn) => fn(payload));
  }
}

const RECONNECT_DELAYS = [2000, 4000, 8000, 16000];

export class RealGateway extends Emitter {
  constructor({ url, token }) {
    super();
    this.url = url;
    this.token = token;
    this.attempt = 0;
    this.closed = false;
    this.execId = 0;
  }

  start() {
    this.closed = false;
    this.connect();
  }

  connect() {
    this.emit('status', 'connecting');
    try {
      this.ws = new WebSocket(this.url);
    } catch (err) {
      this.emit('status', 'offline');
      this.scheduleReconnect();
      return;
    }
    this.ws.onopen = () => {
      this.attempt = 0;
      if (this.token) this.send({ type: 'auth', token: this.token });
      this.emit('status', 'connected');
    };
    this.ws.onmessage = (ev) => {
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      this.emit(msg.type, msg.data ?? msg);
    };
    this.ws.onclose = () => {
      this.emit('status', 'offline');
      this.scheduleReconnect();
    };
    this.ws.onerror = () => this.ws.close();
  }

  scheduleReconnect() {
    if (this.closed) return;
    const delay = RECONNECT_DELAYS[Math.min(this.attempt, RECONNECT_DELAYS.length - 1)];
    this.attempt += 1;
    this.timer = setTimeout(() => this.connect(), delay);
  }

  send(obj) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
      return true;
    }
    return false;
  }

  executeCommand(command) {
    const id = `exec-${++this.execId}`;
    this.send({ type: 'exec', id, command });
    return id;
  }

  sendChatCommand(text) {
    this.send({ type: 'chat_command', text });
  }

  captureIdea(title) {
    this.send({ type: 'idea_capture', title });
  }

  reviewIdea(ideaId, approved, feedback) {
    this.send({ type: 'idea_review', ideaId, approved, feedback });
  }

  stop() {
    this.closed = true;
    clearTimeout(this.timer);
    if (this.ws) this.ws.close();
  }
}

export class DemoGateway extends Emitter {
  constructor() {
    super();
    this.stats = null;
    this.agents = seedAgents.map((a) => ({ ...a }));
    this.chatId = 100;
    this.ideaId = 100;
    this.execId = 0;
  }

  start() {
    this.emit('status', 'connected');
    this.emit('agents', this.agents);
    this.emit('ideas', seedIdeas.map((i) => ({ ...i })));
    this.emit('wiki', seedWiki);
    seedChat.forEach((m) => this.emit('chat', m));

    this.statsTimer = setInterval(() => {
      this.stats = randomStats(this.stats);
      this.emit('stats', this.stats);
    }, 1500);
    this.stats = randomStats(null);
    this.emit('stats', this.stats);

    // Occasional simulated agent chatter / status churn.
    this.chatterTimer = setInterval(() => {
      if (Math.random() < 0.4) {
        const lines = [
          ['Scout', 'Found 2 new sources, queueing summaries.'],
          ['Builder', 'Terminal bridge latency back to normal (180ms).'],
          ['Foreman', 'Acknowledged. Continue.'],
          ['Draftsman', 'Plan draft v2 ready for review gate.'],
        ];
        const [agent, text] = lines[Math.floor(Math.random() * lines.length)];
        this.emit('chat', { id: ++this.chatId, agent, text, ts: Date.now() });
      }
      if (Math.random() < 0.25) {
        const agent = this.agents[Math.floor(Math.random() * this.agents.length)];
        if (agent.id !== 'sentinel') {
          agent.status = Math.random() < 0.7 ? 'online' : 'processing';
          this.emit('agents', this.agents);
        }
      }
    }, 4000);
  }

  executeCommand(command) {
    const id = `exec-${++this.execId}`;
    setTimeout(() => {
      const whitelisted = !/rm\s+-rf|sudo|shutdown|mkfs/.test(command);
      this.emit('exec_result', {
        id,
        ok: whitelisted,
        output: whitelisted
          ? `[demo] $ ${command}\nok — simulated output (no gateway connected)`
          : `[demo] command rejected by whitelist: ${command}`,
      });
    }, 600);
    return id;
  }

  sendChatCommand(text) {
    this.emit('chat', { id: ++this.chatId, agent: 'You', text, ts: Date.now(), user: true });
    setTimeout(() => {
      this.emit('chat', {
        id: ++this.chatId,
        agent: 'Foreman',
        text: `Copy that. Delegating: "${text}"`,
        ts: Date.now(),
      });
      this.emit('chat', {
        id: ++this.chatId,
        agent: 'System',
        text: 'Task assigned → Scout, Draftsman.',
        ts: Date.now(),
        system: true,
      });
    }, 800);
  }

  captureIdea(title) {
    const idea = {
      id: `idea-${++this.ideaId}`,
      title,
      capturedAt: Date.now(),
      stage: 0,
      stageStatus: 'active',
      research: null,
      plan: null,
      buildLog: [],
      output: null,
    };
    this.emit('idea_new', idea);
    // Simulate research -> planning -> review gate progression.
    setTimeout(() => this.emit('idea_update', { id: idea.id, stage: 1, stageStatus: 'active', research: { sources: 0, videos: 0, summary: 'Researching…' } }), 1500);
    setTimeout(() => this.emit('idea_update', { id: idea.id, stage: 2, stageStatus: 'active', research: { sources: 8, videos: 2, summary: 'Research complete: 8 sources, 2 videos queued.' } }), 6000);
    setTimeout(() => this.emit('idea_update', { id: idea.id, stage: 3, stageStatus: 'waiting', plan: 'Draft plan generated from research. Review required at the gate.' }), 10000);
  }

  reviewIdea(ideaId, approved, feedback) {
    if (!approved) {
      this.emit('idea_update', { id: ideaId, stage: 2, stageStatus: 'active', plan: `Revising plan per feedback: ${feedback || 'changes requested'}` });
      setTimeout(() => this.emit('idea_update', { id: ideaId, stage: 3, stageStatus: 'waiting', plan: 'Revised plan ready for review.' }), 5000);
      return;
    }
    this.emit('idea_update', { id: ideaId, stage: 4, stageStatus: 'active', buildLog: ['Requirements doc generated', 'Handed off to Claude Code…'] });
    setTimeout(() => this.emit('idea_update', { id: ideaId, stage: 4, stageStatus: 'active', buildLog: ['Requirements doc generated', 'Handed off to Claude Code…', 'Building: scaffold complete'] }), 4000);
    setTimeout(() => this.emit('idea_update', { id: ideaId, stage: 5, stageStatus: 'complete', buildLog: ['Requirements doc generated', 'Handed off to Claude Code…', 'Building: scaffold complete', '✓ Built'], output: '~/projects/new-build' }), 9000);
  }

  stop() {
    clearInterval(this.statsTimer);
    clearInterval(this.chatterTimer);
  }
}

export function createGateway(settings) {
  if (settings.gatewayUrl) {
    return new RealGateway({ url: settings.gatewayUrl, token: settings.gatewayToken });
  }
  return new DemoGateway();
}

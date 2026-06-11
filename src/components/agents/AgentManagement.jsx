import React from 'react';
import { useAppState } from '../../state/AppState.jsx';

export default function AgentManagement() {
  const { agents, activeAgentId, setActiveAgentId, updateAgent } = useAppState();
  const agent = agents.find((a) => a.id === activeAgentId) || agents[0];

  return (
    <div className="agents-layout">
      <aside className="agent-list panel">
        <h3>AGENTS</h3>
        {agents.map((a) => (
          <button
            key={a.id}
            className={`agent-item ${a.id === agent?.id ? 'selected' : ''}`}
            onClick={() => setActiveAgentId(a.id)}
          >
            <span className={`status-dot ${a.status}`} />
            <span className="agent-item-name">{a.name}</span>
          </button>
        ))}
        <div className="legend">
          <span><i className="status-dot online" /> idle</span>
          <span><i className="status-dot processing" /> processing</span>
          <span><i className="status-dot warning" /> warning</span>
          <span><i className="status-dot offline" /> offline</span>
        </div>
      </aside>

      {agent ? (
        <>
          <section className="agent-detail panel">
            <div className="agent-header">
              <h2>{agent.name}</h2>
              <span className={`status-dot ${agent.status}`} />
            </div>
            <p className="agent-desc">{agent.description}</p>
            <dl className="kv">
              <dt>Current task</dt>
              <dd>{agent.task}</dd>
              <dt>Model</dt>
              <dd>{agent.model}</dd>
              <dt>Provider</dt>
              <dd>{agent.provider}</dd>
              <dt>Reports to</dt>
              <dd>{agent.parent ? agents.find((a) => a.id === agent.parent)?.name : '— (foreman)'}</dd>
            </dl>
            <div className="agent-actions">
              <button onClick={() => updateAgent(agent.id, { status: 'processing', task: 'Restarting…' })}>
                ↻ RESTART
              </button>
              <button onClick={() => setActiveAgentId(agent.id)}>★ SET ACTIVE</button>
              <button onClick={() => alert(`Logs for ${agent.name} — connect a gateway to stream logs.`)}>
                ☰ VIEW LOGS
              </button>
            </div>
          </section>

          <aside className="agent-settings panel">
            <h3>SETTINGS — {agent.name.toUpperCase()}</h3>
            <label className="setting-row">
              <span>Voice</span>
              <input
                type="checkbox"
                checked={agent.voiceEnabled}
                onChange={(e) => updateAgent(agent.id, { voiceEnabled: e.target.checked })}
              />
            </label>
            <label className="setting-row">
              <span>Stability</span>
              <select
                value={agent.stability}
                onChange={(e) => updateAgent(agent.id, { stability: Number(e.target.value) })}
              >
                <option value={0}>0.0 — expressive</option>
                <option value={0.5}>0.5 — balanced</option>
                <option value={1}>1.0 — stable</option>
              </select>
            </label>
            <label className="setting-row">
              <span>Latency tier</span>
              <select
                value={agent.latencyTier}
                onChange={(e) => updateAgent(agent.id, { latencyTier: Number(e.target.value) })}
              >
                {[1, 2, 3, 4].map((t) => (
                  <option key={t} value={t}>tier {t}</option>
                ))}
              </select>
            </label>
            <label className="setting-row">
              <span>Context window</span>
              <select
                value={agent.contextWindow}
                onChange={(e) => updateAgent(agent.id, { contextWindow: Number(e.target.value) })}
              >
                <option value={100000}>100k</option>
                <option value={200000}>200k</option>
                <option value={500000}>500k</option>
              </select>
            </label>
            <h4>SYSTEM PROMPT (read-only)</h4>
            <pre className="sys-prompt">{agent.systemPrompt}</pre>
          </aside>
        </>
      ) : (
        <p className="muted">No agents reported by gateway.</p>
      )}
    </div>
  );
}

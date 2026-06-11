import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../../state/AppState.jsx';

const AGENT_COLORS = {
  Foreman: '#39ff7a',
  Scout: '#3ad6ff',
  Draftsman: '#ffd23a',
  Builder: '#ff8a3a',
  Sentinel: '#c83aff',
  You: '#ffffff',
};

function HierarchyNode({ agent, agents, depth }) {
  const children = agents.filter((a) => a.parent === agent.id);
  return (
    <div className="tree-node" style={{ paddingLeft: depth * 16 }}>
      <span className={`status-dot ${agent.status}`} />
      <span className="tree-name" style={{ color: AGENT_COLORS[agent.name] || '#cde' }}>
        {agent.name}
      </span>
      <span className="tree-task">{agent.task}</span>
      {children.map((c) => (
        <HierarchyNode key={c.id} agent={c} agents={agents} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function ChatRoom() {
  const { agents, chatMessages, sendChatCommand } = useAppState();
  const [input, setInput] = useState('');
  const logRef = useRef(null);
  const foreman = agents.find((a) => !a.parent);

  useEffect(() => {
    logRef.current?.scrollTo(0, logRef.current.scrollHeight);
  }, [chatMessages]);

  function submit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    sendChatCommand(input.trim());
    setInput('');
  }

  return (
    <div className="chatroom-layout">
      <section className="chatroom-main">
        <div className="foreman-banner panel">
          <span className="foreman-label">FOREMAN</span>
          {foreman ? (
            <>
              <span className={`status-dot ${foreman.status}`} />
              <strong>{foreman.name}</strong>
              <span className="muted">{foreman.task}</span>
            </>
          ) : (
            <span className="muted">no foreman online</span>
          )}
        </div>

        <div className="chat-log panel" ref={logRef}>
          {chatMessages.map((m) => (
            <div key={m.id} className={`chat-line ${m.system ? 'system' : ''} ${m.user ? 'user' : ''}`}>
              <span className="chat-ts">
                {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="chat-agent" style={{ color: AGENT_COLORS[m.agent] || '#9ab' }}>
                {m.agent}
              </span>
              <span className="chat-text">{m.text}</span>
            </div>
          ))}
        </div>

        <form className="chat-input" onSubmit={submit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Command the team… e.g. "tell the team to research X"'
          />
          <button type="submit">SEND</button>
        </form>
      </section>

      <aside className="hierarchy panel">
        <h3>HIERARCHY</h3>
        {foreman ? (
          <HierarchyNode agent={foreman} agents={agents} depth={0} />
        ) : (
          <p className="muted">Awaiting roster…</p>
        )}
      </aside>
    </div>
  );
}

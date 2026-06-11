import React, { useState } from 'react';
import { useAppState } from '../../state/AppState.jsx';

export default function TroubleshootingWiki({ onClose }) {
  const { wikiEntries, addWikiEntry } = useAppState();
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ agent: '', errorType: '', title: '', resolution: '' });

  const q = query.toLowerCase();
  const results = wikiEntries.filter(
    (e) =>
      !q ||
      e.agent.toLowerCase().includes(q) ||
      e.errorType.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.resolution.toLowerCase().includes(q)
  );

  function saveDraft(e) {
    e.preventDefault();
    if (!draft.title.trim()) return;
    addWikiEntry({ ...draft, date: new Date().toISOString().slice(0, 10) });
    setDraft({ agent: '', errorType: '', title: '', resolution: '' });
    setAdding(false);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal panel wiki" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>🛠 TROUBLESHOOTING WIKI</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <input
          className="wiki-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search by agent, error type, keyword…"
          autoFocus
        />
        <div className="wiki-list">
          {results.length === 0 ? (
            <p className="muted">No entries match.</p>
          ) : (
            results.map((e) => (
              <div key={e.id} className="wiki-entry">
                <div className="wiki-meta">
                  <span className="wiki-agent">{e.agent}</span>
                  <span className="wiki-error">{e.errorType}</span>
                  <span className="muted">{e.date}</span>
                </div>
                <strong>{e.title}</strong>
                <p>{e.resolution}</p>
              </div>
            ))
          )}
        </div>
        {adding ? (
          <form className="wiki-add" onSubmit={saveDraft}>
            <div className="wiki-add-row">
              <input
                placeholder="agent"
                value={draft.agent}
                onChange={(e) => setDraft({ ...draft, agent: e.target.value })}
              />
              <input
                placeholder="error type"
                value={draft.errorType}
                onChange={(e) => setDraft({ ...draft, errorType: e.target.value })}
              />
            </div>
            <input
              placeholder="issue title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <textarea
              placeholder="resolution"
              value={draft.resolution}
              onChange={(e) => setDraft({ ...draft, resolution: e.target.value })}
            />
            <div className="wiki-add-row">
              <button type="submit">SAVE</button>
              <button type="button" onClick={() => setAdding(false)}>CANCEL</button>
            </div>
          </form>
        ) : (
          <button className="wiki-add-btn" onClick={() => setAdding(true)}>
            + LOG ISSUE & FIX
          </button>
        )}
      </div>
    </div>
  );
}

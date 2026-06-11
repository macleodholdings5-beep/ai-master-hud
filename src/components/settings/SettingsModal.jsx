import React, { useState } from 'react';
import { useAppState } from '../../state/AppState.jsx';

export default function SettingsModal({ onClose }) {
  const { settings, setSettings } = useAppState();
  const [draft, setDraft] = useState(settings);

  function save(e) {
    e.preventDefault();
    setSettings(draft);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal panel" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <div className="modal-head">
          <h3>⚙ SETTINGS</h3>
          <button type="button" className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <label className="setting-field">
          <span>OpenClaw gateway URL (WebSocket)</span>
          <input
            value={draft.gatewayUrl}
            onChange={(e) => setDraft({ ...draft, gatewayUrl: e.target.value })}
            placeholder="ws://homelab.local:18789 — leave empty for demo mode"
          />
        </label>
        <label className="setting-field">
          <span>Gateway auth token</span>
          <input
            type="password"
            value={draft.gatewayToken}
            onChange={(e) => setDraft({ ...draft, gatewayToken: e.target.value })}
            placeholder="optional"
          />
        </label>
        <label className="setting-field">
          <span>OpenAI API key (Realtime voice)</span>
          <input
            type="password"
            value={draft.openaiApiKey}
            onChange={(e) => setDraft({ ...draft, openaiApiKey: e.target.value })}
            placeholder="sk-…"
          />
        </label>
        <label className="setting-row">
          <span>Show live transcript</span>
          <input
            type="checkbox"
            checked={draft.showTranscript}
            onChange={(e) => setDraft({ ...draft, showTranscript: e.target.checked })}
          />
        </label>

        <p className="muted small">
          Remote access: point the gateway URL at a Tailscale Funnel / ngrok tunnel to your home
          lab. Keys are stored locally on this machine only.
        </p>

        <button type="submit" className="save-btn">SAVE & RECONNECT</button>
      </form>
    </div>
  );
}

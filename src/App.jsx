import React, { useState } from 'react';
import { useAppState } from './state/AppState.jsx';
import VoiceChat from './components/voice/VoiceChat.jsx';
import AgentManagement from './components/agents/AgentManagement.jsx';
import ChatRoom from './components/chatroom/ChatRoom.jsx';
import IdeaPipeline from './components/pipeline/IdeaPipeline.jsx';
import TroubleshootingWiki from './components/wiki/TroubleshootingWiki.jsx';
import SettingsModal from './components/settings/SettingsModal.jsx';

const TABS = [
  { id: 'voice', label: 'Voice Chat' },
  { id: 'agents', label: 'Agents' },
  { id: 'chatroom', label: 'Chat Room' },
  { id: 'pipeline', label: 'Idea Pipeline' },
];

export default function App() {
  const [tab, setTab] = useState('voice');
  const [wikiOpen, setWikiOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { connectionStatus, settings } = useAppState();

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-glyph">◢◤</span> AI MASTER HUD
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="topbar-right">
          <span className={`conn-pill ${connectionStatus}`}>
            {connectionStatus === 'connected'
              ? `● ${settings.gatewayUrl ? 'GATEWAY' : 'DEMO MODE'}`
              : connectionStatus === 'connecting'
                ? '◌ CONNECTING'
                : '○ OFFLINE'}
          </span>
          <button className="icon-btn" title="Settings" onClick={() => setSettingsOpen(true)}>
            ⚙
          </button>
        </div>
      </header>

      <main className="content">
        {tab === 'voice' && <VoiceChat />}
        {tab === 'agents' && <AgentManagement />}
        {tab === 'chatroom' && <ChatRoom />}
        {tab === 'pipeline' && <IdeaPipeline />}
      </main>

      <button className="wiki-fab" title="Troubleshooting Wiki" onClick={() => setWikiOpen(true)}>
        🛠
      </button>
      {wikiOpen && <TroubleshootingWiki onClose={() => setWikiOpen(false)} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

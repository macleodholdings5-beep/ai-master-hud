import React, { useState } from 'react';
import './App.css';
import VoiceTab from './components/VoiceTab';
import StatusTab from './components/StatusTab';
import WorkflowTab from './components/WorkflowTab';
import SettingsTab from './components/SettingsTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('voice');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Master HUD</h1>
        <nav className="tab-nav">
          <button 
            className={`tab-btn ${activeTab === 'voice' ? 'active' : ''}`}
            onClick={() => setActiveTab('voice')}
          >
            Voice Chat
          </button>
          <button 
            className={`tab-btn ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            Status
          </button>
          <button 
            className={`tab-btn ${activeTab === 'workflow' ? 'active' : ''}`}
            onClick={() => setActiveTab('workflow')}
          >
            Workflow
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>
      </header>

      <main className="app-content">
        {activeTab === 'voice' && <VoiceTab />}
        {activeTab === 'status' && <StatusTab />}
        {activeTab === 'workflow' && <WorkflowTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}
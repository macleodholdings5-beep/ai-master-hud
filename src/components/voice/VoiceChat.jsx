import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../../state/AppState.jsx';
import { RealtimeVoice } from '../../services/realtime.js';
import AgentFace from './AgentFace.jsx';
import StatsPanel from './StatsPanel.jsx';
import Waveform from './Waveform.jsx';

export default function VoiceChat() {
  const { settings, activeAgent, executeCommand, lastCommand } = useAppState();
  const [voiceStatus, setVoiceStatus] = useState('idle'); // idle | connecting | live | error
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [transcript, setTranscript] = useState([]); // { role, text }
  const [manualCmd, setManualCmd] = useState('');
  const voiceRef = useRef(null);
  const partialRef = useRef('');

  useEffect(() => () => voiceRef.current?.stop(), []);

  async function toggleVoice() {
    if (voiceRef.current && voiceStatus !== 'idle' && voiceStatus !== 'error') {
      voiceRef.current.stop();
      voiceRef.current = null;
      return;
    }
    if (!settings.openaiApiKey) {
      setTranscript((t) => [
        ...t,
        { role: 'system', text: 'No OpenAI API key set. Open Settings (⚙) to enable voice.' },
      ]);
      return;
    }
    const voice = new RealtimeVoice({
      apiKey: settings.openaiApiKey,
      instructions: activeAgent?.systemPrompt,
      onStatus: setVoiceStatus,
      onSpeaking: ({ user, agent }) => {
        if (user !== undefined) setUserSpeaking(user);
        if (agent !== undefined) setAgentSpeaking(agent);
      },
      onTranscript: ({ role, text, final }) => {
        if (!final) {
          partialRef.current += text;
          return;
        }
        partialRef.current = '';
        setTranscript((t) => [...t.slice(-49), { role, text }]);
      },
      onCommand: (command) => executeCommand(command),
    });
    voiceRef.current = voice;
    try {
      await voice.start();
    } catch (err) {
      setVoiceStatus('error');
      setTranscript((t) => [...t, { role: 'system', text: `Voice error: ${err.message}` }]);
    }
  }

  async function runManual(e) {
    e.preventDefault();
    if (!manualCmd.trim()) return;
    const cmd = manualCmd.trim();
    setManualCmd('');
    await executeCommand(cmd);
  }

  return (
    <div className="voice-layout">
      <StatsPanel />

      <section className="voice-center">
        <div className="agent-header">
          <h2>{activeAgent ? activeAgent.name.toUpperCase() : 'NO AGENT'}</h2>
          <span className={`status-dot ${activeAgent?.status || 'offline'}`} />
        </div>

        <AgentFace speaking={agentSpeaking} status={activeAgent?.status || 'offline'} />

        <Waveform userSpeaking={userSpeaking} agentSpeaking={agentSpeaking} />

        <button
          className={`voice-toggle ${voiceStatus}`}
          onClick={toggleVoice}
          disabled={voiceStatus === 'connecting'}
        >
          {voiceStatus === 'live'
            ? '■ STOP VOICE'
            : voiceStatus === 'connecting'
              ? '… CONNECTING'
              : '▶ START VOICE'}
        </button>

        {settings.showTranscript && (
          <div className="transcript panel">
            {transcript.length === 0 ? (
              <p className="muted">Transcript will appear here.</p>
            ) : (
              transcript.map((line, i) => (
                <p key={i} className={`t-${line.role}`}>
                  <strong>{line.role === 'user' ? 'YOU' : line.role === 'agent' ? activeAgent?.name?.toUpperCase() || 'AGENT' : 'SYS'}</strong>{' '}
                  {line.text}
                </p>
              ))
            )}
          </div>
        )}
      </section>

      <aside className="command-panel panel">
        <h3>COMMAND FEEDBACK</h3>
        {lastCommand ? (
          <div className={`cmd-card ${lastCommand.status}`}>
            <code>$ {lastCommand.command}</code>
            <span className="cmd-status">{lastCommand.status.toUpperCase()}</span>
            {lastCommand.output && <pre>{lastCommand.output}</pre>}
          </div>
        ) : (
          <p className="muted">No commands executed yet.</p>
        )}
        <form onSubmit={runManual} className="cmd-form">
          <input
            value={manualCmd}
            onChange={(e) => setManualCmd(e.target.value)}
            placeholder="manual command…"
          />
          <button type="submit">RUN</button>
        </form>
      </aside>
    </div>
  );
}

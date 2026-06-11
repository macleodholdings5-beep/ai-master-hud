import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createGateway } from '../services/gateway.js';

const AppStateContext = createContext(null);

const SETTINGS_KEY = 'hud.settings';

const defaultSettings = {
  gatewayUrl: '', // empty -> demo mode
  gatewayToken: '',
  openaiApiKey: '',
  showTranscript: true,
};

function loadSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return { ...defaultSettings };
  }
}

export function AppStateProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [agents, setAgents] = useState([]);
  const [activeAgentId, setActiveAgentId] = useState('foreman');
  const [stats, setStats] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [wikiEntries, setWikiEntries] = useState([]);
  const [lastCommand, setLastCommand] = useState(null); // { command, status, output }
  const gatewayRef = useRef(null);
  const pendingExec = useRef(new Map()); // execId -> resolve fn

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // (Re)connect gateway whenever connection settings change.
  useEffect(() => {
    const gw = createGateway(settings);
    gatewayRef.current = gw;
    const offs = [
      gw.on('status', setConnectionStatus),
      gw.on('stats', setStats),
      gw.on('agents', (list) => setAgents(list.map((a) => ({ ...a })))),
      gw.on('chat', (msg) => setChatMessages((prev) => [...prev.slice(-499), msg])),
      gw.on('ideas', setIdeas),
      gw.on('wiki', setWikiEntries),
      gw.on('idea_new', (idea) => setIdeas((prev) => [...prev, idea])),
      gw.on('idea_update', (patch) =>
        setIdeas((prev) => prev.map((i) => (i.id === patch.id ? { ...i, ...patch } : i)))
      ),
      gw.on('exec_result', ({ id, ok, output }) => {
        setLastCommand((prev) =>
          prev && prev.id === id ? { ...prev, status: ok ? 'ok' : 'failed', output } : prev
        );
        const resolve = pendingExec.current.get(id);
        if (resolve) {
          pendingExec.current.delete(id);
          resolve(output);
        }
      }),
    ];
    gw.start();
    return () => {
      offs.forEach((off) => off());
      gw.stop();
    };
  }, [settings.gatewayUrl, settings.gatewayToken]);

  const api = useMemo(
    () => ({
      executeCommand(command) {
        const id = gatewayRef.current.executeCommand(command);
        setLastCommand({ id, command, status: 'running', output: '' });
        return new Promise((resolve) => {
          pendingExec.current.set(id, resolve);
          setTimeout(() => {
            if (pendingExec.current.delete(id)) resolve('(timed out waiting for gateway)');
          }, 30000);
        });
      },
      sendChatCommand(text) {
        gatewayRef.current.sendChatCommand(text);
      },
      captureIdea(title) {
        gatewayRef.current.captureIdea(title);
      },
      reviewIdea(ideaId, approved, feedback) {
        gatewayRef.current.reviewIdea(ideaId, approved, feedback);
      },
      updateAgent(id, patch) {
        setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
      },
      addWikiEntry(entry) {
        setWikiEntries((prev) => [{ id: `w-${Date.now()}`, ...entry }, ...prev]);
      },
    }),
    []
  );

  const value = {
    settings,
    setSettings,
    connectionStatus,
    agents,
    activeAgentId,
    setActiveAgentId,
    activeAgent: agents.find((a) => a.id === activeAgentId) || agents[0] || null,
    stats,
    chatMessages,
    ideas,
    wikiEntries,
    lastCommand,
    ...api,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  return useContext(AppStateContext);
}

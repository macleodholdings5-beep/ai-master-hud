import React from 'react';
import { useAppState } from '../../state/AppState.jsx';

function Bar({ label, value, unit = '%', warn = 80 }) {
  const pct = Math.min(100, unit === '%' ? value : (value / 250) * 100);
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <div className="stat-bar">
        <div
          className={`stat-fill ${value > warn ? 'hot' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="stat-value">
        {Math.round(value)}
        {unit}
      </span>
    </div>
  );
}

export default function StatsPanel() {
  const { stats } = useAppState();
  return (
    <aside className="stats-panel panel">
      <h3>HOME LAB</h3>
      {stats ? (
        <>
          <Bar label="CPU" value={stats.cpu} />
          <Bar label="MEM" value={stats.mem} />
          <Bar label="DISK" value={stats.disk} />
          <Bar label="NET" value={stats.latency} unit="ms" warn={150} />
          <div className="stat-row">
            <span className="stat-label">FIREWALL</span>
            <span className={`stat-flag ${stats.firewall ? 'ok' : 'bad'}`}>
              {stats.firewall ? 'ACTIVE' : 'DOWN'}
            </span>
          </div>
          <div className="stat-row">
            <span className="stat-label">THREATS</span>
            <span className={`stat-flag ${stats.threats === 0 ? 'ok' : 'bad'}`}>
              {stats.threats === 0 ? 'NONE' : stats.threats}
            </span>
          </div>
        </>
      ) : (
        <p className="muted">Awaiting telemetry…</p>
      )}
      <div className="security-feed">
        <h4>SECURITY FEED</h4>
        <div className="feed-placeholder">CAM-01 · no feed configured</div>
      </div>
    </aside>
  );
}

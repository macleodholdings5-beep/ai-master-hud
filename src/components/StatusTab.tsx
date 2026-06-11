import React, { useState, useEffect } from 'react';
import './StatusTab.css';

export default function StatusTab() {
  const [stats, setStats] = useState({ cpu: 0, memory: 0, disk: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="status-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">CPU Usage</div>
          <div className="stat-value">{Math.round(stats.cpu)}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Memory Usage</div>
          <div className="stat-value">{Math.round(stats.memory)}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Disk Usage</div>
          <div className="stat-value">{Math.round(stats.disk)}%</div>
        </div>
      </div>
    </div>
  );
}
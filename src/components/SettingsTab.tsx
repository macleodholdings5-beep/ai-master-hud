import React, { useState } from 'react';
import './SettingsTab.css';

export default function SettingsTab() {
  const [gateway, setGateway] = useState('ws://192.168.2.1:8000');

  return (
    <div className="settings-tab">
      <div className="settings-form">
        <div className="form-group">
          <label>Gateway URL</label>
          <input 
            type="text"
            value={gateway}
            onChange={(e) => setGateway(e.target.value)}
          />
        </div>
        <button className="save-btn">Save Settings</button>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import './VoiceTab.css';

export default function VoiceTab() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="voice-tab">
      <div className="agent-face">
        <div className="matrix-face">
          <div className="eye left"></div>
          <div className="eye right"></div>
          <div className="mouth"></div>
        </div>
      </div>

      <div className="voice-controls">
        <button 
          className={`listen-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
        >
          {isListening ? '🎤 Listening...' : '🎤 Start Listening'}
        </button>
      </div>

      <div className="transcript-area">
        <div className="label">Transcript</div>
        <div className="content">{transcript || 'Awaiting input...'}</div>
      </div>
    </div>
  );
}
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import './VoiceTab.css';
export default function VoiceTab() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const toggleListening = () => {
        setIsListening(!isListening);
    };
    return (_jsxs("div", { className: "voice-tab", children: [_jsx("div", { className: "agent-face", children: _jsxs("div", { className: "matrix-face", children: [_jsx("div", { className: "eye left" }), _jsx("div", { className: "eye right" }), _jsx("div", { className: "mouth" })] }) }), _jsx("div", { className: "voice-controls", children: _jsx("button", { className: `listen-btn ${isListening ? 'listening' : ''}`, onClick: toggleListening, children: isListening ? '🎤 Listening...' : '🎤 Start Listening' }) }), _jsxs("div", { className: "transcript-area", children: [_jsx("div", { className: "label", children: "Transcript" }), _jsx("div", { className: "content", children: transcript || 'Awaiting input...' })] })] }));
}

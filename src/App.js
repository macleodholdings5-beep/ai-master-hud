import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import './App.css';
import VoiceTab from './components/VoiceTab';
import StatusTab from './components/StatusTab';
import WorkflowTab from './components/WorkflowTab';
import SettingsTab from './components/SettingsTab';
export default function App() {
    const [activeTab, setActiveTab] = useState('voice');
    return (_jsxs("div", { className: "app-container", children: [_jsxs("header", { className: "app-header", children: [_jsx("h1", { children: "AI Master HUD" }), _jsxs("nav", { className: "tab-nav", children: [_jsx("button", { className: `tab-btn ${activeTab === 'voice' ? 'active' : ''}`, onClick: () => setActiveTab('voice'), children: "Voice Chat" }), _jsx("button", { className: `tab-btn ${activeTab === 'status' ? 'active' : ''}`, onClick: () => setActiveTab('status'), children: "Status" }), _jsx("button", { className: `tab-btn ${activeTab === 'workflow' ? 'active' : ''}`, onClick: () => setActiveTab('workflow'), children: "Workflow" }), _jsx("button", { className: `tab-btn ${activeTab === 'settings' ? 'active' : ''}`, onClick: () => setActiveTab('settings'), children: "Settings" })] })] }), _jsxs("main", { className: "app-content", children: [activeTab === 'voice' && _jsx(VoiceTab, {}), activeTab === 'status' && _jsx(StatusTab, {}), activeTab === 'workflow' && _jsx(WorkflowTab, {}), activeTab === 'settings' && _jsx(SettingsTab, {})] })] }));
}

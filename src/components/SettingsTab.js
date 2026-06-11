import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import './SettingsTab.css';
export default function SettingsTab() {
    const [gateway, setGateway] = useState('ws://192.168.2.1:8000');
    return (_jsx("div", { className: "settings-tab", children: _jsxs("div", { className: "settings-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Gateway URL" }), _jsx("input", { type: "text", value: gateway, onChange: (e) => setGateway(e.target.value) })] }), _jsx("button", { className: "save-btn", children: "Save Settings" })] }) }));
}

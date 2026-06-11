import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
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
    return (_jsx("div", { className: "status-tab", children: _jsxs("div", { className: "stats-grid", children: [_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "CPU Usage" }), _jsxs("div", { className: "stat-value", children: [Math.round(stats.cpu), "%"] })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Memory Usage" }), _jsxs("div", { className: "stat-value", children: [Math.round(stats.memory), "%"] })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Disk Usage" }), _jsxs("div", { className: "stat-value", children: [Math.round(stats.disk), "%"] })] })] }) }));
}

import { saveToStorage, getFromStorage } from './storage.js';

let lines = [];
export function getConnections() {
    return getFromStorage('connections', []);
}
export function setConnections(conns) {
    saveToStorage('connections', conns);
}
export function clearLines() {
    lines.forEach(line => line.remove());
    lines = [];
}
export function drawConnections(nodes, groups) {
    clearLines();
    const nodeMap = {};
    document.querySelectorAll('.node').forEach(el => {
        nodeMap[el.dataset.nodeId] = el.querySelector('.circle');
    });
    const groupMap = {};
    document.querySelectorAll('.group-node').forEach(el => {
        groupMap[el.dataset.groupId] = el.querySelector('.circle');
    });
    const connections = getConnections();
    connections.forEach(conn => {
        let color = "#a690e1";
        let thickness = 4;
        if (conn.type === "node") {
            const from = nodeMap[conn.from];
            const to = nodeMap[conn.to];
            const srcNode = nodes.find(n => n.id === conn.from);
            if (from && to) {
                lines.push(new LeaderLine(from, to, { color: srcNode?.color || color, size: thickness }));
            }
        }
        if (conn.type === "group") {
            color = conn.color || "#f6c94a";
            const from = groupMap[conn.group];
            const to = nodeMap[conn.node];
            if (from && to) {
                lines.push(new LeaderLine(from, to, { color, size: thickness }));
            }
        }
        if (conn.type === "group2user") {
            color = conn.color || "#f6c94a";
            const from = nodeMap[conn.user];
            const to = groupMap[conn.group];
            if (from && to) {
                lines.push(new LeaderLine(from, to, { color, size: thickness }));
            }
        }
    });
}
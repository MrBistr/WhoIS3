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
        if (conn.type === "node") {
            const from = nodeMap[conn.from];
            const to = nodeMap[conn.to];
            if (from && to) {
                lines.push(new LeaderLine(from, to, { color: '#b48ffa', size: 2 }));
            }
        }
        if (conn.type === "group") {
            const from = groupMap[conn.group];
            const to = nodeMap[conn.node];
            if (from && to) {
                lines.push(new LeaderLine(from, to, { color: conn.color, size: 2 }));
            }
        }
        if (conn.type === "group2user") {
            const from = nodeMap[conn.user];
            const to = groupMap[conn.group];
            if (from && to) {
                lines.push(new LeaderLine(from, to, { color: conn.color || "#b48ffa", size: 2 }));
            }
        }
    });
}
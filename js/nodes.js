import { saveToStorage, getFromStorage } from './storage.js';

const nodesContainer = document.getElementById('nodes-container');

function getRandomBrightColor() {
    // HSL, random hue, full saturation, mid-high lightness
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 90%, 55%)`;
}

export function getNodes() {
    return getFromStorage('nodes', []);
}
export function setNodes(nodes) {
    saveToStorage('nodes', nodes);
}
export function createNodeDOM(node, isSelected, isMain) {
    const el = document.createElement('div');
    let nodeClass = 'node';
    if (isMain) nodeClass += ' main';
    if (!isMain && !node.isFilled) nodeClass += ' unfilled';
    if (isSelected) nodeClass += ' selected';
    el.className = nodeClass;
    el.style.top = node.top;
    el.style.left = node.left;
    el.dataset.nodeId = node.id;

    // Circle
    const circle = document.createElement('div');
    circle.className = 'circle';
    circle.style.borderColor = node.color || "#bbb";
    if (isMain) {
        circle.style.borderColor = node.color || "#19e819";
        circle.style.background = "#e4e4e4";
        circle.style.width = "110px";
        circle.style.height = "110px";
    }
    if (node.isFilled && !isMain) {
        circle.style.background = node.color;
        circle.style.borderColor = node.color;
        circle.style.color = node.color;
    }
    if (!isMain && !node.isFilled) {
        circle.style.background = "#fff";
        circle.style.borderColor = node.color;
    }
    if (node.image) {
        const img = document.createElement('img');
        img.src = node.image;
        circle.appendChild(img);
    }
    el.appendChild(circle);

    // Label
    const label = document.createElement('div');
    label.className = isMain ? "node-label" : (node.isFilled ? "group-label" : "node-label");
    label.textContent = node.name + (node.jobTitle ? `\n${node.jobTitle}` : "");
    label.style.color = (node.isFilled && !isMain) ? node.color : "#444";
    el.appendChild(label);

    nodesContainer.appendChild(el);
    return el;
}
export function clearNodes() {
    nodesContainer.querySelectorAll('.node').forEach(el => el.remove());
}
export function getRandomBrightColor() {
    return getRandomBrightColor();
}
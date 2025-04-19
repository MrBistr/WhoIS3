import { saveToStorage, getFromStorage } from './storage.js';
import { getRandomBrightColor } from './nodes.js';

const nodesContainer = document.getElementById('nodes-container');
export function getGroups() {
    return getFromStorage('groups', []);
}
export function setGroups(groups) {
    saveToStorage('groups', groups);
}
export function createGroupDOM(group, isSelected) {
    // For scheme1, group is just a node with isFilled = true
    const el = document.createElement('div');
    el.className = 'group-node' + (isSelected ? ' selected' : '');
    el.style.top = group.top;
    el.style.left = group.left;
    el.dataset.groupId = group.id;

    const circle = document.createElement('div');
    circle.className = 'circle';
    circle.style.background = group.color;
    circle.style.borderColor = group.color;
    circle.style.color = group.color;
    el.appendChild(circle);

    const label = document.createElement('div');
    label.className = 'group-label';
    label.textContent = group.name;
    label.style.color = group.color;
    el.appendChild(label);

    nodesContainer.appendChild(el);
    return el;
}
export function clearGroups() {
    nodesContainer.querySelectorAll('.group-node').forEach(el => el.remove());
}
export function randomColor() {
    return getRandomBrightColor();
}
import { saveToStorage, getFromStorage } from './storage.js';

const nodesContainer = document.getElementById('nodes-container');
export const colorOptions = [
    "#f6c94a", "#8d6be9", "#54b6f7", "#fa6bb8", "#90e16b",
    "#ff6978", "#30d5c8", "#ffb347", "#b28dff", "#6decb9"
];
export function getGroups() {
    return getFromStorage('groups', []);
}
export function setGroups(groups) {
    saveToStorage('groups', groups);
}
export function createGroupDOM(group, isSelected) {
    const el = document.createElement('div');
    el.className = 'group-node' + (isSelected ? ' selected' : '');
    el.style.top = group.top;
    el.style.left = group.left;
    el.dataset.groupId = group.id;

    const circle = document.createElement('div');
    circle.className = 'circle';
    circle.style.borderColor = group.color;
    el.appendChild(circle);

    const label = document.createElement('div');
    label.className = 'group-label';
    label.textContent = group.name;
    label.style.color = "#23243a";
    el.appendChild(label);

    nodesContainer.appendChild(el);
    return el;
}
export function clearGroups() {
    nodesContainer.querySelectorAll('.group-node').forEach(el => el.remove());
}
export function randomColor() {
    return colorOptions[Math.floor(Math.random()*colorOptions.length)];
}
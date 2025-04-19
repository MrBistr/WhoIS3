import { saveToStorage, getFromStorage } from './storage.js';

const nodesContainer = document.getElementById('nodes-container');
export function getGroups() {
    return getFromStorage('groups', []);
}
export function setGroups(groups) {
    saveToStorage('groups', groups);
}
const groupColors = [
    "#e76fd1","#7d6cf6","#6d65c4","#a181f8","#b48ffa"
];
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
    el.appendChild(label);

    nodesContainer.appendChild(el);
    return el;
}
export function clearGroups() {
    nodesContainer.querySelectorAll('.group-node').forEach(el => el.remove());
}
export function randomColor() {
    return groupColors[Math.floor(Math.random()*groupColors.length)];
}
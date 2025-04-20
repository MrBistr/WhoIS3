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

    // EDIT BUTTON
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.title = "Edit";
    editBtn.innerHTML = `
      <svg viewBox="0 0 24 24"><rect width="24" height="24" fill="none"/><path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm14.71-9.04c.18-.18.29-.43.29-.71s-.11-.53-.29-.71l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#fff" stroke="#a95e00" stroke-width="1.2"/></svg>
    `;
    editBtn.onclick = (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        window.showGroupForm(group);
    };
    circle.appendChild(editBtn);

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
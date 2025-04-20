import { saveToStorage, getFromStorage } from './storage.js';

const nodesContainer = document.getElementById('nodes-container');

export function getNodes() {
    return getFromStorage('nodes', []);
}
export function setNodes(nodes) {
    saveToStorage('nodes', nodes);
}
export function createNodeDOM(node, isSelected, isMain) {
    const el = document.createElement('div');
    el.className = 'node' + (isMain ? ' main' : '') + (isSelected ? ' selected' : '');
    el.style.top = node.top;
    el.style.left = node.left;
    el.dataset.nodeId = node.id;

    const circle = document.createElement('div');
    circle.className = 'circle';
    circle.style.borderColor = node.color || "#a690e1";
    if (node.image) {
        const img = document.createElement('img');
        img.src = node.image;
        circle.appendChild(img);
    }
    el.appendChild(circle);

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
        window.showNodeForm(node);
    };
    circle.appendChild(editBtn);

    const label = document.createElement('div');
    label.className = 'node-label';
    label.innerHTML = `<strong>${node.name}</strong><br>${node.jobTitle}`;
    el.appendChild(label);

    nodesContainer.appendChild(el);
    return el;
}
export function clearNodes() {
    nodesContainer.querySelectorAll('.node').forEach(el => el.remove());
}
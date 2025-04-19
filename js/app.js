import { getNodes, setNodes, createNodeDOM, clearNodes } from './nodes.js';
import { getConnections, setConnections, drawConnections } from './connections.js';
import { getGroups, setGroups, createGroupDOM, clearGroups, randomColor, colorOptions } from './groups.js';

let nodes = getNodes();
let connections = getConnections();
let groups = getGroups();
let selectedNodeId = null;
let selectedGroupId = null;
let editingNodeId = null;
let editingGroupId = null;

function render() {
    clearNodes();
    clearGroups();
    nodes = getNodes();
    groups = getGroups();
    connections = getConnections();
    nodes.forEach((node, idx) => createNodeDOM(node, node.id === selectedNodeId, idx === 0));
    groups.forEach(g => createGroupDOM(g, g.id === selectedGroupId));
    setTimeout(() => drawConnections(nodes, groups), 0);
    enableDragAndDrop();
}

// Demo background fade out on start
document.getElementById('get-started-btn').onclick = function() {
    document.getElementById('hero').style.display = 'block';
    const demoBg = document.getElementById('demo-bg');
    demoBg.classList.add('hide');
    setTimeout(() => {
        document.getElementById('hero').style.display = 'none';
        document.getElementById('floating-buttons').classList.remove('hidden');
        nodes = getNodes();
        if (!nodes || nodes.length === 0) {
            const width = window.innerWidth, height = window.innerHeight;
            const node = {
                id: "main-user",
                name: "You",
                jobTitle: "Your Title",
                color: colorOptions[0],
                image: "",
                top: `${height/2 - 63}px`,
                left: `${width/2 - 63}px`,
                floating: false
            };
            setNodes([node]);
            render();
        }
    }, 700);
};

const addNodeFab = document.getElementById('add-node-fab');
const inputForm = document.getElementById('input-form');
addNodeFab.addEventListener('click', function(e) {
    e.stopPropagation();
    showNodeForm();
});
const groupBtn = document.getElementById('add-group-btn');
const groupForm = document.getElementById('group-form');
groupBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    showGroupForm();
});

function hideFormsIfClickedOutside(e) {
    if (!inputForm.classList.contains('hidden') && !inputForm.contains(e.target) && !addNodeFab.contains(e.target)) {
        inputForm.classList.add('hidden');
    }
    if (!groupForm.classList.contains('hidden') && !groupForm.contains(e.target) && !groupBtn.contains(e.target)) {
        groupForm.classList.add('hidden');
    }
}
document.addEventListener('mousedown', hideFormsIfClickedOutside);
document.addEventListener('touchstart', hideFormsIfClickedOutside);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        inputForm.classList.add('hidden');
        groupForm.classList.add('hidden');
    }
});

function buildColorPicker(containerId, currentColor, onPick) {
    const picker = document.getElementById(containerId);
    picker.innerHTML = '';
    colorOptions.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.background = color;
        if (color === currentColor) swatch.classList.add('selected');
        swatch.onclick = () => {
            Array.from(picker.children).forEach(s => s.classList.remove('selected'));
            swatch.classList.add('selected');
            onPick(color);
        };
        picker.appendChild(swatch);
    });
}

function buildConnectionDropdown(selectedId) {
    const select = document.getElementById('connection-select');
    select.innerHTML = '<option value="">None</option>';
    nodes.forEach(n => {
        if (n.id !== editingNodeId) {
            const opt = document.createElement('option');
            opt.value = n.id;
            opt.textContent = n.name + (n.jobTitle ? ' (' + n.jobTitle + ')' : '');
            if (selectedId === n.id) opt.selected = true;
            select.appendChild(opt);
        }
    });
    groups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = '[Group] ' + g.name;
        if (selectedId === g.id) opt.selected = true;
        select.appendChild(opt);
    });
}

function showNodeForm(editNode = null) {
    inputForm.classList.remove('hidden');
    groupForm.classList.add('hidden');
    editingNodeId = editNode ? editNode.id : null;
    document.getElementById('form-title').textContent = editNode ? 'Edit Node' : 'Add a Node';
    document.getElementById('add-node-btn').textContent = editNode ? 'Update Node' : 'Add Node';

    let nodeColor = editNode ? editNode.color : colorOptions[0];
    buildColorPicker('color-picker', nodeColor, (picked) => { nodeColor = picked; });

    let currentConnId = "";
    if (editNode) {
        document.getElementById('name-input').value = editNode.name;
        document.getElementById('job-title-input').value = editNode.jobTitle;
        document.getElementById('image-upload').value = "";
        // Find current connection for this node (if any)
        const conn = connections.find(c => 
            (c.type === 'node' && (c.from === editNode.id || c.to === editNode.id)) ||
            (c.type === 'group' && c.node === editNode.id)
        );
        currentConnId =
            conn ?
            (conn.type === 'node'
                ? (conn.from === editNode.id ? conn.to : conn.from)
                : conn.group)
            : "";
    } else {
        document.getElementById('name-input').value = "";
        document.getElementById('job-title-input').value = "";
        document.getElementById('image-upload').value = "";
    }
    buildConnectionDropdown(currentConnId);

    document.getElementById('name-input').focus();

    document.getElementById('add-node-btn').onclick = function() {
        const name = document.getElementById('name-input').value.trim();
        const jobTitle = document.getElementById('job-title-input').value.trim();
        const fileInput = document.getElementById('image-upload');
        const connTarget = document.getElementById('connection-select').value;
        if (!name || !jobTitle) {
            alert('Please fill in all fields.');
            return;
        }
        const saveNode = (image) => {
            let thisId = editingNodeId;
            if (editingNodeId) {
                nodes = nodes.map(n =>
                    n.id === editingNodeId ? { ...n, name, jobTitle, image: image || n.image, color: nodeColor } : n
                );
                setNodes(nodes);
            } else {
                thisId = 'n' + Date.now() + Math.floor(Math.random()*100000);
                let top = `${Math.random() * (window.innerHeight-220) + 120}px`;
                let left = `${Math.random() * (window.innerWidth-220) + 120}px`;
                const node = { id: thisId, name, jobTitle, image, color: nodeColor, top, left, floating: true };
                nodes.push(node);
                setNodes(nodes);
            }

            // Remove old connections for this node (if editing)
            connections = getConnections().filter(c =>
                !((c.type === 'node' && (c.from === thisId || c.to === thisId)) ||
                (c.type === 'group' && c.node === thisId))
            );
            // Add new connection if selected
            if (connTarget) {
                if (groups.find(g => g.id === connTarget)) {
                    connections.push({ type: "group", group: connTarget, node: thisId, color: groups.find(g => g.id === connTarget).color });
                } else {
                    connections.push({ type: "node", from: thisId, to: connTarget });
                }
                // Move node close to target
                let n = nodes.find(n => n.id === thisId);
                let t, l;
                if (groups.find(g => g.id === connTarget)) {
                    let g = groups.find(g => g.id === connTarget);
                    t = parseFloat(g.top) + 70;
                    l = parseFloat(g.left) + 70;
                } else {
                    let n2 = nodes.find(nn => nn.id === connTarget);
                    t = parseFloat(n2.top) + 90;
                    l = parseFloat(n2.left) + 90;
                }
                if (n) {
                    n.top = `${t}px`;
                    n.left = `${l}px`;
                    setNodes(nodes);
                }
            }
            setConnections(connections);

            inputForm.classList.add('hidden');
            editingNodeId = null;
            render();
        };
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                saveNode(e.target.result);
                fileInput.value = '';
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            saveNode();
        }
    };
}

function showGroupForm(editGroup = null) {
    groupForm.classList.remove('hidden');
    inputForm.classList.add('hidden');
    editingGroupId = editGroup ? editGroup.id : null;
    document.getElementById('group-form-title').textContent = editGroup ? 'Edit Group' : 'Add a Group';
    document.getElementById('create-group-btn').textContent = editGroup ? 'Update Group' : 'Create Group';

    let groupColor = editGroup ? editGroup.color : colorOptions[0];
    buildColorPicker('group-color-picker', groupColor, (picked) => { groupColor = picked; });

    if (editGroup) {
        document.getElementById('group-name-input').value = editGroup.name;
    } else {
        document.getElementById('group-name-input').value = "";
    }
    document.getElementById('group-name-input').focus();

    document.getElementById('create-group-btn').onclick = function() {
        const groupName = document.getElementById('group-name-input').value.trim();
        if (!groupName) {
            alert('Please enter a group name.');
            return;
        }
        if (editingGroupId) {
            groups = groups.map(g =>
                g.id === editingGroupId ? { ...g, name: groupName, color: groupColor } : g
            );
            setGroups(groups);
            groupForm.classList.add('hidden');
            editingGroupId = null;
            render();
        } else {
            const id = 'g' + Date.now() + Math.floor(Math.random()*100000);
            const top = `${Math.random() * (window.innerHeight-200) + 100}px`;
            const left = `${Math.random() * (window.innerWidth-200) + 100}px`;
            const group = { id, name: groupName, color: groupColor, top, left };
            groups.push(group);
            setGroups(groups);
            // Optionally connect to main if exists:
            if (nodes.length > 0) {
                const userId = nodes[0].id;
                connections.push({ type: "group2user", group: id, user: userId, color: groupColor });
                setConnections(connections);
            }
            groupForm.classList.add('hidden');
            render();
        }
    };
}

document.getElementById('nodes-container').addEventListener('click', function(e) {
    const nodeEl = e.target.closest('.node');
    if (nodeEl) {
        const nodeId = nodeEl.dataset.nodeId;
        const node = nodes.find(n => n.id === nodeId);
        showNodeForm(node);
    }
}, true);

function enableDragAndDrop() {
    document.querySelectorAll('.node:not(.main), .group-node').forEach(nodeEl => {
        nodeEl.onmousedown = startDrag;
        nodeEl.ontouchstart = startDrag;
    });
}
let dragData = null;
function startDrag(e) {
    e.preventDefault();
    const isTouch = e.type === "touchstart";
    const nodeEl = e.currentTarget;
    nodeEl.classList.add('dragging');
    const isGroup = nodeEl.classList.contains('group-node');
    const id = isGroup ? nodeEl.dataset.groupId : nodeEl.dataset.nodeId;
    let startX, startY;
    if (isTouch) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    } else {
        startX = e.clientX;
        startY = e.clientY;
    }
    const rect = nodeEl.getBoundingClientRect();
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;
    dragData = { isGroup, id, offsetX, offsetY, nodeEl };
    function onMove(ev) {
        let x, y;
        if (ev.type.startsWith('touch')) {
            x = ev.touches[0].clientX;
            y = ev.touches[0].clientY;
        } else {
            x = ev.clientX;
            y = ev.clientY;
        }
        nodeEl.style.left = `${x - offsetX}px`;
        nodeEl.style.top = `${y - offsetY}px`;
    }
    function onUp(ev) {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
        nodeEl.classList.remove('dragging');
        let x, y;
        if (ev.type.startsWith('touch')) {
            x = ev.changedTouches[0].clientX;
            y = ev.changedTouches[0].clientY;
        } else {
            x = ev.clientX;
            y = ev.clientY;
        }
        const dropTarget = document.elementFromPoint(x, y);
        const targetNode = dropTarget.closest('.node');
        const targetGroup = dropTarget.closest('.group-node');
        if (!dragData.isGroup && targetNode && targetNode.dataset.nodeId !== dragData.id) {
            if (!connections.find(c =>
                c.type === "node" && ((c.from === dragData.id && c.to === targetNode.dataset.nodeId) || (c.from === targetNode.dataset.nodeId && c.to === dragData.id)))) {
                connections.push({ type: "node", from: dragData.id, to: targetNode.dataset.nodeId });
                setConnections(connections);
                nodes = nodes.map(n => {
                    if (n.id === dragData.id || n.id === targetNode.dataset.nodeId) {
                        n.floating = false;
                        const other = nodes.find(nn => nn.id === (n.id === dragData.id ? targetNode.dataset.nodeId : dragData.id));
                        if (other) {
                            let t1 = parseFloat(n.top), l1 = parseFloat(n.left);
                            let t2 = parseFloat(other.top), l2 = parseFloat(other.left);
                            const newTop = t1 + 0.35 * (t2 - t1);
                            const newLeft = l1 + 0.35 * (l2 - l1);
                            n.top = `${newTop}px`;
                            n.left = `${newLeft}px`;
                        }
                    }
                    return n;
                });
                setNodes(nodes);
            }
        }
        if (!dragData.isGroup && targetGroup) {
            if (!connections.find(c => c.type === "group" && c.group === targetGroup.dataset.groupId && c.node === dragData.id)) {
                const group = groups.find(g => g.id === targetGroup.dataset.groupId);
                connections.push({ type: "group", group: targetGroup.dataset.groupId, node: dragData.id, color: group.color });
                setConnections(connections);
                nodes = nodes.map(n => {
                    if (n.id === dragData.id) {
                        n.floating = false;
                        let t1 = parseFloat(n.top), l1 = parseFloat(n.left);
                        let t2 = parseFloat(group.top), l2 = parseFloat(group.left);
                        const newTop = t1 + 0.35 * (t2 - t1);
                        const newLeft = l1 + 0.35 * (l2 - l1);
                        n.top = `${newTop}px`;
                        n.left = `${newLeft}px`;
                    }
                    return n;
                });
                setNodes(nodes);
            }
        }
        if (!dragData.isGroup) {
            nodes = nodes.map(n => n.id === dragData.id ? {
                ...n,
                top: nodeEl.style.top,
                left: nodeEl.style.left
            } : n);
            setNodes(nodes);
        } else {
            groups = groups.map(g => g.id === dragData.id ? {
                ...g,
                top: nodeEl.style.top,
                left: nodeEl.style.left
            } : g);
            setGroups(groups);
        }
        dragData = null;
        render();
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onUp);
}

// Magnetic/Gravitational pull animation
function floatNodesWithGravity() {
    if (nodes.length === 0) return;
    nodes = getNodes();
    connections = getConnections();
    if (nodes[0]) {
        nodes[0].top = `${window.innerHeight/2 - 63}px`;
        nodes[0].left = `${window.innerWidth/2 - 63}px`;
    }
    nodes.forEach((n, idx) => {
        if (idx === 0) return;
        let target = null;
        let conn = connections.find(c =>
            (c.type === 'group' && c.node === n.id) ||
            (c.type === 'node' && c.to === n.id) ||
            (c.type === 'node' && c.from === n.id) ||
            (c.type === 'group2user' && c.user === n.id)
        );
        if (conn) {
            if (conn.type === 'group') {
                const group = groups.find(g => g.id === conn.group);
                if (group) target = group;
            } else if (conn.type === 'node') {
                const otherId = conn.from === n.id ? conn.to : conn.from;
                const other = nodes.find(nn => nn.id === otherId);
                if (other) target = other;
            } else if (conn.type === 'group2user') {
                target = nodes[0];
            }
        } else {
            let t = parseFloat(n.top), l = parseFloat(n.left);
            t += Math.sin(Date.now()/250 + l)*0.7;
            l += Math.cos(Date.now()/350 + t)*0.7;
            n.top = `${t}px`; n.left = `${l}px`;
        }
        if (target) {
            let t1 = parseFloat(n.top), l1 = parseFloat(n.left);
            let t2 = parseFloat(target.top), l2 = parseFloat(target.left);
            const dx = l2 - l1, dy = t2 - t1;
            const dist = Math.max(1, Math.sqrt(dx*dx + dy*dy));
            if (dist > 60) {
                const step = Math.min(0.13 + Math.log(dist+1)/40, 0.21);
                n.top = `${t1 + dy*step}px`;
                n.left = `${l1 + dx*step}px`;
            }
        }
        const dom = document.querySelector(`.node[data-node-id="${n.id}"]`);
        if(dom && !dom.classList.contains('dragging')) { dom.style.top = n.top; dom.style.left = n.left; }
    });
    setNodes(nodes);
    setTimeout(floatNodesWithGravity, 38);
}
floatNodesWithGravity();

window.onload = render;
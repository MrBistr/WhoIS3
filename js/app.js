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
let canvasPan = { active: false, lastX: 0, lastY: 0, offsetX: 0, offsetY: 0 };

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

document.getElementById('get-started-btn').onclick = function() {
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

function buildConnectionDropdown(selectedId, skipId) {
    const select = document.getElementById('connection-select');
    select.innerHTML = '<option value="">None</option>';
    nodes.forEach(n => {
        if (n.id !== skipId) {
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

function getTargetColor(targetId) {
    let target = nodes.find(n => n.id === targetId);
    if (target) return target.color;
    let group = groups.find(g => g.id === targetId);
    if (group) return group.color;
    return colorOptions[0];
}

function clearNodeFormInputs() {
    document.getElementById('name-input').value = "";
    document.getElementById('job-title-input').value = "";
    document.getElementById('image-upload').value = "";
}

function showNodeForm(editNode = null) {
    inputForm.classList.remove('hidden');
    groupForm.classList.add('hidden');
    editingNodeId = editNode ? editNode.id : null;
    document.getElementById('form-title').textContent = 'Edit Node';
    document.getElementById('add-node-btn').textContent = 'Save Node';

    let nodeColor = editNode ? editNode.color : colorOptions[0];
    buildColorPicker('color-picker', nodeColor, (picked) => { nodeColor = picked; });

    let currentConnId = "";
    if (editNode) {
        document.getElementById('name-input').value = editNode.name;
        document.getElementById('job-title-input').value = editNode.jobTitle;
        document.getElementById('image-upload').value = "";
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
        clearNodeFormInputs();
    }
    buildConnectionDropdown(currentConnId, editingNodeId);

    document.getElementById('connection-select').onchange = function() {
        const val = this.value;
        if (val) {
            nodeColor = getTargetColor(val);
            buildColorPicker('color-picker', nodeColor, (picked) => { nodeColor = picked; });
        }
    };

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
                distributeAroundTarget(thisId, connTarget);
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

    document.getElementById('delete-node-btn').onclick = function() {
        if (!editingNodeId) return;
        if (!confirm("Are you sure you want to delete this node?")) return;
        nodes = nodes.filter(n => n.id !== editingNodeId);
        connections = getConnections().filter(c =>
            !((c.type === 'node' && (c.from === editingNodeId || c.to === editingNodeId)) ||
            (c.type === 'group' && c.node === editingNodeId))
        );
        setNodes(nodes);
        setConnections(connections);
        inputForm.classList.add('hidden');
        editingNodeId = null;
        render();
    };
}

window.showNodeForm = showNodeForm;

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
            if (nodes.length > 0) {
                const userId = nodes[0].id;
                connections.push({ type: "group2user", group: id, user: userId, color: groupColor });
                setConnections(connections);
            }
            groupForm.classList.add('hidden');
            render();
        }
    };

    document.getElementById('delete-group-btn').onclick = function() {
        if (!editingGroupId) return;
        if (!confirm("Are you sure you want to delete this group?")) return;
        groups = groups.filter(g => g.id !== editingGroupId);
        connections = getConnections().filter(c =>
            !((c.type === 'group' && c.group === editingGroupId) || (c.type === 'group2user' && c.group === editingGroupId))
        );
        setGroups(groups);
        setConnections(connections);
        groupForm.classList.add('hidden');
        editingGroupId = null;
        render();
    };
}

window.showGroupForm = showGroupForm;

// Canvas panning logic
const nodesContainer = document.getElementById('nodes-container');
nodesContainer.addEventListener('mousedown', onCanvasPanStart);
nodesContainer.addEventListener('touchstart', onCanvasPanStart);
let isDraggingNodeOrGroup = false;
function onCanvasPanStart(e) {
    // Ignore if starting on node/group or their edit button or any button
    if (e.target.closest('.node') || e.target.closest('.group-node') || e.target.closest('.fab') || e.target.closest('.edit-btn')) {
        isDraggingNodeOrGroup = true;
        return;
    }
    isDraggingNodeOrGroup = false;
    e.preventDefault();
    canvasPan.active = true;
    nodesContainer.classList.add('grabbing');
    if (e.type === 'touchstart') {
        canvasPan.lastX = e.touches[0].clientX;
        canvasPan.lastY = e.touches[0].clientY;
    } else {
        canvasPan.lastX = e.clientX;
        canvasPan.lastY = e.clientY;
    }
    document.addEventListener('mousemove', onCanvasPanMove);
    document.addEventListener('mouseup', onCanvasPanEnd);
    document.addEventListener('touchmove', onCanvasPanMove);
    document.addEventListener('touchend', onCanvasPanEnd);
}
function onCanvasPanMove(ev) {
    if (!canvasPan.active) return;
    let x, y;
    if (ev.type.startsWith('touch')) {
        x = ev.touches[0].clientX;
        y = ev.touches[0].clientY;
    } else {
        x = ev.clientX;
        y = ev.clientY;
    }
    const dx = x - canvasPan.lastX;
    const dy = y - canvasPan.lastY;
    // Move all nodes and groups by dx/dy except the main node
    nodes = getNodes().map(n => {
        if (n.id === "main-user") return n;
        return {
            ...n,
            top: `${parseFloat(n.top) + dy}px`,
            left: `${parseFloat(n.left) + dx}px`
        };
    });
    groups = getGroups().map(g => ({
        ...g,
        top: `${parseFloat(g.top) + dy}px`,
        left: `${parseFloat(g.left) + dx}px`
    }));
    setNodes(nodes);
    setGroups(groups);
    render();
    canvasPan.lastX = x;
    canvasPan.lastY = y;
}
function onCanvasPanEnd() {
    canvasPan.active = false;
    nodesContainer.classList.remove('grabbing');
    document.removeEventListener('mousemove', onCanvasPanMove);
    document.removeEventListener('mouseup', onCanvasPanEnd);
    document.removeEventListener('touchmove', onCanvasPanMove);
    document.removeEventListener('touchend', onCanvasPanEnd);
}

// Enable drag for nodes/groups
function enableDragAndDrop() {
    document.querySelectorAll('.node:not(.main), .group-node').forEach(nodeEl => {
        nodeEl.onmousedown = startDrag;
        nodeEl.ontouchstart = startDrag;
    });
}

// Drag logic for nodes/groups
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
        const targetNode = dropTarget && dropTarget.closest('.node');
        const targetGroup = dropTarget && dropTarget.closest('.group-node');
        if (!dragData.isGroup && targetNode && targetNode.dataset.nodeId !== dragData.id) {
            if (!connections.find(c =>
                c.type === "node" && ((c.from === dragData.id && c.to === targetNode.dataset.nodeId) || (c.from === targetNode.dataset.nodeId && c.to === dragData.id)))) {
                connections.push({ type: "node", from: dragData.id, to: targetNode.dataset.nodeId });
                setConnections(connections);
                distributeAroundTarget(dragData.id, targetNode.dataset.nodeId);
            }
        }
        if (!dragData.isGroup && targetGroup) {
            if (!connections.find(c => c.type === "group" && c.group === targetGroup.dataset.groupId && c.node === dragData.id)) {
                const group = groups.find(g => g.id === targetGroup.dataset.groupId);
                connections.push({ type: "group", group: targetGroup.dataset.groupId, node: dragData.id, color: group.color });
                setConnections(connections);
                distributeAroundTarget(dragData.id, targetGroup.dataset.groupId);
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

function distributeAroundTarget(nodeId, targetId) {
    const connected = [];
    nodes.forEach(n => {
        if (n.id === nodeId) return;
        const conns = connections.filter(c => 
            (c.type === 'node' && (c.from === n.id && c.to === targetId || c.to === n.id && c.from === targetId)) ||
            (c.type === 'group' && c.group === targetId && c.node === n.id)
        );
        if (conns.length) connected.push(n);
    });
    connected.push(nodes.find(n => n.id === nodeId));
    let t, l, r;
    let isGroup = groups.find(g => g.id === targetId);
    if (isGroup) {
        let g = groups.find(g => g.id === targetId);
        t = parseFloat(g.top);
        l = parseFloat(g.left);
        r = 60;
    } else {
        let n2 = nodes.find(nn => nn.id === targetId);
        t = parseFloat(n2.top);
        l = parseFloat(n2.left);
        r = 110;
    }
    for (let i = 0; i < connected.length; ++i) {
        const angle = (2 * Math.PI * i) / connected.length;
        connected[i].top = `${t + Math.sin(angle) * r}px`;
        connected[i].left = `${l + Math.cos(angle) * r}px`;
    }
    setNodes(nodes);
}

window.onload = render;
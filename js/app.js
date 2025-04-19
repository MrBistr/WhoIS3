import { getNodes, setNodes, createNodeDOM, clearNodes, getRandomBrightColor } from './nodes.js';
import { getConnections, setConnections, drawConnections } from './connections.js';
import { getGroups, setGroups, createGroupDOM, clearGroups, randomColor } from './groups.js';

// --- Demo data with "scheme1" logic ---
function setupDemoIfEmpty() {
    if (!localStorage.getItem('nodes')) {
        const width = window.innerWidth, height = window.innerHeight;
        // Center user node
        const userColor = getRandomBrightColor();
        const nodes = [{
            id: "main-user",
            name: "User name",
            jobTitle: "Job title",
            image: "",
            color: userColor,
            isFilled: false,
            top: `${height/2 - 55}px`,
            left: `${width/2 - 55}px`,
            floating: false
        }];
        // Group to left
        const g1Color = getRandomBrightColor();
        const group1 = {
            id: "g1",
            name: "GROUP",
            color: g1Color,
            top: `${height/2 - 50}px`,
            left: `${width/2 - 230}px`
        };
        // Nodes for group1
        const group1Nodes = [];
        for (let i = 0; i < 3; ++i) {
            let angle = Math.PI/2 + (i-1)*Math.PI/5;
            let rad = 110;
            group1Nodes.push({
                id: "n1g"+i,
                name: "NODE name",
                jobTitle: "Job title",
                image: "",
                color: g1Color,
                isFilled: false,
                top: `${parseFloat(group1.top) + Math.sin(angle)*rad}px`,
                left: `${parseFloat(group1.left) + Math.cos(angle)*rad}px`,
                floating: false
            });
        }
        // Direct node to user (top)
        const orangeColor = getRandomBrightColor();
        const directNode = {
            id: "direct1",
            name: "NODE name",
            jobTitle: "Job title",
            image: "",
            color: orangeColor,
            isFilled: false,
            top: `${height/2 - 160}px`,
            left: `${width/2 + 60}px`,
            floating: false
        };
        // Group to right
        const g2Color = getRandomBrightColor();
        const group2 = {
            id: "g2",
            name: "GROUP",
            color: g2Color,
            top: `${height/2 - 40}px`,
            left: `${width/2 + 210}px`
        };
        // Nodes for group2
        const group2Nodes = [];
        for (let i = 0; i < 4; ++i) {
            let angle = Math.PI/2 + (i-1.5)*Math.PI/5;
            let rad = 110;
            group2Nodes.push({
                id: "n2g"+i,
                name: "NODE name",
                jobTitle: "Job title",
                image: "",
                color: g2Color,
                isFilled: false,
                top: `${parseFloat(group2.top) + Math.sin(angle)*rad}px`,
                left: `${parseFloat(group2.left) + Math.cos(angle)*rad}px`,
                floating: false
            });
        }
        // Compose demo
        setNodes([
            ...nodes,
            ...group1Nodes,
            directNode,
            ...group2Nodes
        ]);
        setGroups([group1, group2]);
        // Connections
        setConnections([
            { type: "group2user", group: "g1", user: "main-user", color: g1Color },
            { type: "group2user", group: "g2", user: "main-user", color: g2Color },
            ...group1Nodes.map(n => ({ type: "group", group: "g1", node: n.id, color: g1Color })),
            ...group2Nodes.map(n => ({ type: "group", group: "g2", node: n.id, color: g2Color })),
            { type: "node", from: "main-user", to: "direct1" }
        ]);
    }
}

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
    nodes.forEach((node, idx) => createNodeDOM(node, node.id === selectedNodeId, node.id === 'main-user'));
    groups.forEach(g => createGroupDOM(g, g.id === selectedGroupId));
    setTimeout(() => drawConnections(nodes, groups), 0);
    enableDragAndDrop();
}

// --- FAB buttons ---
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

// --- Hide forms logic ---
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

function showNodeForm(editNode = null) {
    inputForm.classList.remove('hidden');
    groupForm.classList.add('hidden');
    editingNodeId = null;
    document.getElementById('form-title').textContent = editNode ? 'Edit Node' : 'Add a Node';
    document.getElementById('add-node-btn').textContent = editNode ? 'Update Node' : 'Add Node';
    if (editNode) {
        editingNodeId = editNode.id;
        document.getElementById('name-input').value = editNode.name;
        document.getElementById('job-title-input').value = editNode.jobTitle;
        document.getElementById('image-upload').value = "";
    } else {
        document.getElementById('name-input').value = "";
        document.getElementById('job-title-input').value = "";
        document.getElementById('image-upload').value = "";
    }
    document.getElementById('name-input').focus();
}

function showGroupForm(editGroup = null) {
    groupForm.classList.remove('hidden');
    inputForm.classList.add('hidden');
    editingGroupId = null;
    document.getElementById('group-form-title').textContent = editGroup ? 'Edit Group' : 'Add a Group';
    document.getElementById('create-group-btn').textContent = editGroup ? 'Update Group' : 'Create Group';
    if (editGroup) {
        editingGroupId = editGroup.id;
        document.getElementById('group-name-input').value = editGroup.name;
    } else {
        document.getElementById('group-name-input').value = "";
    }
    document.getElementById('group-name-input').focus();
}

document.getElementById('add-node-btn').onclick = function() {
    const name = document.getElementById('name-input').value.trim();
    const jobTitle = document.getElementById('job-title-input').value.trim();
    const fileInput = document.getElementById('image-upload');
    if (!name || !jobTitle) {
        alert('Please fill in all fields.');
        return;
    }
    const saveNode = (image) => {
        if (editingNodeId) {
            nodes = nodes.map(n =>
                n.id === editingNodeId ? { ...n, name, jobTitle, image: image || n.image } : n
            );
            setNodes(nodes);
        } else {
            addNode(name, jobTitle, image);
        }
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
document.getElementById('create-group-btn').onclick = function() {
    const groupName = document.getElementById('group-name-input').value.trim();
    if (!groupName) {
        alert('Please enter a group name.');
        return;
    }
    if (editingGroupId) {
        groups = groups.map(g =>
            g.id === editingGroupId ? { ...g, name: groupName } : g
        );
        setGroups(groups);
        groupForm.classList.add('hidden');
        editingGroupId = null;
        render();
    } else {
        addGroup(groupName);
        groupForm.classList.add('hidden');
    }
};
function addNode(name, jobTitle, image) {
    const id = 'n' + Date.now() + Math.floor(Math.random()*100000);
    let top = `${Math.random() * (window.innerHeight-200) + 100}px`;
    let left = `${Math.random() * (window.innerWidth-200) + 100}px`;
    const color = getRandomBrightColor();
    const node = { id, name, jobTitle, image, top, left, floating: true, color, isFilled: false };
    nodes.push(node);
    setNodes(nodes);
    render();
}
function addGroup(name) {
    const id = 'g' + Date.now() + Math.floor(Math.random()*100000);
    const top = `${Math.random() * (window.innerHeight-200) + 100}px`;
    const left = `${Math.random() * (window.innerWidth-200) + 100}px`;
    const color = getRandomBrightColor();
    const group = { id, name, color, top, left };
    groups.push(group);
    setGroups(groups);
    if (nodes.length > 0) {
        const userId = nodes[0].id;
        connections.push({ type: "group2user", group: id, user: userId, color });
        setConnections(connections);
    }
    render();
}

// --- Node/Group selection, connect on drag ---
let lastClickTime = 0;
let lastClickedElement = null;
document.getElementById('nodes-container').addEventListener('click', function(e) {
    const nodeEl = e.target.closest('.node');
    const groupEl = e.target.closest('.group-node');
    const now = Date.now();
    if (nodeEl && lastClickedElement === nodeEl && now - lastClickTime < 400) {
        const nodeId = nodeEl.dataset.nodeId;
        const node = nodes.find(n => n.id === nodeId);
        showNodeForm(node);
        lastClickTime = 0;
        lastClickedElement = null;
        return;
    }
    if (groupEl && lastClickedElement === groupEl && now - lastClickTime < 400) {
        const groupId = groupEl.dataset.groupId;
        const group = groups.find(g => g.id === groupId);
        showGroupForm(group);
        lastClickTime = 0;
        lastClickedElement = null;
        return;
    }
    lastClickTime = now;
    lastClickedElement = nodeEl || groupEl;
    if (nodeEl) {
        const nodeId = nodeEl.dataset.nodeId;
        if (selectedNodeId === nodeId) {
            selectedNodeId = null;
        } else {
            selectedNodeId = nodeId;
            selectedGroupId = null;
        }
        render();
        return;
    }
    if (groupEl) {
        const groupId = groupEl.dataset.groupId;
        if (selectedGroupId === groupId) {
            selectedGroupId = null;
        } else {
            selectedGroupId = groupId;
            selectedNodeId = null;
        }
        render();
        return;
    }
}, true);

// Connect on drag
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
                const srcNode = nodes.find(n => n.id === dragData.id);
                connections.push({ type: "node", from: dragData.id, to: targetNode.dataset.nodeId, color: srcNode.color });
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

// Floating animation for unconnected nodes
function floatNodes() {
    if (nodes.length === 0) return;
    nodes = getNodes();
    nodes.forEach((n) => {
        if ((n.floating && n.id !== "main-user")) {
            let t = parseFloat(n.top), l = parseFloat(n.left);
            t += Math.sin(Date.now()/250 + l)*0.7;
            l += Math.cos(Date.now()/350 + t)*0.7;
            n.top = `${t}px`; n.left = `${l}px`;
            const dom = document.querySelector(`.node[data-node-id="${n.id}"]`);
            if(dom && !dom.classList.contains('dragging')) { dom.style.top = n.top; dom.style.left = n.left; }
        }
        if (n.id === "main-user") {
            n.top = `${window.innerHeight/2 - 55}px`;
            n.left = `${window.innerWidth/2 - 55}px`;
            const dom = document.querySelector(`.node[data-node-id="${n.id}"]`);
            if(dom) { dom.style.top = n.top; dom.style.left = n.left; }
        }
    });
    setNodes(nodes);
    setTimeout(floatNodes, 40);
}
floatNodes();

setupDemoIfEmpty();
window.onload = render;
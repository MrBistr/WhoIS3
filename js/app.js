import { getNodes, setNodes, createNodeDOM, clearNodes } from './nodes.js';
import { getConnections, setConnections, drawConnections } from './connections.js';
import { getGroups, setGroups, createGroupDOM, clearGroups, randomColor } from './groups.js';

const teamDemo = [
  {
    id: "main-user",
    name: "YOU",
    jobTitle: "Team Leader",
    image: "https://randomuser.me/api/portraits/men/99.jpg",
    floating: false
  },
  {
    id: "arsen",
    name: "Arsen",
    jobTitle: "Chief Communications Officer",
    image: "https://randomuser.me/api/portraits/men/23.jpg",
    floating: true
  },
  {
    id: "bohdan",
    name: "Bohdan",
    jobTitle: "Project Manager",
    image: "https://randomuser.me/api/portraits/men/31.jpg",
    floating: true
  },
  {
    id: "cynthia",
    name: "Cynthia",
    jobTitle: "Partner & US Business Development Lead",
    image: "https://randomuser.me/api/portraits/women/57.jpg",
    floating: true
  },
  {
    id: "anna",
    name: "Anna",
    jobTitle: "Project Manager",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    floating: true
  },
  {
    id: "julia",
    name: "Julia",
    jobTitle: "UX/UI Designer & Illustrator",
    image: "https://randomuser.me/api/portraits/women/60.jpg",
    floating: true
  },
  {
    id: "nick",
    name: "Nick",
    jobTitle: "UX/UI Designer",
    image: "https://randomuser.me/api/portraits/men/85.jpg",
    floating: true
  },
  {
    id: "john",
    name: "John",
    jobTitle: "Front-end Developer",
    image: "https://randomuser.me/api/portraits/men/66.jpg",
    floating: true
  },
  {
    id: "anastasia",
    name: "Anastasia",
    jobTitle: "Front-end Developer",
    image: "https://randomuser.me/api/portraits/women/90.jpg",
    floating: true
  },
  {
    id: "max",
    name: "Max",
    jobTitle: "Front-end Developer",
    image: "https://randomuser.me/api/portraits/men/44.jpg",
    floating: true
  }
];

const teamGroups = [
  { id: "g1", name: "Design", color: "#e76fd1" },
  { id: "g2", name: "Development", color: "#7d6cf6" },
  { id: "g3", name: "Management", color: "#6d65c4" }
];

function setupDemoIfEmpty() {
    if (!localStorage.getItem('nodes')) {
        const width = window.innerWidth, height = window.innerHeight;
        const nodes = teamDemo.map((person, idx) => {
            let angle = (idx-1) * (2 * Math.PI) / (teamDemo.length-1);
            if (idx === 0) {
                return {
                    ...person,
                    top: `${height/2 - 63}px`,
                    left: `${width/2 - 63}px`
                };
            } else {
                let rad = 230 + (idx%3)*40;
                let x = width/2 + Math.cos(angle) * rad;
                let y = height/2 + Math.sin(angle) * rad;
                return {
                    ...person,
                    top: `${y}px`,
                    left: `${x}px`
                };
            }
        });
        const groups = teamGroups.map((g, i) => {
            let angle = i * (2 * Math.PI) / teamGroups.length + 0.6;
            let rad = 410;
            let gx = width/2 + Math.cos(angle)*rad;
            let gy = height/2 + Math.sin(angle)*rad;
            return { ...g, top: `${gy}px`, left: `${gx}px` };
        });
        const connections = [
            { type: "group2user", group: "g1", user: "main-user", color: "#b48ffa" },
            { type: "group2user", group: "g2", user: "main-user", color: "#b48ffa" },
            { type: "group2user", group: "g3", user: "main-user", color: "#b48ffa" },
            { type: "group", group: "g1", node: "julia", color: "#e76fd1" },
            { type: "group", group: "g1", node: "nick", color: "#e76fd1" },
            { type: "group", group: "g2", node: "john", color: "#7d6cf6" },
            { type: "group", group: "g2", node: "anastasia", color: "#7d6cf6" },
            { type: "group", group: "g2", node: "max", color: "#7d6cf6" },
            { type: "group", group: "g3", node: "arsen", color: "#6d65c4" },
            { type: "group", group: "g3", node: "bohdan", color: "#6d65c4" },
            { type: "group", group: "g3", node: "cynthia", color: "#6d65c4" },
            { type: "group", group: "g3", node: "anna", color: "#6d65c4" },
            { type: "node", from: "main-user", to: "julia" },
            { type: "node", from: "main-user", to: "john" },
            { type: "node", from: "main-user", to: "arsen" },
            { type: "node", from: "john", to: "anastasia" },
            { type: "node", from: "julia", to: "nick" },
            { type: "node", from: "bohdan", to: "anna" }
        ];
        const connected = new Set();
        connections.forEach(c => {
            if (c.type === "group") connected.add(c.node);
            if (c.type === "group2user") connected.add(c.group);
            if (c.type === "node") { connected.add(c.from); connected.add(c.to); }
        });
        nodes.forEach(n => { if (connected.has(n.id)) n.floating = false; });
        setNodes(nodes);
        setGroups(groups);
        setConnections(connections);
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

document.getElementById('get-started-btn').onclick = function() {
    document.getElementById('hero').style.display = 'none';
    document.getElementById('floating-buttons').classList.remove('hidden');
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
    const node = { id, name, jobTitle, image, top, left, floating: true };
    nodes.push(node);
    setNodes(nodes);
    render();
}
function addGroup(name) {
    const id = 'g' + Date.now() + Math.floor(Math.random()*100000);
    const top = `${Math.random() * (window.innerHeight-200) + 100}px`;
    const left = `${Math.random() * (window.innerWidth-200) + 100}px`;
    const color = randomColor();
    const group = { id, name, color, top, left };
    groups.push(group);
    setGroups(groups);
    if (nodes.length > 0) {
        const userId = nodes[0].id;
        connections.push({ type: "group2user", group: id, user: userId, color: "#b48ffa" });
        setConnections(connections);
    }
    render();
}

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
document.getElementById('nodes-container').addEventListener('click', function(e) {
    const nodeEl = e.target.closest('.node');
    const groupEl = e.target.closest('.group-node');
    if (selectedNodeId && groupEl) {
        const groupId = groupEl.dataset.groupId;
        if (!connections.find(c => c.type === "group" && c.group === groupId && c.node === selectedNodeId)) {
            const group = groups.find(g => g.id === groupId);
            connections.push({ type: "group", group: groupId, node: selectedNodeId, color: group.color });
            setConnections(connections);
            nodes = nodes.map(n => {
                if (n.id === selectedNodeId) {
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
            selectedNodeId = null;
            render();
        }
        return;
    }
    if (selectedNodeId && nodeEl) {
        const nodeId = nodeEl.dataset.nodeId;
        if (selectedNodeId !== nodeId) {
            if (!connections.find(c =>
                c.type === "node" && ((c.from === selectedNodeId && c.to === nodeId) || (c.from === nodeId && c.to === selectedNodeId)))) {
                connections.push({ type: "node", from: selectedNodeId, to: nodeId });
                setConnections(connections);
                nodes = nodes.map(n => {
                    if (n.id === nodeId || n.id === selectedNodeId) {
                        n.floating = false;
                        const other = nodes.find(nn => nn.id === (n.id === nodeId ? selectedNodeId : nodeId));
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
                selectedNodeId = null;
                render();
            }
        }
        return;
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
            n.top = `${window.innerHeight/2 - 63}px`;
            n.left = `${window.innerWidth/2 - 63}px`;
            const dom = document.querySelector(`.node[data-node-id="${n.id}"]`);
            if(dom) { dom.style.top = n.top; dom.style.left = n.left; }
        }
    });
    setNodes(nodes);
    setTimeout(floatNodes, 40);
}
floatNodes();

document.getElementById('screenshot-btn').onclick = function() {
    document.querySelectorAll('.form-modal').forEach(f => f.classList.add('hidden'));
    document.getElementById('floating-buttons').style.display = 'none';
    setTimeout(() => {
        html2canvas(document.getElementById('app')).then(canvas => {
            let link = document.createElement('a');
            link.download = 'social-map.png';
            link.href = canvas.toDataURL();
            link.click();
            document.getElementById('floating-buttons').style.display = '';
        });
    }, 300);
};

setupDemoIfEmpty();
window.onload = render;
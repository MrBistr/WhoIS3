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

// UI Text Update
document.getElementById('hero-title').textContent = "YouSocialMap";
document.getElementById('hero-subtitle').textContent = "Discover your team and network";
document.getElementById('hero-desc').textContent = "Experience the easy and visual way of connecting with your colleagues";
document.getElementById('get-started-btn').textContent = "Start Your Social Map";

// --- Initial render (no demo nodes) ---
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

// Hero "Start Your Social Map"
document.getElementById('get-started-btn').onclick = function() {
    document.getElementById('hero').style.display = 'none';
    document.getElementById('floating-buttons').classList.remove('hidden');
    // Add main node in the middle if not present
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

// --- Color Picker UI for Node Edit ---
function buildColorPicker(currentColor, onPick) {
    const picker = document.createElement('div');
    picker.style.display = 'flex';
    picker.style.gap = '7px';
    picker.style.margin = '12px 0';
    colorOptions.forEach(color => {
        const swatch = document.createElement('div');
        swatch.style.width = '24px';
        swatch.style.height = '24px';
        swatch.style.borderRadius = '6px';
        swatch.style.border = '2px solid #eee';
        swatch.style.background = color;
        swatch.style.cursor = 'pointer';
        if (color === currentColor) {
            swatch.style.outline = '2px solid #7a58d7';
        }
        swatch.onclick = () => onPick(color);
        picker.appendChild(swatch);
    });
    return picker;
}

function showNodeForm(editNode = null) {
    inputForm.classList.remove('hidden');
    groupForm.classList.add('hidden');
    editingNodeId = null;
    document.getElementById('form-title').textContent = editNode ? 'Edit Node' : 'Add a Node';
    document.getElementById('add-node-btn').textContent = editNode ? 'Update Node' : 'Add Node';
    // Color Picker Insert
    if (document.getElementById('color-picker')) {
        document.getElementById('color-picker').remove();
    }
    let nodeColor = editNode ? editNode.color : colorOptions[0];
    const colorPicker = buildColorPicker(nodeColor, (picked) => {
        nodeColor = picked;
        // Visual feedback
        Array.from(colorPicker.children).forEach(s => s.style.outline = '');
        colorPicker.children[colorOptions.indexOf(picked)].style.outline = '2px solid #7a58d7';
    });
    colorPicker.id = 'color-picker';
    inputForm.insertBefore(colorPicker, inputForm.querySelector('button.submit-btn'));

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
                    n.id === editingNodeId ? { ...n, name, jobTitle, image: image || n.image, color: nodeColor } : n
                );
                setNodes(nodes);
            } else {
                addNode(name, jobTitle, image, nodeColor);
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

function addNode(name, jobTitle, image, color) {
    const id = 'n' + Date.now() + Math.floor(Math.random()*100000);
    let top = `${Math.random() * (window.innerHeight-220) + 120}px`;
    let left = `${Math.random() * (window.innerWidth-220) + 120}px`;
    const node = { id, name, jobTitle, image, color, top, left, floating: true };
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
        connections.push({ type: "group2user", group: id, user: userId, color });
        setConnections(connections);
    }
    render();
}

// --- Edit node on click
document.getElementById('nodes-container').addEventListener('click', function(e) {
    const nodeEl = e.target.closest('.node');
    if (nodeEl) {
        const nodeId = nodeEl.dataset.nodeId;
        const node = nodes.find(n => n.id === nodeId);
        showNodeForm(node);
    }
}, true);

// --- Drag and drop, connection logic remains unchanged (see previous code) ---

// --- Magnetic / Gravitational pull animation ---
function floatNodesWithGravity() {
    if (nodes.length === 0) return;
    nodes = getNodes();
    connections = getConnections();
    // Main node is always at center
    if (nodes[0]) {
        nodes[0].top = `${window.innerHeight/2 - 63}px`;
        nodes[0].left = `${window.innerWidth/2 - 63}px`;
    }
    // For every node except main
    nodes.forEach((n, idx) => {
        if (idx === 0) return;
        // Find first connection (to main node or group or another node)
        let target = null;
        // Priority: group > node > main
        let conn = connections.find(c =>
            (c.type === 'group' && c.node === n.id) ||
            (c.type === 'node' && c.to === n.id) ||
            (c.type === 'node' && c.from === n.id) ||
            (c.type === 'group2user' && c.user === n.id)
        );
        if (conn) {
            if (conn.type === 'group') {
                // To group
                const group = groups.find(g => g.id === conn.group);
                if (group) target = group;
            } else if (conn.type === 'node') {
                // To another node
                const otherId = conn.from === n.id ? conn.to : conn.from;
                const other = nodes.find(nn => nn.id === otherId);
                if (other) target = other;
            } else if (conn.type === 'group2user') {
                // To main user
                target = nodes[0];
            }
        } else {
            // No connection: float
            let t = parseFloat(n.top), l = parseFloat(n.left);
            t += Math.sin(Date.now()/250 + l)*0.7;
            l += Math.cos(Date.now()/350 + t)*0.7;
            n.top = `${t}px`; n.left = `${l}px`;
        }
        if (target) {
            // Pull towards target
            let t1 = parseFloat(n.top), l1 = parseFloat(n.left);
            let t2 = parseFloat(target.top), l2 = parseFloat(target.left);
            const dx = l2 - l1, dy = t2 - t1;
            const dist = Math.max(1, Math.sqrt(dx*dx + dy*dy));
            // Only move if far enough
            if (dist > 60) {
                // Magnetic pull, faster if far
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
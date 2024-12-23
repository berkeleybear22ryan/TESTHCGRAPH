document.getElementById('file-input').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        const treeData = parseLogFile(content);
        renderTree(treeData, document.getElementById('tree-container'));
    };
    reader.readAsText(file);
});

function parseLogFile(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const tree = [];
    const nodeMap = {};
    let currentNode = null;

    lines.forEach(line => {
        const match = line.match(/^\[([\d.]+)]\{(.+)?$/);
        if (match) {
            const id = match[1];
            const parentId = id.split('.').slice(0, -1).join('.');
            const node = {
                id,
                content: '',
                children: [],
                parentId: parentId
            };

            if (match[2]) {
                node.content = match[2];
            }

            if (parentId && nodeMap[parentId]) {
                nodeMap[parentId].children.push(node);
            } else {
                tree.push(node);
            }

            nodeMap[id] = node;
            currentNode = node;
        }
        else if (line.endsWith('}')) {
            if (currentNode) {
                currentNode.content += '\n' + line.slice(0, -1);
            }
        }
        else if (currentNode) {
            currentNode.content += '\n' + line;
        }
    });

    return tree;
}

function renderTree(data, container) {
    container.innerHTML = '';

    const createNode = (node) => {
        const div = document.createElement('div');
        if (!node.parentId) {
            div.className = 'tree-node root';
        } else {
            div.className = 'tree-node';
        }
        const span = document.createElement('span');
        span.textContent = `${node.id}\n${node.content.trim()}`;
        span.dataset.collapsed = false;

        span.addEventListener('click', () => {
            const isCollapsed = span.dataset.collapsed === 'true';
            span.dataset.collapsed = !isCollapsed;

            const childrenDiv = div.querySelector('.tree-children');
            if (isCollapsed) {
                span.textContent = `${node.id}\n${node.content.trim()}`;
                if (childrenDiv) childrenDiv.classList.remove('hidden');
            } else {
                span.textContent = node.id;
                if (childrenDiv) childrenDiv.classList.add('hidden');
            }
        });

        div.appendChild(span);

        if (node.children.length > 0) {
            const childrenDiv = document.createElement('div');
            childrenDiv.className = 'tree-children';
            node.children.forEach(child => {
                childrenDiv.appendChild(createNode(child));
            });
            div.appendChild(childrenDiv);
        }

        return div;
    };
    
    data.forEach(node => container.appendChild(createNode(node)));
}

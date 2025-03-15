/**
 * Red Lines Application
 * A professional note-taking app for offensive security
 */

document.addEventListener('DOMContentLoaded', () => {
    // Application state
    const app = {
        notes: [],
        activeNoteId: null,
        activeTab: 'editor',
        isDragging: false,
        isSearching: false,
        searchTerm: '',
        contextMenu: null,
        lastSave: Date.now(),
        autosaveInterval: 2000, // milliseconds
        initialized: false
    };
    
    // DOM elements
    const elements = {
        body: document.body,
        sidebar: document.getElementById('sidebar'),
        treeContainer: document.getElementById('tree-container'),
        editor: document.getElementById('editor'),
        preview: document.getElementById('preview'),
        noteTitle: document.getElementById('note-title'),
        addFolderBtn: document.getElementById('add-folder-btn'),
        addNoteBtn: document.getElementById('add-note-btn'),
        deleteBtn: document.getElementById('delete-btn'),
        exportBtn: document.getElementById('export-btn'),
        importBtn: document.getElementById('import-btn'),
        themeToggle: document.getElementById('theme-toggle'),
        sidebarToggle: document.getElementById('sidebar-toggle'),
        searchInput: document.getElementById('search-input'),
        showHelp: document.getElementById('show-help'),
        tabs: document.querySelectorAll('.tab'),
        welcomeScreen: document.getElementById('welcome-screen'),
        newProjectBtn: document.getElementById('new-project-btn'),
        startDemoBtn: document.getElementById('start-demo-btn'),
        toastContainer: document.getElementById('toast-container'),
        templateBtn: document.getElementById('template-btn'),
        codeSnippetBtn: document.getElementById('code-snippet-btn'),
        toolsBtn: document.getElementById('tools-btn')
    };
    
    // Initialize application
    initialize();
    
    /**
     * Initialize the application
     */
    function initialize() {
        loadNotes();
        setupEventListeners();
        setupKeyboardShortcuts();
        
        // Check dark mode preference
        if (localStorage.getItem('redlines-dark-mode') === 'true') {
            elements.body.classList.add('dark');
        }
        
        if (app.notes.length === 0) {
            showWelcomeScreen();
        } else {
            renderTree();
            app.initialized = true;
        }
        
        // Set up autosave
        setInterval(autoSave, app.autosaveInterval);
    }
    
    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Welcome screen buttons
        elements.newProjectBtn.addEventListener('click', () => {
            app.notes = createDefaultProject();
            saveNotes();
            hideWelcomeScreen();
            renderTree();
            showToast('New project created', 'success');
        });
        
        elements.startDemoBtn.addEventListener('click', () => {
            app.notes = createDemoProject();
            saveNotes();
            hideWelcomeScreen();
            renderTree();
            showToast('Demo project loaded', 'success');
        });
        
        // Theme toggle
        elements.themeToggle.addEventListener('click', () => {
            elements.body.classList.toggle('dark');
            localStorage.setItem('redlines-dark-mode', elements.body.classList.contains('dark'));
        });
        
        // Sidebar toggle (mobile)
        if (elements.sidebarToggle) {
            elements.sidebarToggle.addEventListener('click', () => {
                elements.sidebar.classList.toggle('show');
            });
        }
        
        // Help button
        elements.showHelp.addEventListener('click', () => {
            showHelpModal();
        });
        
        // Tabs
        elements.tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                elements.tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const target = this.getAttribute('data-target');
                app.activeTab = target;
                
                elements.editor.classList.remove('show');
                elements.preview.classList.remove('show');
                document.getElementById(target).classList.add('show');
                
                if (target === 'preview' && app.activeNoteId) {
                    updatePreview();
                }
            });
        });
        
        // Template button
        if (elements.templateBtn) {
            elements.templateBtn.addEventListener('click', (e) => {
                showTemplateDropdown(e);
            });
        }
        
        // Code snippet button
        if (elements.codeSnippetBtn) {
            elements.codeSnippetBtn.addEventListener('click', (e) => {
                showCodeDropdown(e);
            });
        }
        
        // Tools button
        if (elements.toolsBtn) {
            elements.toolsBtn.addEventListener('click', (e) => {
                showToolsDropdown(e);
            });
        }
        
        // Initially show the editor
        elements.editor.classList.add('show');
        
        // Editor input
        elements.editor.addEventListener('input', () => {
            if (app.activeNoteId) {
                const note = findNoteById(app.activeNoteId);
                if (note) {
                    note.content = elements.editor.value;
                    note.updated = Date.now();
                }
            }
        });
        
        // Note title input
        elements.noteTitle.addEventListener('blur', () => {
            if (app.activeNoteId) {
                const note = findNoteById(app.activeNoteId);
                if (note) {
                    note.title = elements.noteTitle.value || 'Untitled Note';
                    note.updated = Date.now();
                    saveNotes();
                    renderTree();
                }
            }
            elements.noteTitle.setAttribute('readonly', true);
        });
        
        elements.noteTitle.addEventListener('click', () => {
            if (app.activeNoteId) {
                elements.noteTitle.removeAttribute('readonly');
            }
        });
        
        elements.noteTitle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                elements.noteTitle.blur();
            }
        });
        
        // Delete button
        elements.deleteBtn.addEventListener('click', () => {
            if (app.activeNoteId) {
                showConfirmDialog(
                    'Delete Item',
                    'Are you sure you want to delete this item?',
                    () => {
                        deleteItem(app.activeNoteId);
                        app.activeNoteId = null;
                        clearEditor();
                        renderTree();
                        showToast('Item deleted', 'success');
                    }
                );
            }
        });
        
        // Export button
        elements.exportBtn.addEventListener('click', () => {
            exportNotes();
        });
        
        // Import button
        elements.importBtn.addEventListener('click', () => {
            importNotes();
        });
        
        // Add folder button
        elements.addFolderBtn.addEventListener('click', () => {
            showPromptDialog(
                'Add Folder',
                'Enter folder name:',
                'New Folder',
                (folderName) => {
                    if (folderName) {
                        addFolder(folderName);
                        showToast('Folder created', 'success');
                    }
                }
            );
        });
        
        // Add note button
        elements.addNoteBtn.addEventListener('click', () => {
            showPromptDialog(
                'Add Note',
                'Enter note name:',
                'New Note',
                (noteName) => {
                    if (noteName) {
                        addNote(noteName);
                        showToast('Note created', 'success');
                    }
                }
            );
        });
        
        // Search input
        elements.searchInput.addEventListener('input', () => {
            app.searchTerm = elements.searchInput.value.toLowerCase();
            renderTree();
        });
        
        // Close context menu on document click
        document.addEventListener('click', (e) => {
            if (app.contextMenu && !app.contextMenu.contains(e.target)) {
                app.contextMenu.remove();
                app.contextMenu = null;
            }
        });
        
        // Prevent context menu on right-click
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.tree-item')) {
                e.preventDefault();
            }
        });
    }
    
    /**
     * Set up keyboard shortcuts
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts in input elements
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Ctrl+E: Toggle edit/preview
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                toggleTab();
            }
            
            // Ctrl+S: Save/export
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                saveNotes();
                showToast('Notes saved', 'success');
            }
            
            // Ctrl+N: New note
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                showPromptDialog(
                    'Add Note',
                    'Enter note name:',
                    'New Note',
                    (noteName) => {
                        if (noteName) {
                            addNote(noteName);
                            showToast('Note created', 'success');
                        }
                    }
                );
            }
            
            // Ctrl+F: Focus search
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                elements.searchInput.focus();
            }
            
            // F1: Show help
            if (e.key === 'F1') {
                e.preventDefault();
                showHelpModal();
            }
            
            // Delete: Delete active note
            if (e.key === 'Delete' && app.activeNoteId) {
                e.preventDefault();
                showConfirmDialog(
                    'Delete Item',
                    'Are you sure you want to delete this item?',
                    () => {
                        deleteItem(app.activeNoteId);
                        app.activeNoteId = null;
                        clearEditor();
                        renderTree();
                        showToast('Item deleted', 'success');
                    }
                );
            }
            
            // Ctrl+Space: Insert code snippet
            if (e.ctrlKey && e.key === ' ' && app.activeNoteId) {
                e.preventDefault();
                if (elements.codeSnippetBtn) {
                    elements.codeSnippetBtn.click();
                }
            }
        });
    }
    
    /**
     * Load notes from localStorage
     */
    function loadNotes() {
        const savedNotes = localStorage.getItem('redlines-notes');
        if (savedNotes) {
            try {
                app.notes = JSON.parse(savedNotes);
            } catch (error) {
                console.error('Error parsing saved notes:', error);
                app.notes = [];
                showToast('Error loading saved notes', 'error');
            }
        }
    }
    
    /**
     * Save notes to localStorage
     */
    function saveNotes() {
        try {
            localStorage.setItem('redlines-notes', JSON.stringify(app.notes));
            app.lastSave = Date.now();
        } catch (error) {
            console.error('Error saving notes:', error);
            showToast('Error saving notes', 'error');
        }
    }
    
    /**
     * Auto-save notes if changes were made
     */
    function autoSave() {
        if (app.initialized && app.activeNoteId) {
            saveNotes();
        }
    }
    
    /**
     * Toggle between edit and preview tabs
     */
    function toggleTab() {
        const currentTab = app.activeTab;
        const newTab = currentTab === 'editor' ? 'preview' : 'editor';
        
        elements.tabs.forEach(tab => {
            if (tab.getAttribute('data-target') === newTab) {
                tab.click();
            }
        });
    }
    
    /**
     * Show welcome screen
     */
    function showWelcomeScreen() {
        elements.welcomeScreen.style.display = 'flex';
        elements.editor.style.display = 'none';
        elements.preview.style.display = 'none';
    }
    
    /**
     * Hide welcome screen
     */
    function hideWelcomeScreen() {
        elements.welcomeScreen.style.display = 'none';
        document.getElementById(app.activeTab).classList.add('show');
    }
    
    /**
     * Create default project structure
     */
    function createDefaultProject() {
        const timestamp = Date.now();
        return [
            {
                id: 'folder-' + timestamp,
                title: 'New Project',
                type: 'folder',
                created: timestamp,
                updated: timestamp,
                expanded: true,
                children: [
                    {
                        id: 'folder-' + (timestamp + 1),
                        title: 'Recon',
                        type: 'folder',
                        created: timestamp,
                        updated: timestamp,
                        expanded: false,
                        children: [
                            {
                                id: 'folder-' + (timestamp + 100),
                                title: 'Passive Recon',
                                type: 'folder',
                                created: timestamp,
                                updated: timestamp,
                                expanded: false,
                                children: []
                            },
                            {
                                id: 'folder-' + (timestamp + 101),
                                title: 'Active Recon',
                                type: 'folder',
                                created: timestamp,
                                updated: timestamp,
                                expanded: false,
                                children: []
                            }
                        ]
                    },
                    {
                        id: 'folder-' + (timestamp + 2),
                        title: 'Exploitation',
                        type: 'folder',
                        created: timestamp,
                        updated: timestamp,
                        expanded: false,
                        children: []
                    },
                    {
                        id: 'folder-' + (timestamp + 3),
                        title: 'Post-Exploitation',
                        type: 'folder',
                        created: timestamp,
                        updated: timestamp,
                        expanded: false,
                        children: []
                    },
                    {
                        id: 'folder-' + (timestamp + 4),
                        title: 'Loot',
                        type: 'folder',
                        created: timestamp,
                        updated: timestamp,
                        expanded: false,
                        children: []
                    },
                    {
                        id: 'folder-' + (timestamp + 5),
                        title: 'Reporting',
                        type: 'folder',
                        created: timestamp,
                        updated: timestamp,
                        expanded: false,
                        children: []
                    }
                ]
            }
        ];
    }
    
    /**
     * Create demo project with sample notes
     */
    function createDemoProject() {
        const timestamp = Date.now();
        return [
            {
                id: 'folder-' + timestamp,
                title: 'Demo Project',
                type: 'folder',
                created: timestamp,
                updated: timestamp,
                expanded: true,
                children: [
                    {
                        id: 'folder-' + (timestamp + 1),
                        title: 'Recon',
                        type: 'folder',
                        created: timestamp,
                        updated: timestamp,
                        expanded: true,
                        children: [
                            {
                                id: 'note-' + (timestamp + 2),
                                title: 'Nmap Scan',
                                type: 'note',
                                created: timestamp,
                                updated: timestamp,
                                content: '# Nmap Scan Results\n\n```\nnmap -sV -sC 10.0.0.1\n\n22/tcp  open  ssh     OpenSSH 7.6p1\n80/tcp  open  http    Apache 2.4.29\n443/tcp open  https   Apache 2.4.29\n```\n\n## Open Ports\n\n- 22/tcp - SSH\n- 80/tcp - HTTP\n- 443/tcp - HTTPS\n\n## Next Steps\n\n- Enumerate web services\n- Check for default credentials\n- Look for outdated software versions'
                            },
                            {
                                id: 'note-' + (timestamp + 3),
                                title: 'Web Enumeration',
                                type: 'note',
                                created: timestamp,
                                updated: timestamp,
                                content: '# Web Enumeration\n\n## Directory Brute Force\n\n```\ngobuster dir -u http://10.0.0.1 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -t 50\n```\n\n### Results\n\n- /admin (403 Forbidden)\n- /login (200 OK)\n- /backup (403 Forbidden)\n- /config (301 Redirect)\n\n## Technologies Detected\n\n- Apache 2.4.29\n- PHP 7.2.24\n- Bootstrap 4.1.3\n- jQuery 3.3.1'
                            }
                        ]
                    },
                    {
                        id: 'folder-' + (timestamp + 4),
                        title: 'Exploitation',
                        type: 'folder',
                        created: timestamp,
                        updated: timestamp,
                        expanded: true,
                        children: [
                            {
                                id: 'note-' + (timestamp + 5),
                                title: 'SQL Injection',
                                type: 'note',
                                created: timestamp,
                                updated: timestamp,
                                content: '# SQL Injection in Login Form\n\n## Vulnerable Parameter\nUsername field is vulnerable to SQLi\n\n## Proof of Concept\n\n```\nUsername: admin\' OR 1=1 --\nPassword: anything\n```\n\n## Exploitation\n\n1. Extract database version\n   `admin\' UNION SELECT 1,version(),3,4 --`\n\n2. Extract database tables\n   `admin\' UNION SELECT 1,table_name,3,4 FROM information_schema.tables --`\n\n3. Extract users table\n   `admin\' UNION SELECT 1,username,password,4 FROM users --`'
                            }
                        ]
                    },
                    {
                        id: 'folder-' + (timestamp + 6),
                        title: 'Loot',
                        type: 'folder',
                        created: timestamp,
                        updated: timestamp,
                        expanded: true,
                        children: [
                            {
                                id: 'note-' + (timestamp + 7),
                                title: 'Credentials',
                                type: 'note',
                                created: timestamp,
                                updated: timestamp,
                                content: '# Discovered Credentials\n\n## SSH\n- Username: admin\n- Password: P@ssw0rd123!\n\n## Web Application\n- Username: admin\n- Password: admin123\n\n## Database\n- Username: dbuser\n- Password: dbp@ss456\n\n## API Keys\n- Key: 3d80c9e1f5b4a2d7e6c8b0a9f3d2e5c1\n- Secret: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
                            }
                        ]
                    }
                ]
            }
        ];
    }
    
    /**
     * Render the tree view
     */
    function renderTree() {
        elements.treeContainer.innerHTML = '';
        
        // Filter notes if search term exists
        const filteredNotes = app.searchTerm 
            ? filterNotes(app.notes, app.searchTerm) 
            : app.notes;
        
        renderNodes(filteredNotes, elements.treeContainer);
        
        // Setup drag and drop
        setupDragAndDrop();
    }
    
    /**
     * Filter notes based on search term
     */
    function filterNotes(notes, term) {
        const result = [];
        
        for (const note of notes) {
            // Create a copy of the note
            const noteCopy = { ...note };
            
            // Check if the note matches
            const titleMatch = note.title.toLowerCase().includes(term);
            const contentMatch = note.type === 'note' && note.content && note.content.toLowerCase().includes(term);
            
            if (titleMatch || contentMatch) {
                // If this is a folder, keep only the children that match
                if (note.type === 'folder' && note.children) {
                    noteCopy.children = filterNotes(note.children, term);
                    noteCopy.expanded = true; // Auto-expand matching folders
                }
                result.push(noteCopy);
            } else if (note.type === 'folder' && note.children) {
                // If not matching but is a folder, check children
                const filteredChildren = filterNotes(note.children, term);
                if (filteredChildren.length > 0) {
                    noteCopy.children = filteredChildren;
                    noteCopy.expanded = true; // Auto-expand if children match
                    result.push(noteCopy);
                }
            }
        }
        
        return result;
    }
    
    /**
     * Render nodes recursively
     */
    function renderNodes(nodes, container) {
        nodes.forEach(node => {
            const item = document.createElement('div');
            item.className = `tree-item ${node.type === 'folder' ? 'tree-folder' : 'tree-note'} ${app.activeNoteId === node.id ? 'active' : ''}`;
            item.dataset.id = node.id;
            item.dataset.type = node.type;
            item.draggable = true;
            
            // For folders, add expander
            if (node.type === 'folder') {
                const expander = document.createElement('div');
                expander.className = `tree-item-expander ${node.expanded ? 'expanded' : ''}`;
                expander.textContent = '▶';
                expander.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleFolder(node.id);
                });
                item.appendChild(expander);
            }
            
            const icon = document.createElement('div');
            icon.className = 'tree-item-icon';
            icon.textContent = node.type === 'folder' ? '📁' : '📝';
            item.appendChild(icon);
            
            const text = document.createElement('div');
            text.className = 'tree-item-text';
            text.textContent = node.title;
            item.appendChild(text);
            
            // Click handler
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                setActiveItem(node.id);
            });
            
            // Right-click (context menu)
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showContextMenu(e, node);
            });
            
            container.appendChild(item);
            
            // Render children if folder is expanded
            if (node.type === 'folder' && node.expanded && node.children && node.children.length > 0) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'tree-children';
                renderNodes(node.children, childrenContainer);
                container.appendChild(childrenContainer);
            }
        });
    }
    
    /**
     * Set up drag and drop functionality
     */
    function setupDragAndDrop() {
        const items = document.querySelectorAll('.tree-item');
        
        items.forEach(item => {
            // Drag start
            item.addEventListener('dragstart', (e) => {
                app.isDragging = true;
                e.dataTransfer.setData('text/plain', item.dataset.id);
                item.classList.add('dragging');
            });
            
            // Drag end
            item.addEventListener('dragend', () => {
                app.isDragging = false;
                item.classList.remove('dragging');
                clearDropTargets();
            });
            
            // Drag over
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (app.isDragging && item.dataset.type === 'folder') {
                    item.classList.add('drop-target');
                }
            });
            
            // Drag leave
            item.addEventListener('dragleave', () => {
                item.classList.remove('drop-target');
            });
            
            // Drop
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData('text/plain');
                const targetId = item.dataset.id;
                
                if (draggedId && targetId && draggedId !== targetId && item.dataset.type === 'folder') {
                    moveItem(draggedId, targetId);
                    renderTree();
                }
                
                clearDropTargets();
            });
        });
    }
    
    /**
     * Clear all drop target highlights
     */
    function clearDropTargets() {
        document.querySelectorAll('.drop-target').forEach(el => {
            el.classList.remove('drop-target');
        });
    }
    
    /**
     * Show context menu for an item
     */
    function showContextMenu(e, node) {
        // Remove existing context menu
        if (app.contextMenu) {
            app.contextMenu.remove();
        }
        
        // Create context menu
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.top = `${e.pageY}px`;
        menu.style.left = `${e.pageX}px`;
        
        // Add common actions
        addContextMenuItem(menu, '✏️', 'Rename', () => {
            showPromptDialog(
                'Rename Item',
                'Enter new name:',
                node.title,
                (newName) => {
                    if (newName && newName !== node.title) {
                        renameItem(node.id, newName);
                        showToast('Item renamed', 'success');
                    }
                }
            );
        });
        
        addContextMenuItem(menu, '🗑️', 'Delete', () => {
            showConfirmDialog(
                'Delete Item',
                'Are you sure you want to delete this item?',
                () => {
                    deleteItem(node.id);
                    renderTree();
                    if (app.activeNoteId === node.id) {
                        app.activeNoteId = null;
                        clearEditor();
                    }
                    showToast('Item deleted', 'success');
                }
            );
        });
        
        // Add folder-specific actions
        if (node.type === 'folder') {
            addContextMenuDivider(menu);
            
            addContextMenuItem(menu, '📝', 'Add Note', () => {
                showPromptDialog(
                    'Add Note',
                    'Enter note name:',
                    'New Note',
                    (noteName) => {
                        if (noteName) {
                            addNote(noteName, node.id);
                            showToast('Note created', 'success');
                        }
                    }
                );
            });
            
            addContextMenuItem(menu, '📁', 'Add Folder', () => {
                showPromptDialog(
                    'Add Folder',
                    'Enter folder name:',
                    'New Folder',
                    (folderName) => {
                        if (folderName) {
                            addFolder(folderName, node.id);
                            showToast('Folder created', 'success');
                        }
                    }
                );
            });
            
            addContextMenuItem(menu, node.expanded ? '📂' : '📁', node.expanded ? 'Collapse' : 'Expand', () => {
                toggleFolder(node.id);
            });
        }
        
        // Add to document
        document.body.appendChild(menu);
        app.contextMenu = menu;
        
        // Adjust position if menu goes off screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = `${window.innerWidth - rect.width - 10}px`;
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = `${window.innerHeight - rect.height - 10}px`;
        }
    }
    
    /**
     * Add an item to context menu
     */
    function addContextMenuItem(menu, icon, text, handler) {
        const item = document.createElement('div');
        item.className = 'context-menu-item';
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'context-menu-item-icon';
        iconSpan.textContent = icon;
        item.appendChild(iconSpan);
        
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        item.appendChild(textSpan);
        
        item.addEventListener('click', () => {
            handler();
            menu.remove();
            app.contextMenu = null;
        });
        
        menu.appendChild(item);
    }
    
    /**
     * Add a divider to context menu
     */
    function addContextMenuDivider(menu) {
        const divider = document.createElement('div');
        divider.className = 'context-menu-divider';
        menu.appendChild(divider);
    }
    
    /**
     * Toggle folder expansion
     */
    function toggleFolder(id) {
        const folder = findNoteById(id);
        if (folder && folder.type === 'folder') {
            folder.expanded = !folder.expanded;
            saveNotes();
            renderTree();
        }
    }
    
    /**
     * Set active item
     */
    function setActiveItem(id) {
        app.activeNoteId = id;
        renderTree();
        
        const note = findNoteById(id);
        if (note) {
            loadNote(note);
            hideWelcomeScreen();
        } else {
            clearEditor();
        }
    }
    
    /**
     * Load note into editor
     */
    function loadNote(note) {
        elements.noteTitle.value = note.title || '';
        
        if (note.type === 'note') {
            elements.editor.value = note.content || '';
            updatePreview();
            
            // Show editor/preview based on active tab
            elements.editor.classList.remove('show');
            elements.preview.classList.remove('show');
            document.getElementById(app.activeTab).classList.add('show');
        } else {
            // For folders, show empty editor
            elements.editor.value = '';
            elements.preview.innerHTML = '';
        }
    }
    
    /**
     * Update preview with rendered markdown
     */
    function updatePreview() {
        if (app.activeNoteId) {
            const note = findNoteById(app.activeNoteId);
            if (note && note.type === 'note') {
                elements.preview.innerHTML = parseMarkdown(elements.editor.value);
                
                // Apply syntax highlighting with Prism.js if available
                if (window.Prism) {
                    elements.preview.querySelectorAll('pre code').forEach((block) => {
                        Prism.highlightElement(block);
                    });
                }
            }
        }
    }
    
    /**
     * Parse markdown to HTML with improved code handling
     */
    function parseMarkdown(markdown) {
        if (!markdown) return '';
        
        // Escape HTML
        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }
        
        // Process fenced code blocks with language support
        let processedMarkdown = markdown.replace(/```(\w*)\n([\s\S]*?)```/g, (match, language, code) => {
            const langClass = language ? ` language-${language}` : '';
            return `<pre class="line-numbers"><code class="code-block${langClass}">${escapeHtml(code)}</code></pre>`;
        });
        
        // Process inline code
        processedMarkdown = processedMarkdown.replace(/`([^`]+)`/g, (match, code) => {
            return `<code class="inline-code">${escapeHtml(code)}</code>`;
        });
        
        // Headers
        processedMarkdown = processedMarkdown.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        processedMarkdown = processedMarkdown.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        processedMarkdown = processedMarkdown.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        
        // Bold and italic
        processedMarkdown = processedMarkdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        processedMarkdown = processedMarkdown.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Links and images
        processedMarkdown = processedMarkdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        processedMarkdown = processedMarkdown.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
        
        // Blockquotes
        processedMarkdown = processedMarkdown.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
        
        // Lists
        processedMarkdown = processedMarkdown.replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>');
        processedMarkdown = processedMarkdown.replace(/^\s*[\-\*]\s+(.*$)/gm, '<li>$1</li>');
        
        // Group list items
        processedMarkdown = processedMarkdown.replace(/(<li>.*<\/li>)(\s*<li>.*<\/li>)+/g, '<ul>');
        const menu = document.createElement('div');
        menu.className = ('context-</ul>');
        
        // Horizontal rule
        processedMarkdown = processedMarkdown.replace(/^---+$/gm, '<hr>');
        
        // Tables (better implementation)
        const tableRegex = /^\|(.+)\|(\r?\n)\|[\s:-]+\|(\r?\n)(?:\|.+\|(?:\r?\n)?)+/gm;
        
        processedMarkdown = processedMarkdown.replace(tableRegex, (match) => {
            // Split into rows
            const rows = match.split(/\r?\n/).filter(row => row.trim().length > 0);
            
            if (rows.length < 3) return match; // Need at least header, separator, and one data row
            
            let tableHtml = '<table class="markdown-table">';
            
            // Header row
            const headerCells = rows[0].split('|').filter(cell => cell.trim().length > 0);
            tableHtml += '<thead><tr>';
            headerCells.forEach(cell => {
                tableHtml += `<th>${cell.trim()}</th>`;
            });
            tableHtml += '</tr></thead>';
            
            // Data rows
            tableHtml += '<tbody>';
            for (let i = 2; i < rows.length; i++) {
                if (!rows[i].includes('|')) continue;
                
                const cells = rows[i].split('|').filter(cell => cell !== '');
                tableHtml += '<tr>';
                cells.forEach(cell => {
                    tableHtml += `<td>${cell.trim()}</td>`;
                });
                tableHtml += '</tr>';
            }
            tableHtml += '</tbody></table>';
            
            return tableHtml;
        });
        
        // Checkboxes
        processedMarkdown = processedMarkdown.replace(/\[ \] (.*$)/gm, '<div class="checkbox"><input type="checkbox" disabled><label>$1</label></div>');
        processedMarkdown = processedMarkdown.replace(/\[x\] (.*$)/gm, '<div class="checkbox"><input type="checkbox" checked disabled><label>$1</label></div>');
        
        // Paragraphs (handle remaining text)
        // Split by double line breaks for paragraphs
        const paragraphs = processedMarkdown.split(/\n\s*\n/);
        processedMarkdown = paragraphs.map(p => {
            p = p.trim();
            // Check if already handled (wrapped in HTML)
            if (!p || p.startsWith('<') && p.endsWith('>')) {
                return p;
            }
            // Wrap in paragraph tags
            return `<p>${p}</p>`;
        }).join('\n\n');
        
        return processedMarkdown;
    }
    
    /**
     * Clear editor
     */
    function clearEditor() {
        elements.noteTitle.value = '';
        elements.editor.value = '';
        elements.preview.innerHTML = '';
    }
    
    /**
     * Find note by ID
     */
    function findNoteById(id) {
        function search(nodes) {
            for (const node of nodes) {
                if (node.id === id) {
                    return node;
                }
                
                if (node.type === 'folder' && node.children) {
                    const found = search(node.children);
                    if (found) return found;
                }
            }
            return null;
        }
        
        return search(app.notes);
    }
    
    /**
     * Find parent folder of an item
     */
    function findParentFolder(id) {
        function search(nodes, parent = null) {
            for (const node of nodes) {
                if (node.id === id) {
                    return parent;
                }
                
                if (node.type === 'folder' && node.children) {
                    const found = search(node.children, node);
                    if (found) return found;
                }
            }
            return null;
        }
        
        return search(app.notes);
    }
    
    /**
     * Delete item
     */
    function deleteItem(id) {
        function removeFromArray(array) {
            const index = array.findIndex(item => item.id === id);
            if (index !== -1) {
                array.splice(index, 1);
                return true;
            }
            return false;
        }
        
        function search(nodes) {
            if (removeFromArray(nodes)) {
                return true;
            }
            
            for (const node of nodes) {
                if (node.type === 'folder' && node.children) {
                    if (search(node.children)) {
                        return true;
                    }
                }
            }
            
            return false;
        }
        
        search(app.notes);
        saveNotes();
    }
    
    /**
     * Rename item
     */
    function renameItem(id, newName) {
        const note = findNoteById(id);
        if (note) {
            note.title = newName;
            note.updated = Date.now();
            
            if (app.activeNoteId === id) {
                elements.noteTitle.value = newName;
            }
            
            saveNotes();
            renderTree();
        }
    }
    
    /**
     * Move item to another folder
     */
    function moveItem(sourceId, targetId) {
        // Don't move if source is ancestor of target
        if (isAncestor(sourceId, targetId)) {
            showToast('Cannot move a folder into its child', 'error');
            return;
        }
        
        const sourceItem = findNoteById(sourceId);
        const targetFolder = findNoteById(targetId);
        
        if (!sourceItem || !targetFolder || targetFolder.type !== 'folder') {
            return;
        }
        
        // Remove source from its parent
        const sourceParent = findParentFolder(sourceId);
        if (sourceParent) {
            sourceParent.children = sourceParent.children.filter(item => item.id !== sourceId);
        } else {
            app.notes = app.notes.filter(item => item.id !== sourceId);
        }
        
        // Add to target folder
        if (!targetFolder.children) {
            targetFolder.children = [];
        }
        
        targetFolder.children.push(sourceItem);
        targetFolder.expanded = true; // Auto-expand
        
        sourceItem.updated = Date.now();
        targetFolder.updated = Date.now();
        
        saveNotes();
        showToast('Item moved', 'success');
    }
    
    /**
     * Check if source is an ancestor of target
     */
    function isAncestor(sourceId, targetId) {
        const targetParent = findParentFolder(targetId);
        if (!targetParent) {
            return false;
        }
        
        if (targetParent.id === sourceId) {
            return true;
        }
        
        return isAncestor(sourceId, targetParent.id);
    }
    
    /**
     * Add a new folder
     */
    function addFolder(folderName, parentId = null) {
        const newFolder = {
            id: generateId('folder'),
            title: folderName,
            type: 'folder',
            created: Date.now(),
            updated: Date.now(),
            expanded: true,
            children: []
        };
        
        if (parentId) {
            const parent = findNoteById(parentId);
            if (parent && parent.type === 'folder') {
                if (!parent.children) {
                    parent.children = [];
                }
                parent.children.push(newFolder);
                parent.expanded = true;
            } else {
                app.notes.push(newFolder);
            }
        } else {
            app.notes.push(newFolder);
        }
        
        saveNotes();
        renderTree();
    }
    
    /**
     * Add a new note
     */
    function addNote(noteName, parentId = null) {
        const newNote = {
            id: generateId('note'),
            title: noteName,
            type: 'note',
            created: Date.now(),
            updated: Date.now(),
            content: ''
        };
        
        if (parentId) {
            const parent = findNoteById(parentId);
            if (parent && parent.type === 'folder') {
                if (!parent.children) {
                    parent.children = [];
                }
                parent.children.push(newNote);
                parent.expanded = true;
            } else {
                app.notes.push(newNote);
            }
        } else {
            app.notes.push(newNote);
        }
        
        saveNotes();
        renderTree();
        setActiveItem(newNote.id);
    }
    
    /**
     * Export notes as JSON file
     */
    function exportNotes() {
        try {
            const json = JSON.stringify(app.notes, null, 2);
            const blob = new Blob([json], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'redlines-notes.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            showToast('Notes exported successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            showToast('Error exporting notes', 'error');
        }
    }
    
    /**
     * Import notes from JSON file
     */
    function importNotes() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        const importedNotes = JSON.parse(event.target.result);
                        
                        // Validate notes format
                        if (!Array.isArray(importedNotes)) {
                            throw new Error('Invalid notes format');
                        }
                        
                        showConfirmDialog(
                            'Import Notes',
                            'This will replace your current notes. Continue?',
                            () => {
                                app.notes = importedNotes;
                                saveNotes();
                                renderTree();
                                app.activeNoteId = null;
                                clearEditor();
                                hideWelcomeScreen();
                                showToast('Notes imported successfully', 'success');
                            }
                        );
                    } catch (e) {
                        console.error('Import error:', e);
                        showToast('Error importing file: Invalid format', 'error');
                    }
                };
                reader.onerror = function() {
                    showToast('Error reading file', 'error');
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '';
        switch (type) {
            case 'success': icon = '✅'; break;
            case 'error': icon = '❌'; break;
            case 'warning': icon = '⚠️'; break;
            default: icon = 'ℹ️';
        }
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
        `;
        
        elements.toastContainer.appendChild(toast);
        
        // Remove toast after delay
        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * Show modal dialog
     */
    function showModal(title, content, buttons) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const titleElement = document.createElement('div');
        titleElement.className = 'modal-title';
        titleElement.textContent = title;
        header.appendChild(titleElement);
        
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => {
            overlay.remove();
        });
        header.appendChild(closeButton);
        
        modal.appendChild(header);
        
        // Create body
        const body = document.createElement('div');
        body.className = 'modal-body';
        
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }
        
        modal.appendChild(body);
        
        // Create footer
        if (buttons && buttons.length > 0) {
            const footer = document.createElement('div');
            footer.className = 'modal-footer';
            
            buttons.forEach(button => {
                const btn = document.createElement('button');
                btn.className = `btn ${button.primary ? 'btn-primary' : 'btn-secondary'}`;
                btn.textContent = button.text;
                btn.addEventListener('click', () => {
                    if (button.handler) {
                        button.handler();
                    }
                    overlay.remove();
                });
                footer.appendChild(btn);
            });
            
            modal.appendChild(footer);
        }
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Handle Escape key
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        
        return overlay;
    }
    
    /**
     * Show confirm dialog
     */
    function showConfirmDialog(title, message, onConfirm) {
        return showModal(title, `<p>${message}</p>`, [
            {
                text: 'Cancel',
                primary: false
            },
            {
                text: 'Confirm',
                primary: true,
                handler: onConfirm
            }
        ]);
    }
    
    /**
     * Show prompt dialog
     */
    function showPromptDialog(title, message, defaultValue, onConfirm) {
        const content = document.createElement('div');
        
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        content.appendChild(messageElement);
        
        const inputGroup = document.createElement('div');
        inputGroup.className = 'form-group';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control';
        input.value = defaultValue || '';
        
        // Focus input when modal opens
        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);
        
        // Handle Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                onConfirm(input.value);
                modal.remove();
            }
        });
        
        inputGroup.appendChild(input);
        content.appendChild(inputGroup);
        
        const modal = showModal(title, content, [
            {
                text: 'Cancel',
                primary: false
            },
            {
                text: 'OK',
                primary: true,
                handler: () => onConfirm(input.value)
            }
        ]);
        
        return modal;
    }
    
    /**
     * Show help modal
     */
    function showHelpModal() {
        const content = document.createElement('div');
        
        // Introduction
        const intro = document.createElement('div');
        intro.className = 'help-section';
        intro.innerHTML = `
            <h3 class="help-section-title">Red Lines - Offensive Security Notes</h3>
            <p>A professional note-taking application designed specifically for offensive security practitioners.
            Organize your findings during security assessments with a structured approach.</p>
        `;
        content.appendChild(intro);
        
        // Keyboard shortcuts
        const shortcuts = document.createElement('div');
        shortcuts.className = 'help-section';
        shortcuts.innerHTML = `
            <h3 class="help-section-title">Keyboard Shortcuts</h3>
            <div class="shortcut-grid">
                <div class="shortcut-item">
                    <div class="shortcut-keys">
                        <span class="key">Ctrl</span><span class="key">E</span>
                    </div>
                    <div class="shortcut-text">Toggle Edit/Preview</div>
                </div>
                <div class="shortcut-item">
                    <div class="shortcut-keys">
                        <span class="key">Ctrl</span><span class="key">S</span>
                    </div>
                    <div class="shortcut-text">Save notes</div>
                </div>
                <div class="shortcut-item">
                    <div class="shortcut-keys">
                        <span class="key">Ctrl</span><span class="key">F</span>
                    </div>
                    <div class="shortcut-text">Search notes</div>
                </div>
                <div class="shortcut-item">
                    <div class="shortcut-keys">
                        <span class="key">Ctrl</span><span class="key">N</span>
                    </div>
                    <div class="shortcut-text">New note</div>
                </div>
                <div class="shortcut-item">
                    <div class="shortcut-keys">
                        <span class="key">F1</span>
                    </div>
                    <div class="shortcut-text">Show help</div>
                </div>
                <div class="shortcut-item">
                    <div class="shortcut-keys">
                        <span class="key">Del</span>
                    </div>
                    <div class="shortcut-text">Delete current item</div>
                </div>
                <div class="shortcut-item">
                    <div class="shortcut-keys">
                        <span class="key">Ctrl</span><span class="key">Space</span>
                    </div>
                    <div class="shortcut-text">Insert code</div>
                </div>
            </div>
        `;
        content.appendChild(shortcuts);
        
        // Markdown reference
        const markdown = document.createElement('div');
        markdown.className = 'help-section';
        markdown.innerHTML = `
            <h3 class="help-section-title">Markdown Reference</h3>
            <p>Red Lines supports standard Markdown syntax:</p>
            <ul>
                <li><code># Heading 1</code> - Main heading</li>
                <li><code>## Heading 2</code> - Sub heading</li>
                <li><code>**bold text**</code> - <strong>bold text</strong></li>
                <li><code>*italic text*</code> - <em>italic text</em></li>
                <li><code>- item</code> - Bulleted list</li>
                <li><code>1. item</code> - Numbered list</li>
                <li><code>\`code\`</code> - Inline code</li>
                <li><code>\`\`\`language\ncode block\n\`\`\`</code> - Code block with syntax highlighting</li>
                <li><code>[link text](url)</code> - Hyperlink</li>
                <li><code>![alt text](image-url)</code> - Image</li>
                <li><code>> quote</code> - Blockquote</li>
                <li><code>| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |</code> - Table</li>
                <li><code>[ ] text</code> - Unchecked checkbox</li>
                <li><code>[x] text</code> - Checked checkbox</li>
            </ul>
        `;
        content.appendChild(markdown);
        
        // Tips
        const tips = document.createElement('div');
        tips.className = 'help-section';
        tips.innerHTML = `
            <h3 class="help-section-title">Tips</h3>
            <ul>
                <li><strong>Right-click</strong> on items in the sidebar for context menu options</li>
                <li><strong>Drag and drop</strong> to organize notes and folders</li>
                <li><strong>Double-click</strong> note titles to rename them</li>
                <li>Notes are <strong>automatically saved</strong> as you type</li>
                <li>Use <strong>code blocks</strong> with language specifiers for syntax highlighting</li>
                <li>Try the <strong>templates</strong> for common security documentation</li>
                <li>Use <strong>export</strong> regularly to back up your notes</li>
            </ul>
        `;
        content.appendChild(tips);
        
        showModal('Help & Documentation', content, [
            {
                text: 'Close',
                primary: true
            }
        ]);
    }
    
    /**
     * Show template dropdown for inserting templates
     */
    function showTemplateDropdown(event) {
        if (!app.activeNoteId) {
            showToast('Select a note first', 'warning');
            return;
        }
        
        const dropdown = document.createElement('div');
        dropdown.className = 'template-dropdown';
        
        // Define templates for security notes
        const templates = [
            { id: 'nmap-scan', name: 'Nmap Scan Template' },
            { id: 'vulnerability', name: 'Vulnerability Template' },
            { id: 'credentials', name: 'Credentials Template' },
            { id: 'web-vuln', name: 'Web Vulnerability Template' }
        ];
        
        // Add template options to dropdown
        templates.forEach(template => {
            const item = document.createElement('div');
            item.className = 'template-item';
            item.textContent = template.name;
            item.addEventListener('click', () => {
                insertTemplate(template.id);
                dropdown.remove();
            });
            dropdown.appendChild(item);
        });
        
        // Position the dropdown
        const rect = event.target.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + 2}px`;
        dropdown.style.left = `${rect.left}px`;
        
        // Add to document
        document.body.appendChild(dropdown);
        
        // Close on outside click
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target) && e.target !== event.target) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }
    
    /**
     * Insert template into editor
     */
    function insertTemplate(templateType) {
        if (!app.activeNoteId) return;
        
        let templateContent = '';
        const now = new Date().toLocaleString();
        
        switch (templateType) {
            case 'nmap-scan':
                templateContent = `# Nmap Scan Results\n\n## Target: \n\n## Date: ${now}\n\n## Command:\n\`\`\`bash\nnmap -sV -sC <target>\n\`\`\`\n\n## Results:\n\n\`\`\`\n# Paste scan results here\n\`\`\`\n\n## Open Ports:\n\n- \n\n## Services:\n\n- \n\n## Next Steps:\n\n- `;
                break;
            case 'vulnerability':
                templateContent = `# Vulnerability: [Title]\n\n## Description\n\n\n## Reproduction Steps\n\n1. \n2. \n3. \n\n## Impact\n\n\n## Severity\n\n[ ] Critical\n[ ] High\n[ ] Medium\n[ ] Low\n[ ] Info\n\n## Mitigation\n\n\n## Screenshots\n\n`;
                break;
            case 'credentials':
                templateContent = `# Captured Credentials\n\n## System: \n\n## Username: \n\n## Password/Hash: \n\n## Obtained via: \n\n## Notes:\n\n`;
                break;
            case 'web-vuln':
                templateContent = `# Web Vulnerability\n\n## URL: \n\n## Type: \n\n## Description:\n\n\n## Payload:\n\`\`\`\n\n\`\`\`\n\n## Request:\n\`\`\`http\n\n\`\`\`\n\n## Response:\n\`\`\`http\n\n\`\`\`\n\n## Impact:\n\n\n## Remediation:\n\n`;
                break;
            default:
                return;
        }
        
        // Insert at cursor position or replace selection
        const editor = elements.editor;
        const startPos = editor.selectionStart;
        const endPos = editor.selectionEnd;
        const beforeText = editor.value.substring(0, startPos);
        const afterText = editor.value.substring(endPos);
        
        editor.value = beforeText + templateContent + afterText;
        
        // Save the updated content
        const note = findNoteById(app.activeNoteId);
        if (note) {
            note.content = editor.value;
            note.updated = Date.now();
            saveNotes();
        }
        
        // Set cursor at the end of the template
        editor.selectionStart = startPos + templateContent.length;
        editor.selectionEnd = startPos + templateContent.length;
        editor.focus();
        
        showToast(`Inserted ${templateType} template`, 'success');
    }
    
    /**
     * Show code snippet dropdown
     */
    function showCodeDropdown(event) {
        if (!app.activeNoteId) {
            showToast('Select a note first', 'warning');
            return;
        }
        
        const dropdown = document.createElement('div');
        dropdown.className = 'code-dropdown';
        
        // Add language options - focus on common security-related languages
        const languages = [
            { id: 'bash', name: 'Bash/Shell' },
            { id: 'python', name: 'Python' },
            { id: 'javascript', name: 'JavaScript' },
            { id: 'sql', name: 'SQL' },
            { id: 'http', name: 'HTTP' },
            { id: 'json', name: 'JSON' },
            { id: 'powershell', name: 'PowerShell' }
        ];
        
        languages.forEach(lang => {
            const item = document.createElement('div');
            item.className = 'code-dropdown-item';
            item.textContent = lang.name;
            item.addEventListener('click', () => {
                insertCodeSnippet(lang.id);
                dropdown.remove();
            });
            dropdown.appendChild(item);
        });
        
        // Position the dropdown
        const rect = event.target.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + 2}px`;
        dropdown.style.left = `${rect.left}px`;
        
        // Add to document
        document.body.appendChild(dropdown);
        
        // Close on outside click
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target) && e.target !== event.target) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }
    
    /**
     * Insert a code snippet template
     */
    function insertCodeSnippet(language) {
        if (!app.activeNoteId) return;
        
        const editor = elements.editor;
        const startPos = editor.selectionStart;
        const endPos = editor.selectionEnd;
        const selectedText = editor.value.substring(startPos, endPos);
        
        let snippet;
        if (selectedText) {
            // If text is selected, wrap it as a code block
            snippet = `\`\`\`${language}\n${selectedText}\n\`\`\``;
        } else {
            // If no text is selected, insert an empty template
            switch (language) {
                case 'bash':
                    snippet = '```bash\n# Command\n\n```';
                    break;
                case 'python':
                    snippet = '```python\n# Python code\n\n```';
                    break;
                case 'sql':
                    snippet = '```sql\n-- SQL query\n\n```';
                    break;
                case 'http':
                    snippet = '```http\nGET /path HTTP/1.1\nHost: example.com\n\n```';
                    break;
                default:
                    snippet = `\`\`\`${language}\n\n\`\`\``;
            }
        }
        
        // Insert the snippet
        const beforeText = editor.value.substring(0, startPos);
        const afterText = editor.value.substring(endPos);
        editor.value = beforeText + snippet + afterText;
        
        // Update the cursor position to be inside the code block
        const newCursorPos = beforeText.length + snippet.indexOf('\n\n') + 1;
        editor.selectionStart = newCursorPos;
        editor.selectionEnd = newCursorPos;
        
        // Focus the editor
        editor.focus();
        
        // Update note content
        if (app.activeNoteId) {
            const note = findNoteById(app.activeNoteId);
            if (note) {
                note.content = editor.value;
                note.updated = Date.now();
                saveNotes();
            }
        }
    }
    
    /**
     * Show tools dropdown menu
     */
    function showToolsDropdown(event) {
        const dropdown = document.createElement('div');
        dropdown.className = 'tools-dropdown';
        
        // Define available tools
        const tools = [
            { id: 'encoder', name: 'Encoder/Decoder', icon: '🔄', action: showEncoderTool }
        ];
        
        // Add tools to dropdown
        tools.forEach(tool => {
            const item = document.createElement('div');
            item.className = 'tools-dropdown-item';
            item.innerHTML = `
                <span class="tool-icon">${tool.icon}</span>
                <span>${tool.name}</span>
            `;
            item.addEventListener('click', () => {
                tool.action();
                dropdown.remove();
            });
            dropdown.appendChild(item);
        });
        
        // Position and show dropdown
        const rect = event.target.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + 2}px`;
        dropdown.style.right = `${window.innerWidth - rect.right}px`;
        
        document.body.appendChild(dropdown);
        
        // Close on outside click
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target) && e.target !== event.target) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }
    
    /**
     * Show encoder/decoder tool
     */
    function showEncoderTool() {
        const content = document.createElement('div');
        content.className = 'tool-container';
        
        // Input area
        const inputGroup = document.createElement('div');
        inputGroup.className = 'form-group';
        inputGroup.innerHTML = `
            <label class="form-label">Input Text</label>
            <textarea id="encoder-input" class="form-control" rows="3" placeholder="Enter text to encode/decode..."></textarea>
        `;
        content.appendChild(inputGroup);
        
        // Encoding type selector
        const encodingTypeGroup = document.createElement('div');
        encodingTypeGroup.className = 'form-group';
        encodingTypeGroup.innerHTML = `
            <label class="form-label">Encoding Type</label>
            <select id="encoding-type" class="form-control">
                <option value="base64">Base64</option>
                <option value="url">URL</option>
                <option value="html">HTML</option>
                <option value="hex">Hexadecimal</option>
            </select>
        `;
        content.appendChild(encodingTypeGroup);
        
        // Action buttons
        const actionGroup = document.createElement('div');
        actionGroup.className = 'form-group';
        actionGroup.innerHTML = `
            <button id="encode-btn" class="btn btn-primary">Encode</button>
            <button id="decode-btn" class="btn btn-secondary">Decode</button>
        `;
        content.appendChild(actionGroup);
        
        // Output area
        const outputGroup = document.createElement('div');
        outputGroup.className = 'form-group';
        outputGroup.innerHTML = `
            <label class="form-label">Result</label>
            <div class="output-container">
                <textarea id="encoder-output" class="form-control" rows="3" readonly></textarea>
                <button id="copy-encoding" class="btn-icon" title="Copy to clipboard">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            </div>
        `;
        content.appendChild(outputGroup);
        
        // Create note button
        const createNoteGroup = document.createElement('div');
        createNoteGroup.className = 'form-group';
        createNoteGroup.innerHTML = `
            <button id="create-encoding-note" class="btn btn-secondary">Create Note from Result</button>
        `;
        content.appendChild(createNoteGroup);
        
        // Show the modal
        const modal = showModal('Encoder/Decoder', content, [
            {
                text: 'Close',
                primary: false
            }
        ]);
        
        // Setup event listeners
        const encoderInput = modal.querySelector('#encoder-input');
        const encodingType = modal.querySelector('#encoding-type');
        const encoderOutput = modal.querySelector('#encoder-output');
        const encodeBtn = modal.querySelector('#encode-btn');
        const decodeBtn = modal.querySelector('#decode-btn');
        const copyBtn = modal.querySelector('#copy-encoding');
        const createNoteBtn = modal.querySelector('#create-encoding-note');
        
        // Encode function
        encodeBtn.addEventListener('click', () => {
            const input = encoderInput.value;
            if (!input) return;
            
            let output = '';
            const type = encodingType.value;
            
            try {
                switch (type) {
                    case 'base64':
                        output = btoa(input);
                        break;
                    case 'url':
                        output = encodeURIComponent(input);
                        break;
                    case 'html':
                        output = input
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&#039;');
                        break;
                    case 'hex':
                        output = Array.from(input)
                            .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
                            .join('');
                        break;
                }
                encoderOutput.value = output;
            } catch (error) {
                console.error('Encoding error:', error);
                encoderOutput.value = 'Error encoding text';
            }
        });
        
        // Decode function
        decodeBtn.addEventListener('click', () => {
            const input = encoderInput.value;
            if (!input) return;
            
            let output = '';
            const type = encodingType.value;
            
            try {
                switch (type) {
                    case 'base64':
                        output = atob(input);
                        break;
                    case 'url':
                        output = decodeURIComponent(input);
                        break;
                    case 'html':
                        output = input
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&#039;/g, "'");
                        break;
                    case 'hex':
                        output = input.match(/.{1,2}/g)
                            .map(byte => String.fromCharCode(parseInt(byte, 16)))
                            .join('');
                        break;
                }
                encoderOutput.value = output;
            } catch (error) {
                console.error('Decoding error:', error);
                encoderOutput.value = 'Error decoding text';
            }
        });
        
        // Copy result to clipboard
        copyBtn.addEventListener('click', () => {
            encoderOutput.select();
            document.execCommand('copy');
            showToast('Result copied to clipboard', 'success');
        });
        
        // Create a new note with the encoding/decoding result
        createNoteBtn.addEventListener('click', () => {
            const input = encoderInput.value;
            const output = encoderOutput.value;
            const type = encodingType.value;
            
            if (!input || !output) return;
            
            showPromptDialog(
                'Create Encoding Note',
                'Enter note title:',
                `${type.toUpperCase()} Encoding`,
                (noteName) => {
                    if (noteName) {
                        const noteId = addNote(noteName);
                        const note = findNoteById(noteId);
                        if (note) {
                            note.content = `# ${noteName}\n\n## Original Text\n\`\`\`\n${input}\n\`\`\`\n\n## ${type.toUpperCase()} Encoding\n\`\`\`\n${output}\n\`\`\`\n\n## Timestamp\n${new Date().toLocaleString()}\n`;
                            saveNotes();
                            setActiveItem(noteId);
                            modal.remove();
                            showToast('Encoding note created', 'success');
                        }
                    }
                }
            );
        });
    }
    
    /**
     * Utility functions for unique ID generation
     */
    function generateId(prefix) {
        return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
});
/**
 * Red Lines Application - Notes JS File
 * Note management functions
 */

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
 * Save tags to localStorage
 */
function saveTags() {
    try {
        localStorage.setItem('redlines-tags', JSON.stringify(app.tags));
    } catch (error) {
        console.error('Error saving tags:', error);
    }
}

/**
 * Save commands to localStorage
 */
function saveCommands() {
    try {
        localStorage.setItem('redlines-commands', JSON.stringify(app.commands));
    } catch (error) {
        console.error('Error saving commands:', error);
    }
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
 * Create demo project with sample notes and tags
 */
function createDemoProject() {
    const timestamp = Date.now();
    
    // Add demo tags
    app.tags = [
        { id: 'tag-' + timestamp, name: 'critical', color: 'tag-critical' },
        { id: 'tag-' + (timestamp + 1), name: 'high', color: 'tag-high' },
        { id: 'tag-' + (timestamp + 2), name: 'medium', color: 'tag-medium' },
        { id: 'tag-' + (timestamp + 3), name: 'low', color: 'tag-low' },
        { id: 'tag-' + (timestamp + 4), name: 'info', color: 'tag-info' },
        { id: 'tag-' + (timestamp + 5), name: 'web', color: 'tag-web' },
        { id: 'tag-' + (timestamp + 6), name: 'network', color: 'tag-network' },
        { id: 'tag-' + (timestamp + 7), name: 'exploitation', color: 'tag-exploitation' },
        { id: 'tag-' + (timestamp + 8), name: 'recon', color: 'tag-recon' }
    ];
    
    saveTags();
    
    // Add demo commands
    app.commands = [
        {
            id: 'cmd-' + timestamp,
            command: 'nmap -sV -sC 10.0.0.1',
            description: 'Basic service detection and script scan',
            output: 'Starting Nmap 7.92 ( https://nmap.org ) at 2023-10-31 13:27 EDT\nNmap scan report for 10.0.0.1\nHost is up (0.0032s latency).\nNot shown: 997 closed tcp ports (conn-refused)\nPORT   STATE SERVICE VERSION\n22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5\n80/tcp open  http    Apache httpd 2.4.41\n443/tcp open  https   Apache httpd 2.4.41\nService Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel',
            category: 'recon',
            created: timestamp
        },
        {
            id: 'cmd-' + (timestamp + 1),
            command: 'gobuster dir -u http://10.0.0.1 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -t 50',
            description: 'Web directory enumeration',
            output: 'Gobuster v3.1.0\nby OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)\n===============================================================\n[+] Url:                     http://10.0.0.1\n[+] Method:                  GET\n[+] Threads:                 50\n[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt\n[+] Negative Status codes:   404\n[+] User Agent:              gobuster/3.1.0\n[+] Timeout:                 10s\n===============================================================\n2023/10/31 13:28:34 Starting gobuster in directory enumeration mode\n===============================================================\n/admin                (Status: 301) [Size: 305] [--> http://10.0.0.1/admin/]\n/images               (Status: 301) [Size: 307] [--> http://10.0.0.1/images/]\n/js                   (Status: 301) [Size: 302] [--> http://10.0.0.1/js/]\n/css                  (Status: 301) [Size: 303] [--> http://10.0.0.1/css/]\n/login                (Status: 200) [Size: 1052]\n/backup               (Status: 403) [Size: 275]\n/config               (Status: 301) [Size: 306] [--> http://10.0.0.1/config/]',
            category: 'enum',
            created: timestamp + 100
        },
        {
            id: 'cmd-' + (timestamp + 2),
            command: 'sqlmap -u "http://10.0.0.1/login.php" --forms --dump',
            description: 'SQL injection attempt on login form',
            output: 'sqlmap identified the following injection point(s) with a total of 62 HTTP(s) requests:\n---\nParameter: username (POST)\n    Type: boolean-based blind\n    Title: AND boolean-based blind - WHERE or HAVING clause\n    Payload: username=admin\' AND 3782=3782 AND \'lvxt\'=\'lvxt&password=password\n\n    Type: time-based blind\n    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)\n    Payload: username=admin\' AND (SELECT 3755 FROM (SELECT(SLEEP(5)))ZBOV) AND \'Mczi\'=\'Mczi&password=password\n\n    Type: UNION query\n    Title: Generic UNION query (NULL) - 3 columns\n    Payload: username=admin\' UNION ALL SELECT NULL,NULL,CONCAT(0x7176707871,0x496e4d534e4a45775055614a6a64624e696370646c6649536c6b78694f695a586270466c4c7a4254,0x71787a7871)-- -&password=password\n---\nDatabase: webapp\nTable: users\n[2 entries]\n+----+----------+-------------------+\n| id | username | password          |\n+----+----------+-------------------+\n| 1  | admin    | admin123          |\n| 2  | john     | SuperSecretPass1! |\n+----+----------+-------------------+\n',
            category: 'exploit',
            created: timestamp + 200
        }
    ];
    
    saveCommands();
    
    // Create demo project
    const noteId1 = 'note-' + (timestamp + 2);
    const noteId2 = 'note-' + (timestamp + 3);
    const noteId3 = 'note-' + (timestamp + 5);
    const noteId4 = 'note-' + (timestamp + 7);
    
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
                            id: noteId1,
                            title: 'Nmap Scan',
                            type: 'note',
                            created: timestamp,
                            updated: timestamp,
                            tags: ['tag-' + (timestamp + 4), 'tag-' + (timestamp + 6), 'tag-' + (timestamp + 8)],
                            content: '# Nmap Scan Results\n\n```bash\nnmap -sV -sC 10.0.0.1\n\n22/tcp  open  ssh     OpenSSH 7.6p1\n80/tcp  open  http    Apache 2.4.29\n443/tcp open  https   Apache 2.4.29\n```\n\n## Open Ports\n\n- 22/tcp - SSH\n- 80/tcp - HTTP\n- 443/tcp - HTTPS\n\n## Next Steps\n\n- Enumerate web services - See [[note-' + (timestamp + 3) + '|Web Enumeration]]\n- Check for default credentials\n- Look for outdated software versions'
                        },
                        {
                            id: noteId2,
                            title: 'Web Enumeration',
                            type: 'note',
                            created: timestamp,
                            updated: timestamp,
                            tags: ['tag-' + (timestamp + 3), 'tag-' + (timestamp + 5), 'tag-' + (timestamp + 8)],
                            content: '# Web Enumeration\n\n## Directory Brute Force\n\n```bash\ngobuster dir -u http://10.0.0.1 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -t 50\n```\n\n### Results\n\n- /admin (403 Forbidden)\n- /login (200 OK)\n- /backup (403 Forbidden)\n- /config (301 Redirect)\n\n## Technologies Detected\n\n- Apache 2.4.29\n- PHP 7.2.24\n- Bootstrap 4.1.3\n- jQuery 3.3.1\n\n## Potential Vulnerabilities\n\nFound SQL injection in login form. See [[note-' + (timestamp + 5) + '|SQL Injection]] for details.'
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
                            id: noteId3,
                            title: 'SQL Injection',
                            type: 'note',
                            created: timestamp,
                            updated: timestamp,
                            tags: ['tag-' + (timestamp), 'tag-' + (timestamp + 5), 'tag-' + (timestamp + 7)],
                            content: '# SQL Injection in Login Form\n\n## Vulnerable Parameter\nUsername field is vulnerable to SQLi\n\n## Proof of Concept\n\n```sql\nUsername: admin\' OR 1=1 --\nPassword: anything\n```\n\n## Exploitation\n\n1. Extract database version\n   `admin\' UNION SELECT 1,version(),3,4 --`\n\n2. Extract database tables\n   `admin\' UNION SELECT 1,table_name,3,4 FROM information_schema.tables --`\n\n3. Extract users table\n   `admin\' UNION SELECT 1,username,password,4 FROM users --`\n\n## Results\n\nSuccessfully extracted credentials. See [[note-' + (timestamp + 7) + '|Credentials]] for details.'
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
                            id: noteId4,
                            title: 'Credentials',
                            type: 'note',
                            created: timestamp,
                            updated: timestamp,
                            tags: ['tag-' + (timestamp), 'tag-' + (timestamp + 7)],
                            content: '# Discovered Credentials\n\n## SSH\n- Username: admin\n- Password: P@ssw0rd123!\n\n## Web Application\n- Username: admin\n- Password: admin123\n\n## Database\n- Username: dbuser\n- Password: dbp@ss456\n\n## API Keys\n- Key: 3d80c9e1f5b4a2d7e6c8b0a9f3d2e5c1\n- Secret: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
                        }
                    ]
                }
            ]
        }
    ];
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
 * Get path to a note (for display)
 */
function getNotePath(id) {
    const paths = [];
    
    function traverse(nodes, path = []) {
        for (const node of nodes) {
            const currentPath = [...path, node.title];
            
            if (node.id === id) {
                paths.push(currentPath);
                return true;
            }
            
            if (node.type === 'folder' && node.children) {
                if (traverse(node.children, currentPath)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    traverse(app.notes);
    
    return paths.length > 0 ? paths[0].join(' > ') : '';
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
 * Add a new folder with standard subfolders
 */
function addFolder(folderName, parentId = null, addSubfolders = true) {
    const timestamp = Date.now();
    const newFolder = {
        id: generateId('folder'),
        title: folderName,
        type: 'folder',
        created: timestamp,
        updated: timestamp,
        expanded: true,
        children: []
    };
    
    // Add standard subfolders if requested
    if (addSubfolders) {
        const subfolderNames = ['Recon', 'Exploit', 'Loot', 'Misc'];
        
        subfolderNames.forEach((subfolderName, index) => {
            const subfolder = {
                id: generateId('folder'),
                title: subfolderName,
                type: 'folder',
                created: timestamp + index + 1, // Ensure unique timestamps
                updated: timestamp + index + 1,
                expanded: false,
                children: []
            };
            
            newFolder.children.push(subfolder);
        });
    }
    
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
    
    return newFolder.id; // Return the ID of the new folder
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
        content: '',
        tags: []
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
    
    return newNote.id; // Return the ID of the new note for reference
}

/**
 * Add a tag to a note
 */
function addTagToNote(noteId, tagName) {
    const note = findNoteById(noteId);
    if (!note || note.type !== 'note') return;
    
    if (!note.tags) {
        note.tags = [];
    }
    
    // Check if the tag already exists
    let tagId = null;
    const existingTag = app.tags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
    
    if (existingTag) {
        tagId = existingTag.id;
        
        // Check if this note already has this tag
        if (note.tags.includes(tagId)) {
            showToast('Tag already exists on this note', 'warning');
            return;
        }
    } else {
        // Create a new tag
        tagId = generateId('tag');
        
        // Assign a color based on the tag name
        let color = 'tag-info'; // Default color
        
        const lowercaseTag = tagName.toLowerCase();
        if (lowercaseTag === 'critical') color = 'tag-critical';
        else if (lowercaseTag === 'high') color = 'tag-high';
        else if (lowercaseTag === 'medium') color = 'tag-medium';
        else if (lowercaseTag === 'low') color = 'tag-low';
        else if (lowercaseTag === 'info') color = 'tag-info';
        else if (lowercaseTag.includes('exploit')) color = 'tag-exploitation';
        else if (lowercaseTag.includes('recon')) color = 'tag-recon';
        else if (lowercaseTag.includes('network')) color = 'tag-network';
        else if (lowercaseTag.includes('web')) color = 'tag-web';
        
        // Add the new tag to the global tags
        app.tags.push({
            id: tagId,
            name: tagName,
            color: color
        });
        
        saveTags();
    }
    
    // Add tag to note
    note.tags.push(tagId);
    note.updated = Date.now();
    saveNotes();
    
    // Update the UI
    renderNoteTags(note);
    renderTree();
}

/**
 * Remove a tag from a note
 */
function removeTagFromNote(noteId, tagId) {
    const note = findNoteById(noteId);
    if (note && note.tags) {
        note.tags = note.tags.filter(id => id !== tagId);
        note.updated = Date.now();
        saveNotes();
        renderNoteTags(note);
        renderTree();
        showToast('Tag removed', 'success');
    }
}

/**
 * Export notes as JSON file
 */
function exportNotes() {
    try {
        // Combine notes, tags, and commands for export
        const exportData = {
            notes: app.notes,
            tags: app.tags,
            commands: app.commands,
            version: '1.0.0'
        };
        
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'redlines-export.json';
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
                    const importedData = JSON.parse(event.target.result);
                    
                    // Validate import format
                    if (!importedData.notes || !Array.isArray(importedData.notes)) {
                        throw new Error('Invalid notes format');
                    }
                    
                    showConfirmDialog(
                        'Import Notes',
                        'This will replace your current notes, tags, and commands. Continue?',
                        () => {
                            app.notes = importedData.notes;
                            
                            // Import tags if available
                            if (importedData.tags && Array.isArray(importedData.tags)) {
                                app.tags = importedData.tags;
                            } else {
                                app.tags = [];
                            }
                            
                            // Import commands if available
                            if (importedData.commands && Array.isArray(importedData.commands)) {
                                app.commands = importedData.commands;
                            } else {
                                app.commands = [];
                            }
                            
                            saveNotes();
                            saveTags();
                            saveCommands();
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
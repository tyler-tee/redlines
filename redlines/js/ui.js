/**
 * Red Lines Application - UI JS File
 * UI-related functions
 */

/**
 * Render the tree view
 */
function renderTree() {
    elements.treeContainer.innerHTML = '';
    
    // Apply filters
    let filteredNotes = app.notes;
    
    // Apply search filter
    if (app.searchTerm) {
        filteredNotes = filterNotesBySearch(app.notes, app.searchTerm);
    }
    
    // Apply tag filter
    if (app.currentFilters.tags && app.currentFilters.tags.length > 0) {
        filteredNotes = filterNotesByTags(filteredNotes, app.currentFilters.tags);
    }
    
    // Apply date filter
    if (app.currentFilters.dateStart || app.currentFilters.dateEnd) {
        filteredNotes = filterNotesByDate(filteredNotes, app.currentFilters.dateStart, app.currentFilters.dateEnd);
    }
    
    renderNodes(filteredNotes, elements.treeContainer);
    
    // Setup drag and drop
    setupDragAndDrop();
    
    // Update filter buttons styles
    updateFilterButtonStyles();
}

/**
 * Update filter button styles based on active filters
 */
function updateFilterButtonStyles() {
    // Reset both buttons
    elements.filterByTagsBtn.classList.remove('active');
    elements.filterByDateBtn.classList.remove('active');
    
    // Set active class based on current filters
    if (app.currentFilters.tags && app.currentFilters.tags.length > 0) {
        elements.filterByTagsBtn.classList.add('active');
    }
    
    if (app.currentFilters.dateStart || app.currentFilters.dateEnd) {
        elements.filterByDateBtn.classList.add('active');
    }
}

/**
 * Filter notes based on search term
 */
function filterNotesBySearch(notes, term) {
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
                noteCopy.children = filterNotesBySearch(note.children, term);
                noteCopy.expanded = true; // Auto-expand matching folders
            }
            result.push(noteCopy);
        } else if (note.type === 'folder' && note.children) {
            // If not matching but is a folder, check children
            const filteredChildren = filterNotesBySearch(note.children, term);
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
 * Filter notes based on tags
 */
function filterNotesByTags(notes, tags) {
    const result = [];
    
    for (const note of notes) {
        // Create a copy of the note
        const noteCopy = { ...note };
        
        // Check if the note matches any of the tags
        const tagsMatch = note.type === 'note' && note.tags && note.tags.some(tagId => tags.includes(tagId));
        
        if (tagsMatch) {
            result.push(noteCopy);
        } else if (note.type === 'folder' && note.children) {
            // If folder, check children
            const filteredChildren = filterNotesByTags(note.children, tags);
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
 * Filter notes based on date range
 */
function filterNotesByDate(notes, startDate, endDate) {
    const result = [];
    const start = startDate ? new Date(startDate).getTime() : 0;
    const end = endDate ? new Date(endDate).getTime() : Infinity;
    
    for (const note of notes) {
        // Create a copy of the note
        const noteCopy = { ...note };
        
        // Check if the note's updated timestamp falls within the range
        const dateMatch = note.updated >= start && note.updated <= end;
        
        if (dateMatch) {
            // If this is a folder, filter its children too
            if (note.type === 'folder' && note.children) {
                noteCopy.children = filterNotesByDate(note.children, startDate, endDate);
                if (noteCopy.children.length > 0) {
                    noteCopy.expanded = true; // Auto-expand if has matching children
                }
            }
            result.push(noteCopy);
        } else if (note.type === 'folder' && note.children) {
            // If folder doesn't match but might have children that do
            const filteredChildren = filterNotesByDate(note.children, startDate, endDate);
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
        
        // Add tags indicators (for notes only)
        if (node.type === 'note' && node.tags && node.tags.length > 0) {
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'tree-item-tags';
            
            // Add up to 3 tag indicators
            const maxTagsToShow = 3;
            const tagsToShow = node.tags.slice(0, maxTagsToShow);
            
            tagsToShow.forEach(tagId => {
                const tag = app.tags.find(t => t.id === tagId);
                if (tag) {
                    const tagDot = document.createElement('div');
                    tagDot.className = `tree-item-tag ${tag.color}`;
                    tagDot.title = tag.name;
                    tagsContainer.appendChild(tagDot);
                }
            });
            
            // If there are more tags, add a count indicator
            if (node.tags.length > maxTagsToShow) {
                const moreCount = document.createElement('div');
                moreCount.className = 'tree-item-tag tag-more';
                moreCount.title = `${node.tags.length - maxTagsToShow} more tags`;
                moreCount.textContent = '+' + (node.tags.length - maxTagsToShow);
                tagsContainer.appendChild(moreCount);
            }
            
            item.appendChild(tagsContainer);
        }
        
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
        
        // Render tags
        renderNoteTags(note);
        
        // Show editor/preview based on active tab
        elements.editor.classList.remove('show');
        elements.preview.classList.remove('show');
        document.getElementById(app.activeTab).classList.add('show');
    } else {
        // For folders, show empty editor
        elements.editor.value = '';
        elements.preview.innerHTML = '';
        
        // Clear tags
        renderNoteTags(null);
    }
}

/**
 * Render tags for the active note
 */
function renderNoteTags(note) {
    const tagsList = elements.noteTagsList;
    tagsList.innerHTML = '';
    
    if (!note || !note.tags || note.type !== 'note') {
        elements.addTagBtn.style.display = 'none';
        return;
    }
    
    elements.addTagBtn.style.display = 'flex';
    
    note.tags.forEach(tagId => {
        const tag = app.tags.find(t => t.id === tagId);
        if (tag) {
            const tagElement = document.createElement('div');
            tagElement.className = `note-tag ${tag.color}`;
            tagElement.dataset.tagId = tag.id;
            
            const tagName = document.createElement('span');
            tagName.textContent = tag.name;
            tagElement.appendChild(tagName);
            
            const removeBtn = document.createElement('span');
            removeBtn.className = 'note-tag-remove';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeTagFromNote(note.id, tag.id);
            });
            tagElement.appendChild(removeBtn);
            
            tagsList.appendChild(tagElement);
        }
    });
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
 * Clear editor
 */
function clearEditor() {
    elements.noteTitle.value = '';
    elements.editor.value = '';
    elements.preview.innerHTML = '';
    renderNoteTags(null);
}

/**
 * Update preview with rendered markdown
 */
function updatePreview() {
    if (app.activeNoteId) {
        const note = findNoteById(app.activeNoteId);
        if (note && note.type === 'note') {
            elements.preview.innerHTML = parseMarkdown(elements.editor.value);
            
            // Process note links to make them clickable
            processNoteLinks();
            
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
 * Process note links in preview to make them clickable
 */
function processNoteLinks() {
    // Find all wiki-style links [[note-id|Link Text]]
    const linkPattern = /\[\[(note-[a-z0-9-]+)\|(.+?)\]\]/g;
    const previewHtml = elements.preview.innerHTML;
    
    const processedHtml = previewHtml.replace(linkPattern, (match, noteId, linkText) => {
        // Only create a link if the note exists
        const linkedNote = findNoteById(noteId);
        if (linkedNote) {
            return `<a class="note-link" data-note-id="${noteId}">${linkText}</a>`;
        } else {
            return linkText;
        }
    });
    
    elements.preview.innerHTML = processedHtml;
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
    
    // Add note-specific actions
    if (node.type === 'note') {
        addContextMenuDivider(menu);
        
        addContextMenuItem(menu, '🏷️', 'Edit Tags', () => {
            setActiveItem(node.id);
            setTimeout(() => {
                showTagModal();
            }, 100);
        });
        
        addContextMenuItem(menu, '🔗', 'Link to Note', () => {
            setActiveItem(node.id);
            setTimeout(() => {
                showLinkNoteModal();
            }, 100);
        });
        
        addContextMenuItem(menu, '📸', 'Add Screenshot', () => {
            setActiveItem(node.id);
            setTimeout(() => {
                showScreenshotModal();
            }, 100);
        });
    }
    
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
 * Handle screenshot file selection
 */
function handleScreenshotFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const screenshotPreview = document.querySelector('#screenshot-preview-img');
            if (screenshotPreview) {
                screenshotPreview.src = e.target.result;
                screenshotPreview.style.display = 'block';
            }
        };
        
        reader.readAsDataURL(file);
    }
}
/**
 * Red Lines Application - Modals JS File
 * Modal dialog functionality
 */

/**
 * Show tag modal for adding/editing tags
 */
function showTagModal() {
    const note = findNoteById(app.activeNoteId);
    if (!note || note.type !== 'note') return;
    
    // Get modal template and clone it
    const modalTemplate = document.getElementById('tag-modal-template');
    if (!modalTemplate) return;
    
    const content = modalTemplate.cloneNode(true).content || modalTemplate.innerHTML;
    
    const modal = showModal('Manage Tags', content, [
        {
            text: 'Close',
            primary: false
        }
    ]);
    
    // Set up UI elements
    const tagInput = modal.querySelector('#tag-input');
    const addNewTagBtn = modal.querySelector('#add-new-tag-btn');
    const existingTags = modal.querySelector('#existing-tags');
    
    // Load existing tags
    renderExistingTags();
    
    // Add tag button click handler
    addNewTagBtn.addEventListener('click', () => {
        const tagName = tagInput.value.trim();
        if (tagName) {
            addTagToNote(app.activeNoteId, tagName);
            tagInput.value = '';
            tagInput.focus();
            renderExistingTags();
        }
    });
    
    // Handle Enter key on input
    tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addNewTagBtn.click();
        }
    });
    
    // Focus input when modal opens
    setTimeout(() => {
        tagInput.focus();
    }, 100);
    
    // Render existing tags for selection
    function renderExistingTags() {
        existingTags.innerHTML = '';
        
        app.tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = `existing-tag ${tag.color}`;
            tagElement.textContent = tag.name;
            tagElement.title = 'Click to add to note';
            
            // Check if the note already has this tag
            const isTagged = note.tags && note.tags.includes(tag.id);
            if (isTagged) {
                tagElement.classList.add('active');
                tagElement.title = 'Already added to note';
            }
            
            tagElement.addEventListener('click', () => {
                if (!isTagged) {
                    addTagToNote(app.activeNoteId, tag.name);
                    renderExistingTags();
                }
            });
            
            existingTags.appendChild(tagElement);
        });
    }
}

/**
 * Show tag filter modal
 */
function showTagFilterModal() {
    // Create content
    const content = document.createElement('div');
    
    const header = document.createElement('p');
    header.textContent = 'Select tags to filter notes:';
    content.appendChild(header);
    
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'existing-tags';
    content.appendChild(tagsContainer);
    
    // Create tag elements
    app.tags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = `existing-tag ${tag.color}`;
        tagElement.textContent = tag.name;
        
        // Mark as active if already in filter
        if (app.currentFilters.tags.includes(tag.id)) {
            tagElement.classList.add('active');
        }
        
        // Toggle tag selection
        tagElement.addEventListener('click', () => {
            tagElement.classList.toggle('active');
        });
        
        tagsContainer.appendChild(tagElement);
    });
    
    // Show modal
    const modal = showModal('Filter by Tags', content, [
        {
            text: 'Clear Filters',
            primary: false,
            handler: () => {
                app.currentFilters.tags = [];
                renderTree();
            }
        },
        {
            text: 'Apply Filters',
            primary: true,
            handler: () => {
                // Get selected tags
                const selectedTags = [];
                tagsContainer.querySelectorAll('.existing-tag.active').forEach(el => {
                    const tagName = el.textContent;
                    const tag = app.tags.find(t => t.name === tagName);
                    if (tag) {
                        selectedTags.push(tag.id);
                    }
                });
                
                // Update filters
                app.currentFilters.tags = selectedTags;
                renderTree();
            }
        }
    ]);
    
    return modal;
}

/**
 * Show date filter modal
 */
function showDateFilterModal() {
    // Create content
    const content = document.createElement('div');
    
    const header = document.createElement('p');
    header.textContent = 'Filter notes by date range:';
    content.appendChild(header);
    
    // Start date
    const startGroup = document.createElement('div');
    startGroup.className = 'form-group';
    
    const startLabel = document.createElement('label');
    startLabel.className = 'form-label';
    startLabel.textContent = 'Start Date:';
    startGroup.appendChild(startLabel);
    
    const startInput = document.createElement('input');
    startInput.type = 'date';
    startInput.className = 'form-control';
    if (app.currentFilters.dateStart) {
        startInput.value = new Date(app.currentFilters.dateStart).toISOString().split('T')[0];
    }
    startGroup.appendChild(startInput);
    
    content.appendChild(startGroup);
    
    // End date
    const endGroup = document.createElement('div');
    endGroup.className = 'form-group';
    
    const endLabel = document.createElement('label');
    endLabel.className = 'form-label';
    endLabel.textContent = 'End Date:';
    endGroup.appendChild(endLabel);
    
    const endInput = document.createElement('input');
    endInput.type = 'date';
    endInput.className = 'form-control';
    if (app.currentFilters.dateEnd) {
        endInput.value = new Date(app.currentFilters.dateEnd).toISOString().split('T')[0];
    }
    endGroup.appendChild(endInput);
    
    content.appendChild(endGroup);
    
    // Show modal
    const modal = showModal('Filter by Date', content, [
        {
            text: 'Clear Filters',
            primary: false,
            handler: () => {
                app.currentFilters.dateStart = null;
                app.currentFilters.dateEnd = null;
                renderTree();
            }
        },
        {
            text: 'Apply Filters',
            primary: true,
            handler: () => {
                // Get selected dates
                app.currentFilters.dateStart = startInput.value ? new Date(startInput.value).getTime() : null;
                app.currentFilters.dateEnd = endInput.value ? new Date(endInput.value).setHours(23, 59, 59, 999) : null;
                renderTree();
            }
        }
    ]);
    
    return modal;
}

/**
 * Show screenshot modal for adding screenshots
 */
function showScreenshotModal() {
    if (!app.activeNoteId) {
        showToast('Select a note first', 'warning');
        return;
    }
    
    // Get modal template and clone it
    const modalTemplate = document.getElementById('screenshot-modal-template');
    if (!modalTemplate) return;
    
    const content = modalTemplate.cloneNode(true).content || modalTemplate.innerHTML;
    
    const modal = showModal('Add Screenshot', content, [
        {
            text: 'Cancel',
            primary: false
        },
        {
            text: 'Insert Screenshot',
            primary: true,
            handler: insertScreenshot
        }
    ]);
    
    // Set up UI elements
    const tabs = modal.querySelectorAll('.screenshot-tab');
    const uploadArea = modal.querySelector('#screenshot-upload-area');
    const pasteArea = modal.querySelector('#screenshot-paste-area');
    const screenshotPreview = modal.querySelector('#screenshot-preview-img');
    const screenshotTitle = modal.querySelector('#screenshot-title');
    const screenshotDescription = modal.querySelector('#screenshot-description');
    
    let screenshotData = null;
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const target = this.getAttribute('data-target');
            
            // Hide all tab content
            modal.querySelectorAll('.screenshot-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Show the selected tab content
            modal.querySelector(`#${target}-tab`).style.display = 'block';
        });
    });
    
    // Upload area click handler
    uploadArea.addEventListener('click', () => {
        elements.screenshotFileInput.click();
    });
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drop-target');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drop-target');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drop-target');
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                processScreenshotFile(file);
            } else {
                showToast('Please select an image file', 'error');
            }
        }
    });
    
    // Paste area handlers
    pasteArea.addEventListener('click', () => {
        pasteArea.focus();
    });
    
    modal.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                processScreenshotFile(blob);
                break;
            }
        }
    });
    
    // Process a screenshot file
    function processScreenshotFile(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            screenshotData = e.target.result;
            screenshotPreview.src = screenshotData;
            screenshotPreview.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    }
    
    // Insert the screenshot into the note
    function insertScreenshot() {
        if (!screenshotData) {
            showToast('No screenshot selected', 'warning');
            return;
        }
        
        const title = screenshotTitle.value.trim() || 'Screenshot';
        const description = screenshotDescription.value.trim() || '';
        
        // Create markdown for the screenshot
        let markdown = `\n\n![${title}](${screenshotData})`;
        
        if (description) {
            markdown += `\n*${description}*`;
        }
        
        // Insert at cursor position or at the end
        const editor = elements.editor;
        const cursorPos = editor.selectionStart;
        const textBefore = editor.value.substring(0, cursorPos);
        const textAfter = editor.value.substring(cursorPos);
        
        editor.value = textBefore + markdown + textAfter;
        
        // Update the note content and save
        const note = findNoteById(app.activeNoteId);
        if (note) {
            note.content = editor.value;
            note.updated = Date.now();
            saveNotes();
            updatePreview();
        }
        
        showToast('Screenshot inserted', 'success');
    }
}

/**
 * Show link note modal
 */
function showLinkNoteModal() {
    if (!app.activeNoteId) {
        showToast('Select a note first', 'warning');
        return;
    }
    
    // Get modal template and clone it
    const modalTemplate = document.getElementById('link-modal-template');
    if (!modalTemplate) return;
    
    const content = modalTemplate.cloneNode(true).content || modalTemplate.innerHTML;
    
    const modal = showModal('Link to Another Note', content, [
        {
            text: 'Cancel',
            primary: false
        }
    ]);
    
    // Set up UI elements
    const linkSearch = modal.querySelector('#link-search');
    const linkResults = modal.querySelector('#link-results');
    
    // Handle search input
    linkSearch.addEventListener('input', () => {
        const searchTerm = linkSearch.value.toLowerCase();
        renderSearchResults(searchTerm);
    });
    
    // Focus search input when modal opens
    setTimeout(() => {
        linkSearch.focus();
    }, 100);
    
    // Initial render of all notes
    renderSearchResults('');
    
    // Render search results
    function renderSearchResults(searchTerm) {
        linkResults.innerHTML = '';
        
        // Get all notes (not folders)
        const allNotes = [];
        
        function collectNotes(nodes) {
            for (const node of nodes) {
                if (node.type === 'note' && node.id !== app.activeNoteId) {
                    allNotes.push(node);
                }
                
                if (node.type === 'folder' && node.children) {
                    collectNotes(node.children);
                }
            }
        }
        
        collectNotes(app.notes);
        
        // Filter by search term
        const filteredNotes = searchTerm 
            ? allNotes.filter(note => note.title.toLowerCase().includes(searchTerm))
            : allNotes;
        
        // Render results
        filteredNotes.forEach(note => {
            const resultItem = document.createElement('div');
            resultItem.className = 'link-result-item';
            
            const resultTitle = document.createElement('div');
            resultTitle.className = 'link-result-title';
            resultTitle.textContent = note.title;
            resultItem.appendChild(resultTitle);
            
            const resultPath = document.createElement('div');
            resultPath.className = 'link-result-path';
            resultPath.textContent = getNotePath(note.id);
            resultItem.appendChild(resultPath);
            
            resultItem.addEventListener('click', () => {
                insertNoteLink(note.id, note.title);
                modal.remove();
            });
            
            linkResults.appendChild(resultItem);
        });
        
        // Show message if no results
        if (filteredNotes.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'link-result-item';
            noResults.textContent = 'No notes found matching your search.';
            linkResults.appendChild(noResults);
        }
    }
    
    // Insert a link to another note
    function insertNoteLink(noteId, noteTitle) {
        // Create a wiki-style link [[note-id|Note Title]]
        const linkText = `[[${noteId}|${noteTitle}]]`;
        
        // Insert at cursor position or at the end
        const editor = elements.editor;
        const cursorPos = editor.selectionStart;
        const textBefore = editor.value.substring(0, cursorPos);
        const textAfter = editor.value.substring(cursorPos);
        
        editor.value = textBefore + linkText + textAfter;
        
        // Update the note content and save
        const note = findNoteById(app.activeNoteId);
        if (note) {
            note.content = editor.value;
            note.updated = Date.now();
            saveNotes();
            updatePreview();
        }
        
        showToast('Note link inserted', 'success');
    }
}

/**
 * Show command modal for saving commands
 */
function showCommandModal() {
    if (!app.activeNoteId) {
        showToast('Select a note first', 'warning');
        return;
    }
    
    // Get modal template and clone it
    const modalTemplate = document.getElementById('command-modal-template');
    if (!modalTemplate) return;
    
    const content = modalTemplate.cloneNode(true).content || modalTemplate.innerHTML;
    
    const modal = showModal('Save Command', content, [
        {
            text: 'Cancel',
            primary: false
        },
        {
            text: 'Save',
            primary: true,
            handler: saveCommand
        }
    ]);
    
    // Set up UI elements
    const commandInput = modal.querySelector('#command-input');
    const commandDescription = modal.querySelector('#command-description');
    const commandOutput = modal.querySelector('#command-output');
    const commandCategory = modal.querySelector('#command-category');
    
    // Focus command input when modal opens
    setTimeout(() => {
        commandInput.focus();
    }, 100);
    
    // Try to extract a selected command from the editor
    const editor = elements.editor;
    const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
    
    if (selectedText) {
        // Split the selected text into lines
        const lines = selectedText.split('\n');
        
        // First line is likely the command
        if (lines.length > 0) {
            commandInput.value = lines[0].trim();
            
            // Remaining lines are likely the output
            if (lines.length > 1) {
                commandOutput.value = lines.slice(1).join('\n').trim();
            }
        }
    }
    
    // Save the command
    function saveCommand() {
        const command = commandInput.value.trim();
        if (!command) {
            showToast('Please enter a command', 'warning');
            return;
        }
        
        // Create a new command
        const newCommand = {
            id: generateId('cmd'),
            command: command,
            description: commandDescription.value.trim(),
            output: commandOutput.value.trim(),
            category: commandCategory.value,
            created: Date.now()
        };
        
        // Add to commands
        app.commands.push(newCommand);
        saveCommands();
        
        // Insert into note if needed
        if (commandOutput.value.trim()) {
            // Format command for insertion
            const formattedCommand = `\n\n\`\`\`bash\n${command}\n\n${commandOutput.value.trim()}\n\`\`\`\n`;
            
            // Insert at cursor position or at the end
            const cursorPos = editor.selectionStart;
            const textBefore = editor.value.substring(0, cursorPos);
            const textAfter = editor.value.substring(cursorPos);
            
            editor.value = textBefore + formattedCommand + textAfter;
            
            // Update the note content and save
            const note = findNoteById(app.activeNoteId);
            if (note) {
                note.content = editor.value;
                note.updated = Date.now();
                saveNotes();
                updatePreview();
            }
        }
        
        showToast('Command saved', 'success');
    }
}

/**
 * Show command history modal
 */
function showCommandHistoryModal() {
    // Get modal template and clone it
    const modalTemplate = document.getElementById('command-history-modal-template');
    if (!modalTemplate) return;
    
    const content = modalTemplate.cloneNode(true).content || modalTemplate.innerHTML;
    
    const modal = showModal('Command History', content, [
        {
            text: 'Close',
            primary: false
        }
    ]);
    
    // Set up UI elements
    const commandSearch = modal.querySelector('#command-history-search');
    const commandContainer = modal.querySelector('#command-history-container');
    
    // Handle search input
    commandSearch.addEventListener('input', () => {
        const searchTerm = commandSearch.value.toLowerCase();
        renderCommandHistory(searchTerm);
    });
    
    // Focus search input when modal opens
    setTimeout(() => {
        commandSearch.focus();
    }, 100);
    
    // Initial render of all commands
    renderCommandHistory('');
    
    // Render command history
    function renderCommandHistory(searchTerm) {
        commandContainer.innerHTML = '';
        
        // Sort commands by created date (newest first)
        const sortedCommands = [...app.commands].sort((a, b) => b.created - a.created);
        
        // Filter by search term
        const filteredCommands = searchTerm 
            ? sortedCommands.filter(cmd => 
                cmd.command.toLowerCase().includes(searchTerm) || 
                (cmd.description && cmd.description.toLowerCase().includes(searchTerm)))
            : sortedCommands;
        
        // Render results
        filteredCommands.forEach(cmd => {
            const commandItem = document.createElement('div');
            commandItem.className = 'command-item';
            
            const commandText = document.createElement('div');
            commandText.className = 'command-text';
            commandText.textContent = cmd.command;
            commandItem.appendChild(commandText);
            
            if (cmd.description) {
                const commandDesc = document.createElement('div');
                commandDesc.className = 'command-desc';
                commandDesc.textContent = cmd.description;
                commandItem.appendChild(commandDesc);
            }
            
            const commandMeta = document.createElement('div');
            commandMeta.className = 'command-meta';
            
            const commandDate = document.createElement('div');
            commandDate.className = 'command-date';
            commandDate.textContent = new Date(cmd.created).toLocaleString();
            commandMeta.appendChild(commandDate);
            
            const commandCat = document.createElement('div');
            commandCat.className = 'command-category';
            commandCat.textContent = cmd.category || 'other';
            commandMeta.appendChild(commandCat);
            
            commandItem.appendChild(commandMeta);
            
            // Click handler to insert the command
            commandItem.addEventListener('click', () => {
                insertCommandToNote(cmd);
                modal.remove();
            });
            
            commandContainer.appendChild(commandItem);
        });
        
        // Show message if no results
        if (filteredCommands.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'command-item';
            noResults.textContent = 'No commands found matching your search.';
            commandContainer.appendChild(noResults);
        }
    }
    
    // Insert a command into the active note
    function insertCommandToNote(cmd) {
        if (!app.activeNoteId) {
            showToast('No note selected', 'warning');
            return;
        }
        
        // Format command for insertion
        let formattedCommand = `\n\n\`\`\`bash\n${cmd.command}\n`;
        
        if (cmd.output) {
            formattedCommand += `\n${cmd.output}\n`;
        }
        
        formattedCommand += `\`\`\`\n`;
        
        if (cmd.description) {
            formattedCommand += `*${cmd.description}*\n`;
        }
        
        // Insert at cursor position or at the end
        const editor = elements.editor;
        const cursorPos = editor.selectionStart;
        const textBefore = editor.value.substring(0, cursorPos);
        const textAfter = editor.value.substring(cursorPos);
        
        editor.value = textBefore + formattedCommand + textAfter;
        
        // Update the note content and save
        const note = findNoteById(app.activeNoteId);
        if (note) {
            note.content = editor.value;
            note.updated = Date.now();
            saveNotes();
            updatePreview();
        }
        
        showToast('Command inserted', 'success');
    }
}

/**
 * Show report generation modal
 */
function showReportGenerationModal() {
    // Get modal template and clone it
    const modalTemplate = document.getElementById('report-modal-template');
    if (!modalTemplate) return;
    
    const content = modalTemplate.cloneNode(true).content || modalTemplate.innerHTML;
    
    const modal = showModal('Generate Report', content, [
        {
            text: 'Cancel',
            primary: false
        },
        {
            text: 'Generate',
            primary: true,
            handler: generateReport
        }
    ]);
    
    // Set up UI elements
    const reportTitle = modal.querySelector('#report-title');
    const reportNotesContainer = modal.querySelector('#report-notes-container');
    const reportFormat = modal.querySelector('#report-format');
    
    // Load all notes for selection
    loadNotesForReport();
    
    // Focus title input when modal opens
    setTimeout(() => {
        reportTitle.focus();
    }, 100);
    
    // Load all notes for selection
    function loadNotesForReport() {
        reportNotesContainer.innerHTML = '';
        
        // Get all notes (not folders)
        const allNotes = [];
        
        function collectNotes(nodes, path = []) {
            for (const node of nodes) {
                const currentPath = [...path, node.title];
                
                if (node.type === 'note') {
                    allNotes.push({
                        id: node.id,
                        title: node.title,
                        path: currentPath.join(' > ')
                    });
                }
                
                if (node.type === 'folder' && node.children) {
                    collectNotes(node.children, currentPath);
                }
            }
        }
        
        collectNotes(app.notes);
        
        // Render notes as checkboxes
        allNotes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'report-note-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'report-note-checkbox';
            checkbox.dataset.noteId = note.id;
            noteItem.appendChild(checkbox);
            
            const noteInfo = document.createElement('div');
            noteInfo.className = 'report-note-info';
            
            const noteTitle = document.createElement('div');
            noteTitle.className = 'report-note-title';
            noteTitle.textContent = note.title;
            noteInfo.appendChild(noteTitle);
            
            const notePath = document.createElement('div');
            notePath.className = 'report-note-path';
            notePath.textContent = note.path;
            noteInfo.appendChild(notePath);
            
            noteItem.appendChild(noteInfo);
            
            reportNotesContainer.appendChild(noteItem);
        });
    }
    
    // Generate the report
    function generateReport() {
        const title = reportTitle.value.trim() || 'Security Report';
        const format = reportFormat.value;
        
        // Get selected notes
        const selectedNoteIds = [];
        reportNotesContainer.querySelectorAll('.report-note-checkbox:checked').forEach(checkbox => {
            selectedNoteIds.push(checkbox.dataset.noteId);
        });
        
        if (selectedNoteIds.length === 0) {
            showToast('Please select at least one note', 'warning');
            return;
        }
        
        // Generate report content
        let reportContent = '';
        
        // Add title
        if (format === 'markdown') {
            reportContent += `# ${title}\n\n`;
            reportContent += `*Generated on ${new Date().toLocaleString()}*\n\n`;
            reportContent += `---\n\n`;
        } else if (format === 'html') {
            reportContent += `<!DOCTYPE html>\n<html lang="en">\n<head>\n`;
            reportContent += `<meta charset="UTF-8">\n`;
            reportContent += `<meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
            reportContent += `<title>${title}</title>\n`;
            reportContent += `<style>\n`;
            reportContent += `body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 20px; }\n`;
            reportContent += `h1, h2, h3 { color: #333; }\n`;
            reportContent += `pre { background-color: #f5f5f5; padding: 10px; overflow: auto; }\n`;
            reportContent += `code { font-family: monospace; }\n`;
            reportContent += `img { max-width: 100%; height: auto; }\n`;
            reportContent += `table { border-collapse: collapse; width: 100%; }\n`;
            reportContent += `th, td { border: 1px solid #ddd; padding: 8px; }\n`;
            reportContent += `th { background-color: #f2f2f2; }\n`;
            reportContent += `</style>\n`;
            reportContent += `</head>\n<body>\n`;
            reportContent += `<h1>${title}</h1>\n`;
            reportContent += `<p><em>Generated on ${new Date().toLocaleString()}</em></p>\n`;
            reportContent += `<hr>\n\n`;
        }
        
        // Add each note
        for (const noteId of selectedNoteIds) {
            const note = findNoteById(noteId);
            if (note) {
                const path = getNotePath(noteId);
                
                if (format === 'markdown') {
                    reportContent += `## ${note.title}\n\n`;
                    reportContent += `*Path: ${path}*\n\n`;
                    
                    // Add tags if any
                    if (note.tags && note.tags.length > 0) {
                        reportContent += 'Tags: ';
                        const tagNames = note.tags.map(tagId => {
                            const tag = app.tags.find(t => t.id === tagId);
                            return tag ? tag.name : '';
                        }).filter(name => name);
                        
                        reportContent += tagNames.join(', ');
                        reportContent += '\n\n';
                    }
                    
                    // Add content
                    reportContent += note.content;
                    reportContent += '\n\n---\n\n';
                } else if (format === 'html') {
                    reportContent += `<h2>${note.title}</h2>\n`;
                    reportContent += `<p><em>Path: ${path}</em></p>\n`;
                    
                    // Add tags if any
                    if (note.tags && note.tags.length > 0) {
                        reportContent += '<p>Tags: ';
                        const tagNames = note.tags.map(tagId => {
                            const tag = app.tags.find(t => t.id === tagId);
                            return tag ? tag.name : '';
                        }).filter(name => name);
                        
                        reportContent += tagNames.join(', ');
                        reportContent += '</p>\n';
                    }
                    
                    // Add content (convert markdown to HTML)
                    reportContent += parseMarkdown(note.content);
                    reportContent += '<hr>\n\n';
                }
            }
        }
        
        // Close HTML if that's the format
        if (format === 'html') {
            reportContent += `</body>\n</html>`;
        }
        
        // Download the report
        const blob = new Blob([reportContent], { type: format === 'html' ? 'text/html' : 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format === 'html' ? 'html' : 'md'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showToast('Report generated', 'success');
    }
}
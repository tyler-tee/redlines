/**
 * Red Lines Application - Templates JS File
 * Template and code snippet functionality
 */

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
        { id: 'web-vuln', name: 'Web Vulnerability Template' },
        { id: 'osint', name: 'OSINT Template' },
        { id: 'exploit', name: 'Exploit Template' },
        { id: 'privesc', name: 'Privilege Escalation Template' }
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
        case 'osint':
            templateContent = `# OSINT Findings: [Target]\n\n## Sources\n\n- \n\n## Contact Information\n\n- Email:\n- Phone:\n- Social Media:\n\n## Domain Information\n\n- Registrar:\n- Creation Date:\n- Expiry Date:\n- Name Servers:\n\n## IP Ranges\n\n-\n\n## Findings\n\n-\n\n## Potential Attack Vectors\n\n-\n`;
            break;
        case 'exploit':
            templateContent = `# Exploit: [Target/Vulnerability]\n\n## Vulnerability Details\n\n- CVE:\n- Software:\n- Version:\n\n## Exploitation\n\n### Prerequisites\n\n-\n\n### Environment Setup\n\n\`\`\`bash\n\n\`\`\`\n\n### Exploit Code\n\n\`\`\`\n\n\`\`\`\n\n### Execution\n\n1.\n2.\n3.\n\n## Post-Exploitation\n\n-\n\n## Indicators of Compromise\n\n-\n`;
            break;
        case 'privesc':
            templateContent = `# Privilege Escalation: [System]\n\n## Initial Access\n\n- User:\n- Permissions:\n\n## System Information\n\n\`\`\`\n# OS details, kernel version, etc.\n\`\`\`\n\n## Privilege Escalation Vectors\n\n### Attempted Methods\n\n1. \n\n### Successful Method\n\n\`\`\`bash\n# Commands used\n\`\`\`\n\n## Verification\n\n\`\`\`\n# Output showing elevated privileges\n\`\`\`\n\n## Persistence\n\n-\n\n## Remediation\n\n-\n`;
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
        { id: 'powershell', name: 'PowerShell' },
        { id: 'sql', name: 'SQL' },
        { id: 'http', name: 'HTTP' },
        { id: 'json', name: 'JSON' },
        { id: 'xml', name: 'XML' },
        { id: 'php', name: 'PHP' },
        { id: 'csharp', name: 'C#' },
        { id: 'ruby', name: 'Ruby' }
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
            case 'powershell':
                snippet = '```powershell\n# PowerShell code\n\n```';
                break;
            case 'sql':
                snippet = '```sql\n-- SQL query\n\n```';
                break;
            case 'http':
                snippet = '```http\nGET /path HTTP/1.1\nHost: example.com\n\n```';
                break;
            case 'php':
                snippet = '```php\n<?php\n// PHP code\n\n?>\n```';
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
            <div class="shortcut-item">
                <div class="shortcut-keys">
                    <span class="key">Ctrl</span><span class="key">Shift</span><span class="key">S</span>
                </div>
                <div class="shortcut-text">Add screenshot</div>
            </div>
            <div class="shortcut-item">
                <div class="shortcut-keys">
                    <span class="key">Ctrl</span><span class="key">L</span>
                </div>
                <div class="shortcut-text">Link notes</div>
            </div>
            <div class="shortcut-item">
                <div class="shortcut-keys">
                    <span class="key">Ctrl</span><span class="key">Shift</span><span class="key">T</span>
                </div>
                <div class="shortcut-text">Add tags</div>
            </div>
            <div class="shortcut-item">
                <div class="shortcut-keys">
                    <span class="key">Ctrl</span><span class="key">Shift</span><span class="key">C</span>
                </div>
                <div class="shortcut-text">Save command</div>
            </div>
        </div>
    `;
    content.appendChild(shortcuts);
    
    // Key features
    const features = document.createElement('div');
    features.className = 'help-section';
    features.innerHTML = `
        <h3 class="help-section-title">Key Features</h3>
        <ul>
            <li><strong>Tags</strong> - Categorize notes with color-coded tags</li>
            <li><strong>Screenshots</strong> - Easily add and manage screenshots</li>
            <li><strong>Command History</strong> - Save and reuse important commands</li>
            <li><strong>Note Linking</strong> - Create connections between related findings</li>
            <li><strong>Report Generation</strong> - Compile selected notes into reports</li>
            <li><strong>Security Tools</strong> - Built-in utilities for encoding, hashing, and more</li>
        </ul>
    `;
    content.appendChild(features);
    
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
            <li><code>[[note-id|Note Title]]</code> - Link to another note</li>
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
            <li><strong>Filter by tags</strong> to quickly find relevant notes</li>
            <li><strong>Link related notes</strong> to create connections between findings</li>
            <li>Use <strong>templates</strong> for common security documentation</li>
            <li>Save and organize <strong>commands</strong> for reuse across projects</li>
            <li>Use <strong>export/import</strong> to backup or share your notes</li>
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
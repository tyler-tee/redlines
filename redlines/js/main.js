/**
 * Red Lines Application - Main JS File
 * Core functionality and initialization
 */

document.addEventListener('DOMContentLoaded', () => {
    // Global application state
    window.app = {
        notes: [],
        activeNoteId: null,
        activeTab: 'editor',
        isDragging: false,
        isSearching: false,
        searchTerm: '',
        contextMenu: null,
        lastSave: Date.now(),
        autosaveInterval: 2000, // milliseconds
        initialized: false,
        tags: [], // Global tags cache
        commands: [], // Command history
        currentFilters: {
            tags: [],
            dateStart: null,
            dateEnd: null
        }
    };
    
    // DOM elements - make globally accessible
    window.elements = {
        body: document.body,
        sidebar: document.getElementById('sidebar'),
        treeContainer: document.getElementById('tree-container'),
        editor: document.getElementById('editor'),
        preview: document.getElementById('preview'),
        noteTitle: document.getElementById('note-title'),
        noteTagsList: document.querySelector('.note-tags-list'),
        addFolderBtn: document.getElementById('add-folder-btn'),
        addNoteBtn: document.getElementById('add-note-btn'),
        deleteBtn: document.getElementById('delete-btn'),
        exportBtn: document.getElementById('export-btn'),
        importBtn: document.getElementById('import-btn'),
        addTagBtn: document.getElementById('add-tag-btn'),
        themeToggle: document.getElementById('theme-toggle'),
        sidebarToggle: document.getElementById('sidebar-toggle'),
        searchInput: document.getElementById('search-input'),
        filterByTagsBtn: document.getElementById('filter-by-tags'),
        filterByDateBtn: document.getElementById('filter-by-date'),
        showHelp: document.getElementById('show-help'),
        tabs: document.querySelectorAll('.tab'),
        welcomeScreen: document.getElementById('welcome-screen'),
        newProjectBtn: document.getElementById('new-project-btn'),
        startDemoBtn: document.getElementById('start-demo-btn'),
        toastContainer: document.getElementById('toast-container'),
        templateBtn: document.getElementById('template-btn'),
        codeSnippetBtn: document.getElementById('code-snippet-btn'),
        screenshotBtn: document.getElementById('screenshot-btn'),
        screenshotFileInput: document.getElementById('screenshot-file'),
        linkNoteBtn: document.getElementById('link-note-btn'),
        commandBtn: document.getElementById('command-btn'),
        commandHistoryBtn: document.getElementById('command-history-btn'),
        generateReportBtn: document.getElementById('generate-report-btn'),
        toolsBtn: document.getElementById('tools-btn')
    };
    
    // Initialize application
    initialize();
    
    /**
     * Initialize the application
     */
    function initialize() {
        loadNotes();
        loadTags();
        loadCommands();
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
        
        // Set up sidebar toggle for mobile
        setupSidebarToggle();
        
        // Set up autosave
        setInterval(autoSave, app.autosaveInterval);
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
     * Load tags from localStorage
     */
    function loadTags() {
        const savedTags = localStorage.getItem('redlines-tags');
        if (savedTags) {
            try {
                app.tags = JSON.parse(savedTags);
            } catch (error) {
                console.error('Error parsing saved tags:', error);
                app.tags = [];
            }
        }
    }
    
    /**
     * Load commands from localStorage
     */
    function loadCommands() {
        const savedCommands = localStorage.getItem('redlines-commands');
        if (savedCommands) {
            try {
                app.commands = JSON.parse(savedCommands);
            } catch (error) {
                console.error('Error parsing saved commands:', error);
                app.commands = [];
            }
        }
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
        
        // Generate report button
        if (elements.generateReportBtn) {
            elements.generateReportBtn.addEventListener('click', () => {
                showReportGenerationModal();
            });
        }
        
        // Command history button
        if (elements.commandHistoryBtn) {
            elements.commandHistoryBtn.addEventListener('click', () => {
                showCommandHistoryModal();
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
        
        // Filter buttons
        if (elements.filterByTagsBtn) {
            elements.filterByTagsBtn.addEventListener('click', () => {
                showTagFilterModal();
            });
        }
        
        if (elements.filterByDateBtn) {
            elements.filterByDateBtn.addEventListener('click', () => {
                showDateFilterModal();
            });
        }
        
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
        
        // Screenshot button
        if (elements.screenshotBtn) {
            elements.screenshotBtn.addEventListener('click', () => {
                showScreenshotModal();
            });
        }
        
        // Link note button
        if (elements.linkNoteBtn) {
            elements.linkNoteBtn.addEventListener('click', () => {
                showLinkNoteModal();
            });
        }
        
        // Command button
        if (elements.commandBtn) {
            elements.commandBtn.addEventListener('click', () => {
                showCommandModal();
            });
        }
        
        // Add tag button
        if (elements.addTagBtn) {
            elements.addTagBtn.addEventListener('click', () => {
                if (app.activeNoteId) {
                    showTagModal();
                } else {
                    showToast('Select a note first', 'warning');
                }
            });
        }
        
        // Tools button
        if (elements.toolsBtn) {
            elements.toolsBtn.addEventListener('click', (e) => {
                showToolsDropdown(e);
            });
        }
        
        // Screenshot file input
        if (elements.screenshotFileInput) {
            elements.screenshotFileInput.addEventListener('change', handleScreenshotFileSelect);
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
        
        // Make the preview clickable for note links
        elements.preview.addEventListener('click', (e) => {
            if (e.target.classList.contains('note-link')) {
                const noteId = e.target.getAttribute('data-note-id');
                if (noteId) {
                    setActiveItem(noteId);
                }
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
                saveTags();
                saveCommands();
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
            
            // Ctrl+Shift+S: Insert screenshot
            if (e.ctrlKey && e.shiftKey && e.key === 'S' && app.activeNoteId) {
                e.preventDefault();
                if (elements.screenshotBtn) {
                    elements.screenshotBtn.click();
                }
            }
            
            // Ctrl+L: Link note
            if (e.ctrlKey && e.key === 'l' && app.activeNoteId) {
                e.preventDefault();
                if (elements.linkNoteBtn) {
                    elements.linkNoteBtn.click();
                }
            }
            
            // Ctrl+Shift+C: Save command
            if (e.ctrlKey && e.shiftKey && e.key === 'C' && app.activeNoteId) {
                e.preventDefault();
                if (elements.commandBtn) {
                    elements.commandBtn.click();
                }
            }
            
            // Ctrl+Shift+T: Add tag
            if (e.ctrlKey && e.shiftKey && e.key === 'T' && app.activeNoteId) {
                e.preventDefault();
                if (elements.addTagBtn) {
                    elements.addTagBtn.click();
                }
            }
        });
    }
    
    /**
     * Auto-save notes if changes were made
     */
    function autoSave() {
        if (app.initialized && app.activeNoteId) {
            saveNotes();
            saveTags();
            saveCommands();
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
     * Setup sidebar toggle functionality for mobile devices
     */
    function setupSidebarToggle() {
        // Create overlay element if it doesn't exist
        if (!document.querySelector('.sidebar-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }
        
        const overlay = document.querySelector('.sidebar-overlay');
        
        // Improve sidebar toggle button functionality
        if (elements.sidebarToggle) {
            // Remove any existing event listeners (to prevent duplicates)
            const newSidebarToggle = elements.sidebarToggle.cloneNode(true);
            elements.sidebarToggle.parentNode.replaceChild(newSidebarToggle, elements.sidebarToggle);
            elements.sidebarToggle = newSidebarToggle;
            
            // Add click event listener to toggle button
            elements.sidebarToggle.addEventListener('click', (e) => {
                e.preventDefault();
                const isVisible = elements.sidebar.classList.contains('show');
                
                // Toggle sidebar visibility
                elements.sidebar.classList.toggle('show');
                overlay.classList.toggle('show');
                
                // Update ARIA attributes for accessibility
                elements.sidebarToggle.setAttribute('aria-expanded', !isVisible);
                
                // Focus trap for accessibility
                if (!isVisible) {
                    // Focus first focusable element in sidebar when opening
                    setTimeout(() => {
                        const focusable = elements.sidebar.querySelector('button, [tabindex], input');
                        if (focusable) focusable.focus();
                    }, 100);
                }
            });
            
            // Close sidebar when clicking overlay
            overlay.addEventListener('click', () => {
                elements.sidebar.classList.remove('show');
                overlay.classList.remove('show');
                elements.sidebarToggle.setAttribute('aria-expanded', 'false');
            });
            
            // Close sidebar when escape key is pressed
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && elements.sidebar.classList.contains('show')) {
                    elements.sidebar.classList.remove('show');
                    overlay.classList.remove('show');
                    elements.sidebarToggle.setAttribute('aria-expanded', 'false');
                    elements.sidebarToggle.focus(); // Return focus to toggle button
                }
            });
            
            // Close sidebar when resizing to desktop view
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768 && elements.sidebar.classList.contains('show')) {
                    elements.sidebar.classList.remove('show');
                    overlay.classList.remove('show');
                    elements.sidebarToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }
});
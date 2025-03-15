/**
 * Red Lines Application - Tools JS File
 * Security tool functionality
 */

/**
 * Show tools dropdown menu
 */
function showToolsDropdown(event) {
    const dropdown = document.createElement('div');
    dropdown.className = 'tools-dropdown';
    
    // Define available tools
    const tools = [
        { id: 'encoder', name: 'Encoder/Decoder', icon: '🔄', action: showEncoderTool },
        { id: 'hash', name: 'Hash Generator', icon: '#️⃣', action: showHashTool },
        { id: 'ip', name: 'IP Converter', icon: '🌐', action: showIpTool }
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
    
    // Focus input when modal opens
    setTimeout(() => {
        encoderInput.focus();
    }, 100);
    
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
 * Show hash generator tool
 */
function showHashTool() {
    const content = document.createElement('div');
    content.className = 'tool-container';
    
    // Input area
    const inputGroup = document.createElement('div');
    inputGroup.className = 'form-group';
    inputGroup.innerHTML = `
        <label class="form-label">Input Text</label>
        <textarea id="hash-input" class="form-control" rows="3" placeholder="Enter text to hash..."></textarea>
    `;
    content.appendChild(inputGroup);
    
    // Hash algorithm selector
    const hashTypeGroup = document.createElement('div');
    hashTypeGroup.className = 'form-group';
    hashTypeGroup.innerHTML = `
        <label class="form-label">Hash Algorithm</label>
        <select id="hash-type" class="form-control">
            <option value="md5">MD5</option>
            <option value="sha1">SHA-1</option>
            <option value="sha256" selected>SHA-256</option>
            <option value="sha512">SHA-512</option>
        </select>
    `;
    content.appendChild(hashTypeGroup);
    
    // Generate button
    const actionGroup = document.createElement('div');
    actionGroup.className = 'form-group';
    actionGroup.innerHTML = `
        <button id="generate-hash-btn" class="btn btn-primary">Generate Hash</button>
    `;
    content.appendChild(actionGroup);
    
    // Output area
    const outputGroup = document.createElement('div');
    outputGroup.className = 'form-group';
    outputGroup.innerHTML = `
        <label class="form-label">Result</label>
        <div class="output-container">
            <textarea id="hash-output" class="form-control" rows="3" readonly></textarea>
            <button id="copy-hash" class="btn-icon" title="Copy to clipboard">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
        </div>
    `;
    content.appendChild(outputGroup);
    
    // Show the modal
    const modal = showModal('Hash Generator', content, [
        {
            text: 'Close',
            primary: false
        }
    ]);
    
    // Setup event listeners
    const hashInput = modal.querySelector('#hash-input');
    const hashType = modal.querySelector('#hash-type');
    const hashOutput = modal.querySelector('#hash-output');
    const generateBtn = modal.querySelector('#generate-hash-btn');
    const copyBtn = modal.querySelector('#copy-hash');
    
    // Focus input when modal opens
    setTimeout(() => {
        hashInput.focus();
    }, 100);
    
    // Generate hash function
    generateBtn.addEventListener('click', async () => {
        const input = hashInput.value;
        if (!input) return;
        
        const algorithm = hashType.value;
        
        try {
            // Use SubtleCrypto API for hashing
            const encoder = new TextEncoder();
            const data = encoder.encode(input);
            
            let hashBuffer;
            switch (algorithm) {
                case 'md5':
                    // MD5 not available in SubtleCrypto, show a message
                    hashOutput.value = 'MD5 is not supported in this browser.';
                    return;
                case 'sha1':
                    hashBuffer = await crypto.subtle.digest('SHA-1', data);
                    break;
                case 'sha256':
                    hashBuffer = await crypto.subtle.digest('SHA-256', data);
                    break;
                case 'sha512':
                    hashBuffer = await crypto.subtle.digest('SHA-512', data);
                    break;
            }
            
            // Convert ArrayBuffer to hex string
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            hashOutput.value = hashHex;
        } catch (error) {
            console.error('Hashing error:', error);
            hashOutput.value = 'Error generating hash';
        }
    });
    
    // Copy result to clipboard
    copyBtn.addEventListener('click', () => {
        hashOutput.select();
        document.execCommand('copy');
        showToast('Hash copied to clipboard', 'success');
    });
}

/**
 * Show IP converter tool
 */
function showIpTool() {
    const content = document.createElement('div');
    content.className = 'tool-container';
    
    // IP input area
    const inputGroup = document.createElement('div');
    inputGroup.className = 'form-group';
    inputGroup.innerHTML = `
        <label class="form-label">IP Address or CIDR</label>
        <input type="text" id="ip-input" class="form-control" placeholder="e.g., 192.168.1.1 or 10.0.0.0/24">
    `;
    content.appendChild(inputGroup);
    
    // Action buttons
    const actionGroup = document.createElement('div');
    actionGroup.className = 'form-group';
    actionGroup.innerHTML = `
        <button id="convert-ip-btn" class="btn btn-primary">Convert</button>
    `;
    content.appendChild(actionGroup);
    
    // Output area
    const outputGroup = document.createElement('div');
    outputGroup.className = 'form-group';
    outputGroup.innerHTML = `
        <label class="form-label">Results</label>
        <div id="ip-results" class="ip-results">
            <div class="result-row">
                <span class="result-label">IP Address:</span>
                <span id="ip-address-result" class="result-value"></span>
            </div>
            <div class="result-row">
                <span class="result-label">Binary:</span>
                <span id="ip-binary-result" class="result-value"></span>
            </div>
            <div class="result-row">
                <span class="result-label">Decimal:</span>
                <span id="ip-decimal-result" class="result-value"></span>
            </div>
            <div class="result-row">
                <span class="result-label">Hex:</span>
                <span id="ip-hex-result" class="result-value"></span>
            </div>
            <div class="result-row cidr-row" style="display: none;">
                <span class="result-label">CIDR Range:</span>
                <span id="ip-cidr-result" class="result-value"></span>
            </div>
            <div class="result-row cidr-row" style="display: none;">
                <span class="result-label">Subnet Mask:</span>
                <span id="ip-subnet-result" class="result-value"></span>
            </div>
            <div class="result-row cidr-row" style="display: none;">
                <span class="result-label">Total IPs:</span>
                <span id="ip-total-result" class="result-value"></span>
            </div>
        </div>
    `;
    content.appendChild(outputGroup);
    
    // Show the modal
    const modal = showModal('IP Converter', content, [
        {
            text: 'Close',
            primary: false
        }
    ]);
    
    // Setup event listeners
    const ipInput = modal.querySelector('#ip-input');
    const convertBtn = modal.querySelector('#convert-ip-btn');
    const ipAddressResult = modal.querySelector('#ip-address-result');
    const ipBinaryResult = modal.querySelector('#ip-binary-result');
    const ipDecimalResult = modal.querySelector('#ip-decimal-result');
    const ipHexResult = modal.querySelector('#ip-hex-result');
    const ipCidrResult = modal.querySelector('#ip-cidr-result');
    const ipSubnetResult = modal.querySelector('#ip-subnet-result');
    const ipTotalResult = modal.querySelector('#ip-total-result');
    const cidrRows = modal.querySelectorAll('.cidr-row');
    
    // Focus input when modal opens
    setTimeout(() => {
        ipInput.focus();
    }, 100);
    
    // Handle Enter key
    ipInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            convertBtn.click();
        }
    });
    
    // Convert IP function
    convertBtn.addEventListener('click', () => {
        const input = ipInput.value.trim();
        if (!input) return;
        
        // Check if input is CIDR notation
        const isCidr = input.includes('/');
        
        let ip, cidrPrefix;
        if (isCidr) {
            [ip, cidrPrefix] = input.split('/');
            cidrPrefix = parseInt(cidrPrefix);
            
            // Validate CIDR prefix
            if (isNaN(cidrPrefix) || cidrPrefix < 0 || cidrPrefix > 32) {
                showToast('Invalid CIDR prefix', 'error');
                return;
            }
        } else {
            ip = input;
        }
        
        // Validate IP address format
        const ipParts = ip.split('.');
        if (ipParts.length !== 4) {
            showToast('Invalid IP address format', 'error');
            return;
        }
        
        for (const part of ipParts) {
            const num = parseInt(part);
            if (isNaN(num) || num < 0 || num > 255) {
                showToast('Invalid IP address', 'error');
                return;
            }
        }
        
        // Convert to different formats
        const binary = ipParts.map(part => parseInt(part).toString(2).padStart(8, '0')).join('.');
        const decimal = (
            parseInt(ipParts[0]) * 16777216 +
            parseInt(ipParts[1]) * 65536 +
            parseInt(ipParts[2]) * 256 +
            parseInt(ipParts[3])
        );
        const hex = ipParts.map(part => parseInt(part).toString(16).padStart(2, '0')).join(':');
        
        // Display results
        ipAddressResult.textContent = ip;
        ipBinaryResult.textContent = binary;
        ipDecimalResult.textContent = decimal;
        ipHexResult.textContent = `0x${hex.replace(/:/g, '')}`;
        
        // Display CIDR info if provided
        if (isCidr) {
            // Calculate subnet mask
            const subnetMask = [];
            let bitsLeft = cidrPrefix;
            
            for (let i = 0; i < 4; i++) {
                if (bitsLeft >= 8) {
                    subnetMask.push(255);
                    bitsLeft -= 8;
                } else if (bitsLeft > 0) {
                    const mask = 256 - Math.pow(2, 8 - bitsLeft);
                    subnetMask.push(mask);
                    bitsLeft = 0;
                } else {
                    subnetMask.push(0);
                }
            }
            
            // Calculate total IPs in the network
            const totalIps = Math.pow(2, 32 - cidrPrefix);
            
            // Calculate network and broadcast addresses
            const networkIp = ipParts.map((part, i) => parseInt(part) & subnetMask[i]).join('.');
            const broadcastIp = ipParts.map((part, i) => parseInt(part) | (255 - subnetMask[i])).join('.');
            
            ipCidrResult.textContent = `${networkIp} - ${broadcastIp}`;
            ipSubnetResult.textContent = subnetMask.join('.');
            ipTotalResult.textContent = totalIps.toLocaleString();
            
            // Show CIDR-specific rows
            cidrRows.forEach(row => {
                row.style.display = 'flex';
            });
        } else {
            // Hide CIDR-specific rows
            cidrRows.forEach(row => {
                row.style.display = 'none';
            });
        }
    });
}
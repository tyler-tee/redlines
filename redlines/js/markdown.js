/**
 * Red Lines Application - Markdown JS File
 * Markdown parsing functionality
 */

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
    
    // Skip processing inside code blocks
    const codeBlockRegex = /```[\s\S]*?```/g;
    const codeBlocks = [];
    let codeIdx = 0;
    
    // Replace code blocks with placeholders
    let processedMarkdown = markdown.replace(codeBlockRegex, match => {
        const placeholder = `##CODE_BLOCK_${codeIdx}##`;
        codeBlocks.push(match);
        codeIdx++;
        return placeholder;
    });
    
    // Process fenced code blocks with language support
    processedMarkdown = processedMarkdown.replace(/##CODE_BLOCK_(\d+)##/g, (match, index) => {
        const block = codeBlocks[parseInt(index)];
        const langMatch = block.match(/```(\w*)\n([\s\S]*?)```/);
        
        if (langMatch) {
            const language = langMatch[1];
            const code = langMatch[2];
            const langClass = language ? ` language-${language}` : '';
            return `<pre class="line-numbers"><code class="code-block${langClass}">${escapeHtml(code)}</code></pre>`;
        }
        
        return block;
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
    
    // Links and images (standard Markdown ones, not our custom note links)
    processedMarkdown = processedMarkdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    processedMarkdown = processedMarkdown.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<div class="preview-image-container"><img src="$2" alt="$1" class="preview-image"><div class="preview-image-caption">$1</div></div>');
    
    // Blockquotes
    processedMarkdown = processedMarkdown.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
    
    // Lists
    processedMarkdown = processedMarkdown.replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>');
    processedMarkdown = processedMarkdown.replace(/^\s*[\-\*]\s+(.*$)/gm, '<li>$1</li>');
    
    // Group list items
    processedMarkdown = processedMarkdown.replace(/(<li>.*<\/li>)(\s*<li>.*<\/li>)+/g, '<ul>$&</ul>');
    
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
        if (!p || (p.startsWith('<') && p.endsWith('>'))) {
            return p;
        }
        // Wrap in paragraph tags
        return `<p>${p}</p>`;
    }).join('\n\n');
    
    // Fix any incorrectly nested tags 
    // For example, if we ended up with <p><h1>Title</h1></p>, strip the outer <p> tags
    processedMarkdown = processedMarkdown.replace(/<p>(<h[1-6].*?<\/h[1-6]>)<\/p>/g, '$1');
    processedMarkdown = processedMarkdown.replace(/<p>(<pre.*?<\/pre>)<\/p>/g, '$1');
    processedMarkdown = processedMarkdown.replace(/<p>(<table.*?<\/table>)<\/p>/g, '$1');
    processedMarkdown = processedMarkdown.replace(/<p>(<ul.*?<\/ul>)<\/p>/g, '$1');
    processedMarkdown = processedMarkdown.replace(/<p>(<blockquote.*?<\/blockquote>)<\/p>/g, '$1');
    processedMarkdown = processedMarkdown.replace(/<p>(<hr>)<\/p>/g, '$1');
    
    return processedMarkdown;
}
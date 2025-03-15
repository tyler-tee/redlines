/**
 * Red Lines Application - Utils JS File
 * Utility functions
 */

/**
 * Generate a unique ID with prefix
 * @param {string} prefix - The prefix to use (e.g., 'folder', 'note', 'tag')
 * @returns {string} A unique ID string
 */
function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
# Red Lines - Security Notes

Red Lines is a professional note-taking application designed specifically for offensive security practitioners. It provides a structured approach to organizing findings during security assessments, penetration tests, and security research.

![image](https://github.com/user-attachments/assets/b74d34b0-e4cf-4283-a695-10c45f01f41b)


## Features

- **Hierarchical Organization**: Nested folder structure to organize your security notes logically
- **Markdown Support**: Full Markdown formatting with syntax highlighting for code snippets
- **Security-Focused Templates**: Pre-built templates for common security documentation needs 
- **Code Snippet Support**: Syntax highlighting for security-relevant languages (Python, Bash, SQL, etc.)
- **Encoder/Decoder Tool**: Built-in tool for Base64, URL, HTML, and Hex encoding/decoding
- **Dark Mode**: Easy on the eyes during those late-night security assessments
- **Offline First**: All notes are stored locally - no data leaves your device
- **Import/Export**: Easily back up and restore your notes as JSON

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/redlines.git
   ```

2. Navigate to the project directory:
   ```
   cd redlines
   ```

3. Open `index.html` in your web browser, or serve it using a local development server:
   ```
   # Using Python
   python -m http.server
   
   # Using Node.js
   npx serve
   ```

## Project Structure

- `index.html` - Main application HTML
- `styles.css` - Application styling
- `script.js` - Application logic and functionality

## Usage Guide

### Creating Notes and Folders

- Use the "Add Folder" and "Add Note" buttons in the sidebar
- Organize notes with drag-and-drop functionality
- Right-click items for additional options (rename, delete, etc.)

### Writing Notes

- Notes support full Markdown syntax
- Toggle between edit and preview modes using the tabs or Ctrl+E
- Use the template button to insert common security documentation templates
- Use the code button to insert code snippets with syntax highlighting

### Templates

Red Lines includes several built-in templates for security documentation:

- **Nmap Scan**: Document network reconnaissance results
- **Vulnerability**: Document identified security vulnerabilities
- **Credentials**: Securely document discovered credentials
- **Web Vulnerability**: Document web application security issues

### Keyboard Shortcuts

- `Ctrl+E`: Toggle between edit and preview modes
- `Ctrl+S`: Save notes
- `Ctrl+F`: Search notes
- `Ctrl+N`: Create a new note
- `F1`: Show help
- `Del`: Delete the current item
- `Ctrl+Space`: Insert code snippet

## Security Considerations

- Red Lines is a local web application with no server component
- All data is stored in your browser's localStorage
- No data is transmitted over the network
- For sensitive data, consider using an encrypted filesystem or disk encryption

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with modern web technologies: HTML, CSS, and JavaScript
- Uses [Prism.js](https://prismjs.com/) for syntax highlighting
- Icons from [Feather Icons](https://feathericons.com/)

---

**Note**: Red Lines is designed for legitimate security research and penetration testing activities. Always ensure you have proper authorization before performing security assessments.

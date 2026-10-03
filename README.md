<p align="center">
  <img src="public/logo.png" alt="Markdown Studio Logo" width="120" height="120" style="border-radius: 24px;" />
</p>

<h1 align="center">Markdown Studio</h1>

<p align="center">
  <strong>A sleek, high-performance browser-based Markdown editor with real-time live preview, IndexedDB storage, and export tools.</strong>
</p>

<p align="center">
  <a href="https://markdown-editor-ten-eta.vercel.app"><img src="https://img.shields.io/badge/Vercel-Live_Demo-black.svg?logo=vercel&logoColor=white" alt="Vercel Deployment" /></a>
  <a href="https://markdown-editor-ten-eta.vercel.app"><img src="https://img.shields.io/badge/demo-online-brightgreen.svg" alt="Live Demo" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=white" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-6.0-3178c6.svg?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-8.0-646cff.svg?logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8.svg?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
</p>

<p align="center">
  👉 <strong><a href="https://markdown-editor-ten-eta.vercel.app">Launch Live Demo on Vercel</a></strong> <em>(or <a href="https://codexanjan.github.io/markdown-editor/">GitHub Pages</a>)</em>
</p>

---

## ✨ Features

### 🖋️ Modern Editor Experience
- **CodeMirror 6 Engine**: Smooth, extensible text editing with line numbers, code folding, auto-closing brackets, and fast search & replace.
- **GitHub Flavored Markdown (GFM)**: Tables, task lists, strikethrough, autolinks, footnotes, and math syntax.
- **Syntax Highlighting**: Pre-configured code block highlighting powered by `highlight.js` with dark theme styling.
- **Flexible View Modes**: Seamlessly toggle between **Split View**, **Editor Only**, and **Live Preview Only**.
- **Synchronized Scrolling**: Dual-pane scroll synchronization keeps editor and preview aligned while scrolling.

### 💾 Document & Storage Management
- **IndexedDB Persistence**: All documents, versions, and configurations are stored securely and privately in your browser's IndexedDB. Zero data sent to third-party servers.
- **Multi-Document Sidebar**: Create, rename, duplicate, search, and delete documents with instant auto-save status.
- **Version History & Snapshots**: Automated snapshot tracking allows you to inspect past revisions and restore previous states at any time.

### 📑 Templates Library
- **Pre-built Templates**: One-click insertion of professional templates:
  - GitHub Project README
  - Technical Documentation & API Reference
  - Meeting Notes & Action Items
  - Release Changelog (Keep a Changelog standard)
  - Blog Post with frontmatter

### 📤 Flexible Export & Sharing
- **Download `.md`**: Clean, raw Markdown files.
- **Download `.txt`**: Stripped plain-text format.
- **Export Styled `.html`**: Standalone HTML documents complete with styles for instant sharing or publishing.
- **Print / Save as PDF**: Direct browser print stylesheet optimized for clean document rendering without editor chrome.
- **One-Click Clipboard**: Copy raw Markdown or rendered HTML with a single click.

### ⚙️ Deep Customization
- **Typography Controls**: Choose between `JetBrains Mono`, `Fira Code`, system monospace, and custom sizes.
- **Layout & Appearance**: Adjust font sizes, line heights, tab widths (2 or 4 spaces), word wrapping, and themes (Dark / Light / System).
- **Distraction-Free Fullscreen**: Enter fullscreen mode (`F11`) to focus purely on your content.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> | Save Current Document |
| <kbd>Ctrl</kbd> + <kbd>F</kbd> | Open Find & Replace Dialog |
| <kbd>Ctrl</kbd> + <kbd>\</kbd> | Toggle Document Sidebar |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> | Print / Export as PDF |
| <kbd>F11</kbd> | Toggle Fullscreen Mode |
| <kbd>?</kbd> | Open Keyboard Shortcuts Cheat Sheet |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm`, `pnpm`, or `yarn`

### 1. Clone the repository
```bash
git clone https://github.com/codexanjan/markdown-editor.git
cd markdown-editor
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start local development server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173/` (or the URL shown in your terminal).

### 4. Run tests
```bash
npm run test
```

### 5. Build for production
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

---

## 🌐 GitHub Pages Deployment

This repository includes a continuous deployment workflow powered by **GitHub Actions** located at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Enabling GitHub Pages on your repository:
1. Navigate to your repository on GitHub: [https://github.com/codexanjan/markdown-editor](https://github.com/codexanjan/markdown-editor)
2. Go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Every push to the `main` branch will automatically trigger the workflow, build the app, and publish it to:
   **`https://codexanjan.github.io/markdown-editor/`**

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Editor**: [CodeMirror 6](https://codemirror.net/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Markdown Processing**: [react-markdown](https://github.com/remarkjs/react-markdown), [remark-gfm](https://github.com/remarkjs/remark-gfm), [rehype-highlight](https://github.com/rehypejs/rehype-highlight), [rehype-slug](https://github.com/rehypejs/rehype-slug)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database**: [idb](https://github.com/jakearchibald/idb) (IndexedDB wrapper)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) & [Testing Library](https://testing-library.com/)

---

## 📁 Project Structure

```
markdown-editor/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment to Pages
├── public/                     # Static assets
├── src/
│   ├── assets/                 # Graphics and assets
│   ├── components/
│   │   ├── dialogs/            # Find & Replace and helper dialogs
│   │   ├── editor/             # CodeMirror editor wrapper & toolbar
│   │   ├── layout/             # TopBar, StatusBar, ResizableSplitPane
│   │   ├── modals/             # Settings, Templates, History, Shortcuts
│   │   ├── preview/            # Markdown preview renderer
│   │   └── sidebar/            # Document list and folder management
│   ├── services/
│   │   ├── db.ts               # IndexedDB database management
│   │   ├── fileExport.ts       # HTML, PDF, Markdown, TXT export handlers
│   │   └── templates.ts        # Built-in document templates
│   ├── store/
│   │   └── useAppStore.ts      # Zustand application store
│   ├── tests/                  # Vitest unit and integration test suites
│   ├── types/                  # TypeScript interfaces and data models
│   ├── App.tsx                 # Root application component
│   ├── index.css               # Global styles & Tailwind imports
│   └── main.tsx                # React DOM entry point
├── index.html                  # HTML entry point
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration (with GitHub Pages base)
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Anjan Shetty**
- GitHub: [@codexanjan](https://github.com/codexanjan)
- Project Repository: [https://github.com/codexanjan/markdown-editor](https://github.com/codexanjan/markdown-editor)

---

<div align="center">

Made with ❤️ by [Anjan Shetty](https://github.com/codexanjan)

[![GitHub](https://img.shields.io/badge/GitHub-codexanjan-181717?style=flat&logo=github)](https://github.com/codexanjan)

</div>

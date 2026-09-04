export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'General' | 'Development' | 'Productivity' | 'Writing';
  content: string;
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Document',
    description: 'Start with a clean slate.',
    icon: 'FileText',
    category: 'General',
    content: `# Untitled Document

Start writing your markdown here...
`,
  },
  {
    id: 'readme',
    name: 'GitHub README',
    description: 'A professional open-source README with badges, features, and setup instructions.',
    icon: 'BookOpen',
    category: 'Development',
    content: `# Project Name

> A modern, lightning-fast application designed to solve real-world problems.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()

## 🚀 Features

- **Blazing Fast:** Built with performance and minimal bundle size in mind.
- **Privacy First:** All data is stored locally in your browser.
- **Extensible:** Modular architecture with plugin capabilities.
- **Responsive:** Works seamlessly across mobile, tablet, and desktop.

## 📦 Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/username/project-name.git

# Navigate to project directory
cd project-name

# Install dependencies
npm install
\`\`\`

## 🛠️ Usage

\`\`\`bash
# Start the development server
npm run dev

# Build for production
npm run build
\`\`\`

## 📋 Configuration

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| \`port\` | \`number\` | \`3000\` | Local server port |
| \`debug\` | \`boolean\` | \`false\` | Enable verbose logging |
| \`theme\` | \`string\` | \`"dark"\` | Default visual theme |

## 🤝 Contributing

Contributions are welcome! Please check out our [Contributing Guide](CONTRIBUTING.md) before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
`,
  },
  {
    id: 'technical-doc',
    name: 'Technical Architecture Spec',
    description: 'Architecture design document with goals, diagrams, components, and security.',
    icon: 'Layers',
    category: 'Development',
    content: `# Architecture Design Record: [System Name]

- **Author:** [Author Name]
- **Date:** ${new Date().toISOString().split('T')[0]}
- **Status:** Draft <!-- Draft | In Review | Approved | Superseded -->

## 1. Executive Summary

A concise 2-3 sentence overview explaining what is being built, the motivation, and the business impact.

## 2. Goals & Non-Goals

### Goals
- High throughput low latency event streaming (< 50ms p99).
- Zero data loss guarantee with transactional guarantees.
- Seamless horizontal scaling up to 100k req/sec.

### Non-Goals
- Real-time video streaming processing.
- Multi-region active-active synchronization for v1.

## 3. High-Level Architecture

\`\`\`
[ Client App ] ---> [ API Gateway / Edge Router ]
                             |
                   +---------+---------+
                   |                   |
            [ Auth Service ]   [ Core Service ]
                                       |
                              [ Database / Cache ]
\`\`\`

## 4. Component Breakdown

### 4.1 Ingestion Service
- **Language:** Go / Rust
- **Protocol:** gRPC / HTTP2
- **Responsibilities:** Request validation, authentication token verification, rate limiting.

### 4.2 Storage Layer
- **Primary Database:** PostgreSQL 16
- **Caching Layer:** Redis Cluster

## 5. Security & Privacy Considerations

- **Encryption in transit:** TLS 1.3 enforced.
- **Encryption at rest:** AES-256 for all persistent volumes.
- **Input Sanitization:** All incoming Markdown and rich text is passed through strict sanitizers to prevent XSS.

## 6. Open Questions

- [ ] What is the expected retention period for audit logs?
- [ ] Should we support automatic failover to read replicas?
`,
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Structured notes with attendees, agenda, discussion points, and action items.',
    icon: 'Users',
    category: 'Productivity',
    content: `# 📝 Meeting Notes: [Meeting Topic]

- **Date:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- **Time:** 10:00 AM - 11:00 AM UTC
- **Facilitator:** [Name]
- **Note Taker:** [Name]

## 👥 Attendees

- [x] Alice (Product Lead)
- [x] Bob (Engineering Lead)
- [ ] Charlie (Design Lead)
- [x] Dana (QA Specialist)

## 🎯 Objectives

1. Review Q3 project timeline and milestones.
2. Resolve open blockers regarding authentication architecture.
3. Align on release date for beta testing.

## 💬 Discussion Points

### Q3 Milestones
- Frontend core features are 80% complete.
- End-to-end testing coverage is currently at 65%. Goal is 85%.

### Authentication Blocker
- Decided to use JWT tokens stored in secure HttpOnly cookies with automatic refresh.
- Bob will document the token revocation strategy by Wednesday.

## ✅ Action Items

- [ ] **@Alice:** Finalize user story requirements for v1.1.
- [ ] **@Bob:** Benchmark IndexedDB performance with 5,000 documents.
- [ ] **@Dana:** Set up automated Playwright regression suite.
- [ ] **@Charlie:** Deliver high-fidelity Figma exports for mobile dialogs.

## 📅 Next Meeting

- **Date:** Next Tuesday, 10:00 AM UTC
`,
  },
  {
    id: 'blog-post',
    name: 'Blog Post Draft',
    description: 'Engaging article layout with frontmatter, hook, body headings, and callout.',
    icon: 'PenTool',
    category: 'Writing',
    content: `---
title: "Building Modern Privacy-First Web Applications"
date: "${new Date().toISOString().split('T')[0]}"
author: "Your Name"
tags: ["webdev", "privacy", "typescript", "architecture"]
readingTime: "5 min"
---

# Building Modern Privacy-First Web Applications

In an era where data privacy is paramount, empowering users to own their data without sending keystrokes to third-party clouds is more important than ever.

## The Problem with Cloud-Default Software

Most modern software defaults to server-side synchronization for every user interaction. While this enables easy cross-device sharing, it introduces significant trade-offs:

1. **Latency:** Keystroke lag on poor connections.
2. **Offline Fragility:** Applications become read-only or fail entirely without internet.
3. **Privacy Exposure:** Unencrypted user data sitting on centralized infrastructure.

> "True privacy means designing systems where you don't need to trust the provider because the provider never has access to the keys or the data in the first place."

## The Local-First Alternative

By utilizing **IndexedDB**, modern browsers can store gigabytes of structured data reliably and instantly.

### Core Architecture Principles:
- **Instantaneous Writes:** Keystrokes commit to local IndexedDB in < 5ms.
- **Offline Resilience:** The entire application bundles as a PWA and works on airplanes.
- **Export Freedom:** Users can export their documents in Markdown, HTML, and PDF at any moment.

## Conclusion

Privacy-first architecture is not a compromise—it is a competitive advantage that delivers faster, more reliable, and trustworthy software.
`,
  },
  {
    id: 'api-doc',
    name: 'API Documentation',
    description: 'Detailed REST API specification with endpoints, headers, request/response JSON.',
    icon: 'Code',
    category: 'Development',
    content: `# 🔌 REST API Specification: Documents API

**Base URL:** \`https://api.markdownstudio.com/v1\`

All requests require Bearer token authentication:
\`\`\`http
Authorization: Bearer <your_access_token>
Content-Type: application/json
\`\`\`

---

## 1. List Documents

Retrieves a paginated list of documents.

### Request
\`GET /documents?limit=20&page=1&sort=updatedAt:desc\`

### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| \`limit\` | \`integer\` | No | Number of records to return (default: 20, max: 100) |
| \`page\` | \`integer\` | No | Page number (default: 1) |
| \`folderId\` | \`string\` | No | Filter documents by folder ID |

### Response (\`200 OK\`)
\`\`\`json
{
  "status": "success",
  "data": [
    {
      "id": "doc_8f29ab",
      "title": "Project Roadmap",
      "wordCount": 1240,
      "createdAt": 1725450000000,
      "updatedAt": 1725453600000
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "totalPages": 3
  }
}
\`\`\`

---

## 2. Create Document

Creates a new Markdown document.

### Request
\`POST /documents\`

\`\`\`json
{
  "title": "Release Notes v2.0",
  "content": "# Release Notes\\n\\nNew features included...",
  "tags": ["release", "v2"]
}
\`\`\`

### Response (\`201 Created\`)
\`\`\`json
{
  "id": "doc_99a1bc",
  "title": "Release Notes v2.0",
  "createdAt": 1725457200000
}
\`\`\`

---

## Error Status Codes

| Code | Description |
| :--- | :--- |
| \`400\` | Validation error or malformed JSON |
| \`401\` | Missing or invalid API key |
| \`404\` | Requested document does not exist |
| \`429\` | Rate limit exceeded (100 req/min) |
`,
  },
  {
    id: 'changelog',
    name: 'Changelog',
    description: 'Standard Keep a Changelog format with Added, Changed, Deprecated, Fixed, Security.',
    icon: 'GitCommit',
    category: 'Development',
    content: `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Real-time syntax highlighting for 30+ programming languages.
- Table of contents scroll-spy tracking active sections.

---

## [1.2.0] - ${new Date().toISOString().split('T')[0]}

### Added
- Interactive Table Builder dialog with alignment controls.
- Slash command menu triggered with \`/\`.
- Version history snapshot recording and restore capability.

### Changed
- Improved CodeMirror 6 active line styling for better contrast in dark mode.
- Optimized debounced autosave from 3s to 1.5s.

### Fixed
- Fixed an issue where task list checkboxes did not properly persist checked state.
- Resolved race condition during multi-file drag and drop import.

### Security
- Upgraded HTML sanitization rules to strictly strip dangerous URI protocols.

---

## [1.0.0] - 2026-01-15

### Added
- Initial release of Markdown Studio.
- Offline IndexedDB storage.
- Live GFM preview and multi-format export (.md, .txt, .html, .pdf).
`,
  },
  {
    id: 'study-notes',
    name: 'Study & Research Notes',
    description: 'Academic notes layout with topic overview, key definitions, formulas, and references.',
    icon: 'GraduationCap',
    category: 'Writing',
    content: `# 📚 Study Notes: [Subject / Topic Name]

- **Course / Module:** [CS 301 / Data Structures]
- **Instructor / Source:** [Professor / Book Title]
- **Date:** ${new Date().toLocaleDateString()}

---

## 1. Key Concept Overview

Brief 1-2 sentence definition of the primary concept covered in this study session.

## 2. Core Terminology

- **Term 1:** Clear explanation of what this term means and where it is applied.
- **Term 2:** Contrast this with Term 1 to highlight subtle distinctions.
- **Invariant:** A condition that must remain true throughout system execution.

## 3. Detailed Notes & Explanations

### Algorithm Walkthrough

1. **Step 1: Initialization**
   Set up pointers at index \`0\` and \`n - 1\`.
2. **Step 2: Binary Partition**
   Compute midpoint \`mid = low + (high - low) / 2\`.
3. **Step 3: Convergence**
   Terminate when \`low > high\`.

### Complexity Analysis

| Scenario | Time Complexity | Space Complexity |
| :--- | :--- | :--- |
| Best Case | \`O(1)\` | \`O(1)\` |
| Average Case | \`O(log n)\` | \`O(1)\` |
| Worst Case | \`O(log n)\` | \`O(1)\` |

## 4. Key Takeaways & Review Questions

- [ ] Can I re-derive the recurrence relation without looking at notes?
- [ ] How does this data structure behave under high write contention?
- [ ] What happens when the input array contains duplicate values?

## 5. References & Further Reading

1. Cormen, Leiserson, Rivest, Stein: *Introduction to Algorithms (CLRS)*.
2. [MIT OpenCourseWare Lecture Notes](https://ocw.mit.edu).
`,
  },
  {
    id: 'daily-notes',
    name: 'Daily Notes & Journal',
    description: 'Day planner with top priorities, scheduled timeline, log, and evening reflection.',
    icon: 'Calendar',
    category: 'Productivity',
    content: `# 📅 Daily Journal: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

> *"Focus on being productive instead of busy."* — Tim Ferriss

## 🎯 Top 3 Priorities for Today

1. [ ] **High:** Finish CodeMirror integration for Markdown Studio
2. [ ] **Medium:** Review pull request #142 for storage migrations
3. [ ] **Low:** Draft weekly newsletter update

---

## ⏱️ Timeline & Schedule

- **09:00 - 09:30:** Morning coffee, inbox triage, review daily goals
- **09:30 - 12:00:** Deep Work Block: Core feature development
- **12:00 - 13:00:** Lunch & walk
- **13:00 - 14:00:** Team sync & design review
- **14:00 - 17:00:** Deep Work Block: Testing & refactoring
- **17:00 - 17:30:** Daily wrap-up & plan tomorrow

---

## 📝 Running Notes & Thoughts

- Discovered a great optimization for parsing markdown headings in O(n) line scan.
- Remember to test keyboard shortcuts on both Mac (Cmd) and Windows (Ctrl).

---

## 🌙 Evening Reflection

- **What went well today?**
  - Completed all planned tests and shipped the v1.0 bundle without errors.
- **What could have gone better?**
  - Spent too much time tweaking colors before the layout was solid.
- **One thing I learned today:**
  - CodeMirror 6's ViewUpdate architecture makes reactive updates extremely clean.
`,
  },
];

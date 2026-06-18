# Gemini Clone ✨

A feature-rich AI chat application built with React, styled as a Gemini clone, powered by OpenRouter's API. Built as a hands-on full-stack learning project.

---

## Features

- **Multi-turn conversations** — full chat thread displayed, not just the latest response
- **Word-by-word streaming** — responses appear token by token for a real Gemini feel
- **Stop & Regenerate** — cancel mid-generation or regenerate the last response
- **Session history** — conversations saved to localStorage with auto-generated titles
- **Dark / Light mode** — persistent theme toggle via Settings
- **Image upload** — send images along with prompts for vision-based queries
- **Speech input** — mic support via Web Speech API
- **Markdown rendering** — bold, italic, headings, bullet lists, and tables rendered properly
- **Copy & Feedback** — copy response to clipboard, thumbs up/down on answers
- **Font size control** — small / medium / large text across the app
- **Help Center** — FAQ, keyboard shortcuts, capability guide, feedback form, and docs
- **Keyboard shortcuts** — Ctrl+Enter to send, Ctrl+Shift+N for new chat, and more

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Styling | CSS (custom, no UI library) |
| AI API | OpenRouter (Gemini models) |
| Speech | react-speech-recognition |
| State | React Context API |
| Storage | localStorage |

---

## Project Structure

```
src/
├── assets/              # Icons and images
├── components/
│   ├── Main/            # Chat UI, streaming, message thread
│   ├── Sidebar/         # Session list, navigation
│   ├── Settings/        # Theme, font size, clear history
│   ├── Help/            # FAQ, shortcuts, docs modal
│   └── Activity/        # Session activity view
├── config/
│   └── openrouter.js    # API call logic
└── context/
    └── Context.jsx      # Global state management
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [OpenRouter](https://openrouter.ai) API key

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/gemini-clone.git
cd gemini-clone

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Add your API key to `.env`:

```env
VITE_OPENROUTER_API_KEY=your_api_key_here
```

```bash
# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Usage

- **New chat** — click `+ New Chat` in the sidebar or press `Ctrl+Shift+N`
- **Send message** — type and press `Enter` or `Ctrl+Enter`
- **Upload image** — click the gallery icon in the input bar
- **Voice input** — click the mic icon and speak
- **Switch theme** — go to Settings → Appearance
- **Load past chat** — click any session in the sidebar
- **Stop generation** — click the Stop button that appears while generating

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Enter` | Send message |
| `Ctrl + Shift + N` | New chat |
| `Ctrl + /` | Open Help |
| `Esc` | Close modal |

---



---

## Roadmap

- [ ] Code block syntax highlighting
- [ ] Export chat as PDF
- [ ] Multiple AI model selector
- [ ] Mobile responsive layout
- [ ] Conversation search

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

## License

MIT

---

## Acknowledgements

- [OpenRouter](https://openrouter.ai) for unified model API access
- [Google Gemini](https://gemini.google.com) for design inspiration
- [react-speech-recognition](https://github.com/JamesBrill/react-speech-recognition) for voice input
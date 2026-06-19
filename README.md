# Gemini Clone

A responsive AI chat application inspired by Google Gemini, built with React and Vite. Supports multi-turn conversations, image analysis, voice input, and a full set of UI features modeled after the real Gemini interface.

🔗 **Live Demo:** https://gemini-clone-nine-orcin.vercel.app
---

## ✨ Features

- **Multi-turn conversations** — full chat thread with streaming responses, not just single Q&A
- **Image upload & analysis** — attach an image and ask questions about it
- **Voice input** — speech-to-text via the microphone button
- **Edit & resend** — click any of your own messages to edit and resend
- **Regenerate response** — re-run the last AI response
- **Copy & feedback** — copy responses to clipboard, mark them 👍/👎
- **Dark / Light mode** — toggle with persisted preference
- **Adjustable font size** — Small / Medium / Large, saved across sessions
- **Conversation history (Activity)** — grouped by Today / Yesterday / Last 7 Days / Older, with search and delete
- **Rename conversations** — double-click any sidebar entry to rename it
- **Clear chat history** — with confirmation before deleting
- **Simple login** — enter your name once; your initials appear as your avatar throughout the app
- **Mobile responsive** — sidebar collapses into a bottom navigation bar on small screens
- **Loading skeleton** — smooth placeholder UI while the app initializes

---

## 🛠️ Tech Stack

- **React** (Vite)
- **react-speech-recognition** — voice input
- **OpenRouter API** — AI response generation
- **localStorage** — persisting chat sessions, theme, font size, and login state (no backend)

---

## 📁 Project Structure

```
src/
├── assets/                 # Icons and static assets
├── components/
│   ├── Activity/            # Conversation history modal
│   ├── Auth/                 # Login screen
│   ├── Conversation/         # Multi-turn chat thread renderer
│   ├── Help/                 # Help modal
│   ├── Main/                  # Main chat panel (input, greeting, cards)
│   ├── Settings/              # Settings modal (theme, font size, clear history)
│   ├── Sidebar/                # Left navigation / conversation list
│   └── Skeleton/                # Loading placeholder
├── config/
│   └── openrouter.js          # API call logic
├── context/
│   └── Context.jsx              # Global state (sessions, messages, user, theme)
├── App.jsx
├── main.jsx
└── index.css
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- An OpenRouter API key

### Installation

```bash
git clone https://github.com/shruti11931/Gemini-clone.git
cd Gemini-clone
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```
VITE_OPENROUTER_API_KEY=your_api_key_here
```

> Update `src/config/openrouter.js` to read from `import.meta.env.VITE_OPENROUTER_API_KEY` if it isn't already.

### Run locally

```bash
npm run dev
```

Visit `http://localhost:5173`

### Build for production

```bash
npm run build
```

---

## 📌 Notes

- All chat history, theme, and login data are stored in the browser's `localStorage` — clearing browser data will reset the app.
- This is a learning/portfolio project and not affiliated with Google or Gemini.

---

## 📄 License

This project is for educational purposes.
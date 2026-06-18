import React, { useContext, useState } from 'react';
import './Help.css';
import { Context } from '../../context/Context';


const faqs = [
  {
    question: "How do I start a new chat?",
    answer: "Click the '+ New Chat' button at the top of the sidebar to begin a fresh conversation."
  },
  {
    question: "Can I switch between dark and light mode?",
    answer: "Yes! Click the moon/sun icon at the bottom of the sidebar to toggle between dark and light themes."
  },
  {
    question: "How do I load a previous session?",
    answer: "Your recent chats appear in the sidebar under 'Recent'. Click any session title to reload it."
  },
  {
    question: "What AI model is being used?",
    answer: "This app uses models configured via OpenRouter. You can change the model in Settings."
  },
  {
    question: "Is my data stored anywhere?",
    answer: "Conversations are stored locally in your browser session. No data is sent to external servers beyond the AI API."
  }
];

const shortcuts = [
  { keys: ["Ctrl", "Enter"], action: "Send message" },
  { keys: ["Ctrl", "Shift", "N"], action: "New chat" },
  { keys: ["Ctrl", "/"], action: "Open Help" },
  { keys: ["Esc"], action: "Close modal" },
];

const Help = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('faq');
  const { darkMode } = useContext(Context);
  const [openFaq, setOpenFaq] = useState(null);
  const [feedback, setFeedback] = useState({ name: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (feedback.name.trim() && feedback.message.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFeedback({ name: '', message: '' });
      }, 3000);
    }
  };

  return (
    <div className="help-overlay" onClick={onClose}>
      <div className={`help-modal ${darkMode ? 'dark' : 'light'}`} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="help-header">
          <div className="help-header-left">
            <span className="help-icon">❓</span>
            <h2>Help Center</h2>
          </div>
          <button className="help-close" onClick={onClose} aria-label="Close Help">✕</button>
        </div>

        {/* Tabs */}
        <div className="help-tabs">
          {['faq', 'shortcuts', 'guide', 'feedback', 'docs'].map(tab => (
            <button
              key={tab}
              className={`help-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'faq' && '💬 FAQ'}
              {tab === 'shortcuts' && '⌨️ Shortcuts'}
              {tab === 'guide' && '✨ What can Gemini do?'}
              {tab === 'feedback' && '📝 Feedback'}
              {tab === 'docs' && '📚 Docs'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="help-content">

          {/* FAQ */}
          {activeTab === 'faq' && (
            <div className="help-section">
              <p className="help-section-desc">Common questions answered quickly.</p>
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className={`faq-item ${openFaq === i ? 'open' : ''}`}
                  onClick={() => toggleFaq(i)}
                >
                  <div className="faq-question">
                    <span>{faq.question}</span>
                    <span className="faq-chevron">{openFaq === i ? '▲' : '▼'}</span>
                  </div>
                  {openFaq === i && (
                    <div className="faq-answer">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Shortcuts */}
          {activeTab === 'shortcuts' && (
            <div className="help-section">
              <p className="help-section-desc">Speed up your workflow with these shortcuts.</p>
              <div className="shortcuts-list">
                {shortcuts.map((s, i) => (
                  <div key={i} className="shortcut-row">
                    <div className="shortcut-keys">
                      {s.keys.map((k, j) => (
                        <React.Fragment key={j}>
                          <kbd>{k}</kbd>
                          {j < s.keys.length - 1 && <span className="shortcut-plus">+</span>}
                        </React.Fragment>
                      ))}
                    </div>
                    <span className="shortcut-action">{s.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What can Gemini do? */}
          {activeTab === 'guide' && (
            <div className="help-section">
              <p className="help-section-desc">A quick look at what you can ask Gemini.</p>
              <div className="guide-grid">
                {[
                  { icon: '✍️', title: 'Write & Edit', desc: 'Drafts, emails, essays, code, and more.' },
                  { icon: '🔍', title: 'Research', desc: 'Summarize topics, explain concepts, compare ideas.' },
                  { icon: '💡', title: 'Brainstorm', desc: 'Ideas, outlines, creative prompts, project plans.' },
                  { icon: '🧮', title: 'Analyze', desc: 'Data, logic problems, math, and reasoning.' },
                  { icon: '🌐', title: 'Translate', desc: 'Translate text between dozens of languages.' },
                  { icon: '🤝', title: 'Assist', desc: 'Answer questions, give advice, learn new skills.' },
                ].map((item, i) => (
                  <div key={i} className="guide-card">
                    <span className="guide-icon">{item.icon}</span>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {activeTab === 'feedback' && (
            <div className="help-section">
              <p className="help-section-desc">We'd love to hear from you.</p>
              {submitted ? (
                <div className="feedback-success">
                  ✅ Thanks for your feedback! We'll review it shortly.
                </div>
              ) : (
                <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                  <div className="feedback-field">
                    <label htmlFor="fb-name">Name</label>
                    <input
                      id="fb-name"
                      type="text"
                      placeholder="Your name"
                      value={feedback.name}
                      onChange={e => setFeedback({ ...feedback, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="feedback-field">
                    <label htmlFor="fb-message">Message</label>
                    <textarea
                      id="fb-message"
                      placeholder="Share your thoughts, bugs, or suggestions..."
                      rows={5}
                      value={feedback.message}
                      onChange={e => setFeedback({ ...feedback, message: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="feedback-submit">Send Feedback</button>
                </form>
              )}
            </div>
          )}

          {/* Docs */}
          {activeTab === 'docs' && (
            <div className="help-section">
              <p className="help-section-desc">Official resources and documentation.</p>
              <div className="docs-links">
                {[
                  {
                    icon: '📖',
                    title: 'Gemini Documentation',
                    desc: 'Full API reference and usage guides.',
                    url: 'https://ai.google.dev/gemini-api/docs'
                  },
                  {
                    icon: '🚀',
                    title: 'Getting Started',
                    desc: 'Quickstart tutorials and examples.',
                    url: 'https://ai.google.dev/gemini-api/docs/quickstart'
                  },
                  {
                    icon: '🔧',
                    title: 'OpenRouter Docs',
                    desc: 'Learn about model routing and configuration.',
                    url: 'https://openrouter.ai/docs'
                  },
                  {
                    icon: '🐞',
                    title: 'Report an Issue',
                    desc: 'Found a bug? Let us know on GitHub.',
                    url: 'https://github.com'
                  },
                ].map((doc, i) => (
                  <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="doc-link-card">
                    <span className="doc-link-icon">{doc.icon}</span>
                    <div>
                      <h4>{doc.title}</h4>
                      <p>{doc.desc}</p>
                    </div>
                    <span className="doc-link-arrow">→</span>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Help;
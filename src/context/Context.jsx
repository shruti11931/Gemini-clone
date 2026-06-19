import { createContext, useState, useEffect, useRef } from "react";
import { sendPrompt } from "../config/openrouter";

export const Context = createContext();

const generateTitle = (prompt) => {
  const stopWords = ['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for', 'on',
    'with', 'at', 'by', 'from', 'this', 'that', 'these', 'those', 'i', 'me',
    'my', 'we', 'our', 'you', 'your', 'it', 'its'];
  const words = (prompt || '').split(' ')
    .filter(w => !stopWords.includes(w.toLowerCase()))
    .slice(0, 4);
  return words.join(' ') || (prompt || '').slice(0, 20);
};

const ContextProvider = ({ children }) => {

  const [messages, setMessages] = useState([]);
  const currentConversationId = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (name) => {
    const userData = { name: name.trim() };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };


  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const hasLoaded = useRef(false);

  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem("chatSessions");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.filter(s => s && typeof s.prompt === 'string')
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      return;
    }
    localStorage.setItem("chatSessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    const saved = localStorage.getItem('fontSize') || 'medium';
    document.documentElement.setAttribute('data-font', saved);
  }, []);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sentImagePreview, setSentImagePreview] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const wordTimers = useRef([]);
  const [feedbacks, setFeedbacks] = useState({});

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const formatResponse = (text) => {
    text = text.replace(
      /\|(.+)\|\n\|[-| :\t]+\|\n((?:\|.+\|\n?)+)/g,
      (_, header, body) => {
        const headers = header.split('|').map(h => h.trim()).filter(Boolean);
        const rows = body.trim().split('\n').map(row =>
          row.split('|').map(c => c.trim()).filter(Boolean)
        );
        const thead = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
        const tbody = rows.map(r =>
          `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`
        ).join('');
        return `<table class="ai-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
      }
    );

    text = text.replace(/^\|[-| :\t]+\|$/gm, '');

    text = text.replace(/^\|(.+)\|$/gm, (_, row) => {
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      return cells.join(' &nbsp;·&nbsp; ');
    });

    let formatted = text
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.+?)\*/g, '<i>$1</i>')
      .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n/g, '<br/>');

    return formatted;
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
    setResultData("");
    setRecentPrompt("");
    setChatHistory([]);
    setUploadedImage(null);
    setMessages([]);
    currentConversationId.current = null;
    setImagePreview(null);
    setSentImagePreview(null);
  };

  const loadSession = (session) => {
    setRecentPrompt(session.prompt);
    setResultData(session.response);
    setChatHistory(session.history || []);
    setShowResult(true);
    setMessages(session.messages || []);
    currentConversationId.current = session.id;
    setLoading(false);
    setSentImagePreview(session.imagePreview || null);
    setImagePreview(null);
  };

  const renameSession = (id, newTitle) => {
    setSessions(prev => prev.map(s =>
      s.id === id ? { ...s, title: newTitle } : s
    ));
  };

  const stopGenerating = () => {
    if (abortController) abortController.abort();
    wordTimers.current.forEach(clearTimeout);
    wordTimers.current = [];
    setLoading(false);
    setIsGenerating(false);
    setAbortController(null);
  };

  // ── Save/update the sidebar session for the CURRENT conversation ──
  const saveSession = ({ firstPrompt, formatted, newHistory, allMessages, sentImage }) => {
    if (!currentConversationId.current) {
      currentConversationId.current = Date.now();
    }

    const sessionData = {
      id: currentConversationId.current,
      prompt: firstPrompt,
      title: generateTitle(firstPrompt),
      response: formatted,
      history: newHistory,
      messages: allMessages,
      imagePreview: sentImage,
      timestamp: new Date().toISOString()
    };

    setSessions(prev => {
      const existingIndex = prev.findIndex(s => s.id === currentConversationId.current);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = sessionData;
        return updated;
      }
      return [sessionData, ...prev];
    });
  };

  const regenerateResponse = async () => {
    if (!recentPrompt) return;

    const trimmedHistory = chatHistory.slice(0, -1);
    const trimmedMessages = messages.slice(0, -1); // drop last assistant message
    setChatHistory(trimmedHistory);
    setMessages(trimmedMessages);
    setResultData("");
    setLoading(true);
    setShowResult(true);

    const controller = new AbortController();
    setAbortController(controller);
    setIsGenerating(true);

    try {
      const response = await sendPrompt(recentPrompt, trimmedHistory, null);

      const newHistory = [
        ...trimmedHistory,
        { role: "user", content: recentPrompt },
        { role: "assistant", content: response },
      ];
      const formatted = formatResponse(response);

      const assistantMsg = { id: Date.now(), role: 'assistant', content: formatted };
      const allMessages = [...trimmedMessages, assistantMsg];
      setMessages(allMessages);

      const firstPrompt = allMessages.find(m => m.role === 'user')?.content || recentPrompt;
      saveSession({
        firstPrompt,
        formatted,
        newHistory,
        allMessages,
        sentImage: sentImagePreview
      });

      const words = formatted.split(" ");
      words.forEach((word, i) => {
        const t = setTimeout(() => {
          setResultData((prev) => prev + word + " ");
        }, 75 * i);
        wordTimers.current.push(t);
      });

      const totalTime = 75 * words.length + 150;
      const historyTimer = setTimeout(() => {
        setChatHistory(newHistory);
      }, totalTime);
      wordTimers.current.push(historyTimer);

      const endTimer = setTimeout(() => {
        setIsGenerating(false);
        setAbortController(null);
        wordTimers.current = [];
      }, 75 * words.length + 100);
      wordTimers.current.push(endTimer);

    } catch (err) {
      setLoading(false);
      setResultData(`⚠️ Error: ${err.message}`);
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const editAndResend = async (newPrompt) => {
    if (!newPrompt.trim()) return;
    setRecentPrompt(newPrompt);
    const trimmedHistory = chatHistory.slice(0, -2);
    const trimmedMessages = messages.slice(0, -2);
    setChatHistory(trimmedHistory);
    setMessages(trimmedMessages);
    await onSent(newPrompt);
  };

  const setFeedback = (index, type) => {
    setFeedbacks(prev => ({ ...prev, [index]: type }));
  };

  const onSent = async (prompt) => {
    const userPrompt = prompt !== undefined ? prompt : input;
    if (!userPrompt.trim()) return;

    setResultData("");
    setLoading(true);
    const controller = new AbortController();
    setAbortController(controller);
    setIsGenerating(true);
    setShowResult(true);
    setRecentPrompt(userPrompt || "Analyse this image");
    setInput("");

    const sentImage = imagePreview;
    const historySnapshot = [...chatHistory];

    setSentImagePreview(imagePreview);
    setImagePreview(null);
    setUploadedImage(null);

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: userPrompt,
      imagePreview: sentImage
    };

    // Snapshot messages BEFORE adding the new one — avoids stale closures
    const messagesSnapshot = [...messages, userMsg];
    setMessages(messagesSnapshot);

    try {
      const response = await sendPrompt(
        userPrompt || "what is in this image?",
        historySnapshot,
        uploadedImage
      );

      const newHistory = [
        ...historySnapshot,
        { role: "user", content: userPrompt },
        { role: "assistant", content: response },
      ];
      setChatHistory(newHistory);
      const formatted = formatResponse(response);

      const assistantMsg = { id: Date.now() + 1, role: 'assistant', content: formatted };
      const allMessages = [...messagesSnapshot, assistantMsg];
      setMessages(allMessages);

      const firstPrompt = allMessages.find(m => m.role === 'user')?.content || userPrompt;
      saveSession({
        firstPrompt,
        formatted,
        newHistory,
        allMessages,
        sentImage: allMessages.find(m => m.role === 'user')?.imagePreview || sentImage
      });

      const words = formatted.split(" ");
      words.forEach((word, i) => {
        const t = setTimeout(() => {
          setResultData((prev) => prev + word + " ");
        }, 75 * i);
        wordTimers.current.push(t);
      });

    } catch (err) {
      setResultData(`⚠️ Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setLoading(false);
      setAbortController(null);
    }
  };

  return (
    <Context.Provider
      value={{
        input, setInput,
        recentPrompt,
        showResult,
        loading,
        resultData,
        sessions,
        setSessions,
        user, login, logout,
        loadSession,
        messages, setMessages,
        onSent,
        newChat,
        darkMode,
        setDarkMode,
        uploadedImage, setUploadedImage,
        imagePreview, setImagePreview,
        sentImagePreview,
        isGenerating, stopGenerating,
        regenerateResponse,
        renameSession,   // ← ADD THIS
        editAndResend,
        chatHistory,
        feedbacks, setFeedback,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
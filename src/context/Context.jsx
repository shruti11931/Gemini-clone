import { createContext, useState, useEffect, useRef } from "react";
import { sendPrompt } from "../config/openrouter";

export const Context = createContext();

const ContextProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  // Load from localStorage on first render
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

  // In Context.jsx, add this with your other useEffects:
  useEffect(() => {
    const saved = localStorage.getItem('fontSize') || 'medium'
    document.documentElement.setAttribute('data-font', saved)
  }, [])

  // Save to localStorage whenever sessions changes



  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [sentImagePreview, setSentImagePreview] = useState(null)

  const [isGenerating, setIsGenerating] = useState(false)
  const [abortController, setAbortController] = useState(null)
  const wordTimers = useRef([])
  const [feedbacks, setFeedbacks] = useState({}) // { [sessionIndex]: 'up'|'down' }

  // ✅ Dark mode — reads saved preference on first load
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // ✅ Apply/remove dark class on body whenever darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("chatSessions", JSON.stringify(sessions));
  }, [sessions]);

  const formatResponse = (text) => {
    // Handle tables first (before any other processing)
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

    // Remove any leftover separator lines (|----|----| lines)
    text = text.replace(/^\|[-| :\t]+\|$/gm, '');

    // Remove leftover bare pipe lines that didn't get converted
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
    setImagePreview(null);
    setSentImagePreview(null);
  };

  const loadSession = (session) => {
    setRecentPrompt(session.prompt);
    setResultData(session.response);
    setChatHistory(session.history);
    setShowResult(true);
    setLoading(false);
    setSentImagePreview(session.imagePreview || null);  // ← change imagePreview to sentImagePreview
    setImagePreview(null);
  };

  const stopGenerating = () => {
    if (abortController) abortController.abort();
    // Cancel all pending word timers
    wordTimers.current.forEach(clearTimeout);
    wordTimers.current = [];
    setLoading(false);
    setIsGenerating(false);
    setAbortController(null);
  };

  const regenerateResponse = async () => {
    if (!recentPrompt) return;
    // Remove last assistant message from history before resending
    const trimmedHistory = chatHistory.slice(0, -1);
    setChatHistory(trimmedHistory);
    setResultData("");
    setLoading(true);
    setShowResult(true);

    const controller = new AbortController();
    setAbortController(controller);
    setIsGenerating(true);

    try {
      const response = await sendPrompt(recentPrompt, trimmedHistory, null);
      // REPLACE WITH:
      const newHistory = [
        ...historySnapshot,
        { role: "user", content: userPrompt },
        { role: "assistant", content: response },
      ];
      const formatted = formatResponse(response);
      const title = userPrompt.split(' ').slice(0, 4).join(' ');

      setSessions((prev) => [
        { prompt: userPrompt || "Image analysis", title, response: formatted, history: newHistory, imagePreview: sentImage, timestamp: new Date().toISOString() },
        ...prev,
      ]);

      const words = formatted.split(" ");
      words.forEach((word, i) => {
        setTimeout(() => {
          setResultData((prev) => prev + word + " ");
        }, 75 * i);
      });

      // ✅ Set history AFTER all words are done streaming
      const totalTime = 75 * words.length + 150;
      setTimeout(() => {
        setChatHistory(newHistory);   // ← moved here
      }, totalTime);

      
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

    } finally {

    }
  };

  const editAndResend = async (newPrompt) => {
    if (!newPrompt.trim()) return;
    setRecentPrompt(newPrompt);
    // Strip last user+assistant pair and resend
    const trimmedHistory = chatHistory.slice(0, -2);
    setChatHistory(trimmedHistory);
    await onSent(newPrompt);
  };

  const setFeedback = (index, type) => {
    setFeedbacks(prev => ({ ...prev, [index]: type }));
  };

  // Context.jsx - in onSent function
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
    const currentImage = uploadedImage;           // ← snapshot before clearing
    const historySnapshot = [...chatHistory];     // ← snapshot chatHistory NOW

    setSentImagePreview(imagePreview)
    setImagePreview(null);
    setUploadedImage(null);

    try {
      const response = await sendPrompt(
        userPrompt || "what is in this image?",
        historySnapshot,   // ← use snapshot
        currentImage       // ← use snapshot
      );

      const newHistory = [
        ...historySnapshot,  // ← use snapshot
        { role: "user", content: userPrompt },
        { role: "assistant", content: response },
      ];
      setChatHistory(newHistory);
      const formatted = formatResponse(response);

      const title = userPrompt.split(' ').slice(0, 4).join(' ');
      setSessions((prev) => [
        { prompt: userPrompt || "Image analysis", title, response: formatted, history: newHistory, imagePreview: sentImage, timestamp: new Date().toISOString() },
        ...prev,
      ]);


      const words = formatted.split(" ");
      words.forEach((word, i) => {
        setTimeout(() => {
          setResultData((prev) => prev + word + " ");
        }, 75 * i);
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

        loadSession,
        onSent,
        newChat,
        darkMode,       // ✅ new
        setDarkMode,
        uploadedImage, setUploadedImage,   // ✅ new
        imagePreview, setImagePreview,
        sentImagePreview,
        isGenerating, stopGenerating,
        regenerateResponse,
        editAndResend,
        setSessions,
        // ADD chatHistory to the value object:
        chatHistory,
        feedbacks, setFeedback,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;


import { useState, useRef, useEffect } from "react";
import api from "../api";
import "../styles/SideChatBot.css";

export default function SideChatBot({ open, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      text:
        "Hi, I'm the TelecomIQ Assistant. Describe your telecom issue and I'll help classify it, or type a ticket ID to look up your complaint status.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const recognitionRef = useRef(null);
  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);

  // Helper function to format markdown text to HTML
  const formatMessageText = (text) => {
    if (!text) return "";

    let formatted = text;
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');
    formatted = formatted.replace(/\n/g, '<br>');
    formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="list-item">$1. $2</div>');
    formatted = formatted.replace(/^[-*]\s+(.+)$/gm, '<div class="list-item">• $1</div>');

    return formatted;
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300);
    }
  }, [open]);

  const handleInputHover = () => {
    if (inputRef.current && !isListening) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        setInput(transcript);

        if (event.results[0].isFinal) {
          setIsListening(false);
          setTimeout(() => {
            if (transcript.trim()) {
              sendMessage(null, transcript.trim());
            }
          }, 500);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert("Microphone access denied. Please enable it in your browser settings.");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      setVoiceSupported(true);
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 100);
      }
    }
  };

  const sendMessage = async (e, directText = null) => {
    if (e) e.preventDefault();
    const messageText = directText || input.trim();
    if (!messageText || loading) return;

    const userMsg = { role: "user", text: messageText };
    const currentInput = messageText;

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/agent/chat", { message: currentInput });

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: res.data.response,
          meta: res.data,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: "Sorry, I faced an issue. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`side-chat ${open ? "open" : ""} ${isMaximized ? "maximized" : ""}`}>
      <div className="chat-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            <rect x="9" y="9" width="6" height="6"></rect>
            <line x1="9" y1="1" x2="9" y2="4"></line>
            <line x1="15" y1="1" x2="15" y2="4"></line>
            <line x1="9" y1="20" x2="9" y2="23"></line>
            <line x1="15" y1="20" x2="15" y2="23"></line>
          </svg>
          <span>TelecomIQ Assistant</span>
        </div>
        <div className="chat-header-buttons">
          <button
            className="chat-maximize-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsMaximized(!isMaximized);
            }}
            aria-label={isMaximized ? "Minimize Chat" : "Maximize Chat"}
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20"></polyline>
                <polyline points="20 10 14 10 14 4"></polyline>
                <line x1="14" y1="10" x2="21" y2="3"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            )}
          </button>
          <button className="chat-close-btn" onClick={onClose} aria-label="Close Chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="chat-body" ref={chatBodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            <div dangerouslySetInnerHTML={{ __html: formatMessageText(m.text) }} />

            {m.meta && m.meta.type === "complaint" && (
              <div className="chat-meta">
                <span>Category: {m.meta.category}</span>
                <span>Priority: {m.meta.priority}</span>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-msg agent">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <form className="chat-input" onSubmit={sendMessage} onMouseEnter={handleInputHover}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening..." : "Type your message..."}
          disabled={isListening}
          autoComplete="off"
        />
        {voiceSupported && (
          <button
            type="button"
            className={`voice-btn ${isListening ? 'active' : ''}`}
            onClick={toggleVoiceInput}
            title={isListening ? "Stop Listening" : "Voice Input"}
          >
            {isListening ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2"></rect>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            )}
          </button>
        )}
        <button type="submit" disabled={loading || !input.trim() || isListening}>
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}

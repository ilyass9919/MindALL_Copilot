import { useState, useEffect, useRef } from "react";
import AgentBadge from "../components/AgentBadge";
import { renderMarkdown } from "../lib/markdown";
import { fetchMessages, sendChatMessage, API, authHeaders } from "../lib/api";

const SUGGESTIONS = [
  "How should I price my offer?",
  "Who are my main competitors?",
  "What's my go-to-market strategy?",
  "How do I build brand awareness?",
];

const WELCOME_MSG = (title) => ({
  role: "assistant", agent: "strategy",
  text: `Welcome! I'm your MindAll Copilot for **${title}**.\n\nAsk me anything — pricing, marketing strategy, competitive landscape, roadmap priorities. I'll route your question to the right specialist and pull live market data to back up my advice.`
});

export default function ChatPage({ project, onBack, onHome }) {
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    (async () => {
      setLoadingHistory(true);
      try {
        const data = await fetchMessages(project.id);
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data.map(m => ({ role: m.role, agent: m.agent_type || "strategy", text: m.content })));
        } else {
          setMessages([WELCOME_MSG(project.title)]);
        }
      } catch {
        setMessages([WELCOME_MSG(project.title)]);
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, [project.id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: q }]);
    setLoading(true);

    try {
      const data = await sendChatMessage(project.id, q);
      setMessages(m => [...m, { role: "assistant", agent: data.agent_used, text: data.response }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", agent: "general", text: "Sorry, I couldn't reach the backend. Please make sure it's running." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column", background: "#FAFAF8", overflow: "hidden" }}>

      {/* Header */}
      <div className="chat-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 5%", borderBottom: "1px solid #E8E4DF", background: "#fff", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
          {/* Logo — clickable, goes home */}
          <div
            onClick={onHome}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, cursor: "pointer", userSelect: "none", flexShrink: 0, transition: "opacity 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            title="Go to home"
          >
            Mind<span style={{ color: "#C9A96E" }}>All</span>
          </div>
          <div style={{ width: 1, height: 20, background: "#E8E4DF", flexShrink: 0 }} />
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, color: "#8A837C", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>← Back</button>
          <div style={{ width: 1, height: 20, background: "#E8E4DF", flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{project.title}</div>
            <div style={{ fontSize: 11, color: "#B8B0A8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{project.industry}</div>
          </div>
        </div>
        <div className="chat-header-badges" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <AgentBadge type="marketing" />
          <AgentBadge type="finance" />
          <AgentBadge type="strategy" />
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ flex: 1, overflowY: "auto", padding: "32px 5%", minHeight: 0 }}>
        <div style={{ width: "100%", maxWidth: 980, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

          {loadingHistory && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: i === 2 ? 80 : 48, width: i === 2 ? "65%" : "75%", alignSelf: i === 2 ? "flex-end" : "flex-start", background: "linear-gradient(90deg, #F0EDE8 25%, #FAF8F5 50%, #F0EDE8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
              ))}
            </div>
          )}

          {!loadingHistory && messages.map((m, i) => (
            <div key={i} className="fade-in" style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              {m.role === "assistant" && (
                <div className="chat-msg-inner" style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: "78%", width: "100%" }}>
                  <AgentBadge type={m.agent} />
                  <div className="card" style={{ padding: "20px 24px", fontSize: 14, lineHeight: 1.85, color: "#2A2A2A", fontWeight: 300 }}>
                    {renderMarkdown(m.text)}
                  </div>
                </div>
              )}
              {m.role === "user" && (
                <div className="chat-user-bubble" style={{ background: "#1A1A1A", color: "#FAFAF8", padding: "14px 20px", maxWidth: "65%", fontSize: 14, lineHeight: 1.7, fontWeight: 300 }}>
                  {m.text}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="fade-in" style={{ display: "flex", alignItems: "center", gap: 8, color: "#B8B0A8" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 0.15, 0.3].map((d, i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#C9A96E", animation: `pulse 1.2s ease-in-out ${d}s infinite` }} />
                ))}
              </div>
              <span style={{ fontSize: 13 }}>Researching and thinking…</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggestions */}
      {messages.length === 1 && !loadingHistory && (
        <div className="suggestions-wrap" style={{ padding: "0 5% 12px", flexShrink: 0 }}>
          <div style={{ width: "100%", maxWidth: 980, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => setInput(s)} style={{ background: "#fff", border: "1px solid #E0DBD4", padding: "8px 16px", fontSize: 13, cursor: "pointer", color: "#4A4540", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s, background 0.2s" }}
                onMouseEnter={e => { e.target.style.borderColor = "#C9A96E"; e.target.style.background = "#FFFAF5"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#E0DBD4"; e.target.style.background = "#fff"; }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="chat-input-bar" style={{ padding: "16px 5% 20px", borderTop: "1px solid #E8E4DF", background: "#fff", flexShrink: 0 }}>
        <div style={{ width: "100%", maxWidth: 980, margin: "0 auto", display: "flex", gap: 12 }}>
          <input className="input-field" placeholder="Ask your copilot anything about your business…"
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={loading} style={{ flex: 1, fontSize: 14 }} />
          <button className="btn-primary" onClick={sendMessage} disabled={loading || !input.trim()}
            style={{ padding: "12px 28px", opacity: loading || !input.trim() ? 0.4 : 1, flexShrink: 0 }}>
            Send
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "#C8C2BC", marginTop: 10, letterSpacing: "0.03em" }}>
          Powered by MindAll AI · Routed automatically to Marketing, Finance, or Strategy agent
        </p>
      </div>
    </div>
  );
}
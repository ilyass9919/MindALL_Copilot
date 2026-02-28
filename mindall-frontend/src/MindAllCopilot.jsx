import { useState, useEffect, useRef } from "react";

const API = "http://127.0.0.1:8000";

/* ── Auth helpers ─────────────────────────────────────────────────────────── */
const getToken = () => sessionStorage.getItem("mindall_token");
const getUser  = () => { try { return JSON.parse(sessionStorage.getItem("mindall_user")); } catch { return null; } };
const setAuth  = (token, user) => { sessionStorage.setItem("mindall_token", token); sessionStorage.setItem("mindall_user", JSON.stringify(user)); };
const clearAuth = () => { sessionStorage.removeItem("mindall_token"); sessionStorage.removeItem("mindall_user"); };
/* ── Simple Markdown Renderer ─────────────────────────────────────────────── */
const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line → spacer
    if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 8 }} />);
      i++; continue;
    }
    // ### Heading 3
    if (line.startsWith("### ")) {
      elements.push(<div key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600, color: "#1A1A1A", marginTop: 16, marginBottom: 4 }}>{line.replace("### ", "")}</div>);
      i++; continue;
    }
    // ## Heading 2
    if (line.startsWith("## ")) {
      elements.push(<div key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "#1A1A1A", marginTop: 18, marginBottom: 6 }}>{line.replace("## ", "")}</div>);
      i++; continue;
    }
    // # Heading 1
    if (line.startsWith("# ")) {
      elements.push(<div key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 500, color: "#1A1A1A", marginTop: 20, marginBottom: 8 }}>{line.replace("# ", "")}</div>);
      i++; continue;
    }
    // - bullet point
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const bulletLines = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        bulletLines.push(lines[i].replace(/^[-*] /, ""));
        i++;
      }
      elements.push(
        <ul key={i} style={{ paddingLeft: 20, margin: "6px 0", display: "flex", flexDirection: "column", gap: 4 }}>
          {bulletLines.map((b, bi) => (
            <li key={bi} style={{ fontSize: 14, lineHeight: 1.7, color: "#2A2A2A" }}
              dangerouslySetInnerHTML={{ __html: b.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>") }}
            />
          ))}
        </ul>
      );
      continue;
    }
    // Normal paragraph with inline bold/italic
    elements.push(
      <p key={i} style={{ fontSize: 14, lineHeight: 1.85, color: "#2A2A2A", margin: "2px 0" }}
        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>") }}
      />
    );
    i++;
  }
  return elements;
};


const authHeaders = () => ({ "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` });

/* ── Google Fonts ─────────────────────────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap";
document.head.appendChild(fontLink);

/* ── Global styles ────────────────────────────────────────────────────────── */
const globalStyle = document.createElement("style");
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { width: 100%; min-height: 100vh; }
  body { font-family: 'DM Sans', sans-serif; background: #FAFAF8; color: #1A1A1A; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #F0EDE8; }
  ::-webkit-scrollbar-thumb { background: #C9A96E; border-radius: 2px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  .fade-up  { animation: fadeUp  0.6s ease both; }
  .fade-in  { animation: fadeIn  0.4s ease both; }
  .delay-1  { animation-delay: 0.1s; }
  .delay-2  { animation-delay: 0.2s; }
  .delay-3  { animation-delay: 0.3s; }
  .delay-4  { animation-delay: 0.4s; }
  .delay-5  { animation-delay: 0.5s; }

  .btn-primary {
    background: #1A1A1A; color: #FAFAF8;
    border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 14px;
    padding: 12px 28px; letter-spacing: 0.03em;
    transition: background 0.2s, transform 0.15s;
  }
  .btn-primary:hover  { background: #2D2D2D; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }

  .btn-ghost {
    background: transparent; color: #1A1A1A;
    border: 1px solid #E0DBD4; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-weight: 400; font-size: 14px;
    padding: 11px 28px; letter-spacing: 0.03em;
    transition: border-color 0.2s, background 0.2s;
  }
  .btn-ghost:hover { border-color: #1A1A1A; background: #F5F2EE; }

  .card {
    background: #fff; border: 1px solid #E8E4DF;
    transition: box-shadow 0.25s, transform 0.25s;
  }
  .card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.06); transform: translateY(-2px); }

  .input-field {
    width: 100%; padding: 12px 16px;
    border: 1px solid #E0DBD4; background: #fff;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1A1A1A;
    outline: none; transition: border-color 0.2s;
  }
  .input-field:focus  { border-color: #C9A96E; }
  .input-field::placeholder { color: #B8B0A8; }

  .tag-marketing { background: #FFF3E8; color: #C97A2A; }
  .tag-finance   { background: #E8F5F0; color: #2A9A70; }
  .tag-strategy  { background: #EEF0FF; color: #4A5FBF; }
  .tag-general   { background: #F5F2EE; color: #6B6560; }

  /* Responsive */
  @media (max-width: 768px) {
    .chat-header { padding: 12px 16px !important; flex-wrap: wrap; gap: 8px; }
    .chat-header-badges { display: none !important; }
    .chat-messages { padding: 16px !important; }
    .chat-input-bar { padding: 12px 16px 16px !important; }
    .chat-msg-inner { max-width: 100% !important; }
    .chat-user-bubble { max-width: 88% !important; }
    .suggestions-wrap { padding: 0 16px 10px !important; }
    .dashboard-body { padding: 24px 20px !important; }
    .projects-grid { grid-template-columns: 1fr !important; }
  }
  @media (min-width: 769px) and (max-width: 1280px) {
    .dashboard-body { padding: 48px 4% !important; }
    .projects-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
`;
document.head.appendChild(globalStyle);

/* ── Agent SVG Icons ──────────────────────────────────────────────────────── */

// Marketing: Megaphone — clear, professional, universally understood
const MarketingIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l19-9-9 19-2-8-8-2z"/>
  </svg>
);

// Finance: Trending up chart — instantly signals growth & financial performance  
const FinanceIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

// Strategy: Layers — represents planning, structure, and strategic depth
const StrategyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

// General: Sparkle — AI-generated insight
const GeneralIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v4l3 3"/>
  </svg>
);

const AgentBadge = ({ type }) => {
  const map = {
    marketing: { label: "Marketing", Icon: MarketingIcon, cls: "tag-marketing" },
    finance:   { label: "Finance",   Icon: FinanceIcon,   cls: "tag-finance"   },
    strategy:  { label: "Strategy",  Icon: StrategyIcon,  cls: "tag-strategy"  },
  };
  const a = map[type] || { label: type, Icon: GeneralIcon, cls: "tag-general" };
  return (
    <span className={a.cls} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", fontSize: 11, fontWeight: 500,
      letterSpacing: "0.05em", textTransform: "uppercase"
    }}>
      <a.Icon /> {a.label}
    </span>
  );
};


/* ════════════════════════════════════════════════════════════════════════════
   AUTH SCREEN — LOGIN + SIGNUP
════════════════════════════════════════════════════════════════════════════ */
const AuthScreen = ({ onSuccess }) => {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.email || !form.password || (mode === "signup" && !form.name)) {
      setError("Please fill in all fields."); return;
    }
    setLoading(true); setError("");
    try {
      const endpoint = mode === "signup" ? "/auth/register" : "/auth/login";
      const body = mode === "signup"
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const res = await fetch(`${API}${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Something went wrong."); return; }

      setAuth(data.access_token, data.user);
      onSuccess(data.user);
    } catch { setError("Cannot connect to backend. Is it running?"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Logo */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 500, letterSpacing: "0.02em", marginBottom: 8 }}>
            Mind<span style={{ color: "#C9A96E" }}>All</span>
          </div>
          <p style={{ fontSize: 14, color: "#8A837C", fontWeight: 300 }}>
            Your AI-powered entrepreneur copilot
          </p>
        </div>

        <div className="card fade-up delay-1" style={{ padding: "40px 40px" }}>

          {/* Tab switcher */}
          <div style={{ display: "flex", borderBottom: "1px solid #E8E4DF", marginBottom: 32 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, padding: "10px 0", background: "none", border: "none",
                cursor: "pointer", fontSize: 14, fontWeight: mode === m ? 500 : 400,
                color: mode === m ? "#1A1A1A" : "#B8B0A8",
                borderBottom: mode === m ? "2px solid #C9A96E" : "2px solid transparent",
                fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em",
                transition: "all 0.2s", marginBottom: -1, textTransform: "capitalize"
              }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {mode === "signup" && (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8A837C", marginBottom: 8 }}>
                  Full Name
                </label>
                <input className="input-field" placeholder="Your name"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8A837C", marginBottom: 8 }}>
                Email
              </label>
              <input className="input-field" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8A837C", marginBottom: 8 }}>
                Password
              </label>
              <input className="input-field" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", fontSize: 13, color: "#DC2626" }}>
                {error}
              </div>
            )}

            <button className="btn-primary" onClick={handleSubmit} disabled={loading}
              style={{ width: "100%", padding: 14, marginTop: 4, fontSize: 15 }}>
              {loading ? "Please wait…" : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </div>
        </div>

        <p className="fade-up delay-2" style={{ textAlign: "center", fontSize: 12, color: "#C0BAB4", marginTop: 24 }}>
          Your projects and conversations are private to your account
        </p>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   SCREEN 1 — LANDING
════════════════════════════════════════════════════════════════════════════ */
const LandingScreen = ({ onEnter, user, onLogout }) => (
  <div style={{ minHeight: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>

    {/* Nav */}
    <nav style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "24px 5%", borderBottom: "1px solid #E8E4DF", background: "#FAFAF8"
    }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, letterSpacing: "0.02em" }}>
        Mind<span style={{ color: "#C9A96E" }}>All</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user && <span style={{ fontSize: 13, color: "#8A837C" }}>Hi, {user.name}</span>}
        <button className="btn-primary" onClick={onEnter} style={{ padding: "10px 24px", fontSize: 13 }}>
          Launch Copilot →
        </button>
        {user && <button className="btn-ghost" onClick={onLogout} style={{ padding: "9px 16px", fontSize: 13 }}>Sign out</button>}
      </div>
    </nav>

    {/* Hero */}
    <main style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      padding: "80px 5%", width: "100%"
    }}>
      <div style={{ textAlign: "center" }}>
        {/* Eyebrow */}
        <div className="fade-up" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px", border: "1px solid #E0DBD4",
          fontSize: 12, fontWeight: 500, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "#8A837C", marginBottom: 40
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A96E", display: "inline-block" }} />
          AI-Powered Entrepreneur Copilot
        </div>

        {/* Headline */}
        <h1 className="fade-up delay-1" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(48px, 7vw, 80px)",
          fontWeight: 400, lineHeight: 1.1,
          letterSpacing: "-0.01em", marginBottom: 28, color: "#1A1A1A"
        }}>
          Your AI advisor for<br />
          <span style={{ color: "#C9A96E", fontStyle: "italic" }}>every business decision</span>
        </h1>

        {/* Subline */}
        <p className="fade-up delay-2" style={{
          fontSize: 17, lineHeight: 1.7, color: "#6B6560",
          maxWidth: 520, margin: "0 auto 48px", fontWeight: 300
        }}>
          Three specialized AI agents — Marketing, Finance, Strategy — working together
          to guide you from idea to execution, every single day.
        </p>

        {/* CTAs */}
        <div className="fade-up delay-3" style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn-primary" onClick={onEnter} style={{ padding: "14px 36px", fontSize: 15 }}>
            Start your project →
          </button>
          <button className="btn-ghost" style={{ padding: "14px 36px", fontSize: 15 }}>
            See how it works
          </button>
        </div>
      </div>
    </main>

    {/* Features strip */}
    <section style={{
      display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
      borderTop: "1px solid #E8E4DF"
    }}>
      {[
        { icon: "marketing", title: "Marketing Agent", desc: "Brand strategy, content creation, social media growth, and visibility campaigns." },
        { icon: "finance",   title: "Finance Agent",   desc: "Pricing models, unit economics, monetization strategies backed by live market data." },
        { icon: "strategy",  title: "Strategy Agent",  desc: "Competitive analysis, roadmaps, business model design, and weekly priorities." },
      ].map((f, i) => (
        <div key={i} className={`fade-up delay-${i + 3}`} style={{
          padding: "40px 48px",
          borderRight: i < 2 ? "1px solid #E8E4DF" : "none"
        }}>
          <div style={{
            width: 48, height: 48, marginBottom: 22,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "12px",
            background: f.icon === "marketing" ? "#FFF3E8" : f.icon === "finance" ? "#E8F5F0" : "#EEF0FF",
            color: f.icon === "marketing" ? "#C97A2A" : f.icon === "finance" ? "#2A9A70" : "#4A5FBF",
          }}>
            {f.icon === "marketing" && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l19-9-9 19-2-8-8-2z"/>
              </svg>
            )}
            {f.icon === "finance" && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            )}
            {f.icon === "strategy" && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                <polyline points="2 17 12 22 22 17"/>
                <polyline points="2 12 12 17 22 12"/>
              </svg>
            )}
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, marginBottom: 10 }}>
            {f.title}
          </div>
          <p style={{ fontSize: 14, color: "#6B6560", lineHeight: 1.7, fontWeight: 300 }}>{f.desc}</p>
        </div>
      ))}
    </section>
  </div>
);

/* ════════════════════════════════════════════════════════════════════════════
   SCREEN 2 — DASHBOARD
════════════════════════════════════════════════════════════════════════════ */
const DashboardScreen = ({ onNew, onSelect, projects, loading, user, onLogout, openingProject }) => (
  <div style={{ minHeight: "100vh", width: "100vw", background: "#FAFAF8", display: "flex", flexDirection: "column", position: "relative" }}>
    {openingProject && (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(250,250,248,0.85)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        zIndex: 50, backdropFilter: "blur(4px)"
      }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[0, 0.15, 0.3].map((d, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: "50%", background: "#C9A96E",
              animation: `pulse 1.2s ease-in-out ${d}s infinite`
            }} />
          ))}
        </div>
        <p style={{ fontSize: 14, color: "#8A837C", fontFamily: "'DM Sans', sans-serif" }}>Opening project…</p>
      </div>
    )}

    {/* Top nav */}
    <nav style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "20px 5%", borderBottom: "1px solid #E8E4DF", background: "#fff"
    }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500 }}>
        Mind<span style={{ color: "#C9A96E" }}>All</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user && <span style={{ fontSize: 13, color: "#8A837C" }}>Hi, {user.name}</span>}
        <button className="btn-primary" onClick={onNew} style={{ padding: "10px 24px", fontSize: 13 }}>+ New Project</button>
        {user && <button className="btn-ghost" onClick={onLogout} style={{ padding: "9px 16px", fontSize: 13 }}>Sign out</button>}
      </div>
    </nav>

    <div className="dashboard-body" style={{ flex: 1, width: "100%", padding: "48px 5%" }}>

      {/* Page title */}
      <div className="fade-up" style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 10 }}>
          Your workspace
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 400, lineHeight: 1 }}>
          Projects
        </h1>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 80, color: "#B8B0A8", fontSize: 14 }}>
          Loading projects…
        </div>
      )}

      {/* Empty state — full width */}
      {!loading && projects.length === 0 && (
        <div className="fade-in" style={{
          width: "100%", border: "1px dashed #D8D3CC",
          padding: "100px 48px", textAlign: "center", background: "#fff"
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", background: "#F5F2EE",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 28px"
          }}>🚀</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400, marginBottom: 14 }}>
            No projects yet
          </h2>
          <p style={{ color: "#8A837C", fontSize: 15, fontWeight: 300, maxWidth: 400, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Create your first project and let your AI copilot guide you from idea to execution.
          </p>
          <button className="btn-primary" onClick={onNew} style={{ padding: "14px 36px", fontSize: 15 }}>
            Create your first project →
          </button>
        </div>
      )}

      {/* Project grid */}
      {!loading && projects.length > 0 && (
        <div className="projects-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {projects.map((p, i) => (
            <div
              key={p.id}
              className={`card fade-up delay-${Math.min(i + 1, 5)}`}
              onClick={() => onSelect(p)}
              style={{ padding: "32px 32px 28px", cursor: "pointer" }}
            >
              <div style={{
                display: "inline-block", padding: "3px 10px",
                background: "#F5F2EE", fontSize: 11, fontWeight: 500,
                letterSpacing: "0.05em", textTransform: "uppercase",
                color: "#8A837C", marginBottom: 18
              }}>
                {p.industry}
              </div>

              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 500, marginBottom: 12, lineHeight: 1.3 }}>
                {p.title}
              </h3>

              <p style={{ fontSize: 13, color: "#8A837C", lineHeight: 1.7, marginBottom: 24, fontWeight: 300 }}>
                {p.description?.slice(0, 100)}{p.description?.length > 100 ? "…" : ""}
              </p>

              <div style={{ display: "flex", gap: 6, alignItems: "center", paddingTop: 16, borderTop: "1px solid #F0EDE8" }}>
                {["vision", "target_market", "business_model", "main_challenges"].map(field => (
                  <div key={field} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: p[field] ? "#C9A96E" : "#E0DBD4"
                  }} title={field} />
                ))}
                <span style={{ fontSize: 11, color: "#B8B0A8", marginLeft: 6 }}>
                  {["vision","target_market","business_model","main_challenges"].filter(f => p[f]).length}/4 profiled
                </span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "#C9A96E", fontWeight: 500 }}>
                  Open →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════════════════
   SCREEN 3 — CREATE + ONBOARDING
════════════════════════════════════════════════════════════════════════════ */
const OnboardingScreen = ({ onDone, onBack }) => {
  const [step, setStep] = useState(1); // 1 = basic, 2 = context
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState(null);

  const [basic, setBasic] = useState({ title: "", industry: "", description: "" });
  const [context, setContext] = useState({
    vision: "", target_market: "", value_proposition: "",
    business_model: "", main_challenges: "", priorities: ""
  });

  const handleBasicSubmit = async () => {
    if (!basic.title || !basic.industry || !basic.description) {
      setError("Please fill in all fields."); return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/projects`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
        body: JSON.stringify(basic)
      });
      const data = await res.json();
      setProjectId(data.id);
      setStep(2);
    } catch { setError("Could not connect to backend. Is it running?"); }
    finally { setLoading(false); }
  };

  const handleContextSubmit = async () => {
    setLoading(true); setError("");
    try {
      const payload = { ...context };
      // Convert comma-separated priorities to array
      if (payload.priorities) {
        payload.priorities = payload.priorities.split(",").map(s => s.trim()).filter(Boolean);
      } else {
        delete payload.priorities;
      }
      // Remove empty fields
      Object.keys(payload).forEach(k => !payload[k] && delete payload[k]);

      await fetch(`${API}/projects/${projectId}/onboarding`, {
        method: "PATCH", headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      onDone(projectId);
    } catch { setError("Failed to save context."); }
    finally { setLoading(false); }
  };

  const stepLabel = ["", "Basic Info", "Project Context"];

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 620 }}>

        {/* Back */}
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#8A837C", fontSize: 13, marginBottom: 32, display: "flex", alignItems: "center", gap: 6
        }}>
          ← Back to projects
        </button>

        {/* Progress */}
        <div className="fade-up" style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                flex: 1, height: 3, background: s <= step ? "#1A1A1A" : "#E0DBD4",
                transition: "background 0.3s"
              }} />
            ))}
          </div>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 8 }}>
            Step {step} of 2
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400 }}>
            {stepLabel[step]}
          </h1>
        </div>

        <div className="card fade-up delay-1" style={{ padding: 36 }}>

          {/* Step 1 */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8A837C", marginBottom: 8 }}>
                  Project Name *
                </label>
                <input className="input-field" placeholder="e.g. Premium Coffee Subscription"
                  value={basic.title} onChange={e => setBasic({ ...basic, title: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8A837C", marginBottom: 8 }}>
                  Industry *
                </label>
                <input className="input-field" placeholder="e.g. Food & Beverage, SaaS, Healthcare..."
                  value={basic.industry} onChange={e => setBasic({ ...basic, industry: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8A837C", marginBottom: 8 }}>
                  What are you building? *
                </label>
                <textarea className="input-field" placeholder="Describe your product or service in a few sentences..."
                  rows={4} style={{ resize: "vertical" }}
                  value={basic.description} onChange={e => setBasic({ ...basic, description: e.target.value })} />
              </div>
              {error && <p style={{ color: "#D94F4F", fontSize: 13 }}>{error}</p>}
              <button className="btn-primary" onClick={handleBasicSubmit} disabled={loading} style={{ width: "100%", padding: 14 }}>
                {loading ? "Creating…" : "Continue →"}
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontSize: 13, color: "#8A837C", lineHeight: 1.6, marginBottom: 4 }}>
                The more context you provide, the more personalized and accurate your AI advice will be. All fields are optional.
              </p>
              {[
                { key: "vision",            label: "Your 3-year vision",      placeholder: "Where do you want this to be in 3 years?" },
                { key: "target_market",     label: "Target Market",           placeholder: "Who is your ideal customer?" },
                { key: "value_proposition", label: "Value Proposition",       placeholder: "What problem do you uniquely solve?" },
                { key: "business_model",    label: "Business Model",          placeholder: "How do you make money?" },
                { key: "main_challenges",   label: "Main Challenges",         placeholder: "What's keeping you up at night?" },
                { key: "priorities",        label: "Top Priorities (comma-separated)", placeholder: "Launch MVP, Get 10 clients, Build brand..." },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8A837C", marginBottom: 8 }}>
                    {label}
                  </label>
                  <input className="input-field" placeholder={placeholder}
                    value={context[key]} onChange={e => setContext({ ...context, [key]: e.target.value })} />
                </div>
              ))}
              {error && <p style={{ color: "#D94F4F", fontSize: 13 }}>{error}</p>}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button className="btn-ghost" onClick={() => onDone(projectId)} style={{ flex: 1, padding: 13 }}>
                  Skip for now
                </button>
                <button className="btn-primary" onClick={handleContextSubmit} disabled={loading} style={{ flex: 2, padding: 13 }}>
                  {loading ? "Saving…" : "Start chatting →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   SCREEN 4 — CHAT
════════════════════════════════════════════════════════════════════════════ */
const ChatScreen = ({ project, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetch(`${API}/projects/${project.id}/messages`, {
          headers: authHeaders()
        });
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          // Restore past conversation
          setMessages(data.map(m => ({
            role: m.role,
            agent: m.agent_type || "strategy",
            text: m.content
          })));
        } else {
          // First time — show welcome message
          setMessages([{
            role: "assistant",
            agent: "strategy",
            text: `Welcome! I'm your MindAll Copilot for **${project.title}**.\n\nAsk me anything — pricing, marketing strategy, competitive landscape, roadmap priorities. I'll route your question to the right specialist and pull live market data to back up my advice.`
          }]);
        }
      } catch {
        setMessages([{
          role: "assistant",
          agent: "strategy",
          text: `Welcome! I'm your MindAll Copilot for **${project.title}**.\n\nAsk me anything — pricing, marketing strategy, competitive landscape, or roadmap priorities.`
        }]);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [project.id]);

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
      const res = await fetch(`${API}/projects/${project.id}/chat`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", agent: data.agent_used, text: data.response }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", agent: "general", text: "Sorry, I couldn't reach the backend. Please make sure it's running." }]);
    } finally { setLoading(false); }
  };

  const suggestions = [
    "How should I price my offer?",
    "Who are my main competitors?",
    "What's my go-to-market strategy?",
    "How do I build brand awareness?",
  ];

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column", background: "#FAFAF8", overflow: "hidden" }}>

      {/* Header */}
      <div className="chat-header" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 5%", borderBottom: "1px solid #E8E4DF",
        background: "#fff", flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
          <button onClick={onBack} style={{
            background: "none", border: "none", cursor: "pointer", flexShrink: 0,
            color: "#8A837C", fontSize: 13, display: "flex", alignItems: "center", gap: 4
          }}>← Back</button>
          <div style={{ width: 1, height: 20, background: "#E8E4DF", flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {project.title}
            </div>
            <div style={{ fontSize: 11, color: "#B8B0A8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {project.industry}
            </div>
          </div>
        </div>
        <div className="chat-header-badges" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <AgentBadge type="marketing" />
          <AgentBadge type="finance" />
          <AgentBadge type="strategy" />
        </div>
      </div>

      {/* Messages — fills all remaining space */}
      <div className="chat-messages" style={{ flex: 1, overflowY: "auto", padding: "32px 5%", minHeight: 0 }}>
        <div style={{ width: "100%", maxWidth: 980, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* History loading skeleton */}
          {loadingHistory && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: i === 2 ? 80 : 48,
                  width: i === 2 ? "65%" : "75%",
                  alignSelf: i === 2 ? "flex-end" : "flex-start",
                  background: "linear-gradient(90deg, #F0EDE8 25%, #FAF8F5 50%, #F0EDE8 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite"
                }} />
              ))}
            </div>
          )}

          {!loadingHistory && messages.map((m, i) => (
            <div key={i} className="fade-in" style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start"
            }}>
              {m.role === "assistant" && (
                <div className="chat-msg-inner" style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: "78%", width: "100%" }}>
                  <AgentBadge type={m.agent} />
                  <div className="card" style={{
                    padding: "20px 24px", fontSize: 14, lineHeight: 1.85,
                    color: "#2A2A2A", fontWeight: 300
                  }}>
                    {renderMarkdown(m.text)}
                  </div>
                </div>
              )}
              {m.role === "user" && (
                <div className="chat-user-bubble" style={{
                  background: "#1A1A1A", color: "#FAFAF8",
                  padding: "14px 20px", maxWidth: "65%",
                  fontSize: 14, lineHeight: 1.7, fontWeight: 300
                }}>
                  {m.text}
                </div>
              )}
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="fade-in" style={{ display: "flex", alignItems: "center", gap: 8, color: "#B8B0A8" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 0.15, 0.3].map((d, i) => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: "50%", background: "#C9A96E",
                    animation: `pulse 1.2s ease-in-out ${d}s infinite`
                  }} />
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
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => setInput(s)} style={{
                background: "#fff", border: "1px solid #E0DBD4",
                padding: "8px 16px", fontSize: 13, cursor: "pointer", color: "#4A4540",
                fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s, background 0.2s"
              }}
                onMouseEnter={e => { e.target.style.borderColor = "#C9A96E"; e.target.style.background = "#FFFAF5"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#E0DBD4"; e.target.style.background = "#fff"; }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="chat-input-bar" style={{
        padding: "16px 5% 20px", borderTop: "1px solid #E8E4DF",
        background: "#fff", flexShrink: 0
      }}>
        <div style={{ width: "100%", maxWidth: 980, margin: "0 auto", display: "flex", gap: 12 }}>
          <input
            className="input-field"
            placeholder="Ask your copilot anything about your business…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={loading}
            style={{ flex: 1, fontSize: 14 }}
          />
          <button
            className="btn-primary"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{ padding: "12px 28px", opacity: loading || !input.trim() ? 0.4 : 1, flexShrink: 0 }}
          >
            Send
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "#C8C2BC", marginTop: 10, letterSpacing: "0.03em" }}>
          Powered by MindAll AI · Routed automatically to Marketing, Finance, or Strategy agent
        </p>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   APP ROUTER
════════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(getUser);  // restore from session
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [openingProject, setOpeningProject] = useState(false);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch(`${API}/projects`, { headers: authHeaders() });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch { setProjects([]); }
    finally { setLoadingProjects(false); }
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setScreen("auth");
    setProjects([]);
  };

  const goToDashboard = () => {
    loadProjects();
    setScreen("dashboard");
  };

  // On mount: if user is already logged in skip auth
  useEffect(() => {
    if (user && getToken()) {
      setScreen("landing");
    } else {
      setScreen("auth");
    }
  }, []);

  return (
    <>
      {screen === "auth" && (
        <AuthScreen onSuccess={u => { setUser(u); setScreen("landing"); }} />
      )}

      {screen === "landing" && (
        <LandingScreen onEnter={goToDashboard} user={user} onLogout={handleLogout} />
      )}

      {screen === "dashboard" && (
        <DashboardScreen
          projects={projects}
          loading={loadingProjects}
          user={user}
          onNew={() => setScreen("onboarding")}
          onSelect={async (p) => {
            setOpeningProject(true);
            try {
              const res = await fetch(`${API}/projects/${p.id}`, { headers: authHeaders() });
              const fresh = await res.json();
              setActiveProject(fresh);
            } catch { setActiveProject(p); }
            finally { setOpeningProject(false); }
            setScreen("chat");
          }}
          openingProject={openingProject}
          onLogout={handleLogout}
        />
      )}

      {screen === "onboarding" && (
        <OnboardingScreen
          onBack={() => setScreen("dashboard")}
          onDone={async (projectId) => {
            await loadProjects();
            try {
              const res = await fetch(`${API}/projects/${projectId}`, { headers: authHeaders() });
              const p = await res.json();
              setActiveProject(p);
            } catch { }
            setScreen("chat");
          }}
        />
      )}

      {screen === "chat" && activeProject && (
        <ChatScreen
          project={activeProject}
          user={user}
          onBack={goToDashboard}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
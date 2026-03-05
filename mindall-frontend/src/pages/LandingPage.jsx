import { useRef } from "react";

export default function LandingPage({ onEnter, onHome, user, onLogout }) {
  const howItWorksRef = useRef(null);

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    { icon: "marketing", title: "Marketing Agent", desc: "Brand strategy, content creation, social media growth, and visibility campaigns." },
    { icon: "finance",   title: "Finance Agent",   desc: "Pricing models, unit economics, monetization strategies backed by live market data." },
    { icon: "strategy",  title: "Strategy Agent",  desc: "Competitive analysis, roadmaps, business model design, and weekly priorities." },
  ];

  const iconColors = {
    marketing: { bg: "#FFF3E8", color: "#C97A2A" },
    finance:   { bg: "#E8F5F0", color: "#2A9A70" },
    strategy:  { bg: "#EEF0FF", color: "#4A5FBF" },
  };

  const steps = [
    {
      num: "01",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      title: "Describe your project",
      desc: "Tell us about your vision, target market, business model, and main challenges. The more context you give, the sharper the advice.",
    },
    {
      num: "02",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
        </svg>
      ),
      title: "The right agent is selected",
      desc: "Our AI orchestrator reads your question and automatically routes it to the Marketing, Finance, or Strategy agent — no configuration needed.",
    },
    {
      num: "03",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
        </svg>
      ),
      title: "Get a personalized answer",
      desc: "Each response combines your project context, live web data, and your full conversation history — so advice gets sharper the more you use it.",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>

      {/* ── Nav ── */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 5%", borderBottom: "1px solid #E8E4DF", background: "#FAFAF8" }}>

        {/* Logo — clickable, goes to home */}
        <div
          onClick={onHome}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22, fontWeight: 500, letterSpacing: "0.02em",
            cursor: "pointer", userSelect: "none",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          title="Go to home"
        >
          Mind<span style={{ color: "#C9A96E" }}>All</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user && <span style={{ fontSize: 13, color: "#8A837C" }}>Hi, {user.name}</span>}
          <button className="btn-primary" onClick={onEnter} style={{ padding: "10px 24px", fontSize: 13 }}>Launch Copilot →</button>
          {user && <button className="btn-ghost" onClick={onLogout} style={{ padding: "9px 16px", fontSize: 13 }}>Sign out</button>}
        </div>
      </nav>

      {/* ── Hero ── */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 5%", width: "100%" }}>
        <div style={{ textAlign: "center" }}>
          <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", border: "1px solid #E0DBD4", fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A837C", marginBottom: 40 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A96E", display: "inline-block" }} />
            AI-Powered Entrepreneur Copilot
          </div>

          <h1 className="fade-up delay-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(48px, 7vw, 80px)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.01em", marginBottom: 28, color: "#1A1A1A" }}>
            Your AI advisor for<br />
            <span style={{ color: "#C9A96E", fontStyle: "italic" }}>every business decision</span>
          </h1>

          <p className="fade-up delay-2" style={{ fontSize: 17, lineHeight: 1.7, color: "#6B6560", maxWidth: 520, margin: "0 auto 48px", fontWeight: 300 }}>
            Three specialized AI agents — Marketing, Finance, Strategy — working together to guide you from idea to execution, every single day.
          </p>

          <div className="fade-up delay-3" style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn-primary" onClick={onEnter} style={{ padding: "14px 36px", fontSize: 15 }}>
              Start your project →
            </button>
            <button className="btn-ghost" onClick={scrollToHowItWorks} style={{ padding: "14px 36px", fontSize: 15 }}>
              See how it works
            </button>
          </div>
        </div>
      </main>

      {/* ── How it works ── */}
      <section ref={howItWorksRef} style={{ background: "#1A1A1A", padding: "80px 5%" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", border: "1px solid #2A2A2A", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 24 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9A96E", display: "inline-block" }} />
              How it works
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, color: "#FFFFFF", lineHeight: 1.2, margin: 0 }}>
              From your question to a<br />
              <span style={{ color: "#C9A96E", fontStyle: "italic" }}>precise, expert answer</span>
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 32, alignItems: "flex-start", padding: "36px 40px", background: i % 2 === 0 ? "#222222" : "#1E1E1E", borderRadius: i === 0 ? "12px 12px 0 0" : i === steps.length - 1 ? "0 0 12px 12px" : "0" }}>

                <div style={{ flexShrink: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 400, color: "#2E2E2E", lineHeight: 1, minWidth: 56, marginTop: -4 }}>
                  {step.num}
                </div>

                <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: "12px", background: "#2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A96E" }}>
                  {step.icon}
                </div>

                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, color: "#FFFFFF", marginBottom: 10 }}>
                    {step.title}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: "#888880", fontWeight: 300, margin: 0, maxWidth: 540 }}>
                    {step.desc}
                  </p>
                </div>

                {i < steps.length - 1 && (
                  <div style={{ flexShrink: 0, marginLeft: "auto", color: "#333330", fontSize: 22, alignSelf: "center" }}>↓</div>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 52 }}>
            <button className="btn-primary" onClick={onEnter} style={{ padding: "14px 40px", fontSize: 15 }}>
              Start for free →
            </button>
            <p style={{ fontSize: 12, color: "#555550", marginTop: 16, letterSpacing: "0.04em" }}>
              No credit card required  ·  Setup in under 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* ── Agent features ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: "1px solid #E8E4DF" }}>
        {features.map((f, i) => (
          <div key={i} className={`fade-up delay-${i + 3}`} style={{ padding: "40px 48px", borderRight: i < 2 ? "1px solid #E8E4DF" : "none" }}>
            <div style={{ width: 48, height: 48, marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", background: iconColors[f.icon].bg, color: iconColors[f.icon].color }}>
              {f.icon === "marketing" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>}
              {f.icon === "finance"   && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
              {f.icon === "strategy"  && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>}
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, marginBottom: 10 }}>{f.title}</div>
            <p style={{ fontSize: 14, color: "#6B6560", lineHeight: 1.7, fontWeight: 300 }}>{f.desc}</p>
          </div>
        ))}
      </section>

    </div>
  );
}
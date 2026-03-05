import { useState } from "react";
import { createProject, updateProjectOnboarding } from "../lib/api";

const INDUSTRIES = [
  "SaaS / Software",
  "E-commerce / Retail",
  "Healthcare / MedTech",
  "FinTech / Finance",
  "EdTech / Education",
  "Food & Beverage",
  "Marketing / Advertising",
  "Consulting / Professional Services",
  "Real Estate / PropTech",
  "Logistics / Supply Chain",
  "AI / Data & Analytics",
  "Media / Content / Entertainment",
  "Travel & Hospitality",
  "Green Tech / Sustainability",
  "Manufacturing / Hardware",
  "Legal / LegalTech",
  "HR / Recruitment",
  "Other",
];

export default function OnboardingPage({ onDone, onBack }) {
  const [step, setStep]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [projectId, setProjectId] = useState(null);
  const [basic, setBasic]         = useState({ title: "", industry: "", description: "" });
  const [context, setContext]     = useState({
    vision: "", target_market: "", value_proposition: "",
    business_model: "", main_challenges: "", priorities: "",
  });

  const handleBasicSubmit = async () => {
    if (!basic.title || !basic.industry || !basic.description) {
      setError("Please fill in all fields."); return;
    }
    setLoading(true); setError("");
    try {
      const data = await createProject(basic);
      setProjectId(data.id);
      setStep(2);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleContextSubmit = async () => {
    setLoading(true); setError("");
    try {
      const payload = { ...context };
      if (payload.priorities) {
        payload.priorities = payload.priorities.split(",").map(s => s.trim()).filter(Boolean);
      } else { delete payload.priorities; }
      Object.keys(payload).forEach(k => !payload[k] && delete payload[k]);
      await updateProjectOnboarding(projectId, payload);
      onDone(projectId);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const contextFields = [
    { key: "vision",            label: "Your 3-year vision",              placeholder: "Where do you want this to be in 3 years?" },
    { key: "target_market",     label: "Target Market",                   placeholder: "Who is your ideal customer?" },
    { key: "value_proposition", label: "Value Proposition",               placeholder: "What problem do you uniquely solve?" },
    { key: "business_model",    label: "Business Model",                  placeholder: "How do you make money?" },
    { key: "main_challenges",   label: "Main Challenges",                 placeholder: "What's keeping you up at night?" },
    { key: "priorities",        label: "Top Priorities (comma-separated)", placeholder: "Launch MVP, Get 10 clients, Build brand..." },
  ];

  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 500,
    letterSpacing: "0.05em", textTransform: "uppercase",
    color: "#8A837C", marginBottom: 8,
  };

  const optionalBadge = (
    <span style={{
      marginLeft: 8, fontSize: 10, fontWeight: 400,
      letterSpacing: "0.03em", textTransform: "none",
      color: "#B8B0A8", background: "#F0EDE8",
      padding: "2px 7px", borderRadius: 4,
    }}>
      optional
    </span>
  );

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 620 }}>

        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A837C", fontSize: 13, marginBottom: 32, display: "flex", alignItems: "center", gap: 6 }}>
          ← Back to projects
        </button>

        <div className="fade-up" style={{ marginBottom: 40 }}>
          {/* Progress bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: 3, background: s <= step ? "#1A1A1A" : "#E0DBD4", transition: "background 0.3s" }} />
            ))}
          </div>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 8 }}>
            Step {step} of 2
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400 }}>
            {step === 1 ? "Basic Info" : "Project Context"}
          </h1>
        </div>

        <div className="card fade-up delay-1" style={{ padding: 36 }}>

          {/* ── Step 1: Basic Info ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Project Name */}
              <div>
                <label style={labelStyle}>Project Name *</label>
                <input
                  className="input-field"
                  placeholder="e.g. Premium Coffee Subscription"
                  value={basic.title}
                  onChange={e => setBasic({ ...basic, title: e.target.value })}
                />
              </div>

              {/* Industry — dropdown */}
              <div>
                <label style={labelStyle}>Industry *</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={basic.industry}
                    onChange={e => setBasic({ ...basic, industry: e.target.value })}
                    style={{
                      width: "100%", appearance: "none", WebkitAppearance: "none",
                      padding: "12px 40px 12px 14px",
                      fontSize: 14, fontFamily: "inherit",
                      border: "1px solid #E0DBD4", borderRadius: 8,
                      background: "#fff", color: basic.industry ? "#1A1A1A" : "#B8B0A8",
                      cursor: "pointer", outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={e => e.target.style.borderColor = "#1A1A1A"}
                    onBlur={e => e.target.style.borderColor = "#E0DBD4"}
                  >
                    <option value="" disabled>Select your industry…</option>
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                  {/* Custom chevron */}
                  <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#8A837C" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>What are you building? *</label>
                <textarea
                  className="input-field"
                  placeholder="Describe your product or service in a few sentences..."
                  rows={4}
                  style={{ resize: "vertical" }}
                  value={basic.description}
                  onChange={e => setBasic({ ...basic, description: e.target.value })}
                />
              </div>

              {error && <p style={{ color: "#D94F4F", fontSize: 13 }}>{error}</p>}
              <button className="btn-primary" onClick={handleBasicSubmit} disabled={loading} style={{ width: "100%", padding: 14 }}>
                {loading ? "Creating…" : "Continue →"}
              </button>
            </div>
          )}

          {/* ── Step 2: Project Context ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontSize: 13, color: "#8A837C", lineHeight: 1.6 }}>
                The more context you provide, the more personalized your AI advice will be. All fields below are optional — you can always fill them in later.
              </p>

              {contextFields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>
                    {label}
                    {optionalBadge}
                  </label>
                  <input
                    className="input-field"
                    placeholder={placeholder}
                    value={context[key]}
                    onChange={e => setContext({ ...context, [key]: e.target.value })}
                  />
                </div>
              ))}

              {error && <p style={{ color: "#D94F4F", fontSize: 13 }}>{error}</p>}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button className="btn-ghost" onClick={() => onDone(projectId)} style={{ flex: 1, padding: 13 }}>Skip for now</button>
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
}
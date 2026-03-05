import { useState } from "react";
import { authLogin, authRegister, setAuth } from "../lib/api";

export default function AuthPage({ onSuccess }) {
  const [mode, setMode]       = useState("login");
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    if (!form.email || !form.password || (mode === "signup" && !form.name)) {
      setError("Please fill in all fields."); return;
    }
    setLoading(true); setError("");
    try {
      const data = mode === "signup"
        ? await authRegister(form.name, form.email, form.password)
        : await authLogin(form.email, form.password);
      setAuth(data.access_token, data.user);
      onSuccess(data.user);
    } catch (e) {
      setError(e.message || "Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        <div className="fade-up" style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 500, letterSpacing: "0.02em", marginBottom: 8 }}>
            Mind<span style={{ color: "#C9A96E" }}>All</span>
          </div>
          <p style={{ fontSize: 14, color: "#8A837C", fontWeight: 300 }}>Your AI-powered entrepreneur copilot</p>
        </div>

        <div className="card fade-up delay-1" style={{ padding: "40px 40px" }}>

          {/* Tab switcher */}
          <div style={{ display: "flex", borderBottom: "2px solid #F0EDE8", marginBottom: 32 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, padding: "10px 0", background: "none", border: "none",
                cursor: "pointer", fontSize: 14, fontWeight: mode === m ? 500 : 400,
                color: mode === m ? "#1A1A1A" : "#B8B0A8",
                borderBottom: mode === m ? "2px solid #C9A96E" : "2px solid transparent",
                fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em",
                transition: "all 0.2s", marginBottom: -2, textTransform: "capitalize"
              }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {mode === "signup" && (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8A837C", marginBottom: 8 }}>Full Name</label>
                <input className="input-field" placeholder="Your name"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8A837C", marginBottom: 8 }}>Email</label>
              <input className="input-field" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8A837C", marginBottom: 8 }}>Password</label>
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
}
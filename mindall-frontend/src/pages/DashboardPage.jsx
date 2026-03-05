export default function DashboardPage({ projects, loading, user, onLogout, onNew, onSelect, openingProject, onHome }) {
  const PROFILE_FIELDS = ["vision", "target_market", "business_model", "main_challenges"];

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#FAFAF8", display: "flex", flexDirection: "column", position: "relative" }}>

      {/* Opening overlay */}
      {openingProject && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(250,250,248,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 50, backdropFilter: "blur(4px)" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[0, 0.15, 0.3].map((d, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#C9A96E", animation: `pulse 1.2s ease-in-out ${d}s infinite` }} />
            ))}
          </div>
          <p style={{ fontSize: 14, color: "#8A837C", fontFamily: "'DM Sans', sans-serif" }}>Opening project…</p>
        </div>
      )}

      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 5%", borderBottom: "1px solid #E8E4DF", background: "#fff" }}>
        <div
          onClick={onHome}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, cursor: "pointer", userSelect: "none", transition: "opacity 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          title="Go to home"
        >
          Mind<span style={{ color: "#C9A96E" }}>All</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user && <span style={{ fontSize: 13, color: "#8A837C" }}>Hi, {user.name}</span>}
          <button className="btn-primary" onClick={onNew} style={{ padding: "10px 24px", fontSize: 13 }}>+ New Project</button>
          {user && <button className="btn-ghost" onClick={onLogout} style={{ padding: "9px 16px", fontSize: 13 }}>Sign out</button>}
        </div>
      </nav>

      <div className="dashboard-body" style={{ flex: 1, width: "100%", padding: "48px 5%" }}>

        <div className="fade-up" style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 10 }}>Your workspace</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 400, lineHeight: 1 }}>Projects</h1>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 80, color: "#B8B0A8", fontSize: 14 }}>Loading projects…</div>
        )}

        {!loading && projects.length === 0 && (
          <div className="fade-in" style={{ width: "100%", border: "1px dashed #D8D3CC", padding: "100px 48px", textAlign: "center", background: "#fff" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F5F2EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 28px" }}>🚀</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400, marginBottom: 14 }}>No projects yet</h2>
            <p style={{ color: "#8A837C", fontSize: 15, fontWeight: 300, maxWidth: 400, margin: "0 auto 36px", lineHeight: 1.7 }}>
              Create your first project and let your AI copilot guide you from idea to execution.
            </p>
            <button className="btn-primary" onClick={onNew} style={{ padding: "14px 36px", fontSize: 15 }}>Create your first project →</button>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="projects-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {projects.map((p, i) => (
              <div key={p.id} className={`card fade-up delay-${Math.min(i + 1, 5)}`} onClick={() => onSelect(p)} style={{ padding: "32px 32px 28px", cursor: "pointer" }}>
                <div style={{ display: "inline-block", padding: "3px 10px", background: "#F5F2EE", fontSize: 11, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8A837C", marginBottom: 18 }}>
                  {p.industry}
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 500, marginBottom: 12, lineHeight: 1.3 }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: "#8A837C", lineHeight: 1.7, marginBottom: 24, fontWeight: 300 }}>
                  {p.description?.slice(0, 100)}{p.description?.length > 100 ? "…" : ""}
                </p>
                <div style={{ display: "flex", gap: 6, alignItems: "center", paddingTop: 16, borderTop: "1px solid #F0EDE8" }}>
                  {PROFILE_FIELDS.map(field => (
                    <div key={field} style={{ width: 7, height: 7, borderRadius: "50%", background: p[field] ? "#C9A96E" : "#E0DBD4" }} title={field} />
                  ))}
                  <span style={{ fontSize: 11, color: "#B8B0A8", marginLeft: 6 }}>
                    {PROFILE_FIELDS.filter(f => p[f]).length}/4 profiled
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 12, color: "#C9A96E", fontWeight: 500 }}>Open →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { getUser, getToken, clearAuth, fetchProjects, fetchProject, authHeaders } from "./lib/api";
import AuthPage       from "./pages/AuthPage";
import LandingPage    from "./pages/LandingPage";
import DashboardPage  from "./pages/DashboardPage";
import OnboardingPage from "./pages/OnboardingPage";
import ChatPage       from "./pages/ChatPage";

export default function App() {
  const [screen, setScreen]               = useState("auth");
  const [user, setUser]                   = useState(getUser);
  const [projects, setProjects]           = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [openingProject, setOpeningProject] = useState(false);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const data = await fetchProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e.message === "UNAUTHORIZED") handleLogout();
      else setProjects([]);
    } finally { setLoadingProjects(false); }
  };

  const handleLogout = () => {
    clearAuth(); setUser(null); setProjects([]); setScreen("auth");
  };

  const goToDashboard = () => { loadProjects(); setScreen("dashboard"); };

  const handleSelectProject = async (p) => {
    setOpeningProject(true);
    try {
      const fresh = await fetchProject(p.id);
      setActiveProject(fresh);
    } catch { setActiveProject(p); }
    finally { setOpeningProject(false); }
    setScreen("chat");
  };

  // On mount: restore session if token exists
  useEffect(() => {
    if (user && getToken()) setScreen("landing");
    else setScreen("auth");
  }, []);

  return (
    <>
      {screen === "auth" && (
        <AuthPage onSuccess={u => { setUser(u); setScreen("landing"); }} />
      )}
      {screen === "landing" && (
        <LandingPage onEnter={goToDashboard} onHome={() => setScreen("landing")} user={user} onLogout={handleLogout} />
      )}
      {screen === "dashboard" && (
        <DashboardPage
          projects={projects} loading={loadingProjects}
          user={user} onLogout={handleLogout}
          onNew={() => setScreen("onboarding")}
          onSelect={handleSelectProject}
          openingProject={openingProject}
          onHome={() => setScreen("landing")}
        />
      )}
      {screen === "onboarding" && (
        <OnboardingPage
          onBack={() => setScreen("dashboard")}
          onDone={async (projectId) => {
            await loadProjects();
            try { setActiveProject(await fetchProject(projectId)); } catch {}
            setScreen("chat");
          }}
        />
      )}
      {screen === "chat" && activeProject && (
        <ChatPage project={activeProject} onBack={goToDashboard} onHome={() => setScreen("landing")} />
      )}
    </>
  );
}
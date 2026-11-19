import "./css/index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { LocalizationProvider } from "./contexts/LocalizationContext";
import { useLocalization } from "./contexts/LocalizationContext";
import Home from "./pages/Home";
import SnippetList from "./pages/SnippetList";
import Snippet from "./pages/Snippet";
import Review from "./pages/Review";
import Quiz from "./pages/Quiz";
import Settings from "./pages/Settings";

function AppContent() {
  const { t } = useLocalization();
  const { user, loading: authLoading, error: authError, isConfigured, signInWithGoogle, signOut } = useAuth();

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p>{t.common.loading}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 420, width: "100%" }}>
          <h1>LangLearn</h1>
          <p style={{ marginBottom: 24 }}>
            Sign in with your Google account to save snippets and track your learning progress.
          </p>
          {!isConfigured ? (
            <p style={{ color: "red" }}>
              Firebase is not configured. Set <code>VITE_FIREBASE_API_KEY</code>,{" "}
              <code>VITE_FIREBASE_AUTH_DOMAIN</code>, and{" "}
              <code>VITE_FIREBASE_PROJECT_ID</code> in your <code>.env</code> file.
            </p>
          ) : (
            <button onClick={signInWithGoogle} style={{ width: "100%" }}>
              Sign in with Google
            </button>
          )}
          {authError && (
            <p style={{ color: "red", marginTop: 16 }}>{authError}</p>
          )}
        </div>
      </div>
    );
  }
  
  // Sidebar component (local)
  const Sidebar: React.FC = () => {
    const activeClass = ({ isActive }: { isActive: boolean }) =>
      "nav-link" + (isActive ? " active" : "");
    return (
      <aside className="app-sidebar">
        <div>
          <div className="app-sidebar-brand">LangLearn</div>
          <nav className="app-nav">
            <NavLink to="/" className={activeClass} end>
              {t.nav.home}
            </NavLink>
            <NavLink to="/snippets" className={activeClass}>
              {t.nav.snippets}
            </NavLink>
            <NavLink to="/review" className={activeClass}>
              {t.nav.learn}
            </NavLink>
            <NavLink to="/quiz" className={activeClass}>
              {t.nav.quiz}
            </NavLink>
            <NavLink to="/settings" className={activeClass}>
              {t.nav.settings}
            </NavLink>
          </nav>
        </div>

        <div className="app-sidebar-footer">
          <div className="app-sidebar-user">
            {user.displayName || user.email}
          </div>
          <button
            onClick={signOut}
            className="secondary outline"
            style={{ width: "100%", padding: "6px 12px", fontSize: "0.85em" }}
          >
            Sign out
          </button>
        </div>
      </aside>
    );
  };

  // Layout: sidebar + content area
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/snippets" element={<SnippetList />} />
            <Route path="/snippets/:id" element={<Snippet />} />
            <Route path="/review" element={<Review />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <LocalizationProvider>
          <AppContent />
        </LocalizationProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;

// render merged entry (replaces client/main.tsx)
const rootEl = document.getElementById("root") as HTMLElement;
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

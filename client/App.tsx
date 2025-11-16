import "./css/index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { SettingsProvider } from "./contexts/SettingsContext";
import { LocalizationProvider } from "./contexts/LocalizationContext";
import { useLocalization } from "./contexts/LocalizationContext";
import Home from "./pages/Home";
import SnippetList from "./pages/SnippetList";
import Snippet from "./pages/Snippet";
import Learn from "./pages/Learn";
import Quiz from "./pages/Quiz";
import Settings from "./pages/Settings";

function AppContent() {
  const { t } = useLocalization();
  
  // Sidebar component (local)
  const Sidebar: React.FC = () => {
    const activeClass = ({ isActive }: { isActive: boolean }) =>
      "nav-link" + (isActive ? " active" : "");
    return (
      <aside style={{ width: 220, padding: 16, borderRight: "1px solid #eee" }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>LangLearn</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <NavLink to="/" className={activeClass} end>
            {t.nav.home}
          </NavLink>
          <NavLink to="/snippets" className={activeClass}>
            {t.nav.snippets}
          </NavLink>
          <NavLink to="/learn" className={activeClass}>
            {t.nav.learn}
          </NavLink>
          <NavLink to="/quiz" className={activeClass}>
            {t.nav.quiz}
          </NavLink>
          <NavLink to="/settings" className={activeClass}>
            {t.nav.settings}
          </NavLink>
        </nav>
      </aside>
    );
  };

  // Layout: sidebar + content area
  return (
    <BrowserRouter>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 24 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/snippets" element={<SnippetList />} />
            <Route path="/snippets/:id" element={<Snippet />} />
            <Route path="/learn" element={<Learn />} />
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
    <SettingsProvider>
      <LocalizationProvider>
        <AppContent />
      </LocalizationProvider>
    </SettingsProvider>
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

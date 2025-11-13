import "./css/index.css";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Snippets from "./pages/Snippets";
import Learn from "./pages/Learn";
import Settings from "./pages/Settings";

function App() {
  // Sidebar component (local)
  const Sidebar: React.FC = () => {
    const activeClass = ({ isActive }: { isActive: boolean }) =>
      "nav-link" + (isActive ? " active" : "");
    return (
      <aside style={{ width: 220, padding: 16, borderRight: "1px solid #eee" }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>LangLearn</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <NavLink to="/" className={activeClass} end>
            Home
          </NavLink>
          <NavLink to="/snippets" className={activeClass}>
            Snippets
          </NavLink>
          <NavLink to="/learn" className={activeClass}>
            Learn
          </NavLink>
          <NavLink to="/settings" className={activeClass}>
            Settings
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
            <Route path="/snippets" element={<Snippets />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
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

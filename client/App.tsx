import "./css/index.css";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
// removed ItemCard import (moved to Home page)
import ItemPage from "./pages/ItemPage";
// new imports for pages
import Home from "./pages/Home";
import Snippets from "./pages/Snippets";
import Learn from "./pages/Learn";
import Settings from "./pages/Settings";

function App() {
  const [count, setCount] = useState(0);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // new form state
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<string>("");

  // items list state
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/hello");
        // try JSON first, fall back to text
        const contentType = res.headers.get("content-type") || "";
        let data: any;
        if (contentType.includes("application/json")) {
          data = await res.json();
          data = data?.message ?? JSON.stringify(data);
        } else {
          data = await res.text();
        }
        if (mounted) setServerMsg(String(data));
      } catch (err: any) {
        if (mounted) setError(err?.message ?? "Fetch error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const writeDB = async () => {
    setLoading(true);
    setError(null);

    try {
      const body = {
        name,
        quantity: Number(quantity) || 0,
      };

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message ?? `Server returned ${res.status}`);
      }

      const created = await res.json();
      setServerMsg(`Created item: ${created.name} (id: ${created._id ?? "n/a"})`);
      // clear form
      setName("");
      setQuantity("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/items");
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  // new: delete an item by id
  const deleteItem = async (id?: string) => {
    if (!id) {
      setError("Missing item id");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message ?? `Server returned ${res.status}`);
      }
      setServerMsg(`Deleted item: ${id}`);
      setItems((prev) => prev.filter((it) => it._id !== id));
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

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
            <Route
              path="/"
              element={
                <Home
                  count={count}
                  onIncrement={() => setCount((c) => c + 1)}
                  serverMsg={serverMsg}
                  loading={loading}
                  error={error}
                  name={name}
                  setName={setName}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  writeDB={writeDB}
                  fetchItems={fetchItems}
                  items={items}
                />
              }
            />
            <Route path="/snippets" element={<Snippets />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/items/:id" element={<ItemPage />} />
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

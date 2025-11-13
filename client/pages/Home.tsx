import React from "react";
import ItemCard from "../components/ItemCard";

type Props = {
  count: number;
  onIncrement: () => void;
  serverMsg: string | null;
  loading: boolean;
  error: string | null;
  name: string;
  setName: (v: string) => void;
  quantity: string;
  setQuantity: (v: string) => void;
  writeDB: () => Promise<void>;
  fetchItems: () => Promise<void>;
  items: any[];
};

export default function Home({
  count,
  onIncrement,
  serverMsg,
  loading,
  error,
  name,
  setName,
  quantity,
  setQuantity,
  writeDB,
  fetchItems,
  items,
}: Props) {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noreferrer">
          <img src="react.svg" className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={onIncrement}>count is {count}</button>

        <div style={{ marginTop: 16 }}>
          {loading && <p>Loading server message...</p>}
          {error && <p style={{ color: "red" }}>Error: {error}</p>}
          {!loading && !error && (
            <p>
              Server says: <strong>{serverMsg ?? "no message"}</strong>
            </p>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <div>
            <label>
              Name:{" "}
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" />
            </label>
          </div>
          <div style={{ marginTop: 8 }}>
            <label>
              Quantity:{" "}
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
            </label>
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={writeDB} disabled={loading || !name}>
              Add item
            </button>
            <button onClick={fetchItems} style={{ marginLeft: 8 }} disabled={loading}>
              Load items
            </button>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          {items.length === 0 ? (
            <p>No items loaded</p>
          ) : (
            <div>
              {items.map((it) => (
                <ItemCard key={it._id ?? `${it.name}-${it.quantity}`} item={it} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
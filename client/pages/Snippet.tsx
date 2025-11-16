import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { ISnippet } from "../../server/models/Snippet.js";
import SnippetCard from "../components/SnippetCard";

type SnippetType = Omit<ISnippet, keyof Document> & { _id?: string };

export default function Snippet() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState<SnippetType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSnippet(id);
    }
  }, [id]);

  const fetchSnippet = async (snippetId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/snippets/${snippetId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Snippet not found");
        }
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      setSnippet(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load snippet");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (snippetId?: string) => {
    if (!snippetId) return;
    
    if (!confirm("Are you sure you want to delete this snippet?")) {
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/snippets/${snippetId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      // Navigate back to snippets list after successful deletion
      navigate("/snippets");
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete snippet");
      setDeleting(false);
    }
  };

  const handleClose = () => {
    navigate("/snippets");
  };

  if (loading) {
    return (
      <section>
        <div style={{ marginBottom: 24 }}>
          <button onClick={handleClose} style={{ padding: "8px 16px" }}>
            ← Back to Snippets
          </button>
        </div>
        <p>Loading snippet...</p>
      </section>
    );
  }

  if (error || !snippet) {
    return (
      <section>
        <div style={{ marginBottom: 24 }}>
          <button onClick={handleClose} style={{ padding: "8px 16px" }}>
            ← Back to Snippets
          </button>
        </div>
        <div style={{ padding: 12, marginBottom: 16, background: "#fee", border: "1px solid #fcc", borderRadius: 6, color: "#c00" }}>
          {error || "Snippet not found"}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button onClick={handleClose} style={{ padding: "8px 16px", fontSize: 14 }}>
          ← Back to Snippets
        </button>
        <h1 style={{ margin: 0, flex: 1, textAlign: "center" }}>Snippet Details</h1>
        <div style={{ width: 120 }} /> {/* Spacer for centering */}
      </div>

      {error && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fee", border: "1px solid #fcc", borderRadius: 6, color: "#c00" }}>
          {error}
        </div>
      )}

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <SnippetCard 
          snippet={snippet} 
          onDelete={handleDelete}
          saving={deleting}
          showDetails={true}
        />
      </div>
    </section>
  );
}
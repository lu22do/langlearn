import React, { useState, useEffect } from "react";
import { LANGUAGES } from "../../shared/constants/languages";

interface SettingsData {
  _id?: string;
  baseLanguageCode: string;
  UILanguageCode: string;
  learningLanguageCode: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    baseLanguageCode: "en",
    UILanguageCode: "en",
    learningLanguageCode: "de",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setSettings(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message ?? `Server returned ${res.status}`);
      }

      const updated = await res.json();
      setSettings(updated);
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message ?? "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SettingsData, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <section>
        <h1>Settings</h1>
        <p>Loading settings...</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Settings</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Configure your language preferences and learning settings.
      </p>

      {error && (
        <div style={{ padding: 12, marginBottom: 16, background: "#fee", border: "1px solid #fcc", borderRadius: 6, color: "#c00" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: 12, marginBottom: 16, background: "#efe", border: "1px solid #cfc", borderRadius: 6, color: "#060" }}>
          {success}
        </div>
      )}

      <div style={{ maxWidth: 600, background: "#fff", padding: 24, borderRadius: 8, border: "1px solid #e5e7eb" }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
            Learning Language
          </label>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
            The language you want to learn
          </p>
          <select
            value={settings.learningLanguageCode}
            onChange={(e) => handleChange("learningLanguageCode", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: 14,
              border: "1px solid #d1d5db",
              borderRadius: 6,
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
            Base Language
          </label>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
            Your native language (used for translations)
          </p>
          <select
            value={settings.baseLanguageCode}
            onChange={(e) => handleChange("baseLanguageCode", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: 14,
              border: "1px solid #d1d5db",
              borderRadius: 6,
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
            UI Language
          </label>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
            Language for the app interface
          </p>
          <select
            value={settings.UILanguageCode}
            onChange={(e) => handleChange("UILanguageCode", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: 14,
              border: "1px solid #d1d5db",
              borderRadius: 6,
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          <button
            onClick={fetchSettings}
            disabled={saving}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              background: "#f3f4f6",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={{ marginTop: 32, padding: 16, background: "#f0f9ff", border: "1px solid #bfdbfe", borderRadius: 6 }}>
        <h3 style={{ marginTop: 0, fontSize: 14, fontWeight: 600 }}>Current Settings</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
          <li>Learning: <strong>{LANGUAGES.find(l => l.code === settings.learningLanguageCode)?.name}</strong></li>
          <li>Base: <strong>{LANGUAGES.find(l => l.code === settings.baseLanguageCode)?.name}</strong></li>
          <li>UI: <strong>{LANGUAGES.find(l => l.code === settings.UILanguageCode)?.name}</strong></li>
        </ul>
      </div>
    </section>
  );
}
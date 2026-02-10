import { useEffect, useState } from "react";

export default function SettingsPanel({ settings, onSave, onLogout }) {
  const [form, setForm] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    await onSave(form);
    setIsSaving(false);
  }

  return (
    <section className="card settings">
      <h2>Settings</h2>
      <form className="grid-form" onSubmit={handleSubmit}>
        <label>
          Display Name
          <input value={form.name || ""} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        </label>

        <label>
          Bio
          <textarea value={form.bio || ""} onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))} />
        </label>

        <label>
          Campus
          <input value={form.campus || ""} onChange={(event) => setForm((prev) => ({ ...prev, campus: event.target.value }))} />
        </label>

        <label>
          Theme Accent
          <input type="color" value={form.avatarColor || "#6366f1"} onChange={(event) => setForm((prev) => ({ ...prev, avatarColor: event.target.value }))} />
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={Boolean(form.notifyByEmail)}
            onChange={(event) => setForm((prev) => ({ ...prev, notifyByEmail: event.target.checked }))}
          />
          Email notifications
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={Boolean(form.showOnlineStatus)}
            onChange={(event) => setForm((prev) => ({ ...prev, showOnlineStatus: event.target.checked }))}
          />
          Show online status
        </label>

        <div className="row two">
          <button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save settings"}</button>
          <button type="button" className="danger" onClick={onLogout}>Logout</button>
        </div>
      </form>
    </section>
  );
}

import { useState } from "react";

export default function ChatPanel({ messages, onSend }) {
  const [draft, setDraft] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const message = draft.trim();
    if (!message) {
      return;
    }

    await onSend(message);
    setDraft("");
  }

  return (
    <aside className="card chat">
      <h2>Student Chat</h2>
      <div className="chat-log">
        {messages.map((message) => (
          <p key={message.id}>
            <strong>{message.authorEmail}</strong>: {message.message}
          </p>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Send a message"
        />
        <button type="submit">Send</button>
      </form>
    </aside>
  );
}

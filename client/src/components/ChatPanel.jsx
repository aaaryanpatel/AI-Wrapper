import { useMemo, useState } from "react";

export default function ChatPanel({ currentUser, users, conversations, messages, activeConversation, onStartConversation, onSelectConversation, onSendMessage }) {
  const [draft, setDraft] = useState("");

  const activePartner = useMemo(() => {
    if (!activeConversation) {
      return null;
    }

    return activeConversation.participants.find((participant) => participant !== currentUser.email);
  }, [activeConversation, currentUser.email]);

  return (
    <section className="card dm-layout">
      <aside className="dm-sidebar">
        <h2>Messages</h2>
        <p className="muted">Instagram-style DMs for campus buyers & sellers.</p>

        <div className="user-list">
          {users.map((user) => (
            <button key={user._id} className="user-chip" onClick={() => onStartConversation(user.email)}>
              <span>{user.name}</span>
              <small>{user.email}</small>
            </button>
          ))}
        </div>

        <div className="conversation-list">
          {conversations.map((conversation) => {
            const partner = conversation.participants.find((participant) => participant !== currentUser.email);
            const isActive = activeConversation?._id === conversation._id;

            return (
              <button
                key={conversation._id}
                className={`conversation-item ${isActive ? "active" : ""}`}
                onClick={() => onSelectConversation(conversation)}
              >
                <strong>{partner}</strong>
                <small>{conversation.lastMessage || "No messages yet"}</small>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="dm-main">
        <header className="row between">
          <h3>{activePartner ? `Chat with ${activePartner}` : "Choose a conversation"}</h3>
        </header>

        <div className="chat-log">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`message-bubble ${message.senderEmail === currentUser.email ? "mine" : "theirs"}`}
            >
              <p>{message.text}</p>
              <small>{new Date(message.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>

        <form
          className="row"
          onSubmit={async (event) => {
            event.preventDefault();
            const text = draft.trim();
            if (!activeConversation || !text) {
              return;
            }
            await onSendMessage(activeConversation._id, text);
            setDraft("");
          }}
        >
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type a message" />
          <button type="submit">Send</button>
        </form>
      </div>
    </section>
  );
}

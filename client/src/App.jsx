import { useEffect, useMemo, useState } from "react";
import ChatPanel from "./components/ChatPanel";
import LoginGate from "./components/LoginGate";
import PostComposer from "./components/PostComposer";
import PostFeed from "./components/PostFeed";
import SettingsPanel from "./components/SettingsPanel";
import { api, setAuthToken } from "./hooks/useApi";

const TABS = {
  MARKETPLACE: "marketplace",
  MESSAGES: "messages",
  SETTINGS: "settings"
};

export default function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [settings, setSettings] = useState({});
  const [error, setError] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.MARKETPLACE);

  const appTitle = useMemo(() => {
    if (activeTab === TABS.MESSAGES) {
      return "Direct Messages";
    }

    if (activeTab === TABS.SETTINGS) {
      return "Account Settings";
    }

    return "Marketplace";
  }, [activeTab]);

  useEffect(() => {
    async function restoreSession() {
      try {
        const token = localStorage.getItem("studentmarket-token");
        if (!token) {
          return;
        }

        setAuthToken(token);
        const { user: me } = await api.me();
        setUser(me);
      } catch (_error) {
        setAuthToken("");
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    async function loadInitialData() {
      try {
        const [postResponse, usersResponse, conversationsResponse, settingsResponse] = await Promise.all([
          api.getPosts(),
          api.getUsers(),
          api.getConversations(),
          api.getSettings()
        ]);

        setPosts(postResponse.posts);
        setUsers(usersResponse.users);
        setConversations(conversationsResponse.conversations);
        setSettings(settingsResponse.settings);
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadInitialData();
  }, [user]);

  async function handleCreatePost(form) {
    setError("");
    setIsSubmittingPost(true);

    try {
      const { post } = await api.createPost(form);
      setPosts((previous) => [post, ...previous]);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmittingPost(false);
    }
  }

  async function handleComment(postId, message) {
    try {
      const { comment } = await api.addComment(postId, { message });
      setPosts((previous) =>
        previous.map((post) =>
          post._id === postId ? { ...post, comments: [...post.comments, comment] } : post
        )
      );
    } catch (commentError) {
      setError(commentError.message);
    }
  }

  async function handleLike(postId) {
    try {
      const { post: updatedPost } = await api.likePost(postId);
      setPosts((previous) => previous.map((post) => (post._id === postId ? updatedPost : post)));
    } catch (likeError) {
      setError(likeError.message);
    }
  }

  async function handleStartConversation(recipientEmail) {
    try {
      const { conversation } = await api.createConversation({ recipientEmail });
      setConversations((previous) => {
        const existing = previous.find((item) => item._id === conversation._id);
        if (existing) {
          return previous;
        }

        return [conversation, ...previous];
      });
      await handleSelectConversation(conversation);
      setActiveTab(TABS.MESSAGES);
    } catch (conversationError) {
      setError(conversationError.message);
    }
  }

  async function handleSelectConversation(conversation) {
    try {
      setActiveConversation(conversation);
      const { messages: loadedMessages } = await api.getConversationMessages(conversation._id);
      setMessages(loadedMessages);
    } catch (selectionError) {
      setError(selectionError.message);
    }
  }

  async function handleSendMessage(conversationId, text) {
    try {
      const { message } = await api.sendConversationMessage(conversationId, { text });
      setMessages((previous) => [...previous, message]);
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation._id === conversationId
            ? { ...conversation, lastMessage: message.text, lastMessageAt: message.createdAt }
            : conversation
        )
      );
    } catch (sendError) {
      setError(sendError.message);
    }
  }

  async function handleSaveSettings(updatedSettings) {
    try {
      const { settings: saved } = await api.updateSettings(updatedSettings);
      setSettings(saved);
      setUser(saved);
    } catch (settingsError) {
      setError(settingsError.message);
    }
  }

  async function handleLogout() {
    try {
      await api.logout();
    } catch (_error) {
      // ignore
    }

    setAuthToken("");
    setUser(null);
    setPosts([]);
    setConversations([]);
    setMessages([]);
    setSettings({});
  }

  if (!user) {
    return <LoginGate onLogin={setUser} />;
  }

  return (
    <main className="app-shell">
      <header className="topbar glass">
        <div>
          <h1>StudentMarket</h1>
          <p>{appTitle} · Welcome back {user.name}</p>
        </div>
        <nav className="tabs">
          <button className={activeTab === TABS.MARKETPLACE ? "active" : ""} onClick={() => setActiveTab(TABS.MARKETPLACE)}>Marketplace</button>
          <button className={activeTab === TABS.MESSAGES ? "active" : ""} onClick={() => setActiveTab(TABS.MESSAGES)}>Messages</button>
          <button className={activeTab === TABS.SETTINGS ? "active" : ""} onClick={() => setActiveTab(TABS.SETTINGS)}>Settings</button>
        </nav>
      </header>

      {error ? <p className="error card">{error}</p> : null}

      {activeTab === TABS.MARKETPLACE ? (
        <div className="stack">
          <PostComposer onCreatePost={handleCreatePost} isSubmitting={isSubmittingPost} />
          <PostFeed posts={posts} onComment={handleComment} onLike={handleLike} />
        </div>
      ) : null}

      {activeTab === TABS.MESSAGES ? (
        <ChatPanel
          currentUser={user}
          users={users}
          conversations={conversations}
          messages={messages}
          activeConversation={activeConversation}
          onStartConversation={handleStartConversation}
          onSelectConversation={handleSelectConversation}
          onSendMessage={handleSendMessage}
        />
      ) : null}

      {activeTab === TABS.SETTINGS ? (
        <SettingsPanel settings={settings} onSave={handleSaveSettings} onLogout={handleLogout} />
      ) : null}
    </main>
  );
}

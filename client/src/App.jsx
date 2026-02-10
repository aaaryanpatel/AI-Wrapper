import { useEffect, useState } from "react";
import ChatPanel from "./components/ChatPanel";
import LoginGate from "./components/LoginGate";
import PostComposer from "./components/PostComposer";
import PostFeed from "./components/PostFeed";
import { api } from "./hooks/useApi";

export default function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    async function loadInitialData() {
      try {
        const [postResponse, chatResponse] = await Promise.all([api.getPosts(), api.getChat()]);
        setPosts(postResponse.posts);
        setMessages(chatResponse.messages);
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
      const { post } = await api.createPost({ ...form, sellerEmail: user.email });
      setPosts((previous) => [post, ...previous]);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmittingPost(false);
    }
  }

  async function handleComment(postId, message) {
    try {
      const { comment } = await api.addComment(postId, {
        authorEmail: user.email,
        message
      });
      setPosts((previous) =>
        previous.map((post) =>
          post.id === postId ? { ...post, comments: [...post.comments, comment] } : post
        )
      );
    } catch (commentError) {
      setError(commentError.message);
    }
  }

  async function handleSendChat(message) {
    try {
      const { message: created } = await api.sendChatMessage({
        authorEmail: user.email,
        message
      });
      setMessages((previous) => [...previous, created]);
    } catch (chatError) {
      setError(chatError.message);
    }
  }

  if (!user) {
    return <LoginGate onLogin={setUser} />;
  }

  return (
    <main className="layout">
      <header className="card">
        <h1>StudentMarket</h1>
        <p>Welcome, {user.name} ({user.email})</p>
        <p>Exclusive marketplace for @saskpolytech.ca students.</p>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <PostComposer onCreatePost={handleCreatePost} isSubmitting={isSubmittingPost} />
      <PostFeed posts={posts} userEmail={user.email} onComment={handleComment} />
      <ChatPanel messages={messages} onSend={handleSendChat} />
    </main>
  );
}

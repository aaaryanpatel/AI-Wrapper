const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

let authToken = localStorage.getItem("studentmarket-token") ?? "";

export function setAuthToken(token) {
  authToken = token || "";
  if (authToken) {
    localStorage.setItem("studentmarket-token", authToken);
  } else {
    localStorage.removeItem("studentmarket-token");
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers ?? {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? "Something went wrong.");
  }

  return payload;
}

export const api = {
  login(data) {
    return request("/api/auth/login", { method: "POST", body: JSON.stringify(data) });
  },
  logout() {
    return request("/api/auth/logout", { method: "POST" });
  },
  me() {
    return request("/api/me");
  },
  getPosts() {
    return request("/api/posts");
  },
  createPost(data) {
    return request("/api/posts", { method: "POST", body: JSON.stringify(data) });
  },
  addComment(postId, data) {
    return request(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  likePost(postId) {
    return request(`/api/posts/${postId}/like`, { method: "PUT" });
  },
  getUsers() {
    return request("/api/users");
  },
  getConversations() {
    return request("/api/messages/conversations");
  },
  createConversation(data) {
    return request("/api/messages/conversations", { method: "POST", body: JSON.stringify(data) });
  },
  getConversationMessages(conversationId) {
    return request(`/api/messages/conversations/${conversationId}`);
  },
  sendConversationMessage(conversationId, data) {
    return request(`/api/messages/conversations/${conversationId}`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  getSettings() {
    return request("/api/settings");
  },
  updateSettings(data) {
    return request("/api/settings", { method: "PUT", body: JSON.stringify(data) });
  }
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Something went wrong.");
  }

  return payload;
}

export const api = {
  login(data) {
    return request("/api/auth/login", { method: "POST", body: JSON.stringify(data) });
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
  getChat() {
    return request("/api/chat");
  },
  sendChatMessage(data) {
    return request("/api/chat", { method: "POST", body: JSON.stringify(data) });
  }
};

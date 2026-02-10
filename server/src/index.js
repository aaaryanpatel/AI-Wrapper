import cors from "cors";
import express from "express";
import { nanoid } from "nanoid";
import { isAllowedCollegeEmail, store, ALLOWED_DOMAIN } from "./data.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", (req, res) => {
  const { email, name } = req.body ?? {};

  if (!isAllowedCollegeEmail(email)) {
    return res.status(400).json({
      error: `Only college/university emails ending in ${ALLOWED_DOMAIN} can join this MVP.`
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = {
    email: normalizedEmail,
    name: name?.trim() || normalizedEmail.split("@")[0],
    joinedAt: new Date().toISOString()
  };

  store.users.set(normalizedEmail, user);

  return res.json({ user });
});

app.get("/api/posts", (_req, res) => {
  const sorted = [...store.posts].sort(
    (a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
  );

  res.json({ posts: sorted });
});

app.post("/api/posts", (req, res) => {
  const { sellerEmail, title, description, price, category } = req.body ?? {};

  if (!isAllowedCollegeEmail(sellerEmail)) {
    return res.status(400).json({ error: "A valid @saskpolytech.ca email is required." });
  }

  if (!title?.trim() || !description?.trim()) {
    return res.status(400).json({ error: "Title and description are required." });
  }

  const normalizedPrice = Number(price);
  if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
    return res.status(400).json({ error: "Price must be a positive number." });
  }

  const newPost = {
    id: nanoid(),
    sellerEmail: sellerEmail.toLowerCase(),
    title: title.trim(),
    description: description.trim(),
    price: normalizedPrice,
    category: category?.trim() || "General",
    createdAt: new Date().toISOString(),
    comments: []
  };

  store.posts.push(newPost);
  res.status(201).json({ post: newPost });
});

app.post("/api/posts/:postId/comments", (req, res) => {
  const { postId } = req.params;
  const { authorEmail, message } = req.body ?? {};

  if (!isAllowedCollegeEmail(authorEmail)) {
    return res.status(400).json({ error: "Only students can comment." });
  }

  if (!message?.trim()) {
    return res.status(400).json({ error: "Comment message is required." });
  }

  const post = store.posts.find((candidate) => candidate.id === postId);

  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }

  const comment = {
    id: nanoid(),
    authorEmail: authorEmail.toLowerCase(),
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  post.comments.push(comment);
  res.status(201).json({ comment });
});

app.get("/api/chat", (_req, res) => {
  const sorted = [...store.chatMessages].sort(
    (a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf()
  );

  res.json({ messages: sorted });
});

app.post("/api/chat", (req, res) => {
  const { authorEmail, message } = req.body ?? {};

  if (!isAllowedCollegeEmail(authorEmail)) {
    return res.status(400).json({ error: "Only saskpolytech.ca users can chat." });
  }

  if (!message?.trim()) {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  const chatMessage = {
    id: nanoid(),
    authorEmail: authorEmail.toLowerCase(),
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  store.chatMessages.push(chatMessage);
  res.status(201).json({ message: chatMessage });
});

app.listen(PORT, () => {
  console.log(`Student marketplace API running on http://localhost:${PORT}`);
});

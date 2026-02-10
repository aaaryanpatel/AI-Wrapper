import "dotenv/config";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { ALLOWED_DOMAIN, isAllowedCollegeEmail } from "./data.js";

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studentmarket";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const tokenBlocklist = new Set();

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, index: true, required: true },
    name: { type: String, required: true },
    bio: { type: String, default: "" },
    campus: { type: String, default: "Sask Polytech" },
    avatarColor: { type: String, default: "#6366f1" },
    notifyByEmail: { type: Boolean, default: true },
    showOnlineStatus: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    authorEmail: { type: String, required: true },
    authorName: { type: String, required: true },
    message: { type: String, required: true }
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: "General" },
    condition: { type: String, default: "Used" },
    location: { type: String, default: "Sask Polytech Campus" },
    sellerEmail: { type: String, required: true, index: true },
    sellerName: { type: String, required: true },
    likes: { type: Number, default: 0 },
    comments: [commentSchema]
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: String, required: true, index: true }],
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const dmMessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", index: true },
    senderEmail: { type: String, required: true, index: true },
    text: { type: String, required: true }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);
const DmMessage = mongoose.model("DmMessage", dmMessageSchema);

function createToken(user) {
  return jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = header.slice(7);
  if (tokenBlocklist.has(token)) {
    return res.status(401).json({ error: "Session expired" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    req.token = token;
    return next();
  } catch (_error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

async function seedData() {
  const count = await Post.countDocuments();
  if (count > 0) {
    return;
  }

  const sellerEmail = "jane.doe@saskpolytech.ca";
  const sellerName = "Jane Doe";
  await User.findOneAndUpdate(
    { email: sellerEmail },
    { email: sellerEmail, name: sellerName },
    { upsert: true }
  );

  await Post.create({
    title: "MacBook Air M1 (Student Discount)",
    description: "Excellent condition, includes charger and sleeve. Great for classes.",
    price: 850,
    category: "Tech",
    condition: "Like New",
    location: "Saskatoon Campus",
    sellerEmail,
    sellerName,
    likes: 9,
    comments: [
      {
        authorEmail: "alex.student@saskpolytech.ca",
        authorName: "Alex Student",
        message: "Can you do $800 if I pick up today?"
      }
    ]
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "down" });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, name } = req.body ?? {};

    if (!isAllowedCollegeEmail(email)) {
      return res.status(400).json({ error: `Only ${ALLOWED_DOMAIN} emails can access StudentMarket.` });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        name: name?.trim() || normalizedEmail.split("@")[0]
      },
      { upsert: true, new: true }
    );

    const token = createToken(user);
    return res.json({ user, token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/logout", auth, (req, res) => {
  tokenBlocklist.add(req.token);
  res.json({ success: true });
});

app.get("/api/me", auth, async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  res.json({ user });
});

app.get("/api/posts", auth, async (_req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).limit(100);
  res.json({ posts });
});

app.post("/api/posts", auth, async (req, res) => {
  const { title, description, price, category, condition, location } = req.body ?? {};

  if (!title?.trim() || !description?.trim()) {
    return res.status(400).json({ error: "Title and description are required." });
  }

  const normalizedPrice = Number(price);
  if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
    return res.status(400).json({ error: "Price must be a positive number." });
  }

  const user = await User.findOne({ email: req.user.email });
  const post = await Post.create({
    title: title.trim(),
    description: description.trim(),
    price: normalizedPrice,
    category: category?.trim() || "General",
    condition: condition?.trim() || "Used",
    location: location?.trim() || "Sask Polytech Campus",
    sellerEmail: req.user.email,
    sellerName: user?.name || req.user.name,
    likes: Math.floor(Math.random() * 5)
  });

  res.status(201).json({ post });
});

app.post("/api/posts/:postId/comments", auth, async (req, res) => {
  const { message } = req.body ?? {};
  if (!message?.trim()) {
    return res.status(400).json({ error: "Comment message is required." });
  }

  const post = await Post.findById(req.params.postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }

  const user = await User.findOne({ email: req.user.email });
  const comment = {
    _id: nanoid(),
    authorEmail: req.user.email,
    authorName: user?.name || req.user.name,
    message: message.trim(),
    createdAt: new Date()
  };

  post.comments.push(comment);
  await post.save();
  res.status(201).json({ comment });
});

app.put("/api/posts/:postId/like", auth, async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.postId, { $inc: { likes: 1 } }, { new: true });
  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }

  res.json({ post });
});

app.get("/api/users", auth, async (req, res) => {
  const users = await User.find({ email: { $ne: req.user.email } }).limit(50).sort({ name: 1 });
  res.json({ users });
});

app.get("/api/messages/conversations", auth, async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user.email }).sort({ lastMessageAt: -1 });
  res.json({ conversations });
});

app.post("/api/messages/conversations", auth, async (req, res) => {
  const { recipientEmail } = req.body ?? {};

  if (!isAllowedCollegeEmail(recipientEmail)) {
    return res.status(400).json({ error: "Recipient must be a @saskpolytech.ca user." });
  }

  const participants = [req.user.email, recipientEmail.toLowerCase()].sort();
  let conversation = await Conversation.findOne({ participants });

  if (!conversation) {
    conversation = await Conversation.create({
      participants,
      lastMessage: "",
      lastMessageAt: new Date()
    });
  }

  res.status(201).json({ conversation });
});

app.get("/api/messages/conversations/:conversationId", auth, async (req, res) => {
  const conversation = await Conversation.findById(req.params.conversationId);

  if (!conversation || !conversation.participants.includes(req.user.email)) {
    return res.status(404).json({ error: "Conversation not found." });
  }

  const messages = await DmMessage.find({ conversationId: conversation._id }).sort({ createdAt: 1 }).limit(200);
  res.json({ messages });
});

app.post("/api/messages/conversations/:conversationId", auth, async (req, res) => {
  const { text } = req.body ?? {};
  if (!text?.trim()) {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation || !conversation.participants.includes(req.user.email)) {
    return res.status(404).json({ error: "Conversation not found." });
  }

  const message = await DmMessage.create({
    conversationId: conversation._id,
    senderEmail: req.user.email,
    text: text.trim()
  });

  conversation.lastMessage = message.text;
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();

  res.status(201).json({ message });
});

app.get("/api/settings", auth, async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  res.json({ settings: user });
});

app.put("/api/settings", auth, async (req, res) => {
  const { name, bio, campus, avatarColor, notifyByEmail, showOnlineStatus } = req.body ?? {};
  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    {
      ...(name ? { name: name.trim() } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(campus !== undefined ? { campus } : {}),
      ...(avatarColor !== undefined ? { avatarColor } : {}),
      ...(notifyByEmail !== undefined ? { notifyByEmail } : {}),
      ...(showOnlineStatus !== undefined ? { showOnlineStatus } : {})
    },
    { new: true }
  );

  res.json({ settings: user });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    await seedData();
    app.listen(PORT, () => {
      console.log(`Student marketplace API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();

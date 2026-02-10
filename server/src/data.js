import { nanoid } from "nanoid";

export const ALLOWED_DOMAIN = "@saskpolytech.ca";

export const store = {
  users: new Map(),
  posts: [
    {
      id: nanoid(),
      title: "Engineering Textbooks Bundle",
      description:
        "Selling first-year engineering textbooks in good condition. Pickup near campus.",
      price: 180,
      category: "Books",
      sellerEmail: "jane.doe@saskpolytech.ca",
      createdAt: new Date().toISOString(),
      comments: [
        {
          id: nanoid(),
          authorEmail: "alex.student@saskpolytech.ca",
          message: "Is this still available?",
          createdAt: new Date().toISOString()
        }
      ]
    }
  ],
  chatMessages: [
    {
      id: nanoid(),
      authorEmail: "system@saskpolytech.ca",
      message:
        "Welcome to StudentMarket chat! Keep it respectful and related to student buying/selling.",
      createdAt: new Date().toISOString()
    }
  ]
};

export function isAllowedCollegeEmail(email) {
  return typeof email === "string" && email.toLowerCase().endsWith(ALLOWED_DOMAIN);
}

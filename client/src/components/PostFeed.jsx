import { useState } from "react";

export default function PostFeed({ posts, userEmail, onComment }) {
  const [commentDrafts, setCommentDrafts] = useState({});

  return (
    <section className="card">
      <h2>Marketplace Feed</h2>
      {posts.length === 0 ? <p>No posts yet. Be the first to list something.</p> : null}
      <div className="feed">
        {posts.map((post) => (
          <article key={post.id} className="post">
            <header>
              <h3>{post.title}</h3>
              <p>
                <strong>${post.price}</strong> · {post.category}
              </p>
              <small>
                Seller: {post.sellerEmail} · {new Date(post.createdAt).toLocaleString()}
              </small>
            </header>
            <p>{post.description}</p>
            <div className="comments">
              <h4>Comments</h4>
              {post.comments.map((comment) => (
                <p key={comment.id}>
                  <strong>{comment.authorEmail}</strong>: {comment.message}
                </p>
              ))}
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  const message = commentDrafts[post.id]?.trim();
                  if (!message) {
                    return;
                  }
                  await onComment(post.id, message);
                  setCommentDrafts((previous) => ({ ...previous, [post.id]: "" }));
                }}
              >
                <input
                  value={commentDrafts[post.id] ?? ""}
                  onChange={(event) =>
                    setCommentDrafts((previous) => ({
                      ...previous,
                      [post.id]: event.target.value
                    }))
                  }
                  placeholder="Ask a question or comment"
                />
                <button type="submit">Comment</button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

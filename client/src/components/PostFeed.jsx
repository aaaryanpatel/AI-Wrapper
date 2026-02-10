import { useMemo, useState } from "react";

export default function PostFeed({ posts, onComment, onLike }) {
  const [commentDrafts, setCommentDrafts] = useState({});
  const [search, setSearch] = useState("");

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return posts;
    }

    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query)
    );
  }, [posts, search]);

  return (
    <section className="card">
      <div className="row between">
        <h2>Marketplace Feed</h2>
        <input
          className="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search listings"
        />
      </div>

      {filteredPosts.length === 0 ? <p className="muted">No matching posts yet.</p> : null}

      <div className="feed">
        {filteredPosts.map((post) => (
          <article key={post._id} className="post">
            <div className="row between start">
              <div>
                <h3>{post.title}</h3>
                <p className="price">${post.price} · {post.category}</p>
                <small className="muted">{post.condition} · {post.location}</small>
              </div>
              <button className="ghost" onClick={() => onLike(post._id)}>❤️ {post.likes}</button>
            </div>

            <p>{post.description}</p>
            <small className="muted">Seller: {post.sellerName} ({post.sellerEmail})</small>

            <div className="comments">
              {post.comments.map((comment) => (
                <p key={comment._id || `${comment.authorEmail}-${comment.createdAt}`}>
                  <strong>{comment.authorName}:</strong> {comment.message}
                </p>
              ))}

              <form
                className="row"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const message = commentDrafts[post._id]?.trim();
                  if (!message) {
                    return;
                  }
                  await onComment(post._id, message);
                  setCommentDrafts((previous) => ({ ...previous, [post._id]: "" }));
                }}
              >
                <input
                  value={commentDrafts[post._id] ?? ""}
                  onChange={(event) =>
                    setCommentDrafts((previous) => ({ ...previous, [post._id]: event.target.value }))
                  }
                  placeholder="Write a comment"
                />
                <button type="submit">Send</button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

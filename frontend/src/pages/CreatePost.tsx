import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

type DbSub = { id: string; name: string; description?: string };
type DbPost = { id: string };

export function CreatePost(): JSX.Element {
  const [subs, setSubs] = useState<DbSub[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subredditId, setSubredditId] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        const data = await api.get<DbSub[]>("/subreddits");
        setSubs(data);
        if (data[0]) setSubredditId(data[0].id);
      } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error while loading subreddits");
      } finally {
        setLoadingSubs(false);
      }
    };
    void run();
  }, []);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && subredditId && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const created = await api.post<DbPost>(`/subreddits/${subredditId}/posts`, {
        title: title.trim(),
        content: content.trim(),
        type: "text",
        is_private: isPrivate,
      });
      setMessage("Post created successfully.");
      navigate(`/posts/${created.id}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error while creating the post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h1>Create a post</h1>
      <div className="card" style={{ maxWidth: 640 }}>
        {loadingSubs && <div className="meta">Loading subreddits...</div>}
        {!loadingSubs && subs.length === 0 && (
          <div className="meta">No subreddit available. Create one before posting.</div>
        )}
        {!loadingSubs && subs.length > 0 && (
          <>
            <label className="auth-label">
              Post title
              <input
                className="auth-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                required
              />
            </label>
            <label className="auth-label">
              Content
              <textarea
                className="auth-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                required
              />
            </label>
            <label className="auth-label">
              Subreddit
              <select
                className="auth-input"
                value={subredditId}
                onChange={(e) => setSubredditId(e.target.value)}
                required
              >
                {subs.map((s) => (
                  <option key={s.id} value={s.id}>
                    r/{s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="auth-label" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                style={{ width: "auto" }}
              />
              Private post
            </label>
            <button className="auth-button" onClick={handleSubmit} disabled={!canSubmit}>
              {submitting ? "Sending..." : "Publish"}
            </button>
          </>
        )}
        {message && <p className="auth-message">{message}</p>}
      </div>
    </div>
  );
}


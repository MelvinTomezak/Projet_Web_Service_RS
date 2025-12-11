import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { posts as mockPosts, subreddits as mockSubs } from "../data/mock";
import { formatDistanceToNow } from "../utils/date";
import { useCurrentUser } from "../hooks/useCurrentUser";

type DbPost = {
  id: string;
  subreddit_id: string;
  author_id: string;
  title: string;
  content: string;
  media_urls?: string[];
  score?: number;
  created_at: string;
};
type DbSub = { id: string; name: string; description?: string };

export function Subreddit(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [sub, setSub] = useState<DbSub | null>(null);
  const [posts, setPosts] = useState<DbPost[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { userId, roles } = useCurrentUser();
  const [memberRole, setMemberRole] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const subs = await api.get<DbSub[]>("/subreddits");
        const found = subs.find((s) => s.name === slug);
        if (!found) throw new Error("not found");
        setSub(found);
        const p = await api.get<DbPost[]>(`/subreddits/${found.id}/posts`);
        setPosts(p);
        // current user role in this subreddit
        try {
          const me = await api.get<{ role: string | null }>(`/subreddits/${found.id}/me`);
          setMemberRole(me.role);
        } catch {
          setMemberRole(null);
        }
      } catch {
        const msub = mockSubs.find((s) => s.slug === slug);
        setSub(msub ? { id: msub.slug, name: msub.slug, description: msub.description } : null);
        const mposts = mockPosts
          .filter((p) => p.subreddit === slug)
          .map((p) => ({
            id: p.id,
            subreddit_id: p.subreddit,
            author_id: p.author,
            title: p.title,
            content: p.content,
            // media_urls: p.media_urls,
            score: 0,
            created_at: p.createdAt,
          }));
        setPosts(mposts);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [slug]);

  const score = useMemo(() => (s?: number) => s ?? 0, []);

  if (!sub && !loading) {
    return <div className="page">Subreddit not found.</div>;
  }

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>r/{sub?.name ?? slug}</h1>
        {sub && (roles.includes("admin") || memberRole === "owner") && (
          <button
            aria-label="Delete subreddit"
            className="pill"
            onClick={async () => {
              if (
                !window.confirm("Confirm subreddit deletion?") ||
                !window.confirm("Final confirmation: delete this subreddit?")
              ) {
                return;
              }
              try {
                await api.delete(`/subreddits/${sub.id}`);
                navigate("/", { replace: true });
              } catch (err) {
                alert(err instanceof Error ? err.message : "Suppression impossible");
              }
            }}
          >
            🗑️
          </button>
        )}
      </div>
      {sub?.description && <p className="meta">{sub.description}</p>}
      {loading && <div className="meta">Loading...</div>}
      {!loading &&
        [...posts]
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || Date.parse(b.created_at) - Date.parse(a.created_at))
          .map((p) => (
            <article key={p.id} className="card">
              <header style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="meta">Posted {formatDistanceToNow(p.created_at)} ago</span>
                {(roles.includes("admin") || p.author_id === userId) && (
                  <button
                    aria-label="Delete post"
                    className="pill"
                    style={{ marginLeft: "auto" }}
                    onClick={async () => {
                      if (
                          !window.confirm("Confirm post deletion?") ||
                          !window.confirm("Final confirmation: delete this post?")
                      ) {
                        return;
                      }
                      try {
                        await api.delete(`/posts/${p.id}`);
                        setPosts((prev) => prev.filter((x) => x.id !== p.id));
                      } catch (err) {
                        alert(err instanceof Error ? err.message : "Deletion failed");
                      }
                    }}
                  >
                    🗑️
                  </button>
                )}
              </header>
              <Link to={`/posts/${p.id}`} className="title">
                {p.title}
              </Link>
              <p className="content">{p.content}</p>
              {p.media_urls?.[0] && (
                <div style={{ marginTop: 8 }}>
                  <img src={p.media_urls[0]} alt="media" style={{ maxWidth: "100%", borderRadius: 8 }} />
                </div>
              )}
              <footer className="meta" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  className="pill"
                  onClick={async () => {
                    try {
                      await api.post<{ score: number }>(`/posts/${p.id}/vote`, { value: 1 });
                      if (sub?.id) {
                        const refreshed = await api.get<DbPost[]>(`/subreddits/${sub.id}/posts`);
                        setPosts(refreshed);
                      }
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Vote impossible");
                    }
                  }}
                >
                  ⬆️
                </button>
                <button
                  className="pill"
                  onClick={async () => {
                    try {
                      await api.post<{ score: number }>(`/posts/${p.id}/vote`, { value: -1 });
                      if (sub?.id) {
                        const refreshed = await api.get<DbPost[]>(`/subreddits/${sub.id}/posts`);
                        setPosts(refreshed);
                      }
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Vote impossible");
                    }
                  }}
                >
                  ⬇️
                </button>
                <span>Score: {score(p.score)}</span>
              </footer>
            </article>
          ))}
      {!loading && sub && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Create a post</h3>
          <label className="auth-label">
            Title
            <input className="auth-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="auth-label">
            Content
            <textarea
              className="auth-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </label>
          <label className="auth-label">
            Image (URL) — optional
            <input
              className="auth-input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>
          <button
            className="auth-button"
            onClick={async () => {
              setMessage(null);
              try {
                await api.post(`/subreddits/${sub.id}/posts`, {
                  title,
                  content,
                  type: imageUrl ? "image" : "text",
                  media_urls: imageUrl ? [imageUrl] : undefined,
                });
                setMessage("Post created");
                setTitle("");
                setContent("");
                setImageUrl("");
                const p = await api.get<DbPost[]>(`/subreddits/${sub.id}/posts`);
                setPosts(p);
              } catch (err) {
                setMessage(err instanceof Error ? err.message : "Error");
              }
            }}
            disabled={!title || !content}
          >
            Publish
          </button>
          {message && <p className="auth-message">{message}</p>}
        </div>
      )}
    </div>
  );
}


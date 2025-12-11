import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { posts as mockPosts, subreddits as mockSubs } from "../data/mock";
import { formatDistanceToNow } from "../utils/date";

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
  const [sub, setSub] = useState<DbSub | null>(null);
  const [posts, setPosts] = useState<DbPost[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const subs = await api.get<DbSub[]>("/subreddits");
        const found = subs.find((s) => s.name === slug);
        if (!found) throw new Error("not found");
        setSub(found);
        const p = await api.get<DbPost[]>(`/subreddits/${found.id}/posts`);
        setPosts(p);
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
    return <div className="page">Subreddit introuvable.</div>;
  }

  return (
    <div className="page">
      <h1>r/{sub?.name ?? slug}</h1>
      {sub?.description && <p className="meta">{sub.description}</p>}
      {loading && <div className="meta">Chargement...</div>}
      {!loading &&
        posts.map((p) => (
          <article key={p.id} className="card">
            <header>
              <span className="meta">
                Posté il y a {formatDistanceToNow(p.created_at)}
              </span>
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
            <footer className="meta">Score : {score(p.score)}</footer>
          </article>
        ))}
      {!loading && sub && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Créer un post</h3>
          <label className="auth-label">
            Titre
            <input className="auth-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="auth-label">
            Contenu
            <textarea
              className="auth-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </label>
          <label className="auth-label">
            Image (URL) — optionnel
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
                setMessage("Post créé");
                setTitle("");
                setContent("");
                setImageUrl("");
                const p = await api.get<DbPost[]>(`/subreddits/${sub.id}/posts`);
                setPosts(p);
              } catch (err) {
                setMessage(err instanceof Error ? err.message : "Erreur");
              }
            }}
            disabled={!title || !content}
          >
            Publier
          </button>
          {message && <p className="auth-message">{message}</p>}
        </div>
      )}
    </div>
  );
}


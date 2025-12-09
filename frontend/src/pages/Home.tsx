import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { posts as mockPosts, subreddits as mockSubs } from "../data/mock";
import { formatDistanceToNow } from "../utils/date";

type DbPost = {
  id: string;
  subreddit_id: string;
  author_id: string;
  title: string;
  content: string;
  type: string;
  media_urls?: string[];
  created_at: string;
  score?: number;
};

type DbSub = { id: string; name: string; description?: string };

export function Home(): JSX.Element {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<DbPost[]>([]);
  const [subs, setSubs] = useState<DbSub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const [p, s] = await Promise.all([api.get<DbPost[]>("/posts"), api.get<DbSub[]>("/subreddits")]);
        setPosts(p);
        setSubs(s);
      } catch {
        // fallback mock si API KO
        setPosts([]);
        setSubs([]);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const subsById = useMemo(() => {
    const map = new Map<string, DbSub>();
    subs.forEach((s) => map.set(s.id, s));
    return map;
  }, [subs]);

  const displayPosts = posts.length
    ? posts
    : mockPosts.map((p) => ({
        id: p.id,
        subreddit_id: p.subreddit,
        author_id: p.author,
        title: p.title,
        content: p.content,
        type: p.type ?? "text",
        media_urls: p.media_urls,
        created_at: p.createdAt,
        score: 0,
      }));

  return (
    <div className="page">
      <h1>Fil d’actualité</h1>
      <div className="grid">
        <div className="feed">
          {loading && <div className="meta">Chargement...</div>}
          {!loading && displayPosts.length === 0 && <div className="meta">Aucun post.</div>}
          {displayPosts.map((p) => {
            const sub = subsById.get(p.subreddit_id);
            return (
              <article key={p.id} className="card">
                <header>
                  <button className="pill" onClick={() => navigate(`/r/${sub?.name ?? p.subreddit_id}`)}>
                    r/{sub?.name ?? p.subreddit_id}
                  </button>
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
                <div className="meta">Score : {p.score ?? 0}</div>
              </article>
            );
          })}
        </div>
        <aside className="sidebar card">
          <h3>Subreddits</h3>
          <ul>
            {(subs.length ? subs.map((s) => ({ slug: s.name, description: s.description })) : mockSubs).map(
              (s) => (
                <li key={s.slug}>
                  <Link to={`/r/${s.slug}`}>r/{s.slug}</Link>
                  {s.description && <div className="meta">{s.description}</div>}
                </li>
              ),
            )}
          </ul>
        </aside>
      </div>
    </div>
  );
}


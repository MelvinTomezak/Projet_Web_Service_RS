import {FormEvent, useEffect, useMemo, useState} from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import { comments as mockComments, posts as mockPosts, subreddits as mockSubs } from "../data/mock";
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
type DbComment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
};
type DbSub = { id: string; name: string };

export function PostDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<DbPost | null>(null);
  const [comments, setComments] = useState<DbComment[]>([]);
  const [sub, setSub] = useState<DbSub | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        if (!id) return;
        const p = await api.get<DbPost>(`/posts/${id}`);
        setPost(p);

        const c = await api.get<DbComment[]>(`/posts/${id}/comments`);
        setComments(c);

        const subs = await api.get<DbSub[]>(`/subreddits`);
        const match = subs.find((s) => s.id === p.subreddit_id);
        setSub(match ?? null);
      } catch {
        const mp = mockPosts.find((m) => m.id === id);
        if (mp) {
          setPost({
            id: mp.id,
            subreddit_id: mp.subreddit,
            author_id: mp.author,
            title: mp.title,
            content: mp.content,
            score: 0,
            created_at: mp.createdAt,
          });
          setComments(
            mockComments
              .filter((c) => c.postId === id)
              .map((c) => ({
                id: c.id,
                post_id: c.postId,
                author_id: c.author,
                content: c.content,
                created_at: c.createdAt,
              })),
          );
          const ms = mockSubs.find((s) => s.slug === mp.subreddit);
          setSub(ms ? { id: ms.slug, name: ms.slug } : null);
        }
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, [id]);

  const score = useMemo(() => (s?: number) => s ?? 0, []);

  const sendComment = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if(!id || !commentContent.trim()) return;
    try {
      const newComment = await api.post<DbComment>(`/posts/${id}/comments`, {
        content: commentContent,
      });
      setComments((prev) => [newComment, ...prev]);
      setCommentContent("");
    } catch {
      // ignore
    }
  }

  if (!post && !loading) return <div className="page">Post introuvable.</div>;

  return (
    <div className="page">
      {sub && (
        <Link to={`/r/${sub.name}`} className="pill">
          r/{sub.name}
        </Link>
      )}
      <h1>{post?.title}</h1>
      {post && (
        <p className="meta">
          Posté il y a {formatDistanceToNow(post.created_at)} • Score : {score(post.score)}
        </p>
      )}
      <p className="content">{post?.content}</p>
      {post?.media_urls?.[0] && (
        <div style={{ marginTop: 8 }}>
          <img src={post.media_urls[0]} alt="media" style={{ maxWidth: "100%", borderRadius: 8 }} />
        </div>
      )}
      <section className="card">
        <h3>Commentaires</h3>
        {loading && <p className="meta">Chargement...</p>}

        <form>
          <label className="auth-label">
            Ajouter un commentaire
            <textarea
                    className="auth-input"
                    rows={2}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
            />
          </label>
          <button
                  className="auth-button"
                  onSubmit={sendComment}
                  type="submit"
          >
            Envoyer
          </button>
        </form>
        {!loading && comments.length === 0 && <p className="meta">Aucun commentaire</p>}
        {comments.map((c) => (
          <article key={c.id} className="comment">
            <div className="meta">{formatDistanceToNow(c.created_at)}</div>
            <div>{c.content}</div>
          </article>
        ))}
      </section>
    </div>
  );
}


import {FormEvent, useEffect, useMemo, useState} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import { api } from "../api";
import { comments as mockComments, posts as mockPosts, subreddits as mockSubs } from "../data/mock";
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
type DbComment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_username?: string | null;
};
type DbSub = { id: string; name: string };

export function PostDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<DbPost | null>(null);
  const [comments, setComments] = useState<DbComment[]>([]);
  const [sub, setSub] = useState<DbSub | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [newComment, setNewComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const { userId, roles } = useCurrentUser();

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

<<<<<<< Updated upstream
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
=======
  if (!post && !loading) return <div className="page">Post not found.</div>;
>>>>>>> Stashed changes

  return (
    <div className="page">
      {sub && (
        <Link to={`/r/${sub.name}`} className="pill">
          r/{sub.name}
        </Link>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>{post?.title}</h1>
        {post && (roles.includes("admin") || post.author_id === userId) && (
          <button
            aria-label="Delete post"
            className="pill"
            onClick={async () => {
              if (
                !window.confirm("Confirm post deletion?") ||
                !window.confirm("Final confirmation: delete this post?")
              ) {
                return;
              }
              try {
                await api.delete(`/posts/${post.id}`);
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
      {post && (
        <p className="meta">
          Posted {formatDistanceToNow(post.created_at)} ago • Score: {score(post.score)}
        </p>
      )}
      {post && <p className="meta">Current score: {score(post.score)}</p>}
      <p className="content">{post?.content}</p>
      {post?.media_urls?.[0] && (
        <div style={{ marginTop: 8 }}>
          <img src={post.media_urls[0]} alt="media" style={{ maxWidth: "100%", borderRadius: 8 }} />
        </div>
      )}
      <section className="card">
<<<<<<< Updated upstream
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
=======
        <h3>Comments</h3>
        {loading && <p className="meta">Loading...</p>}
        {!loading && comments.length === 0 && <p className="meta">No comments</p>}
>>>>>>> Stashed changes
        {comments.map((c) => (
          <article key={c.id} className="comment">
            <div className="meta">
              {c.author_username ?? "Anonymous"} • {formatDistanceToNow(c.created_at)}
            </div>
            <div>{c.content}</div>
            {(roles.includes("admin") || c.author_id === userId) && (
              <button
                className="pill"
                style={{ marginTop: 6 }}
                onClick={async () => {
                  if (
                    !window.confirm("Confirm comment deletion?") ||
                    !window.confirm("Final confirmation: delete this comment?")
                  ) {
                    return;
                  }
                  try {
                    await api.delete(`/comments/${c.id}`);
                    const refreshed = await api.get<DbComment[]>(`/posts/${id}/comments`);
                    setComments(refreshed);
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "Deletion failed");
                  }
                }}
              >
                🗑️
              </button>
            )}
          </article>
        ))}
      </section>
<<<<<<< Updated upstream
=======
      <section className="card" style={{ marginTop: 12 }}>
        <h3>Add a comment</h3>
        <textarea
          className="auth-input"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          placeholder="Your comment"
        />
        <button
          className="auth-button"
          disabled={!newComment.trim()}
          onClick={async () => {
            if (!id) return;
            setMessage(null);
            try {
              await api.post<DbComment>(`/posts/${id}/comments`, { content: newComment.trim() });
              const refreshed = await api.get<DbComment[]>(`/posts/${id}/comments`);
              setComments(refreshed);
              setNewComment("");
              setMessage("Comment added");
            } catch (err) {
              setMessage(err instanceof Error ? err.message : "Error");
            }
          }}
          style={{ marginTop: 8 }}
        >
          Publish
        </button>
        {message && <p className="auth-message">{message}</p>}
      </section>
>>>>>>> Stashed changes
    </div>
  );
}


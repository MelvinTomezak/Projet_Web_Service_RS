import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export function CreateSubreddit(): JSX.Element {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (): Promise<void> => {
    setMessage(null);
    setLoading(true);
    try {
      const data = await api.post<{ id: string; name: string }>("/subreddits", {
        name,
        description,
        is_private: isPrivate,
      });
      setMessage("Subreddit created.");
      setTimeout(() => navigate(`/r/${data.name}`), 400);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Create a subreddit</h1>
      <div className="card">
        <label className="auth-label">
          Name (slug)
          <input
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. tech"
          />
        </label>
        <label className="auth-label">
          Description
          <textarea
            className="auth-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the subreddit"
            rows={3}
          />
        </label>
        <label className="auth-label" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
          Private
        </label>
        <button className="auth-button" onClick={submit} disabled={loading || !name}>
          {loading ? "..." : "Create"}
        </button>
        {message && <p className="auth-message">{message}</p>}
      </div>
    </div>
  );
}


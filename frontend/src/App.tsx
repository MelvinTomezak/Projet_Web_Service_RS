import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import { api } from "./api";

type Mode = "login" | "signup";

export function App(): JSX.Element {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const location = useLocation();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: authSub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => {
      authSub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const msg = (location.state as { message?: string } | undefined)?.message;
    if (msg) setMessage(msg);
  }, [location.state]);

  const loadRoles = async () => {
    try {
      const me = await api.get<{ user?: { roles?: string[]; username?: string | null } }>("/auth/me");
      setRoles(me.user?.roles ?? []);
      if (me.user?.username) setUsername(me.user.username);
    } catch {
      setRoles([]);
    }
  };

  const submit = async (): Promise<void> => {
    setMessage(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await loadRoles();
        setMessage("Signed in.");
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: email.split("@")[0] } },
        });
        if (error) throw error;
        if (data.user?.user_metadata?.username) {
          setUsername(data.user.user_metadata.username);
        }
        setMessage("Account created. Please sign in.");
        setMode("login");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setMessage("Signed out.");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Reddit-like Auth</h1>
        {session && (
          <div className="auth-badge">
            Signed in as <strong>{username || session.user.email}</strong>
            {roles.length > 0 && <span style={{ marginLeft: 8 }}>({roles.join(", ")})</span>}
          </div>
        )}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            className={`auth-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        <label className="auth-label">
          Email
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="auth-label">
          Password
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <button className="auth-button" onClick={submit} disabled={loading}>
          {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
        </button>

<<<<<<< Updated upstream
=======
        <button className="auth-secondary" onClick={logout}>
          Sign out
        </button>

>>>>>>> Stashed changes
        {message && <p className="auth-message">{message}</p>}
        <p className="meta">
          Supabase JWT token is stored client-side (session) and sent as Bearer to the backend API.
        </p>
      </div>
    </div>
  );
}


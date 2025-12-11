import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

type Mode = "login" | "signup";

export function App(): JSX.Element {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
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

  const submit = async (): Promise<void> => {
    setMessage(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("Connexion réussie.");
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Inscription réussie.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setMessage("Déconnexion effectuée.");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Auth Reddit-like</h1>
        {session && (
          <div className="auth-badge">
            Connecté en tant que <strong>{session.user.email}</strong>
          </div>
        )}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Connexion
          </button>
          <button
            className={`auth-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => setMode("signup")}
          >
            Inscription
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
          Mot de passe
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <button className="auth-button" onClick={submit} disabled={loading}>
          {loading ? "..." : mode === "login" ? "Se connecter" : "Créer un compte"}
        </button>

        {message && <p className="auth-message">{message}</p>}
        <p className="meta">
          Le token JWT Supabase sera stocké côté client (session), et envoyé en Bearer sur l’API
          backend.
        </p>
      </div>
    </div>
  );
}


import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { supabase } from "../supabaseClient";
import { ReactNode, useState } from "react";

export function Shell({ children }: { children: ReactNode }): JSX.Element {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [flash, setFlash] = useState<string | null>(
    (location.state as { message?: string } | undefined)?.message ?? null,
  );

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setFlash("Vous êtes déconnecté");
    navigate("/login", { state: { message: "Vous êtes déconnecté" }, replace: true });
  };

  if (loading) {
    return <div className="page meta">Chargement de la session...</div>;
  }

  if (!session) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <Link to="/" className="brand">
            Reddit-like
          </Link>
          <Link to="/">Accueil</Link>
          <Link to="/create-subreddit">Créer un subreddit</Link>
        </div>
        <div className="topbar-right">
          <span className="meta">{session.user.email}</span>
          <button className="auth-secondary" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </header>
      {flash && (
        <div className="flash" onClick={() => setFlash(null)}>
          {flash}
        </div>
      )}
      <main>{children}</main>
    </>
  );
}





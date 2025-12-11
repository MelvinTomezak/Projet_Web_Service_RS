import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { supabase } from "../supabaseClient";
import { ReactNode, useEffect, useState } from "react";
import { api } from "../api";
import { useCurrentUser } from "../hooks/useCurrentUser";

export function Shell({ children }: { children: ReactNode }): JSX.Element {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [flash, setFlash] = useState<string | null>(
    (location.state as { message?: string } | undefined)?.message ?? null,
  );
  const [roles, setRoles] = useState<string[]>([]);
  const { userId, username, loading: loadingUser } = useCurrentUser();

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const me = await api.get<{ user?: { roles?: string[] } }>("/auth/me");
        setRoles(me.user?.roles ?? []);
      } catch {
        setRoles([]);
      }
    };
    if (session) void loadRoles();
  }, [session]);

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setFlash("You are signed out");
    navigate("/login", { state: { message: "You are signed out" }, replace: true });
  };

  if (loading) {
    return <div className="page meta">Loading session...</div>;
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
          <Link to="/">Home</Link>
          <Link to="/create-subreddit">Create subreddit</Link>
          <Link to="/create-post">Create post</Link>
          {roles.includes("admin") && <Link to="/admin">Admin</Link>}
        </div>
        <div className="topbar-right">
          <span className="meta">
            {username ?? session.user.email} {roles.length > 0 && `• ${roles.join(", ")}`}
            {loadingUser && " (loading...)"}
          </span>
          <button className="auth-secondary" onClick={logout}>
            Sign out
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





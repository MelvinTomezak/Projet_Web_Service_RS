import { useEffect, useState } from "react";
import { api } from "../api";
import { useCurrentUser } from "../hooks/useCurrentUser";

type UserRow = { id: string; username: string | null; roles: string[] };

export function AdminUsers(): JSX.Element {
  const { userId } = useCurrentUser();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get<UserRow[]>("/admin/users");
      setUsers(data);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateRole = async (userId: string, role: "admin" | "member") => {
    setMessage(null);
    try {
      await api.post(`/admin/users/${userId}/role`, { role });
      setMessage("Role updated");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <div className="page">
      <h1>User management</h1>
      {loading && <div className="meta">Loading...</div>}
      {message && <p className="auth-message">{message}</p>}
      {!loading && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) => u.id !== userId)
                .map((u) => (
                <tr key={u.id}>
                  <td>{u.username ?? u.id}</td>
                  <td>{u.roles.join(", ") || "member"}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button className="pill" onClick={() => void updateRole(u.id, "admin")}>
                      Admin
                    </button>
                    <button className="pill" onClick={() => void updateRole(u.id, "member")}>
                      Member
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


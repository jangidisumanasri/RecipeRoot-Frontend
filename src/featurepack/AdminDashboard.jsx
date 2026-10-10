import { useEffect, useState } from "react";
import { featureApi } from "./api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      const [dashboard, userList] = await Promise.all([
        featureApi.adminDashboard(),
        featureApi.adminUsers(),
      ]);

      setStats(dashboard);
      setUsers(userList);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function deleteUser(id) {
    if (!window.confirm("Delete this user?")) return;

    try {
      await featureApi.deleteAdminUser(id);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="rr-feature-panel">
      <h2>Admin Dashboard</h2>

      {error && (
        <p className="rr-error" role="alert">
          {error}
        </p>
      )}

      {stats && (
        <div className="rr-admin-stats">
          {Object.entries(stats).map(([key, value]) => (
            <article key={key}>
              <span>
                {key.replace(/[A-Z]/g, (letter) => ` ${letter}`).toUpperCase()}
              </span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
      )}

      <h3>Registered Users</h3>

      <div className="rr-admin-table-wrap">
        <table className="rr-admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  {user.role !== "ADMIN" && (
                    <button onClick={() => deleteUser(user.id)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
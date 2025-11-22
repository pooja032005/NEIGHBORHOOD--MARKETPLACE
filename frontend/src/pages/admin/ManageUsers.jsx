import React, { useEffect, useState } from "react";
import client from "../../api/api";
import AdminSidebar from "../../components/AdminSidebar";
import "../../styles/admin.css";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("buyer");

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await client.get(`/admin-management/users?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await client.put(
        `/admin-management/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Role updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating role");
    }
  };

  const handleBlock = async (userId) => {
    if (window.confirm("Block this user?")) {
      try {
        const token = localStorage.getItem("token");
        await client.post(
          `/admin-management/users/${userId}/block`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("User blocked");
        fetchUsers();
      } catch (err) {
        alert("Error blocking user");
      }
    }
  };

  const handleUnblock = async (userId) => {
    if (window.confirm("Unblock this user?")) {
      try {
        const token = localStorage.getItem("token");
        await client.post(
          `/admin-management/users/${userId}/unblock`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("User unblocked");
        fetchUsers();
      } catch (err) {
        alert("Error unblocking user");
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Delete this user? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem("token");
        await client.delete(`/admin-management/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("User deleted");
        fetchUsers();
      } catch (err) {
        alert("Error deleting user");
      }
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <div className="admin-header">
          <h1>👥 Manage Users</h1>
          <p>Total Users: {total}</p>
        </div>

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name || "N/A"}</td>
                    <td>{user.email}</td>
                    <td>
                      {editingUser === user._id ? (
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`role-badge role-${user.role}`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={user.isBlocked ? "status-blocked" : "status-active"}>
                        {user.isBlocked ? "🚫 Blocked" : "✅ Active"}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {editingUser === user._id ? (
                        <>
                          <button
                            className="btn-save"
                            onClick={() => handleRoleChange(user._id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => setEditingUser(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-edit"
                            onClick={() => {
                              setEditingUser(user._id);
                              setNewRole(user.role);
                            }}
                          >
                            Edit Role
                          </button>
                          {user.isBlocked ? (
                            <button
                              className="btn-unblock"
                              onClick={() => handleUnblock(user._id)}
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              className="btn-block"
                              onClick={() => handleBlock(user._id)}
                            >
                              Block
                            </button>
                          )}
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(user._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                ← Previous
              </button>
              <span>Page {page}</span>
              <button
                disabled={users.length < 10}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

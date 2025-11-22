import React, { useEffect, useState } from "react";
import client from "../../api/api";
import AdminSidebar from "../../components/AdminSidebar";
import "../../styles/admin.css";

export default function ManageItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchItems();
  }, [page]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await client.get(`/admin-management/items?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      await client.post(
        `/admin-management/items/${itemId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Item approved");
      fetchItems();
    } catch (err) {
      alert("Error approving item");
    }
  };

  const handleReject = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      await client.post(
        `/admin-management/items/${itemId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Item rejected");
      fetchItems();
    } catch (err) {
      alert("Error rejecting item");
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Delete this item?")) {
      try {
        const token = localStorage.getItem("token");
        await client.delete(`/admin-management/items/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Item deleted");
        fetchItems();
      } catch (err) {
        alert("Error deleting item");
      }
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <div className="admin-header">
          <h1>📦 Manage Items</h1>
          <p>Total Items: {total}</p>
        </div>

        {loading ? (
          <div className="loading">Loading items...</div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Seller</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>{item.owner?.name || "Unknown"}</td>
                    <td>₹{item.price}</td>
                    <td>{item.category}</td>
                    <td>
                      <span className={item.isApproved ? "status-approved" : "status-pending"}>
                        {item.isApproved ? "✅ Approved" : "⏳ Pending"}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {!item.isApproved && (
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(item._id)}
                        >
                          Approve
                        </button>
                      )}
                      {item.isApproved && (
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(item._id)}
                        >
                          Reject
                        </button>
                      )}
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
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
                disabled={items.length < 10}
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

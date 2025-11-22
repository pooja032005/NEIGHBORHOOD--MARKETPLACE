import React, { useEffect, useState } from "react";
import client from "../../api/api";
import AdminSidebar from "../../components/AdminSidebar";
import "../../styles/admin.css";

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchServices();
  }, [page]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await client.get(`/admin-management/services?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data.services);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (serviceId) => {
    try {
      const token = localStorage.getItem("token");
      await client.post(
        `/admin-management/services/${serviceId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Service approved");
      fetchServices();
    } catch (err) {
      alert("Error approving service");
    }
  };

  const handleReject = async (serviceId) => {
    try {
      const token = localStorage.getItem("token");
      await client.post(
        `/admin-management/services/${serviceId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Service rejected");
      fetchServices();
    } catch (err) {
      alert("Error rejecting service");
    }
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm("Delete this service?")) {
      try {
        const token = localStorage.getItem("token");
        await client.delete(`/admin-management/services/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Service deleted");
        fetchServices();
      } catch (err) {
        alert("Error deleting service");
      }
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <div className="admin-header">
          <h1>🛠️ Manage Services</h1>
          <p>Total Services: {total}</p>
        </div>

        {loading ? (
          <div className="loading">Loading services...</div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Provider</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service._id}>
                    <td>{service.title}</td>
                    <td>{service.provider?.name || "Unknown"}</td>
                    <td>₹{service.price}</td>
                    <td>{service.category}</td>
                    <td>
                      <span className={service.isApproved ? "status-approved" : "status-pending"}>
                        {service.isApproved ? "✅ Approved" : "⏳ Pending"}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {!service.isApproved && (
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(service._id)}
                        >
                          Approve
                        </button>
                      )}
                      {service.isApproved && (
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(service._id)}
                        >
                          Reject
                        </button>
                      )}
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(service._id)}
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
                disabled={services.length < 10}
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

import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/admin-sidebar.css";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">🛠️</div>
        <div>
          <h2 className="sidebar-title">Admin Panel</h2>
          <p className="sidebar-subtitle">Neighborhood Marketplace</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link
          to="/admin/dashboard"
          className={`nav-item ${isActive("/admin/dashboard") ? "active" : ""}`}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Dashboard</span>
        </Link>
        <Link
          to="/admin/users"
          className={`nav-item ${isActive("/admin/users") ? "active" : ""}`}
        >
          <span className="nav-icon">👥</span>
          <span className="nav-label">Manage Users</span>
        </Link>
        <Link
          to="/admin/items"
          className={`nav-item ${isActive("/admin/items") ? "active" : ""}`}
        >
          <span className="nav-icon">📦</span>
          <span className="nav-label">Manage Items</span>
        </Link>
        <Link
          to="/admin/services"
          className={`nav-item ${isActive("/admin/services") ? "active" : ""}`}
        >
          <span className="nav-icon">🛠️</span>
          <span className="nav-label">Manage Services</span>
        </Link>
        <div className="nav-divider"></div>
        <Link
          to="/admin/analytics"
          className={`nav-item ${isActive("/admin/analytics") ? "active" : ""}`}
        >
          <span className="nav-icon">📈</span>
          <span className="nav-label">Analytics</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <p className="user-name">{user.name || "Admin"}</p>
          <p className="user-role">{user.role || "admin"}</p>
        </div>
        <button className="logout-btn" onClick={logout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

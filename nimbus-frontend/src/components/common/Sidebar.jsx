import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

import {
  FiMail,
  FiImage,
  FiSettings,
  FiLogOut,
  FiClock,
  FiGrid,
  FiEdit3
} from "react-icons/fi";

const Sidebar = ({ activePage }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar-fixed">
      {/* Logo Section */}
      <div className="sidebar-logo">
        <h1 className="nimbus-logo-text">NIMBUS</h1>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activePage === "dashboard" ? "active" : ""}`}
          onClick={() => navigate("/dashboard")}
        >
          <div className="nav-icon-container">
            <FiGrid />
          </div>
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-item ${activePage === "email-generator" ? "active" : ""}`}
          onClick={() => navigate("/email-draft")}
        >
          <div className="nav-icon-container">
            <FiMail />
          </div>
          <span>Email Generator</span>
        </button>

        <button
          className={`nav-item ${activePage === "poster-generator" ? "active" : ""}`}
          onClick={() => navigate("/poster-generator")}
        >
          <div className="nav-icon-container">
            <FiImage />
          </div>
          <span>Poster Generator</span>
        </button>

        <button
          className={`nav-item ${activePage === "logo-ideas" ? "active" : ""}`}
          onClick={() => navigate("/logo-ideas")}
        >
          <div className="nav-icon-container">
            <FiEdit3 />
          </div>
          <span>Logo Ideas</span>
        </button>

        <button
          className={`nav-item ${activePage === "history" ? "active" : ""}`}
          onClick={() => navigate("/activity")}
        >
          <div className="nav-icon-container">
            <FiClock />
          </div>
          <span>History</span>
        </button>

        <button
          className={`nav-item ${activePage === "settings" ? "active" : ""}`}
          onClick={() => navigate("/settings")}
        >
          <div className="nav-icon-container">
            <FiSettings />
          </div>
          <span>Settings</span>
        </button>
      </nav>

      {/* Logout — fixed bottom */}
      <button className="logout-btn" onClick={handleLogout}>
        <div className="logout-icon-container">
          <FiLogOut />
        </div>
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;

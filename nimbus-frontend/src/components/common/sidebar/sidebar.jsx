import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Logo from "../../../assets/Logo";
import { toast } from "../../../utils/toast";
import "./sidebar.css";
import { FiMail, FiImage, FiLogOut, FiClock, FiGrid, FiEdit3, FiUser, FiFileText } from "react-icons/fi";

const Sidebar = ({ activePage }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.info("Signed out successfully.");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <FiGrid />, path: "/dashboard" },
    { id: "email-generator", label: "Email Generator", icon: <FiMail />, path: "/email-generator" },
    { id: "poster-generator", label: "Poster Generator", icon: <FiImage />, path: "/poster-generator" },
    { id: "logo-generator", label: "Logo Generator", icon: <FiEdit3 />, path: "/logo-generator" },
    { id: "report-generator", label: "Report Generator", icon: <FiFileText />, path: "/report-generator" },
    { id: "history", label: "History", icon: <FiClock />, path: "/activity" },
    { id: "profile", label: "My Profile", icon: <FiUser />, path: "/profile" },
  ];

  return (
    <aside className="sidebar-fixed">
      {/* Brand Section */}
      <div className="sidebar-logo" onClick={() => navigate("/dashboard")} style={{ cursor: 'pointer' }}>
        <Logo showText={false} className="sidebar-logo-svg" />
        <h1 className="nimbus-logo-text">NIMBUS</h1>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <div className="nav-icon-container">
              {item.icon}
            </div>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={handleLogout}>
          <div className="logout-icon-container">
            <FiLogOut />
          </div>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

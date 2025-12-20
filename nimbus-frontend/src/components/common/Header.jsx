import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ title }) => {
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();

    // Helper for Initials
    const getInitials = () => {
        const parts = user.name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0].substring(0, 2).toUpperCase();
        return "G"; // Guest
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="common-header">
            <h2 className="header-title">{title}</h2>

            <div className="header-right">
                <div className="role-badge">{role || "Guest"}</div>

                <Link to="/profile" className="avatar-link" title="Profile">
                    {getInitials()}
                </Link>

                <button className="logout-icon-btn" onClick={handleLogout} title="Logout">
                    🚪
                </button>
            </div>
        </header>
    );
};

export default Header;

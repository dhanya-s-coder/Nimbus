import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import './header.css';

const Header = ({ title }) => {
    const { user, role, logout } = useAuth();

    const getInitials = () => {
        if (!user || !user.name) return "U";
        const parts = user.name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0].substring(0, 2).toUpperCase();
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="common-header">
            <div className="header-title-wrapper">
                <h2 className="header-title">{title}</h2>
            </div>

            <div className="header-right">
                <div className="user-info-brief">
                    <span className="user-name-header">{role || 'Member'}</span>
                </div>

                <div className="avatar-wrapper">
                    <Link to="/profile" className="avatar-header" title="My Profile">
                        {getInitials()}
                    </Link>
                </div>

                <div className="header-actions">
                    <button className="header-icon-btn" onClick={handleLogout} title="Sign Out">
                        <FiLogOut />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../common/sidebar/sidebar';
import Header from '../common/header/header';
import '../dashboard/dashboard.css'; // Import global dashboard layout styles

const ProtectedLayout = () => {
    const location = useLocation();

    const getCurrentActiveComponent = () => {
        const path = location.pathname;
        switch (path) {
            case '/activity':
                return 'history';
            default:
                return path.replace('/', '');
        }
    };

    const getPageTitle = () => {
        const path = location.pathname;
        switch (path) {
            case '/dashboard':
                return 'Dashboard';
            case '/profile':
                return 'My Profile';
            case '/email-generator':
                return 'Email Generator';
            case '/poster-generator':
                return 'Poster Generator';
            case '/logo-generator':
                return 'Logo Generator';
            case '/report-generator':
                return 'Report Generator';
            case '/activity':
                return 'Recent Activity';
            default:
                return 'Nimbus';
        }
    };

    return (
        <div className="app-layout">
            <Sidebar activePage={getCurrentActiveComponent()} />
            <div className="layout-content-wrapper">
                <Header title={getPageTitle()} />
                <Outlet />
            </div>
        </div>
    );
};

export default ProtectedLayout;

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../dashboard/dashboard.css'; // Import global dashboard layout styles

const ProtectedLayout = () => {
    const location = useLocation();

    const getCurrentActiveComponent = () => {
        const path = location.pathname;
        switch (path){
            case '/email-draft':
                return 'email-generator';
            case '/activity':
                return 'history';
            default:
                return path.replace('/','');
        }
    };

    return (
        <div className="app-layout">
            <Sidebar activePage={getCurrentActiveComponent()}/>
            <div className="layout-content-wrapper">
                <Outlet />
            </div>
        </div>
    );
};

export default ProtectedLayout;

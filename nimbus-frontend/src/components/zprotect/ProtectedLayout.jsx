import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../common/sidebar/sidebar';
import Header from '../common/header/header';

const ProtectedLayout = () => {
    const location = useLocation();
    // The menu is never permanent on any page: it stays tucked away and slides over the page only when the
    // menu button is pressed (click outside, Esc or picking a page closes it again).
    const [navOpen, setNavOpen] = useState(false);
    useEffect(() => { setNavOpen(false); }, [location.pathname]);
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setNavOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

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
            case '/knowledge':
                return 'Knowledge Base';
            case '/activity':
                return 'Recent Activity';
            default:
                return 'Nimbus';
        }
    };

    return (
        <div className={`app-layout nav-free ${navOpen ? 'nav-open' : 'nav-closed'}`}>
            <Sidebar activePage={getCurrentActiveComponent()} />
            {navOpen && <div className="nav-backdrop" onClick={() => setNavOpen(false)} aria-hidden="true" />}
            <div className="layout-content-wrapper">
                <Header title={getPageTitle()} onMenu={() => setNavOpen((o) => !o)} menuOpen={navOpen} />
                <Outlet />
            </div>
        </div>
    );
};

export default ProtectedLayout;
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ element }) => {
    const {isAuthenticated} = useAuth();

    if(isAuthenticated){
        return <Navigate to="/dashboard" replace />
    }

    return element;
}

export default PublicRoute;

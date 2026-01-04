import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, fetchWithAuth } from '../api/config';

const HistoryContext = createContext();

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffSecs < 60) return `${diffSecs} sec ago`;
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
};

const getPreviewBg = (type) => {
    switch (type) {
        case 'email': return '#F3F4F6';
        case 'poster': return '#FEF3C7';
        case 'logo': return '#E0F2FE';
        case 'report': return '#F0FDF4';
        default: return '#F3F4F6';
    }
};

const getPreviewIcon = (type) => {
    switch (type?.toLowerCase()) {
        case 'email': return '📧';
        case 'poster': return '🎨';
        case 'logo': return '🎯';
        case 'report': return '📊';
        default: return '📋';
    }
};

const getPreviewStroke = (type) => {
    switch (type) {
        case 'poster': return '#FCD34D';
        case 'logo': return '#BAE6FD';
        case 'report': return '#86EFAC';
        default: return '#D1D5DB';
    }
};

const getActionButton = (status) => {
    if (status === 'sent') return 'View';
    if (status === 'draft') return 'Edit';
    return 'View';
};

const transformActivities = (activities) => {
    return activities.map(activity => ({
        id: activity._id,
        type: activity.type,
        title: `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}: ${activity.title || activity.subject || 'Untitled'}`,
        prompt: activity.prompt ? `Prompt: "${activity.prompt}"` : '',
        date: formatDate(activity.createdAt),
        status: activity.status || (activity.type === 'email' ? 'sent' : 'draft'),
        previewBg: getPreviewBg(activity.type),
        previewIcon: getPreviewIcon(activity.type),
        stroke: getPreviewStroke(activity.type),
        action: getActionButton(activity.status),
        recipient: activity.recipient,
        content: activity.content,
        subject: activity.subject,
        rawPrompt: activity.prompt,
        // Poster/Logo specific data
        templateType: activity.templateType,
        logoName: activity.logoName,
        formData: activity.formData,
        generatedImageUrl: activity.generatedImageUrl,
        // Report specific data
        reportType: activity.reportType,
        rawInput: activity.rawInput,
    }));
};

export const HistoryProvider = ({ children }) => {
    const [historyItems, setHistoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = useCallback(async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const response = await fetchWithAuth(API_ENDPOINTS.EMAIL.HISTORY, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error('Failed to fetch history');
            }

            const data = await response.json();
            if (!data.success || !data.data) {
                console.warn("History fetch success was false or data missing", data);
                setHistoryItems([]);
                return;
            }

            const formatted = transformActivities(data.data.all || []);
            setHistoryItems(formatted);
            setError(null);
        } catch (err) {
            console.error("Error fetching history:", err);
            setError(err.message);
            setHistoryItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteActivity = async (activityId) => {
        try {
            const response = await fetchWithAuth(`${API_ENDPOINTS.EMAIL.ACTIVITY}/${activityId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete activity');
            }

            setHistoryItems(prev => prev.filter(item => item.id !== activityId));
            return { success: true };
        } catch (err) {
            console.error("Error deleting activity:", err);
            throw err;
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <HistoryContext.Provider value={{
            historyItems,
            setHistoryItems,
            loading,
            error,
            refreshHistory: fetchHistory,
            deleteActivity
        }}>
            {children}
        </HistoryContext.Provider>
    );
};

export const useHistory = () => {
    const context = useContext(HistoryContext);
    if (!context) {
        throw new Error('useHistory must be used within HistoryProvider');
    }
    return context;
};

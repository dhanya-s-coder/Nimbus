import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHistory } from '../../context/HistoryContext';
import { toast } from '../../utils/toast';
import '../tools/history/activity.css';

const RecentActivity = ({ filterType = 'All', limit = 3, showViewAll = true, title = "Recent Activity" }) => {
    const { historyItems, loading, deleteActivity } = useHistory();
    const navigate = useNavigate();

    const filteredItems = historyItems.filter(item => {
        if (filterType === 'All') return true;
        const typeMatch = item.type?.toLowerCase();
        const targetType = filterType.toLowerCase();

        if (targetType === 'emails') return typeMatch === 'email';
        if (targetType === 'posters') return typeMatch === 'poster';
        if (targetType === 'logos') return typeMatch === 'logo';
        if (targetType === 'reports') return typeMatch === 'report';
        return typeMatch === targetType;
    }).slice(0, limit);

    const handleDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await deleteActivity(id);
            toast.success("Item deleted successfully");
        } catch (error) {
            toast.error(error.message || "Failed to delete item");
        }
    };

    const handleAction = (item) => {
        if (item.type === 'email') {
            navigate('/email-generator', { state: { emailData: item } });
        } else if (item.type === 'poster') {
            navigate('/poster-generator', { state: { posterData: item } });
        } else if (item.type === 'logo') {
            navigate('/logo-generator', { state: { logoData: item } });
        } else if (item.type === 'report') {
            navigate('/report-generator', { state: { Data: item } });
        } else {
            toast.info(`${item.action} for ${item.type} coming soon`);
        }
    };

    if (loading) return (
        <div className="activity-empty">
            <h3>Loading recent activity...</h3>
        </div>
    );

    return (
        <div className="recent-activity-wrapper">
            <div className="section-header">
                <h2 className="section-title">{title}</h2>
                {showViewAll && (
                    <Link
                        to="/activity"
                        state={{ initialFilter: filterType }}
                        className="view-all-link"
                    >
                        View All →
                    </Link>
                )}
            </div>

            <div className="activity-list">
                {filteredItems.length === 0 ? (
                    <div className="activity-empty">
                        <h3>Your journey starts here.</h3>
                        <p>Generate your first item to see it here.</p>
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <div key={item.id} className="activity-item">
                            {/* Preview Box */}
                            <div className="preview-box">
                                <span className="preview-box-icon">
                                    {item.previewIcon || (item.type?.toLowerCase() === 'email' ? '📧' : item.type?.toLowerCase() === 'logo' ? '🎯' : item.type?.toLowerCase() === 'report' ? '📊' : '🎨')}
                                </span>
                                <span className="preview-box-text">
                                    {item.type}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="activity-details">
                                <h4 className="activity-title">{item.title}</h4>
                                <p className="activity-prompt">{item.prompt}</p>
                                <p className="activity-date">{item.date}</p>
                            </div>

                            {/* Actions - Vertical as requested */}
                            <div className="activity-actions">
                                <button
                                    className={`activity-action ${item.status === 'draft' ? 'edit' : 'view'}`}
                                    onClick={() => handleAction(item)}
                                >
                                    {item.status === 'draft' ? 'Edit' : 'View'}
                                </button>
                                <button
                                    className="activity-action delete"
                                    onClick={(e) => handleDelete(e, item.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>);
};

export default RecentActivity;

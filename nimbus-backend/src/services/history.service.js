import { User } from "../models/User.js";

export const getActivityByUser = async (userId) => {
    try {
        const user = await User.findById(userId)
            .select('activities')
            .lean();

        if (!user || !user.activities) return [];

        const { emailDrafts = [], sentEmails = [], posterDrafts = [], logoDrafts = [], reports = [] } = user.activities;

        const allActivities = [
            ...emailDrafts.map(d => ({
                ...d,
                _id: d._id.toString(),
                type: 'email',
                status: 'draft',
                title: d.subject || 'Untitled Draft'
            })),
            ...sentEmails.map(s => ({
                ...s,
                _id: s._id.toString(),
                type: 'email',
                status: 'sent',
                title: s.subject || 'Untitled Email'
            })),
            ...posterDrafts.map(p => ({
                ...p,
                _id: p._id.toString(),
                type: 'poster',
                status: p.status || 'draft',
                title: p.formData?.eventTitle || p.formData?.eventName || p.formData?.announcementTitle || p.formData?.recruitmentTitle || 'Untitled Poster'
            })),
            ...logoDrafts.map(l => ({
                ...l,
                _id: l._id.toString(),
                type: 'logo',
                status: l.status || 'draft',
                title: l.logoName || 'Untitled Logo'
            })),
            ...reports.map(r => ({
                ...r,
                _id: r._id.toString(),
                type: 'report',
                status: r.status || 'final',
                title: r.title || 'Untitled Report'
            }))
        ];

        allActivities.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        return allActivities;
    } catch (error) {
        console.error("Error fetching user activities:", error);
        throw error;
    }
};

export const saveEmailDraft = async (userId, draftData) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { $push: { 'activities.emailDrafts': draftData } },
            { new: true, select: { 'activities.emailDrafts': { $slice: -1 } } }
        ).lean();

        if (!updatedUser) throw new Error("User not found");
        return updatedUser.activities.emailDrafts[0];
    } catch (error) {
        console.error("Error saving email draft to user:", error);
        throw error;
    }
};

export const savePosterDraft = async (userId, draftData) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { $push: { 'activities.posterDrafts': draftData } },
            { new: true, select: { 'activities.posterDrafts': { $slice: -1 } } }
        ).lean();

        if (!updatedUser) throw new Error("User not found");
        return updatedUser.activities.posterDrafts[0];
    } catch (error) {
        console.error("Error saving poster draft to user:", error);
        throw error;
    }
};

export const saveLogoDraft = async (userId, draftData) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { $push: { 'activities.logoDrafts': draftData } },
            { new: true, select: { 'activities.logoDrafts': { $slice: -1 } } }
        ).lean();

        if (!updatedUser) throw new Error("User not found");
        return updatedUser.activities.logoDrafts[0];
    } catch (error) {
        console.error("Error saving logo draft to user:", error);
        throw error;
    }
};

export const saveReport = async (userId, reportData) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { $push: { 'activities.reports': reportData } },
            { new: true, select: { 'activities.reports': { $slice: -1 } } }
        ).lean();

        if (!updatedUser) throw new Error("User not found");
        return updatedUser.activities.reports[0];
    } catch (error) {
        console.error("Error saving report to user:", error);
        throw error;
    }
};

export const saveSentEmail = async (userId, emailData) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { $push: { 'activities.sentEmails': emailData } },
            { new: true, select: { 'activities.sentEmails': { $slice: -1 } } }
        ).lean();

        if (!updatedUser) throw new Error("User not found");
        return updatedUser.activities.sentEmails[0];
    } catch (error) {
        console.error("Error saving sent email to user:", error);
        throw error;
    }
};

export const getActivityByUserAndType = async (userId, type) => {
    try {
        const fieldMap = {
            'email': 'activities.emailDrafts activities.sentEmails',
            'poster': 'activities.posterDrafts',
            'logo': 'activities.logoDrafts',
            'report': 'activities.reports'
        };

        const user = await User.findById(userId)
            .select(fieldMap[type] || 'activities')
            .lean();

        if (!user || !user.activities) return [];

        let activities = [];

        if (type === 'email') {
            const drafts = (user.activities.emailDrafts || []).map(d => ({
                ...d,
                type: 'email',
                status: 'draft',
                title: d.subject || 'Untitled Draft'
            }));
            const sent = (user.activities.sentEmails || []).map(s => ({
                ...s,
                type: 'email',
                status: 'sent',
                title: s.subject || 'Untitled Email'
            }));
            activities = [...drafts, ...sent];
        } else if (type === 'poster') {
            activities = (user.activities.posterDrafts || []).map(p => ({
                ...p,
                type: 'poster',
                status: p.status || 'draft',
                title: p.formData?.eventTitle || p.formData?.eventName || p.formData?.announcementTitle || p.formData?.recruitmentTitle || 'Untitled Poster'
            }));
        } else if (type === 'logo') {
            activities = (user.activities.logoDrafts || []).map(l => ({
                ...l,
                type: 'logo',
                status: l.status || 'draft',
                title: l.logoName || 'Untitled Logo'
            }));
        } else if (type === 'report') {
            activities = (user.activities.reports || []).map(r => ({
                ...r,
                type: 'report',
                status: r.status || 'final',
                title: r.title || 'Untitled Report'
            }));
        }

        return activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error("Error fetching activities by type:", error);
        throw error;
    }
};

export const deleteActivity = async (userId, activityId) => {
    try {
        const result = await User.updateOne(
            { _id: userId },
            {
                $pull: {
                    "activities.emailDrafts": { _id: activityId },
                    "activities.sentEmails": { _id: activityId },
                    "activities.posterDrafts": { _id: activityId },
                    "activities.logoDrafts": { _id: activityId },
                    "activities.reports": { _id: activityId },
                },
            }
        );

        return result.modifiedCount > 0 ? { success: true, message: "Activity deleted successfully" } : null;
    } catch (error) {
        console.error("Error deleting activity:", error);
        throw error;
    }
};

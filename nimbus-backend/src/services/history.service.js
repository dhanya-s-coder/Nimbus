import { Activity } from "../models/Activity.js";
import { User } from "../models/User.js";

//  * Get complete activity history for a specific user
//  * Combines emails (from User document) and posters, logos (from Activity collection)
export const getActivityByUser = async (userId) => {
    try {
        // Fetch User for embedded email activities
        const user = await User.findById(userId);
        let embeddedEmails = [];

        if (user && user.activities) {
            const drafts = user.activities.emailDrafts || [];
            const sent = user.activities.sentEmails || [];

            embeddedEmails = [
                ...drafts.map(d => ({ ...d.toObject(), type: 'email', status: 'draft' })),
                ...sent.map(s => ({ ...s.toObject(), type: 'email', status: 'sent' }))
            ];
        }

        // Fetch other activities from collection
        const otherActivities = await Activity.find({
            user_id: userId,
            type: { $ne: 'email' }
        }).sort({ createdAt: -1 }).exec();

        // Combine all and sort by date
        const allActivities = [...embeddedEmails, ...otherActivities].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        return allActivities;
    } catch (error) {
        console.error("Error fetching user activities:", error);
        throw error;
    }
};

/**
 * Save an email draft directly into the User document
 */
export const saveEmailDraft = async (userId, draftData) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        if (!user.activities) user.activities = { emailDrafts: [], sentEmails: [] };

        user.activities.emailDrafts.push(draftData);
        await user.save();

        // Return the last added item (the draft) with its new ID
        return user.activities.emailDrafts[user.activities.emailDrafts.length - 1];
    } catch (error) {
        console.error("Error saving email draft to user:", error);
        throw error;
    }
};

/**
 * Save a sent email directly into the User document
 */
export const saveSentEmail = async (userId, emailData) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        if (!user.activities) user.activities = { emailDrafts: [], sentEmails: [] };

        user.activities.sentEmails.push(emailData);
        await user.save();

        // Return the last added item
        return user.activities.sentEmails[user.activities.sentEmails.length - 1];
    } catch (error) {
        console.error("Error saving sent email to user:", error);
        throw error;
    }
};

//Get activities for a specific user filtered by type
export const getActivityByUserAndType = async (userId, type) => {
    try {
        if (type === 'email') {
            const user = await User.findById(userId);
            let emails = [];
            if (user && user.activities) {
                emails = [
                    ...(user.activities.emailDrafts || []).map(d => ({
                        ...d.toObject(),
                        type: 'email',
                        status: 'draft',
                        title: d.subject || 'Untitled Draft'
                    })),
                    ...(user.activities.sentEmails || []).map(s => ({
                        ...s.toObject(),
                        type: 'email',
                        status: 'sent',
                        title: s.subject || 'Untitled Email'
                    }))
                ];
            }
            return emails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const activities = await Activity.find({
            user_id: userId,
            type: type
        })
            .sort({ createdAt: -1 })
            .exec();
        return activities;
    } catch (error) {
        console.error("Error fetching activities by type:", error);
        throw error;
    }
};

/**
 * Get all drafts for a user
 */
export const getUserDrafts = async (userId) => {
    try {
        const user = await User.findById(userId);
        const drafts = user?.activities?.emailDrafts?.map(d => ({ ...d.toObject(), type: 'email', status: 'draft' })) || [];

        const otherDrafts = await Activity.find({
            user_id: userId,
            status: 'draft',
            type: { $ne: 'email' }
        }).sort({ createdAt: -1 }).exec();

        return [...drafts, ...otherDrafts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error("Error fetching user drafts:", error);
        throw error;
    }
};

/**
 * Get all sent items for a user
 */
export const getUserSentItems = async (userId) => {
    try {
        const user = await User.findById(userId);
        const sent = user?.activities?.sentEmails?.map(s => ({
            ...s.toObject(),
            type: 'email',
            status: 'sent',
            title: s.subject || 'Untitled Email'
        })) || [];

        const otherSent = await Activity.find({
            user_id: userId,
            status: 'sent',
            type: { $ne: 'email' }
        }).sort({ createdAt: -1 }).exec();

        return [...sent, ...otherSent].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error("Error fetching sent items:", error);
        throw error;
    }
};

/**
 * Save a new activity (email draft, sent email, poster, logo, etc.)
 */
export const saveActivity = async (activityData) => {
    try {
        const activity = new Activity(activityData);
        await activity.save();
        return activity;
    } catch (error) {
        console.error("Error saving activity:", error);
        throw error;
    }
};

/**
 * Update an activity (e.g., change draft to sent)
 */
export const updateActivity = async (activityId, updateData) => {
    try {
        const activity = await Activity.findByIdAndUpdate(
            activityId,
            updateData,
            { new: true }
        );
        return activity;
    } catch (error) {
        console.error("Error updating activity:", error);
        throw error;
    }
};

/**
 * Delete an activity (handling both embedded and collection)
 */
export const deleteActivity = async (userId, activityId) => {
    try {
        // Try deleting from User embedded activities first
        const user = await User.findById(userId);
        if (user && user.activities) {
            const initialDraftsCount = user.activities.emailDrafts.length;
            user.activities.emailDrafts = user.activities.emailDrafts.filter(d => d._id.toString() !== activityId);

            const initialSentCount = user.activities.sentEmails.length;
            user.activities.sentEmails = user.activities.sentEmails.filter(s => s._id.toString() !== activityId);

            if (user.activities.emailDrafts.length < initialDraftsCount || user.activities.sentEmails.length < initialSentCount) {
                await user.save();
                return { success: true, message: "Embedded activity deleted" };
            }
        }

        // If not found in embedded, try Activity collection
        const result = await Activity.findOneAndDelete({ _id: activityId, user_id: userId });
        return result;
    } catch (error) {
        console.error("Error deleting activity:", error);
        throw error;
    }
};



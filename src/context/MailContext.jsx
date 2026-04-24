import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { mailAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const MailContext = createContext();

export const MailProvider = ({ children }) => {
    const { user } = useAuth();
    const [emails, setEmails] = useState([]);
    const [currentFolder, setCurrentFolder] = useState('inbox');
    const [loading, setLoading] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({ inbox: 0, spam: 0, trash: 0 });
    const [labels, setLabels] = useState([]);

    const fetchEmails = useCallback(async (folder = currentFolder) => {
        if (!user) return;
        setLoading(true);
        setCurrentFolder(folder);
        try {
            let res;
            switch (folder.toLowerCase()) {
                case 'inbox': res = await mailAPI.getInbox(); break;
                case 'sent': res = await mailAPI.getSent(); break;
                case 'starred': res = await mailAPI.getStarred(); break;
                case 'trash': res = await mailAPI.getTrash(); break;
                case 'spam': res = await mailAPI.getSpam(); break;
                case 'snoozed': res = await mailAPI.getSnoozed(); break;
                default: res = await mailAPI.getInbox();
            }

            if (res.data?.success) {
                const data = res.data.data;
                const normalizedEmails = (data.emails || []).map(m => ({
                    ...m,
                    starred: m.starred ?? m.isStarred ?? false
                }));
                setEmails(normalizedEmails);
                setUnreadCounts(prev => ({ ...prev, [folder]: data.unreadCount || 0 }));
            }
        } catch (error) {
            console.error(`Failed to fetch ${folder}:`, error);
            toast.error(`Failed to load ${folder}`);
        } finally {
            setLoading(false);
        }
    }, [user, currentFolder]);

    const fetchLabels = useCallback(async () => {
        if (!user) return;
        try {
            const res = await mailAPI.getLabels();
            if (res.data?.success) {
                setLabels(res.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch labels:', error);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchEmails();
            fetchLabels();
        }
    }, [user, fetchEmails, fetchLabels]);

    const handleToggleStar = async (uid, folder) => {
        // Optimistic update
        setEmails(prev => {
            if (folder?.toLowerCase() === 'starred') {
                return prev.filter(m => m.uid !== uid);
            }
            return prev.map(m => m.uid === uid ? { ...m, starred: !m.starred } : m);
        });

        try {
            const res = await mailAPI.toggleStar(uid, folder);
            if (!res.data?.success) {
                // Rollback if failed (simplified for this example)
                fetchEmails(folder);
                toast.error('Failed to update star');
            }
        } catch (error) {
            fetchEmails(folder);
            toast.error('Failed to update star');
        }
    };

    const handleMarkRead = async (uid) => {
        try {
            await mailAPI.markRead(uid);
            setEmails(prev => prev.map(m => {
                if (m.uid === uid && !m.isRead) {
                    // Update unread counts locally
                    setUnreadCounts(counts => ({
                        ...counts,
                        inbox: Math.max(0, counts.inbox - 1)
                    }));
                    return { ...m, isRead: true };
                }
                return m;
            }));
        } catch (error) {
            console.error('Mark read failed:', error);
        }
    };

    const handleMarkUnread = async (uid) => {
        try {
            await mailAPI.markUnread(uid);
            setEmails(prev => prev.map(m => m.uid === uid ? { ...m, isRead: false } : m));
        } catch (error) {
            console.error('Mark unread failed:', error);
        }
    };

    const handleMoveToTrash = async (uid, folder) => {
        try {
            await mailAPI.trash(uid, folder);
            setEmails(prev => prev.filter(m => m.uid !== uid));
            toast.success('Moved to trash');
        } catch (error) {
            toast.error('Failed to move to trash');
        }
    };

    const handleSnooze = async (uid, wakeUpAt) => {
        try {
            await mailAPI.snooze(uid, wakeUpAt);
            setEmails(prev => prev.filter(m => m.uid !== uid));
            toast.success('Snoozed email');
        } catch (error) {
            toast.error('Failed to snooze');
        }
    };

    return (
        <MailContext.Provider value={{
            emails,
            loading,
            currentFolder,
            setCurrentFolder,
            unreadCounts,
            labels,
            fetchEmails,
            fetchLabels,
            handleToggleStar,
            handleMarkRead,
            handleMarkUnread,
            handleMoveToTrash,
            handleSnooze
        }}>
            {children}
        </MailContext.Provider>
    );
};

export default MailProvider;
export const useMail = () => useContext(MailContext);

import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { mailAPI, api } from '../services/api';
import { API_ENDPOINTS } from '../Data/constants';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import toast from 'react-hot-toast';

const MailContext = createContext();

export const MailProvider = ({ children }) => {
    const { user } = useAuth();
    const { emailsPerPage: limit } = useTheme();
    const [emails, setEmails] = useState([]);
    const [currentFolder, setCurrentFolder] = useState('inbox');
    const currentFolderRef = useRef('inbox');
    const pagesCache = useRef({});
    const [loading, setLoading] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({ inbox: 0, spam: 0, trash: 0 });
    const [labels, setLabels] = useState([]);
    const [totalEmails, setTotalEmails] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        currentFolderRef.current = currentFolder;
    }, [currentFolder]);

    const fetchLabelEmails = useCallback(async (labelId, silent = false, page = 1) => {

        if (currentFolder !== `label-${labelId}`) setCurrentPage(1);
        else setCurrentPage(page);
        if (!user) return;
        if (!silent) setLoading(true);
        // Only clear if the folder actually changed to avoid flashing on auto-polling/refresh
        setEmails(prev => (currentFolder === `label-${labelId}` ? prev : []));
        setCurrentFolder(`label-${labelId}`);
        try {
            // Fetching all emails for a specific label
            // Assuming the endpoint follows the pattern /api/mail/labels/{id}
            const res = await api.get(`${API_ENDPOINTS.MAIL.LABELS}/${labelId}?page=${page}&limit=${limit}`);
            if (res.data?.success) {
                const data = res.data.data;
                setTotalEmails(data.totalCount || 0);
                const normalizedEmails = (data.emails || data || []).map(m => ({
                    ...m,
                    starred: m.starred ?? m.isStarred ?? false
                })).filter(m => m.folderName?.toLowerCase() !== 'trash');

                normalizedEmails.sort((a, b) => {
                    const dateA = new Date(a.date || a.receivedDate || a.sentDate || 0);
                    const dateB = new Date(b.date || b.receivedDate || b.sentDate || 0);
                    return dateB - dateA;
                });

                setEmails(normalizedEmails);
            }
        } catch (error) {
            console.error('Failed to fetch label emails:', error);
            toast.error('Failed to load labeled emails');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [user, currentFolder, limit]);

    const fetchEmails = useCallback(async (folder = currentFolder, silent = false, page = 1) => {
        const folderKey = folder.toLowerCase();
        
        if (currentFolder !== folder) setCurrentPage(1);
        else setCurrentPage(page);
        
        if (!user) return;

        // Check cache if not silent (manual navigation)
        if (!silent && pagesCache.current[folderKey] && pagesCache.current[folderKey][page]) {
            setEmails(pagesCache.current[folderKey][page]);
            setCurrentFolder(folder);
            currentFolderRef.current = folder;
            return;
        }

        if (!silent) {
            setLoading(true);
        }
        
        setCurrentFolder(folder);
        currentFolderRef.current = folder;
        try {
            let res;
            switch (folder.toLowerCase()) {
                case 'inbox': res = await mailAPI.getInbox(page, limit); break;
                case 'sent': res = await mailAPI.getSent(page, limit); break;
                case 'draft':
                case 'drafts': res = await mailAPI.getDrafts(page, limit); break;
                case 'starred': res = await mailAPI.getStarred(page, limit); break;
                case 'trash': res = await mailAPI.getTrash(page, limit); break;
                case 'spam': res = await mailAPI.getSpam(page, limit); break;
                case 'snoozed': res = await mailAPI.getSnoozed(page, limit); break;
                case 'archive': res = await mailAPI.getArchive(page, limit); break;
                case 'unread': res = await mailAPI.getUnread(page, limit); break;
                case 'all-inbox':
                case 'allinbox': {
                    const sessionsStr = localStorage.getItem('bnx_sessions');
                    let sessions = {};
                    try {
                        sessions = sessionsStr ? JSON.parse(sessionsStr) : {};
                    } catch (e) { }

                    const sessionKeys = Object.keys(sessions);
                    if (sessionKeys.length === 0) {
                        res = await mailAPI.getInbox(page, limit);
                        break;
                    }

                    const fetchPromises = sessionKeys.map(async (email) => {
                        const token = sessions[email].accessToken;
                        try {
                            const inboxRes = await api.get(API_ENDPOINTS.MAIL.INBOX, {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            });
                            if (inboxRes.data?.success) {
                                const emailsList = inboxRes.data.data?.emails || [];
                                return emailsList.map(e => ({
                                    ...e,
                                    accountEmail: email
                                }));
                            }
                        } catch (err) {
                            console.error(`Failed to fetch all-inbox for ${email}:`, err);
                        }
                        return [];
                    });

                    const results = await Promise.all(fetchPromises);
                    const mergedEmails = results.flat();

                    mergedEmails.sort((a, b) => {
                        const dateA = new Date(a.date || a.receivedDate || a.sentDate || 0);
                        const dateB = new Date(b.date || b.receivedDate || b.sentDate || 0);
                        return dateB - dateA;
                    });

                    const totalUnreadCount = mergedEmails.filter(e => !e.isRead).length;

                    res = {
                        data: {
                            success: true,
                            data: {
                                emails: mergedEmails,
                                unreadCount: totalUnreadCount
                            }
                        }
                    };
                    break;
                }
                case 'all-mail':
                case 'allmail': {
                    const [inboxRes, sentRes, draftRes, archiveRes] = await Promise.all([
                        mailAPI.getInbox().catch(() => ({ data: { success: false } })),
                        mailAPI.getSent().catch(() => ({ data: { success: false } })),
                        mailAPI.getDrafts().catch(() => ({ data: { success: false } })),
                        mailAPI.getArchive().catch(() => ({ data: { success: false } }))
                    ]);

                    let mergedEmails = [];
                    if (inboxRes.data?.success && inboxRes.data.data?.emails) {
                        mergedEmails = [...mergedEmails, ...inboxRes.data.data.emails];
                    }
                    if (sentRes.data?.success && sentRes.data.data?.emails) {
                        mergedEmails = [...mergedEmails, ...sentRes.data.data.emails];
                    }
                    if (draftRes.data?.success && draftRes.data.data?.emails) {
                        mergedEmails = [...mergedEmails, ...draftRes.data.data.emails];
                    }
                    if (archiveRes.data?.success && archiveRes.data.data?.emails) {
                        mergedEmails = [...mergedEmails, ...archiveRes.data.data.emails];
                    }

                    console.log('📬 [All Mail] Inbox count:', inboxRes.data?.data?.emails?.length);
                    console.log('📬 [All Mail] Sent count:', sentRes.data?.data?.emails?.length);
                    console.log('📬 [All Mail] Draft count:', draftRes.data?.data?.emails?.length);
                    console.log('📬 [All Mail] Archive count:', archiveRes.data?.data?.emails?.length);
                    console.log('📬 [All Mail] Merged count:', mergedEmails.length);

                    // Sort descending by date
                    mergedEmails.sort((a, b) => {
                        const dateA = new Date(a.date || a.sentDate || a.receivedDate || 0);
                        const dateB = new Date(b.date || b.sentDate || b.receivedDate || 0);
                        return dateB - dateA;
                    });

                    res = {
                        data: {
                            success: true,
                            data: {
                                emails: mergedEmails,
                                unreadCount: (inboxRes.data?.success && inboxRes.data.data?.unreadCount) ? inboxRes.data.data.unreadCount : 0
                            }
                        }
                    };
                    break;
                }
                default: res = await mailAPI.getInbox(page, limit);
            }

            if (res.data?.success) {
                if (currentFolderRef.current === folder) {
                    const data = res.data.data;
                    setTotalEmails(data.totalCount || 0);
                    let normalizedEmails = (data.emails || []).map(m => ({
                        ...m,
                        starred: m.starred ?? m.isStarred ?? false
                    }));
                    if (folder === 'starred') {
                        normalizedEmails = normalizedEmails.filter(m => m.folderName?.toLowerCase() !== 'trash');
                    }
                    
                    // Update Cache
                    const folderKey = folder.toLowerCase();
                    if (!pagesCache.current[folderKey]) pagesCache.current[folderKey] = {};
                    pagesCache.current[folderKey][page] = normalizedEmails;
                    
                    // Only update state if this is still the active page
                    setEmails(normalizedEmails);
                    
                    const countKey = folderKey.replace('-', '').replace(' ', '');
                    setUnreadCounts(prev => ({ ...prev, [countKey]: data.unreadCount || 0 }));
                }
            }
        } catch (error) {
            console.error(`Failed to fetch ${folder}:`, error);
            toast.error(`Failed to load ${folder}`);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [user, currentFolder, limit]);

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
            fetchLabels();
        }
    }, [user, fetchLabels]);

    const handlePageChange = useCallback((newPage) => {
        if (currentFolder.startsWith('label-')) {
            const labelId = currentFolder.replace('label-', '');
            fetchLabelEmails(labelId, false, newPage);
        } else {
            fetchEmails(currentFolder, false, newPage);
        }
    }, [currentFolder, fetchLabelEmails, fetchEmails]);

    // Background auto-polling for new emails every 30 seconds
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            if (!document.hidden) {
                console.log('⏰ Auto-polling emails for:', currentFolder);
                if (currentFolder.startsWith('label-')) {
                    const labelId = currentFolder.replace('label-', '');
                    fetchLabelEmails(labelId, true);
                } else {
                    fetchEmails(currentFolder, true);
                }
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [user, currentFolder, fetchEmails, fetchLabelEmails]);

    const handleToggleStar = async (uid, folder) => {
        // Optimistic update
        setEmails(prev => {
            if (currentFolder?.toLowerCase() === 'starred') {
                return prev.filter(m => String(m.uid) !== String(uid));
            }
            return prev.map(m => String(m.uid) === String(uid) ? { ...m, starred: !m.starred } : m);
        });

        try {
            const res = await mailAPI.toggleStar(uid, folder);
            if (!res.data?.success) {
                // Rollback if failed
                if (currentFolder.startsWith('label-')) {
                    const labelId = currentFolder.replace('label-', '');
                    fetchLabelEmails(labelId);
                } else {
                    fetchEmails(currentFolder);
                }
                toast.error('Failed to update star');
            }
        } catch (error) {
            if (currentFolder.startsWith('label-')) {
                const labelId = currentFolder.replace('label-', '');
                fetchLabelEmails(labelId);
            } else {
                fetchEmails(currentFolder);
            }
            toast.error('Failed to update star');
        }
    };

    const handleMarkRead = async (uid, silent = false) => {
        try {
            await mailAPI.markRead(uid);
            setEmails(prev => prev.map(m => {
                if (String(m.uid) === String(uid) && !m.isRead) {
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

    const handleMarkUnread = async (uid, silent = false) => {
        try {
            await mailAPI.markUnread(uid);
            setEmails(prev => prev.map(m => String(m.uid) === String(uid) ? { ...m, isRead: false } : m));
        } catch (error) {
            console.error('Mark unread failed:', error);
        }
    };

    const handleMoveToTrash = async (uid, folder, silent = false) => {
        try {
            await mailAPI.trash(uid, folder);
            setEmails(prev => prev.filter(m => String(m.uid) !== String(uid)));
            delete pagesCache.current['trash'];
            if (folder) delete pagesCache.current[folder.toLowerCase()];
            if (!silent) toast.success('Moved to trash');
        } catch (error) {
            if (!silent) toast.error('Failed to move to trash');
        }
    };

    const handleDeletePermanently = async (uid, silent = false) => {
        try {
            await mailAPI.permanentDelete(uid);
            setEmails(prev => prev.filter(m => String(m.uid) !== String(uid)));
            delete pagesCache.current['trash'];
            if (currentFolder) delete pagesCache.current[currentFolder.toLowerCase()];
            if (!silent) toast.success('Permanently deleted');
        } catch (error) {
            if (!silent) toast.error('Failed to delete permanently');
        }
    };

    const handleSnooze = async (uid, wakeUpAt, folder = 'INBOX', silent = false) => {
        try {
            await mailAPI.snooze(uid, wakeUpAt, folder);
            setEmails(prev => prev.filter(m => String(m.uid) !== String(uid)));
            if (!silent) toast.success('Snoozed email');
        } catch (error) {
            if (!silent) toast.error('Failed to snooze');
        }
    };

    const handleCreateLabel = async (name, colorHex, parentId = null) => {
        try {
            const res = await mailAPI.createLabel({ name, colorHex, parentId });
            if (res.data?.success) {
                toast.success('Label created');
                fetchLabels();
                return res.data.data;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create label');
        }
    };

    const handleUpdateLabel = async (id, name, colorHex, parentId = null) => {
        try {
            const res = await mailAPI.updateLabel(id, { name, colorHex, parentId });
            if (res.data.success) {
                toast.success('Label updated');
                fetchLabels();
                return true;
            }
        } catch (error) {
            console.error('Update label error:', error);
            // Error handling via interceptor
        }
        return false;
    };

    const handleDeleteLabel = async (labelId) => {
        try {
            const res = await mailAPI.deleteLabel(labelId);
            if (res.data?.success) {
                toast.success('Label deleted');
                fetchLabels();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete label');
        }
    };

    const handleApplyLabel = async (uid, labelId, folder = currentFolder, silent = false) => {
        try {
            await mailAPI.applyLabel(uid, labelId, folder);
            if (!silent) toast.success('Label applied');
            if (currentFolder.startsWith('label-')) {
                const currentLabelId = currentFolder.replace('label-', '');
                fetchLabelEmails(currentLabelId);
            } else {
                fetchEmails(currentFolder);
            }
        } catch (error) {
            if (!silent) toast.error('Failed to apply label');
        }
    };

    const handleRemoveLabel = async (uid, labelId, folder = currentFolder, silent = false) => {
        try {
            await mailAPI.removeLabel(uid, labelId, folder);
            if (!silent) toast.success('Label removed');
            if (currentFolder === `label-${labelId}`) {
                setEmails(prev => prev.filter(m => String(m.uid) !== String(uid)));
            } else {
                setEmails(prev => prev.map(m => String(m.uid) === String(uid) ? { ...m, labels: m.labels?.filter(l => l.id !== labelId) } : m));
            }
        } catch (error) {
            if (!silent) toast.error('Failed to remove label');
        }
    };

    const handleArchive = async (uid, folder, silent = false) => {
        try {
            await mailAPI.archive(uid, folder);
            if (currentFolder === 'inbox') {
                setEmails(prev => prev.filter(m => String(m.uid) !== String(uid)));
            } else {
                setEmails(prev => prev.map(m => String(m.uid) === String(uid) ? { ...m, folderName: 'Archive' } : m));
            }
            // Invalidate cache
            if (folder) delete pagesCache.current[folder.toLowerCase()];
            delete pagesCache.current['archive'];
            if (!silent) toast.success('Email archived');
        } catch (error) {
            console.error('Failed to archive:', error);
            if (!silent) toast.error('Failed to archive email');
        }
    };

    const handleUnarchive = async (uid, silent = false) => {
        try {
            await mailAPI.unarchive(uid);
            if (currentFolder === 'archive') {
                setEmails(prev => prev.filter(m => String(m.uid) !== String(uid)));
            } else {
                setEmails(prev => prev.map(m => String(m.uid) === String(uid) ? { ...m, folderName: 'INBOX' } : m));
            }
            // Invalidate cache
            delete pagesCache.current['archive'];
            delete pagesCache.current['inbox'];
            if (!silent) toast.success('Email restored');
        } catch (error) {
            console.error('Failed to unarchive:', error);
            if (!silent) toast.error('Failed to unarchive email');
        }
    };

    const handleMarkSpam = async (uid, folder = currentFolder, silent = false) => {
        try {
            await mailAPI.markSpam(uid, folder);
            setEmails(prev => prev.filter(m => String(m.uid) !== String(uid)));
            if (!silent) toast.success('Reported as spam');
        } catch (error) {
            if (!silent) toast.error('Failed to report spam');
        }
    };

    const handleRestoreSpam = async (uid, silent = false) => {
        try {
            await mailAPI.restoreSpam(uid);
            setEmails(prev => prev.filter(m => String(m.uid) !== String(uid)));
            if (!silent) toast.success('Restored from spam');
        } catch (error) {
            if (!silent) toast.error('Failed to restore from spam');
        }
    };

    const handleUnsubscribe = async (senderEmail, silent = false) => {
        try {
            await mailAPI.unsubscribe(senderEmail);
            if (!silent) toast.success('Unsubscribed from ' + senderEmail);
        } catch (error) {
            if (!silent) toast.error('Failed to unsubscribe');
        }
    };

    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [isComposeMinimized, setIsComposeMinimized] = useState(false);
    const [isComposeMaximized, setIsComposeMaximized] = useState(false);
    const [composeData, setComposeData] = useState(null);

    const openCompose = useCallback((data = null) => {
        if (data && data.replyTo) {
            const match = data.replyTo.match(/<([^>]+)>/);
            if (match) {
                data.replyTo = match[1];
            }
        }
        setComposeData(data);
        setIsComposeOpen(true);
        setIsComposeMinimized(false);
        setIsComposeMaximized(false);
    }, []);

    const closeCompose = useCallback(() => {
        setIsComposeOpen(false);
        setComposeData(null);
    }, []);

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
            fetchLabelEmails,
            handleToggleStar,
            handleMarkRead,
            handleMarkUnread,
            totalEmails,
            currentPage,
            handlePageChange,
            handleMoveToTrash,
            handleDeletePermanently,
            handleSnooze,
            handleCreateLabel,
            handleUpdateLabel,
            handleApplyLabel,
            handleRemoveLabel,
            handleArchive,
            handleUnarchive,
            handleMarkSpam,
            handleRestoreSpam,
            handleUnsubscribe,
            handleDeleteLabel,
            isComposeOpen,
            setIsComposeOpen,
            isComposeMinimized,
            setIsComposeMinimized,
            isComposeMaximized,
            setIsComposeMaximized,
            composeData,
            setComposeData,
            openCompose,
            closeCompose
        }}>
            {children}
        </MailContext.Provider>
    );
};

export default MailProvider;
export const useMail = () => useContext(MailContext);

import axios from 'axios';
import { API_ENDPOINTS } from '../Data/constants';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.bnxmail.com';

console.log('🔧 API Base URL:', API_BASE_URL);

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
    withCredentials: false,
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor for Token Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, { refreshToken });
                    if (res.data?.accessToken) {
                        localStorage.setItem('accessToken', res.data.accessToken);
                        localStorage.setItem('refreshToken', res.data.refreshToken);
                        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    localStorage.clear();
                    window.location.href = '/login';
                }
            } else {
                // Only redirect if we're not on a public/temp-token page
                const isAuthPage = ['/login', '/register', '/create-mailbox'].includes(window.location.pathname);
                if (!isAuthPage) {
                    localStorage.clear();
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => api.post(API_ENDPOINTS.AUTH.REGISTER, data),
    login: (data) => api.post(API_ENDPOINTS.AUTH.LOGIN, data, {
        headers: { 'X-Device-Name': 'Web Browser' }
    }),
    refresh: (refreshToken) => api.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }),
    logout: (refreshToken) => api.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken }),
    sessions: () => api.get(API_ENDPOINTS.AUTH.SESSIONS),
    changePassword: (data) => api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
};

// Mail APIs
export const mailAPI = {
    getInbox: (limit = 50) => api.get(`${API_ENDPOINTS.MAIL.INBOX}?limit=${limit}`),
    getSent: (limit = 50) => api.get(`${API_ENDPOINTS.MAIL.SENT}?limit=${limit}`),
    getStarred: (limit = 50) => api.get(`${API_ENDPOINTS.MAIL.STARRED}?limit=${limit}`),
    getTrash: (limit = 50) => api.get(`${API_ENDPOINTS.MAIL.TRASH}?limit=${limit}`),
    getSpam: (limit = 50) => api.get(`${API_ENDPOINTS.MAIL.SPAM}?limit=${limit}`),
    getSnoozed: (limit = 50) => api.get(`${API_ENDPOINTS.MAIL.SNOOZED}?limit=${limit}`),
    send: (data) => api.post(API_ENDPOINTS.MAIL.SEND, data),
    getEmail: (uid) => api.get(`${API_ENDPOINTS.MAIL.EMAIL}/${uid}`),
    toggleStar: (uid, folder = 'INBOX') => api.post(`${API_ENDPOINTS.MAIL.STAR}/${uid}?folder=${folder}`),
    markRead: (uid) => api.post(`${API_ENDPOINTS.MAIL.READ}/${uid}`),
    markUnread: (uid) => api.post(`${API_ENDPOINTS.MAIL.UNREAD}/${uid}`),
    trash: (uid, folder = 'INBOX') => api.post(`${API_ENDPOINTS.MAIL.MOVE_TRASH}/${uid}?folder=${folder}`),
    restore: (uid) => api.post(`${API_ENDPOINTS.MAIL.RESTORE}/${uid}`),
    permanentDelete: (uid) => api.delete(`${API_ENDPOINTS.MAIL.PERMANENT}/${uid}`),
    snooze: (uid, wakeUpAt) => api.post(`${API_ENDPOINTS.MAIL.SNOOZE}/${uid}?wakeUpAt=${wakeUpAt}`),
    
    // Labels
    getLabels: () => api.get(API_ENDPOINTS.MAIL.LABELS),
    createLabel: (data) => api.post(API_ENDPOINTS.MAIL.LABELS, data),
    applyLabel: (uid, labelId, folder = 'INBOX') => api.post(`${API_ENDPOINTS.MAIL.APPLY_LABEL}/${uid}?labelId=${labelId}&folder=${folder}`),
    removeLabel: (uid, labelId, folder = 'INBOX') => api.delete(`${API_ENDPOINTS.MAIL.REMOVE_LABEL}/${uid}?labelId=${labelId}&folder=${folder}`),
    getCategory: (category) => api.get(`${API_ENDPOINTS.MAIL.CATEGORY}/${category}`),
};

// Email Management APIs
export const emailAPI = {
    createEmail: (data, token) => api.post(API_ENDPOINTS.EMAILS.CREATE, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    }),
    listEmails: () => api.get(API_ENDPOINTS.EMAILS.LIST),
    setPrimary: (emailId) => api.post(API_ENDPOINTS.EMAILS.SET_PRIMARY.replace(':emailId', emailId)),
};

// User APIs
export const userAPI = {
    getSettings: () => api.get(API_ENDPOINTS.USERS.SETTINGS),
    updateSettings: (data) => api.patch(API_ENDPOINTS.USERS.SETTINGS, data),
    activityLogs: () => api.get(API_ENDPOINTS.USERS.ACTIVITY_LOGS),
};

// Business APIs
export const businessAPI = {
    register: (data) => api.post(API_ENDPOINTS.BUSINESS.REGISTER, data),
    getDomains: () => api.get(API_ENDPOINTS.BUSINESS.DOMAINS),
    verifyDomain: (domainId) => api.post(API_ENDPOINTS.BUSINESS.VERIFY.replace(':id', domainId)),
};

// Group APIs
export const groupAPI = {
    createGroup: (data) => api.post(API_ENDPOINTS.GROUPS.CREATE, data),
    getAllGroups: () => api.get(API_ENDPOINTS.GROUPS.LIST),
    addMembers: (groupId, data) => api.post(API_ENDPOINTS.GROUPS.MEMBERS.replace(':id', groupId), data),
    getMembers: (groupId) => api.get(API_ENDPOINTS.GROUPS.MEMBERS.replace(':id', groupId)),
    sendBroadcast: (groupId, data) => api.post(API_ENDPOINTS.GROUPS.SEND.replace(':id', groupId), data),
};
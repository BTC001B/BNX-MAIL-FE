import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

console.log('🔧 API Base URL:', API_BASE_URL);

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // ✅ Increased to 30 seconds
    withCredentials: false,
});

api.interceptors.request.use(
    (config) => {
        console.log('🌍 Full URL:', config.baseURL + config.url);
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log('✅ Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ Response Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });

        if (error.response?.status === 403 || error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userProfile');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => {
        console.log('🔑 Calling register API');
        return api.post('/api/auth/register', data);
    },
    login: (data) => {
        console.log('🔑 Calling login API');
        // Optional device name header
        const deviceName = 'Web Browser'; 
        return api.post('/api/auth/login', data, {
            headers: {
                'X-Device-Name': deviceName
            }
        });
    },
};

// Mail APIs
export const mailAPI = {
    send: (data) => api.post('/api/mail/send', data),
    getInbox: (limit = 50) => api.get(`/api/mail/inbox?limit=${limit}`), // ✅ Fixed
    getEmail: (uid) => api.get(`/api/mail/email/${uid}`), // ✅ Fixed
    markRead: (uid) => api.post(`/api/mail/${uid}/read`) // ✅ Fixed
};

// Email Management APIs
export const emailAPI = {
    createEmail: (data, token) => api.post('/api/emails/create', data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    }),
    listEmails: () => api.get('/api/emails/list'),
    setPrimary: (emailId) => api.post(`/api/emails/${emailId}/set-primary`), // ✅ Fixed
};

// Business/Domain APIs
export const businessAPI = {
    register: (data) => api.post('/api/business/register', data),
    getDomains: () => api.get('/api/business/domains'),
    getVerification: (domainId) => api.get(`/api/business/domain/${domainId}/verification`), // ✅ Fixed
    verifyDomain: (domainId) => api.post(`/api/business/domain/${domainId}/verify`), // ✅ Fixed
};

// Group APIs
export const groupAPI = {
    createGroup: (data) => api.post('/api/groups/create', data),
    getAllGroups: () => api.get('/api/groups/'),
    addMembers: (groupId, data) => api.post(`/api/groups/${groupId}/members`, data),
    getMembers: (groupId) => api.get(`/api/groups/${groupId}/members`),
    sendBroadcast: (groupId, data) => api.post(`/api/groups/${groupId}/send`, data),
};
import { api } from './api';

export const mailBackupAPI = {
    getBackups: (params = {}) => {
        const { type = 'all', page = 1, size = 20 } = params;
        return api.get('/api/mail-backups', {
            params: { type, page, size }
        });
    },
    getBackupById: (id) => {
        return api.get(`/api/mail-backups/${id}`);
    },
    getAttachmentDownloadUrl: (id, attachmentId) => {
        const apiBaseUrl = import.meta.env.VITE_API_URL || '';
        return `${apiBaseUrl}/api/mail-backups/${id}/attachments/${attachmentId}`;
    }
};

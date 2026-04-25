import React from 'react';
import {
  MdInbox,
  MdStarBorder,
  MdSend,
  MdDrafts,
  MdArchive,
  MdReport,
  MdDelete,
  MdMail,
  MdGroup,
  MdChat
} from 'react-icons/md';

export const SIDEBAR_ITEMS = [
  {
    name: 'Inbox',
    icon: <MdInbox size={22} />,
    path: '/inbox',
    count: 0
  },
  {
    name: 'Starred',
    icon: <MdStarBorder size={22} />,
    path: '/starred',
    count: 0
  },
  {
    name: 'Sent',
    icon: <MdSend size={20} />,
    path: '/sent',
    count: 0
  },
  {
    name: 'Draft',
    icon: <MdDrafts size={22} />,
    path: '/draft',
    count: 0
  },
  {
    name: 'Archive',
    icon: <MdArchive size={22} />,
    path: '/archive',
    count: 0
  },
  {
    name: 'Spam',
    icon: <MdReport size={22} />,
    path: '/spam',
    count: 0
  },
  {
    name: 'Trash',
    icon: <MdDelete size={22} />,
    path: '/trash',
    count: 0
  },
  {
    name: 'All Mail',
    icon: <MdMail size={22} />,
    path: '/allmail',
    count: 0
  },
  {
    name: 'Groups',
    icon: <MdGroup size={22} />,
    path: '/groups',
    count: 0
  },
  {
    name: 'Messages',
    icon: <MdChat size={22} />,
    path: '/chat',
    count: 0
  }
];

export const EMAIL_CATEGORIES = {
  PRIMARY: 'primary',
  SOCIAL: 'social',
  PROMOTIONS: 'promotions',
  UPDATES: 'updates'
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    SESSIONS: '/api/auth/sessions',
    CHANGE_PASSWORD: '/api/auth/change-password'
  },
  MAIL: {
    INBOX: '/api/mail/inbox',
    SENT: '/api/mail/sent',
    STARRED: '/api/mail/starred',
    TRASH: '/api/mail/trash',
    SPAM: '/api/mail/spam',
    SNOOZED: '/api/mail/snoozed',
    SEND: '/api/mail/send',
    STAR: '/api/mail/star',
    EMAIL: '/api/mail/email',
    READ: '/api/mail/read',
    UNREAD: '/api/mail/unread',
    MOVE_TRASH: '/api/mail/trash',
    RESTORE: '/api/mail/restore',
    PERMANENT: '/api/mail/permanent',
    SNOOZE: '/api/mail/snooze',
    LABELS: '/api/mail/labels',
    APPLY_LABEL: '/api/mail/labels/apply',
    REMOVE_LABEL: '/api/mail/labels/remove',
    CATEGORY: '/api/mail/category'
  },
  EMAILS: {
    CREATE: '/api/emails/create',
    LIST: '/api/emails/list',
    SET_PRIMARY: '/api/emails/:emailId/set-primary'
  },
  USERS: {
    SETTINGS: '/api/users/settings',
    ACTIVITY_LOGS: '/api/users/activity-logs'
  },
  BUSINESS: {
    REGISTER: '/api/business/register',
    DOMAINS: '/api/business/domains',
    VERIFY: '/api/business/domain/:id/verify'
  },
  GROUPS: {
    CREATE: '/api/groups/create',
    LIST: '/api/groups/',
    MEMBERS: '/api/groups/:id/members',
    SEND: '/api/groups/:id/send'
  },
  CHAT: {
    BASE: '/api/chat',
    DIRECT: '/api/chat/direct',
    GROUP: '/api/chat/group',
    USER_CHATS: '/api/chat/user/:email',
    MESSAGES: '/api/chat/:chatId/messages',
    SEND_MESSAGE: '/api/chat/message'
  }
};
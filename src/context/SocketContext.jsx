import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from './AuthContext';
import { useMail } from './MailContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

// Detect environment and set URLs
// Force WSS for api.bnxmail.com to avoid redirects
const DEFAULT_WS = 'wss://api.bnxmail.com/ws';
const WS_URL = import.meta.env.VITE_WS_URL || DEFAULT_WS;

export const SocketProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const { fetchEmails } = useMail();
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            if (stompClient) {
                stompClient.deactivate();
                setStompClient(null);
            }
            setIsConnected(false);
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        console.log('🔄 Attempting standard WebSocket connection to:', WS_URL);

        const client = new Client({
            brokerURL: WS_URL,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: function (str) {
                console.log('STOMP:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            // Disable SockJS for now to see the raw WebSocket error
            // webSocketFactory: () => new SockJS(WS_URL.replace('wss://', 'https://')),
        });

        client.onConnect = (frame) => {
            console.log('🔌 Connected to BNX STOMP Broker');
            setIsConnected(true);

            // Subscribe to personal notifications
            client.subscribe('/user/topic/notifications', (message) => {
                const data = JSON.parse(message.body);
                handlePersonalNotification(data);
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.onWebSocketError = (event) => {
            console.error('WebSocket Error:', event);
        };

        client.onDisconnect = () => {
            console.log('🔌 Disconnected from STOMP');
            setIsConnected(false);
        };

        client.activate();
        setStompClient(client);

        return () => {
            if (client) client.deactivate();
        };
    }, [isAuthenticated]);

    const handlePersonalNotification = (data) => {
        console.log('📩 Personal Notification:', data);
        switch (data.type) {
            case 'new_email':
                toast('New email received!', { icon: '📧' });
                fetchEmails();
                break;
            case 'send_progress':
                if (data.status === 'completed') {
                    toast.success('Email sent successfully');
                    fetchEmails('sent');
                } else if (data.status === 'failed') {
                    toast.error('Failed to send email');
                }
                break;
            default:
                toast(data.message || 'Notification received');
        }
    };

    const subscribeToChat = (chatId, callback) => {
        if (!stompClient || !isConnected) return null;
        console.log(`📡 Subscribing to /topic/chat/${chatId}`);
        return stompClient.subscribe(`/topic/chat/${chatId}`, (message) => {
            const data = JSON.parse(message.body);
            callback(data);
        });
    };

    const sendMessage = (chatId, messageContent) => {
        if (!stompClient || !isConnected || !user) return;
        
        const payload = {
            chatId: parseInt(chatId),
            sender: user.email,
            message: messageContent
        };

        stompClient.publish({
            destination: '/app/chat.send',
            body: JSON.stringify(payload)
        });
    };

    return (
        <SocketContext.Provider value={{ stompClient, isConnected, subscribeToChat, sendMessage }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);

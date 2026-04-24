import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useMail } from './MailContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

const WS_URL = import.meta.env.VITE_WS_URL || 'wss://api.bnxmail.com/ws';

export const SocketProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const { fetchEmails } = useMail();
    const [socket, setSocket] = useState(null);
    const reconnectTimer = useRef(null);

    const connect = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
            console.log('🔌 Connected to BNX Mail WebSocket');
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
                reconnectTimer.current = null;
            }
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('📩 WS Message:', data);

            switch (data.type) {
                case 'new_email':
                    toast('New email received!', { icon: '📧' });
                    fetchEmails(); // Refresh inbox
                    break;
                case 'send_progress':
                    if (data.status === 'completed') {
                        toast.success('Email sent successfully');
                        fetchEmails('sent');
                    } else if (data.status === 'failed') {
                        toast.error('Failed to send email');
                    }
                    break;
                case 'notification':
                    toast(data.message);
                    break;
                default:
                    console.log('Unknown WS event type:', data.type);
            }
        };

        ws.onclose = () => {
            console.log('🔌 WebSocket disconnected. Reconnecting...');
            reconnectTimer.current = setTimeout(connect, 5000);
        };

        ws.onerror = (err) => {
            console.error('🔌 WebSocket error:', err);
            ws.close();
        };

        setSocket(ws);
    };

    useEffect(() => {
        if (isAuthenticated) {
            connect();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
                reconnectTimer.current = null;
            }
        }

        return () => {
            if (socket) socket.close();
        };
    }, [isAuthenticated]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);

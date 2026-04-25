import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MdArrowBack, MdSend, MdMoreVert, MdAttachFile, MdInfoOutline, MdChat } from "react-icons/md";
import { chatAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const ChatRoom = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { theme } = useTheme();
    const { isConnected, subscribeToChat, sendMessage } = useSocket();

    const [chat, setChat] = useState(location.state?.chat || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await chatAPI.getMessageHistory(chatId);
            if (res.data) {
                const history = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setMessages(history);
            }
        } catch (err) {
            console.error("Failed to fetch history:", err);
            toast.error("Failed to load message history");
        } finally {
            setLoading(false);
            setTimeout(scrollToBottom, 100);
        }
    };

    useEffect(() => {
        fetchHistory();
        
        // Subscribe to live messages
        let subscription = null;
        if (isConnected) {
            subscription = subscribeToChat(chatId, (msg) => {
                setMessages(prev => {
                    // 1. Prevent duplicate messages if we already have this ID
                    if (prev.some(m => m.id === msg.id)) return prev;

                    // 2. Reconcile optimistic message for the sender
                    const optimisticIdx = prev.findIndex(m => 
                        m.isOptimistic && 
                        m.sender === msg.sender && 
                        m.content === msg.content
                    );

                    if (optimisticIdx !== -1) {
                        const newMsgs = [...prev];
                        // Replace the "sending..." version with the "sended" server version
                        newMsgs[optimisticIdx] = { ...msg, isOptimistic: false };
                        return newMsgs;
                    }

                    // 3. Just append if it's a new message from someone else
                    return [...prev, msg];
                });
                setTimeout(scrollToBottom, 50);
            });
        }

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [chatId, isConnected]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Optimistic update
        const tempMsg = {
            id: Date.now(),
            chatId: parseInt(chatId),
            sender: user.email,
            content: newMessage,
            timestamp: new Date().toISOString(),
            isOptimistic: true
        };
        
        setMessages(prev => [...prev, tempMsg]);
        setNewMessage("");
        setTimeout(scrollToBottom, 50);

        // Send via WebSocket
        if (isConnected) {
            sendMessage(chatId, tempMsg.content);
        } else {
            // Fallback to REST
            chatAPI.sendMessage({
                chatId: parseInt(chatId),
                sender: user.email,
                message: tempMsg.content
            }).catch(() => {
                toast.error("Failed to send message");
                setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
            });
        }
    };

    const chatName = chat?.name || (chat?.type === 'DIRECT' ? chat.memberEmails?.find(e => e !== user.email) : `Chat #${chatId}`);

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            {/* HEADER */}
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between bg-white/40 dark:bg-gray-900/40 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate("/groups")}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        style={{ color: theme.text }}
                    >
                        <MdArrowBack size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm ${chat?.type === 'GROUP' ? 'bg-gradient-to-br from-primary to-purple-600' : 'bg-gradient-to-br from-teal-500 to-blue-600'}`}>
                            {chatName?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="font-bold leading-tight" style={{ color: theme.text }}>{chatName}</h2>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-primary opacity-80">
                                {chat?.type || 'CONVERSATION'} • {isConnected ? 'Online' : 'Reconnecting...'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: theme.subText }}>
                        <MdInfoOutline size={22} />
                    </button>
                    <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: theme.subText }}>
                        <MdMoreVert size={22} />
                    </button>
                </div>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 hidden-scrollbar bg-white/10 dark:bg-black/10">
                {loading && messages.length === 0 ? (
                    <div className="flex justify-center p-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
                        <MdChat size={64} className="mb-4" />
                        <p className="text-lg font-medium">No messages yet</p>
                        <p className="text-sm">Be the first to say hello!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender === user.email;
                        return (
                            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[80%] sm:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    {!isMe && chat?.type === 'GROUP' && (
                                        <span className="text-[10px] font-bold mb-1 ml-2 uppercase opacity-60" style={{ color: theme.subText }}>
                                            {msg.sender.split('@')[0]}
                                        </span>
                                    )}
                                    <div 
                                        className={`px-4 py-2.5 rounded-2xl shadow-sm relative ${
                                            isMe 
                                            ? 'bg-primary text-white rounded-tr-none' 
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                                        }`}
                                    >
                                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        <div className={`text-[9px] mt-1 opacity-60 font-medium ${isMe ? 'text-white/80' : 'text-gray-500'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {msg.isOptimistic && " • sending..."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="p-4 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800/50">
                <form onSubmit={handleSend} className="flex items-center gap-3 max-w-5xl mx-auto">
                    <button 
                        type="button" 
                        className="p-2.5 rounded-xl text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    >
                        <MdAttachFile size={22} className="rotate-45" />
                    </button>
                    <div className="flex-1 relative">
                        <input 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full pl-4 pr-12 py-3 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-800/80 outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-inner"
                            style={{ color: theme.text }}
                        />
                        <button 
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-white shadow-md disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                        >
                            <MdSend size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatRoom;

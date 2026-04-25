import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdChat, MdGroupAdd, MdPersonAdd, MdSearch, MdGroup } from "react-icons/md";
import { chatAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const Groups = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { theme } = useTheme();

    // Determine if we are in "Groups" mode or "Direct Messages" mode
    const isGroupsMode = location.pathname.includes('/groups');
    const modeTitle = isGroupsMode ? "Groups" : "Direct Messages";
    const modeIcon = isGroupsMode ? <MdGroup className="text-primary" /> : <MdChat className="text-primary" />;

    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showStartDirect, setShowStartDirect] = useState(false);

    const [groupData, setGroupData] = useState({ name: "", members: "" });
    const [directEmail, setDirectEmail] = useState("");

    const fetchChats = async () => {
        if (!user?.email) return;
        try {
            setLoading(true);
            const res = await chatAPI.getUserChats(user.email);
            if (res.data) {
                const chatList = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setChats(chatList);
            }
        } catch (err) {
            console.error("Failed to load chats:", err);
            toast.error("Failed to load conversations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
    }, [user?.email, location.pathname]);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        const memberEmails = groupData.members.split(/[\s,]+/).filter(e => e.includes('@'));
        if (!groupData.name || memberEmails.length === 0) {
            toast.error("Group name and at least one member required");
            return;
        }

        try {
            setLoading(true);
            const res = await chatAPI.createGroupChat({
                name: groupData.name,
                members: [...memberEmails, user.email]
            });
            if (res.data) {
                toast.success("Group created!");
                setShowCreateGroup(false);
                setGroupData({ name: "", members: "" });
                fetchChats();
            }
        } catch (err) {
            toast.error("Failed to create group");
        } finally {
            setLoading(false);
        }
    };

    const handleStartDirect = async (e) => {
        e.preventDefault();
        if (!directEmail.includes('@')) {
            toast.error("Valid email required");
            return;
        }

        try {
            setLoading(true);
            const res = await chatAPI.createDirectChat({
                user1: user.email,
                user2: directEmail
            });
            if (res.data) {
                toast.success("Chat started!");
                setShowStartDirect(false);
                setDirectEmail("");
                fetchChats();
            }
        } catch (err) {
            toast.error("Failed to start chat");
        } finally {
            setLoading(false);
        }
    };

    // Filter by search AND by type (GROUP vs DIRECT)
    const filteredChats = chats.filter(chat => {
        const matchesSearch = 
            chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.memberEmails?.some(email => email.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesMode = isGroupsMode ? chat.type === 'GROUP' : chat.type === 'DIRECT';
        
        return matchesSearch && matchesMode;
    });

    return (
        <div className="flex flex-col h-full overflow-hidden bg-transparent">
            {/* HEADER */}
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between bg-white/30 dark:bg-gray-900/30 backdrop-blur-md">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: theme.text }}>
                        {modeIcon}
                        {modeTitle}
                    </h2>
                    <p className="text-sm opacity-60" style={{ color: theme.subText }}>
                        {isGroupsMode ? "Collaborate with your teams" : "Your private conversations"}
                    </p>
                </div>
                <div className="flex gap-3">
                    {isGroupsMode ? (
                        <button 
                            onClick={() => setShowCreateGroup(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 transition-all font-medium shadow-md"
                        >
                            <MdGroupAdd size={20} />
                            New Group
                        </button>
                    ) : (
                        <button 
                            onClick={() => setShowStartDirect(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-all font-medium"
                        >
                            <MdPersonAdd size={20} />
                            New Chat
                        </button>
                    )}
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <div className="px-6 py-4">
                <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text"
                        placeholder={`Search ${isGroupsMode ? 'groups' : 'messages'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        style={{ color: theme.text }}
                    />
                </div>
            </div>

            {/* CHAT LIST */}
            <div className="flex-1 overflow-y-auto px-6 pb-10 hidden-scrollbar">
                {loading && chats.length === 0 ? (
                    <div className="flex justify-center p-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : filteredChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 opacity-50">
                        {isGroupsMode ? <MdGroup size={64} className="mb-4" /> : <MdChat size={64} className="mb-4" />}
                        <p className="text-lg font-medium">No {isGroupsMode ? 'groups' : 'messages'} found</p>
                        <p className="text-sm">
                            {isGroupsMode ? 'Create a group to start collaborating' : 'Start a new chat to begin messaging'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredChats.map((chat) => {
                            const chatDisplayName = chat.name || chat.memberEmails?.find(e => e !== user.email) || 'Unnamed';
                            return (
                                <div 
                                    key={chat.id}
                                    onClick={() => navigate(`/chat/${chat.id}`, { state: { chat } })}
                                    className="group relative p-5 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-inner ${chat.type === 'GROUP' ? 'bg-gradient-to-br from-primary to-purple-600' : 'bg-gradient-to-br from-teal-500 to-blue-600'}`}>
                                                {chatDisplayName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight" style={{ color: theme.text }}>
                                                    {chatDisplayName}
                                                </h3>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                                                    {chat.type}
                                                </span>
                                            </div>
                                        </div>
                                        {chat.unreadCount > 0 && (
                                            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                {chat.unreadCount}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm opacity-70 line-clamp-2 mb-4 h-10" style={{ color: theme.subText }}>
                                        {chat.lastMessage || "No messages yet"}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/30 dark:border-gray-700/30 text-xs font-medium">
                                        <span style={{ color: theme.subText }}>
                                            {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleDateString() : 'Active now'}
                                        </span>
                                        <span className="text-primary group-hover:underline">Open chat &rarr;</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* MODALS */}
            {(showCreateGroup || showStartDirect) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in duration-200">
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4" style={{ color: theme.text }}>
                                {showCreateGroup ? 'Create Group Chat' : 'Start Direct Chat'}
                            </h3>
                            <form onSubmit={showCreateGroup ? handleCreateGroup : handleStartDirect}>
                                {showCreateGroup ? (
                                    <>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-1 opacity-70">Group Name</label>
                                            <input 
                                                autoFocus
                                                value={groupData.name}
                                                onChange={(e) => setGroupData({...groupData, name: e.target.value})}
                                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/30"
                                                placeholder="e.g. Project Alpha"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-1 opacity-70">Member Emails (comma separated)</label>
                                            <textarea 
                                                value={groupData.members}
                                                onChange={(e) => setGroupData({...groupData, members: e.target.value})}
                                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px]"
                                                placeholder="user1@bnxmail.com, user2@bnxmail.com"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1 opacity-70">Recipient Email</label>
                                        <input 
                                            autoFocus
                                            type="email"
                                            value={directEmail}
                                            onChange={(e) => setDirectEmail(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-primary/30"
                                            placeholder="someone@bnxmail.com"
                                        />
                                    </div>
                                )}
                                <div className="flex gap-3 mt-6">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all"
                                    >
                                        {loading ? 'Processing...' : (showCreateGroup ? 'Create Group' : 'Start Chat')}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => { setShowCreateGroup(false); setShowStartDirect(false); }}
                                        className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                        style={{ color: theme.text }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groups;

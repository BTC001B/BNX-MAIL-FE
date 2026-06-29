import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  MdArrowBack,
  MdSend,
  MdMoreVert,
  MdAttachFile,
  MdInfoOutline,
  MdChat,
  MdEmail,
  MdPeople,
  MdPersonAdd,
  MdAssignment,
  MdClose
} from "react-icons/md";
import { chatAPI, mailAPI, templateAPI } from "../services/api";
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

  // Layout States (Info Modal & Responsive Composer)
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showRightPanelMobile, setShowRightPanelMobile] = useState(false);

  // Group Members State
  const [membersList, setMembersList] = useState([]);
  const [emailsInput, setEmailsInput] = useState("");
  const [addingMembers, setAddingMembers] = useState(false);

  // Broadcast Email State
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Email Templates State
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatDetails = async () => {
    if (chat) return;
    try {
      const res = await chatAPI.getUserChats(user.email);
      if (res.data) {
        const chatList = Array.isArray(res.data) ? res.data : (res.data.data || []);
        const currentChat = chatList.find(c => c.id === parseInt(chatId));
        if (currentChat) setChat(currentChat);
      }
    } catch (err) {
      console.error("Failed to fetch chat details:", err);
    }
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

  const fetchChatMembers = async () => {
    try {
      const res = await chatAPI.getMembers(chatId);
      if (res.data) {
        setMembersList(res.data);
      }
    } catch (err) {
      console.error("Error fetching chat members:", err);
    }
  };

  const fetchTemplates = async () => {
    if (!user?.email) return;
    try {
      const res = await templateAPI.getTemplates(user.email);
      if (res.data?.success) {
        setTemplates(res.data.data || []);
      }
    } catch (err) {
      console.error("Error loading templates:", err);
    }
  };

  useEffect(() => {
    fetchChatDetails();
    fetchHistory();
    
    // Subscribe to live messages
    let subscription = null;
    if (isConnected) {
      subscription = subscribeToChat(chatId, (msg) => {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;

          const optimisticIdx = prev.findIndex(m => 
            m.isOptimistic && 
            m.sender === msg.sender && 
            m.content === msg.content
          );

          if (optimisticIdx !== -1) {
            const newMsgs = [...prev];
            newMsgs[optimisticIdx] = { ...msg, isOptimistic: false };
            return newMsgs;
          }

          return [...prev, msg];
        });
        setTimeout(scrollToBottom, 50);
      });
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [chatId, isConnected]);

  // Load Group Specific Data
  useEffect(() => {
    if (chat?.type === 'GROUP') {
      fetchChatMembers();
      fetchTemplates();
    } else {
      setMembersList(chat?.memberEmails || []);
    }
  }, [chatId, chat?.type, user?.email]);

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

  // Add Member Action
  const handleAddMembers = async (e) => {
    e.preventDefault();
    if (!emailsInput.trim()) return;

    const emailsList = emailsInput.split(/[\s,]+/).filter(e => e.includes('@'));
    if (emailsList.length === 0) {
      toast.error("Please enter valid email addresses");
      return;
    }

    try {
      setAddingMembers(true);
      const res = await chatAPI.addMembers(chatId, { emails: emailsList });
      if (res.data) {
        toast.success("Members added to group!");
        setEmailsInput("");
        fetchChatMembers();
      }
    } catch (err) {
      toast.error("Failed to add members");
    } finally {
      setAddingMembers(false);
    }
  };

  // Broadcast Email Action
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Subject and body are required");
      return;
    }

    // Recipient list: BCC all members except the sender
    const bccEmails = membersList.filter(email => email.toLowerCase() !== user.email.toLowerCase());
    if (bccEmails.length === 0) {
      toast.error("No other members in this group to send to.");
      return;
    }

    try {
      setSendingEmail(true);
      toast.loading("Sending email broadcast...", { id: "send-broadcast" });
      
      await mailAPI.send({
        to: user.email, // To self
        bcc: bccEmails.join(", "), // BCC all members
        subject: emailSubject,
        body: emailBody,
        isHtml: true
      });
      
      toast.success(`Email broadcasted to ${bccEmails.length} recipients`, { id: "send-broadcast" });
      setEmailSubject("");
      setEmailBody("");
      setSelectedTemplate("");
    } catch (err) {
      toast.error("Failed to send broadcast email", { id: "send-broadcast" });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplate(templateId);
    if (!templateId) {
      setEmailBody("");
      return;
    }
    const selected = templates.find(t => String(t.id) === String(templateId));
    if (selected) {
      setEmailSubject(selected.name || "");
      setEmailBody(selected.body || "");
    }
  };

  const chatPartner = chat?.memberEmails?.find(e => e !== user.email);
  const chatName = chat?.type === 'DIRECT' ? chatPartner?.split('@')[0] : (chat?.name || `Chat #${chatId}`);

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between bg-white/40 dark:bg-gray-900/40 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (chat?.type === 'DIRECT') {
                navigate("/chat");
              } else {
                navigate("/colab");
              }
            }}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            style={{ color: theme.text }}
          >
            <MdArrowBack size={24} />
          </button>
          
          {/* Clickable Group Name to open Colab Info Modal */}
          <div 
            onClick={() => {
              if (chat?.type === 'GROUP') {
                setShowInfoModal(true);
              }
            }}
            className={`flex items-center gap-3 ${chat?.type === 'GROUP' ? 'cursor-pointer hover:opacity-80 transition-all' : ''}`}
            title={chat?.type === 'GROUP' ? "View group details & members" : ""}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm ${chat?.type === 'GROUP' ? 'bg-gradient-to-br from-primary to-purple-600' : 'bg-gradient-to-br from-teal-500 to-blue-600'}`}>
              {chatName?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h2 className="font-bold leading-tight text-sm sm:text-base" style={{ color: theme.text }}>{chatName}</h2>
                {chat?.type === 'GROUP' && <MdInfoOutline size={14} className="opacity-60 text-gray-500 dark:text-gray-400" />}
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-primary opacity-80">
                {chat?.type || 'CONVERSATION'} • {isConnected ? 'Online' : 'Reconnecting...'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {chat?.type === 'GROUP' && (
            <button 
              onClick={() => setShowRightPanelMobile(!showRightPanelMobile)}
              className="md:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" 
              style={{ color: theme.subText }}
              title="Compose broadcast email"
            >
              <MdEmail size={22} />
            </button>
          )}
          <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: theme.subText }}>
            <MdMoreVert size={22} />
          </button>
        </div>
      </div>

      {/* Main Split Container */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Side: Chat Room (WebSocket messaging) */}
        <div className={`flex flex-col h-full overflow-hidden transition-all duration-300 ${chat?.type === 'GROUP' ? 'w-full md:w-1/2' : 'w-full'}`}>
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
                    <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] font-bold mb-1 ml-2 uppercase opacity-60" style={{ color: theme.subText }}>
                        {isMe ? (user.username || user.email.split('@')[0]) : msg.sender.split('@')[0]}
                      </span>
                      <div 
                        className={`px-4 py-2.5 rounded-2xl shadow-sm relative ${
                          isMe 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                        }`}
                      >
                        <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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
          <div className="p-4 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800/50 shrink-0">
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
                  className="w-full pl-4 pr-12 py-3 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-800/80 outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-inner text-sm"
                  style={{ color: theme.text }}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-white shadow-md disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                >
                  <MdSend size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Professional Broadcast composer */}
        {chat?.type === 'GROUP' && (
          <div
            className={`
              flex-col h-full border-l border-gray-200/50 dark:border-gray-800/50 bg-white/30 dark:bg-gray-900/30 backdrop-blur-lg overflow-hidden shrink-0 transition-all duration-300
              md:flex md:w-1/2 w-full
              ${showRightPanelMobile ? "fixed inset-0 z-45 flex bg-white/95 dark:bg-gray-950/95" : "hidden"}
            `}
          >
            {/* Header: Professional Broadcast Title */}
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
              <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: theme.text }}>
                <MdEmail size={18} className="text-primary" style={{ color: theme.accent }} /> Professional Broadcast
              </h3>
              
              {/* Close Button on Mobile Composer Overlay */}
              <button
                onClick={() => setShowRightPanelMobile(false)}
                className="md:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ color: theme.text }}
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Composer form details */}
            <div className="flex-1 overflow-y-auto p-5 hidden-scrollbar">
              <form onSubmit={handleSendBroadcast} className="space-y-4 max-w-lg mx-auto">
                <div className="mb-2">
                  <p className="text-xs opacity-60 leading-relaxed" style={{ color: theme.subText }}>
                    Send an official email broadcast to all {membersList.length} members. 
                    BNX-MAIL sends this directly from your professional inbox.
                  </p>
                </div>

                {/* Template Selection Dropdown */}
                {templates.length > 0 && (
                  <div className="p-3.5 bg-black/[0.02] dark:bg-white/[0.02] border border-gray-200/50 dark:border-gray-800/50 rounded-xl">
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-65 flex items-center gap-1">
                      <MdAssignment size={14} /> Quick Templates
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => handleSelectTemplate(e.target.value)}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none font-medium"
                    >
                      <option value="">-- Choose a template to load --</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Subject Input */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 opacity-65">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Email subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-primary/45 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Body Textarea */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 opacity-65">
                    Message Body (HTML support)
                  </label>
                  <textarea
                    placeholder="Write email content here..."
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-primary/45 focus:border-transparent transition-all"
                    rows={8}
                    required
                  />
                </div>

                {/* Actions */}
                <button
                  disabled={sendingEmail || membersList.length === 0}
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-semibold text-sm text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  style={{ background: theme.accent || "#135bec" }}
                >
                  {sendingEmail ? "Sending..." : "Send broadcast email"}
                  <MdSend size={15} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Colab Info Overlay Modal (Displays group metadata, members, and adding controls) */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div 
            className="w-full max-w-md p-6 rounded-2xl border shadow-xl flex flex-col max-h-[85vh] overflow-hidden"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b mb-4" style={{ borderColor: theme.border }}>
              <h3 className="text-lg font-bold flex items-center gap-1.5">
                <MdPeople size={20} className="text-primary" style={{ color: theme.accent }} /> Colab Channel Info
              </h3>
              <button 
                onClick={() => setShowInfoModal(false)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <MdClose size={22} style={{ color: theme.text }} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1 hidden-scrollbar">
              <div>
                <h4 className="font-bold text-base">{chat?.name || "Colab Group"}</h4>
                <p className="text-xs opacity-75 mt-1 leading-relaxed" style={{ color: theme.subText }}>
                  {chat?.description || "A collaboration channel for team messaging and email broadcasting."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[9px] uppercase font-bold tracking-wider opacity-60">
                  <span className="bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full">
                    Channel ID: #{chatId}
                  </span>
                  {chat?.createdAt && (
                    <span className="bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full">
                      Created: {new Date(chat.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Add Members Form */}
              <form onSubmit={handleAddMembers} className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-gray-200/50 dark:border-gray-800/50 rounded-2xl">
                <h5 className="text-xs font-bold uppercase tracking-wider mb-1 opacity-75 flex items-center gap-1">
                  <MdPersonAdd size={16} /> Add New Members
                </h5>
                <p className="text-[10px] opacity-60 mb-3">
                  Enter email addresses separated by commas or spaces.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="alice@bnxmail.com, bob@bnxmail.com"
                    value={emailsInput}
                    onChange={(e) => setEmailsInput(e.target.value)}
                    className="flex-grow p-2.5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={addingMembers || !emailsInput.trim()}
                    className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl disabled:opacity-50 cursor-pointer shadow-sm transition-all"
                    style={{ background: theme.accent }}
                  >
                    {addingMembers ? "Adding..." : "Add"}
                  </button>
                </div>
              </form>

              {/* Members List */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider opacity-65 flex items-center gap-1.5">
                  <MdPeople size={16} /> Group Members ({membersList.length})
                </h5>
                <div className="border border-gray-100 dark:border-gray-800 rounded-2xl divide-y divide-gray-50 dark:divide-gray-800 bg-white/40 dark:bg-gray-900/10 overflow-hidden shadow-inner max-h-48 overflow-y-auto">
                  {membersList.map((email, idx) => {
                    const isMe = email.toLowerCase() === user.email.toLowerCase();
                    return (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs transition-colors hover:bg-black/[0.01]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/80 to-purple-500/80 flex items-center justify-center font-bold text-white shrink-0 shadow-inner">
                            {email.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">
                            {email}
                          </span>
                        </div>
                        {isMe && (
                          <span className="text-[9px] uppercase tracking-wide font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">
                            Owner
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;

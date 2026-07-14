import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { MdCheck, MdDoneAll, MdMoreVert, MdSearch, MdSend, MdAttachFile, MdInsertEmoticon } from "react-icons/md";

// Dummy data for Casbox Contacts
const DUMMY_CONTACTS = [
  { id: 1, name: "Alice Johnson", lastMessage: "Re: Project Update - Looking good!", time: "10:42 AM", unread: 2, avatar: "A", online: true },
  { id: 2, name: "Bob Smith", lastMessage: "Re: Meeting Notes - I'll check it out.", time: "Yesterday", unread: 0, avatar: "B", online: false },
  { id: 3, name: "Charlie Davis", lastMessage: "Invoice #1024 - Attached.", time: "Monday", unread: 0, avatar: "C", online: true },
];

// Dummy data for Casbox Messages
const DUMMY_MESSAGES = [
  { 
    id: 101, 
    senderId: 1, 
    senderName: "Alice Johnson", 
    isMe: false, 
    subject: "Project Update", 
    body: "Hi team, I have pushed the latest changes to the staging environment. Please review them when you have a moment. Thanks!", 
    time: "10:30 AM",
    status: "seen" // sent, delivered, seen
  },
  { 
    id: 102, 
    senderId: 'me', 
    senderName: "Me", 
    isMe: true, 
    subject: "Re: Project Update", 
    body: "Awesome! I will take a look at it right after my current meeting. Did you include the database migrations?", 
    time: "10:35 AM",
    status: "seen" 
  },
  { 
    id: 103, 
    senderId: 1, 
    senderName: "Alice Johnson", 
    isMe: false, 
    subject: "Re: Project Update", 
    body: "Yes, the migrations are included in the PR. Looking good!", 
    time: "10:42 AM",
    status: "delivered" 
  }
];

const Casbox = () => {
  const { theme } = useTheme();
  const [activeContactId, setActiveContactId] = useState(1);
  const [messageText, setMessageText] = useState("");
  
  const activeContact = DUMMY_CONTACTS.find(c => c.id === activeContactId);

  const getStatusIcon = (status) => {
    if (status === "sent") return <MdCheck size={16} className="text-gray-400" />;
    if (status === "delivered") return <MdDoneAll size={16} className="text-gray-400" />;
    if (status === "seen") return <MdDoneAll size={16} className="text-blue-500" />;
    return null;
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-200/50 dark:border-gray-800/50">
      
      {/* LEFT PANE - CONTACTS LIST */}
      <div className="w-full md:w-[320px] lg:w-[380px] flex-shrink-0 border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col bg-gray-50/50 dark:bg-gray-900/50 hidden md:flex">
        
        {/* Header */}
        <div className="h-[70px] px-4 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold" style={{ color: theme.text }}>Casbox</h2>
          <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
            <MdMoreVert size={22} style={{ color: theme.text }} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search or start new chat" 
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-black/5 dark:bg-white/5 focus:bg-white dark:focus:bg-gray-800 border border-transparent focus:border-gray-200 dark:focus:border-gray-700 outline-none transition-all"
              style={{ color: theme.text }}
            />
            <MdSearch size={20} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto hover-scrollbar">
          {DUMMY_CONTACTS.map((contact) => (
            <div 
              key={contact.id}
              onClick={() => setActiveContactId(contact.id)}
              className={`flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer transition-colors ${activeContactId === contact.id ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'}`}
            >
              <div className="relative">
                <div 
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                  style={{ backgroundColor: theme.accent || "#135bec" }}
                >
                  {contact.avatar}
                </div>
                {contact.online && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-semibold text-[15px] truncate" style={{ color: theme.text }}>{contact.name}</h3>
                  <span className="text-xs text-gray-500 shrink-0">{contact.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 truncate pr-2">{contact.lastMessage}</p>
                  {contact.unread > 0 && (
                    <span 
                      className="flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: theme.accent || "#135bec" }}
                    >
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANE - CHAT WINDOW */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-gray-900 relative overflow-hidden">
        {/* Chat Background */}
        <div className="absolute inset-0 opacity-50 dark:opacity-20 pointer-events-none bg-gradient-to-br from-transparent to-primary/5">
        </div>

        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="h-[70px] px-6 flex items-center justify-between bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-sm z-10 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-4">
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                  style={{ backgroundColor: theme.accent || "#135bec" }}
                >
                  {activeContact.avatar}
                </div>
                <div>
                  <h2 className="font-semibold text-base" style={{ color: theme.text }}>{activeContact.name}</h2>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">{activeContact.online ? 'Online' : 'Offline'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
                  <MdSearch size={22} className="text-gray-500 dark:text-gray-400" />
                </button>
                <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
                  <MdMoreVert size={22} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 z-0">
              {DUMMY_MESSAGES.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-sm relative group transition-all ${
                      msg.isMe 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 rounded-tr-sm' 
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-tl-sm'
                    }`}
                  >
                    {/* Mail Subject */}
                    <div className={`text-xs font-bold mb-1 opacity-90 uppercase tracking-wider ${msg.isMe ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      Subject: {msg.subject}
                    </div>
                    
                    {/* Mail Body */}
                    <div className="text-[14px] leading-relaxed whitespace-pre-wrap break-words text-gray-800 dark:text-gray-100 pb-4">
                      {msg.body}
                    </div>

                    {/* Time & Ticks */}
                    <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                        {msg.time}
                      </span>
                      {msg.isMe && getStatusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="min-h-[70px] px-4 py-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md flex items-end gap-3 z-10 border-t border-gray-200/50 dark:border-gray-700/50">
              <button className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition text-gray-500 shrink-0">
                <MdInsertEmoticon size={24} />
              </button>
              <button className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition text-gray-500 shrink-0">
                <MdAttachFile size={24} />
              </button>
              
              <div className="flex-1 bg-gray-100 dark:bg-[#2a3942] rounded-2xl overflow-hidden flex flex-col">
                <input 
                  type="text" 
                  placeholder="Subject (Optional)" 
                  className="w-full px-4 py-2 text-xs bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none placeholder:text-gray-500 font-medium"
                  style={{ color: theme.text }}
                />
                <textarea 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message" 
                  className="w-full px-4 py-3 text-sm bg-transparent outline-none placeholder:text-gray-500 resize-none max-h-32"
                  rows={1}
                  style={{ color: theme.text }}
                />
              </div>

              <button 
                className="p-3 rounded-full text-white shadow-md hover:scale-105 active:scale-95 transition shrink-0 self-end mb-1"
                style={{ backgroundColor: theme.accent || "#135bec" }}
              >
                <MdSend size={20} className="ml-1" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-50 z-10">
            <div className="w-24 h-24 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6">
              <MdChat size={40} />
            </div>
            <h2 className="text-xl font-medium mb-2" style={{ color: theme.text }}>BNX Casbox</h2>
            <p className="text-sm max-w-sm text-center">Select a chat to start messaging seamlessly with email integration and real-time read receipts.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Casbox;

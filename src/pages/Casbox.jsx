import React from "react";
import { useTheme } from "../context/ThemeContext";
import { MdCheck, MdDoneAll, MdStarBorder, MdStar, MdDeleteOutline, MdRefresh } from "react-icons/md";

// Dummy data for Casbox Messages (Threads)
const DUMMY_MESSAGES = [
  { 
    id: 101, 
    senderName: "Alice Johnson", 
    isMe: false, 
    subject: "Project Update", 
    body: "Hi team, I have pushed the latest changes to the staging environment...", 
    time: "10:30 AM",
    status: "seen",
    isStarred: false,
    isChecked: false
  },
  { 
    id: 102, 
    senderName: "Me", 
    isMe: true, 
    subject: "Re: Project Update", 
    body: "Awesome! I will take a look at it right after my current meeting.", 
    time: "10:35 AM",
    status: "seen",
    isStarred: true,
    isChecked: false
  },
  { 
    id: 103, 
    senderName: "Bob Smith", 
    isMe: false, 
    subject: "Meeting Notes", 
    body: "Here are the notes from yesterday's sync. Please review them.", 
    time: "Yesterday",
    status: "delivered",
    isStarred: false,
    isChecked: false
  },
  { 
    id: 104, 
    senderName: "Charlie Davis", 
    isMe: false, 
    subject: "Invoice #1024", 
    body: "Attached is the invoice for the last quarter.", 
    time: "Monday",
    status: "delivered",
    isStarred: true,
    isChecked: false
  },
  { 
    id: 105, 
    senderName: "Me", 
    isMe: true, 
    subject: "Follow up: Design assets", 
    body: "Did you get a chance to look at the new figma file?", 
    time: "10 Jul",
    status: "sent",
    isStarred: false,
    isChecked: false
  }
];

const Casbox = () => {
  const { theme } = useTheme();
  
  const getStatusIcon = (status) => {
    if (status === "sent") return <MdCheck size={16} className="text-gray-400" title="Sent" />;
    if (status === "delivered") return <MdDoneAll size={16} className="text-gray-400" title="Delivered" />;
    if (status === "seen") return <MdDoneAll size={16} className="text-blue-500" title="Seen" />;
    return null;
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#121212] relative overflow-hidden">
      
      {/* Header toolbar (like inbox) */}
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 shrink-0 bg-transparent">
        <span
          className="px-4 py-1.5 text-xs font-bold rounded-full shadow-sm text-white tracking-wide flex items-center gap-1.5 uppercase select-none"
          style={{ background: `linear-gradient(135deg, ${theme.accent || "#135bec"} 0%, #3b82f6 100%)` }}
        >
          Casbox ({DUMMY_MESSAGES.length})
        </span>
        <button className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          <MdRefresh size={18} />
        </button>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto hidden-scrollbar">
        {DUMMY_MESSAGES.map((msg) => (
          <div 
            key={msg.id}
            className={`group flex items-center px-4 sm:px-6 py-2.5 sm:py-3 border-b border-gray-100 dark:border-gray-800/50 hover:shadow-sm transition-all cursor-pointer relative bg-white dark:bg-[#121212] hover:bg-gray-50/50 dark:hover:bg-gray-800/30`}
          >
            {/* Left Controls (Checkbox & Star) */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0 mr-3 sm:mr-4">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer bg-transparent"
                readOnly
                checked={msg.isChecked}
              />
              <button className="text-gray-400 hover:text-yellow-400 transition-colors">
                {msg.isStarred ? <MdStar size={20} className="text-yellow-400" /> : <MdStarBorder size={20} />}
              </button>
            </div>

            {/* Sender Name */}
            <div className="w-36 sm:w-44 md:w-48 shrink-0 truncate pr-2">
              <span className={`text-sm font-bold text-gray-900 dark:text-gray-100`}>
                {msg.senderName}
              </span>
            </div>

            {/* Subject & Snippet */}
            <div className="flex-1 min-w-0 flex items-baseline gap-2 truncate pr-4">
              <span className="text-sm truncate font-bold text-gray-900 dark:text-gray-100">
                {msg.subject}
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-500 truncate font-normal">
                — {msg.body}
              </span>
            </div>

            {/* Status Indicator (Seen/Delivered) */}
            <div className="shrink-0 mx-2 flex items-center justify-center w-6">
              {msg.isMe && getStatusIcon(msg.status)}
            </div>

            {/* Date / Time */}
            <div className="shrink-0 w-20 sm:w-24 text-right">
              <span className={`text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100`}>
                {msg.time}
              </span>
            </div>
            
            {/* Hover Actions */}
            <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-white via-white to-transparent dark:from-[#121212] dark:via-[#121212] dark:to-transparent pl-8 pr-2 py-1">
              <button className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 transition-colors">
                <MdDeleteOutline size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Casbox;

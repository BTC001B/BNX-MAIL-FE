import { useTranslation } from "../context/LanguageContext";
import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { mailAPI } from "../services/api";
import {
  MdSearch,
  MdNotificationsActive,
  MdNotificationsOff,
  MdRefresh,
  MdMarkEmailRead,
  MdBlock
} from "react-icons/md";
import toast from "react-hot-toast";

const Subscriptions = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [senders, setSenders] = useState([]);
  const [blockedSenders, setBlockedSenders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'subscribed', 'unsubscribed'

  const fetchSubscriptionsData = async () => {
    setLoading(true);
    try {
      // 1. Fetch inbox emails directly to extract senders
      const emailsRes = await mailAPI.getInbox(150);
      const emailsList = emailsRes.data?.data?.emails || [];
      
      // 2. Fetch backend blocked senders
      const blockedRes = await mailAPI.getSubscriptions();
      const blockedList = blockedRes.data?.data || [];
      setBlockedSenders(blockedList);

      // 3. Extract unique senders
      const sendersMap = new Map();
      emailsList.forEach((email) => {
        if (!email.from) return;
        const parsed = parseSender(email.from);
        if (!parsed.email) return;
        
        const lowerEmail = parsed.email.toLowerCase();
        if (!sendersMap.has(lowerEmail)) {
          sendersMap.set(lowerEmail, {
            name: parsed.name,
            email: parsed.email,
            count: 1
          });
        } else {
          const existing = sendersMap.get(lowerEmail);
          existing.count += 1;
        }
      });

      // Also ensure that senders currently blocked that might not be in the recent inbox are displayed
      blockedList.forEach((blockedEmail) => {
        const lowerEmail = blockedEmail.toLowerCase();
        if (!sendersMap.has(lowerEmail)) {
          sendersMap.set(lowerEmail, {
            name: blockedEmail.split('@')[0],
            email: blockedEmail,
            count: 0
          });
        }
      });

      setSenders(Array.from(sendersMap.values()));
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      toast.error("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionsData();
  }, []);

  const parseSender = (senderString) => {
    if (!senderString) return { name: 'Unknown', email: '' };
    if (senderString.includes('<') && senderString.includes('>')) {
      const name = senderString.substring(0, senderString.indexOf('<')).replace(/"/g, '').trim();
      const email = senderString.substring(senderString.indexOf('<') + 1, senderString.indexOf('>')).trim();
      return { name: name || email.split('@')[0], email };
    }
    return { name: senderString.split('@')[0], email: senderString.trim() };
  };

  const handleToggleBlock = async (senderEmail, isBlocked) => {
    const action = isBlocked ? mailAPI.subscribe : mailAPI.unsubscribe;
    const toastMessage = isBlocked ? "Subscribed to sender" : "Unsubscribed from sender";
    
    try {
      await action(senderEmail);
      toast.success(toastMessage);
      
      // Update local state
      if (isBlocked) {
        setBlockedSenders(prev => prev.filter(e => e.toLowerCase() !== senderEmail.toLowerCase()));
      } else {
        setBlockedSenders(prev => [...prev, senderEmail]);
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredSenders = senders.filter((sender) => {
    const isBlocked = blockedSenders.some(b => b.toLowerCase() === sender.email.toLowerCase());
    
    // Tab filter
    if (activeFilter === "subscribed" && isBlocked) return false;
    if (activeFilter === "unsubscribed" && !isBlocked) return false;
    
    // Search query filter
    const query = searchQuery.toLowerCase();
    return sender.name.toLowerCase().includes(query) || sender.email.toLowerCase().includes(query);
  });

  return (
    <div className="h-full flex flex-col overflow-hidden bg-transparent">
      {/* HEADER SECTION */}
      <div className="flex flex-col border-b border-gray-100 dark:border-gray-800 bg-transparent shrink-0">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-100/50 dark:border-gray-800/50">
          <div className="flex items-center gap-3">
            <span
              className="px-4 py-1.5 text-xs font-bold rounded-full shadow-sm text-white tracking-wide flex items-center gap-1.5 uppercase select-none"
              style={{ background: `linear-gradient(135deg, ${theme.accent || "#135bec"} 0%, #3b82f6 100%)` }}
            >
              <MdNotificationsActive size={15} /> Subscriptions ({filteredSenders.length})
            </span>

            <button
              onClick={fetchSubscriptionsData}
              disabled={loading}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 flex items-center justify-center cursor-pointer"
              title="Refresh subscriptions"
            >
              <MdRefresh size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* SEARCH BAR & CATEGORIES */}
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-transparent">
          {/* Tabs */}
          <div className="flex gap-2 text-sm font-medium border-b border-transparent">
            <button
              onClick={() => setActiveFilter("all")}
              className={`py-2 px-4 rounded-lg transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              All Senders
            </button>
            <button
              onClick={() => setActiveFilter("subscribed")}
              className={`py-2 px-4 rounded-lg transition-all cursor-pointer ${
                activeFilter === "subscribed"
                  ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 font-semibold"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Subscribed
            </button>
            <button
              onClick={() => setActiveFilter("unsubscribed")}
              className={`py-2 px-4 rounded-lg transition-all cursor-pointer ${
                activeFilter === "unsubscribed"
                  ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-semibold"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Unsubscribed
            </button>
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <MdSearch size={20} />
            </span>
            <input
              type="text"
              placeholder="Search senders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              style={{ outlineColor: theme.accent }}
            />
          </div>
        </div>
      </div>

      {/* SENDERS LIST SECTION */}
      <div className="flex-1 overflow-y-auto hidden-scrollbar p-4 ">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" style={{ borderColor: theme.accent }}></div>
            <span className="mt-3 text-xs">Loading subscriptions...</span>
          </div>
        ) : filteredSenders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <MdNotificationsOff size={48} className="opacity-20 mb-3" />
            <p className="text-sm font-medium">No senders found</p>
            <p className="text-xs opacity-60 mt-1">Try changing the tab filter or search query</p>
          </div>
        ) : (
          <div className="grid gap-3 max-w-4xl mx-auto">
            {filteredSenders.map((sender) => {
              const isBlocked = blockedSenders.some(b => b.toLowerCase() === sender.email.toLowerCase());
              return (
                <div
                  key={sender.email}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800/80 shadow-sm hover:shadow-md transition-all hover:scale-[1.005] duration-200"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold select-none text-white shrink-0 shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${theme.accent || "#135bec"} 0%, #3b82f6 100%)`,
                        opacity: isBlocked ? 0.6 : 1
                      }}
                    >
                      {sender.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="min-w-0">
                      <h4 className={`text-sm font-semibold truncate ${isBlocked ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-800 dark:text-gray-200"}`}>
                        {sender.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {sender.email}
                      </p>
                      {sender.count > 0 && (
                        <span className="inline-block mt-1 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
                          {sender.count} email{sender.count > 1 ? "s" : ""} in inbox
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span
                      className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isBlocked
                          ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                          : "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30"
                      }`}
                    >
                      {isBlocked ? <MdBlock size={13} /> : <MdMarkEmailRead size={13} />}
                      {isBlocked ? "Unsubscribed" : "Subscribed"}
                    </span>

                    {/* Action Button */}
                    <button
                      onClick={() => handleToggleBlock(sender.email, isBlocked)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        isBlocked
                          ? "bg-white hover:bg-green-50/50 text-green-600 border-green-200 hover:border-green-300 dark:bg-transparent dark:hover:bg-green-950/10 dark:text-green-400 dark:border-green-900/40"
                          : "bg-white hover:bg-red-50/50 text-red-600 border-red-200 hover:border-red-300 dark:bg-transparent dark:hover:bg-red-950/10 dark:text-red-400 dark:border-red-900/40"
                      }`}
                    >
                      {isBlocked ? "Subscribe" : "Unsubscribe"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;

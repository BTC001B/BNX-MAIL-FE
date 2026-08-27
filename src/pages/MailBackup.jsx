import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mailBackupAPI } from "../services/mailBackupApi";
import { useTheme } from "../context/ThemeContext";
import { MdBackup, MdAttachFile, MdKeyboardArrowLeft, MdKeyboardArrowRight, MdInfoOutline, MdRefresh } from "react-icons/md";
import toast from "react-hot-toast";

const MailBackup = () => {
  const navigate = useNavigate();
  const { theme, backgroundImage } = useTheme();

  // State Management
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'received' | 'sent'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mailBackupAPI.getBackups({
        type: activeFilter,
        page: currentPage,
        size: pageSize
      });
      if (res.data && res.data.success) {
        setBackups(res.data.data || []);
        setTotalItems(res.data.total || 0);
      } else {
        setBackups(res.data || []);
        setTotalItems(res.data.length || 0);
      }
    } catch (err) {
      console.error("Failed to load backups:", err);
      setError("Unable to load backup emails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, [activeFilter, currentPage, pageSize]);

  // Reset page when filter or page size changes
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Header Panel */}
      <div 
        className="p-5 border-b flex flex-col gap-1.5 shrink-0" 
        style={{ borderColor: theme.border, background: theme.cardBg }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span 
              className="p-1.5 rounded-lg text-white flex items-center justify-center shadow-sm"
              style={{ background: `linear-gradient(135deg, ${theme.accent || "#135bec"} 0%, #3b82f6 100%)` }}
            >
              <MdBackup size={18} />
            </span>
            <h2 className="text-lg font-bold" style={{ color: theme.text }}>
              Mail Backup
            </h2>
          </div>
          <button
            onClick={fetchBackups}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
            title="Refresh backups"
          >
            <MdRefresh size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <p className="text-xs sm:text-sm max-w-2xl font-normal leading-relaxed mt-0.5" style={{ color: theme.subText }}>
          Your emails are securely backed up and remain available even after the original email is permanently deleted.
        </p>
      </div>

      {/* Filter Tabs Panel */}
      <div 
        className="px-5 py-2.5 border-b flex items-center gap-2 shrink-0 select-none bg-black/[0.01] dark:bg-white/[0.01]"
        style={{ borderColor: theme.border }}
      >
        {["all", "received", "sent"].map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full capitalize transition-all cursor-pointer border ${
                isActive 
                  ? "shadow-sm border-transparent" 
                  : "bg-transparent border-gray-200/60 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
              }`}
              style={isActive ? { backgroundColor: theme.accent || "#135bec", color: "#fff" } : { color: theme.subText }}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Main Mail List Content Container */}
      <div className="flex-1 overflow-y-auto hidden-scrollbar bg-transparent flex flex-col min-h-0">
        {loading ? (
          // Loading Skeletons State
          <div className="flex-1 flex flex-col divide-y divide-gray-100/50 dark:divide-gray-800/40 p-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="py-4 flex flex-col gap-2.5 animate-pulse">
                <div className="flex justify-between items-center w-full">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20" />
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          // Error State
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
            <span className="text-4xl mb-4 opacity-50">⚠️</span>
            <h3 className="text-base font-bold mb-1" style={{ color: theme.text }}>
              Unable to load backup emails
            </h3>
            <p className="text-xs max-w-sm mb-4" style={{ color: theme.subText }}>
              Please try again later. If the issue persists, contact system support.
            </p>
            <button
              onClick={fetchBackups}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: theme.accent || "#135bec" }}
            >
              Retry Connection
            </button>
          </div>
        ) : backups.length === 0 ? (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
            <span className="text-5xl mb-4 opacity-60">📦</span>
            <h3 className="text-base font-bold mb-1" style={{ color: theme.text }}>
              No backup emails yet
            </h3>
            <p className="text-xs max-w-sm" style={{ color: theme.subText }}>
              Your protected email backups will appear here automatically.
            </p>
          </div>
        ) : (
          // Email List Grid Rows
          <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/60">
            {backups.map((email) => (
              <div
                key={email.id}
                onClick={() => navigate(`/mail-backup/${email.id}`)}
                className="group flex items-center justify-between gap-4 py-3 px-5 cursor-pointer transition-all hover:bg-black/[0.015] dark:hover:bg-white/[0.02] border-l-[3px] border-transparent hover:border-primary"
                style={{ borderLeftColor: "transparent" }}
              >
                {/* Left: Sender & Metadata */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs font-bold truncate max-w-[150px] sm:max-w-[200px]" 
                      style={{ color: theme.text }}
                    >
                      {email.fromName || email.fromAddress?.split("@")[0] || email.fromAddress}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded-full select-none shrink-0 border border-blue-100 dark:border-blue-900/50">
                      Protected Backup
                    </span>
                  </div>
                  {/* Subject & snippet preview */}
                  <div className="text-sm font-medium truncate" style={{ color: theme.text }}>
                    {email.subject || "(No Subject)"}
                    <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">
                      — {email.snippet || email.bodySnippet || ""}
                    </span>
                  </div>
                </div>

                {/* Right: Date & Attachments */}
                <div className="flex items-center gap-3.5 shrink-0 text-right">
                  {email.hasAttachments && (
                    <MdAttachFile className="text-gray-400 dark:text-gray-500 shrink-0" size={16} title="Has attachment" />
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
                    {email.createdAt
                      ? new Date(email.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer Panel */}
      {!loading && !error && backups.length > 0 && (
        <div 
          className="flex items-center justify-between gap-3 px-5 py-4 border-t shrink-0 bg-black/[0.01] dark:bg-white/[0.01]"
          style={{ borderColor: theme.border }}
        >
          {/* Page size selector */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="hidden sm:inline">Show:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="p-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none text-xs cursor-pointer focus:ring-1 focus:ring-primary"
              style={{ color: theme.text }}
            >
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <span className="hidden sm:inline">
              | Showing {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} of {totalItems}
            </span>
          </div>

          {/* Nav arrows */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <MdKeyboardArrowLeft size={18} />
            </button>
            <span className="text-xs font-semibold px-2" style={{ color: theme.text }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <MdKeyboardArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MailBackup;

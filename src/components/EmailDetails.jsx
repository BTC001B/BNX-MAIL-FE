import React, { useEffect, useState } from "react";
import { MdArchive, MdDelete, MdStar, MdClose, MdAccessTime, MdLabel } from "react-icons/md";
import { useMail } from "../context/MailContext";
import { useTheme } from "../context/ThemeContext";

const EmailDetails = ({
  email,
  onBack,
  onReply,
  onDelete,
  onStar,
  onArchive,
  onSnooze,
  onApplyLabel,
  onClose,
}) => {
  const { theme } = useTheme();
  const { labels } = useMail();
  const [showLabels, setShowLabels] = useState(false);

  const handleClose = onBack || onClose;

  // For mounting animation
  const [localEmail, setLocalEmail] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [render, setRender] = useState(false);

  useEffect(() => {
    if (email) {
      setLocalEmail(email);
      setRender(true);
      // Small delay to trigger CSS transition
      const timer = setTimeout(() => {
        setMounted(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setMounted(false);
      // Wait for the slide-out transition to finish (300ms)
      const timer = setTimeout(() => {
        setRender(false);
        setLocalEmail(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [email]);

  if (!render || !localEmail) {
    return null;
  }

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      {/* BACKGROUND OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/30 w-full h-full backdrop-blur-sm z-40 transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* SLIDING PANEL */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] max-w-4xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${mounted ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* HEADER */}
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-white/40 dark:bg-gray-800/40 backdrop-blur-md sticky top-0 z-10"
            style={{ borderColor: theme.border }}
          >
            <div className="flex items-center gap-1 sm:gap-3">
              <button
                onClick={handleClose}
                className="p-2 sm:p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors tooltip-trigger flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                title="Close"
              >
                <MdClose size={24} />
              </button>
              <button
                onClick={handleClose}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium text-gray-700 dark:text-gray-200"
              >
                ← <span>Back</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onStar?.(localEmail.uid)}
                className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors tooltip-trigger group"
                title="Star"
              >
                <MdStar
                  size={22}
                  className={localEmail.starred ? "text-yellow-500 fill-current drop-shadow-sm" : "text-gray-400 dark:text-gray-500 group-hover:text-yellow-500 transition-colors"}
                />
              </button>

              <button
                onClick={() => onArchive?.(localEmail.uid)}
                className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 tooltip-trigger"
                title="Archive"
              >
                <MdArchive size={22} />
              </button>

              <button
                onClick={() => {
                  const wakeUpAt = new Date();
                  wakeUpAt.setDate(wakeUpAt.getDate() + 1);
                  onSnooze?.(localEmail.uid, wakeUpAt.toISOString());
                }}
                className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-blue-500 tooltip-trigger"
                title="Snooze"
              >
                <MdAccessTime size={22} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-indigo-500 tooltip-trigger"
                  title="Labels"
                >
                  <MdLabel size={22} />
                </button>
                {showLabels && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded-xl shadow-xl z-20 overflow-hidden">
                    {labels.map(l => (
                      <button
                        key={l.id}
                        onClick={() => {
                          onApplyLabel?.(localEmail.uid, l.id);
                          setShowLabels(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.colorHex }} />
                        <span className="text-sm">{l.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  onDelete?.(localEmail.uid);
                  onBack?.();
                }}
                className="p-2.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-gray-500 dark:text-gray-400 hover:text-red-500 tooltip-trigger"
                title="Delete"
              >
                <MdDelete size={22} />
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-10 py-8 hidden-scrollbar bg-white/60 dark:bg-gray-900/60">
            {/* SUBJECT */}
            <h1
              className="text-2xl sm:text-3xl font-bold mb-8 leading-tight tracking-tight dark:text-gray-100"
              style={{ color: theme.text }}
            >
              {localEmail.subject || "(No Subject)"}
            </h1>

            {/* SENDER INFO */}
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-4">
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center text-white font-semibold text-xl shadow-md border-2 border-white dark:border-gray-800"
                  style={{ backgroundColor: theme.accent || '#135bec' }}
                >
                  {localEmail.from?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">
                    {localEmail.from}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    to <span className="font-medium text-gray-700 dark:text-gray-300">{localEmail.to || "me"}</span>
                  </p>
                </div>
              </div>

              <span className="text-sm font-medium text-gray-400 dark:text-gray-500 self-start sm:self-center bg-gray-100/50 dark:bg-gray-800/50 px-3 py-1 rounded-full">
                {localEmail.sentDate ? formatDate(localEmail.sentDate) : ""}
              </span>
            </div>

            {/* BODY */}
            <div className="max-w-none prose prose-slate dark:prose-invert prose-p:leading-relaxed prose-a:text-primary">
              {localEmail.htmlBody ? (
                <div
                  dangerouslySetInnerHTML={{ __html: localEmail.htmlBody }}
                />
              ) : (
                <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-[15px] sm:text-base leading-relaxed">
                  {localEmail.body}
                </p>
              )}
            </div>

            {/* ATTACHMENTS */}
            {localEmail.attachments?.length > 0 && (
              <div className="mt-10">
                <p className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Attachments ({localEmail.attachments.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {localEmail.attachments.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 hover:shadow-soft transition-all group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl shrink-0">📎</div>
                        <span className="text-sm font-medium truncate text-gray-700 dark:text-gray-200">{file}</span>
                      </div>
                      <button
                        className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
                      >
                        ↓
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div
            className="flex gap-3 p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
          >
            <button
              onClick={() => onReply?.(email)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all w-32"
              style={{ background: `linear-gradient(135deg, ${theme.accent || '#135bec'} 0%, #3b82f6 100%)` }}
            >
              <MdReply size={20} /> Reply
            </button>

            <button
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm transition-all text-gray-700 dark:text-gray-200 w-32"
            >
              <MdForward size={20} /> Forward
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailDetails;

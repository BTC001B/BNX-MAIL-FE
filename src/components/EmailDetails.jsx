import React, { useState } from "react";
import { MdArchive, MdDelete, MdStar, MdAccessTime, MdLabel, MdReply, MdForward } from "react-icons/md";
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

  if (!email) {
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
    <div
      className="flex-1 flex flex-col overflow-hidden w-full h-full animate-fade-in"
      style={{ backgroundColor: theme.cardBg }}
    >
      {/* HEADER ACTION TOOLBAR */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-2 border-b shrink-0"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
            title="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="h-5 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1" />

          <button
            onClick={() => onArchive?.(email.uid)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 cursor-pointer"
            title="Archive"
          >
            <MdArchive size={20} />
          </button>

          <button
            onClick={() => {
              const wakeUpAt = new Date();
              wakeUpAt.setDate(wakeUpAt.getDate() + 1);
              onSnooze?.(email.uid, wakeUpAt.toISOString());
            }}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-blue-500 cursor-pointer"
            title="Snooze"
          >
            <MdAccessTime size={20} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowLabels(!showLabels)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-indigo-500 cursor-pointer"
              title="Labels"
            >
              <MdLabel size={20} />
            </button>
            {showLabels && (
              <div
                className="absolute left-0 mt-2 w-48 rounded-xl shadow-xl z-20 border overflow-hidden"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                {labels.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      onApplyLabel?.(email.uid, l.id);
                      setShowLabels(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center gap-2 cursor-pointer"
                    style={{ color: theme.text }}
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
              onDelete?.(email.uid);
              handleClose();
            }}
            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-gray-500 dark:text-gray-400 hover:text-red-500 cursor-pointer"
            title="Delete"
          >
            <MdDelete size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onStar?.(email.uid)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer group"
            title={email.starred ? "Unstar" : "Star"}
          >
            <MdStar
              size={20}
              className={
                email.starred
                  ? "text-yellow-500 fill-current drop-shadow-sm"
                  : "text-gray-400 dark:text-gray-500 group-hover:text-yellow-500 transition-colors"
              }
            />
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-transparent">
        {/* SUBJECT */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <h1
            className="text-xl sm:text-2xl font-bold leading-tight tracking-tight"
            style={{ color: theme.text }}
          >
            {email.subject || "(No Subject)"}
          </h1>
          <div className="flex flex-wrap gap-2">
            {email.labels?.map((label) => (
              <span
                key={label.id}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm border border-black/5 dark:border-white/5"
                style={{ backgroundColor: label.colorHex }}
              >
                {label.name}
              </span>
            ))}
          </div>
        </div>

        {/* SENDER INFO */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-base shadow-sm shrink-0"
              style={{ backgroundColor: theme.accent || "#135bec" }}
            >
              {email.from?.split("@")[0]?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base" style={{ color: theme.text }}>
                {email.from?.includes("<") ? (
                  <>
                    {email.from.split("<")[0].replace(/^["']/g, "").replace(/["']$/g, "").trim()}{" "}
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">&lt;{email.from.split("<")[1].split(">")[0]}&gt;</span>
                  </>
                ) : (
                  email.from
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                to <span className="font-medium text-gray-700 dark:text-gray-300">{email.to || "me"}</span>
              </p>
            </div>
          </div>

          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 self-start sm:self-center bg-black/[0.03] dark:bg-white/[0.04] px-2.5 py-1 rounded-full">
            {email.sentDate ? formatDate(email.sentDate) : email.receivedDate ? formatDate(email.receivedDate) : ""}
          </span>
        </div>

        {/* BODY */}
        <div className="max-w-none prose prose-slate dark:prose-invert prose-p:leading-relaxed text-[15px] leading-relaxed">
          {email.htmlBody ? (
            <div dangerouslySetInnerHTML={{ __html: email.htmlBody }} style={{ color: theme.text }} />
          ) : (
            <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200" style={{ color: theme.text }}>
              {email.body}
            </p>
          )}
        </div>

        {/* ATTACHMENTS */}
        {email.attachments?.length > 0 && (
          <div className="mt-8 pt-6 border-t" style={{ borderColor: theme.border }}>
            <p className="text-xs font-bold mb-3 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Attachments ({email.attachments.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {email.attachments.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl border bg-black/[0.01] dark:bg-white/[0.01] hover:shadow-sm transition-all group"
                  style={{ borderColor: theme.border }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-8 w-8 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-base shrink-0">📎</div>
                    <span className="text-xs font-medium truncate" style={{ color: theme.text }}>{file}</span>
                  </div>
                  <button className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0 cursor-pointer">
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
        className="flex gap-3 p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t shrink-0"
        style={{ borderColor: theme.border }}
      >
        <button
          onClick={() => onReply?.(email)}
          className="flex items-center justify-center gap-2 px-5 py-2 rounded-full text-white font-medium shadow-sm hover:shadow hover:-translate-y-0.5 transition-all w-28 text-sm cursor-pointer"
          style={{ background: theme.accent || "#135bec" }}
        >
          <MdReply size={18} /> Reply
        </button>

        <button
          className="flex items-center justify-center gap-2 px-5 py-2 rounded-full font-medium border hover:bg-black/5 dark:hover:bg-white/5 hover:shadow-sm transition-all text-sm w-28 cursor-pointer text-gray-700 dark:text-gray-200"
          style={{ borderColor: theme.border }}
        >
          <MdForward size={18} /> Forward
        </button>
      </div>
    </div>
  );
};

export default EmailDetails;

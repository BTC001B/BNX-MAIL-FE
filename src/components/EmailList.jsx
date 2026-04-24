import React from "react";
import img from "../assets/img1.jpg";
import { MdArchive, MdDelete, MdStar, MdStarBorder, MdAccessTime } from "react-icons/md";

const EmailList = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  onDelete,
  onStar,
  onArchive,
  onSnooze,
  selectedIds = new Set(),
  onToggleSelect,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 pt-2 hidden-scrollbar bg-transparent">
      {emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 glass-panel rounded-3xl m-2 animate-fade-in">
          <span className="text-6xl mb-5 opacity-80 drop-shadow-md">📭</span>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Your folder is empty</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {emails.map((email, i) => (
            <div
              key={email.uid}
              onClick={() => onSelectEmail(email)}
              className={`group relative flex items-center gap-4 sm:gap-6
                cursor-pointer py-3.5 sm:py-4 px-4 sm:px-5 rounded-2xl
                transition-all duration-300 ease-out
                ${selectedEmailId === email.uid
                  ? "bg-white/90 dark:bg-gray-800/90 shadow-soft border-primary/30 ring-1 ring-primary/20 scale-[1.01]"
                  : "glass hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-soft hover:scale-[1.01] hover:-translate-y-0.5"
                }`}
              style={{
                animationDelay: `${i * 30}ms`,
                animationFillMode: 'both'
              }}
            >
              {/* Avatar */}
              <div className="relative shrink-0 hidden sm:block">
                <img
                  src={img}
                  alt={email.from}
                  className="h-12 w-12 rounded-full object-cover shadow-sm border-2 border-white dark:border-gray-700 transition-transform group-hover:scale-105"
                />
                {!email.isRead && (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm">
                    <span className="block h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!email.isRead && (
                      <span className="sm:hidden block h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
                    )}
                    <p
                      className={`truncate text-sm sm:text-base ${!email.isRead
                        ? "font-bold text-gray-900 dark:text-gray-100"
                        : "font-medium text-gray-700 dark:text-gray-300"
                        }`}
                    >
                      {email.from}
                    </p>
                  </div>
                  <span className={`text-xs whitespace-nowrap ml-2 ${!email.isRead ? "font-semibold text-primary" : "text-gray-400 dark:text-gray-500"}`}>
                    {email.receivedDate
                      ? new Date(email.receivedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                      : ""}
                  </span>
                </div>

                <p
                  className={`truncate text-sm pr-6 ${!email.isRead
                    ? "font-medium text-gray-800 dark:text-gray-200"
                    : "text-gray-500 dark:text-gray-400"
                    }`}
                >
                  {email.subject || "(No Subject)"}
                </p>
              </div>

              {/* Star Indicator (Always visible if starred) */}
              {email.starred && (
                <div className="shrink-0 absolute right-4 top-1/2 -translate-y-1/2 group-hover:opacity-0 transition-opacity">
                  <MdStar size={20} className="text-yellow-400 drop-shadow-sm" />
                </div>
              )}

              {/* Hover Actions */}
              <div
                className="absolute top-1/2 -translate-y-1/2 right-4
             flex items-center gap-1.5 rounded-xl
             glass-panel bg-white/90 p-1.5 shadow-soft opacity-0 scale-95
             transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 dark:bg-gray-800/90"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive?.(email.uid);
                  }}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors tooltip-trigger"
                  title="Archive"
                >
                  <MdArchive size={18} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(email.uid);
                  }}
                  className="rounded-lg p-2 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 transition-colors tooltip-trigger"
                  title="Delete"
                >
                  <MdDelete size={18} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const wakeUpAt = new Date();
                    wakeUpAt.setDate(wakeUpAt.getDate() + 1); // Default to tomorrow
                    onSnooze?.(email.uid, wakeUpAt.toISOString());
                  }}
                  className="rounded-lg p-2 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300 transition-colors tooltip-trigger"
                  title="Snooze"
                >
                  <MdAccessTime size={18} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStar?.(email.uid);
                  }}
                  className="rounded-lg p-2 hover:bg-yellow-50 hover:text-yellow-500 dark:hover:bg-yellow-900/30 text-gray-600 dark:text-gray-300 transition-colors tooltip-trigger"
                  title={email.starred ? "Unstar" : "Star"}
                >
                  {email.starred ? (
                    <MdStar size={18} className="text-yellow-500" />
                  ) : (
                    <MdStarBorder size={18} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailList;

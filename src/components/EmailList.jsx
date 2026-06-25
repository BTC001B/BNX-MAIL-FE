import React, { useState } from "react";
import { MdArchive, MdUnarchive, MdDelete, MdStar, MdStarBorder, MdAccessTime, MdWbSunny, MdNightsStay, MdToday, MdEvent, MdUpdate, MdDateRange } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const EmailList = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  onDelete,
  onStar,
  onArchive,
  onUnarchive,
  onSnooze,
  showTo = false,
  selectedIds = new Set(),
  onToggleSelect,
  isArchiveFolder = false,
}) => {
  const { user } = useAuth();
  const [snoozeOpenUid, setSnoozeOpenUid] = useState(null);
  const [customPickerUid, setCustomPickerUid] = useState(null);
  const [customDateTime, setCustomDateTime] = useState("");

  const getSnoozeOptions = () => {
    const now = new Date();
    
    // Later today: 6 PM today (or +3 hours if past 5 PM)
    const laterToday = new Date(now);
    if (now.getHours() >= 17) {
      laterToday.setHours(now.getHours() + 3);
    } else {
      laterToday.setHours(18, 0, 0, 0);
    }

    // Tomorrow: 8 AM tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    // Later this week: Thursday 8 AM (if today is Mon/Tue/Wed), else +2 days 8 AM
    const laterThisWeek = new Date(now);
    if (now.getDay() < 4) {
      laterThisWeek.setDate(now.getDate() + (4 - now.getDay()));
    } else {
      laterThisWeek.setDate(now.getDate() + 2);
    }
    laterThisWeek.setHours(8, 0, 0, 0);

    // This weekend: Saturday 8 AM
    const thisWeekend = new Date(now);
    const daysToSaturday = 6 - now.getDay();
    thisWeekend.setDate(now.getDate() + (daysToSaturday === 0 ? 7 : daysToSaturday));
    thisWeekend.setHours(8, 0, 0, 0);

    // Next week: Monday 8 AM
    const nextWeek = new Date(now);
    const daysToMonday = (8 - now.getDay()) % 7 || 7;
    nextWeek.setDate(now.getDate() + daysToMonday);
    nextWeek.setHours(8, 0, 0, 0);

    const formatTime = (d) => {
      const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const dateStr = d.toLocaleDateString([], { weekday: 'short' });
      return `${dateStr}, ${timeStr}`;
    };

    return [
      { label: "Later today", time: laterToday, display: formatTime(laterToday), icon: <MdToday size={18} className="text-amber-500" /> },
      { label: "Tomorrow", time: tomorrow, display: formatTime(tomorrow), icon: <MdWbSunny size={18} className="text-yellow-500" /> },
      { label: "Later this week", time: laterThisWeek, display: formatTime(laterThisWeek), icon: <MdEvent size={18} className="text-indigo-500" /> },
      { label: "This weekend", time: thisWeekend, display: formatTime(thisWeekend), icon: <MdNightsStay size={18} className="text-purple-500" /> },
      { label: "Next week", time: nextWeek, display: formatTime(nextWeek), icon: <MdUpdate size={18} className="text-emerald-500" /> },
    ];
  };

  return (
    <div className="flex-1 overflow-y-auto bg-transparent">
      {emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400 p-8">
          <span className="text-5xl mb-4 opacity-75">📭</span>
          <p className="text-base font-medium text-gray-500 dark:text-gray-400">Your folder is empty</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/60">
          {emails.map((email, i) => {
            const isSentByUser = showTo || (user?.email && email.from?.toLowerCase().includes(user.email.toLowerCase()));
            const sender = isSentByUser ? (email.to || email.recipientEmail) : email.from;
            const isUnread = !email.isRead;
            const isSelected = selectedEmailId === email.uid;
            const isActuallyArchived = isArchiveFolder || email.folderName?.toLowerCase() === "archive";

            return (
              <div
                key={email.uid}
                onClick={() => onSelectEmail(email)}
                className={`group flex items-center gap-3 py-2.5 px-4 cursor-pointer relative transition-colors duration-150 select-none
                  ${isSelected
                    ? "bg-primary/5 dark:bg-primary/10 border-l-[3px] border-primary"
                    : isUnread
                      ? "bg-black/[0.01] dark:bg-white/[0.02] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border-l-[3px] border-transparent"
                      : "bg-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02] border-l-[3px] border-transparent"
                  }`}
              >
                {/* Checkbox */}
                <div className="flex items-center shrink-0" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(email.uid)}
                    onChange={() => onToggleSelect?.(email.uid)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                  />
                </div>

                {/* Star Button */}
                <div className="flex items-center shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStar?.(email.uid);
                    }}
                    className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-400 dark:text-gray-500 hover:text-yellow-500 cursor-pointer"
                    title={email.starred ? "Unstar" : "Star"}
                  >
                    {email.starred ? (
                      <MdStar size={20} className="text-yellow-500 fill-current" />
                    ) : (
                      <MdStarBorder size={20} className="text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                </div>

                {/* Sender Name */}
                <div className="w-36 sm:w-44 md:w-48 shrink-0 truncate pr-2">
                  <span
                    className={`text-sm ${
                      isUnread
                        ? "font-bold text-gray-900 dark:text-gray-100"
                        : "font-medium text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {isSentByUser ? (
                      <span className="flex items-center gap-1">
                        <span className="text-[9px] font-bold border border-current px-0.5 rounded-sm opacity-50">TO</span>
                        {(email.to || email.recipientEmail)?.split("@")[0]}
                      </span>
                    ) : (
                      sender?.includes("<") 
                      ? sender.split("<")[0].replace(/^["']/g, "").replace(/["']$/g, "").trim() 
                      : (sender?.split("@")[0] || sender)
                    )}
                  </span>
                </div>

                {/* Subject & Snippet */}
                <div className="flex-1 min-w-0 flex items-baseline gap-2 truncate pr-4">
                  <span
                    className={`text-sm truncate ${
                      isUnread
                        ? "font-bold text-gray-900 dark:text-gray-100"
                        : "font-medium text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {email.subject || "(No Subject)"}
                  </span>
                  <span className="text-sm text-gray-400 dark:text-gray-500 truncate font-normal">
                    — {email.body ? email.body.replace(/\s+/g, " ") : ""}
                  </span>
                </div>

                {/* Labels */}
                {email.labels && email.labels.length > 0 && (
                  <div className="hidden sm:flex gap-1 shrink-0 mr-2 select-none">
                    {email.labels.map((label) => (
                      <span
                        key={label.id}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tight text-white border border-black/5 dark:border-white/5"
                        style={{ backgroundColor: label.colorHex }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Date / Hover Actions */}
                <div className="w-16 sm:w-20 shrink-0 text-right relative flex justify-end items-center h-full">
                  <span
                    className={`text-xs whitespace-nowrap transition-opacity duration-100 group-hover:opacity-0 ${
                      isUnread ? "font-bold text-primary" : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {email.receivedDate
                      ? new Date(email.receivedDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </span>

                  {/* Quick actions that fade-in on row hover */}
                  <div
                    className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-white dark:bg-gray-900 dark:bg-slate-900 pl-2 transition-opacity duration-150 ${snoozeOpenUid === email.uid ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isActuallyArchived) {
                          if (onUnarchive) onUnarchive(email.uid);
                          else onArchive?.(email.uid);
                        } else {
                          onArchive?.(email.uid);
                        }
                      }}
                      className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
                      title={isActuallyArchived ? "Unarchive" : "Archive"}
                    >
                      {isActuallyArchived ? <MdUnarchive size={18} /> : <MdArchive size={18} />}
                    </button>
                    <button
                      onClick={() => onDelete?.(email.uid)}
                      className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-red-500 cursor-pointer"
                      title="Delete"
                    >
                      <MdDelete size={18} />
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (snoozeOpenUid === email.uid) {
                            setSnoozeOpenUid(null);
                            setCustomPickerUid(null);
                          } else {
                            setSnoozeOpenUid(email.uid);
                            setCustomPickerUid(null);
                          }
                        }}
                        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-blue-500 cursor-pointer"
                        title="Snooze"
                      >
                        <MdAccessTime size={18} />
                      </button>

                      {snoozeOpenUid === email.uid && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl z-30 border bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 overflow-hidden text-sm flex flex-col py-1.5 animate-fadeIn"
                        >
                          <div className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                            <span>Snooze until...</span>
                            <button 
                              onClick={() => { setSnoozeOpenUid(null); setCustomPickerUid(null); }}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                              ✕
                            </button>
                          </div>

                          {customPickerUid === email.uid ? (
                            <div className="p-4 flex flex-col gap-3">
                              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Select Date & Time
                              </label>
                              <input
                                type="datetime-local"
                                value={customDateTime}
                                onChange={(e) => setCustomDateTime(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex gap-2 justify-end mt-2">
                                <button
                                  onClick={() => setCustomPickerUid(null)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
                                >
                                  Back
                                </button>
                                <button
                                  onClick={() => {
                                    if (!customDateTime) {
                                      alert("Please select a valid date and time.");
                                      return;
                                    }
                                    const dateObj = new Date(customDateTime);
                                    if (dateObj <= new Date()) {
                                      alert("Please select a future date and time.");
                                      return;
                                    }
                                    onSnooze?.(email.uid, dateObj.toISOString());
                                    setSnoozeOpenUid(null);
                                    setCustomPickerUid(null);
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {getSnoozeOptions().map((opt, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    onSnooze?.(email.uid, opt.time.toISOString());
                                    setSnoozeOpenUid(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-between gap-3 cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center gap-3 truncate">
                                    {opt.icon}
                                    <span className="text-gray-800 dark:text-gray-200 font-medium truncate">{opt.label}</span>
                                  </div>
                                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{opt.display}</span>
                                </button>
                              ))}

                              <div className="border-t border-gray-100 dark:border-neutral-800 my-1"></div>

                              <button
                                onClick={() => {
                                  setCustomPickerUid(email.uid);
                                  const defaultCustom = new Date();
                                  defaultCustom.setMinutes(defaultCustom.getMinutes() - defaultCustom.getTimezoneOffset());
                                  setCustomDateTime(defaultCustom.toISOString().slice(0, 16));
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center gap-3 cursor-pointer transition-colors text-blue-500 dark:text-blue-400 font-medium"
                              >
                                <MdDateRange size={18} />
                                <span>Select date & time</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmailList;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMail } from "../context/MailContext";
import { MdMail, MdFilterList, MdForward, MdReply } from "react-icons/md";
import EmailList from "../components/EmailList";
import EmailDetails from "../components/EmailDetails";
import { useTheme } from "../context/ThemeContext";

const AllMail = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { emails, loading, fetchEmails, handleToggleStar, handleMoveToTrash, handleMarkRead } = useMail();
  const [selectedEmail, setSelectedEmail] = useState(null);

  // UI-only filter dropdown states
  const [showTime, setShowTime] = useState(false);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  useEffect(() => {
    fetchEmails('inbox');
  }, [fetchEmails]);

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      handleMarkRead(email.uid);
    }
  };

  const handleReply = (email) => {
    navigate("/compose", {
      state: {
        replyTo: email.senderEmail || email.from,
        subject: `Re: ${email.subject || ""}`,
        originalBody: email.body,
      },
    });
  };

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-transparent">
      {/* LEFT — LIST */}
      <div
        className={`transition-all duration-300 w-full border-r-0 sm:border-r border-gray-200/50 dark:border-gray-800/50 relative z-10 ${selectedEmail ? 'hidden md:block' : 'block'}`}
      >
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md sticky top-0 z-20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className="px-4 py-1.5 text-sm font-semibold rounded-full shadow-sm text-white tracking-wide"
              style={{ background: `linear-gradient(135deg, ${theme.accent || '#135bec'} 0%, #3b82f6 100%)` }}
            >
              All Mail ({emails.length})
            </span>

            {/* RESTORED FILTERS */}
            <div className="flex items-center gap-2">
              <FilterButton label="From" open={showFrom} setOpen={setShowFrom} />
              <FilterButton label="To" open={showTo} setOpen={setShowTo} />
              <FilterButton label="Date" open={showTime} setOpen={setShowTime} />
            </div>
          </div>
        </div>

        {/* EMAIL LIST CONTAINER */}
        <div className="h-full overflow-y-auto hidden-scrollbar pb-24">
          {emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-80 animate-fade-in">
              <MdMail className="text-6xl mb-4 text-gray-300 dark:text-gray-600 drop-shadow-md" />
              <p className="font-medium text-gray-500 dark:text-gray-400">No emails found</p>
            </div>
          ) : (
            <EmailList
              emails={emails}
              selectedEmailId={selectedEmail?.uid}
              onSelectEmail={handleSelectEmail}
              onDelete={(uid) => handleMoveToTrash(uid, 'inbox')}
              onStar={(uid) => handleToggleStar(uid, 'inbox')}
            />
          )}
        </div>
      </div>

      {/* RIGHT — DETAILS */}
      <div
        className={`flex-1 transition-all duration-300 relative ${selectedEmail ? 'block' : 'hidden md:block'}`}
      >
        <EmailDetails
          email={selectedEmail}
          onBack={() => setSelectedEmail(null)}
          onDelete={(uid) => {
            handleMoveToTrash(uid, 'inbox');
            setSelectedEmail(null);
          }}
          onStar={(uid) => handleToggleStar(uid, 'inbox')}
          onReply={handleReply}
        />
      </div>
    </div>
  );
};

/* ---------------- FILTER BUTTON ---------------- */
const FilterButton = ({ label, open, setOpen }) => (
  <div className="relative">
    <button
      onClick={() => setOpen(!open)}
      className="px-3 py-1 border rounded-full text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
    >
      {label} ▾
    </button>

    {open && (
      <div className="absolute mt-2 w-56 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-3 z-30 text-sm border dark:border-gray-700 animate-in fade-in zoom-in duration-200 origin-top-right right-0">
        <p className="text-gray-500 dark:text-gray-400">Filter options coming soon...</p>
      </div>
    )}
  </div>
);

export default AllMail;

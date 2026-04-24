import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMail } from "../context/MailContext";
import { MdReport } from "react-icons/md";
import EmailList from "../components/EmailList";
import EmailDetails from "../components/EmailDetails";
import { useTheme } from "../context/ThemeContext";

const Spam = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { emails, loading, fetchEmails, handleToggleStar, handleMoveToTrash } = useMail();
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    fetchEmails('spam');
  }, [fetchEmails]);

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
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
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* LEFT — LIST */}
      <div
        className={`transition-all duration-300 w-full border-r ${selectedEmail ? 'hidden md:block' : 'block'}`}
        style={{
          backgroundColor: theme.bg,
          borderColor: theme.border,
        }}
      >
        {/* HEADER */}
        <div
          className="p-4 border-b"
          style={{ borderColor: theme.border }}
        >
          <h2
            className="text-xl font-semibold flex items-center gap-2"
            style={{ color: theme.text }}
          >
            <MdReport size={24} className="text-red-500" /> Spam
            <span
              className="ml-2 text-sm font-normal"
              style={{ color: theme.subText }}
            >
              ({emails.length})
            </span>
          </h2>
        </div>

        {/* EMPTY STATE */}
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MdReport size={64} className="text-gray-300 dark:text-gray-600 mb-4 opacity-50" />
            <p
              className="text-lg font-medium mb-1"
              style={{ color: theme.text }}
            >
              No spam emails
            </p>
            <p style={{ color: theme.subText }}>
              Spam emails will automatically appear here
            </p>
          </div>
        ) : (
          <EmailList
            emails={emails}
            selectedEmailId={selectedEmail?.uid}
            onSelectEmail={handleSelectEmail}
            onDelete={(uid) => handleMoveToTrash(uid, 'spam')}
            onStar={(uid) => handleToggleStar(uid, 'spam')}
          />
        )}
      </div>

      {/* RIGHT — DETAILS */}
      <div
        className={`flex-1 transition-all duration-300 ${selectedEmail ? 'block' : 'hidden md:block'}`}
        style={{ backgroundColor: theme.bg }}
      >
        <EmailDetails
          email={selectedEmail}
          onBack={() => setSelectedEmail(null)}
          onDelete={(uid) => {
            handleMoveToTrash(uid, 'spam');
            setSelectedEmail(null);
          }}
          onStar={(uid) => handleToggleStar(uid, 'spam')}
          onReply={handleReply}
        />
      </div>
    </div>
  );
};

export default Spam;

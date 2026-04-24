import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMail } from "../context/MailContext";
import { MdSend } from "react-icons/md";
import EmailList from "../components/EmailList";
import EmailDetails from "../components/EmailDetails";
import { useTheme } from "../context/ThemeContext";

const Send = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { emails, loading, fetchEmails, handleToggleStar, handleMoveToTrash } = useMail();
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    fetchEmails('sent');
  }, [fetchEmails]);

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
  };

  const handleDelete = (uid) => {
    handleMoveToTrash(uid, 'sent');
    setSelectedEmail(null);
  };

  const handleReply = (email) => {
    navigate("/compose", {
      state: {
        replyTo: email.to || email.senderEmail || email.from, // For sent mail, reply to the recipient
        subject: `Re: ${email.subject || ""}`,
        originalBody: email.body,
      },
    });
  };

  /* ---------------- LOADING ---------------- */
  if (loading && emails.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4"
            style={{ borderColor: theme.accent }}
          />
          <p style={{ color: theme.subText }}>Loading sent mail…</p>
        </div>
      </div>
    );
  }

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
            className="text-xl font-semibold"
            style={{ color: theme.text }}
          >
            Sent
            <span
              className="ml-2 text-sm font-normal"
              style={{ color: theme.subText }}
            >
              ({emails.length})
            </span>
          </h2>
        </div>

        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <MdSend className="text-6xl mb-4 text-gray-300 dark:text-gray-600 opacity-50" />
            <p style={{ color: theme.subText }}>No sent emails</p>
          </div>
        ) : (
          <EmailList
            emails={emails}
            selectedEmailId={selectedEmail?.uid}
            onSelectEmail={handleSelectEmail}
            onDelete={handleDelete}
            onStar={(uid) => handleToggleStar(uid, 'sent')}
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
          onDelete={handleDelete}
          onStar={(uid) => handleToggleStar(uid, 'sent')}
          onReply={handleReply}
        />
      </div>
    </div>
  );
};

export default Send;

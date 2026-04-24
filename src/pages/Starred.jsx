import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMail } from "../context/MailContext";
import { MdStar, MdStarBorder } from "react-icons/md";
import EmailList from "../components/EmailList";
import EmailDetails from "../components/EmailDetails";
import { useTheme } from "../context/ThemeContext";

const Starred = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { emails, loading, fetchEmails, handleToggleStar, handleMoveToTrash } = useMail();
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    fetchEmails('starred');
  }, [fetchEmails]);

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
  };

  const handleUnstar = async (uid) => {
    await handleToggleStar(uid, 'starred');
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
    <div className="flex h-full relative overflow-hidden">
      {/* LEFT — LIST */}
      <div
        className={`transition-all duration-300 w-full bg-transparent ${selectedEmail ? 'hidden md:block' : 'block'}`}
        style={{
          backgroundColor: theme.bg,
        }}
      >
        {/* HEADER */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: theme.border }}
        >
          <h2
            className="text-xl font-semibold flex items-center gap-2"
            style={{ color: theme.text }}
          >
            <MdStar className="text-yellow-400" size={24} /> Starred
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
            <MdStar className="text-6xl mb-4 text-yellow-400 opacity-50" />
            <p
              className="text-lg font-medium mb-1"
              style={{ color: theme.text }}
            >
              No starred emails
            </p>
            <p style={{ color: theme.subText }}>
              Star important emails to find them quickly
            </p>
          </div>
        ) : (
          <EmailList
            emails={emails}
            selectedEmailId={selectedEmail?.uid}
            onSelectEmail={handleSelectEmail}
            onStar={handleUnstar}
            onDelete={(uid) => handleMoveToTrash(uid, 'starred')}
          />
        )}
      </div>

      {/* RIGHT — DETAILS */}
      <div className={`flex-1 ${selectedEmail ? 'block' : 'hidden md:block'}`}>
        <EmailDetails
          email={selectedEmail}
          onBack={() => setSelectedEmail(null)}
          onClose={() => setSelectedEmail(null)}
          onDelete={(uid) => {
            handleMoveToTrash(uid, 'starred');
            setSelectedEmail(null);
          }}
          onStar={handleUnstar}
          onReply={handleReply}
        />
      </div>
    </div>
  );
};

export default Starred;

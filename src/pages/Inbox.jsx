import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMail } from "../context/MailContext";
import { mailAPI } from "../services/api";
import EmailList from "../components/EmailList";
import EmailDetails from "../components/EmailDetails";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const Inbox = ({ searchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { emails, loading, fetchEmails, handleToggleStar, handleMoveToTrash, handleMarkRead, handleSnooze } = useMail();

  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    fetchEmails('inbox');
  }, [fetchEmails]);

  const visibleEmails = emails.filter(
    (e) =>
      (e.subject?.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
        e.from?.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
        e.senderEmail?.toLowerCase().includes((searchQuery || "").toLowerCase()))
  );

  useEffect(() => {
    setSelectedEmail(null);
  }, [location.pathname]);

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      handleMarkRead(email.uid);
    }
  };

  const handleApplyLabel = async (uid, labelId) => {
    try {
      await mailAPI.applyLabel(uid, labelId, 'INBOX');
      toast.success('Label applied');
    } catch (error) {
      toast.error('Failed to apply label');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <div
        className={`w-full border-r ${selectedEmail ? 'hidden md:block' : 'block'}`}
        style={{ backgroundColor: theme.bg }}
      >
        {loading && <div className="p-4 text-center">Loading inbox...</div>}
        <EmailList
          emails={visibleEmails}
          selectedEmailId={selectedEmail?.uid}
          onSelectEmail={handleSelectEmail}
          onDelete={(uid) => handleMoveToTrash(uid, 'inbox')}
          onStar={(uid) => handleToggleStar(uid, 'inbox')}
          onSnooze={handleSnooze}
        />
      </div>

      <div className={`flex-1 ${selectedEmail ? 'block' : 'hidden md:block'}`}>
        <EmailDetails
          email={selectedEmail}
          onBack={() => setSelectedEmail(null)}
          onDelete={(uid) => {
            handleMoveToTrash(uid, 'inbox');
            setSelectedEmail(null);
          }}
          onStar={(uid) => handleToggleStar(uid, 'inbox')}
          onSnooze={handleSnooze}
          onApplyLabel={handleApplyLabel}
          onReply={(email) =>
            navigate("/compose", {
              state: {
                replyTo: email.from,
                subject: `Re: ${email.subject}`,
                originalBody: email.body,
              },
            })
          }
        />
      </div>
    </div>
  );
};

export default Inbox;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMail } from "../context/MailContext";
import { MdDrafts } from "react-icons/md";
import EmailList from "../components/EmailList";
import EmailDetails from "../components/EmailDetails";
import { useTheme } from "../context/ThemeContext";

const Draft = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { emails, loading, fetchEmails, handleToggleStar, handleMoveToTrash, handleApplyLabel, handleArchive } = useMail();
  const [selectedEmailUid, setSelectedEmailUid] = useState(null);
  const selectedEmail = emails.find((e) => String(e.uid) === String(selectedEmailUid));

  useEffect(() => {
    fetchEmails('draft');
  }, [fetchEmails]);

  const handleSelectEmail = (email) => {
    setSelectedEmailUid(email.uid);
  };

  const handleReply = (email) => {
    // Open draft in composer
    navigate("/compose", {
      state: {
        draft: email
      },
    });
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: theme.bg }}
      >
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderColor: theme.accent }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-transparent">
      {selectedEmail ? (
        <EmailDetails
          email={selectedEmail}
          onBack={() => setSelectedEmailUid(null)}
          onClose={() => setSelectedEmailUid(null)}
          onDelete={(uid) => {
            handleMoveToTrash(uid, "draft");
            setSelectedEmailUid(null);
          }}
          onStar={(uid) => handleToggleStar(uid, "draft")}
          onArchive={(uid) => {
            handleArchive(uid, "draft");
            setSelectedEmailUid(null);
          }}
          onReply={handleReply}
          onApplyLabel={handleApplyLabel}
        />
      ) : (
        <>
          {/* HEADER */}
          <div
            className="p-4 sm:p-5 border-b flex items-center justify-between shrink-0 bg-transparent"
            style={{ borderColor: theme.border }}
          >
            <h2
              className="text-base font-bold flex items-center gap-2"
              style={{ color: theme.text }}
            >
              <MdDrafts className="text-primary" size={20} style={{ color: theme.accent }} /> Drafts
              <span
                className="ml-2 text-xs font-normal"
                style={{ color: theme.subText }}
              >
                ({emails.length})
              </span>
            </h2>
          </div>

          {/* EMAIL LIST CONTAINER */}
          <div className="flex-1 overflow-y-auto hidden-scrollbar pb-12">
            {emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <span className="text-5xl mb-3">📝</span>
                <p
                  className="text-base font-semibold mb-1"
                  style={{ color: theme.text }}
                >
                  No drafts
                </p>
                <p className="text-sm mb-4" style={{ color: theme.subText }}>
                  Draft emails you save will appear here
                </p>
                <button
                  onClick={() => navigate("/compose")}
                  className="px-4 py-2 rounded-full text-white text-sm cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: theme.accent }}
                >
                  Compose Email
                </button>
              </div>
            ) : (
              <EmailList
                emails={emails}
                selectedEmailId={selectedEmail?.uid}
                onSelectEmail={handleSelectEmail}
                onStar={(uid) => handleToggleStar(uid, "draft")}
                onArchive={(uid) => handleArchive(uid, "draft")}
                onDelete={(uid) => handleMoveToTrash(uid, "draft")}
                showTo={true}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Draft;

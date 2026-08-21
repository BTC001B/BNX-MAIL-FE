import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMail } from "../context/MailContext";
import { MdMail, MdFilterList, MdLabel, MdRefresh } from "react-icons/md";
import EmailList from "../components/EmailList";
import EmailDetails from "../components/EmailDetails";
import { useTheme } from "../context/ThemeContext";

import BulkActionsToolbar from "../components/BulkActionsToolbar";
import ReadingPaneLayout from "../components/ReadingPaneLayout";

const AllMail = ({ searchQuery }) => {
  const navigate = useNavigate();
  const { labelId } = useParams();
  const { theme, readingPaneMode } = useTheme();
  const { emails, loading, fetchEmails, fetchLabelEmails, handleToggleStar, handleMoveToTrash, handleMarkRead, handleApplyLabel, labels, currentFolder, handleArchive, handleUnarchive, openCompose } = useMail();
  const [selectedEmailUid, setSelectedEmailUid] = useState(null);
  const selectedEmail = emails.find(
    (e) => String(e.uid) === String(selectedEmailUid) || `${e.uid}__${e.folderName || ''}` === String(selectedEmailUid)
  );

  const [selectedIds, setSelectedIds] = useState(new Set());
  const handleToggleSelect = (uid) => {
    const strUid = String(uid);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(strUid)) next.delete(strUid);
      else next.add(strUid);
      return next;
    });
  };

  useEffect(() => {
    setSelectedIds(new Set());
  }, [labelId]);

  const activeLabel = labels.find(l => l.id.toString() === labelId);

  const visibleEmails = emails.filter(
    (e) =>
      !searchQuery ||
      e.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.senderEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.recipientEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.textPlain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // UI-only filter dropdown states
  const [showTime, setShowTime] = useState(false);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  useEffect(() => {
    if (labelId) {
      fetchLabelEmails(labelId);
    } else {
      fetchEmails('all-mail');
    }
  }, [fetchEmails, fetchLabelEmails, labelId]);

  const handleSelectEmail = (email) => {
    if (email.folderName?.toLowerCase() === "drafts" || email.folderName?.toLowerCase() === "draft") {
      openCompose({ draft: email });
    } else {
      setSelectedEmailUid(`${email.uid}__${email.folderName || ''}`);
      if (!email.isRead) {
        handleMarkRead(email.uid);
      }
    }
  };

  
  const handleForward = (email) => {
    openCompose({
      forward: true,
      subject: email.subject?.startsWith("Fwd:") ? email.subject : `Fwd: ${email.subject || ""}`,
      originalBody: email.body,
      originalEmail: email,
    });
  };
const handleReply = (email) => {
    openCompose({
      replyTo: email.senderEmail || email.from,
      subject: `Re: ${email.subject || ""}`,
      originalBody: email.body,
    });
  };


  /* ---------------- MAIN UI ---------------- */
  
  const detailsComponent = selectedEmail ? (
<EmailDetails
      emailList={visibleEmails}
      onNavigate={(email) => setSelectedEmailUid(email.uid)}
          email={selectedEmail}
          onBack={() => setSelectedEmailUid(null)}
          onDelete={(uid) => {
            handleMoveToTrash(uid, currentFolder || "inbox");
            setSelectedEmailUid(null);
          }}
          onStar={(uid) => handleToggleStar(uid, currentFolder || "inbox")}
          onArchive={(uid) => {
            handleArchive(uid, currentFolder || "inbox");
            setSelectedEmailUid(null);
          }}
          onUnarchive={(uid) => {
            handleUnarchive(uid);
            setSelectedEmailUid(null);
          }}
          onReply={handleReply}
          onForward={handleForward}
          onApplyLabel={handleApplyLabel}
        />
  ) : null;

  const headerComponent = selectedIds.size > 0 ? (

            <BulkActionsToolbar
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              visibleEmails={visibleEmails}
              folder={labelId ? `label-${labelId}` : "all-mail"}
            />
          
  ) : (

            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-transparent">
              <div className="flex items-center gap-3">
                <span
                  className="px-4 py-1.5 text-xs font-bold rounded-full shadow-sm text-white tracking-wide flex items-center gap-1.5 uppercase select-none"
                  style={{ background: activeLabel ? activeLabel.colorHex : `linear-gradient(135deg, ${theme.accent || "#135bec"} 0%, #3b82f6 100%)` }}
                >
                  {activeLabel && <MdLabel size={14} />}
                  {activeLabel ? activeLabel.name : "All Mail"} ({emails.length})
                </span>

                <button
                  onClick={() => {
                    if (labelId) {
                      fetchLabelEmails(labelId);
                    } else {
                      fetchEmails("all-mail");
                    }
                  }}
                  disabled={loading}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 flex items-center justify-center cursor-pointer"
                  title="Refresh mail"
                >
                  <MdRefresh size={18} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              {/* RESTORED FILTERS */}
              <div className="flex items-center gap-2">
                <FilterButton label="From" open={showFrom} setOpen={setShowFrom} />
                <FilterButton label="To" open={showTo} setOpen={setShowTo} />
                <FilterButton label="Date" open={showTime} setOpen={setShowTime} />
              </div>
            </div>
          
  );

  const listComponent = (
    <div className="flex-1 flex flex-col overflow-hidden">
{emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] opacity-85">
                <MdMail className="text-5xl mb-4 text-gray-300 dark:text-gray-600 drop-shadow-sm" />
                <p className="text-base font-semibold text-gray-500 dark:text-gray-400">No emails found</p>
              </div>
            ) : (
              <EmailList
                emails={visibleEmails}
                selectedEmailId={selectedEmail?.uid}
                onSelectEmail={handleSelectEmail}
                onDelete={(uid, folder) => handleMoveToTrash(uid, folder || currentFolder || "inbox")}
                onStar={(uid, folder) => handleToggleStar(uid, folder || currentFolder || "inbox")}
                onArchive={(uid, folder) => handleArchive(uid, folder || currentFolder || "inbox")}
                onUnarchive={(uid, folder) => handleUnarchive(uid, folder || currentFolder || "inbox")}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
              />
            )}
    </div>
  );

  return (
    <ReadingPaneLayout
      mode={readingPaneMode || 'no_split'}
      hasSelection={!!selectedEmail}
      listComponent={listComponent}
      detailsComponent={detailsComponent}
      headerComponent={headerComponent}
    />
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

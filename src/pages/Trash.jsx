import React, { useEffect, useState } from "react";
import { useMail } from "../context/MailContext";
import { MdDelete } from "react-icons/md";
import EmailList from "../components/EmailList";
import EmailDetails from "../components/EmailDetails";
import { useTheme } from "../context/ThemeContext";
import { mailAPI } from "../services/api";
import toast from "react-hot-toast";

const Trash = () => {
  const { theme } = useTheme();
  const { emails, loading, fetchEmails } = useMail();
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    fetchEmails('trash');
  }, [fetchEmails]);

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
  };

  const handlePermanentDelete = async (uid) => {
    try {
      await mailAPI.permanentDelete(uid);
      toast.success("Permanently deleted");
      fetchEmails('trash');
      setSelectedEmail(null);
    } catch (error) {
      toast.error("Failed to delete permanently");
    }
  };

  const handleRestore = async (uid) => {
    try {
      await mailAPI.restore(uid);
      toast.success("Email restored");
      fetchEmails('trash');
      setSelectedEmail(null);
    } catch (error) {
      toast.error("Failed to restore email");
    }
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
          className="p-4 border-b flex justify-between items-center"
          style={{ borderColor: theme.border }}
        >
          <h2
            className="text-xl font-semibold flex items-center gap-2"
            style={{ color: theme.text }}
          >
            <MdDelete size={24} className="text-gray-500" /> Trash
            <span
              className="ml-2 text-sm font-normal"
              style={{ color: theme.subText }}
            >
              ({emails.length})
            </span>
          </h2>
        </div>

        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MdDelete size={64} className="text-gray-300 dark:text-gray-600 mb-4 opacity-50" />
            <p
              className="text-lg font-medium mb-1"
              style={{ color: theme.text }}
            >
              Trash is empty
            </p>
          </div>
        ) : (
          <EmailList
            emails={emails}
            selectedEmailId={selectedEmail?.uid}
            onSelectEmail={handleSelectEmail}
            onDelete={handlePermanentDelete}
          />
        )}
      </div>

      {/* RIGHT — DETAILS */}
      <div
        className={`flex-1 transition-all duration-300 ${selectedEmail ? 'block' : 'hidden md:block'}`}
        style={{ backgroundColor: theme.bg }}
      >
        {selectedEmail && (
          <div className="h-full flex flex-col">
             <div className="p-4 border-b flex gap-4" style={{ borderColor: theme.border }}>
                <button 
                  onClick={() => handleRestore(selectedEmail.uid)}
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Restore
                </button>
                <button 
                  onClick={() => handlePermanentDelete(selectedEmail.uid)}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Delete Permanently
                </button>
             </div>
             <div className="flex-1 overflow-hidden">
                <EmailDetails
                  email={selectedEmail}
                  onBack={() => setSelectedEmail(null)}
                />
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trash;

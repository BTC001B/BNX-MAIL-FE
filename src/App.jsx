import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { api, mailAPI } from "./services/api";

/* Layout */
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";

/* Pages */
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateMailbox from "./pages/CreateMailbox";
import Inbox from "./pages/Inbox";
import Starred from "./pages/Starred";
import Draft from "./pages/Draft";
import Send from "./pages/Send";
import Outbox from "./pages/Outbox";
import Spam from "./pages/Spam";
import Trash from "./pages/Trash";
import AllMail from "./pages/AllMail";
import Archive from "./pages/Archive";
import ComposePage from "./pages/ComposePage";
import Settings from "./pages/Settings";
import Groups from "./pages/Groups";
import GroupDetails from "./pages/GroupDetails";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import VerifyDomain from "./pages/VerifyDomain";



/* ---------------- PROTECTED ROUTE ---------------- */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/* ---------------- APP CONTENT (MAIN LAYOUT) ---------------- */
const AppContent = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  /* -------- STATE -------- */
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  /* -------- FETCH INBOX -------- */
  useEffect(() => {
    if (!user) return;

    const fetchInbox = async () => {
      try {
        setLoading(true);

        const res = await mailAPI.getInbox();
        console.log("nandhan", res.data.data);

        // Handle various structures: { emails: [...] } or just [...]
        let mails = [];
        const data = res.data?.data;
        if (data?.emails && Array.isArray(data.emails)) {
          mails = data.emails;
        } else if (Array.isArray(data)) {
          mails = data;
        }

        // Load starred IDs from localStorage for this user
        const storedStarredIds = JSON.parse(localStorage.getItem(`starred_emails_${user?.email}`) || '[]');

        const normalized = mails.map((mail, index) => {
          // Ensure stable IDs across reloads by checking _id, uid, id, or falling back to a deterministic string
          const rawId = mail._id || mail.uid || mail.id || `mail-${mail.receivedDate || mail.date}-${index}`;
          const uid = String(rawId);
          return {
            uid,
            from: mail.from || "Unknown",
            senderEmail: mail.from, // Used for reply
            to: mail.to || "",
            subject: mail.subject || "(No subject)",
            body: mail.bodyPreview || mail.body || mail.textBody || "",
            htmlBody: mail.htmlBody || null,
            folder: mail.folder || "inbox",
            isRead: mail.isRead ?? mail.seen ?? true,
            starred: storedStarredIds.includes(uid) || (mail.starred ?? false),
            receivedDate: mail.receivedDate || mail.date || new Date().toISOString(),
            attachments: mail.attachments || [],
          };
        });
        console.log("nandhan", normalized);
        setEmails(normalized);
        setError("");
      } catch (err) {
        // toast.error("Failed to load inbox");
        console.error(err);
        setError("Failed to load inbox");
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, [user]);

  /* -------- SEND -------- */
  const handleSendEmail = async (to, subject, body) => {
    try {
      // Use mailAPI.send instead of api.sendMail
      await mailAPI.send({ to, subject, body });

      setEmails((prev) => [
        {
          uid: Date.now().toString(),
          from: user.username,
          senderEmail: user.email,
          subject,
          body,
          folder: "sent",
          isRead: true,
          starred: false,
          receivedDate: new Date().toISOString(),
        },
        ...prev,
      ]);

      toast.success("Email sent");
      return true;
    } catch {
      toast.error("Failed to send email");
      return false;
    }
  };

  /* -------- SAVE DRAFT -------- */
  const handleSaveDraft = useCallback(
    (draft) => {
      setEmails((prev) => [
        {
          uid: Date.now().toString(),
          from: user.username,
          senderEmail: user.email,
          folder: "drafts",
          isRead: true,
          starred: false,
          ...draft,
        },
        ...prev,
      ]);
      toast.success("Draft saved");
    },
    [user]
  );

  /* -------- DELETE → TRASH -------- */
  const handleDelete = (uid) => {
    setEmails((prev) =>
      prev.map((m) => (m.uid === uid ? { ...m, folder: "trash" } : m))
    );
  };

  /* -------- ARCHIVE TOGGLE -------- */
  const handleArchive = (uid) => {
    setEmails((prev) =>
      prev.map((m) =>
        m.uid === uid
          ? { ...m, folder: m.folder === "archive" ? "inbox" : "archive" }
          : m
      )
    );
  };

  /* -------- STAR TOGGLE -------- */
  const handleStar = (uid) => {
    setEmails((prev) => {
      const newEmails = prev.map((m) => (m.uid === uid ? { ...m, starred: !m.starred } : m));

      if (user?.email) {
        const storageKey = `starred_emails_${user.email}`;
        let starredIds = JSON.parse(localStorage.getItem(storageKey) || '[]');

        const mail = newEmails.find((m) => m.uid === uid);
        if (mail) {
          if (mail.starred && !starredIds.includes(uid)) {
            starredIds.push(uid);
          } else if (!mail.starred) {
            starredIds = starredIds.filter(id => id !== uid);
          }
          localStorage.setItem(storageKey, JSON.stringify(starredIds));
        }
      }

      return newEmails;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <SideBar
        isDesktopOpen={isDesktopSidebarOpen}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <NavBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleDesktopSidebar={() =>
            setIsDesktopSidebarOpen((v) => !v)
          }
          onOpenMenu={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Inbox emails={emails} searchQuery={searchQuery} onDelete={handleDelete} onStar={handleStar} onArchive={handleArchive} />} />
            <Route path="/inbox" element={<AllMail emails={emails} searchQuery={searchQuery} onDelete={handleDelete} onStar={handleStar} onArchive={handleArchive} />} />
            <Route path="/starred" element={<Starred emails={emails} onDelete={handleDelete} onStar={handleStar} onArchive={handleArchive} />} />
            <Route path="/drafts" element={<Draft emails={emails} onDelete={handleDelete} />} />
            <Route path="/sent" element={<Send emails={emails} onDelete={handleDelete} />} />
            <Route path="/outbox" element={<Outbox emails={emails} onDelete={handleDelete} />} />
            <Route path="/spam" element={<Spam emails={emails} onDelete={handleDelete} />} />
            <Route path="/trash" element={<Trash emails={emails} onDelete={handleDelete} />} />
            <Route path="/archive" element={<Archive emails={emails} onDelete={handleDelete} onArchive={handleArchive} />} />
            <Route path="/all-mail" element={<AllMail emails={emails} onDelete={handleDelete} onStar={handleStar} onArchive={handleArchive} />} />
            <Route path="/compose" element={<ComposePage onSend={handleSendEmail} onSaveDraft={handleSaveDraft} />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:id" element={<GroupDetails />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

/* ---------------- ROOT APP ---------------- */
const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-mailbox" element={<CreateMailbox />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/verify-domain" element={<VerifyDomain />} />


          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  </ThemeProvider>
);

export default App;

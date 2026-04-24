import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { MailProvider } from "./context/MailContext";
import { SocketProvider } from "./context/SocketContext";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
            <Route path="/" element={<Inbox searchQuery={searchQuery} />} />
            <Route path="/inbox" element={<AllMail searchQuery={searchQuery} />} />
            <Route path="/starred" element={<Starred />} />
            <Route path="/drafts" element={<Draft />} />
            <Route path="/sent" element={<Send />} />
            <Route path="/outbox" element={<Outbox />} />
            <Route path="/spam" element={<Spam />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/all-mail" element={<AllMail />} />
            <Route path="/compose" element={<ComposePage />} />
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
      <MailProvider>
        <SocketProvider>
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
        </SocketProvider>
      </MailProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import toast, { Toaster, ToastBar } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { MailProvider } from "./context/MailContext";
import { SocketProvider } from "./context/SocketContext";

/* Layout */
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import FloatingCompose from "./components/FloatingCompose";
import BitToolSidebar from "./components/BitToolSidebar";

/* Pages */
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import CreateMailbox from "./pages/CreateMailbox";
import Inbox from "./pages/Inbox";
import Starred from "./pages/Starred";
import Draft from "./pages/Draft";
import Send from "./pages/Send";
import Outbox from "./pages/Outbox";
import Scheduled from "./pages/Scheduled";
import Spam from "./pages/Spam";
import Trash from "./pages/Trash";
import AllMail from "./pages/AllMail";
import Archive from "./pages/Archive";
import Settings from "./pages/Settings";
import Groups from "./pages/Groups";
import ChatRoom from "./pages/ChatRoom";
import GroupDetails from "./pages/GroupDetails";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import VerifyDomain from "./pages/VerifyDomain";
import Templates from "./pages/Templates";
import Snoozed from "./pages/Snoozed";
import Subscriptions from "./pages/Subscriptions";


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

const getFriendlyMessage = (msg) => {
  if (!msg || typeof msg !== "string") return msg;
  const msgLower = msg.toLowerCase();
  
  if (msgLower.includes("unauthorized") || msgLower.includes("session expired") || msgLower.includes("token expired")) {
    return "Session expired. Please login again.";
  }
  if (msgLower.includes("network error") || msgLower.includes("failed to fetch") || msgLower.includes("networkerror")) {
    return "Connection issue. Please check your internet connection.";
  }
  if (msgLower.includes("internal server error") || msgLower.includes("500") || msgLower.includes("server error")) {
    return "Something went wrong on our end. Please try again later.";
  }
  if (msgLower.includes("bad credentials") || msgLower.includes("invalid credentials") || msgLower.includes("incorrect password")) {
    return "Incorrect email address or password.";
  }
  if (msgLower.includes("required request header") || msgLower.includes("missing auth")) {
    return "Authentication failed. Try logging out and back in.";
  }
  if (msgLower.includes("exceeds 5mb limit") || msgLower.includes("large file")) {
    return "File is too large. Size limit is 5MB.";
  }
  if (msgLower.includes("failed to add members") || msgLower.includes("members could not be added")) {
    return "Could not add members. Please check the email addresses.";
  }
  if (msgLower.includes("failed to load message history")) {
    return "Could not load messages. Please refresh.";
  }
  if (msgLower.includes("subject and body are required")) {
    return "Please enter a subject and body before sending.";
  }
  
  return msg;
};

/* ---------------- APP CONTENT (MAIN LAYOUT) ---------------- */
const AppContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isBitToolSidebarOpen, setIsBitToolSidebarOpen] = useState(false);
  const { theme, backgroundImage } = useTheme();

  const rootStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }
    : { backgroundColor: theme.bg };

  return (
    <div className="flex flex-col h-screen overflow-hidden relative" style={rootStyle}>
      {/* Semi-transparent overlay when a background image is active */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 pointer-events-none z-0" 
          style={{ backgroundColor: theme.mode === "dark" ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.35)" }}
        />
      )}
      <div className="relative z-[1] flex flex-col flex-1 overflow-hidden">
      <NavBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onToggleDesktopSidebar={() =>
          setIsDesktopSidebarOpen((v) => !v)
        }
        onOpenMenu={() => setIsMobileSidebarOpen(true)}
        onToggleBitToolSidebar={() => setIsBitToolSidebarOpen(v => !v)}
      />

      <div className="flex-1 flex overflow-hidden relative">
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

        <main
          className="flex-1 overflow-hidden mr-3 mb-3 mt-1 rounded-2xl border flex flex-col shadow-sm transition-all duration-300"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
          }}
        >
          <Routes>
            <Route path="/" element={<Inbox searchQuery={searchQuery} />} />
            <Route path="/inbox" element={<Inbox searchQuery={searchQuery} />} />
            <Route path="/starred" element={<Starred searchQuery={searchQuery} />} />
            <Route path="/snoozed" element={<Snoozed searchQuery={searchQuery} />} />
            <Route path="/draft" element={<Draft searchQuery={searchQuery} />} />
            <Route path="/sent" element={<Send searchQuery={searchQuery} />} />
            <Route path="/outbox" element={<Outbox searchQuery={searchQuery} />} />
            <Route path="/scheduled" element={<Scheduled searchQuery={searchQuery} />} />
            <Route path="/spam" element={<Spam searchQuery={searchQuery} />} />
            <Route path="/trash" element={<Trash searchQuery={searchQuery} />} />
            <Route path="/archive" element={<Archive searchQuery={searchQuery} />} />
            <Route path="/all-mail" element={<AllMail searchQuery={searchQuery} />} />
            <Route path="/allmail" element={<AllMail searchQuery={searchQuery} />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/colab" element={<Groups />} />
            <Route path="/colab/:id" element={<GroupDetails />} />
            <Route path="/chat" element={<Groups />} />
            <Route path="/chat/:chatId" element={<ChatRoom />} />
            <Route path="/label/:labelId" element={<AllMail searchQuery={searchQuery} />} />
            <Route path="/subscriptions" element={<Subscriptions searchQuery={searchQuery} />} />
          </Routes>
        </main>

        <BitToolSidebar isOpen={isBitToolSidebarOpen} onClose={() => setIsBitToolSidebarOpen(false)} />
      </div>
      </div>
      <FloatingCompose />
      <Toaster 
        position="bottom-center"
        toastOptions={{
          className: "custom-toast",
        }}
      >
        {(t) => {
          let displayMessage = t.message;
          if (typeof displayMessage === 'string') {
            displayMessage = getFriendlyMessage(displayMessage);
          }
          return (
            <ToastBar toast={{ ...t, message: displayMessage }}>
              {({ icon, message }) => (
                <>
                  {icon}
                  {message}
                  {t.type !== 'loading' && (
                    <button 
                      onClick={() => toast.dismiss(t.id)} 
                      className="ml-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 text-xs font-semibold leading-none cursor-pointer p-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                    >
                      ✕
                    </button>
                  )}
                </>
              )}
            </ToastBar>
          );
        }}
      </Toaster>
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
              <Route path="/forgot-password" element={<ForgotPassword />} />
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

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useMail } from "../context/MailContext";
import { MdSettings, MdEmail, MdLogout, MdLightMode, MdDarkMode, MdNotifications, MdCheckCircle, MdManageAccounts, MdPersonAdd, MdPhotoCamera, MdMenu, MdAdd } from "react-icons/md";
import { userAPI } from "../services/api";
import toast from "react-hot-toast";
// import logo from "../assets/bnx.jpeg";

import logo from "../assets/bnx-remove.png";
import bitToolLogo from "../assets/BIT-TOOL-2.png";

const NavBar = ({ searchQuery, setSearchQuery, onOpenMenu, onToggleDesktopSidebar, onToggleBitToolSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, logoutAll, switchAccount, getSessions } = useAuth();
  const { theme, currentThemeName, changeTheme, backgroundImage } = useTheme();
  const { openCompose } = useMail();
  const isPrimary = user?.isPrimary || user?.mailboxes?.find(m => m.email === user.email)?.isPrimary;
  
  const currentTab = location.pathname.startsWith('/colab') || location.pathname.startsWith('/chat') || location.pathname.startsWith('/casbox') ? 'chat' 
                   : location.pathname.startsWith('/vault') ? 'vault' 
                   : 'mail';

  const allSessions = getSessions();
  const otherSessions = allSessions.filter(sess => sess.email !== user?.email);


  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile picture must be under 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingAvatar(true);
      const res = await userAPI.updateProfilePicture(formData);
      if (res.data?.success) {
        toast.success("Profile picture updated!");
        
        // Update user session data in localStorage so the reload picks it up
        const newUrl = res.data.data?.profilePictureUrl;
        if (newUrl && user) {
          const updatedUser = { ...user, profilePictureUrl: newUrl };
          
          // Update active profile
          localStorage.setItem('userProfile', JSON.stringify(updatedUser));
          
          // Update in sessions list
          try {
            const sessionsStr = localStorage.getItem('bnx_sessions');
            if (sessionsStr) {
              const sessions = JSON.parse(sessionsStr);
              if (user.email && sessions[user.email]) {
                sessions[user.email].userProfile = updatedUser;
                localStorage.setItem('bnx_sessions', JSON.stringify(sessions));
              }
            }
          } catch (e) {
            console.error("Failed to update sessions storage", e);
          }
        }
        
        if (typeof switchAccount === "function") {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile picture");
      console.error("Profile picture upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload picture", { id: toastId });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleThemeToggle = () => {
    changeTheme(currentThemeName === "Dark" ? "Classic" : "Dark");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching:", searchQuery);
  };

  return (
    <nav
      className="sticky top-0 z-50 px-6 py-2.5 transition-colors duration-300 shrink-0 shadow-md"
      style={{ backgroundColor: backgroundImage ? "transparent" : "#99C2FF" }}
    >
      <div className="flex items-center justify-between w-full relative">
        {/* LEFT */}
        <div className="flex items-center gap-2 sm:gap-12 shrink-0">
          <div className="flex items-center gap-1.5">
            <img
              src={logo}
              alt="BNX Mail"
              className="h-10 cursor-pointer drop-shadow-sm transition-transform hover:scale-105"
              onClick={() => onToggleDesktopSidebar()}
            />
            <span
              onClick={() => onToggleDesktopSidebar()}
              className="hidden sm:block text-xl font-bold tracking-tight cursor-pointer hover:opacity-90 transition-opacity"
              style={{ color: "#1e3a8a" }}
            >
              BNX<span style={{ color: "#1e3a8a", fontWeight: "normal" }}>mail</span>
            </span>
          </div>

          {/* COMPOSE */}
          <button
            onClick={() => openCompose()}
            className="flex items-center gap-2.5 px-3 sm:px-5 py-2 rounded-full font-semibold shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] bg-white dark:bg-[#303134] border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-200 ml-1 sm:ml-12"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.accent || "#135bec" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="hidden sm:inline text-[14px]">Compose</span>
          </button>
        </div>

        {/* CENTER: SEGMENTED CONTROL */}
        <div className="flex md:absolute md:left-1/2 md:-translate-x-1/2 items-center bg-black/10 rounded-full p-1 border border-black/5 mx-auto md:mx-0 shrink-0">
          <button 
            onClick={() => navigate('/inbox')}
            className={`px-4 sm:px-6 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${currentTab === 'mail' ? 'bg-white text-gray-900 shadow-sm' : 'text-blue-900/60 hover:text-blue-900'}`} 
          >
            Mail
          </button>
          <button 
            onClick={() => navigate('/vault')}
            className={`px-4 sm:px-6 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${currentTab === 'vault' ? 'bg-white text-gray-900 shadow-sm' : 'text-blue-900/60 hover:text-blue-900'}`}
          >
            Vault
          </button>
          <button 
            onClick={() => navigate('/chat')}
            className={`px-4 sm:px-6 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${currentTab === 'chat' ? 'bg-white text-gray-900 shadow-sm' : 'text-blue-900/60 hover:text-blue-900'}`}
          >
            Chat
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1">

          {/* SEARCH */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-[260px] mr-2">
            <div className="relative group w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 pl-10 rounded-full text-[13px] placeholder:text-blue-900/50 bg-black/10 focus:bg-white focus:text-gray-900 text-blue-900 focus:shadow-sm border border-transparent focus:border-gray-200 outline-none transition-all duration-200"
              />
              <svg
                className="absolute left-3.5 top-2.5 h-4 w-4 transition-colors text-blue-900/60 group-focus-within:text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* USER */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              {user?.profilePictureUrl ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || "https://api.bnxmail.com"}${user.profilePictureUrl}`}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover shadow-sm border border-white dark:border-gray-700 shrink-0"
                />
              ) : (
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold shadow-sm shrink-0 text-sm"
                  style={{ backgroundColor: theme.accent || "#135bec" }}
                >
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div className="hidden md:flex items-center gap-1.5">
                <span
                  className="text-[13px] font-medium truncate max-w-[100px] text-blue-900"
                >
                  {user?.email?.split('@')[0] || "User"}
                </span>
                {isPrimary && (
                  <MdCheckCircle className="text-green-500 shrink-0" size={13} title="Primary Account" />
                )}
              </div>
              <svg
                className="h-3.5 w-3.5 hidden md:block opacity-60 text-blue-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 mt-3 w-[310px] rounded-2xl shadow-xl dark:shadow-soft-dark border z-50 overflow-hidden animate-fade-in bg-white dark:bg-gray-900"
                style={{ borderColor: theme.border }}
              >
                {/* Active User Large Header */}
                <div className="flex flex-col items-center px-5 py-5 border-b text-center relative" style={{ borderColor: theme.border }}>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/jpeg, image/png, image/webp" 
                    onChange={handleProfilePictureUpload} 
                  />
                  
                  <div className="relative inline-block group cursor-pointer mb-2.5" onClick={() => fileInputRef.current?.click()}>
                    {user?.profilePictureUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL || "https://api.bnxmail.com"}${user.profilePictureUrl}`}
                        alt={user?.username}
                        className={`w-16 h-16 rounded-full object-cover border-2 border-primary/20 ${uploadingAvatar ? 'opacity-50' : 'group-hover:opacity-80 transition-opacity'}`}
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-sm ${uploadingAvatar ? 'opacity-50' : 'group-hover:opacity-90 transition-opacity'}`} style={{ backgroundColor: theme.accent || "#135bec" }}>
                        {(user?.username || user?.email || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MdPhotoCamera size={24} className="text-white" />
                    </div>

                    {/* Mini Camera Badge always visible */}
                    <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
                      <MdPhotoCamera size={14} />
                    </div>
                  </div>

                  <p className="text-base font-bold text-gray-800 dark:text-gray-100 leading-tight">
                    {user?.username || "User"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate max-w-full">
                    {user?.email}
                  </p>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      const token = localStorage.getItem("accessToken") || "";
                      window.open(`https://account.beta-softnet.com/security?token=${encodeURIComponent(token)}`, "_blank");
                    }}
                    className="mt-3 px-3.5 py-1.5 border rounded-full text-[11px] font-bold hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all cursor-pointer flex items-center gap-1.5"
                    style={{ borderColor: theme.border, color: theme.text }}
                  >
                    <MdManageAccounts size={15} /> Manage your account
                  </button>
                </div>

                {/* Other Accounts List */}
                {otherSessions.length > 0 && (
                  <div className="max-h-[150px] overflow-y-auto border-b" style={{ borderColor: theme.border }}>
                    {otherSessions.map((sess) => (
                      <div
                        key={sess.email}
                        onClick={() => {
                          setShowDropdown(false);
                          switchAccount(sess.email);
                        }}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all border-b last:border-b-0 dark:border-gray-800/30"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {sess.profilePictureUrl ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL || "https://api.bnxmail.com"}${sess.profilePictureUrl}`}
                              alt={sess.username}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0" style={{ backgroundColor: theme.accent || "#135bec" }}>
                              {(sess.username || sess.email || "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="truncate text-left">
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight truncate">
                              {sess.username}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                              {sess.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="p-1">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      localStorage.removeItem("tempToken");
                      navigate("/login");
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-3 font-semibold text-gray-600 dark:text-gray-300"
                  >
                    <MdPersonAdd size={18} className="text-gray-400" /> Add another account
                  </button>

                  {/* <button
                    onClick={() => { setShowDropdown(false); navigate("/settings"); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-3 font-semibold text-gray-600 dark:text-gray-300"
                  >
                    <MdSettings size={18} className="text-gray-400" /> Settings
                  </button> */}

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-3 font-semibold text-gray-600 dark:text-gray-300"
                  >
                    <MdLogout size={18} className="text-gray-400" /> Sign out of this account
                  </button>
                </div>

                <div className="border-t p-1" style={{ borderColor: theme.border }}>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logoutAll();
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-3 font-bold"
                  >
                    <MdLogout size={18} className="text-red-400" /> Sign out of all accounts
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />

          <button
            onClick={onToggleBitToolSidebar}
            className="h-9 px-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center shrink-0 ml-1 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            title="Toggle BIT Tools"
          >
            <img
              src={bitToolLogo}
              alt="BIT Tool"
              className="h-5 object-contain opacity-80 group-hover:opacity-100"
            />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

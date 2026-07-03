import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { MdSettings, MdEmail, MdLogout, MdLightMode, MdDarkMode, MdNotifications, MdCheckCircle, MdManageAccounts, MdPersonAdd } from "react-icons/md";
// import logo from "../assets/bnx.jpeg";

import logo from "../assets/bnx-remove.png";
import bitToolLogo from "../assets/BIT-TOOL-2.png";

const NavBar = ({ searchQuery, setSearchQuery, onOpenMenu, onToggleDesktopSidebar, onToggleBitToolSidebar }) => {
  const navigate = useNavigate();
  const { user, logout, logoutAll, switchAccount, getSessions } = useAuth();
  const { theme, currentThemeName, changeTheme, backgroundImage } = useTheme();
  const isPrimary = user?.isPrimary || user?.mailboxes?.find(m => m.email === user.email)?.isPrimary;

  const allSessions = getSessions();
  const otherSessions = allSessions.filter(sess => sess.email !== user?.email);


  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
      className="sticky top-0 z-50 px-6 py-2.5 transition-colors duration-300 shrink-0"
      style={{ backgroundColor: backgroundImage ? "transparent" : theme.bg }}
    >
      <div className="flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center flex-1">
          <div className="w-[200px] shrink-0 flex items-center gap-2.5">
            <img
              src={logo}
              alt="BNX Mail"
              className="h-10 cursor-pointer drop-shadow-sm transition-transform hover:scale-105"
              onClick={() => navigate("/inbox")}
            />
            <span
              onClick={() => navigate("/inbox")}
              className="text-xl font-bold tracking-tight cursor-pointer hover:opacity-90 transition-opacity"
              style={{ color: "#135bec" }}
            >
              BNX<span style={{ color: theme.text }}>mail</span>
            </span>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-3xl hidden md:block">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mail"
                className="w-full px-5 py-2.5 pl-12 pr-12 rounded-full text-[14px] placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-[#eaf1fb] dark:bg-white/[0.09] focus:bg-white dark:focus:bg-[#303134] focus:shadow-md border border-transparent outline-none transition-all duration-200"
                style={{ color: theme.text }}
              />
              <svg
                className="absolute left-4 top-3.5 h-4 w-4 transition-colors text-gray-500 dark:text-gray-400 group-focus-within:text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* THEME TOGGLE */}
          {/* <button
            onClick={handleThemeToggle}
            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors tooltip-trigger flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            title="Toggle theme"
          >
            {currentThemeName === "Dark" ? <MdLightMode size={22} className="text-yellow-400" /> : <MdDarkMode size={22} className="text-blue-600" />}
          </button> */}

          {/* NOTIFICATION */}
          {/* <button className="p-2.5 rounded-full relative hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 flex items-center justify-center">
            <MdNotifications size={24} />
            <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
          </button> */}

          {/* USER */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              {user?.profilePictureUrl ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || "https://api.bnxmail.com"}${user.profilePictureUrl}`}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover shadow-sm border border-white dark:border-gray-700 shrink-0"
                />
              ) : (
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold shadow-sm shrink-0"
                  style={{ backgroundColor: theme.accent || "#135bec" }}
                >
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div className="hidden md:flex items-center gap-1.5">
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.text }}
                >
                  {user?.email || "User"}
                </span>
                {isPrimary && (
                  <MdCheckCircle className="text-green-500 shrink-0" size={14} title="Primary Account" />
                )}
              </div>
              <svg
                className="h-4 w-4 hidden md:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: theme.subText }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 mt-3 w-[310px] rounded-2xl shadow-xl dark:shadow-soft-dark border z-50 overflow-hidden animate-fade-in bg-white dark:bg-gray-900"
                style={{ borderColor: theme.border }}
              >
                {/* Active User Large Header */}
                <div className="flex flex-col items-center px-5 py-5 border-b text-center" style={{ borderColor: theme.border }}>
                  {user?.profilePictureUrl ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || "https://api.bnxmail.com"}${user.profilePictureUrl}`}
                      alt={user?.username}
                      className="w-14 h-14 rounded-full object-cover mb-2.5 border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2.5 shadow-sm" style={{ backgroundColor: theme.accent || "#135bec" }}>
                      {(user?.username || user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-full">
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

                  <button
                    onClick={() => { setShowDropdown(false); navigate("/settings"); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-3 font-semibold text-gray-600 dark:text-gray-300"
                  >
                    <MdSettings size={18} className="text-gray-400" /> Settings
                  </button>

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
            className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center shrink-0 ml-2"
            title="Toggle BIT Tools"
          >
            <img
              src={bitToolLogo}
              alt="BIT Tool"
              className="h-8 object-contain"
            />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

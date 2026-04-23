import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { MdSettings, MdEmail, MdLogout, MdLightMode, MdDarkMode, MdNotifications } from "react-icons/md";
// import logo from "../assets/bnx.jpeg";

import logo from "../assets/bnx-remove.png";

const NavBar = ({ searchQuery, setSearchQuery, onOpenMenu, onToggleDesktopSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, currentThemeName, changeTheme } = useTheme();

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
    <nav className="sticky top-0 z-50 px-4 py-3 glass border-b-0 backdrop-blur-xl bg-white/70 dark:bg-surface-dark/80 transition-colors duration-300">
      <div className="flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1">
          <button
            onClick={onOpenMenu}
            className="md:hidden p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <img
            src={logo}
            alt="BNX Mail"
            className="h-8 sm:h-9 cursor-pointer drop-shadow-sm transition-transform hover:scale-105"
            onClick={() => navigate("/inbox")}
          />

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mail..."
                className="w-full px-5 py-2.5 pl-11 rounded-full glass-input text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                style={{ color: theme.text }}
              />
              <svg
                className="absolute left-4 top-3 h-4 w-4 transition-colors group-focus-within:text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: theme.subText }}
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
          <button
            onClick={handleThemeToggle}
            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors tooltip-trigger flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            title="Toggle theme"
          >
            {currentThemeName === "Dark" ? <MdLightMode size={22} className="text-yellow-400" /> : <MdDarkMode size={22} className="text-blue-600" />}
          </button>

          {/* NOTIFICATION */}
          <button className="p-2.5 rounded-full relative hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 flex items-center justify-center">
            <MdNotifications size={24} />
            <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
          </button>

          {/* USER */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold shadow-sm"
                style={{ backgroundColor: theme.accent || "#135bec" }}
              >
                {user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <span
                className="text-sm font-medium hidden md:block"
                style={{ color: theme.text }}
              >
                {user?.email || "User"}
              </span>
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
                className="absolute right-0 mt-3 w-64 rounded-2xl shadow-xl dark:shadow-soft-dark border z-50 overflow-hidden animate-fade-in bg-white dark:bg-gray-900"
                style={{ borderColor: theme.border }}
              >
                <div className="px-5 py-4 border-b bg-white/50 dark:bg-gray-900/50" style={{ borderColor: theme.border }}>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: theme.text }}>
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs truncate" style={{ color: theme.subText }}>
                    {user?.email}
                  </p>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => { setShowDropdown(false); navigate("/settings"); }}
                    className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors flex items-center gap-3"
                    style={{ color: theme.text }}
                  >
                    <MdSettings size={20} className="text-gray-500" /> Settings
                  </button>

                  <button
                    onClick={() => { setShowDropdown(false); navigate("/settings/emails"); }}
                    className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors flex items-center gap-3"
                    style={{ color: theme.text }}
                  >
                    <MdEmail size={20} className="text-gray-500" /> Manage Emails
                  </button>
                </div>

                <div className="border-t p-2" style={{ borderColor: theme.border }}>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-sm rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3 font-medium"
                  >
                    <MdLogout size={20} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

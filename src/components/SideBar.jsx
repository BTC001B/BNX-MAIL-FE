import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SIDEBAR_ITEMS } from "../Data/constants";
import { useTheme } from "../context/ThemeContext";
import { useMail } from "../context/MailContext";
import { MdLabel } from "react-icons/md";

const SideBar = ({ isDesktopOpen, isMobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { unreadCounts, labels } = useMail();

  return (
    <aside
      className={`
        w-64 h-full overflow-y-auto glass flex-col transition-transform duration-300 border-r border-gray-200/60 dark:border-gray-800/60
        ${isMobileOpen ? 'fixed inset-y-0 left-0 z-[60] flex translate-x-0' : 'hidden -translate-x-full'}
        ${isDesktopOpen ? 'md:flex md:relative md:translate-x-0' : 'md:hidden'}
      `}
    >
      {/* COMPOSE */}
      <div className="p-5 pb-2">
        <button
          onClick={() => navigate("/compose")}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(135deg, ${theme.accent || '#135bec'} 0%, #3b82f6 100%)`,
            color: "#ffffff",
          }}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Compose
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/inbox');
          const count = unreadCounts[item.name.toLowerCase()] || 0;

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 group
                ${isActive ? 'bg-primary/10 dark:bg-primary/20 scale-100 shadow-sm' : 'hover:bg-gray-100/60 dark:hover:bg-gray-800/40 hover:translate-x-1'}
              `}
              style={{
                color: isActive ? (theme.accent || '#135bec') : theme.sidebarText,
                fontWeight: isActive ? 600 : 500,
              }}
            >
              <div className="flex items-center gap-4">
                <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="text-sm tracking-wide">{item.name}</span>
              </div>

              {count > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full shadow-sm" style={{ backgroundColor: theme.accent || '#135bec', color: "#fff" }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* CUSTOM LABELS */}
        {labels.length > 0 && (
          <div className="mt-6">
            <h3 className="px-4 text-xs font-bold uppercase tracking-widest mb-2 opacity-50" style={{ color: theme.sidebarText }}>Labels</h3>
            {labels.map(label => (
              <button
                key={label.id}
                onClick={() => navigate(`/label/${label.id}`)}
                className="w-full flex items-center gap-4 px-4 py-2 rounded-xl hover:bg-gray-100/60 transition-all"
                style={{ color: theme.sidebarText }}
              >
                <MdLabel style={{ color: label.colorHex }} size={18} />
                <span className="text-sm">{label.name}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* STORAGE */}
      {/* <div className="p-4 mt-auto">
        <div className="rounded-xl p-4 glass-input dark:bg-gray-800/50">
          <div className="flex justify-between mb-3 items-center">
            <span className="text-xs font-semibold" style={{ color: theme.subText }}>STORAGE</span>
            <span className="text-xs font-bold text-primary">2.5 GB / 15 GB</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: "16.6%", background: `linear-gradient(90deg, ${theme.accent || '#135bec'}, #60a5fa)` }}>
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div> */}
    </aside>
  );
};

export default SideBar;

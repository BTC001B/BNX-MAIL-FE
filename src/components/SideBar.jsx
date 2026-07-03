import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SIDEBAR_ITEMS } from "../Data/constants";
import { useTheme } from "../context/ThemeContext";
import { useMail } from "../context/MailContext";
import { MdLabel, MdAdd, MdClose, MdCheck, MdDelete, MdExpandMore, MdExpandLess, MdHelpOutline, MdContactSupport, MdSettings, MdMoreVert, MdEdit } from "react-icons/md";

const SideBar = ({ isDesktopOpen, isMobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, backgroundImage } = useTheme();
  const { unreadCounts, labels, handleCreateLabel, handleUpdateLabel, handleDeleteLabel, openCompose } = useMail();

  const [isCreating, setIsCreating] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [activeLabelMenu, setActiveLabelMenu] = useState(null);
  const [newLabel, setNewLabel] = useState({ name: "", color: "#135bec", parentId: "" });
  const [editingLabel, setEditingLabel] = useState(null);

  const COLORS = ["#135bec", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"];

  const handleAddLabel = async () => {
    if (!newLabel.name.trim()) return;
    const parentId = newLabel.parentId ? parseInt(newLabel.parentId) : null;
    const success = await handleCreateLabel(newLabel.name, newLabel.color, parentId);
    if (success) {
      setIsCreating(false);
      setNewLabel({ name: "", color: "#135bec", parentId: "" });
    }
  };

  const handleEditLabelSubmit = async () => {
    if (!editingLabel.name.trim()) return;
    const parentId = editingLabel.parentId ? parseInt(editingLabel.parentId) : null;
    const success = await handleUpdateLabel(editingLabel.id, editingLabel.name, editingLabel.color, parentId);
    if (success) {
      setEditingLabel(null);
    }
  };

  return (
    <>
      <aside
        className={`
        w-56 h-full overflow-y-auto flex flex-col transition-transform duration-300 shrink-0 border-r-0
        ${isMobileOpen ? "fixed inset-y-0 left-0 z-[60] flex translate-x-0 bg-white dark:bg-gray-900 shadow-xl" : "hidden -translate-x-full"}
        ${isDesktopOpen ? "md:flex md:relative md:translate-x-0" : "md:hidden"}
      `}
        style={{ backgroundColor: isMobileOpen ? undefined : (backgroundImage ? "transparent" : theme.bg) }}
      >
        {/* COMPOSE */}
        <div className="p-3 pl-3.5 pb-2">
          <button
            onClick={() => openCompose()}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] cursor-pointer bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.accent || "#135bec" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="text-[14px] font-medium" style={{ color: theme.text }}>Compose</span>
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 pr-0 py-2 space-y-0 overflow-y-auto">
          {/* TOP ITEMS */}
          {["Inbox", "Starred", "Snoozed", "Sent", "Draft", "Trash"]
            .map(name => SIDEBAR_ITEMS.find(item => item.name === name))
            .filter(Boolean)
            .map((item) => {
              const isActive = location.pathname === item.path || (location.pathname === "/" && item.path === "/inbox");
              const count = unreadCounts[item.name.toLowerCase()] || 0;

              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-[calc(100%-16px)] mx-2 flex items-center justify-between pl-4 pr-3 py-1 rounded-full transition-all duration-200 group cursor-pointer
                ${isActive
                      ? "bg-primary/10 dark:bg-primary/20"
                      : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                    }
              `}
                  style={{
                    color: isActive ? (theme.accent || "#135bec") : theme.sidebarText,
                    fontWeight: isActive ? 400 : 300,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[18px] transition-transform duration-200 ${isActive ? "scale-105" : "group-hover:scale-105"}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm tracking-wide">{item.name}</span>
                  </div>

                  {count > 0 && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full shadow-sm"
                      style={{ backgroundColor: theme.accent || "#135bec", color: "#fff" }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

          {/* MORE / LESS BUTTON */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="w-[calc(100%-16px)] mx-2 flex items-center gap-3 pl-4 pr-3 py-1 rounded-full transition-all duration-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer text-sm tracking-wide"
            style={{ color: "black", fontWeight: 500 }}
          >
            <span className="text-[18px]">
              {isMoreOpen ? <MdExpandLess size={22} /> : <MdExpandMore size={22} />}
            </span>
            <span>{isMoreOpen ? "Less" : "More"}</span>
          </button>

          {/* EXPANDABLE ITEMS */}
          {isMoreOpen && (
            <div className="space-y-0 animate-in slide-in-from-top-2 duration-200">
              {["Scheduled", "Spam", "All Mail", "Templates", "Subscriptions"]
                .map(name => SIDEBAR_ITEMS.find(item => item.name === name))
                .filter(Boolean)
                .map((item) => {
                  const isActive = location.pathname === item.path;
                  const count = unreadCounts[item.name.toLowerCase()] || 0;

                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.path)}
                      className={`w-[calc(100%-16px)] mx-2 flex items-center justify-between pl-4 pr-3 py-1 rounded-full transition-all duration-200 group cursor-pointer
                    ${isActive
                          ? "bg-primary/10 dark:bg-primary/20"
                          : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                        }
                  `}
                      style={{
                        color: isActive ? (theme.accent || "#135bec") : theme.sidebarText,
                        fontWeight: isActive ? 400 : 300,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-[18px] transition-transform duration-200 ${isActive ? "scale-105" : "group-hover:scale-105"}`}>
                          {item.icon}
                        </span>
                        <span className="text-sm tracking-wide">{item.name}</span>
                      </div>

                      {count > 0 && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full shadow-sm"
                          style={{ backgroundColor: theme.accent || "#135bec", color: "#fff" }}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          )}

          {/* SEPARATOR AND GROUPS / CHAT */}
          <div className="pt-3 pb-2">
            <hr className="border-gray-200 dark:border-gray-700/50 mx-4" />
          </div>

          <div className="mt-1">
            <div className="pl-4 pr-3 flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: theme.sidebarText }}>
                Chat
              </h3>
            </div>
          </div>

          <div className="space-y-0">
            {SIDEBAR_ITEMS.filter(item => ["Colab"].includes(item.name)).map((item) => {
              const isActive = location.pathname === item.path;
              const count = unreadCounts[item.name.toLowerCase()] || 0;

              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-[calc(100%-16px)] mx-2 flex items-center justify-between pl-4 pr-3 py-1 rounded-full transition-all duration-200 group cursor-pointer
                  ${isActive
                      ? "bg-primary/10 dark:bg-primary/20"
                      : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                    }
                `}
                  style={{
                    color: isActive ? (theme.accent || "#135bec") : theme.sidebarText,
                    fontWeight: isActive ? 400 : 300,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[18px] transition-transform duration-200 ${isActive ? "scale-105" : "group-hover:scale-105"}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm tracking-wide">{item.name}</span>
                  </div>

                  {count > 0 && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full shadow-sm"
                      style={{ backgroundColor: theme.accent || "#135bec", color: "#fff" }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* CUSTOM LABELS */}
          <div className="pt-3 pb-2">
            <hr className="border-gray-200 dark:border-gray-700/50 mx-4" />
          </div>
          <div className="mt-1">
            <div className="pl-4 pr-3 flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: theme.sidebarText }}>
                Labels
              </h3>
              <button
                onClick={() => setIsCreating(true)}
                className="p-1 rounded-md hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                style={{ color: theme.accent }}
              >
                <MdAdd size={18} />
              </button>
            </div>



            {(() => {
              const renderLabelTree = (parentId, depth = 0) => {
                const children = labels.filter(l => l.parentId === parentId || (!l.parentId && parentId === null));
                return children.map(label => (
                  <div key={label.id} className="group">
                    <div
                      className="w-[calc(100%-16px)] mx-2 flex items-center justify-between pr-3 py-1 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all cursor-pointer"
                      style={{ color: theme.sidebarText, paddingLeft: `${16 + (depth * 16)}px` }}
                    >
                      <div className="flex items-center gap-3 w-full" onClick={() => navigate(`/label/${label.id}`)}>
                        <MdLabel style={{ color: label.colorHex }} size={18} className="shrink-0" />
                        <span className="text-sm truncate">{label.name}</span>
                      </div>
                      <div className="relative flex items-center h-full">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLabelMenu(activeLabelMenu === label.id ? null : label.id);
                          }}
                          className={`p-1 rounded transition-opacity hover:bg-black/10 dark:hover:bg-white/10 shrink-0 ${activeLabelMenu === label.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          style={{ color: theme.sidebarText }}
                        >
                          <MdMoreVert size={16} />
                        </button>

                        {activeLabelMenu === label.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={(e) => { e.stopPropagation(); setActiveLabelMenu(null); }}
                            />
                            <div
                              className="absolute right-0 top-full mt-1 w-32 py-1 rounded-xl shadow-lg border z-50 text-xs overflow-hidden"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveLabelMenu(null);
                                  setEditingLabel({ id: label.id, name: label.name, color: label.colorHex || "#135bec", parentId: label.parentId || "" });
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-left"
                              >
                                <MdEdit size={14} /> Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveLabelMenu(null);
                                  if (window.confirm('Are you sure you want to delete this label? Sub-labels will also be deleted.')) {
                                    handleDeleteLabel(label.id);
                                  }
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-left text-red-500"
                              >
                                <MdDelete size={14} /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {renderLabelTree(label.id, depth + 1)}
                  </div>
                ));
              };
              return renderLabelTree(null);
            })()}
          </div>

          {/* HELP & SUPPORT (Removed HR above it) */}
          <div className="pt-2">
          </div>

          <div className="space-y-0 mb-6" style={{ position: 'fixed', bottom: '30px' }}>
            <button
              onClick={() => alert("Help center opening...")}
              className="w-[calc(100%-16px)] mx-2 flex items-center gap-3 pl-4 pr-3 py-1 rounded-full transition-all duration-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer text-sm tracking-wide"
              style={{ color: theme.sidebarText, fontWeight: 500 }}
            >
              <span className="text-[18px]"><MdSettings size={22} /></span>
              <span>Settings</span>
            </button>

            <button
              onClick={() => alert("Contacting support...")}
              className="w-[calc(100%-16px)] mx-2 flex items-center gap-3 pl-4 pr-3 py-1 rounded-full transition-all duration-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer text-sm tracking-wide"
              style={{ color: theme.sidebarText, fontWeight: 500 }}
            >
              <span className="text-[18px]"><MdHelpOutline size={22} /></span>
              <span>Help & Support</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* CREATE LABEL MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold" style={{ color: theme.text }}>New Label</h2>
              <button onClick={() => setIsCreating(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer" style={{ color: theme.subText }}>
                <MdClose size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: theme.subText }}>Label Name</label>
                <input
                  autoFocus
                  placeholder="e.g. Work, Personal, Receipts"
                  value={newLabel.name}
                  onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-transparent outline-none transition-all"
                  style={{ color: theme.text, borderColor: theme.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: theme.subText }}>Nest label under</label>
                <select
                  value={newLabel.parentId}
                  onChange={(e) => setNewLabel({ ...newLabel, parentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-transparent outline-none transition-all cursor-pointer"
                  style={{ color: theme.text, borderColor: theme.border }}
                >
                  <option value="" style={{ color: "black" }}>Top Level (No Parent)</option>
                  {labels.map(l => (
                    <option key={l.id} value={l.id} style={{ color: "black" }}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.subText }}>Color</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewLabel({ ...newLabel, color: c })}
                      className={`w-6 h-6 rounded-full transition-transform hover:scale-110 cursor-pointer flex items-center justify-center`}
                      style={{
                        backgroundColor: c,
                        border: newLabel.color === c ? '2px solid white' : '2px solid transparent',
                        boxShadow: newLabel.color === c ? `0 0 0 2px ${c}` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                style={{ color: theme.text }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddLabel}
                disabled={!newLabel.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: theme.accent || "#135bec" }}
              >
                Create Label
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LABEL MODAL */}
      {editingLabel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold" style={{ color: theme.text }}>Edit Label</h2>
              <button onClick={() => setEditingLabel(null)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer" style={{ color: theme.subText }}>
                <MdClose size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: theme.subText }}>Label Name</label>
                <input
                  autoFocus
                  placeholder="e.g. Work, Personal, Receipts"
                  value={editingLabel.name}
                  onChange={(e) => setEditingLabel({ ...editingLabel, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-transparent outline-none transition-all"
                  style={{ color: theme.text, borderColor: theme.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: theme.subText }}>Nest label under</label>
                <select
                  value={editingLabel.parentId}
                  onChange={(e) => setEditingLabel({ ...editingLabel, parentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-transparent outline-none transition-all cursor-pointer"
                  style={{ color: theme.text, borderColor: theme.border }}
                >
                  <option value="" style={{ color: "black" }}>Top Level (No Parent)</option>
                  {labels.filter(l => l.id !== editingLabel.id).map(l => (
                    <option key={l.id} value={l.id} style={{ color: "black" }}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.subText }}>Color</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setEditingLabel({ ...editingLabel, color: c })}
                      className={`w-6 h-6 rounded-full transition-transform hover:scale-110 cursor-pointer flex items-center justify-center`}
                      style={{
                        backgroundColor: c,
                        border: editingLabel.color === c ? '2px solid white' : '2px solid transparent',
                        boxShadow: editingLabel.color === c ? `0 0 0 2px ${c}` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button
                onClick={() => setEditingLabel(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                style={{ color: theme.text }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditLabelSubmit}
                disabled={!editingLabel.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: theme.accent || "#135bec" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;

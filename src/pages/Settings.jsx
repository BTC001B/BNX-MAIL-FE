import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdSettings,
  MdColorLens,
  MdSecurity,
  MdEmail,
  MdDevices,
  MdHistory,
  MdNotifications,
  MdAccessTime,
  MdLock,
  MdPalette,
  MdFormatPaint,
  MdVolumeUp,
  MdSettingsBackupRestore,
  MdRefresh,
  MdSignalCellularAlt
} from "react-icons/md";
import { emailAPI, authAPI, userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme, PRESET_BACKGROUNDS } from "../context/ThemeContext";
import toast from "react-hot-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, changeTheme, currentThemeName, backgroundImage, setBackgroundImage, clearBackgroundImage } = useTheme();

  const bgFileRef = useRef(null);
  const [customBgUrl, setCustomBgUrl] = useState("");

  const [activeTab, setActiveTab] = useState("accounts");
  const [emails, setEmails] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [showCreateEmail, setShowCreateEmail] = useState(false);
  const [newEmail, setNewEmail] = useState({ emailName: "", password: "" });
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });
  const [recoveryInfo, setRecoveryInfo] = useState({ recoveryEmail: "", phoneNumber: "" });

  // Backend user settings states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [inboxNotifications, setInboxNotifications] = useState(true);
  const [sentNotifications, setSentNotifications] = useState(false);
  const [starredNotifications, setStarredNotifications] = useState(true);
  const [snoozedNotifications, setSnoozedNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("07:00");
  const [themeMode, setThemeMode] = useState("System Default");
  const [accentColor, setAccentColor] = useState("#135bec");
  const [fontSize, setFontSize] = useState(1.0);
  const [density, setDensity] = useState("Default");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [language, setLanguage] = useState("en_US");

  // Client-only preference states
  const [signature, setSignature] = useState("");
  const [undoSendDelay, setUndoSendDelay] = useState(0);

  // Fetch initial data based on active tab
  useEffect(() => {
    if (activeTab === "accounts") {
      fetchEmails();
    } else if (activeTab === "composing") {
      fetchBackendSettings();
    } else if (activeTab === "notifications") {
      fetchBackendSettings();
    } else if (activeTab === "appearance") {
      fetchBackendSettings();
    } else if (activeTab === "security") {
      fetchRecoveryInfo();
      fetchBackendSettings();
    } else if (activeTab === "sessions") {
      fetchSessions();
      fetchActivityLogs();
    }
  }, [activeTab]);

  // Load client preferences on mount or user change
  useEffect(() => {
    if (user?.email) {
      const savedSig = localStorage.getItem(`bnx_signature_${user.email}`) || "";
      const savedUndo = localStorage.getItem(`bnx_undo_send_${user.email}`) || "0";
      setSignature(savedSig);
      setUndoSendDelay(Number(savedUndo));
    }
  }, [user]);

  const fetchBackendSettings = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getSettings();
      if (res.data?.success) {
        const d = res.data.data;
        setPhoneNumber(d.phoneNumber || "");
        setLocation(d.location || "");
        setJobTitle(d.jobTitle || "");
        setInboxNotifications(d.inboxNotifications ?? true);
        setSentNotifications(d.sentNotifications ?? false);
        setStarredNotifications(d.starredNotifications ?? true);
        setSnoozedNotifications(d.snoozedNotifications ?? true);
        setSoundEnabled(d.soundEnabled ?? true);
        setVibrationEnabled(d.vibrationEnabled ?? true);
        setQuietHoursEnabled(d.quietHoursEnabled ?? false);
        setQuietHoursStart(d.quietHoursStart || "22:00");
        setQuietHoursEnd(d.quietHoursEnd || "07:00");
        setThemeMode(d.themeMode || "System Default");
        setAccentColor(d.accentColor || "#135bec");
        setFontSize(d.fontSize || 1.0);
        setDensity(d.density || "Default");
        setTwoFactorEnabled(d.twoFactorEnabled ?? false);
        setBiometricsEnabled(d.biometricsEnabled ?? true);
        setLanguage(d.language || "en_US");
      }
    } catch (err) {
      toast.error("Failed to load settings from server");
    } finally {
      setLoading(false);
    }
  };

  const saveBackendSettings = async (updateData) => {
    try {
      setLoading(true);
      const res = await userAPI.updateSettings(updateData);
      if (res.data?.success) {
        toast.success("Settings saved to cloud");
        return true;
      }
    } catch (err) {
      toast.error("Failed to sync settings with server");
    } finally {
      setLoading(false);
    }
    return false;
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await emailAPI.listEmails();
      if (res.data?.success) {
        const data = res.data.data;
        setEmails(Array.isArray(data) ? data : (data.mailboxes || data.emails || []));
      }
    } catch {
      toast.error("Failed to load email accounts");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await authAPI.sessions();
      if (res.data?.success) {
        const data = res.data.data;
        setSessions(Array.isArray(data) ? data : (data.sessions || []));
      }
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const res = await userAPI.activityLogs();
      if (res.data?.success) {
        const data = res.data.data;
        setActivityLogs(Array.isArray(data) ? data : (data.logs || data.activity || []));
      }
    } catch {
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecoveryInfo = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getRecovery();
      if (res.data?.success) {
        setRecoveryInfo(res.data.data);
      }
    } catch {
      toast.error("Failed to load recovery information");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecovery = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await userAPI.updateRecovery(recoveryInfo);
      if (res.data?.success) {
        toast.success("Recovery info updated successfully");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update recovery info");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.emailName || newEmail.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      setLoading(true);
      const res = await emailAPI.createEmail(newEmail);
      if (res.data?.success) {
        toast.success("Email account created");
        setShowCreateEmail(false);
        setNewEmail({ emailName: "", password: "" });
        fetchEmails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create email");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.oldPassword || !passwords.newPassword) {
      toast.error("All password fields are required");
      return;
    }
    try {
      setLoading(true);
      const res = await authAPI.changePassword(passwords);
      if (res.data?.success) {
        toast.success("Password changed successfully");
        setPasswords({ oldPassword: "", newPassword: "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComposingSettings = (e) => {
    e.preventDefault();
    if (user?.email) {
      localStorage.setItem(`bnx_signature_${user.email}`, signature);
      localStorage.setItem(`bnx_undo_send_${user.email}`, undoSendDelay.toString());
      toast.success("Composing preferences saved locally");
    }
  };

  const handleSaveNotificationSettings = async (e) => {
    e.preventDefault();
    await saveBackendSettings({
      inboxNotifications,
      sentNotifications,
      starredNotifications,
      snoozedNotifications,
      soundEnabled,
      vibrationEnabled,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd
    });
  };

  const handleSaveAppearanceSettings = async (e) => {
    e.preventDefault();
    const ok = await saveBackendSettings({
      themeMode,
      accentColor,
      fontSize,
      density
    });
    if (ok) {
      // Apply themeMode / accentColor changes locally if required
      if (themeMode === "Dark") changeTheme("Dark");
      else if (themeMode === "Light") changeTheme("Classic");
    }
  };

  const handleSaveSecuritySettings = async (e) => {
    e.preventDefault();
    await saveBackendSettings({
      twoFactorEnabled,
      biometricsEnabled,
      phoneNumber,
      location,
      jobTitle
    });
  };

  const tabs = [
    { id: "accounts", label: "Accounts & Mailboxes", icon: <MdEmail size={20} /> },
    { id: "composing", label: "General & Composing", icon: <MdSettings size={20} /> },
    { id: "notifications", label: "Notifications & Quiet", icon: <MdNotifications size={20} /> },
    { id: "appearance", label: "Appearance & Layout", icon: <MdColorLens size={20} /> },
    { id: "security", label: "Security & Recovery", icon: <MdSecurity size={20} /> },
    { id: "sessions", label: "Active Sessions & Logs", icon: <MdDevices size={20} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: theme.bg }}>
      {/* Side Tabs Bar */}
      <aside 
        className="w-64 border-r p-4 flex flex-col gap-1.5 shrink-0" 
        style={{ background: theme.cardBg, borderColor: theme.border }}
      >
        <button 
          onClick={() => navigate("/inbox")} 
          className="text-xs font-bold mb-4 hover:underline text-left cursor-pointer flex items-center gap-1.5" 
          style={{ color: theme.accent }}
        >
          ← Back to Inbox
        </button>
        <h2 className="text-lg font-bold mb-4 px-2" style={{ color: theme.text }}>Settings</h2>
        
        {tabs.map(tab => (
          <SideTab 
            key={tab.id}
            icon={tab.icon} 
            label={tab.label} 
            active={activeTab === tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            theme={theme} 
          />
        ))}
      </aside>

      {/* Settings Options Pane */}
      <main className="flex-1 p-8 overflow-y-auto hidden-scrollbar">
        {/* accounts Tab */}
        {activeTab === "accounts" && (
          <Section title="Email Accounts" theme={theme}>
            <p className="text-xs opacity-70 mb-4">Manage multiple linked email addresses in your current session.</p>
            <button 
              onClick={() => setShowCreateEmail(true)} 
              className="mb-4 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer hover:opacity-95 transition-opacity" 
              style={{ background: theme.accent }}
            >
              Add New Email Account
            </button>
            {showCreateEmail && (
              <form onSubmit={handleCreateEmail} className="mb-6 p-4 rounded-2xl border flex flex-col gap-3" style={{ borderColor: theme.border }}>
                <input 
                  placeholder="Username (e.g. john)" 
                  value={newEmail.emailName} 
                  onChange={e => setNewEmail({...newEmail, emailName: e.target.value})} 
                  className="w-full p-2.5 text-xs rounded-xl border outline-none"
                  style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                />
                <input 
                  type="password" 
                  placeholder="Password (min 8 chars)" 
                  value={newEmail.password} 
                  onChange={e => setNewEmail({...newEmail, password: e.target.value})} 
                  className="w-full p-2.5 text-xs rounded-xl border outline-none"
                  style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                />
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 cursor-pointer">Create</button>
                  <button type="button" onClick={() => setShowCreateEmail(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 cursor-pointer">Cancel</button>
                </div>
              </form>
            )}
            <div className="flex flex-col gap-2">
              {emails.map(email => (
                <div key={email.id} className="flex items-center justify-between p-4 rounded-2xl border" style={{ borderColor: theme.border }}>
                  <span className="text-xs font-semibold" style={{ color: theme.text }}>{email.email}</span>
                  {email.isPrimary ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Primary</span>
                  ) : (
                    <span className="text-[10px] text-gray-400">Alias</span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* composing Tab */}
        {activeTab === "composing" && (
          <Section title="General & Composing Settings" theme={theme}>
            <form onSubmit={handleSaveComposingSettings} className="flex flex-col gap-5 max-w-lg">
              {/* Signature */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Email Signature</label>
                <textarea 
                  placeholder="Write signature here..." 
                  value={signature} 
                  onChange={e => setSignature(e.target.value)} 
                  rows={4}
                  className="w-full p-3 text-xs rounded-xl border outline-none resize-none"
                  style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                />
                <span className="text-[10px] text-gray-400">Signature will automatically append to the bottom of new compose frames.</span>
              </div>

              {/* Undo Send */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Undo Send Delay</label>
                <select 
                  value={undoSendDelay} 
                  onChange={e => setUndoSendDelay(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl border outline-none cursor-pointer"
                  style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                >
                  <option value={0}>Disabled (Send instantly)</option>
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={20}>20 seconds</option>
                  <option value={30}>30 seconds</option>
                </select>
                <span className="text-[10px] text-gray-400">Sets the grace window to cancel/undo emails after pressing send.</span>
              </div>

              <button 
                type="submit" 
                className="w-fit px-5 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer hover:opacity-95 transition-opacity" 
                style={{ background: theme.accent }}
              >
                Save Preferences
              </button>
            </form>
          </Section>
        )}

        {/* notifications Tab */}
        {activeTab === "notifications" && (
          <Section title="Notification Preferences & Quiet Hours" theme={theme}>
            <form onSubmit={handleSaveNotificationSettings} className="flex flex-col gap-6 max-w-lg">
              {/* Notifications triggers */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Folders & Subscriptions</h4>
                <ToggleRow label="Inbox Mail Alerts" checked={inboxNotifications} onChange={setInboxNotifications} theme={theme} />
                <ToggleRow label="Sent Confirmation Alerts" checked={sentNotifications} onChange={setSentNotifications} theme={theme} />
                <ToggleRow label="Starred Emails Alerts" checked={starredNotifications} onChange={setStarredNotifications} theme={theme} />
                <ToggleRow label="Snoozed Reminders" checked={snoozedNotifications} onChange={setSnoozedNotifications} theme={theme} />
              </div>

              <div className="flex flex-col gap-3 border-t pt-4" style={{ borderColor: theme.border }}>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vibration & Sounds</h4>
                <ToggleRow label="Play Alert Sound" checked={soundEnabled} onChange={setSoundEnabled} theme={theme} />
                <ToggleRow label="Enable Haptic Vibration" checked={vibrationEnabled} onChange={setVibrationEnabled} theme={theme} />
              </div>

              {/* Quiet Hours */}
              <div className="flex flex-col gap-3 border-t pt-4" style={{ borderColor: theme.border }}>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Quiet Hours Schedule</h4>
                <ToggleRow label="Mute Notifications Schedule" checked={quietHoursEnabled} onChange={setQuietHoursEnabled} theme={theme} />
                
                {quietHoursEnabled && (
                  <div className="flex items-center gap-3 mt-1.5 animate-fadeIn">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400">Quiet Starts At</label>
                      <input 
                        type="time" 
                        value={quietHoursStart} 
                        onChange={e => setQuietHoursStart(e.target.value)} 
                        className="p-2 border text-xs rounded-xl outline-none"
                        style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400">Quiet Ends At</label>
                      <input 
                        type="time" 
                        value={quietHoursEnd} 
                        onChange={e => setQuietHoursEnd(e.target.value)} 
                        className="p-2 border text-xs rounded-xl outline-none"
                        style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="w-fit px-5 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer hover:opacity-95 transition-opacity" 
                style={{ background: theme.accent }}
              >
                Save Notification Settings
              </button>
            </form>
          </Section>
        )}

        {/* appearance Tab */}
        {activeTab === "appearance" && (
          <Section title="Appearance & Interface Customization" theme={theme}>
            <form onSubmit={handleSaveAppearanceSettings} className="flex flex-col gap-6 max-w-lg">
              {/* Density */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Mail Density View</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Default", "Comfortable", "Compact"].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDensity(d)}
                      className={`p-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${density === d ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                      style={density === d ? { borderColor: theme.accent, color: theme.accent } : { borderColor: theme.border, color: theme.text }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color picker */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Custom Accent Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={accentColor} 
                    onChange={e => setAccentColor(e.target.value)} 
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent shrink-0 outline-none"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {["#135bec", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"].map(c => (
                      <button 
                        key={c} 
                        type="button"
                        onClick={() => setAccentColor(c)}
                        className="w-6 h-6 rounded-full border border-white dark:border-gray-800 shadow-md cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Font scaling size */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 flex justify-between">
                  <span>Font Size Scale</span>
                  <span className="font-mono text-[10px] opacity-75">{fontSize}x</span>
                </label>
                <input 
                  type="range" 
                  min="0.8" 
                  max="1.5" 
                  step="0.05"
                  value={fontSize} 
                  onChange={e => setFontSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Theme palettes picker */}
              <div className="flex flex-col gap-2 border-t pt-4" style={{ borderColor: theme.border }}>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Visual Theme Palette</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Classic", "Dark", "Nature", "Ocean", "Sunset", "Minimal"].map(t => (
                    <button 
                      key={t} 
                      type="button"
                      onClick={() => {
                        changeTheme(t);
                        setThemeMode(t === "Dark" ? "Dark" : "Light");
                      }} 
                      className={`p-3 text-xs rounded-xl border cursor-pointer transition-all ${currentThemeName === t ? "border-primary ring-1 ring-primary" : ""}`}
                      style={currentThemeName === t ? { borderColor: theme.accent, color: theme.accent } : { borderColor: theme.border, color: theme.text }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Image section */}
              <div className="flex flex-col gap-3 border-t pt-4" style={{ borderColor: theme.border }}>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Background Wallpaper</label>
                
                {/* Current background preview */}
                {backgroundImage && (
                  <div className="relative rounded-xl overflow-hidden border h-28" style={{ borderColor: theme.border }}>
                    <img 
                      src={backgroundImage} 
                      alt="Current background" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={clearBackgroundImage}
                        className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-white/90 text-gray-800 hover:bg-white cursor-pointer shadow-lg"
                      >
                        Remove Background
                      </button>
                    </div>
                  </div>
                )}

                {/* Preset wallpapers grid */}
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.label}
                      type="button"
                      onClick={() => setBackgroundImage(bg.url)}
                      className={`relative rounded-xl overflow-hidden h-16 border-2 cursor-pointer transition-all hover:scale-[1.03] hover:shadow-md ${
                        backgroundImage === bg.url ? "ring-2 ring-offset-1" : ""
                      }`}
                      style={{ 
                        borderColor: backgroundImage === bg.url ? theme.accent : theme.border,
                        ringColor: theme.accent
                      }}
                      title={bg.label}
                    >
                      <img 
                        src={bg.url.replace('w=1920', 'w=300')} 
                        alt={bg.label} 
                        className="w-full h-full object-cover" 
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1 py-0.5">
                        <span className="text-[8px] text-white font-bold">{bg.label}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom URL input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste custom image URL..."
                    value={customBgUrl}
                    onChange={(e) => setCustomBgUrl(e.target.value)}
                    className="flex-1 p-2 text-xs rounded-xl border outline-none"
                    style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customBgUrl.trim()) {
                        setBackgroundImage(customBgUrl.trim());
                        setCustomBgUrl("");
                        toast.success("Custom background applied");
                      }
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                    style={{ background: theme.accent }}
                  >
                    Apply
                  </button>
                </div>

                {/* File upload option */}
                <input
                  type="file"
                  ref={bgFileRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("Image must be under 5MB");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setBackgroundImage(ev.target.result);
                      toast.success("Background image uploaded");
                    };
                    reader.readAsDataURL(file);
                    if (bgFileRef.current) bgFileRef.current.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => bgFileRef.current?.click()}
                  className="w-fit px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderColor: theme.border, color: theme.subText }}
                >
                  📁 Upload from device
                </button>
              </div>

              <button 
                type="submit" 
                className="w-fit px-5 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer hover:opacity-95 transition-opacity" 
                style={{ background: theme.accent }}
              >
                Save Layout Settings
              </button>
            </form>
          </Section>
        )}

        {/* security Tab */}
        {activeTab === "security" && (
          <Section title="Security & Account Recovery" theme={theme}>
            <div className="flex flex-col gap-6 max-w-lg">
              {/* Details and 2FA */}
              <form onSubmit={handleSaveSecuritySettings} className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profile Information</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Job Title</label>
                    <input 
                      placeholder="Software Engineer" 
                      value={jobTitle} 
                      onChange={e => setJobTitle(e.target.value)} 
                      className="p-2.5 text-xs rounded-xl border outline-none"
                      style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Location</label>
                    <input 
                      placeholder="New York, USA" 
                      value={location} 
                      onChange={e => setLocation(e.target.value)} 
                      className="p-2.5 text-xs rounded-xl border outline-none"
                      style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400">Phone Contact</label>
                  <input 
                    placeholder="+1 (555) 019-2834" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)} 
                    className="p-2.5 text-xs rounded-xl border outline-none"
                    style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                  />
                </div>

                <div className="border-t my-1" style={{ borderColor: theme.border }} />

                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Multi-Factor Authenticator</h4>
                <ToggleRow label="Enable Two-Factor Authentication (2FA)" checked={twoFactorEnabled} onChange={setTwoFactorEnabled} theme={theme} />
                <ToggleRow label="Enable Biometrics Access" checked={biometricsEnabled} onChange={setBiometricsEnabled} theme={theme} />

                <button 
                  type="submit" 
                  className="w-fit px-5 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer hover:opacity-95 transition-opacity mt-1" 
                  style={{ background: theme.accent }}
                >
                  Save Security Preferences
                </button>
              </form>

              {/* Password update form */}
              <form onSubmit={handleChangePassword} className="flex flex-col gap-3 border-t pt-4" style={{ borderColor: theme.border }}>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Update Account Password</h4>
                <input 
                  type="password" 
                  placeholder="Current Password" 
                  value={passwords.oldPassword} 
                  onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} 
                  className="w-full p-2.5 text-xs rounded-xl border outline-none"
                  style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                />
                <input 
                  type="password" 
                  placeholder="New Password" 
                  value={passwords.newPassword} 
                  onChange={e => setPasswords({...passwords, newPassword: e.target.value})} 
                  className="w-full p-2.5 text-xs rounded-xl border outline-none"
                  style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                />
                <button 
                  type="submit" 
                  className="w-fit px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 cursor-pointer"
                >
                  Update Password
                </button>
              </form>

              {/* Recovery Setup */}
              <form onSubmit={handleUpdateRecovery} className="flex flex-col gap-3 border-t pt-4" style={{ borderColor: theme.border }}>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Backup Account Recovery</h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400">Recovery Email Address</label>
                  <input 
                    type="email" 
                    placeholder="backup@example.com" 
                    value={recoveryInfo.recoveryEmail || ""} 
                    onChange={e => setRecoveryInfo({...recoveryInfo, recoveryEmail: e.target.value})} 
                    className="w-full p-2.5 text-xs rounded-xl border outline-none"
                    style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400">Backup Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+1234567890" 
                    value={recoveryInfo.phoneNumber || ""} 
                    onChange={e => setRecoveryInfo({...recoveryInfo, phoneNumber: e.target.value})} 
                    className="w-full p-2.5 text-xs rounded-xl border outline-none"
                    style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-fit px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Save Recovery Details
                </button>
              </form>
            </div>
          </Section>
        )}

        {/* sessions Tab */}
        {activeTab === "sessions" && (
          <div className="flex flex-col gap-6">
            <Section title="Active Device Sessions" theme={theme}>
              <p className="text-xs opacity-70 mb-3">Below are the devices currently logged into your account.</p>
              <div className="flex flex-col gap-2.5">
                {sessions.map((s, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border" style={{ borderColor: theme.border }}>
                    <p className="text-xs font-bold" style={{ color: theme.text }}>{s.deviceName || "Unknown Browser / Client"}</p>
                    <p className="text-[11px] opacity-70">{s.ipAddress} — {s.location}</p>
                    <p className="text-[10px] opacity-50 mt-1">Last active: {new Date(s.lastActive).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Security Activity Log" theme={theme}>
              <p className="text-xs opacity-70 mb-3">Audit history of recent security-critical adjustments on your account.</p>
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto hidden-scrollbar">
                {activityLogs.map((log, idx) => (
                  <div key={idx} className="p-3 border-b text-xs flex justify-between items-center" style={{ borderColor: theme.border }}>
                    <div>
                      <p className="font-semibold" style={{ color: theme.text }}>{log.action}</p>
                      <p className="text-[10px] opacity-50">{log.ipAddress}</p>
                    </div>
                    <span className="text-[10px] opacity-60 text-right">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
      </main>
    </div>
  );
};

const SideTab = ({ icon, label, active, onClick, theme }) => (
  <button 
    onClick={onClick} 
    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-xs font-semibold text-left cursor-pointer w-full" 
    style={{ 
      background: active ? "rgba(19, 91, 236, 0.08)" : "transparent", 
      color: active ? theme.accent : theme.subText 
    }}
  >
    {icon} {label}
  </button>
);

const Section = ({ title, children, theme }) => (
  <div 
    className="max-w-2xl p-6 rounded-2xl border shadow-sm mb-6" 
    style={{ background: theme.cardBg, borderColor: theme.border, color: theme.text }}
  >
    <h3 className="text-sm font-bold border-b pb-3.5 mb-4 flex items-center gap-2" style={{ borderColor: theme.border }}>
      {title}
    </h3>
    {children}
  </div>
);

const ToggleRow = ({ label, checked, onChange, theme }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-xs font-medium" style={{ color: theme.text }}>{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 outline-none cursor-pointer flex ${checked ? 'justify-end' : 'justify-start'}`}
      style={{ backgroundColor: checked ? theme.accent : 'rgba(156,163,175,0.4)' }}
    >
      <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
    </button>
  </div>
);

export default Settings;

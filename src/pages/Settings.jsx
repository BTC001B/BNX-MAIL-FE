import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdSettings,
  MdColorLens,
  MdSecurity,
  MdEmail,
  MdDevices,
  MdHistory
} from "react-icons/md";
import { emailAPI, authAPI, userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, changeTheme, currentThemeName } = useTheme();

  const [activeTab, setActiveTab] = useState("accounts");
  const [emails, setEmails] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreateEmail, setShowCreateEmail] = useState(false);
  const [newEmail, setNewEmail] = useState({ emailName: "", password: "" });
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });
  const [recoveryInfo, setRecoveryInfo] = useState({ recoveryEmail: "", phoneNumber: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (activeTab === "accounts") fetchEmails();
    if (activeTab === "sessions") fetchSessions();
    if (activeTab === "activity") fetchActivityLogs();
    if (activeTab === "recovery") fetchRecoveryInfo();
  }, [activeTab]);

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
      if (res.data?.status === "success") {
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
      if (res.data?.status === "success") {
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
      toast.error("Invalid input");
      return;
    }
    try {
      setLoading(true);
      const res = await emailAPI.createEmail(newEmail);
      if (res.data?.success) {
        toast.success("Email account created");
        setShowCreateEmail(false);
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
    try {
      const res = await authAPI.changePassword(passwords);
      if (res.data?.success) {
        toast.success("Password changed successfully");
        setPasswords({ oldPassword: "", newPassword: "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="flex h-screen" style={{ background: theme.bg }}>
      <aside className="w-64 border-r p-4 flex flex-col gap-2" style={{ background: theme.cardBg, borderColor: theme.border }}>
        <button onClick={() => navigate("/inbox")} className="text-sm mb-3 hover:underline text-left" style={{ color: theme.accent }}>← Back to Inbox</button>
        <h2 className="text-xl font-bold mb-4" style={{ color: theme.text }}>Settings</h2>
        <SideTab icon={<MdEmail />} label="Email Accounts" active={activeTab === "accounts"} onClick={() => setActiveTab("accounts")} theme={theme} />
        <SideTab icon={<MdSettings />} label="Account" active={activeTab === "account"} onClick={() => setActiveTab("account")} theme={theme} />
        <SideTab icon={<MdSecurity />} label="Recovery" active={activeTab === "recovery"} onClick={() => setActiveTab("recovery")} theme={theme} />
        <SideTab icon={<MdColorLens />} label="Appearance" active={activeTab === "appearance"} onClick={() => setActiveTab("appearance")} theme={theme} />
        <SideTab icon={<MdSecurity />} label="Security" active={activeTab === "security"} onClick={() => setActiveTab("security")} theme={theme} />
        <SideTab icon={<MdDevices />} label="Active Sessions" active={activeTab === "sessions"} onClick={() => setActiveTab("sessions")} theme={theme} />
        <SideTab icon={<MdHistory />} label="Activity Logs" active={activeTab === "activity"} onClick={() => setActiveTab("activity")} theme={theme} />
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "accounts" && (
          <Section title="Email Accounts" theme={theme}>
            <button onClick={() => setShowCreateEmail(true)} className="mb-4 px-4 py-2 rounded text-white" style={{ background: theme.accent }}>Add Email</button>
            {showCreateEmail && (
              <form onSubmit={handleCreateEmail} className="mb-6 p-4 rounded border" style={{ borderColor: theme.border }}>
                <input placeholder="Email name" value={newEmail.emailName} onChange={e => setNewEmail({...newEmail, emailName: e.target.value})} className="w-full mb-3 p-2 border rounded" />
                <input type="password" placeholder="Password" value={newEmail.password} onChange={e => setNewEmail({...newEmail, password: e.target.value})} className="w-full mb-3 p-2 border rounded" />
                <button type="submit" className="px-4 py-2 rounded text-white" style={{ background: theme.accent }}>Create</button>
              </form>
            )}
            {emails.map(email => (
              <div key={email.id} className="flex justify-between p-4 mb-2 rounded border" style={{ borderColor: theme.border }}>
                <span style={{ color: theme.text }}>{email.email} {email.isPrimary && "(Primary)"}</span>
              </div>
            ))}
          </Section>
        )}

        {activeTab === "security" && (
          <Section title="Security" theme={theme}>
            <form onSubmit={handleChangePassword} className="max-w-md">
              <input type="password" placeholder="Old Password" value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} className="w-full mb-3 p-2 border rounded" />
              <input type="password" placeholder="New Password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} className="w-full mb-3 p-2 border rounded" />
              <button type="submit" className="px-4 py-2 rounded text-white" style={{ background: theme.accent }}>Update Password</button>
            </form>
          </Section>
        )}

        {activeTab === "recovery" && (
          <Section title="Account Recovery" theme={theme}>
            <p className="mb-4 text-sm opacity-70">Update your recovery email and phone number to ensure you can always access your account.</p>
            <form onSubmit={handleUpdateRecovery} className="max-w-md">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Recovery Email</label>
                <input 
                  type="email" 
                  placeholder="backup@example.com" 
                  value={recoveryInfo.recoveryEmail || ""} 
                  onChange={e => setRecoveryInfo({...recoveryInfo, recoveryEmail: e.target.value})} 
                  className="w-full p-2 border rounded"
                  style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input 
                  type="text" 
                  placeholder="+1234567890" 
                  value={recoveryInfo.phoneNumber || ""} 
                  onChange={e => setRecoveryInfo({...recoveryInfo, phoneNumber: e.target.value})} 
                  className="w-full p-2 border rounded"
                  style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <button type="submit" className="px-6 py-2 rounded font-medium text-white transition-opacity hover:opacity-90" style={{ background: theme.accent }}>
                Save Recovery Info
              </button>
            </form>
          </Section>
        )}

        {activeTab === "sessions" && (
          <Section title="Active Sessions" theme={theme}>
            {sessions.map((s, idx) => (
              <div key={idx} className="p-4 mb-2 rounded border" style={{ borderColor: theme.border }}>
                <p className="font-semibold">{s.deviceName || "Unknown Device"}</p>
                <p className="text-sm opacity-70">{s.ipAddress} - {s.location}</p>
                <p className="text-xs opacity-50">Last active: {new Date(s.lastActive).toLocaleString()}</p>
              </div>
            ))}
          </Section>
        )}

        {activeTab === "activity" && (
          <Section title="Security Activity" theme={theme}>
            {activityLogs.map((log, idx) => (
              <div key={idx} className="p-3 mb-2 border-b" style={{ borderColor: theme.border }}>
                <p className="text-sm">{log.action}</p>
                <p className="text-xs opacity-50">{new Date(log.timestamp).toLocaleString()} - {log.ipAddress}</p>
              </div>
            ))}
          </Section>
        )}

        {activeTab === "appearance" && (
          <Section title="Appearance" theme={theme}>
             <div className="grid grid-cols-3 gap-4">
               {["Classic", "Dark", "Nature", "Ocean", "Sunset", "Minimal"].map(t => (
                 <button key={t} onClick={() => changeTheme(t)} className={`p-4 rounded border ${currentThemeName === t ? "ring-2 ring-blue-500" : ""}`}>{t}</button>
               ))}
             </div>
          </Section>
        )}
      </main>
    </div>
  );
};

const SideTab = ({ icon, label, active, onClick, theme }) => (
  <button onClick={onClick} className="flex items-center gap-3 px-3 py-2 rounded transition text-left" style={{ background: active ? theme.bg : "transparent", color: active ? theme.accent : theme.subText }}>
    {icon} {label}
  </button>
);

const Section = ({ title, children, theme }) => (
  <div className="max-w-3xl p-6 rounded shadow-sm mb-6" style={{ background: theme.cardBg, color: theme.text }}>
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

export default Settings;

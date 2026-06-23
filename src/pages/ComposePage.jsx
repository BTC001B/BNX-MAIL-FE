import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdSend, MdAttachFile, MdDeleteOutline, MdClose, MdAssignment } from "react-icons/md";
import { mailAPI } from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { DEFAULT_TEMPLATES } from "./Templates";

const ComposePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const [showTemplates, setShowTemplates] = useState(false);
  const [allTemplates, setAllTemplates] = useState([]);

  const [formData, setFormData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });

  // Load Custom + Default templates for inline insertion
  useEffect(() => {
    const saved = localStorage.getItem("bnx_mail_custom_templates");
    let custom = [];
    if (saved) {
      try {
        custom = JSON.parse(saved);
      } catch (e) {}
    }
    setAllTemplates([...DEFAULT_TEMPLATES, ...custom]);
  }, [showTemplates]);

  /* ---------------- PREFILL ON ROUTE STATE ---------------- */
  useEffect(() => {
    if (location.state) {
      if (location.state.replyTo) {
        setFormData((prev) => ({
          ...prev,
          to: location.state.replyTo,
          subject: location.state.subject || "",
          body: location.state.originalBody
            ? `\n\n--- Original Message ---\n${location.state.originalBody}`
            : "",
        }));
      } else if (location.state.draft) {
        const d = location.state.draft;
        setFormData({
          to: d.to || "",
          cc: d.cc || "",
          bcc: d.bcc || "",
          subject: d.subject || "",
          body: d.body || "",
        });
        if (d.cc) setShowCc(true);
        if (d.bcc) setShowBcc(true);
      } else {
        setFormData((prev) => ({
          ...prev,
          to: location.state.to || prev.to || "",
          cc: location.state.cc || prev.cc || "",
          bcc: location.state.bcc || prev.bcc || "",
          subject: location.state.subject || prev.subject || "",
          body: location.state.body || prev.body || "",
        }));
      }
    }
  }, [location.state]);

  const handleApplyTemplate = (template) => {
    const confirmApply =
      !formData.subject.trim() && !formData.body.trim()
        ? true
        : window.confirm("Apply template? This will replace your current subject and body.");

    if (confirmApply) {
      setFormData((prev) => ({
        ...prev,
        subject: template.subject,
        body: template.body,
      }));
      setShowTemplates(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  /* ---------------- SEND EMAIL ---------------- */
  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.to) {
      setError("Recipient email is required");
      return;
    }

    if (!formData.subject) {
      setError("Subject is required");
      return;
    }

    try {
      setSending(true);

      const payload = {
        to: formData.to,
        subject: formData.subject,
        body: formData.body,
      };

      if (formData.cc) payload.cc = formData.cc;
      if (formData.bcc) payload.bcc = formData.bcc;

      const response = await mailAPI.send(payload);

      if (response.data?.success) {
        setSuccess("Email sent successfully");
        setTimeout(() => navigate("/inbox"), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    const hasContent = formData.to.trim() || formData.subject.trim() || formData.body.trim() || formData.cc.trim() || formData.bcc.trim();
    if (hasContent) {
      try {
        setSending(true);
        setError("");
        setSuccess("Saving draft...");
        const payload = {
          to: formData.to,
          subject: formData.subject || "(No Subject)",
          body: formData.body,
        };
        if (formData.cc) payload.cc = formData.cc;
        if (formData.bcc) payload.bcc = formData.bcc;

        await mailAPI.saveDraft(payload);
        setSuccess("Draft saved successfully");
        setTimeout(() => navigate("/inbox"), 1000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to save draft");
        setSending(false);
      }
    } else {
      navigate("/inbox");
    }
  };

  const handleDiscard = () => {
    if (window.confirm("Discard this email?")) {
      navigate("/inbox");
    }
  };

  return (
    <div
      className="h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-10 flex flex-col bg-transparent"
    >
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col min-h-0">
        <div
          className="flex flex-col h-full rounded-2xl shadow-soft dark:shadow-soft-dark border overflow-hidden glass-panel"
          style={{ borderColor: theme.border }}
        >
          {/* HEADER */}
          <div
            className="flex items-center justify-between p-4 sm:p-5 border-b shrink-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md"
            style={{ borderColor: theme.border }}
          >
            <h2 className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
              New Message
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors tooltip-trigger flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
              title="Close"
            >
              <MdClose size={22} />
            </button>
          </div>

          {/* ALERTS */}
          {error && (
            <div className="mx-5 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-sm font-medium shrink-0">
              {error}
            </div>
          )}
          {success && (
            <div className="mx-5 mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 text-sm font-medium shrink-0">
              {success}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSend} className="flex flex-col flex-1 p-5 min-h-0">
            <div className="flex-1 overflow-y-auto hidden-scrollbar pr-2 flex flex-col gap-1">
              {/* TO */}
              <Field
                label="To"
                name="to"
                value={formData.to}
                onChange={handleChange}
                theme={theme}
                extra={
                  <>
                    <button
                      type="button"
                      onClick={() => setShowCc((v) => !v)}
                      className="text-sm font-medium px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      style={{ color: theme.accent || '#135bec' }}
                    >
                      Cc
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBcc((v) => !v)}
                      className="text-sm font-medium px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      style={{ color: theme.accent || '#135bec' }}
                    >
                      Bcc
                    </button>
                  </>
                }
              />

              {showCc && (
                <Field
                  label="Cc"
                  name="cc"
                  value={formData.cc}
                  onChange={handleChange}
                  theme={theme}
                />
              )}

              {showBcc && (
                <Field
                  label="Bcc"
                  name="bcc"
                  value={formData.bcc}
                  onChange={handleChange}
                  theme={theme}
                />
              )}

              {/* SUBJECT */}
              <Field
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                theme={theme}
              />

              {/* BODY */}
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                placeholder="Type your message…"
                className="w-full flex-1 resize-none outline-none p-4 rounded-xl mt-4 min-h-[200px] glass-input text-gray-800 dark:text-gray-100 placeholder:text-gray-400 text-base"
              />
            </div>

            {/* ACTIONS */}
            <div
              className="flex items-center justify-between mt-4 pt-4 border-t shrink-0"
              style={{ borderColor: theme.border }}
            >
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:hover:shadow-md disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(135deg, ${theme.accent || '#135bec'} 0%, #3b82f6 100%)` }}
                >
                  {sending ? "Sending…" : "Send"}
                  {!sending && <MdSend size={18} />}
                </button>
                <button
                  type="button"
                  className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 tooltip-trigger"
                  title="Attach file"
                >
                  <MdAttachFile size={22} className="transform rotate-45" />
                </button>

                {/* Inline Templates quick selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                    title="Insert Template"
                  >
                    <MdAssignment size={20} />
                    <span className="hidden sm:inline">Templates</span>
                  </button>

                  {showTemplates && (
                    <div
                      className="absolute bottom-12 left-0 w-64 max-h-60 overflow-y-auto rounded-xl border shadow-xl z-50 p-2 glass"
                      style={{
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                    >
                      <div className="flex items-center justify-between p-2 mb-1 border-b" style={{ borderColor: theme.border }}>
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60">Select Template</span>
                        <button
                          type="button"
                          onClick={() => setShowTemplates(false)}
                          className="text-xs p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-gray-500"
                        >
                          <MdClose size={14} />
                        </button>
                      </div>
                      {allTemplates.length === 0 ? (
                        <p className="text-xs text-center p-3 opacity-60">No templates found</p>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {allTemplates.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleApplyTemplate(t)}
                              className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate text-gray-800 dark:text-gray-200 cursor-pointer"
                            >
                              <div className="font-semibold truncate">{t.title}</div>
                              <div className="text-xs opacity-60 truncate">{t.subject}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleDiscard}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"

              >
                <MdDeleteOutline size={20} />
                <span>Discard</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ---------------- FIELD COMPONENT ---------------- */
const Field = ({ label, name, value, onChange, extra, theme }) => {
  return (
    <div
      className="flex items-center gap-3 border-b py-2 sm:py-3 transition-colors focus-within:border-primary/50"
      style={{ borderColor: theme?.border || '#e5e7eb' }}
    >
      <span className="w-16 text-sm font-medium text-gray-500 shrink-0">{label}:</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="flex-1 outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 group"
        placeholder={`Enter ${label.toLowerCase()}...`}
        spellCheck="false"
      />
      {extra && <div className="flex gap-2 shrink-0">{extra}</div>}
    </div>
  );
};

export default ComposePage;

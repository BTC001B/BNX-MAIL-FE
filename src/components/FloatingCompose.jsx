import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { 
  MdSend, 
  MdAttachFile, 
  MdDeleteOutline, 
  MdClose, 
  MdAssignment, 
  MdRemove, 
  MdOpenInFull, 
  MdCloseFullscreen,
  MdEditDocument
} from "react-icons/md";
import { mailAPI, api, userAPI, signatureAPI, casboxAPI } from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { useMail } from "../context/MailContext";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_TEMPLATES } from "../pages/Templates";
import toast from "react-hot-toast";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from 'quill-image-resize-module-react';

// For quill-image-resize-module-react
window.Quill = Quill;
Quill.register('modules/imageResize', ImageResize);

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link'],
    ['clean']
  ],
  imageResize: {
    parchment: Quill.import('parchment'),
    modules: ['Resize', 'DisplaySize', 'Toolbar']
  }
};

const FloatingCompose = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { 
    isComposeOpen, 
    closeCompose, 
    isComposeMinimized, 
    setIsComposeMinimized, 
    isComposeMaximized, 
    setIsComposeMaximized, 
    composeData,
    fetchEmails,
    openCompose
  } = useMail();

  const fileInputRef = useRef(null);

  const [composeMode, setComposeMode] = useState("email"); // "email" or "casbox"

  // Sync mode if opened with data
  useEffect(() => {
      if (composeData?.mode) {
          setComposeMode(composeData.mode);
      } else {
          setComposeMode("email");
      }
  }, [composeData, isComposeOpen]);

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

  const [signatures, setSignatures] = useState([]);
  const [showSignaturesMenu, setShowSignaturesMenu] = useState(false);
  const [undoSendDelay, setUndoSendDelay] = useState(0);
  const signatureInjectedRef = useRef(false);

  const [draftId, setDraftId] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showScheduleMenu, setShowScheduleMenu] = useState(false);
  const [showCustomSchedule, setShowCustomSchedule] = useState(false);
  const [customScheduleDateTime, setCustomScheduleDateTime] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [size, setSize] = useState({ width: 540, height: 500 });
  const [position, setPosition] = useState({ x: window.innerWidth - 570, y: window.innerHeight - 520 });

  // Listen for window resize to check mobile view and clamp desktop boundaries
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (!mobile) {
        setSize((prevSize) => {
          const w = Math.min(prevSize.width, window.innerWidth - 40);
          const h = Math.min(prevSize.height, window.innerHeight - 60);
          
          setPosition((prevPos) => {
            const maxTargetX = window.innerWidth - w - 20;
            const maxTargetY = window.innerHeight - h - 20;
            return {
              x: Math.max(20, Math.min(prevPos.x, maxTargetX)),
              y: Math.max(20, Math.min(prevPos.y, maxTargetY))
            };
          });
          
          return { width: w, height: h };
        });
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset/sync positioning and size on state toggle or mobile detection
  useEffect(() => {
    if (!isComposeOpen || isMobile) return;

    if (isComposeMaximized) {
      const w = Math.min(1000, window.innerWidth * 0.85);
      const h = Math.min(700, window.innerHeight * 0.85);
      setSize({ width: w, height: h });
      setPosition({ x: (window.innerWidth - w) / 2, y: (window.innerHeight - h) / 2 });
    } else if (isComposeMinimized) {
      const w = Math.min(500, window.innerWidth - 40);
      setSize({ width: w, height: 45 });
      setPosition({ x: window.innerWidth - w - 20, y: window.innerHeight - 45 });
    } else {
      const w = Math.min(540, window.innerWidth - 40);
      const h = Math.min(500, window.innerHeight - 60);
      setSize({ width: w, height: h });
      setPosition({ x: window.innerWidth - w - 20, y: window.innerHeight - h - 20 });
    }
  }, [isComposeMaximized, isComposeMinimized, isComposeOpen, isMobile]);

  // Load Custom + Default templates for inline insertion
  useEffect(() => {
    if (!isComposeOpen) return;
    const saved = localStorage.getItem("bnx_mail_custom_templates");
    let custom = [];
    if (saved) {
      try {
        custom = JSON.parse(saved);
      } catch (e) {}
    }
    setAllTemplates([...DEFAULT_TEMPLATES, ...custom]);
  }, [showTemplates, isComposeOpen]);

  /* ---------------- FETCH SETTINGS FROM BACKEND ---------------- */
  useEffect(() => {
    if (!isComposeOpen) {
      signatureInjectedRef.current = false;
      return;
    }
    const fetchSettings = async () => {
      try {
        const [settingsRes, sigsRes] = await Promise.all([
          userAPI.getSettings(),
          signatureAPI.getSignatures().catch(() => null)
        ]);

        if (settingsRes.data?.success) {
          setUndoSendDelay(settingsRes.data.data.undoSendDelay || 0);
        }

        if (sigsRes?.data?.success) {
          const sigs = sigsRes.data.data;
          if (Array.isArray(sigs)) {
            setSignatures(sigs);
          }
        }
      } catch (e) {
        console.error("Failed to load settings for compose", e);
      }
    };
    fetchSettings();
  }, [isComposeOpen]);

  /* ---------------- PREFILL ON COMPOSE DATA CHANGE ---------------- */
  useEffect(() => {
    if (isComposeOpen) {
      // Only set initial empty state once when opening
      if (!signatureInjectedRef.current && signatures.length === 0) {
        setDraftId(null);
        setAttachments([]);
        setUploading(false);
      }

      if (composeData) {
        if (!signatureInjectedRef.current) {
          if (composeData.replyTo) {
            setFormData({
              to: composeData.replyTo,
              cc: "",
              bcc: "",
              subject: composeData.subject || "",
              body: composeData.originalBody
                ? `<br/><br/><div>--- Original Message ---<br/>${composeData.originalBody.replace(/\n/g, '<br/>')}</div>`
                : "",
            });
          } else if (composeData.draft) {
            const d = composeData.draft;
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
            setFormData({
              to: composeData.to || "",
              cc: composeData.cc || "",
              bcc: composeData.bcc || "",
              subject: composeData.subject || "",
              body: composeData.body || "",
            });
            if (composeData.cc) setShowCc(true);
            if (composeData.bcc) setShowBcc(true);
          }
          signatureInjectedRef.current = true;
        }
      } else {
        if (!signatureInjectedRef.current) {
          setFormData({
            to: "",
            cc: "",
            bcc: "",
            subject: "",
            body: "",
          });
          signatureInjectedRef.current = true;
        }
        setShowCc(false);
        setShowBcc(false);
      }
      setError("");
      setSuccess("");
    }
  }, [composeData, isComposeOpen, signatures]);

  if (!isComposeOpen) return null;

  const handleApplyTemplate = (template) => {
    const confirmApply =
      !formData.subject.trim() && !formData.body.trim()
        ? true
        : window.confirm("Apply template? This will replace your current subject and body.");

    if (confirmApply) {
      setFormData((prev) => ({
        ...prev,
        subject: template.subject,
        body: template.body ? template.body.replace(/\n/g, '<br/>') : '',
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

  /* ---------------- ATTACHMENT UPLOAD HANDLER ---------------- */
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      setError("");
      
      let activeDraftId = draftId;

      // 1. If we don't have a database draftId yet, create one to attach files to
      if (!activeDraftId) {
        const payload = {
          to: formData.to,
          cc: formData.cc,
          bcc: formData.bcc,
          subject: formData.subject || "(No Subject)",
          body: formData.body,
          isHtml: true
        };
        const draftRes = await mailAPI.createDbDraft(payload);
        if (draftRes.data?.success) {
          activeDraftId = draftRes.data.data.id;
          setDraftId(activeDraftId);
        } else {
          throw new Error("Failed to initialize draft session");
        }
      }

      // 2. Upload each file in sequence
      for (const file of files) {
        const fileForm = new FormData();
        fileForm.append("file", file);

        toast.loading(`Uploading ${file.name}...`, { id: "upload-attachment" });
        const uploadRes = await mailAPI.uploadDraftAttachment(activeDraftId, fileForm);
        if (uploadRes.data?.success) {
          const info = uploadRes.data.data;
          setAttachments((prev) => [...prev, info]);
          toast.success(`${file.name} uploaded`, { id: "upload-attachment" });
        } else {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }
    } catch (err) {
      console.error("Attachment upload error:", err);
      setError(err.response?.data?.message || err.message || "Failed to upload attachments");
      toast.error("Upload failed", { id: "upload-attachment" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ---------------- ATTACHMENT REMOVAL HANDLER ---------------- */
  const handleRemoveAttachment = async (fileName) => {
    if (!draftId) return;
    try {
      toast.loading(`Removing ${fileName}...`, { id: "remove-attachment" });
      const res = await mailAPI.removeDraftAttachment(draftId, fileName);
      if (res.data?.success) {
        setAttachments((prev) => prev.filter((a) => a.fileName !== fileName));
        toast.success("Attachment removed", { id: "remove-attachment" });
      }
    } catch (err) {
      console.error("Failed to remove attachment:", err);
      toast.error("Failed to remove attachment", { id: "remove-attachment" });
    }
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

    if (composeMode === "casbox") {
        if (!formData.body) {
           setError("Message body is required");
           return;
        }
        setSending(true);
        try {
            // Strip HTML but preserve newlines for casbox
            let rawHtml = formData.body;
            // Replace common block elements and breaks with newlines
            rawHtml = rawHtml.replace(/<br\s*[\/]?>/gi, '\n')
                             .replace(/<\/p>/gi, '\n')
                             .replace(/<\/div>/gi, '\n')
                             .replace(/<[^>]+>/g, '');
                             
            // Decode HTML entities
            const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
            const plainText = doc.documentElement.textContent.trim();
            
            await casboxAPI.sendMessage({
                receiverEmail: formData.to,
                subject: formData.subject,
                body: plainText,
                attachmentsJson: attachments.length > 0 ? JSON.stringify(attachments) : null
            });
            toast.success("Casbox Message sent.");
            closeCompose();
        } catch(err) {
            setError(err.response?.data?.message || "Failed to send casbox message");
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
        return;
    }

    if (!formData.subject) {
      setError("Subject is required");
      return;
    }

    if (uploading) {
      setError("Please wait for files to finish uploading");
      return;
    }

    const delaySeconds = Number(undoSendDelay);

    const payload = {
      to: formData.to,
      subject: formData.subject,
      body: formData.body,
      isHtml: true
    };
    if (formData.cc) payload.cc = formData.cc;
    if (formData.bcc) payload.bcc = formData.bcc;

    const executeSend = async (tid) => {
      try {
        let response;
        if (draftId) {
          await mailAPI.createDbDraft({
            id: draftId,
            ...payload,
            isHtml: true
          });
          response = await mailAPI.sendDbDraft(draftId);
        } else {
          response = await mailAPI.send(payload);
        }

        if (response.data?.success) {
          if (delaySeconds > 0) {
            toast.dismiss(tid);
          } else {
            toast.success("Message sent.", { id: tid, duration: 4000 });
            closeCompose();
          }
          fetchEmails(undefined, true);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to send email");
        toast.error("Failed to send email", { id: tid });
      } finally {
        setSending(false);
      }
    };

    setSending(true);

    if (delaySeconds > 0) {
      let isUndone = false;
      
      // Fake instant send by closing compose immediately
      closeCompose();
      
      const toastId = toast((t) => (
        <div className="flex items-center justify-between gap-6 w-full min-w-[250px] text-sm text-black">
          <span>Message sent.</span>
          <button
            type="button"
            onClick={() => {
              isUndone = true;
              toast.dismiss(t.id);
            }}
            className="font-bold text-[#fbbc04] hover:text-yellow-300 cursor-pointer"
          >
            Undo
          </button>
        </div>
      ), { 
        duration: delaySeconds * 1000, 
        position: "bottom-left",
        style: {
          background: '#202124',
          color: '#fff',
          borderRadius: '4px',
          padding: '12px 24px',
          boxShadow: '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)'
        }
      });

      setTimeout(() => {
        if (isUndone) {
          toast.error("Sending cancelled", { id: toastId });
          openCompose({
            draft: true,
            id: draftId,
            to: payload.to,
            cc: payload.cc,
            bcc: payload.bcc,
            subject: payload.subject,
            body: payload.body,
          });
          return;
        }
        executeSend(toastId);
      }, delaySeconds * 1000);
    } else {
      const toastId = toast.loading("Sending email...", { position: "bottom-center" });
      executeSend(toastId);
    }
  };

  /* ---------------- SCHEDULE EMAIL ---------------- */
  const handleScheduleSend = async (sendAtIso) => {
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

    if (uploading) {
      setError("Please wait for files to finish uploading");
      return;
    }

    try {
      setSending(true);

      const payload = {
        to: formData.to,
        subject: formData.subject,
        body: formData.body,
        attachments: attachments
      };

      if (formData.cc) payload.cc = formData.cc;
      if (formData.bcc) payload.bcc = formData.bcc;

      const response = await mailAPI.scheduleEmail(payload, sendAtIso);

      if (response.data?.success) {
        setSuccess("Email scheduled successfully");
        toast.success("Email scheduled successfully");
        setTimeout(() => {
          closeCompose();
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule email");
    } finally {
      setSending(false);
      setShowScheduleMenu(false);
      setShowCustomSchedule(false);
    }
  };

  const getScheduleOptions = () => {
    const now = new Date();
    
    const laterToday = new Date(now);
    if (now.getHours() >= 17) {
      laterToday.setHours(now.getHours() + 3);
    } else {
      laterToday.setHours(18, 0, 0, 0);
    }

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    const nextWeek = new Date(now);
    const daysToMonday = (8 - now.getDay()) % 7 || 7;
    nextWeek.setDate(now.getDate() + daysToMonday);
    nextWeek.setHours(8, 0, 0, 0);

    const formatTime = (d) => {
      const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const dateStr = d.toLocaleDateString([], { weekday: 'short' });
      return `${dateStr}, ${timeStr}`;
    };

    return [
      { label: "Later today", time: laterToday, display: formatTime(laterToday) },
      { label: "Tomorrow morning", time: tomorrow, display: formatTime(tomorrow) },
      { label: "Monday morning", time: nextWeek, display: formatTime(nextWeek) },
    ];
  };

  const handleClose = () => {
    const hasContent = formData.to.trim() || formData.subject.trim() || formData.body.trim() || formData.cc.trim() || formData.bcc.trim();
    if (hasContent && composeMode === "email") {
      const payload = {
        to: formData.to,
        subject: formData.subject || "(No Subject)",
        body: formData.body,
        isHtml: true,
      };
      if (formData.cc) payload.cc = formData.cc;
      if (formData.bcc) payload.bcc = formData.bcc;

      // Save draft in the background silently
      mailAPI.saveDraft(payload)
        .then(() => fetchEmails('draft'))
        .catch((err) => {
          console.error("Failed to auto-save draft in the background:", err);
        });
    }
    closeCompose();
  };

  const handleDiscard = async () => {
    if (window.confirm("Discard this email?")) {
      if (draftId) {
        try {
          await api.delete(`/api/mail/drafts/${draftId}`);
        } catch (e) {
          console.error("Failed to discard DB draft:", e);
        }
      }
      closeCompose();
    }
  };

  const renderContent = () => (
    <>
      {/* HEADER / DRAG HANDLE */}
      <div
        className={`${isMobile ? "" : "compose-drag-handle"} flex items-center justify-between px-4 py-2 cursor-move shrink-0 border-b select-none`}
        style={{ 
          backgroundColor: theme.primary || "#f2f6fc",
          borderColor: theme.border || "rgba(0,0,0,0.1)"
        }}
        onClick={() => {
          if (isMobile && isComposeMinimized) {
            setIsComposeMinimized(false);
          }
        }}
      >
        <div className="flex-1 flex items-center bg-black/5 dark:bg-white/10 rounded-lg p-0.5 mr-4" onClick={e => e.stopPropagation()}>
           <button 
             onClick={() => setComposeMode('email')}
             className={`flex-1 flex justify-center py-1.5 rounded-md text-xs font-bold transition-all ${composeMode === 'email' ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
           >
             Email
           </button>
           <button 
             onClick={() => setComposeMode('casbox')}
             className={`flex-1 flex justify-center py-1.5 rounded-md text-xs font-bold transition-all ${composeMode === 'casbox' ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
           >
             Casbox
           </button>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsComposeMinimized(!isComposeMinimized)}
            className="p-1 rounded hover:bg-white/10 transition-colors text-black flex items-center justify-center cursor-pointer"
            title="Minimize"
          >
            <MdRemove size={16} />
          </button>
          {!isMobile && (
            <button
              onClick={() => setIsComposeMaximized(!isComposeMaximized)}
              className="p-1 rounded hover:bg-white/10 transition-colors text-black flex items-center justify-center cursor-pointer"
              title={isComposeMaximized ? "Restore Window" : "Maximize"}
            >
              {isComposeMaximized ? <MdCloseFullscreen size={14} /> : <MdOpenInFull size={14} />}
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-white/10 transition-colors text-black flex items-center justify-center cursor-pointer"
            title="Save & Close"
          >
            <MdClose size={16} />
          </button>
        </div>
      </div>

      {/* BODY CONTENT (HIDDEN WHEN MINIMIZED) */}
      {!isComposeMinimized && (
        <form onSubmit={handleSend} className="flex-1 flex flex-col p-4 overflow-hidden min-h-0 bg-transparent">
          {/* ALERTS */}
          {error && (
            <div className="mb-3 p-2 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-xs font-medium shrink-0">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 p-2 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 text-xs font-medium shrink-0">
              {success}
            </div>
          )}

          {/* FIELDS */}
          <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto hidden-scrollbar min-h-0 pr-1">
            {/* Cc & Bcc toggles */}
            {composeMode === "email" && (
                <div className="flex px-4 py-2 border-b items-center text-sm dark:border-gray-800 shrink-0">
                  <div className="text-gray-400 dark:text-gray-500 w-10">To</div>
                  <input
                    type="text"
                    autoFocus
                    className="flex-1 outline-none bg-transparent dark:text-gray-100 placeholder-gray-400"
                    placeholder="Recipients"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  />
                  <div className="flex gap-2 text-gray-500 font-medium">
                    <button type="button" onClick={() => setShowCc(!showCc)} className="hover:underline">
                      Cc
                    </button>
                    <button type="button" onClick={() => setShowBcc(!showBcc)} className="hover:underline">
                      Bcc
                    </button>
                  </div>
                </div>
            )}
            {composeMode === "casbox" && (
                <div className="flex px-4 py-2 border-b items-center text-sm dark:border-gray-800 shrink-0">
                  <div className="text-gray-400 dark:text-gray-500 w-10">To</div>
                  <input
                    type="text"
                    autoFocus
                    className="flex-1 outline-none bg-transparent dark:text-gray-100 placeholder-gray-400"
                    placeholder="Casbox Contact Email"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  />
                </div>
            )}

            {/* CC */}
            {showCc && composeMode === "email" && (
              <div className="flex items-center gap-2 border-b py-1.5 shrink-0 animate-fade-in" style={{ borderColor: theme.border }}>
                <span className="text-xs font-semibold w-10 text-gray-500">Cc:</span>
                <input
                  name="cc"
                  value={formData.cc}
                  onChange={handleChange}
                  className="flex-1 bg-transparent text-sm outline-none border-none"
                  style={{ color: theme.text }}
                  placeholder="carboncopy@example.com"
                  spellCheck="false"
                />
              </div>
            )}

            {/* BCC */}
            {showBcc && composeMode === "email" && (
              <div className="flex items-center gap-2 border-b py-1.5 shrink-0 animate-fade-in" style={{ borderColor: theme.border }}>
                <span className="text-xs font-semibold w-10 text-gray-500">Bcc:</span>
                <input
                  name="bcc"
                  value={formData.bcc}
                  onChange={handleChange}
                  className="flex-1 bg-transparent text-sm outline-none border-none"
                  style={{ color: theme.text }}
                  placeholder="blindcopy@example.com"
                  spellCheck="false"
                />
              </div>
            )}

            {/* SUBJECT */}
            <div className="flex items-center gap-2 border-b py-1.5 shrink-0" style={{ borderColor: theme.border }}>
              <span className="text-xs font-semibold w-10 text-gray-500">Subject:</span>
              <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="flex-1 bg-transparent text-sm outline-none border-none"
                style={{ color: theme.text }}
                placeholder="Enter subject..."
                spellCheck="false"
              />
            </div>

            {/* BODY */}
            <div className="flex-1 mt-2 overflow-y-auto w-full compose-quill rounded-md" style={{ minHeight: "150px" }}>
              <ReactQuill
                theme="snow"
                modules={quillModules}
                value={formData.body}
                onChange={(content) => setFormData((prev) => ({ ...prev, body: content }))}
                placeholder="Type your message here..."
                className="h-full bg-white text-black"
              />
            </div>

            {/* ATTACHMENT CHIPS RENDERING */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 py-2 mt-2 border-t" style={{ borderColor: theme.border }}>
                {attachments.map((file, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-2 bg-black/[0.03] dark:bg-white/[0.04] border px-2.5 py-1 rounded-xl text-xs"
                    style={{ borderColor: theme.border, color: theme.text }}
                  >
                    <span className="truncate max-w-[150px]">{file.fileName}</span>
                    <span className="opacity-55 font-medium">({Math.round(file.size / 1024)} KB)</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveAttachment(file.fileName)}
                      className="text-red-500 hover:text-red-700 font-bold text-sm leading-none cursor-pointer"
                      title="Remove attachment"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FILE UPLOAD INPUT */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />

          {/* ACTIONS FOOTER */}
          <div className="flex items-center justify-between border-t pt-3 mt-2 shrink-0 relative" style={{ borderColor: theme.border }}>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-full shadow-md hover:shadow-lg transition-all">
                <button
                  type="submit"
                  disabled={sending || uploading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-l-full text-white text-xs font-semibold disabled:opacity-60 cursor-pointer border-r border-white/20"
                  style={{ background: `linear-gradient(135deg, ${theme.accent || '#135bec'} 0%, #3b82f6 100%)` }}
                >
                  {sending ? "Sending…" : "Send"}
                  {!sending && <MdSend size={14} />}
                </button>
                {composeMode === "email" && (
                  <button
                    type="button"
                    disabled={sending || uploading}
                    onClick={() => {
                      setShowScheduleMenu(!showScheduleMenu);
                      setShowCustomSchedule(false);
                    }}
                    className="px-2 py-2 rounded-r-full text-white text-xs font-semibold disabled:opacity-60 cursor-pointer flex items-center justify-center hover:bg-white/10"
                    style={{ background: `linear-gradient(135deg, ${theme.accent || '#135bec'} 0%, #3b82f6 100%)` }}
                    title="Schedule send"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Schedule Send Dropdown Menu */}
              {showScheduleMenu && (
                <div
                  className="absolute bottom-12 left-0 w-64 rounded-xl border shadow-2xl z-50 p-1.5 bg-white dark:bg-neutral-900 animate-in fade-in duration-200"
                  style={{ borderColor: theme.border }}
                >
                  <div className="flex items-center justify-between p-2 mb-1 border-b" style={{ borderColor: theme.border }}>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Schedule send</span>
                    <button
                      type="button"
                      onClick={() => { setShowScheduleMenu(false); setShowCustomSchedule(false); }}
                      className="text-xs p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-400"
                    >
                      ✕
                    </button>
                  </div>

                  {showCustomSchedule ? (
                    <div className="p-2 flex flex-col gap-3">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Select Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={customScheduleDateTime}
                        onChange={(e) => setCustomScheduleDateTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2 justify-end mt-1">
                        <button
                          type="button"
                          onClick={() => setShowCustomSchedule(false)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!customScheduleDateTime) {
                              alert("Please select a valid date and time.");
                              return;
                            }
                            const dateObj = new Date(customScheduleDateTime);
                            if (dateObj <= new Date()) {
                              alert("Please select a future date and time.");
                              return;
                            }
                            handleScheduleSend(dateObj.toISOString());
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                        >
                          Schedule
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0.5 py-1">
                      {getScheduleOptions().map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleScheduleSend(opt.time.toISOString())}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-between gap-2 text-gray-800 dark:text-gray-200 cursor-pointer font-medium"
                        >
                          <span>{opt.label}</span>
                          <span className="text-gray-400 dark:text-gray-500 text-[11px]">{opt.display}</span>
                        </button>
                      ))}
                      <div className="border-t my-1" style={{ borderColor: theme.border }}></div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomSchedule(true);
                          const defaultCustom = new Date();
                          defaultCustom.setMinutes(defaultCustom.getMinutes() - defaultCustom.getTimezoneOffset());
                          setCustomScheduleDateTime(defaultCustom.toISOString().slice(0, 16));
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-blue-500 dark:text-blue-400 font-semibold cursor-pointer"
                      >
                        Select date & time
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                title="Attach file"
              >
                <MdAttachFile size={18} className="transform rotate-45" />
              </button>

              {/* Signatures quick selector */}
              {composeMode === "email" && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSignaturesMenu(!showSignaturesMenu)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-semibold"
                    title="Insert Signature"
                  >
                    <MdEditDocument size={16} />
                    <span className="hidden sm:inline">Signature</span>
                  </button>

                  {showSignaturesMenu && (
                    <div
                      className="absolute bottom-10 right-0 md:right-auto md:left-0 w-56 max-h-48 overflow-y-auto rounded-xl border shadow-xl z-50 p-1.5 glass"
                      style={{
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                    >
                      <div className="flex items-center justify-between p-1.5 mb-1 border-b" style={{ borderColor: theme.border }}>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Signatures</span>
                        <button
                          type="button"
                          onClick={() => setShowSignaturesMenu(false)}
                          className="text-xs p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-500"
                        >
                          <MdClose size={12} />
                        </button>
                      </div>
                      {signatures.length === 0 ? (
                        <p className="text-[10px] text-center p-2 opacity-60">No signatures configured</p>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {signatures.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, body: prev.body + `<br/><br/>${s.content}` }));
                                setShowSignaturesMenu(false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate text-gray-800 dark:text-gray-200 cursor-pointer flex justify-between items-center"
                            >
                              <span className="font-semibold truncate">{s.name}</span>
                              {s.isDefault && <span className="text-[10px] text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 rounded">Default</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Inline Templates quick selector */}
              {composeMode === "email" && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-semibold"
                    title="Insert Template"
                  >
                    <MdAssignment size={16} />
                    <span className="hidden sm:inline">Templates</span>
                  </button>

                  {showTemplates && (
                    <div
                      className="absolute bottom-10 right-0 md:right-auto md:left-0 w-56 max-h-48 overflow-y-auto rounded-xl border shadow-xl z-50 p-1.5 glass"
                      style={{
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                    >
                      <div className="flex items-center justify-between p-1.5 mb-1 border-b" style={{ borderColor: theme.border }}>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Templates</span>
                        <button
                          type="button"
                          onClick={() => setShowTemplates(false)}
                          className="text-xs p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-500"
                        >
                          <MdClose size={12} />
                        </button>
                      </div>
                      {allTemplates.length === 0 ? (
                        <p className="text-[10px] text-center p-2 opacity-60">No templates found</p>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {allTemplates.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleApplyTemplate(t)}
                              className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate text-gray-800 dark:text-gray-200 cursor-pointer"
                            >
                              <div className="font-semibold truncate">{t.title}</div>
                              <div className="text-[10px] opacity-60 truncate">{t.subject}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleDiscard}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-semibold transition-colors cursor-pointer"
            >
              <MdDeleteOutline size={18} />
              <span className="hidden sm:inline">Discard</span>
            </button>
          </div>
        </form>
      )}
    </>
  );

  if (isMobile) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          top: isComposeMinimized ? "auto" : 0,
          height: isComposeMinimized ? "45px" : "100%",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          borderRadius: isComposeMinimized ? "12px 12px 0 0" : "0",
          boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
          border: `1px solid ${theme.border}`,
          backgroundColor: theme.cardBg,
          overflow: "hidden"
        }}
      >
        {renderContent()}
      </div>
    );
  }

  return (
    <Rnd
      size={{ 
        width: size.width, 
        height: isComposeMinimized ? 45 : size.height 
      }}
      position={position}
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, pos) => {
        setSize({
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10)
        });
        setPosition(pos);
      }}
      minWidth={350}
      minHeight={isComposeMinimized ? 45 : 300}
      maxWidth={window.innerWidth}
      maxHeight={window.innerHeight}
      enableResizing={!isComposeMinimized}
      disableDragging={isComposeMaximized}
      dragHandleClassName="compose-drag-handle"
      bounds="window"
      style={{
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px 12px 0 0",
        boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.cardBg,
        overflow: "hidden"
      }}
    >
      {renderContent()}
    </Rnd>
  );
};

export default FloatingCompose;

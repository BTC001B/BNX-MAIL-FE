import React, { useState } from "react";
import { 
  MdArchive, 
  MdUnarchive, 
  MdDelete, 
  MdStar, 
  MdAccessTime, 
  MdLabel, 
  MdReply, 
  MdForward,
  MdFileDownload,
  MdRemoveRedEye,
  MdClose,
  MdWbSunny, 
  MdNightsStay, 
  MdToday, 
  MdEvent, 
  MdUpdate, 
  MdDateRange,
  MdChevronLeft,
  MdChevronRight,
  MdOpenInFull,
  MdCloseFullscreen,
  MdPrint,
  MdMoreVert,
  MdMarkEmailUnread,
  MdBlock
} from "react-icons/md";
import { useMail } from "../context/MailContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { mailAPI } from "../services/api";
import toast from "react-hot-toast";
import logo from "../assets/bnx-remove.png";
import html2pdf from "html2pdf.js";

const getMimeType = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    case 'svg': return 'image/svg+xml';
    case 'txt': return 'text/plain';
    case 'html': return 'text/html';
    default: return 'application/octet-stream';
  }
};

const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf':
      return { icon: '📄', color: '#ea4335', name: 'PDF' };
    case 'doc':
    case 'docx':
      return { icon: '📝', color: '#1a73e8', name: 'Word' };
    case 'xls':
    case 'xlsx':
      return { icon: '📊', color: '#1e8e3e', name: 'Excel' };
    case 'ppt':
    case 'pptx':
      return { icon: '📈', color: '#f86734', name: 'PowerPoint' };
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
    case 'svg':
      return { icon: '🖼️', color: '#12a4b4', name: 'Image' };
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return { icon: '📦', color: '#e37400', name: 'Archive' };
    case 'mp3':
    case 'wav':
    case 'ogg':
      return { icon: '🎵', color: '#aa00ff', name: 'Audio' };
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'mkv':
      return { icon: '🎥', color: '#d500f9', name: 'Video' };
    default:
      return { icon: '📎', color: '#5f6368', name: 'File' };
  }
};

const EmailDetails = ({
  email,
  onBack,
  onReply,
  onDelete,
  onStar,
  onArchive,
  onUnarchive,
  onSnooze,
  onApplyLabel,
  onClose,
  isArchiveFolder = false,
  emailList = [],
  onNavigate,
}) => {
  const { theme, readingPaneMode } = useTheme();
  const { user } = useAuth();
  const { labels, handleRemoveLabel, fetchEmails, currentFolder } = useMail();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const cleanSenderEmail = email?.from
    ? (email.from.includes("<")
        ? email.from.split("<")[1].split(">")[0].trim()
        : email.from.trim())
    : "";

  const isSystemEmail = cleanSenderEmail.toLowerCase().includes("mailer-daemon") || 
                        cleanSenderEmail.toLowerCase().includes("postmaster") || 
                        cleanSenderEmail.toLowerCase().includes("noreply") ||
                        cleanSenderEmail.toLowerCase().includes("no-reply");

  const handleUnsubscribeClick = async () => {
    if (!cleanSenderEmail) return;
    const confirmUnsubscribe = window.confirm(`Are you sure you want to unsubscribe and block future emails from ${cleanSenderEmail}?`);
    if (confirmUnsubscribe) {
      try {
        toast.loading("Unsubscribing...", { id: "unsubscribe" });
        await mailAPI.unsubscribe(cleanSenderEmail);
        toast.success(`Unsubscribed from ${cleanSenderEmail}`, { id: "unsubscribe" });
        if (fetchEmails) {
          fetchEmails(currentFolder || "inbox");
        }
        if (onBack) {
          onBack();
        }
      } catch (error) {
        console.error("Failed to unsubscribe:", error);
        toast.error("Failed to unsubscribe", { id: "unsubscribe" });
      }
    }
  };
  const isActuallyArchived = isArchiveFolder || email.folderName?.toLowerCase() === "archive";
  const [showLabels, setShowLabels] = useState(false);
  const [showSnooze, setShowSnooze] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [customSnooze, setCustomSnooze] = useState(false);
  const [customDateTime, setCustomDateTime] = useState("");
  const [imagePreviews, setImagePreviews] = useState({});

  const handlePrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write('<html><head><title>Print Email</title>');
    doc.write(`<base href="${window.location.origin}/" />`);
    doc.write(`
      <style>
        body { font-family: sans-serif; padding: 20px; color: #000; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 15px; margin-bottom: 20px; }
        .logo-container { display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: bold; color: #135bec; }
        .logo-container img { height: 32px; }
        .logo-text-dark { color: #333; }
        .user-email { font-size: 14px; color: #555; font-weight: 500; }
        h2 { margin-bottom: 5px; font-size: 22px; }
        .meta { color: #555; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; font-size: 14px; line-height: 1.5; }
        .plaintext { white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.5; }
      </style>
    `);
    doc.write('</head><body>');
    
    doc.write(`
      <div class="header">
        <div class="logo-container">
          <img src="${logo}" alt="BNX Mail Logo" />
          <span>BNX<span class="logo-text-dark">mail</span></span>
        </div>
        <div class="user-email">${user?.email || ''}</div>
      </div>
    `);

    doc.write(`<h2>${email.subject || "(No Subject)"}</h2>`);
    const escapedFrom = email.from ? email.from.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
    doc.write(`<div class="meta"><strong>From:</strong> ${escapedFrom}<br/><strong>Date:</strong> ${formatDate(email.date)}</div>`);
    
    if (email.htmlBody) {
      doc.write(`<div>${email.htmlBody}</div>`);
    } else {
      const textContent = email.body || email.textPlain || "";
      doc.write(`<div class="plaintext">${textContent}</div>`);
    }
    
    doc.write('</body></html>');
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);

    setShowMoreOptions(false);
  };

  const handleDownloadMessage = () => {
    toast.loading("Generating PDF...", { id: "pdf-download" });

    const escapedFrom = email.from ? email.from.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
    
    let bodyHtml = "";
    if (email.htmlBody) {
      bodyHtml = `<div>${email.htmlBody}</div>`;
    } else {
      const textContent = email.body || email.textPlain || "";
      bodyHtml = `<div style="white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.5;">${textContent}</div>`;
    }

    const fullHtml = `
      <div style="padding:20px;font-family:sans-serif;color:#000;background:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #ccc;padding-bottom:15px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:8px;font-size:24px;font-weight:bold;color:#135bec;">
            <img src="${window.location.origin}${logo}" style="height:32px;" alt="BNX Mail Logo" />
            <span>BNX<span style="color:#333;">mail</span></span>
          </div>
          <div style="font-size:14px;color:#555;font-weight:500;">${user?.email || ''}</div>
        </div>
        <h2 style="margin-bottom:5px;font-size:22px;">${email.subject || "(No Subject)"}</h2>
        <div style="color:#555;margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid #eee;font-size:14px;line-height:1.5;">
          <strong>From:</strong> ${escapedFrom}<br/>
          <strong>Date:</strong> ${formatDate(email.date)}
        </div>
        ${bodyHtml}
      </div>
    `;

    const opt = {
      margin:       10,
      filename:     `${(email.subject || 'message').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, allowTaint: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(fullHtml).save().then(() => {
      toast.success("PDF Downloaded!", { id: "pdf-download" });
    }).catch(err => {
      console.error(err);
      toast.error("Failed to generate PDF", { id: "pdf-download" });
    });

    setShowMoreOptions(false);
  };

  const getSnoozeOptions = () => {
    const now = new Date();
    
    // Later today: 6 PM today (or +3 hours if past 5 PM)
    const laterToday = new Date(now);
    if (now.getHours() >= 17) {
      laterToday.setHours(now.getHours() + 3);
    } else {
      laterToday.setHours(18, 0, 0, 0);
    }

    // Tomorrow: 8 AM tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    // Later this week: Thursday 8 AM (if today is Mon/Tue/Wed), else +2 days 8 AM
    const laterThisWeek = new Date(now);
    if (now.getDay() < 4) {
      laterThisWeek.setDate(now.getDate() + (4 - now.getDay()));
    } else {
      laterThisWeek.setDate(now.getDate() + 2);
    }
    laterThisWeek.setHours(8, 0, 0, 0);

    // This weekend: Saturday 8 AM
    const thisWeekend = new Date(now);
    const daysToSaturday = 6 - now.getDay();
    thisWeekend.setDate(now.getDate() + (daysToSaturday === 0 ? 7 : daysToSaturday));
    thisWeekend.setHours(8, 0, 0, 0);

    // Next week: Monday 8 AM
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
      { label: "Later today", time: laterToday, display: formatTime(laterToday), icon: <MdToday size={18} className="text-amber-500" /> },
      { label: "Tomorrow", time: tomorrow, display: formatTime(tomorrow), icon: <MdWbSunny size={18} className="text-yellow-500" /> },
      { label: "Later this week", time: laterThisWeek, display: formatTime(laterThisWeek), icon: <MdEvent size={18} className="text-indigo-500" /> },
      { label: "This weekend", time: thisWeekend, display: formatTime(thisWeekend), icon: <MdNightsStay size={18} className="text-purple-500" /> },
      { label: "Next week", time: nextWeek, display: formatTime(nextWeek), icon: <MdUpdate size={18} className="text-emerald-500" /> },
    ];
  };

  const getFolder = () => {
    if (isArchiveFolder) return "Archive";
    if (!email.category) return "INBOX";
    const cat = email.category.toUpperCase();
    if (cat === "SENT") return "Sent";
    if (cat === "TRASH") return "Trash";
    if (cat === "SPAM") return "Spam";
    if (cat === "DRAFTS") return "Drafts";
    return "INBOX";
  };

  React.useEffect(() => {
    if (!email || !email.attachments) {
      return () => {
        setImagePreviews((prev) => {
          Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
          return {};
        });
      };
    }

    setImagePreviews((prev) => {
      Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
      return {};
    });

    email.attachments.forEach(async (file) => {
      const ext = file.split('.').pop().toLowerCase();
      const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
      if (isImage) {
        try {
          const res = await mailAPI.downloadAttachment(email.uid, file, getFolder());
          const blobUrl = URL.createObjectURL(new Blob([res.data]));
          setImagePreviews((prev) => ({
            ...prev,
            [file]: blobUrl
          }));
        } catch (err) {
          console.error("Failed to load image preview for", file, err);
        }
      }
    });

    return () => {
      setImagePreviews((prev) => {
        Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
        return {};
      });
    };
  }, [email]);

  const [previewFile, setPreviewFile] = useState(null);
  const [bounceDetails, setBounceDetails] = useState("");

  React.useEffect(() => {
    return () => {
      setPreviewFile((prev) => {
        if (prev) URL.revokeObjectURL(prev.blobUrl);
        return null;
      });
    };
  }, [email]);

  React.useEffect(() => {
    if (!email || !email.attachments) {
      setBounceDetails("");
      return;
    }
    const isBounce = email.from?.toLowerCase().includes('mailer-daemon') || email.from?.toLowerCase().includes('postmaster');
    if (!isBounce) {
      setBounceDetails("");
      return;
    }

    setBounceDetails("");
    email.attachments.forEach(async (file) => {
      const ext = file.split('.').pop().toLowerCase();
      if (['txt', 'eml', 'rfc822'].includes(ext)) {
        try {
          const res = await mailAPI.downloadAttachment(email.uid, file, getFolder());
          const reader = new FileReader();
          reader.onload = () => {
            setBounceDetails(prev => prev + `\n\n--- ${file} ---\n${reader.result}`);
          };
          reader.readAsText(new Blob([res.data]));
        } catch (e) {
          console.error("Failed to fetch bounce details", e);
        }
      }
    });
  }, [email]);

  const closePreview = () => {
    setPreviewFile((prev) => {
      if (prev) URL.revokeObjectURL(prev.blobUrl);
      return null;
    });
  };

  const handleDownloadAttachment = async (fileName) => {
    try {
      toast.loading(`Downloading ${fileName}...`, { id: "download-attachment" });
      const res = await mailAPI.downloadAttachment(email.uid, fileName, getFolder());
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${fileName} downloaded successfully`, { id: "download-attachment" });
    } catch (err) {
      console.error("Failed to download attachment:", err);
      toast.error("Failed to download attachment", { id: "download-attachment" });
    }
  };

  const handlePreviewAttachment = async (fileName) => {
    try {
      toast.loading(`Loading preview...`, { id: "preview-attachment" });
      const res = await mailAPI.downloadAttachment(email.uid, fileName, getFolder());
      const mime = getMimeType(fileName);
      
      let textContent = "";
      if (mime === "text/plain") {
        const reader = new FileReader();
        textContent = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsText(new Blob([res.data]));
        });
      }

      const url = window.URL.createObjectURL(new Blob([res.data], { type: mime }));
      setPreviewFile({
        fileName,
        blobUrl: url,
        mimeType: mime,
        textContent
      });
      toast.success("Loaded preview", { id: "preview-attachment" });
    } catch (err) {
      console.error("Failed to preview attachment:", err);
      toast.error("Failed to preview attachment", { id: "preview-attachment" });
    }
  };

  const handleClose = onBack || onClose;

  if (!email) {
    return null;
  }

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div
      className={
        isFullscreen
          ? "absolute inset-0 z-[100] flex flex-col overflow-hidden animate-fade-in"
          : "flex-1 flex flex-col overflow-hidden w-full h-full animate-fade-in"
      }
      style={{ backgroundColor: theme.cardBg }}
    >
      {/* HEADER ACTION TOOLBAR */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-2 border-b shrink-0"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleClose()}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
            title="Close"
          >
            {(readingPaneMode !== 'no_split' && !isFullscreen) || isFullscreen ? (
              <MdClose size={20} className="hidden md:block" />
            ) : null}
            <svg className={`w-5 h-5 ${((readingPaneMode !== 'no_split' && !isFullscreen) || isFullscreen) ? 'md:hidden' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          {readingPaneMode !== 'no_split' && (
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden md:flex p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Expand to Fullscreen"}
            >
              {isFullscreen ? <MdCloseFullscreen size={18} /> : <MdOpenInFull size={18} />}
            </button>
          )}
          
          <div className="h-5 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1" />

          <button
            onClick={() => {
              if (isActuallyArchived) {
                if (onUnarchive) onUnarchive(email.uid);
                else onArchive?.(email.uid);
              } else {
                onArchive?.(email.uid);
              }
            }}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 cursor-pointer"
            title={isActuallyArchived ? "Unarchive" : "Archive"}
          >
            {isActuallyArchived ? <MdUnarchive size={20} /> : <MdArchive size={20} />}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setShowSnooze(!showSnooze);
                setCustomSnooze(false);
                setShowLabels(false);
              }}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-blue-500 cursor-pointer"
              title="Snooze"
            >
              <MdAccessTime size={20} />
            </button>

            {showSnooze && (
              <div
                className="absolute left-0 mt-2 w-64 rounded-xl shadow-2xl z-30 border bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 overflow-hidden text-sm flex flex-col py-1.5 animate-fadeIn"
              >
                <div className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                  <span>Snooze until...</span>
                  <button 
                    onClick={() => { setShowSnooze(false); setCustomSnooze(false); }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                {customSnooze ? (
                  <div className="p-4 flex flex-col gap-3">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Select Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={customDateTime}
                      onChange={(e) => setCustomDateTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2 justify-end mt-2">
                      <button
                        onClick={() => setCustomSnooze(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          if (!customDateTime) {
                            alert("Please select a valid date and time.");
                            return;
                          }
                          const dateObj = new Date(customDateTime);
                          if (dateObj <= new Date()) {
                            alert("Please select a future date and time.");
                            return;
                          }
                          onSnooze?.(email.uid, dateObj.toISOString());
                          setShowSnooze(false);
                          setCustomSnooze(false);
                          if (onBack) onBack();
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {getSnoozeOptions().map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSnooze?.(email.uid, opt.time.toISOString());
                          setShowSnooze(false);
                          if (onBack) onBack();
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 truncate">
                          {opt.icon}
                          <span className="text-gray-800 dark:text-gray-200 font-medium truncate">{opt.label}</span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{opt.display}</span>
                      </button>
                    ))}

                    <div className="border-t border-gray-100 dark:border-neutral-800 my-1"></div>

                    <button
                      onClick={() => {
                        setCustomSnooze(true);
                        const defaultCustom = new Date();
                        defaultCustom.setMinutes(defaultCustom.getMinutes() - defaultCustom.getTimezoneOffset());
                        setCustomDateTime(defaultCustom.toISOString().slice(0, 16));
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center gap-3 cursor-pointer transition-colors text-blue-500 dark:text-blue-400 font-medium"
                    >
                      <MdDateRange size={18} />
                      <span>Select date & time</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowLabels(!showLabels); setShowSnooze(false); }}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-indigo-500 cursor-pointer"
              title="Labels"
            >
              <MdLabel size={20} />
            </button>
            {showLabels && (
              <div
                className="absolute left-0 mt-2 w-48 rounded-xl shadow-xl z-20 border overflow-hidden"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                {(() => {
                  const renderLabelDropdownTree = (parentId, depth = 0) => {
                    const children = labels.filter(l => l.parentId === parentId || (!l.parentId && parentId === null));
                    return children.map(l => (
                      <div key={l.id}>
                        <button
                          onClick={() => {
                            onApplyLabel?.(email.uid, l.id);
                            setShowLabels(false);
                          }}
                          className="w-full text-left py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center gap-2 cursor-pointer"
                          style={{ color: theme.text, paddingLeft: `${16 + (depth * 16)}px`, paddingRight: '16px' }}
                        >
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: l.colorHex }} />
                          <span className="text-sm truncate">{l.name}</span>
                        </button>
                        {renderLabelDropdownTree(l.id, depth + 1)}
                      </div>
                    ));
                  };
                  return renderLabelDropdownTree(null);
                })()}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onDelete?.(email.uid);
              handleClose();
            }}
            className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-gray-500 dark:text-gray-400 hover:text-red-500 cursor-pointer"
            title="Delete"
          >
            <MdDelete size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            title="Print"
          >
            <MdPrint size={20} />
          </button>
          
          <div className="relative">
            <button
              onClick={() => { setShowMoreOptions(!showMoreOptions); setShowLabels(false); setShowSnooze(false); }}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              title="More"
            >
              <MdMoreVert size={20} />
            </button>
            {showMoreOptions && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl z-30 border bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 overflow-hidden py-1.5"
              >
                <button
                  onClick={() => { onReply?.(email); setShowMoreOptions(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center gap-3 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <MdReply size={18} className="text-gray-500" />
                  <span className="text-sm font-medium">Reply</span>
                </button>
                <button
                  onClick={() => { setShowMoreOptions(false); /* onForward logic */ }}
                  className="w-full text-left px-4 py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center gap-3 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <MdForward size={18} className="text-gray-500" />
                  <span className="text-sm font-medium">Forward</span>
                </button>
                
                <div className="border-t border-gray-100 dark:border-neutral-800 my-1"></div>
                
                <button
                  onClick={() => { onDelete?.(email.uid); handleClose(); setShowMoreOptions(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 cursor-pointer text-red-600 dark:text-red-400 transition-colors"
                >
                  <MdDelete size={18} />
                  <span className="text-sm font-medium">Delete</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (mailAPI.toggleRead) {
                        await mailAPI.toggleRead(email.uid, false);
                        if (fetchEmails) fetchEmails(currentFolder || "inbox");
                      }
                      toast.success("Marked as unread");
                      handleClose();
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to mark unread");
                    }
                    setShowMoreOptions(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center gap-3 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <MdMarkEmailUnread size={18} className="text-gray-500" />
                  <span className="text-sm font-medium">Mark as unread</span>
                </button>
                
                <div className="border-t border-gray-100 dark:border-neutral-800 my-1"></div>
                
                <button
                  onClick={() => { handleUnsubscribeClick(); setShowMoreOptions(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center gap-3 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <MdBlock size={18} className="text-gray-500 shrink-0" />
                  <span className="text-sm font-medium truncate">Unsubscribe from {cleanSenderEmail || "sender"}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full text-left px-4 py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center gap-3 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <MdPrint size={18} className="text-gray-500" />
                  <span className="text-sm font-medium">Print</span>
                </button>
                <button
                  onClick={handleDownloadMessage}
                  className="w-full text-left px-4 py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center gap-3 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <MdFileDownload size={18} className="text-gray-500" />
                  <span className="text-sm font-medium">Download message</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onStar?.(email.uid)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer group"
            title={email.starred ? "Unstar" : "Star"}
          >
            <MdStar
              size={20}
              className={
                email.starred
                  ? "text-yellow-500 fill-current drop-shadow-sm"
                  : "text-gray-400 dark:text-gray-500 group-hover:text-yellow-500 transition-colors"
              }
            />
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-transparent">
        {/* SUBJECT */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <h1
            className="text-xl sm:text-2xl font-bold leading-tight tracking-tight"
            style={{ color: theme.text }}
          >
            {email.subject || "(No Subject)"}
          </h1>
          <div className="flex flex-wrap gap-2">
            {email.labels?.map((label) => (
              <span
                key={label.id}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm border border-black/5 dark:border-white/5 flex items-center gap-1.5"
                style={{ backgroundColor: label.colorHex }}
              >
                {label.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLabel(email.uid, label.id, getFolder());
                  }}
                  className="hover:bg-black/20 rounded-full p-0.5 transition-colors flex items-center justify-center"
                  title="Remove label"
                >
                  <MdClose size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* SENDER INFO */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-base shadow-sm shrink-0"
              style={{ backgroundColor: theme.accent || "#135bec" }}
            >
              {email.from?.split("@")[0]?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base flex flex-wrap items-center gap-x-2" style={{ color: theme.text }}>
                {email.from?.includes("<") ? (
                  <>
                    <span>{email.from.split("<")[0].replace(/^["']/g, "").replace(/["']$/g, "").trim()}</span>
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">&lt;{email.from.split("<")[1].split(">")[0]}&gt;</span>
                  </>
                ) : (
                  <span>{email.from}</span>
                )}
                {cleanSenderEmail && !isSystemEmail && (
                  <button
                    onClick={handleUnsubscribeClick}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline cursor-pointer bg-red-500/10 dark:bg-red-500/20 px-2 py-0.5 rounded transition-all select-none"
                    title="Unsubscribe from this sender"
                  >
                    Unsubscribe
                  </button>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                to <span className="font-medium text-gray-700 dark:text-gray-300">{email.to || "me"}</span>
              </p>
            </div>
          </div>

          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 self-start sm:self-center bg-black/[0.03] dark:bg-white/[0.04] px-2.5 py-1 rounded-full">
            {email.sentDate ? formatDate(email.sentDate) : email.receivedDate ? formatDate(email.receivedDate) : ""}
          </span>
        </div>

        {/* BODY */}
        <div className="max-w-none prose prose-slate dark:prose-invert prose-p:leading-relaxed text-[15px] leading-relaxed">
          {email.htmlBody ? (
            <div dangerouslySetInnerHTML={{ __html: email.htmlBody }} style={{ color: theme.text }} />
          ) : (
            <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200" style={{ color: theme.text }}>
              {email.body || email.textPlain || "(No content available)"}
            </p>
          )}
          {bounceDetails && (
            <div className="mt-8 p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-gray-800 font-mono text-xs whitespace-pre-wrap text-gray-600 dark:text-gray-400 overflow-x-auto">
              <h4 className="font-bold mb-2 text-gray-700 dark:text-gray-300 font-sans">Diagnostic Information & Original Message</h4>
              {bounceDetails.trim()}
            </div>
          )}
        </div>

        {/* ATTACHMENTS */}
        {email.attachments?.length > 0 && (
          <div className="mt-8 pt-6 border-t" style={{ borderColor: theme.border }}>
            <p className="text-xs font-bold mb-4 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Attachments ({email.attachments.length})
            </p>
            <div className="flex flex-wrap gap-4">
              {email.attachments.map((file, i) => {
                const fileInfo = getFileIcon(file);
                return (
                  <div
                    key={i}
                    className="w-[180px] h-[130px] rounded-xl border overflow-hidden flex flex-col hover:shadow-md transition-all relative shadow-sm bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                    style={{ borderColor: theme.border }}
                  >
                    {/* Upper preview / icon block */}
                    <div 
                      className="h-[85px] w-full flex flex-col items-center justify-center bg-black/[0.03] dark:bg-white/[0.03] border-b relative overflow-hidden"
                      style={{ borderColor: theme.border }}
                    >
                      {imagePreviews[file] ? (
                        <img 
                          src={imagePreviews[file]} 
                          alt={file} 
                          className="w-full h-full object-cover select-none" 
                        />
                      ) : (
                        <>
                          <span className="text-3xl filter drop-shadow-sm select-none">{fileInfo.icon}</span>
                          <span 
                            className="text-[9px] font-extrabold uppercase tracking-wider mt-1.5 px-2 py-0.5 rounded-full select-none"
                            style={{ backgroundColor: `${fileInfo.color}15`, color: fileInfo.color }}
                          >
                            {fileInfo.name}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Lower details block */}
                    <div className="p-2 flex items-center justify-between gap-1 flex-1 min-w-0">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span 
                          className="text-[11px] font-semibold truncate select-all text-left" 
                          style={{ color: theme.text }}
                          title={file}
                        >
                          {file}
                        </span>
                        <span className="text-[9px] opacity-50 font-medium select-none truncate text-left">
                          {fileInfo.name} File
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => handlePreviewAttachment(file)}
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                          title="Preview file"
                        >
                          <MdRemoveRedEye size={15} />
                        </button>
                        <button
                          onClick={() => handleDownloadAttachment(file)}
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                          title="Download file"
                        >
                          <MdFileDownload size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div
        className="flex items-center justify-between p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t shrink-0"
        style={{ borderColor: theme.border }}
      >
        <div className="flex gap-3">
          <button
            onClick={() => onReply?.(email)}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-full text-white font-medium shadow-sm hover:shadow hover:-translate-y-0.5 transition-all w-28 text-sm cursor-pointer"
            style={{ background: theme.accent || "#135bec" }}
          >
            <MdReply size={18} /> Reply
          </button>

          <button
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-full font-medium border hover:bg-black/5 dark:hover:bg-white/5 hover:shadow-sm transition-all text-sm w-28 cursor-pointer text-gray-700 dark:text-gray-200"
            style={{ borderColor: theme.border }}
          >
            <MdForward size={18} /> Forward
          </button>
        </div>

        {emailList && emailList.length > 0 && (
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">
              {emailList.findIndex(e => e.uid === email.uid) + 1} of {emailList.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const idx = emailList.findIndex(e => e.uid === email.uid);
                  if (idx > 0) onNavigate?.(emailList[idx - 1]);
                }}
                disabled={emailList.findIndex(e => e.uid === email.uid) <= 0}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <MdChevronLeft size={20} />
              </button>
              <button
                onClick={() => {
                  const idx = emailList.findIndex(e => e.uid === email.uid);
                  if (idx < emailList.length - 1 && idx !== -1) onNavigate?.(emailList[idx + 1]);
                }}
                disabled={emailList.findIndex(e => e.uid === email.uid) >= emailList.length - 1 || emailList.findIndex(e => e.uid === email.uid) === -1}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <MdChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* INLINE PREVIEW OVERLAY */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/90 z-[1000] flex flex-col animate-fade-in">
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 bg-black/30 border-b border-white/5 text-white select-none">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate max-w-[60vw]">
                {previewFile.fileName}
              </span>
              <span className="text-[10px] opacity-60">
                {previewFile.mimeType}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownloadAttachment(previewFile.fileName)}
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Download file"
              >
                <MdFileDownload size={20} />
              </button>
              <button
                onClick={closePreview}
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Close preview"
              >
                <MdClose size={20} />
              </button>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
            {previewFile.mimeType.startsWith("image/") ? (
              <img
                src={previewFile.blobUrl}
                alt={previewFile.fileName}
                className="max-w-full max-h-[82vh] object-contain rounded shadow-2xl select-none"
              />
            ) : previewFile.mimeType === "application/pdf" ? (
              <iframe
                src={previewFile.blobUrl}
                title={previewFile.fileName}
                className="w-[90vw] h-[80vh] rounded-lg shadow-2xl bg-white border-none"
              />
            ) : previewFile.mimeType === "text/plain" ? (
              <pre className="bg-zinc-950 text-zinc-100 p-6 rounded-xl shadow-2xl overflow-auto max-w-[90vw] max-h-[80vh] text-left font-mono text-xs sm:text-sm leading-relaxed border border-zinc-800 hidden-scrollbar">
                {previewFile.textContent}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center bg-zinc-900/60 text-white p-8 rounded-2xl border border-zinc-800 max-w-sm text-center shadow-xl">
                <span className="text-5xl mb-4 select-none">📎</span>
                <p className="font-semibold text-sm mb-1 truncate max-w-[280px]">{previewFile.fileName}</p>
                <p className="text-[11px] text-gray-400 mb-6">No inline preview available for this file type</p>
                <button
                  onClick={() => handleDownloadAttachment(previewFile.fileName)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MdFileDownload size={15} /> Download Attachment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailDetails;

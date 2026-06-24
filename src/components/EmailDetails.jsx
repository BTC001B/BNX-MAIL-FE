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
  MdClose
} from "react-icons/md";
import { useMail } from "../context/MailContext";
import { useTheme } from "../context/ThemeContext";
import { mailAPI } from "../services/api";
import toast from "react-hot-toast";

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
  onSnooze,
  onApplyLabel,
  onClose,
  isArchiveFolder = false,
}) => {
  const { theme } = useTheme();
  const { labels, handleRemoveLabel } = useMail();
  const [showLabels, setShowLabels] = useState(false);
  const [imagePreviews, setImagePreviews] = useState({});

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

  React.useEffect(() => {
    return () => {
      setPreviewFile((prev) => {
        if (prev) URL.revokeObjectURL(prev.blobUrl);
        return null;
      });
    };
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
      className="flex-1 flex flex-col overflow-hidden w-full h-full animate-fade-in"
      style={{ backgroundColor: theme.cardBg }}
    >
      {/* HEADER ACTION TOOLBAR */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-2 border-b shrink-0"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
            title="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="h-5 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1" />

          <button
            onClick={() => onArchive?.(email.uid)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 cursor-pointer"
            title={isArchiveFolder ? "Unarchive" : "Archive"}
          >
            {isArchiveFolder ? <MdUnarchive size={20} /> : <MdArchive size={20} />}
          </button>

          <button
            onClick={() => {
              const wakeUpAt = new Date();
              wakeUpAt.setDate(wakeUpAt.getDate() + 1);
              onSnooze?.(email.uid, wakeUpAt.toISOString());
            }}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-blue-500 cursor-pointer"
            title="Snooze"
          >
            <MdAccessTime size={20} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowLabels(!showLabels)}
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
              <p className="font-semibold text-sm sm:text-base" style={{ color: theme.text }}>
                {email.from?.includes("<") ? (
                  <>
                    {email.from.split("<")[0].replace(/^["']/g, "").replace(/["']$/g, "").trim()}{" "}
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">&lt;{email.from.split("<")[1].split(">")[0]}&gt;</span>
                  </>
                ) : (
                  email.from
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
              {email.body}
            </p>
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
        className="flex gap-3 p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t shrink-0"
        style={{ borderColor: theme.border }}
      >
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

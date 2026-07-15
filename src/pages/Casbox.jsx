import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useMail } from "../context/MailContext";
import { casboxAPI, api } from "../services/api";
import { MdCheck, MdDoneAll, MdStarBorder, MdStar, MdDeleteOutline, MdRefresh, MdSend, MdClose, MdRemoveRedEye, MdFileDownload, MdReply } from "react-icons/md";
import toast from "react-hot-toast";
import ReadingPaneLayout from "../components/ReadingPaneLayout";

const getMimeType = (fileName) => {
  const ext = fileName?.split('.').pop().toLowerCase() || '';
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
  const ext = fileName?.split('.').pop().toLowerCase() || '';
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

const Casbox = () => {
  const { theme, readingPaneMode } = useTheme();
  const { user } = useAuth();
  const { stompClient, isConnected } = useSocket();
  const { openCompose } = useMail();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMessage, setSelectedMessage] = useState(null);

  const [activeTab, setActiveTab] = useState('received');
  const [previewFile, setPreviewFile] = useState(null);

  React.useEffect(() => {
    return () => {
      setPreviewFile((prev) => {
        if (prev) URL.revokeObjectURL(prev.blobUrl);
        return null;
      });
    };
  }, [selectedMessage]);

  const closePreview = () => {
    setPreviewFile((prev) => {
      if (prev) URL.revokeObjectURL(prev.blobUrl);
      return null;
    });
  };

  const handleDownloadAttachment = async (fileObj) => {
    try {
      const fileName = fileObj.fileName || fileObj.name || (typeof fileObj === 'string' ? fileObj.split('/').pop() : "Attachment");
      const urlPath = fileObj.url || fileObj.filePath || (typeof fileObj === 'string' ? fileObj : "");
      if (!urlPath) return;

      toast.loading(`Downloading ${fileName}...`, { id: "download-casbox-attachment" });
      const res = await api.get(urlPath, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${fileName} downloaded successfully`, { id: "download-casbox-attachment" });
    } catch (err) {
      console.error("Failed to download attachment:", err);
      toast.error("Failed to download attachment", { id: "download-casbox-attachment" });
    }
  };

  const handlePreviewAttachment = async (fileObj) => {
    try {
      const fileName = fileObj.fileName || fileObj.name || (typeof fileObj === 'string' ? fileObj.split('/').pop() : "Attachment");
      const urlPath = fileObj.url || fileObj.filePath || (typeof fileObj === 'string' ? fileObj : "");
      if (!urlPath) return;

      toast.loading(`Loading preview...`, { id: "preview-casbox-attachment" });
      const res = await api.get(urlPath, { responseType: 'blob' });
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
        textContent,
        rawFileObj: fileObj
      });
      toast.success("Loaded preview", { id: "preview-casbox-attachment" });
    } catch (err) {
      console.error("Failed to preview attachment:", err);
      toast.error("Failed to preview attachment", { id: "preview-casbox-attachment" });
    }
  };

  useEffect(() => {
    fetchMessages();

    // Background auto-polling for new casbox messages every 30 seconds
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchMessages(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!stompClient || !isConnected) return;

    const messageSub = stompClient.subscribe('/user/queue/casbox/messages', (msg) => {
      const newMsg = JSON.parse(msg.body);
      setMessages(prev => [newMsg, ...prev]);
    });

    const statusSub = stompClient.subscribe('/user/queue/casbox/status', (msg) => {
      const updatedMsg = JSON.parse(msg.body);
      setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
    });

    casboxAPI.markAsDelivered().catch(console.error);

    return () => {
      messageSub.unsubscribe();
      statusSub.unsubscribe();
    };
  }, [stompClient, isConnected]);

  const fetchMessages = async (background = false) => {
    try {
      if (!background) setLoading(true);
      const res = await casboxAPI.getAllMessages();
      setMessages(res.data);
    } catch (err) {
      if (!background) toast.error("Failed to fetch messages");
    } finally {
      if (!background) setLoading(false);
    }
  };

  const handleSelectMessage = async (msg) => {
    setSelectedMessage(msg);
    if (msg.receiverEmail === user?.email && msg.status !== 'SEEN') {
      try {
        await casboxAPI.updateStatus({ messageIds: [msg.id], status: 'SEEN' });
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'SEEN' } : m));
        if (selectedMessage?.id === msg.id) {
          setSelectedMessage({ ...msg, status: 'SEEN' });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "sent") return <MdCheck size={16} className="text-gray-400" title="Sent" />;
    if (lowerStatus === "delivered") return <MdDoneAll size={16} className="text-gray-400" title="Delivered" />;
    if (lowerStatus === "seen") return <MdDoneAll size={16} className="text-blue-500" title="Seen" />;
    return null;
  };

  const parseTimestamp = (ts) => {
    if (!ts) return new Date();
    if (Array.isArray(ts)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = ts;
      return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    }
    if (typeof ts === 'string') {
      const str = ts.endsWith('Z') || ts.includes('+') ? ts : ts + 'Z';
      return new Date(str);
    }
    return new Date(ts);
  };

  const receivedMessages = messages.filter(msg => msg.receiverEmail === user?.email);
  const sentMessages = messages.filter(msg => msg.senderEmail === user?.email);
  const filteredMessages = activeTab === 'received' ? receivedMessages : sentMessages;

  const headerComponent = (
    <div className="flex flex-col shrink-0">
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 shrink-0 bg-transparent">
        <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-lg shrink-0">
          <button 
            onClick={() => { setActiveTab('received'); setSelectedMessage(null); }}
            className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'received' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Received <span className={`font-normal hidden sm:inline ${activeTab === 'received' ? 'opacity-80' : 'opacity-60'}`}>({receivedMessages.length})</span>
          </button>
          <button 
            onClick={() => { setActiveTab('sent'); setSelectedMessage(null); }}
            className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'sent' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Sent <span className={`font-normal hidden sm:inline ${activeTab === 'sent' ? 'opacity-80' : 'opacity-60'}`}>({sentMessages.length})</span>
          </button>
        </div>
        
        <div className="flex-1"></div>
        
        <button
          onClick={() => openCompose({ mode: 'casbox' })}
          className="px-4 py-1.5 rounded-full text-sm font-bold text-white transition-transform hover:shadow-md active:scale-95"
          style={{ backgroundColor: theme.accent || "#135bec" }}
        >
          Compose
        </button>
        <button
          onClick={fetchMessages}
          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 ml-1"
        >
          <MdRefresh size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );

  const listComponent = (
    <div className="flex-1 overflow-y-auto hidden-scrollbar relative bg-transparent">
      {filteredMessages.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600 opacity-80 pb-20">
          <MdSend className="text-4xl mb-3 opacity-30" />
          <p className="text-sm font-medium">No {activeTab} messages yet</p>
        </div>
      )}
      {filteredMessages.map((msg) => {
        const isMe = msg.senderEmail === user?.email;
        const isSelected = selectedMessage?.id === msg.id;
        return (
          <div
            key={msg.id}
            onClick={() => handleSelectMessage(msg)}
            className={`group flex items-center px-4 sm:px-6 py-2.5 sm:py-3 border-b border-gray-100 dark:border-gray-800/50 hover:shadow-sm transition-all cursor-pointer relative bg-white dark:bg-[#121212] ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'} ${!isMe && msg.status !== 'SEEN' ? 'font-bold' : ''}`}
          >
            {isSelected && (
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r bg-blue-500"></div>
            )}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0 mr-3 sm:mr-4">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer bg-transparent"
                readOnly
              />
              <button className="text-gray-400 hover:text-yellow-400 transition-colors">
                <MdStarBorder size={20} />
              </button>
            </div>

            <div className="w-36 sm:w-44 md:w-48 shrink-0 truncate pr-2">
              <span className={`text-sm ${!isMe && msg.status !== 'SEEN' ? 'font-extrabold text-gray-900 dark:text-white' : 'font-semibold text-gray-800 dark:text-gray-200'}`}>
                {isMe ? "Me" : msg.senderEmail.split('@')[0]}
              </span>
            </div>

            <div className="flex-1 min-w-0 flex items-baseline gap-2 truncate pr-4">
              <span className={`text-sm truncate ${!isMe && msg.status !== 'SEEN' ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-800 dark:text-gray-200'}`}>
                {msg.subject || (isMe ? `To: ${msg.receiverEmail}` : "")}
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-500 truncate font-normal">
                — {msg.body}
              </span>
            </div>

            <div className="shrink-0 mx-2 flex items-center justify-center w-6">
              {isMe && getStatusIcon(msg.status)}
            </div>

            <div className="shrink-0 w-20 sm:w-24 text-right">
              <span className={`text-xs sm:text-sm ${!isMe && msg.status !== 'SEEN' ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-500 dark:text-gray-400'}`}>
                {parseTimestamp(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-white via-white to-transparent dark:from-[#121212] dark:via-[#121212] dark:to-transparent pl-8 pr-2 py-1">
              <button className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 transition-colors">
                <MdDeleteOutline size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const detailsComponent = selectedMessage ? (
    <div className="flex flex-col h-full bg-white dark:bg-[#121212] border-l border-gray-100 dark:border-gray-800 overflow-y-auto hidden-scrollbar p-6 sm:p-8">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedMessage(null)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            title="Close"
          >
            <MdClose size={22} className="hidden md:block" />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {selectedMessage.subject || "Casbox Message"}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
          {selectedMessage.senderEmail.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-gray-900 dark:text-gray-100">{selectedMessage.senderEmail}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            To: {selectedMessage.receiverEmail}
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
          {parseTimestamp(selectedMessage.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      </div>
      <div className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
        {selectedMessage.body}
      </div>

      {selectedMessage.attachmentsJson && (
        <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
          <p className="text-xs font-bold mb-4 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Attachments
          </p>
          <div className="flex flex-wrap gap-4">
            {JSON.parse(selectedMessage.attachmentsJson).map((fileObj, i) => {
              const fileName = fileObj.fileName || fileObj.name || (typeof fileObj === 'string' ? fileObj.split('/').pop() : "Attachment");
              const fileInfo = getFileIcon(fileName);
              return (
                <div
                  key={i}
                  className="w-[180px] h-[130px] rounded-xl border overflow-hidden flex flex-col hover:shadow-md transition-all relative shadow-sm bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  style={{ borderColor: theme?.border || '#eee' }}
                >
                  <div 
                    className="h-[85px] w-full flex flex-col items-center justify-center bg-black/[0.03] dark:bg-white/[0.03] border-b relative overflow-hidden"
                    style={{ borderColor: theme?.border || '#eee' }}
                  >
                    <span className="text-3xl filter drop-shadow-sm select-none">{fileInfo.icon}</span>
                    <span 
                      className="text-[9px] font-extrabold uppercase tracking-wider mt-1.5 px-2 py-0.5 rounded-full select-none"
                      style={{ backgroundColor: `${fileInfo.color}15`, color: fileInfo.color }}
                    >
                      {fileInfo.name}
                    </span>
                  </div>

                  <div className="p-2 flex items-center justify-between gap-1 flex-1 min-w-0">
                    <div className="flex flex-col min-w-0 flex-1">
                      <span 
                        className="text-[11px] font-semibold truncate select-all text-left" 
                        style={{ color: theme?.text || '#333' }}
                        title={fileName}
                      >
                        {fileName}
                      </span>
                      <span className="text-[9px] opacity-50 font-medium select-none truncate text-left">
                        {fileInfo.name} File
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => handlePreviewAttachment(fileObj)}
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                        title="Preview file"
                      >
                        <MdRemoveRedEye size={15} />
                      </button>
                      <button
                        onClick={() => handleDownloadAttachment(fileObj)}
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

      {selectedMessage.receiverEmail === user?.email && (
        <div
          className="flex items-center py-4 mt-8 border-t shrink-0"
          style={{ borderColor: theme?.border || '#eee' }}
        >
          <button
            onClick={() => openCompose({ mode: 'casbox', replyTo: selectedMessage.senderEmail })}
            className="flex items-center justify-center gap-2 px-6 py-2 rounded-full text-white font-semibold shadow-sm hover:shadow hover:-translate-y-0.5 transition-all text-sm cursor-pointer"
            style={{ background: theme.accent || "#135bec" }}
          >
            <MdReply size={18} /> Reply
          </button>
        </div>
      )}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600 bg-gray-50/30 dark:bg-[#1e1e1e]/30 border-l border-gray-100 dark:border-gray-800">
      <MdSend className="text-6xl mb-4 opacity-50" />
      <p className="text-base font-medium">Select a message to read</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#121212] relative overflow-hidden">
      <ReadingPaneLayout
        mode={theme?.readingPaneMode || 'no_split'}
        hasSelection={!!selectedMessage}
        headerComponent={headerComponent}
        listComponent={listComponent}
        detailsComponent={detailsComponent}
      />

      {previewFile && (
        <div className="fixed inset-0 bg-black/90 z-[1000] flex flex-col animate-fade-in">
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
                onClick={() => handleDownloadAttachment(previewFile.rawFileObj)}
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
                  onClick={() => handleDownloadAttachment(previewFile.rawFileObj)}
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

export default Casbox;

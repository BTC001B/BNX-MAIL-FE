import React, { useState, useEffect } from 'react';
import { mailAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { MdCloudQueue, MdClose } from 'react-icons/md';

const StorageWidget = ({ isDesktopOpen }) => {
  const { theme } = useTheme();
  const [storageData, setStorageData] = useState({
    used: 0,
    limit: 5368709120, // default 5 GB
    percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const res = await mailAPI.getStorageQuota();
        if (res.data?.success && res.data?.data) {
          const used = res.data.data.storageUsed;
          const limit = 5368709120; // strictly 5 GB in frontend
          const percentage = limit > 0 ? (used / limit) * 100 : 0;
          setStorageData({
            used,
            limit,
            percentage
          });
        }
      } catch (err) {
        console.error("Failed to fetch storage quota", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStorage();
  }, []);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) return null;

  const handleWidgetClick = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      <a 
        href="/storage-management"
        onClick={handleWidgetClick}
        className={`px-4 py-3 mb-2 flex flex-col gap-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer block ${!isDesktopOpen ? 'items-center hide-on-collapse' : ''}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div className="flex items-center justify-between text-xs font-medium" style={{ color: theme.sidebarText || theme.text }}>
          <div className="flex items-center gap-1.5">
            <MdCloudQueue size={16} />
            <span className="hide-on-collapse">Storage</span>
          </div>
          <span className="hide-on-collapse opacity-70">
            {storageData.percentage.toFixed(0)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 hide-on-collapse overflow-hidden">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(storageData.percentage, 100)}%`, backgroundColor: storageData.percentage > 90 ? '#ef4444' : theme.accent || '#2563eb' }}
          ></div>
        </div>
        
        <div className="text-[11px] hide-on-collapse opacity-70" style={{ color: theme.sidebarText || theme.text }}>
          {formatSize(storageData.used)} of 1 GB used
        </div>
      </a>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 p-8 rounded-[24px] border border-gray-200 dark:border-gray-800 shadow-2xl max-w-4xl w-full mx-4 relative flex flex-col gap-6 text-gray-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              <MdClose size={20} />
            </button>

            {/* Header */}
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Upgrade Storage Plans</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose a plan that fits your storage and feature requirements.</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
              {/* Basic Plan */}
              <div className="flex flex-col items-center justify-between p-6 rounded-[20px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-950 text-center min-h-[300px] shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col items-center w-full">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Basic Storage</span>
                  <div className="flex items-baseline mt-4 mb-5">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">$1.99</span>
                    <span className="text-[10px] font-bold text-gray-405 ml-1">/mo</span>
                  </div>
                  <div className="space-y-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <p>50 GB total storage</p>
                    <p>Standard support</p>
                    <p>Ad-free Mail</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full mt-6 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all active:scale-[0.98]"
                >
                  Choose plan
                </button>
              </div>

              {/* Standard Plan */}
              <div 
                className="flex flex-col items-center justify-between p-6 rounded-[20px] border-2 text-center min-h-[300px] shadow-sm hover:shadow-md transition-all"
                style={{ 
                  borderColor: theme.accent || '#2563eb',
                  backgroundColor: theme.mode === 'dark' ? 'rgba(37, 99, 235, 0.05)' : 'rgba(37, 99, 235, 0.02)'
                }}
              >
                <div className="flex flex-col items-center w-full">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Standard</span>
                  <div className="flex items-baseline mt-4 mb-5">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">$2.99</span>
                    <span className="text-[10px] font-bold text-gray-405 ml-1">/mo</span>
                  </div>
                  <div className="space-y-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <p>200 GB total storage</p>
                    <p>Priority support</p>
                    <p>Ad-free Mail & Drive</p>
                    <p>Advanced security tools</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full mt-6 py-2 text-white rounded-xl text-xs font-extrabold hover:opacity-90 cursor-pointer transition-all active:scale-[0.98]"
                  style={{ backgroundColor: theme.accent || '#2563eb' }}
                >
                  Upgrade
                </button>
              </div>

              {/* Premium Plan */}
              <div className="flex flex-col items-center justify-between p-6 rounded-[20px] border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-950 text-center min-h-[300px] shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col items-center w-full">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Premium</span>
                  <div className="flex items-baseline mt-4 mb-5">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">$9.99</span>
                    <span className="text-[10px] font-bold text-gray-455 ml-1">/mo</span>
                  </div>
                  <div className="space-y-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <p>2 TB total storage</p>
                    <p>24/7 Phone & Email support</p>
                    <p>Full Suite premium access</p>
                    <p>Custom domain support</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full mt-6 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all active:scale-[0.98]"
                >
                  Choose plan
                </button>
              </div>
            </div>

            {/* Footer Link to full management page */}
            <div className="text-center mt-2">
              <a 
                href="/storage-management"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-bold hover:underline"
                style={{ color: theme.accent || '#2563eb' }}
              >
                Or manage your existing storage space
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StorageWidget;

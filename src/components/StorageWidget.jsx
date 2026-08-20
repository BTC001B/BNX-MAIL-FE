import React, { useState, useEffect } from 'react';
import { mailAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { MdCloudQueue } from 'react-icons/md';

const StorageWidget = ({ isDesktopOpen }) => {
  const { theme } = useTheme();
  const [storageData, setStorageData] = useState({
    used: 0,
    limit: 1073741824, // default 1 GB
    percentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const res = await mailAPI.getStorageQuota();
        if (res.data?.success && res.data?.data) {
          const used = res.data.data.storageUsed;
          const limit = 1073741824; // strictly 1 GB in frontend
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

  return (
    <a 
      href="/storage-management"
      target="_blank"
      rel="noopener noreferrer"
      className={`mx-3 mb-2 p-3.5 flex flex-col gap-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all cursor-pointer block ${!isDesktopOpen ? 'items-center justify-center p-2' : ''}`}
      style={{ 
        textDecoration: 'none', 
        color: 'inherit',
        backgroundColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#e9eef6',
        border: theme.mode === 'dark' ? `1px solid ${theme.border}` : 'none'
      }}
    >
      <div className="flex items-center justify-between w-full">
        {/* Left side: Icon + Storage Label */}
        <div className="flex items-center gap-2">
          <MdCloudQueue size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200 hide-on-collapse font-sans">
            Storage
          </span>
        </div>
        
        {/* Right side: Circular indicator + percentage */}
        <div className="flex items-center gap-2 hide-on-collapse">
          {/* Circular Progress Ring */}
          <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 transform -rotate-90">
              <circle
                cx="10"
                cy="10"
                r="7.5"
                className="stroke-blue-100 dark:stroke-neutral-800"
                strokeWidth="2"
                fill="transparent"
              />
              <circle
                cx="10"
                cy="10"
                r="7.5"
                className="stroke-blue-600 dark:stroke-blue-400"
                strokeWidth="2.5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 7.5}
                strokeDashoffset={2 * Math.PI * 7.5 * (1 - Math.min(storageData.percentage, 100) / 100)}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-[13px] font-bold text-blue-600 dark:text-blue-400">
            {storageData.percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      
      {/* Bottom text */}
      <div className="text-[12px] text-gray-600 dark:text-gray-400 font-medium pl-0.5 hide-on-collapse">
        {formatSize(storageData.used)} of 1 GB used
      </div>
    </a>
  );
};

export default StorageWidget;

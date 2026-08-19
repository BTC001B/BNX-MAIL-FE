import React, { useState, useEffect } from 'react';
import { mailAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { MdCloudQueue } from 'react-icons/md';

const StorageWidget = ({ isDesktopOpen }) => {
  const { theme } = useTheme();
  const [storageData, setStorageData] = useState({
    used: 0,
    limit: 5368709120, // default 5 GB
    percentage: 0
  });
  const [loading, setLoading] = useState(true);

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

  return (
    <a 
      href="/storage-management"
      target="_blank"
      rel="noopener noreferrer"
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
  );
};

export default StorageWidget;

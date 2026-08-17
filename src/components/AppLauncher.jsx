import React, { useState } from "react";
import { MdClose, MdEdit, MdAutoAwesome, MdRocketLaunch } from "react-icons/md";
import bnxLogo from "../assets/bnx-remove.png";
import b2authLogo from "../assets/auth2.png";
import bitToolLogo from "../assets/BIT-TOOL-2.png";
import cliksLogo from "../assets/cliks.png";
import cliksBusinessLogo from "../assets/cliks-business.png";

const AppLauncher = ({ onClose, onToggleBitToolSidebar }) => {
  const [activeTab, setActiveTab] = useState('BASE');
  const [activeTopTab, setActiveTopTab] = useState('FAVORITES');

  const [recentNames, setRecentNames] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('beta_launcher_recent_apps') || '[]');
    } catch (e) {
      return [];
    }
  });

  const publicApps = [
    { name: 'Cliks', icon: cliksLogo, href: 'https://cliks.beta-softnet.com' },
    { name: 'BNXmail', icon: bnxLogo, href: 'https://www.bnxmail.com' },
    { name: 'Bit-Tool', icon: bitToolLogo, isButton: true },
    { name: 'B2Auth', icon: b2authLogo, href: 'https://www.b2auth.com' }
  ];

  const businessApps = [
    { name: 'CliksBusiness', icon: cliksBusinessLogo, href: 'https://www.cliksbusiness.com' }
  ];

  const displayApps = activeTab === 'BASE' 
    ? [...publicApps, ...businessApps] 
    : activeTab === 'PUBLIC' 
      ? publicApps 
      : businessApps;

  const allApps = [...publicApps, ...businessApps];
  const resolvedRecentApps = recentNames
    .map(name => allApps.find(app => app.name === name))
    .filter(Boolean);

  const handleAppClick = (app) => {
    const appName = app.name;
    const updatedNames = [appName, ...recentNames.filter(name => name !== appName)].slice(0, 3);
    setRecentNames(updatedNames);
    localStorage.setItem('beta_launcher_recent_apps', JSON.stringify(updatedNames));

    if (app.isButton) {
      onToggleBitToolSidebar?.();
      onClose();
    } else {
      window.open(app.href, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
        <div
          className="flex items-center text-xl text-blue-900 tracking-tight font-bold"
          style={{
            fontFamily: "'Saira Stencil One', 'Anton', sans-serif",
          }}
        >
          BE<span style={{marginLeft:'1px'}}>TA</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors">
            <MdClose size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area (Fixed Height/Viewport fitting, No Scroll) */}
      <div className="flex-1 overflow-hidden p-3 flex flex-col justify-between">
        {/* Favorites & Recent Tabs Inside Card Container */}
        <div className="border border-gray-200 rounded-[20px] p-3 mb-0.5">
          <div className="flex items-center justify-center gap-4 mb-2 text-[9.5px] font-extrabold tracking-widest text-center">
            <button
              onClick={() => setActiveTopTab('FAVORITES')}
              className={`pb-0.5 transition-all border-b-2 ${
                activeTopTab === 'FAVORITES' 
                  ? 'border-emerald-700 text-emerald-700 font-bold' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              FAVORITES
            </button>
            <span className="text-gray-300 font-normal">|</span>
            <button
              onClick={() => setActiveTopTab('RECENT')}
              className={`pb-0.5 transition-all border-b-2 ${
                activeTopTab === 'RECENT' 
                  ? 'border-emerald-700 text-emerald-700 font-bold' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              RECENT
            </button>
          </div>

          <div className="border-b border-gray-100 mb-2.5 -mx-3" />

          {/* Fixed Height Wrapper to prevent layout shift between FAVORITES & RECENT */}
          <div className="w-full h-[96px] flex items-center justify-center">
            {activeTopTab === 'FAVORITES' ? (
              <div className="grid grid-cols-3 gap-y-2.5 w-full py-1 justify-items-center">
                {publicApps.map((app, idx) => (
                  <div 
                    key={idx} 
                    className="w-[62px] h-[45px] flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 hover:bg-slate-50/80 active:bg-slate-50 focus:bg-slate-50 border border-transparent hover:border-gray-100/70 rounded-[12px] p-0.5 outline-none" 
                    onClick={() => handleAppClick(app)}
                  >
                    <img src={app.icon} alt={app.name} className="w-7 h-7 object-contain" />
                    <span className="text-[9px] font-bold text-slate-700 mt-0.5">{app.name}</span>
                  </div>
                ))}
              </div>
            ) : resolvedRecentApps.length > 0 ? (
              <div className="grid grid-cols-3 gap-y-2.5 w-full py-1 justify-items-center">
                {resolvedRecentApps.map((app, idx) => (
                  <div 
                    key={idx} 
                    className="w-[62px] h-[45px] flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 hover:bg-slate-50/80 active:bg-slate-50 focus:bg-slate-50 border border-transparent hover:border-gray-100/70 rounded-[12px] p-0.5 outline-none" 
                    onClick={() => handleAppClick(app)}
                  >
                    <img src={app.icon} alt={app.name} className="w-7 h-7 object-contain" />
                    <span className="text-[9px] font-bold text-slate-700 mt-0.5">{app.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-full border border-dashed border-gray-200 rounded-[14px] flex items-center justify-center bg-transparent">
                <span className="text-[9px] font-bold text-gray-400">No recent apps</span>
              </div>
            )}
          </div>
        </div>

        {/* Separator / Gap */}
        <div className="h-1.5 shrink-0" />

        {/* Base Tab Row */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={() => setActiveTab('BASE')}
              className={`text-[11.5px] font-extrabold tracking-widest pb-0.5 border-b-2 transition-colors ${activeTab === 'BASE' ? 'text-slate-800 border-blue-900' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
              BASE
            </button>
            
            <div className="flex items-center gap-3 text-[9.5px] font-extrabold tracking-widest">
              <button 
                onClick={() => setActiveTab('PUBLIC')}
                className={`pb-0.5 border-b-2 transition-colors ${activeTab === 'PUBLIC' ? 'text-blue-900 border-blue-900' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
              >
                PUBLIC
              </button>
              <span className="text-gray-300 pb-0.5 font-normal">|</span>
              <button 
                onClick={() => setActiveTab('BUSINESS')}
                className={`pb-0.5 border-b-2 transition-colors ${activeTab === 'BUSINESS' ? 'text-blue-900 border-blue-900' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
              >
                BUSINESS
              </button>
            </div>
          </div>

          {/* Fixed Height Wrapper to prevent layout shift for different grid row counts */}
          <div className="h-[128px]">
            <div className="grid grid-cols-4 gap-x-2 gap-y-2">
              {displayApps.map((app, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleAppClick(app)}
                  className="w-[60px] h-[60px] border border-gray-100 rounded-[14px] flex flex-col items-center justify-center hover:border-gray-200 hover:shadow-md hover:bg-white bg-white cursor-pointer group transition-all p-1"
                >
                  <img src={app.icon} alt={app.name} className="w-6 h-6 object-contain mb-0.5" />
                  <span className="text-[9px] font-bold text-slate-700 text-center leading-tight truncate w-full px-0.5">
                    {app.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-1.5 pt-1.5 border-t border-gray-100 dark:border-gray-800">
          <h3 className="text-[8.5px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest mb-1 text-center">COMING SOON</h3>
          
          <style>{`
            @keyframes float {
              0% { transform: scale(1); }
              50% { transform: scale(1.02); }
              100% { transform: scale(1); }
            }
            @keyframes rotateGlow {
              0% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.2)); }
              50% { transform: rotate(180deg) scale(1.1); filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5)); }
              100% { transform: rotate(360deg) scale(1); filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.2)); }
            }
            @keyframes shimmer {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
            .coming-soon-card {
              animation: float 4s ease-in-out infinite;
            }
            .sparkle-icon {
              animation: rotateGlow 6s ease-in-out infinite;
            }
            .shimmer-text {
              background: linear-gradient(90deg, #1e293b 25%, #3b82f6 50%, #1e293b 75%);
              background-size: 200% auto;
              color: transparent;
              -webkit-background-clip: text;
              background-clip: text;
              animation: shimmer 4s linear infinite;
            }
            .dark .shimmer-text {
              background: linear-gradient(90deg, #f1f5f9 25%, #60a5fa 50%, #f1f5f9 75%);
              background-size: 200% auto;
              color: transparent;
              -webkit-background-clip: text;
              background-clip: text;
            }
          `}</style>

          {/* Animated Coming Soon Card */}
          <div className="coming-soon-card flex flex-col items-center text-center p-2 rounded-2xl border border-gray-100 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-900/10 backdrop-blur-sm select-none">
            {/* Sparkle Icon Container */}
            <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-0.5 shadow-inner">
              <MdAutoAwesome size={14} className="sparkle-icon" />
            </div>

            {/* Badge */}
            <div className="px-2 py-0.5 rounded-full text-[7px] font-extrabold tracking-widest bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mb-0.5 uppercase border border-blue-100/30 dark:border-blue-900/25">
              BETA LABS RELEASE
            </div>

            {/* COMING SOON Text */}
            <h4 className="text-[11px] font-black tracking-widest mb-0.5 uppercase shimmer-text">
              COMING SOON
            </h4>

            {/* Subtitle */}
            <p className="text-[9px] text-gray-500 dark:text-gray-400 font-medium px-1 leading-normal">
              Building the next generation of Beta applications.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50/50 py-2.5 text-center border-t border-gray-100 shrink-0 rounded-b-[24px]">
        <span className="text-[8px] font-extrabold text-gray-400 tracking-[0.2em]">BETA ECOSYSTEM • FUTURE READY</span>
      </div>
    </div>
  );
};

export default AppLauncher;

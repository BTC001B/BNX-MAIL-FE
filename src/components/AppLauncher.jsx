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

  return (
    <div className="flex flex-col h-full bg-white w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 shrink-0">
        <div
          className="flex items-center text-lg text-blue-900 tracking-tight font-bold"
          style={{
            fontFamily: "'Saira Stencil One', 'Anton', sans-serif",
          }}
        >
          BE<span style={{marginLeft:'1px'}}>TA</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors">
            <MdClose size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area (Fixed Height/Viewport fitting, No Scroll) */}
      <div className="flex-1 overflow-hidden p-3.5 flex flex-col justify-between">
        {/* Favorites & Recent Tabs */}
        <div>
          <div className="flex items-center w-full mb-2">
            <button
              onClick={() => setActiveTopTab('FAVORITES')}
              className={`flex-1 pb-1 border-b-2 transition-all ${
                activeTopTab === 'FAVORITES' 
                  ? 'border-slate-700 text-slate-700' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <h3 className="text-[9.5px] font-extrabold tracking-widest text-center">FAVORITES</h3>
            </button>
            <button
              onClick={() => setActiveTopTab('RECENT')}
              className={`flex-1 pb-1 border-b-2 transition-all ${
                activeTopTab === 'RECENT' 
                  ? 'border-slate-700 text-slate-700' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <h3 className="text-[9.5px] font-extrabold tracking-widest text-center">RECENT VIEW</h3>
            </button>
          </div>

          {/* Fixed Height Wrapper to prevent layout shift between FAVORITES & RECENT */}
          <div className="w-full h-[64px] flex items-center justify-center">
            {activeTopTab === 'FAVORITES' ? (
              <div className="grid grid-cols-4 gap-2.5">
                {publicApps.map((app, idx) => (
                  <div 
                    key={idx} 
                    className="w-[54px] h-[54px] border border-gray-100 rounded-[14px] flex flex-col items-center justify-center hover:border-gray-200 hover:shadow-md cursor-pointer transition-all" 
                    onClick={app.isButton ? () => { onToggleBitToolSidebar?.(); onClose(); } : () => window.open(app.href, '_blank')}
                  >
                    <img src={app.icon} alt={app.name} className="w-6.5 h-6.5 object-contain mb-0.5" />
                    <span className="text-[9px] font-bold text-slate-700">{app.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-full border border-dashed border-gray-200 rounded-[14px] flex items-center justify-center bg-transparent">
                <span className="text-[9.5px] font-bold text-gray-400">No recents</span>
              </div>
            )}
          </div>
        </div>

        {/* Separator / Gap */}
        <div className="h-3 shrink-0" />

        {/* Base Tab Row */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <button 
              onClick={() => setActiveTab('BASE')}
              className={`text-[10px] font-extrabold tracking-widest pb-0.5 border-b-2 transition-colors ${activeTab === 'BASE' ? 'text-slate-700 border-slate-700' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
              BASE
            </button>
            
            <div className="flex items-center gap-2.5 text-[9.5px] font-extrabold tracking-widest">
              <button 
                onClick={() => setActiveTab('PUBLIC')}
                className={`pb-0.5 border-b-2 transition-colors ${activeTab === 'PUBLIC' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
              >
                PUBLIC
              </button>
              <span className="text-gray-300 pb-0.5 font-normal">|</span>
              <button 
                onClick={() => setActiveTab('BUSINESS')}
                className={`pb-0.5 border-b-2 transition-colors ${activeTab === 'BUSINESS' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
              >
                BUSINESS
              </button>
            </div>
          </div>

          {/* Fixed Height Wrapper to prevent layout shift for different grid row counts */}
          <div className="h-[118px]">
            <div className="grid grid-cols-4 gap-x-2 gap-y-2.5">
              {displayApps.map((app, idx) => (
                <div 
                  key={idx}
                  onClick={app.isButton ? () => { onToggleBitToolSidebar?.(); onClose(); } : () => window.open(app.href, '_blank')}
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                >
                  <div className="w-[40px] h-[40px] rounded-[12px] bg-[#fafafa] border border-gray-100 flex items-center justify-center group-hover:shadow-md group-hover:border-gray-200 group-hover:bg-white transition-all">
                    <img src={app.icon} alt={app.name} className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
                    {app.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-2.5 pt-2.5 border-t border-gray-100 dark:border-gray-800">
          <h3 className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest mb-1.5 text-center">COMING SOON</h3>
          
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
            @keyframes rocketSlide {
              0% { opacity: 0.7; transform: translateX(-2px); }
              50% { opacity: 1; transform: translateX(2px); }
              100% { opacity: 0.7; transform: translateX(-2px); }
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
            .rocket-line {
              animation: rocketSlide 4s ease-in-out infinite;
            }
          `}</style>

          {/* Animated Coming Soon Card */}
          <div className="coming-soon-card flex flex-col items-center text-center p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-900/10 backdrop-blur-sm select-none">
            {/* Sparkle Icon Container */}
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1 shadow-inner">
              <MdAutoAwesome size={16} className="sparkle-icon" />
            </div>

            {/* Badge */}
            <div className="px-2 py-0.5 rounded-full text-[8px] font-extrabold tracking-widest bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mb-1 uppercase border border-blue-100/30 dark:border-blue-900/25">
              BETA LABS RELEASE
            </div>

            {/* COMING SOON Text */}
            <h4 className="text-xs font-black tracking-widest mb-0.5 uppercase shimmer-text">
              COMING SOON
            </h4>

            {/* Subtitle */}
            <p className="text-[9px] text-gray-500 dark:text-gray-400 font-medium px-1 leading-normal mb-1">
              Building the next generation of Beta applications.
            </p>

            {/* Divider Line */}
            <div className="w-full border-t border-gray-100/80 dark:border-gray-800/40 my-1.5" />

            {/* Rocket Line */}
            <div className="rocket-line flex items-center gap-1 text-[8.5px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">
              <MdRocketLaunch size={10} className="shrink-0" />
              <span>New innovations arriving soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50/50 py-2.5 text-center border-t border-gray-100 shrink-0 rounded-b-[24px]">
        <span className="text-[8px] font-extrabold text-gray-400 tracking-[0.2em]">BETA ECO-SYSTEM • FUTURE READY</span>
      </div>
    </div>
  );
};

export default AppLauncher;

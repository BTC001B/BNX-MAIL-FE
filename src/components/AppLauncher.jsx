import React, { useState } from "react";
import { MdClose, MdEdit, MdAutoAwesome, MdRocketLaunch } from "react-icons/md";
import bnxLogo from "../assets/bnx-remove.png";
import b2authLogo from "../assets/auth2.png";
import bitToolLogo from "../assets/BIT-TOOL-2.png";
import cliksLogo from "../assets/cliks.png";
import cliksBusinessLogo from "../assets/cliks-business.png";

const AppLauncher = ({ onClose, onToggleBitToolSidebar, onEdit }) => {
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
    { name: 'Bit-Tool', icon: bitToolLogo, href: 'https://bit-tool.com/' },
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
      <div className="flex items-center justify-between pt-4 pb-2 px-6 border-b border-gray-100 shrink-0 relative">
        <div
          className="flex items-center text-[24px] text-[#0f53c9] font-black tracking-tighter"
          style={{
            fontFamily: "'Saira Stencil One', 'Anton', sans-serif",
            position: 'absolute',
            top: '5px',
            left: '16px'
          }}
        >
          BE<span style={{ marginLeft: '0.5px' }}>TA</span>
        </div>
        
        {/* Spacer to push flex items to the right */}
        <div className="w-16 h-1 shrink-0" />

        <div className="flex items-center gap-2 ml-auto">
          {/* Edit button */}
          <button 
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1 border border-gray-250 rounded-[10px] text-[11px] font-extrabold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm bg-white cursor-pointer"
          >
            <MdEdit size={13} className="text-gray-500" />
            <span>Edit</span>
          </button>
          
          {/* Close button */}
          <button 
            onClick={onClose} 
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 transition-colors border border-gray-150 cursor-pointer"
          >
            <MdClose size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area (Fixed Height/Viewport fitting, No Scroll) */}
      <div className="flex-1 overflow-hidden px-6 py-2 flex flex-col justify-between">
        {/* Favorites & Recent Tabs Inside Card Container */}
        <div className="border border-gray-200/90 rounded-[18px] p-3 mt-2 mb-0.5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
          <div className="flex items-center justify-center gap-7 mb-2 text-[10px] font-[900] tracking-widest text-center">
            <button
              onClick={() => setActiveTopTab('FAVORITES')}
              className={`pb-1 transition-all border-b-2 ${activeTopTab === 'FAVORITES'
                  ? 'border-emerald-700 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-650'
                }`}
            >
              FAVORITES
            </button>
            <span className="text-gray-300 font-normal pb-1">|</span>
            <button
              onClick={() => setActiveTopTab('RECENT')}
              className={`pb-1 transition-all border-b-2 ${activeTopTab === 'RECENT'
                  ? 'border-emerald-700 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-650'
                }`}
            >
              RECENT
            </button>
          </div>

          <div className="border-b border-gray-100 mb-3 -mx-3" />

          {/* Fixed Height Wrapper to prevent layout shift between FAVORITES & RECENT */}
          <div className="w-full h-[104px] flex items-center justify-center">
            {activeTopTab === 'FAVORITES' ? (
              <div className="grid grid-cols-3 gap-x-4 gap-y-2 w-full py-0.5 justify-items-center">
                {publicApps.map((app, idx) => (
                  <div
                    key={idx}
                    className="w-[64px] h-[48px] flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 hover:bg-slate-50/60 hover:border-gray-100/60 border border-transparent rounded-[10px] p-0.5 outline-none"
                    onClick={() => handleAppClick(app)}
                  >
                    <img src={app.icon} alt={app.name} className="w-[24px] h-[24px] object-contain" />
                    <span className="text-[9px] font-extrabold text-slate-800 mt-0.5 tracking-wide">{app.name}</span>
                  </div>
                ))}
              </div>
            ) : resolvedRecentApps.length > 0 ? (
              <div className="grid grid-cols-3 gap-x-4 gap-y-2 w-full py-0.5 justify-items-center">
                {resolvedRecentApps.map((app, idx) => (
                  <div
                    key={idx}
                    className="w-[64px] h-[48px] flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 hover:bg-slate-50/60 hover:border-gray-100/60 border border-transparent rounded-[10px] p-0.5 outline-none"
                    onClick={() => handleAppClick(app)}
                  >
                    <img src={app.icon} alt={app.name} className="w-[24px] h-[24px] object-contain" />
                    <span className="text-[9px] font-extrabold text-slate-800 mt-0.5 tracking-wide">{app.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-full border border-dashed border-gray-200 rounded-[12px] flex items-center justify-center bg-transparent">
                <span className="text-[9px] font-bold text-gray-400">No recent apps</span>
              </div>
            )}
          </div>
        </div>

        {/* Separator / Gap */}
        <div className="h-2 shrink-0" />

        {/* Base Tab Row */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <button
              onClick={() => setActiveTab('BASE')}
              className={`text-[12px] font-[900] tracking-widest pb-0.5 border-b-[3px] transition-colors ${activeTab === 'BASE' ? 'text-slate-800 border-[#0f53c9]' : 'text-slate-400 border-transparent hover:text-slate-650'}`}
            >
              BASE
            </button>

            <div className="flex items-center gap-3 text-[9px] font-extrabold tracking-widest">
              <button
                onClick={() => setActiveTab('PUBLIC')}
                className={`transition-colors ${activeTab === 'PUBLIC' ? 'text-[#0f53c9]' : 'text-slate-400 hover:text-slate-650'}`}
              >
                PUBLIC
              </button>
              <span className="text-gray-300 font-normal">|</span>
              <button
                onClick={() => setActiveTab('BUSINESS')}
                className={`transition-colors ${activeTab === 'BUSINESS' ? 'text-[#0f53c9]' : 'text-slate-400 hover:text-slate-650'}`}
              >
                BUSINESS
              </button>
            </div>
          </div>

          {/* Fixed Height Wrapper to prevent layout shift for different grid row counts */}
          <div className="h-[128px]">
            <div className="grid grid-cols-4 gap-2">
              {displayApps.map((app, idx) => (
                <div
                  key={idx}
                  onClick={() => handleAppClick(app)}
                  className="w-[62px] h-[60px] border border-gray-100/90 rounded-[12px] flex flex-col items-center justify-center hover:border-gray-200 hover:shadow-sm hover:bg-white bg-white cursor-pointer group transition-all p-1 shadow-[0_1px_2px_rgba(0,0,0,0.015)]"
                >
                  <img src={app.icon} alt={app.name} className="w-[24px] h-[24px] object-contain mb-0.5" />
                  <span className="text-[9px] font-extrabold text-slate-800 text-center leading-tight truncate w-full px-0.5">
                    {app.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-3 relative">
          <style>{`
            @keyframes floatCard {
              0% { transform: scale(1); }
              50% { transform: scale(1.008); }
              100% { transform: scale(1); }
            }
            @keyframes floatLogo {
              0% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-2px) scale(1.06); }
              100% { transform: translateY(0px) scale(1); }
            }
            @keyframes pulseGlow {
              0% { box-shadow: 0 0 4px rgba(59, 130, 246, 0.12); }
              50% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.35); }
              100% { box-shadow: 0 0 4px rgba(59, 130, 246, 0.12); }
            }
            .coming-soon-card {
              animation: floatCard 4s ease-in-out infinite;
            }
            .bnx-logo-anim {
              animation: floatLogo 3s ease-in-out infinite;
            }
            .glow-circle {
              animation: pulseGlow 3s ease-in-out infinite;
            }
          `}</style>

          {/* Animated Coming Soon Card */}
          <div className="coming-soon-card flex flex-col items-center text-center pt-5 pb-3 px-3 rounded-[18px] border border-gray-150 bg-slate-50/25 select-none relative shadow-[0_1px_6px_rgba(0,0,0,0.01)]">
            
            {/* Overlapping BNX Logo Animation Circle (Placed inside the card for proper relative stacking) */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border border-gray-200/90 flex items-center justify-center shadow-sm z-10 glow-circle">
              <div className="w-6.5 h-6.5 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
                <img 
                  src={bnxLogo} 
                  alt="BNX Logo Animation" 
                  className="w-[18px] h-[18px] object-contain bnx-logo-anim" 
                />
              </div>
            </div>

            {/* Badge */}
            <div className="px-2 py-0.5 rounded-full text-[7px] font-[900] tracking-widest bg-indigo-50 text-indigo-600 uppercase border border-indigo-100/50 mb-0.5 mt-0.5">
              BETA LABS RELEASE
            </div>

            {/* COMING SOON Text */}
            <h4 className="text-[10px] font-[950] tracking-widest text-[#9333ea] mb-0.5 uppercase">
              COMING SOON
            </h4>

            {/* Subtitle */}
            <p className="text-[8.5px] text-slate-500 font-extrabold px-4 leading-normal">
              Building the next generation of Beta applications.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white py-2.5 text-center border-t border-gray-100 shrink-0 rounded-b-[24px]">
        <span className="text-[8px] font-[900] text-slate-400 tracking-[0.18em]">BETA ECOSYSTEM · FUTURE READY</span>
      </div>
    </div>
  );
};

export default AppLauncher;

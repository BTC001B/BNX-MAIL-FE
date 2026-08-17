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
    <div className="flex flex-col h-full bg-white w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
        {/* <div className="flex items-center text-xl text-blue-900 tracking-tight" style={{fontFamily:'Saira Stencil One',fontWeight:'900'}}>BETA</div> */}
        <div
          className="flex items-center text-xl text-blue-900 tracking-tight font-bold"
          style={{
            fontFamily: "'Saira Stencil One', 'Anton', sans-serif",
          }}
        >
          BE<span style={{marginLeft:'1px'}}>TA</span>
        </div>
        <div className="flex items-center gap-3">
          {/* <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <MdEdit size={14} /> Edit
          </button> */}
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors">
            <MdClose size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar" style={{scrollbarWidth:'none'}}>
        {/* Favorites & Recent Tabs */}
        <div className="mb-8">
          <div className="flex items-center w-full mb-4">
            <button
              onClick={() => setActiveTopTab('FAVORITES')}
              className={`flex-1 pb-2 border-b-2 transition-all ${
                activeTopTab === 'FAVORITES' 
                  ? 'border-slate-700 text-slate-700' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <h3 className="text-[11px] font-extrabold tracking-widest text-center">FAVORITES</h3>
            </button>
            <button
              onClick={() => setActiveTopTab('RECENT')}
              className={`flex-1 pb-2 border-b-2 transition-all ${
                activeTopTab === 'RECENT' 
                  ? 'border-slate-700 text-slate-700' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <h3 className="text-[11px] font-extrabold tracking-widest text-center">RECENT VIEW</h3>
            </button>
          </div>

          <div className="w-full">
            {activeTopTab === 'FAVORITES' ? (
              <div className="flex justify-center py-2">
                <div className="grid grid-cols-4 gap-4">
                  {publicApps.map((app, idx) => (
                    <div 
                      key={idx} 
                      className="w-[72px] h-[72px] border-gray-100 rounded-[18px] flex flex-col items-center justify-center hover:border-gray-200 hover:shadow-md cursor-pointer transition-all" 
                      onClick={app.isButton ? () => { onToggleBitToolSidebar?.(); onClose(); } : () => window.open(app.href, '_blank')}
                    >
                      <img src={app.icon} alt={app.name} className="w-10 h-10 object-contain mb-1.5" />
                      <span className="text-[10px] font-bold text-slate-700">{app.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-2xl flex items-center justify-center bg-transparent min-h-[100px]">
                <span className="text-[11px] font-bold text-gray-400">No recents</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setActiveTab('BASE')}
            className={`text-[13px] font-extrabold tracking-widest pb-1.5 border-b-2 transition-colors ${activeTab === 'BASE' ? 'text-slate-700 border-slate-700' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
          >
            BASE
          </button>
          
          <div className="flex items-center gap-3 text-[11px] font-extrabold tracking-widest">
            <button 
              onClick={() => setActiveTab('PUBLIC')}
              className={`pb-1.5 border-b-2 transition-colors ${activeTab === 'PUBLIC' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
              PUBLIC
            </button>
            <span className="text-gray-300 pb-1.5 font-normal">|</span>
            <button 
              onClick={() => setActiveTab('BUSINESS')}
              className={`pb-1.5 border-b-2 transition-colors ${activeTab === 'BUSINESS' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
              BUSINESS
            </button>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-4 gap-x-2 gap-y-4">
          {displayApps.map((app, idx) => (
            <div 
              key={idx}
              onClick={app.isButton ? () => { onToggleBitToolSidebar?.(); onClose(); } : () => window.open(app.href, '_blank')}
              className="flex flex-col items-center gap-2 cursor-pointer group"
            >
              <div className="w-[50px] h-[50px] rounded-[16px] bg-[#fafafa] border border-gray-100 flex items-center justify-center group-hover:shadow-md group-hover:border-gray-200 group-hover:bg-white transition-all">
                <img src={app.icon} alt={app.name} className="w-8 h-8 object-contain" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
                {app.name}
              </span>
            </div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <h3 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest mb-4 text-center">COMING SOON</h3>
          
          <style>{`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-4px); }
              100% { transform: translateY(0px); }
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
              animation: float 5s ease-in-out infinite;
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
          <div className="coming-soon-card flex flex-col items-center text-center p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-900/10 backdrop-blur-sm select-none">
            {/* Sparkle Icon Container */}
            <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-inner">
              <MdAutoAwesome size={22} className="sparkle-icon" />
            </div>

            {/* Badge */}
            <div className="px-3 py-0.5 rounded-full text-[9px] font-extrabold tracking-widest bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mb-2.5 uppercase border border-blue-100/30 dark:border-blue-900/25">
              BETA LABS RELEASE
            </div>

            {/* COMING SOON Text */}
            <h4 className="text-base font-black tracking-widest mb-1.5 uppercase shimmer-text">
              COMING SOON
            </h4>

            {/* Subtitle */}
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium px-2 leading-relaxed">
              Building the next generation of Beta applications.
            </p>

            {/* Divider Line */}
            <div className="w-full border-t border-gray-100/80 dark:border-gray-800/40 my-3.5" />

            {/* Rocket Line */}
            <div className="rocket-line flex items-center gap-1.5 text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">
              <MdRocketLaunch size={13} className="shrink-0" />
              <span>New innovations arriving soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50/50 py-4 text-center border-t border-gray-100 shrink-0 rounded-b-[24px]">
        <span className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em]">BETA ECO-SYSTEM • FUTURE READY</span>
      </div>
    </div>
  );
};

export default AppLauncher;

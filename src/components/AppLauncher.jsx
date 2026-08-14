import React, { useState } from "react";
import { MdClose, MdEdit } from "react-icons/md";
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
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-[11px] font-extrabold text-slate-700 tracking-widest mb-4 text-center">COMING SOON</h3>
          {/* <div className="grid grid-cols-4 gap-x-2 gap-y-4">
            {[
              { color: 'bg-purple-50', icon: 'text-purple-400' },
              { color: 'bg-red-50', icon: 'text-red-400' },
              { color: 'bg-blue-50', icon: 'text-blue-400' },
              { color: 'bg-green-50', icon: 'text-green-400' },
              { color: 'bg-orange-50', icon: 'text-orange-400' },
              { color: 'bg-pink-50', icon: 'text-pink-400' },
              { color: 'bg-indigo-50', icon: 'text-indigo-400' },
              { color: 'bg-teal-50', icon: 'text-teal-400' },
            ].map((style, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center cursor-not-allowed">
                <div className={`w-[50px] h-[50px] rounded-[16px] ${style.color} flex items-center justify-center opacity-70`}>
                  <div className={`w-6 h-6 rounded-md ${style.icon} opacity-50 bg-current`}></div>
                </div>
              </div>
            ))}
          </div> */}
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

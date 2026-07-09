import React from 'react';

const StatusBar = ({ light = false }) => {
  const textColor = light ? 'text-white' : 'text-black';
  
  return (
    <div className={`w-full h-7 flex items-center justify-between px-6 ${textColor}`}>
      {/* 时间 */}
      <div className="text-xs font-semibold">9:41</div>

      {/* 中间 - 刘海屏区域 */}
      <div className="flex-1"></div>

      {/* 右侧状态图标 */}
      <div className="flex items-center gap-1">
        {/* 信号强度 */}
        <svg width="15" height="10" viewBox="0 0 15 10" fill="currentColor">
          <rect x="0" y="6" width="2.5" height="4" rx="0.5"/>
          <rect x="4" y="4" width="2.5" height="6" rx="0.5"/>
          <rect x="8" y="2" width="2.5" height="8" rx="0.5"/>
          <rect x="12" y="0" width="2.5" height="10" rx="0.5"/>
        </svg>

        {/* WiFi */}
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M6 7.5a0.8 0.8 0 100 1.6 0.8 0.8 0 000-1.6z" fill="currentColor" stroke="none"/>
          <path d="M3.8 5.8a3.2 3.2 0 014.4 0" strokeLinecap="round"/>
          <path d="M1.5 3.5a6 6 0 019 0" strokeLinecap="round"/>
        </svg>

        {/* 电池 */}
        <svg width="20" height="10" viewBox="0 0 20 10" fill="currentColor">
          <rect x="0.5" y="0.5" width="16" height="9" rx="1.5" stroke="currentColor" strokeWidth="0.8" fill="none"/>
          <rect x="2" y="2" width="10" height="6" rx="0.8" fill="currentColor"/>
          <path d="M17.5 3v4a1.2 1.2 0 000-4z"/>
        </svg>
      </div>
    </div>
  );
};

export default StatusBar;

import React from 'react';

const TopNav = ({ onSearchClick, onNotificationClick, onMoreClick, onScanClick }) => {
  return (
    <div
      className="w-full"
      style={{ background: 'linear-gradient(180deg, #181C26 0%, #BC000F 100%)' }}
    >
      {/* 导航栏 */}
      <div className="h-[80px] flex items-center justify-between px-4 pt-[20px]">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-white text-[20px] font-bold italic">San</span>
          <span className="text-white text-[20px] font-medium">VIST</span>
        </div>

        {/* 搜索框 */}
        <div
          className="flex-1 mx-4 h-[32px] bg-white/20 rounded-full flex items-center px-3 cursor-pointer"
          onClick={onSearchClick}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <circle cx="7" cy="7" r="5.5" stroke="white" strokeOpacity="0.7"/>
            <path d="M11 11L14 14" stroke="white" strokeOpacity="0.7" strokeLinecap="round"/>
          </svg>
          <span className="text-white/70 text-[12px] flex-1">搜索</span>
          {/* 扫码图标在搜索框内 */}
          <div className="cursor-pointer" onClick={onScanClick}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 6V2H6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2H16V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 12V16H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 16H2V12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="5" y="5" width="3" height="3" fill="white"/>
              <rect x="10" y="5" width="3" height="3" fill="white"/>
              <rect x="5" y="10" width="3" height="3" fill="white"/>
              <rect x="10" y="10" width="3" height="3" fill="white"/>
            </svg>
          </div>
        </div>

        {/* 功能按钮 */}
        <div className="flex items-center gap-3">
          {/* 通知 */}
          <div className="relative cursor-pointer" onClick={onNotificationClick}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 7C15 5.67392 14.4732 4.40215 13.5355 3.46447C12.5979 2.52678 11.3261 2 10 2C8.67392 2 7.40215 2.52678 6.46447 3.46447C5.52678 4.40215 5 5.67392 5 7C5 12 2 14 2 14H18C18 14 15 12 15 7Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.45 17C11.3034 17.3031 11.0808 17.5547 10.7953 17.7134C10.5099 17.8721 10.1795 17.9299 9.85999 17.8768C9.54048 17.8237 9.24651 17.6629 9.01999 17.42C8.79347 17.1771 8.64845 16.8669 8.61499 16.53" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="absolute -top-1 -right-1 w-[16px] h-[16px] bg-brand-red rounded-full flex items-center justify-center">
              <span className="text-white text-[9px] font-medium">3</span>
            </div>
          </div>

          {/* 更多 */}
          <div className="cursor-pointer" onClick={onMoreClick}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="4" r="1.5" fill="white"/>
              <circle cx="10" cy="10" r="1.5" fill="white"/>
              <circle cx="10" cy="16" r="1.5" fill="white"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;

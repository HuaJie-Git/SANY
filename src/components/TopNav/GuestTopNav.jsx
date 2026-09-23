import React from 'react';

const GuestTopNav = ({ onLoginClick, onSearchClick, onScanClick, onNotificationClick, onAddClick, notificationCount = 0 }) => {
  return (
    <header className="flex h-[58px] w-full items-center gap-2 px-4 pb-2 pt-1 text-white" dir="auto">
      {/* 登录入口：协调字号与小巧箭头 (参考 IMG-001) */}
      <button
        type="button"
        className="flex flex-shrink-0 items-center gap-1 rounded-lg py-1.5 pr-0.5 text-white active:opacity-75 transition-opacity"
        onClick={onLoginClick}
        aria-label="登录或注册"
      >
        <span className="max-w-[90px] truncate text-[16px] font-semibold tracking-tight leading-none">登录</span>
        <svg className="flex-shrink-0 rtl:rotate-180 opacity-90" width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true">
          <path d="M1 1.5L5.5 6L1 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* 搜索胶囊：高度收敛至 34px，精致内嵌搜索与扫码 */}
      <div className="flex h-[34px] min-w-0 flex-1 items-center rounded-full bg-black/35 shadow-inner">
        <button
          type="button"
          className="flex h-full min-w-0 flex-1 items-center gap-2 pl-3 pr-1 text-left rtl:text-right active:opacity-75 transition-opacity"
          onClick={onSearchClick}
          aria-label="搜索"
        >
          <svg className="flex-shrink-0 opacity-80" width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M10.8 10.8L14.2 14.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span className="truncate text-[13px] font-normal text-white/85">搜索</span>
        </button>
        <button
          type="button"
          className="flex h-[34px] w-8 flex-shrink-0 items-center justify-center rounded-full active:opacity-70 transition-opacity"
          onClick={onScanClick}
          aria-label="扫码"
        >
          <svg className="opacity-90" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* 消息中心通知入口：在扫码后面，对齐正式环境 */}
      <button
        type="button"
        className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white/95 active:scale-90 active:opacity-75 transition-all"
        onClick={onNotificationClick}
        aria-label="消息中心"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 7C15 5.67392 14.4732 4.40215 13.5355 3.46447C12.5979 2.52678 11.3261 2 10 2C8.67392 2 7.40215 2.52678 6.46447 3.46447C5.52678 4.40215 5 5.67392 5 7C5 12 2 14 2 14H18C18 14 15 12 15 7Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11.45 17C11.3034 17.3031 11.0808 17.5547 10.7953 17.7134C10.5099 17.8721 10.1795 17.9299 9.85999 17.8768C9.54048 17.8237 9.24651 17.6629 9.01999 17.42C8.79347 17.1771 8.64845 16.8669 8.61499 16.53" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {notificationCount > 0 && (
          <div className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 bg-[#E60012] rounded-full flex items-center justify-center border border-black/20 shadow-xs">
            <span className="text-white text-[9px] font-medium leading-none">{notificationCount > 99 ? '99+' : notificationCount}</span>
          </div>
        )}
      </button>

      {/* 右侧添加入口：收缩至协调的 22px 视觉尺寸，保留舒适点击热区 */}
      <button
        type="button"
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white/95 active:scale-90 active:opacity-75 transition-all"
        onClick={onAddClick}
        aria-label="添加"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M12 7.5v9M7.5 12h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>
    </header>
  );
};

export default GuestTopNav;

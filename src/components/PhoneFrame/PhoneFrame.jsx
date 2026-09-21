import React from 'react';
import { ExperienceNotice, ExperienceServiceRail, FeedbackFloatingButton, LoginPrompt } from '../ExperienceMode/ExperienceMode';

const PhoneFrame = ({ topNav, bottomNav, children, hideGradient = false, headerBackground, floatingButton, statusBarTheme = 'light', statusTime = '9:41', showStatusProfile = false, batteryPercent, hideStatusBar = false, contentRoundedTop = false, onLogin, onFeedback, onInquiry, showFeedback = false, showServiceRail = false, showLoginPrompt = false, onCloseLogin, showExperienceNotice = false }) => {
  const statusColor = statusBarTheme === 'dark' ? '#222831' : '#FFFFFF';
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      {/* iPhone 手机框 */}
      <div className="relative">
        {/* 手机外壳 */}
        <div className="w-[393px] h-[852px] bg-black rounded-[55px] p-[12px] shadow-2xl">
          {/* 屏幕 */}
          <div className="w-full h-full bg-white rounded-[43px] overflow-hidden relative flex flex-col [transform:translateZ(0)]">
            {/* 顶部区域 - 整体渐变：底部红色往上渐变成黑色 */}
            <div className="flex-shrink-0 relative z-20" style={hideGradient ? (headerBackground ? { background: headerBackground } : {}) : { background: headerBackground || 'linear-gradient(180deg, #000000 0%, #BC000F 100%)' }}>
              {/* 状态栏 */}
              {!hideStatusBar && <div className="w-full h-[44px] flex items-center justify-between px-7 pt-1" style={{ color: statusColor }}>
                {/* 时间 */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-semibold tracking-tight" style={statusBarTheme === 'dark' ? {} : { textShadow: '0 0 2px rgba(255,255,255,0.8)' }}>{statusTime}</span>
                  {showStatusProfile && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill={statusColor} aria-label="用户">
                      <circle cx="6" cy="3.25" r="2.25"/>
                      <path d="M2 10.5c.15-2.4 1.5-3.6 4-3.6s3.85 1.2 4 3.6H2Z"/>
                    </svg>
                  )}
                </div>

                {/* 中间 - 留白区域 */}
                <div className="flex-1"></div>

                {/* 右侧状态图标 */}
                <div className="flex items-center gap-1.5">
                  {/* 信号强度 */}
                  <svg width="15" height="10" viewBox="0 0 15 10" fill={statusColor} className="flex-shrink-0">
                    <rect x="0" y="6" width="2.5" height="4" rx="0.5"/>
                    <rect x="4" y="4" width="2.5" height="6" rx="0.5"/>
                    <rect x="8" y="2" width="2.5" height="8" rx="0.5"/>
                    <rect x="12" y="0" width="2.5" height="10" rx="0.5"/>
                  </svg>

                  {/* WiFi */}
                  <svg width="20" height="14" viewBox="0 0 12 9" fill="none" stroke={statusColor} strokeWidth="1.5" className="flex-shrink-0">
                    <path d="M6 7.5a0.8 0.8 0 100 1.6 0.8 0.8 0 000-1.6z" fill={statusColor} stroke="none"/>
                    <path d="M3.8 5.8a3.2 3.2 0 014.4 0" strokeLinecap="round"/>
                    <path d="M1.5 3.5a6 6 0 019 0" strokeLinecap="round"/>
                  </svg>

                  {/* 电池 */}
                  {batteryPercent ? (
                    <div className={`relative ml-0.5 flex h-[14px] min-w-[25px] items-center justify-center rounded-[4px] px-1 text-[9px] font-bold leading-none ${
                      statusBarTheme === 'dark' ? 'border border-[#222831] text-[#222831] bg-transparent' : 'bg-white text-[#242832]'
                    }`}>
                      {batteryPercent}
                      <span className={`absolute -right-[2.5px] h-1.5 w-[2px] rounded-r-sm ${
                        statusBarTheme === 'dark' ? 'bg-[#222831]' : 'bg-white/60'
                      }`} />
                    </div>
                  ) : (
                    <svg width="20" height="10" viewBox="0 0 20 10" fill={statusColor}>
                      <rect x="0.5" y="0.5" width="16" height="9" rx="1.5" stroke={statusColor} strokeWidth="0.8" fill="none"/>
                      <rect x="2" y="2" width="10" height="6" rx="0.8" fill={statusColor}/>
                      <path d="M17.5 3v4a1.2 1.2 0 000-4z"/>
                    </svg>
                  )}
                </div>
              </div>}

              {/* 顶部导航栏 - 继承同一个渐变背景 */}
              {topNav}
            </div>

            {/* 中间内容区域 - 可滚动 */}
            <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative ${contentRoundedTop ? 'relative z-10 -mt-px rounded-t-[18px]' : ''}`}>
              {children}
            </div>

            {/* 底部导航栏 - 固定 */}
            <div className="flex-shrink-0">
              {bottomNav}
            </div>

            {/* 悬浮按钮 - 在手机框内，底部导航上方，不随内容滚动 */}
            {floatingButton && (
              <div className="absolute bottom-[84px] right-4 z-40">
                {floatingButton}
              </div>
            )}
            {showServiceRail && <ExperienceServiceRail onCustomerVoice={onFeedback} onInquiry={onInquiry} />}
            {showFeedback && !showServiceRail && <FeedbackFloatingButton onClick={onFeedback} />}
            {showExperienceNotice && (
              <div className={`absolute inset-x-0 z-[55] ${bottomNav ? 'bottom-[70px]' : 'bottom-4'}`}>
                <ExperienceNotice onLogin={() => onLogin?.('prompt')} />
              </div>
            )}
            <LoginPrompt visible={showLoginPrompt} onClose={onCloseLogin} onLogin={onLogin} />
          </div>
        </div>

        {/* 手机按钮装饰 */}
        {/* 左侧静音键 */}
        <div className="absolute left-[-2px] top-[140px] w-[3px] h-[30px] bg-gray-700 rounded-l"></div>

        {/* 左侧音量+ */}
        <div className="absolute left-[-2px] top-[190px] w-[3px] h-[50px] bg-gray-700 rounded-l"></div>

        {/* 左侧音量- */}
        <div className="absolute left-[-2px] top-[250px] w-[3px] h-[50px] bg-gray-700 rounded-l"></div>

        {/* 右侧电源键 */}
        <div className="absolute right-[-2px] top-[200px] w-[3px] h-[70px] bg-gray-700 rounded-r"></div>
      </div>
    </div>
  );
};

export default PhoneFrame;

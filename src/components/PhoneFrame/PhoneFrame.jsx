import React from 'react';

const PhoneFrame = ({ topNav, bottomNav, children, hideGradient = false, floatingButton, statusBarTheme = 'light' }) => {
  const statusColor = statusBarTheme === 'dark' ? '#222831' : '#FFFFFF';

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      {/* iPhone 手机框 */}
      <div className="relative">
        {/* 手机外壳 */}
        <div className="w-[393px] h-[852px] bg-black rounded-[55px] p-[12px] shadow-2xl">
          {/* 屏幕 */}
          <div className="w-full h-full bg-white rounded-[43px] overflow-hidden relative flex flex-col">
            {/* 顶部区域 - 整体渐变：底部红色往上渐变成黑色 */}
            <div className="flex-shrink-0" style={hideGradient ? {} : { background: 'linear-gradient(180deg, #000000 0%, #BC000F 100%)' }}>
              {/* 状态栏 */}
              <div className="w-full h-7 flex items-center justify-between px-6" style={{ color: statusColor }}>
                {/* 时间 */}
                <div className="text-xs font-semibold" style={{ textShadow: '0 0 2px rgba(255,255,255,0.8)' }}>9:41</div>

                {/* 中间 - 刘海屏区域 */}
                <div className="flex-1"></div>

                {/* 右侧状态图标 - 高亮白色 */}
                <div className="flex items-center gap-1">
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
                  <svg width="20" height="10" viewBox="0 0 20 10" fill={statusColor}>
                    <rect x="0.5" y="0.5" width="16" height="9" rx="1.5" stroke={statusColor} strokeWidth="0.8" fill="none"/>
                    <rect x="2" y="2" width="10" height="6" rx="0.8" fill={statusColor}/>
                    <path d="M17.5 3v4a1.2 1.2 0 000-4z"/>
                  </svg>
                </div>
              </div>

              {/* 顶部导航栏 - 继承同一个渐变背景 */}
              {topNav}
            </div>

            {/* 中间内容区域 - 可滚动 */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
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

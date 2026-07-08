import React from 'react';

const PhoneFrame = ({ topNav, bottomNav, children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      {/* iPhone 手机框 */}
      <div className="relative">
        {/* 手机外壳 */}
        <div className="w-[393px] h-[852px] bg-black rounded-[55px] p-[12px] shadow-2xl">
          {/* 屏幕 */}
          <div className="w-full h-full bg-white rounded-[43px] overflow-hidden relative flex flex-col">
            {/* 顶部导航栏 - 固定 */}
            <div className="flex-shrink-0">
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

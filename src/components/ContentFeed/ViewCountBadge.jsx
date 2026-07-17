import React from 'react';

// 统一浏览量徽标 - 放在图片左下角
// 黑色半透明底 + 圆角 + backdrop blur，亮暗图均清晰
// 只展示眼睛图标 + 格式化数字，兼容多语言，不包含文字
// 0 views 也正常显示（不因 falsy 隐藏）
const ViewCountBadge = ({ views }) => (
  <div className="absolute bottom-2 left-2 z-[1] flex items-center gap-1 bg-black/55 backdrop-blur-sm rounded-full pl-2 pr-2.5 py-1">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-90 flex-shrink-0">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
    <span className="text-[11px] text-white/90 whitespace-nowrap">{(views ?? 0).toLocaleString()}</span>
  </div>
);

export default ViewCountBadge;

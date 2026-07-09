import React, { useState, useRef, useEffect } from 'react';

const QuickAccess = ({ onNavigate }) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const scrollRef = useRef(null);

  // 三一品牌颜色
  const sanyColors = {
    red: '#E60012',
    dark: '#181C26',
    orange: '#FF7316',
  };

  const firstScreenItems = [
    { id: 1, name: '我要配件', icon: '配件', color: '#FF6B6B' },
    { id: 2, name: '我要召请', icon: '召请', color: '#4ECDC4' },
    { id: 3, name: '设备保养', icon: '保养', color: '#45B7D1' },
    { id: 4, name: '产品中心', icon: '产品', color: '#96CEB4' },
    { id: 5, name: '机群报表', icon: '报表', color: '#FFEAA7', isHalfHidden: true },
  ];

  const secondScreenItems = [
    { id: 5, name: '机群报表', icon: '报表', color: '#FFEAA7' },
    { id: 6, name: '维修助手', icon: '维修', color: '#DDA0DD' },
    { id: 7, name: '考勤管理', icon: '考勤', color: '#98D8C8' },
    { id: 8, name: '服务中心', icon: '服务', color: '#F7DC6F' },
    { id: 9, name: '三一新闻', icon: '新闻', color: '#BB8FCE' },
    { id: 10, name: '网点分布', icon: '网点', color: '#85C1E9' },
    { id: 11, name: '自助服务', icon: '自助', color: '#82E0AA' },
    { id: 12, name: '调研问卷', icon: '问卷', color: '#F8C471' },
    { id: 13, name: '客户心声', icon: '心声', color: '#D7BDE2' },
    { id: 14, name: '全部应用', icon: '全部', color: '#AED6F1', isFixed: true },
  ];

  // 动态高度计算
  const firstScreenHeight = 96; // 第一屏高度
  const secondScreenHeight = 180; // 第二屏高度
  const currentHeight = currentScreen === 0 ? firstScreenHeight : secondScreenHeight;

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const screenWidth = 343;
      const newScreen = Math.round(scrollLeft / screenWidth);
      setCurrentScreen(newScreen);
    }
  };

  // 需要手机号验证的功能列表
  const phoneRequiredFunctions = ['我要配件', '我要召请', '设备保养'];

  // 处理功能点击
  const handleFunctionClick = (itemName) => {
    // 检查是否是需要手机号验证的功能
    if (phoneRequiredFunctions.includes(itemName)) {
      // 跳转到对应的功能页面
      // 在功能页面里会检查手机号并显示弹窗
      switch (itemName) {
        case '我要配件':
          onNavigate && onNavigate('parts');
          break;
        case '我要召请':
          onNavigate && onNavigate('service');
          break;
        case '设备保养':
          onNavigate && onNavigate('maintenance');
          break;
        default:
          break;
      }
    } else {
      // 其他功能，可以在这里处理
      console.log(`跳转到: ${itemName}`);
    }
  };

  const renderIcon = (iconName) => {
    const iconSize = 24;

    const getIcon = (name) => {
      switch (name) {
        case '配件':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <path d="M7 8h10M7 12h6M7 16h8" stroke="#181C26" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
              <path d="M17 15l2 2M17 17l2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          );
        case '召请':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <path d="M8 12h8M12 8v8" stroke="#181C26" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
              <path d="M17 16h2M18 15v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          );
        case '保养':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <path d="M8 8h8v8H8z" stroke="#181C26" strokeWidth="2"/>
              <path d="M12 11v2M11 12h2" stroke="#181C26" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
              <path d="M17 15l2 2M17 17l2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          );
        case '产品':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <circle cx="12" cy="12" r="4" stroke="#181C26" strokeWidth="2"/>
              <circle cx="12" cy="12" r="1" fill="#FF7316"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
              <path d="M17 15l2 2M17 17l2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          );
        case '报表':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <rect x="6" y="12" width="3" height="6" fill="#181C26"/>
              <rect x="10.5" y="8" width="3" height="10" fill="#FF7316"/>
              <rect x="15" y="10" width="3" height="8" fill="#E60012"/>
            </svg>
          );
        case '维修':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <path d="M8 8l8 8M16 8l-8 8" stroke="#181C26" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
              <path d="M17 15l2 2M17 17l2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          );
        case '考勤':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <circle cx="12" cy="12" r="5" stroke="#181C26" strokeWidth="2"/>
              <path d="M12 9v3l2 2" stroke="#181C26" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
              <path d="M17 15l2 2M17 17l2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          );
        case '服务':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <circle cx="12" cy="8" r="3" stroke="#181C26" strokeWidth="2"/>
              <path d="M6 18v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#181C26" strokeWidth="2"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
              <path d="M17 15l2 2M17 17l2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          );
        case '新闻':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <path d="M7 7h10M7 11h10M7 15h6" stroke="#181C26" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
              <path d="M17 15l2 2M17 17l2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          );
        case '网点':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="#181C26" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="2" fill="#FF7316"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
              <path d="M17 15l2 2M17 17l2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          );
        case '自助':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <rect x="6" y="6" width="12" height="8" rx="1" stroke="#181C26" strokeWidth="2"/>
              <path d="M9 18v2M15 18v2" stroke="#181C26" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
              <path d="M17 15l2 2M17 17l2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          );
        case '问卷':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <path d="M8 8h8M8 12h6M8 16h4" stroke="#181C26" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
              <path d="M17 15l2 2M17 17l2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          );
        case '心声':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <path d="M12 6c-2.5 0-4.5 2-4.5 4.5 0 4.5 4.5 7.5 4.5 7.5s4.5-3 4.5-7.5c0-2.5-2-4.5-4.5-4.5z" stroke="#E60012" strokeWidth="2" fill="#E60012"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
              <path d="M17 15l2 2M17 17l2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          );
        case '全部':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <rect x="6" y="6" width="5" height="5" rx="1" fill="#181C26"/>
              <rect x="13" y="6" width="5" height="5" rx="1" fill="#E60012"/>
              <rect x="6" y="13" width="5" height="5" rx="1" fill="#E60012"/>
              <rect x="13" y="13" width="5" height="5" rx="1" fill="#181C26"/>
            </svg>
          );
        default:
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <circle cx="12" cy="12" r="4" stroke="#181C26" strokeWidth="2"/>
            </svg>
          );
      }
    };

    return (
      <div className="w-[56px] h-[56px] bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
        {getIcon(iconName)}
      </div>
    );
  };

  return (
    <div className="relative px-4 pt-3 pb-1 bg-white">
      {/* 横向滚动区域 - 动态高度 */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto"
        style={{
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          height: `${currentHeight}px`,
          transition: 'height 0.3s ease'
        }}
        onScroll={handleScroll}
      >
        {/* 第一屏 - 5个图标，第5个半隐藏 */}
        <div className="flex-shrink-0 w-[343px] overflow-hidden" style={{ scrollSnapAlign: 'start' }}>
          <div className="flex" style={{ gap: '12px' }}>
            {firstScreenItems.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col items-center flex-shrink-0 ${item.isHalfHidden ? 'opacity-60' : ''}`}
                style={{ width: '64px' }}
                onClick={() => handleFunctionClick(item.name)}
              >
                {renderIcon(item.icon)}
                <span className="text-[11px] text-text-primary mt-1 text-center">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 第二屏 - 两行图标 */}
        <div className="flex-shrink-0 w-[343px]" style={{ scrollSnapAlign: 'start' }}>
          {/* 第一行 */}
          <div className="flex justify-between mb-2">
            {secondScreenItems.slice(0, 5).map((item) => (
              <div key={item.id} className="flex flex-col items-center" style={{ width: '68px' }}>
                {renderIcon(item.icon)}
                <span className="text-[11px] text-text-primary mt-1 text-center">{item.name}</span>
              </div>
            ))}
          </div>
          {/* 第二行 */}
          <div className="flex justify-between">
            {secondScreenItems.slice(5, 10).map((item) => (
              <div key={item.id} className="flex flex-col items-center" style={{ width: '68px' }}>
                {renderIcon(item.icon)}
                <span className="text-[11px] text-text-primary mt-1 text-center">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 滚动点 */}
      <div className="flex justify-center gap-1.5 mt-1">
        <div className={`w-[6px] h-[6px] rounded-full transition-colors ${currentScreen === 0 ? 'bg-brand-red' : 'bg-gray-300'}`}></div>
        <div className={`w-[6px] h-[6px] rounded-full transition-colors ${currentScreen === 1 ? 'bg-brand-red' : 'bg-gray-300'}`}></div>
      </div>
    </div>
  );
};

export default QuickAccess;

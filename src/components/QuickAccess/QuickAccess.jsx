import React, { useState, useRef } from 'react';

const LOGIN_REQUIRED_NAMES = [
  '我要召请',
  '我要配件',
  '设备保养',
  '机群报表',
  '检查',
  '重卡车队运营',
  '三一认证二手机',
  '吊臂计算',
  '三一新闻',
  '绑定设备',
];

const QuickAccess = ({
  onNavigate,
  onUnavailable,
  primaryItems,
  applications = [],
  _showInquiryShortcut = false,
  demoMode = false,
  onRequireLogin,
}) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const scrollRef = useRef(null);

  const guestFirstScreenItems = [
    { id: 'guest-inquiry', name: '我要询价', icon: '询价', color: '#FFE3D6', target: 'inquiry', badge: 'hot' },
    { id: 'guest-voice', name: '客户心声', icon: '心声', color: '#D7BDE2', target: 'feedback' },
    { id: 'guest-service', name: '服务中心', icon: '服务', color: '#F7DC6F', target: 'serviceCenter' },
    { id: 'guest-survey', name: '调研问卷', icon: '问卷', color: '#F8C471', target: 'survey' },
    { id: 'guest-products', name: '产品中心', icon: '产品', color: '#96CEB4', target: 'productCenter', isHalfHidden: true },
  ];

  const defaultFirstScreenItems = [
    { id: 'default-inquiry', name: '我要询价', icon: '询价', color: '#FFE3D6', target: 'inquiry', badge: 'hot' },
    { id: 1, name: '我要配件', icon: '配件', color: '#FF6B6B' },
    { id: 2, name: '我要召请', icon: '召请', color: '#4ECDC4' },
    { id: 3, name: '设备保养', icon: '保养', color: '#45B7D1' },
    { id: 4, name: '产品中心', icon: '产品', color: '#96CEB4', isHalfHidden: true },
  ];
  const shortcutOverrides = {
    assets: { name: '产品中心', icon: '产品', color: '#96CEB4', target: 'productCenter' },
  };
  const baseFirstScreenItems = primaryItems?.length
    ? primaryItems
    : applications.length
      ? applications.slice(0, 5).map((app, index) => ({
          ...app,
          ...shortcutOverrides[app.id],
          isHalfHidden: index === 4,
        }))
      : defaultFirstScreenItems;
  const firstScreenItems = demoMode ? guestFirstScreenItems : baseFirstScreenItems;

  const defaultSecondScreenItems = [
    { id: 'app-inquiry', name: '我要询价', icon: '询价', color: '#FFE3D6', target: 'inquiry', badge: 'hot' },
    { id: 5, name: '机群报表', icon: '报表', color: '#FFEAA7' },
    { id: 'app-check', name: '检查', icon: '检查', color: '#48C9B0' },
    { id: 'app-fleet', name: '重卡车队运营', icon: '车队', color: '#5DADE2' },
    { id: 'app-used', name: '三一认证二手机', icon: '二手机', color: '#F5B041' },
    { id: 'app-crane', name: '吊臂计算', icon: '计算', color: '#EB984E' },
    { id: 9, name: '三一新闻', icon: '新闻', color: '#BB8FCE' },
    { id: 'app-bind', name: '绑定设备', icon: '绑定', color: '#58D68D' },
    { id: 8, name: '服务中心', icon: '服务', color: '#F7DC6F' },
    { id: 12, name: '调研问卷', icon: '问卷', color: '#F8C471' },
    { id: 13, name: '客户心声', icon: '心声', color: '#D7BDE2' },
    { id: 14, name: '全部应用', icon: '全部', color: '#AED6F1', isFixed: true },
  ];

  const guestSecondScreenItems = [
    { id: 'app-parts', name: '我要配件', icon: '配件', color: '#FF6B6B' },
    { id: 'app-service-req', name: '我要召请', icon: '召请', color: '#4ECDC4' },
    { id: 'app-maint', name: '设备保养', icon: '保养', color: '#45B7D1' },
    { id: 'app-report', name: '机群报表', icon: '报表', color: '#FFEAA7' },
    { id: 'app-check', name: '检查', icon: '检查', color: '#48C9B0' },
    { id: 'app-fleet', name: '重卡车队运营', icon: '车队', color: '#5DADE2' },
    { id: 'app-used', name: '三一认证二手机', icon: '二手机', color: '#F5B041' },
    { id: 'app-crane', name: '吊臂计算', icon: '计算', color: '#EB984E' },
    { id: 'app-news', name: '三一新闻', icon: '新闻', color: '#BB8FCE' },
    { id: 'app-bind', name: '绑定设备', icon: '绑定', color: '#58D68D' },
    { id: 'app-all', name: '全部应用', icon: '全部', color: '#AED6F1', isFixed: true },
  ];

  const secondScreenItems = demoMode ? guestSecondScreenItems : defaultSecondScreenItems;

  // 动态高度计算
  const firstScreenHeight = 96; // 第一屏高度
  const secondScreenHeight = Math.ceil(secondScreenItems.length / 5) * 88; // 第二屏高度
  const currentHeight = currentScreen === 0 ? firstScreenHeight : secondScreenHeight;

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const screenWidth = 343;
      const newScreen = Math.round(scrollLeft / screenWidth);
      setCurrentScreen(newScreen);
    }
  };

  // 处理功能点击
  const handleFunctionClick = (item) => {
    if (item.id === 'all-applications' || item.id === 'app-all' || item.name === '全部应用') {
      onNavigate?.({ target: 'allApps' });
      return;
    }

    const itemName = item.name;

    // 游客/体验模式：登录拦截（我要召请、我要配件、设备保养、机群报表、检查、重卡车队运营、三一认证二手机、吊臂计算、三一新闻、绑定设备）
    if (demoMode && LOGIN_REQUIRED_NAMES.includes(itemName)) {
      onRequireLogin?.(itemName);
      return;
    }

    // 可直接访问数据的功能：我要询价、产品中心、服务中心、客户心声、调研问卷
    if (itemName === '我要询价' || item.target === 'inquiry') {
      onNavigate?.({ target: 'inquiry', app: item });
      return;
    }
    if (itemName === '产品中心') {
      onNavigate?.({ target: 'productCenter', item });
      return;
    }
    if (itemName === '服务中心') {
      onNavigate?.({ target: 'serviceCenter', item });
      return;
    }
    if (itemName === '客户心声') {
      onNavigate?.({ target: 'feedback', item });
      return;
    }
    if (itemName === '调研问卷') {
      onNavigate?.({ target: 'survey', item });
      return;
    }

    if (item.target) {
      onNavigate?.({ target: item.target, app: item });
      return;
    }

    if (itemName === '机群报表') {
      onNavigate?.({ target: 'usageReport', item });
      return;
    }
    if (itemName === '三一新闻') {
      onNavigate?.({ target: 'content', item });
      return;
    }
    if (itemName === '绑定设备') {
      onNavigate?.({ target: 'bindDevice', item });
      return;
    }
    if (itemName === '我要配件') {
      onNavigate?.('parts');
      return;
    }
    if (itemName === '我要召请') {
      onNavigate?.('service');
      return;
    }
    if (itemName === '设备保养') {
      onNavigate?.('maintenance');
      return;
    }

    onUnavailable?.(item);
  };

  const renderIcon = (iconName, badge = null) => {
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
        case '询价':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="#181C26" strokeWidth="2" />
              <path d="M7 9h10M7 13h6" stroke="#181C26" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 16h.01" stroke="#E60012" strokeWidth="3" strokeLinecap="round" />
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
        case '检查':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="16" height="17" rx="2" stroke="#181C26" strokeWidth="2"/>
              <path d="M9 3h6v2H9z" fill="#181C26"/>
              <path d="m8 13 2.5 2.5 5.5-5.5" stroke="#181C26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="18" cy="17" r="3" fill="#E60012"/>
            </svg>
          );
        case '车队':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4h14v12H1z" stroke="#181C26" strokeWidth="2"/>
              <path d="M15 8h4l3 4v4h-7V8z" stroke="#181C26" strokeWidth="2"/>
              <circle cx="5" cy="18" r="2.5" fill="#181C26"/>
              <circle cx="17" cy="18" r="2.5" fill="#181C26"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
            </svg>
          );
        case '二手机':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="#181C26" strokeWidth="2"/>
              <path d="M7 8h10M7 12h6" stroke="#181C26" strokeWidth="2" strokeLinecap="round"/>
              <path d="m14 15 2 2 4-4" stroke="#181C26" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
            </svg>
          );
        case '计算':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="3" width="16" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <line x1="8" y1="7" x2="16" y2="7" stroke="#181C26" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="8" cy="12" r="1.2" fill="#181C26"/>
              <circle cx="12" cy="12" r="1.2" fill="#181C26"/>
              <circle cx="16" cy="12" r="1.2" fill="#181C26"/>
              <circle cx="8" cy="16" r="1.2" fill="#181C26"/>
              <circle cx="12" cy="16" r="1.2" fill="#181C26"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
            </svg>
          );
        case '绑定':
          return (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#181C26" strokeWidth="2"/>
              <path d="M12 7v10M7 12h10" stroke="#181C26" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="18" cy="16" r="3" fill="#E60012"/>
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
      <div className="relative w-[56px] h-[56px] bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
        {getIcon(iconName)}
        {badge && (
          <span
            className="absolute top-1 right-1 rtl:right-auto rtl:left-1 inline-flex items-center justify-center px-1.5 py-[2px] min-w-[20px] rounded-full bg-gradient-to-r from-[#FF3B30] to-[#E01923] text-white text-[8.5px] font-extrabold leading-none tracking-tight shadow-[0_1px_2px_rgba(224,25,35,0.35)] -rotate-12 rtl:rotate-12 pointer-events-none select-none z-20"
            dir="ltr"
          >
            {badge}
          </span>
        )}
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
            {firstScreenItems.map((item) => {
              const badge = item.badge || (item.name === '我要询价' || item.target === 'inquiry' ? 'hot' : null);
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`flex flex-col items-center flex-shrink-0 ${item.isHalfHidden ? 'opacity-60' : ''}`}
                  style={{ width: '64px' }}
                  onClick={() => handleFunctionClick(item)}
                >
                  {renderIcon(item.icon, badge)}
                  <span className="text-[11px] text-text-primary mt-1 text-center">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 第二屏 - 两行图标 */}
        <div className="flex-shrink-0 w-[343px]" style={{ scrollSnapAlign: 'start' }}>
          <div className="grid grid-cols-5 gap-y-2">
            {secondScreenItems.map((item) => {
              const badge = item.badge || (item.name === '我要询价' || item.target === 'inquiry' ? 'hot' : null);
              return (
                <button type="button" key={item.id} className="flex flex-col items-center" style={{ width: '68px' }} onClick={() => handleFunctionClick(item)}>
                  {renderIcon(item.icon, badge)}
                  <span className="text-[11px] text-text-primary mt-1 text-center">{item.name}</span>
                </button>
              );
            })}
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

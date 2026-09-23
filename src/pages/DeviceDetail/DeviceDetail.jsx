import React from 'react';

const BaselineDeviceDetail = ({ device, deviceName, onBack }) => {
  const currentDeviceName = (typeof device === 'string' ? device : device?.name) || deviceName || 'SAC1300C8PHEVHUF';
  // 详情数据
  const details = [
    {
      id: 1,
      title: '故障码',
      description: '发动机进气压传感器信号异常（SPN 102 FMI...',
      time: '2026-07-02 12:03 (UTC+7)',
      isNew: true,
      status: null,
      actions: ['确认处理', '我要召请', '更多']
    },
    {
      id: 2,
      title: '危险力矩',
      description: '力矩百分比高于 92%',
      time: '2026-07-01 10:09 (UTC+7)',
      isNew: false,
      status: null,
      actions: ['确认处理', '忽略', '动态曲线']
    },
    {
      id: 3,
      title: '蓄电池电压低',
      description: '蓄电池电压低于 21.5V',
      time: '2026-06-30 16:34 (UTC+7)',
      isNew: false,
      status: '已处理',
      statusColor: 'text-green-500',
      actions: []
    },
    {
      id: 4,
      title: '主卷超载',
      description: '主卷拉力高于 78t',
      time: '2026-06-28 18:30 (UTC+7)',
      isNew: false,
      status: '已忽略',
      statusColor: 'text-gray-400',
      actions: []
    }
  ];

  // 渲染操作按钮图标
  const renderActionIcon = (action) => {
    switch (action) {
      case '确认处理':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11L12 14L22 4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"/>
          </svg>
        );
      case '我要召请':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        );
      case '忽略':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        );
      case '动态曲线':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18"/>
            <path d="M7 16l4-4 4 4 4-4"/>
          </svg>
        );
      case '更多':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="19" cy="12" r="1"/>
            <circle cx="5" cy="12" r="1"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col">
      {/* 状态栏 - 与内容信息流详情页一致 */}
      <div className="h-[44px] flex items-center justify-between px-4 bg-white">
        <span className="text-black text-[14px] font-medium">9:41</span>
        <div className="flex items-center gap-1">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 8H3V12H1V8Z" fill="#333"/>
            <path d="M5 5H7V12H5V5Z" fill="#333"/>
            <path d="M9 3H11V12H9V3Z" fill="#333"/>
            <path d="M13 0H15V12H13V0Z" fill="#333"/>
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2C10.76 2 13.07 3.61 14.1 6L15.5 4.5C14.14 2.58 11.23 1 8 1C4.77 1 1.86 2.58 0.5 4.5L1.9 6C2.93 3.61 5.24 2 8 2Z" fill="#333"/>
            <path d="M8 5C9.66 5 11.14 5.69 12.11 6.88L13.5 5.5C12.2 3.98 10.21 3 8 3C5.79 3 3.8 3.98 2.5 5.5L3.89 6.88C4.86 5.69 6.34 5 8 5Z" fill="#333"/>
            <path d="M8 8C8.83 8 9.58 8.34 10.12 8.9L11.5 7.5C10.6 6.6 9.37 6 8 6C6.63 6 5.4 6.6 4.5 7.5L5.88 8.9C6.42 8.34 7.17 8 8 8Z" fill="#333"/>
            <circle cx="8" cy="11" r="1.5" fill="#333"/>
          </svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="#333" strokeOpacity="0.35"/>
            <rect x="2" y="2" width="18" height="8" rx="1" fill="#333"/>
            <path d="M23 4V8C23.5523 8 24 7.5523 24 7V5C24 4.4477 23.5523 4 23 4Z" fill="#333" fillOpacity="0.4"/>
          </svg>
        </div>
      </div>

      {/* 顶部导航栏 - 紧接状态栏 */}
      <div className="px-4 py-3 flex items-center border-b border-gray-100">
        {/* 返回按钮 */}
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center mr-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        {/* 设备名称 */}
        <div className="text-lg font-medium text-gray-900">{currentDeviceName}</div>
      </div>

      {/* 详情列表 */}
      <div className="px-4 py-3 space-y-3">
        {details.map((detail) => (
          <div
            key={detail.id}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            {/* 标题和状态 */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-base font-medium text-gray-900">{detail.title}</div>
              {detail.isNew && (
                <span className="px-2 py-0.5 bg-red-100 text-red-500 text-xs rounded-full">新</span>
              )}
              {detail.status && (
                <span className={`text-xs ${detail.statusColor}`}>{detail.status}</span>
              )}
            </div>

            {/* 描述 */}
            <div className="text-sm text-gray-600 mb-2">{detail.description}</div>

            {/* 时间 */}
            <div className="flex items-center text-xs text-gray-400 mb-3">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {detail.time}
            </div>

            {/* 操作按钮 */}
            {detail.actions && detail.actions.length > 0 && (
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                {detail.actions.map((action, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-50"
                  >
                    {renderActionIcon(action)}
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};





const EXCEPTION_ITEMS = [
  {
    id: 1,
    tag: '故障码',
    isNew: true,
    title: '制动开关信号故障(SPN 522738 FMI 12)',
    time: '2026-09-23 08:30 (UTC+8)',
  },
  {
    id: 2,
    tag: '故障码',
    isNew: true,
    title: 'EBS节点丢失故障(SPN 522715 FMI 12)',
    time: '2026-09-23 08:30 (UTC+8)',
  },
  {
    id: 3,
    tag: '故障码',
    isNew: true,
    title: '制动开关信号故障(SPN 522738 FMI 12)',
    time: '2026-09-23 08:30 (UTC+8)',
  },
  {
    id: 4,
    tag: '故障码',
    isNew: true,
    title: '挂车左转向灯开路(SPN 2372 FMI 5)',
    time: '2026-09-23 08:30 (UTC+8)',
  },
];

const CHECK_ITEMS = [
  {
    id: 1,
    tag: '检查需处理',
    isNew: true,
    title: '上车随检发现1项需处理',
    time: '2026-09-23 08:30 (UTC+8)',
  },
];

const GuestDeviceDetail = ({ device, onBack, demoMode = true, onRequireLogin }) => {
  const isCheckCategory =
    device?.activeCategory === 'check' || device?.categoryName === '检查异常';
  const categoryName =
    device?.categoryName || (isCheckCategory ? '检查异常' : '设备异常');
  const items = isCheckCategory ? CHECK_ITEMS : EXCEPTION_ITEMS;
  const title = device?.title || device?.displayName || device?.code || '设备详情';

  const handleAction = (e) => {
    e?.stopPropagation?.();
    if (demoMode && onRequireLogin) {
      onRequireLogin();
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[#F5F6F8] overflow-hidden">
      {/* 顶部导航栏：对齐图 3 和图 9 */}
      <div className="bg-white px-4 py-2.5 flex items-center border-b border-gray-100 flex-shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="返回"
          className="w-8 h-8 flex items-center justify-center -ml-1 mr-2 text-gray-800 active:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-bold text-gray-900 leading-tight truncate">
            {title}
          </div>
          <div className="text-[12px] text-gray-500 font-normal leading-tight mt-0.5 truncate">
            {categoryName}
          </div>
        </div>
      </div>

      {/* 详情卡片列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={handleAction}
            className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100/80 cursor-pointer active:bg-gray-50 transition-colors"
          >
            {/* 卡片头部：标签与新徽标 */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[15px] font-bold text-gray-900">{item.tag}</span>
              {item.isNew && (
                <span className="bg-[#FEECEE] text-[#EA3D4B] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  新
                </span>
              )}
            </div>

            {/* 故障描述 */}
            <div className="text-[13px] text-gray-800 leading-snug mb-2 font-normal">
              {item.title}
            </div>

            {/* 时间戳 */}
            <div className="flex items-center text-[12px] text-gray-400 mb-3">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{item.time}</span>
            </div>

            {/* 底部操作按钮：涉及业务流，未登录时点击跳登录 */}
            <div className="border-t border-gray-100 pt-3 flex items-center gap-2">
              {/* 确认按钮 */}
              <button
                type="button"
                onClick={handleAction}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 text-[12px] font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>确认</span>
              </button>

              {/* 服务召请按钮 */}
              <button
                type="button"
                onClick={handleAction}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 text-[12px] font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
                <span>服务召请</span>
              </button>

              {/* 更多按钮 */}
              <button
                type="button"
                onClick={handleAction}
                className="flex items-center justify-center px-3 py-1.5 rounded-full border border-gray-200 text-[12px] font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                aria-label="更多操作"
              >
                <span className="tracking-widest font-bold text-gray-600 leading-none">•••</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};




const DeviceDetail = (props) => {
  if (props.demoMode) {
    return <GuestDeviceDetail {...props} />;
  }
  return <BaselineDeviceDetail {...props} />;
};

export default DeviceDetail;
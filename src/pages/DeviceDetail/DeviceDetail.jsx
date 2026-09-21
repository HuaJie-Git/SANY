import React from 'react';

const EXCEPTION_ITEMS = [
  {
    id: 1,
    tag: '故障码',
    isNew: true,
    title: '制动开关信号故障(SPN 522738 FMI 12)',
    time: '2026-09-15 13:01:47 (UTC+7)',
  },
  {
    id: 2,
    tag: '故障码',
    isNew: true,
    title: 'EBS节点丢失故障(SPN 522715 FMI 12)',
    time: '2026-09-12 22:38:32 (UTC+7)',
  },
  {
    id: 3,
    tag: '故障码',
    isNew: true,
    title: '制动开关信号故障(SPN 522738 FMI 12)',
    time: '2026-09-12 05:35:29 (UTC+7)',
  },
  {
    id: 4,
    tag: '故障码',
    isNew: true,
    title: '挂车左转向灯开路(SPN 2372 FMI 5)',
    time: '2026-09-11 06:54:20 (UTC+7)',
  },
];

const CHECK_ITEMS = [
  {
    id: 1,
    tag: '检查需处理',
    isNew: true,
    title: '上车随检发现1项需处理',
    time: '2026-08-27 19:16:58 (UTC+8)',
  },
];

const DeviceDetail = ({ device, onBack, demoMode = false, onRequireLogin }) => {
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

            {/* 底部操作按钮：严格对齐原图 */}
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

export default DeviceDetail;

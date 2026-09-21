import React, { useState } from 'react';

const AuditEvents = ({ onCategoryClick }) => {
  const [period, setPeriod] = useState('过去 30天');

  // 严格按原图 1 还原 5 个审核事件
  const auditItems = [
    {
      id: 'exception',
      name: '设备异常',
      unreadText: '5 未读',
      count: 6,
    },
    {
      id: 'maintenance',
      name: '维保事项',
      overtime: 0,
      nearExpire: 0,
    },
    {
      id: 'fuel',
      name: '燃油异常',
    },
    {
      id: 'location',
      name: '位置预警',
    },
    {
      id: 'check',
      name: '检查异常',
      unreadText: '2 未读',
      count: 2,
    },
  ];

  return (
    <div className="px-4 py-3">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[16px] font-bold text-gray-900">审核事件</h3>
        <button
          type="button"
          onClick={() => setPeriod((v) => (v === '过去 30天' ? '过去 7天' : '过去 30天'))}
          className="flex items-center gap-1 text-[13px] text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <span>{period}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 审核事件卡片容器 */}
      <div className="bg-white rounded-2xl divide-y divide-gray-100 shadow-sm border border-gray-100/80 overflow-hidden">
        {auditItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onCategoryClick && onCategoryClick(item.name)}
            className="flex items-center justify-between px-4 py-3.5 cursor-pointer active:bg-gray-50 transition-colors"
          >
            {/* 左侧区域 */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-medium text-gray-900">{item.name}</span>
                {item.unreadText && (
                  <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-medium text-[#15803D]">
                    {item.unreadText}
                  </span>
                )}
              </div>
              {/* 维保事项专属状态行 */}
              {item.id === 'maintenance' && (
                <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
                    <span>已超时: {item.overtime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                    <span>临期: {item.nearExpire}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 右侧区域 */}
            <div className="flex items-center gap-1.5">
              {item.count !== undefined && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FEE2E2] px-1.5 text-[11px] font-bold text-[#DC2626]">
                  {item.count}
                </span>
              )}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
                <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditEvents;

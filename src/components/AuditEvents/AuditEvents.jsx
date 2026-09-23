import React, { useState, useMemo } from 'react';
import { GUEST_AUDIT_TAB_DEVICES } from '../../data/guestDemoData';

const AuditEvents = ({ onCategoryClick, demoMode = false, onRequireLogin: _onRequireLogin }) => {
  const [period, setPeriod] = useState('过去 30天');

  // 基线审核事件（db62a7e 登录态：4个事件）
  const baseEvents = [
    {
      id: 1,
      name: '设备异常',
      unreadCount: 10,
      totalCount: 20,
      color: 'text-brand-red',
    },
    {
      id: 2,
      name: '维保事项',
      unreadCount: 3,
      totalCount: 4,
      overtimeCount: 2,
      nearExpireCount: 2,
    },
    {
      id: 3,
      name: '燃油异常',
      unreadCount: 2,
      totalCount: 3,
    },
    {
      id: 4,
      name: '位置预警',
      unreadCount: 1,
      totalCount: 1,
    },
  ];

  // 游客体验模式专属审核事件（由 GUEST_AUDIT_TAB_DEVICES 统一计算，保持首页汇总与审核页详情一致）
  const guestAuditItems = useMemo(() => {
    const exceptionDevices = GUEST_AUDIT_TAB_DEVICES.exception || [];
    const exceptionNewCount = exceptionDevices.reduce((sum, d) => sum + (parseInt(d.newBadge, 10) || 0), 0);
    const exceptionTotalCount = exceptionDevices.reduce((sum, d) => sum + (d.countBadge || 0), 0);

    const checkDevices = GUEST_AUDIT_TAB_DEVICES.check || [];
    const checkNewCount = checkDevices.reduce((sum, d) => sum + (parseInt(d.newBadge, 10) || 0), 0);
    const checkTotalCount = checkDevices.reduce((sum, d) => sum + (d.countBadge || 0), 0);

    return [
      {
        id: 'exception',
        name: '设备异常',
        unreadText: `${exceptionNewCount}条新`,
        count: exceptionTotalCount,
      },
      {
        id: 'check',
        name: '检查异常',
        unreadText: `${checkNewCount}条新`,
        count: checkTotalCount,
      },
    ];
  }, []);

  if (!demoMode) {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[16px] font-medium text-text-primary">审核事件</h3>
          <div className="flex items-center gap-1 text-[12px] text-text辅助 cursor-pointer">
            <span>过去30天</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-[11px] overflow-hidden shadow-sm">
          {baseEvents.map((event, index) => (
            <div
              key={event.id}
              className={`p-4 ${index !== baseEvents.length - 1 ? 'border-b border-gray-100' : ''} cursor-pointer`}
              onClick={() => onCategoryClick && onCategoryClick(event.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-medium text-text-primary">{event.name}</span>
                  <span className="text-[12px] text-success bg-green-50 px-2 py-0.5 rounded-full">
                    {event.unreadCount} 未读
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-bold text-brand-red">{event.totalCount}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 3L7.5 6L4.5 9" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* 维保事项特殊字段 */}
              {event.name === '维保事项' && (
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-brand-red rounded-full"></div>
                    <span className="text-[12px] text-text-secondary">已超时：{event.overtimeCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span className="text-[12px] text-text-secondary">临期：{event.nearExpireCount}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[16px] font-bold text-gray-900">审核事件</h3>
        <button
          type="button"
          onClick={() => {
            setPeriod((v) => (v === '过去 30天' ? '过去 7天' : '过去 30天'));
          }}
          className="flex items-center gap-1 text-[13px] text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <span>{period}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 审核事件卡片容器 - 游客态按顺序展示“设备异常”与“检查异常” */}
      <div className="bg-white rounded-2xl divide-y divide-gray-100 shadow-sm border border-gray-100/80 overflow-hidden">
        {guestAuditItems.map((item) => (
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

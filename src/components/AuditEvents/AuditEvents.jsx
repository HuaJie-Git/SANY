import React from 'react';

const AuditEvents = () => {
  const events = [
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
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`p-4 ${index !== events.length - 1 ? 'border-b border-gray-100' : ''}`}
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
};

export default AuditEvents;

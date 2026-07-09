import React from 'react';

const RecentCardDetail = ({ item, onBack }) => {
  // 根据类型获取不同的详情数据
  const getDetails = () => {
    switch (item.type) {
      case 'asset':
        return [
          { id: 1, title: '设备名称', content: item.name },
          { id: 2, title: '设备编号', content: item.code },
          { id: 3, title: '设备类型', content: '挖掘机' },
          { id: 4, title: '设备状态', content: '在线' },
          { id: 5, title: '最近维护', content: '2026-07-01' },
          { id: 6, title: '设备位置', content: '上海市浦东新区' },
        ];
      case 'audit':
        return [
          { id: 1, title: '异常类型', content: item.name },
          { id: 2, title: '设备编号', content: item.code },
          { id: 3, title: '异常描述', content: item.summary },
          { id: 4, title: '处理状态', content: item.status },
          { id: 5, title: '发现时间', content: '2026-07-02 12:03' },
          { id: 6, title: '处理建议', content: '立即检查冷却系统' },
        ];
      case 'accessory':
        return [
          { id: 1, title: '配件名称', content: item.name },
          { id: 2, title: '配件编号', content: item.code },
          { id: 3, title: '配件类型', content: '液压配件' },
          { id: 4, title: '库存状态', content: '有货' },
          { id: 5, title: '适用设备', content: 'SANY SY365挖掘机' },
          { id: 6, title: '配件价格', content: '¥1,280' },
        ];
      case 'activity':
        return [
          { id: 1, title: '活动名称', content: item.name },
          { id: 2, title: '活动状态', content: item.status },
          { id: 3, title: '开始时间', content: item.startDate },
          { id: 4, title: '结束时间', content: item.endDate },
          { id: 5, title: '活动内容', content: '三一周年庆活动' },
          { id: 6, title: '参与人数', content: '1,234人' },
        ];
      default:
        return [];
    }
  };

  const details = getDetails();

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col">
      {/* 状态栏 - 与内容信息流详情页一致 */}
      <div className="flex-shrink-0">
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

      {/* 顶部导航栏 */}
      <div className="bg-white px-4 py-3 flex items-center border-b border-gray-100">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center mr-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="text-lg font-medium text-gray-900">{item.name}</div>
      </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 图片 */}
        <div className="bg-white rounded-xl overflow-hidden mb-4">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-[200px] object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* 详情信息 */}
        <div className="bg-white rounded-xl p-4">
          {details.map((detail) => (
            <div key={detail.id} className="py-3 border-b border-gray-100 last:border-b-0">
              <div className="text-sm font-medium text-gray-900 mb-1">{detail.title}</div>
              <div className="text-sm text-gray-600">{detail.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentCardDetail;

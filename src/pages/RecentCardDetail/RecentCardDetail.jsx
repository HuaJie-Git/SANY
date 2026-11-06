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
      {/* 顶部导航栏 */}
      <div className="flex-shrink-0 bg-white px-4 py-3 flex items-center border-b border-gray-100">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center mr-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="text-lg font-medium text-gray-900">{item.name}</div>
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

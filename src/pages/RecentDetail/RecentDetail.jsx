import React, { useState } from 'react';

const RecentDetail = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState('asset');

  // 5个分类 - 只用文字，不用图标
  const categories = [
    { id: 'asset', name: '资产' },
    { id: 'audit', name: '审核' },
    { id: 'content', name: '内容' },
    { id: 'activity', name: '活动' },
    { id: 'accessory', name: '配件' },
  ];

  // 各分类下的数据
  const categoryData = {
    asset: [
      { id: 1, name: 'SANY SY365挖掘机', code: 'EX-2024-001', status: '在线', image: '/images/审核/挖掘机.jpg' },
      { id: 2, name: 'SANY 起重机', code: 'EX-2025-002', status: '离线', image: '/images/审核/起重机.jpg' },
      { id: 3, name: 'SANY 泵车', code: 'EX-2024-003', status: '在线', image: '/images/审核/搅拌车.jpg' },
      { id: 4, name: 'SANY 挖掘机', code: 'EX-2024-004', status: '离线', image: '/images/审核/挖掘机2.jpg' },
      { id: 5, name: 'SANY 起重机', code: 'EX-2025-005', status: '在线', image: '/images/审核/起重机.jpg' },
    ],
    audit: [
      { id: 1, name: '冷却水温高', code: 'EX-2024-003', status: '待处理', summary: '冷却液温度高于85℃', image: '/images/审核/搅拌车.jpg' },
      { id: 2, name: '液压油温度高', code: 'EX-2024-006', status: '已处理', summary: '液压油温度高于90℃', image: '/images/审核/挖掘机.jpg' },
      { id: 3, name: '发动机异常', code: 'EX-2024-007', status: '待处理', summary: '发动机转速异常', image: '/images/审核/起重机.jpg' },
    ],
    content: [
      { id: 1, name: '三一SY365挖掘机操作指南', type: '文章', date: '2026-07-01', views: 1234, image: '/images/机手社区/挖掘机/挖掘机_01.jpg' },
      { id: 2, name: '设备保养小技巧', type: '视频', date: '2026-06-28', views: 5678, image: '/images/机手社区/泵车/泵车_04.jpg' },
      { id: 3, name: '三一起重机操作经验分享', type: '文章', date: '2026-06-25', views: 2345, image: '/images/机手社区/三一起重机/三一起重机_01.jpg' },
    ],
    activity: [
      { id: 1, name: '三一周年庆', status: '进行中', startDate: '2026-07-01', endDate: '2026-07-31', participants: 1234, image: '/images/优惠活动/挖掘机/挖掘机_01.jpg' },
      { id: 2, name: '夏季促销活动', status: '已结束', startDate: '2026-06-01', endDate: '2026-06-30', participants: 5678, image: '/images/优惠活动/矿卡/矿卡_03.png' },
      { id: 3, name: '新用户注册礼', status: '进行中', startDate: '2026-07-01', endDate: '2026-12-31', participants: 890, image: '/images/优惠活动/三一起重机/三一起重机_01.jpg' },
    ],
    accessory: [
      { id: 1, name: '液压油滤芯', code: 'AC-2024-001', type: '液压配件', stock: '有货', image: '/images/配件/OIP.webp' },
      { id: 2, name: '空气滤芯', code: 'AC-2024-002', type: '过滤配件', stock: '有货', image: '/images/配件/OIP (1).webp' },
      { id: 3, name: '机油滤芯', code: 'AC-2024-003', type: '过滤配件', stock: '缺货', image: '/images/配件/OIP (2).webp' },
      { id: 4, name: '燃油滤芯', code: 'AC-2024-004', type: '过滤配件', stock: '有货', image: '/images/配件/OIP (3).webp' },
    ],
  };

  const renderCategoryIcon = (icon) => {
    return <span className="text-lg">{icon}</span>;
  };

  const renderItem = (item, category) => {
    switch (category) {
      case 'asset':
        return (
          <div className="bg-white rounded-xl p-3 flex items-center shadow-sm mb-3">
            <div className="w-16 h-12 bg-gray-50 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500">{item.code}</div>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-1 ${item.status === '在线' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className={`text-xs ${item.status === '在线' ? 'text-green-500' : 'text-gray-400'}`}>{item.status}</span>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        );
      case 'audit':
        return (
          <div className="bg-white rounded-xl p-3 flex items-center shadow-sm mb-3">
            <div className="w-16 h-12 bg-gray-50 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                <span className={`text-xs px-2 py-0.5 rounded ${item.status === '待处理' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{item.status}</span>
              </div>
              <div className="text-xs text-gray-500">{item.code}</div>
              <div className="text-xs text-gray-400 mt-1">{item.summary}</div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        );
      case 'content':
        return (
          <div className="bg-white rounded-xl p-3 flex items-center shadow-sm mb-3">
            <div className="w-16 h-12 bg-gray-50 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-blue-500 bg-blue-50 px-1 rounded">{item.type}</span>
                <span className="text-xs text-gray-400">{item.date}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {item.views}
                </span>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        );
      case 'activity':
        return (
          <div className="bg-white rounded-xl p-3 flex items-center shadow-sm mb-3">
            <div className="w-16 h-12 bg-gray-50 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                <span className={`text-xs px-2 py-0.5 rounded ${item.status === '进行中' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{item.status}</span>
              </div>
              <div className="text-xs text-gray-500">{item.startDate} 至 {item.endDate}</div>
              <div className="text-xs text-gray-400 mt-1">参与人数：{item.participants}</div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        );
      case 'accessory':
        return (
          <div className="bg-white rounded-xl p-3 flex items-center shadow-sm mb-3">
            <div className="w-16 h-12 bg-gray-50 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500">{item.code}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-purple-500 bg-purple-50 px-1 rounded">{item.type}</span>
                <span className={`text-xs ${item.stock === '有货' ? 'text-green-500' : 'text-red-500'}`}>{item.stock}</span>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

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
        <div className="text-lg font-medium text-gray-900">最近查看</div>
      </div>
      </div>

      {/* 分类Tab - 只用文字，不用图标 */}
      <div className="bg-white px-4 py-3 flex gap-2 border-b border-gray-100 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              activeCategory === category.id
                ? 'bg-brand-red text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* 内容列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {categoryData[activeCategory]?.map((item) => (
          <div key={item.id}>
            {renderItem(item, activeCategory)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentDetail;

import React from 'react';

const RecentView = () => {
  const items = [
    {
      id: 1,
      type: 'asset',
      image: '/images/机手社区/挖掘机/挖掘机_01.jpg',
      name: 'SANY SY365挖掘机',
      code: '资产编号：EX-2024-001',
    },
    {
      id: 2,
      type: 'asset',
      image: '/images/机手社区/三一起重机/三一起重机_01.jpg',
      name: 'SANY 起重机',
      code: '资产编号：EX-2025-002',
    },
    {
      id: 3,
      type: 'audit',
      image: '/images/机手社区/泵车/泵车_04.jpg',
      name: '冷却水温高',
      code: '设备编号：EX-2024-003',
      status: '待处理',
      summary: '冷却液温度高于85℃',
    },
    {
      id: 4,
      type: 'accessory',
      image: '/images/机手社区/三一重卡/三一重卡_01.jpg',
      name: '液压油滤芯',
      code: '配件编号：AC-2024-001',
    },
    {
      id: 5,
      type: 'activity',
      image: '/images/机手社区/矿卡/矿卡_03.jpg',
      name: '三一周年庆',
      code: '活动状态：进行中',
    },
  ];

  const renderCard = (item) => {
    const renderImage = () => {
      return (
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-[100px] object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    };

    const renderFallback = () => {
      if (item.type === 'asset') {
        return (
          <div className="w-full h-[100px] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center hidden">
            <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="20" width="50" height="15" rx="2" fill="#333"/>
              <rect x="10" y="10" width="20" height="15" rx="2" fill="#555"/>
              <circle cx="15" cy="38" r="5" fill="#333"/>
              <circle cx="45" cy="38" r="5" fill="#333"/>
              <rect x="30" y="5" width="25" height="8" rx="1" fill="#666"/>
            </svg>
          </div>
        );
      }
      if (item.type === 'audit') {
        return (
          <div className="w-full h-[100px] bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center hidden">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="#FF4D4F" strokeWidth="2" fill="none"/>
              <path d="M20 10V22" stroke="#FF4D4F" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="20" cy="28" r="2" fill="#FF4D4F"/>
            </svg>
          </div>
        );
      }
      if (item.type === 'accessory') {
        return (
          <div className="w-full h-[100px] bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center hidden">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="15" stroke="#333" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="20" r="5" fill="#333"/>
              <path d="M20 5V10" stroke="#333" strokeWidth="2"/>
              <path d="M20 30V35" stroke="#333" strokeWidth="2"/>
              <path d="M5 20H10" stroke="#333" strokeWidth="2"/>
              <path d="M30 20H35" stroke="#333" strokeWidth="2"/>
            </svg>
          </div>
        );
      }
      if (item.type === 'activity') {
        return (
          <div className="w-full h-[100px] bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center hidden">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 5L25 15H35L27 22L30 33L20 26L10 33L13 22L5 15H15L20 5Z" fill="#FFD700"/>
            </svg>
          </div>
        );
      }
      return null;
    };

    switch (item.type) {
      case 'asset':
        return (
          <div className="w-[160px] h-[168px] bg-white rounded-[11px] overflow-hidden shadow-sm flex-shrink-0">
            {renderImage()}
            {renderFallback()}
            <div className="p-2">
              <div className="text-[14px] font-medium text-text-primary truncate">{item.name}</div>
              <div className="text-[12px] text-text-secondary truncate">{item.code}</div>
            </div>
          </div>
        );
      case 'audit':
        return (
          <div className="w-[160px] h-[168px] bg-white rounded-[11px] overflow-hidden shadow-sm flex-shrink-0">
            {renderImage()}
            {renderFallback()}
            <div className="p-2">
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-medium text-text-primary truncate">{item.name}</div>
                <span className="text-[10px] text-brand-red bg-red-50 px-1 rounded">{item.status}</span>
              </div>
              <div className="text-[12px] text-text-secondary truncate">{item.code}</div>
              <div className="text-[11px] text-text辅助 truncate">{item.summary}</div>
            </div>
          </div>
        );
      case 'accessory':
        return (
          <div className="w-[160px] h-[168px] bg-white rounded-[11px] overflow-hidden shadow-sm flex-shrink-0">
            {renderImage()}
            {renderFallback()}
            <div className="p-2">
              <div className="text-[14px] font-medium text-text-primary truncate">{item.name}</div>
              <div className="text-[12px] text-text-secondary truncate">{item.code}</div>
            </div>
          </div>
        );
      case 'activity':
        return (
          <div className="w-[160px] h-[168px] bg-white rounded-[11px] overflow-hidden shadow-sm flex-shrink-0">
            {renderImage()}
            {renderFallback()}
            <div className="p-2">
              <div className="text-[14px] font-medium text-text-primary truncate">{item.name}</div>
              <div className="text-[12px] text-text-secondary truncate">{item.code}</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[16px] font-medium text-text-primary">最近查看</h3>
        <span className="text-[12px] text-text辅助 cursor-pointer">详情 &gt;</span>
      </div>
      <div className="flex overflow-x-auto gap-3 pb-2">
        {items.map((item) => (
          <div key={item.id}>{renderCard(item)}</div>
        ))}
      </div>
    </div>
  );
};

export default RecentView;

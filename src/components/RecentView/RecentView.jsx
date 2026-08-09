import React, { useRef, useState } from 'react';

const INITIAL_ITEMS = [
  {
    id: 1,
    type: 'asset',
    image: 'images/优惠活动/挖掘机/挖掘机_08.jpg',
    name: 'SANY 挖掘机',
    code: 'PY2342343284324',
  },
  {
    id: 2,
    type: 'asset',
    image: 'images/优惠活动/三一起重机/三一起重机_08.jpg',
    name: 'SANY 起重机',
    code: 'PY2342343284327',
  },
  {
    id: 3,
    type: 'audit',
    image: 'images/审核/搅拌车.jpg',
    name: '冷却水温高',
    code: '设备编号：EX-2024-003',
    status: '待处理',
    summary: '冷却液温度高于85℃',
  },
  {
    id: 4,
    type: 'accessory',
    image: 'images/配件/OIP.webp',
    name: '液压油滤芯',
    code: '配件编号：AC-2024-001',
  },
  {
    id: 5,
    type: 'activity',
    image: 'images/优惠活动/三一起重机/三一起重机_01.jpg',
    name: '三一周年庆',
    code: '活动状态：进行中',
    status: '进行中',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    isRecommended: true,
  },
];

const MAX_CARDS = 4;

const RecentView = ({ onNavigate }) => {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const hasEnteredListRef = useRef(false);

  // 删除单条
  const handleDelete = (e, itemId) => {
    e.stopPropagation();
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  // 清除全部
  const handleClearAll = () => {
    setItems([]);
  };

  // 点击卡片 → 跳转卡片详情
  const handleCardClick = (item) => {
    if (onNavigate) {
      onNavigate('recentCard', item);
    }
  };

  // 点击"详情" → 跳转最近查看列表
  const handleDetailClick = () => {
    if (onNavigate) {
      onNavigate('recentList');
    }
  };

  const recentItems = items.filter(item => !item.isRecommended).slice(0, MAX_CARDS);
  const recommendedItem = items.find(item => item.isRecommended);
  const displayItems = recommendedItem ? [...recentItems, recommendedItem] : recentItems;

  const handleHorizontalScroll = (e) => {
    const container = e.currentTarget;
    const reachedEnd = container.scrollWidth > container.clientWidth
      && container.scrollLeft + container.clientWidth >= container.scrollWidth - 12;
    if (reachedEnd && !hasEnteredListRef.current) {
      hasEnteredListRef.current = true;
      onNavigate?.('recentList');
    }
  };

  const renderCard = (item) => {
    const renderImage = () => (
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

    const cardContent = (
      <>
        {renderImage()}
        {renderFallback()}
        {/* 删除按钮 (X) */}
        <button
          className="absolute top-1 right-1 w-5 h-5 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => handleDelete(e, item.id)}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </>
    );

    const cardInfo = (
      <div className="p-2">
        <div className="text-[14px] font-medium text-text-primary truncate">{item.name}</div>
        {item.type === 'activity' ? (
          <div className="flex items-center gap-1 mt-1">
            {item.status && (
              <span className="text-[10px] text-green-600 bg-green-50 px-1 rounded">{item.status}</span>
            )}
            <span className="text-[10px] text-gray-400">07.01-07.31</span>
          </div>
        ) : (
          <div className="text-[12px] text-text-secondary truncate">{item.code}</div>
        )}
      </div>
    );

    switch (item.type) {
      case 'asset':
        return (
          <div
            className="w-[160px] h-[168px] bg-white rounded-[11px] overflow-hidden shadow-sm flex-shrink-0 cursor-pointer group relative"
            onClick={() => handleCardClick(item)}
          >
            {cardContent}
            {cardInfo}
          </div>
        );
      case 'audit':
        return (
          <div
            className="w-[160px] h-[168px] bg-white rounded-[11px] overflow-hidden shadow-sm flex-shrink-0 cursor-pointer group relative"
            onClick={() => handleCardClick(item)}
          >
            {cardContent}
            {/* 状态角标 - 右上角 */}
            <div className="absolute top-0 right-0 bg-brand-red text-white text-[10px] px-2 py-0.5 rounded-bl-lg">
              {item.status}
            </div>
            {cardInfo}
          </div>
        );
      case 'accessory':
        return (
          <div
            className="w-[160px] h-[168px] bg-white rounded-[11px] overflow-hidden shadow-sm flex-shrink-0 cursor-pointer group relative"
            onClick={() => handleCardClick(item)}
          >
            {cardContent}
            {cardInfo}
          </div>
        );
      case 'activity':
        return (
          <div
            className="w-[160px] h-[168px] bg-white rounded-[11px] overflow-hidden shadow-sm flex-shrink-0 cursor-pointer group relative"
            onClick={() => handleCardClick(item)}
          >
            {cardContent}
            {/* 推荐角标 */}
            {item.isRecommended && (
              <div className="absolute top-0 right-0 bg-brand-red text-white text-[10px] px-2 py-0.5 rounded-bl-lg">
                推荐
              </div>
            )}
            {cardInfo}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="px-4 pt-4 pb-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-medium text-text-primary">最近查看</h3>
          {items.length > 0 && (
            <button
              className="text-[11px] text-gray-400 hover:text-gray-600"
              onClick={handleClearAll}
            >
              清除全部
            </button>
          )}
        </div>
        <span
          className="text-[12px] text-text辅助 cursor-pointer"
          onClick={handleDetailClick}
        >
          详情 &gt;
        </span>
      </div>
      {displayItems.length === 0 ? (
        <div className="text-[13px] text-gray-400 py-6 text-center">暂无最近查看记录</div>
      ) : (
        <div
          className="flex overflow-x-auto gap-3 pb-1"
          onScroll={handleHorizontalScroll}
          aria-label="最近查看卡片"
        >
          {displayItems.map((item) => (
            <div key={item.id}>{renderCard(item)}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentView;

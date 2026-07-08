import React, { useState } from 'react';
import CommunityPublish from '../CommunityPublish/CommunityPublish';
import ContentDetail from '../ContentDetail/ContentDetail';

const ContentFeed = ({ showPublishPage, setShowPublishPage }) => {
  const [activeTab, setActiveTab] = useState('全部');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState('');
  const [communityItems, setCommunityItems] = useState([
    { id: 101, type: 'community', image: '/images/机手社区/挖掘机/挖掘机_03.jpg', title: '今天在工地拍到的SANY挖掘机，太帅...', author: '机手小王', date: '2026-04-13', likes: 128, comments: 23, isLiked: false, isCollected: false },
    { id: 102, type: 'community', image: '/images/机手社区/三一起重机/三一起重机_03.jpg', title: '分享一下我的操作经验，新手必看', author: '老司机李', date: '2026-04-12', likes: 256, comments: 45, isLiked: true, isCollected: true },
    { id: 103, type: 'community_video', image: '/images/机手社区/三一起重机/三一起重机_06.jpg', title: '吊装作业全过程记录', author: '操作达人', date: '2026-04-11', likes: 89, comments: 12, isLiked: false, isCollected: false },
    { id: 104, type: 'community', image: '/images/机手社区/三一重卡/三一重卡_03.jpg', title: '设备保养小技巧分享', author: '维修专家', date: '2026-04-10', likes: 312, comments: 67, isLiked: true, isCollected: false },
  ]);

  const handleLike = (itemId) => {
    setCommunityItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 };
      }
      return item;
    }));
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem(prev => ({ ...prev, isLiked: !prev.isLiked, likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1 }));
    }
  };

  const handleCollect = (itemId) => {
    setCommunityItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, isCollected: !item.isCollected };
      }
      return item;
    }));
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem(prev => ({ ...prev, isCollected: !prev.isCollected }));
    }
  };

  const tabs = ['全部', '活动', '优惠', '行业动态', '机手社区'];

  // 轮播图内容 - 使用本地图片
  const carouselItems = [
    { id: 1, image: '/images/机手社区/挖掘机/挖掘机_01.jpg', title: '三一SY365挖掘机，高效作业首选' },
    { id: 2, image: '/images/机手社区/三一起重机/三一起重机_01.jpg', title: '三一起重机，精准高效' },
    { id: 3, image: '/images/机手社区/泵车/泵车_04.jpg', title: '混凝土泵车，城市建设利器' },
    { id: 4, image: '/images/机手社区/三一重卡/三一重卡_01.jpg', title: '三一重卡，运输主力' },
    { id: 5, image: '/images/机手社区/矿卡/矿卡_02.jpg', title: '矿卡，矿山作业专家' },
  ];

  const [currentCarousel, setCurrentCarousel] = useState(0);

  // 自动轮播 - 间隔3秒
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCarousel((prev) => (prev + 1) % carouselItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  // 全部Tab内容（不含轮播图）- 使用本地图片
  const allTabItems = [
    { id: 2, type: 'article', image: '/images/机手社区/三一起重机/三一起重机_05.jpg', title: '三一E6电动正面吊投入使用，助力绿色智慧升级', date: '2026-04-13', views: 1233 },
    { id: 3, type: 'video', image: '/images/机手社区/泵车/泵车_04.jpg', title: '工业级5G硬件，实现人机协同级的实时操控', date: '2026-04-13', views: 1233 },
    { id: 4, type: 'article', image: '/images/机手社区/三一重卡/三一重卡_03.jpg', title: '越南电动重卡市场已全面从"观望"迈入"行动"', date: '2026-04-13', views: 1233 },
    { id: 5, type: 'article', image: '/images/机手社区/挖掘机/挖掘机_04.jpg', title: 'Bonjour! 三一即将登台法国巴黎！...', date: '2026-04-13', views: 1233 },
    { id: 6, type: 'article', image: '/images/机手社区/矿卡/矿卡_04.jpg', title: '三一挖掘机家族再添新成员', date: '2026-04-13', views: 1233 },
  ];

  // 活动内容 - 使用本地图片
  const activityItems = [
    { id: 201, type: 'activity', image: '/images/机手社区/矿卡/矿卡_03.jpg', title: '三一周年庆活动', date: '2026-04-13', views: 5000, status: '进行中' },
    { id: 202, type: 'activity', image: '/images/机手社区/挖掘机/挖掘机_04.jpg', title: '春季设备巡检活动', date: '2026-04-10', views: 3200, status: '已结束' },
  ];

  const getContentByTab = () => {
    switch (activeTab) {
      case '全部':
        return allTabItems;
      case '机手社区':
        return communityItems;
      case '活动':
        return activityItems;
      default:
        return allTabItems;
    }
  };

  const renderCard = (item, contentType) => {
    const handleClick = () => {
      setSelectedItem(item);
      setSelectedContentType(contentType);
    };

    const renderImage = () => {
      return (
        <div className="relative">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-[140px] object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-full h-[140px] bg-gradient-to-br from-gray-200 to-gray-300 items-center justify-center hidden">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="5" width="30" height="30" rx="2" stroke="#666" strokeWidth="2" fill="none"/>
              <path d="M10 25L15 18L20 22L25 15L30 20V28C30 29.1 29.1 30 28 30H12C10.9 30 10 29.1 10 28V25Z" fill="#999"/>
            </svg>
          </div>
          {item.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[40px] h-[40px] bg-black/50 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2L14 8L4 14V2Z" fill="white"/>
                </svg>
              </div>
            </div>
          )}
          {item.type === 'community_video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[40px] h-[40px] bg-black/50 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2L14 8L4 14V2Z" fill="white"/>
                </svg>
              </div>
            </div>
          )}
          {item.type === 'carousel' && (
            <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
              轮播
            </div>
          )}
          {item.type === 'activity' && item.status && (
            <div className={`absolute top-2 left-2 text-white text-[10px] px-2 py-0.5 rounded ${item.status === '进行中' ? 'bg-green-500' : 'bg-gray-500'}`}>
              {item.status}
            </div>
          )}
        </div>
      );
    };

    // 机手社区卡片 - 172px × 270px
    if (item.type === 'community' || item.type === 'community_video') {
      return (
        <div className="bg-white rounded-[11px] overflow-hidden shadow-sm mb-2 cursor-pointer" onClick={handleClick}>
          <div className="relative">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-[170px] object-cover"
            />
            {item.type === 'community_video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[40px] h-[40px] bg-black/50 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 2L14 8L4 14V2Z" fill="white"/>
                  </svg>
                </div>
              </div>
            )}
          </div>
          <div className="p-2">
            <div className="text-[13px] font-medium text-text-primary line-clamp-2 mb-1">{item.title}</div>
            <div className="flex items-center justify-between text-[11px] text-text辅助 mb-2">
              <span>{item.author}</span>
              <span>{item.date}</span>
            </div>
            {/* 互动按钮 */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div
                className={`flex items-center gap-1 cursor-pointer ${item.isLiked ? 'text-brand-red' : 'text-text辅助'}`}
                onClick={(e) => { e.stopPropagation(); handleLike(item.id); }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill={item.isLiked ? 'currentColor' : 'none'} xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 14.25L6.935 13.29C3.4 10.14 1 7.87 1 5.14C1 2.87 2.78 1 5 1C6.14 1 7.24 1.51 8 2.29C8.76 1.51 9.86 1 11 1C13.22 1 15 2.87 15 5.14C15 7.87 12.6 10.14 9.065 13.29L8 14.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[11px]">{item.likes}</span>
              </div>
              <div className="flex items-center gap-1 cursor-pointer text-text辅助">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 10C14 10.35 13.86 10.69 13.62 10.93C13.38 11.17 13.05 11.3 12.7 11.3H4.6L2 13.7V3.3C2 2.95 2.14 2.61 2.38 2.37C2.62 2.13 2.95 2 3.3 2H12.7C13.05 2 13.38 2.13 13.62 2.37C13.86 2.61 14 2.95 14 3.3V10Z" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[11px]">{item.comments}</span>
              </div>
              <div
                className={`flex items-center gap-1 cursor-pointer ${item.isCollected ? 'text-brand-red' : 'text-text辅助'}`}
                onClick={(e) => { e.stopPropagation(); handleCollect(item.id); }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill={item.isCollected ? 'currentColor' : 'none'} xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2H3C2.45 2 2 2.45 2 3V14L8 11L14 14V3C14 2.45 13.55 2 13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[11px]">收藏</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 普通卡片 - 172px × 270px
    return (
      <div className="bg-white rounded-[11px] overflow-hidden shadow-sm mb-2 cursor-pointer" onClick={handleClick}>
        <div className="relative">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-[170px] object-cover"
          />
          {item.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[40px] h-[40px] bg-black/50 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2L14 8L4 14V2Z" fill="white"/>
                </svg>
              </div>
            </div>
          )}
          {item.type === 'community_video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[40px] h-[40px] bg-black/50 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2L14 8L4 14V2Z" fill="white"/>
                </svg>
              </div>
            </div>
          )}
          {item.type === 'carousel' && (
            <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
              轮播
            </div>
          )}
          {item.type === 'activity' && item.status && (
            <div className={`absolute top-2 left-2 text-white text-[10px] px-2 py-0.5 rounded ${item.status === '进行中' ? 'bg-green-500' : 'bg-gray-500'}`}>
              {item.status}
            </div>
          )}
        </div>
        <div className="p-2">
          <div className="text-[13px] font-medium text-text-primary line-clamp-2 mb-1">{item.title}</div>
          <div className="flex items-center justify-between text-[11px] text-text辅助">
            <span>{item.date}</span>
            <div className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2.5C3.5 2.5 1.5 5 1.5 5C1.5 5 3.5 7.5 6 7.5C8.5 7.5 10.5 5 10.5 5C10.5 5 8.5 2.5 6 2.5Z" stroke="#999" strokeWidth="1"/>
                <circle cx="6" cy="5" r="1.5" stroke="#999" strokeWidth="1"/>
              </svg>
              <span>{item.views}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 如果显示发布页面，直接返回发布页面
  if (showPublishPage) {
    return <CommunityPublish onClose={() => setShowPublishPage(false)} />;
  }

  // 如果显示详情页，直接返回详情页
  if (selectedItem) {
    return (
      <ContentDetail
        item={selectedItem}
        contentType={selectedContentType}
        onClose={() => setSelectedItem(null)}
        onLike={handleLike}
        onCollect={handleCollect}
      />
    );
  }

  return (
    <div className="px-4 py-3 relative">
      {/* Tab 切换 */}
      <div className="flex gap-4 mb-3 border-b border-gray-100 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`pb-2 cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? 'text-brand-red font-medium border-b-2 border-brand-red'
                : 'text-text辅助'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* 内容列表 - 双列瀑布流 */}
      <div className="grid grid-cols-[167px_167px] gap-2">
        {/* 轮播图 - 只在全部Tab显示，放在第一列 */}
        {activeTab === '全部' && (
          <div className="mb-2">
            <div className="relative rounded-[11px] overflow-hidden">
              <img
                src={carouselItems[currentCarousel].image}
                alt={carouselItems[currentCarousel].title}
                className="w-full h-[200px] object-cover"
              />
              {/* 轮播标签 */}
              <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
                轮播
              </div>
              {/* 标题 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <div className="text-white text-[12px] font-medium line-clamp-2">{carouselItems[currentCarousel].title}</div>
              </div>
            </div>
            {/* 轮播指示器 */}
            <div className="flex justify-center gap-1 mt-2">
              {carouselItems.map((_, index) => (
                <div
                  key={index}
                  className={`w-[5px] h-[5px] rounded-full cursor-pointer ${
                    currentCarousel === index ? 'bg-brand-red' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentCarousel(index)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 其他内容卡片 */}
        {getContentByTab().map((item) => (
          <div key={item.id}>{renderCard(item, activeTab)}</div>
        ))}
      </div>

      {/* 广告位 - 全部Tab显示 */}
      {activeTab === '全部' && (
        <div className="mt-2 bg-white rounded-[11px] overflow-hidden shadow-sm relative">
          <div className="w-full h-[100px] relative">
            <img
              src="https://images.unsplash.com/photo-1621922688758-50e6069f6e3a?w=686&h=200&fit=crop"
              alt="广告"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-full h-full bg-gradient-to-r from-red-100 to-red-200 items-center justify-center hidden">
              <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="20" width="50" height="15" rx="2" fill="#333"/>
                <rect x="10" y="10" width="20" height="15" rx="2" fill="#555"/>
                <circle cx="15" cy="38" r="5" fill="#333"/>
                <circle cx="45" cy="38" r="5" fill="#333"/>
                <rect x="30" y="5" width="25" height="8" rx="1" fill="#666"/>
              </svg>
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
            广告
          </div>
        </div>
      )}

      {/* 推荐内容 - 全部Tab显示 */}
      {activeTab === '全部' && (
        <div className="mt-2">
          <div className="text-[14px] font-medium text-text-primary mb-2">为你推荐</div>
          <div className="grid grid-cols-[167px_167px] gap-2">
            {allTabItems.slice(0, 2).map((item) => (
              <div key={`recommend-${item.id}`}>{renderCard(item, '全部')}</div>
            ))}
          </div>
        </div>
      )}

      {/* 发布按钮 - 只在机手社区Tab显示 */}
      {activeTab === '机手社区' && (
        <div
          className="absolute bottom-[60px] right-4 w-[56px] h-[56px] bg-brand-red rounded-full flex items-center justify-center shadow-lg cursor-pointer z-40"
          onClick={() => setShowPublishPage(true)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

    </div>
  );
};

export default ContentFeed;

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import CommunityPublish from '../CommunityPublish/CommunityPublish';
import ContentDetail from '../ContentDetail/ContentDetail';
import CommunityTab from './CommunityTab';
import PostDetail from './PostDetail';
import TopicDetailPage from './TopicDetailPage';
import ViewCountBadge from './ViewCountBadge';
import { getTopicById, posts as allPosts } from './communityData';

const ContentFeed = forwardRef(({ showPublishPage, setShowPublishPage, setIsCommunityPublishEligible, setIsCommunityPublishViewportActive }, ref) => {
  const [activeTab, setActiveTab] = useState('全部');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState('');
  const [showCameraPermission, setShowCameraPermission] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [topicDetail, setTopicDetail] = useState(null); // { topicName, source }
  const [communitySubTab, setCommunitySubTab] = useState('我的'); // 社区二级Tab
  const tabContainerRef = useRef(null);
  const [communityItems, setCommunityItems] = useState([
    { id: 101, type: 'community', topicId: 1, image: 'images/机手社区/挖掘机/挖掘机_03.jpg', title: '今天在工地拍到的SANY挖掘机，太帅...', author: '机手小王', date: '2026-04-13', likes: 128, comments: 23, views: 1280, isLiked: false, isCollected: false },
    { id: 102, type: 'community', topicId: 1, image: 'images/机手社区/三一起重机/三一起重机_03.jpg', title: '分享一下我的操作经验，新手必看', author: '老司机李', date: '2026-04-12', likes: 256, comments: 45, views: 2340, isLiked: true, isCollected: true },
    { id: 103, type: 'community_video', topicId: 3, image: 'images/机手社区/三一起重机/三一起重机_06.jpg', title: '吊装作业全过程记录', author: '操作达人', date: '2026-04-11', likes: 89, comments: 12, views: 680, isLiked: false, isCollected: false },
    { id: 104, type: 'community', topicId: 2, image: 'images/机手社区/三一重卡/三一重卡_03.jpg', title: '设备保养小技巧分享', author: '维修专家', date: '2026-04-10', likes: 312, comments: 67, views: 856, isLiked: true, isCollected: false },
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

  const tabs = ['全部', '活动', '优惠(占位)', '行业动态(占位)', '社区'];
  const communityTabs = ['全部', '热门话题', '设备操作', '保养技巧', '工程现场', '安全规范', '新手入门'];

  // Tab点击时滚动到可见区域
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // 滚动Tab到可见区域
    if (tabContainerRef.current) {
      const tabElement = tabContainerRef.current.querySelector(`[data-tab="${tab}"]`);
      if (tabElement) {
        const container = tabContainerRef.current;
        const tabRect = tabElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        // 如果Tab在容器左边，滚动到左边
        if (tabRect.left < containerRect.left) {
          container.scrollLeft -= (containerRect.left - tabRect.left + 16);
        }
        // 如果Tab在容器右边，滚动到左边第一个位置
        if (tabRect.right > containerRect.right) {
          container.scrollLeft += (tabRect.right - containerRect.left + 16);
        }
      }
    }
  };

  // 处理点击发布按钮
  const handlePublishClick = () => {
    // 模拟检查相机和相册权限（实际项目中应使用真实API）
    const hasCameraPermission = false; // 模拟未开启权限

    if (!hasCameraPermission) {
      setShowCameraPermission(true);
      return;
    }

    setShowPublishPage(true);
  };

  // 处理点击社区帖子 - 进入帖子详情
  const handlePostClick = (post) => {
    // 从共享数据源获取最新帖子数据（可能被点赞等操作更新）
    const latestPost = allPosts.find((p) => p.id === post.id) || post;
    setSelectedPost(latestPost);
  };

  // 处理点击话题 - 进入话题详情页（source: 'directory' | 'postDetail' | 'communityTab'）
  const handleTopicClick = (topicName, source = 'communityTab') => {
    setTopicDetail({ topicName, source });
  };

  // 话题详情页返回 - 根据来源回到对应页面
  const handleTopicBack = () => {
    setTopicDetail(null);
    // 由 useEffect 根据 communitySubTab 重新计算资格
  };

  // 暴露handlePublishClick给父组件
  useImperativeHandle(ref, () => ({
    handlePublishClick,
  }));

  // ─── 社区发布按钮资格：ContentFeed 内部计算，上报 Home ───
  // 我的/关注/具体话题 Tab → true
  // 全部话题目录 → false
  // TopicDetailPage（任何来源）→ true
  // PostDetail → false
  // CommunityPublish → false（由 Home 的 showPublishPage 控制）
  // 非社区大类 → false
  useEffect(() => {
    if (activeTab !== '社区') {
      setIsCommunityPublishEligible?.(false);
      return;
    }
    // PostDetail 显示 → 不可发布
    if (selectedPost) {
      setIsCommunityPublishEligible?.(false);
      return;
    }
    // TopicDetailPage 显示 → 可发布（不论来源）
    if (topicDetail) {
      setIsCommunityPublishEligible?.(true);
      return;
    }
    // 社区根页面：全部话题目录不可发布，其他可发布
    setIsCommunityPublishEligible?.(communitySubTab !== '全部话题');
  }, [activeTab, selectedPost, topicDetail, communitySubTab, setIsCommunityPublishEligible]);

  // TopicDetailPage → viewportActive=true; PostDetail → viewportActive=false
  // CommunityTab 的滚动触发也会设置 viewportActive（社区根页面）
  useEffect(() => {
    if (topicDetail) {
      setIsCommunityPublishViewportActive?.(true);
    } else if (selectedPost) {
      setIsCommunityPublishViewportActive?.(false);
    }
    // topicDetail 和 selectedPost 都为 null 时，不覆盖 CommunityTab 的滚动触发结果
  }, [topicDetail, selectedPost, setIsCommunityPublishViewportActive]);

  // 轮播图内容 - 使用本地图片
  const carouselItems = [
    { id: 1, image: 'images/机手社区/挖掘机/挖掘机_01.jpg', title: '三一SY365挖掘机，高效作业首选' },
    { id: 2, image: 'images/机手社区/三一起重机/三一起重机_01.jpg', title: '三一起重机，精准高效' },
    { id: 3, image: 'images/机手社区/泵车/泵车_04.jpg', title: '混凝土泵车，城市建设利器' },
    { id: 4, image: 'images/机手社区/三一重卡/三一重卡_01.jpg', title: '三一重卡，运输主力' },
    { id: 5, image: 'images/机手社区/矿卡/矿卡_02.jpg', title: '矿卡，矿山作业专家' },
  ];

  const [currentCarousel, setCurrentCarousel] = useState(0);
  const [currentAd, setCurrentAd] = useState(0);
  const [showAdCloseMenu, setShowAdCloseMenu] = useState(false);
  const [adClosed, setAdClosed] = useState(false);

  // 广告埋点
  const trackAdEvent = (eventType, adId, option) => {
    console.log(`[广告埋点] 事件: ${eventType}, 广告ID: ${adId}, 选项: ${option}`);
    // TODO: 接入实际埋点SDK
  };

  const handleAdClose = (option) => {
    trackAdEvent('ad_feedback', adItems[currentAd].id, option);
    setShowAdCloseMenu(false);
    setAdClosed(true);
  };

  // 广告轮播数据
  const adItems = [
    { id: 1, image: 'images/sany_crane.jpg', title: '三一重工 · 智造精品', subtitle: '全球工程机械制造商50强' },
    { id: 2, image: 'images/sany_pump.jpg', title: '三一泵车 · 建设未来', subtitle: '混凝土机械全球领先品牌' },
    { id: 3, image: 'images/sany_excavator2.jpg', title: '三一挖掘机 · 效率之王', subtitle: '节能高效 智能操控' },
  ];

  // 广告自动轮播
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % adItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [adItems.length]);

  // 内容轮播 - 间隔3秒
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCarousel((prev) => (prev + 1) % carouselItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  // 全部Tab内容（不含轮播图）- 使用本地图片
  const allTabItems = [
    { id: 2, type: 'article', image: 'images/机手社区/三一起重机/三一起重机_05.jpg', title: '三一E6电动正面吊投入使用，助力绿色智慧升级', date: '2026-04-13', views: 1233 },
    { id: 3, type: 'video', image: 'images/机手社区/泵车/泵车_04.jpg', title: '工业级5G硬件，实现人机协同级的实时操控', date: '2026-04-13', views: 1233 },
    { id: 4, type: 'article', image: 'images/机手社区/三一重卡/三一重卡_03.jpg', title: '越南电动重卡市场已全面从"观望"迈入"行动"', date: '2026-04-13', views: 1233 },
    { id: 5, type: 'article', image: 'images/机手社区/挖掘机/挖掘机_04.jpg', title: 'Bonjour! 三一即将登台法国巴黎！...', date: '2026-04-13', views: 1233 },
    { id: 6, type: 'article', image: 'images/机手社区/矿卡/矿卡_04.jpg', title: '三一挖掘机家族再添新成员', date: '2026-04-13', views: 1233 },
  ];

  // 活动内容 - 使用本地图片
  const activityItems = [
    { id: 201, type: 'activity', image: 'images/机手社区/矿卡/矿卡_03.jpg', title: '三一周年庆活动', date: '2026-04-13', views: 5000, status: '进行中' },
    { id: 202, type: 'activity', image: 'images/机手社区/挖掘机/挖掘机_04.jpg', title: '春季设备巡检活动', date: '2026-04-10', views: 3200, status: '已结束' },
  ];

  const getContentByTab = () => {
    switch (activeTab) {
      case '全部':
        return allTabItems;
      case '社区':
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

    // 社区卡片
    if (item.type === 'community' || item.type === 'community_video') {
      return (
        <div className="bg-white rounded-[11px] overflow-hidden shadow-sm cursor-pointer" onClick={handleClick}>
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
            {/* 浏览量徽标 */}
            <ViewCountBadge views={item.views} />
          </div>
          <div className="p-2">
            {/* 话题标签 - 单行省略，通过 topicId 从共享数据源获取话题名称 */}
            {item.topicId && (() => {
              const t = getTopicById(item.topicId);
              return t ? <div className="text-[11px] text-brand-red mb-0.5 truncate">{t.name}</div> : null;
            })()}
            {/* 标题 - 最多2行省略 */}
            <div className="text-[13px] font-medium text-text-primary leading-[1.35] line-clamp-2 break-words mb-1">{item.title}</div>
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

    // 普通卡片 - 不同类型不同高度，形成瀑布流
    const getImageHeight = () => {
      switch (item.type) {
        case 'video': return 'h-[180px]';
        case 'article': return 'h-[140px]';
        default: return 'h-[160px]';
      }
    };

    return (
      <div className="bg-white rounded-[11px] overflow-hidden shadow-sm cursor-pointer" onClick={handleClick}>
        <div className="relative">
          <img
            src={item.image}
            alt={item.title}
            className={`w-full ${getImageHeight()} object-cover`}
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
          {/* 浏览量徽标 */}
          {item.views != null && <ViewCountBadge views={item.views} />}
        </div>
        <div className="p-2">
          {/* 标题 - 最多2行省略 */}
          <div className="text-[13px] font-medium text-text-primary leading-[1.35] line-clamp-2 break-words mb-1">{item.title}</div>
          <div className="text-[11px] text-text辅助">
            <span>{item.date}</span>
          </div>
        </div>
      </div>
    );
  };

  // 如果显示发布页面，直接返回发布页面
  if (showPublishPage) {
    return <CommunityPublish onClose={() => setShowPublishPage(false)} />;
  }

  // 权限提示弹窗
  if (showCameraPermission) {
    return (
      <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl w-[300px] overflow-hidden">
          {/* 标题 */}
          <div className="pt-6 pb-2 text-center">
            <h3 className="text-[18px] font-bold text-gray-900">权限申请</h3>
          </div>

          {/* 内容 */}
          <div className="px-6 pb-4 text-center">
            <p className="text-[14px] text-gray-500 leading-relaxed">
              需要相机和相册权限
            </p>
          </div>

          {/* 按钮 */}
          <div className="flex border-t border-gray-100">
            <button
              className="flex-1 py-4 text-[16px] text-gray-500 border-r border-gray-100"
              onClick={() => setShowCameraPermission(false)}
            >
              取消
            </button>
            <button
              className="flex-1 py-4 text-[16px] text-red-500 font-medium"
              onClick={() => {
                // 模拟跳转设置（实际项目中应调用真实API）
                setShowCameraPermission(false);
                setShowPublishPage(true);
              }}
            >
              前往设置
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 如果显示话题详情页（三级页面，全屏覆盖）
  if (topicDetail) {
    return (
      <TopicDetailPage
        topicName={topicDetail.topicName}
        onBack={handleTopicBack}
        onPostClick={handlePostClick}
      />
    );
  }

  // 如果显示社区帖子详情页
  if (selectedPost) {
    return (
      <PostDetail
        post={selectedPost}
        onBack={() => setSelectedPost(null)}
        onTopicClick={(topicName) => {
          setSelectedPost(null);
          handleTopicClick(topicName, 'postDetail');
        }}
      />
    );
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
      {/* Tab 切换 - 吸顶效果，可滑动，半隐藏 */}
      <div className="sticky top-0 bg-white z-10 -mx-4 px-4 py-2 border-b border-gray-100">
        <div ref={tabContainerRef} className="flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <div
              key={tab}
              data-tab={tab}
              className={`pb-2 cursor-pointer whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                tab.length <= 2 ? 'px-2' : 'px-3'
              } ${
                activeTab === tab
                  ? 'text-brand-red font-medium border-b-2 border-brand-red'
                  : 'text-text辅助'
              }`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* 内容区域 - 自适应瀑布流 */}
      <div className="mt-3">
        {/* 社区Tab - 显示话题和内容 */}
        {activeTab === '社区' && (
          <CommunityTab onPostClick={handlePostClick} onTopicClick={handleTopicClick} setCommunitySubTab={setCommunitySubTab} setViewportActive={setIsCommunityPublishViewportActive} />
        )}

        {/* 瀑布流内容 - 所有卡片统一间距，浏览器自动排列 */}
        {activeTab !== '社区' && (
        <div className="columns-2 gap-2">
          {/* 轮播小卡片 - 只在全部Tab显示，跟其他卡片一样大小 */}
          {activeTab === '全部' && (
            <div className="break-inside-avoid mb-2">
              <div className="bg-white rounded-[11px] overflow-hidden shadow-sm cursor-pointer">
                <div className="relative">
                  <img
                    src={carouselItems[currentCarousel].image}
                    alt={carouselItems[currentCarousel].title}
                    className="w-full h-[140px] object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
                    轮播
                  </div>
                  {/* 标题覆盖在图片底部 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <div className="text-white text-[12px] font-medium line-clamp-2">{carouselItems[currentCarousel].title}</div>
                  </div>
                  {/* 轮播指示器 - 覆盖在图片底部 */}
                  <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
                    {carouselItems.map((_, index) => (
                      <div
                        key={index}
                        className={`w-[4px] h-[4px] rounded-full cursor-pointer ${
                          currentCarousel === index ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentCarousel(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 其他内容卡片 */}
          {getContentByTab().map((item) => (
            <div key={item.id} className="break-inside-avoid mb-2">{renderCard(item, activeTab)}</div>
          ))}
        </div>
        )}
      </div>

      {/* 广告轮播 - 全部Tab显示 */}
      {activeTab === '全部' && !adClosed && (
        <div className="mt-2 relative">
          <div className="rounded-[11px] overflow-hidden shadow-sm cursor-pointer">
            <div className="w-full h-[100px] relative">
              <img
                src={adItems[currentAd].image}
                alt="广告"
                className="w-full h-full object-cover"
              />
              {/* 渐变遮罩 + 广告文案 */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center">
                <div className="px-4">
                  <div className="text-white text-[16px] font-bold">{adItems[currentAd].title}</div>
                  <div className="text-white/80 text-[11px] mt-1">{adItems[currentAd].subtitle}</div>
                </div>
              </div>
              {/* 关闭按钮 - 右上角 */}
              <div
                className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/30 rounded-full flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  trackAdEvent('ad_close_click', adItems[currentAd].id);
                  setShowAdCloseMenu(!showAdCloseMenu);
                }}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 2l8 8M10 2l-8 8"/>
                </svg>
              </div>
            </div>
            {/* 轮播指示器 */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
              {adItems.map((_, index) => (
                <div
                  key={index}
                  className={`w-[4px] h-[4px] rounded-full cursor-pointer ${
                    currentAd === index ? 'bg-white' : 'bg-white/40'
                  }`}
                  onClick={() => setCurrentAd(index)}
                />
              ))}
            </div>
            <div className="absolute bottom-1.5 right-2 bg-black/40 text-white/80 text-[9px] px-1.5 py-0.5 rounded">
              广告
            </div>
          </div>

          {/* 关闭反馈菜单 - 放在外层，不受overflow限制 */}
          {showAdCloseMenu && (
            <div className="absolute top-2 right-1.5 bg-white rounded-lg shadow-lg z-50 py-1 w-[120px]">
              {['不感兴趣', '不再推送', '减少推送'].map((option) => (
                <div
                  key={option}
                  className="px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdClose(option);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 推荐内容 - 全部Tab显示 */}
      {activeTab === '全部' && (
        <div className="mt-2">
          <div className="text-[14px] font-medium text-text-primary mb-2">为你推荐</div>
          <div className="columns-2 gap-2">
            {allTabItems.slice(0, 2).map((item) => (
              <div key={`recommend-${item.id}`} className="break-inside-avoid mb-2">{renderCard(item, '全部')}</div>
            ))}
          </div>
        </div>
      )}

      {/* 底部提示语 - 到底了 */}
      <div className="text-center py-6 text-[12px] text-gray-400">
        — 已经到底了，看看其他版块的信息吧 —
      </div>
    </div>
  );
});

export default ContentFeed;

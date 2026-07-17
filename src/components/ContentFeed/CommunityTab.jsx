import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  topics,
  getTopicByName,
  getContentsByTopicName,
  getMyVisiblePosts,
} from './communityData';
import MyPublishPage from './MyPublishPage';
import FollowTab from './FollowTab';
import WaterfallCard from './WaterfallCard';

const CommunityTab = ({ onPostClick, onTopicClick, setCommunitySubTab, setViewportActive }) => {
  const [activeTab, setActiveTab] = useState('我的');
  const [drillDown, setDrillDown] = useState(null);
  const tabContainerRef = useRef(null);
  const sentinelRef = useRef(null);
  // 跟踪 sentinel 是否曾经离开过视口（区分"初始可见"和"滚动后回到顶部"）
  const hasBeenBelowRef = useRef(false);
  // 标记组件已完成首次挂载
  const mountedRef = useRef(false);

  // 二级Tab
  const tabs = ['我的', '关注', '全部话题', '占位话题1', '占位话题2'];

  // Tab点击
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setDrillDown(null);
    if (tabContainerRef.current) {
      const tabElement = tabContainerRef.current.querySelector(`[data-tab="${tab}"]`);
      if (tabElement) {
        const container = tabContainerRef.current;
        const tabRect = tabElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (tabRect.right > containerRect.right) {
          container.scrollLeft += (tabRect.right - containerRect.left + 16);
        }
        if (tabRect.left < containerRect.left) {
          container.scrollLeft -= (containerRect.left - tabRect.left + 16);
        }
      }
    }
  };

  // 通知 ContentFeed 当前社区二级Tab
  useEffect(() => {
    setCommunitySubTab?.(activeTab);
  }, [activeTab, setCommunitySubTab]);

  // ─── 滚动视口触发：sentinel 离开视口 → 显示按钮；回到视口 → 隐藏按钮 ───
  // hasBeenBelow 防止初始挂载时 sentinel 可见就显示按钮
  useEffect(() => {
    if (drillDown) {
      setViewportActive?.(false);
      return;
    }

    const scrollContainer = document.querySelector('[data-scroll-container]');
    if (!scrollContainer) return;

    // 首次挂载时检查 sentinel 位置
    requestAnimationFrame(() => {
      mountedRef.current = true;
      const sentinel = sentinelRef.current;
      if (!sentinel) return;
      const containerRect = scrollContainer.getBoundingClientRect();
      const sentinelRect = sentinel.getBoundingClientRect();
      // sentinel 顶部在容器顶部以下 → 在视口内 → 不显示按钮
      // sentinel 顶部在容器顶部以上 → 在视口外 → 已经滚过去了
      if (sentinelRect.top < containerRect.top) {
        hasBeenBelowRef.current = true;
        setViewportActive?.(true);
      }
    });

    const handleScroll = () => {
      const sentinel = sentinelRef.current;
      if (!sentinel) return;
      const containerRect = scrollContainer.getBoundingClientRect();
      const sentinelRect = sentinel.getBoundingClientRect();
      const isAbove = sentinelRect.top < containerRect.top;

      if (isAbove) {
        // sentinel 在视口上方 → 已滚过社区内容区 → 显示按钮
        hasBeenBelowRef.current = true;
        setViewportActive?.(true);
      } else if (hasBeenBelowRef.current) {
        // sentinel 回到视口内 + 之前曾离开过 → 回到顶部 → 隐藏按钮
        setViewportActive?.(false);
      }
      // else: 初始状态 sentinel 可见且从未离开过 → 不改变（保持 false）
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      setViewportActive?.(false);
      mountedRef.current = false;
      hasBeenBelowRef.current = false;
    };
  }, [drillDown, setViewportActive]);

  // 返回上一页（仅 myPublish 下钻）
  const handleDrillBack = useCallback(() => {
    setDrillDown(null);
  }, []);

  // 渲染首页 - "我的"Tab
  const renderMyTabHome = () => {
    const visiblePosts = getMyVisiblePosts();
    return (
      <div className="columns-2 gap-2">
        {visiblePosts.map((post) => (
          <WaterfallCard
            key={post.id}
            post={post}
            onClick={() => onPostClick?.(post)}
            isMyView={true}
          />
        ))}
      </div>
    );
  };

  // 渲染首页 - "关注"Tab
  const renderFollowTabHome = () => (
    <FollowTab onPostClick={onPostClick} />
  );

  // 渲染首页 - "全部话题"Tab（话题分类目录）
  const renderAllTabHome = () => (
    <div className="space-y-2.5">
      {topics.map((topic) => (
        <div
          key={topic.id}
          className="bg-white rounded-xl px-4 py-3 shadow-sm cursor-pointer flex items-center gap-3 active:bg-gray-50 transition-colors"
          onClick={() => onTopicClick?.(topic.name, 'directory')}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
            style={{ backgroundColor: topic.color + '20' }}
          >
            {topic.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-gray-900 truncate">{topic.name}</div>
            <div className="text-[12px] text-gray-500 truncate mt-0.5">{topic.description}</div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {topic.viewCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                {topic.participantCount.toLocaleString()}
              </span>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" className="flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      ))}
    </div>
  );

  // 渲染首页 - 占位话题Tab
  const renderPlaceholderTabHome = () => {
    const topic = getTopicByName(activeTab);
    if (!topic) return null;
    const contents = getContentsByTopicName(activeTab);
    return (
      <div>
        {contents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-[14px] mb-2">暂无「{topic.name}」内容</div>
            <div className="text-gray-300 text-[12px]">成为第一个发布的人吧</div>
          </div>
        ) : (
          <div className="columns-2 gap-2">
            {contents.map((post) => (
              <WaterfallCard
                key={post.id}
                post={post}
                onClick={() => onPostClick?.(post)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // 渲染下钻页面（仅 myPublish）
  const renderDrillDown = () => {
    if (!drillDown) return null;
    if (drillDown.type === 'myPublish') {
      return (
        <MyPublishPage
          onBack={handleDrillBack}
          onPostClick={onPostClick}
        />
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* 二级Tab */}
      <div className="mb-3 border-b border-gray-100">
        <div ref={tabContainerRef} className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <div
              key={tab}
              data-tab={tab}
              className={`pb-2 cursor-pointer whitespace-nowrap transition-all duration-300 flex-shrink-0 px-3 text-[13px] ${
                activeTab === tab ? 'text-gray-900 font-medium' : 'text-gray-500'
              }`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* 滚动触发 sentinel - 社区内容区上边界标记 */}
      <div data-community-publish-trigger ref={sentinelRef} className="h-0 w-full" />

      {/* 内容区域 */}
      {drillDown ? (
        renderDrillDown()
      ) : (
        <div>
          {activeTab === '我的' && renderMyTabHome()}
          {activeTab === '关注' && renderFollowTabHome()}
          {activeTab === '全部话题' && renderAllTabHome()}
          {activeTab !== '我的' && activeTab !== '关注' && activeTab !== '全部话题' && renderPlaceholderTabHome()}
        </div>
      )}
    </div>
  );
};

export default CommunityTab;

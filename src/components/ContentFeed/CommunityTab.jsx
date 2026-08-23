import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  topics,
  getTopicByName,
  getContentsByTopicName,
  getMyVisiblePosts,
  posts,
  getCommunityInteractions,
  markCommunityInteractionRead,
  markAllCommunityInteractionsRead,
} from './communityData';
import MyPublishPage from './MyPublishPage';
import FollowTab from './FollowTab';
import WaterfallCard from './WaterfallCard';

const CommunityTab = ({ onPostClick, onTopicClick, setCommunitySubTab, setViewportActive }) => {
  const [activeTab, setActiveTab] = useState('我的');
  const [drillDown, setDrillDown] = useState(null);
  const [showInteractions, setShowInteractions] = useState(false);
  const [communityInteractions, setCommunityInteractions] = useState(() => getCommunityInteractions());
  const tabContainerRef = useRef(null);
  const sentinelRef = useRef(null);
  // 跟踪 sentinel 是否曾经离开过视口（区分"初始可见"和"滚动后回到顶部"）
  const hasBeenBelowRef = useRef(false);
  // 标记组件已完成首次挂载
  const mountedRef = useRef(false);

  // 二级Tab
  const tabs = ['占位话题1', '占位话题2', '全部话题', '关注', '我的'];

  const unreadInteractions = communityInteractions.filter((item) => item.unread);

  const interactionMeta = {
    post_comment: { label: '评论', badge: '帖子' },
    comment_reply: { label: '回复', badge: '评论' },
    comment_like: { label: '', badge: '评论' },
    post_audit_pass: { label: '', badge: '已通过' },
    post_audit_reject: { label: '', badge: '审核未通过' },
  };

  const getInteractionTimestamp = (item) => {
    if (typeof item.createdAt === 'number' && Number.isFinite(item.createdAt)) return item.createdAt;
    const parsed = Date.parse(item.createdAt);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const sortedInteractions = [...communityInteractions].sort((a, b) => {
    if (a.unread !== b.unread) return a.unread ? -1 : 1;
    const timeDiff = getInteractionTimestamp(b) - getInteractionTimestamp(a);
    if (timeDiff !== 0) return timeDiff;
    return String(b.id).localeCompare(String(a.id));
  });

  const handleInteractionClick = (item) => {
    const post = posts.find((candidate) => candidate.id === item.postId);
    if (!post) return;
    markCommunityInteractionRead(item.id);
    setCommunityInteractions(getCommunityInteractions());
    onPostClick?.(post, { commentId: item.commentId, interactionType: item.interactionType });
  };

  const handleMarkAllRead = () => {
    markAllCommunityInteractionsRead();
    setCommunityInteractions(getCommunityInteractions());
  };

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
      <div>
        {unreadInteractions.length > 0 && (
          <button
            type="button"
            className="mb-3 flex w-full items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-left shadow-sm active:bg-red-100"
            onClick={() => setShowInteractions(true)}
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-brand-red shadow-sm">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.5 8.5 0 0 1-4-.9L4 19l.9-3.2A7.4 7.4 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5c1.6 0 3.1.5 4.3 1.3" />
                <path d="m17 3 1.2 2.2L20.5 6l-2.3.8L17 9l-1.2-2.2-2.3-.8 2.3-.8L17 3Z" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium text-gray-900">社区互动</span>
              <span className="mt-0.5 block text-[12px] text-gray-500">{unreadInteractions.length} 条社区互动未读，点击查看</span>
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45352" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}
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
      </div>
    );
  };

  const renderInteractions = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full active:bg-gray-100" aria-label="返回我的" onClick={() => setShowInteractions(false)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <h3 className="text-[16px] font-semibold text-gray-900">社区互动</h3>
        {unreadInteractions.length > 0 && <button type="button" className="ml-auto text-[12px] text-brand-red" onClick={handleMarkAllRead}>全部已读</button>}
      </div>
      {sortedInteractions.map((item) => {
        const post = posts.find((candidate) => candidate.id === item.postId);
        const isAudit = item.interactionType === 'post_audit_pass' || item.interactionType === 'post_audit_reject';
        const meta = interactionMeta[item.interactionType] || { label: '新的社区互动', badge: '社区' };
        const summaryText = meta.label ? `${meta.label}：${item.summary}` : item.summary;
        const card = <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${item.unread ? 'bg-brand-red' : 'bg-transparent'}`} />;
        const auditContent = isAudit ? (
          <>
            {card}
            <span className="min-w-0 flex-1">
              <span className="flex min-w-0 items-center justify-between gap-2 text-[13px] text-gray-900">
                <strong className="min-w-0 truncate">{item.actorName}</strong>
                <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] ${item.interactionType === 'post_audit_reject' ? 'bg-red-50 text-brand-red' : 'bg-green-50 text-green-600'}`}>{meta.badge}</span>
              </span>
              <span className="mt-1 block truncate text-[12px] text-gray-600">{summaryText}</span>
              {item.interactionType === 'post_audit_reject' && item.auditReason && (
                <span className="mt-1 block text-[11px] leading-[1.5] text-gray-400">未通过原因：{item.auditReason}</span>
              )}
              <span className="mt-1 flex min-w-0 items-center justify-between gap-2 text-[11px] text-gray-400">
                <span className="min-w-0 truncate">来自：{post?.title || '社区帖子'}</span>
                <time className="flex-shrink-0 whitespace-nowrap" dateTime={item.createdAt ? String(item.createdAt) : undefined}>{item.time}</time>
              </span>
            </span>
          </>
        ) : null;

        if (isAudit) {
          if (item.interactionType === 'post_audit_reject') {
            return (
              <button type="button" key={item.id} className="flex w-full items-start gap-3 rounded-xl bg-white px-3 py-3 text-left shadow-sm active:bg-gray-50" onClick={() => handleInteractionClick(item)}>
                {auditContent}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            );
          }
          return (
            <div key={item.id} className="flex w-full items-start gap-3 rounded-xl bg-white px-3 py-3 text-left shadow-sm">
              {auditContent}
            </div>
          );
        }

        return (
          <button type="button" key={item.id} className="flex w-full items-start gap-3 rounded-xl bg-white px-3 py-3 text-left shadow-sm active:bg-gray-50" onClick={() => handleInteractionClick(item)}>
            {card}
            <span className="min-w-0 flex-1">
              <span className="flex min-w-0 items-center justify-between gap-2 text-[13px] text-gray-900">
                <strong className="min-w-0 truncate">{item.actorName}</strong>
                <span className="flex-shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{meta.badge}</span>
              </span>
              <span className="mt-1 block truncate text-[12px] text-gray-500">{summaryText}</span>
              <span className="mt-1 flex min-w-0 items-center justify-between gap-2 text-[11px] text-gray-400">
                <span className="min-w-0 truncate">来自：{post?.title || '社区帖子'}</span>
                <time className="flex-shrink-0 whitespace-nowrap" dateTime={item.createdAt ? String(item.createdAt) : undefined}>{item.time}</time>
              </span>
            </span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        );
      })}
    </div>
  );

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
              <span className="relative inline-flex items-center gap-1">
                {tab}
                {tab === '我的' && unreadInteractions.length > 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-red" aria-label="有未读社区互动" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showInteractions ? renderInteractions() : (
      <>
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
      </>
      )}
    </div>
  );
};

export default CommunityTab;

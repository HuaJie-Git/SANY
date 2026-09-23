import React, { useState } from 'react';
import { getTopicByName, posts } from './communityData';
import WaterfallCard from './WaterfallCard';

const TopicDetailPage = ({ topicName, onBack, onPostClick, demoMode = false, onRequireLogin }) => {
  const [sortBy, setSortBy] = useState('latest');
  const topic = getTopicByName(topicName, demoMode);

  if (!topic) {
    return (
      <div className="w-full min-h-full bg-bg-gray">
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center h-[44px] px-4">
            <div className="cursor-pointer mr-3" onClick={onBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </div>
            <span className="text-[16px] font-medium text-gray-900 truncate">{topicName}</span>
          </div>
        </div>
        <div className="text-center py-16 text-gray-400 text-[14px]">话题不存在</div>
      </div>
    );
  }

  // 获取该话题的公开帖子
  const topicContents = posts
    .filter((c) => c.topicId === topic.id && c.auditStatus === 'approved')
    .sort((a, b) => {
      if (sortBy === 'hottest') return b.likes - a.likes;
      return new Date(b.date) - new Date(a.date);
    });

  return (
    <div className="w-full min-h-full bg-bg-gray">
      {/* 顶部导航栏 - 话题名称作为标题 */}
      <div className="sticky top-0 bg-white z-10">
        <div className="flex items-center h-[44px] px-4">
          <button type="button" className="cursor-pointer mr-3 flex items-center justify-center -ml-1" onClick={onBack} aria-label="返回">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <span className="text-[18px] font-bold text-gray-900 flex-1 truncate">{topic.name}</span>
        </div>
        {/* 轻量下划线分隔 */}
        <div className="h-[1px] bg-gray-100"></div>
      </div>

      {/* 排序入口 - 对齐截图5：最新 最热，带红色下划线高亮 */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-6 border-b border-gray-100 bg-white">
        <button
          type="button"
          onClick={() => setSortBy('latest')}
          className="relative pb-2 text-[15px] font-bold transition-colors cursor-pointer"
        >
          <span className={sortBy === 'latest' ? 'text-[#E01923]' : 'text-gray-500 font-medium'}>
            最新
          </span>
          {sortBy === 'latest' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#E01923] rounded-full" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setSortBy('hottest')}
          className="relative pb-2 text-[15px] font-bold transition-colors cursor-pointer"
        >
          <span className={sortBy === 'hottest' ? 'text-[#E01923]' : 'text-gray-500 font-medium'}>
            最热
          </span>
          {sortBy === 'hottest' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#E01923] rounded-full" />
          )}
        </button>
      </div>

      {/* 内容瀑布流 */}
      <div className="px-4 py-2">
        {topicContents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-[14px] mb-2">暂无「{topic.name}」相关内容</div>
            <div className="text-gray-300 text-[12px]">成为第一个发布的人吧</div>
          </div>
        ) : (
          <div className="columns-2 gap-2">
            {topicContents.map((post) => (
              <WaterfallCard
                key={post.id}
                post={post}
                demoMode={demoMode}
                onRequireLogin={onRequireLogin}
                onClick={() => onPostClick?.(post)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicDetailPage;

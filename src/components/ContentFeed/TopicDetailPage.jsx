import React, { useState } from 'react';
import { getTopicByName, posts } from './communityData';
import WaterfallCard from './WaterfallCard';

const TopicDetailPage = ({ topicName, onBack, onPostClick }) => {
  const [sortBy, setSortBy] = useState('latest');
  const topic = getTopicByName(topicName);

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
          <div className="cursor-pointer mr-3" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </div>
          <span className="text-[18px] font-semibold text-gray-900 flex-1 truncate">{topic.name}</span>
        </div>
        {/* 轻量下划线分隔 */}
        <div className="h-[1px] bg-gray-100"></div>
      </div>

      {/* 排序入口 */}
      <div className="px-4 py-2.5 flex items-center gap-3">
        <div
          className={`text-[13px] cursor-pointer px-3 py-1 rounded-full transition-colors ${
            sortBy === 'latest' ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setSortBy('latest')}
        >
          最新
        </div>
        <div
          className={`text-[13px] cursor-pointer px-3 py-1 rounded-full transition-colors ${
            sortBy === 'hottest' ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setSortBy('hottest')}
        >
          最热
        </div>
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

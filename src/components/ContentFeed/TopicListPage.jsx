import React from 'react';
import { topics } from './communityData';

const TopicListPage = ({ onBack, onTopicClick }) => {
  return (
    <div className="w-full min-h-full bg-bg-gray">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center h-[44px] px-4">
          {/* 返回按钮 */}
          <div className="cursor-pointer mr-3" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </div>
          {/* 页面标题 */}
          <span className="text-[16px] font-medium text-gray-900">全部话题</span>
        </div>
      </div>

      {/* 话题列表 */}
      <div className="px-4 py-3 space-y-3">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="bg-white rounded-xl p-4 shadow-sm cursor-pointer flex items-center gap-4 w-full overflow-hidden active:bg-gray-50 transition-colors"
            onClick={() => onTopicClick?.(topic.name)}
          >
            {/* 话题图标 */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: topic.color + '20' }}
            >
              {topic.icon}
            </div>
            {/* 话题信息 */}
            <div className="flex-1 min-w-0">
              {/* 话题名称 - 单行省略 */}
              <div className="text-[14px] font-medium text-gray-900 mb-0.5 truncate">{topic.name}</div>
              {/* 话题简介 - 单行省略 */}
              <div className="text-[12px] text-gray-500 truncate mb-1">{topic.description}</div>
              {/* 统计数据 */}
              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                <span>{topic.contentCount} 内容</span>
                <span>{topic.participantCount} 参与</span>
                <span>🔥 {topic.heat}</span>
              </div>
            </div>
            {/* 箭头 */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" className="flex-shrink-0">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicListPage;

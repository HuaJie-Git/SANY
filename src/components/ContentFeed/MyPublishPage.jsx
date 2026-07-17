import React from 'react';
import { getMyVisiblePosts } from './communityData';
import WaterfallCard from './WaterfallCard';

const MyPublishPage = ({ onBack, onPostClick }) => {
  const visiblePosts = getMyVisiblePosts();
  const approvedCount = visiblePosts.filter((p) => p.auditStatus === 'approved').length;
  const pendingCount = visiblePosts.filter((p) => p.auditStatus === 'pending').length;

  return (
    <div className="w-full min-h-full bg-bg-gray">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center h-[44px] px-4">
          <div className="cursor-pointer mr-3" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </div>
          <span className="text-[16px] font-medium text-gray-900">我的发布</span>
        </div>
      </div>

      {/* 本人内容摘要 */}
      <div className="px-4 py-3 bg-white border-b border-gray-50">
        <div className="flex items-center gap-4 text-[13px] text-gray-600">
          <span>共 <span className="font-medium text-gray-900">{visiblePosts.length}</span> 条内容</span>
          <span className="text-gray-300">|</span>
          <span>{approvedCount} 条已公开</span>
          {pendingCount > 0 && (
            <>
              <span className="text-gray-300">|</span>
              <span>{pendingCount} 条仅自己可见</span>
            </>
          )}
        </div>
      </div>

      {/* 瀑布流列表 */}
      <div className="px-4 py-3">
        {visiblePosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-[14px]">暂无发布内容</div>
          </div>
        ) : (
          <div className="columns-2 gap-2">
            {visiblePosts.map((post) => (
              <div key={post.id} className="relative">
                <WaterfallCard
                  post={post}
                  onClick={() => onPostClick?.(post)}
                  isMyView={true}
                />
                {/* 审核状态角标 - 仅自己可见的内容 */}
                {post.auditStatus === 'pending' && (
                  <div className="absolute top-1.5 left-1.5 bg-black/40 text-white/90 text-[10px] px-1.5 py-0.5 rounded z-10">
                    仅自己可见
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPublishPage;

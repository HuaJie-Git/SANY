import React from 'react';
import WaterfallCard from './WaterfallCard';
import { getFollowedUserPosts } from './communityData';

const FollowTab = ({ onPostClick }) => {
  const followedPosts = getFollowedUserPosts();

  return (
    <div className="w-full">
      {/* 关注流内容 */}
      {followedPosts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="text-gray-500 text-[14px] mb-1">暂未关注任何用户</div>
          <div className="text-gray-400 text-[12px]">去社区看看，关注感兴趣的作者吧</div>
        </div>
      ) : (
        <div className="columns-2 gap-2">
          {followedPosts.map((post) => (
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

export default FollowTab;

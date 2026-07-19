import React, { forwardRef } from 'react';
import ViewCountBadge from './ViewCountBadge';
import { getUserById } from './communityData';

// 统一瀑布流卡片 - 用于所有社区双列瀑布流
// Props:
//   post         - 帖子对象
//   onClick      - 点击回调
//   showAuthor   - 是否显示作者（默认 true）
//   imageHeight  - 图片高度（默认 h-[160px]）
//   isMyView     - 是否为"我的"视角（默认 false），控制审核状态胶囊显示
const WaterfallCard = forwardRef(({
  post,
  onClick,
  showAuthor = true,
  imageHeight = 'h-[160px]',
  isMyView = false,
}, ref) => {
  const author = getUserById(post.authorId);

  // 审核状态：仅 pending 在"我的"视角显示橙黄胶囊
  const showPendingBadge = isMyView && post.auditStatus === 'pending';

  return (
    <div
      ref={ref}
      className="break-inside-avoid mb-2 bg-white rounded-[11px] overflow-hidden shadow-sm cursor-pointer active:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      {/* 图片区域 - isolate 创建独立 stacking context，防止徽标穿透 */}
      <div className="relative isolate overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className={`w-full ${imageHeight} object-cover`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className={`w-full ${imageHeight} bg-gradient-to-br from-gray-200 to-gray-300 items-center justify-center hidden`}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="5" y="5" width="30" height="30" rx="2" stroke="#666" strokeWidth="2" fill="none"/>
            <path d="M10 25L15 18L20 22L25 15L30 20V28C30 29.1 29.1 30 28 30H12C10.9 30 10 29.1 10 28V25Z" fill="#999"/>
          </svg>
        </div>
        {/* 视频播放按钮 + 时长 */}
        {post.type === 'video' && (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 2L14 8L4 14V2Z" fill="white"/>
                </svg>
              </div>
            </div>
            {post.duration && (
              <div className="absolute bottom-2 right-2 z-[1] bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium tabular-nums">
                {post.duration}
              </div>
            )}
          </>
        )}
        {/* 审核中状态 - 橙黄色半透明胶囊，右上角，不遮挡左下角浏览量 */}
        {showPendingBadge && (
          <div className="absolute top-1.5 right-1.5 bg-amber-500/80 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-full">
            审核中
          </div>
        )}
        {/* 浏览量徽标 - pending 帖子始终显示 0 */}
        <ViewCountBadge views={post.auditStatus === 'pending' ? 0 : (post.views ?? 0)} />
      </div>

      {/* 信息区域 */}
      <div className="p-2">
        {/* 标题 - 最多2行省略 */}
        <div className="text-[13px] font-medium text-gray-900 leading-[1.35] line-clamp-2 break-words mb-1">
          {post.title}
        </div>

        {/* 作者信息 */}
        {showAuthor && author && (
          <div className="flex items-center gap-1.5 mb-1">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-5 h-5 rounded-full object-cover flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="text-[11px] text-gray-600 truncate">{author.name}</span>
            {author.isOfficial && (
              <span className="flex-shrink-0 text-[9px] font-medium text-brand-red bg-red-50 px-1 py-px rounded leading-tight">官方</span>
            )}
          </div>
        )}

        {/* 时间和互动 */}
        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span>{post.date}</span>
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{post.likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

WaterfallCard.displayName = 'WaterfallCard';

export default WaterfallCard;

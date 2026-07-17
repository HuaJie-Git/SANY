import React, { useState, useRef } from 'react';
import {
  getTopicById,
  getUserById,
  getCurrentUser,
  isFollowing,
  toggleFollow,
  addComment,
  getCommentsByPostId,
} from './communityData';
import ViewCountBadge from './ViewCountBadge';

const PostDetail = ({ post, onBack, onTopicClick }) => {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(getCommentsByPostId(post.id));
  const [following, setFollowing] = useState(isFollowing(post.authorId));

  const commentSectionRef = useRef(null);
  const commentInputRef = useRef(null);

  const topic = getTopicById(post.topicId);
  const author = getUserById(post.authorId);
  const currentUser = getCurrentUser();
  const isOwnPost = post.authorId === currentUser.id;

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => liked ? c - 1 : c + 1);
  };

  const handleFollow = () => {
    const nowFollowing = toggleFollow(post.authorId);
    setFollowing(nowFollowing);
  };

  // 点击评论按钮 → 滚动到评论区并聚焦输入框
  const handleCommentClick = () => {
    commentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => commentInputRef.current?.focus(), 350);
  };

  const handleSubmitComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    const newComment = addComment(post.id, trimmed);
    setComments((prev) => [...prev, newComment]);
    setCommentText('');
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const isVideo = post.type === 'video';

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col">
      {/* 顶部导航栏 */}
      <div className="flex-shrink-0 flex items-center h-[44px] px-4 border-b border-gray-100 bg-white">
        <div className="cursor-pointer mr-3" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </div>
        <span className="text-[16px] font-medium text-gray-900 flex-1 truncate">帖子详情</span>
        <div className="w-[20px]"></div>
      </div>

      {/* 可滚动内容区 */}
      <div className="flex-1 overflow-y-auto">
        {/* 图片/视频区域 */}
        <div className="relative bg-black">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-[260px] object-cover"
          />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 bg-black/50 rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                  <path d="M4 2L14 8L4 14V2Z" fill="white"/>
                </svg>
              </div>
            </div>
          )}
          <ViewCountBadge views={post.views} />
        </div>

        {/* 内容信息 */}
        <div className="px-4 pt-3 pb-2">
          {/* 标题 */}
          <h1 className="text-[17px] font-bold text-gray-900 leading-[1.4] mb-3 break-words">
            {post.title}
          </h1>

          {/* 正文 */}
          <div className="text-[14px] text-gray-700 leading-[1.7]">
            {post.content || '这是一篇社区帖子，分享关于工程机械的经验和见解。'}
          </div>

          {/* 话题标签 - 正文末尾 */}
          {topic && (
            <div className="mt-3 pt-3 border-t border-gray-50">
              <span
                className="text-[13px] text-brand-red cursor-pointer hover:underline"
                onClick={() => onTopicClick?.(topic.name)}
              >
                # {topic.name}
              </span>
            </div>
          )}
        </div>

        {/* 作者信息区域 */}
        {author && (
          <div className="px-4 py-3 border-t border-gray-50">
            <div className="flex items-center gap-3">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-gray-900 truncate">{author.name}</div>
                <div className="text-[12px] text-gray-500">{post.date} 发布</div>
              </div>
              {/* 关注按钮 - 仅其他用户显示 */}
              {!isOwnPost && (
                <div
                  className={`px-4 py-1.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors ${
                    following
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-brand-red text-white'
                  }`}
                  onClick={handleFollow}
                >
                  {following ? '已关注' : '关注'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 互动操作栏 - 点赞与评论同级排列 */}
        <div className="px-4 py-3 flex items-center gap-6 border-t border-gray-50">
          {/* 点赞 */}
          <div
            className={`flex items-center gap-1.5 cursor-pointer select-none ${liked ? 'text-brand-red' : 'text-gray-600'}`}
            onClick={handleLike}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span className="text-[14px] tabular-nums">{likeCount}</span>
          </div>

          {/* 评论 - 点击滚动到评论区并聚焦输入框 */}
          <div
            className="flex items-center gap-1.5 cursor-pointer select-none text-gray-600"
            onClick={handleCommentClick}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="text-[14px] tabular-nums">{comments.length}</span>
          </div>
        </div>

        {/* 浏览量统计 - 仅文字 */}
        <div className="px-4 pb-2 text-[12px] text-gray-400">
          {post.views.toLocaleString()} 浏览
        </div>

        {/* 评论区域 */}
        <div ref={commentSectionRef} className="px-4 pt-3 pb-4 border-t border-gray-100">
          <h3 className="text-[15px] font-medium text-gray-900 mb-3">
            评论 ({comments.length})
          </h3>

          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-[13px]">
              暂无评论，快来抢沙发吧
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <img
                    src={c.userAvatar}
                    alt={c.userName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[13px] font-medium text-gray-900 truncate">{c.userName}</span>
                      <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">{c.time}</span>
                    </div>
                    <div className="text-[13px] text-gray-700 leading-[1.5]">{c.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部固定区域 - 仅评论输入框和发送按钮 */}
      <div className="flex-shrink-0 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <input
            ref={commentInputRef}
            type="text"
            className="flex-1 h-[36px] bg-gray-100 rounded-full px-4 text-[13px] outline-none focus:ring-1 focus:ring-brand-red/30"
            placeholder="写评论..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleCommentKeyDown}
          />
          <div
            className={`px-4 h-[36px] flex items-center rounded-full cursor-pointer transition-colors ${
              commentText.trim() ? 'bg-brand-red text-white' : 'bg-gray-200 text-gray-400'
            }`}
            onClick={handleSubmitComment}
          >
            <span className="text-[13px]">发送</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

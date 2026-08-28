import React, { useState, useRef, useEffect } from 'react';
import {
  getTopicById,
  getUserById,
  getCurrentUser,
  isFollowing,
  toggleFollow,
  addComment,
  deleteComment,
  getCommentsByPostId,
} from './communityData';
import ViewCountBadge from './ViewCountBadge';

const COMMENT_MAX_LENGTH = 500;

const PostDetail = ({ post, onBack, onTopicClick, onDelete, targetCommentId, targetStatus }) => {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(getCommentsByPostId(post.id));
  const [expandedRoots, setExpandedRoots] = useState(() => new Set(targetCommentId ? [targetCommentId] : []));
  const [replyTarget, setReplyTarget] = useState(null);
  const [commentSort, setCommentSort] = useState('default');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [expandedAllRoots, setExpandedAllRoots] = useState(() => new Set());
  const [expandedComments, setExpandedComments] = useState(() => new Set());
  const [following, setFollowing] = useState(isFollowing(post.authorId));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const commentSectionRef = useRef(null);
  const commentInputRef = useRef(null);
  const targetCommentRef = useRef(null);

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
    const newComment = addComment(post.id, trimmed, replyTarget ? {
      rootCommentId: replyTarget.rootCommentId,
      parentCommentId: replyTarget.id,
      replyToUserId: replyTarget.userId,
    } : {});
    setComments((prev) => [...prev, newComment]);
    setCommentText('');
    setReplyTarget(null);
    if (newComment.rootCommentId) {
      setExpandedRoots((prev) => new Set(prev).add(newComment.rootCommentId));
    }
  };

  const handleReply = (comment) => {
    const rootCommentId = comment.rootCommentId || comment.id;
    setReplyTarget({ ...comment, rootCommentId });
    setExpandedRoots((prev) => new Set(prev).add(rootCommentId));
    window.setTimeout(() => commentInputRef.current?.focus(), 50);
  };

  const handleCommentLike = (commentId) => {
    setComments((prev) => prev.map((comment) => {
      if (comment.id !== commentId) return comment;
      const isLiked = !comment.isLiked;
      return { ...comment, isLiked, likeCount: Math.max(0, (comment.likeCount || 0) + (isLiked ? 1 : -1)) };
    }));
  };

  const requestDeleteComment = (comment) => {
    if (comment.userId !== currentUser.id) return;
    setCommentToDelete(comment);
  };

  const handleDeleteCommentConfirm = () => {
    if (!commentToDelete || !deleteComment(commentToDelete.id)) {
      setCommentToDelete(null);
      return;
    }
    const rootId = commentToDelete.rootCommentId || commentToDelete.id;
    setComments((prev) => prev.filter((comment) => (
      commentToDelete.parentCommentId
        ? comment.id !== commentToDelete.id
        : comment.id !== commentToDelete.id && (comment.rootCommentId || comment.id) !== rootId
    )));
    setExpandedRoots((prev) => {
      const next = new Set(prev);
      next.delete(rootId);
      return next;
    });
    if (replyTarget?.id === commentToDelete.id) setReplyTarget(null);
    setCommentToDelete(null);
  };

  const isLongComment = (comment) => (comment.content || '').length > 80;
  const toggleCommentExpanded = (commentId) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  const repliesByRoot = comments.reduce((groups, comment) => {
    if (!comment.parentCommentId) return groups;
    const rootId = comment.rootCommentId || comment.parentCommentId;
    groups[rootId] = [...(groups[rootId] || []), comment];
    return groups;
  }, {});
  const rootComments = comments
    .filter((comment) => !comment.parentCommentId)
    .sort((a, b) => {
      if (commentSort === 'latest') return (b.id || 0) - (a.id || 0);
      if (commentSort === 'likes') return (b.likeCount || 0) - (a.likeCount || 0);
      const aScore = (a.likeCount || 0) + (repliesByRoot[a.rootCommentId || a.id]?.length || 0) * 2;
      const bScore = (b.likeCount || 0) + (repliesByRoot[b.rootCommentId || b.id]?.length || 0) * 2;
      return bScore - aScore;
    });

  useEffect(() => {
    if (!targetCommentId) return;
    const target = comments.find((comment) => comment.id === targetCommentId);
    if (!target) return;
    const rootId = target.rootCommentId || target.id;
    setExpandedRoots((prev) => new Set(prev).add(rootId));
    window.setTimeout(() => targetCommentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
  }, [targetCommentId, comments]);

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    onDelete?.(post.id);
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
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 bg-black/50 rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                    <path d="M4 2L14 8L4 14V2Z" fill="white"/>
                  </svg>
                </div>
              </div>
              {post.duration && (
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[12px] px-2 py-0.5 rounded font-medium tabular-nums">
                  {post.duration}
                </div>
              )}
            </>
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

          {post.auditStatus === 'rejected' && post.auditReason && (
            <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-brand-red">审核未通过</span>
              </div>
              <p className="mt-1.5 text-[12px] leading-[1.6] text-gray-600">未通过原因：{post.auditReason}</p>
            </div>
          )}
          {targetStatus === 'comment_deleted' && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-[12px] text-gray-500" role="status">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
              <span>该内容已删除</span>
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
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-medium text-gray-900 truncate">{author.name}</span>
                  {author.isOfficial && (
                    <span className="flex-shrink-0 text-[10px] font-medium text-brand-red bg-red-50 px-1.5 py-0.5 rounded leading-tight">官方</span>
                  )}
                </div>
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

          {/* 删除 - 仅本人帖子显示，紧随评论操作 */}
          {isOwnPost && (
            <button
              type="button"
              className="flex items-center gap-1.5 cursor-pointer select-none text-brand-red"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18"/>
                <path d="M8 6V4h8v2"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v5M14 11v5"/>
              </svg>
              <span className="text-[14px]">删除</span>
            </button>
          )}
        </div>

        {/* 浏览量统计 - 仅文字 */}
        <div className="px-4 pb-2 text-[12px] text-gray-400">
          {post.views.toLocaleString()} 浏览
        </div>

        {/* 评论区域 */}
        <div
          ref={commentSectionRef}
          className="px-4 pt-3 pb-4 border-t border-gray-100"
          onClick={(event) => {
            if (event.target === event.currentTarget && replyTarget) setReplyTarget(null);
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-medium text-gray-900">评论 ({comments.length})</h3>
            <div role="group" aria-label="评论排序">
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-1 text-[12px] text-gray-500"
                aria-haspopup="menu"
                aria-expanded={sortMenuOpen}
                onClick={() => setSortMenuOpen((open) => !open)}
              >
                {commentSort === 'latest' ? '最新' : commentSort === 'likes' ? '最多点赞' : '默认'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {sortMenuOpen && (
                <div className="absolute right-0 top-7 z-20 w-[128px] overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-[0_8px_24px_rgba(15,23,42,0.14)]" role="menu">
                  {[
                    { key: 'default', label: '默认' },
                    { key: 'latest', label: '最新' },
                    { key: 'likes', label: '最多点赞' },
                  ].map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      role="menuitemradio"
                      aria-checked={commentSort === option.key}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] text-gray-700 active:bg-gray-50"
                      onClick={() => { setCommentSort(option.key); setSortMenuOpen(false); }}
                    >
                      <span>{option.label}</span>
                      {commentSort === option.key && <span className="text-brand-red text-[16px] leading-none">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            </div>
          </div>

          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-[13px]">
              暂无评论，快来抢沙发吧
            </div>
          ) : (
            <div className="space-y-5">
              {rootComments.map((c) => {
                const rootId = c.rootCommentId || c.id;
                const isTargetRoot = targetCommentId === c.id || targetCommentId === rootId;
                const replies = repliesByRoot[rootId] || [];
                const visibleReplies = expandedAllRoots.has(rootId) ? replies : replies.slice(0, 5);
                return (
                <div key={c.id} ref={isTargetRoot ? targetCommentRef : undefined} className={isTargetRoot ? 'rounded-lg bg-red-50/70 p-2 ring-1 ring-brand-red/30' : ''}>
                <div className="flex gap-2.5">
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
                    <div className="relative text-[13px] text-gray-700 leading-[1.5]">
                      <div style={isLongComment(c) && !expandedComments.has(c.id) ? { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden', paddingRight: '38px' } : undefined}>
                        {c.content}
                      </div>
                      {isLongComment(c) && (
                        <button type="button" className="absolute bottom-0 right-0 bg-white pl-1 text-brand-red" onClick={() => toggleCommentExpanded(c.id)}>
                          {expandedComments.has(c.id) ? '收起' : '...展开'}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
                      <button type="button" className="hover:text-brand-red" onClick={() => handleReply(c)}>回复</button>
                      <button
                        type="button"
                        aria-label={c.isLiked ? '取消点赞评论' : '点赞评论'}
                        className={`inline-flex items-center gap-1 hover:text-brand-red ${c.isLiked ? 'text-brand-red' : ''}`}
                        onClick={() => handleCommentLike(c.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={c.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span>{c.likeCount || 0}</span>
                      </button>
                      {c.userId === currentUser.id && (
                        <button type="button" className="hover:text-brand-red" onClick={() => requestDeleteComment(c)}>删除</button>
                      )}
                    </div>
                  </div>
                </div>
                {replies.length > 0 && (
                  <div className="ml-10 mt-2">
                    {!expandedRoots.has(rootId) ? (
                      <button type="button" className="text-[12px] text-brand-red" onClick={() => setExpandedRoots((prev) => new Set(prev).add(rootId))}>
                        展开 {replies.length} 条回复
                      </button>
                    ) : (
                      <>
                        <div className="space-y-3 border-l-2 border-gray-100 pl-3">
                          {visibleReplies.map((reply) => (
                            <div key={reply.id} ref={targetCommentId === reply.id ? targetCommentRef : undefined} className={`flex gap-2 ${targetCommentId === reply.id ? 'rounded-lg bg-red-50/70 p-1.5 ring-1 ring-brand-red/30' : ''}`}>
                              <img src={reply.userAvatar} alt={reply.userName} className="w-6 h-6 rounded-full object-cover flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[12px] font-medium text-gray-800 truncate">{reply.userName}</span>
                                  <span className="text-[10px] text-gray-400 flex-shrink-0">{reply.time}</span>
                                </div>
                                <div
                                  className="relative mt-0.5 text-[12px] text-gray-600 leading-[1.5] cursor-pointer"
                                  onClick={() => handleReply(reply)}
                                >
                                  <div style={isLongComment(reply) && !expandedComments.has(reply.id) ? { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden', paddingRight: '38px' } : undefined}>
                                  {reply.replyToUserId && (
                                    <span
                                      className="text-brand-red mr-1 cursor-pointer"
                                      onClick={(event) => { event.stopPropagation(); handleReply({ ...reply, userId: reply.replyToUserId, userName: getUserById(reply.replyToUserId)?.name || '用户' }); }}
                                    >
                                      回复 @{getUserById(reply.replyToUserId)?.name || '用户'}
                                    </span>
                                  )}
                                  {reply.content}
                                  </div>
                                  {isLongComment(reply) && (
                                    <button type="button" className="absolute bottom-0 right-0 bg-white pl-1 text-brand-red" onClick={(event) => { event.stopPropagation(); toggleCommentExpanded(reply.id); }}>
                                      {expandedComments.has(reply.id) ? '收起' : '...展开'}
                                    </button>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-1.5 text-[11px] text-gray-400">
                                  <button type="button" className="hover:text-brand-red" onClick={() => handleReply(reply)}>回复</button>
                                  <button
                                    type="button"
                                    aria-label={reply.isLiked ? '取消点赞回复' : '点赞回复'}
                                    className={`inline-flex items-center gap-1 hover:text-brand-red ${reply.isLiked ? 'text-brand-red' : ''}`}
                                    onClick={() => handleCommentLike(reply.id)}
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill={reply.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                    <span>{reply.likeCount || 0}</span>
                                  </button>
                                  {reply.userId === currentUser.id && (
                                    <button type="button" className="hover:text-brand-red" onClick={() => requestDeleteComment(reply)}>删除</button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {replies.length > 5 && !expandedAllRoots.has(rootId) && (
                          <button type="button" className="text-[12px] text-brand-red mt-2" onClick={() => setExpandedAllRoots((prev) => new Set(prev).add(rootId))}>展开更多回复</button>
                        )}
                        <button type="button" className="text-[12px] text-gray-400 mt-2 ml-3" onClick={() => setExpandedRoots((prev) => { const next = new Set(prev); next.delete(rootId); return next; })}>收起回复</button>
                      </>
                    )}
                  </div>
                )}
                </div>
              ); })}
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
            placeholder={replyTarget ? `回复 @${replyTarget.userName}` : '写评论...'}
            value={commentText}
            maxLength={COMMENT_MAX_LENGTH}
            aria-label={replyTarget ? `回复 ${replyTarget.userName}` : '写评论'}
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

      {/* 删除二次确认 */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 z-[60] flex items-end bg-black/45 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full overflow-hidden rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-post-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-4 text-center">
              <h2 id="delete-post-title" className="text-[17px] font-semibold text-gray-900">删除这条帖子？</h2>
              <p className="mt-2 text-[13px] leading-5 text-gray-500">删除后无法恢复，相关评论也会一并删除。</p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                type="button"
                className="flex-1 py-3.5 text-[16px] text-gray-600 active:bg-gray-50"
                onClick={() => setShowDeleteConfirm(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="flex-1 border-l border-gray-100 py-3.5 text-[16px] font-medium text-brand-red active:bg-red-50"
                onClick={handleDeleteConfirm}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 评论/回复删除二次确认 */}
      {commentToDelete && (
        <div
          className="absolute inset-0 z-[65] flex items-end bg-black/45 p-4"
          onClick={() => setCommentToDelete(null)}
        >
          <div
            className="w-full overflow-hidden rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-comment-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-4 text-center">
              <h2 id="delete-comment-title" className="text-[17px] font-semibold text-gray-900">删除这条评论？</h2>
              <p className="mt-2 text-[13px] leading-5 text-gray-500">删除后无法恢复，请确认是否继续。</p>
            </div>
            <div className="flex border-t border-gray-100">
              <button type="button" className="flex-1 py-3.5 text-[16px] text-gray-600 active:bg-gray-50" onClick={() => setCommentToDelete(null)}>取消</button>
              <button type="button" className="flex-1 border-l border-gray-100 py-3.5 text-[16px] font-medium text-brand-red active:bg-red-50" onClick={handleDeleteCommentConfirm}>删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;

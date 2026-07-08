import React, { useState } from 'react';

const ContentDetail = ({ item, onClose, contentType, onLike, onCollect }) => {
  const [isLiked, setIsLiked] = useState(item.isLiked || false);
  const [isCollected, setIsCollected] = useState(item.isCollected || false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { id: 1, user: '用户A', content: '很好的内容！', time: '2小时前' },
    { id: 2, user: '用户B', content: '学习到了很多', time: '3小时前' },
  ]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike(item.id);
  };

  const handleCollect = () => {
    setIsCollected(!isCollected);
    if (onCollect) onCollect(item.id);
  };

  const handleComment = () => {
    if (comment.trim()) {
      setComments([...comments, {
        id: comments.length + 1,
        user: '我',
        content: comment,
        time: '刚刚'
      }]);
      setComment('');
    }
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // 根据内容类型判断是否显示评论功能
  const showComment = contentType === '机手社区';

  // 判断是否是视频内容
  const isVideo = item.type === 'video' || item.type === 'community_video';

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col">
      {/* 状态栏 */}
      <div className="h-[44px] flex items-center justify-between px-4 bg-white">
        <span className="text-black text-[14px] font-medium">9:41</span>
        <div className="flex items-center gap-1">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 8H3V12H1V8Z" fill="#333"/>
            <path d="M5 5H7V12H5V5Z" fill="#333"/>
            <path d="M9 3H11V12H9V3Z" fill="#333"/>
            <path d="M13 0H15V12H13V0Z" fill="#333"/>
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2C10.76 2 13.07 3.61 14.1 6L15.5 4.5C14.14 2.58 11.23 1 8 1C4.77 1 1.86 2.58 0.5 4.5L1.9 6C2.93 3.61 5.24 2 8 2Z" fill="#333"/>
            <path d="M8 5C9.66 5 11.14 5.69 12.11 6.88L13.5 5.5C12.2 3.98 10.21 3 8 3C5.79 3 3.8 3.98 2.5 5.5L3.89 6.88C4.86 5.69 6.34 5 8 5Z" fill="#333"/>
            <path d="M8 8C8.83 8 9.58 8.34 10.12 8.9L11.5 7.5C10.6 6.6 9.37 6 8 6C6.63 6 5.4 6.6 4.5 7.5L5.88 8.9C6.42 8.34 7.17 8 8 8Z" fill="#333"/>
            <circle cx="8" cy="11" r="1.5" fill="#333"/>
          </svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="#333" strokeOpacity="0.35"/>
            <rect x="2" y="2" width="18" height="8" rx="1" fill="#333"/>
            <path d="M23 4V8C23.5523 8 24 7.5523 24 7V5C24 4.4477 23.5523 4 23 4Z" fill="#333" fillOpacity="0.4"/>
          </svg>
        </div>
      </div>

      {/* 顶部导航栏 - 显示内容标题 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <div
          className="cursor-pointer"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-[16px] font-medium text-text-primary flex-1 text-center truncate px-2">
          {item.title}
        </span>
        <div className="w-[24px]"></div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {/* 图片/视频区域 */}
        <div className="relative">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-[250px] object-cover"
          />

          {/* 视频播放按钮 */}
          {isVideo && !isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={handlePlay}
            >
              <div className="w-[60px] h-[60px] bg-black/50 rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4L18 12L6 20V4Z" fill="white"/>
                </svg>
              </div>
            </div>
          )}

          {/* 视频播放控制条 */}
          {isVideo && isPlaying && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              {/* 进度条 */}
              <div className="w-full h-[3px] bg-gray-300 rounded-full mb-2">
                <div className="w-[30%] h-full bg-brand-red rounded-full"></div>
              </div>
              {/* 控制按钮 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* 暂停按钮 */}
                  <div className="cursor-pointer" onClick={handlePlay}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="3" width="4" height="14" fill="white"/>
                      <rect x="12" y="3" width="4" height="14" fill="white"/>
                    </svg>
                  </div>
                  {/* 时间显示 */}
                  <span className="text-white text-[12px]">01:23 / 05:45</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* 清晰度 */}
                  <span className="text-white text-[12px]">1080P</span>
                  {/* 全屏按钮 */}
                  <div className="cursor-pointer">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 7V3H7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 3H17V7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 13V17H13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 17H3V13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 内容信息 */}
        <div className="p-4">
          <h1 className="text-[18px] font-bold text-text-primary mb-2">{item.title}</h1>

          {/* 作者信息 */}
          {item.author && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-[32px] h-[32px] bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-[14px] text-text辅助">{item.author[0]}</span>
              </div>
              <div>
                <div className="text-[14px] font-medium text-text-primary">{item.author}</div>
                <div className="text-[12px] text-text辅助">{item.date}</div>
              </div>
            </div>
          )}

          {/* 互动数据 */}
          <div className="flex items-center gap-4 text-[12px] text-text辅助 mb-4">
            <span>👁 {item.views || 0} 浏览</span>
            {item.likes && <span>❤️ {item.likes} 点赞</span>}
            {item.comments && <span>💬 {item.comments} 评论</span>}
          </div>

          {/* 内容正文 */}
          <div className="text-[14px] text-text-secondary leading-relaxed mb-4">
            {contentType === '机手社区' ? (
              <>
                <p className="mb-3">今天在工地拍到的三一设备，真的太帅了！</p>
                <p className="mb-3">作为一个机手，看到这样的设备，内心充满了自豪感。</p>
                <p className="mb-3">三一的设备质量确实没话说，运行稳定，效率高。</p>
                <p>分享给大家，希望对正在选择设备的朋友有帮助。</p>
              </>
            ) : contentType === '行业动态' ? (
              <>
                <p className="mb-3">这篇文章详细介绍了三一设备的最新技术和应用场景。</p>
                <p className="mb-3">随着工程机械行业的数字化转型，三一设备在智能化、环保性方面都有了很大提升。</p>
                <p>本文将从技术角度分析三一设备的优势和特点。</p>
              </>
            ) : (
              <>
                <p className="mb-3">本内容详细介绍了三一设备的相关信息。</p>
                <p className="mb-3">希望对您有所帮助。</p>
              </>
            )}
          </div>

          {/* 评论区域 - 只有机手社区显示 */}
          {showComment && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-[16px] font-medium text-text-primary mb-3">评论 ({comments.length})</h3>

              {/* 评论列表 */}
              <div className="space-y-3 mb-4">
                {comments.map((item) => (
                  <div key={item.id} className="flex gap-2">
                    <div className="w-[32px] h-[32px] bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[12px] text-text辅助">{item.user[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-medium text-text-primary">{item.user}</span>
                        <span className="text-[12px] text-text辅助">{item.time}</span>
                      </div>
                      <div className="text-[14px] text-text-secondary mt-1">{item.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="border-t border-gray-100 px-4 py-3 bg-white">
        {showComment ? (
          // 机手社区：显示评论输入框
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 h-[36px] bg-gray-100 rounded-full px-4 text-[14px] outline-none"
              placeholder="写评论..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div
              className={`px-4 py-1.5 rounded-full cursor-pointer ${
                comment.trim() ? 'bg-brand-red text-white' : 'bg-gray-200 text-text辅助'
              }`}
              onClick={handleComment}
            >
              <span className="text-[14px]">发送</span>
            </div>
          </div>
        ) : (
          // 其他Tab：显示互动按钮
          <div className="flex items-center justify-around">
            <div
              className={`flex items-center gap-1 cursor-pointer ${isLiked ? 'text-brand-red' : 'text-text辅助'}`}
              onClick={handleLike}
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill={isLiked ? 'currentColor' : 'none'} xmlns="http://www.w3.org/2000/svg">
                <path d="M8 14.25L6.935 13.29C3.4 10.14 1 7.87 1 5.14C1 2.87 2.78 1 5 1C6.14 1 7.24 1.51 8 2.29C8.76 1.51 9.86 1 11 1C13.22 1 15 2.87 15 5.14C15 7.87 12.6 10.14 9.065 13.29L8 14.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[14px]">{isLiked ? '已点赞' : '点赞'}</span>
            </div>
            <div
              className={`flex items-center gap-1 cursor-pointer ${isCollected ? 'text-brand-red' : 'text-text辅助'}`}
              onClick={handleCollect}
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill={isCollected ? 'currentColor' : 'none'} xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2H3C2.45 2 2 2.45 2 3V14L8 11L14 14V3C14 2.45 13.55 2 13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[14px]">{isCollected ? '已收藏' : '收藏'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentDetail;

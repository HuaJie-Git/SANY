import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import CommunityPublish from '../CommunityPublish/CommunityPublish';
import CommunityTab from './CommunityTab';
import PostDetail from './PostDetail';
import TopicDetailPage from './TopicDetailPage';
import { deletePost, posts as allPosts } from './communityData';

const ContentFeed = forwardRef(({
  showPublishPage,
  setShowPublishPage,
  setIsCommunityPublishEligible,
  setIsCommunityPublishViewportActive,
  onInquiry: _onInquiry,
  demoMode = false,
  onRequireLogin,
}, ref) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [interactionTargetStatus, setInteractionTargetStatus] = useState(null);
  const [topicDetail, setTopicDetail] = useState(null); // { topicName, source }
  const [communitySubTab, setCommunitySubTab] = useState('故障求助'); // 社区二级Tab，默认选中故障求助
  const [communityTabKey, setCommunityTabKey] = useState(0);

  // 处理点击发布按钮 — 直接进入编辑页
  const handlePublishClick = () => {
    setShowPublishPage(true);
  };

  // 处理点击社区帖子 - 进入帖子详情
  const handlePostClick = (post, interactionContext = null) => {
    const latestPost = allPosts.find((p) => p.id === post.id) || post;
    setSelectedPost(latestPost);
    setSelectedCommentId(interactionContext?.commentId || null);
    setInteractionTargetStatus(interactionContext?.targetStatus || null);
  };

  // 删除后回到社区「我的」列表，并刷新瀑布流内容
  const handlePostDelete = (postId) => {
    if (!deletePost(postId)) return;

    setSelectedPost(null);
    setSelectedCommentId(null);
    setInteractionTargetStatus(null);
    setTopicDetail(null);
    setCommunitySubTab('我的');
    setCommunityTabKey((key) => key + 1);
  };

  // 处理点击话题 - 进入话题详情页（source: 'directory' | 'postDetail' | 'communityTab'）
  const handleTopicClick = (topicName, source = 'communityTab') => {
    setTopicDetail({ topicName, source });
  };

  // 话题详情页返回
  const handleTopicBack = () => {
    setTopicDetail(null);
  };

  // 暴露 handlePublishClick 给父组件
  useImperativeHandle(ref, () => ({
    handlePublishClick,
  }));

  // ─── 社区发布按钮资格：ContentFeed 内部计算，上报 Home ───
  // 我的/关注/具体话题 Tab → true
  // 话题分类目录 → false
  // TopicDetailPage（任何来源）→ true
  // PostDetail → false
  // CommunityPublish → false（由 Home 的 showPublishPage 控制）
  useEffect(() => {
    // PostDetail 显示 → 不可发布
    if (selectedPost) {
      setIsCommunityPublishEligible?.(false);
      return;
    }
    // TopicDetailPage 显示 → 可发布（不论来源）
    if (topicDetail) {
      setIsCommunityPublishEligible?.(true);
      return;
    }
    // 社区根页面：话题目录不可发布，其他可发布
    setIsCommunityPublishEligible?.(communitySubTab !== '话题' && communitySubTab !== '全部话题');
  }, [selectedPost, topicDetail, communitySubTab, setIsCommunityPublishEligible]);

  // TopicDetailPage → viewportActive=true; PostDetail → viewportActive=false
  // CommunityTab 的滚动触发也会设置 viewportActive（社区根页面）
  useEffect(() => {
    if (topicDetail) {
      setIsCommunityPublishViewportActive?.(true);
    } else if (selectedPost) {
      setIsCommunityPublishViewportActive?.(false);
    }
  }, [topicDetail, selectedPost, setIsCommunityPublishViewportActive]);

  // 如果显示发布页面，直接返回发布页面
  if (showPublishPage) {
    return <CommunityPublish onClose={() => setShowPublishPage(false)} />;
  }

  // 如果显示话题详情页（三级页面，全屏覆盖）
  if (topicDetail) {
    return (
      <TopicDetailPage
        topicName={topicDetail.topicName}
        onBack={handleTopicBack}
        onPostClick={handlePostClick}
      />
    );
  }

  // 如果显示社区帖子详情页
  if (selectedPost) {
    return (
      <PostDetail
        post={selectedPost}
        targetCommentId={selectedCommentId}
        targetStatus={interactionTargetStatus}
        demoMode={demoMode}
        onRequireLogin={onRequireLogin}
        onBack={() => {
          setSelectedPost(null);
          setSelectedCommentId(null);
          setInteractionTargetStatus(null);
        }}
        onTopicClick={(topicName) => {
          setSelectedPost(null);
          handleTopicClick(topicName, 'postDetail');
        }}
        onDelete={handlePostDelete}
      />
    );
  }

  return (
    <div className="px-4 py-3 relative">
      <CommunityTab
        key={communityTabKey}
        demoMode={demoMode}
        onRequireLogin={onRequireLogin}
        onPostClick={handlePostClick}
        onTopicClick={handleTopicClick}
        setCommunitySubTab={setCommunitySubTab}
        setViewportActive={setIsCommunityPublishViewportActive}
      />
    </div>
  );
});

ContentFeed.displayName = 'ContentFeed';

export default ContentFeed;

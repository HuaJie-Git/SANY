// ============================================================
// 后台内容管理数据源 — 与社区前台 communityData 联动
// ============================================================
import {
  posts as communityPosts,
  users as communityUsers,
  getTopicById,
} from '../components/ContentFeed/communityData';

// 初始化：从社区帖子生成后台内容列表
const initContentItems = () =>
  communityPosts.map((p) => {
    const topic = getTopicById(p.topicId);
    const author = communityUsers.find((u) => u.id === p.authorId);
    return {
      id: p.id,
      topicCode: topic ? `QZ2025${String(topic.id).padStart(6, '0')}` : '—',
      topicName: topic ? `#${topic.name}` : '—',
      sender: p.authorId === 'sany-official' ? '官方' : '用户',
      content: p.title,
      contentBody: p.content || '',
      views: p.views ?? 0,
      likes: p.likes ?? 0,
      commentCount: p.comments ?? 0,
      senderName: author?.name ?? '—',
      contact: p.authorId === 'sany-official' ? '400-887-0000' : `${p.authorId}@sany.com`,
      type: p.type,
      image: p.image,
      duration: p.duration ?? null,
      authorId: p.authorId,
      date: p.date,
      auditStatus: p.auditStatus || 'approved',
      auditHistory: [],
    };
  });

let _contentItems = initContentItems();
let _nextContentId = 1000;

export const getContentItems = () => _contentItems;

// 获取待审核内容（仅用户投稿，官方不进入审核队列）
export const getPendingAuditItems = () =>
  _contentItems.filter((c) => c.sender === '用户' && c.auditStatus === 'pending');

export const deleteContentItem = (id) => {
  _contentItems = _contentItems.filter((c) => c.id !== id);
  // 同步删除社区前台
  const idx = communityPosts.findIndex((p) => p.id === id);
  if (idx !== -1) communityPosts.splice(idx, 1);
};

// 审核通过
export const approveContent = (id, auditor) => {
  const item = _contentItems.find((c) => c.id === id);
  if (!item) return false;
  item.auditStatus = 'approved';
  item.auditHistory.push({ action: '通过', auditor, time: new Date().toISOString().slice(0, 19), reason: '' });
  // 同步到社区前台
  const post = communityPosts.find((p) => p.id === id);
  if (post) post.auditStatus = 'approved';
  return true;
};

// 审核不通过
export const rejectContent = (id, auditor, reason) => {
  const item = _contentItems.find((c) => c.id === id);
  if (!item) return false;
  item.auditStatus = 'rejected';
  item.auditHistory.push({ action: '不通过', auditor, time: new Date().toISOString().slice(0, 19), reason });
  // 同步到社区前台
  const post = communityPosts.find((p) => p.id === id);
  if (post) post.auditStatus = 'rejected';
  return true;
};

// 删除内容（审核中/通过/不通过均可用）
export const auditDeleteContent = (id, auditor, reason) => {
  const item = _contentItems.find((c) => c.id === id);
  if (!item) return false;
  item.auditStatus = 'deleted';
  item.auditHistory.push({ action: '删除', auditor, time: new Date().toISOString().slice(0, 19), reason });
  // 同步到社区前台 — 删除帖子
  const idx = communityPosts.findIndex((p) => p.id === id);
  if (idx !== -1) communityPosts.splice(idx, 1);
  return true;
};

// 官方发布 — 新增内容并同步到社区前台
export const officialPublish = ({
  title,
  content,
  topicId,
  type,
  image,
  duration,
  topicCode,
}) => {
  const topic = getTopicById(topicId);
  const newId = _nextContentId++;

  const newItem = {
    id: newId,
    topicCode: topicCode || (topic ? `QZ2025${String(topic.id).padStart(6, '0')}` : '—'),
    topicName: topic ? `#${topic.name}` : '—',
    sender: '官方',
    content: title,
    contentBody: content || '',
    views: 0,
    likes: 0,
    commentCount: 0,
    senderName: '三一官方',
    contact: '400-887-0000',
    type,
    image: image || topic?.icon || 'images/机手社区/三一重卡/三一重卡_01.jpg',
    duration: duration || null,
    authorId: 'sany-official',
    date: new Date().toISOString().slice(0, 10),
    auditStatus: 'approved', // 官方发布直接通过
    auditHistory: [],
  };
  _contentItems.unshift(newItem);

  communityPosts.unshift({
    id: newId,
    authorId: 'sany-official',
    topicId,
    title,
    content,
    image: newItem.image,
    views: 0,
    likes: 0,
    comments: 0,
    date: newItem.date,
    type,
    duration: duration || undefined,
    auditStatus: 'approved',
    isLiked: false,
  });

  return newItem;
};

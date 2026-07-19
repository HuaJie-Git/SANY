// ============================================================
// 后台内容管理数据源 — 与社区前台 communityData 联动
// ============================================================
import {
  posts as communityPosts,
  users as communityUsers,
  getTopicById,
} from '../components/ContentFeed/communityData';

// 标准删除原因
export const DELETE_REASONS = ['违规内容', '虚假/误导', '广告/垃圾信息', '侵权', '其他'];

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
      targetRegions: [], // 目标国区（空=全量可见）
      targetRoles: [],  // 目标角色（空=全量可见）
      deleteStatus: '正常', // 正常 / 已删除
      deleteReason: '',
      deleteTime: '',
      deleter: '',
    };
  });

// 为已审核的演示数据补齐审核记录
const addDemoAuditHistory = (items) => {
  // id=105 审核不通过
  const rejected = items.find((c) => c.id === 105);
  if (rejected && rejected.auditHistory.length === 0) {
    rejected.auditHistory.push({
      action: '不通过',
      auditor: '管理员',
      time: '2026-07-14 16:20:00',
      reason: '内容不符合社区规范，包含敏感信息',
    });
  }
  // 为几条审核通过的帖子补齐审核记录
  const approvedIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const auditors = ['管理员', '内容审核员A', '内容审核员B'];
  approvedIds.forEach((id, idx) => {
    const item = items.find((c) => c.id === id);
    if (item && item.auditStatus === 'approved' && item.auditHistory.length === 0) {
      item.auditHistory.push({
        action: '通过',
        auditor: auditors[idx % auditors.length],
        time: `2026-07-${String(10 + (idx % 9)).padStart(2, '0')} ${String(9 + (idx % 12)).padStart(2, '0')}:${String(10 + idx * 7 % 50).padStart(2, '0')}:00`,
        reason: '',
      });
    }
  });
  return items;
};

// 添加一些预设删除状态的演示数据
const addDemoDeletedItems = (items) => {
  // 标记两条为"已删除"演示数据
  if (items.length > 5) {
    items[5].deleteStatus = '已删除';
    items[5].deleteReason = '广告/垃圾信息：内容包含外部推广链接';
    items[5].deleteTime = '2026-07-18 14:30:00';
    items[5].deleter = '管理员';
  }
  if (items.length > 8) {
    items[8].deleteStatus = '已删除';
    items[8].deleteReason = '违规内容：违反社区规范';
    items[8].deleteTime = '2026-07-17 09:15:00';
    items[8].deleter = '系统管理员';
  }
  return items;
};

let _contentItems = addDemoAuditHistory(addDemoDeletedItems(initContentItems()));
let _nextContentId = 1000;

export const getContentItems = () => _contentItems;

// 获取待审核内容（仅用户投稿，官方不进入审核队列）
export const getPendingAuditItems = () =>
  _contentItems.filter((c) => c.sender === '用户' && c.auditStatus === 'pending' && c.deleteStatus === '正常');

// 软删除内容（内容管理中使用）
export const softDeleteContent = (id, operator, reason) => {
  const item = _contentItems.find((c) => c.id === id);
  if (!item) return false;
  item.deleteStatus = '已删除';
  item.deleteReason = reason;
  item.deleteTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
  item.deleter = operator;
  // 同步到社区前台 — 删除帖子
  const idx = communityPosts.findIndex((p) => p.id === id);
  if (idx !== -1) communityPosts.splice(idx, 1);
  return true;
};

// 审核通过
export const approveContent = (id, auditor) => {
  const item = _contentItems.find((c) => c.id === id);
  if (!item) return false;
  item.auditStatus = 'approved';
  item.auditHistory.push({ action: '通过', auditor, time: new Date().toISOString().slice(0, 19), reason: '' });
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
  const post = communityPosts.find((p) => p.id === id);
  if (post) post.auditStatus = 'rejected';
  return true;
};

// 删除内容（审核中使用）
export const auditDeleteContent = (id, auditor, reason) => {
  const item = _contentItems.find((c) => c.id === id);
  if (!item) return false;
  item.auditStatus = 'deleted';
  item.deleteStatus = '已删除';
  item.deleteReason = reason;
  item.deleteTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
  item.deleter = auditor;
  item.auditHistory.push({ action: '删除', auditor, time: item.deleteTime, reason });
  const idx = communityPosts.findIndex((p) => p.id === id);
  if (idx !== -1) communityPosts.splice(idx, 1);
  return true;
};

// 官方发布
export const officialPublish = ({ title, content, topicId, type, image, duration, topicCode, targetRegions, targetRoles }) => {
  const topic = getTopicById(topicId);
  const newId = _nextContentId++;
  const newItem = {
    id: newId,
    topicCode: topicCode || (topic ? `QZ2025${String(topic.id).padStart(6, '0')}` : '—'),
    topicName: topic ? `#${topic.name}` : '—',
    sender: '官方', content: title, contentBody: content || '',
    views: 0, likes: 0, commentCount: 0,
    senderName: '三一官方', contact: '400-887-0000',
    type, image: image || topic?.icon || 'images/机手社区/三一重卡/三一重卡_01.jpg',
    duration: duration || null, authorId: 'sany-official',
    date: new Date().toISOString().slice(0, 10),
    auditStatus: 'approved', auditHistory: [],
    targetRegions: targetRegions || [],
    targetRoles: targetRoles || [],
    deleteStatus: '正常', deleteReason: '', deleteTime: '', deleter: '',
  };
  _contentItems.unshift(newItem);
  communityPosts.unshift({
    id: newId, authorId: 'sany-official', topicId, title, content,
    image: newItem.image, views: 0, likes: 0, comments: 0,
    date: newItem.date, type, duration: duration || undefined,
    auditStatus: 'approved', isLiked: false,
  });
  return newItem;
};

// 评论管理演示数据。真实接入时由评论查询、删除与通知接口替换。
export const COMMENT_DELETE_REASONS = ['违规内容', '虚假/误导', '广告/垃圾信息', '侵权', '其他'];
export const COMMENT_DELETE_REASON_MAX_LENGTH = 200;

const graphemeSegmenter = typeof Intl !== 'undefined' && Intl.Segmenter
  ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  : null;

export const splitVisibleCharacters = (value = '') => (
  graphemeSegmenter
    ? Array.from(graphemeSegmenter.segment(value), ({ segment }) => segment)
    : Array.from(value)
);

export const normalizeDeleteReason = (value = '') => (
  splitVisibleCharacters(value.trim()).slice(0, COMMENT_DELETE_REASON_MAX_LENGTH).join('')
);

let _comments = [
  { id: 1, postId: 1, postTitle: '三一E6电动正面吊投入使用,助力绿色智慧升级', topicName: '#设备操作', userId: 'user-002', userName: '机手小赵', content: '写得很好，学到了！', createdAt: '2026-07-14 14:20:00', likeCount: 18, status: '正常', deleteReason: '', deleteTime: '', deleter: '' },
  { id: 2, postId: 1, postTitle: '三一E6电动正面吊投入使用,助力绿色智慧升级', topicName: '#设备操作', userId: 'user-004', userName: '效率达人', content: '确实，起步检查很重要', createdAt: '2026-07-14 13:20:00', likeCount: 9, status: '待审核', deleteReason: '', deleteTime: '', deleter: '' },
  { id: 3, postId: 101, postTitle: '分享下我的操作经验，新手们必看', topicName: '#设备操作', userId: 'user-003', userName: '老司机李', content: '经验之谈，值得学习！', createdAt: '2026-07-13 18:40:00', likeCount: 6, status: '正常', deleteReason: '', deleteTime: '', deleter: '' },
  { id: 4, postId: 101, postTitle: '分享下我的操作经验，新手们必看', topicName: '#设备操作', userId: 'user-008', userName: '新手学徒', content: '加个联系方式，低价卖设备配件，保证正品。', createdAt: '2026-07-13 17:12:00', likeCount: 0, status: '正常', deleteReason: '', deleteTime: '', deleter: '' },
  { id: 5, postId: 3, postTitle: '设备保养小技巧分享，延长设备寿命', topicName: '#保养技巧', userId: 'user-006', userName: '安全员小李', content: '保养工作做得很到位', createdAt: '2026-07-12 09:30:00', likeCount: 4, status: '已删除', deleteReason: '违规内容：包含不当引导信息', deleteTime: '2026-07-12 10:02:18', deleter: '管理员', notificationStatus: '已发送', notificationTime: '2026-07-12 10:02:18' },
  { id: 6, postId: 4, postTitle: '吊装作业全过程记录', topicName: '#工程现场', userId: 'user-011', userName: '经验达人', content: '吊装作业确实需要全程记录', createdAt: '2026-07-11 16:05:00', likeCount: 3, status: '正常', deleteReason: '', deleteTime: '', deleter: '' },
  { id: 7, postId: 5, postTitle: '10年操作经验分享', topicName: '#经验分享', userId: 'user-010', userName: '入门导师', content: '10年经验不容易，佩服！', createdAt: '2026-07-10 12:20:00', likeCount: 12, status: '正常', deleteReason: '', deleteTime: '', deleter: '' },
];

export const getCommentItems = () => _comments;

export const deleteCommentByAdmin = (id, operator, reason) => {
  const item = _comments.find((comment) => comment.id === id);
  const normalizedReason = normalizeDeleteReason(reason);
  if (!item || item.status === '已删除' || !normalizedReason) return false;
  const processedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
  item.status = '已删除';
  item.deleteReason = normalizedReason;
  item.deleteTime = processedAt;
  item.deleter = operator;
  item.auditTime = processedAt;
  item.auditor = operator;
  item.notificationStatus = '已发送';
  item.notificationTime = processedAt;
  return true;
};

export const approveCommentByAdmin = (id, operator) => {
  const item = _comments.find((comment) => comment.id === id);
  if (!item || item.status !== '待审核') return false;
  item.status = '正常';
  item.auditTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
  item.auditor = operator;
  return true;
};

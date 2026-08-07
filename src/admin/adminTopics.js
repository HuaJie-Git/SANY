// ============================================================
// 后台话题管理数据源 — 与社区前台 communityData 联动
// 占位话题关联配置在话题弹窗内（话题.placeholder 字段），
// 每个占位位同时只能关联一个开启中的话题，一对一
// ============================================================
import { topics as communityTopics } from '../components/ContentFeed/communityData';

// 话题类型（仅普通热门话题）
export const TOPIC_TYPES = ['热门话题'];

// 类型 → 社区前台位置映射
export const TYPE_TO_MAPPING = {
  '热门话题': '社区 > 热门话题',
};

// 首页占位位（两个固定占位入口，由话题弹窗内开关单选关联）
export const PLACEHOLDER_OPTIONS = ['占位话题1', '占位话题2'];

// 为每个社区话题生成后台管理数据
const generateAdminCode = (id) => `QZ2025${String(id).padStart(6, '0')}`;

const initAdminTopics = () =>
  communityTopics.map((t) => ({
    id: t.id,
    code: generateAdminCode(t.id),
    sort: t.id,
    name: t.name,
    type: '热门话题',
    status: '开启',
    // 演示数据：话题9/10 分别关联两个占位位
    placeholder: t.id === 9 ? '占位话题1' : t.id === 10 ? '占位话题2' : null,
    createdAt: `2025-${String(12 - (t.id % 12)).padStart(2, '0')}-${String(15 + (t.id % 13)).padStart(2, '0')} ${String(8 + (t.id % 12)).padStart(2, '0')}:${String(10 + (t.id * 7) % 50).padStart(2, '0')}:00`,
  }));

let _adminTopics = initAdminTopics();
let _nextId = _adminTopics.length + 1;

// 获取全部后台话题
export const getAdminTopics = () => _adminTopics;

// 根据ID获取
export const getAdminTopicById = (id) => _adminTopics.find((t) => t.id === id) || null;

// 新增话题
export const addAdminTopic = (topic) => {
  const newTopic = {
    ...topic,
    id: _nextId++,
    code: generateAdminCode(_nextId - 1),
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  _adminTopics.push(newTopic);
  syncToCommunity();
  return newTopic;
};

// 更新话题
export const updateAdminTopic = (id, updates) => {
  const idx = _adminTopics.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  _adminTopics[idx] = { ..._adminTopics[idx], ...updates };
  syncToCommunity();
  return _adminTopics[idx];
};

// 删除话题
export const deleteAdminTopic = (id) => {
  _adminTopics = _adminTopics.filter((t) => t.id !== id);
  syncToCommunity();
};

// 切换状态（话题关闭时占位关联不生效但保留配置，重新开启时恢复）
export const toggleTopicStatus = (id) => {
  const topic = _adminTopics.find((t) => t.id === id);
  if (!topic) return;
  topic.status = topic.status === '开启' ? '关闭' : '开启';
  syncToCommunity();
};

// ─── 占位话题关联 ───

// 检查占位位是否被其他开启中话题占用（excludeTopicId 排除自身）
export const checkPlaceholderOccupied = (placeholderKey, excludeTopicId = null) => {
  if (!placeholderKey) return { conflict: false };
  const occupant = _adminTopics.find(
    (t) => t.id !== excludeTopicId && t.status === '开启' && t.placeholder === placeholderKey
  );
  return occupant ? { conflict: true, occupant } : { conflict: false };
};

// 执行占位关联：当前话题关联该位；旧占用话题自动解除；一对一
// 当前话题的新关联已由 addAdminTopic/updateAdminTopic 写入
export const applyPlaceholder = (topicId, placeholderKey) => {
  if (!placeholderKey) return;
  // 解除其他开启中话题对该占位位的关联
  _adminTopics.forEach((t) => {
    if (t.id !== topicId && t.status === '开启' && t.placeholder === placeholderKey) {
      t.placeholder = null;
    }
  });
  syncToCommunity();
};

// 解除话题的占位关联（占位开关关闭时）
export const clearPlaceholder = (topicId) => {
  const topic = _adminTopics.find((t) => t.id === topicId);
  if (!topic) return;
  topic.placeholder = null;
  syncToCommunity();
};

// ─── 同步到社区前台 ───
const syncToCommunity = () => {
  _adminTopics.forEach((at) => {
    const ct = communityTopics.find((t) => t.id === at.id);
    if (ct) {
      ct.name = at.name;
      ct.status = at.status;
      ct.adminType = at.type;
      // 占位关联仅在话题开启时对前台生效（关闭时保留配置但不映射）
      ct.adminMapping = {
        community: true,
        placeholder: at.status === '开启' ? at.placeholder || null : null,
      };
    }
  });
};

// 获取社区映射的话题（供社区全部话题/快捷Tab使用）
export const getCommunityTopics = () =>
  _adminTopics.filter((t) => t.status === '开启');

// 获取占位映射（供APP替换占位话题使用；仅开启中话题的关联生效）
export const getPlaceholderMapping = () => {
  const result = {};
  _adminTopics
    .filter((t) => t.status === '开启' && t.placeholder)
    .forEach((t) => {
      result[t.placeholder] = t.name;
    });
  return result;
};

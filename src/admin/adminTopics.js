// ============================================================
// 后台话题管理数据源 — 与社区前台 communityData 联动
// ============================================================
import { topics as communityTopics } from '../components/ContentFeed/communityData';

// 话题类型（仅三个值，类型即决定社区前台映射位置）
export const TOPIC_TYPES = ['热门话题', '热门话题占位一', '热门话题占位二'];

// 类型 → 社区前台位置映射
export const TYPE_TO_MAPPING = {
  '热门话题': '社区 > 热门话题',
  '热门话题占位一': '社区 > 热门话题占位一',
  '热门话题占位二': '社区 > 热门话题占位二',
};

// 类型 → APP 占位话题名称（用于与 communityData 联动）
export const TYPE_TO_PLACEHOLDER = {
  '热门话题占位一': '占位话题1',
  '热门话题占位二': '占位话题2',
};

// 为每个社区话题生成后台管理数据
const generateAdminCode = (id) => `QZ2025${String(id).padStart(6, '0')}`;

// 根据话题ID推断初始类型（与 communityData 对应）
const inferType = (id) => {
  if (id === 9) return '热门话题占位一';
  if (id === 10) return '热门话题占位二';
  return '热门话题';
};

const initAdminTopics = () =>
  communityTopics.map((t) => ({
    id: t.id,
    code: generateAdminCode(t.id),
    sort: t.id,
    name: t.name,
    type: inferType(t.id),
    status: '开启',
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

// 切换状态
export const toggleTopicStatus = (id) => {
  const topic = _adminTopics.find((t) => t.id === id);
  if (!topic) return;
  topic.status = topic.status === '开启' ? '关闭' : '开启';
  syncToCommunity();
};

// ─── 校验：同一占位类型最多1个开启中话题 ───
export const validatePlaceholderType = (type, excludeId = null) => {
  if (!TYPE_TO_PLACEHOLDER[type]) return { valid: true };
  const conflict = _adminTopics.find(
    (t) => t.id !== excludeId && t.status === '开启' && t.type === type
  );
  if (conflict) {
    return {
      valid: false,
      message: `该占位类型已被话题"${conflict.name}"占用，同一占位最多绑定1个开启中话题`,
    };
  }
  return { valid: true };
};

// ─── 同步到社区前台 ───
const syncToCommunity = () => {
  _adminTopics.forEach((at) => {
    const ct = communityTopics.find((t) => t.id === at.id);
    if (ct) {
      ct.name = at.name;
      ct.status = at.status;
      ct.adminType = at.type;
      // 占位类型映射到 APP 占位话题
      const placeholderName = TYPE_TO_PLACEHOLDER[at.type];
      ct.adminMapping = {
        community: true,
        placeholder: placeholderName || null,
      };
    }
  });
};

// 获取社区映射的话题（供社区全部话题/快捷Tab使用）
export const getCommunityTopics = () =>
  _adminTopics.filter((t) => t.status === '开启');

// 获取占位映射（供APP替换占位话题使用）
export const getPlaceholderMapping = () => {
  const result = {};
  _adminTopics
    .filter((t) => t.status === '开启' && TYPE_TO_PLACEHOLDER[t.type])
    .forEach((t) => {
      result[TYPE_TO_PLACEHOLDER[t.type]] = t.name;
    });
  return result;
};

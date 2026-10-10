export const QUICK_LINKS_KEY = 'sanvist_pc_quick_links_catalog_v1';
const LEGACY_URLS_KEY = 'sanvist_pc_quick_link_urls_v1';

export const AUDIENCE_OPTIONS = [
  { value: 'all', label: '所有用户', description: '所有 PC 用户都可以看到' },
  { value: 'enterprise', label: '企业用户', description: '选定企业租户下的用户可见' },
  { value: 'users', label: '指定用户', description: '仅选中的用户可以看到' },
];

export const PREVIEW_TENANTS = [
  { id: 'tenant-sany-test', name: '三一测试租户' },
  { id: 'tenant-sany-india', name: 'SANY Heavy Industry India Pvt Ltd' },
];

// 原型搜索样例；正式版本应从用户目录检索有效账号。
export const PREVIEW_USERS = [
  { id: 'user-yibao', name: '一包，。', tenantId: 'tenant-sany-test', tenant: '三一测试租户', tenantType: 'enterprise' },
  { id: 'user-bowo', name: 'Bowo_Medan', tenantId: 'tenant-sany-test', tenant: '三一测试租户', tenantType: 'enterprise' },
  { id: 'user-niran', name: 'Niran_Cool', tenantId: 'tenant-sany-test', tenant: '三一测试租户', tenantType: 'enterprise' },
  { id: 'user-asha', name: 'Asha（企业用户样例）', tenantId: 'tenant-sany-india', tenant: 'SANY Heavy Industry India Pvt Ltd', tenantType: 'enterprise' },
  { id: 'user-chenxiao', name: '陈晓（个人用户样例）', tenantId: 'tenant-personal-chen', tenant: '个人租户', tenantType: 'personal' },
];

export function audienceLabel(row) {
  if (row.audience === 'enterprise') return `企业用户 · ${PREVIEW_TENANTS.find((tenant) => tenant.id === row.tenantId)?.name || '租户已失效'}`;
  if (row.audience === 'users') return `指定用户 · ${row.userIds?.length || 0} 人`;
  if (row.audience === 'none') return '未配置';
  return '所有用户';
}

export const PRESET_ICONS = [
  { value: 'link', label: '链接', symbol: '↗' },
  { value: 'map', label: '地图', symbol: '◇' },
  { value: 'alert', label: '预警', symbol: '△' },
  { value: 'calendar', label: '日历', symbol: '▦' },
  { value: 'project', label: '项目', symbol: '▣' },
  { value: 'asset', label: '设备', symbol: '▤' },
  { value: 'order', label: '工单', symbol: '☷' },
  { value: 'person', label: '人员', symbol: '♙' },
];
export const TONES = [
  { value: 'blue', label: '蓝色' }, { value: 'orange', label: '橙色' },
  { value: 'green', label: '绿色' }, { value: 'red', label: '红色' },
  { value: 'purple', label: '紫色' },
];
export const DEFAULT_LINKS = [
  { id: 'map-monitor', name: '地图监控', url: 'https://mysany.sanygroup.com/pc/map-monitor', sort: 10, enabled: true, audience: 'all', tenantId: '', userIds: [], tone: 'blue', icon: 'link', iconData: '', action: 'map-monitor', builtIn: true, createdAt: '2026-08-01 09:30:00' },
  { id: 'warning-center', name: '预警中心', url: 'https://mysany.sanygroup.com/pc/warning-center', sort: 20, enabled: true, audience: 'all', tenantId: '', userIds: [], tone: 'orange', icon: 'link', iconData: '', action: 'warning-center', builtIn: true, createdAt: '2026-08-01 09:35:00' },
  { id: 'maintenance-navigation', name: '设备保养', url: 'https://mysany.sanygroup.com/pc/maintenance', sort: 30, enabled: true, audience: 'all', tenantId: '', userIds: [], tone: 'green', icon: 'link', iconData: '', action: 'maintenance', builtIn: true, createdAt: '2026-08-01 09:40:00' },
  { id: 'project-management', name: '项目管理', url: 'https://mysany.sanygroup.com/pc/project-management', sort: 40, enabled: true, audience: 'all', tenantId: '', userIds: [], tone: 'red', icon: 'link', iconData: '', action: 'projects', builtIn: true, createdAt: '2026-08-01 09:45:00' },
];

export const sortLinks = (rows) => [...rows].sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, 'zh-CN'));

export function readQuickLinks() {
  const raw = window.localStorage.getItem(QUICK_LINKS_KEY);
  if (!raw) {
    let legacy = {};
    try { legacy = JSON.parse(window.localStorage.getItem(LEGACY_URLS_KEY) || 'null')?.urls || {}; } catch { /* 沿用预置入口 */ }
    return { revision: null, links: DEFAULT_LINKS.map((row) => ({ ...row, url: typeof legacy[row.id] === 'string' && legacy[row.id] ? legacy[row.id] : row.url })) };
  }
  const value = JSON.parse(raw);
  if (!value || !Array.isArray(value.links)) throw new Error('配置格式错误');
  const seen = new Set();
  let needPersist = false;
  const links = value.links.filter((row) => row && typeof row.id === 'string' && !seen.has(row.id) && seen.add(row.id)).map((row) => {
    const original = DEFAULT_LINKS.find((item) => item.id === row.id);
    const defaultUrl = original?.url || '';
    const defaultCreatedAt = original?.createdAt || '--';
    const effectiveUrl = typeof row.url === 'string' && row.url ? row.url : defaultUrl;
    const effectiveCreatedAt = typeof row.createdAt === 'string' && row.createdAt !== '系统预置' ? row.createdAt : defaultCreatedAt;
    if (row.url !== effectiveUrl || row.createdAt !== effectiveCreatedAt) {
      needPersist = true;
    }
    return {
      id: row.id,
      name: typeof row.name === 'string' ? row.name : original?.name || '未命名链接',
      url: effectiveUrl,
      sort: Number.isInteger(row.sort) ? row.sort : 999,
      enabled: row.enabled !== false,
      audience: row.audience === undefined ? 'all' : AUDIENCE_OPTIONS.some((option) => option.value === row.audience) ? row.audience : 'none',
      tenantId: typeof row.tenantId === 'string' ? row.tenantId : '',
      userIds: Array.isArray(row.userIds) ? [...new Set(row.userIds.filter((id) => typeof id === 'string'))] : [],
      tone: TONES.some((tone) => tone.value === row.tone) ? row.tone : original?.tone || 'blue',
      icon: PRESET_ICONS.some((icon) => icon.value === row.icon) ? row.icon : original?.icon || 'link',
      iconData: typeof row.iconData === 'string' && /^data:image\/(png|jpeg|webp);base64,/.test(row.iconData) ? row.iconData : '',
      action: original?.action || 'external',
      builtIn: Boolean(original),
      createdAt: effectiveCreatedAt,
    };
  });
  if (needPersist) {
    try {
      window.localStorage.setItem(QUICK_LINKS_KEY, JSON.stringify({ revision: value.revision || null, links: sortLinks(links) }));
    } catch { /* ignore */ }
  }
  return { revision: value.revision || null, links: sortLinks(links) };
}

export function validateLinkUrl(value, required) {
  const trimmed = value.trim();
  if (!trimmed) return required ? '请输入访问地址' : '';
  if (trimmed.length > 2048) return '访问地址不能超过 2048 个字符';
  if (/\s/.test(trimmed)) return '访问地址不能包含空格或换行';
  try {
    const url = new URL(trimmed);
    if (['http:', 'https:'].includes(url.protocol) && url.hostname && !url.username && !url.password) return '';
  } catch { /* 使用下方统一提示 */ }
  return '请输入完整的 http:// 或 https:// 地址，且不能包含账号密码';
}

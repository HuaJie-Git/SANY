import { ADMIN_ROLES } from './roleWorkbench';

export const LINK_LANGUAGES = [
  { code: 'en', label: '英文', default: true }, { code: 'zh', label: '中文' },
  { code: 'id', label: '印尼语' }, { code: 'fr', label: '法语' },
  { code: 'es', label: '西班牙语' }, { code: 'pt', label: '葡萄牙语' },
  { code: 'th', label: '泰语' }, { code: 'ar', label: '阿拉伯语', rtl: true },
  { code: 'ru', label: '俄语' }, { code: 'it', label: '意大利语' },
  { code: 'de', label: '德语' }, { code: 'km', label: '柬埔寨语' },
  { code: 'ko', label: '韩语' }, { code: 'ms', label: '马来语' }, { code: 'vi', label: '越南语' },
];
export const PRODUCT_GROUPS = [
  { id: 'excavator', name: '挖掘机' }, { id: 'pump', name: '泵车' },
  { id: 'pump-upper', name: '泵车上装' }, { id: 'truck-pump', name: '车载泵' },
  { id: 'placing-boom', name: '布料杆' }, { id: 'asphalt', name: '沥青搅拌站' },
  { id: 'concrete', name: '混凝土搅拌站' }, { id: 'mixer', name: '搅拌车' },
  { id: 'dozer', name: '推土机' }, { id: 'crane', name: '起重机' },
  { id: 'widebody', name: '宽体车' }, { id: 'road', name: '路面机械' },
];
export const LINK_ROLES = ADMIN_ROLES.map(({ id, name }) => ({ id, name }));
export const LINK_TYPES = [
  { value: 'internal', label: '内部链接' },
  { value: 'external', label: '网页（Web / H5）' },
  { value: 'external-auth', label: '网页（Web / H5，需鉴权）' },
];
export const linkTypeValue = (row) => row.linkType === 'internal' ? 'internal' : row.authEnabled ? 'external-auth' : 'external';
export const INTERNAL_TARGETS = [
  { id: 'map-monitor', name: '地图监控', url: '#/map-monitor' },
  { id: 'warning-center', name: '预警中心', url: '#/warning-center' },
  { id: 'maintenance', name: '设备保养', url: '#/maintenance' },
  { id: 'projects', name: '项目管理', url: '#/projects' },
];
export const PREVIEW_PROFILES = {
  'user-yibao': { roleIds: ['owner'], productGroupIds: ['excavator', 'pump', 'widebody'], pro: true },
  'user-bowo': { roleIds: ['admin'], productGroupIds: ['excavator', 'pump', 'widebody'], pro: true },
  'user-niran': { roleIds: ['operator'], productGroupIds: ['pump'], pro: false },
  'user-asha': { roleIds: ['enterprise'], productGroupIds: ['crane', 'road'], pro: true },
  'user-chenxiao': { roleIds: ['owner'], productGroupIds: [], pro: false },
};
const DEFAULT_ENGLISH = { 'map-monitor': 'Map Monitoring', 'warning-center': 'Alert Center', 'maintenance-navigation': 'Maintenance', 'project-management': 'Project Management' };
const stringMap = (map) => Object.fromEntries(Object.entries(map && typeof map === 'object' && !Array.isArray(map) ? map : {}).filter(([, value]) => typeof value === 'string'));
const stringIds = (values) => Array.isArray(values) ? [...new Set(values.filter((id) => typeof id === 'string'))] : [];
export const isLinkImage = (value) => typeof value === 'string' && /^data:image\/(png|jpeg|webp);base64,/.test(value);

export function quickLinkAddress(value, internal = false) {
  if (typeof value !== 'string') return '';
  const address = value.trim();
  if (!address || address.length > 2048 || /[\s\\]/.test(address) || Array.from(address).some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) return '';
  if (internal && (/^#\/.+/.test(address) || /^\/(?!\/)/.test(address))) return address;
  try {
    const url = new URL(address);
    return ['http:', 'https:'].includes(url.protocol) && url.hostname && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

export function enterpriseScope(row) {
  const tenantIds = Array.isArray(row.tenantIds) ? stringIds(row.tenantIds) : typeof row.tenantId === 'string' && row.tenantId ? [row.tenantId] : [];
  const hadSelection = Array.isArray(row.tenantIds) ? row.tenantIds.length > 0 : Boolean(row.tenantId);
  const tenantMode = row.tenantMode === 'selected' || hadSelection || row.tenantMode && row.tenantMode !== 'all' ? 'selected' : 'all';
  return { tenantMode, tenantIds };
}

export function hasRoleProductRestriction(row) {
  return ['roles', 'products'].includes(row.audience) || Boolean(row.roleIds?.length || row.productGroupIds?.length || row.productGroupMode === 'selected');
}
export function quickLinkScopeKind(row) {
  const audience = row.audience || 'all';
  const roles = Boolean(row.roleIds?.length);
  const products = Boolean(row.productGroupIds?.length || row.productGroupMode === 'selected');
  if (audience === 'roles') return products ? 'legacy' : 'roles';
  if (audience === 'products') return roles ? 'legacy' : 'products';
  return roles || products ? 'legacy' : audience;
}
export function proScopeError(row) {
  return row.proOnly && hasRoleProductRestriction(row) ? '仅 Pro 用户不能与角色或产品组范围同时启用，请关闭 Pro 或调整可见范围' : '';
}

// 仅迁移未设置类型、且地址仍为旧预置值的入口；保留运营手动配置的外链。
export function quickLinkDestination(row) {
  const presets = {
    'map-monitor': ['map-monitor', 'https://mysany.sanygroup.com/pc/map-monitor'],
    'warning-center': ['warning-center', 'https://mysany.sanygroup.com/pc/warning-center'],
    'maintenance-navigation': ['maintenance', 'https://mysany.sanygroup.com/pc/maintenance'],
    'project-management': ['projects', 'https://mysany.sanygroup.com/pc/project-management'],
  };
  const preset = presets[row.id];
  const migrate = !row.linkType && preset && (!row.url || row.url === preset[1]);
  const linkType = migrate || row.linkType === 'internal' ? 'internal' : 'external';
  const internalTarget = migrate ? preset[0] : typeof row.internalTarget === 'string' ? row.internalTarget : '';
  const legacyUrl = INTERNAL_TARGETS.find((target) => target.id === internalTarget)?.url || '';
  return { linkType, internalTarget, url: migrate ? legacyUrl : row.url || (linkType === 'internal' ? legacyUrl : '') };
}

export function linkExtraFields(row) {
  const translations = stringMap(row.translations);
  const enName = typeof row.enName === 'string' ? row.enName : DEFAULT_ENGLISH[row.id] || (typeof row.name === 'string' ? row.name : '');
  if (!row.translations && typeof row.name === 'string' && row.name) translations.zh = row.name;
  const destination = quickLinkDestination(row);
  return {
    enName, translations,
    localeIcons: Object.fromEntries(Object.entries(stringMap(row.localeIcons)).filter(([, value]) => isLinkImage(value))),
    ...destination, ...enterpriseScope(row),
    authEnabled: destination.linkType !== 'internal' && row.authEnabled === true,
    productGroupIds: stringIds(row.productGroupIds), productGroupMode: row.productGroupMode === 'selected' || row.productGroupIds?.length ? 'selected' : 'all', roleIds: stringIds(row.roleIds),
    defaultVisible: row.defaultVisible !== false, proOnly: row.proOnly === true, showBadge: row.showBadge === true,
  };
}
export function resolveLinkLocale(row, code = 'zh') {
  const extra = linkExtraFields(row);
  const translated = code === 'en' ? extra.enName : extra.translations[code];
  return { name: translated?.trim() || extra.enName || row.name || '未命名链接', iconData: extra.localeIcons[code] || row.iconData || '', fallback: code !== 'en' && !translated?.trim() };
}
// 用户范围与业务身份独立；跨条件取交集，产品组内多选取并集。
export function evaluateQuickLinkUser(row, user) {
  const audience = row.audience === undefined ? 'all' : row.audience;
  const profile = { ...PREVIEW_PROFILES[user.id], ...user };
  let baseReason = '';
  const scope = enterpriseScope(row);
  if (audience === 'enterprise' && (user.tenantType !== 'enterprise' || scope.tenantMode === 'selected' && !scope.tenantIds.includes(user.tenantId))) baseReason = '不属于适用企业范围';
  if (audience === 'users' && !(row.userIds || []).includes(user.id)) baseReason = '不在指定用户中';
  if (audience === 'roles' && !row.roleIds?.length) baseReason = '未选择适用角色';
  if (audience === 'products' && !row.productGroupIds?.length) baseReason = '未选择适用产品组';
  if (!['all', 'enterprise', 'users', 'roles', 'products'].includes(audience)) baseReason = '尚未配置可见范围';
  const roleMatch = !row.roleIds?.length || row.roleIds.some((id) => profile.roleIds?.includes(id));
  const productMatch = !(row.productGroupMode === 'selected' || row.productGroupIds?.length) || Boolean(row.productGroupIds?.some((id) => profile.productGroupIds?.includes(id)));
  const proMatch = !row.proOnly || profile.pro === true;
  const checks = [
    { key: 'audience', pass: !baseReason, reason: baseReason },
    { key: 'role', pass: roleMatch, reason: roleMatch ? '' : '未命中适用角色' },
    { key: 'product', pass: productMatch, reason: productMatch ? '' : profile.productGroupIds?.length ? '未命中限制产品组' : '当前租户下暂无可访问设备' },
    { key: 'pro', pass: proMatch, reason: proMatch ? '' : '仅 Pro 用户可见' },
  ];
  return { user, profile, checks, matches: checks.every((check) => check.pass) };
}
export function assessQuickLinkAudience(row, users) {
  const evaluations = users.map((user) => evaluateQuickLinkUser(row, user));
  // 指定用户是闭合名单；全部/企业用户目录在当前原型中只是样例，不据此推断真实用户为零。
  const exact = row.audience === 'users' && row.userIds?.length > 0 && row.userIds.every((id) => users.some((user) => user.id === id));
  const matches = evaluations.filter((item) => item.matches);
  return { evaluations, matches, baseUsers: evaluations.filter((item) => item.checks[0].pass), exact, emptyExact: Boolean(exact && !matches.length) };
}
export function visibilityResult(row, user) {
  if (row.enabled === false) return { visible: false, reason: '入口已关闭', key: 'disabled' };
  const result = evaluateQuickLinkUser(row, user);
  const failed = result.checks.find((check) => !check.pass);
  if (failed) return { visible: false, reason: failed.reason, key: failed.key };
  return { visible: true, reason: row.defaultVisible === false ? '默认不显示，可在个人配置中添加' : '符合条件，默认显示', key: row.defaultVisible === false ? 'hidden' : 'visible' };
}
export function productGroupLabel(row) {
  if (!row.productGroupIds?.length) return row.audience === 'products' || row.productGroupMode === 'selected' ? '未选择产品组' : '不限制产品组';
  return row.productGroupIds.map((id) => PRODUCT_GROUPS.find((item) => item.id === id)?.name || '已失效产品组').join('、');
}
export function validateQuickLink(form, rows, editingId, tenants, users) {
  const errors = {};
  const english = form.enName.trim();
  const name = form.translations.zh?.trim() || english;
  if (!english || english.length > 80) errors.enName = '请填写 1–80 字符的默认英文名称';
  if (rows.some((row) => row.id !== editingId && ((row.enName || '').trim().toLowerCase() === english.toLowerCase() || row.name.trim().toLowerCase() === name.toLowerCase()))) errors.enName = '链接名称已存在，请使用其他名称';
  if (!String(form.sort).trim() || !Number.isInteger(Number(form.sort)) || Number(form.sort) < 1 || Number(form.sort) > 999) errors.sort = '排序须为 1–999 的整数';
  if (!quickLinkAddress(form.url, form.linkType === 'internal')) errors.url = form.linkType === 'internal' ? '请输入完整的 http/https 地址、/路径或 #/路由，且不能包含空格或账号密码' : '请输入完整的 http:// 或 https:// 地址，且不能包含空格或账号密码';
  if (form.linkType !== 'internal') {
    try {
      const url = new URL(form.url.trim());
      if (form.url.length > 2048 || /\s/.test(form.url.trim()) || !['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error();
      if (form.authEnabled && url.protocol !== 'https:') errors.url = '需鉴权的网页须使用 HTTPS';
    } catch { errors.url = '请输入完整的 http:// 或 https:// 地址，且不能包含账号密码'; }
  }
  Object.assign(errors, validateQuickLinkScope(form, tenants, users));
  if (Object.values(form.translations).some((value) => value.length > 80)) errors.translations = '各语言名称最多 80 个字符';
  return errors;
}

export function validateQuickLinkScope(form, tenants, users) {
  const errors = {};
  if (proScopeError(form)) errors.visibility = proScopeError(form);
  if (!['all', 'enterprise', 'users', 'roles', 'products'].includes(form.audience)) errors.audience = '请选择可见范围';
  const scope = enterpriseScope(form);
  if (form.audience === 'enterprise' && scope.tenantMode === 'selected' && (!scope.tenantIds.length || scope.tenantIds.some((id) => !tenants.some((item) => item.id === id)))) errors.tenantIds = '请移除失效企业并选择有效企业，或清空后适用于全部企业';
  if (form.audience === 'users' && (!form.userIds.length || form.userIds.some((id) => !users.some((user) => user.id === id)))) errors.userIds = '请选择至少一位有效用户，移除失效用户后重试';
  if (form.audience === 'roles' && !form.roleIds.length) errors.roleIds = '请选择适用角色';
  if ((form.audience === 'products' || form.productGroupMode === 'selected') && !form.productGroupIds.length) errors.productGroupIds = '请选择至少一个适用产品组';
  if (form.productGroupIds.some((id) => !PRODUCT_GROUPS.some((item) => item.id === id))) errors.productGroupIds = '请移除已失效的适用产品组';
  if (form.roleIds.some((id) => !LINK_ROLES.some((item) => item.id === id))) errors.roleIds = '请移除已失效角色';
  if (!errors.visibility && form.enabled !== false && assessQuickLinkAudience(form, users).emptyExact) errors.visibility = '没有符合条件的指定用户，请调整范围或关闭 Pro，也可先关闭该链接保存';
  return errors;
}

// 快链原型身份样例与后台预览保持一致；正式接入后由服务端提供租户设备与权限信息。
const PROFILES = {
  'user-yibao': { roleIds: ['owner'], productGroupIds: ['excavator', 'pump', 'widebody'], pro: true },
  'user-bowo': { roleIds: ['admin'], productGroupIds: ['excavator', 'pump', 'widebody'], pro: true },
  'user-niran': { roleIds: ['operator'], productGroupIds: ['pump'], pro: false },
  'user-asha': { roleIds: ['enterprise'], productGroupIds: ['crane', 'road'], pro: true },
  'user-chenxiao': { roleIds: ['owner'], productGroupIds: [], pro: false },
};
export const INTERNAL_LINK_TARGETS = ['map-monitor', 'warning-center', 'maintenance', 'projects'];
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
export function quickLinkEnterpriseScope(item) {
  const tenantIds = Array.isArray(item.tenantIds) ? [...new Set(item.tenantIds.filter((id) => typeof id === 'string'))] : typeof item.tenantId === 'string' && item.tenantId ? [item.tenantId] : [];
  const hadSelection = Array.isArray(item.tenantIds) ? item.tenantIds.length > 0 : Boolean(item.tenantId);
  const tenantMode = item.tenantMode === 'selected' || hadSelection || item.tenantMode && item.tenantMode !== 'all' ? 'selected' : 'all';
  return { tenantMode, tenantIds };
}
export function matchesQuickLinkAudience(link, user) {
  if (link.audience === undefined || link.audience === 'all') return true;
  if (link.audience === 'enterprise') {
    const scope = quickLinkEnterpriseScope(link);
    return user.tenantType === 'enterprise' && (scope.tenantMode === 'all' || scope.tenantIds.includes(user.tenantId));
  }
  if (link.audience === 'roles') return Array.isArray(link.roleIds) && link.roleIds.length > 0;
  if (link.audience === 'products') return Array.isArray(link.productGroupIds) && link.productGroupIds.length > 0;
  return link.audience === 'users' && Array.isArray(link.userIds) && link.userIds.includes(user.id);
}

function destination(item) {
  const presets = {
    'map-monitor': ['map-monitor', 'https://mysany.sanygroup.com/pc/map-monitor'],
    'warning-center': ['warning-center', 'https://mysany.sanygroup.com/pc/warning-center'],
    'maintenance-navigation': ['maintenance', 'https://mysany.sanygroup.com/pc/maintenance'],
    'project-management': ['projects', 'https://mysany.sanygroup.com/pc/project-management'],
  };
  const preset = presets[item.id];
  const migrate = !item.linkType && preset && (!item.url || item.url === preset[1]);
  const linkType = migrate || item.linkType === 'internal' ? 'internal' : 'external';
  const internalTarget = migrate ? preset[0] : typeof item.internalTarget === 'string' ? item.internalTarget : '';
  const legacyUrl = INTERNAL_LINK_TARGETS.includes(internalTarget) ? `#/${internalTarget}` : '';
  return { linkType, internalTarget, url: migrate ? legacyUrl : item.url || (linkType === 'internal' ? legacyUrl : '') };
}
export function matchesQuickLinkConditions(link, user) {
  const profile = { ...PROFILES[user.id], ...user };
  if ((link.productGroupMode === 'selected' || link.productGroupIds?.length) && !link.productGroupIds?.some((id) => profile.productGroupIds?.includes(id))) return false;
  if (link.roleIds?.length && !link.roleIds.some((id) => profile.roleIds?.includes(id))) return false;
  if (link.proOnly && !profile.pro) return false;
  return true;
}
export function quickLinkExtraFields(item) {
  const translated = typeof item.translations?.zh === 'string' ? item.translations.zh.trim() : '';
  const english = typeof item.enName === 'string' ? item.enName.trim() : '';
  const target = destination(item);
  return {
    label: translated || english || (typeof item.name === 'string' ? item.name : '') || '未命名链接',
    ...target, ...quickLinkEnterpriseScope(item),
    authEnabled: target.linkType !== 'internal' && item.authEnabled === true,
    productGroupMode: item.productGroupMode,
    productGroupIds: Array.isArray(item.productGroupIds) ? item.productGroupIds : [],
    roleIds: Array.isArray(item.roleIds) ? item.roleIds : [],
    proOnly: item.proOnly === true, showBadge: item.showBadge === true,
    visible: item.defaultVisible !== false,
  };
}

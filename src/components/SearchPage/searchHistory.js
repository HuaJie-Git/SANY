/**
 * 历史搜索存储安全隔离策略：
 * 原型限制：未接入正式账号中心统一用户ID，为避免跨账号历史串号与手机号外泄，
 * 当前登录态采用会话级安全隔离 (sessionStorage)；
 * 切换账号、注销或重新登录时重置会话历史，游客态使用专属隔离存储键。
 */
export const getSearchHistoryStorageKey = (isGuest) => {
  return isGuest ? 'sanvist_search_history_guest' : 'sanvist_search_history_session';
};

export const getStorageEngine = () => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage || window.localStorage;
};

export const loadSearchHistory = (isGuest) => {
  const engine = getStorageEngine();
  if (!engine) return {};
  try {
    const raw = engine.getItem(getSearchHistoryStorageKey(isGuest));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {}
  return {};
};

export const recordSearchHistoryEntry = (tab, item, isGuest) => {
  if (!tab || !item) return;
  const engine = getStorageEngine();
  if (!engine) return;
  try {
    const current = loadSearchHistory(isGuest);
    const list = Array.isArray(current[tab]) ? current[tab] : [];
    const itemKey = item.code || item.id || item.model || item.name;
    const deduplicated = list.filter((x) => (x.code || x.id || x.model || x.name) !== itemKey);
    const nextList = [item, ...deduplicated];
    const nextMap = { ...current, [tab]: nextList };
    engine.setItem(getSearchHistoryStorageKey(isGuest), JSON.stringify(nextMap));
    window.dispatchEvent(new CustomEvent('sanvist_search_history_updated', { detail: { isGuest, nextMap } }));
  } catch {}
};

export const resetUserSessionHistory = () => {
  const engine = getStorageEngine();
  if (!engine) return;
  try {
    engine.removeItem('sanvist_search_history_session');
    window.dispatchEvent(new CustomEvent('sanvist_search_history_updated', { detail: { isGuest: false, nextMap: {} } }));
  } catch {}
};

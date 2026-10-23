import {
  WORKBENCH_CONFIG_TARGETS, DEFAULT_USER_CONFIG_TARGET, ROLE_WORKBENCH_PLATFORM_KEY,
  ROLE_WORKBENCH_ADMIN_KEY, getCatalogForPlatform, getEffectiveRoleItems,
  getRoleStorageKey, getRoleLabel, addRoleLibraryItems, readPlatformConfigsFromStorage,
} from './roleWorkbench.js';
import {
  readSharedEntriesFromStorage, buildUnifiedDirectory, getSectionRevision,
  saveSharedEntryToStorage, VALID_PLATFORM_SECTIONS,
} from './roleWorkbenchEntries.js';
import { readRoleWorkbenchDefaultsFromStorage } from './roleWorkbenchDefaults.js';

const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
const revision = () => `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
const conflict = () => {
  const error = new Error('资料或使用配置已更新，请重新读取并核对后再提交；当前选择已保留。');
  error.isConflict = true;
  return error;
};

// 所有写操作都重读真实存储，不能以过期 usedByRoles 或演示快照替代引用核对。
export function readLibrarySnapshot(platform, section) {
  if (!VALID_PLATFORM_SECTIONS[platform]?.includes(section)) throw new Error('终端或区域无效');
  const configs = readPlatformConfigsFromStorage();
  const shared = readSharedEntriesFromStorage();
  const defaults = readRoleWorkbenchDefaultsFromStorage();
  if (configs.hasReadError || shared.hasReadError || defaults.hasReadError) {
    throw new Error('本地配置或入口库读取异常，为保护原数据已禁止写入，请重试读取。');
  }
  const raw = window.localStorage.getItem(ROLE_WORKBENCH_PLATFORM_KEY);
  let tree = {};
  if (raw) {
    tree = JSON.parse(raw);
  } else if (platform === 'app' && section === 'workbench') {
    const old = window.localStorage.getItem(ROLE_WORKBENCH_ADMIN_KEY);
    if (old) {
      try { tree = { app: { workbench: JSON.parse(old) } }; }
      catch { tree = { app: { workbench: {} } }; }
    }
  }
  if (!object(tree)) throw new Error('配置根结构损坏，请重试读取');
  for (const [p, sections] of Object.entries(VALID_PLATFORM_SECTIONS)) {
    if (tree[p] !== undefined && !object(tree[p])) throw new Error('终端配置结构损坏');
    for (const s of sections) {
      const group = tree[p]?.[s];
      if (group !== undefined && !object(group)) throw new Error('区域配置结构损坏');
      for (const [key, conf] of Object.entries(group || {})) {
        if (!WORKBENCH_CONFIG_TARGETS.some((target) => target.storageKey === key)
          && !(object(conf) && Object.hasOwn(conf, 'items'))) continue;
        if (!object(conf) || (conf.items !== undefined && (!Array.isArray(conf.items)
          || conf.items.some((item) => !object(item) || typeof item.id !== 'string')))) {
          throw new Error('配置对象或条目结构损坏，请重试读取');
        }
      }
    }
  }
  const targets = [...WORKBENCH_CONFIG_TARGETS];
  for (const key of Object.keys(tree[platform]?.[section] || {})) {
    if (Array.isArray(tree[platform][section][key]?.items) && !targets.some((target) => target.storageKey === key)) {
      targets.push({ storageKey: key, name: getRoleLabel(key) });
    }
  }
  const effective = {};
  const bases = {};
  for (const target of targets) {
    const key = target.storageKey;
    const saved = tree[platform]?.[section]?.[key] || configs.tree[platform]?.[section]?.[key];
    const legacy = defaults.tree[platform]?.[section];
    const items = getEffectiveRoleItems(saved, legacy, key, platform, section);
    effective[key] = { ...saved, items };
    bases[key] = JSON.stringify({ saved: tree[platform]?.[section]?.[key] ?? null,
      items, initial: !saved?.isConfigured || saved.useDefaultConfiguration === true });
  }
  const directory = buildUnifiedDirectory({ platform, section, sharedEntriesTree: shared.tree,
    savedPlatformConfigs: { [platform]: { [section]: effective } },
    staticCatalog: getCatalogForPlatform(platform, section), roleList: targets });
  const catalogIds = new Set(getCatalogForPlatform(platform, section).map((entry) => entry.id));
  const entries = directory.map((entry) => ({ ...entry, isBuiltin: catalogIds.has(entry.id),
    usages: targets.filter((target) => effective[target.storageKey].items.some((item) => item.id === entry.id && !item.isRemoved))
      .map((target) => ({ key: target.storageKey, name: target.name,
        initial: !effective[target.storageKey].isConfigured || effective[target.storageKey].useDefaultConfiguration === true })),
  }));
  const pendingCleanups = [];
  const sharedSectionEntries = shared.tree.entries?.[platform]?.[section] || {};
  let mirrorObj = null;
  if (platform === 'app' && section === 'workbench') {
    const oldMirror = window.localStorage.getItem(ROLE_WORKBENCH_ADMIN_KEY);
    try { mirrorObj = oldMirror ? JSON.parse(oldMirror) : {}; }
    catch { mirrorObj = null; }
  }

  for (const [id, sharedEntry] of Object.entries(sharedSectionEntries)) {
    if (!sharedEntry || !sharedEntry.isDeleted) continue;
    const remainingRoles = [];
    for (const target of targets) {
      const key = target.storageKey;
      if (effective[key]?.items?.some((item) => item.id === id && !item.isRemoved)) {
        remainingRoles.push(key);
      }
    }
    let mirrorPending = false;
    if (platform === 'app' && section === 'workbench') {
      if (!object(mirrorObj)) {
        mirrorPending = true;
      } else {
        for (const [key, conf] of Object.entries(mirrorObj)) {
          if (key !== DEFAULT_USER_CONFIG_TARGET.storageKey && Array.isArray(conf?.items) && conf.items.some((item) => item.id === id && !item.isRemoved)) {
            mirrorPending = true;
            break;
          }
        }
      }
    }
    if (remainingRoles.length > 0 || mirrorPending) {
      pendingCleanups.push({
        id,
        name: sharedEntry.name || id,
        remainingRoles,
        mirrorPending,
      });
    }
  }

  return { platform, section, tree, effective, bases, entries, sharedTree: shared.tree,
    publicRevision: getSectionRevision(shared.tree, platform, section),
    referenceSignature: JSON.stringify(bases),
    pendingCleanups };
}

export function findPendingCleanups(platform, section) {
  try {
    return readLibrarySnapshot(platform, section).pendingCleanups || [];
  } catch {
    return [];
  }
}

export function selectionReason(entry, role, items = []) {
  if (!entry || entry.isDeleted) return '资料已删除';
  if (items.some((item) => item.id === entry.id && !item.isRemoved)) return '已配置';
  if (entry.globalEnabled === false) return '全局已停用';
  if (entry.hasRoleDifferences) return '资料存在历史差异，请先核对公共资料';
  const target = getRoleStorageKey(entry.roleTarget);
  if (target && target !== 'all' && target !== getRoleStorageKey(role)) return `仅适用于${getRoleLabel(target)}`;
  return '';
}

export function selectLibraryEntries(snapshot, ids, role, currentItems) {
  const latest = readLibrarySnapshot(snapshot.platform, snapshot.section);
  if (latest.publicRevision !== snapshot.publicRevision) throw conflict();
  const entries = [...new Set(ids)].map((id) => {
    const entry = latest.entries.find((item) => item.id === id);
    const reason = selectionReason(entry, role, currentItems);
    if (reason) throw new Error(`${entry?.name || id}：${reason}`);
    return entry;
  });
  if (!entries.length) throw new Error('请至少选择一项');
  return addRoleLibraryItems(currentItems, entries);
}

// 单一权威键一次提交全部目标；旧 APP 镜像是可恢复的后续兼容步骤。
export function assignLibraryEntry(snapshot, id, roleKeys) {
  const latest = readLibrarySnapshot(snapshot.platform, snapshot.section);
  if (latest.publicRevision !== snapshot.publicRevision) throw conflict();
  const entry = latest.entries.find((item) => item.id === id);
  if (!entry) throw new Error('资料已删除或不存在，请重新读取');
  const validTargets = new Set(WORKBENCH_CONFIG_TARGETS.map((target) => target.storageKey));
  for (const key of roleKeys) {
    if (!validTargets.has(key)) throw new Error(`包含无效的配置对象：${key}`);
  }
  const keys = [...new Set(roleKeys)];
  const nextTree = { ...latest.tree };
  nextTree[snapshot.platform] = { ...nextTree[snapshot.platform] };
  nextTree[snapshot.platform][snapshot.section] = { ...nextTree[snapshot.platform][snapshot.section] };
  const changedKeys = [];

  for (const target of WORKBENCH_CONFIG_TARGETS) {
    const key = target.storageKey;
    const shouldAssign = keys.includes(key);
    const conf = latest.effective[key];
    const isCurrentlyAssigned = conf.items.some((item) => item.id === id && !item.isRemoved);

    if (shouldAssign && !isCurrentlyAssigned) {
      if (latest.bases[key] !== snapshot.bases[key]) throw conflict();
      const reason = selectionReason(entry, key, conf.items);
      if (reason && reason !== '已配置') throw new Error(`${getRoleLabel(key)}：${reason}`);
      const original = latest.tree[snapshot.platform]?.[snapshot.section]?.[key] || conf;
      const minor = Number.parseInt(original.version?.split('.')[1] || '0', 10);
      nextTree[snapshot.platform][snapshot.section][key] = {
        ...original, platform: snapshot.platform, section: snapshot.section, roleName: key,
        items: addRoleLibraryItems(conf.items, [entry]), rules: conf.rules,
        isConfigured: true, useDefaultConfiguration: false, hasExclusiveConfiguration: true,
        version: original.isConfigured ? `v1.${(Number.isFinite(minor) ? minor : 0) + 1}.0` : 'v1.0.0',
        revision: revision(), updatedAt: new Date().toISOString(),
      };
      changedKeys.push(key);
    } else if (!shouldAssign && isCurrentlyAssigned) {
      if (latest.bases[key] !== snapshot.bases[key]) throw conflict();
      const original = latest.tree[snapshot.platform]?.[snapshot.section]?.[key] || conf;
      const minor = Number.parseInt(original.version?.split('.')[1] || '0', 10);
      nextTree[snapshot.platform][snapshot.section][key] = {
        ...original, platform: snapshot.platform, section: snapshot.section, roleName: key,
        items: conf.items.filter((item) => item.id !== id), rules: conf.rules,
        isConfigured: true, useDefaultConfiguration: false, hasExclusiveConfiguration: true,
        version: original.isConfigured ? `v1.${(Number.isFinite(minor) ? minor : 0) + 1}.0` : 'v1.0.0',
        revision: revision(), updatedAt: new Date().toISOString(),
      };
      changedKeys.push(key);
    }
  }

  window.localStorage.setItem(ROLE_WORKBENCH_PLATFORM_KEY, JSON.stringify(nextTree));
  const mirrorKeys = snapshot.platform === 'app' && snapshot.section === 'workbench'
    ? changedKeys.filter((key) => key !== DEFAULT_USER_CONFIG_TARGET.storageKey) : [];
  let mirrorError = '';
  if (mirrorKeys.length) {
    try { retryAssignmentMirror(mirrorKeys); }
    catch (error) { mirrorError = error.message; }
  }
  return { tree: nextTree, mirrorKeys, mirrorError };
}

// 只同步本次目标，读取最新权威记录；不回滚权威键、不改其他旧镜像条目。
export function retryAssignmentMirror(keys) {
  const configs = readPlatformConfigsFromStorage();
  if (configs.hasReadError) {
    throw new Error('平台配置读取异常，已禁止写入以保护原数据');
  }
  const raw = window.localStorage.getItem(ROLE_WORKBENCH_PLATFORM_KEY);
  const tree = raw ? JSON.parse(raw) : configs.raw ? JSON.parse(configs.raw) : { app: { workbench: {} } };
  const old = window.localStorage.getItem(ROLE_WORKBENCH_ADMIN_KEY);
  const mirror = old ? JSON.parse(old) : {};
  if (!object(mirror) || !object(tree.app?.workbench)) throw new Error('兼容数据结构异常，请先核对存储');
  for (const key of keys) {
    if (key === DEFAULT_USER_CONFIG_TARGET.storageKey) continue;
    if (tree.app?.workbench?.[key]) {
      mirror[key] = tree.app.workbench[key];
    } else {
      delete mirror[key];
    }
  }
  window.localStorage.setItem(ROLE_WORKBENCH_ADMIN_KEY, JSON.stringify(mirror));
}

export function retryCleanupDeletedEntry(platform, section, id) {
  const shared = readSharedEntriesFromStorage();
  const configs = readPlatformConfigsFromStorage();
  const defaults = readRoleWorkbenchDefaultsFromStorage();
  if (shared.hasReadError || configs.hasReadError || defaults.hasReadError) {
    throw new Error('本地配置或入口库读取异常，为保护原数据已禁止写入，请重试读取。');
  }

  const publicEntry = shared.tree.entries?.[platform]?.[section]?.[id];
  if (!publicEntry || !publicEntry.isDeleted) {
    throw new Error('条目未在公共库标记删除，拒绝执行级联清理');
  }

  const raw = window.localStorage.getItem(ROLE_WORKBENCH_PLATFORM_KEY);
  const tree = raw ? JSON.parse(raw) : configs.raw ? JSON.parse(configs.raw) : { app: {}, pc: {} };
  if (!object(tree[platform])) tree[platform] = {};
  if (!object(tree[platform][section])) tree[platform][section] = {};

  const changedKeys = [];

  const targetKeys = new Set([
    ...WORKBENCH_CONFIG_TARGETS.map((t) => t.storageKey),
    ...Object.keys(tree[platform][section] || {}),
    ...Object.keys(configs.tree?.[platform]?.[section] || {}),
  ]);

  for (const key of targetKeys) {
    const saved = tree[platform]?.[section]?.[key] || configs.tree?.[platform]?.[section]?.[key];
    const legacy = defaults.tree?.[platform]?.[section];
    const effectiveItems = getEffectiveRoleItems(saved, legacy, key, platform, section);
    if (Array.isArray(effectiveItems) && effectiveItems.some((item) => item.id === id)) {
      const original = tree[platform]?.[section]?.[key] || saved || {};
      const minor = Number.parseInt(original.version?.split('.')[1] || '0', 10);
      tree[platform][section][key] = {
        ...original,
        platform,
        section,
        roleName: key,
        items: effectiveItems.filter((item) => item.id !== id),
        rules: original.rules || saved?.rules,
        isConfigured: true,
        useDefaultConfiguration: false,
        hasExclusiveConfiguration: true,
        version: original.isConfigured ? `v1.${(Number.isFinite(minor) ? minor : 0) + 1}.0` : 'v1.0.0',
        revision: revision(),
        updatedAt: new Date().toISOString(),
      };
      changedKeys.push(key);
    }
  }

  window.localStorage.setItem(ROLE_WORKBENCH_PLATFORM_KEY, JSON.stringify(tree));

  let mirrorKeys = [];
  let mirrorError = '';
  if (platform === 'app' && section === 'workbench') {
    const old = window.localStorage.getItem(ROLE_WORKBENCH_ADMIN_KEY);
    const mirror = old ? JSON.parse(old) : {};
    const targetsNeedingSync = new Set(changedKeys);
    if (object(mirror)) {
      for (const [k, conf] of Object.entries(mirror)) {
        if (k !== DEFAULT_USER_CONFIG_TARGET.storageKey && Array.isArray(conf?.items) && conf.items.some((item) => item.id === id)) {
          targetsNeedingSync.add(k);
        }
      }
    }
    mirrorKeys = [...targetsNeedingSync].filter((k) => k !== DEFAULT_USER_CONFIG_TARGET.storageKey);
    if (mirrorKeys.length) {
      try {
        retryAssignmentMirror(mirrorKeys);
      } catch (err) {
        mirrorError = err.message;
      }
    }
  }

  return { cleanedKeys: changedKeys, mirrorKeys, mirrorError };
}

export function changeLibraryAvailability(snapshot, id, action) {
  const latest = readLibrarySnapshot(snapshot.platform, snapshot.section);
  if (latest.publicRevision !== snapshot.publicRevision || latest.referenceSignature !== snapshot.referenceSignature) throw conflict();
  const entry = latest.entries.find((item) => item.id === id);
  if (!entry) throw new Error('资料已删除或不存在，请重新读取');
  if (!['delete', 'disable', 'enable'].includes(action)) throw new Error('操作无效');

  if (action === 'delete') {
    // 1. 先权威写入公共删除标记（若公共写失败，角色树保持不变）
    const publicEntry = { ...entry };
    delete publicEntry.usages;
    delete publicEntry.isBuiltin;
    const shared = latest.sharedTree.entries[snapshot.platform]?.[snapshot.section]?.[id];
    if (!shared || shared.availabilityOnly) publicEntry.availabilityOnly = true;

    const publicResult = saveSharedEntryToStorage({
      ...publicEntry,
      globalEnabled: false,
      isDeleted: true,
    }, snapshot.platform, snapshot.section, snapshot.publicRevision, false, true);

    // 2. 权威删除生效后，联动从所有已配置角色的工作台中级联移除该入口（覆盖全部有效目标）
    const nextTree = { ...latest.tree };
    nextTree[snapshot.platform] = { ...nextTree[snapshot.platform] };
    nextTree[snapshot.platform][snapshot.section] = { ...nextTree[snapshot.platform][snapshot.section] };
    const changedKeys = [];

    const allTargetKeys = new Set([
      ...WORKBENCH_CONFIG_TARGETS.map((t) => t.storageKey),
      ...Object.keys(latest.effective || {}),
      ...Object.keys(nextTree[snapshot.platform][snapshot.section] || {}),
    ]);

    for (const key of allTargetKeys) {
      const conf = latest.effective[key];
      if (conf && Array.isArray(conf.items) && conf.items.some((item) => item.id === id)) {
        const original = latest.tree[snapshot.platform]?.[snapshot.section]?.[key] || conf;
        const minor = Number.parseInt(original.version?.split('.')[1] || '0', 10);
        nextTree[snapshot.platform][snapshot.section][key] = {
          ...original,
          platform: snapshot.platform,
          section: snapshot.section,
          roleName: key,
          items: conf.items.filter((item) => item.id !== id),
          rules: conf.rules,
          isConfigured: true,
          useDefaultConfiguration: false,
          hasExclusiveConfiguration: true,
          version: original.isConfigured ? `v1.${(Number.isFinite(minor) ? minor : 0) + 1}.0` : 'v1.0.0',
          revision: revision(),
          updatedAt: new Date().toISOString(),
        };
        changedKeys.push(key);
      }
    }

    let cleanupError = '';
    try {
      window.localStorage.setItem(ROLE_WORKBENCH_PLATFORM_KEY, JSON.stringify(nextTree));
    } catch (error) {
      cleanupError = error.message;
    }

    // 3. 兼容镜像同步
    let mirrorKeys = [];
    let mirrorError = '';
    if (!cleanupError && snapshot.platform === 'app' && snapshot.section === 'workbench') {
      const old = window.localStorage.getItem(ROLE_WORKBENCH_ADMIN_KEY);
      const mirror = old ? JSON.parse(old) : {};
      const targetsNeedingSync = new Set(changedKeys);
      if (object(mirror)) {
        for (const [k, conf] of Object.entries(mirror)) {
          if (k !== DEFAULT_USER_CONFIG_TARGET.storageKey && Array.isArray(conf?.items) && conf.items.some((item) => item.id === id)) {
            targetsNeedingSync.add(k);
          }
        }
      }
      mirrorKeys = [...targetsNeedingSync].filter((key) => key !== DEFAULT_USER_CONFIG_TARGET.storageKey);
      if (mirrorKeys.length) {
        try { retryAssignmentMirror(mirrorKeys); }
        catch (error) { mirrorError = error.message; }
      }
    }

    return {
      ...publicResult,
      deletedId: id,
      changedKeys,
      cleanupError,
      mirrorKeys,
      mirrorError,
    };
  }

  const publicEntry = { ...entry };
  delete publicEntry.usages;
  delete publicEntry.isBuiltin;
  // 尚未核对的旧资料仅保存可用性，不能借停用动作静默选定一个历史版本。
  const shared = latest.sharedTree.entries[snapshot.platform]?.[snapshot.section]?.[id];
  if (!shared || shared.availabilityOnly) publicEntry.availabilityOnly = true;
  return saveSharedEntryToStorage({ ...publicEntry,
    globalEnabled: action === 'enable', isDeleted: false },
  snapshot.platform, snapshot.section, snapshot.publicRevision, false, true);
}

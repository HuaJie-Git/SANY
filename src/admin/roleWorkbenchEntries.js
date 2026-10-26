export const ROLE_WORKBENCH_ENTRIES_KEY = 'sanvist_role_workbench_entries_v1';

export const isImageValue = (val) => {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (trimmed.startsWith('data:')) {
    return /^data:image\/(png|jpe?g|webp|gif|svg\+xml)[;,]/i.test(trimmed);
  }
  if (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  ) {
    return true;
  }
  return /\.(png|jpe?g|svg|webp|gif)$/i.test(trimmed);
};

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export const VALID_PLATFORM_SECTIONS = {
  app: ['workbench', 'modules'],
  pc: ['modules', 'actions'],
};

/**
 * 结构与字段类型严格校验 (R-014-D, STATE-ENTRY-001, AC-037)
 */
export const validateSharedEntriesTree = (parsed) => {
  if (!isPlainObject(parsed)) return false;
  if (!isPlainObject(parsed.entries)) return false;
  if (!isPlainObject(parsed.revisions)) return false;

  for (const [platform, sections] of Object.entries(VALID_PLATFORM_SECTIONS)) {
    if (!isPlainObject(parsed.entries[platform])) return false;
    if (!isPlainObject(parsed.revisions[platform])) return false;

    for (const section of sections) {
      const rev = parsed.revisions[platform][section];
      if (typeof rev !== 'string') return false;

      const secEntries = parsed.entries[platform][section];
      if (!isPlainObject(secEntries)) return false;

      for (const [key, entry] of Object.entries(secEntries)) {
        if (!isPlainObject(entry)) return false;
        if (typeof entry.id !== 'string' || !entry.id.trim() || entry.id !== key) return false;
        if (typeof entry.name !== 'string') return false;
        if (entry.globalEnabled !== undefined && typeof entry.globalEnabled !== 'boolean') return false;
        if (entry.isDeleted !== undefined && typeof entry.isDeleted !== 'boolean') return false;
        if (entry.availabilityOnly !== undefined && typeof entry.availabilityOnly !== 'boolean') return false;
        if (entry.enName !== undefined && typeof entry.enName !== 'string') return false;
        if (entry.translations !== undefined) {
          if (!isPlainObject(entry.translations)) return false;
          for (const [langKey, text] of Object.entries(entry.translations)) {
            if (typeof langKey !== 'string' || typeof text !== 'string') return false;
          }
        }
        if (entry.icon !== undefined && typeof entry.icon !== 'string') return false;
        if (entry.iconFileName !== undefined && typeof entry.iconFileName !== 'string') return false;
        if (entry.localeIcons !== undefined) {
          if (!isPlainObject(entry.localeIcons)) return false;
          for (const [langKey, icon] of Object.entries(entry.localeIcons)) {
            if (typeof langKey !== 'string' || typeof icon !== 'string') return false;
          }
        }
        if (entry.localeIconFileNames !== undefined) {
          if (!isPlainObject(entry.localeIconFileNames)) return false;
          for (const [langKey, fn] of Object.entries(entry.localeIconFileNames)) {
            if (typeof langKey !== 'string' || typeof fn !== 'string') return false;
          }
        }
        if (entry.jumpType !== undefined && typeof entry.jumpType !== 'string') return false;
        if (entry.jumpUrl !== undefined && typeof entry.jumpUrl !== 'string') return false;
        if (entry.roleTarget !== undefined && typeof entry.roleTarget !== 'string') return false;
        if (entry.productGroup !== undefined && typeof entry.productGroup !== 'string') return false;
        if (entry.category !== undefined && typeof entry.category !== 'string') return false;
        if (entry.defaultVisible !== undefined && typeof entry.defaultVisible !== 'string') return false;
        if (entry.sort !== undefined && typeof entry.sort !== 'number' && typeof entry.sort !== 'string') return false;
      }
    }
  }

  return true;
};

/**
 * 创建初始共享入口数据树
 */
export const createEmptySharedEntriesTree = () => ({
  revisions: {
    app: {
      workbench: '--',
      modules: '--',
    },
    pc: {
      modules: '--',
      actions: '--',
    },
  },
  entries: {
    app: {
      workbench: {},
      modules: {},
    },
    pc: {
      modules: {},
      actions: {},
    },
  },
});

/**
 * 从本地存储读取共享入口数据（带严格结构类型保护）
 */
export const readSharedEntriesFromStorage = () => {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(ROLE_WORKBENCH_ENTRIES_KEY) : null;
    if (raw === null || raw === undefined) {
      return {
        tree: createEmptySharedEntriesTree(),
        hasReadError: false,
      };
    }
    const parsed = JSON.parse(raw);
    if (!validateSharedEntriesTree(parsed)) {
      return {
        tree: createEmptySharedEntriesTree(),
        hasReadError: true,
        error: new Error('共享入口存储数据结构损坏或字段类型非法'),
      };
    }

    return {
      tree: parsed,
      hasReadError: false,
    };
  } catch (err) {
    return {
      tree: createEmptySharedEntriesTree(),
      hasReadError: true,
      error: err,
    };
  }
};

/**
 * 获取指定平台与区域的最新 revision
 */
export const getSectionRevision = (tree, platform, section) => {
  return tree?.revisions?.[platform]?.[section] || '--';
};

/**
 * 规范化保存的共享入口字段，空字符串与删除图标必须无损保留，剔除角色专有及UI字段
 */
export const sanitizeSharedEntry = (entry) => {
  if (!entry || !entry.id) {
    throw new Error('入口资料缺少合法 ID');
  }

  const clean = { ...entry };
  // 严格剔除 UI 与角色专用临时字段 (R-014-D)
  delete clean.hasRoleDifferences;
  delete clean.diffSources;
  delete clean.usedByRoles;
  delete clean.isSharedSaved;
  delete clean.isShared;
  delete clean.visible;
  delete clean.isPinned;
  delete clean.pinnedOrder;
  delete clean.isRemoved;
  delete clean.sortNum;
  delete clean.clicks;
  delete clean.diffSourcesCount;
  delete clean.roles;
  delete clean.roleSources;
  delete clean.usages;
  delete clean.isBuiltin;

  const sanitizedTranslations = {};
  if (isPlainObject(entry.translations)) {
    for (const [k, v] of Object.entries(entry.translations)) {
      if (typeof k === 'string' && typeof v === 'string') {
        sanitizedTranslations[k] = v;
      }
    }
  }

  const sanitizedLocaleIcons = {};
  if (isPlainObject(entry.localeIcons)) {
    for (const [k, v] of Object.entries(entry.localeIcons)) {
      if (typeof k === 'string' && typeof v === 'string') {
        sanitizedLocaleIcons[k] = v;
      }
    }
  }

  const sanitizedLocaleIconFileNames = {};
  if (isPlainObject(entry.localeIconFileNames)) {
    for (const [k, v] of Object.entries(entry.localeIconFileNames)) {
      if (typeof k === 'string' && typeof v === 'string') {
        sanitizedLocaleIconFileNames[k] = v;
      }
    }
  }

  const sanitized = {
    ...clean,
    id: entry.id,
    name: (entry.name || '').trim(),
    enName: (entry.enName || '').trim(),
    translations: sanitizedTranslations,
    icon: entry.icon !== undefined && entry.icon !== null ? String(entry.icon) : '',
    iconFileName: entry.icon ? (entry.iconFileName ? String(entry.iconFileName) : '') : '',
    localeIcons: sanitizedLocaleIcons,
    localeIconFileNames: sanitizedLocaleIconFileNames,
    jumpType: entry.jumpType || 'internal',
    jumpUrl: entry.jumpUrl || '',
    productGroup: entry.productGroup || 'all',
    roleTarget: entry.roleTarget || 'all',
    pro: Boolean(entry.pro),
    showBadge: Boolean(entry.showBadge),
    category: entry.category || '其他',
    custom: Boolean(entry.custom),
    updatedAt: Date.now(),
  };

  // 旧字段只作兼容，缺失不偷偷补写造成布局变更 (R-056 / DEC-056-1)
  if (entry.defaultVisible !== undefined) {
    sanitized.defaultVisible = entry.defaultVisible === 'no' ? 'no' : 'yes';
  } else {
    delete sanitized.defaultVisible;
  }
  if (entry.sort !== undefined) {
    sanitized.sort = Number.isFinite(Number(entry.sort)) ? Number(entry.sort) : 10;
  } else {
    delete sanitized.sort;
  }

  // 保证中文翻译有值
  if (!sanitized.translations.zh && sanitized.name) {
    sanitized.translations.zh = sanitized.name;
  }

  return sanitized;
};

/**
 * 比较公共字段是否完全一致（忽略角色专有的 isPinned, visible, defaultVisible, sort 以及数组位置）
 */
export const arePublicFieldsEqual = (a, b) => {
  if (!a || !b) return false;

  const aName = (a.name || a.translations?.zh || '').trim();
  const bName = (b.name || b.translations?.zh || '').trim();
  if (aName !== bName) return false;

  const aEn = (a.enName || '').trim();
  const bEn = (b.enName || '').trim();
  if (aEn !== bEn) return false;

  const aJumpType = a.jumpType || 'internal';
  const bJumpType = b.jumpType || 'internal';
  if (aJumpType !== bJumpType) return false;

  const aJumpUrl = (a.jumpUrl || '').trim();
  const bJumpUrl = (b.jumpUrl || '').trim();
  if (aJumpUrl !== bJumpUrl) return false;

  const aCategory = (a.category || '').trim();
  const bCategory = (b.category || '').trim();
  if (aCategory && bCategory && aCategory !== bCategory) return false;

  if (Boolean(a.pro) !== Boolean(b.pro)) return false;
  if (Boolean(a.showBadge) !== Boolean(b.showBadge)) return false;

  const aProd = a.productGroup || 'all';
  const bProd = b.productGroup || 'all';
  if (aProd !== bProd) return false;
  if ((a.roleTarget || 'all') !== (b.roleTarget || 'all')) return false;

  const aIcon = a.icon !== undefined && a.icon !== null ? String(a.icon).trim() : '';
  const bIcon = b.icon !== undefined && b.icon !== null ? String(b.icon).trim() : '';
  if (aIcon !== bIcon) return false;

  // 稳定键序比较 translations
  const serializeSorted = (obj) => {
    if (!obj || typeof obj !== 'object') return '{}';
    const keys = Object.keys(obj).sort();
    const clean = {};
    keys.forEach((k) => {
      const v = obj[k];
      if (v !== undefined && v !== null && v !== '') {
        clean[k] = v;
      }
    });
    return JSON.stringify(clean);
  };

  if (serializeSorted(a.translations) !== serializeSorted(b.translations)) return false;
  if (serializeSorted(a.localeIcons) !== serializeSorted(b.localeIcons)) return false;

  return true;
};

/**
 * 原子保存共享入口至 localStorage，并在同区域执行乐观 revision 校验
 */
export const saveSharedEntryToStorage = (
  entry,
  platform = 'app',
  section = 'workbench',
  expectedBaseRevision = null,
  shouldSimulateError = false,
  allowAvailabilityChange = false
) => {
  if (shouldSimulateError) {
    throw new Error('保存未完成：存储或网络模拟异常');
  }

  // 1. 重读最新存储
  const readRes = readSharedEntriesFromStorage();
  if (readRes.hasReadError) {
    throw new Error('检测到共享入口存储读取异常，为保护已有数据拒绝覆盖，请先重试读取');
  }
  const latestTree = readRes.tree;

  // 2. 检查当前 (platform, section) 的 revision 冲突 (R-014-D: 严格校验，含首次 '--' 竞争)
  const latestSectionRevision = getSectionRevision(latestTree, platform, section);

  if (
    expectedBaseRevision !== null &&
    expectedBaseRevision !== undefined &&
    latestSectionRevision !== expectedBaseRevision
  ) {
    const conflictErr = new Error(
      `该区域入口资料已在其他窗口更新（当前基准 ${expectedBaseRevision} vs 最新已存 ${latestSectionRevision}），为避免覆盖，请关闭后重新打开核对最新资料。`
    );
    conflictErr.isConflict = true;
    conflictErr.latestRevision = latestSectionRevision;
    conflictErr.baseRevision = expectedBaseRevision;
    throw conflictErr;
  }

  // 3. 规范化要保存的入口
  const cleanEntry = sanitizeSharedEntry(entry);
  if (!allowAvailabilityChange) delete cleanEntry.availabilityOnly;
  const existingEntry = latestTree.entries[platform]?.[section]?.[entry.id];
  if (existingEntry) {
    if (existingEntry.isDeleted) throw new Error('该资料已删除，不能从旧表单恢复，请关闭后重新核对入口库');
    // 资料表单不负责改变全局可用性。
    if (!allowAvailabilityChange) {
      if (Object.hasOwn(existingEntry, 'globalEnabled')) cleanEntry.globalEnabled = existingEntry.globalEnabled;
      else delete cleanEntry.globalEnabled;
      if (Object.hasOwn(existingEntry, 'isDeleted')) cleanEntry.isDeleted = existingEntry.isDeleted;
      else delete cleanEntry.isDeleted;
    }
    // 编辑不能改写或补造已有记录的创建信息。
    for (const field of ['createdBy', 'createdAt']) {
      if (Object.hasOwn(existingEntry, field)) cleanEntry[field] = existingEntry[field];
      else delete cleanEntry[field];
    }
  }

  // 4. 生成新 revision
  const nextSectionRev = `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  if (!latestTree.revisions[platform]) {
    latestTree.revisions[platform] = {};
  }
  latestTree.revisions[platform][section] = nextSectionRev;

  if (!latestTree.entries[platform]) {
    latestTree.entries[platform] = {};
  }
  if (!latestTree.entries[platform][section]) {
    latestTree.entries[platform][section] = {};
  }
  latestTree.entries[platform][section][cleanEntry.id] = cleanEntry;

  // 5. 写前整树结构与字段类型严格校验，杜绝写出非法 JSON 坏结构 (R-014-E)
  if (!validateSharedEntriesTree(latestTree)) {
    throw new Error('保存未完成：生成的共享入口数据结构校验未通过');
  }

  // 6. 单个 localStorage.setItem 原子写入
  window.localStorage.setItem(ROLE_WORKBENCH_ENTRIES_KEY, JSON.stringify(latestTree));

  return {
    tree: latestTree,
    newRevision: nextSectionRev,
    entry: cleanEntry,
  };
};

/**
 * 规范化来源公共字段数据，用于差异比对与默认回显
 * 缺失 zh 回退到 name，缺失其它公共字段继承 staticCatalog 默认，保证相同默认资料不误报差异
 */
const normalizeSourceData = (item, baseStatic, id) => {
  const base = baseStatic || {};
  const name = (item.name || base.name || item.translations?.zh || id).trim();
  const enName = (item.enName || base.enName || item.translations?.en || '').trim();

  const translations = {
    ...(base.translations || {}),
    ...(item.translations || {}),
  };
  if (name && !translations.zh) {
    translations.zh = name;
  }
  if (enName && !translations.en && base.translations?.en) {
    translations.en = base.translations.en;
  }

  const icon = item.icon !== undefined && item.icon !== null ? item.icon : (base.icon || '');
  const iconFileName = item.icon ? (item.iconFileName || base.iconFileName || '') : '';
  const localeIcons = {
    ...(base.localeIcons || {}),
    ...(item.localeIcons || {}),
  };
  const localeIconFileNames = {
    ...(base.localeIconFileNames || {}),
    ...(item.localeIconFileNames || {}),
  };

  const jumpType = item.jumpType || base.jumpType || 'internal';
  const jumpUrl = (item.jumpUrl !== undefined ? item.jumpUrl : (base.jumpUrl || '')).trim();
  const category = item.category || base.category || '其他';
  const productGroup = item.productGroup || base.productGroup || 'all';
  const pro = item.pro !== undefined ? Boolean(item.pro) : Boolean(base.pro);
  const showBadge = item.showBadge !== undefined ? Boolean(item.showBadge) : Boolean(base.showBadge);

  // 默认设置取已建共享、静态目录默认或表单既有默认；旧角色当前的显隐/顺序不能成为新共享默认 (R-014-E)
  const defaultVisible = (baseStatic?.isSharedSaved || (baseStatic?.id && !baseStatic?.custom))
    ? (baseStatic.defaultVisible || 'yes')
    : 'yes';
  const sort = Number.isFinite(Number(baseStatic?.defaultSort))
    ? Number(baseStatic.defaultSort)
    : (baseStatic?.isSharedSaved && Number.isFinite(Number(baseStatic.sort)) ? Number(baseStatic.sort) : 10);
  const roleTarget = baseStatic?.isSharedSaved && baseStatic?.roleTarget ? baseStatic.roleTarget : item.roleTarget || base.roleTarget || 'all';

  const res = {
    ...base,
    ...item,
    id,
    name,
    enName,
    translations,
    icon,
    iconFileName,
    localeIcons,
    localeIconFileNames,
    jumpType,
    jumpUrl,
    category,
    productGroup,
    roleTarget,
    pro,
    showBadge,
    defaultVisible,
    sort,
  };
  delete res.visible;
  delete res.isPinned;
  delete res.pinnedOrder;
  delete res.isRemoved;
  return res;
};

/**
 * 构建当前 (platform, section) 的统一入口目录
 * 包含：内置目录 + 各角色已存自定义入口 + 共享入口
 * 同时标出“被哪些角色使用”以及“是否存在历史角色差异”
 */
export const buildUnifiedDirectory = ({
  platform = 'app',
  section = 'workbench',
  sharedEntriesTree,
  savedPlatformConfigs,
  staticCatalog = [],
  roleList = [],
}) => {
  const sharedMap = sharedEntriesTree?.entries?.[platform]?.[section] || {};
  const sectionRoles = savedPlatformConfigs?.[platform]?.[section] || {};

  // 收集当前端与区域出现过的所有 entry id
  const allIds = new Set();
  staticCatalog.forEach((item) => allIds.add(item.id));
  Object.keys(sharedMap).forEach((id) => allIds.add(id));

  Object.keys(sectionRoles).forEach((roleKey) => {
    const items = sectionRoles[roleKey]?.items || [];
    items.forEach((item) => allIds.add(item.id));
  });

  const directoryList = [];

  allIds.forEach((id) => {
    if (sharedMap[id]?.isDeleted) return;
    // 找出使用该 id 的角色名列表
    const usedByRoles = [];
    roleList.forEach((r) => {
      const storageKey = r.storageKey || r.name || r;
      const roleName = r.name || r;
      const rConf = sectionRoles[storageKey] || sectionRoles[roleName] || sectionRoles[r.id];
      if (rConf?.items?.some((i) => i.id === id && !i.isRemoved)) {
        usedByRoles.push(roleName);
      }
    });

    const sharedRecord = sharedMap[id];
    const staticItem = staticCatalog.find((c) => c.id === id);

    if (sharedRecord && !sharedRecord.availabilityOnly) {
      // 已经建立共享资料，权威取共享记录
      directoryList.push({
        ...staticItem,
        ...sharedRecord,
        id,
        isSharedSaved: true,
        hasRoleDifferences: false,
        diffSources: [],
        usedByRoles,
      });
      return;
    }

    // 未建立共享资料：收集所有来源进行差异比对
    // 为自定义入口寻找基准原型定义（若非静态目录内置项，优先选用已有明确名称的角色资料）
    let customBaseItem = null;
    if (!staticItem) {
      for (const r of roleList) {
        const storageKey = r.storageKey || r.name || r;
        const roleName = r.name || r;
        const rConf = sectionRoles[storageKey] || sectionRoles[roleName] || sectionRoles[r.id];
        const roleItem = rConf?.items?.find((i) => i.id === id);
        if (roleItem && (roleItem.name || roleItem.translations?.zh)) {
          customBaseItem = roleItem;
          break;
        }
      }
      if (!customBaseItem) {
        for (const r of roleList) {
          const storageKey = r.storageKey || r.name || r;
          const roleName = r.name || r;
          const rConf = sectionRoles[storageKey] || sectionRoles[roleName] || sectionRoles[r.id];
          const roleItem = rConf?.items?.find((i) => i.id === id);
          if (roleItem) {
            customBaseItem = roleItem;
            break;
          }
        }
      }
    }
    const baseDefinition = staticItem || customBaseItem;

    const sources = [];
    if (staticItem) {
      sources.push({
        type: 'catalog',
        label: '基础目录默认资料',
        data: normalizeSourceData(staticItem, baseDefinition, id),
      });
    }

    // 仅已存且 isConfigured === true 的角色才作为历史资料来源 (R-014-D, R-014-E)
    // 没有公共资料的纯引用（仅有 id/custom/visible 等）不能作为历史资料差异来源 (R-014-E)
    roleList.forEach((r) => {
      const storageKey = r.storageKey || r.name || r;
      const roleName = r.name || r;
      const rConf = sectionRoles[storageKey] || sectionRoles[roleName] || sectionRoles[r.id];
      if (rConf && rConf.isConfigured === true) {
        const roleItem = rConf.items?.find((i) => i.id === id);
        if (roleItem) {
          const isPureRef =
            !roleItem.name &&
            !roleItem.translations?.zh &&
            !roleItem.translations?.en &&
            !roleItem.enName &&
            !roleItem.icon &&
            !roleItem.jumpUrl;
          if (!isPureRef) {
            sources.push({
              type: 'role',
              roleName,
              label: `【${roleName}】已存资料`,
              data: normalizeSourceData(roleItem, staticItem, id),
            });
          }
        }
      }
    });

    // 若所有角色均为纯引用且无静态目录，兜底保留首个来源供展示回显
    if (sources.length === 0 && !staticItem) {
      for (const r of roleList) {
        const storageKey = r.storageKey || r.name || r;
        const roleName = r.name || r;
        const rConf = sectionRoles[storageKey] || sectionRoles[roleName] || sectionRoles[r.id];
        if (rConf && rConf.isConfigured === true) {
          const roleItem = rConf.items?.find((i) => i.id === id);
          if (roleItem) {
            sources.push({
              type: 'role',
              roleName,
              label: `【${roleName}】已存资料`,
              data: normalizeSourceData(roleItem, baseDefinition, id),
            });
            break;
          }
        }
      }
    }

    let hasRoleDifferences = false;
    if (sources.length > 1) {
      const firstSourceData = sources[0].data;
      for (let i = 1; i < sources.length; i++) {
        if (!arePublicFieldsEqual(firstSourceData, sources[i].data)) {
          hasRoleDifferences = true;
          break;
        }
      }
    }

    // 默认回显基准：优先静态目录，次选首个来源
    const baseSource =
      sources[0]?.data ||
      normalizeSourceData(baseDefinition || { id, name: id }, baseDefinition, id);

    directoryList.push({
      ...baseSource,
      ...(sharedRecord?.availabilityOnly ? { globalEnabled: sharedRecord.globalEnabled } : {}),
      id,
      isSharedSaved: false,
      hasRoleDifferences,
      diffSources: hasRoleDifferences ? sources : [],
      usedByRoles,
    });
  });

  return directoryList;
};

/**
 * 将角色 item 与共享入口资料合并
 * 确保：共享层只覆盖公共字段，不覆盖 id/isPinned/visible/defaultVisible/数组位置
 * 空字符串与删除图标必须无损生效，不能 truthy fallback 回填旧图
 */
export const resolveItemWithShared = (item, sharedEntriesMap = {}, staticCatalog = []) => {
  if (!item || !item.id) return item;

  const shared = sharedEntriesMap[item.id];
  if (shared && !shared.availabilityOnly) {
    return {
      ...item,
      name: shared.name || item.id,
      enName: shared.enName || '',
      translations: { ...(shared.translations || {}) },
      icon: shared.icon !== undefined && shared.icon !== null ? shared.icon : (item.icon || ''),
      iconFileName: shared.icon ? (shared.iconFileName || '') : '',
      localeIcons: { ...(shared.localeIcons || {}) },
      localeIconFileNames: { ...(shared.localeIconFileNames || {}) },
      jumpType: shared.jumpType !== undefined ? shared.jumpType : (item.jumpType || 'internal'),
      jumpUrl: shared.jumpUrl !== undefined ? shared.jumpUrl : (item.jumpUrl || ''),
      productGroup: shared.productGroup || item.productGroup || 'all',
      roleTarget: shared.roleTarget || item.roleTarget || 'all',
      pro: shared.pro !== undefined ? Boolean(shared.pro) : Boolean(item.pro),
      showBadge: shared.showBadge !== undefined ? Boolean(shared.showBadge) : Boolean(item.showBadge),
      createdBy: shared.createdBy !== undefined ? shared.createdBy : item.createdBy,
      createdAt: shared.createdAt !== undefined ? shared.createdAt : item.createdAt,
      category: shared.category || item.category || '其他',
      custom: Boolean(item.custom || shared.custom),
      // 保持角色自身设置
      id: item.id,
      isPinned: Boolean(item.isPinned),
      pinnedOrder: item.pinnedOrder,
      visible: Boolean(item.visible),
      defaultVisible: item.defaultVisible || shared.defaultVisible || 'yes',
    };
  }

  // 尚未建立共享资料时，保留各角色自身记录，必要时用静态目录补齐缺失展示字段
  const staticItem = staticCatalog.find((c) => c.id === item.id);
  return {
    ...staticItem,
    ...item,
    ...(shared?.availabilityOnly ? { globalEnabled: shared.globalEnabled } : {}),
    name: item.name || staticItem?.name || item.id,
    enName: item.enName || staticItem?.enName || '',
    category: item.category || staticItem?.category || '其他',
    icon: item.icon !== undefined && item.icon !== null ? item.icon : (staticItem?.icon || ''),
  };
};

/**
 * 将静态目录与共享资料合并，供添加抽屉、预览或点击统计使用
 */
export const resolveCatalogWithShared = (staticCatalog = [], sharedEntriesMap = {}) => {
  const merged = staticCatalog.filter((item) => !sharedEntriesMap[item.id]?.isDeleted).map((catItem) => {
    const shared = sharedEntriesMap[catItem.id];
    if (shared) {
      return {
        ...catItem,
        ...shared,
        name: shared.name || catItem.name,
        enName: shared.enName || catItem.enName,
      };
    }
    return catItem;
  });

  // 如果有新建的自定义共享入口，且未在静态目录中，也追加至可用目录中
  const seenIds = new Set(staticCatalog.map((c) => c.id));
  Object.values(sharedEntriesMap).forEach((shared) => {
    if (shared?.id && !shared.isDeleted && !seenIds.has(shared.id)) {
      merged.push({
        ...shared,
        name: shared.name || shared.id,
        enName: shared.enName || shared.id,
        category: shared.category || '自定义',
      });
    }
  });

  return merged;
};

/**
 * 将无差异的旧自定义公共资料一次性保留至独立共享存储 (R-014-F)
 * 保护已有共享不覆盖，有真实差异的绝不静默入库，沿用 revision 校验与防损坏锁写
 */
export const preserveUnsharedLegacyCustomEntries = (
  entries = [],
  platform = 'app',
  section = 'workbench'
) => {
  const readRes = readSharedEntriesFromStorage();
  if (readRes.hasReadError) {
    throw new Error('共享存储读取异常，为保护已有数据拒绝自动保留旧自定义资料');
  }

  const latestTree = readRes.tree;
  if (!latestTree.entries[platform]) latestTree.entries[platform] = {};
  if (!latestTree.entries[platform][section]) latestTree.entries[platform][section] = {};
  if (!latestTree.revisions[platform]) latestTree.revisions[platform] = {};

  const secEntries = latestTree.entries[platform][section];
  let changed = false;

  const list = Array.isArray(entries) ? entries : [entries];
  for (const entry of list) {
    if (!entry || !entry.id || !entry.custom) continue;
    // 已有共享不覆盖
    if (secEntries[entry.id]) continue;
    // 有真实差异绝不静默选版本
    if (entry.hasRoleDifferences) continue;

    const cleanEntry = sanitizeSharedEntry(entry);
    secEntries[cleanEntry.id] = cleanEntry;
    changed = true;
  }

  if (!changed) {
    return { tree: latestTree, changed: false };
  }

  const nextRev = `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  latestTree.revisions[platform][section] = nextRev;

  if (!validateSharedEntriesTree(latestTree)) {
    throw new Error('保存未完成：生成的共享入口数据结构校验未通过');
  }

  // 小批量共享目录单个 setItem 原子写入
  window.localStorage.setItem(ROLE_WORKBENCH_ENTRIES_KEY, JSON.stringify(latestTree));

  return {
    tree: latestTree,
    newRevision: nextRev,
    changed: true,
  };
};

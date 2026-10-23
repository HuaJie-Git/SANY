import { getDefaultTemplate } from './roleWorkbench.js';

export const ROLE_WORKBENCH_DEFAULTS_KEY = 'sanvist_role_workbench_defaults_v1';

export const VALID_PLATFORM_SECTIONS = {
  app: ['workbench', 'modules'],
  pc: ['modules', 'actions'],
};

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * 校验默认配置存储整树结构与字段类型 (R-017, R-017-D)
 */
export const validateDefaultsTree = (parsed) => {
  if (!isPlainObject(parsed)) return false;

  for (const [platform, sections] of Object.entries(VALID_PLATFORM_SECTIONS)) {
    if (parsed[platform] !== undefined) {
      if (!isPlainObject(parsed[platform])) return false;

      for (const section of sections) {
        const secConf = parsed[platform][section];
        if (secConf !== undefined) {
          if (!isPlainObject(secConf)) return false;
          // 区域存在必须 items 为数组 (R-017-D)
          if (!Array.isArray(secConf.items)) return false;

          if (secConf.revision !== undefined && typeof secConf.revision !== 'string') return false;
          if (secConf.version !== undefined && typeof secConf.version !== 'string') return false;
          if (secConf.updatedAt !== undefined && typeof secConf.updatedAt !== 'string') return false;
          if (secConf.updatedBy !== undefined && typeof secConf.updatedBy !== 'string') return false;
          if (secConf.isConfigured !== undefined && typeof secConf.isConfigured !== 'boolean') return false;

          // 已配置状态必须有合法的非'--'版本标识 (R-017-D)
          if (secConf.isConfigured === true) {
            if (!secConf.revision || typeof secConf.revision !== 'string' || secConf.revision === '--') {
              return false;
            }
          }

          const seenIds = new Set();
          for (const item of secConf.items) {
            if (!isPlainObject(item)) return false;
            if (typeof item.id !== 'string' || !item.id.trim()) return false;
            if (seenIds.has(item.id)) return false;
            seenIds.add(item.id);

            if (item.visible !== undefined && typeof item.visible !== 'boolean') return false;
            if (item.isPinned !== undefined && typeof item.isPinned !== 'boolean') return false;
            if (item.custom !== undefined && typeof item.custom !== 'boolean') return false;
            if (item.defaultVisible !== undefined && item.defaultVisible !== 'yes' && item.defaultVisible !== 'no') return false;
          }
        }
      }
    }
  }

  return true;
};

/**
 * 创建单区域初始默认配置对象（未配置状态，不自动持久化）
 */
export const createInitialDefaultSection = (platform, section) => ({
  platform,
  section,
  version: '--',
  revision: '--',
  updatedAt: '--',
  updatedBy: '--',
  isConfigured: false,
  items: getDefaultTemplate(platform, section).map((i) => ({ ...i })),
});

/**
 * 创建初始默认配置整树
 */
export const createInitialDefaultsTree = () => ({
  app: {
    workbench: createInitialDefaultSection('app', 'workbench'),
    modules: createInitialDefaultSection('app', 'modules'),
  },
  pc: {
    modules: createInitialDefaultSection('pc', 'modules'),
    actions: createInitialDefaultSection('pc', 'actions'),
  },
});

/**
 * 规范化默认配置 items，确保 isPinned/visible/defaultVisible 正确，保留未知合法字段
 */
export const sanitizeDefaultItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const isVisible = item.visible !== undefined
      ? Boolean(item.visible)
      : (item.defaultVisible === 'no' ? false : true);
    return {
      ...item,
      id: item.id,
      isPinned: Boolean(item.isPinned),
      visible: isVisible,
      defaultVisible: item.defaultVisible || (isVisible ? 'yes' : 'no'),
      custom: Boolean(item.custom),
    };
  });
};

/**
 * 从本地存储读取默认配置（带严格防损坏校验，读取失败不覆盖已有存储）
 */
export const readRoleWorkbenchDefaultsFromStorage = () => {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(ROLE_WORKBENCH_DEFAULTS_KEY) : null;
    if (raw === null || raw === undefined) {
      return {
        tree: createInitialDefaultsTree(),
        hasReadError: false,
      };
    }

    const parsed = JSON.parse(raw);
    if (!validateDefaultsTree(parsed)) {
      return {
        tree: createInitialDefaultsTree(),
        hasReadError: true,
        error: new Error('默认配置存储数据结构损坏或字段类型非法'),
      };
    }

    const baseTree = createInitialDefaultsTree();
    const resultTree = {
      ...parsed,
      app: { ...(parsed.app || {}) },
      pc: { ...(parsed.pc || {}) },
    };

    for (const [platform, sections] of Object.entries(VALID_PLATFORM_SECTIONS)) {
      for (const section of sections) {
        if (parsed[platform]?.[section]) {
          resultTree[platform][section] = {
            ...baseTree[platform][section],
            ...parsed[platform][section],
            items: sanitizeDefaultItems(parsed[platform][section].items),
          };
        } else {
          resultTree[platform][section] = baseTree[platform][section];
        }
      }
    }

    return {
      tree: resultTree,
      hasReadError: false,
    };
  } catch (err) {
    return {
      tree: createInitialDefaultsTree(),
      hasReadError: true,
      error: err,
    };
  }
};

/**
 * 获取指定平台与区域的默认配置 revision（未配置时返回 '--'）
 */
export const getDefaultSectionRevision = (tree, platform, section) => {
  const sec = tree?.[platform]?.[section];
  if (sec?.isConfigured && sec?.revision && sec.revision !== '--') {
    return sec.revision;
  }
  return '--';
};

/**
 * 原子保存默认配置至 localStorage，同区域严格比较 expectedRevision（含 '--' 首次竞争）
 * 仅 patch 目标平台与区域，未知合法字段保留，不写任何角色记录
 */
export const saveRoleWorkbenchDefaultToStorage = (
  sectionData,
  platform = 'app',
  section = 'workbench',
  expectedBaseRevision = null,
  shouldSimulateError = false
) => {
  if (shouldSimulateError) {
    throw new Error('保存未完成：存储或网络模拟异常');
  }

  // 1. 终端与区域合法性检查 (R-017-D: 不能保存 app/actions 等非法组合)
  if (!VALID_PLATFORM_SECTIONS[platform]?.includes(section)) {
    throw new Error(`非法的终端或区域组合: platform=${platform}, section=${section}`);
  }

  // 2. 写入前入参校验（不能在 normalize 前漏掉非法字段）
  if (!isPlainObject(sectionData)) {
    throw new Error('保存的区域配置数据必须是合法对象');
  }
  if (sectionData.items !== undefined) {
    if (!Array.isArray(sectionData.items)) {
      throw new Error('items 必须是数组');
    }
    const seenIds = new Set();
    for (const item of sectionData.items) {
      if (!isPlainObject(item)) throw new Error('item 必须是对象');
      if (typeof item.id !== 'string' || !item.id.trim()) throw new Error('item.id 必须是非空字符串');
      if (seenIds.has(item.id)) throw new Error(`duplicate ID: ${item.id}`);
      seenIds.add(item.id);
      if (item.visible !== undefined && typeof item.visible !== 'boolean') {
        throw new Error('item.visible 必须是 boolean');
      }
      if (item.isPinned !== undefined && typeof item.isPinned !== 'boolean') {
        throw new Error('item.isPinned 必须是 boolean');
      }
      if (item.custom !== undefined && typeof item.custom !== 'boolean') {
        throw new Error('item.custom 必须是 boolean');
      }
      if (item.defaultVisible !== undefined && item.defaultVisible !== 'yes' && item.defaultVisible !== 'no') {
        throw new Error('item.defaultVisible 必须是 yes 或 no');
      }
    }
  }

  // 3. 重读最新存储并做坏数据拦截
  const readRes = readRoleWorkbenchDefaultsFromStorage();
  if (readRes.hasReadError) {
    throw new Error('检测到默认配置存储读取异常，为保护已有数据拒绝覆盖，请先重试读取');
  }
  const latestTree = readRes.tree;

  // 4. 版本冲突校验：显式提供基准（含 '--'）时和最新 revision 严格比较
  const latestTargetSection = latestTree?.[platform]?.[section];
  const latestTargetRevision =
    latestTargetSection?.isConfigured && latestTargetSection?.revision && latestTargetSection.revision !== '--'
      ? latestTargetSection.revision
      : '--';

  if (
    expectedBaseRevision !== null &&
    expectedBaseRevision !== undefined &&
    latestTargetRevision !== expectedBaseRevision
  ) {
    const conflictErr = new Error(
      `默认配置已在其他窗口更新（版本冲突：编辑基准 ${expectedBaseRevision} vs 最新已存 ${latestTargetRevision}），当前草稿已保留，请核对后重试。`
    );
    conflictErr.isConflict = true;
    conflictErr.latestRevision = latestTargetRevision;
    conflictErr.baseRevision = expectedBaseRevision;
    throw conflictErr;
  }

  // 5. 计算版本号与新 revision
  const isFirstConfig = !latestTargetSection?.isConfigured || latestTargetSection?.version === '--';
  const nextVersion = isFirstConfig
    ? 'v1.0.0'
    : `v1.${parseInt(latestTargetSection?.version?.split('.')[1] || '0', 10) + 1}.0`;
  const nextRevision = `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  // 6. 规范化 items 并构建最终 section 配置
  const inputItems = sectionData.items !== undefined
    ? sectionData.items
    : (latestTargetSection?.items || []);
  const sanitizedItems = sanitizeDefaultItems(inputItems);

  const finalSection = {
    ...(latestTargetSection || {}),
    ...sectionData,
    platform,
    section,
    version: nextVersion,
    revision: nextRevision,
    updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    updatedBy: '当前管理员',
    items: sanitizedItems,
    isConfigured: true,
  };

  // 7. 读取原始存储以保留顶层与各层未知字段
  let rawParsed = {};
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(ROLE_WORKBENCH_DEFAULTS_KEY) : null;
    if (raw) rawParsed = JSON.parse(raw);
  } catch {}
  if (!isPlainObject(rawParsed)) rawParsed = {};
  if (!isPlainObject(rawParsed[platform])) rawParsed[platform] = {};
  rawParsed[platform][section] = finalSection;

  // 8. 写前严格校验
  if (!validateDefaultsTree(rawParsed)) {
    throw new Error('保存未完成：生成的默认配置数据结构校验未通过');
  }

  // 9. 原子单个 setItem 写入
  window.localStorage.setItem(ROLE_WORKBENCH_DEFAULTS_KEY, JSON.stringify(rawParsed));

  return {
    tree: readRoleWorkbenchDefaultsFromStorage().tree,
    newRevision: nextRevision,
    sectionConf: finalSection,
  };
};

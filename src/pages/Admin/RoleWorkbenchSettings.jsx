import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ADMIN_ROLES,
  PLATFORMS,
  PC_SECTIONS,
  getDefaultTemplate,
  getCatalogForPlatform,
  readPlatformConfigsFromStorage,
  savePlatformConfigsToStorage,
  DEFAULT_WORKBENCH_RULES,
  sanitizeRules,
  readRoleEntryStatsFromStorage,
} from '../../admin/roleWorkbench';
import RoleWorkbenchDialog from './RoleWorkbenchDialog';
import { RoleWorkbenchRules, RoleWorkbenchStats } from './RoleWorkbenchRulesAndStats';

export default function RoleWorkbenchSettings() {
  const [platform, setPlatform] = useState('app'); // 'app' | 'pc'
  const [section, setSection] = useState('workbench'); // app: 'workbench'; pc: 'modules' | 'actions'
  const [currentRoleKey, setCurrentRoleKey] = useState('机手');

  const [allConfigs, setAllConfigs] = useState(() => {
    const res = readPlatformConfigsFromStorage();
    return res.tree;
  });
  const [storageLoadError, setStorageLoadError] = useState(() => {
    const res = readPlatformConfigsFromStorage();
    return res.hasReadError;
  });
  const [drafts, setDrafts] = useState({}); // comboKey -> { items, rules, hasDraftChanges }
  const [demoStates, setDemoStates] = useState({}); // comboKey -> 'normal' | 'load_error' | 'forbidden' | 'conflict'

  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('all');
  const [message, setMessage] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // R-011-B: 添加与预览页内展开状态 (默认收起)
  const [showCatalog, setShowCatalog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [statViewPeriod, setStatViewPeriod] = useState('30d');
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const [previewUserType, setPreviewUserType] = useState('regular'); // 'regular' | 'new'

  const getComboKey = (p, s, r) => `${p}__${s}__${r}`;
  const currentComboKey = getComboKey(platform, section, currentRoleKey);
  const currentDemoState = demoStates[currentComboKey] || 'normal';

  // 重试读取存储（保留当前已编辑草稿不丢失）
  const handleRetryRead = () => {
    const res = readPlatformConfigsFromStorage();
    setAllConfigs(res.tree);
    if (!res.hasReadError) {
      setStorageLoadError(false);
      setDemoStates((prev) => ({ ...prev, [currentComboKey]: 'normal' }));
      showToast('重试读取成功，已恢复正常配置（当前草稿完整保留）');
    } else {
      showToast('重试读取失败，存储数据仍然异常，请检查本地环境', 'error');
    }
  };

  // 当切换终端时，自适应设置 section
  const handlePlatformChange = (nextPlatform) => {
    setPlatform(nextPlatform);
    if (nextPlatform === 'app') {
      setSection('workbench');
    } else if (section === 'workbench') {
      setSection('modules');
    }
  };

  // 获取当前组合已持久化的配置元信息
  const currentRoleMeta = useMemo(() => {
    const saved = allConfigs?.[platform]?.[section]?.[currentRoleKey];
    if (saved) {
      return {
        ...saved,
        rules: sanitizeRules(saved.rules),
      };
    }
    return {
      roleName: currentRoleKey,
      platform,
      section,
      version: '--',
      revision: '--',
      updatedAt: '--',
      isConfigured: false,
      items: getDefaultTemplate(platform, section).map((i) => ({ ...i })),
      rules: { ...DEFAULT_WORKBENCH_RULES },
    };
  }, [allConfigs, platform, section, currentRoleKey]);

  // 获取当前生效的草稿项目、规则和草稿状态
  const activeItems = useMemo(() => {
    if (drafts[currentComboKey]?.items) {
      return drafts[currentComboKey].items;
    }
    return currentRoleMeta.items || [];
  }, [drafts, currentComboKey, currentRoleMeta]);

  const activeRules = useMemo(() => {
    if (drafts[currentComboKey]?.rules) {
      return drafts[currentComboKey].rules;
    }
    return currentRoleMeta.rules || { ...DEFAULT_WORKBENCH_RULES };
  }, [drafts, currentComboKey, currentRoleMeta]);

  const hasDraftChanges = useMemo(() => {
    return Boolean(drafts[currentComboKey]?.hasDraftChanges);
  }, [drafts, currentComboKey]);

  // 切换组合或规则更新时，默认统计查看周期跟随当前规则设定的 autoPeriod
  useEffect(() => {
    setStatViewPeriod(activeRules.autoPeriod || '30d');
  }, [currentComboKey, activeRules.autoPeriod]);

  // 1. 自动排序专用的统计数据：必须严格使用当前规则配置的 activeRules.autoPeriod (AC-019/021)
  const autoSortStats = useMemo(() => {
    if (statsRefreshKey < 0) return null;
    return readRoleEntryStatsFromStorage(platform, section, currentRoleKey, activeRules.autoPeriod);
  }, [platform, section, currentRoleKey, activeRules.autoPeriod, statsRefreshKey]);

  // 2. 统计表格查看专用的统计数据：独立使用 statViewPeriod (切换查看周期不改变自动排序结果)
  const viewStatsRaw = useMemo(() => {
    if (statsRefreshKey < 0) return null;
    return readRoleEntryStatsFromStorage(platform, section, currentRoleKey, statViewPeriod);
  }, [platform, section, currentRoleKey, statViewPeriod, statsRefreshKey]);

  // 缓存各作用域与查看周期最近一次成功读取的快照 (AC-020/021)
  const [cachedSuccessfulStats, setCachedSuccessfulStats] = useState({});
  const currentViewKey = `${currentComboKey}__${statViewPeriod}`;

  useEffect(() => {
    if (viewStatsRaw && viewStatsRaw.hasData && !viewStatsRaw.hasError) {
      setCachedSuccessfulStats((prev) => ({
        ...prev,
        [currentViewKey]: viewStatsRaw,
      }));
    }
  }, [currentViewKey, viewStatsRaw]);

  // 组合展示的统计状态（读取失败时保留当前组合/查看周期最近成功的快照并标 isStale；没有旧快照时显示 --）
  const effectiveViewStats = useMemo(() => {
    if (!viewStatsRaw) return null;
    if (viewStatsRaw.hasError) {
      const cached = cachedSuccessfulStats[currentViewKey];
      if (cached) {
        return {
          ...cached,
          isStale: true,
          hasError: true,
          errorMessage: viewStatsRaw.errorMessage,
        };
      }
    }
    return viewStatsRaw;
  }, [viewStatsRaw, cachedSuccessfulStats, currentViewKey]);

  // 刷新统计按钮：刷新失败不能同时提示「统计数据已刷新」，必须能重试
  const handleRefreshStats = () => {
    setStatsLoading(true);
    window.setTimeout(() => {
      const res = readRoleEntryStatsFromStorage(platform, section, currentRoleKey, statViewPeriod);
      setStatsRefreshKey((k) => k + 1);
      setStatsLoading(false);
      if (res.hasError) {
        showToast(`统计数据刷新失败: ${res.errorMessage}`, 'error');
      } else {
        showToast('统计数据已刷新');
      }
    }, 200);
  };

  // 更新当前入口草稿（保留规则草稿）
  const updateCurrentDraft = (newItems) => {
    setDrafts((prev) => ({
      ...prev,
      [currentComboKey]: {
        items: newItems,
        rules: activeRules,
        hasDraftChanges: true,
      },
    }));
  };

  // 更新当前规则草稿（保留入口草稿，产生待保存草稿）
  const updateCurrentDraftRules = (newRules) => {
    setDrafts((prev) => ({
      ...prev,
      [currentComboKey]: {
        items: activeItems,
        rules: {
          ...activeRules,
          ...newRules,
        },
        hasDraftChanges: true,
      },
    }));
  };

  const showToast = (text, type = 'success', isConflict = false) => {
    setMessage({ text, type, isConflict });
    window.setTimeout(() => setMessage(null), 4000);
  };

  const platformLabel = platform === 'pc' ? 'PC 工作台' : 'APP 工作台';
  const sectionLabel = platform === 'pc' ? (section === 'actions' ? '快速行动' : '页面模块') : '工作台入口';
  const isPCModules = platform === 'pc' && section === 'modules';

  // 当前端与区域对应的功能目录
  const currentCatalog = useMemo(() => {
    return getCatalogForPlatform(platform, section);
  }, [platform, section]);

  // 当前可用的分类列表
  const availableCategories = useMemo(() => {
    const set = new Set();
    currentCatalog.forEach((fn) => {
      if (fn.category) set.add(fn.category);
    });
    return ['all', ...Array.from(set)];
  }, [currentCatalog]);

  // 重置分类当切换端/区域时分类不在其中
  useEffect(() => {
    if (catalogCategory !== 'all' && !availableCategories.includes(catalogCategory)) {
      setCatalogCategory('all');
    }
  }, [availableCategories, catalogCategory]);

  // 过滤功能目录 (R-011-B: 目录视图把可添加项优先放前，已添加项排后，不影响人工顺序)
  const filteredCatalog = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    const list = currentCatalog.filter((fn) => {
      const matchQuery =
        !query ||
        fn.name.toLowerCase().includes(query) ||
        (fn.enName && fn.enName.toLowerCase().includes(query)) ||
        fn.id.toLowerCase().includes(query);
      const matchCategory = catalogCategory === 'all' || fn.category === catalogCategory;
      return matchQuery && matchCategory;
    });
    const activeSet = new Set(activeItems.map((i) => i.id));
    return [...list].sort((a, b) => {
      const aIn = activeSet.has(a.id) ? 1 : 0;
      const bIn = activeSet.has(b.id) ? 1 : 0;
      return aIn - bIn;
    });
  }, [currentCatalog, catalogSearch, catalogCategory, activeItems]);

  // 获取功能详情（从当前端区域的目录中查找）
  const getFunctionDetail = useCallback((id) => {
    return (
      currentCatalog.find((f) => f.id === id) || {
        id,
        name: id,
        enName: id,
        category: '其他',
        color: '#f3f4f6',
        icon: '应用',
        pro: false,
      }
    );
  }, [currentCatalog]);

  // 上移
  const moveUp = (index) => {
    if (index === 0) return;
    const next = [...activeItems];
    const [item] = next.splice(index, 1);
    next.splice(index - 1, 0, item);
    updateCurrentDraft(next);
  };

  // 下移
  const moveDown = (index) => {
    if (index === activeItems.length - 1) return;
    const next = [...activeItems];
    const [item] = next.splice(index, 1);
    next.splice(index + 1, 0, item);
    updateCurrentDraft(next);
  };

  // 移出工作台/模块库
  const removeItem = (id) => {
    updateCurrentDraft(activeItems.filter((i) => i.id !== id));
  };

  // 切换运营置顶
  const togglePin = (id) => {
    const next = activeItems.map((item) => {
      if (item.id === id) {
        return { ...item, isPinned: !item.isPinned };
      }
      return item;
    });
    updateCurrentDraft(next);
  };

  // 切换 PC 页面模块纳入显示显隐状态（同步 visible 与 defaultVisible）
  const toggleVisible = (id) => {
    const next = activeItems.map((item) => {
      if (item.id === id) {
        const currentVis = item.visible !== undefined ? Boolean(item.visible) : (item.defaultVisible !== 'no');
        const nextVis = !currentVis;
        return {
          ...item,
          visible: nextVis,
          defaultVisible: nextVis ? 'yes' : 'no',
        };
      }
      return item;
    });
    updateCurrentDraft(next);
  };

  // 从目录添加功能到工作台
  const addFunctionToWorkbench = (fn) => {
    if (activeItems.some((i) => i.id === fn.id)) {
      showToast(`“${fn.name}”已在当前配置列表中`, 'info');
      return;
    }
    const newItem = {
      id: fn.id,
      isPinned: false,
      visible: true,
      defaultVisible: 'yes',
    };
    updateCurrentDraft([...activeItems, newItem]);
    showToast(`已添加“${fn.name}”到【${platformLabel} · ${sectionLabel}】`, 'success');
  };

  // 保存当前 (platform, section, roleKey) 配置 (STATE-PLATFORM-002, AC-012, R-011-E: 严格使用原接口签名与冲突捕获，不给历史 sort 重新编号)
  const saveCurrentConfig = () => {
    // 保护：若当前存储处于读取损坏/错误状态，禁止静默覆盖
    if (storageLoadError) {
      showToast('本地存储处于读取异常状态，为保护原数据已锁定保存，请先点击重试读取', 'error');
      return;
    }

    // 模拟并发更新冲突（按当前组合隔离）
    if (currentDemoState === 'conflict') {
      showToast(
        `【${platformLabel} · ${sectionLabel} · ${currentRoleKey}】配置已在其他窗口更新（版本冲突），请核对最新版本，当前草稿已保留。`,
        'error',
        true
      );
      return;
    }

    try {
      const isFirstConfig = !currentRoleMeta.isConfigured || currentRoleMeta.version === '--';
      const nextVersion = isFirstConfig
        ? 'v1.0.0'
        : `v1.${parseInt(currentRoleMeta.version?.split('.')[1] || '0', 10) + 1}.0`;
      const nextRevision = `rev-${Date.now().toString(36)}`;

      const nextRoleConf = {
        ...currentRoleMeta,
        platform,
        section,
        version: nextVersion,
        revision: nextRevision,
        updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
        updatedBy: '当前管理员',
        items: activeItems.map((item) => {
          const isVis = item.visible !== undefined
            ? Boolean(item.visible)
            : (item.defaultVisible === 'no' ? false : true);
          return {
            ...item,
            id: item.id,
            isPinned: Boolean(item.isPinned),
            visible: isVis,
            defaultVisible: isVis ? 'yes' : 'no',
            custom: Boolean(item.custom),
          };
        }),
        rules: { ...activeRules },
        isConfigured: true,
      };

      // savePlatformConfigsToStorage 重读最新树并校验同一组合 revision 与当前编辑基准（currentRoleMeta.revision）
      // 其他组合被保存不触发冲突；冲突时抛出异常并不静默覆盖
      const updatedTree = savePlatformConfigsToStorage(
        nextRoleConf,
        platform,
        section,
        currentRoleKey,
        currentRoleMeta?.revision
      );

      setAllConfigs(updatedTree);

      // 仅重置当前组合的草稿变化标记，保留更新后项目与规则
      setDrafts((prev) => ({
        ...prev,
        [currentComboKey]: {
          items: nextRoleConf.items,
          rules: nextRoleConf.rules,
          hasDraftChanges: false,
        },
      }));

      showToast(`【${platformLabel} · ${sectionLabel} · ${currentRoleKey}】配置已保存`);
    } catch (err) {
      // 错误发生时草稿完整保留在 drafts[currentComboKey]，用户可核对或重试
      const isConflict = Boolean(err?.isConflict || currentDemoState === 'conflict');
      showToast(err?.message || '本地存储保存失败（存储空间不足或受限），请重试', 'error', isConflict);
    }
  };

  // 取消本次修改（恢复最近已保存的入口与规则）
  const cancelChanges = () => {
    const savedConf = allConfigs?.[platform]?.[section]?.[currentRoleKey];
    const initialItems = savedConf?.items || getDefaultTemplate(platform, section).map((i) => ({ ...i }));
    const initialRules = sanitizeRules(savedConf?.rules);
    setDrafts((prev) => ({
      ...prev,
      [currentComboKey]: {
        items: initialItems,
        rules: initialRules,
        hasDraftChanges: false,
      },
    }));
    showToast(`已取消【${platformLabel} · ${sectionLabel} · ${currentRoleKey}】本次修改`, 'info');
  };

  // 恢复系统初始配置 (R-011-B, R-011-E: 恢复按钮改「恢复初始配置」并保留确认，入口和规则都重置，需再保存)
  const resetToSystemDefault = () => {
    const confirmed = window.confirm(
      `确定要将【${platformLabel} · ${sectionLabel} · ${currentRoleKey}】的工作台顺序与展示规则恢复为系统初始配置吗？此操作将生成未保存草稿，需点击“保存配置”持久化。`
    );
    if (!confirmed) return;
    const defaultItems = getDefaultTemplate(platform, section).map((i) => ({ ...i }));
    const defaultRules = { ...DEFAULT_WORKBENCH_RULES };
    setDrafts((prev) => ({
      ...prev,
      [currentComboKey]: {
        items: defaultItems,
        rules: defaultRules,
        hasDraftChanges: true,
      },
    }));
    showToast('已恢复系统初始配置，请保存配置', 'info');
  };

  // 保存多语言弹窗（合并所有已存字段）
  const handleSaveDialog = (formData) => {
    const isVisible = formData.defaultVisible !== 'no';
    if (formData.id) {
      const next = activeItems.map((i) =>
        i.id === formData.id
          ? {
              ...i,
              ...formData,
              visible: isVisible,
              defaultVisible: isVisible ? 'yes' : 'no',
            }
          : i
      );
      updateCurrentDraft(next);
    } else {
      const newId = `custom-${Date.now().toString(36)}`;
      const newItem = {
        ...formData,
        id: newId,
        name: formData.name,
        enName: formData.enName || '',
        isPinned: formData.isPinned || false,
        visible: isVisible,
        defaultVisible: isVisible ? 'yes' : 'no',
        custom: true,
      };
      updateCurrentDraft([newItem, ...activeItems]);
    }
    showToast('已更新入口，请保存配置');
    setEditingItem(null);
  };

  // 角色草稿预览数据（联动规则配置与入口点击统计：AC-019, R-010-A, R-011-B）
  const previewList = useMemo(() => {
    const isNewUser = previewUserType === 'new';
    const isSystemDefaultNewUser = isNewUser && activeRules.newUserRule === 'system_default';

    // 1. 新用户选择通用默认顺序时：仅重排当前已纳入入口，不重新添加已移除入口、不开启隐藏项；自定义入口按人工相对顺序接后
    if (isSystemDefaultNewUser) {
      const template = getDefaultTemplate(platform, section);
      const templateRankMap = new Map();
      template.forEach((t, idx) => {
        templateRankMap.set(t.id, idx);
      });

      const sysPinned = activeItems.filter((i) => i.isPinned);
      const sysUnpinned = activeItems.filter((i) => !i.isPinned);

      const templateMatches = [];
      const customMatches = [];

      sysUnpinned.forEach((item, originalIndex) => {
        if (templateRankMap.has(item.id)) {
          templateMatches.push({
            item,
            templateRank: templateRankMap.get(item.id),
          });
        } else {
          customMatches.push({
            item,
            originalIndex,
          });
        }
      });

      templateMatches.sort((a, b) => a.templateRank - b.templateRank);
      customMatches.sort((a, b) => a.originalIndex - b.originalIndex);

      const reordered = [
        ...sysPinned,
        ...templateMatches.map((m) => m.item),
        ...customMatches.map((m) => m.item),
      ];

      return reordered.map((item, idx) => {
        const detail = getFunctionDetail(item.id);
        const isVisible = item.visible !== undefined ? Boolean(item.visible) : (item.defaultVisible !== 'no');
        return {
          ...detail,
          ...item,
          name: item.name || detail.name,
          sortNum: idx + 1,
          isPinned: Boolean(item.isPinned),
          visible: isVisible,
          defaultVisible: isVisible ? 'yes' : 'no',
          clicks: autoSortStats?.hasData && !autoSortStats?.hasError ? (autoSortStats.clicksMap?.[item.id] ?? 0) : null,
        };
      });
    }

    // 2. 其余场景：基准列表使用当前编辑项 activeItems
    const pinned = activeItems.filter((i) => i.isPinned);
    const unpinned = activeItems.filter((i) => !i.isPinned);

    const sortMode = isNewUser
      ? (activeRules.newUserRule === 'clicks_rank' ? 'clicks' : 'manual')
      : (activeRules.userSort === 'auto_clicks' ? 'clicks' : 'manual');

    const canUseClicks = sortMode === 'clicks' && autoSortStats?.hasData && !autoSortStats?.hasError;

    let sortedUnpinned;
    if (canUseClicks) {
      sortedUnpinned = unpinned
        .map((item, originalIndex) => ({
          item,
          originalIndex,
          clicks: autoSortStats.clicksMap?.[item.id] ?? 0,
        }))
        .sort((a, b) => {
          if (b.clicks !== a.clicks) {
            return b.clicks - a.clicks;
          }
          return a.originalIndex - b.originalIndex;
        })
        .map((wrapper) => wrapper.item);
    } else {
      sortedUnpinned = [...unpinned];
    }

    const combined = [...pinned, ...sortedUnpinned];

    return combined.map((item, idx) => {
      const detail = getFunctionDetail(item.id);
      const isVisible = item.visible !== undefined ? Boolean(item.visible) : (item.defaultVisible !== 'no');
      return {
        ...detail,
        ...item,
        name: item.name || detail.name,
        sortNum: idx + 1,
        isPinned: Boolean(item.isPinned),
        visible: isVisible,
        defaultVisible: isVisible ? 'yes' : 'no',
        clicks: autoSortStats?.hasData && !autoSortStats?.hasError ? (autoSortStats.clicksMap?.[item.id] ?? 0) : null,
      };
    });
  }, [
    previewUserType,
    activeRules,
    activeItems,
    platform,
    section,
    autoSortStats,
    getFunctionDetail,
  ]);

  // 自动排序回落人工顺序简短原因说明
  const autoSortFallbackReason = useMemo(() => {
    const isAutoMode = previewUserType === 'new'
      ? activeRules.newUserRule === 'clicks_rank'
      : activeRules.userSort === 'auto_clicks';

    if (!isAutoMode) return null;

    if (autoSortStats?.hasError) {
      return '统计读取失败，已安全回落人工配置顺序';
    }
    if (!autoSortStats?.hasData) {
      return '暂无点击统计数据，已回落人工配置顺序';
    }
    return null;
  }, [previewUserType, activeRules, autoSortStats]);

  return (
    <div className="p-5 text-gray-800 bg-[#f5f7fa] min-h-screen">
      {/* 1. 配置对象栏 (R-011-B, R-011-E: 紧凑合并终端、区域与角色，右侧不重复范围串和草稿徽标) */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-200/80 mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-gray-700">目标终端:</span>
          <div className="flex gap-1.5">
            {PLATFORMS.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => handlePlatformChange(p.id)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition ${
                  platform === p.id
                    ? 'bg-[#1890ff] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {platform === 'pc' ? (
          <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
            <span className="text-[13px] font-semibold text-gray-700">配置区域:</span>
            <div className="flex gap-1.5">
              {PC_SECTIONS.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`px-3 py-1 rounded-md text-[12px] font-medium transition ${
                    section === s.id
                      ? 'bg-blue-50 text-[#1890ff] border border-blue-200 font-semibold'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-4 border-l border-gray-200 text-[12px] text-gray-500">
            <span>配置区域: <strong className="text-gray-700 font-medium">工作台入口</strong></span>
          </div>
        )}

        <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
          <label htmlFor="role-select" className="text-[13px] font-semibold text-gray-700">
            目标角色:
          </label>
          <select
            id="role-select"
            value={currentRoleKey}
            onChange={(e) => setCurrentRoleKey(e.target.value)}
            className="h-8 px-2.5 border border-gray-300 rounded-lg text-[13px] font-medium text-gray-800 bg-white focus:outline-none focus:border-[#1890ff]"
          >
            {ADMIN_ROLES.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 存储读取异常处理 */}
      {(storageLoadError || currentDemoState === 'load_error') && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
          <div className="text-[16px] font-semibold mb-2">
            【{platformLabel} · {sectionLabel}】角色配置读取异常（数据损坏或网络受限）
          </div>
          <p className="text-[13px] text-red-500 mb-4">
            为防止覆盖原有持久化数据，当前已锁定保存并保留本地快照；您可以点击下方按钮重试读取最新配置（当前编辑草稿完整保留）。
          </p>
          <button
            type="button"
            onClick={handleRetryRead}
            className="px-5 py-1.5 bg-[#1890ff] text-white rounded text-[13px] font-medium hover:bg-[#40a9ff]"
          >
            重试读取配置
          </button>
        </div>
      )}

      {/* 模拟无权限异常处理 */}
      {currentDemoState === 'forbidden' && (
        <div className="mb-4 bg-gray-50 border border-gray-200 text-gray-700 p-6 rounded-lg text-center">
          <div className="text-[16px] font-semibold mb-2">您暂无【{platformLabel} · {sectionLabel}】的配置权限</div>
          <p className="text-[13px] text-gray-500 mb-4">当前登录账号缺少 <code>workbench:config:manage</code> 权限点，请联系超级管理员开通。</p>
          <button
            type="button"
            onClick={() => {
              setDemoStates((prev) => ({ ...prev, [currentComboKey]: 'normal' }));
              showToast('已切换至管理员权限');
            }}
            className="px-5 py-1.5 border border-gray-300 rounded text-[13px] font-medium text-gray-700 hover:bg-gray-100"
          >
            申请开通权限 / 切换权限演示
          </button>
        </div>
      )}

      {!storageLoadError && currentDemoState !== 'load_error' && currentDemoState !== 'forbidden' && (
        <>
          {/* Toast 消息 */}
          {message && (
            <div
              role="status"
              className={`mb-4 px-4 py-2.5 rounded-lg border text-[13px] flex items-center justify-between ${
                message.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : message.type === 'info'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-green-50 border-green-200 text-green-700'
              }`}
            >
              <span>{message.text}</span>
              {message.type === 'error' && (currentDemoState === 'conflict' || message.isConflict) && (
                <button
                  type="button"
                  onClick={() => {
                    handleRetryRead();
                    setDemoStates((prev) => ({ ...prev, [currentComboKey]: 'normal' }));
                  }}
                  className="underline ml-3 font-semibold shrink-0"
                >
                  刷新并载入最新配置
                </button>
              )}
            </div>
          )}

          {/* 2. 展示规则 (R-011-B: 移到入口列表前) */}
          <RoleWorkbenchRules
            platformLabel={platformLabel}
            sectionLabel={sectionLabel}
            currentRoleKey={currentRoleKey}
            rules={activeRules}
            onUpdateRules={updateCurrentDraftRules}
          />

          {/* 3. 入口配置 (R-011-B: 常驻一份表格，主体宽度) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-5 mb-5">
            <div className="pb-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900">入口配置</h2>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {activeRules.userSort === 'auto_clicks'
                    ? '当前已开启自动排序。此手动顺序在无点击数据或新用户采用人工顺序时生效，上移/下移不改变自动点击排行。'
                    : '置顶项固定在前；其余项完全按下方列表手动顺序排列。'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-expanded={showCatalog}
                  onClick={() => setShowCatalog(!showCatalog)}
                  className={`h-8 px-3 rounded-lg text-[12px] font-medium transition flex items-center gap-1.5 border ${
                    showCatalog
                      ? 'bg-blue-50 text-[#1890ff] border-blue-200 font-semibold'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>{showCatalog ? '✕ 收起目录' : '+ 添加入口'}</span>
                </button>
                <button
                  type="button"
                  aria-expanded={showPreview}
                  onClick={() => setShowPreview(!showPreview)}
                  className={`h-8 px-3 rounded-lg text-[12px] font-medium transition flex items-center gap-1.5 border ${
                    showPreview
                      ? 'bg-blue-50 text-[#1890ff] border-blue-200 font-semibold'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>{showPreview ? '✕ 收起预览' : '👁 预览效果'}</span>
                </button>
              </div>
            </div>

            {/* 「添加入口」页内展开区 (R-011-B: 默认收起) */}
            {showCatalog && (
              <div className="mt-4 p-4 bg-gray-50/80 rounded-xl border border-gray-200/80 mb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-bold text-gray-800">
                      {isPCModules ? '页面模块目录' : '功能目录'}
                    </h3>
                    <span className="text-[12px] text-gray-400">共 {filteredCatalog.length} 项</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingItem({})}
                      className="h-7 px-3 bg-[#1890ff] text-white rounded-md text-[12px] font-medium hover:bg-[#40a9ff] flex items-center gap-1"
                    >
                      <span>+</span> 新建自定义入口
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCatalog(false)}
                      className="h-7 px-2.5 text-gray-400 hover:text-gray-600 text-[12px]"
                    >
                      收起
                    </button>
                  </div>
                </div>

                {/* 搜索与分类 */}
                <div className="py-2.5 flex flex-wrap gap-2 items-center">
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder={`搜索${isPCModules ? '模块' : '功能'}名称、ID 或英文名...`}
                    className="h-8 px-3 border border-gray-300 rounded-lg text-[12px] w-64 focus:outline-none focus:border-[#1890ff] bg-white"
                  />
                  <select
                    value={catalogCategory}
                    onChange={(e) => setCatalogCategory(e.target.value)}
                    className="h-8 px-2.5 border border-gray-300 rounded-lg text-[12px] text-gray-600 bg-white"
                  >
                    <option value="all">全部分类</option>
                    {availableCategories.filter((c) => c !== 'all').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* 目录列表 */}
                <div className="max-h-[280px] overflow-y-auto divide-y divide-gray-200/70 py-1 bg-white rounded-lg border border-gray-200 px-3">
                  {filteredCatalog.map((fn) => {
                    const isInCurrent = activeItems.some((i) => i.id === fn.id);
                    return (
                      <div key={fn.id} className="py-2.5 px-1 flex items-center justify-between hover:bg-gray-50/70">
                        <div
                          className="min-w-0 flex-1 pr-3"
                          title={`${fn.name} · ID: ${fn.id}${fn.enName ? ` (${fn.enName})` : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-gray-800 truncate" dir="auto">{fn.name}</span>
                            {fn.pro && <span className="px-1 py-0.2 rounded text-[9px] bg-purple-100 text-purple-700 font-bold shrink-0">Pro</span>}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate mt-0.5">
                            {fn.enName} {fn.category ? `· ${fn.category}` : ''}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isInCurrent}
                          onClick={() => addFunctionToWorkbench(fn)}
                          className={`px-3 py-1 rounded text-[11px] font-medium shrink-0 transition ${
                            isInCurrent
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-50 text-[#1890ff] hover:bg-blue-100'
                          }`}
                        >
                          {isInCurrent ? '已添加' : '+ 添加'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 「预览效果」页内展开区 (R-011-B: 默认收起，不再给预览重复堆点击次数) */}
            {showPreview && (
              <div className="mt-4 p-4 bg-gray-50/80 rounded-xl border border-gray-200/80 mb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-[14px] font-bold text-gray-800">角色配置预览</h3>
                    <div className="inline-flex rounded-lg bg-white p-0.5 border border-gray-200 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPreviewUserType('regular')}
                        className={`px-2.5 py-1 rounded-md font-medium transition ${
                          previewUserType === 'regular'
                            ? 'bg-[#1890ff] text-white shadow-xs'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        常规用户
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewUserType('new')}
                        className={`px-2.5 py-1 rounded-md font-medium transition ${
                          previewUserType === 'new'
                            ? 'bg-[#1890ff] text-white shadow-xs'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        新用户
                      </button>
                    </div>
                    <span className="text-[11px] text-gray-500">
                      共 {previewList.length} 项
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className="h-7 px-2.5 text-gray-400 hover:text-gray-600 text-[12px]"
                  >
                    收起
                  </button>
                </div>

                {/* 自动排序回落人工顺序简短原因说明 */}
                {autoSortFallbackReason && (
                  <div className="mt-2.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[12px] text-amber-700 leading-snug">
                    {autoSortFallbackReason}
                  </div>
                )}

                {/* 纯后台完整配置列表预览 */}
                <div className="mt-3 max-h-[280px] overflow-y-auto divide-y divide-gray-200/70 bg-white rounded-lg border border-gray-200 px-3">
                  {previewList.length === 0 ? (
                    <div className="py-8 text-center text-[12px] text-gray-400">
                      暂无配置项
                    </div>
                  ) : (
                    previewList.map((item) => (
                      <div
                        key={item.id}
                        className="py-2 px-1 flex items-center justify-between text-[12px] hover:bg-gray-50/70"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                          <span className="font-semibold text-gray-400 text-[11px] w-6 shrink-0">
                            #{item.sortNum}
                          </span>
                          <div
                            className="min-w-0 flex-1 flex items-center gap-2"
                            dir="auto"
                            title={`${item.name} · ID: ${item.id}`}
                          >
                            <span className="font-medium text-gray-800 truncate">{item.name}</span>
                            {!item.visible && (
                              <span className="text-[10px] px-1 rounded bg-gray-100 text-gray-400 shrink-0">隐藏</span>
                            )}
                          </div>
                        </div>
                        {item.isPinned && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 shrink-0">
                            置顶
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 入口配置表格 (顺序、入口名称、[PC纳入显示]、置顶、操作) */}
            <div className="overflow-x-auto py-2">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                    <th className="py-2.5 px-3 text-left w-16">顺序</th>
                    <th className="py-2.5 px-3 text-left">{isPCModules ? '模块名称' : '入口名称'}</th>
                    {isPCModules && (
                      <th className="py-2.5 px-3 text-center w-24">纳入显示</th>
                    )}
                    <th className="py-2.5 px-3 text-center w-24">置顶</th>
                    <th className="py-2.5 px-3 text-center w-36">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeItems.length === 0 ? (
                    <tr>
                      <td colSpan={isPCModules ? 5 : 4} className="py-16 text-center text-gray-400">
                        当前角色暂无配置项，请点击上方「+ 添加入口」
                      </td>
                    </tr>
                  ) : (
                    activeItems.map((item, index) => {
                      const detail = getFunctionDetail(item.id);
                      const isVisible = item.visible !== undefined ? Boolean(item.visible) : (item.defaultVisible !== 'no');
                      const displayName = item.name || detail.name;
                      const displayEnName = item.enName || detail.enName || detail.description;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/70 transition">
                          <td className="py-2.5 px-3 font-semibold text-gray-500">#{index + 1}</td>
                          <td
                            className="py-2.5 px-3"
                            title={`${displayName} · ID: ${item.id}${displayEnName ? ` (${displayEnName})` : ''}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 truncate" dir="auto">{displayName}</span>
                              {item.isPinned && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-600 shrink-0">
                                  置顶
                                </span>
                              )}
                              {!isVisible && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-gray-100 text-gray-500 shrink-0">
                                  隐藏
                                </span>
                              )}
                            </div>
                          </td>

                          {/* PC 模块专属：纳入显示开关 */}
                          {isPCModules && (
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                role="switch"
                                aria-checked={Boolean(isVisible)}
                                aria-label={`设置模块“${displayName}”显示状态，当前${isVisible ? '已显示' : '已隐藏'}`}
                                onClick={() => toggleVisible(item.id)}
                                className="inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1890ff]/20 transition"
                              >
                                <span
                                  className={`relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                    isVisible ? 'bg-[#1890ff]' : 'bg-gray-300'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      isVisible ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                                  />
                                </span>
                              </button>
                            </td>
                          )}

                          {/* 运营置顶开关 */}
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={Boolean(item.isPinned)}
                              aria-label={`设置“${displayName}”置顶，当前${item.isPinned ? '已置顶' : '未置顶'}`}
                              onClick={() => togglePin(item.id)}
                              className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1890ff]/20 transition"
                            >
                              <span
                                className={`relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                  item.isPinned ? 'bg-[#e60012]' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    item.isPinned ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </span>
                            </button>
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => moveUp(index)}
                                className="text-gray-500 hover:text-[#1890ff] disabled:opacity-20 px-1"
                                title="上移"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                disabled={index === activeItems.length - 1}
                                onClick={() => moveDown(index)}
                                className="text-gray-500 hover:text-[#1890ff] disabled:opacity-20 px-1"
                                title="下移"
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingItem({
                                    ...detail,
                                    ...item,
                                    name: displayName,
                                    enName: item.enName || detail.enName || '',
                                    visible: isVisible,
                                    defaultVisible: isVisible ? 'yes' : 'no',
                                  })
                                }
                                className="text-[#1890ff] hover:underline px-1"
                              >
                                编辑
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-red-500 hover:underline px-1"
                              >
                                {isPCModules ? '移出' : '移除'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. 点击统计 (R-011-B: 位于最下方，只读参考) */}
          <RoleWorkbenchStats
            platformLabel={platformLabel}
            sectionLabel={sectionLabel}
            currentRoleKey={currentRoleKey}
            statsState={effectiveViewStats}
            statPeriod={statViewPeriod}
            onStatPeriodChange={setStatViewPeriod}
            onRefreshStats={handleRefreshStats}
            statsLoading={statsLoading}
            catalog={currentCatalog}
            activeItems={activeItems}
          />

          {/* 5. 共用吸底保存栏 (R-010-C, R-011-B, R-011-E: 范围与未保存提示仅保留底部一处) */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border border-gray-200/90 py-3 px-5 rounded-xl shadow-md mt-5 flex flex-wrap items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetToSystemDefault}
                className="text-[12px] text-gray-500 hover:text-gray-700 underline"
              >
                恢复初始配置
              </button>
              {hasDraftChanges && (
                <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded font-medium">
                  当前有未保存草稿
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[12px] text-gray-500 hidden sm:inline">
                保存目标：{platformLabel} · {sectionLabel} · {currentRoleKey}
              </span>
              <button
                type="button"
                disabled={!hasDraftChanges}
                onClick={cancelChanges}
                className="h-8 px-4 border border-gray-300 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                取消修改
              </button>
              <button
                type="button"
                disabled={!hasDraftChanges}
                onClick={saveCurrentConfig}
                className="h-8 px-5 bg-[#1890ff] text-white rounded-lg text-[13px] font-medium hover:bg-[#40a9ff] shadow-sm disabled:opacity-40 transition"
              >
                保存配置
              </button>
            </div>
          </div>
        </>
      )}

      {/* 多语言新增/编辑配置弹窗 */}
      {editingItem && (
        <RoleWorkbenchDialog
          record={editingItem}
          platform={platform}
          section={section}
          role={currentRoleKey}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveDialog}
        />
      )}
    </div>
  );
}

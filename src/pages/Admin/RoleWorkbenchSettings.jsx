import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useBlocker } from 'react-router-dom';
import {
  ADMIN_ROLES,
  DEFAULT_USER_CONFIG_TARGET,
  WORKBENCH_CONFIG_TARGETS,
  PLATFORMS,
  PC_SECTIONS,
  APP_SECTIONS,
  getDefaultTemplate,
  getCatalogForPlatform,
  readPlatformConfigsFromStorage,
  savePlatformConfigsToStorage,
  sanitizeRules,
  readRoleEntryStatsFromStorage,
  getRoleStorageKey,
  getRoleLabel,
  setRoleItemRemoved,
  moveActiveRoleItem,
  getEffectiveRoleItems,
  ROLE_WORKBENCH_PLATFORM_KEY,
} from '../../admin/roleWorkbench';
import RoleWorkbenchDialog from './RoleWorkbenchDialog';
import { RoleWorkbenchStats } from './RoleWorkbenchRulesAndStats';
import {
  ROLE_WORKBENCH_ENTRIES_KEY,
  readSharedEntriesFromStorage,
  saveSharedEntryToStorage,
  buildUnifiedDirectory,
  resolveItemWithShared,
} from '../../admin/roleWorkbenchEntries';
import {
  ROLE_WORKBENCH_DEFAULTS_KEY,
  readRoleWorkbenchDefaultsFromStorage,
} from '../../admin/roleWorkbenchDefaults';
import RoleWorkbenchArea from './RoleWorkbenchArea';
import RoleWorkbenchEntryLibrary from './RoleWorkbenchEntryLibrary';
import { readLibrarySnapshot, selectLibraryEntries, selectionReason } from '../../admin/roleWorkbenchLibrary';

const ADMIN_PAGE_LABELS = {
  '/topic': '话题管理', '/content': '内容管理', '/audit': '内容审核',
  '/comments': '评论管理', '/quick-links': 'PC 快速链接', '/role-workbench': '角色工作台',
};

const CONFIG_TARGET_OPTIONS = [
  DEFAULT_USER_CONFIG_TARGET,
  ...['owner', 'admin', 'operator', 'engineer', 'enterprise', 'fleet_leader', 'dealer', 'employee']
    .map((id) => ADMIN_ROLES.find((role) => role.id === id)),
];

// 撤销仅替换本条目，不还原整个数组快照，保留之后发生的其他修改。
function restoreRemovalInDraft(items, undo, entry, platform, role) {
  const reason = selectionReason(entry, role);
  if (reason) throw new Error(`${reason}，暂不可撤销移除`);
  const current = items.find((item) => item.id === undo.item.id);
  if (!current?.isRemoved) throw new Error('该条目已恢复或状态已改变，无需再次撤销');
  if (platform === 'app' && undo.item.isPinned && items.filter((item) => !item.isRemoved && item.isPinned).length >= 5) {
    throw new Error('APP最多置顶5个，请先取消其他置顶后重试；也可在已移除区按关闭且未置顶恢复。');
  }
  const next = items.filter((item) => item.id !== undo.item.id);
  next.splice(Math.min(undo.index, next.length), 0, { ...undo.item });
  return next;
}

export default function RoleWorkbenchSettings() {
  // 顶部集中选择终端与目标角色（R-029）
  const [platform, setPlatform] = useState('app'); // 'app' | 'pc'
  const [selectedSections, setSelectedSections] = useState({ app: 'workbench', pc: 'actions' });
  const [currentRoleKey, setCurrentRoleKey] = useState(ADMIN_ROLES[0]?.storageKey || '机主');
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // 持久化配置数据树
  const [allConfigs, setAllConfigs] = useState(() => readPlatformConfigsFromStorage().tree);
  const [storageLoadError, setStorageLoadError] = useState(() => readPlatformConfigsFromStorage().hasReadError);

  // 只读旧模板，用于兼容历史角色编辑起点（R-023）
  const [defaultsTreeState, setDefaultsTreeState] = useState(() => readRoleWorkbenchDefaultsFromStorage());

  // 共享入口数据树
  const [sharedTreeState, setSharedTreeState] = useState(() => readSharedEntriesFromStorage());

  // R-036：先保存或明确放弃当前修改，再进入下一配置。
  // roleDrafts: `${p}__${s}__${r}` -> { items, rules, hasDraftChanges, hasItemsOrRulesChanges }
  const [roleDrafts, setRoleDrafts] = useState({});
  const [removalUndo, setRemovalUndo] = useState(null);
  const removalUndoRef = useRef(null);
  const roleSavingRef = useRef(false);
  const [roleSaving, setRoleSaving] = useState(false);

  // 底部点击统计展开状态（默认收起：R-017-9, AC-045）
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [statViewPeriod, setStatViewPeriod] = useState('30d');
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const [cachedSuccessfulStats, setCachedSuccessfulStats] = useState({});

  // 弹窗与 Toast
  const [message, setMessage] = useState(null);
  const [roleSaveFeedback, setRoleSaveFeedback] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [entrySaveIssue, setEntrySaveIssue] = useState(null);
  const [libraryMode, setLibraryMode] = useState(null);
  const [librarySection, setLibrarySection] = useState(null);
  const [libraryVersion, setLibraryVersion] = useState(0);
  const [libraryNotice, setLibraryNotice] = useState(null);
  const [pendingSelection, setPendingSelection] = useState(null);
  const transitionDialogRef = useRef(null);
  const continueEditingRef = useRef(null);
  const transitionReturnFocusRef = useRef(null);
  const transitionConsumedRef = useRef(false);
  const transitionSavingRef = useRef(false);
  const cancelTransitionRef = useRef(null);
  const saveFeedbackRef = useRef(null);
  const dialogSaveFeedbackRef = useRef(null);

  // 置顶上限弹窗状态 (R-019: 当前视口明确弹窗, role="alertdialog")
  const [pinLimitAlert, setPinLimitAlert] = useState(null); // { title: string, message: string } | null
  const pinLimitDialogRef = useRef(null);
  const pinLimitConfirmBtnRef = useRef(null);
  const lastActiveElementRef = useRef(null);

  const openPinLimitAlert = useCallback((message, title = '置顶数量已达上限') => {
    lastActiveElementRef.current = document.activeElement;
    setPinLimitAlert({ title, message });
  }, []);

  const closePinLimitAlert = useCallback(() => {
    setPinLimitAlert(null);
    if (lastActiveElementRef.current && typeof lastActiveElementRef.current.focus === 'function') {
      try {
        lastActiveElementRef.current.focus();
      } catch {
        // ignore if detached
      }
    }
  }, []);

  useEffect(() => {
    if (!pinLimitAlert) return;

    const timer = setTimeout(() => {
      pinLimitConfirmBtnRef.current?.focus();
    }, 20);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePinLimitAlert();
        return;
      }

      if (e.key === 'Tab') {
        const dialogNode = pinLimitDialogRef.current;
        if (!dialogNode) return;

        const focusableElements = dialogNode.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusable = Array.from(focusableElements).filter(
          (el) => !el.hasAttribute('disabled')
        );

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !dialogNode.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !dialogNode.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pinLimitAlert, closePinLimitAlert]);

  // 模拟异常与权限状态 (R-017-D-5: comboKey -> 'normal' | 'load_error' | 'forbidden' | 'conflict')
  const [demoStates, setDemoStates] = useState({});
  const [conflictContext, setConflictContext] = useState(null);

  // 跨窗口存储监听
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === ROLE_WORKBENCH_ENTRIES_KEY) {
        setSharedTreeState(readSharedEntriesFromStorage());
      }
      if (e.key === ROLE_WORKBENCH_DEFAULTS_KEY) {
        setDefaultsTreeState(readRoleWorkbenchDefaultsFromStorage());
      }
      if (e.key === ROLE_WORKBENCH_PLATFORM_KEY) {
        const latest = readPlatformConfigsFromStorage();
        setAllConfigs(latest.tree);
        setStorageLoadError(latest.hasReadError);
        setRoleDrafts((prev) => Object.fromEntries(Object.entries(prev).filter(([, draft]) => draft.hasDraftChanges)));
      }
      if ([ROLE_WORKBENCH_ENTRIES_KEY, ROLE_WORKBENCH_DEFAULTS_KEY, ROLE_WORKBENCH_PLATFORM_KEY].includes(e.key)) {
        setLibraryVersion((value) => value + 1);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toastTimerRef = useRef(null);

  const showToast = useCallback((text, type = 'success', isConflict = false) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setMessage({ text, type, isConflict, comboKey: `${platform}__${selectedSections[platform]}__${currentRoleKey}` });
    if (!isConflict) {
      toastTimerRef.current = setTimeout(() => {
        setMessage(null);
        toastTimerRef.current = null;
      }, 4000);
    }
  }, [platform, selectedSections, currentRoleKey]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const getComboKey = (p, s, r) => `${p}__${s}__${r}`;

  const platformLabel = platform === 'pc' ? 'PC 工作台' : 'APP 工作台';
  const currentRoleLabel = getRoleLabel(currentRoleKey);
  const currentSections = platform === 'app' ? APP_SECTIONS : PC_SECTIONS;
  const selectedSection = selectedSections[platform];
  const statsSection = selectedSection;
  const currentComboKey = getComboKey(platform, selectedSection, currentRoleKey);
  const rolePanelRef = useRef(null);
  const [highlightedEntryId, setHighlightedEntryId] = useState(null);
  const currentHasDraftChanges = Boolean(roleDrafts[currentComboKey]?.hasDraftChanges);
  const currentDemoState = demoStates[currentComboKey] || 'normal';
  const currentHasSaveConflict = conflictContext?.type === 'role'
    && getComboKey(conflictContext.platform, conflictContext.section, conflictContext.role) === currentComboKey;
  const currentSaveError = roleSaveFeedback?.comboKey === currentComboKey
    && roleSaveFeedback.type === 'error' ? roleSaveFeedback : null;
  const blocker = useBlocker(useCallback(({ currentLocation, nextLocation }) => {
    const shouldBlock = currentHasDraftChanges
      && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search
        || currentLocation.hash !== nextLocation.hash);
    if (shouldBlock && !transitionReturnFocusRef.current) transitionReturnFocusRef.current = document.activeElement;
    return shouldBlock;
  }, [currentHasDraftChanges]));
  const pendingTransition = useMemo(() => blocker.state === 'blocked'
    ? { kind: 'route', label: `${ADMIN_PAGE_LABELS[blocker.location.pathname] || blocker.location.pathname}${blocker.location.search}${blocker.location.hash}` }
    : pendingSelection, [blocker, pendingSelection]);
  const transitionOpen = Boolean(pendingTransition);

  useEffect(() => {
    if (!Object.values(roleDrafts).some((draft) => draft.hasDraftChanges)) return;
    const protectDrafts = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', protectDrafts);
    return () => window.removeEventListener('beforeunload', protectDrafts);
  }, [roleDrafts]);

  const getSectionLabel = (p, s) => {
    if (p === 'pc') {
      return s === 'actions' ? '快速链接' : '页面模块';
    }
    return s === 'modules' ? '首页模块' : '工作台入口';
  };

  const clearRemovalUndo = () => { removalUndoRef.current = null; setRemovalUndo(null); };

  const applySelection = ({ platform: nextPlatform, section, role }) => {
    clearRemovalUndo();
    setPlatform(nextPlatform);
    setCurrentRoleKey(role);
    setSelectedSections((prev) => ({ ...prev, [nextPlatform]: section }));
    setHighlightedEntryId(null);
    setRoleSaveFeedback(null);
    setConflictContext(null);
    setMessage(null);
  };

  const requestSelectionChange = (selection) => {
    if (transitionOpen || transitionSavingRef.current
      || getComboKey(selection.platform, selection.section, selection.role) === currentComboKey) return;
    if (!currentHasDraftChanges) {
      applySelection(selection);
      return;
    }
    transitionConsumedRef.current = false;
    transitionReturnFocusRef.current = document.activeElement;
    setPendingSelection({ kind: 'selection', selection,
      label: `${selection.platform === 'app' ? 'APP 工作台' : 'PC 工作台'} · ${getRoleLabel(selection.role)} · ${getSectionLabel(selection.platform, selection.section)}` });
  };

  const cancelTransition = () => {
    if (transitionSavingRef.current) return;
    setPendingSelection(null);
    if (blocker.state === 'blocked') blocker.reset();
  };
  cancelTransitionRef.current = cancelTransition;

  // 弹窗只保留一个明确目标，Tab/Escape/框外点击均不会绕过决策。
  useEffect(() => {
    if (!transitionOpen) return;
    transitionConsumedRef.current = false;
    const previousFocus = transitionReturnFocusRef.current || document.activeElement;
    continueEditingRef.current?.focus();
    const containFocus = (event) => {
      if (!transitionDialogRef.current?.contains(event.target)) continueEditingRef.current?.focus();
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        cancelTransitionRef.current?.();
      } else if (event.key === 'Tab') {
        const elements = [...(transitionDialogRef.current?.querySelectorAll('button:not([disabled]), [tabindex="0"]') || [])];
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!elements.includes(document.activeElement) || (event.shiftKey && document.activeElement === first)
          || (!event.shiftKey && document.activeElement === last)) {
          event.preventDefault();
          (event.shiftKey ? last : first)?.focus();
        }
      }
    };
    document.addEventListener('focusin', containFocus);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('focusin', containFocus);
      window.removeEventListener('keydown', handleKeyDown, true);
      transitionReturnFocusRef.current = null;
      const nextFocus = previousFocus?.isConnected ? previousFocus : document.getElementById('role-select');
      nextFocus?.focus({ preventScroll: true });
    };
  }, [transitionOpen]);

  useEffect(() => {
    if (currentSaveError) {
      (transitionOpen ? dialogSaveFeedbackRef : saveFeedbackRef).current?.scrollIntoView({ block: 'nearest' });
    }
  }, [currentSaveError, transitionOpen]);

  const finishTransition = () => {
    if (!pendingTransition || transitionConsumedRef.current) return;
    transitionConsumedRef.current = true;
    setPendingSelection(null);
    if (pendingTransition.kind === 'route') blocker.proceed();
    else if (pendingTransition.kind === 'library') {
      if (pendingTransition.targetSection) setLibrarySection(pendingTransition.targetSection);
      setLibraryMode('manage');
    }
    else applySelection(pendingTransition.selection);
  };

  const requestLibrary = (mode, targetSection = null) => {
    if (transitionOpen || transitionSavingRef.current) return;
    const sec = targetSection || (platform === 'pc' ? 'actions' : 'workbench');
    if (mode === 'manage' && currentHasDraftChanges) {
      transitionConsumedRef.current = false;
      transitionReturnFocusRef.current = document.activeElement;
      setPendingSelection({ kind: 'library', targetSection: sec });
      return;
    }
    if (targetSection) setLibrarySection(targetSection);
    else if (!librarySection) setLibrarySection(selectedSection);
    if (!libraryMode) { setHighlightedEntryId(null); setLibraryNotice(null); }
    setLibraryMode(mode);
  };

  const refreshLibraryData = () => {
    const configs = readPlatformConfigsFromStorage();
    setAllConfigs(configs.tree);
    setStorageLoadError(configs.hasReadError);
    setSharedTreeState(readSharedEntriesFromStorage());
    setDefaultsTreeState(readRoleWorkbenchDefaultsFromStorage());
    setRoleDrafts((prev) => Object.fromEntries(Object.entries(prev).filter(([, draft]) => draft.hasDraftChanges)));
    setLibraryVersion((value) => value + 1);
  };

  // 重试读取存储
  const handleRetryRead = () => {
    const res = readPlatformConfigsFromStorage();
    setAllConfigs(res.tree);
    setStorageLoadError(res.hasReadError);

    const defRes = readRoleWorkbenchDefaultsFromStorage();
    setDefaultsTreeState(defRes);

    const shareRes = readSharedEntriesFromStorage();
    setSharedTreeState(shareRes);

    setDemoStates((prev) => ({ ...prev, [currentComboKey]: 'normal' }));

    if (!res.hasReadError && !defRes.hasReadError && !shareRes.hasReadError) {
      if (currentHasSaveConflict) {
        const text = '配置版本冲突，请核对最新版本或放弃草稿';
        setRoleSaveFeedback({ comboKey: currentComboKey, text, type: 'error', isConflict: true });
        showToast(text, 'error', true);
      } else {
        setRoleSaveFeedback(null);
        showToast('重试读取成功，已恢复最新配置（未保存草稿已保留）');
      }
    } else {
      const text = '重试读取失败，部分数据仍然异常，请检查存储环境';
      setRoleSaveFeedback({ comboKey: currentComboKey, text, type: 'error' });
      showToast(text, 'error');
    }
  };

  // 放弃本区域草稿并载入最新配置 (R-017-D-2, R-017-E)
  const handleDiscardDraftAndReload = () => {
    clearRemovalUndo();
    const res = readPlatformConfigsFromStorage();
    setAllConfigs(res.tree);
    setStorageLoadError(res.hasReadError);

    const defRes = readRoleWorkbenchDefaultsFromStorage();
    setDefaultsTreeState(defRes);

    const shareRes = readSharedEntriesFromStorage();
    setSharedTreeState(shareRes);

    setDemoStates((prev) => ({ ...prev, [currentComboKey]: 'normal' }));

    if (conflictContext) {
      if (conflictContext.type === 'role') {
        const comboKey = getComboKey(conflictContext.platform, conflictContext.section, conflictContext.role);
        setRoleDrafts((prev) => {
          const next = { ...prev };
          delete next[comboKey];
          return next;
        });

      }
    }
    setRoleSaveFeedback(null);
    setConflictContext(null);
    showToast('已放弃本区域草稿并载入最新配置');
  };

  // =========================================================================
  // 角色配置与入口目录计算
  // =========================================================================

  // 获取角色已持久化的原始元信息
  const getRoleSavedConf = useCallback((p, s, r) => {
    return allConfigs?.[p]?.[s]?.[r];
  }, [allConfigs]);

  // 统一目录只承载资料，不发布无角色用户的工作台布局。
  const getUnifiedDirectory = useCallback((p, section) => buildUnifiedDirectory({
    platform: p,
    section,
    sharedEntriesTree: sharedTreeState.tree,
    savedPlatformConfigs: allConfigs,
    staticCatalog: getCatalogForPlatform(p, section),
    roleList: WORKBENCH_CONFIG_TARGETS,
  }), [sharedTreeState.tree, allConfigs]);

  // 角色列表只保留已有分配，公共新资料不再自动补入布局。
  const getRoleEditorItems = useCallback((p, section, role) => {
    const isDefaultUser = role === DEFAULT_USER_CONFIG_TARGET.storageKey;
    const draft = roleDrafts[getComboKey(p, section, role)];
    const saved = getRoleSavedConf(p, section, role);
    const legacy = defaultsTreeState.tree?.[p]?.[section];
    const source = Array.isArray(draft?.items) ? draft.items : getEffectiveRoleItems(saved, legacy, role, p, section);
    const sharedMap = sharedTreeState.tree?.entries?.[p]?.[section] || {};
    const directory = getUnifiedDirectory(p, section);
    const items = source.filter((item) => !sharedMap[item.id]?.isDeleted).map((item) => {
      if (item.isRemoved) return { ...item, visible: false, defaultVisible: 'no', isPinned: false };
      const detail = directory.find((entry) => entry.id === item.id);
      const target = getRoleStorageKey(detail?.roleTarget || item.roleTarget);
      const visible = item.visible !== undefined ? Boolean(item.visible) : item.defaultVisible !== 'no';
      const unavailable = target && target !== 'all' && target !== getRoleStorageKey(role);
      const isInitialLayout = !saved?.isConfigured || saved.useDefaultConfiguration === true;
      const mustHide = (isInitialLayout || isDefaultUser) && (unavailable || detail?.hasRoleDifferences);
      return { ...item, visible: mustHide ? false : visible,
        ...(isDefaultUser && mustHide ? { isPinned: false, defaultVisible: 'no' } : {}) };
    });
    return items;
  }, [roleDrafts, getRoleSavedConf, defaultsTreeState.tree, getUnifiedDirectory, sharedTreeState.tree]);

  // 更新角色项目草稿
  const handleUpdateRoleDraftItems = (p, s, r, newItems) => {
    const comboKey = getComboKey(p, s, r);
    const saved = getRoleSavedConf(p, s, r);
    const currentRules = sanitizeRules(roleDrafts[comboKey]?.rules || saved?.rules);
    const prevBase = roleDrafts[comboKey]?.baseRevision;
    const baseRev = prevBase !== undefined ? prevBase : (saved?.revision || '--');

    setRoleDrafts((prev) => ({
      ...prev,
      [comboKey]: {
        items: newItems,
        rules: currentRules,
        baseRevision: baseRev,
        hasDraftChanges: true,
        hasItemsOrRulesChanges: true,
      },
    }));
  };

  // 切换角色项目置顶 (R-018: APP 最多置顶 5 个，隐藏项计入，已有 5 个开第 6 个拦截并提示；R-019 改视口明确弹窗)
  const handleToggleRolePin = (p, s, r, id) => {
    const currentItems = getRoleEditorItems(p, s, r);

    const itemToToggle = currentItems.find((i) => i.id === id);
    if (!itemToToggle || itemToToggle.isRemoved) return;
    if (getUnifiedDirectory(p, s).find((entry) => entry.id === id)?.globalEnabled === false) return;
    const isVisible = itemToToggle.visible !== undefined ? itemToToggle.visible : itemToToggle.defaultVisible !== 'no';
    if (!itemToToggle.isPinned && !isVisible) return;

    if (p === 'app' && !itemToToggle.isPinned) {
      const currentPinnedCount = currentItems.filter((i) => !i.isRemoved && Boolean(i.isPinned)).length;
      if (currentPinnedCount >= 5) {
        openPinLimitAlert('APP最多置顶5个，请先取消其他项的置顶');
        return;
      }
    }

    const next = currentItems.map((item) => {
      if (item.id === id) return { ...item, isPinned: !item.isPinned };
      return item;
    });
    handleUpdateRoleDraftItems(p, s, r, next);
  };

  const handleSetRoleItemRemoved = (p, s, r, id, isRemoved) => {
    const items = getRoleEditorItems(p, s, r);
    if (!isRemoved) {
      try {
        const snapshot = readLibrarySnapshot(p, s);
        const next = selectLibraryEntries(snapshot, [id], r, items);
        handleUpdateRoleDraftItems(p, s, r, next);
        if (removalUndoRef.current?.item.id === id) clearRemovalUndo();
      } catch (error) { showToast(error.message, 'error'); }
      return;
    }
    const item = items.find((entry) => entry.id === id);
    if (!item || item.isRemoved) return;
    const next = setRoleItemRemoved(items, id, true);
    if (next !== items) {
      const undo = { comboKey: getComboKey(p, s, r), item: { ...item }, index: items.findIndex((entry) => entry.id === id),
        name: getUnifiedDirectory(p, s).find((entry) => entry.id === id)?.name || item.name || id };
      removalUndoRef.current = undo;
      setRemovalUndo(undo);
      setMessage(null);
      handleUpdateRoleDraftItems(p, s, r, next);
    }
  };

  const undoCurrentRemoval = () => {
    const undo = removalUndoRef.current;
    if (!undo || undo.comboKey !== currentComboKey) return;
    try {
      const latest = readLibrarySnapshot(platform, selectedSection);
      const entry = latest.entries.find((entry) => entry.id === undo.item.id);
      const items = getRoleEditorItems(platform, selectedSection, currentRoleKey);
      const next = restoreRemovalInDraft(items, undo, entry, platform, currentRoleKey);
      clearRemovalUndo();
      handleUpdateRoleDraftItems(platform, selectedSection, currentRoleKey, next);
      setRoleSaveFeedback(null);
      setHighlightedEntryId(undo.item.id);
      showToast('已撤销移除，其他修改保持。', 'info');
    } catch (error) {
      const nextUndo = { ...undo, error: error.message };
      removalUndoRef.current = nextUndo; setRemovalUndo(nextUndo);
    }
  };

  // 更新角色规则草稿
  const handleUpdateRoleDraftRules = (p, s, r, newRules) => {
    const comboKey = getComboKey(p, s, r);
    const currentSaved = getRoleSavedConf(p, s, r);
    const currentItems = getRoleEditorItems(p, s, r);
    const prevBase = roleDrafts[comboKey]?.baseRevision;
    const baseRev = prevBase !== undefined ? prevBase : (currentSaved?.revision || '--');

    setRoleDrafts((prev) => ({
      ...prev,
      [comboKey]: {
        items: currentItems,
        rules: {
          ...(prev[comboKey]?.rules || sanitizeRules(currentSaved?.rules)),
          ...newRules,
        },
        baseRevision: baseRev,
        hasDraftChanges: true,
        hasItemsOrRulesChanges: true,
      },
    }));
  };

  // 保存当前区域的角色配置 (R-017-3, R-017-D-1, R-017-D-2, R-017-D-3, R-017-D-5)
  const saveRoleConfig = (p, s, r, { showLimitDialog = true } = {}) => {
    // 返回真实结果；离开保护只能在持久化成功后继续。
    const showSaveResult = (text, type = 'success', isConflict = false) => {
      setRoleSaveFeedback({ comboKey: getComboKey(p, s, r), text, type, isConflict });
      showToast(text, type, isConflict);
      return { ok: type === 'success', text, isConflict };
    };
    if (storageLoadError || defaultsTreeState.hasReadError || sharedTreeState.hasReadError || currentDemoState === 'load_error') {
      return showSaveResult('本地存储处于读取异常状态，为保护原数据已锁定保存，请先点击重试读取', 'error');
    }
    if (currentDemoState === 'forbidden') {
      return showSaveResult('您暂无当前角色的配置保存权限', 'error');
    }
    if (currentDemoState === 'conflict') {
      setConflictContext({ type: 'role', platform: p, section: s, role: r });
      return showSaveResult(
        `【${platformLabel} · ${getSectionLabel(p, s)} · ${getRoleLabel(r)}】配置已在其他窗口更新（版本冲突），请核对最新版本，当前草稿已保留。`,
        'error',
        true
      );
    }

    const comboKey = getComboKey(p, s, r);
    const currentDraft = roleDrafts[comboKey];
    const savedRoleConf = getRoleSavedConf(p, s, r);
    const itemsToSave = getRoleEditorItems(p, s, r);
    try {
      const latest = readLibrarySnapshot(p, s);
      const assigned = latest.effective[r]?.items || [];
      for (const item of itemsToSave.filter((entry) => !entry.isRemoved)) {
        if (assigned.some((old) => old.id === item.id && !old.isRemoved)) continue;
        const entry = latest.entries.find((entry) => entry.id === item.id);
        const reason = selectionReason(entry, r);
        if (reason) throw new Error(`${entry?.name || item.id}：${reason}；当前草稿已保留`);
      }
    } catch (error) { return showSaveResult(error.message, 'error'); }
    const rulesToSave = currentDraft?.rules || sanitizeRules(savedRoleConf?.rules);
    if (p === 'app' && itemsToSave.filter((item) => !item.isRemoved && Boolean(item.isPinned)).length > 5) {
      const text = 'APP最多置顶5个，请取消多余置顶后保存';
      if (showLimitDialog) openPinLimitAlert(text);
      return showSaveResult(text, 'error');
    }

    // 角色保存只写布局，旧自定义完整资料仍留在 item 中，不顺带改公共库。

    const isFirstConfig = !savedRoleConf?.isConfigured || savedRoleConf?.version === '--';
    const nextVersion = isFirstConfig
      ? 'v1.0.0'
      : `v1.${parseInt(savedRoleConf?.version?.split('.')[1] || '0', 10) + 1}.0`;
    const nextRevision = `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    const nextRoleConf = {
      ...(savedRoleConf || {}),
      platform: p,
      section: s,
      roleName: r,
      useDefaultConfiguration: false,
      version: nextVersion,
      revision: nextRevision,
      updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      updatedBy: '当前管理员',
      items: itemsToSave.map((item) => {
        const isVis = item.visible !== undefined ? Boolean(item.visible) : (item.defaultVisible !== 'no');
        return {
          ...item,
          id: item.id,
          isPinned: Boolean(item.isPinned),
          visible: isVis,
          defaultVisible: isVis ? 'yes' : 'no',
          custom: Boolean(item.custom),
          ...(item.isRemoved ? { visible: false, defaultVisible: 'no', isPinned: false } : {}),
        };
      }),
      rules: { userSort: rulesToSave.userSort === 'auto_clicks' ? 'auto_clicks' : 'manual', autoPeriod: ['7d', '30d', 'all'].includes(rulesToSave.autoPeriod) ? rulesToSave.autoPeriod : '30d', refreshSchedule: 'monthly' },
      isConfigured: true,
      hasExclusiveConfiguration: true,
    };

    const baseRevision = currentDraft?.baseRevision !== undefined
      ? currentDraft.baseRevision
      : savedRoleConf?.revision;

    try {
      const updatedTree = savePlatformConfigsToStorage(
        nextRoleConf,
        p,
        s,
        r,
        baseRevision
      );

      setAllConfigs(updatedTree);
      setRoleDrafts((prev) => ({
        ...prev,
        [comboKey]: {
          items: nextRoleConf.items,
          rules: nextRoleConf.rules,
          baseRevision: undefined,
          hasDraftChanges: false,
          hasItemsOrRulesChanges: false,
        },
      }));
      setConflictContext(null);

      clearRemovalUndo();
      return showSaveResult(`【${platformLabel} · ${getSectionLabel(p, s)} · ${getRoleLabel(r)}】配置已保存`);
    } catch (err) {
      if (err?.isConflict) {
        setConflictContext({ type: 'role', platform: p, section: s, role: r });
      }
      return showSaveResult(err?.message || '保存配置失败', 'error', Boolean(err?.isConflict));
    }
  };

  const handleSaveRoleConfig = (...args) => {
    if (roleSavingRef.current) return { ok: false, text: '正在保存，请稍候' };
    roleSavingRef.current = true; setRoleSaving(true);
    try { return saveRoleConfig(...args); }
    finally { roleSavingRef.current = false; setRoleSaving(false); }
  };

  // 取消角色区域修改 (R-017-E: 删除对应草稿 entry 从最新已存读取)
  const handleCancelRoleChanges = (p, s, r) => {
    clearRemovalUndo();
    const comboKey = getComboKey(p, s, r);
    setRoleSaveFeedback((prev) => prev?.comboKey === comboKey ? null : prev);
    setRoleDrafts((prev) => {
      const next = { ...prev };
      delete next[comboKey];
      return next;
    });
    if (currentHasSaveConflict) setConflictContext(null);
    showToast(`已取消【${platformLabel} · ${getSectionLabel(p, s)} · ${getRoleLabel(r)}】修改`, 'info');
  };

  const discardAndContinue = () => {
    if (!pendingTransition || transitionSavingRef.current || transitionConsumedRef.current) return;
    handleCancelRoleChanges(platform, selectedSection, currentRoleKey);
    finishTransition();
  };

  // =========================================================================
  // 公共资料管理与 Dialog (R-017-5, R-017-7, R-017-D-3)
  // =========================================================================

  const handleOpenEditEntry = (entry, p, s, isDefaultContext = false) => {
    const snapshot = readLibrarySnapshot(p, s);
    const latestRecord = snapshot.entries.find((item) => item.id === entry.id);
    if (!latestRecord) throw new Error('资料已删除，请重新读取入口库');
    setEntrySaveIssue(null);
    setEditingSession({ record: latestRecord, platform: p, section: s,
      baseRevision: snapshot.publicRevision, isDefaultContext: Boolean(isDefaultContext) });
  };

  const handleOpenNewEntry = (p, section) => {
    const snapshot = readLibrarySnapshot(p, section);
    setEntrySaveIssue(null);
    setEditingSession({ record: { roleTarget: 'all', custom: true, sort: snapshot.entries.length + 1 },
      platform: p, section, baseRevision: snapshot.publicRevision, isDefaultContext: true });
  };

  // 资料保存只入公共库，不自动选用、开启或切换角色。
  const handleSaveSharedEntry = (savedData) => {
    if (!editingSession) return;
    const fail = (text) => { setEntrySaveIssue({ text }); throw new Error(text); };
    const { platform: editPlat, section: editSec, baseRevision } = editingSession;
    if (storageLoadError || defaultsTreeState.hasReadError || sharedTreeState.hasReadError || currentDemoState === 'load_error') {
      fail('配置读取异常，请重试读取后再保存');
    }
    if (currentDemoState === 'forbidden') fail('您暂无入口资料的配置权限');
    if (currentDemoState === 'conflict') fail('配置处于版本冲突状态，请重新读取核对');
    const isNewEntry = !editingSession.record?.id;
    const finalEntry = { ...savedData };
    if (!finalEntry.id) {
      finalEntry.id = `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      finalEntry.custom = true;
    }
    if (isNewEntry) {
      finalEntry.createdAt = new Date().toISOString();
      delete finalEntry.createdBy;
    } else {
      for (const field of ['createdBy', 'createdAt']) {
        if (Object.hasOwn(editingSession.record, field)) finalEntry[field] = editingSession.record[field];
        else delete finalEntry[field];
      }
    }
    let saveRes;
    try {
      saveRes = saveSharedEntryToStorage(finalEntry, editPlat, editSec, baseRevision, false);
    } catch (error) {
      setEntrySaveIssue({ text: `资料保存未完成：${error.message}。表单已保留，可重新读取并核对后重试。` });
      throw error;
    }
    setEntrySaveIssue(null);
    setEditingSession(null);
    refreshLibraryData();
    showToast(isNewEntry ? '已加入入口库，尚未分配' : '入口资料已保存');
    setLibraryNotice({ text: isNewEntry ? '已加入入口库，尚未分配。' : '入口资料已保存', isNew: isNewEntry });
    if (isNewEntry) setLibraryMode('manage');
    setHighlightedEntryId(finalEntry.id);
    return saveRes;
  };

  const rereadEditor = (accept = false) => {
    if (!editingSession) return;
    try {
      if (!accept) handleRetryRead();
      const latest = readLibrarySnapshot(editingSession.platform, editingSession.section);
      const record = editingSession.record.id ? latest.entries.find((entry) => entry.id === editingSession.record.id) : null;
      if (editingSession.record.id && !record) throw new Error('资料已删除，不能恢复；当前表单仍保留，可返回后关闭。');
      if (accept && entrySaveIssue?.revision === latest.publicRevision) {
        setEditingSession((prev) => ({ ...prev, baseRevision: latest.publicRevision }));
        setEntrySaveIssue(null);
        refreshLibraryData();
      } else {
        setEntrySaveIssue({ text: '已读取最新资料，请核对后再保留当前表单继续；尚未写入。',
          latest: record || {}, revision: latest.publicRevision });
      }
    } catch (error) { setEntrySaveIssue({ text: error.message }); }
  };

  // =========================================================================
  // 点击统计 (置底、默认收起：R-017-9, AC-045)
  // =========================================================================


  // 统计数据读取
  const viewStatsRaw = useMemo(() => {
    if (statsRefreshKey < 0) return null;
    return readRoleEntryStatsFromStorage(platform, statsSection, currentRoleKey, statViewPeriod);
  }, [platform, statsSection, currentRoleKey, statViewPeriod, statsRefreshKey]);

  const currentStatsViewKey = `${platform}__${statsSection}__${currentRoleKey}__${statViewPeriod}`;
  useEffect(() => {
    if (viewStatsRaw && viewStatsRaw.hasData && !viewStatsRaw.hasError) {
      setCachedSuccessfulStats((prev) => ({
        ...prev,
        [currentStatsViewKey]: viewStatsRaw,
      }));
    }
  }, [currentStatsViewKey, viewStatsRaw]);

  const effectiveViewStats = useMemo(() => {
    if (!viewStatsRaw) return null;
    if (viewStatsRaw.hasError) {
      const cached = cachedSuccessfulStats[currentStatsViewKey];
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
  }, [viewStatsRaw, cachedSuccessfulStats, currentStatsViewKey]);

  const handleRefreshStats = () => {
    setStatsLoading(true);
    window.setTimeout(() => {
      const res = readRoleEntryStatsFromStorage(platform, statsSection, currentRoleKey, statViewPeriod);
      setStatsRefreshKey((k) => k + 1);
      setStatsLoading(false);
      if (res.hasError) {
        showToast(`统计数据刷新失败: ${res.errorMessage}`, 'error');
      } else {
        showToast('统计数据已刷新');
      }
    }, 200);
  };

  // 统计目录与配置项
  const statsCatalog = useMemo(() => {
    return getUnifiedDirectory(platform, statsSection);
  }, [getUnifiedDirectory, platform, statsSection]);

  const statsRoleSavedConf = getRoleSavedConf(platform, statsSection, currentRoleKey);
  const statsRoleItems = statsRoleSavedConf?.items || getDefaultTemplate(platform, statsSection).map((item) => ({ ...item }));

  const renderSaveError = (inTransition = false) => currentSaveError && (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-[14px] leading-6 text-red-800 [overflow-wrap:anywhere]">
      <p className="font-semibold">{currentSaveError.text}</p>
      <p className="mt-1">当前修改已保留，请重试或继续编辑。</p>
      <div className="mt-2 flex flex-wrap gap-3">
        <button type="button" onClick={handleRetryRead}
          className="max-w-full rounded border border-red-300 bg-white px-3 py-1.5 font-semibold hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-700 [overflow-wrap:anywhere]">
          重试读取配置
        </button>
        {currentHasSaveConflict && (
          <button type="button" onClick={() => {
            handleDiscardDraftAndReload();
            if (inTransition) cancelTransition();
          }} className="max-w-full rounded px-1 py-1.5 font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-700 [overflow-wrap:anywhere]">
            放弃本区域草稿并载入最新
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-w-0 bg-[#f5f7fa] p-4 text-gray-800 sm:p-5">
      <div inert={transitionOpen || libraryMode ? true : undefined}>
      {/* 层级 1：选择终端与统一配置中心 */}
      <div className="mb-4 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
          {/* 终端选择 */}
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <span className="text-[13px] font-semibold text-gray-500">目标终端</span>
            <div className="flex max-w-full flex-wrap items-center rounded-lg bg-gray-100 p-1">
              {PLATFORMS.map((p) => {
                const isActive = platform === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => requestSelectionChange({ platform: p.id,
                      section: selectedSection === 'modules' ? 'modules' : p.id === 'app' ? 'workbench' : 'actions', role: currentRoleKey })}
                    className={`min-h-[36px] max-w-full break-words rounded-md px-3.5 py-1 text-[14px] font-semibold transition ${
                      isActive
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
            <span className="text-[13px] text-gray-400">
              当前配置：<b className="font-medium text-gray-700">{platformLabel}</b>
            </span>
          </div>
        </div>
      </div>

      {/* 存储读取损坏提示 (R-017-D-5) */}
      {(storageLoadError || defaultsTreeState.hasReadError || sharedTreeState.hasReadError || currentDemoState === 'load_error') && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
          <div className="text-[16px] font-semibold mb-2">本地配置存储读取异常（数据损坏或网络受限）</div>
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

      {/* 模拟无权限异常处理 (R-017-D-5) */}
      {currentDemoState === 'forbidden' && (
        <div className="mb-4 bg-gray-50 border border-gray-200 text-gray-700 p-6 rounded-lg text-center">
          <div className="text-[16px] font-semibold mb-2">您暂无【{platformLabel}】的配置权限</div>
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

      {/* 层级 2：按角色定制工作台 */}
      <div ref={rolePanelRef} className="mb-4 min-w-0 rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
        {/* 角色定制控制栏 */}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-gray-100 bg-gray-50/50 px-5 py-3.5">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <span className="text-[14px] font-bold text-gray-900">角色工作台定制</span>
            <span className="text-gray-300">|</span>
            <label htmlFor="role-select" className="text-[13px] font-semibold text-gray-700">
              配置对象
            </label>
            <select
              id="role-select"
              value={getRoleStorageKey(currentRoleKey)}
              onChange={(e) => requestSelectionChange({ platform, section: selectedSection, role: e.target.value })}
              title={currentRoleLabel}
              className="min-h-[36px] min-w-[160px] max-w-full py-1.5 px-3 border border-gray-300 rounded-md text-[14px] font-medium text-gray-800 bg-white focus:outline-none focus:border-[#1890ff] shadow-sm"
            >
              {CONFIG_TARGET_OPTIONS.map((role) => (
                <option key={role.id} value={role.storageKey}>
                  {role.name}
                </option>
              ))}
              {currentRoleKey &&
                !WORKBENCH_CONFIG_TARGETS.some(
                  (r) =>
                    r.storageKey === currentRoleKey ||
                    r.name === currentRoleKey ||
                    r.id === currentRoleKey
                ) && <option value={currentRoleKey}>{currentRoleKey}</option>}
            </select>
          </div>
          {currentRoleKey === DEFAULT_USER_CONFIG_TARGET.storageKey ? (
            <p className="rounded border border-amber-200 bg-amber-50 px-2.5 py-1 text-[13px] text-amber-800">
              适用于已登录但未选择角色的用户；配置仅控制布局，不授予业务权限
            </p>
          ) : (
            <p className="text-[13px] text-gray-500">
              针对 <b className="font-semibold text-gray-800">{currentRoleLabel}</b> 定制展示入口与排序
            </p>
          )}
        </div>

        {/* 分区导航 Tab */}
        <nav className="flex min-w-0 flex-wrap gap-x-6 border-b border-gray-200 px-5" aria-label="配置区域">
          {currentSections.map((sec) => (
            <button key={sec.id} type="button" data-section-tab={sec.id} aria-pressed={selectedSection === sec.id}
              onClick={() => requestSelectionChange({ platform, section: sec.id, role: currentRoleKey })}
              className={`min-h-[48px] max-w-full break-words border-b-2 px-1 py-3 text-[14px] font-medium transition ${selectedSection === sec.id ? 'border-[#1890ff] text-[#1890ff]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
              {sec.name}
            </button>
          ))}
        </nav>
        <div className="min-w-0">
          {currentSections.filter((sec) => sec.id === selectedSection).map((sec) => {
            const sectionId = sec.id;
            const sectionLabel = sec.name;
            const comboKey = getComboKey(platform, sectionId, currentRoleKey);

            // 共享资料映射与统一目录
            const sharedEntriesMap = sharedTreeState.tree?.entries?.[platform]?.[sectionId] || {};
            const unifiedDir = getUnifiedDirectory(platform, sectionId);

            const savedRoleConf = getRoleSavedConf(platform, sectionId, currentRoleKey);
            const rawRoleItems = getRoleEditorItems(platform, sectionId, currentRoleKey);

            const roleItems = rawRoleItems.map((item) =>
              resolveItemWithShared(item, sharedEntriesMap, unifiedDir)
            );

            const roleRules = roleDrafts[comboKey]?.rules || sanitizeRules(savedRoleConf?.rules);
            const hasRoleDraftChanges = Boolean(roleDrafts[comboKey]?.hasDraftChanges);
            // 初始列表可以直接保存，但不将未编辑状态误标为脏草稿。
            const canSaveRoleConfig = hasRoleDraftChanges
              || !savedRoleConf?.isConfigured || savedRoleConf?.useDefaultConfiguration === true;

            return (
              <RoleWorkbenchArea
                key={`role__${platform}__${sectionId}__${currentRoleKey}`}
                platform={platform}
                section={sectionId}
                sectionLabel={sectionLabel}
                highlightedEntryId={highlightedEntryId}
                showDetails={detailsExpanded} onShowDetailsChange={setDetailsExpanded}
                currentRoleKey={currentRoleKey}

                // Role props
                roleItems={roleItems}
                roleRules={roleRules}
                onUpdateRoleRules={(newRules) => {
                  handleUpdateRoleDraftRules(platform, sectionId, currentRoleKey, newRules);
                }}
                onMoveRoleUp={(idx) => {
                  if (roleRules.userSort === 'auto_clicks') return;
                  const activeRoleItems = rawRoleItems.filter((i) => !i.isRemoved);
                  const currentItem = activeRoleItems[idx];
                  const neighborItem = activeRoleItems[idx - 1];
                  if (Boolean(currentItem?.isPinned) || Boolean(neighborItem?.isPinned)) {
                    openPinLimitAlert('请先取消置顶，再调整顺序。', '暂不能调整顺序');
                    return;
                  }
                  const next = moveActiveRoleItem(rawRoleItems, idx, -1);
                  if (next !== rawRoleItems) handleUpdateRoleDraftItems(platform, sectionId, currentRoleKey, next);
                }}
                onMoveRoleDown={(idx) => {
                  if (roleRules.userSort === 'auto_clicks') return;
                  const activeRoleItems = rawRoleItems.filter((i) => !i.isRemoved);
                  const currentItem = activeRoleItems[idx];
                  const neighborItem = activeRoleItems[idx + 1];
                  if (Boolean(currentItem?.isPinned) || Boolean(neighborItem?.isPinned)) {
                    openPinLimitAlert('请先取消置顶，再调整顺序。', '暂不能调整顺序');
                    return;
                  }
                  const next = moveActiveRoleItem(rawRoleItems, idx, 1);
                  if (next !== rawRoleItems) handleUpdateRoleDraftItems(platform, sectionId, currentRoleKey, next);
                }}
                onToggleRolePin={(id) => {
                  handleToggleRolePin(platform, sectionId, currentRoleKey, id);
                }}
                onToggleRoleVisible={(id) => {
                  const entry = unifiedDir.find((item) => item.id === id);
                  const target = getRoleStorageKey(entry?.roleTarget);
                  const item = rawRoleItems.find((item) => item.id === id);
                  if (!item || item.isRemoved) return;
                  if (entry?.globalEnabled === false) return;
                  if (!item?.visible && ((target && target !== 'all' && target !== getRoleStorageKey(currentRoleKey)) || entry?.hasRoleDifferences)) {
                    showToast('此入口不适用当前角色或资料存在历史差异，无法开启', 'error');
                    return;
                  }
                  const next = rawRoleItems.map((item) => {
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
                  handleUpdateRoleDraftItems(platform, sectionId, currentRoleKey, next);
                }}
                hasRoleDraftChanges={hasRoleDraftChanges}
                canSaveRoleConfig={canSaveRoleConfig}
                onSaveRoleConfig={() => {
                  handleSaveRoleConfig(platform, sectionId, currentRoleKey);
                }}
                onCancelRoleChanges={() => {
                  handleCancelRoleChanges(platform, sectionId, currentRoleKey);
                }}
                onRemoveRoleItem={(id) => handleSetRoleItemRemoved(platform, sectionId, currentRoleKey, id, true)}
                onRestoreRoleItem={(id) => handleSetRoleItemRemoved(platform, sectionId, currentRoleKey, id, false)}
                isOverlayOpen={transitionOpen || Boolean(libraryMode)}
                undoRemoval={removalUndo?.comboKey === currentComboKey ? removalUndo : null}
                onUndoRemoval={undoCurrentRemoval}
                isSaving={roleSaving}
                saveFeedback={<div ref={saveFeedbackRef}>
                  {renderSaveError()}
                  {!currentSaveError && message && message.comboKey === currentComboKey && <p role="status" className="mb-2 text-[14px] text-gray-600 [overflow-wrap:anywhere]">{message.text}</p>}
                </div>}

                // Public entries
                currentCatalog={unifiedDir}
                onSelectEntries={() => requestLibrary('select')}
                onOpenLibrary={() => requestLibrary('manage', sectionId)}

              />
            );
          })}
        </div>
      </div>

      {/* 3. 点击统计置底，默认折叠 (R-017-9 / AC-045: 明确标题范围，只统计目标角色) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 mb-5 overflow-hidden transition-all">
        <div className="p-4 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[15px] font-bold text-gray-900">点击统计</h2>
            <span className="text-[12px] text-gray-500">
              （当前查看范围：{platformLabel} · {getSectionLabel(platform, statsSection)} · {currentRoleLabel}）
            </span>

          </div>
          <button
            type="button"
            onClick={() => setStatsExpanded((prev) => !prev)}
            className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5"
            aria-expanded={statsExpanded}
          >
            <span>{statsExpanded ? '收起统计 ▲' : '展开统计 ▼'}</span>
          </button>
        </div>

        {statsExpanded && (
          <div className="p-4 border-t border-gray-100">
            <RoleWorkbenchStats
              platformLabel={platformLabel}
              sectionLabel={getSectionLabel(platform, statsSection)}
              currentRoleKey={currentRoleKey}
              statsState={effectiveViewStats}
              statPeriod={statViewPeriod}
              onStatPeriodChange={setStatViewPeriod}
              onRefreshStats={handleRefreshStats}
              statsLoading={statsLoading}
              catalog={statsCatalog}
              activeItems={statsRoleItems}
            />
          </div>
        )}
      </div>

      {/* APP 置顶超限弹窗 (R-019: 当前视口明确弹窗, role="alertdialog", aria-modal) */}
      {pinLimitAlert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={closePinLimitAlert}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="pin-limit-dialog-title"
            aria-describedby="pin-limit-dialog-desc"
            ref={pinLimitDialogRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl border border-gray-200/80 max-w-sm w-full p-6 text-center transform transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-3.5 text-xl font-bold">
              !
            </div>
            <h3
              id="pin-limit-dialog-title"
              className="text-[16px] font-bold text-gray-900 mb-2"
            >
              {pinLimitAlert.title || '置顶数量已达上限'}
            </h3>
            <p
              id="pin-limit-dialog-desc"
              className="text-[13px] text-gray-600 mb-6 break-words leading-relaxed"
            >
              {pinLimitAlert.message}
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                ref={pinLimitConfirmBtnRef}
                onClick={closePinLimitAlert}
                className="w-full sm:w-32 py-2 px-4 bg-[#1890ff] text-white rounded-lg text-[13px] font-medium hover:bg-[#40a9ff] focus:outline-none focus:ring-2 focus:ring-[#1890ff] focus:ring-offset-2 transition shadow-sm"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      <RoleWorkbenchEntryLibrary
        open={Boolean(libraryMode)} mode={libraryMode || 'select'} platform={platform}
        section={librarySection || selectedSection}
        onSwitchSection={(sec) => setLibrarySection(sec)}
        sectionLabel={getSectionLabel(platform, librarySection || selectedSection)}
        currentRoleKey={currentRoleKey} currentRoleLabel={currentRoleLabel}
        currentItems={getRoleEditorItems(platform, librarySection || selectedSection, currentRoleKey)}
        highlightedId={highlightedEntryId} version={libraryVersion} suspended={transitionOpen}
        publicSaveNotice={libraryNotice}
        blockedReason={currentDemoState === 'forbidden' ? '您暂无公共资料或角色分配权限'
          : currentDemoState === 'conflict' ? '配置处于版本冲突状态，请重新读取核对'
            : storageLoadError || defaultsTreeState.hasReadError || sharedTreeState.hasReadError || currentDemoState === 'load_error'
              ? '本地配置读取异常，已禁止公共资料和分配写入' : ''}
        onAdd={(snapshot, ids = [], removedIds = []) => {
          let items = getRoleEditorItems(platform, librarySection || selectedSection, currentRoleKey);
          if (Array.isArray(removedIds) && removedIds.length > 0) {
            removedIds.forEach((id) => {
              items = setRoleItemRemoved(items, id, true);
            });
          }
          if (Array.isArray(ids) && ids.length > 0) {
            items = selectLibraryEntries(snapshot, ids, currentRoleKey, items);
            if (removalUndoRef.current && ids.includes(removalUndoRef.current.item.id)) clearRemovalUndo();
            setHighlightedEntryId(ids[ids.length - 1]);
          }
          handleUpdateRoleDraftItems(platform, librarySection || selectedSection, currentRoleKey, items);
          setRoleSaveFeedback(null);
          const feedbackParts = [];
          if (ids.length > 0) feedbackParts.push(`已添加 ${ids.length} 项`);
          if (removedIds.length > 0) feedbackParts.push(`已移除 ${removedIds.length} 项`);
          showToast(feedbackParts.length > 0 ? `${feedbackParts.join('，')}，保存后生效` : '已更新', 'info');
        }}
        onCreate={() => handleOpenNewEntry(platform, librarySection || selectedSection)}
        onEdit={(entry) => handleOpenEditEntry(entry, platform, librarySection || selectedSection, true)}
        onChanged={refreshLibraryData} onRetry={handleRetryRead}
        onClose={() => { setEntrySaveIssue(null); setEditingSession(null); setLibraryMode(null); setLibrarySection(null); }}
        onCloseEditor={() => { setEntrySaveIssue(null); setEditingSession(null); }}
        editorIssue={entrySaveIssue} onDismissEditorIssue={() => setEntrySaveIssue(null)}
        onRereadEditor={() => rereadEditor()} onAcceptEditorBase={() => rereadEditor(true)}
        editor={editingSession && <RoleWorkbenchDialog
          record={editingSession.record} layoutFieldsReadOnly
          platform={editingSession.platform} section={editingSession.section} role=""
          onClose={() => setEditingSession(null)} onSave={handleSaveSharedEntry}
        />}
      />

      {pendingTransition && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4"
          onClick={(event) => { if (event.target === event.currentTarget) cancelTransition(); }}>
          <div ref={transitionDialogRef} role="alertdialog" aria-modal="true"
            aria-labelledby="unsaved-config-title" aria-describedby="unsaved-config-description"
            tabIndex={-1}
            className="flex w-full min-w-0 max-w-sm flex-col rounded-xl bg-white p-6 text-center shadow-2xl border border-gray-200">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-500 text-lg font-bold">
              !
            </div>
            <h2 id="unsaved-config-title" className="text-[16px] font-bold text-gray-900 mb-2">
              提示
            </h2>
            <p id="unsaved-config-description" className="text-[14px] text-gray-600 mb-6">
              当前未保存，确定放弃吗？
            </p>
            <div className="flex items-center justify-center gap-3">
              <button ref={continueEditingRef} type="button" onClick={cancelTransition}
                className="min-h-[38px] flex-1 rounded-md border border-gray-300 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition">
                取消
              </button>
              <button type="button" onClick={discardAndContinue}
                className="min-h-[38px] flex-1 rounded-md bg-[#1890ff] text-[13px] font-medium text-white hover:bg-[#40a9ff] transition">
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

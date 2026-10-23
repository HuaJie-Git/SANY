import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { WORKBENCH_CONFIG_TARGETS, DEFAULT_USER_CONFIG_TARGET, getRoleLabel, getRoleStorageKey } from '../../admin/roleWorkbench';
import { isImageValue } from '../../admin/roleWorkbenchEntries';
import {
  readLibrarySnapshot, selectionReason, assignLibraryEntry, changeLibraryAvailability, retryAssignmentMirror,
  retryCleanupDeletedEntry,
} from '../../admin/roleWorkbenchLibrary';

const TARGETS = [DEFAULT_USER_CONFIG_TARGET, ...['owner', 'admin', 'operator', 'engineer', 'enterprise', 'fleet_leader', 'dealer', 'employee']
  .map((id) => WORKBENCH_CONFIG_TARGETS.find((target) => target.id === id))];

const buttonBase = 'inline-flex min-h-[44px] max-w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-[14px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1890ff] [overflow-wrap:anywhere]';
const buttonClass = `${buttonBase} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`;
const primaryClass = `${buttonBase} border border-transparent bg-[#1890ff] text-white hover:bg-[#40a9ff]`;
const dangerClass = `${buttonBase} border border-transparent bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600`;
const textButtonClass = `${buttonBase} px-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900`;
const rowActionClass = 'inline-flex min-h-[36px] items-center justify-center rounded-md px-2 py-1 text-[13px] text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1890ff]';

// 每次只有最上层约束焦点；复用原资料表单时由其外层承接同一套约束。
function useLayerFocus(ref, active, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement;
    const node = ref.current;
    const focusable = () => [...(node?.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex="0"]') || [])]
      .filter((element) => !element.closest('[inert]') && element.getClientRects().length);
    const first = () => focusable()[0] || node;
    if (!node?.contains(document.activeElement) || document.activeElement?.closest('[inert]')) first()?.focus({ preventScroll: true });
    const contain = (event) => { if (!node?.contains(event.target)) first()?.focus(); };
    const keydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault(); event.stopPropagation(); closeRef.current?.();
      } else if (event.key === 'Tab') {
        const list = focusable();
        const start = list[0] || node;
        const end = list[list.length - 1] || node;
        if (!list.includes(document.activeElement) || (event.shiftKey && document.activeElement === start)
          || (!event.shiftKey && document.activeElement === end)) {
          event.preventDefault(); (event.shiftKey ? end : start)?.focus();
        }
      }
    };
    document.addEventListener('focusin', contain);
    window.addEventListener('keydown', keydown, true);
    return () => {
      document.removeEventListener('focusin', contain);
      window.removeEventListener('keydown', keydown, true);
      if (previous?.isConnected && !previous.closest('[inert]')) previous.focus({ preventScroll: true });
    };
  }, [active, ref]);
}

export default function RoleWorkbenchEntryLibrary({
  open = true, mode, platform, section, sectionLabel, currentRoleKey, currentRoleLabel, currentItems,
  onAdd, onEdit, onCreate, editor, onCloseEditor, onClose, onChanged, onRetry,
  blockedReason = '', suspended = false, highlightedId, version = 0,
  editorIssue, onDismissEditorIssue, onRereadEditor, onAcceptEditorBase,
  publicSaveNotice, onSwitchSection,
}) {
  const initial = useMemo(() => {
    try { return { snapshot: readLibrarySnapshot(platform, section), error: '' }; }
    catch (error) { return { snapshot: null, error: error.message }; }
  }, [platform, section]);
  const [snapshot, setSnapshot] = useState(initial.snapshot);
  const [error, setError] = useState(initial.error);
  const [readFailed, setReadFailed] = useState(Boolean(initial.error));
  const [searches, setSearches] = useState({ select: '', manage: '' });
  const search = searches[mode] || '';
  const [pickView, setPickView] = useState('available');
  const [spotlightId, setSpotlightId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [deselected, setDeselected] = useState([]);
  const [expandedUsageIds, setExpandedUsageIds] = useState([]);
  const [inner, setInner] = useState(null);
  const [roleKeys, setRoleKeys] = useState([]);
  const [notice, setNotice] = useState('');
  const [innerNotice, setInnerNotice] = useState('');
  const [mirrorKeys, setMirrorKeys] = useState([]);
  const [mirrorWarning, setMirrorWarning] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const drawerRef = useRef(null);
  const innerRef = useRef(null);
  const editorRef = useRef(null);
  const recoveryRef = useRef(null);
  const locatedNoticeRef = useRef(null);
  const assignmentSelectionsRef = useRef({});
  const assignmentBaseRef = useRef({});
  const previousScopeRef = useRef(`${platform}:${section}:${currentRoleKey}`);
  const candidateNoticeRef = useRef(null);
  const listScrollRef = useRef(null);
  const scrollPositionsRef = useRef({});
  const isModules = section === 'modules';
  const choosing = mode === 'select';
  const scope = `${platform === 'app' ? 'APP 工作台' : 'PC 工作台'} · ${sectionLabel}`;
  const locked = Boolean(blockedReason || readFailed || !snapshot);

  const toggleUsageExpand = (id) => {
    setExpandedUsageIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const closeInner = () => {
    if (busyRef.current) return;
    if (inner?.action === 'assign') assignmentSelectionsRef.current[inner.id] = roleKeys;
    setInner(null);
    setInnerNotice('');
  };

  const closeDrawer = () => {
    if (busyRef.current) return;
    setSelected([]);
    setDeselected([]);
    setSpotlightId(null);
    setExpandedUsageIds([]);
    setSearches({ select: '', manage: '' });
    setInnerNotice('');
    onClose();
  };

  const escapeDrawer = () => {
    if (busyRef.current) return;
    const menu = document.activeElement?.closest('details[data-actions][open]')
      || drawerRef.current?.querySelector('details[data-actions][open]');
    if (menu) { menu.open = false; menu.querySelector('summary')?.focus(); return; }
    closeDrawer();
  };

  const [unsavedSwitchTarget, setUnsavedSwitchTarget] = useState(null);
  const unsavedRef = useRef(null);

  const handleTabSwitch = (targetSec) => {
    if (targetSec === section) return;
    const hasUnsavedChanges = choosing
      ? (selected.length > 0 || deselected.length > 0)
      : Boolean(editor || inner);
    if (hasUnsavedChanges) {
      setUnsavedSwitchTarget(targetSec);
    } else {
      onSwitchSection?.(targetSec);
    }
  };

  const handleConfirmSwitch = () => {
    if (!unsavedSwitchTarget) return;
    const target = unsavedSwitchTarget;
    setSelected([]);
    setDeselected([]);
    setInner(null);
    if (editor && onCloseEditor) {
      onCloseEditor();
    }
    setUnsavedSwitchTarget(null);
    onSwitchSection?.(target);
  };

  const handleCancelSwitch = () => {
    setUnsavedSwitchTarget(null);
  };

  const scrollKey = `${mode}:${choosing ? pickView : 'library'}`;
  useLayoutEffect(() => {
  const position = scrollPositionsRef.current[scrollKey] || { top: 0, left: 0 };
  if (listScrollRef.current) {
  listScrollRef.current.scrollTop = position.top;
  listScrollRef.current.scrollLeft = position.left;
  }
  }, [scrollKey]);
  useLayerFocus(drawerRef, open && !inner && !editor && !suspended && !unsavedSwitchTarget, escapeDrawer);
  useLayerFocus(innerRef, open && Boolean(inner) && !editor && !suspended && !unsavedSwitchTarget, closeInner);
  useLayerFocus(editorRef, open && Boolean(editor) && !editorIssue && !suspended && !unsavedSwitchTarget, onCloseEditor);
  useLayerFocus(recoveryRef, open && Boolean(editor && editorIssue) && !suspended && !unsavedSwitchTarget, onDismissEditorIssue);
  useLayerFocus(unsavedRef, open && Boolean(unsavedSwitchTarget), handleCancelSwitch);

  useEffect(() => {
    try { setSnapshot(readLibrarySnapshot(platform, section)); setReadFailed(false); }
    catch (err) { setError(err.message); setReadFailed(true); }
  }, [version, platform, section, open]);

  useEffect(() => {
    const nextScope = `${platform}:${section}:${currentRoleKey}`;
    if (previousScopeRef.current === nextScope) return;
    previousScopeRef.current = nextScope;
    setSelected([]); setInner(null); setRoleKeys([]); setSpotlightId(null); setError(''); setNotice('');
    setSearches({ select: '', manage: '' }); setPickView('available');
    assignmentSelectionsRef.current = {};
    scrollPositionsRef.current = {};
  }, [platform, section, currentRoleKey]);

  useEffect(() => {
    if (publicSaveNotice) setNotice(publicSaveNotice.text);
  }, [publicSaveNotice]);

  useEffect(() => {
    if (!publicSaveNotice?.isNew || !highlightedId || candidateNoticeRef.current === publicSaveNotice) return;
    const entry = snapshot?.entries.find((item) => item.id === highlightedId);
    if (!entry) return;
    candidateNoticeRef.current = publicSaveNotice;
    setSpotlightId(entry.id);
    setPickView('available');
    if (!selectionReason(entry, currentRoleKey, currentItems)) {
      setSelected((prev) => [...new Set([...prev, entry.id])]);
    }
  }, [publicSaveNotice, highlightedId, snapshot, currentItems, currentRoleKey]);

  useEffect(() => {
    if (!open || !highlightedId || editor || inner || suspended || !publicSaveNotice || locatedNoticeRef.current === publicSaveNotice) return;
    const node = [...(drawerRef.current?.querySelectorAll('[data-library-entry]') || [])]
      .find((element) => element.dataset.libraryEntry === highlightedId);
    node?.scrollIntoView({ block: 'nearest' });
    (node?.querySelector('input:not([disabled]), button:not([disabled])') || node)?.focus({ preventScroll: true });
    if (node) locatedNoticeRef.current = publicSaveNotice;
  }, [highlightedId, editor, snapshot, inner, suspended, publicSaveNotice, spotlightId, open]);

  const refresh = () => {
    onRetry?.();
    try {
      const latest = readLibrarySnapshot(platform, section);
      setSnapshot(latest); setReadFailed(false); setError('');
      // 显式重读后保留仍有效的勾选；避免已删除/已分配对象变成无法取消的禁用勾选。
      const nextSelected = selected.filter((id) => !selectionReason(latest.entries.find((entry) => entry.id === id), currentRoleKey, currentItems));
      setSelected(nextSelected);
      if (inner) {
        const entry = latest.entries.find((item) => item.id === inner.id);
        if (!entry) {
          setInner(null); setRoleKeys([]); setError('资料已删除，请重新选择；尚未提交的配置未改变。');
        } else {
          setInner({ ...inner, snapshot: latest });
          if (inner.action === 'assign') {
            const targetRestriction = getRoleStorageKey(entry.roleTarget);
            const baseAssigned = entry.usages.map((u) => u.key);
            const previousBase = assignmentBaseRef.current[inner.id] || baseAssigned;
            const currentSelected = roleKeys;
            const explicitlyAdded = new Set(currentSelected.filter((k) => !previousBase.includes(k)));
            const explicitlyRemoved = new Set(previousBase.filter((k) => !currentSelected.includes(k)));

            const nextKeys = [];
            for (const target of TARGETS) {
              const k = target.storageKey;
              const isBaseAssigned = baseAssigned.includes(k);
              if (isBaseAssigned && !explicitlyRemoved.has(k)) {
                // 已有分配严格保留，不因适用范围变更暗中移除已有引用
                nextKeys.push(k);
              } else if (!isBaseAssigned && explicitlyAdded.has(k)) {
                if (targetRestriction && targetRestriction !== 'all' && targetRestriction !== k) continue;
                const reason = selectionReason(entry, k, latest.effective[k]?.items);
                if (!reason || reason === '已配置') {
                  nextKeys.push(k);
                }
              }
            }
            assignmentBaseRef.current[inner.id] = baseAssigned;
            assignmentSelectionsRef.current[inner.id] = nextKeys;
            setRoleKeys(nextKeys);
            const remoteChanged = baseAssigned.some((k) => !previousBase.includes(k)) || previousBase.some((k) => !baseAssigned.includes(k));
            if (remoteChanged) {
              setNotice('远端角色分配已发生变化，已重新合并最新状态，请核对后保存。');
              setInnerNotice('远端角色分配已发生变化，已重新合并最新状态，请核对后保存。');
            } else if (nextKeys.length !== currentSelected.length) {
              setNotice('已重新核对，受限对象已从待分配勾选中排除，其余选择保留。');
            }
          }
        }
      }
      if (nextSelected.length !== selected.length) setNotice('已重新核对，已配置或不可用项已排除，其余选择保留。');
      onChanged?.();
      return latest;
    } catch (err) { setError(err.message); setReadFailed(true); return null; }
  };
  const execute = async (operation) => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError('');
    try {
      if (locked) throw new Error(blockedReason || '读取异常，请重试读取后再提交');
      await operation();
    } catch (err) { setError(`操作未完成：${err.message || '请重试'}；当前选择已保留。`); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const beginAction = (id, action) => {
    if (locked) return;
    try {
      const latest = readLibrarySnapshot(platform, section);
      const entry = latest.entries.find((item) => item.id === id);
      if (!entry) throw new Error('资料已删除，请重新读取');
      setSnapshot(latest); setError(''); setInnerNotice('');
      if (action === 'assign') {
        const assignedKeys = entry.usages.map((u) => u.key);
        assignmentBaseRef.current[id] = assignedKeys;
        setRoleKeys(assignmentSelectionsRef.current[id] || assignedKeys);
      } else {
        setRoleKeys([]);
      }
      setInner({ id, action, snapshot: latest });
    } catch (err) { setError(err.message); }
  };
  const confirm = () => execute(() => {
    if (!inner) return;
    if (inner.action === 'assign') {
      const result = assignLibraryEntry(inner.snapshot, inner.id, roleKeys);
      const pendingKeys = result.mirrorError ? [...new Set([...mirrorKeys, ...result.mirrorKeys])]
        : mirrorKeys.filter((key) => !result.mirrorKeys.includes(key));
      setMirrorKeys(pendingKeys);
      setMirrorWarning(result.mirrorError ? `${scope}（分配兼容同步）：${result.mirrorError}` : pendingKeys.length ? mirrorWarning : '');
      delete assignmentSelectionsRef.current[inner.id];
      delete assignmentBaseRef.current[inner.id];
      setNotice('角色分配已更新生效。');
    } else {
      const result = changeLibraryAvailability(inner.snapshot, inner.id, inner.action);
      if (inner.action === 'delete') {
        if (result?.cleanupError) {
          setError(`删除已生效，配置清理未完成：${result.cleanupError}`);
        }
        if (result?.mirrorError) {
          const pendingKeys = [...new Set([...mirrorKeys, ...(result.mirrorKeys || [])])];
          setMirrorKeys(pendingKeys);
          setMirrorWarning(`${scope}（删除兼容同步）：${result.mirrorError}`);
          setNotice('入口已删除，但兼容镜像同步未完成，可重试同步。');
        } else if (!result?.cleanupError) {
          setNotice('入口已彻底删除，已同步从所有选用该入口的角色工作台中移除。');
        }
      } else {
        setNotice('全局可用性已更新。');
      }
    }
    setInner(null); setRoleKeys([]); setInnerNotice('');
    setSnapshot(readLibrarySnapshot(platform, section)); onChanged?.();
  });
  const allEntries = snapshot?.entries || [];
  const assigned = (entry) => currentItems.some((item) => item.id === entry.id && !item.isRemoved);
  const availableEntries = allEntries.filter((entry) => !assigned(entry));
  const addedEntries = allEntries.filter(assigned);
  const eligibleCount = availableEntries.filter((entry) => !selectionReason(entry, currentRoleKey, currentItems)).length;
  const sourceEntries = choosing ? pickView === 'added' ? addedEntries : availableEntries : allEntries;
  const matches = (entry) => `${entry.name} ${entry.id}`.toLowerCase().includes(search.trim().toLowerCase());
  const entries = sourceEntries.filter(matches);
  if (choosing && pickView === 'available' && spotlightId) {
    const spotlight = availableEntries.find((entry) => entry.id === spotlightId);
    if (spotlight) {
      const index = entries.findIndex((entry) => entry.id === spotlight.id);
      if (index >= 0) entries.splice(index, 1);
      entries.unshift(spotlight);
    }
  }
  const innerEntry = inner?.snapshot.entries.find((entry) => entry.id === inner.id);
  const latestEditor = editorIssue?.latest;

  return <>
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/35"
      style={!open || editor || inner || suspended ? { visibility: 'hidden', pointerEvents: 'none' } : undefined}
      onClick={(event) => { if (event.target === event.currentTarget && !inner && !editor) closeDrawer(); }}>
      <section ref={drawerRef} role="dialog" aria-modal={open && !inner && !editor && !suspended ? 'true' : undefined}
        aria-labelledby="entry-library-title" tabIndex={-1}
        inert={!open || inner || editor || suspended ? true : undefined}
        className="flex h-[100dvh] w-full min-w-0 max-w-4xl flex-col bg-white text-start shadow-2xl">
        <header className="shrink-0 border-b border-gray-100 px-6 pb-3 pt-5">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <h2 id="entry-library-title" className="text-[18px] font-bold text-gray-900">
              {choosing ? (isModules ? '选择模块' : '添加已有入口') : (platform === 'pc' ? 'PC 公共配置' : 'APP 公共配置')}
            </h2>
            <button type="button" aria-label="关闭面板" onClick={closeDrawer} className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1890ff]">×</button>
          </div>
          <p className="mt-1.5 text-[13px] text-gray-500 [overflow-wrap:anywhere]">
            {choosing
              ? `为【${currentRoleLabel}】配置，勾选添加，取消勾选移除；保存后生效。`
              : `集中维护公共入口与模块资料、启用/停用状态及角色分配。`}
          </p>
        </header>
        {!choosing && onSwitchSection && (
          <div className="shrink-0 border-b border-gray-200 bg-white px-6">
            <nav className="flex items-center gap-8 -mb-px" aria-label="公共配置库分类">
              <button
                type="button"
                onClick={() => handleTabSwitch(platform === 'pc' ? 'actions' : 'workbench')}
                className={`pb-3 pt-3 text-[16px] font-bold transition border-b-2 ${
                  !isModules
                    ? 'border-[#1890ff] text-[#1890ff]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {platform === 'pc' ? '快速链接库' : '入口库'}
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('modules')}
                className={`pb-3 pt-3 text-[16px] font-bold transition border-b-2 ${
                  isModules
                    ? 'border-[#1890ff] text-[#1890ff]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                模块库
              </button>
            </nav>
          </div>
        )}
        <div className="shrink-0 px-6 pt-4">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-gray-200 bg-gray-50/60 px-3 text-gray-400 focus-within:border-[#1890ff] focus-within:bg-white">
              <span aria-hidden="true" className="text-[18px]">⌕</span><span className="sr-only">搜索名称或ID</span>
              <input value={search} onChange={(event) => { setSpotlightId(null); setSearches((prev) => ({ ...prev, [mode]: event.target.value })); }} placeholder="搜索名称或 ID"
                className="min-h-[40px] min-w-0 w-full bg-transparent text-[14px] text-gray-800 outline-none" />
            </label>
            <button type="button" className={textButtonClass} onClick={refresh} aria-label="重新读取入口库">刷新</button>
            {!choosing && <button type="button" className={primaryClass} disabled={locked} onClick={() => execute(onCreate)}>{isModules ? '新增模块' : '新增入口'}</button>}
          </div>
          {choosing && <nav className="mt-3 flex gap-5 border-b border-gray-100" aria-label="选用视图">
            {[['available', isModules ? '可添加' : '可添加', eligibleCount], ['added', '已添加', addedEntries.length]].map(([value, label, count]) => <button key={value} type="button"
              aria-pressed={pickView === value} onClick={() => setPickView(value)}
              className={`min-h-[44px] border-b-2 px-1 text-[14px] ${pickView === value ? 'border-[#1890ff] font-medium text-[#1890ff]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>{label}<span className="ms-2 text-[12px] tabular-nums">{count}</span></button>)}
          </nav>}
        </div>
        <div className="max-h-40 shrink-0 overflow-y-auto px-6 text-[14px] leading-6 [overflow-wrap:anywhere]">
          {(error || blockedReason) && <div role="alert" className="mt-3 rounded-md border border-red-100 bg-red-50 p-3 text-red-800">
            <p>{error || blockedReason}</p><button type="button" className="mt-1 min-h-[36px] rounded text-[13px] font-medium underline" onClick={refresh}>重新读取并核对</button>
          </div>}
          {notice && <p role="status" className="mt-3 text-gray-600">{notice}</p>}
          {snapshot?.pendingCleanups?.length > 0 && (
            <div role="alert" className="mt-3 space-y-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-900">
              <div className="font-semibold text-[13px]">
                存在 {snapshot.pendingCleanups.length} 项公共删除已生效但角色工作台或镜像清理未完成：
              </div>
              <ul className="space-y-1.5 text-[13px]">
                {snapshot.pendingCleanups.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                      <b>【{item.name}】</b>
                      {item.remainingRoles?.length > 0 && (
                        <span className="text-red-700 ms-1">待清理角色: {item.remainingRoles.map(getRoleLabel).join('、')}</span>
                      )}
                      {item.mirrorPending && <span className="text-amber-700 ms-1">（待兼容同步）</span>}
                    </span>
                    <button
                      type="button"
                      className="min-h-[32px] shrink-0 rounded bg-red-600 px-2.5 py-1 text-[12px] font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      disabled={busy || locked}
                      onClick={() => execute(() => {
                        const res = retryCleanupDeletedEntry(platform, section, item.id);
                        if (res.mirrorError) {
                          if (res.mirrorKeys?.length) {
                            setMirrorKeys((prev) => [...new Set([...prev, ...res.mirrorKeys])]);
                          }
                          setMirrorWarning(`${scope}（删除兼容同步）：${res.mirrorError}`);
                        } else {
                          const cleanedKeys = res.mirrorKeys || [];
                          const remainingKeys = mirrorKeys.filter((k) => !cleanedKeys.includes(k));
                          setMirrorKeys(remainingKeys);
                          if (!remainingKeys.length) setMirrorWarning('');
                        }
                        setNotice(`【${item.name}】角色工作台清理已恢复完成。`);
                        setSnapshot(readLibrarySnapshot(platform, section));
                        onChanged?.();
                      })}
                    >
                      重试配置清理
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {mirrorWarning && <div role="alert" className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900">
            <p>{mirrorWarning.includes('同步') ? mirrorWarning : `配置已保存，兼容同步未完成：${mirrorWarning}`}</p>
            <button type="button" className="mt-1 min-h-[36px] rounded font-medium underline" disabled={busy || locked} onClick={() => execute(() => {
              retryAssignmentMirror(mirrorKeys);
              setMirrorKeys([]);
              setMirrorWarning('');
              setNotice('兼容同步已完成。');
              setSnapshot(readLibrarySnapshot(platform, section));
              onChanged?.();
            })}>重试兼容同步</button>
          </div>}
        </div>
        <div ref={listScrollRef} className="min-h-0 flex-1 overflow-y-auto px-6 pb-5 pt-3" onScroll={(event) => {
          scrollPositionsRef.current[scrollKey] = { top: event.currentTarget.scrollTop, left: event.currentTarget.scrollLeft };
        }}>
          {entries.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center gap-3 py-10 text-center">
            <p className="text-[15px] font-medium text-gray-700">{readFailed ? '读取失败，请重试' : search.trim() ? '没有匹配的结果'
              : choosing ? pickView === 'added' ? '当前配置尚未添加条目' : allEntries.length ? '全部条目已添加' : isModules ? '暂无同步模块' : '入口库暂无条目'
                : isModules ? '暂无同步模块' : '入口库暂无条目'}</p>
            <p className="max-w-sm text-[13px] leading-6 text-gray-400">{search.trim() ? '试试其他名称或 ID，已勾选的条目会保留。' : choosing && allEntries.length ? '可在“已添加”中核对当前配置。' : isModules ? '同步资料到达后可在这里选用。' : '可从入口管理中新建资料，再选用当前配置。'}</p>
            {search.trim() && <button type="button" className={buttonClass} onClick={() => setSearches((prev) => ({ ...prev, [mode]: '' }))}>清除搜索</button>}
          </div> : choosing ? <>
            {pickView === 'available' && !eligibleCount && <p className="mb-3 text-[13px] leading-6 text-gray-500">暂无可添加项，以下条目暂不可用，请查看原因。</p>}
            <ul className="divide-y divide-gray-100">
              {entries.map((entry) => {
                const alreadyAdded = assigned(entry);
                const isDeselected = deselected.includes(entry.id);
                const isSelected = selected.includes(entry.id);
                const isChecked = alreadyAdded ? !isDeselected : isSelected;
                const reason = !alreadyAdded ? selectionReason(entry, currentRoleKey, currentItems) : '';
                return <li key={entry.id}>
                  <label data-library-entry={entry.id} tabIndex={-1}
                    className={`flex min-h-[76px] min-w-0 items-start gap-3 rounded-md px-2 py-4 ${reason ? 'text-gray-500 opacity-60' : 'cursor-pointer hover:bg-blue-50/40'} ${isDeselected ? 'bg-red-50/30' : isSelected || spotlightId === entry.id ? 'bg-blue-50/50' : ''}`}>
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 accent-[#1890ff]"
                      aria-label={`选择${entry.name}`}
                      checked={isChecked}
                      disabled={Boolean(reason) || locked}
                      onChange={(event) => {
                        if (alreadyAdded) {
                          if (!event.target.checked) {
                            setDeselected((prev) => [...new Set([...prev, entry.id])]);
                          } else {
                            setDeselected((prev) => prev.filter((id) => id !== entry.id));
                          }
                        } else {
                          if (event.target.checked) {
                            setSelected((prev) => [...new Set([...prev, entry.id])]);
                          } else {
                            setSelected((prev) => prev.filter((id) => id !== entry.id));
                          }
                        }
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
                        <bdi className="min-w-0 text-[14px] font-medium text-gray-900 [overflow-wrap:anywhere]">{entry.name}</bdi>
                        {alreadyAdded ? (
                          isDeselected ? (
                            <span className="text-[12px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">待移除</span>
                          ) : (
                            <span className="text-[12px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">已配置</span>
                          )
                        ) : isSelected ? (
                          <span className="text-[12px] font-semibold text-[#1890ff] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">待添加</span>
                        ) : spotlightId === entry.id ? (
                          <span className="text-[12px] text-[#1890ff]">刚加入入口库</span>
                        ) : null}
                      </span>
                      <bdi dir="ltr" className="mt-1 block break-all text-[12px] text-gray-400">{entry.id}</bdi>
                      {reason && <span className="mt-1 block text-[13px] leading-5 text-gray-500 [overflow-wrap:anywhere]">{reason}</span>}
                    </span>
                  </label>
                </li>;
              })}
            </ul>
          </> : <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[14px]">
              <thead><tr className="border-b border-gray-100 text-[12px] text-gray-400">
                <th className="py-3 pe-4 text-start font-medium">名称 / ID</th>
                <th className="w-24 px-3 py-3 text-start font-medium">全局状态</th>
                <th className="w-32 px-3 py-3 text-start font-medium">使用对象</th>
                <th className="py-3 ps-3 text-end font-medium">操作</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">{entries.map((entry) => {
                const assignDisabled = locked || entry.globalEnabled === false || Boolean(entry.hasRoleDifferences);
                let assignReason = '';
                if (entry.globalEnabled === false) assignReason = '已全局停用';
                else if (entry.hasRoleDifferences) assignReason = '存在资料差异待核对';

                const deletable = !locked;
                const isExpanded = expandedUsageIds.includes(entry.id);

                return (
                  <React.Fragment key={entry.id}>
                    <tr data-library-entry={entry.id} className="align-top">
                      <td className="py-3 pe-4">
                        <bdi className="block max-w-xs font-medium text-gray-900 [overflow-wrap:anywhere]">{entry.name}</bdi>
                        <bdi dir="ltr" className="mt-1 block break-all text-[12px] text-gray-400">{entry.id}</bdi>
                        {entry.hasRoleDifferences && <p className="mt-1 text-[12px] text-amber-700">资料差异待核对</p>}
                      </td>
                      <td className="px-3 py-3 text-[13px] text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                          <i aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${entry.globalEnabled === false ? 'bg-gray-400' : 'bg-emerald-500'}`}/>
                          {entry.globalEnabled === false ? '已停用' : '可用'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[13px] text-gray-600">
                        {entry.usages.length ? (
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-controls={`usage-row-${entry.id}`}
                            onClick={() => toggleUsageExpand(entry.id)}
                            className="inline-flex items-center gap-1 text-[13px] text-gray-600 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1890ff] rounded py-0.5"
                          >
                            <span>{entry.usages.length} 个对象</span>
                            <span aria-hidden="true" className={`text-[10px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>⌄</span>
                          </button>
                        ) : (
                          <span className="text-gray-400">尚未分配</span>
                        )}
                      </td>
                      <td className="py-2 ps-3">
                        <div className="flex flex-nowrap items-center justify-end gap-2 whitespace-nowrap">
                          <button
                            type="button"
                            className={`${rowActionClass} text-[#1890ff] hover:bg-blue-50 font-medium`}
                            disabled={locked}
                            onClick={() => execute(() => onEdit(entry))}
                            title="编辑"
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            className={`${rowActionClass} text-[#1890ff] hover:bg-blue-50 font-medium`}
                            disabled={assignDisabled}
                            onClick={() => beginAction(entry.id, 'assign')}
                            title={assignReason || '分配角色'}
                          >
                            分配角色
                          </button>
                          <button
                            type="button"
                            className={`${rowActionClass} text-gray-600 hover:bg-gray-50 hover:text-gray-900`}
                            disabled={locked}
                            onClick={() => beginAction(entry.id, entry.globalEnabled === false ? 'enable' : 'disable')}
                            title={entry.globalEnabled === false ? '全局恢复' : '全局停用'}
                          >
                            {entry.globalEnabled === false ? '全局恢复' : '全局停用'}
                          </button>
                          <button
                            type="button"
                            className={`${rowActionClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
                            disabled={locked || !deletable}
                            onClick={() => beginAction(entry.id, 'delete')}
                            title="彻底删除（将从所有已选用角色工作台中联动移除）"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && entry.usages.length > 0 && (
                      <tr id={`usage-row-${entry.id}`} className="bg-gray-50/60 text-[13px] text-gray-600">
                        <td colSpan={4} className="px-4 py-2.5">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-gray-400 font-medium">使用对象：</span>
                            <span>
                              {entry.usages.map((usage, idx) => (
                                <React.Fragment key={usage.key}>
                                  {idx > 0 && <span className="text-gray-300 mx-1.5" aria-hidden="true">·</span>}
                                  <bdi className="text-gray-700">{usage.name}</bdi>
                                </React.Fragment>
                              ))}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}</tbody>
            </table>
          </div>}
        </div>
        {choosing && <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-6 py-4">
          <span className="text-[13px] text-gray-500">
            已选择：
            <b className="font-semibold tabular-nums text-blue-600">+{selected.length}</b> 待添加
            {deselected.length > 0 && (
              <span className="ms-2">
                / <b className="font-semibold tabular-nums text-red-600">-{deselected.length}</b> 待移除
              </span>
            )}
          </span>
          <div className="flex min-w-0 flex-wrap justify-end gap-3">
            <button type="button" className={buttonClass} onClick={closeDrawer}>取消</button>
            <button
              type="button"
              className={deselected.length > 0 && selected.length === 0 ? dangerClass : primaryClass}
              disabled={(!selected.length && !deselected.length) || locked || busy}
              onClick={() => execute(() => {
                onAdd(snapshot, selected, deselected);
                setSelected([]);
                setDeselected([]);
                setSpotlightId(null);
                onClose();
              })}
            >
              {selected.length > 0 && deselected.length > 0
                ? `应用修改（+${selected.length} / -${deselected.length}）`
                : deselected.length > 0
                  ? `确认移除所选（${deselected.length}）`
                  : `添加到当前配置（${selected.length}）`}
            </button>
          </div>
        </footer>}
      </section>
    </div>
    {open && inner && innerEntry && <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/45 p-4" onClick={(event) => { if (event.target === event.currentTarget) closeInner(); }}>
      <section ref={innerRef} role="alertdialog" aria-modal={!suspended ? 'true' : undefined} inert={suspended ? true : undefined} aria-labelledby="library-confirm-title" tabIndex={-1}
        className="flex max-h-[calc(100dvh-2rem)] w-full min-w-0 max-w-xl flex-col rounded-xl bg-white text-start shadow-2xl">
        <h2 id="library-confirm-title" className="shrink-0 px-6 pt-5 text-[18px] font-bold text-gray-900 [overflow-wrap:anywhere]">
          {inner.action === 'assign'
            ? `分配角色 - ${innerEntry.name}`
            : inner.action === 'delete'
              ? `彻底删除“${innerEntry.name}”？`
              : inner.action === 'enable'
                ? `恢复“${innerEntry.name}”？`
                : `停用“${innerEntry.name}”？`}
        </h2>
        <div className="min-h-0 overflow-y-auto px-6 py-4 text-[14px] leading-6 [overflow-wrap:anywhere]">
          {inner.action === 'assign' ? (
            <>
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                <p className="text-[14px] font-bold text-blue-900"><bdi>{innerEntry.name}</bdi></p>
                <p className="mt-1 text-[12px] text-blue-700">勾选角色分配此{isModules ? '模块' : '入口'}，取消勾选移除；保存后立即生效。</p>
              </div>

              {innerNotice && (
                <div role="alert" className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-[13px] font-medium text-amber-900">
                  {innerNotice}
                </div>
              )}

              <div className="mt-3.5 space-y-1.5">
                {TARGETS.map((target) => {
                  const targetRestriction = getRoleStorageKey(innerEntry.roleTarget);
                  const isRestricted = targetRestriction && targetRestriction !== 'all' && targetRestriction !== target.storageKey;
                  const isCurrentlyAssigned = innerEntry.usages.some((u) => u.key === target.storageKey);
                  const isChecked = roleKeys.includes(target.storageKey);
                  return (
                    <label key={target.id} className={`flex min-h-[44px] items-center justify-between rounded-lg border p-2.5 transition ${
                      isRestricted && !isCurrentlyAssigned
                        ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 bg-white hover:bg-gray-50 cursor-pointer'
                    }`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input type="checkbox" className="h-4 w-4 rounded accent-[#1890ff]" checked={isChecked}
                          disabled={(Boolean(isRestricted) && !isCurrentlyAssigned) || busy || locked}
                          onChange={(event) => {
                            const next = event.target.checked ? [...new Set([...roleKeys, target.storageKey])] : roleKeys.filter((k) => k !== target.storageKey);
                            setRoleKeys(next);
                            assignmentSelectionsRef.current[inner.id] = next;
                          }} />
                        <span className="text-[14px] font-medium text-gray-800">
                          {target.name}
                        </span>
                        {isRestricted && <span className="text-[12px] text-gray-400">（仅限{getRoleLabel(targetRestriction)}）</span>}
                      </div>
                      <span className="text-[12px] font-medium">
                        {isCurrentlyAssigned ? (
                          isChecked ? (
                            isRestricted ? <span className="text-amber-600 font-semibold">已分配（超出范围）</span>
                            : <span className="text-emerald-600 font-semibold">已分配</span>
                          ) : <span className="text-red-500 font-semibold">待移除</span>
                        ) : (
                          isChecked ? <span className="text-[#1890ff] font-semibold">待新增</span> : <span className="text-gray-400">未分配</span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          ) : inner.action === 'disable' ? (
            <>
              <div className="rounded-lg border border-amber-300 bg-amber-50/70 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-[12px] font-bold">!</span>
                  <span className="font-bold text-amber-900 text-[14px]">
                    停用说明
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] font-medium leading-5 text-amber-900">
                  停用后，各角色工作台均无法再展示或新增分配此{isModules ? '模块' : '入口'}。原有排布顺序保留。
                </p>
              </div>

              {innerEntry.usages.length > 0 ? (
                <div className="mt-3.5 rounded-lg border border-gray-200 bg-gray-50/60 p-3.5 text-[13px]">
                  <div className="font-semibold text-gray-900 mb-2">
                    影响角色（共 {innerEntry.usages.length} 个）：
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {innerEntry.usages.map((u) => (
                      <span key={u.key} className="rounded border border-amber-200 bg-white px-2.5 py-1 text-[12px] font-medium text-amber-800 shadow-2xs">
                        {u.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-[13px] text-gray-500">当前尚未分配到任何配置对象。</p>
              )}
            </>
          ) : inner.action === 'enable' ? (
            <>
              <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1890ff] text-white text-[12px] font-bold">✓</span>
                  <span className="font-bold text-blue-900 text-[14px]">
                    恢复启用说明
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] font-medium leading-5 text-blue-900">
                  恢复后，此{isModules ? '模块' : '入口'}在公共库中重新可用，可在各角色中开启展示或分配。
                </p>
              </div>

              {innerEntry.usages.length > 0 ? (
                <div className="mt-3.5 rounded-lg border border-gray-200 bg-gray-50/60 p-3.5 text-[13px]">
                  <div className="font-semibold text-gray-900 mb-2">
                    生效角色（共 {innerEntry.usages.length} 个）：
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {innerEntry.usages.map((u) => (
                      <span key={u.key} className="rounded border border-blue-200 bg-white px-2.5 py-1 text-[12px] font-medium text-blue-800 shadow-2xs">
                        {u.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-[13px] text-gray-500">当前尚未分配到任何配置对象。</p>
              )}
            </>
          ) : (
            <>
              <div className="rounded-lg border border-red-300 bg-red-50/80 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white text-[12px] font-bold">!</span>
                  <span className="font-bold text-red-900 text-[14px]">
                    彻底删除与联动移除（不可撤销）
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] font-semibold leading-5 text-red-800">
                  此操作将从公共{isModules ? '模块' : '入口'}库彻底清除【{innerEntry.name}】；所有已选用的角色工作台将同步直接移除该项！
                </p>
              </div>

              {innerEntry.usages.length > 0 ? (
                <div className="mt-3.5 rounded-lg border border-red-200 bg-white p-3.5 text-[13px]">
                  <div className="font-semibold text-red-900 mb-2">
                    受影响角色（将从以下 {innerEntry.usages.length} 个角色工作台中移除）：
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {innerEntry.usages.map((u) => (
                      <span key={u.key} className="rounded border border-red-200 bg-red-50 px-2.5 py-1 text-[12px] font-medium text-red-700 shadow-2xs">
                        {u.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-[13px] text-gray-500">当前尚未分配到任何配置对象，直接从公共库删除。</p>
              )}
            </>
          )}
          {error && <div role="alert" className="mt-3 rounded bg-red-50 p-3 text-red-800"><p>{error}</p><button type="button" className={buttonClass} onClick={refresh}>重新读取并核对</button></div>}
          {blockedReason && <p role="alert" className="mt-3 text-red-700">{blockedReason}</p>}
        </div>
        <footer className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-gray-200 p-5">
          <button type="button" className={buttonClass} disabled={busy} onClick={closeInner}>取消</button>
          <button
            type="button"
            className={inner.action === 'disable' || inner.action === 'delete' ? dangerClass : primaryClass}
            disabled={busy || locked}
            onClick={confirm}
          >
            {busy
              ? '提交中…'
              : inner.action === 'assign'
                ? '保存角色分配'
                : inner.action === 'delete'
                  ? '彻底删除并联动移除'
                  : inner.action === 'enable'
                    ? '确认恢复'
                    : '确认停用'}
          </button>
        </footer>
      </section>
    </div>}
    {open && editor && <div ref={editorRef} inert={editorIssue || suspended ? true : undefined}
      style={editorIssue || suspended ? { visibility: 'hidden', pointerEvents: 'none' } : undefined}
      onClick={(event) => { if (event.target === editorRef.current?.firstElementChild) onCloseEditor(); }}>{editor}</div>}
    {open && editor && editorIssue && <div className="fixed inset-0 z-[125] flex items-center justify-center bg-black/45 p-4"
      onClick={(event) => { if (event.target === event.currentTarget) onDismissEditorIssue(); }}>
      <section ref={recoveryRef} role="alertdialog" aria-modal={!suspended ? 'true' : undefined} inert={suspended ? true : undefined} aria-labelledby="editor-recovery-title" tabIndex={-1}
        className="flex max-h-[calc(100dvh-2rem)] w-full min-w-0 max-w-2xl flex-col rounded-xl bg-white text-start shadow-2xl">
        <h2 id="editor-recovery-title" className="shrink-0 px-5 pt-5 text-[18px] font-bold">资料未保存，表单已保留</h2>
        <div className="min-h-0 overflow-y-auto p-5 text-[14px] leading-6 [overflow-wrap:anywhere]">
          <p role="alert">{editorIssue.text}</p>
          {latestEditor && <details className="mt-3 rounded border border-gray-200 p-3" open>
            <summary>最新公共资料（核对后可继续编辑当前表单）</summary>
            <dl className="mt-3 space-y-2">
              {[
                ['名称', latestEditor.name], ['英文名称', latestEditor.enName],
                ['跳转方式', latestEditor.jumpType === 'h5' ? 'H5' : '原生'], ['目标链接', latestEditor.jumpUrl],
                ['产品组', latestEditor.productGroup === 'all' ? '全部' : latestEditor.productGroup],
                ['适用角色', latestEditor.roleTarget === 'all' ? '全部' : getRoleLabel(latestEditor.roleTarget)],
                ['Pro功能', latestEditor.pro ? '是' : '否'], ['是否展示角标', latestEditor.showBadge ? '展示' : '不展示'],
                ['全局状态', latestEditor.globalEnabled === false ? '已停用' : '可用'],
              ].map(([label, value]) => <div key={label} className="flex min-w-0 flex-wrap gap-x-3"><dt className="text-gray-500">{label}</dt><dd className="min-w-0"><bdi>{value || '—'}</bdi></dd></div>)}
            </dl>
            <p className="mt-3 font-semibold">最新多语言名称与图标</p>
            <ul className="mt-2 space-y-2">{Object.entries(latestEditor.translations || {}).map(([language, name]) => <li key={language}>
              <bdi>{language}</bdi>：<bdi>{name || '—'}</bdi>
            </li>)}</ul>
            {isImageValue(latestEditor.icon) ? <img src={latestEditor.icon} alt="最新公共图标" className="mt-2 h-16 w-16 object-contain" />
              : <p className="mt-2">图标：<bdi>{latestEditor.icon || '未设置'}</bdi></p>}
            <ul className="mt-2 space-y-2">{Object.entries(latestEditor.localeIcons || {}).map(([language, icon]) => <li key={language} className="flex flex-wrap items-center gap-2">
              <bdi>{language}</bdi>{isImageValue(icon) ? <img src={icon} alt={`${language}最新图标`} className="h-12 w-12 object-contain" /> : <bdi>{icon || '未设置'}</bdi>}
            </li>)}</ul>
            <p className="mt-3 text-gray-600">保留表单继续后，再次保存会将当前表单资料应用到这个最新版本；各对象布局保持。</p>
          </details>}
        </div>
        <footer className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-gray-200 p-5">
          <button type="button" className={buttonClass} onClick={onDismissEditorIssue}>返回表单</button>
          <button type="button" className={buttonClass} onClick={onRereadEditor}>重新读取最新资料</button>
          <button type="button" className={primaryClass} disabled={!editorIssue.latest || Boolean(blockedReason)} onClick={onAcceptEditorBase}>核对后保留表单继续</button>
        </footer>
      </section>
    </div>}
    {open && unsavedSwitchTarget && (
      <div
        className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4"
        onClick={(event) => { if (event.target === event.currentTarget) handleCancelSwitch(); }}
      >
        <section
          ref={unsavedRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="unsaved-prompt-title"
          aria-describedby="unsaved-prompt-desc"
          tabIndex={-1}
          className="flex w-full min-w-0 max-w-sm flex-col rounded-xl bg-white p-6 text-center shadow-2xl border border-gray-200"
        >
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-500 text-lg font-bold">
            !
          </div>
          <h2 id="unsaved-prompt-title" className="text-[16px] font-bold text-gray-900 mb-2">提示</h2>
          <p id="unsaved-prompt-desc" className="text-[14px] text-gray-600 mb-6">当前未保存。</p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCancelSwitch}
              className="min-h-[38px] flex-1 rounded-md border border-gray-300 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              继续编辑
            </button>
            <button
              type="button"
              onClick={handleConfirmSwitch}
              className="min-h-[38px] flex-1 rounded-md bg-[#1890ff] text-[13px] font-medium text-white hover:bg-[#40a9ff] transition"
            >
              放弃并切换
            </button>
          </div>
        </section>
      </div>
    )}
  </>;
}

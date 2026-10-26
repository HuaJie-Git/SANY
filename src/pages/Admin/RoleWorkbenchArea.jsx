import React, { useEffect, useMemo, useRef } from 'react';
import { DEFAULT_USER_CONFIG_TARGET, getRoleLabel, getRoleStorageKey, formatProductGroupLabel } from '../../admin/roleWorkbench';

// 各统计范围的演示快照，不读写真实统计。
const DEMO_CLICKS = {
  '7d': { inquiry: 90, parts: 80, service: 180, maintenance: 60 },
  '30d': { inquiry: 120, parts: 860, service: 620, maintenance: 320 },
  all: { inquiry: 2480, parts: 2600, service: 1920, maintenance: 3400 },
};
const DEMO_MODULE_CLICKS = {
  '7d': { recent: 85, tasks: 120, startup: 70, audit: 160, content: 40 },
  '30d': { recent: 620, tasks: 860, startup: 320, audit: 120, content: 540 },
  all: { recent: 2180, tasks: 2600, startup: 3120, audit: 4380, content: 1860 },
};
const PERIOD_LABELS = { '7d': '近7天', '30d': '近30天', all: '累计' };

function formatCreatedAt(value) {
  if ((typeof value !== 'string' && typeof value !== 'number') || value === '') return '—';
  if (typeof value === 'string') {
    const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (parts) {
      const [, year, month, day, hour = '00', minute = '00', second = '00'] = parts;
      const days = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
      if (Number(month) < 1 || Number(month) > 12 || Number(day) < 1 || Number(day) > days
        || Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) return '—';
    }
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatCreatedBy(value) {
  if (typeof value === 'string') return value.trim() || '—';
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '—';
}

export default function RoleWorkbenchArea({
  platform,
  section,
  sectionLabel,
  currentRoleKey,

  // Role props
  roleItems = [],
  roleRules = {},
  onUpdateRoleRules,
  onMoveRoleUp,
  onMoveRoleDown,
  onToggleRolePin,
  onToggleRoleVisible,
  hasRoleDraftChanges = false,
  canSaveRoleConfig = hasRoleDraftChanges,
  onSaveRoleConfig,
  onCancelRoleChanges,
  _onRemoveRoleItem,
  _onRestoreRoleItem,
  _undoRemoval,
  _onUndoRemoval,
  isSaving = false,
  saveFeedback,
  highlightedEntryId,
  isOverlayOpen = false,
  _showDetails = false,
  _onShowDetailsChange,

  // Public entries
  currentCatalog = [],
  onSelectEntries,
  onOpenLibrary,
}) {
  const isModules = section === 'modules';
  const isAutoSort = roleRules.userSort === 'auto_clicks';
  const isDefaultUser = currentRoleKey === DEFAULT_USER_CONFIG_TARGET.storageKey;
  const autoPeriod = Object.hasOwn(PERIOD_LABELS, roleRules.autoPeriod) ? roleRules.autoPeriod : '30d';
  const statusReasonId = React.useId();
  const activeItems = useMemo(() => roleItems.filter((item) => !item.isRemoved), [roleItems]);
  const areaRef = useRef(null);
  const lastLocatedRef = useRef(null);

  useEffect(() => {
    if (!highlightedEntryId || isOverlayOpen) return;
    const row = [...(areaRef.current?.querySelectorAll('[data-entry-id]') || [])]
      .find((node) => node.dataset.entryId === highlightedEntryId);
    if (!row) { lastLocatedRef.current = null; return; }
    if (lastLocatedRef.current !== highlightedEntryId) {
      row.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      row.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
      lastLocatedRef.current = highlightedEntryId;
    }
  }, [highlightedEntryId, isOverlayOpen, activeItems]);

  // APP 置顶数量统计（R-018: 隐藏但置顶项计入，各角色区域分别计数）
  const pinnedCount = useMemo(() => {
    return activeItems.filter((i) => Boolean(i.isPinned)).length;
  }, [activeItems]);

  // 获取详情辅助
  const getDetail = React.useCallback(
    (id) => {
      return (
        currentCatalog.find((f) => f.id === id) || {
          id,
          name: id,
          enName: id,
          category: '其他',
          color: '#f3f4f6',
          icon: '应用',
        }
      );
    },
    [currentCatalog]
  );

  // 计算展示结果，不改变保存的备用人工顺序；隐藏/不适用项仍可在表尾维护。
  const displayRows = useMemo(() => {
    const demoClicks = isDefaultUser ? {} : (platform === 'app' && isModules ? DEMO_MODULE_CLICKS : DEMO_CLICKS)[autoPeriod];
    const rows = activeItems.map((item, manualIndex) => {
      const detail = getDetail(item.id);
      const target = getRoleStorageKey(detail.roleTarget || item.roleTarget);
      const visible = item.visible !== undefined ? Boolean(item.visible) : item.defaultVisible !== 'no';
      const participates = visible && (!target || target === 'all' || target === getRoleStorageKey(currentRoleKey))
        && !detail.hasRoleDifferences && detail.globalEnabled !== false;
      return { item, manualIndex, clicks: isDefaultUser ? null : demoClicks[item.id] ?? 0, participates };
    });
    const comparePinnedItems = (a, b) => {
      const aOrder = typeof a.item.pinnedOrder === 'number' ? a.item.pinnedOrder : null;
      const bOrder = typeof b.item.pinnedOrder === 'number' ? b.item.pinnedOrder : null;
      if (aOrder !== null && bOrder !== null) {
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.manualIndex - b.manualIndex;
      }
      if (aOrder === null && bOrder === null) {
        return a.manualIndex - b.manualIndex;
      }
      return aOrder === null ? -1 : 1;
    };

    if (!isAutoSort) {
      const pinned = [];
      const nonPinned = [];
      for (const row of rows) {
        if (row.item.isPinned) {
          pinned.push(row);
        } else {
          nonPinned.push(row);
        }
      }
      pinned.sort(comparePinnedItems);
      return [...pinned, ...nonPinned];
    }

    return rows.sort((a, b) => {
      const partDiff = Number(b.participates) - Number(a.participates);
      if (partDiff !== 0) return partDiff;
      if (!a.participates) {
        return a.manualIndex - b.manualIndex;
      }
      const pinDiff = Number(Boolean(b.item.isPinned)) - Number(Boolean(a.item.isPinned));
      if (pinDiff !== 0) return pinDiff;
      if (a.item.isPinned) {
        return comparePinnedItems(a, b);
      }
      return (b.clicks - a.clicks) || (a.manualIndex - b.manualIndex);
    });
  }, [activeItems, getDetail, currentRoleKey, isAutoSort, autoPeriod, platform, isModules, isDefaultUser]);

  const nonPinnedRows = useMemo(() => {
    return displayRows.filter((r) => !r.item.isPinned);
  }, [displayRows]);

  return (
    <section ref={areaRef} data-config-mode="role" data-section={section} className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 pb-3 pt-5">
        <div className="flex min-w-0 flex-wrap items-baseline gap-2">
          <h2 className="min-w-0 text-[17px] font-semibold text-gray-900 [overflow-wrap:anywhere]">{sectionLabel}</h2>
          <span className="text-[13px] text-gray-400">{activeItems.length} 项</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenLibrary && (
            <button
              type="button"
              onClick={onOpenLibrary}
              className="inline-flex min-h-[40px] max-w-full items-center justify-center gap-2 rounded-md border border-[#1890ff] bg-blue-50/70 px-4 py-2 text-[14px] font-medium text-[#1890ff] shadow-xs transition hover:border-[#1890ff] hover:bg-[#1890ff] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1890ff]"
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{platform === 'pc' ? 'PC 公共配置' : 'APP 公共配置'}</span>
            </button>
          )}
          <button type="button" onClick={onSelectEntries}
            className="inline-flex min-h-[40px] max-w-full items-center justify-center gap-2 rounded-md bg-[#1890ff] px-4 py-2 text-[14px] font-medium text-white transition hover:bg-[#40a9ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1890ff] [overflow-wrap:anywhere]">
            <span aria-hidden="true" className="text-[18px] leading-none">＋</span>{isModules ? '选择模块' : '添加已有入口'}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 pb-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-[14px]">
          <label className="flex flex-wrap items-center gap-2 text-gray-600">排序方式
            <select aria-label="排序方式" value={isAutoSort ? 'auto_clicks' : 'manual'} onChange={(event) => onUpdateRoleRules({ userSort: event.target.value })}
              className="min-h-[36px] max-w-full rounded-md border border-gray-200 bg-white px-2 text-gray-800 focus:border-[#1890ff] focus:outline-none">
              <option value="manual">人工配置</option><option value="auto_clicks">按角色点击次数</option>
            </select>
          </label>
          {isAutoSort && <>
            <label className="flex flex-wrap items-center gap-2 text-gray-600">统计窗口
              <select aria-label="排序统计范围" value={autoPeriod} onChange={(event) => onUpdateRoleRules({ autoPeriod: event.target.value })}
                className="min-h-[36px] max-w-full rounded-md border border-gray-200 bg-white px-2 text-gray-800 focus:border-[#1890ff] focus:outline-none">
                <option value="7d">近7天</option><option value="30d">近30天</option><option value="all">累计</option>
              </select>
            </label>
            <span className="text-[12px] text-gray-400">{isDefaultUser ? '暂无点击数据' : '演示数据'} · 每月1日更新</span>
          </>}
        </div>

      </div>
      <div className="px-5">
                {/* APP 置顶超限可恢复提示 (R-018 / STATE-018 / AC-052) */}
                {platform === 'app' && pinnedCount > 5 && (
                  <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-[12px] text-amber-700 flex items-center justify-between">
                    <span>已置顶{pinnedCount}个，APP最多5个，请取消多余置顶后保存</span>
                  </div>
                )}

                {/* R-031：资料编辑与角色布局在同一张表操作。 */}
                <div className="overflow-x-auto border-t border-gray-100">
                  <table id={`${statusReasonId}-table`} className="w-full min-w-[1200px] text-[14px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/70 text-[12px] font-medium text-gray-500">
                        <th className="py-2.5 px-3 text-start w-20">{isAutoSort ? '展示顺序' : '顺序'}</th>
                        <th className="py-2.5 px-3 text-start">{isModules ? '模块名称' : '入口名称'}</th>
                        {isAutoSort && <th className="py-2.5 px-3 text-right w-28">{PERIOD_LABELS[autoPeriod]}点击次数</th>}
                        <th className="py-2.5 px-3 text-center w-20">Pro功能</th>
                        <th className="py-2.5 px-3 text-center w-28">是否展示角标</th>
                        <th className="py-2.5 px-3 text-start w-32">创建人</th>
                        <th className="py-2.5 px-3 text-start w-44">创建时间</th>
                        <th className="py-2.5 px-3 text-start w-36">限制产品组</th>
                        <th className="py-2.5 px-3 text-center w-40">展示开关</th>
                        <th className="py-2.5 px-3 text-center w-28">
                          <div>置顶</div>
                          {platform === 'app' && (
                            <div className={`text-[10px] font-normal ${pinnedCount > 5 ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                              已置顶 {pinnedCount}/5
                            </div>
                          )}
                        </th>
                        {!isAutoSort && <th className="py-2.5 px-3 text-center w-28">调整顺序</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeItems.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-16 text-center text-gray-400">
                            {isModules ? '暂无已选模块，可从上方选择' : '暂无已选入口，可从上方添加'}
                          </td>
                        </tr>
                      ) : (
                        displayRows.map(({ item, manualIndex, clicks, participates }, index) => {
                          const detail = getDetail(item.id);
                          const isVis = item.visible !== undefined ? Boolean(item.visible) : (item.defaultVisible !== 'no');
                          const displayName = item.name || detail.name;
                          const rawPro = detail.pro !== undefined ? detail.pro : item.pro;
                          let proText = '未配置';
                          if (rawPro === true || rawPro === 'yes') {
                            proText = '是';
                          } else if (rawPro === false || rawPro === 'no') {
                            proText = '否';
                          }
                          const showBadge = typeof detail.showBadge === 'boolean' ? detail.showBadge : Boolean(item.showBadge);
                          const createdBy = formatCreatedBy(detail.createdBy !== undefined ? detail.createdBy : item.createdBy);
                          const createdAt = formatCreatedAt(detail.createdAt !== undefined ? detail.createdAt : item.createdAt);
                          const rawProductGroup = detail.productGroup !== undefined ? detail.productGroup : item.productGroup;
                          const productGroupText = formatProductGroupLabel(rawProductGroup);
                          const fnTargetKey = getRoleStorageKey(detail.roleTarget || item.roleTarget);
                          const isItemMismatch = fnTargetKey && fnTargetKey !== 'all' && fnTargetKey !== getRoleStorageKey(currentRoleKey);
                          const globalDisabled = detail.globalEnabled === false;
                          const enableBlocked = globalDisabled || isItemMismatch || Boolean(detail.hasRoleDifferences);
                          const enableBlockedReason = [
                            globalDisabled ? '全局已停用，请在公共库恢复可用性' : '',
                            isItemMismatch ? `仅适用于${getRoleLabel(fnTargetKey)}` : '',
                            detail.hasRoleDifferences ? '存在历史角色差异，请先在公共库统一资料' : '',
                          ].filter(Boolean).join('；');

                          const nonPinnedIndex = item.isPinned ? -1 : nonPinnedRows.findIndex((r) => r.item.id === item.id);
                          const canMoveUp = !item.isPinned && nonPinnedIndex > 0;
                          const canMoveDown = !item.isPinned && nonPinnedIndex >= 0 && nonPinnedIndex < nonPinnedRows.length - 1;

                          return (
                            <tr
                              key={item.id}
                              data-entry-id={item.id}
                              className={`scroll-mb-80 transition sm:scroll-mb-64 ${highlightedEntryId === item.id ? 'bg-blue-50' : 'hover:bg-blue-50/30'}`}
                            >
                              <td className="py-3 px-3 text-[13px] text-gray-400 tabular-nums whitespace-nowrap">
                                <span>{isAutoSort ? (participates ? `第${index + 1}位` : '—') : `#${index + 1}`}</span>
                              </td>
                              <td
                                className="py-3 px-3"
                                title={displayName}
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium text-gray-900 min-w-0 [overflow-wrap:anywhere]" dir="auto">{displayName}</span>
                                  {item.isPinned && (
                                    <span className="px-1.5 py-0.2 rounded text-[11px] font-medium bg-blue-50 text-[#1890ff] shrink-0">
                                      置顶
                                    </span>
                                  )}
                                  {isItemMismatch && (
                                    <span
                                      className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 shrink-0"
                                      title={`此入口限定适用角色为【${getRoleLabel(detail.roleTarget || item.roleTarget)}】`}
                                    >
                                      不适用当前角色
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1 text-[12px] text-gray-400 break-all" dir="ltr">ID: {item.id}</div>
                              </td>
                              {isAutoSort && <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap" dir="ltr">{clicks === null ? '—' : `${clicks} 次`}</td>}
                              <td className="py-2.5 px-3 text-center">{proText}</td>
                              <td className="py-2.5 px-3 text-center">{showBadge ? '展示' : '不展示'}</td>
                              <td className="py-2.5 px-3 text-start" title={createdBy}>
                                <bdi className="block max-w-[12rem] [overflow-wrap:anywhere]">{createdBy}</bdi>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap"><bdi dir="ltr">{createdAt}</bdi></td>
                              <td className="py-2.5 px-3 text-start [overflow-wrap:anywhere]" title={productGroupText}>
                                <span>{productGroupText}</span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-label={`${getRoleLabel(currentRoleKey)} · ${platform === 'app' ? 'APP 工作台' : 'PC 工作台'} · ${sectionLabel}：${isModules ? '模块' : '入口'}“${displayName}”展示开关，当前${isVis ? '已开启' : '已关闭'}`}
                                  aria-checked={isVis ? 'true' : 'false'}
                                  aria-describedby={enableBlocked ? `${statusReasonId}-${manualIndex}` : undefined}
                                  disabled={globalDisabled || (!isVis && enableBlocked)}
                                  title={enableBlocked ? enableBlockedReason : undefined}
                                  onClick={() => onToggleRoleVisible(item.id)}
                                  className="inline-flex min-h-[44px] w-full min-w-0 flex-wrap items-center justify-center gap-2 rounded-lg px-2 py-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1890ff] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 transition"
                                >
                                  <span
                                    aria-hidden="true"
                                    className={`relative inline-flex h-4 w-8 flex-shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                      isVis ? 'justify-end bg-[#1890ff]' : 'justify-start bg-gray-300'
                                    }`}
                                  >
                                    <span
                                      className="pointer-events-none block h-3 w-3 flex-shrink-0 rounded-full bg-white shadow ring-0"
                                    />
                                  </span>
                                  <span className="min-w-0 leading-5 [overflow-wrap:anywhere]">{isVis ? '已开启' : '已关闭'}</span>
                                </button>
                                {enableBlocked && (
                                  <p id={`${statusReasonId}-${manualIndex}`} className="mt-1 text-[12px] leading-5 text-gray-500 [overflow-wrap:anywhere]">
                                    {globalDisabled ? '' : (isVis ? '限制原因：' : '无法开启：')}{enableBlockedReason}
                                  </p>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-label={`设置${isModules ? '模块' : '入口'}“${displayName}”置顶状态，当前${item.isPinned ? '已置顶' : '未置顶'}`}
                                  aria-checked={item.isPinned ? 'true' : 'false'}
                                  disabled={globalDisabled || ((!isVis || enableBlocked) && !item.isPinned)}
                                  title={globalDisabled || (!item.isPinned && enableBlocked) ? enableBlockedReason : undefined}
                                  onClick={() => onToggleRolePin(item.id)}
                                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1890ff] disabled:cursor-not-allowed disabled:opacity-50 transition"
                                >
                                  <span
                                    className={`relative inline-flex h-4 w-8 flex-shrink-0 items-center cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                      item.isPinned ? 'justify-end bg-[#1890ff]' : 'justify-start bg-gray-300'
                                    }`}
                                  >
                                    <span
                                      className="pointer-events-none block h-3 w-3 flex-shrink-0 rounded-full bg-white shadow ring-0"
                                    />
                                  </span>
                                </button>
                              </td>
                              {!isAutoSort && <td className="py-2.5 px-3 text-center">
                                <div className="inline-flex items-center justify-center rounded-md border border-gray-200 text-[14px]">
                                  <button
                                    type="button"
                                    disabled={!canMoveUp}
                                    onClick={() => onMoveRoleUp(item.id)}
                                    className="min-h-[44px] min-w-[44px] rounded-md text-gray-500 hover:bg-gray-50 hover:text-[#1890ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1890ff] disabled:opacity-25 disabled:cursor-not-allowed"
                                    title={item.isPinned ? '置顶项不支持移动' : '上移'}
                                    aria-label={`上移${displayName}`}
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    disabled={!canMoveDown}
                                    onClick={() => onMoveRoleDown(item.id)}
                                    className="min-h-[44px] min-w-[44px] rounded-md text-gray-500 hover:bg-gray-50 hover:text-[#1890ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1890ff] disabled:opacity-25 disabled:cursor-not-allowed"
                                    title={item.isPinned ? '置顶项不支持移动' : '下移'}
                                    aria-label={`下移${displayName}`}
                                  >
                                    ↓
                                  </button>
                                </div>
                              </td>}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

      </div>
      <footer className="sticky bottom-0 z-10 mt-4 border-t border-gray-200 bg-white px-5 py-3 shadow-[0_-4px_12px_-8px_rgba(15,23,42,0.18)]">
        {saveFeedback && <div className="max-h-44 overflow-y-auto text-[14px] leading-6">{saveFeedback}</div>}
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            disabled={!hasRoleDraftChanges || isSaving}
            onClick={onCancelRoleChanges}
            className="min-h-[40px] rounded-md border border-gray-300 px-5 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1890ff] transition"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!canSaveRoleConfig || isSaving}
            onClick={(event) => { if (event.detail < 2) onSaveRoleConfig(); }}
            className="min-h-[40px] rounded-md bg-[#1890ff] px-6 py-2 text-[14px] font-medium text-white hover:bg-[#40a9ff] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1890ff] transition"
          >
            {isSaving ? '保存中…' : '保存'}
          </button>
        </div>
      </footer>
    </section>
  );
}

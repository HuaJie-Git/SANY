import React, { useMemo } from 'react';

function formatToChineseDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}年${month}月${day}日`;
}

/** 排序方式与结果列表放在同一操作区。 */
export function RoleWorkbenchRules({ rules, onUpdateRules, showDemoLabel = true }) {
  const userSort = rules?.userSort === 'auto_clicks' ? 'auto_clicks' : 'manual';
  const radioId = React.useId();
  const autoPeriod = ['7d', '30d', 'all'].includes(rules?.autoPeriod) ? rules.autoPeriod : '30d';
  return (
    <div className="py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
      <fieldset className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="排序方式">
        <legend className="sr-only">排序方式</legend>
        <span aria-hidden="true" className="text-[12px] font-medium text-gray-600">排序方式</span>
        {[
          { value: 'manual', label: '人工配置' },
          { value: 'auto_clicks', label: '按角色点击次数' },
        ].map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-700">
            <input type="radio" name={`userSort-${radioId}`} value={option.value}
              checked={userSort === option.value}
              onChange={() => onUpdateRules({ userSort: option.value })}
              className="text-[#1890ff] focus:ring-0" />
            {option.label}
          </label>
        ))}
      </fieldset>
      {userSort === 'auto_clicks' && (
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-gray-500">
          <label className="flex flex-wrap items-center gap-2 text-gray-700">
            <span>排序统计范围</span>
            <select value={autoPeriod} onChange={(event) => onUpdateRules({ autoPeriod: event.target.value })}
              className="h-8 px-2 border border-gray-300 rounded-lg bg-white text-[12px] max-w-full">
              <option value="7d">近7天</option>
              <option value="30d">近30天</option>
              <option value="all">累计</option>
            </select>
          </label>
          <span>每月1日更新</span>
          {showDemoLabel && <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[11px]">演示数据</span>}
        </div>
      )}
    </div>
  );
}

function getStableSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getDemoClicksForEntry(entry, index, total, roleKey, plat, sec) {
  if (total > 2 && index === total - 1) {
    return { '7d': 0, '30d': 0, all: 0 };
  }
  const seed = getStableSeed(`${plat || ''}_${sec || ''}_${roleKey || ''}_${entry.id}`);
  const bucket = (seed + index * 11) % 100;
  let c7d;
  if (bucket < 18) {
    c7d = 0;
  } else if (bucket < 50) {
    c7d = 10 + (seed % 45);
  } else if (bucket < 82) {
    c7d = 60 + (seed % 240);
  } else {
    c7d = 320 + (seed % 680);
  }

  let c30d;
  if (c7d === 0) {
    c30d = (bucket < 9) ? 0 : 5 + (seed % 15);
  } else {
    const mult30 = 2 + (seed % 3);
    c30d = c7d * mult30 + (seed % 20);
  }

  let cAll;
  if (c30d === 0) {
    cAll = (bucket < 4) ? 0 : 10 + (seed % 30);
  } else {
    const multAll = 3 + (seed % 4);
    cAll = c30d * multAll + (seed % 50);
  }

  return { '7d': c7d, '30d': c30d, all: cAll };
}

/**
 * 点击统计组件 (R-011-B: 位于最下方，只读参考)
 */
export function RoleWorkbenchStats({
  platformLabel,
  sectionLabel,
  currentRoleKey,
  statsState,
  statPeriod = '30d',
  onStatPeriodChange,
  onRefreshStats,
  statsLoading,
  catalog = [],
  activeItems = [],
}) {
  const isDemo = !statsState?.hasData && !statsState?.hasError && (catalog.length > 0 || activeItems.length > 0);

  // 整理统计表格行数据：
  // 1. 当前端/区域的功能目录
  // 2. 当前配置中的自定义入口
  // 3. 统计快照中已下线的历史入口 (标记已下线)
  const combinedEntries = useMemo(() => {
    const list = [];
    const seenIds = new Set();

    catalog.forEach((item) => {
      seenIds.add(item.id);
      list.push({
        id: item.id,
        name: item.name,
        enName: item.enName,
        pro: Boolean(item.pro),
        isOffline: false,
      });
    });

    activeItems.forEach((item) => {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        list.push({
          id: item.id,
          name: item.name || item.id,
          enName: item.enName || item.id,
          pro: Boolean(item.pro),
          isOffline: false,
        });
      }
    });

    if (statsState?.records) {
      statsState.records.forEach((rec) => {
        if (!seenIds.has(rec.entryId)) {
          seenIds.add(rec.entryId);
          list.push({
            id: rec.entryId,
            name: rec.entryName || rec.entryId,
            enName: rec.entryId,
            pro: false,
            isOffline: true,
          });
        }
      });
    }

    const withClicks = list.map((entry, idx) => {
      let clicks = null;
      if (statsState?.hasData) {
        clicks = statsState.clicksMap[entry.id] ?? 0;
      } else if (isDemo) {
        const demoObj = getDemoClicksForEntry(entry, idx, list.length, currentRoleKey, platformLabel, sectionLabel);
        clicks = demoObj[statPeriod] ?? demoObj['30d'];
      }
      return {
        ...entry,
        clicks,
      };
    });

    if (statsState?.hasData || isDemo) {
      return [...withClicks].sort((a, b) => {
        const bC = b.clicks ?? 0;
        const aC = a.clicks ?? 0;
        return bC - aC;
      });
    }

    return withClicks;
  }, [catalog, activeItems, statsState, isDemo, currentRoleKey, platformLabel, sectionLabel, statPeriod]);

  const hasTableData = Boolean(statsState?.hasData || isDemo);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-5 mb-5 flex flex-col">
      {/* 统计头部 */}
      <div className="pb-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-gray-900">点击统计</h2>
            {isDemo ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                演示数据
              </span>
            ) : statsState?.isSample ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                示例数据
              </span>
            ) : null}
            {statsState?.isStale && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                数据未更新
              </span>
            )}
          </div>
          <p className="text-[12px] text-gray-400 mt-0.5">
            共 {combinedEntries.length} 个监测入口（只读参考，独立于排序规则）
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 查看统计范围 */}
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-gray-500 font-medium">查看统计范围:</span>
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-[11px]">
              {[
                { id: '7d', label: '近7天' },
                { id: '30d', label: '近30天' },
                { id: 'all', label: '累计' },
              ].map((p) => {
                const isActive = statPeriod === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => onStatPeriodChange(p.id)}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      isActive
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 刷新按钮: 刷新中明示并禁用重复点击 */}
          <button
            type="button"
            disabled={statsLoading}
            onClick={onRefreshStats}
            className="h-7 px-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md text-[12px] font-medium flex items-center gap-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="刷新当前统计数据"
          >
            <span>🔄</span> {statsLoading ? '刷新中...' : '刷新'}
          </button>
        </div>
      </div>

      {/* 错误提示与重试 */}
      {statsState?.hasError && (
        <div className="my-3 p-3 bg-red-50 border border-red-200 rounded-lg text-[12px] text-red-700 flex items-center justify-between shrink-0">
          <div>
            <span>⚠ {statsState.errorMessage || '统计数据读取失败'}</span>
            <span className="text-gray-400 text-[11px] ml-2">
              {statsState?.hasData ? '（已保留上一份快照，数据未更新）' : '（暂无可用缓存）'}
            </span>
          </div>
          <button
            type="button"
            disabled={statsLoading}
            onClick={onRefreshStats}
            className="underline font-semibold ml-3 shrink-0 text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {statsLoading ? '刷新中...' : '重试'}
          </button>
        </div>
      )}

      {/* 无数据状态: 完全无数据且无错误时，只用一条暂无点击数据空状态，不铺20行未知值；失败且无缓存时仅展示上方错误提示与重试 */}
      {!hasTableData ? (
        !statsState?.hasError && (
          <div className="my-8 py-12 text-center text-gray-400 text-[13px] bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            暂无点击数据
          </div>
        )
      ) : (
        /* 有可用数据（含有效最新数据或失败时保留的旧快照或演示数据）时，展示两列表格与数值/0 */
        <div className="max-h-[360px] overflow-y-auto overflow-x-auto py-1">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b border-gray-100 font-medium">
                <th className="py-2.5 px-3 text-left">入口名称</th>
                <th className="py-2.5 px-3 text-right w-32">点击次数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {combinedEntries.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-12 text-center text-gray-400 text-[12px]">
                    暂无入口
                  </td>
                </tr>
              ) : (
                combinedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-2.5 px-3" title={`${entry.name} · ID: ${entry.id}${entry.enName ? ` (${entry.enName})` : ''}`}>
                      <div className="flex items-center gap-2" dir="auto">
                        <span className="font-medium text-gray-800 truncate">
                          {entry.name}
                        </span>
                        {entry.isOffline && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-gray-100 text-gray-500 border border-gray-200">
                            已下线
                          </span>
                        )}
                        {entry.pro && (
                          <span className="px-1 py-0.5 rounded text-[9px] bg-purple-100 text-purple-700 font-bold">
                            Pro
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[12px] text-gray-800 font-semibold" dir="ltr">
                      {entry.clicks !== null && entry.clicks !== undefined ? entry.clicks.toLocaleString() : '--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 底部时间说明 (R-011-E: 底部无更新时间时不重复「暂无点击数据」) */}
      <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between shrink-0">
        {statsState?.hasData && statsState?.updatedAt ? (
          <span title={`完整时间: ${statsState.updatedAt}`}>
            数据更新时间: {formatToChineseDate(statsState.updatedAt)}
          </span>
        ) : isDemo ? (
          <span title="固定演示快照时间">
            数据更新时间: 2026年10月1日（演示快照）
          </span>
        ) : (
          <span />
        )}
        <span>按当前角色隔离</span>
      </div>
    </div>
  );
}

export default function RoleWorkbenchRulesAndStats(props) {
  return (
    <div>
      <RoleWorkbenchRules {...props} />
      <RoleWorkbenchStats {...props} />
    </div>
  );
}

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

/**
 * 展示规则组件 (R-011-B: 位于入口配置列表前)
 */
export function RoleWorkbenchRules({
  rules,
  onUpdateRules,
}) {
  const isClicksSortActive = rules.userSort === 'auto_clicks' || rules.newUserRule === 'clicks_rank';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-5 mb-5">
      <div className="pb-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-[15px] font-bold text-gray-900">展示规则</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">
            配置当前角色的入口排序方式及新用户初始规则
          </p>
        </div>
        <div className="text-[12px] text-gray-500">
          用户自行调整后保留个人顺序
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 入口排序方式 */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-800 mb-2">
            入口排序方式
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-700">
              <input
                type="radio"
                name="userSort"
                value="manual"
                checked={rules.userSort === 'manual'}
                onChange={() => onUpdateRules({ userSort: 'manual' })}
                className="text-[#1890ff] focus:ring-0 cursor-pointer"
              />
              <span>按手动顺序</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-700">
              <input
                type="radio"
                name="userSort"
                value="auto_clicks"
                checked={rules.userSort === 'auto_clicks'}
                onChange={() => onUpdateRules({ userSort: 'auto_clicks' })}
                className="text-[#1890ff] focus:ring-0 cursor-pointer"
              />
              <span>按角色点击次数</span>
            </label>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            {rules.userSort === 'auto_clicks'
              ? '置顶项固定在前；其余项按所选周期点击量排序，同次/无点击按手动顺序排列。'
              : '置顶项固定在前；其余项完全按下方手动顺序排列。'}
          </p>
        </div>

        {/* 新用户首次看到的顺序 */}
        <div>
          <label htmlFor="new-user-rule-select" className="block text-[13px] font-semibold text-gray-800 mb-2">
            新用户首次看到的顺序
          </label>
          <select
            id="new-user-rule-select"
            value={rules.newUserRule}
            onChange={(e) => onUpdateRules({ newUserRule: e.target.value })}
            className="w-full h-8 px-3 border border-gray-300 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:border-[#1890ff] bg-white"
          >
            <option value="manual">与本页手动顺序一致</option>
            <option value="clicks_rank">按角色点击排行</option>
            <option value="system_default">系统初始顺序</option>
          </select>
          <p className="text-[11px] text-gray-400 mt-1.5">
            {rules.newUserRule === 'system_default'
              ? '仅重排已添加的入口，自定义入口排在后面。'
              : '仅影响新用户首次进入时的顺序。'}
          </p>
        </div>

        {/* 自动排序参考范围 (仅当常规或新用户任一选择按点击排序时展示) */}
        {isClicksSortActive && (
          <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-200/80 flex flex-col justify-between">
            <div>
              <span className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                自动排序参考范围
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: '7d', label: '近7天' },
                  { id: '30d', label: '近30天' },
                  { id: 'all', label: '累计' },
                ].map((period) => {
                  const isActive = rules.autoPeriod === period.id;
                  return (
                    <button
                      type="button"
                      key={period.id}
                      onClick={() => onUpdateRules({ autoPeriod: period.id })}
                      className={`px-3 py-1 rounded text-[12px] font-medium transition ${
                        isActive
                          ? 'bg-[#1890ff] text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {period.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              点击排序以此周期的数据为参考基准。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 点击统计组件 (R-011-B: 位于最下方，只读参考)
 */
export function RoleWorkbenchStats({
  statsState,
  statPeriod,
  onStatPeriodChange,
  onRefreshStats,
  statsLoading,
  catalog = [],
  activeItems = [],
}) {
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

    const withClicks = list.map((entry) => {
      const clicks = statsState?.hasData ? (statsState.clicksMap[entry.id] ?? 0) : null;
      return {
        ...entry,
        clicks,
      };
    });

    if (statsState?.hasData) {
      return [...withClicks].sort((a, b) => {
        const bC = b.clicks ?? 0;
        const aC = a.clicks ?? 0;
        return bC - aC;
      });
    }

    return withClicks;
  }, [catalog, activeItems, statsState]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-5 mb-5 flex flex-col">
      {/* 统计头部 */}
      <div className="pb-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-gray-900">点击统计</h2>
            {statsState?.isSample && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                示例数据
              </span>
            )}
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
      {!statsState?.hasData ? (
        !statsState?.hasError && (
          <div className="my-8 py-12 text-center text-gray-400 text-[13px] bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            暂无点击数据
          </div>
        )
      ) : (
        /* 有可用数据（含有效最新数据或失败时保留的旧快照）时，展示两列表格与真实数值/0 */
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

      {/* 底部时间说明 (R-011-E: 底部无更新时间时不再重复「暂无点击数据」) */}
      <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between shrink-0">
        {statsState?.hasData && statsState?.updatedAt ? (
          <span title={`完整时间: ${statsState.updatedAt}`}>
            数据更新时间: {formatToChineseDate(statsState.updatedAt)}
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

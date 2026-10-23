import React, { useState, useMemo, useEffect } from 'react';
import { isImageValue } from '../../admin/roleWorkbenchEntries';
import { getRoleLabel } from '../../admin/roleWorkbench';

export default function RoleWorkbenchEntryManagement({
  platformLabel = 'APP 工作台',
  sectionLabel = '工作台入口',
  isModules = false,
  unifiedDirectory = [],
  onEditEntry,
  onNewEntry,
  hasSharedReadError = false,
  onRetrySharedRead,
  onBackToDefault,
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 当前目录中所有可用分类
  const categories = useMemo(() => {
    const set = new Set();
    unifiedDirectory.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['all', ...Array.from(set)];
  }, [unifiedDirectory]);

  // 切换区域/分类变化时校正失效分类，防止旧分类造成死空表 (R-014-D)
  useEffect(() => {
    if (selectedCategory !== 'all' && !categories.includes(selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [categories, selectedCategory]);

  // 过滤后的入口列表
  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return unifiedDirectory.filter((entry) => {
      const matchQ =
        !q ||
        (entry.name && entry.name.toLowerCase().includes(q)) ||
        (entry.enName && entry.enName.toLowerCase().includes(q)) ||
        (entry.id && entry.id.toLowerCase().includes(q));
      const matchCat = selectedCategory === 'all' || entry.category === selectedCategory;
      return matchQ && matchCat;
    });
  }, [unifiedDirectory, search, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* 首次使用 / 统一维护说明横条 (R-014-A, STATE-ENTRY-001, R-014-D, R-017) */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <span className="text-xl shrink-0">ℹ️</span>
          <div className="min-w-0">
            <h3 className="text-[14px] font-bold text-blue-900">入口资料统一维护</h3>
            <p className="text-[12px] text-blue-700 mt-0.5 break-words">
              入口资料统一维护，角色只需选用和排序。在此编辑的基础资料将同步更新【{platformLabel} · {sectionLabel}】内使用该入口的所有角色（包括专属配置与默认继承角色）。资料修改对使用此入口的角色同步生效。
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-[12px] text-blue-800 font-semibold bg-blue-100/70 border border-blue-200 px-3 py-1 rounded-full">
            当前区域共 {unifiedDirectory.length} 项入口
          </div>
          {onBackToDefault && (
            <button
              type="button"
              onClick={onBackToDefault}
              className="px-3 py-1 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg text-[12px] font-medium transition"
            >
              ← 返回默认列表
            </button>
          )}
        </div>
      </div>

      {/* 存储读取损坏提示 (STATE-ENTRY-001, AC-037) */}
      {hasSharedReadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-red-700">
          <div>
            <div className="text-[14px] font-bold mb-1">共享入口存储读取异常</div>
            <p className="text-[12px] text-red-600">
              检测到本地共享存储数据损坏，为保护已有数据已锁定共享写入，请点击右侧按钮重试读取。
            </p>
          </div>
          <button
            type="button"
            onClick={onRetrySharedRead}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[12px] font-medium transition"
          >
            重试读取
          </button>
        </div>
      )}

      {/* 搜索与新建栏 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="搜索入口名称、英文名或 ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 h-8 px-3 border border-gray-300 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1890ff] bg-white"
          />

          {categories.length > 2 && (
            <div className="flex items-center gap-1">
              <span className="text-[12px] text-gray-500 font-medium">分类:</span>
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                      selectedCategory === cat
                        ? 'bg-[#1890ff] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' ? '全部' : cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={hasSharedReadError}
          onClick={onNewEntry}
          className="h-8 px-3.5 bg-[#1890ff] hover:bg-[#40a9ff] text-white rounded-lg text-[13px] font-medium flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>+</span>
          <span>新建自定义{isModules ? '模块' : '入口'}</span>
        </button>
      </div>

      {/* 入口列表表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200/80 text-[12px] text-gray-500 font-semibold">
                <th className="py-3 px-4 w-16">图标</th>
                <th className="py-3 px-4">名称 / 英文名 / ID</th>
                <th className="py-3 px-4 w-28">分类</th>
                <th className="py-3 px-4 w-52">默认设置</th>
                <th className="py-3 px-4 w-60">使用角色</th>
                <th className="py-3 px-4 w-28 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <p className="text-[13px] mb-2">未找到匹配的入口</p>
                    {(search || selectedCategory !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch('');
                          setSelectedCategory('all');
                        }}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-[12px] transition"
                      >
                        清空筛选
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const hasIcon = Boolean(entry.icon);
                  const isImg = isImageValue(entry.icon);

                  return (
                    <tr key={entry.id} className="hover:bg-gray-50/70 transition">
                      {/* 图标列 */}
                      <td className="py-3 px-4">
                        {hasIcon ? (
                          isImg ? (
                            <img
                              src={entry.icon}
                              alt="icon"
                              className="w-9 h-9 object-contain rounded border border-gray-200/70 p-0.5 bg-white shrink-0"
                            />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[12px] text-gray-800 shrink-0"
                              style={{ backgroundColor: entry.color || '#e8f4fb' }}
                            >
                              {entry.icon}
                            </div>
                          )
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-[11px] text-gray-400 shrink-0">
                            无
                          </div>
                        )}
                      </td>

                      {/* 名称与ID */}
                      <td className="py-3 px-4">
                        <div
                          className="font-semibold text-gray-900 text-[13px] truncate max-w-[280px]"
                          title={entry.name}
                        >
                          {entry.name}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span title={entry.enName}>{entry.enName || '--'}</span>
                          <span>·</span>
                          <span>ID: {entry.id}</span>
                          {entry.hasRoleDifferences && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              存在角色差异
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 分类 */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-gray-100 text-gray-600 font-medium">
                          {entry.category || '其他'}
                        </span>
                      </td>

                      {/* 默认设置 */}
                      <td className="py-3 px-4">
                        <div className="text-[12px] text-gray-600 space-y-0.5">
                          <div>
                            默认显示:{' '}
                            <span className="font-medium text-gray-800">
                              {entry.defaultVisible === 'no' ? '隐藏' : '显示'}
                            </span>{' '}
                            · 建议位置:{' '}
                            <span className="font-mono text-gray-800">
                              {entry.sort !== undefined ? entry.sort : 10}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400">
                            适用角色:{' '}
                            {entry.roleTarget === 'all' || !entry.roleTarget
                              ? '全部角色'
                              : getRoleLabel(entry.roleTarget)}
                          </div>
                        </div>
                      </td>

                      {/* 使用角色 */}
                      <td className="py-3 px-4">
                        {entry.usedByRoles && entry.usedByRoles.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[240px]">
                            {entry.usedByRoles.map((r) => (
                              <span
                                key={r}
                                className="px-1.5 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[12px] text-gray-400">未被角色使用</span>
                        )}
                      </td>

                      {/* 操作 */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={hasSharedReadError}
                          onClick={() => onEditEntry(entry)}
                          className="px-2.5 py-1 text-[12px] font-medium text-[#1890ff] hover:bg-blue-50 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="编辑"
                          aria-label="编辑"
                        >
                          编辑
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import {
  ADMIN_ROLES,
  CATALOG_FUNCTIONS,
  INITIAL_ADMIN_ROLE_CONFIGS,
  readRoleConfigsFromStorage,
  saveRoleConfigsToStorage,
  getRoleRevision,
} from '../../admin/roleWorkbench';
import RoleWorkbenchDialog from './RoleWorkbenchDialog';

export default function RoleWorkbenchSettings() {
  const [roleConfigs, setRoleConfigs] = useState(() => readRoleConfigsFromStorage());
  const [currentRoleKey, setCurrentRoleKey] = useState('机手');
  const [activeItems, setActiveItems] = useState([]);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [revision, setRevision] = useState(() => getRoleRevision());
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('all');
  const [message, setMessage] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [demoState, setDemoState] = useState('normal'); // 'normal' | 'load_error' | 'forbidden' | 'conflict'

  // 加载当前角色的配置
  useEffect(() => {
    const roleConf = roleConfigs[currentRoleKey] || { items: [] };
    setActiveItems(roleConf.items || []);
    setHasDraftChanges(false);
  }, [currentRoleKey, roleConfigs]);

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    window.setTimeout(() => setMessage(null), 4000);
  };

  const currentRoleMeta = useMemo(() => {
    return roleConfigs[currentRoleKey] || {
      roleName: currentRoleKey,
      version: '--',
      revision: '--',
      updatedAt: '--',
      isConfigured: false,
      items: [],
    };
  }, [roleConfigs, currentRoleKey]);

  // 过滤左侧功能目录（支持名称、英文名及稳定功能 ID 搜索）
  const filteredCatalog = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    return CATALOG_FUNCTIONS.filter((fn) => {
      const matchQuery = !query ||
        fn.name.toLowerCase().includes(query) ||
        fn.enName.toLowerCase().includes(query) ||
        fn.id.toLowerCase().includes(query);
      const matchCategory = catalogCategory === 'all' || fn.category === catalogCategory;
      return matchQuery && matchCategory;
    });
  }, [catalogSearch, catalogCategory]);

  // 获取功能详细信息
  const getFunctionDetail = (id) => {
    return CATALOG_FUNCTIONS.find((f) => f.id === id) || {
      id,
      name: id,
      enName: id,
      category: '其他',
      color: '#f3f4f6',
      icon: '应用',
      pro: false,
    };
  };

  // 上移
  const moveUp = (index) => {
    if (index === 0) return;
    const next = [...activeItems];
    const [item] = next.splice(index, 1);
    next.splice(index - 1, 0, item);
    setActiveItems(next);
    setHasDraftChanges(true);
  };

  // 下移
  const moveDown = (index) => {
    if (index === activeItems.length - 1) return;
    const next = [...activeItems];
    const [item] = next.splice(index, 1);
    next.splice(index + 1, 0, item);
    setActiveItems(next);
    setHasDraftChanges(true);
  };

  // 移出工作台
  const removeItem = (id) => {
    setActiveItems(activeItems.filter((i) => i.id !== id));
    setHasDraftChanges(true);
  };

  // 切换运营置顶
  const togglePin = (id) => {
    const next = activeItems.map((item) => {
      if (item.id === id) {
        return { ...item, isPinned: !item.isPinned };
      }
      return item;
    });
    setActiveItems(next);
    setHasDraftChanges(true);
  };

  // 从目录添加功能到工作台
  const addFunctionToWorkbench = (fn) => {
    if (activeItems.some((i) => i.id === fn.id)) {
      showToast(`“${fn.name}”已在当前工作台中`, 'info');
      return;
    }
    const newItem = {
      id: fn.id,
      isPinned: false,
    };
    setActiveItems([...activeItems, newItem]);
    setHasDraftChanges(true);
    showToast(`已添加“${fn.name}”到工作台`, 'success');
  };

  // 保存当前角色配置
  const saveCurrentConfig = () => {
    // 模拟并发更新冲突（AC-007, STATE-001）
    if (demoState === 'conflict') {
      showToast('配置已在其他页面更新（版本冲突），请刷新后重试，当前草稿保留。', 'error');
      return;
    }

    try {
      const isFirstConfig = !currentRoleMeta.isConfigured || currentRoleMeta.version === '--';
      const nextVersion = isFirstConfig
        ? 'v1.0.0'
        : `v1.${parseInt(currentRoleMeta.version?.split('.')[1] || '0', 10) + 1}.0`;

      const nextRoleConf = {
        ...currentRoleMeta,
        version: nextVersion,
        updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
        updatedBy: '当前管理员',
        items: activeItems.map((item) => ({
          id: item.id,
          isPinned: Boolean(item.isPinned),
          custom: Boolean(item.custom),
          ...(item.name ? { name: item.name } : {}),
          ...(item.enName ? { enName: item.enName } : {}),
        })),
        isConfigured: true,
      };

      const nextAll = {
        ...roleConfigs,
        [currentRoleKey]: nextRoleConf,
      };

      saveRoleConfigsToStorage(nextAll);
      setRoleConfigs(nextAll);
      setRevision(getRoleRevision());
      setHasDraftChanges(false);
      showToast(`【${currentRoleKey}】角色工作台演示配置保存成功（本地演示），版本为 ${nextVersion}`);
    } catch {
      showToast('本地存储保存失败（存储空间不足或受限），请重试', 'error');
    }
  };

  // 取消本次修改
  const cancelChanges = () => {
    const roleConf = roleConfigs[currentRoleKey] || { items: [] };
    setActiveItems(roleConf.items || []);
    setHasDraftChanges(false);
    showToast('已取消本次修改', 'info');
  };

  // 恢复通用默认顺序（AC-008）
  const resetToSystemDefault = () => {
    const confirmed = window.confirm(`确定要将【${currentRoleKey}】的工作台顺序恢复为通用默认模板吗？`);
    if (!confirmed) return;
    const defaultConf = INITIAL_ADMIN_ROLE_CONFIGS[currentRoleKey] || { items: [] };
    const clonedItems = JSON.parse(JSON.stringify(defaultConf.items || []));
    setActiveItems(clonedItems);
    setHasDraftChanges(true);
    showToast(`已重置为【${currentRoleKey}】通用默认起点，点击保存演示配置后保存在此浏览器`, 'info');
  };

  // 保存多语言弹窗
  const handleSaveDialog = (formData) => {
    if (formData.id) {
      // 更新已有项
      setActiveItems(activeItems.map((i) => i.id === formData.id ? { ...i, ...formData } : i));
      showToast('功能配置已更新');
    } else {
      // 新增功能
      const newId = `custom-${Date.now().toString(36)}`;
      const newItem = {
        id: newId,
        name: formData.name,
        enName: formData.enName,
        isPinned: formData.isPinned || false,
        custom: true,
      };
      setActiveItems([newItem, ...activeItems]);
      showToast(`新增功能“${formData.name}”已加入工作台`);
    }
    setEditingItem(null);
    setHasDraftChanges(true);
  };

  // 角色草稿预览数据（R-005, AC-003: 纯后台完整配置列表预览，置顶项在前，普通项按配置顺序，不截断）
  const previewList = useMemo(() => {
    const pinned = activeItems.filter((i) => i.isPinned);
    const unpinned = activeItems.filter((i) => !i.isPinned);
    return [...pinned, ...unpinned].map((item, idx) => {
      const detail = getFunctionDetail(item.id);
      return {
        ...detail,
        sortNum: idx + 1,
        isPinned: Boolean(item.isPinned),
      };
    });
  }, [activeItems]);

  return (
    <div className="p-5 text-gray-800 bg-[#f5f7fa] min-h-screen">
      {/* 顶部标题与副标题 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">角色工作台配置</h1>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1890ff] text-[11px] font-medium border border-blue-200">
              本地原型演示
            </span>
          </div>
          <p className="text-[13px] text-gray-500 mt-0.5">配置各角色首次进入 APP 时的默认工作台顺序与置顶规则</p>
        </div>

        <div className="flex items-center gap-2">
          {/* 演示异常场景状态切换（AC-007, AC-009） */}
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-200 text-[12px] h-8">
            <span className="text-gray-500 font-medium">演示状态:</span>
            <select
              value={demoState}
              onChange={(e) => setDemoState(e.target.value)}
              className="border-none bg-transparent text-[12px] text-gray-700 focus:outline-none"
            >
              <option value="normal">正常状态</option>
              <option value="load_error">读取失败 (网络超时)</option>
              <option value="forbidden">无权限访问</option>
              <option value="conflict">并发更新冲突</option>
            </select>
          </div>
        </div>
      </div>

      {/* 业务规则明确说明横幅（R-002, AC-004） */}
      <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-lg text-[13px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-600">⚠ 业务规则提示:</span>
          <span>
            运营置顶与个人调整同级，冲突仲裁待确认 <code>[待确认]</code>；未调整用户的使用优化、统计窗口与有效使用算法待产品确认。
          </span>
        </div>
      </div>

      {/* 模拟读取失败异常处理（AC-009） */}
      {demoState === 'load_error' && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
          <div className="text-[16px] font-semibold mb-2">角色配置暂时无法读取（网络超时或接口异常）</div>
          <p className="text-[13px] text-red-500 mb-4">当前保留本地安全快照，您可以点击下方按钮重试读取最新配置。</p>
          <button
            type="button"
            onClick={() => { setDemoState('normal'); showToast('重试成功，已恢复正常配置'); }}
            className="px-5 py-1.5 bg-[#1890ff] text-white rounded text-[13px] font-medium"
          >
            重试读取配置
          </button>
        </div>
      )}

      {/* 模拟无权限异常处理（AC-009） */}
      {demoState === 'forbidden' && (
        <div className="mb-4 bg-gray-50 border border-gray-200 text-gray-700 p-6 rounded-lg text-center">
          <div className="text-[16px] font-semibold mb-2">您暂无角色工作台的配置权限</div>
          <p className="text-[13px] text-gray-500 mb-4">当前登录账号缺少 <code>workbench:config:manage</code> 权限点，请联系超级管理员开通。</p>
          <button
            type="button"
            onClick={() => { setDemoState('normal'); showToast('已切换至管理员权限'); }}
            className="px-5 py-1.5 border border-gray-300 rounded text-[13px] font-medium text-gray-700 hover:bg-gray-100"
          >
            申请开通权限 / 切换权限演示
          </button>
        </div>
      )}

      {demoState !== 'load_error' && demoState !== 'forbidden' && (
        <>
          {/* 角色选择切换卡片 */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200/80 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-gray-800">目标角色:</span>
                <div className="flex gap-2">
                  {ADMIN_ROLES.map((role) => {
                    const isSelected = currentRoleKey === role.name;
                    return (
                      <button
                        type="button"
                        key={role.id}
                        onClick={() => setCurrentRoleKey(role.name)}
                        className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition ${
                          isSelected
                            ? 'bg-[#1890ff] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {role.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-4 text-[12px] text-gray-500">
                <span>
                  状态: <strong className={currentRoleMeta.isConfigured ? 'text-green-600 font-semibold' : 'text-gray-500 font-semibold'}>
                    {currentRoleMeta.isConfigured ? '已配置' : '未配置 (通用默认)'}
                  </strong>
                </span>
                <span>当前版本: <strong className="text-gray-800 font-mono">{currentRoleMeta.version || '--'}</strong></span>
                <span>最后修改: <strong className="text-gray-800">{currentRoleMeta.updatedAt || '--'}</strong></span>
              </div>
            </div>

            <div className="text-[12px] text-gray-500 flex items-center justify-between">
              <span>角色画像定位: {ADMIN_ROLES.find((r) => r.name === currentRoleKey)?.desc}</span>
              <span className="text-gray-400">配置版本标识: {currentRoleMeta.isConfigured ? revision : '--'}</span>
            </div>
          </div>

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
              {message.type === 'error' && demoState === 'conflict' && (
                <button
                  type="button"
                  onClick={() => { setDemoState('normal'); showToast('已刷新载入最新版本', 'info'); }}
                  className="underline ml-3 font-semibold"
                >
                  刷新并载入最新配置
                </button>
              )}
            </div>
          )}

          {/* 主体左右三栏布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
            {/* 左侧：功能目录 (3列) */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200/80 p-4 flex flex-col h-[640px]">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-[15px] font-bold text-gray-900">功能目录</h2>
                <span className="text-[12px] text-gray-400">共 {filteredCatalog.length} 项</span>
              </div>

              {/* 搜索与分类 */}
              <div className="py-3 space-y-2 border-b border-gray-100">
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="搜索功能名称、ID 或英文名..."
                  className="w-full h-8 px-2.5 border border-gray-300 rounded text-[12px] focus:outline-none focus:border-[#1890ff]"
                />
                <select
                  value={catalogCategory}
                  onChange={(e) => setCatalogCategory(e.target.value)}
                  className="w-full h-7 px-2 border border-gray-300 rounded text-[12px] text-gray-600"
                >
                  <option value="all">全部分类</option>
                  <option value="服务">服务业务</option>
                  <option value="设备">设备与资产</option>
                  <option value="数据">数据报表</option>
                  <option value="工作">待办工作</option>
                  <option value="工具">工具组件</option>
                </select>
              </div>

              {/* 目录列表 */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100 py-1">
                {filteredCatalog.map((fn) => {
                  const isInCurrent = activeItems.some((i) => i.id === fn.id);
                  return (
                    <div key={fn.id} className="py-2.5 px-1 flex items-center justify-between hover:bg-gray-50/70">
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-medium text-gray-800 truncate" dir="auto">{fn.name}</span>
                          {fn.pro && <span className="px-1 py-0.2 rounded text-[9px] bg-purple-100 text-purple-700 font-bold">Pro</span>}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate mt-0.5">{fn.enName} · {fn.category}</div>
                      </div>
                      <button
                        type="button"
                        disabled={isInCurrent}
                        onClick={() => addFunctionToWorkbench(fn)}
                        className={`px-2 py-1 rounded text-[11px] font-medium shrink-0 transition ${
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

            {/* 中部：默认工作台顺序 (6列) */}
            <div className="lg:col-span-6 bg-white rounded-xl shadow-sm border border-gray-200/80 p-4 flex flex-col h-[640px]">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-[15px] font-bold text-gray-900">
                    【{currentRoleKey}】默认工作台顺序
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    前若干项为首页快捷入口；支持置顶与上下排序
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem({})}
                    className="h-8 px-3 bg-[#1890ff] text-white rounded text-[12px] font-medium hover:bg-[#40a9ff] flex items-center gap-1"
                  >
                    <span>+</span> 新增配置
                  </button>
                </div>
              </div>

              {/* 顺序表格 */}
              <div className="flex-1 overflow-y-auto overflow-x-auto py-2">
                <table className="w-full min-w-[540px] text-[12px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                      <th className="py-2.5 px-3 text-left w-12">序号</th>
                      <th className="py-2.5 px-3 text-left">功能名称</th>
                      <th className="py-2.5 px-3 text-center w-24">运营置顶</th>
                      <th className="py-2.5 px-3 text-center w-36">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-gray-400">
                          当前角色暂无配置项，请从左侧目录添加
                        </td>
                      </tr>
                    ) : (
                      activeItems.map((item, index) => {
                        const detail = getFunctionDetail(item.id);
                        return (
                          <tr key={item.id} className="hover:bg-gray-50/70 transition">
                            <td className="py-2.5 px-3 font-semibold text-gray-500">#{index + 1}</td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900" dir="auto">{detail.name}</span>
                                {item.isPinned && (
                                   <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-600">
                                     置顶
                                   </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-400">{detail.enName}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                role="switch"
                                aria-checked={Boolean(item.isPinned)}
                                aria-label={`设置功能“${detail.name}”的运营置顶，当前${item.isPinned ? '已置顶' : '未置顶'}`}
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
                                  onClick={() => setEditingItem({ ...detail, ...item })}
                                  className="text-[#1890ff] hover:underline px-1"
                                >
                                  编辑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-500 hover:underline px-1"
                                >
                                  移除
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

              {/* 底部保存与回退操作栏 */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={resetToSystemDefault}
                  className="text-[12px] text-gray-500 hover:text-gray-700 underline"
                >
                  恢复通用默认
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!hasDraftChanges}
                    onClick={cancelChanges}
                    className="h-8 px-4 border border-gray-300 rounded text-[13px] text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    取消修改
                  </button>
                  <button
                    type="button"
                    disabled={!hasDraftChanges}
                    onClick={saveCurrentConfig}
                    className="h-8 px-5 bg-[#1890ff] text-white rounded text-[13px] font-medium hover:bg-[#40a9ff] shadow-sm disabled:opacity-40"
                  >
                    保存演示配置 {hasDraftChanges ? '(草稿待存)' : ''}
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧：纯运营后台角色配置列表预览 (3列) */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200/80 p-4 flex flex-col h-[640px]">
              <div className="pb-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-[15px] font-bold text-gray-900">角色配置预览</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    【{currentRoleKey}】后台预览顺序 · 共 {previewList.length} 项
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                    hasDraftChanges
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : !currentRoleMeta.isConfigured
                        ? 'bg-gray-100 text-gray-600 border-gray-200'
                        : 'bg-green-50 text-green-700 border-green-200'
                  }`}
                >
                  {hasDraftChanges
                    ? '未保存草稿'
                    : !currentRoleMeta.isConfigured
                      ? '通用默认起点'
                      : '已保存角色配置'}
                </span>
              </div>

              {/* 纯后台完整配置列表预览（序号、功能名/ID、置顶标记） */}
              <div className="flex-1 overflow-y-auto py-1 divide-y divide-gray-100">
                {previewList.length === 0 ? (
                  <div className="py-16 text-center text-[12px] text-gray-400">
                    暂无配置项
                  </div>
                ) : (
                  previewList.map((item) => (
                    <div
                      key={item.id}
                      className="py-2.5 px-2 flex items-center justify-between text-[12px] hover:bg-gray-50/70 rounded transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                        <span className="font-semibold text-gray-400 text-[11px] w-6 shrink-0">
                          #{item.sortNum}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-800 truncate" dir="auto" title={item.name}>
                            {item.name}
                          </div>
                          <div className="font-mono text-[10px] text-gray-400 truncate">
                            {item.id}
                          </div>
                        </div>
                      </div>
                      {item.isPinned ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 shrink-0">
                          置顶
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-300 shrink-0">
                          默认
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* 规则说明与冲突仲裁提示 */}
              <div className="mt-3 p-2.5 bg-gray-50 rounded-lg text-[11px] text-gray-600 leading-relaxed border border-gray-100 shrink-0">
                <div className="mb-1 text-gray-700">
                  <strong className="text-red-600">运营置顶项</strong> 在角色配置中优先排列展示。
                </div>
                <div className="text-amber-700">
                  ⚠ <strong>冲突仲裁待确认</strong>：运营置顶与个人调整同级，同一位置冲突时不在此演示未确认的合并结果。
                </div>
              </div>
            </div>
          </div>

          {/* 底部：数据观察区 (R-005) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-4">
              <div>
                <h2 className="text-[16px] font-bold text-gray-900">
                  角色常用功能观察预留区 <span className="text-[13px] font-normal text-gray-500">（字段预留 · 待接入数据）</span>
                </h2>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  为后续角色化精细运营提供依据；真实埋点、统计窗口与有效使用定义待确认后接入，不展示伪造的近 30 天排行
                </p>
              </div>

              <span className="px-2.5 py-1 rounded bg-gray-100 text-gray-600 text-[12px] font-medium border border-gray-200">
                待接入数据
              </span>
            </div>

            {/* 真实埋点接入前显示空态与预留字段规范（R-003, R-005, AC-006） */}
            <div className="py-10 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-[14px] font-semibold text-gray-700 mb-1">【{currentRoleKey}】常用功能数据待接入</div>
              <p className="text-[12px] text-gray-400 max-w-md mx-auto mb-3">
                当前尚未打通生产端真实埋点数据。已预留分析字段：功能 ID / 名称、统计窗口、有效使用次数、活跃用户数及更新时间。待产品规则确认后接入。
              </p>
              <div className="inline-flex items-center gap-2 text-[11px] text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                <span>预留字段:</span>
                <span className="font-mono text-gray-700">role_id · function_id · window_days · valid_usage_count · active_users · updated_at</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 多语言新增/编辑配置弹窗 */}
      {editingItem && (
        <RoleWorkbenchDialog
          record={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveDialog}
        />
      )}
    </div>
  );
}

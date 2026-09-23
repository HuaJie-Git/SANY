import React, { useState, useEffect, useRef } from 'react';
import { GUEST_AUDIT_TAB_DEVICES } from '../../data/guestDemoData';

// 抽屉中的分类列表，严格按照截图1排序：设备异常、位置预警、维保事项、燃油异常、检查异常
const DRAWER_CATEGORIES = [
  { id: 'exception', name: '设备异常' },
  { id: 'location', name: '位置预警' },
  { id: 'maintenance', name: '维保事项' },
  { id: 'fuel', name: '燃油异常' },
  { id: 'check', name: '检查异常' },
];

export const EmptyBoxIllustration = () => (
  <div className="w-40 h-32 relative flex items-center justify-center">
    <svg width="150" height="120" viewBox="0 0 160 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 顶部起重横梁 */}
      <line x1="20" y1="12" x2="140" y2="12" stroke="#262626" strokeWidth="2.5" strokeLinecap="round" />
      {/* 吊绳下放 */}
      <line x1="80" y1="12" x2="80" y2="28" stroke="#737373" strokeWidth="1.5" />
      {/* 吊钩滑轮与钩体 */}
      <rect x="73" y="28" width="14" height="14" rx="2" fill="#E5E7EB" stroke="#737373" strokeWidth="1.5" />
      <path d="M80 42 C80 50 72 52 72 58 C72 63 77 65 82 64 C86 63 87 59 87 56" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />
      {/* 四角吊索 */}
      <line x1="80" y1="56" x2="38" y2="76" stroke="#737373" strokeWidth="1.5" />
      <line x1="80" y1="56" x2="122" y2="76" stroke="#737373" strokeWidth="1.5" />
      <line x1="80" y1="56" x2="52" y2="72" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="80" y1="56" x2="108" y2="72" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="2 2" />
      {/* 气流/装饰点 */}
      <circle cx="60" cy="58" r="2" stroke="#404040" strokeWidth="1.2" />
      <circle cx="118" cy="48" r="1.5" stroke="#737373" strokeWidth="1" />
      <path d="M112 59 Q120 57 126 62" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* 纸箱底部与侧面立体感 */}
      <path d="M52 72 L80 62 L108 72 L80 82 Z" fill="#94A3B8" opacity="0.5" />
      <path d="M38 76 L80 88 L80 112 L38 98 Z" fill="#1E293B" />
      <path d="M80 88 L122 76 L122 98 L80 112 Z" fill="#94A3B8" />
      <path d="M38 76 L80 88 L122 76" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
      {/* 开箱向外展开的箱盖折角 */}
      <path d="M38 76 L48 68 L78 78 L68 85 Z" fill="#64748B" />
      <path d="M122 76 L112 68 L82 78 L92 85 Z" fill="#CBD5E1" />
    </svg>
  </div>
);

const CategoryDrawer = ({
  isOpen,
  onClose,
  activeTab,
  onSelectCategory,
  categories = DRAWER_CATEGORIES,
  onSaveOrder,
}) => {
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [draftCategories, setDraftCategories] = useState(categories);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const touchStartYRef = useRef(0);
  const touchStartIndexRef = useRef(null);

  useEffect(() => {
    setDraftCategories(categories);
    if (!isOpen) {
      setIsReorderMode(false);
      setDragIndex(null);
      setOverIndex(null);
    }
  }, [categories, isOpen]);

  if (!isOpen) return null;

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch {
      // ignore
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (overIndex !== index) {
      setOverIndex(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === undefined) return;
    if (dragIndex !== targetIndex) {
      const newOrder = [...draftCategories];
      const [moved] = newOrder.splice(dragIndex, 1);
      newOrder.splice(targetIndex, 0, moved);
      setDraftCategories(newOrder);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleTouchStart = (e, index) => {
    touchStartYRef.current = e.touches[0].clientY;
    touchStartIndexRef.current = index;
    setDragIndex(index);
  };

  const handleTouchMove = (e) => {
    if (touchStartIndexRef.current === null) return;
    const touch = e.touches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const row = targetElement?.closest('[data-category-index]');
    if (row) {
      const targetIndex = parseInt(row.getAttribute('data-category-index'), 10);
      if (!isNaN(targetIndex) && targetIndex !== touchStartIndexRef.current) {
        const fromIndex = touchStartIndexRef.current;
        setDraftCategories((prev) => {
          const updated = [...prev];
          const [moved] = updated.splice(fromIndex, 1);
          updated.splice(targetIndex, 0, moved);
          return updated;
        });
        touchStartIndexRef.current = targetIndex;
        setDragIndex(targetIndex);
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleSave = () => {
    onSaveOrder?.(draftCategories);
    setIsReorderMode(false);
    onClose();
  };

  const handleCancel = () => {
    setDraftCategories(categories);
    setIsReorderMode(false);
  };

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      {/* 遮罩背景：全屏平滑遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={() => {
          handleCancel();
          onClose();
        }}
        aria-label="关闭抽屉"
      />

      {/* 抽屉内容 - 右侧滑入，对齐截图与真实APP视觉 */}
      <div className="relative z-10 w-[75%] max-w-[305px] mt-[44px] mb-[56px] bg-white rounded-tl-[24px] rounded-bl-[24px] shadow-2xl flex flex-col overflow-hidden">
        {!isReorderMode ? (
          <>
            {/* 顶部标题与关闭按钮 */}
            <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-gray-100 flex-shrink-0">
              <div className="w-7" />
              <h2 className="text-[17px] font-bold text-gray-900 text-center flex-1">全部大类</h2>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full active:bg-gray-100"
                aria-label="关闭"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 列表区域 */}
            <div className="flex-1 overflow-y-auto px-5 divide-y divide-gray-100">
              {categories.map((item) => {
                const isSelected = activeTab === item.id || activeTab === item.name;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectCategory(item.id);
                      onClose();
                    }}
                    className="flex items-center justify-between py-4 cursor-pointer active:bg-gray-50 transition-colors"
                  >
                    <span className={`text-[16px] ${isSelected ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                      {item.name}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#1e2329] flex items-center justify-center text-white flex-shrink-0 shadow-2xs">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 底部固定红色调整顺序按钮 */}
            <div className="p-4 pb-5 border-t border-gray-100 flex-shrink-0 bg-white">
              <button
                type="button"
                onClick={() => {
                  setDraftCategories([...categories]);
                  setIsReorderMode(true);
                }}
                className="w-full py-3 bg-[#C41421] text-white font-medium rounded-xl text-center text-[15px] shadow-sm active:bg-[#A8101C] transition-colors cursor-pointer"
              >
                调整顺序
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 调整顺序视图：顶部标题与关闭 */}
            <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-gray-100 flex-shrink-0">
              <div className="w-7" />
              <h2 className="text-[17px] font-bold text-gray-900 text-center flex-1">全部大类</h2>
              <button
                type="button"
                onClick={() => {
                  handleCancel();
                  onClose();
                }}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full active:bg-gray-100"
                aria-label="关闭"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 排序列表 */}
            <div
              className="flex-1 overflow-y-auto px-6 divide-y divide-[#F0F2F5] touch-none select-none"
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {draftCategories.map((item, index) => {
                const isDragging = dragIndex === index;
                const isOver = overIndex === index;
                return (
                  <div
                    key={item.id}
                    data-category-index={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onTouchStart={(e) => handleTouchStart(e, index)}
                    className={`flex items-center py-4.5 cursor-grab active:cursor-grabbing transition-colors ${
                      isDragging ? 'opacity-40 bg-gray-50' : ''
                    } ${isOver ? 'border-t-2 border-[#C41421]' : ''}`}
                  >
                    {/* 6点把手图标 */}
                    <div className="flex items-center justify-center mr-4 text-[#C4C7CE] flex-shrink-0">
                      <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
                        <circle cx="3" cy="3" r="1.5" fill="currentColor" />
                        <circle cx="9" cy="3" r="1.5" fill="currentColor" />
                        <circle cx="3" cy="9" r="1.5" fill="currentColor" />
                        <circle cx="9" cy="9" r="1.5" fill="currentColor" />
                        <circle cx="3" cy="15" r="1.5" fill="currentColor" />
                        <circle cx="9" cy="15" r="1.5" fill="currentColor" />
                      </svg>
                    </div>
                    {/* 大类名称 */}
                    <span className="text-[16px] font-normal text-[#1D2129] select-none">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 底部取消与保存按钮 */}
            <div className="p-4 pb-4 flex items-center gap-3 flex-shrink-0 bg-white">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3.5 bg-[#F4F5F7] text-[#1D2129] font-medium rounded-[14px] text-center text-[15px] active:bg-gray-200 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-3.5 bg-[#C41421] text-white font-medium rounded-[14px] text-center text-[15px] shadow-sm active:bg-[#A8101C] transition-colors cursor-pointer"
              >
                保存
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const BaselineAudit = ({ onDeviceClick, initialTab, navigationContext, searchQuery: _searchQuery = '' }) => {
  // Tab名称到ID的映射
  const tabNameToId = {
    '设备异常': 'exception',
    '维保事项': 'maintenance',
    '燃油异常': 'fuel',
    '位置预警': 'location',
    '检查异常': 'check',
    'check': 'check',
    'exception': 'exception',
    'maintenance': 'maintenance',
    'fuel': 'fuel',
    'location': 'location',
  };

  const getInitialTab = () => {
    if (initialTab && tabNameToId[initialTab]) {
      return tabNameToId[initialTab];
    }
    return 'exception';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [dateRange] = useState('12/10 - 12/20');
  const [groupByDevice, setGroupByDevice] = useState(true);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [toastHint, setToastHint] = useState('');

  const showToast = (msg) => {
    setToastHint(msg);
    window.setTimeout(() => setToastHint(''), 1600);
  };

  // 大类排序状态
  const [categories, setCategories] = useState(DRAWER_CATEGORIES);

  // Tab数据：根据 categories 动态排序
  const tabs = categories.map((cat) => {
    if (cat.id === 'exception') return { ...cat, count: 5 };
    if (cat.id === 'maintenance') return { ...cat, count: 99, isOver99: true };
    if (cat.id === 'fuel') return { ...cat, count: 0 };
    if (cat.id === 'location') return { ...cat, count: 1 };
    if (cat.id === 'check') return { ...cat, count: 2 };
    return { ...cat, count: 0 };
  });

  // 维保事项数据 - 与截图完全一致，命名方式统一
  const maintenanceDevices = [
    {
      id: 1,
      name: 'LFXAH95W7P...',
      type: '挖掘机',
      image: 'images/审核/挖掘机.jpg',
      newCount: 99,
      newCountText: '99+ 新',
      newCountColor: 'bg-green-100 text-green-600',
      extraNewCount: 99,
      extraNewCountText: '99+',
      extraNewCountColor: 'bg-red-100 text-red-600',
      status: [
        { type: 'overdue', text: '逾期：1', color: 'text-red-500' }
      ]
    },
    {
      id: 2,
      name: 'BTXAH95WP9...',
      type: '起重机',
      image: 'images/审核/起重机.jpg',
      newCount: 7,
      newCountText: '7 新',
      newCountColor: 'bg-green-100 text-green-600',
      extraNewCount: null,
      extraNewCountText: null,
      extraNewCountColor: null,
      status: [
        { type: 'near', text: '临近：1,230', color: 'text-orange-500' }
      ]
    },
    {
      id: 3,
      name: 'CFXAH95W8P...',
      type: '搅拌车',
      image: 'images/审核/搅拌车.jpg',
      newCount: 10,
      newCountText: '10 新',
      newCountColor: 'bg-green-100 text-green-600',
      extraNewCount: 10,
      extraNewCountText: '10',
      extraNewCountColor: 'bg-red-100 text-red-600',
      status: [
        { type: 'overdue', text: '逾期：10', color: 'text-red-500' }
      ]
    },
    {
      id: 4,
      name: 'DFXAH95W9P...',
      type: '搅拌车',
      image: 'images/审核/搅拌车.jpg',
      newCount: 99,
      newCountText: '99+ 新',
      newCountColor: 'bg-green-100 text-green-600',
      extraNewCount: 99,
      extraNewCountText: '99+',
      extraNewCountColor: 'bg-red-100 text-red-600',
      status: [
        { type: 'overdue', text: '逾期：2', color: 'text-red-500' },
        { type: 'near', text: '临期：24...', color: 'text-orange-500' }
      ]
    },
    {
      id: 5,
      name: 'EFXAH95W10P...',
      type: '挖掘机',
      image: 'images/审核/挖掘机.jpg',
      newCount: 9,
      newCountText: '9 新',
      newCountColor: 'bg-green-100 text-green-600',
      extraNewCount: 2,
      extraNewCountText: '2',
      extraNewCountColor: 'bg-red-100 text-red-600',
      status: [
        { type: 'overdue', text: '逾期：1', color: 'text-red-500' }
      ]
    }
  ];

  // 设备异常数据 - 命名方式统一，没有逾期状态
  const exceptionDevices = [
    {
      id: 1,
      name: 'LFXAH95W7P...',
      type: '挖掘机',
      image: 'images/审核/挖掘机.jpg',
      newCount: 99,
      newCountText: '99+ 新',
      newCountColor: 'bg-green-100 text-green-600',
      extraNewCount: 99,
      extraNewCountText: '99+',
      extraNewCountColor: 'bg-red-100 text-red-600',
      status: []
    },
    {
      id: 2,
      name: 'BTXAH95WP9...',
      type: '起重机',
      image: 'images/审核/起重机.jpg',
      newCount: 16,
      newCountText: '16',
      newCountColor: 'bg-red-100 text-red-600',
      extraNewCount: null,
      extraNewCountText: null,
      extraNewCountColor: null,
      status: []
    },
    {
      id: 3,
      name: 'CFXAH95W8P...',
      type: '搅拌车',
      image: 'images/审核/搅拌车.jpg',
      newCount: 10,
      newCountText: '10 新',
      newCountColor: 'bg-green-100 text-green-600',
      extraNewCount: 10,
      extraNewCountText: '10',
      extraNewCountColor: 'bg-red-100 text-red-600',
      status: []
    },
    {
      id: 4,
      name: 'DFXAH95W9P...',
      type: '搅拌车',
      image: 'images/审核/搅拌车.jpg',
      newCount: 99,
      newCountText: '99+ 新',
      newCountColor: 'bg-green-100 text-green-600',
      extraNewCount: 4,
      extraNewCountText: '4',
      extraNewCountColor: 'bg-red-100 text-red-600',
      status: []
    },
    {
      id: 5,
      name: 'EFXAH95W10P...',
      type: '挖掘机',
      image: 'images/审核/挖掘机.jpg',
      newCount: 9,
      newCountText: '9 新',
      newCountColor: 'bg-green-100 text-green-600',
      extraNewCount: 2,
      extraNewCountText: '2',
      extraNewCountColor: 'bg-red-100 text-red-600',
      status: []
    }
  ];

  // 燃油异常数据
  const fuelDevices = [];

  // 位置预警数据
  const locationDevices = [];

  // 根据Tab获取设备数据
  const getDevices = () => {
    switch (activeTab) {
      case 'exception':
        return exceptionDevices;
      case 'maintenance':
        return maintenanceDevices;
      case 'fuel':
        return fuelDevices;
      case 'location':
        return locationDevices;
      case 'check':
        return [];
      default:
        return exceptionDevices;
    }
  };

  const contextualAuditDevice = navigationContext?.kind === 'audit' && navigationContext.item
    ? {
        id: `context-${navigationContext.item.id}`,
        name: navigationContext.item.code,
        type: navigationContext.item.name,
        image: navigationContext.item.image,
        newCountText: navigationContext.item.status || '待处理',
        newCountColor: navigationContext.item.status === '已处理' ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-600',
        extraNewCountText: null,
        status: [],
        isContextTarget: true,
      }
    : null;
  const devices = contextualAuditDevice ? [contextualAuditDevice, ...getDevices()] : getDevices();
  const baselineEvents = devices.map((device, index) => ({
    device,
    event: {
      id: `bl-${device.id}-${index}`,
      tag: '故障码',
      title: '制动开关信号故障(SPN 522738 FMI 12)',
      time: '2026-09-15 13:01:47 (UTC+7)',
    },
  }));

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* Tab切换 - 顶上去 */}
      <div className="bg-white px-4 py-3 relative">
        <div className="flex items-center gap-2 overflow-x-auto pr-8" style={{ WebkitOverflowScrolling: 'touch' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className={`ml-1 ${activeTab === tab.id ? 'text-white' : tab.isOver99 ? 'text-red-500' : 'text-gray-500'}`}>
                  {tab.isOver99 ? '(99+)' : `(${tab.count})`}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* 筛选按钮 - 固定在右侧，覆盖在Tab上方 */}
        <button
          type="button"
          onClick={() => setIsCategoryDrawerOpen(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white z-10 rounded-full active:bg-gray-100"
          aria-label="全部大类"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>

      {/* 日期选择和分组开关 - 与截图样式一致 */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-100">
        <div className="flex items-center">
          <button className="flex items-center text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5">
            {dateRange}
            <svg className="w-4 h-4 ml-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-700 mr-2">按设备分组</span>
          <button
            onClick={() => setGroupByDevice(!groupByDevice)}
            className={`w-12 h-6 rounded-full relative transition-colors ${
              groupByDevice ? 'bg-red-500' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
              groupByDevice ? 'translate-x-6' : 'translate-x-0.5'
            }`}></div>
          </button>
        </div>
      </div>

      {/* 设备列表 */}
      <div className="px-4 py-3 space-y-3">
        {!groupByDevice ? (
          baselineEvents.map(({ device, event }) => (
            <div
              key={event.id}
              onClick={() => onDeviceClick && onDeviceClick(device)}
              className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100/80 cursor-pointer active:bg-gray-50 transition-colors"
            >
              {/* 顶部设备信息行 */}
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={device.image}
                    alt={device.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <span className="text-[14px] font-bold text-gray-900 ml-2 truncate">
                  {device.name}
                </span>
                <span className="text-[13px] text-gray-400 font-normal ml-2 truncate">
                  {device.type}
                </span>
              </div>

              {/* 故障类型/标题 */}
              <div className="text-[16px] font-bold text-gray-900 mb-1">
                {event.tag}
              </div>

              {/* 故障具体描述 */}
              <div className="text-[14px] text-gray-800 leading-snug mb-2 font-normal">
                {event.title}
              </div>

              {/* 发生时间 */}
              <div className="flex items-center text-[12px] text-gray-400 mb-3">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{event.time}</span>
              </div>

              {/* 分隔线与底部操作按钮 */}
              <div className="border-t border-gray-100 pt-3 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast('已确认');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 text-[12px] font-medium text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-gray-800 flex items-center justify-center text-white flex-shrink-0">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>确认</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast('服务召请');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 text-[12px] font-medium text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  <span>服务召请</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast('更多操作');
                  }}
                  className="flex items-center justify-center px-3 py-1.5 rounded-full border border-gray-200 text-[12px] font-medium text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                  aria-label="更多操作"
                >
                  <span className="tracking-widest font-bold text-gray-600 leading-none">•••</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          devices.map((device) => (
            <div
              key={device.id}
              className={`rounded-xl p-3 flex items-center shadow-sm cursor-pointer ${device.isContextTarget ? 'bg-[#fff3f4] ring-1 ring-[#f4c8cd]' : 'bg-white'}`}
              onClick={() => onDeviceClick && onDeviceClick(device)}
            >
              {/* 设备图片 */}
              <div className="w-16 h-12 bg-gray-50 rounded-lg flex items-center justify-center mr-3 overflow-hidden flex-shrink-0">
                <img
                  src={device.image}
                  alt={device.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden items-center justify-center w-full h-full">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* 设备信息 */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 mb-0.5 truncate">{device.name}</div>
                <div className="text-xs text-gray-500 mb-1">{device.type}</div>
                {/* 状态信息 */}
                {device.status && device.status.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {device.status.map((status, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0 ${
                          status.type === 'overdue' ? 'bg-red-500' : 'bg-orange-500'
                        }`}></div>
                        <span className={`text-[10px] ${status.color} whitespace-nowrap`}>{status.text}</span>
                        {index < device.status.length - 1 && (
                          <span className="text-gray-300 mx-1">|</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 新消息标签 */}
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${device.newCountColor}`}>
                  {device.newCountText}
                </span>
                {device.extraNewCountText && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${device.extraNewCountColor}`}>
                    {device.extraNewCountText}
                  </span>
                )}
              </div>

              {/* 箭头 */}
              <svg className="w-4 h-4 text-gray-400 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          ))
        )}
        {devices.length === 0 && (
          <div className="rounded-xl bg-white py-12 text-center text-[13px] text-gray-400">当前分类暂无审核事件</div>
        )}
      </div>

      {/* 提示气泡 */}
      {toastHint && (
        <div role="status" className="absolute bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-[12px] text-white shadow-lg pointer-events-none">
          {toastHint}
        </div>
      )}

      {/* 全部大类抽屉 */}
      <CategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        activeTab={activeTab}
        onSelectCategory={(catId) => setActiveTab(catId)}
        categories={categories}
        onSaveOrder={(newCats) => {
          setCategories(newCats);
          showToast('大类排序已更新');
        }}
      />
    </div>
  );
};




const TAB_NAME_MAP = {
  '设备异常': 'exception',
  '位置预警': 'location',
  '维保事项': 'maintenance',
  '燃油异常': 'fuel',
  '检查异常': 'check',
  'exception': 'exception',
  'location': 'location',
  'maintenance': 'maintenance',
  'fuel': 'fuel',
  'check': 'check',
};

const TAB_DEVICES = GUEST_AUDIT_TAB_DEVICES;

const GuestAudit = ({ onDeviceClick, initialTab, navigationContext, searchQuery = '', demoMode = true, onRequireLogin }) => {
  const getInitialTab = () => {
    if (initialTab && TAB_NAME_MAP[initialTab]) {
      return TAB_NAME_MAP[initialTab];
    }
    return 'exception';
  };

  const [categories, setCategories] = useState(DRAWER_CATEGORIES);

  const auditTabs = categories.map((cat) => {
    if (cat.id === 'exception') return { ...cat, count: 6 };
    if (cat.id === 'check') return { ...cat, count: 2 };
    if (cat.id === 'location') return { ...cat, count: 0 };
    if (cat.id === 'maintenance') return { ...cat, count: 0 };
    if (cat.id === 'fuel') return { ...cat, count: 0 };
    return { ...cat, count: 0 };
  });

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [groupByDevice, setGroupByDevice] = useState(true);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [filterHint, setFilterHint] = useState('');

  const showFilterHint = (message) => {
    setFilterHint(message);
    window.setTimeout(() => setFilterHint(''), 1600);
  };

  const handleToggleGroupByDevice = () => {
    setGroupByDevice((prev) => !prev);
  };

  // 支持从消息中心或跳转上下文带入的目标条目
  const contextualAuditDevice =
    navigationContext?.kind === 'audit' && navigationContext.item
      ? {
          id: `context-${navigationContext.item.id}`,
          code: navigationContext.item.code,
          name: navigationContext.item.code,
          displayName: navigationContext.item.code,
          title: navigationContext.item.code,
          subtitle: navigationContext.item.name || 'Sany 设备',
          type: navigationContext.item.name || 'Sany 设备',
          image: navigationContext.item.image || 'images/img_dumptruck.jpg',
          newBadge: navigationContext.item.status || '待处理',
          countBadge: 1,
          activeCategory: activeTab,
          categoryName: categories.find((t) => t.id === activeTab)?.name || '设备异常',
          isContextTarget: true,
        }
      : null;

  const currentCategoryDevices = TAB_DEVICES[activeTab] || [];
  const sourceDevices = contextualAuditDevice
    ? [contextualAuditDevice, ...currentCategoryDevices]
    : currentCategoryDevices;

  const keyword = searchQuery.trim().toLowerCase();
  const filteredDevices = sourceDevices.filter((device) => {
    if (!keyword) return true;
    const searchTarget = `${device.title || ''} ${device.code || ''} ${device.subtitle || ''} ${device.name || ''}`.toLowerCase();
    return searchTarget.includes(keyword);
  });

  const allEvents = sourceDevices.flatMap((device) => {
    const devEvents = device.events && device.events.length > 0
      ? device.events
      : [
          {
            id: `${device.id || device.code}-ev-1`,
            tag: activeTab === 'check' ? '检查需处理' : '故障码',
            title: `${device.title || device.name} 状态异常需处理`,
            time: '2026-09-23 08:30 (UTC+8)',
            isNew: true,
          },
        ];
    return devEvents.map((event) => ({ device, event }));
  });

  const filteredEvents = allEvents.filter(({ device, event }) => {
    if (!keyword) return true;
    const searchTarget = `${device.title || ''} ${device.code || ''} ${device.subtitle || ''} ${device.name || ''} ${event.tag || ''} ${event.title || ''}`.toLowerCase();
    return searchTarget.includes(keyword);
  });

  return (
    <div className="h-full bg-[#F5F6F8] flex flex-col overflow-hidden">
      {/* 顶部固定区域：Tab 标签栏 + 过滤选项 */}
      <div className="bg-white flex-shrink-0 border-b border-gray-100">
        {/* Tab 栏 */}
        <div className="px-4 py-2 flex items-center justify-between">
          <div
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {auditTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#222831] text-white shadow-xs'
                      : 'bg-[#F5F6F8] text-gray-700 hover:bg-gray-200/70'
                  }`}
                >
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span
                      className={`ml-1 font-semibold ${
                        isActive ? 'text-white' : 'text-[#EA3D4B]'
                      }`}
                    >
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 右侧汉堡菜单按钮 */}
          <button
            type="button"
            onClick={() => setIsCategoryDrawerOpen(true)}
            className="w-8 h-8 rounded-full bg-[#F5F6F8] flex items-center justify-center flex-shrink-0 text-gray-700 ml-1.5 active:bg-gray-200"
            aria-label="全部大类"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 日期选择与分组开关 */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => showFilterHint('日期范围：8-22 至 9-21')}
            className="flex items-center gap-1 text-[12px] text-gray-700 bg-white border border-gray-200 rounded-full px-3 py-1 shadow-2xs hover:bg-gray-50 active:bg-gray-100"
          >
            <span>8-22 至 9-21</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-gray-700">按设备分组</span>
            <button
              type="button"
              onClick={handleToggleGroupByDevice}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                groupByDevice ? 'bg-[#E60012]' : 'bg-gray-300'
              }`}
              aria-label="按设备分组开关"
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  groupByDevice ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 列表内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {!groupByDevice ? (
          filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <EmptyBoxIllustration />
              <p className="text-[13px] text-gray-400 mt-2 font-normal">
                {keyword ? '未找到匹配的事件' : '暂无数据'}
              </p>
            </div>
          ) : (
            filteredEvents.map(({ device, event }) => (
              <div
                key={event.id}
                onClick={() => {
                  onDeviceClick?.({ ...device, activeCategory: activeTab, categoryName: categories.find((t) => t.id === activeTab)?.name || '设备异常' });
                }}
                className={`bg-white rounded-2xl p-4 shadow-2xs border border-gray-100/80 cursor-pointer active:bg-gray-50 transition-colors ${
                  device.isContextTarget ? 'ring-1 ring-[#f4c8cd] bg-[#fff3f4]' : ''
                }`}
              >
                {/* 顶部设备信息行 */}
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 rounded bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={device.image}
                      alt={device.title || device.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="text-[14px] font-bold text-gray-900 ml-2 truncate">
                    {device.title || device.name || device.code}
                  </span>
                  <span className="text-[13px] text-gray-400 font-normal ml-2 truncate">
                    {device.subtitle || device.type}
                  </span>
                </div>

                {/* 故障类型/标签 */}
                <div className="text-[16px] font-bold text-gray-900 mb-1">
                  {event.tag}
                </div>

                {/* 故障具体描述 */}
                <div className="text-[14px] text-gray-800 leading-snug mb-2 font-normal">
                  {event.title}
                </div>

                {/* 发生时间 */}
                <div className="flex items-center text-[12px] text-gray-400 mb-3">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5 flex-shrink-0 text-gray-400">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{event.time}</span>
                </div>

                {/* 分隔线与底部操作按钮 */}
                <div className="border-t border-gray-100 pt-3 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (demoMode && onRequireLogin) {
                        onRequireLogin();
                      } else {
                        showFilterHint('已确认');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 text-[12px] font-medium text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-gray-800 flex items-center justify-center text-white flex-shrink-0">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>确认</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (demoMode && onRequireLogin) {
                        onRequireLogin();
                      } else {
                        showFilterHint('服务召请');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 text-[12px] font-medium text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                    <span>服务召请</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (demoMode && onRequireLogin) {
                        onRequireLogin();
                      } else {
                        showFilterHint('更多操作');
                      }
                    }}
                    className="flex items-center justify-center px-3 py-1.5 rounded-full border border-gray-200 text-[12px] font-medium text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                    aria-label="更多操作"
                  >
                    <span className="tracking-widest font-bold text-gray-600 leading-none">•••</span>
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          filteredDevices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <EmptyBoxIllustration />
              <p className="text-[13px] text-gray-400 mt-2 font-normal">
                {keyword ? '未找到匹配的设备' : '暂无数据'}
              </p>
            </div>
          ) : (
            filteredDevices.map((device) => (
              <div
                key={device.id}
                onClick={() => {
                  onDeviceClick?.({ ...device, activeCategory: activeTab, categoryName: categories.find((t) => t.id === activeTab)?.name || '设备异常' });
                }}
                className={`bg-white rounded-2xl p-4 flex items-center justify-between shadow-2xs border border-gray-100/80 cursor-pointer active:bg-gray-50 transition-colors ${
                  device.isContextTarget ? 'ring-1 ring-[#f4c8cd] bg-[#fff3f4]' : ''
                }`}
              >
                {/* 设备图片与基本信息 */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={device.image}
                      alt={device.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] font-bold text-gray-900 truncate">{device.title}</div>
                    <div className="text-[12px] text-gray-500 mt-0.5 truncate">{device.subtitle}</div>
                  </div>
                </div>

                {/* 徽标与箭头 */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {device.newBadge && (
                    <span className="bg-[#E8F8EE] text-[#00B050] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      {device.newBadge}
                    </span>
                  )}
                  {device.countBadge !== undefined && (
                    <span className="bg-[#FEECEE] text-[#EA3D4B] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      {device.countBadge}
                    </span>
                  )}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
                    <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* 提示气泡 */}
      {filterHint && (
        <div role="status" className="absolute bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-[12px] text-white shadow-lg pointer-events-none">
          {filterHint}
        </div>
      )}

      {/* 全部大类抽屉 */}
      <CategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        activeTab={activeTab}
        onSelectCategory={(catId) => setActiveTab(catId)}
        categories={categories}
        onSaveOrder={(newCats) => {
          setCategories(newCats);
          showFilterHint('大类排序已更新');
        }}
      />
    </div>
  );
};




const Audit = (props) => {
  if (props.demoMode) {
    return <GuestAudit {...props} />;
  }
  return <BaselineAudit {...props} />;
};

export default Audit;

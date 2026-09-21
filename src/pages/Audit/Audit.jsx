import React, { useState } from 'react';

const AUDIT_TABS = [
  { id: 'exception', name: '设备异常', count: 6 },
  { id: 'location', name: '位置预警', count: 0 },
  { id: 'maintenance', name: '维保事项', count: 0 },
  { id: 'fuel', name: '燃油异常', count: 0 },
  { id: 'check', name: '检查异常', count: 2 },
];

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

const TAB_DEVICES = {
  exception: [
    {
      id: 'HT683',
      code: 'HRZX2331008983',
      name: 'HT683',
      displayName: 'HT683',
      title: 'HT683',
      subtitle: 'Sany · 半挂牵引车',
      type: 'Sany · 半挂牵引车',
      image: 'images/img_dumptruck.jpg',
      newBadge: '5新',
      countBadge: 6,
      activeCategory: 'exception',
      categoryName: '设备异常',
    },
  ],
  check: [
    {
      id: 'AC0250CF0056',
      code: 'AC0250CF0056',
      name: 'AC0250CF0056',
      displayName: 'AC0250CF0056',
      title: 'AC0250CF0056',
      subtitle: 'Sany · 汽车起重机',
      type: 'Sany · 汽车起重机',
      image: 'images/审核/起重机.jpg',
      newBadge: '1新',
      countBadge: 1,
      activeCategory: 'check',
      categoryName: '检查异常',
    },
    {
      id: 'SW970EACG0278',
      code: 'SW970EACG0278',
      name: 'SW956E9CF7528',
      displayName: 'SW956E9CF7528',
      title: 'SW956E9CF7528',
      subtitle: 'Sany · 挖掘装载机（印度）',
      type: 'Sany · 挖掘装载机（印度）',
      image: 'images/img_earthwork.jpg',
      newBadge: '1新',
      countBadge: 1,
      activeCategory: 'check',
      categoryName: '检查异常',
    },
  ],
  location: [],
  maintenance: [],
  fuel: [],
};

const Audit = ({ onDeviceClick, initialTab, navigationContext, searchQuery = '', demoMode = false, onRequireLogin }) => {
  const getInitialTab = () => {
    if (initialTab && TAB_NAME_MAP[initialTab]) {
      return TAB_NAME_MAP[initialTab];
    }
    return 'exception';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [groupByDevice, setGroupByDevice] = useState(true);
  const [filterHint, setFilterHint] = useState('');

  const showFilterHint = (message) => {
    setFilterHint(message);
    window.setTimeout(() => setFilterHint(''), 1600);
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
          categoryName: AUDIT_TABS.find((t) => t.id === activeTab)?.name || '设备异常',
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
            {AUDIT_TABS.map((tab) => {
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
            onClick={() => showFilterHint('分类管理')}
            className="w-8 h-8 rounded-full bg-[#F5F6F8] flex items-center justify-center flex-shrink-0 text-gray-700 ml-1.5 active:bg-gray-200"
            aria-label="更多分类"
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
              onClick={() => setGroupByDevice(!groupByDevice)}
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
        {/* 空状态：图 4、5、6 对应的吊装箱子插图 */}
        {filteredDevices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
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
            <p className="text-[13px] text-gray-400 mt-2 font-normal">
              {keyword ? '未找到匹配的设备' : '暂无数据'}
            </p>
          </div>
        ) : (
          filteredDevices.map((device) => (
            <div
              key={device.id}
              onClick={() => {
                if (demoMode && onRequireLogin) {
                  onRequireLogin();
                }
                onDeviceClick?.({ ...device, activeCategory: activeTab, categoryName: AUDIT_TABS.find((t) => t.id === activeTab)?.name || '设备异常' });
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
        )}
      </div>

      {/* 提示气泡 */}
      {filterHint && (
        <div role="status" className="absolute bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-[12px] text-white shadow-lg pointer-events-none">
          {filterHint}
        </div>
      )}
    </div>
  );
};

export default Audit;

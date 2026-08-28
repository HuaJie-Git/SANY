import React, { useState } from 'react';

const Asset = ({ onDeviceClick, navigationContext }) => {
  const [activeTab, setActiveTab] = useState(
    navigationContext?.kind === 'status' && ['online', 'offline'].includes(navigationContext.value)
      ? navigationContext.value
      : 'all',
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Tab数据
  const tabs = [
    { id: 'all', name: '全部', count: 53 },
    { id: 'online', name: '在线', count: 20 },
    { id: 'offline', name: '离线', count: 30 },
    { id: 'unaudited', name: '未审核', count: 0 },
  ];

  // 设备列表数据
  const baseDevices = [
    {
      id: 9,
      name: '三一平地机',
      code: 'SMG200-3009',
      image: 'images/asset-models/sany_grader.jpg',
      status: 'online',
      statusText: '行驶',
      statusColor: 'text-green-500'
    },
    {
      id: 10,
      name: '三一压路机',
      code: 'SSR260-6012',
      image: 'images/asset-models/sany_roller.jpg',
      status: 'offline',
      statusText: '离线',
      statusColor: 'text-gray-400'
    },
    {
      id: 11,
      name: '三一摊铺机',
      code: 'SMP130-8015',
      image: 'images/asset-models/sany_paver.jpg',
      status: 'online',
      statusText: '行驶',
      statusColor: 'text-green-500'
    },
    {
      id: 12,
      name: '三一泵车',
      code: 'SYM5230THB-4001',
      image: 'images/asset-models/sany_pump.jpg',
      status: 'online',
      statusText: '行驶',
      statusColor: 'text-green-500'
    },
    {
      id: 13,
      name: '三一拖泵',
      code: 'HBT6013C-5001',
      image: 'images/asset-models/sany_trailer_pump.jpg',
      status: 'online',
      statusText: '工作',
      statusColor: 'text-green-500'
    },
    {
      id: 14,
      name: '三一车载泵',
      code: 'SYM5120THB-6001',
      image: 'images/asset-models/sany_truck_pump.jpg',
      status: 'online',
      statusText: '行驶',
      statusColor: 'text-green-500'
    },
    {
      id: 15,
      name: '三一铣刨机',
      code: 'SCM1000C-7001',
      image: 'images/asset-models/sany_milling.jpg',
      status: 'online',
      statusText: '工作',
      statusColor: 'text-green-500'
    },
    {
      id: 16,
      name: '纯电搅拌车',
      code: 'SYM5310BEV-8001',
      image: 'images/审核/搅拌车.jpg',
      status: 'online',
      statusText: '行驶',
      statusColor: 'text-green-500'
    },
    {
      id: 1,
      name: '三一挖掘机',
      code: 'KT10SESE50393',
      image: 'images/审核/挖掘机.jpg',
      status: 'offline',
      statusText: '离线',
      statusColor: 'text-gray-400'
    },
    {
      id: 2,
      name: '三一起重机',
      code: 'KT10SESE50394',
      image: 'images/审核/起重机.jpg',
      status: 'online',
      statusText: '行驶',
      statusColor: 'text-green-500'
    },
    {
      id: 3,
      name: '三一泵车',
      code: 'KT10SESE50395',
      image: 'images/审核/搅拌车.jpg',
      status: 'offline',
      statusText: '离线',
      statusColor: 'text-gray-400'
    },
    {
      id: 4,
      name: '三一挖掘机',
      code: 'KT10SESE50396',
      image: 'images/审核/挖掘机2.jpg',
      status: 'online',
      statusText: '行驶',
      statusColor: 'text-green-500'
    },
    {
      id: 5,
      name: '三一起重机',
      code: 'KT10SESE50397',
      image: 'images/审核/起重机.jpg',
      status: 'offline',
      statusText: '离线',
      statusColor: 'text-gray-400'
    },
    {
      id: 6,
      name: '三一泵车',
      code: 'KT10SESE50398',
      image: 'images/审核/搅拌车.jpg',
      status: 'online',
      statusText: '行驶',
      statusColor: 'text-green-500'
    },
    {
      id: 7,
      name: '三一挖掘机',
      code: 'KT10SESE50399',
      image: 'images/审核/挖掘机.jpg',
      status: 'offline',
      statusText: '离线',
      statusColor: 'text-gray-400'
    },
    {
      id: 8,
      name: '三一起重机',
      code: 'KT10SESE50400',
      image: 'images/审核/起重机.jpg',
      status: 'online',
      statusText: '行驶',
      statusColor: 'text-green-500'
    }
  ];

  const contextualDevices = navigationContext?.kind === 'brand' && navigationContext.value !== 'SANY'
    ? [{
        id: `context-${navigationContext.value}`,
        name: `${navigationContext.value} 320GC 挖掘机`,
        code: `${navigationContext.value}-320GC-0266`,
        image: 'images/机手社区/挖掘机/挖掘机_07.jpg',
        status: 'online',
        statusText: '工作',
        statusColor: 'text-green-500',
        brand: navigationContext.value,
      }]
    : [];

  const keyword = searchQuery.trim().toLowerCase();
  const devices = [...contextualDevices, ...baseDevices].filter((device) => {
    const matchesSearch = !keyword || `${device.name}${device.code}`.toLowerCase().includes(keyword);
    if (!matchesSearch) return false;
    if (!navigationContext) return true;
    if (navigationContext.kind === 'brand') {
      return navigationContext.value === 'SANY'
        ? device.name.includes('三一')
        : device.brand === navigationContext.value || device.name.includes(navigationContext.value);
    }
    if (navigationContext.kind === 'type') return device.name.includes(navigationContext.value);
    if (navigationContext.kind === 'status') return device.status === navigationContext.value;
    return true;
  }).filter((device) => {
    if (activeTab === 'online' || activeTab === 'offline') return device.status === activeTab;
    if (activeTab === 'unaudited') return device.auditStatus === 'unaudited';
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部固定区域 - Tab和搜索框 */}
      <div className="flex-shrink-0">
        {/* Tab切换 */}
        <div className="bg-white px-4 py-3 flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className={`ml-1 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 搜索框 */}
        <div className="bg-white px-4 py-3">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2.5">
            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索"
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            <button className="ml-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 设备列表 - 可滑动区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {devices.map((device) => {
          const cardClass = 'bg-white rounded-xl p-3 flex items-center shadow-sm cursor-pointer active:scale-[0.99] transition-transform';
          return (
            <div
              key={device.id}
              role="button"
              tabIndex={0}
              onClick={() => onDeviceClick?.(device)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onDeviceClick?.(device);
                }
              }}
              className={cardClass}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* 设备信息 */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 mb-0.5 truncate">{device.name}</div>
                <div className="text-xs text-gray-500 mb-1">{device.code}</div>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-1 ${
                    device.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={`text-xs ${device.statusColor}`}>{device.statusText}</span>
                </div>
              </div>

              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          );
        })}
        {devices.length === 0 && (
          <div className="rounded-xl bg-white py-12 text-center text-[13px] text-gray-400">当前筛选下暂无资产</div>
        )}
      </div>
    </div>
  );
};

export default Asset;

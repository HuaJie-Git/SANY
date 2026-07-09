import React, { useState } from 'react';

const Audit = ({ onDeviceClick, initialTab }) => {
  // Tab名称到ID的映射
  const tabNameToId = {
    '设备异常': 'exception',
    '维保事项': 'maintenance',
    '燃油异常': 'fuel',
    '位置预警': 'location',
  };

  const getInitialTab = () => {
    if (initialTab && tabNameToId[initialTab]) {
      return tabNameToId[initialTab];
    }
    return 'exception';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('12/10 - 12/20');
  const [groupByDevice, setGroupByDevice] = useState(true);

  // Tab数据
  const tabs = [
    { id: 'exception', name: '设备异常', count: 5 },
    { id: 'maintenance', name: '维保事项', count: 99, isOver99: true },
    { id: 'fuel', name: '燃油异常', count: 0 },
    { id: 'location', name: '位置预警', count: 1 },
  ];

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
      default:
        return exceptionDevices;
    }
  };

  const devices = getDevices();

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
        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white z-10">
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
        {devices.map((device) => (
          <div
            key={device.id}
            className="bg-white rounded-xl p-3 flex items-center shadow-sm cursor-pointer"
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
        ))}
      </div>
    </div>
  );
};

export default Audit;

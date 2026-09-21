import React, { useState } from 'react';

const DeviceStartupList = ({ onBack, onDeviceClick }) => {
  // 曲线默认选中当前时段，开机数显示为 4
  const [selectedBar, setSelectedBar] = useState(13);

  // 模拟开机曲线数据（0-24小时）：展示当前开机数为 4 台
  const hourlyData = [1, 2, 2, 3, 3, 4, 4, 4, 4, 3, 4, 4, 4, 4, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0];

  // 资产库中真实的 4 台开机设备
  const startupDevices = [
    {
      id: 20,
      code: 'SW970EACG0278',
      name: '电动装载机',
      displayName: '电动装载机',
      model: '电动装载机 · SW970EACG0278',
      image: 'images/img_earthwork.jpg',
      workHours: '3.08h',
      energy: '64kWh',
      hourlyData: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      location: '苏州市·吴中施工区',
      time: '2026-09-21 03:10:43 (UTC+9)',
      status: 'online',
      todayHours: '3.08h',
      todayEnergy: '64kWh',
    },
    {
      id: 21,
      code: 'KT090AE20208',
      name: '矿用宽体自卸车',
      displayName: '矿用宽体自卸车',
      model: '矿用宽体自卸车 · KT090AE20208',
      image: 'images/机手社区/矿卡/矿卡_01.jpg',
      workHours: '2.14h',
      energy: '48kWh',
      hourlyData: [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      location: '45H2+HF Simpang Empat, 印度尼西亚',
      time: '2026-09-21 02:45:10 (UTC+8)',
      status: 'online',
      todayHours: '2.14h',
      todayEnergy: '48kWh',
    },
    {
      id: 17,
      code: 'SY014CF0113D8',
      name: '挖掘机',
      displayName: '挖掘机',
      model: '挖掘机 · SY014CF0113D8',
      image: 'images/审核/挖掘机.jpg',
      workHours: '1.85h',
      energy: '35kWh',
      hourlyData: [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      location: '苏州市·吴中施工区',
      time: '2026-09-21 02:15:30 (UTC+8)',
      status: 'online',
      todayHours: '1.85h',
      todayEnergy: '35kWh',
    },
    {
      id: 19,
      code: 'HRZX2331008983',
      name: '自卸车',
      displayName: '自卸车',
      model: '自卸车 · HRZX2331008983',
      image: 'images/img_dumptruck.jpg',
      workHours: '0.90h',
      energy: '18kWh',
      hourlyData: [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      location: '67QG+XW Na Som, 泰国',
      time: '2026-09-21 01:50:22 (UTC+7)',
      status: 'online',
      todayHours: '0.90h',
      todayEnergy: '18kWh',
    },
  ];

  // 柱状图点击处理
  const handleBarClick = (index) => {
    setSelectedBar(index);
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[#F6F7F9]" dir="auto">
      {/* 顶部导航栏 */}
      <header className="flex h-12 flex-shrink-0 items-center border-b border-gray-100 bg-white px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center -ml-2 rounded-full text-gray-800 active:bg-gray-100"
          aria-label="返回"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-[17px] font-bold text-gray-900 ml-1">设备开机动态</h1>
      </header>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {/* 开机曲线柱状图 */}
        <div className="bg-white p-4 mb-3 border-b border-gray-100">
          <div className="flex">
            {/* 纵坐标 */}
            <div className="flex flex-col justify-between text-[10px] text-gray-400 mr-2 h-[110px]">
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>
            {/* 柱状图 */}
            <div className="flex-1 relative">
              <div className="h-[110px] flex items-end gap-[2px]">
                {hourlyData.slice(0, 24).map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t cursor-pointer transition-all"
                    style={{
                      height: `${(height / 6) * 100}px`,
                      backgroundColor: selectedBar === index ? '#E01923' : '#FBBF24',
                    }}
                    onClick={() => handleBarClick(index)}
                  />
                ))}
              </div>
              {/* 时间轴 */}
              <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                <span>0</span>
                <span>4</span>
                <span>8</span>
                <span>12</span>
                <span>16</span>
                <span>20</span>
                <span>24(h)</span>
              </div>
              {/* 选中提示框 */}
              {selectedBar !== null && (
                <div
                  className="absolute bg-gray-900 text-white text-[12px] px-3 py-1.5 rounded-lg shadow-lg z-10 whitespace-nowrap"
                  style={{
                    left: `${Math.min(85, Math.max(15, (selectedBar / 24) * 100))}%`,
                    top: '-10px',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="font-semibold">开机数：{hourlyData[selectedBar]}</div>
                  <div className="text-[10px] text-gray-300">{`${selectedBar}:00 - ${selectedBar + 1}:00`}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 台设备详情卡片列表 */}
        <div className="px-4 space-y-3 pb-6">
          {startupDevices.map((device) => (
            <div
              key={device.id}
              role="button"
              tabIndex={0}
              onClick={() => onDeviceClick?.(device)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onDeviceClick?.(device);
              }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer active:bg-gray-50 transition-colors"
            >
              {/* 设备编号和图片 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <img
                      src={device.image}
                      alt={device.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-gray-900">{device.model}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{device.code}</div>
                  </div>
                </div>
                <div className="text-gray-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* 工时和能耗数据 */}
              <div className="flex justify-between mb-3 bg-[#F9FAFB] rounded-xl p-2.5">
                <div>
                  <div className="text-[20px] font-bold text-gray-900">{device.workHours}</div>
                  <div className="text-[11px] text-gray-400">当日总工时</div>
                </div>
                <div className="text-right">
                  <div className="text-[20px] font-bold text-gray-900">{device.energy}</div>
                  <div className="text-[11px] text-gray-400">当日总能耗</div>
                </div>
              </div>

              {/* 地区、时间和导航按钮 */}
              <div className="flex items-start justify-between">
                <div className="text-[12px] text-gray-500 flex-1 min-w-0 pr-2 space-y-1">
                  <div className="flex items-center gap-1 truncate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-gray-400">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="truncate">{device.location}</span>
                  </div>
                  <div className="flex items-center gap-1 truncate text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{device.time}</span>
                  </div>
                </div>
                {/* 导航按钮 */}
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 14L8 2L14 14L8 10L2 14Z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeviceStartupList;

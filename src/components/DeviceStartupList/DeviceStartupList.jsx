// DeviceStartupList 开机动态列表页：隔离已登录态（db62a7e 基线）与游客态（b5ded1b 演示数据）
import React, { useState } from 'react';

const BaselineDeviceStartupList = ({ onBack }) => {
  const [selectedBar, setSelectedBar] = useState(null);

  // 模拟开机曲线数据（0-24小时，每半小时一个数据点）
  const hourlyData = [2, 3, 4, 5, 5, 5, 5, 5, 4, 3, 5, 5, 5, 5, 5, 5, 5, 5, 4, 5, 5, 5, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // 模拟设备数据
  const devices = [
    {
      id: 1,
      model: 'DG1081CF0320',
      image: 'images/机手社区/三一起重机/三一起重机_01.jpg',
      workHours: '1.59h',
      energy: '20L',
      hourlyData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      location: '3XPM+2Q3, Muang Mai Klang Rd, Tambon Bueng, Amphoe Si Racha, Chang Wat Chon Buri, 泰国, 20230',
      time: '2026-07-04 02:33:15 (UTC+7)',
    },
    {
      id: 2,
      model: 'BC5341CC2402',
      image: 'images/机手社区/泵车/泵车_04.jpg',
      workHours: '2.3h',
      energy: '25L',
      hourlyData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      location: '545R+MV Fatufia, Morowali Regency, Central Sulawesi, 印度尼西亚',
      time: '2026-07-04 03:33:27 (GMT+8)',
    },
    {
      id: 3,
      model: 'DG1071CF0216',
      image: 'images/机手社区/三一起重机/三一起重机_03.jpg',
      workHours: '0.84h',
      energy: '12L',
      hourlyData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      location: '北京市朝阳区三一重工总部测试区',
      time: '2026-07-04 03:33:15 (GMT+8)',
    },
  ];

  // 柱状图点击处理
  const handleBarClick = (index) => {
    setSelectedBar(index);
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col">
      {/* 状态栏 */}
      <div className="h-[44px] flex items-center justify-between px-4 bg-white">
        <span className="text-black text-[14px] font-medium">3:33</span>
        <div className="flex items-center gap-1">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 8H3V12H1V8Z" fill="#333"/>
            <path d="M5 5H7V12H5V5Z" fill="#333"/>
            <path d="M9 3H11V12H9V3Z" fill="#333"/>
            <path d="M13 0H15V12H13V0Z" fill="#333"/>
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2C10.76 2 13.07 3.61 14.1 6L15.5 4.5C14.14 2.58 11.23 1 8 1C4.77 1 1.86 2.58 0.5 4.5L1.9 6C2.93 3.61 5.24 2 8 2Z" fill="#333"/>
            <path d="M8 5C9.66 5 11.14 5.69 12.11 6.88L13.5 5.5C12.2 3.98 10.21 3 8 3C5.79 3 3.8 3.98 2.5 5.5L3.89 6.88C4.86 5.69 6.34 5 8 5Z" fill="#333"/>
            <path d="M8 8C8.83 8 9.58 8.34 10.12 8.9L11.5 7.5C10.6 6.6 9.37 6 8 6C6.63 6 5.4 6.6 4.5 7.5L5.88 8.9C6.42 8.34 7.17 8 8 8Z" fill="#333"/>
            <circle cx="8" cy="11" r="1.5" fill="#333"/>
          </svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="#333" strokeOpacity="0.35"/>
            <rect x="2" y="2" width="18" height="8" rx="1" fill="#333"/>
            <path d="M23 4V8C23.5523 8 24 7.5523 24 7V5C24 4.4477 23.5523 4 23 4Z" fill="#333" fillOpacity="0.4"/>
          </svg>
        </div>
      </div>

      {/* 顶部导航栏 */}
      <div className="flex items-center px-4 py-3 border-b border-gray-100">
        <div
          className="cursor-pointer"
          onClick={onBack}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-[16px] font-medium text-text-primary ml-2">设备开机动态</span>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {/* 开机曲线柱状图 */}
        <div className="px-4 py-3">
          <div className="flex">
            {/* 纵坐标 */}
            <div className="flex flex-col justify-between text-[10px] text-text辅助 mr-1 h-[120px]">
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>
            {/* 柱状图 */}
            <div className="flex-1 relative">
              <div className="h-[120px] flex items-end gap-[1px]">
                {hourlyData.slice(0, 24).map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t cursor-pointer transition-all"
                    style={{
                      height: `${height * 20}px`,
                      backgroundColor: selectedBar === index ? '#FF2212' : '#FFB43D'
                    }}
                    onClick={() => handleBarClick(index)}
                  />
                ))}
              </div>
              {/* 时间轴 */}
              <div className="flex justify-between text-[10px] text-text辅助 mt-1">
                <span>3</span>
                <span>5</span>
                <span>7</span>
                <span>9</span>
                <span>11</span>
                <span>13</span>
                <span>15</span>
                <span>17</span>
                <span>19</span>
                <span>21</span>
                <span>23</span>
                <span>1</span>
              </div>
              {/* 选中提示框 */}
              {selectedBar !== null && (
                <div
                  className="absolute bg-gray-800 text-white text-[12px] px-3 py-2 rounded shadow-lg z-10"
                  style={{
                    left: `${(selectedBar / 24) * 100}%`,
                    top: '0px',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div>{`${selectedBar}:00 - ${selectedBar}:30`}</div>
                  <div>开机数：{hourlyData[selectedBar]}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 设备详情卡片列表 */}
        <div className="px-4 space-y-4 pb-4">
          {devices.map((device) => (
            <div key={device.id} className="bg-white rounded-[11px] p-4 shadow-sm border border-gray-100">
              {/* 设备编号和图片 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-[40px] h-[40px] rounded overflow-hidden">
                    <img
                      src={device.image}
                      alt="设备图片"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-[14px] font-medium text-text-primary">{device.model}</div>
                </div>
                <div className="text-text辅助">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 4L10 8L6 12" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* 工时和能耗数据 */}
              <div className="flex justify-between mb-3">
                <div>
                  <div className="text-[24px] font-bold text-text-primary">{device.workHours}</div>
                  <div className="text-[12px] text-text辅助">当日总工时</div>
                </div>
                <div className="text-right">
                  <div className="text-[24px] font-bold text-text-primary">{device.energy}</div>
                  <div className="text-[12px] text-text辅助">当日总能耗</div>
                </div>
              </div>

              {/* 工时分布条 */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-text辅助 mb-1">
                  <span>0</span>
                  <span>2</span>
                  <span>4</span>
                  <span>6</span>
                  <span>8</span>
                  <span>10</span>
                  <span>12</span>
                  <span>14</span>
                  <span>16</span>
                  <span>18</span>
                  <span>20</span>
                  <span>22</span>
                </div>
                <div className="flex gap-1">
                  {device.hourlyData.slice(0, 12).map((height, index) => (
                    <div
                      key={index}
                      className="flex-1 h-[8px] rounded"
                      style={{
                        backgroundColor: height > 0 ? (height > 3 ? '#3B82F6' : '#F59E0B') : '#D1D5DB'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* 地区、时间和导航按钮 */}
              <div className="flex items-start justify-between mb-3">
                <div className="text-[12px] text-text-secondary flex-1">
                  <div className="flex items-start gap-1 mb-1">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-0.5">
                      <path d="M7 1C4.79 1 3 2.79 3 5C3 8 7 13 7 13C7 13 11 8 11 5C11 2.79 9.21 1 7 1ZM7 6.5C6.17 6.5 5.5 5.83 5.5 5C5.5 4.17 6.17 3.5 7 3.5C7.83 3.5 8.5 4.17 8.5 5C8.5 5.83 7.83 6.5 7 6.5Z" fill="#666"/>
                    </svg>
                    <span>{device.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                      <circle cx="7" cy="7" r="6" stroke="#666" strokeWidth="1.5"/>
                      <path d="M7 3.5V7L9.5 8.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span>{device.time}</span>
                  </div>
                </div>
                {/* 导航按钮 */}
                <div className="w-[32px] h-[32px] border border-blue-500 rounded-full flex items-center justify-center cursor-pointer ml-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 14L8 2L14 14L8 10L2 14Z" fill="#3B82F6"/>
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





const GuestDeviceStartupList = ({ onBack, onDeviceClick }) => {
  // 曲线默认选中当前时段，开机数显示为 3
  const [selectedBar, setSelectedBar] = useState(13);

  // 模拟开机曲线数据（0-24小时）：展示当前开机数为 3 台
  const hourlyData = [1, 1, 2, 2, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1, 0, 0];

  // 游客模式唯一的 3 台设备（挖掘机、自装卸车、汽车起重机）
  const startupDevices = [
    {
      id: 17,
      code: 'SY014CF0113D8',
      name: '挖掘机',
      displayName: '挖掘机',
      model: '挖掘机 · SY014CF0113D8',
      image: 'images/审核/挖掘机.jpg',
      workHours: '0.01h',
      energy: '0.15L',
      hourlyData: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      location: '中国',
      time: '2026-09-23 08:30 (UTC+8)',
      status: 'online',
      todayHours: '0.01h',
      todayEnergy: '0.15L',
    },
    {
      id: 19,
      code: 'HRZX2331008983',
      name: '自装卸车',
      displayName: '自装卸车',
      model: '自装卸车 · HRZX2331008983',
      image: 'images/img_dumptruck.jpg',
      workHours: '0.0h',
      energy: '78%',
      hourlyData: [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      location: '中国',
      time: '2026-09-23 08:30 (UTC+8)',
      status: 'online',
      todayHours: '0.0h',
      todayEnergy: '78%',
    },
    {
      id: 18,
      code: 'AC0250CF0056',
      name: '汽车起重机',
      displayName: '汽车起重机',
      model: '汽车起重机 · AC0250CF0056',
      image: 'images/审核/起重机.jpg',
      workHours: '0.06h',
      energy: '76.8%',
      hourlyData: [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      location: '中国',
      time: '2026-09-23 08:30 (UTC+8)',
      status: 'offline',
      todayHours: '0.06h',
      todayEnergy: '76.8%',
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

        {/* 3 台设备详情卡片列表 */}
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




const DeviceStartupList = (props) => {
  if (props.demoMode) {
    return <GuestDeviceStartupList {...props} />;
  }
  return <BaselineDeviceStartupList {...props} />;
};

export default DeviceStartupList;
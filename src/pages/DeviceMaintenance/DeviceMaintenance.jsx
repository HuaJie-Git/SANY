import React, { useState, useEffect } from 'react';
import PhoneBindModal from '../../components/PhoneBindModal/PhoneBindModal';

const DeviceMaintenance = ({ onBack }) => {
  const [showPhoneBindModal, setShowPhoneBindModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 模拟设备数据
  const devices = [
    {
      id: 1,
      code: 'HNGJ0531031025',
      lastMaintenanceTime: '2026-05-19 08:00:00',
      status: 'overdue',
      statusText: '超期 666 km',
      image: 'images/设备保养/挖机.jpg'
    },
    {
      id: 2,
      code: 'SR175LCF00928',
      lastMaintenanceTime: '2026-03-12 08:00:00',
      status: 'warning',
      statusText: '剩余 25 h',
      image: 'images/设备保养/压路机.jpg'
    },
    {
      id: 3,
      code: 'TH1056CD1523',
      lastMaintenanceTime: '--',
      status: 'normal',
      statusText: '剩余 96 h',
      image: 'images/设备保养/起重机.jpg'
    },
    {
      id: 4,
      code: 'SW956E9CF9888',
      lastMaintenanceTime: '--',
      status: 'normal',
      statusText: '剩余 104 h',
      image: 'images/设备保养/挖机.jpg'
    },
    {
      id: 5,
      code: 'SR065CCF01368',
      lastMaintenanceTime: '2026-05-26 08:00:00',
      status: 'normal',
      statusText: '剩余 108 h',
      image: 'images/设备保养/压路机.jpg'
    },
    {
      id: 6,
      code: 'LT6845CD2656',
      lastMaintenanceTime: '2024-09-26 08:00:00',
      status: 'overdue',
      statusText: '超期 1200 h',
      image: 'images/设备保养/起重机.jpg'
    }
  ];

  // 模拟检查用户手机号
  useEffect(() => {
    const userPhone = null; // 模拟未绑定手机号

    if (!userPhone) {
      const timer = setTimeout(() => {
        setShowPhoneBindModal(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  // 处理手机号绑定成功
  const handlePhoneBindSuccess = () => {
    console.log('手机号绑定成功');
  };

  // 处理设备选择
  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
    console.log('选择设备:', device);
  };

  // 获取状态颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return 'text-red-500';
      case 'warning':
        return 'text-orange-500';
      case 'normal':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col">
      {/* 状态栏 - 与内容信息流详情页一致 */}
      <div className="flex-shrink-0">
        <div className="h-[44px] flex items-center justify-between px-4 bg-white">
          <span className="text-black text-[14px] font-medium">9:41</span>
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
        <div className="flex items-center px-4 py-3 border-b border-gray-100 bg-white">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="flex-1 text-center text-base font-medium">全部设备</h1>
          <button className="w-8 h-8 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="px-4 py-3">
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="设备昵称或序列号"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* 添加设备按钮 */}
      <div className="px-4 mb-3">
        <button className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 flex items-center justify-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
          </svg>
          添加设备
        </button>
      </div>

      {/* 设备列表 */}
      <div className="px-4 space-y-3">
        {devices.map((device) => (
          <div
            key={device.id}
            onClick={() => handleDeviceSelect(device)}
            className={`bg-white rounded-lg p-4 flex items-center ${
              selectedDevice?.id === device.id ? 'border-2 border-red-500' : 'border border-gray-100'
            }`}
          >
            {/* 设备图片 */}
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
              <div className="text-xs text-gray-400">SANY</div>
            </div>

            {/* 设备信息 */}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 mb-1">{device.code}</div>
              <div className="text-xs text-gray-500 mb-1">最近保养时间：{device.lastMaintenanceTime}</div>
              <div className={`text-xs ${getStatusColor(device.status)}`}>
                <span className="inline-block w-2 h-2 rounded-full bg-current mr-1"></span>
                {device.statusText}
              </div>
            </div>

            {/* 箭头 */}
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        ))}
      </div>

      {/* 手机号绑定弹窗 */}
      <PhoneBindModal
        visible={showPhoneBindModal}
        onClose={() => setShowPhoneBindModal(false)}
        onSuccess={handlePhoneBindSuccess}
        sourcePage="DeviceMaintenance"
      />
    </div>
  );
};

export default DeviceMaintenance;

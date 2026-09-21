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
    <div className="relative flex h-full w-full flex-col bg-white">
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

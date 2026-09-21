import React from 'react';
import { GUEST_DEMO_DEVICES } from '../../data/guestDemoData';

const RecentDetail = ({ onBack, onNavigate }) => {
  // 资产库共有6台车，最近查看列表最多展示6台，严格按设计原图映射
  const recentDevices = [
    {
      id: 20,
      name: '电动装载机',
      code: 'SW970EACG0278',
      status: 'online',
      statusText: '在线',
      isLogo: true,
      image: 'images/img_earthwork.jpg',
      type: 'asset',
    },
    {
      id: 19,
      name: '电动自卸车',
      code: 'HRZX2331008983',
      status: 'offline',
      statusText: '离线',
      image: 'images/img_dumptruck.jpg',
      type: 'asset',
    },
    {
      id: 21,
      name: '矿用宽体自卸车',
      code: 'KT090AE20208',
      status: 'online',
      statusText: '在线',
      image: 'images/机手社区/矿卡/矿卡_01.jpg',
      type: 'asset',
    },
    {
      id: 18,
      name: '汽车起重机',
      code: 'AC0250CF0056',
      status: 'offline',
      statusText: '离线',
      image: 'images/审核/起重机.jpg',
      type: 'asset',
    },
    {
      id: 16,
      name: '搅拌车',
      code: 'HSGJ1051016142',
      status: 'offline',
      statusText: '离线',
      image: 'images/img_mixer.jpg',
      type: 'asset',
    },
    {
      id: 17,
      name: '挖掘机',
      code: 'SY014CF0113D8',
      status: 'online',
      statusText: '在线',
      image: 'images/审核/挖掘机.jpg',
      type: 'asset',
    },
  ].slice(0, 6);

  // 点击单台车 → 跳转对应车的设备工况详情页
  const handleCardClick = (item) => {
    // 补齐完整设备属性以便工况详情页正常渲染
    const fullDevice = GUEST_DEMO_DEVICES.find((d) => d.code === item.code) || item;
    if (onNavigate) {
      onNavigate({ ...fullDevice, type: 'asset', name: item.name });
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[#F6F7F9]" dir="auto">
      {/* 顶部标题栏 */}
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
        <h1 className="text-[17px] font-bold text-gray-900 ml-1">最近查看</h1>
      </header>

      {/* 设备列表（最多 6 台） */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {recentDevices.map((item) => {
          const isOnline = item.status === 'online';
          return (
            <div
              key={item.code}
              onClick={() => handleCardClick(item)}
              className="flex items-center justify-between rounded-2xl border border-gray-100/90 bg-white p-4 shadow-sm active:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                {/* 缩略图/LOGO */}
                <div className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-[#F8F9FA] p-1 overflow-hidden border border-gray-50">
                  {item.isLogo ? (
                    <div className="flex items-center justify-center">
                      <span className="text-[20px] font-black tracking-tight text-[#E01923]">SANY</span>
                    </div>
                  ) : (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'images/审核/起重机.jpg';
                      }}
                    />
                  )}
                </div>

                {/* 设备信息 */}
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-bold text-gray-900 truncate">
                    {item.name}
                  </div>
                  <div className="text-[12px] text-gray-400 mt-1 font-mono tracking-wide">
                    {item.code}
                  </div>
                  <div className="flex items-center mt-1.5 space-x-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isOnline ? 'bg-[#10B981]' : 'bg-[#D1D5DB]'
                      }`}
                    />
                    <span
                      className={`text-[12px] font-medium ${
                        isOnline ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      {isOnline ? '在线' : '离线'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 右箭头 */}
              <div className="ml-2 flex-shrink-0 text-gray-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentDetail;

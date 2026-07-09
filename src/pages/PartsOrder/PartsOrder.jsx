import React, { useState, useEffect } from 'react';
import PhoneBindModal from '../../components/PhoneBindModal/PhoneBindModal';

const PartsOrder = ({ onBack }) => {
  const [showPhoneBindModal, setShowPhoneBindModal] = useState(false);
  const [activeTab, setActiveTab] = useState('materials');
  const [searchQuery, setSearchQuery] = useState('');

  // 配件数据
  const parts = [
    {
      id: 1,
      code: 'YLJ008157110',
      name: '噪音标识',
      image: 'images/配件/噪音标识.jpg'
    },
    {
      id: 2,
      code: 'YLJ006374374',
      name: '安装带',
      image: 'images/配件/安装带.jpg'
    },
    {
      id: 3,
      code: 'ZZX005635140',
      name: '链条',
      image: 'images/配件/链条.jpg'
    },
    {
      id: 4,
      code: 'ZZX008325559',
      name: '轮罩左后连接板',
      image: 'images/配件/轮罩左后连接板.jpg'
    },
    {
      id: 5,
      code: 'YLJ006508846',
      name: '冷凝器安装支板一',
      image: 'images/配件/冷凝器安装支板一.jpg'
    },
    {
      id: 6,
      code: 'YLJ006455641',
      name: '中冷器进气管',
      image: 'images/配件/中冷器进气管.jpg'
    },
    {
      id: 7,
      code: 'YLJ006508847',
      name: '冷凝器安装支板二',
      image: 'images/配件/冷凝器安装支板二.jpg'
    },
    {
      id: 8,
      code: 'YLJ006455642',
      name: '中冷器出气管',
      image: 'images/配件/中冷器出气管.jpg'
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

  // 处理搜索
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // 处理扫码
  const handleScan = () => {
    console.log('扫码');
  };

  // 处理配件选择
  const handlePartSelect = (part) => {
    console.log('选择配件:', part);
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
        <div className="flex items-center px-4 py-3 border-b border-gray-100">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="flex-1 text-center text-base font-medium">配件</h1>
          <div className="w-8" /> {/* 占位，保持标题居中 */}
        </div>

        {/* Tab切换 */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('devices')}
            className={`flex-1 py-3 text-sm font-medium text-center ${
              activeTab === 'devices'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-500'
            }`}
          >
            设备
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex-1 py-3 text-sm font-medium text-center ${
              activeTab === 'materials'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-500'
            }`}
          >
            物料
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
            onChange={handleSearch}
            placeholder="搜索物料"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <button onClick={handleScan} className="ml-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 配件列表 */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {parts.map((part) => (
            <div
              key={part.id}
              onClick={() => handlePartSelect(part)}
              className="bg-white rounded-lg overflow-hidden border border-gray-100"
            >
              {/* 配件图片 */}
              <div className="aspect-square bg-gray-50 flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>

              {/* 配件信息 */}
              <div className="p-3">
                <div className="text-xs font-medium text-gray-900 mb-1">{part.code}</div>
                <div className="text-xs text-gray-500">{part.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 手机号绑定弹窗 */}
      <PhoneBindModal
        visible={showPhoneBindModal}
        onClose={() => setShowPhoneBindModal(false)}
        onSuccess={handlePhoneBindSuccess}
      />
    </div>
  );
};

export default PartsOrder;

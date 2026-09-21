import React, { useState, useEffect } from 'react';
import PhoneBindModal from '../../components/PhoneBindModal/PhoneBindModal';

const PartsOrder = ({ onBack, initialQuery = '', initialItem = null }) => {
  const [showPhoneBindModal, setShowPhoneBindModal] = useState(false);
  const [activeTab, setActiveTab] = useState('materials');
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // 配件数据
  const baseParts = [
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
  const searchedPart = initialItem ? {
    id: `searched-${initialItem.id}`,
    code: initialItem.code,
    name: initialItem.name,
    image: initialItem.image,
  } : null;
  const keyword = searchQuery.trim().toLowerCase();
  const parts = [searchedPart, ...baseParts]
    .filter(Boolean)
    .filter((part, index, list) => list.findIndex((item) => item.code === part.code) === index)
    .filter((part) => !keyword || `${part.code}${part.name}`.toLowerCase().includes(keyword));

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
    <div className="relative flex h-full w-full flex-col bg-white">
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
        sourcePage="PartsOrder"
      />
    </div>
  );
};

export default PartsOrder;

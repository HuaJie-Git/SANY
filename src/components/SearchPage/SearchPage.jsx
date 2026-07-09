import React, { useState, useEffect, useRef, useCallback } from 'react';

const SearchPage = ({ onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('资产');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({});

  const tabs = ['资产', '品牌', '设备类型', '配件', '设备分组'];
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // ====== 各 Tab 的默认数据（进入搜索页时展示） ======
  const defaultData = {
    '资产': [
      { id: 1, code: 'EX-2024-001', name: 'SANY SY365', hours: '12,580 小时', time: '04/13/2026; 10:30', location: '上海市浦东新区', image: '/images/机手社区/挖掘机/挖掘机_01.jpg' },
      { id: 2, code: 'EX-2025-002', name: 'SANY 起重机', hours: '8,200 小时', time: '04/12/2026; 14:20', location: '南京市建邺区', image: '/images/机手社区/三一起重机/三一起重机_01.jpg' },
      { id: 3, code: 'EX-2024-003', name: 'CAT 挖掘机', hours: '3,065 小时', time: '04/11/2026; 09:15', location: '广州市天河区', image: '/images/机手社区/挖掘机/挖掘机_02.jpg' },
      { id: 4, code: 'EX-2024-004', name: 'SANY 泵车', hours: '5,430 小时', time: '04/10/2026; 08:00', location: '深圳市南山区', image: '/images/机手社区/泵车/泵车_04.jpg' },
      { id: 5, code: 'EX-2024-005', name: 'XCMG 起重机', hours: '1,890 小时', time: '04/09/2026; 16:45', location: '杭州市西湖区', image: '/images/机手社区/三一起重机/三一起重机_03.jpg' },
      { id: 6, code: 'EX-2024-006', name: 'SANY 挖掘机', hours: '6,780 小时', time: '04/08/2026; 11:00', location: '成都市武侯区', image: '/images/机手社区/挖掘机/挖掘机_03.jpg' },
    ],
    '品牌': [
      { id: 1, name: 'SANY', code: '三一重工', deviceCount: 45 },
      { id: 2, name: 'CAT', code: '卡特彼勒', deviceCount: 23 },
      { id: 3, name: 'XCMG', code: '徐工集团', deviceCount: 18 },
      { id: 4, name: 'BELL', code: 'BELL MINING & CONSTRUCTION', deviceCount: 8 },
      { id: 5, name: 'DEERE', code: 'JOHN DEERE', deviceCount: 12 },
      { id: 6, name: 'KOMATSU', code: '小松集团', deviceCount: 15 },
    ],
    '设备类型': [
      { id: 1, name: '挖掘机', code: 'Excavator', deviceCount: 35, image: '/images/机手社区/挖掘机/挖掘机_01.jpg' },
      { id: 2, name: '起重机', code: 'Crane', deviceCount: 22, image: '/images/机手社区/三一起重机/三一起重机_01.jpg' },
      { id: 3, name: '泵车', code: 'Pump Truck', deviceCount: 15, image: '/images/机手社区/泵车/泵车_04.jpg' },
      { id: 4, name: '压路机', code: 'Roller', deviceCount: 10, image: '/images/机手社区/压路机/压路机_01.jpg' },
      { id: 5, name: '铣刨机', code: 'Milling Machine', deviceCount: 8, image: '/images/机手社区/铣刨机/铣刨机_01.jpg' },
      { id: 6, name: '搅拌车', code: 'Mixer Truck', deviceCount: 12, image: '/images/机手社区/搅拌车/搅拌车_01.jpg' },
    ],
    '配件': [
      { id: 1, name: '液压油滤芯', code: 'HX-2024-001', price: '¥280', stock: '有货', image: '/images/配件/OIP.webp' },
      { id: 2, name: '空气滤芯', code: 'KQ-2024-002', price: '¥150', stock: '有货', image: '/images/配件/OIP (1).webp' },
      { id: 3, name: '机油滤芯', code: 'JY-2024-003', price: '¥120', stock: '缺货', image: '/images/配件/OIP (2).webp' },
      { id: 4, name: '柴油滤芯', code: 'CY-2024-004', price: '¥95', stock: '有货', image: '/images/配件/OIP (3).webp' },
      { id: 5, name: '履带板', code: 'LD-2024-005', price: '¥1,200', stock: '有货', image: '/images/配件/OIP (4).webp' },
      { id: 6, name: '铲斗齿', code: 'CD-2024-006', price: '¥350', stock: '有货', image: '/images/配件/OIP (5).webp' },
    ],
    '设备分组': [
      { id: 1, name: '华东组', code: '华东地区 - 上海、江苏、浙江', deviceCount: 12 },
      { id: 2, name: '华南组', code: '华南地区 - 广东、广西、福建', deviceCount: 8 },
      { id: 3, name: '华北组', code: '华北地区 - 北京、天津、河北', deviceCount: 15 },
      { id: 4, name: '西南组', code: '西南地区 - 四川、重庆、云南', deviceCount: 6 },
      { id: 5, name: '华中组', code: '华中地区 - 湖北、湖南、河南', deviceCount: 10 },
      { id: 6, name: '西北组', code: '西北地区 - 陕西、甘肃、宁夏', deviceCount: 5 },
    ],
  };

  // ====== 各 Tab 的搜索结果数据 ======
  const mockSearchResults = {
    '资产': [
      { id: 1, code: 'C0000138', name: 'KDD PC360 LC-11', hours: '7,841 小时', time: '09/30/2025; 20:00', location: '未报告位置', image: '/images/机手社区/挖掘机/挖掘机_05.jpg' },
      { id: 2, code: 'C0000166', name: 'SNA SY215', hours: '未报告小时数', time: '', location: '未报告位置', image: '/images/机手社区/港机/港机_01.jpg' },
      { id: 3, code: '662367', name: 'DEE 624K_DEERE', hours: '8,507 小时', time: '01/07/2026; 19:00', location: '北京市朝阳区', image: '/images/机手社区/自卸车/自卸车_01.jpg' },
      { id: 4, code: 'C0000199', name: 'SANY SY365C', hours: '12,300 小时', time: '03/15/2026; 10:00', location: '上海市浦东新区', image: '/images/机手社区/挖掘机/挖掘机_06.jpg' },
      { id: 5, code: 'C0000266', name: 'CAT 320GC', hours: '4,560 小时', time: '02/28/2026; 14:30', location: '广州市天河区', image: '/images/机手社区/挖掘机/挖掘机_07.jpg' },
      { id: 6, code: 'BK02766', name: 'XCMG QY50K', hours: '2,100 小时', time: '04/01/2026; 09:00', location: '南京市建邺区', image: '/images/机手社区/三一起重机/三一起重机_05.jpg' },
    ],
    '品牌': [
      { id: 1, name: 'SANY', code: '三一重工', deviceCount: 45 },
      { id: 2, name: 'CAT', code: '卡特彼勒', deviceCount: 23 },
      { id: 3, name: 'XCMG', code: '徐工集团', deviceCount: 18 },
      { id: 4, name: 'BELL', code: 'BELL MINING & CONSTRUCTION', deviceCount: 8 },
      { id: 5, name: 'DEERE', code: 'JOHN DEERE', deviceCount: 12 },
      { id: 6, name: 'KOMATSU', code: '小松集团', deviceCount: 15 },
    ],
    '设备类型': [
      { id: 1, name: '挖掘机', code: 'Excavator', deviceCount: 35, image: '/images/机手社区/挖掘机/挖掘机_01.jpg' },
      { id: 2, name: '起重机', code: 'Crane', deviceCount: 22, image: '/images/机手社区/三一起重机/三一起重机_01.jpg' },
      { id: 3, name: '泵车', code: 'Pump Truck', deviceCount: 15, image: '/images/机手社区/泵车/泵车_04.jpg' },
      { id: 4, name: '压路机', code: 'Roller', deviceCount: 10, image: '/images/机手社区/压路机/压路机_01.jpg' },
      { id: 5, name: '铣刨机', code: 'Milling Machine', deviceCount: 8, image: '/images/机手社区/铣刨机/铣刨机_01.jpg' },
      { id: 6, name: '搅拌车', code: 'Mixer Truck', deviceCount: 12, image: '/images/机手社区/搅拌车/搅拌车_01.jpg' },
    ],
    '配件': [
      { id: 1, name: '液压油滤芯', code: 'HX-2024-001', price: '¥280', stock: '有货', image: '/images/配件/OIP.webp' },
      { id: 2, name: '空气滤芯', code: 'KQ-2024-002', price: '¥150', stock: '有货', image: '/images/配件/OIP (1).webp' },
      { id: 3, name: '机油滤芯', code: 'JY-2024-003', price: '¥120', stock: '缺货', image: '/images/配件/OIP (2).webp' },
      { id: 4, name: '柴油滤芯', code: 'CY-2024-004', price: '¥95', stock: '有货', image: '/images/配件/OIP (3).webp' },
      { id: 5, name: '履带板', code: 'LD-2024-005', price: '¥1,200', stock: '有货', image: '/images/配件/OIP (4).webp' },
      { id: 6, name: '铲斗齿', code: 'CD-2024-006', price: '¥350', stock: '有货', image: '/images/配件/OIP (5).webp' },
    ],
    '设备分组': [
      { id: 1, name: '华东组', code: '华东地区 - 上海、江苏、浙江', deviceCount: 12 },
      { id: 2, name: '华南组', code: '华南地区 - 广东、广西、福建', deviceCount: 8 },
      { id: 3, name: '华北组', code: '华北地区 - 北京、天津、河北', deviceCount: 15 },
      { id: 4, name: '西南组', code: '西南地区 - 四川、重庆、云南', deviceCount: 6 },
      { id: 5, name: '华中组', code: '华中地区 - 湖北、湖南、河南', deviceCount: 10 },
      { id: 6, name: '西北组', code: '西北地区 - 陕西、甘肃、宁夏', deviceCount: 5 },
    ],
  };

  // 搜索逻辑（300ms防抖）
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!searchText) {
      setSearchResults({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceTimer.current = setTimeout(() => {
      setTimeout(() => {
        setSearchResults(mockSearchResults);
        setIsLoading(false);
      }, 800);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchText]);

  const handleClear = () => {
    setSearchText('');
    inputRef.current?.focus();
  };

  // 高亮关键词（黄色背景）
  const highlightText = (text, keyword) => {
    if (!keyword || !text) return text;
    const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span key={index} className="bg-yellow-300 font-bold">{part}</span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  // 图片组件
  const DeviceImage = ({ src, name, size = 'normal' }) => {
    const sizeClass = size === 'small' ? 'w-[50px] h-[50px]' : 'w-[70px] h-[56px]';
    return (
      <div className={`${sizeClass} rounded-lg overflow-hidden flex-shrink-0 bg-gray-100`}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-[12px]">暂无图片</div>
        )}
      </div>
    );
  };

  // 骨架屏
  const SkeletonItem = () => (
    <div className="py-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-[70px] h-[56px] bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-[16px] bg-gray-200 rounded w-[50%] mb-2 animate-pulse"></div>
          <div className="h-[14px] bg-gray-200 rounded w-[40%] mb-2 animate-pulse"></div>
          <div className="h-[12px] bg-gray-200 rounded w-[70%] mb-1 animate-pulse"></div>
          <div className="h-[12px] bg-gray-200 rounded w-[50%] animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  // 空状态
  const EmptyState = ({ type }) => (
    <div className="flex flex-col items-center justify-center py-16">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="38" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4"/>
        <circle cx="33" cy="33" r="2" fill="#D1D5DB"/>
        <circle cx="47" cy="33" r="2" fill="#D1D5DB"/>
        <path d="M35 45C35 45 37 48 40 48C43 48 45 45 45 45" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <div className="text-[14px] text-gray-400 mt-4">暂无数据</div>
    </div>
  );

  // ====== 各 Tab 的卡片组件 ======

  // 资产 Tab
  const AssetCard = ({ item }) => (
    <div className="flex items-center gap-3 py-4 border-b border-gray-100">
      <DeviceImage src={item.image} name={item.name} />
      <div className="flex-1 min-w-0">
        <div className="text-[16px] font-bold text-gray-800">
          {searchText ? highlightText(item.code, searchText) : item.code}
          <span className="font-normal text-gray-600 text-[14px] ml-2">{item.name}</span>
        </div>
        <div className="text-[13px] text-gray-400 mt-1">
          {item.hours}{item.time ? `, ${item.time}` : ''}
        </div>
        <div className="text-[13px] text-gray-400">{item.location}</div>
      </div>
    </div>
  );

  // 品牌 Tab
  const BrandCard = ({ item }) => (
    <div className="py-4 border-b border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-[50px] h-[50px] bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-[18px] font-bold text-gray-600">{item.name.charAt(0)}</span>
        </div>
        <div className="flex-1">
          <div className="text-[16px] font-bold text-gray-800">
            {searchText ? highlightText(item.name, searchText) : item.name}
          </div>
          <div className="text-[13px] text-gray-400">{item.code}</div>
          <div className="text-[12px] text-gray-400 mt-1">{item.deviceCount} 台设备</div>
        </div>
      </div>
      <div className="flex gap-4 ml-[62px]">
        <div className="flex flex-col items-center">
          <div className="w-[44px] h-[44px] bg-gray-100 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="8" width="18" height="12" rx="2" stroke="#666" strokeWidth="1.5"/>
              <circle cx="8" cy="20" r="2" stroke="#666" strokeWidth="1.5"/>
              <circle cx="16" cy="20" r="2" stroke="#666" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className="text-[11px] text-blue-500 mt-1">资产</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[44px] h-[44px] bg-gray-100 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="3" width="14" height="18" rx="2" stroke="#666" strokeWidth="1.5"/>
              <path d="M9 8H15M9 12H15M9 16H12" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[11px] text-blue-500 mt-1">审核</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[44px] h-[44px] bg-gray-100 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#666" strokeWidth="1.5"/>
              <path d="M12 7V12L15 15" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[11px] text-blue-500 mt-1">使用情况</span>
        </div>
      </div>
    </div>
  );

  // 设备类型 Tab
  const DeviceTypeCard = ({ item }) => (
    <div className="flex items-center gap-3 py-4 border-b border-gray-100">
      <DeviceImage src={item.image} name={item.name} size="small" />
      <div className="flex-1">
        <div className="text-[16px] font-bold text-gray-800">
          {searchText ? highlightText(item.name, searchText) : item.name}
        </div>
        <div className="text-[13px] text-gray-400">{item.code}</div>
        <div className="text-[12px] text-gray-400 mt-1">{item.deviceCount} 台设备</div>
      </div>
    </div>
  );

  // 配件 Tab
  const AccessoryCard = ({ item }) => (
    <div className="flex items-center gap-3 py-4 border-b border-gray-100">
      <DeviceImage src={item.image} name={item.name} size="small" />
      <div className="flex-1">
        <div className="text-[16px] font-bold text-gray-800">
          {searchText ? highlightText(item.name, searchText) : item.name}
        </div>
        <div className="text-[13px] text-gray-400">{item.code}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[13px] text-red-500 font-medium">{item.price}</span>
          <span className={`text-[12px] px-2 py-0.5 rounded ${item.stock === '有货' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {item.stock}
          </span>
        </div>
      </div>
    </div>
  );

  // 设备分组 Tab
  const DeviceGroupCard = ({ item }) => (
    <div className="flex items-center gap-3 py-4 border-b border-gray-100">
      <div className="w-[50px] h-[50px] bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="8" cy="8" r="3" stroke="#8B5CF6" strokeWidth="1.5"/>
          <circle cx="16" cy="8" r="3" stroke="#8B5CF6" strokeWidth="1.5"/>
          <circle cx="8" cy="16" r="3" stroke="#8B5CF6" strokeWidth="1.5"/>
          <circle cx="16" cy="16" r="3" stroke="#8B5CF6" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className="flex-1">
        <div className="text-[16px] font-bold text-gray-800">
          {searchText ? highlightText(item.name, searchText) : item.name}
        </div>
        <div className="text-[13px] text-gray-400">{item.code}</div>
        <div className="text-[12px] text-gray-400 mt-1">{item.deviceCount} 台设备</div>
      </div>
    </div>
  );

  // 根据 Tab 渲染卡片
  const renderCard = (item) => {
    switch (activeTab) {
      case '资产': return <AssetCard item={item} />;
      case '品牌': return <BrandCard item={item} />;
      case '设备类型': return <DeviceTypeCard item={item} />;
      case '配件': return <AccessoryCard item={item} />;
      case '设备分组': return <DeviceGroupCard item={item} />;
      default: return <AssetCard item={item} />;
    }
  };

  // 获取当前 Tab 的数据（有搜索词用搜索结果，无搜索词用默认数据）
  const currentData = searchText
    ? (searchResults[activeTab] || [])
    : (defaultData[activeTab] || []);

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col">
      {/* 状态栏 */}
      <div className="h-[44px] flex items-center justify-between px-4 bg-white">
        <span className="text-black text-[14px] font-medium">9:41</span>
        <div className="flex items-center gap-1">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M1 8H3V12H1V8Z" fill="#333"/>
            <path d="M5 5H7V12H5V5Z" fill="#333"/>
            <path d="M9 3H11V12H9V3Z" fill="#333"/>
            <path d="M13 0H15V12H13V0Z" fill="#333"/>
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 2C10.76 2 13.07 3.61 14.1 6L15.5 4.5C14.14 2.58 11.23 1 8 1C4.77 1 1.86 2.58 0.5 4.5L1.9 6C2.93 3.61 5.24 2 8 2Z" fill="#333"/>
            <path d="M8 5C9.66 5 11.14 5.69 12.11 6.88L13.5 5.5C12.2 3.98 10.21 3 8 3C5.79 3 3.8 3.98 2.5 5.5L3.89 6.88C4.86 5.69 6.34 5 8 5Z" fill="#333"/>
            <path d="M8 8C8.83 8 9.58 8.34 10.12 8.9L11.5 7.5C10.6 6.6 9.37 6 8 6C6.63 6 5.4 6.6 4.5 7.5L5.88 8.9C6.42 8.34 7.17 8 8 8Z" fill="#333"/>
            <circle cx="8" cy="11" r="1.5" fill="#333"/>
          </svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="#333" strokeOpacity="0.35"/>
            <rect x="2" y="2" width="18" height="8" rx="1" fill="#333"/>
            <path d="M23 4V8C23.5523 8 24 7.5523 24 7V5C24 4.4477 23.5523 4 23 4Z" fill="#333" fillOpacity="0.4"/>
          </svg>
        </div>
      </div>

      {/* 顶部导航栏 */}
      <div className="flex items-center px-4 py-3 bg-white">
        <div className="cursor-pointer mr-3" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex-1 h-[40px] bg-gray-100 rounded-full flex items-center px-4">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mr-2 flex-shrink-0">
            <circle cx="8" cy="8" r="6" stroke="#999" strokeWidth="1.5"/>
            <path d="M12.5 12.5L16 16" stroke="#999" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-[16px] text-gray-800"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            maxLength={50}
          />
          {searchText && (
            <div className="cursor-pointer ml-2 flex-shrink-0" onClick={handleClear}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" fill="#ccc"/>
                <path d="M6 6L12 12M12 6L6 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* 分类 Tab */}
      <div className="flex px-4 py-2 gap-2 bg-white overflow-x-auto">
        {tabs.map((tab) => {
          const count = searchText && searchResults[tab] ? searchResults[tab].length : null;
          return (
            <div
              key={tab}
              className={`px-4 py-2 rounded-full text-[14px] cursor-pointer flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
                activeTab === tab
                  ? 'bg-gray-800 text-white font-medium'
                  : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {isLoading && (
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              )}
              {count !== null && !isLoading && (
                <span className="text-[12px]">({count})</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto bg-white px-4 py-3">
        {/* 无搜索词时显示"最近查看"标题 */}
        {!searchText && (
          <div className="text-[16px] font-bold text-gray-800 mb-4">最近查看</div>
        )}
        {isLoading ? (
          <div>
            {[1, 2, 3].map((item) => (
              <SkeletonItem key={item} />
            ))}
          </div>
        ) : currentData.length > 0 ? (
          currentData.map((item) => (
            <React.Fragment key={item.id}>
              {renderCard(item)}
            </React.Fragment>
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default SearchPage;

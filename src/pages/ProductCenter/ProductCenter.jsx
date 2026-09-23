import React, { useState, useMemo } from 'react';

// 预置三一全系列产品分类与型号数据
const PRODUCT_CATEGORIES = [
  { id: 'concrete', name: '混凝土机械' },
  { id: 'excavator', name: '挖掘机' },
  { id: 'crane', name: '起重机' },
  { id: 'road', name: '路面机械' },
];

const SUB_CATEGORIES_MAP = {
  concrete: [
    { id: 'pump_truck', name: '泵车', image: 'images/机手社区/泵车/泵车_01.png' },
    { id: 'trailer_pump', name: '拖泵', image: 'images/机手社区/泵车/泵车_07.png' },
    { id: 'truck_mounted_pump', name: '车载泵', image: 'images/机手社区/泵车/泵车_02.png' },
    { id: 'placing_boom', name: '布料杆', image: 'images/机手社区/泵车/泵车_03.png' },
    { id: 'mixer_truck', name: '搅拌车', image: 'images/机手社区/搅拌车/搅拌车_01.jpg' },
    { id: 'batching_plant', name: '搅拌站', image: 'images/机手社区/搅拌车/搅拌车_02.jpg' },
  ],
  excavator: [
    { id: 'mini_excavator', name: '微型挖掘机', image: 'images/机手社区/挖掘机/挖掘机_01.jpg' },
    { id: 'small_excavator', name: '小型挖掘机', image: 'images/机手社区/挖掘机/挖掘机_02.jpg' },
    { id: 'medium_excavator', name: '中型挖掘机', image: 'images/机手社区/挖掘机/挖掘机_03.jpg' },
    { id: 'large_excavator', name: '大型挖掘机', image: 'images/机手社区/挖掘机/挖掘机_04.jpg' },
  ],
  crane: [
    { id: 'truck_crane', name: '汽车起重机', image: 'images/行业动态/三一起重机/三一起重机_01.jpg' },
    { id: 'all_terrain_crane', name: '全地面起重机', image: 'images/行业动态/三一起重机/三一起重机_02.jpg' },
    { id: 'crawler_crane', name: '履带起重机', image: 'images/行业动态/三一起重机/三一起重机_03.jpg' },
  ],
  road: [
    { id: 'roller', name: '压路机', image: 'images/行业动态/压路机/压路机_01.jpg' },
    { id: 'paver', name: '摊铺机', image: 'images/行业动态/压路机/压路机_02.jpg' },
    { id: 'milling_machine', name: '铣刨机', image: 'images/行业动态/铣刨机/铣刨机_01.jpg' },
  ],
};

const PRODUCT_MODELS_DATA = {
  pump_truck: [
    {
      code: 'SYM5180THBES 30C-8',
      name: '车载混凝土泵',
      region: ['global', 'china'],
      image: 'images/机手社区/泵车/泵车_01.png',
      specs: [
        { label: '垂直达到距离', value: '30.1 m' },
        { label: '压力', value: '6 MPa' },
        { label: '输出', value: '101 m³/h' },
      ],
      fullSpecs: [
        { label: '垂直达到距离', value: '30.1 m' },
        { label: '压力', value: '6 MPa' },
        { label: '输出', value: '101 m³/h' },
        { label: '理论输送量', value: '101 m³/h' },
        { label: '最大骨料粒径', value: '40 mm' },
        { label: '底盘型号', value: 'SYM5180THB' },
        { label: '发动机功率', value: '199 kW / 2200 rpm' },
        { label: '整备质量', value: '17900 kg' },
      ],
    },
    {
      code: 'SYG5210THB 30V8(SZ-AUS)',
      name: '混凝土泵车 (澳洲版)',
      region: ['global'],
      image: 'images/机手社区/泵车/泵车_07.png',
      specs: [
        { label: '垂直达到距离', value: '30.1 m' },
        { label: '压力', value: '6 MPa' },
        { label: '输出', value: '101 m³/h' },
      ],
      fullSpecs: [
        { label: '垂直达到距离', value: '30.1 m' },
        { label: '压力', value: '6 MPa' },
        { label: '输出', value: '101 m³/h' },
        { label: '臂架节数', value: '4节 R型' },
        { label: '液压系统', value: '开式液压系统' },
        { label: '整车尺寸', value: '9850×2500×3750 mm' },
      ],
    },
    {
      code: 'SYM5330THBEV 370C-10',
      name: '电动臂架泵车',
      region: ['china', 'global'],
      image: 'images/机手社区/泵车/泵车_02.png',
      specs: [
        { label: '垂直达到距离', value: '37.0 m' },
        { label: '压力', value: '8.5 MPa' },
        { label: '输出', value: '160 m³/h' },
      ],
      fullSpecs: [
        { label: '垂直达到距离', value: '37.0 m' },
        { label: '压力', value: '8.5 MPa' },
        { label: '输出', value: '160 m³/h' },
        { label: '动力类型', value: '纯电动 (EV)' },
        { label: '电池容量', value: '282 kWh' },
      ],
    },
  ],
  trailer_pump: [
    {
      code: 'HBT6018C-5D',
      name: '超高压拖泵',
      region: ['china', 'global'],
      image: 'images/机手社区/泵车/泵车_07.png',
      specs: [
        { label: '最大理论输送量', value: '60 m³/h' },
        { label: '最大混凝土出口压力', value: '18 MPa' },
        { label: '电机功率', value: '110 kW' },
      ],
      fullSpecs: [
        { label: '最大理论输送量', value: '60 m³/h' },
        { label: '最大混凝土出口压力', value: '18 MPa' },
        { label: '电机功率', value: '110 kW' },
        { label: '输送缸径/行程', value: '200 / 1650 mm' },
      ],
    },
  ],
  truck_mounted_pump: [
    {
      code: 'SYM5180THBES 30C-8',
      name: '车载混凝土泵',
      region: ['global', 'china'],
      image: 'images/机手社区/泵车/泵车_01.png',
      specs: [
        { label: '垂直达到距离', value: '30.1 m' },
        { label: '压力', value: '6 MPa' },
        { label: '输出', value: '101 m³/h' },
      ],
      fullSpecs: [
        { label: '垂直达到距离', value: '30.1 m' },
        { label: '压力', value: '6 MPa' },
        { label: '输出', value: '101 m³/h' },
      ],
    },
  ],
  placing_boom: [
    {
      code: 'HGY28',
      name: '液压布料机',
      region: ['china', 'global'],
      image: 'images/机手社区/泵车/泵车_03.png',
      specs: [
        { label: '作业半径', value: '28 m' },
        { label: '臂架节数', value: '3节' },
        { label: '回转角度', value: '360°' },
      ],
      fullSpecs: [
        { label: '作业半径', value: '28 m' },
        { label: '臂架节数', value: '3节' },
        { label: '回转角度', value: '360°' },
      ],
    },
  ],
};

const COUNTRY_OPTIONS = [
  { code: '+86', name: '中国', flag: '🇨🇳' },
  { code: '+1', name: '美国', flag: '🇺🇸' },
  { code: '+44', name: '英国', flag: '🇬🇧' },
  { code: '+49', name: '德国', flag: '🇩🇪' },
  { code: '+33', name: '法国', flag: '🇫🇷' },
  { code: '+971', name: '阿联酋', flag: '🇦🇪' },
  { code: '+61', name: '澳大利亚', flag: '🇦🇺' },
  { code: '+84', name: '越南', flag: '🇻🇳' },
  { code: '+66', name: '泰国', flag: '🇹🇭' },
  { code: '+7', name: '俄罗斯', flag: '🇷🇺' },
];

// 基线产品中心（db62a7e 登录态：标准单个产品详情视图）
const BaselineProductCenter = ({ onBack, initialItem }) => {
  const product = initialItem || {
    name: '车载混凝土泵',
    code: 'SYM5180THBES 30C-8',
    image: 'images/asset-models/sany_pump.jpg',
  };

  return (
    <div className="flex h-full flex-col bg-white text-gray-900">
      <header className="flex h-[56px] flex-shrink-0 items-center border-b border-gray-100 px-4">
        <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-gray-100" aria-label="返回">
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <h1 className="flex-1 pr-9 text-center text-[17px] font-semibold">产品中心</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-5">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_5px_20px_rgba(31,41,55,0.07)]">
          <div className="flex h-[280px] items-center justify-center bg-[#fafafa] p-5">
            <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
          </div>
          <div className="px-5 py-5 text-center">
            <h2 className="text-[22px] font-semibold leading-8">{product.name || '--'}</h2>
            <div className="mt-3 inline-flex max-w-full items-center rounded-lg bg-gray-50 px-4 py-2 text-[15px] leading-5 tabular-nums text-gray-700">
              <span className="truncate" title={product.code}>{product.code || '--'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// 游客体验模式专属产品中心（b5ded1b：多级品类、型号、对比与询价）
const GuestProductCenter = ({ onBack, initialItem, onRequireLogin }) => {
  // 视图控制: 'categories' (图1) | 'modelList' (图2) | 'detail' (图3) | 'inquiry' (图4)
  const [currentView, setCurrentView] = useState(initialItem ? 'detail' : 'categories');

  // 分类与筛选状态
  const [activeCategory, setActiveCategory] = useState('concrete');
  const [activeSubCategory, setActiveSubCategory] = useState('pump_truck');
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('global'); // 'china' | 'global'
  const [comparedCodes, setComparedCodes] = useState([]); // PK 对比池

  // 选中的当前产品
  const [selectedProduct, setSelectedProduct] = useState(() => {
    if (initialItem) {
      return {
        code: initialItem.code || 'SYM5180THBES 30C-8',
        name: initialItem.name || '车载混凝土泵',
        image: initialItem.image || 'images/机手社区/泵车/泵车_01.png',
        specs: initialItem.specs || [
          { label: '垂直达到距离', value: '30.1 m' },
          { label: '压力', value: '6 MPa' },
          { label: '输出', value: '101 m³/h' },
        ],
        fullSpecs: initialItem.fullSpecs || [
          { label: '垂直达到距离', value: '30.1 m' },
          { label: '压力', value: '6 MPa' },
          { label: '输出', value: '101 m³/h' },
          { label: '理论输送量', value: '101 m³/h' },
          { label: '底盘型号', value: 'SYM5180THB' },
        ],
      };
    }
    return PRODUCT_MODELS_DATA.pump_truck[0];
  });

  // 详情页收藏状态与轻提示
  const [isFavorite, setIsFavorite] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 询价信息表单数据（游客需要手动填写联系人、手机号、邮箱和国家/地区）
  const [inquiryForm, setInquiryForm] = useState({
    contactName: '张华杰',
    phoneCode: '+86',
    phoneNumber: '17673841261',
    email: '2874329754@qq.com',
    country: '中国',
  });
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showInquirySuccess, setShowInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2000);
  };

  // 切换 PK 比较状态
  const toggleCompare = (e, code) => {
    e.stopPropagation();
    setComparedCodes((prev) => {
      if (prev.includes(code)) {
        showToast(`已从比较中移除 ${code}`);
        return prev.filter((c) => c !== code);
      }
      if (prev.length >= 4) {
        showToast('最多同时比较 4 款设备');
        return prev;
      }
      showToast(`已加入产品比较 (${prev.length + 1}/4)`);
      return [...prev, code];
    });
  };

  // 复制型号
  const handleCopyCode = (code) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    showToast('型号已复制到剪贴板');
  };

  // 返回上一层逻辑
  const handleHeaderBack = () => {
    if (currentView === 'inquiry') {
      setCurrentView('detail');
    } else if (currentView === 'detail') {
      if (initialItem) {
        onBack();
      } else {
        setCurrentView('modelList');
      }
    } else if (currentView === 'modelList') {
      setCurrentView('categories');
    } else {
      onBack();
    }
  };

  // 回到产品中心首页
  const handleGoHome = () => {
    setCurrentView('categories');
  };

  // 提交询价表单
  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!inquiryForm.contactName.trim()) {
      setInquiryError('请填写联系人姓名');
      return;
    }
    if (!inquiryForm.phoneNumber.trim()) {
      setInquiryError('请填写手机号码');
      return;
    }
    setInquiryError('');
    setShowInquirySuccess(true);
  };

  // 计算当前子品类和产品列表
  const currentSubCategories = SUB_CATEGORIES_MAP[activeCategory] || [];

  const currentModels = useMemo(() => {
    const list = PRODUCT_MODELS_DATA[activeSubCategory] || PRODUCT_MODELS_DATA.pump_truck;
    return list.filter((item) => {
      if (regionFilter === 'china' && !item.region.includes('china')) return false;
      return true;
    });
  }, [activeSubCategory, regionFilter]);

  // ==================== 视图 1：产品分类大厅 (图 1) ====================
  const renderCategoriesView = () => {
    return (
      <div className="flex h-full flex-col bg-white text-gray-900">
        {/* 顶部标题栏 */}
        <header className="flex h-12 flex-shrink-0 items-center px-4">
          <button
            type="button"
            onClick={handleHeaderBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-800 active:bg-gray-100"
            aria-label="返回"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="ml-1 text-[20px] font-bold text-gray-900">产品</h1>
        </header>

        {/* 一级分类 Tab 栏 */}
        <div className="flex flex-shrink-0 items-center border-b border-gray-100 px-3">
          <div className="flex flex-1 space-x-6 overflow-x-auto py-2.5 scrollbar-none text-[15px]">
            {PRODUCT_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    const subs = SUB_CATEGORIES_MAP[cat.id];
                    if (subs && subs.length > 0) {
                      setActiveSubCategory(subs[0].id);
                    }
                  }}
                  className={`relative flex-shrink-0 pb-1 font-medium transition-colors ${
                    isActive ? 'font-bold text-[#E01923]' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <span>{cat.name}</span>
                  {isActive && (
                    <span className="absolute bottom-[-1px] left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-[#E01923]" />
                  )}
                </button>
              );
            })}
          </div>
          {/* 折叠菜单图标 */}
          <button
            type="button"
            onClick={() => showToast('分类抽屉功能准备中')}
            className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center text-gray-700"
            aria-label="更多分类"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round" />
              <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
              <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 搜索栏 */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex h-10 w-full items-center rounded-full bg-[#F3F4F6] px-4 text-gray-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 text-gray-400">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索产品"
              className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        {/* 分类产品网格 (双列卡片) */}
        <div className="flex-1 overflow-y-auto px-4 pb-12 pt-2">
          <h2 className="mb-3 text-[16px] font-bold text-gray-900">
            {PRODUCT_CATEGORIES.find((c) => c.id === activeCategory)?.name}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {currentSubCategories.map((sub) => (
              <div
                key={sub.id}
                onClick={() => {
                  setActiveSubCategory(sub.id);
                  setCurrentView('modelList');
                }}
                className="group flex flex-col items-center justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:shadow-md cursor-pointer active:bg-gray-50"
              >
                <div className="flex h-24 w-full items-center justify-center p-1">
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="max-h-full max-w-full object-contain transition duration-200 group-hover:scale-105"
                  />
                </div>
                <div className="mt-3 text-center text-[15px] font-medium text-gray-900">{sub.name}</div>
              </div>
            ))}
          </div>

          {/* 如果是混凝土机械，在下方追加其他分类示例以展现丰富度 */}
          {activeCategory === 'concrete' && (
            <div className="mt-6">
              <h2 className="mb-3 text-[16px] font-bold text-gray-900">挖掘机</h2>
              <div className="grid grid-cols-2 gap-3">
                {SUB_CATEGORIES_MAP.excavator.slice(0, 2).map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setActiveCategory('excavator');
                      setActiveSubCategory(sub.id);
                      setCurrentView('modelList');
                    }}
                    className="flex flex-col items-center justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer active:bg-gray-50"
                  >
                    <div className="flex h-24 w-full items-center justify-center p-1">
                      <img src={sub.image} alt={sub.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="mt-3 text-center text-[15px] font-medium text-gray-900">{sub.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==================== 视图 2：品类与型号列表页 (图 2) ====================
  const renderModelListView = () => {
    const activeCategoryObj = PRODUCT_CATEGORIES.find((c) => c.id === activeCategory);

    return (
      <div className="flex h-full flex-col bg-[#F9FAFB] text-gray-900">
        {/* 顶部标题栏 */}
        <header className="flex h-12 flex-shrink-0 items-center justify-between bg-white px-4">
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleHeaderBack}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-800 active:bg-gray-100"
              aria-label="返回"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="ml-1 text-[18px] font-bold text-gray-900">{activeCategoryObj?.name || '混凝土机械'}</h1>
          </div>
          <button
            type="button"
            onClick={() => showToast('搜索已启用')}
            className="flex h-9 w-9 items-center justify-center text-gray-800"
            aria-label="搜索"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </header>

        {/* 二级子品类 Pills 横划过滤 */}
        <div className="flex flex-shrink-0 items-center bg-white px-3 pb-3">
          <div className="flex flex-1 space-x-2 overflow-x-auto py-1 scrollbar-none">
            {currentSubCategories.map((sub) => {
              const isSelected = activeSubCategory === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setActiveSubCategory(sub.id)}
                  className={`flex-shrink-0 rounded-full px-4 py-1.5 text-[14px] font-medium transition ${
                    isSelected
                      ? 'bg-[#18181B] text-white shadow-sm'
                      : 'bg-[#F3F4F6] text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
          {/* 筛选漏斗图标 */}
          <button
            type="button"
            onClick={() => showToast('更多高级筛选')}
            className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center text-gray-700"
            aria-label="高级筛选"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
        </div>

        {/* 可售地区过滤条 */}
        <div className="flex flex-shrink-0 items-center px-4 py-2 text-[14px] text-gray-600">
          <span className="mr-2">可售地区:</span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setRegionFilter('china')}
              className={`rounded-md px-3 py-1 text-[13px] font-medium transition ${
                regionFilter === 'china'
                  ? 'bg-[#18181B] text-white'
                  : 'border border-gray-200 bg-white text-gray-700'
              }`}
            >
              中国
            </button>
            <button
              type="button"
              onClick={() => setRegionFilter('global')}
              className={`rounded-md px-3 py-1 text-[13px] font-medium transition ${
                regionFilter === 'global'
                  ? 'bg-[#18181B] text-white'
                  : 'border border-gray-200 bg-white text-gray-700'
              }`}
            >
              全球
            </button>
          </div>
        </div>

        {/* 产品型号列表 */}
        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-12 pt-1">
          {currentModels.length === 0 ? (
            <div className="py-12 text-center text-gray-400">暂无符合该筛选条件的型号</div>
          ) : (
            currentModels.map((model) => {
              const isCompared = comparedCodes.includes(model.code);
              return (
                <div
                  key={model.code}
                  onClick={() => {
                    setSelectedProduct(model);
                    setCurrentView('detail');
                  }}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] cursor-pointer active:scale-[0.99] transition"
                >
                  {/* 卡片头部：型号与 PK 按钮 */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-[17px] font-bold tracking-tight text-gray-900">{model.code}</h3>
                    <button
                      type="button"
                      onClick={(e) => toggleCompare(e, model.code)}
                      className={`flex items-center space-x-1 rounded-md px-2 py-0.5 text-[14px] font-extrabold italic transition ${
                        isCompared ? 'bg-red-50 text-[#E01923] ring-1 ring-red-400' : 'text-[#E01923] hover:bg-red-50'
                      }`}
                      aria-label="PK 对比"
                    >
                      <span>PK</span>
                    </button>
                  </div>

                  {/* 产品主图 */}
                  <div className="my-2 flex h-48 w-full items-center justify-center overflow-hidden py-1">
                    <img src={model.image} alt={model.name} className="max-h-full max-w-full object-contain" />
                  </div>

                  {/* 关键技术参数列表 */}
                  <div className="mt-2 space-y-1.5 border-t border-gray-50 pt-2 text-[14px]">
                    {model.specs.map((sp, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-gray-500">{sp.label}</span>
                        <span className="font-semibold text-gray-900">{sp.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // ==================== 视图 3：产品详情页 (图 3) ====================
  const renderDetailView = () => {
    return (
      <div className="flex h-full flex-col bg-[#F9FAFB] text-gray-900">
        {/* 顶部标题栏 */}
        <header className="flex h-12 flex-shrink-0 items-center justify-between bg-white px-4">
          <button
            type="button"
            onClick={handleHeaderBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-800 active:bg-gray-100"
            aria-label="返回"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-[17px] font-bold text-gray-900">产品详情</h1>
          <div className="flex items-center space-x-2">
            {/* 收藏心形 */}
            <button
              type="button"
              onClick={() => {
                setIsFavorite(!isFavorite);
                showToast(isFavorite ? '已取消收藏' : '已添加至我的收藏');
              }}
              className="flex h-9 w-9 items-center justify-center text-gray-700"
              aria-label="收藏"
            >
              {isFavorite ? (
                <svg width="21" height="21" viewBox="0 0 24 24" fill="#E01923" stroke="#E01923" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              ) : (
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
            </button>
            {/* 主页图标 */}
            <button
              type="button"
              onClick={handleGoHome}
              className="flex h-9 w-9 items-center justify-center text-gray-700"
              aria-label="产品主页"
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
          </div>
        </header>

        {/* 页面主体内容 */}
        <main className="flex-1 overflow-y-auto pb-6">
          {/* 大图展示 */}
          <div className="flex h-64 w-full items-center justify-center bg-white p-4">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* 产品标题与型号复制 */}
          <div className="bg-white px-4 pb-5 pt-2 text-center">
            <h2 className="text-[22px] font-bold text-gray-900">{selectedProduct.name}</h2>
            <div className="mt-2.5 inline-flex items-center rounded-md bg-[#F3F4F6] px-3 py-1.5 text-[14px] text-gray-700">
              <span className="font-medium mr-2">{selectedProduct.code}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(selectedProduct.code)}
                className="text-gray-500 hover:text-gray-900"
                aria-label="复制型号"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="13" height="13" x="9" y="9" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* 整机详情小节 */}
          <div className="mt-3 px-4">
            <div className="mb-3 flex items-center">
              <div className="mr-2 h-4 w-1 rounded-full bg-[#E01923]" />
              <h3 className="text-[17px] font-bold text-gray-900">整机详情</h3>
            </div>

            {/* 规格卡片堆栈 */}
            <div className="space-y-3">
              {(selectedProduct.fullSpecs || selectedProduct.specs).map((sp, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-center rounded-xl bg-[#F3F4F6] px-4 py-3"
                >
                  <span className="text-[13px] text-gray-500">{sp.label}</span>
                  <span className="mt-1 text-[17px] font-bold text-gray-900">{sp.value}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* 底部吸底操作栏 (吸附在手机容器底部) */}
        <footer className="flex-shrink-0 flex h-16 items-center space-x-3 border-t border-gray-100 bg-white px-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={() => {
              toggleCompare({ stopPropagation: () => {} }, selectedProduct.code);
            }}
            className="flex-1 h-11 rounded-lg border border-gray-300 bg-white text-[15px] font-bold text-gray-900 active:bg-gray-50"
          >
            产品比较
          </button>
          <button
            type="button"
            onClick={() => {
              if (onRequireLogin) {
                onRequireLogin();
                return;
              }
              // 自动将当前选中的设备型号带入询价表单
              setCurrentView('inquiry');
            }}
            className="flex-1 h-11 rounded-lg bg-[#E01923] text-[15px] font-bold text-white shadow-md active:bg-[#c4151e]"
          >
            请求报价
          </button>
        </footer>
      </div>
    );
  };

  // ==================== 视图 4：询价信息 / 请求报价表单页 (图 4) ====================
  const renderInquiryView = () => {
    return (
      <div className="flex h-full flex-col bg-white text-gray-900">
        {/* 顶部标题栏 */}
        <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-gray-100 px-4">
          <button
            type="button"
            onClick={handleHeaderBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-800 active:bg-gray-100"
            aria-label="返回"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-[17px] font-bold text-gray-900">询价信息</h1>
          <div className="w-9" />
        </header>

        {/* 表单主体 */}
        <form onSubmit={handleInquirySubmit} className="flex-1 overflow-y-auto px-4 pb-6 pt-3 space-y-3">
          {/* 字段 1：设备信息展示 (游客未登录只能获取设备信息，不可编辑) */}
          <div className="rounded-xl bg-[#F3F4F6] p-3.5">
            <div className="text-[13px] text-gray-500">设备</div>
            <div className="mt-1 text-[16px] font-bold text-gray-700">{selectedProduct.code}</div>
          </div>

          {/* 字段 2：联系人 (需手动填写) */}
          <div className="rounded-xl bg-[#F3F4F6] p-3.5">
            <div className="flex items-center text-[13px] text-gray-600">
              <span className="mr-0.5 text-red-500">*</span>联系人
            </div>
            <div className="mt-1 flex items-center justify-between">
              <input
                type="text"
                value={inquiryForm.contactName}
                onChange={(e) => setInquiryForm({ ...inquiryForm, contactName: e.target.value })}
                placeholder="请输入联系人姓名"
                className="w-full bg-transparent text-[16px] font-medium text-gray-900 outline-none"
              />
              {inquiryForm.contactName && (
                <button
                  type="button"
                  onClick={() => setInquiryForm({ ...inquiryForm, contactName: '' })}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-gray-600"
                  aria-label="清空联系人"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 字段 3：手机号码 (区号 + 号码，需手动填写) */}
          <div className="flex space-x-2">
            {/* 区号选择器 */}
            <button
              type="button"
              onClick={() => setShowCountryPicker(true)}
              className="flex h-[72px] items-center justify-center rounded-xl bg-[#F3F4F6] px-4 text-[16px] font-bold text-gray-900"
            >
              <span>{inquiryForm.phoneCode}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-1 text-gray-500">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>

            {/* 号码输入框 */}
            <div className="flex-1 rounded-xl bg-[#F3F4F6] p-3.5">
              <div className="flex items-center text-[13px] text-gray-600">
                <span className="mr-0.5 text-red-500">*</span>手机号码
              </div>
              <div className="mt-1 flex items-center justify-between">
                <input
                  type="tel"
                  value={inquiryForm.phoneNumber}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, phoneNumber: e.target.value })}
                  placeholder="请输入手机号码"
                  className="w-full bg-transparent text-[16px] font-medium text-gray-900 outline-none"
                />
                {inquiryForm.phoneNumber && (
                  <button
                    type="button"
                    onClick={() => setInquiryForm({ ...inquiryForm, phoneNumber: '' })}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-gray-600"
                    aria-label="清空手机号码"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 字段 4：邮箱 (需手动填写) */}
          <div className="rounded-xl bg-[#F3F4F6] p-3.5">
            <div className="flex items-center text-[13px] text-gray-600">
              邮箱
            </div>
            <div className="mt-1 flex items-center justify-between">
              <input
                type="email"
                value={inquiryForm.email}
                onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                placeholder="请输入邮箱"
                className="w-full bg-transparent text-[16px] font-medium text-gray-900 outline-none"
              />
              {inquiryForm.email && (
                <button
                  type="button"
                  onClick={() => setInquiryForm({ ...inquiryForm, email: '' })}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-gray-600"
                  aria-label="清空邮箱"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 字段 5：国家/地区 (需手动选择) */}
          <div
            onClick={() => setShowCountryPicker(true)}
            className="flex items-center justify-between rounded-xl bg-[#F3F4F6] p-3.5 cursor-pointer active:bg-gray-200 transition"
          >
            <div>
              <div className="flex items-center text-[13px] text-gray-600">
                <span className="mr-0.5 text-red-500">*</span>国家/地区
              </div>
              <div className="mt-1 text-[16px] font-medium text-gray-900">{inquiryForm.country}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>



          {inquiryError && (
            <div className="rounded-lg bg-red-50 p-2.5 text-[13px] text-red-600">
              {inquiryError}
            </div>
          )}
        </form>

        {/* 底部吸底提交按钮 (吸附在手机容器底部) */}
        <footer className="flex-shrink-0 border-t border-gray-100 bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={handleInquirySubmit}
            className="h-12 w-full rounded-xl bg-[#E01923] text-[16px] font-bold text-white shadow-md active:bg-[#c4151e] transition"
          >
            提交
          </button>
        </footer>

        {/* 国家/地区选择弹层 */}
        {showCountryPicker && (
          <div className="absolute inset-0 z-50 flex items-end bg-black/50" onClick={() => setShowCountryPicker(false)}>
            <div
              className="w-full rounded-t-2xl bg-white p-4 max-h-[70vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-[17px] font-bold text-gray-900">选择国家/地区与区号</h3>
                <button
                  type="button"
                  onClick={() => setShowCountryPicker(false)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {COUNTRY_OPTIONS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setInquiryForm({ ...inquiryForm, country: c.name, phoneCode: c.code });
                      setShowCountryPicker(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-gray-50 active:bg-gray-100"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{c.flag}</span>
                      <span className="text-[15px] font-medium text-gray-900">{c.name}</span>
                    </div>
                    <span className="text-[14px] text-gray-500">{c.code}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 提交成功弹窗 */}
        {showInquirySuccess && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="mt-4 text-[18px] font-bold text-gray-900">询价提交成功</h3>
              <p className="mt-2 text-[14px] text-gray-600">
                感谢您的垂询！已为您登记对设备 <span className="font-semibold text-gray-900">{selectedProduct.code}</span> 的报价请求，专属客户经理将在 24 小时内与联系人 <span className="font-semibold text-gray-900">{inquiryForm.contactName}</span> ({inquiryForm.phoneNumber}) 取得联系。
              </p>
              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowInquirySuccess(false);
                    setCurrentView('detail');
                  }}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[15px] font-medium text-gray-700 active:bg-gray-50"
                >
                  查看设备
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInquirySuccess(false);
                    setCurrentView('categories');
                  }}
                  className="flex-1 rounded-xl bg-[#E01923] py-2.5 text-[15px] font-bold text-white active:bg-[#c4151e]"
                >
                  产品中心
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      {/* 视图分发 */}
      {currentView === 'categories' && renderCategoriesView()}
      {currentView === 'modelList' && renderModelListView()}
      {currentView === 'detail' && renderDetailView()}
      {currentView === 'inquiry' && renderInquiryView()}

      {/* 轻提示 Toast */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-900/90 px-4 py-2 text-[13px] text-white shadow-lg backdrop-blur-sm transition">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

const ProductCenter = ({ onBack, initialItem, demoMode = false, onRequireLogin }) => {
  if (demoMode) {
    return <GuestProductCenter onBack={onBack} initialItem={initialItem} onRequireLogin={onRequireLogin} />;
  }
  return <BaselineProductCenter onBack={onBack} initialItem={initialItem} />;
};

export default ProductCenter;

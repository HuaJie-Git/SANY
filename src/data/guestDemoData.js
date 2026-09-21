export const GUEST_DEMO_DEVICES = [
  {
    id: 17,
    name: '挖掘机',
    displayName: '挖掘机',
    code: 'SY014CF0113D8',
    image: 'images/审核/挖掘机.jpg',
    status: 'online',
    statusText: '工作',
    statusColor: 'text-green-500',
    location: '苏州市·吴中施工区',
    todayHours: '0.01h',
    todayEnergy: '0.15L',
    auditCounts: { check: 1, exception: 99, maintenance: 37, fuel: 3, location: 0 },
  },
  {
    id: 16,
    name: '搅拌车',
    displayName: '搅拌车',
    code: 'HSGJ1051016142',
    image: 'images/img_mixer.jpg',
    status: 'offline',
    statusText: '离线',
    statusColor: 'text-gray-400',
    location: '太古漆油, 清甜街, 西草湾, 新界, 香港',
    todayHours: '3.32h',
    todayEnergy: '29%',
    auditCounts: { check: 2, exception: 4, maintenance: 12, fuel: 1, location: 0 },
  },
  {
    id: 18,
    name: '汽车起重机',
    displayName: '汽车起重机',
    code: 'AC0250CF0056',
    image: 'images/审核/起重机.jpg',
    status: 'offline',
    statusText: '离线',
    statusColor: 'text-gray-400',
    location: '43, Senoko Way, Sembawang, Singapore, 新加坡, 758054',
    todayHours: '0.06h',
    todayEnergy: '76.8%',
    auditCounts: { check: 3, exception: 8, maintenance: 15, fuel: 0, location: 2 },
  },
  {
    id: 21,
    name: '矿用宽体自卸车',
    displayName: '矿用宽体自卸车',
    code: 'KT090AE20208',
    image: 'images/机手社区/矿卡/矿卡_01.jpg',
    status: 'online',
    statusText: '工作',
    statusColor: 'text-green-500',
    location: '45H2+HF Simpang Empat Sungai Baru, Tanah Laut Regency, South Kalimantan, 印度尼西亚',
    todayHours: '0.14h',
    todayEnergy: '7L',
    auditCounts: { check: 2, exception: 11, maintenance: 20, fuel: 2, location: 1 },
  },
  {
    id: 19,
    name: '自卸车',
    displayName: '自卸车',
    code: 'HRZX2331008983',
    image: 'images/img_dumptruck.jpg',
    status: 'online',
    statusText: '停车',
    statusColor: 'text-blue-500',
    location: '67QG+XW Na Som, Chai Badan District, Lopburi, 泰国',
    todayHours: '0.0h',
    todayEnergy: '78%',
    auditCounts: { check: 1, exception: 5, maintenance: 16, fuel: 0, location: 0 },
  },
  {
    id: 20,
    name: '电动装载机',
    displayName: '电动装载机',
    code: 'SW970EACG0278',
    image: 'images/img_earthwork.jpg',
    status: 'online',
    statusText: '工作',
    statusColor: 'text-green-500',
    location: '4MWV+72 Khlong Khlung, Khlong Khlung District, Kamphaeng Phet, 泰国',
    todayHours: '0.28h',
    todayEnergy: '72%',
    auditCounts: { check: 2, exception: 7, maintenance: 19, fuel: 0, location: 1 },
  },
];

export const getGuestDemoDevice = (code) => GUEST_DEMO_DEVICES.find((device) => device.code === code);

export const GUEST_AUDIT_CATEGORIES = [
  { id: 'check', name: '检查异常' },
  { id: 'exception', name: '设备异常' },
  { id: 'maintenance', name: '维保事项' },
  { id: 'fuel', name: '燃油异常' },
  { id: 'location', name: '位置预警' },
];

// 游客模式专用演示产品数据（R-GUEST-SRCH-002）
export const GUEST_DEMO_PRODUCTS = [
  {
    id: 'p-1',
    name: '纯电搅拌车',
    model: 'SYM5310BEV-8001',
    code: 'MIX-DEMO-005',
    type: 'product',
    typeLabel: '产品',
    status: 'online',
    statusText: '行驶',
    image: 'images/审核/搅拌车.jpg',
    spec: '三一重工 · 纯电动混凝土搅拌运输车',
    location: '长沙市·宁乡产业园',
    deviceRefCode: 'MIX-DEMO-005',
  },
  {
    id: 'p-2',
    name: '三一挖掘机',
    model: 'SY365H',
    code: 'SY014CF0113D8',
    type: 'product',
    typeLabel: '产品',
    status: 'online',
    statusText: '工作',
    image: 'images/审核/挖掘机.jpg',
    spec: '三一重工 · 大型履带式液压挖掘机',
    location: '苏州市·吴中施工区',
    deviceRefCode: 'SY014CF0113D8',
  },
  {
    id: 'p-3',
    name: '汽车起重机',
    model: 'SAC1300C8',
    code: 'CRN-DEMO-002',
    type: 'product',
    typeLabel: '产品',
    status: 'online',
    statusText: '作业',
    image: 'images/审核/起重机.jpg',
    spec: '三一重工 · 全地面轮式起重机',
    location: '上海市·临港吊装区',
    deviceRefCode: 'CRN-DEMO-002',
  },
  {
    id: 'p-4',
    name: '自装卸车',
    model: 'SYZ320C-8',
    code: 'SLF-DEMO-003',
    type: 'product',
    typeLabel: '产品',
    status: 'offline', // STATE-SRCH-RESULT: 单条演示资源已下线时从结果中移除，不回落真实数据
    statusText: '离线',
    image: 'images/asset-models/sany_truck_pump.jpg',
    spec: '三一重工 · 城市工程自卸车',
    location: '广州市·南沙堆场',
    deviceRefCode: 'SLF-DEMO-003',
  },
  {
    id: 'p-5',
    name: '轮式装载机',
    model: 'SW955K',
    code: 'LDR-DEMO-004',
    type: 'product',
    typeLabel: '产品',
    status: 'online',
    statusText: '行驶',
    image: 'images/asset-models/sany_grader.jpg',
    spec: '三一重工 · 重载节能型轮式装载机',
    location: '成都市·天府土方区',
    deviceRefCode: 'LDR-DEMO-004',
  },
  {
    id: 'p-6',
    name: '宽体矿用自卸车',
    model: 'SKT90S',
    code: 'WBT-DEMO-006',
    type: 'product',
    typeLabel: '产品',
    status: 'online',
    statusText: '装载',
    image: 'images/审核/搅拌车.jpg',
    spec: '三一重工 · 非公路宽体矿用自卸车',
    location: '鄂尔多斯市·矿区运输线',
    deviceRefCode: 'WBT-DEMO-006',
  },
  {
    id: 'p-7',
    name: '车载混凝土泵',
    model: 'SYM5180THBES 30C-8',
    code: 'PUMP-DEMO-007',
    type: 'product',
    typeLabel: '产品',
    status: 'online',
    statusText: '待命',
    image: 'images/asset-models/sany_pump.jpg',
    spec: '三一重工 · 车载式超高压混凝土泵车',
    location: '长沙市·星沙产业园',
  },
];

// 游客模式专用演示配件数据（R-GUEST-SRCH-002, 14.5待确认项首期最小集合）
export const GUEST_DEMO_PARTS = [
  {
    id: 'part-1',
    name: '液压油滤芯',
    model: 'HF-6510',
    code: '10000001',
    type: 'part',
    typeLabel: '配件',
    status: 'online',
    image: 'images/配件/OIP.webp',
    price: '280',
    stock: '有现货',
    spec: '三一原厂 · 高精度高压液压过滤滤芯，适用 SY215/SY365',
  },
  {
    id: 'part-2',
    name: '空气滤芯总成',
    model: 'AF-2200',
    code: '10000002',
    type: 'part',
    typeLabel: '配件',
    status: 'online',
    image: 'images/配件/OIP (1).webp',
    price: '150',
    stock: '有现货',
    spec: '三一原厂 · 重载发动机进气双级滤清器',
  },
  {
    id: 'part-3',
    name: '机油滤清器',
    model: 'OF-1105',
    code: '10000003',
    type: 'part',
    typeLabel: '配件',
    status: 'online',
    image: 'images/配件/OIP (2).webp',
    price: '120',
    stock: '预订中',
    spec: '三一原厂 · 长效发动机润滑滤清器',
  },
  {
    id: 'part-4',
    name: '柴油粗滤滤芯',
    model: 'DF-3302',
    code: '10000004',
    type: 'part',
    typeLabel: '配件',
    status: 'online',
    image: 'images/配件/OIP (3).webp',
    price: '95',
    stock: '有现货',
    spec: '三一原厂 · 高压共轨柴油油水分离滤芯',
  },
  {
    id: 'part-5',
    name: '挖掘机履带板',
    model: 'TB-600',
    code: '10000005',
    type: 'part',
    typeLabel: '配件',
    status: 'online',
    image: 'images/配件/OIP (4).webp',
    price: '1200',
    stock: '有现货',
    spec: '三一原厂 · 高强度耐磨合金钢履带板，节距 216mm',
  },
  {
    id: 'part-6',
    name: '岩石型铲斗齿',
    model: 'BT-365R',
    code: '10000006',
    type: 'part',
    typeLabel: '配件',
    status: 'online',
    image: 'images/配件/OIP (5).webp',
    price: '350',
    stock: '有现货',
    spec: '三一原厂 · 加强型合金锻造斗齿含销套',
  },
];

// 本地纯前端检索逻辑，不请求任何外部或正式接口（R-GUEST-SRCH-002）
export const searchGuestDemoData = (rawKeyword, options = {}) => {
  const keyword = (rawKeyword || '').trim().toLowerCase();
  if (options.simulateError || keyword === '__error__') {
    const err = new Error('DEMO_DATA_LOAD_FAILED');
    err.code = 'LOCAL_DATA_ERROR';
    throw err;
  }
  if (!keyword) {
    return { products: [], parts: [], all: [], total: 0 };
  }

  // STATE-SRCH-RESULT: 单条演示资源已下线时从结果中移除，不回落真实数据
  const activeProducts = GUEST_DEMO_PRODUCTS.filter((item) => item.status !== 'offline');
  const activeParts = GUEST_DEMO_PARTS.filter((item) => item.status !== 'offline');

  const matchItem = (item) => {
    const name = (item.name || '').toLowerCase();
    const model = (item.model || '').toLowerCase();
    const code = (item.code || '').toLowerCase();
    return name.includes(keyword) || model.includes(keyword) || code.includes(keyword);
  };

  const matchedProducts = activeProducts.filter(matchItem);
  const matchedParts = activeParts.filter(matchItem);

  return {
    products: matchedProducts,
    parts: matchedParts,
    all: [...matchedProducts, ...matchedParts],
    total: matchedProducts.length + matchedParts.length,
  };
};

export const GUEST_SEARCH_DEVICES = [
  {
    id: 17,
    name: '挖掘机',
    displayName: '挖掘机',
    code: 'SY014CF0113D8',
    model: 'SY014CF0113D8',
    type: '挖掘机',
    typeLabel: '设备',
    image: 'images/审核/挖掘机.jpg',
    status: 'online',
    statusText: '工作',
    statusColor: 'text-green-500',
    location: '中国',
    reportTime: '2026-09-23 08:30 (UTC+8)',
    todayHours: '0.01h',
    todayEnergy: '0.15L',
    auditCounts: { check: 1, exception: 99, maintenance: 37, fuel: 3, location: 0 },
  },
  {
    id: 18,
    name: '汽车起重机',
    displayName: '汽车起重机',
    code: 'AC0250CF0056',
    model: 'AC0250CF0056',
    type: '汽车起重机',
    typeLabel: '设备',
    image: 'images/审核/起重机.jpg',
    status: 'offline',
    statusText: '离线',
    statusColor: 'text-gray-400',
    location: '中国',
    reportTime: '2026-09-23 08:30 (UTC+8)',
    todayHours: '0.06h',
    todayEnergy: '76.8%',
    auditCounts: { check: 3, exception: 8, maintenance: 15, fuel: 0, location: 2 },
  },
  {
    id: 19,
    name: '自装卸车',
    displayName: '自装卸车',
    code: 'HRZX2331008983',
    model: 'HRZX2331008983',
    type: '自装卸车',
    typeLabel: '设备',
    image: 'images/img_dumptruck.jpg',
    status: 'online',
    statusText: '停车',
    statusColor: 'text-blue-500',
    location: '中国',
    reportTime: '2026-09-23 08:30 (UTC+8)',
    todayHours: '0.0h',
    todayEnergy: '78%',
    auditCounts: { check: 1, exception: 5, maintenance: 16, fuel: 0, location: 0 },
  },
];

export const GUEST_DEMO_DEVICES = GUEST_SEARCH_DEVICES;

export const getGuestDemoDevice = (code) => GUEST_DEMO_DEVICES.find((device) => device.code === code);

export const GUEST_AUDIT_CATEGORIES = [
  { id: 'check', name: '检查异常' },
  { id: 'exception', name: '设备异常' },
  { id: 'maintenance', name: '维保事项' },
  { id: 'fuel', name: '燃油异常' },
  { id: 'location', name: '位置预警' },
];

export const GUEST_AUDIT_TAB_DEVICES = {
  exception: [
    {
      id: 'HRZX2331008983',
      code: 'HRZX2331008983',
      name: '自装卸车',
      displayName: '自装卸车',
      title: '自装卸车',
      subtitle: 'Sany · 自装卸车',
      type: 'Sany · 自装卸车',
      image: 'images/img_dumptruck.jpg',
      newBadge: '5新',
      countBadge: 6,
      activeCategory: 'exception',
      categoryName: '设备异常',
      events: [
        {
          id: 'exc-1',
          tag: '故障码',
          title: '制动开关信号故障(SPN 522738 FMI 12)',
          time: '2026-09-15 13:01:47 (UTC+7)',
          isNew: true,
        },
        {
          id: 'exc-2',
          tag: '故障码',
          title: 'EBS节点丢失故障(SPN 522715 FMI 12)',
          time: '2026-09-23 08:30 (UTC+8)',
          isNew: true,
        },
        {
          id: 'exc-3',
          tag: '故障码',
          title: '挂车左转向灯开路(SPN 2372 FMI 5)',
          time: '2026-09-23 08:30 (UTC+8)',
          isNew: true,
        },
        {
          id: 'exc-4',
          tag: '故障码',
          title: 'CAN总线通讯中断(SPN 522700 FMI 9)',
          time: '2026-09-22 17:15:02 (UTC+8)',
          isNew: true,
        },
        {
          id: 'exc-5',
          tag: '故障码',
          title: '发动机机油压力过低警告',
          time: '2026-09-22 14:08:33 (UTC+8)',
          isNew: true,
        },
        {
          id: 'exc-6',
          tag: '故障码',
          title: '尿素加热继电器线路故障',
          time: '2026-09-21 09:42:19 (UTC+8)',
          isNew: false,
        },
      ],
    },
  ],
  check: [
    {
      id: 'AC0250CF0056',
      code: 'AC0250CF0056',
      name: '汽车起重机',
      displayName: '汽车起重机',
      title: '汽车起重机',
      subtitle: 'Sany · 汽车起重机',
      type: 'Sany · 汽车起重机',
      image: 'images/审核/起重机.jpg',
      newBadge: '1新',
      countBadge: 1,
      activeCategory: 'check',
      categoryName: '检查异常',
      events: [
        {
          id: 'chk-1',
          tag: '检查需处理',
          title: '上车随检发现1项需处理',
          time: '2026-09-23 08:30 (UTC+8)',
          isNew: true,
        },
      ],
    },
    {
      id: 'SY014CF0113D8',
      code: 'SY014CF0113D8',
      name: '挖掘机',
      displayName: '挖掘机',
      title: '挖掘机',
      subtitle: 'Sany · 液压挖掘机',
      type: 'Sany · 液压挖掘机',
      image: 'images/审核/挖掘机.jpg',
      newBadge: '1新',
      countBadge: 1,
      activeCategory: 'check',
      categoryName: '检查异常',
      events: [
        {
          id: 'chk-2',
          tag: '检查需处理',
          title: '上车随检发现1项需处理',
          time: '2026-09-23 08:30 (UTC+8)',
          isNew: true,
        },
      ],
    },
  ],
  location: [],
  maintenance: [],
  fuel: [],
};

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
    location: '中国',
    reportTime: '2026-09-23 08:30 (UTC+8)',
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
    location: '中国',
    reportTime: '2026-09-23 08:30 (UTC+8)',
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
    location: '中国',
    reportTime: '2026-09-23 08:30 (UTC+8)',
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
    location: '中国',
    reportTime: '2026-09-23 08:30 (UTC+8)',
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
    location: '中国',
    reportTime: '2026-09-23 08:30 (UTC+8)',
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
    location: '中国',
    reportTime: '2026-09-23 08:30 (UTC+8)',
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
    location: '中国',
    reportTime: '2026-09-23 08:30 (UTC+8)',
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


// 游客模式本地检索逻辑：仅使用 3 台指定假数据设备作为唯一设备数据源
export const searchGuestDemoData = (rawKeyword, options = {}) => {
  const keyword = (rawKeyword || '').trim().toLowerCase();
  if (options.simulateError || keyword === '__error__') {
    const err = new Error('DEMO_DATA_LOAD_FAILED');
    err.code = 'LOCAL_DATA_ERROR';
    throw err;
  }
  if (!keyword) {
    return { devices: [], all: [], total: 0 };
  }

  const matchItem = (item) => {
    const name = (item.name || '').toLowerCase();
    const displayName = (item.displayName || '').toLowerCase();
    const model = (item.model || '').toLowerCase();
    const code = (item.code || '').toLowerCase();
    if (name.includes(keyword) || displayName.includes(keyword) || model.includes(keyword) || code.includes(keyword)) return true;
    if (keyword.includes('自卸') && (name.includes('自装卸') || name.includes('自卸'))) return true;
    if (keyword.includes('装卸') && (name.includes('自装卸') || name.includes('自卸'))) return true;
    if (keyword.includes('起重') && name.includes('起重机')) return true;
    if (keyword.includes('挖掘') && name.includes('挖掘机')) return true;
    return false;
  };

  const matchedDevices = GUEST_SEARCH_DEVICES.filter(matchItem);

  return {
    devices: matchedDevices,
    all: matchedDevices,
    total: matchedDevices.length,
  };
};

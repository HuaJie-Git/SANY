export const APPLICATION_ORDER_STORAGE_KEY = 'sanvist_application_order_v2';

export const DEFAULT_APPLICATIONS = [
  { id: 'inquiry', name: '我要询价', description: '获取产品与设备报价', icon: '询价', color: '#ffe3d6', accent: '#e01923', target: 'inquiry', category: '服务', badge: 'hot' },
  { id: 'service', name: '我要召请', description: '提交现场服务需求', icon: '召请', color: '#e7f7f4', accent: '#1b9a83', target: 'service', category: '服务' },
  { id: 'parts', name: '我要配件', description: '配件查询与订购', icon: '配件', color: '#ffebe8', accent: '#e85d45', target: 'parts', category: '服务' },
  { id: 'maintenance', name: '设备保养', description: '保养计划与到期提醒', icon: '保养', color: '#e8f4fb', accent: '#2589bd', target: 'maintenance', category: '设备' },
  { id: 'productCenter', name: '产品中心', description: '设备产品与型号手册', icon: '产品', color: '#edf7f0', accent: '#368c5c', target: 'productCenter', category: '设备' },
  { id: 'report', name: '机群报表', description: '工时、油耗和趋势', icon: '报表', color: '#fff5d9', accent: '#b98116', target: 'usageReport', category: '数据' },
  { id: 'check', name: '检查', description: '设备日常点检与巡检', icon: '检查', color: '#e6f7f5', accent: '#16a085', target: 'check', category: '设备' },
  { id: 'survey', name: '调研问卷', description: '用户满意度与需求调研', icon: '问卷', color: '#fef5e7', accent: '#d68910', target: 'survey', category: '服务' },
  { id: 'fleet', name: '重卡车队运营', description: '重卡车队运行监控与管理', icon: '车队', color: '#ebf5fb', accent: '#2980b9', target: 'fleet', category: '设备' },
  { id: 'serviceCenter', name: '服务中心', description: '服务网点与在线客服', icon: '服务', color: '#fff8df', accent: '#a77b17', target: 'serviceCenter', category: '服务' },
  { id: 'usedEquipment', name: '三一认证二手机', description: '官方认证优质二手机交易', icon: '二手机', color: '#fef9e7', accent: '#b7950b', target: 'usedEquipment', category: '服务' },
  { id: 'news', name: '三一新闻', description: '企业资讯与行业动态', icon: '新闻', color: '#f4ecf7', accent: '#884ea0', target: 'content', category: '资讯' },
  { id: 'boomCalc', name: '吊臂计算', description: '起重吊装工况与参数计算', icon: '计算', color: '#fbeee6', accent: '#ba4a00', target: 'boomCalc', category: '工具' },
  { id: 'feedback', name: '客户心声', description: '意见反馈与服务评价', icon: '心声', color: '#fdedec', accent: '#cb4335', target: 'feedback', category: '服务' },
  { id: 'outlets', name: '网点分布', description: '全球服务网点与营销网络', icon: '网点', color: '#e8f8f5', accent: '#117864', target: 'serviceCenter', category: '服务' },
  { id: 'bindDevice', name: '绑定设备', description: '添加新设备或绑定已有资产', icon: '绑定', color: '#eafaf1', accent: '#1e8449', target: 'bindDevice', category: '设备' },
];

export const readApplicationOrder = () => {
  try {
    const raw = window.localStorage.getItem(APPLICATION_ORDER_STORAGE_KEY);
    if (!raw) return DEFAULT_APPLICATIONS;
    const savedIds = JSON.parse(raw);
    if (!Array.isArray(savedIds) || savedIds.length === 0) return DEFAULT_APPLICATIONS;
    const saved = savedIds
      .map((id) => DEFAULT_APPLICATIONS.find((app) => app.id === id))
      .filter(Boolean);
    const missing = DEFAULT_APPLICATIONS.filter((app) => !savedIds.includes(app.id));
    return saved.length ? [...saved, ...missing] : DEFAULT_APPLICATIONS;
  } catch {
    return DEFAULT_APPLICATIONS;
  }
};

export const saveApplicationOrder = (applications) => {
  window.localStorage.setItem(
    APPLICATION_ORDER_STORAGE_KEY,
    JSON.stringify(applications.map((app) => app.id)),
  );
};

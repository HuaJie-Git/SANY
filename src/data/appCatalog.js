export const APPLICATION_ORDER_STORAGE_KEY = 'sanvist_application_order_v1';

export const DEFAULT_APPLICATIONS = [
  { id: 'parts', name: '我要配件', description: '配件查询与订购', icon: '配件', color: '#ffebe8', accent: '#e85d45', target: 'parts', category: '服务' },
  { id: 'service', name: '我要召请', description: '提交现场服务需求', icon: '召请', color: '#e7f7f4', accent: '#1b9a83', target: 'service', category: '服务' },
  { id: 'maintenance', name: '设备保养', description: '保养计划与到期提醒', icon: '保养', color: '#e8f4fb', accent: '#2589bd', target: 'maintenance', category: '设备' },
  { id: 'assets', name: '资产中心', description: '设备清单与运行状态', icon: '资产', color: '#edf7f0', accent: '#368c5c', target: 'assetList', category: '设备' },
  { id: 'report', name: '机群报表', description: '工时、油耗和趋势', icon: '报表', color: '#fff5d9', accent: '#b98116', target: 'usageReport', category: '数据' },
  { id: 'audit', name: '审核事件', description: '异常、维保和位置预警', icon: '审核', color: '#fff0f1', accent: '#d9303e', target: 'auditList', category: '工作' },
  { id: 'tasks', name: '我的任务', description: '查看与处理待办任务', icon: '任务', color: '#f1edfb', accent: '#7053b6', target: 'taskList', category: '工作' },
  { id: 'messages', name: '消息中心', description: '告警、保养和服务通知', icon: '消息', color: '#fff0e7', accent: '#df6c20', target: 'messageCenter', category: '工作' },
  { id: 'scanner', name: '扫一扫', description: '识别设备与配件二维码', icon: '扫一扫', color: '#eaf1ff', accent: '#3b6fc4', target: 'scanner', category: '工具' },
  { id: 'startup', name: '开机动态', description: '查看设备今日开工情况', icon: '动态', color: '#ecf7f7', accent: '#23868b', target: 'startupList', category: '数据' },
  { id: 'assistant', name: 'AI 助手', description: '设备与服务智能问答', icon: 'AI', color: '#f4eefb', accent: '#7552a8', target: 'ai', category: '工具' },
  { id: 'repair', name: '维修助手', description: '故障排查与维修建议', icon: '维修', color: '#f8edf8', accent: '#9a5799', target: 'maintenance', category: '服务' },
  { id: 'service-center', name: '服务中心', description: '服务网点与在线客服', icon: '服务', color: '#fff8df', accent: '#a77b17', target: 'service', category: '服务' },
  { id: 'profile', name: '账号与设置', description: '角色、通知和账号信息', icon: '设置', color: '#eef1f5', accent: '#586271', target: 'profile', category: '工具' },
];

export const readApplicationOrder = () => {
  try {
    const savedIds = JSON.parse(window.localStorage.getItem(APPLICATION_ORDER_STORAGE_KEY) || '[]');
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

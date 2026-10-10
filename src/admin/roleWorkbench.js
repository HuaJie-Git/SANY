export const ROLE_WORKBENCH_ADMIN_KEY = 'sanvist_role_workbench_admin_v1';
export const ROLE_WORKBENCH_REVISION_KEY = 'sanvist_role_workbench_revision_v1';

export const ADMIN_ROLES = [
  { id: 'operator', name: '机手', desc: '关注设备开工、日常巡检、保养与快速报修' },
  { id: 'owner', name: '机主', desc: '关注设备资产、出勤率、油耗与配件维保' },
  { id: 'enterprise', name: '企业客户', desc: '关注机群总览、多机调度、能耗与事件审核' },
  { id: 'engineer', name: '服务工程师', desc: '关注待办工单、现场召请、故障排查与配件' },
  { id: 'admin', name: '管理员', desc: '关注安全审核、系统报表、全量资产与权限管理' },
];

export const CATALOG_FUNCTIONS = [
  { id: 'startup', name: '开机动态', enName: 'Startup Dynamic', category: '数据', status: '正常', icon: '动态', color: '#ecf7f7', pro: false },
  { id: 'maintenance', name: '设备保养', enName: 'Equipment Maintenance', category: '设备', status: '正常', icon: '保养', color: '#e8f4fb', pro: false },
  { id: 'parts', name: '我要配件', enName: 'Parts', category: '服务', status: '正常', icon: '配件', color: '#ffebe8', pro: false },
  { id: 'service', name: '我要召请', enName: 'Service', category: '服务', status: '正常', icon: '召请', color: '#e7f7f4', pro: false },
  { id: 'repair', name: '维修助手', enName: 'Repair', category: '服务', status: '正常', icon: '维修', color: '#f8edf8', pro: true },
  { id: 'scanner', name: '扫一扫', enName: 'Scanner', category: '工具', status: '正常', icon: '扫一扫', color: '#eaf1ff', pro: false },
  { id: 'tasks', name: '我的任务', enName: 'My Tasks', category: '工作', status: '正常', icon: '任务', color: '#f1edfb', pro: false },
  { id: 'messages', name: '消息中心', enName: 'Messages', category: '工作', status: '正常', icon: '消息', color: '#fff0e7', pro: false },
  { id: 'assistant', name: 'AI 助手', enName: 'AI Assistant', category: '工具', status: '正常', icon: 'AI', color: '#f4eefb', pro: true },
  { id: 'assets', name: '资产中心', enName: 'Assets', category: '设备', status: '正常', icon: '资产', color: '#edf7f0', pro: false },
  { id: 'inquiry', name: '我要询价', enName: 'Inquiry', category: '服务', status: '正常', icon: '询价', color: '#ffe3d6', pro: false },
  { id: 'report', name: '机群报表', enName: 'Fleet Rpt', category: '数据', status: '正常', icon: '报表', color: '#fff5d9', pro: false },
  { id: 'audit', name: '审核事件', enName: 'Audit Events', category: '工作', status: '正常', icon: '审核', color: '#fff0f1', pro: true },
  { id: 'service-center', name: '服务中心', enName: 'Outlets', category: '服务', status: '正常', icon: '服务', color: '#fff8df', pro: false },
  { id: 'profile', name: '账号与设置', enName: 'Profile & Settings', category: '工具', status: '正常', icon: '设置', color: '#eef1f5', pro: false },
  { id: 'crane', name: '吊臂计算', enName: 'Boom Calc', category: '工具', status: '正常', icon: '计算', color: '#eb984e', pro: false },
  { id: 'bind', name: '绑定设备', enName: 'Bind Device', category: '设备', status: '正常', icon: '绑定', color: '#58d68d', pro: false },
  { id: 'feedback', name: '客户心声', enName: 'Feedback', category: '服务', status: '正常', icon: '心声', color: '#d7bde2', pro: false },
  { id: 'survey', name: '调研问卷', enName: 'Survey', category: '服务', status: '正常', icon: '问卷', color: '#f8c471', pro: false },
  { id: 'attendance', name: '考勤打卡', enName: 'Attendance', category: '工作', status: '正常', icon: '考勤', color: '#bb8fce', pro: true },
];

// 通用默认工作台顺序模板（R-002, AC-002: 所有未配置角色均以此通用默认作为起点）
export const DEFAULT_WORKBENCH_TEMPLATE = [
  { id: 'inquiry', isPinned: false },
  { id: 'parts', isPinned: false },
  { id: 'service', isPinned: false },
  { id: 'maintenance', isPinned: false },
  { id: 'assets', isPinned: false },
  { id: 'report', isPinned: false },
  { id: 'audit', isPinned: false },
  { id: 'tasks', isPinned: false },
  { id: 'messages', isPinned: false },
  { id: 'scanner', isPinned: false },
  { id: 'startup', isPinned: false },
  { id: 'assistant', isPinned: false },
  { id: 'repair', isPinned: false },
  { id: 'service-center', isPinned: false },
  { id: 'profile', isPinned: false },
];

export const createInitialRoleConfig = (roleName) => ({
  roleName,
  version: '--',
  revision: '--',
  updatedAt: '--',
  updatedBy: '--',
  isConfigured: false,
  items: DEFAULT_WORKBENCH_TEMPLATE.map((item) => ({ ...item })),
});

export const INITIAL_ADMIN_ROLE_CONFIGS = {
  机手: createInitialRoleConfig('机手'),
  机主: createInitialRoleConfig('机主'),
  企业客户: createInitialRoleConfig('企业客户'),
  服务工程师: createInitialRoleConfig('服务工程师'),
  管理员: createInitialRoleConfig('管理员'),
};

export const readRoleConfigsFromStorage = () => {
  try {
    const raw = window.localStorage.getItem(ROLE_WORKBENCH_ADMIN_KEY);
    if (!raw) return INITIAL_ADMIN_ROLE_CONFIGS;
    const saved = JSON.parse(raw);
    const merged = { ...INITIAL_ADMIN_ROLE_CONFIGS };
    Object.keys(merged).forEach((roleKey) => {
      if (saved[roleKey]) {
        merged[roleKey] = {
          ...merged[roleKey],
          ...saved[roleKey],
          // 保护已保存配置，同时规范化 items 仅保留 id 与 isPinned，清理历史脏数据中的 usageCount/updatedAt
          items: Array.isArray(saved[roleKey].items)
            ? saved[roleKey].items.map((item) => ({
                id: item.id,
                isPinned: Boolean(item.isPinned),
                custom: Boolean(item.custom),
                ...(item.name ? { name: item.name } : {}),
                ...(item.enName ? { enName: item.enName } : {}),
              }))
            : merged[roleKey].items,
        };
      }
    });
    return merged;
  } catch {
    return INITIAL_ADMIN_ROLE_CONFIGS;
  }
};

export const saveRoleConfigsToStorage = (configs, shouldSimulateError = false) => {
  if (shouldSimulateError) {
    throw new Error('保存未完成：存储或网络模拟异常');
  }
  window.localStorage.setItem(ROLE_WORKBENCH_ADMIN_KEY, JSON.stringify(configs));
  window.localStorage.setItem(ROLE_WORKBENCH_REVISION_KEY, `${Date.now()}`);
  return true;
};

export const getRoleRevision = () => {
  try {
    return window.localStorage.getItem(ROLE_WORKBENCH_REVISION_KEY) || 'rev-initial';
  } catch {
    return 'rev-initial';
  }
};

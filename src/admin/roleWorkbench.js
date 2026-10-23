export const ROLE_WORKBENCH_ADMIN_KEY = 'sanvist_role_workbench_admin_v1';
export const ROLE_WORKBENCH_PLATFORM_KEY = 'sanvist_role_workbench_platform_v2';
export const ROLE_WORKBENCH_REVISION_KEY = 'sanvist_role_workbench_revision_v1';

export const ADMIN_ROLES = [
  { id: 'owner', name: '设备所有者', storageKey: '机主', desc: '关注设备资产、出勤率、油耗与配件维保' },
  { id: 'admin', name: '设备管理员', storageKey: '管理员', desc: '关注安全审核、系统报表、全量资产与权限管理' },
  { id: 'operator', name: '设备操作手', storageKey: '机手', desc: '关注设备开工、日常巡检、保养与快速报修' },
  { id: 'dealer', name: '三一代理商', storageKey: '三一代理商', desc: '' },
  { id: 'engineer', name: '设备维修员', storageKey: '服务工程师', desc: '关注待办工单、现场召请、故障排查与配件' },
  { id: 'employee', name: '三一员工', storageKey: '三一员工', desc: '' },
  { id: 'enterprise', name: '企业客户', storageKey: '企业客户', desc: '关注机群总览、多机调度、能耗与事件审核' },
  { id: 'fleet_leader', name: '车队长', storageKey: '车队长', desc: '' },
];

// 配置对象独立于业务角色，不能作为快链人群或资料适用角色。
export const DEFAULT_USER_CONFIG_TARGET = {
  id: 'default_user', name: '默认配置', storageKey: 'default_user',
};
export const WORKBENCH_CONFIG_TARGETS = [...ADMIN_ROLES, DEFAULT_USER_CONFIG_TARGET];

export const getRoleStorageKey = (roleInput) => {
  if (!roleInput) return roleInput;
  if (typeof roleInput === 'object') {
    return roleInput.storageKey || roleInput.name || roleInput.id || '';
  }
  if (typeof roleInput !== 'string') return roleInput;
  if (roleInput === '默认用户（未选择角色）') return DEFAULT_USER_CONFIG_TARGET.storageKey;
  const found = WORKBENCH_CONFIG_TARGETS.find(
    (r) => r.storageKey === roleInput || r.name === roleInput || r.id === roleInput
  );
  return found ? (found.storageKey || found.name) : roleInput;
};

export const getRoleLabel = (roleInput) => {
  if (!roleInput) return roleInput;
  if (typeof roleInput === 'object') {
    return roleInput.name || roleInput.storageKey || roleInput.id || '';
  }
  if (typeof roleInput !== 'string') return roleInput;
  if (roleInput === '默认用户（未选择角色）') return DEFAULT_USER_CONFIG_TARGET.name;
  const found = WORKBENCH_CONFIG_TARGETS.find(
    (r) => r.storageKey === roleInput || r.name === roleInput || r.id === roleInput
  );
  return found ? found.name : roleInput;
};

export const PLATFORMS = [
  { id: 'app', name: 'APP 工作台', desc: '配置各角色在移动端 APP 的工作台功能入口' },
  { id: 'pc', name: 'PC 工作台', desc: '配置各角色在 PC 端的快速链接与页面模块' },
];

export const PC_SECTIONS = [
  { id: 'actions', name: '快速链接', desc: '配置 PC 首页快速链接的快捷功能入口' },
  { id: 'modules', name: '页面模块', desc: '配置 PC 首页主体模块的纳入、显隐与排序' },
];

export const APP_SECTIONS = [
  { id: 'workbench', name: '工作台入口', desc: '配置 APP 首页常用功能与工作台入口' },
  { id: 'modules', name: '首页模块', desc: '配置 APP 首页主体模块的纳入、显隐与排序' },
];

// APP 移动端功能目录 (20项)
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

// APP 端首页模块目录 (5项, 顺序取当前 APP Home.jsx 渲染顺序)
export const APP_MODULES_CATALOG = [
  { id: 'recent', name: '最近查看', enName: 'Recent Viewed', category: '记录', description: '最近查看卡片区域', status: '正常', color: '#e8f4fb' },
  { id: 'tasks', name: '我的任务', enName: 'My Tasks', category: '工作', description: '任务概览卡片区域', status: '正常', color: '#f1edfb' },
  { id: 'startup', name: '设备开机动态', enName: 'Device Startup', category: '数据', description: '设备运行动态卡片区域', status: '正常', color: '#ecf7f7' },
  { id: 'audit', name: '审核事件', enName: 'Audit Events', category: '工作', description: '审核事件卡片区域', status: '正常', color: '#fff0f1' },
  { id: 'content', name: '内容推荐', enName: 'Content Feed', category: '内容', description: '首页 ContentFeed 内容区整体', status: '正常', color: '#edf7f0' },
];

// PC 端页面模块目录 (取自 HomeDashboard.jsx DEFAULT_MODULES, 6项)
export const PC_MODULES_CATALOG = [
  { id: 'maintenance', name: '计划保养', enName: 'Planned Maintenance', category: '设备', description: '保养状态概览与设备保养清单', status: '正常', color: '#e8f4fb' },
  { id: 'operations', name: '设备运行概览', enName: 'Operations Overview', category: '设备', description: '管辖设备运行与能耗概览', status: '正常', color: '#ecf7f7' },
  { id: 'tasks', name: '我的任务', enName: 'My Tasks', category: '工作', description: '按任务状态跟踪个人工作队列', status: '正常', color: '#f1edfb' },
  { id: 'audit', name: '审核概览', enName: 'Audit Overview', category: '工作', description: '待处理事件与未读审核提醒', status: '正常', color: '#fff0f1' },
  { id: 'links', name: '快速链接', enName: 'Quick Links', category: '系统', description: '常用业务系统入口', status: '正常', color: '#edf7f0' },
  { id: 'projects', name: '重点项目', enName: 'Key Projects', category: '项目', description: '项目进度与在场设备', status: '正常', color: '#fff5d9' },
];

// PC 端快速行动目录 (取自 HomeDashboard.jsx QUICK_ACTIONS, 12项)
export const PC_ACTIONS_CATALOG = [
  { id: 'map-monitor', name: '地图监控', enName: 'Map Monitor', category: '监控', note: '查看设备位置与运行分布', icon: 'map', color: '#e8f4fb' },
  { id: 'warning-center', name: '预警中心', enName: 'Warning Center', category: '监控', note: '查看设备预警与处理状态', icon: 'alert', color: '#ffe3d6' },
  { id: 'bind-device', name: '绑定设备', enName: 'Bind Device', category: '设备', note: '查询并绑定设备', icon: 'link', color: '#edf7f0' },
  { id: 'personal', name: '个人中心', enName: 'Personal Center', category: '账号', note: '查看个人信息与账号设置', icon: 'person', color: '#eef1f5' },
  { id: 'repair', name: '请求维修', enName: 'Request Repair', category: '服务', note: '异常直接转维修召请', icon: 'wrench', color: '#f8edf8' },
  { id: 'parts', name: '订购配件', enName: 'Order Parts', category: '服务', note: '按设备匹配原厂件', icon: 'parts', color: '#ffebe8' },
  { id: 'maintenance', name: '申请保养', enName: 'Apply Maintenance', category: '设备', note: '创建计划内保养', icon: 'calendar', color: '#e8f4fb' },
  { id: 'inspection', name: '检查', enName: 'Inspection', category: '服务', note: '按标准检查表快速巡检', icon: 'inspection', color: '#e7f7f4' },
  { id: 'task', name: '创建任务', enName: 'Create Task', category: '工作', note: '设置执行人和截止时间', icon: 'task', color: '#f1edfb' },
  { id: 'assign', name: '分配任务', enName: 'Assign Task', category: '工作', note: '分配给人员或服务商', icon: 'assign', color: '#f4eefb' },
  { id: 'workorder', name: '查看工单', enName: 'View Work Orders', category: '工作', note: '跟踪处理闭环', icon: 'order', color: '#fff0f1' },
  { id: 'report-alert', name: '上报异常', enName: 'Report Anomaly', category: '监控', note: '携带设备工况发起处理', icon: 'alert', color: '#ffe3d6' },
];

// APP 工作台通用默认起点模板 (15项)
export const DEFAULT_WORKBENCH_TEMPLATE = [
  { id: 'inquiry', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'parts', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'service', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'maintenance', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'assets', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'report', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'audit', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'tasks', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'messages', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'scanner', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'startup', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'assistant', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'repair', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'service-center', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'profile', isPinned: false, visible: true, defaultVisible: 'yes' },
];

// APP 首页模块默认起点模板 (5项, 全部默认显示)
export const DEFAULT_APP_MODULES_TEMPLATE = [
  { id: 'recent', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'tasks', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'startup', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'audit', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'content', isPinned: false, visible: true, defaultVisible: 'yes' },
];

// PC 页面模块默认模板 (6项，保留 HomeDashboard 默认显隐：projects 默认隐藏)
export const DEFAULT_PC_MODULES_TEMPLATE = [
  { id: 'maintenance', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'operations', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'tasks', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'audit', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'links', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'projects', isPinned: false, visible: false, defaultVisible: 'no' },
];

// PC 快速行动默认模板 (12项，默认全部启用)
export const DEFAULT_PC_ACTIONS_TEMPLATE = [
  { id: 'map-monitor', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'warning-center', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'bind-device', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'personal', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'repair', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'parts', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'maintenance', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'inspection', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'task', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'assign', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'workorder', isPinned: false, visible: true, defaultVisible: 'yes' },
  { id: 'report-alert', isPinned: false, visible: true, defaultVisible: 'yes' },
];

export const getDefaultTemplate = (platform, section) => {
  if (platform === 'pc') {
    return section === 'actions' ? DEFAULT_PC_ACTIONS_TEMPLATE : DEFAULT_PC_MODULES_TEMPLATE;
  }
  if (platform === 'app' && section === 'modules') {
    return DEFAULT_APP_MODULES_TEMPLATE;
  }
  return DEFAULT_WORKBENCH_TEMPLATE;
};

export const getCatalogForPlatform = (platform, section) => {
  if (platform === 'pc') {
    return section === 'actions' ? PC_ACTIONS_CATALOG : PC_MODULES_CATALOG;
  }
  if (platform === 'app' && section === 'modules') {
    return APP_MODULES_CATALOG;
  }
  return CATALOG_FUNCTIONS;
};

// R-023：新老用户统一采用角色排序，不再维护独立的新用户规则。
export const DEFAULT_WORKBENCH_RULES = {
  userSort: 'manual',
  autoPeriod: '30d',
  refreshSchedule: 'monthly',
};

export const sanitizeRules = (rules) => {
  if (!rules || typeof rules !== 'object') return { ...DEFAULT_WORKBENCH_RULES };
  if (rules.refreshSchedule === 'monthly') {
    return { userSort: rules.userSort === 'auto_clicks' ? 'auto_clicks' : 'manual', autoPeriod: ['7d', '30d', 'all'].includes(rules.autoPeriod) ? rules.autoPeriod : '30d', refreshSchedule: 'monthly' };
  }
  // 旧记录保留原规则，避免保存一个角色时顺带改写其它角色；目标角色重新保存时才使用新规则。
  return {
    userSort: rules.userSort === 'auto_clicks' ? 'auto_clicks' : 'manual',
    autoPeriod: ['7d', '30d', 'all'].includes(rules.autoPeriod) ? rules.autoPeriod : '30d',
    newUserRule: ['manual', 'clicks_rank', 'system_default'].includes(rules.newUserRule) ? rules.newUserRule : 'manual',
  };
};

export const createInitialRoleConfig = (roleName, platform = 'app', section = 'workbench') => ({
  roleName,
  platform,
  section,
  version: '--',
  revision: '--',
  updatedAt: '--',
  updatedBy: '--',
  isConfigured: false,
  items: getDefaultTemplate(platform, section).map((item) => ({ ...item })),
  rules: { ...DEFAULT_WORKBENCH_RULES },
});

export const createInitialRoleGroup = (platform, section) => {
  const group = {};
  WORKBENCH_CONFIG_TARGETS.forEach((role) => {
    const key = role.storageKey || role.name;
    group[key] = createInitialRoleConfig(key, platform, section);
  });
  return group;
};

export const INITIAL_ADMIN_ROLE_CONFIGS = createInitialRoleGroup('app', 'workbench');

export const INITIAL_PLATFORM_CONFIGS = {
  app: {
    workbench: createInitialRoleGroup('app', 'workbench'),
    modules: createInitialRoleGroup('app', 'modules'),
  },
  pc: {
    modules: createInitialRoleGroup('pc', 'modules'),
    actions: createInitialRoleGroup('pc', 'actions'),
  },
};

// 完整保留跳转方式、目标链接、多语言翻译及显隐编辑字段，确保回显无损
const sanitizeItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const isVisible = item.visible !== undefined
      ? Boolean(item.visible)
      : (item.defaultVisible === 'no' ? false : true);
    return {
      ...item,
      id: item.id,
      isPinned: Boolean(item.isPinned),
      visible: isVisible,
      defaultVisible: item.defaultVisible || (isVisible ? 'yes' : 'no'),
      custom: Boolean(item.custom),
      ...(item.isRemoved === true ? { isRemoved: true, visible: false, defaultVisible: 'no', isPinned: false } : {}),
    };
  });
};

// 仅改变当前布局中的移除标识，完整保留公共资料及备用人工顺序。
export const setRoleItemRemoved = (items, id, isRemoved) => {
  const target = items.find((item) => item.id === id);
  if (!target || Boolean(target.isRemoved) === isRemoved) return items;
  return items.map((item) => item.id === id
    ? { ...item, isRemoved, visible: false, defaultVisible: 'no', isPinned: false }
    : item);
};

// 库中的资料与角色布局分离；初始及旧继承模板只作为编辑起点，不自动写盘。
export const getEffectiveRoleItems = (saved, legacy, role, platform, section) => {
  if (saved?.isConfigured && saved.useDefaultConfiguration !== true && Array.isArray(saved.items)) return saved.items;
  if (role !== DEFAULT_USER_CONFIG_TARGET.storageKey && saved?.useDefaultConfiguration === true
    && legacy?.isConfigured && Array.isArray(legacy.items)) return legacy.items;
  return getDefaultTemplate(platform, section);
};

// 新选用/恢复项放在备用人工顺序末尾，保持原有项及未知字段。
export const addRoleLibraryItems = (items, entries) => {
  let next = items;
  for (const entry of entries) {
    const old = next.find((item) => item.id === entry.id);
    if (old && !old.isRemoved) continue;
    next = [...next.filter((item) => item.id !== entry.id), {
      ...(old || { id: entry.id, custom: Boolean(entry.custom) }),
      isRemoved: false, visible: false, defaultVisible: 'no', isPinned: false,
    }];
  }
  return next;
};

// 上下移动只交换相邻有效项；移除项保留在原数组中供恢复。
export const moveActiveRoleItem = (items, activeIndex, direction) => {
  const positions = items.flatMap((item, index) => item.isRemoved ? [] : [index]);
  const from = positions[activeIndex];
  const to = positions[activeIndex + direction];
  if (from === undefined || to === undefined || ![-1, 1].includes(direction)) return items;
  const next = [...items];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
};

export const readPlatformConfigsFromStorage = () => {
  try {
    const rawPlatform = window.localStorage.getItem(ROLE_WORKBENCH_PLATFORM_KEY);
    if (rawPlatform) {
      const savedPlatform = JSON.parse(rawPlatform);
      const merged = {
        app: {
          workbench: createInitialRoleGroup('app', 'workbench'),
          modules: createInitialRoleGroup('app', 'modules'),
        },
        pc: {
          modules: createInitialRoleGroup('pc', 'modules'),
          actions: createInitialRoleGroup('pc', 'actions'),
        },
      };

      // 填充 app.workbench
      if (savedPlatform?.app?.workbench) {
        Object.keys(merged.app.workbench).forEach((roleKey) => {
          if (savedPlatform.app.workbench[roleKey]) {
            merged.app.workbench[roleKey] = {
              ...merged.app.workbench[roleKey],
              ...savedPlatform.app.workbench[roleKey],
              items: sanitizeItems(savedPlatform.app.workbench[roleKey].items),
              rules: sanitizeRules(savedPlatform.app.workbench[roleKey].rules),
            };
          }
        });
      }

      // 填充 app.modules
      if (savedPlatform?.app?.modules) {
        Object.keys(merged.app.modules).forEach((roleKey) => {
          if (savedPlatform.app.modules[roleKey]) {
            merged.app.modules[roleKey] = {
              ...merged.app.modules[roleKey],
              ...savedPlatform.app.modules[roleKey],
              items: sanitizeItems(savedPlatform.app.modules[roleKey].items),
              rules: sanitizeRules(savedPlatform.app.modules[roleKey].rules),
            };
          }
        });
      }

      // 填充 pc.modules
      if (savedPlatform?.pc?.modules) {
        Object.keys(merged.pc.modules).forEach((roleKey) => {
          if (savedPlatform.pc.modules[roleKey]) {
            merged.pc.modules[roleKey] = {
              ...merged.pc.modules[roleKey],
              ...savedPlatform.pc.modules[roleKey],
              items: sanitizeItems(savedPlatform.pc.modules[roleKey].items),
              rules: sanitizeRules(savedPlatform.pc.modules[roleKey].rules),
            };
          }
        });
      }

      // 填充 pc.actions
      if (savedPlatform?.pc?.actions) {
        Object.keys(merged.pc.actions).forEach((roleKey) => {
          if (savedPlatform.pc.actions[roleKey]) {
            merged.pc.actions[roleKey] = {
              ...merged.pc.actions[roleKey],
              ...savedPlatform.pc.actions[roleKey],
              items: sanitizeItems(savedPlatform.pc.actions[roleKey].items),
              rules: sanitizeRules(savedPlatform.pc.actions[roleKey].rules),
            };
          }
        });
      }

      return {
        tree: merged,
        // 保存只替换目标组合，未编辑的旧记录按原字节字段保留。
        persistedTree: savedPlatform && typeof savedPlatform === 'object' && !Array.isArray(savedPlatform) ? savedPlatform : null,
        hasReadError: false,
      };
    }

    // STATE-PLATFORM-003, AC-013: 若无多端键，检查旧 APP 单端键进行无损迁移
    const rawLegacyApp = window.localStorage.getItem(ROLE_WORKBENCH_ADMIN_KEY);
    const initialTree = {
      app: {
        workbench: createInitialRoleGroup('app', 'workbench'),
        modules: createInitialRoleGroup('app', 'modules'),
      },
      pc: {
        modules: createInitialRoleGroup('pc', 'modules'),
        actions: createInitialRoleGroup('pc', 'actions'),
      },
    };

    if (rawLegacyApp) {
      const savedLegacy = JSON.parse(rawLegacyApp);
      Object.keys(initialTree.app.workbench).forEach((roleKey) => {
        if (savedLegacy[roleKey]) {
          initialTree.app.workbench[roleKey] = {
            ...initialTree.app.workbench[roleKey],
            ...savedLegacy[roleKey],
            items: sanitizeItems(savedLegacy[roleKey].items),
            rules: sanitizeRules(savedLegacy[roleKey].rules),
          };
        }
      });
    }

    return {
      tree: initialTree,
      hasReadError: false,
    };
  } catch (err) {
    // catch 不得静默回默认后允许覆盖；保留原数据并显式标记读取错误
    return {
      tree: {
        app: {
          workbench: createInitialRoleGroup('app', 'workbench'),
          modules: createInitialRoleGroup('app', 'modules'),
        },
        pc: {
          modules: createInitialRoleGroup('pc', 'modules'),
          actions: createInitialRoleGroup('pc', 'actions'),
        },
      },
      hasReadError: true,
      error: err,
    };
  }
};

export const savePlatformConfigsToStorage = (
  configOrRoleConf,
  currentPlatform = 'app',
  currentSection = 'workbench',
  currentRoleKey = '机手',
  expectedBaseRevision = null,
  shouldSimulateError = false
) => {
  if (shouldSimulateError) {
    throw new Error('保存未完成：存储或网络模拟异常');
  }

  // 1. 重读最新存储树；若检测到读取/解析损坏则拒绝覆盖已有数据
  const readRes = readPlatformConfigsFromStorage();
  if (readRes.hasReadError) {
    throw new Error('检测到本地存储读取异常，为保护已有数据拒绝覆盖，请先重试读取');
  }
  const latestTree = readRes.persistedTree || readRes.tree;

  // 2. 版本冲突校验：只要显式提供基准（含 '--'），就和最新目标 revision（未配置规范化为 '--'）比较；不同则拒绝
  const latestTargetRoleConf = latestTree?.[currentPlatform]?.[currentSection]?.[currentRoleKey];
  const latestTargetRevision =
    latestTargetRoleConf?.isConfigured && latestTargetRoleConf?.revision && latestTargetRoleConf.revision !== '--'
      ? latestTargetRoleConf.revision
      : '--';

  if (
    expectedBaseRevision !== null &&
    expectedBaseRevision !== undefined &&
    latestTargetRevision !== expectedBaseRevision
  ) {
    const conflictErr = new Error(
      `配置已在其他窗口更新（版本冲突：编辑基准 ${expectedBaseRevision} vs 最新已存 ${latestTargetRevision}），当前草稿已保留，请核对后重试。`
    );
    conflictErr.isConflict = true;
    conflictErr.latestRevision = latestTargetRevision;
    conflictErr.baseRevision = expectedBaseRevision;
    throw conflictErr;
  }

  // 提取当前目标角色配置
  const targetRoleConf =
    configOrRoleConf?.[currentPlatform]?.[currentSection]?.[currentRoleKey] ||
    configOrRoleConf;

  // 确保每个组合保存自己专属的 revision 标识
  const comboRevision = targetRoleConf.revision && targetRoleConf.revision !== '--' && targetRoleConf.revision !== expectedBaseRevision
    ? targetRoleConf.revision
    : `rev-${Date.now().toString(36)}`;
  const finalRoleConf = {
    ...targetRoleConf,
    items: sanitizeItems(targetRoleConf.items),
    rules: sanitizeRules(targetRoleConf.rules),
    revision: comboRevision,
  };

  // 3. 仅 patch 当前 (platform, section, roleKey) 组合
  if (!latestTree[currentPlatform]) {
    latestTree[currentPlatform] = {};
  }
  if (!latestTree[currentPlatform][currentSection]) {
    latestTree[currentPlatform][currentSection] = {};
  }
  latestTree[currentPlatform][currentSection][currentRoleKey] = finalRoleConf;

  // 4. 写入多端统一存储键
  window.localStorage.setItem(ROLE_WORKBENCH_PLATFORM_KEY, JSON.stringify(latestTree));

  // 5. PC 保存绝对不双写旧 APP 键！仅在 APP 端工作台保存时双写旧键以保持向下兼容
  if (currentPlatform === 'app' && currentSection === 'workbench' && currentRoleKey !== DEFAULT_USER_CONFIG_TARGET.storageKey) {
    if (latestTree.app?.workbench) {
      // 默认用户只存多端键，旧业务角色键仍保持原八角色口径。
      const legacyRoles = Object.fromEntries(Object.entries(latestTree.app.workbench)
        .filter(([key]) => key !== DEFAULT_USER_CONFIG_TARGET.storageKey));
      window.localStorage.setItem(ROLE_WORKBENCH_ADMIN_KEY, JSON.stringify(legacyRoles));
    }
  }

  window.localStorage.setItem(ROLE_WORKBENCH_REVISION_KEY, `${Date.now()}`);
  return latestTree;
};

// 保持历史兼容方法
export const readRoleConfigsFromStorage = () => {
  const result = readPlatformConfigsFromStorage();
  return result.tree.app.workbench;
};

export const saveRoleConfigsToStorage = (configs, shouldSimulateError = false) => {
  return savePlatformConfigsToStorage(
    configs['机手'] || configs,
    'app',
    'workbench',
    '机手',
    shouldSimulateError
  );
};

export const getRoleRevision = () => {
  try {
    return window.localStorage.getItem(ROLE_WORKBENCH_REVISION_KEY) || 'rev-initial';
  } catch {
    return 'rev-initial';
  }
};

export const ROLE_WORKBENCH_STATS_KEY = 'sanvist_role_workbench_stats_v1';

/**
 * 从本地存储读取角色入口点击统计
 * 支持验收测试注入快照；默认无数据，不自动生成虚假数据
 * @param {string} platform 'app' | 'pc'
 * @param {string} section 'workbench' | 'modules' | 'actions'
 * @param {string} roleName '机手' 等
 * @param {string} period '7d' | '30d' | 'all'
 */
export const readRoleEntryStatsFromStorage = (platform, section, roleName, period = '30d') => {
  // 尚未接入默认用户的真实点击统计，不借用业务角色或生成演示量。
  if (getRoleStorageKey(roleName) === DEFAULT_USER_CONFIG_TARGET.storageKey) {
    return { hasData: false, source: 'none', isSample: false, records: [],
      clicksMap: Object.create(null), offlineItems: [], updatedAt: '--', hasError: false };
  }
  try {
    const raw = window.localStorage.getItem(ROLE_WORKBENCH_STATS_KEY);
    if (!raw) {
      return {
        hasData: false,
        source: 'none',
        isSample: false,
        records: [],
        clicksMap: Object.create(null),
        offlineItems: [],
        updatedAt: '--',
        hasError: false,
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('统计快照格式损坏 (无法解析为有效 JSON)');
    }

    // 严格格式校验 (R-010-D): 根对象必须为普通对象，非数组
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('统计快照根格式非法 (须为包含 source, updatedAt, records 的单一对象)');
    }

    // 来源白名单校验: 仅支持 'real' | 'sample'
    if (parsed.source !== 'real' && parsed.source !== 'sample') {
      throw new Error(`统计快照来源未知或非法 (source 必须为 'real' 或 'sample'，收到 ${JSON.stringify(parsed.source)})`);
    }

    // 更新时间校验 (合法 ISO 字符串: R-010-D)
    const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/;
    if (!parsed.updatedAt || typeof parsed.updatedAt !== 'string' || !ISO_DATE_REGEX.test(parsed.updatedAt)) {
      throw new Error(`统计快照缺少或包含非法的更新时间 (updatedAt 须为合法 ISO 字符串，收到 ${parsed.updatedAt})`);
    }
    const updateTime = new Date(parsed.updatedAt).getTime();
    if (isNaN(updateTime)) {
      throw new Error(`统计快照更新时间格式非法: ${parsed.updatedAt}`);
    }

    // records 数组校验
    if (!Array.isArray(parsed.records)) {
      throw new Error('统计快照缺少 records 数据数组');
    }

    // 计算当前自然日历日期及近7天/近30天起止（含今天自然日，分别起于今天减6天/减29天）
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const getPastDateStr = (daysAgo) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    const startDate7d = getPastDateStr(6);
    const startDate30d = getPastDateStr(29);

    // 作用域稳定角色 ID 映射
    const roleDef = ADMIN_ROLES.find((r) => r.name === roleName || r.id === roleName || r.storageKey === roleName);
    const targetRoleId = roleDef ? roleDef.id : roleName;

    // 行重复检测与冲突检测 (Map)
    // rowKey: platform__section__roleId__entryId__date
    const seenRowMap = new Map();

    // 聚合 Map (使用 new Map 避免特定 ID 破坏计数)
    const aggMap = new Map();

    let hasScopeRecords = false;

    const VALID_ROLE_IDS = new Set(ADMIN_ROLES.map((r) => r.id));

    // 遍历校验每一条记录
    for (let idx = 0; idx < parsed.records.length; idx += 1) {
      const item = parsed.records[idx];
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        throw new Error(`第 ${idx + 1} 条统计记录无效 (须为对象)`);
      }

      // 验证合法作用域 / 稳定角色 ID (R-010-D)
      if (item.platform !== 'app' && item.platform !== 'pc') {
        throw new Error(`第 ${idx + 1} 条统计记录缺少或包含非法的 platform: ${item.platform}`);
      }
      const isValidCombo =
        (item.platform === 'app' && (item.section === 'workbench' || item.section === 'modules')) ||
        (item.platform === 'pc' && (item.section === 'modules' || item.section === 'actions'));
      if (!isValidCombo) {
        throw new Error(
          `第 ${idx + 1} 条统计记录终端与区域组合非法: platform=${item.platform}, section=${item.section}`
        );
      }
      if (typeof item.roleId !== 'string' || !VALID_ROLE_IDS.has(item.roleId)) {
        throw new Error(`第 ${idx + 1} 条统计记录缺少或包含未知的角色标识 (roleId: ${item.roleId})`);
      }
      if (typeof item.entryId !== 'string' || !item.entryId) {
        throw new Error(`第 ${idx + 1} 条统计记录缺少或包含非法的 entryId`);
      }
      if (item.entryName !== undefined && typeof item.entryName !== 'string') {
        throw new Error(`第 ${idx + 1} 条统计记录 entryName 必须为字符串: ${typeof item.entryName}`);
      }
      if (item.isOffline !== undefined && typeof item.isOffline !== 'boolean') {
        throw new Error(`第 ${idx + 1} 条统计记录 isOffline 必须为布尔值: ${typeof item.isOffline}`);
      }

      // 真实日期与格式校验 (YYYY-MM-DD)
      if (typeof item.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
        throw new Error(`第 ${idx + 1} 条记录日期格式非法 (须为 YYYY-MM-DD): ${item.date}`);
      }
      const [y, m, d] = item.date.split('-').map(Number);
      const dateCheck = new Date(y, m - 1, d);
      if (
        dateCheck.getFullYear() !== y ||
        dateCheck.getMonth() !== m - 1 ||
        dateCheck.getDate() !== d
      ) {
        throw new Error(`第 ${idx + 1} 条记录日期不存在 (非法日历日期): ${item.date}`);
      }

      // 不纳入未来日期，非法/未来的统计日期需明确拒绝
      if (item.date > todayStr) {
        throw new Error(`第 ${idx + 1} 条记录包含未来统计日期 (${item.date} > ${todayStr})，已被拒绝`);
      }

      // 次数校验 (非负安全整数)
      if (
        typeof item.clickCount !== 'number' ||
        !Number.isSafeInteger(item.clickCount) ||
        item.clickCount < 0
      ) {
        throw new Error(`第 ${idx + 1} 条记录点击次数非法 (须为非负安全整数): ${item.clickCount}`);
      }

      // 重复行与冲突行校验:
      // 完全相同重复行去重；同一作用域/入口/日期存在不同次数的冲突重复行报错
      const rowKey = `${item.platform}__${item.section}__${item.roleId}__${item.entryId}__${item.date}`;
      if (seenRowMap.has(rowKey)) {
        const prevCount = seenRowMap.get(rowKey);
        if (prevCount === item.clickCount) {
          // 完全相同行去重，跳过
          continue;
        } else {
          throw new Error(
            `存在冲突的重复统计行: 入口 [${item.entryId}] 日期 [${item.date}] 出现冲突次数 (${prevCount} vs ${item.clickCount})`
          );
        }
      }
      seenRowMap.set(rowKey, item.clickCount);

      // 检查是否属于当前作用域
      if (item.platform === platform && item.section === section && item.roleId === targetRoleId) {
        hasScopeRecords = true;

        // 根据指定周期进行时间窗口过滤
        let inPeriod = false;
        if (period === '7d') {
          inPeriod = item.date >= startDate7d && item.date <= todayStr;
        } else if (period === '30d') {
          inPeriod = item.date >= startDate30d && item.date <= todayStr;
        } else {
          // all: 过去及今天
          inPeriod = item.date <= todayStr;
        }

        if (inPeriod) {
          if (!aggMap.has(item.entryId)) {
            aggMap.set(item.entryId, {
              entryId: item.entryId,
              entryName: item.entryName || item.entryId,
              clicks: 0,
              isOffline: Boolean(item.isOffline),
            });
          }
          const rec = aggMap.get(item.entryId);
          const nextClicks = rec.clicks + item.clickCount;
          if (!Number.isSafeInteger(nextClicks)) {
            throw new Error(`入口 [${item.entryId}] 聚合点击次数超出安全整数范围`);
          }
          rec.clicks = nextClicks;
          if (item.isOffline) {
            rec.isOffline = true;
          }
          if (item.entryName) {
            rec.entryName = item.entryName;
          }
        }
      }
    }

    if (!hasScopeRecords) {
      return {
        hasData: false,
        source: parsed.source,
        isSample: parsed.source === 'sample',
        records: [],
        clicksMap: Object.create(null),
        offlineItems: [],
        updatedAt: parsed.updatedAt,
        hasError: false,
      };
    }

    const records = Array.from(aggMap.values());
    const clicksMap = Object.create(null);
    const offlineItems = [];
    records.forEach((r) => {
      clicksMap[r.entryId] = r.clicks;
      if (r.isOffline) {
        offlineItems.push(r);
      }
    });

    return {
      hasData: true,
      source: parsed.source,
      isSample: parsed.source === 'sample',
      records,
      clicksMap,
      offlineItems,
      updatedAt: parsed.updatedAt,
      hasError: false,
    };
  } catch (err) {
    return {
      hasData: false,
      source: 'none',
      isSample: false,
      records: [],
      clicksMap: Object.create(null),
      offlineItems: [],
      updatedAt: '--',
      hasError: true,
      errorMessage: err?.message || '读取统计快照失败',
    };
  }
};

export const injectRoleEntryStatsSnapshot = (stats) => {
  window.localStorage.setItem(ROLE_WORKBENCH_STATS_KEY, JSON.stringify(stats));
};

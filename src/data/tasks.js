// GUI 规格中的任务数据：基线数据（db62a7e 登录态）
export const BASE_TASKS = [
  {
    taskId: '1',
    title: 'SY550H挖掘机跨标段转运',
    status: 'processing',
    priority: 'high',
    taskType: '运输任务',
    plannedStartTime: '2026-06-05',
    deadline: '2026-06-07',
    createdAt: '2026-06-01 10:00',
    creator: '王五',
    assignee: '当前用户',
    deviceCount: 1,
    primaryDeviceName: 'JH6',
    primaryDeviceType: '半挂牵引车',
  },
  {
    taskId: '2',
    title: '三台主力设备联合安全巡检',
    status: 'processing',
    priority: 'medium',
    taskType: '现场勘察',
    plannedStartTime: '2026-06-06',
    deadline: '2026-06-08',
    createdAt: '2026-06-02 14:00',
    creator: '刘八',
    assignee: '当前用户',
    deviceCount: 3,
  },
  {
    taskId: '3',
    title: '新建搅拌站场地地质勘察',
    status: 'pending',
    priority: 'medium',
    taskType: '现场勘察',
    plannedStartTime: '2026-06-08',
    deadline: '2026-06-08',
    createdAt: '2026-06-03 09:00',
    creator: '李四',
    assignee: '当前用户',
    deviceCount: 0,
  },
  {
    taskId: '4',
    title: '一号旋挖钻机冷却系统现场排查',
    status: 'pending',
    priority: 'high',
    taskType: '现场勘察',
    plannedStartTime: '2026-06-07',
    deadline: '2026-06-09',
    createdAt: '2026-06-04 11:00',
    creator: '赵六',
    assignee: '当前用户',
    deviceCount: 1,
    primaryDeviceName: '一号旋挖钻机',
    primaryDeviceType: '旋挖钻机',
  },
  {
    taskId: '5',
    title: '3号地块基坑土方开挖',
    status: 'pending',
    priority: 'low',
    taskType: '挖掘任务',
    plannedStartTime: '2026-06-11',
    deadline: '2026-06-14',
    createdAt: '2026-06-05 16:00',
    creator: '陈七',
    assignee: '当前用户',
    deviceCount: 1,
    primaryDeviceName: 'SY005CFS552K8',
    primaryDeviceType: '挖掘机',
  },
];

// 游客体验模式专属演示任务（b5ded1b）
export const GUEST_TASKS = [
  {
    taskId: '1',
    title: '设备维护',
    status: 'processing',
    priority: 'high',
    taskType: '维保任务',
    plannedStartTime: '2026-06-05',
    deadline: '2026-06-07',
    createdAt: '2026-06-01 10:00',
    creator: '王五',
    assignee: '当前用户',
    deviceCount: 1,
    primaryDeviceName: 'SY014CF0113D8',
    primaryDeviceType: '挖掘机',
    deviceCodes: ['SY014CF0113D8'],
    description: '对现场作业液压挖掘机进行周期性维保检查与液压系统检测。',
  },
  {
    taskId: '2',
    title: '起重机入场工作',
    status: 'pending',
    priority: 'medium',
    taskType: '进场作业',
    plannedStartTime: '2026-06-06',
    deadline: '2026-06-08',
    createdAt: '2026-06-02 14:00',
    creator: '李四',
    assignee: '李四',
    deviceCount: 1,
    primaryDeviceName: 'AC0250CF0056',
    primaryDeviceType: '汽车起重机',
    deviceCodes: ['AC0250CF0056'],
    description: '协调汽车起重机进入作业施工区，核验安全操作规程并开工。',
  },
];

export const isGuestModeActive = () => {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem('sanvist_experience_mode') === '1';
  } catch {
    return false;
  }
};

export const TASKS = new Proxy([], {
  get(target, prop, receiver) {
    const current = isGuestModeActive() ? GUEST_TASKS : BASE_TASKS;
    if (prop === Symbol.iterator) {
      return current[Symbol.iterator].bind(current);
    }
    const val = Reflect.get(current, prop, receiver);
    if (typeof val === 'function') {
      return val.bind(current);
    }
    return current[prop];
  },
});

export const getAllTasks = (demoMode = isGuestModeActive()) => (demoMode ? GUEST_TASKS : BASE_TASKS);
export const getTasks = (demoMode = isGuestModeActive()) => (demoMode ? GUEST_TASKS : BASE_TASKS);

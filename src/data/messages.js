export const MESSAGE_READ_STORAGE_KEY = 'sanvist_message_read_ids_v1';
export const MESSAGE_SETTINGS_STORAGE_KEY = 'sanvist_message_settings_v1';

export const MESSAGE_ITEMS = [
  {
    id: 'fault-001', category: 'alert', title: '冷却水温持续偏高',
    summary: 'EX-2024-003 当前水温 92℃，已超过告警阈值，请及时检查冷却系统。',
    time: '10 分钟前', icon: '温', color: '#d92f3d', target: 'assetDetail',
    payload: { name: '三一泵车', code: 'EX-2024-003', image: 'images/asset-models/sany_pump.jpg' },
  },
  {
    id: 'maintenance-001', category: 'maintenance', title: '设备保养即将到期',
    summary: 'SR175LCF00928 距离计划保养还剩 25 小时，可提前预约服务。',
    time: '1 小时前', icon: '养', color: '#d88620', target: 'maintenance',
  },
  {
    id: 'service-001', category: 'service', title: '服务召请已受理',
    summary: '服务单 SV20260813026 已由上海一号服务站接单，工程师正在联系您。',
    time: '今天 08:42', icon: '服', color: '#23857f', target: 'service',
  },
  {
    id: 'fault-002', category: 'alert', title: '设备离线超过 8 小时',
    summary: 'KT10SESE50393 最后在线时间为昨天 23:36，请确认设备电源与网络。',
    time: '今天 07:36', icon: '离', color: '#53677b', target: 'assetList',
    payload: { kind: 'status', value: 'offline', label: '离线设备' },
  },
  {
    id: 'maintenance-002', category: 'maintenance', title: '保养工单已完成',
    summary: 'HNGJ0531031025 的 500 小时保养已完成，服务报告已归档。',
    time: '昨天 16:20', icon: '完', color: '#38845a', target: 'maintenance',
  },
  {
    id: 'service-002', category: 'service', title: '配件订单已发货',
    summary: '订单 PO20260812018 已发货，预计明天下午送达。',
    time: '昨天 11:08', icon: '件', color: '#6b56a8', target: 'parts',
  },
];

const validMessageIds = new Set(MESSAGE_ITEMS.map((message) => message.id));

export const readStoredMessageIds = () => {
  try {
    const savedIds = JSON.parse(window.localStorage.getItem(MESSAGE_READ_STORAGE_KEY) || '[]');
    return Array.isArray(savedIds) ? savedIds.filter((id) => validMessageIds.has(id)) : [];
  } catch {
    return [];
  }
};

export const readStoredMessageSettings = () => {
  const defaults = { alert: true, maintenance: true, service: true, quiet: false };
  try {
    const saved = JSON.parse(window.localStorage.getItem(MESSAGE_SETTINGS_STORAGE_KEY) || '{}');
    return saved && typeof saved === 'object' ? { ...defaults, ...saved } : defaults;
  } catch {
    return defaults;
  }
};

export const getMessageUnreadCount = () => {
  const readIds = readStoredMessageIds();
  return MESSAGE_ITEMS.filter((message) => !readIds.includes(message.id)).length;
};

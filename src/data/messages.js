import { DEFAULT_ESC_EVENT } from './escEvent';

export const MESSAGE_READ_STORAGE_KEY = 'sanvist_message_read_ids_v1';
export const MESSAGE_SETTINGS_STORAGE_KEY = 'sanvist_message_settings_v1';

export const MESSAGE_ITEMS = [
  {
    id: DEFAULT_ESC_EVENT.id, category: 'alert', title: DEFAULT_ESC_EVENT.title,
    summary: `${DEFAULT_ESC_EVENT.deviceName}（${DEFAULT_ESC_EVENT.serialNumber}）触发 ESC 事件，请立即查看设备工况。`,
    time: '刚刚', icon: 'ESC', color: '#c9192e', target: 'assetDetail',
    payload: { name: DEFAULT_ESC_EVENT.deviceName, code: DEFAULT_ESC_EVENT.serialNumber, image: 'images/审核/搅拌车.jpg', escEvent: true },
  },
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
  {
    id: 'coupon-005', category: 'coupon', title: '优惠券生效通知',
    summary: '配件采购优惠券 ￥100,000 已到达生效时间，现已正式生效，请查看优惠券详情。',
    time: '10 分钟前', icon: '效', color: '#10b981', target: 'couponDetail',
    payload: { couponId: 'CPN-ARRIVED-001' },
  },
  {
    id: 'coupon-001', category: 'coupon', title: '优惠券到账通知',
    summary: '配件采购优惠券 ￥100,000 已到账，请查看优惠券详情。',
    time: '25 分钟前', icon: '券', color: '#089ded', target: 'couponDetail',
    payload: { couponId: 'CPN-ARRIVED-001' },
  },
  {
    id: 'coupon-002', category: 'coupon', title: '优惠券即将到期提醒',
    summary: '服务采购优惠券 ￥200,000 即将到期（有效截止：2026.11.15），请留意有效期。',
    time: '1 小时前', icon: '期', color: '#d88620', target: 'couponDetail',
    payload: { couponId: 'CPN-EXPIRING-002' },
  },
  {
    id: 'coupon-006', category: 'coupon', title: '优惠券核销通知',
    summary: '主机购置优惠券 ￥100,000 已完成部分额度抵扣核销，点击可核对当前额度明细。',
    time: '2 小时前', icon: '销', color: '#089ded', target: 'couponDetail',
    payload: { couponId: 'CPN-LOCKED-007' },
  },
  {
    id: 'coupon-007', category: 'coupon', title: '优惠券低余额提醒',
    summary: '服务采购优惠券 ￥100,000 可使用额度较低（剩余可用 ￥5,000），请查看优惠券详情。',
    time: '3 小时前', icon: '额', color: '#f59e0b', target: 'couponDetail',
    payload: { couponId: 'CPN-LOWBALANCE-009' },
  },
  {
    id: 'coupon-003', category: 'coupon', title: '优惠券失效通知',
    summary: '主机购置优惠券 ￥300,000 已失效，优惠券已过有效期。',
    time: '昨天 15:30', icon: '废', color: '#718096', target: 'couponDetail',
    payload: { couponId: 'CPN-VOIDED-003' },
  },
  {
    id: 'coupon-004', category: 'coupon', title: '【历史】优惠券到账通知',
    summary: '主机购置优惠券 ￥300,000 历史到账凭证，点击可核对当前最新状态。',
    time: '11-01 09:00', icon: '史', color: '#4b5563', target: 'couponDetail',
    payload: { couponId: 'CPN-VOIDED-003' },
  },
];

export const LONG_TEXT_MESSAGE_ITEMS = [
  {
    id: 'long-alert-001', category: 'alert', title: '【系统维护与资产重保调度超长通知标题】全量工程机械设备在恶劣高负荷工况下定期保养周期与专项巡检的紧急调整通知',
    summary: '监测系统发现您名下的三一全路面起重机（EX-2024-003）液压系统工作油温已持续超过95℃极限阈值达45分钟，请立即安排就近机务专员前往作业现场执行安全降载并检查冷却循环管路，以免触发高温保护导致设备停机。',
    time: '刚刚', icon: '警', color: '#d92f3d', target: 'assetDetail',
    payload: { name: '三一泵车', code: 'EX-2024-003', image: 'images/asset-models/sany_pump.jpg' },
  },
  {
    id: 'long-maintenance-001', category: 'maintenance', title: '【定期保养深度维护计划工单超时临期预警通知】挖掘机重载工况1000小时周期核心液压回路专项保养即将到期',
    summary: '您的挖掘机设备 SR175LCF00928 距离计划重保还剩不到24小时，当前累计工作时间已达998小时，建议您立即通过 SanVIST 客户端预约上海一号直营维保服务站以享受原厂工程师免费上门巡检支持。',
    time: '10 分钟前', icon: '养', color: '#d88620', target: 'maintenance',
  },
  {
    id: 'long-coupon-001', category: 'coupon', title: '【战略客户尊享超长优惠券通知】大型挖掘机及工程车辆主机购置专用超长大额代金券已到账',
    summary: '主机购置专用大额代金券 ￥100,000,000 已到账，请前往详情查看。',
    time: '1 小时前', icon: '券', color: '#089ded', target: 'couponDetail',
    payload: { couponId: 'CPN-ARRIVED-001' },
  },
];

export const MESSAGE_GROUPS = [
  {
    id: 'service_system',
    title: '服务系统消息',
    categories: ['alert', 'service'],
    emptySummary: '暂无服务系统消息',
  },
  {
    id: 'maintenance',
    title: '保养消息',
    categories: ['maintenance'],
    emptySummary: '暂无保养消息',
  },
  {
    id: 'coupon',
    title: '优惠券通知',
    categories: ['coupon'],
    emptySummary: '暂无优惠券通知',
  },
];

export const getGroupMessages = (groupId, items = MESSAGE_ITEMS) => {
  const group = MESSAGE_GROUPS.find((g) => g.id === groupId);
  if (!group) return [];
  return items.filter((m) => group.categories.includes(m.category));
};

export const getGroupUnreadCount = (groupId, readIds = [], items = MESSAGE_ITEMS) => {
  const groupMessages = getGroupMessages(groupId, items);
  return groupMessages.filter((m) => !readIds.includes(m.id)).length;
};

export const getGroupLatestMessage = (groupId, items = MESSAGE_ITEMS) => {
  const groupMessages = getGroupMessages(groupId, items);
  return groupMessages[0] || null;
};

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
  const defaults = { alert: true, maintenance: true, service: true, coupon: true, quiet: false };
  try {
    const saved = JSON.parse(window.localStorage.getItem(MESSAGE_SETTINGS_STORAGE_KEY) || '{}');
    return saved && typeof saved === 'object' ? { ...defaults, ...saved } : defaults;
  } catch {
    return defaults;
  }
};

export const getMessageUnreadCount = (items = MESSAGE_ITEMS) => {
  const readIds = readStoredMessageIds();
  return items.filter((message) => !readIds.includes(message.id)).length;
};

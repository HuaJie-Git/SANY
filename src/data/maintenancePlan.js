import { DEVICES } from './devices';

// 独立的保养页演示样例，保留原清单口径；当天工时不参与到期计算。
export const MAINTENANCE_GROUPS = [
  { id: 'overdue', label: '已逾期', hint: '已超过目标工时', tone: 'danger' },
  { id: 'soon', label: '即将到期', hint: '已到期或进入工时预警范围', tone: 'warning' },
  { id: 'normal', label: '正常保养', hint: '尚未进入工时预警范围', tone: 'success' },
  { id: 'unknown', label: '待补充数据', hint: '已配策略，缺少有效保养数据', tone: 'neutral' },
  { id: 'unconfigured', label: '未配置策略', hint: '尚未设置保养周期', tone: 'neutral' },
];

export function createMaintenanceRows(mixed = false) {
  const remaining = mixed ? [-26, 0, 24, 496, 497, null, null] : [493, 494, 495, 496, 497, null, null];
  return DEVICES.slice(0, 7).map((device, index) => ({
    id: device.id, code: device.code, type: device.type, project: device.project?.name || '未分配项目',
    cycle: mixed && index === 6 ? null : index === 6 ? 3000 : 500,
    target: remaining[index] === null ? null : 500,
    remaining: remaining[index], warning: 50,
    todayHours: device.today?.workHours ?? null,
    records: index === 0 ? [{ date: '2026-08-27 00:00:00', method: '自行保养', hours: 6, description: '原保养清单示例记录' }] : [],
  }));
}

export function maintenanceStatus(row) {
  if (!Number.isFinite(row.cycle) || row.cycle <= 0) return 'unconfigured';
  if (!Number.isFinite(row.remaining) || !Number.isFinite(row.target)) return 'unknown';
  if (row.remaining < 0) return 'overdue';
  if (row.remaining <= row.warning) return 'soon';
  return 'normal';
}

export function maintenanceRemaining(row) {
  if (maintenanceStatus(row) === 'unconfigured') return '请先配置保养策略';
  if (maintenanceStatus(row) === 'unknown') return '缺少有效工时或保养基准';
  if (row.remaining < 0) return `已超出 ${Math.abs(row.remaining)} h`;
  if (row.remaining === 0) return '已到保养工时';
  return `剩余 ${row.remaining} h`;
}

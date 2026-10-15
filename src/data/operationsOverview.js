// 本模块使用独立的设备级演示明细；接入真实数据后仍复用同一汇总方法。
const STATUS_LABELS = [
  { label: '工作', tone: 'working' },
  { label: '行驶', tone: 'driving' },
  { label: '怠速', tone: 'idle' },
  { label: '离线', tone: 'offline' },
];
const amount = (value) => Number.isFinite(value) && value >= 0 ? value : 0;
const round = (value) => Math.round((value + Number.EPSILON) * 10) / 10;

export function summarizeOperations(devices = [], { now = new Date(), timeZone = 'Asia/Shanghai' } = {}) {
  const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const currentTime = new Date(now).getTime();
  const dayOf = (time) => dayFormatter.format(new Date(time));
  const currentDay = dayOf(currentTime);
  const latest = (reports, predicate = () => true) => (reports || [])
    .filter((report) => {
      const time = new Date(report.reportedAt).getTime();
      return Number.isFinite(time) && time <= currentTime && predicate(report, time);
    })
    .reduce((found, report) => !found || new Date(report.reportedAt) > new Date(found.reportedAt) ? report : found, null);
  const summary = {
    statuses: STATUS_LABELS.map((item) => ({ ...item, count: 0 })),
    totalHours: 0, idleHours: 0, runningHours: 0,
    idlePercent: 0, runningPercent: 0,
    totalFuel: 0, totalElectricity: 0,
    fuelCounts: [0, 0, 0, 0], electricityCounts: [0, 0, 0, 0],
  };

  for (const device of devices || []) {
    // 启用状态、机型不参与筛选；只排除不在册或尚未登记的设备。
    if (device.inRegister === false || new Date(device.registeredAt).getTime() > currentTime) continue;
    const state = latest(device.snapshots, (report) => STATUS_LABELS.some((item) => item.label === report.status));
    if (state) summary.statuses.find((item) => item.label === state.status).count += 1;

    // dailyReports 是设备级当日累计明细，同一自然日只取最后一份，避免重复累加累计值。
    const daily = latest(device.dailyReports, (_report, time) => dayOf(time) === currentDay);
    if (daily) {
      summary.totalHours += amount(daily.totalHours);
      summary.idleHours += amount(daily.idleHours);
      summary.runningHours += amount(daily.workHours) + amount(daily.drivingHours);
      if (device.energyType === 'diesel') summary.totalFuel += amount(daily.fuelLitres);
      if (device.energyType === 'electricity') summary.totalElectricity += amount(daily.electricityKwh);
    }

    const field = device.energyType === 'diesel' ? 'fuelPercent' : device.energyType === 'electricity' ? 'batteryPercent' : null;
    if (!field) continue;
    const snapshot = latest(device.snapshots, (report) => Number.isInteger(report[field]) && report[field] >= 0 && report[field] <= 100);
    if (!snapshot) continue;
    const bucket = Math.min(3, Math.floor(snapshot[field] / 25));
    (device.energyType === 'diesel' ? summary.fuelCounts : summary.electricityCounts)[bucket] += 1;
  }

  if (summary.totalHours > 0) {
    summary.idlePercent = round(summary.idleHours / summary.totalHours * 100);
    summary.runningPercent = round(summary.runningHours / summary.totalHours * 100);
  }
  for (const key of ['totalHours', 'idleHours', 'runningHours', 'totalFuel', 'totalElectricity']) summary[key] = round(summary[key]);
  return summary;
}

export function createOperationsPreview(now = new Date()) {
  const timestamp = new Date(now).toISOString();
  const fuel = [96, 72, 80, 60, 88, 52, 64, 48, 70, 66];
  const remaining = [12, 24, 25, 38, 49, 50, 66, 74, 75, 100, 70, 88];
  const running = [8, 7, 6, 5, 4, 6, 4, 3, 4, 3, 2, 1];
  const idle = [2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2];
  return running.map((hours, index) => ({
    id: `overview-preview-${index + 1}`,
    inRegister: true,
    enabled: index % 3 !== 0,
    registeredAt: timestamp,
    energyType: index < 10 ? 'diesel' : 'electricity',
    dailyReports: [{ reportedAt: timestamp, totalHours: hours + idle[index], workHours: hours - (index === 5 ? 2 : 0), drivingHours: index === 5 ? 2 : 0, idleHours: idle[index], fuelLitres: fuel[index] || 0, electricityKwh: index === 10 ? 30 : index === 11 ? 36 : 0 }],
    snapshots: [{ reportedAt: timestamp, status: index < 5 ? '工作' : index === 5 ? '行驶' : index < 9 ? '怠速' : '离线', [index < 10 ? 'fuelPercent' : 'batteryPercent']: remaining[index] }],
  }));
}

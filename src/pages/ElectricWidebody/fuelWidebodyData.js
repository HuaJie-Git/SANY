/**
 * 燃油宽体车 (KT090AE20208) 专属报表数据引擎
 * 遵循 PC-DEC-008 / V5-R01 / A01 / V5-REVIEW-001:
 * 1. 采用与 PC 端 widebody.js 完全相同的确定性 hash 函数与日记录生成算法；
 * 2. 统一专属文案为“能耗 / 平均每小时能耗”，单位 L 与 L/h；
 * 3. 基准日 2023-11-23 与 PC 端严格一致 (能耗 7.0L, 平均每小时能耗 50.0L/h, 工时 0.14h, 怠速工时 0.16h, 油位 74%)；
 * 4. 周期数据 (周/月) 由每日记录动态确定性聚合，周汇总四项指标与 PC 端同周聚合完全一致；
 * 5. 连续工时分布分段 (09:00 起始，0.14h 工作，0.16h 怠速)，不加假整小时。
 */

export const FUEL_WIDEBODY_DEVICE_INFO = {
  name: '燃油宽体车',
  model: 'KT090AE',
  code: 'KT090AE20208',
  type: '燃油宽体车',
  status: '工作',
  location: '中国',
  reportTime: '2023-11-23 15:30:00 (UTC+8)',
};

// 确定性字符串哈希，与 PC widebody.js 保持完全一致
export function hashDateString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 严格日期格式规范化：仅允许真实 YYYY-MM-DD 或 YYYY/MM/DD
 */
export function normalizeDateStr(dateOrString) {
  if (!dateOrString) return '';
  if (dateOrString instanceof Date) {
    if (Number.isNaN(dateOrString.getTime())) return '';
    const y = dateOrString.getFullYear();
    if (y < 1970 || y > 2099) return '';
    const m = String(dateOrString.getMonth() + 1).padStart(2, '0');
    const d = String(dateOrString.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof dateOrString === 'string') {
    const clean = dateOrString.trim();
    const match = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (match) {
      const y = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const d = parseInt(match[3], 10);
      if (y >= 1970 && y <= 2099 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        const maxDays = new Date(y, m, 0).getDate();
        if (d <= maxDays) {
          const sm = String(m).padStart(2, '0');
          const sd = String(d).padStart(2, '0');
          return `${y}-${sm}-${sd}`;
        }
      }
    }
  }
  return '';
}

/**
 * 解析日期为 Date 对象，无效日期返回 null
 */
export function parseDate(dateOrString) {
  const norm = normalizeDateStr(dateOrString);
  if (!norm) return null;
  const [y, m, d] = norm.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * 机器利用率计算函数 (DEC-011)
 * runtimeHours / workHours * 100, 允许 >100%, 不 clamp
 */
export function getMachineUtilization(runtimeHours, workHours) {
  if (
    runtimeHours === null ||
    runtimeHours === undefined ||
    workHours === null ||
    workHours === undefined
  ) {
    return null;
  }
  const r = Number(runtimeHours);
  const w = Number(workHours);
  if (!Number.isFinite(r) || !Number.isFinite(w) || w <= 0 || r < 0) {
    return null;
  }
  return parseFloat(((r / w) * 100).toFixed(1));
}

/**
 * 周期内真实日期字符串数组
 */
export function getPeriodDates(period, baseDateInput) {
  const d = parseDate(baseDateInput);
  if (!d) return [];
  if (period === 'daily') {
    return [normalizeDateStr(d)];
  }
  if (period === 'weekly') {
    const dayOfWeek = d.getDay();
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMon);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);
      dates.push(normalizeDateStr(cur));
    }
    return dates;
  }
  if (period === 'monthly') {
    const y = d.getFullYear();
    const m = d.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const dates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const cur = new Date(y, m, day);
      dates.push(normalizeDateStr(cur));
    }
    return dates;
  }
  return [normalizeDateStr(d)];
}

/**
 * 安全累加（保留未知 null）
 */
export function safeSum(values, decimals = 1) {
  if (!Array.isArray(values) || values.length === 0) return null;
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v === null || v === undefined) return null;
    if (typeof v === 'string' && v.trim() === '') return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    total += n;
  }
  return parseFloat(total.toFixed(decimals));
}

/**
 * 安全平均（保留未知 null）
 */
export function safeAvg(sum, count, decimals = 2) {
  if (sum === null || count === null || sum === undefined || count === undefined) return null;
  if (typeof sum === 'string' && sum.trim() === '') return null;
  if (typeof count === 'string' && count.trim() === '') return null;
  const s = Number(sum);
  const c = Number(count);
  if (!Number.isFinite(s) || !Number.isFinite(c) || c <= 0) return null;
  return parseFloat((s / c).toFixed(decimals));
}

/**
 * 燃油宽体车单日统计生成引擎（与 PC widebody.js 契约完全一致）
 * 2023-11-23 基准日严格对齐：能耗 7L, 平均每小时能耗 50.0L/h, 工时 0.14h, 怠速工时 0.16h
 */
export function getFuelDayStats(dateInput) {
  const dateStr = normalizeDateStr(dateInput);
  if (!dateStr) return null;

  if (dateStr === '2023-11-23') {
    return {
      date: dateStr,
      fuel: 7.0,
      avgHourlyFuel: 50.0,
      workHours: 0.14,
      idleHours: 0.16,
      runningHours: 0.3,
      mileage: 2.4,
      runningFuel: 6.2,
      idleFuel: 0.8,
      utilizationRate: 214.3,
      fuelLevel: 74,
    };
  }

  const seed = hashDateString(dateStr);
  const fuel = parseFloat((5.0 + (seed % 6) + (seed % 5) * 0.2).toFixed(1));
  const workHours = parseFloat((0.10 + (seed % 5) * 0.02).toFixed(2));
  const idleHours = parseFloat((0.12 + (seed % 5) * 0.02).toFixed(2));
  const runningHours = parseFloat((workHours + idleHours).toFixed(2));
  const avgHourlyFuel = workHours > 0 ? parseFloat((fuel / workHours).toFixed(1)) : null;
  const mileage = parseFloat((1.8 + (seed % 4) * 0.4).toFixed(1));
  const runningFuel = parseFloat((4.0 + (seed % 5) * 0.5).toFixed(1));
  const idleFuel = parseFloat((0.4 + (seed % 4) * 0.2).toFixed(1));
  const utilizationRate = getMachineUtilization(runningHours, workHours);
  const fuelLevel = 60 + (seed % 30);

  return {
    date: dateStr,
    fuel,
    avgHourlyFuel,
    workHours,
    idleHours,
    runningHours,
    mileage,
    runningFuel,
    idleFuel,
    utilizationRate,
    fuelLevel,
  };
}

/**
 * 周期聚合（燃油宽体车，与 PC widebody.js:getPeriodicFuelData 契约完全一致）
 */
export function getPeriodicFuelData(period, baseDateInput) {
  const dates = getPeriodDates(period, baseDateInput);
  const rows = dates.map((dateStr) => getFuelDayStats(dateStr)).filter(Boolean);

  const totalFuel = safeSum(rows.map((r) => r.fuel), 1);
  const totalWorkHours = safeSum(rows.map((r) => r.workHours), 2);
  const totalIdleHours = safeSum(rows.map((r) => r.idleHours), 2);
  const totalRunningHours = safeSum(rows.map((r) => r.runningHours), 2);
  const totalMileage = safeSum(rows.map((r) => r.mileage), 1);

  const avgHourlyFuel = safeAvg(totalFuel, totalWorkHours, 1);
  const utilizationRate = getMachineUtilization(totalRunningHours, totalWorkHours);

  return {
    period,
    dates,
    rows,
    summary: {
      fuel: totalFuel,
      avgHourlyFuel,
      workHours: totalWorkHours,
      idleHours: totalIdleHours,
      runningHours: totalRunningHours,
      mileage: totalMileage,
      utilizationRate,
    },
  };
}

/**
 * 当日开工分布（随本日实际 stats 派生，连续分段，与 PC getDailyWorkDistribution 一致）
 * 09:00 起始，0.14h 工作，0.16h 怠速
 */
export function getDailyWorkDistribution(dateInput) {
  const dayStat = getFuelDayStats(dateInput);
  if (!dayStat) return [];

  const work = Number(dayStat.workHours || 0);
  const idle = Number(dayStat.idleHours || 0);
  if (work <= 0 && idle <= 0) return [];

  const startHour = 9.0;
  const segments = [];

  if (work > 0) {
    const workEnd = Math.min(24.0, parseFloat((startHour + work).toFixed(2)));
    segments.push({ status: '工作', start: startHour, end: workEnd });
    if (idle > 0) {
      const idleEnd = Math.min(24.0, parseFloat((workEnd + idle).toFixed(2)));
      if (idleEnd > workEnd) {
        segments.push({ status: '怠速', start: workEnd, end: idleEnd });
      }
    }
  } else if (idle > 0) {
    const idleEnd = Math.min(24.0, parseFloat((startHour + idle).toFixed(2)));
    segments.push({ status: '怠速', start: startHour, end: idleEnd });
  }

  return segments;
}

/**
 * 兼容旧组件的默认静态数据引用（基于 2023-11-23 基准日）
 */
const defaultBaseDate = '2023-11-23';
const defaultDayStat = getFuelDayStats(defaultBaseDate);
const defaultWeekData = getPeriodicFuelData('weekly', defaultBaseDate);
const defaultMonthData = getPeriodicFuelData('monthly', defaultBaseDate);

export const FUEL_WIDEBODY_DATA = {
  supportsTrajectory: false,
  daily: {
    fuelLevel: String(defaultDayStat.fuelLevel),
    summary: [
      ['能耗', String(defaultDayStat.fuel.toFixed(1)), 'L'],
      ['平均每小时能耗', String(defaultDayStat.avgHourlyFuel.toFixed(1)), 'L/h'],
      ['工时', String(defaultDayStat.workHours.toFixed(2)), 'h'],
      ['怠速工时', String(defaultDayStat.idleHours.toFixed(2)), 'h'],
    ],
    detailedSegments: getDailyWorkDistribution(defaultBaseDate),
    workDist: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  weekly: {
    summary: [
      ['能耗', String(defaultWeekData.summary.fuel), 'L'],
      ['平均每小时能耗', String(defaultWeekData.summary.avgHourlyFuel), 'L/h'],
      ['工时', String(defaultWeekData.summary.workHours), 'h'],
      ['怠速工时', String(defaultWeekData.summary.idleHours), 'h'],
    ],
    calDays: defaultWeekData.rows.map((r, i) => ({
      d: r?.date ? parseInt(r.date.split('-')[2], 10) : (i + 1),
      amount: null,
      fuel: r.fuel,
    })),
    fuelTrend: defaultWeekData.rows.map((r) => r.fuel),
    workH: defaultWeekData.rows.map((r) => r.workHours),
    idleH: defaultWeekData.rows.map((r) => r.idleHours),
  },
  monthly: {
    summary: [
      ['能耗', String(defaultMonthData.summary.fuel), 'L'],
      ['平均每小时能耗', String(defaultMonthData.summary.avgHourlyFuel), 'L/h'],
      ['工时', String(defaultMonthData.summary.workHours), 'h'],
      ['怠速工时', String(defaultMonthData.summary.idleHours), 'h'],
    ],
    fuelTrend: defaultMonthData.rows.map((r) => r.fuel),
    workH: defaultMonthData.rows.map((r) => r.workHours),
    idleH: defaultMonthData.rows.map((r) => r.idleHours),
  },
};

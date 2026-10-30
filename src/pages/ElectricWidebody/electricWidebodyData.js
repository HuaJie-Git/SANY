import { completeDay, summarizeDays, reportMetrics, todayMetrics, cumulativeMetrics } from './widebodyMetrics.js';
/**
 * 电动宽体车 (POPJ0841016452) 专用数据与动态联动引擎
 * 遵从 DEC-004 与 REVIEW-002:
 * 1. 名称统一为「电动宽体车」
 * 2. 今日及周期使用能耗、充电桩能耗、回收能量与回收比例，累计充电量只作为计算输入。
 * 3. 统一规范化 YYYY-MM-DD 日样例生成函数 getDailyVehicleStats，保证日报、周历、月历在同日完全相等 (F2-03)
 * 4. 周/月汇总由日历真实累加，未计算基期则环比展示「—」(F2-03)
 * 5. 轨迹窗口去除 0.5h 下限，精准支持 10 分钟等任意时间区间 (F2-02)
 */

export function isElectricWidebody(device) {
  if (!device) return false;
  if (device.code === 'POPJ0841016452') return true;
  if (device.modelType === 'electric_widebody') return true;
  if (
    device.powerType === 'electric' &&
    (device.name?.includes('宽体') || device.name?.includes('自卸'))
  ) {
    return true;
  }
  return false;
}

export const ELECTRIC_WIDEBODY_INFO = {
  name: '电动宽体车',
  model: 'SKT105E',
  code: 'POPJ0841016452',
  plate: '蒙K·89201电',
  status: '工作',
  powerType: 'electric',
  location: '内蒙古自治区鄂尔多斯市准格尔旗黑岱沟露天煤矿',
  startLocation: '1号采掘工作面 (标高 +1080m)',
  endLocation: '2号地面破碎站 (标高 +1160m)',
  reportTime: '2023-11-23 09:41:00 (UTC+8)',
};

// 简单字符串哈希函数，用于根据选定日期生成可复现的自洽指标波动
function hashDateString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 格式化日期为标准的 YYYY-MM-DD
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
 * DEC-011 / REVIEW-V2-01: 机器利用率计算函数
 * 公式: runtimeHours / workHours * 100
 * 允许超过 100%，不得 clamp
 * 当 workHours <= 0、缺失、null 或非法时返回 null (UI 显示 —)
 * 当 runtimeHours < 0 或非法时返回 null
 * 当 workHours > 0 且 runtimeHours === 0 时返回 0.0
 */
export function getMachineUtilizationRate(runtimeHours, workHours) {
  if (
    runtimeHours === null ||
    runtimeHours === undefined ||
    workHours === null ||
    workHours === undefined
  ) {
    return null;
  }
  const runtime = Number(runtimeHours);
  const work = Number(workHours);
  if (!Number.isFinite(runtime) || !Number.isFinite(work) || work <= 0 || runtime < 0) {
    return null;
  }
  return parseFloat(((runtime / work) * 100).toFixed(1));
}

/**
 * 统一日样例生成函数 (F2-03)
 * 规范化 YYYY-MM-DD 后哈希，日报、周历、月历均从相同日记录派生
 */
function basegetDailyVehicleStats(dateInput) {
  const dateStr = normalizeDateStr(dateInput);
  const [year, month, day] = dateStr.split('-').map(Number);

  // 基准样例日 2023-11-23 与详情页完全一致
  if (dateStr === '2023-11-23') {
    const workHours = 4.5;
    const runtimeHours = 5.3;
    return {
      dateStr,
      year,
      month,
      day,
      mileage: 48.6,
      energy: 210,
      trips: 6,
      weight: 72.5,
      avgEnergy: 4.32,
      chargeDuration: 1.2,
      recoveryEnergy: 24.5,
      workHours,
      idleHours: 0.8,
      runtimeHours,
      maxSpeed: 42,
      batteryHealth: 96,
      utilizationRate: getMachineUtilizationRate(4, runtimeHours),
      chargingEnergy: 210.0,
      endOfDaySoc: 62.0,
    };
  }

  const seed = hashDateString(dateStr);
  const mileage = parseFloat((36 + (seed % 20) + (seed % 10) * 0.1).toFixed(1));
  const energy = parseFloat((170 + (seed % 70) + (seed % 7) * 0.1).toFixed(1));
  const trips = 4 + (seed % 5);
  const weight = parseFloat((trips * 12 + (seed % 10) * 0.5).toFixed(1));
  const avgEnergy = mileage > 0 ? parseFloat((energy / mileage).toFixed(2)) : null;
  const chargeDuration = parseFloat((0.8 + (seed % 8) * 0.1).toFixed(1));
  const recoveryEnergy = parseFloat((16 + (seed % 12) + (seed % 5) * 0.1).toFixed(1));
  const workHours = parseFloat((3.8 + (seed % 4) * 0.4).toFixed(1));
  const idleHours = parseFloat((0.6 + (seed % 3) * 0.2).toFixed(1));
  const runtimeHours = parseFloat((workHours + idleHours).toFixed(1));
  const maxSpeed = 38 + (seed % 8);
  const batteryHealth = 92 + (seed % 7);
  const utilizationRate = getMachineUtilizationRate(Number((workHours * 0.9).toFixed(2)), runtimeHours);
  const chargingEnergy = parseFloat((chargeDuration * 175.0).toFixed(1));
  const endOfDaySoc = 45 + (seed % 40);

  return {
    dateStr,
    year,
    month,
    day,
    mileage,
    energy,
    trips,
    weight,
    avgEnergy,
    chargeDuration,
    recoveryEnergy,
    workHours,
    idleHours,
    runtimeHours,
    maxSpeed,
    batteryHealth,
    utilizationRate,
    chargingEnergy,
    endOfDaySoc,
  };
}

// 基准日单例对象，供今日指标共源派生 (REVIEW-V2-01)
const baselineToday = getDailyVehicleStats('2023-11-23');

// 实时工况保留电池、电量、车速与上报运输重量；运输趟数归入今日数据。
export const ELECTRIC_REALTIME_METRICS = [
  { label: '剩余电量', value: '78', unit: '%' },
  { label: '电池健康', value: String(baselineToday.batteryHealth), unit: '%' },
  { label: '车速', value: '24', unit: 'km/h' },
  { label: '运输重量', value: String(baselineToday.weight), unit: 't' },
];
export const ELECTRIC_TODAY_METRICS = todayMetrics(baselineToday, true);

// 24小时分布：0:关机, 1:工作/重载, 2:怠速/装载
export const ELECTRIC_TODAY_TIMELINE = [
  0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 2,
  1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0,
];

// 累计展示从最终字段清单派生，不单独展示累计充电量。
export const ELECTRIC_CUMULATIVE_METRICS = cumulativeMetrics(true);

/**
 * 真实日期驱动报表数据生成器 (FIX-001 / F2-01 / F2-03)
 * 支持日报/周报/月报联动，跨月、跨年、大小月及闰年自洽
 * 周/月汇总严格由日历实际求和得出，未计算基期则环比显示「—」
 */
// 功耗沿用独立日数据；未知值传播到周期汇总，合法零值保持为零。
export function sumReportEnergy(values) {
  if (!Array.isArray(values) || values.length === 0) return null;
  const numbers = values.map((value) => (
    value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
      ? NaN : Number(value)
  ));
  if (numbers.some((value) => !Number.isFinite(value))) return null;
  return Number(numbers.reduce((total, value) => total + value, 0).toFixed(1));
}

export function formatReportEnergy(value) {
  const energy = sumReportEnergy([value]);
  return energy === null ? '—' : energy.toFixed(1);
}

function basegetReportDataByDate(dateObj, tab) {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth(); // 0-11
  const day = dateObj.getDate();
  const dateKey = normalizeDateStr(dateObj);

  if (tab === 'daily') {
    const dailyStat = getDailyVehicleStats(dateKey);

    return {
      dateStr: dateKey,
      dateLabel: `${year}年${month + 1}月${day}日`,
      kpis: reportMetrics(dailyStat, true),
      timeline: ELECTRIC_TODAY_TIMELINE,
      timelineSegments: getElectricTimelineSegments(dateKey),
      socCurve: getDailySocCurve(dateKey),
      gearDistribution: getDailyGearDistribution(dateKey),
    };
  }

  if (tab === 'weekly') {
    // 计算以当前日期所在周（周一至周日）
    const currDay = dateObj.getDay(); // 0 (Sun) - 6 (Sat)
    const distanceToMonday = (currDay + 6) % 7;
    const monday = new Date(year, month, day - distanceToMonday);

    const weekDays = [];
    const avgEnergyTrend = [];
    const tripsTrend = [];
    const chargeDurationTrend = [];
    const recoveryRateTrend = [];

    const weekdayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const dKey = normalizeDateStr(d);
      const dailyStat = getDailyVehicleStats(dKey);

      weekDays.push({
        ...dailyStat,
        name: weekdayNames[i],
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        fullDate: dKey,
        dateStr: dKey,
        trips: dailyStat.trips,
        weight: dailyStat.weight,
        mileage: dailyStat.mileage,
        energy: dailyStat.energy,

        chargeDuration: dailyStat.chargeDuration,
        recovery: dailyStat.recoveryEnergy,
        recoveryEnergy: dailyStat.recoveryEnergy,
        avgEnergy: dailyStat.avgEnergy,
        endOfDaySoc: dailyStat.endOfDaySoc,
      });

      avgEnergyTrend.push(dailyStat.avgEnergy);
      tripsTrend.push(dailyStat.trips);
      chargeDurationTrend.push(dailyStat.chargeDuration);
      recoveryRateTrend.push(dailyStat.recoveryRate);
    }

    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);

    return {
      dateStr: dateKey,
      dateLabel: `${monday.getFullYear()}年${monday.getMonth() + 1}月${monday.getDate()}日 - ${sunday.getMonth() + 1}月${sunday.getDate()}日`,
      summary: reportMetrics(summarizeDays(weekDays, true), true),
      days: weekDays,
      avgEnergyTrend,
      tripsTrend,
      chargeDurationTrend,
      recoveryRateTrend,
      socTrend: weekDays.map((d) => ({
        label: d.name,
        date: d.date,
        fullDate: d.fullDate,
        dateStr: d.dateStr,
        soc: d.endOfDaySoc,
      })),
      gearDistribution: aggregateGearDistribution(weekDays.map((d) => d.dateStr)),
    };
  }

  // monthly 分支 (真月份天数)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sun

  const monthDays = [];
  const avgEnergyTrend = [];
  const tripsTrend = [];
  const chargeDurationTrend = [];
  const recoveryRateTrend = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const dKey = normalizeDateStr(new Date(year, month, i));
    const dailyStat = getDailyVehicleStats(dKey);

    monthDays.push({
      ...dailyStat,
      day: i,
      dateStr: dKey,
      trips: dailyStat.trips,
      weight: dailyStat.weight,
      mileage: dailyStat.mileage,
      energy: dailyStat.energy,

      chargeDuration: dailyStat.chargeDuration,
      recovery: dailyStat.recoveryEnergy,
      recoveryEnergy: dailyStat.recoveryEnergy,
      avgEnergy: dailyStat.avgEnergy,
      endOfDaySoc: dailyStat.endOfDaySoc,
    });

    avgEnergyTrend.push(dailyStat.avgEnergy);
    tripsTrend.push(dailyStat.trips);
    chargeDurationTrend.push(dailyStat.chargeDuration);
    recoveryRateTrend.push(dailyStat.recoveryRate);
  }

  return {
    dateStr: `${year}-${String(month + 1).padStart(2, '0')}`,
    dateLabel: `${year}年${month + 1}月`,
    daysInMonth,
    firstDayOfWeek,
    summary: reportMetrics(summarizeDays(monthDays, true), true),
    days: monthDays,
    avgEnergyTrend,
    tripsTrend,
    chargeDurationTrend,
    recoveryRateTrend,
    socTrend: monthDays.map((d) => ({
      label: `${d.day}日`,
      date: `${month + 1}/${d.day}`,
      dateStr: d.dateStr,
      soc: d.endOfDaySoc,
    })),
    gearDistribution: aggregateGearDistribution(monthDays.map((d) => d.dateStr)),
  };
}

/**
 * V2-R02: 单日 24 小时电量曲线数据生成 (00:00 ~ 24:00)
 * 采用 SOC 百分比口径，0~100%，点选查看时间与 SOC
 * 2023-11-23 样例在 16:00 为 48.6% (与 IMG-V2-01 视觉事实源严格对齐)
 * 24:00 末尾值严格与 dailyStat.endOfDaySoc 相等
 */
export function getDailySocCurve(dateInput) {
  const dateStr = normalizeDateStr(dateInput);
  if (!dateStr) return null;
  const dailyStat = getDailyVehicleStats(dateStr);
  if (!dailyStat) return null;

  if (dateStr === '2023-11-23') {
    const points = [
      { time: '00:00', soc: 94.0 },
      { time: '02:00', soc: 98.0 },
      { time: '04:00', soc: 95.0 },
      { time: '06:00', soc: 90.0 },
      { time: '08:00', soc: 82.0 },
      { time: '10:00', soc: 71.0 },
      { time: '12:00', soc: 64.0 },
      { time: '14:00', soc: 56.0 },
      { time: '16:00', soc: 48.6 },
      { time: '18:00', soc: 42.0 },
      { time: '20:00', soc: 55.0 },
      { time: '22:00', soc: 60.0 },
      { time: '24:00', soc: 62.0 },
    ];
    return {
      dateStr,
      endOfDaySoc: 62.0,
      points,
    };
  }

  const seed = hashDateString(dateStr);
  const startSoc = 85 + (seed % 12);
  const endSoc = dailyStat.endOfDaySoc;
  const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'];

  const points = hours.map((time, idx) => {
    if (idx === 0) return { time, soc: startSoc };
    if (idx === hours.length - 1) return { time, soc: endSoc };
    const t = idx / (hours.length - 1);
    const dip = Math.sin(t * Math.PI) * (22 + (seed % 10));
    const base = startSoc * (1 - t) + endSoc * t;
    const soc = Math.max(12, Math.min(100, parseFloat((base - dip).toFixed(1))));
    return { time, soc };
  });

  return {
    dateStr,
    endOfDaySoc: endSoc,
    points,
  };
}

/**
 * V2-R02: 单日档位分布数据生成
 * 1档、2档、3档、4档、R档使用时长与百分比
 * 2023-11-23 基准日对应 25%、30%、20%、15%、10%，总时长为工时 4.5h
 */
export function getDailyGearDistribution(dateInput) {
  const dateStr = normalizeDateStr(dateInput);
  const dailyStat = getDailyVehicleStats(dateStr);
  const workHours = dailyStat.workHours;
  const gears = ['1档', '2档', '3档', '4档', 'R档'];

  if (workHours <= 0) {
    return {
      isEmpty: true,
      totalHours: 0,
      gears: gears.map((g) => ({ name: g, duration: 0, percent: 0 })),
      '1档': { duration: 0, percent: 0 },
      '2档': { duration: 0, percent: 0 },
      '3档': { duration: 0, percent: 0 },
      '4档': { duration: 0, percent: 0 },
      'R档': { duration: 0, percent: 0 },
    };
  }

  let pcts;
  if (dateStr === '2023-11-23') {
    pcts = { '1档': 25, '2档': 30, '3档': 20, '4档': 15, 'R档': 10 };
  } else {
    const seed = hashDateString(dateStr);
    const p1 = 22 + (seed % 7);
    const p2 = 27 + ((seed >> 2) % 7);
    const p3 = 18 + ((seed >> 4) % 5);
    const p4 = 13 + ((seed >> 6) % 5);
    const pR = 100 - p1 - p2 - p3 - p4;
    pcts = { '1档': p1, '2档': p2, '3档': p3, '4档': p4, 'R档': pR };
  }

  const result = {
    isEmpty: false,
    totalHours: workHours,
    gears: gears.map((g) => ({
      name: g,
      duration: Number((workHours * (pcts[g] / 100)).toFixed(2)),
      percent: pcts[g],
    })),
  };
  gears.forEach((g) => {
    result[g] = {
      duration: Number((workHours * (pcts[g] / 100)).toFixed(2)),
      percent: pcts[g],
    };
  });
  return result;
}

/**
 * V2-R02: 周/月度档位时长加权汇总
 * 对真实各日档位时长求和后计算占比，最大余数法保证百分比严格累加等于 100%
 */
export function aggregateGearDistribution(dateStrList) {
  const gears = ['1档', '2档', '3档', '4档', 'R档'];
  const totals = { '1档': 0, '2档': 0, '3档': 0, '4档': 0, 'R档': 0 };
  let grandTotalHours = 0;

  for (const dateStr of dateStrList) {
    const dist = getDailyGearDistribution(dateStr);
    if (!dist.isEmpty) {
      for (const g of gears) {
        totals[g] += dist[g].duration;
        grandTotalHours += dist[g].duration;
      }
    }
  }

  if (grandTotalHours <= 0.0001) {
    return {
      isEmpty: true,
      totalHours: 0,
      gears: gears.map((g) => ({ name: g, duration: 0, percent: 0 })),
    };
  }

  const rawPercentages = gears.map((g) => ({
    name: g,
    duration: Number(totals[g].toFixed(2)),
    rawPct: (totals[g] / grandTotalHours) * 100,
    floorPct: Math.floor((totals[g] / grandTotalHours) * 100),
    remainder: ((totals[g] / grandTotalHours) * 100) - Math.floor((totals[g] / grandTotalHours) * 100),
  }));

  const floorSum = rawPercentages.reduce((acc, item) => acc + item.floorPct, 0);
  const remainderCount = 100 - floorSum;

  const sorted = [...rawPercentages].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < remainderCount && i < sorted.length; i++) {
    sorted[i].floorPct += 1;
  }

  return {
    isEmpty: false,
    totalHours: Number(grandTotalHours.toFixed(1)),
    gears: gears.map((g) => {
      const match = rawPercentages.find((item) => item.name === g);
      return {
        name: g,
        duration: match.duration,
        percent: match.floorPct,
      };
    }),
  };
}

/**
 * V2-R03 / V2-STATE: 日期区间校验 (严格回读，防止 2/30 溢出滚动，最大 366 天)
 */
export function validateDateRange(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr || typeof startDateStr !== 'string' || typeof endDateStr !== 'string') {
    return {
      isValid: false,
      error: '请选择有效的开始和结束日期',
      normStart: null,
      normEnd: null,
      diffDays: 0,
    };
  }

  const sClean = startDateStr.trim();
  const eClean = endDateStr.trim();
  const sMatch = sClean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  const eMatch = eClean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);

  if (!sMatch || !eMatch) {
    return {
      isValid: false,
      error: '请选择有效的开始和结束日期',
      normStart: null,
      normEnd: null,
      diffDays: 0,
    };
  }

  const y1 = parseInt(sMatch[1], 10);
  const y2 = parseInt(eMatch[1], 10);

  if (y1 < 1970 || y1 > 2099 || y2 < 1970 || y2 > 2099) {
    return {
      isValid: false,
      error: '日期超出1970-2099有效范围',
      normStart: null,
      normEnd: null,
      diffDays: 0,
    };
  }

  const normStart = normalizeDateStr(startDateStr);
  const normEnd = normalizeDateStr(endDateStr);

  if (!normStart || !normEnd) {
    return {
      isValid: false,
      error: '请选择有效的开始和结束日期',
      normStart: null,
      normEnd: null,
      diffDays: 0,
    };
  }

  const [ny1, nm1, nd1] = normStart.split('-').map(Number);
  const [ny2, nm2, nd2] = normEnd.split('-').map(Number);
  const ms1 = Date.UTC(ny1, nm1 - 1, nd1);
  const ms2 = Date.UTC(ny2, nm2 - 1, nd2);

  if (ms1 > ms2) {
    return {
      isValid: false,
      error: '结束日期不能早于开始日期',
      normStart,
      normEnd,
      diffDays: 0,
    };
  }

  const diffDays = Math.round((ms2 - ms1) / 86400000) + 1;
  if (diffDays > 366) {
    return {
      isValid: false,
      error: '查询跨度不能超过366天',
      normStart,
      normEnd,
      diffDays,
    };
  }

  return {
    isValid: true,
    error: '',
    normStart,
    normEnd,
    diffDays,
    d1: new Date(ny1, nm1 - 1, nd1),
    d2: new Date(ny2, nm2 - 1, nd2),
  };
}

/**
 * 辅助函数：根据开始时间与秒数计算真实结束时间格式化字符串 (YYYY-MM-DD HH:mm:ss)
 */
function addSecondsToDateTime(dateStr, timeStr, seconds) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm, ss] = timeStr.split(':').map(Number);
  const startMs = new Date(y, m - 1, d, hh, mm, ss).getTime();
  const endMs = startMs + Math.round(seconds) * 1000;
  const endDate = new Date(endMs);
  const endY = endDate.getFullYear();
  const endM = String(endDate.getMonth() + 1).padStart(2, '0');
  const endD = String(endDate.getDate()).padStart(2, '0');
  const endH = String(endDate.getHours()).padStart(2, '0');
  const endMin = String(endDate.getMinutes()).padStart(2, '0');
  const endSec = String(endDate.getSeconds()).padStart(2, '0');
  return `${endY}-${endM}-${endD} ${endH}:${endMin}:${endSec}`;
}

/**
 * 辅助函数：解析 YYYY-MM-DD HH:mm:ss 为本地时间毫秒时间戳
 */
function parseDateTimeToMs(dtStr) {
  if (!dtStr) return null;
  const [dPart, tPart] = dtStr.split(' ');
  const [y, m, d] = dPart.split('-').map(Number);
  const [hh, mm, ss] = (tPart || '00:00:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, ss).getTime();
}

/**
 * V2-R03 / REVIEW-V2-01: 充电数据生成器
 * 新增原型示例：基准日 2023-11-23 所有记录的时长之和 = 1.2h、充电电量之和 = 210.0kWh，与详情/报表同日共源
 * 支持起止同日半开区间查询，支持 widebodyChargeState 异常模拟驱动
 */
export function getChargingData(startDateStr, endDateStr, scenario = '') {
  const validation = validateDateRange(startDateStr, endDateStr);
  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.error,
      records: [],
      summary: { count: 0, totalEnergy: null, totalDuration: null },
    };
  }

  if (scenario === 'empty') {
    return {
      isValid: true,
      error: '',
      records: [],
      summary: { count: 0, totalEnergy: 0, totalDuration: 0 },
    };
  }

  const { d1, d2, normStart, normEnd } = validation;
  const p1 = normStart.split('-').map(Number);
  const p2 = normEnd.split('-').map(Number);
  const queryStartMs = new Date(p1[0], p1[1] - 1, p1[2], 0, 0, 0, 0).getTime();
  const queryEndMs = new Date(p2[0], p2[1] - 1, p2[2] + 1, 0, 0, 0, 0).getTime();

  const candidateRecords = [];

  const curr = new Date(d1);
  while (curr <= d2) {
    const dStr = normalizeDateStr(curr);
    const dailyStat = getDailyVehicleStats(dStr);

    if (dStr === '2023-11-23') {
      candidateRecords.push({
        id: `CHG-${dStr.replace(/-/g, '')}-02`,
        dateStr: dStr,
        startTime: `${dStr} 06:46:25`,
        endTime: `${dStr} 07:52:25`,
        durationHours: 1.1,
        startSoc: 30,
        endSoc: 100,
        socIncrease: 70,
        energy: 200.0,
        location: '矿区北广场1号充电站',
        isOngoing: false,
      });
      candidateRecords.push({
        id: `CHG-${dStr.replace(/-/g, '')}-01`,
        dateStr: dStr,
        startTime: `${dStr} 00:00:04`,
        endTime: `${dStr} 00:06:04`,
        durationHours: 0.1,
        startSoc: 94,
        endSoc: 100,
        socIncrease: 6,
        energy: 10.0,
        location: '矿区北广场1号充电站',
        isOngoing: false,
      });
    } else {
      const seed = hashDateString(dStr);
      const dayDuration = dailyStat.chargeDuration;
      const dayEnergy = dailyStat.chargingEnergy;

      if (dayDuration > 0) {
        if (dayDuration >= 1.0) {
          const dur1 = Number((dayDuration * 0.75).toFixed(1));
          const dur2 = Number((dayDuration - dur1).toFixed(1));
          const sec1 = Math.round(dur1 * 3600);
          const sec2 = Math.round(dur2 * 3600);
          const nrg1 = Number((dayEnergy * 0.75).toFixed(1));
          const nrg2 = Number((dayEnergy - nrg1).toFixed(1));

          const startTime1 = `${dStr} 12:30:15`;
          const endTime1 = addSecondsToDateTime(dStr, '12:30:15', sec1);
          const startTime2 = `${dStr} 04:10:00`;
          const endTime2 = addSecondsToDateTime(dStr, '04:10:00', sec2);

          candidateRecords.push({
            id: `CHG-${dStr.replace(/-/g, '')}-02`,
            dateStr: dStr,
            startTime: startTime1,
            endTime: endTime1,
            durationHours: dur1,
            startSoc: 40,
            endSoc: 85 + (seed % 10),
            socIncrease: 85 + (seed % 10) - 40,
            energy: nrg1,
            location: '矿区北广场1号充电站',
            isOngoing: false,
          });
          candidateRecords.push({
            id: `CHG-${dStr.replace(/-/g, '')}-01`,
            dateStr: dStr,
            startTime: startTime2,
            endTime: endTime2,
            durationHours: dur2,
            startSoc: 65,
            endSoc: 95,
            socIncrease: 30,
            energy: nrg2,
            location: '2号地面破碎站充电桩',
            isOngoing: false,
          });
        } else {
          const sec = Math.round(dayDuration * 3600);
          const startTime = `${dStr} 07:15:00`;
          const endTime = addSecondsToDateTime(dStr, '07:15:00', sec);

          candidateRecords.push({
            id: `CHG-${dStr.replace(/-/g, '')}-01`,
            dateStr: dStr,
            startTime,
            endTime,
            durationHours: dayDuration,
            startSoc: 50,
            endSoc: 95,
            socIncrease: 45,
            energy: dayEnergy,
            location: '矿区北广场1号充电站',
            isOngoing: false,
          });
        }
      }
    }

    curr.setDate(curr.getDate() + 1);
  }

  // REVIEW-V2-01: 跨天记录固定示例 CHG-CROSSDAY-01: 2023-11-22 23:30 -> 2023-11-23 00:30
  // 与所选半开区间 [queryStartMs, queryEndMs) 真实相交才纳入，唯一 id 去重
  if (scenario === 'crossday') {
    const crossStartMs = new Date(2023, 10, 22, 23, 30, 0).getTime();
    const crossEndMs = new Date(2023, 10, 23, 0, 30, 0).getTime();
    if (crossStartMs < queryEndMs && crossEndMs > queryStartMs) {
      candidateRecords.push({
        id: 'CHG-CROSSDAY-01',
        dateStr: '2023-11-22',
        startTime: '2023-11-22 23:30:00',
        endTime: '2023-11-23 00:30:00',
        durationHours: 1.0,
        startSoc: 25,
        endSoc: 85,
        socIncrease: 60,
        energy: 180.0,
        location: '1号移动换电站',
        isOngoing: false,
        isCrossDay: true,
      });
    }
  }

  // 唯一 ID 去重
  const recordMap = new Map();
  for (const r of candidateRecords) {
    recordMap.set(r.id, r);
  }
  let records = Array.from(recordMap.values());

  // 按开始时间降序排列
  records.sort((a, b) => (b.startTime > a.startTime ? 1 : -1));

  // 场景注入处理 (REVIEW-V2-01)
  if (scenario === 'charging' && records.length > 0) {
    records[0] = {
      ...records[0],
      endTime: null,
      durationHours: null,
      endSoc: null,
      socIncrease: null,
      energy: null,
      isOngoing: true,
    };
  } else if (scenario === 'partial' && records.length > 0) {
    records[0] = {
      ...records[0],
      endSoc: null,
      socIncrease: null,
      energy: null,
      location: null,
    };
  }

  // 计算每条记录与当前查询区间的重叠时长 (overlapHours) 及有效电量 (effectiveEnergy)
  for (const r of records) {
    const recStartMs = parseDateTimeToMs(r.startTime);
    const recEndMs = r.endTime ? parseDateTimeToMs(r.endTime) : null;

    if (r.isOngoing || recEndMs === null) {
      r.overlapHours = null;
      r.effectiveEnergy = null;
    } else {
      const overlapStartMs = Math.max(recStartMs, queryStartMs);
      const overlapEndMs = Math.min(recEndMs, queryEndMs);
      if (overlapEndMs > overlapStartMs) {
        r.overlapHours = Number(((overlapEndMs - overlapStartMs) / 3600000).toFixed(4));
      } else {
        r.overlapHours = 0;
      }
      const isFullyCovered = recStartMs >= queryStartMs && recEndMs <= queryEndMs;
      // REVIEW-V2-01: 无区间能量采样时部分覆盖电量为 null (显示 —)，完整覆盖该次才计入 energy
      r.effectiveEnergy = isFullyCovered ? r.energy : null;
    }
  }

  // 区间汇总统计
  let totalEnergy = 0;
  let hasMissingEnergy = false;
  let totalDuration = 0;
  let hasMissingDuration = false;

  for (const r of records) {
    if (r.effectiveEnergy === null || r.effectiveEnergy === undefined || isNaN(r.effectiveEnergy)) {
      hasMissingEnergy = true;
    } else {
      totalEnergy += r.effectiveEnergy;
    }

    if (r.overlapHours === null || r.overlapHours === undefined || isNaN(r.overlapHours)) {
      hasMissingDuration = true;
    } else {
      totalDuration += r.overlapHours;
    }
  }

  return {
    isValid: true,
    error: '',
    records,
    summary: {
      count: records.length,
      totalEnergy: hasMissingEnergy ? null : Number(totalEnergy.toFixed(1)),
      totalDuration: hasMissingDuration ? null : Number(totalDuration.toFixed(1)),
    },
  };
}

/**
 * 当日开工时间轴分段（随本日实际 stats 派生，累计时长严格对应工时与怠速）
 * 支持不足 1 小时的连续精确渲染 (PC-DEC-008 / V5-R01 / A05)
 */
export function getElectricTimelineSegments(dateInput) {
  const stat = getDailyVehicleStats(dateInput);
  if (!stat) return [];

  const work = Number(stat.workHours || 0);
  const idle = Number(stat.idleHours || 0);
  if (work <= 0 && idle <= 0) return [];

  const startHour = 8.0;
  const segments = [];

  if (work > 0) {
    const workEnd = Math.min(24.0, parseFloat((startHour + work).toFixed(2)));
    segments.push({ status: '工作', start: startHour, end: workEnd, durationHours: work });
    if (idle > 0) {
      const idleEnd = Math.min(24.0, parseFloat((workEnd + idle).toFixed(2)));
      if (idleEnd > workEnd) {
        segments.push({ status: '怠速', start: workEnd, end: idleEnd, durationHours: idle });
      }
    }
  } else if (idle > 0) {
    const idleEnd = Math.min(24.0, parseFloat((startHour + idle).toFixed(2)));
    segments.push({ status: '怠速', start: startHour, end: idleEnd, durationHours: idle });
  }

  return segments;
}

/**
 * 设备运营分析数据生成器 (FIX-002 / F2-03 / PC-DEC-008)
 * 统一从日记录聚合，工时与百分比严密对应：
 * 工作时长百分率 + 怠速时长百分率 = 100% (基于开机作业总时长)
 */
export function getOperationsData(mode, startDateStr, endDateStr) {
  let sDate = startDateStr;
  let eDate = endDateStr;
  if (arguments.length === 2 && typeof mode === 'string' && typeof startDateStr === 'string' && (mode.includes('-') || mode.includes('/'))) {
    sDate = mode;
    eDate = startDateStr;
  } else if (!eDate && (mode === 'day' || !sDate)) {
    eDate = sDate;
  }

  const validation = validateDateRange(sDate, eDate);
  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.error,
      startDate: sDate,
      endDate: eDate,
      dateText: sDate && eDate ? `${sDate} --- ${eDate}` : '',
      daysCount: 0,
      workHours: null,
      idleHours: null,
      shutdownHours: null,
      totalOperating: null,
      workPercentage: null,
      idlePercentage: null,
      loadedAvgSpeed: null,
      emptyAvgSpeed: null,
      avgCycleTime: null,
      avgPayload: null,
    };
  }

  const { normStart, normEnd } = validation;
  const isSingleDay = normStart === normEnd;

  let totalWork = 0;
  let totalIdle = 0;
  let daysCount = 0;
  let hasUnknownWorkOrIdle = false;

  const [y1, m1, d1] = normStart.split('-').map(Number);
  const [y2, m2, d2] = normEnd.split('-').map(Number);
  const curr = new Date(Date.UTC(y1, m1 - 1, d1));
  const endUtc = new Date(Date.UTC(y2, m2 - 1, d2));

  while (curr <= endUtc) {
    const dStr = curr.toISOString().slice(0, 10);
    const stat = getDailyVehicleStats(dStr);
    if (
      !stat ||
      typeof stat.workHours !== 'number' ||
      !Number.isFinite(stat.workHours) ||
      stat.workHours < 0 ||
      typeof stat.idleHours !== 'number' ||
      !Number.isFinite(stat.idleHours) ||
      stat.idleHours < 0
    ) {
      hasUnknownWorkOrIdle = true;
    } else {
      totalWork += stat.workHours;
      totalIdle += stat.idleHours;
    }
    daysCount++;
    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  const workHours = hasUnknownWorkOrIdle ? null : Number(totalWork.toFixed(1));
  const idleHours = hasUnknownWorkOrIdle ? null : Number(totalIdle.toFixed(1));
  const totalOperating = (workHours !== null && idleHours !== null)
    ? parseFloat((workHours + idleHours).toFixed(1))
    : null;
  const shutdownHours = (totalOperating !== null)
    ? parseFloat((daysCount * 24.0 - totalOperating).toFixed(1))
    : null;

  let workPercentage = null;
  let idlePercentage = null;
  if (workHours !== null && idleHours !== null) {
    const total = workHours + idleHours;
    if (total > 0) {
      if (workHours === 0) {
        workPercentage = 0;
        idlePercentage = 100;
      } else {
        workPercentage = Math.round((workHours / total) * 100);
        idlePercentage = 100 - workPercentage;
      }
    }
  }

  let loadedSpeed;
  let emptySpeed;
  let avgCycleTime;
  let avgPayload;

  if (isSingleDay) {
    if (normStart === '2023-11-23') {
      loadedSpeed = 22.6;
      emptySpeed = 30.6;
      avgCycleTime = 46;
      avgPayload = 74.6;
    } else {
      const seed = hashDateString(normStart);
      loadedSpeed = parseFloat((20.0 + (seed % 50) * 0.1).toFixed(1));
      emptySpeed = parseFloat((28.0 + (seed % 50) * 0.1).toFixed(1));
      avgCycleTime = 42 + (seed % 15);
      avgPayload = parseFloat((72.0 + (seed % 30) * 0.1).toFixed(1));
    }
  } else {
    const seed = hashDateString(normStart + normEnd);
    loadedSpeed = parseFloat((21.5 + (seed % 30) * 0.1).toFixed(1));
    emptySpeed = parseFloat((29.5 + (seed % 30) * 0.1).toFixed(1));
    avgCycleTime = 45 + (seed % 10);
    avgPayload = parseFloat((73.5 + (seed % 20) * 0.1).toFixed(1));
  }

  return {
    isValid: true,
    error: '',
    dateText: isSingleDay ? normStart : `${normStart} --- ${normEnd}`,
    daysCount,
    workHours,
    idleHours,
    shutdownHours,
    totalOperating: totalOperating !== null ? totalOperating.toFixed(1) : null,
    workPercentage,
    idlePercentage,
    loadedAvgSpeed: loadedSpeed,
    emptyAvgSpeed: emptySpeed,
    avgCycleTime,
    avgPayload,
  };
}

/**
 * 解析并格式化轨迹时间戳辅助函数
 */
function parseTrackDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const normDate = normalizeDateStr(dateStr);
  if (!normDate) return null;
  const trimmedTime = timeStr.trim();
  if (trimmedTime === '24:00' || trimmedTime === '24:00:00') {
    const d = new Date(`${normDate}T00:00:00`);
    if (isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + 1);
    return d;
  }
  const timeFormatted = trimmedTime.length === 5 ? `${trimmedTime}:00` : trimmedTime;
  const d = new Date(`${normDate}T${timeFormatted}`);
  if (isNaN(d.getTime())) return null;
  return d;
}

// 跨端对齐别名
export const getElectricDayStats = getDailyVehicleStats;

/**
 * 轨迹回放动态数据引擎 (FIX-003 / F2-02 / V5-REVIEW-001)
 * 1. 严格校验起止时间：结束时间 <= 开始时间返回就地错误，不生造里程/电耗
 * 2. 跨度限制：单次查询跨度不得超过31天
 * 3. 统计共源：按每日重叠比例自洽汇总里程/电耗，整天基准日严格对齐 48.6km / 210kWh / 24.5kWh
 */
export function getTrackDataByRange(startDate, startTime, endDate, endTime) {
  const normStart = normalizeDateStr(startDate);
  const normEnd = normalizeDateStr(endDate);
  if (!normStart || !normEnd || !startTime || !endTime) {
    return {
      isValid: false,
      error: '起止日期和时间均不能为空',
      startDate: normStart || '',
      startTime: startTime || '',
      endDate: normEnd || '',
      endTime: endTime || '',
      startDateTimeStr: `${normStart || ''} ${startTime || ''}`.trim(),
      endDateTimeStr: `${normEnd || ''} ${endTime || ''}`.trim(),
      startDateTime: '',
      endDateTime: '',
      durationHours: 0,
      durationMinutes: 0,
      totalMileage: '0.0',
      totalEnergy: '0.0',
      recoveryEnergy: '0.0',
      avgSpeed: '0.0',
      segments: [],
      waypoints: [],
    };
  }

  const startDT = parseTrackDateTime(normStart, startTime);
  const endDT = parseTrackDateTime(normEnd, endTime);
  if (!startDT || !endDT) {
    return {
      isValid: false,
      error: '日期或时间格式无效',
      startDate: normStart,
      startTime,
      endDate: normEnd,
      endTime,
      startDateTimeStr: `${normStart} ${startTime}`,
      endDateTimeStr: `${normEnd} ${endTime}`,
      startDateTime: '',
      endDateTime: '',
      durationHours: 0,
      durationMinutes: 0,
      totalMileage: '0.0',
      totalEnergy: '0.0',
      recoveryEnergy: '0.0',
      avgSpeed: '0.0',
      segments: [],
      waypoints: [],
    };
  }

  if (endDT.getTime() <= startDT.getTime()) {
    return {
      isValid: false,
      error: '结束时间必须晚于开始时间',
      startDate: normStart,
      startTime,
      endDate: normEnd,
      endTime,
      startDateTimeStr: `${normStart} ${startTime}`,
      endDateTimeStr: `${normEnd} ${endTime}`,
      startDateTime: startDT.toISOString(),
      endDateTime: endDT.toISOString(),
      durationHours: 0,
      durationMinutes: 0,
      totalMileage: '0.0',
      totalEnergy: '0.0',
      recoveryEnergy: '0.0',
      avgSpeed: '0.0',
      segments: [],
      waypoints: [],
    };
  }

  const diffMs = endDT.getTime() - startDT.getTime();
  const diffDays = diffMs / (24 * 3600 * 1000);
  if (diffDays > 31) {
    return {
      isValid: false,
      error: '查询跨度不能超过31天',
      startDate: normStart,
      startTime,
      endDate: normEnd,
      endTime,
      startDateTimeStr: `${normStart} ${startTime}`,
      endDateTimeStr: `${normEnd} ${endTime}`,
      startDateTime: startDT.toISOString(),
      endDateTime: endDT.toISOString(),
      durationHours: 0,
      durationMinutes: 0,
      totalMileage: '0.0',
      totalEnergy: '0.0',
      recoveryEnergy: '0.0',
      avgSpeed: '0.0',
      segments: [],
      waypoints: [],
    };
  }

  const durationHours = diffMs / (1000 * 60 * 60);
  const formattedDurationHours = durationHours < 1 ? Number(durationHours.toFixed(2)) : Number(durationHours.toFixed(1));

  let cur = new Date(startDT.getFullYear(), startDT.getMonth(), startDT.getDate());
  const finalDay = new Date(endDT.getFullYear(), endDT.getMonth(), endDT.getDate());

  let totalMileageAcc = 0;
  let totalEnergyAcc = 0;
  let totalRecoveryAcc = 0;

  while (cur.getTime() <= finalDay.getTime()) {
    const curDateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    const dayStart = new Date(`${curDateStr}T00:00:00`).getTime();
    const nextDay = new Date(cur);
    nextDay.setDate(nextDay.getDate() + 1);
    const dayEnd = nextDay.getTime();

    const overlapStart = Math.max(startDT.getTime(), dayStart);
    const overlapEnd = Math.min(endDT.getTime(), dayEnd);

    if (overlapEnd > overlapStart) {
      let overlapMs = overlapEnd - overlapStart;
      if (Math.abs(overlapMs - 86400000) <= 60000) {
        overlapMs = 86400000;
      }
      const ratio = overlapMs / (24 * 3600 * 1000);
      const dayStat = getDailyVehicleStats(curDateStr);
      if (dayStat) {
        totalMileageAcc += (dayStat.mileage || 0) * ratio;
        totalEnergyAcc += (dayStat.energy || 0) * ratio;
        totalRecoveryAcc += (dayStat.recoveryEnergy || 0) * ratio;
      }
    }
    cur.setDate(cur.getDate() + 1);
  }

  const totalMileage = Number(totalMileageAcc.toFixed(1));
  const totalEnergy = Number(totalEnergyAcc.toFixed(1));
  const recoveryEnergy = Number(totalRecoveryAcc.toFixed(1));
  const avgSpeed = durationHours > 0 ? Number((totalMileage / durationHours).toFixed(1)) : 0;

  // 动态切分 4 个分段，其时长精确累计为 durationHours
  const p1Time = Number((durationHours * 0.3).toFixed(2));
  const p2Time = Number((durationHours * 0.2).toFixed(2));
  const p3Time = Number((durationHours * 0.35).toFixed(2));
  const p4Time = Number(Math.max(0, durationHours - p1Time - p2Time - p3Time).toFixed(2));

  // 动态切分 4 个分段电耗，其和精确累计为 totalEnergy
  const seg1Kwh = Number((totalEnergy * 0.35).toFixed(1));
  const seg2Kwh = Number((totalEnergy * 0.05).toFixed(1));
  const seg3Kwh = Number((totalEnergy * 0.42).toFixed(1));
  const seg4Kwh = Number(Math.max(0, totalEnergy - seg1Kwh - seg2Kwh - seg3Kwh).toFixed(1));

  // 分段里程
  const seg1Km = Number((totalMileage * 0.4).toFixed(1));
  const seg2Km = 0.0;
  const seg3Km = Number((totalMileage * 0.45).toFixed(1));
  const seg4Km = Number(Math.max(0, totalMileage - seg1Km - seg3Km).toFixed(1));

  const segments = [
    {
      id: 1,
      type: 'drive',
      title: '重载爬坡运输',
      duration: `${p1Time} h`,
      mileage: `${seg1Km.toFixed(1)} km`,
      energy: `${seg1Kwh.toFixed(1)} kWh`,
      avgSpeed: '21.0 km/h',
      status: '重载行驶',
      note: '重载上行，电耗平稳',
    },
    {
      id: 2,
      type: 'idle',
      title: '排土场等待/怠速',
      duration: `${p2Time} h`,
      mileage: `${seg2Km.toFixed(1)} km`,
      energy: `${seg2Kwh.toFixed(1)} kWh`,
      avgSpeed: '0.0 km/h',
      status: '怠速等待',
      note: '等待前车卸载完毕',
    },
    {
      id: 3,
      type: 'drive',
      title: '重载下行至破碎区',
      duration: `${p3Time} h`,
      mileage: `${seg3Km.toFixed(1)} km`,
      energy: `${seg3Kwh.toFixed(1)} kWh`,
      avgSpeed: '26.5 km/h',
      status: '重载行驶',
      note: `下坡制动能量回收 +${(recoveryEnergy * 0.6).toFixed(1)} kWh`,
    },
    {
      id: 4,
      type: 'drive',
      title: '空载返程',
      duration: `${p4Time} h`,
      mileage: `${seg4Km.toFixed(1)} km`,
      energy: `${seg4Kwh.toFixed(1)} kWh`,
      avgSpeed: '29.8 km/h',
      status: '空载行驶',
      note: '空载平路匀速，电耗极优',
    },
  ];

  // 轨迹点坐标
  const waypoints = [
    { x: 45, y: 155, percent: 0, speed: 0, energy: 0, label: '起点(采场)' },
    { x: 90, y: 135, percent: 0.25, speed: 22, energy: (totalEnergy * 0.25).toFixed(1), label: '爬坡段' },
    { x: 165, y: 95, percent: 0.5, speed: 28, energy: (totalEnergy * 0.5).toFixed(1), label: '主运通道' },
    { x: 250, y: 60, percent: 0.75, speed: 31, energy: (totalEnergy * 0.75).toFixed(1), label: '下行缓坡' },
    { x: 345, y: 40, percent: 1, speed: 0, energy: totalEnergy.toFixed(1), label: '终点(破碎站)' },
  ];

  return {
    isValid: true,
    error: '',
    startDateTimeStr: `${normStart} ${startTime}`,
    endDateTimeStr: `${normEnd} ${endTime}`,
    startDateTime: startDT.toISOString(),
    endDateTime: endDT.toISOString(),
    startDate: normStart,
    startTime,
    endDate: normEnd,
    endTime,
    durationHours: formattedDurationHours,
    durationMinutes: Math.round(diffMs / 60000),
    totalMileage: totalMileage.toFixed(1),
    totalEnergy: totalEnergy.toFixed(1),
    recoveryEnergy: recoveryEnergy.toFixed(1),
    avgSpeed: avgSpeed.toFixed(1),
    segments,
    waypoints,
  };
}

// 电耗客观分析数据 (FIX-005: 移除未经授权的评分与节费数值)
export const ELECTRIC_ENERGY_METRICS = {
  drivingEnergy: '161.9',
  idleEnergy: '24.5',
  chargingEnergy: '210.0',
  recoveryEnergy: '24.5',
  avgEnergyPer100Km: '383.5',
};

// 驾驶行为客观统计 (FIX-005: 移除未经授权的 96 分与安全等级结论)
export const ELECTRIC_BEHAVIOR_METRICS = {
  rapidAccelerationCount: 2,
  rapidDecelerationCount: 1,
  overspeedCount: 0,
  neutralCoastCount: 0,
  sharpTurnCount: 1,
  smoothOperationHours: '5.1',
};

export function getDailyVehicleStats(dateInput) { return completeDay(basegetDailyVehicleStats(dateInput), true); }

export function getReportDataByDate(date, tab) {
  return basegetReportDataByDate(date, tab);
}

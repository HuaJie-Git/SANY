/**
 * PC 宽体车专属数据模型、契约与纯函数
 * 覆盖：
 * 1. 电动宽体车 (POPJ0841016452 / SKT105E)
 * 2. 燃油宽体车 (KT090AE20208 / KT090AE)
 * 3. 确定性报表数据生成与聚合（日、周、月，零 Math.random）
 * 4. 机器利用率计算与异常边界处理（空串/非有限/分母<=0 => null）
 * 5. 真实月日历（28/29/30/31及闰年）与本地 CSV 导出
 */

const ASSET_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/pc/';

/* ──────────────── 机器利用率通用公式 ──────────────── */
/**
 * 机器利用率 = (runningHours / workHours) * 100
 * 规则：
 * - 允许超过 100%，不封顶
 * - 当 workHours <= 0、缺失、null、空串、纯空白或非法时返回 null (UI 渲染为 —)
 * - 当 runningHours < 0、空串、纯空白或非法时返回 null
 * - 当 runningHours === 0 且 workHours > 0 时返回 0.0
 */
export function getMachineUtilization(runningHours, workHours) {
  if (
    runningHours === null ||
    runningHours === undefined ||
    workHours === null ||
    workHours === undefined
  ) {
    return null;
  }
  // 空串或纯空白字符必须返回 null，不当成 0
  if (typeof runningHours === 'string' && runningHours.trim() === '') return null;
  if (typeof workHours === 'string' && workHours.trim() === '') return null;

  const r = Number(runningHours);
  const w = Number(workHours);
  if (!Number.isFinite(r) || !Number.isFinite(w) || w <= 0 || r < 0) {
    return null;
  }
  if (r === 0) return 0.0;
  return parseFloat(((r / w) * 100).toFixed(1));
}

/* ──────────────── 日期工具函数 ──────────────── */
export function hashDateString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 严格日期格式校验：仅允许真实 YYYY-MM-DD 或 YYYY/MM/DD
 * 拒绝科学计数法、小数年、非存在日期等
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
 * 解析日期为 Date 对象，无效日期返回 null（不静默变今天）
 */
export function parseDate(dateOrString) {
  const norm = normalizeDateStr(dateOrString);
  if (!norm) return null;
  const [y, m, d] = norm.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateSlash(dateOrString) {
  const norm = normalizeDateStr(dateOrString);
  if (!norm) return '—';
  return norm.replaceAll('-', '/');
}

/**
 * 获取周期内的所有真实日期字符串列表 (YYYY-MM-DD)
 * - daily: 1 个日期
 * - weekly: 包含所选日期的周一至周日 (7 个真实日期)
 * - monthly: 包含所选日期的自然月全天 (28/29/30/31 天真实月份)
 */
export function getPeriodDates(period, baseDateInput) {
  const d = parseDate(baseDateInput);
  if (!d) return [];
  if (period === 'daily') {
    return [normalizeDateStr(d)];
  }
  if (period === 'weekly') {
    const dayOfWeek = d.getDay(); // 0 is Sun, 1 is Mon
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

/* ──────────────── 安全聚合纯函数（保留未知 null，任一缺失/非有限即返回 null，全部已知 0 返回 0） ──────────────── */
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

export function safeAvg(sum, count, decimals = 2) {
  if (sum === null || count === null || sum === undefined || count === undefined) return null;
  if (typeof sum === 'string' && sum.trim() === '') return null;
  if (typeof count === 'string' && count.trim() === '') return null;
  const s = Number(sum);
  const c = Number(count);
  if (!Number.isFinite(s) || !Number.isFinite(c) || c <= 0) return null;
  return parseFloat((s / c).toFixed(decimals));
}

/* ──────────────── 资产定义（最小安全 schema，无虚构档案） ──────────────── */
export const ELECTRIC_WIDEBODY_DEVICE = {
  id: 8,
  code: 'POPJ0841016452',
  model: 'SKT105E',
  brand: 'SANY',
  type: '电动宽体车',
  status: '工作',
  updateTime: '2023-11-23 15:30',
  image: `${ASSET_BASE}images/asset-models/sany-skt105e-electric.png`,
  name: '电动宽体车',
  location: '内蒙古准格尔旗黑岱沟露天煤矿',
  realtime: {
    设备状态: '工作',
    剩余电量: '78%',
    电池健康: '96%',
    车速: '24km/h',
    油门深度: '42%',
    制动深度: '0%',
    运载趟数: '6趟',
    运输重量: '72.5t',
  },
  today: {
    workHours: 4.5,
    idleHours: 0.8,
    runningHours: 5.3,
    mileage: 48.6,
    maxSpeed: 42,
    runningPower: 161.9,
    idlePower: 24.5,
    energy: 186.4,
    recoveredEnergy: 24.5,
    chargeHours: 1.2,
  },
  cumulative: {
    totalRunningHours: '1240.5h',
    totalTrips: '318趟',
    totalWeight: '22860t',
    totalMileage: '28450km',
    totalEnergy: '108920kWh',
    totalChargeEnergy: '121500kWh',
  },
  warnings: [],
  plate: '蒙K·89201电',
  archive: {
    updateTime: '2023-11-23 15:30:00',
    台账信息: [
      { label: '设备编号', value: 'POPJ0841016452' },
      { label: '设备类型', value: '电动宽体车' },
      { label: '车牌号', value: '蒙K·89201电' },
    ],
  },
  maintenanceRecords: [],
  alarmRecords: [],
  project: {
    name: '黑岱沟露天煤矿项目',
    address: '内蒙古准格尔旗黑岱沟露天煤矿',
  },
  weeklyFuelTrend: [],
  weeklyAmountTrend: [],
  monthlyFuelTrend: [],
  monthlyAmountTrend: [],
};

export const FUEL_WIDEBODY_DEVICE = {
  id: 9,
  code: 'KT090AE20208',
  model: 'KT090AE',
  brand: 'SANY',
  type: '燃油宽体车',
  status: '工作',
  updateTime: '2023-11-23 15:30',
  image: `${ASSET_BASE}images/asset-models/sany-widebody-fuel.jpg`,
  name: '燃油宽体车',
  location: '中国',
  realtime: {
    设备状态: '工作',
    车速: '6km/h',
    运输重量: '—t',
    运载趟数: '0趟',
    油位: '74%',
    油门深度: '0%',
    齿轮模式: '2档',
  },
  today: {
    mileage: 2.4,
    fuel: 7,
    workHours: 0.14,
    idleHours: 0.16,
    runningHours: 0.3,
    maxSpeed: 43,
    runningFuel: 6.2,
    idleFuel: 0.8,
  },
  cumulative: {
    totalWorkHours: '2484.25h',
    totalTrips: '0趟',
    totalWeight: '0t',
    totalMileage: '165066.96km',
    totalFuel: '61200.5L',
  },
  warnings: [],
  archive: {
    updateTime: '2023-11-23 15:30:00',
    台账信息: [
      { label: '设备编号', value: 'KT090AE20208' },
      { label: '设备类型', value: '燃油宽体车' },
    ],
  },
  maintenanceRecords: [],
  alarmRecords: [],
  project: {
    name: '—',
    address: '—',
  },
  weeklyFuelTrend: [],
  weeklyAmountTrend: [],
  monthlyFuelTrend: [],
  monthlyAmountTrend: [],
};

export function isWidebodyDevice(device) {
  return (
    ['电动宽体车', '燃油宽体车'].includes(device?.type) ||
    device?.code?.startsWith('POPJ') ||
    device?.code?.startsWith('KT090AE')
  );
}

export function isElectricWidebody(device) {
  return device?.type === '电动宽体车' || device?.code?.startsWith('POPJ');
}

export function isFuelWidebody(device) {
  return device?.type === '燃油宽体车' || device?.code?.startsWith('KT090AE');
}

/* ──────────────── 单日与周期数据生成（确定性伪数据，无 Math.random） ──────────────── */

/**
 * 电动宽体车单日统计
 * 2023-11-23 基准日严格对齐 APP 与需求：
 * 里程 48.6km, 电耗 186.4kWh, 运载趟数 6趟, 平均电耗 3.84kWh/km, 充电时长 1.2h, 回收电量 24.5kWh
 */
export function getElectricDayStats(dateInput) {
  const dateStr = normalizeDateStr(dateInput);
  if (!dateStr) return null;

  if (dateStr === '2023-11-23') {
    return {
      date: dateStr,
      mileage: 48.6,
      energy: 186.4,
      trips: 6,
      avgEnergy: 3.84,
      chargeDuration: 1.2,
      recoveryEnergy: 24.5,
      workHours: 4.5,
      idleHours: 0.8,
      runningHours: 5.3,
      runningPower: 161.9,
      idlePower: 24.5,
      utilizationRate: 117.8,
      endOfDaySoc: 62.0,
    };
  }

  const seed = hashDateString(dateStr);
  const mileage = parseFloat((36 + (seed % 20) + (seed % 10) * 0.1).toFixed(1));
  const energy = parseFloat((140 + (seed % 60) + (seed % 7) * 0.1).toFixed(1));
  const trips = 4 + (seed % 5);
  const avgEnergy = mileage > 0 ? parseFloat((energy / mileage).toFixed(2)) : null;
  const chargeDuration = parseFloat((0.8 + (seed % 8) * 0.1).toFixed(1));
  const recoveryEnergy = parseFloat((16 + (seed % 12) + (seed % 5) * 0.1).toFixed(1));
  const workHours = parseFloat((3.8 + (seed % 4) * 0.4).toFixed(1));
  const idleHours = parseFloat((0.6 + (seed % 3) * 0.2).toFixed(1));
  const runningHours = parseFloat((workHours + idleHours).toFixed(1));
  const utilizationRate = getMachineUtilization(runningHours, workHours);
  const runningPower = parseFloat((120 + (seed % 50)).toFixed(1));
  const idlePower = parseFloat((18 + (seed % 10)).toFixed(1));
  const endOfDaySoc = 45 + (seed % 40);

  return {
    date: dateStr,
    mileage,
    energy,
    trips,
    avgEnergy,
    chargeDuration,
    recoveryEnergy,
    workHours,
    idleHours,
    runningHours,
    runningPower,
    idlePower,
    utilizationRate,
    endOfDaySoc,
  };
}

/**
 * 燃油宽体车单日统计
 * 2023-11-23 基准日严格对齐 APP 与需求：
 * 能耗 7L, 平均每小时能耗 50.0L/h, 工时 0.14h, 怠速工时 0.16h
 * PC-REVIEW-001 D: 运行/怠速油耗为独立口径，禁止按总能耗拆分
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
  // 独立确定性示例值，禁止按总能耗比例拆分
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
 * 周期聚合（电动宽体车）
 * 安全保留 null，不把缺失当 0 吞掉
 */
export function getPeriodicElectricData(period, baseDateInput) {
  const dates = getPeriodDates(period, baseDateInput);
  const rows = dates.map((dateStr) => getElectricDayStats(dateStr)).filter(Boolean);

  const totalMileage = safeSum(rows.map((r) => r.mileage), 1);
  const totalEnergy = safeSum(rows.map((r) => r.energy), 1);
  const totalTrips = safeSum(rows.map((r) => r.trips), 0);
  const totalChargeDuration = safeSum(rows.map((r) => r.chargeDuration), 1);
  const totalRecoveryEnergy = safeSum(rows.map((r) => r.recoveryEnergy), 1);
  const totalWorkHours = safeSum(rows.map((r) => r.workHours), 1);
  const totalIdleHours = safeSum(rows.map((r) => r.idleHours), 1);
  const totalRunningHours = safeSum(rows.map((r) => r.runningHours), 1);

  const avgEnergy = safeAvg(totalEnergy, totalMileage, 2);
  const utilizationRate = getMachineUtilization(totalRunningHours, totalWorkHours);

  return {
    period,
    dates,
    rows,
    summary: {
      mileage: totalMileage,
      energy: totalEnergy,
      trips: totalTrips,
      avgEnergy,
      chargeDuration: totalChargeDuration,
      recoveryEnergy: totalRecoveryEnergy,
      workHours: totalWorkHours,
      idleHours: totalIdleHours,
      runningHours: totalRunningHours,
      utilizationRate,
    },
  };
}

/**
 * 周期聚合（燃油宽体车）
 * 安全保留 null，不把缺失当 0 吞掉
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

/* ──────────────── 曲线与图表数据源 ──────────────── */

/**
 * 电量 SOC % 曲线 (00:00 ~ 24:00)
 */
export function getDailySocCurve(dateInput) {
  const dateStr = normalizeDateStr(dateInput);
  if (!dateStr) return null;

  if (dateStr === '2023-11-23') {
    return {
      dateStr,
      endOfDaySoc: 62.0,
      points: [
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
      ],
    };
  }

  const seed = hashDateString(dateStr);
  const dayStat = getElectricDayStats(dateStr);
  if (!dayStat) return null;

  const startSoc = 85 + (seed % 12);
  const endSoc = dayStat.endOfDaySoc;
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
 * 燃油宽体车单日油位曲线 (00:00 ~ 24:00, 单位 %)
 */
export function getDailyFuelCurve(dateInput) {
  const dateStr = normalizeDateStr(dateInput);
  if (!dateStr) return null;

  const dayStat = getFuelDayStats(dateStr);
  if (!dayStat) return null;
  const currentLevel = dayStat.fuelLevel;

  if (dateStr === '2023-11-23') {
    return {
      dateStr,
      currentLevel: 74,
      points: [
        { time: '00:00', level: 90 },
        { time: '04:00', level: 87 },
        { time: '08:00', level: 83 },
        { time: '12:00', level: 78 },
        { time: '16:00', level: 74 },
        { time: '20:00', level: 73 },
        { time: '24:00', level: 72 },
      ],
    };
  }

  const seed = hashDateString(dateStr);
  const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
  const startLevel = Math.min(100, currentLevel + 14 + (seed % 8));
  const points = hours.map((time, idx) => {
    const t = idx / (hours.length - 1);
    const lvl = Math.max(10, Math.min(100, Math.round(startLevel - t * (startLevel - currentLevel + 4))));
    return { time, level: lvl };
  });

  return {
    dateStr,
    currentLevel,
    points,
  };
}

/**
 * 档位分布实心饼图数据 (1/2/3/4/R档，25/30/20/15/10%)
 */
export function getDailyGearDistribution(_dateInput) {
  return {
    totalHours: 7.5,
    gears: [
      { name: '1档', percent: 25 },
      { name: '2档', percent: 30 },
      { name: '3档', percent: 20 },
      { name: '4档', percent: 15 },
      { name: 'R档', percent: 10 },
    ],
  };
}

/**
 * 当日开工分布（随本日实际 stats 派生，累计时长对应本日工时与怠速）
 */
export function getDailyWorkDistribution(deviceType, dateInput) {
  const isElectric = deviceType === '电动宽体车';
  const dayStat = isElectric ? getElectricDayStats(dateInput) : getFuelDayStats(dateInput);
  if (!dayStat) return [];

  const work = Number(dayStat.workHours || 0);
  const idle = Number(dayStat.idleHours || 0);
  if (work <= 0 && idle <= 0) return [];

  const startHour = isElectric ? 8.0 : 9.0;
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

/* ──────────────── CSV 导出纯函数 ──────────────── */
export function generateCsvContent(columns, rows) {
  if (!rows || rows.length === 0) return '';
  const header = columns.map((col) => `"${String(col.label).replaceAll('"', '""')}"`).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const val = row[col.key] ?? '—';
          return `"${String(val).replaceAll('"', '""')}"`;
        })
        .join(',')
    )
    .join('\r\n');
  return `\uFEFF${header}\r\n${body}`;
}

export function downloadCsv(filename, columns, rows) {
  const content = generateCsvContent(columns, rows);
  if (!content) return false;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
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

/**
 * 宽体车电车轨迹数据生成引擎 (对齐 APP 契约 / V5-R02 / A02 / V5-REVIEW-001)
 * 1. 严格校验起止时间：结束时间 <= 开始时间返回就地错误，不生造里程/电耗
 * 2. 跨度限制：单次查询跨度不得超过31天
 * 3. 统计共源：按每日重叠比例自洽汇总里程/电耗，整天基准日严格对齐 48.6km / 186.4kWh / 24.5kWh
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
      const dayStat = getElectricDayStats(curDateStr);
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

  const p1Time = Number((durationHours * 0.3).toFixed(2));
  const p2Time = Number((durationHours * 0.2).toFixed(2));
  const p3Time = Number((durationHours * 0.35).toFixed(2));
  const p4Time = Number(Math.max(0, durationHours - p1Time - p2Time - p3Time).toFixed(2));

  const seg1Kwh = Number((totalEnergy * 0.35).toFixed(1));
  const seg2Kwh = Number((totalEnergy * 0.05).toFixed(1));
  const seg3Kwh = Number((totalEnergy * 0.42).toFixed(1));
  const seg4Kwh = Number(Math.max(0, totalEnergy - seg1Kwh - seg2Kwh - seg3Kwh).toFixed(1));

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

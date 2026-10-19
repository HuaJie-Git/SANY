import {
  getElectricDayStats,
  normalizeDateStr,
  hashDateString,
  downloadCsv,
  generateCsvContent,
} from './widebody.js';

/**
 * 辅助函数：根据开始时间与秒数生成结束时间 YYYY-MM-DD HH:mm:ss
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
 * 辅助函数：解析 YYYY-MM-DD HH:mm:ss 为本地毫秒时间戳
 */
function parseDateTimeToMs(dtStr) {
  if (!dtStr) return null;
  const [dPart, tPart] = dtStr.split(' ');
  const [y, m, d] = dPart.split('-').map(Number);
  const [hh, mm, ss] = (tPart || '00:00:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, ss).getTime();
}

/**
 * PC-V3-STATE / REVIEW: 日期区间校验纯函数
 * 范围 [1970..2099]，结束 >= 开始，最多 366 天（含起止边界）
 */
export function validateDateRange(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) {
    return {
      isValid: false,
      error: '请选择有效的开始和结束日期',
      normStart: null,
      normEnd: null,
      diffDays: 0,
    };
  }

  const sClean = String(startDateStr).trim();
  const eClean = String(endDateStr).trim();
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
  };
}

/**
 * PC-V3-REVIEW-001: 纯函数计算工作时长与怠速时长百分比
 * 零分母（如 total <= 0，如 0/0）：禁止 0/100，返回 null (—)
 * 0 工作正分母：返回 0% 工作，100% 怠速
 * 非法/未知数值：返回 null (—)
 * @param {number|null|undefined} workHours
 * @param {number|null|undefined} idleHours
 * @returns {{ workPercentage: number|null, idlePercentage: number|null }}
 */
export function calculateWorkPercentages(workHours, idleHours) {
  if (
    workHours === null ||
    workHours === undefined ||
    idleHours === null ||
    idleHours === undefined ||
    typeof workHours !== 'number' ||
    typeof idleHours !== 'number' ||
    !Number.isFinite(workHours) ||
    !Number.isFinite(idleHours) ||
    workHours < 0 ||
    idleHours < 0
  ) {
    return { workPercentage: null, idlePercentage: null };
  }

  const total = workHours + idleHours;
  if (!Number.isFinite(total) || total <= 0) {
    return { workPercentage: null, idlePercentage: null };
  }

  if (workHours === 0 && idleHours > 0) {
    return { workPercentage: 0, idlePercentage: 100 };
  }

  const workPct = Math.round((workHours / total) * 100);
  const idlePct = 100 - workPct;
  return { workPercentage: workPct, idlePercentage: idlePct };
}

/**
 * PC-V3-R02 运营报表数据生成器
 * 6项运营指标：工作时长百分率%、怠速时长百分率%、重载平均车速km/h、空载平均车速km/h、平均循环时长h、平均单趟有效载荷t
 * 统一用实际PC日记录聚合，任一天工时/怠速未知或非法则相关占比—；
 * 零分母显示 null (—)，0 工作正分母显示 0。单日6个基准值严格保持。
 */
export function getOperationsData(startDateStr, endDateStr) {
  const validation = validateDateRange(startDateStr, endDateStr);
  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.error,
      startDate: startDateStr,
      endDate: endDateStr,
      workHours: null,
      idleHours: null,
      workPercentage: null,
      idlePercentage: null,
      loadedAvgSpeed: null,
      emptyAvgSpeed: null,
      avgCycleTimeMinutes: null,
      avgCycleTimeHours: null,
      avgPayload: null,
    };
  }

  const { normStart, normEnd, diffDays } = validation;
  const isSingleDay = normStart === normEnd;

  // 统计所选周期内各日工时与怠速求和（不使用 || 0 吞未知）
  let totalWork = 0;
  let totalIdle = 0;
  let hasUnknownWorkOrIdle = false;

  const [y1, m1, d1] = normStart.split('-').map(Number);
  const [y2, m2, d2] = normEnd.split('-').map(Number);
  const curr = new Date(Date.UTC(y1, m1 - 1, d1));
  const endUtc = new Date(Date.UTC(y2, m2 - 1, d2));

  while (curr <= endUtc) {
    const dStr = curr.toISOString().slice(0, 10);
    const stat = getElectricDayStats(dStr);
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
    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  let workHours = null;
  let idleHours = null;
  let workPercentage = null;
  let idlePercentage = null;

  if (!hasUnknownWorkOrIdle) {
    workHours = Number(totalWork.toFixed(1));
    idleHours = Number(totalIdle.toFixed(1));
    const percentages = calculateWorkPercentages(workHours, idleHours);
    workPercentage = percentages.workPercentage;
    idlePercentage = percentages.idlePercentage;
  }

  // 车速、循环时长、载荷根据确定性种子生成（基准日保持 22.6 / 30.6 / 46min(0.77h) / 74.6t）
  let loadedAvgSpeed;
  let emptyAvgSpeed;
  let avgCycleTimeMinutes;
  let avgPayload;

  if (isSingleDay) {
    if (normStart === '2023-11-23') {
      loadedAvgSpeed = 22.6;
      emptyAvgSpeed = 30.6;
      avgCycleTimeMinutes = 46;
      avgPayload = 74.6;
    } else {
      const seed = hashDateString(normStart);
      loadedAvgSpeed = parseFloat((20.0 + (seed % 50) * 0.1).toFixed(1));
      emptyAvgSpeed = parseFloat((28.0 + (seed % 50) * 0.1).toFixed(1));
      avgCycleTimeMinutes = 42 + (seed % 15);
      avgPayload = parseFloat((72.0 + (seed % 30) * 0.1).toFixed(1));
    }
  } else {
    const seed = hashDateString(normStart + normEnd);
    loadedAvgSpeed = parseFloat((21.5 + (seed % 30) * 0.1).toFixed(1));
    emptyAvgSpeed = parseFloat((29.5 + (seed % 30) * 0.1).toFixed(1));
    avgCycleTimeMinutes = 45 + (seed % 10);
    avgPayload = parseFloat((73.5 + (seed % 20) * 0.1).toFixed(1));
  }

  const avgCycleTimeHours = Number((avgCycleTimeMinutes / 60).toFixed(2));

  return {
    isValid: true,
    error: '',
    startDate: normStart,
    endDate: normEnd,
    isSingleDay,
    diffDays,
    workHours,
    idleHours,
    workPercentage,
    idlePercentage,
    loadedAvgSpeed,
    emptyAvgSpeed,
    avgCycleTimeMinutes,
    avgCycleTimeHours,
    avgPayload,
  };
}

/**
 * PC-V3-R03 充电报表数据生成器
 * 基准 2023-11-23：2 条，1.2h / 210kWh
 * 支持 URL widebodyChargeState 异常模拟驱动（empty | partial | charging | crossday）
 * 跨天相交计算与去重，部分覆盖能量设为 null (—)
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

  const { normStart, normEnd } = validation;
  const [y1, m1, d1] = normStart.split('-').map(Number);
  const [y2, m2, d2] = normEnd.split('-').map(Number);
  const queryStartMs = new Date(y1, m1 - 1, d1, 0, 0, 0, 0).getTime();
  const queryEndMs = new Date(y2, m2 - 1, d2 + 1, 0, 0, 0, 0).getTime();

  const candidateRecords = [];
  const curr = new Date(y1, m1 - 1, d1);
  const endLocal = new Date(y2, m2 - 1, d2);

  while (curr <= endLocal) {
    const dStr = normalizeDateStr(curr);

    if (dStr === '2023-11-23') {
      candidateRecords.push({
        id: `CHG-${dStr.replaceAll('-', '')}-02`,
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
        id: `CHG-${dStr.replaceAll('-', '')}-01`,
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
      const dailyStat = getElectricDayStats(dStr);
      const dayDuration = dailyStat?.chargeDuration || 0;
      const dayEnergy = Number((dayDuration * 175).toFixed(1));
      const seed = hashDateString(dStr);

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
            id: `CHG-${dStr.replaceAll('-', '')}-02`,
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
            id: `CHG-${dStr.replaceAll('-', '')}-01`,
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
            id: `CHG-${dStr.replaceAll('-', '')}-01`,
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

  // 跨天示例：2023-11-22 23:30 ~ 2023-11-23 00:30 (1h / 180kWh)
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

  // 场景注入处理
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

  // 计算每条记录与区间的相交时长 (overlapHours) 及有效电量 (effectiveEnergy)
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
      // 部分覆盖无独立能量采样时电量为 null (显示 —)，完整覆盖计入 energy
      r.effectiveEnergy = isFullyCovered ? r.energy : null;
    }
  }

  // 区间汇总统计
  let totalEnergy = 0;
  let hasMissingEnergy = false;
  let totalDuration = 0;
  let hasMissingDuration = false;

  for (const r of records) {
    if (r.effectiveEnergy === null || r.effectiveEnergy === undefined || Number.isNaN(r.effectiveEnergy)) {
      hasMissingEnergy = true;
    } else {
      totalEnergy += r.effectiveEnergy;
    }

    if (r.overlapHours === null || r.overlapHours === undefined || Number.isNaN(r.overlapHours)) {
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
 * 充电记录 CSV 导出数据格式化
 */
export function exportChargingCsv(records, filename = '充电报表.csv') {
  const columns = [
    { key: 'startTime', label: '起始时间' },
    { key: 'endTime', label: '结束时间' },
    { key: 'durationDisplay', label: '充电时长(h)' },
    { key: 'startSocDisplay', label: '开始SOC(%)' },
    { key: 'endSocDisplay', label: '结束SOC(%)' },
    { key: 'socIncreaseDisplay', label: '增加量(%)' },
    { key: 'energyDisplay', label: '充电度数(kWh)' },
    { key: 'location', label: '充电位置' },
  ];

  const rows = (records || []).map((r) => ({
    startTime: r.startTime || '—',
    endTime: r.isOngoing ? '充电中' : r.endTime || '—',
    durationDisplay: r.durationHours != null ? String(r.durationHours) : '—',
    startSocDisplay: r.startSoc != null ? `${r.startSoc}%` : '—',
    endSocDisplay: r.endSoc != null ? `${r.endSoc}%` : '—',
    socIncreaseDisplay: r.socIncrease != null ? `+${r.socIncrease}%` : '—',
    energyDisplay: r.energy != null ? String(r.energy) : '—',
    location: r.location || '—',
  }));

  return downloadCsv(filename, columns, rows);
}

export {
  downloadCsv,
  generateCsvContent,
};

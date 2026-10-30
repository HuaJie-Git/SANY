// 宽体车正常演示数据与指标口径；本文件不代表已接入车辆数据源。
const round = (value, digits = 2) => Number(value.toFixed(digits));
export const ratio = (a, b, digits = 2) => (
  a != null && b != null && Number.isFinite(a) && Number.isFinite(b) && b > 0
    ? round(a / b, digits) : null
);

export function completeDay(row, electric) {
  if (!row) return row;
  const date = row.date || row.dateStr;
  let seed = 0;
  for (const c of date) seed = ((seed << 5) - seed + c.charCodeAt(0)) | 0;
  seed = Math.abs(seed);
  const baseline = date === '2023-11-23';
  const totalHours = row.runningHours ?? row.runtimeHours;
  // 新指标分别提供正常示例基础量，不按能耗比例拆出充电、回收或运输重量。
  const chargingEnergy = electric ? (baseline ? 210 : round(row.chargeDuration * 175, 1)) : undefined;
  const accumulatedCharge = electric ? round(chargingEnergy + row.recoveryEnergy, 1) : undefined;
  const energy = electric ? row.energy : round(row.runningFuel + row.idleFuel, 1);
  const trips = electric ? row.trips : (baseline ? 2 : 2 + seed % 4);
  const weight = electric ? row.weight : (baseline ? 144.5 : round(135 + seed % 150, 1));
  const recovered = electric ? round(accumulatedCharge - chargingEnergy, 1) : undefined;
  const drivingHours = electric ? (baseline ? 4 : round(row.workHours * 0.9, 2)) : round(row.workHours * 0.9, 3);
  const source = { ...row };
  if (electric) {
    for (const key of ['runningPower', 'idlePower', 'drivingEnergy', 'idleEnergy']) delete source[key];
  }
  return {
    ...source, trips, weight, maxSpeed: row.maxSpeed ?? (electric ? 42 : 43),
    workingHours: totalHours, operatingHours: row.workHours, drivingHours,
    utilizationRate: ratio(drivingHours * 100, totalHours, 1),
    hourlyEnergy: ratio(energy, totalHours), payloadPerTrip: ratio(weight, trips),
    ...(electric ? {
      energy, avgEnergy: ratio(energy, row.mileage), chargingEnergy, accumulatedCharge,
      recoveryEnergy: recovered, recoveryRate: ratio(recovered * 100, chargingEnergy),
    } : { fuel: energy, avgHourlyFuel: ratio(energy, totalHours, 1) }),
  };
}

export function summarizeDays(rows, electric) {
  const sum = (key) => rows.length && rows.every(r => Number.isFinite(r[key]))
    ? round(rows.reduce((total, r) => total + r[key], 0), 3) : null;
  const result = Object.fromEntries([
    'mileage', 'energy', 'fuel', 'trips', 'weight', 'workingHours', 'operatingHours',
    'workHours', 'idleHours', 'drivingHours', 'chargeDuration', 'chargingEnergy',
    'accumulatedCharge', 'runningFuel', 'idleFuel',
  ].map(key => [key, sum(key)]));
  result.maxSpeed = rows.length ? Math.max(...rows.map(r => r.maxSpeed)) : null;
  result.payloadPerTrip = ratio(result.weight, result.trips);
  result.hourlyEnergy = ratio(electric ? result.energy : result.fuel, result.workingHours);
  result.utilizationRate = ratio(result.drivingHours == null ? null : result.drivingHours * 100, result.workingHours, 1);
  if (electric) {
    result.recoveryEnergy = result.accumulatedCharge == null || result.chargingEnergy == null
      ? null : round(result.accumulatedCharge - result.chargingEnergy, 3);
    result.recoveryRate = ratio(result.recoveryEnergy == null ? null : result.recoveryEnergy * 100, result.chargingEnergy);
    result.avgEnergy = ratio(result.energy, result.mileage);
  } else result.avgHourlyFuel = ratio(result.fuel, result.workingHours, 1);
  return result;
}

export const formatMetric = (value, digits = 2) => Number.isFinite(value)
  ? String(round(value, digits)) : '—';

function detailMetrics(data, electric) {
  const energyUnit = electric ? 'kWh' : 'L';
  const fields = [
    ['workingHours', '工作时长', 'h'], ['operatingHours', '运转时长', 'h'],
    ['idleHours', '怠速时长', 'h'], ['mileage', '行驶里程', 'km'],
    ['trips', '运输趟数', '趟'], ['weight', '运输重量', 't'],
    [electric ? 'energy' : 'fuel', '能耗', energyUnit],
    ['hourlyEnergy', '每小时能耗', `${energyUnit}/h`],
    ...(electric ? [
      ['chargingEnergy', '充电桩能耗', 'kWh'], ['recoveryEnergy', '回收能量', 'kWh'],
      ['recoveryRate', '回收能量百分比', '%'], ['avgEnergy', '平均电耗', 'kWh/km'],
      ['chargeDuration', '充电时长', 'h'],
    ] : [['runningFuel', '运行功耗', 'L'], ['idleFuel', '空闲功耗', 'L']]),
    ['payloadPerTrip', '单趟载重', 't/趟'],
  ];
  return fields.map(([key, label, unit]) => ({ key, label, unit, value: formatMetric(data[key]) }));
}

// 数据报表只展示约定清单；今日详情保留独立的工时、行驶和能源指标。
export function reportMetrics(data, electric) {
  const keys = ['workingHours', 'operatingHours', 'mileage', 'trips',
    electric ? 'energy' : 'fuel', 'hourlyEnergy',
    ...(electric ? ['chargingEnergy', 'recoveryEnergy', 'recoveryRate'] : []), 'payloadPerTrip'];
  return detailMetrics(data, electric).filter(m => keys.includes(m.key))
    .map(m => m.key === 'energy' || m.key === 'fuel' ? { ...m, label: '今日能耗' } : m);
}

export function todayMetrics(data, electric) {
  const metrics = detailMetrics(data, electric).filter(m => !['avgEnergy', 'weight'].includes(m.key)
    && (!electric || m.key !== 'chargeDuration'));
  metrics.splice(5, 0, { key: 'maxSpeed', label: '最高车速', unit: 'km/h', value: formatMetric(data.maxSpeed) });
  metrics.splice(3, 0, { key: 'utilizationRate', label: '机器利用率', unit: '%', value: formatMetric(data.utilizationRate, 1) });
  return metrics;
}

// 独立历史累计正常样例；原有桩电量108920与总充电121500为回收计算的同基准量。
export function cumulativeData(electric) {
  const data = electric ? {
    workingHours: 1240.5, operatingHours: 1085.4, mileage: 28450, trips: 318,
    weight: 22860, energy: 123600, chargingEnergy: 108920, accumulatedCharge: 121500,
  } : {
    workingHours: 2484.25, operatingHours: 2190.5, mileage: 165066.96,
    trips: 1542, weight: 110250, fuel: 61200.5,
  };
  data.hourlyEnergy = ratio(electric ? data.energy : data.fuel, data.workingHours);
  data.payloadPerTrip = ratio(data.weight, data.trips);
  if (electric) {
    data.recoveryEnergy = data.accumulatedCharge - data.chargingEnergy;
    data.recoveryRate = ratio(data.recoveryEnergy * 100, data.chargingEnergy);
  }
  return data;
}

export function cumulativeMetrics(electric) {
  const data = cumulativeData(electric);
  return detailMetrics(data, electric)
    .filter(m => !['idleHours', 'weight', 'runningFuel', 'idleFuel', 'avgEnergy', 'chargeDuration'].includes(m.key))
    .map(m => ({ ...m, label: ({ workingHours: '总工作时长', operatingHours: '总运转时长',
      mileage: '总行驶里程', trips: '总运输趟数', weight: '总运输重量', energy: '总能耗',
      fuel: '总能耗', chargingEnergy: '充电桩总能耗', recoveryEnergy: '总回收能量',
    })[m.key] || m.label }));
}

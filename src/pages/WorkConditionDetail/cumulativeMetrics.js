// R-CUM-002：仅同步 PC RealtimeStatus.jsx 的字段定义，不读取 PC 的设备样例值。
const CUMULATIVE_CONFIG = {
  压路机: [['总工作时间', 'totalWorkHours', 'h'], ['总油耗', 'totalFuel', 'L']],
  平地机: [['总工作时间', 'totalWorkHours', 'h'], ['总油耗', 'totalFuel', 'L']],
  摊铺机: [['总油耗', 'totalFuel', 'L'], ['摊铺距离', '摊铺距离', 'm']],
  泵车: [['总泵送方量', 'totalPumpingVolume', 'm³'], ['总油耗', 'totalFuel', 'L'], ['总工作时间', 'totalWorkHours', 'h']],
  拖泵: [['总泵送次数', 'totalPumpingCount', '次'], ['总油耗', 'totalFuel', 'L'], ['总泵送方量', 'totalPumpingVolume', 'm³'], ['总工作时间', 'totalWorkHours', 'h']],
  车载泵: [['总油耗', 'totalFuel', 'L'], ['总泵送方量', 'totalPumpingVolume', 'm³'], ['总工作时间', 'totalWorkHours', 'h']],
  铣刨机: [['铣刨距离', 'millingDistance', 'm'], ['总油耗', 'totalFuel', 'L'], ['发动机小时数', 'engineHours', 'h']],
};

const TYPE_ALIASES = {
  起重机: '汽车起重机',
};

// 只识别现有设备中明确出现的型号，不根据相似编号猜测机型。
const MODEL_TYPES = [
  ['SSR260', '压路机'], ['SMG200', '平地机'], ['SMP130', '摊铺机'],
  ['SYM5230THB', '泵车'], ['HBT6013C', '拖泵'], ['SYM5120THB', '车载泵'],
  ['SCM1000C', '铣刨机'],
];

function findConfig(device, machineData) {
  for (const candidate of [device.type, device.deviceType, device.name]) {
    if (typeof candidate !== 'string') continue;
    const name = candidate.trim().replace(/^(?:三一|SANY\s+)/i, '');
    const type = TYPE_ALIASES[name] || name;
    if (CUMULATIVE_CONFIG[type]) return CUMULATIVE_CONFIG[type];
    const template = machineData[type];
    if (template?.cumulative) {
      return template.cumulative.map(([label, , unit]) => [label, label, unit]);
    }
    // 资产品牌筛选生成的“品牌 320GC 挖掘机”沿用挖掘机字段，不借用样例值。
    if (/^\S+ 320GC 挖掘机$/.test(name) && machineData.挖掘机?.cumulative) {
      return machineData.挖掘机.cumulative.map(([label, , unit]) => [label, label, unit]);
    }
  }
  for (const candidate of [device.model, device.name, device.code]) {
    if (typeof candidate !== 'string') continue;
    const match = MODEL_TYPES.find(([model]) => candidate === model || candidate.startsWith(`${model}-`));
    if (match) return CUMULATIVE_CONFIG[match[1]];
    const template = Object.values(machineData).find(({ model }) => model && candidate === model);
    if (template?.cumulative) {
      return template.cumulative.map(([label, , unit]) => [label, label, unit]);
    }
  }
  return [];
}

function formatValue(value, unit) {
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '—';
  if (typeof value !== 'string') return '—';
  let text = value.trim();
  if (unit && text.toLowerCase().endsWith(unit.toLowerCase())) {
    text = text.slice(0, -unit.length).trim();
  }
  // 保留千分位与精度；不把布尔、空串、占位符、无效单位转成 0。
  if (!/^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(text)) return '—';
  return Number.isFinite(Number(text.replaceAll(',', ''))) ? text : '—';
}

/** 兜底只复用机型的字段与单位，值必须来自当前设备的 cumulative。 */
export function resolveCumulativeMetrics(device = {}, machineData = {}) {
  const currentDevice = device || {};
  const cumulative = currentDevice.cumulative;
  return findConfig(currentDevice, machineData).map(([label, key, unit]) => {
    const value = Array.isArray(cumulative)
      ? cumulative.find((item) => Array.isArray(item) && item[0] === label)?.[1]
      : cumulative?.[key] ?? cumulative?.[label];
    return [label, formatValue(value, unit), unit];
  });
}

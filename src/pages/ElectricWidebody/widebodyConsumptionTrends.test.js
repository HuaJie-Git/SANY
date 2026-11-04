/**
 * WB-CONS-001: 宽体车能耗/油耗命名与百公里趋势专项契约测试
 *
 * 验收点：
 * 1. 电动宽体车：能耗命名（“平均能耗”、“平均能耗趋势”），单位 kWh/100km
 * 2. 燃油宽体车：油耗命名（“平均油耗”、“平均油耗趋势”），单位 L/100km
 * 3. 百公里换算公式：(consumption / mileage) * 100，非以 1km 预舍入数值乘 100
 * 4. 周期汇总换算：总能耗 / 总里程 * 100，非单日百公里均值算术平均
 * 5. STATE-001 边界保护：里程 <= 0 或缺失时返回 null（展示“—”、折线断点不连 0）；
 *    能耗为 0 但里程 > 0 时有效展示 0；异常负数/NaN 拦截
 *
 * 运行方式: node src/pages/ElectricWidebody/widebodyConsumptionTrends.test.js
 */

import { calcPer100Km, completeDay, summarizeDays, detailMetrics } from './widebodyMetrics.js';
import {
  ELECTRIC_ENERGY_METRICS,
  getDailyVehicleStats,
  getReportDataByDate,
} from './electricWidebodyData.js';
import {
  FUEL_WIDEBODY_DATA,
  getFuelDayStats,
  getPeriodicFuelData,
} from './fuelWidebodyData.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  } else {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  }
}

console.log('=== 开始执行 WB-CONS-001 宽体车能耗与百公里趋势契约测试 ===\n');

// -----------------------------------------------------------------------------
// 1. calcPer100Km 计算 helper 契约与边界安全
// -----------------------------------------------------------------------------
console.log('【1. calcPer100Km 换算函数与边界测试】');

// 电动宽体车基准日数据换算：210 kWh / 48.6 km * 100 = 432.098765... -> 432.1 (digits=1) / 432.1 (digits=2)
const elecBaseline100Km = calcPer100Km(210, 48.6, 1);
assert(elecBaseline100Km === 432.1, `电动基准日换算正确: 210kWh / 48.6km * 100 = 432.1 kWh/100km (实际: ${elecBaseline100Km})`);

// 燃油宽体车基准日数据换算：7.0 L / 2.4 km * 100 = 291.6666... -> 291.67 L/100km
const fuelBaseline100Km = calcPer100Km(7.0, 2.4, 2);
assert(fuelBaseline100Km === 291.67, `燃油基准日换算正确: 7.0L / 2.4km * 100 = 291.67 L/100km (实际: ${fuelBaseline100Km})`);

// 避免用预舍入数值冒充真实换算检验：
// 若先算单公里 210 / 48.6 = 4.32 (两位)，再乘 100 得 432.00；但真实原始除法为 432.10
const preRounded = Number((210 / 48.6).toFixed(2)) * 100;
assert(preRounded === 432.0, '预舍入会导致精度损失产生 432.0');
assert(calcPer100Km(210, 48.6, 2) === 432.1, 'calcPer100Km 使用原始能耗与里程计算得到高精度 432.1');

// 能耗为 0 但里程 > 0 (下坡滑行/制动回收)
assert(calcPer100Km(0, 50) === 0, '能耗为 0 且里程 > 0 时有效返回 0，不返回 null');

// STATE-001: 里程为 0 或缺失时返回 null (折线断点不连 0，界面显示 —)
assert(calcPer100Km(50, 0) === null, '里程为 0 时返回 null');
assert(calcPer100Km(50, null) === null, '里程为 null 时返回 null');
assert(calcPer100Km(50, undefined) === null, '里程为 undefined 时返回 null');
assert(calcPer100Km(null, 50) === null, '能耗为 null 时返回 null');
assert(calcPer100Km(undefined, 50) === null, '能耗为 undefined 时返回 null');
assert(calcPer100Km(-10, 50) === null, '负能耗拦截返回 null');
assert(calcPer100Km(50, -10) === null, '负里程拦截返回 null');
assert(calcPer100Km('abc', 50) === null, '非法字符串拦截返回 null');
assert(calcPer100Km(50, 'xyz') === null, '非法字符串里程拦截返回 null');
assert(calcPer100Km(0, 0) === null, '能耗与里程均为 0 时返回 null (停运日)');

// REVIEW-001: 严格类型校验与溢出防御
assert(calcPer100Km(false, 50) === null, '布尔值 false 作为能耗拦截返回 null');
assert(calcPer100Km(50, false) === null, '布尔值 false 作为里程拦截返回 null');
assert(calcPer100Km(true, 50) === null, '布尔值 true 作为能耗拦截返回 null');
assert(calcPer100Km(50, true) === null, '布尔值 true 作为里程拦截返回 null');
assert(calcPer100Km([], 50) === null, '空数组 [] 拦截返回 null');
assert(calcPer100Km(50, []) === null, '里程为空数组 [] 拦截返回 null');
assert(calcPer100Km([10], 50) === null, '含元素数组 [10] 拦截返回 null');
assert(calcPer100Km({}, 50) === null, '对象 {} 拦截返回 null');
assert(calcPer100Km('   ', 50) === null, '空白字符串 拦截返回 null');
assert(calcPer100Km('\t\n  ', 50) === null, '制表/换行空白 拦截返回 null');
assert(calcPer100Km(Infinity, 50) === null, 'Infinity 能耗拦截返回 null');
assert(calcPer100Km(50, Infinity) === null, 'Infinity 里程拦截返回 null');
assert(calcPer100Km(NaN, 50) === null, 'NaN 能耗拦截返回 null');
assert(calcPer100Km(1e308, 1e-308) === null, '计算溢出 Infinity 拦截返回 null');
assert(calcPer100Km('0', 50) === 0, '合法字符串 0 返回 0');
assert(calcPer100Km('0.0', '50.0') === 0, '合法字符串 0.0 返回 0');
assert(calcPer100Km('210', '48.6', 1) === 432.1, '支持合法数字字符串格式转换');

// -----------------------------------------------------------------------------
// 2. completeDay 与 summarizeDays 聚合计算自洽性契约
// -----------------------------------------------------------------------------
console.log('\n【2. completeDay 与 summarizeDays 聚合计算】');

const dayNormal = completeDay({
  date: '2023-11-23',
  energy: 210,
  mileage: 48.6,
  runningHours: 5.3,
  workHours: 4.5,
  idleHours: 0.8,
}, true);
assert(dayNormal.avgEnergy === 432.1, `completeDay 计算基准日 avgEnergy 为 432.1 (实际: ${dayNormal.avgEnergy})`);

const dayZeroMileage = completeDay({
  date: '2023-11-24',
  energy: 0,
  mileage: 0,
  runningHours: 0,
  workHours: 0,
  idleHours: 0,
}, true);
assert(dayZeroMileage.avgEnergy === null, '零里程停运日 avgEnergy 严格为 null');

// 周期报表总百公里计算：总能耗 / 总里程 * 100，非日百公里算术平均
const d1 = { energy: 100, mileage: 10, workingHours: 2, operatingHours: 2, idleHours: 0, maxSpeed: 40 }; // 1000 kWh/100km
const d2 = { energy: 100, mileage: 100, workingHours: 8, operatingHours: 8, idleHours: 0, maxSpeed: 42 }; // 100 kWh/100km
const summary = summarizeDays([d1, d2], true);
// 总能耗 200，总里程 110 -> 200 / 110 * 100 = 181.82 kWh/100km
// 算术平均为 (1000 + 100) / 2 = 550
assert(summary.avgEnergy === 181.82, `汇总百公里能耗为总除总 181.82 (实际: ${summary.avgEnergy})，非日均值算术平均 550`);

// detailMetrics 导出契约检查
const metricAvgEnergy = detailMetrics({ avgEnergy: 432.1 }, true).find(m => m.key === 'avgEnergy');
assert(metricAvgEnergy !== undefined, 'detailMetrics 包含 avgEnergy 键');
assert(metricAvgEnergy.label === '平均能耗', `detailMetrics 标签为“平均能耗” (实际: ${metricAvgEnergy?.label})`);
assert(metricAvgEnergy.unit === 'kWh/100km', `detailMetrics 单位为“kWh/100km” (实际: ${metricAvgEnergy?.unit})`);

// -----------------------------------------------------------------------------
// 3. 电动宽体车数据源与周期报表趋势契约
// -----------------------------------------------------------------------------
console.log('\n【3. 电动宽体车数据源与周期报表趋势】');

const elecStat20231123 = getDailyVehicleStats('2023-11-23');
assert(elecStat20231123.avgEnergy === 432.1, `电动基准日 2023-11-23 avgEnergy 为 432.1 (实际: ${elecStat20231123.avgEnergy})`);

const elecReportWeek = getReportDataByDate(new Date(2023, 10, 23), 'weekly');
assert(elecReportWeek.days.length === 7, '周报包含 7 天');
elecReportWeek.days.forEach((day) => {
  if (day.mileage > 0 && day.energy > 0) {
    const expected = Number(((day.energy / day.mileage) * 100).toFixed(2));
    assert(Math.abs(day.avgEnergy - expected) < 0.05, `${day.date} avgEnergy (${day.avgEnergy}) 严格等于 (energy/mileage)*100 (${expected})`);
  } else if (day.mileage <= 0) {
    assert(day.avgEnergy === null, `${day.date} 零里程日 avgEnergy 严格为 null`);
  }
});

// 常量定义契约
assert(ELECTRIC_ENERGY_METRICS.avgEnergyPer100Km === '432.1', 'ELECTRIC_ENERGY_METRICS.avgEnergyPer100Km 为 432.1');

// -----------------------------------------------------------------------------
// 4. 燃油宽体车数据源与周期报表趋势契约
// -----------------------------------------------------------------------------
console.log('\n【4. 燃油宽体车数据源与周期报表趋势】');

const fuelStat20231123 = getFuelDayStats('2023-11-23');
assert(fuelStat20231123.avgFuel === 291.67, `燃油基准日 2023-11-23 avgFuel 为 291.67 L/100km (实际: ${fuelStat20231123.avgFuel})`);

const fuelWeekly = getPeriodicFuelData('weekly', new Date(2023, 10, 20));
assert(fuelWeekly.rows.length === 7, '燃油周报包含 7 天数据行');
fuelWeekly.rows.forEach((r) => {
  const calculated = calcPer100Km(r.fuel, r.mileage);
  if (r.mileage > 0) {
    assert(typeof calculated === 'number' && calculated > 0, `${r.date} 计算出有效百公里油耗: ${calculated} L/100km`);
  } else {
    assert(calculated === null, `${r.date} 里程为0时计算返回 null`);
  }
});

const fuelMonthly = getPeriodicFuelData('monthly', new Date(2023, 10, 23));
assert(fuelMonthly.rows.length === 30, '燃油11月报包含 30 天数据行');
const nov23FuelRow = fuelMonthly.rows.find(r => r.date === '2023-11-23');
assert(nov23FuelRow && calcPer100Km(nov23FuelRow.fuel, nov23FuelRow.mileage) === 291.67, '燃油月报中 11-23 换算油耗为 291.67 L/100km');

// 燃油静态常量契约
assert(FUEL_WIDEBODY_DATA.weekly.avgFuelTrend.length === 7, 'FUEL_WIDEBODY_DATA.weekly 包含 7 天 avgFuelTrend');
assert(FUEL_WIDEBODY_DATA.monthly.avgFuelTrend.length === 30, 'FUEL_WIDEBODY_DATA.monthly 包含 30 天 avgFuelTrend');

console.log('\n=================================================');
console.log(`🎉 全部 ${passedTests} 项 WB-CONS-001 专项契约测试 100% 通过！(${passedTests}/${totalTests})`);
console.log('=================================================\n');

/**
 * 纯数据契约测试 (Pure Data Contract Tests)
 * 遵从 DEC-010 / DEC-011 / REVIEW-V2-01 验收规范：
 * 1. 详情指标契约 (实时 8 项、今日 11 项、累计 6 项、机器利用率 helper 与功耗口径)
 * 2. 报表两图契约 (剩余电量曲线 00:00~24:00 及各日末 SOC 趋势一致性、档位使用分布加权及加和 100%)
 * 3. 跨周期聚合 (正常日、7天周报、28/29/30/31天月报及跨年自洽)
 * 4. 充电数据契约 (基准日 1.2h / 210.0kWh 同日共源、非基准秒数时间戳一致性、跨天半开区间相交、未结束与缺失汇总 null 传播)
 *
 * 运行方式: node src/pages/ElectricWidebody/electricDataContracts.test.js
 */

import {
  ELECTRIC_REALTIME_METRICS,
  ELECTRIC_TODAY_METRICS,
  ELECTRIC_CUMULATIVE_METRICS,
  getDailyVehicleStats,
  getReportDataByDate,
  getDailySocCurve,
  getDailyGearDistribution,
  aggregateGearDistribution,
  validateDateRange,
  getChargingData,
  getMachineUtilizationRate,
} from './electricWidebodyData.js';

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

console.log('=== 开始执行 V2 纯数据契约测试 (DEC-010 / DEC-011 / REVIEW-V2-01) ===\n');

// -----------------------------------------------------------------------------
// 1. 详情指标契约测试 (8 / 11 / 6)
// -----------------------------------------------------------------------------
console.log('【1. 详情指标契约 (8 / 11 / 6)】');

// 实时指标 8 项检查（含电池健康）
const realtimeLabels = ['剩余电量', '电池健康', '车速', '油门深度', '制动深度', '运载趟数', '运输重量'];
assert(ELECTRIC_REALTIME_METRICS.length === 7, '实时常量列表包含 7 项（结合状态字段共 8 项）');
realtimeLabels.forEach((label) => {
  const found = ELECTRIC_REALTIME_METRICS.find((m) => m.label === label);
  assert(Boolean(found), `实时指标包含「${label}」`);
});

const sohMetric = ELECTRIC_REALTIME_METRICS.find((m) => m.label === '电池健康');
const sohVal = Number(sohMetric.value);
assert(!isNaN(sohVal) && sohVal >= 0 && sohVal <= 100, `电池健康 SOH 合法范围 0~100 (当前 ${sohVal}%)`);

// 今日指标 11 项检查
const expectedTodayLabels = [
  '里程', '电耗', '运行功耗', '空闲功耗', '工时', '怠速工时',
  '运行时长', '机器利用率', '充电时长', '回收电量', '最高车速',
];
assert(ELECTRIC_TODAY_METRICS.length === 11, '今日数据指标严格包含 11 项');
expectedTodayLabels.forEach((label, idx) => {
  assert(ELECTRIC_TODAY_METRICS[idx].label === label, `今日指标顺序第 ${idx + 1} 位为「${label}」`);
});

// 累计指标 6 项检查（含总充电电量）
const cumulativeLabels = ['总运行时长', '总运载趟数', '总运输重量', '总里程', '总电耗', '总充电电量'];
assert(ELECTRIC_CUMULATIVE_METRICS.length === 6, '累计数据指标严格包含 6 项');
cumulativeLabels.forEach((label) => {
  const found = ELECTRIC_CUMULATIVE_METRICS.find((m) => m.label === label);
  assert(Boolean(found), `累计指标包含「${label}」`);
});

// 基准日 2023-11-23 详情数据自洽
const stat20231123 = getDailyVehicleStats('2023-11-23');
assert(stat20231123.runtimeHours === 5.3, '基准日运行时长为 5.3h');
assert(stat20231123.workHours === 4.5, '基准日工时为 4.5h');
assert(stat20231123.utilizationRate === 117.8, '基准日机器利用率 5.3/4.5*100 = 117.8% (DEC-011)');
assert(stat20231123.chargeDuration === 1.2, '基准日充电时长为 1.2h');
assert(stat20231123.chargingEnergy === 210.0, '基准日充电电量为 210.0kWh');
assert(stat20231123.drivingEnergy === 161.9 && stat20231123.idleEnergy === 24.5, '保留用户自有功耗示例 161.9 / 24.5');

// REVIEW-V2-01: 单源派生契约测试 (ELECTRIC_TODAY_METRICS / ELECTRIC_REALTIME_METRICS 共源)
assert(
  ELECTRIC_TODAY_METRICS.find((m) => m.label === '里程').value === String(stat20231123.mileage),
  '今日里程从基准日派生共源'
);
assert(
  ELECTRIC_TODAY_METRICS.find((m) => m.label === '电耗').value === String(stat20231123.energy),
  '今日电耗从基准日派生共源'
);
assert(
  ELECTRIC_TODAY_METRICS.find((m) => m.label === '运行功耗').value === String(stat20231123.drivingEnergy),
  '今日运行功耗从基准日派生共源'
);
assert(
  ELECTRIC_TODAY_METRICS.find((m) => m.label === '空闲功耗').value === String(stat20231123.idleEnergy),
  '今日空闲功耗从基准日派生共源'
);
assert(
  ELECTRIC_TODAY_METRICS.find((m) => m.label === '机器利用率').value === String(stat20231123.utilizationRate),
  '今日机器利用率从基准日派生共源'
);
assert(
  ELECTRIC_REALTIME_METRICS.find((m) => m.label === '电池健康').value === String(stat20231123.batteryHealth),
  '实时电池健康从基准日派生共源'
);

// REVIEW-V2-01: 真实调用 getMachineUtilizationRate helper 测试
assert(getMachineUtilizationRate(5.3, 4.5) === 117.8, '机器利用率计算 5.3/4.5 = 117.8% (允许>100%，不clamp)');
assert(getMachineUtilizationRate(0, 4.5) === 0.0, '运行0但工时有效时利用率为 0.0%');
assert(getMachineUtilizationRate(2.0, 0) === null, '工时为0时利用率返回 null (安全展示 —)');
assert(getMachineUtilizationRate(2.0, -1) === null, '工时为负数时利用率返回 null');
assert(getMachineUtilizationRate(-1, 4.5) === null, '运行为负数时利用率返回 null');
assert(getMachineUtilizationRate(null, 4.5) === null, '运行时长为 null 时返回 null');
assert(getMachineUtilizationRate(2.0, null) === null, '工时为 null 时返回 null');
assert(getMachineUtilizationRate(undefined, 4.5) === null, '运行时长为 undefined 时返回 null');
assert(getMachineUtilizationRate('abc', 4.5) === null, '非法字符串输入返回 null');
assert(getMachineUtilizationRate(2.0, 'abc') === null, '分母为非法字符串输入返回 null');

// -----------------------------------------------------------------------------
// 2. 报表两图契约测试 (剩余电量曲线 & 档位分布)
// -----------------------------------------------------------------------------
console.log('\n【2. 报表两图契约 (剩余电量曲线 & 档位分布)】');

// 单日电量曲线 (2023-11-23)
const dailySoc = getDailySocCurve('2023-11-23');
assert(dailySoc.points.length === 13, '单日电量曲线包含 13 个 2 小时步长点 (00:00 ~ 24:00)');
assert(dailySoc.points[0].time === '00:00' && dailySoc.points[12].time === '24:00', '电量曲线起止为 00:00 与 24:00');
const pt16 = dailySoc.points.find((p) => p.time === '16:00');
assert(pt16 && pt16.soc === 48.6, '16:00 点电量与 IMG-V2-01 视觉事实源 48.6% 完全一致');
assert(dailySoc.points[12].soc === dailySoc.endOfDaySoc, '末尾点电量与日末 SOC 严格相等');
dailySoc.points.forEach((p) => {
  assert(p.soc >= 0 && p.soc <= 100, `电量点 ${p.time} 在 0~100% 合法范围 (${p.soc}%)`);
});

// 单日档位分布 (2023-11-23)
const dailyGear = getDailyGearDistribution('2023-11-23');
assert(!dailyGear.isEmpty, '基准日档位数据非空');
assert(dailyGear.gears.length === 5, '档位分布包含 5 个档位 (1档、2档、3档、4档、R档)');
const gearPcts = dailyGear.gears.reduce((acc, g) => acc + g.percent, 0);
assert(gearPcts === 100, `单日档位百分比之和严格等于 100% (实际 ${gearPcts}%)`);
const totalGearDur = dailyGear.gears.reduce((acc, g) => acc + g.duration, 0);
assert(Math.abs(totalGearDur - 4.5) < 0.05, `单日档位总时长 ${totalGearDur}h 严格对齐工时 4.5h`);
assert(dailyGear['1档'].percent === 25, '基准日 1档占比 25%');
assert(dailyGear['2档'].percent === 30, '基准日 2档占比 30%');
assert(dailyGear['3档'].percent === 20, '基准日 3档占比 20%');
assert(dailyGear['4档'].percent === 15, '基准日 4档占比 15%');
assert(dailyGear['R档'].percent === 10, '基准日 R档占比 10%');

// 档位全空停工异常保护
const emptyGearAgg = aggregateGearDistribution([]);
assert(emptyGearAgg.isEmpty === true && emptyGearAgg.totalHours === 0, '无数据时档位为空态，不画 100% 假饼 (DEC-010)');

// -----------------------------------------------------------------------------
// 3. 周期报表聚合自洽性测试 (7/28/29/30/31天与跨年)
// -----------------------------------------------------------------------------
console.log('\n【3. 周期报表聚合自洽性 (周/月/闰年/跨年)】');

// 周报 (包含 2023-11-23 的周: 2023-11-20 ~ 2023-11-26)
const weeklyReport = getReportDataByDate(new Date(2023, 10, 23), 'weekly');
assert(weeklyReport.days.length === 7, '周报包含 7 天');
assert(weeklyReport.socTrend.length === 7, '周报日末 SOC 趋势包含 7 天');
const thuInWeek = weeklyReport.socTrend.find((t) => t.dateStr === '2023-11-23');
assert(thuInWeek && thuInWeek.soc === 62.0, '周报中 11-23 日末 SOC 严格等于单日日末 SOC 62.0% (非相加)');
const weeklyGearPcts = weeklyReport.gearDistribution.gears.reduce((acc, g) => acc + g.percent, 0);
assert(weeklyGearPcts === 100, `周报档位加权百分比之和严格等于 100% (实际 ${weeklyGearPcts}%)`);

// 月报 30 天 (2023年11月)
const novReport = getReportDataByDate(new Date(2023, 10, 23), 'monthly');
assert(novReport.daysInMonth === 30, '2023年11月真实天数为 30 天');
assert(novReport.days.length === 30, '月报数组精确生成 30 天');
assert(novReport.socTrend.length === 30, '月报日末 SOC 趋势精确包含 30 天');
const day23InMonth = novReport.socTrend.find((t) => t.dateStr === '2023-11-23');
assert(day23InMonth && day23InMonth.soc === 62.0, '月报中 11-23 日末 SOC 严格等于 62.0%');
const novGearPcts = novReport.gearDistribution.gears.reduce((acc, g) => acc + g.percent, 0);
assert(novGearPcts === 100, `11月报档位加权百分比之和严格等于 100% (实际 ${novGearPcts}%)`);

// 闰年 2 月 29 天 (2024年2月)
const leapFebReport = getReportDataByDate(new Date(2024, 1, 15), 'monthly');
assert(leapFebReport.daysInMonth === 29, '2024年闰年2月精确为 29 天');
assert(leapFebReport.days.length === 29, '闰年月历生成 29 天单元格');

// 平年 2 月 28 天 (2023年2月)
const normalFebReport = getReportDataByDate(new Date(2023, 1, 15), 'monthly');
assert(normalFebReport.daysInMonth === 28, '2023年平年2月精确为 28 天');

// 31 天大月与跨年 (2023年12月 至 2024年1月)
const decReport = getReportDataByDate(new Date(2023, 11, 31), 'monthly');
assert(decReport.daysInMonth === 31, '2023年12月精确为 31 天');
const janReport = getReportDataByDate(new Date(2024, 0, 1), 'monthly');
assert(janReport.daysInMonth === 31, '2024年1月精确为 31 天');

// -----------------------------------------------------------------------------
// 4. 充电数据契约与边界安全测试 (DEC-010 / DEC-011 / REVIEW-V2-01)
// -----------------------------------------------------------------------------
console.log('\n【4. 充电数据契约与边界安全】');

// 基准日同日查询 (2023-11-23 ~ 2023-11-23)
const chgBaseline = getChargingData('2023-11-23', '2023-11-23');
assert(chgBaseline.isValid, '同日查询有效');
assert(chgBaseline.records.length === 2, '基准日包含 2 条逐次充电记录');
assert(chgBaseline.summary.count === 2, '基准日汇总充电次数为 2 次');
assert(chgBaseline.summary.totalDuration === 1.2, '基准日记录时长求和严格为 1.2h (对齐今日数据与报表)');
assert(chgBaseline.summary.totalEnergy === 210.0, '基准日充电电量求和严格为 210.0kWh (对齐日记录)');

// 验证基准日两条记录各自自洽
const rec1 = chgBaseline.records.find((r) => r.id === 'CHG-20231123-01');
const rec2 = chgBaseline.records.find((r) => r.id === 'CHG-20231123-02');
assert(rec1 && rec1.durationHours === 0.1 && rec1.energy === 10.0, '第一条记录时长 0.1h, 电量 10.0kWh');
assert(rec1.socIncrease === rec1.endSoc - rec1.startSoc, '第一条记录 SOC 增加量 = 结束 - 开始 (100 - 94 = 6%)');
assert(rec2 && rec2.durationHours === 1.1 && rec2.energy === 200.0, '第二条记录时长 1.1h, 电量 200.0kWh');
assert(rec2.socIncrease === rec2.endSoc - rec2.startSoc, '第二条记录 SOC 增加量 = 结束 - 开始 (100 - 30 = 70%)');

// REVIEW-V2-01: 非基准日精确秒数时间戳与时长一致性契约
const chg20231124 = getChargingData('2023-11-24', '2023-11-24');
const stat20231124 = getDailyVehicleStats('2023-11-24');
assert(chg20231124.records.length > 0, '2023-11-24 包含非基准充电记录');
chg20231124.records.forEach((rec, idx) => {
  const [d1, t1] = rec.startTime.split(' ');
  const [d2, t2] = rec.endTime.split(' ');
  const [y1, m1, day1] = d1.split('-').map(Number);
  const [h1, min1, s1] = t1.split(':').map(Number);
  const [y2, m2, day2] = d2.split('-').map(Number);
  const [h2, min2, s2] = t2.split(':').map(Number);
  const diffSec = (new Date(y2, m2 - 1, day2, h2, min2, s2) - new Date(y1, m1 - 1, day1, h1, min1, s1)) / 1000;
  const calcDur = Number((diffSec / 3600).toFixed(1));
  assert(calcDur === rec.durationHours, `2023-11-24 第 ${idx + 1} 条时间差 (${diffSec}s) 严格对应时长 (${rec.durationHours}h)`);
});
assert(chg20231124.summary.totalDuration === stat20231124.chargeDuration, '非基准日 2023-11-24 充电汇总时长严格等于日统计时长');
assert(chg20231124.summary.totalEnergy === stat20231124.chargingEnergy, '非基准日 2023-11-24 充电汇总电量严格等于日统计电量');

// 日期范围校验边界测试
assert(validateDateRange('', '2023-11-23').isValid === false, '开始日期为空返回无效');
assert(validateDateRange('2023-11-23', '').isValid === false, '结束日期为空返回无效');
assert(validateDateRange('2023-11-25', '2023-11-20').isValid === false, '结束日期早于开始日期返回无效');
assert(validateDateRange('2024-02-30', '2024-03-05').isValid === false, '非法日期 (2/30) 严格拦截不溢出滚动');
assert(validateDateRange('2023-01-01', '2024-01-05').isValid === false, '跨度 370 天超过 366 天上限拦截');
assert(validateDateRange('2023-01-01', '2023-12-31').isValid === true, '全年 365 天在合法范围内通过');

// 异常场景模拟驱动测试 (widebodyChargeState)
// 1. 空状态 (empty)
const emptyChg = getChargingData('2023-11-23', '2023-11-23', 'empty');
assert(emptyChg.records.length === 0, 'empty 场景返回 0 条记录');
assert(emptyChg.summary.count === 0 && emptyChg.summary.totalEnergy === 0, 'empty 场景汇总均为 0');

// 2. 充电中未结束 (charging) (REVIEW-V2-01: 未结束汇总返回 null，不伪造 10kWh 假完整)
const chargingChg = getChargingData('2023-11-23', '2023-11-23', 'charging');
const ongoingRec = chargingChg.records[0];
assert(ongoingRec.isOngoing === true, 'charging 场景最新记录为未结束状态');
assert(ongoingRec.endTime === null && ongoingRec.endSoc === null, '未结束充电结束时间与结束 SOC 为 null (显示 —)');
assert(ongoingRec.durationHours === null, '未结束充电时长为 null (显示 —)');
assert(ongoingRec.energy === null, '未结束充电电量为 null (显示 —)');
assert(chargingChg.summary.count === 2, '未结束充电时已知记录次数仍为 2');
assert(chargingChg.summary.totalDuration === null, '未结束充电因时长未闭合，汇总时长为 null (显示 —)');
assert(chargingChg.summary.totalEnergy === null, '未结束充电因电量未闭合，汇总电量为 null (显示 —)');

// 3. 字段缺失 (partial) (REVIEW-V2-01: 缺电量时汇总返回 null)
const partialChg = getChargingData('2023-11-23', '2023-11-23', 'partial');
const partRec = partialChg.records[0];
assert(partRec.location === null && partRec.endSoc === null, 'partial 场景缺失字段返回 null');
assert(partRec.energy === null, 'partial 场景电量缺失返回 null');
assert(partRec.socIncrease === null, 'partial 场景 SOC 缺失时不计算增加量');
assert(partialChg.summary.totalEnergy === null, '记录电量缺失时，汇总电量为 null (显示 —)');
assert(partialChg.summary.totalDuration === 1.2, '记录时长已知完整时，汇总时长正常统计 1.2h');

// 4. 跨天充电 (crossday) (REVIEW-V2-01: 真实半开区间相交、去重与部分覆盖 null 契约)
// 4.1 单日 11-22 查询 (相交 0.5h，部分覆盖电量为 null)
const cross22 = getChargingData('2023-11-22', '2023-11-22', 'crossday');
const rec22 = cross22.records.find((r) => r.id === 'CHG-CROSSDAY-01');
assert(Boolean(rec22), '11-22 包含跨天记录');
assert(rec22.startTime === '2023-11-22 23:30:00' && rec22.endTime === '2023-11-23 00:30:00', '跨天记录起止时间为 11-22 23:30 ~ 11-23 00:30 (正向1h跨午夜)');
assert(rec22.durationHours === 1.0, '跨天记录自身完整时长为 1.0h');
assert(rec22.energy === 180.0, '跨天记录自身完整电量为 180.0kWh');
assert(cross22.summary.totalEnergy === null, '11-22 单日未完整覆盖跨天记录，汇总电量为 null (显示 —)');

// 4.2 单日 11-23 查询 (相交 0.5h，汇总时长 = 1.2 + 0.5 = 1.7h，汇总电量为 null)
const cross23 = getChargingData('2023-11-23', '2023-11-23', 'crossday');
const rec23 = cross23.records.find((r) => r.id === 'CHG-CROSSDAY-01');
assert(Boolean(rec23), '11-23 包含跨天记录');
assert(cross23.summary.count === 3, '11-23 包含原 2 条 + 跨天 1 条共 3 条');
assert(cross23.summary.totalDuration === 1.7, '11-23 汇总时长按重叠 0.5h 计算：原 1.2 + 0.5 = 1.7h (REVIEW-V2-01)');
assert(cross23.summary.totalEnergy === null, '11-23 单日未完整覆盖跨天记录，汇总电量为 null (显示 —)');

// 4.3 完整覆盖 11-22 ~ 11-23 查询 (完整包含 1.0h / 180.0kWh，且去重)
const cross22_23 = getChargingData('2023-11-22', '2023-11-23', 'crossday');
const crossRecs = cross22_23.records.filter((r) => r.id === 'CHG-CROSSDAY-01');
assert(crossRecs.length === 1, '跨天记录在全区间中唯一去重，仅出现 1 次');
assert(cross22_23.summary.totalEnergy !== null, '完整覆盖跨天记录时，汇总电量包含完整 180.0kWh 正常计算');

// 4.4 不相交 11-24 查询 (不应强插跨天记录)
const cross24 = getChargingData('2023-11-24', '2023-11-24', 'crossday');
const rec24 = cross24.records.find((r) => r.id === 'CHG-CROSSDAY-01');
assert(!rec24, '11-24 日期范围不包含跨天记录，不强插');

console.log(`\n=================================================`);
console.log(`🎉 全部 ${totalTests} 项数据契约测试 100% 通过！(${passedTests}/${totalTests})`);
console.log(`=================================================`);

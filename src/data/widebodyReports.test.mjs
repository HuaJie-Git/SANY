import assert from 'node:assert/strict';
import {
  validateDateRange,
  getOperationsData,
  calculateWorkPercentages,
  getChargingData,
  generateCsvContent,
} from './widebodyReports.js';

console.log('─── Starting widebodyReports pure function tests ───');

// 1. 日期校验测试 (反转 / 非法 / 366天 / 367天 / 越界)
{
  const resValid = validateDateRange('2023-11-23', '2023-11-23');
  assert.equal(resValid.isValid, true);
  assert.equal(resValid.diffDays, 1);

  const resReversed = validateDateRange('2023-11-25', '2023-11-20');
  assert.equal(resReversed.isValid, false);
  assert.match(resReversed.error, /结束日期不能早于开始日期/);

  const resInvalid = validateDateRange('invalid-date', '2023-11-23');
  assert.equal(resInvalid.isValid, false);
  assert.match(resInvalid.error, /请选择有效的开始和结束日期/);

  const resOutOfRange = validateDateRange('1960-01-01', '1960-01-02');
  assert.equal(resOutOfRange.isValid, false);
  assert.match(resOutOfRange.error, /1970-2099/);

  // 闰年 366 天边界
  const res366 = validateDateRange('2024-01-01', '2024-12-31');
  assert.equal(res366.isValid, true);
  assert.equal(res366.diffDays, 366);

  // 367 天溢出
  const res367 = validateDateRange('2023-01-01', '2024-01-02');
  assert.equal(res367.isValid, false);
  assert.match(res367.error, /不能超过366天/);

  console.log('✓ 1. Date range validation tests passed (reverse/invalid/366/367/out of bounds)');
}

// 2. PC-V3-REVIEW-001: calculateWorkPercentages 纯函数与运营指标测试
{
  // 零分母 0/0：禁止 0/100，返回 null (—)
  const zeroDenom = calculateWorkPercentages(0, 0);
  assert.equal(zeroDenom.workPercentage, null);
  assert.equal(zeroDenom.idlePercentage, null);

  // 0 工作，正怠速：返回 0% 工作，100% 怠速
  const zeroWork = calculateWorkPercentages(0, 2.5);
  assert.equal(zeroWork.workPercentage, 0);
  assert.equal(zeroWork.idlePercentage, 100);

  // 未知/非法输入（null / undefined / NaN / 负数 / Infinity / 溢出）统一返回 null (—)
  assert.deepEqual(calculateWorkPercentages(null, 1.0), { workPercentage: null, idlePercentage: null });
  assert.deepEqual(calculateWorkPercentages(1.0, undefined), { workPercentage: null, idlePercentage: null });
  assert.deepEqual(calculateWorkPercentages(NaN, 1.0), { workPercentage: null, idlePercentage: null });
  assert.deepEqual(calculateWorkPercentages(-1, 2.0), { workPercentage: null, idlePercentage: null });
  assert.deepEqual(calculateWorkPercentages(Infinity, 1), { workPercentage: null, idlePercentage: null });
  assert.deepEqual(calculateWorkPercentages(Number.MAX_VALUE, Number.MAX_VALUE), { workPercentage: null, idlePercentage: null });

  // 正常值（基准日 4.5h 工作 / 0.8h 怠速 => 85% / 15%）
  const normal = calculateWorkPercentages(4.5, 0.8);
  assert.equal(normal.workPercentage, 85);
  assert.equal(normal.idlePercentage, 15);

  // 运营数据基准日 (2023-11-23) 严格通过聚合保留 6 项基准值
  const baseOps = getOperationsData('2023-11-23', '2023-11-23');
  assert.equal(baseOps.isValid, true);
  assert.equal(baseOps.workHours, 4.5);
  assert.equal(baseOps.idleHours, 0.8);
  assert.equal(baseOps.workPercentage, 85);
  assert.equal(baseOps.idlePercentage, 15);
  assert.equal(baseOps.loadedAvgSpeed, 22.6);
  assert.equal(baseOps.emptyAvgSpeed, 30.6);
  assert.equal(baseOps.avgCycleTimeMinutes, 46);
  assert.equal(baseOps.avgCycleTimeHours, 0.77);
  assert.equal(baseOps.avgPayload, 74.6);

  // 区间模式下工时与占比
  const rangeOps = getOperationsData('2023-11-20', '2023-11-23');
  assert.equal(rangeOps.isValid, true);
  assert.equal(typeof rangeOps.workHours, 'number');
  assert.equal(typeof rangeOps.idleHours, 'number');
  assert.equal(rangeOps.workPercentage + rangeOps.idlePercentage, 100);

  console.log('✓ 2. Operations & calculateWorkPercentages tests passed (0/0 null, 0/pos 0/100, invalid null, benchmark 6 values)');
}

// 3. 充电报表基准测试 (2023-11-23: 2条记录, 1.2h / 210kWh)
{
  const baseChg = getChargingData('2023-11-23', '2023-11-23');
  assert.equal(baseChg.isValid, true);
  assert.equal(baseChg.records.length, 2);
  assert.equal(baseChg.summary.count, 2);
  assert.equal(baseChg.summary.totalDuration, 1.2);
  assert.equal(baseChg.summary.totalEnergy, 210.0);

  const rec1 = baseChg.records[0]; // 06:46:25 降序
  assert.equal(rec1.startTime, '2023-11-23 06:46:25');
  assert.equal(rec1.endTime, '2023-11-23 07:52:25');
  assert.equal(rec1.durationHours, 1.1);
  assert.equal(rec1.startSoc, 30);
  assert.equal(rec1.endSoc, 100);
  assert.equal(rec1.socIncrease, 70);
  assert.equal(rec1.energy, 200.0);

  const rec2 = baseChg.records[1]; // 00:00:04
  assert.equal(rec2.startTime, '2023-11-23 00:00:04');
  assert.equal(rec2.durationHours, 0.1);
  assert.equal(rec2.energy, 10.0);

  console.log('✓ 3. Charging data benchmark tests passed (2 records, 1.2h / 210.0kWh)');
}

// 4. 充电报表异常场景驱动 (charging 未结束 / partial 关键值缺失 / empty 空数据)
{
  // empty 场景
  const emptyChg = getChargingData('2023-11-23', '2023-11-23', 'empty');
  assert.equal(emptyChg.isValid, true);
  assert.equal(emptyChg.records.length, 0);
  assert.equal(emptyChg.summary.count, 0);
  assert.equal(emptyChg.summary.totalDuration, 0);
  assert.equal(emptyChg.summary.totalEnergy, 0);

  // charging 未结束场景：未结束记录 endTime 为 null，duration / energy 为 null，汇总不能当 0，应为 null (显示 —)
  const ongoingChg = getChargingData('2023-11-23', '2023-11-23', 'charging');
  assert.equal(ongoingChg.records[0].isOngoing, true);
  assert.equal(ongoingChg.records[0].endTime, null);
  assert.equal(ongoingChg.records[0].durationHours, null);
  assert.equal(ongoingChg.records[0].energy, null);
  assert.equal(ongoingChg.summary.totalEnergy, null);
  assert.equal(ongoingChg.summary.totalDuration, null);

  // partial 缺失场景：关键字段缺失不当 0，汇总相应为 null
  const partialChg = getChargingData('2023-11-23', '2023-11-23', 'partial');
  assert.equal(partialChg.records[0].energy, null);
  assert.equal(partialChg.summary.totalEnergy, null);

  console.log('✓ 4. Charging scenario tests passed (empty/charging/partial handled without treating missing as 0)');
}

// 5. 跨天交集、去重与部分能量未知测试 (crossday)
{
  // 单查 2023-11-23 时，跨天记录 2023-11-22 23:30 ~ 2023-11-23 00:30 部分相交 0.5h
  const crossDayPartial = getChargingData('2023-11-23', '2023-11-23', 'crossday');
  const crossRec = crossDayPartial.records.find((r) => r.id === 'CHG-CROSSDAY-01');
  assert.ok(crossRec, 'Crossday record should be included');
  assert.equal(crossRec.durationHours, 1.0);
  assert.equal(crossRec.energy, 180.0);
  assert.equal(crossRec.overlapHours, 0.5);
  // 部分覆盖无能量采样，effectiveEnergy 为 null，汇总 totalEnergy 相应为 null (显示 —)
  assert.equal(crossRec.effectiveEnergy, null);
  assert.equal(crossDayPartial.summary.totalEnergy, null);

  // 跨 22~23 完整覆盖时，相交时长 1.0h，完整覆盖计入 180.0kWh，且唯一 ID 去重只有一条
  const crossDayFull = getChargingData('2023-11-22', '2023-11-23', 'crossday');
  const fullRecs = crossDayFull.records.filter((r) => r.id === 'CHG-CROSSDAY-01');
  assert.equal(fullRecs.length, 1, 'Record should be deduped by ID');
  assert.equal(fullRecs[0].overlapHours, 1.0);
  assert.equal(fullRecs[0].effectiveEnergy, 180.0);

  console.log('✓ 5. Cross-day intersection and deduplication tests passed (partial energy null, full energy counted)');
}

// 6. CSV 生成与转义测试
{
  const columns = [
    { key: 'col1', label: '列"A"' },
    { key: 'col2', label: '列,B' },
  ];
  const rows = [
    { col1: 'hello, "world"', col2: 'test\r\nvalue' },
    { col1: null, col2: undefined },
  ];
  const csv = generateCsvContent(columns, rows);
  assert.ok(csv.startsWith('\uFEFF'), 'CSV should start with UTF-8 BOM');
  assert.ok(csv.includes('"列""A"""'), 'Quotes should be escaped');
  assert.ok(csv.includes('"列,B"'), 'Commas should be enclosed in quotes');
  assert.ok(csv.includes('"—"'), 'Null or undefined should fallback to —');

  console.log('✓ 6. CSV BOM and escape tests passed');
}

console.log('─── All widebodyReports pure function tests passed successfully! ───');

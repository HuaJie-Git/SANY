import assert from 'node:assert/strict';
import {
  ELECTRIC_WIDEBODY_DEVICE,
  FUEL_WIDEBODY_DEVICE,
  isWidebodyDevice,
  isElectricWidebody,
  isFuelWidebody,
  getMachineUtilization,
  normalizeDateStr,
  parseDate,
  getPeriodDates,
  safeSum,
  safeAvg,
  getElectricDayStats,
  getFuelDayStats,
  getPeriodicElectricData,
  getPeriodicFuelData,
  getDailySocCurve,
  getDailyFuelCurve,
  getDailyGearDistribution,
  getDailyWorkDistribution,
  generateCsvContent,
  getTrackDataByRange,
} from './widebody.js';

console.log('--- Running Widebody Test Suite ---');

// 1. Device schema & identification (Minimal clean schema, Review F)
assert.equal(ELECTRIC_WIDEBODY_DEVICE.id, 8);
assert.equal(ELECTRIC_WIDEBODY_DEVICE.code, 'POPJ0841016452');
assert.equal(ELECTRIC_WIDEBODY_DEVICE.type, '电动宽体车');
assert.equal(ELECTRIC_WIDEBODY_DEVICE.location, '内蒙古准格尔旗黑岱沟露天煤矿');
assert.equal(ELECTRIC_WIDEBODY_DEVICE.plate, '蒙K·89201电');
assert.equal(
  ELECTRIC_WIDEBODY_DEVICE.archive?.台账信息?.find((f) => f.label === '车牌号')?.value,
  '蒙K·89201电'
);
assert.equal(isWidebodyDevice(ELECTRIC_WIDEBODY_DEVICE), true);
assert.equal(isElectricWidebody(ELECTRIC_WIDEBODY_DEVICE), true);
assert.equal(isFuelWidebody(ELECTRIC_WIDEBODY_DEVICE), false);

assert.equal(FUEL_WIDEBODY_DEVICE.id, 9);
assert.equal(FUEL_WIDEBODY_DEVICE.code, 'KT090AE20208');
assert.equal(FUEL_WIDEBODY_DEVICE.type, '燃油宽体车');
assert.equal(FUEL_WIDEBODY_DEVICE.location, '中国');
assert.equal(isWidebodyDevice(FUEL_WIDEBODY_DEVICE), true);
assert.equal(isElectricWidebody(FUEL_WIDEBODY_DEVICE), false);
assert.equal(isFuelWidebody(FUEL_WIDEBODY_DEVICE), true);

console.log('✓ Device schemas & identification verified');

// 2. Machine utilization formula & boundary cases (Review B: empty string/whitespace must return null)
assert.equal(getMachineUtilization(5.3, 4.5), 117.8);
assert.equal(getMachineUtilization(0.3, 0.14), 214.3);
assert.equal(getMachineUtilization(0, 4.5), 0.0);
assert.equal(getMachineUtilization(5.3, 0), null);
assert.equal(getMachineUtilization(5.3, -1), null);
assert.equal(getMachineUtilization(-0.5, 4.5), null);
assert.equal(getMachineUtilization(null, 4.5), null);
assert.equal(getMachineUtilization(5.3, undefined), null);
assert.equal(getMachineUtilization('invalid', 4.5), null);
assert.equal(getMachineUtilization('', 4.5), null);
assert.equal(getMachineUtilization('   ', 4.5), null);
assert.equal(getMachineUtilization(5.3, ''), null);
assert.equal(getMachineUtilization(5.3, '   '), null);

console.log('✓ Machine utilization calculation & boundary cases verified');

// 3. Date normalizer, parseDate & Leap year / Month length (Review C)
assert.equal(normalizeDateStr('2023-11-23'), '2023-11-23');
assert.equal(normalizeDateStr('2023/11/23'), '2023-11-23');
assert.equal(normalizeDateStr('2024-02-29'), '2024-02-29'); // Leap year valid
assert.equal(normalizeDateStr('2023-02-29'), ''); // Non-leap year invalid day
assert.equal(normalizeDateStr('not-a-date'), '');
assert.equal(normalizeDateStr('1e3-01-01'), ''); // Reject exponential
assert.equal(normalizeDateStr('2023.5-01-01'), ''); // Reject decimal
assert.equal(normalizeDateStr(new Date(2105, 0, 1)), ''); // Reject Date outside 1970-2099
assert.equal(normalizeDateStr(new Date(1960, 0, 1)), ''); // Reject Date outside 1970-2099
assert.equal(normalizeDateStr(new Date(2023, 10, 23)), '2023-11-23');
assert.equal(parseDate('not-a-date'), null); // Does not silently return today

// Period dates test
const dailyDates = getPeriodDates('daily', '2023-11-23');
assert.deepEqual(dailyDates, ['2023-11-23']);

const weeklyDates = getPeriodDates('weekly', '2023-11-23');
assert.equal(weeklyDates.length, 7);
assert.equal(weeklyDates[0], '2023-11-20'); // Monday
assert.equal(weeklyDates[6], '2023-11-26'); // Sunday

const monthlyNov = getPeriodDates('monthly', '2023-11-23');
assert.equal(monthlyNov.length, 30);
assert.equal(monthlyNov[0], '2023-11-01');
assert.equal(monthlyNov[29], '2023-11-30');

const monthlyFebLeap = getPeriodDates('monthly', '2024-02-15');
assert.equal(monthlyFebLeap.length, 29); // 2024 is leap year

const monthlyFebNormal = getPeriodDates('monthly', '2023-02-15');
assert.equal(monthlyFebNormal.length, 28); // 2023 is non-leap year

console.log('✓ Date normalizer, parseDate, weekly range & leap-year month lengths verified');

// 4. Safe aggregation pure functions (PC-REVIEW-002 Point 1: any missing/non-finite returns null, all 0 returns 0)
assert.equal(safeSum([10, null, 20]), null);
assert.equal(safeSum([10, undefined, 20]), null);
assert.equal(safeSum([10, '', 20]), null);
assert.equal(safeSum([10, '   ', 20]), null);
assert.equal(safeSum([null, null]), null);
assert.equal(safeSum([]), null);
assert.equal(safeSum([0, 0]), 0.0);
assert.equal(safeSum([10, 20]), 30.0);
assert.equal(safeAvg(30, 2), 15.00);
assert.equal(safeAvg(null, 2), null);
assert.equal(safeAvg(30, null), null);
assert.equal(safeAvg(30, 0), null);
assert.equal(safeAvg('', 2), null);
assert.equal(safeAvg(30, ''), null);
assert.equal(safeAvg('   ', 2), null);
assert.equal(safeAvg(30, '   '), null);
assert.equal(safeAvg(0, 5), 0.00);

console.log('✓ Safe sum and average (preserving null) verified');

// 5. Baseline stats & determinism (Zero Math.random)
const elecBase = getElectricDayStats('2023-11-23');
assert.equal(elecBase.mileage, 48.6);
assert.equal(elecBase.energy, 186.4);
assert.equal(elecBase.trips, 6);
assert.equal(elecBase.avgEnergy, 3.84);
assert.equal(elecBase.chargeDuration, 1.2);
assert.equal(elecBase.recoveryEnergy, 24.5);
assert.equal(elecBase.workHours, 4.5);
assert.equal(elecBase.idleHours, 0.8);
assert.equal(elecBase.runningHours, 5.3);
assert.equal(elecBase.utilizationRate, 117.8);

const fuelBase = getFuelDayStats('2023-11-23');
assert.equal(fuelBase.fuel, 7.0);
assert.equal(fuelBase.avgHourlyFuel, 50.0);
assert.equal(fuelBase.workHours, 0.14);
assert.equal(fuelBase.idleHours, 0.16);
assert.equal(fuelBase.runningHours, 0.3);
assert.equal(fuelBase.utilizationRate, 214.3);
assert.equal(fuelBase.fuelLevel, 74);

// Determinism test across invocations
const run1 = getElectricDayStats('2023-11-20');
const run2 = getElectricDayStats('2023-11-20');
assert.deepEqual(run1, run2);

console.log('✓ Baseline values & deterministic generation verified');

// 6. Work distribution derived from stats of that date (Review D)
const elecWorkDist = getDailyWorkDistribution('电动宽体车', '2023-11-23');
assert.equal(elecWorkDist.length, 2);
assert.equal(elecWorkDist[0].status, '工作');
assert.equal(elecWorkDist[0].end - elecWorkDist[0].start, 4.5);
assert.equal(elecWorkDist[1].status, '怠速');
assert.equal(parseFloat((elecWorkDist[1].end - elecWorkDist[1].start).toFixed(2)), 0.8);

console.log('✓ Work distribution dynamically derived from date stats verified');

// 7. Periodic aggregation consistency
const elecWeekly = getPeriodicElectricData('weekly', '2023-11-23');
assert.equal(elecWeekly.rows.length, 7);
assert.equal(
  elecWeekly.summary.avgEnergy,
  parseFloat((elecWeekly.summary.energy / elecWeekly.summary.mileage).toFixed(2))
);

const fuelWeekly = getPeriodicFuelData('weekly', '2023-11-23');
assert.equal(fuelWeekly.rows.length, 7);
assert.equal(
  fuelWeekly.summary.avgHourlyFuel,
  parseFloat((fuelWeekly.summary.fuel / fuelWeekly.summary.workHours).toFixed(1))
);

console.log('✓ Periodic aggregations & mathematical consistency verified');

// 8. Curves, gear distribution & CSV
const socCurve = getDailySocCurve('2023-11-23');
assert.equal(socCurve.points.length, 13);
assert.equal(socCurve.points[0].soc, 94.0);
assert.equal(socCurve.points[8].soc, 48.6); // 16:00
assert.equal(socCurve.points[12].soc, 62.0); // 24:00

const fuelCurve = getDailyFuelCurve('2023-11-23');
assert.equal(fuelCurve.points.length, 7);
assert.equal(fuelCurve.currentLevel, 74);
assert.equal(fuelCurve.points[4].level, 74); // 16:00

const gearData = getDailyGearDistribution('2023-11-23');
const gearSum = gearData.gears.reduce((sum, g) => sum + g.percent, 0);
assert.equal(gearSum, 100);

const columns = [
  { key: 'date', label: '日期' },
  { key: 'mileage', label: '里程 (km)' },
  { key: 'energy', label: '电耗 (kWh)' },
];
const testRows = [
  { date: '2023-11-23', mileage: 48.6, energy: 186.4 },
  { date: '2023-11-24', mileage: 50.2, energy: 190.1 },
];
const csv = generateCsvContent(columns, testRows);
assert.ok(csv.startsWith('\uFEFF'));
assert.ok(csv.includes('"日期","里程 (km)","电耗 (kWh)"'));
assert.ok(csv.includes('"2023-11-23","48.6","186.4"'));
assert.equal(generateCsvContent(columns, []), '');

console.log('✓ Curves, gear distribution & CSV verified');

// 9. Electric widebody track data generation (V5-R02 / A02 / V5-REVIEW-001)
// 9.1 Proportional 10h test
const track = getTrackDataByRange('2023-11-23', '08:00', '2023-11-23', '18:00');
assert.equal(track.isValid, true);
assert.equal(track.startDate, '2023-11-23');
assert.equal(track.durationHours, 10.0);
assert.equal(track.totalMileage, '20.3');
assert.equal(track.totalEnergy, '77.7');
assert.equal(track.recoveryEnergy, '10.2');
assert.equal(track.segments.length, 4);
assert.equal(track.waypoints.length, 5);
assert.equal(track.waypoints[0].label, '起点(采场)');
assert.equal(track.waypoints[4].label, '终点(破碎站)');

// 9.2 Full day 24h test (strictly matches daily report 48.6km / 186.4kWh / 24.5kWh)
const fullTrack = getTrackDataByRange('2023-11-23', '00:00', '2023-11-23', '24:00');
assert.equal(fullTrack.isValid, true);
assert.equal(fullTrack.durationHours, 24);
assert.equal(fullTrack.totalMileage, '48.6');
assert.equal(fullTrack.totalEnergy, '186.4');
assert.equal(fullTrack.recoveryEnergy, '24.5');

// 9.3 With-seconds timestamp test (V5-FINAL-001: prevents double seconds :00:00 and Invalid Date)
const secTrack = getTrackDataByRange('2023-11-23', '00:00:00', '2023-11-23', '23:59:59');
assert.equal(secTrack.isValid, true);
assert.ok(secTrack.startDateTime.includes('T'));
assert.ok(secTrack.endDateTime.includes('T'));
assert.ok(!isNaN(new Date(secTrack.startDateTime).getTime()));
assert.ok(!isNaN(new Date(secTrack.endDateTime).getTime()));
assert.equal(secTrack.totalMileage, '48.6');

// 9.4 Boundary validation: equal / reverse time / zero interval
const invalidEqual = getTrackDataByRange('2023-11-23', '08:00', '2023-11-23', '08:00');
assert.equal(invalidEqual.isValid, false);
assert.equal(invalidEqual.error, '结束时间必须晚于开始时间');
assert.equal(invalidEqual.totalMileage, '0.0');

const invalidReverse = getTrackDataByRange('2023-11-24', '08:00', '2023-11-23', '08:00');
assert.equal(invalidReverse.isValid, false);
assert.equal(invalidReverse.error, '结束时间必须晚于开始时间');

// 9.4 Span > 31 days
const invalidSpan = getTrackDataByRange('2023-10-01', '00:00', '2023-11-15', '00:00');
assert.equal(invalidSpan.isValid, false);
assert.equal(invalidSpan.error, '查询跨度不能超过31天');

console.log('✓ Electric widebody track data & strict validation verified');

console.log('\nALL 9 TEST SUITES PASSED CLEANLY!\n');

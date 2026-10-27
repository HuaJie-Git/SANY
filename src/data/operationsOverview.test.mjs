import test from 'node:test';
import assert from 'node:assert/strict';
import { createOperationsPreview, summarizeOperations } from './operationsOverview.js';

const now = '2026-10-27T04:00:00Z';
const options = { now, accountId: 'account-a', timeZone: 'Asia/Shanghai' };
const device = (extra = {}) => ({
  id: 'device-a', accountId: 'account-a', isBound: true, isIot: true, inRegister: true,
  energyType: 'diesel', registeredAt: '2026-10-27T01:00:00Z',
  dailyReports: [{ reportedAt: now, totalHours: 10, workHours: 6, drivingHours: 2, idleHours: 2, fuelLitres: 20 }],
  snapshots: [{ reportedAt: now, status: '离线', fuelPercent: 24 }], ...extra,
});
const summarize = (rows, extra = {}) => summarizeOperations(rows, { ...options, ...extra });

test('仅当前账号已绑定已物联设备；不限机型、启用状态或当前在线状态', () => {
  const excluded = [
    { accountId: 'another-account' }, { isBound: false }, { isIot: false },
    { isBound: undefined }, { isIot: undefined }, { inRegister: false }, { registeredAt: '2026-10-28T00:00:00Z' },
  ].map((extra, index) => device({ id: `excluded-${index}`, ...extra }));
  const result = summarize([device({ enabled: false, model: '任意机型' }), ...excluded]);
  assert.equal(result.totalHours, 10);
  assert.equal(result.totalFuel, 20);
  assert.equal(result.statuses.find((item) => item.label === '离线').count, 1);
  assert.equal(result.fuelDeviceCount, 1);
});

test('工时求和、运行=工作+行驶、占比先计算后展示', () => {
  const result = summarize([device(), device({ id: 'device-b' })]);
  assert.deepEqual([result.totalHours, result.runningHours, result.idleHours, result.runningPercent, result.idlePercent], [20, 16, 4, 80, 20]);
  const empty = summarize([]);
  assert.deepEqual([empty.totalHours, empty.totalFuel, empty.totalElectricity, empty.runningPercent, empty.idlePercent], [0, 0, 0, 0, 0]);
});

test('只取当日最新累计明细；合法0计台数、无效最新不回补旧明细', () => {
  const reports = [
    { reportedAt: '2026-10-27T02:00:00Z', fuelLitres: 15 },
    { reportedAt: now, fuelLitres: 0 },
    { reportedAt: '2026-10-26T02:00:00Z', fuelLitres: 100 },
    { reportedAt: '2026-10-27T05:00:00Z', fuelLitres: 200 },
  ];
  assert.equal(summarize([device({ dailyReports: reports })]).fuelDeviceCount, 1);
  assert.equal(summarize([device({ dailyReports: reports })]).totalFuel, 0);
  for (const invalid of [undefined, null, NaN, Infinity, -1, '2']) {
    const result = summarize([device({ dailyReports: [...reports, { reportedAt: now, fuelLitres: invalid }] })]);
    assert.equal(result.fuelDeviceCount, 0);
    assert.equal(result.totalFuel, 0);
  }
});

test('设备重复返回合并明细，只计算一次；解绑和能源变更以最新资料为准', () => {
  const original = device({ updatedAt: '2026-10-27T02:00:00Z' });
  assert.deepEqual(summarize([original, original]), summarize([original]));
  const newer = device({ updatedAt: now, isBound: false });
  assert.equal(summarize([original, newer]).totalFuel, 0);
  const electric = device({ updatedAt: now, energyType: 'electricity', dailyReports: [{ reportedAt: now, fuelLitres: 50, electricityKwh: 30 }], snapshots: [{ reportedAt: now, batteryPercent: 75, status: '工作' }] });
  const result = summarize([electric, original]);
  assert.deepEqual([result.totalFuel, result.totalElectricity, result.fuelDeviceCount, result.electricityDeviceCount], [0, 30, 0, 1]);
});

test('四档整数边界互斥，0有效；未上报或无效余量不计入', () => {
  const values = [0, 24, 25, 49, 50, 74, 75, 100, undefined, -1, 101, NaN, 24.5];
  const rows = values.map((fuelPercent, index) => device({ id: `range-${index}`, snapshots: [{ reportedAt: now, fuelPercent }] }));
  assert.deepEqual(summarize(rows).fuelCounts, [2, 2, 2, 2]);
  assert.deepEqual(summarize(rows.map((row) => ({ ...row, energyType: 'electricity', snapshots: row.snapshots.map((snapshot) => ({ ...snapshot, batteryPercent: snapshot.fuelPercent })) }))).electricityCounts, [2, 2, 2, 2]);
});

test('当日无耗量仍保留历史最新快照；加油后只保留最新档位', () => {
  const result = summarize([device({ dailyReports: [], snapshots: [
    { reportedAt: '2026-10-26T01:00:00Z', fuelPercent: 10, status: '工作' },
    { reportedAt: '2026-10-26T02:00:00Z', fuelPercent: 90, status: '怠速' },
    { reportedAt: '2026-10-28T00:00:00Z', fuelPercent: 30, status: '离线' },
  ] })]);
  assert.equal(result.totalFuel, 0);
  assert.equal(result.fuelDeviceCount, 0);
  assert.deepEqual(result.fuelCounts, [0, 0, 0, 1]);
  assert.equal(result.statuses.find((item) => item.label === '怠速').count, 1);
  assert.equal(summarize([device({ dailyReports: [], snapshots: [] })]).statuses.reduce((sum, item) => sum + item.count, 0), 0);
});

test('自然日使用账号时区；新增只计当前日，不用历史累计值补造', () => {
  const row = device({ dailyReports: [{ reportedAt: '2026-10-26T23:30:00Z', fuelLitres: 12 }] });
  assert.equal(summarize([row]).totalFuel, 12);
  assert.equal(summarize([row], { timeZone: 'America/New_York' }).totalFuel, 0);
  const dst = { now: '2026-11-01T07:30:00Z', timeZone: 'America/New_York' };
  const reports = [{ reportedAt: '2026-11-01T05:30:00Z', fuelLitres: 5 }, { reportedAt: '2026-11-01T06:30:00Z', fuelLitres: 8 }];
  assert.equal(summarize([device({ dailyReports: reports })], dst).totalFuel, 8);
});

test('演示汇总由12台设备明细派生，增删设备会同步变化', () => {
  const rows = createOperationsPreview(new Date(now), options.accountId);
  const result = summarize(rows);
  assert.deepEqual([result.totalHours, result.totalFuel, result.totalElectricity, result.fuelDeviceCount, result.electricityDeviceCount], [75, 696, 66, 10, 2]);
  assert.equal(summarize(rows.slice(1)).totalFuel, 600);
});

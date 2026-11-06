import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { resolveCumulativeMetrics } from './cumulativeMetrics.js';

// 使用页面的真实字段定义验证别名只取字段，不带走演示值。
const source = readFileSync(new URL('./WorkConditionDetail.jsx', import.meta.url), 'utf8');
const dataSource = source.slice(source.indexOf('const PURE_ELECTRIC_MIXER_DATA'), source.indexOf('const Icon ='));
const machineData = JSON.parse(JSON.stringify(runInNewContext(`${dataSource}; MACHINE_DATA`, { getDailyWorkDistribution: () => [] })));
const resolve = (device) => resolveCumulativeMetrics(device, machineData);

const cases = [
  ['三一压路机', ['总工作时间', '总油耗']],
  ['平地机', ['总工作时间', '总油耗']],
  ['三一摊铺机', ['总油耗', '摊铺距离']],
  ['三一泵车', ['总泵送方量', '总油耗', '总工作时间']],
  ['三一拖泵', ['总泵送次数', '总油耗', '总泵送方量', '总工作时间']],
  ['三一车载泵', ['总油耗', '总泵送方量', '总工作时间']],
  ['三一铣刨机', ['铣刨距离', '总油耗', '发动机小时数']],
  ['三一挖掘机', ['累计工时']],
  ['三一起重机', ['上车工作时间', '作业油耗', '吊载次数', '总里程']],
];

for (const [name, labels] of cases) {
  test(`${name}：字段正确，缺失不借演示值`, () => {
    const items = resolve({ name, code: 'CURRENT-DEVICE', todayHours: '8h', todayEnergy: '100L', auditCounts: { exception: 9 } });
    assert.deepEqual(items.map(([label]) => label), labels);
    assert.ok(items.every(([, value]) => value === '—'));
  });
}

test('当前累计值保留 0、千分位与精度，含单位时不重复单位', () => {
  assert.deepEqual(resolve({ name: '三一拖泵', cumulative: {
    totalPumpingCount: 0, totalFuel: '0L', totalPumpingVolume: '12,400m³', totalWorkHours: '1520.50 h',
  } }), [
    ['总泵送次数', '0', '次'], ['总油耗', '0', 'L'], ['总泵送方量', '12,400', 'm³'], ['总工作时间', '1520.50', 'h'],
  ]);
});

test('空值、占位符、非数值、非有限值和错误单位不伪装成 0', () => {
  for (const value of [null, undefined, '', ' ', '-', '--', '—', NaN, Infinity, 'Infinity', true, {}, [], '3kWh', '1,2', '12abc']) {
    assert.equal(resolve({ name: '压路机', cumulative: { totalFuel: value } })[1][1], '—');
  }
});

test('当前设备累计数组和中文字段可解析，不使用 realtime/today/顶层同名字段', () => {
  assert.deepEqual(resolve({ name: '三一挖掘机', cumulative: [['累计工时', 0, 'h']] }), [['累计工时', '0', 'h']]);
  assert.equal(resolve({ name: '起重机', cumulative: { 吊载次数: '0' } })[2][1], '0');
  assert.ok(resolve({ name: '压路机', totalFuel: 99, today: { totalFuel: 99 }, realtime: { totalFuel: 99 } }).every(([, value]) => value === '—'));
});

test('切换设备后不残留累计值，模板与输入不被改写', () => {
  const snapshot = JSON.stringify(machineData);
  const first = Object.freeze({ name: '压路机', cumulative: Object.freeze({ totalFuel: 12 }) });
  assert.equal(resolve(first)[1][1], '12');
  assert.equal(resolve({ name: '压路机', code: 'SECOND' })[1][1], '—');
  assert.deepEqual(resolve({ name: '未知设备', cumulative: { totalFuel: 12 } }), []);
  assert.equal(JSON.stringify(machineData), snapshot);
});

test('仅靠已知型号可匹配，未知、港机、普通装载机不冒充平地机/电动装载机', () => {
  assert.deepEqual(resolve({ code: 'SSR260-6012' }).map(([label]) => label), cases[0][1]);
  assert.deepEqual(resolve({ model: 'SY014CF' }), [['累计工时', '—', 'h']]);
  assert.deepEqual(resolve({ name: 'CAT 320GC 挖掘机' }), [['累计工时', '—', 'h']]);
  for (const device of [null, {}, { name: '港口机械' }, { name: '装载机' }, { code: 'SSR-UNKNOWN' }]) {
    assert.deepEqual(resolve(device), []);
  }
});

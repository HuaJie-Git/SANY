import React, { useMemo, useState } from 'react';
import { buildDaySegments, getPrimaryWorkStatus, WORK_STATUS_COLORS } from './workStatusConfig';

const PERIODS = [
  { key: 'daily', label: '日视图' },
  { key: 'weekly', label: '周视图' },
  { key: 'monthly', label: '月视图' },
];

const number = (value, fallback = 0) => {
  const n = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : fallback;
};

const one = (value) => number(value).toFixed(1);

const typeConfig = (device) => {
  const type = device?.type;
  const paver = type === '摊铺机';
  const roller = type === '压路机';
  const METRICS = {
    摊铺机: [['摊铺距离', 'm'], ['油耗', 'L'], ['每小时工作油耗', 'L/h'], ['工时', 'h'], ['怠速工时', 'h']],
    压路机: [['油耗', 'L'], ['工时', 'h'], ['怠速工时', 'h']],
    平地机: [['油耗', 'L'], ['每小时工作油耗', 'L/h'], ['工时', 'h'], ['怠速工时', 'h']],
    泵车: [['油耗', 'L'], ['每小时工作油耗', 'L/h'], ['工时', 'h'], ['怠速工时', 'h'], ['泵送方量', 'm³']],
    拖泵: [['油耗', 'L'], ['每小时工作油耗', 'L/h'], ['工时', 'h'], ['怠速工时', 'h'], ['泵送方量', 'm³'], ['泵送次数', '次']],
    车载泵: [['油耗', 'L'], ['每小时工作油耗', 'L/h'], ['工时', 'h'], ['怠速工时', 'h'], ['泵送方量', 'm³']],
    铣刨机: [['油耗', 'L'], ['每小时工作油耗', 'L/h'], ['工时', 'h'], ['怠速工时', 'h'], ['铣刨距离', 'm']],
  };
  const amountLabel = type === '铣刨机' ? '铣刨距离' : ['泵车', '拖泵', '车载泵'].includes(type) ? '泵送方量' : paver ? '摊铺距离' : null;
  return {
    isPaver: paver,
    isRoller: roller,
    metrics: METRICS[type] || METRICS['平地机'],
    amountLabel,
    amountUnit: amountLabel && (amountLabel === '摊铺距离' || amountLabel === '铣刨距离') ? 'm' : amountLabel ? 'm³' : null,
    statusNames: paver ? ['行驶', '怠速'] : ['工作', '怠速'],
  };
};

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
};

const shiftDate = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const Icon = ({ name, size = 15 }) => {
  const paths = {
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 20h16" /></>,
    chart: <><path d="M4 19V5M4 19h16" /><path d="m7 15 3-4 3 2 4-6" /></>,
    table: <><path d="M4 4h16v16H4z" /><path d="M4 10h16M10 4v16" /></>,
    chevron: <path d="m9 6 6 6-6 6" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

function SectionCard({ title, icon = 'chart', children, className = '' }) {
  return (
    <section className={`report-card ${className}`}>
      <div className="report-card-title">
        <span><Icon name={icon} size={12} /></span>
        <strong>{title}</strong>
      </div>
      {children}
    </section>
  );
}

function buildTrend(device, period) {
  const source = period === 'weekly' ? device?.weeklyFuelTrend : device?.monthlyFuelTrend;
  const count = period === 'weekly' ? 7 : 30;
  const values = Array.from({ length: count }, (_, i) => {
    const raw = source?.[i]?.value ?? source?.[i] ?? 0;
    return number(raw, 0);
  });
  const work = values.map((fuel, i) => Number((fuel * (0.34 + ((i % 4) * 0.025))).toFixed(1)));
  const idle = values.map((fuel, i) => Number((fuel * (0.055 + ((i % 3) * 0.01))).toFixed(1)));
  return { fuel: values, work, idle, hourly: values.map((fuel, i) => Number((fuel / (work[i] || 1)).toFixed(2))) };
}

function buildLabels(period) {
  if (period === 'weekly') return ['11/17', '11/18', '11/19', '11/20', '11/21', '11/22', '11/23'];
  return Array.from({ length: 30 }, (_, i) => `11/${String(i + 1).padStart(2, '0')}`);
}

function TooltipLineChart({ series, labels, leftUnit = '', rightUnit = '' }) {
  const [hover, setHover] = useState(null);
  const W = 760;
  const H = 218;
  const pad = { top: 26, right: 46, bottom: 34, left: 42 };
  const width = W - pad.left - pad.right;
  const height = H - pad.top - pad.bottom;
  const maxLeft = Math.max(...series.filter((s) => s.axis !== 'right').flatMap((s) => s.data), 1) * 1.18;
  const maxRight = Math.max(...series.filter((s) => s.axis === 'right').flatMap((s) => s.data), 1) * 1.18;
  const count = labels.length;
  const x = (i) => pad.left + (count <= 1 ? width / 2 : (i / (count - 1)) * width);
  const y = (v, axis) => pad.top + height - ((v / (axis === 'right' ? maxRight : maxLeft)) * height);
  const step = count > 10 ? Math.ceil(count / 7) : 1;
  const active = hover == null ? null : { x: x(hover), left: Math.min(Math.max((x(hover) / W) * 100, 18), 82) };
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 42, top: 0, fontSize: 11, color: '#8b919b' }}>{leftUnit}</div>
      {series.some((s) => s.axis === 'right') && <div style={{ position: 'absolute', right: 45, top: 0, fontSize: 11, color: '#8b919b' }}>{rightUnit}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="218" style={{ display: 'block', overflow: 'visible' }} onMouseLeave={() => setHover(null)}>
        {[0, .25, .5, .75, 1].map((tick) => {
          const yy = pad.top + height * (1 - tick);
          return <g key={tick}><line x1={pad.left} y1={yy} x2={W - pad.right} y2={yy} stroke="#e9edf2" strokeWidth="1" /><text x={pad.left - 8} y={yy + 4} textAnchor="end" fontSize="10" fill="#a0a6af">{(maxLeft * tick).toFixed(0)}</text>{series.some((s) => s.axis === 'right') && <text x={W - pad.right + 8} y={yy + 4} fontSize="10" fill="#a0a6af">{(maxRight * tick).toFixed(1)}</text>}</g>;
        })}
        {series.map((item) => {
          const points = item.data.map((value, i) => `${x(i).toFixed(1)},${y(value, item.axis).toFixed(1)}`).join(' ');
          return <g key={item.key}><polyline points={points} fill="none" stroke={item.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />{item.data.map((value, i) => <circle key={i} cx={x(i)} cy={y(value, item.axis)} r={hover === i ? 4 : 2.8} fill="#fff" stroke={item.color} strokeWidth="2" onMouseEnter={() => setHover(i)} />)}</g>;
        })}
        {labels.map((label, i) => i % step === 0 && <text key={label} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#9ca3af">{label}</text>)}
        {hover != null && <line x1={x(hover)} y1={pad.top} x2={x(hover)} y2={pad.top + height} stroke="#9aa8ba" strokeDasharray="4 4" />}
        <rect x={pad.left} y={pad.top} width={width} height={height} fill="transparent" onMouseMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); const ratio = (event.clientX - rect.left) / rect.width; setHover(Math.min(count - 1, Math.max(0, Math.round(ratio * (count - 1))))); }} />
      </svg>
      {active && (
        <div style={{ position: 'absolute', top: 56, left: `${active.left}%`, transform: 'translateX(-50%)', minWidth: 165, padding: '12px 15px', borderRadius: 7, background: '#fff', boxShadow: '0 8px 24px rgba(31,41,55,.16)', zIndex: 3, pointerEvents: 'none' }}>
          <div style={{ fontSize: 14, color: '#333b46', marginBottom: 8 }}>{labels[hover]}</div>
          {series.map((item) => <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, lineHeight: '22px', color: '#4c5561' }}><i style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, display: 'inline-block' }} /> <span style={{ flex: 1 }}>{item.label}</span><strong style={{ color: '#303640' }}>{item.data[hover]}{item.unit}</strong></div>)}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: -4, color: '#707782', fontSize: 11 }}>{series.map((item) => <span key={item.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><i style={{ width: 9, height: 9, borderRadius: '50%', background: item.color }} />{item.label}</span>)}</div>
    </div>
  );
}

function GanttChart({ workHours, idleHours, device }) {
  const [hover, setHover] = useState(null);
  const primary = getPrimaryWorkStatus(device);
  const segments = useMemo(() => buildDaySegments(workHours, idleHours, primary), [workHours, idleHours, primary]);
  const W = 1200;
  const hourW = W / 24;
  const ticks = Array.from({ length: 13 }, (_, i) => i * 2);
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox="0 0 1200 78" width="100%" height="78" preserveAspectRatio="none" style={{ display: 'block' }} onMouseLeave={() => setHover(null)}>
        {ticks.map((h) => <text key={h} x={h === 0 ? 6 : h === 24 ? W - 12 : h * hourW} y="13" textAnchor={h === 0 ? 'start' : h === 24 ? 'end' : 'middle'} fontSize="10" fill="#9ca3af">{h === 24 ? '24(h)' : h}</text>)}
        <line x1="0" y1="22" x2={W} y2="22" stroke="#e5e7eb" />
        {segments.map((segment, index) => <rect key={index} x={segment.start * hourW} y="30" width={Math.max((segment.end - segment.start) * hourW, 2)} height="24" rx={index === 0 || index === segments.length - 1 ? 3 : 0} fill={WORK_STATUS_COLORS[segment.status] || WORK_STATUS_COLORS['其他']} onMouseEnter={() => segment.status === '其他' ? setHover(null) : setHover({ segment, index })} />)}
        <rect x="0" y="30" width={W} height="24" fill="transparent" pointerEvents="none" />
      </svg>
      {hover && <div style={{ position: 'absolute', left: `${Math.min(86, Math.max(14, ((hover.segment.start + hover.segment.end) / 48) * 100))}%`, top: 24, transform: 'translateX(-50%)', padding: '7px 10px', borderRadius: 6, background: '#303640', color: '#fff', fontSize: 11, whiteSpace: 'nowrap', pointerEvents: 'none' }}>{hover.segment.status === '其他' ? '无状态数据' : hover.segment.status} · {hover.segment.start.toFixed(1)}:00 - {hover.segment.end.toFixed(1)}:00</div>}
    </div>
  );
}

function WorkDistributionGrid({ trend, period, device }) {
  const primary = getPrimaryWorkStatus(device);
  const days = period === 'weekly' ? 7 : 30;
  const rows = Array.from({ length: days }, (_, index) => {
    const work = trend.work[index] || 0;
    const idle = trend.idle[index] || 0;
    const total = Math.max(work + idle, 1);
    return { label: period === 'weekly' ? ['一', '二', '三', '四', '五', '六', '日'][index] : String(index + 1), work, idle, total };
  });
  const ticks = Array.from({ length: 13 }, (_, index) => index * 2);
  return <div className={`work-distribution ${period}`}><div className="work-time-scale"><span />{ticks.map((tick) => <b key={tick} style={{ left: `${tick / 24 * 100}%` }}>{tick === 24 ? '24' : tick}</b>)}</div>{rows.map((row, index) => {
    const start = 5 + (index % 4);
    const work = Math.min(row.work, 12);
    const idle = Math.min(row.idle, 3);
    const firstWork = work * .46;
    const idleStart = Math.min(start + firstWork + .45, 22);
    const secondStart = Math.min(idleStart + idle + .65, 23);
    const secondWork = Math.min(work - firstWork, 24 - secondStart);
    return <div className="work-distribution-row" key={row.label}><span>{row.label}</span><div><i style={{ left: `${start / 24 * 100}%`, width: `${firstWork / 24 * 100}%`, background: WORK_STATUS_COLORS[primary] }} /><i style={{ left: `${idleStart / 24 * 100}%`, width: `${idle / 24 * 100}%`, background: WORK_STATUS_COLORS.怠速 }} />{secondWork > 0 && <i style={{ left: `${secondStart / 24 * 100}%`, width: `${secondWork / 24 * 100}%`, background: WORK_STATUS_COLORS[primary] }} />}</div></div>;
  })}<div className="work-distribution-legend"><span><i style={{ background: WORK_STATUS_COLORS[primary] }} />{primary}</span><span><i style={{ background: WORK_STATUS_COLORS.怠速 }} />怠速</span></div></div>;
}

function CategoryBars({ trend, period, device }) {
  const primary = getPrimaryWorkStatus(device);
  const days = period === 'weekly' ? 7 : 14;
  const step = Math.ceil(trend.work.length / days);
  const values = Array.from({ length: days }, (_, index) => {
    const work = trend.work[index * step] || 0;
    const idle = trend.idle[index * step] || 0;
    return { work, idle, label: period === 'weekly' ? ['11/17', '11/18', '11/19', '11/20', '11/21', '11/22', '11/23'][index] : `11/${String(index * step + 1).padStart(2, '0')}` };
  });
  const max = Math.max(...values.map((item) => item.work + item.idle), 1);
  return <div className="category-bars-wrap"><div style={{ height: 166, display: 'flex', alignItems: 'flex-end', gap: period === 'weekly' ? 18 : 8, padding: '10px 10px 22px', borderBottom: '1px solid #e5e7eb' }}>{values.map((item) => <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}><div style={{ width: '100%', maxWidth: 28, height: `${((item.work + item.idle) / max) * 125}px`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}><span style={{ height: `${(item.idle / Math.max(item.work + item.idle, 1)) * 100}%`, background: WORK_STATUS_COLORS['怠速'], minHeight: item.idle ? 3 : 0 }} /><span style={{ height: `${(item.work / Math.max(item.work + item.idle, 1)) * 100}%`, background: WORK_STATUS_COLORS[primary] }} /></div><span style={{ fontSize: 9, color: '#9ca3af', whiteSpace: 'nowrap' }}>{item.label}</span></div>)}</div><div className="category-legend"><span><i style={{ background: WORK_STATUS_COLORS[primary] }} />{primary}</span><span><i style={{ background: WORK_STATUS_COLORS.怠速 }} />怠速</span></div></div>;
}

function Calendar({ trend, period, device }) {
  const config = typeConfig(device);
  const count = period === 'weekly' ? 7 : 30;
  const labels = period === 'weekly' ? ['日', '一', '二', '三', '四', '五', '六'] : ['日', '一', '二', '三', '四', '五', '六'];
  return <div className={`run-calendar ${period}`}><div className="calendar-weekdays">{labels.map((label) => <span key={label}>{label}</span>)}</div><div className="calendar-days">{Array.from({ length: count }, (_, i) => { const fuel = trend.fuel[i] || 0; const amount = config.amountLabel ? (config.amountUnit === 'm' ? Math.round(fuel * 33.8) : Number((fuel * 0.2).toFixed(1))) : null; return <div className={fuel ? 'has-data' : ''} key={i}><b>{i + 1}</b><span>{amount != null ? `${amount}${config.amountUnit}` : '--'}</span><small>{fuel ? `${fuel}L` : '--'}</small></div>; })}</div><div className="calendar-legend"><i />{config.amountLabel ? `每日${config.amountLabel}` : '每日油耗'}</div></div>;
}

function metricData(device, period, trend) {
  const config = typeConfig(device);
  const type = device?.type;
  const totalFuel = number(device?.cumulative?.totalFuel);
  const workHours = number(device?.today?.workHours);
  const idleHours = number(device?.today?.idleHours);
  const hourly = (fuel, work) => (work ? fuel / work : null);
  const isAmountType = type === '铣刨机' || type === '泵车' || type === '拖泵' || type === '车载泵';
  if (period === 'daily') {
    const amount = number(device?.today?.pumpingVolume ?? device?.today?.millingDistance);
    const pumpCount = number(device?.today?.pumpingCount);
    const base = [totalFuel, hourly(totalFuel, workHours), workHours, idleHours];
    const values = config.isPaver ? [number(device?.cumulative?.['摊铺距离']), ...base] : config.isRoller ? [totalFuel, workHours, idleHours] : type === '拖泵' ? [...base, amount, pumpCount] : isAmountType ? [...base, amount] : base;
    return config.metrics.map(([label, unit], index) => ({ label, unit, value: values[index] }));
  }
  const fuel = trend.fuel.reduce((sum, value) => sum + value, 0);
  const work = trend.work.reduce((sum, value) => sum + value, 0);
  const idle = trend.idle.reduce((sum, value) => sum + value, 0);
  const factor = config.amountUnit === 'm' ? 33.8 : 0.2;
  const distance = Math.round(fuel * (config.amountUnit ? factor : 0));
  const pumpCount = Math.round(fuel * 0.5);
  const base = [fuel, hourly(fuel, work), work, idle];
  const values = config.isPaver ? [distance, ...base] : config.isRoller ? [fuel, work, idle] : type === '拖泵' ? [...base, distance, pumpCount] : isAmountType ? [...base, distance] : base;
  return config.metrics.map(([label, unit], index) => ({ label, unit, value: values[index] }));
}

function ListView({ rows, columns, onExport }) {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const total = Math.max(rows.length, 101);
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(total / pageSize);
  return <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(31,41,55,.06)', overflow: 'hidden' }}><div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 16px 12px', gap: 8 }}><button type="button" onClick={onExport} style={{ border: 'none', borderRadius: 4, background: '#e60012', color: '#fff', padding: '7px 16px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="download" size={14} />导出</button></div><div style={{ overflowX: 'auto' }}><table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', fontSize: 13 }}><thead><tr style={{ background: '#f5f6f8' }}>{columns.map((column) => <th key={column.key} style={{ padding: '10px 16px', textAlign: 'left', color: '#68707d', fontWeight: 600, borderBottom: '1px solid #e4e7eb', whiteSpace: 'nowrap' }}>{column.label}<span style={{ marginLeft: 8, color: '#a0a6af' }}>↕</span></th>)}</tr></thead><tbody>{visibleRows.map((row, index) => <tr key={row.id} style={{ background: index % 2 ? '#fbfcfd' : '#fff' }}>{columns.map((column) => <td key={column.key} style={{ padding: '12px 16px', color: '#4b5563', borderBottom: '1px solid #eef0f3', whiteSpace: 'nowrap' }}>{row[column.key] ?? '--'}</td>)}</tr>)}</tbody></table></div><div style={{ padding: '18px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#68707d', fontSize: 12 }}><span>共 {total} 条数据</span><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} style={{ border: 'none', background: 'transparent', color: '#88919e', cursor: 'pointer', transform: 'rotate(180deg)' }}><Icon name="chevron" size={14} /></button>{[1, 2, 3, 4, 5].map((item) => <button key={item} type="button" onClick={() => setPage(item)} style={{ minWidth: 28, height: 28, border: '1px solid #dfe3e8', borderRadius: 4, background: page === item ? '#e60012' : '#fff', color: page === item ? '#fff' : '#68707d', cursor: 'pointer' }}>{item}</button>)}<span>…</span><button type="button" onClick={() => setPage(totalPages)} style={{ minWidth: 28, height: 28, border: '1px solid #dfe3e8', borderRadius: 4, background: '#fff', color: '#68707d', cursor: 'pointer' }}>{totalPages}</button><button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} style={{ border: 'none', background: 'transparent', color: '#88919e', cursor: 'pointer' }}><Icon name="chevron" size={14} /></button><span style={{ marginLeft: 12 }}>跳至</span><input value={page} onChange={(event) => setPage(Math.min(totalPages, Math.max(1, Number(event.target.value) || 1)))} style={{ width: 42, height: 28, border: '1px solid #dfe3e8', borderRadius: 4, textAlign: 'center', color: '#4b5563' }} /><span>/ {totalPages} 页</span></div></div></div>;
}

export default function StatisticsReport({ device }) {
  const [mode, setMode] = useState('chart');
  const [period, setPeriod] = useState('daily');
  const [dateOffset, setDateOffset] = useState(0);
  const [toast, setToast] = useState('');
  const baseDate = useMemo(() => shiftDate(new Date(2025, 10, 17), dateOffset * (period === 'daily' ? 1 : period === 'weekly' ? 7 : 30)), [dateOffset, period]);
  const trend = useMemo(() => buildTrend(device, period === 'daily' ? 'weekly' : period), [device, period]);
  const config = typeConfig(device);
  const metrics = useMemo(() => metricData(device, period, trend), [device, period, trend]);
  const labels = period === 'daily' ? ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22', '24'] : buildLabels(period);
  const dateLabel = period === 'daily' ? formatDate(baseDate) : period === 'weekly' ? `${formatDate(baseDate)} - ${formatDate(shiftDate(baseDate, 6))}` : `${baseDate.getFullYear()}/${String(baseDate.getMonth() + 1).padStart(2, '0')}`;
  const columns = [{ key: 'date', label: '日期' }, ...config.metrics.map(([label]) => ({ key: label, label }))];
  const rows = Array.from({ length: period === 'daily' ? 1 : period === 'weekly' ? 7 : 30 }, (_, index) => {
    const fuel = trend.fuel[index] || 0;
    const work = trend.work[index] || 0;
    const type = device?.type;
    let values;
    if (config.isPaver) {
      values = { '摊铺距离': `${Math.round(fuel * 33.8)}m`, 油耗: `${fuel}L`, 每小时工作油耗: `${work ? one(fuel / work) : '--'}L/h`, 工时: `${one(work)}h`, 怠速工时: `${one(trend.idle[index] || 0)}h` };
    } else if (config.isRoller) {
      values = { 油耗: `${fuel}L`, 工时: `${one(work)}h`, 怠速工时: `${one(trend.idle[index] || 0)}h` };
    } else {
      values = { 油耗: `${fuel}L`, 每小时工作油耗: `${work ? one(fuel / work) : '--'}L/h`, 工时: `${one(work)}h`, 怠速工时: `${one(trend.idle[index] || 0)}h` };
      if (type === '铣刨机') values['铣刨距离'] = `${Math.round(fuel * 33.8)}m`;
      else if (type === '泵车' || type === '拖泵' || type === '车载泵') values['泵送方量'] = `${Number((fuel * 0.2).toFixed(1))}m³`;
      if (type === '拖泵') values['泵送次数'] = `${Math.round(fuel * 0.5)}次`;
    }
    return { id: index, date: period === 'daily' ? formatDate(baseDate) : period === 'weekly' ? `2025/11/${17 + index}` : `2025/11/${String(index + 1).padStart(2, '0')}`, ...values };
  });
  const showToast = (message) => { setToast(message); window.setTimeout(() => setToast(''), 1800); };
  const trendSeries = [
    { key: 'hourly', label: '平均每小时油耗', unit: ' L/h', color: '#ff862d', data: trend.hourly },
  ];
  return <div className="statistics-report">
    <div className="report-toolbar">
      <div className="period-tabs">{PERIODS.map((item) => <button key={item.key} type="button" className={period === item.key ? 'is-active' : ''} onClick={() => { setPeriod(item.key); setDateOffset(0); }}>{item.label}</button>)}</div>
      <div className="date-controls"><button type="button" aria-label="上一周期" onClick={() => setDateOffset((value) => value - 1)}>‹</button><div><Icon name="calendar" size={12} />{dateLabel}</div><button type="button" aria-label="下一周期" onClick={() => setDateOffset((value) => value + 1)}>›</button></div>
      <div className="report-view-controls"><button type="button" title="图表视图" className={mode === 'chart' ? 'is-active' : ''} onClick={() => setMode('chart')}><Icon name="chart" size={13} />图表</button><button type="button" title="列表视图" className={mode === 'list' ? 'is-active' : ''} onClick={() => setMode('list')}><Icon name="table" size={13} />列表</button></div>
    </div>
    {mode === 'chart' ? <div className={`report-chart-layout ${period}`}>
      <SectionCard title="指标概览" className="metric-overview"><div className={`report-metrics columns-${metrics.length}`}>{metrics.map((metric) => <div className="report-metric" key={metric.label}><div><strong>{metric.value == null ? '--' : one(metric.value)}</strong><span>{metric.unit}</span></div><small>{metric.label}</small></div>)}</div></SectionCard>
      {period === 'daily' && <SectionCard title="开工时段分布" className="daily-distribution"><GanttChart workHours={number(device?.today?.workHours)} idleHours={number(device?.today?.idleHours)} device={device} /></SectionCard>}
      {period !== 'daily' && <div className={`period-dashboard ${period}`}>
        <SectionCard title="运行日历" icon="calendar" className="calendar-panel"><Calendar trend={trend} period={period} device={device} /></SectionCard>
        <SectionCard title="开工时段分布" className="distribution-panel"><WorkDistributionGrid trend={trend} period={period} device={device} /></SectionCard>
        <SectionCard title="工时分类占比" className="category-panel"><CategoryBars trend={trend} period={period} device={device} /></SectionCard>
        <SectionCard title="平均每小时油耗趋势" className="trend-panel"><div className="chart-subtitle">平均每小时油耗(L/h)</div><TooltipLineChart labels={labels} series={trendSeries} /></SectionCard>
      </div>}
    </div> : <ListView rows={rows} columns={columns} onExport={() => showToast('报表导出任务已创建')} />}
    {toast && <div className="report-toast">{toast}</div>}
  </div>;
}

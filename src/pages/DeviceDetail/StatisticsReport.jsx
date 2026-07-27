import React, { useState, useMemo, useCallback } from 'react';
import { buildDaySegments, getPrimaryWorkStatus, WORK_STATUS_COLORS } from './workStatusConfig';

/* ───────── helpers ───────── */

function getTargetDate(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
}

function formatDateSlash(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

function formatDateLabel(d, period) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (period === 'daily') return `${y}年${m}月${day}日`;
  if (period === 'monthly') return `${y}年${m}月`;
  const jan1 = new Date(y, 0, 1);
  const daysSinceJan = Math.floor((d - jan1) / 86400000);
  const weekNum = Math.ceil((daysSinceJan + jan1.getDay() + 1) / 7);
  return `${y}年 第${weekNum}周`;
}

function round1(v) {
  return Number(v).toFixed(1);
}

function dayNum(d) {
  const n = parseInt(String(d).replace(/日$/, ''), 10);
  return isNaN(n) ? 0 : n;
}

function formatMonthDay(dayVal) {
  const n = dayNum(dayVal);
  return `07月${String(n).padStart(2, '0')}日`;
}

/* ───────── Section card with icon ───────── */

function SectionCard({ title, children }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 8,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            background: '#fde8e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" fill="#e60012" />
          </svg>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ───────── 24h Gantt chart — full 0-24h, no "未工作" ───────── */

function GanttChart({ workHours, idleHours, device }) {
  const primaryStatus = getPrimaryWorkStatus(device);
  const segments = useMemo(
    () => buildDaySegments(workHours, idleHours, primaryStatus),
    [workHours, idleHours, primaryStatus],
  );

  /* viewBox coordinate system: 1200 wide × 56 tall */
  const VW = 1200;
  const VH = 56;
  const hourW = VW / 24;          // 50 per hour
  const barY = 20;                 // bar top
  const barH = 28;                 // bar height
  const labelY = 14;               // time label baseline
  const axisY = 18;                // axis line
  const timeTicks = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

  return (
    <div style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        height={VH}
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        {/* Time axis labels */}
        {timeTicks.map((h) => (
          <text
            key={h}
            x={h * hourW}
            y={labelY}
            textAnchor="middle"
            fontSize={10}
            fill="#9ca3af"
          >
            {h}{h === 24 ? '(h)' : ''}
          </text>
        ))}
        {/* Axis line */}
        <line x1={0} y1={axisY} x2={VW} y2={axisY} stroke="#e5e7eb" strokeWidth={1} />
        {/* Colored segments — continuous, no gaps */}
        {segments.map((seg, i) => (
          <rect
            key={i}
            x={seg.start * hourW}
            y={barY}
            width={Math.max((seg.end - seg.start) * hourW, 1)}
            height={barH}
            rx={i === 0 ? 3 : i === segments.length - 1 ? 3 : 0}
            fill={WORK_STATUS_COLORS[seg.status] || WORK_STATUS_COLORS['其他']}
          />
        ))}
      </svg>
    </div>
  );
}

/* ──────────────────────────── Main Component ──────────────────────────── */

/* stable default data (outside component) */
const DEFAULT_WEEKLY = [
  { day: '周一', value: 28 },
  { day: '周二', value: 32 },
  { day: '周三', value: 25 },
  { day: '周四', value: 30 },
  { day: '周五', value: 27 },
  { day: '周六', value: 18 },
  { day: '周日', value: 12 },
];
const DEFAULT_MONTHLY = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  value: 20 + Math.round(Math.sin(i * 0.5) * 8 + ((i * 7 + 3) % 5)),
}));

export default function StatisticsReport({ device }) {
  const [mode, setMode] = useState('chart');
  const [period, setPeriod] = useState('daily');
  const [dateOffset, setDateOffset] = useState(0);

  const today = getTargetDate(dateOffset);
  const dateLabelSlash = formatDateSlash(today);

  /* ── data extraction ── */
  const workHours = parseFloat(device?.today?.workHours) || 0;
  const idleHours = parseFloat(device?.today?.idleHours) || 0;
  const rawTotalFuel = device?.cumulative?.totalFuel;
  const totalFuel = parseFloat(String(rawTotalFuel).replace(/[^0-9.]/g, '')) || 0;
  const isPaver = device?.type === '摊铺机';
  const paverDistance = isPaver ? (device?.cumulative?.['摊铺距离'] || '--') : null;
  const avgFuel = workHours > 0 ? round1(totalFuel / workHours) : '--';

  const weeklyData = useMemo(() => device?.weeklyFuelTrend || DEFAULT_WEEKLY, [device?.weeklyFuelTrend]);
  const monthlyRaw = useMemo(() => device?.monthlyFuelTrend || DEFAULT_MONTHLY, [device?.monthlyFuelTrend]);

  /* ── derived calculations ── */
  const weeklyTotalFuel = weeklyData.reduce((s, d) => s + (d.value || 0), 0);
  const weeklyTotalWork = weeklyData.reduce((s, d) => s + (d.value || 0) * 0.4, 0);
  const weeklyAvgFuel = weeklyTotalWork > 0 ? round1(weeklyTotalFuel / weeklyTotalWork) : '--';

  const monthlyTotalFuel = monthlyRaw.reduce((s, d) => s + (d.value || 0), 0);
  const monthlyTotalWork = monthlyRaw.reduce((s, d) => s + (d.value || 0) * 0.4, 0);
  const monthlyAvgFuel = monthlyTotalWork > 0 ? round1(monthlyTotalFuel / monthlyTotalWork) : '--';

  /* ── period / nav handlers ── */
  const handlePrev = useCallback(() => {
    setDateOffset((v) => v - (period === 'daily' ? 1 : period === 'weekly' ? 7 : 30));
  }, [period]);
  const handleNext = useCallback(() => {
    setDateOffset((v) => v + (period === 'daily' ? 1 : period === 'weekly' ? 7 : 30));
  }, [period]);

  /* ── Metrics for overview card ── */
  const metrics = useMemo(() => {
    if (period === 'daily') {
      const base = [];
      if (isPaver) {
        base.push({ label: '摊铺距离', value: String(paverDistance ?? '--'), unit: 'm' });
      }
      base.push(
        { label: '油耗', value: round1(totalFuel), unit: 'L' },
        { label: '每小时油耗', value: avgFuel === '--' ? '--' : avgFuel, unit: 'L/h' },
        { label: '工作时长', value: String(workHours), unit: 'h' },
        { label: '怠速工时', value: String(idleHours), unit: 'h' },
      );
      return base;
    }
    if (period === 'weekly') {
      const base = [];
      if (isPaver) {
        base.push({ label: '摊铺距离', value: round1(weeklyTotalFuel * 3.2), unit: 'm' });
      }
      base.push(
        { label: '油耗', value: String(weeklyTotalFuel), unit: 'L' },
        { label: '每小时油耗', value: weeklyAvgFuel === '--' ? '--' : weeklyAvgFuel, unit: 'L/h' },
        { label: '工作时长', value: round1(weeklyTotalWork), unit: 'h' },
        { label: '怠速工时', value: round1(weeklyTotalFuel * 0.15), unit: 'h' },
      );
      return base;
    }
    // monthly
    const base = [];
    if (isPaver) {
      base.push({ label: '摊铺距离', value: round1(monthlyTotalFuel * 2.8), unit: 'm' });
    }
    base.push(
      { label: '油耗', value: String(monthlyTotalFuel), unit: 'L' },
      { label: '每小时油耗', value: monthlyAvgFuel === '--' ? '--' : monthlyAvgFuel, unit: 'L/h' },
      { label: '工作时长', value: round1(monthlyTotalWork), unit: 'h' },
      { label: '怠速工时', value: round1(monthlyTotalFuel * 0.15), unit: 'h' },
    );
    return base;
  }, [period, isPaver, paverDistance, totalFuel, avgFuel, workHours, idleHours, weeklyTotalFuel, weeklyAvgFuel, weeklyTotalWork, monthlyTotalFuel, monthlyAvgFuel, monthlyTotalWork]);

  /* ── Table data ── */
  const tableColumns = useMemo(() => {
    const cols = [
      { key: 'date', label: period === 'weekly' ? '星期' : '日期' },
    ];
    if (isPaver) {
      cols.push({ key: 'paverDistance', label: '摊铺距离' });
    }
    cols.push(
      { key: 'fuel', label: '油耗' },
      { key: 'avgFuel', label: '每小时油耗' },
      { key: 'workHours', label: '工作时长' },
      { key: 'idleHours', label: '怠速工时' },
    );
    return cols;
  }, [period, isPaver]);

  const tableData = useMemo(() => {
    if (period === 'daily') {
      return [
        {
          id: 1,
          date: formatDateLabel(today, 'daily'),
          ...(isPaver ? { paverDistance: String(paverDistance ?? '--') } : {}),
          fuel: round1(totalFuel) + ' L',
          avgFuel: (avgFuel === '--' ? '--' : avgFuel + ' L/h'),
          workHours: workHours + ' h',
          idleHours: idleHours + ' h',
        },
      ];
    }
    if (period === 'weekly') {
      return weeklyData.map((d, i) => {
        const wh = round1(d.value * 0.4);
        const ih = round1(d.value * 0.15);
        const af = round1(d.value / (d.value * 0.4 || 1));
        return {
          id: i + 1,
          date: d.day,
          ...(isPaver ? { paverDistance: round1(d.value * 3.2) + ' m' } : {}),
          fuel: d.value + ' L',
          avgFuel: af + ' L/h',
          workHours: wh + ' h',
          idleHours: ih + ' h',
        };
      });
    }
    // monthly
    return monthlyRaw.map((d, i) => {
      const wh = round1(d.value * 0.4);
      const ih = round1(d.value * 0.15);
      const af = round1(d.value / (d.value * 0.4 || 1));
      return {
        id: i + 1,
        date: formatMonthDay(d.day),
        ...(isPaver ? { paverDistance: round1(d.value * 2.8) + ' m' } : {}),
        fuel: d.value + ' L',
        avgFuel: af + ' L/h',
        workHours: wh + ' h',
        idleHours: ih + ' h',
      };
    });
  }, [period, today, workHours, idleHours, totalFuel, avgFuel, isPaver, paverDistance, weeklyData, monthlyRaw]);

  /* ── Segmented button style helper ── */
  const segBtn = (active) => ({
    padding: '6px 16px',
    border: 'none',
    borderRadius: 4,
    background: active ? '#1f2937' : '#f3f4f6',
    color: active ? '#fff' : '#6b7280',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  });

  /* ────────── RENDER ────────── */
  return (
    <div>
      {/* ── Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          background: '#fff',
          borderRadius: 8,
          padding: '8px 16px',
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          minHeight: 44,
        }}
      >
        {/* Left: Period segmented buttons */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { key: 'daily', label: '日视图' },
            { key: 'weekly', label: '周视图' },
            { key: 'monthly', label: '月视图' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPeriod(item.key)}
              style={segBtn(period === item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Center: Date display with arrows and calendar icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={handlePrev}
            style={{
              width: 26,
              height: 26,
              borderRadius: 4,
              border: '1px solid #e5e7eb',
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              fontSize: 12,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', minWidth: 100, textAlign: 'center' }}>
              {dateLabelSlash}
            </span>
          </div>
          <button
            type="button"
            onClick={handleNext}
            disabled={dateOffset >= 0}
            style={{
              width: 26,
              height: 26,
              borderRadius: 4,
              border: '1px solid #e5e7eb',
              background: '#fff',
              cursor: dateOffset >= 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: dateOffset >= 0 ? '#d1d5db' : '#6b7280',
              fontSize: 12,
              opacity: dateOffset >= 0 ? 0.5 : 1,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Right: View mode toggle */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" onClick={() => setMode('chart')} style={segBtn(mode === 'chart')}>
            图表
          </button>
          <button type="button" onClick={() => setMode('list')} style={segBtn(mode === 'list')}>
            列表
          </button>
        </div>
      </div>

      {/* ══════════════════ CHART VIEW ══════════════════ */}
      {mode === 'chart' && (
        <>
          {/* ── Metric Overview Card ── */}
          <SectionCard title="指标概览">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: metrics.length >= 5
                  ? 'repeat(auto-fit, minmax(140px, 1fr))'
                  : `repeat(${metrics.length}, 1fr)`,
                gap: 16,
              }}
            >
              {metrics.map((m, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>
                    {m.value}
                    <span style={{ fontSize: 13, fontWeight: 400, color: '#6b7280', marginLeft: 2 }}>
                      {m.unit}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Gantt Chart Card ── */}
          {period === 'daily' && (
            <SectionCard title="开工时段分布">
              <GanttChart workHours={workHours} idleHours={idleHours} device={device} />
            </SectionCard>
          )}

          {period === 'weekly' && (
            <SectionCard title="开工时段分布">
              <GanttChart workHours={weeklyTotalWork / 7} idleHours={(weeklyTotalFuel * 0.15) / 7} device={device} />
            </SectionCard>
          )}

          {period === 'monthly' && (
            <SectionCard title="开工时段分布">
              <GanttChart workHours={monthlyTotalWork / 30} idleHours={(monthlyTotalFuel * 0.15) / 30} device={device} />
            </SectionCard>
          )}
        </>
      )}

      {/* ══════════════════ LIST VIEW ══════════════════ */}
      {mode === 'list' && (
        <div
          style={{
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {tableColumns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#6b7280',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: 12,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr
                  key={row.id}
                  style={{
                    background: idx % 2 === 0 ? '#fff' : '#fafafa',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f6f8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa'; }}
                >
                  {tableColumns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: '10px 16px',
                        color: '#1f2937',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      {row[col.key] ?? '--'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 768px) {
          .sr-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

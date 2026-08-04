import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { buildDaySegments, getPrimaryWorkStatus, WORK_STATUS_COLORS } from './workStatusConfig';

/* ───────── helpers ───────── */
const isPaver = (d) => {
  const t = d?.type || '';
  return t.includes('摊铺');
};

const formatHourTime = (hour) => {
  const totalSeconds = Math.round(Number(hour) * 3600);
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
};

/* ───────── Inline SVG Icons ───────── */
const RefreshIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

/* ───────── Small icon block (matching reference style) ───────── */
function IconBlock({ bg, stroke }) {
  return (
    <div style={{ width: 28, height: 28, borderRadius: 6, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    </div>
  );
}

/* ───────── 24h Gantt — continuous fill, no "未工作" ───────── */

function Gantt24h({ workH, idleH, device }) {
  const [hoveredRange, setHoveredRange] = useState(null);
  const work = Number(workH) || 0;
  const idle = Number(idleH) || 0;
  const primaryStatus = getPrimaryWorkStatus(device);

  const ranges = useMemo(
    () => buildDaySegments(work, idle, primaryStatus),
    [work, idle, primaryStatus],
  );

  const barH = 22;
  const ticks = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ position: 'relative', height: 16, marginBottom: 4 }}>
        {ticks.map((h) => (
          <span key={h} style={{ position: 'absolute', left: `${(h / 24) * 100}%`, transform: 'translateX(-50%)', fontSize: 10, color: '#9ca3af', userSelect: 'none' }}>
            {h}{h === 24 ? '(h)' : ''}
          </span>
        ))}
      </div>
      <div style={{ position: 'relative', width: '100%', height: barH }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 4, overflow: 'hidden' }}>
          {ranges.map((range, index) => {
            const color = WORK_STATUS_COLORS[range.status] || WORK_STATUS_COLORS['其他'];
            const label = `${range.status}，${formatHourTime(range.start)} 至 ${formatHourTime(range.end)}`;
            return (
              <div
                key={index}
                role="button"
                tabIndex={0}
                aria-label={label}
                onMouseEnter={() => setHoveredRange(range)}
                onMouseLeave={() => setHoveredRange(null)}
                onFocus={() => setHoveredRange(range)}
                onBlur={() => setHoveredRange(null)}
                style={{
                  position: 'absolute',
                  left: `${(range.start / 24) * 100}%`,
                  width: `${((range.end - range.start) / 24) * 100}%`,
                  top: 0,
                  bottom: 0,
                  background: color,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              />
            );
          })}
        </div>
        {hoveredRange && (() => {
          const color = WORK_STATUS_COLORS[hoveredRange.status] || WORK_STATUS_COLORS['其他'];
          const midpoint = Math.min(88, Math.max(12, (((hoveredRange.start + hoveredRange.end) / 2) / 24) * 100));
          return (
            <div
              role="tooltip"
              style={{
                position: 'absolute',
                left: `${midpoint}%`,
                bottom: 34,
                transform: 'translateX(-50%)',
                zIndex: 5,
                minWidth: 168,
                padding: '10px 14px',
                border: `1px solid ${color}`,
                borderRadius: 6,
                background: '#fff',
                boxShadow: '0 6px 18px rgba(31,41,55,0.14)',
                color: '#4b5563',
                pointerEvents: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                {hoveredRange.status}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, whiteSpace: 'nowrap' }}>
                {formatHourTime(hoveredRange.start)}–{formatHourTime(hoveredRange.end)}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

/* ───────── Local SVG map ───────── */
function LocalMap({ device }) {
  const code = device?.code || '设备';
  const [zoom, setZoom] = useState(1);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 280, borderRadius: 8, overflow: 'hidden', background: '#eef2ee' }}>
      {/* Terrain / road SVG */}
      <svg width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
        <rect x="0" y="0" width="600" height="400" fill="#e8ede6" />
        <rect x="40" y="30" width="180" height="120" rx="8" fill="#d4e4cf" opacity=".6" />
        <rect x="350" y="200" width="200" height="140" rx="8" fill="#d4e4cf" opacity=".5" />
        <rect x="20" y="260" width="140" height="100" rx="8" fill="#c8dcc2" opacity=".4" />
        <line x1="0" y1="180" x2="600" y2="180" stroke="#fff" strokeWidth="6" opacity=".7" />
        <line x1="300" y1="0" x2="300" y2="400" stroke="#fff" strokeWidth="5" opacity=".6" />
        <line x1="100" y1="60" x2="500" y2="340" stroke="#fff" strokeWidth="3" opacity=".4" />
        <text x="120" y="175" fontSize="9" fill="#999" fontWeight="500">省道 S101</text>
        <text x="305" y="130" fontSize="9" fill="#999" fontWeight="500" transform="rotate(-90,305,130)">经 开 路</text>
      </svg>

      {/* Device marker */}
      <div style={{ position: 'absolute', top: '42%', left: '52%', transform: 'translate(-50%,-100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50% 50% 50% 0', background: '#e60012', transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(230,0,18,0.35)' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', transform: 'rotate(45deg)' }} />
        </div>
        <div style={{ width: 16, height: 5, borderRadius: '50%', background: 'rgba(0,0,0,0.12)', marginTop: 3 }} />
        <div style={{ marginTop: 5, background: '#fff', borderRadius: 6, padding: '5px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', fontSize: 11, color: '#1f2937', whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.4 }}>
          <div style={{ fontWeight: 600 }}>{code}</div>
          <div style={{ color: '#6b7280', fontSize: 10 }}>湖南省长沙市宁乡经开区</div>
        </div>
      </div>

      {/* Zoom controls */}
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.12)', zIndex: 3 }}>
        <button type="button" aria-label="放大" onClick={() => setZoom((z) => Math.min(z + 1, 5))} style={{ width: 30, height: 30, background: '#fff', border: 'none', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', fontSize: 16, color: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        <button type="button" aria-label="缩小" onClick={() => setZoom((z) => Math.max(z - 1, 1))} style={{ width: 30, height: 30, background: '#fff', border: 'none', cursor: 'pointer', fontSize: 16, color: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&minus;</button>
      </div>

      {/* Zoom indicator */}
      <div style={{ position: 'absolute', bottom: 10, left: 12, background: 'rgba(255,255,255,0.85)', borderRadius: 4, padding: '2px 8px', fontSize: 10, color: '#6b7280', zIndex: 3 }}>
        缩放: {zoom}x
      </div>
    </div>
  );
}

/* ═══════════════════ Main Component ═══════════════════ */
export default function RealtimeStatus({ device }) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(14);
  const [refreshKey, setRefreshKey] = useState(0);

  const doRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setCountdown(14);
  }, []);

  /* Auto-refresh countdown */
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { doRefresh(); return 14; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRefresh, doRefresh]);

  if (!device) {
    return <div style={{ color: '#9ca3af', textAlign: 'center', padding: 60 }}>暂无设备数据</div>;
  }

  const rt = device.realtime || {};
  const today = device.today || {};
  const cum = device.cumulative || {};
  const workH = parseFloat(today.workHours) || 0;
  const idleH = parseFloat(today.idleHours) || 0;

  /* Ordered realtime field list */
  const fieldOrder = ['设备状态', '当前油位', '车速', '摊铺速度', '水温', '发动机转速', '机油压力', '振捣设定值'];
  const rtFields = fieldOrder.filter((k) => k in rt).map((k) => ({ key: k, value: rt[k] }));

  return (
    <div key={refreshKey} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── A. 数据刷新控制细条 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 36, background: '#f5f5f5', borderRadius: 6, position: 'relative', padding: '0 16px' }}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>数据更新时间：2026-07-24 15:10:00 (UTC+7)</span>
        <div style={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            role="switch"
            aria-checked={autoRefresh}
            aria-label="自动刷新"
            onClick={() => { setAutoRefresh((v) => !v); setCountdown(14); }}
            style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              border: 'none',
              background: autoRefresh ? '#e60012' : '#d1d5db',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.25s',
              padding: 0,
              flexShrink: 0,
            }}
          >
            <span style={{ position: 'absolute', top: 2, left: autoRefresh ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </button>
          <span style={{ fontSize: 12, color: '#6b7280', userSelect: 'none' }}>自动刷新({autoRefresh ? `${countdown}s` : '已暂停'})</span>
          <button type="button" aria-label="手动刷新" onClick={doRefresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2, display: 'flex', alignItems: 'center' }}>
            <RefreshIcon size={15} />
          </button>
        </div>
      </div>

      {/* ── B. 最新工况 — 全宽横条卡 ── */}
      <div style={{ background: '#fff', borderRadius: 8, padding: '14px 20px' }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 5, background: '#fde8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e60012" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>最新工况</span>
          </div>
          <span style={{ fontSize: 10, color: '#22b573', fontWeight: 600, background: '#f0fdf4', padding: '2px 8px', borderRadius: 4 }}>live</span>
        </div>
        {/* Fields row — all in one line, status always #1f2937 */}
        <div style={{ display: 'flex', gap: 0, flexWrap: 'nowrap', overflowX: 'auto' }}>
          {rtFields.map(({ key, value }, i) => (
            <div key={key} style={{ flex: '1 1 0', minWidth: 82, padding: '0 10px', borderRight: i < rtFields.length - 1 ? '1px solid #f0f0f0' : 'none', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', whiteSpace: 'nowrap' }}>
                {value}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, whiteSpace: 'nowrap' }}>{key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── C. Two-column: LEFT=TodayWork+Cumulative, RIGHT=Map ── */}
      <div className="rt-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'stretch' }}>

        {/* Left — stacked cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 今日工时 card */}
          <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', flex: '1 1 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <IconBlock bg="#f0e6ff" stroke="#8b5cf6" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>今日工时</span>
            </div>
            {/* Two big numbers */}
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{workH}<span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280', marginLeft: 2 }}>h</span></div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>工作时长</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{idleH}<span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280', marginLeft: 2 }}>h</span></div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>怠速工时</div>
              </div>
            </div>
            <Gantt24h workH={workH} idleH={idleH} device={device} />
          </div>

          {/* 历史累计数据 card — "油耗"→"总油耗" */}
          <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', flex: '1 1 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <IconBlock bg="#fff3e0" stroke="#f59e0b" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>历史累计数据</span>
            </div>
            <div style={{ display: 'flex', gap: 0 }}>
              {[
                ...(isPaver(device) ? [{ label: '摊铺距离', value: cum['摊铺距离'] || '--' }] : []),
                { label: '总油耗', value: cum.totalFuel || '--' },
                { label: isPaver(device) ? '总工作小时' : '总工作时间', value: cum['总工作小时'] || cum.totalWorkHours || cum.totalWorkTime || '--' },
              ].map((item, i, arr) => (
                <div key={item.label} style={{ flex: '1 1 0', padding: '0 12px', borderRight: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#1f2937' }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Map card */}
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <LocalMap device={device} />
        </div>
      </div>

      {/* Responsive: two-column → single column below 760px */}
      <style>{`
        @media (max-width: 760px) {
          .rt-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import './widebody.css';
import WidebodyGearDistribution from './WidebodyGearDistribution';
import {
  isElectricWidebody,
  getDailySocCurve,
  getDailyFuelCurve,
  getDailyWorkDistribution,
  getDailyGearDistribution,
  getMachineUtilization,
} from '../../data/widebody';

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 11a8 8 0 1 0 1 4" />
      <polyline points="20 4 20 11 13 11" />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PieChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

function SectionTitle({ icon, title, tone = 'pink' }) {
  return (
    <div className="widebody-card-title">
      <span className={`widebody-icon-badge ${tone}`}>{icon}</span>
      <strong>{title}</strong>
    </div>
  );
}

function formatValue(val, unit = '') {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'number') {
    if (!Number.isFinite(val)) return '—';
    return `${val}${unit}`;
  }
  const str = String(val).trim();
  if (!str) return '—';
  return str.endsWith(unit) ? str : `${str}${unit}`;
}

function Gantt24h({ segments }) {
  const [hovered, setHovered] = useState(null);
  const ticks = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

  const formatHourTime = (hour) => {
    const totalSeconds = Math.round(Number(hour || 0) * 3600);
    const h = String(Math.floor(totalSeconds / 3600) % 24).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    return `${h}:${m}`;
  };

  if (!segments || segments.length === 0) {
    return <div style={{ padding: '16px 0', textAlign: 'center', color: '#9ca3af', fontSize: '11px' }}>暂无当日开工数据</div>;
  }

  return (
    <div className="widebody-timeline-wrap">
      <div className="widebody-timeline-scale" style={{ direction: 'ltr' }}>
        {ticks.map((h) => (
          <span key={h} style={{ left: `${(h / 24) * 100}%` }}>
            {h}
          </span>
        ))}
      </div>
      <div className="widebody-timeline-track">
        {segments.map((seg, i) => {
          const isWork = seg.status === '工作';
          const bg = isWork ? '#2563eb' : '#f59e0b';
          const left = (seg.start / 24) * 100;
          const exactWidth = ((seg.end - seg.start) / 24) * 100;
          return (
            <button
              type="button"
              key={i}
              className="widebody-timeline-segment"
              style={{
                left: `${left}%`,
                width: `${exactWidth}%`,
                background: bg,
              }}
              aria-label={`${seg.status}: ${formatHourTime(seg.start)} - ${formatHourTime(seg.end)}`}
              onMouseEnter={() => setHovered(seg)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(seg)}
              onBlur={() => setHovered(null)}
            />
          );
        })}
        {hovered && (
          <div
            style={{
              position: 'absolute',
              bottom: '28px',
              left: `${Math.min(85, Math.max(15, ((hovered.start + hovered.end) / 48) * 100))}%`,
              transform: 'translateX(-50%)',
              background: '#1f2937',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <b>{hovered.status}</b>: {formatHourTime(hovered.start)} - {formatHourTime(hovered.end)}
          </div>
        )}
      </div>
      <div className="widebody-timeline-legend">
        <span className="widebody-legend-item">
          <i className="widebody-legend-color" style={{ background: '#2563eb' }} />
          工作
        </span>
        <span className="widebody-legend-item">
          <i className="widebody-legend-color" style={{ background: '#f59e0b' }} />
          怠速
        </span>
      </div>
    </div>
  );
}

function SvgCurveChart({ points, unit = '%', title = '曲线', strokeColor = '#2563eb', fillColor = 'rgba(37,99,235,0.1)' }) {
  const [selectedIdx, setSelectedIdx] = useState(null);

  const totalCount = (points || []).length;
  const validEntries = (points || []).map((p, sourceIndex) => {
    if (!p) return null;
    const val = p.soc !== undefined ? p.soc : p.level;
    if (val === null || val === undefined || !Number.isFinite(val)) return null;
    return {
      sourceIndex,
      val,
      time: p.time,
    };
  }).filter(Boolean);

  if (validEntries.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '11px' }}>暂无{title}数据</div>;
  }

  const svgW = 640;
  const svgH = 190;
  const padL = 46;
  const padR = 18;
  const padT = 18;
  const padB = 26;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const getX = (sourceIndex) => {
    if (totalCount <= 1) return padL + plotW / 2;
    return padL + (sourceIndex / (totalCount - 1)) * plotW;
  };
  const getY = (val) => padT + ((100 - Math.min(100, Math.max(0, val))) / 100) * plotH;

  const coords = validEntries.map((item, coordIndex) => ({
    coordIndex,
    sourceIndex: item.sourceIndex,
    x: getX(item.sourceIndex),
    y: getY(item.val),
    val: item.val,
    time: item.time,
  }));

  let hasGap = false;
  let lineD = '';
  for (let i = 0; i < coords.length; i++) {
    const pt = coords[i];
    if (i === 0) {
      lineD += `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    } else {
      const isConsecutive = pt.sourceIndex === coords[i - 1].sourceIndex + 1;
      if (isConsecutive) {
        lineD += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      } else {
        hasGap = true;
        lineD += ` M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      }
    }
  }

  const areaD = (!hasGap && coords.length > 1)
    ? `${lineD} L ${coords[coords.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`
    : '';

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSelectedIdx(null);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev === null ? 0 : (prev + 1) % coords.length));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev === null ? coords.length - 1 : (prev - 1 + coords.length) % coords.length));
    }
  };

  const activePoint = selectedIdx !== null ? coords[selectedIdx] : null;

  return (
    <div
      className="widebody-curve-container"
      aria-label={`${title}图表`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ outline: 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b', marginBottom: 6 }}>
        <span style={{ fontWeight: 600, color: '#1e293b' }}>
          {title}
          <span className="widebody-sub-badge" style={{ marginLeft: 6 }}>剩余量(%)</span>
        </span>
        <span>单位: {unit}</span>
      </div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '674px',
          aspectRatio: `${svgW} / ${svgH}`,
          margin: '0 auto',
        }}
      >
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: '100%', display: 'block', direction: 'ltr' }}>
          {[100, 75, 50, 25, 0].map((v) => {
            const y = getY(v);
            return (
              <g key={v}>
                <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">{v}</text>
              </g>
            );
          })}
          {areaD && <path d={areaD} fill={fillColor} />}
          {lineD && <path d={lineD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
          {coords.map((pt, coordIndex) => {
            const isSelected = selectedIdx === coordIndex;
            return (
              <circle
                key={pt.sourceIndex}
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? 6 : 3.5}
                fill="#fff"
                stroke={strokeColor}
                strokeWidth={isSelected ? 2.5 : 1.8}
                role="button"
                tabIndex={0}
                aria-label={`${pt.time}: ${pt.val}${unit}`}
                style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                onClick={() => setSelectedIdx(isSelected ? null : coordIndex)}
                onMouseEnter={() => setSelectedIdx(coordIndex)}
                onFocus={() => setSelectedIdx(coordIndex)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedIdx(isSelected ? null : coordIndex);
                  }
                }}
              />
            );
          })}
          {coords.map((pt, i) => {
            const step = Math.ceil(coords.length / 7) || 1;
            if (i % step === 0 || i === coords.length - 1) {
              return (
                <text key={pt.sourceIndex} x={pt.x} y={svgH - 6} textAnchor="middle" fontSize="11" fill="#64748b">
                  {pt.time}
                </text>
              );
            }
            return null;
          })}
        </svg>
        {activePoint && (
          <div
            style={{
              position: 'absolute',
              top: `${(activePoint.y / svgH) * 100}%`,
              left: `${(activePoint.x / svgW) * 100}%`,
              transform: 'translate(-50%, -120%)',
              background: '#1f2937',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            {activePoint.time}: {activePoint.val}{unit}
          </div>
        )}
      </div>
    </div>
  );
}

function LocalMap({ device, locationName }) {
  const [zoom, setZoom] = useState(1);
  const code = device?.code || '宽体车';

  return (
    <div className="widebody-map-card">
      <div className="widebody-card-header" style={{ marginBottom: 8 }}>
        <SectionTitle icon={<MapPinIcon />} title="设备位置" tone="orange" />
      </div>
      <div className="widebody-map-container" aria-label="设备位置地图">
        <svg className="widebody-map-svg" viewBox="0 0 760 500" preserveAspectRatio="xMidYMid slice">
          <g
            transform={`scale(${zoom})`}
            style={{
              transformOrigin: '380px 250px',
              transition: 'transform 0.25s ease-out',
            }}
          >
            <rect width="760" height="500" fill="#e9edf0" />
            <path d="M-30 390 L245 210 430 270 790 30" stroke="#fff" strokeWidth="70" fill="none" />
            <path d="M-20 390 L245 210 430 270 790 30" stroke="#d2d7dc" strokeWidth="54" fill="none" />
            <path d="M70 0 L210 160 260 500" stroke="#fff" strokeWidth="44" fill="none" />
            <path d="M70 0 L210 160 260 500" stroke="#d4d9de" strokeWidth="30" fill="none" />
            <path d="M420 -20 L390 160 490 500" stroke="#fff" strokeWidth="30" fill="none" />
            <path d="M420 -20 L390 160 490 500" stroke="#cdd3d8" strokeWidth="20" fill="none" />
            <path d="M0 115 L760 320 M0 470 L760 120" stroke="#fff" strokeWidth="5" opacity=".75" />
            <path d="M95 60 L670 440" stroke="#9ac8ef" strokeWidth="5" fill="none" />
            <text x="72" y="110" fontSize="15" fill="#8a929b">矿区干道 A1</text>
            <text x="510" y="155" fontSize="15" fill="#8a929b">运输专用通道</text>
            <g transform="translate(380, 225)">
              <circle cx="0" cy="0" r="16" fill="rgba(230,0,18,0.15)" />
              <circle cx="0" cy="0" r="8" fill="#e60012" />
            </g>
          </g>
        </svg>
        <div className="widebody-map-marker">
          <span className="widebody-map-pin" />
          <div className="widebody-map-info">
            <b>{code}</b>
            <small>{locationName || '暂无位置信息'}</small>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', zIndex: 5 }}>
          <button
            type="button"
            disabled={zoom >= 3}
            onClick={() => setZoom((z) => Math.min(3, z + 0.5))}
            aria-label="放大地图"
            style={{
              width: 28,
              height: 28,
              border: 0,
              borderBottom: '1px solid #e5e7eb',
              background: '#fff',
              color: zoom >= 3 ? '#d1d5db' : '#4b5563',
              fontSize: 16,
              cursor: zoom >= 3 ? 'not-allowed' : 'pointer',
            }}
          >
            +
          </button>
          <button
            type="button"
            disabled={zoom <= 1}
            onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
            aria-label="缩小地图"
            style={{
              width: 28,
              height: 28,
              border: 0,
              background: '#fff',
              color: zoom <= 1 ? '#d1d5db' : '#4b5563',
              fontSize: 16,
              cursor: zoom <= 1 ? 'not-allowed' : 'pointer',
            }}
          >
            −
          </button>
        </div>
        <span style={{ position: 'absolute', left: 10, bottom: 10, background: 'rgba(255,255,255,0.9)', padding: '2px 8px', borderRadius: 3, fontSize: 10, color: '#6b7280' }}>
          缩放: {zoom.toFixed(1)}x
        </span>
      </div>
    </div>
  );
}

export default function WidebodyRealtimeStatus({ device }) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(8);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setRefreshKey((k) => k + 1);
          return 8;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const gearData = useMemo(() => {
    if (!device) return null;
    void refreshKey;
    const base = device.gearData || device.gearDistribution || getDailyGearDistribution('2023-11-23');
    return base ? { ...base } : null;
  }, [device, refreshKey]);

  // Lifecycle & device state handling (Review B: loading / error / empty / noPermission / deleted)
  const dataState = device?.reportState || device?.dataState;
  if (!device || dataState === 'empty') {
    return <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>暂无宽体车数据</div>;
  }
  if (dataState === 'loading') {
    return <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>正在加载宽体车实时数据…</div>;
  }
  if (dataState === 'error') {
    return (
      <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
        <p>数据加载失败</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ marginTop: 10, padding: '4px 12px', borderRadius: 4, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', cursor: 'pointer' }}
        >
          重试
        </button>
      </div>
    );
  }
  if (dataState === 'noPermission') {
    return (
      <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
        <p>暂无权限查看此设备数据</p>
        <a href="#/devices" style={{ display: 'inline-block', marginTop: 10, color: '#2563eb', textDecoration: 'none' }}>返回设备列表</a>
      </div>
    );
  }
  if (dataState === 'deleted') {
    return (
      <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
        <p>该设备已删除</p>
        <a href="#/devices" style={{ display: 'inline-block', marginTop: 10, color: '#2563eb', textDecoration: 'none' }}>返回设备列表</a>
      </div>
    );
  }

  const isElectric = isElectricWidebody(device);
  const realtime = device.realtime || {};
  const today = device.today || {};
  const cumulative = device.cumulative || {};

  // 1. Realtime Items (Top bar: Electric 6 items / Fuel 5 items, strictly no default fallback)
  const realtimeItems = isElectric
    ? [
        { label: '设备状态', value: formatValue(realtime['设备状态']) },
        { label: '剩余电量', value: formatValue(realtime['剩余电量']) },
        { label: '电池健康', value: formatValue(realtime['电池健康']) },
        { label: '车速', value: formatValue(realtime['车速']) },
        { label: '油门深度', value: formatValue(realtime['油门深度']) },
        { label: '制动深度', value: formatValue(realtime['制动深度']) },
      ]
    : [
        { label: '设备状态', value: formatValue(realtime['设备状态']) },
        { label: '车速', value: formatValue(realtime['车速']) },
        { label: '油位', value: formatValue(realtime['油位']) },
        { label: '油门深度', value: formatValue(realtime['油门深度']) },
        { label: '齿轮模式', value: formatValue(realtime['齿轮模式']) },
      ];

  // 2. Today Groups (Review B: calculate machine utilization dynamically via formula, no hardcoding)
  const computedUtil = getMachineUtilization(today.runningHours, today.workHours);
  const utilDisplay = computedUtil !== null ? `${computedUtil}%` : '—';

  // Group A: 今日工时 (4项)
  const todayWorkItems = [
    { label: '工时', value: formatValue(today.workHours, 'h') },
    { label: '怠速工时', value: formatValue(today.idleHours, 'h') },
    { label: '运行时长', value: formatValue(today.runningHours, 'h') },
    { label: '机器利用率', value: utilDisplay },
  ];

  // Group B: 今日行驶 (4项: 里程、最高车速、运载趟数、运输重量)
  const todayTravelItems = [
    { label: '里程', value: formatValue(today.mileage, 'km') },
    { label: '最高车速', value: formatValue(today.maxSpeed, 'km/h') },
    { label: '运载趟数', value: formatValue(realtime['运载趟数']) },
    { label: '运输重量', value: formatValue(realtime['运输重量']) },
  ];

  // Group C: 今日电耗 / 今日能耗 (Electric 5项 / Fuel 3项)
  const todayEnergyItems = isElectric
    ? [
        { label: '电耗', value: formatValue(today.energy, 'kWh') },
        { label: '运行功耗', value: formatValue(today.runningPower, 'kWh') },
        { label: '空闲功耗', value: formatValue(today.idlePower, 'kWh') },
        { label: '回收电量', value: formatValue(today.recoveredEnergy, 'kWh') },
        { label: '充电时长', value: formatValue(today.chargeHours, 'h') },
      ]
    : [
        { label: '能耗', value: formatValue(today.fuel, 'L') },
        { label: '运行功耗', value: formatValue(today.runningFuel, 'L') },
        { label: '空闲功耗', value: formatValue(today.idleFuel, 'L') },
      ];

  // 3. Cumulative Items (Bottom separate card: Electric 6项 / Fuel 5项)
  const cumulativeItems = isElectric
    ? [
        { label: '总运行时长', value: formatValue(cumulative.totalRunningHours) },
        { label: '总运载趟数', value: formatValue(cumulative.totalTrips) },
        { label: '总运输重量', value: formatValue(cumulative.totalWeight) },
        { label: '总里程', value: formatValue(cumulative.totalMileage) },
        { label: '总电耗', value: formatValue(cumulative.totalEnergy) },
        { label: '总充电电量', value: formatValue(cumulative.totalChargeEnergy) },
      ]
    : [
        { label: '总工作时间', value: formatValue(cumulative.totalWorkHours) },
        { label: '运载趟数', value: formatValue(cumulative.totalTrips) },
        { label: '总运输重量', value: formatValue(cumulative.totalWeight) },
        { label: '总里程', value: formatValue(cumulative.totalMileage) },
        { label: '总能耗', value: formatValue(cumulative.totalFuel) },
      ];

  const socData = isElectric ? getDailySocCurve('2023-11-23') : null;
  const fuelData = !isElectric ? getDailyFuelCurve('2023-11-23') : null;
  const workSegments = getDailyWorkDistribution(device?.type, '2023-11-23');
  // Location derived from device data (Review F: no hardcoded fake Hunan for fuel)
  const locationName = device.location || device.project?.address || '—';

  return (
    <div key={refreshKey} className="widebody-page">
      {/* Refresh Toolbar */}
      <div className="widebody-refresh-line">
        <span>数据更新时间：{device.updateTime || '2023-11-23 15:30'} (UTC+8)</span>
        <div className="widebody-refresh-controls">
          <button
            type="button"
            className={`widebody-refresh-switch${autoRefresh ? ' is-on' : ''}`}
            onClick={() => setAutoRefresh((v) => !v)}
            aria-label="自动刷新开关"
          >
            <i />
          </button>
          <span>自动刷新({autoRefresh ? `${countdown}s` : '已暂停'})</span>
          <button
            type="button"
            className="widebody-refresh-btn"
            onClick={() => {
              setRefreshKey((k) => k + 1);
              setCountdown(8);
            }}
            aria-label="手动刷新"
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      {/* Latest Realtime Items Card (通栏) */}
      <section className="widebody-card" aria-label="最新工况">
        <div className="widebody-card-header">
          <SectionTitle icon={<PulseIcon />} title="最新工况" tone="pink" />
        </div>
        <div className="widebody-realtime-grid">
          {realtimeItems.map((item) => (
            <div className="widebody-realtime-item" key={item.label}>
              <strong className="widebody-realtime-val" title={item.value}>{item.value}</strong>
              <small className="widebody-realtime-lbl" title={item.label}>{item.label}</small>
            </div>
          ))}
        </div>
      </section>

      {/* Middle Layout: Left Grouped Today Cards + Right Local Map */}
      <div className="widebody-realtime-layout">
        <div className="widebody-realtime-left">
          {/* Today Top Row: Side-by-side Work (wider) and Travel (narrower) */}
          <div className="widebody-today-top-row">
            {/* Block 1: 今日工时 (4项 + 24h开工分布) */}
            <section className="widebody-card widebody-today-work-card" aria-label="今日工时">
              <div className="widebody-card-header">
                <SectionTitle icon={<ClockIcon />} title="今日工时" tone="purple" />
              </div>
              <div className="widebody-metrics-row">
                {todayWorkItems.map((item) => (
                  <div className="widebody-metric-box" key={item.label}>
                    <small title={item.label}>{item.label}</small>
                    <strong title={item.value}>{item.value}</strong>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: 2 }}>
                  当日开工分布
                </div>
                <Gantt24h segments={workSegments} />
              </div>
            </section>

            {/* Block 2: 今日行驶 (2项) */}
            <section className="widebody-card widebody-today-travel-card" aria-label="今日行驶">
              <div className="widebody-card-header">
                <SectionTitle icon={<TruckIcon />} title="今日行驶" tone="blue" />
              </div>
              <div className="widebody-metrics-row">
                {todayTravelItems.map((item) => (
                  <div className="widebody-metric-box" key={item.label}>
                    <small title={item.label}>{item.label}</small>
                    <strong title={item.value}>{item.value}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Block 3: 今日电耗 / 今日能耗 (5项/3项 + %剩余量曲线) */}
          <section className="widebody-card" aria-label={isElectric ? '今日电耗' : '今日能耗'}>
            <div className="widebody-card-header">
              <SectionTitle
                icon={isElectric ? <ZapIcon /> : <FlameIcon />}
                title={isElectric ? '今日电耗' : '今日能耗'}
                tone={isElectric ? 'blue' : 'orange'}
              />
            </div>
            <div className="widebody-metrics-row">
              {todayEnergyItems.map((item) => (
                <div className="widebody-metric-box" key={item.label}>
                  <small title={item.label}>{item.label}</small>
                  <strong title={item.value}>{item.value}</strong>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
              {isElectric ? (
                <SvgCurveChart
                  points={socData?.points}
                  unit="%"
                  title="电量曲线"
                  strokeColor="#2563eb"
                  fillColor="rgba(37,99,235,0.12)"
                />
              ) : (
                <SvgCurveChart
                  points={fuelData?.points}
                  unit="%"
                  title="油位曲线"
                  strokeColor="#ff7500"
                  fillColor="rgba(255,117,0,0.12)"
                />
              )}
            </div>
          </section>

          {/* Block 4: 档位分布 */}
          <section className="widebody-card widebody-gear-card" aria-label="档位分布">
            <div className="widebody-card-header">
              <SectionTitle icon={<PieChartIcon />} title="档位分布" tone="orange" />
            </div>
            <WidebodyGearDistribution data={gearData} title="档位分布" />
          </section>
        </div>

        {/* Right: Local Map */}
        <LocalMap device={device} locationName={locationName} />
      </div>

      {/* Bottom: 历史累计数据 (通栏) */}
      <section className="widebody-card" aria-label="历史累计数据">
        <div className="widebody-card-header">
          <SectionTitle icon={<ArchiveIcon />} title="历史累计数据" tone="orange" />
        </div>
        <div className="widebody-cumulative-grid">
          {cumulativeItems.map((item) => (
            <div className="widebody-cumulative-item" key={item.label}>
              <strong title={item.value}>{item.value}</strong>
              <small title={item.label}>{item.label}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

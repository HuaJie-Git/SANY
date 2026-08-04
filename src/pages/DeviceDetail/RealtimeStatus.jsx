import React, { useEffect, useMemo, useState } from 'react';
import { buildDaySegments, getPrimaryWorkStatus, WORK_STATUS_COLORS } from './workStatusConfig';

const isPaver = (device) => device?.type === '摊铺机';
const formatHourTime = (hour) => {
  const seconds = Math.round(Number(hour || 0) * 3600);
  return [Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60].map((n) => String(n).padStart(2, '0')).join(':');
};

const FIELD_CONFIG = {
  摊铺机: ['设备状态', '当前油位', '车速', '摊铺距离', '水温', '发动机转速', '机油压力', '振捣设定值'],
  压路机: ['设备状态', '当前油位', '水温', '振动频率', '机油压力'],
  平地机: ['设备状态', '当前油位', '水温', '振动频率', '机油压力'],
};

function RefreshIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11a8 8 0 1 0 1 4" /><polyline points="20 4 20 11 13 11" /></svg>;
}

function SectionTitle({ icon, title, tone = 'pink' }) {
  return <div className="section-title"><span className={`section-icon ${tone}`}>{icon}</span><strong>{title}</strong></div>;
}

function Gantt24h({ device, workHours, idleHours }) {
  const [hovered, setHovered] = useState(null);
  const primary = getPrimaryWorkStatus(device);
  const ranges = useMemo(() => buildDaySegments(workHours, idleHours, primary), [workHours, idleHours, primary]);
  const ticks = Array.from({ length: 13 }, (_, i) => i * 2);
  const legend = isPaver(device) ? ['行驶', '怠速'] : ['工作', '怠速'];
  return (
    <div className="gantt-wrap">
      <div className="gantt-scale">{ticks.map((h) => <span key={h} style={{ left: `${(h / 24) * 100}%` }}>{h === 24 ? '24' : h}</span>)}</div>
      <div className="gantt-track">
        {ranges.map((range, index) => {
          const color = WORK_STATUS_COLORS[range.status] || WORK_STATUS_COLORS.其他;
          return <button type="button" key={`${range.start}-${index}`} className="gantt-segment" aria-label={`${range.status} ${formatHourTime(range.start)}-${formatHourTime(range.end)}`} onMouseEnter={() => setHovered(range)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(range)} onBlur={() => setHovered(null)} style={{ left: `${range.start / 24 * 100}%`, width: `${(range.end - range.start) / 24 * 100}%`, background: color }} />;
        })}
        {hovered && <div className="gantt-tooltip" style={{ left: `${Math.min(88, Math.max(12, ((hovered.start + hovered.end) / 48) * 100))}%` }}><b>{hovered.status}</b><span>{formatHourTime(hovered.start)} - {formatHourTime(hovered.end)}</span></div>}
      </div>
      <div className="gantt-legend">{legend.map((item) => <span key={item}><i style={{ background: WORK_STATUS_COLORS[item] }} />{item}</span>)}</div>
    </div>
  );
}

function OilBars({ device }) {
  const values = isPaver(device) ? [22, 42, 35, 48, 46, 53, 41, 38, 44, 36] : [32, 55, 46, 52, 48, 57, 44, 49, 35, 42];
  return <div className="oil-chart" aria-label="今日油耗趋势">{values.map((value, i) => <span key={i} style={{ height: `${value}%` }} />)}</div>;
}

function LocalMap({ device }) {
  const [zoom, setZoom] = useState(1);
  const code = device?.code || '设备';
  return (
    <div className="local-map">
      <svg viewBox="0 0 760 500" preserveAspectRatio="xMidYMid slice" aria-label="设备地图">
        <rect width="760" height="500" fill="#e9edf0" />
        <path d="M-30 390 L245 210 430 270 790 30" stroke="#fff" strokeWidth="70" fill="none" />
        <path d="M-20 390 L245 210 430 270 790 30" stroke="#d2d7dc" strokeWidth="54" fill="none" />
        <path d="M70 0 L210 160 260 500" stroke="#fff" strokeWidth="44" fill="none" />
        <path d="M70 0 L210 160 260 500" stroke="#d4d9de" strokeWidth="30" fill="none" />
        <path d="M420 -20 L390 160 490 500" stroke="#fff" strokeWidth="30" fill="none" />
        <path d="M420 -20 L390 160 490 500" stroke="#cdd3d8" strokeWidth="20" fill="none" />
        <path d="M0 115 L760 320 M0 470 L760 120" stroke="#fff" strokeWidth="5" opacity=".75" />
        <path d="M95 60 L670 440" stroke="#9ac8ef" strokeWidth="5" fill="none" />
        <text x="72" y="110" fontSize="15" fill="#8a929b">省道 S101</text><text x="510" y="155" fontSize="15" fill="#8a929b">经 开 路</text>
      </svg>
      <div className="map-marker"><span /><div><b>{code}</b><small>湖南省长沙市宁乡经开区</small></div></div>
      <div className="map-zoom"><button type="button" onClick={() => setZoom((value) => Math.min(5, value + 1))}>+</button><button type="button" onClick={() => setZoom((value) => Math.max(1, value - 1))}>−</button></div>
      <span className="map-scale">缩放: {zoom}x</span>
    </div>
  );
}

export default function RealtimeStatus({ device }) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(8);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = setInterval(() => setCountdown((value) => { if (value <= 1) { setRefreshKey((key) => key + 1); return 8; } return value - 1; }), 1000);
    return () => clearInterval(timer);
  }, [autoRefresh]);
  if (!device) return <div className="empty-state">暂无设备数据</div>;

  const realtime = device.realtime || {};
  const today = device.today || {};
  const cumulative = device.cumulative || {};
  const workHours = Number(today.workHours || 0);
  const idleHours = Number(today.idleHours || 0);
  const fields = (FIELD_CONFIG[device.type] || Object.keys(realtime)).filter((key) => key in realtime).map((key) => ({ key, value: realtime[key] }));
  const fuel = today.totalFuel || today.fuelConsumption || cumulative.totalFuel || '124L';
  const hourlyFuel = today.fuelPerWorkHour || '15.2L/h';
  const historyItems = isPaver(device)
    ? [{ label: '总工作时间', value: cumulative['总工作小时'] || cumulative.totalWorkHours || '--' }, { label: '总油耗', value: cumulative.totalFuel || '--' }, { label: '摊铺距离', value: cumulative['摊铺距离'] || '--' }]
    : [{ label: '总工作时间', value: cumulative.totalWorkHours || '--' }, { label: '总油耗', value: cumulative.totalFuel || '--' }, { label: '总里程', value: cumulative.totalMileage || '--' }];

  return (
    <div key={refreshKey} className="realtime-page">
      <div className="refresh-line"><span>数据更新时间：{device?.updateTime || '2026-07-24 15:10'} (UTC+7)</span><div><button type="button" className={`refresh-switch${autoRefresh ? ' is-on' : ''}`} onClick={() => setAutoRefresh((value) => !value)}><i /></button><span>自动刷新({autoRefresh ? `${countdown}s` : '已暂停'})</span><button type="button" className="refresh-button" onClick={() => { setRefreshKey((key) => key + 1); setCountdown(8); }} aria-label="手动刷新"><RefreshIcon /></button></div></div>
      <section className="latest-card">
        <div className="latest-title"><SectionTitle icon="◉" title="最新工况" /><span className="live-badge">live</span></div>
        <div className={`latest-fields count-${Math.min(fields.length, 8)}`}>{fields.map(({ key, value }) => <div className="latest-field" key={key}><strong>{value}</strong><small>{key}</small></div>)}</div>
      </section>

      <div className="realtime-dashboard">
        <div className="dashboard-left">
          <section className="dashboard-card today-work-card"><SectionTitle icon="◷" title="今日工时" tone="purple" /><div className="today-numbers"><div><strong>{workHours}<em>h</em></strong><small>工作时长</small></div><div><strong>{idleHours}<em>h</em></strong><small>怠速工时</small></div></div><Gantt24h device={device} workHours={workHours} idleHours={idleHours} /></section>
          <section className="dashboard-card today-fuel-card"><SectionTitle icon="◒" title="今日油耗" tone="orange" /><div className="fuel-numbers"><div><strong>{fuel}</strong><small>总油耗</small></div><div><strong>{hourlyFuel}</strong><small>每小时工作油耗</small></div></div><OilBars device={device} /><div className="chart-axis"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div></section>
          <section className="dashboard-card cumulative-card"><SectionTitle icon="◒" title="历史累计数据" tone="orange" /><div className="history-items">{historyItems.map((item) => <div key={item.label}><strong>{item.value}</strong><small>{item.label}</small></div>)}</div></section>
        </div>
        <section className="map-card"><LocalMap device={device} /></section>
      </div>
    </div>
  );
}

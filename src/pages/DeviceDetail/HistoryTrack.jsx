import React, { useState, useRef, useEffect, useCallback } from 'react';

/* ═══════════════════ helpers ═══════════════════ */
const isPaverDevice = (d) => {
  const t = d?.type || '';
  return t.includes('摊铺');
};

const addDays = (dateStr, delta) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/* ═══════════════════ demo data ═══════════════════ */
const MAKE_TRACK = (_code) => [
  { id: 1, status: '行驶', start: '08:00', end: '09:12', fuel: 18.5, lat: 28.23, lng: 112.94 },
  { id: 2, status: '工作', start: '09:15', end: '11:40', fuel: 32.1, lat: 28.24, lng: 112.95 },
  { id: 3, status: '怠速', start: '11:42', end: '12:10', fuel: 3.2, lat: 28.245, lng: 112.955 },
  { id: 4, status: '行驶', start: '12:15', end: '14:30', fuel: 28.7, lat: 28.25, lng: 112.96 },
  { id: 5, status: '工作', start: '14:35', end: '16:50', fuel: 35.4, lat: 28.26, lng: 112.97 },
];

const MAP_PTS = [
  { x: 80, y: 280 }, { x: 160, y: 240 }, { x: 260, y: 200 },
  { x: 380, y: 180 }, { x: 480, y: 150 }, { x: 580, y: 120 },
  { x: 680, y: 100 }, { x: 760, y: 80 },
];

const POLYLINE = MAP_PTS.map((p) => `${p.x},${p.y}`).join(' ');

/* ═══════════════════ SVG icons ═══════════════════ */
const Svg = ({ d, size = 16, stroke = 'currentColor', fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const ChevronL = () => <Svg d="M15 18l-6-6 6-6" />;
const ChevronR = () => <Svg d="M9 18l6-6-6-6" />;
const DownloadSvg = () => <Svg d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />;
const HelpCircle = () => <Svg d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />;
const LocationSvg = () => <Svg d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" size={16} />;
const CrosshairSvg = () => <Svg d="M12 2v4M12 18v4M2 12h4M18 12h4" size={16} />;

/* ═══════════════════ component ═══════════════════ */
export default function HistoryTrack({ device }) {
  const deviceCode = device?.code || '—';
  const today = '2026-07-24';
  const [date, setDate] = useState(today);
  const [mapMode, setMapMode] = useState('line');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const timerRef = useRef(null);

  const track = MAKE_TRACK(deviceCode);
  const paver = isPaverDevice(device);

  /* ── playback ── */
  const stopPlay = useCallback(() => { setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; }, []);
  const startPlay = useCallback(() => { setIsPlaying(true); setActiveIdx(0); }, []);

  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = setInterval(() => {
      setActiveIdx((i) => { if (i >= track.length - 1) { stopPlay(); return i; } return i + 1; });
    }, 1400 / speed);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, speed, track.length, stopPlay]);

  /* ── CSV export ── */
  const handleExport = () => {
    const cols = ['时间', '状态', '油耗(L)'];
    if (paver) cols.push('摊铺距离(m)');
    const rows = track.map((r) => {
      const base = [`${date} ${r.start}`, r.status, r.fuel];
      if (paver) base.push(Math.round(r.fuel * 38));
      return base.join(',');
    });
    const csv = cols.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `track_${deviceCode}_${date}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── progress fraction ── */
  const progress = track.length > 1 ? activeIdx / (track.length - 1) : 0;

  /* ── styles ── */
  const S = {
    card: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    btn: (active, color = '#3b82f6') => ({
      padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
      border: active ? 'none' : '1px solid #d1d5db',
      background: active ? color : '#fff', color: active ? '#fff' : '#6b7280', transition: 'all 0.15s',
    }),
    iconBtn: { width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 14, color: '#374151', flexShrink: 0 },
    zoomBtn: { width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer', fontSize: 16, color: '#374151' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── A. Filter bar ── */}
      <div style={{ ...S.card, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Date range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            style={{ padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 13, color: '#1f2937', outline: 'none' }} />
          <span style={{ color: '#9ca3af', fontSize: 12 }}>00:00:00</span>
          <span style={{ color: '#9ca3af', fontSize: 12 }}>→</span>
          <input type="date" value={date} readOnly
            style={{ padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 13, color: '#1f2937', outline: 'none', background: '#f9fafb' }} />
          <span style={{ color: '#9ca3af', fontSize: 12 }}>23:59:59</span>
        </div>

        {/* Prev / Next / Query */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button type="button" style={S.iconBtn} onClick={() => setDate((d) => addDays(d, -1))} aria-label="上一天"><ChevronL /></button>
          <button type="button" style={S.iconBtn} onClick={() => setDate((d) => addDays(d, 1))} aria-label="下一天"><ChevronR /></button>
          <button type="button" style={{ ...S.iconBtn, width: 'auto', padding: '0 14px', fontSize: 13, fontWeight: 500, color: '#1f2937' }}>查询</button>
        </div>

        <div style={{ flex: 1 }} />

        {/* Export */}
        <button type="button" onClick={handleExport}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: 'none', borderRadius: 6, background: '#e60012', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <DownloadSvg /> 导出
        </button>

        {/* Help */}
        <button type="button" aria-label="帮助"
          style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
          <HelpCircle />
        </button>
      </div>

      {/* ── B. Two-column: Detail (34%) + Map (66%) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, alignItems: 'start' }}>

        {/* ── Left: Track detail card ── */}
        <div style={{ ...S.card, padding: '14px 16px' }}>
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>轨迹数据明细</span>
            <button type="button" aria-label="定位"
              style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
              <LocationSvg />
            </button>
          </div>

          {/* Summary fields — device-specific */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14, padding: '10px 12px', background: '#f9fafb', borderRadius: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#9ca3af', width: 64, flexShrink: 0 }}>轨迹时间</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{date} 08:00 - 16:50</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#9ca3af', width: 64, flexShrink: 0 }}>油耗(L)</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>117.9</span>
            </div>
            {paver && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#9ca3af', width: 64, flexShrink: 0 }}>摊铺距离(m)</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>4,480</span>
              </div>
            )}
          </div>

          {/* Track records table */}
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>轨迹记录</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '28px 56px 1fr 60px', gap: 4, padding: '6px 8px', background: '#f3f4f6', borderRadius: '6px 6px 0 0', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
              <span></span><span>状态</span><span>时间段</span><span style={{ textAlign: 'right' }}>油耗</span>
            </div>
            {track.map((r, i) => {
              const statusColor = r.status === '行驶' ? '#22b573' : r.status === '工作' ? '#3b82f6' : '#f2c94c';
              return (
                <div key={r.id}
                  style={{ display: 'grid', gridTemplateColumns: '28px 56px 1fr 60px', gap: 4, padding: '7px 8px', borderBottom: '1px solid #f3f4f6', fontSize: 12, color: '#1f2937', alignItems: 'center', background: i === activeIdx ? '#f0f7ff' : 'transparent' }}>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>{i + 1}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                    {r.status}
                  </span>
                  <span style={{ color: '#6b7280' }}>{r.start} - {r.end}</span>
                  <span style={{ textAlign: 'right', fontWeight: 500 }}>{r.fuel}L</span>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: '#6b7280' }}>
            <span>{track.length} 条记录</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ padding: '3px 8px', borderRadius: 4, background: '#e60012', color: '#fff', fontWeight: 600 }}>1</span>
              <select style={{ padding: '3px 6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 11, color: '#374151', background: '#fff' }}>
                <option>5条/页</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Right: Map area ── */}
        <div style={{ ...S.card, overflow: 'hidden', position: 'relative', height: 620 }}>
          {/* Map background — local road illustration */}
          <svg width="100%" height="100%" viewBox="0 0 840 620" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
            <rect width="840" height="620" fill="#eef2ee" />
            {/* terrain blobs */}
            <rect x="20" y="40" width="200" height="140" rx="10" fill="#d4e4cf" opacity=".5" />
            <rect x="500" y="350" width="260" height="160" rx="10" fill="#d4e4cf" opacity=".4" />
            <rect x="60" y="420" width="160" height="120" rx="10" fill="#c8dcc2" opacity=".35" />
            {/* roads */}
            <line x1="0" y1="200" x2="840" y2="200" stroke="#fff" strokeWidth="7" opacity=".7" />
            <line x1="0" y1="380" x2="840" y2="380" stroke="#fff" strokeWidth="5" opacity=".5" />
            <line x1="400" y1="0" x2="400" y2="620" stroke="#fff" strokeWidth="6" opacity=".6" />
            <line x1="200" y1="0" x2="600" y2="620" stroke="#fff" strokeWidth="4" opacity=".4" />
            {/* road labels */}
            <text x="100" y="196" fontSize="10" fill="#aaa" fontWeight="500">省道 S101</text>
            <text x="404" y="100" fontSize="10" fill="#aaa" fontWeight="500" transform="rotate(-90,404,100)">经 开 路</text>
            <text x="500" y="376" fontSize="10" fill="#aaa" fontWeight="500">工业大道</text>
            <text x="250" y="500" fontSize="10" fill="#aaa" fontWeight="500">宁乡经开区</text>
          </svg>

          {/* Track line */}
          {(mapMode === 'line' || mapMode === 'points') && (
            <svg width="100%" height="100%" viewBox="0 0 840 620" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
              {mapMode === 'line' && (
                <polyline points={POLYLINE} fill="none" stroke="#e60012" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              )}
              {mapMode === 'points' && (
                <polyline points={POLYLINE} fill="none" stroke="#e6001280" strokeWidth="1.5" strokeLinecap="round" />
              )}
              {/* Nodes */}
              {MAP_PTS.map((p, i) => {
                const isFirst = i === 0;
                const isLast = i === MAP_PTS.length - 1;
                const isActive = i <= activeIdx;
                const r = isFirst || isLast ? 7 : (i === activeIdx ? 7 : 4);
                const fill = isFirst ? '#22b573' : isLast ? '#e60012' : isActive ? '#f2c94c' : '#d1d5db';
                return (
                  <g key={i}>
                    {i === activeIdx && isPlaying && (
                      <circle cx={p.x} cy={p.y} r={14} fill="none" stroke="#e60012" strokeWidth={2} opacity={0.4}>
                        <animate attributeName="r" from="8" to="20" dur="1.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.5" to="0" dur="1.2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke="#fff" strokeWidth={2} />
                  </g>
                );
              })}
              {/* Start / End labels */}
              <text x={MAP_PTS[0].x} y={MAP_PTS[0].y - 14} textAnchor="middle" fontSize="10" fill="#22b573" fontWeight="600">起点</text>
              <text x={MAP_PTS[MAP_PTS.length - 1].x} y={MAP_PTS[MAP_PTS.length - 1].y - 14} textAnchor="middle" fontSize="10" fill="#e60012" fontWeight="600">终点</text>
            </svg>
          )}

          {/* Heatmap overlay */}
          {mapMode === 'heatmap' && (
            <svg width="100%" height="100%" viewBox="0 0 840 620" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
              {MAP_PTS.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={30 + (i / MAP_PTS.length) * 25} fill={`rgba(239,68,68,${0.1 + (i / MAP_PTS.length) * 0.2})`} />
              ))}
            </svg>
          )}

          {/* Mode toggle — top-left floating */}
          <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', gap: 0, background: '#fff', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            {[{ key: 'points', label: '轨迹点' }, { key: 'line', label: '轨迹线' }, { key: 'heatmap', label: '热力图' }].map((m) => (
              <button key={m.key} type="button" onClick={() => setMapMode(m.key)}
                style={{ padding: '6px 12px', fontSize: 12, fontWeight: mapMode === m.key ? 600 : 400, border: 'none', borderBottom: mapMode === m.key ? '2px solid #e60012' : '2px solid transparent', background: 'transparent', color: mapMode === m.key ? '#e60012' : '#6b7280', cursor: 'pointer' }}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Zoom + tools — right side */}
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button type="button" style={S.zoomBtn} onClick={() => setZoom((z) => Math.min(z + 1, 5))} aria-label="放大">+</button>
            <button type="button" style={S.zoomBtn} onClick={() => setZoom((z) => Math.max(z - 1, 1))} aria-label="缩小">−</button>
            <button type="button" style={S.zoomBtn} aria-label="定位"><CrosshairSvg /></button>
            <button type="button" style={{ ...S.zoomBtn, fontSize: 12 }} aria-label="图层">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </button>
          </div>

          {/* Zoom indicator */}
          <div style={{ position: 'absolute', bottom: 60, left: 12, zIndex: 10, background: 'rgba(255,255,255,0.85)', borderRadius: 4, padding: '2px 8px', fontSize: 10, color: '#6b7280' }}>
            缩放: {zoom}x
          </div>

          {/* ── Playback bar — bottom of map ── */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, background: '#fff', borderTop: '1px solid #e5e7eb', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Play/Pause */}
            <button type="button" onClick={() => isPlaying ? stopPlay() : startPlay()}
              style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: isPlaying ? '#e60012' : '#1f2937', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              {isPlaying
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                : <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><polygon points="5,3 19,12 5,21" /></svg>}
            </button>

            {/* Replay */}
            <button type="button" aria-label="重播" onClick={() => { stopPlay(); setActiveIdx(0); }}
              style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
            </button>

            {/* Progress bar */}
            <div style={{ flex: 1, height: 4, background: '#e5e7eb', borderRadius: 2, position: 'relative', cursor: 'pointer' }}
              onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const pct = (e.clientX - rect.left) / rect.width; setActiveIdx(Math.round(pct * (track.length - 1))); }}>
              <div style={{ width: `${progress * 100}%`, height: '100%', background: '#e60012', borderRadius: 2, transition: 'width 0.2s' }} />
              <div style={{ position: 'absolute', top: -4, left: `${progress * 100}%`, width: 12, height: 12, borderRadius: '50%', background: '#e60012', border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transform: 'translateX(-50%)' }} />
            </div>

            {/* Time label */}
            <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap', minWidth: 120 }}>
              {track[activeIdx]?.start || '08:00'} - {track[track.length - 1]?.end || '16:50'}
            </span>

            {/* Speed */}
            {[1, 2, 4].map((s) => (
              <button key={s} type="button" onClick={() => setSpeed(s)}
                style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, border: `1px solid ${speed === s ? '#1f2937' : '#d1d5db'}`, background: speed === s ? '#1f2937' : '#fff', color: speed === s ? '#fff' : '#6b7280', cursor: 'pointer' }}>
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

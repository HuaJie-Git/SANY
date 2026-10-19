import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './widebody.css';
import {
  isElectricWidebody,
  getTrackDataByRange,
  normalizeDateStr,
  downloadCsv,
} from '../../data/widebody';

/* ─── Inline SVG Icons ─── */
const Svg = ({ d, size = 16, stroke = 'currentColor', fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ChevronL = () => <Svg d="M15 18l-6-6 6-6" />;
const ChevronR = () => <Svg d="M9 18l6-6-6-6" />;
const DownloadSvg = () => <Svg d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />;
const HelpCircle = () => <Svg d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />;
const LocationSvg = () => <Svg d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" size={16} />;
const CrosshairSvg = () => <Svg d="M12 2v4M12 18v4M2 12h4M18 12h4" size={16} />;

/* ─── Date Helper ─── */
const addDays = (dateStr, delta) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/* ─── Map Coordinates (Scaled to 840 x 620 to match standard HistoryTrack layout) ─── */
const MAP_PTS = [
  { x: 100, y: 440, label: '起点(采场)', color: '#22b573' },
  { x: 240, y: 360, label: '爬坡段', color: '#2563eb' },
  { x: 420, y: 270, label: '主运通道', color: '#2563eb' },
  { x: 600, y: 190, label: '下行缓坡', color: '#2563eb' },
  { x: 740, y: 130, label: '终点(破碎站)', color: '#e60012' },
];
const POLYLINE = MAP_PTS.map((p) => `${p.x},${p.y}`).join(' ');

/**
 * 宽体车历史轨迹模块 (PC-DEC-010 / V5-REVIEW-003)
 * 复用通用 HistoryTrack 顶部筛选条 + 左明细列表 + 右地图回放区经典两栏布局
 * 电车适配 kWh/km/t 指标与工况分段；燃油车显示标准暂无数据空态；示意路线标注清楚
 */
export default function WidebodyHistoryTrack({ device }) {
  const isElectric = isElectricWidebody(device);
  const deviceCode = device?.code || '—';

  // 日期/时间草稿表单状态 (V5-STATE: 日期非法就地提示，保留输入)
  const [startDate, setStartDate] = useState('2023-11-23');
  const [startTime, setStartTime] = useState('08:00');
  const [endDate, setEndDate] = useState('2023-11-23');
  const [endTime, setEndTime] = useState('18:00');
  const [errorMessage, setErrorMessage] = useState('');

  // 当前已提交并生效的轨迹查询
  const [activeQuery, setActiveQuery] = useState({
    startDate: '2023-11-23',
    startTime: '08:00',
    endDate: '2023-11-23',
    endTime: '18:00',
  });

  // 地图交互模式与缩放
  const [mapMode, setMapMode] = useState('line'); // 'line' | 'points' | 'heatmap'
  const [zoom, setZoom] = useState(1);

  // 播放器状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 ~ 100
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1, 2, 4
  const timerRef = useRef(null);

  // 空轨迹判断 (如燃油宽体车或未通车模拟日期 2023-11-01)
  const isEmptyTrack = useMemo(() => {
    if (!isElectric) return true;
    if (activeQuery.startDate === '2023-11-01') return true;
    return false;
  }, [isElectric, activeQuery.startDate]);

  // 轨迹数据集
  const trackData = useMemo(() => {
    if (!isElectric || isEmptyTrack) return null;
    return getTrackDataByRange(
      activeQuery.startDate,
      activeQuery.startTime,
      activeQuery.endDate,
      activeQuery.endTime
    );
  }, [isElectric, isEmptyTrack, activeQuery]);

  // 分段附带时间段计算
  const computedSegments = useMemo(() => {
    if (!trackData || !trackData.segments || !trackData.isValid) return [];
    let curTime = new Date(trackData.startDateTime || `${trackData.startDate}T${trackData.startTime}:00`).getTime();
    return trackData.segments.map((seg) => {
      const durationHours = parseFloat(seg.duration) || 0;
      const durationMs = durationHours * 3600 * 1000;
      const startT = new Date(curTime);
      const endT = new Date(curTime + durationMs);
      curTime += durationMs;

      const formatTime = (d) => {
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
      };
      return {
        ...seg,
        timeRangeText: `${formatTime(startT)} - ${formatTime(endT)}`,
      };
    });
  }, [trackData]);

  // 当前激活的分段索引 (根据回放进度高亮)
  const activeSegmentIdx = useMemo(() => {
    if (progress < 30) return 0;
    if (progress < 50) return 1;
    if (progress < 85) return 2;
    return 3;
  }, [progress]);

  // 播放控制
  const stopPlay = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startPlay = useCallback(() => {
    setIsPlaying(true);
    if (progress >= 100) setProgress(0);
  }, [progress]);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(20, Math.round(120 / playbackSpeed));
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            stopPlay();
            return 100;
          }
          return Math.min(100, prev + 1);
        });
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, stopPlay]);

  // 查询处理 (含就地严格校验与输入保护)
  const handleQuery = () => {
    const sNorm = normalizeDateStr(startDate);
    const eNorm = normalizeDateStr(endDate);
    if (!sNorm || !eNorm || !startTime || !endTime) {
      setErrorMessage('起止日期和时间均不能为空');
      return;
    }
    const result = getTrackDataByRange(sNorm, startTime, eNorm, endTime);
    if (!result.isValid) {
      setErrorMessage(result.error);
      return;
    }
    setErrorMessage('');
    stopPlay();
    setProgress(0);
    setActiveQuery({
      startDate: sNorm,
      startTime,
      endDate: eNorm,
      endTime,
    });
  };

  const handlePrevDay = () => {
    const sNorm = normalizeDateStr(startDate);
    const eNorm = normalizeDateStr(endDate);
    if (!sNorm || !eNorm) return;
    const newStart = addDays(sNorm, -1);
    const newEnd = addDays(eNorm, -1);
    setStartDate(newStart);
    setEndDate(newEnd);
    setErrorMessage('');
    stopPlay();
    setProgress(0);
    setActiveQuery({
      startDate: newStart,
      startTime,
      endDate: newEnd,
      endTime,
    });
  };

  const handleNextDay = () => {
    const sNorm = normalizeDateStr(startDate);
    const eNorm = normalizeDateStr(endDate);
    if (!sNorm || !eNorm) return;
    const newStart = addDays(sNorm, 1);
    const newEnd = addDays(eNorm, 1);
    setStartDate(newStart);
    setEndDate(newEnd);
    setErrorMessage('');
    stopPlay();
    setProgress(0);
    setActiveQuery({
      startDate: newStart,
      startTime,
      endDate: newEnd,
      endTime,
    });
  };

  // CSV 导出
  const handleExport = () => {
    if (!isElectric || isEmptyTrack || !trackData || !trackData.isValid || !computedSegments.length) return;
    const columns = [
      { key: 'segment', label: '分段' },
      { key: 'status', label: '状态' },
      { key: 'timeRange', label: '时间段' },
      { key: 'duration', label: '工时(h)' },
      { key: 'mileage', label: '里程(km)' },
      { key: 'energy', label: '电耗(kWh)' },
      { key: 'avgSpeed', label: '平均车速' },
      { key: 'note', label: '说明' },
    ];
    const rows = computedSegments.map((seg) => ({
      segment: seg.title,
      status: seg.status,
      timeRange: seg.timeRangeText,
      duration: seg.duration,
      mileage: seg.mileage,
      energy: seg.energy,
      avgSpeed: seg.avgSpeed,
      note: seg.note,
    }));
    downloadCsv(`track_${deviceCode}_${activeQuery.startDate}.csv`, columns, rows);
  };

  // 动态插值计算小车位置与指标
  const vehicleState = useMemo(() => {
    if (!trackData || !trackData.isValid) {
      return { x: 100, y: 440, speed: 0, energy: 0 };
    }
    const totalPoints = MAP_PTS.length;
    const fraction = progress / 100;
    const scaledIndex = fraction * (totalPoints - 1);
    const lowerIdx = Math.floor(scaledIndex);
    const upperIdx = Math.min(totalPoints - 1, Math.ceil(scaledIndex));
    const factor = scaledIndex - lowerIdx;

    const p1 = MAP_PTS[lowerIdx];
    const p2 = MAP_PTS[upperIdx];

    const curX = p1.x + (p2.x - p1.x) * factor;
    const curY = p1.y + (p2.y - p1.y) * factor;

    const totalEnergy = parseFloat(trackData.totalEnergy) || 0;
    const curEnergy = (totalEnergy * fraction).toFixed(1);
    const avgSpeed = parseFloat(trackData.avgSpeed) || 0;
    const speedMultiplier = lowerIdx === 1 ? 0.9 : lowerIdx === 2 ? 1.2 : 1.0;
    const curSpeed = Math.round(avgSpeed * speedMultiplier);

    return {
      x: curX,
      y: curY,
      speed: curSpeed,
      energy: curEnergy,
    };
  }, [trackData, progress]);

  // 回放动态当前时间
  const currentTimeStr = useMemo(() => {
    if (!trackData || !trackData.isValid) return '—';
    const startDT = new Date(trackData.startDateTime || `${trackData.startDate}T${trackData.startTime}:00`);
    const endDT = new Date(trackData.endDateTime || `${trackData.endDate}T${trackData.endTime}:00`);
    const totalMs = Math.max(1000, endDT.getTime() - startDT.getTime());
    const currentMs = startDT.getTime() + totalMs * (progress / 100);
    const curDate = new Date(currentMs);
    const curH = String(curDate.getHours()).padStart(2, '0');
    const curM = String(curDate.getMinutes()).padStart(2, '0');
    return `${curH}:${curM}`;
  }, [trackData, progress]);

  /* ── 统一通用样式对象 ── */
  const S = {
    card: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    iconBtn: {
      width: 32,
      height: 32,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      background: '#fff',
      cursor: 'pointer',
      fontSize: 14,
      color: '#374151',
      flexShrink: 0,
    },
    zoomBtn: {
      width: 34,
      height: 34,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 6,
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      cursor: 'pointer',
      fontSize: 16,
      color: '#374151',
    },
  };

  return (
    <div className="widebody-track-page" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* ── A. Filter bar (沿用通用 HistoryTrack 顶部工具栏) ── */}
      <div style={{ ...S.card, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* 日期与时间范围输入 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 13, color: '#4b5563' }}>开始:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="开始日期"
              style={{ padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 13, color: '#1f2937', outline: 'none' }}
            />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              aria-label="开始时间"
              style={{ padding: '5px 6px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 13, color: '#1f2937', outline: 'none', minWidth: 100 }}
            />
          </div>
          <span style={{ color: '#9ca3af', fontSize: 12 }}>→</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 13, color: '#4b5563' }}>结束:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="结束日期"
              style={{ padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 13, color: '#1f2937', outline: 'none' }}
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              aria-label="结束时间"
              style={{ padding: '5px 6px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 13, color: '#1f2937', outline: 'none', minWidth: 100 }}
            />
          </div>
        </div>

        {/* Prev / Next / Query */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button type="button" style={S.iconBtn} onClick={handlePrevDay} aria-label="上一天"><ChevronL /></button>
          <button type="button" style={S.iconBtn} onClick={handleNextDay} aria-label="下一天"><ChevronR /></button>
          <button
            type="button"
            onClick={handleQuery}
            style={{ ...S.iconBtn, width: 'auto', padding: '0 14px', fontSize: 13, fontWeight: 500, color: '#1f2937' }}
          >
            查询
          </button>
        </div>

        <div style={{ flex: 1 }} />

        {/* Export */}
        <button
          type="button"
          onClick={handleExport}
          disabled={!isElectric || isEmptyTrack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 14px',
            border: 'none',
            borderRadius: 6,
            background: (!isElectric || isEmptyTrack) ? '#9ca3af' : '#e60012',
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            cursor: (!isElectric || isEmptyTrack) ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <DownloadSvg /> 导出
        </button>

        {/* Help */}
        <button
          type="button"
          aria-label="帮助"
          style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}
        >
          <HelpCircle />
        </button>

        {/* 就地错误提示 (V5-STATE: 保留输入，修正后可直接查询) */}
        {errorMessage && (
          <div className="widebody-track-error-inline" role="alert" style={{ width: '100%', marginTop: 6 }}>
            <span className="widebody-track-error-dot" /> {errorMessage}
          </div>
        )}
      </div>

      {/* ── B. Two-column: Detail (1fr) + Map (2fr) (沿用通用 HistoryTrack 左右两栏布局) ── */}
      <div className="widebody-track-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, alignItems: 'start' }}>

        {/* ── Left: Track detail card ── */}
        <div style={{ ...S.card, padding: '14px 16px' }}>
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>轨迹数据明细</span>
            <button
              type="button"
              aria-label="定位"
              style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}
            >
              <LocationSvg />
            </button>
          </div>

          {/* Summary fields — 宽体车适配指标 (kWh/km/t) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14, padding: '10px 12px', background: '#f9fafb', borderRadius: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#9ca3af', width: 72, flexShrink: 0 }}>轨迹时间</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>
                {activeQuery.startDate} {activeQuery.startTime} - {activeQuery.endTime}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#9ca3af', width: 72, flexShrink: 0 }}>
                {isElectric ? '电耗(kWh)' : '能耗(L)'}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>
                {(!isElectric || isEmptyTrack) ? '—' : trackData?.totalEnergy}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#9ca3af', width: 72, flexShrink: 0 }}>里程(km)</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>
                {(!isElectric || isEmptyTrack) ? '—' : trackData?.totalMileage}
              </span>
            </div>
            {isElectric && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#9ca3af', width: 72, flexShrink: 0 }}>制动回收</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>
                  {isEmptyTrack ? '—' : `${trackData?.recoveryEnergy} kWh`}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#9ca3af', width: 72, flexShrink: 0 }}>平均车速</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>
                {(!isElectric || isEmptyTrack) ? '—' : `${trackData?.avgSpeed} km/h`}
              </span>
            </div>
          </div>

          {/* Track records table / 轨迹记录 */}
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>轨迹记录</div>
          {(!isElectric || isEmptyTrack || !computedSegments.length) ? (
            <div style={{ padding: '36px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              暂无轨迹记录
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '24px 64px 1fr 70px', gap: 4, padding: '6px 8px', background: '#f3f4f6', borderRadius: '6px 6px 0 0', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
                <span></span>
                <span>状态</span>
                <span>时间段</span>
                <span style={{ textAlign: 'right' }}>电耗</span>
              </div>
              {computedSegments.map((r, i) => {
                const statusColor = r.type === 'drive' ? '#2563eb' : r.type === 'idle' ? '#f59e0b' : '#10b981';
                const isActive = i === activeSegmentIdx;
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      const targetPct = i === 0 ? 0 : i === 1 ? 30 : i === 2 ? 50 : 85;
                      setProgress(targetPct);
                    }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '24px 64px 1fr 70px',
                      gap: 4,
                      padding: '7px 8px',
                      borderBottom: '1px solid #f3f4f6',
                      fontSize: 12,
                      color: '#1f2937',
                      alignItems: 'center',
                      background: isActive ? '#f0f7ff' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 10, color: '#9ca3af' }}>{i + 1}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                      {r.status}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: 11 }}>{r.timeRangeText}</span>
                    <span style={{ textAlign: 'right', fontWeight: 500, fontSize: 12 }}>{r.energy}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: '#6b7280' }}>
            <span>{(!isElectric || isEmptyTrack) ? 0 : computedSegments.length} 条记录</span>
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
          {/* Map background — local terrain & road illustration */}
          <svg width="100%" height="100%" viewBox="0 0 840 620" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
            <rect width="840" height="620" fill="#eef2ee" />
            {/* terrain blobs */}
            <rect x="20" y="40" width="220" height="150" rx="10" fill="#d4e4cf" opacity=".5" />
            <rect x="520" y="340" width="280" height="180" rx="10" fill="#d4e4cf" opacity=".4" />
            <rect x="60" y="420" width="180" height="130" rx="10" fill="#c8dcc2" opacity=".35" />
            {/* roads */}
            <line x1="0" y1="210" x2="840" y2="210" stroke="#fff" strokeWidth="7" opacity=".7" />
            <line x1="0" y1="390" x2="840" y2="390" stroke="#fff" strokeWidth="5" opacity=".5" />
            <line x1="420" y1="0" x2="420" y2="620" stroke="#fff" strokeWidth="6" opacity=".6" />
            <line x1="220" y1="0" x2="620" y2="620" stroke="#fff" strokeWidth="4" opacity=".4" />
            {/* road labels */}
            <text x="100" y="206" fontSize="10" fill="#94a3b8" fontWeight="500">省道 S101</text>
            <text x="424" y="100" fontSize="10" fill="#94a3b8" fontWeight="500" transform="rotate(-90,424,100)">采场主运通道</text>
            <text x="520" y="386" fontSize="10" fill="#94a3b8" fontWeight="500">矿区连接通道</text>
            <text x="260" y="510" fontSize="10" fill="#94a3b8" fontWeight="500">破碎站主干道</text>
          </svg>

          {/* 轨迹路线绘制 (有数据才渲染，空态不生造假路线；标题为“轨迹示意”) */}
          {(!isEmptyTrack && isElectric && trackData && trackData.isValid) && (
            <>
              {(mapMode === 'line' || mapMode === 'points') && (
                <svg width="100%" height="100%" viewBox="0 0 840 620" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
                  {mapMode === 'line' && (
                    <polyline points={POLYLINE} fill="none" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {mapMode === 'points' && (
                    <polyline points={POLYLINE} fill="none" stroke="#2563eb80" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />
                  )}
                  {/* Nodes */}
                  {MAP_PTS.map((p, i) => {
                    const isFirst = i === 0;
                    const isLast = i === MAP_PTS.length - 1;
                    const r = isFirst || isLast ? 7 : 4.5;
                    const fill = p.color;
                    return (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke="#fff" strokeWidth={2} />
                        <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="10" fill={p.color} fontWeight="600">
                          {p.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* 动态小车位置指示器 */}
                  <g transform={`translate(${vehicleState.x}, ${vehicleState.y})`}>
                    {isPlaying && (
                      <circle cx="0" cy="0" r="14" fill="none" stroke="#2563eb" strokeWidth="2" opacity="0.4">
                        <animate attributeName="r" from="8" to="22" dur="1.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.5" to="0" dur="1.2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx="0" cy="0" r="7" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2" />
                  </g>
                </svg>
              )}

              {/* Heatmap overlay */}
              {mapMode === 'heatmap' && (
                <svg width="100%" height="100%" viewBox="0 0 840 620" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
                  {MAP_PTS.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={35 + (i / MAP_PTS.length) * 25} fill={`rgba(37,99,235,${0.15 + (i / MAP_PTS.length) * 0.2})`} />
                  ))}
                </svg>
              )}
            </>
          )}

          {/* 无轨迹数据空态蒙层 (PC-DEC-008 / V5-REVIEW-001: 燃油按已有可用数据呈现，缺失显示空态，不画假路线) */}
          {(isEmptyTrack || !isElectric) && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,250,252,0.85)', padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 36, color: '#94a3b8', marginBottom: 8 }}>⛟</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#334155', margin: '0 0 6px 0' }}>暂无历史轨迹数据</h3>
              <p style={{ fontSize: 13, color: '#64748b', maxWidth: 380, lineHeight: 1.5, margin: 0 }}>
                该设备暂未上传专属地理信息及工况分段轨迹，请核对时间或在上方选择其它日期重新查询。
              </p>
            </div>
          )}

          {/* Title tag on top-center: “轨迹示意” (V5-REVIEW-001: 图标题用“轨迹示意”，交付文案不得称真实路线) */}
          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.92)', padding: '4px 14px', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', fontSize: 12, color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', maxWidth: '90%', justifyContent: 'center' }}>
            <span>轨迹示意</span>
            {isElectric && !isEmptyTrack && (
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>
                当前车速: {vehicleState.speed} km/h | 累积电耗: {vehicleState.energy} kWh
              </span>
            )}
          </div>

          {/* Mode toggle — top-left floating */}
          <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', gap: 0, background: '#fff', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            {[{ key: 'line', label: '轨迹线' }, { key: 'points', label: '轨迹点' }, { key: 'heatmap', label: '热力图' }].map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMapMode(m.key)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: mapMode === m.key ? 600 : 400,
                  border: 'none',
                  borderBottom: mapMode === m.key ? '2px solid #2563eb' : '2px solid transparent',
                  background: 'transparent',
                  color: mapMode === m.key ? '#2563eb' : '#6b7280',
                  cursor: 'pointer',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Zoom + tools — right side */}
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button type="button" style={S.zoomBtn} onClick={() => setZoom((z) => Math.min(z + 1, 5))} aria-label="放大">+</button>
            <button type="button" style={S.zoomBtn} onClick={() => setZoom((z) => Math.max(z - 1, 1))} aria-label="缩小">−</button>
            <button type="button" style={S.zoomBtn} aria-label="定位"><CrosshairSvg /></button>
          </div>

          {/* Zoom indicator */}
          <div style={{ position: 'absolute', bottom: 60, left: 12, zIndex: 10, background: 'rgba(255,255,255,0.85)', borderRadius: 4, padding: '2px 8px', fontSize: 10, color: '#6b7280' }}>
            缩放: {zoom}x
          </div>

          {/* ── Playback bar — bottom of map (V5-REVIEW-001: 原生 range + 动态当前时间 + 键盘可用) ── */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, background: '#fff', borderTop: '1px solid #e5e7eb', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Play/Pause */}
            <button
              type="button"
              disabled={isEmptyTrack || !isElectric}
              onClick={() => isPlaying ? stopPlay() : startPlay()}
              aria-label={isPlaying ? '暂停回放' : '开始回放'}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                background: (isEmptyTrack || !isElectric) ? '#9ca3af' : isPlaying ? '#2563eb' : '#1f2937',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (isEmptyTrack || !isElectric) ? 'not-allowed' : 'pointer',
                flexShrink: 0,
              }}
            >
              {isPlaying ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><polygon points="5,3 19,12 5,21" /></svg>
              )}
            </button>

            {/* Replay */}
            <button
              type="button"
              aria-label="重播"
              disabled={isEmptyTrack || !isElectric}
              onClick={() => { stopPlay(); setProgress(0); }}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1px solid #d1d5db',
                background: '#fff',
                cursor: (isEmptyTrack || !isElectric) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: (isEmptyTrack || !isElectric) ? '#9ca3af' : '#6b7280',
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
            </button>

            {/* 原生 range 进度条 (键盘方向键可用，dir=ltr，无虚假拖拽偏移) */}
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              disabled={isEmptyTrack || !isElectric}
              onChange={(e) => setProgress(Number(e.target.value))}
              aria-label="回放进度"
              dir="ltr"
              className="widebody-track-range-input"
            />

            {/* 动态随进度变化的时间显示: currentTimeStr / startTime - endTime */}
            <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap', minWidth: 130, fontFamily: 'monospace' }}>
              {(isEmptyTrack || !isElectric) ? '—' : `${currentTimeStr} / ${activeQuery.startTime} - ${activeQuery.endTime}`}
            </span>

            {/* Speed buttons */}
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                type="button"
                disabled={isEmptyTrack || !isElectric}
                onClick={() => setPlaybackSpeed(s)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  border: `1px solid ${playbackSpeed === s ? '#1f2937' : '#d1d5db'}`,
                  background: playbackSpeed === s ? '#1f2937' : '#fff',
                  color: playbackSpeed === s ? '#fff' : '#6b7280',
                  cursor: (isEmptyTrack || !isElectric) ? 'not-allowed' : 'pointer',
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

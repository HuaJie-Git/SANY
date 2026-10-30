import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ELECTRIC_WIDEBODY_INFO,
  ELECTRIC_REALTIME_METRICS,
  getTrackDataByRange,
} from './electricWidebodyData';
import { useWidebodyState } from './useWidebodyState';

export default function ElectricTrackPlayback({ device, initialDate = '2023-11-23', onBack }) {
  // 草稿输入表单状态 (FIX-003: 独立草稿，未点击查询绝不影响画面已展示数据与回放时间)
  const [startDateInput, setStartDateInput] = useState(initialDate);
  const [startTimeInput, setStartTimeInput] = useState('08:00');
  const [endDateInput, setEndDateInput] = useState(initialDate);
  const [endTimeInput, setEndTimeInput] = useState('18:00');

  // 当前已提交生效并驱动画面的轨迹数据集
  const [trackData, setTrackData] = useState(() =>
    getTrackDataByRange(initialDate, '08:00', initialDate, '18:00')
  );

  const [queryError, setQueryError] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [isEmptyTrack, setIsEmptyTrack] = useState(false);

  // 播放器状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 - 100
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1, 2, 4
  const [expandedSegmentId, setExpandedSegmentId] = useState(1);

  const timerRef = useRef(null);
  const queryTimerRef = useRef(null);
  const querySeqRef = useRef(0);

  const clearPlaybackTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 播放定时器逻辑
  useEffect(() => {
    if (isPlaying) {
      clearPlaybackTimer();
      const intervalMs = Math.max(20, Math.round(120 / playbackSpeed));
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearPlaybackTimer();
            setIsPlaying(false);
            return 100;
          }
          return Math.min(100, prev + 1);
        });
      }, intervalMs);
    } else {
      clearPlaybackTimer();
    }
    return () => clearPlaybackTimer();
  }, [isPlaying, playbackSpeed]);

  useEffect(() => {
    return () => {
      clearPlaybackTimer();
      if (queryTimerRef.current) clearTimeout(queryTimerRef.current);
    };
  }, []);

  // STATE-002 异常状态机集成 (FIX-004 / F2-04: 重试不重置日期)
  const { isOffline, hasBlockingState, renderStateOverlay } = useWidebodyState(onBack);

  // 根据进度百分比，在已生效的数据上动态计算当前小车坐标、时间戳、车速与累积电耗
  const currentVehicleState = useMemo(() => {
    const waypoints = trackData.waypoints;
    const totalPoints = waypoints.length;
    if (totalPoints === 0) return { x: 45, y: 155, timeStr: '08:00', speed: 0, energy: 0 };

    const fraction = progress / 100;
    const scaledIndex = fraction * (totalPoints - 1);
    const lowerIdx = Math.floor(scaledIndex);
    const upperIdx = Math.min(totalPoints - 1, Math.ceil(scaledIndex));
    const factor = scaledIndex - lowerIdx;

    const p1 = waypoints[lowerIdx];
    const p2 = waypoints[upperIdx];

    const curX = p1.x + (p2.x - p1.x) * factor;
    const curY = p1.y + (p2.y - p1.y) * factor;
    const curSpeed = Math.round(p1.speed + (p2.speed - p1.speed) * factor);
    const curEnergy = (parseFloat(trackData.totalEnergy) * fraction).toFixed(1);

    // 根据已生效的 startDateTime / endDateTime 计算当前时刻
    const startDT = new Date(trackData.startDateTime || `${trackData.startDate}T${trackData.startTime}:00`);
    const endDT = new Date(trackData.endDateTime || `${trackData.endDate}T${trackData.endTime}:00`);
    const totalMs = Math.max(1000, endDT.getTime() - startDT.getTime());
    const currentMs = startDT.getTime() + totalMs * fraction;
    const curDate = new Date(currentMs);
    const curH = String(curDate.getHours()).padStart(2, '0');
    const curM = String(curDate.getMinutes()).padStart(2, '0');

    return {
      x: curX,
      y: curY,
      timeStr: `${curH}:${curM}`,
      speed: curSpeed,
      energy: curEnergy,
    };
  }, [progress, trackData]);

  const batteryLevel = useMemo(() => {
    const metric = ELECTRIC_REALTIME_METRICS.find((m) => m.label === '剩余电量');
    return metric ? metric.value : '78';
  }, []);

  const playedTimeStr = useMemo(() => {
    const totalMinutes = trackData.durationMinutes || Math.round((trackData.durationHours || 0) * 60) || 0;
    const elapsedMinutes = Math.round(totalMinutes * (progress / 100));
    const h = Math.floor(elapsedMinutes / 60);
    const m = elapsedMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }, [trackData, progress]);

  const computedSegments = useMemo(() => {
    let curTime = new Date(trackData.startDateTime || `${trackData.startDate}T${trackData.startTime}:00`).getTime();
    return trackData.segments.map((seg) => {
      const durationHours = parseFloat(seg.duration) || 0;
      const durationMs = durationHours * 3600 * 1000;
      const startTime = new Date(curTime);
      const endTime = new Date(curTime + durationMs);
      curTime += durationMs;

      const formatTime = (d) => {
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        const s = String(d.getSeconds()).padStart(2, '0');
        return `${h}:${m}:${s}`;
      };
      return {
        ...seg,
        timeRangeText: `${formatTime(startTime)} - ${formatTime(endTime)}`,
      };
    });
  }, [trackData]);

  // 查询校验并驱动结果更新 (FIX-003 / F2-02 / STYLE-FUEL-FIX-01)
  const handleQuery = (e) => {
    if (e) e.preventDefault();
    clearPlaybackTimer();
    setIsPlaying(false);

    if (!startDateInput || !startTimeInput || !endDateInput || !endTimeInput) {
      setQueryError('起止日期和时间均不能为空');
      return;
    }

    const startDT = new Date(`${startDateInput}T${startTimeInput}:00`);
    const endDT = new Date(`${endDateInput}T${endTimeInput}:00`);

    if (isNaN(startDT.getTime()) || isNaN(endDT.getTime())) {
      setQueryError('请输入合法的日期和时间格式');
      return;
    }

    if (endDT <= startDT) {
      setQueryError('结束时间必须晚于开始时间');
      return;
    }

    const diffHours = (endDT.getTime() - startDT.getTime()) / (1000 * 60 * 60);
    if (diffHours > 24) {
      setQueryError('单次查询时间跨度不能超过 24 小时');
      return;
    }

    setQueryError('');
    setIsQuerying(true);

    if (queryTimerRef.current) {
      clearTimeout(queryTimerRef.current);
    }
    const seq = ++querySeqRef.current;

    queryTimerRef.current = setTimeout(() => {
      if (seq !== querySeqRef.current) return;
      setIsQuerying(false);
      // 空轨迹模拟判断 (如查询历史未通车日期 2023-11-01)
      if (startDateInput === '2023-11-01') {
        setIsEmptyTrack(true);
      } else {
        setIsEmptyTrack(false);
        const newTrack = getTrackDataByRange(
          startDateInput,
          startTimeInput,
          endDateInput,
          endTimeInput
        );
        setTrackData(newTrack);
      }
      setProgress(0);
    }, 200);
  };

  const handleResetToDefault = () => {
    if (queryTimerRef.current) clearTimeout(queryTimerRef.current);
    clearPlaybackTimer();
    setIsPlaying(false);
    setStartDateInput(initialDate);
    setStartTimeInput('08:00');
    setEndDateInput(initialDate);
    setEndTimeInput('18:00');
    setQueryError('');
    setIsEmptyTrack(false);
    setProgress(0);
    setTrackData(getTrackDataByRange(initialDate, '08:00', initialDate, '18:00'));
  };

  const handleTogglePlay = () => {
    if (progress >= 100) setProgress(0);
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-full bg-[#f1f3f7] text-[#252b33]" dir="auto">
      {/* 顶部导航 (STYLE-FUEL-002: 灰底 min-h-[52px] py-2, 左箭头+编号, 深灰图标, RTL) */}
      <header className="sticky top-0 z-20 bg-[#f1f3f7]/95 backdrop-blur-sm">
        <div className="min-h-[52px] py-2 px-3 flex items-center">
          <button
            type="button"
            onClick={onBack}
            className="h-9 w-9 flex items-center justify-center rounded-full active:bg-black/5 shrink-0"
            aria-label="返回详情页"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#252b33" strokeWidth="2" strokeLinecap="round" className="rtl:rotate-180">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div className="min-w-0 flex-1 px-2 text-center">
            <h1 className="text-[15px] font-medium text-[#252b33] break-words break-all">轨迹回放</h1>
            <p className="text-[10px] text-[#7a8290] break-all">{device?.code || 'POPJ0841016452'}</p>
          </div>

          <div className="text-right shrink-0">
            {isOffline || device?.status === 'offline' ? (
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium text-[#b45309] bg-[#fffbeb] rounded">
                离线 · 11-23 07:45
              </span>
            ) : (
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium text-[#15803d] bg-[#f0fdf4] rounded">
                在线
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 阻塞型异常覆盖 */}
      {hasBlockingState && renderStateOverlay('轨迹数据暂无记录', '当前设备在此时间段内暂无历史行驶轨迹，可调整时间或重新加载')}

      {!hasBlockingState && (
        <>
          {/* 查询条件表单 (STYLE-FUEL-004: 燃油白卡, 输入框与按钮风格) */}
          <section className="mx-3 mt-3 rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
            <form onSubmit={handleQuery} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold text-[#252b33]">选择时间范围</span>
                <span className="text-[11px] text-[#7a8290]">最多24小时</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#7a8290] mb-1">开始时间</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="date"
                      value={startDateInput}
                      onChange={(e) => setStartDateInput(e.target.value)}
                      className="w-full px-2 py-1.5 text-[11px] bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg text-[#252b33] focus:outline-none"
                    />
                    <input
                      type="time"
                      value={startTimeInput}
                      onChange={(e) => setStartTimeInput(e.target.value)}
                      className="w-16 px-1 py-1.5 text-[11px] bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg text-[#252b33] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#7a8290] mb-1">结束时间</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="date"
                      value={endDateInput}
                      onChange={(e) => setEndDateInput(e.target.value)}
                      className="w-full px-2 py-1.5 text-[11px] bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg text-[#252b33] focus:outline-none"
                    />
                    <input
                      type="time"
                      value={endTimeInput}
                      onChange={(e) => setEndTimeInput(e.target.value)}
                      className="w-16 px-1 py-1.5 text-[11px] bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg text-[#252b33] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {queryError && (
                <div className="text-[11px] text-[#e53935]">
                  {queryError}
                </div>
              )}

              <button
                type="submit"
                disabled={isQuerying}
                className="w-full py-2.5 text-[13px] font-medium text-white bg-[#252b33] rounded-[10px] active:opacity-80 disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
              >
                {isQuerying ? '查询中...' : '查询轨迹'}
              </button>
            </form>
          </section>

          {/* 空轨迹状态展示 */}
          {isEmptyTrack ? (
            <div className="mx-3 mt-3 rounded-[14px] bg-white p-8 shadow-[0_1px_2px_rgba(31,41,55,0.035)] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#f0f1f3] text-[#252b33] flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-[15px] font-semibold text-[#252b33]">该时段暂无行驶轨迹</h3>
              <p className="text-[12px] text-[#7a8290]">该时间段内车辆处于关机或驻留状态，无有效作业轨迹数据</p>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-5 py-2 text-[12px] font-medium text-white bg-[#252b33] rounded-[10px] active:opacity-80"
              >
                重置为默认时段
              </button>
            </div>
          ) : (
            <main className="pb-8 space-y-3">
              {/* 地图线路与动态小车视窗 (STYLE-FUEL-001 TrajectoryMap 规范) */}
              <section className="relative mt-3 h-64 bg-[#f8f9fa] border-y border-gray-200 overflow-hidden">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 380 200" preserveAspectRatio="none" aria-hidden="true">
                  <line x1="0" y1="40" x2="380" y2="40" stroke="#ffffff" strokeWidth="4" />
                  <line x1="0" y1="90" x2="380" y2="90" stroke="#ffffff" strokeWidth="5" />
                  <line x1="0" y1="150" x2="380" y2="150" stroke="#ffffff" strokeWidth="4" />
                  <line x1="90" y1="0" x2="90" y2="200" stroke="#ffffff" strokeWidth="4" />
                  <line x1="260" y1="0" x2="260" y2="200" stroke="#ffffff" strokeWidth="6" />

                  <polygon points="20,180 120,120 180,135 100,195" fill="#e2e8f0" fillOpacity="0.5" />
                  <polygon points="120,120 220,70 280,85 180,135" fill="#cbd5e1" fillOpacity="0.4" />
                  <polygon points="220,70 320,30 365,40 280,85" fill="#94a3b8" fillOpacity="0.3" />

                  {/* 轨迹底衬与主线 */}
                  <path
                    d="M 45 155 Q 110 140 165 95 T 345 40"
                    fill="none"
                    stroke="#bfdbfe"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 45 155 Q 110 140 165 95 T 345 40"
                    fill="none"
                    stroke="#2377f3"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* 起点终点图钉 */}
                  <circle cx="45" cy="155" r="5" fill="#15803d" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="345" cy="40" r="5" fill="#b91c1c" stroke="#ffffff" strokeWidth="1.5" />

                  {/* 当前回放小车 */}
                  <g transform={`translate(${currentVehicleState.x}, ${currentVehicleState.y})`}>
                    <circle r="9" fill="#2377f3" stroke="#ffffff" strokeWidth="2.5" />
                    <circle r="3.5" fill="#ffffff" />
                  </g>
                </svg>

                {/* 浮动实时信息窗 */}
                <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/95 rounded-xl shadow-sm text-[11px] text-[#252b33] flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#15803d]"></span>
                    <span>{currentVehicleState.timeStr}</span>
                  </div>
                  <span>车速: {currentVehicleState.speed} km/h</span>
                  <span>剩余: {batteryLevel}%</span>
                </div>

                {/* Google 水印 */}
                <div className="absolute left-3 bottom-2 flex items-center font-sans text-[12px] font-bold tracking-tight select-none">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </div>
              </section>

              {/* 播放器/起终点/里程电耗摘要 同白卡 (STYLE-FUEL-004) */}
              <section className="mx-3 rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)] space-y-3">
                {/* 播放控制器 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      className="flex items-center justify-center w-8 h-8 rounded-full text-white bg-[#252b33] active:opacity-80 shrink-0 cursor-pointer"
                      aria-label={isPlaying ? '暂停回放' : '开始回放'}
                    >
                      {isPlaying ? (
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2377f3]"
                    />
                    <span className="text-[10px] text-[#7a8290] font-mono shrink-0">
                      {playedTimeStr} / {trackData.durationHours ? `${trackData.durationHours}h` : '02:30'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextSpeed = playbackSpeed === 1 ? 2 : playbackSpeed === 2 ? 4 : 1;
                        setPlaybackSpeed(nextSpeed);
                      }}
                      className="px-2 py-0.5 text-[10px] font-medium bg-[#f1f2f4] rounded text-[#252b33] cursor-pointer"
                    >
                      {playbackSpeed}x
                    </button>
                  </div>
                </div>

                {/* 起终点与总里程/总电耗 */}
                <div className="pt-3 border-t border-gray-100 space-y-1.5 text-[11px] text-[#666]">
                  <div className="break-words">起点位置：{ELECTRIC_WIDEBODY_INFO.startLocation}</div>
                  <div className="break-words">终点位置：{ELECTRIC_WIDEBODY_INFO.endLocation}</div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    <div>
                      <div className="flex items-baseline gap-1 text-[#303640]">
                        <span className="text-[23px] font-normal leading-none tracking-[-0.4px]">{trackData.totalMileage}</span>
                        <span className="text-[12px] font-medium text-[#7a8290]">km</span>
                      </div>
                      <div className="mt-2 text-[12px] text-[#7a8290]">行驶里程</div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1 text-[#303640]">
                        <span className="text-[23px] font-normal leading-none tracking-[-0.4px]">{trackData.totalEnergy}</span>
                        <span className="text-[12px] font-medium text-[#7a8290]">kWh</span>
                      </div>
                      <div className="mt-2 text-[12px] text-[#7a8290]">能耗</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 轨迹详情纵向列表 (STYLE-FUEL-004) */}
              <section className="mx-3 rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
                <h2 className="text-[15px] font-semibold text-[#252b33] mb-3">轨迹详情</h2>
                <div className="space-y-2">
                  {computedSegments.map((seg) => {
                    const isExp = expandedSegmentId === seg.id;
                    const isDrive = seg.type === 'drive';
                    return (
                      <div
                        key={seg.id}
                        className="p-3 bg-[#f8f9fa] rounded-xl border border-gray-100 transition-all"
                      >
                        <button
                          type="button"
                          aria-expanded={isExp}
                          onClick={() => setExpandedSegmentId(isExp ? null : seg.id)}
                          className="w-full flex items-center justify-between cursor-pointer text-left focus:outline-none"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isDrive ? 'bg-[#2377f3]' : 'bg-[#f3c84b]'
                              }`}
                            ></span>
                            <span className="text-[12px] font-medium text-[#252b33]">{seg.title}</span>
                            <span className="text-[10px] text-[#7a8290]">{seg.timeRangeText}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#7a8290]">{seg.duration}</span>
                            <svg
                              className={`w-3.5 h-3.5 text-[#7a8290] transform transition-transform ${
                                isExp ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {isExp && (
                          <div className="mt-2 pt-2 border-t border-gray-200/60 space-y-1.5 text-[11px] text-[#7a8290]">
                            {isDrive ? (
                              <>
                                <div>• 起点：{ELECTRIC_WIDEBODY_INFO.startLocation}</div>
                                <div>• 终点：{ELECTRIC_WIDEBODY_INFO.endLocation}</div>
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                  <div>
                                    <span className="text-[10px] block text-[#7a8290]">行驶里程</span>
                                    <span className="text-[13px] font-medium text-[#252b33]">{seg.mileage}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] block text-[#7a8290]">能耗</span>
                                    <span className="text-[13px] font-medium text-[#252b33]">{seg.energy}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] block text-[#7a8290]">最高车速</span>
                                    <span className="text-[13px] font-medium text-[#252b33]">{seg.maxSpeed || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] block text-[#7a8290]">平均车速</span>
                                    <span className="text-[13px] font-medium text-[#252b33]">{seg.avgSpeed}</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>• 位置：{ELECTRIC_WIDEBODY_INFO.location}</div>
                                <div>
                                  <span className="text-[10px] block text-[#7a8290]">能耗</span>
                                  <span className="text-[13px] font-medium text-[#252b33]">{seg.energy}</span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </main>
          )}
        </>
      )}
    </div>
  );
}

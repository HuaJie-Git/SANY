import React, { useState, useMemo, useEffect } from 'react';
import { getOperationsData, validateDateRange } from '../../data/widebodyReports.js';

/* ─── Inline Icons ─── */
function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 0 0-9.95 9h19.9A10 10 0 0 0 12 2Z" />
      <path d="m12 11 3-3" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * 车速半圆仪表组件 (180度半圆弧, 0..50 km/h 真实刻度)
 * 仪表中心为轴 (100, 105), 尖端指向读数标准三角指针, 标注 0, 25, 50 刻度端点
 */
function SpeedGauge({ speed, title }) {
  const hasSpeed = typeof speed === 'number' && !Number.isNaN(speed);
  const clampedSpeed = hasSpeed ? Math.min(50, Math.max(0, speed)) : 0;
  const rotationDeg = (clampedSpeed / 50) * 180;

  return (
    <div className="widebody-gauge-box">
      <span className="widebody-gauge-title" title={title}>{title}</span>
      <div className="widebody-gauge-svg-wrap">
        <svg viewBox="0 0 200 125" className="widebody-gauge-svg" aria-hidden="true">
          {/* 半圆刻度弧 */}
          <path d="M 25 105 A 75 75 0 0 1 42.55 56.79" fill="none" stroke="#e2e8f0" strokeWidth="16" />
          <path d="M 42.55 56.79 A 75 75 0 0 1 157.45 56.79" fill="none" stroke="#f59e0b" strokeWidth="16" />
          <path d="M 157.45 56.79 A 75 75 0 0 1 175 105" fill="none" stroke="#ea580c" strokeWidth="16" />

          {/* 刻度端点标签 0 / 25 / 50 */}
          <text x="25" y="122" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="500">0</text>
          <text x="100" y="24" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="500">25</text>
          <text x="175" y="122" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="500">50</text>

          {/* 以中心 (100, 105) 为轴的标准三角指针，speed=0 指向左，speed=50 指向右 */}
          {hasSpeed && (
            <g transform={`rotate(${rotationDeg} 100 105)`}>
              <polygon
                points="100,102.5 100,107.5 38,105"
                fill="#2563eb"
              />
            </g>
          )}
          <circle cx="100" cy="105" r="4.5" fill="#1e293b" />
        </svg>
      </div>
      <div className="widebody-gauge-value" dir="ltr">
        {hasSpeed ? `${speed} km/h` : '—'}
      </div>
    </div>
  );
}

/**
 * PC-V3-R02 运营报表组件
 * 6项指标 + 设备车速分析 + 设备运行分析
 */
export default function WidebodyOperationsReport({ device, reportSelector }) {
  const [dateRange, setDateRange] = useState({
    startDate: '2023-11-23',
    endDate: '2023-11-23',
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [draftStart, setDraftStart] = useState('2023-11-23');
  const [draftEnd, setDraftEnd] = useState('2023-11-23');
  const [, setRetryTrigger] = useState(0);

  // URL 测试场景驱动 (widebodyReportState=loading|empty|error|noPermission|deleted|ready)
  const urlReportState = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('widebodyReportState') || '';
  }, []);

  // 设备切换时重置为基准日
  useEffect(() => {
    setDateRange({ startDate: '2023-11-23', endDate: '2023-11-23' });
    setDraftStart('2023-11-23');
    setDraftEnd('2023-11-23');
    setIsPopoverOpen(false);
  }, [device?.id, device?.code]);

  // 状态机门禁：每次渲染求值，重试触发组件重新渲染并保留已选日期，无不可达旁路
  const effectiveState = (!device && !urlReportState)
    ? 'empty'
    : (urlReportState || device?.reportState || device?.dataState || 'ready');

  const handleRetry = () => {
    // 纯本地重新评估状态，保留当前已选日期，不调用 window.location.reload
    setRetryTrigger((prev) => prev + 1);
  };

  // 实时草稿校验
  const inputValidation = useMemo(() => {
    return validateDateRange(draftStart, draftEnd);
  }, [draftStart, draftEnd]);

  // 获取当前已应用运营数据
  const opsData = useMemo(() => {
    return getOperationsData(dateRange.startDate, dateRange.endDate);
  }, [dateRange.startDate, dateRange.endDate]);

  const handleOpenPopover = () => {
    setDraftStart(dateRange.startDate);
    setDraftEnd(dateRange.endDate);
    setIsPopoverOpen(true);
  };

  const handleCancelPopover = () => {
    setDraftStart(dateRange.startDate);
    setDraftEnd(dateRange.endDate);
    setIsPopoverOpen(false);
  };

  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    if (!inputValidation.isValid) return;
    setDateRange({
      startDate: inputValidation.normStart,
      endDate: inputValidation.normEnd,
    });
    setIsPopoverOpen(false);
  };

  // PC-DEC-007 / PC-V4-R01: 异常态时仍保留报表切换下拉
  const renderFallbackToolbar = () => {
    if (!reportSelector) return null;
    return (
      <div className="widebody-toolbar" style={{ marginBottom: 10 }}>
        {reportSelector}
      </div>
    );
  };

  // 异常与生命周期状态渲染
  if (effectiveState === 'loading') {
    return (
      <div className="widebody-report-view">
        {renderFallbackToolbar()}
        <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
          正在加载运营报表数据…
        </div>
      </div>
    );
  }
  if (effectiveState === 'empty') {
    return (
      <div className="widebody-report-view">
        {renderFallbackToolbar()}
        <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
          暂无宽体车运营报表数据
        </div>
      </div>
    );
  }
  if (effectiveState === 'error') {
    return (
      <div className="widebody-report-view">
        {renderFallbackToolbar()}
        <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
          <p>运营报表数据加载失败</p>
          <button
            type="button"
            onClick={handleRetry}
            style={{
              marginTop: 10,
              padding: '4px 12px',
              borderRadius: 4,
              border: '1px solid #ef4444',
              background: '#fff',
              color: '#ef4444',
              cursor: 'pointer',
            }}
          >
            重试
          </button>
        </div>
      </div>
    );
  }
  if (effectiveState === 'noPermission') {
    return (
      <div className="widebody-report-view">
        {renderFallbackToolbar()}
        <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
          <p>暂无权限查看此设备运营报表</p>
          <a href="#/devices" style={{ display: 'inline-block', marginTop: 10, color: '#2563eb', textDecoration: 'none' }}>
            返回设备列表
          </a>
        </div>
      </div>
    );
  }
  if (effectiveState === 'deleted') {
    return (
      <div className="widebody-report-view">
        {renderFallbackToolbar()}
        <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
          <p>该设备已删除</p>
          <a href="#/devices" style={{ display: 'inline-block', marginTop: 10, color: '#2563eb', textDecoration: 'none' }}>
            返回设备列表
          </a>
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      label: '工作时长百分率',
      value: opsData.workPercentage !== null ? opsData.workPercentage : '—',
      unit: '%',
    },
    {
      label: '怠速时长百分率',
      value: opsData.idlePercentage !== null ? opsData.idlePercentage : '—',
      unit: '%',
    },
    {
      label: '重载平均车速',
      value: opsData.loadedAvgSpeed !== null ? opsData.loadedAvgSpeed : '—',
      unit: 'km/h',
    },
    {
      label: '空载平均车速',
      value: opsData.emptyAvgSpeed !== null ? opsData.emptyAvgSpeed : '—',
      unit: 'km/h',
    },
    {
      label: '平均循环时长',
      value: opsData.avgCycleTimeHours !== null ? opsData.avgCycleTimeHours : '—',
      unit: 'h',
    },
    {
      label: '平均单趟有效载荷',
      value: opsData.avgPayload !== null ? opsData.avgPayload : '—',
      unit: 't',
    },
  ];

  return (
    <div className="widebody-report-view">
      {/* ── Toolbar: Report Selector + Date Range Picker ── */}
      <div className="widebody-toolbar" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {reportSelector}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={`widebody-range-btn${isPopoverOpen ? ' is-active' : ''}`}
              onClick={() => (isPopoverOpen ? handleCancelPopover() : handleOpenPopover())}
              aria-expanded={isPopoverOpen}
              aria-label="选择运营报表日期区间"
            >
              <CalendarIcon />
              <span style={{ fontWeight: 600, color: '#1e293b' }} dir="ltr">
                {dateRange.startDate === dateRange.endDate
                  ? dateRange.startDate
                  : `${dateRange.startDate} 至 ${dateRange.endDate}`}
              </span>
              <ChevronDownIcon />
            </button>

            {isPopoverOpen && (
              <div className="widebody-range-popover" role="dialog" aria-label="日期区间选择">
                <form onSubmit={handleApplyFilter}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label htmlFor="ops-draft-start" style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                        开始日期
                      </label>
                      <input
                        id="ops-draft-start"
                        type="date"
                        value={draftStart}
                        onChange={(e) => setDraftStart(e.target.value)}
                        className="widebody-date-input"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label htmlFor="ops-draft-end" style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                        结束日期
                      </label>
                      <input
                        id="ops-draft-end"
                        type="date"
                        value={draftEnd}
                        onChange={(e) => setDraftEnd(e.target.value)}
                        className="widebody-date-input"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {!inputValidation.isValid && (
                    <div className="widebody-range-error" role="alert">
                      <span>⚠</span>
                      <span>{inputValidation.error}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={handleCancelPopover}
                      className="widebody-btn-secondary"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={!inputValidation.isValid}
                      className="widebody-btn-primary"
                    >
                      应用
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 6 Metrics Summary Card ── */}
      <section className="widebody-card" aria-label="运营指标概览" style={{ marginBottom: 12 }}>
        <div className="widebody-card-header">
          <div className="widebody-card-title">
            <span className="widebody-icon-badge pink">
              <ActivityIcon />
            </span>
            <strong>运营指标概览</strong>
          </div>
        </div>
        <div className="widebody-metric-summary-grid">
          {metricCards.map((m) => (
            <div className="widebody-metric-summary-item" key={m.label}>
              <strong title={`${m.value} ${m.unit}`} dir="ltr">
                {m.value} <span style={{ fontSize: '11px', fontWeight: 400, color: '#64748b' }}>{m.unit}</span>
              </strong>
              <small title={m.label}>{m.label}</small>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2 Column Analysis Grid: Speed Gauge (Left) + Operations Analysis (Right) ── */}
      <div className="widebody-ops-two-col">
        {/* Col 1: 设备车速分析 (左空载、右重载) */}
        <section className="widebody-card" aria-label="设备车速分析">
          <div className="widebody-card-header">
            <div className="widebody-card-title">
              <span className="widebody-icon-badge blue">
                <GaugeIcon />
              </span>
              <strong>设备车速分析</strong>
            </div>
          </div>
          <div className="widebody-gauge-grid">
            <SpeedGauge speed={opsData.emptyAvgSpeed} title="空载平均车速" />
            <SpeedGauge speed={opsData.loadedAvgSpeed} title="重载平均车速" />
          </div>
        </section>

        {/* Col 2: 设备运行分析 (0..100 共享真实刻度 + 双百分比条) */}
        <section className="widebody-card" aria-label="设备运行分析">
          <div className="widebody-card-header">
            <div className="widebody-card-title">
              <span className="widebody-icon-badge purple">
                <ActivityIcon />
              </span>
              <strong>设备运行分析</strong>
            </div>
          </div>

          <div style={{ marginTop: 6, padding: '0 4px' }}>
            {/* 顶部共享 0 ~ 100 刻度 */}
            <div className="widebody-scale-wrap" dir="ltr" aria-hidden="true">
              <div className="widebody-scale-ticks">
                {[0, 12, 24, 36, 48, 60, 72, 84, 100].map((val) => {
                  const isStart = val === 0;
                  const isEnd = val === 100;
                  return (
                    <span
                      key={val}
                      style={{
                        position: 'absolute',
                        left: `${val}%`,
                        transform: isStart ? 'none' : isEnd ? 'translateX(-100%)' : 'translateX(-50%)',
                      }}
                      className="widebody-scale-tick-lbl"
                    >
                      {val}
                    </span>
                  );
                })}
              </div>
              <div className="widebody-scale-line" />
            </div>

            {/* 工作时长百分率条 */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: '#475569' }}>工作时长百分率</span>
                <span style={{ fontWeight: 600, color: '#2563eb' }} dir="ltr">
                  {opsData.workPercentage !== null ? `${opsData.workPercentage}%` : '—'}
                </span>
              </div>
              <div className="widebody-progress-track" dir="ltr">
                {opsData.workPercentage !== null && (
                  <div
                    className="widebody-progress-fill work"
                    style={{ width: `${Math.min(100, Math.max(0, opsData.workPercentage))}%` }}
                  />
                )}
              </div>
            </div>

            {/* 怠速时长百分率条 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: '#475569' }}>怠速时长百分率</span>
                <span style={{ fontWeight: 600, color: '#f59e0b' }} dir="ltr">
                  {opsData.idlePercentage !== null ? `${opsData.idlePercentage}%` : '—'}
                </span>
              </div>
              <div className="widebody-progress-track" dir="ltr">
                {opsData.idlePercentage !== null && (
                  <div
                    className="widebody-progress-fill idle"
                    style={{ width: `${Math.min(100, Math.max(0, opsData.idlePercentage))}%` }}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

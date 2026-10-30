import { reportMetrics } from '../../data/widebodyMetrics.js';
import React, { useState, useMemo, useEffect } from 'react';
import './widebody.css';
import WidebodyOperationsReport from './WidebodyOperationsReport';
import WidebodyChargingReport from './WidebodyChargingReport';
import {
  isElectricWidebody,
  normalizeDateStr,
  parseDate,
  formatDateSlash,
  getPeriodicElectricData,
  getPeriodicFuelData,
  getDailyWorkDistribution,
  downloadCsv,
} from '../../data/widebody';

const PERIODS = [
  { key: 'daily', label: '日视图' },
  { key: 'weekly', label: '周视图' },
  { key: 'monthly', label: '月视图' },
];

/* ─── Inline SVG Icons ─── */
function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19V5M4 19h16" />
      <path d="m7 15 3-4 3 2 4-6" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M4 20h16" />
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

function CalendarLinearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

/* ─── 24h Work distribution timeline ─── */
function GanttTimeline({ segments }) {
  const [hovered, setHovered] = useState(null);
  const ticks = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

  const formatHourTime = (hour) => {
    const totalSeconds = Math.round(Number(hour || 0) * 3600);
    const h = String(Math.floor(totalSeconds / 3600) % 24).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    return `${h}:${m}`;
  };

  if (!segments || segments.length === 0) {
    return <div style={{ padding: '24px 0', textAlign: 'center', color: '#9ca3af', fontSize: '11px' }}>暂无当日开工数据</div>;
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

/* ─── Trend Line Chart for Weekly/Monthly (Review E) ─── */
function TrendChart({ labels, data, unit, color = '#2563eb', label = '趋势' }) {
  const [selectedIdx, setSelectedIdx] = useState(null);

  useEffect(() => {
    setSelectedIdx(null);
  }, [data, labels]);

  const totalCount = (data || []).length;
  const validEntries = (data || []).map((val, sourceIndex) => {
    if (val === null || val === undefined || !Number.isFinite(val)) return null;
    return { val, label: labels[sourceIndex], sourceIndex };
  }).filter(Boolean);

  if (validEntries.length === 0) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 11 }}>暂无{label}数据</div>;
  }

  const valuesOnly = validEntries.map((p) => p.val);
  const maxVal = Math.max(...valuesOnly);
  const minVal = Math.min(0, ...valuesOnly);
  const range = maxVal - minVal || 1;

  const svgW = 460;
  const svgH = 150;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 24;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const getX = (sourceIndex) => {
    if (totalCount <= 1) return padL + plotW / 2;
    return padL + (sourceIndex / (totalCount - 1)) * plotW;
  };
  const getY = (val) => padT + plotH - ((val - minVal) / range) * plotH;

  const coords = validEntries.map((pt, coordIndex) => ({
    coordIndex,
    sourceIndex: pt.sourceIndex,
    x: getX(pt.sourceIndex),
    y: getY(pt.val),
    val: pt.val,
    label: pt.label,
  }));

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
        lineD += ` M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      }
    }
  }

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
      style={{ width: '100%', outline: 'none' }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${label}图表`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b', marginBottom: 6 }}>
        <span style={{ fontWeight: 600, color: '#1e293b' }}>{label}</span>
        <span>单位: {unit}</span>
      </div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '490px',
          aspectRatio: `${svgW} / ${svgH}`,
          margin: '0 auto',
        }}
      >
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: '100%', display: 'block', direction: 'ltr' }}>
          {[0, 0.25, 0.5, 0.75, 1].map((step) => {
            const val = (minVal + range * (1 - step)).toFixed(1);
            const y = padT + plotH * step;
            return (
              <g key={step}>
                <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">{val}</text>
              </g>
            );
          })}
          {lineD && <path d={lineD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
          {coords.map((pt, coordIndex) => {
            const isSelected = selectedIdx === coordIndex;
            return (
              <circle
                key={pt.sourceIndex}
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? 6 : 3.5}
                fill="#fff"
                stroke={color}
                strokeWidth={isSelected ? 2.5 : 1.8}
                role="button"
                tabIndex={0}
                aria-label={`${pt.label}: ${pt.val} ${unit}`}
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
          {/* Dates on x axis */}
          {(labels || []).map((dateStr, i) => {
            const step = Math.ceil(labels.length / 7) || 1;
            if (i % step === 0 || i === labels.length - 1) {
              const shortDate = dateStr.slice(5).replaceAll('-', '/');
              return (
                <text key={i} x={getX(i)} y={svgH - 6} textAnchor="middle" fontSize="11" fill="#64748b">
                  {shortDate}
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
            {activePoint.label}: {activePoint.val} {unit}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Real Pagination Table ListView (Review C: page resets via key) ─── */
function WidebodyListView({ columns, rows, onExport }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const visibleRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="widebody-table-card">
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 14px', borderBottom: '1px solid #f0f2f5' }}>
        <button
          type="button"
          onClick={onExport}
          className="widebody-export-btn"
          disabled={rows.length === 0}
          aria-label="导出当前报表CSV"
        >
          <DownloadIcon />
          导出 CSV
        </button>
      </div>
      <div className="widebody-table-scroll">
        <table className="widebody-data-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} title={c.label}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, idx) => (
              <tr key={row.date || idx}>
                {columns.map((c) => {
                  const val = row[c.key];
                  const display = val !== null && val !== undefined && val !== '' ? String(val) : '—';
                  return (
                    <td key={c.key} title={display}>
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
                  暂无报表数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="widebody-pagination-bar">
        <span>共 {total} 条数据</span>
        {totalPages > 1 && (
          <div className="widebody-pagination-pages">
            <button
              type="button"
              className="widebody-page-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                type="button"
                key={page}
                className={`widebody-page-btn${currentPage === page ? ' is-active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              className="widebody-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Data Report Component (Existing Logic Preserved) ─── */
function WidebodyDataReport({ device, reportSelector }) {
  const [mode, setMode] = useState('chart'); // 'chart' | 'list'
  const [period, setPeriod] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  const [currentDateStr, setCurrentDateStr] = useState('2023-11-23');

  // Draft / Apply / Cancel state for date picker popover (Review C)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [draftDateStr, setDraftDateStr] = useState('2023-11-23');

  const isElectric = isElectricWidebody(device);

  // Period / Date shift helper
  const handleShiftPeriod = (delta) => {
    const d = parseDate(currentDateStr);
    if (!d) return;
    if (period === 'daily') {
      d.setDate(d.getDate() + delta);
    } else if (period === 'weekly') {
      d.setDate(d.getDate() + delta * 7);
    } else if (period === 'monthly') {
      d.setDate(1);
      d.setMonth(d.getMonth() + delta);
    }
    const nextNorm = normalizeDateStr(d);
    if (nextNorm) {
      setCurrentDateStr(nextNorm);
      setDraftDateStr(nextNorm);
    }
  };

  // Open popover: sync draft with applied date
  const handleOpenDatePicker = () => {
    setDraftDateStr(currentDateStr);
    setIsDatePickerOpen(true);
  };

  // Cancel popover: revert draft and close
  const handleCancelDatePicker = () => {
    setDraftDateStr(currentDateStr);
    setIsDatePickerOpen(false);
  };

  // Apply draft: validate and update applied date
  const handleApplyDatePicker = () => {
    const norm = normalizeDateStr(draftDateStr);
    if (norm) {
      setCurrentDateStr(norm);
      setIsDatePickerOpen(false);
    }
  };

  // Retrieve deterministic period data (single source of truth for both chart and list)
  const reportData = useMemo(() => {
    if (isElectric) {
      return getPeriodicElectricData(period, currentDateStr);
    }
    return getPeriodicFuelData(period, currentDateStr);
  }, [isElectric, period, currentDateStr]);

  const { rows, summary, dates } = reportData;

  // Header display label for current period
  const dateRangeLabel = useMemo(() => {
    if (period === 'daily') {
      return formatDateSlash(currentDateStr);
    }
    if (period === 'weekly') {
      if (dates && dates.length >= 7) {
        return `${formatDateSlash(dates[0])} - ${formatDateSlash(dates[6])}`;
      }
      return formatDateSlash(currentDateStr);
    }
    const norm = normalizeDateStr(currentDateStr) || '2023-11-23';
    return norm.slice(0, 7).replaceAll('-', '/');
  }, [period, currentDateStr, dates]);

  // Metric cards definitions
  const summaryMetrics = useMemo(() => reportMetrics(summary, isElectric), [isElectric, summary]);
  const tableColumns = useMemo(() => [
    { key: 'date', label: '日期' },
    ...reportMetrics(summary, isElectric).map(({ key, label, unit }) => ({ key, label: `${label} (${unit})` })),
  ], [isElectric, summary]);

  // CSV export trigger
  const handleExportCsv = () => {
    const filename = `${device?.name || '宽体车'}_${period === 'daily' ? '日报' : period === 'weekly' ? '周报' : '月报'}_${currentDateStr.replaceAll('-', '')}.csv`;
    downloadCsv(filename, tableColumns, rows);
  };

  // Daily-specific charts derived from stats of currentDateStr (Review D)
  const dailyWorkSegments = useMemo(() => {
    return getDailyWorkDistribution(device?.type, currentDateStr);
  }, [device?.type, currentDateStr]);

  const isDraftValid = Boolean(normalizeDateStr(draftDateStr));

  // PC-DEC-007 / PC-V4-R01: 异常态时仍保留报表切换下拉
  const renderFallbackToolbar = () => {
    if (!reportSelector) return null;
    return (
      <div className="widebody-report-toolbar" style={{ marginBottom: 10 }}>
        {reportSelector}
      </div>
    );
  };

  // Lifecycle & device state handling (PC-REVIEW-002 Point 3: loading / error / empty / noPermission / deleted)
  const reportState = device?.reportState || device?.dataState;
  if (!device || reportState === 'empty') {
    return (
      <div className="widebody-page">
        {renderFallbackToolbar()}
        <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
          暂无宽体车统计报表数据
        </div>
      </div>
    );
  }
  if (reportState === 'loading') {
    return (
      <div className="widebody-page">
        {renderFallbackToolbar()}
        <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
          正在加载统计报表数据…
        </div>
      </div>
    );
  }
  if (reportState === 'error') {
    return (
      <div className="widebody-page">
        {renderFallbackToolbar()}
        <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
          <p>报表数据加载失败</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ marginTop: 10, padding: '4px 12px', borderRadius: 4, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', cursor: 'pointer' }}
          >
            重试
          </button>
        </div>
      </div>
    );
  }
  if (reportState === 'noPermission') {
    return (
      <div className="widebody-page">
        {renderFallbackToolbar()}
        <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
          <p>暂无权限查看此设备统计报表</p>
          <a href="#/devices" style={{ display: 'inline-block', marginTop: 10, color: '#2563eb', textDecoration: 'none' }}>返回设备列表</a>
        </div>
      </div>
    );
  }
  if (reportState === 'deleted') {
    return (
      <div className="widebody-page">
        {renderFallbackToolbar()}
        <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
          <p>该设备已删除</p>
          <a href="#/devices" style={{ display: 'inline-block', marginTop: 10, color: '#2563eb', textDecoration: 'none' }}>返回设备列表</a>
        </div>
      </div>
    );
  }

  return (
    <div className="widebody-page">
      {/* ── Toolbar ── */}
      <div className="widebody-report-toolbar">
        {/* Left group: Report selector (if electric) + Period Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {reportSelector}
          <div className="widebody-period-tabs">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`widebody-period-tab-btn${period === p.key ? ' is-active' : ''}`}
                onClick={() => setPeriod(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Navigator with Draft / Apply / Cancel Popover (Review C) */}
        <div className="widebody-date-navigator" style={{ position: 'relative' }}>
          <button
            type="button"
            className="widebody-nav-arrow"
            onClick={() => handleShiftPeriod(-1)}
            aria-label="上一周期"
          >
            ‹
          </button>
          <button
            type="button"
            className="widebody-date-display"
            onClick={handleOpenDatePicker}
            aria-label="选择基准日期"
            style={{ cursor: 'pointer', background: isDatePickerOpen ? '#f8fafc' : '#fff' }}
          >
            <CalendarIcon />
            <span>{dateRangeLabel}</span>
          </button>
          <button
            type="button"
            className="widebody-nav-arrow"
            onClick={() => handleShiftPeriod(1)}
            aria-label="下一周期"
          >
            ›
          </button>

          {/* Date Picker Popover */}
          {isDatePickerOpen && (
            <div
              style={{
                position: 'absolute',
                top: '34px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '12px 14px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                zIndex: 30,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                minWidth: '220px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151' }}>选择基准日期</div>
              <input
                type="date"
                value={draftDateStr}
                onChange={(e) => setDraftDateStr(e.target.value)}
                style={{
                  padding: '5px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px',
                  outline: 'none',
                }}
                aria-label="输入或选择基准日期"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleCancelDatePicker}
                  style={{
                    padding: '4px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    background: '#fff',
                    color: '#6b7280',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={!isDraftValid}
                  onClick={handleApplyDatePicker}
                  style={{
                    padding: '4px 12px',
                    border: 'none',
                    borderRadius: '4px',
                    background: isDraftValid ? '#e60012' : '#d1d5db',
                    color: '#fff',
                    fontSize: '11px',
                    cursor: isDraftValid ? 'pointer' : 'not-allowed',
                  }}
                >
                  应用
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View mode toggle (Chart / List) */}
        <div className="widebody-view-controls">
          <button
            type="button"
            className={`widebody-view-btn${mode === 'chart' ? ' is-active' : ''}`}
            onClick={() => setMode('chart')}
          >
            <ChartIcon />
            图表
          </button>
          <button
            type="button"
            className={`widebody-view-btn${mode === 'list' ? ' is-active' : ''}`}
            onClick={() => setMode('list')}
          >
            <TableIcon />
            列表
          </button>
        </div>
      </div>

      {/* ── Content View ── */}
      {mode === 'chart' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Summary Metric Cards */}
          <section className="widebody-card" aria-label="指标概览">
            <div className="widebody-card-header">
              <div className="widebody-card-title">
                <span className="widebody-icon-badge pink">
                  <PulseIcon />
                </span>
                <strong>指标概览</strong>
              </div>
            </div>
            <div className={`widebody-metric-summary-grid${isElectric ? ' widebody-electric-summary-grid' : ''}`}>
              {summaryMetrics.map((m) => (
                <div className="widebody-metric-summary-item" key={m.label}>
                  <strong title={`${m.value} ${m.unit}`}>
                    {m.value} <span style={{ fontSize: '11px', fontWeight: 400, color: '#6b7280' }}>{m.unit}</span>
                  </strong>
                  <small title={m.label}>{m.label}</small>
                </div>
              ))}
            </div>
          </section>

          {/* Daily Report Layout: Full-width compact strip for 24h work timeline + 2-column equal-width grid for Curve and Gear Pie */}
          {period === 'daily' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Full-width compact strip: 24h Work distribution */}
              <section className="widebody-card widebody-daily-timeline-card" aria-label="工作分布">
                <div className="widebody-card-header">
                  <div className="widebody-card-title">
                    <span className="widebody-icon-badge purple">
                      <ClockIcon />
                    </span>
                    <strong>工作分布</strong>
                  </div>
                </div>
                <GanttTimeline segments={dailyWorkSegments} />
              </section>

            </div>
          )}

          {/* Weekly / Monthly view (Desktop combined layout) */}
          {period !== 'daily' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Calendar card */}
              <section className="widebody-card" aria-label="运行日历">
                <div className="widebody-card-header">
                  <div className="widebody-card-title">
                    <span className="widebody-icon-badge purple">
                      <CalendarLinearIcon />
                    </span>
                    <strong>运行日历 ({period === 'weekly' ? dateRangeLabel : `${Number(currentDateStr.slice(5, 7))}月`})</strong>
                  </div>
                </div>
                <div className="widebody-calendar-grid">
                  {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((wd) => (
                    <div key={wd} className="widebody-calendar-header">
                      {wd}
                    </div>
                  ))}
                  {/* Empty cells for monthly calendar start offset */}
                  {period === 'monthly' && dates && dates[0] && parseDate(dates[0]) &&
                    Array.from({ length: (parseDate(dates[0]).getDay() + 6) % 7 }, (_, i) => (
                      <div key={`empty-${i}`} className="widebody-calendar-cell" style={{ opacity: 0.2 }} />
                    ))}
                  {rows.map((row) => (
                    <div key={row.date} className="widebody-calendar-cell has-data">
                      <b>{row.date.slice(8)}日</b>
                      {isElectric ? (
                        <>
                          <span title={`能耗 ${row.energy}kWh`}>{row.energy}kWh</span>
                          <small title={`工作时长 ${row.workingHours}h`}>{row.workingHours}h</small>
                        </>
                      ) : (
                        <>
                          <span title={`${row.fuel}L`}>{row.fuel}L</span>
                          <small title={`工作时长 ${row.workingHours}h`}>{row.workingHours}h</small>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Trend Charts Grid (2x2 desktop grid, distinct axes & units) */}
              <div className="widebody-trends-grid">
                {isElectric ? (
                  <>
                    <section className="widebody-card" aria-label="平均电耗趋势">
                      <TrendChart
                        labels={dates}
                        data={rows.map((r) => r.avgEnergy)}
                        unit="kWh/km"
                        color="#2563eb"
                        label="平均电耗趋势"
                      />
                    </section>
                    <section className="widebody-card" aria-label="运输趟数趋势">
                      <TrendChart
                        labels={dates}
                        data={rows.map((r) => r.trips)}
                        unit="趟"
                        color="#10b981"
                        label="运输趟数趋势"
                      />
                    </section>
                    <section className="widebody-card" aria-label="充电时长趋势">
                      <TrendChart
                        labels={dates}
                        data={rows.map((r) => r.chargeDuration)}
                        unit="h"
                        color="#f59e0b"
                        label="充电时长趋势"
                      />
                    </section>
                    <section className="widebody-card" aria-label="回收能量百分比趋势">
                      <TrendChart
                        labels={dates}
                        data={rows.map((r) => r.recoveryRate)}
                        unit="%"
                        color="#8b5cf6"
                        label="回收能量百分比趋势"
                      />
                    </section>
                  </>
                ) : (
                  <>
                    <section className="widebody-card" aria-label="能耗趋势">
                      <TrendChart
                        labels={dates}
                        data={rows.map((r) => r.fuel)}
                        unit="L"
                        color="#ff7500"
                        label="能耗趋势"
                      />
                    </section>
                    <section className="widebody-card" aria-label="每小时能耗趋势">
                      <TrendChart
                        labels={dates}
                        data={rows.map((r) => r.avgHourlyFuel)}
                        unit="L/h"
                        color="#2563eb"
                        label="每小时能耗趋势"
                      />
                    </section>
                    <section className="widebody-card" aria-label="运转时长趋势">
                      <TrendChart
                        labels={dates}
                        data={rows.map((r) => r.workHours)}
                        unit="h"
                        color="#10b981"
                        label="运转时长趋势"
                      />
                    </section>
                    <section className="widebody-card" aria-label="怠速工时趋势">
                      <TrendChart
                        labels={dates}
                        data={rows.map((r) => r.idleHours)}
                        unit="h"
                        color="#f59e0b"
                        label="怠速工时趋势"
                      />
                    </section>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List / Table Mode (Review C: page resets cleanly via key) */
        <WidebodyListView
          key={`${period}-${currentDateStr}`}
          columns={tableColumns}
          rows={rows}
          onExport={handleExportCsv}
        />
      )}
    </div>
  );
}

/* ─── Main Component (Wrapper with Electric Sub-navigation: 数据 / 运营 / 充电) ─── */
export default function WidebodyStatisticsReport({ device }) {
  const isElectric = isElectricWidebody(device);
  const [activeSubTab, setActiveSubTab] = useState('data'); // 'data' | 'operations' | 'charging'

  // 设备切换重置为默认数据报表
  useEffect(() => {
    setActiveSubTab('data');
  }, [device?.id, device?.code]);

  // 油车维持现有单一报表且没有充电入口
  if (!isElectric) {
    return <WidebodyDataReport device={device} />;
  }

  // PC-DEC-007 / PC-V4-R01: 原生 select 报表选择器，嵌入各子报表筛选工具栏最左侧，撤掉独立按钮行
  const reportSelector = (
    <select
      className="widebody-report-select"
      value={activeSubTab}
      onChange={(e) => setActiveSubTab(e.target.value)}
      aria-label="选择报表"
      title="选择报表"
    >
      <option value="data">数据报表</option>
      <option value="operations">运营报表</option>
      <option value="charging">充电报表</option>
    </select>
  );

  return (
    <div className="widebody-report-wrapper">
      {/* 子报表切换保留各自已应用日期、模式及取消前草稿恢复，设备切换重置 */}
      <div style={{ display: activeSubTab === 'data' ? 'block' : 'none' }}>
        <WidebodyDataReport device={device} reportSelector={reportSelector} />
      </div>
      <div style={{ display: activeSubTab === 'operations' ? 'block' : 'none' }}>
        <WidebodyOperationsReport device={device} reportSelector={reportSelector} />
      </div>
      <div style={{ display: activeSubTab === 'charging' ? 'block' : 'none' }}>
        <WidebodyChargingReport device={device} reportSelector={reportSelector} />
      </div>
    </div>
  );
}


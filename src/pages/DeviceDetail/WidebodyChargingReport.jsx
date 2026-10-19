import React, { useState, useMemo, useEffect } from 'react';
import { getChargingData, validateDateRange, exportChargingCsv } from '../../data/widebodyReports.js';

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

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
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

function TableIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="12" y1="3" x2="12" y2="21" />
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
 * PC-V3-R03 充电报表组件
 * 日期区间筛选 + 三项汇总指标 (次数/度数/时长) + 紧凑充电记录明细表 + CSV导出 + 分页
 */
export default function WidebodyChargingReport({ device, reportSelector }) {
  const [dateRange, setDateRange] = useState({
    startDate: '2023-11-23',
    endDate: '2023-11-23',
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [draftStart, setDraftStart] = useState('2023-11-23');
  const [draftEnd, setDraftEnd] = useState('2023-11-23');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 设备切换时重置为基准日
  useEffect(() => {
    setDateRange({ startDate: '2023-11-23', endDate: '2023-11-23' });
    setDraftStart('2023-11-23');
    setDraftEnd('2023-11-23');
    setIsPopoverOpen(false);
    setCurrentPage(1);
  }, [device?.id, device?.code]);

  // URL 测试场景驱动 (widebodyChargeState=empty|partial|charging|crossday)
  const urlChargeState = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('widebodyChargeState') || '';
  }, []);

  // URL 测试场景驱动 (widebodyReportState=loading|empty|error|noPermission|deleted|ready)
  const urlReportState = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('widebodyReportState') || '';
  }, []);

  const [, setRetryTrigger] = useState(0);

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

  // 获取当前已应用充电数据
  const chargingResult = useMemo(() => {
    return getChargingData(dateRange.startDate, dateRange.endDate, urlChargeState);
  }, [dateRange.startDate, dateRange.endDate, urlChargeState]);

  const { records, summary } = chargingResult;

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
    setCurrentPage(1); // 切换区间重置页码
    setIsPopoverOpen(false);
  };

  const handleExportCsv = () => {
    const filename = `电动宽体车_充电报表_${dateRange.startDate}_${dateRange.endDate}.csv`;
    exportChargingCsv(records, filename);
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
          正在加载充电报表数据…
        </div>
      </div>
    );
  }
  if (effectiveState === 'empty') {
    return (
      <div className="widebody-report-view">
        {renderFallbackToolbar()}
        <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
          暂无宽体车充电报表数据
        </div>
      </div>
    );
  }
  if (effectiveState === 'error') {
    return (
      <div className="widebody-report-view">
        {renderFallbackToolbar()}
        <div className="widebody-card" style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
          <p>充电报表数据加载失败</p>
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
          <p>暂无权限查看此设备充电报表</p>
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

  // 分页计算
  const total = records.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const visibleRecords = records.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const summaryMetrics = [
    {
      label: '充电次数',
      value: summary.count !== null ? summary.count : '—',
      unit: '次',
    },
    {
      label: '充电度数',
      value: summary.totalEnergy !== null ? summary.totalEnergy : '—',
      unit: 'kWh',
    },
    {
      label: '充电时长',
      value: summary.totalDuration !== null ? summary.totalDuration : '—',
      unit: 'h',
    },
  ];

  return (
    <div className="widebody-report-view">
      {/* ── Toolbar: Report Selector + Date Range Picker (Left) + Export Button (Right) ── */}
      <div className="widebody-toolbar" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {reportSelector}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={`widebody-range-btn${isPopoverOpen ? ' is-active' : ''}`}
              onClick={() => (isPopoverOpen ? handleCancelPopover() : handleOpenPopover())}
              aria-expanded={isPopoverOpen}
              aria-label="选择充电报表日期区间"
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
                      <label htmlFor="chg-draft-start" style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                        开始日期
                      </label>
                      <input
                        id="chg-draft-start"
                        type="date"
                        value={draftStart}
                        onChange={(e) => setDraftStart(e.target.value)}
                        className="widebody-date-input"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label htmlFor="chg-draft-end" style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                        结束日期
                      </label>
                      <input
                        id="chg-draft-end"
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

        <button
          type="button"
          onClick={handleExportCsv}
          className="widebody-export-btn"
          disabled={records.length === 0}
          aria-label="导出充电报表CSV"
        >
          <DownloadIcon />
          导出 CSV
        </button>
      </div>

      {/* ── Summary Cards: 充电次数 / 充电度数 / 充电时长 ── */}
      <section className="widebody-card" aria-label="充电汇总指标" style={{ marginBottom: 12 }}>
        <div className="widebody-card-header">
          <div className="widebody-card-title">
            <span className="widebody-icon-badge blue">
              <ZapIcon />
            </span>
            <strong>充电汇总指标</strong>
          </div>
        </div>
        <div className="widebody-metric-summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {summaryMetrics.map((m) => (
            <div className="widebody-metric-summary-item" key={m.label}>
              <strong title={`${m.value} ${m.unit}`} dir="ltr">
                {m.value} <span style={{ fontSize: '11px', fontWeight: 400, color: '#64748b' }}>{m.unit}</span>
              </strong>
              <small title={m.label}>{m.label}</small>
            </div>
          ))}
        </div>
      </section>

      {/* ── Charging Details Table Card ── */}
      <section className="widebody-table-card" aria-label="充电记录明细">
        <div className="widebody-card-header" style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div className="widebody-card-title">
            <span className="widebody-icon-badge orange">
              <TableIcon />
            </span>
            <strong>充电记录明细</strong>
            <span className="widebody-sub-badge" style={{ marginLeft: 6 }}>
              (共 {records.length} 条)
            </span>
          </div>
        </div>

        <div className="widebody-table-scroll">
          <table className="widebody-data-table">
            <thead>
              <tr>
                <th style={{ width: '150px' }}>起始时间</th>
                <th style={{ width: '150px' }}>结束时间</th>
                <th style={{ width: '100px' }}>充电时长</th>
                <th style={{ width: '90px' }}>开始SOC</th>
                <th style={{ width: '90px' }}>结束SOC</th>
                <th style={{ width: '90px' }}>增加量</th>
                <th style={{ width: '120px' }}>充电度数</th>
                <th>充电位置</th>
              </tr>
            </thead>
            <tbody>
              {visibleRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                    暂无充电记录
                  </td>
                </tr>
              ) : (
                visibleRecords.map((r) => {
                  const isOngoing = r.isOngoing;
                  return (
                    <tr key={r.id}>
                      <td style={{ whiteSpace: 'nowrap' }} dir="ltr">
                        {r.startTime || '—'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }} dir="ltr">
                        {isOngoing ? (
                          <span className="widebody-charging-badge">充电中</span>
                        ) : (
                          r.endTime || '—'
                        )}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }} dir="ltr">
                        {r.durationHours != null ? `${r.durationHours}h` : '—'}
                        {r.isCrossDay && r.overlapHours != null && (
                          <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>
                            (区间相交 {r.overlapHours}h)
                          </span>
                        )}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }} dir="ltr">
                        {r.startSoc != null ? `${r.startSoc}%` : '—'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }} dir="ltr">
                        {r.endSoc != null ? `${r.endSoc}%` : '—'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap', color: '#16a34a', fontWeight: 600 }} dir="ltr">
                        {r.socIncrease != null ? `+${r.socIncrease}%` : '—'}
                      </td>
                      <td
                        style={{ whiteSpace: 'nowrap' }}
                        dir="ltr"
                        title={r.isCrossDay && r.effectiveEnergy === null ? '明细为整次，汇总按区间；部分覆盖无采样电量未知' : undefined}
                      >
                        {r.energy != null ? `${r.energy} kWh` : '—'}
                      </td>
                      <td title={r.location || '—'} style={{ wordBreak: 'break-word', minWidth: '140px' }}>
                        {r.location || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 真实分页控制器 */}
        {totalPages > 1 && (
          <div className="widebody-pagination-bar">
            <span style={{ fontSize: 12, color: '#64748b' }}>
              第 {currentPage} / {totalPages} 页 (共 {records.length} 条记录)
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="widebody-page-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="上一页"
              >
                上一页
              </button>
              <button
                type="button"
                className="widebody-page-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                aria-label="下一页"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

import React, { useState, useMemo, useEffect, useCallback } from 'react';

/* ───────── helpers ───────── */

const MAINTENANCE_INTERVAL = 500;

function parseHours(val) {
  if (val == null) return null;
  const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? null : num;
}

/* ───────── SVG Icons ───────── */

const WrenchIcon = ({ color = '#3b82f6' }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const GaugeIcon = ({ color = '#22c55e' }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10" />
    <path d="M12 12l6.5-6.5" />
    <circle cx="12" cy="12" r="1.5" fill={color} />
  </svg>
);

const ClockIcon = ({ color = '#f59e0b' }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const EmptyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

/* ───────── Detail Modal ───────── */

function DetailModal({ record, onClose }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!record) return null;

  const fields = [
    { label: '保养编号', value: record.id },
    { label: '保养日期', value: record.date },
    { label: '保养类型', value: record.type },
    { label: '工作小时', value: record.hours != null ? `${record.hours} h` : '--' },
    { label: '保养内容', value: record.description },
    { label: '操作人', value: record.operator },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="maint-detail-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* overlay */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
      />
      {/* dialog */}
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          padding: '24px 28px',
          width: 420,
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span id="maint-detail-title" style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>
            保养详情
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: '#9ca3af',
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fields.map((f) => (
            <div key={f.label} style={{ display: 'flex', gap: 12 }}>
              <span style={{ width: 80, flexShrink: 0, fontSize: 13, color: '#6b7280' }}>{f.label}</span>
              <span style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 500 }}>{f.value || '--'}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 20, paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 20px',
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              background: '#fff',
              color: '#374151',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── Main Component ───────── */

export default function Maintenance({ device }) {
  const records = useMemo(() => device?.maintenanceRecords || [], [device?.maintenanceRecords]);
  const realtime = device?.realtime || {};
  const todayWorkHours = parseHours(device?.today?.workHours) || 0;

  /* ── filter state ── */
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('全部');
  const [detailRecord, setDetailRecord] = useState(null);

  /* ── summary data ── */
  const lastRecord = records[0] || null;
  const lastDate = lastRecord?.date || '--';
  const lastDescription = lastRecord?.description || '--';

  const engineRPM = realtime['发动机转速'] || '--';

  const lastHours = lastRecord ? parseHours(lastRecord.hours) : null;
  const nextTarget = lastHours != null ? lastHours + MAINTENANCE_INTERVAL : null;
  const remainingHours = nextTarget != null ? nextTarget - todayWorkHours : null;
  const remainingDisplay =
    remainingHours != null
      ? remainingHours > 0
        ? `${remainingHours.toFixed(1)}h`
        : '已到期'
      : '--';

  /* ── filtered records ── */
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filterType !== '全部' && r.type !== filterType) return false;
      if (startDate && r.date && r.date < startDate) return false;
      if (endDate && r.date && r.date > endDate) return false;
      return true;
    });
  }, [records, filterType, startDate, endDate]);

  /* ── handlers ── */
  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setFilterType('全部');
  };

  /* ── styles ── */
  const cardStyle = {
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    padding: '16px 20px',
  };

  const inputStyle = {
    padding: '7px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 13,
    color: '#1a1a2e',
    background: '#fff',
    outline: 'none',
    minWidth: 140,
  };

  const selectStyle = {
    padding: '7px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 13,
    color: '#1a1a2e',
    background: '#fff',
    outline: 'none',
    cursor: 'pointer',
    minWidth: 120,
  };

  const thStyle = {
    textAlign: 'left',
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  };

  const tdStyle = {
    padding: '12px 16px',
    fontSize: 13,
    color: '#374151',
    borderBottom: '1px solid #f0f0f0',
  };

  /* ────────── RENDER ────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── 1. Summary Cards ── */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Card 1: 上次保养 */}
        <div
          style={{
            ...cardStyle,
            flex: '1 1 200px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            minWidth: 200,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <WrenchIcon />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>上次保养</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {lastDate}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {lastDescription}
            </div>
          </div>
        </div>

        {/* Card 2: 保养工况 */}
        <div
          style={{
            ...cardStyle,
            flex: '1 1 200px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            minWidth: 200,
            borderLeft: '3px solid #22c55e',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <GaugeIcon />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>保养工况</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 2 }}>
              {engineRPM}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>当前转速</div>
          </div>
        </div>

        {/* Card 3: 下次保养 */}
        <div
          style={{
            ...cardStyle,
            flex: '1 1 200px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            minWidth: 200,
            borderLeft: '3px solid #f59e0b',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ClockIcon />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>下次保养</div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: remainingHours != null && remainingHours <= 0 ? '#ef4444' : '#1a1a2e',
                marginBottom: 2,
              }}
            >
              {remainingDisplay}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              剩余工作小时
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Filter Bar ── */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>开始日期</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>结束日期</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>保养类型</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={selectStyle}
          >
            <option value="全部">全部</option>
            <option value="定期保养">定期保养</option>
            <option value="故障维修">故障维修</option>
          </select>
        </div>

        <div style={{ flex: 1 }} />

        <button
          type="button"
          style={{
            padding: '7px 20px',
            borderRadius: 6,
            border: 'none',
            background: '#3b82f6',
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#2563eb'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#3b82f6'; }}
        >
          查询
        </button>

        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: '7px 20px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            background: '#fff',
            color: '#6b7280',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
        >
          重置
        </button>
      </div>

      {/* ── 3. Records Table ── */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>保养编号</th>
              <th style={thStyle}>保养日期</th>
              <th style={thStyle}>保养类型</th>
              <th style={thStyle}>工作小时</th>
              <th style={thStyle}>保养内容</th>
              <th style={thStyle}>操作人</th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => (
                <tr
                  key={record.id || index}
                  style={{
                    background: index % 2 === 1 ? '#f9fafb' : '#fff',
                  }}
                >
                  <td style={tdStyle}>{record.id ?? '--'}</td>
                  <td style={tdStyle}>{record.date || '--'}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 500,
                        background: record.type === '定期保养' ? '#eff6ff' : '#fef2f2',
                        color: record.type === '定期保养' ? '#2563eb' : '#dc2626',
                      }}
                    >
                      {record.type || '--'}
                    </span>
                  </td>
                  <td style={tdStyle}>{record.hours || '--'}</td>
                  <td style={{ ...tdStyle, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {record.description || '--'}
                  </td>
                  <td style={tdStyle}>{record.operator || '--'}</td>
                  <td style={tdStyle}>
                    <button
                      type="button"
                      onClick={() => setDetailRecord(record)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3b82f6',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '48px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <EmptyIcon />
                    <span style={{ fontSize: 14, color: '#9ca3af' }}>暂无保养记录</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── 4. Detail Modal ── */}
      <DetailModal record={detailRecord} onClose={() => setDetailRecord(null)} />
    </div>
  );
}

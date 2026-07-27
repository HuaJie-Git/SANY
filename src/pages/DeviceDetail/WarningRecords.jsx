import React, { useState, useMemo } from 'react';

/* ───────── Status badge styles ───────── */
const STATUS_CONFIG = {
  '未处理': { bg: '#fee2e2', color: '#dc2626' },
  '处理中': { bg: '#fef3c7', color: '#d97706' },
  '已处理': { bg: '#dcfce7', color: '#16a34a' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 500,
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      {status}
    </span>
  );
}

/* ───────── Sort icon ───────── */
function SortIcon({ direction }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={direction ? '#3b82f6' : '#9ca3af'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginLeft: 4, flexShrink: 0 }}
    >
      <path d="M8 9l4-4 4 4" />
      <path d="M16 15l-4 4-4-4" />
    </svg>
  );
}

/* ───────── Empty state ───────── */
function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginBottom: 12 }}
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div style={{ fontSize: 14, color: '#374151', marginBottom: 4 }}>暂无预警记录</div>
      <div style={{ fontSize: 13, color: '#9ca3af' }}>该设备当前没有预警记录</div>
    </div>
  );
}

/* ──────────────────────── Main Component ──────────────────────── */
export default function WarningRecords({ device }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('全部');
  const [sortField, setSortField] = useState('time');
  const [sortDir, setSortDir] = useState('desc');

  const alarmRecords = useMemo(() => device?.alarmRecords || [], [device?.alarmRecords]);

  /* ── Filter options ── */
  const typeOptions = ['全部', '故障报警', '预警提醒', '离线提醒'];

  /* ── Filter logic ── */
  const filteredRecords = useMemo(() => {
    let records = [...alarmRecords];

    // Type filter
    if (filterType !== '全部') {
      records = records.filter((r) => {
        if (filterType === '故障报警') return r.name && (r.name.includes('故障') || r.name.includes('过高'));
        if (filterType === '预警提醒') return r.name && (r.name.includes('预警') || (r.name.includes('提醒') && !r.name.includes('离线')));
        if (filterType === '离线提醒') return r.name && r.name.includes('离线');
        return true;
      });
    }

    // Date range filter
    if (startDate) {
      records = records.filter((r) => r.time >= startDate);
    }
    if (endDate) {
      records = records.filter((r) => r.time <= endDate + ' 23:59:59');
    }

    // Sorting
    records.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (sortField === 'time') {
        valA = valA.replace(/[- :]/g, '');
        valB = valB.replace(/[- :]/g, '');
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return records;
  }, [alarmRecords, filterType, startDate, endDate, sortField, sortDir]);

  /* ── Handlers ── */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setFilterType('全部');
  };

  /* ── Styles ── */
  const cardStyle = {
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  };

  const dateInputStyle = {
    padding: '6px 10px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 13,
    color: '#1a1a2e',
    outline: 'none',
    cursor: 'pointer',
  };

  const selectStyle = {
    padding: '6px 10px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 13,
    color: '#1a1a2e',
    background: '#fff',
    outline: 'none',
    cursor: 'pointer',
    minWidth: 120,
  };

  const btnPrimary = {
    padding: '7px 22px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  const btnReset = {
    padding: '7px 22px',
    background: '#fff',
    color: '#6b7280',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  /* ── Table column config ── */
  const columns = [
    { key: 'time', label: '预警时间', sortable: true, width: '160px' },
    { key: 'name', label: '预警名称', sortable: true, width: '160px' },
    { key: 'desc', label: '预警描述', sortable: false },
    { key: 'status', label: '处理状态', sortable: false, width: '100px' },
    { key: 'handler', label: '处理人', sortable: false, width: '100px' },
  ];

  /* ────────── RENDER ────────── */
  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      {/* ═══ Filter bar ═══ */}
      <div
        style={{
          ...cardStyle,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>开始日期</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={dateInputStyle}
          />
        </div>

        <span style={{ fontSize: 13, color: '#9ca3af' }}>至</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>结束日期</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={dateInputStyle}
          />
        </div>

        <div style={{ width: 1, height: 24, background: '#e5e7eb', margin: '0 4px' }} />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={selectStyle}
        >
          {typeOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        <div style={{ flex: 1 }} />

        <button type="button" style={btnPrimary} onClick={() => {}}>
          查询
        </button>
        <button type="button" style={btnReset} onClick={handleReset}>
          重置
        </button>
      </div>

      {/* ═══ Records table ═══ */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        {filteredRecords.length === 0 ? (
          <EmptyState />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: '12px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#6b7280',
                      textAlign: 'left',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      width: col.width || 'auto',
                    }}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {col.label}
                      {col.sortable && <SortIcon direction={sortField === col.key ? sortDir : null} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, idx) => (
                <tr
                  key={record.id || idx}
                  style={{
                    background: idx % 2 === 0 ? '#fff' : '#fafafa',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f7ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa')}
                >
                  <td style={cellStyle}>{record.time || '--'}</td>
                  <td style={cellStyle}>{record.name || '--'}</td>
                  <td style={{ ...cellStyle, color: '#6b7280' }}>{record.desc || '--'}</td>
                  <td style={cellStyle}>
                    <StatusBadge status={record.status} />
                  </td>
                  <td style={cellStyle}>{record.handler || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Shared cell style ── */
const cellStyle = {
  padding: '12px 16px',
  fontSize: 13,
  color: '#1a1a2e',
  borderBottom: '1px solid #f0f0f0',
  verticalAlign: 'middle',
};

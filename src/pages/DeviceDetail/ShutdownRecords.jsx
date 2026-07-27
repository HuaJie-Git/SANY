import React, { useState, useMemo } from 'react';

/* ---------- Status Badge ---------- */
function StatusBadge({ status }) {
  const config = {
    '已审批': { bg: '#dcfce7', color: '#15803d' },
    '待审批': { bg: '#fef9c3', color: '#a16207' },
    '已拒绝': { bg: '#fee2e2', color: '#dc2626' },
  };
  const s = config[status] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        background: s.bg,
        color: s.color,
      }}
    >
      {status}
    </span>
  );
}

/* ---------- Empty State ---------- */
function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 0',
        gap: 12,
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#d1d5db"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
      <span style={{ fontSize: 14, color: '#9ca3af', fontWeight: 500 }}>
        暂无报停记录
      </span>
      <span style={{ fontSize: 12, color: '#c0c4cc' }}>
        该设备当前没有报停记录
      </span>
    </div>
  );
}

/* ---------- Demo Data ---------- */
const DEMO_DATA = {
  '平地机': [
    { id: 'SR001', date: '2026-07-15', reason: '计划保养停机', status: '已审批', applicant: '张伟', approver: '李明', approveTime: '2026-07-14 16:30' },
    { id: 'SR002', date: '2026-06-20', reason: '发动机故障维修', status: '已审批', applicant: '王磊', approver: '李明', approveTime: '2026-06-19 14:20' },
  ],
  '摊铺机': [
    { id: 'SR001', date: '2026-07-15', reason: '计划保养停机', status: '已审批', applicant: '张伟', approver: '李明', approveTime: '2026-07-14 16:30' },
    { id: 'SR002', date: '2026-06-20', reason: '发动机故障维修', status: '已审批', applicant: '王磊', approver: '李明', approveTime: '2026-06-19 14:20' },
  ],
  '压路机': [],
};

const COLUMNS = [
  { key: 'date', label: '报停日期' },
  { key: 'reason', label: '报停原因' },
  { key: 'status', label: '报停状态' },
  { key: 'applicant', label: '申请人' },
  { key: 'approver', label: '审批人' },
  { key: 'approveTime', label: '审批时间' },
];

/* ---------- Main Component ---------- */
export default function ShutdownRecords({ device }) {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  /* Determine device type and get data */
  const deviceType = device?.type || '';
  const allRecords = useMemo(() => {
    for (const [type, records] of Object.entries(DEMO_DATA)) {
      if (deviceType.includes(type)) {
        return records;
      }
    }
    return [];
  }, [deviceType]);

  /* Filter records by date range */
  const filteredRecords = useMemo(() => {
    if (!dateStart && !dateEnd) return allRecords;
    return allRecords.filter((r) => {
      if (dateStart && r.date < dateStart) return false;
      if (dateEnd && r.date > dateEnd) return false;
      return true;
    });
  }, [allRecords, dateStart, dateEnd]);

  const handleReset = () => {
    setDateStart('');
    setDateEnd('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          background: '#f9fafb',
          borderRadius: 8,
          padding: '14px 20px',
        }}
      >
        <span style={{ fontSize: 13, color: '#6b7280', flexShrink: 0 }}>报停日期：</span>
        <input
          type="date"
          value={dateStart}
          onChange={(e) => setDateStart(e.target.value)}
          style={{
            padding: '6px 10px',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            fontSize: 13,
            color: '#1a1a2e',
            background: '#fff',
            outline: 'none',
          }}
        />
        <span style={{ fontSize: 13, color: '#9ca3af' }}>至</span>
        <input
          type="date"
          value={dateEnd}
          onChange={(e) => setDateEnd(e.target.value)}
          style={{
            padding: '6px 10px',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            fontSize: 13,
            color: '#1a1a2e',
            background: '#fff',
            outline: 'none',
          }}
        />
        <button
          type="button"
          style={{
            padding: '6px 16px',
            background: '#e60012',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          查询
        </button>
        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: '6px 16px',
            background: '#fff',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          重置
        </button>
      </div>

      {/* Table or Empty State */}
      {filteredRecords.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          style={{
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
            }}
          >
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#6b7280',
                      background: '#f9fafb',
                      borderBottom: '1px solid #e5e7eb',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, idx) => (
                <tr
                  key={record.id}
                  style={{
                    background: idx % 2 === 0 ? '#fff' : '#f9fafb',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f9fafb';
                  }}
                >
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', color: '#1a1a2e', whiteSpace: 'nowrap' }}>
                    {record.date}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', color: '#1a1a2e' }}>
                    {record.reason}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                    <StatusBadge status={record.status} />
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', color: '#1a1a2e' }}>
                    {record.applicant}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', color: '#1a1a2e' }}>
                    {record.approver}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {record.approveTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

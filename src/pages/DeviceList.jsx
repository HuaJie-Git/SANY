import React, { useState, useMemo } from 'react';
import { DEVICES } from '../data/devices';

/* ─── Column definitions ─── */
const COLUMNS = [
  { key: 'code', label: '设备编号', width: 200 },
  { key: 'type', label: '设备类型', width: 110 },
  { key: 'online', label: '在线状态', width: 90 },
  { key: 'runStatus', label: '运行状态', width: 90 },
  { key: 'updateTime', label: '数据更新时间', width: 180 },
  { key: 'assetId', label: '资产编号', width: 100 },
  { key: 'ownership', label: '设备归属类型', width: 110 },
  { key: 'project', label: '关联项目', width: 130 },
  { key: 'org', label: '所属组织', width: 160 },
  { key: 'action', label: '操作', width: 100 },
];

/* ─── Helpers ─── */
const isOnline = (s) => s === '行驶' || s === '工作' || s === '怠速';
const RUN_STATUS_MAP = { 行驶: '行驶', 离线: '离线', 工作: '工作', 怠速: '怠速' };

/* ─── Inline SVG icons ─── */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
);
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
);

/* ─── Status dot ─── */
function StatusDot({ online }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: online ? '#22c55e' : '#9ca3af',
          display: 'inline-block',
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      <span style={{ fontSize: 13, color: online ? '#16a34a' : '#6b7280' }}>
        {online ? '在线' : '离线'}
      </span>
    </span>
  );
}

/* ─── Run status dot ─── */
function RunStatusDot({ status }) {
  const colorMap = { 行驶: '#22c55e', 工作: '#22c55e', 怠速: '#f59e0b', 离线: '#9ca3af' };
  const label = RUN_STATUS_MAP[status] || '--';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: colorMap[status] || '#d1d5db',
          display: 'inline-block',
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
    </span>
  );
}

/* ─── Main Component ─── */
export default function DeviceList({ onSelectDevice }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredDevices = useMemo(() => {
    return DEVICES.filter((d) => {
      const q = searchQuery.trim().toLowerCase();
      if (q && !d.code.toLowerCase().includes(q) && !d.name.includes(q) && !d.model.toLowerCase().includes(q)) return false;
      if (filterType && d.type !== filterType) return false;
      if (filterStatus && d.status !== filterStatus) return false;
      return true;
    });
  }, [searchQuery, filterType, filterStatus]);

  const handleReset = () => {
    setSearchQuery('');
    setFilterType('');
    setFilterStatus('');
  };

  /* ── row click handler ── */
  const handleRowClick = (device) => {
    const idx = DEVICES.indexOf(device);
    if (idx >= 0) onSelectDevice(idx);
  };

  /* ── shared styles ── */
  const inputStyle = {
    padding: '7px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 13,
    color: '#1a1a2e',
    background: '#fff',
    outline: 'none',
  };

  const thStyle = {
    textAlign: 'left',
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: '12px 14px',
    fontSize: 13,
    color: '#374151',
    borderBottom: '1px solid #f0f0f0',
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#f5f6fa', padding: 24 }}>
      {/* ── Top bar: search + filters ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', minWidth: 240, maxWidth: 360, flex: '1 1 240px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="设备序列号、项目自编号、资产编号、车牌号"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, width: '100%', paddingLeft: 32, boxSizing: 'border-box' }}
          />
        </div>

        {/* Device type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer', minWidth: 100 }}
        >
          <option value="">设备类型</option>
          <option value="平地机">平地机</option>
          <option value="压路机">压路机</option>
          <option value="摊铺机">摊铺机</option>
          <option value="泵车">泵车</option>
          <option value="拖泵">拖泵</option>
          <option value="车载泵">车载泵</option>
          <option value="铣刨机">铣刨机</option>
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer', minWidth: 100 }}
        >
          <option value="">运行状态</option>
          <option value="行驶">行驶</option>
          <option value="离线">离线</option>
        </select>

        <button
          type="button"
          onClick={handleReset}
          aria-label="重置筛选"
          style={{ ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}
        >
          <FilterIcon /> 筛选
        </button>

        <div style={{ flex: 1 }} />

        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: '7px 16px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            background: '#fff',
            color: '#374151',
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <RefreshIcon /> 刷新
        </button>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th key={col.key} style={{ ...thStyle, width: col.width }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDevices.length > 0 ? (
                filteredDevices.map((device, index) => {
                  const online = isOnline(device.status);
                  return (
                    <tr
                      key={device.id}
                      style={{ cursor: 'pointer', background: index % 2 === 1 ? '#fafbfc' : '#fff' }}
                      onClick={() => handleRowClick(device)}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f4ff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = index % 2 === 1 ? '#fafbfc' : '#fff'; }}
                    >
                      {/* 设备编号 (image + code) */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={device.image}
                            alt={device.name}
                            style={{ width: 40, height: 30, objectFit: 'contain', borderRadius: 4, background: '#f5f5f5', flexShrink: 0 }}
                          />
                          <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: 13 }}>{device.code}</span>
                        </div>
                      </td>

                      {/* 设备类型 */}
                      <td style={tdStyle}>{device.type}</td>

                      {/* 在线状态 */}
                      <td style={tdStyle}><StatusDot online={online} /></td>

                      {/* 运行状态 */}
                      <td style={tdStyle}><RunStatusDot status={device.status} /></td>

                      {/* 数据更新时间 */}
                      <td style={tdStyle}>{device.updateTime || '--'}</td>

                      {/* 资产编号 */}
                      <td style={tdStyle}>--</td>

                      {/* 设备归属类型 */}
                      <td style={tdStyle}>自有</td>

                      {/* 关联项目 */}
                      <td style={tdStyle}>{device.project?.name || '--'}</td>

                      {/* 所属组织 */}
                      <td style={tdStyle}>三一集团设备运营中心</td>

                      {/* 操作 */}
                      <td style={tdStyle}>
                        <span style={{ color: '#3b82f6', fontWeight: 500, fontSize: 13 }}>详情</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={COLUMNS.length} style={{ ...tdStyle, textAlign: 'center', padding: '48px 16px', color: '#9ca3af' }}>
                    暂无匹配的设备
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

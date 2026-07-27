import React from 'react';

const isEmpty = (val) => !val || val === '--' || val === '-';

const DocumentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const FactoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20" />
    <path d="M5 20V8l5 4V8l5 4V4h3v16" />
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const ArchiveField = ({ label, value }) => (
  <div className="flex flex-col gap-1" style={{ paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
    <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
    <span
      style={{
        fontSize: 14,
        fontWeight: 500,
        color: isEmpty(value) ? '#c0c4cc' : '#1a1a2e',
      }}
    >
      {value || '--'}
    </span>
  </div>
);

const ArchiveSection = ({ title, icon, fields }) => (
  <div
    className="rounded-lg"
    style={{
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      padding: '16px 20px',
    }}
  >
    <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
      {icon}
      <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{title}</span>
    </div>
    <div
      className="grid"
      style={{
        gridTemplateColumns: 'repeat(3, 1fr)',
        columnGap: 24,
        rowGap: 16,
      }}
    >
      {(fields || []).map((field, idx) => (
        <ArchiveField key={idx} label={field.label} value={field.value} />
      ))}
    </div>
  </div>
);

export default function DeviceArchive({ device }) {
  const archive = device?.archive || {};
  const ledgerFields = archive['台账信息'] || [];
  const manufacturerFields = archive['主机厂信息'] || [];
  const bindingFields = archive['绑定信息'] || [];

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      {/* Last update info bar */}
      <div
        className="flex items-center justify-between rounded-lg"
        style={{ background: '#f9fafb', padding: '12px 16px' }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>档案信息</span>
        <span style={{ fontSize: 13, color: '#9ca3af' }}>
          档案最后更新：{archive.updateTime || '2026-07-24 15:30:00'} {archive.updater ? `by ${archive.updater}` : ''}
        </span>
      </div>

      {/* Ledger Info */}
      <ArchiveSection
        title="台账信息"
        icon={<DocumentIcon />}
        fields={ledgerFields}
      />

      {/* Manufacturer Info */}
      <ArchiveSection
        title="主机厂信息"
        icon={<FactoryIcon />}
        fields={manufacturerFields}
      />

      {/* Binding Info */}
      <ArchiveSection
        title="绑定信息"
        icon={<LinkIcon />}
        fields={bindingFields}
      />
    </div>
  );
}

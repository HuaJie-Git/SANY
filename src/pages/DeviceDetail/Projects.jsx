import React, { useState, useEffect, useCallback } from 'react';

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
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <span style={{ fontSize: 14, color: '#9ca3af', fontWeight: 500 }}>
        暂未参与项目
      </span>
    </div>
  );
}

/* ---------- Info Grid Item ---------- */
function InfoItem({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: '#1a1a2e' }}>
        {value || '--'}
      </span>
    </div>
  );
}

/* ---------- Status Badge ---------- */
function StatusBadge({ status }) {
  const isOngoing = status === '进行中';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        background: isOngoing ? '#22c55e' : '#f3f4f6',
        color: isOngoing ? '#fff' : '#6b7280',
        marginLeft: 12,
      }}
    >
      {status}
    </span>
  );
}

/* ---------- Detail Modal ---------- */
function DetailModal({ project, deviceCode, onClose }) {
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

  if (!project) return null;

  const fields = [
    { label: '项目名称', value: project.name },
    { label: '项目周期', value: project.period },
    { label: '设备角色', value: project.role },
    { label: '项目状态', value: project.status },
    { label: '项目地址', value: project.address },
    { label: '设备编号', value: deviceCode },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="proj-detail-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
      />
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          padding: '24px 28px',
          width: 420,
          maxWidth: '90vw',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span id="proj-detail-title" style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>
            项目详情
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

/* ---------- Main Component ---------- */
export default function Projects({ device }) {
  const project = device?.project;
  const [showDetail, setShowDetail] = useState(false);

  if (!project || !project.name) {
    return <EmptyState />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Project Card */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
          padding: '24px 28px',
        }}
      >
        {/* Header: Name + Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1a1a2e',
            }}
          >
            {project.name}
          </span>
          <StatusBadge status={project.status} />
        </div>

        {/* Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            rowGap: 18,
            columnGap: 40,
            marginBottom: 24,
          }}
        >
          <InfoItem label="项目周期" value={project.period} />
          <InfoItem label="设备角色" value={project.role} />
          <InfoItem label="项目状态" value={project.status} />
          <InfoItem label="项目地址" value={project.address} />
        </div>

        {/* Footer Link */}
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <button
            type="button"
            onClick={() => setShowDetail(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            查看详情
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <DetailModal
          project={project}
          deviceCode={device?.code || '--'}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
}

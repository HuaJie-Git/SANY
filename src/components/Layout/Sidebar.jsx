import React from 'react';

/* ─── Inline SVG Icons ─── */
const icons = {
  '设备管理': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a4 4 0 0 0-8 0v2" />
    </svg>
  ),
  '数据大屏': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  '项目管理': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  '监控中心': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  ),
  '设备保养': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  '维修管理': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  '费用核算': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  '企业服务': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
};

const menuItems = [
  { label: '设备管理' },
  { label: '数据大屏' },
  { label: '项目管理' },
  { label: '监控中心' },
  { label: '设备保养' },
  { label: '维修管理' },
  { label: '费用核算' },
  { label: '企业服务' },
];

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    top: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1a1a2e',
    color: '#fff',
    padding: '10px 24px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    zIndex: 10000,
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    transition: 'opacity 0.3s',
    opacity: '1',
  });
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

const Sidebar = () => {
  const activeIndex = 0;

  const handleClick = (label) => {
    if (label !== '设备管理') {
      showToast(`${label}功能演示`);
    }
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{
        width: 220,
        backgroundColor: '#1a1a2e',
        color: '#ffffff',
        padding: '24px 0',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 20px', marginBottom: 28 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#e60012',
            letterSpacing: 1,
          }}
        >
          My SANY
        </div>
        <div
          style={{
            fontSize: 11,
            color: '#6b7280',
            marginTop: 4,
          }}
        >
          智能管理平台
        </div>
      </div>

      {/* Menu */}
      <nav className="flex flex-col" style={{ gap: 2 }}>
        {menuItems.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleClick(item.label)}
              className="flex items-center cursor-pointer"
              style={{
                padding: '12px 20px',
                border: 'none',
                borderRadius: 0,
                borderTop: 'none',
                borderLeft: isActive ? '3px solid #e60012' : '3px solid transparent',
                borderRight: 'none',
                borderBottom: 'none',
                backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                transition: 'background-color 0.2s',
                width: '100%',
                textAlign: 'left',
                color: 'inherit',
                font: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: 16, marginRight: 10, width: 22, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icons[item.label]}
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

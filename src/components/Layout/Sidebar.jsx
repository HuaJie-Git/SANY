import React from 'react';

const menuItems = [
  { label: '设备管理', icon: '▣' },
  { label: '数据大屏', icon: '▥' },
  { label: '项目管理', icon: '▤' },
  { label: '监控中心', icon: '⌁' },
  { label: '设备保养', icon: '⌘' },
  { label: '维修管理', icon: '⌕' },
  { label: '费用核算', icon: '≡' },
  { label: '企业服务', icon: '▱' },
];

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, { position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#252b33', color: '#fff', padding: '8px 18px', borderRadius: 4, fontSize: 12, zIndex: 10000 });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1600);
}

export default function Sidebar() {
  return (
    <aside className="sany-sidebar" aria-label="主导航">
      <div className="sidebar-logo-mark">▰</div>
      <nav>
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            type="button"
            title={item.label}
            className={`sidebar-item${index === 0 ? ' is-active' : ''}`}
            onClick={() => index !== 0 && showToast(`${item.label}功能演示`)}
          >
            <span aria-hidden="true">{item.icon}</span>
          </button>
        ))}
      </nav>
      <button type="button" className="sidebar-bottom" title="菜单">☰</button>
    </aside>
  );
}

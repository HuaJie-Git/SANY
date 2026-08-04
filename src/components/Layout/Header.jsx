import React from 'react';

const Chevron = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Header() {
  return (
    <header className="sany-topbar">
      <div className="sany-brand">My <span>SANY</span></div>
      <div className="sany-topbar-actions">
        <button type="button" className="topbar-select">◉ 中文 <Chevron /></button>
        <button type="button" className="topbar-select">三一集团 <Chevron /></button>
        <button type="button" className="topbar-icon" aria-label="通知">♧</button>
        <button type="button" className="topbar-user"><span className="topbar-avatar">S</span> 张经理 <Chevron /></button>
      </div>
    </header>
  );
}

import React from 'react';

const Chevron = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function MessageIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6.5 16.5h11l-1.25-2.2V10a4.25 4.25 0 0 0-8.5 0v4.3zM9.5 19a2.7 2.7 0 0 0 5 0"/></svg>;
}

export default function Header({ onOpenNotifications }) {
  return (
    <header className="sany-topbar">
      <div className="sany-brand my-sany-brand" aria-label="My SANY"><i>My</i><b>SANY</b></div>
      <div className="sany-topbar-actions">
        <button type="button" className="topbar-message" aria-label="消息通知，5 条未读" onClick={onOpenNotifications}><span className="topbar-notice-icon"><MessageIcon/><b>5</b></span><span>消息中心</span></button>
        <button type="button" className="topbar-language" aria-label="语言：简体中文" title="简体中文"><span className="globe-mark">◎</span> 简体中文</button>
        <button type="button" className="topbar-select" title="三一测试租户">三一测试租户 <Chevron /></button>
        <button type="button" className="topbar-user" title="一包，。"><span className="topbar-avatar">S</span><span>一包，。</span><Chevron /></button>
      </div>
    </header>
  );
}

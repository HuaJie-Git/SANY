import React, { useEffect, useRef, useState } from 'react';
import { CURRENT_USER, PREVIEW_USERS } from '../../data/session';

const Chevron = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function MessageIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6.5 16.5h11l-1.25-2.2V10a4.25 4.25 0 0 0-8.5 0v4.3zM9.5 19a2.7 2.7 0 0 0 5 0"/></svg>;
}

export default function Header({ onOpenNotifications, currentUser = CURRENT_USER, onPreviewUserChange }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const switcherRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!userMenuOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!switcherRef.current?.contains(event.target)) setUserMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [userMenuOpen]);

  const selectUser = (id) => {
    onPreviewUserChange?.(id);
    setUserMenuOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <header className="sany-topbar">
      <div className="sany-brand my-sany-brand" aria-label="My SANY"><i>My</i><b>SANY</b></div>
      <div className="sany-topbar-actions">
        <button type="button" className="topbar-message" aria-label="消息通知，5 条未读" onClick={onOpenNotifications}><span className="topbar-notice-icon"><MessageIcon/><b>5</b></span><span>消息中心</span></button>
        <button type="button" className="topbar-language" aria-label="语言：简体中文" title="简体中文"><span className="globe-mark">◎</span> 简体中文</button>
        <button type="button" className="topbar-select" title={currentUser.tenant}>{currentUser.tenant} <Chevron /></button>
        <div className="topbar-user-switcher" ref={switcherRef}>
          <button type="button" ref={triggerRef} className="topbar-user" title={currentUser.name} aria-label={`当前用户：${currentUser.name}，切换用户`} aria-haspopup="menu" aria-expanded={userMenuOpen} onClick={() => setUserMenuOpen((open) => !open)}><span className="topbar-avatar">{currentUser.avatar}</span><span dir="auto">{currentUser.name}</span><Chevron /></button>
          {userMenuOpen && <div className="topbar-user-menu" role="menu" aria-label="切换原型预览用户">
            <div className="topbar-user-menu-heading" role="presentation">切换用户</div>
            {PREVIEW_USERS.map((user) => <button type="button" role="menuitemradio" aria-checked={user.id === currentUser.id} key={user.id} className="topbar-user-option" onClick={() => selectUser(user.id)}><span className="topbar-avatar">{user.avatar}</span><span className="topbar-user-option-text"><strong dir="auto">{user.name}</strong><small dir="auto">{user.tenant}</small></span>{user.id === currentUser.id && <span className="topbar-user-current" aria-hidden="true">✓</span>}</button>)}
          </div>}
        </div>
      </div>
    </header>
  );
}

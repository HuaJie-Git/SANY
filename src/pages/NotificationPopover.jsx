import React from 'react';
import './notification-popover.css';

function CareIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.5 7.5 12 4l5.5 3.5v10L12 21l-5.5-3.5zM9 5.9v-2h6v2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 11h6v5H9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
}

function EscIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3.5h8l3 3v13.2a.8.8 0 0 1-.8.8H6.8a.8.8 0 0 1-.8-.8V4.5a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M9 10h6M9 14h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
}

export default function NotificationPopover({ escEvent, onClose, onOpenCategory, onOpenEsc, onOpenMore, onReadAll }) {
  const deviceName = escEvent?.deviceName || '纯电搅拌车';
  const serialNumber = escEvent?.serialNumber || 'SYM5310BEV-8001';
  return <div className="pc-notification-layer" role="presentation">
    <button className="pc-notification-scrim" type="button" aria-label="关闭消息通知" onClick={onClose}/>
    <section className="pc-notification-popover" role="dialog" aria-label="消息通知">
      <header><h1>消息通知</h1><button type="button" onClick={onReadAll}>全部已读</button></header>
      <div className="pc-notification-groups">
        <button type="button" className="pc-notification-group" onClick={onOpenCategory}><i className="is-care"><CareIcon/></i><span><strong>保养消息</strong><small>4 条待处理保养提醒</small></span><time>10:00</time></button>
        <button type="button" className="pc-notification-group is-esc" onClick={onOpenEsc}><i className="is-esc"><EscIcon/></i><span><strong>ESC 事件</strong><small>{deviceName} · {serialNumber}</small></span><time>16:20</time></button>
      </div>
      <footer><button type="button" onClick={onOpenMore}>查看更多 <b>›</b></button></footer>
    </section>
  </div>;
}

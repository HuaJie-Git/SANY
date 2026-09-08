import React, { useMemo, useState } from 'react';
import './message-center.css';

const MAINTENANCE_MESSAGES = [
  { id: 'care-1', title: '临近保养提醒', time: '10:00', copy: '您的车辆「211231」即将到保养日期，请尽快安排保养，如需远程支持，可立即预约。' },
  { id: 'care-2', title: '超时保养提醒', time: '昨日 10:00', copy: '您的车辆「HPGJ1241003891」已超过保养日期，请尽快安排保养，如需使用远程支持，可立即预约。' },
  { id: 'care-3', title: '临近保养提醒', time: '昨日 10:00', copy: '您的车辆「BC5350CC1466」即将到保养日期，请尽快安排保养，如需使用远程支持，可立即预约。' },
  { id: 'care-4', title: '临近保养提醒', time: '前天 10:00', copy: '您的车辆「211231」即将到保养日期，请尽快安排保养，如需远程支持，可立即预约。' },
  { id: 'care-5', title: '超时保养提醒', time: '4日 10:00', copy: '您的车辆「HPGJ1241003891」已超过保养日期，请尽快安排保养，如需使用远程支持，可立即预约。' },
  { id: 'care-6', title: '临近保养提醒', time: '4日 10:00', copy: '您的车辆「BC5350CC1466」即将到保养日期，请尽快安排保养，如需使用远程支持，可立即预约。' },
];

function Bell() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.5 16.5h11l-1.25-2.2V10a4.25 4.25 0 0 0-8.5 0v4.3zM9.5 19a2.7 2.7 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function MessageCenter({ escEvent, initialCategory = 'all', onOpenEsc, onClose }) {
  const [category, setCategory] = useState(initialCategory);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [date, setDate] = useState('');
  const [allRead, setAllRead] = useState(false);
  const acknowledged = Boolean(escEvent.acknowledgedAt) || allRead;
  const allUnreadCount = (acknowledged ? 0 : 1) + (allRead ? 0 : MAINTENANCE_MESSAGES.length);
  const messages = useMemo(() => {
    const esc = { id: 'esc', type: 'esc', title: `ESC 事件：${escEvent.deviceName}`, time: escEvent.occurredAt.slice(11), copy: `${escEvent.deviceName}（${escEvent.serialNumber}）触发 ESC 事件，请立即查看设备工况。`, unread: !acknowledged };
    const care = MAINTENANCE_MESSAGES.map((item) => ({ ...item, type: 'care', unread: !allRead }));
    const selected = category === 'care' ? care : [esc, ...care];
    return onlyUnread ? selected.filter((item) => item.unread) : selected;
  }, [acknowledged, allRead, category, escEvent, onlyUnread]);

  return <div className="pc-message-modal-layer" role="presentation">
    <button className="pc-message-scrim" type="button" aria-label="关闭消息中心" onClick={onClose}/>
    <section className="pc-message-center" role="dialog" aria-modal="true" aria-labelledby="message-center-title">
      <header className="pc-message-header"><h1 id="message-center-title">消息中心</h1><button type="button" aria-label="关闭" onClick={onClose}>×</button></header>
      <div className="pc-message-body">
        <aside className="pc-message-categories" aria-label="消息分类">
          <button type="button" className={category === 'all' ? 'is-active' : ''} onClick={() => setCategory('all')}><span>全部消息</span><b>{allUnreadCount}</b></button>
          <button type="button" className={category === 'care' ? 'is-active' : ''} onClick={() => setCategory('care')}><i><Bell/></i><span>保养消息</span><b>{allRead ? 0 : MAINTENANCE_MESSAGES.length}</b></button>
        </aside>
        <div className="pc-message-stream">
          <div className="pc-message-tools">
            <label><span>开始日期　→　结束日期</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="消息日期筛选"/></label>
            <button type="button" onClick={() => { setDate(''); setOnlyUnread(false); }}>重置</button>
            <label className="pc-message-unread"><input type="checkbox" checked={onlyUnread} onChange={(event) => setOnlyUnread(event.target.checked)}/> 只看未读</label>
            <button className="pc-message-read-all" type="button" onClick={() => setAllRead(true)}>全部已读</button>
          </div>
          <div className="pc-message-list" aria-label="消息列表">
            {messages.map((message) => message.type === 'esc' ? (
              <article className={`pc-stream-message pc-stream-esc${message.unread ? ' is-unread' : ''}`} key={message.id}>
                <button type="button" className="pc-stream-message-main" onClick={onOpenEsc}><span className="pc-stream-dot"/><span className="pc-stream-copy"><strong>{message.title}</strong><small>{message.copy}</small></span><time>{message.time}</time></button>
              </article>
            ) : (
              <article className={`pc-stream-message${message.unread ? ' is-unread' : ''}`} key={message.id}><button type="button" className="pc-stream-message-main"><span className="pc-stream-dot"/><span className="pc-stream-copy"><strong>{message.title}</strong><small>{message.copy}</small></span><time>{message.time}</time></button></article>
            ))}
            {!messages.length && <p className="pc-message-empty">当前筛选条件下暂无未读消息</p>}
          </div>
        </div>
      </div>
    </section>
  </div>;
}

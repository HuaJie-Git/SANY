import React, { useMemo, useState } from 'react';
import { ESC_EVENTS } from '../data/escEvents';
import './esc-event-detail-page.css';

function StatusChart({ title, tone, labels }) {
  return <section className="esc-detail-chart"><header><span className={`esc-detail-dot ${tone}`}/><h2>{title}</h2></header><div className="esc-detail-plot"><div className="esc-detail-y">{labels.map((label) => <span key={label}>{label}</span>)}</div><div className="esc-detail-grid"><div className="esc-detail-line"/><div className="esc-detail-times">{['10:59:55', '10:59:56', '10:59:57', '10:59:58', '10:59:59', '11:00:00', '11:00:01', '11:00:02', '11:00:03', '11:00:04'].map((time) => <time key={time}>{time}</time>)}</div></div></div></section>;
}

export default function EscEventDetailPage({ eventId, onBack, onSelectEvent }) {
  const [activeIndex, setActiveIndex] = useState(Math.max(0, ESC_EVENTS.findIndex((event) => event.id === eventId)));
  const [date, setDate] = useState('2026-08-05');
  const [time, setTime] = useState('16:00:00');
  const [toast, setToast] = useState('');
  const event = ESC_EVENTS[activeIndex] || ESC_EVENTS[0];
  const eventLabel = useMemo(() => activeIndex === 0 ? '在线设备' : '离线设备', [activeIndex]);

  const selectIndex = (nextIndex) => {
    const safeIndex = Math.max(0, Math.min(ESC_EVENTS.length - 1, nextIndex));
    setActiveIndex(safeIndex);
    onSelectEvent?.(ESC_EVENTS[safeIndex].id);
  };

  return <div className="esc-detail-page">
    <div className="esc-detail-back"><button type="button" onClick={onBack}>← 返回ESC事件列表</button><div className="esc-detail-switch"><button type="button" disabled={activeIndex === 0} onClick={() => selectIndex(activeIndex - 1)}>‹ 上一台</button><select value={event.id} onChange={(item) => selectIndex(ESC_EVENTS.findIndex((row) => row.id === item.target.value))} aria-label="选择 ESC 设备">{ESC_EVENTS.map((row) => <option key={row.id} value={row.id}>{row.deviceCode}</option>)}</select><button type="button" disabled={activeIndex === ESC_EVENTS.length - 1} onClick={() => selectIndex(activeIndex + 1)}>下一台 ›</button><b>{activeIndex + 1} / {ESC_EVENTS.length}</b></div></div>

    <section className="esc-detail-device-card">
      <div className="esc-detail-device-main"><div className="esc-detail-truck" aria-hidden="true"><span>▰</span><i/><b/></div><dl><div><dt>设备编号/自编号/车牌号</dt><dd>{event.deviceCode}/-/-</dd></div><div><dt>设备类型</dt><dd>{event.deviceType}</dd></div><div><dt>关联项目</dt><dd>{event.project}</dd></div><div><dt>设备状态</dt><dd><i className={event.online === '在线' ? 'is-online' : ''}/>{event.online}　<i className={event.running === '工作' ? 'is-online' : ''}/>{event.running}</dd></div><div><dt>ESC功能状态</dt><dd>-</dd></div></dl></div><button className="esc-detail-report" type="button" onClick={() => setToast('已生成 ESC 事件报停申请草稿')}>● 报停</button>
      <nav aria-label="设备详情页签"><button type="button">实时状态</button><button type="button">设备档案</button><button type="button">历史轨迹</button><button type="button">统计报表</button><button type="button">保养管理</button><button type="button">预警记录</button><button type="button">报停记录</button><button type="button">参与项目</button><button className="is-active" type="button">ESC事件</button></nav>
    </section>

    <section className="esc-detail-filters" aria-label="ESC趋势筛选"><input type="date" value={date} onChange={(item) => setDate(item.target.value)}/><input type="time" step="1" value={time} onChange={(item) => setTime(item.target.value)}/><div><span>ESC工作状态 <button type="button" aria-label="移除 ESC 工作状态">×</button></span><span>+18…</span></div><button type="button" className="esc-detail-export" onClick={() => setToast(`${event.deviceCode} 的 ESC 报表已导出`)}>⇧ 导出报表</button></section>

    <main className="esc-detail-content"><StatusChart title="ESC工作状态" tone="is-work" labels={['工作', '未工作']}/><StatusChart title="ESC故障状态" tone="is-fault" labels={['异常', '正常']}/><aside className="esc-detail-context"><b>事件编号：{event.eventNo}</b><span>{eventLabel} · ESC 发生于 {event.occurredAt}</span></aside></main>
    {toast && <div className="esc-detail-toast" role="status">{toast}<button type="button" onClick={() => setToast('')}>×</button></div>}
  </div>;
}

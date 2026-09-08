import React, { useMemo, useState } from 'react';
import { ESC_EVENTS } from '../data/escEvents';
import './esc-event-page.css';

export default function EscEventPage({ onOpenDetail }) {
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deviceType, setDeviceType] = useState('全部设备类型');
  const [status, setStatus] = useState('全部运行状态');
  const [onlineStatus, setOnlineStatus] = useState('全部在线状态');
  const [project, setProject] = useState('全部项目');
  const [ownership, setOwnership] = useState('全部归属类型');

  const events = useMemo(() => ESC_EVENTS.filter((event) => {
    const matchesKeyword = [event.deviceCode, event.assetNo, event.project].join(' ').toLowerCase().includes(keyword.trim().toLowerCase());
    const matchesStart = !startDate || event.occurredAt.slice(0, 10) >= startDate;
    const matchesEnd = !endDate || event.occurredAt.slice(0, 10) <= endDate;
    const matchesType = deviceType === '全部设备类型' || event.deviceType === deviceType;
    const matchesStatus = status === '全部运行状态' || event.running === status;
    const matchesOnline = onlineStatus === '全部在线状态' || event.online === onlineStatus;
    const matchesProject = project === '全部项目' || event.project === project;
    const matchesOwnership = ownership === '全部归属类型' || event.ownership === ownership;
    return matchesKeyword && matchesStart && matchesEnd && matchesType && matchesStatus && matchesOnline && matchesProject && matchesOwnership;
  }), [deviceType, endDate, keyword, onlineStatus, ownership, project, startDate, status]);

  const openDetail = (event) => onOpenDetail?.(event.id);

  return (
    <div className="esc-event-page">
      <section className="esc-event-panel" aria-label="ESC事件列表">
        <div className="esc-event-filters">
          <label className="esc-date-filter"><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} aria-label="开始日期"/><b>→</b><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} aria-label="结束日期"/></label>
          <label className="esc-search"><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="设备序列号、项目自编号、设备编号、车牌号"/><span aria-hidden="true">⌕</span></label>
          <select value={deviceType} onChange={(event) => setDeviceType(event.target.value)} aria-label="设备类型">
            <option>全部设备类型</option><option>搅拌车</option>
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="运行状态">
            <option>全部运行状态</option><option>离线</option><option>上电</option><option>工作</option><option>怠速</option><option>行驶</option><option>关机</option><option>停车在线</option><option>充电</option>
          </select>
          <select value={onlineStatus} onChange={(event) => setOnlineStatus(event.target.value)} aria-label="在线状态">
            <option>全部在线状态</option><option>在线</option><option>未物联</option><option>离线</option>
          </select>
          <select value={project} onChange={(event) => setProject(event.target.value)} aria-label="所属项目">
            <option>全部项目</option><option>长沙梅溪湖房建项目</option><option>-</option>
          </select>
          <select value={ownership} onChange={(event) => setOwnership(event.target.value)} aria-label="设备归属类型">
            <option>全部归属类型</option><option>外部分包</option><option>自有</option><option>租赁</option><option>分包</option>
          </select>
        </div>

        <div className="esc-event-table-scroll">
          <table>
            <thead><tr><th>设备编码</th><th>设备类型</th><th>在线状态</th><th>运行状态</th><th>ESC发生时间</th><th>质保状态</th><th>设备编号</th><th>设备归属类型</th><th>关联项目</th><th>操作</th></tr></thead>
            <tbody>{events.map((event) => <tr key={event.id}>
              <td><strong>{event.deviceCode}</strong></td><td>{event.deviceType}</td>
              <td><span className={`esc-state ${event.online === '在线' ? 'is-online' : ''}`}><i/>{event.online}</span></td>
              <td><span className={`esc-state ${event.running === '工作' ? 'is-online' : ''}`}><i/>{event.running}</span></td>
              <td><time>{event.occurredAt}</time></td><td>{event.warranty}</td><td>{event.assetNo}</td><td>{event.ownership}</td><td>{event.project}</td>
              <td><button type="button" onClick={() => openDetail(event)}>详情</button></td>
            </tr>)}</tbody>
          </table>
          {!events.length && <div className="esc-event-empty"><b>暂无 ESC 事件</b><span>请调整搜索条件或运行状态后重试。</span></div>}
        </div>

        <footer><span>{events.length} 条记录</span><button type="button" disabled>‹</button><b>1</b><button type="button" disabled>›</button><select aria-label="每页记录数"><option>10 条/页</option></select></footer>
      </section>
    </div>
  );
}

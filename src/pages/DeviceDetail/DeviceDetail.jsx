import React, { useEffect, useState } from 'react';
import { DEVICES } from '../../data/devices';
import RealtimeStatus from './RealtimeStatus';
import StatisticsReport from './StatisticsReport';
import DeviceArchive from './DeviceArchive';
import HistoryTrack from './HistoryTrack';
import Maintenance from './Maintenance';
import WarningRecords from './WarningRecords';
import ShutdownRecords from './ShutdownRecords';
import Projects from './Projects';
import './device-detail.css';

const TAB_LIST = ['实时状态', '统计报表', '设备档案', '历史轨迹', '保养管理', '预警记录', '报停记录', '参与项目'];
const TAB_COMPONENT_MAP = { '实时状态': RealtimeStatus, '统计报表': StatisticsReport, '设备档案': DeviceArchive, '历史轨迹': HistoryTrack, '保养管理': Maintenance, '预警记录': WarningRecords, '报停记录': ShutdownRecords, '参与项目': Projects };

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, { position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#252b33', color: '#fff', padding: '8px 18px', borderRadius: 4, fontSize: 12, zIndex: 10000 });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1600);
}

export default function DeviceDetail({ device, deviceIndex, totalDevices, onBack, onDeviceChange }) {
  const [activeTab, setActiveTab] = useState('实时状态');
  const [showStopModal, setShowStopModal] = useState(false);
  const deviceCode = device?.code || '--';
  const deviceImage = device?.image || '';
  const projectName = device?.projectName || device?.project?.name || '--';

  useEffect(() => {
    if (!showStopModal) return undefined;
    const onKey = (event) => event.key === 'Escape' && setShowStopModal(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showStopModal]);

  const ActiveComponent = TAB_COMPONENT_MAP[activeTab] || RealtimeStatus;
  return (
    <div className="device-detail-page">
      <div className="detail-toolbar">
        <button type="button" className="back-button" onClick={onBack}>‹ <span>返回设备列表</span></button>
        <div className="device-switcher">
          <button type="button" disabled={deviceIndex <= 0} onClick={() => { onDeviceChange(deviceIndex - 1); setActiveTab('实时状态'); }}>‹ 上一台</button>
          <select value={deviceCode} onChange={(event) => { const index = DEVICES.findIndex((item) => item.code === event.target.value); if (index >= 0) onDeviceChange(index); }} aria-label="选择设备">
            {DEVICES.map((item) => <option key={item.code} value={item.code}>{item.code}</option>)}
          </select>
          <button type="button" disabled={deviceIndex >= totalDevices - 1} onClick={() => { onDeviceChange(deviceIndex + 1); setActiveTab('实时状态'); }}>下一台 ›</button>
          <span>{deviceIndex + 1}/{totalDevices}</span>
        </div>
      </div>

      <section className="device-summary-card">
        <div className="device-summary-main">
          <div className="device-thumb">
            {deviceImage ? <img src={deviceImage} alt={device?.type || '设备'} /> : <span>▣</span>}
          </div>
          <div className="summary-field"><small>设备序列号</small><strong>{deviceCode}</strong></div>
          <div className="summary-field"><small>自编号</small><strong>{device?.model || '--'}</strong></div>
          <div className="summary-field"><small>车辆型号</small><strong>{device?.model || '--'}</strong></div>
          <div className="summary-field"><small>设备种类</small><strong>{device?.type || '--'}</strong></div>
          <div className="summary-field"><small>设备状态</small><strong><i className={`state-dot ${device?.status === '行驶' ? 'is-online' : ''}`} />{device?.status || '--'}</strong></div>
          <div className="summary-field summary-project"><small>所属项目</small><strong>{projectName}</strong></div>
          <button type="button" className="stop-button" onClick={() => setShowStopModal(true)}>◉ 恢复</button>
        </div>
        <div className="detail-tabs">
          {TAB_LIST.map((tab) => <button type="button" key={tab} className={activeTab === tab ? 'is-active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}
        </div>
      </section>

      <ActiveComponent device={device} />

      {showStopModal && (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowStopModal(false)}>
          <div className="stop-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h3>恢复设备</h3>
            <p>确认恢复设备「{deviceCode}」的运行状态吗？</p>
            <div className="modal-actions"><button type="button" onClick={() => setShowStopModal(false)}>取消</button><button type="button" className="primary" onClick={() => { setShowStopModal(false); showToast(`设备 ${deviceCode} 已恢复`); }}>确认</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

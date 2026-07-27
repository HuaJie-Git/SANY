import React, { useState, useEffect, useCallback } from 'react';
import { DEVICES } from '../../data/devices';
import RealtimeStatus from './RealtimeStatus';
import StatisticsReport from './StatisticsReport';
import DeviceArchive from './DeviceArchive';
import HistoryTrack from './HistoryTrack';
import Maintenance from './Maintenance';
import WarningRecords from './WarningRecords';
import ShutdownRecords from './ShutdownRecords';
import Projects from './Projects';

const TAB_LIST = [
  '实时状态',
  '统计报表',
  '设备档案',
  '历史轨迹',
  '保养管理',
  '预警记录',
  '报停记录',
  '参与项目',
];

const TAB_COMPONENT_MAP = {
  '实时状态': RealtimeStatus,
  '统计报表': StatisticsReport,
  '设备档案': DeviceArchive,
  '历史轨迹': HistoryTrack,
  '保养管理': Maintenance,
  '预警记录': WarningRecords,
  '报停记录': ShutdownRecords,
  '参与项目': Projects,
};

function PlaceholderTab({ name }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        color: '#9ca3af',
        fontSize: 16,
      }}
    >
      {name} - 开发中
    </div>
  );
}

/* Toast helper */
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

export default function DeviceDetail({ device, deviceIndex, totalDevices, onBack, onDeviceChange }) {
  const [activeTab, setActiveTab] = useState('实时状态');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);

  const deviceCode = device?.code || device?.deviceCode || '--';
  const deviceType = device?.type || '--';
  const projectName = device?.projectName || device?.project?.name || '--';
  const deviceImage = device?.image || device?.imageUrl || '';
  const statusLabel = device?.status || '离线';

  const handlePrev = () => {
    if (deviceIndex > 0) {
      onDeviceChange(deviceIndex - 1);
      setActiveTab('实时状态');
    }
  };

  const handleNext = () => {
    if (deviceIndex < totalDevices - 1) {
      onDeviceChange(deviceIndex + 1);
      setActiveTab('实时状态');
    }
  };

  const handleSelectDevice = (index) => {
    onDeviceChange(index);
    setShowDropdown(false);
    setActiveTab('实时状态');
  };

  const handleConfirmStop = useCallback(() => {
    setShowStopModal(false);
    showToast(`设备 ${deviceCode} 报停成功`);
  }, [deviceCode]);

  const handleCancelStop = useCallback(() => {
    setShowStopModal(false);
  }, []);

  // Esc key to close modal
  useEffect(() => {
    if (!showStopModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowStopModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showStopModal]);

  const ActiveComponent = TAB_COMPONENT_MAP[activeTab];

  return (
    <div style={{ background: '#f5f6f8', minHeight: '100vh', padding: 24 }}>
      {/* Top Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          background: '#fff',
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {/* Left: Back Button */}
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            color: '#1f2937',
            padding: '6px 0',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          返回设备列表
        </button>

        {/* Center: Prev / Dropdown / Next + Page Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={handlePrev}
            disabled={deviceIndex <= 0}
            style={{
              padding: '5px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              background: '#fff',
              cursor: deviceIndex <= 0 ? 'not-allowed' : 'pointer',
              fontSize: 13,
              color: deviceIndex <= 0 ? '#d1d5db' : '#1f2937',
              opacity: deviceIndex <= 0 ? 0.5 : 1,
            }}
          >
            上一台
          </button>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: '5px 14px',
                cursor: 'pointer',
                fontSize: 13,
                color: '#1f2937',
                fontWeight: 500,
                minWidth: 160,
                justifyContent: 'space-between',
              }}
            >
              <span>{deviceCode}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {showDropdown && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99,
                  }}
                  onClick={() => setShowDropdown(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: 4,
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                    zIndex: 100,
                    minWidth: 180,
                    maxHeight: 320,
                    overflowY: 'auto',
                  }}
                >
                  {DEVICES.map((d, i) => (
                    <div
                      key={d.id}
                      onClick={() => handleSelectDevice(i)}
                      style={{
                        padding: '8px 14px',
                        cursor: 'pointer',
                        fontSize: 13,
                        color: i === deviceIndex ? '#e60012' : '#1f2937',
                        background: i === deviceIndex ? '#fef2f2' : 'transparent',
                        fontWeight: i === deviceIndex ? 600 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (i !== deviceIndex) e.currentTarget.style.background = '#f5f6f8';
                      }}
                      onMouseLeave={(e) => {
                        if (i !== deviceIndex) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {d.code}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={deviceIndex >= totalDevices - 1}
            style={{
              padding: '5px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              background: '#fff',
              cursor: deviceIndex >= totalDevices - 1 ? 'not-allowed' : 'pointer',
              fontSize: 13,
              color: deviceIndex >= totalDevices - 1 ? '#d1d5db' : '#1f2937',
              opacity: deviceIndex >= totalDevices - 1 ? 0.5 : 1,
            }}
          >
            下一台
          </button>

          <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 4 }}>
            {deviceIndex + 1}/{totalDevices}
          </span>
        </div>

        {/* Right: empty spacer for symmetry */}
        <div />
      </div>

      {/* Device Info Card with Tabs */}
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          marginBottom: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {/* Device Info */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          {/* Left: Device Image */}
          <div
            style={{
              width: 80,
              height: 60,
              borderRadius: 6,
              overflow: 'hidden',
              flexShrink: 0,
              background: '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {deviceImage ? (
              <img
                src={deviceImage}
                alt={deviceCode}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a4 4 0 0 0-8 0v2" />
              </svg>
            )}
          </div>

          {/* Center: Compact field groups with dividers */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0 }}>
            {/* Group 1: Device Code */}
            <div style={{ flex: 1, minWidth: 0, padding: '0 16px' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2, whiteSpace: 'nowrap' }}>
                设备编号/自编号
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {deviceCode}
              </div>
            </div>

            <div style={{ width: 1, height: 32, background: '#e5e7eb', flexShrink: 0 }} />

            {/* Group 2: Device Type */}
            <div style={{ flex: 1, minWidth: 0, padding: '0 16px' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2, whiteSpace: 'nowrap' }}>
                设备类型
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap' }}>
                {deviceType}
              </div>
            </div>

            <div style={{ width: 1, height: 32, background: '#e5e7eb', flexShrink: 0 }} />

            {/* Group 3: Project */}
            <div style={{ flex: 1, minWidth: 0, padding: '0 16px' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2, whiteSpace: 'nowrap' }}>
                关联项目
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {projectName}
              </div>
            </div>

            <div style={{ width: 1, height: 32, background: '#e5e7eb', flexShrink: 0 }} />

            {/* Group 4: Status */}
            <div style={{ flex: 1, minWidth: 0, padding: '0 16px' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2, whiteSpace: 'nowrap' }}>
                设备状态
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: statusLabel === '行驶' ? '#22b573' : '#9ca3af',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap' }}>
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Stop Button */}
          <button
            type="button"
            onClick={() => setShowStopModal(true)}
            style={{
              padding: '6px 18px',
              border: '1px solid #e60012',
              borderRadius: 6,
              background: 'transparent',
              color: '#e60012',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fef2f2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            报停
          </button>
        </div>

        {/* Tabs - flush with card bottom */}
        <div
          style={{
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {TAB_LIST.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                flexShrink: 0,
                padding: '10px 16px',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #1f2937' : '2px solid transparent',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? '#1f2937' : '#6b7280',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) e.currentTarget.style.color = '#1f2937';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) e.currentTarget.style.color = '#6b7280';
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area — no card wrapper, sits on #f5f6f8 */}
      <div style={{ marginTop: 16, minHeight: 400 }}>
        {ActiveComponent ? (
          <ActiveComponent device={device} />
        ) : (
          <PlaceholderTab name={activeTab} />
        )}
      </div>

      {/* Stop Confirmation Modal */}
      {showStopModal && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={handleCancelStop}
          />
          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="stop-modal-title"
            aria-describedby="stop-modal-desc"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              borderRadius: 12,
              padding: '28px 32px',
              zIndex: 1001,
              minWidth: 380,
              maxWidth: 440,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e60012" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span id="stop-modal-title" style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
                确认报停设备
              </span>
            </div>
            <p id="stop-modal-desc" style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              确认报停设备 {deviceCode}？报停后设备将暂停作业任务。
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={handleCancelStop}
                style={{
                  padding: '8px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  background: '#fff',
                  color: '#374151',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmStop}
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: 6,
                  background: '#e60012',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                确认报停
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

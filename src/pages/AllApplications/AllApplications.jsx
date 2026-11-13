import React, { useRef, useState } from 'react';
import { readApplicationOrder, saveApplicationOrder } from '../../data/appCatalog';

const AppIcon = ({ app }) => {
  const stroke = app.accent;
  const shared = { fill: 'none', stroke, strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' };
  let artwork;

  switch (app.icon) {
    case '询价':
      artwork = (
        <>
          <rect x="4.5" y="4.5" width="15" height="15" rx="2" {...shared} />
          <path d="M8 9h8M8 13h5" {...shared} />
          <circle cx="16.5" cy="13" r="1.5" fill={stroke} />
        </>
      );
      break;
    case '召请':
      artwork = (
        <>
          <rect x="4.5" y="5" width="15" height="14" rx="2" {...shared} />
          <path d="M8 12h8M12 8v8" {...shared} />
          <circle cx="17" cy="17" r="3" fill={stroke} />
        </>
      );
      break;
    case '配件':
      artwork = (
        <>
          <rect x="5" y="5" width="14" height="14" rx="2" {...shared} />
          <path d="M8 10h8M8 14h5" {...shared} />
          <circle cx="17" cy="17" r="3" fill={stroke} />
          <path d="m15.8 17 2.4 0" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
        </>
      );
      break;
    case '保养':
      artwork = (
        <>
          <path d="M14.5 5.5a4.7 4.7 0 0 0-5.8 5.8L4.5 15.5a1.8 1.8 0 1 0 2.5 2.5l4.2-4.2a4.7 4.7 0 0 0 5.8-5.8l-2.6 2.1-2-2 2.1-2.6Z" {...shared} />
        </>
      );
      break;
    case '产品':
      artwork = (
        <>
          <rect x="4.5" y="4.5" width="15" height="15" rx="2.5" {...shared} />
          <circle cx="12" cy="12" r="4.2" {...shared} />
          <circle cx="12" cy="12" r="1.4" fill={stroke} />
        </>
      );
      break;
    case '报表':
      artwork = (
        <>
          <path d="M5 19V6M5 19h14M9 16v-5M13 16V8M17 16v-8" {...shared} />
        </>
      );
      break;
    case '检查':
      artwork = (
        <>
          <rect x="4.5" y="4.5" width="15" height="15" rx="2" {...shared} />
          <path d="M9 3.5h6v2H9z" fill={stroke} />
          <path d="m8 12.5 2.5 2.5 5.5-5.5" {...shared} />
        </>
      );
      break;
    case '问卷':
      artwork = (
        <>
          <rect x="4.5" y="4" width="15" height="16" rx="2" {...shared} />
          <path d="M8 8.5h8M8 12.5h6M8 16.5h4" {...shared} />
        </>
      );
      break;
    case '车队':
      artwork = (
        <>
          <path d="M3 6.5h10v9H3z" {...shared} />
          <path d="M13 9.5h3.5l2.5 3v3h-6V9.5z" {...shared} />
          <circle cx="6.5" cy="17" r="1.8" fill={stroke} />
          <circle cx="16" cy="17" r="1.8" fill={stroke} />
        </>
      );
      break;
    case '服务':
      artwork = (
        <>
          <path d="M5 12a7 7 0 0 1 14 0v3.5a2 2 0 0 1-2 2h-1.5v-5H19M5 12v.5H8.5v5H7a2 2 0 0 1-2-2V12Z" {...shared} />
          <path d="M12 19.5h2" {...shared} />
        </>
      );
      break;
    case '二手机':
      artwork = (
        <>
          <rect x="4.5" y="4.5" width="15" height="15" rx="2" {...shared} />
          <path d="M8 9h8M8 12.5h5" {...shared} />
          <path d="m13.5 15.5 1.8 1.8 3.2-3.2" {...shared} />
        </>
      );
      break;
    case '新闻':
      artwork = (
        <>
          <rect x="4.5" y="4.5" width="15" height="15" rx="2" {...shared} />
          <path d="M8 8.5h8M8 12h8M8 15.5h5" {...shared} />
        </>
      );
      break;
    case '计算':
      artwork = (
        <>
          <rect x="4.5" y="4" width="15" height="16" rx="2" {...shared} />
          <line x1="8" y1="8" x2="16" y2="8" {...shared} />
          <circle cx="8" cy="12" r="1.2" fill={stroke} />
          <circle cx="12" cy="12" r="1.2" fill={stroke} />
          <circle cx="16" cy="12" r="1.2" fill={stroke} />
          <circle cx="8" cy="15.5" r="1.2" fill={stroke} />
          <circle cx="12" cy="15.5" r="1.2" fill={stroke} />
          <circle cx="16" cy="15.5" r="1.2" fill={stroke} />
        </>
      );
      break;
    case '心声':
      artwork = (
        <>
          <path d="M12 5.5c-2.3 0-4.2 1.8-4.2 4.1 0 4.1 4.2 6.9 4.2 6.9s4.2-2.8 4.2-6.9c0-2.3-1.9-4.1-4.2-4.1z" {...shared} />
          <circle cx="12" cy="9.6" r="1.6" fill={stroke} />
        </>
      );
      break;
    case '网点':
      artwork = (
        <>
          <path d="M12 3.5a5.5 5.5 0 0 0-5.5 5.5c0 4.2 5.5 11.5 5.5 11.5s5.5-7.3 5.5-11.5a5.5 5.5 0 0 0-5.5-5.5z" {...shared} />
          <circle cx="12" cy="9" r="2.2" fill={stroke} />
        </>
      );
      break;
    case '绑定':
      artwork = (
        <>
          <rect x="4.5" y="4.5" width="15" height="15" rx="2" {...shared} />
          <path d="M12 8v8M8 12h8" {...shared} />
        </>
      );
      break;
    case '资产':
      artwork = (
        <>
          <rect x="4.5" y="7" width="15" height="11" rx="2" {...shared} />
          <path d="M8 7V5.5h8V7M8 11h8M12 11v3" {...shared} />
        </>
      );
      break;
    case '审核':
      artwork = (
        <>
          <path d="M12 3.8 19 6.5v5.2c0 4.1-2.7 6.8-7 8.5-4.3-1.7-7-4.4-7-8.5V6.5l7-2.7Z" {...shared} />
          <path d="m8.8 12 2.1 2.1 4.4-4.4" {...shared} />
        </>
      );
      break;
    case '任务':
      artwork = (
        <>
          <rect x="6" y="4.5" width="12" height="15" rx="2" {...shared} />
          <path d="M9 4.5v-1h6v1M9 10h6M9 14h4" {...shared} />
        </>
      );
      break;
    case '消息':
      artwork = (
        <>
          <path d="M19 11a7 7 0 0 1-7 7H8l-3.5 2 1.1-3.5A7 7 0 1 1 19 11Z" {...shared} />
          <path d="M9 11h.01M12 11h.01M15 11h.01" {...shared} />
        </>
      );
      break;
    case '扫一扫':
      artwork = (
        <>
          <path d="M8 4.5H5.5V7M16 4.5h2.5V7M8 19.5H5.5V17M16 19.5h2.5V17M8.5 8.5h2.8v2.8H8.5zM13 13h2.5v2.5H13z" {...shared} />
        </>
      );
      break;
    case '动态':
      artwork = (
        <>
          <path d="M4.5 15.5h3l2-6 3.2 9 2.1-5h4.7" {...shared} />
        </>
      );
      break;
    case 'AI':
      artwork = (
        <>
          <path d="M7 5.5h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4.5L9 19v-2.5H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" {...shared} />
          <path d="M9 12h.01M12 12h.01M15 12h.01" {...shared} />
        </>
      );
      break;
    case '维修':
      artwork = (
        <>
          <path d="m7 5 2.5 2.5L6.8 10.2 4.3 7.7 7 5ZM13.7 10.3l5 5a2 2 0 0 1-2.8 2.8l-5-5" {...shared} />
          <path d="m10.5 13.5-5 5" {...shared} />
        </>
      );
      break;
    default:
      artwork = (
        <>
          <rect x="5" y="5" width="14" height="14" rx="3" {...shared} />
          <path d="M9 12h6M12 9v6" {...shared} />
        </>
      );
  }

  return (
    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: app.color }} aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24">{artwork}</svg>
    </span>
  );
};

const AllApplications = ({ onBack, onNavigate, onOrderChange }) => {
  const [savedApplications, setSavedApplications] = useState(() => readApplicationOrder());
  const [applications, setApplications] = useState(() => readApplicationOrder());
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);
  const pressTimerRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchTargetRef = useRef(null);
  const ignoreClickRef = useRef(false);

  const moveToTarget = (sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    setApplications((current) => {
      const sourceIndex = current.findIndex((app) => app.id === sourceId);
      const targetIndex = current.findIndex((app) => app.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      setHasPendingChanges(next.some((app, index) => app.id !== savedApplications[index]?.id));
      return next;
    });
  };

  const cancelOrderChange = () => {
    setApplications(savedApplications);
    setHasPendingChanges(false);
  };

  const saveOrderChange = () => {
    saveApplicationOrder(applications);
    setSavedApplications(applications);
    setHasPendingChanges(false);
    onOrderChange?.(applications);
  };

  const clearPressTimer = () => {
    if (pressTimerRef.current) window.clearTimeout(pressTimerRef.current);
    pressTimerRef.current = null;
  };

  const beginTouch = (event, appId) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, appId };
    touchTargetRef.current = appId;
    clearPressTimer();
    pressTimerRef.current = window.setTimeout(() => {
      ignoreClickRef.current = true;
      setDraggingId(appId);
    }, 360);
  };

  const moveTouch = (event) => {
    const touch = event.touches[0];
    const start = touchStartRef.current;
    if (!start) return;
    if (!draggingId && Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > 8) {
      clearPressTimer();
      return;
    }
    if (!draggingId) return;
    event.preventDefault();
    const row = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('[data-app-id]');
    if (row?.dataset.appId) {
      touchTargetRef.current = row.dataset.appId;
      setDropTargetId(row.dataset.appId);
    }
  };

  const endTouch = () => {
    clearPressTimer();
    if (draggingId && touchTargetRef.current) moveToTarget(draggingId, touchTargetRef.current);
    if (draggingId) window.setTimeout(() => { ignoreClickRef.current = false; }, 0);
    setDraggingId(null);
    setDropTargetId(null);
    touchStartRef.current = null;
    touchTargetRef.current = null;
  };

  const openApplication = (app) => {
    if (ignoreClickRef.current || draggingId || !app.target) return;
    onNavigate?.({ target: app.target, app });
  };

  const renderApplication = (app) => (
    <li
      key={app.id}
      data-app-id={app.id}
      draggable
      onDragStart={() => setDraggingId(app.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => {
        moveToTarget(draggingId, app.id);
        setDraggingId(null);
        setDropTargetId(null);
      }}
      onDragEnd={() => {
        setDraggingId(null);
        setDropTargetId(null);
      }}
      onTouchStart={(event) => beginTouch(event, app.id)}
      onTouchMove={moveTouch}
      onTouchEnd={endTouch}
      onTouchCancel={endTouch}
      className={`border-t border-[#f0f1f3] transition ${draggingId === app.id ? 'scale-[0.985] bg-[#f8f9fb] opacity-70' : ''} ${dropTargetId === app.id && draggingId !== app.id ? 'border-t-2 border-t-[#e60012]' : ''}`}
    >
      <button type="button" onClick={() => openApplication(app)} className="flex min-h-[64px] w-full items-center gap-3.5 px-5 text-left active:bg-[#fafafa]">
        <AppIcon app={app} />
        <span className="min-w-0 flex-1 truncate text-[16px] font-medium text-[#242933]">{app.name}</span>
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-[#c5c8d0] cursor-grab active:cursor-grabbing" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </div>
      </button>
    </li>
  );

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f5f6fa] text-[#242933]">
      <header className="flex h-[56px] flex-shrink-0 items-center px-4 bg-white border-b border-[#f0f1f3]">
        <button type="button" onClick={onBack} className="flex h-10 w-10 items-center justify-center text-[#252a33]" aria-label="返回">
          <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <h1 className="ml-1 text-[20px] font-semibold tracking-[0.02em]">全部应用</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-6 pt-3">
        <section className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_18px_rgba(30,38,52,0.04)]">
          <div className="px-5 pb-3 pt-5">
            <h2 className="text-[17px] font-semibold text-[#1f242f]">全部应用</h2>
          </div>
          <ul>
            {applications.map((app) => renderApplication(app))}
          </ul>
        </section>
      </main>
      {hasPendingChanges && (
        <div className="flex flex-shrink-0 items-center gap-3 border-t border-[#e8eaee] bg-white px-4 py-3">
          <button type="button" onClick={cancelOrderChange} className="h-9 flex-1 rounded-lg border border-[#dfe2e7] text-[13px] text-[#596271]">取消</button>
          <button type="button" onClick={saveOrderChange} className="h-9 flex-1 rounded-lg bg-[#e60012] text-[13px] font-medium text-white">保存</button>
        </div>
      )}
    </div>
  );
};

export default AllApplications;

import React from 'react';
import { GUEST_DEMO_DEVICES } from '../../data/guestDemoData';

const statusText = { pending: '待处理', processing: '处理中', completed: '已完成' };

const TaskDetail = ({ task, onBack, onRequireLogin, demoMode = false }) => {
  const devices = demoMode
    ? GUEST_DEMO_DEVICES.filter((device) => task.deviceCodes?.includes(device.code))
    : (task.deviceCodes
        ? GUEST_DEMO_DEVICES.filter((device) => task.deviceCodes.includes(device.code))
        : (task.primaryDeviceName ? [{
            code: task.primaryDeviceName,
            displayName: task.primaryDeviceName,
            statusText: '正常',
            image: 'images/机手社区/挖掘机/挖掘机_02.jpg',
          }] : []));

  return (
    <div dir="auto" className="relative flex h-full w-full flex-col bg-[#f4f5f7]">
      <header className="flex items-center border-b border-gray-100 bg-white px-4 py-3">
        <button type="button" onClick={onBack} aria-label="返回任务列表" className="flex h-8 w-8 items-center justify-center text-gray-600"><span className="text-xl">‹</span></button>
        <h1 className="flex-1 text-center text-[16px] font-semibold text-gray-900">任务详情</h1>
        <span className="w-8" />
      </header>
      <main className="flex-1 space-y-3 overflow-y-auto p-4 pb-4">
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3"><h2 className="min-w-0 break-words text-[17px] font-semibold leading-6 text-gray-900">{task.title}</h2><span className="flex-none rounded-full bg-orange-50 px-2 py-1 text-[11px] text-orange-600">{statusText[task.status] || task.status}</span></div>
          {task.description && <p className="mt-3 break-words text-[13px] leading-6 text-gray-600">{task.description}</p>}
        </section>
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="text-[14px] font-semibold text-gray-900">任务信息</h3>
          <dl className="mt-3 grid grid-cols-[88px_1fr] gap-y-3 text-[12px] leading-5">
            <dt className="text-gray-400">任务类型</dt><dd>{task.taskType}</dd>
            <dt className="text-gray-400">计划时间</dt><dd>{task.plannedStartTime} 至 {task.deadline}</dd>
            <dt className="text-gray-400">创建人</dt><dd>{task.creator}</dd>
            <dt className="text-gray-400">优先级</dt><dd>{task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}</dd>
          </dl>
        </section>
        {devices.length > 0 && (
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h3 className="text-[14px] font-semibold text-gray-900">关联设备</h3>
            <div className="mt-3 space-y-3">
              {devices.map((device) => (
                <div key={device.code} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <img src={device.image} alt={device.displayName} className="h-11 w-14 rounded-md object-cover" />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-gray-900">{device.displayName}</div>
                    <div className="mt-1 text-[11px] text-gray-500">{device.code} · {device.statusText}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <div className="flex-shrink-0 border-t border-gray-100 bg-white p-4">
        {demoMode ? (
          <button type="button" onClick={onRequireLogin} className="h-11 w-full rounded-lg bg-brand-red text-[14px] font-medium text-white">
            登录后处理任务
          </button>
        ) : (
          <button type="button" onClick={onBack} className="h-11 w-full rounded-lg bg-gray-100 text-[14px] font-medium text-gray-700 hover:bg-gray-200">
            返回任务列表
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;

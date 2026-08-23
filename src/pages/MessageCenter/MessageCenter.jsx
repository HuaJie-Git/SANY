import React, { useEffect, useMemo, useState } from 'react';
import {
  MESSAGE_ITEMS,
  MESSAGE_READ_STORAGE_KEY,
  MESSAGE_SETTINGS_STORAGE_KEY,
  readStoredMessageIds,
  readStoredMessageSettings,
} from '../../data/messages';

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-[#e60012]' : 'bg-gray-300'}`}
  >
    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

const MessageCenter = ({ onBack, onNavigate, onUnreadChange }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [readIds, setReadIds] = useState(readStoredMessageIds);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(readStoredMessageSettings);

  const tabs = [
    { id: 'all', name: '全部' },
    { id: 'alert', name: '设备告警' },
    { id: 'maintenance', name: '保养' },
    { id: 'service', name: '服务' },
  ];

  const unreadCount = MESSAGE_ITEMS.filter((message) => !readIds.includes(message.id)).length;
  const visibleMessages = useMemo(() => (
    activeCategory === 'all'
      ? MESSAGE_ITEMS
      : MESSAGE_ITEMS.filter((message) => message.category === activeCategory)
  ), [activeCategory]);

  useEffect(() => {
    window.localStorage.setItem(MESSAGE_READ_STORAGE_KEY, JSON.stringify(readIds));
    onUnreadChange?.(unreadCount);
  }, [onUnreadChange, readIds, unreadCount]);

  useEffect(() => {
    window.localStorage.setItem(MESSAGE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const markRead = (messageId) => {
    const nextReadIds = readIds.includes(messageId) ? readIds : [...readIds, messageId];
    setReadIds(nextReadIds);
    window.localStorage.setItem(MESSAGE_READ_STORAGE_KEY, JSON.stringify(nextReadIds));
    onUnreadChange?.(MESSAGE_ITEMS.length - nextReadIds.length);
  };

  const handleMessageClick = (message) => {
    markRead(message.id);
    onNavigate?.({ target: message.target, context: message.payload, message });
  };

  const markAllRead = () => {
    const nextReadIds = MESSAGE_ITEMS.map((message) => message.id);
    setReadIds(nextReadIds);
    window.localStorage.setItem(MESSAGE_READ_STORAGE_KEY, JSON.stringify(nextReadIds));
    onUnreadChange?.(0);
  };

  const categoryUnread = (category) => MESSAGE_ITEMS.filter((message) => (
    (category === 'all' || message.category === category) && !readIds.includes(message.id)
  )).length;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#f4f5f7] text-[#23272f]">
      <header className="flex h-[54px] flex-shrink-0 items-center border-b border-black/5 bg-white px-3">
        <button type="button" onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full active:bg-gray-100" aria-label="返回">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 text-center text-[17px] font-semibold">消息中心</div>
        <button type="button" onClick={() => setShowSettings(true)} className="flex h-10 min-w-10 items-center justify-center text-[13px] text-gray-600">设置</button>
      </header>

      <div className="flex-shrink-0 bg-white px-4 pb-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] text-gray-500">当前未读</div>
            <div className="mt-0.5 text-[26px] font-semibold leading-none tracking-[-0.04em]">{unreadCount}<span className="ml-1 text-[12px] font-normal text-gray-400">条</span></div>
          </div>
          <button type="button" onClick={markAllRead} disabled={!unreadCount} className="rounded-full border border-gray-200 px-3 py-1.5 text-[12px] text-gray-600 disabled:opacity-35">
            全部已读
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const count = categoryUnread(tab.id);
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] transition ${activeCategory === tab.id ? 'bg-[#20242b] text-white' : 'bg-[#f1f2f4] text-gray-600'}`}
              >
                {tab.name}
                {!!count && <span className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] ${activeCategory === tab.id ? 'bg-[#e60012] text-white' : 'bg-white text-[#d91528]'}`}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-2.5">
          {visibleMessages.map((message) => {
            const unread = !readIds.includes(message.id);
            return (
              <button
                type="button"
                key={message.id}
                onClick={() => handleMessageClick(message)}
                className="relative flex w-full items-start rounded-[16px] bg-white p-3.5 text-left shadow-[0_3px_14px_rgba(25,31,40,0.04)] active:scale-[0.99]"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[13px] text-[13px] font-bold text-white" style={{ backgroundColor: message.color }}>
                  {message.icon}
                </span>
                <span className="ml-3 min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className={`text-[14px] ${unread ? 'font-semibold text-[#20242b]' : 'font-medium text-gray-600'}`}>{message.title}</span>
                    <span className="flex-shrink-0 pt-0.5 text-[10px] text-gray-400">{message.time}</span>
                  </span>
                  <span className="mt-1 block text-[11px] leading-[18px] text-gray-500">{message.summary}</span>
                  <span className="mt-2 inline-flex items-center text-[11px] font-medium text-[#bd1523]">查看业务详情 <span className="ml-1">→</span></span>
                </span>
                {unread && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#e60012]" />}
              </button>
            );
          })}
        </div>

        <button type="button" onClick={() => onNavigate?.({ target: 'service' })} className="mt-4 flex w-full items-center justify-between rounded-[16px] bg-[#20242b] px-4 py-3.5 text-left text-white">
          <span>
            <span className="block text-[13px] font-semibold">没有找到解决办法？</span>
            <span className="mt-0.5 block text-[11px] text-white/60">联系服务中心获取支持</span>
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">→</span>
        </button>
      </main>

      {showSettings && (
        <div className="absolute inset-0 z-[80] flex items-end bg-black/45" onClick={() => setShowSettings(false)}>
          <section className="w-full rounded-t-[26px] bg-white px-5 pb-8 pt-3" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto h-1 w-10 rounded-full bg-gray-200" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-semibold">通知设置</h2>
                <p className="mt-0.5 text-[11px] text-gray-400">只保留对当前工作真正重要的提醒</p>
              </div>
              <button type="button" onClick={() => setShowSettings(false)} className="h-8 rounded-full bg-gray-100 px-3 text-[12px] text-gray-600">完成</button>
            </div>

            <div className="mt-5 divide-y divide-gray-100">
              {[
                ['alert', '设备告警', '故障、离线与位置异常'],
                ['maintenance', '保养提醒', '临期、逾期与完工通知'],
                ['service', '服务进度', '召请、工程师与配件状态'],
                ['quiet', '夜间免打扰', '22:00–07:00 仅推送严重告警'],
              ].map(([key, title, description]) => (
                <div key={key} className="flex items-center justify-between py-3.5">
                  <div>
                    <div className="text-[14px] font-medium">{title}</div>
                    <div className="mt-0.5 text-[11px] text-gray-400">{description}</div>
                  </div>
                  <Toggle checked={settings[key]} onChange={(value) => setSettings((current) => ({ ...current, [key]: value }))} />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default MessageCenter;

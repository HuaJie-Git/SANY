import React, { useEffect, useMemo, useState } from 'react';
import {
  MESSAGE_ITEMS,
  MESSAGE_READ_STORAGE_KEY,
  MESSAGE_SETTINGS_STORAGE_KEY,
  readStoredMessageIds,
  readStoredMessageSettings,
} from '../../data/messages';
import { EmptyBoxIllustration } from '../Audit/Audit';

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

const CustomerServiceView = ({ onBack, demoMode: _demoMode = true, onRequireLogin: _onRequireLogin }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'service',
      text: '您好！欢迎使用三一客户服务。如果您在设备使用或系统操作中遇到任何问题，请随时与我们联系，我们将竭诚为您服务。',
      time: '08:30',
    },
  ]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    const nowTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: nowTime,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // 模拟人工客服实时应答交互，无需强制登录
    window.setTimeout(() => {
      const replies = [
        '您好！三一专席客服已收到您的咨询，正在为您接入专业技术支持工程师，请稍候。',
        '您反馈的问题我们已重点登记。如需紧急设备技术支持，您也可拨打三一重工 400 服务热线。',
        '收到，我们将竭诚为您解答设备运行与维护相关问题！',
      ];
      const replyText = replies[Math.floor(Math.random() * replies.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'service',
          text: replyText,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[#f4f5f7] text-[#23272f]">
      {/* 顶部导航 */}
      <header className="flex h-[50px] flex-shrink-0 items-center border-b border-gray-100 bg-white px-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full active:bg-gray-100"
          aria-label="返回"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 text-center text-[16px] font-semibold text-gray-900 pr-10">人工客服</div>
      </header>

      {/* 聊天内容区 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center">
          <span className="rounded-full bg-black/5 px-2.5 py-1 text-[11px] text-gray-400">
            2026-09-23 08:30 (UTC+8)
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.sender === 'service' ? (
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0 text-[12px] font-bold">
                我
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-[#E60012] text-white rounded-tr-none'
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* 底部输入框 */}
      <div className="border-t border-gray-100 bg-white p-3 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          placeholder="请输入您的问题..."
          className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-[13px] text-gray-800 placeholder-gray-400 outline-none focus:ring-1 focus:ring-blue-400"
        />
        <button
          type="button"
          onClick={handleSend}
          className="rounded-full bg-[#E60012] px-4 py-2 text-[13px] font-medium text-white shadow-xs active:bg-[#CC0010]"
        >
          发送
        </button>
      </div>
    </div>
  );
};

const GuestMessageCenter = ({ onBack, onRequireLogin }) => {
  const [showService, setShowService] = useState(false);
  const [toastHint, setToastHint] = useState('');

  const showToast = (msg) => {
    setToastHint(msg);
    window.setTimeout(() => setToastHint(''), 1600);
  };

  if (showService) {
    return <CustomerServiceView onBack={() => setShowService(false)} demoMode={true} onRequireLogin={onRequireLogin} />;
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-[#F5F6F8] text-[#23272f]">
      {/* 顶部导航 - 对齐截图2 */}
      <header className="flex h-[50px] flex-shrink-0 items-center justify-between bg-white px-3 border-b border-gray-100">
        <div className="flex items-center">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full active:bg-gray-100 -ml-1"
            aria-label="返回"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[17px] font-bold text-gray-900 ml-0.5">消息中心</span>
        </div>
        <button
          type="button"
          onClick={() => showToast('已全部标记为已读')}
          className="text-[14px] text-gray-400 pr-2 active:text-gray-600"
        >
          全部已读
        </button>
      </header>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 space-y-4">
        {/* 人工客服卡片 - 对齐截图2 */}
        <div
          onClick={() => setShowService(true)}
          className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-2xs border border-gray-100/80 cursor-pointer active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#EEF4FE] flex items-center justify-center text-[#2F78EE] flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-bold text-gray-900 truncate">人工客服</div>
              <div className="text-[12px] text-gray-400 mt-1 truncate">如果您遇到了问题或困难，我们将竭...</div>
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* 空状态：没有数据 - 对齐截图2 */}
        <div className="flex flex-col items-center justify-center pt-24 pb-12">
          <EmptyBoxIllustration />
          <p className="text-[13px] text-gray-400 mt-2 font-normal">
            没有数据
          </p>
        </div>
      </div>

      {/* 提示气泡 */}
      {toastHint && (
        <div role="status" className="absolute bottom-16 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-[12px] text-white shadow-lg pointer-events-none">
          {toastHint}
        </div>
      )}
    </div>
  );
};

const BaselineMessageCenter = ({ onBack, onNavigate, onUnreadChange }) => {
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
    <div className="relative flex h-full w-full flex-col bg-[#f4f5f7] text-[#23272f]">
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
            const isEsc = message.payload?.escEvent;
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
                  <span className="mt-2 inline-flex items-center text-[11px] font-medium text-[#bd1523]">{isEsc ? '查看ESC事件与工况' : '查看设备工况'} <span className="ml-1">→</span></span>
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

const MessageCenter = (props) => {
  if (props.demoMode) {
    return <GuestMessageCenter {...props} />;
  }
  return <BaselineMessageCenter {...props} />;
};

export default MessageCenter;

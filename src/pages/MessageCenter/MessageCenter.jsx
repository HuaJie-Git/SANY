import React, { useEffect, useMemo, useState } from 'react';
import {
  MESSAGE_GROUPS,
  MESSAGE_ITEMS,
  MESSAGE_READ_STORAGE_KEY,
  MESSAGE_SETTINGS_STORAGE_KEY,
  getGroupLatestMessage,
  getGroupMessages,
  getGroupUnreadCount,
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
    className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-[#2F78EE]' : 'bg-gray-300'}`}
  >
    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

// 人工客服对话视图（明确标注本地原型演示，非真实接通）
const CustomerServiceView = ({ onBack }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'service',
      text: '【本地原型演示】您好！欢迎使用三一客户服务本地演示。本对话仅用于原型界面与交互体验，未接入真实人工客服座席。如需紧急设备技术支持，请拨打三一重工 400 服务热线。',
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

    window.setTimeout(() => {
      const replies = [
        '【原型模拟应答】三一专席客服已收到您的咨询演示，本地模拟应答中。',
        '【原型模拟应答】您反馈的问题已在本地原型登记，真实业务请拨打 400 客户服务热线。',
        '【原型模拟应答】本地模拟客服已收到，我们将竭诚为您展示交互流程！',
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
      <header className="flex h-[50px] flex-shrink-0 items-center border-b border-gray-100 bg-white px-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full active:bg-gray-100"
          aria-label="返回"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 text-center pr-10">
          <div className="text-[16px] font-semibold text-gray-900 leading-tight">人工客服</div>
          <div className="text-[10px] text-gray-400">（本地原型演示 · 未连接真实座席）</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center">
          <span className="rounded-full bg-black/5 px-2.5 py-1 text-[11px] text-gray-400">
            2026-11-12 08:30 (UTC+8)
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.sender === 'service' ? (
              <div className="w-9 h-9 rounded-full bg-[#EEF4FE] flex items-center justify-center text-[#2F78EE] flex-shrink-0">
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
                  ? 'bg-[#2F78EE] text-white rounded-tr-none'
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

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
          className="rounded-full bg-[#009EF0] px-4 py-2 text-[13px] font-medium text-white shadow-xs active:bg-[#008bd4]"
        >
          发送
        </button>
      </div>
    </div>
  );
};

// 游客模式消息中心（严格保留既有登录提示边界）
const GuestMessageCenter = ({ onBack, onRequireLogin }) => {
  const [toastHint, setToastHint] = useState('');

  const showToast = (msg) => {
    setToastHint(msg);
    window.setTimeout(() => setToastHint(''), 1600);
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[#F5F6F8] text-[#23272f]">
      {/* 顶部导航 - 对齐IMG-002 */}
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
        {/* 人工客服独立卡片 - 游客点击按原逻辑先走登录边界 */}
        <button
          type="button"
          onClick={() => onRequireLogin?.()}
          className="w-full bg-white rounded-2xl p-4 flex items-center justify-between text-left shadow-2xs border border-gray-100/80 cursor-pointer active:bg-gray-50 transition-colors"
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
              <div className="text-[12px] text-gray-400 mt-1 truncate">如果您遇到了问题或困难，我们将竭…</div>
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* 提示登录查看消息 */}
        <div className="flex flex-col items-center justify-center pt-20 pb-12">
          <EmptyBoxIllustration />
          <p className="text-[13px] text-gray-400 mt-2 font-normal">
            登录后查看系统及优惠券消息
          </p>
          <button
            type="button"
            onClick={onRequireLogin}
            className="mt-4 px-6 py-2 rounded-full bg-[#009EF0] text-white text-[13px] font-medium active:bg-[#008bd4] shadow-2xs"
          >
            立即登录
          </button>
        </div>
      </div>

      {toastHint && (
        <div role="status" className="absolute bottom-16 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-[12px] text-white shadow-lg pointer-events-none">
          {toastHint}
        </div>
      )}
    </div>
  );
};

// 记录跨页面跳转返回时的目标分类
let lastActiveMessageGroup = null;

// 图标渲染辅助
const renderGroupIcon = (groupId) => {
  if (groupId === 'service_system') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );
  }
  if (groupId === 'maintenance') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    );
  }
  if (groupId === 'coupon') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
        <path d="M13 5v2m0 4v2m0 4v2" />
      </svg>
    );
  }
  return null;
};

const AggregatedMessageCenter = ({ onBack, onNavigate, onUnreadChange }) => {
  const [viewMode, setViewMode] = useState(() => (lastActiveMessageGroup ? 'category' : 'aggregation'));
  const [selectedGroupId, setSelectedGroupId] = useState(() => lastActiveMessageGroup);
  const [realReadIds, setRealReadIds] = useState(readStoredMessageIds);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(readStoredMessageSettings);
  const [toastHint, setToastHint] = useState('');

  const showToast = (msg) => {
    setToastHint(msg);
    window.setTimeout(() => setToastHint(''), 1600);
  };

  const effectiveMessages = MESSAGE_ITEMS;

  // 真实全局未读数量（首页角标始终与真实未读保持一致）
  const realUnreadCount = useMemo(() => (
    MESSAGE_ITEMS.filter((message) => !realReadIds.includes(message.id)).length
  ), [realReadIds]);

  // 当前视图对应的未读总数（仅用于本页头部按钮与角标呈现）
  const currentViewUnreadCount = realUnreadCount;

  useEffect(() => {
    window.localStorage.setItem(MESSAGE_READ_STORAGE_KEY, JSON.stringify(realReadIds));
    onUnreadChange?.(realUnreadCount);
  }, [onUnreadChange, realReadIds, realUnreadCount]);

  useEffect(() => {
    window.localStorage.setItem(MESSAGE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // 单条消息标记已读（跳转前同步落存储与上报，防止组件即刻卸载导致丢失）
  const markRead = (messageId) => {
    if (!realReadIds.includes(messageId)) {
      const nextReadIds = [...realReadIds, messageId];
      window.localStorage.setItem(MESSAGE_READ_STORAGE_KEY, JSON.stringify(nextReadIds));
      const nextRealUnread = MESSAGE_ITEMS.filter((m) => !nextReadIds.includes(m.id)).length;
      onUnreadChange?.(nextRealUnread);
      setRealReadIds(nextReadIds);
    }
  };

  // 聚合首页全部标记已读
  const markAllRead = () => {
    if (currentViewUnreadCount === 0) {
      showToast('暂无未读消息');
      return;
    }
    const nextReadIds = Array.from(new Set([...realReadIds, ...MESSAGE_ITEMS.map((m) => m.id)]));
    setRealReadIds(nextReadIds);
    showToast('已全部标记为已读');
  };

  // 分类列表页标记本类已读
  const markCategoryAllRead = (groupId) => {
    const groupMsgs = getGroupMessages(groupId, effectiveMessages);
    const unreadGroupMsgs = groupMsgs.filter((m) => !realReadIds.includes(m.id));
    if (unreadGroupMsgs.length === 0) {
      showToast('本类暂无未读消息');
      return;
    }
    const nextReadIds = Array.from(new Set([...realReadIds, ...unreadGroupMsgs.map((m) => m.id)]));
    setRealReadIds(nextReadIds);
    showToast('本类已全部标记为已读');
  };

  // 点击单条消息跳转目标详情
  const handleMessageClick = (message) => {
    markRead(message.id);
    lastActiveMessageGroup = selectedGroupId;
    onNavigate?.({ target: message.target, context: message.payload, message });
  };

  // 人工客服独立视图处理
  if (viewMode === 'service') {
    return <CustomerServiceView onBack={() => setViewMode('aggregation')} />;
  }

  const currentGroup = MESSAGE_GROUPS.find((g) => g.id === selectedGroupId);
  const currentGroupMessages = selectedGroupId ? getGroupMessages(selectedGroupId, effectiveMessages) : [];
  const currentGroupUnread = selectedGroupId ? getGroupUnreadCount(selectedGroupId, realReadIds, effectiveMessages) : 0;

  return (
    <div
      className="relative flex h-full w-full flex-col bg-[#F5F6F8] text-[#23272f]"
    >
      {/* 顶部导航 */}
      <header className="flex h-[50px] flex-shrink-0 items-center justify-between bg-white px-3 border-b border-gray-100">
        <div className="flex items-center min-w-0">
          <button
            type="button"
            onClick={() => {
              if (viewMode === 'category') {
                setSelectedGroupId(null);
                lastActiveMessageGroup = null;
                setViewMode('aggregation');
              } else {
                lastActiveMessageGroup = null;
                onBack();
              }
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full active:bg-gray-100 -ml-1"
            aria-label="返回"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[17px] font-bold text-gray-900 ml-0.5 truncate">
            {viewMode === 'category' ? (currentGroup?.title || '消息列表') : '消息中心'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'aggregation' ? (
            <button
              type="button"
              onClick={markAllRead}
              className={`text-[14px] font-medium pr-2 transition-colors ${
                currentViewUnreadCount > 0 ? 'text-[#00A9E8] active:text-[#008bd4]' : 'text-gray-400 opacity-60 cursor-default'
              }`}
            >
              全部已读
            </button>
          ) : (
            <button
              type="button"
              onClick={() => markCategoryAllRead(selectedGroupId)}
              className={`text-[14px] font-medium pr-2 transition-colors ${
                currentGroupUnread > 0 ? 'text-[#00A9E8] active:text-[#008bd4]' : 'text-gray-400 opacity-60 cursor-default'
              }`}
            >
              本类已读
            </button>
          )}
        </div>
      </header>

      {/* 消息内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-8 space-y-3">
          {viewMode === 'aggregation' ? (
            /* 聚合首页 (对齐IMG-002) */
            <>
              {/* 人工客服独立白卡 */}
              <button
                type="button"
                onClick={() => setViewMode('service')}
                className="w-full bg-white rounded-2xl p-4 flex items-center justify-between text-left shadow-2xs border border-gray-100/80 cursor-pointer active:bg-gray-50 transition-colors"
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
                    <div className="text-[12px] text-gray-400 mt-1 truncate">
                      如果您遇到了问题或困难，我们将竭…
                    </div>
                  </div>
                </div>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-300 flex-shrink-0"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* 消息聚合组白色卡片 */}
              <div className="bg-white rounded-2xl shadow-2xs border border-gray-100/80 overflow-hidden divide-y divide-gray-100">
                {MESSAGE_GROUPS.map((group) => {
                  const unread = getGroupUnreadCount(group.id, realReadIds, effectiveMessages);
                  const latestMsg = getGroupLatestMessage(group.id, effectiveMessages);
                  const summaryText = latestMsg ? (latestMsg.title || latestMsg.summary) : group.emptySummary;
                  const timeText = latestMsg ? latestMsg.time : '';

                  return (
                    <button
                      type="button"
                      key={group.id}
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        lastActiveMessageGroup = group.id;
                        setViewMode('category');
                      }}
                      className="w-full p-4 flex items-center justify-between text-left active:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-xl bg-[#EEF4FE] flex items-center justify-center text-[#2F78EE] flex-shrink-0">
                          {renderGroupIcon(group.id)}
                        </div>
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-[15px] font-bold text-gray-900 truncate">
                              {group.title}
                            </div>
                            {timeText && (
                              <div className="text-[12px] text-gray-400 flex-shrink-0">
                                {timeText}
                              </div>
                            )}
                          </div>
                          <div className="text-[12px] text-gray-400 mt-1 truncate">
                            {summaryText}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-1">
                        {unread > 0 && (
                          <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#2F78EE] text-white text-[11px] font-medium flex items-center justify-center leading-none">
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-gray-300 flex-shrink-0"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 底部通知设置入口 */}
              <div className="pt-3 pb-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors py-1 px-3 rounded-full"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>通知设置</span>
                </button>
              </div>
            </>
          ) : (
            /* 具体分类列表页 (保持本组消息与原详情跳转) */
            <div className="space-y-2.5">
              {currentGroupMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-20 pb-12">
                  <EmptyBoxIllustration />
                  <p className="text-[13px] text-gray-400 mt-2 font-normal">
                    {currentGroup?.emptySummary || '暂无消息'}
                  </p>
                </div>
              ) : (
                currentGroupMessages.map((message) => {
                  const unread = !realReadIds.includes(message.id);
                  const isEsc = message.payload?.escEvent;
                  const isCoupon = message.category === 'coupon';

                  return (
                    <button
                      type="button"
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className="relative flex w-full items-start rounded-[16px] bg-white p-3.5 text-left shadow-[0_2px_10px_rgba(25,31,40,0.03)] border border-gray-100/70 active:scale-[0.99] transition-transform"
                    >
                      <span
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[13px] text-[13px] font-bold text-white shadow-2xs"
                        style={{ backgroundColor: message.color }}
                      >
                        {message.icon}
                      </span>
                      <span className="ml-3 min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className={`text-[14px] ${unread ? 'font-bold text-[#20242b]' : 'font-medium text-gray-600'}`}>
                            {message.title}
                          </span>
                          <span className="flex-shrink-0 pt-0.5 text-[10px] text-gray-400">
                            {message.time}
                          </span>
                        </span>
                        <span className="mt-1 block text-[11px] leading-[18px] text-gray-500 break-words">
                          {message.summary}
                        </span>
                        <span className={`mt-2 inline-flex items-center text-[11px] font-medium ${isCoupon ? 'text-[#089ded]' : 'text-[#bd1523]'}`}>
                          {isCoupon ? '查看优惠券详情' : (isEsc ? '查看ESC事件与工况' : (message.target === 'parts' ? '查看配件订单' : (message.target === 'maintenance' ? '查看保养详情' : '查看设备工况')))}
                          <span className="ml-1">→</span>
                        </span>
                      </span>
                      {unread && (
                        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#e60012]" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

      {/* 提示气泡 */}
      {toastHint && (
        <div role="status" className="absolute bottom-16 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-[12px] text-white shadow-lg pointer-events-none">
          {toastHint}
        </div>
      )}

      {/* 通知设置弹层 */}
      {showSettings && (
        <div className="absolute inset-0 z-[80] flex items-end bg-black/45" onClick={() => setShowSettings(false)}>
          <section className="w-full rounded-t-[26px] bg-white px-5 pb-8 pt-3 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto h-1 w-10 rounded-full bg-gray-200" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-bold text-gray-900">通知设置</h2>
                <p className="mt-0.5 text-[11px] text-gray-400">只保留对当前工作真正重要的提醒</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="h-8 rounded-full bg-gray-100 px-3 text-[12px] font-medium text-gray-600 active:bg-gray-200"
              >
                完成
              </button>
            </div>

            <div className="mt-5 divide-y divide-gray-100">
              {[
                ['alert', '设备告警', '故障、离线与位置异常'],
                ['maintenance', '保养提醒', '临期、逾期与完工通知'],
                ['service', '服务进度', '召请、工程师与配件状态'],
                ['coupon', '优惠券提醒', '到账、即将到期与注销通知'],
                ['quiet', '夜间免打扰', '22:00–07:00 仅推送严重告警'],
              ].map(([key, title, description]) => (
                <div key={key} className="flex items-center justify-between py-3.5">
                  <div>
                    <div className="text-[14px] font-medium text-gray-800">{title}</div>
                    <div className="mt-0.5 text-[11px] text-gray-400">{description}</div>
                  </div>
                  <Toggle
                    checked={settings[key]}
                    onChange={(value) => setSettings((current) => ({ ...current, [key]: value }))}
                  />
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
  return <AggregatedMessageCenter {...props} />;
};

export default MessageCenter;

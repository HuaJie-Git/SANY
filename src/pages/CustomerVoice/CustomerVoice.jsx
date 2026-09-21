import React, { useState } from 'react';

// 反馈类型选项 (图 3)
const FEEDBACK_TYPES = ['咨询', '建议', '投诉', 'APP功能', '其他'];

// 主题选项 (图 3)
const TOPIC_TYPES = ['配件', '服务', '产品', '营销', '其他'];

// 可关联的三一设备列表
const RELATED_DEVICES = [
  { code: 'SYM5180THBES 30C-8', name: '车载混凝土泵' },
  { code: 'SYG5210THB 30V8(SZ-AUS)', name: '混凝土泵车 (澳洲版)' },
  { code: 'SY215C-9', name: '三一中型履带挖掘机' },
  { code: 'STC250C5', name: '三一汽车起重机' },
  { code: '暂不关联设备', name: '' },
];

const COUNTRY_CODES = [
  { code: '+86', name: '中国' },
  { code: '+1', name: '美国/加拿大' },
  { code: '+49', name: '德国' },
  { code: '+971', name: '阿联酋' },
  { code: '+61', name: '澳大利亚' },
  { code: '+84', name: '越南' },
];

const CustomerVoice = ({ onBack }) => {
  // 表单核心状态
  const [feedbackType, setFeedbackType] = useState('咨询');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [topic, setTopic] = useState('配件');
  const [selectedDevice, setSelectedDevice] = useState('');

  // 未登录/游客状态下：手机号码、联系人、地址均不自动获取，初始全为空，需用户手动填写
  const [phoneCode, setPhoneCode] = useState('+86');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [address, setAddress] = useState('');

  // 弹层与抽屉状态
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showPhoneCodeModal, setShowPhoneCodeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCustomerServiceModal, setShowCustomerServiceModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 错误提示与 Toast
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // 历史反馈记录（严格对齐设计原图 1）
  const [historyList, setHistoryList] = useState([
    {
      id: '880944898564767744',
      title: '测试',
      content: '测试',
      type: 'app功能',
      status: '已提交',
      time: '08/27/2026 22:40:31',
    },
    {
      id: '731187124040421376',
      title: '发版测试',
      content: '发版测试',
      type: 'app功能',
      status: '已提交',
      time: '07/10/2025 16:36:35',
    },
    {
      id: '711263529646436352',
      title: '发版测试',
      content: '发版测试',
      type: 'app功能',
      status: '已提交',
      time: '05/16/2025 17:07:20',
    },
    {
      id: '704741885578940416',
      title: '发版测试',
      content: '发版测试',
      type: 'app功能',
      status: '已提交',
      time: '04/28/2025 17:12:39',
    },
    {
      id: '694598614806462464',
      title: '发版测试',
      content: '发版测试',
      type: 'app功能',
      status: '已提交',
      time: '03/15/2025 10:20:15',
    },
  ]);

  // 在线客服聊天记录（严格对齐设计原图 2）
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'SANY',
      time: '01:59:09',
      text: '您好，有什么可以帮您？',
      isCustomer: false,
    },
    {
      id: 2,
      sender: 'Sherry_Luo',
      time: '01:59:09',
      text: 'Hello, this is Sany Customer Care Team! What can I do for you?',
      isCustomer: false,
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendChatMessage = (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const userMsg = {
      id: Date.now(),
      sender: '您',
      time: timeStr,
      text: chatInput.trim(),
      isCustomer: true,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    const question = chatInput.trim();
    setChatInput('');
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'Sherry_Luo',
          time: timeStr,
          text: `感谢您的咨询！针对您的问题“${question.slice(0, 15)}”，三一客服团队已为您登记，专员将在 5 分钟内与您联系。`,
          isCustomer: false,
        },
      ]);
    }, 1000);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2000);
  };

  // 模拟添加图片 (上限 9 张)
  const handleAddImage = () => {
    if (images.length >= 9) {
      showToast('最多上传 9 张图片');
      return;
    }
    const demoImages = [
      'images/机手社区/泵车/泵车_01.png',
      'images/机手社区/泵车/泵车_02.png',
      'images/机手社区/搅拌车/搅拌车_01.jpg',
      'images/机手社区/挖掘机/挖掘机_01.jpg',
    ];
    const newImg = demoImages[images.length % demoImages.length];
    setImages((prev) => [...prev, newImg]);
    showToast(`已添加第 ${images.length + 1} 张图片凭证`);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // 提交反馈
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMessage('请填写反馈内容（不少于 5 字）');
      return;
    }
    if (content.trim().length < 5) {
      setErrorMessage('反馈内容过短，请尽可能详细描述问题');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('未登录状态下，请手动填写您的联系电话以便客服跟进');
      return;
    }

    setErrorMessage('');
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const formattedTime = `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const generatedId = `880944${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const newTicket = {
      id: generatedId,
      title: content.trim().slice(0, 20),
      content: content.trim(),
      type: feedbackType === 'APP功能' ? 'app功能' : feedbackType,
      topic,
      status: '已提交',
      time: formattedTime,
      contact: `${phoneCode} ${phoneNumber}`,
      address: address || '未填写',
      device: selectedDevice || '无关联设备',
    };
    setHistoryList((prev) => [newTicket, ...prev]);
    setShowSuccessModal(true);
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-white text-gray-900 overflow-hidden" dir="auto">
      {/* 顶部标题栏 (图 3) */}
      <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-800 active:bg-gray-100"
          aria-label="返回"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-[17px] font-bold text-gray-900">客户心声</h1>
        <div className="flex items-center space-x-2">
          {/* 客服耳机图标 */}
          <button
            type="button"
            onClick={() => setShowCustomerServiceModal(true)}
            className="flex h-8 w-8 items-center justify-center text-gray-700 active:bg-gray-100 rounded-full"
            aria-label="在线客服"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </button>
          {/* 历史胶囊按钮 */}
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="rounded-full border border-gray-300 px-2.5 py-0.5 text-[13px] font-medium text-gray-700 active:bg-gray-50"
          >
            历史
          </button>
        </div>
      </header>

      {/* 表单内容区 (图 3 完整还原) */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 pb-6 pt-4 space-y-4">
        {/* 1. *反馈类型 */}
        <div>
          <label className="flex items-center text-[14px] font-bold text-gray-900">
            <span className="text-red-500 mr-1">*</span>反馈类型
          </label>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {FEEDBACK_TYPES.map((t) => {
              const isSelected = feedbackType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFeedbackType(t)}
                  className={`rounded-full px-4 py-1.5 text-[14px] font-medium transition ${
                    isSelected
                      ? 'bg-[#18181B] text-white shadow-sm'
                      : 'bg-[#F3F4F6] text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. *内容 */}
        <div>
          <label className="flex items-center text-[14px] font-bold text-gray-900">
            <span className="text-red-500 mr-1">*</span>内容
          </label>
          <div className="mt-2.5 relative rounded-2xl bg-[#F3F4F6] p-3.5">
            <textarea
              rows={5}
              maxLength={500}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请描述您的问题。"
              className="w-full resize-none bg-transparent text-[15px] text-gray-900 placeholder-gray-400 outline-none"
            />
            <div className="text-right text-[12px] text-gray-400">
              {content.length}/500
            </div>
          </div>
        </div>

        {/* 3. 图片(0/9) */}
        <div>
          <label className="text-[14px] font-medium text-gray-600">
            图片({images.length}/9)
          </label>
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {/* 已上传图片缩略图 */}
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative flex h-20 w-20 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden"
              >
                <img src={img} alt={`凭证${idx}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white text-[11px]"
                  aria-label="删除图片"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* 上传加号框 (图 3 方框 + 号) */}
            {images.length < 9 && (
              <button
                type="button"
                onClick={handleAddImage}
                className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white active:bg-gray-50 text-gray-400 hover:text-gray-600 transition"
                aria-label="上传图片"
              >
                <span className="text-3xl font-light leading-none">+</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. *主题 */}
        <div>
          <label className="flex items-center text-[14px] font-bold text-gray-900">
            <span className="text-red-500 mr-1">*</span>主题
          </label>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {TOPIC_TYPES.map((tp) => {
              const isSelected = topic === tp;
              return (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setTopic(tp)}
                  className={`rounded-full px-4 py-1.5 text-[14px] font-medium transition ${
                    isSelected
                      ? 'bg-[#18181B] text-white shadow-sm'
                      : 'bg-[#F3F4F6] text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tp}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. 相关设备 */}
        <div>
          <label className="text-[14px] font-bold text-gray-900">相关设备</label>
          <div
            onClick={() => setShowDeviceModal(true)}
            className="mt-2 flex h-12 items-center justify-between rounded-xl bg-[#F3F4F6] px-4 cursor-pointer active:bg-gray-200 transition"
          >
            <span className={`text-[15px] ${selectedDevice ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>
              {selectedDevice || '选择设备'}
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        </div>

        {/* 6. 未登录游客联系信息 (电话与地址均不默认获取，需用户手动填写) */}
        <div className="rounded-2xl border border-gray-100 bg-[#FAFAFA] p-3.5 space-y-3">
          <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
            未登录联系信息（由您手动填写，仅用于客服答复）
          </div>

          {/* 联系电话 */}
          <div>
            <div className="flex items-center text-[13px] text-gray-700 font-medium mb-1.5">
              <span className="text-red-500 mr-1">*</span>联系电话
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowPhoneCodeModal(true)}
                className="flex h-11 items-center justify-center rounded-lg bg-white border border-gray-200 px-3 text-[14px] font-semibold text-gray-800"
              >
                <span>{phoneCode}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-1 text-gray-400">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              <div className="relative flex-1">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="请输入手机号码"
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400"
                />
                {phoneNumber && (
                  <button
                    type="button"
                    onClick={() => setPhoneNumber('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-300 text-[10px] text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 联系人姓名 */}
          <div>
            <div className="text-[13px] text-gray-700 font-medium mb-1.5">联系人姓名</div>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="请输入您的姓名（选填）"
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400"
            />
          </div>

          {/* 所在地区 / 地址 */}
          <div>
            <div className="text-[13px] text-gray-700 font-medium mb-1.5">联系地址 / 所在地区</div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="请输入您所在的省市区或具体地址（选填）"
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-red-50 p-3 text-[13px] text-red-600">
            {errorMessage}
          </div>
        )}
      </form>

      {/* 底部吸底提交按钮 (吸附在手机容器底部) */}
      <footer className="flex-shrink-0 border-t border-gray-100 bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          onClick={handleSubmit}
          className="h-12 w-full rounded-xl bg-[#E01923] text-[16px] font-bold text-white shadow-md active:bg-[#c4151e] transition"
        >
          提交
        </button>
      </footer>

      {/* 设备选择弹层 */}
      {showDeviceModal && (
        <div className="absolute inset-0 z-50 flex items-end bg-black/50" onClick={() => setShowDeviceModal(false)}>
          <div className="w-full rounded-t-2xl bg-white p-4 max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-[16px] font-bold text-gray-900">选择关联设备</h3>
              <button type="button" onClick={() => setShowDeviceModal(false)} className="text-gray-400">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {RELATED_DEVICES.map((d) => (
                <button
                  key={d.code}
                  type="button"
                  onClick={() => {
                    setSelectedDevice(d.code === '暂不关联设备' ? '' : `${d.code} (${d.name})`);
                    setShowDeviceModal(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-gray-50 active:bg-gray-100"
                >
                  <div>
                    <div className="text-[15px] font-semibold text-gray-900">{d.code}</div>
                    {d.name && <div className="text-[12px] text-gray-500 mt-0.5">{d.name}</div>}
                  </div>
                  {selectedDevice.includes(d.code) && (
                    <span className="text-[#E01923] font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 电话区号弹层 */}
      {showPhoneCodeModal && (
        <div className="absolute inset-0 z-50 flex items-end bg-black/50" onClick={() => setShowPhoneCodeModal(false)}>
          <div className="w-full rounded-t-2xl bg-white p-4 max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-[16px] font-bold text-gray-900">选择国际区号</h3>
              <button type="button" onClick={() => setShowPhoneCodeModal(false)} className="text-gray-400">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {COUNTRY_CODES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setPhoneCode(c.code);
                    setShowPhoneCodeModal(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-gray-50 active:bg-gray-100"
                >
                  <span className="text-[15px] font-medium text-gray-900">{c.name}</span>
                  <span className="text-[14px] text-gray-500 font-semibold">{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 历史反馈记录（严格对齐设计原图 1） */}
      {showHistoryModal && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#F5F6F8]">
          <header className="flex h-12 flex-shrink-0 items-center border-b border-gray-100 bg-white px-4">
            <button
              type="button"
              onClick={() => setShowHistoryModal(false)}
              className="flex h-9 w-9 items-center justify-center -ml-2 rounded-full text-gray-800 active:bg-gray-100"
              aria-label="返回"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="text-[17px] font-bold text-gray-900 ml-1">反馈记录</h1>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {historyList.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-100/90 bg-white p-4 shadow-sm"
              >
                {/* 第一行：单号 + 状态徽标 */}
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-gray-400 font-mono tracking-tight">{item.id}</span>
                  <span className="rounded bg-[#EFF6FF] px-2.5 py-0.5 text-[12px] font-medium text-[#2563EB]">
                    {item.status}
                  </span>
                </div>

                {/* 第二行：标题内容 */}
                <div className="text-[16px] font-medium text-gray-900 my-2">
                  {item.title || item.content}
                </div>

                {/* 第三行：类型 + 时间戳 */}
                <div className="flex items-center justify-between text-[13px] text-gray-400">
                  <span>类型:{item.type}</span>
                  <span className="font-mono">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 在线客服（严格对齐设计原图 2） */}
      {showCustomerServiceModal && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#F4F6F8]">
          {/* 顶部标题栏 */}
          <header className="flex h-12 flex-shrink-0 items-center border-b border-gray-100 bg-white px-4">
            <button
              type="button"
              onClick={() => setShowCustomerServiceModal(false)}
              className="flex h-9 w-9 items-center justify-center -ml-2 rounded-full text-gray-800 active:bg-gray-100"
              aria-label="返回"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="text-[17px] font-bold text-gray-900 ml-1">【SANY】在线客服</h1>
          </header>

          {/* 客服信息栏（深蓝灰） */}
          <div className="flex h-12 flex-shrink-0 items-center justify-between bg-[#5B7B9E] px-4 text-white shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3D7B5] border border-white/40 overflow-hidden text-gray-800 font-bold text-xs shadow-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
                  <path d="M4 22a8 8 0 0 1 16 0H4z" />
                </svg>
              </div>
              <span className="text-[15px] font-medium tracking-wide">Sherry_Luo</span>
            </div>
            {/* 喇叭图标 */}
            <button
              type="button"
              onClick={() => showToast('已开启语音播报')}
              className="text-white/90 hover:text-white p-1"
              aria-label="语音播报"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            </button>
          </div>

          {/* 聊天记录列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-center py-1">
              <button
                type="button"
                onClick={() => showToast('已加载全部历史消息')}
                className="text-[12px] text-gray-400 hover:text-gray-500"
              >
                查看更多历史消息
              </button>
            </div>

            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isCustomer ? 'items-end' : 'items-start'}`}
              >
                <div className="mb-1 text-[11px] text-gray-400">
                  {msg.sender} &nbsp;{msg.time}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-[14px] leading-relaxed shadow-sm ${
                    msg.isCustomer
                      ? 'bg-[#E01923] text-white rounded-tr-none'
                      : 'bg-white text-gray-900 rounded-tl-none border border-gray-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* 底部吸底输入框 */}
          <div className="flex h-14 flex-shrink-0 items-center border-t border-gray-100 bg-white px-3 space-x-2">
            <form onSubmit={handleSendChatMessage} className="flex-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="很高兴为您服务，请描述您的问题"
                className="w-full rounded-full bg-[#F3F4F6] px-4 py-2 text-[14px] text-gray-900 placeholder-gray-400 outline-none"
              />
            </form>
            {/* 表情图标 */}
            <button
              type="button"
              onClick={() => setChatInput((prev) => prev + '😊')}
              className="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-700 active:scale-95"
              aria-label="表情"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>
            {/* 加号图标 */}
            <button
              type="button"
              onClick={() => showToast('支持发送设备照片与工况定位')}
              className="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-700 active:scale-95"
              aria-label="更多操作"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 提交成功弹窗 */}
      {showSuccessModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="mt-4 text-[18px] font-bold text-gray-900">反馈已提交</h3>
            <p className="mt-2 text-[14px] text-gray-600 leading-relaxed">
              我们已成功接收您的反馈！三一客户关怀团队将根据您留下的联系方式（{phoneCode} {phoneNumber}）在工作时间内进行核实与答复。
            </p>
            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setShowHistoryModal(true);
                }}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[14px] font-medium text-gray-700 active:bg-gray-50"
              >
                查看工单
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onBack();
                }}
                className="flex-1 rounded-xl bg-[#E01923] py-2.5 text-[14px] font-bold text-white active:bg-[#c4151e]"
              >
                返回
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 轻提示 Toast */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-900/90 px-4 py-2 text-[13px] text-white shadow-lg backdrop-blur-sm">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default CustomerVoice;

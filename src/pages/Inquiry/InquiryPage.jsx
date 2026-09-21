import React, { useState } from 'react';

const COUNTRY_OPTIONS = [
  { code: '+86', name: '中国', flag: '🇨🇳' },
  { code: '+1', name: '美国', flag: '🇺🇸' },
  { code: '+44', name: '英国', flag: '🇬🇧' },
  { code: '+49', name: '德国', flag: '🇩🇪' },
  { code: '+33', name: '法国', flag: '🇫🇷' },
  { code: '+971', name: '阿联酋', flag: '🇦🇪' },
  { code: '+61', name: '澳大利亚', flag: '🇦🇺' },
  { code: '+84', name: '越南', flag: '🇻🇳' },
  { code: '+66', name: '泰国', flag: '🇹🇭' },
  { code: '+7', name: '俄罗斯', flag: '🇷🇺' },
];

const InquiryPage = ({ onBack, context = {}, onSubmit }) => {
  const deviceCode = context?.model || context?.code || context?.deviceName || 'SYM5180THBES 30C-8';

  // 询价信息表单数据：未登录状态下，除设备外，联系人、手机号、邮箱、国家/地区、城市等均需用户手动填写
  const [inquiryForm, setInquiryForm] = useState({
    contactName: '',
    phoneCode: '+86',
    phoneNumber: '',
    email: '',
    country: '中国',
    city: '',
  });

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  const handleInquirySubmit = (e) => {
    if (e) e.preventDefault();
    if (!inquiryForm.contactName.trim()) {
      setInquiryError('请填写联系人姓名');
      return;
    }
    if (!inquiryForm.phoneNumber.trim()) {
      setInquiryError('请填写手机号码');
      return;
    }
    if (!inquiryForm.email.trim()) {
      setInquiryError('请填写电子邮箱');
      return;
    }
    setInquiryError('');
    setShowSuccessModal(true);
    onSubmit?.({
      ...context,
      ...inquiryForm,
      model: deviceCode,
    });
  };

  return (
    <div className="relative flex h-full flex-col bg-white text-gray-900">
      {/* 顶部标题栏：左返回、中标题、右主页图标（严格还原截图） */}
      <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-gray-100 px-4">
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
        <h1 className="text-[17px] font-bold text-gray-900">询价信息</h1>
        <div className="w-9" />
      </header>

      {/* 表单滚动主体（仅包含原截图中的 6 个字段，不加任何额外字段或提示语） */}
      <form onSubmit={handleInquirySubmit} className="flex-1 overflow-y-auto px-4 pb-6 pt-3 space-y-3">
        {/* 字段 1：设备信息展示 (未登录只能获取设备信息，不可编辑) */}
        <div className="rounded-xl bg-[#F3F4F6] p-3.5">
          <div className="text-[13px] text-gray-500">设备</div>
          <div className="mt-1 text-[16px] font-bold text-gray-700">{deviceCode}</div>
        </div>

        {/* 字段 2：联系人 */}
        <div className="rounded-xl bg-[#F3F4F6] p-3.5">
          <div className="flex items-center text-[13px] text-gray-600">
            <span className="mr-0.5 text-red-500">*</span>联系人
          </div>
          <div className="mt-1 flex items-center justify-between">
            <input
              type="text"
              value={inquiryForm.contactName}
              onChange={(e) => setInquiryForm({ ...inquiryForm, contactName: e.target.value })}
              placeholder="请输入联系人姓名"
              className="w-full bg-transparent text-[16px] font-medium text-gray-900 outline-none placeholder:text-gray-400"
            />
            {inquiryForm.contactName && (
              <button
                type="button"
                onClick={() => setInquiryForm({ ...inquiryForm, contactName: '' })}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-gray-600"
                aria-label="清空联系人"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 字段 3：手机号码 (左区号 + 右号码) */}
        <div className="flex space-x-2">
          {/* 区号选择器 */}
          <button
            type="button"
            onClick={() => setShowCountryPicker(true)}
            className="flex h-[72px] items-center justify-center rounded-xl bg-[#F3F4F6] px-4 text-[16px] font-bold text-gray-900"
          >
            <span>{inquiryForm.phoneCode}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-1 text-gray-500">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          {/* 号码输入框 */}
          <div className="flex-1 rounded-xl bg-[#F3F4F6] p-3.5">
            <div className="flex items-center text-[13px] text-gray-600">
              <span className="mr-0.5 text-red-500">*</span>手机号码
            </div>
            <div className="mt-1 flex items-center justify-between">
              <input
                type="tel"
                value={inquiryForm.phoneNumber}
                onChange={(e) => setInquiryForm({ ...inquiryForm, phoneNumber: e.target.value })}
                placeholder="请输入手机号码"
                className="w-full bg-transparent text-[16px] font-medium text-gray-900 outline-none placeholder:text-gray-400"
              />
              {inquiryForm.phoneNumber && (
                <button
                  type="button"
                  onClick={() => setInquiryForm({ ...inquiryForm, phoneNumber: '' })}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-gray-600"
                  aria-label="清空手机号码"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 字段 4：邮箱 */}
        <div className="rounded-xl bg-[#F3F4F6] p-3.5">
          <div className="flex items-center text-[13px] text-gray-600">
            <span className="mr-0.5 text-red-500">*</span>邮箱
          </div>
          <div className="mt-1 flex items-center justify-between">
            <input
              type="email"
              value={inquiryForm.email}
              onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
              placeholder="请输入邮箱"
              className="w-full bg-transparent text-[16px] font-medium text-gray-900 outline-none placeholder:text-gray-400"
            />
            {inquiryForm.email && (
              <button
                type="button"
                onClick={() => setInquiryForm({ ...inquiryForm, email: '' })}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-gray-600"
                aria-label="清空邮箱"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 字段 5：国家/地区 */}
        <div
          onClick={() => setShowCountryPicker(true)}
          className="flex items-center justify-between rounded-xl bg-[#F3F4F6] p-3.5 cursor-pointer active:bg-gray-200 transition"
        >
          <div>
            <div className="flex items-center text-[13px] text-gray-600">
              <span className="mr-0.5 text-red-500">*</span>国家/地区
            </div>
            <div className="mt-1 text-[16px] font-medium text-gray-900">{inquiryForm.country}</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>

        {/* 字段 6：城市/地区 */}
        <div className="rounded-xl bg-[#F3F4F6] p-3.5">
          <div className="flex items-center text-[13px] text-gray-600">
            <span className="mr-0.5 text-red-500">*</span>城市/地区
          </div>
          <div className="mt-1 flex items-center justify-between">
            <input
              type="text"
              value={inquiryForm.city}
              onChange={(e) => setInquiryForm({ ...inquiryForm, city: e.target.value })}
              placeholder="请输入城市/地区"
              className="w-full bg-transparent text-[16px] font-medium text-gray-900 placeholder:text-gray-400 outline-none"
            />
            {inquiryForm.city && (
              <button
                type="button"
                onClick={() => setInquiryForm({ ...inquiryForm, city: '' })}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-gray-600"
                aria-label="清空城市"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {inquiryError && (
          <div className="rounded-lg bg-red-50 p-2.5 text-[13px] text-red-600">
            {inquiryError}
          </div>
        )}
      </form>

      {/* 底部吸底提交按钮 (严格还原截图大红圆角按钮) */}
      <footer className="flex-shrink-0 border-t border-gray-100 bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          onClick={handleInquirySubmit}
          className="h-12 w-full rounded-xl bg-[#E01923] text-[16px] font-bold text-white shadow-md active:bg-[#c4151e] transition"
        >
          提交
        </button>
      </footer>

      {/* 国家/地区选择弹层 */}
      {showCountryPicker && (
        <div className="absolute inset-0 z-50 flex items-end bg-black/50" onClick={() => setShowCountryPicker(false)}>
          <div
            className="w-full rounded-t-2xl bg-white p-4 max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-[17px] font-bold text-gray-900">选择国家/地区与区号</h3>
              <button
                type="button"
                onClick={() => setShowCountryPicker(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {COUNTRY_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setInquiryForm({ ...inquiryForm, country: c.name, phoneCode: c.code });
                    setShowCountryPicker(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{c.flag}</span>
                    <span className="text-[15px] font-medium text-gray-900">{c.name}</span>
                  </div>
                  <span className="text-[14px] text-gray-500">{c.code}</span>
                </button>
              ))}
            </div>
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
            <h3 className="mt-4 text-[18px] font-bold text-gray-900">询价提交成功</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-gray-600">
              感谢您的垂询！已为您登记对设备 <span className="font-semibold text-gray-900">{deviceCode}</span> 的报价请求，专属客户经理将在 24 小时内与联系人 <span className="font-semibold text-gray-900">{inquiryForm.contactName}</span> ({inquiryForm.phoneCode} {inquiryForm.phoneNumber}) 取得联系。
            </p>
            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onBack?.();
                }}
                className="flex-1 rounded-xl bg-[#E01923] py-2.5 text-[15px] font-bold text-white active:bg-[#c4151e]"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryPage;

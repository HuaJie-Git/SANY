import React, { useState } from 'react';
import SearchPage from '../../components/SearchPage/SearchPage';

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

const resolveDeviceInfo = (item) => {
  if (!item) return null;
  const model = item.model || item.code || '';
  const name = item.name || item.typeName || '';
  let categoryName = item.categoryName;
  let typeName = item.typeName || name;

  if (!categoryName) {
    if (/泵|搅拌|布料/.test(name) || /SYM|THB|HGY/.test(model)) {
      categoryName = '混凝土机械';
      if (!typeName) typeName = '车载混凝土泵';
    } else if (/挖|钻|旋挖/.test(name) || /SY|SR/.test(model)) {
      categoryName = /钻/.test(name) || /SR/.test(model) ? '桩工机械' : '挖掘机械';
    } else if (/起重|吊/.test(name) || /AC|SAC|QY/.test(model)) {
      categoryName = '起重机械';
    } else if (/压路|摊铺|铣刨/.test(name) || /SSR|SMP/.test(model)) {
      categoryName = '路面机械';
    } else if (/滤芯|履带|齿/.test(name) || item.category === '配件') {
      categoryName = '配件中心';
    } else {
      categoryName = '工程机械';
    }
  }

  return {
    ...item,
    categoryName,
    typeName: typeName || '通用设备',
    model: model || item.name || '默认型号',
  };
};

const resolveIsGuest = (context) => {
  if (typeof context?.experienceMode === 'boolean') {
    return context.experienceMode;
  }
  if (typeof context?.demoMode === 'boolean') {
    return context.demoMode;
  }
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem('sanvist_experience_mode') === '1';
  } catch {
    return false;
  }
};

const getLoggedInUserProfile = (context) => {
  if (context?.user) {
    return {
      country: context.user.country || '中国',
      phoneCode: context.user.phoneCode || '+86',
      phoneNumber: context.user.phoneNumber || context.user.phone || '',
    };
  }
  try {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('sanvist_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            country: parsed.country || '中国',
            phoneCode: parsed.phoneCode || '+86',
            phoneNumber: parsed.phoneNumber || parsed.phone || '',
          };
        }
      }
    }
  } catch {
    // ignore
  }
  return {
    country: '中国',
    phoneCode: '+86',
    phoneNumber: '',
  };
};

const InquiryPage = ({ onBack, context = {}, onSubmit }) => {
  const initialDeviceModel = context?.model || context?.code || context?.deviceName || 'SYM5180THBES 30C-8';
  const initialDeviceName = context?.deviceName || (context?.model ? context.model : '车载混凝土泵');

  // 设备/产品/配件多选列表（默认回填初始设备，支持多选、回填与逐条删除）
  const [selectedDevices, setSelectedDevices] = useState(() => {
    if (context?.devices && Array.isArray(context.devices) && context.devices.length > 0) {
      return context.devices.map(resolveDeviceInfo).filter(Boolean);
    }
    if (initialDeviceModel) {
      return [resolveDeviceInfo({
        id: initialDeviceModel,
        name: initialDeviceName,
        model: initialDeviceModel,
        code: initialDeviceModel,
        categoryName: '混凝土机械',
        typeName: initialDeviceName || '车载混凝土泵',
      })];
    }
    return [];
  });

  const [isSelectingDevice, setIsSelectingDevice] = useState(false);

  const handleDeleteDevice = (key) => {
    setSelectedDevices((prev) => prev.filter((d) => (d.code || d.model || d.id || d.name) !== key));
  };

  // 询价信息表单数据：
  // 1) 已登录状态进入询价页时，自动回填当前登录账号资料中已有的“国家/地区”和“手机号码”；
  // 2) 游客态保持现有填写逻辑，国家/地区现有默认值规则不变（中国/+86，手机号为空）。
  const [inquiryForm, setInquiryForm] = useState(() => {
    const isGuest = resolveIsGuest(context);
    if (!isGuest) {
      const profile = getLoggedInUserProfile(context);
      return {
        contactName: context?.contactName || '',
        phoneCode: profile.phoneCode || '+86',
        phoneNumber: profile.phoneNumber || profile.phone || '',
        email: context?.email || '',
        country: profile.country || '中国',
        companyName: context?.companyName || '',
      };
    }
    return {
      contactName: context?.contactName || '',
      phoneCode: context?.phoneCode || '+86',
      phoneNumber: context?.phoneNumber || '',
      email: context?.email || '',
      country: context?.country || '中国',
      companyName: context?.companyName || '',
    };
  });

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  const handleInquirySubmit = (e) => {
    if (e) e.preventDefault();
    if (!selectedDevices || selectedDevices.length === 0) {
      setInquiryError('请至少选择一项设备');
      return;
    }
    if (!inquiryForm.contactName.trim()) {
      setInquiryError('请填写联系人姓名');
      return;
    }
    if (!inquiryForm.phoneNumber.trim()) {
      setInquiryError('请填写手机号码');
      return;
    }
    setInquiryError('');
    setShowSuccessModal(true);
    const modelSummary = selectedDevices.map((d) => d.name || d.model || d.code).join(', ') || initialDeviceModel;
    onSubmit?.({
      ...context,
      ...inquiryForm,
      devices: selectedDevices,
      model: modelSummary,
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

      {/* 表单滚动主体（包含设备选择与原截图中的输入字段） */}
      <form onSubmit={handleInquirySubmit} className="flex-1 overflow-y-auto px-4 pb-6 pt-3 space-y-3">
        {/* 字段 1：设备信息展示与选择 (支持进入搜索页多选、回填与单独删除) */}
        <div
          className="rounded-xl bg-[#F3F4F6] p-3.5 cursor-pointer active:bg-gray-200/60 transition"
          onClick={() => setIsSelectingDevice(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center text-[13px] text-gray-600">
              <span className="mr-0.5 text-red-500">*</span>设备
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSelectingDevice(true);
              }}
              className="text-[12px] text-[#E01923] font-medium flex items-center gap-0.5 active:opacity-75"
            >
              <span>+ 选择设备</span>
            </button>
          </div>

          {selectedDevices.length === 0 ? (
            <div className="mt-2 text-[14px] text-gray-400 font-normal">
              点击搜索并选择产品（至少选择1项）
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              {selectedDevices.map((rawItem, idx) => {
                const item = resolveDeviceInfo(rawItem);
                const productName = item.name || item.displayName || item.typeName || item.model || item.code;
                return (
                  <div
                    key={item.code || item.model || item.id || idx}
                    className="flex items-center justify-between bg-white rounded-lg px-3.5 py-3 border border-gray-100 shadow-2xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[15px] font-bold text-gray-800 truncate mr-2">
                      {productName}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDevice(item.code || item.model || item.id || item.name);
                      }}
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 active:scale-90 transition"
                      aria-label={`删除 ${productName}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
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
              className="w-full bg-transparent text-[16px] font-medium text-gray-900 outline-none"
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
                className="w-full bg-transparent text-[16px] font-medium text-gray-900 outline-none"
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

        {/* 字段 4：邮箱 (非必填) */}
        <div className="rounded-xl bg-[#F3F4F6] p-3.5">
          <div className="flex items-center text-[13px] text-gray-600">
            邮箱
          </div>
          <div className="mt-1 flex items-center justify-between">
            <input
              type="text"
              value={inquiryForm.email}
              onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
              className="w-full bg-transparent text-[16px] font-medium text-gray-900 outline-none"
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

        {/* 字段 6：公司名称 (可选) */}
        <div className="rounded-xl bg-[#F3F4F6] p-3.5">
          <div className="flex items-center text-[13px] text-gray-600">
            公司名称
          </div>
          <div className="mt-1 flex items-center justify-between">
            <input
              type="text"
              value={inquiryForm.companyName}
              onChange={(e) => setInquiryForm({ ...inquiryForm, companyName: e.target.value })}
              className="w-full bg-transparent text-[16px] font-medium text-gray-900 outline-none"
            />
            {inquiryForm.companyName && (
              <button
                type="button"
                onClick={() => setInquiryForm({ ...inquiryForm, companyName: '' })}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-gray-600"
                aria-label="清空公司名称"
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
              感谢您的垂询！已为您登记对设备 <span className="font-semibold text-gray-900">{selectedDevices.map((d) => d.name || d.model || d.code).join(', ') || initialDeviceModel}</span> 的报价请求，专属客户经理将在 24 小时内与联系人 <span className="font-semibold text-gray-900">{inquiryForm.contactName}</span> ({inquiryForm.phoneCode} {inquiryForm.phoneNumber}) 取得联系。
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

      {/* 搜索选择设备/产品/配件子页面 (覆盖式展示，保留已输入表单信息) */}
      {isSelectingDevice && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col">
          <SearchPage
            selectMode={true}
            initialSelected={selectedDevices}
            onConfirmSelection={(items) => {
              setSelectedDevices(items.map(resolveDeviceInfo).filter(Boolean));
              setIsSelectingDevice(false);
            }}
            onClose={() => setIsSelectingDevice(false)}
          />
        </div>
      )}
    </div>
  );
};

export default InquiryPage;

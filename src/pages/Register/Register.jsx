import React, { useState, useEffect, useRef } from 'react';

const COUNTRY_OPTIONS = [
  { code: '+86', name: '中国', flag: '🇨🇳' },
  { code: '+66', name: '泰国', flag: '🇹🇭' },
  { code: '+84', name: '越南', flag: '🇻🇳' },
  { code: '+60', name: '马来西亚', flag: '🇲🇾' },
  { code: '+62', name: '印度尼西亚', flag: '🇮🇩' },
  { code: '+966', name: '沙特阿拉伯', flag: '🇸🇦' },
  { code: '+49', name: '德国', flag: '🇩🇪' },
  { code: '+34', name: '西班牙', flag: '🇪🇸' },
];

const ROLE_OPTIONS = [
  { id: 'operator', name: '机手', desc: '工程机械操作手，专注施工与作业工况' },
  { id: 'owner', name: '机主 / 车队老板', desc: '设备拥有者，管理资产运营与成本效益' },
  { id: 'enterprise', name: '企业客户', desc: '集团/工程项目采购与综合设备管理' },
  { id: 'engineer', name: '服务工程师', desc: '设备维修、保养与技术巡检支持' },
  { id: 'fan', name: '行业爱好者', desc: '关注三一工程机械与智能制造前沿' },
];

const Register = ({ onClose, onLogin, onRegisterSuccess }) => {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_OPTIONS[0]);
  const [showCountryModal, setShowCountryModal] = useState(false);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [verifyCode, setVerifyCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [selectedRole, setSelectedRole] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const countdownTimerRef = useRef(null);

  useEffect(() => {
    if (countdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearTimeout(countdownTimerRef.current);
  }, [countdown]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleSendCode = () => {
    if (countdown > 0) return;
    if (!phone.trim()) {
      showToast('请先输入手机号码');
      return;
    }
    setCountdown(60);
    setVerifyCode('123456');
    showToast('验证码已发送 (演示码: 123456)');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) {
      showToast('请先勾选同意用户服务协议和隐私协议');
      return;
    }
    if (!phone.trim()) {
      showToast('请输入手机号码');
      return;
    }
    if (!password.trim()) {
      showToast('请设置密码');
      return;
    }
    if (password.length < 6) {
      showToast('密码长度至少需要 6 位');
      return;
    }

    // 成功回调
    onRegisterSuccess?.({
      phone,
      country: selectedCountry.code,
      role: selectedRole?.name || '新注册用户',
      company: companyName || '个人用户',
    });
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto bg-white" dir="auto">
      {/* 顶部关闭按钮栏 */}
      <div className="flex items-center justify-end px-5 pt-2 pb-2">
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-800 hover:bg-gray-100 active:scale-95 transition-all"
          aria-label="关闭注册页面"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-6 pb-8">
        {/* SANY 经典红色品牌 Logo */}
        <div className="mt-2 mb-8">
          <div className="text-[34px] font-black italic tracking-tighter text-[#e60012] leading-none select-none">
            SANY
          </div>
        </div>

        {/* 注册表单 */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 1. 国家/地区选择 */}
          <div
            onClick={() => setShowCountryModal(true)}
            className="flex h-[52px] items-center rounded-xl bg-[#f3f5f8] px-4 cursor-pointer active:bg-[#e8ebf0] transition-colors"
          >
            <svg className="flex-shrink-0 text-gray-800" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="currentColor" fillOpacity="0.8" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
            <span className="ml-3.5 flex-1 text-[15px] font-medium text-gray-800">
              {selectedCountry.name}
            </span>
            <svg className="flex-shrink-0 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>

          {/* 2. 手机号码 */}
          <div className="flex h-[52px] items-center rounded-xl bg-[#f3f5f8] px-4">
            <svg className="flex-shrink-0 text-gray-800" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="ml-3.5 mr-3 flex-shrink-0 text-[15px] font-medium text-gray-800">
              {selectedCountry.code}
            </span>
            <input
              type="tel"
              inputMode="tel"
              placeholder="手机号码"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              className="flex-1 min-w-0 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 outline-none"
              aria-label="手机号码"
            />
          </div>

          {/* 3. 密码 */}
          <div>
            <div className="flex h-[52px] items-center rounded-xl bg-[#f3f5f8] px-4">
              <svg className="flex-shrink-0 text-gray-800" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="7.5" cy="15.5" r="5.5" />
                <path d="m11.5 11.5 9-9M16.5 6.5l2 2M14.5 8.5l2 2" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ml-3.5 flex-1 min-w-0 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 outline-none"
                aria-label="密码"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 active:opacity-75"
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-1.5 px-1 text-[11px] leading-4 text-gray-400">
              6-16位密码，至少包含英文交字母，数字，特殊符号中的2种
            </div>
          </div>

          {/* 4. 验证码 */}
          <div>
            <div className="flex h-[52px] items-center rounded-xl bg-[#f3f5f8] px-4">
              <svg className="flex-shrink-0 text-gray-800" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <input
                type="text"
                maxLength={6}
                placeholder="验证码"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="ml-3.5 flex-1 min-w-0 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 outline-none"
                aria-label="验证码"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0}
                className={`ml-2 flex-shrink-0 text-[14px] font-medium transition-colors ${
                  countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900 active:opacity-75'
                }`}
              >
                {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
              </button>
            </div>
            <div className="mt-1.5 flex items-center gap-1 px-1 text-[11px] leading-4 text-gray-400">
              <span className="text-[12px]">💡</span>
              <span>请输入六位数字验证码</span>
            </div>
          </div>

          {/* 5. 身份选择 */}
          <div
            onClick={() => setShowRoleModal(true)}
            className="flex h-[52px] items-center rounded-xl bg-[#f3f5f8] px-4 cursor-pointer active:bg-[#e8ebf0] transition-colors"
          >
            <svg className="flex-shrink-0 text-gray-800" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className={`ml-3.5 flex-1 text-[15px] ${selectedRole ? 'font-medium text-gray-800' : 'text-gray-400'}`}>
              {selectedRole ? selectedRole.name : '身份'}
            </span>
            <svg className="flex-shrink-0 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>

          {/* 6. 公司名/姓名/昵称 */}
          <div className="flex h-[52px] items-center rounded-xl bg-[#f3f5f8] px-4">
            <svg className="flex-shrink-0 text-gray-800" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
            </svg>
            <input
              type="text"
              maxLength={50}
              placeholder="公司名/姓名/昵称"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="ml-3.5 flex-1 min-w-0 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 outline-none"
              aria-label="公司名或姓名昵称"
            />
          </div>

          {/* 7. 协议勾选 */}
          <div
            onClick={() => setAgreed(!agreed)}
            className="flex items-center gap-2.5 pt-3 pb-1 cursor-pointer select-none"
          >
            <div
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                agreed ? 'border-[#e60012] bg-[#e60012] text-white' : 'border-gray-300 bg-white'
              }`}
            >
              {agreed && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </div>
            <span className="text-[13px] text-gray-500">
              同意用户服务协议和隐私协议？
            </span>
          </div>

          {/* 8. 注册提交按钮 */}
          <div className="pt-2">
            <button
              type="submit"
              className={`h-[48px] w-full rounded-xl text-[16px] font-medium text-white transition-all ${
                agreed ? 'bg-[#e60012] active:opacity-90 shadow-sm' : 'bg-[#f8a5aa] cursor-pointer'
              }`}
            >
              注册
            </button>
          </div>

          {/* 9. 底部已有账号登录 */}
          <div className="pt-4 text-center text-[14px] text-gray-500">
            <span>已有账号？</span>
            <button
              type="button"
              onClick={onLogin}
              className="font-medium text-[#1677ff] hover:underline active:opacity-80 transition-opacity"
            >
              登录
            </button>
          </div>
        </form>
      </div>

      {/* 弹窗：国家/地区选择 */}
      {showCountryModal && (
        <div className="absolute inset-0 z-60 flex items-end justify-center bg-black/50" onClick={() => setShowCountryModal(false)}>
          <div
            className="w-full max-w-[393px] rounded-t-2xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="text-[16px] font-bold text-gray-900">选择国家 / 地区</h4>
              <button
                type="button"
                onClick={() => setShowCountryModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="divide-y divide-gray-50 max-h-[280px] overflow-y-auto">
              {COUNTRY_OPTIONS.map((item) => (
                <div
                  key={item.code}
                  onClick={() => {
                    setSelectedCountry(item);
                    setShowCountryModal(false);
                  }}
                  className="flex items-center justify-between py-3.5 px-2 cursor-pointer hover:bg-gray-50 rounded-lg active:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[18px]">{item.flag}</span>
                    <span className="text-[15px] font-medium text-gray-800">{item.name}</span>
                  </div>
                  <span className="text-[14px] text-gray-500 font-mono">{item.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 弹窗：身份选择 */}
      {showRoleModal && (
        <div className="absolute inset-0 z-60 flex items-end justify-center bg-black/50" onClick={() => setShowRoleModal(false)}>
          <div
            className="w-full max-w-[393px] rounded-t-2xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="text-[16px] font-bold text-gray-900">选择您的身份</h4>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto pt-1">
              {ROLE_OPTIONS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedRole(item);
                    setShowRoleModal(false);
                  }}
                  className="py-3 px-2 cursor-pointer hover:bg-gray-50 rounded-lg active:bg-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-semibold text-gray-800">{item.name}</span>
                    {selectedRole?.id === item.id && (
                      <span className="text-[#e60012] font-bold text-[14px]">✓</span>
                    )}
                  </div>
                  <p className="text-[12px] text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 提示 Toast */}
      {toastMessage && (
        <div className="absolute inset-x-0 bottom-16 z-70 flex justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="rounded-full bg-black/80 px-4 py-2 text-[13px] text-white shadow-lg backdrop-blur-xs">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;

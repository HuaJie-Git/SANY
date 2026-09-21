import React, { useState } from 'react';

const AuthPortal = ({ onLogin, onRegister, onNavigateTab, onOpenSettings }) => {
  const [agreed, setAgreed] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreementType, setAgreementType] = useState('service');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleLoginClick = () => {
    // 用户指令：如果我再次点登录，就会进入标准流程，也就是我现在刚刚让你实现的那个页面。
    onLogin?.('login');
  };

  const handleRegisterClick = () => {
    onRegister?.();
  };

  const handleSocialLogin = (provider) => {
    showToast(`正在通过 ${provider} 授权登录...`);
    setTimeout(() => {
      onLogin?.('social');
    }, 600);
  };

  return (
    <div className="relative h-full w-full bg-white flex flex-col justify-between overflow-y-auto" dir="auto">
      {/* 顶部标题栏 */}
      <div className="flex-shrink-0 px-6 pt-3 pb-1 flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight leading-tight">账号</h1>
          {/* 红色指示条 */}
          <div className="w-7 h-[3.5px] bg-[#d40014] rounded-full mt-1" />
        </div>
        {/* 设置齿轮图标 */}
        <button
          type="button"
          onClick={() => onOpenSettings?.()}
          className="w-9 h-9 flex items-center justify-center text-gray-800 active:opacity-60 transition-opacity"
          aria-label="设置"
        >
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        </button>
      </div>

      {/* 主体交互区域 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-2 pb-4">
        {/* 大标题 */}
        <h2 className="text-[25px] font-bold text-[#1a1a1a] tracking-tight text-center">
          登录或注册账号
        </h2>

        {/* 中心特色插画 */}
        <div className="relative my-6 flex items-center justify-center">
          {/* 浅灰圆形背景底衬 */}
          <div className="w-[175px] h-[175px] rounded-full bg-[#f3f4f6]/90 flex items-center justify-center relative shadow-inner">
            {/* 手机图形主体 */}
            <div className="w-[84px] h-[142px] bg-[#e2e6eb] rounded-[18px] border-[1.5px] border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] relative flex flex-col items-center justify-center rotate-[-3deg]">
              {/* 顶部听筒槽 */}
              <div className="w-5 h-[3px] bg-[#9ca3af] rounded-full absolute top-2" />

              {/* 中部锁图标 */}
              <div className="relative flex flex-col items-center mt-2">
                {/* 开启状态锁梁 */}
                <svg width="30" height="24" viewBox="0 0 30 24" fill="none" className="-mb-1 -ml-3">
                  <path
                    d="M9 22V9.5C9 5.358 12.358 2 16.5 2C20.642 2 24 5.358 24 9.5V14"
                    stroke="#0f172a"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                  />
                </svg>
                {/* 锁体 */}
                <div className="w-[34px] h-[28px] bg-[#0f172a] rounded-[7px] flex items-center justify-center shadow-sm">
                  {/* 锁孔 */}
                  <div className="w-1.5 h-2.5 bg-[#e2e6eb] rounded-full flex flex-col items-center justify-start pt-0.5">
                    <div className="w-1.5 h-1.5 bg-[#e2e6eb] rounded-full" />
                    <div className="w-[2px] h-1 bg-[#e2e6eb]" />
                  </div>
                </div>
              </div>
            </div>

            {/* 左上方辐射线条 */}
            <div className="absolute top-8 left-11 flex flex-col items-center gap-0.5">
              <div className="w-3.5 h-[2px] bg-gray-800 rotate-[-45deg] rounded-full" />
              <div className="w-2.5 h-[2px] bg-gray-800 rotate-[-15deg] rounded-full -ml-2 mt-1" />
            </div>

            {/* 右上方十字星芒 */}
            <div className="absolute top-10 right-8 text-gray-700">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
            </div>

            {/* 左下方装饰圆圈 */}
            <div className="absolute bottom-9 left-6 flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full border-[1.8px] border-[#d40014]" />
              <div className="w-2 h-2 rounded-full border-[1.5px] border-gray-500 mb-2" />
            </div>
          </div>
        </div>

        {/* 副标题 */}
        <p className="text-[13.5px] text-[#8e95a0] text-center max-w-[280px] leading-relaxed">
          登录或注册账号以获取 MySANY 的更多功能。
        </p>

        {/* 主操作按钮组 */}
        <div className="w-full mt-6 space-y-3 px-1">
          {/* 红色登录按钮：点击进入标准流程 */}
          <button
            type="button"
            onClick={handleLoginClick}
            className="w-full h-[48px] bg-[#d40014] hover:bg-[#bd0012] active:scale-[0.99] text-white font-medium text-[16px] rounded-xl flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(212,0,20,0.2)]"
          >
            登录
          </button>

          {/* 白底黑框注册账号按钮：点击进入注册页 */}
          <button
            type="button"
            onClick={handleRegisterClick}
            className="w-full h-[48px] bg-white border border-gray-900 active:bg-gray-50 active:scale-[0.99] text-gray-900 font-medium text-[16px] rounded-xl flex items-center justify-center transition-all"
          >
            注册账号
          </button>
        </div>

        {/* 协议勾选行 */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setAgreed(!agreed)}
            className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
              agreed ? 'bg-[#d40014] border-[#d40014]' : 'bg-white border-gray-300'
            }`}
            aria-label="同意用户服务协议和隐私协议"
          >
            {agreed && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
          <span className="text-[13px] text-[#8e95a0]">
            同意
            <button
              type="button"
              onClick={() => { setAgreementType('service'); setShowAgreementModal(true); }}
              className="text-[#8e95a0] hover:underline"
            >
              用户服务协议
            </button>
            和
            <button
              type="button"
              onClick={() => { setAgreementType('privacy'); setShowAgreementModal(true); }}
              className="text-[#8e95a0] hover:underline"
            >
              隐私协议
            </button>
            ？
          </span>
        </div>

        {/* 其他登录方式分割线 */}
        <div className="w-full mt-7 flex items-center justify-center px-2">
          <div className="flex-1 h-[1px] bg-gray-200" />
          <span className="px-3 text-[12.5px] text-[#9ca3af]">其他登录方式</span>
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>

        {/* 第三方登录图标组 */}
        <div className="mt-5 flex items-center justify-center gap-6">
          {/* 微信 */}
          <button
            type="button"
            onClick={() => handleSocialLogin('微信')}
            className="w-12 h-12 rounded-full bg-[#07c160] flex items-center justify-center shadow-[0_2px_8px_rgba(7,193,96,0.25)] active:scale-95 transition-transform"
            aria-label="微信登录"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <path d="M8.5 4C4.36 4 1 6.91 1 10.5c0 1.95.94 3.71 2.45 4.93L2.7 18.2c-.08.28.18.54.45.44l3.19-1.2c.7.18 1.43.27 2.16.27.35 0 .69-.02 1.03-.06-.32-.69-.53-1.44-.53-2.23 0-3.23 2.91-5.84 6.5-5.84.45 0 .89.04 1.32.12C16.14 6.74 12.63 4 8.5 4zM6.25 8a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm4.5 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" />
              <path d="M16 11c-3.31 0-6 2.24-6 5s2.69 5 6 5c.61 0 1.21-.08 1.77-.23l2.42.91c.23.09.46-.13.39-.37l-.59-2.12c1.23-.97 2.01-2.33 2.01-3.83 0-2.76-2.69-5-6-5zm-2 3.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => handleSocialLogin('Facebook')}
            className="w-12 h-12 rounded-full bg-[#1877f2] flex items-center justify-center shadow-[0_2px_8px_rgba(24,119,242,0.25)] active:scale-95 transition-transform"
            aria-label="Facebook登录"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>

          {/* Google */}
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-95 transition-transform"
            aria-label="Google登录"
          >
            <svg width="23" height="23" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => handleSocialLogin('Apple')}
            className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.25)] active:scale-95 transition-transform"
            aria-label="Apple登录"
          >
            <svg width="23" height="23" viewBox="0 0 24 24" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.67-.82 1.12-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.97 1.07.08 2.14-.52 2.81-1.31z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 底部导航栏：4个Tab（首页、资产、审核、我），高亮在"我" */}
      <div className="flex-shrink-0 w-full bg-white border-t border-gray-100 px-4 py-2 flex items-center justify-around">
        {/* 首页 Tab */}
        <button
          type="button"
          onClick={() => onNavigateTab?.('home')}
          className="flex flex-col items-center justify-center text-gray-700 active:opacity-70 transition-opacity"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z" />
            <path d="M9 22V12H15V22" />
          </svg>
          <span className="text-[10px] mt-1 text-gray-700">首页</span>
        </button>

        {/* 资产 Tab */}
        <button
          type="button"
          onClick={() => onNavigateTab?.('asset')}
          className="flex flex-col items-center justify-center text-gray-700 active:opacity-70 transition-opacity"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" />
          </svg>
          <span className="text-[10px] mt-1 text-gray-700">资产</span>
        </button>

        {/* 审核 Tab */}
        <button
          type="button"
          onClick={() => onNavigateTab?.('audit')}
          className="flex flex-col items-center justify-center text-gray-700 active:opacity-70 transition-opacity"
        >
          <svg width="24" height="24" viewBox="0 0 1024 1024" fill="currentColor">
            <path d="M831.02 900.23H192.98c-16.48 0-29.84-13.36-29.84-29.84s13.36-29.84 29.84-29.84h638.05c16.48 0 29.84 13.36 29.84 29.84s-13.36 29.84-29.85 29.84zM830.96 781.5h-636.6c-16.48 0-29.84-13.36-29.84-29.84V646.14c0-52.18 42.43-94.63 94.58-94.63h120.6c-1.62-31.43-12.35-81.8-22-92.95-31.94-41.09-49.35-88.7-51.38-138.95-0.17-54.98 22.38-106.98 61.88-143.77 38.87-36.22 91.38-55.03 144.52-51.67 52.71-3.41 104.95 15.2 143.77 51.05 39.42 36.4 62.21 87.94 62.53 141.4-1.89 51.77-19.31 99.61-50.38 139.62-10.39 12.15-21.2 62.36-22.99 93.79h120.58c52.15 0 94.58 42.45 94.58 94.62v107.02c-0.01 16.48-13.37 29.83-29.85 29.83zM224.2 721.82h576.91v-77.18c0-19.26-15.66-34.94-34.9-34.94H625.25c-9.72 0-18.84-4.74-24.43-12.7-8.29-11.81-13.43-25.73-14.9-40.24-0.13-1.27-0.17-2.55-0.14-3.85 0.54-18.83 8.77-101.96 36.64-134.42 22.44-28.95 35.52-64.9 36.93-102.82-0.24-35.71-16.04-71.4-43.35-96.62-27.24-25.15-63.97-37.96-101.05-35.23-1.48 0.12-2.95 0.11-4.43 0.01-37.21-2.87-74.35 10.24-101.64 35.66-27.37 25.51-43 61.53-42.9 98.83 1.5 36.64 14.59 72.43 37.84 102.41 27.31 31.46 35.26 114.92 35.71 133.83 0.03 1.09-0.01 2.19-0.1 3.27-1.25 14.47-6.42 28.54-14.96 40.68a29.876 29.876 0 0 1-24.41 12.67H259.11c-19.24 0-34.9 15.68-34.9 34.95v75.69z" />
          </svg>
          <span className="text-[10px] mt-1 text-gray-700">审核</span>
        </button>

        {/* 我 Tab（当前高亮态） */}
        <button
          type="button"
          className="flex flex-col items-center justify-center text-[#d40014]"
        >
          <div className="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z" />
            </svg>
            {/* 右上方红点指示 */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#d40014] rounded-full ring-2 ring-white" />
          </div>
          <span className="text-[10px] mt-1 font-medium text-[#d40014]">我</span>
        </button>
      </div>

      {/* 轻提示 Toast */}
      {toastMessage && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[90] bg-black/80 text-white text-[12px] px-4 py-2 rounded-full shadow-lg pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* 协议弹窗 */}
      {showAgreementModal && (
        <div
          className="absolute inset-0 z-[100] bg-black/50 flex items-center justify-center p-6"
          onClick={() => setShowAgreementModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-[320px] max-h-[75vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[16px] font-bold text-gray-900 mb-3">
              {agreementType === 'service' ? 'MySANY 用户服务协议' : 'MySANY 隐私保护协议'}
            </h3>
            <div className="flex-1 overflow-y-auto text-[12px] text-gray-600 leading-5 space-y-2 pr-1">
              <p>欢迎您使用三一集团 MySANY 智能化服务平台。在登录或注册前，请认真阅读以下协议要点：</p>
              <p>1. 账号管理：您应妥善保管登录凭据，严禁以转让、出借等方式提供给他人使用。</p>
              <p>2. 设备与服务数据：我们收集您的设备工况、地理位置及运行指标，仅用于提供精准故障诊断、保养提醒与售后支持。</p>
              <p>3. 信息安全：三一严格遵守国内外数据合规与隐私保护法律法规，保障您的商业秘密与个人信息安全。</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setAgreed(true);
                  setShowAgreementModal(false);
                }}
                className="flex-1 h-9 rounded-lg bg-[#d40014] text-white text-[13px] font-medium"
              >
                同意并继续
              </button>
              <button
                type="button"
                onClick={() => setShowAgreementModal(false)}
                className="h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-[13px]"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPortal;

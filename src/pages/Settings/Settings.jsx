import React, { useState } from 'react';

const Settings = ({ onBack }) => {
  const [toastMessage, setToastMessage] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('跟随系统');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleClearCache = () => {
    showToast('正在清理本地缓存...');
    setTimeout(() => {
      showToast('已清理 18.6MB 缓存数据');
    }, 600);
  };

  const handleCheckVersion = () => {
    showToast('当前已是最新版本 V4.9.45');
  };

  const languages = [
    { label: '跟随系统', value: '跟随系统' },
    { label: '简体中文', value: '简体中文' },
    { label: 'English', value: 'English' },
    { label: 'Español', value: 'Español' },
    { label: 'Français', value: 'Français' },
    { label: 'Português', value: 'Português' },
    { label: 'العربية', value: 'العربية' },
    { label: 'ไทย', value: 'ไทย' },
  ];

  const helpTopics = [
    {
      q: '游客体验模式与正式模式有什么区别？',
      a: '游客模式下可浏览设备资产、工况演示、审核事件及社区内容；涉及设备绑定、控制、报修及工单提交等敏感操作需先完成登录。',
    },
    {
      q: '如何绑定我的三一设备？',
      a: '登录后进入“资产”页，点击左上方“绑定设备”，扫描设备机身二维码或输入 17 位车辆识别码（VIN/PIN）完成认证。',
    },
    {
      q: '如何联系专属服务工程师？',
      a: '在设备详情页或客户心声页面点击“我要召请”或“在线客服”，系统将为您匹配最近的服务网点与工程师。',
    },
    {
      q: '如何查看设备每日开工动态与能耗报表？',
      a: '在首页“设备开机动态”卡片点击“开机曲线”，或在资产详情页查看当日工时、油耗及历史报表数据。',
    },
  ];

  return (
    <div className="relative h-full w-full bg-white flex flex-col justify-between overflow-y-auto" dir="auto">
      {/* 顶部导航栏 */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3 flex items-center">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[#1a1a1a] active:opacity-60 transition-opacity"
          aria-label="返回"
        >
          {/* 返回箭头 */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <h1 className="text-[20px] font-bold tracking-tight leading-none text-[#1a1a1a]">
            设置
          </h1>
        </button>
      </div>

      {/* 设置项列表区域 */}
      <div className="flex-1 px-4 pt-1 pb-6 space-y-3 overflow-y-auto">
        {/* 1. 语言 */}
        <button
          type="button"
          onClick={() => setShowLanguageModal(true)}
          className="w-full rounded-2xl bg-[#f6f7fa] px-5 py-4 flex items-center justify-between active:bg-[#edf0f5] transition-colors text-left"
        >
          <span className="text-[15px] text-[#1a1a1a] font-normal">语言</span>
          <div className="flex items-center gap-1 text-[#2c3038] text-[14px]">
            <span>{currentLanguage}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>

        {/* 2. 当前版本 */}
        <button
          type="button"
          onClick={handleCheckVersion}
          className="w-full rounded-2xl bg-[#f6f7fa] px-5 py-4 flex items-center justify-between active:bg-[#edf0f5] transition-colors text-left"
        >
          <span className="text-[15px] text-[#1a1a1a] font-normal">当前版本</span>
          <span className="text-[15px] text-[#1a1a1a] font-semibold">V4.9.45</span>
        </button>

        {/* 3. 使用帮助 */}
        <button
          type="button"
          onClick={() => setShowHelpModal(true)}
          className="w-full rounded-2xl bg-[#f6f7fa] px-5 py-4 flex items-center justify-between active:bg-[#edf0f5] transition-colors text-left"
        >
          <span className="text-[15px] text-[#1a1a1a] font-normal">使用帮助</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* 4. 服务电话 */}
        <button
          type="button"
          onClick={() => setShowCallModal(true)}
          className="w-full rounded-2xl bg-[#f6f7fa] px-5 py-3.5 flex items-center justify-between active:bg-[#edf0f5] transition-colors text-left"
        >
          <span className="text-[15px] text-[#1a1a1a] font-normal">服务电话</span>
          <div className="flex flex-col items-end">
            <span className="text-[15px] text-[#1a1a1a] font-semibold tracking-tight">0086-4006098318</span>
            <span className="text-[11.5px] text-[#9ca3af] mt-0.5">Beijing Time 9:00-18:00(GMT+8)</span>
          </div>
        </button>

        {/* 5. 隐私协议 */}
        <button
          type="button"
          onClick={() => setShowPrivacyModal(true)}
          className="w-full rounded-2xl bg-[#f6f7fa] px-5 py-4 flex items-center justify-between active:bg-[#edf0f5] transition-colors text-left"
        >
          <span className="text-[15px] text-[#1a1a1a] font-normal">隐私协议</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* 6. 用户服务协议 */}
        <button
          type="button"
          onClick={() => setShowTermsModal(true)}
          className="w-full rounded-2xl bg-[#f6f7fa] px-5 py-4 flex items-center justify-between active:bg-[#edf0f5] transition-colors text-left"
        >
          <span className="text-[15px] text-[#1a1a1a] font-normal">用户服务协议</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* 7. 清除缓存 */}
        <button
          type="button"
          onClick={handleClearCache}
          className="w-full rounded-2xl bg-[#f6f7fa] px-5 py-4 flex items-center justify-between active:bg-[#edf0f5] transition-colors text-left"
        >
          <span className="text-[15px] text-[#1a1a1a] font-normal">清除缓存</span>
        </button>
      </div>

      {/* 语言选择弹窗 */}
      {showLanguageModal && (
        <div
          className="absolute inset-0 z-[100] bg-black/45 flex items-end justify-center"
          onClick={() => setShowLanguageModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl p-5 w-full max-h-[60vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-[16px] font-bold text-gray-900">选择系统语言</h3>
              <button
                type="button"
                onClick={() => setShowLanguageModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2 space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => {
                    setCurrentLanguage(lang.value);
                    setShowLanguageModal(false);
                    showToast(`语言已切换至：${lang.label}`);
                  }}
                  className={`w-full px-4 py-3 rounded-xl flex items-center justify-between text-[14px] ${
                    currentLanguage === lang.value ? 'bg-[#fff1f2] text-[#d40014] font-medium' : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span>{lang.label}</span>
                  {currentLanguage === lang.value && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d40014" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 使用帮助抽屉 */}
      {showHelpModal && (
        <div
          className="absolute inset-0 z-[100] bg-black/45 flex items-end justify-center"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl p-5 w-full max-h-[75vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-[16px] font-bold text-gray-900">使用帮助与常见问题</h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
              {helpTopics.map((topic, i) => (
                <div key={i} className="rounded-xl bg-[#f8f9fa] p-3.5 border border-gray-100">
                  <div className="text-[14px] font-semibold text-gray-900 mb-1.5 flex items-start gap-1.5">
                    <span className="text-[#d40014] flex-shrink-0 font-bold">Q:</span>
                    <span>{topic.q}</span>
                  </div>
                  <div className="text-[12.5px] text-gray-600 leading-relaxed pl-5">
                    {topic.a}
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-full h-10 rounded-xl bg-[#d40014] text-white text-[14px] font-medium"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 呼叫客服弹窗 */}
      {showCallModal && (
        <div
          className="absolute inset-0 z-[100] bg-black/50 flex items-center justify-center p-6"
          onClick={() => setShowCallModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-[300px] text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-[#fef2f2] text-[#d40014] flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h3 className="text-[16px] font-bold text-gray-900">拨打三一客服专线</h3>
            <p className="text-[16px] font-semibold text-[#d40014] mt-2 tracking-wide">0086-4006098318</p>
            <p className="text-[11px] text-gray-400 mt-1">服务时间：北京时间 9:00 - 18:00 (GMT+8)</p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowCallModal(false)}
                className="flex-1 h-9 rounded-lg border border-gray-200 text-gray-600 text-[13px]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCallModal(false);
                  showToast('正在呼叫三一客户服务专线...');
                }}
                className="flex-1 h-9 rounded-lg bg-[#d40014] text-white text-[13px] font-medium"
              >
                呼叫
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 隐私协议弹窗 */}
      {showPrivacyModal && (
        <div
          className="absolute inset-0 z-[100] bg-black/50 flex items-center justify-center p-6"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-[320px] max-h-[75vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[16px] font-bold text-gray-900 mb-3">三一集团隐私协议</h3>
            <div className="flex-1 overflow-y-auto text-[12px] text-gray-600 leading-5 space-y-2 pr-1">
              <p>三一集团极其重视用户的个人信息安全与商业数据隐私。在您使用 MySANY APP 各项智能终端服务时，我们将依照本协议收集、存储与使用相关数据：</p>
              <p><strong>1. 数据收集范围：</strong>包括您注册填写的账号信息、设备出厂编码、GPS 位置及传感器作业工况数据。</p>
              <p><strong>2. 数据使用目的：</strong>仅用于设备远程故障诊断、保养周期提醒、配件耗损分析与技术召请响应。</p>
              <p><strong>3. 安全与加密：</strong>采用工业级安全传输协议与多地容灾加密存储，未经您的授权绝不泄露给任何第三方。</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="w-full h-9 rounded-lg bg-[#d40014] text-white text-[13px] font-medium"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 用户服务协议弹窗 */}
      {showTermsModal && (
        <div
          className="absolute inset-0 z-[100] bg-black/50 flex items-center justify-center p-6"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-[320px] max-h-[75vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[16px] font-bold text-gray-900 mb-3">MySANY 用户服务协议</h3>
            <div className="flex-1 overflow-y-auto text-[12px] text-gray-600 leading-5 space-y-2 pr-1">
              <p>欢迎使用三一智造物联云控系统。请仔细阅读本服务协议条款：</p>
              <p><strong>1. 账号使用规范：</strong>用户有义务妥善保管账号密码与双重认证信息，因保管不善造成的工况数据异常由用户自行承担。</p>
              <p><strong>2. 规范操作与维保：</strong>请严格按照产品手册操作设备并定期进行原厂配件保养，以确保整机质保权益有效。</p>
              <p><strong>3. 服务变更与升级：</strong>为持续提升服务品质，三一集团将不定期对客户端固件与应用功能进行版本更新。</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="w-full h-9 rounded-lg bg-[#d40014] text-white text-[13px] font-medium"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast 提示 */}
      {toastMessage && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[110] bg-black/80 text-white text-[12px] px-4 py-2 rounded-full shadow-lg pointer-events-none">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Settings;

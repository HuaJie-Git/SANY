import React, { useState } from 'react';

const QuickLogin = ({ onLoginAccount, onBrowseGuest }) => {
  const [agreed, setAgreed] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(''), 1800);
  };

  const handleLoginAccount = () => {
    if (!agreed) {
      showToast('请先同意用户服务协议和隐私协议');
      return;
    }
    onLoginAccount?.();
  };

  return (
    <div className="relative h-full w-full bg-white flex flex-col overflow-y-auto" dir="auto">
      <div className="flex-1 flex flex-col items-center px-8 pt-10">
        <div className="relative w-[84px] h-[84px] rounded-[10px] bg-gradient-to-b from-[#ef1c24] to-[#c10d16] shadow-[0_6px_16px_rgba(193,13,22,0.28)] flex flex-col items-center justify-center text-white">
          <span className="absolute top-1.5 left-1.5 rounded-[3px] bg-[#f5c400] px-1 py-[1px] text-[8px] font-black leading-none text-[#7a1600]">UAT</span>
          <span className="mt-2 font-serif italic text-[26px] leading-none">My</span>
          <span className="mt-1 text-[15px] font-black tracking-[0.18em] leading-none">SANY</span>
        </div>

        <div className="mt-14 flex flex-col items-center">
          <div className="h-[86px] w-[86px] overflow-hidden rounded-full bg-[#efe4c8] shadow-[0_2px_10px_rgba(0,0,0,0.08)] flex items-center justify-center">
            <span className="text-[28px] font-semibold text-[#8a6a32]">馒</span>
          </div>
          <div className="mt-4 text-[22px] font-semibold text-[#1a1a1a] leading-tight break-words text-center">大馒头1</div>
          <div className="mt-1.5 text-[15px] text-[#9aa0a6] tracking-wide">16600000004</div>
        </div>

        <button
          type="button"
          onClick={handleLoginAccount}
          className="mt-10 w-full min-h-[48px] rounded-xl bg-[#e60012] px-3 py-2.5 text-[16px] font-medium leading-snug text-white whitespace-normal break-words active:opacity-90"
          dir="auto"
        >
          登录此账号
        </button>

        <button
          type="button"
          onClick={() => onBrowseGuest?.()}
          className="mt-3 w-full min-h-[48px] rounded-xl bg-[#f4f5f7] px-3 py-2.5 text-[16px] font-medium leading-snug text-[#5b616c] whitespace-normal break-words active:bg-[#eaecf0]"
          dir="auto"
        >
          游客登录
        </button>

        <div className="mt-5 flex items-start justify-center gap-2 max-w-full" dir="auto">
          <button
            type="button"
            onClick={() => setAgreed((value) => !value)}
            className={`mt-0.5 h-[18px] w-[18px] flex-shrink-0 rounded-full border flex items-center justify-center ${agreed ? 'border-[#1a1a1a] bg-[#1a1a1a]' : 'border-gray-300 bg-white'}`}
            aria-label="同意并接受用户服务协议和隐私协议"
          >
            {agreed && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
          <p className="text-[13px] leading-relaxed text-[#8e95a0] whitespace-normal break-words">
            同意并接受
            <button type="button" className="text-[#8e95a0] underline underline-offset-2">用户服务协议</button>
            {' '}和{' '}
            <button type="button" className="text-[#8e95a0] underline underline-offset-2">隐私协议</button>
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 pb-8 pt-4 flex justify-center">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex items-center gap-1 text-[14px] text-[#c4c7cc] cursor-not-allowed whitespace-normal break-words"
          dir="auto"
        >
          <span>其他登录方式</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {toastMessage && (
        <div className="absolute bottom-24 left-1/2 z-[90] max-w-[80%] -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-center text-[12px] text-white whitespace-normal break-words pointer-events-none">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default QuickLogin;

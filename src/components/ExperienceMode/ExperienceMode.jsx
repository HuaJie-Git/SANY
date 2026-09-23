import React, { useState } from 'react';
import { trackLeadIntent } from '../../utils/tracking';
import CustomerVoicePage from '../../pages/CustomerVoice/CustomerVoice';
import InquiryPage from '../../pages/Inquiry/InquiryPage';


const Arrow = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>;


export const FeedbackFloatingButton = () => null;

export const ExperienceServiceRail = () => null;

export const ActivityCampaignBanner = ({ onInquiry }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="mx-4 mt-3 overflow-hidden rounded-lg bg-[#202a34] text-white shadow-sm">
      <div className="relative h-[116px] overflow-hidden">
        <img src="images/优惠活动/挖掘机/挖掘机_01.jpg" alt="秋季购机礼遇活动" className="h-full w-full object-cover opacity-80" />
        <div className="absolute inset-x-0 bottom-0 p-3 pr-[92px]">
          <div className="text-[11px] text-white/80">限时活动 · 2026.09.01 - 2026.10.31</div>
          <h2 className="mt-1 text-[18px] font-semibold">秋季购机礼遇</h2>
        </div>
        <button type="button" onClick={() => { trackLeadIntent.serviceEntryClick('campaign_inquiry', 'homepage_campaign_banner'); onInquiry?.(); }} className="absolute bottom-3 right-3 flex h-8 items-center gap-1 rounded-md bg-brand-red px-3 text-[12px] font-medium text-white">我要询价 <Arrow /></button>
      </div>
      <div className="p-3">
        <p className="text-[12px] leading-5 text-white/80">指定机型享金融方案与服务礼包，提交需求后由 MOSS 清洗并下发至对应销售团队。</p>
        {expanded && <div className="mt-2 border-t border-white/15 pt-2 text-[11px] leading-5 text-white/70">活动详情：可选挖掘机、起重机、混凝土机械等品类；最终权益以当地经销商确认结果为准。</div>}
        <div className="mt-3 flex items-center justify-between gap-3">
          <button type="button" onClick={() => setExpanded((value) => !value)} className="text-[12px] text-white/80 underline underline-offset-2">{expanded ? '收起详情' : '活动详情'}</button>
        </div>
      </div>
    </section>
  );
};

export const LoginPrompt = ({ visible, onClose, onLogin }) => {
  if (!visible) return null;
  return (
    <div
      className="absolute inset-0 z-[80] flex items-center justify-center bg-black/45 px-8"
      onClick={onClose}
    >
      <div
        dir="auto"
        className="relative w-full max-w-[320px] rounded-xl bg-white p-5 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 右上角清晰醒目的关闭按钮 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 active:scale-95 transition-all"
          aria-label="关闭弹窗"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <h3 className="break-words text-[17px] font-semibold text-gray-900">当前为游客模式</h3>
        <p className="mt-2 break-words text-[13px] leading-5 text-gray-500">登录后体验完整功能</p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => onLogin?.('register')}
            className="min-h-10 flex-1 rounded-lg border border-gray-200 px-3 text-[13px] font-medium text-gray-700 active:bg-gray-50 transition-colors"
          >
            注册
          </button>
          <button
            type="button"
            onClick={() => onLogin?.('portal')}
            className="min-h-10 flex-1 rounded-lg bg-brand-red px-3 text-[13px] font-medium text-white active:opacity-90 transition-opacity"
          >
            登录
          </button>
        </div>
      </div>
    </div>
  );
};

export const ExperienceNotice = ({ onLogin }) => (
  <div dir="auto" className="mx-auto flex w-[calc(100%-24px)] max-w-[355px] items-center justify-between gap-3 rounded-xl border border-[#ffd7d9] bg-[#fff6f6] px-3.5 py-2.5 shadow-[0_6px_18px_rgba(82,19,25,0.12)]">
    <div className="min-w-0 flex flex-col justify-center">
      <span className="break-words text-[13px] font-semibold text-[#8f111b] leading-tight">当前为游客模式</span>
      <span className="mt-0.5 break-words text-[11px] text-[#8d5960] leading-snug">登录后体验完整功能</span>
    </div>
    <button
      type="button"
      onClick={onLogin}
      className="flex-none rounded-full bg-[#bc000f] px-3.5 py-1.5 text-[12px] font-medium text-white shadow-xs active:opacity-80 cursor-pointer"
    >
      登录
    </button>
  </div>
);



export const CustomerVoice = CustomerVoicePage;
export const InquiryForm = InquiryPage;

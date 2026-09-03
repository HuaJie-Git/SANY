import React, { useState } from 'react';
import { trackLeadIntent } from '../../utils/tracking';

const BackButton = ({ onClick, label = '返回' }) => (
  <button type="button" aria-label={label} onClick={onClick} className="flex h-9 w-9 items-center justify-center text-gray-800 active:bg-gray-100">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
  </button>
);

const Arrow = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>;

const ServiceIcon = ({ type }) => {
  if (type === 'preSales') return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a8 8 0 0 1 16 0" /><path d="M18 19c0 1.1-.9 2-2 2h-3" /><path d="M4 14v3a2 2 0 0 0 2 2h1v-7H6a2 2 0 0 0-2 2ZM20 14v3a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2Z" /></svg>;
  if (type === 'afterSales') return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L4 17l3 3 5.5-5.5a4 4 0 0 0 5.2-5.2l-2.5 2.5-3-3 2.5-2.5Z" /><path d="m5 19 1-1" /></svg>;
  if (type === 'inquiry') return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V6a2 2 0 0 1 1-2Z" /><path d="M8 9h8M8 13h5" /></svg>;
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h4a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4h4" /><path d="M9 2h6v4H9zM8 11h8M8 15h5" /></svg>;
};

export const ExperienceBanner = ({ onLogin }) => (
  <div className="absolute bottom-[104px] left-3 right-3 z-30 flex items-center justify-between gap-3 rounded-xl bg-[#252b33]/95 px-4 py-3 text-white shadow-lg">
    <div className="min-w-0 pr-7">
      <div className="text-[13px] font-semibold">当前为体验模式</div>
      <div className="mt-0.5 truncate text-[11px] text-white/75">浏览演示数据，登录后使用完整服务</div>
    </div>
    <button type="button" onClick={onLogin} className="flex-shrink-0 rounded-full bg-brand-red px-5 py-2 text-[13px] font-medium text-white active:opacity-80">登录</button>
  </div>
);

export const FeedbackFloatingButton = ({ onClick, hidden = false }) => {
  if (hidden) return null;
  return (
    <button type="button" aria-label="客户心声" onClick={onClick} className="absolute bottom-[198px] right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(31,41,55,0.18)] active:scale-95">
      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#BC000F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></svg>
    </button>
  );
};

export const ExperienceServiceRail = ({ onCustomerVoice, onInquiry }) => (
  <div className="absolute bottom-[198px] right-3 z-30 overflow-hidden rounded-lg bg-white shadow-[0_4px_16px_rgba(31,41,55,0.18)]">
    <button type="button" onClick={() => { trackLeadIntent.serviceEntryClick('customer_voice', 'homepage_service_rail'); onCustomerVoice?.(); }} className="flex w-[58px] flex-col items-center gap-1 border-b border-gray-100 px-1 py-2 text-[#3d444e] active:bg-gray-50">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 11.5a8 8 0 0 1-11.5 7.2L3 21l2.3-5.5A8 8 0 1 1 20 11.5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></svg>
      <span className="text-[10px] leading-3">客户心声</span>
    </button>
    <button type="button" onClick={() => { trackLeadIntent.serviceEntryClick('inquiry', 'homepage_service_rail'); onInquiry?.(); }} className="flex w-[58px] flex-col items-center gap-1 bg-brand-red px-1 py-2 text-white active:bg-[#a9000d]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16v12H8l-4 4V4Z" /><path d="M8 9h8M8 12h5" /></svg>
      <span className="text-[10px] font-medium leading-3">询价</span>
    </button>
  </div>
);

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
  return <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/45 px-8"><div className="w-full max-w-[320px] rounded-lg bg-white p-5 text-center shadow-xl"><h3 className="text-[17px] font-semibold text-gray-900">登录后可使用</h3><p className="mt-2 text-[13px] leading-5 text-gray-500">体验模式仅支持浏览演示数据，登录后可使用此功能。</p><div className="mt-5 flex gap-3"><button type="button" onClick={onClose} className="h-10 flex-1 rounded-md border border-gray-200 text-[13px] text-gray-600">取消</button><button type="button" onClick={onLogin} className="h-10 flex-1 rounded-md bg-brand-red text-[13px] text-white">登录</button></div></div></div>;
};

const SERVICE_OPTIONS = [
  { id: 'preSales', title: '售前咨询', description: '产品选型、方案配置与活动权益' },
  { id: 'afterSales', title: '售后服务', description: '设备报修、配件支持与进度查询' },
  { id: 'inquiry', title: '我要询价', description: '提交采购需求，由销售顾问联系您' },
  { id: 'complaint', title: '投诉建议', description: '反馈产品、服务问题或改进建议' },
];

const ConversationPanel = ({ kind, onBack }) => {
  const label = kind === 'preSales' ? '售前客服' : '售后客服';
  const [connected, setConnected] = useState(false);
  return <div className="mt-7"><div className="rounded-lg border border-gray-100 bg-[#f7f8fa] p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red text-[14px] font-semibold text-white">三一</div><div className="min-w-0"><div className="text-[14px] font-semibold text-gray-900">{label}</div><div className="mt-0.5 text-[11px] text-green-600">{connected ? '已接入 · 客服将为您服务' : '当前在线 · 将为您优先接入'}</div></div></div><div className="mt-4 rounded-md bg-white p-3 text-[13px] leading-5 text-gray-700">您好，我是{label}。请告诉我您想了解的设备、服务或订单信息。</div></div><button type="button" onClick={() => setConnected(true)} className="mt-4 h-11 w-full rounded-md bg-brand-red text-[14px] font-medium text-white">{connected ? '已接入客服' : '转接客服'}</button><button type="button" onClick={onBack} className="mt-2 h-10 w-full rounded-md border border-gray-200 text-[13px] text-gray-600">返回服务方向</button></div>;
};

const FEEDBACK_TYPES = ['咨询', '建议', '投诉', 'APP功能', '其他'];
const FEEDBACK_SUBJECTS = ['配件', '服务', '产品', '营销', '其他'];

const ComplaintForm = ({ onBack }) => {
  const [feedbackType, setFeedbackType] = useState('建议');
  const [subject, setSubject] = useState('服务');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const contactValid = /^(1\d{10}|[^\s@]+@[^\s@]+\.[^\s@]+)$/.test(contact.trim());
  const valid = content.trim() && contactValid;
  if (submitted) return <div className="mt-6 rounded-xl border border-[#e8ecef] bg-white p-6 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf8f1] text-[#25895a]"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 4 4L19 6" /></svg></div><h2 className="mt-4 text-[16px] font-semibold text-[#252b33]">反馈已提交</h2><p className="mt-2 text-[12px] leading-5 text-[#6f7884]">我们会在 1 个工作日内通过您留下的联系方式回复，可在“历史反馈”中查看进度。</p><button type="button" onClick={onBack} className="mt-5 h-10 w-full rounded-lg bg-brand-red text-[13px] font-medium text-white">返回客户心声</button></div>;
  const SectionTitle = ({ index, children }) => <div className="flex items-center gap-2.5 border-b border-[#edf0f2] px-4 py-3"><span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#fff0ee] text-[10px] font-semibold text-brand-red">{index}</span><h2 className="min-w-0 break-words text-[14px] font-semibold leading-5 text-[#252b33]">{children}</h2></div>;
  const Choice = ({ active, children, onClick }) => <button type="button" aria-pressed={active} onClick={onClick} className={`min-h-8 max-w-full rounded-md border px-3 py-1.5 text-[12px] leading-4 transition-colors ${active ? 'border-[#252b33] bg-[#252b33] text-white' : 'border-[#e4e7ea] bg-white text-[#5c6470] active:bg-[#f5f6f8]'}`}>{children}</button>;
  return <div className="mt-3 pb-7">
    <div className="mb-4 rounded-xl border border-[#e8ecef] bg-white px-4 py-3.5"><div className="flex items-start gap-3"><span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[#fff0ee] text-brand-red"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 3.5 7.5v5c0 4.3 3.7 7.1 8.5 8.5 4.8-1.4 8.5-4.2 8.5-8.5v-5L12 3Z" /><path d="M12 8v4M12 16h.01" /></svg></span><div className="min-w-0"><h2 className="break-words text-[15px] font-semibold leading-5 text-[#252b33]">告诉我们哪里需要改进</h2><p className="mt-1 break-words text-[11px] leading-4 text-[#7d8590]">留下问题和联系方式，方便服务团队跟进。</p></div></div></div>

    <section className="overflow-hidden rounded-xl border border-[#e8ecef] bg-white">
      <SectionTitle index="1">问题分类</SectionTitle>
      <div className="px-4 py-4"><div className="mb-2.5 text-[12px] font-medium text-[#4d5560]"><span className="mr-1 text-brand-red">*</span>反馈类型</div><div className="flex flex-wrap gap-2">{FEEDBACK_TYPES.map((item) => <Choice key={item} active={feedbackType === item} onClick={() => setFeedbackType(item)}>{item}</Choice>)}</div></div>
    </section>

    <section className="mt-3 overflow-hidden rounded-xl border border-[#e8ecef] bg-white">
      <SectionTitle index="2">问题描述</SectionTitle>
      <div className="space-y-5 px-4 py-4"><div><div className="mb-2.5 text-[12px] font-medium text-[#4d5560]"><span className="mr-1 text-brand-red">*</span>内容</div><div className="relative overflow-hidden rounded-lg border border-transparent bg-[#f5f6f8] transition-colors focus-within:border-[#e6a4a1] focus-within:bg-white"><textarea value={content} onChange={(event) => setContent(event.target.value.slice(0, 500))} placeholder="请描述您遇到的问题、发生场景或您的建议" className="h-28 w-full resize-none bg-transparent p-3 text-[13px] leading-5 text-[#303640] outline-none placeholder:text-[#a5abb5]" /><span className="absolute bottom-2 right-3 text-[10px] text-[#a5abb5]">{content.length}/500</span></div></div><div><div className="mb-2.5 flex flex-wrap items-center justify-between gap-2"><span className="text-[12px] font-medium text-[#4d5560]">图片说明</span><span className="text-[10px] text-[#a5abb5]">最多 9 张</span></div><button type="button" aria-label="添加图片" className="flex h-[76px] w-[76px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#cfd4db] bg-[#fafbfc] text-[#7c8590] active:bg-[#f2f3f5]"><svg width="22" height="22px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" /></svg><span className="text-[10px]">添加图片</span></button></div></div>
    </section>

    <section className="mt-3 overflow-hidden rounded-xl border border-[#e8ecef] bg-white">
      <SectionTitle index="3">关联信息</SectionTitle>
      <div className="px-4 py-4"><div><div className="mb-2.5 text-[12px] font-medium text-[#4d5560]"><span className="mr-1 text-brand-red">*</span>主题</div><div className="flex flex-wrap gap-2">{FEEDBACK_SUBJECTS.map((item) => <Choice key={item} active={subject === item} onClick={() => setSubject(item)}>{item}</Choice>)}</div></div><div className="mt-5 border-t border-[#edf0f2] pt-4"><div className="mb-2.5 flex flex-wrap items-center gap-1"><span className="text-[12px] font-medium text-[#4d5560]">相关设备</span><span className="text-[10px] text-[#a5abb5]">选填</span></div><button type="button" className="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border border-transparent bg-[#f5f6f8] px-3 text-left text-[12px] text-[#7c8590] active:bg-[#eceef1]"><span className="min-w-0 break-words">选择关联设备</span><span className="flex-none text-[#a2a8b0]"><Arrow /></span></button></div><div className="mt-5 border-t border-[#edf0f2] pt-4"><label className="mb-2.5 block text-[12px] font-medium text-[#4d5560]"><span className="mr-1 text-brand-red">*</span>联系方式</label><input value={contact} onChange={(event) => setContact(event.target.value)} type="text" inputMode="email" autoComplete="email tel" placeholder="手机号或邮箱，用于接收处理进度" className="h-10 w-full rounded-lg border border-transparent bg-[#f5f6f8] px-3 text-[12px] text-[#303640] outline-none placeholder:text-[#a5abb5] focus:border-[#e6a4a1] focus:bg-white" /></div></div>
    </section>

    <div className="mt-5"><button type="button" disabled={!valid} onClick={() => setSubmitted(true)} className="h-11 w-full rounded-lg bg-brand-red text-[14px] font-medium text-white shadow-[0_5px_12px_rgba(188,0,15,0.16)] disabled:bg-[#f6bbbb] disabled:shadow-none">提交反馈</button><p className="mt-3 break-words text-center text-[10px] leading-4 text-[#a5abb5]">仅用于处理本次反馈，不会用于其他营销联系</p></div>
  </div>;
};

export const CustomerVoice = ({ onBack, onInquiry }) => {
  const [selected, setSelected] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const selectService = (id) => {
    const target = SERVICE_OPTIONS.find((item) => item.id === id);
    trackLeadIntent.serviceEntryClick(id, 'customer_voice');
    if (id === 'inquiry') {
      onInquiry?.({ service: target.title });
      return;
    }
    setSelected(id);
  };
  if (showHistory) return <div dir="auto" className="relative h-full overflow-y-auto bg-[#f5f6f8] pb-6"><div className="bg-white px-5 pb-4 pt-3"><div className="flex items-center"><BackButton onClick={() => setShowHistory(false)} /><h1 className="flex-1 text-center text-[18px] font-semibold text-gray-900">历史反馈</h1><span className="w-9" /></div></div><div className="space-y-3 px-5 pt-4"><div className="rounded-lg bg-white p-3 shadow-[0_1px_3px_rgba(31,41,55,0.05)]"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[13px] font-semibold text-gray-900">服务 · 建议</span><span className="rounded-full bg-[#fff4dd] px-2 py-1 text-[10px] text-[#9a6b16]">处理中</span></div><p className="mt-2 text-[12px] leading-5 text-gray-600">希望增加设备保养提醒的提前通知。</p><div className="mt-2 text-[11px] text-gray-400">2026-08-28 · 工单 SV-20260828031</div></div><div className="rounded-lg bg-white p-3 shadow-[0_1px_3px_rgba(31,41,55,0.05)]"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[13px] font-semibold text-gray-900">APP功能 · 咨询</span><span className="rounded-full bg-green-50 px-2 py-1 text-[10px] text-green-600">已回复</span></div><p className="mt-2 text-[12px] leading-5 text-gray-600">如何查看周报中的平均电耗？</p><div className="mt-2 text-[11px] text-gray-400">2026-08-19 · 工单 SV-20260819018</div></div></div></div>;
  return <div dir="auto" className="relative h-full overflow-y-auto bg-[#f4f5f7] pb-6">
    <div className="bg-white px-4 pb-3 pt-3">
      <div className="flex items-center"><BackButton onClick={selected ? () => setSelected(null) : onBack} /><h1 className="min-w-0 flex-1 break-words text-center text-[18px] font-semibold leading-6 text-[#1f242b]">客户心声</h1>{selected ? <span className="w-9 flex-none" /> : <button type="button" onClick={() => setShowHistory(true)} className="flex h-9 min-w-9 flex-none items-center justify-end gap-1 text-[12px] text-[#4f5763]"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5M12 7v5l3 2" /></svg><span>记录</span></button>}</div>
    </div>
    {!selected && <>
      <section className="relative overflow-hidden bg-[#242a32] px-5 pb-5 pt-4 text-white">
        <div className="absolute bottom-0 left-0 h-1 w-[72px] bg-brand-red" />
        <div className="flex items-center justify-between gap-4"><div className="min-w-0 flex-1 [overflow-wrap:anywhere]"><div className="text-[11px] text-white/60">SANY CUSTOMER CARE</div><h2 className="mt-1.5 text-[20px] font-semibold leading-7">需要哪类帮助？</h2><p className="mt-1 text-[12px] leading-5 text-white/65">选择服务场景，我们会为您匹配对应团队</p></div><div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-white/10 text-white"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 14a8 8 0 0 1 16 0" /><path d="M18 19c0 1.1-.9 2-2 2h-3" /><path d="M4 14v3a2 2 0 0 0 2 2h1v-7H6a2 2 0 0 0-2 2ZM20 14v3a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2Z" /></svg></div></div>
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-4 text-white/70"><span className="h-1.5 w-1.5 flex-none rounded-full bg-[#36c783]" /><span>客服在线</span><span className="text-white/25">|</span><span>全天候服务支持，支持多语言咨询</span></div>
      </section>

      <div className="px-4 pt-5">
        <div className="mb-2.5"><div className="text-[15px] font-semibold text-[#242a32]">在线客服</div></div>
        <div className="overflow-hidden rounded-lg bg-white shadow-[0_3px_14px_rgba(31,39,50,0.055)]">{SERVICE_OPTIONS.slice(0, 2).map((item, index) => <button key={item.id} type="button" onClick={() => selectService(item.id)} className={`flex w-full items-center gap-3 px-4 py-4 text-left active:bg-gray-50 ${index === 0 ? 'border-b border-[#eef0f2]' : ''}`}><span className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ${item.id === 'preSales' ? 'bg-[#fff0ee] text-brand-red' : 'bg-[#edf5fb] text-[#3478a7]'}`}><ServiceIcon type={item.id} /></span><span className="min-w-0 flex-1 [overflow-wrap:anywhere]"><span className="flex flex-wrap items-center gap-x-2 gap-y-1"><strong className="min-w-0 text-[14px] font-semibold leading-5 text-[#252b33]">{item.title}</strong></span><span className="mt-1 block text-[11px] leading-4 text-[#7d8590]">{item.description}</span></span><span className="flex-none text-[#bdc2c9]"><Arrow /></span></button>)}</div>

        <div className="mb-2.5 mt-5"><div className="text-[15px] font-semibold text-[#242a32]">业务办理</div></div>
        <div className="overflow-hidden rounded-lg bg-white shadow-[0_3px_14px_rgba(31,39,50,0.055)]">{SERVICE_OPTIONS.slice(2).map((item, index) => <button key={item.id} type="button" onClick={() => selectService(item.id)} className={`flex w-full items-center gap-3 px-4 py-4 text-left active:bg-gray-50 ${index === 0 ? 'border-b border-[#eef0f2]' : ''}`}><span className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ${item.id === 'inquiry' ? 'bg-[#fff1ee] text-brand-red' : 'bg-[#f1f2f4] text-[#555e69]'}`}><ServiceIcon type={item.id} /></span><span className="min-w-0 flex-1 [overflow-wrap:anywhere]"><span className="flex flex-wrap items-center gap-x-2 gap-y-1"><strong className="min-w-0 text-[14px] font-semibold leading-5 text-[#252b33]">{item.title}</strong>{item.id === 'inquiry' && <span className="max-w-full rounded-sm bg-brand-red px-1.5 py-0.5 text-[9px] leading-3 text-white">快速响应</span>}</span><span className="mt-1 block text-[11px] leading-4 text-[#7d8590]">{item.description}</span></span><span className="flex-none text-[#bdc2c9]"><Arrow /></span></button>)}</div>

      </div>
    </>}
    {selected === 'preSales' && <div className="px-5"><ConversationPanel kind="preSales" onBack={() => setSelected(null)} /></div>}
    {selected === 'afterSales' && <div className="px-5"><ConversationPanel kind="afterSales" onBack={() => setSelected(null)} /></div>}
    {selected === 'complaint' && <div className="px-5"><ComplaintForm onBack={() => setSelected(null)} /></div>}
  </div>;
};

export const InquiryForm = ({ onBack, context = {}, onSubmit }) => {
  const [form, setForm] = useState({ name: '', mobile: '', model: context.model || '', need: '' });
  const [submitted, setSubmitted] = useState(false);
  const valid = form.name.trim() && /^1\d{10}$/.test(form.mobile) && form.model.trim();
  const update = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));
  const submit = () => {
    if (!valid) return;
    onSubmit?.({ ...context, ...form });
    setSubmitted(true);
  };
  if (submitted) return <div className="flex h-full flex-col bg-white px-6 pt-4"><div className="flex items-center"><BackButton onClick={onBack} /><h1 className="flex-1 text-center text-[18px] font-semibold text-gray-900">Inquiry</h1><span className="w-9" /></div><div className="mt-20 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 4 4L19 6" /></svg></div><h2 className="mt-5 text-[18px] font-semibold text-gray-900">需求已提交</h2><p className="mt-3 text-[13px] leading-5 text-gray-500">已进入 MOSS 清洗队列，将由对应销售团队跟进。</p><button type="button" onClick={onBack} className="mt-8 h-11 w-full rounded-md bg-brand-red text-[14px] font-medium text-white">返回首页</button></div></div>;
  return <div className="h-full overflow-y-auto bg-white px-5 pb-6 pt-4"><div className="flex items-center"><BackButton onClick={onBack} /><h1 className="flex-1 text-center text-[18px] font-semibold text-gray-900">Inquiry</h1><span className="w-9" /></div><div className="mt-6 space-y-5"><label className="block text-[14px] font-semibold text-gray-900">姓名<input value={form.name} onChange={update('name')} placeholder="请输入联系人姓名" className="mt-2 h-11 w-full rounded-md bg-[#f5f6f8] px-3 text-[14px] font-normal outline-none placeholder:text-gray-400" /></label><label className="block text-[14px] font-semibold text-gray-900">手机号码<input value={form.mobile} onChange={update('mobile')} inputMode="numeric" maxLength="11" placeholder="用于销售团队联系" className="mt-2 h-11 w-full rounded-md bg-[#f5f6f8] px-3 text-[14px] font-normal outline-none placeholder:text-gray-400" /></label><label className="block text-[14px] font-semibold text-gray-900">意向机型<input value={form.model} onChange={update('model')} placeholder="例如：SY365H" className="mt-2 h-11 w-full rounded-md bg-[#f5f6f8] px-3 text-[14px] font-normal outline-none placeholder:text-gray-400" /></label><label className="block text-[14px] font-semibold text-gray-900">需求说明<textarea value={form.need} onChange={update('need')} placeholder="选填：使用场景、数量、计划采购时间" className="mt-2 h-24 w-full resize-none rounded-md bg-[#f5f6f8] p-3 text-[14px] font-normal outline-none placeholder:text-gray-400" /></label></div><button type="button" disabled={!valid} onClick={submit} className="mt-7 h-12 w-full rounded-md bg-brand-red text-[15px] font-medium text-white disabled:bg-red-200">提交 Inquiry</button><p className="mt-3 text-center text-[11px] leading-4 text-gray-400">提交即表示同意销售团队通过电话与您沟通。</p></div>;
};

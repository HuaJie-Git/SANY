import React, { useMemo, useState } from 'react';
import IconFont from '../../components/IconFont/IconFont';

const Icon = ({ type, size = 22 }) => {
  const iconMap = { behavior: 'chart', fuel: 'fuel', back: null, left: null, right: null };
  if (iconMap[type]) return <IconFont name={iconMap[type]} size={size} />;
  const paths = {
    behavior: <><path d="M4 18V6M4 18h16"/><path d="m7 14 3-4 3 2 4-6"/></>,
    fuel: <><path d="M7 20V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15"/><path d="M7 8h10M10 12h4"/><path d="M18 7h2l2 3v6a2 2 0 0 1-4 0V9"/></>,
    back: <path d="m15 18-6-6 6-6"/>,
    left: <path d="m14 17-5-5 5-5"/>,
    right: <path d="m10 7 5 5-5 5"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
};

const Header = ({ title, onBack }) => (
  <header className="sticky top-0 z-20 flex h-[52px] items-center bg-[#f1f3f7]/95 px-3 backdrop-blur-sm">
    <button type="button" onClick={onBack} aria-label="返回" className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5"><Icon type="back" size={22} /></button>
    <h1 className="flex-1 px-2 text-[16px] font-medium text-[#252b33]">{title}</h1>
  </header>
);

const Card = ({ icon, title, onClick }) => (
  <button type="button" onClick={onClick} className="flex w-full items-center rounded-[14px] bg-white px-4 py-4 text-left shadow-[0_1px_2px_rgba(31,41,55,0.05)] active:bg-gray-50">
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0f1f3] text-[#252b33]"><Icon type={icon} size={24} /></span>
    <span className="ml-3 min-w-0 flex-1"><span className="block text-[15px] font-medium text-[#252b33]">{title}</span><span className="mt-1 block text-[11px] text-[#9aa1ab]">近7日数据</span></span>
    <span className="rounded-full bg-[#f1f2f4] px-3 py-1.5 text-[11px] text-[#6d7480]">开始分析</span>
  </button>
);

const DatePicker = ({ date, onPrev, onNext }) => (
  <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 shadow-sm">
    <button type="button" onClick={onPrev} aria-label="前一天" className="flex h-8 w-8 items-center justify-center rounded-full text-[#7c8490] active:bg-gray-100"><Icon type="left" size={18} /></button>
    <span className="text-[14px] font-medium text-[#252b33]">{date}</span>
    <button type="button" onClick={onNext} aria-label="后一天" className="flex h-8 w-8 items-center justify-center rounded-full text-[#7c8490] active:bg-gray-100"><Icon type="right" size={18} /></button>
  </div>
);

const DailyTimeline = ({ detail = false }) => {
  const days = detail ? ['8/28', '8/29', '8/30', '8/31', '9/1', '9/2', '9/3'] : ['00', '04', '08', '12', '16', '20', '24'];
  const bars = detail ? [
    [0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,2,2,0,0], [0,1,1,1,2,2,0,0,0,0], [0,1,1,2,2,0,0,0,0,0], [0,1,1,0,0,0,0,0,0,0],
  ] : [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0];
  const renderBar = (value, index) => {
    const color = value === 1 ? '#3b82f6' : value === 2 ? '#f3c84b' : '#dfe2e6';
    return <span key={`${index}-${value}`} className="block h-full flex-1" style={{ backgroundColor: color }} />;
  };
  return <div className="mt-4"><div className="flex justify-between text-[9px] text-[#8c939e]">{days.map((day) => <span key={day}>{day}</span>)}</div>{detail ? bars.map((bar, index) => <div key={index} className="mt-1.5 flex h-2.5 overflow-hidden rounded-sm">{bar.map(renderBar)}</div>) : <div className="mt-1.5 flex h-2.5 overflow-hidden rounded-sm">{bars.map(renderBar)}</div>}<div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] text-[#777f8b]"><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-[#3b82f6]" />实际操作时长</span><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-[#f3c84b]" />无动作时长</span><span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-[#dfe2e6]" />关机时长</span></div></div>;
};

const GearChart = () => (
  <div className="relative mt-3 h-[170px] pl-7 pb-5">
    <div className="absolute bottom-5 left-0 top-1 flex flex-col justify-between text-[9px] text-[#8c939e]"><span>11</span><span>9</span><span>7</span><span>5</span><span>3</span><span>1</span></div>
    {[4, 36, 68, 100, 132].map((top) => <div key={top} className="absolute left-7 right-0 h-px bg-[#edf0f4]" style={{ top }} />)}
    <svg className="absolute bottom-5 left-7 right-0 h-[138px] w-[calc(100%_-_1.75rem)]" viewBox="0 0 300 138" preserveAspectRatio="none"><path d="M0 126H30V105H70V105H95V85H130V85H165V62H200V62H226V38H260V38H300V25" fill="none" stroke="#e53935" strokeWidth="2.5" /><g fill="#e53935" stroke="#fff" strokeWidth="1.5"><circle cx="30" cy="105" r="3"/><circle cx="95" cy="85" r="3"/><circle cx="165" cy="62" r="3"/><circle cx="226" cy="38" r="3"/><circle cx="300" cy="25" r="3"/></g></svg>
    <div className="absolute bottom-0 left-7 right-0 flex justify-between text-[9px] text-[#7d8491]"><span>00:10</span><span>04:00</span><span>06:00</span><span>09:50</span><span>13:40</span><span>16:35</span><span>16:55</span></div>
  </div>
);

const FuelLevel = () => (
  <div className="relative mt-3 h-[150px] pl-7 pb-5"><div className="absolute bottom-5 left-0 top-1 flex flex-col justify-between text-[9px] text-[#8c939e]"><span>30</span><span>28</span><span>26</span><span>24</span><span>22</span></div>{[4,36,68,100].map((top) => <div key={top} className="absolute left-7 right-0 h-px bg-[#edf0f4]" style={{ top }} />)}<svg className="absolute bottom-5 left-7 right-0 h-[110px] w-[calc(100%_-_1.75rem)]" viewBox="0 0 300 110" preserveAspectRatio="none"><path d="M0 20H90L110 36H170L190 50H230L250 68H300V110H0Z" fill="#ffb35c" fillOpacity=".45"/><path d="M0 20H90L110 36H170L190 50H230L250 68H300" fill="none" stroke="#ff7600" strokeWidth="2"/></svg><div className="absolute bottom-0 left-7 right-0 flex justify-between text-[9px] text-[#7d8491]"><span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>24:00</span></div></div>
);

const Donut = () => <div className="mt-4 flex items-center justify-center gap-7"><div className="relative h-32 w-32 rounded-full" style={{ background: 'conic-gradient(#3b82f6 0 72%, #f3c84b 72% 100%)' }}><div className="absolute inset-5 flex items-center justify-center rounded-full bg-white text-[11px] text-[#7a8290]">档位用时</div></div><div className="space-y-2 text-[11px] text-[#606873]"><div className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-[#3b82f6]" />1档：0.18（72%）</div><div className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-[#f3c84b]" />9档：0.07（28%）</div></div></div>;

const AnalysisHome = ({ onBack, onOpen }) => <div className="min-h-full bg-[#f1f3f7]"><Header title="数据分析" onBack={onBack} /><main className="space-y-3 px-3 pb-8 pt-3"><Card icon="behavior" title="操作行为分析" onClick={() => onOpen('behavior')} /><Card icon="fuel" title="油耗分析" onClick={() => onOpen('fuel')} /></main></div>;

const BehaviorDetail = ({ onBack }) => <div className="min-h-full bg-[#f1f3f7]"><Header title="操作行为分析" onBack={onBack} /><main className="space-y-3 px-3 pb-8 pt-3"><section className="rounded-[14px] bg-white p-4 shadow-sm"><h2 className="text-[15px] font-semibold">开机时段分析</h2><DailyTimeline detail /><p className="mt-4 rounded-lg bg-[#fff7e8] px-3 py-2.5 text-[11px] leading-5 text-[#896b2b]">无动作时长占比非常高，在等待时间或短暂休息时停止发动机可以大大降低油耗。此外，机械或电气故障可能是导致非操作时间较长的原因。</p></section><section className="rounded-[14px] bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-[15px] font-semibold">操作行为分析</h2><DatePicker date="2026-09-03" onPrev={() => {}} onNext={() => {}} /></div><div className="mt-3 text-[11px] text-[#9299a8]">档位</div><GearChart /><div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-[#666]"><i className="h-2 w-2 rounded-full bg-[#e53935]" />档位</div></section></main></div>;

const FuelDetail = ({ onBack }) => <div className="min-h-full bg-[#f1f3f7]"><Header title="油耗分析" onBack={onBack} /><main className="space-y-3 px-3 pb-8 pt-3"><section className="rounded-[14px] bg-white p-4 shadow-sm"><h2 className="text-[15px] font-semibold">油位变动分析</h2><DatePicker date="2026-09-03" onPrev={() => {}} onNext={() => {}} /><div className="mt-5 grid grid-cols-2 gap-5"><div><div className="text-[23px]">0.01<span className="ml-1 text-[12px]">h</span></div><div className="mt-1 text-[11px] text-[#7a8290]">当日总工时</div></div><div><div className="text-[23px]">0.01<span className="ml-1 text-[12px]">h</span></div><div className="mt-1 text-[11px] text-[#7a8290]">当日无动作工时</div></div></div><DailyTimeline /><div className="mt-5 text-[11px] text-[#9198a4]">油位/L</div><FuelLevel /></section><section className="rounded-[14px] bg-white p-4 shadow-sm"><h2 className="text-[15px] font-semibold">档位用时分布</h2><Donut /></section></main></div>;

const DataAnalysis = ({ onBack, initialView = null }) => { const [view, setView] = useState(initialView); const page = useMemo(() => view === 'behavior' ? <BehaviorDetail onBack={() => setView(null)} /> : view === 'fuel' ? <FuelDetail onBack={() => setView(null)} /> : <AnalysisHome onBack={onBack} onOpen={setView} />, [view, onBack]); return page; };

export default DataAnalysis;

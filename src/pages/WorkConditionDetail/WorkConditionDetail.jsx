import React, { useMemo, useRef, useState } from 'react';
import FuelLevelChart from '../../components/FuelLevelChart/FuelLevelChart';

const MACHINE_DATA = {
  '三一平地机': {
    supportsTrajectory: false,
    model: 'SMG200',
    plate: '湘A · SMG200',
    status: '行驶',
    realtime: [
      ['设备状态', '行驶'],
      ['水温', '80', '°C'],
      ['发动机转速', '1,480', 'r/min'],
      ['机油压力', '2.3', 'Bar'],
      ['当前油位', '70', '%'],
    ],
    today: [['怠速工时', '1.2', 'h'], ['工作时长', '7.5', 'h']],
    cumulative: [['总油耗', '200', 'L'], ['总工作时间', '2,000', 'H']],
  },
  '三一压路机': {
    supportsTrajectory: false,
    model: 'SSR260',
    plate: '湘A · SSR260',
    status: '离线',
    realtime: [
      ['设备状态', '离线'],
      ['水温', '68', '°C'],
      ['发动机转速', '0', 'r/min'],
      ['当前油位', '48.6', '%'],
    ],
    today: [['怠速工时', '0.8', 'h'], ['工作时长', '5.6', 'h']],
    cumulative: [['总油耗', '168', 'L'], ['总工作时间', '1,620', 'H']],
  },
  '三一摊铺机': {
    model: 'SSP130C-10',
    plate: '湘A · SMP130',
    status: '行驶',
    realtime: [
      ['设备状态', '行驶'],
      ['车速', '6.2', 'm/min'],
      ['摊铺距离', '12,680', 'm'],
      ['水温', '80', '°C'],
      ['发动机转速', '1,560', 'r/min'],
      ['机油压力', '2.3', 'Bar'],
      ['振捣设定值', '70.1', 'HZ'],
      ['当前油位', '70', '%'],
    ],
    today: [['怠速工时', '1.5', 'h'], ['工作时长', '7.5', 'h']],
    cumulative: [['摊铺距离', '12,680', 'm'], ['总油耗', '200', 'L'], ['总工作小时', '2,000', 'H']],
  },
};

const Icon = ({ type, size = 20 }) => {
  const paths = {
    /* 数据报表：屏幕/趋势图 */
    report: <><rect x="3" y="4" width="18" height="13" rx="2" strokeWidth="1.6"/><path d="M8 20h8" strokeWidth="1.6"/><path d="M12 17v3" strokeWidth="1.6"/><path d="M7 12l3-3 3 2 4-4" strokeWidth="1.6" strokeLinejoin="round"/></>,
    /* 零部件图册：书本+齿轮 */
    parts: <><path d="M4 4h5l2 2h9V19H4z" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="13" r="3" strokeWidth="1.4"/><path d="M12 10v-1M12 17v-1M9.5 11.5l-.7-.7M15.2 15.2l-.7-.7M9.5 14.5l-.7.7M15.2 10.8l-.7.7" strokeWidth="1.2"/></>,
    /* 自助服务：书本+放大镜 */
    service: <><path d="M4 4h5l2 2h9V19H4z" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="13" r="3.5" strokeWidth="1.4"/><path d="M14.5 15.5l2 2" strokeWidth="1.4"/></>,
    /* 更多操作：四宫格（三实心一描边） */
    grid: <><rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor" stroke="currentColor" strokeWidth="1.2"/><rect x="13" y="3" width="8" height="8" rx="1.5" fill="currentColor" stroke="currentColor" strokeWidth="1.2"/><rect x="3" y="13" width="8" height="8" rx="1.5" fill="currentColor" stroke="currentColor" strokeWidth="1.2"/><rect x="13" y="13" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></>,
    nav: <path d="m4 11 16-7-7 16-2-7-7-2Z"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
};

const Metric = ({ item }) => {
  const [label, value, unit] = item;
  return (
    <div className="min-w-0">
      <div className="flex items-baseline gap-1 text-[#303640]">
        <span className="text-[23px] font-normal leading-none tracking-[-0.4px]">{value}</span>
        {unit && <span className="text-[12px] font-medium">{unit}</span>}
      </div>
      <div className="mt-2 text-[12px] leading-[16px] text-[#7a8290]">{label}</div>
    </div>
  );
};

const WorkTimeline = () => (
  <div className="mt-5">
    <div className="flex justify-between px-1 text-[9px] text-[#7d8491]">
      {[0, 4, 8, 12, 16, 20, '24(h)'].map((time) => <span key={time}>{time}</span>)}
    </div>
    <div className="mt-1.5 h-[10px] overflow-hidden rounded-sm bg-[#d9dde5] flex">
      <div className="w-[16%]" />
      <div className="w-[27%] bg-[#1768d7]" />
      <div className="w-[4%] bg-[#f5bd00]" />
      <div className="w-[12%]" />
      <div className="w-[25%] bg-[#1768d7]" />
    </div>
  </div>
);

const WorkConditionDetail = ({ device, onBack, onNavigate }) => {
  const [hint, setHint] = useState('');
  const timerRef = useRef(null);
  const data = MACHINE_DATA[device?.name] || MACHINE_DATA['三一平地机'];
  const reportTime = '2026-07-24 12:00:23';
  const fuelLevel = useMemo(() => data.realtime.find(([label]) => label === '当前油位')?.[1] || '70', [data]);

  const showHint = (label) => {
    window.clearTimeout(timerRef.current);
    setHint(`${label}功能演示`);
    timerRef.current = window.setTimeout(() => setHint(''), 1400);
  };

  return (
    <div className="relative min-h-full bg-[#f1f3f7] text-[#252b33]">
      <header className="sticky top-0 z-20 bg-[#f1f3f7]/95 backdrop-blur-sm">
        <div className="h-[52px] px-3 flex items-center">
          <button type="button" onClick={onBack} aria-label="返回资产列表" className="h-9 w-9 flex items-center justify-center rounded-full active:bg-black/5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#252b33" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex-1 truncate px-2 text-[15px] font-medium">{device?.code}</div>
          <button type="button" aria-label="更多操作" onClick={() => showHint('更多')} className="h-9 w-9 flex items-center justify-center text-[20px] tracking-[2px]">•••</button>
        </div>
        <div className="pb-3 text-center text-[11px] text-[#9299a8]">工况上传时间：{reportTime}</div>
      </header>

      <main className="px-3 pb-8 space-y-3.5">
        <section className="rounded-[14px] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
          <div className="flex gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2 text-[14px] font-medium"><span className="truncate">{device?.code}</span><span className="text-[12px]">✎</span></div>
              <div className="text-[13px] text-[#444b55]">{data.plate} <span className="ml-1">✎</span></div>
              <div className="flex items-center gap-2 text-[12px] text-[#4c535c]"><Icon type="pin" size={16}/><span className="truncate">湖南省长沙市宁乡经开区</span></div>
              <div className="flex items-center gap-2 text-[12px] text-[#4c535c]"><Icon type="clock" size={16}/><span>{reportTime}</span></div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <div className="h-[43px] w-[64px] overflow-hidden rounded bg-[#eef0f2]"><img src={device?.image} alt={device?.name} className="h-full w-full object-contain" /></div>
              {data.supportsTrajectory !== false && (
                <button type="button" aria-label="行驶轨迹" onClick={() => showHint('行驶轨迹')} className="h-10 w-10 rounded-full border border-[#76a9ff] text-[#2377f3] flex items-center justify-center active:bg-blue-50"><Icon type="nav" /></button>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[["report", "数据报表", () => onNavigate?.('dataReport')], ["parts", "零部件图册", () => showHint('零部件图册')], ["service", "自助服务", () => showHint('自助服务')], ["grid", "更多操作", () => showHint('更多操作')]].map(([icon, label, fn]) => (
              <button key={label} type="button" onClick={fn} className="h-[76px] rounded-[12px] border border-[#aeb5bf] flex flex-col items-center justify-center gap-1.5 text-[#303640] active:bg-gray-50"><Icon type={icon}/><span className="text-[11px] text-[#68707d] leading-tight">{label}</span></button>
            ))}
          </div>
        </section>

        <section className="rounded-[16px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
          <h2 className="text-[16px] font-semibold">实时工况</h2>
          <div className="mt-1 text-[11px] text-[#656d78]">{reportTime}</div>
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-7">{data.realtime.map((item) => <Metric key={item[0]} item={item} />)}</div>
        </section>

        <section className="rounded-[14px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
          <div className="flex items-center gap-1.5"><h2 className="text-[16px] font-semibold">今日数据</h2><span className="h-4 w-4 rounded-full bg-[#303640] text-center text-[10px] leading-4 text-white">?</span></div>
          <div className="mt-7 grid grid-cols-2 gap-6">{data.today.map((item) => <Metric key={item[0]} item={item} />)}</div>
          <WorkTimeline />
          <FuelLevelChart level={fuelLevel} />
        </section>

        <section className="rounded-[14px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
          <h2 className="text-[16px] font-semibold">累计数据</h2>
          <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-7">{data.cumulative.map((item) => <Metric key={item[0]} item={item} />)}</div>
        </section>
      </main>

      {hint && <div role="status" className="absolute left-1/2 top-[45%] z-50 -translate-x-1/2 rounded-lg bg-black/75 px-4 py-2 text-[12px] text-white">{hint}</div>}
    </div>
  );
};

export default WorkConditionDetail;

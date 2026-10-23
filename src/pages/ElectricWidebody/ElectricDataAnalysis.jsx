import React, { useState, useMemo } from 'react';
import IconFont from '../../components/IconFont/IconFont';
import { getOperationsData, validateDateRange } from './electricWidebodyData';
import { useWidebodyState } from './useWidebodyState';
import ElectricChargingData from './ElectricChargingData';
import { isFuelWidebody, getFuelOperationsData } from './fuelWidebodyData';
import { BilingualLabel } from './WidebodyBilingual';

const Icon = ({ type, size = 22, className = '' }) => {
  const iconMap = { behavior: 'chart', fuel: 'fuel', back: null, left: null, right: null };
  if (iconMap[type]) return <IconFont name={iconMap[type]} size={size} className={className} />;
  const paths = {
    behavior: <><path d="M4 18V6M4 18h16"/><path d="m7 14 3-4 3 2 4-6"/></>,
    fuel: <><path d="M7 20V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15"/><path d="M7 8h10M10 12h4"/><path d="M18 7h2l2 3v6a2 2 0 0 1-4 0V9"/></>,
    energy: <path d="M13 2 3 14h8l-1 8 11-12h-8l1-8Z" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>,
    charging: <><rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="1.6"/><path d="M12 7v4l-2 2h4l-2 3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 1h6" strokeWidth="1.6" strokeLinecap="round"/></>,
    ops: <><rect x="3" y="4" width="18" height="13" rx="2" strokeWidth="1.6"/><path d="M8 20h8" strokeWidth="1.6"/><path d="M12 17v3" strokeWidth="1.6"/><path d="M7 12l3-3 3 2 4-4" strokeWidth="1.6" strokeLinejoin="round"/></>,
    back: <path d="m15 18-6-6 6-6"/>,
    left: <path d="m14 17-5-5 5-5"/>,
    right: <path d="m10 7 5 5-5 5"/>,
  };
  const isRtl = type === 'back' || type === 'left' || type === 'right';
  const rtlClass = isRtl ? 'rtl:rotate-180' : '';
  const combinedClass = [rtlClass, className].filter(Boolean).join(' ');
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={combinedClass || undefined}>
      {paths[type] || paths.behavior}
    </svg>
  );
};

const Header = ({ title, onBack, subtitle }) => (
  <header className="sticky top-0 z-20 flex min-h-[52px] py-2 items-center bg-[#f1f3f7]/95 px-3 backdrop-blur-sm">
    <button
      type="button"
      onClick={onBack}
      aria-label="返回"
      className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5 shrink-0"
    >
      <Icon type="back" size={22} />
    </button>
    <div className="min-w-0 flex-1 px-2 text-left">
      <h1 className="text-[16px] font-medium text-[#252b33] break-words break-all">
        {typeof title === 'string' ? <BilingualLabel zh={title} size="title" /> : title}
      </h1>
      {subtitle && <p className="text-[10px] text-[#7a8290] leading-tight break-all font-mono" dir="ltr">{subtitle}</p>}
    </div>
    <div className="w-9 shrink-0" />
  </header>
);

const Card = ({ icon, title, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center rounded-[14px] bg-white px-4 py-4 text-left shadow-[0_1px_2px_rgba(31,41,55,0.05)] active:bg-gray-50 cursor-pointer"
  >
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0f1f3] text-[#252b33] shrink-0">
      <Icon type={icon} size={24} />
    </span>
    <span className="ml-3 min-w-0 flex-1">
      <BilingualLabel zh={title} size="default" />
    </span>
    <span className="rounded-full bg-[#f1f2f4] px-3 py-1.5 shrink-0">
      <BilingualLabel zh="开始分析" size="xs" align="center" />
    </span>
  </button>
);

/**
 * 车速半圆仪表组件 (DEC-012 / IMG-OPS-LATEST)
 * 180度半圆弧（灰底、黄色中段、橙色右段）、蓝色三角指针、下方数值+KM/h
 */
const SpeedGauge = ({ speed, title }) => {
  const hasSpeed = typeof speed === 'number' && !isNaN(speed);
  const clampedSpeed = hasSpeed ? Math.min(50, Math.max(0, speed)) : 0;
  const rotationDeg = (clampedSpeed / 50) * 180;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2">
        <BilingualLabel zh={title} size="sm" align="center" />
      </div>
      <div className="w-full max-w-[150px]">
        <svg viewBox="0 0 200 125" className="w-full h-auto overflow-visible" aria-hidden="true">
          <path d="M 25 105 A 75 75 0 0 1 42.55 56.79" fill="none" stroke="#dfe3e8" strokeWidth="16" />
          <path d="M 42.55 56.79 A 75 75 0 0 1 157.45 56.79" fill="none" stroke="#fbbf24" strokeWidth="16" />
          <path d="M 157.45 56.79 A 75 75 0 0 1 175 105" fill="none" stroke="#f97316" strokeWidth="16" />
          {hasSpeed && (
            <polygon
              points="18,105 65,99 65,105"
              fill="#1d68ed"
              transform={`rotate(${rotationDeg} 100 105)`}
            />
          )}
        </svg>
      </div>
      <div className="mt-2 text-[20px] font-bold text-[#252b33]" dir="ltr">
        {hasSpeed ? `${speed} km/h` : '—'}
      </div>
    </div>
  );
};

export default function ElectricDataAnalysis({ device, onBack }) {
  const isFuel = isFuelWidebody(device);

  // DEC-012 / OPS-03: 仅保留 home, operations, charging 三个视图分支，删除 energy 与 behavior
  const [analysisView, setAnalysisView] = useState('home');

  // DEC-012: 运营分析已应用日期区间，父级顶层 state 持有，返回保留
  const [opsDateRange, setOpsDateRange] = useState({
    startDate: '2023-11-23',
    endDate: '2023-11-23',
  });
  const [isOpsPopoverOpen, setIsOpsPopoverOpen] = useState(false);
  const [draftOpsStart, setDraftOpsStart] = useState('2023-11-23');
  const [draftOpsEnd, setDraftOpsEnd] = useState('2023-11-23');

  // 充电数据已应用日期区间 (REVIEW-V2-01: 提升至顶层 state，返回保留)
  const [chargingDateRange, setChargingDateRange] = useState({
    startDate: '2023-11-23',
    endDate: '2023-11-23',
  });

  // STATE-002 异常状态机 (FIX-004 / F2-04: 重试不重置日期)
  const { isOffline, hasBlockingState, renderStateOverlay } = useWidebodyState(onBack);

  // 运营日期草稿实时校验 (DEC-012 / OPS-02)
  const opsDraftValidation = useMemo(() => {
    return validateDateRange(draftOpsStart, draftOpsEnd);
  }, [draftOpsStart, draftOpsEnd]);

  // 获取当前已应用运营数据 (DEC-012 / FUEL-OPS-001)
  const opsData = useMemo(() => {
    const validation = validateDateRange(opsDateRange.startDate, opsDateRange.endDate);
    if (!validation.isValid) return null;
    if (isFuel) {
      return getFuelOperationsData(opsDateRange.startDate, opsDateRange.endDate);
    }
    if (opsDateRange.startDate === opsDateRange.endDate) {
      return getOperationsData('day', opsDateRange.startDate);
    }
    return getOperationsData('range', opsDateRange.startDate, opsDateRange.endDate);
  }, [opsDateRange.startDate, opsDateRange.endDate, isFuel]);

  // 平均循环时长：现有 avgCycleTime 为分钟，展示除 60 转换为小时，最多 2 位小数 (DEC-012 OPS-02)
  const cycleTimeHours = useMemo(() => {
    if (!opsData || typeof opsData.avgCycleTime !== 'number') return '—';
    return Number((opsData.avgCycleTime / 60).toFixed(2));
  }, [opsData]);

  // 运营日期筛选操作
  const handleToggleOpsPopover = () => {
    if (!isOpsPopoverOpen) {
      setDraftOpsStart(opsDateRange.startDate);
      setDraftOpsEnd(opsDateRange.endDate);
    }
    setIsOpsPopoverOpen(!isOpsPopoverOpen);
  };

  const handleCancelOpsFilter = () => {
    setDraftOpsStart(opsDateRange.startDate);
    setDraftOpsEnd(opsDateRange.endDate);
    setIsOpsPopoverOpen(false);
  };

  const handleApplyOpsFilter = (e) => {
    if (e) e.preventDefault();
    if (!opsDraftValidation.isValid) return;
    setOpsDateRange({
      startDate: draftOpsStart,
      endDate: draftOpsEnd,
    });
    setIsOpsPopoverOpen(false);
  };

  // 阻塞状态处理 (F2-04)
  if (hasBlockingState) {
    return (
      <div className="min-h-full bg-[#f1f3f7] text-[#252b33]" dir="auto">
        <Header title="数据分析" subtitle={device?.code || 'POPJ0841016452'} onBack={onBack} />
        {renderStateOverlay('分析数据暂无记录', '当前设备在此周期内暂无工况分析数据，可调整日期或重新加载')}
      </div>
    );
  }

  // Screen 7: 设备运营分析 (DEC-012 / IMG-OPS-LATEST 最新实机图)
  if (analysisView === 'operations') {
    return (
      <div className="min-h-full bg-[#f1f3f7] text-[#252b33]" dir="auto">
        {/* 页头仅返回+当前设备编号 (DEC-012 OPS-02: 无大标题/副编号) */}
        <header className="sticky top-0 z-20 flex min-h-[52px] py-2 items-center bg-[#f1f3f7]/95 px-3 backdrop-blur-sm border-b border-gray-200/60">
          <button
            type="button"
            onClick={() => setAnalysisView('home')}
            aria-label="返回数据分析"
            className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5 shrink-0"
          >
            <Icon type="back" size={22} />
          </button>
          <div className="min-w-0 flex-1 px-2 text-left">
            <h1 className="text-[16px] font-medium text-[#252b33] break-all">{device?.code || 'POPJ0841016452'}</h1>
          </div>
          <div className="w-9 shrink-0" />
        </header>

        {/* 离线状态提示条 (F2-04) */}
        {isOffline && (
          <div className="px-3 py-1.5 bg-[#fffbeb] border-b border-[#fde68a] text-[11px] text-[#b45309] flex items-center justify-between">
            <BilingualLabel zh="设备当前离线，以下为最后上报历史数据" size="xs" />
            <span className="font-mono text-[10px]" dir="ltr">2023-11-23 07:45</span>
          </div>
        )}

        <main className="p-3 pb-8 space-y-3.5">
          {/* 单个白色日期区间按钮及下拉弹层 (DEC-012 OPS-02) */}
          <section className="rounded-[14px] bg-white p-3.5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
            <button
              type="button"
              onClick={handleToggleOpsPopover}
              className="w-full flex items-center justify-center gap-2 text-[14px] font-medium text-[#252b33] cursor-pointer"
              aria-expanded={isOpsPopoverOpen}
            >
              <span className="font-mono" dir="ltr">
                {opsDateRange.startDate} 至 {opsDateRange.endDate}
              </span>
              <span className="text-[10px] text-[#7a8290] leading-none transition-transform duration-200">
                {isOpsPopoverOpen ? '▲' : '▼'}
              </span>
            </button>

            {isOpsPopoverOpen && (
              <form onSubmit={handleApplyOpsFilter} className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <label htmlFor="ops-start-date" className="block mb-1">
                      <BilingualLabel zh="开始日期" size="xs" />
                    </label>
                    <input
                      id="ops-start-date"
                      type="date"
                      value={draftOpsStart}
                      onChange={(e) => setDraftOpsStart(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#f8f9fa] border border-[#e5e7eb] rounded-[8px] text-[#252b33] text-[12px] focus:outline-none focus:border-[#252b33]"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label htmlFor="ops-end-date" className="block mb-1">
                      <BilingualLabel zh="结束日期" size="xs" />
                    </label>
                    <input
                      id="ops-end-date"
                      type="date"
                      value={draftOpsEnd}
                      onChange={(e) => setDraftOpsEnd(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#f8f9fa] border border-[#e5e7eb] rounded-[8px] text-[#252b33] text-[12px] focus:outline-none focus:border-[#252b33]"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* 仅在错误时显示校验文案 (DEC-012 OPS-02) */}
                {!opsDraftValidation.isValid && (
                  <div className="text-[11px] text-[#b91c1c] bg-[#fef2f2] px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
                    <span>⚠</span>
                    <span>{opsDraftValidation.error}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCancelOpsFilter}
                    className="flex-1 py-1.5 text-[#6d7480] bg-[#f1f2f4] rounded-[8px] active:bg-gray-200 cursor-pointer flex items-center justify-center"
                  >
                    <BilingualLabel zh="取消" size="sm" align="center" />
                  </button>
                  <button
                    type="submit"
                    disabled={!opsDraftValidation.isValid}
                    className="flex-1 py-1.5 text-white bg-[#252b33] rounded-[8px] disabled:opacity-40 active:opacity-85 cursor-pointer flex items-center justify-center"
                  >
                    <BilingualLabel zh="应用" size="sm" align="center" style={{ color: 'white' }} />
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* 运营分析内容主体 */}
          {opsData ? (
            <>
              {/* 1. 运营 6 指标大蓝卡 (DEC-012 OPS-02: 背景约 #3978ff，2列×3行浅蓝半透明小格，标签在上、数值在下) */}
              <section className="rounded-[16px] bg-[#3978ff] p-3.5 shadow-sm text-white">
                <div className="grid grid-cols-2 gap-3">
                  {/* 1. 工作时长百分率 */}
                  <div className="rounded-[12px] bg-white/15 p-3 flex flex-col items-center justify-center min-h-[80px]">
                    <div className="text-center mb-1.5 break-words">
                      <BilingualLabel zh="工作时长百分率" size="sm" align="center" style={{ color: 'white' }} />
                    </div>
                    <div className="flex items-baseline justify-center gap-1 leading-none" dir="ltr">
                      <span className="text-[24px] font-bold">
                        {typeof opsData.workPercentage === 'number' ? opsData.workPercentage : '—'}
                      </span>
                      <span className="text-[13px] font-normal text-white/85">%</span>
                    </div>
                  </div>

                  {/* 2. 怠速时长百分率 */}
                  <div className="rounded-[12px] bg-white/15 p-3 flex flex-col items-center justify-center min-h-[80px]">
                    <div className="text-center mb-1.5 break-words">
                      <BilingualLabel zh="怠速时长百分率" size="sm" align="center" style={{ color: 'white' }} />
                    </div>
                    <div className="flex items-baseline justify-center gap-1 leading-none" dir="ltr">
                      <span className="text-[24px] font-bold">
                        {typeof opsData.idlePercentage === 'number' ? opsData.idlePercentage : '—'}
                      </span>
                      <span className="text-[13px] font-normal text-white/85">%</span>
                    </div>
                  </div>

                  {/* 3. 重载平均车速 */}
                  <div className="rounded-[12px] bg-white/15 p-3 flex flex-col items-center justify-center min-h-[80px]">
                    <div className="text-center mb-1.5 break-words">
                      <BilingualLabel zh="重载平均车速" size="sm" align="center" style={{ color: 'white' }} />
                    </div>
                    <div className="flex items-baseline justify-center gap-1 leading-none" dir="ltr">
                      <span className="text-[24px] font-bold">
                        {typeof opsData.loadedAvgSpeed === 'number' ? opsData.loadedAvgSpeed : '—'}
                      </span>
                      <span className="text-[13px] font-normal text-white/85">km/h</span>
                    </div>
                  </div>

                  {/* 4. 空载平均车速 */}
                  <div className="rounded-[12px] bg-white/15 p-3 flex flex-col items-center justify-center min-h-[80px]">
                    <div className="text-center mb-1.5 break-words">
                      <BilingualLabel zh="空载平均车速" size="sm" align="center" style={{ color: 'white' }} />
                    </div>
                    <div className="flex items-baseline justify-center gap-1 leading-none" dir="ltr">
                      <span className="text-[24px] font-bold">
                        {typeof opsData.emptyAvgSpeed === 'number' ? opsData.emptyAvgSpeed : '—'}
                      </span>
                      <span className="text-[13px] font-normal text-white/85">km/h</span>
                    </div>
                  </div>

                  {/* 5. 平均循环时长 (分钟除以 60 换成小时，最多 2 位小数) */}
                  <div className="rounded-[12px] bg-white/15 p-3 flex flex-col items-center justify-center min-h-[80px]">
                    <div className="text-center mb-1.5 break-words">
                      <BilingualLabel zh="平均循环时长" size="sm" align="center" style={{ color: 'white' }} />
                    </div>
                    <div className="flex items-baseline justify-center gap-1 leading-none" dir="ltr">
                      <span className="text-[24px] font-bold">{cycleTimeHours}</span>
                      <span className="text-[13px] font-normal text-white/85">h</span>
                    </div>
                  </div>

                  {/* 6. 平均单趟有效载荷 */}
                  <div className="rounded-[12px] bg-white/15 p-3 flex flex-col items-center justify-center min-h-[80px]">
                    <div className="text-center mb-1.5 break-words">
                      <BilingualLabel zh="平均单趟有效载荷" size="sm" align="center" style={{ color: 'white' }} />
                    </div>
                    <div className="flex items-baseline justify-center gap-1 leading-none" dir="ltr">
                      <span className="text-[24px] font-bold">
                        {typeof opsData.avgPayload === 'number' ? opsData.avgPayload : '—'}
                      </span>
                      <span className="text-[13px] font-normal text-white/85">t</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. 设备车速分析：左右两列 180 度半圆仪表，空载左、重载右 (DEC-012 OPS-02) */}
              <section className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
                <div className="mb-4">
                  <BilingualLabel zh="设备车速分析" size="title" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <SpeedGauge speed={opsData.emptyAvgSpeed} title="空载平均车速" />
                  <SpeedGauge speed={opsData.loadedAvgSpeed} title="重载平均车速" />
                </div>
              </section>

              {/* 3. 设备运行分析：顶部共享 0~100 刻度与两条独立矩形条 (DEC-012 OPS-02) */}
              <section className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
                <div className="mb-3">
                  <BilingualLabel zh="设备运行分析" size="title" />
                </div>

                {/* 顶部单一共享刻度 0 ~ 100 (按实际百分率绝对定位，端点对齐，OPS-REVIEW-2 省略 96) */}
                <div className="text-[10px] text-[#7a8290] font-mono select-none">
                  <div className="relative h-4 w-full" dir="ltr">
                    {[0, 12, 24, 36, 48, 60, 72, 84, 100].map((val) => {
                      const isStart = val === 0;
                      const isEnd = val === 100;

                      return (
                        <span
                          key={val}
                          style={{
                            left: `${val}%`,
                            transform: isStart ? 'none' : isEnd ? 'translateX(-100%)' : 'translateX(-50%)',
                          }}
                          className="absolute top-0 leading-none whitespace-nowrap"
                        >
                          {val}
                        </span>
                      );
                    })}
                  </div>
                  <div className="border-b border-dashed border-[#d1d5db] my-1.5" />
                </div>

                {/* 工作时长与怠速时长两条独立矩形条 */}
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <BilingualLabel zh="工作时长百分率" size="sm" />
                      <span className="font-semibold text-[#2563eb]" dir="ltr">
                        {typeof opsData.workPercentage === 'number' ? `${opsData.workPercentage}%` : '—'}
                      </span>
                    </div>
                    <div className="relative h-5 bg-[#f1f3f7] rounded-sm overflow-hidden flex items-center">
                      {typeof opsData.workPercentage === 'number' && (
                        <div
                          style={{ width: `${Math.min(100, Math.max(0, opsData.workPercentage))}%` }}
                          className="h-full bg-[#2563eb] transition-all"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <BilingualLabel zh="怠速时长百分率" size="sm" />
                      <span className="font-semibold text-[#d97706]" dir="ltr">
                        {typeof opsData.idlePercentage === 'number' ? `${opsData.idlePercentage}%` : '—'}
                      </span>
                    </div>
                    <div className="relative h-5 bg-[#f1f3f7] rounded-sm overflow-hidden flex items-center">
                      {typeof opsData.idlePercentage === 'number' && (
                        <div
                          style={{ width: `${Math.min(100, Math.max(0, opsData.idlePercentage))}%` }}
                          className="h-full bg-[#fbbf24] transition-all"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <div className="rounded-[14px] bg-white p-8 shadow-[0_1px_2px_rgba(31,41,55,0.035)] text-center text-[#7a8290] flex flex-col items-center">
              <BilingualLabel zh="暂无运营分析数据" size="default" align="center" />
            </div>
          )}
        </main>
      </div>
    );
  }

  // 充电数据详情分支 (V2-R03 / REVIEW-V2-01: 父级持有已应用区间，返回保留)
  if (analysisView === 'charging') {
    return (
      <ElectricChargingData
        device={device}
        dateRange={chargingDateRange}
        onDateRangeChange={setChargingDateRange}
        onBack={() => setAnalysisView('home')}
      />
    );
  }

  // Screen 6: 数据分析入口主页 (DEC-012 OPS-03: 电车2卡片，燃油1卡片)
  return (
    <div className="min-h-full bg-[#f1f3f7] text-[#252b33]" dir="auto">
      {/* 顶部导航 */}
      <Header title="数据分析" subtitle={device?.code || 'POPJ0841016452'} onBack={onBack} />

      {/* 离线状态提示条 (F2-04) */}
      {isOffline && (
        <div className="px-3 py-1.5 bg-[#fffbeb] border-b border-[#fde68a] text-[11px] text-[#b45309] flex items-center justify-between">
          <BilingualLabel zh="设备当前离线，以下为最后上报历史数据" size="xs" />
          <span className="font-mono text-[10px]" dir="ltr">2023-11-23 07:45</span>
        </div>
      )}

      {/* 入口卡片 (FUEL-OPS-001: 燃油车仅1个运营入口，电车2个) */}
      <main className="space-y-3 px-3 pb-8 pt-3">
        <Card
          icon="ops"
          title="设备运营分析"
          onClick={() => setAnalysisView('operations')}
        />
        {!isFuel && (
          <Card
            icon="charging"
            title="充电数据"
            onClick={() => setAnalysisView('charging')}
          />
        )}
      </main>
    </div>
  );
}

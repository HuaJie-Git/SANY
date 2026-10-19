import React, { useState, useMemo, useEffect } from 'react';
import { getChargingData, validateDateRange } from './electricWidebodyData';
import { useWidebodyState } from './useWidebodyState';

/**
 * V2-R03 / REVIEW-V2-01: 充电数据独立页面 (ElectricChargingData)
 * 具备紧凑日期区间筛选按钮与下拉弹层、区间汇总指标（充电次数、充电度数、充电时长）
 * 与逐次充电记录明细卡（开始/结束时间、时长、开始/结束SOC、增加%、度数、位置）
 * 遵循极简规范：燃油同款白卡双列指标 (22px/12px/11px)，去多余文案与小灰卡
 */
export default function ElectricChargingData({
  device,
  dateRange = { startDate: '2023-11-23', endDate: '2023-11-23' },
  onDateRangeChange,
  onBack,
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(dateRange.startDate);
  const [draftEnd, setDraftEnd] = useState(dateRange.endDate);

  // 同步外部已应用日期 (REVIEW-V2-01)
  useEffect(() => {
    setDraftStart(dateRange.startDate);
    setDraftEnd(dateRange.endDate);
  }, [dateRange.startDate, dateRange.endDate]);

  // 异常驱动场景 (DEC-010 / DEC-011: widebodyChargeState=empty|partial|charging|crossday)
  const urlChargeState = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('widebodyChargeState') || '';
  }, []);

  // 状态机集成 (DEC-010 V2-STATE: 复用 useWidebodyState)
  const { isOffline, hasBlockingState, renderStateOverlay } = useWidebodyState(onBack);

  // 实时草稿校验
  const inputValidation = useMemo(() => {
    return validateDateRange(draftStart, draftEnd);
  }, [draftStart, draftEnd]);

  // 获取当前已应用日期自洽数据
  const chargingResult = useMemo(() => {
    return getChargingData(dateRange.startDate, dateRange.endDate, urlChargeState);
  }, [dateRange.startDate, dateRange.endDate, urlChargeState]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    if (!inputValidation.isValid) return;
    onDateRangeChange?.({ startDate: draftStart, endDate: draftEnd });
    setIsPopoverOpen(false);
  };

  const handleCancelFilter = () => {
    setDraftStart(dateRange.startDate);
    setDraftEnd(dateRange.endDate);
    setIsPopoverOpen(false);
  };

  if (hasBlockingState) {
    return (
      <div className="min-h-full bg-[#f1f3f7] text-[#252b33]" dir="auto">
        <header className="sticky top-0 z-20 flex min-h-[52px] py-2 items-center bg-[#f1f3f7]/95 px-3 backdrop-blur-sm border-b border-gray-200/60">
          <button
            type="button"
            onClick={onBack}
            aria-label="返回数据分析"
            className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5 shrink-0"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#252b33" strokeWidth="2" strokeLinecap="round" className="rtl:rotate-180">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div className="min-w-0 flex-1 px-2 text-left">
            <h1 className="text-[16px] font-medium text-[#252b33] break-all">{device?.code || 'POPJ0841016452'}</h1>
          </div>
          <div className="w-9 shrink-0" />
        </header>
        {renderStateOverlay('充电数据暂无记录', '当前设备暂无充电记录，可尝试切换筛选日期')}
      </div>
    );
  }

  const { records, summary } = chargingResult;

  return (
    <div className="min-h-full bg-[#f1f3f7] text-[#252b33]" dir="auto">
      {/* 顶部导航 (REVIEW-V2-01: 按参考图只显示同车编号+返回) */}
      <header className="sticky top-0 z-20 flex min-h-[52px] py-2 items-center bg-[#f1f3f7]/95 px-3 backdrop-blur-sm border-b border-gray-200/60">
        <button
          type="button"
          onClick={onBack}
          aria-label="返回数据分析"
          className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5 shrink-0"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#252b33" strokeWidth="2" strokeLinecap="round" className="rtl:rotate-180">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div className="min-w-0 flex-1 px-2 text-left">
          <h1 className="text-[16px] font-medium text-[#252b33] break-all">{device?.code || 'POPJ0841016452'}</h1>
        </div>
        <div className="w-9 shrink-0" />
      </header>

      {/* 离线状态提示 */}
      {isOffline && (
        <div className="px-3 py-1.5 bg-[#fffbeb] border-b border-[#fde68a] text-[11px] text-[#b45309] flex items-center justify-between">
          <span>设备当前离线，以下为历史充电记录</span>
          <span className="font-mono">上报时间: 2023-11-23 07:45</span>
        </div>
      )}

      <main className="p-3 pb-8 space-y-3.5">
        {/* 日期筛选卡 (REVIEW-V2-01: 紧凑白色区间按钮，点开显示输入与应用/取消) */}
        <section className="rounded-[14px] bg-white p-3.5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
          <button
            type="button"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className="w-full flex items-center justify-between text-[13px] font-medium text-[#252b33] cursor-pointer"
            aria-expanded={isPopoverOpen}
          >
            <span className="font-mono" dir="ltr">
              {dateRange.startDate} ~ {dateRange.endDate}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${isPopoverOpen ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {isPopoverOpen && (
            <form onSubmit={handleApplyFilter} className="mt-3 pt-3 border-t border-gray-100 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div>
                  <label htmlFor="charge-start-date" className="block text-[11px] text-[#7a8290] mb-1">开始日期</label>
                  <input
                    id="charge-start-date"
                    type="date"
                    value={draftStart}
                    onChange={(e) => setDraftStart(e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#f8f9fa] border border-[#e5e7eb] rounded-[8px] text-[#252b33] text-[12px] focus:outline-none focus:border-[#252b33]"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label htmlFor="charge-end-date" className="block text-[11px] text-[#7a8290] mb-1">结束日期</label>
                  <input
                    id="charge-end-date"
                    type="date"
                    value={draftEnd}
                    onChange={(e) => setDraftEnd(e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#f8f9fa] border border-[#e5e7eb] rounded-[8px] text-[#252b33] text-[12px] focus:outline-none focus:border-[#252b33]"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* 仅在错误时说明 366 天或格式错误 (REVIEW-V2-01) */}
              {!inputValidation.isValid && (
                <div className="text-[11px] text-[#b91c1c] bg-[#fef2f2] px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
                  <span>⚠</span>
                  <span>{inputValidation.error}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCancelFilter}
                  className="flex-1 py-1.5 text-[12px] font-medium text-[#6d7480] bg-[#f1f2f4] rounded-[8px] active:bg-gray-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!inputValidation.isValid}
                  className="flex-1 py-1.5 text-[12px] font-medium text-white bg-[#252b33] rounded-[8px] disabled:opacity-40 active:opacity-85 cursor-pointer"
                >
                  应用
                </button>
              </div>
            </form>
          )}
        </section>

        {/* 区间汇总白卡 (REVIEW-V2-01: 燃油同款白卡双列、22px数值/12px单位/11px标签，去每指标灰底小卡与多余说明) */}
        <section className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
          <div className="grid grid-cols-2 gap-x-5 gap-y-5">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1 text-[#303640] flex-wrap">
                <span className="text-[22px] font-normal leading-none tracking-[-0.4px]">
                  {summary.count !== null && summary.count !== undefined ? summary.count : '—'}
                </span>
                <span className="text-[12px] font-medium text-[#7a8290]">次</span>
              </div>
              <div className="mt-2 text-[11px] leading-[15px] text-[#7a8290] break-words">充电次数</div>
            </div>

            <div className="min-w-0">
              <div className="flex items-baseline gap-1 text-[#303640] flex-wrap">
                <span className="text-[22px] font-normal leading-none tracking-[-0.4px]">
                  {summary.totalEnergy !== null && summary.totalEnergy !== undefined ? summary.totalEnergy : '—'}
                </span>
                <span className="text-[12px] font-medium text-[#7a8290]">kWh</span>
              </div>
              <div className="mt-2 text-[11px] leading-[15px] text-[#7a8290] break-words">充电度数</div>
            </div>

            <div className="min-w-0">
              <div className="flex items-baseline gap-1 text-[#303640] flex-wrap">
                <span className="text-[22px] font-normal leading-none tracking-[-0.4px]">
                  {summary.totalDuration !== null && summary.totalDuration !== undefined ? summary.totalDuration : '—'}
                </span>
                <span className="text-[12px] font-medium text-[#7a8290]">h</span>
              </div>
              <div className="mt-2 text-[11px] leading-[15px] text-[#7a8290] break-words">充电时长</div>
            </div>
          </div>
        </section>

        {/* 逐次充电记录列表 (REVIEW-V2-01: 仅保留必需字段，去充电机次明细/共N条记录) */}
        <section className="space-y-3">
          {records.length === 0 ? (
            <div className="rounded-[14px] bg-white p-8 text-center text-[13px] text-[#7a8290] shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
              暂无充电记录
            </div>
          ) : (
            records.map((rec) => {
              const hasEndTime = rec.endTime != null && !rec.isOngoing;
              const hasEndSoc = rec.endSoc !== null && rec.endSoc !== undefined;
              const hasEnergy = rec.energy !== null && rec.energy !== undefined;
              const hasDuration = rec.durationHours !== null && rec.durationHours !== undefined;
              const [startDatePart, startTimePart] = (rec.startTime || '').split(' ');
              const [endDatePart, endTimePart] = (rec.endTime || '').split(' ');

              return (
                <div
                  key={rec.id}
                  className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)] space-y-3"
                >
                  {/* 第一行：开始时间 ---- 本次时长 ----> 结束时间 */}
                  <div className="flex items-center justify-between text-[12px] border-b border-gray-100 pb-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-[#7a8290] mb-0.5">开始时间</div>
                      <div className="text-[#252b33] font-mono">
                        <span className="block whitespace-nowrap" dir="ltr">{startDatePart}</span>
                        <span className="block whitespace-nowrap" dir="ltr">{startTimePart}</span>
                      </div>
                    </div>

                    <div className="px-2 text-center shrink-0 flex flex-col items-center">
                      <span className="text-[12px] font-semibold text-[#2563eb]">
                        {hasDuration ? `${rec.durationHours} h` : '—'}
                      </span>
                      <div className="w-16 h-0.5 bg-blue-100 relative my-0.5">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-[#2563eb] transform rotate-45 rtl:rotate-[-135deg]" />
                      </div>
                      <span className="text-[9px] text-[#9ca3af]">本次时长</span>
                    </div>

                    <div className="min-w-0 flex-1 text-right">
                      <div className="text-[11px] text-[#7a8290] mb-0.5">结束时间</div>
                      {hasEndTime ? (
                        <div className="text-[#252b33] font-mono">
                          <span className="block whitespace-nowrap" dir="ltr">{endDatePart}</span>
                          <span className="block whitespace-nowrap" dir="ltr">{endTimePart}</span>
                        </div>
                      ) : rec.isOngoing ? (
                        <div className="text-[#2563eb] font-medium">充电中</div>
                      ) : (
                        <div className="text-[#252b33] font-mono">—</div>
                      )}
                    </div>
                  </div>

                  {/* 第二行：开始SOC ---- 增加百分点 ----> 结束SOC */}
                  <div className="flex items-center justify-between text-[12px] border-b border-gray-100 pb-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-[#7a8290] mb-0.5">开始SOC</div>
                      <div className="text-[15px] font-normal text-[#252b33]">
                        {rec.startSoc !== null && rec.startSoc !== undefined ? `${rec.startSoc}%` : '—'}
                      </div>
                    </div>

                    <div className="px-2 text-center shrink-0 flex flex-col items-center">
                      <span className="text-[12px] font-semibold text-[#10b981]">
                        {rec.socIncrease !== null && rec.socIncrease !== undefined ? `+${rec.socIncrease}%` : '—'}
                      </span>
                      <div className="w-16 h-0.5 bg-emerald-100 relative my-0.5">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-[#10b981] transform rotate-45 rtl:rotate-[-135deg]" />
                      </div>
                      <span className="text-[9px] text-[#9ca3af]">增加量</span>
                    </div>

                    <div className="min-w-0 flex-1 text-right">
                      <div className="text-[11px] text-[#7a8290] mb-0.5">结束SOC</div>
                      <div className="text-[15px] font-normal text-[#252b33]">
                        {hasEndSoc ? `${rec.endSoc}%` : '—'}
                      </div>
                    </div>
                  </div>

                  {/* 第三行：充电度数 & 充电位置 */}
                  <div className="grid grid-cols-2 gap-2 text-[12px] pt-0.5">
                    <div>
                      <span className="text-[11px] text-[#7a8290] block mb-0.5">充电度数</span>
                      <span className="text-[14px] font-medium text-[#252b33]">
                        {hasEnergy ? `${rec.energy} kWh` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#7a8290] block mb-0.5">充电位置</span>
                      <span className="text-[12px] text-[#4b5563] break-words break-all">
                        {rec.location || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}

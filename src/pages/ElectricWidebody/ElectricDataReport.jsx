import React, { useState, useMemo } from 'react';
import {
  getReportDataByDate,
  normalizeDateStr,
} from './electricWidebodyData';
import { useWidebodyState } from './useWidebodyState';
import { ElectricSingleLineChart, ElectricDualAxisChart } from './ElectricTrendChart';
import ElectricSocChart from './ElectricSocChart';
import ElectricGearChart from './ElectricGearChart';

export default function ElectricDataReport({ device, onBack }) {
  const [tab, setTab] = useState('daily'); // 'daily' | 'weekly' | 'monthly'

  // 当前选定基准日期 (真实 Date 驱动，FIX-001)
  const [currentDate, setCurrentDate] = useState(() => new Date(2023, 10, 23)); // 2023-11-23
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  // STATE-002 异常状态机集成 (FIX-004 / F2-04)
  const { isOffline, hasBlockingState, renderStateOverlay } = useWidebodyState(onBack);

  // 根据当前日期与 tab 动态计算报表数据
  const reportData = useMemo(() => {
    return getReportDataByDate(currentDate, tab);
  }, [currentDate, tab]);

  // 前后周期翻页计算 (FIX-001 / F2-01: 月末切月正确支持 1-31 -> 2-29, 12-31 -> 1-31, 跨年/闰年)
  const handleShiftPeriod = (direction) => {
    setSelectedDayDetail(null);
    setCurrentDate((prev) => {
      if (tab === 'daily') {
        const next = new Date(prev);
        next.setDate(next.getDate() + direction);
        return next;
      } else if (tab === 'weekly') {
        const next = new Date(prev);
        next.setDate(next.getDate() + direction * 7);
        return next;
      } else {
        const year = prev.getFullYear();
        const month = prev.getMonth();
        const day = prev.getDate();
        const targetBase = new Date(year, month + direction, 1);
        const targetYear = targetBase.getFullYear();
        const targetMonth = targetBase.getMonth();
        const maxDay = new Date(targetYear, targetMonth + 1, 0).getDate();
        const targetDay = Math.min(day, maxDay);
        return new Date(targetYear, targetMonth, targetDay);
      }
    });
  };

  // 格式化当前日期为 input[type="date"] 使用的 yyyy-mm-dd
  const formattedInputDate = useMemo(() => {
    return normalizeDateStr(currentDate);
  }, [currentDate]);

  const handleDateInputChange = (e) => {
    if (!e.target.value) return;
    const parts = e.target.value.split('-').map(Number);
    if (parts.length === 3) {
      setCurrentDate(new Date(parts[0], parts[1] - 1, parts[2]));
      setSelectedDayDetail(null);
      setShowDatePicker(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f1f3f7] text-[#252b33]" dir="auto">
      {/* 顶部导航 (STYLE-FUEL-002: 灰底 min-h-[52px] py-2, 左箭头+编号, 深灰图标, 左对齐, RTL) */}
      <header className="sticky top-0 z-20 bg-[#f1f3f7]/95 backdrop-blur-sm">
        <div className="min-h-[52px] py-2 px-3 flex items-center">
          <button
            type="button"
            onClick={onBack}
            className="h-9 w-9 flex items-center justify-center rounded-full active:bg-black/5 shrink-0"
            aria-label="返回车辆工况详情"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#252b33" strokeWidth="2" strokeLinecap="round" className="rtl:rotate-180">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div className="min-w-0 flex-1 px-2 text-[15px] font-medium text-left text-[#252b33] break-all">
            {device?.code || 'POPJ0841016452'}
            {isOffline && <span className="ml-1 text-[#b45309] font-normal text-[12px]">(离线)</span>}
          </div>

          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="h-9 w-9 flex items-center justify-center text-[#666] active:bg-black/5 rounded-full shrink-0"
            aria-label="选择任意日期"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </button>
        </div>
      </header>

      {/* 离线状态提示条 (F2-04) */}
      {isOffline && (
        <div className="px-3 py-1.5 bg-[#fffbeb] border-b border-[#fde68a] text-[11px] text-[#b45309] flex items-center justify-between">
          <span>设备当前离线，以下为最后上报历史数据</span>
          <span className="font-mono">上报时间: 2023-11-23 07:45</span>
        </div>
      )}

      {/* 阻塞状态展示 (FIX-004 / F2-04) */}
      {hasBlockingState && renderStateOverlay('报表数据暂无记录', '当前设备在此周期内暂无工况报表，可调整日期或重新加载')}

      {!hasBlockingState && (
        <>
          {/* 日期选择器展开浮层 */}
          {showDatePicker && (
            <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between mx-3 my-2 rounded-xl shadow-xs">
              <span className="text-[12px] font-semibold text-[#252b33]">选择基准日期:</span>
              <input
                type="date"
                value={formattedInputDate}
                onChange={handleDateInputChange}
                className="px-2 py-1 text-[12px] bg-[#f8f9fa] border border-gray-300 rounded-lg text-[#252b33] focus:outline-none"
              />
            </div>
          )}

          {/* 报表类型 Tab 切换 (STYLE-FUEL-004: 居中三胶囊, 选中 #252b33) */}
          <div className="flex justify-center gap-2 pt-1">
            {[
              { id: 'daily', label: '日报' },
              { id: 'weekly', label: '周报' },
              { id: 'monthly', label: '月报' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setSelectedDayDetail(null);
                }}
                className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-[#252b33] text-white'
                    : 'bg-white text-[#666]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 紧凑日期翻页导航行 (STYLE-FUEL-004) */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-2">
            <button
              type="button"
              onClick={() => handleShiftPeriod(-1)}
              className="h-7 w-7 flex items-center justify-center rounded-full active:bg-black/5 text-[#666]"
              aria-label="前一周期"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="rtl:rotate-180">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <span className="text-[14px] font-medium min-w-[120px] text-center text-[#252b33]">
              {reportData.dateLabel}
            </span>

            <button
              type="button"
              onClick={() => handleShiftPeriod(1)}
              className="h-7 w-7 flex items-center justify-center rounded-full active:bg-black/5 text-[#666]"
              aria-label="后一周期"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="rtl:rotate-180">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* 报表主内容 (STYLE-FUEL-002: px-3 space-y-3, 白卡 rounded-[14px]) */}
          <main className="px-3 pb-8 space-y-3">
            {/* 日报分支 */}
            {tab === 'daily' && (
              <>
                {/* 6 大指标白卡 (STYLE-FUEL-002/004: 22px normal / 12px unit / 11px label, 自然高度, 删强制留白) */}
                <div className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
                  <div className="text-[15px] font-semibold text-[#252b33] mb-4">今日数据</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                    {reportData.kpis.map((kpi, idx) => (
                      <div key={idx}>
                        <div className="flex items-baseline gap-1">
                          <span className="text-[22px] font-normal text-[#252b33]">{kpi.value}</span>
                          {kpi.unit && <span className="text-[12px] text-[#666]">{kpi.unit}</span>}
                        </div>
                        <div className="text-[11px] text-[#999] mt-1">{kpi.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 当日开工分布 (DEC-015: 更名为当日开工分布，色条/刻度/最下工作左怠速右) */}
                <div className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
                  <div className="text-[15px] font-semibold text-[#252b33] mb-3">当日开工分布</div>

                  <div className="relative h-3 rounded-sm overflow-hidden bg-gray-100" style={{ direction: 'ltr' }}>
                    {(reportData.timelineSegments && reportData.timelineSegments.length > 0) ? (
                      reportData.timelineSegments.map((seg, idx) => {
                        const color = seg.status === '工作' ? 'bg-[#2377f3]' : 'bg-[#f3c84b]';
                        const leftPct = (seg.start / 24) * 100;
                        const widthPct = ((seg.end - seg.start) / 24) * 100;
                        return (
                          <div
                            key={idx}
                            className={`absolute top-0 bottom-0 ${color}`}
                            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                            title={`${seg.status}: ${seg.start}h - ${seg.end}h (${seg.durationHours}h)`}
                          />
                        );
                      })
                    ) : (
                      <div className="h-full w-full bg-[#dfe2e6]" />
                    )}
                  </div>

                  <div className="flex justify-between text-[8px] text-[#999] mt-1 font-mono" dir="ltr">
                    <span>0</span>
                    <span>2</span>
                    <span>4</span>
                    <span>6</span>
                    <span>8</span>
                    <span>10</span>
                    <span>12</span>
                    <span>14</span>
                    <span>16</span>
                    <span>18</span>
                    <span>20</span>
                    <span>22</span>
                    <span>(h)</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-[#666] mt-2">
                    <span className="flex items-center gap-1">
                      <i className="h-2 w-2 rounded-sm bg-[#2377f3]"></i>工作
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="h-2 w-2 rounded-sm bg-[#f3c84b]"></i>怠速
                    </span>
                  </div>
                </div>

                {/* 电量曲线 (V2-R02 / DEC-011 / DEC-015) */}
                <ElectricSocChart key={`soc-${tab}-${reportData.dateLabel}`} mode="daily" data={reportData.socCurve} />

                {/* 档位使用情况 (V2-R02 / DEC-015) */}
                <ElectricGearChart data={reportData.gearDistribution} />
              </>
            )}

            {/* 周报分支 */}
            {tab === 'weekly' && (
              <>
                {/* 6 大指标白卡 (STYLE-FUEL-002/004: 对比上周, 自然高度, 删强制留白) */}
                <div className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[15px] font-semibold text-[#252b33]">运营数据</span>
                    <span className="text-[12px] text-[#999]">对比上周</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                    {reportData.summary.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-baseline gap-1">
                          <span className="text-[22px] font-normal text-[#252b33]">{item.value}</span>
                          {item.unit && <span className="text-[12px] text-[#666]">{item.unit}</span>}
                          {item.wow && item.wow !== '—' && (
                            <span
                              className={`text-[10px] ml-1 px-1 py-0.5 rounded ${
                                item.isUp === true
                                  ? 'bg-red-50 text-[#e57373]'
                                  : item.isUp === false
                                  ? 'bg-green-50 text-[#66bb6a]'
                                  : 'bg-gray-100 text-[#999]'
                              }`}
                            >
                              {item.wow}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#999] mt-1">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>


                {/* 设备运行日历 + 第一平均电耗折线图 同一白卡 (STYLE-FUEL-004) */}
                <div className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
                  <div className="text-[15px] font-semibold text-[#252b33] mb-3">设备运行日历</div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {reportData.days.map((day, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedDayDetail(day)}
                        className={`p-1.5 rounded-md border transition-all text-center ${
                          selectedDayDetail?.fullDate === day.fullDate
                            ? 'bg-[#252b33] text-white border-[#252b33]'
                            : (day.mileage > 0 || day.energy > 0)
                            ? 'bg-[#fff8e1] border-[#fde68a]'
                            : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`block text-[10px] font-medium ${selectedDayDetail?.fullDate === day.fullDate ? 'text-white' : 'text-[#252b33]'}`}>{day.name}</span>
                        <span className={`block text-[8px] ${selectedDayDetail?.fullDate === day.fullDate ? 'text-white/80' : 'text-[#7a8290]'}`}>{day.date}</span>
                        <span className={`block text-[9px] font-medium mt-0.5 ${selectedDayDetail?.fullDate === day.fullDate ? 'text-white' : 'text-[#252b33]'}`}>{day.mileage}km</span>
                        <span className={`block text-[8px] ${selectedDayDetail?.fullDate === day.fullDate ? 'text-white/80' : 'text-[#7a8290]'}`}>{day.energy}kWh</span>
                      </button>
                    ))}
                  </div>

                  {/* 选中单日详情展开 */}
                  {selectedDayDetail && (
                    <div className="mt-3 p-2.5 bg-[#f8f9fa] rounded-lg border border-gray-200 text-[11px] text-[#252b33] flex items-center justify-between">
                      <div>
                        <strong>{selectedDayDetail.fullDate}</strong>:
                        <span className="ml-1.5">{selectedDayDetail.mileage} km · {selectedDayDetail.energy} kWh</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDayDetail(null)}
                        className="text-[#7a8290] hover:text-[#252b33] text-[10px] ml-1 shrink-0"
                      >
                        收起
                      </button>
                    </div>
                  )}

                  {/* 平均电耗趋势 (同一白卡内嵌入，noCard=true) */}
                  <ElectricSingleLineChart
                    noCard
                    title="平均电耗趋势"
                    unit="kWh/km"
                    data={reportData.avgEnergyTrend}
                    labels={reportData.days.map((d) => d.name)}
                    color="#2377f3"
                    decimals={2}
                  />
                </div>

                {/* 趋势图 2：运载趟数趋势 (独占白卡) */}
                <ElectricSingleLineChart
                  title="运载趟数趋势"
                  unit="趟"
                  data={reportData.tripsTrend}
                  labels={reportData.days.map((d) => d.name)}
                  color="#2377f3"
                  decimals={0}
                />

                {/* 趋势图 3：充电时长与回收电量双系列双轴趋势 (独占白卡) */}
                <ElectricDualAxisChart
                  title="充电时长与回收电量"
                  labels={reportData.days.map((d) => d.name)}
                  series1={{ name: '充电时长', unit: 'h', data: reportData.chargeDurationTrend }}
                  series2={{ name: '回收电量', unit: 'kWh', data: reportData.recoveryEnergyTrend }}
                />
              </>
            )}

            {/* 月报分支 */}
            {tab === 'monthly' && (
              <>
                {/* 6 大指标白卡 (STYLE-FUEL-002/004: 对比上月, 自然高度, 删强制留白) */}
                <div className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[15px] font-semibold text-[#252b33]">月度运营数据</span>
                    <span className="text-[12px] text-[#999]">对比上月</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                    {reportData.summary.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-baseline gap-1">
                          <span className="text-[22px] font-normal text-[#252b33]">{item.value}</span>
                          {item.unit && <span className="text-[12px] text-[#666]">{item.unit}</span>}
                          {item.mom && item.mom !== '—' && (
                            <span
                              className={`text-[10px] ml-1 px-1 py-0.5 rounded ${
                                item.isUp === true
                                  ? 'bg-red-50 text-[#e57373]'
                                  : item.isUp === false
                                  ? 'bg-green-50 text-[#66bb6a]'
                                  : 'bg-gray-100 text-[#999]'
                              }`}
                            >
                              {item.mom}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#999] mt-1">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>


                {/* 设备运行月历矩阵 + 第一平均电耗折线图 同一白卡 (STYLE-FUEL-004) */}
                <div className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
                  <div className="text-[15px] font-semibold text-[#252b33] mb-3">设备运行日历</div>

                  <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10px] text-[#999] font-medium">
                    <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {/* 月首日空白占位 */}
                    {Array.from({ length: reportData.firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="min-h-[42px] bg-transparent" />
                    ))}

                    {/* 窄矩形天数单元格 */}
                    {reportData.days.map((day) => (
                      <button
                        key={day.day}
                        type="button"
                        onClick={() => setSelectedDayDetail(day)}
                        className={`min-h-[42px] py-1 px-0.5 flex flex-col items-center justify-center rounded-md border transition-all ${
                          selectedDayDetail?.dateStr === day.dateStr
                            ? 'bg-[#252b33] text-white border-[#252b33]'
                            : (day.mileage > 0 || day.energy > 0)
                            ? 'bg-[#fff8e1] border-[#fde68a]'
                            : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`text-[10px] font-medium leading-tight ${selectedDayDetail?.dateStr === day.dateStr ? 'text-white' : 'text-[#252b33]'}`}>{day.day}</span>
                        <span className={`text-[8px] leading-tight ${selectedDayDetail?.dateStr === day.dateStr ? 'text-white' : 'text-[#252b33]'}`}>{day.mileage}km</span>
                        <span className={`text-[8px] leading-tight ${selectedDayDetail?.dateStr === day.dateStr ? 'text-white/80' : 'text-[#999]'}`}>{day.energy}kWh</span>
                      </button>
                    ))}
                  </div>

                  {/* 选中单日详情展开 */}
                  {selectedDayDetail && (
                    <div className="mt-3 p-2.5 bg-[#f8f9fa] rounded-lg border border-gray-200 text-[11px] text-[#252b33] flex items-center justify-between">
                      <div>
                        <strong>{selectedDayDetail.dateStr}</strong>:
                        <span className="ml-1.5">{selectedDayDetail.mileage} km · {selectedDayDetail.energy} kWh</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDayDetail(null)}
                        className="text-[#7a8290] hover:text-[#252b33] text-[10px] ml-1 shrink-0"
                      >
                        收起
                      </button>
                    </div>
                  )}

                  {/* 月度平均电耗走势 (同一白卡内嵌入，noCard=true) */}
                  <ElectricSingleLineChart
                    noCard
                    title="平均电耗走势"
                    unit="kWh/km"
                    data={reportData.avgEnergyTrend}
                    labels={reportData.days.map((d) => `${d.day}日`)}
                    color="#2377f3"
                    decimals={2}
                  />
                </div>

                {/* 图 2：月度运载趟数走势 (独占白卡) */}
                <ElectricSingleLineChart
                  title="运载趟数走势"
                  unit="趟"
                  data={reportData.tripsTrend}
                  labels={reportData.days.map((d) => `${d.day}日`)}
                  color="#2377f3"
                  decimals={0}
                />

                {/* 图 3：月度充电时长与回收电量双系列双轴走势 (独占白卡) */}
                <ElectricDualAxisChart
                  title="充电时长与回收电量"
                  labels={reportData.days.map((d) => `${d.day}日`)}
                  series1={{ name: '充电时长', unit: 'h', data: reportData.chargeDurationTrend }}
                  series2={{ name: '回收电量', unit: 'kWh', data: reportData.recoveryEnergyTrend }}
                />
              </>
            )}
          </main>
        </>
      )}
    </div>
  );
}

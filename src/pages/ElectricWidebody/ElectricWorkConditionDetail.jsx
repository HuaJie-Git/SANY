import React, { useState, useEffect, useRef } from 'react';
import IconFont from '../../components/IconFont/IconFont';
import {
  ELECTRIC_WIDEBODY_INFO,
  ELECTRIC_REALTIME_METRICS,
  ELECTRIC_TODAY_METRICS,
  ELECTRIC_CUMULATIVE_METRICS,
  getElectricTimelineSegments,
  getDailySocCurve,
} from './electricWidebodyData';
import { useWidebodyState } from './useWidebodyState';
import ElectricTrackPlayback from './ElectricTrackPlayback';
import ElectricSocChart from './ElectricSocChart';

const Icon = ({ type, size = 20 }) => {
  const iconMap = { report: 'report', behavior: 'chart', nav: 'navigation', grid: 'grid', parts: 'book', pin: 'location', clock: 'clock' };
  if (iconMap[type]) return <IconFont name={iconMap[type]} size={size} />;
  const paths = {
    behavior: <><path d="M4 18V6M4 18h16"/><path d="m7 14 3-4 3 2 4-6"/></>,
    report: <><rect x="3" y="4" width="18" height="13" rx="2" strokeWidth="1.6"/><path d="M8 20h8" strokeWidth="1.6"/><path d="M12 17v3" strokeWidth="1.6"/><path d="M7 12l3-3 3 2 4-4" strokeWidth="1.6" strokeLinejoin="round"/></>,
    parts: <><path d="M4 4h5l2 2h9V19H4z" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="13" r="3" strokeWidth="1.4"/><path d="M12 10v-1M12 17v-1M9.5 11.5l-.7-.7M15.2 15.2l-.7-.7M9.5 14.5l-.7.7M15.2 10.8l-.7.7" strokeWidth="1.2"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></>,
    nav: <path d="m4 11 16-7-7 16-2-7-7-2Z"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[type]}
    </svg>
  );
};

const Metric = ({ item }) => {
  const { label, value, unit, isStatus } = item;
  return (
    <div className="min-w-0">
      <div className={`flex items-baseline gap-1 ${isStatus ? 'text-[#252b33]' : 'text-[#303640]'}`}>
        <span className="text-[23px] font-normal leading-none tracking-[-0.4px]">{value}</span>
        {unit && <span className="text-[12px] font-medium text-[#7a8290]">{unit}</span>}
      </div>
      <div className="mt-2 text-[12px] leading-[16px] text-[#7a8290]">{label}</div>
    </div>
  );
};

const TrajectoryMap = ({ onClick }) => (
  <div onClick={onClick} className="relative mt-3 h-[180px] overflow-hidden rounded-xl bg-[#f8f9fa] border border-gray-200 cursor-pointer">
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 180" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="40" x2="320" y2="40" stroke="#ffffff" strokeWidth="4" />
      <line x1="0" y1="120" x2="320" y2="120" stroke="#ffffff" strokeWidth="5" />
      <line x1="80" y1="0" x2="80" y2="180" stroke="#ffffff" strokeWidth="4" />
      <line x1="220" y1="0" x2="220" y2="180" stroke="#ffffff" strokeWidth="6" />
      <path d="M 25 140 C 80 130, 100 80, 160 90 S 240 40, 295 55" fill="none" stroke="#bfdbfe" strokeWidth="8" strokeLinecap="round" />
      <path d="M 25 140 C 80 130, 100 80, 160 90 S 240 40, 295 55" fill="none" stroke="#2377f3" strokeWidth="3" strokeLinecap="round" />
      <circle cx="25" cy="140" r="4.5" fill="#15803d" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="295" cy="55" r="4.5" fill="#b91c1c" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="160" cy="90" r="6" fill="#2377f3" stroke="#ffffff" strokeWidth="2" />
    </svg>
    <div className="absolute left-3 bottom-2 flex items-center font-sans text-[12px] font-bold tracking-tight select-none">
      <span className="text-[#4285F4]">G</span>
      <span className="text-[#EA4335]">o</span>
      <span className="text-[#FBBC05]">o</span>
      <span className="text-[#4285F4]">g</span>
      <span className="text-[#34A853]">l</span>
      <span className="text-[#EA4335]">e</span>
    </div>
  </div>
);

export default function ElectricWorkConditionDetail({
  device,
  onBack,
  onNavigate,
}) {
  const [currentView, setCurrentView] = useState('detail'); // 'detail' | 'track'
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEditPlateModal, setShowEditPlateModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPartManualModal, setShowPartManualModal] = useState(false);

  const [currentPlate, setCurrentPlate] = useState(ELECTRIC_WIDEBODY_INFO.plate);
  const [plateInput, setPlateInput] = useState(ELECTRIC_WIDEBODY_INFO.plate);
  const [isCumulativeExpanded, setIsCumulativeExpanded] = useState(true);

  // 保持实际样例历史上报时间 (F2-06 / F3-04: 杜绝刷成当前系统时间)
  const [reportTimeText, setReportTimeText] = useState(ELECTRIC_WIDEBODY_INFO.reportTime);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef(null);

  // F3-03: showToast 改用 useRef 持有 timer，覆盖前与卸载时 clearTimeout，杜绝未清理 timer
  const showToast = (msg) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage('');
      toastTimerRef.current = null;
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // 全局 Escape 键盘事件监听 (FIX-006)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowMoreMenu(false);
        setShowEditPlateModal(false);
        setShowLocationModal(false);
        setShowPartManualModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // STATE-002 状态接入 (FIX-004 / F2-04)
  const { isOffline, hasBlockingState, renderStateOverlay } = useWidebodyState(onBack);

  const realtimeMetricsList = [
    { label: '设备状态', value: isOffline ? '离线' : '工作', isStatus: true },
    ...['剩余电量', '电池健康', '车速', '油门深度', '制动深度', '运载趟数', '运输重量'].map((name) =>
      ELECTRIC_REALTIME_METRICS.find((m) => m.label === name) || { label: name, value: '—', unit: '' }
    ),
  ];

  // DEC-014: 今日数据暂定业务分组展示排序（每行左右：工时/怠速工时；运行时长/机器利用率；里程/最高车速；运行功耗/空闲功耗；电耗/回收电量；充电时长）
  const todayMetricsList = [
    '工时',
    '怠速工时',
    '运行时长',
    '机器利用率',
    '里程',
    '最高车速',
    '运行功耗',
    '空闲功耗',
    '电耗',
    '回收电量',
    '充电时长',
  ].map((name) => ELECTRIC_TODAY_METRICS.find((m) => m.label === name) || { label: name, value: '—', unit: '' });

  // 轨迹回放跳转
  if (currentView === 'track') {
    return (
      <ElectricTrackPlayback
        device={device}
        initialDate="2023-11-23"
        onBack={() => setCurrentView('detail')}
      />
    );
  }

  // 车牌修改 (F2-06: 不凭空将长度限制为 8，允许 32 字符合理长度，保留空值校验)
  const handleSavePlate = (e) => {
    e.preventDefault();
    const trimmed = plateInput.trim();
    if (!trimmed) {
      showToast('车牌号不能为空');
      return;
    }
    if (trimmed.length > 32) {
      showToast('车牌/别名长度不能超过 32 个字符');
      return;
    }
    setCurrentPlate(trimmed);
    setShowEditPlateModal(false);
    showToast('车牌修改已在本地生效');
  };

  const handleShare = () => {
    setShowMoreMenu(false);
    const shareUrl = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => showToast('设备页面链接已复制到剪贴板'))
        .catch(() => showToast(`请手动复制: ${shareUrl}`));
    } else {
      showToast(`链接: ${shareUrl}`);
    }
  };

  // 重新加载工况数据 (F3-04: toast「已重新加载」，保留实际历史时间)
  const handleReloadData = () => {
    setShowMoreMenu(false);
    setReportTimeText(ELECTRIC_WIDEBODY_INFO.reportTime);
    showToast('已重新加载');
  };

  return (
    <div className="relative min-h-full bg-[#f1f3f7] text-[#252b33]" dir="auto">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-[#f1f3f7]/95 backdrop-blur-sm">
        <div className="min-h-[52px] py-2 px-3 flex items-center">
          <button
            type="button"
            onClick={onBack}
            className="h-9 w-9 flex items-center justify-center rounded-full active:bg-black/5 shrink-0"
            aria-label="返回资产列表"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#252b33" strokeWidth="2" strokeLinecap="round" className="rtl:rotate-180">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div className="min-w-0 flex-1 px-2 text-[15px] font-medium text-[#252b33] break-all">
            {device?.code || ELECTRIC_WIDEBODY_INFO.code}
          </div>
          <button
            type="button"
            aria-label="更多操作"
            onClick={() => setShowMoreMenu(true)}
            className="h-9 w-9 flex items-center justify-center text-[20px] tracking-[2px] cursor-pointer active:opacity-70 text-[#252b33] shrink-0"
          >
            •••
          </button>
        </div>
        <div className="pb-3 text-center text-[11px] text-[#9299a8] flex flex-wrap items-center justify-center gap-1">
          <span>上数时间 {reportTimeText}</span>
          <span className="text-[10px] text-[#9299a8]">ⓘ</span>
        </div>
      </header>

      {/* 阻塞型异常状态渲染 (FIX-004 / F2-04) */}
      {hasBlockingState && renderStateOverlay('工况数据暂无记录', '当前设备暂无实时工况数据，可尝试重新加载')}

      {!hasBlockingState && (
        <main className="px-3 pb-8 space-y-3.5">
          {/* 设备信息首白卡 (STYLE-FUEL-001~003: 燃油卡片构图，图片小缩略图，3个快捷入口) */}
          <section className="rounded-[14px] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
            <div className="flex gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-[14px] font-medium text-[#252b33]">
                  <span className="break-all">{device?.code || ELECTRIC_WIDEBODY_INFO.code}</span>
                </div>
                <div className="text-[13px] text-[#444b55] flex flex-wrap items-center">
                  <span className="break-all">{currentPlate || '车牌号'}</span>
                  <button
                    type="button"
                    aria-label="修改车牌"
                    onClick={() => {
                      setPlateInput(currentPlate);
                      setShowEditPlateModal(true);
                    }}
                    className="ml-1 text-[12px] text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    ✎
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[#4c535c]">
                  <Icon type="pin" size={16} />
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                    className="break-words text-left hover:text-[#252b33] cursor-pointer"
                  >
                    {ELECTRIC_WIDEBODY_INFO.location}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[#4c535c]">
                  <Icon type="clock" size={16} />
                  <span>{reportTimeText}</span>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <div className="h-[43px] w-[64px] overflow-hidden rounded bg-[#eef0f2]">
                  <img
                    src={`${(import.meta.env.BASE_URL || './').replace(/\/+$/, '')}/sany-skt105e-electric.png`}
                    alt="电动宽体车"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <button
                  type="button"
                  aria-label="行驶轨迹"
                  onClick={() => setCurrentView('track')}
                  className="h-10 w-10 rounded-full border border-[#76a9ff] text-[#2377f3] flex items-center justify-center active:bg-blue-50 cursor-pointer"
                >
                  <Icon type="nav" size={20} />
                </button>
              </div>
            </div>

            {/* 3 个横向边框快捷入口 (STYLE-FUEL-003: 燃油76px高图标按钮风格，3项不变) */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                aria-label="数据报表"
                onClick={() => onNavigate?.('dataReport')}
                className="h-[76px] rounded-[12px] border border-[#aeb5bf] flex flex-col items-center justify-center gap-1.5 text-[#303640] active:bg-gray-50 cursor-pointer"
              >
                <Icon type="report" size={20} />
                <span className="text-[11px] text-[#68707d] leading-tight">数据报表</span>
              </button>
              <button
                type="button"
                aria-label="数据分析"
                onClick={() => onNavigate?.('dataAnalysis')}
                className="h-[76px] rounded-[12px] border border-[#aeb5bf] flex flex-col items-center justify-center gap-1.5 text-[#303640] active:bg-gray-50 cursor-pointer"
              >
                <Icon type="behavior" size={20} />
                <span className="text-[11px] text-[#68707d] leading-tight">数据分析</span>
              </button>
              <button
                type="button"
                aria-label="零部件图册"
                onClick={() => setShowPartManualModal(true)}
                className="h-[76px] rounded-[12px] border border-[#aeb5bf] flex flex-col items-center justify-center gap-1.5 text-[#303640] active:bg-gray-50 cursor-pointer"
              >
                <Icon type="parts" size={20} />
                <span className="text-[11px] text-[#68707d] leading-tight">零部件图册</span>
              </button>
            </div>
          </section>

          {/* 实时工况白卡 (STYLE-FUEL-002: 16px semibold标题, 23px normal数值, 12px单位, 12px标签#7a8290, 去强制min-height) */}
          <section className="rounded-[16px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
            <h2 className="text-[16px] font-semibold text-[#252b33]">实时工况</h2>
            <div className="mt-1 text-[11px] text-[#656d78]">{reportTimeText}</div>
            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-7">
              {realtimeMetricsList.map((item) => (
                <Metric key={item.label} item={item} />
              ))}
            </div>
          </section>

          {/* 行驶轨迹白卡 (STYLE-FUEL-003: 燃油卡片规范, TrajectoryMap, 起终点) */}
          <section className="rounded-[14px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#252b33]">行驶轨迹</h2>
              <button
                type="button"
                onClick={() => setCurrentView('track')}
                className="text-[12px] text-[#2377f3] active:opacity-70 cursor-pointer"
              >
                查看详情
              </button>
            </div>

            <TrajectoryMap onClick={() => setCurrentView('track')} />

            <div className="mt-3 space-y-1 text-[11px] text-[#666]">
              <div className="break-words">起点位置：{ELECTRIC_WIDEBODY_INFO.startLocation}</div>
              <div className="break-words">终点位置：{ELECTRIC_WIDEBODY_INFO.endLocation}</div>
            </div>
          </section>

          {/* 今日数据 (STYLE-FUEL-002/003: 燃油卡片规范, 23px normal数值, 24小时开工时段分布, 去强制min-height) */}
          <section className="rounded-[14px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[16px] font-semibold text-[#252b33]">今日数据</h2>
              <button
                type="button"
                onClick={() => showToast('按自然日统计当日累计数据；机器利用率按运行时长/工时×100%计算')}
                className="h-4 w-4 rounded-full bg-[#303640] text-center text-[10px] leading-4 text-white flex items-center justify-center cursor-pointer"
                aria-label="今日数据说明"
              >
                ?
              </button>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-7">
              {todayMetricsList.map((item) => (
                <Metric key={item.label} item={item} />
              ))}
            </div>

            {/* 今日开工时间轴 (DEC-013: 移除标题，色条与刻度保留，图例移至刻度下方，左工作右怠速) */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="relative h-3 rounded-sm overflow-hidden bg-gray-100" style={{ direction: 'ltr' }}>
                {getElectricTimelineSegments('2023-11-23').map((seg, idx) => {
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
                })}
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
          </section>

          {/* 电量曲线 (DEC-017: 今日数据整卡后、累计前补已有 ElectricSocChart，与日报同源) */}
          <ElectricSocChart mode="daily" data={getDailySocCurve('2023-11-23')} />

          {/* 累计数据 (STYLE-FUEL-002/003: 燃油卡片规范, 23px normal数值, 去强制min-height) */}
          <section className="rounded-[14px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#252b33]">累计数据</h2>
              <button
                type="button"
                aria-expanded={isCumulativeExpanded}
                onClick={() => setIsCumulativeExpanded(!isCumulativeExpanded)}
                className="text-[12px] text-[#2377f3] flex items-center gap-1 cursor-pointer"
              >
                <span>{isCumulativeExpanded ? '收起' : '展开'}</span>
                <svg
                  className={`w-3.5 h-3.5 transform transition-transform ${isCumulativeExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {isCumulativeExpanded && (
              <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-7">
                {ELECTRIC_CUMULATIVE_METRICS.map((item) => (
                  <Metric key={item.label} item={item} />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* 提示消息 Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-gray-900/90 text-white text-[12px] rounded-xl shadow-lg pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* 零部件图册弹窗 (F3-04: 删除推测文案，保留“暂无相关手册”和返回) */}
      {showPartManualModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="零部件图册弹窗"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm bg-white rounded-[14px] shadow-xl overflow-hidden p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-[15px] font-semibold text-[#252b33]">零部件图册</h3>
              <button
                type="button"
                onClick={() => setShowPartManualModal(false)}
                className="p-1 text-[#7a8290] hover:text-[#252b33] rounded-full"
                aria-label="关闭"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="py-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#f0f1f3] text-[#252b33] flex items-center justify-center mx-auto">
                <Icon type="parts" size={24} />
              </div>
              <p className="text-[13px] font-medium text-[#252b33]">暂无相关手册</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPartManualModal(false)}
              className="w-full py-2.5 text-[13px] font-medium text-white bg-[#252b33] rounded-[10px] active:opacity-80"
            >
              返回
            </button>
          </div>
        </div>
      )}

      {/* 完整作业位置弹窗 (FIX-006: 多语言长文本完整查看) */}
      {showLocationModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="车辆完整位置信息弹窗"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm bg-white rounded-[14px] shadow-xl overflow-hidden p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-[15px] font-semibold text-[#252b33]">车辆详细作业位置</h3>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="p-1 text-[#7a8290] hover:text-[#252b33] rounded-full"
                aria-label="关闭"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 text-[12px]">
              <div>
                <span className="text-[#7a8290] block text-[11px]">当前作业矿区:</span>
                <span className="font-semibold text-[#252b33] break-words">{ELECTRIC_WIDEBODY_INFO.location}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const locText = ELECTRIC_WIDEBODY_INFO.location;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard
                    .writeText(locText)
                    .then(() => showToast('作业位置已复制'))
                    .catch(() => showToast(`复制失败，请手动选择复制: ${locText}`));
                } else {
                  showToast(`当前环境不支持剪贴板，请手动复制: ${locText}`);
                }
                setShowLocationModal(false);
              }}
              className="w-full py-2.5 text-[13px] font-medium text-white bg-[#252b33] rounded-[10px] active:opacity-80"
            >
              复制位置信息
            </button>
          </div>
        </div>
      )}

      {/* 更多操作抽屉 */}
      {showMoreMenu && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="更多操作菜单"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white rounded-t-[16px] p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-[14px] font-semibold text-[#252b33]">更多车辆操作</span>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="text-[#7a8290] hover:text-[#252b33]"
                aria-label="关闭更多操作"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-1 py-1">
              <button
                type="button"
                onClick={handleShare}
                className="w-full py-2.5 px-3 text-left text-[13px] text-[#252b33] hover:bg-gray-50 rounded-xl flex items-center justify-between"
              >
                <span>分享当前设备页面</span>
                <span className="text-[11px] text-[#7a8290]">复制页面链接</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setPlateInput(currentPlate);
                  setShowEditPlateModal(true);
                }}
                className="w-full py-2.5 px-3 text-left text-[13px] text-[#252b33] hover:bg-gray-50 rounded-xl flex items-center justify-between"
              >
                <span>修改车牌与别名</span>
                <span className="text-[11px] text-[#7a8290]">{currentPlate}</span>
              </button>

              {/* 重新加载数据入口 (F3-04: 去“本地”) */}
              <button
                type="button"
                onClick={handleReloadData}
                className="w-full py-2.5 px-3 text-left text-[13px] text-[#252b33] hover:bg-gray-50 rounded-xl flex items-center justify-between"
              >
                <span>重新加载数据</span>
                <span className="text-[11px] text-[#2377f3]">重新加载</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowMoreMenu(false)}
              className="w-full py-2.5 text-[13px] font-medium text-[#6d7480] bg-[#f1f2f4] rounded-[10px] active:bg-gray-200"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 修改车牌弹窗 (F2-06: 不凭空将长度限制为 8，允许 32 字符) */}
      {showEditPlateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="修改车牌别名弹窗"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <form onSubmit={handleSavePlate} className="w-full max-w-sm bg-white rounded-[14px] shadow-xl overflow-hidden p-5 space-y-4">
            <h3 className="text-[15px] font-semibold text-[#252b33]">修改车牌号</h3>
            <div>
              <label className="block text-[11px] font-medium text-[#7a8290] mb-1">自定义车牌 / 矿区内编号</label>
              <input
                type="text"
                maxLength={32}
                value={plateInput}
                onChange={(e) => setPlateInput(e.target.value)}
                placeholder="例如: 蒙K·89201电"
                className="w-full px-3 py-2 text-[13px] bg-[#f8f9fa] border border-[#e5e7eb] rounded-[10px] focus:border-[#252b33] focus:outline-none text-[#252b33]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowEditPlateModal(false)}
                className="flex-1 py-2 text-[13px] font-medium text-[#6d7480] bg-[#f1f2f4] rounded-[10px]"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-[13px] font-medium text-white bg-[#252b33] rounded-[10px] active:opacity-80"
              >
                确认修改
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';

/**
 * 星星详情页面
 * 参考图：orca-paste-1794295086609-9b9a899b-c373-48b0-875d-c8b2761bec61.png
 * 包含：
 * 1. 顶部返回与「积分规则ⓘ」
 * 2. 星星数量与资产折算
 * 3. 近7日星星获得情况日历打卡与「已领取」状态
 * 4. 跑马灯兑换广播通知
 * 5. 奖品兑换引导卡片（点击「去兑换＞」跳转奖品兑换）
 * 6. 「做任务 赚星星」任务列表（服务召请、圈子互动、日常巡检）
 * 7. 积分规则弹窗
 */
export default function StarDetails({ onBack, onNavigate, userStars = 172 }) {
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(''), 2200);
  };

  // 7日获得情况模拟数据（参考图：11.4 ~ 今天）
  const weekDays = [
    { date: '11.4', stars: 0 },
    { date: '11.5', stars: 0 },
    { date: '11.6', stars: 0 },
    { date: '11.7', stars: 0 },
    { date: '11.8', stars: 0 },
    { date: '11.9', stars: 5 },
    { date: '今天', stars: 5, active: true },
  ];

  // 任务列表
  const taskList = [
    {
      id: 'service',
      title: '服务召请',
      desc: '完成1次服务召请，可获得30颗星星',
      progress: '0/8',
      reward: '+30 颗星星',
      actionText: '去完成',
      onAction: () => showToast('原型演示：服务召请任务待确认，暂未开放自动结算'),
    },
    {
      id: 'community',
      title: '圈子互动',
      desc: '在圈子点赞、评论或分享可获得5颗星星',
      progress: '0/5',
      reward: '+5 颗星星',
      actionText: '去完成',
      onAction: () => showToast('原型演示：圈子互动任务待确认，暂未开放自动结算'),
    },
    {
      id: 'inspection',
      title: '设备日常巡检',
      desc: '完成1次设备健康巡检打卡，可获得10颗星星',
      progress: '0/1',
      reward: '+10 颗星星',
      actionText: '去完成',
      onAction: () => showToast('原型演示：设备巡检任务待确认，暂未开放自动结算'),
    },
  ];

  return (
    <div className="relative flex flex-col h-full bg-[#f6f7f9] text-gray-900 select-none overflow-hidden">
      {/* 顶部渐变氛围区（暖金黄渐变） */}
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-[#fbe39d] via-[#fdf2d5] to-[#f6f7f9] pointer-events-none z-0" />

      {/* 顶栏 */}
      <header className="relative z-10 flex min-h-[52px] items-center justify-between px-4 pt-1">
        <button
          type="button"
          onClick={onBack}
          aria-label="返回"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-black/5 transition-colors"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1f2937"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rtl:rotate-180"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => setShowRuleModal(true)}
          className="flex items-center gap-1 text-xs text-gray-700 bg-white/60 hover:bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-full border border-amber-200/60 active:scale-95 transition-all"
        >
          <span className="font-medium">积分规则</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </button>
      </header>

      {/* 滚动内容区 */}
      <main className="relative z-10 flex-1 overflow-y-auto pb-8 space-y-3.5">
        {/* 星星数总览 Hero */}
        <section className="px-5 pt-1 pb-2">
          <div className="flex items-baseline gap-2 text-left rtl:text-right">
            <span className="text-4xl font-extrabold tracking-tight text-gray-900 font-sans">
              {userStars}
            </span>
            <div className="flex items-center gap-1 text-sm font-semibold text-gray-800">
              <span>颗星星</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="rtl:rotate-180"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            ≈ Rp 31.132,-（仅作展示估算，规则待确认）
          </p>
        </section>

        {/* 卡片1：近7日星星获得情况 */}
        <section className="mx-4 rounded-2xl bg-white p-4 shadow-sm border border-amber-100/60">
          <h2 className="text-xs font-medium text-gray-500 text-center mb-3.5 tracking-wide">
            近7日星星获得情况
          </h2>

          <div className="grid grid-cols-7 gap-1.5 items-end mb-4">
            {weekDays.map((item, idx) => {
              const hasStars = item.stars > 0;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <span className={`text-[11px] mb-1.5 truncate max-w-full ${item.active ? 'text-amber-800 font-semibold' : 'text-gray-400'}`}>
                    {item.date}
                  </span>

                  {/* 星星图示徽标 */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform ${
                      hasStars
                        ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400 shadow-xs ring-2 ring-amber-200/50'
                        : 'bg-gray-100'
                    }`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={hasStars ? '#ffffff' : '#cbd5e1'}
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>

                  <span
                    className={`text-[11px] mt-1.5 font-medium ${
                      hasStars ? 'text-orange-600' : 'text-gray-400'
                    }`}
                  >
                    +{item.stars}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 领取状态按钮（参考图：已领取） */}
          <button
            type="button"
            onClick={() => showToast('今日星星已领取，明日再来哦（规则待确认）')}
            className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm font-medium transition-colors text-center active:scale-[0.99]"
          >
            已领取
          </button>
        </section>

        {/* 跑马灯通知栏 */}
        <section className="mx-4 rounded-xl bg-gradient-to-r from-[#fff8e7] to-[#fff2d6] border border-[#ffe7ba] px-3.5 py-2 flex items-center gap-2.5 shadow-xs overflow-hidden">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fa8c16" className="shrink-0">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#fa8c16" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#fa8c16" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
          <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-xs text-amber-900 font-normal">
            <div className="inline-block animate-[marquee_18s_linear_infinite]">
              恭喜用户218161成功兑换了 200元配件券 &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; 恭喜用户217358成功兑换了 挖掘机合金模型 &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; 恭喜用户198402成功兑换了 车载保温杯
            </div>
          </div>
        </section>

        {/* 卡片2：奖品兑换入口卡片 */}
        <section className="mx-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">奖品兑换</h2>
            <button
              type="button"
              onClick={() => onNavigate?.('prizeRedeem')}
              className="flex items-center gap-0.5 text-sm font-semibold text-orange-500 hover:text-orange-600 active:scale-95 transition-transform"
            >
              <span>去兑换</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="rtl:rotate-180"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            每周1,2,3,4,5,6,7 07:00:00 - 23:59:00（UTC+8）开放兑换
          </p>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center">
            <button
              type="button"
              onClick={() => showToast('原型演示：暂无兑换记录')}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 py-1 px-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 12V22H4V12" />
                <path d="M22 7H2v5h20V7z" />
                <path d="M12 22V7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
              <span>查看兑换记录</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="rtl:rotate-180"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </section>

        {/* 区域标题：做任务 赚星星 */}
        <section className="px-4 pt-2">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-amber-300" />
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 tracking-wider">
              <span className="text-amber-500">✦</span>
              <span>做任务 赚星星</span>
              <span className="text-amber-500">✦</span>
            </div>
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-amber-300" />
          </div>

          {/* 任务卡片容器 */}
          <div className="mt-3.5 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 divide-y divide-gray-100">
            {taskList.map((task) => (
              <div key={task.id} className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {task.title}
                    </h3>
                    <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {task.progress}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-normal line-clamp-2">
                    {task.desc}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <span className="text-xs font-bold text-orange-500 whitespace-nowrap">
                    {task.reward}
                  </span>
                  <button
                    type="button"
                    onClick={task.onAction}
                    className="rounded-full border border-[#91d5ff] bg-[#e6f7ff] text-[#0ba8ed] hover:bg-[#bae7ff] active:scale-95 text-xs font-semibold px-3.5 py-1 transition-all whitespace-nowrap shadow-xs"
                  >
                    {task.actionText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 积分规则弹窗 Modal */}
      {showRuleModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
          onClick={() => setShowRuleModal(false)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[80vh] flex flex-col text-left rtl:text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">星星与积分规则</h3>
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 text-xs text-gray-600 space-y-3 leading-relaxed">
              <div className="bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-200/60 font-medium">
                提示：当前阶段为页面原型展示，规则待最终确认。不得实际领取、扣减、下单或发券。
              </div>
              <h4 className="font-bold text-gray-900 text-sm">一、星星如何获取？</h4>
              <p>1. 每日登录 APP 签到即可获取当日星星奖励；</p>
              <p>2. 完成日常任务（如服务召请、圈子互动、设备巡检）可获得对应星星；</p>
              <p>3. 参与官方营销活动、机主认证、问卷反馈可额外获得星星奖励。</p>

              <h4 className="font-bold text-gray-900 text-sm mt-3">二、星星如何使用？</h4>
              <p>1. 星星可在「奖品兑换」专区兑换工程模型、正品工装、保养抵用代金券等精美礼品；</p>
              <p>2. 星星兑换的代金券将直接存入「代金券」卡包中，可在服务结算中抵扣。</p>

              <h4 className="font-bold text-gray-900 text-sm mt-3">三、有效期与清零规则</h4>
              <p>星星有效期及年底清零规则待官方公布，请关注后续更新。</p>
            </div>

            <button
              type="button"
              onClick={() => setShowRuleModal(false)}
              className="mt-2 w-full py-2.5 rounded-xl bg-[#089ded] text-white text-sm font-medium hover:bg-[#0788cf] active:scale-[0.99] transition-all"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {/* 提示 Toast */}
      {toastMessage && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur-xs transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

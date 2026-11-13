import React, { useMemo } from 'react';
import { getCouponById, formatAmount } from '../../data/coupons';

/**
 * 优惠券详情原型组件
 * 遵循需求：COUPON-001 (R-001 / DEC-001 / DEC-002 / STATE-001 / AC-001)
 * 仅用于展示券编号、来源、适用说明、有效期、金额信息、只读记录与失效原因。
 * 无领取、立即使用、核销、申请、激活、扫码等业务写操作。
 */
export default function CouponDetail({ couponId: rawCouponId, context, onBack, onRequireLogin: _onRequireLogin }) {
  const resolvedId = typeof rawCouponId === 'object'
    ? (rawCouponId?.couponId || rawCouponId?.id)
    : (rawCouponId || context?.couponId || context?.id);

  const targetCoupon = resolvedId ? getCouponById(resolvedId) : null;

  // 1. 未知 couponId 不能 fallback 首张券，必须为资源不存在态
  const isCouponNotFound = !targetCoupon;
  const baseCoupon = targetCoupon;

  const isAvailable = baseCoupon?.status === 'available';
  const isInvalid = baseCoupon?.status === 'invalid';
  const isUsed = baseCoupon?.status === 'used';
  const amountLabel = isAvailable ? '可使用额度' : '优惠券总额度';

  // DEC-010: 可使用状态标可使用额度，缺失不回退总额；未激活/暂停/失效标优惠券总额度
  const rawAmount = isAvailable
    ? baseCoupon?.availableAmount
    : (baseCoupon?.totalAmount ?? baseCoupon?.amount);
  const hasAmount = rawAmount !== null && rawAmount !== undefined && rawAmount !== '' && !Number.isNaN(Number(rawAmount));
  const displayAmount = hasAmount ? formatAmount(rawAmount) : '—';

  // 额度明细辅助格式化：币种缺失不默认￥，金额缺失显示“—”不冒充或回退
  const renderQuotaAmount = (val) => {
    if (val === null || val === undefined || val === '' || Number.isNaN(Number(val))) {
      return '—';
    }
    const formatted = formatAmount(val);
    return baseCoupon?.currency ? `${baseCoupon.currency} ${formatted}` : formatted;
  };

  // COUPON-009: 校验是否为有效日期字符串（排除 null、undefined、空字符串、'—'、'待激活' 等非真实日期）
  const isValidDate = (str) => {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    if (!trimmed || trimmed === '—' || trimmed === '待激活') return false;
    return /\d/.test(trimmed);
  };

  // COUPON-009: 有效日期组织（展示上游实际起止，只有一端准确标注、不杜撰；无数据维持“—”）
  const validDateDisplay = useMemo(() => {
    if (!baseCoupon) return '—';
    const from = isValidDate(baseCoupon.validFrom) ? baseCoupon.validFrom.trim() : null;
    const to = isValidDate(baseCoupon.validTo) ? baseCoupon.validTo.trim() : null;

    if (from && to) {
      return `${from} - ${to}`;
    }
    if (to) {
      return `有效期至 ${to}`;
    }
    if (from) {
      return `有效期自 ${from}`;
    }
    return '—';
  }, [baseCoupon]);

  // COUPON-009: 优惠说明（以券实际 instructions 为准，缺失显示“暂无优惠说明”）
  const instructionsText = typeof baseCoupon?.instructions === 'string' && baseCoupon.instructions.trim()
    ? baseCoupon.instructions.trim()
    : null;
  const hasInstructions = Boolean(instructionsText);

  // COUPON-009: 适用范围去重（仅在有值时展示；若与优惠说明内容相同时仅展示一次）
  const scopeTexts = useMemo(() => {
    if (!baseCoupon) return [];
    const texts = [];
    const seen = new Set();
    // 适用范围与优惠说明内容相同时仅展示一次
    if (instructionsText) {
      seen.add(instructionsText);
    }
    [baseCoupon.scopeDescription, baseCoupon.scope].forEach((s) => {
      if (typeof s === 'string' && s.trim()) {
        const trimmed = s.trim();
        if (!seen.has(trimmed)) {
          seen.add(trimmed);
          texts.push(trimmed);
        }
      }
    });
    return texts;
  }, [baseCoupon, instructionsText]);

  return (
    <div className="relative flex flex-col h-full bg-[#F3F4F8] text-gray-900 select-none overflow-hidden">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-20 flex min-h-[52px] items-center justify-between px-3 bg-white border-b border-gray-100">
        <div className="flex items-center min-w-0">
          <button
            type="button"
            onClick={onBack}
            aria-label="返回"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-gray-100 transition-colors"
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
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-gray-900 truncate ml-1">
            优惠券详情
          </h1>
        </div>
      </header>

      {/* 主体视图区域 */}
      <main className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 pb-8">
        {/* 券不存在状态（未知couponId严格进入此态，不fallback） */}
        {isCouponNotFound && (
          <div className="flex flex-col items-center justify-center pt-16 pb-8 text-center bg-white rounded-2xl p-6 shadow-2xs border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-800">优惠券不存在或已移除</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
              未查询到该代金券编号记录，可能已被移除或链接失效。
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2 bg-[#089ded] text-white rounded-full text-xs font-semibold"
              >
                返回列表/消息
              </button>
            </div>
          </div>
        )}

        {/* 正常展示 */}
        {!isCouponNotFound && baseCoupon && (
          <>
            {/* 券主信息卡 */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-2xs border border-gray-100">
              {/* 装饰性票券半圆齿孔 */}
              <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F3F4F8] border border-gray-100" />
              <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F3F4F8] border border-gray-100" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-400 font-medium mb-1">
                    {amountLabel}
                  </div>
                  <div className="flex items-baseline gap-1">
                    {hasAmount && baseCoupon.currency && (
                      <span className={`text-lg font-bold ${isInvalid || isUsed ? 'text-gray-400' : 'text-[#089ded]'}`}>
                        {baseCoupon.currency}
                      </span>
                    )}
                    <span className={`text-3xl font-extrabold tracking-tight break-all ${
                      isInvalid || isUsed ? 'text-gray-400' : (hasAmount ? 'text-[#089ded]' : 'text-gray-400')
                    }`}>
                      {displayAmount}
                    </span>
                  </div>
                </div>

                {/* 状态徽标 */}
                <div className="shrink-0">
                  {baseCoupon.status === 'available' && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      baseCoupon.isExpiringSoon ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}>
                      {baseCoupon.isExpiringSoon ? '即将到期' : (baseCoupon.statusText || '可使用')}
                    </span>
                  )}
                  {baseCoupon.status === 'inactive' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#089ded] border border-blue-200">
                      未激活
                    </span>
                  )}
                  {baseCoupon.status === 'suspended' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200">
                      暂停使用
                    </span>
                  )}
                  {baseCoupon.status === 'invalid' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-500 border border-red-100">
                      {baseCoupon.statusText || '已失效'}
                    </span>
                  )}
                </div>
              </div>

              {/* 券名称 */}
              <h2 className="text-base font-bold text-gray-900 mt-4 break-words leading-snug">
                {baseCoupon.name}
              </h2>

              {/* 有效期 */}
              <div className="mt-4 pt-3.5 border-t border-dashed border-gray-100 text-xs text-gray-400 flex items-center justify-between">
                <span>有效期至</span>
                <span className="font-medium text-gray-600">
                  {baseCoupon.validTo || '—'}
                </span>
              </div>
            </div>

            {/* 额度分层明细卡片（DEC-006：部分使用或锁定才显示对应金额明细） */}
            {(baseCoupon.lockedAmount > 0 || baseCoupon.usedAmount > 0) && (
              <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-2xs space-y-2.5 text-xs">
                <div className="pb-2 border-b border-gray-100">
                  <span className="font-bold text-gray-800">额度明细</span>
                </div>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">优惠券总额度</span>
                    <span className="font-semibold text-gray-800">{renderQuotaAmount(baseCoupon.totalAmount ?? baseCoupon.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>- 已使用额度</span>
                    <span>{renderQuotaAmount(baseCoupon.usedAmount)}</span>
                  </div>
                  {baseCoupon.lockedAmount > 0 && (
                    <div className="flex justify-between items-center text-amber-600">
                      <span>- 锁定额度</span>
                      <span>{renderQuotaAmount(baseCoupon.lockedAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1.5 border-t border-gray-200 text-[#089ded] font-bold text-sm bg-blue-50/50 rounded-lg p-2">
                    <span>= 可使用额度</span>
                    <span>{renderQuotaAmount(baseCoupon.availableAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 失效原因提示（仅自然过期等确认场景显示，额度用完或未定义原因不自造解释） */}
            {baseCoupon.status === 'invalid' && baseCoupon.invalidReason && (
              <div className="rounded-2xl bg-red-50/80 border border-red-200/80 p-4">
                <div className="flex items-center gap-2 text-red-700 text-xs font-bold mb-1">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>失效原因</span>
                </div>
                <p className="text-xs text-red-600 leading-relaxed break-words">
                  {baseCoupon.invalidReason}
                </p>
              </div>
            )}

            {/* 优惠说明与详情（COUPON-009：参考信息结构，展示优惠说明、适用范围、有效日期、可用时段） */}
            <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-2xs space-y-3 text-xs">
              <h3 className="font-bold text-gray-800 pb-2 border-b border-gray-100">优惠说明</h3>
              <div className="space-y-3">
                {/* 优惠说明行（以券实际 instructions 为准，缺失显示“暂无优惠说明”） */}
                <div className="flex items-start gap-3">
                  <span className="w-16 shrink-0 text-gray-400 font-medium">优惠说明</span>
                  <div className={`flex-1 min-w-0 leading-relaxed break-words whitespace-pre-wrap ${
                    hasInstructions ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {hasInstructions ? instructionsText : '暂无优惠说明'}
                  </div>
                </div>

                {/* 适用范围行（仅有值才展示且去重） */}
                {scopeTexts.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="w-16 shrink-0 text-gray-400 font-medium">适用范围</span>
                    <div className="flex-1 min-w-0 space-y-1">
                      {scopeTexts.map((text, idx) => (
                        <p key={idx} className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                          {text}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* 有效日期行（展示上游实际起止，只有一端准确标注、不杜撰；无数据维持“—”） */}
                <div className="flex items-start gap-3">
                  <span className="w-16 shrink-0 text-gray-400 font-medium">有效日期</span>
                  <div className="flex-1 min-w-0 text-gray-700 font-medium leading-relaxed break-words" dir="ltr">
                    {validDateDisplay}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

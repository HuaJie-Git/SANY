import React, { useState, useMemo, useCallback } from 'react';
import { readStoredCoupons, COUPON_SOURCE_TABS, COUPON_STATUS_FILTERS, formatAmount } from '../../data/coupons';

/**
 * 代金券 / 优惠券列表页面
 * 需求：COUPON-001 / COUPON-004 (R-004 / DEC-005 / STATE-003 / AC-005)
 * 参考图：IMG-001
 * 包含：
 * 1. 顶栏白底、品牌蓝高亮、返回箭头、手机框适配
 * 2. 一级分类：全部、优惠券、星星兑换、满额返利（取同源数据，真实空态，返回保留分类）
 * 3. 二级状态筛选：全部状态、可用、未激活、暂停使用、已使用、已失效（按当前来源分类计算数量，返回保留筛选）
 * 4. 券卡片：可使用额度、总额度、锁定额度、币种、名称、有效期、状态、查看详情
 * 5. 底部既有两个按钮：代金券使用记录（只读历史抽屉）、获取代金券（跳转星星兑换）
 */

let lastVoucherSourceTab = 'all';
let lastVoucherStatusFilter = 'all';

export default function Vouchers({ onBack, onNavigate, onRequireLogin: _onRequireLogin }) {
  const rawCoupons = readStoredCoupons();

  // 全部来源中是否包含非优惠券的实际数据并需其旧筛选（含非优惠券且具有已使用状态或使用记录）
  const hasNonCouponUsed = useMemo(() => {
    return rawCoupons.some(
      (c) => c && c.category && c.category !== 'coupon' && (c.status === 'used' || (Array.isArray(c.usedRecords) && c.usedRecords.length > 0))
    );
  }, [rawCoupons]);

  // 根据当前一级来源分类动态确定可用的二级状态筛选：
  // 1. 星星兑换 / 满额返利：保留原有筛选逻辑（包含全部状态、可用、未激活、暂停使用、已使用、已失效）
  // 2. 优惠券分类：严格对齐上游文档4类状态，不把“已使用”设为独立状态（隐藏“已使用”）
  // 3. 全部来源：若当前全是优惠券或无非优惠券已使用旧数据，则隐藏“已使用”；仅当全部来源中有非优惠券实际数据并需其旧筛选时才保留
  const getSupportedStatusFilters = useCallback((sourceTab) => {
    if (sourceTab === 'stars' || sourceTab === 'rebate') {
      return COUPON_STATUS_FILTERS;
    }
    if (sourceTab === 'coupon') {
      return COUPON_STATUS_FILTERS.filter((f) => f.key !== 'used');
    }
    // sourceTab === 'all'
    if (hasNonCouponUsed) {
      return COUPON_STATUS_FILTERS;
    }
    return COUPON_STATUS_FILTERS.filter((f) => f.key !== 'used');
  }, [hasNonCouponUsed]);

  // AC-002: 返回保留来源分类与状态筛选
  const [activeSourceTab, setActiveSourceTab] = useState(() => lastVoucherSourceTab);
  const [activeStatusFilter, setActiveStatusFilter] = useState(() => {
    if (lastVoucherStatusFilter === 'used') {
      const allowedFilters = getSupportedStatusFilters(lastVoucherSourceTab);
      if (!allowedFilters.some((f) => f.key === 'used')) {
        lastVoucherStatusFilter = 'all';
        return 'all';
      }
    }
    return lastVoucherStatusFilter;
  });
  const [toastMessage, setToastMessage] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(''), 2200);
  };

  // COUPON-010: 列表额度明细辅助格式化（缺失显示“—”，币种缺失不默认人民币，数值保真）
  const renderQuotaAmount = (val, currency) => {
    if (val === null || val === undefined || val === '' || Number.isNaN(Number(val))) {
      return '—';
    }
    const formatted = formatAmount(val);
    return currency ? `${currency} ${formatted}` : formatted;
  };

  const handleSourceTabChange = (key) => {
    lastVoucherSourceTab = key;
    setActiveSourceTab(key);
    // COUPON-011: 切换分类时处理当前已使用筛选：
    // 若当前选中的是“已使用”，且目标分类不包含“已使用”筛选（如优惠券分类，或无非优惠券已使用旧数据的全部分类），重置为 all
    const targetFilters = getSupportedStatusFilters(key);
    if (activeStatusFilter === 'used' && !targetFilters.some((f) => f.key === 'used')) {
      lastVoucherStatusFilter = 'all';
      setActiveStatusFilter('all');
    }
  };

  const handleStatusFilterChange = (key) => {
    lastVoucherStatusFilter = key;
    setActiveStatusFilter(key);
  };

  // COUPON-011: 动态二级状态筛选
  const activeStatusFilters = useMemo(() => {
    return getSupportedStatusFilters(activeSourceTab);
  }, [activeSourceTab, getSupportedStatusFilters]);

  // 安全保障：若当前处于不可用筛选状态，自动修正为 'all'，勿错误过滤/隐藏数据
  const effectiveStatusFilter = useMemo(() => {
    if (activeStatusFilter === 'used' && !activeStatusFilters.some((f) => f.key === 'used')) {
      return 'all';
    }
    return activeStatusFilter;
  }, [activeStatusFilter, activeStatusFilters]);

  // AC-002 / AC-005: 当前来源分类下的券列表
  const sourceCoupons = useMemo(() => {
    if (activeSourceTab === 'all') return rawCoupons;
    return rawCoupons.filter((c) => c.category === activeSourceTab);
  }, [rawCoupons, activeSourceTab]);

  // 一级来源分类计数（取自当前数据）
  const sourceTabCounts = useMemo(() => {
    const list = rawCoupons;
    return {
      all: list.length,
      coupon: list.filter((c) => c.category === 'coupon').length,
      stars: list.filter((c) => c.category === 'stars').length,
      rebate: list.filter((c) => c.category === 'rebate').length,
    };
  }, [rawCoupons]);

  // AC-005: 二级状态计数严格按当前来源分类计算同源数据；新增未激活、暂停使用不误入可用
  const statusCounts = useMemo(() => {
    return {
      all: sourceCoupons.length,
      available: sourceCoupons.filter((c) => c.status === 'available').length,
      inactive: sourceCoupons.filter((c) => c.status === 'inactive').length,
      suspended: sourceCoupons.filter((c) => c.status === 'suspended').length,
      used: sourceCoupons.filter((c) => c.status === 'used').length,
      invalid: sourceCoupons.filter((c) => c.status === 'invalid').length,
    };
  }, [sourceCoupons]);

  // 根据二级状态最终过滤
  const filteredCoupons = useMemo(() => {
    if (effectiveStatusFilter === 'all') return sourceCoupons;
    return sourceCoupons.filter((item) => item.status === effectiveStatusFilter);
  }, [sourceCoupons, effectiveStatusFilter]);

  const handleCouponClick = (coupon) => {
    if (!onNavigate) return;
    onNavigate({
      target: 'couponDetail',
      context: { couponId: coupon.id },
      couponId: coupon.id,
    });
  };

  // 使用记录数据（只读展示）
  const usageHistory = useMemo(() => {
    const records = [];
    rawCoupons.forEach((c) => {
      if (c.usedRecords && c.usedRecords.length > 0) {
        c.usedRecords.forEach((r) => {
          records.push({ ...r, couponName: c.name, couponNo: c.couponNo });
        });
      }
    });
    return records;
  }, [rawCoupons]);

  return (
    <div className="relative flex flex-col h-full bg-white text-gray-900 select-none overflow-hidden">
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
            代金券
          </h1>
        </div>
      </header>

      {/* 一级来源选项卡栏：全部、优惠券、星星兑换、满额返利 */}
      <nav aria-label="代金券分类" className="flex border-b border-gray-100 px-3 bg-white shrink-0 overflow-x-auto no-scrollbar gap-1">
        {COUPON_SOURCE_TABS.map((tab) => {
          const isActive = activeSourceTab === tab.key;
          const count = sourceTabCounts[tab.key] ?? 0;
          return (
            <button
              type="button"
              key={tab.key}
              onClick={() => handleSourceTabChange(tab.key)}
              className={`relative py-3 px-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? 'text-[#089ded] font-bold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}（{count}）
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#089ded] rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* 二级状态筛选栏：全部状态、可用、未激活、暂停使用、已失效（按当前来源分类计算） */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#fafbfc] border-b border-gray-100 shrink-0 overflow-x-auto no-scrollbar">
        {activeStatusFilters.map((filter) => {
          const isActive = effectiveStatusFilter === filter.key;
          const filterCount = filter.key === 'all' ? statusCounts.all : (statusCounts[filter.key] ?? 0);
          return (
            <button
              type="button"
              key={filter.key}
              onClick={() => handleStatusFilterChange(filter.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-[#089ded] text-white shadow-2xs font-semibold'
                  : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50'
              }`}
            >
              {filter.label}
              {filter.key !== 'all' && (
                <span className="ml-1 opacity-80">
                  ({filterCount})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 主视图内容区域 */}
      <main className="flex-1 overflow-y-auto p-4 bg-[#F3F4F8] space-y-3 pb-24">
        {/* 1. 空状态（匹配截图 IMG-001 或分类无券） */}
        {filteredCoupons.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-3 shadow-2xs border border-dashed border-gray-200">
              <svg
                width="44"
                height="44"
                viewBox="0 0 48 48"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 14a2 2 0 0 1 2-2h32a2 2 0 0 1 2 2v6a4 4 0 0 0 0 8v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6a4 4 0 0 0 0-8v-6z" />
                <line x1="16" y1="20" x2="24" y2="20" />
                <line x1="16" y1="28" x2="32" y2="28" />
                <circle cx="34" cy="20" r="2" fill="#cbd5e1" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 font-normal tracking-wide">
              {activeSourceTab === 'stars' || activeSourceTab === 'rebate'
                ? '该分类暂无代金券'
                : '没有数据'}
            </p>
            {effectiveStatusFilter !== 'all' && (
              <button
                type="button"
                onClick={() => handleStatusFilterChange('all')}
                className="mt-3 text-xs text-[#089ded] font-medium hover:underline"
              >
                清除状态筛选
              </button>
            )}
          </div>
        )}

        {/* 2. 券卡片列表 */}
        {filteredCoupons.length > 0 && (
          <div className="space-y-3">
            {filteredCoupons.map((coupon) => {
              const isInvalid = coupon.status === 'invalid';
              const isUsed = coupon.status === 'used';
              const isAvailable = coupon.status === 'available';
              const amountLabel = isAvailable ? '可使用额度' : '优惠券总额度';

              // DEC-010: 可使用状态标可使用额度，缺失不回退总额；未激活/暂停/失效标优惠券总额度
              const rawAmount = isAvailable
                ? coupon.availableAmount
                : (coupon.totalAmount ?? coupon.amount);
              const hasAmount = rawAmount !== null && rawAmount !== undefined && rawAmount !== '' && !Number.isNaN(Number(rawAmount));
              const displayAmount = hasAmount ? formatAmount(rawAmount) : '—';

              // COUPON-010: 当券存在已使用或锁定额度时，紧凑展示优惠券总额度、已使用额度、剩余额度；有锁定时额外展示锁定额度
              // 严格限定 coupon.category === 'coupon'，不得把非优惠券（星星兑换、满额返利等）误判
              const isCouponCategory = coupon.category === 'coupon';
              const hasUsed = coupon.usedAmount !== null && coupon.usedAmount !== undefined && Number(coupon.usedAmount) > 0;
              const hasLocked = coupon.lockedAmount !== null && coupon.lockedAmount !== undefined && Number(coupon.lockedAmount) > 0;
              const showQuotaBreakdown = isCouponCategory && (hasUsed || hasLocked);

              return (
                <div
                  key={coupon.id}
                  onClick={() => handleCouponClick(coupon)}
                  className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-2xs border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform"
                >
                  {/* 顶部行：金额与状态 */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-gray-400 font-medium mb-0.5">
                        {amountLabel}
                      </div>
                      <div className="flex items-baseline gap-1">
                        {hasAmount && coupon.currency && (
                          <span className={`text-base font-bold ${isInvalid || isUsed ? 'text-gray-400' : 'text-[#089ded]'}`}>
                            {coupon.currency}
                          </span>
                        )}
                        <span className={`text-2xl font-extrabold tracking-tight break-all ${
                          isInvalid || isUsed ? 'text-gray-400' : (hasAmount ? 'text-[#089ded]' : 'text-gray-400')
                        }`}>
                          {displayAmount}
                        </span>
                      </div>
                    </div>

                    {/* 状态徽标 */}
                    <div className="shrink-0">
                      {coupon.status === 'available' && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          coupon.isExpiringSoon
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}>
                          {coupon.isExpiringSoon ? '即将到期' : (coupon.statusText || '可使用')}
                        </span>
                      )}
                      {coupon.status === 'inactive' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#089ded] border border-blue-200">
                          未激活
                        </span>
                      )}
                      {coupon.status === 'suspended' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-200">
                          暂停使用
                        </span>
                      )}
                      {coupon.status === 'used' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          已失效
                        </span>
                      )}
                      {coupon.status === 'invalid' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-500 border border-red-100">
                          {coupon.statusText || '已失效'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 名称 */}
                  <h3 className="mt-2 text-sm font-bold text-gray-800 break-words leading-snug">
                    {coupon.name}
                  </h3>

                  {/* COUPON-010: 紧凑额度明细（部分使用或锁定才展示） */}
                  {showQuotaBreakdown && (
                    <div className="mt-2.5 rounded-xl bg-gray-50/90 p-2.5 border border-gray-100 text-[11px] leading-tight">
                      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">总额度</span>
                          <span className="font-semibold text-gray-700 font-mono tracking-tight" dir="ltr">
                            {renderQuotaAmount(coupon.totalAmount ?? coupon.amount, coupon.currency)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">已使用</span>
                          <span className="font-semibold text-gray-700 font-mono tracking-tight" dir="ltr">
                            {renderQuotaAmount(coupon.usedAmount, coupon.currency)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">剩余额度</span>
                          <span className="font-semibold text-gray-700 font-mono tracking-tight" dir="ltr">
                            {renderQuotaAmount(coupon.remainingAmount, coupon.currency)}
                          </span>
                        </div>
                        {hasLocked && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <span>锁定额度</span>
                            <span className="font-semibold font-mono tracking-tight" dir="ltr">
                              {renderQuotaAmount(coupon.lockedAmount, coupon.currency)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 底栏：有效期与查看详情 */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">
                      有效期至 {coupon.validTo || '—'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCouponClick(coupon);
                      }}
                      className="inline-flex items-center text-[#089ded] font-semibold active:opacity-75"
                    >
                      查看详情
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-0.5"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 底部按钮栏（固定吸底，完全对齐截图 IMG-001） */}
      <footer className="sticky bottom-0 z-20 border-t border-gray-100 bg-white px-4 py-3 pb-6 flex items-center gap-3 shrink-0 shadow-sm">
        {/* 左侧浅灰按钮：代金券使用记录 */}
        <button
          type="button"
          onClick={() => {
            if (usageHistory.length > 0) {
              setShowHistoryModal(true);
            } else {
              showToast('暂无代金券使用记录');
            }
          }}
          className="flex-1 min-w-0 py-3 px-3 rounded-full bg-[#f6f7f9] hover:bg-gray-100 active:scale-[0.99] text-[#374151] text-xs sm:text-sm font-semibold transition-all text-center truncate shadow-2xs"
        >
          代金券使用记录
        </button>

        {/* 右侧品牌蓝按钮：获取代金券（保留跳转至奖品兑换） */}
        <button
          type="button"
          onClick={() => onNavigate?.('prizeRedeem')}
          className="flex-1 min-w-0 py-3 px-3 rounded-full bg-[#089ded] hover:bg-[#0788cf] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all text-center truncate shadow-xs"
        >
          获取代金券
        </button>
      </footer>

      {/* 代金券使用记录只读弹窗 */}
      {showHistoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/45 backdrop-blur-2xs"
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            className="w-full max-h-[70vh] rounded-t-[24px] bg-white p-5 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-gray-200 mb-3" />
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">代金券使用记录（只读）</h3>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
              >
                关闭
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {usageHistory.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-gray-800">
                    <span className="truncate max-w-[200px]">{item.couponName}</span>
                    <span className="text-[#089ded] shrink-0">{item.amount}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>单号：{item.orderNo}</span>
                    <span>{item.time}</span>
                  </div>
                  {item.note && <div className="text-gray-500 text-[11px] pt-0.5">{item.note}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 提示 Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur-xs transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

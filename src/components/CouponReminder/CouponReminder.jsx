import React, { useState } from 'react';

/**
 * 优惠券手机内顶部提醒横幅
 * 需求：COUPON-001 (R-001 / DEC-001 / STATE-001 / AC-001)
 * 1. 顶部横幅：含标题、摘要、查看、关闭
 * 2. 点击查看进入券详情并可返回来源
 * 3. 优惠券提醒开关关闭时，不弹出横幅（仅停手机提醒，不隐藏站内消息与券数据）
 */
export default function CouponReminder({ onNavigate }) {
  const [activeBanner, setActiveBanner] = useState(null);

  const handleBannerClick = () => {
    if (!activeBanner) return;
    const cid = activeBanner.couponId;
    setActiveBanner(null);
    onNavigate?.({
      target: 'couponDetail',
      context: { couponId: cid },
    });
  };

  return (
    <>
      {/* 手机顶部提醒横幅 */}
      {activeBanner && (
        <div
          role="alert"
          className="absolute top-3 inset-x-3 z-50 rounded-2xl bg-white/95 backdrop-blur-md p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 transition-all animate-in slide-in-from-top-4"
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs font-bold text-xs"
              style={{ backgroundColor: activeBanner.color }}
            >
              券
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  SanVIST · 优惠券提醒
                </span>
                <span className="text-[10px] text-gray-400">现在</span>
              </div>
              <h4 className="text-xs font-bold text-gray-900 mt-0.5 truncate">
                {activeBanner.title}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug line-clamp-2">
                {activeBanner.summary}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBannerClick}
                  className="px-3 py-1 rounded-full bg-[#089ded] text-white text-[11px] font-semibold active:bg-[#0788cf] shadow-2xs"
                >
                  查看详情
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBanner(null)}
                  className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[11px] hover:bg-gray-200"
                >
                  关闭
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveBanner(null)}
              className="text-gray-300 hover:text-gray-500 p-1 -mr-1 -mt-1"
              aria-label="关闭横幅"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

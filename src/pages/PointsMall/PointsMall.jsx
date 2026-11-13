import React from 'react';
import StarDetails from './StarDetails';
import PrizeRedeem from './PrizeRedeem';
import Vouchers from './Vouchers';

export { StarDetails, PrizeRedeem, Vouchers };

const products = [
  { name: '陨落心炎', points: '400000', image: 'images/优惠活动/挖掘机/挖掘机_01.jpg', available: true },
  { name: 'Excavator mode mode mode mod额', points: '999', image: 'images/优惠活动/挖掘机/挖掘机_03.jpg' },
  { name: 'Building blocks', points: '1234', image: 'images/优惠活动/三一起重机/三一起重机_01.jpg' },
  { name: 'Insulated cup', points: '123', image: 'images/优惠活动/三一起重机/三一起重机_01.jpg' },
];

export function PageHeader({ title, onBack, children, rightAction, className = '' }) {
  return (
    <header className={`flex min-h-[56px] items-center gap-3 px-4 ${className}`}>
      <button
        type="button"
        onClick={onBack}
        aria-label="返回"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-gray-100 transition-colors"
      >
        <svg
          width="23"
          height="23"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="rtl:rotate-180"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 className="min-w-0 flex-1 text-xl font-semibold text-gray-900 truncate text-left rtl:text-right">
        {title}
      </h1>
      {rightAction || children}
    </header>
  );
}

export default function PointsMall({ onBack, onNavigate }) {
  return (
    <main className="min-h-full bg-white pb-8 text-gray-900 select-none">
      <PageHeader title="积分商城" onBack={onBack}>
        <button
          type="button"
          onClick={() => onNavigate?.('vouchers')}
          className="text-sm text-[#168bd3] hover:underline"
        >
          积分说明
        </button>
      </PageHeader>
      <div className="px-4">
        <div
          className="mt-3 rounded-xl bg-gradient-to-r from-[#288ee8] to-[#2bc0f1] px-6 py-6 text-white cursor-pointer active:opacity-95 transition-opacity"
          onClick={() => onNavigate?.('starDetails')}
        >
          <div className="text-base flex items-center justify-between">
            <span>我的积分</span>
            <span aria-hidden="true" className="text-xl">›</span>
          </div>
          <div className="mt-2 text-3xl font-semibold">172</div>
        </div>
        <section className="flex items-center gap-3 border-b border-gray-200 py-7">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold">积分订单</h2>
            <p className="mt-1 text-sm text-gray-400">查询我的积分订单</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('prizeRedeem')}
            className="rounded bg-[#0ba8ed] hover:bg-[#0aa0e1] active:scale-95 px-4 py-2 text-sm text-white font-medium transition-all"
          >
            立即查看
          </button>
        </section>
        <section className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">兑换商店</h2>
            <button
              type="button"
              onClick={() => onNavigate?.('prizeRedeem')}
              className="text-xs text-[#0ba8ed] font-medium hover:underline"
            >
              全部奖品 &gt;
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {products.map((product) => (
              <article key={product.name} className="min-w-0">
                <img
                  src={`${import.meta.env.BASE_URL}${product.image}`}
                  alt=""
                  className="aspect-[1.65] w-full rounded-lg object-cover"
                />
                <h3 className="mt-3 min-h-[3rem] break-words text-sm font-medium leading-6 line-clamp-2">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  <span className="mr-1 text-lg font-semibold text-[#119ee4]">
                    {product.points}
                  </span>
                  积分
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate?.('prizeRedeem')}
                  className={`mt-2 w-full rounded py-2 text-sm text-white font-medium active:scale-98 transition-all ${
                    product.available ? 'bg-[#0aa9ed] hover:bg-[#0998d5]' : 'bg-[#8bd3f5]'
                  }`}
                >
                  {product.available ? '兑换' : '已售罄'}
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

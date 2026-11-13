import React, { useState } from 'react';

/**
 * 奖品兑换页面
 * 参考图版式：orca-paste-1794295139002-a196aee5-fcf9-4bde-9942-3f7c04b1f209.png
 * 要求：
 * 1. 版式参考双列网格卡片，奖品自行设计（工程机械/SanVist主题），不照抄图中内容
 * 2. 包含缺货（剩余0、置灰缺货按钮、卡片状态标签）与可兑换（剩余库存、高亮兑换按钮）
 * 3. 不走业务逻辑，先实现页面；不得实际领取、扣减、下单或发券，规则待确认
 * 4. 支持返回与长文本、RTL 布局空间
 */
export default function PrizeRedeem({ onBack, onNavigate, userStars = 172 }) {
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(''), 2200);
  };

  // 自行设计的工程机械与 SanVist 专属定制奖品数据
  const prizes = [
    {
      id: 'p1',
      name: '三一重工挖掘机合金工程模型 (1:35)',
      stars: 120,
      stock: 5,
      isAvailable: true,
      tag: '精选模型',
      image: 'images/机手社区/挖掘机/挖掘机_01.jpg',
      desc: '原厂锌合金压铸，高保真履带可转动，回转台360度可旋转。',
    },
    {
      id: 'p2',
      name: 'SanVist 定制专业防砸透气安全帽',
      stars: 45,
      stock: 16,
      isAvailable: true,
      tag: '原厂工品',
      image: 'images/配件/OIP (1).webp',
      desc: '高强度ABS防砸材质，透气减震内衬，符合GB2811国标标准。',
    },
    {
      id: 'p3',
      name: '500元 原厂正品保养抵用代金券',
      stars: 80,
      stock: 25,
      isAvailable: true,
      tag: '服务券',
      image: 'images/行业动态/三一起重机/三一起重机_01.jpg',
      desc: '适用于全国合作特约网点主机及底盘定期保养工时费抵扣。',
    },
    {
      id: 'p4',
      name: '200元 原厂易损配件兑换券',
      stars: 35,
      stock: 50,
      isAvailable: true,
      tag: '配件券',
      image: 'images/配件/OIP (2).webp',
      desc: '可兑换滤芯、齿套、销轴等常用工程机械易损配件。',
    },
    {
      id: 'p5',
      name: '智能数显车载不锈钢保温杯',
      stars: 25,
      stock: 0,
      isAvailable: false,
      tag: '缺货',
      image: 'images/accessory_02.webp',
      desc: '316L医用级不锈钢，触控实时数显水温，强效保温24小时。',
    },
    {
      id: 'p6',
      name: '工程机械全季多功能工装外套',
      stars: 90,
      stock: 0,
      isAvailable: false,
      tag: '缺货',
      image: 'images/机手社区/矿卡/矿卡_02.jpg',
      desc: '耐磨防刮撕裂面料，夜间高亮反光条安全警示，多兜工装设计。',
    },
    {
      id: 'p7',
      name: 'SanVist 车载多功能应急维修工具箱',
      stars: 65,
      stock: 8,
      isAvailable: true,
      tag: '实用工具',
      image: 'images/配件/OIP (4).webp',
      desc: '含高硬度铬钒钢扳手、防滑套筒、测电笔及应急电筒。',
    },
    {
      id: 'p8',
      name: '100元 燃油消费代金券',
      stars: 20,
      stock: 0,
      isAvailable: false,
      tag: '缺货',
      image: 'images/配件/OIP (5).webp',
      desc: '可在指定合作油站加油时直接出示条码抵扣使用。',
    },
  ];

  const handlePrizeClick = (item) => {
    if (!item.isAvailable) {
      showToast('该奖品已兑罄，下一轮补货敬请期待');
      return;
    }
    setSelectedPrize(item);
  };

  const handleConfirmRedeem = () => {
    // 严格满足要求：不得实际领取、扣减、下单或发券，规则待确认
    setSelectedPrize(null);
    showToast('操作演示成功：规则待确认中，未扣减星星');
  };

  return (
    <div className="relative flex flex-col h-full bg-[#f4f5f7] text-gray-900 select-none overflow-hidden">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 flex min-h-[52px] items-center justify-between px-3 bg-white border-b border-gray-100 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
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
              className="rtl:rotate-180"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-gray-900 truncate text-left rtl:text-right">
            奖品兑换
          </h1>
        </div>

        {/* 当前星星余额徽章 */}
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/70 text-amber-900 px-3 py-1 rounded-full text-xs font-semibold shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#fa8c16">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>{userStars} 星星</span>
        </div>
      </header>

      {/* 原型预览提示条 */}
      <div className="bg-[#fff7e6] text-[#ad6800] text-[11px] px-3.5 py-1.5 border-b border-[#ffe7ba] flex items-center justify-between shrink-0">
        <span>原型演示：奖品规则待确认，暂未开放实际兑换与扣减</span>
        <button
          type="button"
          onClick={() => onNavigate?.('vouchers')}
          className="text-[#089ded] font-medium ml-2 whitespace-nowrap hover:underline"
        >
          查看代金券 &gt;
        </button>
      </div>

      {/* 奖品双列网格区 */}
      <main className="flex-1 overflow-y-auto p-3 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {prizes.map((item) => {
            const isSoldOut = !item.isAvailable;
            return (
              <article
                key={item.id}
                className="rounded-xl bg-white overflow-hidden shadow-2xs border border-gray-100 flex flex-col justify-between transition-transform duration-150 hover:shadow-xs"
              >
                {/* 奖品图片区 */}
                <div className="relative aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={`${import.meta.env.BASE_URL}${item.image}`}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-opacity ${
                      isSoldOut ? 'opacity-50 grayscale-20' : 'opacity-100'
                    }`}
                    loading="lazy"
                  />

                  {/* 状态角标 */}
                  <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs ${
                        isSoldOut
                          ? 'bg-black/55 text-white'
                          : 'bg-[#089ded]/90 text-white shadow-xs'
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>
                </div>

                {/* 奖品文本区 */}
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2rem] break-words text-left rtl:text-right">
                      {item.name}
                    </h2>

                    <div className="mt-2 flex items-center justify-between text-left rtl:text-right">
                      {/* 星星价格 */}
                      <div className="flex items-center gap-1 text-orange-500 font-bold text-xs">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#fa8c16">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span>{item.stars} 颗星星</span>
                      </div>

                      {/* 剩余库存 */}
                      <span className="text-[11px] text-gray-400 font-normal whitespace-nowrap">
                        剩余{item.stock}
                      </span>
                    </div>
                  </div>

                  {/* 底部兑换操作按钮 */}
                  <div className="mt-2.5">
                    {isSoldOut ? (
                      <button
                        type="button"
                        onClick={() => handlePrizeClick(item)}
                        className="w-full py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-medium cursor-not-allowed text-center transition-colors"
                      >
                        缺货
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePrizeClick(item)}
                        className="w-full py-1.5 rounded-lg bg-[#089ded] hover:bg-[#0788cf] active:scale-[0.98] text-white text-xs font-medium shadow-xs text-center transition-all"
                      >
                        兑换
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* 兑换预览弹窗 */}
      {selectedPrize && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
          onClick={() => setSelectedPrize(null)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col text-left rtl:text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">奖品兑换确认</h3>
              <button
                type="button"
                onClick={() => setSelectedPrize(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex gap-3 items-center">
                <img
                  src={`${import.meta.env.BASE_URL}${selectedPrize.image}`}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-gray-900 leading-snug break-words">
                    {selectedPrize.name}
                  </h4>
                  <p className="text-xs text-orange-500 font-semibold mt-1">
                    需要 {selectedPrize.stars} 颗星星
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/60 text-xs text-amber-800 leading-relaxed font-medium">
                【原型演示提示】规则待确认，本次操作不会真正扣减您的星星余额或生成真实发运订单。
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>当前星星余额：</span>
                  <span className="font-semibold text-gray-800">{userStars} 颗</span>
                </div>
                <div className="flex justify-between">
                  <span>兑换后预计剩余：</span>
                  <span className="font-semibold text-gray-800">
                    {Math.max(0, userStars - selectedPrize.stars)} 颗
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPrize(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 active:scale-[0.99] transition-all"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmRedeem}
                className="flex-1 py-2.5 rounded-xl bg-[#089ded] text-white text-sm font-medium hover:bg-[#0788cf] active:scale-[0.99] transition-all shadow-xs"
              >
                确认兑换（演示）
              </button>
            </div>
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

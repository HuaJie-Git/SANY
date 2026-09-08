import React from 'react';

const ProductCenter = ({ onBack, initialItem }) => {
  const product = initialItem || {
    name: '车载混凝土泵',
    code: 'SYM5180THBES 30C-8',
    image: 'images/asset-models/sany_pump.jpg',
  };

  return (
    <div className="flex h-full flex-col bg-white text-gray-900">
      <header className="flex h-[56px] flex-shrink-0 items-center border-b border-gray-100 px-4">
        <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-gray-100" aria-label="返回">
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <h1 className="flex-1 pr-9 text-center text-[17px] font-semibold">产品中心</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-5">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_5px_20px_rgba(31,41,55,0.07)]">
          <div className="flex h-[280px] items-center justify-center bg-[#fafafa] p-5">
            <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
          </div>
          <div className="px-5 py-5 text-center">
            <h2 className="text-[22px] font-semibold leading-8">{product.name || '--'}</h2>
            <div className="mt-3 inline-flex max-w-full items-center rounded-lg bg-gray-50 px-4 py-2 text-[15px] leading-5 tabular-nums text-gray-700">
              <span className="truncate" title={product.code}>{product.code || '--'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductCenter;

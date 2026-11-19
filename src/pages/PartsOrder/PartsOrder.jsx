import React, { useState, useEffect } from 'react';

const PartsOrder = ({
  onBack,
  initialQuery = '',
  initialItem = null,
  demoMode = false,
  onRequireLogin = null,
  onMountSuccess = null,
}) => {
  const [activeTab, setActiveTab] = useState('materials');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedPartDetail, setSelectedPartDetail] = useState(() => initialItem);
  const [orderToast, setOrderToast] = useState('');

  useEffect(() => {
    onMountSuccess?.(initialItem);
  }, [initialItem, onMountSuccess]);

  // 配件预置演示数据（保留原有演示字段，不臆造价格、库存、机型与适配）
  const baseParts = [
    {
      id: 1,
      code: 'YLJ008157110',
      name: '噪音标识',
      image: 'images/配件/噪音标识.jpg',
    },
    {
      id: 2,
      code: 'YLJ006374374',
      name: '安装带',
      image: 'images/配件/安装带.jpg',
    },
    {
      id: 3,
      code: 'ZZX005635140',
      name: '链条',
      image: 'images/配件/链条.jpg',
    },
    {
      id: 4,
      code: 'ZZX008325559',
      name: '轮罩左后连接板',
      image: 'images/配件/轮罩左后连接板.jpg',
    },
    {
      id: 5,
      code: 'YLJ006508846',
      name: '冷凝器安装支板一',
      image: 'images/配件/冷凝器安装支板一.jpg',
    },
    {
      id: 6,
      code: 'YLJ006455641',
      name: '中冷器进气管',
      image: 'images/配件/中冷器进气管.jpg',
    },
    {
      id: 7,
      code: 'YLJ006508847',
      name: '冷凝器安装支板二',
      image: 'images/配件/冷凝器安装支板二.jpg',
    },
    {
      id: 8,
      code: 'YLJ006455642',
      name: '中冷器出气管',
      image: 'images/配件/中冷器出气管.jpg',
    },
  ];

  // 搜索选中的配件：严格仅保留已有演示数据中提供的字段，不虚构库存与适用机型
  const searchedPart = initialItem ? {
    id: `searched-${initialItem.id || initialItem.code}`,
    code: initialItem.code || initialItem.model,
    name: initialItem.name,
    image: initialItem.image,
    price: initialItem.price,
    currency: initialItem.currency,
    stock: initialItem.stock,
    spec: initialItem.spec,
    model: initialItem.model,
  } : null;

  const keyword = searchQuery.trim().toLowerCase();
  const parts = [searchedPart, ...baseParts]
    .filter(Boolean)
    .filter((part, index, list) => list.findIndex((item) => item.code === part.code) === index)
    .filter((part) => !keyword || `${part.code}${part.name}`.toLowerCase().includes(keyword));

  // 处理返回：若由搜索携带 initialItem 进入，返回时直接退回搜索结果页，避免被困配件列表；
  // 若在配件列表内自主点击卡片查看详情，返回时退回配件列表。
  const handleBack = () => {
    if (initialItem) {
      onBack?.();
      return;
    }
    if (selectedPartDetail) {
      setSelectedPartDetail(null);
      return;
    }
    onBack?.();
  };

  // 处理搜索
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // 处理扫码（游客门禁）
  const handleScan = () => {
    if (demoMode) {
      onRequireLogin?.('扫码功能登录后可使用');
      return;
    }
    console.log('扫码');
  };

  // 处理配件选择：打开公开配件详情，不直接拦截登录
  const handlePartSelect = (part) => {
    setSelectedPartDetail(part);
  };

  // 渲染配件详情视图（游客与登录态均公开可查）
  if (selectedPartDetail) {
    const code = selectedPartDetail.code || selectedPartDetail.model || '--';
    const name = selectedPartDetail.name || '--';
    const priceText = selectedPartDetail.price
      ? (selectedPartDetail.currency ? `${selectedPartDetail.currency} ${selectedPartDetail.price}` : selectedPartDetail.price)
      : null;
    const stockBadge = selectedPartDetail.stock || null;
    const specText = selectedPartDetail.spec || null;

    return (
      <div className="relative flex h-full w-full flex-col bg-white">
        {/* 顶部导航栏 */}
        <div className="flex items-center px-4 py-3 border-b border-gray-100 bg-white">
          <button
            type="button"
            onClick={handleBack}
            className="w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-100"
            aria-label="返回"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="flex-1 text-center text-base font-semibold text-gray-900">配件详情</h1>
          <div className="w-8" />
        </div>

        {/* 详情内容区域（仅展示数据中明确提供的字段，不虚构宣传与认证承诺） */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="aspect-video w-full rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 p-4">
            {selectedPartDetail.image ? (
              <img src={selectedPartDetail.image} alt={name} className="max-h-full max-w-full object-contain" />
            ) : (
              <div className="text-gray-400 text-sm">暂无配件图片</div>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-[18px] font-bold text-gray-900 break-words break-all">{name}</span>
              {stockBadge && (
                <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {stockBadge}
                </span>
              )}
            </div>
            {priceText ? (
              <div className="mt-1 text-[16px] font-bold text-red-600">
                {priceText}
              </div>
            ) : (
              <div className="mt-1 text-[13px] text-gray-400">
                价格：待确认
              </div>
            )}
          </div>

          <div className="rounded-xl bg-gray-50 p-3.5 space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-gray-500">配件编号</span>
              <span className="font-medium text-gray-800 break-words break-all">{code}</span>
            </div>
            {selectedPartDetail.model && (
              <div className="flex justify-between">
                <span className="text-gray-500">配件型号</span>
                <span className="font-medium text-gray-800 break-words break-all">{selectedPartDetail.model}</span>
              </div>
            )}
            {/* 仅在数据明确提供适用设备字段且有可信依据时显示适用机型；缺失不推断 */}
            {(selectedPartDetail.applicableDevice || selectedPartDetail.applicableModel) && (
              <div className="flex justify-between">
                <span className="text-gray-500">适用机型</span>
                <span className="font-medium text-gray-800 break-words break-all">
                  {selectedPartDetail.applicableDevice || selectedPartDetail.applicableModel}
                </span>
              </div>
            )}
            {selectedPartDetail.stock && (
              <div className="flex justify-between">
                <span className="text-gray-500">库存状态</span>
                <span className="font-medium text-gray-800 break-words break-all">{selectedPartDetail.stock}</span>
              </div>
            )}
          </div>

          {specText && (
            <div>
              <h3 className="text-[14px] font-bold text-gray-900 mb-1.5">规格参数</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed break-words break-all">
                {specText}
              </p>
            </div>
          )}

          {orderToast && (
            <div className="rounded-lg bg-black/75 px-4 py-2 text-[12px] text-white text-center">
              {orderToast}
            </div>
          )}
        </div>

        {/* 底部操作栏：报价订购才拦截登录 */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-3 flex items-center gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-[14px] font-medium active:bg-gray-50"
          >
            返回
          </button>
          <button
            type="button"
            onClick={() => {
              if (demoMode) {
                onRequireLogin?.('报价或订购功能登录后可使用');
                return;
              }
              setOrderToast('已加入订购意向清单');
              window.setTimeout(() => setOrderToast(''), 2000);
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#E01923] text-white text-[14px] font-bold active:bg-[#c4151e] shadow-sm"
          >
            申请报价 / 订购
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-white">
      {/* 顶部导航栏 */}
      <div className="flex items-center px-4 py-3 border-b border-gray-100">
        <button
          onClick={handleBack}
          className="w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-100"
          aria-label="返回"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="flex-1 text-center text-base font-medium">配件</h1>
        <div className="w-8" />
      </div>

      {/* Tab切换 */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('devices')}
          className={`flex-1 py-3 text-sm font-medium text-center ${
            activeTab === 'devices'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-gray-500'
          }`}
        >
          设备
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex-1 py-3 text-sm font-medium text-center ${
            activeTab === 'materials'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-gray-500'
          }`}
        >
          物料
        </button>
      </div>

      {/* 搜索框 */}
      <div className="px-4 py-3">
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="搜索物料"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <button onClick={handleScan} className="ml-2" aria-label="扫码">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 配件列表 */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {parts.map((part) => (
            <div
              key={part.id}
              onClick={() => handlePartSelect(part)}
              className="bg-white rounded-lg overflow-hidden border border-gray-100 cursor-pointer active:scale-[0.99] transition"
            >
              <div className="aspect-square bg-gray-50 flex items-center justify-center p-2">
                {part.image ? (
                  <img src={part.image} alt={part.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-3">
                <div className="text-xs font-medium text-gray-900 mb-1 break-words break-all">{part.code}</div>
                <div className="text-xs text-gray-500 break-words break-all">{part.name}</div>
                {part.price && (
                  <div className="text-xs font-semibold text-red-600 mt-1">
                    {part.currency ? `${part.currency} ${part.price}` : part.price}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartsOrder;

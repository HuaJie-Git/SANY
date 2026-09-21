import React, { useState, useMemo } from 'react';

const SERVICE_CENTERS = [
  {
    id: 'beijing',
    name: '北京全球服务中心',
    phone: '0086-4006098318',
    email: 'CRD@sany.com.cn',
    whatsapp: '+8619908478631',
    whatsappNote: '(仅用于 WhatsApp)',
    country: '中国',
    city: '北京',
  },
  {
    id: 'usa',
    name: '美国服务中心',
    phone: '678-374-4122',
    email: 'service@sanyamerica.com',
    country: '美国',
    city: '佐治亚州 Peachtree City',
  },
  {
    id: 'panama',
    name: '巴拿马',
    phone: '507-8337986',
    country: '巴拿马',
    city: '巴拿马城',
  },
  {
    id: 'peru',
    name: '秘鲁',
    phone: '51-15100981',
    country: '秘鲁',
    city: '利马',
  },
  {
    id: 'india',
    name: '印度服务中心',
    email: 'customercare@sanygroup.com',
    phone: '1800-209-3337',
    country: '印度',
    city: '浦那 (Pune)',
  },
  {
    id: 'germany',
    name: '欧洲服务中心 (德国)',
    phone: '+49-2272-90531-0',
    email: 'service-europe@sanygroup.com',
    country: '德国',
    city: '贝德堡 (Bedburg)',
  },
];

const ServiceCenter = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2000);
  };

  const handlePhoneClick = (phone) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(phone).catch(() => {});
    }
    showToast(`正在呼叫 ${phone} (已复制)`);
  };

  const handleEmailClick = (email) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(email).catch(() => {});
    }
    showToast(`邮箱 ${email} 已复制到剪贴板`);
  };

  const handleWhatsAppClick = (whatsapp) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(whatsapp).catch(() => {});
    }
    showToast(`WhatsApp ${whatsapp} 已复制`);
  };

  const filteredCenters = useMemo(() => {
    if (!searchQuery.trim()) return SERVICE_CENTERS;
    const q = searchQuery.toLowerCase();
    return SERVICE_CENTERS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.country && c.country.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
    );
  }, [searchQuery]);

  const topHighlightCenter = SERVICE_CENTERS[0];

  return (
    <div className="relative flex h-full w-full flex-col bg-[#F3F4F6] text-gray-900 overflow-hidden" dir="auto">
      {/* 顶部深灰/深蓝黑世界地图轮廓背景区 (图 2) */}
      <div className="relative flex-shrink-0 bg-[#353A47] text-white px-5 pt-3 pb-6 shadow-md">
        {/* 背景轻量微世界地图 SVG 轮廓 */}
        <div className="pointer-events-none absolute inset-0 opacity-15 overflow-hidden flex items-center justify-center">
          <svg width="400" height="240" viewBox="0 0 1000 500" fill="white">
            <path d="M150,150 Q180,100 260,120 T360,180 T260,250 T160,200 Z" />
            <path d="M500,100 Q650,80 750,140 T850,220 T650,240 T500,180 Z" />
            <path d="M250,300 Q300,280 320,380 T260,450 T220,360 Z" />
            <path d="M550,280 Q620,270 650,340 T600,420 T540,350 Z" />
            <path d="M780,320 Q840,310 880,360 T820,430 Z" />
          </svg>
        </div>

        {/* 顶部操作条 */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 active:bg-white/10"
              aria-label="返回"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="ml-1 text-[18px] font-bold text-white">服务中心</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowSearchBar(!showSearchBar)}
            className="flex h-9 w-9 items-center justify-center text-white/90 active:bg-white/10"
            aria-label="搜索服务中心"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        {/* 动态搜索框 */}
        {showSearchBar && (
          <div className="relative z-10 mt-3">
            <div className="flex h-9 w-full items-center rounded-lg bg-white/20 px-3 backdrop-blur-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 text-white/70">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索服务中心、国家或城市"
                className="w-full bg-transparent text-[13px] text-white placeholder-white/60 outline-none"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-white/60">
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* 顶部精选服务中心信息 (图2 头部大字) */}
        <div className="relative z-10 mt-4">
          <h2 className="text-[20px] font-bold text-white tracking-tight">{topHighlightCenter.name}</h2>
          <div className="mt-3 space-y-2 text-[14px]">
            {/* 电话 */}
            <div
              onClick={() => handlePhoneClick(topHighlightCenter.phone)}
              className="flex items-center space-x-2 text-white/90 cursor-pointer active:opacity-75"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="underline underline-offset-4">{topHighlightCenter.phone}</span>
            </div>

            {/* 邮箱 */}
            <div
              onClick={() => handleEmailClick(topHighlightCenter.email)}
              className="flex items-center space-x-2 text-white/90 cursor-pointer active:opacity-75"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span className="underline underline-offset-4">{topHighlightCenter.email}</span>
            </div>

            {/* WhatsApp */}
            <div
              onClick={() => handleWhatsAppClick(topHighlightCenter.whatsapp)}
              className="flex items-center space-x-2 text-white/90 cursor-pointer active:opacity-75"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span className="underline underline-offset-4">{topHighlightCenter.whatsapp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 下方卡片流 (图 2 圆角卡片，浅灰背景) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-12">
        {filteredCenters.map((center) => (
          <div
            key={center.id}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
          >
            <h3 className="text-[17px] font-bold text-gray-900">{center.name}</h3>

            <div className="mt-3 space-y-2 text-[14px]">
              {/* 电话 */}
              {center.phone && (
                <div
                  onClick={() => handlePhoneClick(center.phone)}
                  className="flex items-center space-x-2 text-[#3B82F6] cursor-pointer active:opacity-75"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="font-medium">{center.phone}</span>
                </div>
              )}

              {/* 邮箱 */}
              {center.email && (
                <div
                  onClick={() => handleEmailClick(center.email)}
                  className="flex items-center space-x-2 text-[#3B82F6] cursor-pointer active:opacity-75"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span className="font-medium break-all">{center.email}</span>
                </div>
              )}

              {/* WhatsApp */}
              {center.whatsapp && (
                <div
                  onClick={() => handleWhatsAppClick(center.whatsapp)}
                  className="flex items-center space-x-2 text-[#3B82F6] cursor-pointer active:opacity-75"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <span className="font-medium">
                    {center.whatsapp} <span className="text-[13px] text-gray-500">{center.whatsappNote}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 轻提示 Toast */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-900/90 px-4 py-2 text-[13px] text-white shadow-lg backdrop-blur-sm">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ServiceCenter;

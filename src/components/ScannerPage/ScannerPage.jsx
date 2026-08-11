import React, { useEffect, useRef, useState } from 'react';

const demoResults = {
  asset: {
    type: 'asset',
    eyebrow: '设备识别成功',
    title: 'SANY SY365H',
    code: '设备序列号：SY365-2026-001',
    badge: '已绑定 · 在线',
  },
  part: {
    type: 'part',
    eyebrow: '配件识别成功',
    title: '液压油滤芯',
    code: '配件号：HX-2024-001',
    badge: '配件信息已识别',
  },
  pc: {
    type: 'pc',
    eyebrow: 'PC 登录确认',
    title: 'SanVIST 管理平台',
    code: 'Chrome · Windows · 上海',
    badge: '二维码 52 秒后失效',
  },
  link: {
    type: 'link',
    eyebrow: '已识别链接',
    title: 'SanVIST 设备资料',
    code: 'https://work.sany.com.cn/device/guide',
    badge: '打开前请确认来源',
  },
};

const ScannerPage = ({ onClose, onUseSearch, onOpenAsset }) => {
  const [stage, setStage] = useState('scanning');
  const [result, setResult] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState('');
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const showToast = (message) => {
    setToast(message);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(''), 1800);
  };

  const simulateResult = (type = 'asset') => {
    setStage('recognizing');
    timerRef.current = setTimeout(() => {
      if (type === 'asset') {
        onOpenAsset?.();
        return;
      }
      setResult(demoResults[type]);
      setStage('result');
    }, 650);
  };

  if (stage === 'result' && result) {
    return (
      <div className="absolute inset-0 z-[70] flex flex-col bg-[#f4f5f7] text-[#252b33]">
        <div className="h-[44px] flex items-center justify-between px-4 bg-white">
          <span className="text-[14px] font-medium">9:41</span>
          <span className="text-[12px] text-gray-400">SanVIST 安全识别</span>
        </div>
        <div className="h-[52px] px-4 flex items-center bg-white border-b border-gray-100">
          <button type="button" aria-label="返回扫描" className="w-9 h-9 -ml-2 flex items-center justify-center" onClick={() => setStage('scanning')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="#252b33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <strong className="text-[16px]">识别结果</strong>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-[#10a36f] text-[13px] font-medium mb-3">
              <span className="w-6 h-6 rounded-full bg-[#eaf8f2] flex items-center justify-center">✓</span>
              {result.eyebrow}
            </div>
            <div className="flex gap-3 items-center">
              <div className={`w-[72px] h-[72px] rounded-xl flex items-center justify-center ${result.type === 'part' ? 'bg-[#fff4e6]' : result.type === 'pc' || result.type === 'link' ? 'bg-[#eef3ff]' : 'bg-[#f1f3f5]'}`}>
                {result.type === 'part' ? (
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none"><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" stroke="#df7b20" strokeWidth="1.6"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9" stroke="#df7b20" strokeWidth="1.6"/></svg>
                ) : result.type === 'pc' ? (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="13" rx="2" stroke="#3b6eea" strokeWidth="1.6"/><path d="M8 21h8M12 17v4" stroke="#3b6eea" strokeWidth="1.6" strokeLinecap="round"/></svg>
                ) : result.type === 'link' ? (
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15M14 11a5 5 0 0 0-7.54-.54l-2 2a5 5 0 0 0 7.07 7.07l1.14-1.14" stroke="#3b6eea" strokeWidth="1.8" strokeLinecap="round"/></svg>
                ) : (
                  <img src="images/机手社区/挖掘机/挖掘机_01.jpg" alt="SANY SY365H" className="w-full h-full object-cover rounded-xl" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[18px] font-bold truncate">{result.title}</div>
                <div className="text-[12px] text-gray-500 mt-1">{result.code}</div>
                <span className={`inline-flex mt-2 px-2 py-1 rounded-full text-[11px] ${result.type === 'pc' ? 'bg-[#fff7e8] text-[#b66d00]' : 'bg-[#eaf8f2] text-[#078a59]'}`}>{result.badge}</span>
              </div>
            </div>
          </div>

          {result.type === 'part' && (
            <div className="bg-white rounded-2xl p-4 mt-3 shadow-sm border border-gray-100">
              <div className="text-[14px] font-semibold">配件信息</div>
              <p className="text-[12px] text-gray-500 mt-2 leading-5">展示配件名称、配件号和可用的基础信息；未关联主机时不直接给出适配结论。</p>
              <button type="button" className="w-full h-11 rounded-xl bg-[#252b33] text-white text-[13px] mt-4" onClick={() => showToast('进入配件详情')}>查看配件详情</button>
            </div>
          )}

          {result.type === 'pc' && (
            <div className="bg-white rounded-2xl p-4 mt-3 shadow-sm border border-gray-100">
              <div className="text-[14px] font-semibold">登录确认</div>
              <p className="text-[12px] text-gray-500 mt-2 leading-5">确认由当前账号登录上方电脑。若非本人操作，请选择拒绝。</p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button type="button" className="h-11 rounded-xl border border-gray-200 text-[13px]" onClick={() => setStage('scanning')}>拒绝</button>
                <button type="button" className="h-11 rounded-xl bg-[#252b33] text-white text-[13px]" onClick={() => showToast('已确认 PC 登录')}>确认登录</button>
              </div>
            </div>
          )}

          {result.type === 'link' && (
            <div className="bg-white rounded-2xl p-4 mt-3 shadow-sm border border-gray-100">
              <div className="text-[14px] font-semibold">链接确认</div>
              <p className="text-[12px] text-gray-500 mt-2 leading-5">扫码结果为网页链接时，先展示来源和完整地址，不自动跳转。非信任来源需明确风险提示。</p>
              <div className="mt-3 p-3 rounded-xl bg-[#fff7e8] text-[12px] text-[#9b6000]">请确认链接来源，谨防非官方页面索要账号或验证码。</div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button type="button" className="h-11 rounded-xl border border-gray-200 text-[13px]" onClick={() => showToast('链接已复制')}>复制链接</button>
                <button type="button" className="h-11 rounded-xl bg-[#252b33] text-white text-[13px]" onClick={() => showToast('演示：确认后打开')}>确认打开</button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <button type="button" className="w-full h-12 rounded-full bg-[#252b33] text-white text-[14px] font-medium" onClick={() => setStage('scanning')}>
            继续扫描
          </button>
        </div>
        {toast && <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/75 text-white text-[12px] px-4 py-2 rounded-full whitespace-nowrap">{toast}</div>}
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div className="absolute inset-0 z-[70] bg-white flex flex-col text-[#252b33]">
        <div className="h-[44px] px-4 flex items-center justify-between"><span className="text-[14px] font-medium">9:41</span></div>
        <div className="h-[52px] px-4 flex items-center border-b border-gray-100">
          <button type="button" className="w-9 h-9 -ml-2" onClick={() => setStage('scanning')}>←</button><strong>识别结果</strong>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-[#fff4e6] flex items-center justify-center text-[34px]">?</div>
          <h2 className="text-[18px] font-bold mt-5">暂不支持此类型</h2>
          <p className="text-[13px] text-gray-500 mt-2 leading-5">已识别文本“{result?.raw || 'UNKNOWN-2026'}”，可以继续用全局搜索查找。</p>
          <button type="button" className="w-full h-12 rounded-full bg-[#252b33] text-white mt-8" onClick={() => onUseSearch?.(result?.raw || 'UNKNOWN-2026')}>转全局搜索</button>
          <button type="button" className="w-full h-11 text-gray-500 mt-2" onClick={() => setStage('scanning')}>重新扫描</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[70] bg-[#12161d] text-white flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 40%, #5f6e83 0%, #1b232e 38%, #0b0e13 75%)' }} />
      <div className="relative z-20 h-[44px] flex items-center justify-between px-4">
        <span className="text-[14px] font-medium">9:41</span><span className="text-[11px] text-white/60">安全扫码</span>
      </div>
      <div className="relative z-30 h-[52px] px-4 flex items-center justify-between">
        <button
          type="button"
          aria-label="关闭扫码"
          className="relative z-40 w-10 h-10 -ml-2 rounded-full flex items-center justify-center bg-white/10"
          onPointerDown={onClose}
          onMouseDown={onClose}
          onTouchStart={onClose}
          onClick={onClose}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 6 6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <strong className="text-[16px]">扫一扫</strong>
        <span className="w-10" aria-hidden="true" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 -mt-8">
        <button type="button" aria-label="扫描示例设备码" className="relative w-[246px] h-[246px]" onClick={() => simulateResult('asset')}>
          <span className="absolute left-0 top-0 w-12 h-12 border-l-[3px] border-t-[3px] border-white rounded-tl-2xl" />
          <span className="absolute right-0 top-0 w-12 h-12 border-r-[3px] border-t-[3px] border-white rounded-tr-2xl" />
          <span className="absolute left-0 bottom-0 w-12 h-12 border-l-[3px] border-b-[3px] border-white rounded-bl-2xl" />
          <span className="absolute right-0 bottom-0 w-12 h-12 border-r-[3px] border-b-[3px] border-white rounded-br-2xl" />
          <span className="absolute left-3 right-3 top-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#ff607f] to-transparent shadow-[0_0_12px_#ff607f]" />
          <span className="absolute inset-7 rounded-xl border border-white/10 flex items-center justify-center">
            <svg width="104" height="104" viewBox="0 0 24 24" fill="none" opacity="0.16"><path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm11 1h2v2h-2v-2Zm3-1h2v3h-2v-3Zm-4 4h3v2h-3v-2Zm4 0h2v2h-2v-2Z" fill="white"/></svg>
          </span>
        </button>
        <div className="mt-7 max-w-[290px] flex items-start justify-center gap-2 text-center">
          <p className="text-[14px] leading-5 line-clamp-2">扫描主机或配件二维码</p>
          <button type="button" aria-label="查看扫码支持范围" className="w-5 h-5 flex-shrink-0 rounded-full border border-[#ff607f] text-[#ff8ba2] text-[12px] font-bold leading-none" onClick={() => setHelpOpen(true)}>?</button>
        </div>
        {stage === 'recognizing' && <div className="mt-4 px-3 py-1.5 rounded-full bg-white/10 text-[12px] flex items-center gap-2"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />正在识别…</div>}
      </div>

      <div className="relative z-10 pb-8 px-16 flex justify-between">
        <button type="button" className="flex flex-col items-center gap-2 text-[12px]" onClick={() => setTorchOn(v => !v)}>
          <span className={`w-12 h-12 rounded-full flex items-center justify-center ${torchOn ? 'bg-white text-[#252b33]' : 'bg-white/12'}`}>☀</span>
          {torchOn ? '关闭手电筒' : '手电筒'}
        </button>
        <button type="button" className="flex flex-col items-center gap-2 text-[12px]" onClick={() => { showToast('已从相册选择图片'); simulateResult('part'); }}>
          <span className="w-12 h-12 rounded-full bg-white/12 flex items-center justify-center">▧</span>相册识别
        </button>
      </div>
      {helpOpen && (
        <div className="absolute inset-0 z-20 bg-black/55 flex items-end" onClick={() => setHelpOpen(false)}>
          <div className="w-full bg-white text-[#252b33] rounded-t-3xl p-5 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><strong className="text-[17px]">扫码支持范围</strong><button type="button" className="text-gray-400 text-[20px]" onClick={() => setHelpOpen(false)}>×</button></div>
            <div className="mt-4 space-y-3">
              {[
                ['主机码', '识别主机并进入可用的设备信息'],
                ['配件码', '识别配件并进入配件详情'],
                ['PC 登录', '扫描电脑端二维码后二次确认登录'],
              ].map(([title, description]) => (
                <div key={title} className="flex gap-3 p-3 rounded-xl bg-[#f5f6f8]">
                  <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#ff607f] text-[13px] font-bold">✓</span>
                  <div className="flex-1"><b className="block text-[13px]">{title}</b><span className="block text-[12px] text-gray-500 mt-1 leading-5">{description}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {toast && <div className="absolute z-30 bottom-28 left-1/2 -translate-x-1/2 bg-black/75 border border-white/10 text-white text-[12px] px-4 py-2 rounded-full whitespace-nowrap">{toast}</div>}
    </div>
  );
};

export default ScannerPage;

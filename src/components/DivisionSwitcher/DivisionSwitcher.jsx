import React from 'react';

const DivisionSwitcher = ({ divisions, currentDivision, onSelect, onClose, isSwitching, experienceMode = false, onToggleExperience }) => {
  return (
    <div className="absolute inset-0 z-[90] flex items-end bg-black/50" onClick={onClose}>
      <div className="flex max-h-[82%] w-full flex-col rounded-t-[28px] bg-white px-5 pb-6 pt-3 text-[#252b33]" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto h-1 w-10 rounded-full bg-gray-200" />
        <div className="mt-5 flex items-start justify-between">
          <div>
            <h2 className="text-[18px] font-bold">切换首页</h2>
            <p className="mt-1 text-[12px] text-gray-500">选择 SanVIST 总览或账号可访问的事业部</p>
          </div>
          <button type="button" aria-label="关闭事业部切换" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[20px] text-gray-500" onClick={onClose}>×</button>
        </div>

        <div className="mt-5 space-y-3 overflow-y-auto pb-2">
          {divisions.map((division) => {
            const isCurrent = division.id === currentDivision.id;
            return (
              <button
                key={division.id}
                type="button"
                disabled={isSwitching}
                className={`block w-full rounded-2xl border p-3 text-left transition ${isCurrent ? 'border-[#e60012] bg-[#fff4f5]' : 'border-gray-100 bg-[#f7f8fa]'}`}
                onClick={() => onSelect(division)}
              >
                <span className="flex items-start gap-3">
                  <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-[14px] font-bold ${isCurrent ? 'bg-[#e60012] text-white' : 'bg-white text-[#252b33]'}`}>
                    {division.badge}
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block text-[14px]">{division.shortName}</b>
                    <span className="mt-0.5 line-clamp-2 block text-[11px] leading-4 text-gray-500">{division.fullName}</span>
                    <span className="mt-0.5 block truncate text-[10px] text-gray-400">{division.machineTypes.join(' · ')}</span>
                  </span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-3 flex-shrink-0" aria-hidden="true">
                    {isCurrent ? <path d="m5 12 4 4L19 6" stroke="#e60012" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> : <path d="m9 5 7 7-7 7" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>}
                  </svg>
                </span>
                <span className="mt-3 grid grid-cols-3 border-t border-black/5 pt-2.5">
                  {division.metrics.map((metric) => (
                    <span key={metric.label} className="text-center">
                      <strong className="block text-[14px] text-[#252b33]">{metric.value}</strong>
                      <span className="mt-0.5 block truncate px-1 text-[9px] text-gray-500">{metric.label}</span>
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        {isSwitching && (
          <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-gray-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-[#e60012]" />正在切换首页…
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-[#f7f8fa] px-3 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <strong className="text-[14px] text-[#252b33]">体验模式</strong>
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${experienceMode ? 'bg-[#fff0f1] text-[#e60012]' : 'bg-gray-200 text-gray-500'}`}>{experienceMode ? '已开启' : '已关闭'}</span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-gray-500">浏览固定演示数据，不影响真实业务</p>
          </div>
          <button type="button" role="switch" aria-checked={experienceMode} aria-label={experienceMode ? '关闭体验模式' : '开启体验模式'} onClick={onToggleExperience} className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors ${experienceMode ? 'bg-[#e60012]' : 'bg-gray-300'}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.28)] transition-[left] ${experienceMode ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DivisionSwitcher;

import React from 'react';

const STATUS_STYLES = {
  0: { label: '其他', color: '#e5e7eb' },
  1: { label: '工作', color: '#3b82f6' },
  2: { label: '怠速', color: '#f2c94c' },
  3: { label: '行驶', color: '#22b573' },
  工作: { label: '工作', color: '#3b82f6' },
  怠速: { label: '怠速', color: '#f2c94c' },
  行驶: { label: '行驶', color: '#22b573' },
};

const WorkStatusTimeline = ({ segments, detailedSegments }) => {
  // 连续分段可选分支 (V5-REVIEW-001: 燃油宽体车等精确时段支持，不加假整小时)
  if (detailedSegments && Array.isArray(detailedSegments)) {
    const activeStatuses = [...new Set(detailedSegments.map((s) => s.status))].filter((st) => STATUS_STYLES[st]);
    return (
      <div className="mt-5" aria-label="当日工时分布" dir="ltr" style={{ direction: 'ltr' }}>
        <div className="flex justify-between px-1 text-[9px] text-[#7d8491]">
          {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, '24(h)'].map((time) => (
            <span key={time}>{time}</span>
          ))}
        </div>
        <div className="relative mt-1.5 h-[10px] overflow-hidden rounded-sm bg-[#e5e7eb]" dir="ltr" style={{ direction: 'ltr' }}>
          {detailedSegments.map((seg, idx) => {
            const startPct = Math.max(0, Math.min(100, (seg.start / 24) * 100));
            const endPct = Math.max(startPct, Math.min(100, (seg.end / 24) * 100));
            const widthPct = Math.max(0, endPct - startPct);
            const style = STATUS_STYLES[seg.status] || STATUS_STYLES[0];
            return (
              <div
                key={`${idx}-${seg.status}`}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${startPct}%`,
                  width: `${widthPct}%`,
                  backgroundColor: style.color,
                }}
              />
            );
          })}
        </div>
        {activeStatuses.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] text-[#666]">
            {activeStatuses.map((st) => (
              <span key={st} className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: STATUS_STYLES[st].color }} />
                {STATUS_STYLES[st].label}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 原始 24 小时整块逻辑完全保留，未传 detailedSegments 时 100% 兼容旧设备
  const safeSegments = Array.isArray(segments) ? segments : [];
  const activeStatuses = [...new Set(safeSegments)].filter((status) => status !== 0 && STATUS_STYLES[status]);

  return (
    <div className="mt-5" aria-label="当日工时分布">
      <div className="flex justify-between px-1 text-[9px] text-[#7d8491]">
        {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, '24(h)'].map((time) => <span key={time}>{time}</span>)}
      </div>
      <div className="mt-1.5 flex h-[10px] overflow-hidden rounded-sm bg-[#e5e7eb]">
        {safeSegments.map((status, index) => (
          <div
            key={`${index}-${status}`}
            style={{
              width: `${100 / (safeSegments.length || 1)}%`,
              backgroundColor: STATUS_STYLES[status]?.color || STATUS_STYLES[0].color,
            }}
          />
        ))}
      </div>
      {activeStatuses.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] text-[#666]">
          {activeStatuses.map((status) => (
            <span key={status} className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: STATUS_STYLES[status].color }} />
              {STATUS_STYLES[status].label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkStatusTimeline;

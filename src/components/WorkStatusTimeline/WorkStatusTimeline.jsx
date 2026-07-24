import React from 'react';

const STATUS_STYLES = {
  0: { label: '其他', color: '#e5e7eb' },
  1: { label: '工作', color: '#3b82f6' },
  2: { label: '怠速', color: '#f2c94c' },
  3: { label: '行驶', color: '#22b573' },
};

const WorkStatusTimeline = ({ segments }) => {
  const activeStatuses = [...new Set(segments)].filter((status) => status !== 0 && STATUS_STYLES[status]);

  return (
    <div className="mt-5" aria-label="当日工时分布">
      <div className="flex justify-between px-1 text-[9px] text-[#7d8491]">
        {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, '24(h)'].map((time) => <span key={time}>{time}</span>)}
      </div>
      <div className="mt-1.5 flex h-[10px] overflow-hidden rounded-sm bg-[#e5e7eb]">
        {segments.map((status, index) => (
          <div
            key={`${index}-${status}`}
            style={{
              width: `${100 / segments.length}%`,
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

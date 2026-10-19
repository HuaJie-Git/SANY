import React, { useState } from 'react';

/**
 * V2-R02 / REVIEW-V2-01: 档位分布实心饼图组件 (ElectricGearChart)
 * 纯本地 SVG 实心饼图实现，覆盖 1档、2档、3档、4档、R档
 * 删去顶部总时长与环心文案，0% 扇形不画，100% 单档正确绘制满圆
 * 支持扇形与图例联动点选高亮，键盘无障碍导航
 */
export default function ElectricGearChart({ data, title = '档位使用情况' }) {
  const [selectedGear, setSelectedGear] = useState(null);

  const GEAR_COLORS = {
    '1档': '#2563eb', // 蓝
    '2档': '#10b981', // 绿
    '3档': '#f59e0b', // 橙黄
    '4档': '#8b5cf6', // 紫
    'R档': '#ef4444', // 红
  };

  if (!data || data.isEmpty || !data.gears || data.gears.length === 0 || data.totalHours <= 0) {
    return (
      <div className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
        <h3 className="text-[15px] font-semibold text-[#252b33] mb-2">{title}</h3>
        <div className="py-8 text-center text-[12px] text-[#7a8290]">暂无档位数据</div>
      </div>
    );
  }

  const { gears } = data;
  const visibleSlices = gears.filter((g) => g.percent > 0);

  if (visibleSlices.length === 0) {
    return (
      <div className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
        <h3 className="text-[15px] font-semibold text-[#252b33] mb-2">{title}</h3>
        <div className="py-8 text-center text-[12px] text-[#7a8290]">暂无档位数据</div>
      </div>
    );
  }

  // 几何布局参数
  const size = 180;
  const center = size / 2;
  const radius = 68;

  // 扇形切片计算 (REVIEW-V2-01: 实心饼图，起始自 12 点钟方向顺时针展开)
  let currentAngle = -Math.PI / 2;
  const slices = visibleSlices.map((g) => {
    const fraction = g.percent / 100;
    const startAngle = currentAngle;
    const endAngle = currentAngle + fraction * 2 * Math.PI;
    currentAngle = endAngle;

    const isLargeArc = fraction > 0.5 ? 1 : 0;
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const pathD = `M ${center} ${center} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${isLargeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

    return {
      ...g,
      color: GEAR_COLORS[g.name] || '#6b7280',
      pathD,
      fraction,
    };
  });

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currIdx = slices.findIndex((s) => s.name === selectedGear);
      const nextIdx = (currIdx + 1) % slices.length;
      setSelectedGear(slices[nextIdx].name);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const currIdx = slices.findIndex((s) => s.name === selectedGear);
      const prevIdx = (currIdx - 1 + slices.length) % slices.length;
      setSelectedGear(slices[prevIdx].name);
    } else if (e.key === 'Escape') {
      setSelectedGear(null);
    }
  };

  const isSingleFullSlice = slices.length === 1 && slices[0].percent >= 99.9;

  return (
    <div
      className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)] relative select-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={`${title}图表`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[15px] font-semibold text-[#252b33]">{title}</h3>
      </div>

      <div className="flex flex-col items-center justify-center my-2">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          className="overflow-visible cursor-pointer"
          onClick={() => setSelectedGear(null)}
        >
          {isSingleFullSlice ? (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill={slices[0].color}
              stroke={selectedGear === slices[0].name ? '#1f2937' : '#ffffff'}
              strokeWidth={selectedGear === slices[0].name ? 2 : 1}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedGear(selectedGear === slices[0].name ? null : slices[0].name);
              }}
            />
          ) : (
            slices.map((slice) => {
              const isSelected = selectedGear === slice.name;
              const hasSelection = Boolean(selectedGear);
              const opacity = !hasSelection || isSelected ? 1 : 0.45;
              const stroke = isSelected ? '#1f2937' : '#ffffff';
              const strokeWidth = isSelected ? 2 : 1;

              return (
                <path
                  key={slice.name}
                  d={slice.pathD}
                  fill={slice.color}
                  fillOpacity={opacity}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  className="transition-all duration-200 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGear(isSelected ? null : slice.name);
                  }}
                />
              );
            })
          )}
        </svg>

        {/* 底部颜色图例 (REVIEW-V2-01: 显示档位与百分比，无多余时长，支持点击高亮与换行) */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-gray-100 w-full">
          {gears.map((g) => {
            const isSelected = selectedGear === g.name;
            const color = GEAR_COLORS[g.name] || '#6b7280';
            return (
              <button
                key={g.name}
                type="button"
                onClick={() => setSelectedGear(isSelected ? null : g.name)}
                className={`flex items-center gap-1.5 text-[12px] px-2 py-1 rounded-md transition-all cursor-pointer ${
                  isSelected ? 'bg-gray-100 text-[#252b33] font-medium' : 'text-[#4b5563] hover:text-[#252b33]'
                }`}
                aria-label={`${g.name} 占比 ${g.percent}%`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span>
                  {g.name}: {g.percent}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

/**
 * 共享轻量 SVG 趋势图组件 (STYLE-FUEL-002/004)
 * 遵从规范:
 * 1. 折线与面积 points/d 完全由传入的数据数组动态映射计算，杜绝任何硬编码静态路径
 * 2. 单系列支持折线 + 交互数值点选 (平均电耗、运载趟数)
 * 3. 双系列支持双轴双刻度：左轴实线圆点 (充电时长)，右轴虚线菱形点 + 面积填充 (回收电量)
 * 4. 燃油卡片规范：rounded-[14px], shadow-[0_1px_2px_rgba(31,41,55,0.035)], 无强制最小高度留白
 */

export function ElectricSingleLineChart({
  title,
  unit,
  data = [],
  labels = [],
  color = '#2377f3',
  decimals = 1,
  noCard = false,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  if (!data || data.length === 0) {
    const emptyContent = (
      <>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[15px] font-semibold text-[#252b33]">{title}</span>
          <span className="text-[11px] text-[#7a8290]">{unit}</span>
        </div>
        <div className="h-28 flex items-center justify-center text-[12px] text-[#7a8290]">
          暂无趋势数据
        </div>
      </>
    );

    if (noCard) {
      return <div className="mt-4 pt-4 border-t border-gray-100">{emptyContent}</div>;
    }

    return (
      <section className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
        {emptyContent}
      </section>
    );
  }

  const width = 320;
  const height = 120;
  const padLeft = 32;
  const padRight = 16;
  const padTop = 15;
  const padBottom = 24;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const minVal = 0;
  const maxRaw = Math.max(...data);
  const maxVal = maxRaw > 0 ? maxRaw * 1.2 : 10;

  // 坐标点计算
  const points = data.map((val, idx) => {
    const x = padLeft + (idx / Math.max(1, data.length - 1)) * plotW;
    const y = padTop + (1 - (val - minVal) / (maxVal - minVal)) * plotH;
    return { x, y, val, label: labels[idx] || `${idx + 1}` };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, '');

  // X 轴标签抽样 (月报只展示 1日, 10日, 20日, 末日)
  const isMonthly = data.length > 10;
  const displayLabels = points.filter((_, idx) => {
    if (!isMonthly) return true;
    return idx === 0 || idx === 9 || idx === 19 || idx === data.length - 1;
  });

  const selectedPoint = selectedIndex !== null && points[selectedIndex] ? points[selectedIndex] : null;

  const chartBody = (
    <>
      <h2 className="sr-only">{title}</h2>

      <div className="relative mt-2">
        {/* Y 轴刻度标签 */}
        <div className="absolute left-0 top-[10px] bottom-[24px] flex flex-col justify-between text-[9px] text-[#7a8290] font-mono select-none pointer-events-none">
          <span>{maxVal.toFixed(decimals === 0 ? 0 : 1)}</span>
          <span>{(maxVal * 0.5).toFixed(decimals === 0 ? 0 : 1)}</span>
          <span>0</span>
        </div>

        <svg className="w-full h-44" viewBox={`0 0 ${width} ${height}`}>
          {/* 背景参考线 */}
          <line x1={padLeft} y1={padTop} x2={width - padRight} y2={padTop} stroke="#edf0f4" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={padLeft} y1={padTop + plotH * 0.5} x2={width - padRight} y2={padTop + plotH * 0.5} stroke="#edf0f4" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={padLeft} y1={padTop + plotH} x2={width - padRight} y2={padTop + plotH} stroke="#edf0f4" strokeWidth="1" />

          {/* 动态折线 */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 激活指示垂线 */}
          {selectedPoint && (
            <line
              x1={selectedPoint.x}
              y1={padTop}
              x2={selectedPoint.x}
              y2={padTop + plotH}
              stroke={color}
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}

          {/* 数据点与可点击热区 */}
          {points.map((p, idx) => {
            const isSel = selectedIndex === idx;
            return (
              <g
                key={idx}
                className="cursor-pointer focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label={`${p.label}: ${p.val} ${unit}`}
                onClick={() => setSelectedIndex(idx === selectedIndex ? null : idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedIndex(idx === selectedIndex ? null : idx);
                  }
                }}
              >
                <rect
                  x={p.x - Math.max(6, plotW / data.length / 2)}
                  y={padTop}
                  width={Math.max(12, plotW / data.length)}
                  height={plotH}
                  fill="transparent"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSel ? 5 : isMonthly ? 2.5 : 3.5}
                  fill={isSel ? color : '#ffffff'}
                  stroke={color}
                  strokeWidth={isSel ? 2.5 : 2}
                />
              </g>
            );
          })}
        </svg>

        {/* X 轴标签 */}
        <div className="flex justify-between text-[9px] text-[#7a8290] mt-0.5" style={{ marginLeft: `${padLeft}px`, marginRight: `${padRight}px` }}>
          {displayLabels.map((p, i) => (
            <span key={i}>{p.label}</span>
          ))}
        </div>
      </div>

      {/* 底部图例 title+unit；未选点不显示“单位:”副说明，选点才显示数值 */}
      <div className="flex flex-wrap items-center justify-between gap-2 min-w-0 text-[11px] text-[#7a8290] mt-3 pt-2 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-1.5 font-medium text-[#252b33]">
          <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: color }}></span>
          <span>{title} ({unit})</span>
        </div>
        {selectedPoint && (
          <span className="font-semibold text-[#2377f3] bg-blue-50 px-2 py-0.5 rounded-md">
            {selectedPoint.label}: {Number(selectedPoint.val).toFixed(decimals)} {unit}
          </span>
        )}
      </div>
    </>
  );

  if (noCard) {
    return <div className="mt-4 pt-4 border-t border-gray-100">{chartBody}</div>;
  }

  return (
    <section className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
      {chartBody}
    </section>
  );
}

export function ElectricDualAxisChart({
  title = '充电时长与回收电量',
  labels = [],
  series1 = { name: '充电时长', unit: 'h', data: [] },
  series2 = { name: '回收电量', unit: 'kWh', data: [] },
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const data1 = series1.data || [];
  const data2 = series2.data || [];

  if (data1.length === 0 && data2.length === 0) {
    return (
      <section className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
        <h2 className="sr-only">{title}</h2>
        <div className="h-44 flex items-center justify-center text-[12px] text-[#7a8290]">
          暂无双轴趋势数据
        </div>
      </section>
    );
  }

  const width = 320;
  const height = 130;
  const padLeft = 32;
  const padRight = 32;
  const padTop = 15;
  const padBottom = 24;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // 左轴 (充电时长 h)
  const maxRaw1 = Math.max(...data1, 0);
  const maxVal1 = maxRaw1 > 0 ? Math.ceil(maxRaw1 * 1.3 * 10) / 10 : 2.0;

  // 右轴 (回收电量 kWh)
  const maxRaw2 = Math.max(...data2, 0);
  const maxVal2 = maxRaw2 > 0 ? Math.ceil(maxRaw2 * 1.25) : 30;

  const count = Math.max(data1.length, data2.length);

  // 映射 Series 1 (充电时长，左轴)
  const points1 = data1.map((val, idx) => {
    const x = padLeft + (idx / Math.max(1, count - 1)) * plotW;
    const y = padTop + (1 - val / maxVal1) * plotH;
    return { x, y, val, label: labels[idx] || `${idx + 1}` };
  });

  // 映射 Series 2 (回收电量，右轴)
  const points2 = data2.map((val, idx) => {
    const x = padLeft + (idx / Math.max(1, count - 1)) * plotW;
    const y = padTop + (1 - val / maxVal2) * plotH;
    return { x, y, val, label: labels[idx] || `${idx + 1}` };
  });

  const pathD1 = points1.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, '');

  const pathD2 = points2.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, '');

  const areaD2 = points2.length > 0
    ? `${pathD2} L ${points2[points2.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${points2[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
    : '';

  const isMonthly = count > 10;
  const displayLabels = points1.filter((_, idx) => {
    if (!isMonthly) return true;
    return idx === 0 || idx === 9 || idx === 19 || idx === count - 1;
  });

  const selP1 = selectedIndex !== null && points1[selectedIndex] ? points1[selectedIndex] : null;
  const selP2 = selectedIndex !== null && points2[selectedIndex] ? points2[selectedIndex] : null;

  return (
    <section className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
      <h2 className="sr-only">{title}</h2>

      <div className="relative mt-2">
        {/* 左 Y 轴刻度 (充电时长 h) */}
        <div className="absolute left-0 top-[10px] bottom-[24px] flex flex-col justify-between text-[9px] text-[#2377f3] font-mono select-none pointer-events-none">
          <span>{maxVal1.toFixed(1)}h</span>
          <span>{(maxVal1 * 0.5).toFixed(1)}h</span>
          <span>0h</span>
        </div>

        {/* 右 Y 轴刻度 (回收电量 kWh) */}
        <div className="absolute right-0 top-[10px] bottom-[24px] flex flex-col justify-between text-[9px] text-[#f3c84b] font-mono select-none pointer-events-none text-right">
          <span>{maxVal2}k</span>
          <span>{Math.round(maxVal2 * 0.5)}k</span>
          <span>0</span>
        </div>

        <svg className="w-full h-44" viewBox={`0 0 ${width} ${height}`}>
          {/* 背景参考虚线 */}
          <line x1={padLeft} y1={padTop} x2={width - padRight} y2={padTop} stroke="#edf0f4" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={padLeft} y1={padTop + plotH * 0.5} x2={width - padRight} y2={padTop + plotH * 0.5} stroke="#edf0f4" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={padLeft} y1={padTop + plotH} x2={width - padRight} y2={padTop + plotH} stroke="#edf0f4" strokeWidth="1" />

          {/* Series 2 回收电量面积 */}
          {areaD2 && <path d={areaD2} fill="#f3c84b" fillOpacity="0.15" />}

          {/* Series 2 回收电量虚线 */}
          <path
            d={pathD2}
            fill="none"
            stroke="#f3c84b"
            strokeWidth="2"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />

          {/* Series 1 充电时长实线 */}
          <path
            d={pathD1}
            fill="none"
            stroke="#2377f3"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 激活指示线 */}
          {selectedIndex !== null && points1[selectedIndex] && (
            <line
              x1={points1[selectedIndex].x}
              y1={padTop}
              x2={points1[selectedIndex].x}
              y2={padTop + plotH}
              stroke="#2377f3"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}

          {/* Series 2 菱形数据点 */}
          {points2.map((p, idx) => {
            const isSel = selectedIndex === idx;
            return (
              <g key={`s2-${idx}`}>
                <rect
                  x={p.x - 3}
                  y={p.y - 3}
                  width="6"
                  height="6"
                  fill={isSel ? '#ffffff' : '#f3c84b'}
                  stroke="#f3c84b"
                  strokeWidth="1.5"
                  transform={`rotate(45 ${p.x} ${p.y})`}
                />
              </g>
            );
          })}

          {/* Series 1 圆点与点击热区 */}
          {points1.map((p, idx) => {
            const isSel = selectedIndex === idx;
            return (
              <g
                key={`s1-${idx}`}
                className="cursor-pointer focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label={`${p.label}: 充电 ${p.val}h, 回收 ${points2[idx]?.val || 0}kWh`}
                onClick={() => setSelectedIndex(idx === selectedIndex ? null : idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedIndex(idx === selectedIndex ? null : idx);
                  }
                }}
              >
                <rect
                  x={p.x - Math.max(6, plotW / count / 2)}
                  y={padTop}
                  width={Math.max(12, plotW / count)}
                  height={plotH}
                  fill="transparent"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSel ? 5 : isMonthly ? 2.5 : 3.5}
                  fill={isSel ? '#ffffff' : '#2377f3'}
                  stroke="#2377f3"
                  strokeWidth={isSel ? 2.5 : 1.5}
                />
              </g>
            );
          })}
        </svg>

        {/* X 轴标签 */}
        <div className="flex justify-between text-[9px] text-[#7a8290] mt-0.5" style={{ marginLeft: `${padLeft}px`, marginRight: `${padRight}px` }}>
          {displayLabels.map((p, i) => (
            <span key={i}>{p.label}</span>
          ))}
        </div>
      </div>

      {/* 底部图例与点选反馈 */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0 text-[11px]">
          <div className="flex flex-wrap items-center gap-3">
            {/* 图例 1：实线圆点 */}
            <span className="flex items-center gap-1 text-[#2377f3] font-medium">
              <svg width="18" height="8" className="inline-block">
                <line x1="0" y1="4" x2="18" y2="4" stroke="#2377f3" strokeWidth="2" />
                <circle cx="9" cy="4" r="2.5" fill="#2377f3" />
              </svg>
              <span>{series1.name}({series1.unit})</span>
            </span>
            {/* 图例 2：虚线菱形点 */}
            <span className="flex items-center gap-1 text-[#b45309] font-medium">
              <svg width="18" height="8" className="inline-block">
                <line x1="0" y1="4" x2="18" y2="4" stroke="#f3c84b" strokeWidth="2" strokeDasharray="3 2" />
                <rect x="7" y="2" width="4" height="4" fill="#f3c84b" transform="rotate(45 9 4)" />
              </svg>
              <span>{series2.name}({series2.unit})</span>
            </span>
          </div>

          {selP1 && selP2 && (
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <span className="font-semibold text-[#252b33]">{selP1.label}:</span>
              <span className="text-[#2377f3] font-medium">
                {Number(selP1.val).toFixed(1)}{series1.unit}
              </span>
              <span className="text-[#b45309] font-medium">
                {Number(selP2.val).toFixed(1)}{series2.unit}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

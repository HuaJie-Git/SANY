import React, { useState, useEffect } from 'react';

/**
 * V2-R02 / REVIEW-V2-01: 电量曲线组件 (ElectricSocChart)
 * 纯本地 SVG 实现，采用 SOC % 口径 (0~100%)
 * 日报：00:00~24:00 24小时面积折线；周/月报：各日末真实 SOC 趋势
 * 缺失/非法点断开折线与面积，各连续有效段独立闭合；全无有效点展示暂无电量数据
 * 支持点击与键盘点选，自适应无裁切 Tooltip
 */
function isValidSoc(val) {
  return (
    val !== null &&
    val !== undefined &&
    typeof val === 'number' &&
    Number.isFinite(val) &&
    val >= 0 &&
    val <= 100
  );
}

export default function ElectricSocChart({ mode = 'daily', data }) {
  const [selectedIdx, setSelectedIdx] = useState(null);

  // 日期/tab改变清除过期点选 (REVIEW-V2-01)
  useEffect(() => {
    setSelectedIdx(null);
  }, [mode, data]);

  if (!data) {
    return (
      <div className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[15px] font-semibold text-[#252b33]">电量曲线</h3>
          <span className="text-[11px] font-normal text-[#999]">(%)</span>
        </div>
        <div className="py-8 text-center text-[12px] text-[#7a8290]">暂无电量数据</div>
      </div>
    );
  }

  const isDaily = mode === 'daily';
  const points = isDaily ? data.points || [] : Array.isArray(data) ? data : [];

  const hasAnyValidPoint = points.some((p) => isValidSoc(p.soc));
  if (points.length === 0 || !hasAnyValidPoint) {
    return (
      <div className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[15px] font-semibold text-[#252b33]">电量曲线</h3>
          <span className="text-[11px] font-normal text-[#999]">(%)</span>
        </div>
        <div className="py-8 text-center text-[12px] text-[#7a8290]">暂无电量数据</div>
      </div>
    );
  }

  // SVG 视图尺寸布局常量
  const svgWidth = 320;
  const svgHeight = 160;
  const padLeft = 32;
  const padRight = 14;
  const padTop = 16;
  const padBottom = 26;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;
  const bottomY = padTop + plotHeight;

  const getY = (val) => {
    return padTop + ((100 - val) / 100) * plotHeight;
  };

  const getX = (idx) => {
    if (points.length <= 1) return padLeft + plotWidth / 2;
    return padLeft + (idx / (points.length - 1)) * plotWidth;
  };

  // 生成连续有效段 (REVIEW-V2-01: 缺失/非法点断开折线和面积，各连续有效段分别闭合，不跨缺口填色)
  const segments = [];
  let currentSegment = [];

  points.forEach((p, idx) => {
    if (isValidSoc(p.soc)) {
      currentSegment.push({
        x: getX(idx),
        y: getY(p.soc),
        idx,
        data: p,
      });
    } else {
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [];
      }
    }
  });
  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  // 映射所有点用于点击与刻度
  const allCoords = points.map((p, idx) => ({
    x: getX(idx),
    y: isValidSoc(p.soc) ? getY(p.soc) : bottomY,
    isValid: isValidSoc(p.soc),
    idx,
    data: p,
  }));

  const activePoint =
    selectedIdx !== null && allCoords[selectedIdx] && allCoords[selectedIdx].isValid
      ? allCoords[selectedIdx]
      : null;

  // 键盘快捷键导航
  const handleKeyDown = (e) => {
    const validIdxs = allCoords.filter((c) => c.isValid).map((c) => c.idx);
    if (validIdxs.length === 0) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const currPos = validIdxs.indexOf(selectedIdx);
      if (currPos <= 0) {
        setSelectedIdx(validIdxs[validIdxs.length - 1]);
      } else {
        setSelectedIdx(validIdxs[currPos - 1]);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const currPos = validIdxs.indexOf(selectedIdx);
      if (currPos === -1 || currPos === validIdxs.length - 1) {
        setSelectedIdx(validIdxs[0]);
      } else {
        setSelectedIdx(validIdxs[currPos + 1]);
      }
    } else if (e.key === 'Escape') {
      setSelectedIdx(null);
    }
  };

  // X 轴刻度标签筛选 (日视图显示 00:00, 04:00, 08:00, 12:00, 16:00, 20:00, 24:00)
  const xTicks = isDaily
    ? allCoords.filter((_, idx) => idx % 2 === 0)
    : allCoords.length <= 7
    ? allCoords
    : allCoords.filter((_, idx) => idx === 0 || idx === Math.floor(allCoords.length / 2) || idx === allCoords.length - 1);

  // 自适应 Tooltip 计算 (REVIEW-V2-01: 避免固定 88px 文案被裁)
  let tooltipWidth = 88;
  let tooltipLeft = 0;
  let tooltipTop = 0;
  let labelText = '';
  let valueText = '';

  if (activePoint) {
    labelText = isDaily ? activePoint.data.time : activePoint.data.date || activePoint.data.label;
    valueText = isDaily
      ? isValidSoc(activePoint.data.soc)
        ? `SOC: ${activePoint.data.soc}%`
        : 'SOC: —'
      : isValidSoc(activePoint.data.soc)
      ? `日末: ${activePoint.data.soc}%`
      : '日末: —';
    const maxCharLen = Math.max(labelText.length, valueText.length);
    tooltipWidth = Math.max(88, maxCharLen * 7.5 + 16);
    tooltipLeft = Math.max(6, Math.min(svgWidth - tooltipWidth - 6, activePoint.x - tooltipWidth / 2));
    tooltipTop = Math.max(4, activePoint.y - 44);
  }

  return (
    <div
      className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)] relative select-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="电量曲线图表"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[15px] font-semibold text-[#252b33]">电量曲线</h3>
        <span className="text-[11px] font-normal text-[#999]">(%)</span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
          preserveAspectRatio="none"
          onClick={() => setSelectedIdx(null)}
        >
          <defs>
            {/* 温暖橙黄色系渐变 (参考 IMG-V2-01) */}
            <linearGradient id="socAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
              <stop offset="85%" stopColor="#ffedd5" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 水平背景刻度线与 Y 轴数值标签 (0, 25, 50, 75, 100) */}
          {[100, 75, 50, 25, 0].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="#eef0f2"
                  strokeWidth="1"
                  strokeDasharray={val === 0 ? 'none' : '3 3'}
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#9ca3af"
                  fontFamily="sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* 独立闭合的分段面积与折线 (REVIEW-V2-01) */}
          {segments.map((seg, sIdx) => {
            if (seg.length <= 1) {
              return (
                <circle
                  key={`dot-${sIdx}`}
                  cx={seg[0].x}
                  cy={seg[0].y}
                  r="3"
                  fill="#ea580c"
                />
              );
            }
            const linePathD = seg.reduce((acc, pt, idx) => {
              return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
            }, '');
            const areaPathD = `${linePathD} L ${seg[seg.length - 1].x.toFixed(1)} ${bottomY.toFixed(1)} L ${seg[0].x.toFixed(1)} ${bottomY.toFixed(1)} Z`;

            return (
              <g key={`seg-${sIdx}`}>
                <path d={areaPathD} fill="url(#socAreaGrad)" />
                <path
                  d={linePathD}
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* X 轴刻度文本 */}
          {xTicks.map((pt, idx) => {
            const label = isDaily ? pt.data.time : pt.data.label || pt.data.date;
            return (
              <text
                key={idx}
                x={pt.x}
                y={svgHeight - 8}
                textAnchor="middle"
                fontSize="8.5"
                fill="#9ca3af"
                fontFamily="sans-serif"
              >
                {label}
              </text>
            );
          })}

          {/* 交互点击热区与关键点圆圈 */}
          {allCoords.map((pt, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <g
                key={idx}
                className={pt.isValid ? 'cursor-pointer' : 'pointer-events-none'}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIdx(pt.isValid ? idx : null);
                }}
              >
                {/* 扩大触控命中区域 */}
                <rect
                  x={pt.x - 12}
                  y={padTop}
                  width="24"
                  height={plotHeight}
                  fill="transparent"
                />
                {pt.isValid && (isSelected || !isDaily) && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 4.5 : 2.5}
                    fill={isSelected ? '#ea580c' : '#ffffff'}
                    stroke="#ea580c"
                    strokeWidth={isSelected ? 2 : 1.5}
                  />
                )}
                {isSelected && pt.isValid && (
                  <line
                    x1={pt.x}
                    y1={padTop}
                    x2={pt.x}
                    y2={bottomY}
                    stroke="#252b33"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}
              </g>
            );
          })}

          {/* 点选 Tooltip 浮层 (自适应无裁切) */}
          {activePoint && (
            <g transform={`translate(${tooltipLeft.toFixed(1)}, ${tooltipTop.toFixed(1)})`} className="pointer-events-none">
              <rect
                x="0"
                y="0"
                width={tooltipWidth.toFixed(1)}
                height="36"
                rx="6"
                fill="#1f2937"
                fillOpacity="0.92"
              />
              <text
                x={(tooltipWidth / 2).toFixed(1)}
                y="14"
                textAnchor="middle"
                fill="#d1d5db"
                fontSize="9.5"
                fontFamily="sans-serif"
              >
                {labelText}
              </text>
              <text
                x={(tooltipWidth / 2).toFixed(1)}
                y="28"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="11"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {valueText}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

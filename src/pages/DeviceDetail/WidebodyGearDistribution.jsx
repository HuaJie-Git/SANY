import React, { useState, useEffect } from 'react';

const GEAR_COLORS = {
  '1档': '#91cd76',
  '2档': '#087f35',
  '3档': '#16b9f4',
  '4档': '#0750c8',
  'R档': '#ff8000',
};

/* 档位环形图：保留选中、图例和键盘交互。 */
export default function WidebodyGearDistribution({ data, title = '档位分布' }) {
  const [selectedGear, setSelectedGear] = useState(null);

  useEffect(() => {
    setSelectedGear(null);
  }, [data]);

  const gears = data?.gears;
  const totalHours = Number(data?.totalHours);

  if (!data || !Array.isArray(gears) || gears.length === 0 || !(totalHours > 0)) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 11 }}>暂无档位数据</div>;
  }

  const positiveGears = gears.filter((g) => Number(g?.percent) > 0);

  if (positiveGears.length === 0) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 11 }}>暂无档位数据</div>;
  }

  const size = 200;
  const center = size / 2;
  const radius = 60;

  // Single 100% slice check (use circle instead of arc)
  const isSingle100 = positiveGears.length === 1 && positiveGears[0].percent >= 99.9;

  let currentAngle = -Math.PI / 2;
  const slices = positiveGears.map((g) => {
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
      pathD, midAngle: (startAngle + endAngle) / 2,
    };
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSelectedGear(null);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currIdx = gears.findIndex((g) => g.name === selectedGear);
      const nextIdx = (currIdx + 1) % gears.length;
      setSelectedGear(gears[nextIdx].name);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const currIdx = gears.findIndex((g) => g.name === selectedGear);
      const prevIdx = (currIdx - 1 + gears.length) % gears.length;
      setSelectedGear(gears[prevIdx].name);
    }
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', outline: 'none' }}
      aria-label={`${title}图表`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <svg dir="ltr" width={size} height={size} viewBox={`-60 0 ${size + 120} ${size}`} style={{ overflow: 'visible' }}>
        {isSingle100 ? (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill={slices[0].color}
            stroke="#fff"
            strokeWidth={selectedGear === slices[0].name ? 2.5 : 1}
            role="button"
            tabIndex={0}
            aria-label={`${slices[0].name} 占比 ${slices[0].percent}%`}
            style={{ cursor: 'pointer', outline: 'none' }}
            onClick={() => setSelectedGear(selectedGear === slices[0].name ? null : slices[0].name)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedGear(selectedGear === slices[0].name ? null : slices[0].name);
              }
            }}
          />
        ) : (
          slices.map((slice) => {
            const isSelected = selectedGear === slice.name;
            const hasSelection = Boolean(selectedGear);
            const opacity = !hasSelection || isSelected ? 1 : 0.35;
            return (
              <path
                key={slice.name}
                d={slice.pathD}
                fill={slice.color}
                fillOpacity={opacity}
                stroke="#fff"
                strokeWidth={isSelected ? 2.5 : 1}
                role="button"
                tabIndex={0}
                aria-label={`${slice.name} 占比 ${slice.percent}%`}
                style={{ cursor: 'pointer', transition: 'fill-opacity 0.2s', outline: 'none' }}
                onClick={() => setSelectedGear(isSelected ? null : slice.name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedGear(isSelected ? null : slice.name);
                  }
                }}
              />
            );
          })
        )}
        <circle cx={center} cy={center} r={34} fill="#fff" style={{ pointerEvents: 'none' }} />
        {slices.map(slice => {
          const right = Math.cos(slice.midAngle) >= 0;
          const labelX = center + (right ? 112 : -112);
          const labelY = center + 80 * Math.sin(slice.midAngle);
          const x1 = center + radius * Math.cos(slice.midAngle);
          const y1 = center + radius * Math.sin(slice.midAngle);
          const x2 = center + (radius + 12) * Math.cos(slice.midAngle);
          return <g key={`label-${slice.name}`} style={{ pointerEvents: 'none' }}>
            <polyline points={`${x1},${y1} ${x2},${labelY} ${labelX},${labelY}`} fill="none" stroke={slice.color} strokeWidth="0.7" />
            <text x={labelX} y={labelY - 5} textAnchor={right ? 'start' : 'end'} fontSize="10" fill="#64748b">{slice.name}</text>
            <text x={labelX} y={labelY + 10} textAnchor={right ? 'start' : 'end'} fontSize="10" fill={slice.color}>{slice.percent}%</text>
          </g>;
        })}
      </svg>
      {/* Legend showing gear name + percent */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px 12px',
          marginTop: 12,
          maxWidth: '100%',
        }}
      >
        {gears.map((g) => {
          const isSelected = selectedGear === g.name;
          const color = GEAR_COLORS[g.name] || '#6b7280';
          return (
            <button
              type="button"
              key={g.name}
              onClick={() => setSelectedGear(isSelected ? null : g.name)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: 4,
                border: 'none',
                background: isSelected ? '#f1f5f9' : 'transparent',
                color: isSelected ? '#1e293b' : '#4b5563',
                cursor: 'pointer',
                maxWidth: '100%',
                wordBreak: 'break-word',
              }}
              aria-label={`${g.name} 占比 ${g.percent}%`}
            >
              <span style={{ width: 8, height: 8, borderRadius: 0, background: color, display: 'inline-block', flexShrink: 0 }} />
              <span dir="ltr" style={{ wordBreak: 'break-word', unicodeBidi: 'isolate' }}>{g.name}: {g.percent}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import FuelLevelChart from '../../components/FuelLevelChart/FuelLevelChart';
import WorkStatusTimeline from '../../components/WorkStatusTimeline/WorkStatusTimeline';

/* ──────────────── demo data per device ──────────────── */
const DEVICE_DATA = {
  '三一平地机': {
    supportsTrajectory: false,
    daily: {
      fuelLevel: '70',
      summary: [
        ['油耗', '150', 'L'],
        ['每小时油耗', '26.7', 'L/h'],
        ['工时', '7.5', 'h'],
        ['怠速工时', '1.5', 'h'],
      ],
      workDist: [0,0,0,0,1,1,1,1,1,2,2,1,0,0,1,1,1,1,2,2,1,0,0,0],
    },
    weekly: {
      summary: [
        ['油耗', '301', 'L', 12],
        ['每小时油耗', '26.7', 'L/h', -5],
        ['工时', '48.6', 'h', 5],
        ['怠速工时', '7.5', 'h', -5],
      ],
      calDays: [
        { d: 1, amount: null, fuel: 60 },
        { d: 2, amount: null, fuel: 72 },
        { d: 3, amount: null, fuel: 65 },
        { d: 4, amount: null, fuel: 55 },
        { d: 5, amount: null, fuel: 49 },
        { d: 6 },
        { d: 7 },
      ],
      fuelTrend: [60,72,65,55,49,0,0],
      workH: [9.2,10.5,8.8,7.6,8.2,0,0],
      idleH: [1.5,1.8,1.2,1.0,1.3,0,0],
    },
    monthly: {
      summary: [
        ['油耗', '1,286', 'L', 12],
        ['每小时油耗', '26.7', 'L/h', 5],
        ['工时', '148.6', 'h', 5],
        ['怠速工时', '27.5', 'h', 5],
      ],
      fuelTrend: [53,57,61,55,58,0,0, 54,52,60,57,50,0,0, 56,60,53,54,59,0,0, 52,56,60,54,58,0,0, 52,59,56],
      workH: [8.2,9.5,7.8,8.6,9.1,0,0,8.4,7.6,9.3,8.8,7.2,0,0,8.9,9.4,7.5,8.1,9.0,0,0,8.3,7.9,9.2,8.7,7.4,0,0,8.5,9.0],
      idleH: [1.2,1.5,1.0,1.3,1.6,0,0,1.1,0.9,1.4,1.2,0.8,0,0,1.3,1.5,1.0,1.2,1.4,0,0,1.1,1.0,1.3,1.2,0.9,0,0,1.1,1.4],
    },
  },
  '三一压路机': {
    supportsTrajectory: false,
    daily: {
      fuelLevel: '64',
      summary: [
        ['油耗', '98', 'L'],
        ['工时', '5.6', 'h'],
        ['怠速工时', '0.8', 'h'],
      ],
      workDist: [0,0,0,0,0,1,1,1,1,1,2,2,0,0,0,1,1,2,2,1,0,0,0,0],
    },
    weekly: {
      summary: [
        ['油耗', '186', 'L', -8],
        ['工时', '38.5', 'h', 5],
        ['怠速工时', '5.2', 'h', -5],
      ],
      calDays: [
        { d: 1, amount: null, fuel: 37 },
        { d: 2, amount: null, fuel: 42 },
        { d: 3, amount: null, fuel: 38 },
        { d: 4, amount: null, fuel: 35 },
        { d: 5, amount: null, fuel: 34 },
        { d: 6 },
        { d: 7 },
      ],
      fuelTrend: [37,42,38,35,34,0,0],
      workH: [6.8,7.5,6.2,5.8,6.4,0,0],
      idleH: [0.8,1.0,0.6,0.7,0.9,0,0],
    },
    monthly: {
      summary: [
        ['油耗', '820', 'L', -8],
        ['工时', '112.5', 'h', 5],
        ['怠速工时', '16.8', 'h', 5],
      ],
      fuelTrend: [34,37,39,35,38,0,0, 33,32,40,37,31,0,0, 35,39,33,34,38,0,0, 32,35,39,34,37,0,0, 34,38,36],
      workH: [6.2,7.0,5.8,6.5,7.2,0,0,6.0,5.5,7.1,6.8,5.2,0,0,6.5,7.3,5.6,6.1,6.9,0,0,6.3,5.9,7.0,6.6,5.3,0,0,6.4,7.1],
      idleH: [0.6,0.8,0.5,0.7,0.9,0,0,0.6,0.4,0.8,0.7,0.5,0,0,0.7,0.9,0.5,0.6,0.8,0,0,0.6,0.5,0.8,0.7,0.4,0,0,0.6,0.8],
    },
  },
  '三一摊铺机': {
    supportsTrajectory: false,
    amountLabel: '摊铺距离',
    amountUnit: 'm',
    daily: {
      fuelLevel: '70',
      summary: [
        ['摊铺距离', '1,860', 'm'],
        ['油耗', '120', 'L'],
        ['每小时油耗', '22.2', 'L/h'],
        ['工时', '7.5', 'h'],
        ['怠速工时', '1.5', 'h'],
      ],
      workDist: [0,0,0,0,3,3,3,3,3,2,2,3,0,0,3,3,3,3,2,2,3,0,0,0],
    },
    weekly: {
      summary: [
        ['摊铺距离', '8,650', 'm', 12],
        ['油耗', '260', 'L', 12],
        ['每小时油耗', '22.0', 'L/h', -5],
        ['工时', '42.8', 'h', 5],
        ['怠速工时', '6.2', 'h', -5],
      ],
      calDays: [
        { d: 1, amount: '1,825', fuel: 53 },
        { d: 2, amount: '2,135', fuel: 61 },
        { d: 3, amount: '1,795', fuel: 53 },
        { d: 4, amount: '1,495', fuel: 44 },
        { d: 5, amount: '1,400', fuel: 49 },
        { d: 6 },
        { d: 7 },
      ],
      fuelTrend: [53,61,53,44,49,0,0],
      workH: [7.8,8.5,7.2,6.8,7.4,0,0],
      idleH: [1.2,1.5,1.0,1.1,1.3,0,0],
    },
    monthly: {
      summary: [
        ['摊铺距离', '36,800', 'm', 12],
        ['油耗', '1,086', 'L', 12],
        ['每小时油耗', '22.1', 'L/h', 5],
        ['工时', '138.6', 'h', 5],
        ['怠速工时', '22.5', 'h', 5],
      ],
      fuelTrend: [47,48,53,45,49,0,0, 45,41,54,48,40,0,0, 47,51,45,45,49,0,0, 43,47,53,44,50,0,0, 45,49,48],
      workH: [7.5,8.2,6.8,7.6,8.5,0,0,7.2,6.5,8.3,7.8,6.2,0,0,7.6,8.4,6.6,7.3,8.1,0,0,7.4,6.9,8.2,7.7,6.3,0,0,7.5,8.0],
      idleH: [1.0,1.3,0.8,1.1,1.5,0,0,0.9,0.7,1.4,1.2,0.6,0,0,1.1,1.4,0.8,1.0,1.3,0,0,1.0,0.8,1.3,1.1,0.7,0,0,1.0,1.2],
    },
  },
  '三一泵车': {
    supportsTrajectory: false,
    amountLabel: '泵送方量',
    amountUnit: 'm³',
    daily: {
      fuelLevel: '68',
      summary: [
        ['油耗', '150', 'L'],
        ['每小时油耗', '26.3', 'L/h'],
        ['工时', '6.8', 'h'],
        ['怠速工时', '1.4', 'h'],
        ['泵送方量', '12.6', 'm³'],
      ],
      workDist: [0,0,0,0,1,1,1,1,1,2,2,1,0,0,1,1,1,1,2,2,1,0,0,0],
    },
    weekly: {
      summary: [
        ['油耗', '312', 'L', 10],
        ['每小时油耗', '26.1', 'L/h', -4],
        ['工时', '47.2', 'h', 5],
        ['怠速工时', '8.1', 'h', -5],
        ['泵送方量', '86.5', 'm³', 8],
      ],
      calDays: [
        { d: 1, amount: '12.2', fuel: 62 },
        { d: 2, amount: '13.4', fuel: 68 },
        { d: 3, amount: '11.6', fuel: 59 },
        { d: 4, amount: '10.2', fuel: 52 },
        { d: 5, amount: '9.4', fuel: 48 },
        { d: 6 },
        { d: 7 },
      ],
      fuelTrend: [62,68,59,52,48,0,0],
      workH: [8.6,9.2,7.8,7.2,7.9,0,0],
      idleH: [1.2,1.5,1.0,1.1,1.3,0,0],
    },
    monthly: {
      summary: [
        ['油耗', '1,358', 'L', 10],
        ['每小时油耗', '26.0', 'L/h', 5],
        ['工时', '152.4', 'h', 5],
        ['怠速工时', '30.2', 'h', 5],
        ['泵送方量', '362.8', 'm³', 5],
      ],
      fuelTrend: [52,56,60,54,58,0,0, 53,51,59,56,49,0,0, 55,59,52,53,58,0,0, 51,55,59,53,57,0,0, 51,58,55],
      workH: [8.0,9.3,7.6,8.4,9.0,0,0,8.2,7.4,9.1,8.6,7.0,0,0,8.7,9.2,7.3,8.0,8.9,0,0,8.1,7.7,9.0,8.5,7.2,0,0,8.3,8.8],
      idleH: [1.1,1.4,0.9,1.2,1.5,0,0,1.0,0.8,1.3,1.1,0.7,0,0,1.2,1.4,0.9,1.1,1.3,0,0,1.0,0.9,1.2,1.1,0.8,0,0,1.0,1.3],
    },
  },
  '三一拖泵': {
    supportsTrajectory: false,
    amountLabel: '泵送方量',
    amountUnit: 'm³',
    daily: {
      fuelLevel: '72',
      summary: [
        ['油耗', '120', 'L'],
        ['每小时油耗', '25.8', 'L/h'],
        ['工时', '7.2', 'h'],
        ['怠速工时', '0.9', 'h'],
        ['泵送方量', '15.2', 'm³'],
        ['泵送次数', '86', '次'],
      ],
      workDist: [0,0,0,0,0,1,1,1,1,1,2,2,0,0,0,1,1,2,2,1,0,0,0,0],
    },
    weekly: {
      summary: [
        ['油耗', '246', 'L', 8],
        ['每小时油耗', '25.6', 'L/h', -4],
        ['工时', '45.6', 'h', 5],
        ['怠速工时', '5.8', 'h', -5],
        ['泵送方量', '105.6', 'm³', 6],
        ['泵送次数', '602', '次', 4],
      ],
      calDays: [
        { d: 1, amount: '15.8', fuel: 51 },
        { d: 2, amount: '17.4', fuel: 56 },
        { d: 3, amount: '14.9', fuel: 48 },
        { d: 4, amount: '13.6', fuel: 44 },
        { d: 5, amount: '13.0', fuel: 42 },
        { d: 6 },
        { d: 7 },
      ],
      fuelTrend: [51,56,48,44,42,0,0],
      workH: [8.2,9.0,7.5,7.0,7.6,0,0],
      idleH: [0.7,0.9,0.6,0.7,0.8,0,0],
    },
    monthly: {
      summary: [
        ['油耗', '1,062', 'L', 8],
        ['每小时油耗', '25.7', 'L/h', 5],
        ['工时', '138.8', 'h', 5],
        ['怠速工时', '24.6', 'h', 5],
        ['泵送方量', '452.0', 'm³', 6],
        ['泵送次数', '2,580', '次', 5],
      ],
      fuelTrend: [46,50,54,48,52,0,0, 47,44,53,50,43,0,0, 49,53,46,47,52,0,0, 45,49,53,47,51,0,0, 46,52,49],
      workH: [7.8,9.0,7.2,8.1,8.7,0,0,7.9,7.1,8.8,8.3,6.8,0,0,8.4,8.9,7.0,7.7,8.6,0,0,7.8,7.4,8.7,8.2,6.9,0,0,8.0,8.5],
      idleH: [0.8,1.0,0.6,0.9,1.1,0,0,0.7,0.5,1.0,0.8,0.4,0,0,0.9,1.1,0.6,0.8,1.0,0,0,0.7,0.6,0.9,0.8,0.5,0,0,0.7,0.9],
    },
  },
  '三一车载泵': {
    supportsTrajectory: false,
    amountLabel: '泵送方量',
    amountUnit: 'm³',
    daily: {
      fuelLevel: '66',
      summary: [
        ['油耗', '135', 'L'],
        ['每小时油耗', '26.1', 'L/h'],
        ['工时', '6.2', 'h'],
        ['怠速工时', '1.6', 'h'],
        ['泵送方量', '10.8', 'm³'],
      ],
      workDist: [0,0,0,0,1,1,1,1,1,2,2,1,0,0,1,1,1,1,2,2,1,0,0,0],
    },
    weekly: {
      summary: [
        ['油耗', '278', 'L', 9],
        ['每小时油耗', '26.0', 'L/h', -4],
        ['工时', '43.8', 'h', 5],
        ['怠速工时', '9.2', 'h', -5],
        ['泵送方量', '74.5', 'm³', 5],
      ],
      calDays: [
        { d: 1, amount: '10.6', fuel: 55 },
        { d: 2, amount: '11.8', fuel: 61 },
        { d: 3, amount: '10.0', fuel: 52 },
        { d: 4, amount: '9.1', fuel: 47 },
        { d: 5, amount: '8.5', fuel: 44 },
        { d: 6 },
        { d: 7 },
      ],
      fuelTrend: [55,61,52,47,44,0,0],
      workH: [7.9,8.6,7.2,6.8,7.4,0,0],
      idleH: [1.3,1.6,1.0,1.2,1.4,0,0],
    },
    monthly: {
      summary: [
        ['油耗', '1,212', 'L', 9],
        ['每小时油耗', '25.9', 'L/h', 5],
        ['工时', '132.6', 'h', 5],
        ['怠速工时', '28.8', 'h', 5],
        ['泵送方量', '318.6', 'm³', 5],
      ],
      fuelTrend: [48,52,56,50,54,0,0, 49,46,55,52,45,0,0, 51,55,48,49,54,0,0, 47,51,55,49,53,0,0, 48,54,51],
      workH: [7.6,8.8,7.0,7.9,8.5,0,0,7.7,6.9,8.6,8.1,6.6,0,0,8.2,8.7,6.8,7.5,8.4,0,0,7.6,7.2,8.5,8.0,6.7,0,0,7.8,8.3],
      idleH: [1.2,1.5,0.9,1.2,1.4,0,0,1.1,0.9,1.4,1.2,0.8,0,0,1.3,1.5,1.0,1.2,1.4,0,0,1.1,1.0,1.3,1.2,0.9,0,0,1.1,1.4],
    },
  },
  '三一铣刨机': {
    supportsTrajectory: false,
    amountLabel: '铣刨距离',
    amountUnit: 'm',
    daily: {
      fuelLevel: '65',
      summary: [
        ['油耗', '165', 'L'],
        ['每小时油耗', '26.9', 'L/h'],
        ['工时', '7.8', 'h'],
        ['怠速工时', '1.1', 'h'],
        ['铣刨距离', '2,860', 'm'],
      ],
      workDist: [0,0,0,0,2,2,1,1,2,2,1,0,0,0,2,2,1,1,2,1,0,0,0,0],
    },
    weekly: {
      summary: [
        ['油耗', '348', 'L', 12],
        ['每小时油耗', '26.8', 'L/h', -5],
        ['工时', '51.2', 'h', 5],
        ['怠速工时', '7.6', 'h', -5],
        ['铣刨距离', '18,600', 'm', 12],
      ],
      calDays: [
        { d: 1, amount: '2,980', fuel: 68 },
        { d: 2, amount: '3,290', fuel: 75 },
        { d: 3, amount: '2,800', fuel: 64 },
        { d: 4, amount: '2,500', fuel: 57 },
        { d: 5, amount: '2,320', fuel: 53 },
        { d: 6 },
        { d: 7 },
      ],
      fuelTrend: [68,75,64,57,53,0,0],
      workH: [9.0,9.8,8.2,7.6,8.4,0,0],
      idleH: [0.9,1.2,0.8,0.9,1.1,0,0],
    },
    monthly: {
      summary: [
        ['油耗', '1,486', 'L', 12],
        ['每小时油耗', '26.7', 'L/h', 5],
        ['工时', '156.8', 'h', 5],
        ['怠速工时', '32.4', 'h', 5],
        ['铣刨距离', '79,500', 'm', 12],
      ],
      fuelTrend: [55,59,63,57,61,0,0, 56,53,62,59,52,0,0, 58,62,55,56,61,0,0, 54,58,62,56,60,0,0, 55,61,58],
      workH: [8.5,9.8,8.0,8.9,9.5,0,0,8.6,7.8,9.5,9.0,7.4,0,0,9.1,9.6,7.7,8.4,9.3,0,0,8.5,8.1,9.4,8.9,7.5,0,0,8.7,9.2],
      idleH: [0.8,1.1,0.7,0.9,1.2,0,0,0.8,0.6,1.1,0.9,0.5,0,0,1.0,1.2,0.7,0.9,1.1,0,0,0.8,0.7,1.0,0.9,0.6,0,0,0.8,1.0],
    },
  },
};

const WEEKDAY = ['周日','周一','周二','周三','周四','周五','周六'];

/* ──────────────── line chart (pure SVG, multi-series) ──────────────── */
const LineChart = ({ series, labels, yMax, yUnit, rightUnit }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const W = 320, H = 168, PAD = { t: 25, r: rightUnit ? 34 : 10, b: 34, l: 38 };
  const cw = W - PAD.l - PAD.r, ch = H - PAD.t - PAD.b;
  const leftSeries = series.filter((item) => item.axis !== 'right');
  const rightSeries = series.filter((item) => item.axis === 'right');
  const leftMax = yMax || Math.max(...leftSeries.flatMap((item) => item.data), 1) * 1.15;
  const rightMax = Math.max(...rightSeries.flatMap((item) => item.data), 1) * 1.15;
  const len = series[0]?.data.length || 0;
  const toX = (i) => PAD.l + (len > 1 ? (i / (len - 1)) * cw : cw / 2);
  const toY = (v, axis) => PAD.t + ch - (v / (axis === 'right' ? rightMax : leftMax)) * ch;
  const step = len > 8 ? Math.ceil(len / 6) : 1;
  const activeLeft = hoverIndex == null ? 50 : Math.min(74, Math.max(26, (toX(hoverIndex) / W) * 100));
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 190 }} onMouseLeave={() => setHoverIndex(null)}>
        {[0,.25,.5,.75,1].map((f) => {
          const y = PAD.t + ch * (1 - f);
          return <g key={f}><line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#e9ecef" strokeWidth=".7" /><text x={PAD.l - 5} y={y + 3} textAnchor="end" fontSize="8" fill="#999">{(leftMax * f).toFixed(0)}</text>{rightUnit && <text x={W - PAD.r + 5} y={y + 3} fontSize="8" fill="#999">{(rightMax * f).toFixed(1)}</text>}</g>;
        })}
        {series.map((item) => {
          const pathD = item.data.map((value, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(value, item.axis).toFixed(1)}`).join(' ');
          return (
            <g key={item.key}>
              <path d={pathD} fill="none" stroke={item.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {item.data.map((value, i) => <circle key={i} cx={toX(i)} cy={toY(value, item.axis)} r={hoverIndex === i ? 3.5 : 2.3} fill="#fff" stroke={item.color} strokeWidth="1.5" onMouseEnter={() => setHoverIndex(i)} />)}
            </g>
          );
        })}
        {labels.map((label, i) => i % step === 0 && <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="8" fill="#999">{label}</text>)}
        {hoverIndex != null && <line x1={toX(hoverIndex)} y1={PAD.t} x2={toX(hoverIndex)} y2={PAD.t + ch} stroke="#9aa8ba" strokeWidth=".8" strokeDasharray="4 3" />}
        <rect x={PAD.l} y={PAD.t} width={cw} height={ch} fill="transparent" onMouseMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); const ratio = (event.clientX - rect.left) / rect.width; setHoverIndex(Math.max(0, Math.min(len - 1, Math.round(ratio * (len - 1))))); }} />
        {yUnit && <text x={PAD.l} y={12} fontSize="9" fill="#999">{yUnit}</text>}
        {rightUnit && <text x={W - PAD.r} y={12} textAnchor="end" fontSize="9" fill="#999">{rightUnit}</text>}
      </svg>
      {hoverIndex != null && (
        <div className="pointer-events-none absolute top-[34px] min-w-[156px] -translate-x-1/2 rounded-lg bg-white px-3 py-2.5 shadow-[0_8px_24px_rgba(31,41,55,0.18)]" style={{ left: `${activeLeft}%` }}>
          <div className="mb-1.5 text-[12px] text-[#4b5563]">{labels[hoverIndex]}</div>
          {series.map((item) => <div key={item.key} className="flex items-center gap-2 text-[11px] leading-5 text-[#59616c]"><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} /><span className="flex-1">{item.label || item.key}</span><b className="text-[#303640]">{item.data[hoverIndex]}{item.unit || ''}</b></div>)}
        </div>
      )}
    </div>
  );
};

/* ──────────────── trajectory map (CSS/SVG) ──────────────── */
const TrajectoryMap = () => (
  <div className="relative mt-3 h-[180px] rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#e8f4e8 0%,#d4e8d0 30%,#c8dcc4 60%,#dce8d8 100%)' }}>
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 180" preserveAspectRatio="none">
      {/* roads */}
      <line x1="0" y1="90" x2="320" y2="90" stroke="#fff" strokeWidth="6" opacity=".7" />
      <line x1="160" y1="0" x2="160" y2="180" stroke="#fff" strokeWidth="4" opacity=".5" />
      <path d="M40 140 Q100 60 180 80 Q260 100 300 40" fill="none" stroke="#4dabf7" strokeWidth="4" strokeDasharray="8 4" />
      <circle cx="40" cy="140" r="6" fill="#34a853" stroke="#fff" strokeWidth="2" />
      <circle cx="300" cy="40" r="6" fill="#ea4335" stroke="#fff" strokeWidth="2" />
      <text x="40" y="158" fontSize="8" fill="#333" textAnchor="middle">起点</text>
      <text x="300" y="30" fontSize="8" fill="#333" textAnchor="middle">当前</text>
    </svg>
  </div>
);

/* ──────────────── monthly calendar grid ──────────────── */
const MonthCalendar = ({ dailyData, amountUnit, highlight }) => {
  const now = new Date(2026, 6, 1);
  const y = now.getFullYear(), m = now.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const weeks = [];
  let row = new Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    row.push(d);
    if (row.length === 7) { weeks.push(row); row = []; }
  }
  if (row.length) { while (row.length < 7) row.push(null); weeks.push(row); }
  return (
    <div>
      <div className="grid grid-cols-7 gap-px text-center text-[9px] text-[#999] mb-1">{WEEKDAY.map((d) => <div key={d} className="py-0.5">{d}</div>)}</div>
      {weeks.map((wk, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-px">
          {wk.map((d, di) => {
            if (!d) return <div key={di} />;
            const dayData = dailyData[d - 1];
            const fuel = dayData?.fuel;
            const active = fuel != null && fuel > 0;
            const amt = active ? dayData.amount : null;
            const isHL = highlight && d === now.getDate();
            return (
              <div key={di} className={`rounded-md p-1 text-center ${isHL ? 'bg-[#f0f7ff] ring-1 ring-[#4dabf7]' : (active ? 'bg-[#fff8e1]' : 'bg-gray-50')}`}>
                <div className={`text-[10px] font-medium ${isHL ? 'text-[#1a73e8]' : ''}`}>{d}</div>
                {amountUnit && (
                  <div className="text-[8px] leading-tight text-[#333]">
                    {amt != null ? `${amt}${amountUnit}` : '--'}
                  </div>
                )}
                <div className="text-[8px] leading-tight text-[#999]">
                  {active ? `${fuel}L` : '--'}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ──────────────── weekly calendar ──────────────── */
const WeekCalendar = ({ days, amountUnit }) => (
  <div>
    <div className="grid grid-cols-7 gap-px text-center text-[10px] text-[#999] mb-1">{WEEKDAY.map((d) => <div key={d} className="py-0.5">{d}</div>)}</div>
    <div className="grid grid-cols-7 gap-px">
      {days.map((day, i) => {
        const hasAmt = amountUnit && day.amount != null;
        const hasFuel = day.fuel != null;
        return (
          <div key={i} className={`rounded-md p-1.5 text-center ${(hasAmt || hasFuel) ? 'bg-[#fff8e1]' : 'bg-gray-50'}`}>
            <div className={`text-[11px] font-medium ${!hasAmt && !hasFuel ? 'text-[#ccc]' : ''}`}>{day.d}</div>
            {amountUnit && (
              <div className="text-[9px] leading-tight text-[#333]">
                {hasAmt ? `${day.amount}${amountUnit}` : '--'}
              </div>
            )}
            <div className="text-[9px] leading-tight text-[#999]">
              {hasFuel ? `${day.fuel}L` : '--'}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ──────────────── summary card ──────────────── */
const SummaryCard = ({ data, isDaily, period }) => {
  if (isDaily) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="text-[15px] font-semibold mb-4">今日数据</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          {data.map(([label, value, unit]) => (
            <div key={label}>
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-normal text-[#252b33]">{value}</span>
                {unit && <span className="text-[12px] text-[#666]">{unit}</span>}
              </div>
              <div className="text-[11px] text-[#999] mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const cmp = period === 'weekly' ? '对比上周' : '对比上月';
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[15px] font-semibold text-[#252b33]">运营数据</span>
        <span className="text-[12px] text-[#999]">{cmp}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        {data.map(([label, value, unit, chg]) => (
          <div key={label}>
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-normal text-[#252b33]">{value}</span>
              {unit && <span className="text-[12px] text-[#666]">{unit}</span>}
              {chg != null && (
                <span className={`text-[10px] ml-0.5 px-1 py-0.5 rounded ${chg >= 0 ? 'bg-red-50 text-[#e57373]' : 'bg-green-50 text-[#66bb6a]'}`}>
                  {chg >= 0 ? '↑' : '↓'}{Math.abs(chg)}%
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#999] mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ──────────────── daily view ──────────────── */
const DailyView = ({ deviceName }) => {
  const deviceData = DEVICE_DATA[deviceName];
  const d = deviceData?.daily;
  if (!d) return null;
  return (
    <div className="space-y-3">
      <div className="px-1 text-[11px] text-[#999]">以下数据为设备所在地当日数据实时统计</div>
      <SummaryCard data={d.summary} isDaily />
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="text-[15px] font-semibold mb-1">当日工时分布</div>
        <WorkStatusTimeline segments={d.workDist} />
      </div>
      {deviceData.supportsTrajectory !== false ? (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[15px] font-semibold">行驶轨迹</span>
            <span className="text-[12px] text-[#1a73e8]">查看详情</span>
          </div>
          <TrajectoryMap />
          <div className="mt-3 space-y-1 text-[11px] text-[#666]">
            <div>起点位置：湖南省长沙市宁乡经开区</div>
            <div>当前位置：湖南省长沙市宁乡经开区</div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-[15px] font-semibold">油位曲线</div>
          <FuelLevelChart level={d.fuelLevel} />
        </div>
      )}
    </div>
  );
};

/* ──────────────── weekly view ──────────────── */
const WeeklyView = ({ deviceName }) => {
  const dev = DEVICE_DATA[deviceName];
  const d = dev?.weekly;
  if (!d) return null;
  return (
    <div className="space-y-3">
      <SummaryCard data={d.summary} period="weekly" />
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[15px] font-semibold">设备运行日历</span>
          <span className="text-[11px] text-[#999]">{dev.amountLabel}</span>
        </div>
        <WeekCalendar days={d.calDays} amountUnit={dev.amountUnit} />
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="text-[15px] font-semibold mb-1">平均每小时油耗趋势</div>
        <LineChart
          series={[
            { key: 'hourlyFuel', label: '平均每小时油耗', unit: ' L/h', data: d.fuelTrend.map((fuel, i) => Number((fuel / (d.workH[i] || 1)).toFixed(2))), color: '#ff862d' },
            { key: 'duration', label: '时长', unit: ' h', data: d.workH, color: '#7c3aed', axis: 'right' },
          ]}
          labels={['周一','周二','周三','周四','周五','周六','周日']}
          yUnit="L/h"
          rightUnit="时长(h)"
        />
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="text-[15px] font-semibold mb-1">工时分布</div>
        <LineChart
          series={[
            { key: 'work', label: '工作', unit: ' h', data: d.workH, color: '#4dabf7' },
            { key: 'idle', label: '怠速', unit: ' h', data: d.idleH, color: '#95e1d3' },
          ]}
          labels={['周一','周二','周三','周四','周五','周六','周日']}
          yMax={Math.max(...d.workH, ...d.idleH) * 1.2}
          yUnit="h"
        />
        <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-[#666]">
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#4dabf7]" />工作</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#95e1d3]" />怠速</span>
        </div>
      </div>
    </div>
  );
};

/* ──────────────── monthly view ──────────────── */
const MonthlyView = ({ deviceName }) => {
  const dev = DEVICE_DATA[deviceName];
  const d = dev?.monthly;
  if (!d) return null;
  const monthLabels = Array.from({ length: d.fuelTrend.length }, (_, i) => `${i + 1}`);
  const hasAmount = !!dev.amountLabel;
  const amountFactor = dev.amountUnit === 'm' ? 33.89 : 0.2;
  const dailyData = d.fuelTrend.map((fuel) => {
    const active = fuel != null && fuel > 0;
    const amount = !active ? null : (hasAmount ? Math.round(fuel * amountFactor) : null);
    return { amount: amount != null ? String(amount) : null, fuel };
  });
  return (
    <div className="space-y-3">
      <SummaryCard data={d.summary} period="monthly" />
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[15px] font-semibold">设备运行日历</span>
          <span className="text-[11px] text-[#999]">{dev.amountLabel}</span>
        </div>
        <MonthCalendar dailyData={dailyData} amountUnit={dev.amountUnit} highlight />
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="text-[15px] font-semibold mb-1">平均每小时油耗趋势</div>
        <LineChart
          series={[
            { key: 'mHourlyFuel', label: '平均每小时油耗', unit: ' L/h', data: d.fuelTrend.map((fuel, i) => Number((fuel / (d.workH[i] || 1)).toFixed(2))), color: '#ff862d' },
            { key: 'mDuration', label: '时长', unit: ' h', data: d.workH, color: '#7c3aed', axis: 'right' },
          ]}
          labels={monthLabels}
          yUnit="L/h"
          rightUnit="时长(h)"
        />
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="text-[15px] font-semibold mb-1">工时分布</div>
        <LineChart
          series={[
            { key: 'mWork', label: '工作', unit: ' h', data: d.workH, color: '#4dabf7' },
            { key: 'mIdle', label: '怠速', unit: ' h', data: d.idleH, color: '#95e1d3' },
          ]}
          labels={monthLabels}
          yMax={Math.max(...d.workH, ...d.idleH) * 1.2}
          yUnit="h"
        />
        <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-[#666]">
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#4dabf7]" />工作</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#95e1d3]" />怠速</span>
        </div>
      </div>
    </div>
  );
};

/* ──────────────── main component ──────────────── */
const DataReport = ({ device, onBack }) => {
  const [tab, setTab] = useState('daily');
  const [dateOffset, setDateOffset] = useState(0);

  const dateLabel = useMemo(() => {
    const now = new Date(2026, 6, 24);
    if (tab === 'daily') {
      const d = new Date(now);
      d.setDate(d.getDate() + dateOffset);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    if (tab === 'weekly') {
      const baseWeek = 3 + dateOffset;
      return `2026年7月 第${Math.max(1, baseWeek)}周`;
    }
    const baseMonth = 6 + dateOffset;
    const y = 2026 + Math.floor((baseMonth) / 12);
    const m = ((baseMonth % 12) + 12) % 12;
    return `${y}年${m + 1}月`;
  }, [tab, dateOffset]);

  const tabs = [
    { key: 'daily', label: '日报' },
    { key: 'weekly', label: '周报' },
    { key: 'monthly', label: '月报' },
  ];

  return (
    <div className="min-h-full bg-[#f1f3f7] text-[#252b33]">
      {/* header */}
      <header className="sticky top-0 z-20 bg-[#f1f3f7]/95 backdrop-blur-sm">
        <div className="h-[52px] px-3 flex items-center">
          <button type="button" onClick={onBack} aria-label="返回" className="h-9 w-9 flex items-center justify-center rounded-full active:bg-black/5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#252b33" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex-1 truncate px-2 text-[15px] font-medium">{device?.code}</div>
          <button type="button" aria-label="帮助" className="h-9 w-9 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="#666"/></svg>
          </button>
        </div>
      </header>

      <main className="px-3 pb-8 space-y-3">
        {/* tabs */}
        <div className="flex justify-center gap-2 pt-1">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => { setTab(t.key); setDateOffset(0); }}
              className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${tab === t.key ? 'bg-[#252b33] text-white' : 'bg-white text-[#666]'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* date navigation */}
        <div className="flex items-center justify-center gap-4 py-2">
          <button type="button" onClick={() => setDateOffset((o) => o - 1)} className="h-7 w-7 flex items-center justify-center rounded-full active:bg-black/5 text-[#666]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span className="text-[14px] font-medium min-w-[120px] text-center">{dateLabel}</span>
          <button type="button" onClick={() => setDateOffset((o) => o + 1)} className="h-7 w-7 flex items-center justify-center rounded-full active:bg-black/5 text-[#666]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        {/* content */}
        {tab === 'daily' && <DailyView deviceName={device?.name} />}
        {tab === 'weekly' && <WeeklyView deviceName={device?.name} />}
        {tab === 'monthly' && <MonthlyView deviceName={device?.name} />}
      </main>
    </div>
  );
};

export default DataReport;

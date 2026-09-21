import React, { useRef, useState } from 'react';
import FuelLevelChart from '../../components/FuelLevelChart/FuelLevelChart';
import WorkStatusTimeline from '../../components/WorkStatusTimeline/WorkStatusTimeline';
import IconFont from '../../components/IconFont/IconFont';

const MACHINE_DATA = {
  // 1. 挖掘机
  挖掘机: {
    supportsTrajectory: false,
    model: 'SY014CF',
    code: 'SY014CF0113D8',
    plate: 'SV-22 · Kolkata',
    status: '工作',
    reportTime: '2026-09-03 16:57:57 (UTC+5.5)',
    location: '苏州市·吴中施工区',
    realtime: [
      ['发动机转速', '1245.18', 'RPM'],
      ['油位', '31.62', '%'],
      ['档位', '9'],
      ['冷却水温', '53.07', '°C'],
    ],
    workDist: [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    today: [['当日总工时', '0.01', 'h'], ['当日无动作工时', '0.01', 'h']],
    cumulative: [['累计工时', '2352.75', 'h']],
  },
  SY014CF0113D8: {
    supportsTrajectory: false,
    model: 'SY014CF',
    code: 'SY014CF0113D8',
    plate: 'SV-22 · Kolkata',
    status: '工作',
    reportTime: '2026-09-03 16:57:57 (UTC+5.5)',
    location: '苏州市·吴中施工区',
    realtime: [
      ['发动机转速', '1245.18', 'RPM'],
      ['油位', '31.62', '%'],
      ['档位', '9'],
      ['冷却水温', '53.07', '°C'],
    ],
    workDist: [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    today: [['当日总工时', '0.01', 'h'], ['当日无动作工时', '0.01', 'h']],
    cumulative: [['累计工时', '2352.75', 'h']],
  },

  // 2. 搅拌车
  搅拌车: {
    supportsTrajectory: true,
    trajectoryType: 'mixer',
    model: 'HSGJ1051',
    code: 'HSGJ1051016142',
    plate: '车牌号',
    status: '离线',
    reportTime: '2026-09-19 20:03:24 (UTC+8)',
    location: '太古漆油, 清甜街, 西草湾, 新界, 香港',
    startLocation: '太古漆油, 清甜街, 西草湾, 新界, 香港',
    endLocation: '太古漆油, 清甜街, 西草湾, 新界, 香港',
    realtime: [
      ['设备状态', '离线'],
      ['车速', '0', 'km/h'],
      ['油位', '29', '%'],
      ['搅拌桶方向', '反转'],
      ['搅拌桶转速', '0', 'rpm'],
      ['整车电压', '26.57', 'v'],
    ],
    workDist: [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
    today: [
      ['工时', '3.32', 'h'],
      ['怠速工时', '0.29', 'h'],
    ],
    cumulative: [
      ['总里程', '35986.3', 'km'],
      ['总工时', '2409.85', 'h'],
      ['总油耗', '20184', 'L'],
    ],
  },
  HSGJ1051016142: {
    supportsTrajectory: true,
    trajectoryType: 'mixer',
    model: 'HSGJ1051',
    code: 'HSGJ1051016142',
    plate: '车牌号',
    status: '离线',
    reportTime: '2026-09-19 20:03:24 (UTC+8)',
    location: '太古漆油, 清甜街, 西草湾, 新界, 香港',
    startLocation: '太古漆油, 清甜街, 西草湾, 新界, 香港',
    endLocation: '太古漆油, 清甜街, 西草湾, 新界, 香港',
    realtime: [
      ['设备状态', '离线'],
      ['车速', '0', 'km/h'],
      ['油位', '29', '%'],
      ['搅拌桶方向', '反转'],
      ['搅拌桶转速', '0', 'rpm'],
      ['整车电压', '26.57', 'v'],
    ],
    workDist: [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
    today: [
      ['工时', '3.32', 'h'],
      ['怠速工时', '0.29', 'h'],
    ],
    cumulative: [
      ['总里程', '35986.3', 'km'],
      ['总工时', '2409.85', 'h'],
      ['总油耗', '20184', 'L'],
    ],
  },

  // 3. 汽车起重机
  汽车起重机: {
    supportsTrajectory: false,
    isCrane: true,
    model: 'AC0250CF',
    code: 'AC0250CF0056',
    plate: '车牌号',
    status: '离线',
    reportTime: '2026-09-20 18:29:09 (UTC+8)',
    location: '43, Senoko Way, Sembawang, Singapore, 新加坡, 758054',
    craneMetrics: {
      hookMultiplier: '3',
      torquePercentage: '120%',
      windSpeed: '0 m/s',
      maxLoad: '0',
      actLoad: '1.3',
      boomLength: '14.88m',
      angle: '0.66°',
      radius: '3.63m',
      outriggerSpan: '12.5m',
      rpm: '175',
      ect: '83',
      fuelLevel: '76.8%',
    },
    realtime: [
      ['设备状态', '离线'],
      ['车速', '0', 'km/h'],
      ['机油压力', '208', 'bar'],
      ['整车电压', '28', 'v'],
      ['配重', '74', 't'],
    ],
    today: [
      ['底盘发动机工作时间', '-', 'h'],
      ['上车工作时间', '-', 'h'],
      ['怠速工时', '0.06', 'h'],
      ['底盘发动机油耗', '-', 'L'],
      ['作业油耗', '-', 'L'],
    ],
    workDist: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
    cumulative: [
      ['上车工作时间', '3772.45', 'h'],
      ['作业油耗', '16028', 'L'],
      ['吊载次数', '2717', '次'],
      ['总里程', '2470.5', 'km'],
    ],
  },
  AC0250CF0056: {
    supportsTrajectory: false,
    isCrane: true,
    model: 'AC0250CF',
    code: 'AC0250CF0056',
    plate: '车牌号',
    status: '离线',
    reportTime: '2026-09-20 18:29:09 (UTC+8)',
    location: '43, Senoko Way, Sembawang, Singapore, 新加坡, 758054',
    craneMetrics: {
      hookMultiplier: '3',
      torquePercentage: '120%',
      windSpeed: '0 m/s',
      maxLoad: '0',
      actLoad: '1.3',
      boomLength: '14.88m',
      angle: '0.66°',
      radius: '3.63m',
      outriggerSpan: '12.5m',
      rpm: '175',
      ect: '83',
      fuelLevel: '76.8%',
    },
    realtime: [
      ['设备状态', '离线'],
      ['车速', '0', 'km/h'],
      ['机油压力', '208', 'bar'],
      ['整车电压', '28', 'v'],
      ['配重', '74', 't'],
    ],
    today: [
      ['底盘发动机工作时间', '-', 'h'],
      ['上车工作时间', '-', 'h'],
      ['怠速工时', '0.06', 'h'],
      ['底盘发动机油耗', '-', 'L'],
      ['作业油耗', '-', 'L'],
    ],
    workDist: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
    cumulative: [
      ['上车工作时间', '3772.45', 'h'],
      ['作业油耗', '16028', 'L'],
      ['吊载次数', '2717', '次'],
      ['总里程', '2470.5', 'km'],
    ],
  },

  // 4. 矿用宽体自卸车
  矿用宽体自卸车: {
    supportsTrajectory: false,
    model: 'KT090AE',
    code: 'KT090AE20208',
    plate: '车牌号',
    status: '工作',
    reportTime: '2026-09-21 01:29:02 (UTC+8)',
    location: '45H2+HF Simpang Empat Sungai Baru, Tanah Laut Regency, South Kalimantan, 印度尼西亚',
    realtime: [
      ['设备状态', '工作'],
      ['车速', '6', 'km/h'],
      ['运输重量', '-', 'T'],
      ['运载趟数', '0', 'trips'],
      ['油位', '74', '%'],
      ['油门深度', '0', '%'],
    ],
    today: [
      ['里程', '2.4', 'km'],
      ['油耗', '7', 'L'],
      ['工时', '0.14', 'h'],
      ['怠速工时', '0.16', 'h'],
      ['运行时长', '0.3', 'h'],
      ['最高车速', '43', 'km/h'],
    ],
    workDist: [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    cumulative: [
      ['总工作时间', '2484.25', 'h'],
      ['运载趟数', '0', 'trips'],
      ['总运输重量', '0', 'T'],
      ['总里程', '165066.96', 'km'],
      ['总油耗', '61200.5', 'L'],
    ],
  },
  KT090AE20208: {
    supportsTrajectory: false,
    model: 'KT090AE',
    code: 'KT090AE20208',
    plate: '车牌号',
    status: '工作',
    reportTime: '2026-09-21 01:29:02 (UTC+8)',
    location: '45H2+HF Simpang Empat Sungai Baru, Tanah Laut Regency, South Kalimantan, 印度尼西亚',
    realtime: [
      ['设备状态', '工作'],
      ['车速', '6', 'km/h'],
      ['运输重量', '-', 'T'],
      ['运载趟数', '0', 'trips'],
      ['油位', '74', '%'],
      ['油门深度', '0', '%'],
    ],
    today: [
      ['里程', '2.4', 'km'],
      ['油耗', '7', 'L'],
      ['工时', '0.14', 'h'],
      ['怠速工时', '0.16', 'h'],
      ['运行时长', '0.3', 'h'],
      ['最高车速', '43', 'km/h'],
    ],
    workDist: [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    cumulative: [
      ['总工作时间', '2484.25', 'h'],
      ['运载趟数', '0', 'trips'],
      ['总运输重量', '0', 'T'],
      ['总里程', '165066.96', 'km'],
      ['总油耗', '61200.5', 'L'],
    ],
  },

  // 5. 自卸车
  自卸车: {
    supportsTrajectory: true,
    trajectoryType: 'dump',
    model: 'HRZX2331',
    code: 'HRZX2331008983',
    plate: '车牌号',
    status: '停车',
    reportTime: '2026-09-21 00:29:25 (UTC+7)',
    location: '67QG+XW Na Som, Chai Badan District, Lopburi, 泰国',
    startLocation: '67QG+XW Na Som, Chai Badan District, Lopburi, 泰国',
    endLocation: '67QG+XW Na Som, Chai Badan District, Lopburi, 泰国',
    realtime: [
      ['设备状态', '停车'],
      ['车速', '0', 'km/h'],
      ['续航里程', '237', 'km'],
      ['剩余电量', '78', '%'],
      ['电机转速', '0', 'rpm'],
    ],
    today: [
      ['里程', '-', 'km'],
      ['电耗', '-', 'kWh'],
      ['工时', '-', 'h'],
      ['怠速工时', '-', 'h'],
    ],
    workDist: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    cumulative: [
      ['总里程', '47330.1', 'km'],
    ],
  },
  HRZX2331008983: {
    supportsTrajectory: true,
    trajectoryType: 'dump',
    model: 'HRZX2331',
    code: 'HRZX2331008983',
    plate: '车牌号',
    status: '停车',
    reportTime: '2026-09-21 00:29:25 (UTC+7)',
    location: '67QG+XW Na Som, Chai Badan District, Lopburi, 泰国',
    startLocation: '67QG+XW Na Som, Chai Badan District, Lopburi, 泰国',
    endLocation: '67QG+XW Na Som, Chai Badan District, Lopburi, 泰国',
    realtime: [
      ['设备状态', '停车'],
      ['车速', '0', 'km/h'],
      ['续航里程', '237', 'km'],
      ['剩余电量', '78', '%'],
      ['电机转速', '0', 'rpm'],
    ],
    today: [
      ['里程', '-', 'km'],
      ['电耗', '-', 'kWh'],
      ['工时', '-', 'h'],
      ['怠速工时', '-', 'h'],
    ],
    workDist: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    cumulative: [
      ['总里程', '47330.1', 'km'],
    ],
  },

  // 6. 电动装载机
  电动装载机: {
    supportsTrajectory: false,
    isLoader: true,
    model: 'SW970EACG',
    code: 'SW970EACG0278',
    plate: '车牌号',
    status: '工作',
    reportTime: '2026-09-21 00:30:09 (UTC+7)',
    location: '4MWV+72 Khlong Khlung, Khlong Khlung District, Kamphaeng Phet, 泰国',
    realtime: [
      ['设备状态', '工作'],
      ['剩余电量', '72', '%'],
      ['充电状态', '否'],
      ['实时载荷', '9.8', 't'],
    ],
    today: [
      ['工时', '0.28', 'h'],
      ['怠速工时', '0.13', 'h'],
    ],
    workDist: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    cumulative: [
      ['总工作时间', '1003.63', 'h'],
      ['总电耗', '37224', 'kWh'],
      ['累计充电电量', '37335', 'kWh'],
    ],
  },
  SW970EACG0278: {
    supportsTrajectory: false,
    isLoader: true,
    model: 'SW970EACG',
    code: 'SW970EACG0278',
    plate: '车牌号',
    status: '工作',
    reportTime: '2026-09-21 00:30:09 (UTC+7)',
    location: '4MWV+72 Khlong Khlung, Khlong Khlung District, Kamphaeng Phet, 泰国',
    realtime: [
      ['设备状态', '工作'],
      ['剩余电量', '72', '%'],
      ['充电状态', '否'],
      ['实时载荷', '9.8', 't'],
    ],
    today: [
      ['工时', '0.28', 'h'],
      ['怠速工时', '0.13', 'h'],
    ],
    workDist: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    cumulative: [
      ['总工作时间', '1003.63', 'h'],
      ['总电耗', '37224', 'kWh'],
      ['累计充电电量', '37335', 'kWh'],
    ],
  },

  // 基础兜底机型
  '三一平地机': {
    supportsTrajectory: false,
    model: 'SMG200',
    plate: '湘A · SMG200',
    status: '行驶',
    realtime: [
      ['设备状态', '行驶'],
      ['水温', '80', '°C'],
      ['发动机转速', '1,480', 'r/min'],
      ['机油压力', '2.3', 'Kpa'],
      ['当前油位', '70', '%'],
    ],
    workDist: [0,0,0,0,1,1,1,1,1,2,2,1,0,0,1,1,1,1,2,2,1,0,0,0],
    today: [['怠速工时', '1.2', 'h'], ['工时', '7.5', 'h']],
    cumulative: [['总油耗', '200', 'L'], ['总工作时间', '2,000', 'H']],
  },
};

const Icon = ({ type, size = 20 }) => {
  const iconMap = { report: 'report', behavior: 'chart', nav: 'navigation', grid: 'grid', parts: 'book', training: 'book', service: 'service', pin: 'location', clock: 'clock' };
  if (iconMap[type]) return <IconFont name={iconMap[type]} size={size} />;
  const paths = {
    behavior: <><path d="M4 18V6M4 18h16"/><path d="m7 14 3-4 3 2 4-6"/></>,
    report: <><rect x="3" y="4" width="18" height="13" rx="2" strokeWidth="1.6"/><path d="M8 20h8" strokeWidth="1.6"/><path d="M12 17v3" strokeWidth="1.6"/><path d="M7 12l3-3 3 2 4-4" strokeWidth="1.6" strokeLinejoin="round"/></>,
    parts: <><path d="M4 4h5l2 2h9V19H4z" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="13" r="3" strokeWidth="1.4"/><path d="M12 10v-1M12 17v-1M9.5 11.5l-.7-.7M15.2 15.2l-.7-.7M9.5 14.5l-.7.7M15.2 10.8l-.7.7" strokeWidth="1.2"/></>,
    service: <><path d="M4 4h5l2 2h9V19H4z" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="13" r="3.5" strokeWidth="1.4"/><path d="M14.5 15.5l2 2" strokeWidth="1.4"/></>,
    training: <><path d="M5 4.5h13.5A1.5 1.5 0 0 1 20 6v14H7a3 3 0 0 1-3-3V6.5a2 2 0 0 1 2-2Z" strokeWidth="1.6" strokeLinejoin="round"/><path d="M7 17h11" strokeWidth="1.6"/><path d="M7 17V6.5" strokeWidth="1.6"/></>,
    grid: <><rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor" stroke="currentColor" strokeWidth="1.2"/><rect x="13" y="3" width="8" height="8" rx="1.5" fill="currentColor" stroke="currentColor" strokeWidth="1.2"/><rect x="3" y="13" width="8" height="8" rx="1.5" fill="currentColor" stroke="currentColor" strokeWidth="1.2"/><rect x="13" y="13" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></>,
    nav: <path d="m4 11 16-7-7 16-2-7-7-2Z"/>,
    charge: <path d="M13 2 3 14h8l-1 8 11-12h-8l1-8Z" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
};

const Metric = ({ item }) => {
  const [label, value, unit] = item;
  return (
    <div className="min-w-0">
      <div className="flex items-baseline gap-1 text-[#303640]">
        <span className="text-[23px] font-normal leading-none tracking-[-0.4px]">{value}</span>
        {unit && <span className="text-[12px] font-medium">{unit}</span>}
      </div>
      <div className="mt-2 text-[12px] leading-[16px] text-[#7a8290]">{label}</div>
    </div>
  );
};

/* 起重机专属实时工况图示 */
const CraneDiagram = ({ metrics }) => (
  <div className="rounded-[16px] bg-white p-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
    <div className="flex items-center justify-between text-[12px]">
      <div className="flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1 font-medium text-gray-700">
        <span>🪝</span>
        <span>{metrics.hookMultiplier}</span>
      </div>
      <div className="rounded-full bg-gray-700 px-4 py-1 text-[13px] font-semibold text-white">
        {metrics.torquePercentage}
      </div>
      <div className="flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1 font-medium text-gray-700">
        <span>🚩</span>
        <span>{metrics.windSpeed}</span>
      </div>
    </div>

    {/* MAX / ACT box */}
    <div className="mt-3 flex">
      <div className="flex rounded border border-gray-200 text-[11px] text-gray-600 overflow-hidden">
        <div className="bg-gray-50 px-2.5 py-1 text-center border-r border-gray-200">
          <div className="font-semibold text-gray-800">{metrics.maxLoad}</div>
          <div className="text-[10px] text-gray-400">MAX</div>
        </div>
        <div className="bg-white px-2.5 py-1 text-center">
          <div className="font-semibold text-blue-600">{metrics.actLoad}</div>
          <div className="text-[10px] text-gray-400">ACT</div>
        </div>
      </div>
    </div>

    {/* SVG 起重机图形与尺寸标注 */}
    <div className="relative mt-2 h-[200px] w-full overflow-hidden">
      <svg viewBox="0 0 340 200" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* 支腿跨距标线 */}
        <line x1="40" y1="185" x2="300" y2="185" stroke="#9ca3af" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="40" y1="180" x2="40" y2="190" stroke="#9ca3af" strokeWidth="1.5" />
        <line x1="300" y1="180" x2="300" y2="190" stroke="#9ca3af" strokeWidth="1.5" />
        <text x="170" y="195" textAnchor="middle" fill="#6b7280" fontSize="10">{metrics.outriggerSpan}</text>

        {/* 吊臂长度标线 */}
        <line x1="140" y1="130" x2="270" y2="50" stroke="#9ca3af" strokeWidth="1" strokeDasharray="2 2" />
        <text x="195" y="80" textAnchor="middle" fill="#4b5563" fontSize="11" fontWeight="600">{metrics.boomLength}</text>

        {/* 角度标注 */}
        <text x="190" y="145" textAnchor="middle" fill="#6b7280" fontSize="11">{metrics.angle}</text>

        {/* 幅度标线 */}
        <text x="305" y="145" textAnchor="middle" fill="#6b7280" fontSize="11">{metrics.radius}</text>

        {/* 车身底盘 */}
        <rect x="50" y="145" width="220" height="26" rx="4" fill="#2d3748" />
        <rect x="50" y="140" width="100" height="10" fill="#eab308" rx="2" />
        {/* 驾驶室 */}
        <path d="M 215 145 L 260 145 L 255 130 L 230 130 Z" fill="#eab308" />
        <rect x="235" y="133" width="18" height="9" rx="1" fill="#60a5fa" opacity="0.8" />
        <text x="245" y="152" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">SANY</text>

        {/* 支腿 */}
        <line x1="60" y1="171" x2="60" y2="185" stroke="#374151" strokeWidth="6" strokeLinecap="round" />
        <line x1="50" y1="185" x2="70" y2="185" stroke="#374151" strokeWidth="3" />
        <line x1="250" y1="171" x2="250" y2="185" stroke="#374151" strokeWidth="6" strokeLinecap="round" />
        <line x1="240" y1="185" x2="260" y2="185" stroke="#374151" strokeWidth="3" />

        {/* 车轮 */}
        <circle cx="90" cy="172" r="13" fill="#1f2937" stroke="#9ca3af" strokeWidth="2" />
        <circle cx="120" cy="172" r="13" fill="#1f2937" stroke="#9ca3af" strokeWidth="2" />
        <circle cx="210" cy="172" r="13" fill="#1f2937" stroke="#9ca3af" strokeWidth="2" />

        {/* 回转台与驾驶室 */}
        <rect x="75" y="130" width="60" height="15" rx="2" fill="#eab308" />
        <rect x="95" y="120" width="35" height="15" rx="2" fill="#f59e0b" />
        <rect x="100" y="122" width="15" height="10" rx="1" fill="#93c5fd" />

        {/* 伸缩吊臂 (红色 SANY) */}
        <path d="M 120 130 L 280 50 L 285 58 L 125 138 Z" fill="#dc2626" />
        <text x="210" y="90" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" transform="rotate(-26, 210, 90)">SANY</text>

        {/* 吊臂顶端与钢丝绳、吊钩 */}
        <line x1="282" y1="54" x2="282" y2="125" stroke="#4b5563" strokeWidth="1.5" />
        <path d="M 278 125 Q 282 135 286 130" fill="none" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>

    {/* 底部指标：RPM, ECT, 油位 */}
    <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3 text-[12px]">
      <div className="flex gap-2 text-center text-[11px] text-gray-600">
        <div className="rounded border border-gray-200 px-2 py-1">
          <div className="font-semibold text-gray-800">{metrics.rpm}</div>
          <div className="text-[10px] text-gray-400">RPM</div>
        </div>
        <div className="rounded border border-gray-200 px-2 py-1">
          <div className="font-semibold text-gray-800">{metrics.ect}</div>
          <div className="text-[10px] text-gray-400">ECT</div>
        </div>
      </div>
      <div className="flex items-center gap-1 text-[13px] font-medium text-gray-700">
        <span>⛽</span>
        <span>{metrics.fuelLevel}</span>
      </div>
    </div>
  </div>
);

/* 电动装载机专属电量图表 */
const BatteryLevelChart = ({ level = 72 }) => (
  <div className="mt-4 rounded-xl bg-gray-50/70 p-3">
    <div className="text-[11px] font-medium text-gray-600 mb-2">电量/kWh</div>
    <div className="relative h-[110px] w-full">
      {/* 水平刻度虚线 */}
      {[80, 60, 40, 20, 0].map((tick, i) => (
        <div key={tick} className="absolute inset-x-0 flex items-center" style={{ top: `${i * 25}%` }}>
          <span className="w-6 text-[10px] text-gray-400">{tick}</span>
          <div className="flex-1 border-b border-dashed border-gray-200 ml-1" />
        </div>
      ))}
      {/* 00:00 柱状指示条 */}
      <div
        className="absolute left-[34px] bottom-0 w-2.5 rounded-t bg-emerald-400"
        style={{ height: `${(level / 80) * 100}%` }}
      />
    </div>
    {/* 时间轴标签 */}
    <div className="flex justify-between text-[10px] text-gray-400 mt-2 pl-6">
      <span>00:00</span>
      <span>04:00</span>
      <span>08:00</span>
      <span>12:00</span>
      <span>16:00</span>
      <span>20:00</span>
      <span>24:00</span>
    </div>
  </div>
);

/* 真实高保真轨迹地图组件（Google地图外观） */
const TrajectoryMap = ({ type }) => (
  <div className="relative mt-3 h-[180px] overflow-hidden rounded-xl bg-[#f8f9fa] border border-gray-200">
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 180" preserveAspectRatio="none" aria-hidden="true">
      {/* 地图道路网格底纹 */}
      <line x1="0" y1="40" x2="320" y2="40" stroke="#ffffff" strokeWidth="4" />
      <line x1="0" y1="120" x2="320" y2="120" stroke="#ffffff" strokeWidth="5" />
      <line x1="80" y1="0" x2="80" y2="180" stroke="#ffffff" strokeWidth="4" />
      <line x1="220" y1="0" x2="220" y2="180" stroke="#ffffff" strokeWidth="6" />

      {type === 'mixer' ? (
        <>
          {/* 搅拌车绿色闭环轨迹线 */}
          <path d="M 80 40 L 95 65 L 140 35 L 240 70 L 190 105 L 135 75 L 130 115 L 150 145 L 145 155" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* 起点标志旗 */}
          <circle cx="80" cy="40" r="10" fill="#22c55e" />
          <circle cx="80" cy="40" r="4" fill="#ffffff" />
          <path d="M 77 36 L 83 38 L 77 42 Z" fill="#ffffff" />
        </>
      ) : (
        <>
          {/* 自卸车坐标图钉 */}
          <circle cx="160" cy="50" r="14" fill="#3b82f6" opacity="0.2" />
          <circle cx="160" cy="50" r="8" fill="#2563eb" />
          <circle cx="160" cy="50" r="3" fill="#ffffff" />
        </>
      )}
    </svg>

    {/* Google 水印 */}
    <div className="absolute left-3 bottom-2 flex items-center font-sans text-[12px] font-bold tracking-tight select-none">
      <span className="text-[#4285F4]">G</span>
      <span className="text-[#EA4335]">o</span>
      <span className="text-[#FBBC05]">o</span>
      <span className="text-[#4285F4]">g</span>
      <span className="text-[#34A853]">l</span>
      <span className="text-[#EA4335]">e</span>
    </div>
  </div>
);

const WorkConditionDetail = ({
  device,
  onBack,
  onNavigate,
  backLabel = '返回资产列表',
  demoMode = false,
  onRequireLogin,
}) => {
  const [hint, setHint] = useState('');
  const timerRef = useRef(null);

  const templateData = MACHINE_DATA['三一平地机'];
  const data = MACHINE_DATA[device?.code] || MACHINE_DATA[device?.name] || {
    ...templateData,
    model: device?.name || templateData.model,
    plate: device?.code || templateData.plate,
    status: device?.statusText || templateData.status,
    realtime: [
      ['设备状态', device?.statusText || '在线'],
      ['当日工时', String(device?.todayHours || '0').replace(/[^\d.]/g, ''), 'h'],
      ['当日能耗', String(device?.todayEnergy || '0').replace(/[^\d.]/g, ''), String(device?.todayEnergy || '').includes('kWh') ? 'kWh' : 'L'],
      ['异常数量', String(device?.auditCounts?.exception || 0), '条'],
    ],
    today: [
      ['当日总工时', String(device?.todayHours || '0').replace(/[^\d.]/g, ''), 'h'],
      ['当日总能耗', String(device?.todayEnergy || '0').replace(/[^\d.]/g, ''), String(device?.todayEnergy || '').includes('kWh') ? 'kWh' : 'L'],
    ],
    cumulative: [
      ['设备编号', device?.code || '-'],
      ['待处理异常', String(device?.auditCounts?.exception || 0), '条'],
    ],
  };

  const isExcavator = ['挖掘机', '三一挖掘机', 'SY014CF', 'SY014CF0113D8'].includes(device?.name) || device?.code?.startsWith('SY014CF');
  const isCrane = ['汽车起重机', '三一起重机', 'AC0250CF', 'AC0250CF0056'].includes(device?.name) || device?.code?.startsWith('AC0250');
  const isMixer = ['搅拌车', '纯电搅拌车', 'HSGJ1051', 'HSGJ1051016142'].includes(device?.name) || device?.code?.startsWith('HSGJ');
  const _isMiningTruck = ['矿用宽体自卸车', '宽体车', 'KT090AE', 'KT090AE20208'].includes(device?.name) || device?.code?.startsWith('KT090AE');
  const _isDumpTruck = ['自卸车', 'HRZX2331', 'HRZX2331008983'].includes(device?.name) || device?.code?.startsWith('HRZX');
  const isLoader = ['电动装载机', '装载机', 'SW970EACG', 'SW970EACG0278'].includes(device?.name) || device?.code?.startsWith('SW970E');

  const reportTime = data.reportTime || '2026-09-20 09:41:00';
  const fuelLevel = data.realtime.find(([label]) => ['当前油位', '油位'].includes(label))?.[1] || '70';

  const showHint = (label) => {
    window.clearTimeout(timerRef.current);
    setHint(`${label}功能演示`);
    timerRef.current = window.setTimeout(() => setHint(''), 1400);
  };

  const handleAction = (actionName, callback) => {
    if (demoMode) {
      onRequireLogin?.();
      return;
    }
    if (callback) {
      callback();
    } else {
      showHint(actionName);
    }
  };

  return (
    <div className="relative min-h-full bg-[#f1f3f7] text-[#252b33]">
      <header className="sticky top-0 z-20 bg-[#f1f3f7]/95 backdrop-blur-sm">
        <div className="h-[52px] px-3 flex items-center">
          <button type="button" onClick={onBack} aria-label={backLabel} className="h-9 w-9 flex items-center justify-center rounded-full active:bg-black/5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#252b33" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex-1 truncate px-2 text-[15px] font-medium">{device?.code}</div>
          <button type="button" aria-label="更多操作" onClick={() => handleAction('更多')} className="h-9 w-9 flex items-center justify-center text-[20px] tracking-[2px] cursor-pointer active:opacity-70">•••</button>
        </div>
        <div className="pb-3 text-center text-[11px] text-[#9299a8] flex items-center justify-center gap-1">
          <span>上数时间 {reportTime}</span>
          <span className="text-[10px] text-[#9299a8]">ⓘ</span>
        </div>
      </header>

      <main className="px-3 pb-8 space-y-3.5">
        <section className="rounded-[14px] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
          <div className="flex gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2 text-[14px] font-medium">
                <span className="truncate">{device?.code}</span>
                <button type="button" aria-label="修改设备编号" onClick={() => handleAction('修改编号')} className="text-[12px] text-gray-400 hover:text-gray-600 cursor-pointer">✎</button>
              </div>
              <div className="text-[13px] text-[#444b55] flex items-center">
                <span>{data.plate || '车牌号'}</span>
                <button type="button" aria-label="修改车牌" onClick={() => handleAction('修改车牌')} className="ml-1 text-[12px] text-gray-400 hover:text-gray-600 cursor-pointer">✎</button>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#4c535c]"><Icon type="pin" size={16}/><span className="truncate">{data.location || device?.location || '湖南省长沙市宁乡经开区'}</span></div>
              <div className="flex items-center gap-2 text-[12px] text-[#4c535c]"><Icon type="clock" size={16}/><span>{reportTime}</span></div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <div className="h-[43px] w-[64px] overflow-hidden rounded bg-[#eef0f2]"><img src={device?.image} alt={device?.name} className="h-full w-full object-contain" /></div>
              {data.supportsTrajectory !== false && (
                <button type="button" aria-label="行驶轨迹" onClick={() => handleAction('行驶轨迹')} className="h-10 w-10 rounded-full border border-[#76a9ff] text-[#2377f3] flex items-center justify-center active:bg-blue-50 cursor-pointer"><Icon type="nav" /></button>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {(isLoader ? [
              ["report", "数据报表", () => handleAction('数据报表', () => onNavigate?.('dataReport'))],
              ["nav", "动态曲线", () => handleAction('动态曲线')],
              ["charge", "充电数据", () => handleAction('充电数据')],
              ["grid", "更多操作", () => handleAction('更多操作')],
            ] : [
              ["report", "数据报表", () => handleAction('数据报表', () => onNavigate?.('dataReport'))],
              ["behavior", "数据分析", () => handleAction('数据分析', () => onNavigate?.('dataAnalysis'))],
              ["nav", "动态曲线", () => handleAction('动态曲线')],
              ["grid", "更多操作", () => handleAction('更多操作')],
            ]).map(([icon, label, fn]) => (
              <button key={label} type="button" aria-label={label} onClick={fn} className="h-[76px] rounded-[12px] border border-[#aeb5bf] flex flex-col items-center justify-center gap-1.5 text-[#303640] active:bg-gray-50 cursor-pointer"><Icon type={icon}/><span className="text-[11px] text-[#68707d] leading-tight">{label}</span></button>
            ))}
          </div>
        </section>

        {/* 起重机专属图示 */}
        {isCrane && data.craneMetrics && (
          <CraneDiagram metrics={data.craneMetrics} />
        )}

        {/* 实时工况（起重机除外，起重机使用专属实时工况图示及下方补充数据） */}
        <section className="rounded-[16px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
          <h2 className="text-[16px] font-semibold">实时工况</h2>
          <div className="mt-1 text-[11px] text-[#656d78]">{reportTime}</div>
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-7">{data.realtime.map((item) => <Metric key={item[0]} item={item} />)}</div>
          {isMixer && (
            <div className="mt-4 border-t border-gray-100 pt-3 text-center">
              <button type="button" onClick={() => handleAction('更多工况参数')} className="text-[12px] text-gray-500 hover:text-gray-700">
                更多 ∨
              </button>
            </div>
          )}
        </section>

        {/* 行驶轨迹 */}
        {data.supportsTrajectory && (
          <section className="rounded-[14px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">行驶轨迹</h2>
              <button type="button" onClick={() => handleAction('查看详情')} className="text-[12px] text-[#2377f3] active:opacity-70 cursor-pointer">查看详情</button>
            </div>
            <TrajectoryMap type={data.trajectoryType || 'default'} startLocation={data.startLocation} endLocation={data.endLocation} />
            <div className="mt-3 space-y-1 text-[11px] text-[#666]">
              <div>起点位置：{data.startLocation || data.location || '湖南省长沙市宁乡经开区'}</div>
              <div>终点位置：{data.endLocation || data.location || '湖南省长沙市宁乡经开区'}</div>
            </div>
          </section>
        )}

        {/* 今日数据 */}
        <section className="rounded-[14px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[16px] font-semibold">今日数据</h2>
            <button type="button" onClick={() => handleAction('今日数据说明')} className="h-4 w-4 rounded-full bg-[#303640] text-center text-[10px] leading-4 text-white flex items-center justify-center cursor-pointer" aria-label="今日数据说明">?</button>
          </div>
          <div className={`mt-7 grid gap-6 ${data.today.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>{data.today.map((item) => <Metric key={item[0]} item={item} />)}</div>
          {data.workDist && <WorkStatusTimeline segments={data.workDist} />}
          {!data.electric && !isExcavator && !isCrane && !isLoader && <FuelLevelChart level={fuelLevel} />}
          {isLoader && <BatteryLevelChart level={72} />}
        </section>

        {/* 挖掘机专用油耗数据与曲线 */}
        {isExcavator && (
          <>
            <section className="rounded-[14px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
              <h2 className="text-[16px] font-semibold">油耗数据</h2>
              <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-7">
                <Metric item={['当日油耗', '-', 'L']} />
                <Metric item={['当日无动作油耗', '-', 'L']} />
              </div>
            </section>
            <section className="rounded-[14px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
              <h2 className="text-[16px] font-semibold">油位曲线</h2>
              <FuelLevelChart level="26" excavator />
            </section>
            <section className="rounded-[14px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
              <h2 className="text-[16px] font-semibold">设备动态</h2>
              <div className="mt-5 space-y-4 text-[12px] text-[#5f6772]">
                <div className="flex items-center justify-between"><span>设备开机</span><span>16:55:25 (UTC+5.5)</span></div>
                <div className="flex items-center justify-between"><span>设备关机</span><span>15:36:29 (UTC+5.5)</span></div>
              </div>
            </section>
          </>
        )}

        {/* 累计数据 */}
        <section className="rounded-[14px] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(31,41,55,0.035)]">
          <h2 className="text-[16px] font-semibold">累计数据</h2>
          <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-7">{data.cumulative.map((item) => <Metric key={item[0]} item={item} />)}</div>
        </section>

      </main>

      {hint && <div role="status" className="absolute left-1/2 top-[45%] z-50 -translate-x-1/2 rounded-lg bg-black/75 px-4 py-2 text-[12px] text-white">{hint}</div>}
    </div>
  );
};

export default WorkConditionDetail;

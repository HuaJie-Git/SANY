import React from 'react';

export const WIDEBODY_DICTIONARY = {
  // Vehicle types
  '电动宽体车': 'Electric Wide-body Dump Truck',
  '燃油宽体车': 'Diesel Wide-body Dump Truck',
  '矿用宽体自卸车': 'Diesel Wide-body Dump Truck',
  '宽体车': 'Wide-body Dump Truck',

  // Statuses
  '工作': 'Operating',
  '怠速': 'Idling',
  '停机': 'Shutdown',
  '行驶': 'Driving',
  '离线': 'Offline',
  '充电中': 'Charging',
  '已完成': 'Completed',

  // Tabs & Nav
  '实时状态': 'Real-time Status',
  '统计报表': 'Statistics Report',
  '数据报表': 'Data Report',
  '运营报表': 'Operating Report',
  '充电报表': 'Charging Report',
  '历史轨迹': 'History Track',
  '设备档案': 'Equipment Archive',
  '数据分析': 'Data Analysis',
  '设备运营分析': 'Operating Analysis',
  '充电数据': 'Charging Data',
  '行驶轨迹': 'Travel Track',
  '操作行为分析': 'Operating Behavior',
  '油耗分析': 'Fuel Consumption Analysis',
  '选择报表': 'Select Report',

  // Periods
  '日报': 'Daily Report',
  '周报': 'Weekly Report',
  '月报': 'Monthly Report',
  '日': 'Day',
  '周': 'Week',
  '月': 'Month',

  // Realtime & Condition Metrics
  '设备状态': 'Equipment Status',
  '剩余电量': 'State of Charge (SOC)',
  '电池健康': 'Battery Health',
  '车速': 'Vehicle Speed',
  '最高车速': 'Max Speed',
  '油门深度': 'Throttle Depth',
  '制动深度': 'Brake Depth',
  '运载趟数': 'Haul Trips',
  '运输重量': 'Payload Weight',
  '油位': 'Fuel Level',
  '当前油位': 'Current Fuel Level',
  '油位曲线': 'Fuel Level Curve',
  '齿轮模式': 'Current Gear',
  '当前档位': 'Current Gear',
  '档位使用情况': 'Gear Distribution',
  '档位分布': 'Gear Distribution',
  '档位用时': 'Gear Duration',
  '档位用时分布': 'Gear Duration Distribution',

  // Today & Cumulative Metrics
  '今日数据': "Today's Data",
  '今日能耗': "Today's Energy",
  '工时数据': 'Operating Hours Data',
  '累计数据': 'Cumulative Data',
  '最新工况': 'Latest Operating Condition',
  '工时': 'Operating Hours',
  '怠速工时': 'Idle Hours',
  '运行时长': 'Running Time',
  '发动机运行时长': 'Engine Running Time',
  '无动作时长': 'Inactive Duration',
  '关机时长': 'Shutdown Duration',
  '实际操作时长': 'Actual Operating Time',
  '机器利用率': 'Machine Utilization',
  '里程': 'Mileage',
  '总里程': 'Total Mileage',
  '电耗': 'Power Consumption',
  '总电耗': 'Total Energy Consumption',
  '平均电耗': 'Avg Energy Consumption',
  '运行功耗': 'Operating Energy Consumption',
  '空闲功耗': 'Idle Energy Consumption',
  '回收电量': 'Regenerated Energy',
  '充电时长': 'Charging Duration',
  '总充电时长': 'Total Charging Duration',
  '总充电电量': 'Total Charging Energy',
  '能耗': 'Energy Consumption',
  '总能耗': 'Total Energy Consumption',
  '平均每小时能耗': 'Avg Hourly Energy Consumption',
  '平均每小时油耗': 'Avg Hourly Fuel Consumption',
  '运行燃油消耗': 'Operating Fuel Consumption',
  '怠速油耗': 'Idling Fuel Consumption',
  '当日总工时': "Today's Total Hours",
  '当日无动作工时': "Today's Inactive Hours",
  '总工作时间': 'Total Operating Time',
  '总运行时长': 'Total Running Time',
  '总运载趟数': 'Total Haul Trips',
  '总运输重量': 'Total Payload Weight',

  // Operations Metrics
  '工作时长百分率': 'Operating Time Percentage',
  '怠速时长百分率': 'Idle Time Percentage',
  '空载平均车速': 'Empty Avg Speed',
  '重载平均车速': 'Loaded Avg Speed',
  '平均循环时长': 'Average Cycle Time',
  '平均单趟有效载荷': 'Average Payload per Trip',
  '设备车速分析': 'Vehicle Speed Analysis',
  '设备运行分析': 'Equipment Operation Analysis',
  '当日开工分布': "Today's Work Distribution",
  '每日工作分布': 'Daily Work Distribution',
  '开机时段分析': 'Operating Period Analysis',
  '设备运行日历': 'Equipment Operating Calendar',

  // Charging Metrics & Table
  '充电汇总': 'Charging Summary',
  '充电记录': 'Charging Records',
  '充电次数': 'Charging Times',
  '充电总电量': 'Total Charging Energy',
  '起始时间': 'Start Time',
  '截止时间': 'End Time',
  '开始时间': 'Start Time',
  '结束时间': 'End Time',
  '开始SOC': 'Start SOC',
  '结束SOC': 'End SOC',
  'SOC增加量': 'SOC Increase',
  '充电电量': 'Charging Energy',
  '充电电量 (kWh)': 'Charging Energy (kWh)',
  '充电时长 (h)': 'Charging Duration (h)',
  '充电桩位置': 'Charging Station Location',
  '充电位置': 'Charging Location',
  '电量': 'Energy',
  '地点': 'Location',

  // Track & Map
  '起点位置': 'Start Location',
  '当前位置': 'Current Location',
  '终点位置': 'End Location',
  '运行路线': 'Operating Route',
  '所在地': 'Location',
  '当日总里程': "Today's Mileage",
  '当日总电耗': "Today's Energy",
  '查看轨迹详情': 'View Track Details',
  '查看详情': 'View Details',
  '轨迹时间': 'Track Time',
  '轨迹记录': 'Track Records',
  '回放': 'Playback',
  '播放': 'Play',
  '暂停': 'Pause',

  // Actions & Controls
  '日期区间': 'Date Range',
  '开始日期': 'Start Date',
  '结束日期': 'End Date',
  '查询': 'Query',
  '导出': 'Export',
  '导出 CSV': 'Export CSV',
  '应用': 'Apply',
  '取消': 'Cancel',
  '重试': 'Retry',
  '重新加载': 'Reload',
  '返回': 'Back',
  '返回设备列表': 'Back to Equipment List',
  '返回数据分析': 'Back to Data Analysis',
  '恢复设备': 'Restore Equipment',
  '前一天': 'Previous Day',
  '后一天': 'Next Day',
  '开始分析': 'Start Analysis',
  '近7日数据': 'Last 7 Days',

  // States & Errors
  '暂无数据': 'No Data Available',
  '暂无记录': 'No Records Available',
  '暂无运营分析数据': 'No Operating Analysis Data',
  '暂无宽体车统计报表数据': 'No Wide-body Statistics Data',
  '暂无宽体车充电报表数据': 'No Wide-body Charging Data',
  '暂无历史轨迹数据': 'No History Track Data',
  '该设备暂无历史轨迹数据': 'No History Track Data for This Equipment',
  '报表数据加载失败': 'Report Data Loading Failed',
  '正在加载数据…': 'Loading Data…',
  '正在加载统计报表数据…': 'Loading Statistics Report Data…',
  '正在加载运营报表数据…': 'Loading Operating Report Data…',
  '正在加载充电报表数据…': 'Loading Charging Report Data…',
  '暂无权限查看此设备统计报表': 'No Permission to View Statistics Report',
  '暂无权限查看此设备运营报表': 'No Permission to View Operating Report',
  '暂无权限查看此设备充电报表': 'No Permission to View Charging Report',
  '该设备已删除': 'This Equipment Has Been Deleted',
  '设备当前离线，以下为最后上报历史数据': 'Equipment is offline. Displaying last reported historical data',
  '以下数据为设备所在地当日数据实时统计': "Real-time statistics for equipment location on current date",
};

export function getBilingualText(zh, defaultEn) {
  if (!zh) return { en: defaultEn || '', zh: '' };
  const clean = String(zh).trim();
  const en = WIDEBODY_DICTIONARY[clean] || defaultEn || clean;
  return { en, zh: clean };
}

/**
 * 通用双语标签组件 (英文上方较大、中文下方较小)
 * 遵从 WIDEBODY-BILINGUAL-001:
 * - 英文上、中文下
 * - 英文默认字号 > 中文字号 (默认 en:13px/600, zh:11px/400)
 * - 标题可传 size="title" (en:16px, zh:12px) 或自定义 enSize/zhSize
 * - 数值/编号/单位请由外部独立渲染，本组件仅负责文案双语
 */
export function BilingualLabel({
  zh,
  en,
  size = 'default',
  align = 'start',
  className = '',
  style = {},
  enStyle = {},
  zhStyle = {},
  enWeight = 600,
  zhWeight = 400,
}) {
  const t = getBilingualText(zh, en);
  if (!t.zh && !t.en) return null;

  let defaultEnSize = 13;
  let defaultZhSize = 11;
  if (size === 'title') {
    defaultEnSize = 16;
    defaultZhSize = 12;
  } else if (size === 'lg') {
    defaultEnSize = 14;
    defaultZhSize = 11;
  } else if (size === 'sm') {
    defaultEnSize = 12;
    defaultZhSize = 10;
  } else if (size === 'xs') {
    defaultEnSize = 11;
    defaultZhSize = 9;
  }

  const alignStyles = {
    start: { alignItems: 'flex-start', textAlign: 'left' },
    center: { alignItems: 'center', textAlign: 'center' },
    end: { alignItems: 'flex-end', textAlign: 'right' },
  }[align] || { alignItems: 'flex-start', textAlign: 'left' };

  return (
    <span
      className={`widebody-bilingual-block ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        lineHeight: 1.2,
        ...alignStyles,
        ...style,
      }}
    >
      <span
        className="widebody-bilingual-en"
        style={{
          fontSize: defaultEnSize,
          fontWeight: enWeight,
          color: 'inherit',
          lineHeight: 1.2,
          ...enStyle,
        }}
      >
        {t.en}
      </span>
      <span
        className="widebody-bilingual-zh"
        style={{
          fontSize: defaultZhSize,
          fontWeight: zhWeight,
          opacity: 0.85,
          color: 'inherit',
          lineHeight: 1.2,
          marginTop: 1,
          ...zhStyle,
        }}
      >
        {t.zh}
      </span>
    </span>
  );
}

export default BilingualLabel;

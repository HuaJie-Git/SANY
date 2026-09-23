export const ESC_EVENT_STORAGE_KEY = 'sanvist_esc_event_v2';

export const DEFAULT_ESC_EVENT = {
  id: 'esc-20260906-001',
  title: 'ESC 事件',
  deviceName: '纯电搅拌车',
  serialNumber: 'SYM5310BEV-8001',
  occurredAt: '2026-09-06 16:20',
  eventNo: 'ESC-20260906-001',
  summary: '搅拌桶液压系统压力异常，请查看当前设备工况。',
};

// ESC 可视化属性名称统一由此处维护；key 与展示名称解耦，避免改名影响数据口径。
export const ESC_SIGNAL_FIELDS = [
  { key: 'workStatus', label: 'ESC工作状态', value: '工作' },
  { key: 'faultStatus', label: 'ESC故障状态', value: '正常' },
  { key: 'faultCode', label: 'ESC故障代码', value: '0' },
  { key: 'enabledStatus', label: 'ESC开启状态', value: '开启' },
  { key: 'steeringAngle', label: '方向盘角度', value: '2.4', unit: '°' },
  { key: 'engineTorque', label: '发动机扭矩', value: '48', unit: '%' },
  { key: 'brakeSwitch', label: '制动踏板开关状态', value: '关闭' },
  { key: 'brakePosition', label: '制动踏板位置', value: '0', unit: '%' },
  { key: 'yawRate', label: '横摆角速度', value: '0.18', unit: '°/s' },
  { key: 'lateralAcceleration', label: '横向加速度', value: '0.03', unit: 'm/s²' },
  { key: 'longitudinalAcceleration', label: '纵向加速度', value: '0.12', unit: 'm/s²' },
  {
    key: 'wheelSpeed',
    label: '轮速',
    children: [
      { key: 'frontLeftWheelSpeed', label: '左前轮速度', value: '12.4', unit: 'km/h' },
      { key: 'frontRightWheelSpeed', label: '右前轮速度', value: '12.5', unit: 'km/h' },
      { key: 'rearLeftWheelSpeed', label: '左后轮速度', value: '12.3', unit: 'km/h' },
      { key: 'rearRightWheelSpeed', label: '右后轮速度', value: '12.4', unit: 'km/h' },
    ],
  },
  { key: 'acceleratorPosition', label: '油门踏板位置', value: '21', unit: '%' },
  { key: 'ebsFaultStatus', label: 'EBS故障状态', value: '正常' },
];

export const ESC_EVENT_RECORDS = [
  {
    ...DEFAULT_ESC_EVENT,
    workStatus: '工作',
    faultStatus: '正常',
    faultCode: '0',
    enabledStatus: '开启',
  },
  {
    id: 'esc-20260805-003',
    title: 'ESC 事件',
    deviceName: '纯电搅拌车',
    serialNumber: 'SYM5310BEV-8001',
    occurredAt: '2026-08-05 16:00',
    eventNo: 'ESC-20260805-003',
    summary: '车辆横摆角速度波动超出参考范围，请核对路况与传感器状态。',
    workStatus: '未工作',
    faultStatus: '异常',
    faultCode: 'C1234',
    enabledStatus: '开启',
  },
  {
    id: 'esc-20260721-002',
    title: 'ESC 事件',
    deviceName: '纯电搅拌车',
    serialNumber: 'SYM5310BEV-8001',
    occurredAt: '2026-07-21 17:07',
    eventNo: 'ESC-20260721-002',
    summary: '制动踏板信号与车辆状态不一致，请检查制动系统连接状态。',
    workStatus: '工作',
    faultStatus: '异常',
    faultCode: 'C1102',
    enabledStatus: '开启',
  },
];

export const readEscEvent = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(ESC_EVENT_STORAGE_KEY) || '{}');
    return { ...DEFAULT_ESC_EVENT, ...(saved && typeof saved === 'object' ? saved : {}) };
  } catch {
    return DEFAULT_ESC_EVENT;
  }
};

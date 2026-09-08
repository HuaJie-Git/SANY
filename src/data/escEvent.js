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

export const readEscEvent = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(ESC_EVENT_STORAGE_KEY) || '{}');
    return { ...DEFAULT_ESC_EVENT, ...(saved && typeof saved === 'object' ? saved : {}) };
  } catch {
    return DEFAULT_ESC_EVENT;
  }
};

export const acknowledgeEscEvent = () => {
  const nextEvent = { ...readEscEvent(), acknowledgedAt: new Date().toISOString() };
  window.localStorage.setItem(ESC_EVENT_STORAGE_KEY, JSON.stringify(nextEvent));
  return nextEvent;
};

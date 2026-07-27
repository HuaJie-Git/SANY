export const WORK_STATUS_COLORS = {
  行驶: '#22b573',
  工作: '#3b82f6',
  怠速: '#f2c94c',
  其他: '#e5e7eb',
};

export const getPrimaryWorkStatus = (device) => (
  device?.type === '摊铺机' ? '行驶' : '工作'
);

export const buildDaySegments = (workHours, idleHours, primaryStatus) => {
  const work = Number(workHours) || 0;
  const idle = Number(idleHours) || 0;
  const segments = [];
  let cursor = 0;

  if (cursor < 8) {
    segments.push({ start: cursor, end: 8, status: '其他' });
    cursor = 8;
  }

  if (work > 0 && cursor < 24) {
    const end = Math.min(cursor + work, 24);
    segments.push({ start: cursor, end, status: primaryStatus });
    cursor = end;
  }

  if (idle > 0 && cursor < 24) {
    const end = Math.min(cursor + idle, 24);
    segments.push({ start: cursor, end, status: '怠速' });
    cursor = end;
  }

  if (cursor < 24) {
    segments.push({ start: cursor, end: 24, status: '其他' });
  }

  return segments;
};

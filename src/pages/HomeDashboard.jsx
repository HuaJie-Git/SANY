import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AUDIT_EVENTS } from '../data/auditEvents';
import { DEVICES } from '../data/devices';
import { createMaintenanceRows, MAINTENANCE_GROUPS, maintenanceStatus } from '../data/maintenancePlan';
import { CURRENT_USER } from '../data/session';
import './home-dashboard.css';

// v3 让新版首页骨架与旧版用户排序隔离；用户仍可在设置抽屉中重新排序。
const MODULES_KEY = 'sanvist_pc_home_modules_v4';
const ACTIONS_KEY = 'sanvist_pc_quick_actions_v2';
const LINKS_KEY = 'sanvist_pc_quick_links_v1';
const RECENT_KEY = 'sanvist_pc_recent_items_v3';
const TODO_KEY = 'sanvist_pc_todos_v1';

const DEFAULT_MODULES = [
  { id: 'maintenance', label: '计划保养', description: '保养状态概览与设备保养清单', visible: true },
  { id: 'operations', label: '设备运行概览', description: '管辖设备运行与能耗概览', visible: false },
  { id: 'tasks', label: '我的任务', description: '按任务状态跟踪个人工作队列', visible: true },
  { id: 'audit', label: '审核概览', description: '待处理事件与未读审核提醒', visible: true },
  { id: 'links', label: '快速链接', description: '常用业务系统入口', visible: true },
  { id: 'projects', label: '重点项目', description: '项目进度与在场设备', visible: false },
];

const DEFAULT_LINKS = [
  { id: 'device-management', label: '设备管理', meta: '主导航 · 设备管理', action: 'devices', visible: true, tone: 'red' },
  { id: 'project-management', label: '项目管理', meta: '主导航 · 项目管理', action: 'projects', visible: true, tone: 'blue' },
  { id: 'data-dashboard', label: '数据大屏', meta: '主导航 · 数据大屏', action: 'dashboard', visible: true, tone: 'orange' },
  { id: 'monitoring-center', label: '监控中心', meta: '主导航 · 监控中心', action: 'monitoring', visible: true, tone: 'green' },
  { id: 'maintenance-navigation', label: '设备保养', meta: '主导航 · 设备保养', action: 'maintenance', visible: true, tone: 'purple' },
  { id: 'repair-management', label: '维修管理', meta: '主导航 · 维修管理', action: 'repair', visible: true, tone: 'blue' },
];

const QUICK_ACTIONS = [
  { id: 'map-monitor', label: '地图监控', note: '查看设备位置与运行分布', icon: 'map' },
  { id: 'warning-center', label: '预警中心', note: '查看设备预警与处理状态', icon: 'alert' },
  { id: 'bind-device', label: '绑定设备', note: '查询并绑定设备', icon: 'link' },
  { id: 'personal', label: '个人中心', note: '查看个人信息与账号设置', icon: 'person' },
  { id: 'repair', label: '请求维修', note: '异常直接转维修召请', icon: 'wrench' },
  { id: 'parts', label: '订购配件', note: '按设备匹配原厂件', icon: 'parts' },
  { id: 'maintenance', label: '申请保养', note: '创建计划内保养', icon: 'calendar' },
  { id: 'inspection', label: '检查', note: '按标准检查表快速巡检', icon: 'inspection' },
  { id: 'task', label: '创建任务', note: '设置执行人和截止时间', icon: 'task' },
  { id: 'assign', label: '分配任务', note: '分配给人员或服务商', icon: 'assign' },
  { id: 'workorder', label: '查看工单', note: '跟踪处理闭环', icon: 'order' },
  { id: 'report-alert', label: '上报异常', note: '携带设备工况发起处理', icon: 'alert' },
];

const DEFAULT_ACTION_CONFIG = QUICK_ACTIONS.map((action) => ({ id: action.id, visible: true }));

const PROJECTS = Array.from(new Map(DEVICES.map((device) => [device.project?.name, device.project]).filter(([name]) => name))).map(([name, project], index) => ({
  id: `project-${index + 1}`,
  name,
  project,
  deviceIds: DEVICES.filter((device) => device.project?.name === name).map((device) => device.id),
}));

const FEATURES = [
  { id: 'asset-center', label: '设备管理', meta: '查看全部设备与运行状态', icon: 'asset', target: 'list' },
  { id: 'task-center', label: '任务中心', meta: '查看待处理、处理中和已完成任务', icon: 'task', target: 'task' },
  { id: 'maintenance-center', label: '计划内维护', meta: '查看维保计划与到期设备', icon: 'calendar', target: 'maintenance' },
  { id: 'inspection-center', label: '检查管理', meta: '创建检查单并跟踪结果', icon: 'inspection', target: 'inspection' },
  { id: 'repair-center', label: '维修管理', meta: '发起召请并查看维修进度', icon: 'wrench', target: 'repair' },
  { id: 'workorder-center', label: '工单中心', meta: '查询全部业务工单', icon: 'order', target: 'workorder' },
];

const SEARCH_CATEGORIES = ['设备', '品牌', '设备类型', '运行状态', '项目', '审核'];
const DEVICE_DETAIL_SHORTCUTS = ['实时状态', '统计报表', '设备档案', '历史轨迹', '保养管理', '预警记录', '报停记录', '参与项目'];
const isSearchRecent = (item) => ['asset', 'project', 'audit'].includes(item?.kind) || (item?.kind === 'facet' && SEARCH_CATEGORIES.includes(item.category));
const recentDisplayTitle = (item) => item?.kind === 'asset' ? `设备序列号：${item.title}` : item?.title;

function getTimeGreeting(date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return '早上好';
  if (hour >= 12 && hour < 18) return '下午好';
  if (hour >= 18 && hour < 24) return '晚上好';
  return '你好';
}

const AUDIT_GROUPS = [
  { id: 'device', label: '设备异常', count: 6, unread: 2, tone: 'danger' },
  { id: 'maintenance', label: '维保事项', count: 3, unread: 1, tone: 'warning' },
  { id: 'fuel', label: '燃油异常', count: 2, unread: 0, tone: 'orange' },
  { id: 'location', label: '位置预警', count: 1, unread: 1, tone: 'blue' },
  { id: 'inspection', label: '检查异常', count: 2, unread: 0, tone: 'purple' },
];

const DEFAULT_RECENT_ITEMS = [];


function loadPreference(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    // 兼容已保存的旧中文称谓，保留访问记录、模块排序和显隐设置。
    return value ? JSON.parse(value, (_key, item) => typeof item === 'string' ? item.replace(/\u8d44\u4ea7/g, '设备') : item) : fallback;
  } catch {
    return fallback;
  }
}

function mergePreference(defaults, saved) {
  if (!Array.isArray(saved)) return defaults;
  const defaultMap = new Map(defaults.map((item) => [item.id, item]));
  const seen = new Set();
  const merged = saved.flatMap((item) => {
    const fallback = defaultMap.get(item.id);
    if (!fallback) return [];
    seen.add(item.id);
    return [{ ...fallback, ...item }];
  });
  return [...merged, ...defaults.filter((item) => !seen.has(item.id))];
}

// 快速链接只允许保留用户配置的排序和显隐，名称、来源与跳转均以产品内功能目录为准。
function mergeLinkPreference(defaults, saved) {
  if (!Array.isArray(saved)) return defaults;
  const defaultMap = new Map(defaults.map((item) => [item.id, item]));
  const savedMap = new Map(saved.map((item) => [item.id, item]));
  const ordered = saved.map((item) => item.id).filter((id, index, ids) => defaultMap.has(id) && ids.indexOf(id) === index);
  const ids = [...ordered, ...defaults.map((item) => item.id).filter((id) => !ordered.includes(id))];
  return ids.map((id) => ({ ...defaultMap.get(id), visible: typeof savedMap.get(id)?.visible === 'boolean' ? savedMap.get(id).visible : defaultMap.get(id).visible }));
}

// 工作流动作 → 我的任务条目的演示映射（本地演示状态）
const WORKFLOW_TODO_META = {
  task: { category: '现场勘察', priority: '中', title: '新建处理任务' },
  assign: { category: '现场勘察', priority: '中', title: '任务分配' },
  inspection: { category: '现场勘察', priority: '中', title: '新建检查单' },
  repair: { category: '挖掘任务', priority: '高', title: '维修召请' },
  parts: { category: '运输任务', priority: '中', title: '配件需求' },
  maintenance: { category: '挖掘任务', priority: '中', title: '保养计划' },
  'report-alert': { category: '现场勘察', priority: '高', title: '异常上报' },
};

function buildDefaultTodos() {
  const alarmTasks = DEVICES.flatMap((device, deviceIndex) => (device.alarmRecords || [])
    .filter((alarm) => alarm.status !== '已处理')
    .map((alarm) => ({ ...alarm, device, deviceIndex })));
  return [
    { id: 'todo-alarm', category: '现场勘察', priority: '高', title: alarmTasks[0]?.name || '设备离线预警跟进', meta: `${DEVICES[0].code} · 王立军`, due: '今天 16:00', status: '待处理', progress: 0, device: DEVICES[0], type: 'task' },
    { id: 'todo-maintenance', category: '挖掘任务', priority: '中', title: 'SY215C-8890 月度保养检查', meta: `${DEVICES[0].code} · 陈海峰`, due: '今天 18:00', status: '处理中', progress: 1, device: DEVICES[0], type: 'maintenance' },
    { id: 'todo-inspection', category: '现场勘察', priority: '低', title: '昆明地铁站设备铭牌照片收集', meta: `${DEVICES[2].code} · 赵磊`, due: '明天 09:00', status: '已完成', progress: 2, device: DEVICES[2], type: 'inspection' },
    { id: 'todo-repair', category: '吊装任务', priority: '高', title: '汽车起重机例行巡检', meta: `${DEVICES[2].code} · 张明`, due: '明天 12:00', status: '处理中', progress: 1, device: DEVICES[2], type: 'repair' },
    { id: 'todo-parts', category: '运输任务', priority: '中', title: '备件加急运输', meta: `${DEVICES[1].code} · 陈海峰`, due: '8 月 15 日', status: '待处理', progress: 0, device: DEVICES[1], type: 'parts' },
  ];
}

function normalizeTodoItems(items) {
  const typeMap = { '任务': '现场勘察', '异常': '现场勘察', '检查': '现场勘察', '维保': '挖掘任务', '维修': '吊装任务', '配件': '运输任务' };
  return (Array.isArray(items) ? items : buildDefaultTodos()).map((item) => ({
    ...item,
    category: typeMap[item.category] || item.category || '现场勘察',
    priority: item.priority === '紧急' ? '高' : ['高', '中', '低'].includes(item.priority) ? item.priority : '中',
    status: item.status === '待受理' || item.status === '待确认' ? '待处理' : item.status,
  }));
}

function Icon({ name, size = 18 }) {
  const paths = {
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/></>,
    person: <><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
    search: <><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 4 4"/></>,
    wrench: <><path d="M14.5 6.5a4.3 4.3 0 0 0-5.4 5.4L4 17l3 3 5.1-5.1a4.3 4.3 0 0 0 5.4-5.4l-2.7 2.7-3-3z"/></>,
    parts: <><path d="m12 3 7 4v8l-7 4-7-4V7z"/><path d="m5 7 7 4 7-4M12 11v8"/></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></>,
    inspection: <><path d="M9 4h6l1 2h3v15H5V6h3z"/><path d="m8 13 2 2 5-5M9 8h6"/></>,
    task: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M8 10h8M8 14h5"/></>,
    assign: <><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 11h5M18.5 8.5v5"/></>,
    order: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></>,
    edit: <><path d="m5 16-1 4 4-1L19 8l-3-3z"/><path d="m14 7 3 3"/></>,
    link: <><path d="M9 15 7.5 16.5a3.5 3.5 0 0 1-5-5L6 8a3.5 3.5 0 0 1 5 0"/><path d="m15 9 1.5-1.5a3.5 3.5 0 0 1 5 5L18 16a3.5 3.5 0 0 1-5 0M8 12h8"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    robot: <><rect x="5" y="7" width="14" height="12" rx="4"/><path d="M12 3v4M9 12h.01M15 12h.01M9 16h6"/></>,
    phone: <><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M10 5h4M11 18.5h2"/></>,
    alert: <><path d="M12 3 2.8 20h18.4z"/><path d="M12 9v5M12 17h.01"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    gear: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l-2.9 2.9a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.6h-4a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.8.3l-2.9-2.9a1.7 1.7 0 0 0 .3-1.8A1.7 1.7 0 0 0 3 14v-4a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.8l2.9-2.9a1.7 1.7 0 0 0 1.8.3A1.7 1.7 0 0 0 10 3h4a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.8-.3l2.9 2.9a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.6 1v4a1.7 1.7 0 0 0-1.6 1z"/></>,
    asset: <><rect x="3" y="8" width="18" height="10" rx="2"/><path d="M7 18v2M17 18v2M7 8l2-4h6l2 4M7 13h.01M17 13h.01"/></>,
    project: <><path d="M4 20V6h6l2 2h8v12z"/><path d="M8 12h8M8 16h5"/></>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    trend: <><path d="M4 19V5M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/></>,
    fuel: <><path d="M6 21V4h9v17M5 21h11M8 8h5"/><path d="M15 7h2l2 3v7a2 2 0 0 0 2 2"/></>,
  };
  return <svg data-icon={name} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.arrow}</svg>;
}

function highlightText(text, query) {
  const value = String(text || '');
  const normalized = String(query || '').trim();
  if (!normalized) return value;
  const parts = value.split(new RegExp(`(${normalized.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'ig'));
  return parts.map((part, index) => part.toLowerCase() === normalized.toLowerCase() ? <mark key={`${part}-${index}`}>{part}</mark> : part);
}

function SearchItem({ item, query, onSelect, onAssetTab }) {
  const isAsset = item.type === '设备';
  return <div className="search-result-card">
    <button type="button" className="search-result-item" title={`${item.title} · ${item.meta}`} onClick={() => onSelect(item)}>
      {item.image ? <img src={item.image} alt=""/> : <span className={`search-result-icon type-${item.type}`}><Icon name={item.icon}/></span>}
      <div><strong>{highlightText(item.title, query)}</strong><small>{highlightText(item.meta, query)}</small></div>
      <Icon name="arrow" size={14}/>
    </button>
    {isAsset && <div className="search-result-shortcuts" aria-label={`${item.title}快捷入口`}>
      {DEVICE_DETAIL_SHORTCUTS.map((tab) => <button type="button" key={tab} onClick={() => onAssetTab(item.payload.device, tab)}>{tab}</button>)}
    </div>}
  </div>;
}

function formatHours(value) {
  return Number(value || 0).toFixed(1);
}

function moveItem(items, fromId, toId) {
  const from = items.findIndex((item) => item.id === fromId);
  const to = items.findIndex((item) => item.id === toId);
  if (from < 0 || to < 0 || from === to) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function Drawer({ title, subtitle, onClose, children, footer, wide = false }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const trigger = document.activeElement;
    panelRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (trigger instanceof HTMLElement) trigger.focus();
    };
  }, []);
  return <div className="home-drawer-backdrop" role="presentation" onMouseDown={onClose}>
    <aside ref={panelRef} tabIndex={-1} className={`home-drawer${wide ? ' is-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
      <header><div><h2 title={title}>{title}</h2>{subtitle && <p title={subtitle}>{subtitle}</p>}</div><button type="button" onClick={onClose} aria-label="关闭"><Icon name="close" /></button></header>
      <div className="home-drawer-body">{children}</div>
      {footer && <footer>{footer}</footer>}
    </aside>
  </div>;
}

function WorkflowDrawer({ context, onClose, onCreate }) {
  const [selected, setSelected] = useState(context?.type || 'repair');
  const [created, setCreated] = useState(false);
  const [repairDescription, setRepairDescription] = useState(context?.issue && context.issue !== '请求维修' ? context.issue : '');
  const [repairPriority, setRepairPriority] = useState('高');
  const [repairError, setRepairError] = useState('');
  const [repairSubmitting, setRepairSubmitting] = useState(false);
  const device = context?.device || DEVICES[0];
  const directRepair = context?.type === 'repair';
  const options = [
    { id: 'task', label: '创建处理任务', note: '指派给设备管理员，跟踪截止时间', icon: 'task' },
    { id: 'assign', label: '分配处理任务', note: '选择执行人员或服务商并设置时限', icon: 'assign' },
    { id: 'inspection', label: '创建检查单', note: '按设备类型带入标准检查项目', icon: 'inspection' },
    { id: 'repair', label: '发起维修召请', note: '携带设备与异常信息请求服务', icon: 'wrench' },
    { id: 'parts', label: '订购相关配件', note: '根据机型和异常推荐原厂件', icon: 'parts' },
    { id: 'maintenance', label: '创建保养计划', note: '加入计划内维护并生成提醒', icon: 'calendar' },
    { id: 'report-alert', label: '上报设备异常', note: '携带最新工况进入异常处理队列', icon: 'alert' },
  ];
  const selectedOption = options.find((item) => item.id === selected) || options[0];

  if (directRepair) {
    const submitRepair = () => {
      const description = repairDescription.trim();
      if (repairSubmitting) return;
      if (!description) { setRepairError('请填写故障或服务问题，便于服务团队准确派单。'); return; }
      setRepairError('');
      setRepairSubmitting(true);
      window.setTimeout(() => {
        setRepairSubmitting(false);
        setCreated(true);
        onCreate?.('repair', device, description);
      }, 420);
    };
    return <Drawer title={created ? '维修请求已提交' : '请求维修'} subtitle={`${device.code} · ${device.name || device.type}`} onClose={onClose}>
      {created ? <div className="workflow-success"><span><Icon name="check" size={28}/></span><h3>维修召请已提交</h3><p>已自动带入设备、问题描述和当前工况，服务团队会在“我的任务”中继续处理。</p><div><b>已提交</b><i/><span>待派发</span><i/><span>处理中</span></div><button type="button" onClick={onClose}>返回主屏幕</button></div> : <div className="repair-request-form">
        <div className="workflow-source"><span><Icon name="wrench"/></span><div><small>维修对象</small><strong>{device.code}</strong><p>{device.name} · 当前状态 {device.status} · 更新时间 {device.updateTime}</p></div></div>
        <label><span>问题描述 <b>必填</b></span><textarea value={repairDescription} onChange={(event) => { setRepairDescription(event.target.value); if (repairError) setRepairError(''); }} placeholder="请描述故障现象、发生位置或需要的服务" maxLength={240}/><small className="repair-field-meta">{repairDescription.length}/240</small></label>
        {repairError && <p className="repair-form-error" role="alert">{repairError}</p>}
        <label><span>优先级</span><select value={repairPriority} onChange={(event) => setRepairPriority(event.target.value)}><option>高</option><option>中</option><option>低</option></select></label>
        <div className="workflow-automation"><b>自动带入业务上下文</b><span>设备编号</span><span>最新工况</span><span>所属项目</span><span>当前责任人</span></div>
        <button type="button" className="workflow-primary" disabled={repairSubmitting} onClick={submitRepair}>{repairSubmitting ? '正在提交…' : '提交维修请求'} {!repairSubmitting && <Icon name="arrow"/>}</button>
      </div>}
    </Drawer>;
  }

  return <Drawer title={created ? '闭环已创建' : '问题处理工作流'} subtitle={`${device.code} · ${context?.issue || '主动服务申请'}`} onClose={onClose} wide>
    {created ? <div className="workflow-success"><span><Icon name="check" size={28}/></span><h3>{selectedOption.label}已创建</h3><p>设备、问题、当前工况和发起人信息已自动关联，可在“我的任务”中继续跟踪。</p><div><b>已发现</b><i/><b>已派发</b><i/><span>处理中</span><i/><span>已闭环</span></div><button type="button" onClick={onClose}>返回主屏幕</button></div> : <>
      <div className="workflow-map"><div className="is-active"><i>1</i><span>发现问题</span></div><b/><div><i>2</i><span>选择动作</span></div><b/><div><i>3</i><span>执行处理</span></div><b/><div><i>4</i><span>结果闭环</span></div></div>
      <div className="workflow-source"><span><Icon name="alert"/></span><div><small>工作流上下文</small><strong>{context?.issue || '用户主动发起服务'}</strong><p>{device.name} · 当前状态 {device.status} · 更新时间 {device.updateTime}</p></div></div>
      <div className="workflow-options">{options.map((option) => <button type="button" className={selected === option.id ? 'is-selected' : ''} key={option.id} onClick={() => setSelected(option.id)}><span><Icon name={option.icon}/></span><div><strong>{option.label}</strong><small>{option.note}</small></div><i>{selected === option.id ? '✓' : ''}</i></button>)}</div>
      <div className="workflow-automation"><b>自动带入业务上下文</b><span>设备编号</span><span>问题描述</span><span>最新工况</span><span>所属项目</span><span>当前责任人</span></div>
      <button type="button" className="workflow-primary" onClick={() => { setCreated(true); onCreate?.(selected, device, context?.issue); }}>确认并进入处理闭环 <Icon name="arrow"/></button>
    </>}
  </Drawer>;
}

function ModuleCard({ title, subtitle, action, className = '', children }) {
  return <section className={`home-module ${className}`}>
    <header><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</header>
    {children}
  </section>;
}

export default function HomeDashboard({ onOpenDevice, onOpenList, onOpenBusiness }) {
  const [modules, setModules] = useState(() => {
    const saved = loadPreference(MODULES_KEY, null);
    if (saved) return mergePreference(DEFAULT_MODULES, saved);
    const previous = mergePreference(DEFAULT_MODULES, loadPreference('sanvist_pc_home_modules_v3', DEFAULT_MODULES));
    return [DEFAULT_MODULES[0], ...previous.filter((item) => item.id !== 'maintenance')];
  });
  const [actionConfig, setActionConfig] = useState(() => {
    const saved = loadPreference(ACTIONS_KEY, null);
    if (saved) return mergePreference(DEFAULT_ACTION_CONFIG, saved);
    const previous = mergePreference(DEFAULT_ACTION_CONFIG, loadPreference('sanvist_pc_quick_actions_v1', DEFAULT_ACTION_CONFIG));
    const added = DEFAULT_ACTION_CONFIG.slice(0, 4);
    return [...added, ...previous.filter((item) => !added.some((entry) => entry.id === item.id))];
  });
  const [links, setLinks] = useState(() => mergeLinkPreference(DEFAULT_LINKS, loadPreference(LINKS_KEY, DEFAULT_LINKS)));
  const [recentItems, setRecentItems] = useState(() => loadPreference(RECENT_KEY, DEFAULT_RECENT_ITEMS).filter(isSearchRecent).slice(0, 10));
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [recentPanelPosition, setRecentPanelPosition] = useState(null);
  const [query, setQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('设备');
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editorTab, setEditorTab] = useState('modules');
  const [recentOpen, setRecentOpen] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const [robotOpen, setRobotOpen] = useState(false);
  const [energyMode, setEnergyMode] = useState('oil');
  const [todoFilter, setTodoFilter] = useState('待处理');
  const [draggingId, setDraggingId] = useState(null);
  const [actionDraggingId, setActionDraggingId] = useState(null);
  const [linkDraggingId, setLinkDraggingId] = useState(null);
  const [draftModules, setDraftModules] = useState(modules);
  const [draftActions, setDraftActions] = useState(actionConfig);
  const [draftLinks, setDraftLinks] = useState(links);
  const [robotInput, setRobotInput] = useState('');
  const [robotMessages, setRobotMessages] = useState([{ role: 'bot', text: '你好，张经理。我可以跨设备、项目和任务定位问题，并把结果直接转成任务、维修召请或配件需求。' }]);
  const [auditNotice, setAuditNotice] = useState('');
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [bindingOpen, setBindingOpen] = useState(false);
  const [bindingCode, setBindingCode] = useState('');
  const [bindingMessage, setBindingMessage] = useState('');
  const [quickNav, setQuickNav] = useState({ left: false, right: true });
  const quickActionsRef = useRef(null);
  const searchInputRef = useRef(null);
  const globalSearchRef = useRef(null);
  const homeDashboardRef = useRef(null);
  const recentMoreRef = useRef(null);
  const recentPopoverRef = useRef(null);
  const robotInputRef = useRef(null);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const visibleActions = actionConfig.filter((item) => item.visible).map((item) => QUICK_ACTIONS.find((action) => action.id === item.id)).filter(Boolean);

  const maintenanceAssets = useMemo(() => createMaintenanceRows().map((row) => ({
    ...row, device: DEVICES.find((device) => device.id === row.id),
  })), []);
  const maintenanceBuckets = useMemo(() => MAINTENANCE_GROUPS.filter((group) => group.id !== 'unknown').map((group) => ({
    ...group, assets: maintenanceAssets.filter((row) => maintenanceStatus(row) === group.id),
  })), [maintenanceAssets]);

  const [todoItems, setTodoItems] = useState(() => normalizeTodoItems(loadPreference(TODO_KEY, buildDefaultTodos())));

  const assignedTodos = useMemo(() => todoItems
    .slice()
    .sort((a, b) => {
      const statusRank = { '待处理': 0, '处理中': 1, '已完成': 2 };
      const dueRank = (item) => item.due.includes('今天') ? 0 : item.due.includes('明天') ? 1 : 2;
      return (statusRank[a.status] ?? 3) - (statusRank[b.status] ?? 3) || dueRank(a) - dueRank(b);
    }), [todoItems]);
  const taskFilters = useMemo(() => [
    { id: '待处理', label: '待处理', count: assignedTodos.filter((item) => item.status === '待处理').length },
    { id: '处理中', label: '处理中', count: assignedTodos.filter((item) => item.status === '处理中').length },
    { id: '已完成', label: '已完成', count: assignedTodos.filter((item) => item.status === '已完成').length, tone: 'complete' },
  ], [assignedTodos]);
  const filteredTodos = todoFilter === '全部'
    ? assignedTodos
    : assignedTodos.filter((item) => item.status === todoFilter);

  const usage = useMemo(() => {
    const work = DEVICES.reduce((sum, device, index) => sum + Number(device.today?.workHours || 0) * (5.1 + index * 0.12), 0);
    const idle = DEVICES.reduce((sum, device, index) => sum + Number(device.today?.idleHours || 0) * (4.6 + index * 0.1), 0);
    const activeIds = DEVICES.filter((device) => device.status !== '离线').map((device) => device.id);
    const idleIds = DEVICES.filter((device) => device.status === '怠速' || Number(device.today?.idleHours || 0) > 1).map((device) => device.id);
    const statusGroups = [...new Map(DEVICES.map((device) => [device.status, DEVICES.filter((item) => item.status === device.status)])).entries()]
      .map(([status, devices]) => ({ status, count: devices.length, ids: devices.map((device) => device.id) }));
    return { work, idle, total: work + idle, activeIds, idleIds, statusGroups, daily: [35, 48, 44, 57, 52, 31, 41] };
  }, []);

  const energy = useMemo(() => {
    const items = DEVICES.map((device) => {
      const weekly = (device.weeklyFuelTrend || []).reduce((sum, item) => sum + Number(item.value || 0), 0);
      return { device, weekly, daily: weekly / 7 };
    });
    const total = items.reduce((sum, item) => sum + item.weekly, 0);
    const groups = [
      { id: 'energy-low', label: '≤22 L/日', filter: (item) => item.daily <= 22 },
      { id: 'energy-mid', label: '22—28 L/日', filter: (item) => item.daily > 22 && item.daily <= 28 },
      { id: 'energy-high', label: '>28 L/日', filter: (item) => item.daily > 28 },
    ].map((group) => ({ ...group, ids: items.filter(group.filter).map((item) => item.device.id) }));
    return { total, daily: total / 7, highIds: groups[2].ids, groups };
  }, []);

  const searchCatalog = useMemo(() => {
    const assets = DEVICES.map((device, index) => ({
      id: `search-asset-${device.id}`,
      type: '设备',
      title: device.code,
      meta: `${device.brand || '--'} · ${device.type} · ${device.status}`,
      keywords: [device.code, device.model, device.name, device.type, device.status, device.project?.name, device.archive?.台账信息?.find((item) => item.label === '设备编号')?.value].filter(Boolean).join(' '),
      icon: 'asset',
      image: device.image,
      payload: { index, device },
    }));
    const projects = PROJECTS.map((project) => ({
      id: `search-${project.id}`,
      type: '项目',
      title: project.name,
      meta: `${project.deviceIds.length} 台设备 · ${project.project?.status || '进行中'}`,
      keywords: `${project.name} ${project.project?.address || ''}`,
      icon: 'project',
      payload: project,
    }));
    const facetCatalog = [
      { type: '品牌', key: (device) => device.brand },
      { type: '设备类型', key: (device) => device.type },
      { type: '运行状态', key: (device) => device.status },
    ].flatMap(({ type, key }) => {
      const groups = new Map();
      DEVICES.forEach((device) => {
        const value = key(device);
        if (!value) return;
        if (!groups.has(value)) groups.set(value, []);
        groups.get(value).push(device);
      });
      return [...groups.entries()].map(([value, devices]) => ({
        id: `search-${type}-${value}`,
        type,
        title: value,
        meta: `${devices.length} 台设备`,
        keywords: `${value} ${devices.map((device) => `${device.code} ${device.name}`).join(' ')}`,
        icon: 'asset',
        payload: { value, deviceIds: devices.map((device) => device.id) },
      }));
    });
    const audits = AUDIT_EVENTS.map((event) => ({
      id: `search-${event.id}`, type: '审核', title: event.type,
      meta: `${event.device} · ${event.group} · ${event.time}`,
      keywords: `审核 ${event.id} ${event.type} ${event.device} ${event.group}`,
      icon: 'inspection', payload: event,
    }));
    return [...assets, ...facetCatalog, ...projects, ...audits];
  }, []);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return searchCatalog
      .filter((item) => item.type === searchCategory)
      .map((item, index) => {
        const title = item.title.toLowerCase();
        const meta = item.meta.toLowerCase();
        const keywords = item.keywords.toLowerCase();
        if (!`${title} ${meta} ${keywords}`.includes(normalized)) return null;
        const score = title.includes(normalized) ? 0 : meta.includes(normalized) ? 1 : 2;
        return { item, index, score };
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score || a.index - b.index)
      .slice(0, 7)
      .map(({ item }) => item);
  }, [query, searchCatalog, searchCategory]);

  const searchCounts = useMemo(() => SEARCH_CATEGORIES.reduce((counts, category) => {
    counts[category] = searchCatalog.filter((item) => {
      if (item.type !== category) return false;
      const normalized = query.trim().toLowerCase();
      return normalized && `${item.title} ${item.meta} ${item.keywords}`.toLowerCase().includes(normalized);
    }).length;
    return counts;
  }, {}), [query, searchCatalog]);

  const saveModules = (next) => { setModules(next); window.localStorage.setItem(MODULES_KEY, JSON.stringify(next)); };
  const saveActions = (next) => { setActionConfig(next); window.localStorage.setItem(ACTIONS_KEY, JSON.stringify(next)); };
  const saveLinks = (next) => { setLinks(next); window.localStorage.setItem(LINKS_KEY, JSON.stringify(next)); };
  const openList = (label, ids) => onOpenList?.({ key: `${label}-${Date.now()}`, label, deviceIds: ids });
  const openAudit = () => {
    if (onOpenBusiness) return onOpenBusiness('audit');
    setAuditNotice('审核模块入口已准备，详情处理将在审核模块完成。');
    window.setTimeout(() => setAuditNotice(''), 2400);
  };
  const openSettings = (tab) => { setDraftModules(modules); setDraftActions(actionConfig); setDraftLinks(links); setEditorTab(tab); setSettingsOpen(true); };
  const openQuickLink = (link) => {
    if (link.action === 'devices') return openList('设备管理', DEVICES.map((item) => item.id));
    if (link.action === 'projects') return openList('项目管理 · 全部项目设备', DEVICES.map((item) => item.id));
    if (link.action === 'dashboard') return openList('数据大屏 · 运行设备', usage.activeIds);
    if (link.action === 'monitoring') return openList('监控中心 · 在线设备', usage.activeIds);
    if (link.action === 'maintenance') return onOpenBusiness?.('maintenance');
    if (link.action === 'repair') setWorkflow({ issue: '维修管理', device: DEVICES[0], type: 'repair' });
  };

  const handleWorkflowCreate = (type, device, issue) => {
    const meta = WORKFLOW_TODO_META[type] || WORKFLOW_TODO_META.task;
    const entry = {
      id: `todo-${type}-${Date.now()}`,
      category: meta.category,
      priority: meta.priority,
      title: issue || meta.title,
      meta: `${device?.code || DEVICES[0].code} · 待分配`,
      due: '今天',
      status: '待处理',
      progress: 0,
      device: device || DEVICES[0],
      type,
    };
    const next = [entry, ...todoItems];
    setTodoItems(next);
    window.localStorage.setItem(TODO_KEY, JSON.stringify(next));
  };

  const buildRobotReply = (text) => {
    const highEnergy = energy.highIds.length;
    if (/能耗|油耗|燃油|加油/.test(text)) return `近 7 天有 ${highEnergy} 台设备日均能耗高于 28 L，已定位到对应设备，可点击下方建议继续查看。`;
    if (/待办|任务|工作/.test(text)) return `你当前有 ${todoItems.length} 条任务，其中 ${todoItems.filter((item) => item.status === '待处理').length} 条待处理、${todoItems.filter((item) => item.status === '处理中').length} 条处理中。`;
    if (/维修|故障|异常/.test(text)) return `已记录“${text}”。可将异常设备转为维修召请，确认后会自动同步到“我的任务”。`;
    if (/SMG200|3009|实时|状态/.test(text)) return `SMG200-3009 当前行驶中，水温 80°C。需要我打开它的实时状态页吗？`;
    return `已收到“${text}”。我可以跨设备、项目和任务定位问题，试试输入“能耗”或“待办”。`;
  };

  const sendRobotMessage = () => {
    const text = robotInput.trim();
    if (!text) return;
    setRobotMessages((prev) => [...prev, { role: 'user', text }, { role: 'bot', text: buildRobotReply(text) }]);
    setRobotInput('');
    robotInputRef.current?.focus();
  };

  const rememberRecent = (item) => {
    if (!isSearchRecent(item)) return;
    const next = [item, ...recentItems.filter((recent) => recent.id !== item.id)].slice(0, 10);
    setRecentItems(next);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const openAsset = (device, remember = false) => {
    if (remember) rememberRecent({ id: `asset-${device.id}`, kind: 'asset', refId: device.id, title: device.code, meta: `设备 · 概览 · ${device.type}`, icon: 'asset' });
    setSearchOpen(false);
    onOpenDevice?.(DEVICES.indexOf(device));
  };

  const openAssetTab = (device, tab) => {
    rememberRecent({ id: `asset-${device.id}-${tab}`, kind: 'asset', refId: device.id, title: device.code, meta: `设备 · ${tab} · ${device.type}`, icon: 'asset' });
    setSearchOpen(false);
    onOpenDevice?.(DEVICES.indexOf(device), tab);
  };

  const runAction = (action, remember = false) => {
    if (['map-monitor', 'warning-center', 'personal'].includes(action.id)) {
      setSearchOpen(false);
      return onOpenBusiness?.(action.id);
    }
    if (action.id === 'bind-device') {
      setSearchOpen(false);
      setBindingCode('');
      setBindingMessage('');
      setBindingOpen(true);
      return;
    }
    if (remember) rememberRecent({ id: `action-${action.id}`, kind: 'action', refId: action.id, title: action.label, meta: `快速行动 · ${action.note}`, icon: action.icon });
    setSearchOpen(false);
    if (action.id === 'workorder') openList('关联工单设备', DEVICES.slice(0, 4).map((item) => item.id));
    else setWorkflow({ issue: action.label, device: DEVICES[0], type: action.id });
  };

  const openFeature = (feature, remember = false) => {
    if (remember) rememberRecent({ id: `feature-${feature.id}`, kind: 'feature', refId: feature.id, title: feature.label, meta: `功能 · ${feature.meta}`, icon: feature.icon });
    setSearchOpen(false);
    if (feature.target === 'list') openList('全部设备', DEVICES.map((item) => item.id));
    else if (feature.target === 'maintenance') openList('计划内维护设备', maintenanceAssets.map((item) => item.device.id));
    else if (feature.target === 'workorder') openList('关联工单设备', DEVICES.slice(0, 4).map((item) => item.id));
    else setWorkflow({ issue: feature.label, device: DEVICES[0], type: feature.target });
  };

  const openProject = (project, remember = false) => {
    if (!project) return;
    if (remember) rememberRecent({ id: project.id, kind: 'project', refId: project.id, title: project.name, meta: `项目 · ${project.deviceIds.length} 台设备`, icon: 'project' });
    setSearchOpen(false);
    openList(project.name, project.deviceIds);
  };

  const openRecentItem = (item) => {
    if (item.kind === 'audit') {
      const event = AUDIT_EVENTS.find((entry) => entry.id === item.refId);
      if (!event) { setAuditNotice('该审核记录已不存在，可进入审核模块查看其他记录。'); return; }
      rememberRecent(item);
      setSelectedAudit(event);
      return;
    }
    if (item.kind === 'facet') {
      const match = searchCatalog.find((entry) => entry.type === item.category && entry.title === item.title);
      if (match) {
        rememberRecent(item);
        return openList(`${match.type} · ${match.title}`, match.payload.deviceIds);
      }
      return;
    }
    if (item.kind === 'asset') return openAsset(DEVICES.find((device) => device.id === item.refId) || DEVICES[0], true);
    if (item.kind === 'project') return openProject(PROJECTS.find((project) => project.id === item.refId), true);
    if (item.kind === 'feature') return openFeature(FEATURES.find((feature) => feature.id === item.refId) || FEATURES[0]);
    if (item.kind === 'action') return runAction(QUICK_ACTIONS.find((action) => action.id === item.refId) || QUICK_ACTIONS[0]);
    if (item.kind === 'maintenance') return openList('逾期维保设备', maintenanceBuckets[0].assets.map((asset) => asset.device.id));
    setWorkflow({ issue: item.title, device: DEVICES[0], type: 'task' });
  };

  const openSearchResult = (item) => {
    if (item.type === '审核') {
      rememberRecent({ id: item.id, kind: 'audit', refId: item.payload.id, title: item.title, meta: `审核 · ${item.meta}`, icon: 'inspection' });
      setSearchOpen(false);
      setSelectedAudit(item.payload);
      return;
    }
    if (item.type === '设备') return openAsset(item.payload.device, true);
    if (item.type === '项目') return openProject(item.payload, true);
    if (['品牌', '设备类型', '运行状态'].includes(item.type)) {
      rememberRecent({ id: item.id, kind: 'facet', category: item.type, title: item.title, meta: `${item.type} · ${item.meta}`, icon: item.icon });
      setSearchOpen(false);
      return openList(`${item.type} · ${item.title}`, item.payload.deviceIds);
    }
  };

  const openAssetMap = (device) => {
    rememberRecent({ id: `asset-${device.id}-map`, kind: 'asset', refId: device.id, title: device.code, meta: '设备 · 地图监控', icon: 'asset' });
    setSearchOpen(false);
    onOpenBusiness?.('map-monitor');
  };

  const openAssetAudit = (device) => {
    rememberRecent({ id: `asset-${device.id}-audit`, kind: 'asset', refId: device.id, title: device.code, meta: '设备 · 审核', icon: 'asset' });
    openAudit();
  };

  const updateQuickNavigation = useCallback(() => {
    const node = quickActionsRef.current;
    if (!node) return;
    setQuickNav({ left: node.scrollLeft > 4, right: node.scrollLeft + node.clientWidth < node.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateQuickNavigation);
    window.addEventListener('resize', updateQuickNavigation);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener('resize', updateQuickNavigation); };
  }, [updateQuickNavigation, visibleActions.length]);

  useEffect(() => {
    const handleSearchShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape' && searchOpen) setSearchOpen(false);
    };
    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const frame = window.requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [searchOpen]);

  useEffect(() => {
    if (!recentOpen) return undefined;
    const closeWhenOutside = (event) => {
      if (!recentMoreRef.current?.contains(event.target) && !recentPopoverRef.current?.contains(event.target)) setRecentOpen(false);
    };
    const closeWithEscape = (event) => {
      if (event.key === 'Escape') setRecentOpen(false);
    };
    document.addEventListener('mousedown', closeWhenOutside);
    document.addEventListener('keydown', closeWithEscape);
    return () => {
      document.removeEventListener('mousedown', closeWhenOutside);
      document.removeEventListener('keydown', closeWithEscape);
    };
  }, [recentOpen]);

  useLayoutEffect(() => {
    if (!recentOpen) {
      setRecentPanelPosition(null);
      return undefined;
    }
    const updateRecentPanelPosition = () => {
      const anchor = recentMoreRef.current?.getBoundingClientRect();
      const dashboard = homeDashboardRef.current?.getBoundingClientRect();
      if (!anchor || !dashboard) return;
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
      setRecentPanelPosition({
        top: Math.round(anchor.bottom - dashboard.top + 8),
        insetInlineEnd: Math.round(Math.max(14, isRtl ? anchor.left - dashboard.left : dashboard.right - anchor.right)),
      });
    };
    updateRecentPanelPosition();
    window.addEventListener('resize', updateRecentPanelPosition);
    window.addEventListener('scroll', updateRecentPanelPosition, { passive: true });
    return () => {
      window.removeEventListener('resize', updateRecentPanelPosition);
      window.removeEventListener('scroll', updateRecentPanelPosition);
    };
  }, [recentOpen]);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const closeWhenOutside = (event) => {
      if (!globalSearchRef.current?.contains(event.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', closeWhenOutside);
    return () => document.removeEventListener('mousedown', closeWhenOutside);
  }, [searchOpen]);

  const scrollQuickActions = (direction) => quickActionsRef.current?.scrollBy({ left: direction * quickActionsRef.current.clientWidth * 0.86, behavior: 'smooth' });
  const moduleDrop = (event, targetId) => { event.preventDefault(); if (!draggingId) return; setDraftModules(moveItem(draftModules, draggingId, targetId)); setDraggingId(null); };
  const actionDrop = (event, targetId) => { event.preventDefault(); if (!actionDraggingId) return; setDraftActions(moveItem(draftActions, actionDraggingId, targetId)); setActionDraggingId(null); };
  const linkDrop = (event, targetId) => { event.preventDefault(); if (!linkDraggingId) return; setDraftLinks(moveItem(draftLinks, linkDraggingId, targetId)); setLinkDraggingId(null); };

  // 一级模块整行列表：每个 module.id 对应一个独立整行容器，渲染顺序由 modules 数组驱动，为后续个性化排序预留。
  const moduleContent = {
    tasks: <ModuleCard title="我的任务" subtitle="分配给我" className="is-span-12 is-task-module" action={<button type="button" className="module-text-action" onClick={() => openFeature(FEATURES[1])}>查看全部任务 <Icon name="arrow" size={14}/></button>}>
      <div className="todo-stage-board">{taskFilters.map((filter) => <button type="button" key={filter.id} className={`${todoFilter === filter.id ? 'is-active' : ''}${filter.tone ? ` is-${filter.tone}` : ''}`} aria-pressed={todoFilter === filter.id} title={`${filter.label}：${filter.count} 条`} onClick={() => setTodoFilter(todoFilter === filter.id ? '全部' : filter.id)}><strong>{filter.count}</strong><span>{filter.label}</span></button>)}</div>
      <div className="todo-list-head"><span>{todoFilter === '全部' ? '全部任务' : taskFilters.find((filter) => filter.id === todoFilter)?.label}</span><small>按截止时间升序</small></div>
      <div className="todo-list">{filteredTodos.slice(0, 4).map((item) => <div className="todo-row" key={item.id}><button type="button" className="todo-main" title={`${item.title} · ${item.status} · ${item.priority} · ${item.category} · ${item.meta} · 截止 ${item.due}`} onClick={() => setWorkflow({ issue: item.title, device: item.device, type: item.type })}><div className="todo-title"><span className={`todo-status is-${item.status}`}>{item.status}</span><span className={`todo-priority priority-${item.priority}`}>{item.priority}</span><small>{item.category}</small><strong>{item.title}</strong></div><div className="todo-meta"><span>{item.meta}</span><time className={`todo-due${item.due.includes('今天') ? ' is-today' : ''}`}>截止 {item.due}</time></div></button><button type="button" className="todo-handle" onClick={() => setWorkflow({ issue: item.title, device: item.device, type: item.type })}>{item.status === '待处理' ? '开始处理' : item.status === '处理中' ? '更新进度' : '查看详情'}</button></div>)}{filteredTodos.length === 0 && <div className="todo-empty"><span><Icon name="task" size={20}/></span><div><strong>没有符合条件的任务</strong><small>可切换上方状态，查看其他分配给我的任务。</small></div><button type="button" onClick={() => setTodoFilter('全部')}>查看全部</button></div>}</div>
    </ModuleCard>,
    audit: <ModuleCard title="审核概览" subtitle="待处理事件与未读提醒" className="is-span-12" action={<button type="button" className="module-text-action" onClick={openAudit}>进入审核 <Icon name="arrow" size={14}/></button>}>
      <div className="audit-summary-head"><button type="button" className="audit-total" onClick={openAudit}><strong>{AUDIT_GROUPS.reduce((sum, item) => sum + item.count, 0)}</strong><span>待处理事件</span></button><button type="button" className="audit-unread" onClick={openAudit}><b>{AUDIT_GROUPS.reduce((sum, item) => sum + item.unread, 0)}</b><span>未读新事件</span></button></div>
      <div className="audit-groups">{AUDIT_GROUPS.map((group) => <button type="button" key={group.id} className={`audit-group ${group.tone}`} title={`${group.label}：${group.count} 条待处理，${group.unread} 条未读`} onClick={openAudit}><span>{group.label}</span><strong>{group.count}</strong>{group.unread > 0 && <i>新{group.unread}</i>}</button>)}</div>
      <div className="audit-events"><div className="audit-events-title"><span>最近事件</span><small>按发生时间倒序</small></div>{AUDIT_EVENTS.map((event) => <button type="button" key={event.id} className="audit-event" title={`${event.type} · ${event.device} · ${event.time}`} onClick={openAudit}><i className={event.tone}/><span><strong>{event.type}{event.unread && <em>新</em>}</strong><small>{event.device} · {event.group}</small></span><time>{event.time}</time></button>)}</div>
    </ModuleCard>,
    maintenance: <ModuleCard title="计划保养" subtitle="按保养工时掌握设备状态，点击卡片查看对应保养清单" className="is-span-12 home-maintenance" action={<button type="button" className="module-text-action" onClick={() => onOpenBusiness?.('maintenance')}>查看全部 <Icon name="arrow" size={14}/></button>}>
      <div className="maintenance-compact-stats">{maintenanceBuckets.map((bucket) => <button type="button" key={bucket.id} className={bucket.tone} onClick={() => onOpenBusiness?.('maintenance', { status: bucket.id })}><span className="maintenance-bucket-title"><i aria-hidden="true"/>{bucket.label}</span><strong>{bucket.assets.length}<em>台设备</em></strong></button>)}</div>
    </ModuleCard>,
    operations: <ModuleCard title="设备运行概览" className="is-span-12" action={<button type="button" className="scope-chip" onClick={() => openList('我的管辖设备', DEVICES.map((item) => item.id))}>统计范围：我管辖的 {DEVICES.length} 台设备</button>}>
      <div className="operations-layout"><section className="operation-usage"><div className="operation-section-title"><div><Icon name="trend"/><span>运行概览</span></div><small>运行状态来源：设备管理</small></div><div className="operation-status-summary" aria-label="设备运行状态统计">{usage.statusGroups.map((group) => <button type="button" key={group.status} onClick={() => openList(`运行状态 · ${group.status}`, group.ids)}><span><i/>{group.status}</span><strong>{group.count}<em>台设备</em></strong></button>)}</div><div className="operation-kpis"><button type="button" onClick={() => openList('过去 7 天有运行数据的设备', DEVICES.map((item) => item.id))}><span>工时</span><strong>{formatHours(usage.total)}<em>h</em></strong></button><button type="button" onClick={() => openList('高怠速关注设备', usage.idleIds)}><span>怠速工时</span><strong>{formatHours(usage.idle)}<em>h</em></strong></button><button type="button" title="作业效率 = 有效作业时间 ÷ 总运行时间，点击查看高怠速设备" onClick={() => openList('高怠速关注设备', usage.idleIds)}><span>作业效率</span><strong>{Math.round((usage.work / usage.total) * 100)}<em>%</em></strong></button></div><div className="operation-chart">{usage.daily.map((value, index) => <div key={index}><i style={{ height: `${value}%` }}/><span>周{['一', '二', '三', '四', '五', '六', '日'][index]}</span></div>)}</div></section><aside className="operation-fuel"><div className="operation-section-title"><div><Icon name="fuel"/><span>能耗概览</span></div><small>过去 7 天</small></div><div className="energy-tabs" role="tablist" aria-label="能耗类型"><button type="button" role="tab" aria-selected={energyMode === 'oil'} className={energyMode === 'oil' ? 'is-active' : ''} onClick={() => setEnergyMode('oil')}>油耗</button><button type="button" role="tab" aria-selected={energyMode === 'electricity'} className={energyMode === 'electricity' ? 'is-active' : ''} onClick={() => setEnergyMode('electricity')}>电耗</button></div>{energyMode === 'oil' ? <><button type="button" className="fuel-callout" onClick={() => openList('高油耗关注设备', energy.highIds)}><strong>{formatHours(energy.total)}<em>L</em></strong><div><span>累计油耗</span><small>日均 {formatHours(energy.daily)} L · 点击查看高油耗设备</small></div></button><div className="fuel-distribution">{energy.groups.map((group) => <button type="button" key={group.id} onClick={() => openList(`日均油耗 ${group.label} 的设备`, group.ids)}><span>{group.label}</span><div><i style={{ width: `${Math.max(4, (group.ids.length / DEVICES.length) * 100)}%` }}/></div><strong>{group.ids.length} 台</strong></button>)}</div></> : <div className="energy-empty"><span><Icon name="fuel"/></span><strong>暂无电耗数据</strong><small>当前管辖设备尚未接入电耗采集，接入后将在此展示累计电耗、日均电耗和设备分布。</small></div>}</aside></div>
    </ModuleCard>,
    links: <ModuleCard title="快速链接" className="is-span-12 is-links">
      <div className="quick-links">{links.filter((link) => link.visible).map((link) => <button type="button" key={link.id} title={`${link.label} · ${link.meta}`} onClick={() => openQuickLink(link)}><span className={link.tone}><Icon name="link"/></span><div><strong>{link.label}</strong><small>{link.meta}</small></div><Icon name="arrow" size={14}/></button>)}</div>
    </ModuleCard>,
    projects: <ModuleCard title="重点项目" subtitle="在场设备与项目运行状态" className="is-span-12" action={<span className="module-count">{PROJECTS.length} 个进行中</span>}>
      <div className="project-list">{PROJECTS.slice(0, 3).map((project) => <button type="button" key={project.id} title={`${project.name} · ${project.project?.address || '项目地址待补充'}`} onClick={() => openProject(project, false)}><span><Icon name="project"/></span><div><strong>{project.name}</strong><small>{project.project?.address || '项目地址待补充'}</small></div><b>{project.deviceIds.length} 台设备</b><Icon name="arrow" size={14}/></button>)}</div>
    </ModuleCard>,
  };

  return <div ref={homeDashboardRef} className="home-dashboard">
    {bindingOpen && <Drawer title="绑定设备" subtitle="输入设备编号，查询设备及绑定状态" onClose={() => setBindingOpen(false)}>
      <form className="home-bind-form" onSubmit={(event) => {
        event.preventDefault();
        const code = bindingCode.trim();
        if (!code) { setBindingMessage('请输入设备编号。'); return; }
        const device = DEVICES.find((item) => item.code.toLowerCase() === code.toLowerCase());
        setBindingMessage(device ? '该设备已绑定当前租户，无需重复绑定。' : '未找到该设备，请核对设备编号后重新查询。');
      }}>
        <label htmlFor="home-bind-code">设备编号</label>
        <input id="home-bind-code" value={bindingCode} maxLength={100} placeholder="请输入设备编号" onChange={(event) => { setBindingCode(event.target.value); setBindingMessage(''); }} aria-describedby="home-bind-message"/>
        <p id="home-bind-message" role="status">{bindingMessage}</p>
        <button type="submit" className="workflow-primary">查询设备</button>
        <p>当前原型提供已绑定设备样例，新增绑定流程待补充。</p>
      </form>
    </Drawer>}
    {selectedAudit && <Drawer title="审核记录" subtitle={selectedAudit.type} onClose={() => setSelectedAudit(null)} footer={<button type="button" className="primary" onClick={() => { setSelectedAudit(null); openAudit(); }}>进入审核模块</button>}>
      <dl className="search-audit-detail"><dt>事件内容</dt><dd>{selectedAudit.type}</dd><dt>审核分类</dt><dd>{selectedAudit.group}</dd><dt>关联设备</dt><dd>{selectedAudit.device}</dd><dt>发生时间</dt><dd>{selectedAudit.time}</dd><dt>阅读状态</dt><dd>{selectedAudit.unread ? '未读' : '已读'}</dd></dl>
    </Drawer>}
    {auditNotice && <div className="home-inline-notice" role="status">{auditNotice}</div>}
    <section className={`home-hero${searchOpen && query ? ' is-search-open' : ''}`}>
      <div className="hero-grid"/>
      <div className="hero-copy"><h1>{getTimeGreeting(currentTime)}，{CURRENT_USER.name}</h1><p>统一掌握设备与运营全局，快速推动关键事项落地。</p></div>
      <div className="global-search-wrap" ref={globalSearchRef}>
        <div className="global-search"><Icon name="search" size={22}/><input ref={searchInputRef} value={query} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} aria-expanded={searchOpen} aria-controls="global-search-panel" aria-label="全局搜索" placeholder="搜索设备、项目、审核等信息"/><kbd>⌘ K</kbd></div>
        {searchOpen && query && <section id="global-search-panel" className="search-inline-panel" aria-label="全局搜索结果">
          <section className="search-inline-section">
            <div className="search-category-tabs" role="tablist" aria-label="搜索分类">{SEARCH_CATEGORIES.map((category) => <button key={category} type="button" role="tab" aria-selected={searchCategory === category} className={searchCategory === category ? 'is-active' : ''} onClick={() => setSearchCategory(category)}>{category}<span>{searchCounts[category] || 0}</span></button>)}</div>
            {searchResults.length ? <div className="search-result-groups">{SEARCH_CATEGORIES.filter((category) => searchCategory === category).map((category) => { const items = searchResults.filter((item) => item.type === category); if (!items.length) return null; return <section className="search-result-group" key={category}><header><strong>{category}</strong></header><div className="search-result-list">{items.slice(0, 4).map((item) => <SearchItem key={item.id} item={item} query={query} onSelect={openSearchResult} onAssetTab={openAssetTab}/>)}</div></section>; })}</div> : <div className="search-empty"><span><Icon name="search" size={22}/></span><strong>没有找到匹配内容</strong><small>可尝试设备编号、品牌、设备类型、运行状态或项目名称。</small></div>}
          </section>
        </section>}
      </div>
      <div className="hero-recent">
        <div className="recent-strip"><span className="recent-label">最近访问</span><div className="recent-items">{recentItems.length ? recentItems.slice(0, 4).map((item) => <button type="button" className="recent-chip" key={item.id} title={`${recentDisplayTitle(item)} · ${item.meta}`} onClick={() => openRecentItem(item)}><i><Icon name={item.icon || 'link'} size={15}/></i><span><strong>{recentDisplayTitle(item)}</strong><small>{item.meta}</small></span></button>) : <span className="recent-empty">暂无数据</span>}</div>{recentItems.length > 4 && <div className="recent-more-wrap"><button ref={recentMoreRef} type="button" className="recent-more" aria-expanded={recentOpen} aria-haspopup="dialog" onClick={() => setRecentOpen((open) => !open)}><Icon name="more" size={17}/><span>更多</span><b>{Math.min(recentItems.length - 4, 6)}</b></button></div>}</div>
      </div>
    </section>

    {recentOpen && <div ref={recentPopoverRef} className="recent-popover" style={recentPanelPosition ? { top: `${recentPanelPosition.top}px`, insetInlineEnd: `${recentPanelPosition.insetInlineEnd}px` } : undefined} role="dialog" aria-label="更多最近访问"><header><div><strong>更多最近访问</strong><small>最多展示第 5–10 条搜索访问记录</small></div><button type="button" onClick={() => setRecentOpen(false)} aria-label="关闭最近访问"><Icon name="close" size={15}/></button></header><div className="recent-popover-list">{recentItems.slice(4, 10).map((item) => <button type="button" key={item.id} title={`${recentDisplayTitle(item)} · ${item.meta}`} onClick={() => { setRecentOpen(false); openRecentItem(item); }}><i><Icon name={item.icon || 'link'} size={16}/></i><span><strong>{recentDisplayTitle(item)}</strong><small>{item.meta}</small></span><Icon name="arrow" size={14}/></button>)}</div></div>}

    <div className="home-content">
      <section className="quick-actions-section">
        <div className="section-heading"><div><span>快速行动</span></div><button type="button" className="section-setting" onClick={() => openSettings('actions')}><Icon name="gear" size={15}/>设置</button></div>
        <div className="quick-actions-shell">
          {quickNav.left && <button type="button" className="quick-scroll-button is-left" onClick={() => scrollQuickActions(-1)} aria-label="向左查看更多快速行动"><Icon name="arrow" size={17}/></button>}
          <div className="quick-actions" ref={quickActionsRef} onScroll={updateQuickNavigation}>{visibleActions.map((action, index) => <button type="button" key={action.id} title={action.label} style={{ '--delay': `${index * 45}ms` }} onClick={() => runAction(action)}><span><Icon name={action.icon} size={21}/></span><div><strong>{action.label}</strong></div></button>)}</div>
          {quickNav.right && <button type="button" className="quick-scroll-button is-right" onClick={() => scrollQuickActions(1)} aria-label="向右查看更多快速行动"><Icon name="arrow" size={17}/></button>}
        </div>
      </section>

      <div className="home-modules">{modules.filter((module) => module.visible).map((module) => <React.Fragment key={module.id}>{moduleContent[module.id]}</React.Fragment>)}</div>
    </div>

    <button type="button" className="robot-fab" onClick={() => setRobotOpen(true)} aria-label="打开 SanVIST 助手"><Icon name="robot" size={24}/><span>SanVIST 助手</span></button>

    {workflow && <WorkflowDrawer context={workflow} onClose={() => setWorkflow(null)} onCreate={handleWorkflowCreate}/>}
    {settingsOpen && <Drawer title="配置主屏幕" onClose={() => setSettingsOpen(false)} wide footer={<><button type="button" onClick={() => { if (editorTab === 'modules') setDraftModules(DEFAULT_MODULES); else if (editorTab === 'actions') setDraftActions(DEFAULT_ACTION_CONFIG); else setDraftLinks(DEFAULT_LINKS); }}>恢复当前页默认</button><button type="button" className="primary" onClick={() => { saveModules(draftModules); saveActions(draftActions); saveLinks(draftLinks); setSettingsOpen(false); }}>保存并应用</button></>}>
      <div className="home-editor">
        <div className="editor-tabs"><button type="button" className={editorTab === 'modules' ? 'is-active' : ''} onClick={() => setEditorTab('modules')}>页面模块 <span>{draftModules.filter((item) => item.visible).length}/{draftModules.length}</span></button><button type="button" className={editorTab === 'actions' ? 'is-active' : ''} onClick={() => setEditorTab('actions')}>快速行动 <span>{draftActions.filter((item) => item.visible).length}/{draftActions.length}</span></button><button type="button" className={editorTab === 'links' ? 'is-active' : ''} onClick={() => setEditorTab('links')}>快速链接 <span>{draftLinks.filter((item) => item.visible).length}/{draftLinks.length}</span></button></div>
        {editorTab === 'modules' ? <><div className="editor-caption"><strong>拖动调整整个页面的模块顺序</strong><span>隐藏的模块仍保留在功能库，可随时重新添加</span></div><div className="editor-list">{draftModules.map((module, index) => <div key={module.id} className={module.visible ? '' : 'is-hidden'} draggable onDragStart={() => setDraggingId(module.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => moduleDrop(event, module.id)}><span className="drag-handle">⠿</span><b>{String(index + 1).padStart(2, '0')}</b><div><strong>{module.label}</strong><small>{module.description}</small></div><button type="button" className={module.visible ? 'editor-toggle is-added' : 'editor-toggle'} onClick={() => setDraftModules(draftModules.map((item) => item.id === module.id ? { ...item, visible: !item.visible } : item))}>{module.visible ? '已添加' : '+ 添加'}</button></div>)}</div></> : editorTab === 'actions' ? <><div className="editor-caption"><strong>拖动调整快速行动的左右顺序</strong><span>首页只显示已启用入口，左右按钮会按位置自动出现</span></div><div className="editor-list">{draftActions.map((config, index) => { const action = QUICK_ACTIONS.find((item) => item.id === config.id); return <div key={config.id} className={config.visible ? '' : 'is-hidden'} draggable onDragStart={() => setActionDraggingId(config.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => actionDrop(event, config.id)}><span className="drag-handle">⠿</span><b>{String(index + 1).padStart(2, '0')}</b><i className="editor-action-icon"><Icon name={action?.icon}/></i><div><strong>{action?.label}</strong><small>{action?.note}</small></div><button type="button" className={config.visible ? 'editor-toggle is-added' : 'editor-toggle'} onClick={() => setDraftActions(draftActions.map((item) => item.id === config.id ? { ...item, visible: !item.visible } : item))}>{config.visible ? '已启用' : '+ 启用'}</button></div>; })}</div></> : <><div className="editor-caption"><strong>拖动调整快速链接顺序</strong><span>首页只显示已启用入口，名称与跳转保持统一</span></div><div className="editor-list">{draftLinks.map((link, index) => <div key={link.id} className={link.visible ? '' : 'is-hidden'} draggable onDragStart={() => setLinkDraggingId(link.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => linkDrop(event, link.id)}><span className="drag-handle">⠿</span><b>{String(index + 1).padStart(2, '0')}</b><div><strong>{link.label}</strong><small>{link.meta}</small></div><button type="button" className={link.visible ? 'editor-toggle is-added' : 'editor-toggle'} onClick={() => setDraftLinks(draftLinks.map((item) => item.id === link.id ? { ...item, visible: !item.visible } : item))}>{link.visible ? '已添加' : '+ 添加'}</button></div>)}</div></>}
      </div>
    </Drawer>}
    {robotOpen && <Drawer title="SanVIST 助手" subtitle="查询设备、解释异常并发起业务操作" onClose={() => setRobotOpen(false)}>
      <div className="robot-panel">
        <div className="robot-messages">{robotMessages.map((message, index) => <div key={index} className={`robot-message${message.role === 'user' ? ' is-user' : ''}`}><span>{message.role === 'bot' ? <Icon name="robot"/> : <Icon name="assign"/>}</span><p>{message.text}</p></div>)}</div>
        <div className="robot-suggestions"><span>试试这样问</span>{['查找日均能耗最高的设备', '哪些待办还没有处理？', '打开 SMG200-3009 的实时状态'].map((text, index) => <button type="button" key={text} onClick={() => { setRobotOpen(false); if (index === 2) openAsset(DEVICES[0]); else if (index === 0) openList(text, energy.highIds); else openFeature(FEATURES[1]); }}>{text}<Icon name="arrow" size={14}/></button>)}</div>
        <div className="robot-input"><input ref={robotInputRef} value={robotInput} onChange={(event) => setRobotInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') sendRobotMessage(); }} placeholder="输入设备编号、项目或问题…"/><button type="button" onClick={sendRobotMessage} aria-label="发送"><Icon name="arrow"/></button></div>
      </div>
    </Drawer>}
  </div>;
}

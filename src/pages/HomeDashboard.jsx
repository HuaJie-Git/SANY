import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { DEVICES } from '../data/devices';
import './home-dashboard.css';

const MODULES_KEY = 'sanvist_pc_home_modules_v2';
const ACTIONS_KEY = 'sanvist_pc_quick_actions_v1';
const LINKS_KEY = 'sanvist_pc_quick_links_v1';
const RECENT_KEY = 'sanvist_pc_recent_items_v2';
const TODO_KEY = 'sanvist_pc_todos_v1';

const DEFAULT_MODULES = [
  { id: 'tasks', label: '我的任务', description: '按任务状态跟踪个人工作队列', visible: true },
  { id: 'audit', label: '审核概览', description: '待处理事件与未读审核提醒', visible: true },
  { id: 'maintenance', label: '计划内维护', description: '到期概览与资产维保明细', visible: true },
  { id: 'operations', label: '资产运行概览', description: '管辖资产运行与能耗概览', visible: true },
  { id: 'links', label: '快速链接', description: '常用业务系统入口', visible: true },
  { id: 'projects', label: '重点项目', description: '项目进度与在场资产', visible: false },
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
  { id: 'repair', label: '请求维修', note: '异常直接转维修召请', icon: 'wrench' },
  { id: 'parts', label: '订购配件', note: '按资产匹配原厂件', icon: 'parts' },
  { id: 'maintenance', label: '申请保养', note: '创建计划内保养', icon: 'calendar' },
  { id: 'inspection', label: '检查', note: '按标准检查表快速巡检', icon: 'inspection' },
  { id: 'task', label: '创建任务', note: '设置执行人和截止时间', icon: 'task' },
  { id: 'assign', label: '分配任务', note: '分配给人员或服务商', icon: 'assign' },
  { id: 'workorder', label: '查看工单', note: '跟踪处理闭环', icon: 'order' },
  { id: 'report-alert', label: '上报异常', note: '携带资产工况发起处理', icon: 'alert' },
];

const DEFAULT_ACTION_CONFIG = QUICK_ACTIONS.map((action) => ({ id: action.id, visible: true }));

const PROJECTS = Array.from(new Map(DEVICES.map((device) => [device.project?.name, device.project]).filter(([name]) => name))).map(([name, project], index) => ({
  id: `project-${index + 1}`,
  name,
  project,
  deviceIds: DEVICES.filter((device) => device.project?.name === name).map((device) => device.id),
}));

const FEATURES = [
  { id: 'asset-center', label: '资产管理', meta: '查看全部资产与运行状态', icon: 'asset', target: 'list' },
  { id: 'task-center', label: '任务中心', meta: '查看待处理、处理中和已完成任务', icon: 'task', target: 'task' },
  { id: 'maintenance-center', label: '计划内维护', meta: '查看维保计划与到期资产', icon: 'calendar', target: 'maintenance' },
  { id: 'inspection-center', label: '检查管理', meta: '创建检查单并跟踪结果', icon: 'inspection', target: 'inspection' },
  { id: 'repair-center', label: '维修管理', meta: '发起召请并查看维修进度', icon: 'wrench', target: 'repair' },
  { id: 'workorder-center', label: '工单中心', meta: '查询全部业务工单', icon: 'order', target: 'workorder' },
];

const AUDIT_GROUPS = [
  { id: 'device', label: '设备异常', count: 6, unread: 2, tone: 'danger' },
  { id: 'maintenance', label: '维保事项', count: 3, unread: 1, tone: 'warning' },
  { id: 'fuel', label: '燃油异常', count: 2, unread: 0, tone: 'orange' },
  { id: 'location', label: '位置预警', count: 1, unread: 1, tone: 'blue' },
  { id: 'inspection', label: '检查异常', count: 2, unread: 0, tone: 'purple' },
];

const AUDIT_EVENTS = [
  { id: 'audit-1', type: '冷却水温高', group: '设备异常', device: 'SMG200-3009', time: '今天 10:26', unread: true, tone: 'danger' },
  { id: 'audit-2', type: '设备保养通知', group: '维保事项', device: 'SSR260-6012', time: '今天 09:40', unread: true, tone: 'warning' },
  { id: 'audit-3', type: '电子围栏预警', group: '位置预警', device: 'SMP130-8015', time: '昨天 18:12', unread: false, tone: 'blue' },
];

const DEFAULT_RECENT_ITEMS = [
  { id: 'asset-1', kind: 'asset', refId: 1, title: 'SMG200-3009', meta: '平地机 · 资产', icon: 'asset' },
  { id: 'project-1', kind: 'project', refId: PROJECTS[0]?.id, title: PROJECTS[0]?.name || '宁乡道路建设项目', meta: '项目 · 7 台资产', icon: 'project' },
  { id: 'task-temperature', kind: 'task', refId: 1, title: '发动机水温过高', meta: '任务 · 待处理', icon: 'task' },
  { id: 'maintenance-overdue', kind: 'maintenance', title: '逾期维保资产', meta: '计划内维护 · 1 台', icon: 'calendar' },
  { id: 'feature-inspection', kind: 'feature', refId: 'inspection-center', title: '检查管理', meta: '功能 · 标准巡检', icon: 'inspection' },
  { id: 'feature-workorder', kind: 'feature', refId: 'workorder-center', title: '工单中心', meta: '功能 · 处理进度', icon: 'order' },
];


function loadPreference(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
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
  task: { category: '任务', priority: '中', title: '新建处理任务' },
  assign: { category: '任务', priority: '中', title: '任务分配' },
  inspection: { category: '检查', priority: '中', title: '新建检查单' },
  repair: { category: '维修', priority: '高', title: '维修召请' },
  parts: { category: '配件', priority: '中', title: '配件需求' },
  maintenance: { category: '维保', priority: '中', title: '保养计划' },
  'report-alert': { category: '异常', priority: '高', title: '异常上报' },
};

function buildDefaultTodos() {
  const alarmTasks = DEVICES.flatMap((device, deviceIndex) => (device.alarmRecords || [])
    .filter((alarm) => alarm.status !== '已处理')
    .map((alarm) => ({ ...alarm, device, deviceIndex })));
  return [
    { id: 'todo-alarm', category: '异常', priority: '紧急', title: alarmTasks[0]?.name || '发动机水温过高', meta: `${DEVICES[0].code} · 待分配`, due: '今天 16:00', status: '待处理', progress: 0, device: DEVICES[0], type: 'task' },
    { id: 'todo-maintenance', category: '维保', priority: '高', title: '逾期保养计划确认', meta: `${DEVICES[0].code} · 王磊`, due: '今天 18:00', status: '处理中', progress: 1, device: DEVICES[0], type: 'maintenance' },
    { id: 'todo-inspection', category: '检查', priority: '中', title: '施工前安全检查', meta: `${DEVICES[2].code} · 李强`, due: '明天 09:00', status: '已完成', progress: 2, device: DEVICES[2], type: 'inspection' },
    { id: 'todo-repair', category: '维修', priority: '高', title: '曲轴传感器故障维修', meta: `${DEVICES[2].code} · 三一服务`, due: '明天 12:00', status: '处理中', progress: 1, device: DEVICES[2], type: 'repair' },
    { id: 'todo-parts', category: '配件', priority: '中', title: '液压油滤芯到货确认', meta: `${DEVICES[1].code} · 仓储中心`, due: '8 月 15 日', status: '待处理', progress: 0, device: DEVICES[1], type: 'parts' },
  ];
}

function normalizeTodoItems(items) {
  return (Array.isArray(items) ? items : buildDefaultTodos()).map((item) => ({
    ...item,
    status: item.status === '待受理' || item.status === '待确认' ? '待处理' : item.status,
  }));
}

function Icon({ name, size = 18 }) {
  const paths = {
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

function SearchItem({ item, onSelect }) {
  return <button type="button" className="search-result-item" title={`${item.title} · ${item.meta}`} onClick={() => onSelect(item)}>
    {item.image ? <img src={item.image} alt=""/> : <span className={`search-result-icon type-${item.type}`}><Icon name={item.icon}/></span>}
    <div><strong>{item.title}</strong><small>{item.meta}</small></div>
    <b>{item.type}</b>
    <Icon name="arrow" size={14}/>
  </button>;
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
  const device = context?.device || DEVICES[0];
  const options = [
    { id: 'task', label: '创建处理任务', note: '指派给资产管理员，跟踪截止时间', icon: 'task' },
    { id: 'assign', label: '分配处理任务', note: '选择执行人员或服务商并设置时限', icon: 'assign' },
    { id: 'inspection', label: '创建检查单', note: '按资产类型带入标准检查项目', icon: 'inspection' },
    { id: 'repair', label: '发起维修召请', note: '携带资产与异常信息请求服务', icon: 'wrench' },
    { id: 'parts', label: '订购相关配件', note: '根据机型和异常推荐原厂件', icon: 'parts' },
    { id: 'maintenance', label: '创建保养计划', note: '加入计划内维护并生成提醒', icon: 'calendar' },
    { id: 'report-alert', label: '上报资产异常', note: '携带最新工况进入异常处理队列', icon: 'alert' },
  ];
  const selectedOption = options.find((item) => item.id === selected) || options[0];

  return <Drawer title={created ? '闭环已创建' : '问题处理工作流'} subtitle={`${device.code} · ${context?.issue || '主动服务申请'}`} onClose={onClose} wide>
    {created ? <div className="workflow-success"><span><Icon name="check" size={28}/></span><h3>{selectedOption.label}已创建</h3><p>资产、问题、当前工况和发起人信息已自动关联，可在“我的任务”中继续跟踪。</p><div><b>已发现</b><i/><b>已派发</b><i/><span>处理中</span><i/><span>已闭环</span></div><button type="button" onClick={onClose}>返回主屏幕</button></div> : <>
      <div className="workflow-map"><div className="is-active"><i>1</i><span>发现问题</span></div><b/><div><i>2</i><span>选择动作</span></div><b/><div><i>3</i><span>执行处理</span></div><b/><div><i>4</i><span>结果闭环</span></div></div>
      <div className="workflow-source"><span><Icon name="alert"/></span><div><small>工作流上下文</small><strong>{context?.issue || '用户主动发起服务'}</strong><p>{device.name} · 当前状态 {device.status} · 更新时间 {device.updateTime}</p></div></div>
      <div className="workflow-options">{options.map((option) => <button type="button" className={selected === option.id ? 'is-selected' : ''} key={option.id} onClick={() => setSelected(option.id)}><span><Icon name={option.icon}/></span><div><strong>{option.label}</strong><small>{option.note}</small></div><i>{selected === option.id ? '✓' : ''}</i></button>)}</div>
      <div className="workflow-automation"><b>自动带入业务上下文</b><span>资产编号</span><span>问题描述</span><span>最新工况</span><span>所属项目</span><span>当前责任人</span></div>
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

export default function HomeDashboard({ onOpenDevice, onOpenList }) {
  const [modules, setModules] = useState(() => mergePreference(DEFAULT_MODULES, loadPreference(MODULES_KEY, DEFAULT_MODULES)));
  const [actionConfig, setActionConfig] = useState(() => mergePreference(DEFAULT_ACTION_CONFIG, loadPreference(ACTIONS_KEY, DEFAULT_ACTION_CONFIG)));
  const [links, setLinks] = useState(() => mergeLinkPreference(DEFAULT_LINKS, loadPreference(LINKS_KEY, DEFAULT_LINKS)));
  const [recentItems, setRecentItems] = useState(() => loadPreference(RECENT_KEY, DEFAULT_RECENT_ITEMS));
  const [recentPanelPosition, setRecentPanelPosition] = useState(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editorTab, setEditorTab] = useState('modules');
  const [linkSettingsOpen, setLinkSettingsOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const [robotOpen, setRobotOpen] = useState(false);
  const [maintenanceView, setMaintenanceView] = useState('summary');
  const [energyMode, setEnergyMode] = useState('oil');
  const [todoFilter, setTodoFilter] = useState('全部');
  const [draggingId, setDraggingId] = useState(null);
  const [actionDraggingId, setActionDraggingId] = useState(null);
  const [linkDraggingId, setLinkDraggingId] = useState(null);
  const [draftModules, setDraftModules] = useState(modules);
  const [draftActions, setDraftActions] = useState(actionConfig);
  const [draftLinks, setDraftLinks] = useState(links);
  const [robotInput, setRobotInput] = useState('');
  const [robotMessages, setRobotMessages] = useState([{ role: 'bot', text: '你好，张经理。我可以跨资产、项目和任务定位问题，并把结果直接转成任务、维修召请或配件需求。' }]);
  const [auditNotice, setAuditNotice] = useState('');
  const [quickNav, setQuickNav] = useState({ left: false, right: true });
  const quickActionsRef = useRef(null);
  const searchInputRef = useRef(null);
  const globalSearchRef = useRef(null);
  const homeDashboardRef = useRef(null);
  const recentMoreRef = useRef(null);
  const recentPopoverRef = useRef(null);
  const robotInputRef = useRef(null);

  const visibleActions = actionConfig.filter((item) => item.visible).map((item) => QUICK_ACTIONS.find((action) => action.id === item.id)).filter(Boolean);

  const maintenanceAssets = useMemo(() => {
    const offsets = [-3, 2, 9, 18, 36, 52, 6];
    return DEVICES.map((device, index) => {
      const offset = offsets[index] ?? 30;
      const status = offset < 0 ? '逾期' : offset <= 7 ? '本周到期' : offset <= 14 ? '下周到期' : '计划中';
      const statusText = offset < 0 ? `逾期 ${Math.abs(offset)} 天` : `剩余 ${offset} 天`;
      return { device, offset, status, statusText, lastDate: device.maintenanceRecords?.[0]?.date || '--' };
    });
  }, []);

  const maintenanceBuckets = useMemo(() => [
    { id: 'overdue', label: '已逾期', note: '需要立即处理', tone: 'danger', assets: maintenanceAssets.filter((item) => item.offset < 0) },
    { id: 'week', label: '本周到期', note: '未来 7 天', tone: 'warning', assets: maintenanceAssets.filter((item) => item.offset >= 0 && item.offset <= 7) },
    { id: 'next', label: '下周到期', note: '第 8—14 天', tone: 'blue', assets: maintenanceAssets.filter((item) => item.offset > 7 && item.offset <= 14) },
    { id: 'month', label: '未来 30 天', note: '第 15—30 天', tone: 'neutral', assets: maintenanceAssets.filter((item) => item.offset > 14 && item.offset <= 30) },
    { id: 'twoMonths', label: '未来 60 天', note: '第 31—60 天', tone: 'neutral', assets: maintenanceAssets.filter((item) => item.offset > 30 && item.offset <= 60) },
  ], [maintenanceAssets]);

  const [todoItems, setTodoItems] = useState(() => normalizeTodoItems(loadPreference(TODO_KEY, buildDefaultTodos())));

  const filteredTodos = todoFilter === '全部' ? todoItems : todoItems.filter((item) => item.status === todoFilter);

  const usage = useMemo(() => {
    const work = DEVICES.reduce((sum, device, index) => sum + Number(device.today?.workHours || 0) * (5.1 + index * 0.12), 0);
    const idle = DEVICES.reduce((sum, device, index) => sum + Number(device.today?.idleHours || 0) * (4.6 + index * 0.1), 0);
    const activeIds = DEVICES.filter((device) => device.status !== '离线').map((device) => device.id);
    const idleIds = DEVICES.filter((device) => device.status === '怠速' || Number(device.today?.idleHours || 0) > 1).map((device) => device.id);
    return { work, idle, total: work + idle, activeIds, idleIds, daily: [35, 48, 44, 57, 52, 31, 41] };
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
    const assets = DEVICES.map((device, index) => ({ id: `search-asset-${device.id}`, type: '资产', title: device.code, meta: `${device.name} · ${device.type} · ${device.status}`, keywords: `${device.code} ${device.model} ${device.name} ${device.type} ${device.project?.name}`, icon: 'asset', image: device.image, payload: { index, device } }));
    const projects = PROJECTS.map((project) => ({ id: `search-${project.id}`, type: '项目', title: project.name, meta: `${project.deviceIds.length} 台资产 · ${project.project?.status || '进行中'}`, keywords: `${project.name} ${project.project?.address}`, icon: 'project', payload: project }));
    const features = FEATURES.map((feature) => ({ id: `search-${feature.id}`, type: '功能', title: feature.label, meta: feature.meta, keywords: `${feature.label} ${feature.meta}`, icon: feature.icon, payload: feature }));
    const brands = [...new Set(DEVICES.map((device) => device.archive?.主机厂信息?.find((item) => item.label === '制造商')?.value).filter(Boolean))]
      .map((brand) => ({ id: `search-brand-${brand}`, type: '品牌', title: brand, meta: `${DEVICES.filter((device) => device.archive?.主机厂信息?.some((item) => item.label === '制造商' && item.value === brand)).length} 台资产`, keywords: `${brand} SANY 三一`, icon: 'asset', payload: { brand } }));
    return [...assets, ...projects, ...brands, ...features];
  }, []);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return searchCatalog
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
  }, [query, searchCatalog]);

  const saveModules = (next) => { setModules(next); window.localStorage.setItem(MODULES_KEY, JSON.stringify(next)); };
  const saveActions = (next) => { setActionConfig(next); window.localStorage.setItem(ACTIONS_KEY, JSON.stringify(next)); };
  const saveLinks = (next) => { setLinks(next); window.localStorage.setItem(LINKS_KEY, JSON.stringify(next)); };
  const openList = (label, ids) => onOpenList?.({ key: `${label}-${Date.now()}`, label, deviceIds: ids });
  const openAudit = () => {
    setAuditNotice('审核模块入口已准备，详情处理将在审核模块完成。');
    window.setTimeout(() => setAuditNotice(''), 2400);
  };

  const openSettings = (tab) => { setDraftModules(modules); setDraftActions(actionConfig); setEditorTab(tab); setSettingsOpen(true); };
  const openLinkSettings = () => { setDraftLinks(links); setLinkSettingsOpen(true); };
  const openQuickLink = (link) => {
    if (link.action === 'devices') return openList('设备管理', DEVICES.map((item) => item.id));
    if (link.action === 'projects') return openList('项目管理 · 全部项目资产', DEVICES.map((item) => item.id));
    if (link.action === 'dashboard') return openList('数据大屏 · 运行资产', usage.activeIds);
    if (link.action === 'monitoring') return openList('监控中心 · 在线资产', usage.activeIds);
    if (link.action === 'maintenance') return openList('设备保养 · 计划内维护资产', maintenanceAssets.map((item) => item.device.id));
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
    if (/能耗|油耗|燃油|加油/.test(text)) return `近 7 天有 ${highEnergy} 台资产日均能耗高于 28 L，已定位到对应资产，可点击下方建议继续查看。`;
    if (/待办|任务|工作/.test(text)) return `你当前有 ${todoItems.length} 条任务，其中 ${todoItems.filter((item) => item.status === '待处理').length} 条待处理、${todoItems.filter((item) => item.status === '处理中').length} 条处理中。`;
    if (/维修|故障|异常/.test(text)) return `已记录“${text}”。可将异常资产转为维修召请，确认后会自动同步到“我的任务”。`;
    if (/SMG200|3009|实时|状态/.test(text)) return `SMG200-3009 当前行驶中，水温 80°C。需要我打开它的实时状态页吗？`;
    return `已收到“${text}”。我可以跨资产、项目和任务定位问题，试试输入“能耗”或“待办”。`;
  };

  const sendRobotMessage = () => {
    const text = robotInput.trim();
    if (!text) return;
    setRobotMessages((prev) => [...prev, { role: 'user', text }, { role: 'bot', text: buildRobotReply(text) }]);
    setRobotInput('');
    robotInputRef.current?.focus();
  };

  const rememberRecent = (item) => {
    const next = [item, ...recentItems.filter((recent) => recent.id !== item.id)].slice(0, 8);
    setRecentItems(next);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const openAsset = (device) => {
    rememberRecent({ id: `asset-${device.id}`, kind: 'asset', refId: device.id, title: device.code, meta: `${device.type} · 资产`, icon: 'asset' });
    setSearchOpen(false);
    onOpenDevice?.(DEVICES.indexOf(device));
  };

  const runAction = (action, remember = true) => {
    if (remember) rememberRecent({ id: `action-${action.id}`, kind: 'action', refId: action.id, title: action.label, meta: `快速行动 · ${action.note}`, icon: action.icon });
    setSearchOpen(false);
    if (action.id === 'workorder') openList('关联工单资产', DEVICES.slice(0, 4).map((item) => item.id));
    else setWorkflow({ issue: action.label, device: DEVICES[0], type: action.id });
  };

  const openFeature = (feature, remember = true) => {
    if (remember) rememberRecent({ id: `feature-${feature.id}`, kind: 'feature', refId: feature.id, title: feature.label, meta: `功能 · ${feature.meta}`, icon: feature.icon });
    setSearchOpen(false);
    if (feature.target === 'list') openList('全部资产', DEVICES.map((item) => item.id));
    else if (feature.target === 'maintenance') openList('计划内维护资产', maintenanceAssets.map((item) => item.device.id));
    else if (feature.target === 'workorder') openList('关联工单资产', DEVICES.slice(0, 4).map((item) => item.id));
    else setWorkflow({ issue: feature.label, device: DEVICES[0], type: feature.target });
  };

  const openProject = (project, remember = true) => {
    if (!project) return;
    if (remember) rememberRecent({ id: project.id, kind: 'project', refId: project.id, title: project.name, meta: `项目 · ${project.deviceIds.length} 台资产`, icon: 'project' });
    setSearchOpen(false);
    openList(project.name, project.deviceIds);
  };

  const openRecentItem = (item) => {
    if (item.kind === 'asset') return openAsset(DEVICES.find((device) => device.id === item.refId) || DEVICES[0]);
    if (item.kind === 'project') return openProject(PROJECTS.find((project) => project.id === item.refId));
    if (item.kind === 'feature') return openFeature(FEATURES.find((feature) => feature.id === item.refId) || FEATURES[0]);
    if (item.kind === 'action') return runAction(QUICK_ACTIONS.find((action) => action.id === item.refId) || QUICK_ACTIONS[0]);
    if (item.kind === 'maintenance') return openList('逾期维保资产', maintenanceBuckets[0].assets.map((asset) => asset.device.id));
    setWorkflow({ issue: item.title, device: DEVICES[0], type: 'task' });
  };

  const openSearchResult = (item) => {
    if (item.type === '资产') return openAsset(item.payload.device);
    if (item.type === '项目') return openProject(item.payload);
    if (item.type === '品牌') {
      setSearchOpen(false);
      return openList(`${item.payload.brand}资产`, DEVICES.filter((device) => device.archive?.主机厂信息?.some((field) => field.label === '制造商' && field.value === item.payload.brand)).map((device) => device.id));
    }
    if (item.type === '功能') return openFeature(item.payload);
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
    tasks: <ModuleCard title="我的任务" className="is-span-12" action={<button type="button" className="module-text-action" onClick={() => openFeature(FEATURES[1])}>更多 <Icon name="arrow" size={14}/></button>}>
      <div className="todo-stage-board">{['待处理', '处理中', '已完成'].map((status) => <button type="button" key={status} className={todoFilter === status ? 'is-active' : ''} onClick={() => setTodoFilter(todoFilter === status ? '全部' : status)}><strong>{todoItems.filter((item) => item.status === status).length}</strong><span>{status}</span></button>)}</div>
      <div className="todo-list">{filteredTodos.slice(0, 3).map((item) => <div className="todo-row" key={item.id}><button type="button" className="todo-main" title={`${item.title} · ${item.meta} · 截止 ${item.due}`} onClick={() => setWorkflow({ issue: item.title, device: item.device, type: item.type })}><div className="todo-title"><span className={`priority-${item.priority}`}>{item.priority}</span><small>{item.category}</small><strong>{item.title}</strong></div><div className="todo-meta"><span>{item.meta}</span><time className="todo-due">截止 {item.due}</time></div></button><button type="button" className="todo-handle" onClick={() => setWorkflow({ issue: item.title, device: item.device, type: item.type })}>处理</button></div>)}</div>
    </ModuleCard>,
    audit: <ModuleCard title="审核概览" subtitle="待处理事件与未读提醒" className="is-span-12" action={<button type="button" className="module-text-action" onClick={openAudit}>进入审核 <Icon name="arrow" size={14}/></button>}>
      <div className="audit-summary-head"><button type="button" className="audit-total" onClick={openAudit}><strong>{AUDIT_GROUPS.reduce((sum, item) => sum + item.count, 0)}</strong><span>待处理事件</span></button><button type="button" className="audit-unread" onClick={openAudit}><b>{AUDIT_GROUPS.reduce((sum, item) => sum + item.unread, 0)}</b><span>未读新事件</span></button></div>
      <div className="audit-groups">{AUDIT_GROUPS.map((group) => <button type="button" key={group.id} className={`audit-group ${group.tone}`} title={`${group.label}：${group.count} 条待处理，${group.unread} 条未读`} onClick={openAudit}><span>{group.label}</span><strong>{group.count}</strong>{group.unread > 0 && <i>新{group.unread}</i>}</button>)}</div>
      <div className="audit-events"><div className="audit-events-title"><span>最近事件</span><small>按发生时间倒序</small></div>{AUDIT_EVENTS.map((event) => <button type="button" key={event.id} className="audit-event" title={`${event.type} · ${event.device} · ${event.time}`} onClick={openAudit}><i className={event.tone}/><span><strong>{event.type}{event.unread && <em>新</em>}</strong><small>{event.device} · {event.group}</small></span><time>{event.time}</time></button>)}</div>
    </ModuleCard>,
    maintenance: <ModuleCard title="计划内维护" className="is-span-12" action={<button type="button" className="module-text-action" onClick={() => openList('全部计划内维护资产', maintenanceAssets.map((item) => item.device.id))}>查看全部 <Icon name="arrow" size={14}/></button>}>
      <div className="module-view-tabs"><button type="button" className={maintenanceView === 'summary' ? 'is-active' : ''} onClick={() => setMaintenanceView('summary')}>到期概览</button><button type="button" className={maintenanceView === 'assets' ? 'is-active' : ''} onClick={() => setMaintenanceView('assets')}>资产明细</button></div>
      {maintenanceView === 'summary' ? <><div className="maintenance-compact-stats">{maintenanceBuckets.slice(0, 3).map((bucket) => <button type="button" key={bucket.id} className={bucket.tone} onClick={() => openList(bucket.label, bucket.assets.map((asset) => asset.device.id))}><strong>{bucket.assets.length}</strong><span>{bucket.label}</span><small>{bucket.note}</small></button>)}</div><div className="maintenance-next"><span>最近需要处理</span>{maintenanceAssets.slice().sort((a, b) => a.offset - b.offset).slice(0, 2).map((item) => <button type="button" key={item.device.id} title={`${item.device.code} · ${item.device.type} · 上次保养 ${item.lastDate}`} onClick={() => openAsset(item.device)}><div><strong>{item.device.code}</strong><small>{item.device.type} · 上次保养 {item.lastDate}</small></div><b className={item.offset < 0 ? 'is-danger' : 'is-warning'}>{item.statusText}</b></button>)}</div><div className="maintenance-future"><button type="button" onClick={() => openList('未来 30 天到期资产', maintenanceBuckets[3].assets.map((asset) => asset.device.id))}>未来 30 天 <b>{maintenanceBuckets[3].assets.length}</b> 台</button><button type="button" onClick={() => openList('未来 60 天到期资产', maintenanceBuckets[4].assets.map((asset) => asset.device.id))}>未来 60 天 <b>{maintenanceBuckets[4].assets.length}</b> 台</button></div></> : <div className="maintenance-assets is-compact">{maintenanceAssets.slice(0, 4).map((item) => <button type="button" key={item.device.id} title={`${item.device.code} · ${item.device.type} · 上次保养 ${item.lastDate}`} onClick={() => openAsset(item.device)}><img src={item.device.image} alt=""/><div><strong>{item.device.code}</strong><span>{item.device.type} · 上次保养 {item.lastDate}</span></div><b className={item.offset < 0 ? 'is-danger' : item.offset <= 7 ? 'is-warning' : ''}>{item.statusText}</b></button>)}</div>}
    </ModuleCard>,
    operations: <ModuleCard title="资产运行概览" className="is-span-12" action={<button type="button" className="scope-chip" onClick={() => openList('我的管辖资产', DEVICES.map((item) => item.id))}>统计范围：我管辖的 {DEVICES.length} 台资产</button>}>
      <div className="operations-layout"><section className="operation-usage"><div className="operation-section-title"><div><Icon name="trend"/><span>运行概览</span></div><small>较上周 <b>+6.8%</b></small></div><div className="operation-kpis"><button type="button" onClick={() => openList('过去 7 天有运行数据的资产', DEVICES.map((item) => item.id))}><span>工时</span><strong>{formatHours(usage.total)}<em>h</em></strong></button><button type="button" onClick={() => openList('高怠速关注资产', usage.idleIds)}><span>怠速工时</span><strong>{formatHours(usage.idle)}<em>h</em></strong></button><button type="button" title="作业效率 = 有效作业时间 ÷ 总运行时间，点击查看高怠速资产" onClick={() => openList('高怠速关注资产', usage.idleIds)}><span>作业效率</span><strong>{Math.round((usage.work / usage.total) * 100)}<em>%</em></strong></button></div><div className="operation-chart">{usage.daily.map((value, index) => <div key={index}><i style={{ height: `${value}%` }}/><span>周{['一', '二', '三', '四', '五', '六', '日'][index]}</span></div>)}</div></section><aside className="operation-fuel"><div className="operation-section-title"><div><Icon name="fuel"/><span>能耗概览</span></div><small>过去 7 天</small></div><div className="energy-tabs" role="tablist" aria-label="能耗类型"><button type="button" role="tab" aria-selected={energyMode === 'oil'} className={energyMode === 'oil' ? 'is-active' : ''} onClick={() => setEnergyMode('oil')}>油耗</button><button type="button" role="tab" aria-selected={energyMode === 'electricity'} className={energyMode === 'electricity' ? 'is-active' : ''} onClick={() => setEnergyMode('electricity')}>电耗</button></div>{energyMode === 'oil' ? <><button type="button" className="fuel-callout" onClick={() => openList('高油耗关注资产', energy.highIds)}><strong>{formatHours(energy.total)}<em>L</em></strong><div><span>累计油耗</span><small>日均 {formatHours(energy.daily)} L · 点击查看高油耗资产</small></div></button><div className="fuel-distribution">{energy.groups.map((group) => <button type="button" key={group.id} onClick={() => openList(`日均油耗 ${group.label} 的资产`, group.ids)}><span>{group.label}</span><div><i style={{ width: `${Math.max(4, (group.ids.length / DEVICES.length) * 100)}%` }}/></div><strong>{group.ids.length} 台</strong></button>)}</div></> : <div className="energy-empty"><span><Icon name="fuel"/></span><strong>暂无电耗数据</strong><small>当前管辖资产尚未接入电耗采集，接入后将在此展示累计电耗、日均电耗和资产分布。</small></div>}</aside></div>
    </ModuleCard>,
    links: <ModuleCard title="快速链接" className="is-span-12 is-links" action={<button type="button" className="icon-action" onClick={openLinkSettings} aria-label="设置快速链接"><Icon name="gear"/></button>}>
      <div className="quick-links">{links.filter((link) => link.visible).map((link) => <button type="button" key={link.id} title={`${link.label} · ${link.meta}`} onClick={() => openQuickLink(link)}><span className={link.tone}><Icon name="link"/></span><div><strong>{link.label}</strong><small>{link.meta}</small></div><Icon name="arrow" size={14}/></button>)}</div>
    </ModuleCard>,
    projects: <ModuleCard title="重点项目" subtitle="在场资产与项目运行状态" className="is-span-12" action={<span className="module-count">{PROJECTS.length} 个进行中</span>}>
      <div className="project-list">{PROJECTS.slice(0, 3).map((project) => <button type="button" key={project.id} title={`${project.name} · ${project.project?.address || '项目地址待补充'}`} onClick={() => openProject(project)}><span><Icon name="project"/></span><div><strong>{project.name}</strong><small>{project.project?.address || '项目地址待补充'}</small></div><b>{project.deviceIds.length} 台资产</b><Icon name="arrow" size={14}/></button>)}</div>
    </ModuleCard>,
  };

  return <div ref={homeDashboardRef} className="home-dashboard">
    {auditNotice && <div className="home-inline-notice" role="status">{auditNotice}</div>}
    <section className="home-hero">
      <div className="hero-grid"/>
      <div className="hero-copy"><span className="eyebrow">SANVIST OPERATIONS</span><h1>下午好，张经理</h1><p>从资产问题出发，把今天最重要的行动推进到完成。</p></div>
      <div className="global-search-wrap" ref={globalSearchRef}>
        <div className="global-search"><Icon name="search" size={22}/><input ref={searchInputRef} value={query} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} aria-expanded={searchOpen} aria-controls="global-search-panel" placeholder="搜索资产、型号、项目或品牌"/><kbd>⌘ K</kbd></div>
        {searchOpen && query && <section id="global-search-panel" className="search-inline-panel" aria-label="全局搜索结果">
          <section className="search-inline-section">
            <header><div><strong>搜索结果</strong><small>“{query}”的匹配内容</small></div><b>{searchResults.length} 项</b></header>
            <div className="search-result-list">{searchResults.length ? searchResults.map((item) => <SearchItem key={item.id} item={item} onSelect={openSearchResult}/>) : <div className="search-empty"><span><Icon name="search" size={22}/></span><strong>没有找到匹配内容</strong><small>可尝试资产编号、项目名称或品牌名称。</small></div>}</div>
          </section>
        </section>}
      </div>
      <div className="hero-recent">
        <div className="recent-strip"><span className="recent-label">最近访问</span><div className="recent-items">{recentItems.slice(0, 3).map((item) => <button type="button" className="recent-chip" key={item.id} title={`${item.title} · ${item.meta}`} onClick={() => openRecentItem(item)}><i><Icon name={item.icon || 'link'} size={15}/></i><span>{item.title}</span></button>)}</div>{recentItems.length > 3 && <div className="recent-more-wrap"><button ref={recentMoreRef} type="button" className="recent-more" aria-expanded={recentOpen} aria-haspopup="dialog" onClick={() => setRecentOpen((open) => !open)}><Icon name="more" size={17}/><span>更多</span><b>{recentItems.length - 3}</b></button></div>}</div>
      </div>
    </section>

    {recentOpen && <div ref={recentPopoverRef} className="recent-popover" style={recentPanelPosition ? { top: `${recentPanelPosition.top}px`, insetInlineEnd: `${recentPanelPosition.insetInlineEnd}px` } : undefined} role="dialog" aria-label="全部最近访问"><header><div><strong>全部最近访问</strong><small>资产、项目、任务和业务功能</small></div><button type="button" onClick={() => setRecentOpen(false)} aria-label="关闭最近访问"><Icon name="close" size={15}/></button></header><div className="recent-popover-list">{recentItems.map((item) => <button type="button" key={item.id} title={`${item.title} · ${item.meta}`} onClick={() => { setRecentOpen(false); openRecentItem(item); }}><i><Icon name={item.icon || 'link'} size={16}/></i><span><strong>{item.title}</strong><small>{item.meta}</small></span><Icon name="arrow" size={14}/></button>)}</div></div>}

    {searchOpen && query && <div className="search-inline-reserve is-results" aria-hidden="true"/>}

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
    {settingsOpen && <Drawer title="配置主屏幕" subtitle="模块和快速行动统一在这里添加、隐藏与排序" onClose={() => setSettingsOpen(false)} wide footer={<><button type="button" onClick={() => editorTab === 'modules' ? setDraftModules(DEFAULT_MODULES) : setDraftActions(DEFAULT_ACTION_CONFIG)}>恢复当前页默认</button><button type="button" className="primary" onClick={() => { saveModules(draftModules); saveActions(draftActions); setSettingsOpen(false); }}>保存并应用</button></>}>
      <div className="home-editor">
        <div className="editor-intro"><span><Icon name="edit"/></span><div><strong>首页可配置范围</strong><p>支持模块显隐与整体顺序，也支持快速行动显隐与左右顺序。设置只保存在当前浏览器。</p></div></div>
        <div className="editor-tabs"><button type="button" className={editorTab === 'modules' ? 'is-active' : ''} onClick={() => setEditorTab('modules')}>页面模块 <span>{draftModules.filter((item) => item.visible).length}/{draftModules.length}</span></button><button type="button" className={editorTab === 'actions' ? 'is-active' : ''} onClick={() => setEditorTab('actions')}>快速行动 <span>{draftActions.filter((item) => item.visible).length}/{draftActions.length}</span></button></div>
        {editorTab === 'modules' ? <><div className="editor-caption"><strong>拖动调整整个页面的模块顺序</strong><span>隐藏的模块仍保留在功能库，可随时重新添加</span></div><div className="editor-list">{draftModules.map((module, index) => <div key={module.id} className={module.visible ? '' : 'is-hidden'} draggable onDragStart={() => setDraggingId(module.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => moduleDrop(event, module.id)}><span className="drag-handle">⠿</span><b>{String(index + 1).padStart(2, '0')}</b><div><strong>{module.label}</strong><small>{module.description}</small></div><button type="button" className={module.visible ? 'editor-toggle is-added' : 'editor-toggle'} onClick={() => setDraftModules(draftModules.map((item) => item.id === module.id ? { ...item, visible: !item.visible } : item))}>{module.visible ? '已添加' : '+ 添加'}</button></div>)}</div></> : <><div className="editor-caption"><strong>拖动调整快速行动的左右顺序</strong><span>首页只显示已启用入口，左右按钮会按位置自动出现</span></div><div className="editor-list">{draftActions.map((config, index) => { const action = QUICK_ACTIONS.find((item) => item.id === config.id); return <div key={config.id} className={config.visible ? '' : 'is-hidden'} draggable onDragStart={() => setActionDraggingId(config.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => actionDrop(event, config.id)}><span className="drag-handle">⠿</span><b>{String(index + 1).padStart(2, '0')}</b><i className="editor-action-icon"><Icon name={action?.icon}/></i><div><strong>{action?.label}</strong><small>{action?.note}</small></div><button type="button" className={config.visible ? 'editor-toggle is-added' : 'editor-toggle'} onClick={() => setDraftActions(draftActions.map((item) => item.id === config.id ? { ...item, visible: !item.visible } : item))}>{config.visible ? '已启用' : '+ 启用'}</button></div>; })}</div></>}
      </div>
    </Drawer>}
    {linkSettingsOpen && <Drawer title="快速链接设置" subtitle="拖动改变顺序，并选择需要展示的入口" onClose={() => setLinkSettingsOpen(false)} footer={<><button type="button" onClick={() => setDraftLinks(DEFAULT_LINKS)}>恢复默认</button><button type="button" className="primary" onClick={() => { saveLinks(draftLinks); setLinkSettingsOpen(false); }}>保存并应用</button></>}>
      <div className="setting-list">{draftLinks.map((link) => <div key={link.id} draggable onDragStart={() => setLinkDraggingId(link.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => linkDrop(event, link.id)}><span className="drag-handle">⠿</span><div><strong>{link.label}</strong><small>{link.meta}</small></div><label className="switch"><input type="checkbox" checked={link.visible} onChange={() => setDraftLinks(draftLinks.map((item) => item.id === link.id ? { ...item, visible: !item.visible } : item))}/><i/></label></div>)}</div>
    </Drawer>}
    {robotOpen && <Drawer title="SanVIST 助手" subtitle="查询资产、解释异常并发起业务操作" onClose={() => setRobotOpen(false)}>
      <div className="robot-panel">
        <div className="robot-messages">{robotMessages.map((message, index) => <div key={index} className={`robot-message${message.role === 'user' ? ' is-user' : ''}`}><span>{message.role === 'bot' ? <Icon name="robot"/> : <Icon name="assign"/>}</span><p>{message.text}</p></div>)}</div>
        <div className="robot-suggestions"><span>试试这样问</span>{['查找日均能耗最高的资产', '哪些待办还没有处理？', '打开 SMG200-3009 的实时状态'].map((text, index) => <button type="button" key={text} onClick={() => { setRobotOpen(false); if (index === 2) openAsset(DEVICES[0]); else if (index === 0) openList(text, energy.highIds); else openFeature(FEATURES[1]); }}>{text}<Icon name="arrow" size={14}/></button>)}</div>
        <div className="robot-input"><input ref={robotInputRef} value={robotInput} onChange={(event) => setRobotInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') sendRobotMessage(); }} placeholder="输入资产编号、项目或问题…"/><button type="button" onClick={sendRobotMessage} aria-label="发送"><Icon name="arrow"/></button></div>
      </div>
    </Drawer>}
  </div>;
}

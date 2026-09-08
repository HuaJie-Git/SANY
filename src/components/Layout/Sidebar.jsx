import React, { useState } from 'react';

const items = [
  { key: 'workbench', label: '工作台', icon: 'home' },
  { key: 'devices', label: '设备管理', icon: 'machine' },
  { key: 'dashboard', label: '数据大屏', icon: 'screen', pro: true },
  { key: 'reports', label: '机器报表', icon: 'report' },
  { key: 'people-monitor', label: '人员管理', icon: 'people', pro: true, children: [
    ['people-monitor', '考勤监控'], ['people-stats', '考勤统计'], ['people-detail', '考勤明细'], ['people-config', '考勤配置'],
  ] },
  { key: 'projects', label: '项目管理', icon: 'project' },
  { key: 'map-monitor', label: '监控中心', icon: 'monitor', children: [['map-monitor', '地图监控'], ['warning-center', '预警中心']] },
  { key: 'maintenance', label: '设备保养', icon: 'maintain' },
  { key: 'service', label: '服务工单', icon: 'service' },
  { key: 'parts-wanted', label: '配件', icon: 'parts', children: [['parts-wanted', '我要配件'], ['parts-delivery', '配件交付']] },
  { key: 'repair-list', label: '维修管理', icon: 'repair', pro: true, children: [
    ['repair-list', '维修列表'], ['repair-approval', '费用审批'], ['repair-parts', '配件管理'], ['repair-engineers', '工程师配置'], ['repair-vehicles', '服务车配置'],
  ] },
  { key: 'cost-detail', label: '费用核算', icon: 'cost', pro: true, children: [['cost-detail', '费用明细'], ['workload-detail', '工作量明细'], ['cost-summary', '核算统计']] },
  { key: 'terminals', label: '音视频服务', icon: 'video', pro: true, children: [['terminals', '终端管理']] },
  { key: 'tenant', label: '企业服务', icon: 'enterprise', children: [['tenant', '租户管理'], ['personal', '个人中心'], ['org', '组织管理'], ['users', '用户管理'], ['roles', '角色管理']] },
  { key: 'fleet', label: '重卡车队运营', icon: 'fleet' },
  { key: 'esc-events', label: 'ESC事件', icon: 'esc' },
  { key: 'audit', label: '审核', icon: 'audit' },
];

function Icon({ name }) {
  const paths = {
    home: <><path d="M3 11 12 4l9 7"/><path d="M5 10v9h14v-9M9 19v-6h6v6"/></>,
    machine: <><path d="M4 8h10l3 4h3v5H4z"/><circle cx="8" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M8 8V5h5v3"/></>,
    screen: <><rect x="3" y="4" width="18" height="15" rx="1"/><path d="M7 15v-3M11 15V8M15 15v-5M19 15V6"/></>,
    report: <><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    people: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20a6 6 0 0 1 12 0M14 15a5 5 0 0 1 7 5"/></>,
    project: <><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M8 4v16M8 9h12M11 13h6"/></>,
    monitor: <><circle cx="12" cy="12" r="8"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3"/><circle cx="12" cy="12" r="2"/></>,
    maintain: <><rect x="5" y="7" width="14" height="13" rx="1"/><path d="M8 7V4h8v3M9 12h6"/></>,
    service: <><path d="M4 13v-2a8 8 0 0 1 16 0v2"/><path d="M4 12h3v6H4zM17 12h3v6h-3zM17 19h-4"/></>,
    parts: <><rect x="4" y="4" width="16" height="16"/><path d="M8 4v16M4 9h4M8 14h12"/></>,
    repair: <><path d="m14 6 4-3 3 3-3 4"/><path d="m15 8-9 9-2 4 4-2 9-9"/></>,
    cost: <><path d="M4 19h16M6 17v-5M11 17V7M16 17V4"/></>,
    video: <><rect x="3" y="5" width="14" height="14" rx="1"/><path d="m17 10 4-3v10l-4-3zM7 9l5 3-5 3z"/></>,
    enterprise: <><path d="M12 3 3 8l9 5 9-5zM5 11v6l7 4 7-4v-6"/></>,
    fleet: <><path d="M3 7h12v10H3zM15 10h3l3 3v4h-6z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    esc: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h5M8 16h6"/><path d="m16 15 2 2 3-4"/></>,
    audit: <><path d="M6 3h12v18H6zM9 3v3h6V3"/><path d="m9 13 2 2 4-5"/></>,
    message: <><path d="M3 5h18v13H8l-5 3z"/><path d="M7 9h10M7 13h7"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function Sidebar({ activeKey = 'workbench', onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  return <aside className={`sany-sidebar${collapsed ? ' is-collapsed' : ''}`} aria-label="主导航"><nav>{items.map((item) => {
    const childActive = item.children?.some(([key]) => key === activeKey);
    const active = item.key === activeKey || childActive;
    return <div className={`sidebar-group${active ? ' is-open' : ''}`} key={item.key}>
      <button type="button" aria-label={item.label} title={item.label} className={`sidebar-item${active ? ' is-active' : ''}`} onClick={() => onNavigate?.(item.key)}>
        {item.pro && <span className="sidebar-pro-badge">PRO</span>}<span className="sidebar-item-icon"><Icon name={item.icon}/></span><small>{item.label}</small>{item.children && <span className="sidebar-chevron">⌃</span>}
      </button>
      {item.children && active && <div className="sidebar-submenu">{item.children.map(([key, label]) => <button key={key} type="button" aria-label={label} title={label} className={key === activeKey ? 'is-active' : ''} onClick={() => onNavigate?.(key)}>{label}</button>)}</div>}
    </div>;
  })}</nav><div className="sidebar-bottom-zone"><div className="sidebar-decoration" aria-hidden="true"/><button className="sidebar-collapse" type="button" aria-label={collapsed ? '展开导航' : '收起导航'} title={collapsed ? '展开导航' : '收起导航'} onClick={() => setCollapsed((value) => !value)}>{collapsed ? '≫' : '≪'}</button></div></aside>;
}

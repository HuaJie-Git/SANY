import React, { useEffect, useState } from 'react';
import { AUDIT_EVENTS } from '../data/auditEvents';
import { DEVICES } from '../data/devices';
import MaintenancePage from './MaintenancePage';
import './business-module.css';

const pageConfigs = {
  'people-stats': { title: '考勤统计', columns: ['序号', '姓名', '项目名称', '关联设备', '所属组织', '角色', '操作', '8/9 日', '8/10 一', '8/11 二', '8/12 三', '8/13 四', '8/14 五'], filters: ['搜索人员姓名', '最近 30 天', '全部项目', '全部状态', '全部组织', '全部角色'], exportLabel: '导出 Excel' },
  'people-detail': { title: '考勤明细', columns: ['姓名/账号', '所属组织', '用户角色', '班次/规则', '打卡时间', '人员工时', '关联设备', '设备运行', '工时偏差', '状态', '操作'], filters: ['2026-09-07', '全部组织', '全部角色', '全部状态'], kpis: ['总出勤人数', '总人员工时', '总设备工时', '工时异常（>20%）'] },
  'people-config': { title: '考勤配置', columns: ['规则名称', '适用组织', '适用角色', '班次时间', '状态', '操作'], filters: ['搜索规则名称'], innerTabs: ['考勤规则', '节假日配置'], primary: '新建规则', export: false },
  projects: { title: '项目管理', columns: ['项目名称', '所属组织', '项目状态', '在场设备数', '项目地址', '项目周期', '创建日期', '操作'], filters: ['请输入项目名称或编码', '项目状态', '所属组织'], primary: '新增项目', rows: [['mysany测试组', '三一测试租户', '进行中', '16', '天安门', '2026-05-06 ~ 2026-05-31', '2026-05-06', '详情　编辑　设置状态　删除']] },
  'warning-center': { title: '预警中心', columns: ['预警时间', '设备序列号', '自编号', '设备类型', '所属项目', '预警类型', '预警内容', '处理状态', '处理说明', '处理人', '处理时间', '操作'], filters: ['设备编号/序列号', '请选择项目', '请选择处理状态', '请选择设备类型', '请选择预警类型'], kpis: ['预警次数', '待处理'], dateTabs: ['今日', '近7天', '近30天', '自定义'] },
  maintenance: { title: '设备保养', columns: ['设备信息', '所属项目', '保养状态', '距下次保养', '配置策略', '上次保养', '当前工况', '操作'], filters: ['搜索设备编号/项目自编号', '全部设备种类', '全部保养状态', '全部所属项目'], innerTabs: ['设备保养清单', '设备保养记录'], actions: ['批量配置策略'], rows: DEVICES.slice(0, 7).map((d, i) => [d.code, d.project?.name || '-', i < 5 ? '正常保养' : '-', i < 5 ? `目标工时：500.0h｜剩余 ${493 + i}h` : '-', i === 6 ? '按工时：3000h' : '按工时：500h', i === 0 ? '自行保养 2026-08-27 00:00:00 6h' : '-', `${d.today?.workHours ?? '-'}h`, '查看保养记录　更多']) },
  'repair-list': { title: '维修列表', columns: ['工单编号', '设备信息', '故障描述', '预计费用（ZAR）', '维修类型', '状态', '创建时间', '操作'], filters: ['搜索工单编号或设备序列号', '状态', '请选择费用范围'], kpis: ['步骤1 待派工', '步骤2 待维修', '步骤3 维修中', '步骤4 待审批', '步骤5 已完成'], primary: '创建维修工单' },
  'repair-approval': { title: '费用审批', columns: ['编号', '类型', '申请人', '设备信息', '故障描述', '金额（ZAR）', '优先级', '状态', '创建时间', '操作'], filters: ['搜索编号、申请人或关键词', '状态', '优先级'], kpis: ['全部', '待审批', '已通过', '已驳回'] },
  'repair-parts': { title: '配件管理', columns: ['配件编号', '配件名称', '规格型号', '单价（ZAR）', '操作'], filters: ['搜索配件编号或名称'], actions: ['批量导入'], primary: '新增配件' },
  'repair-engineers': { title: '工程师配置', columns: ['工程师姓名', '手机号', '所属组织', '技能标签', '当前状态', '操作'], kpis: ['在职工程师 0 人'], primary: '添加工程师', export: false },
  'repair-vehicles': { title: '服务车配置', columns: ['车牌号', '车辆类型', '所属组织', '当前司机', '状态', '操作'], kpis: ['服务车辆 0 辆'], primary: '添加车辆', export: false },
  'cost-detail': { title: '费用明细', columns: ['费用编号', '设备信息', '所属项目', '费用类型', '费用金额(ZAR)', '自有成本(ZAR)', '客户承担(ZAR)', '费用说明', '发生日期', '录入人', '操作'], filters: ['全部录入', '全部设备', '全部类型', '开始日期 → 结束日期'], kpis: ['总费用', '其他费用', '自有/客户'], actions: ['批量导入'], primary: '录入费用' },
  'workload-detail': { title: '工作量明细', columns: ['日期', '关联设备', '所属项目', '工作量(h)', 'IoT参考值(h)', '工作内容描述', '录入时间', '登记人', '操作'], filters: ['全部录入', '全部设备', '请选择项目', '开始日期 → 结束日期'], kpis: ['总工时', '设备利用率', 'IoT采集工时', '平均日工时'], actions: ['批量导入'], primary: '录入工作量' },
  terminals: { title: '终端管理', columns: ['序号', '终端号', '实际SIM卡号', '上线卡号', '设备编号', '绑定日期', '终端生产厂商', '终端型号', '车载终端型号', '生产', '操作'], filters: ['请输入终端号/卡号', '请输入终端型号', '请输入终端', '生产日期', '开始日期 → 结束日期'], actions: ['导入'], primary: '新增' },
  users: { title: '用户管理', columns: ['姓名', '手机号', '邮箱', '用户名', '所属组织', '角色', '设备范围类型', '业务职责', '操作'], filters: ['搜索姓名、手机号、邮箱', '选择组织', '全部角色', '设备类型'], actions: ['导入', '设备分配', '邀请记录'], primary: '新增用户', export: false, rows: [['Bowo_Medan', '-', '1114447778@qq.com', 'Bowo_Medan', '三一测试租户', '管理员', '全部设备', 'Equipment Owner', '编辑　重置密码'], ['Agus_Jogja', '-', '8522588525@qq.com', 'Agus_Jogja', '三一测试租户', '管理员', '全部设备', 'Equipment Owner', '编辑　重置密码'], ['Niran_Cool', '-', '3000015485@qq.com', 'Niran_Cool', '三一测试租户', '管理员', '全部设备', 'Equipment Owner', '编辑　重置密码']] },
  roles: { title: '角色管理', columns: ['角色名称', '角色类型', '角色描述', '设备权限类型', '关联用户数', '创建时间', '操作'], filters: ['请输入角色名称', '请选择角色类型', '请选择设备权限类型'], primary: '新增角色', export: false, rows: [['维修工', '系统配置', '设备维修人员，负责设备维护', '组织+项目', '5', '2026-05-06 11:28:17', '详情　编辑　恢复默认'], ['机手', '系统配置', '设备操作人员，使用分配的设备', '个人设备', '1', '2026-05-06 11:28:17', '详情　编辑　恢复默认'], ['车队长', '系统配置', '车队管理人', '组织+项目', '1', '2026-05-06 11:28:17', '详情　编辑　恢复默认'], ['管理员', '系统配置', '系统管理员，拥有租户内所有权限', '全部设备', '61', '2026-05-06 11:28:17', '详情　编辑　恢复默认']] },
  fleet: { title: '重卡车队运营', columns: ['车辆编号', '车牌号', '所属车队', '在线状态', '运行状态', '今日里程', '更新时间', '操作'], filters: ['搜索车辆编号/车牌号', '全部车队', '全部状态'], kpis: ['车辆总数', '在线车辆', '今日里程', '异常车辆'] },
  service: { title: '服务工单', columns: ['设备编号', '类型', '工单编号', '创建时间', '状态', '操作'], filters: ['请输入关键字'], innerTabs: ['全部', '处理中', '待确认', '待评价', '已评价', '已取消'], primary: '服务召请', export: false, rows: [['SY036RCC77728', '服务召请', '2026030260', '2026-03-18 21:19:12', '处理中', '详情　取消　催单'], ['SY036RCC77728', '服务召请', '2026030252', '2026-03-18 17:05:29', '处理中', '详情　取消　催单'], ['LFXDKG6W5T3000126', '维修保养', '2026030249', '2026-03-18 16:42:36', '待确认', '详情　确认服务工单'], ['SY0600CC35778', '维修保养', '2025120325', '2025-12-19 11:02:48', '处理中', '详情　取消']] },
};

function Icon({ name, size = 18 }) {
  const paths = { search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></>, export: <><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 13v7h14v-7"/></>, plus: <><path d="M12 5v14M5 12h14"/></>, empty: <><path d="M5 9h14l-1 11H6z"/><path d="m8 9 1-4h6l1 4M9 14h6"/></>, close: <><path d="m6 6 12 12M18 6 6 18"/></> };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Kpis({ items = [] }) { return items.length ? <div className="ref-kpis">{items.map((name, index) => <article key={name}><div><span>{name}</span><strong>{name.includes('率') ? '0%' : name.includes('费用') ? 'ZAR 0' : '0'}</strong><small>{index === 0 ? '较昨日 --' : '暂无数据'}</small></div><i>{index + 1}</i></article>)}</div> : null; }

function Toast({ text }) { return text ? <div className="ref-toast">{text}</div> : null; }

function EmptyState({ label = '无结果' }) { return <div className="ref-empty"><Icon name="empty" size={48}/><span>{label}</span></div>; }

function Pagination({ total = 0 }) {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);
  return <div className="ref-pagination"><span>共 {total} 条记录</span><button type="button" aria-label="上一页" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>‹</button>{Array.from({ length: Math.min(pageCount, 5) }, (_, index) => index + 1).map((number) => <button type="button" className={page === number ? 'is-current' : ''} key={number} onClick={() => setPage(number)}>{number}</button>)}<button type="button" aria-label="下一页" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>›</button><select aria-label="每页条数" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value="10">10</option><option value="20">20</option><option value="50">50</option></select><span>条/页</span></div>;
}

function Toolbar({ filters = [], primary, actions = [], onAction, onExport, exportLabel = '导出', query = '', onQuery }) {
  return <div className="ref-toolbar">{filters.map((label, index) => index === 0 && /搜索|输入|设备编号|终端号/.test(label) ? <label className="ref-search" key={label}><Icon name="search" size={15}/><input value={query} onChange={(event) => onQuery?.(event.target.value)} placeholder={label}/></label> : <select key={`${label}-${index}`} defaultValue="" onChange={() => onAction('筛选条件已更新')}><option value="">{label}</option><option>全部</option><option>处理中</option></select>)}<span className="ref-toolbar-spacer"/>{actions.map((label) => <button type="button" key={label} onClick={() => onAction(label)}>{label}</button>)}{onExport && <button type="button" onClick={onExport}><Icon name="export" size={14}/>{exportLabel}</button>}{primary && <button type="button" className="ref-primary" onClick={() => onAction(primary)}>{primary.includes('新增') || primary.includes('添加') || primary.includes('创建') ? <Icon name="plus" size={14}/> : null}{primary}</button>}</div>;
}

function exportCsv(config, rows) {
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [config.columns, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = `${config.title}.csv`; link.click(); URL.revokeObjectURL(url);
}

function DataTable({ columns, rows = [], empty = '无结果', onDetail, onAction }) {
  return <><div className="ref-table-scroll"><table className="ref-table"><thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>{rows.map((row, ri) => <tr key={`${row[0]}-${ri}`}>{columns.map((_, ci) => <td key={`${ri}-${ci}`}>{ci === columns.length - 1 && row[ci] && row[ci] !== '-' ? <button type="button" className="ref-link" onClick={() => onDetail ? onDetail(row) : onAction?.(String(row[ci]))}>{row[ci]}</button> : row[ci] ?? '-'}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <EmptyState label={empty}/>}</div><Pagination total={rows.length}/></>;
}

function StandardPage({ config, onAction, onDetail }) {
  const [active, setActive] = useState(config.innerTabs?.[0]);
  const [dateTab, setDateTab] = useState(config.dateTabs?.[2]);
  const [query, setQuery] = useState('');
  const rows = (config.rows || []).filter((row) => row.join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  const handleExport = config.export === false ? undefined : () => { exportCsv(config, rows); onAction('已生成导出文件'); };
  return <div className="ref-page"><header className="ref-page-title"><h1>{config.title}</h1><span>最近更新：2026-09-07 11:52</span></header>{config.dateTabs && <div className="ref-segment">{config.dateTabs.map((tab) => <button type="button" onClick={() => setDateTab(tab)} className={dateTab === tab ? 'is-active' : ''} key={tab}>{tab}</button>)}</div>}{config.innerTabs && <div className="ref-tabs">{config.innerTabs.map((tab) => <button type="button" key={tab} className={active === tab ? 'is-active' : ''} onClick={() => setActive(tab)}>{tab}</button>)}</div>}<Kpis items={config.kpis}/><section className="ref-panel"><Toolbar filters={config.filters} primary={config.primary} actions={config.actions} onAction={onAction} onExport={handleExport} exportLabel={config.exportLabel} query={query} onQuery={setQuery}/><DataTable columns={config.columns} rows={rows} empty="无结果" onDetail={onDetail} onAction={onAction}/></section></div>;
}

function Reports({ onAction }) {
  const names = [['设备综合报表', '所有设备的基本信息与运行状态', '机群'], ['设备能耗报表', '设备能耗消耗情况统计', '机群'], ['设备移动报表', '设备移动、行走、作业位移情况统计', '机群'], ['设备能耗报表', '设备能耗消耗情况统计', '单机'], ['设备移动报表', '设备移动、行走、作业位移情况统计', '单机'], ['设备工时报表', '设备各工作模式下的时长分析统计', '机群'], ['设备工时报表', '设备各工作模式下的时长分析统计', '单机'], ['设备综合报表', '所有设备的基本信息与运行状态', '单机']];
  const [active, setActive] = useState('模板'); const [query, setQuery] = useState('');
  const filtered = names.filter(([name]) => name.includes(query.trim()));
  return <div className="ref-page"><div className="ref-tabs"><button type="button" className={active === '模板' ? 'is-active' : ''} onClick={() => setActive('模板')}>模板</button><button type="button" className={active === '管理报表' ? 'is-active' : ''} onClick={() => setActive('管理报表')}>管理报表</button></div><section className="ref-panel"><Toolbar filters={['报表名称']} onAction={onAction} onExport={false} query={query} onQuery={setQuery}/>{active === '模板' ? <div className="report-grid">{filtered.map(([name, desc, tag], i) => <article key={`${name}-${i}`}><i>▱</i><div><strong>{name}</strong><p>{desc}</p></div><em>{tag}</em><button onClick={() => onAction(`预览${name}`)}>预览</button><button className="ref-primary" onClick={() => onAction(`已添加${name}`)}>添加</button></article>)}</div> : <DataTable columns={['报表名称', '报表类型', '创建人', '创建时间', '操作']} empty="暂无管理报表"/>}</section></div>;
}

function Dashboard() { const [range, setRange] = useState('day'); return <div className="screen-page"><div className="screen-controls"><button className={range === 'day' ? 'is-active' : ''} onClick={() => setRange('day')}>day</button><button className={range === 'month' ? 'is-active' : ''} onClick={() => setRange('month')}>month</button><input type="date" defaultValue="2026-09-06"/></div><div className="screen-title">数据大屏</div><div className="screen-top"><article>设备统计 [24]<b>自有 25.00%　租赁 0.00%　分包 0.00%</b></article><article>在线状态<b>6 在线　18 离线</b></article><article>闲置设备<b>0.00%　0 台</b></article><article>不可用设备<b>0 停机　0 维修</b></article></div><aside className="screen-left">{['出勤率 9.1%', '利用率 105.5%', '日台均工时 11.1h', '有效工时比 57.1%', '设备类型分布 24台'].map((x) => <article key={x}>{x}<span/></article>)}</aside><div className="screen-map"><span className="map-chip c1">AC0250CD0010</span><span className="map-chip c2">21SE21A0116281</span><span className="map-chip c3">CC0800CA0037</span><span className="map-chip c4">12SY0216K3018</span><div className="world-lines"/></div><aside className="screen-right"><article>当前运行状态<div className="donut">13<small>台</small></div></article><article>油耗统计<b>11428.6<small>L</small></b></article><article>告警总数<b>62</b></article></aside></div>; }

function MapPage({ attendance = false, onAction }) {
  const [zoom, setZoom] = useState(1);
  return <div className="ref-page"><header className="ref-page-title"><h1>{attendance ? '考勤监控' : '地图监控'}</h1><span>最后更新：11:33:50</span></header>{attendance && <Kpis items={['今日出勤率', '人机工时匹配度', '异常考勤记录', '关联设备在线']}/>}<section className="map-panel"><Toolbar filters={attendance ? ['全部组织', '全部角色', '全部状态', '今日', '设备编号'] : ['设备编号/自编号/车牌号', '全部项目', '全部类型', '全部状态']} onAction={onAction} onExport={false}/><div className="map-stage"><div className="map-canvas" style={{ transform: `scale(${zoom})` }}><div className="map-land land-a"/><div className="map-land land-b"/><div className="map-labels"><span>英国</span><span>法国</span><span>德国</span><span>中国</span><span>印度尼西亚</span><span>澳大利亚</span></div></div><div className="map-zoom" aria-label="地图缩放"><button type="button" aria-label="放大地图" onClick={() => setZoom((value) => Math.min(1.35, value + 0.1))}>＋</button><button type="button" aria-label="缩小地图" onClick={() => setZoom((value) => Math.max(0.75, value - 0.1))}>－</button></div>{attendance ? <aside className="live-panel"><h3>实时打卡流 <em>Live</em></h3><EmptyState label="暂无数据"/></aside> : <aside className="device-map-list"><div className="map-list-tabs"><b>全部(23)</b><span>在线(6)</span><span>离线(17)</span></div>{DEVICES.slice(0, 6).map((d) => <article key={d.id}><strong>{d.code}</strong><small>{d.type}　{d.status}</small><small>{d.project?.name}</small><time>{d.updateTime}</time></article>)}</aside>}</div></section></div>;
}

function MaintenanceList() { return <MaintenancePage/>; }

function PartsWanted({ onAction }) { const parts = ['轴套 11644425', '硬管 11766633', '硬管 11766634', '固定卡座 11817247', '三一挖掘机保养及保修手册 11826337', '护板 11856873', '护板 11857037', '脚踏阀密封垫 11937141', '硬管 11940077', '硬管 11940086']; const [active,setActive]=useState('物料'); const [query,setQuery]=useState(''); const filtered=parts.filter((p)=>p.includes(query.trim())); return <div className="ref-page"><section className="ref-panel"><Toolbar filters={['搜索配件编码或名称']} actions={['无配件询价']} primary="询价单" onAction={onAction} query={query} onQuery={setQuery}/><div className="ref-tabs"><button type="button" className={active==='物料'?'is-active':''} onClick={()=>setActive('物料')}>物料</button><button type="button" className={active==='设备'?'is-active':''} onClick={()=>setActive('设备')}>设备</button></div>{active==='物料'?<div className="parts-grid">{filtered.map((part, i) => <article key={part} onClick={() => onAction(`已选择${part}`)}><div className="part-visual">{i % 4 === 0 ? 'SANY' : <span className={`part-shape p${i % 4}`}/>}</div><strong>{part.split(' ').slice(0, -1).join(' ')}</strong><small>{part.split(' ').at(-1)}</small></article>)}</div>:<div className="parts-grid">{DEVICES.map((d)=><article key={d.id} onClick={()=>onAction(`已选择${d.code}`)}><div className="part-visual"><img src={d.image} alt=""/></div><strong>{d.code}</strong><small>{d.type}</small></article>)}</div>}<Pagination total={active==='物料'?414:DEVICES.length}/></section></div>; }

function EnterprisePage({ type, onAction }) {
  if (type === 'tenant') return <div className="ref-page"><div className="enterprise-tabs"><b>租户管理</b><button type="button" onClick={() => onAction('客户认证')}>客户认证</button></div><div className="section-title-row"><h2 className="section-heading">租户基础信息</h2><button type="button" className="ref-text-action" onClick={() => onAction('编辑联系人信息')}>编辑联系人信息</button></div><section className="tenant-card"><dl><div><dt>租户类型</dt><dd>企业客户</dd><dt>联系人手机号</dt><dd>13265963568</dd><dt>企业注册号</dt><dd>1234567</dd></div><div><dt>联系人姓名</dt><dd>MySANY</dd><dt>企业名称</dt><dd>三一测试租户</dd><dt>注册地址</dt><dd>-</dd></div><div><dt>客户编码</dt><dd>-</dd><dt>联系人邮箱</dt><dd>-</dd><dt>开通时间</dt><dd>2026-05-06 11:05:09</dd></div></dl></section><div className="ref-kpis tenant-kpis">{[['组织数量', '4'], ['用户数量', '69'], ['设备数量', '24']].map(([name,value], index) => <article key={name}><div><span>{name}</span><strong>{value}</strong></div><i>{index + 1}</i></article>)}</div></div>;
  if (type === 'personal') return <div className="ref-page personal-layout"><aside><b>个人信息</b><button type="button" onClick={() => onAction('修改密码')}>修改密码</button><button type="button" onClick={() => onAction('通知邀请')}>通知邀请</button></aside><main><h1>个人信息</h1><section className="tenant-card"><dl><div><dt>用户姓名</dt><dd>一包，。</dd><dt>业务职责</dt><dd>设备管理员</dd></div><div><dt>手机号</dt><dd>-</dd><dt>账号创建时间</dt><dd>2024-03-22 09:06:00</dd></div><div><dt>邮箱</dt><dd>392372204@qq.com</dd><dt>最后登录时间</dt><dd>2026-09-07 11:27:39</dd></div></dl></section><h2 className="section-heading">租户信息</h2><div className="tenant-switch"><article><b>三一测试租户</b><small>企业客户</small><em>当前</em></article><article><b>SANY Heavy Industry India Pvt Ltd</b><small>代理商</small><button onClick={() => onAction('已切换租户')}>切换</button></article></div></main></div>;
  if (type === 'org') { const columns = ['用户姓名', '手机号码', '邮箱', '角色', '加入时间', '操作']; const rows = [['四姑娘', '19988889999', '4849@qq.com', '管理员', '2026-05-06', '移除'], ['一包，。', '-', '392372204@qq.com', '-', '2026-05-06', '移除'], ['hhj', '19900000001', '12@163.com', '维修工', '2026-05-06', '移除']]; return <div className="ref-page org-layout"><aside><h3>组织架构</h3><input placeholder="搜索组织"/><button type="button" onClick={() => onAction('新建组织')}>三一测试租户　＋</button><span>› KK</span></aside><main><h1>组织信息</h1><section className="tenant-card org-info"><span>组织名称<br/><b>三一测试租户</b></span><span>组织编码<br/><b>MYSANY20260506000010</b></span><span>上级组织<br/><b>-</b></span></section><div className="section-title-row"><h2 className="section-heading">组织成员</h2></div><section className="ref-panel"><Toolbar actions={['批量移除']} primary="添加成员" onAction={onAction}/><DataTable columns={columns} rows={rows} onAction={onAction}/></section></main></div>; }
  return null;
}

function CostSummary({ onAction }) { const [dimension, setDimension] = useState('设备维度'); const config = { title: '核算统计', columns: ['关联设备', '工作量(h)', 'IoT参考值(h)', '总费用', '人工费用', '配件费', '服务车费', '燃油费', '其他费用', '自有成本', '客户承担'] }; return <div className="ref-page"><header className="ref-page-title"><h1>核算统计</h1></header><div className="dimension-cards">{[['设备维度', '单台设备费用全貌'], ['项目维度', '项目费用核算汇总'], ['机型维度', '同机型设备对比'], ['时间维度', '费用趋势分析']].map(([a,b],i) => <button type="button" className={dimension===a?'is-active':''} key={a} onClick={() => { setDimension(a); onAction(`已切换至${a}`); }}><i>{i+1}</i><strong>{a}</strong><small>{b}</small></button>)}</div><section className="ref-panel"><Toolbar filters={['输入设备序列号或自编号', '开始日期 → 结束日期', '请选择项目', '请选择机型']} onAction={onAction} onExport={() => { exportCsv(config, []); onAction('已生成导出文件'); }}/><DataTable columns={config.columns} empty="无结果"/><div className="chart-row"><article><h3>费用构成分析</h3><div className="donut light"/></article><article><h3>{dimension}费用对比</h3></article></div></section></div>; }

function Audit({ onAction, onDetail }) { const [active, setActive] = useState('设备异常'); const rows = AUDIT_EVENTS.map((event) => [event.type, event.time, `${event.device}｜${event.deviceType}`, event.status, '-', '-', '详情']); const eventItems = [['设备异常', '设备异常　99+　新99+'], ['维保事项', '维保事项'], ['燃油异常', '燃油异常　99+　新99+'], ['位置预警', '位置预警'], ['检查异常', '检查异常']]; return <div className="ref-page audit-layout"><aside><h2>审核事件</h2><small>●　最后更新 09/07/2026 11:51</small>{eventItems.map(([key,label]) => <button type="button" key={key} className={active===key?'is-active':''} onClick={() => setActive(key)}>{label}</button>)}</aside><main><header className="ref-page-title"><h1>{active}列表</h1><label>按设备分组　<input type="checkbox"/></label></header><section className="ref-panel"><Toolbar filters={['处理状态', '全部事件类型', '全部设备', '设备编号/序列号/昵称', '开始日期 → 结束日期']} onAction={onAction} onExport={false}/><DataTable columns={['事件内容', '发生时间', '设备', '处理状态', '处理人', '处理时间', '操作']} rows={active === '设备异常' ? rows : []} onDetail={onDetail}/></section></main></div>; }

function Modal({ title, onClose, onAction }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  const submit = () => {
    if (!name.trim()) { setError('请输入名称'); return; }
    onAction(`${title}已保存`);
    onClose();
  };
  return <div className="ref-modal-mask" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="ref-modal" role="dialog" aria-modal="true" aria-labelledby="ref-modal-title"><header><h2 id="ref-modal-title">{title}</h2><button type="button" aria-label="关闭弹窗" title="关闭弹窗" onClick={onClose}><Icon name="close"/></button></header><div className="ref-form"><label>名称<input value={name} aria-invalid={Boolean(error)} aria-describedby={error ? 'ref-name-error' : undefined} onChange={(event) => { setName(event.target.value); if (error) setError(''); }} placeholder={`请输入${title}名称`}/></label>{error && <p className="ref-form-error" id="ref-name-error" role="alert">{error}</p>}<label>所属组织<select><option>三一测试租户</option></select></label><label>说明<textarea placeholder="请输入说明"/></label></div><footer><button type="button" onClick={onClose}>取消</button><button type="button" className="ref-primary" onClick={submit}>确定</button></footer></section></div>;
}

function Drawer({ row, onClose, onAction }) {
  useEffect(() => {
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  return <div className="ref-drawer-mask" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><aside className="ref-drawer" role="dialog" aria-modal="true" aria-labelledby="ref-drawer-title"><header><h2 id="ref-drawer-title">故障码</h2><button type="button" aria-label="关闭详情抽屉" title="关闭详情抽屉" onClick={onClose}><Icon name="close"/></button></header><section className="drawer-device"><b>{row?.[2]?.split('｜')[0]}</b><small>{row?.[2]?.split('｜')[1]}</small><button type="button" className="ref-primary" onClick={() => onAction('事件已确认处理')}>确认处理</button></section><h3>事件详情</h3><dl><dt>事件类型</dt><dd>故障码</dd><dt>处理状态</dt><dd className="warning">待处理</dd><dt>发生时间</dt><dd>{row?.[1]}</dd><dt>事件摘要</dt><dd>{row?.[0]}</dd></dl><h3>事件差异信息</h3><dl><dt>故障编码</dt><dd>2372/5</dd><dt>解决方案</dt><dd>同类问题，解决方案已说明，无需更改</dd></dl><h3>操作记录</h3><EmptyState label="暂无操作记录"/></aside></div>;
}

export default function BusinessModulePage({ moduleKey }) {
  const [toast, setToast] = useState(''); const [modal, setModal] = useState(''); const [drawer, setDrawer] = useState(null);
  const action = (text) => { if (['新增', '添加', '创建', '录入', '召请', '询价', '导入', '分配', '配置', '编辑', '修改', '认证'].some((x) => text.includes(x)) && !text.includes('已')) setModal(text); else { setToast(text); window.setTimeout(() => setToast(''), 1800); } };
  const body = (() => {
    if (moduleKey === 'dashboard') return <Dashboard/>;
    if (moduleKey === 'reports') return <Reports onAction={action}/>;
    if (moduleKey === 'people-monitor') return <MapPage attendance onAction={action}/>;
    if (moduleKey === 'map-monitor') return <MapPage onAction={action}/>;
    if (moduleKey === 'maintenance') return <MaintenanceList onAction={action}/>;
    if (moduleKey === 'parts-wanted') return <PartsWanted onAction={action}/>;
    if (moduleKey === 'parts-delivery') return <StandardPage config={{ title:'配件交付', columns:['物料编码/物料名称/订单编号','下单时间','收货信息','状态','操作'], filters:['请输入物料编码/物料名称/订单编号'], innerTabs:['全部','已下单','待收货','已完成'], export:false }} onAction={action}/>;
    if (moduleKey === 'tenant' || moduleKey === 'personal' || moduleKey === 'org') return <EnterprisePage type={moduleKey} onAction={action}/>;
    if (moduleKey === 'cost-summary') return <CostSummary onAction={action}/>;
    if (moduleKey === 'audit' || moduleKey === 'esc-events') return <Audit onAction={action} onDetail={setDrawer}/>;
    return <StandardPage config={pageConfigs[moduleKey] || pageConfigs.projects} onAction={action}/>;
  })();
  return <>{body}<Toast text={toast}/>{modal && <Modal title={modal} onClose={() => setModal('')} onAction={action}/>} {drawer && <Drawer row={drawer} onClose={() => setDrawer(null)} onAction={action}/>}</>;
}

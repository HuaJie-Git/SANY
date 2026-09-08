import { useEffect, useRef, useState } from 'react';
import { createMaintenanceRows, MAINTENANCE_GROUPS, maintenanceStatus, maintenanceRemaining } from '../data/maintenancePlan';
import './maintenance-page.css';

const SCENARIOS = [['normal', '原清单样例'], ['mixed', '多状态样例'], ['empty', '首次无数据'], ['loading', '加载中'], ['error', '加载失败'], ['timeout', '加载超时'], ['denied', '无访问权限'], ['expired', '登录失效'], ['save-error', '策略保存失败']];
const groupLabel = (id) => MAINTENANCE_GROUPS.find((item) => item.id === id)?.label;

function StrategyDialog({ rows, onClose, onSave, fail }) {
  const [cycle, setCycle] = useState(rows.length === 1 ? String(rows[0].cycle || 500) : '500');
  const [warning, setWarning] = useState('50');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [retried, setRetried] = useState(false);
  const dialog = useRef(null);
  const timer = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.focus();
    return () => { clearTimeout(timer.current); previous?.focus(); };
  }, []);
  const handleKey = (event) => {
    if (event.key === 'Escape' && !saving) { event.preventDefault(); onClose(); }
    if (event.key === 'Tab') {
      const items = [...dialog.current.querySelectorAll('button:not(:disabled),input:not(:disabled)')];
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  };
  const submit = (event) => {
    event.preventDefault();
    if (saving) return;
    if (!Number.isInteger(Number(cycle)) || Number(cycle) < 1 || Number(cycle) > 10000) return setError('保养周期请输入 1–10000 h 的整数。');
    if (warning.trim() === '' || !Number.isInteger(Number(warning)) || Number(warning) < 0 || Number(warning) >= Number(cycle)) return setError('预警工时请输入不小于 0、且小于保养周期的整数。');
    setError(''); setSaving(true);
    timer.current = window.setTimeout(() => {
      setSaving(false);
      if (fail && !retried) { setRetried(true); setError('设置保存失败，请重试。已保留填写内容。'); return; }
      onSave(Number(cycle), Number(warning));
    }, 550);
  };
  return <div className="mp-mask" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
    <section ref={dialog} className="mp-dialog" role="dialog" aria-modal="true" aria-labelledby="mp-dialog-title" tabIndex={-1} onKeyDown={handleKey}>
      <header><h2 id="mp-dialog-title">{rows.length > 1 ? '批量配置策略' : '配置保养策略'}</h2><button type="button" aria-label="关闭策略设置" onClick={onClose} disabled={saving}>×</button></header>
      <form onSubmit={submit} noValidate>
        <div className="mp-form"><p>已选择 <b>{rows.length} 台设备</b></p><div className="mp-selected-names">{rows.map((row) => row.code).join('、')}</div>
          <label>策略类型<span>按工时</span></label>
          <label htmlFor="mp-cycle">保养周期（h）<input id="mp-cycle" type="number" min="1" max="10000" step="1" value={cycle} onChange={(event) => setCycle(event.target.value)} disabled={saving} aria-describedby="mp-strategy-hint mp-strategy-error"/></label>
          <label htmlFor="mp-warning">提前预警（h）<input id="mp-warning" type="number" min="0" step="1" value={warning} onChange={(event) => setWarning(event.target.value)} disabled={saving} aria-describedby="mp-strategy-hint mp-strategy-error"/></label>
          <p id="mp-strategy-hint" className="mp-muted">本次调整周期与预警范围，当前保养目标保持不变；缺少有效数据的设备仍显示“待补充数据”。仅本次原型会话生效。</p>
          <p id="mp-strategy-error" className="mp-form-error" role="alert">{error}</p>
        </div><footer><button type="button" onClick={onClose} disabled={saving}>取消</button><button type="submit" className="mp-primary" disabled={saving}>{saving ? '正在保存…' : error.includes('保存失败') ? '重新保存' : '保存并应用'}</button></footer>
      </form>
    </section>
  </div>;
}

export default function MaintenancePage({ initialStatus = 'all', embedded = false }) {
  const [rows, setRows] = useState(() => createMaintenanceRows());
  const [scenario, setScenario] = useState('normal');
  const [tab, setTab] = useState('list');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [project, setProject] = useState('all');
  const [status, setStatus] = useState(() => {
    const requested = new URLSearchParams(window.location.hash.split('?')[1] || '').get('status');
    return MAINTENANCE_GROUPS.some((group) => group.id === requested) ? requested : initialStatus;
  });
  useEffect(() => {
    const syncStatus = () => {
      const requested = new URLSearchParams(window.location.hash.split('?')[1] || '').get('status');
      setStatus(MAINTENANCE_GROUPS.some((group) => group.id === requested) ? requested : initialStatus);
      setTab('list');
      setSelected([]);
    };
    window.addEventListener('hashchange', syncStatus);
    return () => window.removeEventListener('hashchange', syncStatus);
  }, [initialStatus]);
  const [selected, setSelected] = useState([]);
  const [recordId, setRecordId] = useState(null);
  const [strategyIds, setStrategyIds] = useState(null);
  const [notice, setNotice] = useState('');
  const [updatedAt, setUpdatedAt] = useState('2026-09-07 11:52');
  const listHeading = useRef(null);
  const blocked = ['loading', 'error', 'timeout', 'denied', 'expired'].includes(scenario);
  const accessibleRows = blocked || scenario === 'empty' ? [] : rows;
  const scope = accessibleRows.filter((row) => (!query.trim() || `${row.code} ${row.project}`.toLowerCase().includes(query.trim().toLowerCase())) && (type === 'all' || type === row.type) && (project === 'all' || project === row.project));
  const filtered = scope.filter((row) => status === 'all' || maintenanceStatus(row) === status);
  const activeRecord = accessibleRows.find((row) => row.id === recordId);
  const recordRows = recordId ? activeRecord ? [activeRecord] : [] : scope;
  const history = recordRows.flatMap((row) => row.records.map((record) => ({ ...record, row })));
  const resetFilters = () => { setQuery(''); setType('all'); setProject('all'); setStatus('all'); setSelected([]); };
  const changeScenario = (next) => { setScenario(next); setRows(createMaintenanceRows(next === 'mixed' || next === 'save-error')); setSelected([]); setStrategyIds(null); setNotice(''); setUpdatedAt('2026-09-07 11:52'); };
  const recover = () => { setScenario('normal'); setNotice('演示数据已恢复，原筛选条件已保留。'); };
  const exportRows = () => {
    const cells = tab === 'list' ? [['设备信息', '所属项目', '保养状态', '距下次保养', '配置策略', '上次保养', '当前工况'], ...filtered.map((row) => [row.code, row.project, groupLabel(maintenanceStatus(row)), maintenanceRemaining(row), row.cycle ? `按工时：${row.cycle}h` : '未配置', row.records[0]?.date || '--', row.todayHours === null ? '--' : `${row.todayHours}h`])] : [['设备信息', '保养时间', '保养方式', '保养工时', '保养说明'], ...history.map((item) => [item.row.code, item.date, item.method, item.hours, item.description])];
    const csv = '\uFEFF' + cells.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = tab === 'list' ? '设备保养清单.csv' : '设备保养记录.csv'; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`已导出当前筛选的 ${cells.length - 1} 条${tab === 'list' ? '设备' : '保养记录'}。`);
  };
  return <div className="ref-page mp-page">
    {!embedded && <header className="ref-page-title"><h1>设备保养</h1><span>最近更新：{blocked ? '--' : updatedAt}</span></header>}
    <section className="mp-list-panel">
      <div className="ref-tabs" role="tablist" aria-label="设备保养视图"><button type="button" role="tab" aria-selected={tab === 'list'} className={tab === 'list' ? 'is-active' : ''} onClick={() => setTab('list')}>设备保养清单</button><button type="button" role="tab" aria-selected={tab === 'records'} className={tab === 'records' ? 'is-active' : ''} onClick={() => { setTab('records'); setRecordId(null); }}>设备保养记录</button></div>
      <div className="mp-list-body">
        <div className="mp-filters"><input aria-label="搜索设备编号或项目名称" placeholder="搜索设备编号 / 项目名称" maxLength={100} value={query} onChange={(event) => { setQuery(event.target.value); setSelected([]); }} disabled={blocked}/>
          <select aria-label="设备种类" value={type} onChange={(event) => { setType(event.target.value); setSelected([]); }} disabled={blocked}><option value="all">全部设备种类</option>{[...new Set(accessibleRows.map((row) => row.type))].map((value) => <option key={value}>{value}</option>)}</select>
          {tab === 'list' && <select aria-label="保养状态" value={status} onChange={(event) => { setStatus(event.target.value); setSelected([]); }} disabled={blocked}><option value="all">全部保养状态</option>{MAINTENANCE_GROUPS.map((group) => <option key={group.id} value={group.id}>{group.label}</option>)}</select>}
          <select aria-label="所属项目" value={project} onChange={(event) => { setProject(event.target.value); setSelected([]); }} disabled={blocked}><option value="all">全部所属项目</option>{[...new Set(accessibleRows.map((row) => row.project))].map((value) => <option key={value}>{value}</option>)}</select>
          <button type="button" onClick={resetFilters}>重置</button><span className="mp-spacer"/>
          {tab === 'list' && <button type="button" disabled={blocked || !selected.length} onClick={() => setStrategyIds(selected)}>批量配置策略{selected.length > 0 ? `（${selected.length}）` : ''}</button>}
          <button type="button" onClick={exportRows} disabled={blocked || !(tab === 'list' ? filtered.length : history.length)}>导出</button>
        </div>
        <div className="mp-list-caption"><h3 ref={listHeading} tabIndex={-1}>{tab === 'list' ? `${status === 'all' ? '全部保养设备' : groupLabel(status)} · ${blocked ? '--' : filtered.length} 台` : `${recordId && activeRecord ? activeRecord.code + ' · ' : ''}保养记录 · ${history.length} 条`}</h3>
          {tab === 'list' && status !== 'all' && <button type="button" onClick={() => { setStatus('all'); setSelected([]); }}>清除状态筛选 ×</button>}
          {tab === 'records' && recordId && <button type="button" onClick={() => setTab('list')}>返回设备保养清单</button>}
        </div>
        {blocked ? <div className="mp-state" role="status"><span className="mp-state-symbol" aria-hidden="true">{scenario === 'loading' ? '◌' : '!'}</span><h3>{({ loading: '正在加载保养数据…', error: '保养数据暂时无法加载', timeout: '加载时间较长，请重试', denied: '暂无访问权限', expired: '登录状态已失效' })[scenario]}</h3><p>{scenario === 'denied' ? '当前账号无法查看设备保养数据，请联系管理员。' : scenario === 'expired' ? '请重新登录后继续查看，当前筛选条件已保留。' : '当前筛选条件已保留，其他业务页面仍可访问。'}</p><button type="button" onClick={recover}>{scenario === 'loading' ? '完成加载（演示）' : ['denied', 'expired'].includes(scenario) ? '恢复访问（演示）' : '重新加载'}</button></div> : tab === 'list' ? filtered.length ? <div className="mp-table-scroll"><table className="mp-table"><thead><tr><th><input type="checkbox" aria-label="选择当前列表全部设备" checked={filtered.length > 0 && filtered.every((row) => selected.includes(row.id))} onChange={(event) => setSelected(event.target.checked ? filtered.map((row) => row.id) : [])}/></th>{['设备信息', '所属项目', '保养状态', '距下次保养', '配置策略', '上次保养', '当前工况', '操作'].map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{filtered.map((row) => <tr key={row.id}>
          <td><input type="checkbox" aria-label={`选择 ${row.code}`} checked={selected.includes(row.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, row.id] : selected.filter((id) => id !== row.id))}/></td>
          <td><strong>{row.code}</strong><small>{row.type}</small></td><td className="mp-project-cell">{row.project}</td><td><span className={`mp-status mp-${MAINTENANCE_GROUPS.find((group) => group.id === maintenanceStatus(row)).tone}`}>{groupLabel(maintenanceStatus(row))}</span></td>
          <td><strong className={maintenanceStatus(row) === 'overdue' ? 'mp-text-danger' : ''}>{maintenanceRemaining(row)}</strong><small>{row.target === null ? '目标工时：--' : `目标工时：${row.target.toFixed(1)} h`}</small></td>
          <td>{row.cycle ? `按工时：${row.cycle} h` : '--'}<small>{row.cycle ? `提前 ${row.warning} h 预警` : '配置后可跟踪保养'}</small></td><td>{row.records.length ? <><span>{row.records[0].method} · {row.records[0].hours} h</span><small>{row.records[0].date}</small></> : <span className="mp-muted">暂无保养记录</span>}</td><td>{row.todayHours === null ? '--' : `${row.todayHours} h`}<small>今日工时</small></td><td><div className="mp-row-actions"><button type="button" onClick={() => { setRecordId(row.id); setTab('records'); }}>查看保养记录</button><button type="button" onClick={() => setStrategyIds([row.id])}>配置策略</button></div></td>
        </tr>)}</tbody></table></div> : <div className="mp-state"><span className="mp-state-symbol" aria-hidden="true">⌕</span><h3>{scenario === 'empty' ? '暂无设备保养数据' : query.trim() ? '未找到匹配设备' : '当前条件下暂无设备'}</h3><p>{query.trim() ? `没有找到与“${query.trim()}”匹配的设备，可修改关键词或清除筛选。` : '有符合条件的设备后将在这里展示；数据为空不代表加载失败。'}</p><button type="button" onClick={resetFilters}>清除全部筛选</button></div> : history.length ? <div className="mp-table-scroll"><table className="mp-table mp-history"><thead><tr>{['设备信息', '所属项目', '保养时间', '保养方式', '保养工时', '保养说明'].map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{history.map((item) => <tr key={`${item.row.id}-${item.date}`}><td>{item.row.code}</td><td>{item.row.project}</td><td>{item.date}</td><td>{item.method}</td><td>{item.hours} h</td><td>{item.description}</td></tr>)}</tbody></table></div> : <div className="mp-state"><span className="mp-state-symbol" aria-hidden="true">▤</span><h3>{recordId && !activeRecord ? '设备已不可用' : recordId ? '该设备暂无保养记录' : '当前范围暂无保养记录'}</h3><p>保养策略与已完成的保养记录分别展示，配置策略不会产生保养记录。</p><button type="button" onClick={() => setTab('list')}>返回设备保养清单</button></div>}
        <footer className="mp-table-footer">{blocked ? '等待数据恢复' : `共 ${tab === 'list' ? filtered.length + ' 台设备' : history.length + ' 条保养记录'}`}<span>已展示全部结果</span></footer>
      </div>
    </section>
    <details className="mp-demo"><summary>原型场景与口径说明</summary><div><label>演示场景 <select value={scenario} onChange={(event) => changeScenario(event.target.value)}>{SCENARIOS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><p>默认保留原清单样例；多状态样例用于验收逾期、临期、缺少数据和未配置策略。预警 50h 为待确认假设。所有操作仅在当前原型会话生效，刷新会恢复原样例。</p></div></details>
    {notice && <div className="mp-notice" role="status">{notice}<button type="button" aria-label="关闭提示" onClick={() => setNotice('')}>×</button></div>}
    {strategyIds && <StrategyDialog rows={rows.filter((row) => strategyIds.includes(row.id))} fail={scenario === 'save-error'} onClose={() => setStrategyIds(null)} onSave={(cycle, warning) => { setRows(rows.map((row) => strategyIds.includes(row.id) ? { ...row, cycle, warning } : row)); setNotice(`已更新 ${strategyIds.length} 台设备的保养策略（本地演示）。`); setUpdatedAt(new Date().toLocaleString('zh-CN', { hour12: false })); setStrategyIds(null); setSelected([]); }}/ >}
  </div>;
}

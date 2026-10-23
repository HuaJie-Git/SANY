import { useQuickLinkDialog } from './useQuickLinkDialog';
import React, { useEffect, useMemo, useState } from 'react';
import { QUICK_LINKS_KEY, PREVIEW_TENANTS, PREVIEW_USERS, audienceLabel, readQuickLinks, sortLinks } from '../../admin/quickLinks';
import { LINK_ROLES, LINK_TYPES, linkTypeValue, validateQuickLinkScope, productGroupLabel, resolveLinkLocale } from '../../admin/quickLinkRules';
import QuickLinkDialog from './QuickLinkDialog';
import QuickLinkIcon from './QuickLinkIcon';
import './quick-links.css';

function DeleteDialog({ row, onClose, onConfirm, error, onReload }) {
  const root = useQuickLinkDialog(onClose);
  return <div className="ql-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="ql-delete-modal" ref={root} role="alertdialog" aria-modal="true" aria-labelledby="ql-delete-title"><header className="ql-dialog-header"><h2 id="ql-delete-title">删除快速链接</h2><button className="ql-close" type="button" aria-label="关闭删除确认" onClick={onClose}>×</button></header><div className="ql-delete-body"><p>确定删除“<strong>{row.name}</strong>”吗？</p><p className="ql-hint">删除后，该入口将从 PC 工作台与个人配置中移除。此操作无法撤销。</p>{error && <p className="ql-error" role="alert">{error}{error.includes('其他页面更新') && <button className="ql-text-btn" type="button" onClick={onReload}>刷新列表</button>}</p>}</div><footer className="ql-dialog-footer"><span/><div className="ql-inline"><button className="ql-btn" type="button" onClick={onClose}>取消</button><button className="ql-btn is-danger" type="button" onClick={onConfirm}>确认删除</button></div></footer></section></div>;
}
export default function QuickLinkSettings() {
  const [rows, setRows] = useState([]);
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [message, setMessage] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [filter, setFilter] = useState({ keyword: '', status: 'all', type: 'all' });
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const reload = () => {
    setLoading(true);
    try { const catalog = readQuickLinks(); setRows(catalog.links); setRevision(catalog.revision); setLoadError(false); setMessage(null); }
    catch { setLoadError(true); setMessage({ type: 'error', text: '配置读取失败，请重试。' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);
  const visibleRows = useMemo(() => rows.filter((row) => {
    const query = filter.keyword.trim().toLowerCase();
    return (!query || `${row.name} ${row.enName} ${row.url} ${Object.values(row.translations).join(' ')}`.toLowerCase().includes(query)) && (filter.status === 'all' || row.enabled === (filter.status === 'on')) && (filter.type === 'all' || linkTypeValue(row) === filter.type);
  }), [rows, filter]);
  const commit = (nextRows, success) => {
    try {
      if (readQuickLinks().revision !== revision) { setMessage({ type: 'error', text: '配置已在其他页面更新。请刷新列表后重试，当前弹窗内容仍保留。' }); return false; }
      const changedEnabled = nextRows.filter((row) => row.enabled && JSON.stringify(row) !== JSON.stringify(rows.find((previous) => previous.id === row.id)));
      for (const row of changedEnabled) {
        const error = Object.values(validateQuickLinkScope(row, PREVIEW_TENANTS, PREVIEW_USERS))[0];
        if (error) { setMessage({ type: 'error', text: `“${row.name}”：${error}。请编辑调整后再开启。` }); return false; }
      }
      const nextRevision = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const links = sortLinks(nextRows);
      window.localStorage.setItem(QUICK_LINKS_KEY, JSON.stringify({ revision: nextRevision, links }));
      setRows(links); setRevision(nextRevision); setMessage({ type: 'success', text: success }); return true;
    } catch { setMessage({ type: 'error', text: '保存失败，当前配置未改变，请重试。' }); return false; }
  };
  const saveDialog = (form) => {
    const next = editing ? rows.map((row) => row.id === editing.id ? { ...row, ...form } : row) : [...rows, { ...form, icon: 'link', tone: 'blue', id: `custom-${crypto.randomUUID()}`, action: 'external', builtIn: false, createdAt: new Date().toLocaleString('zh-CN', { hour12: false }) }];
    const success = commit(next, editing ? '链接配置已更新。' : '链接已新增，符合展示条件的用户可在 PC 工作台查看。');
    if (success) setEditing(undefined);
    return success;
  };
  const remove = () => { if (deleting && commit(rows.filter((row) => row.id !== deleting.id), '快速链接已删除。')) setDeleting(null); };
  const reset = () => { setKeyword(''); setStatus('all'); setType('all'); setFilter({ keyword: '', status: 'all', type: 'all' }); };
  return <main className="ql-page">
    <header className="ql-page-header"><h1>PC 快速链接</h1><button type="button" className="ql-btn is-primary" disabled={loading || loadError} onClick={() => { setMessage(null); setEditing(null); }}><span aria-hidden="true">＋</span> 新增链接</button></header>
    <form className="ql-filters" onSubmit={(event) => { event.preventDefault(); setFilter({ keyword, status, type }); }}><div className="ql-search-field"><label htmlFor="quick-link-keyword">链接名称 / 地址</label><input id="quick-link-keyword" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索名称或访问地址"/></div><div><label htmlFor="quick-link-type">链接类型</label><select id="quick-link-type" value={type} onChange={(event) => setType(event.target.value)}><option value="all">全部类型</option>{LINK_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div><div><label htmlFor="quick-link-status">状态</label><select id="quick-link-status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">全部状态</option><option value="on">开启</option><option value="off">关闭</option></select></div><div className="ql-inline"><button type="button" className="ql-btn" onClick={reset}>重置</button><button type="submit" className="ql-btn is-primary">查询</button></div></form>
    {message && <div role={message.type === 'error' ? 'alert' : 'status'} className={`ql-message ${message.type === 'error' ? 'is-error' : 'is-success'}`}>{message.text}{message.type === 'error' && message.text.includes('其他页面更新') && <button type="button" className="ql-text-btn" onClick={reload}>刷新列表</button>}</div>}
    <section className="ql-table-panel" aria-label="快速链接列表"><div className="ql-table-heading"><h2>链接配置</h2><span>按排序号升序展示</span></div><div className="ql-table-scroll"><table className="ql-table"><thead><tr>{['排序', '链接名称', '跳转方式', '展示范围', '状态', '操作'].map((title) => <th key={title}>{title}</th>)}</tr></thead><tbody>
      {loading ? <tr><td colSpan={6} className="ql-empty">正在加载快速链接…</td></tr> : loadError ? <tr><td colSpan={6} className="ql-empty">配置暂时无法读取 <button type="button" className="ql-text-btn" onClick={reload}>重试</button></td></tr> : visibleRows.length ? visibleRows.map((row) => <tr key={row.id}><td className="ql-sort-cell">{row.sort}</td><td><div className="ql-name-cell"><span className="ql-row-icon">{resolveLinkLocale(row).iconData ? <img src={resolveLinkLocale(row).iconData} alt=""/> : <QuickLinkIcon name={row.icon} size={20}/>}</span><div><strong dir="auto">{row.name}{row.showBadge && <small className="ql-new-badge">NEW</small>}</strong><small dir="auto">{row.enName}</small><span>{row.defaultVisible === false ? '默认隐藏' : '默认显示'}{row.proOnly ? ' · Pro' : ''}</span></div></div></td><td><div className="ql-cell-stack"><strong>{LINK_TYPES.find((type) => type.value === linkTypeValue(row))?.label}</strong><span className="ql-url" dir="ltr" title={row.url}>{row.url}</span></div></td><td><div className="ql-cell-stack"><strong>{audienceLabel(row)}</strong><span>{productGroupLabel(row)}</span>{row.roleIds.length > 0 && <span>{row.roleIds.map((id) => LINK_ROLES.find((role) => role.id === id)?.name || '已失效角色').join('、')}</span>}</div></td><td><span className={`ql-status${row.enabled ? ' is-on' : ''}`}><i/>{row.enabled ? '开启' : '关闭'}</span></td><td><div className="ql-row-actions"><button type="button" onClick={() => { setMessage(null); setEditing(row); }}>编辑</button><button type="button" onClick={() => commit(rows.map((item) => item.id === row.id ? { ...item, enabled: !item.enabled } : item), row.enabled ? '入口已关闭。' : '入口已开启。')}>{row.enabled ? '关闭' : '开启'}</button><button type="button" className="is-danger" onClick={() => { setMessage(null); setDeleting(row); }}>删除</button></div></td></tr>) : <tr><td colSpan={6} className="ql-empty">{rows.length ? '暂无符合条件的链接' : '暂无快速链接，点击“新增链接”创建入口'}{rows.length > 0 && <button type="button" className="ql-text-btn" onClick={reset}>清空筛选</button>}</td></tr>}
    </tbody></table></div><footer className="ql-table-footer"><span>共 {visibleRows.length} 条链接</span></footer></section>
    {editing !== undefined && <QuickLinkDialog record={editing} rows={rows} onClose={() => setEditing(undefined)} onSave={saveDialog} saveError={message?.type === 'error' ? message.text : ''} onReload={() => { setEditing(undefined); reload(); }}/>}
    {deleting && <DeleteDialog row={deleting} onClose={() => setDeleting(null)} onConfirm={remove} error={message?.type === 'error' ? message.text : ''} onReload={() => { setDeleting(null); reload(); }}/>}
  </main>;
}

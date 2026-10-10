import React, { useEffect, useMemo, useState } from 'react';
import { QUICK_LINKS_KEY, audienceLabel, readQuickLinks, sortLinks } from '../../admin/quickLinks';
import QuickLinkDialog from './QuickLinkDialog';
import QuickLinkIcon from './QuickLinkIcon';

export default function QuickLinkSettings() {
  const [rows, setRows] = useState([]);
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [message, setMessage] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [filter, setFilter] = useState({ keyword: '', status: 'all' });
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);

  const reload = () => {
    setLoading(true);
    try {
      const catalog = readQuickLinks();
      setRows(catalog.links);
      setRevision(catalog.revision);
      setLoadError(false);
      setMessage(null);
    } catch {
      setLoadError(true);
      setMessage({ type: 'error', text: '配置读取失败，请重试。' });
    } finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const visibleRows = useMemo(() => rows.filter((row) => {
    const query = filter.keyword.trim().toLowerCase();
    return (!query || `${row.name} ${row.url}`.toLowerCase().includes(query)) && (filter.status === 'all' || row.enabled === (filter.status === 'on'));
  }), [rows, filter]);

  const commit = (nextRows, success) => {
    try {
      if (readQuickLinks().revision !== revision) {
        setMessage({ type: 'error', text: '配置已在其他页面更新。请刷新列表后重试，当前弹窗内容仍保留。' });
        return false;
      }
      const nextRevision = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const links = sortLinks(nextRows);
      window.localStorage.setItem(QUICK_LINKS_KEY, JSON.stringify({ revision: nextRevision, links }));
      setRows(links);
      setRevision(nextRevision);
      setMessage({ type: 'success', text: success });
      return true;
    } catch {
      setMessage({ type: 'error', text: '保存失败，当前配置未改变，请重试。' });
      return false;
    }
  };

  const saveDialog = (form) => {
    const next = editing
      ? rows.map((row) => row.id === editing.id ? { ...row, ...form } : row)
      : [...rows, { ...form, icon: 'link', tone: 'blue', id: `custom-${crypto.randomUUID()}`, action: 'external', builtIn: false, createdAt: new Date().toLocaleString('zh-CN', { hour12: false }) }];
    if (commit(next, editing ? '快速链接已更新。' : '快速链接已新增，PC 首页将显示开启的链接。')) setEditing(undefined);
  };
  const toggle = (row) => { commit(rows.map((item) => item.id === row.id ? { ...item, enabled: !item.enabled } : item), row.enabled ? '快速链接已关闭。' : '快速链接已开启。'); };
  const remove = () => {
    if (!deleting) return;
    if (commit(rows.filter((row) => row.id !== deleting.id), '快速链接已删除。')) setDeleting(null);
  };

  return <div className="p-6 text-gray-800">
    <h1 className="text-[18px] font-semibold text-gray-900 mb-5">PC 快速链接配置</h1>
    <div className="bg-white rounded-lg p-4 mb-4 flex flex-wrap items-end gap-4">
      <div><label htmlFor="quick-link-keyword" className="block text-[13px] text-gray-600 mb-1">链接名称或地址：</label><input id="quick-link-keyword" value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') setFilter({ keyword, status }); }} className="h-8 w-[240px] max-w-full px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]" placeholder="请输入关键词"/></div>
      <div><label htmlFor="quick-link-status" className="block text-[13px] text-gray-600 mb-1">状态：</label><select id="quick-link-status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-8 w-[130px] px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]"><option value="all">全部</option><option value="on">开启</option><option value="off">关闭</option></select></div>
      <div className="flex gap-2 ml-auto"><button type="button" className="h-8 px-4 border border-gray-300 rounded text-[13px] text-gray-600 hover:bg-gray-50" onClick={() => { setKeyword(''); setStatus('all'); setFilter({ keyword: '', status: 'all' }); }}>重置</button><button type="button" className="h-8 px-4 bg-[#1890ff] text-white rounded text-[13px] hover:bg-[#40a9ff]" onClick={() => setFilter({ keyword, status })}>查询</button></div>
    </div>
    <div className="flex justify-end mb-3"><button type="button" className="h-9 px-5 bg-[#1890ff] text-white rounded text-[13px] font-medium hover:bg-[#40a9ff] flex items-center gap-1.5" onClick={() => { setMessage(null); setEditing(null); }}><span className="text-[17px] leading-none">+</span> 新增</button></div>
    {message && <div role="status" className={`mb-3 px-4 py-2 rounded border text-[13px] ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>{message.text}{message.type === 'error' && message.text.includes('其他页面更新') && <button type="button" className="ml-3 underline" onClick={reload}>刷新列表</button>}</div>}
    <div className="bg-white rounded-lg overflow-x-auto">
      <table className="w-full min-w-[1050px] text-[13px]">
        <thead><tr className="bg-gray-50 border-b border-gray-200">{['序号', '排序', '链接名称', '访问地址', '可见范围', '状态', '创建时间', '操作'].map((title) => <th key={title} className="px-4 py-3 text-left font-medium text-gray-600">{title}</th>)}</tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">正在加载快速链接…</td></tr> : loadError ? <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">配置暂时无法读取 <button type="button" className="text-[#1890ff] ml-2" onClick={reload}>重试</button></td></tr> : visibleRows.length ? visibleRows.map((row, index) => <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50">
            <td className="px-4 py-3 text-gray-500">{index + 1}</td><td className="px-4 py-3 text-gray-700">{row.sort}</td>
            <td className="px-4 py-3 text-gray-900 font-medium max-w-[230px]"><div className="flex items-center gap-2"><span className="w-7 h-7 shrink-0 rounded bg-blue-50 text-[#1890ff] grid place-items-center overflow-hidden">{row.iconData ? <img src={row.iconData} alt="" className="w-full h-full object-contain"/> : <QuickLinkIcon name={row.icon} size={16}/>}</span><span className="min-w-0 break-words" dir="auto">{row.name}</span></div></td>
            <td className="px-4 py-3 text-gray-600 max-w-[440px]"><div className="max-w-[440px] truncate" dir="ltr" title={row.url}>{row.url || '--'}</div></td>
            <td className="px-4 py-3 text-gray-700 max-w-[210px] break-words" title={audienceLabel(row)}>{audienceLabel(row)}</td>
            <td className="px-4 py-3"><span className={`text-[12px] ${row.enabled ? 'text-green-600' : 'text-gray-400'}`}>{row.enabled ? '开启' : '关闭'}</span></td><td className="px-4 py-3 text-gray-500 text-[12px] whitespace-nowrap">{row.createdAt}</td>
            <td className="px-4 py-3 whitespace-nowrap"><div className="flex items-center gap-2"><button type="button" className="text-[#1890ff] text-[12px] hover:underline" onClick={() => { setMessage(null); setEditing(row); }}>编辑</button><button type="button" className={`text-[12px] hover:underline ${row.enabled ? 'text-orange-500' : 'text-green-500'}`} onClick={() => toggle(row)}>{row.enabled ? '关闭' : '开启'}</button>{!row.builtIn && <button type="button" className="text-red-500 text-[12px] hover:underline" onClick={() => { setMessage(null); setDeleting(row); }}>删除</button>}</div></td>
          </tr>) : <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">暂无符合条件的快速链接</td></tr>}
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-between mt-4 text-[13px] text-gray-500"><span>共 {visibleRows.length} 条</span><span className="px-2 py-1 bg-[#1890ff] text-white rounded text-[12px]">1</span></div>
    {editing !== undefined && <QuickLinkDialog record={editing} rows={rows} onClose={() => setEditing(undefined)} onSave={saveDialog} saveError={message?.type === 'error' ? message.text : ''} onReload={() => { setEditing(undefined); reload(); }}/>}
    {deleting && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4"><div className="bg-white rounded-xl w-[440px] max-w-full shadow-2xl" role="alertdialog" aria-modal="true" aria-label="删除快速链接"><div className="px-6 py-4 border-b border-gray-100 text-[16px] font-semibold">删除快速链接</div><p className="px-6 pt-5 pb-3 text-[13px] text-gray-700 leading-6">确定删除“{deleting.name}”吗？删除后 PC 工作台将不再显示该入口。</p>{message?.type === 'error' && <div role="alert" className="mx-6 mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-xs">{message.text}{message.text.includes('其他页面更新') && <button type="button" className="ml-2 underline" onClick={() => { setDeleting(null); reload(); }}>刷新列表</button>}</div>}<div className="px-6 py-3 border-t border-gray-100 flex justify-end gap-3"><button type="button" className="h-9 px-6 border border-gray-300 rounded text-gray-600 text-[14px]" onClick={() => setDeleting(null)}>取消</button><button type="button" className="h-9 px-6 bg-red-500 text-white rounded text-[14px]" onClick={remove}>删除</button></div></div></div>}
  </div>;
}

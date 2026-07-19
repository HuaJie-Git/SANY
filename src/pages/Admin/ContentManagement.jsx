import React, { useState, useMemo } from 'react';
import { getContentItems, softDeleteContent, DELETE_REASONS } from '../../admin/adminContent';
import OfficialPublishDialog from './OfficialPublishDialog';
import ExportDialog from './ExportDialog';

const ContentManagement = () => {
  const [items, setItems] = useState(() => getContentItems());
  const [filterCode, setFilterCode] = useState('');
  const [filterSender, setFilterSender] = useState('');
  const [filterContent, setFilterContent] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showOfficialDialog, setShowOfficialDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleteReasonType, setDeleteReasonType] = useState('');
  const [deleteReasonExtra, setDeleteReasonExtra] = useState('');

  const refresh = () => setItems([...getContentItems()]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filterCode && !item.topicCode.toLowerCase().includes(filterCode.toLowerCase())) return false;
      if (filterSender && item.sender !== filterSender) return false;
      if (filterContent && !item.content.toLowerCase().includes(filterContent.toLowerCase())) return false;
      if (filterDateStart && item.date < filterDateStart) return false;
      if (filterDateEnd && item.date > filterDateEnd) return false;
      if (filterStatus && item.deleteStatus !== filterStatus) return false;
      return true;
    });
  }, [items, filterCode, filterSender, filterContent, filterDateStart, filterDateEnd, filterStatus]);

  const handleReset = () => {
    setFilterCode(''); setFilterSender(''); setFilterContent('');
    setFilterDateStart(''); setFilterDateEnd(''); setFilterStatus('');
  };

  // 打开删除弹窗
  const handleDeleteClick = (item) => {
    setDeleteDialog(item);
    setDeleteReasonType('');
    setDeleteReasonExtra('');
  };

  // 确认删除
  const handleDeleteConfirm = () => {
    if (!deleteReasonType) return;
    const fullReason = deleteReasonType + (deleteReasonExtra.trim() ? `：${deleteReasonExtra.trim()}` : '');
    softDeleteContent(deleteDialog.id, '管理员', fullReason);
    setDeleteDialog(null);
    refresh();
  };

  const getDeleteStatusStyle = (status) => {
    if (status === '删除') return 'bg-red-100 text-red-600';
    if (status === '被删除') return 'bg-orange-100 text-orange-600';
    return 'bg-green-100 text-green-600';
  };

  return (
    <div className="p-6">
      <h1 className="text-[18px] font-semibold text-gray-900 mb-5">内容管理</h1>

      {/* 筛选行 */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-[13px] text-gray-600 whitespace-nowrap">话题编码：</label>
            <input type="text" value={filterCode} onChange={(e) => setFilterCode(e.target.value)} className="h-8 px-3 border border-gray-300 rounded text-[13px] w-[120px] focus:outline-none focus:border-[#1890ff]" placeholder="请输入" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[13px] text-gray-600 whitespace-nowrap">发送方：</label>
            <select value={filterSender} onChange={(e) => setFilterSender(e.target.value)} className="h-8 px-3 border border-gray-300 rounded text-[13px] w-[100px] focus:outline-none focus:border-[#1890ff]">
              <option value="">全部</option><option value="用户">用户</option><option value="官方">官方</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[13px] text-gray-600 whitespace-nowrap">内容：</label>
            <input type="text" value={filterContent} onChange={(e) => setFilterContent(e.target.value)} className="h-8 px-3 border border-gray-300 rounded text-[13px] w-[120px] focus:outline-none focus:border-[#1890ff]" placeholder="请输入" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[13px] text-gray-600 whitespace-nowrap">发送时间：</label>
            <input type="date" value={filterDateStart} onChange={(e) => setFilterDateStart(e.target.value)} className="h-8 px-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]" />
            <span className="text-gray-400 text-[12px]">~</span>
            <input type="date" value={filterDateEnd} onChange={(e) => setFilterDateEnd(e.target.value)} className="h-8 px-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[13px] text-gray-600 whitespace-nowrap">状态：</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-8 px-3 border border-gray-300 rounded text-[13px] w-[100px] focus:outline-none focus:border-[#1890ff]">
              <option value="">全部</option><option value="正常">正常</option><option value="删除">删除</option><option value="被删除">被删除</option>
            </select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="h-8 px-4 border border-gray-300 rounded text-[13px] text-gray-600 hover:bg-gray-50" onClick={handleReset}>重置</button>
            <button className="h-8 px-4 bg-[#1890ff] text-white rounded text-[13px] hover:bg-[#40a9ff]">查询</button>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-2 mb-3">
        <button className="h-9 px-4 border border-gray-300 rounded text-[13px] text-gray-600 hover:bg-gray-50 flex items-center gap-1" onClick={() => setShowExportDialog(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>导出
        </button>
        <button className="h-9 px-4 bg-[#1890ff] text-white rounded text-[13px] font-medium hover:bg-[#40a9ff] flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>新增
        </button>
        <button className="h-9 px-5 bg-[#ff4d4f] text-white rounded text-[13px] font-medium hover:bg-[#ff7875] flex items-center gap-1.5 shadow-sm" onClick={() => setShowOfficialDialog(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>官方发布
        </button>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-3 text-left font-medium text-gray-600 w-[40px]">序号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">话题编码</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">话题</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">发送方</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">内容</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">浏览量</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">点赞数</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">评论数</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">发送人</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">联系方式</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600 w-[80px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="px-3 py-2.5 text-gray-500">{idx + 1}</td>
                <td className="px-3 py-2.5 text-gray-700 font-mono text-[12px] truncate max-w-[110px]">{item.topicCode}</td>
                <td className="px-3 py-2.5 text-gray-700 truncate max-w-[100px]">{item.topicName}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-[12px] px-1.5 py-0.5 rounded ${item.sender === '官方' ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-600'}`}>{item.sender}</span>
                </td>
                <td className="px-3 py-2.5 text-gray-700 truncate max-w-[130px]">{item.content}</td>
                <td className="px-3 py-2.5 text-gray-600">{item.views}</td>
                <td className="px-3 py-2.5 text-gray-600">{item.likes}</td>
                <td className="px-3 py-2.5 text-gray-600">{item.commentCount}</td>
                <td className="px-3 py-2.5 text-gray-700 truncate max-w-[90px]">{item.senderName}</td>
                <td className="px-3 py-2.5 text-gray-500 text-[12px] truncate max-w-[110px]">{item.contact}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-[11px] px-1.5 py-0.5 rounded ${getDeleteStatusStyle(item.deleteStatus)}`}>{item.deleteStatus}</span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <button className="text-[#1890ff] text-[12px] hover:underline" onClick={() => setDetailItem(item)}>详情</button>
                    {item.deleteStatus === '正常' && (
                      <button className="text-red-500 text-[12px] hover:underline" onClick={() => handleDeleteClick(item)}>删除</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={12} className="px-4 py-12 text-center text-gray-400">暂无数据</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4 text-[13px] text-gray-500">
        <span>共 {filtered.length} 条</span>
        <div className="flex items-center gap-1"><span className="px-2 py-1 bg-[#1890ff] text-white rounded text-[12px]">1</span></div>
      </div>

      {/* ─── 删除确认弹窗 ─── */}
      {deleteDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45" onClick={() => setDeleteDialog(null)}>
          <div className="bg-white rounded-xl w-[500px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-[16px] font-semibold text-gray-900">确认删除</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-50 rounded p-3 text-[13px]">
                <div className="text-gray-700">内容：{deleteDialog.content}</div>
                <div className="text-gray-500 text-[12px]">发送人：{deleteDialog.senderName} | 话题：{deleteDialog.topicName}</div>
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-2"><span className="text-red-500">*</span> 删除原因</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {DELETE_REASONS.map((r) => (
                    <button key={r} type="button" className={`h-7 px-3 rounded text-[12px] border transition-colors ${deleteReasonType === r ? 'bg-[#1890ff] text-white border-[#1890ff]' : 'border-gray-300 text-gray-600 hover:border-[#1890ff]'}`} onClick={() => setDeleteReasonType(r)}>
                      {r}
                    </button>
                  ))}
                </div>
                <textarea value={deleteReasonExtra} onChange={(e) => setDeleteReasonExtra(e.target.value)} rows={2} maxLength={200} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] resize-none focus:outline-none focus:border-[#1890ff]" placeholder="补充说明（选填）" />
                <div className="text-[11px] text-gray-400 mt-0.5">
                  完整原因：{deleteReasonType}{deleteReasonExtra ? `：${deleteReasonExtra}` : '(无补充)'}（{((deleteReasonType + (deleteReasonExtra ? `：${deleteReasonExtra}` : '')).length)}/200）
                </div>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-3">
              <button className="h-9 px-6 border border-gray-300 rounded text-[14px] text-gray-600 hover:bg-gray-50" onClick={() => setDeleteDialog(null)}>取消</button>
              <button className="h-9 px-6 bg-red-500 text-white rounded text-[14px] font-medium hover:bg-red-600" onClick={handleDeleteConfirm} disabled={!deleteReasonType}>确认删除</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 详情弹窗 ─── */}
      {detailItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45" onClick={() => setDetailItem(null)}>
          <div className="bg-white rounded-xl w-[600px] max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-gray-900">内容详情</h3>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setDetailItem(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 text-[13px]">
              {detailItem.image && <div><span className="text-gray-500 block mb-1">封面</span><img src={detailItem.image} alt="" className="w-[200px] h-[120px] object-cover rounded" /></div>}
              <div className="flex"><span className="w-[80px] text-gray-500 flex-shrink-0">话题编码</span><span className="text-gray-900 font-mono">{detailItem.topicCode}</span></div>
              <div className="flex"><span className="w-[80px] text-gray-500 flex-shrink-0">话题</span><span className="text-gray-900">{detailItem.topicName}</span></div>
              <div className="flex"><span className="w-[80px] text-gray-500 flex-shrink-0">发送方</span><span className={detailItem.sender === '官方' ? 'text-red-600 font-medium' : 'text-gray-900'}>{detailItem.sender}</span></div>
              <div className="flex"><span className="w-[80px] text-gray-500 flex-shrink-0">内容</span><span className="text-gray-900">{detailItem.content}</span></div>
              <div className="flex gap-6"><span>浏览 {detailItem.views}</span><span>点赞 {detailItem.likes}</span><span>评论 {detailItem.commentCount}</span></div>
              <div className="flex"><span className="w-[80px] text-gray-500 flex-shrink-0">发送人</span><span className="text-gray-900">{detailItem.senderName}</span></div>
              <div className="flex"><span className="w-[80px] text-gray-500 flex-shrink-0">联系方式</span><span className="text-gray-900">{detailItem.contact}</span></div>
              <div className="flex"><span className="w-[80px] text-gray-500 flex-shrink-0">发送时间</span><span className="text-gray-900">{detailItem.date}</span></div>
              <hr className="border-gray-100" />
              <div className="text-[14px] font-medium text-gray-900">删除记录</div>
              <div className="flex"><span className="w-[80px] text-gray-500 flex-shrink-0">删除状态</span>
                <span className={`text-[12px] px-1.5 py-0.5 rounded ${getDeleteStatusStyle(detailItem.deleteStatus)}`}>{detailItem.deleteStatus}</span>
              </div>
              {detailItem.deleteStatus !== '正常' ? (
                <>
                  <div className="flex"><span className="w-[80px] text-gray-500 flex-shrink-0">删除原因</span><span className="text-gray-900">{detailItem.deleteReason || '—'}</span></div>
                  <div className="flex"><span className="w-[80px] text-gray-500 flex-shrink-0">删除时间</span><span className="text-gray-900">{detailItem.deleteTime || '—'}</span></div>
                  <div className="flex"><span className="w-[80px] text-gray-500 flex-shrink-0">操作人</span><span className="text-gray-900">{detailItem.deleter || '—'}</span></div>
                </>
              ) : (
                <div className="text-[13px] text-gray-400">未删除</div>
              )}
            </div>
            <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
              <button className="h-9 px-6 bg-[#1890ff] text-white rounded text-[14px] hover:bg-[#40a9ff]" onClick={() => setDetailItem(null)}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {showOfficialDialog && <OfficialPublishDialog onClose={() => setShowOfficialDialog(false)} onSuccess={() => { refresh(); setShowOfficialDialog(false); }} />}
      {showExportDialog && <ExportDialog onExport={({ dateStart, dateEnd, sender }) => {
        const all = getContentItems();
        const matched = all.filter((i) => { if (sender && i.sender !== sender) return false; if (dateStart && i.date < dateStart) return false; if (dateEnd && i.date > dateEnd) return false; return true; });
        if (matched.length === 0) { alert('当前筛选条件下无匹配数据，无法导出'); setShowExportDialog(false); return; }
        const headers = ['内容编号','话题','发送方','内容','浏览量','点赞数','评论数','发送人','联系方式','发送时间'];
        const rows = matched.map((i) => [i.id,i.topicName,i.sender,i.content,i.views,i.likes,i.commentCount,i.senderName,i.contact,i.date]);
        const csv = [headers,...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob(['﻿'+csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `内容管理_${dateStart}_${dateEnd}.csv`; a.click();
        URL.revokeObjectURL(url); setShowExportDialog(false);
      }} onClose={() => setShowExportDialog(false)} />}
    </div>
  );
};

export default ContentManagement;

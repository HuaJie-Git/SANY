import React, { useState, useMemo } from 'react';
import { getContentItems, approveContent, rejectContent } from '../../admin/adminContent';

const ContentAudit = () => {
  const [items, setItems] = useState(() => getContentItems());
  const [filterStatus, setFilterStatus] = useState('pending');
  const [auditItem, setAuditItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const refresh = () => setItems([...getContentItems()]);

  const userItems = useMemo(() => items.filter((c) => c.sender === '用户'), [items]);

  const filtered = useMemo(() => {
    if (filterStatus === 'all') return userItems;
    return userItems.filter((c) => c.auditStatus === filterStatus);
  }, [userItems, filterStatus]);

  const handleApprove = () => {
    approveContent(auditItem.id, '管理员');
    setAuditItem(null);
    refresh();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectContent(auditItem.id, '管理员', rejectReason.trim());
    setAuditItem(null);
    setRejectReason('');
    refresh();
  };

  const getStatusLabel = (status) => {
    const map = {
      pending: { text: '待审核', color: 'bg-yellow-100 text-yellow-700' },
      approved: { text: '审核通过', color: 'bg-green-100 text-green-700' },
      rejected: { text: '审核不通过', color: 'bg-red-100 text-red-600' },
    };
    return map[status] || { text: status, color: 'bg-gray-100 text-gray-600' };
  };

  // 获取最后一条审核记录
  const getAuditRecord = (item) => {
    if (!item.auditHistory || item.auditHistory.length === 0) return null;
    return item.auditHistory[item.auditHistory.length - 1];
  };

  return (
    <div className="p-6">
      <h1 className="text-[18px] font-semibold text-gray-900 mb-5">内容审核</h1>

      <div className="bg-white rounded-lg p-4 mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-[13px] text-gray-600">审核状态：</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-8 px-3 border border-gray-300 rounded text-[13px] w-[140px] focus:outline-none focus:border-[#1890ff]">
            <option value="all">全部</option>
            <option value="pending">待审核</option>
            <option value="approved">审核通过</option>
            <option value="rejected">审核不通过</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-3 text-left font-medium text-gray-600 w-[45px]">序号</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">话题</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">内容</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">审核状态</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600 w-[100px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => {
              const status = getStatusLabel(item.auditStatus);
              const isPending = item.auditStatus === 'pending';
              return (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-3 py-2.5 text-gray-500">{idx + 1}</td>
                  <td className="px-3 py-2.5 text-gray-600">{item.topicName}</td>
                  <td className="px-3 py-2.5 text-gray-700 truncate max-w-[300px]">{item.content}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[11px] px-1.5 py-0.5 rounded ${status.color}`}>{status.text}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      className="text-[#1890ff] text-[12px] hover:underline font-medium"
                      onClick={() => { setAuditItem(item); setRejectReason(''); }}
                    >
                      {isPending ? '审核' : '详情'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">暂无数据</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-[13px] text-gray-500">共 {filtered.length} 条</div>

      {/* ─── 审核/详情弹窗 ─── */}
      {auditItem && (() => {
        const isPending = auditItem.auditStatus === 'pending';
        const record = getAuditRecord(auditItem);

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45" onClick={() => setAuditItem(null)}>
            <div className="bg-white rounded-xl w-[600px] max-h-[85vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-gray-900">{isPending ? '审核详情' : '审核结果'}</h3>
                <button className="text-gray-400 hover:text-gray-600" onClick={() => setAuditItem(null)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {auditItem.image && (
                  <div>
                    <span className="text-[12px] text-gray-500 block mb-1">内容预览</span>
                    <img src={auditItem.image} alt="" className="w-full max-h-[220px] object-cover rounded" />
                  </div>
                )}

                <div className="flex text-[13px]"><span className="w-[80px] text-gray-500 flex-shrink-0">关联话题</span><span className="text-gray-900">{auditItem.topicName}</span></div>
                <div className="flex text-[13px]"><span className="w-[80px] text-gray-500 flex-shrink-0">标题</span><span className="text-gray-900">{auditItem.content}</span></div>
                {auditItem.contentBody && <div className="flex text-[13px]"><span className="w-[80px] text-gray-500 flex-shrink-0">正文</span><span className="text-gray-900 leading-relaxed">{auditItem.contentBody}</span></div>}

                <hr className="border-gray-100" />
                <div className="text-[14px] font-medium text-gray-900">作者信息</div>
                <div className="grid grid-cols-2 gap-y-2 text-[13px]">
                  <div className="flex"><span className="w-[70px] text-gray-500 flex-shrink-0">昵称</span><span className="text-gray-900">{auditItem.senderName}</span></div>
                  <div className="flex"><span className="w-[70px] text-gray-500 flex-shrink-0">用户编号</span><span className="text-gray-900 font-mono">{auditItem.authorId}</span></div>
                  <div className="flex"><span className="w-[70px] text-gray-500 flex-shrink-0">国区</span><span className="text-gray-900">中国</span></div>
                  <div className="flex"><span className="w-[70px] text-gray-500 flex-shrink-0">角色</span><span className="text-gray-900">机手</span></div>
                </div>

                <hr className="border-gray-100" />
                <div className="flex text-[13px]"><span className="w-[80px] text-gray-500 flex-shrink-0">提交时间</span><span className="text-gray-900">{auditItem.date}</span></div>
                <div className="flex items-center text-[13px]"><span className="w-[80px] text-gray-500 flex-shrink-0">当前状态</span>
                  <span className={`text-[12px] px-1.5 py-0.5 rounded ${getStatusLabel(auditItem.auditStatus).color}`}>{getStatusLabel(auditItem.auditStatus).text}</span>
                </div>

                {/* 已审核记录 */}
                {!isPending && record && (
                  <>
                    <hr className="border-gray-100" />
                    <div className="text-[14px] font-medium text-gray-900">审核记录</div>
                    <div className="flex text-[13px]"><span className="w-[80px] text-gray-500 flex-shrink-0">审核结果</span>
                      <span className={`font-medium ${record.action === '通过' ? 'text-green-600' : 'text-red-600'}`}>{record.action}</span>
                    </div>
                    <div className="flex text-[13px]"><span className="w-[80px] text-gray-500 flex-shrink-0">审核人</span><span className="text-gray-900">{record.auditor}</span></div>
                    <div className="flex text-[13px]"><span className="w-[80px] text-gray-500 flex-shrink-0">审核时间</span><span className="text-gray-900">{record.time}</span></div>
                    {record.action === '不通过' && record.reason && (
                      <div className="flex text-[13px]"><span className="w-[80px] text-gray-500 flex-shrink-0">不通过原因</span><span className="text-gray-900">{record.reason}</span></div>
                    )}
                  </>
                )}
                {!isPending && !record && (
                  <div className="text-[13px] text-gray-400">无审核记录</div>
                )}

                {/* 不通过原因输入（仅待审核时） */}
                {isPending && (
                  <div className="mt-2">
                    <label className="block text-[13px] text-gray-700 mb-1">不通过备注 <span className="text-gray-400 text-[12px]">（选择不通过时必填，APP 不显示）</span></label>
                    <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] resize-none focus:outline-none focus:border-[#1890ff]" placeholder="填写后仅后台留存" />
                  </div>
                )}
              </div>

              {/* 底部按钮 */}
              {isPending ? (
                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button className="h-9 px-6 bg-green-500 text-white rounded text-[14px] font-medium hover:bg-green-600" onClick={handleApprove}>通过</button>
                  <button className="h-9 px-6 bg-orange-500 text-white rounded text-[14px] font-medium hover:bg-orange-600" onClick={handleReject} disabled={!rejectReason.trim()}>不通过</button>
                </div>
              ) : (
                <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
                  <button className="h-9 px-6 bg-[#1890ff] text-white rounded text-[14px] hover:bg-[#40a9ff]" onClick={() => setAuditItem(null)}>关闭</button>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ContentAudit;

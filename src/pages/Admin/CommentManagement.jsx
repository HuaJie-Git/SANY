import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  COMMENT_DELETE_REASONS,
  COMMENT_DELETE_REASON_MAX_LENGTH,
  approveCommentByAdmin,
  deleteCommentByAdmin,
  getCommentItems,
  normalizeDeleteReason,
  splitVisibleCharacters,
} from '../../admin/adminComments';

const CommentManagement = () => {
  const [items, setItems] = useState(() => getCommentItems());
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const noticeTimerRef = useRef(null);
  const reasonLength = splitVisibleCharacters(reason).length;

  const filtered = useMemo(() => items.filter((item) => {
    const query = keyword.trim().toLowerCase();
    const matchesKeyword = !query || [item.content, item.userName, item.postTitle].some((value) => value.toLowerCase().includes(query));
    return matchesKeyword && (!status || item.status === status);
  }), [items, keyword, status]);

  useEffect(() => () => clearTimeout(noticeTimerRef.current), []);

  const showNotice = (message) => {
    setNotice(message);
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 3200);
  };

  const reset = () => { setKeyword(''); setStatus(''); };
  const closeDialog = () => { setDeleteTarget(null); setReason(''); setError(''); };
  const closeDetail = () => setDetailTarget(null);
  const handleDelete = () => {
    const normalizedReason = normalizeDeleteReason(reason);
    if (!normalizedReason) { setError('请填写删除原因'); return; }
    const saved = deleteCommentByAdmin(deleteTarget.id, '管理员', normalizedReason);
    if (!saved) { setError('该评论已被处理，请刷新列表后重试'); return; }
    setItems([...getCommentItems()]);
    closeDialog();
    showNotice('评论已删除，删除通知已发送至 APP 社区互动');
  };
  const handleApprove = () => {
    const saved = approveCommentByAdmin(detailTarget.id, '管理员');
    if (!saved) { setError('该评论已被处理，请刷新列表后重试'); return; }
    setItems([...getCommentItems()]);
    closeDetail();
  };
  const openDelete = (item) => {
    setDetailTarget(null);
    setDeleteTarget(item);
    setReason('');
    setError('');
  };

  const handleReasonChange = (value) => {
    setReason(splitVisibleCharacters(value).slice(0, COMMENT_DELETE_REASON_MAX_LENGTH).join(''));
    setError('');
  };

  const handleQuickReason = (value) => {
    handleReasonChange(value);
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[18px] font-semibold text-gray-900">评论管理</h1>
          <p className="text-[12px] text-gray-500 mt-1">审核社区评论，对违规评论进行删除管控</p>
        </div>
        <span className="text-[12px] text-gray-500">共 {filtered.length} 条</span>
      </div>

      {notice && (
        <div className="mb-4 flex items-center gap-2 rounded border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-700" role="status">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-[12px] font-semibold text-white">✓</span>
          <span>{notice}</span>
        </div>
      )}

      <div className="bg-white rounded-lg p-4 mb-4 flex items-center gap-3 flex-wrap">
        <label className="text-[13px] text-gray-600">关键词</label>
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="评论、评论人或所属帖子" className="h-8 w-[245px] px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]" />
        <label className="text-[13px] text-gray-600 ml-2">状态</label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-8 w-[110px] px-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]">
          <option value="">全部</option><option value="待审核">待审核</option><option value="正常">正常</option><option value="已删除">已删除</option>
        </select>
        <button type="button" onClick={reset} className="h-8 px-4 border border-gray-300 rounded text-[13px] text-gray-600 hover:bg-gray-50 ml-auto">重置</button>
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] text-[13px]">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-[55px]">序号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">评论内容</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">评论人</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">所属帖子</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">评论时间</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">删除原因</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-[150px]">操作</th>
            </tr></thead>
            <tbody>
              {filtered.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/60 align-top">
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className={`px-4 py-3 max-w-[260px] ${item.status === '已删除' ? 'text-gray-400' : 'text-gray-800'}`}>
                    <div className={`${item.status === '已删除' ? 'line-through' : ''} truncate`} title={item.content}>{item.content}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{item.userName}<div className="text-[11px] text-gray-400">{item.userId}</div></td>
                  <td className="px-4 py-3 text-gray-600 max-w-[220px]"><div className="truncate" title={item.postTitle}>{item.postTitle}</div><div className="text-[11px] text-gray-400">{item.topicName}</div></td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{item.createdAt}</td>
                  <td className="px-4 py-3"><span className={`text-[11px] px-1.5 py-0.5 rounded ${item.status === '已删除' ? 'bg-red-100 text-red-600' : item.status === '待审核' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{item.status}</span></td>
                  <td className="px-4 py-3 text-gray-500 max-w-[170px]"><div className="truncate" title={item.deleteReason || '—'}>{item.deleteReason || '—'}</div></td>
                  <td className="px-4 py-3 whitespace-nowrap"><button type="button" className="text-[#1890ff] hover:underline mr-3" onClick={() => { setDetailTarget(item); setError(''); }}>查看详情</button>{item.status === '待审核' ? <button type="button" className="text-orange-600 hover:underline" onClick={() => { setDetailTarget(item); setError(''); }}>审核</button> : item.status === '正常' ? <button type="button" className="text-red-500 hover:underline" onClick={() => openDelete(item)}>删除</button> : <span className="text-gray-400">已处理</span>}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-14 text-center text-gray-400">暂无符合条件的评论</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {detailTarget && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45" onClick={closeDetail}>
        <div className="bg-white rounded-xl w-[520px] max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"><h2 className="text-[16px] font-semibold text-gray-900">评论详情</h2><button type="button" onClick={closeDetail} className="text-gray-400 hover:text-gray-700 text-xl leading-none" aria-label="关闭">×</button></div>
          <div className="px-6 py-5 space-y-3 text-[13px]">
            <div dir="auto" className="bg-gray-50 rounded px-3 py-3 text-gray-800 leading-6 break-words">{detailTarget.content}</div>
            <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-y-2"><span className="text-gray-500">评论人</span><span>{detailTarget.userName}（{detailTarget.userId}）</span><span className="text-gray-500">所属帖子</span><span dir="auto" className="break-words">{detailTarget.postTitle}</span><span className="text-gray-500">话题</span><span>{detailTarget.topicName}</span><span className="text-gray-500">评论时间</span><span>{detailTarget.createdAt}</span><span className="text-gray-500">状态</span><span>{detailTarget.status}</span><span className="text-gray-500">审核时间</span><span>{detailTarget.auditTime || '—'}</span><span className="text-gray-500">审核人</span><span>{detailTarget.auditor || '—'}</span><span className="text-gray-500">删除原因</span><span dir="auto" className="whitespace-pre-wrap break-words">{detailTarget.deleteReason || '—'}</span><span className="text-gray-500">删除时间</span><span>{detailTarget.deleteTime || '—'}</span><span className="text-gray-500">删除人</span><span>{detailTarget.deleter || '—'}</span><span className="text-gray-500">APP 通知</span><span>{detailTarget.notificationStatus || '—'}{detailTarget.notificationTime ? `（${detailTarget.notificationTime}）` : ''}</span></div>
            {error && <p className="text-[12px] text-red-500">{error}</p>}
          </div>
          <div className="px-6 py-3 border-t border-gray-100 flex justify-end gap-3"><button type="button" onClick={closeDetail} className="h-9 px-5 border border-gray-300 rounded text-[13px] text-gray-600">关闭</button>{detailTarget.status === '待审核' && <><button type="button" onClick={() => openDelete(detailTarget)} className="h-9 px-5 border border-red-300 text-red-500 rounded text-[13px]">删除</button><button type="button" onClick={handleApprove} className="h-9 px-5 bg-[#1890ff] text-white rounded text-[13px] font-medium">审核通过</button></>}</div>
        </div>
      </div>}

      {deleteTarget && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45" onClick={closeDialog}>
        <div className="w-[520px] max-w-[calc(100vw-32px)] overflow-hidden rounded-lg bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4"><div><h2 className="text-[16px] font-semibold text-gray-900">删除评论</h2><p className="mt-1 text-[12px] text-gray-500">删除后不可恢复，并通知评论作者</p></div><button type="button" onClick={closeDialog} className="flex h-8 w-8 items-center justify-center text-xl leading-none text-gray-400 hover:text-gray-700" aria-label="关闭">×</button></div>
          <div className="px-6 py-5 space-y-4">
            <div className="bg-gray-50 rounded px-3 py-2.5 text-[13px] text-gray-700">“{deleteTarget.content}”<div className="text-[11px] text-gray-400 mt-1">{deleteTarget.userName} · {deleteTarget.postTitle}</div></div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="comment-delete-reason" className="text-[13px] text-gray-700"><span className="text-red-500">*</span> 删除原因</label><span className={`text-[11px] ${reasonLength >= COMMENT_DELETE_REASON_MAX_LENGTH ? 'text-orange-600' : 'text-gray-400'}`}>{reasonLength}/{COMMENT_DELETE_REASON_MAX_LENGTH}</span></div>
              <div className="mb-2 flex flex-wrap gap-2" aria-label="快捷删除原因">
                {COMMENT_DELETE_REASONS.map((option) => <button key={option} type="button" aria-pressed={reason === option} onClick={() => handleQuickReason(option)} className={`rounded border px-2.5 py-1 text-[12px] transition-colors ${reason === option ? 'border-[#1890ff] bg-blue-50 text-[#1677ff]' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-[#1677ff]'}`}>{option}</button>)}
              </div>
              <textarea id="comment-delete-reason" dir="auto" autoFocus value={reason} rows={4} onChange={(event) => handleReasonChange(event.target.value)} placeholder="请输入删除原因，或选择上方快捷原因后继续补充" aria-invalid={Boolean(error)} aria-describedby={error ? 'comment-delete-reason-error' : undefined} className={`w-full resize-none rounded border px-3 py-2 text-[13px] leading-5 outline-none transition-colors focus:border-[#1890ff] ${error ? 'border-red-400' : 'border-gray-300'}`} />
              {error && <p id="comment-delete-reason-error" className="text-[12px] text-red-500 mt-1">{error}</p>}
            </div>
            <div className="rounded border border-orange-100 bg-orange-50 px-3 py-2.5 text-[12px] leading-5 text-orange-700">确认后，APP 社区互动将向评论作者发送“评论已删除”通知，并展示本次填写的原因；后台保留完整审计记录。</div>
          </div>
          <div className="px-6 py-3 border-t border-gray-100 flex justify-end gap-3"><button type="button" onClick={closeDialog} className="h-9 px-5 border border-gray-300 rounded text-[13px] text-gray-600">取消</button><button type="button" disabled={!reason.trim()} onClick={handleDelete} className="h-9 px-5 rounded bg-red-500 text-[13px] font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-200">确认删除并通知</button></div>
        </div>
      </div>}
    </div>
  );
};

export default CommentManagement;

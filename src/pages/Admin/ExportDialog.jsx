import React, { useState } from 'react';

const ExportDialog = ({ onExport, onClose }) => {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [sender, setSender] = useState('');
  const [error, setError] = useState('');

  const handleExport = () => {
    if (!dateStart || !dateEnd) {
      setError('发送时间范围为必选');
      return;
    }
    if (dateStart > dateEnd) {
      setError('开始时间不能晚于结束时间');
      return;
    }
    setError('');
    onExport({ dateStart, dateEnd, sender });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45" onClick={onClose}>
      <div className="bg-white rounded-xl w-[480px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-gray-900">导出内容</h2>
          <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[13px] text-gray-700 mb-1"><span className="text-red-500">*</span> 发送时间范围</label>
            <div className="flex items-center gap-2">
              <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="flex-1 h-9 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]" />
              <span className="text-gray-400">~</span>
              <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="flex-1 h-9 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] text-gray-700 mb-1">发送方</label>
            <select value={sender} onChange={(e) => setSender(e.target.value)} className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]">
              <option value="">全部</option>
              <option value="用户">用户</option>
              <option value="官方">官方</option>
            </select>
          </div>
          {error && <div className="text-[12px] text-red-500">{error}</div>}
          <div className="text-[12px] text-gray-500">将导出当前筛选条件命中的全部内容（非当前页）</div>
        </div>
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-3">
          <button className="h-9 px-6 border border-gray-300 rounded text-[14px] text-gray-600 hover:bg-gray-50" onClick={onClose}>取消</button>
          <button className="h-9 px-6 bg-[#1890ff] text-white rounded text-[14px] font-medium hover:bg-[#40a9ff]" onClick={handleExport}>确认导出</button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;

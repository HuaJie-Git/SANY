import React, { useState, useMemo } from 'react';

export default function DataTable({ columns, data, pageSize: initialPageSize = 5, emptyText = '暂无数据' }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(initialPageSize);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const curPage = Math.min(page, totalPages);
  const pageData = sorted.slice((curPage - 1) * size, curPage * size);

  const toggleSort = (key) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); }
    else if (sortDir === 'asc') setSortDir('desc');
    else { setSortKey(null); setSortDir(null); }
    setPage(1);
  };

  const sortIcon = (key) => {
    if (sortKey !== key) return <span className="text-gray-300 ml-1">&#8597;</span>;
    return <span className="ml-1">{sortDir === 'asc' ? '&#9650;' : '&#9660;'}</span>;
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              {columns.map(col => (
                <th key={col.key} className="px-3 py-2.5 text-left font-semibold" style={{ color: '#1a1a2e', cursor: col.sortable ? 'pointer' : 'default' }} onClick={() => col.sortable && toggleSort(col.key)}>
                  {col.label}{col.sortable && sortIcon(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-3 py-8 text-center" style={{ color: '#9ca3af' }}>{emptyText}</td></tr>
            ) : pageData.map((row, i) => (
              <tr key={row.id ?? i} style={{ background: i % 2 ? '#fafafa' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                {columns.map(col => (
                  <td key={col.key} className="px-3 py-2.5" style={{ color: '#374151' }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-3" style={{ fontSize: '13px', color: '#6b7280' }}>
        <div className="flex items-center gap-2">
          <span>共 {total} 条</span>
          <select value={size} onChange={e => { setSize(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1" style={{ borderColor: '#d1d5db', fontSize: '12px' }}>
            {[5, 10, 20].map(s => <option key={s} value={s}>{s}条/页</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={curPage <= 1} className="w-8 h-8 rounded flex items-center justify-center disabled:opacity-40 hover:bg-gray-100" aria-label="上一页">&#9664;</button>
          <span className="w-8 h-8 rounded flex items-center justify-center text-white" style={{ background: '#e60012' }}>{curPage}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={curPage >= totalPages} className="w-8 h-8 rounded flex items-center justify-center disabled:opacity-40 hover:bg-gray-100" aria-label="下一页">&#9654;</button>
        </div>
      </div>
    </div>
  );
}

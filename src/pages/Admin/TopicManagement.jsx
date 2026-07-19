import React, { useState, useMemo } from 'react';
import {
  getAdminTopics,
  addAdminTopic,
  updateAdminTopic,
  deleteAdminTopic,
  toggleTopicStatus,
  TOPIC_TYPES,
  TYPE_TO_MAPPING,
} from '../../admin/adminTopics';
import TopicDialog from './TopicDialog';

const TopicManagement = () => {
  const [topics, setTopics] = useState(() => getAdminTopics());
  const [filterType, setFilterType] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  const refresh = () => setTopics([...getAdminTopics()]);

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      if (filterType && t.type !== filterType) return false;
      return true;
    });
  }, [topics, filterType]);

  const handleAdd = () => {
    setEditingTopic(null);
    setDialogOpen(true);
  };

  const handleEdit = (topic) => {
    setEditingTopic(topic);
    setDialogOpen(true);
  };

  const handleSave = (topicData) => {
    if (editingTopic) {
      updateAdminTopic(editingTopic.id, topicData);
    } else {
      addAdminTopic(topicData);
    }
    refresh();
    setDialogOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('确定删除该话题？')) {
      deleteAdminTopic(id);
      refresh();
    }
  };

  const handleToggleStatus = (id) => {
    toggleTopicStatus(id);
    refresh();
  };

  // 映射标签颜色
  const getMappingColor = (type) => {
    if (type === '热门话题') return 'bg-blue-100 text-blue-700';
    if (type === '热门话题占位一') return 'bg-orange-100 text-orange-700';
    if (type === '热门话题占位二') return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="p-6">
      <h1 className="text-[18px] font-semibold text-gray-900 mb-5">话题管理</h1>

      {/* 筛选行 */}
      <div className="bg-white rounded-lg p-4 mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-[13px] text-gray-600">话题类型：</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-8 px-3 border border-gray-300 rounded text-[13px] w-[180px] focus:outline-none focus:border-[#1890ff]"
          >
            <option value="">全部</option>
            {TOPIC_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            className="h-8 px-4 border border-gray-300 rounded text-[13px] text-gray-600 hover:bg-gray-50"
            onClick={() => setFilterType('')}
          >
            重置
          </button>
          <button
            className="h-8 px-4 bg-[#1890ff] text-white rounded text-[13px] hover:bg-[#40a9ff]"
          >
            查询
          </button>
        </div>
      </div>

      {/* 新增按钮 */}
      <div className="flex justify-end mb-3">
        <button
          className="h-9 px-5 bg-[#1890ff] text-white rounded text-[13px] font-medium hover:bg-[#40a9ff] flex items-center gap-1.5"
          onClick={handleAdd}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          新增
        </button>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-[50px]">序号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">话题编码</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-[60px]">话题排序</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">话题</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">话题类型</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">社区前台位置</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">创建时间</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-[160px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredTopics.map((topic, idx) => (
              <tr key={topic.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                <td className="px-4 py-3 text-gray-700 font-mono text-[12px]">{topic.code}</td>
                <td className="px-4 py-3 text-gray-700">{topic.sort}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">#{topic.name}</td>
                <td className="px-4 py-3 text-gray-600">{topic.type}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded ${getMappingColor(topic.type)}`}>
                    {TYPE_TO_MAPPING[topic.type] || '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[12px] ${topic.status === '开启' ? 'text-green-600' : 'text-gray-400'}`}>
                    {topic.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-[12px]">{topic.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      className="text-[#1890ff] text-[12px] hover:underline"
                      onClick={() => handleEdit(topic)}
                    >
                      编辑
                    </button>
                    <button
                      className={`text-[12px] hover:underline ${topic.status === '开启' ? 'text-orange-500' : 'text-green-500'}`}
                      onClick={() => handleToggleStatus(topic.id)}
                    >
                      {topic.status === '开启' ? '关闭' : '开启'}
                    </button>
                    <button
                      className="text-red-500 text-[12px] hover:underline"
                      onClick={() => handleDelete(topic.id)}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTopics.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="flex items-center justify-between mt-4 text-[13px] text-gray-500">
        <span>共 {filteredTopics.length} 条</span>
        <div className="flex items-center gap-1">
          <span className="px-2 py-1 bg-[#1890ff] text-white rounded text-[12px]">1</span>
        </div>
      </div>

      {/* 新增/编辑弹窗 */}
      {dialogOpen && (
        <TopicDialog
          topic={editingTopic}
          onSave={handleSave}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default TopicManagement;

import React, { useState, useEffect } from 'react';
import { getAllTasks } from '../../components/MyTasks/MyTasksSummary';

const TaskList = ({ onBack, onTaskClick }) => {
  const [activeTab, setActiveTab] = useState('my'); // my: 我的任务, all: 全部任务
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(['pending', 'processing']);
  const [selectedPriority, setSelectedPriority] = useState([]);
  const [selectedTaskType, setSelectedTaskType] = useState([]);
  const [sortBy, setSortBy] = useState('deadline_asc');
  const [timeFilter, setTimeFilter] = useState({ start: '', end: '' });

  // 模拟加载任务数据
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filteredTasks = [...getAllTasks()];

      // 根据视图筛选
      if (activeTab === 'my') {
        // 我的任务：只显示当前用户接收的任务
        filteredTasks = filteredTasks.filter(task => task.assignee === '当前用户');
      }

      // 根据状态筛选
      if (selectedStatus.length > 0) {
        filteredTasks = filteredTasks.filter(task => selectedStatus.includes(task.status));
      }

      // 根据优先级筛选
      if (selectedPriority.length > 0) {
        filteredTasks = filteredTasks.filter(task => selectedPriority.includes(task.priority));
      }

      // 根据任务类型筛选
      if (selectedTaskType.length > 0) {
        filteredTasks = filteredTasks.filter(task => selectedTaskType.includes(task.taskType));
      }

      // 根据搜索关键词筛选
      if (searchQuery) {
        filteredTasks = filteredTasks.filter(task =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.primaryDeviceName && task.primaryDeviceName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // 根据截止时间筛选
      if (timeFilter.start) {
        filteredTasks = filteredTasks.filter(task => task.deadline >= timeFilter.start);
      }
      if (timeFilter.end) {
        filteredTasks = filteredTasks.filter(task => task.deadline <= timeFilter.end);
      }

      // 排序
      filteredTasks.sort((a, b) => {
        if (sortBy === 'deadline_asc') {
          return new Date(a.deadline) - new Date(b.deadline);
        } else {
          return new Date(b.deadline) - new Date(a.deadline);
        }
      });

      setTasks(filteredTasks);
      setTotal(filteredTasks.length);
      setLoading(false);
    }, 500);
  }, [activeTab, selectedStatus, selectedPriority, selectedTaskType, searchQuery, sortBy, timeFilter]);

  // 获取优先级样式
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-600';
      case 'medium':
        return 'bg-orange-100 text-orange-600';
      case 'low':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // 获取优先级文本
  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '';
    }
  };

  // 获取状态样式
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-600';
      case 'processing':
        return 'bg-orange-100 text-orange-600';
      case 'completed':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // 获取状态文本
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'processing':
        return '处理中';
      case 'completed':
        return '已完成';
      default:
        return '';
    }
  };

  // 获取设备摘要
  const getDeviceSummary = (task) => {
    if (task.deviceCount === 0) {
      return '无关联设备';
    } else if (task.deviceCount === 1) {
      return `${task.primaryDeviceName} · ${task.primaryDeviceType}`;
    } else {
      return `关联设备 ${task.deviceCount} 台`;
    }
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className="absolute inset-0 bg-gray-100 z-50 flex flex-col">
        {/* 状态栏 */}
        <div className="h-[44px] flex items-center justify-between px-4 bg-white">
          <span className="text-black text-[14px] font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M1 8H3V12H1V8Z" fill="#333"/>
              <path d="M5 5H7V12H5V5Z" fill="#333"/>
              <path d="M9 3H11V12H9V3Z" fill="#333"/>
              <path d="M13 0H15V12H13V0Z" fill="#333"/>
            </svg>
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
              <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="#333" strokeOpacity="0.35"/>
              <rect x="2" y="2" width="18" height="8" rx="1" fill="#333"/>
              <path d="M23 4V8C23.5523 8 24 7.5523 24 7V5C24 4.4477 23.5523 4 23 4Z" fill="#333" fillOpacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* 顶部导航栏 */}
        <div className="flex items-center px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="flex-1 text-center text-base font-medium text-gray-900">任务</h1>
          <div className="w-8" />
        </div>

        {/* 加载中 */}
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-gray-100 z-50 flex flex-col">
      {/* 状态栏 */}
      <div className="h-[44px] flex items-center justify-between px-4 bg-white">
        <span className="text-black text-[14px] font-medium">9:41</span>
        <div className="flex items-center gap-1">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M1 8H3V12H1V8Z" fill="#333"/>
            <path d="M5 5H7V12H5V5Z" fill="#333"/>
            <path d="M9 3H11V12H9V3Z" fill="#333"/>
            <path d="M13 0H15V12H13V0Z" fill="#333"/>
          </svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="#333" strokeOpacity="0.35"/>
            <rect x="2" y="2" width="18" height="8" rx="1" fill="#333"/>
            <path d="M23 4V8C23.5523 8 24 7.5523 24 7V5C24 4.4477 23.5523 4 23 4Z" fill="#333" fillOpacity="0.4"/>
          </svg>
        </div>
      </div>

      {/* 顶部导航栏 */}
      <div className="flex items-center px-4 py-3 bg-white border-b border-gray-100">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="flex-1 text-center text-base font-medium text-gray-900">任务</h1>
        <div className="w-8" />
      </div>

      {/* 视图切换 */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            className={`flex-1 py-2 text-sm font-medium text-center rounded-md transition-colors ${
              activeTab === 'my'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('my')}
          >
            我的任务
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium text-center rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('all')}
          >
            全部任务
          </button>
        </div>
      </div>

      {/* 搜索框和筛选 */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="任务标题/设备编号/昵称/车牌号"
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilter(true)}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
          </button>
          <button
            onClick={() => setShowTimeFilter(true)}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </button>
        </div>

        {/* 时间筛选回显 */}
        {(timeFilter.start || timeFilter.end) && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">截止时间：</span>
            <span className="text-xs text-gray-700">
              {timeFilter.start || '不限'} ~ {timeFilter.end || '不限'}
            </span>
            <button
              onClick={() => setTimeFilter({ start: '', end: '' })}
              className="text-xs text-red-500"
            >
              清除
            </button>
          </div>
        )}
      </div>

      {/* 任务列表 */}
      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="text-sm text-gray-500 mb-3">
              {activeTab === 'my' ? '暂无我的任务' : '暂无任务'}
            </div>
            {(searchQuery || selectedStatus.length > 0 || selectedPriority.length > 0 || selectedTaskType.length > 0 || timeFilter.start || timeFilter.end) && (
              <button
                className="text-sm text-red-500"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus(['pending', 'processing']);
                  setSelectedPriority([]);
                  setSelectedTaskType([]);
                  setTimeFilter({ start: '', end: '' });
                }}
              >
                清除筛选
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {tasks.map((task) => (
              <div
                key={task.taskId}
                className="bg-white rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                onClick={() => onTaskClick && onTaskClick(task)}
              >
                {/* 第一行：优先级 + 标题 + 状态 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getPriorityStyle(task.priority)}`}>
                      {getPriorityText(task.priority)}
                    </span>
                    <span className="text-sm font-medium text-gray-900 truncate">{task.title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs ${getStatusStyle(task.status)}`}>
                    {getStatusText(task.status)}
                  </span>
                </div>

                {/* 第二行：任务类型 */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>{task.taskType}</span>
                </div>

                {/* 第三行：设备信息 */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                  </svg>
                  <span>{getDeviceSummary(task)}</span>
                </div>

                {/* 第四行：时间 */}
                <div className="text-xs text-gray-500 mb-1">
                  {task.plannedStartTime} ~ {task.deadline}
                </div>

                {/* 第五行：创建人 */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>创建人：{task.creator}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 筛选与排序面板 */}
      {showFilter && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-4 max-h-[80%] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-medium">筛选与排序</span>
              <button onClick={() => setShowFilter(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* 排序方式 */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-900 mb-2">排序方式</div>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    sortBy === 'deadline_asc' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                  onClick={() => setSortBy('deadline_asc')}
                >
                  截止时间升序
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    sortBy === 'deadline_desc' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                  onClick={() => setSortBy('deadline_desc')}
                >
                  截止时间降序
                </button>
              </div>
            </div>

            {/* 状态 */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-900 mb-2">状态</div>
              <div className="flex gap-2">
                {['pending', 'processing', 'completed'].map((status) => (
                  <button
                    key={status}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      selectedStatus.includes(status) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => {
                      if (selectedStatus.includes(status)) {
                        setSelectedStatus(selectedStatus.filter(s => s !== status));
                      } else {
                        setSelectedStatus([...selectedStatus, status]);
                      }
                    }}
                  >
                    {getStatusText(status)}
                  </button>
                ))}
              </div>
            </div>

            {/* 任务类型 */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-900 mb-2">任务类型</div>
              <div className="flex gap-2 flex-wrap">
                {['运输任务', '现场勘察', '挖掘任务', '设备检修', '培训任务', '安全巡检', '设备调度', '设备保养', '安全检查'].map((type) => (
                  <button
                    key={type}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      selectedTaskType.includes(type) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => {
                      if (selectedTaskType.includes(type)) {
                        setSelectedTaskType(selectedTaskType.filter(t => t !== type));
                      } else {
                        setSelectedTaskType([...selectedTaskType, type]);
                      }
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 优先级 */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-900 mb-2">优先级</div>
              <div className="flex gap-2">
                {['high', 'medium', 'low'].map((priority) => (
                  <button
                    key={priority}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      selectedPriority.includes(priority) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => {
                      if (selectedPriority.includes(priority)) {
                        setSelectedPriority(selectedPriority.filter(p => p !== priority));
                      } else {
                        setSelectedPriority([...selectedPriority, priority]);
                      }
                    }}
                  >
                    {getPriorityText(priority)}
                  </button>
                ))}
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 border border-gray-300 rounded-lg text-sm text-gray-600"
                onClick={() => {
                  setSelectedStatus(['pending', 'processing']);
                  setSelectedPriority([]);
                  setSelectedTaskType([]);
                  setSortBy('deadline_asc');
                }}
              >
                重置
              </button>
              <button
                className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-medium"
                onClick={() => setShowFilter(false)}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 截止时间面板 */}
      {showTimeFilter && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-medium">截止时间</span>
              <button onClick={() => setShowTimeFilter(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">开始时间</div>
              <input
                type="date"
                value={timeFilter.start}
                onChange={(e) => setTimeFilter({ ...timeFilter, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">结束时间</div>
              <input
                type="date"
                value={timeFilter.end}
                onChange={(e) => setTimeFilter({ ...timeFilter, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            {timeFilter.start && timeFilter.end && new Date(timeFilter.start) > new Date(timeFilter.end) && (
              <div className="text-xs text-red-500 mb-4">开始时间不能晚于结束时间</div>
            )}

            <div className="flex gap-3">
              <button
                className="flex-1 py-3 border border-gray-300 rounded-lg text-sm text-gray-600"
                onClick={() => setTimeFilter({ start: '', end: '' })}
              >
                清除
              </button>
              <button
                className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-medium"
                onClick={() => setShowTimeFilter(false)}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;

import React, { useState, useEffect } from 'react';
import { TASKS } from '../../data/tasks';

const MyTasksSummary = ({ tenantType = 'enterprise', onTaskListClick, onTaskClick }) => {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // 模拟加载任务数据
  useEffect(() => {
    // 个体户不显示任务模块
    if (tenantType === 'individual') {
      setLoading(false);
      return;
    }

    // 模拟API请求
    setTimeout(() => {
      setTasks(TASKS.slice(0, 3)); // 首页只显示前3条
      setTotal(TASKS.length); // 总数是5
      setLoading(false);
    }, 500);
  }, [tenantType]);

  // 个体户不显示任务模块
  if (tenantType === 'individual') {
    return null;
  }

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
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[16px] font-medium text-text-primary">我的任务</div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[16px] font-medium text-text-primary">我的任务</div>
        <div
          className="text-[12px] text-text辅助 cursor-pointer flex items-center"
          onClick={onTaskListClick}
        >
          更多
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="bg-white rounded-[11px] overflow-hidden shadow-sm">
      {tasks.length === 0 ? (
        // 空状态
        <div className="text-center py-6">
          <div className="text-gray-400 mb-2">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="text-sm text-gray-500 mb-3">暂无待处理任务</div>
          <div className="text-sm text-red-500 cursor-pointer" onClick={onTaskListClick}>查看任务</div>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {tasks.map((task) => (
            <div
              key={task.taskId}
              className="px-3 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
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

              {/* 第二行：设备信息 */}
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                </svg>
                <span>{getDeviceSummary(task)}</span>
              </div>

              {/* 第三行：时间 */}
              <div className="text-xs text-gray-500">
                {task.plannedStartTime} ~ {task.deadline}
              </div>
            </div>
          ))}

          {/* 超过3条时显示剩余数量 */}
          {total > 3 && (
            <div className="text-center text-sm text-red-500 cursor-pointer py-2" onClick={onTaskListClick}>
              还有 {total - 3} 个任务，查看全部
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block ml-1">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default MyTasksSummary;

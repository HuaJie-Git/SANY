import React, { useState, useEffect } from 'react';

// GUI规格中的任务数据（首页显示前3条）
const MOCK_TASKS = [
  {
    taskId: '1',
    title: 'SY550H挖掘机跨标段转运',
    status: 'processing',
    priority: 'high',
    taskType: '运输任务',
    plannedStartTime: '2026-06-05',
    deadline: '2026-06-07',
    createdAt: '2026-06-01 10:00',
    creator: '王五',
    assignee: '当前用户',
    deviceCount: 1,
    primaryDeviceName: 'JH6',
    primaryDeviceType: '半挂牵引车',
  },
  {
    taskId: '2',
    title: '三台主力设备联合安全巡检',
    status: 'processing',
    priority: 'medium',
    taskType: '现场勘察',
    plannedStartTime: '2026-06-06',
    deadline: '2026-06-08',
    createdAt: '2026-06-02 14:00',
    creator: '刘八',
    assignee: '当前用户',
    deviceCount: 3,
  },
  {
    taskId: '3',
    title: '新建搅拌站场地地质勘察',
    status: 'pending',
    priority: 'medium',
    taskType: '现场勘察',
    plannedStartTime: '2026-06-08',
    deadline: '2026-06-08',
    createdAt: '2026-06-03 09:00',
    creator: '李四',
    assignee: '当前用户',
    deviceCount: 0,
  },
  {
    taskId: '4',
    title: '一号旋挖钻机冷却系统现场排查',
    status: 'pending',
    priority: 'high',
    taskType: '现场勘察',
    plannedStartTime: '2026-06-07',
    deadline: '2026-06-09',
    createdAt: '2026-06-04 11:00',
    creator: '赵六',
    assignee: '当前用户',
    deviceCount: 1,
    primaryDeviceName: '一号旋挖钻机',
    primaryDeviceType: '旋挖钻机',
  },
  {
    taskId: '5',
    title: '3号地块基坑土方开挖',
    status: 'pending',
    priority: 'low',
    taskType: '挖掘任务',
    plannedStartTime: '2026-06-11',
    deadline: '2026-06-14',
    createdAt: '2026-06-05 16:00',
    creator: '陈七',
    assignee: '当前用户',
    deviceCount: 1,
    primaryDeviceName: 'SY005CFS552K8',
    primaryDeviceType: '挖掘机',
  },
];

// 导出任务数据供其他组件使用
export const getAllTasks = () => MOCK_TASKS;

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
      setTasks(MOCK_TASKS.slice(0, 3)); // 首页只显示前3条
      setTotal(MOCK_TASKS.length); // 总数是5
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
      <div className="bg-white mx-4 mt-3 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="text-base font-medium text-gray-900">我的任务</div>
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
    <div className="bg-white mx-4 mt-3 rounded-xl p-4 shadow-sm">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-base font-medium text-gray-900">我的任务</div>
        <div className="text-xs text-gray-500 cursor-pointer flex items-center" onClick={onTaskListClick}>
          更多
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>

      {/* 任务列表 */}
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
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.taskId}
              className="border border-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
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
  );
};

export default MyTasksSummary;

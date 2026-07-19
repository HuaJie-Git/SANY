import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const menuItems = [
  { key: 'activity', label: '活动管理模块', children: ['活动管理'] },
  { key: 'ad', label: '广告管理', children: [] },
  { key: 'customer-analysis', label: '客户分析', children: [] },
  { key: 'customer', label: '客户管理', children: [] },
  { key: 'data', label: '数据管理', children: [] },
  { key: 'feedback', label: '反馈管理', children: [] },
  { key: 'circle', label: '社区管理', children: ['话题管理', '内容管理', '内容审核'] },
  { key: 'points', label: '积分商城管理', children: [] },
  { key: 'maintenance', label: '保养台账管理', children: [] },
  { key: 'operation', label: '运营活动管理', children: [] },
  { key: 'message', label: '消息管理', children: [] },
];

const tabs = [
  { key: 'workspace', label: '工作台', icon: '🏠' },
  { key: 'topic', label: '话题管理' },
  { key: 'content', label: '内容管理' },
  { key: 'audit', label: '内容审核' },
  { key: 'data-config', label: '数据配置' },
  { key: 'data-stats', label: '数据统计' },
  { key: 'appeal', label: '异常申诉' },
  { key: 'app-feedback', label: 'APP功能反馈广告配置' },
  { key: 'feedback-list', label: '反馈管理列表' },
  { key: 'user-portrait', label: '用户群体画像' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('circle');
  const [activeSubMenu, setActiveSubMenu] = useState('话题管理');
  const [activeTab, setActiveTab] = useState('topic');

  const handleMenuClick = (key, sub) => {
    setActiveMenu(key);
    if (sub) {
      setActiveSubMenu(sub);
      if (sub === '话题管理') {
        setActiveTab('topic');
        navigate('/topic');
      } else if (sub === '内容管理') {
        setActiveTab('content');
        navigate('/content');
      } else if (sub === '内容审核') {
        setActiveTab('audit');
        navigate('/audit');
      }
    }
  };

  const handleTabClick = (key) => {
    setActiveTab(key);
    if (key === 'topic') navigate('/topic');
    if (key === 'content') navigate('/content');
    if (key === 'audit') navigate('/audit');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* 顶部导航栏 */}
      <header className="h-12 bg-[#001529] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold text-[15px]">MySANY管理平台</span>
          <button
            className="text-white/60 hover:text-white ml-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-4 text-white/80 text-[13px]">
          <span>新加坡站点 ▾</span>
          <span className="text-white/30">|</span>
          <span>三一集团 ▾</span>
          <span className="text-white/30">|</span>
          <span>简体中文 ▾</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-[12px] font-medium">张</div>
            <span className="text-white">张华杰_产品 ▾</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧菜单 */}
        {sidebarOpen && (
          <aside className="w-[200px] bg-[#001529] flex-shrink-0 overflow-y-auto">
            <div className="p-3">
              <div className="flex items-center gap-2 bg-white/10 rounded px-3 py-1.5 mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-50">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <span className="text-white/50 text-[12px]">菜单搜索</span>
              </div>
            </div>
            <nav className="px-1">
              {menuItems.map((item) => (
                <div key={item.key}>
                  <div
                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-[13px] transition-colors ${
                      activeMenu === item.key
                        ? 'bg-[#1890ff] text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                    onClick={() => handleMenuClick(item.key, item.children[0])}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[14px]">📋</span>
                      {item.label}
                    </span>
                    {item.children.length > 0 && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    )}
                  </div>
                  {item.children.length > 0 && activeMenu === item.key && (
                    <div className="bg-[#000c17]">
                      {item.children.map((sub) => (
                        <div
                          key={sub}
                          className={`px-8 py-2 cursor-pointer text-[12px] transition-colors ${
                            activeSubMenu === sub
                              ? 'bg-[#1890ff]/20 text-[#1890ff]'
                              : 'text-white/50 hover:text-white/80'
                          }`}
                          onClick={() => handleMenuClick(item.key, sub)}
                        >
                          {sub}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </aside>
        )}

        {/* 右侧内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 标签栏 */}
          <div className="flex items-center bg-white border-b border-gray-200 px-2 flex-shrink-0 overflow-x-auto">
            {tabs.map((tab) => (
              <div
                key={tab.key}
                className={`flex items-center gap-1 px-3 py-2.5 text-[12px] cursor-pointer whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#1890ff] text-[#1890ff] font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => handleTabClick(tab.key)}
              >
                {tab.icon && <span>{tab.icon}</span>}
                {tab.label}
                {activeTab === tab.key && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1 opacity-40">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* 工作区 */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

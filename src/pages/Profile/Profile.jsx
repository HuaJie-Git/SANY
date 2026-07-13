import React, { useState, useEffect } from 'react';
import RoleGuideModal from '../../components/RoleGuideModal/RoleGuideModal';
import { trackRoleGuide } from '../../utils/tracking';

const Profile = ({ userRole, onRoleConfirm }) => {
  const [showGuideBar, setShowGuideBar] = useState(!userRole);
  const [showModal, setShowModal] = useState(false);
  const [modalClosed, setModalClosed] = useState(false); // 弹窗是否被关闭过

  // 当用户角色状态变化时，更新提示条显示状态
  useEffect(() => {
    setShowGuideBar(!userRole);
    if (userRole) setModalClosed(false);
  }, [userRole]);

  // 进入页面自动弹出角色引导弹窗（未填写角色时）
  useEffect(() => {
    if (!userRole) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [userRole]);

  // 点击提示条 - 显示弹窗
  const handleGuideBarClick = () => {
    // 埋点：点击提示条
    trackRoleGuide.bannerClick();
    setShowModal(true);
  };

  // 关闭弹窗 - 仅关闭弹窗，保留提示条
  const handleModalClose = () => {
    setShowModal(false);
    setModalClosed(true);
  };

  // 确认选择角色
  const handleRoleConfirm = (role) => {
    onRoleConfirm && onRoleConfirm(role);
    setShowModal(false);
  };
  // 功能菜单数据
  const menuItems = [
    { id: 1, name: '主机询价', icon: '询价', color: '#E3F2FD', iconColor: '#2196F3' },
    { id: 2, name: '主机交付', icon: '交付', color: '#F3E5F5', iconColor: '#9C27B0' },
    { id: 3, name: '配件交付', icon: '配件', color: '#FFEBEE', iconColor: '#E91E63' },
    { id: 4, name: '积分商城', icon: '商城', color: '#FFEBEE', iconColor: '#F44336', badge: '全面升级' },
    { id: 5, name: '自助服务', icon: '自助', color: '#E3F2FD', iconColor: '#2196F3' },
    { id: 6, name: '收藏中心', icon: '收藏', color: '#FFF3E0', iconColor: '#FF9800' },
    { id: 7, name: 'APP反馈', icon: '反馈', color: '#E3F2FD', iconColor: '#2196F3' },
    { id: 8, name: '地址管理', icon: '地址', color: '#E8F5E9', iconColor: '#4CAF50' },
  ];

  // 星星积分数据
  const starsData = [
    { date: '7.3', stars: 0 },
    { date: '7.4', stars: 0 },
    { date: '7.5', stars: 0 },
    { date: '7.6', stars: 0 },
    { date: '7.7', stars: 0 },
    { date: '7.8', stars: 5 },
    { date: '今天', stars: 5 },
  ];

  // 快捷功能数据
  const quickActions = [
    { id: 1, name: '绑定设备', icon: '绑定', color: '#E3F2FD', iconColor: '#2196F3' },
    { id: 2, name: '设备预警', icon: '预警', color: '#FFF3E0', iconColor: '#FF9800' },
    { id: 3, name: '机群报表', icon: '报表', color: '#E8F5E9', iconColor: '#4CAF50' },
  ];

  // 渲染菜单图标
  const renderMenuIcon = (item) => {
    switch (item.icon) {
      case '询价':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.iconColor} strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        );
      case '交付':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.iconColor} strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        );
      case '配件':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.iconColor} strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        );
      case '商城':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.iconColor} strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        );
      case '自助':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.iconColor} strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        );
      case '收藏':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill={item.iconColor} stroke={item.iconColor} strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        );
      case '反馈':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.iconColor} strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        );
      case '地址':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.iconColor} strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        );
      default:
        return null;
    }
  };

  // 渲染快捷功能图标
  const renderQuickActionIcon = (item) => {
    switch (item.icon) {
      case '绑定':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={item.iconColor} strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        );
      case '预警':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={item.iconColor} strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      case '报表':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={item.iconColor} strokeWidth="2">
            <path d="M18 20V10"/>
            <path d="M12 20V4"/>
            <path d="M6 20v-6"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-gray-100 overflow-y-auto">
      {/* 角色引导弹窗 */}
      <RoleGuideModal
        visible={showModal}
        onClose={handleModalClose}
        onConfirm={handleRoleConfirm}
      />

      {/* 星星积分区域 - 顶上去，不再有用户信息区域 */}
      <div className="bg-white mx-4 mt-2 rounded-xl p-4 shadow-md relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-base text-gray-900">
            我的星星 <span className="text-orange-500 font-bold text-lg">172</span> ≈ Rp <span className="text-orange-500 font-bold text-lg">31.132,-</span>
          </div>
          <button className="text-xs text-orange-500 border border-orange-500 rounded-full px-3 py-1.5 hover:bg-orange-50">
            立即查看 &gt;
          </button>
        </div>

        {/* 日期和星星 */}
        <div className="flex justify-between items-end mb-4">
          {starsData.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-2">{item.date}</span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                item.stars > 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-sm' : 'bg-gray-100'
              }`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={item.stars > 0 ? 'white' : '#ccc'} stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <span className={`text-xs mt-1 font-medium ${item.stars > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                +{item.stars}
              </span>
            </div>
          ))}
        </div>

        {/* 领取按钮 */}
        <button className="w-full py-3.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-shadow">
          一键领取 10 颗星星
        </button>
      </div>

      {/* 快捷功能入口 */}
      <div className="bg-white mx-4 mt-3 rounded-xl p-5 shadow-sm">
        <div className="flex justify-around">
          {quickActions.map((item) => (
            <button key={item.id} className="flex flex-col items-center group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform" style={{ backgroundColor: item.color }}>
                {renderQuickActionIcon(item)}
              </div>
              <span className="text-xs text-gray-700 font-medium">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 设备管理 */}
      <div className="bg-white mx-4 mt-3 rounded-xl p-5 shadow-sm">
        <div className="text-sm font-semibold text-gray-900 mb-4">设备管理</div>
        <div className="flex justify-around">
          <div className="flex flex-col items-center cursor-pointer">
            <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
            <div className="text-xs text-gray-500">待保养</div>
          </div>
          <div className="w-px bg-gray-100"></div>
          <div className="flex flex-col items-center cursor-pointer">
            <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
            <div className="text-xs text-gray-500">服务工单</div>
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="bg-white mx-4 mt-3 mb-6 rounded-xl shadow-sm overflow-hidden">
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            className={`w-full flex items-center px-4 py-4 hover:bg-gray-50 transition-colors ${
              index !== menuItems.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3" style={{ backgroundColor: item.color }}>
              {renderMenuIcon(item)}
            </div>
            <span className="flex-1 text-sm text-gray-900 text-left font-medium">{item.name}</span>
            {item.badge && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full mr-3 font-medium">
                {item.badge}
              </span>
            )}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Profile;

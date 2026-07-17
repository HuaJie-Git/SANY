import React, { useState, useRef, useEffect } from 'react';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TopNav from '../../components/TopNav/TopNav';
import QuickAccess from '../../components/QuickAccess/QuickAccess';
import RecentView from '../../components/RecentView/RecentView';
import MyTasksSummary from '../../components/MyTasks/MyTasksSummary';
import DeviceStartup from '../../components/DeviceStartup/DeviceStartup';
import DeviceStartupList from '../../components/DeviceStartupList/DeviceStartupList';
import AuditEvents from '../../components/AuditEvents/AuditEvents';
import ContentFeed from '../../components/ContentFeed/ContentFeed';
import BottomNav from '../../components/BottomNav/BottomNav';
import SearchPage from '../../components/SearchPage/SearchPage';
import PartsOrder from '../PartsOrder/PartsOrder';
import ServiceRequest from '../ServiceRequest/ServiceRequest';
import DeviceMaintenance from '../DeviceMaintenance/DeviceMaintenance';
import Profile from '../Profile/Profile';
import Audit from '../Audit/Audit';
import Asset from '../Asset/Asset';
import AIAssistant from '../AIAssistant/AIAssistant';
import DeviceDetail from '../DeviceDetail/DeviceDetail';
import RecentDetail from '../RecentDetail/RecentDetail';
import RecentCardDetail from '../RecentCardDetail/RecentCardDetail';
import TaskList from '../TaskList/TaskList';

const Home = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showPublishPage, setShowPublishPage] = useState(false);
  const [showDeviceStartupList, setShowDeviceStartupList] = useState(false);
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(null); // 当前显示的功能页面
  const [selectedDevice, setSelectedDevice] = useState(null); // 选中的设备详情
  const [selectedRecentItem, setSelectedRecentItem] = useState(null); // 选中的最近查看卡片
  const [showRecentList, setShowRecentList] = useState(false); // 是否显示最近查看列表
  const [auditInitialTab, setAuditInitialTab] = useState('exception'); // 审核页面初始Tab
  const [isScrolled, setIsScrolled] = useState(false); // 是否滚动到一定位置
  const [userRole, setUserRole] = useState(null); // 用户角色，null表示未填写
  const [showTaskList, setShowTaskList] = useState(false); // 是否显示任务列表
  const [selectedTask, setSelectedTask] = useState(null); // 选中的任务
  const [isCommunityPublishEligible, setIsCommunityPublishEligible] = useState(false); // 页面资格
  const [isCommunityPublishViewportActive, setIsCommunityPublishViewportActive] = useState(false); // 滚动视口激活
  const contentRef = useRef(null); // 内容区域ref
  const contentFeedRef = useRef(null); // ContentFeed ref

  const handleSearchClick = () => {
    setShowSearchPage(true);
  };

  const handleNotificationClick = () => {
    console.log('通知点击');
  };

  const handleMoreClick = () => {
    console.log('更多点击');
  };

  const handleScanClick = () => {
    console.log('扫码点击');
  };

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop } = contentRef.current;
        // 当滚动超过1200px（约第三屏）时，显示回顶部按钮
        setIsScrolled(scrollTop > 1200);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // 回到顶部
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 发布按钮点击 - 委托给ContentFeed处理权限检查
  const handlePublishClick = () => {
    contentFeedRef.current?.handlePublishClick();
  };

  // 审核事件分类点击 - 跳转到审核页面对应Tab
  const handleAuditCategoryClick = (categoryName) => {
    setAuditInitialTab(categoryName);
    setActiveTab('audit');
  };

  // 如果显示任务列表页 - 禁用渐变背景
  if (showTaskList) {
    return (
      <PhoneFrame
        topNav={null}
        bottomNav={null}
        hideGradient={true}
      >
        <TaskList
          onBack={() => setShowTaskList(false)}
          onTaskClick={(task) => {
            setSelectedTask(task);
            setShowTaskList(false);
          }}
        />
      </PhoneFrame>
    );
  }

  // 如果显示最近查看列表详情页 - 禁用渐变背景
  if (showRecentList) {
    return (
      <PhoneFrame
        topNav={null}
        bottomNav={null}
        hideGradient={true}
      >
        <RecentDetail
          onBack={() => setShowRecentList(false)}
        />
      </PhoneFrame>
    );
  }

  // 如果显示最近查看卡片详情页 - 禁用渐变背景
  if (selectedRecentItem) {
    return (
      <PhoneFrame
        topNav={null}
        bottomNav={null}
        hideGradient={true}
      >
        <RecentCardDetail
          item={selectedRecentItem}
          onBack={() => setSelectedRecentItem(null)}
        />
      </PhoneFrame>
    );
  }

  // 如果显示设备详情页 - 禁用渐变背景
  if (selectedDevice) {
    return (
      <PhoneFrame
        topNav={null}
        bottomNav={null}
        hideGradient={true}
      >
        <DeviceDetail
          deviceName={selectedDevice.name}
          onBack={() => setSelectedDevice(null)}
        />
      </PhoneFrame>
    );
  }

  // 如果显示搜索页，隐藏顶部导航栏和底部导航栏
  if (showSearchPage) {
    return (
      <PhoneFrame
        topNav={null}
        bottomNav={null}
      >
        <SearchPage onClose={() => setShowSearchPage(false)} />
      </PhoneFrame>
    );
  }

  // 如果显示设备开机动态列表页，隐藏顶部导航栏和底部导航栏
  if (showDeviceStartupList) {
    return (
      <PhoneFrame
        topNav={null}
        bottomNav={null}
      >
        <DeviceStartupList onBack={() => setShowDeviceStartupList(false)} />
      </PhoneFrame>
    );
  }

  // 如果显示发布页面，隐藏顶部导航栏和底部导航栏
  if (showPublishPage) {
    return (
      <PhoneFrame
        topNav={null}
        bottomNav={null}
      >
        <ContentFeed
          showPublishPage={showPublishPage}
          setShowPublishPage={setShowPublishPage}
        />
      </PhoneFrame>
    );
  }

  // 如果显示功能页面
  if (currentPage) {
    const renderPage = () => {
      switch (currentPage) {
        case 'parts':
          return <PartsOrder onBack={() => setCurrentPage(null)} />;
        case 'service':
          return <ServiceRequest onBack={() => setCurrentPage(null)} />;
        case 'maintenance':
          return <DeviceMaintenance onBack={() => setCurrentPage(null)} />;
        default:
          return null;
      }
    };

    return (
      <PhoneFrame
        topNav={null}
        bottomNav={null}
      >
        {renderPage()}
      </PhoneFrame>
    );
  }

  // 如果切换到"AI助手"页面
  if (activeTab === 'ai') {
    return (
      <PhoneFrame
        topNav={
          <div className="h-[60px] px-4 flex items-center justify-between">
            {/* 返回按钮 */}
            <button onClick={() => setActiveTab('home')} className="w-8 h-8 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            {/* 标题 */}
            <div className="text-white text-lg font-medium">AI助手</div>
            {/* 历史记录图标 */}
            <button className="w-8 h-8 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
          </div>
        }
        bottomNav={null}
      >
        <AIAssistant onBack={() => setActiveTab('home')} />
      </PhoneFrame>
    );
  }

  // 如果切换到"资产"页面
  if (activeTab === 'asset') {
    return (
      <PhoneFrame
        topNav={
          <div className="h-[60px] px-4 flex items-center justify-between">
            {/* 绑定设备按钮 - 左边 */}
            <button className="flex items-center px-3 py-1.5 border border-white/40 rounded-full text-xs text-white">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
              绑定设备
            </button>
            {/* 地图按钮 - 右边（用户提供的地图SVG） */}
            <button className="w-8 h-8 flex items-center justify-center bg-white/30 rounded-full">
              <svg width="18" height="18" viewBox="0 0 1024 1024" fill="white">
                <path d="M85.333333 469.717333C85.333333 451.829333 99.658667 437.333333 117.333333 437.333333s32 14.506667 32 32.384V786.133333c0 5.962667 4.778667 10.794667 10.666667 10.794667a10.56 10.56 0 0 0 5.045333-1.28l154.848-84.021333a73.898667 73.898667 0 0 1 72.853334 1.290666l252.544 148.842667a10.56 10.56 0 0 0 10.122666 0.341333l213.333334-107.264c3.626667-1.824 5.92-5.568 5.92-9.664V469.717333C874.666667 451.829333 888.992 437.333333 906.666667 437.333333s32 14.506667 32 32.384V745.173333c0 28.682667-16.053333 54.890667-41.44 67.658667l-213.333334 107.264a73.898667 73.898667 0 0 1-70.805333-2.378667L360.533333 768.896a10.56 10.56 0 0 1-10.410666-0.192l-154.848 84.032a73.973333 73.973333 0 0 1-35.285334 8.96c-41.237333 0-74.666667-33.813333-74.666666-75.552V469.717333z m672-132.266666c0 87.808-73.173333 192.917333-217.056 320.288a42.666667 42.666667 0 0 1-56.554666 0C339.829333 530.378667 266.666667 425.258667 266.666667 337.450667 266.666667 203.968 376.64 96 512 96s245.333333 107.968 245.333333 241.450667z m-426.666666 0c0 61.514667 59.712 149.557333 181.333333 259.701333 121.621333-110.144 181.333333-198.186667 181.333333-259.701333C693.333333 239.584 612.277333 160 512 160s-181.333333 79.573333-181.333333 177.450667zM512 405.333333a64 64 0 1 1 0-128 64 64 0 0 1 0 128z"/>
              </svg>
            </button>
          </div>
        }
        bottomNav={
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} showProfileDot={!userRole} />
        }
      >
        <Asset />
      </PhoneFrame>
    );
  }

  // 如果切换到"审核"页面
  if (activeTab === 'audit') {
    return (
      <PhoneFrame
        topNav={
          <div className="h-[60px] px-4 flex items-center">
            {/* 搜索框和筛选图标在一起 */}
            <div className="flex-1 h-[32px] bg-white/20 rounded-full flex items-center px-4">
              {/* 搜索图标 */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <circle cx="7" cy="7" r="5.5" stroke="white" strokeOpacity="0.8"/>
                <path d="M11 11L14 14" stroke="white" strokeOpacity="0.8" strokeLinecap="round"/>
              </svg>
              {/* 搜索输入框 */}
              <input
                type="text"
                placeholder="设备编号/昵称/车牌号"
                className="flex-1 bg-transparent text-white text-[12px] placeholder-white/60 focus:outline-none"
              />
              {/* 筛选图标 - 在搜索框内部右侧 */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="2" className="cursor-pointer">
                <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
            </div>
          </div>
        }
        bottomNav={
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} showProfileDot={!userRole} />
        }
      >
        <Audit key={auditInitialTab} onDeviceClick={(device) => setSelectedDevice(device)} initialTab={auditInitialTab} />
      </PhoneFrame>
    );
  }

  // 如果切换到"我的"页面
  if (activeTab === 'profile') {
    return (
      <PhoneFrame
        topNav={
          <div className="h-[60px] px-4 py-2 flex items-center">
            {/* 用户头像 */}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-2.5 relative shadow-md">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#BC000F" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center border border-white">
                <svg width="7" height="7" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
            </div>

            {/* 用户名和身份 */}
            <div className="flex-1">
              <div className="text-base font-semibold text-white">三一</div>
              <div className="inline-block px-2 py-0.5 bg-white/20 rounded-full text-[10px] text-white mt-0.5">个体户</div>
            </div>

            {/* 右上角图标 */}
            <div className="flex items-center gap-2">
              {/* 客服图标 - 用户提供的SVG */}
              <button className="w-7 h-7 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                <svg width="16" height="16" viewBox="0 0 1024 1024" fill="white">
                  <path d="M448 917.376C448 917.333333 576 917.333333 576 917.333333c0.085333 0 0-42.709333 0-42.709333C576 874.666667 448 874.666667 448 874.666667c-0.085333 0 0 42.709333 0 42.709333z m371.349333-173.034667C809.6 745.877333 799.573333 746.666667 789.333333 746.666667a21.333333 21.333333 0 0 1-21.333333-21.333334V384a21.333333 21.333333 0 0 1 21.333333-21.333333 191.146667 191.146667 0 0 1 92.373334 23.637333C828.202667 234.517333 681.045333 128 511.296 128 341.290667 128 193.749333 234.816 140.458667 387.328A191.125333 191.125333 0 0 1 234.666667 362.666667a21.333333 21.333333 0 0 1 21.333333 21.333333v341.333333a21.333333 21.333333 0 0 1-21.333333 21.333334 192 192 0 0 1-148.906667-313.216 21.269333 21.269333 0 0 1 0.042667-8.682667C127.36 228.288 304.469333 85.333333 511.274667 85.333333c209.706667 0 388.544 146.944 427.008 347.093334l0.213333 1.344A191.210667 191.210667 0 0 1 981.333333 554.666667c0 70.4-37.909333 131.968-94.421333 165.397333-57.642667 100.693333-154.752 174.762667-268.778667 204.074667A42.517333 42.517333 0 0 1 576 960h-128c-23.573333 0-42.666667-19.157333-42.666667-42.624v-42.752c0-23.552 18.922667-42.624 42.666667-42.624h128c23.573333 0 42.666667 19.157333 42.666667 42.624v5.141333a392.810667 392.810667 0 0 0 200.682666-135.424zM85.333333 554.666667c0.298667 133.589333 128 148.949333 128 148.949333V406.144s-128.298667 14.933333-128 148.522667z m853.333334 0c0.298667-133.589333-128-148.522667-128-148.522667v297.472s127.701333-15.36 128-148.949333z"/>
                </svg>
              </button>
              {/* 设置图标 */}
              <button className="w-7 h-7 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            </div>
          </div>
        }
        bottomNav={
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} showProfileDot={!userRole} />
        }
      >
        <Profile userRole={userRole} onRoleConfirm={(role) => setUserRole(role)} />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame
      topNav={
        <TopNav
          onSearchClick={handleSearchClick}
          onNotificationClick={handleNotificationClick}
          onMoreClick={handleMoreClick}
          onScanClick={handleScanClick}
        />
      }
      bottomNav={
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} isScrolled={isScrolled} onScrollToTop={scrollToTop} showProfileDot={!userRole} />
      }
      floatingButton={
        // 发布按钮：底部导航在 home + 非发布流程 + ContentFeed 上报社区可发布
        activeTab === 'home' && !showPublishPage && isCommunityPublishEligible && isCommunityPublishViewportActive ? (
          <div
            className="w-[56px] h-[56px] bg-brand-red rounded-full flex items-center justify-center shadow-lg cursor-pointer"
            onClick={handlePublishClick}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ) : null
      }
    >
      {/* 中间内容区域 - 可滚动 */}
      <div ref={contentRef} data-scroll-container className="bg-bg-gray h-full overflow-y-auto">
        {/* 快捷功能入口 */}
        <QuickAccess onNavigate={setCurrentPage} />

        {/* 最近查看 */}
        <RecentView onNavigate={(type, item) => {
          if (type === 'recentList') {
            setShowRecentList(true);
          } else if (type === 'recentCard') {
            setSelectedRecentItem(item);
          }
        }} />

        {/* 我的任务 */}
        <MyTasksSummary
          tenantType="enterprise"
          onTaskListClick={() => setShowTaskList(true)}
          onTaskClick={(task) => {
            console.log('点击任务:', task);
            // 实际项目中跳转到任务详情页
          }}
        />

        {/* 设备开机动态 */}
        <DeviceStartup onShowList={() => setShowDeviceStartupList(true)} />

        {/* 审核事件 */}
        <AuditEvents onCategoryClick={handleAuditCategoryClick} />

        {/* 内容信息流 */}
        <ContentFeed
          ref={contentFeedRef}
          showPublishPage={showPublishPage}
          setShowPublishPage={setShowPublishPage}
          setIsCommunityPublishEligible={setIsCommunityPublishEligible}
          setIsCommunityPublishViewportActive={setIsCommunityPublishViewportActive}
        />
      </div>
    </PhoneFrame>
  );
};

export default Home;

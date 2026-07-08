import React, { useState } from 'react';
import PhoneFrame from '../../components/PhoneFrame/PhoneFrame';
import TopNav from '../../components/TopNav/TopNav';
import QuickAccess from '../../components/QuickAccess/QuickAccess';
import RecentView from '../../components/RecentView/RecentView';
import DeviceStartup from '../../components/DeviceStartup/DeviceStartup';
import DeviceStartupList from '../../components/DeviceStartupList/DeviceStartupList';
import AuditEvents from '../../components/AuditEvents/AuditEvents';
import ContentFeed from '../../components/ContentFeed/ContentFeed';
import BottomNav from '../../components/BottomNav/BottomNav';
import SearchPage from '../../components/SearchPage/SearchPage';

const Home = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showPublishPage, setShowPublishPage] = useState(false);
  const [showDeviceStartupList, setShowDeviceStartupList] = useState(false);
  const [showSearchPage, setShowSearchPage] = useState(false);

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
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      }
    >
      {/* 中间内容区域 - 可滚动 */}
      <div className="bg-bg-gray">
        {/* 快捷功能入口 */}
        <QuickAccess />

        {/* 最近查看 */}
        <RecentView />

        {/* 设备开机动态 */}
        <DeviceStartup onShowList={() => setShowDeviceStartupList(true)} />

        {/* 审核事件 */}
        <AuditEvents />

        {/* 内容信息流 */}
        <ContentFeed
          showPublishPage={showPublishPage}
          setShowPublishPage={setShowPublishPage}
        />
      </div>
    </PhoneFrame>
  );
};

export default Home;

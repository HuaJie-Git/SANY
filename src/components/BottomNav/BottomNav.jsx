import React from 'react';

const BottomNav = ({ activeTab, onTabChange, isScrolled, onScrollToTop, showProfileDot = true }) => {
  const tabs = [
    { id: 'home', name: '首页', icon: 'home' },
    { id: 'asset', name: '资产', icon: 'asset' },
    { id: 'ai', name: 'AI助手', icon: 'ai', isSpecial: true },
    { id: 'audit', name: '审核', icon: 'audit' },
    { id: 'profile', name: '我的', icon: 'profile', hasDot: showProfileDot },
  ];

  const renderIcon = (icon, isActive) => {
    const color = isActive ? '#E60012' : '#999999';

    switch (icon) {
      case 'home':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9.5L12 3L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12H15V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'asset':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'audit':
        return (
          <svg width="24" height="24" viewBox="0 0 1024 1024" fill={color}>
            <path d="M831.02 900.23H192.98c-16.48 0-29.84-13.36-29.84-29.84s13.36-29.84 29.84-29.84h638.05c16.48 0 29.84 13.36 29.84 29.84s-13.36 29.84-29.85 29.84zM830.96 781.5h-636.6c-16.48 0-29.84-13.36-29.84-29.84V646.14c0-52.18 42.43-94.63 94.58-94.63h120.6c-1.62-31.43-12.35-81.8-22-92.95-31.94-41.09-49.35-88.7-51.38-138.95-0.17-54.98 22.38-106.98 61.88-143.77 38.87-36.22 91.38-55.03 144.52-51.67 52.71-3.41 104.95 15.2 143.77 51.05 39.42 36.4 62.21 87.94 62.53 141.4-1.89 51.77-19.31 99.61-50.38 139.62-10.39 12.15-21.2 62.36-22.99 93.79h120.58c52.15 0 94.58 42.45 94.58 94.62v107.02c-0.01 16.48-13.37 29.83-29.85 29.83zM224.2 721.82h576.91v-77.18c0-19.26-15.66-34.94-34.9-34.94H625.25c-9.72 0-18.84-4.74-24.43-12.7-8.29-11.81-13.43-25.73-14.9-40.24-0.13-1.27-0.17-2.55-0.14-3.85 0.54-18.83 8.77-101.96 36.64-134.42 22.44-28.95 35.52-64.9 36.93-102.82-0.24-35.71-16.04-71.4-43.35-96.62-27.24-25.15-63.97-37.96-101.05-35.23-1.48 0.12-2.95 0.11-4.43 0.01-37.21-2.87-74.35 10.24-101.64 35.66-27.37 25.51-43 61.53-42.9 98.83 1.5 36.64 14.59 72.43 37.84 102.41 27.31 31.46 35.26 114.92 35.71 133.83 0.03 1.09-0.01 2.19-0.1 3.27-1.25 14.47-6.42 28.54-14.96 40.68a29.876 29.876 0 0 1-24.41 12.67H259.11c-19.24 0-34.9 15.68-34.9 34.95v75.69z"/>
          </svg>
        );
      case 'profile':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
  };

  return (
    <div className="w-full bg-white border-t border-gray-100 px-2 py-2 flex justify-around items-center">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className="flex flex-col items-center justify-center cursor-pointer relative"
          onClick={() => handleTabClick(tab.id)}
        >
          {tab.isSpecial ? (
            <div className="flex flex-col items-center -mt-4">
              <div className="w-[60px] h-[60px] bg-[#E60012] rounded-full flex items-center justify-center shadow-lg" style={{ border: '3px solid white' }}>
                <svg width="40" height="40" viewBox="0 0 1024 1024" fill="white">
                  <path d="M523.878 148.48a60.954 60.954 0 0 1 40.674 106.342l-0.041 56.203h152.381c64.553-0.005 117.919 50.314 121.708 114.754l0.2 7.153v325.084c0.004 64.553-50.315 117.919-114.755 121.702l-7.153 0.205H310.538c-64.553 0.005-117.918-50.314-121.702-114.754l-0.205-7.153V432.932c-0.005-64.553 50.314-117.919 114.755-121.703l7.152-0.204h172.698v-56.162a60.954 60.954 0 0 1 40.642-106.383z m50.79 487.629H452.763a40.637 40.637 0 0 0-4.757 80.988l4.757 0.282h121.907a40.637 40.637 0 1 0 0-81.27zM401.972 473.564c-33.669 0-60.959 27.29-60.959 60.954s27.29 60.953 60.954 60.953 60.954-27.29 60.954-60.953c0-33.664-27.29-60.954-60.954-60.954z m243.81 0c-33.665 0-60.954 27.29-60.954 60.954s27.29 60.953 60.953 60.953c33.664 0 60.954-27.29 60.954-60.953 0-33.664-27.29-60.954-60.954-60.954z m-518.104 0a40.637 40.637 0 0 1 40.346 35.881l0.287 4.757v162.544a40.637 40.637 0 0 1-80.983 4.752l-0.287-4.752V514.202a40.637 40.637 0 0 1 40.637-40.638z m772.076 0a40.632 40.632 0 0 1 40.35 35.881l0.287 4.757v162.544a40.637 40.637 0 0 1-80.988 4.752l-0.281-4.752V514.202a40.632 40.632 0 0 1 40.632-40.638z"/>
                </svg>
              </div>
              <span className="text-[10px] text-gray-700 font-medium mt-1">AI助手</span>
            </div>
          ) : (
            <>
              <div className="relative">
                {renderIcon(tab.icon, activeTab === tab.id)}
                {tab.hasDot && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-red rounded-full"></div>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${activeTab === tab.id ? 'text-brand-red font-medium' : 'text-gray-500'}`}>
                {tab.name}
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default BottomNav;

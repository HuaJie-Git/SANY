import React from 'react';

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', name: '首页', icon: 'home' },
    { id: 'asset', name: '资产', icon: 'asset' },
    { id: 'ai', name: 'AI助手', icon: 'ai', isSpecial: true },
    { id: 'audit', name: '审核', icon: 'audit' },
    { id: 'profile', name: '我的', icon: 'profile', hasDot: true },
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11L12 14L22 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  return (
    <div className="w-full bg-white border-t border-gray-100 px-2 py-2 flex justify-around items-center">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className="flex flex-col items-center justify-center cursor-pointer relative"
          onClick={() => onTabChange(tab.id)}
        >
          {tab.isSpecial ? (
            <div className="w-[50px] h-[50px] bg-brand-red rounded-full flex items-center justify-center -mt-4 shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="white"/>
                <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="white"/>
                <circle cx="12" cy="12" r="2" fill="white"/>
              </svg>
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

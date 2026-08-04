import React from 'react';

const Header = () => {
  return (
    <header
      className="flex items-center justify-between"
      style={{
        height: 56,
        padding: '0 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        flexShrink: 0,
      }}
    >
      {/* Left: Logo */}
      <div className="flex items-center" style={{ gap: 8 }}>
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#e60012',
            letterSpacing: 1,
          }}
        >
          My SANY
        </span>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#e60012',
            display: 'inline-block',
          }}
        />
      </div>

      {/* Center: empty spacer */}
      <div />

      {/* Right: language, notifications, user */}
      <div className="flex items-center" style={{ gap: 20 }}>
        {/* Language selector */}
        <div
          className="flex items-center cursor-pointer"
          style={{ gap: 4, color: '#374151', fontSize: 14 }}
        >
          <span>中文</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="#374151"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Notification bell */}
        <div className="relative cursor-pointer" style={{ width: 24, height: 24 }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z"
              stroke="#6b7280"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.73 21a2 2 0 0 1-3.46 0"
              stroke="#6b7280"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -4,
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: '#e60012',
              color: '#ffffff',
              fontSize: 10,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            3
          </span>
        </div>

        {/* User section */}
        <div className="flex items-center" style={{ gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            SM
          </div>
          <span style={{ fontSize: 14, color: '#374151' }}>管理员</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

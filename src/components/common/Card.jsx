import React from 'react';

export default function Card({ children, title, icon, className = '', titleExtra }) {
  return (
    <div className={`bg-white rounded-lg overflow-hidden ${className}`} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {title && (
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div className="flex items-center gap-2">
            {icon && <span className="text-sm" style={{ color: '#e60012' }}>{icon}</span>}
            <span className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{title}</span>
          </div>
          {titleExtra && <div>{titleExtra}</div>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

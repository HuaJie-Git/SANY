import React from 'react';

export default function QuickLinkIcon({ name, size = 18 }) {
  const paths = {
    link: <><path d="M9 15 7.5 16.5a3.5 3.5 0 0 1-5-5L6 8a3.5 3.5 0 0 1 5 0"/><path d="m15 9 1.5-1.5a3.5 3.5 0 0 1 5 5L18 16a3.5 3.5 0 0 1-5 0M8 12h8"/></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/></>,
    alert: <><path d="M12 3 2.8 20h18.4z"/><path d="M12 9v5M12 17h.01"/></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></>,
    project: <><path d="M4 20V6h6l2 2h8v12z"/><path d="M8 12h8M8 16h5"/></>,
    asset: <><rect x="3" y="8" width="18" height="10" rx="2"/><path d="M7 18v2M17 18v2M7 8l2-4h6l2 4M7 13h.01M17 13h.01"/></>,
    order: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></>,
    person: <><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.link}</svg>;
}

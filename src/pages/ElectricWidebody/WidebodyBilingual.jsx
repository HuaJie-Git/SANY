import React from 'react';

// 当前原型默认中文展示；英文名称保留用于指标语义核对，不增加语言切换。
export function BilingualLabel({ zh, size = 'default', align = 'start', className = '', style = {}, zhStyle = {}, zhWeight = 400 }) {
  if (!zh) return null;
  const fontSize = { title: 16, lg: 14, card: 13, sm: 12, xs: 11 }[size] || 13;
  return (
    <span className={`inline-block max-w-full break-words ${className}`} style={{
      fontSize, fontWeight: size === 'title' ? 600 : zhWeight, lineHeight: 1.4,
      textAlign: align === 'center' ? 'center' : align === 'end' ? 'end' : 'start',
      ...style, ...zhStyle,
    }}>{zh}</span>
  );
}

export default BilingualLabel;

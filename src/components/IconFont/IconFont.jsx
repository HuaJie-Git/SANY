import React from 'react';

const IconFont = ({ name, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <use href={`/sanvist-iconfont.svg#${name}`} />
  </svg>
);

export default IconFont;

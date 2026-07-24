import React from 'react';

const FuelLevelChart = ({ level }) => (
  <div className="mt-7" aria-label="油位曲线">
    <div className="relative h-[130px] pl-7 pb-5">
      <div className="absolute left-0 top-1 bottom-5 flex flex-col justify-between text-[9px] text-[#9198a4]"><span>75</span><span>50</span><span>25</span><span>0</span></div>
      {[4, 36, 68, 100].map((top) => <div key={top} className="absolute left-7 right-0 h-px bg-[#edf0f4]" style={{ top }} />)}
      <svg className="absolute left-7 right-0 bottom-5 h-[92px] w-[calc(100%_-_1.75rem)]" viewBox="0 0 300 92" preserveAspectRatio="none">
        <defs><linearGradient id="fuelArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ff7900" stopOpacity=".9"/><stop offset="1" stopColor="#ffb35c" stopOpacity=".3"/></linearGradient></defs>
        <path d="M0 31H90L102 38H172L184 47H224L234 60H300V92H0Z" fill="url(#fuelArea)" />
        <path d="M0 31H90L102 38H172L184 47H224L234 60H300" fill="none" stroke="#ff7500" strokeWidth="2" />
        <g stroke="#fff" strokeWidth="2" opacity=".9"><path d="M28 31v61M58 31v61M116 38v54M126 38v54M194 47v45M213 47v45"/></g>
      </svg>
      <div className="absolute left-[70%] top-0 -translate-x-1/2 rounded-md bg-[#30343d] px-2.5 py-1.5 text-[10px] leading-4 text-white shadow-lg">16:00<br/>油位：{level}%<span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#30343d]" /></div>
      <div className="absolute left-[70%] top-[54px] bottom-2 w-px bg-[#ef2b2d]"><span className="absolute -left-[3px] -top-[3px] h-[7px] w-[7px] rounded-full border border-white bg-[#ef2b2d]" /></div>
      <div className="absolute bottom-0 left-7 right-0 flex justify-between text-[9px] text-[#7d8491]"><span>0:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>24:00</span></div>
    </div>
  </div>
);

export default FuelLevelChart;

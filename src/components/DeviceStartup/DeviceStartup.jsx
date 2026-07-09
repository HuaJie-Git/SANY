import React from 'react';

const DeviceStartup = ({ onShowList }) => {
  // 模拟工时柱状图数据（0-24小时）
  const hourlyData = [2, 3, 4, 5, 6, 7, 8, 9, 7, 5, 4, 6, 8, 9, 8, 7, 6, 8, 9, 8, 6, 4, 2, 1];
  // 选中/高亮的时段索引（例如第13小时）
  const highlightedIndex = 13;
  // 颜色规范
  const normalColor = '#FFB43D'; // 未选中状态
  const highlightedColor = '#FF8412'; // 选中/高亮状态

  return (
    <div className="px-4 py-3">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[16px] font-medium text-text-primary">设备开机动态</h3>
        <span className="text-[12px] text-text辅助 cursor-pointer" onClick={onShowList}>开机曲线 &gt;</span>
      </div>

      {/* 设备信息卡片 */}
      <div className="bg-white rounded-[11px] p-4 shadow-sm">
        {/* 开机曲线柱状图 - 在最上面 */}
        <div className="mb-4">
          <div className="flex">
            {/* 纵坐标 */}
            <div className="flex flex-col justify-between text-[10px] text-text辅助 mr-1 h-[80px]">
              <span>10</span>
              <span>8</span>
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>
            {/* 柱状图 */}
            <div className="flex-1">
              <div className="h-[80px] flex items-end gap-[2px]">
                {hourlyData.map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${height * 8}px`,
                      backgroundColor: index === highlightedIndex ? highlightedColor : normalColor
                    }}
                  />
                ))}
              </div>
              {/* 时间轴 */}
              <div className="flex justify-between text-[10px] text-text辅助 mt-1">
                <span>1</span>
                <span>4</span>
                <span>7</span>
                <span>10</span>
                <span>13</span>
                <span>16</span>
                <span>19</span>
                <span>22</span>
              </div>
            </div>
          </div>
        </div>

        {/* 设备编号和图片 - 中间 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-[40px] h-[30px] rounded overflow-hidden">
              <img
                src="images/机手社区/挖掘机/挖掘机_02.jpg"
                alt="设备图片"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-[14px] font-medium text-text-primary">SAC1300C8PHEVHUF</div>
          </div>
          <div className="text-text辅助">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4L10 8L6 12" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* 工时数据 */}
        <div className="flex justify-between mb-3">
          <div>
            <div className="text-[24px] font-bold text-text-primary">2.3h</div>
            <div className="text-[12px] text-text辅助">当日总工时</div>
          </div>
          <div className="text-right">
            <div className="text-[24px] font-bold text-text-primary">1.0h</div>
            <div className="text-[12px] text-text辅助">总速工时</div>
          </div>
        </div>

        {/* 开机时段分布 - 时间轴在上面 */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-text辅助 mb-1">
            <span>0</span>
            <span>2</span>
            <span>4</span>
            <span>6</span>
            <span>8</span>
            <span>10</span>
            <span>12</span>
            <span>14</span>
            <span>16</span>
            <span>18</span>
            <span>20</span>
            <span>22</span>
            <span>24(h)</span>
          </div>
          {/* 工时分布条 - 灰、黄、蓝三种颜色 */}
          <div className="flex gap-1">
            <div className="flex-[3] h-[8px] bg-gray-300 rounded"></div>
            <div className="flex-[2] h-[8px] bg-gray-300 rounded"></div>
            <div className="flex-[1] h-[8px] bg-yellow-500 rounded"></div>
            <div className="flex-[2] h-[8px] bg-gray-300 rounded"></div>
            <div className="flex-[3] h-[8px] bg-blue-500 rounded"></div>
            <div className="flex-[2] h-[8px] bg-gray-300 rounded"></div>
            <div className="flex-[1] h-[8px] bg-yellow-500 rounded"></div>
            <div className="flex-[2] h-[8px] bg-gray-300 rounded"></div>
          </div>
        </div>

        {/* 地区、时间和导航按钮 */}
        <div className="flex items-start justify-between mb-3">
          <div className="text-[12px] text-text-secondary">
            <div className="flex items-center gap-1 mb-1">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 1C4.79 1 3 2.79 3 5C3 8 7 13 7 13C7 13 11 8 11 5C11 2.79 9.21 1 7 1ZM7 6.5C6.17 6.5 5.5 5.83 5.5 5C5.5 4.17 6.17 3.5 7 3.5C7.83 3.5 8.5 4.17 8.5 5C8.5 5.83 7.83 6.5 7 6.5Z" fill="#666"/>
              </svg>
              <span>美国·纽约州-希恩街880号</span>
            </div>
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="6" stroke="#666" strokeWidth="1.5"/>
                <path d="M7 3.5V7L9.5 8.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>2024-12-28 18:03 (GMT+8)</span>
            </div>
          </div>
          {/* 导航按钮 */}
          <div className="w-[32px] h-[32px] bg-blue-500 rounded-full flex items-center justify-center cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 14L8 2L14 14L8 10L2 14Z" fill="white"/>
            </svg>
          </div>
        </div>

        {/* 更多按钮 */}
        <div className="flex justify-center">
          <div
            className="flex items-center gap-1 text-[12px] text-text辅助 cursor-pointer"
            onClick={onShowList}
          >
            <span>更多</span>
            <span className="text-[14px]">（36台）</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceStartup;

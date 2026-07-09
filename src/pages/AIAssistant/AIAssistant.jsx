import React, { useState } from 'react';

const AIAssistant = ({ onBack }) => {
  const [message, setMessage] = useState('');

  // 快捷问题
  const quickQuestions = [
    'SY215 发动机无法启动',
    '故障码 P0100 是什么',
    '查一下液压泵维修手册'
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* 聊天内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* AI欢迎消息 */}
        <div className="mb-6">
          <div className="flex items-start mb-3">
            {/* AI头像 */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="11" width="18" height="10" rx="2"/>
                <circle cx="12" cy="5" r="2"/>
                <path d="M12 7v4"/>
                <circle cx="8" cy="16" r="1" fill="white"/>
                <circle cx="16" cy="16" r="1" fill="white"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm">
                <div className="text-base font-semibold text-gray-900 mb-2">你好，我是维修助手</div>
                <div className="text-sm text-gray-600 mb-4">我能帮你诊断故障、查询故障码和维修资料</div>
                <div className="text-sm text-gray-500 mb-3">试试问我：</div>
                <div className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      • {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部输入区域 */}
      <div className="bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* 相册图标 */}
          <button className="w-8 h-8 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>

          {/* 输入框 */}
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="请输入问题..."
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>

          {/* 麦克风图标 */}
          <button className="w-8 h-8 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>

          {/* 发送按钮 */}
          <button className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;

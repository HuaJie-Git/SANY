import React, { useState, useEffect, useRef } from 'react';

const CommunityPublish = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1: 选择来源, 2: 编辑内容, 3: 录制视频
  const [selectedImages, setSelectedImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [content, setContent] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  // 视频录制状态
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [recordDuration, setRecordDuration] = useState(0);
  const countdownRef = useRef(null);

  const topics = ['设备操作', '保养技巧', '工程现场', '新手入门', '经验分享'];

  // 倒计时逻辑
  useEffect(() => {
    if (isRecording && countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // 倒计时结束，自动停止录制
            clearInterval(countdownRef.current);
            setIsRecording(false);
            setStep(2);
            return 30;
          }
          return prev - 1;
        });
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [isRecording, countdown]);

  // 获取倒计时颜色（绿色→黄色→红色）
  const getCountdownColor = () => {
    if (countdown > 20) return '#22C55E'; // 绿色
    if (countdown > 10) return '#F59E0B'; // 黄色
    return '#EF4444'; // 红色
  };

  // 获取进度条宽度百分比
  const getProgressWidth = () => {
    return ((30 - countdown) / 30) * 100;
  };

  const handleTakePhoto = () => {
    const mockPhoto = '/images/img_excavator.jpg';
    setSelectedImages([mockPhoto]);
    setStep(2);
  };

  const handleSelectFromAlbum = () => {
    const mockImages = [
      '/images/img_excavator.jpg',
      '/images/img_crane.jpg',
    ];
    setSelectedImages(mockImages);
    setStep(2);
  };

  const handleStartRecord = () => {
    setStep(3);
    setCountdown(30);
    setRecordDuration(0);
    setIsRecording(true);
  };

  const handleStopRecord = () => {
    clearInterval(countdownRef.current);
    setIsRecording(false);
    setStep(2);
  };

  const handleRemoveImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    if (newImages.length === 0 && !videoFile) {
      setStep(1);
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (selectedImages.length === 0) {
      setStep(1);
    }
  };

  const handlePublish = () => {
    if (selectedImages.length === 0 && !videoFile) {
      alert('请先选择图片、拍照或录制视频');
      return;
    }
    if (!content.trim()) {
      alert('请输入内容');
      return;
    }
    alert('发布成功，等待审核');
    onClose();
  };

  // ====== 第三步：录制视频（倒计时30秒） ======
  if (step === 3) {
    return (
      <div className="absolute inset-0 bg-black z-50 flex flex-col">
        {/* 状态栏 */}
        <div className="h-[44px] flex items-center justify-between px-4">
          <span className="text-white text-[14px] font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M1 8H3V12H1V8Z" fill="white"/>
              <path d="M5 5H7V12H5V5Z" fill="white"/>
              <path d="M9 3H11V12H9V3Z" fill="white"/>
              <path d="M13 0H15V12H13V0Z" fill="white"/>
            </svg>
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
              <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="white" strokeOpacity="0.35"/>
              <rect x="2" y="2" width="18" height="8" rx="1" fill="white"/>
              <path d="M23 4V8C23.5523 8 24 7.5523 24 7V5C24 4.4477 23.5523 4 23 4Z" fill="white" fillOpacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* 顶部倒计时区域 */}
        <div className="flex flex-col items-center py-8">
          {/* 倒计时数字 */}
          <div
            className="text-[72px] font-bold mb-4"
            style={{ color: getCountdownColor() }}
          >
            {countdown}
          </div>

          {/* 进度条 */}
          <div className="w-[280px] h-[6px] bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${getProgressWidth()}%`,
                backgroundColor: getCountdownColor(),
              }}
            />
          </div>

          {/* 录制时长 */}
          <div className="text-white text-[14px] mt-3">
            已录制 {recordDuration} 秒 / 最长 30 秒
          </div>
        </div>

        {/* 相机预览区域（模拟） */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-[200px] h-[200px] border-2 border-white/30 rounded-full flex items-center justify-center">
            <div className="text-white/50 text-[14px] text-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-2">
                <path d="M42 32L32 22L10 44" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
                <rect x="6" y="6" width="36" height="36" rx="4" stroke="white" strokeWidth="2" opacity="0.3"/>
              </svg>
              相机预览区域
            </div>
          </div>
        </div>

        {/* 底部控制栏 */}
        <div className="flex items-center justify-between px-8 py-8">
          {/* 取消按钮 */}
          <div
            className="cursor-pointer"
            onClick={() => {
              clearInterval(countdownRef.current);
              setIsRecording(false);
              setStep(1);
            }}
          >
            <span className="text-white text-[14px]">取消</span>
          </div>

          {/* 录制/停止按钮 */}
          <div
            className="cursor-pointer"
            onClick={isRecording ? handleStopRecord : handleStartRecord}
          >
            {isRecording ? (
              // 停止按钮（红色方块）
              <div className="w-[72px] h-[72px] rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-[32px] h-[32px] bg-red-500 rounded-md"></div>
              </div>
            ) : (
              // 录制按钮（红色圆圈）
              <div className="w-[72px] h-[72px] rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-[56px] h-[56px] bg-red-500 rounded-full"></div>
              </div>
            )}
          </div>

          {/* 完成按钮 */}
          <div
            className="cursor-pointer"
            onClick={() => {
              clearInterval(countdownRef.current);
              setIsRecording(false);
              if (recordDuration > 0) {
                setVideoFile({ duration: recordDuration });
                setStep(2);
              }
            }}
          >
            <span className={`text-[14px] ${recordDuration > 0 ? 'text-white' : 'text-white/40'}`}>
              完成
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ====== 第一步：选择图片来源 ======
  if (step === 1) {
    return (
      <div className="absolute inset-0 bg-white z-50 flex flex-col">
        {/* 状态栏 */}
        <div className="h-[44px] flex items-center justify-between px-4 bg-white">
          <span className="text-black text-[14px] font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M1 8H3V12H1V8Z" fill="#333"/>
              <path d="M5 5H7V12H5V5Z" fill="#333"/>
              <path d="M9 3H11V12H9V3Z" fill="#333"/>
              <path d="M13 0H15V12H13V0Z" fill="#333"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M8 2C10.76 2 13.07 3.61 14.1 6L15.5 4.5C14.14 2.58 11.23 1 8 1C4.77 1 1.86 2.58 0.5 4.5L1.9 6C2.93 3.61 5.24 2 8 2Z" fill="#333"/>
              <path d="M8 5C9.66 5 11.14 5.69 12.11 6.88L13.5 5.5C12.2 3.98 10.21 3 8 3C5.79 3 3.8 3.98 2.5 5.5L3.89 6.88C4.86 5.69 6.34 5 8 5Z" fill="#333"/>
              <path d="M8 8C8.83 8 9.58 8.34 10.12 8.9L11.5 7.5C10.6 6.6 9.37 6 8 6C6.63 6 5.4 6.6 4.5 7.5L5.88 8.9C6.42 8.34 7.17 8 8 8Z" fill="#333"/>
              <circle cx="8" cy="11" r="1.5" fill="#333"/>
            </svg>
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
              <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="#333" strokeOpacity="0.35"/>
              <rect x="2" y="2" width="18" height="8" rx="1" fill="#333"/>
              <path d="M23 4V8C23.5523 8 24 7.5523 24 7V5C24 4.4477 23.5523 4 23 4Z" fill="#333" fillOpacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="cursor-pointer" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[16px] font-medium text-gray-800">动态发布</span>
          <div className="w-[24px]"></div>
        </div>

        {/* 选择来源区域 */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-[200px] h-[200px] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center mb-8">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4">
              <rect x="6" y="6" width="36" height="36" rx="4" stroke="#999" strokeWidth="2"/>
              <circle cx="16" cy="16" r="3" fill="#999"/>
              <path d="M42 32L32 22L10 44" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[14px] text-gray-400">选择图片、拍照或录制视频</span>
          </div>

          {/* 三个操作按钮 */}
          <div className="flex gap-6">
            {/* 拍照 */}
            <div className="flex flex-col items-center cursor-pointer" onClick={handleTakePhoto}>
              <div className="w-[64px] h-[64px] bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M27 24C27 24.53 26.79 25.04 26.41 25.41C26.04 25.79 25.53 26 25 26H7C6.47 26 5.96 25.79 5.59 25.41C5.21 25.04 5 24.53 5 24V12C5 11.47 5.21 10.96 5.59 10.59C5.96 10.21 6.47 10 7 10H11L13 7H19L21 10H25C25.53 10 26.04 10.21 26.41 10.59C26.79 10.96 27 11.47 27 12V24Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="16" cy="17" r="4" stroke="#3B82F6" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-[14px] text-gray-800">拍照</span>
            </div>

            {/* 相册 */}
            <div className="flex flex-col items-center cursor-pointer" onClick={handleSelectFromAlbum}>
              <div className="w-[64px] h-[64px] bg-green-100 rounded-full flex items-center justify-center mb-2">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="4" width="24" height="24" rx="2" stroke="#22C55E" strokeWidth="2"/>
                  <circle cx="10" cy="10" r="2" fill="#22C55E"/>
                  <path d="M28 20L22 14L6 30" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[14px] text-gray-800">相册</span>
            </div>

            {/* 录制视频 */}
            <div className="flex flex-col items-center cursor-pointer" onClick={handleStartRecord}>
              <div className="w-[64px] h-[64px] bg-red-100 rounded-full flex items-center justify-center mb-2">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="8" width="18" height="16" rx="2" stroke="#EF4444" strokeWidth="2"/>
                  <path d="M22 14L28 10V22L22 18" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[14px] text-gray-800">录制视频</span>
            </div>
          </div>
        </div>

        {/* 提示文字 */}
        <div className="px-4 pb-4 text-center">
          <span className="text-[12px] text-gray-400">图片最多5张，视频最长30秒</span>
        </div>
      </div>
    );
  }

  // ====== 第二步：编辑内容 ======
  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col">
      {/* 状态栏 */}
      <div className="h-[44px] flex items-center justify-between px-4 bg-white">
        <span className="text-black text-[14px] font-medium">9:41</span>
        <div className="flex items-center gap-1">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M1 8H3V12H1V8Z" fill="#333"/>
            <path d="M5 5H7V12H5V5Z" fill="#333"/>
            <path d="M9 3H11V12H9V3Z" fill="#333"/>
            <path d="M13 0H15V12H13V0Z" fill="#333"/>
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 2C10.76 2 13.07 3.61 14.1 6L15.5 4.5C14.14 2.58 11.23 1 8 1C4.77 1 1.86 2.58 0.5 4.5L1.9 6C2.93 3.61 5.24 2 8 2Z" fill="#333"/>
            <path d="M8 5C9.66 5 11.14 5.69 12.11 6.88L13.5 5.5C12.2 3.98 10.21 3 8 3C5.79 3 3.8 3.98 2.5 5.5L3.89 6.88C4.86 5.69 6.34 5 8 5Z" fill="#333"/>
            <path d="M8 8C8.83 8 9.58 8.34 10.12 8.9L11.5 7.5C10.6 6.6 9.37 6 8 6C6.63 6 5.4 6.6 4.5 7.5L5.88 8.9C6.42 8.34 7.17 8 8 8Z" fill="#333"/>
            <circle cx="8" cy="11" r="1.5" fill="#333"/>
          </svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="#333" strokeOpacity="0.35"/>
            <rect x="2" y="2" width="18" height="8" rx="1" fill="#333"/>
            <path d="M23 4V8C23.5523 8 24 7.5523 24 7V5C24 4.4477 23.5523 4 23 4Z" fill="#333" fillOpacity="0.4"/>
          </svg>
        </div>
      </div>

      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="cursor-pointer" onClick={() => setStep(1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-[16px] font-medium text-gray-800">编辑内容</span>
        <div
          className="px-4 py-1.5 bg-red-600 rounded-full cursor-pointer"
          onClick={handlePublish}
        >
          <span className="text-[14px] text-white">发布</span>
        </div>
      </div>

      {/* 已选择的内容 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-wrap gap-2">
          {/* 视频预览 */}
          {videoFile && (
            <div className="relative w-[100px] h-[100px]">
              <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <polygon points="12,8 24,16 12,24" fill="white"/>
                </svg>
              </div>
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">
                {videoFile.duration}秒
              </div>
              <div
                className="absolute -top-1 -right-1 w-[24px] h-[24px] bg-black/50 rounded-full flex items-center justify-center cursor-pointer"
                onClick={handleRemoveVideo}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M10.5 3.5L3.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M3.5 3.5L10.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          )}

          {/* 图片预览 */}
          {selectedImages.map((image, index) => (
            <div key={index} className="relative w-[100px] h-[100px]">
              <img
                src={image}
                alt={`图片${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <div
                className="absolute -top-1 -right-1 w-[24px] h-[24px] bg-black/50 rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => handleRemoveImage(index)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M10.5 3.5L3.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M3.5 3.5L10.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          ))}

          {/* 添加更多（图片+视频不超过5个） */}
          {(selectedImages.length + (videoFile ? 1 : 0)) < 5 && (
            <div
              className="w-[100px] h-[100px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer"
              onClick={() => setStep(1)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
                <path d="M5 12H19" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          )}
        </div>
        <div className="text-[12px] text-gray-400 mt-2">
          {videoFile ? `视频 ${videoFile.duration}秒` : ''}{selectedImages.length > 0 ? ` ${selectedImages.length}/5 张图片` : ''}
        </div>
      </div>

      {/* 内容输入区 */}
      <div className="flex-1 p-4">
        <textarea
          className="w-full h-[120px] text-[14px] text-gray-800 placeholder-gray-400 resize-none outline-none"
          placeholder="分享你的操作经验、设备故事..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
        />
        <div className="text-right text-[12px] text-gray-400">
          {content.length}/500
        </div>

        {/* 话题选择 */}
        <div className="mt-4">
          <div className="text-[14px] font-medium text-gray-800 mb-2">选择话题</div>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <div
                key={topic}
                className={`px-3 py-1.5 rounded-full text-[12px] cursor-pointer ${
                  selectedTopic === topic
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => setSelectedTopic(selectedTopic === topic ? '' : topic)}
              >
                # {topic}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部工具栏 */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-6">
          {/* 图片按钮 */}
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => setStep(1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#666" strokeWidth="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="#666"/>
              <path d="M21 15L16 10L5 21" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[12px] text-gray-600">图片</span>
          </div>

          {/* 视频按钮 */}
          <div className="flex items-center gap-1 cursor-pointer" onClick={handleStartRecord}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="14" height="14" rx="2" stroke="#666" strokeWidth="2"/>
              <path d="M17 9L22 6V18L17 15" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[12px] text-gray-600">视频</span>
          </div>

          {/* 话题按钮 */}
          <div className="flex items-center gap-1 cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 10C20 10 19 16 12 16C5 16 4 10 4 10" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16V21" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 21H16" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[12px] text-gray-600">话题</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPublish;

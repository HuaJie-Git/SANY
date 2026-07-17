import React, { useEffect, useRef, useState } from 'react';

const VIDEO_LIMIT_SECONDS = 3 * 60;
const CONTENT_MAX_LENGTH = 500;
const DAILY_PUBLISH_LIMIT = 10;
const DAILY_PUBLISH_STORAGE_KEY = 'sanvist-community-daily-publish-count';

const getLocalDateKey = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

const readDailyPublishCount = () => {
  if (typeof window === 'undefined') return 0;

  try {
    const record = JSON.parse(window.localStorage.getItem(DAILY_PUBLISH_STORAGE_KEY));
    return record?.date === getLocalDateKey() ? Number(record.count) || 0 : 0;
  } catch {
    return 0;
  }
};

const saveDailyPublishCount = (count) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    DAILY_PUBLISH_STORAGE_KEY,
    JSON.stringify({ date: getLocalDateKey(), count }),
  );
};

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const FEEDBACK_COPY = {
  missingMedia: {
    title: '还没有可发布的内容',
    description: '请先拍照、选择图片或录制视频。',
    confirmText: '返回继续',
  },
  missingContent: {
    title: '请输入内容',
    description: '写一点内容再发布，让大家知道你想分享什么。',
    confirmText: '继续编辑',
  },
  dailyLimit: {
    title: '今日发布已达上限',
    description: `每天最多发布 ${DAILY_PUBLISH_LIMIT} 条内容，请明天再来。`,
    confirmText: '知道了',
  },
  success: {
    title: '发布成功',
    description: '内容已提交，等待审核。',
    confirmText: '完成',
  },
};

const FeedbackDialog = ({ type, onConfirm }) => {
  if (!type) return null;

  const feedback = FEEDBACK_COPY[type];
  const isSuccess = type === 'success';

  return (
    <div
      className="absolute inset-0 z-[80] flex items-center justify-center bg-black/45 px-8 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-feedback-title"
    >
      <div className="w-full overflow-hidden rounded-[20px] bg-white shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
        <div className="px-6 pb-5 pt-7 text-center">
          <div
            className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
              isSuccess ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
            }`}
          >
            {isSuccess ? (
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12.5L9.2 16.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span className="text-[24px] font-semibold leading-none">!</span>
            )}
          </div>
          <h3 id="publish-feedback-title" className="text-[18px] font-semibold text-gray-900">
            {feedback.title}
          </h3>
          <p className="mt-2 text-[14px] leading-6 text-gray-500">{feedback.description}</p>
        </div>
        <div className="border-t border-gray-100 p-3">
          <button
            type="button"
            className="h-11 w-full rounded-xl bg-[#E60012] text-[15px] font-medium text-white transition-colors active:bg-[#C90010]"
            onClick={onConfirm}
          >
            {feedback.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const CommunityPublish = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1: 相机界面, 2: 编辑内容
  const [selectedImages, setSelectedImages] = useState([]);
  const [content, setContent] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [cameraMode, setCameraMode] = useState('photo'); // photo 或 video
  const [isRecording, setIsRecording] = useState(false);
  const [videoTimeLeft, setVideoTimeLeft] = useState(VIDEO_LIMIT_SECONDS);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null);
  const [dailyPublishCount, setDailyPublishCount] = useState(readDailyPublishCount);
  const contentInputRef = useRef(null);

  const topics = ['设备操作', '保养技巧', '工程现场', '新手入门', '经验分享'];

  useEffect(() => {
    if (!isRecording) return undefined;

    const timer = window.setInterval(() => {
      setVideoTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          window.clearInterval(timer);
          setIsRecording(false);
          setRecordedVideo({ duration: VIDEO_LIMIT_SECONDS });
          return 0;
        }

        return currentTime - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRecording]);

  // 拍照
  const handleTakePhoto = () => {
    const mockPhoto = 'images/img_excavator.jpg';
    setSelectedImages([mockPhoto]);
  };

  // 从相册选择
  const handleSelectFromAlbum = () => {
    const mockImages = [
      'images/img_excavator.jpg',
      'images/img_crane.jpg',
    ];
    setSelectedImages(mockImages);
  };

  const handleCameraModeChange = (nextMode) => {
    setIsRecording(false);
    setCameraMode(nextMode);

    if (nextMode === 'video') {
      setVideoTimeLeft(VIDEO_LIMIT_SECONDS);
      setRecordedVideo(null);
    }
  };

  const handleVideoRecord = () => {
    if (isRecording) {
      const duration = VIDEO_LIMIT_SECONDS - videoTimeLeft;
      setIsRecording(false);

      if (duration > 0) {
        setRecordedVideo({ duration });
      }
      return;
    }

    setVideoTimeLeft(VIDEO_LIMIT_SECONDS);
    setRecordedVideo(null);
    setIsRecording(true);
  };

  const handleCapture = () => {
    if (cameraMode === 'video') {
      handleVideoRecord();
      return;
    }

    handleTakePhoto();
  };

  // 勾选确认，进入编辑页面
  const handleConfirm = () => {
    if (selectedImages.length === 0 && !recordedVideo) {
      setFeedbackType('missingMedia');
      return;
    }
    setStep(2);
  };

  // 发布
  const handlePublish = () => {
    if (selectedImages.length === 0 && !recordedVideo) {
      setFeedbackType('missingMedia');
      return;
    }
    if (!content.trim()) {
      setFeedbackType('missingContent');
      return;
    }
    if (dailyPublishCount >= DAILY_PUBLISH_LIMIT) {
      setFeedbackType('dailyLimit');
      return;
    }

    // 原型阶段使用本地计数模拟每日发布限制，接入接口后改由服务端校验。
    const nextPublishCount = dailyPublishCount + 1;
    saveDailyPublishCount(nextPublishCount);
    setDailyPublishCount(nextPublishCount);
    setFeedbackType('success');
  };

  const handleFeedbackConfirm = () => {
    const confirmedType = feedbackType;
    setFeedbackType(null);

    if (confirmedType === 'success') {
      onClose();
      return;
    }

    if (confirmedType === 'missingContent') {
      window.setTimeout(() => contentInputRef.current?.focus(), 0);
    }
  };

  // ====== 第一步：相机界面（用户给的参考图） ======
  if (step === 1) {
    const videoProgress = videoTimeLeft / VIDEO_LIMIT_SECONDS;
    const progressCircumference = 666;

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

        {/* 返回按钮 */}
        <div className="absolute top-[60px] left-4 cursor-pointer" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* 相机预览区域 */}
        <div className="flex-1 flex items-center justify-center">
          {cameraMode === 'video' ? (
            <div className="relative w-[240px] h-[240px] flex items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" width="240" height="240" viewBox="0 0 240 240" aria-hidden="true">
                <circle cx="120" cy="120" r="106" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.14)" strokeWidth="4" />
                <circle
                  cx="120"
                  cy="120"
                  r="106"
                  fill="none"
                  stroke={videoTimeLeft <= 10 ? '#FFB0B0' : '#FF3B30'}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={progressCircumference}
                  strokeDashoffset={progressCircumference * (1 - videoProgress)}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              <div className="relative flex flex-col items-center text-center">
                <div className="h-5 flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full bg-[#FF3B30] ${isRecording ? 'animate-pulse' : ''}`} />
                  <span className="text-[12px] tracking-[0.18em] text-white/60">
                    {isRecording ? '录制中' : recordedVideo ? '已停止' : '视频模式'}
                  </span>
                </div>
                <div
                  className={`text-[48px] leading-none font-semibold tabular-nums tracking-[-0.04em] ${videoTimeLeft <= 10 ? 'text-[#FFB0B0]' : 'text-white'}`}
                >
                  {formatDuration(videoTimeLeft)}
                </div>
                <div className="text-[12px] text-white/45 mt-3">
                  {recordedVideo
                    ? `已录制 ${formatDuration(recordedVideo.duration)}`
                    : '最长可录制 3 分钟'}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-[200px] h-[200px] border-2 border-white/30 rounded-full flex items-center justify-center">
              <div className="text-white/50 text-[14px] text-center">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-2">
                  <rect x="6" y="6" width="36" height="36" rx="4" stroke="white" strokeWidth="2" opacity="0.3"/>
                  <circle cx="16" cy="16" r="3" fill="white" opacity="0.3"/>
                  <path d="M42 32L32 22L10 44" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
                </svg>
                相机预览区域
              </div>
            </div>
          )}
        </div>

        {/* 底部控制栏 */}
        <div className="flex items-center justify-between px-8 py-8">
          {/* 已选图片数量和缩略图 */}
          <div className="flex flex-col items-center">
            <span className="text-white text-[14px] mb-1">5/4</span>
            <div className="w-[48px] h-[48px] bg-gray-600 rounded-lg overflow-hidden">
              <img src="images/img_excavator.jpg" alt="" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* 拍照/视频切换和拍照按钮 */}
          <div className="flex flex-col items-center">
            <div className="flex gap-4 mb-4">
              <span
                className={`text-[14px] cursor-pointer transition-colors ${cameraMode === 'photo' ? 'text-white font-medium' : 'text-white/50'}`}
                onClick={() => handleCameraModeChange('photo')}
                role="button"
                aria-pressed={cameraMode === 'photo'}
              >
                拍照
              </span>
              <span
                className={`text-[14px] cursor-pointer transition-colors ${cameraMode === 'video' ? 'text-white font-medium' : 'text-white/50'}`}
                onClick={() => handleCameraModeChange('video')}
                role="button"
                aria-pressed={cameraMode === 'video'}
              >
                视频
              </span>
            </div>
            {/* 拍照/录制按钮 */}
            <div
              className="w-[72px] h-[72px] rounded-full border-4 border-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              onClick={handleCapture}
              role="button"
              aria-label={cameraMode === 'video' ? (isRecording ? '停止录制' : '开始录制') : '拍照'}
            >
              <div
                className={`transition-all duration-200 ${
                  cameraMode === 'video'
                    ? isRecording
                      ? 'w-[28px] h-[28px] bg-[#FF3B30] rounded-[7px]'
                      : 'w-[56px] h-[56px] bg-[#FF3B30] rounded-full'
                    : 'w-[56px] h-[56px] bg-white rounded-full'
                }`}
              />
            </div>
          </div>

          {/* 相册按钮 */}
          <div className="flex flex-col items-center cursor-pointer" onClick={handleSelectFromAlbum}>
            <span className="text-white text-[14px] mb-1">相册</span>
            <div className="w-[48px] h-[48px] bg-gray-600 rounded-lg overflow-hidden">
              <img src="images/img_crane.jpg" alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* 勾选确认按钮 - 右上角 */}
        {(selectedImages.length > 0 || recordedVideo) && !isRecording && (
          <div
            className="absolute top-[60px] right-4 w-[32px] h-[32px] bg-green-500 rounded-full flex items-center justify-center cursor-pointer"
            onClick={handleConfirm}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        )}

        <FeedbackDialog type={feedbackType} onConfirm={handleFeedbackConfirm} />
      </div>
    );
  }

  // ====== 第二步：编辑内容页面 ======
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
        <button
          type="button"
          className="min-w-[48px] rounded-full px-2 py-1 text-[14px] font-medium text-red-500 active:bg-red-50"
          onClick={handlePublish}
        >
          发布
        </button>
      </div>

      {/* 已选图片预览 */}
      <div className="p-4">
        <div className="flex gap-2 mb-4">
          {recordedVideo && (
            <div className="relative w-[80px] h-[80px] rounded-lg overflow-hidden bg-gradient-to-br from-gray-700 to-black flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true">
                  <path d="M13 8L1 15V1L13 8Z" fill="white" />
                </svg>
              </div>
              <span className="absolute left-1.5 bottom-1 text-[10px] text-white tabular-nums bg-black/55 px-1.5 py-0.5 rounded">
                {formatDuration(recordedVideo.duration)}
              </span>
              <div
                className="absolute top-1 right-1 w-[20px] h-[20px] bg-black/50 rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => {
                  setRecordedVideo(null);
                  if (selectedImages.length === 0) setStep(1);
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
            </div>
          )}
          {selectedImages.map((img, index) => (
            <div key={index} className="relative w-[80px] h-[80px]">
              <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
              <div
                className="absolute top-1 right-1 w-[20px] h-[20px] bg-black/50 rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => {
                  const newImages = selectedImages.filter((_, i) => i !== index);
                  setSelectedImages(newImages);
                  if (newImages.length === 0) setStep(1);
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 选择话题 */}
      <div className="px-4 mb-4">
        <div className="text-[14px] text-gray-500 mb-2">选择话题</div>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <div
              key={topic}
              className={`px-3 py-1.5 rounded-full text-[12px] cursor-pointer ${
                selectedTopic === topic
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setSelectedTopic(topic)}
            >
              {topic}
            </div>
          ))}
        </div>
      </div>

      {/* 内容输入 */}
      <div className="relative flex-1 px-4 pb-4">
        <textarea
          ref={contentInputRef}
          className="h-full w-full resize-none border-none pb-8 pr-1 text-[14px] leading-6 text-gray-800 outline-none placeholder-gray-400"
          placeholder="分享你的故事..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={CONTENT_MAX_LENGTH}
          aria-describedby="content-character-count"
        />
        <div
          id="content-character-count"
          className={`pointer-events-none absolute bottom-5 right-5 rounded-full bg-white/90 px-2 py-1 text-[12px] tabular-nums shadow-[0_1px_8px_rgba(0,0,0,0.05)] ${
            content.length >= CONTENT_MAX_LENGTH ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          {content.length}/{CONTENT_MAX_LENGTH}
        </div>
      </div>

      <FeedbackDialog type={feedbackType} onConfirm={handleFeedbackConfirm} />
    </div>
  );
};

export default CommunityPublish;

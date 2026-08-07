import React, { useState, useRef, useEffect } from 'react';
import { getAdminTopics } from '../../admin/adminTopics';
import { officialPublish } from '../../admin/adminContent';

const OfficialPublishDialog = ({ onClose, onSuccess }) => {
  const [topics, setTopics] = useState(() => getAdminTopics().filter((t) => t.status === '开启'));

  // 每次打开时重新拉取开启中话题（确保从话题管理新建后实时同步）
  useEffect(() => {
    setTopics(getAdminTopics().filter((t) => t.status === '开启'));
  }, []);

  const [form, setForm] = useState({
    type: '',           // 必选下拉
    topicId: '',
    title: '',
    content: '',
    publishMode: 'immediate',
    scheduledTime: '',
  });

  // 媒体：图片
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'file'
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const imageInputRef = useRef(null);

  // 媒体：视频
  const [videoMode, setVideoMode] = useState('url');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const videoInputRef = useRef(null);

  // 媒体：视频封面
  const [coverMode, setCoverMode] = useState('url');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const coverInputRef = useRef(null);

  // 视频时长（自动识别）
  const [videoDuration, setVideoDuration] = useState('');

  // 账号关联
  const [useOfficialAccount, setUseOfficialAccount] = useState(true);
  const [accountForm, setAccountForm] = useState({ username: '三一官方', phone: '' });
  const [accountVerified, setAccountVerified] = useState(false);

  // 官方标识
  const [useOfficialBadge, setUseOfficialBadge] = useState(true);

  const [errors, setErrors] = useState({});

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // 文件选择处理
  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (type === 'image') {
      setImageFile(file);
      setImagePreview(preview);
    } else if (type === 'video') {
      setVideoFile(file);
      setVideoPreview(preview);
      // 自动识别视频时长
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.onloadedmetadata = () => {
        const dur = vid.duration;
        const m = Math.floor(dur / 60);
        const s = Math.floor(dur % 60);
        setVideoDuration(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      };
      vid.src = preview;
    } else if (type === 'cover') {
      setCoverFile(file);
      setCoverPreview(preview);
    }
  };

  // 清理 blob URL
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [imagePreview, videoPreview, coverPreview]);

  const handleVerifyAccount = () => {
    if (accountForm.username && accountForm.phone) {
      setAccountVerified(true);
    }
  };

  const handlePublish = () => {
    const errs = {};

    // 类型和话题必选
    if (!form.type) errs.type = '请选择内容类型';
    if (!form.topicId) errs.topicId = '请选择关联话题';

    // 官方账号必须使用且验证通过
    if (!useOfficialAccount) {
      errs.account = '官方发布必须使用官方账号';
    } else if (!accountVerified) {
      errs.account = '请先完成账号关联验证';
    }

    // 至少有一项内容：标题、正文、或媒体
    const hasImage = form.type === 'image' && (imageMode === 'url' ? !!imageUrl.trim() : !!imageFile);
    const hasVideo = form.type === 'video' && (videoMode === 'url' ? !!videoUrl.trim() : !!videoFile);
    const hasMedia = hasImage || hasVideo;
    const hasText = !!(form.title.trim() || form.content.trim());

    if (!hasText && !hasMedia) {
      errs.content = '标题、正文、媒体至少填写一项';
    }

    // 视频类型必须有视频和封面
    if (form.type === 'video') {
      if (!hasVideo) errs.video = '请提供视频';
      const hasCover = coverMode === 'url' ? !!coverUrl.trim() : !!coverFile;
      if (!hasCover) errs.cover = '请提供视频封面';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const selectedTopic = topics.find((t) => t.id === Number(form.topicId));
    const finalImage = form.type === 'image'
      ? (imageMode === 'url' ? imageUrl : imagePreview)
      : (coverMode === 'url' ? coverUrl : coverPreview);

    officialPublish({
      title: form.title || (form.content ? form.content.slice(0, 30) : '官方发布'),
      content: form.content,
      topicId: Number(form.topicId),
      type: form.type,
      image: finalImage,
      duration: form.type === 'video' ? videoDuration || undefined : undefined,
      topicCode: selectedTopic?.code,
    });

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45" onClick={onClose}>
      <div className="bg-white rounded-xl w-[720px] max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* 标题 */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-gray-900">官方发布</h2>
          <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* 内容类型 + 关联话题 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] text-gray-700 mb-1"><span className="text-red-500">*</span> 内容类型</label>
              <select value={form.type} onChange={(e) => updateField('type', e.target.value)} className={`w-full h-9 px-3 border rounded text-[13px] focus:outline-none focus:border-[#1890ff] ${errors.type ? 'border-red-400' : 'border-gray-300'}`}>
                <option value="">请选择内容类型</option>
                <option value="image">图片</option>
                <option value="video">视频</option>
              </select>
              {errors.type && <div className="text-[11px] text-red-500 mt-0.5">{errors.type}</div>}
            </div>
            <div>
              <label className="block text-[13px] text-gray-700 mb-1"><span className="text-red-500">*</span> 关联话题</label>
              <select value={form.topicId} onChange={(e) => updateField('topicId', e.target.value)} className={`w-full h-9 px-3 border rounded text-[13px] focus:outline-none focus:border-[#1890ff] ${errors.topicId ? 'border-red-400' : 'border-gray-300'}`}>
                <option value="">请选择话题</option>
                {topics.map((t) => <option key={t.id} value={t.id}>#{t.name}</option>)}
              </select>
              {errors.topicId && <div className="text-[11px] text-red-500 mt-0.5">{errors.topicId}</div>}
            </div>
          </div>

          {/* 标题（非必填） */}
          <div>
            <label className="block text-[13px] text-gray-700 mb-1">标题</label>
            <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]" placeholder="请输入标题（选填）" />
          </div>

          {/* 正文（非必填） */}
          <div>
            <label className="block text-[13px] text-gray-700 mb-1">正文</label>
            <textarea value={form.content} onChange={(e) => updateField('content', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] resize-none focus:outline-none focus:border-[#1890ff]" placeholder="请输入正文内容（选填）" />
          </div>

          {/* ─── 媒体区域 ─── */}
          {form.type === 'image' && (
            <div>
              <label className="block text-[13px] text-gray-700 mb-1"><span className="text-red-500">*</span> 图片</label>
              <div className="flex gap-2 mb-2">
                <button type="button" className={`h-7 px-3 rounded text-[12px] border ${imageMode === 'url' ? 'bg-[#1890ff] text-white border-[#1890ff]' : 'border-gray-300 text-gray-600'}`} onClick={() => setImageMode('url')}>URL地址</button>
                <button type="button" className={`h-7 px-3 rounded text-[12px] border ${imageMode === 'file' ? 'bg-[#1890ff] text-white border-[#1890ff]' : 'border-gray-300 text-gray-600'}`} onClick={() => setImageMode('file')}>本地上传</button>
              </div>
              {imageMode === 'url' ? (
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]" placeholder="请输入图片URL" />
              ) : (
                <div className="flex items-center gap-3">
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'image')} />
                  <button type="button" className="h-9 px-4 border border-dashed border-gray-300 rounded text-[12px] text-gray-600 hover:border-[#1890ff] hover:text-[#1890ff]" onClick={() => imageInputRef.current?.click()}>选择文件</button>
                  {imageFile && <span className="text-[12px] text-gray-500">{imageFile.name}</span>}
                  {imagePreview && <img src={imagePreview} alt="" className="h-9 w-9 object-cover rounded" />}
                </div>
              )}
            </div>
          )}

          {form.type === 'video' && (
            <>
              {/* 视频地址 */}
              <div>
                <label className="block text-[13px] text-gray-700 mb-1"><span className="text-red-500">*</span> 视频</label>
                <div className="flex gap-2 mb-2">
                  <button type="button" className={`h-7 px-3 rounded text-[12px] border ${videoMode === 'url' ? 'bg-[#1890ff] text-white border-[#1890ff]' : 'border-gray-300 text-gray-600'}`} onClick={() => setVideoMode('url')}>URL地址</button>
                  <button type="button" className={`h-7 px-3 rounded text-[12px] border ${videoMode === 'file' ? 'bg-[#1890ff] text-white border-[#1890ff]' : 'border-gray-300 text-gray-600'}`} onClick={() => setVideoMode('file')}>本地上传</button>
                </div>
                {videoMode === 'url' ? (
                  <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]" placeholder="请输入视频URL" />
                ) : (
                  <div className="flex items-center gap-3">
                    <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, 'video')} />
                    <button type="button" className="h-9 px-4 border border-dashed border-gray-300 rounded text-[12px] text-gray-600 hover:border-[#1890ff] hover:text-[#1890ff]" onClick={() => videoInputRef.current?.click()}>选择文件</button>
                    {videoFile && <span className="text-[12px] text-gray-500">{videoFile.name}</span>}
                  </div>
                )}
                {errors.video && <div className="text-[11px] text-red-500 mt-0.5">{errors.video}</div>}
                {videoDuration && <div className="text-[12px] text-gray-500 mt-1">视频时长：{videoDuration}（自动识别）</div>}
              </div>

              {/* 视频封面 */}
              <div>
                <label className="block text-[13px] text-gray-700 mb-1"><span className="text-red-500">*</span> 视频封面</label>
                <div className="flex gap-2 mb-2">
                  <button type="button" className={`h-7 px-3 rounded text-[12px] border ${coverMode === 'url' ? 'bg-[#1890ff] text-white border-[#1890ff]' : 'border-gray-300 text-gray-600'}`} onClick={() => setCoverMode('url')}>封面URL</button>
                  <button type="button" className={`h-7 px-3 rounded text-[12px] border ${coverMode === 'file' ? 'bg-[#1890ff] text-white border-[#1890ff]' : 'border-gray-300 text-gray-600'}`} onClick={() => setCoverMode('file')}>本地上传</button>
                </div>
                {coverMode === 'url' ? (
                  <input type="text" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]" placeholder="请输入封面URL" />
                ) : (
                  <div className="flex items-center gap-3">
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'cover')} />
                    <button type="button" className="h-9 px-4 border border-dashed border-gray-300 rounded text-[12px] text-gray-600 hover:border-[#1890ff] hover:text-[#1890ff]" onClick={() => coverInputRef.current?.click()}>选择文件</button>
                    {coverFile && <span className="text-[12px] text-gray-500">{coverFile.name}</span>}
                    {coverPreview && <img src={coverPreview} alt="" className="h-9 w-16 object-cover rounded" />}
                  </div>
                )}
                {errors.cover && <div className="text-[11px] text-red-500 mt-0.5">{errors.cover}</div>}
              </div>
            </>
          )}

          {/* 内容至少一项提示 */}
          {errors.content && <div className="text-[12px] text-red-500">{errors.content}</div>}

          {/* 发布方式 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] text-gray-700 mb-1">发布方式</label>
              <div className="flex gap-4">
                {[{ v: 'immediate', l: '立即发布' }, { v: 'scheduled', l: '定时发布' }].map((o) => (
                  <label key={o.v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="publishMode" checked={form.publishMode === o.v} onChange={() => updateField('publishMode', o.v)} className="w-4 h-4 text-[#1890ff]" />
                    <span className="text-[13px] text-gray-700">{o.l}</span>
                  </label>
                ))}
              </div>
            </div>
            {form.publishMode === 'scheduled' && (
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">定时时间</label>
                <input type="datetime-local" value={form.scheduledTime} onChange={(e) => updateField('scheduledTime', e.target.value)} className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]" />
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* ─── 账号关联区 ─── */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input type="checkbox" checked={useOfficialAccount} onChange={(e) => { setUseOfficialAccount(e.target.checked); setAccountVerified(false); }} className="w-4 h-4 rounded border-gray-300 text-[#1890ff]" />
              <span className="text-[14px] font-medium text-gray-900">使用官方账号</span>
            </label>
            {useOfficialAccount && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-1">用户名</label>
                    <input type="text" value={accountForm.username} onChange={(e) => { setAccountForm((p) => ({ ...p, username: e.target.value })); setAccountVerified(false); }} className="w-full h-8 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-1">手机号</label>
                    <input type="tel" value={accountForm.phone} onChange={(e) => { setAccountForm((p) => ({ ...p, phone: e.target.value })); setAccountVerified(false); }} className="w-full h-8 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]" placeholder="请输入手机号" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" className="h-8 px-4 bg-[#1890ff] text-white rounded text-[12px] hover:bg-[#40a9ff]" onClick={handleVerifyAccount}>关联验证</button>
                  {accountVerified && <span className="text-[12px] text-green-600 flex items-center gap-1">✓ 验证通过</span>}
                </div>
                {errors.account && <div className="text-[12px] text-red-500">{errors.account}</div>}
              </div>
            )}
          </div>

          {/* ─── 标识区 ─── */}
          <div>
            <label className={`flex items-center gap-2 mb-2 ${!useOfficialAccount || !accountVerified ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <input type="checkbox" checked={useOfficialBadge} disabled={!useOfficialAccount || !accountVerified} onChange={(e) => setUseOfficialBadge(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#1890ff]" />
              <span className="text-[14px] font-medium text-gray-900">使用官方标识</span>
            </label>
            {!useOfficialAccount && <div className="text-[12px] text-gray-400 ml-6">需先开启并验证官方账号后方可使用</div>}
            {useOfficialAccount && !accountVerified && <div className="text-[12px] text-orange-500 ml-6">请先完成账号关联验证</div>}
            {useOfficialAccount && accountVerified && useOfficialBadge && (
              <div className="text-[12px] text-green-600 ml-6">✓ 发布后将在社区瀑布流和详情页展示"官方"标识</div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-3">
          <button className="h-9 px-6 border border-gray-300 rounded text-[14px] text-gray-600 hover:bg-gray-50" onClick={onClose}>取消</button>
          <button className="h-9 px-6 bg-[#ff4d4f] text-white rounded text-[14px] font-medium hover:bg-[#ff7875]" onClick={handlePublish}>发布</button>
        </div>
      </div>
    </div>
  );
};

export default OfficialPublishDialog;

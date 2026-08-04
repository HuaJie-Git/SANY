import React, { useState } from 'react';
import {
  PLACEHOLDER_OPTIONS,
  checkPlaceholderOccupied,
} from '../../admin/adminTopics';

const LANGUAGES = [
  { key: 'zh', label: '中文' },
  { key: 'en', label: '英语' },
  { key: 'id', label: '印尼语' },
  { key: 'fr', label: '法语' },
  { key: 'es', label: '西班牙语' },
  { key: 'pt', label: '葡萄牙语' },
  { key: 'th', label: '泰语' },
  { key: 'ar', label: '阿拉伯语' },
  { key: 'ru', label: '俄语' },
  { key: 'it', label: '意大利语' },
  { key: 'de', label: '德语' },
  { key: 'km', label: '柬埔寨语' },
  { key: 'ko', label: '韩语' },
  { key: 'ms', label: '马来语' },
  { key: 'vi', label: '越南语' },
];

// 三列布局：每行3个语言
const LANG_ROWS = [];
for (let i = 0; i < LANGUAGES.length; i += 3) {
  LANG_ROWS.push(LANGUAGES.slice(i, i + 3));
}

const TopicDialog = ({ topic, onSave, onClose }) => {
  const isEdit = !!topic;

  const [form, setForm] = useState({
    sort: topic?.sort ?? '',
    type: topic?.type ?? '热门话题',
    status: topic?.status ?? '开启',
    name: topic?.name ?? '',
    i18n: topic?.i18n ?? Object.fromEntries(LANGUAGES.map((l) => [l.key, ''])),
  });

  // 占位话题关联：开关 + 单选占位位
  const [placeholderEnabled, setPlaceholderEnabled] = useState(!!topic?.placeholder);
  const [placeholderKey, setPlaceholderKey] = useState(topic?.placeholder ?? '');
  const [placeholderError, setPlaceholderError] = useState('');
  // 确认更换弹窗：{ placeholderKey, occupant }
  const [confirmDialog, setConfirmDialog] = useState(null);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateI18n = (langKey, value) =>
    setForm((prev) => ({
      ...prev,
      i18n: { ...prev.i18n, [langKey]: value },
    }));

  // 当前话题名称（新增未保存时为空，用"当前话题"代称）
  const currentTopicName = form.name.trim() || '当前话题';

  // 占位开关：话题总状态关闭时禁止开启
  const handlePlaceholderToggle = () => {
    if (form.status === '关闭') return;
    setPlaceholderError('');
    if (placeholderEnabled) {
      // 关闭开关 = 解除当前话题的占位关联
      setPlaceholderEnabled(false);
      setPlaceholderKey('');
    } else {
      setPlaceholderEnabled(true);
    }
  };

  // 选择占位位：被其他开启中话题占用时弹出确认更换
  const handlePlaceholderSelect = (key) => {
    setPlaceholderError('');
    const check = checkPlaceholderOccupied(key, topic?.id);
    if (check.conflict) {
      setConfirmDialog({ placeholderKey: key, occupant: check.occupant });
      return;
    }
    setPlaceholderKey(key);
  };

  // 确认更换：立即绑定该占位位并保存（旧话题由数据层解除关联）
  const handleConfirmSwitch = () => {
    if (!confirmDialog) return;
    const key = confirmDialog.placeholderKey;
    setConfirmDialog(null);
    setPlaceholderKey(key);
    commit(key);
  };

  const handleSave = () => {
    let placeholder = null;
    if (placeholderEnabled) {
      if (!placeholderKey) {
        setPlaceholderError('请选择要关联的占位话题');
        return;
      }
      placeholder = placeholderKey;
    }
    commit(placeholder);
  };

  const commit = (placeholder) => {
    const finalI18n = { ...form.i18n, zh: form.name };
    onSave({
      ...form,
      sort: Number(form.sort) || 0,
      i18n: finalI18n,
      placeholder,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-[880px] max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-gray-900">
            {isEdit ? '编辑-话题' : '新增-话题'}
          </h2>
          <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* 基础信息 - 两列布局（话题类型由系统固定为热门话题，无需配置） */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
            {/* 排序 */}
            <div>
              <label className="block text-[13px] text-gray-700 mb-1">
                <span className="text-red-500">*</span> 排序：
              </label>
              <input
                type="number"
                value={form.sort}
                onChange={(e) => updateField('sort', e.target.value)}
                className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff] bg-yellow-50"
                placeholder="请输入排序号"
              />
            </div>
            {/* 状态 */}
            <div>
              <label className="block text-[13px] text-gray-700 mb-1">状态：</label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]"
              >
                <option value="开启">开启</option>
                <option value="关闭">关闭</option>
              </select>
            </div>
          </div>

          {/* 占位话题关联 */}
          <div className={`mb-5 rounded-lg border p-4 ${form.status === '关闭' ? 'bg-gray-50 border-gray-200' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={placeholderEnabled}
                aria-label={placeholderEnabled ? '关闭占位话题关联' : '开启占位话题关联'}
                onClick={handlePlaceholderToggle}
                className={`relative w-[40px] h-[22px] rounded-full transition-colors flex-shrink-0 ${placeholderEnabled ? 'bg-[#52c41a]' : 'bg-gray-300'} ${form.status === '关闭' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <span className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all ${placeholderEnabled ? 'left-[20px]' : 'left-[2px]'}`} />
              </button>
              <span className="text-[13px] text-gray-700 font-medium">占位话题</span>
              {placeholderEnabled && (
                <span className="text-[12px] text-green-600">已开启</span>
              )}
              {form.status === '关闭' && (
                <span className="text-[12px] text-orange-500">话题关闭状态下不可关联占位话题，开启话题后可设置</span>
              )}
            </div>
            {placeholderEnabled && (
              <div className="flex items-center gap-6 pl-[52px] mt-3">
                {PLACEHOLDER_OPTIONS.map((key) => (
                  <label
                    key={key}
                    className={`flex items-center gap-1.5 ${form.status === '关闭' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <input
                      type="radio"
                      name="placeholder"
                      value={key}
                      checked={placeholderKey === key}
                      disabled={form.status === '关闭'}
                      onChange={() => handlePlaceholderSelect(key)}
                      className="w-3.5 h-3.5 accent-[#1890ff] disabled:cursor-not-allowed"
                    />
                    <span className="text-[13px] text-gray-600">{key}</span>
                  </label>
                ))}
                {placeholderKey && (
                  <span className="text-[12px] text-blue-600 flex-shrink-0">已关联占位入口：{placeholderKey}</span>
                )}
                {placeholderError && (
                  <span className="text-[12px] text-red-500">{placeholderError}</span>
                )}
              </div>
            )}
          </div>

          {/* 中文话题名称 */}
          <div className="mb-5">
            <label className="block text-[13px] text-gray-700 mb-1">
              <span className="text-red-500">*</span> 话题名称（中文）：
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff] bg-yellow-50"
              placeholder="请输入话题名称"
            />
          </div>

          {/* ─── 多语言名称 ─── */}
          <div>
            <div className="text-[14px] font-medium text-gray-900 mb-3">多语言话题名称</div>
            {LANG_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-3 gap-x-6 gap-y-3 mb-3">
                {row.map((lang) => (
                  <div key={lang.key}>
                    <label className="block text-[13px] text-gray-700 mb-1">{lang.label}：</label>
                    <input
                      type="text"
                      value={lang.key === 'zh' ? form.name : (form.i18n[lang.key] || '')}
                      onChange={(e) => {
                        if (lang.key === 'zh') {
                          updateField('name', e.target.value);
                        } else {
                          updateI18n(lang.key, e.target.value);
                        }
                      }}
                      disabled={lang.key === 'zh'}
                      className={`w-full h-9 px-3 border rounded text-[13px] focus:outline-none focus:border-[#1890ff] ${
                        lang.key === 'zh'
                          ? 'bg-yellow-50 border-gray-200 text-gray-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="请输入话题名称"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            className="h-9 px-6 border border-gray-300 rounded text-[14px] text-gray-600 hover:bg-gray-50"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="h-9 px-6 bg-[#1890ff] text-white rounded text-[14px] font-medium hover:bg-[#40a9ff]"
            onClick={handleSave}
          >
            确认
          </button>
        </div>
      </div>

      {/* ─── 占位话题更换确认弹窗 ─── */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45" onClick={() => setConfirmDialog(null)}>
          <div className="bg-white rounded-xl w-[440px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-gray-900">占位话题更换确认</h3>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setConfirmDialog(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 text-[13px] leading-relaxed">
              <div className="text-gray-700">
                「{confirmDialog.placeholderKey}」当前已关联话题「
                <span className="text-gray-900 font-medium">#{confirmDialog.occupant.name}</span>
                」。
              </div>
              <div className="text-gray-700">
                确认更换后：话题「<span className="text-gray-900 font-medium">#{currentTopicName}</span>」将关联「{confirmDialog.placeholderKey}」，
                原关联话题「<span className="text-gray-900 font-medium">#{confirmDialog.occupant.name}</span>」将自动解除该占位关联；
                {placeholderKey && placeholderKey !== confirmDialog.placeholderKey && (
                  <span>当前话题此前关联的「{placeholderKey}」也将一并解除；</span>
                )}
                每个占位位始终只关联一个开启中话题。
              </div>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                className="h-9 px-6 border border-gray-300 rounded text-[14px] text-gray-600 hover:bg-gray-50"
                onClick={() => setConfirmDialog(null)}
              >
                取消
              </button>
              <button
                className="h-9 px-6 bg-[#1890ff] text-white rounded text-[14px] font-medium hover:bg-[#40a9ff]"
                onClick={handleConfirmSwitch}
              >
                确认更换
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicDialog;

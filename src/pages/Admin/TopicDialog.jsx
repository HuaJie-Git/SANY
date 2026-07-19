import React, { useState } from 'react';
import {
  TOPIC_TYPES,
  TYPE_TO_MAPPING,
  TYPE_TO_PLACEHOLDER,
  validatePlaceholderType,
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
    type: topic?.type ?? '',
    status: topic?.status ?? '开启',
    name: topic?.name ?? '',
    i18n: topic?.i18n ?? Object.fromEntries(LANGUAGES.map((l) => [l.key, ''])),
  });

  const [typeError, setTypeError] = useState('');

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'type') setTypeError('');
  };

  const updateI18n = (langKey, value) =>
    setForm((prev) => ({
      ...prev,
      i18n: { ...prev.i18n, [langKey]: value },
    }));

  const handleSave = () => {
    // 校验占位类型冲突
    if (TYPE_TO_PLACEHOLDER[form.type]) {
      const check = validatePlaceholderType(form.type, topic?.id);
      if (!check.valid) {
        setTypeError(check.message);
        return;
      }
    }

    const finalI18n = { ...form.i18n, zh: form.name };

    onSave({
      ...form,
      sort: Number(form.sort) || 0,
      i18n: finalI18n,
    });
  };

  // 当前类型对应的映射位置
  const currentMapping = TYPE_TO_MAPPING[form.type];

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
          {/* 基础信息 - 三列布局 */}
          <div className="grid grid-cols-3 gap-x-6 gap-y-4 mb-5">
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
            {/* 话题类型 */}
            <div>
              <label className="block text-[13px] text-gray-700 mb-1">话题类型：</label>
              <select
                value={form.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]"
              >
                <option value="">请选择话题类型</option>
                {TOPIC_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {typeError && (
                <div className="text-[12px] text-red-500 mt-1">{typeError}</div>
              )}
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

          {/* 社区前台位置提示（由类型自动决定） */}
          {currentMapping && (
            <div className="mb-5 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1890ff" strokeWidth="2" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
              </svg>
              <span className="text-[13px] text-blue-700">
                社区前台位置：<span className="font-medium">{currentMapping}</span>
                {TYPE_TO_PLACEHOLDER[form.type] && (
                  <span className="text-blue-500 ml-1">（映射 APP 占位入口：{TYPE_TO_PLACEHOLDER[form.type]}）</span>
                )}
              </span>
            </div>
          )}

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
    </div>
  );
};

export default TopicDialog;

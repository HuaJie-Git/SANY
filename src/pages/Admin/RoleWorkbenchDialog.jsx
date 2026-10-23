import React, { useState, useRef, useEffect } from 'react';
import { ADMIN_ROLES, getRoleStorageKey } from '../../admin/roleWorkbench';

const DIALOG_LANGUAGES = [
  { code: 'zh', label: '中文', isRequired: true },
  { code: 'id', label: '印尼语' },
  { code: 'fr', label: '法语' },
  { code: 'es', label: '西班牙语' },
  { code: 'pt', label: '葡萄牙语' },
  { code: 'th', label: '泰语' },
  { code: 'ar', label: '阿拉伯语', rtl: true },
  { code: 'ru', label: '俄罗斯语' },
  { code: 'it', label: '意大利语' },
  { code: 'de', label: '德语' },
  { code: 'km', label: '柬埔寨语' },
  { code: 'ko', label: '韩语' },
  { code: 'ms', label: '马来语' },
  { code: 'vi', label: '越南语' },
];

const JUMP_TYPE_LABELS = {
  internal: '原生',
  h5: 'H5',
  external: '外部链接',
};

const isImageValue = (val) => {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (trimmed.startsWith('data:')) {
    return /^data:image\/(png|jpe?g|webp|gif|svg\+xml)[;,]/i.test(trimmed);
  }
  if (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  ) {
    return true;
  }
  return /\.(png|jpe?g|svg|webp|gif)$/i.test(trimmed);
};

export default function RoleWorkbenchDialog({
  record,
  onClose,
  onSave,
  platform = 'app',
  section = 'workbench',
  _role = '',
  layoutFieldsReadOnly = false,
}) {
  const isEditing = Boolean(record && record.id);
  const isCustom = Boolean(record?.custom || !record?.id);
  const isModules = (platform === 'pc' || platform === 'app') && section === 'modules';

  // defaultVisible 只读统一资料的 defaultVisible，不受角色 item.visible 影响 (R-014-D)
  const initialDefaultVisible = record?.defaultVisible === 'no' ? 'no' : 'yes';

  // 中文名称：优先回读 translations.zh，缺失则回退原 name
  const initialZhName =
    record?.translations?.zh !== undefined && record?.translations?.zh !== ''
      ? record.translations.zh
      : record?.name || '';

  const [form, setForm] = useState({
    ...record,
    enName: record?.enName || '',
    jumpType: record?.jumpType || 'internal',
    jumpUrl: record?.jumpUrl || '',
    defaultVisible: initialDefaultVisible,
    productGroup: record?.productGroup || 'all',
    roleTarget: record?.roleTarget || 'all',
    pro: record?.pro ? 'yes' : 'no',
    showBadge: Boolean(record?.showBadge),
    sort: record?.sort !== undefined ? record.sort : 10,
    icon: record?.icon || '',
    iconFileName:
      record?.iconFileName ||
      (record?.icon && isImageValue(record.icon) ? 'icon' : ''),
    localeIcons: { ...(record?.localeIcons || {}) },
    localeIconFileNames: { ...(record?.localeIconFileNames || {}) },
    translations: {
      ...(record?.translations || {}),
      zh: initialZhName,
    },
  });

  const [selectedDiffSourceIndex, setSelectedDiffSourceIndex] = useState(null);
  const [diffSourceError, setDiffSourceError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [zhError, setZhError] = useState('');
  const [fileError, setFileError] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);

  const isMountedRef = useRef(true);
  const activeReaderRef = useRef(null);
  const readGenerationRef = useRef(0);
  const zhInputRef = useRef(null);
  const baseFileInputRef = useRef(null);
  const localeFileInputRefs = useRef({});

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (activeReaderRef.current) {
        try {
          activeReaderRef.current.abort();
        } catch {
          // ignore
        }
        activeReaderRef.current = null;
      }
    };
  }, []);

  // 资料来源切换以所选公共资料为准，不能把旧来源翻译或语言图标合并回来，不注入显隐/置顶/排序 (R-014-D)
  // 图片锁边界：读取中禁用来源切换，检查同步 reader 锁并作废旧 reader 回调，避免覆盖新选取的来源
  const handleSelectDiffSource = (source, idx) => {
    if (isReadingFile || activeReaderRef.current) {
      return;
    }

    readGenerationRef.current += 1;
    if (activeReaderRef.current) {
      try {
        activeReaderRef.current.abort();
      } catch {
        // ignore
      }
      activeReaderRef.current = null;
    }

    setSelectedDiffSourceIndex(idx);
    setDiffSourceError('');
    setSaveError('');
    const srcData = source?.data || {};
    const srcZhName = srcData.translations?.zh || srcData.name || '';
    setForm((prev) => ({
      ...prev,
      name: srcZhName,
      enName: srcData.enName || '',
      translations: {
        ...(srcData.translations || {}),
        zh: srcZhName,
      },
      icon: srcData.icon !== undefined ? srcData.icon : '',
      iconFileName: srcData.iconFileName || '',
      localeIcons: { ...(srcData.localeIcons || {}) },
      localeIconFileNames: { ...(srcData.localeIconFileNames || {}) },
      jumpType: srcData.jumpType || 'internal',
      jumpUrl: srcData.jumpUrl !== undefined ? srcData.jumpUrl : '',
      productGroup: srcData.productGroup || 'all',
      roleTarget: srcData.roleTarget || 'all',
      pro: srcData.pro ? 'yes' : 'no',
      showBadge: Boolean(srcData.showBadge),
      category: srcData.category || prev.category || '其他',
    }));
  };

  const handleZhNameChange = (val) => {
    setForm((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        zh: val,
      },
    }));
    if (val.trim() && zhError) {
      setZhError('');
    }
  };

  const handleTransChange = (langCode, value) => {
    setForm((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [langCode]: value,
      },
    }));
  };

  const validateImageFile = (file) => {
    if (!file) return { valid: false, message: '' };

    const mime = file.type ? file.type.trim().toLowerCase() : '';
    const hasValidExt = /\.(png|jpe?g)$/i.test(file.name);

    // 如果提供了明确的非图片/不支持的 MIME（即使扩展名为 .png 也必须拒绝）
    if (mime) {
      const isAllowedMime =
        mime === 'image/png' || mime === 'image/jpeg' || mime === 'image/jpg';
      if (!isAllowedMime) {
        return {
          valid: false,
          message: '图片格式错误，仅支持 jpg 或 png 格式（检测到非图片类型）',
        };
      }
    } else {
      // MIME 缺失时按扩展名处理
      if (!hasValidExt) {
        return {
          valid: false,
          message: '图片格式错误，仅支持 jpg 或 png 格式',
        };
      }
    }

    return { valid: true };
  };

  const handleFileSelect = (file, onReadSuccess) => {
    if (!file) return;

    // 单 reader 同步读取锁：读取中禁止并发读取
    if (isReadingFile || activeReaderRef.current) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setFileError(validation.message);
      return;
    }

    setFileError('');
    setIsReadingFile(true);

    if (activeReaderRef.current) {
      try {
        activeReaderRef.current.abort();
      } catch {
        // ignore
      }
      activeReaderRef.current = null;
    }

    const currentGen = readGenerationRef.current + 1;
    readGenerationRef.current = currentGen;

    try {
      const reader = new FileReader();
      activeReaderRef.current = reader;

      reader.onload = () => {
        if (!isMountedRef.current || readGenerationRef.current !== currentGen) {
          return;
        }
        activeReaderRef.current = null;
        setIsReadingFile(false);
        const result = reader.result;
        if (typeof result === 'string') {
          onReadSuccess(result, file.name);
        }
      };

      reader.onerror = () => {
        if (!isMountedRef.current || readGenerationRef.current !== currentGen) {
          return;
        }
        activeReaderRef.current = null;
        setIsReadingFile(false);
        setFileError('图片读取失败，请重新选择');
      };

      reader.onabort = () => {
        if (!isMountedRef.current || readGenerationRef.current !== currentGen) {
          return;
        }
        activeReaderRef.current = null;
        setIsReadingFile(false);
      };

      let blobToRead = file;
      if (!file.type || !file.type.trim()) {
        const isPng = /\.png$/i.test(file.name);
        const inferredMime = isPng ? 'image/png' : 'image/jpeg';
        blobToRead = new Blob([file], { type: inferredMime });
      }

      reader.readAsDataURL(blobToRead);
    } catch {
      activeReaderRef.current = null;
      setIsReadingFile(false);
      setFileError('图片读取发生异常，请重新选择');
    }
  };

  const handleBaseFileChange = (e) => {
    if (isReadingFile) return;
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    handleFileSelect(file, (dataUrl, fileName) => {
      setForm((prev) => ({
        ...prev,
        icon: dataUrl,
        iconFileName: fileName,
      }));
    });
  };

  const handleRemoveBaseIcon = () => {
    if (isReadingFile) return;
    setForm((prev) => ({
      ...prev,
      icon: '',
      iconFileName: '',
    }));
  };

  const handleLocaleFileChange = (code, e) => {
    if (isReadingFile) return;
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    handleFileSelect(file, (dataUrl, fileName) => {
      setForm((prev) => ({
        ...prev,
        localeIcons: {
          ...prev.localeIcons,
          [code]: dataUrl,
        },
        localeIconFileNames: {
          ...prev.localeIconFileNames,
          [code]: fileName,
        },
      }));
    });
  };

  const handleRemoveLocaleIcon = (code) => {
    if (isReadingFile) return;
    setForm((prev) => {
      const nextIcons = { ...prev.localeIcons };
      delete nextIcons[code];
      const nextNames = { ...prev.localeIconFileNames };
      delete nextNames[code];
      return {
        ...prev,
        localeIcons: nextIcons,
        localeIconFileNames: nextNames,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 读取中或保存中拦截提交防重复
    if (isReadingFile || activeReaderRef.current || isSaving) return;

    // 存在角色差异时必须先显式选取资料来源
    if (
      record?.hasRoleDifferences &&
      record?.diffSources &&
      record.diffSources.length > 1 &&
      selectedDiffSourceIndex === null
    ) {
      setDiffSourceError('检测到该入口存在历史角色差异，请先显式选取资料来源作为统一基准');
      return;
    }

    const zhName = (form.translations?.zh || '').trim();
    if (!zhName) {
      setZhError('请输入中文名称');
      zhInputRef.current?.focus();
      return;
    }

    const isVisible = form.defaultVisible === 'yes';

    // 保留合法排序号 0，不使用 Number(value) || 10
    const trimmedSort =
      typeof form.sort === 'string' ? form.sort.trim() : form.sort;
    const parsedSort =
      trimmedSort === '' || trimmedSort === null || trimmedSort === undefined
        ? NaN
        : Number(trimmedSort);
    const finalSort = Number.isFinite(parsedSort)
      ? parsedSort
      : Number.isFinite(Number(record?.sort))
      ? Number(record.sort)
      : 10;

    // 提交以当前 form 翻译为准（zh 必填），选源切换后不复活旧来源语言，未切源时保留原有未知语言 (R-014-E)
    const nextTranslations = {
      ...(selectedDiffSourceIndex === null ? (record?.translations || {}) : {}),
      ...form.translations,
      zh: zhName,
    };
    if (
      record?.translations &&
      !('en' in record.translations) &&
      !('en' in form.translations)
    ) {
      delete nextTranslations.en;
    }

    try {
      setIsSaving(true);
      setSaveError('');
      await onSave({
        ...record,
        ...form,
        name: zhName,
        enName: form.enName || '',
        translations: nextTranslations,
        // 提交以当前 map 为准，含已删除的语言图标，不被旧 record 恢复
        localeIcons: { ...form.localeIcons },
        localeIconFileNames: { ...form.localeIconFileNames },
        icon: form.icon || '',
        iconFileName: form.icon ? form.iconFileName || '' : '',
        sort: finalSort,
        roleTarget: form.roleTarget || 'all',
        productGroup: form.productGroup || 'all',
        pro: form.pro === 'yes',
        showBadge: Boolean(form.showBadge),
        visible: isVisible,
        defaultVisible: form.defaultVisible,
        jumpType: form.jumpType,
        jumpUrl: form.jumpUrl,
      });
    } catch (err) {
      setSaveError(err.message || '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const hasBaseIcon =
    form.icon !== undefined && form.icon !== null && form.icon !== '';
  const isBaseIconImage = isImageValue(form.icon);
  const isBaseOctetStream =
    typeof form.icon === 'string' &&
    form.icon.trim().startsWith('data:') &&
    !isBaseIconImage;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
      <div
        className="bg-white rounded-xl w-[1420px] max-w-[94vw] max-h-[96vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* 顶部标题 */}
        <div className="px-8 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white gap-3">
          <div className="flex flex-wrap items-center gap-2.5 min-w-0 pr-2">
            <h2 id="dialog-title" className="text-[18px] font-bold text-gray-900 shrink-0">
              {layoutFieldsReadOnly
                ? (isEditing ? '编辑入口' : '新建入口')
                : (isEditing ? '编辑配置' : '新增配置')}
            </h2>
            {layoutFieldsReadOnly ? (
              <p className="text-[13px] text-gray-500 break-words">
                修改影响本区域所有使用该入口的配置对象
              </p>
            ) : (
              <span className="text-[12px] text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded font-medium break-words">
                保存后同步更新当前端/区域内使用此入口的角色
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none shrink-0"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        {/* 错误提示横条 */}
        {saveError && (
          <div className="px-8 py-2.5 bg-red-50 text-red-600 text-[12px] border-b border-red-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold">保存失败：</span>
              <span>{saveError}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveError('')}
              className="text-red-400 hover:text-red-600 font-bold ml-2"
              aria-label="关闭错误提示"
            >
              ✕
            </button>
          </div>
        )}

        {fileError && (
          <div className="px-8 py-2 bg-red-50 text-red-600 text-[12px] border-b border-red-100 flex items-center justify-between shrink-0">
            <span>{fileError}</span>
            <button
              type="button"
              onClick={() => setFileError('')}
              className="text-red-400 hover:text-red-600 font-bold ml-2"
              aria-label="关闭错误提示"
            >
              ✕
            </button>
          </div>
        )}

        {/* 表单滚动正文 */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-8 py-5 space-y-6">
            {/* 历史角色差异基准选取 */}
            {record?.hasRoleDifferences && record?.diffSources && record.diffSources.length > 1 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800 font-semibold text-[13px] mb-1.5">
                  <span>⚠️</span>
                  <span>检测到该入口在不同角色中存在历史资料差异，请显式选取本次统一资料的基准来源：</span>
                </div>
                <p className="text-[12px] text-amber-700 mb-3">
                  选用基准来源后将载入对应资料，确认保存后将以此资料统一更新所有选用此入口的角色。
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {record.diffSources.map((source, idx) => (
                    <button
                      type="button"
                      key={idx}
                      disabled={isReadingFile}
                      onClick={() => handleSelectDiffSource(source, idx)}
                      className={`px-3 py-1.5 rounded-md text-[12px] font-medium border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedDiffSourceIndex === idx
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-amber-100/60'
                      }`}
                    >
                      {source.label} ({source.data?.name || source.data?.id})
                    </button>
                  ))}
                </div>
                {diffSourceError && (
                  <p className="text-red-500 text-[11px] mt-2 font-medium">
                    {diffSourceError}
                  </p>
                )}
              </div>
            )}

            {/* 基础配置区 (IMG-004 三列排版) */}
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 mb-4">
                基础配置
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                {/* 行 1 列 1: 英文名称（默认） */}
                <div>
                  <label
                    htmlFor="dialog-en-name"
                    className="block text-[13px] text-gray-700 mb-1.5"
                  >
                    英文名称（默认）
                  </label>
                  {!isCustom ? (
                    <input
                      id="dialog-en-name"
                      type="text"
                      readOnly
                      disabled
                      value={form.enName}
                      className="w-full h-9 px-3 border border-gray-200 rounded text-[13px] bg-gray-100/80 text-gray-600 cursor-not-allowed"
                    />
                  ) : (
                    <input
                      id="dialog-en-name"
                      type="text"
                      value={form.enName}
                      onChange={(e) =>
                        setForm({ ...form, enName: e.target.value })
                      }
                      placeholder="如: Service"
                      className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] text-gray-900 focus:outline-none focus:border-[#13c2c2] bg-white"
                    />
                  )}
                </div>

                {/* 行 1 列 2: 图标 */}
                <div>
                  <label className="block text-[13px] text-gray-700 mb-1.5">
                    图标
                  </label>
                  <button
                    type="button"
                    disabled={isReadingFile}
                    aria-label="选择默认图标文件"
                    onClick={() => baseFileInputRef.current?.click()}
                    className="px-3 py-1.5 border border-gray-300 rounded text-[13px] bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-[12px]">📄</span>
                    <span>选择文件</span>
                  </button>
                  <input
                    type="file"
                    ref={baseFileInputRef}
                    disabled={isReadingFile}
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleBaseFileChange}
                  />

                  {/* 预览卡片 (还原 IMG-004) */}
                  {hasBaseIcon ? (
                    isBaseIconImage ? (
                      <div className="mt-2 border border-gray-200 rounded-md p-2 flex items-center justify-between bg-white max-w-[240px] h-[72px]">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={form.icon}
                            alt="icon"
                            className="w-12 h-12 object-contain shrink-0 rounded"
                          />
                          <span className="text-[12px] text-[#13c2c2] truncate font-medium">
                            {form.iconFileName ||
                              form.enName ||
                              form.name ||
                              '图标'}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={isReadingFile}
                          onClick={handleRemoveBaseIcon}
                          className="text-[#13c2c2] hover:text-[#08979c] text-base ml-2 font-bold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="移除默认图标"
                          title="移除图片"
                        >
                          ✕
                        </button>
                      </div>
                    ) : isBaseOctetStream ? (
                      <div className="mt-2 border border-gray-200 rounded-md p-2 flex items-center justify-between bg-white max-w-[240px]">
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[11px]">
                          非图片数据
                        </span>
                        <button
                          type="button"
                          disabled={isReadingFile}
                          onClick={handleRemoveBaseIcon}
                          className="text-[#13c2c2] hover:text-[#08979c] text-sm ml-2 font-bold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="移除默认图标"
                          title="移除图片"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 border border-gray-200 rounded-md p-2 flex items-center justify-between bg-white max-w-[240px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[11px] truncate">
                            {form.icon}
                          </span>
                          <span className="text-[11px] text-gray-400 shrink-0">
                            系统图标
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={isReadingFile}
                          onClick={handleRemoveBaseIcon}
                          className="text-[#13c2c2] hover:text-[#08979c] text-sm ml-2 font-bold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="移除默认图标"
                          title="移除系统图标"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  ) : null}
                </div>

                {/* 行 1 列 3: 默认排序序号 */}
                <div>
                  <label
                    htmlFor="dialog-sort"
                    className="block text-[13px] text-gray-700 mb-1.5"
                  >
                    默认排序序号
                  </label>
                  <input
                    id="dialog-sort"
                    type="number"
                    disabled={layoutFieldsReadOnly}
                    value={form.sort !== undefined && form.sort !== null ? form.sort : ''}
                    onChange={(e) =>
                      setForm({ ...form, sort: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] text-gray-900 focus:outline-none focus:border-[#13c2c2] bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  />
                </div>

                {/* 行 2 列 1 & 2: 跳转类型与跳转链接 (仅在非模块展示) */}
                {!isModules ? (
                  <>
                    <div>
                      <label
                        htmlFor="dialog-jump-type"
                        className="block text-[13px] text-gray-700 mb-1.5"
                      >
                        跳转类型
                      </label>
                      {!isCustom ? (
                        <input
                          id="dialog-jump-type"
                          type="text"
                          readOnly
                          disabled
                          value={
                            JUMP_TYPE_LABELS[form.jumpType] ||
                            form.jumpType ||
                            '原生'
                          }
                          className="w-full h-9 px-3 border border-gray-200 rounded text-[13px] bg-gray-100/80 text-gray-600 cursor-not-allowed"
                        />
                      ) : (
                        <select
                          id="dialog-jump-type"
                          value={form.jumpType}
                          onChange={(e) =>
                            setForm({ ...form, jumpType: e.target.value })
                          }
                          className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] text-gray-700 focus:outline-none focus:border-[#13c2c2] bg-white"
                        >
                          <option value="internal">原生</option>
                          <option value="h5">H5</option>
                          <option value="external">外部链接</option>
                        </select>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="dialog-jump-url"
                        className="block text-[13px] text-gray-700 mb-1.5"
                      >
                        跳转链接
                      </label>
                      {!isCustom ? (
                        <input
                          id="dialog-jump-url"
                          type="text"
                          readOnly
                          disabled
                          value={form.jumpUrl || ''}
                          className="w-full h-9 px-3 border border-gray-200 rounded text-[13px] bg-gray-100/80 text-gray-600 cursor-not-allowed"
                        />
                      ) : (
                        <input
                          id="dialog-jump-url"
                          type="text"
                          value={form.jumpUrl}
                          onChange={(e) =>
                            setForm({ ...form, jumpUrl: e.target.value })
                          }
                          placeholder="如: service_center 或 https://..."
                          className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] text-gray-900 focus:outline-none focus:border-[#13c2c2] bg-white"
                        />
                      )}
                    </div>
                  </>
                ) : null}

                {/* 默认显示 */}
                <div>
                  <label
                    htmlFor="dialog-visible"
                    className="block text-[13px] text-gray-700 mb-1.5"
                  >
                    默认显示
                  </label>
                  <select
                    id="dialog-visible"
                    disabled={layoutFieldsReadOnly}
                    value={form.defaultVisible}
                    onChange={(e) =>
                      setForm({ ...form, defaultVisible: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] text-gray-700 focus:outline-none focus:border-[#13c2c2] bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <option value="yes">显示</option>
                    <option value="no">隐藏</option>
                  </select>
                </div>

                {/* 限制产品组 */}
                <div>
                  <label
                    htmlFor="dialog-product-group"
                    className="block text-[13px] text-gray-700 mb-1.5"
                  >
                    限制产品组
                  </label>
                  <select
                    id="dialog-product-group"
                    value={form.productGroup}
                    onChange={(e) =>
                      setForm({ ...form, productGroup: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] text-gray-700 focus:outline-none focus:border-[#13c2c2] bg-white"
                  >
                    <option value="all">全部产品组</option>
                    <option value="excavator">挖掘机械</option>
                    <option value="crane">起重机械</option>
                    <option value="concrete">混凝土机械</option>
                    <option value="truck">重卡物流</option>
                  </select>
                </div>

                {/* 适用角色 */}
                <div>
                  <label
                    htmlFor="dialog-role-target"
                    className="block text-[13px] text-gray-700 mb-1.5"
                  >
                    适用角色
                  </label>
                  <select
                    id="dialog-role-target"
                    value={getRoleStorageKey(form.roleTarget) || 'all'}
                    onChange={(e) =>
                      setForm({ ...form, roleTarget: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] text-gray-700 focus:outline-none focus:border-[#13c2c2] bg-white"
                  >
                    <option value="all">全部</option>
                    {ADMIN_ROLES.map((role) => (
                      <option key={role.id} value={role.storageKey}>
                        {role.name}
                      </option>
                    ))}
                    {form.roleTarget &&
                      form.roleTarget !== 'all' &&
                      !ADMIN_ROLES.some(
                        (r) =>
                          r.storageKey === form.roleTarget ||
                          r.name === form.roleTarget ||
                          r.id === form.roleTarget
                      ) && (
                        <option value={form.roleTarget}>{form.roleTarget}</option>
                      )}
                  </select>
                </div>

                {/* Pro功能 */}
                <div>
                  <label
                    htmlFor="dialog-pro"
                    className="block text-[13px] text-gray-700 mb-1.5"
                  >
                    Pro功能
                  </label>
                  <select
                    id="dialog-pro"
                    value={form.pro}
                    onChange={(e) =>
                      setForm({ ...form, pro: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] text-gray-700 focus:outline-none focus:border-[#13c2c2] bg-white"
                  >
                    <option value="no">否</option>
                    <option value="yes">是</option>
                  </select>
                </div>

                {/* 是否展示角标 */}
                <div>
                  <label
                    htmlFor="dialog-badge"
                    className="block text-[13px] text-gray-700 mb-1.5"
                  >
                    是否展示角标
                  </label>
                  <select
                    id="dialog-badge"
                    value={form.showBadge ? 'yes' : 'no'}
                    onChange={(e) =>
                      setForm({ ...form, showBadge: e.target.value === 'yes' })
                    }
                    className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] text-gray-700 focus:outline-none focus:border-[#13c2c2] bg-white"
                  >
                    <option value="no">不展示</option>
                    <option value="yes">展示</option>
                  </select>
                </div>
              </div>

              <p className="text-[12px] text-gray-500 mt-3 bg-gray-50 border border-gray-200/60 rounded px-3 py-1.5">
                ℹ️ 显示、置顶和顺序请在角色配置中设置，新分配入口默认关闭；适用角色仅限制可选范围，不代表已分配。
              </p>
            </div>

            {/* 各语言组直排 (IMG-004 三列直排) */}
            <div className="pt-5 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
                {DIALOG_LANGUAGES.map((lang) => {
                  const isZh = lang.code === 'zh';
                  const langVal = isZh
                    ? form.translations?.zh || ''
                    : form.translations?.[lang.code] || '';
                  const hasLocaleIcon =
                    form.localeIcons?.[lang.code] !== undefined &&
                    form.localeIcons?.[lang.code] !== null &&
                    form.localeIcons?.[lang.code] !== '';
                  const rawLocaleIcon = form.localeIcons?.[lang.code];
                  const isLocaleIconImage = isImageValue(rawLocaleIcon);
                  const isLocaleOctetStream =
                    typeof rawLocaleIcon === 'string' &&
                    rawLocaleIcon.trim().startsWith('data:') &&
                    !isLocaleIconImage;

                  return (
                    <div key={lang.code} className="space-y-2">
                      <div className="font-bold text-[14px] text-gray-900 mb-2">
                        {lang.label}
                      </div>

                      {/* 名称行 */}
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`dialog-lang-${lang.code}`}
                          className="text-[12px] text-gray-700 w-12 shrink-0"
                        >
                          名称：
                        </label>
                        <div className="flex-1 min-w-0">
                          <input
                            ref={isZh ? zhInputRef : undefined}
                            id={`dialog-lang-${lang.code}`}
                            type="text"
                            dir={lang.rtl ? 'rtl' : 'ltr'}
                            value={langVal}
                            onChange={(e) => {
                              if (isZh) {
                                handleZhNameChange(e.target.value);
                              } else {
                                handleTransChange(lang.code, e.target.value);
                              }
                            }}
                            placeholder={
                              isZh
                                ? '请输入中文名称'
                                : `请输入${lang.label}名称`
                            }
                            className={`w-full h-8 px-2.5 border rounded text-[12px] bg-white text-gray-900 focus:outline-none transition ${
                              isZh && zhError
                                ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                                : 'border-gray-300 focus:border-[#13c2c2]'
                            }`}
                          />
                          {isZh && zhError && (
                            <p className="text-red-500 text-[11px] mt-1">
                              {zhError}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 图标行 */}
                      <div className="flex items-start gap-2">
                        <label className="text-[12px] text-gray-700 w-12 shrink-0 pt-1">
                          图标：
                        </label>
                        <div className="flex-1 min-w-0">
                          <button
                            type="button"
                            disabled={isReadingFile}
                            aria-label={`选择${lang.label}图标文件`}
                            onClick={() =>
                              localeFileInputRefs.current[lang.code]?.click()
                            }
                            className="px-3 py-1 border border-gray-300 rounded text-[12px] bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-[11px]">📄</span>
                            <span>选择文件</span>
                          </button>
                          <input
                            type="file"
                            ref={(el) => {
                              localeFileInputRefs.current[lang.code] = el;
                            }}
                            disabled={isReadingFile}
                            accept="image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) =>
                              handleLocaleFileChange(lang.code, e)
                            }
                          />

                          {/* 语言图标预览 */}
                          {hasLocaleIcon ? (
                            isLocaleIconImage ? (
                              <div className="mt-2 border border-gray-200 rounded-md p-1.5 flex items-center justify-between bg-white max-w-[220px]">
                                <div className="flex items-center gap-2 min-w-0">
                                  <img
                                    src={rawLocaleIcon}
                                    alt={lang.label}
                                    className="w-8 h-8 object-contain shrink-0 rounded"
                                  />
                                  <span className="text-[11px] text-[#13c2c2] truncate">
                                    {form.localeIconFileNames[lang.code] ||
                                      `${lang.label}图标`}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  disabled={isReadingFile}
                                  onClick={() =>
                                    handleRemoveLocaleIcon(lang.code)
                                  }
                                  className="text-[#13c2c2] hover:text-[#08979c] text-sm ml-2 font-bold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label={`移除${lang.label}图标`}
                                  title="移除图片"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : isLocaleOctetStream ? (
                              <div className="mt-2 border border-gray-200 rounded-md p-1.5 flex items-center justify-between bg-white max-w-[220px]">
                                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[11px]">
                                  非图片数据
                                </span>
                                <button
                                  type="button"
                                  disabled={isReadingFile}
                                  onClick={() =>
                                    handleRemoveLocaleIcon(lang.code)
                                  }
                                  className="text-[#13c2c2] hover:text-[#08979c] text-sm ml-2 font-bold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label={`移除${lang.label}图标`}
                                  title="移除图片"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="mt-2 border border-gray-200 rounded-md p-1.5 flex items-center justify-between bg-white max-w-[220px]">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[11px] truncate">
                                    {rawLocaleIcon}
                                  </span>
                                  <span className="text-[11px] text-gray-400 shrink-0">
                                    系统图标
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  disabled={isReadingFile}
                                  onClick={() =>
                                    handleRemoveLocaleIcon(lang.code)
                                  }
                                  className="text-[#13c2c2] hover:text-[#08979c] text-sm ml-2 font-bold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label={`移除${lang.label}图标`}
                                  title="移除系统图标"
                                >
                                  ✕
                                </button>
                              </div>
                            )
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 固定底栏 (IMG-004, R-012-C) */}
          <div className="px-8 py-3.5 border-t border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
            <span className="text-[12px] text-gray-400">
              图片尺寸：46*46，格式为jpg或者png，最多支持1张图
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-1.5 border border-gray-300 rounded text-[13px] text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isReadingFile || isSaving}
                className="px-5 py-1.5 bg-[#13c2c2] hover:bg-[#08979c] text-white rounded text-[13px] font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '保存中...' : (isReadingFile ? '读取中...' : (layoutFieldsReadOnly ? '保存' : '确认'))}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

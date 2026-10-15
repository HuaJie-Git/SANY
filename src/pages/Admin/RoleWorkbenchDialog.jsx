import React, { useState, useRef, useEffect } from 'react';

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
  return (
    val.startsWith('data:image/') ||
    val.startsWith('blob:') ||
    val.startsWith('http://') ||
    val.startsWith('https://') ||
    val.startsWith('/') ||
    /\.(png|jpe?g|svg|webp|gif)$/i.test(val)
  );
};

export default function RoleWorkbenchDialog({
  record,
  onClose,
  onSave,
  platform = 'app',
  section = 'workbench',
  role = '',
}) {
  const isEditing = Boolean(record && record.id);
  const isCustom = Boolean(record?.custom || !record?.id);
  const isPCModules = platform === 'pc' && section === 'modules';

  // 显隐初始化：优先依据 visible，其次 defaultVisible
  const initialVisible =
    record?.visible !== undefined
      ? Boolean(record.visible)
      : record?.defaultVisible === 'no'
      ? false
      : true;
  const initialDefaultVisible = initialVisible ? 'yes' : 'no';

  // 中文名称：优先回读 translations.zh，缺失则回退原 name
  const initialZhName =
    record?.translations?.zh !== undefined && record?.translations?.zh !== ''
      ? record.translations.zh
      : record?.name || '';

  const [form, setForm] = useState({
    ...record,
    enName: record?.enName || record?.translations?.en || '',
    jumpType: record?.jumpType || 'internal',
    jumpUrl: record?.jumpUrl || '',
    defaultVisible: initialDefaultVisible,
    productGroup: record?.productGroup || 'all',
    roleTarget: record?.roleTarget || role || 'all',
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

  const [zhError, setZhError] = useState('');
  const [fileError, setFileError] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);

  const isMountedRef = useRef(true);
  const zhInputRef = useRef(null);
  const baseFileInputRef = useRef(null);
  const localeFileInputRefs = useRef({});

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  const handleFileSelect = (file, onReadSuccess) => {
    if (!file) return;
    const isValidType =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'image/jpg' ||
      /\.(png|jpe?g)$/i.test(file.name);
    if (!isValidType) {
      setFileError('图片格式错误，仅支持 jpg 或 png 格式');
      return;
    }

    setFileError('');
    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (!isMountedRef.current) return;
      setIsReadingFile(false);
      onReadSuccess(reader.result, file.name);
    };
    reader.onerror = () => {
      if (!isMountedRef.current) return;
      setIsReadingFile(false);
      setFileError('图片读取失败，请重新选择');
    };
    reader.readAsDataURL(file);
  };

  const handleBaseFileChange = (e) => {
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
    setForm((prev) => ({
      ...prev,
      icon: '',
      iconFileName: '',
    }));
  };

  const handleLocaleFileChange = (code, e) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const zhName = (form.translations?.zh || '').trim();
    if (!zhName) {
      setZhError('请输入中文名称');
      zhInputRef.current?.focus();
      return;
    }

    const isVisible = form.defaultVisible === 'yes';
    onSave({
      ...record,
      ...form,
      name: zhName,
      enName: form.enName || '',
      translations: {
        ...(record?.translations || {}),
        ...form.translations,
        zh: zhName,
        en: form.enName || '',
      },
      localeIcons: {
        ...(record?.localeIcons || {}),
        ...form.localeIcons,
      },
      localeIconFileNames: {
        ...(record?.localeIconFileNames || {}),
        ...form.localeIconFileNames,
      },
      icon: form.icon !== undefined ? form.icon : record?.icon || '',
      iconFileName: form.iconFileName || record?.iconFileName || '',
      sort: Number(form.sort) || 10,
      roleTarget: form.roleTarget || 'all',
      productGroup: form.productGroup || 'all',
      pro: form.pro === 'yes',
      showBadge: Boolean(form.showBadge),
      visible: isVisible,
      defaultVisible: form.defaultVisible,
      jumpType: form.jumpType,
      jumpUrl: form.jumpUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
      <div
        className="bg-white rounded-xl w-[980px] max-w-[95vw] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* 顶部标题 */}
        <div className="px-8 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <h2 id="dialog-title" className="text-[18px] font-bold text-gray-900">
            {isEditing ? '编辑配置' : '新增配置'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        {/* 错误提示横条 */}
        {fileError && (
          <div className="px-8 py-2 bg-red-50 text-red-600 text-[12px] border-b border-red-100 flex items-center justify-between shrink-0">
            <span>{fileError}</span>
            <button
              type="button"
              onClick={() => setFileError('')}
              className="text-red-400 hover:text-red-600 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* 表单滚动正文 */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-8 py-5 space-y-6">
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
                    onClick={() => baseFileInputRef.current?.click()}
                    className="px-3 py-1.5 border border-gray-300 rounded text-[13px] bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition"
                  >
                    <span className="text-[12px]">📄</span>
                    <span>选择文件</span>
                  </button>
                  <input
                    type="file"
                    ref={baseFileInputRef}
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleBaseFileChange}
                  />

                  {/* 预览卡片 (还原 IMG-004) */}
                  {isImageValue(form.icon) ? (
                    <div className="mt-2 border border-gray-200 rounded-md p-2 flex items-center justify-between bg-white max-w-[220px] h-[72px]">
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
                        onClick={handleRemoveBaseIcon}
                        className="text-[#13c2c2] hover:text-[#08979c] text-base ml-2 font-bold shrink-0"
                        title="移除图片"
                      >
                        ✕
                      </button>
                    </div>
                  ) : form.icon ? (
                    <div className="mt-2 text-[12px] text-gray-500 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[11px]">
                        {form.icon}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        系统默认图标
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* 行 1 列 3: 排序序号 */}
                <div>
                  <label
                    htmlFor="dialog-sort"
                    className="block text-[13px] text-gray-700 mb-1.5"
                  >
                    排序序号
                  </label>
                  <input
                    id="dialog-sort"
                    type="number"
                    value={form.sort}
                    onChange={(e) =>
                      setForm({ ...form, sort: Number(e.target.value) || 0 })
                    }
                    className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] text-gray-900 focus:outline-none focus:border-[#13c2c2] bg-white"
                  />
                </div>

                {/* 行 2 列 1 & 2: 跳转类型与跳转链接 (仅在非 PC 页面模块展示) */}
                {!isPCModules ? (
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

                {/* 是否默认显示 */}
                <div>
                  <label
                    htmlFor="dialog-visible"
                    className="block text-[13px] text-gray-700 mb-1.5"
                  >
                    是否默认显示
                  </label>
                  <select
                    id="dialog-visible"
                    value={form.defaultVisible}
                    onChange={(e) =>
                      setForm({ ...form, defaultVisible: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] text-gray-700 focus:outline-none focus:border-[#13c2c2] bg-white"
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

                {/* 生效角色 */}
                <div>
                  <label
                    htmlFor="dialog-role-target"
                    className="block text-[13px] text-gray-700 mb-1.5"
                  >
                    生效角色
                  </label>
                  <select
                    id="dialog-role-target"
                    value={form.roleTarget}
                    onChange={(e) =>
                      setForm({ ...form, roleTarget: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-gray-300 rounded text-[13px] text-gray-700 focus:outline-none focus:border-[#13c2c2] bg-white"
                  >
                    <option value="all">全部</option>
                    <option value="机手">机手</option>
                    <option value="机主">机主</option>
                    <option value="企业客户">企业客户</option>
                    <option value="服务工程师">服务工程师</option>
                    <option value="管理员">管理员</option>
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
            </div>

            {/* 各语言组直排 (IMG-004 三列直排) */}
            <div className="pt-5 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
                {DIALOG_LANGUAGES.map((lang) => {
                  const isZh = lang.code === 'zh';
                  const langVal = isZh
                    ? form.translations?.zh || ''
                    : form.translations?.[lang.code] || '';
                  const hasLocaleIcon = Boolean(form.localeIcons?.[lang.code]);

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
                            onClick={() =>
                              localeFileInputRefs.current[lang.code]?.click()
                            }
                            className="px-3 py-1 border border-gray-300 rounded text-[12px] bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition"
                          >
                            <span className="text-[11px]">📄</span>
                            <span>选择文件</span>
                          </button>
                          <input
                            type="file"
                            ref={(el) => {
                              localeFileInputRefs.current[lang.code] = el;
                            }}
                            accept="image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) =>
                              handleLocaleFileChange(lang.code, e)
                            }
                          />

                          {/* 语言图标预览 */}
                          {hasLocaleIcon && (
                            <div className="mt-2 border border-gray-200 rounded-md p-1.5 flex items-center justify-between bg-white max-w-[200px]">
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={form.localeIcons[lang.code]}
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
                                onClick={() => handleRemoveLocaleIcon(lang.code)}
                                className="text-[#13c2c2] hover:text-[#08979c] text-sm ml-2 font-bold shrink-0"
                                title="移除图片"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 固定底栏 (IMG-004) */}
          <div className="px-8 py-3.5 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
            <span className="text-[12px] text-gray-400">
              图片尺寸：46*46，格式为jpg或者png，最多支持1张图"
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
                disabled={isReadingFile}
                className="px-5 py-1.5 bg-[#13c2c2] hover:bg-[#08979c] text-white rounded text-[13px] font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReadingFile ? '读取中...' : '确认'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

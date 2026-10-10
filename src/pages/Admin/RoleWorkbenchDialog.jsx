import React, { useState } from 'react';

const LANGUAGES = [
  { code: 'zh', label: '中文' },
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

export default function RoleWorkbenchDialog({
  record,
  onClose,
  onSave,
}) {
  const isEditing = Boolean(record && record.id);

  const [form, setForm] = useState({
    enName: record?.enName || record?.name || '',
    sort: record?.sort || 10,
    jumpType: record?.jumpType || 'internal',
    jumpUrl: record?.jumpUrl || '',
    defaultVisible: record?.defaultVisible ?? 'yes',
    productGroup: record?.productGroup || 'all',
    roleTarget: record?.roleTarget || 'all',
    pro: record?.pro ? 'yes' : 'no',
    isPinned: Boolean(record?.isPinned),
    translations: record?.translations || {
      zh: record?.name || '',
    },
  });

  const handleTransChange = (langCode, value) => {
    setForm((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [langCode]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalName = form.translations.zh || form.enName || '新功能配置';
    onSave({
      ...record,
      ...form,
      name: finalName,
      pro: form.pro === 'yes',
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-[900px] max-w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" role="dialog" aria-modal="true">
        {/* 标题 */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
          <h2 className="text-[17px] font-bold text-gray-900">{isEditing ? '编辑配置' : '新增配置'}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 基础配置 */}
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900 mb-3.5">基础配置</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] text-gray-700 mb-1">英文名称 (默认) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.enName}
                  onChange={(e) => setForm({ ...form, enName: e.target.value })}
                  placeholder="如: Equipment Dynamic"
                  className="w-full h-8 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]"
                />
              </div>

              <div>
                <label className="block text-[13px] text-gray-700 mb-1">图标</label>
                <button
                  type="button"
                  className="w-full h-8 px-3 border border-dashed border-gray-300 rounded text-[13px] text-gray-600 hover:border-[#1890ff] hover:text-[#1890ff] flex items-center justify-center gap-1.5"
                >
                  <span>📄</span> 选择文件
                </button>
              </div>

              <div>
                <label className="block text-[13px] text-gray-700 mb-1">排序序号</label>
                <input
                  type="number"
                  value={form.sort}
                  onChange={(e) => setForm({ ...form, sort: parseInt(e.target.value, 10) || 0 })}
                  className="w-full h-8 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]"
                />
              </div>

              <div>
                <label className="block text-[13px] text-gray-700 mb-1">跳转类型</label>
                <select
                  value={form.jumpType}
                  onChange={(e) => setForm({ ...form, jumpType: e.target.value })}
                  className="w-full h-8 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]"
                >
                  <option value="internal">原生应用内页面</option>
                  <option value="h5">H5 内嵌页</option>
                  <option value="external">外部浏览器链接</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] text-gray-700 mb-1">跳转链接</label>
                <input
                  type="text"
                  value={form.jumpUrl}
                  onChange={(e) => setForm({ ...form, jumpUrl: e.target.value })}
                  placeholder="如: /equipment/startup"
                  className="w-full h-8 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]"
                />
              </div>

              <div>
                <label className="block text-[13px] text-gray-700 mb-1">是否默认显示</label>
                <select
                  value={form.defaultVisible}
                  onChange={(e) => setForm({ ...form, defaultVisible: e.target.value })}
                  className="w-full h-8 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]"
                >
                  <option value="yes">显示</option>
                  <option value="no">不显示</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] text-gray-700 mb-1">限制产品组</label>
                <select
                  value={form.productGroup}
                  onChange={(e) => setForm({ ...form, productGroup: e.target.value })}
                  className="w-full h-8 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]"
                >
                  <option value="all">全部产品组</option>
                  <option value="excavator">挖掘机械</option>
                  <option value="crane">起重机械</option>
                  <option value="concrete">混凝土机械</option>
                  <option value="truck">重卡物流</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] text-gray-700 mb-1">生效角色</label>
                <select
                  value={form.roleTarget}
                  onChange={(e) => setForm({ ...form, roleTarget: e.target.value })}
                  className="w-full h-8 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]"
                >
                  <option value="all">全部角色</option>
                  <option value="机手">机手</option>
                  <option value="机主">机主</option>
                  <option value="企业客户">企业客户</option>
                  <option value="服务工程师">服务工程师</option>
                  <option value="管理员">管理员</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] text-gray-700 mb-1">Pro功能</label>
                <select
                  value={form.pro}
                  onChange={(e) => setForm({ ...form, pro: e.target.value })}
                  className="w-full h-8 px-3 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#1890ff]"
                >
                  <option value="no">否</option>
                  <option value="yes">是</option>
                </select>
              </div>
            </div>
          </div>

          {/* 多语言配置字段（14种语言） */}
          <div className="pt-2 border-t border-gray-100">
            <h3 className="text-[15px] font-semibold text-gray-900 mb-3.5">
              多语言配置预留 <span className="text-[12px] font-normal text-gray-400">(支持国际化长文本与 RTL 布局空间)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4">
              {LANGUAGES.map((lang) => (
                <div key={lang.code} className="bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                  <div className="text-[13px] font-medium text-gray-800 mb-2 flex items-center justify-between">
                    <span>{lang.label}</span>
                    {lang.rtl && <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-bold">RTL</span>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-gray-500 w-9 shrink-0">名称:</span>
                      <input
                        type="text"
                        value={form.translations[lang.code] || ''}
                        onChange={(e) => handleTransChange(lang.code, e.target.value)}
                        placeholder={`请输入${lang.label}名称`}
                        dir={lang.rtl ? 'rtl' : 'ltr'}
                        className="flex-1 h-7 px-2 border border-gray-300 rounded text-[12px] focus:outline-none focus:border-[#1890ff]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-gray-500 w-9 shrink-0">图标:</span>
                      <button
                        type="button"
                        className="flex-1 h-7 px-2 border border-dashed border-gray-300 rounded text-[11px] text-gray-500 hover:text-[#1890ff] flex items-center justify-center gap-1"
                      >
                        <span>📄</span> 选择文件
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[12px] text-gray-400">
              图片尺寸：46*46，格式为jpg或者png，最多支持1张图
            </p>
          </div>

          {/* 底部按钮 */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-5 border border-gray-300 rounded text-gray-700 text-[13px] hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="h-9 px-6 bg-[#1890ff] text-white rounded text-[13px] font-medium hover:bg-[#40a9ff] shadow-sm"
            >
              确认
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

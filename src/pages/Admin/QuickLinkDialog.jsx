import React, { useEffect, useRef, useState } from 'react';
import { AUDIENCE_OPTIONS, PREVIEW_TENANTS, PREVIEW_USERS, validateLinkUrl } from '../../admin/quickLinks';
import QuickLinkIcon from './QuickLinkIcon';

const MAX_ICON_BYTES = 150 * 1024;

export default function QuickLinkDialog({ record, rows, onClose, onSave, saveError, onReload }) {
  const [form, setForm] = useState(() => ({
    name: record?.name || '',
    url: record?.url || '',
    sort: record?.sort ?? Math.min(999, Math.max(0, ...rows.map((row) => row.sort)) + 10),
    enabled: record?.enabled ?? true,
    audience: record?.audience || '',
    tenantId: record?.tenantId || '',
    userIds: record?.userIds || [],
    iconData: record?.iconData || '',
  }));
  const [errors, setErrors] = useState({});
  const [readingIcon, setReadingIcon] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const fileRef = useRef(null);
  const dirty = record ? Object.keys(form).some((key) => key === 'userIds' ? form.userIds.join('|') !== (record.userIds || []).join('|') : form[key] !== record[key]) : Boolean(form.name || form.url || form.iconData || form.audience || form.tenantId || form.userIds.length);
  const selectedUsers = form.userIds.map((id) => PREVIEW_USERS.find((user) => user.id === id) || { id, name: '已失效用户', tenant: '请移除后重新选择' });
  const filteredUsers = PREVIEW_USERS.filter((user) => `${user.name} ${user.tenant}`.toLowerCase().includes(userQuery.trim().toLowerCase()));
  const change = (key, value) => { setForm((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: '' })); };
  const toggleUser = (id) => {
    setForm((current) => ({ ...current, userIds: current.userIds.includes(id) ? current.userIds.filter((item) => item !== id) : [...current.userIds, id] }));
    setErrors((current) => ({ ...current, userIds: '' }));
  };
  const close = () => { if (!dirty || window.confirm('当前内容尚未保存，确定取消吗？')) onClose(); };

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const upload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { setErrors((current) => ({ ...current, icon: '仅支持 PNG、JPG 或 WebP 图片' })); return; }
    if (file.size > MAX_ICON_BYTES) { setErrors((current) => ({ ...current, icon: '图标文件不能超过 150KB' })); return; }
    setReadingIcon(true);
    const reader = new FileReader();
    reader.onload = () => {
      setReadingIcon(false);
      if (typeof reader.result !== 'string') { setErrors((current) => ({ ...current, icon: '图片读取失败，请重试' })); return; }
      setForm((current) => ({ ...current, iconData: reader.result }));
      setErrors((current) => ({ ...current, icon: '' }));
    };
    reader.onerror = () => { setReadingIcon(false); setErrors((current) => ({ ...current, icon: '图片读取失败，请重试' })); };
    reader.readAsDataURL(file);
  };

  const submit = (event) => {
    event.preventDefault();
    if (readingIcon) return;
    const name = form.name.trim();
    const sort = Number(form.sort);
    const nextErrors = {
      name: !name ? '请输入链接名称' : name.length > 40 ? '名称不能超过 40 个字符' : rows.some((row) => row.id !== record?.id && row.name.trim().toLowerCase() === name.toLowerCase()) ? '链接名称已存在' : '',
      url: validateLinkUrl(form.url, true),
      sort: !Number.isInteger(sort) || sort < 1 || sort > 999 ? '排序值须为 1–999 的整数' : '',
      audience: !AUDIENCE_OPTIONS.some((option) => option.value === form.audience) ? '请选择可见范围' : '',
      tenantId: form.audience === 'enterprise' && !PREVIEW_TENANTS.some((tenant) => tenant.id === form.tenantId) ? '请选择有效的企业租户' : '',
      userIds: form.audience === 'users' && !form.userIds.length ? '请至少选择一位用户' : form.audience === 'users' && selectedUsers.some((user) => user.name === '已失效用户') ? '所选用户已失效，请移除后重新选择' : '',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    onSave({ ...form, name, url: form.url.trim(), sort, tenantId: form.audience === 'enterprise' ? form.tenantId : '', userIds: form.audience === 'users' ? form.userIds : [] });
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <form onSubmit={submit} className="bg-white rounded-xl w-[680px] max-w-full max-h-[90vh] flex flex-col shadow-2xl" role="dialog" aria-modal="true" aria-label={record ? '编辑快速链接' : '新增快速链接'}>
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"><h2 className="text-[16px] font-semibold text-gray-900">{record ? '编辑-快速链接' : '新增-快速链接'}</h2><button type="button" aria-label="关闭弹窗" className="text-gray-400 hover:text-gray-600 text-xl leading-none" onClick={close}>×</button></div>
      <div className="flex-1 overflow-y-auto px-6 py-5 text-[13px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-4">
          <div><label htmlFor="link-sort" className="block text-gray-700 mb-1"><span className="text-red-500">*</span> 排序：</label><input id="link-sort" type="number" min="1" max="999" value={form.sort} onChange={(event) => change('sort', event.target.value)} className={`w-full h-9 px-3 border rounded focus:outline-none focus:border-[#1890ff] bg-yellow-50 ${errors.sort ? 'border-red-400' : 'border-gray-300'}`} placeholder="请输入排序号"/><p className="text-gray-400 text-xs mt-1">数字越小越靠前。</p>{errors.sort && <p className="text-red-500 text-xs mt-1" role="alert">{errors.sort}</p>}</div>
          <div><label htmlFor="link-status" className="block text-gray-700 mb-1">状态：</label><select id="link-status" value={form.enabled ? 'on' : 'off'} onChange={(event) => change('enabled', event.target.value === 'on')} className="w-full h-9 px-3 border border-gray-300 rounded focus:outline-none focus:border-[#1890ff]"><option value="on">开启</option><option value="off">关闭</option></select></div>
        </div>
        <div className="mb-4"><label htmlFor="link-name" className="block text-gray-700 mb-1"><span className="text-red-500">*</span> 链接名称：</label><input id="link-name" autoFocus value={form.name} maxLength={40} onChange={(event) => change('name', event.target.value)} className={`w-full h-9 px-3 border rounded focus:outline-none focus:border-[#1890ff] bg-yellow-50 ${errors.name ? 'border-red-400' : 'border-gray-300'}`} placeholder="请输入 PC 首页展示的名称" dir="auto"/>{errors.name && <p className="text-red-500 text-xs mt-1" role="alert">{errors.name}</p>}</div>
        <div className="mb-4"><label htmlFor="link-url" className="block text-gray-700 mb-1"><span className="text-red-500">*</span> 访问地址：</label><input id="link-url" type="url" inputMode="url" value={form.url} maxLength={2048} onChange={(event) => change('url', event.target.value)} className={`w-full h-9 px-3 border rounded focus:outline-none focus:border-[#1890ff] ${errors.url ? 'border-red-400' : 'border-gray-300'}`} placeholder="https://example.com/path" dir="ltr"/><p className={`text-xs mt-1 break-words ${errors.url ? 'text-red-500' : 'text-gray-400'}`} role={errors.url ? 'alert' : undefined}>{errors.url || '须填写完整的 http:// 或 https:// 地址。'}</p></div>
        <fieldset className="mb-4"><legend className="text-gray-700 mb-2"><span className="text-red-500">*</span> 可见范围：</legend><div className="grid grid-cols-1 sm:grid-cols-3 gap-2">{AUDIENCE_OPTIONS.map((option) => <label key={option.value} className={`cursor-pointer rounded-md border px-3 py-2.5 min-h-[67px] ${form.audience === option.value ? 'border-[#1890ff] bg-blue-50/70' : 'border-gray-200 bg-white hover:border-blue-200'}`}><span className="flex items-center gap-2 text-gray-800 font-medium"><input type="radio" name="quick-link-audience" value={option.value} checked={form.audience === option.value} onChange={() => change('audience', option.value)} className="accent-[#1890ff]"/>{option.label}</span><span className="block pl-5 mt-1 text-[11px] leading-4 text-gray-500">{option.description}</span></label>)}</div>{errors.audience && <p role="alert" className="text-red-500 text-xs mt-1">{errors.audience}</p>}</fieldset>
        {form.audience === 'enterprise' && <div className="mb-4 rounded-md border border-gray-200 bg-gray-50/60 p-3"><label htmlFor="link-tenant" className="block text-gray-700 mb-1"><span className="text-red-500">*</span> 选择企业租户：</label><select id="link-tenant" value={form.tenantId} onChange={(event) => change('tenantId', event.target.value)} className={`w-full h-9 px-3 border rounded bg-white focus:outline-none focus:border-[#1890ff] ${errors.tenantId ? 'border-red-400' : 'border-gray-300'}`}><option value="">请选择企业租户</option>{PREVIEW_TENANTS.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}</select><p className="mt-1 text-[11px] text-gray-500">保存后，该企业租户下的所有有效用户都能看到此链接。</p>{errors.tenantId && <p role="alert" className="text-red-500 text-xs mt-1">{errors.tenantId}</p>}</div>}
        {form.audience === 'users' && <div className="mb-4 rounded-md border border-gray-200 bg-gray-50/60 p-3"><label htmlFor="link-user-search" className="block text-gray-700 mb-1">搜索并选择用户</label><input id="link-user-search" type="search" value={userQuery} onChange={(event) => setUserQuery(event.target.value)} className="w-full h-9 px-3 border border-gray-300 rounded bg-white focus:outline-none focus:border-[#1890ff]" placeholder="输入用户姓名或所属租户"/><p className="mt-1 text-[11px] text-gray-400">当前为原型用户样例；正式版从用户目录搜索。</p><div className="mt-2 max-h-36 overflow-y-auto rounded border border-gray-200 bg-white">{filteredUsers.length ? filteredUsers.map((user) => <label key={user.id} className="flex items-center gap-3 px-3 py-2 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-blue-50/50"><input type="checkbox" checked={form.userIds.includes(user.id)} onChange={() => toggleUser(user.id)} className="accent-[#1890ff]"/><span className="flex-1 min-w-0"><strong className="block font-medium text-gray-800 break-words" dir="auto">{user.name}</strong><small className="text-[11px] text-gray-500">{user.tenant} · {user.tenantType === 'enterprise' ? '企业用户' : '个人用户'}</small></span></label>) : <p className="py-5 text-center text-gray-400">没有找到用户，请换个关键词</p>}</div><div className="mt-2 flex flex-wrap items-center gap-1.5"><span className="text-[11px] text-gray-500">已选 {selectedUsers.length} 人</span>{selectedUsers.map((user) => <button key={user.id} type="button" onClick={() => toggleUser(user.id)} className="rounded-full bg-blue-50 px-2 py-1 text-[11px] text-blue-700" title={`移除 ${user.name}`}>{user.name} ×</button>)}</div>{errors.userIds && <p role="alert" className="text-red-500 text-xs mt-1">{errors.userIds}</p>}</div>}
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 flex flex-wrap items-center gap-4"><span className="w-11 h-11 shrink-0 rounded-lg bg-white border border-gray-200 grid place-items-center text-[#1890ff] overflow-hidden">{form.iconData ? <img src={form.iconData} alt="当前图标预览" className="w-full h-full object-contain"/> : <QuickLinkIcon name={record?.icon || 'link'} size={22}/>}</span><div className="flex-1 min-w-[150px]"><strong className="text-gray-800">本地上传图标</strong><p className="text-[12px] text-gray-500 mt-1">PNG、JPG、WebP；建议方形，最大 150KB。未上传时使用默认图标。</p></div><input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={upload} aria-label="上传快速链接图标"/><button type="button" className="h-8 px-3 rounded border border-gray-300 bg-white text-gray-700 text-[12px]" onClick={() => fileRef.current?.click()}>{form.iconData ? '更换图片' : '选择图片'}</button>{form.iconData && <button type="button" className="text-[#1890ff] text-[12px]" onClick={() => change('iconData', '')}>恢复默认图标</button>}</div>
        {errors.icon && <p className="text-red-500 text-xs mt-2" role="alert">{errors.icon}</p>}
        {saveError && <div role="alert" className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-xs">{saveError}{saveError.includes('其他页面更新') && <button type="button" className="ml-2 underline" onClick={() => { if (window.confirm('刷新列表将放弃当前编辑，确定吗？')) onReload(); }}>刷新列表</button>}</div>}
      </div>
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-3"><button type="button" className="h-9 px-6 border border-gray-300 rounded text-[14px] text-gray-600 hover:bg-gray-50" onClick={close}>取消</button><button type="submit" disabled={readingIcon} className="h-9 px-6 bg-[#1890ff] text-white rounded text-[14px] font-medium hover:bg-[#40a9ff] disabled:opacity-50">{readingIcon ? '正在读取图片…' : '确认'}</button></div>
    </form>
  </div>;
}

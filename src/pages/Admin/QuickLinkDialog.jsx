import { useQuickLinkDialog } from './useQuickLinkDialog';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PREVIEW_TENANTS, PREVIEW_USERS } from '../../admin/quickLinks';
import { LINK_TYPES, LINK_LANGUAGES, assessQuickLinkAudience, hasRoleProductRestriction, quickLinkScopeKind, linkExtraFields, linkTypeValue, validateQuickLink } from '../../admin/quickLinkRules';
import { Field, ImageUpload, Toggle } from './QuickLinkFields';
import QuickLinkAudience from './QuickLinkAudience';

const newForm = (record, rows) => ({
  name: record?.name || '', url: record?.url || '', sort: record?.sort ?? Math.min(999, Math.max(0, ...rows.map((row) => row.sort)) + 1),
  enabled: record?.enabled ?? true, audience: record?.audience || 'all', tenantId: record?.tenantId || '', userIds: [...(record?.userIds || [])], iconData: record?.iconData || '',
  ...linkExtraFields(record || {}),
});
const scopeDraft = (form) => Object.fromEntries(['audience', 'tenantId', 'tenantIds', 'tenantMode', 'userIds', 'roleIds', 'productGroupIds', 'productGroupMode'].map((key) => [key, form[key]]));
export default function QuickLinkDialog({ record, rows, onClose, onSave, saveError, onReload }) {
  const [initial] = useState(() => newForm(record, rows));
  const [form, setForm] = useState(initial);
  const scopeDrafts = useRef({ [quickLinkScopeKind(initial)]: scopeDraft(initial) });
  const [errors, setErrors] = useState({});
  const [busyImages, setBusyImages] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [localSaveError, setLocalSaveError] = useState('');
  const [validationTarget, setValidationTarget] = useState(null);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const saveLock = useRef(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const close = () => { if (!saving) { if (!dirty) onClose(); else setDiscardConfirm(true); } };
  const root = useQuickLinkDialog(close);
  const busy = busyImages.size > 0 || saving;
  const audience = assessQuickLinkAudience(form, PREVIEW_USERS);
  const noPro = audience.exact && !audience.evaluations.some((item) => item.checks.filter((check) => check.key !== 'pro').every((check) => check.pass) && item.profile.pro);
  const proLocked = hasRoleProductRestriction(form);
  const setImageBusy = useCallback((id, value) => setBusyImages((current) => { const next = new Set(current); if (value) next.add(id); else next.delete(id); return next; }), []);
  const change = (key, value) => {
    setForm((current) => {
      if (key === 'proOnly' && value && hasRoleProductRestriction(current)) return current;
      if (current.proOnly && ['roleIds', 'productGroupIds'].includes(key) && value.length) return current;
      return { ...current, [key]: value, ...(key === 'productGroupIds' ? { productGroupMode: current.audience === 'products' || value.length ? 'selected' : 'all' } : {}) };
    });
    setErrors((current) => ({ ...current, [key]: '', visibility: '' })); setLocalSaveError('');
  };
  const changeScope = (value) => {
    setForm((current) => {
      const saved = scopeDrafts.current[value] || {};
      if (current.proOnly && (['roles', 'products'].includes(value) || value === 'legacy' && hasRoleProductRestriction(saved))) return current;
      scopeDrafts.current[quickLinkScopeKind(current)] = scopeDraft(current);
      if (value === 'legacy') return saved.audience ? { ...current, ...saved } : current;
      return { ...current, audience: value,
        tenantId: value === 'enterprise' ? saved.tenantId || '' : '', tenantIds: value === 'enterprise' ? saved.tenantIds || [] : [], tenantMode: value === 'enterprise' ? saved.tenantMode || 'all' : 'all',
        userIds: value === 'users' ? saved.userIds || [] : [], roleIds: value === 'roles' ? saved.roleIds || [] : [],
        productGroupIds: value === 'products' ? saved.productGroupIds || [] : [], productGroupMode: value === 'products' ? 'selected' : 'all',
      };
    });
    setErrors({}); setLocalSaveError('');
  };
  const changeType = (value) => {
    setForm((current) => ({ ...current, linkType: value === 'internal' ? 'internal' : 'external', authEnabled: value === 'external-auth' }));
    setErrors((current) => ({ ...current, url: '' })); setLocalSaveError('');
  };
  const changeTranslation = (code, value) => {
    setForm((current) => ({ ...current, translations: { ...current.translations, [code]: value } }));
    setErrors((current) => ({ ...current, translations: '' })); setLocalSaveError('');
  };
  const changeLanguageIcon = (code, value) => {
    setForm((current) => ({ ...current, localeIcons: { ...current.localeIcons, [code]: value } })); setLocalSaveError('');
  };
  useEffect(() => {
    if (!validationTarget) return;
    const key = validationTarget.key;
    const targetId = key === 'visibility' ? 'ql-audience-result' : key === 'userIds' ? 'ql-userQuery' : key === 'translations' ? validationTarget.languageId || 'ql-lang-zh' : `ql-${key}`;
    const field = document.getElementById(targetId) || document.querySelector('.ql-form-scroll .ql-error');
    field?.scrollIntoView({ block: 'center' });
    if (field) { if (!field.matches('input,select,button,summary')) field.tabIndex = -1; field.focus(); }
  }, [validationTarget]);
  useEffect(() => {
    if (!dirty) return undefined;
    const beforeUnload = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);
  const submit = async (event) => {
    event.preventDefault();
    if (busy || saveLock.current) return;
    const effective = { ...form, productGroupMode: form.audience === 'products' || form.productGroupMode === 'selected' || form.productGroupIds.length ? 'selected' : 'all' };
    const nextErrors = validateQuickLink(effective, rows, record?.id, PREVIEW_TENANTS, PREVIEW_USERS);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { setValidationTarget({ key: Object.keys(nextErrors)[0], languageId: `ql-lang-${Object.entries(form.translations).find(([, value]) => value.length > 80)?.[0] || 'zh'}` }); return; }
    const next = {
      ...effective, enName: form.enName.trim(), name: form.translations.zh?.trim() || form.enName.trim(),
      translations: Object.fromEntries(Object.entries(form.translations).map(([key, value]) => [key, value.trim()])), sort: Number(form.sort),
      url: form.url.trim(), authEnabled: form.linkType === 'external' && form.authEnabled,
      internalTarget: '',
      tenantId: form.audience === 'enterprise' ? form.tenantIds[0] || '' : '',
      tenantIds: form.audience === 'enterprise' ? form.tenantIds : [], tenantMode: form.audience === 'enterprise' ? form.tenantMode : 'all',
      userIds: form.audience === 'users' ? form.userIds : [],
    };
    saveLock.current = true; setSaving(true);
    try { await onSave(next); } catch { setLocalSaveError('保存失败，当前输入已保留，请重试'); }
    finally { saveLock.current = false; setSaving(false); }
  };
  return <div className="ql-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <form ref={root} onSubmit={submit} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.target.matches('input:not([type="file"]):not([type="checkbox"]):not([type="radio"])')) event.preventDefault(); }} noValidate className="ql-editor ql-editor-single-page" role="dialog" aria-modal="true" aria-labelledby="ql-editor-title">
      <header className="ql-dialog-header"><h2 id="ql-editor-title">{record ? '编辑快速链接' : '新增快速链接'}</h2><button type="button" className="ql-close" aria-label="关闭编辑" disabled={saving} onClick={close}>×</button></header>
      <div className="ql-form-scroll ql-continuous-form">
        <section className="ql-form-section" aria-labelledby="ql-basic-title">
          <div className="ql-inline-section-heading"><h3 id="ql-basic-title">基础配置</h3><span>标 * 为必填，其余按需配置</span></div>
          <div className="ql-form-grid ql-base-grid">
            <Field id="ql-enName" label="英文名称（默认）" required error={errors.enName}><input id="ql-enName" value={form.enName} maxLength={80} autoFocus onChange={(event) => change('enName', event.target.value)} placeholder="请输入默认英文名称" dir="auto" aria-invalid={!!errors.enName}/></Field>
            <Field label="通用图标"><ImageUpload id="ql-icon-default" value={form.iconData} onChange={(value) => change('iconData', value)} onBusy={setImageBusy}/></Field>
            <Field id="ql-sort" label="排序" required error={errors.sort} hint="数字越小越靠前"><input id="ql-sort" type="number" min="1" max="999" value={form.sort} onChange={(event) => change('sort', event.target.value)} dir="ltr" aria-invalid={!!errors.sort}/></Field>
            <Field id="ql-linkType" label="链接类型"><select id="ql-linkType" value={linkTypeValue(form)} onChange={(event) => changeType(event.target.value)}>{LINK_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></Field>
            <Field id="ql-url" label="访问地址" required error={errors.url}><input id="ql-url" value={form.url} maxLength={2048} onChange={(event) => change('url', event.target.value)} placeholder={form.linkType === 'internal' ? 'https://、/路径或 #/路由' : 'https://'} inputMode="url" dir="ltr" aria-invalid={!!errors.url}/></Field>
            <Field id="ql-status" label="状态"><select id="ql-status" value={form.enabled ? 'on' : 'off'} onChange={(event) => change('enabled', event.target.value === 'on')}><option value="on">开启</option><option value="off">关闭</option></select></Field>
          </div>
          <div className="ql-display-options">
            <div><label htmlFor="ql-default-visible">默认显示</label><Toggle id="ql-default-visible" label="默认显示" checked={form.defaultVisible} onChange={(value) => change('defaultVisible', value)}/></div>
            <div><label htmlFor="ql-badge">显示 NEW 角标</label><Toggle id="ql-badge" label="显示角标" checked={form.showBadge} onChange={(value) => change('showBadge', value)}/></div>
            <div title={!form.proOnly && proLocked ? '角色或产品组范围与 Pro 互斥，请先切换为用户范围' : noPro && !form.proOnly ? '所选用户中无符合条件的 Pro 用户' : undefined}><label htmlFor="ql-pro">仅 Pro 用户</label><Toggle id="ql-pro" label="Pro 功能" checked={form.proOnly} disabled={(noPro || proLocked) && !form.proOnly} onChange={(value) => change('proOnly', value)}/></div>
          </div>
        </section>
        <QuickLinkAudience form={form} errors={errors} onChange={change} onScopeChange={changeScope} hasLegacy={Boolean(scopeDrafts.current.legacy)}/>
        <section className="ql-form-section ql-locales-section" aria-labelledby="ql-languages-title">
          <div className="ql-inline-section-heading"><h3 id="ql-languages-title">多语言配置</h3><span>选填，未配置时沿用默认名称和通用图标</span></div>
          {errors.translations && <p className="ql-error" role="alert">{errors.translations}</p>}
          <div className="ql-language-grid">{LINK_LANGUAGES.filter((language) => !language.default).map((language) => <section className="ql-language-card" key={language.code}><header><h4>{language.label}</h4><span>{language.rtl ? 'RTL' : language.code.toUpperCase()}</span></header><Field id={`ql-lang-${language.code}`} label="名称"><input id={`ql-lang-${language.code}`} aria-label={`${language.label}名称`} dir={language.rtl ? 'rtl' : 'auto'} value={form.translations[language.code] || ''} maxLength={80} onChange={(event) => changeTranslation(language.code, event.target.value)} placeholder="选填"/></Field><ImageUpload id={`ql-icon-${language.code}`} label={`${language.label}图标`} compact value={form.localeIcons[language.code] || ''} fallback={form.iconData} onChange={(value) => changeLanguageIcon(language.code, value)} onBusy={setImageBusy}/></section>)}</div>
        </section>
      </div>
      <footer className="ql-dialog-footer"><div>{saveError || localSaveError ? <p className="ql-error" role="alert">{saveError || localSaveError}{saveError?.includes('其他页面更新') && <button type="button" className="ql-text-btn" onClick={() => { if (window.confirm('刷新将放弃当前草稿，确定吗？')) onReload(); }}>刷新列表</button>}</p> : <span>{busyImages.size ? '正在读取图片，请稍候' : dirty ? '有未保存的修改' : ''}</span>}</div><div className="ql-inline"><button type="button" className="ql-btn" disabled={saving} onClick={close}>取消</button><button type="submit" className="ql-btn is-primary" disabled={busy}>{saving ? '保存中…' : '保存并应用'}</button></div></footer>
    </form>
    {discardConfirm && <div className="ql-overlay ql-confirm-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setDiscardConfirm(false); }}>
      <section className="ql-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="ql-discard-title">
        <header className="ql-dialog-header"><h2 id="ql-discard-title">放弃修改</h2><button type="button" className="ql-close" aria-label="关闭确认" onClick={() => setDiscardConfirm(false)}>×</button></header>
        <div className="ql-delete-body"><p>当前内容尚未保存，确定放弃修改吗？</p><p className="ql-hint">放弃后，本次编辑的内容将丢失，此操作无法撤销。</p></div>
        <footer className="ql-dialog-footer"><span/><div className="ql-inline"><button type="button" className="ql-btn" onClick={() => setDiscardConfirm(false)}>继续编辑</button><button type="button" className="ql-btn is-danger" onClick={() => { setDiscardConfirm(false); onClose(); }}>放弃修改</button></div></footer>
      </section>
    </div>}
  </div>;
}

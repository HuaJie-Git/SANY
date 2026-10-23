import React, { useState } from 'react';
import { AUDIENCE_OPTIONS, PREVIEW_TENANTS, PREVIEW_USERS } from '../../admin/quickLinks';
import { LINK_ROLES, PRODUCT_GROUPS, quickLinkScopeKind, assessQuickLinkAudience } from '../../admin/quickLinkRules';
import { Field, MultiChoiceDropdown } from './QuickLinkFields';

export default function QuickLinkAudience({ form, errors, onChange, onScopeChange, hasLegacy }) {
  const [query, setQuery] = useState('');
  const kind = quickLinkScopeKind(form);
  const legacy = kind === 'legacy';
  const result = assessQuickLinkAudience(form, PREVIEW_USERS);
  const base = result.baseUsers;
  const roleCandidates = base.filter((item) => !form.roleIds.length || form.roleIds.some((id) => item.profile.roleIds?.includes(id)));
  const roleOptions = LINK_ROLES.map((role) => {
    const count = base.filter((item) => item.profile.roleIds?.includes(role.id)).length;
    return { ...role, disabled: result.exact && count === 0, reason: '所选用户范围中，没有用户属于此角色' };
  });
  const products = PRODUCT_GROUPS.map((group) => {
    const count = roleCandidates.filter((item) => item.profile.productGroupIds?.includes(group.id)).length;
    return { ...group, disabled: result.exact && count === 0, reason: '所选用户及角色中，没有用户可访问此产品组' };
  });
  const selectedUsers = form.userIds.map((id) => PREVIEW_USERS.find((user) => user.id === id) || { id, name: '已失效用户' });
  const filteredUsers = PREVIEW_USERS.filter((user) => `${user.name} ${user.tenant}`.toLowerCase().includes(query.trim().toLowerCase()));
  const clearLegacy = () => { onChange('roleIds', []); onChange('productGroupIds', []); onChange('productGroupMode', 'all'); };
  return <section className={`ql-form-section ql-audience-section${form.proOnly ? ' is-pro-locked' : ''}`} aria-labelledby="ql-audience-title">
    <div className="ql-inline-section-heading"><h3 id="ql-audience-title">可见范围</h3></div>
    {form.proOnly && <p className="ql-info ql-pro-lock-note">已开启「仅 Pro 用户」：该链接仅 Pro 用户可见，可见范围已锁定不可编辑；关闭「仅 Pro 用户」后恢复。</p>}
    <div className="ql-scope-base"><Field id="ql-audience" label="范围类型" error={errors.audience}><select id="ql-audience" value={kind} disabled={form.proOnly} onChange={(event) => onScopeChange(event.target.value)}>{AUDIENCE_OPTIONS.map((item) => <option key={item.value} value={item.value} disabled={form.proOnly && ['roles', 'products'].includes(item.value)}>{item.label}</option>)}{hasLegacy && <option value="legacy" disabled={form.proOnly}>保留原组合范围</option>}{!['all', 'enterprise', 'users', 'roles', 'products', 'legacy'].includes(kind) && <option value={kind} disabled>范围已失效，请重新选择</option>}</select></Field>
      {form.audience === 'enterprise' && <Field id="ql-tenantIds" label="适用企业（多选）" error={errors.tenantIds}><MultiChoiceDropdown id="ql-tenantIds" label="企业" disabled={form.proOnly} options={PREVIEW_TENANTS} values={form.tenantIds} emptyLabel={form.tenantMode === 'selected' ? '请重新选择企业' : '全部企业'} onChange={(value) => { onChange('tenantIds', value); onChange('tenantMode', value.length ? 'selected' : 'all'); }}/></Field>}
      {form.audience === 'users' && <Field id="ql-userQuery" label="指定用户（多选）" required wide error={errors.userIds}><input id="ql-userQuery" type="search" disabled={form.proOnly} value={query} onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }} onChange={(event) => setQuery(event.target.value)} placeholder="搜索用户姓名或所属租户"/><div className="ql-user-results">{filteredUsers.length ? filteredUsers.map((user) => <label key={user.id}><input type="checkbox" disabled={form.proOnly} checked={form.userIds.includes(user.id)} onChange={() => onChange('userIds', form.userIds.includes(user.id) ? form.userIds.filter((id) => id !== user.id) : [...form.userIds, user.id])}/><span><strong>{user.name}</strong><small>{user.tenant}</small></span></label>) : <p className="ql-hint">没有找到用户，请更换关键词</p>}</div><div className="ql-picked"><span>已选 {selectedUsers.length} 人</span>{selectedUsers.map((user) => <button type="button" disabled={form.proOnly} key={user.id} onClick={() => onChange('userIds', form.userIds.filter((id) => id !== user.id))}>{user.name} ×</button>)}</div></Field>}
      {(kind === 'roles' || legacy) && <Field id="ql-roleIds" label="适用角色（多选）" required={kind === 'roles'} error={errors.roleIds}><MultiChoiceDropdown id="ql-roleIds" label="角色" disabled={form.proOnly} emptyLabel={legacy ? '不限制角色' : '请选择角色'} options={roleOptions} values={form.roleIds} onChange={(value) => onChange('roleIds', value)}/></Field>}
      {(kind === 'products' || legacy) && <Field id="ql-productGroupIds" label="适用产品组（多选）" required={kind === 'products'} error={errors.productGroupIds}><MultiChoiceDropdown id="ql-productGroupIds" label="产品组" disabled={form.proOnly} emptyLabel={kind === 'products' ? '请选择产品组' : '不限制产品组'} options={products} values={form.productGroupIds} onChange={(value) => onChange('productGroupIds', value)}/></Field>}
    </div>
    {legacy && <div className="ql-additional-heading"><strong>原范围：{AUDIENCE_OPTIONS.find((item) => item.value === form.audience)?.label || '已失效'}</strong><button type="button" className="ql-text-btn" onClick={clearLegacy}>清除角色和产品组</button></div>}
    {(result.emptyExact || errors.visibility) && <div id="ql-audience-result" className="ql-audience-conflict" role="alert"><p>{errors.visibility || '指定用户均被附加限制排除，请调整条件或关闭链接后保存。'}</p></div>}
  </section>;
}

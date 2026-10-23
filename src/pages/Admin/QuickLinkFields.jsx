import React, { useCallback, useEffect, useRef, useState } from 'react';

export function Field({ id, label, required, hint, error, children, wide = false }) {
  return <div className={`ql-field${wide ? ' ql-wide' : ''}`}>
    <label htmlFor={id}>{label}{required && <em> *</em>}</label>{children}
    {error ? <p className="ql-error" id={`${id}-error`} role="alert">{error}</p> : hint && <p className="ql-hint">{hint}</p>}
  </div>;
}
export function Toggle({ checked, onChange, label, disabled = false, id }) {
  return <button type="button" id={id} className={`ql-switch${checked ? ' is-on' : ''}`} role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} disabled={disabled}><span/></button>;
}
export function MultiChoice({ label, options, values, onChange, search = false }) {
  const [query, setQuery] = useState('');
  const filtered = options.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = new Set(values);
  const known = new Set(options.map((item) => item.id));
  const replaceFiltered = (next) => onChange([...values.filter((id) => !filtered.some((item) => item.id === id)), ...next]);
  return <div className="ql-multichoice">
    <div className="ql-choice-top">{search && <input type="search" aria-label={`搜索${label}`} placeholder={`搜索${label}`} value={query} onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }} onChange={(event) => setQuery(event.target.value)}/>}
      <div><button type="button" onClick={() => replaceFiltered(filtered.filter((item) => !item.disabled || selected.has(item.id)).map((item) => item.id))}>全选{query ? '结果' : ''}</button><button type="button" onClick={() => replaceFiltered(filtered.filter((item) => !item.disabled && !selected.has(item.id)).map((item) => item.id))}>反选</button><button type="button" onClick={() => onChange([])}>清空</button></div>
    </div>
    <div className="ql-choice-list" role="group" aria-label={label}>{filtered.length ? filtered.map((item) => <label key={item.id} title={item.disabled ? item.reason : undefined} className={item.disabled && !selected.has(item.id) ? 'is-unavailable' : ''}><input type="checkbox" checked={selected.has(item.id)} disabled={item.disabled && !selected.has(item.id)} onChange={() => onChange(selected.has(item.id) ? values.filter((id) => id !== item.id) : [...values, item.id])}/><span>{item.name}{item.count !== undefined && <small>（{item.count} 人）</small>}</span></label>) : <p className="ql-hint">暂无匹配项，请更换关键词</p>}</div>
    <div className="ql-picked"><span>已选 {values.length} 项</span>{values.map((id) => <button type="button" key={id} onClick={() => onChange(values.filter((value) => value !== id))}>{options.find((item) => item.id === id)?.name || '已失效项'} ×{!known.has(id) && '（请移除）'}</button>)}</div>
  </div>;
}
export function MultiChoiceDropdown({ id, label, options, values, onChange, emptyLabel = '不限制产品组', disabled = false }) {
  const root = useRef(null);
  const positionPanel = useCallback(() => {
    const details = root.current;
    if (!details?.open) return;
    const summary = details.querySelector('summary').getBoundingClientRect();
    const panel = details.querySelector('.ql-multi-dropdown-panel');
    if (!panel) return;
    const content = details.closest('.ql-form-scroll')?.getBoundingClientRect();
    const topLimit = Math.max(10, content?.top || 10);
    const bottomLimit = Math.min(window.innerHeight - 10, content?.bottom || window.innerHeight - 10);
    if (summary.bottom <= topLimit || summary.top >= bottomLimit) { details.removeAttribute('open'); return; }
    const below = bottomLimit - summary.bottom - 6;
    const above = summary.top - topLimit - 6;
    const upward = below < 300 && above > below;
    const height = Math.max(80, Math.min(400, upward ? above : below));
    const width = Math.min(Math.max(summary.width, 330), window.innerWidth - 32);
    const rtl = window.getComputedStyle(details).direction === 'rtl';
    const left = Math.max(16, Math.min(rtl ? summary.right - width : summary.left, window.innerWidth - width - 16));
    Object.assign(panel.style, { position: 'fixed', insetInlineStart: 'auto', insetInlineEnd: 'auto', width: `${width}px`, maxWidth: `${width}px`, maxHeight: `${height}px`, overflowY: 'auto', left: `${left}px`, top: 'auto', bottom: 'auto' });
    const actualHeight = Math.min(panel.scrollHeight, height);
    panel.style.top = `${upward ? summary.top - actualHeight - 6 : summary.bottom + 6}px`;
  }, []);
  useEffect(() => {
    const outside = (event) => { if (!root.current?.contains(event.target)) root.current?.removeAttribute('open'); };
    const details = root.current;
    details?.addEventListener('toggle', positionPanel);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('scroll', positionPanel, true);
    window.addEventListener('resize', positionPanel);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('scroll', positionPanel, true); window.removeEventListener('resize', positionPanel); details?.removeEventListener('toggle', positionPanel); };
  }, [positionPanel]);
  useEffect(() => { positionPanel(); }, [values, positionPanel]);
  useEffect(() => { if (disabled) root.current?.removeAttribute('open'); }, [disabled]);
  const selectedNames = values.map((value) => options.find((item) => item.id === value)?.name || '已失效项').join('、');
  return <details ref={root} className={`ql-multi-dropdown${disabled ? ' is-disabled' : ''}`} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) root.current?.removeAttribute('open'); }} onKeyDown={(event) => { if (disabled || event.key === 'Escape' && root.current?.open) { event.preventDefault(); event.stopPropagation(); root.current.removeAttribute('open'); if (!disabled) root.current.querySelector('summary')?.focus(); } }}>
    <summary id={id} aria-label={`${label}（多选）`} aria-disabled={disabled} tabIndex={disabled ? -1 : 0} onClick={(event) => { if (disabled) event.preventDefault(); }} title={selectedNames || emptyLabel}><span>{selectedNames || emptyLabel}</span><small>{values.length ? `${values.length} 项` : '多选'}</small><i aria-hidden="true"/></summary>
    {!disabled && <div className="ql-multi-dropdown-panel"><MultiChoice label={label} options={options} values={values} onChange={onChange} search/></div>}
  </details>;
}
export function ImageUpload({ id, value, onChange, onBusy, compact = false, fallback, label = '通用图标' }) {
  const input = useRef(null);
  const reader = useRef(null);
  const generation = useRef(0);
  const alive = useRef(true);
  const busyCallback = useRef(onBusy);
  busyCallback.current = onBusy;
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; generation.current += 1; reader.current?.abort(); busyCallback.current?.(id, false); };
  }, [id]);
  const upload = async (event) => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { setError('仅支持 PNG、JPG、WebP 图片'); return; }
    if (!file.size || file.size > 150 * 1024) { setError('请上传非空且不超过 150KB 的图片'); return; }
    const current = ++generation.current;
    reader.current?.abort();
    const next = new FileReader(); reader.current = next;
    setBusy(true); busyCallback.current?.(id, true); setError('');
    const finish = () => { if (alive.current && current === generation.current) { setBusy(false); busyCallback.current?.(id, false); } };
    next.onerror = () => { if (alive.current && current === generation.current) setError('图片读取失败，请重新选择'); finish(); };
    next.onload = async () => {
      const img = new Image();
      try {
        img.src = String(next.result); await img.decode();
        if (alive.current && current === generation.current) onChange(String(next.result));
      } catch { if (alive.current && current === generation.current) setError('图片无法识别，请更换有效图片'); }
      finish();
    };
    next.readAsDataURL(file);
  };
  return <div className={`ql-image-upload${compact ? ' is-compact' : ''}`}>
    <div className="ql-image-box">{value || fallback ? <img src={value || fallback} alt={value ? '已配置图标' : '沿用通用图标'}/> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z"/><path d="M13 3v5h5"/></svg>}</div>
    <div><input id={id} ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="ql-sr-only" tabIndex={-1} disabled={busy} aria-label={value ? `更换${label}` : compact ? `选择${label}文件` : `上传${label}文件`} onChange={upload}/>
      <div className="ql-inline"><button type="button" className="ql-btn" aria-label={value ? `更换${label}` : compact ? `选择${label}文件` : `上传${label}`} disabled={busy} onClick={() => input.current?.click()}>{busy ? '读取中…' : value ? '更换图标' : compact ? '选择文件' : '上传图标'}</button>{value && <button type="button" className="ql-text-btn" disabled={busy} onClick={() => { onChange(''); setError(''); }}>{compact ? '沿用通用' : '恢复默认'}</button>}</div>
      {!compact && <p className="ql-hint">建议 46 × 46；PNG / JPG / WebP，≤ 150KB</p>}{error && <p className="ql-error" role="alert">{error}</p>}
    </div>
  </div>;
}

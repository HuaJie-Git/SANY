import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createOperationsPreview, summarizeOperations } from '../data/operationsOverview';
import './operations-overview.css';

const ENERGY_RANGES = ['0-24%', '25-49%', '50-74%', '75-100%'];
const displayNumber = (value) => Number.isFinite(value) ? value : 0;
const barPercent = (value) => Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;

function PanelTitle({ children, id }) {
  return <h2 id={id} className="overview-panel-title">{children}</h2>;
}

function RegionState({ status, onRetry }) {
  return <div className="overview-state" role="status"><p>{status === 'loading' ? '加载中…' : '数据加载失败，请重试'}</p>{status === 'error' && <button type="button" onClick={onRetry}>重试</button>}</div>;
}

function EnergyDistribution({ label, counts, status, onRetry }) {
  const message = status === 'loading' || status === 'error';
  const total = ENERGY_RANGES.reduce((sum, _range, index) => {
    const count = counts?.[index];
    return sum + (Number.isFinite(count) && count > 0 ? count : 0);
  }, 0);
  return <div className="overview-energy-distribution" aria-label={`${label}分布`}>
    <div className="overview-energy-heading">
      <PanelTitle>剩余{label}</PanelTitle>
      {!message && <span className="overview-energy-total">共 <bdi>{total}</bdi> 台</span>}
    </div>
    {message ? <RegionState status={status} onRetry={onRetry}/> : ENERGY_RANGES.map((range, index) => {
      const count = counts?.[index];
      const percent = total > 0 && Number.isFinite(count) ? barPercent(count / total * 100) : 0;
      return <div className={`overview-energy-row range-${index}`} key={range}>
        <span className="overview-energy-label"><i aria-hidden="true"/>{label} {range}</span>
        <div className="overview-energy-track" aria-hidden="true"><i style={{ inlineSize: `${percent}%` }}/></div>
        <span className="overview-energy-count"><b>{displayNumber(count)}</b><span>台</span></span>
      </div>;
    })}
  </div>;
}

function OperationsOverviewView({ devices, timeZone = 'Asia/Shanghai', accountId = 'preview-account', now, status = 'ready', onRetry, sections = {}, onAccessRecovery }) {
  const data = useMemo(() => {
    const current = now || new Date();
    const fallback = devices === undefined ? createOperationsPreview(current, accountId) : devices;
    const summarize = (key) => summarizeOperations(sections[key]?.devices ?? fallback, { now: current, timeZone, accountId });
    const consumption = summarize('consumption');
    return { ...summarize('running'), ...Object.fromEntries(['totalFuel', 'totalElectricity', 'fuelDeviceCount', 'electricityDeviceCount'].map((key) => [key, consumption[key]])), fuelCounts: summarize('fuel').fuelCounts, electricityCounts: summarize('electricity').electricityCounts };
  }, [devices, timeZone, accountId, now, sections]);
  const regionStatus = (key) => status !== 'ready' ? status : sections[key]?.status || 'ready';
  const retry = (key) => () => onRetry?.(key);
  if (status === 'unauthenticated' || status === 'forbidden') {
    return <section className="operations-overview" aria-label="设备运行概览"><div className="overview-panel overview-energy-panel"><PanelTitle>设备运行概览</PanelTitle><div className="overview-state" role="status"><p>{status === 'unauthenticated' ? '登录已失效，请重新登录' : '暂无设备数据查看权限'}</p><button type="button" onClick={onAccessRecovery || (() => window.location.reload())}>{status === 'unauthenticated' ? '重新登录' : '重新检查权限'}</button></div></div></section>;
  }

  return <section className="operations-overview" aria-label="设备运行概览">
    <section className="overview-panel overview-running-panel" aria-labelledby="overview-running-title" aria-busy={regionStatus('running') === 'loading'}>
      <PanelTitle id="overview-running-title">运行概览</PanelTitle>
      {regionStatus('running') !== 'ready' ? <RegionState status={regionStatus('running')} onRetry={retry('running')}/> : <>
      <div className="overview-status-line">
        <div className="overview-statuses" aria-label="设备运行状态统计">
          {(data.statuses || []).map((item) => <div className={`overview-status is-${item.tone}`} key={item.label}><i aria-hidden="true"/><span>{item.label}</span><strong>{displayNumber(item.count)}</strong></div>)}
        </div>
      </div>
      <div className="overview-metrics">
        <div className="overview-metric"><div><strong>{displayNumber(data.totalHours)}</strong><span>h</span></div><p>总工时</p></div>
        <div className="overview-metric is-idle"><div><strong>{displayNumber(data.idleHours)}</strong><span>h</span></div><p>怠速时长（占 {displayNumber(data.idlePercent)}%）</p></div>
        <div className="overview-metric is-running"><div><strong>{displayNumber(data.runningHours)}</strong><span>h</span></div><p>运行时长（占 {displayNumber(data.runningPercent)}%）</p></div>
      </div>
      <div className="overview-time-track" aria-hidden="true"><i className="is-running" style={{ inlineSize: `${barPercent(data.runningPercent)}%` }}/><i className="is-idle" style={{ inlineSize: `${barPercent(data.idlePercent)}%` }}/></div>
      <div className="overview-time-legend"><span><i className="is-running" aria-hidden="true"/>运行 <strong>{displayNumber(data.runningPercent)}%</strong></span><span><i className="is-idle" aria-hidden="true"/>怠速 <strong>{displayNumber(data.idlePercent)}%</strong></span></div>
      </>}
    </section>

    <section className="overview-panel overview-consumption-panel" aria-labelledby="overview-consumption-title" aria-busy={regionStatus('consumption') === 'loading'}>
      <PanelTitle id="overview-consumption-title">能耗概览</PanelTitle>
      {regionStatus('consumption') !== 'ready' ? <RegionState status={regionStatus('consumption')} onRetry={retry('consumption')}/> : <>
      <div className="overview-consumption is-fuel"><p className="overview-consumption-label"><span>总油耗</span><span className="overview-consumption-coverage">纳入统计 <bdi>{displayNumber(data.fuelDeviceCount)}</bdi> 台</span></p><div><strong>{displayNumber(data.totalFuel)}</strong><span>L</span></div></div>
      <div className="overview-consumption is-electricity"><p className="overview-consumption-label"><span>总电耗</span><span className="overview-consumption-coverage">纳入统计 <bdi>{displayNumber(data.electricityDeviceCount)}</bdi> 台</span></p><div><strong>{displayNumber(data.totalElectricity)}</strong><span>kWh</span></div></div>
      </>}
    </section>

    <section className="overview-panel overview-energy-panel" aria-label="剩余量分布">
      <div className="overview-energy-columns"><EnergyDistribution label="油量" counts={data.fuelCounts} status={regionStatus('fuel')} onRetry={retry('fuel')}/><EnergyDistribution label="电量" counts={data.electricityCounts} status={regionStatus('electricity')} onRetry={retry('electricity')}/></div>
    </section>
  </section>;
}

const REGION_KEYS = ['running', 'consumption', 'fuel', 'electricity'];
const loadPreview = ({ now, accountId }) => Promise.resolve(createOperationsPreview(now, accountId));

export default function OperationsOverview({ devices, accountId = 'preview-account', timeZone = 'Asia/Shanghai', now, status = 'ready', onRetry, loadDevices = loadPreview, ...rest }) {
  const scope = `${accountId}:${timeZone}`;
  const [result, setResult] = useState({ scope: null, sections: {} });
  const [retryVersion, setRetryVersion] = useState(0);
  const inFlight = useRef(new Set());
  const generation = useRef(0);
  const mounted = useRef(false);
  const controlled = devices !== undefined || status !== 'ready';
  const currentTime = now || null;
  const loadRegion = useCallback((key, version) => {
    if (inFlight.current.has(key)) return;
    inFlight.current.add(key);
    setResult((previous) => ({ scope, sections: { ...(previous.scope === scope ? previous.sections : {}), [key]: { status: 'loading' } } }));
    Promise.resolve().then(() => {
      if (navigator.onLine === false) throw new Error('offline');
      return loadDevices({ section: key, now: currentTime || new Date(), accountId, timeZone });
    }).then((rows) => {
      if (!Array.isArray(rows)) throw new Error('invalid-device-data');
      if (mounted.current && generation.current === version) setResult((previous) => ({ scope, sections: { ...previous.sections, [key]: { status: 'ready', devices: rows } } }));
    }).catch(() => {
      if (mounted.current && generation.current === version) setResult((previous) => ({ scope, sections: { ...previous.sections, [key]: { status: 'error' } } }));
    }).finally(() => { if (generation.current === version) inFlight.current.delete(key); });
  }, [scope, currentTime, accountId, timeZone, loadDevices]);
  useEffect(() => {
    mounted.current = true;
    const version = ++generation.current;
    inFlight.current.clear();
    if (!controlled) REGION_KEYS.forEach((key) => loadRegion(key, version));
    return () => { mounted.current = false; generation.current += 1; };
  }, [controlled, loadRegion, retryVersion]);
  useEffect(() => {
    const reload = () => setRetryVersion((value) => value + 1);
    window.addEventListener('online', reload);
    window.addEventListener('offline', reload);
    return () => { window.removeEventListener('online', reload); window.removeEventListener('offline', reload); };
  }, []);
  const sections = controlled ? undefined : Object.fromEntries(REGION_KEYS.map((key) => [key, result.scope === scope ? result.sections[key] || { status: 'loading' } : { status: 'loading' }]));
  return <OperationsOverviewView {...rest} devices={devices} accountId={accountId} timeZone={timeZone} now={now} status={status} sections={sections} onRetry={onRetry || ((key) => loadRegion(key, generation.current))}/>;
}

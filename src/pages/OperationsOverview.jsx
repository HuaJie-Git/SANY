import { useMemo } from 'react';
import { createOperationsPreview, summarizeOperations } from '../data/operationsOverview';
import './operations-overview.css';

const ENERGY_RANGES = ['0-24%', '25-49%', '50-74%', '75-100%'];
const displayNumber = (value) => Number.isFinite(value) ? value : 0;
const barPercent = (value) => Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;

function PanelTitle({ children, id }) {
  return <h2 id={id} className="overview-panel-title">{children}</h2>;
}

function EnergyDistribution({ label, counts }) {
  const total = (counts || []).reduce((sum, count) => sum + (Number.isFinite(count) && count > 0 ? count : 0), 0);
  return <div className="overview-energy-distribution" aria-label={`${label}分布`}>
    {ENERGY_RANGES.map((range, index) => {
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

export default function OperationsOverview({ devices, timeZone = 'Asia/Shanghai', now, status = 'ready', onRetry }) {
  const data = useMemo(() => {
    const current = now || new Date();
    return summarizeOperations(devices === undefined ? createOperationsPreview(current) : devices, { now: current, timeZone });
  }, [devices, timeZone, now]);
  if (status === 'loading' || status === 'error') {
    const message = status === 'loading' ? '加载中…' : '数据加载失败，请重试';
    return <section className="operations-overview overview-unavailable" aria-label="设备运行概览" aria-busy={status === 'loading'}>
      <div className="overview-panel"><PanelTitle>运行概览</PanelTitle><div className="overview-state" role="status"><p>{message}</p>{status === 'error' && onRetry && <button type="button" onClick={onRetry}>重试</button>}</div></div>
      <div className="overview-panel"><PanelTitle>能耗概览</PanelTitle><div className="overview-state"><p>{message}</p></div></div>
      <div className="overview-panel overview-energy-panel"><PanelTitle>能耗使用</PanelTitle><div className="overview-state"><p>{message}</p></div></div>
    </section>;
  }

  return <section className="operations-overview" aria-label="设备运行概览">
    <section className="overview-panel overview-running-panel" aria-labelledby="overview-running-title">
      <PanelTitle id="overview-running-title">运行概览</PanelTitle>
      <div className="overview-status-line">
        <div className="overview-statuses" aria-label="设备运行状态统计">
          {(data.statuses || []).map((item) => <div className={`overview-status is-${item.tone}`} key={item.label}><i aria-hidden="true"/><span>{item.label}</span><strong>{displayNumber(item.count)}</strong></div>)}
        </div>
        <span className="overview-status-source">运行状态来源：设备管理</span>
      </div>
      <div className="overview-metrics">
        <div className="overview-metric"><div><strong>{displayNumber(data.totalHours)}</strong><span>h</span></div><p>总工时</p></div>
        <div className="overview-metric is-idle"><div><strong>{displayNumber(data.idleHours)}</strong><span>h</span></div><p>怠速时长（占 {displayNumber(data.idlePercent)}%）</p></div>
        <div className="overview-metric is-running"><div><strong>{displayNumber(data.runningHours)}</strong><span>h</span></div><p>运行时长（占 {displayNumber(data.runningPercent)}%）</p></div>
      </div>
      <div className="overview-time-track" aria-hidden="true"><i className="is-running" style={{ inlineSize: `${barPercent(data.runningPercent)}%` }}/><i className="is-idle" style={{ inlineSize: `${barPercent(data.idlePercent)}%` }}/></div>
      <div className="overview-time-legend"><span><i className="is-running" aria-hidden="true"/>运行 <strong>{displayNumber(data.runningPercent)}%</strong></span><span><i className="is-idle" aria-hidden="true"/>怠速 <strong>{displayNumber(data.idlePercent)}%</strong></span></div>
    </section>

    <section className="overview-panel overview-consumption-panel" aria-labelledby="overview-consumption-title">
      <PanelTitle id="overview-consumption-title">能耗概览</PanelTitle>
      <div className="overview-consumption is-fuel"><p>总油耗</p><div><strong>{displayNumber(data.totalFuel)}</strong><span>L</span></div></div>
      <div className="overview-consumption is-electricity"><p>总电耗</p><div><strong>{displayNumber(data.totalElectricity)}</strong><span>kWh</span></div></div>
    </section>

    <section className="overview-panel overview-energy-panel" aria-labelledby="overview-energy-title">
      <PanelTitle id="overview-energy-title">能耗使用</PanelTitle>
      <div className="overview-energy-columns"><EnergyDistribution label="油量" counts={data.fuelCounts}/><EnergyDistribution label="电量" counts={data.electricityCounts}/></div>
    </section>
  </section>;
}

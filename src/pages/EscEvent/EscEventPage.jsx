import React from 'react';
import { ESC_EVENT_RECORDS, ESC_SIGNAL_FIELDS } from '../../data/escEvent';

function BackIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>;
}

function SignalValue({ field, record }) {
  const value = record?.[field.key] ?? field.value ?? '-';
  return <strong className="text-right text-[16px] font-semibold text-[#29313b]">{value}{field.unit && <small className="ml-1 text-[10px] font-normal text-[#8c949f]">{field.unit}</small>}</strong>;
}

export default function EscEventPage({ device, primaryEvent, onBack }) {
  const matchedRecord = ESC_EVENT_RECORDS.find((item) => (
    item.id === primaryEvent?.id || item.serialNumber === device?.code
  )) || ESC_EVENT_RECORDS[0];
  const record = primaryEvent ? { ...matchedRecord, ...primaryEvent } : matchedRecord;

  return <div className="min-h-full bg-[#f1f3f7] text-[#252b33]">
    <header className="sticky top-0 z-20 flex h-[56px] items-center border-b border-black/5 bg-white/95 px-3 backdrop-blur-sm">
      <button type="button" onClick={onBack} aria-label="返回设备工况" className="flex h-10 w-10 items-center justify-center rounded-full active:bg-black/5"><BackIcon/></button>
      <h1 className="flex-1 pr-10 text-center text-[17px] font-semibold">ESC事件详情</h1>
    </header>

    <main className="px-3 py-3 pb-8">
      <section className="overflow-hidden rounded-[16px] bg-white shadow-[0_1px_2px_rgba(31,41,55,0.035)]" aria-label="ESC属性详情">
        <div className="divide-y divide-[#edf0f3]">
          {ESC_SIGNAL_FIELDS.map((field) => (
            field.children ? (
              <article key={field.key} className="px-4 py-4">
                <h2 className="text-[13px] font-medium text-[#68717d]" dir="auto">{field.label}</h2>
                <div className="mt-3 overflow-hidden rounded-[12px] border border-[#edf0f3] bg-[#fafbfc] divide-y divide-[#edf0f3]">
                  {field.children.map((wheel) => (
                    <div key={wheel.key} className="grid min-h-[52px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-3 py-2.5">
                      <span className="min-w-0 break-words text-[12px] leading-[18px] text-[#747d89]" dir="auto">{wheel.label}</span>
                      <SignalValue field={wheel} record={record}/>
                    </div>
                  ))}
                </div>
              </article>
            ) : (
              <article key={field.key} className="grid min-h-[70px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5">
                <span className="min-w-0 break-words text-[13px] leading-[19px] text-[#68717d]" dir="auto">{field.label}</span>
                <SignalValue field={field} record={record}/>
              </article>
            )
          ))}
        </div>
      </section>
    </main>
  </div>;
}

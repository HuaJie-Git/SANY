import React, { useState, useEffect, useRef, useCallback } from 'react';

const HISTORY_KEY = 'sanvist-search-history';
const HISTORY_MAX = 10;

const loadHistory = () => {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
};
const saveHistory = (arr) => { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); };

const DEMO_KEYWORDS = ['挖掘机','SY365','起重机','滤芯','泵车','三一','卡特'];

const DEMO_OBJECTS = {
  assets: [
    { id:'a1', code:'C0000138', name:'KDD PC360 LC-11', hours:'7,841h', location:'未报告位置', image:'images/机手社区/挖掘机/挖掘机_05.jpg' },
    { id:'a2', code:'C0000199', name:'SANY SY365C', hours:'12,300h', location:'上海市浦东新区', image:'images/机手社区/挖掘机/挖掘机_06.jpg' },
    { id:'a3', code:'C0000266', name:'CAT 320GC', hours:'4,560h', location:'广州市天河区', image:'images/机手社区/挖掘机/挖掘机_07.jpg' },
    { id:'a4', code:'BK02766', name:'XCMG QY50K', hours:'2,100h', location:'南京市建邺区', image:'images/机手社区/三一起重机/三一起重机_05.jpg' },
  ],
  brands: [
    { id:'b1', name:'SANY', code:'三一重工', count:45 },
    { id:'b2', name:'CAT', code:'卡特彼勒', count:23 },
    { id:'b3', name:'XCMG', code:'徐工集团', count:18 },
    { id:'b4', name:'KOMATSU', code:'小松集团', count:15 },
  ],
  deviceTypes: [
    { id:'t1', name:'挖掘机', code:'Excavator', count:35, image:'images/机手社区/挖掘机/挖掘机_01.jpg' },
    { id:'t2', name:'起重机', code:'Crane', count:22, image:'images/机手社区/三一起重机/三一起重机_01.jpg' },
    { id:'t3', name:'泵车', code:'Pump Truck', count:15, image:'images/机手社区/泵车/泵车_04.jpg' },
  ],
  accessories: [
    { id:'p1', name:'液压油滤芯', code:'HX-2024-001', price:'¥280', stock:'有货', image:'images/配件/OIP.webp' },
    { id:'p2', name:'空气滤芯', code:'KQ-2024-002', price:'¥150', stock:'有货', image:'images/配件/OIP (1).webp' },
    { id:'p3', name:'履带板', code:'LD-2024-005', price:'¥1,200', stock:'有货', image:'images/配件/OIP (4).webp' },
  ],
  deviceGroups: [
    { id:'g1', name:'华东组', code:'上海/江苏/浙江', count:12 },
    { id:'g2', name:'华南组', code:'广东/广西/福建', count:8 },
    { id:'g3', name:'华北组', code:'北京/天津/河北', count:15 },
  ],
};

const DEMO_CONTENT = [
  { id:'c1', title:'三一SY365挖掘机操作指南', type:'文章', date:'2026-07-01', views:1234, image:'images/机手社区/挖掘机/挖掘机_01.jpg' },
  { id:'c2', title:'设备保养小技巧分享', type:'视频', date:'2026-06-28', views:5678, image:'images/机手社区/泵车/泵车_04.jpg' },
  { id:'c3', title:'起重机操作经验', type:'文章', date:'2026-06-25', views:2345, image:'images/机手社区/三一起重机/三一起重机_01.jpg' },
];

const SearchPage = ({ onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [history, setHistory] = useState(loadHistory);
  const [results, setResults] = useState(null); // null=no search, {keywords,objects,content}
  const [isLoading, setIsLoading] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('prompt');
  const [language, setLanguage] = useState('zh');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [objectSubTab, setObjectSubTab] = useState('assets');
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const objTabs = [
    { key:'assets', label:'资产' },
    { key:'brands', label:'品牌' },
    { key:'deviceTypes', label:'设备类型' },
    { key:'accessories', label:'配件' },
    { key:'deviceGroups', label:'设备分组' },
  ];

  const permissionTexts = {
    zh: { title:'需要相机权限', message:'扫码功能需要访问您的相机，请允许访问。', allow:'允许', deny:'拒绝', settings:'前往设置', cancel:'取消' },
    en: { title:'Camera Permission Required', message:'Scan feature needs camera access.', allow:'Allow', deny:'Deny', settings:'Settings', cancel:'Cancel' },
    ja: { title:'カメラの権限が必要です', message:'スキャン機能はカメラへのアクセスが必要です。', allow:'許可', deny:'拒否', settings:'設定を開く', cancel:'キャンセル' },
    ko: { title:'카메라 권한이 필요합니다', message:'스캔 기능은 카메라 접근이 필요합니다.', allow:'허용', deny:'거부', settings:'설정으로 이동', cancel:'취소' },
  };

  // ── search matching ──
  const matchText = (text, kw) => text && kw && text.toLowerCase().includes(kw.toLowerCase());

  const doSearch = useCallback((kw) => {
    if (!kw.trim()) { setResults(null); setIsLoading(false); return; }
    const k = kw.trim().toLowerCase();

    // keywords
    const kws = DEMO_KEYWORDS.filter(w => w.toLowerCase().includes(k));

    // objects
    const matchAssets = DEMO_OBJECTS.assets.filter(o => matchText(o.code, k) || matchText(o.name, k));
    const matchBrands = DEMO_OBJECTS.brands.filter(o => matchText(o.name, k) || matchText(o.code, k));
    const matchTypes = DEMO_OBJECTS.deviceTypes.filter(o => matchText(o.name, k) || matchText(o.code, k));
    const matchParts = DEMO_OBJECTS.accessories.filter(o => matchText(o.name, k) || matchText(o.code, k));
    const matchGroups = DEMO_OBJECTS.deviceGroups.filter(o => matchText(o.name, k) || matchText(o.code, k));
    const objects = { assets:matchAssets, brands:matchBrands, deviceTypes:matchTypes, accessories:matchParts, deviceGroups:matchGroups };

    // content
    const content = DEMO_CONTENT.filter(c => matchText(c.title, k));

    // auto select first non-empty object tab
    const firstTab = objTabs.find(t => objects[t.key]?.length > 0);
    if (firstTab) setObjectSubTab(firstTab.key);

    setResults({ keywords:kws, objects, content });
    setIsLoading(false);
  }, []);

  // ── debounce ──
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchText.trim()) { setResults(null); setIsLoading(false); return; }
    setIsLoading(true);
    debounceRef.current = setTimeout(() => doSearch(searchText), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchText, doSearch]);

  // ── history ──
  const addHistory = (word) => {
    if (!word.trim()) return;
    const next = [word.trim(), ...history.filter(h => h !== word.trim())].slice(0, HISTORY_MAX);
    setHistory(next);
    saveHistory(next);
  };
  const clearHistory = () => { setHistory([]); saveHistory([]); };

  const handleSearch = (word) => {
    const w = word || searchText;
    setSearchText(w);
    if (w.trim()) addHistory(w);
  };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };
  const handleClear = () => { setSearchText(''); setResults(null); inputRef.current?.focus(); };

  // ── camera (keep existing) ──
  const openScanner = () => { alert('扫码功能已启动（需要集成扫码SDK）'); setShowCameraModal(false); };
  const requestCameraPermission = async () => {
    try {
      if (navigator.permissions?.query) {
        const r = await navigator.permissions.query({ name:'camera' });
        setCameraPermission(r.state);
        if (r.state === 'granted') openScanner();
        else setShowCameraModal(true);
      } else setShowCameraModal(true);
    } catch { setShowCameraModal(true); }
  };
  const handlePermissionRequest = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video:true });
      s.getTracks().forEach(t => t.stop());
      setCameraPermission('granted');
      openScanner();
    } catch { setCameraPermission('denied'); }
  };

  // ── highlight ──
  const highlightText = (text, kw) => {
    if (!kw || !text) return text;
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((p, i) => p.toLowerCase() === kw.toLowerCase()
      ? <span key={i} className="bg-yellow-300 font-bold">{p}</span>
      : <span key={i}>{p}</span>);
  };

  // ── components ──
  const DeviceImage = ({ src, name, cls='w-[56px] h-[44px]' }) => (
    <div className={`${cls} rounded-lg overflow-hidden flex-shrink-0 bg-gray-100`}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center text-gray-300 text-[11px]">暂无</div>}
    </div>
  );

  const SkeletonItem = () => (
    <div className="py-3 border-b border-gray-100"><div className="flex items-center gap-3">
      <div className="w-[56px] h-[44px] bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
      <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" /><div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" /></div>
    </div></div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="38" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4"/><circle cx="33" cy="33" r="2" fill="#D1D5DB"/><circle cx="47" cy="33" r="2" fill="#D1D5DB"/><path d="M35 45C35 45 37 48 40 48C43 48 45 45 45 45" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/></svg>
      <div className="text-[14px] text-gray-400 mt-4">暂无结果</div>
    </div>
  );

  const hasObjectResults = results?.objects && Object.values(results.objects).some(a => a.length > 0);
  const hasContentResults = results?.content?.length > 0;
  const hasKeywordResults = results?.keywords?.length > 0;
  const hasAny = hasKeywordResults || hasObjectResults || hasContentResults;

  // ── detail overlay ──
  if (selectedDetail) {
    return (
      <div className="absolute inset-0 bg-white z-[60] flex flex-col">
        <div className="h-[44px] flex items-center justify-between px-4"><span className="text-black text-[14px] font-medium">9:41</span></div>
        <div className="flex items-center px-4 py-3 border-b border-gray-100">
          <div className="cursor-pointer mr-3" onClick={() => setSelectedDetail(null)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19 12H5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 19L5 12L12 5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="text-[16px] font-medium text-gray-800">{selectedDetail.name || selectedDetail.title}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {selectedDetail.image && <img src={selectedDetail.image} alt="" className="w-full h-[200px] object-cover rounded-xl mb-4" />}
          <div className="bg-white rounded-xl p-4 space-y-3">
            {selectedDetail.code && <div><span className="text-xs text-gray-400">编号</span><div className="text-sm text-gray-800">{selectedDetail.code}</div></div>}
            {selectedDetail.hours && <div><span className="text-xs text-gray-400">工作时长</span><div className="text-sm text-gray-800">{selectedDetail.hours}</div></div>}
            {selectedDetail.location && <div><span className="text-xs text-gray-400">位置</span><div className="text-sm text-gray-800">{selectedDetail.location}</div></div>}
            {selectedDetail.price && <div><span className="text-xs text-gray-400">价格</span><div className="text-sm text-red-500 font-medium">{selectedDetail.price}</div></div>}
            {selectedDetail.stock && <div><span className="text-xs text-gray-400">库存</span><div className="text-sm text-gray-800">{selectedDetail.stock}</div></div>}
            {selectedDetail.date && <div><span className="text-xs text-gray-400">日期</span><div className="text-sm text-gray-800">{selectedDetail.date}</div></div>}
            {selectedDetail.views && <div><span className="text-xs text-gray-400">浏览</span><div className="text-sm text-gray-800">{selectedDetail.views}</div></div>}
            {selectedDetail.count != null && <div><span className="text-xs text-gray-400">设备数</span><div className="text-sm text-gray-800">{selectedDetail.count} 台</div></div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col">
      {/* status bar */}
      <div className="h-[44px] flex items-center justify-between px-4 bg-white"><span className="text-black text-[14px] font-medium">9:41</span></div>

      {/* search bar */}
      <div className="flex items-center px-4 py-3 bg-white">
        <div className="cursor-pointer mr-3" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19 12H5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 19L5 12L12 5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="flex-1 h-[40px] bg-gray-100 rounded-full flex items-center px-4">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mr-2 flex-shrink-0"><circle cx="8" cy="8" r="6" stroke="#999" strokeWidth="1.5"/><path d="M12.5 12.5L16 16" stroke="#999" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <input ref={inputRef} type="text" className="flex-1 bg-transparent outline-none text-[16px] text-gray-800" value={searchText}
            onChange={(e) => setSearchText(e.target.value)} onKeyDown={handleKeyDown} maxLength={50} placeholder="搜索资产、品牌、内容..." />
          {searchText && <div className="cursor-pointer ml-2 flex-shrink-0" onClick={handleClear}><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" fill="#ccc"/><path d="M6 6L12 12M12 6L6 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></div>}
        </div>
        <div className="cursor-pointer ml-3 w-[40px] h-[40px] bg-gray-100 rounded-full flex items-center justify-center" onClick={requestCameraPermission}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 7V5C3 3.89543 3.89543 3 5 3H7" stroke="#333" strokeWidth="2" strokeLinecap="round"/><path d="M17 3H19C20.1046 3 21 3.89543 21 5V7" stroke="#333" strokeWidth="2" strokeLinecap="round"/><path d="M21 17V19C21 20.1046 20.1046 21 19 21H17" stroke="#333" strokeWidth="2" strokeLinecap="round"/><path d="M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="#333" strokeWidth="2" strokeLinecap="round"/><rect x="7" y="7" width="10" height="10" rx="1" stroke="#333" strokeWidth="2"/><path d="M10 7V17" stroke="#333" strokeWidth="1.5"/><path d="M14 7V17" stroke="#333" strokeWidth="1.5"/><path d="M7 10H17" stroke="#333" strokeWidth="1.5"/><path d="M7 14H17" stroke="#333" strokeWidth="1.5"/></svg>
        </div>
        <div className="cursor-pointer ml-2 px-2 py-1 bg-gray-100 rounded text-[12px] text-gray-600"
          onClick={() => { const langs=['zh','en','ja','ko']; setLanguage(langs[(langs.indexOf(language)+1)%langs.length]); }}>{language.toUpperCase()}</div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto bg-white px-4 py-3">
        {/* ── empty input: history ── */}
        {!searchText && (
          <>
            <div className="text-[16px] font-bold text-gray-800 mb-4">最近查看</div>
            {history.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[14px] font-medium text-gray-700">搜索历史</span>
                  <span className="text-[12px] text-red-500 cursor-pointer" onClick={clearHistory}>清除历史</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((h, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-100 rounded-full text-[13px] text-gray-700 cursor-pointer active:bg-gray-200"
                      onClick={() => handleSearch(h)}>{h}</span>
                  ))}
                </div>
              </div>
            )}
            {history.length === 0 && <EmptyState />}
          </>
        )}

        {/* ── loading ── */}
        {isLoading && searchText && <div>{[1,2,3].map(i => <SkeletonItem key={i} />)}</div>}

        {/* ── results ── */}
        {!isLoading && results && (
          <>
            {/* 1. 搜索建议 */}
            {hasKeywordResults && (
              <div className="mb-4">
                <div className="text-[14px] font-medium text-gray-700 mb-2">搜索建议</div>
                <div className="flex flex-wrap gap-2">
                  {results.keywords.map((w, i) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[13px] cursor-pointer active:bg-blue-100"
                      onClick={() => handleSearch(w)}>{highlightText(w, searchText)}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 2. 对象结果 */}
            {hasObjectResults && (
              <div className="mb-4">
                <div className="text-[14px] font-medium text-gray-700 mb-2">对象结果</div>
                {/* sub-tabs */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {objTabs.filter(t => results.objects[t.key]?.length > 0).map(t => (
                    <span key={t.key} className={`px-3 py-1 rounded-full text-[12px] cursor-pointer whitespace-nowrap ${objectSubTab===t.key ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}
                      onClick={() => setObjectSubTab(t.key)}>{t.label} ({results.objects[t.key].length})</span>
                  ))}
                </div>
                {/* sub-tab cards */}
                {(results.objects[objectSubTab] || []).map(item => (
                  <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-100 cursor-pointer active:bg-gray-50"
                    onClick={() => setSelectedDetail(item)}>
                    <DeviceImage src={item.image} name={item.name} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-gray-800">{highlightText(item.code || item.name, searchText)}</div>
                      {item.name && item.code && <div className="text-[13px] text-gray-500">{highlightText(item.name, searchText)}</div>}
                      {item.hours && <div className="text-[12px] text-gray-400">{item.hours}{item.location ? ` · ${item.location}` : ''}</div>}
                      {item.price && <div className="text-[13px] text-red-500 font-medium">{item.price}</div>}
                      {item.count != null && <div className="text-[12px] text-gray-400">{item.count} 台设备</div>}
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
                  </div>
                ))}
              </div>
            )}

            {/* 3. 内容结果 */}
            {hasContentResults && (
              <div className="mb-4">
                <div className="text-[14px] font-medium text-gray-700 mb-2">内容结果</div>
                {results.content.map(item => (
                  <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-100 cursor-pointer active:bg-gray-50"
                    onClick={() => setSelectedDetail(item)}>
                    <DeviceImage src={item.image} name={item.title} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-gray-800 line-clamp-1">{highlightText(item.title, searchText)}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-blue-500 bg-blue-50 px-1 rounded">{item.type}</span>
                        <span className="text-[12px] text-gray-400">{item.date}</span>
                        <span className="text-[12px] text-gray-400">{item.views} 次浏览</span>
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
                  </div>
                ))}
              </div>
            )}

            {/* empty fallback */}
            {!hasAny && <EmptyState />}
          </>
        )}
      </div>

      {/* camera permission modal */}
      {showCameraModal && (
        <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/45 px-8 backdrop-blur-[2px]">
          <div className="w-full overflow-hidden rounded-[20px] bg-white shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
            <div className="px-6 pb-5 pt-7 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500"><span className="text-[24px] font-semibold">!</span></div>
              <h3 className="text-[18px] font-semibold text-gray-900">{permissionTexts[language].title}</h3>
              <p className="mt-2 text-[14px] leading-6 text-gray-500">{permissionTexts[language].message}</p>
            </div>
            <div className="flex border-t border-gray-100">
              <button className="flex-1 py-4 text-[16px] text-gray-500 border-r border-gray-100" onClick={() => setShowCameraModal(false)}>{permissionTexts[language].cancel}</button>
              <button className="flex-1 py-4 text-[16px] text-red-500 font-medium" onClick={handlePermissionRequest}>{permissionTexts[language].allow}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;

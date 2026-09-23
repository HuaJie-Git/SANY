import React, { useState, useEffect, useRef, useMemo } from 'react';
import ScannerPage from '../ScannerPage/ScannerPage';
import { searchGuestDemoData, GUEST_SEARCH_DEVICES, GUEST_DEMO_DEVICES } from '../../data/guestDemoData';

const filterSearchItems = (items, keyword, keys) => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return items;
  return items.filter((item) => (keys ? keys.map((key) => item[key]) : Object.values(item)).some((value) => (
    typeof value === 'string' && value.toLowerCase().includes(normalizedKeyword)
  )));
};

// 与资产列表中当前已绑定设备保持一致，仅按设备类型名称参与搜索。
const boundDeviceTypes = [
  { id: 1, name: '平地机', deviceCount: 1, image: 'images/asset-models/sany_grader.jpg' },
  { id: 2, name: '压路机', deviceCount: 1, image: 'images/asset-models/sany_roller.jpg' },
  { id: 3, name: '摊铺机', deviceCount: 1, image: 'images/asset-models/sany_paver.jpg' },
  { id: 4, name: '泵车', deviceCount: 3, image: 'images/asset-models/sany_pump.jpg' },
  { id: 5, name: '拖泵', deviceCount: 1, image: 'images/asset-models/sany_trailer_pump.jpg' },
  { id: 6, name: '车载泵', deviceCount: 1, image: 'images/asset-models/sany_truck_pump.jpg' },
  { id: 7, name: '铣刨机', deviceCount: 1, image: 'images/asset-models/sany_milling.jpg' },
  { id: 8, name: '搅拌车', deviceCount: 1, image: 'images/审核/搅拌车.jpg' },
  { id: 9, name: '挖掘机', deviceCount: 3, image: 'images/审核/挖掘机.jpg' },
  { id: 10, name: '起重机', deviceCount: 3, image: 'images/审核/起重机.jpg' },
];

const searchKeysByTab = {
  '资产': ['code', 'name', 'brand'],
  '品牌': ['name'],
  '设备类型': ['name'],
};

const HISTORY_PAGE_SIZE = 10;

// 询价表单选择模式可检索的产品预置数据集（只包含产品与设备，完全排除配件）
const INQUIRY_PRODUCTS = [
  { id: 'inq_1', categoryName: '桩工机械', typeName: '旋挖钻机', name: '旋挖钻机', model: 'SR285R-C10', code: 'SR285R-C10', category: '产品', image: 'images/行业动态/三一起重机/三一起重机_01.jpg' },
  { id: 'inq_2', categoryName: '桩工机械', typeName: '旋挖钻机', name: '旋挖钻机', model: 'SR215-C10', code: 'SR215-C10', category: '产品', image: 'images/行业动态/三一起重机/三一起重机_02.jpg' },
  { id: 'inq_3', categoryName: '桩工机械', typeName: '旋挖钻机', name: '旋挖钻机', model: 'SR235S', code: 'SR235S', category: '产品', image: 'images/行业动态/三一起重机/三一起重机_03.jpg' },
  { id: 'inq_4', categoryName: '桩工机械', typeName: '旋挖钻机', name: '旋挖钻机', model: 'SR305S', code: 'SR305S', category: '产品', image: 'images/行业动态/三一起重机/三一起重机_01.jpg' },
  { id: 'inq_5', categoryName: '桩工机械', typeName: '旋挖钻机', name: '旋挖钻机', model: 'SR405R-W10', code: 'SR405R-W10', category: '产品', image: 'images/行业动态/三一起重机/三一起重机_02.jpg' },
  { id: 'inq_6', categoryName: '挖掘机械', typeName: '小型挖掘机', name: '小型挖掘机', model: 'SY135C (EPA Tier4 F & EC Stage V)', code: 'SY135C (EPA Tier4 F & EC Stage V)', category: '产品', image: 'images/机手社区/挖掘机/挖掘机_02.jpg' },
  { id: 'inq_7', categoryName: '挖掘机械', typeName: '大型挖掘机', name: '大型挖掘机', model: 'SY500H', code: 'SY500H', category: '产品', image: 'images/机手社区/挖掘机/挖掘机_04.jpg' },
  { id: 'inq_8', categoryName: '混凝土机械', typeName: '车载混凝土泵', name: '车载混凝土泵', model: 'SYM5180THBES 30C-8', code: 'SYM5180THBES 30C-8', category: '产品', image: 'images/asset-models/sany_pump.jpg' },
  { id: 'inq_9', categoryName: '混凝土机械', typeName: '纯电搅拌车', name: '纯电搅拌车', model: 'SYM5310BEV-8001', code: 'SYM5310BEV-8001', category: '产品', image: 'images/审核/搅拌车.jpg' },
  { id: 'inq_10', categoryName: '挖掘机械', typeName: '履带挖掘机', name: '三一挖掘机', model: 'KT10SESE50393', code: 'KT10SESE50393', category: '产品', image: 'images/审核/挖掘机.jpg' },
  { id: 'inq_11', categoryName: '起重机械', typeName: '汽车起重机', name: '三一起重机', model: 'KT10SESE50394', code: 'KT10SESE50394', category: '产品', image: 'images/审核/起重机.jpg' },
  { id: 'inq_12', categoryName: '路面机械', typeName: '单钢轮压路机', name: '三一压路机', model: 'SSR260-6012', code: 'SSR260-6012', category: '产品', image: 'images/asset-models/sany_roller.jpg' },
  { id: 'inq_13', categoryName: '路面机械', typeName: '沥青摊铺机', name: '三一摊铺机', model: 'SMP130-8015', code: 'SMP130-8015', category: '产品', image: 'images/asset-models/sany_paver.jpg' },
  { id: 'inq_20', categoryName: '挖掘机械', typeName: '液压挖掘机', name: '挖掘机', model: 'SY014CF0113D8', code: 'SY014CF0113D8', category: '设备', image: 'images/审核/挖掘机.jpg' },
  { id: 'inq_21', categoryName: '起重机械', typeName: '汽车起重机', name: '汽车起重机', model: 'AC0250CF0056', code: 'AC0250CF0056', category: '设备', image: 'images/审核/起重机.jpg' },
  { id: 'inq_22', categoryName: '重卡商用', typeName: '自卸车', name: '自装卸车', model: 'HRZX2331008983', code: 'HRZX2331008983', category: '设备', image: 'images/img_dumptruck.jpg' },
];

const SearchPage = ({
  onClose,
  onOpenAsset,
  onNavigate,
  onOpenDevice,
  onRequireLogin: _onRequireLogin,
  guestMode = false,
  initialScannerOpen = false,
  initialState,
  onStateChange,
  selectMode = false,
  initialSelected = [],
  onConfirmSelection,
}) => {
  const [searchText, setSearchText] = useState(initialState?.searchText || '');
  const [activeTab, setActiveTab] = useState(initialState?.activeTab || '资产');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({});
  const [historyPage, setHistoryPage] = useState(1);
  const [showScanner, setShowScanner] = useState(initialScannerOpen);
  const scannerOpenedDirectlyRef = useRef(initialScannerOpen);

  // ====== 选择模式专用多选与去重状态 ======
  const [tempSelected, setTempSelected] = useState(() => initialSelected || []);

  useEffect(() => {
    if (initialSelected) {
      setTempSelected(initialSelected);
    }
  }, [initialSelected]);

  const toggleSelectItem = (item) => {
    const key = item.code || item.model || item.id || item.name;
    setTempSelected((prev) => {
      const exists = prev.some((x) => (x.code || x.model || x.id || x.name) === key);
      if (exists) {
        return prev.filter((x) => (x.code || x.model || x.id || x.name) !== key);
      }
      return [...prev, item];
    });
  };

  const isItemSelected = (item) => {
    const key = item.code || item.model || item.id || item.name;
    return tempSelected.some((x) => (x.code || x.model || x.id || x.name) === key);
  };

  const selectModeResults = useMemo(() => {
    if (!selectMode) return [];
    const clean = searchText.trim().toLowerCase();
    if (!clean) return [];
    return INQUIRY_PRODUCTS.filter((item) => {
      // 严格排除任何配件
      if (item.category === '配件' || item.categoryName === '配件中心' || /滤芯|履带板|铲斗齿|配件/.test(item.name || item.typeName)) {
        return false;
      }
      const name = (item.name || '').toLowerCase();
      const model = (item.model || '').toLowerCase();
      const code = (item.code || '').toLowerCase();
      const category = (item.category || '').toLowerCase();
      const target = `${name} ${model} ${code} ${category}`;

      if (target.includes(clean)) return true;
      if (clean === '挖机' && (name.includes('挖掘机') || name.includes('旋挖钻机'))) return true;

      const chars = clean.split('').filter(Boolean);
      if (chars.length > 1) {
        let lastIndex = 0;
        for (const c of chars) {
          const idx = target.indexOf(c, lastIndex);
          if (idx === -1) return false;
          lastIndex = idx + 1;
        }
        return true;
      }
      return false;
    });
  }, [selectMode, searchText]);

  const handleScannerClose = () => {
    setShowScanner(false);
    if (scannerOpenedDirectlyRef.current) handleClose();
  };

  const handleClose = () => {
    inputRef.current?.blur();
    onClose?.();
  };

  const tabs = ['资产', '品牌', '设备类型', '产品中心', '配件', '设备分组'];
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    onStateChange?.({ searchText, activeTab });
  }, [activeTab, onStateChange, searchText]);

  useEffect(() => {
    setHistoryPage(1);
  }, [activeTab, searchText]);

  useEffect(() => {
    if (!showScanner) inputRef.current?.focus();
  }, [showScanner]);

  // ====== 游客模式专属状态与本地检索逻辑 (R-GUEST-SRCH-001~005, STATE-SRCH-*) ======
  const [guestResults, setGuestResults] = useState({ devices: [], all: [], total: 0 });
  const [guestError, setGuestError] = useState(null);
  const [guestSimulateError, setGuestSimulateError] = useState(false);

  useEffect(() => {
    if (!guestMode) return;
    const clean = searchText.trim();
    if (!clean) {
      setGuestResults({ devices: [], all: [], total: 0 });
      setGuestError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(() => {
      try {
        const res = searchGuestDemoData(clean, { simulateError: guestSimulateError });
        setGuestResults(res);
        setGuestError(null);
      } catch (err) {
        setGuestError(err?.message || 'DEMO_DATA_LOAD_FAILED');
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [guestMode, searchText, guestSimulateError]);

  const handleGuestProductClick = (item) => {
    const target = GUEST_SEARCH_DEVICES.find((d) => d.code === item.code) || GUEST_DEMO_DEVICES.find((d) => d.code === item.code) || item;
    if (onOpenDevice) {
      onOpenDevice(target);
    } else {
      onNavigate?.({ target: 'assetDetail', item: target });
    }
  };

  // ====== 各 Tab 的默认数据（进入搜索页时展示） ======
  const defaultData = {
    '资产': [
      { id: 1, code: 'EX-2024-001', name: 'SANY SY365挖掘机', brand: 'SANY', deviceType: '挖掘机', onlineStatus: '在线', image: 'images/机手社区/挖掘机/挖掘机_01.jpg' },
      { id: 2, code: 'EX-2025-002', name: 'SANY 起重机', brand: 'SANY', deviceType: '起重机', onlineStatus: '离线', image: 'images/机手社区/三一起重机/三一起重机_01.jpg' },
      { id: 3, code: 'EX-2024-003', name: 'CAT 挖掘机', brand: 'CAT', deviceType: '挖掘机', onlineStatus: '在线', image: 'images/机手社区/挖掘机/挖掘机_02.jpg' },
      { id: 4, code: 'EX-2024-004', name: 'SANY 泵车', brand: 'SANY', deviceType: '泵车', onlineStatus: '在线', image: 'images/机手社区/泵车/泵车_04.jpg' },
      { id: 5, code: 'EX-2024-005', name: 'XCMG 起重机', brand: 'XCMG', deviceType: '起重机', onlineStatus: '离线', image: 'images/机手社区/三一起重机/三一起重机_03.jpg' },
      { id: 6, code: 'EX-2024-006', name: 'SANY 挖掘机', brand: 'SANY', deviceType: '挖掘机', onlineStatus: '在线', image: 'images/机手社区/挖掘机/挖掘机_03.jpg' },
    ],
    '品牌': [
      { id: 1, name: 'SANY', code: '三一重工', deviceCount: 45 },
      { id: 2, name: 'CAT', code: '卡特彼勒', deviceCount: 23 },
      { id: 3, name: 'XCMG', code: '徐工集团', deviceCount: 18 },
      { id: 4, name: 'BELL', code: 'BELL MINING & CONSTRUCTION', deviceCount: 8 },
      { id: 5, name: 'DEERE', code: 'JOHN DEERE', deviceCount: 12 },
      { id: 6, name: 'KOMATSU', code: '小松集团', deviceCount: 15 },
    ],
    '设备类型': boundDeviceTypes,
    '产品中心': [
      { id: 1, name: '车载混凝土泵', code: 'SYM5180THBES 30C-8', image: 'images/asset-models/sany_pump.jpg' },
      { id: 2, name: '纯电搅拌车', code: 'SYM5310BEV-8001', image: 'images/审核/搅拌车.jpg' },
      { id: 3, name: '三一挖掘机', code: 'KT10SESE50393', image: 'images/审核/挖掘机.jpg' },
      { id: 4, name: '三一起重机', code: 'KT10SESE50394', image: 'images/审核/起重机.jpg' },
      { id: 5, name: '三一压路机', code: 'SSR260-6012', image: 'images/asset-models/sany_roller.jpg' },
      { id: 6, name: '三一摊铺机', code: 'SMP130-8015', image: 'images/asset-models/sany_paver.jpg' },
    ],
    '配件': [
      { id: 1, name: '液压油滤芯', code: '10000001', price: '280', stock: '有货', image: 'images/配件/OIP.webp' },
      { id: 2, name: '空气滤芯', code: '10000002', price: '150', stock: '有货', image: 'images/配件/OIP (1).webp' },
      { id: 3, name: '机油滤芯', code: '10000003', price: '120', stock: '缺货', image: 'images/配件/OIP (2).webp' },
      { id: 4, name: '柴油滤芯', code: '10000004', price: '95', stock: '有货', image: 'images/配件/OIP (3).webp' },
      { id: 5, name: '履带板', code: '10000005', price: '1,200', stock: '有货', image: 'images/配件/OIP (4).webp' },
      { id: 6, name: '铲斗齿', code: '10000006', price: '350', stock: '有货', image: 'images/配件/OIP (5).webp' },
    ],
    '设备分组': [
      { id: 1, name: '华东组', deviceCount: 3 },
      { id: 2, name: '华南组', deviceCount: 3 },
      { id: 3, name: '华北组', deviceCount: 3 },
      { id: 4, name: '西南组', deviceCount: 3 },
      { id: 5, name: '华中组', deviceCount: 2 },
      { id: 6, name: '西北组', deviceCount: 2 },
    ],
  };

  // ====== 各 Tab 的搜索结果数据 ======
  const mockSearchResults = {
    '资产': [
      { id: 1, code: 'C0000138', name: 'KOMATSU PC360 LC-11', brand: 'KOMATSU', deviceType: '挖掘机', onlineStatus: '在线', image: 'images/机手社区/挖掘机/挖掘机_05.jpg' },
      { id: 2, code: 'C0000166', name: 'SANY SY215港口机械', brand: 'SANY', deviceType: '港口机械', onlineStatus: '离线', image: 'images/机手社区/港机/港机_01.jpg' },
      { id: 3, code: '662367', name: 'DEERE 624K装载机', brand: 'DEERE', deviceType: '装载机', onlineStatus: '在线', image: 'images/机手社区/自卸车/自卸车_01.jpg' },
      { id: 4, code: 'C0000199', name: 'SANY SY365C挖掘机', brand: 'SANY', deviceType: '挖掘机', onlineStatus: '在线', image: 'images/机手社区/挖掘机/挖掘机_06.jpg' },
      { id: 5, code: 'C0000266', name: 'CAT 320GC挖掘机', brand: 'CAT', deviceType: '挖掘机', onlineStatus: '离线', image: 'images/机手社区/挖掘机/挖掘机_07.jpg' },
      { id: 6, code: 'BK02766', name: 'XCMG QY50K起重机', brand: 'XCMG', deviceType: '起重机', onlineStatus: '在线', image: 'images/机手社区/三一起重机/三一起重机_05.jpg' },
    ],
    '品牌': [
      { id: 1, name: 'SANY', code: '三一重工', deviceCount: 45 },
      { id: 2, name: 'CAT', code: '卡特彼勒', deviceCount: 23 },
      { id: 3, name: 'XCMG', code: '徐工集团', deviceCount: 18 },
      { id: 4, name: 'BELL', code: 'BELL MINING & CONSTRUCTION', deviceCount: 8 },
      { id: 5, name: 'DEERE', code: 'JOHN DEERE', deviceCount: 12 },
      { id: 6, name: 'KOMATSU', code: '小松集团', deviceCount: 15 },
    ],
    '设备类型': boundDeviceTypes,
    '产品中心': [
      { id: 1, name: '车载混凝土泵', code: 'SYM5180THBES 30C-8', image: 'images/asset-models/sany_pump.jpg' },
      { id: 2, name: '纯电搅拌车', code: 'SYM5310BEV-8001', image: 'images/审核/搅拌车.jpg' },
      { id: 3, name: '三一挖掘机', code: 'KT10SESE50393', image: 'images/审核/挖掘机.jpg' },
      { id: 4, name: '三一起重机', code: 'KT10SESE50394', image: 'images/审核/起重机.jpg' },
      { id: 5, name: '三一压路机', code: 'SSR260-6012', image: 'images/asset-models/sany_roller.jpg' },
      { id: 6, name: '三一摊铺机', code: 'SMP130-8015', image: 'images/asset-models/sany_paver.jpg' },
    ],
    '配件': [
      { id: 1, name: '液压油滤芯', code: '10000001', price: '280', stock: '有货', image: 'images/配件/OIP.webp' },
      { id: 2, name: '空气滤芯', code: '10000002', price: '150', stock: '有货', image: 'images/配件/OIP (1).webp' },
      { id: 3, name: '机油滤芯', code: '10000003', price: '120', stock: '缺货', image: 'images/配件/OIP (2).webp' },
      { id: 4, name: '柴油滤芯', code: '10000004', price: '95', stock: '有货', image: 'images/配件/OIP (3).webp' },
      { id: 5, name: '履带板', code: '10000005', price: '1,200', stock: '有货', image: 'images/配件/OIP (4).webp' },
      { id: 6, name: '铲斗齿', code: '10000006', price: '350', stock: '有货', image: 'images/配件/OIP (5).webp' },
    ],
    '设备分组': [
      { id: 1, name: '华东组', deviceCount: 3 },
      { id: 2, name: '华南组', deviceCount: 3 },
      { id: 3, name: '华北组', deviceCount: 3 },
      { id: 4, name: '西南组', deviceCount: 3 },
      { id: 5, name: '华中组', deviceCount: 2 },
      { id: 6, name: '西北组', deviceCount: 2 },
    ],
  };

  const searchDataRef = useRef(mockSearchResults);

  // 搜索逻辑（300ms防抖）
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!searchText.trim()) {
      setSearchResults({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceTimer.current = setTimeout(() => {
      const nextResults = Object.fromEntries(
        Object.entries(searchDataRef.current).map(([tab, items]) => (
          [tab, filterSearchItems(items, searchText, searchKeysByTab[tab])]
        )),
      );
      setSearchResults(nextResults);
      setIsLoading(false);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchText]);

  const handleClear = () => {
    setSearchText('');
    inputRef.current?.focus();
  };

  // 高亮关键词（黄色背景，安全转义与首尾去空）
  const highlightText = (text, keyword) => {
    if (!keyword || !text) return text;
    const cleanKw = keyword.trim();
    if (!cleanKw) return text;
    const parts = String(text).split(new RegExp(`(${cleanKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === cleanKw.toLowerCase() ? (
        <span key={index} className="bg-yellow-300 font-bold">{part}</span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  // 图片组件
  const DeviceImage = ({ src, name, size = 'normal', appearance = 'photo' }) => {
    const sizeClass = size === 'small' ? 'w-[50px] h-[50px]' : 'w-[80px] h-[64px]';
    const imageClass = appearance === 'icon' ? 'object-contain p-1.5' : 'object-cover';
    return (
      <div className={`${sizeClass} rounded-lg overflow-hidden flex-shrink-0 bg-gray-100`}>
        {src ? (
          <img src={src} alt={name} className={`h-full w-full ${imageClass}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-[12px]">暂无图片</div>
        )}
      </div>
    );
  };

  // 骨架屏
  const SkeletonItem = () => (
    <div className="py-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-[70px] h-[56px] bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-[16px] bg-gray-200 rounded w-[50%] mb-2 animate-pulse"></div>
          <div className="h-[14px] bg-gray-200 rounded w-[40%] mb-2 animate-pulse"></div>
          <div className="h-[12px] bg-gray-200 rounded w-[70%] mb-1 animate-pulse"></div>
          <div className="h-[12px] bg-gray-200 rounded w-[50%] animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  // 搜索无结果插画 (完全还原设计图)
  const NoResultsIllustration = () => (
    <svg
      width="132"
      height="94"
      viewBox="0 0 132 94"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
      aria-hidden="true"
    >
      {/* 右上方小圆圈 ○ */}
      <circle cx="112" cy="11" r="2" stroke="#1e2648" strokeWidth="1.5" fill="none" />

      {/* 水平横杆（穿过纸张后方） */}
      <line x1="8" y1="31" x2="38" y2="31" stroke="#1e2648" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="94" y1="31" x2="124" y2="31" stroke="#1e2648" strokeWidth="2.5" strokeLinecap="round" />

      {/* 左侧星芒 ✦ */}
      <path
        d="M23 48 C23 50.5 21.5 52 19 52 C21.5 52 23 53.5 23 56 C23 53.5 24.5 52 27 52 C24.5 52 23 50.5 23 48 Z"
        fill="#1e2648"
      />

      {/* 纸张顶部折翻小边 */}
      <path
        d="M39 31V28C39 25.5 41 23.5 43.5 23.5H90.5C93 23.5 95 25.5 95 28V31H39Z"
        fill="#b6c1dd"
      />

      {/* 展开的纸张主体 */}
      <rect x="39" y="31" width="56" height="42" fill="#e7ebee" />

      {/* 纸张上的占位横线 */}
      <line x1="56" y1="46" x2="78" y2="46" stroke="#888693" strokeWidth="2" strokeLinecap="round" />
      <line x1="62" y1="55" x2="76" y2="55" stroke="#888693" strokeWidth="2" strokeLinecap="round" />

      {/* 底部卷轴 */}
      <rect x="35" y="70" width="64" height="12" rx="6" fill="#717581" />

      {/* 放大镜上方 3 条动态线条 */}
      <line x1="98" y1="44" x2="100" y2="39" stroke="#1e2648" strokeWidth="2" strokeLinecap="round" />
      <line x1="105" y1="48" x2="110" y2="44" stroke="#1e2648" strokeWidth="2" strokeLinecap="round" />
      <line x1="108" y1="56" x2="114" y2="56" stroke="#1e2648" strokeWidth="2" strokeLinecap="round" />

      {/* 放大镜（位于右下角，遮挡纸张和卷轴） */}
      <circle cx="89" cy="64" r="14" fill="#ffffff" stroke="#1e2648" strokeWidth="4.5" />
      <path d="M99 74L110 85" stroke="#1e2648" strokeWidth="5.2" strokeLinecap="round" />
    </svg>
  );

  // 空状态组件
  const EmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center" dir="auto">
      <NoResultsIllustration />
      <div className="text-[14px] text-[#888693] mt-5">无搜索结果</div>
    </div>
  );

  // ====== 各 Tab 的卡片组件 ======

  // 资产 Tab
  const AssetCard = ({ item }) => {
    const name = item.name || '--';
    const brand = item.brand || name.split(/\s+/)[0] || '--';
    const deviceType = item.deviceType || '--';
    const code = item.code || '--';
    const status = item.onlineStatus || '--';
    const isOnline = status === '在线';

    return (
      <button
        type="button"
        aria-label={`${brand} ${deviceType}，序列号 ${code}，${status}`}
        onClick={() => onNavigate?.({ target: 'assetDetail', item: { ...item, name: item.deviceType || item.name } })}
        className="mb-3 flex w-full items-center gap-3 rounded-[14px] border border-gray-100 bg-white p-3 text-left shadow-[0_3px_12px_rgba(31,41,55,0.06)] transition active:scale-[0.99] active:bg-gray-50"
      >
        <DeviceImage src={item.image} name={name} />
        <span className="min-w-0 flex-1 space-y-1">
          <span className="flex min-w-0 items-center gap-1 text-[16px] font-semibold leading-6 text-gray-900">
            <span className="truncate" title={brand}>{searchText ? highlightText(brand, searchText) : brand}</span>
            <span className="flex-shrink-0 text-gray-300" aria-hidden="true">·</span>
            <span className="truncate" title={deviceType}>{searchText ? highlightText(deviceType, searchText) : deviceType}</span>
          </span>
          <span className="flex min-w-0 items-center gap-3 text-[14px] leading-5">
            <span className="min-w-0 truncate tabular-nums text-gray-400" title={code}>{searchText ? highlightText(code, searchText) : code}</span>
            <span className={`flex flex-shrink-0 items-center leading-5 ${isOnline ? 'text-[#18c75a]' : 'text-gray-400'}`}>
              <span className={`mr-1.5 h-2 w-2 rounded-full ${isOnline ? 'bg-[#18c75a]' : 'bg-gray-400'}`} aria-hidden="true" />
              {status}
            </span>
          </span>
        </span>
      </button>
    );
  };

  // 品牌 Tab
  const BrandCard = ({ item }) => {
    const name = item.name || '--';
    const deviceCount = item.deviceCount ?? 0;

    return (
      <button
        type="button"
        aria-label={`${name}，${deviceCount} 台设备`}
        onClick={() => onNavigate?.({ target: 'assetList', context: { kind: 'brand', value: name, item, label: `${name} · ${deviceCount} 台设备` } })}
        className="flex w-full items-center gap-3 border-b border-gray-100 py-4 text-left transition-colors active:bg-gray-50"
      >
        <span className="flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-[18px] font-bold text-gray-600">
          {name.charAt(0)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-semibold leading-6 text-gray-800" title={name}>
            {searchText ? highlightText(name, searchText) : name}
          </span>
          <span className="mt-0.5 block text-[13px] leading-5 text-gray-400">{deviceCount} 台设备</span>
        </span>
        <svg className="h-4 w-4 flex-shrink-0 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    );
  };

  // 设备类型 Tab
  const DeviceTypeCard = ({ item }) => {
    const name = item.name || '--';
    const deviceCount = item.deviceCount ?? 0;

    return (
      <button
        type="button"
        aria-label={`${name}，${deviceCount} 台设备`}
        onClick={() => onNavigate?.({ target: 'assetList', context: { kind: 'type', value: name, item, label: `${name} · ${deviceCount} 台设备` } })}
        className="flex w-full items-center gap-3 border-b border-gray-100 py-4 text-left transition-colors active:bg-gray-50"
      >
        <DeviceImage src={item.image} name={name} size="small" appearance="icon" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-semibold leading-6 text-gray-800" title={name}>
            {searchText ? highlightText(name, searchText) : name}
          </span>
          <span className="mt-0.5 block text-[13px] leading-5 text-gray-400">{deviceCount} 台设备</span>
        </span>
        <svg className="h-4 w-4 flex-shrink-0 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    );
  };

  // 产品中心 Tab：沿用通用搜索逻辑，展示车型名称和三一设备编码。
  const ProductCenterCard = ({ item }) => {
    const name = item.name || '--';
    const code = item.code || '--';

    return (
      <button type="button" onClick={() => onNavigate?.({ target: 'productCenter', context: { query: name, item } })} className="flex w-full items-center gap-3 border-b border-gray-100 py-4 text-left transition-colors active:bg-gray-50">
        <DeviceImage src={item.image} name={name} size="small" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-semibold leading-6 text-gray-800" title={name}>
            {searchText ? highlightText(name, searchText) : name}
          </span>
          <span className="mt-0.5 block truncate text-[13px] leading-5 tabular-nums text-gray-400" title={code}>
            {searchText ? highlightText(code, searchText) : code}
          </span>
        </span>
        <svg className="h-4 w-4 flex-shrink-0 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    );
  };

  // 配件 Tab
  const AccessoryCard = ({ item }) => {
    const name = item.name || '--';
    const code = item.code || '--';
    const price = item.price ? `USD ${item.price} / PC` : '--';

    return (
      <button type="button" onClick={() => onNavigate?.({ target: 'parts', context: { query: item.name, item } })} className="flex w-full items-center gap-3 border-b border-gray-100 py-4 text-left transition-colors active:bg-gray-50">
        <DeviceImage src={item.image} name={name} size="small" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-semibold leading-6 text-gray-800" title={name}>
            {searchText ? highlightText(name, searchText) : name}
          </span>
          <span className="mt-0.5 block truncate text-[13px] leading-5 tabular-nums text-gray-400" title={code}>
            {searchText ? highlightText(code, searchText) : code}
          </span>
          <span className="mt-0.5 block text-[13px] font-medium leading-5 tabular-nums text-red-500">{price}</span>
        </span>
        <svg className="h-4 w-4 flex-shrink-0 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    );
  };

  // 设备分组 Tab
  const DeviceGroupCard = ({ item }) => {
    const name = item.name || '--';
    const deviceCount = item.deviceCount ?? 0;

    return (
      <button type="button" aria-label={`${name}，${deviceCount} 台设备`} onClick={() => onNavigate?.({ target: 'assetList', context: { kind: 'group', value: name, item, label: `${name} · ${deviceCount} 台设备` } })} className="flex w-full items-center border-b border-gray-100 py-4 text-left transition-colors active:bg-gray-50">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-semibold leading-6 text-gray-800" title={name}>
            {searchText ? highlightText(name, searchText) : name}
          </span>
          <span className="mt-0.5 block text-[13px] leading-5 text-gray-400">{deviceCount} 台设备</span>
        </span>
        <svg className="h-4 w-4 flex-shrink-0 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    );
  };

  // 根据 Tab 渲染卡片
  const renderCard = (item) => {
    switch (activeTab) {
      case '资产': return <AssetCard item={item} />;
      case '品牌': return <BrandCard item={item} />;
      case '设备类型': return <DeviceTypeCard item={item} />;
      case '产品中心': return <ProductCenterCard item={item} />;
      case '配件': return <AccessoryCard item={item} />;
      case '设备分组': return <DeviceGroupCard item={item} />;
      default: return <AssetCard item={item} />;
    }
  };

  // 获取当前 Tab 的数据（有搜索词用搜索结果，无搜索词用默认数据）
  const hasSearchText = Boolean(searchText.trim());
  const currentData = hasSearchText
    ? (searchResults[activeTab] || [])
    : (defaultData[activeTab] || []);
  const historyPageCount = Math.ceil(currentData.length / HISTORY_PAGE_SIZE);
  const visibleData = hasSearchText
    ? currentData
    : currentData.slice((historyPage - 1) * HISTORY_PAGE_SIZE, historyPage * HISTORY_PAGE_SIZE);

  if (selectMode) {
    const cleanSearch = searchText.trim();
    const hasSearchKeyword = Boolean(cleanSearch);

    return (
      <div className="relative flex h-full w-full flex-col min-h-full bg-white" dir="auto">
        {/* 顶部搜索条 (参考 IMG-INQ-002 与 IMG-INQ-003) */}
        <header className="flex items-center px-4 pt-2 pb-3 bg-white gap-3 border-b border-gray-100 flex-shrink-0" dir="auto">
          <div className="flex-1 h-[42px] bg-[#f2f4f7] rounded-full flex items-center px-3.5 gap-2.5 min-w-0">
            <svg className="flex-shrink-0 text-gray-400" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.8"/>
              <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              autoFocus
              maxLength={50}
              dir="auto"
              placeholder="搜索"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value.slice(0, 50))}
              className="flex-1 bg-transparent outline-none text-[15px] text-gray-900 placeholder:text-gray-400 min-w-0"
              aria-label="搜索"
            />
            {searchText && (
              <button
                type="button"
                onClick={handleClear}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 active:opacity-75 transition-opacity"
                aria-label="清空搜索"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 10.5-1 1L8 9l-2.5 2.5-1-1L7 8 4.5 5.5l1-1L8 7l2.5-2.5 1 1L9 8l2.5 2.5z"/>
                </svg>
              </button>
            )}
          </div>

          {/* 右侧关闭按钮 (参考 IMG-INQ-002) */}
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-gray-700 active:bg-gray-100 transition-colors"
            aria-label="关闭搜索"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </header>

        {/* 内容展示区域 */}
        <div className="flex-1 overflow-y-auto bg-white px-4 py-3 flex flex-col">
          {!hasSearchKeyword ? (
            /* 未输入关键词，保持白色空内容区 (IMG-INQ-002) */
            <div className="flex-1 bg-white" />
          ) : selectModeResults.length === 0 ? (
            /* 输入未命中，展示无搜索结果插画 (IMG-INQ-002) */
            <div className="flex-1 flex flex-col items-center justify-center -mt-12 py-12 text-center" dir="auto">
              <NoResultsIllustration />
              <div className="text-[14px] text-[#888693] mt-5">无搜索结果</div>
            </div>
          ) : (
            /* 搜索结果列表 (IMG-INQ-003 卡片样式 + 多选状态) */
            <div className="space-y-3 pt-2 pb-4">
              {selectModeResults.map((item) => {
                const selected = isItemSelected(item);
                return (
                  <div
                    key={item.code || item.id}
                    onClick={() => toggleSelectItem(item)}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border bg-white cursor-pointer active:scale-[0.99] transition ${
                      selected ? 'border-[#E01923] bg-red-50/10' : 'border-gray-100 hover:border-gray-200'
                    }`}
                    dir="auto"
                  >
                    <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center p-1 border border-gray-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f3f4f6"/><text x="32" y="36" font-size="12" fill="%239ca3af" text-anchor="middle">SANY</text></svg>';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[16px] font-bold text-gray-900 truncate">
                        {highlightText(item.name, searchText)}
                      </div>
                      <div className="mt-1 text-[14px] text-gray-500 font-normal truncate">
                        {highlightText(item.model || item.code, searchText)}
                      </div>
                    </div>
                    {/* 右侧选中状态指示圈 */}
                    <div className="flex-shrink-0 ml-1">
                      {selected ? (
                        <div className="w-5 h-5 rounded-full bg-[#E01923] border-2 border-[#E01923] flex items-center justify-center text-white">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部吸底确认栏 (包含已选数量与确认按钮) */}
        <footer className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="text-[14px] text-gray-700">
            已选 <span className="font-bold text-[#E01923]">{tempSelected.length}</span> 项
          </div>
          <button
            type="button"
            onClick={() => {
              onConfirmSelection?.(tempSelected);
              onClose?.();
            }}
            className="px-6 py-2.5 rounded-xl bg-[#E01923] text-white text-[15px] font-bold active:bg-[#c4151e] transition shadow-sm"
          >
            确认
          </button>
        </footer>
      </div>
    );
  }

  if (guestMode) {
    const cleanSearch = searchText.trim();
    const hasSearchKeyword = Boolean(cleanSearch);

    return (
      <div className="relative flex h-full w-full flex-col min-h-full bg-white" dir="auto">
        {/* 顶部搜索条 (参考 IMG-002) */}
        <header className="flex items-center px-4 pt-2 pb-3 bg-white gap-3 border-b border-gray-100" dir="auto">
          <div className="flex-1 h-[42px] bg-[#f2f4f7] rounded-full flex items-center px-3.5 gap-2.5 min-w-0">
            <svg className="flex-shrink-0 text-gray-400" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.8"/>
              <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              autoFocus
              maxLength={50}
              dir="auto"
              placeholder="搜索设备名称、型号或编号"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value.slice(0, 50))}
              className="flex-1 bg-transparent outline-none text-[15px] text-gray-900 placeholder:text-gray-400 min-w-0"
              aria-label="搜索设备名称、型号或编号"
            />
            {searchText && (
              <button
                type="button"
                onClick={handleClear}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 active:opacity-75 transition-opacity"
                aria-label="清空搜索"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 10.5-1 1L8 9l-2.5 2.5-1-1L7 8 4.5 5.5l1-1L8 7l2.5-2.5 1 1L9 8l2.5 2.5z"/>
                </svg>
              </button>
            )}
          </div>

          {/* 右侧关闭按钮 (参考 IMG-002) */}
          <button
            type="button"
            onClick={handleClose}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-gray-700 active:bg-gray-100 transition-colors"
            aria-label="关闭搜索"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </header>

        {/* 状态矩阵展示区域 */}
        <div className="flex-1 overflow-y-auto bg-white px-4 py-3 flex flex-col">
          {/* STATE-SRCH-LOCAL-ERROR: 预置数据加载异常 */}
          {guestError ? (
            <div className="my-auto flex flex-col items-center justify-center py-12 text-center" dir="auto">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-3.5">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h3 className="text-[17px] font-semibold text-gray-900 mb-1">演示数据暂时无法加载</h3>
              <p className="text-[13px] text-gray-500 mb-6 max-w-[280px]">
                本地预置数据读取异常。重试仍失败时保持错误页，不请求正式接口。
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setGuestSimulateError(false);
                    setGuestError(null);
                    try {
                      const res = searchGuestDemoData(cleanSearch, { simulateError: false });
                      setGuestResults(res);
                    } catch (e) {
                      setGuestError(e?.message || 'DEMO_DATA_LOAD_FAILED');
                    }
                  }}
                  className="px-5 py-2 rounded-full bg-[#d40014] text-white text-[14px] font-medium active:opacity-90 shadow-sm"
                >
                  重试
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 text-[14px] font-medium active:bg-gray-100"
                >
                  返回首页
                </button>
              </div>
            </div>
          ) : !hasSearchKeyword ? (
            /* STATE-SRCH-EMPTY: 首次进入或关键词为空，保持白色空内容区 (IMG-002) */
            <div className="flex-1 bg-white" />
          ) : guestResults.total === 0 ? (
            /* STATE-SRCH-NONE: 输入未命中，展示参考设计图的无搜索结果插画 */
            <div className="flex-1 flex flex-col items-center justify-center -mt-12 py-12 text-center" dir="auto">
              <NoResultsIllustration />
              <div className="text-[14px] text-[#888693] mt-5">无搜索结果</div>
            </div>
          ) : (
            /* STATE-SRCH-RESULT: 直接展示 3 台假数据设备的搜索结果列表 */
            <div className="space-y-3 pt-2 pb-6">
              {guestResults.all.map((item) => (
                <div
                  key={item.code}
                  onClick={() => handleGuestProductClick(item)}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 bg-white shadow-xs hover:border-gray-200 active:bg-gray-50 transition-all cursor-pointer"
                  dir="auto"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-contain bg-[#f8f9fa] flex-shrink-0 p-1 border border-gray-100"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f3f4f6"/><text x="32" y="36" font-size="12" fill="%239ca3af" text-anchor="middle">SANY</text></svg>';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[15px] font-semibold text-gray-900 truncate">
                        {highlightText(item.displayName || item.name, searchText)}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-sm font-medium flex-shrink-0 bg-blue-50 text-blue-600">
                        {item.type || '设备'}
                      </span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-sm font-medium flex-shrink-0 ${
                        item.status === 'online' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.statusText || '在线'}
                      </span>
                    </div>

                    <div className="mt-1 text-[13px] text-gray-500 space-y-1">
                      <div className="truncate">
                        <span className="text-gray-400">设备编号: </span>
                        <span className="font-mono text-gray-700">
                          {highlightText(item.code, searchText)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[12px] text-gray-400">
                        <span>位置: {item.location || '中国'}</span>
                        <span>时间: {item.reportTime || '2026-09-23 08:30 (UTC+8)'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showScanner) {
    return (
      <ScannerPage
        showStatusBar={false}
        onClose={handleScannerClose}
        onOpenAsset={onOpenAsset}
        onUseSearch={(keyword) => {
          setShowScanner(false);
          setSearchText(keyword);
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col">
      {/* 顶部导航栏 */}
      <div className="flex items-center px-4 pb-3 pt-6 bg-white">
        <button type="button" className="mr-3 flex h-8 w-8 items-center justify-center rounded-full active:bg-gray-100" onClick={handleClose} aria-label="关闭全域搜索">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex-1 h-[40px] bg-gray-100 rounded-full flex items-center px-4">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mr-2 flex-shrink-0">
            <circle cx="8" cy="8" r="6" stroke="#999" strokeWidth="1.5"/>
            <path d="M12.5 12.5L16 16" stroke="#999" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            aria-label="搜索资产、品牌、设备类型、产品、配件或设备分组"
            placeholder="搜索资产、产品或配件…"
            className="flex-1 bg-transparent outline-none text-[16px] text-gray-800"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            maxLength={50}
          />
          {searchText && (
            <button type="button" className="ml-2 flex-shrink-0" onClick={handleClear} aria-label="清空搜索">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" fill="#ccc"/>
                <path d="M6 6L12 12M12 6L6 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 分类 Tab */}
      <div className="flex px-4 py-2 gap-2 bg-white overflow-x-auto">
        {tabs.map((tab) => {
          const count = hasSearchText && searchResults[tab] ? searchResults[tab].length : null;
          return (
            <button
              type="button"
              key={tab}
              className={`px-4 py-2 rounded-full text-[14px] cursor-pointer flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
                activeTab === tab
                  ? 'bg-gray-800 text-white font-medium'
                  : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {isLoading && activeTab === tab && (
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              )}
              {count !== null && !isLoading && (
                <span className="text-[12px]">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto bg-white px-4 py-3">
        {/* 无搜索词时显示历史搜索 */}
        {!hasSearchText && (
          <div className="text-[16px] font-bold text-gray-800 mb-4">历史搜索</div>
        )}
        {isLoading ? (
          <div>
            {[1, 2, 3].map((item) => (
              <SkeletonItem key={item} />
            ))}
          </div>
        ) : currentData.length > 0 ? (
          <>
            {visibleData.map((item) => (
              <React.Fragment key={item.id}>
                {renderCard(item)}
              </React.Fragment>
            ))}
            {!hasSearchText && historyPageCount > 1 && (
              <nav className="mt-4 flex items-center justify-center gap-3" aria-label="历史搜索分页">
                <button type="button" disabled={historyPage === 1} onClick={() => setHistoryPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] text-gray-600 disabled:cursor-not-allowed disabled:opacity-35">上一页</button>
                <span className="text-[13px] tabular-nums text-gray-500">{historyPage} / {historyPageCount}</span>
                <button type="button" disabled={historyPage === historyPageCount} onClick={() => setHistoryPage((page) => Math.min(historyPageCount, page + 1))} className="rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] text-gray-600 disabled:cursor-not-allowed disabled:opacity-35">下一页</button>
              </nav>
            )}
          </>
        ) : (
          <EmptyState />
        )}
      </div>

    </div>
  );
};

export default SearchPage;

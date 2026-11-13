/**
 * 优惠券原型数据与状态定义
 * 需求：COUPON-001 / COUPON-003 / COUPON-004 (R-004 / DEC-005 / STATE-003 / AC-005)
 * SanVIST APP 仅提供优惠券展示与消息通知，不提供核销/领券/申请等业务写操作。
 */

export const COUPON_STORAGE_KEY = 'sanvist_coupon_items_v1';
export const COUPON_DEMO_STATE_KEY = 'sanvist_coupon_demo_state_v1';

/**
 * 金额格式化通用工具函数（未知/缺失展示 "—"，不编造为 0）
 */
export const formatAmount = (val) => {
  if (val === undefined || val === null || val === '') return '—';
  if (typeof val === 'number') {
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  return String(val);
};

// 正常业务样例代金券列表（长文本测试券仅在长文本演示中出现，不混入正常列表）
export const INITIAL_COUPONS = [
  {
    id: 'CPN-ARRIVED-001',
    couponNo: 'SV-CP-20261101-0881',
    name: '配件采购优惠券',
    shortName: '配件采购优惠券',
    category: 'coupon',
    couponType: '满减券',
    templateName: '配件采购专项优惠券模板',
    amount: 100000,
    totalAmount: 100000,
    usedAmount: 0,
    remainingAmount: 100000,
    lockedAmount: 0,
    availableAmount: 100000,
    currency: '￥',
    minSpend: null,
    balance: 100000,
    status: 'available',
    statusText: '可使用',
    isExpiringSoon: false,
    issueTime: '2026.11.01 09:30:00',
    effectiveTime: '2026.11.01 10:00:00',
    validFrom: '2026.11.01',
    validTo: '2026.12.31',
    stackRule: null,
    relatedCustomer: null,
    contractCode: null,
    source: '2026年度重机客户配件采购支持',
    scope: null,
    scopeDescription: null,
    instructions: null,
    usedRecords: [],
    suspendedReason: null,
    invalidReason: null,
  },
  {
    id: 'CPN-EXPIRING-002',
    couponNo: 'SV-CP-20261015-0429',
    name: '服务采购优惠券',
    shortName: '服务采购优惠券',
    category: 'coupon',
    couponType: '满减券',
    templateName: '技术服务采购优惠券模板',
    amount: 200000,
    totalAmount: 200000,
    usedAmount: 0,
    remainingAmount: 200000,
    lockedAmount: 0,
    availableAmount: 200000,
    currency: '￥',
    minSpend: null,
    balance: 200000,
    status: 'available',
    statusText: '即将到期',
    isExpiringSoon: true,
    issueTime: '2026.10.15 08:30:00',
    effectiveTime: '2026.10.15 09:00:00',
    validFrom: '2026.10.15',
    validTo: '2026.11.15',
    stackRule: null,
    relatedCustomer: null,
    contractCode: null,
    source: '工程机械专业维保与技术服务采购激励',
    scope: null,
    scopeDescription: null,
    instructions: null,
    usedRecords: [],
    suspendedReason: null,
    invalidReason: null,
  },
  {
    id: 'CPN-LOCKED-007',
    couponNo: 'SV-CP-20261102-1002',
    name: '主机购置优惠券',
    shortName: '主机购置优惠券',
    category: 'coupon',
    couponType: '满减券',
    templateName: '战略客户主机采购专项优惠券模板',
    amount: 100000,
    totalAmount: 100000,
    usedAmount: 20000,
    remainingAmount: 80000,
    lockedAmount: 30000,
    availableAmount: 50000,
    currency: '￥',
    minSpend: null,
    balance: 50000,
    status: 'available',
    statusText: '可使用',
    isExpiringSoon: false,
    issueTime: '2026.11.02 10:00:00',
    effectiveTime: '2026.11.02 10:30:00',
    validFrom: '2026.11.02',
    validTo: '2027.11.01',
    stackRule: null,
    relatedCustomer: null,
    contractCode: null,
    source: '2026全球战略大客户合作发放',
    scope: null,
    scopeDescription: null,
    instructions: null,
    usedRecords: [],
    suspendedReason: null,
    invalidReason: null,
  },
  {
    id: 'CPN-INACTIVE-005',
    couponNo: 'SV-CP-20261110-0335',
    name: '主机购置优惠券',
    shortName: '主机购置优惠券',
    category: 'coupon',
    couponType: '满减券',
    templateName: '新签战略大客户主机优惠券模板',
    amount: 500000,
    totalAmount: 500000,
    usedAmount: 0,
    remainingAmount: 500000,
    lockedAmount: 0,
    availableAmount: 0,
    currency: '￥',
    minSpend: null,
    balance: 500000,
    status: 'inactive',
    statusText: '未激活',
    isExpiringSoon: false,
    issueTime: '2026.11.10 11:00:00',
    effectiveTime: '待激活',
    validFrom: '待激活',
    validTo: '2027.05.31',
    stackRule: null,
    relatedCustomer: null,
    contractCode: null,
    source: '战略客户新购签约激励审批发放',
    scope: null,
    scopeDescription: null,
    instructions: null,
    usedRecords: [],
    suspendedReason: null,
    invalidReason: null,
  },
  {
    id: 'CPN-SUSPENDED-006',
    couponNo: 'SV-CP-20261025-0771',
    name: '服务采购优惠券',
    shortName: '服务采购优惠券',
    category: 'coupon',
    couponType: '满减券',
    templateName: '海外直营客户专项券模板',
    amount: 200000,
    totalAmount: 200000,
    usedAmount: 0,
    remainingAmount: 200000,
    lockedAmount: 0,
    availableAmount: 0,
    currency: '￥',
    minSpend: null,
    balance: 200000,
    status: 'suspended',
    statusText: '暂停使用',
    isExpiringSoon: false,
    issueTime: '2026.10.25 16:00:00',
    effectiveTime: '2026.10.26 09:00:00',
    validFrom: '2026.10.26',
    validTo: '2027.04.30',
    stackRule: null,
    relatedCustomer: null,
    contractCode: null,
    source: '海外大客户年度经营扶持政策',
    scope: null,
    scopeDescription: null,
    suspendedReason: null,
    instructions: null,
    usedRecords: [],
    invalidReason: null,
  },
  {
    id: 'CPN-USED-004',
    couponNo: 'SV-CP-20261020-0933',
    name: '配件采购优惠券',
    shortName: '配件采购优惠券',
    category: 'coupon',
    couponType: '满减券',
    templateName: '配件集采抵扣券模板',
    amount: 100000,
    totalAmount: 100000,
    usedAmount: 100000,
    remainingAmount: 0,
    lockedAmount: 0,
    availableAmount: 0,
    currency: '￥',
    minSpend: null,
    balance: 0,
    status: 'invalid',
    statusText: '已失效',
    isExpiringSoon: false,
    issueTime: '2026.10.20 14:00:00',
    effectiveTime: '2026.10.20 14:30:00',
    validFrom: '2026.10.20',
    validTo: '2026.12.31',
    stackRule: null,
    relatedCustomer: null,
    contractCode: null,
    source: '重点工程配件集采战略激励',
    scope: null,
    scopeDescription: null,
    instructions: null,
    usedRecords: [],
    suspendedReason: null,
    invalidReason: null,
  },
  {
    id: 'CPN-VOIDED-003',
    couponNo: 'SV-CP-20261001-0112',
    name: '主机购置优惠券',
    shortName: '主机购置优惠券',
    category: 'coupon',
    couponType: '满减券',
    templateName: '主机订购促销满减券模板',
    amount: 300000,
    totalAmount: 300000,
    usedAmount: 0,
    remainingAmount: 0,
    lockedAmount: 0,
    availableAmount: 0,
    currency: '￥',
    minSpend: null,
    balance: null,
    status: 'invalid',
    statusText: '已失效',
    isExpiringSoon: false,
    issueTime: '2026.10.01 10:00:00',
    effectiveTime: '2026.10.01 10:15:00',
    validFrom: '2026.10.01',
    validTo: '2026.11.10',
    stackRule: null,
    relatedCustomer: null,
    contractCode: null,
    source: '2026金秋主机大宗直销促销补贴',
    scope: null,
    scopeDescription: null,
    instructions: null,
    usedRecords: [],
    suspendedReason: null,
    invalidReason: '优惠券已过有效期。',
  },
  {
    id: 'CPN-EXPIRED-008',
    couponNo: 'SV-CP-20260701-0188',
    name: '配件采购优惠券',
    shortName: '配件采购优惠券',
    category: 'coupon',
    couponType: '满减券',
    templateName: '季节性配件采购优惠券模板',
    amount: 100000,
    totalAmount: 100000,
    usedAmount: 0,
    remainingAmount: 100000,
    lockedAmount: 0,
    availableAmount: 0,
    currency: '￥',
    minSpend: null,
    balance: null,
    status: 'invalid',
    statusText: '已失效',
    isExpiringSoon: false,
    issueTime: '2026.07.01 09:00:00',
    effectiveTime: '2026.07.01 09:15:00',
    validFrom: '2026.07.01',
    validTo: '2026.09.30',
    stackRule: null,
    relatedCustomer: null,
    contractCode: null,
    source: '2026夏季设备巡检配件支持',
    scope: null,
    scopeDescription: null,
    instructions: null,
    usedRecords: [],
    suspendedReason: null,
    invalidReason: '优惠券已过有效期。',
  },
  {
    id: 'CPN-LOWBALANCE-009',
    couponNo: 'SV-CP-20260901-0819',
    name: '服务采购优惠券',
    shortName: '服务采购优惠券',
    category: 'coupon',
    couponType: '满减券',
    templateName: '年度服务采购专项满减券模板',
    amount: 100000,
    totalAmount: 100000,
    usedAmount: 95000,
    remainingAmount: 5000,
    lockedAmount: 0,
    availableAmount: 5000,
    currency: '￥',
    minSpend: null,
    balance: 5000,
    status: 'available',
    statusText: '可使用',
    isExpiringSoon: false,
    issueTime: '2026.09.01 09:00:00',
    effectiveTime: '2026.09.01 09:00:00',
    validFrom: '2026.09.01',
    validTo: '2027.08.31',
    stackRule: null,
    relatedCustomer: null,
    contractCode: null,
    source: '设备全生命周期服务保养专项支持',
    scope: null,
    scopeDescription: null,
    instructions: null,
    usedRecords: [],
    suspendedReason: null,
    invalidReason: null,
  },
];

// STATE-001 / STATE-003 专用超长文本测试券（仅在长文本演示中出现，不混入正常列表，面额为10万整数倍）
export const LONG_TEXT_COUPON = {
  id: 'CPN-LONGTEXT-005',
  couponNo: 'SV-CP-20261112-999999999999999',
  name: '三一全球战略大客户大型挖掘机及工程车辆主机购置专用超长大额代金券',
  shortName: '大型挖掘机及主机购置专用大额代金券',
  category: 'coupon',
  couponType: '满减券',
  templateName: '全球尊享大额满减券超长模板',
  amount: 100000000,
  totalAmount: 100000000,
  usedAmount: 0,
  remainingAmount: 100000000,
  lockedAmount: 0,
  availableAmount: 100000000,
  currency: '￥',
  minSpend: null,
  balance: 100000000,
  status: 'available',
  statusText: '可使用',
  isExpiringSoon: false,
  issueTime: '2026.11.01 00:00:00',
  effectiveTime: '2026.11.01 00:00:00',
  validFrom: '2026.11.01 00:00:00',
  validTo: '2030.12.31 23:59:59',
  stackRule: null,
  relatedCustomer: null,
  contractCode: null,
  source: '三一集团全球客户数字化与低碳绿色工程设备年度服务盛典特别发放',
  scope: null,
  scopeDescription: null,
  instructions: null,
  usedRecords: [],
  suspendedReason: null,
  invalidReason: null,
};

export const COUPON_SOURCE_TABS = [
  { key: 'all', label: '全部' },
  { key: 'coupon', label: '优惠券' },
  { key: 'stars', label: '星星兑换' },
  { key: 'rebate', label: '满额返利' },
];

export const COUPON_STATUS_FILTERS = [
  { key: 'all', label: '全部状态' },
  { key: 'available', label: '可用' },
  { key: 'inactive', label: '未激活' },
  { key: 'suspended', label: '暂停使用' },
  { key: 'used', label: '已使用' },
  { key: 'invalid', label: '已失效' },
];

export const readStoredCoupons = () => {
  try {
    const raw = window.localStorage.getItem(COUPON_STORAGE_KEY);
    if (raw === null || raw === undefined) return INITIAL_COUPONS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_COUPONS;
    if (parsed.length === 0) return []; // 真实空数组必须返回空，不能当缺省数据

    // 增量兼容旧存储数据：补齐新样例和缺失的新增业务字段，不清空已有状态
    const initialMap = new Map(INITIAL_COUPONS.map((c) => [c.id, c]));
    const existingIds = new Set(parsed.map((c) => c.id));

    const merged = parsed.map((item) => {
      const defaultItem = initialMap.get(item.id);
      if (!defaultItem) return item;

      // 仅对早期小额活动券的遗留演示样例重置名称与面额
      const isLegacyDemo = Boolean(
        (item.totalAmount !== undefined && item.totalAmount !== null && item.totalAmount < 10000) ||
        (item.amount !== undefined && item.amount !== null && item.amount < 10000) ||
        (typeof item.name === 'string' && (item.name.includes('￥') || item.name.includes('关怀') || item.name.includes('机油') || item.name.includes('滤芯') || item.name.includes('减免')))
      );

      // CPN-VOIDED-003 限定迁移至已过期自然失效样例
      const isVoidedDemo = item.id === 'CPN-VOIDED-003';
      // CPN-USED-004 限定迁移至额度用完已失效（不把已使用设为优惠券独立状态）
      const isUsedDemo = item.id === 'CPN-USED-004';

      if (isLegacyDemo) {
        // 早期小额活动券的遗留演示版本迁移：清洗为新版业务名称与标准面额；已知 CPN-USED-004 兼容迁移至已失效
        return {
          ...defaultItem,
          ...item,
          name: defaultItem.name,
          shortName: defaultItem.shortName,
          amount: defaultItem.amount,
          totalAmount: defaultItem.totalAmount,
          availableAmount: defaultItem.availableAmount,
          usedAmount: defaultItem.usedAmount,
          remainingAmount: defaultItem.remainingAmount,
          lockedAmount: defaultItem.lockedAmount,
          minSpend: null,
          ...(isUsedDemo ? {
            status: 'invalid',
            statusText: '已失效',
            invalidReason: null,
          } : {}),
        };
      }

      // DEC-010 / COUPON-011 保真合并：对已存在记录的未提供（undefined）与显式 null 字段同样保持缺失，绝不以示例默认值冒充真实缺失
      return {
        ...item,
        id: item.id,
        couponNo: item.couponNo ?? defaultItem.couponNo ?? null,
        name: typeof item.name === 'string' ? item.name.replace(/\s*￥[\d,.]+/g, '') : defaultItem.name,
        shortName: item.shortName ?? defaultItem.shortName ?? null,
        category: item.category ?? defaultItem.category ?? 'coupon',
        couponType: item.couponType ?? defaultItem.couponType ?? '满减券',
        templateName: item.templateName ?? defaultItem.templateName ?? null,
        status: isUsedDemo ? 'invalid' : (item.status ?? defaultItem.status ?? 'available'),
        statusText: isUsedDemo ? '已失效' : (item.statusText ?? defaultItem.statusText ?? null),
        isExpiringSoon: item.isExpiringSoon ?? defaultItem.isExpiringSoon ?? false,
        // 核心金额与币种：未提供或为 null 均保持 null 缺失，绝不回退 defaultItem 冒充
        amount: item.amount ?? null,
        totalAmount: item.totalAmount ?? null,
        availableAmount: item.availableAmount ?? null,
        usedAmount: item.usedAmount ?? null,
        remainingAmount: item.remainingAmount ?? null,
        lockedAmount: item.lockedAmount ?? null,
        currency: item.currency ?? null,
        minSpend: null,
        balance: item.balance ?? null,
        // 日期与原因：未提供或为 null 均保持 null 缺失，CPN-VOIDED-003 迁移至标准过期样例；保护非本轮目标存量既有日期/原因
        validTo: isVoidedDemo ? defaultItem.validTo : (item.validTo ?? null),
        validFrom: item.validFrom ?? null,
        issueTime: item.issueTime ?? null,
        effectiveTime: item.effectiveTime ?? null,
        suspendedReason: item.suspendedReason ?? null,
        invalidReason: isVoidedDemo ? defaultItem.invalidReason : (isUsedDemo ? null : (item.invalidReason ?? null)),
        // 规则说明：未提供或为 null 均保持 null 缺失，有值则保留
        scope: item.scope ?? null,
        scopeDescription: item.scopeDescription ?? null,
        instructions: item.instructions ?? null,
        stackRule: item.stackRule ?? null,
        relatedCustomer: item.relatedCustomer ?? null,
        contractCode: item.contractCode ?? null,
        source: item.source ?? null,
        usedRecords: Array.isArray(item.usedRecords) ? item.usedRecords : [],
      };
    });

    INITIAL_COUPONS.forEach((c) => {
      if (!existingIds.has(c.id)) {
        merged.push(c);
      }
    });

    return merged;
  } catch {
    return INITIAL_COUPONS;
  }
};

export const getCouponById = (id) => {
  if (id === LONG_TEXT_COUPON.id) return LONG_TEXT_COUPON;
  const coupons = readStoredCoupons();
  return coupons.find((c) => c.id === id) || null;
};

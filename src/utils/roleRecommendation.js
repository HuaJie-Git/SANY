/**
 * 角色推荐算法
 * 基于用户绑定设备的数据，智能推荐最可能的角色
 */

// 角色ID常量
export const ROLES = {
  OWNER: 'owner',           // 设备所有者
  MANAGER: 'manager',       // 设备管理员
  OPERATOR: 'operator',     // 设备操作手
  MECHANIC: 'mechanic',     // 设备维修员
  PURCHASER: 'purchaser',   // 设备采购员
  DEALER: 'dealer',         // 三一代理商
  EMPLOYEE: 'employee',     // 三一员工
};

/**
 * 根据设备数据推荐角色
 * @param {Object} deviceData - 设备数据
 * @param {number} deviceData.totalCount - 设备总数
 * @param {string[]} deviceData.brands - 设备品牌列表（去重）
 * @param {string} deviceData.sanyCount - SANY品牌设备数量
 * @returns {Object} { roleId: string, confidence: number }
 */
export const getRecommendedRole = (deviceData) => {
  // 无设备数据，默认推荐设备所有者
  if (!deviceData || deviceData.totalCount === 0) {
    return {
      roleId: ROLES.OWNER,
      confidence: 0.3,
      reason: '无设备数据，默认角色'
    };
  }

  const { totalCount, brands, sanyCount } = deviceData;
  const uniqueBrands = [...new Set(brands || [])];

  // 优先级1：设备品牌 ≥ 2个 → 三一代理商
  if (uniqueBrands.length >= 2) {
    return {
      roleId: ROLES.DEALER,
      confidence: 0.8,
      reason: '跨品牌设备，可能是代理商'
    };
  }

  // 优先级2：设备数量 ≥ 5台 且 品牌 = SANY → 设备管理员
  if (totalCount >= 5 && sanyCount >= 5) {
    return {
      roleId: ROLES.MANAGER,
      confidence: 0.75,
      reason: '大量SANY设备，可能是车队管理'
    };
  }

  // 优先级3：设备数量 = 1-2台 → 设备操作手
  if (totalCount >= 1 && totalCount <= 2) {
    return {
      roleId: ROLES.OPERATOR,
      confidence: 0.6,
      reason: '少量设备，可能是个人操作'
    };
  }

  // 优先级4：设备数量 = 3-4台 → 设备所有者
  if (totalCount >= 3 && totalCount <= 4) {
    return {
      roleId: ROLES.OWNER,
      confidence: 0.65,
      reason: '中等数量设备，可能是小老板'
    };
  }

  // 优先级5：其他情况 → 设备所有者
  return {
    roleId: ROLES.OWNER,
    confidence: 0.5,
    reason: '默认推荐'
  };
};

/**
 * 根据推荐角色ID获取角色在列表中的索引
 * @param {string} recommendedRoleId - 推荐的角色ID
 * @param {Array} roles - 角色列表
 * @returns {number} 索引
 */
export const getRecommendedRoleIndex = (recommendedRoleId, roles) => {
  const index = roles.findIndex(r => r.id === recommendedRoleId);
  return index >= 0 ? index : 0;
};

/**
 * 重新排列角色列表，将推荐角色排在前面
 * @param {Array} roles - 原始角色列表
 * @param {string} recommendedRoleId - 推荐的角色ID
 * @returns {Array} 重排后的角色列表
 */
export const reorderRolesByRecommendation = (roles, recommendedRoleId) => {
  const recommendedIndex = roles.findIndex(r => r.id === recommendedRoleId);
  if (recommendedIndex <= 0) return roles;

  const recommendedRole = roles[recommendedIndex];
  const otherRoles = roles.filter((_, i) => i !== recommendedIndex);
  return [recommendedRole, ...otherRoles];
};

/**
 * 埋点工具
 * 统一管理所有埋点事件
 */

// 获取用户ID（实际项目中从store或API获取）
const getUserId = () => {
  return localStorage.getItem('user_id') || 'anonymous';
};

/**
 * 角色引导埋点
 */
export const trackRoleGuide = {
  // 弹窗展示
  modalShow: (recommendedRole) => {
    console.log('[埋点] 角色引导-弹窗展示', {
      user_id: getUserId(),
      推荐角色: recommendedRole
    });
    // 实际项目中替换为真实埋点SDK
    // window.analytics?.track('角色引导-弹窗展示', { ... });
  },

  // 点击提示条
  bannerClick: () => {
    console.log('[埋点] 角色引导-点击提示条', {
      user_id: getUserId()
    });
  },

  // 点击星星区域提示
  starsClick: () => {
    console.log('[埋点] 角色引导-点击星星提示', {
      user_id: getUserId()
    });
  },

  // 滑动/箭头切换角色
  swipe: (fromRole, toRole, method) => {
    console.log('[埋点] 角色引导-切换角色', {
      user_id: getUserId(),
      切换前: fromRole,
      切换后: toRole,
      操作方式: method === 'swipe' ? '滑动' : '点击箭头'
    });
  },

  // 点击确定
  confirm: (selectedRole) => {
    console.log('[埋点] 角色引导-确认选择', {
      user_id: getUserId(),
      选择角色: selectedRole
    });
  },

  // 点击关闭
  close: (currentRole) => {
    console.log('[埋点] 角色引导-关闭弹窗', {
      user_id: getUserId(),
      当前角色: currentRole
    });
  }
};

/**
 * 手机号引导埋点
 */
export const trackPhoneBind = {
  // 弹窗展示
  modalShow: (page) => {
    console.log('[埋点] 手机号引导-弹窗展示', {
      user_id: getUserId(),
      来源页面: page
    });
  },

  // 点击获取验证码
  getCode: (countryCode) => {
    console.log('[埋点] 手机号引导-获取验证码', {
      user_id: getUserId(),
      区号: countryCode
    });
  },

  // 点击确定绑定
  confirm: (countryCode, success) => {
    console.log('[埋点] 手机号引导-确认绑定', {
      user_id: getUserId(),
      区号: countryCode,
      绑定结果: success ? '成功' : '失败'
    });
  },

  // 点击关闭
  close: (page) => {
    console.log('[埋点] 手机号引导-关闭弹窗', {
      user_id: getUserId(),
      来源页面: page
    });
  }
};

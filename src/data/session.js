export const PREVIEW_USER_KEY = 'sanvist_pc_quick_link_preview_user_v1';

// 快速链接定向展示的原型身份；正式版本以登录态和租户成员关系为准。
export const PREVIEW_USERS = [
  { id: 'user-yibao', name: '一包，。', avatar: 'S', tenantId: 'tenant-sany-test', tenant: '三一测试租户', tenantType: 'enterprise' },
  { id: 'user-bowo', name: 'Bowo_Medan', avatar: 'B', tenantId: 'tenant-sany-test', tenant: '三一测试租户', tenantType: 'enterprise' },
  { id: 'user-niran', name: 'Niran_Cool', avatar: 'N', tenantId: 'tenant-sany-test', tenant: '三一测试租户', tenantType: 'enterprise' },
  { id: 'user-asha', name: 'Asha（企业用户样例）', avatar: 'A', tenantId: 'tenant-sany-india', tenant: 'SANY Heavy Industry India Pvt Ltd', tenantType: 'enterprise' },
  { id: 'user-chenxiao', name: '陈晓（个人用户样例）', avatar: '陈', tenantId: 'tenant-personal-chen', tenant: '个人租户', tenantType: 'personal' },
];

export const CURRENT_USER = PREVIEW_USERS[0];

export function readPreviewUser() {
  try {
    const id = window.localStorage.getItem(PREVIEW_USER_KEY);
    return PREVIEW_USERS.find((user) => user.id === id) || CURRENT_USER;
  } catch {
    return CURRENT_USER;
  }
}

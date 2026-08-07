// ============================================================
// 社区模块共享数据源（v2 - 用户体系 + 关注 + 评论）
// ============================================================

// ---- 当前用户 ----
export const CURRENT_USER_ID = 'user-001';

// ---- 用户数据 ----
export const users = [
  { id: 'user-001', name: '机手小王', avatar: 'images/机手社区/挖掘机/挖掘机_03.jpg', bio: '三一挖掘机操作手，5年经验' },
  { id: 'user-002', name: '机手小赵', avatar: 'images/机手社区/三一起重机/三一起重机_03.jpg', bio: '起重机操作员' },
  { id: 'user-003', name: '老司机李', avatar: 'images/机手社区/挖掘机/挖掘机_03.jpg', bio: '10年挖掘机操作经验' },
  { id: 'user-004', name: '效率达人', avatar: 'images/机手社区/泵车/泵车_04.jpg', bio: '泵车操作与效率优化' },
  { id: 'user-005', name: '维修专家', avatar: 'images/机手社区/三一起重机/三一起重机_06.jpg', bio: '设备维修与保养' },
  { id: 'user-006', name: '安全员小李', avatar: 'images/机手社区/挖掘机/挖掘机_04.jpg', bio: '工程安全管理' },
  { id: 'user-007', name: '工地老张', avatar: 'images/机手社区/三一起重机/三一起重机_03.jpg', bio: '施工现场管理' },
  { id: 'user-008', name: '新手学徒', avatar: 'images/机手社区/三一重卡/三一重卡_03.jpg', bio: '刚入行的机手新人' },
  { id: 'user-009', name: '安全专家', avatar: 'images/机手社区/挖掘机/挖掘机_04.jpg', bio: '专注安全规范推广' },
  { id: 'user-010', name: '入门导师', avatar: 'images/机手社区/矿卡/矿卡_03.jpg', bio: '帮助新手快速入门' },
  { id: 'user-011', name: '经验达人', avatar: 'images/机手社区/三一起重机/三一起重机_03.jpg', bio: '分享实操经验' },
  { id: 'user-012', name: '维修大师', avatar: 'images/机手社区/泵车/泵车_04.jpg', bio: '20年设备维修经验' },
  { id: 'user-013', name: '效率王', avatar: 'images/机手社区/挖掘机/挖掘机_03.jpg', bio: '追求极致效率' },
  { id: 'user-014', name: '话题达人', avatar: 'images/机手社区/三一起重机/三一起重机_03.jpg', bio: '积极参与社区话题' },
  { id: 'user-015', name: '内容创作者', avatar: 'images/机手社区/泵车/泵车_04.jpg', bio: '记录工地日常' },
  { id: 'user-016', name: '测试用户', avatar: 'images/机手社区/矿卡/矿卡_03.jpg', bio: '测试账号' },
  { id: 'sany-official', name: '三一官方', avatar: 'images/机手社区/三一重卡/三一重卡_01.jpg', bio: '三一重工官方账号', isOfficial: true },
];

export const getUserById = (id) => users.find((u) => u.id === id) || null;
export const getCurrentUser = () => getUserById(CURRENT_USER_ID);

// ---- 关注关系 ----
let _followedUserIds = new Set(['user-003', 'user-005', 'user-007', 'user-011']);

export const getFollowedUserIds = () => new Set(_followedUserIds);
export const isFollowing = (userId) => _followedUserIds.has(userId);

export const toggleFollow = (userId) => {
  if (_followedUserIds.has(userId)) {
    _followedUserIds.delete(userId);
    return false;
  }
  _followedUserIds.add(userId);
  return true;
};

// ---- 话题数据（单一数据源） ----
export const topics = [
  { id: 1, name: '设备操作', icon: '🔧', color: '#4ECDC4', description: '挖掘机、起重机、泵车等设备的操作技巧与经验分享', contentCount: 856, viewCount: 128500, participantCount: 2150, heat: 9800 },
  { id: 2, name: '保养技巧', icon: '🛠️', color: '#45B7D1', description: '设备日常保养、定期维护、延长使用寿命的实用方法', contentCount: 623, viewCount: 96300, participantCount: 1890, heat: 7600 },
  { id: 3, name: '工程现场', icon: '🏗️', color: '#96CEB4', description: '施工现场实拍、项目进展记录、工程案例展示', contentCount: 534, viewCount: 82100, participantCount: 1650, heat: 6200 },
  { id: 4, name: '安全规范', icon: '⚠️', color: '#FFEAA7', description: '安全操作规程、事故预防、安全培训资料分享', contentCount: 423, viewCount: 65800, participantCount: 1420, heat: 5100 },
  { id: 5, name: '新手入门', icon: '📖', color: '#DDA0DD', description: '新手机手入门指南、基础操作教学、常见问题解答', contentCount: 356, viewCount: 53200, participantCount: 1280, heat: 4300 },
  { id: 6, name: '经验分享', icon: '💡', color: '#98D8C8', description: '资深机手工作经验总结、效率提升心得、职业成长故事', contentCount: 289, viewCount: 41500, participantCount: 1150, heat: 3800 },
  { id: 7, name: '设备维修', icon: '🔩', color: '#F7DC6F', description: '设备故障诊断、维修方案、零配件更换经验交流', contentCount: 234, viewCount: 35600, participantCount: 980, heat: 3200 },
  { id: 8, name: '工作效率', icon: '⚡', color: '#BB8FCE', description: '施工效率优化、工作流程改进、时间管理技巧', contentCount: 189, viewCount: 28400, participantCount: 850, heat: 2800 },
  { id: 9, name: '占位话题1', icon: '📌', color: '#E8A87C', description: '占位话题1的详细描述内容，后续将替换为真实话题', contentCount: 156, viewCount: 19800, participantCount: 720, heat: 2100 },
  { id: 10, name: '占位话题2', icon: '📌', color: '#85CDCA', description: '占位话题2的详细描述内容，后续将替换为真实话题', contentCount: 98, viewCount: 12600, participantCount: 540, heat: 1600 },
];

export const getTopicByName = (name) => topics.find((t) => t.name === name) || null;
export const getTopicById = (id) => topics.find((t) => t.id === id) || null;

// ---- 帖子数据（公共内容 + 本人内容） ----
export const posts = [
  // 本人帖子
  {
    id: 101, authorId: 'user-001', topicId: 1,
    title: '分享下我的操作经验，新手们必看', content: '作为一名5年经验的挖掘机操作手，我想分享一些实用的操作技巧。首先是起步前的检查流程，其次是日常操作中的注意事项，最后是收工后的保养要点。希望对新手朋友们有所帮助。',
    image: 'images/机手社区/三一起重机/三一起重机_03.jpg',
    views: 1280, likes: 156, date: '2026-07-10', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 102, authorId: 'user-001', topicId: 2,
    title: '设备保养小技巧分享', content: '定期保养是延长设备寿命的关键。分享几个我总结的保养小技巧，包括滤清器更换周期、润滑油选择标准等。',
    image: 'images/机手社区/泵车/泵车_04.jpg',
    views: 856, likes: 89, date: '2026-07-08', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 103, authorId: 'user-001', topicId: 3,
    title: '今天在工地拍到的SANY挖掘机，太帅了', content: '今天在工地上看到一台全新的三一挖掘机，霸气十足！忍不住拍了几张照片分享给大家。',
    image: 'images/机手社区/挖掘机/挖掘机_04.jpg',
    views: 2340, likes: 312, date: '2026-07-05', type: 'image', auditStatus: 'approved', isLiked: true,
  },
  {
    id: 104, authorId: 'user-001', topicId: 3,
    title: '吊装作业全过程记录', content: '记录一次完整的吊装作业流程，从准备工作到安全收尾，每一步都不能马虎。',
    image: 'images/机手社区/三一起重机/三一起重机_06.jpg',
    views: 678, likes: 67, date: '2026-07-03', type: 'image', auditStatus: 'pending', isLiked: false,
  },
  {
    id: 105, authorId: 'user-001', topicId: 4,
    title: '安全操作心得（未通过审核示例）', content: '这是一条审核未通过的示例帖子，仅本人可见。',
    image: 'images/机手社区/挖掘机/挖掘机_03.jpg',
    views: 0, likes: 0, date: '2026-07-14', type: 'image', auditStatus: 'rejected', isLiked: false,
  },
  // 公共帖子 - user-003（已关注）
  {
    id: 1, authorId: 'user-003', topicId: 1,
    title: '三一E6电动正面吊投入使用,助力绿色智慧升级', content: '三一E6电动正面吊正式投入使用，标志着绿色智慧建造进入新阶段。这款设备采用纯电驱动，零排放、低噪音，非常适合城市施工环境。',
    image: 'images/机手社区/三一重卡/三一重卡_03.jpg',
    views: 856, likes: 139, comments: 26, date: '2026-07-09', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 2, authorId: 'user-003', topicId: 1,
    title: '挖掘机作业全过程记录', content: '从开机检查到收工保养，完整记录一天的挖掘机作业流程。',
    image: 'images/机手社区/挖掘机/挖掘机_03.jpg',
    views: 1560, likes: 256, comments: 45, date: '2026-07-06', type: 'video', duration: '05:42', auditStatus: 'approved', isLiked: false,
  },
  // 公共帖子 - user-005（已关注）
  {
    id: 3, authorId: 'user-005', topicId: 2,
    title: '设备保养小技巧分享，延长设备寿命', content: '总结了10年的设备保养经验，分享几个实用的保养技巧，帮助大家延长设备使用寿命。',
    image: 'images/机手社区/泵车/泵车_04.jpg',
    views: 780, likes: 156, comments: 34, date: '2026-07-06', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 30, authorId: 'user-005', topicId: 2,
    title: '滤清器更换实操教学', content: '手把手教你如何正确更换设备滤清器，避免常见错误操作。',
    image: 'images/机手社区/泵车/泵车_04.jpg',
    views: 640, likes: 98, comments: 22, date: '2026-07-12', type: 'video', duration: '03:18', auditStatus: 'approved', isLiked: false,
  },
  // 公共帖子 - user-007（已关注）
  {
    id: 4, authorId: 'user-007', topicId: 3,
    title: '吊装作业全过程记录', content: '详细记录了一次大型吊装作业的全过程，包括安全检查、设备调试、吊装执行和收尾工作。',
    image: 'images/机手社区/三一起重机/三一起重机_03.jpg',
    views: 680, likes: 145, comments: 32, date: '2026-07-04', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 31, authorId: 'user-007', topicId: 3,
    title: '塔吊标准节吊装实拍', content: '完整记录塔吊标准节安装过程，从地面组装到高空对接。',
    image: 'images/机手社区/三一起重机/三一起重机_06.jpg',
    views: 920, likes: 178, comments: 38, date: '2026-07-14', type: 'video', duration: '08:15', auditStatus: 'approved', isLiked: false,
  },
  // 公共帖子 - user-011（已关注）
  {
    id: 5, authorId: 'user-011', topicId: 6,
    title: '10年操作经验分享', content: '入行10年，从新手到老师傅，分享我的成长历程和操作心得。',
    image: 'images/机手社区/三一起重机/三一起重机_03.jpg',
    views: 1580, likes: 234, comments: 56, date: '2026-06-30', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 32, authorId: 'user-011', topicId: 6,
    title: '老师傅的挖掘机日常维护秘诀', content: '20年经验浓缩，教你如何用最简单的方法保养设备。',
    image: 'images/机手社区/挖掘机/挖掘机_03.jpg',
    views: 1120, likes: 189, comments: 42, date: '2026-07-08', type: 'video', duration: '04:56', auditStatus: 'approved', isLiked: false,
  },
  // 公共帖子 - 其他用户
  {
    id: 6, authorId: 'user-004', topicId: 1,
    title: '这些操作技巧让你效率翻倍', content: '分享几个能显著提升作业效率的操作技巧，适合有一定基础的操作手。',
    image: 'images/机手社区/泵车/泵车_04.jpg',
    views: 920, likes: 167, comments: 38, date: '2026-07-05', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 33, authorId: 'user-004', topicId: 1,
    title: '泵车臂架操作技巧详解', content: '泵车臂架操作是门学问，这几个技巧让你事半功倍。',
    image: 'images/机手社区/泵车/泵车_04.jpg',
    views: 780, likes: 134, comments: 28, date: '2026-07-11', type: 'video', duration: '06:30', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 7, authorId: 'user-006', topicId: 2,
    title: '这些保养误区你中了几个？', content: '盘点常见的设备保养误区，看看你有没有踩坑。',
    image: 'images/机手社区/三一起重机/三一起重机_06.jpg',
    views: 1020, likes: 189, comments: 42, date: '2026-07-05', type: 'video', duration: '07:22', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 8, authorId: 'user-008', topicId: 3,
    title: '工地现场安全操作规范', content: '新手必看的工地安全操作规范，保护自己也保护他人。',
    image: 'images/机手社区/三一重卡/三一重卡_03.jpg',
    views: 560, likes: 123, comments: 28, date: '2026-07-03', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 9, authorId: 'user-009', topicId: 4,
    title: '这些安全规范必须遵守', content: '安全无小事，这些规范是血的教训换来的，必须严格遵守。',
    image: 'images/机手社区/挖掘机/挖掘机_04.jpg',
    views: 1200, likes: 198, comments: 45, date: '2026-07-02', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 34, authorId: 'user-009', topicId: 4,
    title: '高空作业安全防护演示', content: '实地演示高空作业标准防护流程，每个步骤都不能省。',
    image: 'images/机手社区/三一起重机/三一起重机_03.jpg',
    views: 890, likes: 156, comments: 34, date: '2026-07-10', type: 'video', duration: '05:10', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 10, authorId: 'user-010', topicId: 5,
    title: '新手必看的操作指南', content: '从零开始的挖掘机操作指南，适合刚入行的新手朋友。',
    image: 'images/机手社区/矿卡/矿卡_03.jpg',
    views: 890, likes: 167, comments: 38, date: '2026-07-01', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 35, authorId: 'user-010', topicId: 5,
    title: '挖掘机基础操作入门教学', content: '新手第一课：认识操作杆、熟悉仪表盘、掌握基本动作。',
    image: 'images/机手社区/挖掘机/挖掘机_04.jpg',
    views: 1340, likes: 245, comments: 58, date: '2026-07-13', type: 'video', duration: '12:45', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 11, authorId: 'user-012', topicId: 7,
    title: '常见故障排除指南', content: '汇总了设备常见故障及其排除方法，建议收藏备用。',
    image: 'images/机手社区/泵车/泵车_04.jpg',
    views: 1100, likes: 189, comments: 42, date: '2026-06-29', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 36, authorId: 'user-012', topicId: 7,
    title: '液压油泄漏紧急处理', content: '施工现场突发液压油泄漏怎么办？教你快速判断和应急处理。',
    image: 'images/机手社区/泵车/泵车_04.jpg',
    views: 760, likes: 132, comments: 26, date: '2026-07-09', type: 'video', duration: '04:08', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 12, authorId: 'user-013', topicId: 8,
    title: '提升工作效率的5个技巧', content: '从时间管理到操作优化，5个实用技巧帮你提升工作效率。',
    image: 'images/机手社区/挖掘机/挖掘机_03.jpg',
    views: 760, likes: 145, comments: 32, date: '2026-06-28', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 37, authorId: 'user-013', topicId: 8,
    title: '多台设备协同作业效率提升', content: '讲解如何合理调度多台设备，实现工地效率最大化。',
    image: 'images/机手社区/三一起重机/三一起重机_06.jpg',
    views: 540, likes: 89, comments: 18, date: '2026-07-06', type: 'video', duration: '06:12', auditStatus: 'approved', isLiked: false,
  },
  // 新品发布话题 - SANY官方帖子
  {
    id: 41, authorId: 'sany-official', topicId: 9,
    title: 'SY750H发布会现场精彩回顾', content: '带大家回顾SY750H发布会的精彩瞬间，从开场到产品揭幕，每一个环节都充满惊喜。',
    image: 'images/机手社区/挖掘机/挖掘机_03.jpg',
    views: 3420, likes: 567, comments: 98, date: '2026-07-14', type: 'video', duration: '02:35', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 42, authorId: 'user-014', topicId: 9,
    title: '新品发布话题测试内容', content: '这是一条普通用户在新品发布话题下的内容。',
    image: 'images/机手社区/三一重卡/三一重卡_03.jpg',
    views: 320, likes: 45, comments: 8, date: '2026-07-12', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  // 占位话题2 内容
  {
    id: 15, authorId: 'user-016', topicId: 10,
    title: '占位话题2的内容示例', content: '占位话题2的示例内容。',
    image: 'images/机手社区/三一起重机/三一起重机_06.jpg',
    views: 180, likes: 28, comments: 3, date: '2026-07-10', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 43, authorId: 'user-015', topicId: 10,
    title: '占位话题2视频内容示例', content: '这是一条占位话题2下的视频帖子，用于验证视频卡片展示效果。',
    image: 'images/机手社区/矿卡/矿卡_03.jpg',
    views: 240, likes: 36, comments: 7, date: '2026-07-13', type: 'video', duration: '03:45', auditStatus: 'approved', isLiked: false,
  },
  // 更多已关注用户的内容
  {
    id: 16, authorId: 'user-003', topicId: 1,
    title: '雨天作业注意事项', content: '雨天施工有很多需要注意的地方，分享我的经验。',
    image: 'images/机手社区/挖掘机/挖掘机_04.jpg',
    views: 430, likes: 78, comments: 15, date: '2026-07-13', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 17, authorId: 'user-005', topicId: 2,
    title: '液压系统维护要点', content: '液压系统是设备的核心，维护不当会导致严重故障。',
    image: 'images/机手社区/泵车/泵车_04.jpg',
    views: 560, likes: 92, comments: 18, date: '2026-07-11', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 18, authorId: 'user-007', topicId: 3,
    title: '夜间施工安全指南', content: '夜间施工风险更高，安全措施必须到位。',
    image: 'images/机手社区/三一起重机/三一起重机_06.jpg',
    views: 380, likes: 65, comments: 12, date: '2026-07-09', type: 'image', auditStatus: 'approved', isLiked: false,
  },
  {
    id: 19, authorId: 'user-011', topicId: 6,
    title: '如何从新手成长为老师傅', content: '分享我的职业成长路径，给正在奋斗的同行一些参考。',
    image: 'images/机手社区/三一起重机/三一起重机_03.jpg',
    views: 890, likes: 156, comments: 34, date: '2026-07-07', type: 'image', auditStatus: 'approved', isLiked: false,
  },
];

// ---- 评论数据 ----
let _comments = [
  { id: 1, postId: 1, userId: 'user-002', userName: '机手小赵', userAvatar: 'images/机手社区/三一起重机/三一起重机_03.jpg', content: '写得很好，学到了！', time: '2小时前' },
  { id: 2, postId: 1, userId: 'user-004', userName: '效率达人', userAvatar: 'images/机手社区/泵车/泵车_04.jpg', content: '确实，起步检查很重要', time: '3小时前' },
  { id: 3, postId: 101, userId: 'user-003', userName: '老司机李', userAvatar: 'images/机手社区/挖掘机/挖掘机_03.jpg', content: '经验之谈，值得学习！', time: '1小时前' },
  { id: 4, postId: 2, userId: 'user-006', userName: '安全员小李', userAvatar: 'images/机手社区/挖掘机/挖掘机_04.jpg', content: '挖掘机操作确实需要技巧', time: '5小时前' },
  { id: 5, postId: 103, userId: 'user-007', userName: '工地老张', userAvatar: 'images/机手社区/三一起重机/三一起重机_03.jpg', content: '这台设备看起来真不错！', time: '3天前' },
  { id: 6, postId: 3, userId: 'user-009', userName: '安全专家', userAvatar: 'images/机手社区/挖掘机/挖掘机_04.jpg', content: '保养工作做得很到位', time: '1天前' },
  { id: 7, postId: 4, userId: 'user-011', userName: '经验达人', userAvatar: 'images/机手社区/三一起重机/三一起重机_03.jpg', content: '吊装作业确实需要全程记录', time: '2天前' },
  { id: 8, postId: 5, userId: 'user-010', userName: '入门导师', userAvatar: 'images/机手社区/矿卡/矿卡_03.jpg', content: '10年经验不容易，佩服！', time: '4天前' },
  { id: 9, postId: 102, userId: 'user-005', userName: '维修专家', userAvatar: 'images/机手社区/三一起重机/三一起重机_06.jpg', content: '保养确实是延长设备寿命的关键', time: '2天前' },
  { id: 10, postId: 104, userId: 'user-003', userName: '老司机李', userAvatar: 'images/机手社区/挖掘机/挖掘机_03.jpg', content: '吊装作业安全第一！', time: '5天前' },
];

let _nextCommentId = _comments.length + 1;

export const getCommentsByPostId = (postId) =>
  _comments.filter((c) => c.postId === postId);

export const addComment = (postId, content) => {
  const user = getCurrentUser();
  const comment = {
    id: _nextCommentId++,
    postId,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    content,
    time: '刚刚',
  };
  _comments.push(comment);
  return comment;
};

// 删除当前用户自己的帖子。真实接入时由服务端校验作者身份并同步删除关联评论。
export const deletePost = (postId) => {
  const postIndex = posts.findIndex((post) => post.id === postId);
  const post = posts[postIndex];

  if (!post || post.authorId !== CURRENT_USER_ID) return false;

  posts.splice(postIndex, 1);
  _comments = _comments.filter((comment) => comment.postId !== postId);
  return true;
};

// ---- 过滤辅助函数 ----
export const getMyVisiblePosts = () =>
  posts.filter(
    (p) => p.authorId === CURRENT_USER_ID && (p.auditStatus === 'approved' || p.auditStatus === 'pending' || p.auditStatus === 'rejected')
  );

export const getApprovedPosts = () =>
  posts.filter((p) => p.auditStatus === 'approved');

export const getContentsByTopicName = (topicName) => {
  const topic = getTopicByName(topicName);
  if (!topic) return [];
  return posts.filter((p) => p.topicId === topic.id && p.auditStatus === 'approved');
};

// 获取已关注用户的公开帖子
export const getFollowedUserPosts = () =>
  posts.filter(
    (p) => _followedUserIds.has(p.authorId) && p.auditStatus === 'approved' && p.authorId !== CURRENT_USER_ID
  );

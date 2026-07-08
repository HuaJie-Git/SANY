# SanVIST 首页原型

## 项目简介

SanVIST 设备管理 APP 首页原型，基于 React + Vite + Tailwind CSS 构建。

## 技术栈

- **框架**：React 18
- **构建工具**：Vite
- **样式**：Tailwind CSS
- **路由**：React Router（待集成）

## 项目结构

```
sanvist-homepage/
├── src/
│   ├── components/
│   │   ├── TopNav/          # 顶部导航栏
│   │   ├── QuickAccess/     # 快捷功能入口
│   │   ├── RecentView/      # 最近查看
│   │   ├── DeviceStartup/   # 设备开机动态
│   │   ├── AuditEvents/     # 审核事件
│   │   ├── ContentFeed/     # 内容信息流
│   │   └── BottomNav/       # 底部导航栏
│   ├── pages/
│   │   └── Home/            # 首页
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 安装和运行

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 功能模块

### 1. 顶部导航栏
- 品牌 Logo：SanVIST
- 搜索框：点击跳转搜索页
- 扫码功能：支持产品、主机、配件、PC 登录二维码
- 更多功能：绑定设备、分享设备、客户认证、电子围栏、PC 扫码登录
- 消息通知：铃铛图标，显示未读数量

### 2. 快捷功能入口
- 第一屏：4 个全显 + 1 个半隐藏
- 支持横向滑动查看更多
- 角色适配：不同角色显示不同入口

### 3. 最近查看
- 横向滑动卡片
- 支持资产、配件、审核、活动模板
- 点击进入列表页

### 4. 设备开机动态
- 单设备展示（设备 ≤ 10 台）
- 多设备总览（设备 > 10 台）
- 工时柱状图
- 设备位置和上报时间

### 5. 审核事件（快速入口）
- 展示 4 个大类：设备异常、维保事项、燃油异常、位置预警
- 显示未读数量和待处理总数
- 维保事项显示已超时、临期数量

### 6. 内容信息流
- Tab 分类：全部、活动、优惠、行业动态、机手社区
- 双列瀑布流布局
- 轮播图、视频、文章内容
- 广告位和推荐内容

### 7. 底部导航栏
- 5 个 Tab：首页、资产、AI 助手、审核、我的
- AI 助手为红色圆形按钮
- 我的 Tab 有红点提示

## 设计规范

- **设计稿宽度**：375px
- **适配设备**：iPhone 17
- **品牌色**：#E60012（三一红）
- **背景色**：#F2F2F7
- **卡片背景**：#FFFFFF

## 开发注意事项

### 样式问题
- 确保 Tailwind CSS 配置正确
- 使用可靠的图片源或内联 SVG
- 避免端口冲突

### 性能优化
- 使用懒加载
- 优化图片加载
- 避免不必要的重渲染

## 部署

### Netlify 部署

1. 构建生产版本：`npm run build`
2. 将 `dist` 目录部署到 Netlify
3. 配置构建命令：`npm run build`
4. 配置输出目录：`dist`

### 其他平台

- Vercel
- GitHub Pages
- AWS S3

## 联系方式

如有问题，请随时沟通。

---

**版本**：V1.0
**创建日期**：2026-07-02
**作者**：产品经理

# SanVIST PC 原型

SanVIST 设备管理 PC 端原型，包含设备列表、设备详情、实时状态和统计报表。

## 项目映射

- 本地目录：`/Users/hj/产品/原型/SanVist-PC`
- Git 仓库：`https://github.com/HuaJie-Git/SANY`
- Git 分支：`pc`
- 本地地址：`http://localhost:5174/`
- 发布地址：`https://huajie-git.github.io/SANY/pc/`

## 本地运行

```bash
npm install
npm run dev
```

如需与本地运营后台联动预览快速链接配置，在 PC 项目运行 `SANVIST_PREVIEW_SHARED_ORIGIN=1 npm run dev`，同时在 `SanVist-Admin` 运行 `npm run dev`，通过 `http://127.0.0.1:5175/pc/` 查看 PC 页面。点击 PC 顶部右侧头像与用户名，可直接切换演示用户，检查所有用户、指定企业租户和指定人员三种可见结果；该控件仅用于原型验收，正式版本应使用实际登录账号及当前租户。

## 构建

```bash
npm run build
```

本项目只维护 PC 端原型；APP 与运营后台分别位于 `SanVist-APP` 和 `SanVist-Admin`。

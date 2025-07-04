```
/fast-vue3
├─ .github/
│   └─ workflows/           # GitHub CI 配置：Lint、测试、构建自动化
├─ .husky/                  # Git pre-commit 钩子（lint-staged）
├─ .vscode/                 # 推荐 VSCode 插件 & 设置
├─ build/                   # 封装 Vite 插件入口 (`build/vite/plugins`)
├─ config/                  # 各种运行期常量与 Vite 插件配置
├─ docs/                    # 项目文档源码（VitePress）
├─ mock/                    # 本地 mock 接口（vite-plugin-mock）
├─ plop-tpls/               # Plop 模板：脚手架生成 pages/component/store
├─ public/                  # 静态资源 & index.html
├─ src/
│   ├─ main.ts              # 应用入口：注册 Pinia、Router、UI 库并挂载
│   ├─ App.vue              # 根组件，承载路由出口 `<router-view/>`
│   ├─ assets/              # 全局样式、图标、SVG、图片
│   ├─ api/                 # 后端接口封装，按模块划分 ts 文件
│   ├─ utils/               # 通用方法/封装，如 axios 请求封装
│   ├─ components/          # 全局复用组件（自动按需引入）
│   ├─ router/              # Vue-router 路由配置 + modules 子路由
│   ├─ store/               # Pinia 状态管理模块
│   ├─ views/               # 页面级 Vue 组件
│   ├─ styles/              # 全局样式、变量、主题配置
│   └─ hooks/（或 composables/） # 通用 hooks，如 useFetch、useMenu 等
├─ types/                   # 全局 TS 类型声明（`.d.ts`）
├─ .env*, .env.*            # 多环境变量配置（API地址、打包路径等）
├─ index.html               # SPA 入口 HTML
├─ tsconfig.json            # TS 编译 & 路径别名（如 `/@/`）
├─ vite.config.mts          # 顶层 Vite 配置（插件引用、别名）
├─ postcss.config.js        # PostCSS & Tailwind 配置
├─ unocss.config.ts         # UnoCSS（如使用）
├─ eslint.config.mjs        # ESLint 本地配置
├─ prettier.config.js       # 代码格式化配置
├─ stylelint.config.js      # 样式检查配置
├─ plopfile.js              # Plop 脚手架入口
├─ package.json, pnpm/yarn-lock 等
└─ README*.md               # 项目说明 & 快速上手指南 :contentReference[oaicite:1]{index=1}
```

一个开箱即用，快速搭建大型应用的 Vue3 + Vite4.0 + TypeScript+...模板框架。集成了各类插件，并进行了模块化和按需加载的优化，可以放心使用。 [文档](https://tobe-fe-dalao.github.io/fast-vue3-site/)


# 快速开始

推荐使用 yarn（首选） 或 pnpm 不推荐使用npm

```shell
yarn install
pnpm install
```

运行命令

```shell
yarn dev
pnpm dev
```

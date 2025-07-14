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



# 整体页面的layout布局组件

包括：**基于角色的左侧Layout组件** 和  **页面上部Header组件**

```
// 使用示例和说明

使用说明：

1. 创建页面
- 在src/views目录下创建相应的页面
- 目前已经根据角色分类，创建了 admin、research、patient、doctor 组
- 可以在相应的组中创建页面 如：若想为admin角色创建一个新的页面“demo_admin”，那么需要在 src/views/admin 文件夹下创建 demo_admin文件夹，在 demo_admin文件夹 中创建 index.vue 文件
2. 路由配置：
- 在文件 src/router/index.ts 中的主要布局路由（AppLayout）的子节点（children）中添加新页面的路由，即可为该页面自动使用设定好的整体布局
- 在每个路由的 meta 中添加 roles 数组，定义哪些角色可以访问该路由
- 如需所有角色都可以访问，建议在roles数组中写为：['ADMIN', 'RESEARCHER', 'DOCTOR', 'PATIENT']
3. 页面编辑
- 在之前创建的相应的 index.vue 文件中编写页面的主体内容
- 在 src/api 文件夹下，创建相关服务的接口调用逻辑，具体参考 src/api/auth 的格式和方法
- 在 index.vue 页面中调用相关接口，对返回内容具体进行处理即可


路由示例模板：
只有一个节点：
  {
    path: '/demo1',
    name: 'Demo1',
    meta: {
      title: '示例1',
      requiresAuth: true,
      roles: ['ADMIN', 'RESEARCHER', 'DOCTOR', 'PATIENT'],
    },
    component: () => import('@/views/demo1/index.vue'),
  },

有2个即以上子节点：
{
    path: '/demo2',
    name: 'Demo2',
    meta: {
      title: '示例2',
      requiresAuth: true,
      roles: ['ADMIN',...],
    },
    children: [
      {
        path: '/demo2/children1',
        name: 'children1',
        meta: {
          title: '子节点1',
          requiresAuth: true,
          roles: ['ADMIN',...],
        },
        component: () => import('@/views/demo2/children1/index.vue'),
      },
      {
        path: '/demo2/children2',
        name: 'children1',
        meta: {
          title: '子节点2',
          requiresAuth: true,
          roles: ['ADMIN'，...],
        },
        component: () => import('@/views/demo2/children1/index.vue'),
      },
    ],
  },

```


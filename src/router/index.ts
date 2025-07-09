// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useUserStore } from '@/store/modules/user';

const baseURL = import.meta.env.VITE_BASE_URL;

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    meta: {
      title: '登录',
      requiresAuth: false,
    },
    component: () => import('@/views/login/index.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    meta: {
      title: '注册',
      requiresAuth: false,
    },
    component: () => import('@/views/register/index.vue'),
  },
  {
    path: '/contain',
    name: 'Layout',
    meta: {
      title: '主页',
      requiresAuth: true,
    },
    component: () => import('@/views/contain/index.vue'),
  },
  {
    path: '/profile',
    name: 'Profile',
    meta: {
      title: '个人信息',
      requiresAuth: true,
    },
    component: () => import('@/views/profile/index.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    meta: {
      title: '页面未找到',
    },
    component: () => import('@/views/404/index.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(baseURL),
  routes,
});

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  NProgress.start();

  const userStore = useUserStore();

  // 重新初始化登录状态（恢复 token）
  userStore.initUser();

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      // 未登录，跳转到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      });
      return;
    }

    // 不再尝试拉取用户资料
    // 不再检查 userInfo
  } else {
    if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn) {
      next('/contain');
      return;
    }
  }

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 医防康系统`;
  }

  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
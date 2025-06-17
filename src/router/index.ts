// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useUserStore } from '@/store/modules/user';

const baseURL = import.meta.env.VITE_BASE_URL;

// 定义路由
const routes = [
  {
    path: '/',
    redirect: '/login', // 根路径重定向到登录页
  },
  {
    path: '/login',
    name: 'Login',
    meta: {
      title: '登录',
      requiresAuth: false, // 不需要认证
    },
    component: () => import('@/views/login/index.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    meta: {
      title: '注册',
      requiresAuth: false, // 不需要认证
    },
    component: () => import('@/views/register/index.vue'),
  },
  {
    path: '/contain',
    name: 'Layout',
    meta: {
      title: '主页',
      requiresAuth: true, // 需要认证
    },
    component: () => import('@/views/contain/index.vue'),
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

  // 初始化用户信息（从localStorage恢复）
  if (!userStore.userInfo && userStore.token) {
    userStore.initUser();
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      // 未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }, // 保存原本要访问的页面
      });
      return;
    }

    // 如果有token但没有用户信息，尝试获取用户信息
    if (userStore.token && !userStore.userInfo) {
      try {
        await userStore.fetchUserProfile();
      } catch (error) {
        // 获取用户信息失败，清除token并重定向到登录页
        userStore.clearUser();
        next('/login');
        return;
      }
    }
  } else {
    // 如果已登录用户访问登录或注册页，重定向到主页
    if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn) {
      next('/contain');
      return;
    }
  }

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 医疗管理系统`;
  }

  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
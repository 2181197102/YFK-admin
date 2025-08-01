// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useUserStore } from '@/store/modules/user';
import { getGeneralRoleFromToken, getRoleCodeFromToken } from '@/utils/auth';

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

  // ============= 主要布局路由 =============
  {
    path: '/app',
    name: 'AppLayout',
    component: () => import('@/layout/index.vue'), // 使用统一布局
    meta: {
      requiresAuth: true,
    },
    children: [
      // 主页
      {
        path: '/dashboard',
        name: 'Dashboard',
        meta: {
          title: '主页',
          requiresAuth: true,
          roles: ['ADMIN', 'RESEARCHER', 'DOCTOR', 'PATIENT'],
          icon: 'dashboard',
        },
        component: () => import('@/views/dashboard/index.vue'),
      },
      // 个人信息页面
      {
        path: '/profile',
        name: 'Profile',
        meta: {
          title: '个人信息',
          requiresAuth: true,
        },
        component: () => import('@/views/profile/index.vue'),
      },

      // ============= 管理员路由 =============
      {
        path: '/admin',
        name: 'Admin',
        meta: {
          title: '系统管理',
          requiresAuth: true,
          roles: ['ADMIN'],
          icon: 'component',
        },
        children: [
          {
            path: '/admin/users',
            name: 'UserManagement',
            meta: {
              title: '用户管理',
              requiresAuth: true,
              roles: ['ADMIN'],
            },
            component: () => import('@/views/admin/users/index.vue'),
          },
          {
            path: '/admin/roles',
            name: 'RoleManagement',
            meta: {
              title: '角色管理',
              requiresAuth: true,
              roles: ['ADMIN'],
            },
            component: () => import('@/views/admin/roles/index.vue'),
          },
          {
            path: '/admin/system',
            name: 'SystemSettings',
            meta: {
              title: '系统设置',
              requiresAuth: true,
              roles: ['ADMIN'],
            },
            component: () => import('@/views/admin/system/index.vue'),
          },
        ],
      },

      // ============= 研究员路由 =============
      {
        path: '/research',
        name: 'Research',
        meta: {
          title: '研究中心',
          requiresAuth: true,
          roles: ['RESEARCHER', 'ADMIN'],
          icon: 'search',
        },
        children: [
          {
            path: '/research/projects', // 子路由路径：/research/projects
            name: 'ResearchProjects',
            meta: {
              title: '研究项目',
              requiresAuth: true,
              roles: ['RESEARCHER', 'ADMIN'],
            },
            // 关键：指向选择界面组件的正确路径
            component: () => import('@/views/research/projects/SelectionView.vue'), 
          },
          {
            path: '/research/projects',
            name: 'ProjectStats',
            meta: {
              title: '审计统计数据',
              requiresAuth: true,
              roles: ['RESEARCHER', 'ADMIN'],
            },
            component: () => import('@/views/research/projects/AuditStatsView.vue'),
            props: route => ({
              institutions: route.query.institutions as string,
              diseases: route.query.diseases as string,
              institutionNames: route.query.institutionNames as string,
              diseaseNames: route.query.diseaseNames as string
            })
          }
        ]
      },

      // ============= 医生路由 =============
      {
        path: '/doctor',
        name: 'Doctor',
        meta: {
          title: '医生工作台',
          requiresAuth: true,
          roles: ['DOCTOR', 'ADMIN'], // 支持所有医生角色
          icon: 'doctor1',
        },
        children: [
          {
            path: '/doctor/patients',
            name: 'PatientList',
            meta: {
              title: '患者列表',
              requiresAuth: true,
              roles: ['DOCTOR', 'ADMIN'], // 支持所有医生角色
            },
            component: () => import('@/views/doctor/patients/index.vue'),
          },
          {
            path: '/doctor/medical-records',
            name: 'MedicalRecords',
            meta: {
              title: '病历管理',
              requiresAuth: true,
              roles: ['DOCTOR', 'ADMIN'], // 支持所有医生角色
            },
            component: () => import('@/views/doctor/medical-records/index.vue'),
          },
          // 示例：只有家庭医生可以访问的路由
          {
            path: '/doctor/family-patients',
            name: 'FamilyPatients',
            meta: {
              title: '家庭患者管理',
              requiresAuth: true,
              roles: ['FAMILY_DOCTOR', 'ADMIN'], // 只有家庭医生可以访问
            },
            component: () => import('@/views/doctor/family-patients/index.vue'),
          },
          // 示例：只有急诊医生可以访问的路由
          {
            path: '/doctor/emergency',
            name: 'EmergencyManagement',
            meta: {
              title: '急诊管理',
              requiresAuth: true,
              roles: ['EMERGENCY_DOCTOR', 'ADMIN'], // 只有急诊医生可以访问
            },
            component: () => import('@/views/doctor/emergency/index.vue'),
          },
        ],
      },

      // ============= 患者路由 =============
      {
        path: '/patient',
        name: 'Patient',
        meta: {
          title: '患者中心',
          requiresAuth: true,
          roles: ['PATIENT', 'ADMIN'],
          icon: 'user',
        },
        children: [
          {
            path: '/patient/medical-history',
            name: 'MedicalHistory',
            meta: {
              title: '病历查看',
              requiresAuth: true,
              roles: ['PATIENT', 'ADMIN'],
            },
            component: () => import('@/views/patient/medical-history/index.vue'),
          },
        ],
      },

      // ============= 公共路由 =============
      {
        path: '/common',
        name: 'Common',
        meta: {
          title: '通用功能',
          requiresAuth: true,
          roles: ['ADMIN', 'RESEARCHER', 'PATIENT', 'DOCTOR'],
          icon: 'example',
        },
        children: [
          {
            path: '/common/notifications',
            name: 'Notifications',
            meta: {
              title: '消息通知',
              requiresAuth: true,
              roles: ['ADMIN', 'RESEARCHER', 'PATIENT', 'DOCTOR'],
            },
            component: () => import('@/views/common/notifications/index.vue'),
          },
        ],
      },
    ],
  },

  // ============= 错误页面 =============
  {
    path: '/403',
    name: 'Forbidden',
    meta: {
      title: '权限不足',
      requiresAuth: false,
    },
    component: () => import('@/views/error/403.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    meta: {
      title: '页面未找到',
    },
    component: () => import('@/views/error/404.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(baseURL),
  routes,
});

/**
 * 检查用户是否有访问指定路由的权限
 * @param route 路由信息
 * @returns 是否有权限
 */
function hasPermission(route: any): boolean {
  // 如果路由没有定义角色权限，则默认允许访问
  if (!route.meta?.roles) {
    return true;
  }

  // 获取用户的原始角色代码和通用角色
  const userRoleCode = getRoleCodeFromToken();
  const userGeneralRole = getGeneralRoleFromToken();

  // 检查用户角色是否在允许的角色列表中
  // 支持通用角色（如 DOCTOR）和具体角色代码（如 FAMILY_DOCTOR）
  return route.meta.roles.includes(userGeneralRole) || route.meta.roles.includes(userRoleCode);
}

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

    // 检查角色权限
    const userRole = getGeneralRoleFromToken();
    if (!userRole) {
      console.warn('用户角色获取失败，跳转到登录页');
      next('/login');
      return;
    }

    // 检查是否有访问权限
    if (!hasPermission(to)) {
      console.warn(`用户角色 ${userRole} 没有访问 ${to.path} 的权限`);
      next('/403');
      return;
    }

    // // 如果访问的是 /contain 主页，根据角色跳转到对应的默认页面
    // if (to.path === '/contain') {
    //   const defaultPath = getDefaultPathByRole(userRole);
    //   if (defaultPath !== '/contain') {
    //     next(defaultPath);
    //     return;
    //   }
    // }

  } else {
    if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn) {
      next('/dashboard');
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

// 导出路由配置供菜单组件使用
export { routes };
// src/store/modules/user/index.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  login as loginAPI,
  logout as logoutAPI,
  getUserProfile,
  verifyLoginCode as verifyLoginCodeAPI
} from '@/api/auth/auth';
import type { LoginResponse, UserProfile, Role, Group } from '@/api/auth/types';
import type { LoginMeta } from './types';

export const useUserStore = defineStore('user', () => {
  // ==================== 状态定义 ====================

  const token = ref<string>(localStorage.getItem('access_token') || '');
  const loginMeta = ref<LoginMeta | null>(null); // 替代原来的 userInfo
  const userProfile = ref<UserProfile | null>(null);
  const roles = ref<Role[]>([]);
  const groups = ref<Group[]>([]);

  // ==================== 计算属性 ====================

  const isLoggedIn = computed(() => !!token.value);

  // ==================== 初始化和清理方法 ====================

  /**
   * 初始化用户信息
   */
  const initUser = () => {
    if (!token.value) {
      token.value = localStorage.getItem('access_token') || '';
    }

    const cachedMeta = localStorage.getItem('loginMeta');
    if (cachedMeta) {
      try {
        loginMeta.value = JSON.parse(cachedMeta);
      } catch {
        loginMeta.value = null;
        localStorage.removeItem('loginMeta');
      }
    }

    // 不再从 localStorage 恢复 loginMeta，因为不缓存用户信息
    loginMeta.value = null;
    userProfile.value = null;
  };

  /**
   * 清除用户信息
   */
  const clearUser = () => {
    token.value = '';
    loginMeta.value = null;
    userProfile.value = null;
    roles.value = [];
    groups.value = [];
    localStorage.removeItem('access_token');
    localStorage.removeItem('loginMeta');
  };

  // ==================== 登录相关方法 ====================

  /**
   * 密码登录
   * @param account 账号（用户名/身份证号/手机号）
   * @param password 密码
   * @returns Promise<LoginResponse>
   */
  const login = async (account: string, password: string): Promise<LoginResponse> => {
    const response = await loginAPI(account, password);
    // console.log('response: ',response)
    token.value = response.access_token;
    localStorage.setItem('access_token', response.access_token);

    // 注意这里是只保存非敏感字段
    loginMeta.value = response.user;
    // console.log('loginMeta: ',loginMeta.value)
    // console.log('response.user: ',JSON.stringify(response.user))
    localStorage.setItem('loginMeta', JSON.stringify(response.user));

    return response;
  };

  /**
   * 验证码登录
   * @param phone 手机号
   * @param code 验证码
   * @returns Promise<LoginResponse>
   */
  const loginWithCode = async (phone: string, code: string): Promise<LoginResponse> => {
    const response = await verifyLoginCodeAPI(phone, code);
    token.value = response.access_token;
    localStorage.setItem('access_token', response.access_token);

    // 保存登录元数据
    loginMeta.value = response.user;
    localStorage.setItem('loginMeta', JSON.stringify(response.user));

    return response;
  };

  /**
   * 登出
   */
  const logout = async () => {
    try {
      await logoutAPI();
    } finally {
      clearUser();
    }
  };

  // ==================== 用户资料相关方法 ====================

  /**
   * 获取用户资料
   * @returns Promise<UserProfile>
   */
  const fetchUserProfile = async (): Promise<UserProfile> => {
    const profile = await getUserProfile();
    // console.log('profile: ', profile)
    userProfile.value = profile.user;
    return profile;
  };

  // ==================== 返回导出 ====================

  return {
    // 状态
    token,
    loginMeta,
    userProfile,
    roles,
    groups,

    // 计算属性
    isLoggedIn,

    // 方法
    initUser,
    clearUser,
    login,
    loginWithCode, // 新增：验证码登录方法
    logout,
    fetchUserProfile,
  };
});
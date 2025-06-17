import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as loginAPI, getUserProfile, logout as logoutAPI } from '@/api/auth/auth';
import type { LoginResponse, UserProfile } from '@/api/auth/types';
import type { UserInfo } from './types';

export const useUserStore = defineStore('user', () => {
  /* -------------------------------------------------------------------------- */
  /*                                State & refs                                */
  /* -------------------------------------------------------------------------- */
  // 单点真源：token / userInfo。其余全部通过计算/方法派生
  const token = ref<string>(localStorage.getItem('access_token') || '');
  const userInfo = ref<UserInfo | null>(null);

  /* -------------------------------------------------------------------------- */
  /*                              Computed helpers                               */
  /* -------------------------------------------------------------------------- */
  // 只要持有 token 即认为已登录；业务上再校验 userInfo
  const isLoggedIn = computed(() => !!token.value);

  /* -------------------------------------------------------------------------- */
  /*                                  Actions                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * 根据 localStorage 恢复登录态（在路由守卫中调用）
   */
  const initUser = () => {
    if (!token.value) {
      token.value = localStorage.getItem('access_token') || '';
    }

    if (!userInfo.value) {
      const cached = localStorage.getItem('userInfo');
      if (cached) {
        try {
          userInfo.value = JSON.parse(cached) as UserInfo;
        } catch (_) {
          // 本地数据损坏则清理
          clearUser();
        }
      }
    }
  };

  /**
   * 清空本地登录状态（在路由守卫 / 登出流程中调用）
   */
  const clearUser = () => {
    token.value = '';
    userInfo.value = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('userInfo');
  };

  /**
   * 登录：成功后写入 token & userInfo，并持久化
   */
  const login = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await loginAPI(username, password);

    // token
    token.value = response.access_token;
    localStorage.setItem('access_token', response.access_token);

    // profile
    userInfo.value = response.user;
    localStorage.setItem('userInfo', JSON.stringify(response.user));

    return response;
  };

  /**
   * 拉取远端用户资料；用于 token 存在但 userInfo 缺失的场景
   */
  const fetchUserProfile = async () => {
    if (!token.value) return;

    const profile: UserProfile = await getUserProfile();
    userInfo.value = profile;
    localStorage.setItem('userInfo', JSON.stringify(profile));
  };

  /**
   * 退出登录：调用远端接口后本地清理
   */
  const logout = async () => {
    try {
      await logoutAPI();
    } finally {
      clearUser();
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Exports                                   */
  /* -------------------------------------------------------------------------- */
  return {
    // state
    token,
    userInfo,

    // getters
    isLoggedIn,

    // actions
    initUser,
    clearUser,
    login,
    fetchUserProfile,
    logout,
  };
});

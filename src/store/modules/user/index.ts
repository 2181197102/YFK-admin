// src/store/modules/user/index.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as loginAPI, logout as logoutAPI, getUserProfile, getRoleList, getGroupList } from '@/api/auth/auth';
import type { LoginResponse, UserProfile, Role, Group, RoleListResponse, GroupListResponse } from '@/api/auth/types';
import type { LoginMeta } from './types';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('access_token') || '');
  const loginMeta = ref<LoginMeta | null>(null); // 替代原来的 userInfo
  const userProfile = ref<UserProfile | null>(null);
  const roles = ref<Role[]>([]);
  const groups = ref<Group[]>([]);

  const isLoggedIn = computed(() => !!token.value);

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

  const clearUser = () => {
    token.value = '';
    loginMeta.value = null;
    userProfile.value = null;
    roles.value = [];
    groups.value = [];
    localStorage.removeItem('access_token');
    localStorage.removeItem('loginMeta');
  };

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await loginAPI(username, password);
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

  const logout = async () => {
    try {
      await logoutAPI();
    } finally {
      clearUser();
    }
  };

  // 获取用户资料
  const fetchUserProfile = async (): Promise<UserProfile> => {
    const profile = await getUserProfile();
    // console.log('profile: ', profile)
    userProfile.value = profile.user;
    return profile;
  };


  return {
    token,
    loginMeta,
    userProfile,
    roles,
    groups,
    isLoggedIn,
    initUser,
    clearUser,
    login,
    logout,
    fetchUserProfile,
  };
});
// src/api/auth/auth.ts
import { get, post } from '@/utils/http/axios';
import type { LoginResponse, RegisterRequest, UserProfile, ChangePasswordRequest, RoleListResponse, GroupListResponse , VerifyAuthPasswordResponse , VerifyAuthPasswordRequest} from './types';

// 登录
export const login = (username: string, password: string): Promise<LoginResponse> => {

    // 验证参数
    if (!username || !password) {
        return Promise.reject(new Error('用户名和密码不能为空'));
    }

    const loginData = {
        username: username.trim(),
        password: password.trim(),
    };


    return post<LoginResponse>({
        url: '/auth/login',
        data: loginData,
    }).catch(error => {
        console.error('登录API错误:', error);
        throw error;
    });
};

// 注册
export const register = (data: RegisterRequest): Promise<any> => {
    return post({
        url: '/auth/register',
        data,
    });
};

// 获取用户资料
export const getUserProfile = (): Promise<UserProfile> => {
    return get({
        url: '/auth/profile',
    });
};

// 登出
export const logout = (): Promise<any> => {
    return post({
        url: '/auth/logout',
    });
};

// 修改密码
export const changePassword = (data: ChangePasswordRequest): Promise<any> => {
    return post({
        url: '/auth/change-password',
        data,
    });
};

// 刷新token
export const refreshToken = (): Promise<LoginResponse> => {
    return post({
        url: '/auth/refresh',
    });
};

// 获取角色列表
export const getRoleList = (): Promise<RoleListResponse> => {
    return get({
        url: '/user_management/roles',
    });
};

// 获取组列表
export const getGroupList = (params?: { page?: number; per_page?: number; search?: string }): Promise<GroupListResponse> => {
    return get({
        url: '/user_management/groups',
        params,
    });
};


/**
 * 校验授权密码
 * @param password 授权密码
 * @returns Promise<VerifyAuthPasswordResponse>
 */
export const verifyAuthPassword = (password: string): Promise<VerifyAuthPasswordResponse> => {
    const data: VerifyAuthPasswordRequest = { password };
    return post({
        url: '/system_config/verify-auth-password',
        data
    });
};
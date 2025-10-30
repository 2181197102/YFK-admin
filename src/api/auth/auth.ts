// src/api/auth/auth.ts
import { get, post } from '@/utils/http/axios';
import type {
    LoginResponse,
    RegisterRequest,
    UserProfile,
    ChangePasswordRequest,
    RoleListResponse,
    GroupListResponse,
    VerifyAuthPasswordResponse,
    VerifyAuthPasswordRequest,
    GenerateLoginCodeRequest,
    GenerateLoginCodeResponse,
    VerifyLoginCodeRequest,
    GenerateAuthCodeRequest,
    VerifyAuthCodeRequest
} from './types';

// ==================== 原有接口 ====================

// 登录
export const login = (account: string, password: string): Promise<LoginResponse> => {
    // 验证参数
    if (!account || !password) {
        return Promise.reject(new Error('用户名和密码不能为空'));
    }

    const loginData = {
        account: account.trim(),
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

// ==================== 验证码相关接口 ====================

/**
 * 生成登录验证码（无需token）
 * @param account 身份证号或手机号
 * @returns Promise<GenerateLoginCodeResponse>
 */
export const generateLoginCode = (account: string): Promise<GenerateLoginCodeResponse> => {
    if (!account) {
        return Promise.reject(new Error('账号不能为空'));
    }

    const data: GenerateLoginCodeRequest = {
        account: account.trim()
    };

    return post<GenerateLoginCodeResponse>({
        url: '/auth/sms/generate-login-code',
        data,
    }).catch(error => {
        console.error('生成登录验证码错误:', error);
        throw error;
    });
};

/**
 * 验证登录验证码并登录（无需token）
 * @param phone 手机号
 * @param code 验证码
 * @returns Promise<LoginResponse>
 */
export const verifyLoginCode = (phone: string, code: string): Promise<LoginResponse> => {
    if (!phone || !code) {
        return Promise.reject(new Error('手机号和验证码不能为空'));
    }

    const data: VerifyLoginCodeRequest = {
        phone: phone.trim(),
        code: code.trim()
    };

    return post<LoginResponse>({
        url: '/auth/sms/verify-login-code',
        data,
    }).catch(error => {
        console.error('验证登录验证码错误:', error);
        throw error;
    });
};

/**
 * 生成身份验证验证码（需要token）
 * @param phone 手机号
 * @returns Promise<any>
 */
export const generateAuthCode = (phone: string): Promise<any> => {
    if (!phone) {
        return Promise.reject(new Error('手机号不能为空'));
    }

    const data: GenerateAuthCodeRequest = {
        phone: phone.trim()
    };

    return post({
        url: '/auth/sms/generate-auth-code',
        data,
    }).catch(error => {
        console.error('生成身份验证码错误:', error);
        throw error;
    });
};

/**
 * 验证身份验证验证码（需要token）
 * @param phone 手机号
 * @param code 验证码
 * @returns Promise<any>
 */
export const verifyAuthCode = (phone: string, code: string): Promise<any> => {
    if (!phone || !code) {
        return Promise.reject(new Error('手机号和验证码不能为空'));
    }

    const data: VerifyAuthCodeRequest = {
        phone: phone.trim(),
        code: code.trim()
    };

    return post({
        url: '/auth/sms/verify-auth-code',
        data,
    }).catch(error => {
        console.error('验证身份验证码错误:', error);
        throw error;
    });
};
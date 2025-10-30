// src/api/auth/types.ts

// ==================== 原有类型定义 ====================

export interface LoginResponse {
    access_token: string;
    user: {
        username: string;
        current_login_ip: string;
        last_login_ip: string;
    };
}

export interface RegisterRequest {
    username: string;
    password: string;
    id_card: string;
    phone: string;
    name: string;
    age: number;
    gender: string;
    role: string;
    group: string;
}

export interface UserProfile {
    id: number;
    username: string;
    name: string;
    id_card: string;
    phone: string;
    age: number;
    gender: string;
    enable: boolean;
    role_code: string;
    role_name: string;
    group_name: string | null;
    created_time: string;
}

export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
}

// 角色相关类型
export interface Role {
    id: number;
    role_code: string;
    role_name: string;
    description: string;
    created_time: string;
    updated_time: string;
}

export interface RoleListResponse {
    code: number;
    message: string;
    result: {
        roles: Role[];
    };
    status: string;
}

// 组相关类型
export interface Group {
    id: number;
    group_name: string;
    enable: boolean;
    created_time: string;
    updated_time: string;
    user_count: number;
}

export interface GroupListResponse {
    code: number;
    message: string;
    result: {
        groups: Group[];
    };
    status: string;
}

// 密码校验相关类型
export interface VerifyAuthPasswordRequest {
    password: string;
}

export interface VerifyAuthPasswordResponse {
    code: number;
    message: string;
    result: null;
    status: string;
}

// ==================== 验证码相关类型定义 ====================

/**
 * 生成登录验证码 - 请求参数
 */
export interface GenerateLoginCodeRequest {
    account: string; // 身份证号或手机号
}

/**
 * 生成登录验证码 - 响应数据
 */
export interface GenerateLoginCodeResponse {
    code: number;
    message: string;
    result: {
        phone?: string; // 如果输入的是身份证号，返回对应的手机号
    };
    status: string;
}

/**
 * 验证登录验证码 - 请求参数
 */
export interface VerifyLoginCodeRequest {
    phone: string;
    code: string;
}

/**
 * 生成身份验证验证码 - 请求参数
 */
export interface GenerateAuthCodeRequest {
    phone: string;
}

/**
 * 验证身份验证验证码 - 请求参数
 */
export interface VerifyAuthCodeRequest {
    phone: string;
    code: string;
}
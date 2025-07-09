// src/api/auth/types.ts
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


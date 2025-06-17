// src/api/auth/types.ts
export interface LoginResponse {
    access_token: string;
    user: {
        id: number;
        username: string;
        name: string;
        age: number;
        gender: string;
        role_code: string;
        role_name: string;
        group_name: string | null;
    };
}

export interface RegisterRequest {
    username: string;
    password: string;
    name: string;
    age: number;
    gender: string;
    role: string;
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

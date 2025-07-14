// 单个角色信息
export interface Role {
    id: number;
    role_code: string;
    role_name: string;
}

// 单个分组信息
export interface Group {
    id: number;
    group_name: string;
    enable: boolean;
    type: string;
}

// 用户信息
export interface User {
    id: number;
    username: string;
    name: string;
    age: number;
    gender: 'M' | 'F';
    enable: boolean;
    created_time: string;
    updated_time: string;
    roles: Role[];
    groups: Group[];
}

// 分页信息
export interface Pagination {
    page: number;
    per_page: number;
    pages: number;
    total: number;
    has_next: boolean;
    has_prev: boolean;
}

// 用户列表响应结构
export interface UserListResponse {
    code: number;
    message: string;
    status: string;
    result: {
        pagination: Pagination;
        users: User[];
    };
}

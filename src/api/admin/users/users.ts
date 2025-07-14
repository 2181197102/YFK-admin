// src/api/admin/users/users.ts
import { get } from '@/utils/http/axios';
import type { UserListResponse } from './types';

/**
 * 获取用户列表（支持分页查询）
 * @param params 查询参数：page、per_page、search 等
 */
export const getUserList = (params?: {
    page?: number;
    per_page?: number;
    search?: string;
}): Promise<UserListResponse> => {
    return get({
        url: '/user_management/users',
        params,
    });
};



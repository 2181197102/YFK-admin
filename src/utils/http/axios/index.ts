// utils/http/axios/index.ts
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { showMessage } from './status';
import { IResponse } from './type';
import { getToken } from '@/utils/auth';

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASEURL,
  timeout: 10000,
});

// axios实例拦截请求
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    // console.log("获取到的token为" , token)
    if (token) {
        config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// axios实例拦截响应
service.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.status === 200) {
            return response;
        }
        showMessage(response.status);
        return response;
    },
    (error: AxiosError) => {
        const { response } = error;
        if (response) {
            const { status,  data } = response as AxiosResponse<IResponse>;

            /** 🔹先看后端有没有 message，有就直接弹 */
            if (data?.message) {
                ElMessage.error(data.message);
            } else {
                showMessage(status);      // 没 message 再走兜底文案
            }

            // 处理 401 未授权（token 过期或无效）
            if (status === 401) {
                // 清除登录状态
                localStorage.removeItem('access_token');

                // 可选：还可调用 pinia 的 userStore.clearUser()，例如：
                // import { useUserStore } from '@/store/modules/user';
                // useUserStore().clearUser();

                // 跳转到登录页（建议保留当前路径，便于回跳）
                window.location.href = `/login?redirect=${encodeURIComponent(location.hash.slice(1))}`;
            }

            return Promise.reject(response.data || error);
        } else {
            showMessage('网络连接异常,请稍后再试!');
            return Promise.reject(error);
        }
    }
);


// const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
//   const conf = config;
//   return new Promise((resolve) => {
//     service.request<any, AxiosResponse<IResponse>>(conf).then((res: AxiosResponse<IResponse>) => {
//       const {
//         data: { result },
//       } = res;
//       resolve(result as T);
//     });
//   });
// };

const request = async <T = any>(config: AxiosRequestConfig): Promise<T> => {
    const res = await service.request<any, AxiosResponse<IResponse>>(config);
    return res.data.result as T;
};

export function get<T = any>(config: AxiosRequestConfig): Promise<T> {
  return request({ ...config, method: 'GET' });
}

export function post<T = any>(config: AxiosRequestConfig): Promise<T> {
  return request({ ...config, method: 'POST' });
}

export function put<T = any>(config: AxiosRequestConfig): Promise<T> {
  return request({ ...config, method: 'put' });
}

export function del<T = any>(config: AxiosRequestConfig): Promise<T> {
  return request({ ...config, method: 'delete' });
}

export default request;

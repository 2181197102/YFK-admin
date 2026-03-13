// src/api/patient.ts
import axios from 'axios';
import { GetMyMedicalRecordResponse } from './types';
import { getToken } from '@/utils/auth'; // 假设存在获取JWT令牌的工具函数

const token = getToken();

// 创建axios实例（可复用）
const patientApi = axios.create({
  baseURL: 'http://localhost:7878', // 从环境变量获取基础URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // 携带认证令牌
  }
});

// 请求拦截器：携带JWT令牌（适配@jwt_required()）
patientApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 获取当前登录用户的病历数据
 * @returns 病历数据Promise
 */
export const getMyMedicalRecords = async (): Promise<GetMyMedicalRecordResponse> => {
  try {
    const response = await patientApi.get<GetMyMedicalRecordResponse>('/api/medical_record/get_my_data');
    // 统一处理成功状态（确保code=200）
    if (response.data.code !== 200) {
      throw new Error(response.data.msg || '获取病历数据失败');
    }
    return response.data;
  } catch (error) {
    // 错误统一处理（可根据项目需求调整，如提示框）
    const errMsg = error instanceof Error ? error.message : '网络异常，获取病历失败';
    console.error('病历请求错误：', errMsg);
    throw new Error(errMsg); // 抛出错误让组件处理
  }
};

export default patientApi;
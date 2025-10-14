import axios from 'axios';
import { PatientsResponse, TrustValueResponse, PatientDetailResponse } from './types';
import { getToken } from '@/utils/auth';
const token = getToken()

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:7878',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // 携带认证令牌
  }
});

// // 请求拦截器添加token
// api.interceptors.request.use(
//   (config) => {
//     // 假设从localStorage获取token
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// 获取当前机构的患者列表
export const getMyPatients = async (): Promise<PatientsResponse> => {
  const response = await api.get<PatientsResponse>('/api/medical_record/get_mypatients');
  return response.data;
};

// 获取信任值计算结果
export const getTrustValue = async (): Promise<TrustValueResponse> => {
  const response = await api.get<TrustValueResponse>('/api/audit/my-stats');
  return response.data;
};

// 获取患者完整信息
export const getPatientDetail = async (patientId: string): Promise<PatientDetailResponse> => {
  const response = await api.get<PatientDetailResponse>(`/api/medical_record/get_patient/${patientId}`);
  return response.data;
};

export default api;

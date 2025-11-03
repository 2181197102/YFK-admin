// src/api/doctor.ts
import axios from 'axios';
import { getToken } from '@/utils/auth';
import { PatientQueryParams, PatientApiResponse, PatientDetailResponse } from './types';

const token = getToken();

// 配置axios基础路径（可根据环境变量调整）
const request = axios.create({
  baseURL: 'http://localhost:7878', // 后端基础URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // 携带认证令牌
  }
});

/**
 * 获取患者病历数据（带分页+搜索）
 * @param params - 分页和搜索参数
 * @returns 病历响应数据
 */
export const getPatientMedicalRecords = async (
  params: PatientQueryParams
): Promise<PatientApiResponse> => {
  try {
    const response = await request.get<PatientApiResponse>(
      '/api/medical_record/get_patient',
      { params } // 拼接URL参数（pageNum、pageSize、patientName）
    );
    return response.data;
  } catch (error) {
    // 统一错误处理（可根据项目需求扩展）
    if (axios.isAxiosError(error)) {
      throw new Error(`请求失败：${error.response?.data?.msg || '网络异常'}`);
    }
    throw new Error(`请求异常：${(error as Error).message}`);
  }
};

/**
 * 获取患者病历详情（根据病历号查询该患者在当前机构的病历）
 * @param medicalRecordNum - 病历号
 * @returns 病历详情响应数据
 */
export const getPatientDetail = async (
  medicalRecordNum: string
): Promise<PatientDetailResponse> => {
  try {
    const response = await request.get<PatientDetailResponse>(
      '/api/medical_record/get_patient_detail',
      { 
        params: { 
          medical_record_num: medicalRecordNum 
        }
      }
    );
    return response.data;
  } catch (error) {
    // 统一错误处理
    if (axios.isAxiosError(error)) {
      throw new Error(`获取详情失败：${error.response?.data?.msg || '网络异常'}`);
    }
    throw new Error(`请求异常：${(error as Error).message}`);
  }
};

/**
 * 获取患者所有病历（根据身份证号查询该患者在所有机构的病历）
 * @param patientIdCard - 患者身份证号
 * @returns 患者全病历响应数据
 */
export const getPatientAllRecords = async (
  patientIdCard: string
): Promise<import('./types').PatientAllRecordsResponse> => {
  try {
    const response = await request.get<import('./types').PatientAllRecordsResponse>(
      '/api/medical_record/get_patient_records_by_idcard',
      { 
        params: { 
          id_card: patientIdCard // 后端期望的参数名是 id_card
        }
      }
    );
    return response.data;
  } catch (error) {
    // 统一错误处理
    if (axios.isAxiosError(error)) {
      throw new Error(`获取全病历失败：${error.response?.data?.msg || '网络异常'}`);
    }
    throw new Error(`请求异常：${(error as Error).message}`);
  }
};
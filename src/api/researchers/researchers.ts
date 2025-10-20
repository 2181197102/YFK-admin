import axios,{AxiosResponse} from 'axios';
import { 
  QueryParams, 
  TrustValueResponse, 
  DiseaseDataCodeResponse,
  MedicalDataResponse
} from './types';
import { getToken } from '@/utils/auth';

// // 获取认证令牌
const token = getToken();

// 创建Axios实例（统一配置超时、请求头、认证信息）
const api = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // 携带认证令牌
  }
});

// // 响应拦截器
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // 统一错误处理
//     let errorMessage = '请求失败，请稍后重试';
//     if (error.response) {
//       switch (error.response.status) {
//         case 400:
//           errorMessage = '请求参数错误';
//           break;
//         case 401:
//           errorMessage = '未授权，请重新登录';
//           break;
//         case 404:
//           errorMessage = '请求的资源不存在';
//           break;
//         case 500:
//           errorMessage = '服务器内部错误';
//           break;
//       }
//     } else if (error.request) {
//       errorMessage = '网络错误，无法连接服务器';
//     }
    
//     return Promise.reject(new Error(errorMessage));
//   }
// );

export const getDiseaseDataCodes = async (): Promise<DiseaseDataCodeResponse> => {
  const response = await api.get<DiseaseDataCodeResponse>(
    'http://127.0.0.1:7878/api/medical_record/disease-data-codes'
  );
  return response.data;
};

export const checkTrustValue = async (
  params: Partial<QueryParams>
): Promise<TrustValueResponse> => {
  try {
    const response: AxiosResponse<TrustValueResponse> = await api.post(
      'http://127.0.0.1:7878/api/medical_record/get_sensitive_data',
      {
        disease_code: params.disease_codes,
        data_code: params.data_code || []
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('检查敏感数据信任值失败:', error);
    throw new Error(error.response?.data?.message || '检查敏感数据信任值时发生错误');
  }
};

export const getMedicalRecords = async (
  params: QueryParams
): Promise<MedicalDataResponse> => {
  // 转换机构ID为机构标识（1 -> ins1, 2 -> ins2, 3 -> ins3）
  const institutions = params.ins_codes.map(id => `ins${id}`);
  
  const response: AxiosResponse<MedicalDataResponse> = await api.post(
    'http://127.0.0.1:7878/api/medical_record/get_record_data',
    {
      data_code: params.data_code,
      nums: params.nums,
      institutions: institutions,
      Trustvalue: params.Trustvalue,
      sensitive: params.sensitive,

    }
  );
  
  return response.data;
};

export const add_ob_num_download = async (): Promise<void> => {
  try {
    // 发送空体POST请求到add_ob_num_download接口，无需传入任何参数
    await api.post('http://127.0.0.1:7878/api/audit/add_ob_num_download', {});
  } catch (error: any) {
    // 捕获错误，仅抛出错误信息（无需处理返回参数）
    throw new Error(
      error.response?.data?.message || '发送下载记录指令失败（add_ob_num_download）'
    );
  }
}

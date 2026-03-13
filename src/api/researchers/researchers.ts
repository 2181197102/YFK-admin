import axios,{AxiosResponse} from 'axios';
import { 
  QueryParams, 
  TrustValueResponse, 
  DiseaseDataCodeResponse,
  MedicalDataResponse,
  FileUploadResponse,
  DataMaskingRequest,
  DataMaskingResponse,
  DataViewResponse
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

/**
 * 数据脱敏相关API方法
 */

// 上传文件并获取表头信息
export const uploadDataFile = async (file: File): Promise<FileUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse<FileUploadResponse> = await api.post(
      'http://127.0.0.1:5000/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('文件上传失败:', error);
    throw new Error(error.response?.data?.message || '文件上传失败');
  }
};

// 执行数据脱敏处理
export const processDataMasking = async (
  params: DataMaskingRequest
): Promise<DataMaskingResponse> => {
  try {
    // 准备请求数据，包含所有必要字段
    const requestData = {
      file_path: '/tmp/mock_data.csv', // 模拟文件路径（后端会生成实际文件）
      selected_headers: params.selected_headers,  // 数据字段
      record_count: params.record_count,           // 记录数量
      scenario: params.scenario,                    // 应用场景
      method: params.method,                       // 脱敏方法
      data_code_details: params.data_code_details, // 数据项详细信息
      results: params.results,                      // 医疗数据结果（直接传递给后端保存为CSV）
      task_name: `脱敏任务_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`
    };
    
    console.log('发送到后端的完整请求数据:', requestData);
    
    const response: AxiosResponse<DataMaskingResponse> = await api.post(
      'http://127.0.0.1:7878/api/datamasking/start',
      requestData
    );
    return response.data;
  } catch (error: any) {
    console.error('数据脱敏处理失败:', error);
    throw new Error(error.response?.data?.message || '数据脱敏处理失败');
  }
};

// 查看数据（原始或脱敏）
export const viewData = async (
  dataType: '原始' | '脱敏'
): Promise<DataViewResponse> => {
  try {
    // 兼容新接口：/api/datamasking/view/original 与 /api/datamasking/view/masked
    const url =
      dataType === '原始'
        ? '/api/datamasking/view/original'
        : '/api/datamasking/view/masked';
    const response = await api.get(url);
    return response.data as any;
  } catch (error: any) {
    console.error('查看数据失败:', error);
    throw new Error(error.response?.data?.message || '查看数据失败');
  }
};

// 新增：分别查看原始/脱敏文件（直接命名函数，便于明确调用）
export const viewOriginalFile = async (): Promise<any> => {
  try {
    const response = await api.get('/api/datamasking/view/original');
    return response.data;
  } catch (error: any) {
    console.error('查看原始数据失败:', error);
    throw new Error(error.response?.data?.message || '查看原始数据失败');
  }
};

export const viewMaskedFile = async (): Promise<any> => {
  try {
    const response = await api.get('/api/datamasking/view/masked');
    return response.data;
  } catch (error: any) {
    console.error('查看脱敏数据失败:', error);
    throw new Error(error.response?.data?.message || '查看脱敏数据失败');
  }
};

// 获取脱敏任务详情
export const getMaskingTaskDetail = async (taskId: number): Promise<any> => {
  try {
    const response = await api.get(`http://127.0.0.1:7878/api/datamasking/tasks/${taskId}`);
    return response.data;
  } catch (error: any) {
    console.error('获取任务详情失败:', error);
    throw new Error(error.response?.data?.message || '获取任务详情失败');
  }
};

// 下载脱敏结果文件
export const downloadMaskedFile = async (taskId: number): Promise<Blob> => {
  try {
    const response = await api.get(
      `http://127.0.0.1:7878/api/datamasking/tasks/${taskId}/download`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('下载文件失败:', error);
    throw new Error(error.response?.data?.message || '下载文件失败');
  }
};

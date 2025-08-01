import { ApiResponse, AuditStats, MedicalRecordResponse } from './types';


const getHeaders = (): HeadersInit => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1Mzg1MTU4MSwianRpIjoiNjdmMWYxZWUtMThkNy00MDFlLWFlY2ItNTY4ZjE4NjU2MjllIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjEiLCJuYmYiOjE3NTM4NTE1ODEsImV4cCI6MTc1MzkzNzk4MSwidXNlcl9pZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGVfY29kZSI6IkFETUlOIiwiZ3JvdXBfbmFtZSI6Ilx1N2JhMVx1NzQwNlx1NTQ1OFx1NmQ0Ylx1OGJkNVx1NTMzYlx1OTY2MiJ9.Xclz6x5252yVapJmvpbmbEJtNrOLrXJC1u4bwXjZjCw';
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * 获取审计统计数据
 * @param diseaseCodes 选中的病种代码数组
 * @returns 统计数据响应
 */
export const getAuditStats = async (
  diseaseCodes: string[]
): Promise<ApiResponse<AuditStats>> => {
  try {
    // 获取令牌
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1NDAxMjcyOCwianRpIjoiZDg3OWQxMzQtODE4My00OGFmLWFiMDItNjFhNzRhNjY0OWVmIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjEiLCJuYmYiOjE3NTQwMTI3MjgsImV4cCI6MTc1NDA5OTEyOCwidXNlcl9pZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGVfY29kZSI6IkFETUlOIiwiZ3JvdXBfbmFtZSI6Ilx1N2JhMVx1NzQwNlx1NTQ1OFx1NmQ0Ylx1OGJkNVx1NTMzYlx1OTY2MiJ9.hw74l9Qa4FyAJuIyvgvlc46ddh5K76sCjyk_hk8EPPg';
    if (!token) {
      return {
        status: 401,
        error: '未授权访问，请先登录'
      };
    }

    // 发送请求
    const response = await fetch('http://localhost:7878/api/audit/my-stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // 携带认证令牌
      }
    });

    // 解析响应
    let responseData;
    try {
      responseData = await response.json();
    } catch (error) {
      responseData = {};
    }

    // 处理错误状态
    if (!response.ok) {
      return {
        status: response.status,
        error: responseData.error || `请求失败 (${response.status})`
      };
    }

    // 返回成功数据
    return {
      status: response.status,
      data: responseData as AuditStats
    };
  } catch (error) {
    console.error('获取审计数据失败:', error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : '网络请求失败'
    };
  }
};

/**
 * 获取病历数据
 * @param diseaseCodes 选中的病种代码数组
 * @returns 病历数据响应
 */
export const getMedicalRecords = async (
  diseaseCodes: string[]
): Promise<ApiResponse<MedicalRecordResponse>> => {
  try {
    // 发送请求
    const response = await fetch('http://127.0.0.1:7878/api/medical_record/get_record_by_disease', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ disease_codes: diseaseCodes }),
      signal: AbortSignal.timeout(10000)
    });

    // 解析响应
    let responseData;
    try {
      responseData = await response.json();
    } catch (error) {
      responseData = {};
    }

    // 处理错误状态
    if (!response.ok) {
      return {
        status: response.status,
        error: responseData.error || `请求失败 (${response.status})`
      };
    }

    // 返回成功数据
    return {
      status: response.status,
      data: responseData as MedicalRecordResponse
    };
  } catch (error) {
    console.error('获取病历数据失败:', error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : '网络请求失败'
    };
  }
};

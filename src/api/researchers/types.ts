/**
 * 机构类型定义
 */
export interface Institution {
  id: number;
  name: string;
}

/**
 * 病种类型定义
 */
export interface Disease {
  code: string;
  name: string;
}

/**
 * 查询参数类型定义
 */
export interface QueryParams {
  ins_codes: number[];         // 机构ID数组
  disease_codes: string[];     // 病种代码数组
  data_code?: string[];        // 数据项代码数组（可选）
  nums?: number;               // 数据量（可选）
  institutions?: string[];     // 机构标识数组（可选，如ins1, ins2）
}

/**
 * 病种数据项响应类型
 */
export interface DiseaseDataCodeResponse {
  data: Record<string, string[]>;  // 病种代码到数据项数组的映射
  message: string;
  status: 'success' | 'error';
}

/**
 * 信任值响应类型
 */
export interface TrustValueResponse {
  Trustvalue: number;
  access_location: {
    num_ad: number;
    num_nd: number;
  };
  access_period: {
    num_ni: number;
    num_ui: number;
  };
  access_success: {
    num_af: number;
    num_as: number;
  };
  data_sensitivity: {
    num1: number;
    num2: number;
    num3: number;
    num4: number;
  };
  operation_behavior: {
    num_add: number;
    num_copy: number;
    num_delete: number;
    num_download: number;
    num_revise: number;
    num_view: number;
  };
  sensitive: number;
  user_id: string;
}

/**
 * 医疗数据响应类型
 */
export interface MedicalDataResponse {
  data_codes: string[];
  institutions: string[];
  message: string;
  requested_nums: number;
  results: Array<{
    [key: string]: any;        // 动态字段，包含选择的数据项
    medical_record_num: string;
    institution: string;
  }>;
  status: 'success' | 'error';
  total_count: number;
}

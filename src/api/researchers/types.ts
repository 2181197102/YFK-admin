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
  data_type?: string[];        // data_type数组（可选）
  security_category?: string[];// 安全类别数组（可选）
  security_level?: string[];   // security_level数组（可选）
  nums?: number;               // 数据量（可选）
  institutions?: string[];     // 机构标识数组（可选，如ins1, ins2）
  Trustvalue?: number;         // 信任值
  sensitive?: number;          // 敏感度阈值
}

// 1. 先定义单个数据项的类型（包含data_code和remark核心字段，其他字段按需补充）
export interface DiseaseDataItem {
  /** 数据编码（如 family_history、smoking_history） */
  data_code: string;
  /** 数据项备注（如 家族史、吸烟史） */
  remark: string;
  /** 其他可选字段（接口返回的额外属性，按需添加，避免类型报错） */
  id?: number;               // 数据ID（如 38、1 等）
  disease_code?: string;     // 所属病种编码（如 E10、I10 等，冗余字段可选）
  data_type?: number;        // 数据类型（如 0、1）
  security_category?: string;// 安全类别（如 NON_SENSITIVE、SENSITIVE）
  security_level?: number;   // 安全级别（如 1、2）
  sensitive?: string;        // 敏感度（如 "0.3"、"1"）
  similar?: string;          // 相似度（如 "0.4"、"0.2"）
  created_time?: string;     // 创建时间（若接口返回）
  updated_time?: string;     // 更新时间（若接口返回）
}

// 2. 修改后的 DiseaseDataCodeResponse 类型
export interface DiseaseDataCodeResponse {
  /** 
   * 病种-数据项映射：
   * key = 病种编码（如 E10、I10、J44）
   * value = 该病种下的所有数据项数组（每个项为 DiseaseDataItem 类型）
   */
  data: Record<string, DiseaseDataItem[]>;
  /** 接口返回消息（如 成功提示、错误描述） */
  message: string;
  /** 接口状态（成功/失败） */
  status: 'success' | 'error';
}
/**
 * 信任值响应类型
 */
export interface TrustValueResponse {
  Trustvalue: number;
  access_location: {
    num_ad: number;  // 异常位置访问次数
    num_nd: number;  // 正常位置访问次数
  };
  access_period: {
    num_ni: number;  // 正常时段访问次数
    num_ui: number;  // 异常时段访问次数
  };
  access_success: {
    num_af: number;  // 访问失败次数
    num_as: number;  // 访问成功次数
  };
  data_sensitivity: {
    num1: number;    // 敏感度级别1数据量
    num2: number;    // 敏感度级别2数据量
    num3?: number;   // 敏感度级别3数据量（可选）
    num4?: number;   // 敏感度级别4数据量（可选）
  };
  operation_behavior: {
    num_add: number;    // 添加操作次数
    num_copy: number;   // 复制操作次数
    num_delete: number; // 删除操作次数
    num_download: number;// 下载操作次数
    num_revise: number; // 修改操作次数
    num_view: number;   // 查看操作次数
  };
  sensitive: number;    // 敏感度阈值
  user_id: string;      // 用户ID
  client_ip?: string;   // 客户端IP（可选）
  is_whitelist_ip?: boolean; // 是否为白名单IP（可选）
  is_working_time?: boolean; // 是否为工作时间（可选）
}

// 定义单个data_code的详细信息结构（对应后端Disease_data表的字段）
export interface DataCodeDetail {
  id: number;                  // 主键ID
  disease_code: string;        // 病种编码
  data_code: string;           // 数据项编码（与请求的data_codes对应）
  similar: string;             // 相似度
  sensitive: number;           // 敏感度值
  data_type: number;           // 数据类型
  security_level: string;      // 安全级别
  security_category: string;   // 安全类别
  remark: string;              // 备注信息（如"吸烟史"）
}

// 扩展后的MedicalDataResponse接口，添加data_code_details字段
export interface MedicalDataResponse {
  data_codes: string[];          // 数据项代码数组
  data_type: string[];           // data_type数组（可选）
  security_category: string[];   // 安全类别数组（可选）
  security_level: string[];      // security_level数组（可选）
  institutions: string[];        // 机构标识数组
  message: string;               // 响应消息
  requested_nums: number;        // 请求的数据量
  results: Array<{
    [key: string]: any;          // 动态字段，包含选择的数据项
    medical_record_num: string;  // 病历编号
    institution: string;         // 机构标识
  }>;
  status: 'success' | 'error';   // 响应状态
  total_count: number;           // 实际返回的数据总量
  Trustvalue?: number;           // 信任值（可选）
  sensitive?: number;            // 敏感度阈值（可选）
  client_ip?: string;            // 客户端IP（可选）
  is_whitelist_ip?: boolean;     // 是否为白名单IP（可选）
  is_working_time?: boolean;     // 是否为工作时间（可选）
  // 新增：每个data_code对应的详细信息，键为data_code，值为详细信息对象
  data_code_details: Record<string, DataCodeDetail>;
}

/**
 * 数据脱敏相关类型定义
 */

// 脱敏方法枚举
export type DataMaskingMethod = 'k-匿名' | '差分隐私' | '对抗生成网络';

// 应用场景枚举
export type DataMaskingScenario = '决策' | '展示' | '分析' | '预测';

// 文件上传响应
export interface FileUploadResponse {
  filename: string;
  headers: string[];
  message: string;
  status: 'success' | 'error';
}

// 脱敏处理请求参数
export interface DataMaskingRequest {
  selected_headers: string[];                    // 需要脱敏的字段
  record_count: number;                          // 记录数量
  scenario: DataMaskingScenario;                  // 应用场景
  method: DataMaskingMethod;                      // 脱敏方法
  data_code_details: Record<string, DataCodeDetail>; // 数据项详细信息映射
  results: Array<{                               // 医疗数据结果
    [key: string]: any;                          // 动态字段，包含选择的数据项
    medical_record_num: string;                  // 病历编号
    institution: string;                         // 机构标识
  }>;
}

// 脱敏处理响应（匹配后端实际返回格式）
export interface DataMaskingResponse {
  result: {
    task_id: number;              // 任务ID
  };
  message: string;
  status: 'ok' | 'error';
  code: number;
}

// 数据查看响应
export interface DataViewResponse {
  table_html: string;             // 数据表格HTML
  data_type: '原始' | '脱敏';     // 数据类型
  message: string;
  status: 'success' | 'error';
}
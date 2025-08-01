/**
 * 访问位置统计数据类型
 */
export interface AccessLocation {
  num_ad: number; // 异常地点访问次数
  num_nd: number; // 正常地点访问次数
}

/**
 * 访问时段统计数据类型
 */
export interface AccessPeriod {
  num_ni: number; // 正常时段访问次数
  num_ui: number; // 异常时段访问次数
}

/**
 * 访问成功统计数据类型
 */
export interface AccessSuccess {
  num_af: number; // 访问失败次数
  num_as: number; // 访问成功次数
}

/**
 * 数据敏感度统计数据类型
 */
export interface DataSensitivity {
  num1: number; // 敏感度级别1访问次数
  num2: number; // 敏感度级别2访问次数
  num3: number; // 敏感度级别3访问次数
  num4: number; // 敏感度级别4访问次数
}

/**
 * 操作行为统计数据类型
 */
export interface OperationBehavior {
  num_add: number; // 添加操作次数
  num_copy: number; // 复制操作次数
  num_delete: number; // 删除操作次数
  num_download: number; // 下载操作次数
  num_revise: number; // 修改操作次数
  num_view: number; // 查看操作次数
}

/**
 * 审计统计完整数据类型
 */
export interface AuditStats {
  Trustvalue: number; // 信任值
  access_location: AccessLocation;
  access_period: AccessPeriod;
  access_success: AccessSuccess;
  data_sensitivity: DataSensitivity;
  operation_behavior: OperationBehavior;
  user_id: string;
}

/**
 * 病历数据类型
 */
export interface MedicalRecord {
  id: number;
  medical_record_num: string;
  created_time: string;
  updated_time: string;
  data_code1: string;
  data_code2: string;
  data_code3: string;
  data_code4: string;
  data_code5: string;
  data_code6: string;
  data_code7: string;
  data_code8: string;
  data_code9: string;
}

/**
 * 病历响应数据类型
 */
export interface MedicalRecordResponse {
  data: MedicalRecord[];
  data_count: number;
  matched_medical_record_count: number;
  requested_disease_codes: string[];
  success: boolean;
}

/**
 * API响应通用类型
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * 病种代码选项类型
 */
export interface DiseaseCodeOption {
  label: string;
  value: string;
}

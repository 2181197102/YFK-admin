// src/types.ts
/** 分页+搜索请求参数 */
export interface PatientQueryParams {
  pageNum: number; // 当前页码，默认1
  pageSize: number; // 每页条数，默认10
  patientName?: string; // 患者姓名搜索关键词（可选）
}

/** 用户基本信息类型 */
export interface UserInfo {
  id_card: string; // 用户身份证号
  user_id: string; // 用户ID
  user_name: string; // 用户名
}

/** 病历记录类型 */
export interface MedicalRecord {
  id: number; // 记录ID
  doctor_name: string; // 医生姓名
  doctor_code: string; // 医生编号
  patient_name: string; // 患者姓名
  patient_id_num: string; // 患者身份证号
  medical_record_num: string; // 病历编号
  created_time: string; // 创建时间（UTC字符串）
  updated_time: string; // 更新时间（UTC字符串）
}

/** 接口响应数据类型 */
export interface PatientApiResponse {
  code: number; // 状态码（200为成功）
  msg: string; // 提示信息
  data: {
    medical_records: MedicalRecord[]; // 当前页病历列表
    related_group_ids: number[]; // 关联组ID列表
    total_medical_records: number; // 总病历数（用于分页）
    user_info: UserInfo; // 用户信息
  };
}
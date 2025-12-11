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

/** 病历详情 - 患者基本信息 */
export interface PatientBasicInfo {
  id: number; // ID
  name: string; // 患者姓名
  age: number; // 年龄
  gender: string; // 性别
  id_card: string; // 身份证号
  phone: string; // 手机号
  doctor_code: string; // 医生编号
  created_time: string; // 创建时间
  updated_time: string; // 更新时间
}

/** 病历详情 - 疾病信息 */
export interface DiseaseInfo {
  id: number; // ID
  medical_record_num: string; // 病历号
  disease_code: string; // 疾病代码
  created_time: string; // 创建时间
  updated_time: string; // 更新时间
}

/** 病历详情 - 医生信息 */
export interface DoctorInfo {
  doctor_name: string; // 医生姓名
  doctor_code: string; // 医生编号
}

/** 病历详情 - 记录时间信息 */
export interface RecordTime {
  created_time: string; // 创建时间
  updated_time: string; // 更新时间
}

/** 病历详情 - 患者记录数据 */
export interface PatientRecordData {
  id: number;
  medical_record_num: string;
  created_time: string;
  updated_time: string;
  // 基本信息
  blood_type: string; // 血型
  bmi: string; // BMI
  waist_circumference: string; // 腰围
  heart_rate: string; // 心率
  // 血压相关
  sitting_standing_blood_pressure: string; // 坐立血压
  ambulatory_blood_pressure_24h: string; // 24小时动态血压
  hypertension_history: string; // 高血压史
  // 血糖血脂
  fasting_blood_glucose: string; // 空腹血糖
  postprandial_blood_glucose: string; // 餐后血糖
  hba1c: string; // 糖化血红蛋白
  insulin: string; // 胰岛素
  c_peptide: string; // C肽
  hypoglycemia_code: string; // 低血糖编码
  total_cholesterol: string; // 总胆固醇
  triglyceride: string; // 甘油三酯
  hdl_cholesterol: string; // 高密度脂蛋白
  ldl_cholesterol: string; // 低密度脂蛋白
  // 肾功能
  blood_uric_acid: string; // 血尿酸
  serum_creatinine: string; // 血清肌酐
  urine_microalbumin_creatinine_ratio: string; // 尿微量白蛋白肌酐比
  // 心血管检查
  troponin: string; // 肌钙蛋白
  left_ventricular_ejection_fraction: string; // 左心室射血分数
  arterial_stiffness: string; // 动脉僵硬度
  lower_limb_vascular_ultrasound: string; // 下肢血管超声
  abdominal_ultrasound: string; // 腹部超声
  fundus_examination: string; // 眼底检查
  // 肺功能
  fev1: string; // 用力呼气量
  fev1_fvc_ratio: string; // FEV1/FVC比值
  pef: string; // 呼气峰流速
  frc: string; // 功能残气量
  tlc: string; // 肺总量
  dlco: string; // 弥散量
  dlco_va_ratio: string; // DLCO/VA比值
  spo2: string; // 血氧饱和度
  mmrc_score: string; // mMRC评分
  cat_score: string; // CAT评分
  // 生活习惯
  smoking_history: string; // 吸烟史
  smoking_start_age: string; // 开始吸烟年龄
  smoking_quit_age: string; // 戒烟年龄
  drinking_history: string; // 饮酒史
  exercise_method: string; // 运动方式
  exercise_duration: string; // 运动时长
  daily_staple_food: string; // 每日主食
  // 病史
  past_history: string; // 既往史
  family_history: string; // 家族史
  medication_history: string; // 用药史
  occupational_dust_exposure: string; // 职业粉尘暴露
  environmental_risk_factors: string; // 环境危险因素
  // 诊疗信息
  diagnosis_name_code: string; // 诊断名称编码
  drug_name: string; // 药物名称
  planned_operation_code: string; // 计划手术编码
  transfusion_method: string; // 输血方法
  cost: string; // 费用
  lifestyle_guidance: string; // 生活方式指导
  medication_guidance: string; // 用药指导
  [key: string]: string | number; // 索引签名，支持动态属性访问
}

/** 病历详情 - 单条机构记录 */
export interface InstitutionRecordItem {
  medical_record_num: string; // 病历号
  patient_basic_info: PatientBasicInfo; // 患者基本信息
  disease_info: DiseaseInfo; // 疾病信息
  doctor_info: DoctorInfo; // 医生信息
  patient_record_data: PatientRecordData; // 患者记录数据
}

/** 病历详情 - 机构记录集合 */
export interface InstitutionRecords {
  institution_id: number; // 机构ID
  institution_name: string; // 机构名称
  record_count: number; // 该机构的记录数
  records: InstitutionRecordItem[]; // 该机构的所有病历记录
}

/** 病历详情响应数据类型（当前机构 - 单条记录） */
export interface PatientDetailResponse {
  code: number; // 状态码（200为成功）
  msg: string; // 提示信息
  data: {
    medical_record_num: string; // 病历号
    institution_id: number; // 当前机构ID
    institution_name: string; // 当前机构名称
    patient_basic_info: PatientBasicInfo; // 患者基本信息
    disease_info: DiseaseInfo; // 疾病信息
    doctor_info: DoctorInfo; // 医生信息
    patient_record_data: PatientRecordData; // 患者记录数据
  };
}

/** 全病历查询 - 当前医生信息 */
export interface CurrentDoctorInfo {
  doctor_id: number; // 医生ID
  doctor_name: string; // 医生姓名
  doctor_code: string; // 医生编号
  id_card: string; // 身份证号
  institutions: Array<{
    institution_id: number;
    institution_name: string;
  }>; // 所属机构列表
}

/** 全病历查询 - 医生信息（带标记） */
export interface DoctorInfoWithFlag {
  doctor_name: string; // 医生姓名
  doctor_code: string; // 医生编号
  is_current_doctor: boolean; // 是否为当前医生
}

/** 全病历查询 - 单条病历记录 */
export interface AllRecordItem {
  medical_record_num: string; // 病历号
  is_current_doctor_record: boolean; // 是否为当前医生的病历
  patient_basic_info: PatientBasicInfo; // 患者基本信息
  patient_record_data: PatientRecordData; // 患者记录数据
  disease_info: DiseaseInfo; // 疾病信息
  doctor_info: DoctorInfoWithFlag; // 医生信息（含标记）
  record_time: RecordTime; // 记录时间
}

/** 全病历查询 - 机构病历集合 */
export interface InstitutionAllRecords {
  institution_id: number; // 机构ID
  institution_name: string; // 机构名称
  is_current_doctor_institution: boolean; // 是否为当前医生所属机构
  records_count: number; // 该机构的总病历数
  current_doctor_records_count: number; // 当前医生在该机构的病历数
  records: AllRecordItem[]; // 该机构的所有病历记录
}

/** 全病历查询响应数据类型（按身份证查询所有机构病历） */
export interface PatientAllRecordsResponse {
  code: number; // 状态码（200为成功）
  msg: string; // 提示信息
  data: {
    current_doctor: CurrentDoctorInfo; // 当前医生信息
    patient_id_card: string; // 患者身份证号
    total_institutions: number; // 涉及的机构总数
    total_records: number; // 所有机构的病历总数
    current_doctor_total_records: number; // 当前医生的病历总数
    institution_records: InstitutionAllRecords[]; // 各机构的病历集合
  };
}


/** 疾病数据项类型 */
export interface DiseaseDataItem {
  id: number;
  disease_code: string;
  data_code: string;
  remark: string;
  data_type: 0 | 1; // 0-文本型 1-数值型
  sensitive: string;
  similar: string;
  security_category: string;
  security_level: number;
}

/** 疾病数据响应类型 */
export interface DiseaseDataResponse {
  status: "success" | "error";
  message: string;
  data: Record<string, DiseaseDataItem[]>; // key: disease_code, value: 对应data_code列表
}
/**
 * 医疗记录表单提交的数据类型
 * 诊断编码改为数组（多选），其他字段保持分类
 */
export interface MedicalRecordForm {
  user_id: number;
  name: string;
  age: number;
  gender: string;
  id_card: string;
  phone: string;
  doctor_name: string;
  
  // 诊断编码改为多选数组（从E10/I10/I25.1/J44中选择）
  diagnosis_name_code: string;
  
  // 既往史和用药史（多选+其他输入）
  past_history: string[];
  past_history_other?: string; // 既往史其他内容
  family_history?: string;
  medication_history: string[];
  medication_history_other?: string; // 用药史其他内容
  
  
  // 血压血糖相关
  sitting_standing_blood_pressure?: string;
  ambulatory_blood_pressure_24h?: string;
  hypertension_history?: string;
  fasting_blood_glucose?: string;
  postprandial_blood_glucose?: string;
  hba1c?: string;
  insulin?: string;
  c_peptide?: string;
  hypoglycemia_code?: string;
  
  // 血脂血尿酸相关
  total_cholesterol?: string;
  triglyceride?: string;
  hdl_cholesterol?: string;
  ldl_cholesterol?: string;
  blood_uric_acid?: string;
  serum_creatinine?: string;
  urine_microalbumin_creatinine_ratio?: string;
  
  // 心血管检查相关
  troponin?: string;
  left_ventricular_ejection_fraction?: string;
  arterial_stiffness?: string;
  lower_limb_vascular_ultrasound?: string;
  abdominal_ultrasound?: string;
  fundus_examination?: string;
  
  // 肺功能检查相关
  fev1?: string;
  fev1_fvc_ratio?: string;
  pef?: string;
  frc?: string;
  tlc?: string;
  dlco?: string;
  dlco_va_ratio?: string;
  spo2?: string;
  mmrc_score?: string;
  cat_score?: string;
  
  // 生活习惯相关
  smoking_history?: string;
  smoking_start_age?: number;
  smoking_quit_age?: number;
  drinking_history?: string;
  exercise_method?: string;
  exercise_duration?: number;
  daily_staple_food?: number;
  
  // 诊疗方案相关
  drug_name?: string;
  planned_operation_code?: string;
  transfusion_method?: string;
  lifestyle_guidance?: string;
  medication_guidance?: string;
  cost?: number;
  
  // 其他基础项
  blood_type?: string;
  heart_rate?: string;
  bmi?: string;
}

// 其他类型定义保持不变
export interface DiseaseItem {
  data_code: string;
  data_type: number;
  disease_code: string;
  id: number;
  remark: string;
  security_category: string;
  security_level: number;
  sensitive: string;
  similar: string;
}
export type DiseaseMap = Record<string, DiseaseItem[]>;
export interface DiseaseCodeRes {
  data: DiseaseMap;
  message: string;
  status: string;
}

/** 健康数据单条记录类型（必须和接口返回字段完全一致） */
export interface HealthRecordItem {
  record_id: number; // 接口返回的record_id
  created_time: string; // 接口返回的created_time
  // 所有心率字段（0-22时，每2小时一个）
  hr_0: number;
  hr_2: number;
  hr_4: number;
  hr_6: number;
  hr_8: number;
  hr_10: number;
  hr_12: number;
  hr_14: number;
  hr_16: number;
  hr_18: number;
  hr_20: number;
  hr_22: number;
  // 所有收缩压字段
  sys_0: number;
  sys_2: number;
  sys_4: number;
  sys_6: number;
  sys_8: number;
  sys_10: number;
  sys_12: number;
  sys_14: number;
  sys_16: number;
  sys_18: number;
  sys_20: number;
  sys_22: number;
  // 所有舒张压字段
  dia_0: number;
  dia_2: number;
  dia_4: number;
  dia_6: number;
  dia_8: number;
  dia_10: number;
  dia_12: number;
  dia_14: number;
  dia_16: number;
  dia_18: number;
  dia_20: number;
  dia_22: number;

  spo2_0: number;
  spo2_2: number;
  spo2_4: number;
  spo2_6: number;
  spo2_8: number;
  spo2_10: number;
  spo2_12: number;
  spo2_14: number;
  spo2_16: number;
  spo2_18: number;
  spo2_20: number;
  spo2_22: number;
}

/** 健康数据响应类型 */
export interface HealthRecordResponse {
  code: number;
  message: string;
  data: {
    id_card: number | string; // 兼容数字/字符串类型
    record_count: number;
    records: HealthRecordItem[]; // 对应上面的类型
  };
}
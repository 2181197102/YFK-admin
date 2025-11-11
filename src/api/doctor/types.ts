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

/** 病历提交表单类型 */
export interface MedicalRecordForm {
  // 固定必填字段
  user_id: number;
  name: string;
  age: number;
  gender: "男" | "女" | "其他";
  id_card: string;
  phone: string;
  doctor_name: string;
  disease_code: string; // 选中的疾病编码
  // 动态字段（根据disease_code对应的data_code生成）
  [key: string]: any; // 兼容动态data_code字段
}
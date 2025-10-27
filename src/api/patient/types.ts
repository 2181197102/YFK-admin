// src/types/medical-record.ts
/** 用户信息类型 */
export interface UserInfo {
  user_id: string; // 返回值中为字符串（如"12"）
  user_name: string;
  id_card: string;
  enable: boolean;
}

/** 单条病历数据类型（对应ins{group_id}_record_data） */
export interface MedicalRecordItem {
  id: number;
  medical_record_num: string;
  // 基础健康信息
  smoking_history: string;
  drinking_history: string;
  hypertension_history: string;
  blood_type: string;
  heart_rate: string;
  triglyceride: string;
  total_cholesterol: string;
  hdl_cholesterol: string;
  ldl_cholesterol: string;
  left_ventricular_ejection_fraction: string;
  serum_creatinine: string;
  troponin: string;
  // 诊断与治疗
  diagnosis_name_code: string;
  planned_operation_code: string;
  transfusion_method: string;
  drug_name: string;
  medication_guidance: string;
  lifestyle_guidance: string;
  cost: string;
  // 吸烟相关
  smoking_start_age: string;
  smoking_quit_age: string; // 可能为空字符串
  occupational_dust_exposure: string;
  environmental_risk_factors: string;
  // 肺功能检查
  fev1: string;
  fev1_fvc_ratio: string;
  tlc: string;
  frc: string;
  dlco: string;
  dlco_va_ratio: string;
  pef: string;
  cat_score: string;
  mmrc_score: string;
  spo2: string;
  // 家族与用药史
  family_history: string;
  medication_history: string;
  past_history: string;
  // 生活方式
  daily_staple_food: string;
  exercise_method: string;
  exercise_duration: string;
  // 血糖相关
  fasting_blood_glucose: string;
  postprandial_blood_glucose: string;
  hypoglycemia_code: string;
  hba1c: string;
  insulin: string;
  c_peptide: string;
  // 检查项目
  abdominal_ultrasound: string;
  fundus_examination: string;
  lower_limb_vascular_ultrasound: string;
  urine_microalbumin_creatinine_ratio: string;
  arterial_stiffness: string;
  // 血压相关
  bmi: string;
  waist_circumference: string;
  sitting_standing_blood_pressure: string;
  ambulatory_blood_pressure_24h: string;
  blood_uric_acid: string;
  // 时间字段
  created_time: string;
  updated_time: string;
}

/** 单个机构的病历分组类型 */
export interface GroupRecord {
  group_id: number;
  institution_name: string;
  record_data: MedicalRecordItem[];
  record_data_count: number;
}

/** API返回值整体类型 */
export interface GetMyMedicalRecordResponse {
  code: number;
  msg: string;
  data: {
    user_info: UserInfo;
    total_record_data_count: number;
    group_records: GroupRecord[];
  };
}
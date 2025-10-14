// 患者基本信息
export interface PatientBasicInfo {
  age: number;
  doctor_code: string;
  gender: string;
  name: string;
}

// 患者数据项
export interface PatientDataItems {
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

// 记录时间戳
export interface RecordTimestamps {
  created_time: string;
  updated_time: string;
}

// 患者信息
export interface Patient {
  basic_info: PatientBasicInfo;
  data_items: PatientDataItems;
  disease_code: string;
  medical_record_num: string;
  patient_id_num: string;
  patient_name: string;
  record_timestamps: RecordTimestamps;
}

// 患者列表响应
export interface PatientsResponse {
  code: number;
  data: {
    doctor_name: string;
    institution_id: number;
    patient_count: number;
    patients: Patient[];
  };
  msg: string;
}

// 访问位置统计
export interface AccessLocation {
  num_ad: number;
  num_nd: number;
}

// 访问时段统计
export interface AccessPeriod {
  num_ni: number;
  num_ui: number;
}

// 访问成功统计
export interface AccessSuccess {
  num_af: number;
  num_as: number;
}

// 数据敏感度统计
export interface DataSensitivity {
  num1: number;
  num2: number;
  num3: number;
  num4: number;
}

// 操作行为统计
export interface OperationBehavior {
  num_add: number;
  num_copy: number;
  num_delete: number;
  num_download: number;
  num_revise: number;
  num_view: number;
}

// 信任值计算结果
export interface TrustValueResponse {
  Trustvalue: number;
  access_location: AccessLocation;
  access_period: AccessPeriod;
  access_success: AccessSuccess;
  data_sensitivity: DataSensitivity;
  operation_behavior: OperationBehavior;
  user_id: string;
}

// 数据信息
export interface DataInfo {
  created_time: string;
  data_code1: string;
  data_code2: string;
  data_code3: string;
  data_code4: string;
  data_code5: string;
  data_code6: string;
  data_code7: string;
  data_code8: string;
  data_code9: string;
  id: number;
  medical_record_num: string;
  updated_time: string;
}

// 疾病信息
export interface DiseaseInfo {
  created_time: string;
  disease_code: string;
  id: number;
  medical_record_num: string;
  updated_time: string;
}

// 医生信息
export interface DoctorInfo {
  doctor_code: string;
  doctor_name: string;
}

// 患者基本记录
export interface PatientBasic {
  age: number;
  created_time: string;
  doctor_code: string;
  gender: string;
  id: number;
  id_card: string;
  name: string;
  updated_time: string;
}

// 记录时间
export interface RecordTime {
  created_time: string;
  updated_time: string;
}

// 机构记录
export interface InstitutionRecordItem {
  data_info: DataInfo;
  disease_info: DiseaseInfo;
  doctor_info: DoctorInfo;
  medical_record_num: string;
  patient_basic: PatientBasic;
  record_time: RecordTime;
  related_data_codes: string[];
}

// 机构记录组
export interface InstitutionRecords {
  institution_id: number;
  institution_name: string;
  record_count: number;
  records: InstitutionRecordItem[];
}

// 患者完整信息响应
export interface PatientDetailResponse {
  code: number;
  data: {
    institution_records: InstitutionRecords[];
    patient_id_card: string;
    total_institutions: number;
    total_records: number;
  };
}

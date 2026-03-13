<template>
  <div class="medical-record-container">
    <el-page-header content="医疗记录录入" />
    <el-card class="mt-4">
      <!-- 基础信息区域 -->
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="身份证号" prop="id_card">
          <el-input 
            v-model="form.id_card" 
            placeholder="请输入身份证号"
            @change="handleIdCardChange"
            maxlength="18"
          />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择性别">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="年龄" prop="age">
          <el-input 
            v-model.number="form.age" 
            placeholder="自动计算，可修改" 
            type="number" 
            step="1"
            min="0"
          />
        </el-form-item>
        
        <el-form-item label="身高（cm）" prop="height">
          <el-input 
            v-model.number="form.height" 
            placeholder="请输入身高（支持小数）"
            type="number" 
            step="0.01" 
            min="0"
            @change="calculateBMI"
          />
        </el-form-item>
        
        <el-form-item label="体重（kg）" prop="weight">
          <el-input 
            v-model.number="form.weight" 
            placeholder="请输入体重（支持小数）"
            type="number" 
            step="0.01" 
            min="0"
            @change="calculateBMI"
          />
        </el-form-item>
        
        <el-form-item label="BMI指数（kg/m²）" prop="bmi">
          <el-input 
            v-model.number="form.bmi" 
            placeholder="自动计算/手动输入小数"
            type="number" 
            step="0.01" 
            min="0"
          />
        </el-form-item>
        
        <el-form-item label="腰围（cm）" prop="waist_circumference">
          <el-input 
            v-model.number="form.waist_circumference" 
            placeholder="请输入腰围（支持小数）"
            type="number" 
            step="0.01" 
            min="0"
          />
        </el-form-item>
        
        <el-form-item label="血型" prop="blood_type">
          <el-select v-model="form.blood_type" placeholder="请选择血型">
            <el-option label="A型" value="A型" />
            <el-option label="B型" value="B型" />
            <el-option label="O型" value="O型" />
            <el-option label="AB型" value="AB型" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
        </el-form-item>
        
        <el-form-item label="医生姓名" prop="doctor_name">
          <el-input v-model="form.doctor_name" placeholder="请输入医生姓名" />
        </el-form-item>

        <el-form-item label="诊断编码" prop="diagnosis_name_code">
          <el-select 
            v-model="form.diagnosis_name_code" 
            placeholder="请选择疾病编码"
            style="width: 100%"
          >
            <el-option label="E10 - 1型糖尿病" value="E10" />
            <el-option label="I10 - 高血压" value="I10" />
            <el-option label="I25.1 - 冠心病" value="I25.1" />
            <el-option label="J44 - 慢性阻塞性肺疾病" value="J44" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 分类表单区域 -->
      <el-tabs v-model="activeTab" class="mt-4">
        <!-- 基础健康信息 -->
        <el-tab-pane label="基础健康信息">
          <el-descriptions :column="3" border size="small" class="form-container">
            <el-descriptions-item label="吸烟史">
              <el-select v-model="form.smoking_history" placeholder="请选择">
                <el-option label="有" value="有" />
                <el-option label="无" value="无" />
              </el-select>
            </el-descriptions-item>
            <el-descriptions-item label="开始吸烟年龄（岁）">
              <el-input 
                v-model.number="form.smoking_start_age" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="戒烟年龄（岁）">
              <el-input 
                v-model.number="form.smoking_quit_age" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="饮酒史">
              <el-select v-model="form.drinking_history" placeholder="请选择">
                <el-option label="有" value="有" />
                <el-option label="无" value="无" />
              </el-select>
            </el-descriptions-item>
            <el-descriptions-item label="高血压史">
              <el-select v-model="form.hypertension_history" placeholder="请选择">
                <el-option label="有" value="有" />
                <el-option label="无" value="无" />
              </el-select>
            </el-descriptions-item>
            <el-descriptions-item label="心率（次/分）">
              <el-input 
                v-model.number="form.heart_rate" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="甘油三酯（mmol/L）">
              <el-input 
                v-model.number="form.triglyceride" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="总胆固醇（mmol/L）">
              <el-input 
                v-model.number="form.total_cholesterol" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="高密度脂蛋白（mmol/L）">
              <el-input 
                v-model.number="form.hdl_cholesterol" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="低密度脂蛋白（mmol/L）">
              <el-input 
                v-model.number="form.ldl_cholesterol" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="左心室射血分数（%）">
              <el-input 
                v-model.number="form.left_ventricular_ejection_fraction" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="血清肌酐（μmol/L）">
              <el-input 
                v-model.number="form.serum_creatinine" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="肌钙蛋白（ng/mL）">
              <el-input 
                v-model.number="form.troponin" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="血尿酸（μmol/L）">
              <el-input 
                v-model.number="form.blood_uric_acid" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="动脉僵硬度（m/s）">
              <el-input 
                v-model.number="form.arterial_stiffness" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="尿微量白蛋白/肌酐比值">
              <el-input 
                v-model.number="form.urine_microalbumin_creatinine_ratio" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 疾病诊断 -->
        <el-tab-pane label="疾病诊断">
          <el-descriptions :column="2" border size="small" class="form-container">
            <el-descriptions-item label="既往史" :span="2">
              <el-select 
                v-model="form.past_history" 
                placeholder="请选择既往史（可多选）"
                multiple
                collapse-tags
                style="width: 100%"
                @change="handlePastHistoryChange"
              >
                <el-option label="无" value="无" />
                <el-option label="高血压" value="高血压" />
                <el-option label="糖尿病" value="糖尿病" />
                <el-option label="冠心病" value="冠心病" />
                <el-option label="脑血管疾病" value="脑血管疾病" />
                <el-option label="其他" value="其他" />
              </el-select>
              <el-input
                v-if="form.past_history.includes('其他')"
                v-model="form.past_history_other"
                placeholder="请输入其他既往史内容"
                class="mt-2"
                style="width: 100%"
              />
            </el-descriptions-item>
            
            <el-descriptions-item label="家族史" :span="2">
              <el-input v-model="form.family_history" placeholder="请输入家族史" />
            </el-descriptions-item>
            
            <el-descriptions-item label="用药史" :span="2">
              <el-select 
                v-model="form.medication_history" 
                placeholder="请选择用药史（可多选）"
                multiple
                collapse-tags
                style="width: 100%"
                @change="handleMedicationHistoryChange"
              >
                <el-option label="无" value="无" />
                <el-option label="降压药" value="降压药" />
                <el-option label="降糖药" value="降糖药" />
                <el-option label="降脂药" value="降脂药" />
                <el-option label="抗生素" value="抗生素" />
                <el-option label="其他" value="其他" />
              </el-select>
              <el-input
                v-if="form.medication_history.includes('其他')"
                v-model="form.medication_history_other"
                placeholder="请输入其他用药史内容"
                class="mt-2"
                style="width: 100%"
              />
            </el-descriptions-item>
            
            <el-descriptions-item label="职业粉尘暴露" :span="2">
              <el-input v-model="form.occupational_dust_exposure" placeholder="请输入职业性烟尘接触史" />
            </el-descriptions-item>
            
            <el-descriptions-item label="环境危险因素" :span="2">
              <el-input v-model="form.environmental_risk_factors" placeholder="请输入环境危险因素史" />
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 血压血糖 -->
        <el-tab-pane label="血压血糖">
          <el-descriptions :column="3" border size="small" class="form-container">
            <el-descriptions-item label="坐立血压（mmHg）">
              <el-input 
                v-model.number="form.sitting_standing_blood_pressure" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="24h动态血压">
              <el-input v-model="form.ambulatory_blood_pressure_24h" placeholder="请输入24h动态血压" />
            </el-descriptions-item>
            <el-descriptions-item label="空腹血糖（mmol/L）">
              <el-input 
                v-model.number="form.fasting_blood_glucose" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="餐后血糖（mmol/L）">
              <el-input 
                v-model.number="form.postprandial_blood_glucose" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="糖化血红蛋白（%）">
              <el-input 
                v-model.number="form.hba1c" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="胰岛素（mU/L）">
              <el-input 
                v-model.number="form.insulin" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="C肽（ng/mL）">
              <el-input 
                v-model.number="form.c_peptide" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="低血糖反应代码">
              <el-input 
                v-model.number="form.hypoglycemia_code" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 肺功能检查 -->
        <el-tab-pane label="肺功能检查">
          <el-descriptions :column="3" border size="small" class="form-container">
            <el-descriptions-item label="FEV1（L）">
              <el-input 
                v-model.number="form.fev1" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="FEV1/FVC比值（%）">
              <el-input 
                v-model.number="form.fev1_fvc_ratio" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="峰流速（L/s）">
              <el-input 
                v-model.number="form.pef" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="功能残气量（L）">
              <el-input 
                v-model.number="form.frc" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="总肺活量（L）">
              <el-input 
                v-model.number="form.tlc" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="一氧化碳弥散量（mmol/min/kPa）">
              <el-input 
                v-model.number="form.dlco" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="DLCO/VA比值（mmol/min/kPa/L）">
              <el-input 
                v-model.number="form.dlco_va_ratio" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="血氧饱和度（%）">
              <el-input 
                v-model.number="form.spo2" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="mMRC评分（级）">
              <el-input 
                v-model.number="form.mmrc_score" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="CAT评分（分）" :span="3">
              <el-input 
                v-model.number="form.cat_score" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 生活方式 -->
        <el-tab-pane label="生活方式">
          <el-descriptions :column="3" border size="small" class="form-container">
            <el-descriptions-item label="每日主食（g）">
              <el-input 
                v-model.number="form.daily_staple_food" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="运动方式（编码/数值）">
              <el-input 
                v-model.number="form.exercise_method" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
            <el-descriptions-item label="运动时长（分钟）">
              <el-input 
                v-model.number="form.exercise_duration" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 诊疗方案 -->
        <el-tab-pane label="诊疗方案">
          <el-descriptions :column="2" border size="small" class="form-container">
            <el-descriptions-item label="计划手术编码" :span="2">
              <el-input v-model="form.planned_operation_code" placeholder="请输入拟实施手术及操作编码" />
            </el-descriptions-item>
            <el-descriptions-item label="输血方式" :span="2">
              <el-input v-model="form.transfusion_method" placeholder="请输入输血方式" />
            </el-descriptions-item>
            <el-descriptions-item label="药物名称" :span="2">
              <el-input v-model="form.drug_name" placeholder="请输入药物名称" />
            </el-descriptions-item>
            <el-descriptions-item label="用药指导" :span="2">
              <el-input v-model="form.medication_guidance" placeholder="请输入用药指导" type="textarea" :rows="2" />
            </el-descriptions-item>
            <el-descriptions-item label="生活方式指导" :span="2">
              <el-input v-model="form.lifestyle_guidance" placeholder="请输入生活方式指导" type="textarea" :rows="2" />
            </el-descriptions-item>
            <el-descriptions-item label="费用（元）" :span="2">
              <el-input 
                v-model.number="form.cost" 
                placeholder="支持小数"
                type="number" 
                step="0.01" 
                min="0"
              />
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 检查项目 -->
        <el-tab-pane label="检查项目">
          <el-descriptions :column="2" border size="small" class="form-container">
            <el-descriptions-item label="腹部彩超" :span="2">
              <el-input v-model="form.abdominal_ultrasound" placeholder="请输入腹部彩超结果" />
            </el-descriptions-item>
            <el-descriptions-item label="眼底检查" :span="2">
              <el-input v-model="form.fundus_examination" placeholder="请输入眼底检查结果" />
            </el-descriptions-item>
            <el-descriptions-item label="下肢血管彩超" :span="2">
              <el-input v-model="form.lower_limb_vascular_ultrasound" placeholder="请输入下肢血管彩超结果" />
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>

      <!-- 提交按钮 -->
      <div class="submit-btn-container mt-6">
        <el-button type="primary" @click="handleSubmit">提交医疗记录</el-button>
        <el-button @click="handleReset">重置表单</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { ElMessage, ElForm } from 'element-plus';
import { getDiseaseCodes, addMedicalRecord } from '@/api/doctor/doctor';

// 完整类型定义（数值型字段支持number类型）
interface MedicalRecordForm {
  // 基础信息
  user_id: number;
  name: string;
  age: number;
  gender: string;
  id_card: string;
  height: number;
  weight: number;
  phone: string;
  doctor_name: string;
  
  // 数据库所有字段（数值型用number）
  smoking_history: string;
  drinking_history: string;
  hypertension_history: string;
  blood_type: string;
  heart_rate: number;
  triglyceride: number;
  total_cholesterol: number;
  hdl_cholesterol: number;
  ldl_cholesterol: number;
  left_ventricular_ejection_fraction: number;
  serum_creatinine: number;
  troponin: number;
  diagnosis_name_code: string;
  planned_operation_code: string;
  transfusion_method: string;
  drug_name: string;
  medication_guidance: string;
  lifestyle_guidance: string;
  cost: number;
  smoking_start_age: number;
  smoking_quit_age: number;
  occupational_dust_exposure: string;
  environmental_risk_factors: string;
  fev1: number;
  fev1_fvc_ratio: number;
  tlc: number;
  frc: number;
  dlco: number;
  dlco_va_ratio: number;
  pef: number;
  cat_score: number;
  mmrc_score: number;
  spo2: number;
  family_history: string;
  medication_history: string[];
  past_history: string[];
  daily_staple_food: number;
  exercise_method: number;
  exercise_duration: number;
  fasting_blood_glucose: number;
  postprandial_blood_glucose: number;
  hypoglycemia_code: number;
  hba1c: number;
  insulin: number;
  c_peptide: number;
  abdominal_ultrasound: string;
  fundus_examination: string;
  lower_limb_vascular_ultrasound: string;
  urine_microalbumin_creatinine_ratio: number;
  arterial_stiffness: number;
  bmi: number;
  waist_circumference: number;
  sitting_standing_blood_pressure: number;
  ambulatory_blood_pressure_24h: string;
  blood_uric_acid: number;
  
  // 临时字段
  past_history_other: string;
  medication_history_other: string;
}

interface DiseaseCodeRes {
  data: any[];
}

// 表单引用
const formRef = ref<InstanceType<typeof ElForm>>();
// 激活的标签页
const activeTab = ref('基础健康信息');

// 表单数据（数值型字段初始化为0或undefined）
const form = reactive<MedicalRecordForm>({
  user_id: 1001,
  name: '',
  age: 0,
  gender: '',
  id_card: '',
  height: 0,
  weight: 0,
  phone: '',
  doctor_name: '',
  
  // 数据库字段初始化（数值型为0）
  smoking_history: '',
  drinking_history: '',
  hypertension_history: '',
  blood_type: '',
  heart_rate: 0,
  triglyceride: 0,
  total_cholesterol: 0,
  hdl_cholesterol: 0,
  ldl_cholesterol: 0,
  left_ventricular_ejection_fraction: 0,
  serum_creatinine: 0,
  troponin: 0,
  diagnosis_name_code: '',
  planned_operation_code: '',
  transfusion_method: '',
  drug_name: '',
  medication_guidance: '',
  lifestyle_guidance: '',
  cost: 0,
  smoking_start_age: 0,
  smoking_quit_age: 0,
  occupational_dust_exposure: '',
  environmental_risk_factors: '',
  fev1: 0,
  fev1_fvc_ratio: 0,
  tlc: 0,
  frc: 0,
  dlco: 0,
  dlco_va_ratio: 0,
  pef: 0,
  cat_score: 0,
  mmrc_score: 0,
  spo2: 0,
  family_history: '',
  medication_history: [],
  past_history: [],
  daily_staple_food: 0,
  exercise_method: 0,
  exercise_duration: 0,
  fasting_blood_glucose: 0,
  postprandial_blood_glucose: 0,
  hypoglycemia_code: 0,
  hba1c: 0,
  insulin: 0,
  c_peptide: 0,
  abdominal_ultrasound: '',
  fundus_examination: '',
  lower_limb_vascular_ultrasound: '',
  urine_microalbumin_creatinine_ratio: 0,
  arterial_stiffness: 0,
  bmi: 0,
  waist_circumference: 0,
  sitting_standing_blood_pressure: 0,
  ambulatory_blood_pressure_24h: '',
  blood_uric_acid: 0,
  
  // 临时字段
  past_history_other: '',
  medication_history_other: '',
});

// 表单验证规则（适配小数输入）
const rules = reactive({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  id_card: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  doctor_name: [{ required: true, message: '请输入医生姓名', trigger: 'blur' }],
  diagnosis_name_code: [{ required: true, message: '请选择诊断编码', trigger: 'change' }],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number', min: 0, message: '年龄必须为非负数', trigger: 'blur' }
  ],
  height: [
    { required: true, message: '请输入身高', trigger: 'blur' },
    { type: 'number', min: 0, message: '身高必须为非负数', trigger: 'blur' }
  ],
  weight: [
    { required: true, message: '请输入体重', trigger: 'blur' },
    { type: 'number', min: 0, message: '体重必须为非负数', trigger: 'blur' }
  ],
});

// BMI计算逻辑（支持小数）
const calculateBMI = () => {
  if (form.height > 0 && form.weight > 0) {
    const heightInM = form.height / 100;
    const bmiValue = Number((form.weight / (heightInM * heightInM)).toFixed(2));
    form.bmi = bmiValue;
  }
};

// 身份证号解析
const handleIdCardChange = (val: string) => {
  if (val.length === 18) {
    const genderCode = val.substring(16, 17);
    form.gender = parseInt(genderCode) % 2 === 1 ? '男' : '女';
    const birthYear = parseInt(val.substring(6, 10));
    form.age = new Date().getFullYear() - birthYear;
  }
};

// 既往史变化处理
const handlePastHistoryChange = (values: string[]) => {
  if (!values.includes('其他')) {
    form.past_history_other = '';
  }
};

// 用药史变化处理
const handleMedicationHistoryChange = (values: string[]) => {
  if (!values.includes('其他')) {
    form.medication_history_other = '';
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    
    // 处理既往史（数组转字符串）
    let pastHistoryStr = '';
    if (Array.isArray(form.past_history)) {
      const pastHistory = [...form.past_history];
      if (pastHistory.includes('其他') && form.past_history_other) {
        const index = pastHistory.indexOf('其他');
        pastHistory.splice(index, 1, form.past_history_other);
      }
      pastHistoryStr = pastHistory.join(',');
    }
    
    // 处理用药史（数组转字符串）
    let medicationHistoryStr = '';
    if (Array.isArray(form.medication_history)) {
      const medicationHistory = [...form.medication_history];
      if (medicationHistory.includes('其他') && form.medication_history_other) {
        const index = medicationHistory.indexOf('其他');
        medicationHistory.splice(index, 1, form.medication_history_other);
      }
      medicationHistoryStr = medicationHistory.join(',');
    }
    
    // 构造提交数据
    const submitData = {
      ...form,
      past_history: pastHistoryStr,
      medication_history: medicationHistoryStr,
    };
    delete submitData.past_history_other;
    delete submitData.medication_history_other;
    delete submitData.height; // 数据库无此字段
    delete submitData.weight; // 数据库无此字段
    
    await addMedicalRecord(submitData);
    ElMessage.success('医疗记录提交成功');
    handleReset();
  } catch (error) {
    ElMessage.error('提交失败，请检查表单数据');
    console.error(error);
  }
};

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields();
  Object.assign(form, {
    diagnosis_name_code: '',
    past_history: [],
    medication_history: [],
    past_history_other: '',
    medication_history_other: '',
    height: 0,
    weight: 0,
    bmi: 0,
    waist_circumference: 0,
  });
  activeTab.value = '基础健康信息';
};

// 初始化获取疾病编码
onMounted(async () => {
  try {
    const res: DiseaseCodeRes = await getDiseaseCodes();
    console.log('疾病编码数据', res.data);
  } catch (error) {
    console.error('获取疾病编码失败', error);
  }
});
</script>

<style scoped>
.medical-record-container {
  padding: 20px;
}

.form-container {
  margin-top: 16px;
}

.el-descriptions-item__content {
  padding: 8px 0;
}

.submit-btn-container {
  text-align: center;
}

/* 优化数字输入框样式 */
.el-input--number .el-input__inner {
  -moz-appearance: textfield;
}
.el-input--number .el-input__inner::-webkit-outer-spin-button,
.el-input--number .el-input__inner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
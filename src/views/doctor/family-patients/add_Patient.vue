<template>
  <div class="medical-record-container">
    <el-page-header content="医疗记录录入" />
    <el-card class="mt-4">
      <!-- 基础信息区域 -->
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <!-- 身份证号、姓名、性别、年龄、电话、医生姓名 保持不变 -->
        <el-form-item label="身份证号" prop="id_card">
          <el-input 
            v-model="form.id_card" 
            placeholder="请输入身份证号"
            @change="handleIdCardChange"
            max="18"
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
          <el-input v-model.number="form.age" placeholder="自动计算，可修改" />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" max="11" />
        </el-form-item>
        
        <el-form-item label="医生姓名" prop="doctor_name">
          <el-input v-model="form.doctor_name" placeholder="请输入医生姓名" />
        </el-form-item>

        <!-- 诊断编码：单选（从E10/I10/I25.1/J44中选择） -->
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
        <!-- 疾病诊断（核心调整：既往史和用药史的其他输入功能） -->
        <el-tab-pane label="疾病诊断">
          <el-descriptions :column="2" border size="small" class="form-container">
            <!-- 既往史：多选 + 其他输入（修复功能） -->
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
              
              <!-- 选择"其他"时显示输入框（修复条件渲染） -->
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
            
            <!-- 用药史：多选 + 其他输入（修复功能） -->
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
              
              <!-- 选择"其他"时显示输入框（修复条件渲染） -->
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

        <!-- 血压血糖（完整实现） -->
        <el-tab-pane label="血压血糖">
          <el-descriptions :column="3" border size="small" class="form-container">
            <el-descriptions-item label="坐立血压（mmHg）">
              <el-input v-model="form.sitting_standing_blood_pressure" placeholder="请输入坐位、立位血压" />
            </el-descriptions-item>
            <el-descriptions-item label="24h动态血压（mmHg）">
              <el-input v-model="form.ambulatory_blood_pressure_24h" placeholder="请输入24h动态血压" />
            </el-descriptions-item>
            <el-descriptions-item label="高血压史">
              <el-select v-model="form.hypertension_history" placeholder="请选择">
                <el-option label="有" value="有" />
                <el-option label="无" value="无" />
              </el-select>
            </el-descriptions-item>
            <el-descriptions-item label="空腹血糖（mmol/L）">
              <el-input v-model="form.fasting_blood_glucose" placeholder="例：5.8mmol/L" />
            </el-descriptions-item>
            <el-descriptions-item label="餐后血糖（mmol/L）">
              <el-input v-model="form.postprandial_blood_glucose" placeholder="例：7.2mmol/L" />
            </el-descriptions-item>
            <el-descriptions-item label="糖化血红蛋白（%）">
              <el-input v-model="form.hba1c" placeholder="请输入糖化血红蛋白值" />
            </el-descriptions-item>
            <el-descriptions-item label="胰岛素（mU/L）">
              <el-input v-model="form.insulin" placeholder="请输入胰岛素值" />
            </el-descriptions-item>
            <el-descriptions-item label="C肽（ng/mL）">
              <el-input v-model="form.c_peptide" placeholder="请输入C肽值" />
            </el-descriptions-item>
            <el-descriptions-item label="低血糖编码">
              <el-input v-model="form.hypoglycemia_code" placeholder="请输入低血糖反应代码" />
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 血脂血尿酸（完整实现） -->
        <el-tab-pane label="血脂血尿酸">
          <el-descriptions :column="3" border size="small" class="form-container">
            <el-descriptions-item label="总胆固醇（mmol/L）">
              <el-input v-model="form.total_cholesterol" placeholder="请输入总胆固醇值" />
            </el-descriptions-item>
            <el-descriptions-item label="甘油三酯（mmol/L）">
              <el-input v-model="form.triglyceride" placeholder="请输入甘油三酯值" />
            </el-descriptions-item>
            <el-descriptions-item label="高密度脂蛋白（mmol/L）">
              <el-input v-model="form.hdl_cholesterol" placeholder="请输入高密度脂蛋白胆固醇值" />
            </el-descriptions-item>
            <el-descriptions-item label="低密度脂蛋白（mmol/L）">
              <el-input v-model="form.ldl_cholesterol" placeholder="请输入低密度脂蛋白胆固醇值" />
            </el-descriptions-item>
            <el-descriptions-item label="血尿酸（μmol/L）">
              <el-input v-model="form.blood_uric_acid" placeholder="请输入血尿酸值" />
            </el-descriptions-item>
            <el-descriptions-item label="血清肌酐（μmol/L）">
              <el-input v-model="form.serum_creatinine" placeholder="请输入血清肌酐值" />
            </el-descriptions-item>
            <el-descriptions-item label="尿微量白蛋白肌酐比（mg/g）" :span="3">
              <el-input v-model="form.urine_microalbumin_creatinine_ratio" placeholder="请输入尿微量白蛋白与肌酐比值" />
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 心血管检查（完整实现） -->
        <el-tab-pane label="心血管检查">
          <el-descriptions :column="3" border size="small" class="form-container">
            <el-descriptions-item label="肌钙蛋白（ng/mL）">
              <el-input v-model="form.troponin" placeholder="请输入肌钙蛋白值" />
            </el-descriptions-item>
            <el-descriptions-item label="左心室射血分数（%）">
              <el-input v-model="form.left_ventricular_ejection_fraction" placeholder="请输入左心室射血分数" />
            </el-descriptions-item>
            <el-descriptions-item label="动脉僵硬度（m/s）">
              <el-input v-model="form.arterial_stiffness" placeholder="请输入动脉僵硬度" />
            </el-descriptions-item>
            <el-descriptions-item label="下肢血管超声" :span="3">
              <el-input v-model="form.lower_limb_vascular_ultrasound" placeholder="请输入下肢血管彩超结果" />
            </el-descriptions-item>
            <el-descriptions-item label="腹部超声" :span="3">
              <el-input v-model="form.abdominal_ultrasound" placeholder="请输入腹部彩超结果" />
            </el-descriptions-item>
            <el-descriptions-item label="眼底检查" :span="3">
              <el-input v-model="form.fundus_examination" placeholder="请输入眼底检查结果" />
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 肺功能检查（完整实现） -->
        <el-tab-pane label="肺功能检查">
          <el-descriptions :column="3" border size="small" class="form-container">
            <el-descriptions-item label="FEV1（L）">
              <el-input v-model="form.fev1" placeholder="请输入第一秒用力呼气容积" />
            </el-descriptions-item>
            <el-descriptions-item label="FEV1/FVC比值（%）">
              <el-input v-model="form.fev1_fvc_ratio" placeholder="请输入第一秒用力呼气容积与用力肺活量百分比" />
            </el-descriptions-item>
            <el-descriptions-item label="呼气峰流速（L/s）">
              <el-input v-model="form.pef" placeholder="请输入峰流速" />
            </el-descriptions-item>
            <el-descriptions-item label="功能残气量（L）">
              <el-input v-model="form.frc" placeholder="请输入功能参气量" />
            </el-descriptions-item>
            <el-descriptions-item label="肺总量（L）">
              <el-input v-model="form.tlc" placeholder="请输入总肺活量" />
            </el-descriptions-item>
            <el-descriptions-item label="弥散量（mmol/min/kPa）">
              <el-input v-model="form.dlco" placeholder="请输入一氧化碳弥散量" />
            </el-descriptions-item>
            <el-descriptions-item label="DLCO/VA比值（mmol/min/kPa/L）">
              <el-input v-model="form.dlco_va_ratio" placeholder="请输入一氧化碳弥散量与肺泡通气量比值" />
            </el-descriptions-item>
            <el-descriptions-item label="血氧饱和度（%）">
              <el-input v-model="form.spo2" placeholder="请输入脉搏血氧饱和度" />
            </el-descriptions-item>
            <el-descriptions-item label="mMRC评分">
              <el-input v-model="form.mmrc_score" placeholder="请输入改良版英国医学研究委员会呼吸困难问卷评分" />
            </el-descriptions-item>
            <el-descriptions-item label="CAT评分" :span="3">
              <el-input v-model="form.cat_score" placeholder="请输入慢阻肺评估测试分数" />
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 生活习惯（完整实现） -->
        <el-tab-pane label="生活习惯">
          <el-descriptions :column="3" border size="small" class="form-container">
            <el-descriptions-item label="吸烟史">
              <el-select v-model="form.smoking_history" placeholder="请选择">
                <el-option label="有" value="有" />
                <el-option label="无" value="无" />
              </el-select>
            </el-descriptions-item>
            <el-descriptions-item label="开始吸烟年龄（岁）">
              <el-input v-model.number="form.smoking_start_age" placeholder="请输入开始吸烟年龄" />
            </el-descriptions-item>
            <el-descriptions-item label="戒烟年龄（岁）">
              <el-input v-model.number="form.smoking_quit_age" placeholder="请输入戒烟年龄" />
            </el-descriptions-item>
            <el-descriptions-item label="饮酒史">
              <el-select v-model="form.drinking_history" placeholder="请选择">
                <el-option label="有" value="有" />
                <el-option label="无" value="无" />
              </el-select>
            </el-descriptions-item>
            <el-descriptions-item label="运动方式">
              <el-input v-model="form.exercise_method" placeholder="请输入运动方式" />
            </el-descriptions-item>
            <el-descriptions-item label="运动时长（分钟）">
              <el-input v-model.number="form.exercise_duration" placeholder="请输入运动时长" />
            </el-descriptions-item>
            <el-descriptions-item label="每日主食（克）" :span="3">
              <el-input v-model.number="form.daily_staple_food" placeholder="请输入日主食量" />
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 诊疗方案（完整实现） -->
        <el-tab-pane label="诊疗方案">
          <el-descriptions :column="2" border size="small" class="form-container">
            <el-descriptions-item label="药物名称" :span="2">
              <el-input v-model="form.drug_name" placeholder="请输入药物名称" />
            </el-descriptions-item>
            <el-descriptions-item label="计划手术编码" :span="2">
              <el-input v-model="form.planned_operation_code" placeholder="请输入拟实施手术及操作编码" />
            </el-descriptions-item>
            <el-descriptions-item label="输血方法" :span="2">
              <el-input v-model="form.transfusion_method" placeholder="请输入输血方式" />
            </el-descriptions-item>
            <el-descriptions-item label="生活方式指导" :span="2">
              <el-input v-model="form.lifestyle_guidance" placeholder="请输入生活方式指导" type="textarea" :rows="2" />
            </el-descriptions-item>
            <el-descriptions-item label="用药指导" :span="2">
              <el-input v-model="form.medication_guidance" placeholder="请输入用药指导" type="textarea" :rows="2" />
            </el-descriptions-item>
            <el-descriptions-item label="费用（元）" :span="2">
              <el-input v-model.number="form.cost" placeholder="请输入治疗费用" />
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
import type { MedicalRecordForm, DiseaseCodeRes } from '@/api/doctor/types';

// 表单引用
const formRef = ref<InstanceType<typeof ElForm>>();
// 激活的标签页
const activeTab = ref('疾病诊断');

// 表单数据（诊断编码改为字符串，修复其他输入绑定）
const form = reactive<MedicalRecordForm>({
  user_id: 1001,
  name: '',
  age: 0,
  gender: '',
  id_card: '',
  phone: '',
  doctor_name: '',
  diagnosis_name_code: '', // 诊断编码（单选字符串）
  past_history: [],        // 既往史（多选数组）
  past_history_other: '',  // 既往史其他内容
  medication_history: [],  // 用药史（多选数组）
  medication_history_other: '', // 用药史其他内容
  
  // 其他字段初始化
  family_history: '',
  occupational_dust_exposure: '',
  environmental_risk_factors: '',
  sitting_standing_blood_pressure: '',
  ambulatory_blood_pressure_24h: '',
  hypertension_history: '',
  fasting_blood_glucose: '',
  postprandial_blood_glucose: '',
  hba1c: '',
  insulin: '',
  c_peptide: '',
  hypoglycemia_code: '',
  total_cholesterol: '',
  triglyceride: '',
  hdl_cholesterol: '',
  ldl_cholesterol: '',
  blood_uric_acid: '',
  serum_creatinine: '',
  urine_microalbumin_creatinine_ratio: '',
  troponin: '',
  left_ventricular_ejection_fraction: '',
  arterial_stiffness: '',
  lower_limb_vascular_ultrasound: '',
  abdominal_ultrasound: '',
  fundus_examination: '',
  fev1: '',
  fev1_fvc_ratio: '',
  pef: '',
  frc: '',
  tlc: '',
  dlco: '',
  dlco_va_ratio: '',
  spo2: '',
  mmrc_score: '',
  cat_score: '',
  smoking_history: '',
  smoking_start_age: 0,
  smoking_quit_age: 0,
  drinking_history: '',
  exercise_method: '',
  exercise_duration: 0,
  daily_staple_food: 0,
  drug_name: '',
  planned_operation_code: '',
  transfusion_method: '',
  lifestyle_guidance: '',
  medication_guidance: '',
  cost: 0,
  blood_type: '',
  heart_rate: '',
  bmi: ''
});

// 表单验证规则（诊断编码改为单选验证）
const rules = reactive({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  id_card: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  doctor_name: [{ required: true, message: '请输入医生姓名', trigger: 'blur' }],
  diagnosis_name_code: [{ required: true, message: '请选择诊断编码', trigger: 'change' }], // 单选验证
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }]
});

// 初始化获取疾病编码
onMounted(async () => {
  try {
    const res: DiseaseCodeRes = await getDiseaseCodes();
    console.log('疾病编码数据', res.data);
  } catch (error) {
    console.error('获取疾病编码失败', error);
  }
});

// 身份证号解析
const handleIdCardChange = (val: string) => {
  if (val.length === 18) {
    const genderCode = val.substring(16, 17);
    form.gender = parseInt(genderCode) % 2 === 1 ? '男' : '女';
    const birthYear = parseInt(val.substring(6, 10));
    form.age = new Date().getFullYear() - birthYear;
  }
};

// 既往史变化时处理（移除其他选项时清空输入框）
const handlePastHistoryChange = (values: string[]) => {
  if (!values.includes('其他')) {
    form.past_history_other = '';
  }
};

// 用药史变化时处理（移除其他选项时清空输入框）
const handleMedicationHistoryChange = (values: string[]) => {
  if (!values.includes('其他')) {
    form.medication_history_other = '';
  }
};

// 提交表单（修复其他内容处理逻辑）
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    
    // 处理既往史其他内容
    const pastHistory = [...form.past_history];
    if (pastHistory.includes('其他') && form.past_history_other) {
      // 替换"其他"为输入内容
      const index = pastHistory.indexOf('其他');
      pastHistory.splice(index, 1, form.past_history_other);
    }
    
    // 处理用药史其他内容
    const medicationHistory = [...form.medication_history];
    if (medicationHistory.includes('其他') && form.medication_history_other) {
      const index = medicationHistory.indexOf('其他');
      medicationHistory.splice(index, 1, form.medication_history_other);
    }
    
    // 构造提交数据
    const submitData = {
      ...form,
      past_history: pastHistory,
      medication_history: medicationHistory
    };
    // 删除临时字段
    delete submitData.past_history_other;
    delete submitData.medication_history_other;
    
    // 提交
    await addMedicalRecord(submitData);
    ElMessage.success('医疗记录提交成功');
    handleReset();
  } catch (error) {
    ElMessage.error('提交失败，请检查表单数据');
    console.error(error);
  }
};

// 重置表单（确保其他输入框清空）
const handleReset = () => {
  formRef.value?.resetFields();
  form.diagnosis_name_code = '';
  form.past_history = [];
  form.medication_history = [];
  form.past_history_other = '';
  form.medication_history_other = '';
  activeTab.value = '疾病诊断';
};
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
</style>
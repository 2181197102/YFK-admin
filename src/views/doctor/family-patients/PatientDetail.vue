<template>
  <div class="patient-detail-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-page-header @back="handleBack">
        <template #content>
          <span class="page-title">患者病历详情</span>
        </template>
      </el-page-header>
    </div>

    <!-- 全局加载 -->
    <div v-if="loading" class="loading-container">
      <el-loading text="正在加载患者详情..." />
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-else-if="errorMsg"
      type="error"
      :message="errorMsg"
      show-icon
      style="margin: 20px 0"
      @close="errorMsg = ''"
    />

    <!-- 详情内容 -->
    <div v-else-if="recordData" class="detail-content">
      <!-- 1. 患者概要信息卡片 -->
      <el-card class="summary-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">患者概要信息</span>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="患者姓名">
            <el-tag type="primary" size="large">{{ recordData.patient_basic_info.name }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ recordData.patient_basic_info.gender }}
          </el-descriptions-item>
          <el-descriptions-item label="年龄">
            {{ recordData.patient_basic_info.age }} 岁
          </el-descriptions-item>
          <el-descriptions-item label="身份证号" :span="2">
            {{ recordData.patient_basic_info.id_card }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ recordData.patient_basic_info.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="所在机构" :span="2">
            <el-tag type="success">{{ recordData.institution_name }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="机构ID">
            {{ recordData.institution_id }}
          </el-descriptions-item>
          <el-descriptions-item label="病历编号" :span="3">
            <el-tag type="warning">{{ recordData.medical_record_num }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 2. 医生和疾病信息 -->
      <el-card class="info-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">诊疗信息</span>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="主治医生">
            {{ recordData.doctor_info.doctor_name }}
          </el-descriptions-item>
          <el-descriptions-item label="医生编号">
            {{ recordData.doctor_info.doctor_code }}
          </el-descriptions-item>
          <el-descriptions-item label="疾病代码">
            {{ recordData.disease_info.disease_code }}
          </el-descriptions-item>
          <el-descriptions-item label="诊断名称">
            {{ recordData.patient_record_data.diagnosis_name_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(recordData.disease_info.created_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDateTime(recordData.disease_info.updated_time) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 3. 详细病历数据 -->
      <el-card class="data-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">详细病历数据</span>
            <el-button type="primary" size="small" @click="showFullData = !showFullData">
              {{ showFullData ? '收起' : '展开全部' }}
            </el-button>
          </div>
        </template>

        <el-collapse v-model="activeCategories" accordion>
          <!-- 基本生命体征 -->
          <el-collapse-item title="基本生命体征" name="vital">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="血型">{{ recordData.patient_record_data.blood_type || '-' }}</el-descriptions-item>
              <el-descriptions-item label="BMI">{{ recordData.patient_record_data.bmi || '-' }}</el-descriptions-item>
              <el-descriptions-item label="腰围(cm)">{{ recordData.patient_record_data.waist_circumference || '-' }}</el-descriptions-item>
              <el-descriptions-item label="心率(次/分)">{{ recordData.patient_record_data.heart_rate || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 血压相关 -->
          <el-collapse-item title="血压相关" name="blood_pressure">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="坐立血压">{{ recordData.patient_record_data.sitting_standing_blood_pressure || '-' }}</el-descriptions-item>
              <el-descriptions-item label="24小时动态血压">{{ recordData.patient_record_data.ambulatory_blood_pressure_24h || '-' }}</el-descriptions-item>
              <el-descriptions-item label="高血压史" :span="2">{{ recordData.patient_record_data.hypertension_history || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 血糖血脂 -->
          <el-collapse-item title="血糖血脂" name="glucose_lipid">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="空腹血糖(mmol/L)">{{ recordData.patient_record_data.fasting_blood_glucose || '-' }}</el-descriptions-item>
              <el-descriptions-item label="餐后血糖(mmol/L)">{{ recordData.patient_record_data.postprandial_blood_glucose || '-' }}</el-descriptions-item>
              <el-descriptions-item label="糖化血红蛋白(%)">{{ recordData.patient_record_data.hba1c || '-' }}</el-descriptions-item>
              <el-descriptions-item label="胰岛素">{{ recordData.patient_record_data.insulin || '-' }}</el-descriptions-item>
              <el-descriptions-item label="C肽">{{ recordData.patient_record_data.c_peptide || '-' }}</el-descriptions-item>
              <el-descriptions-item label="低血糖编码">{{ recordData.patient_record_data.hypoglycemia_code || '-' }}</el-descriptions-item>
              <el-descriptions-item label="总胆固醇(mmol/L)">{{ recordData.patient_record_data.total_cholesterol || '-' }}</el-descriptions-item>
              <el-descriptions-item label="甘油三酯(mmol/L)">{{ recordData.patient_record_data.triglyceride || '-' }}</el-descriptions-item>
              <el-descriptions-item label="HDL胆固醇(mmol/L)">{{ recordData.patient_record_data.hdl_cholesterol || '-' }}</el-descriptions-item>
              <el-descriptions-item label="LDL胆固醇(mmol/L)">{{ recordData.patient_record_data.ldl_cholesterol || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 肾功能 -->
          <el-collapse-item title="肾功能" name="kidney">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="血尿酸(μmol/L)">{{ recordData.patient_record_data.blood_uric_acid || '-' }}</el-descriptions-item>
              <el-descriptions-item label="血清肌酐(μmol/L)">{{ recordData.patient_record_data.serum_creatinine || '-' }}</el-descriptions-item>
              <el-descriptions-item label="尿微量白蛋白肌酐比" :span="2">{{ recordData.patient_record_data.urine_microalbumin_creatinine_ratio || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 心血管检查 -->
          <el-collapse-item title="心血管检查" name="cardiovascular">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="肌钙蛋白">{{ recordData.patient_record_data.troponin || '-' }}</el-descriptions-item>
              <el-descriptions-item label="左心室射血分数(%)">{{ recordData.patient_record_data.left_ventricular_ejection_fraction || '-' }}</el-descriptions-item>
              <el-descriptions-item label="动脉僵硬度">{{ recordData.patient_record_data.arterial_stiffness || '-' }}</el-descriptions-item>
              <el-descriptions-item label="下肢血管超声">{{ recordData.patient_record_data.lower_limb_vascular_ultrasound || '-' }}</el-descriptions-item>
              <el-descriptions-item label="腹部超声">{{ recordData.patient_record_data.abdominal_ultrasound || '-' }}</el-descriptions-item>
              <el-descriptions-item label="眼底检查">{{ recordData.patient_record_data.fundus_examination || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 肺功能 -->
          <el-collapse-item title="肺功能" name="pulmonary">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="FEV1(L)">{{ recordData.patient_record_data.fev1 || '-' }}</el-descriptions-item>
              <el-descriptions-item label="FEV1/FVC比值(%)">{{ recordData.patient_record_data.fev1_fvc_ratio || '-' }}</el-descriptions-item>
              <el-descriptions-item label="PEF(L/min)">{{ recordData.patient_record_data.pef || '-' }}</el-descriptions-item>
              <el-descriptions-item label="FRC(L)">{{ recordData.patient_record_data.frc || '-' }}</el-descriptions-item>
              <el-descriptions-item label="TLC(L)">{{ recordData.patient_record_data.tlc || '-' }}</el-descriptions-item>
              <el-descriptions-item label="DLCO">{{ recordData.patient_record_data.dlco || '-' }}</el-descriptions-item>
              <el-descriptions-item label="DLCO/VA比值">{{ recordData.patient_record_data.dlco_va_ratio || '-' }}</el-descriptions-item>
              <el-descriptions-item label="SpO2(%)">{{ recordData.patient_record_data.spo2 || '-' }}</el-descriptions-item>
              <el-descriptions-item label="mMRC评分">{{ recordData.patient_record_data.mmrc_score || '-' }}</el-descriptions-item>
              <el-descriptions-item label="CAT评分">{{ recordData.patient_record_data.cat_score || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 生活习惯 -->
          <el-collapse-item title="生活习惯" name="lifestyle">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="吸烟史">{{ recordData.patient_record_data.smoking_history || '-' }}</el-descriptions-item>
              <el-descriptions-item label="开始吸烟年龄">{{ recordData.patient_record_data.smoking_start_age || '-' }}</el-descriptions-item>
              <el-descriptions-item label="戒烟年龄">{{ recordData.patient_record_data.smoking_quit_age || '-' }}</el-descriptions-item>
              <el-descriptions-item label="饮酒史">{{ recordData.patient_record_data.drinking_history || '-' }}</el-descriptions-item>
              <el-descriptions-item label="运动方式">{{ recordData.patient_record_data.exercise_method || '-' }}</el-descriptions-item>
              <el-descriptions-item label="运动时长(分钟/天)">{{ recordData.patient_record_data.exercise_duration || '-' }}</el-descriptions-item>
              <el-descriptions-item label="每日主食(g)" :span="2">{{ recordData.patient_record_data.daily_staple_food || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 病史信息 -->
          <el-collapse-item title="病史信息" name="history">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="既往史">{{ recordData.patient_record_data.past_history || '-' }}</el-descriptions-item>
              <el-descriptions-item label="家族史">{{ recordData.patient_record_data.family_history || '-' }}</el-descriptions-item>
              <el-descriptions-item label="用药史">{{ recordData.patient_record_data.medication_history || '-' }}</el-descriptions-item>
              <el-descriptions-item label="职业粉尘暴露">{{ recordData.patient_record_data.occupational_dust_exposure || '-' }}</el-descriptions-item>
              <el-descriptions-item label="环境危险因素">{{ recordData.patient_record_data.environmental_risk_factors || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 诊疗方案 -->
          <el-collapse-item title="诊疗方案" name="treatment">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="药物名称" :span="2">{{ recordData.patient_record_data.drug_name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="计划手术编码">{{ recordData.patient_record_data.planned_operation_code || '-' }}</el-descriptions-item>
              <el-descriptions-item label="输血方法">{{ recordData.patient_record_data.transfusion_method || '-' }}</el-descriptions-item>
              <el-descriptions-item label="费用(元)">{{ recordData.patient_record_data.cost || '-' }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ formatDateTime(recordData.patient_record_data.created_time) }}</el-descriptions-item>
              <el-descriptions-item label="生活方式指导" :span="2">{{ recordData.patient_record_data.lifestyle_guidance || '-' }}</el-descriptions-item>
              <el-descriptions-item label="用药指导" :span="2">{{ recordData.patient_record_data.medication_guidance || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getPatientDetail } from '@/api/doctor/doctor';
import type { PatientDetailResponse } from '@/api/doctor/types';

// 路由实例
const router = useRouter();
const route = useRoute();

// -------------------------- 状态管理 --------------------------
const loading = ref<boolean>(true);
const errorMsg = ref<string>('');
const recordData = ref<PatientDetailResponse['data'] | null>(null);
const activeCategories = ref<string>('vital');
const showFullData = ref<boolean>(false);

// -------------------------- 工具函数 --------------------------
/**
 * 格式化日期时间
 */
const formatDateTime = (utcTime: string): string => {
  if (!utcTime) return '-';
  const date = new Date(utcTime);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// -------------------------- 页面交互 --------------------------
/**
 * 返回上一页
 */
const handleBack = () => {
  router.back();
};

// -------------------------- API 请求 --------------------------
/**
 * 获取患者详细信息（根据病历号查询当前机构的病历）
 */
const fetchPatientDetail = async (medicalRecordNum: string) => {
  try {
    loading.value = true;
    errorMsg.value = '';
    console.log('开始请求患者详情，病历号：', medicalRecordNum);

    const response: PatientDetailResponse = await getPatientDetail(medicalRecordNum);
    console.log('后端返回患者详情数据：', response);

    if (response?.code === 200 && response.data) {
      recordData.value = response.data;
      ElMessage.success('成功加载病历详情');
    } else {
      errorMsg.value = `获取数据失败：${response?.msg || '未知错误'}`;
      ElMessage.error(errorMsg.value);
    }
  } catch (err) {
    const error = err as Error;
    errorMsg.value = `请求失败：${error.message}`;
    ElMessage.error(errorMsg.value);
    console.error('获取患者详情错误：', error);
  } finally {
    loading.value = false;
  }
};

// -------------------------- 页面初始化 --------------------------
onMounted(() => {
  // 从路由参数获取病历号
  const medicalRecordNum = route.params.medicalRecordNum as string;

  if (medicalRecordNum) {
    fetchPatientDetail(medicalRecordNum);
  } else {
    errorMsg.value = '缺少病历号参数';
    ElMessage.error('未找到病历号，请返回列表页');
  }
});
</script>

<style scoped lang="scss">
.patient-detail-container {
  padding: 24px;
  max-width: 1800px;
  margin: 0 auto;
  background-color: #f9fafb;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.detail-content {
  .summary-card,
  .info-card,
  .data-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .card-title {
      font-size: 16px;
      font-weight: 500;
      color: #374151;
    }
  }
}

.el-collapse {
  border: none;
  
  :deep(.el-collapse-item__header) {
    background-color: #f8fafc;
    padding-left: 16px;
    font-weight: 500;
    color: #374151;
  }
  
  :deep(.el-collapse-item__content) {
    padding: 16px;
  }
}

// 响应式适配
@media (max-width: 1200px) {
  .patient-detail-container {
    padding: 16px;
  }
}
</style>

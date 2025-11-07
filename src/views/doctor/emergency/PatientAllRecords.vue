<template>
  <div class="patient-all-records-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>患者全病历查看</h2>
      <el-button @click="handleBack" style="margin-left: auto;">返回列表</el-button>
    </div>

    <!-- 全局加载遮罩 -->
    <el-loading v-if="globalLoading" fullscreen text="正在加载患者全部病历数据..."></el-loading>

    <!-- 错误提示 -->
    <el-alert
      v-else-if="errorMsg"
      type="error"
      :message="errorMsg"
      show-icon
      style="margin-bottom: 16px"
      @close="errorMsg = ''"
    ></el-alert>

    <!-- 数据展示区 -->
    <div v-else class="page-content">
      <!-- 1. 概览信息卡片 -->
      <el-card class="overview-card" shadow="hover" style="margin-bottom: 20px">
        <template #header>
          <span class="card-title">患者病历概览</span>
        </template>
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="overview-item">
              <div class="overview-label">患者姓名</div>
              <div class="overview-value">{{ patientName }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="overview-item">
              <div class="overview-label">身份证号</div>
              <div class="overview-value">{{ patientIdCard }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="overview-item">
              <div class="overview-label">病历总数</div>
              <div class="overview-value highlight">{{ allRecordsData?.total_records || 0 }} 条</div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top: 16px">
          <el-col :span="8">
            <div class="overview-item">
              <div class="overview-label">涉及机构数</div>
              <div class="overview-value">{{ allRecordsData?.total_institutions || 0 }} 个</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="overview-item">
              <div class="overview-label">当前医生姓名</div>
              <div class="overview-value">{{ allRecordsData?.current_doctor?.doctor_name || '-' }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="overview-item">
              <div class="overview-label">您的病历数</div>
              <div class="overview-value highlight-primary">
                {{ allRecordsData?.current_doctor_total_records || 0 }} 条
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 2. 按机构分组展示病历 -->
      <el-collapse v-model="activeInstitutions" accordion>
        <el-collapse-item
          v-for="institution in displayedInstitutions"
          :key="institution.institution_id"
          :name="institution.institution_id"
        >
          <template #title>
            <div class="institution-header">
              <span class="institution-name">
                {{ institution.institution_name }}
                <el-tag
                  v-if="institution.is_current_doctor_institution"
                  type="success"
                  size="small"
                  style="margin-left: 8px"
                >
                  当前医生所属
                </el-tag>
              </span>
              <span class="institution-stats">
                共 {{ institution.records_count }} 条病历
                <span v-if="institution.current_doctor_records_count > 0" class="current-doctor-count">
                  （您的：{{ institution.current_doctor_records_count }} 条）
                </span>
              </span>
            </div>
          </template>

          <!-- 机构内的病历列表 -->
          <div class="records-container">
            <el-card
              v-for="record in institution.records"
              :key="record.medical_record_num"
              class="record-card"
              :class="{ 'current-doctor-record': record.is_current_doctor_record }"
              shadow="hover"
            >
              <!-- 病历头部信息 -->
              <div class="record-header">
                <div class="record-title">
                  <span class="record-num">病历号：{{ record.medical_record_num }}</span>
                  <el-tag
                    v-if="record.is_current_doctor_record"
                    type="primary"
                    size="small"
                    style="margin-left: 8px"
                  >
                    您的病历
                  </el-tag>
                </div>
                <div class="record-meta">
                  <span>医生：{{ record.doctor_info.doctor_name }}</span>
                  <span style="margin-left: 16px">
                    创建时间：{{ formatDateTime(record.record_time.created_time) }}
                  </span>
                </div>
              </div>

              <!-- 病历核心数据展示 -->
              <el-divider style="margin: 16px 0" />
              <el-tabs type="border-card">
                <!-- 基本信息 -->
                <el-tab-pane label="基本信息">
                  <el-descriptions :column="3" border size="small">
                    <el-descriptions-item label="患者姓名">
                      {{ record.patient_basic_info.name }}
                    </el-descriptions-item>
                    <el-descriptions-item label="年龄">
                      {{ record.patient_basic_info.age }}
                    </el-descriptions-item>
                    <el-descriptions-item label="性别">
                      {{ record.patient_basic_info.gender }}
                    </el-descriptions-item>
                    <el-descriptions-item label="身份证号">
                      {{ record.patient_basic_info.id_card }}
                    </el-descriptions-item>
                    <el-descriptions-item label="联系电话">
                      {{ record.patient_basic_info.phone }}
                    </el-descriptions-item>
                    <el-descriptions-item label="血型">
                      {{ record.patient_record_data.blood_type || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="BMI">
                      {{ record.patient_record_data.bmi || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="腰围">
                      {{ record.patient_record_data.waist_circumference || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="心率">
                      {{ record.patient_record_data.heart_rate || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 疾病信息 -->
                <el-tab-pane label="疾病诊断">
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="疾病代码">
                      {{ record.disease_info.disease_code }}
                    </el-descriptions-item>
                    <el-descriptions-item label="诊断名称编码">
                      {{ record.patient_record_data.diagnosis_name_code || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="既往史" :span="2">
                      {{ record.patient_record_data.past_history || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="家族史" :span="2">
                      {{ record.patient_record_data.family_history || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="用药史" :span="2">
                      {{ record.patient_record_data.medication_history || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="职业粉尘暴露" :span="2">
                      {{ record.patient_record_data.occupational_dust_exposure || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="环境危险因素" :span="2">
                      {{ record.patient_record_data.environmental_risk_factors || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 血压血糖 -->
                <el-tab-pane label="血压血糖">
                  <el-descriptions :column="3" border size="small">
                    <el-descriptions-item label="坐立血压">
                      {{ record.patient_record_data.sitting_standing_blood_pressure || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="24h动态血压">
                      {{ record.patient_record_data.ambulatory_blood_pressure_24h || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="高血压史">
                      {{ record.patient_record_data.hypertension_history || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="空腹血糖">
                      {{ record.patient_record_data.fasting_blood_glucose || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="餐后血糖">
                      {{ record.patient_record_data.postprandial_blood_glucose || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="糖化血红蛋白">
                      {{ record.patient_record_data.hba1c || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="胰岛素">
                      {{ record.patient_record_data.insulin || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="C肽">
                      {{ record.patient_record_data.c_peptide || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="低血糖编码">
                      {{ record.patient_record_data.hypoglycemia_code || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 血脂血尿酸 -->
                <el-tab-pane label="血脂血尿酸">
                  <el-descriptions :column="3" border size="small">
                    <el-descriptions-item label="总胆固醇">
                      {{ record.patient_record_data.total_cholesterol || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="甘油三酯">
                      {{ record.patient_record_data.triglyceride || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="高密度脂蛋白">
                      {{ record.patient_record_data.hdl_cholesterol || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="低密度脂蛋白">
                      {{ record.patient_record_data.ldl_cholesterol || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="血尿酸">
                      {{ record.patient_record_data.blood_uric_acid || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="血清肌酐">
                      {{ record.patient_record_data.serum_creatinine || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="尿微量白蛋白肌酐比" :span="3">
                      {{ record.patient_record_data.urine_microalbumin_creatinine_ratio || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 心血管检查 -->
                <el-tab-pane label="心血管检查">
                  <el-descriptions :column="3" border size="small">
                    <el-descriptions-item label="肌钙蛋白">
                      {{ record.patient_record_data.troponin || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="左心室射血分数">
                      {{ record.patient_record_data.left_ventricular_ejection_fraction || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="动脉僵硬度">
                      {{ record.patient_record_data.arterial_stiffness || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="下肢血管超声" :span="3">
                      {{ record.patient_record_data.lower_limb_vascular_ultrasound || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="腹部超声" :span="3">
                      {{ record.patient_record_data.abdominal_ultrasound || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="眼底检查" :span="3">
                      {{ record.patient_record_data.fundus_examination || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 肺功能检查 -->
                <el-tab-pane label="肺功能检查">
                  <el-descriptions :column="3" border size="small">
                    <el-descriptions-item label="FEV1">
                      {{ record.patient_record_data.fev1 || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="FEV1/FVC比值">
                      {{ record.patient_record_data.fev1_fvc_ratio || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="呼气峰流速">
                      {{ record.patient_record_data.pef || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="功能残气量">
                      {{ record.patient_record_data.frc || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="肺总量">
                      {{ record.patient_record_data.tlc || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="弥散量">
                      {{ record.patient_record_data.dlco || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="DLCO/VA比值">
                      {{ record.patient_record_data.dlco_va_ratio || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="血氧饱和度">
                      {{ record.patient_record_data.spo2 || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="mMRC评分">
                      {{ record.patient_record_data.mmrc_score || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="CAT评分" :span="3">
                      {{ record.patient_record_data.cat_score || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 生活习惯 -->
                <el-tab-pane label="生活习惯">
                  <el-descriptions :column="3" border size="small">
                    <el-descriptions-item label="吸烟史">
                      {{ record.patient_record_data.smoking_history || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="开始吸烟年龄">
                      {{ record.patient_record_data.smoking_start_age || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="戒烟年龄">
                      {{ record.patient_record_data.smoking_quit_age || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="饮酒史">
                      {{ record.patient_record_data.drinking_history || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="运动方式">
                      {{ record.patient_record_data.exercise_method || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="运动时长(分钟)">
                      {{ record.patient_record_data.exercise_duration || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="每日主食(克)" :span="3">
                      {{ record.patient_record_data.daily_staple_food || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 诊疗方案 -->
                <el-tab-pane label="诊疗方案">
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="药物名称" :span="2">
                      {{ record.patient_record_data.drug_name || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="计划手术编码" :span="2">
                      {{ record.patient_record_data.planned_operation_code || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="输血方法" :span="2">
                      {{ record.patient_record_data.transfusion_method || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="生活方式指导" :span="2">
                      {{ record.patient_record_data.lifestyle_guidance || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="用药指导" :span="2">
                      {{ record.patient_record_data.medication_guidance || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="费用(元)" :span="2">
                      {{ record.patient_record_data.cost || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </div>
        </el-collapse-item>
      </el-collapse>

      <!-- 3. 查看其他机构病历按钮（仅当有其他机构病历且未解锁时显示） -->
      <div 
        v-if="hasOtherInstitutions && !showAllInstitutions" 
        class="view-more-section"
        style="margin-top: 24px; text-align: center"
      >
        <el-alert
          type="warning"
          :closable="false"
          style="margin-bottom: 16px"
        >
          <template #title>
            <span style="font-size: 14px">
              检测到该患者在其他 {{ otherInstitutionsCount }} 个机构有 {{ otherInstitutionsRecordsCount }} 条病历记录
            </span>
          </template>
        </el-alert>
        <el-button
          type="primary"
          size="large"
          @click="showPasswordDialog = true"
          :icon="Lock"
        >
          查看其他机构病历
        </el-button>
      </div>
    </div>

    <!-- 验证码对话框（引入可插拔组件） -->
    <InstitutionAccessDialog
      v-model="showPasswordDialog"
      :patient-name="patientName"
      :patient-phone="patientPhone"
      @verified="handleAccessVerified"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Lock } from '@element-plus/icons-vue';
import { getPatientAllRecords } from '@/api/doctor/doctor';
import type { PatientAllRecordsResponse, InstitutionAllRecords } from '@/api/doctor/types';
import InstitutionAccessDialog from '@/components/InstitutionAccessDialog/InstitutionAccessDialog.vue';

// 路由实例
const router = useRouter();
const route = useRoute();

// Props 接收
const patientIdCard = ref<string>(route.params.patientIdCard as string);
const patientName = ref<string>(route.query.patientName as string);
const patientPhone = ref<string>(''); // 患者手机号（从病历数据中获取）

// 状态管理
const globalLoading = ref<boolean>(true);
const errorMsg = ref<string>('');
const allRecordsData = ref<PatientAllRecordsResponse['data'] | null>(null);
const activeInstitutions = ref<number>(0);

// 权限控制相关状态
const showAllInstitutions = ref<boolean>(false); // 是否显示所有机构
const showPasswordDialog = ref<boolean>(false); // 是否显示验证码对话框

// 计算属性：根据权限过滤显示的机构
const displayedInstitutions = computed<InstitutionAllRecords[]>(() => {
  if (!allRecordsData.value?.institution_records) return [];
  
  // 如果已解锁，显示所有机构
  if (showAllInstitutions.value) {
    return allRecordsData.value.institution_records;
  }
  
  // 默认只显示当前医生所属的机构
  return allRecordsData.value.institution_records.filter(
    institution => institution.is_current_doctor_institution
  );
});

// 计算属性：是否有其他机构的病历
const hasOtherInstitutions = computed<boolean>(() => {
  if (!allRecordsData.value?.institution_records) return false;
  
  return allRecordsData.value.institution_records.some(
    institution => !institution.is_current_doctor_institution
  );
});

// 计算属性：其他机构数量
const otherInstitutionsCount = computed<number>(() => {
  if (!allRecordsData.value?.institution_records) return 0;
  
  return allRecordsData.value.institution_records.filter(
    institution => !institution.is_current_doctor_institution
  ).length;
});

// 计算属性：其他机构病历总数
const otherInstitutionsRecordsCount = computed<number>(() => {
  if (!allRecordsData.value?.institution_records) return 0;
  
  return allRecordsData.value.institution_records
    .filter(institution => !institution.is_current_doctor_institution)
    .reduce((sum, institution) => sum + institution.records_count, 0);
});

// 工具函数：格式化时间
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

// 加载全病历数据
const loadAllRecords = async () => {
  try {
    globalLoading.value = true;
    console.log('开始请求患者全病历数据，身份证号：', patientIdCard.value);

    const response = await getPatientAllRecords(patientIdCard.value);
    console.log('后端返回全病历数据：', response);

    if (response?.code === 200 && response.data) {
      allRecordsData.value = response.data;
      
      // 默认展开第一个机构
      if (allRecordsData.value.institution_records.length > 0) {
        activeInstitutions.value = allRecordsData.value.institution_records[0].institution_id;
      }

      // 获取患者手机号（从第一条病历中获取）
      if (allRecordsData.value.institution_records.length > 0) {
        const firstInstitution = allRecordsData.value.institution_records[0];
        if (firstInstitution.records.length > 0) {
          const firstRecord = firstInstitution.records[0];
          patientPhone.value = firstRecord.patient_basic_info.phone || '';
          console.log('获取到患者手机号：', patientPhone.value);
        }
      }

      ElMessage.success(
        `成功加载${allRecordsData.value.total_records}条病历（涉及${allRecordsData.value.total_institutions}个机构）`
      );
    } else {
      errorMsg.value = `加载失败：${response?.msg || '未知错误'}`;
      ElMessage.error(errorMsg.value);
    }
  } catch (err) {
    const error = err as Error;
    errorMsg.value = `请求失败：${error.message}`;
    ElMessage.error(errorMsg.value);
    console.error('请求错误详情：', error);
  } finally {
    globalLoading.value = false;
  }
};

// 验证码验证成功的回调
const handleAccessVerified = () => {
  showAllInstitutions.value = true;
  
  // 自动展开第一个其他机构
  const firstOtherInstitution = allRecordsData.value?.institution_records.find(
    inst => !inst.is_current_doctor_institution
  );
  if (firstOtherInstitution) {
    activeInstitutions.value = firstOtherInstitution.institution_id;
  }
};

// 返回列表
const handleBack = () => {
  router.back();
};

// 页面初始化
onMounted(() => {
  if (!patientIdCard.value) {
    errorMsg.value = '缺少患者身份证号参数';
    globalLoading.value = false;
    return;
  }
  loadAllRecords();
});
</script>

<style scoped lang="scss">
.patient-all-records-page {
  padding: 24px;
  max-width: 1800px;
  margin: 0 auto;
  background-color: #f9fafb;
  min-height: 100vh;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 28px;
  
  h2 {
    color: #1f2937;
    font-size: 20px;
    font-weight: 600;
  }
}

.overview-card {
  .card-title {
    font-size: 16px;
    color: #374151;
    font-weight: 500;
  }

  .overview-item {
    padding: 12px 0;

    .overview-label {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .overview-value {
      font-size: 18px;
      color: #1f2937;
      font-weight: 500;

      &.highlight {
        color: #f59e0b;
        font-size: 20px;
      }

      &.highlight-primary {
        color: #3b82f6;
        font-size: 20px;
      }
    }
  }
}

.institution-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 32px;

  .institution-name {
    font-size: 16px;
    font-weight: 500;
    color: #1f2937;
  }

  .institution-stats {
    font-size: 14px;
    color: #6b7280;

    .current-doctor-count {
      color: #3b82f6;
      font-weight: 500;
    }
  }
}

.records-container {
  padding: 16px 0;
}

.record-card {
  margin-bottom: 16px;
  border-left: 4px solid #e5e7eb;

  &.current-doctor-record {
    border-left-color: #3b82f6;
    background-color: #f0f9ff;
  }

  .record-header {
    .record-title {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      .record-num {
        font-size: 15px;
        font-weight: 500;
        color: #1f2937;
      }
    }

    .record-meta {
      font-size: 13px;
      color: #6b7280;
    }
  }
}

:deep(.el-collapse-item__header) {
  height: 60px;
  line-height: 60px;
  font-size: 15px;
}

:deep(.el-descriptions__label) {
  width: 140px;
  background-color: #f8fafc;
  font-weight: 500;
}

:deep(.el-descriptions__content) {
  color: #1f2937;
}

:deep(.el-tabs--border-card) {
  border: none;
  box-shadow: none;
}

.view-more-section {
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .el-button {
    padding: 14px 32px;
    font-size: 15px;
  }
}

:deep(.el-dialog) {
  border-radius: 8px;

  .el-dialog__header {
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 16px;
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-form-item__label {
    font-weight: 500;
  }
}

@media (max-width: 1200px) {
  .patient-all-records-page {
    padding: 16px;
  }

  .overview-card {
    :deep(.el-col) {
      margin-bottom: 12px;
    }
  }

  .view-more-section {
    padding: 16px;
  }
}
</style>


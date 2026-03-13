<template>
  <div class="patient-all-records-page">
    <!-- 页面标题 + 身份证号输入 + 返回按钮 -->
    <div class="page-header">
      <h2>患者全病历查看</h2>
      <el-input
        v-model="inputIdCard"
        placeholder="请输入患者身份证号"
        style="width: 280px; margin-left: 20px"
        clearable
        maxlength="18"
      />
      <el-button 
        type="primary" 
        @click="handleQuery"
        style="margin-left: 12px"
        :disabled="!inputIdCard"
      >
        查询
      </el-button>
      <el-button @click="handleBack" style="margin-left: auto;">返回列表</el-button>
    </div>

    <!-- 全局加载遮罩 -->
    <el-loading v-if="globalLoading" fullscreen text="正在加载患者信息..."></el-loading>

    <!-- 错误提示 -->
    <el-alert
      v-else-if="errorMsg"
      type="error"
      :message="errorMsg"
      show-icon
      style="margin-bottom: 16px"
      @close="errorMsg = ''"
    ></el-alert>

    <!-- 数据展示区：验证通过后显示（折线图+病历内容同屏） -->
    <div v-else-if="showAllData" class="page-content">
      <!-- 健康数据折线图（验证通过后显示，与病历同屏） -->
      <el-card class="chart-card" shadow="hover" style="margin-bottom: 20px">
        <template #header>
          <span class="card-title">24小时心率/血压趋势图</span>
        </template>
        <div class="chart-container">
          <el-loading v-if="chartLoading" text="加载图表数据中...">
            <div class="chart-placeholder"></div>
          </el-loading>
          <div v-else-if="!chartData || chartData.length === 0" class="chart-empty">
            暂无24小时健康数据可展示
          </div>
          <div v-else ref="chartRef" class="chart-dom"></div>
        </div>
      </el-card>

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
              <div class="overview-value">{{ formatIdCard(patientIdCard) }}</div>
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
                    <el-descriptions-item label="患者姓名">{{ record.patient_basic_info.name }}</el-descriptions-item>
                    <el-descriptions-item label="年龄">{{ record.patient_basic_info.age }}</el-descriptions-item>
                    <el-descriptions-item label="性别">{{ record.patient_basic_info.gender }}</el-descriptions-item>
                    <el-descriptions-item label="身份证号">{{ record.patient_basic_info.id_card }}</el-descriptions-item>
                    <el-descriptions-item label="联系电话">{{ record.patient_basic_info.phone }}</el-descriptions-item>
                    <el-descriptions-item label="血型">{{ record.patient_record_data.blood_type || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="BMI（kg/m²）">{{ record.patient_record_data.bmi || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="腰围（cm）">{{ record.patient_record_data.waist_circumference || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="心率（次/分）">{{ record.patient_record_data.heart_rate || '-' }}</el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 疾病信息 -->
                <el-tab-pane label="疾病诊断">
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="疾病代码">{{ record.disease_info.disease_code }}</el-descriptions-item>
                    <el-descriptions-item label="诊断名称编码">{{ record.patient_record_data.diagnosis_name_code || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="既往史" :span="2">{{ record.patient_record_data.past_history || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="家族史" :span="2">{{ record.patient_record_data.family_history || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="用药史" :span="2">{{ record.patient_record_data.medication_history || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="职业粉尘暴露" :span="2">{{ record.patient_record_data.occupational_dust_exposure || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="环境危险因素" :span="2">{{ record.patient_record_data.environmental_risk_factors || '-' }}</el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 血压血糖 -->
                <el-tab-pane label="血压血糖">
                  <el-descriptions :column="3" border size="small">
                    <el-descriptions-item label="坐立血压（mmHg）">{{ record.patient_record_data.sitting_standing_blood_pressure || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="24h动态血压（mmHg）">{{ record.patient_record_data.ambulatory_blood_pressure_24h || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="高血压史">{{ record.patient_record_data.hypertension_history || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="空腹血糖（mmol/L）">{{ record.patient_record_data.fasting_blood_glucose || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="餐后血糖（mmol/L）">{{ record.patient_record_data.postprandial_blood_glucose || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="糖化血红蛋白（%）">{{ record.patient_record_data.hba1c || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="胰岛素（mU/L）">{{ record.patient_record_data.insulin || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="C肽（ng/mL）">{{ record.patient_record_data.c_peptide || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="低血糖编码">{{ record.patient_record_data.hypoglycemia_code || '-' }}</el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 血脂血尿酸 -->
                <el-tab-pane label="血脂血尿酸">
                  <el-descriptions :column="3" border size="small">
                    <el-descriptions-item label="总胆固醇（mmol/L）">{{ record.patient_record_data.total_cholesterol || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="甘油三酯（mmol/L）">{{ record.patient_record_data.triglyceride || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="高密度脂蛋白（mmol/L）">{{ record.patient_record_data.hdl_cholesterol || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="低密度脂蛋白（mmol/L）">{{ record.patient_record_data.ldl_cholesterol || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="血尿酸（μmol/L）">{{ record.patient_record_data.blood_uric_acid || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="血清肌酐（μmol/L）">{{ record.patient_record_data.serum_creatinine || '-' }}</el-descriptions-item>

                    <el-descriptions-item label="尿微量白蛋白肌酐比（mg/g）" :span="3">{{ record.patient_record_data.urine_microalbumin_creatinine_ratio || '-' }}</el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 心血管检查 -->
                <el-tab-pane label="心血管检查">
                  <el-descriptions :column="3" border size="small">
                    <el-descriptions-item label="肌钙蛋白（ng/mL）">{{ record.patient_record_data.troponin || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="左心室射血分数（%）">{{ record.patient_record_data.left_ventricular_ejection_fraction || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="动脉僵硬度（m/s）">{{ record.patient_record_data.arterial_stiffness || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="下肢血管超声" :span="3">{{ record.patient_record_data.lower_limb_vascular_ultrasound || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="腹部超声" :span="3">{{ record.patient_record_data.abdominal_ultrasound || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="眼底检查" :span="3">{{ record.patient_record_data.fundus_examination || '-' }}</el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 肺功能检查 -->
                <el-tab-pane label="肺功能检查">
                  <el-descriptions :column="3" border size="small">
                    <el-descriptions-item label="FEV1（L）">{{ record.patient_record_data.fev1 || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="FEV1/FVC比值（%）">{{ record.patient_record_data.fev1_fvc_ratio || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="呼气峰流速（L/s）">{{ record.patient_record_data.pef || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="功能残气量（L）">{{ record.patient_record_data.frc || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="肺总量（L）">{{ record.patient_record_data.tlc || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="弥散量（mmol/min/kPa）">{{ record.patient_record_data.dlco || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="DLCO/VA比值（mmol/min/kPa/L）">{{ record.patient_record_data.dlco_va_ratio || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="血氧饱和度（%）">{{ record.patient_record_data.spo2 || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="mMRC评分">{{ record.patient_record_data.mmrc_score || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="CAT评分" :span="3">{{ record.patient_record_data.cat_score || '-' }}</el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 生活习惯 -->
                <el-tab-pane label="生活习惯">
                  <el-descriptions :column="3" border size="small">
                    <el-descriptions-item label="吸烟史">{{ record.patient_record_data.smoking_history || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="开始吸烟年龄（岁）">{{ record.patient_record_data.smoking_start_age || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="戒烟年龄（岁）">{{ record.patient_record_data.smoking_quit_age || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="饮酒史">{{ record.patient_record_data.drinking_history || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="运动方式">{{ record.patient_record_data.exercise_method || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="运动时长（分钟）">{{ record.patient_record_data.exercise_duration || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="每日主食（克）" :span="3">{{ record.patient_record_data.daily_staple_food || '-' }}</el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 诊疗方案 -->
                <el-tab-pane label="诊疗方案">
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="药物名称" :span="2">{{ record.patient_record_data.drug_name || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="计划手术编码" :span="2">{{ record.patient_record_data.planned_operation_code || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="输血方法" :span="2">{{ record.patient_record_data.transfusion_method || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="生活方式指导" :span="2">{{ record.patient_record_data.lifestyle_guidance || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="用药指导" :span="2">{{ record.patient_record_data.medication_guidance || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="费用（元）" :span="2">{{ record.patient_record_data.cost || '-' }}</el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </div>
        </el-collapse-item>
      </el-collapse>

      <!-- 3. 查看其他机构病历按钮 -->
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

    <!-- 状态提示 -->
    <div v-else class="empty-tip">
      <span v-if="isQueryDone && !showPasswordDialog">请完成手机验证码验证以查看病历</span>
      <span v-else>请输入患者身份证号并点击查询</span>
    </div>

    <!-- 验证码对话框 -->
    <InstitutionAccessDialog
      v-model="showPasswordDialog"
      :patient-name="patientName"
      :patient-phone="patientPhone"
      @verified="handleAccessVerified"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUpdated, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Lock } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import { getPatientAllRecords } from '@/api/doctor/doctor';
import { getHealthRecordsByCard } from '@/api/doctor/doctor';
import type { 
  PatientAllRecordsResponse, 
  InstitutionAllRecords, 
  AllRecordItem 
} from '@/api/doctor/types';
import type { HealthRecordResponse, HealthRecordItem } from '@/api/doctor/types';
import InstitutionAccessDialog from '@/components/InstitutionAccessDialog/InstitutionAccessDialog.vue';

// 路由实例
const router = useRouter();

// 输入相关状态
const inputIdCard = ref<string>('');
const patientIdCard = ref<string>('');
const patientName = ref<string>('');
const patientPhone = ref<string>('');

// 核心流程状态
const showAllData = ref<boolean>(false); // 验证通过后显示所有数据（折线图+病历）
const isQueryDone = ref<boolean>(false);
const showPasswordDialog = ref<boolean>(false);

// 数据和加载状态
const globalLoading = ref<boolean>(false);
const errorMsg = ref<string>('');
const allRecordsData = ref<PatientAllRecordsResponse['data'] | null>(null);
const activeInstitutions = ref<number>(0);
const showAllInstitutions = ref<boolean>(false);

// 图表相关状态（初始为空，验证通过后加载）
const chartRef = ref<HTMLDivElement | null>(null);
const chartInstance = ref<ECharts | null>(null);
const chartData = ref<HealthRecordItem[]>([]);
const chartLoading = ref<boolean>(false);

// 计算属性：过滤显示的机构
const displayedInstitutions = computed<InstitutionAllRecords[]>(() => {
  if (!allRecordsData.value?.institution_records) return [];
  if (showAllInstitutions.value) {
    return allRecordsData.value.institution_records;
  }
  return allRecordsData.value.institution_records.filter(
    institution => institution.is_current_doctor_institution
  );
});

// 计算属性：其他机构相关统计
const hasOtherInstitutions = computed<boolean>(() => {
  if (!allRecordsData.value?.institution_records) return false;
  return allRecordsData.value.institution_records.some(
    institution => !institution.is_current_doctor_institution
  );
});
const otherInstitutionsCount = computed<number>(() => {
  if (!allRecordsData.value?.institution_records) return 0;
  return allRecordsData.value.institution_records.filter(
    institution => !institution.is_current_doctor_institution
  ).length;
});
const otherInstitutionsRecordsCount = computed<number>(() => {
  if (!allRecordsData.value?.institution_records) return 0;
  return allRecordsData.value.institution_records
    .filter(institution => !institution.is_current_doctor_institution)
    .reduce((sum, institution) => sum + institution.records_count, 0);
});

// 工具函数：身份证号脱敏
const formatIdCard = (idCard: string): string => {
  if (!idCard) return '-';
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
};

// 工具函数：时间格式化
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

// 处理图表数据格式
const handleChartData = (records: HealthRecordItem[]) => {
  // 强制容错，确保records是数组且有数据
  if (!Array.isArray(records) || records.length === 0) {
    console.error("handleChartData：传入的records不是有效数组", records);
    return [];
  }
  const record = records[0];
  const timePoints = ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22'];
  
  // 生成图表所需的数组格式（time + 对应指标值）
  const formattedData = timePoints.map(hour => ({
    time: `${hour}:00`,
    hr: record[`hr_${hour}`] || 0,
    sys: record[`sys_${hour}`] || 0,
    dia: record[`dia_${hour}`] || 0,
  }));
  console.log("handleChartData生成的数组：", formattedData);
  return formattedData;
};

// 初始化图表
const initChart = (data: any[]) => {
   if (!chartRef.value) {
    console.error("图表容器不存在！");
    ElMessage.error("图表容器加载失败");
    return;
  }
  if (data.length === 0) {
    console.error("图表数据为空！");
    return;
  }
  // 销毁现有实例避免重复渲染
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }
  // 创建新图表实例
  chartInstance.value = echarts.init(chartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c}',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['心率(hr)', '收缩压(sys)', '舒张压(dia)'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.time),
      axisLabel: { interval: 0 }
    },
    yAxis: [
      {
        type: 'value',
        name: '心率(bpm)',
        min: 40,
        max: 120,
        position: 'left',
        axisLine: { lineStyle: { color: '#4895ef' } },
        nameTextStyle: { color: '#4895ef' }
      },
      {
        type: 'value',
        name: '血压(mmHg)',
        min: 50,
        max: 160,
        position: 'right',
        axisLine: { lineStyle: { color: '#f72585' } },
        nameTextStyle: { color: '#f72585' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '心率(hr)',
        type: 'line',
        data: data.map(item => item.hr),
        smooth: true,
        lineStyle: { width: 3, color: '#4895ef' },
        itemStyle: { color: '#4895ef' },
        yAxisIndex: 0
      },
      {
        name: '收缩压(sys)',
        type: 'line',
        data: data.map(item => item.sys),
        smooth: true,
        lineStyle: { width: 3, color: '#f72585' },
        itemStyle: { color: '#f72585' },
        yAxisIndex: 1
      },
      {
        name: '舒张压(dia)',
        type: 'line',
        data: data.map(item => item.dia),
        smooth: true,
        lineStyle: { width: 3, color: '#4cc9f0' },
        itemStyle: { color: '#4cc9f0' },
        yAxisIndex: 1
      }
    ]
  };
  chartInstance.value.setOption(option);
  // 监听窗口 resize 适配
  window.addEventListener('resize', () => {
    chartInstance.value?.resize();
  });
};

// 获取健康数据（验证通过后调用）
const fetchHealthData = async (idCard: string) => {
  try {
    chartLoading.value = true;
    console.log("=== 开始请求健康数据 ===");
    console.log("请求参数idCard：", idCard, "类型：", typeof idCard);

    let response: any;
    try {
      // 调用接口，不做类型断言
      response = await getHealthRecordsByCard({
        id_card: idCard // 后端要求数字则改为 Number(idCard)
      });
      console.log("=== 接口请求成功，原始返回数据：===");
      console.log("完整response：", response);
      console.log("response.code：", response.code);
      console.log("response.data 是否存在：", !!response.data); // 关键日志1：检查data是否存在
      console.log("response.data 类型：", typeof response.data); // 关键日志2：检查data类型
    } catch (requestError) {
      console.error("=== 接口请求失败：===", requestError);
      // ElMessage.error(`接口请求失败：${(requestError as Error).message}`);
      chartLoading.value = false;
      return;
    }

    // 容错：确保response是对象
    if (typeof response !== "object" || response === null) {
      console.error("=== 接口返回非对象：===", response);
      ElMessage.error("接口返回格式异常");
      chartLoading.value = false;
      return;
    }

    // 宽松判断code
    if (response.data.code === 200 || response.data.code === "200") {
      console.log("=== 进入code=200分支 ===");
      
      // 关键修复：先判断response.data存在且是对象，再判断records是数组
      if (typeof response.data === "object" && response.data !== null) {
        console.log("response.data 存在，继续检查records：");
        console.log("response.data.records：", response.data.records);
        console.log("response.data.records 类型：", typeof response.data.records);
        console.log("response.data.records 是数组吗？", Array.isArray(response.data.records));

        if (Array.isArray(response.data.data.records)) {
          // 成功进入目标分支
          console.log("=== 进入records数组分支，开始处理图表 ===");
          chartData.value = response.data.data.records as HealthRecordItem[];
          const formattedData = handleChartData(chartData.value);
          console.log("格式化后的图表数据：", formattedData);

          try {
            initChart(formattedData);
            console.log("图表初始化成功");
          } catch (chartError) {
            console.error("图表初始化失败：", chartError);
            ElMessage.error("图表加载失败，请刷新页面重试");
          }
        } else {
          console.error("=== response.data.records不是数组 ===");
          console.log("实际records值：", response.data.records);
          chartData.value = [];
          ElMessage.warning("健康数据格式异常，无法展示图表");
        }
      } else {
        // 新增分支：data不存在或不是对象
        console.error("=== response.data不存在或不是对象 ===");
        console.log("实际response.data：", response.data);
        chartData.value = [];
        ElMessage.warning("接口返回数据缺失，无法展示图表");
      }
    } else {
      console.error("=== code不是200 ===");
      // ElMessage.warning(`获取健康数据失败：${response.message || "未知错误"}`);
      chartData.value = [];
    }
  } catch (error) {
    console.error("=== 全局错误：===", error);
    // ElMessage.error("加载健康数据时发生未知错误");
    chartData.value = [];
  } finally {
    chartLoading.value = false;
  }
};

// 加载全病历数据（仅加载病历，不加载图表）
const loadAllRecords = async () => {
  try {
    globalLoading.value = true;
    const response = await getPatientAllRecords(patientIdCard.value);
    if (response?.code === 200 && response.data) {
      allRecordsData.value = response.data;
      patientIdCard.value = response.data.patient_id_card;

      // 提取患者信息
      const validInstitutions = allRecordsData.value.institution_records.filter(inst => inst.records.length > 0);
      if (validInstitutions.length > 0) {
        const firstRecord = validInstitutions[0].records[0] as AllRecordItem;
        patientName.value = firstRecord.patient_basic_info.name || '未知姓名';
        patientPhone.value = firstRecord.patient_basic_info.phone || '';
      } else {
        throw new Error('未查询到患者的任何病历记录');
      }

      if (!patientPhone.value) {
        throw new Error('患者信息中未包含手机号，无法发送验证码');
      }

      return response.data;
    } else {
      throw new Error(`加载失败：${response?.msg || '未知错误'}`);
    }
  } catch (err) {
    const error = err as Error;
    errorMsg.value = error.message;
    ElMessage.error(errorMsg.value);
    console.error('请求错误：', error);
    isQueryDone.value = false;
    showPasswordDialog.value = false;
    throw err;
  } finally {
    globalLoading.value = false;
  }
};

// 查询按钮点击事件
const handleQuery = async () => {
  const idCardReg = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  if (!idCardReg.test(inputIdCard.value)) {
    ElMessage.warning('请输入正确的18位身份证号');
    return;
  }

  // 重置所有状态
  patientIdCard.value = inputIdCard.value;
  allRecordsData.value = null;
  errorMsg.value = '';
  showAllData.value = false;
  isQueryDone.value = false;
  showPasswordDialog.value = false;
  chartData.value = [];
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }

  try {
    await loadAllRecords();
    isQueryDone.value = true;
    showPasswordDialog.value = true; // 弹出验证码框
  } catch (err) {
    // 错误已在loadAllRecords中处理
  }
};

// 验证码验证成功回调（核心：验证通过后加载图表+显示所有数据）
const handleAccessVerified = async () => {
  showPasswordDialog.value = false;
  showAllInstitutions.value = true;
  
  // 验证通过后，加载健康数据并初始化图表
  await fetchHealthData(patientIdCard.value);
  
  // 显示所有数据（折线图+病历）
  showAllData.value = true;

  // 自动展开第一个机构
  const firstInstitution = allRecordsData.value?.institution_records[0];
  if (firstInstitution) {
    activeInstitutions.value = firstInstitution.institution_id;
  }

  ElMessage.success('验证通过，已展示患者全部病历及健康数据');
};

// 返回列表
const handleBack = () => {
  inputIdCard.value = '';
  showAllData.value = false;
  isQueryDone.value = false;
  // 销毁图表释放资源
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }
  router.back();
};

// 页面卸载时销毁图表
onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }
});

// 页面初始化
onMounted(() => {});

// 监听图表容器更新（适配动态渲染）
onUpdated(() => {
  if (chartData.value.length > 0 && chartRef.value && showAllData.value) {
    initChart(handleChartData(chartData.value));
  }
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

// 图表样式（与病历同屏显示）
.chart-card {
  .card-title {
    font-size: 16px;
    color: #374151;
    font-weight: 500;
  }
  .chart-container {
    width: 100%;
    height: 400px;
    position: relative;
  }
  .chart-dom {
    width: 100%;
    height: 100%;
  }
  .chart-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .chart-empty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    font-size: 16px;
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

.empty-tip {
  text-align: center;
  padding: 80px 0;
  color: #6b7280;
  font-size: 16px;
}

@media (max-width: 1200px) {
  .patient-all-records-page {
    padding: 16px;
  }

  .page-header {
    flex-wrap: wrap;
    gap: 12px 0;
  }

  .overview-card {
    :deep(.el-col) {
      margin-bottom: 12px;
    }
  }

  .chart-container {
    height: 300px !important;
  }

  .view-more-section {
    padding: 16px;
  }
}
</style>
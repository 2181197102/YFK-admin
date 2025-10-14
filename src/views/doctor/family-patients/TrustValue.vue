<template>
  <div class="trust-value-container">
    <el-page-header @back="handleBack" content="医生信任值计算"></el-page-header>
    
    <el-card class="trust-card" shadow="hover">
      <!-- 患者基本信息 -->
      <div class="patient-info">
        <h3>患者信息</h3>
        <el-descriptions column="2" border>
          <el-descriptions-item label="姓名">{{ patientName }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ patientId }}</el-descriptions-item>
          <el-descriptions-item label="病历号">{{ medicalRecordNum }}</el-descriptions-item>
          <el-descriptions-item label="查询时间">{{ formatDate(new Date()) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 信任值计算结果 -->
      <div class="trust-value-result" v-loading="loading">
        <h3>医生信任值计算结果</h3>
        <div class="trust-value-display">
          <div class="trust-value">
            <span class="label">当前信任值:</span>
            <span class="value" :class="trustValueClass">{{ trustValue.toFixed(2) }}</span>
          </div>
          <el-progress 
            :percentage="trustValue * 100" 
            :stroke-color="trustValue > 0.5 ? '#10b981' : '#ef4444'"
            style="margin-top: 15px;"
          ></el-progress>
          <div class="trust-status" :class="trustValue > 0.5 ? 'status-valid' : 'status-invalid'">
            {{ trustValue > 0.5 ? '信任值有效，可查看患者完整记录' : '信任值不足，无法查看完整记录' }}
          </div>
        </div>
        
        <el-button 
          type="primary" 
          style="margin-top: 20px;"
          @click="handleViewRecords"
          :disabled="trustValue <= 0.5 || loading"
          :loading="btnLoading"
        >
          <template #loading>查询中...</template>
          查看患者完整医疗记录
        </el-button>
      </div>
      
      <!-- 详细统计数据 -->
      <div class="statistics-section">
        <h3>信任值计算依据</h3>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="hover">
              <h4>访问行为统计</h4>
              <el-descriptions column="2">
                <el-descriptions-item label="异常位置访问">{{ accessLocation.num_ad }}</el-descriptions-item>
                <el-descriptions-item label="正常位置访问">{{ accessLocation.num_nd }}</el-descriptions-item>
                <el-descriptions-item label="正常时段访问">{{ accessPeriod.num_ni }}</el-descriptions-item>
                <el-descriptions-item label="异常时段访问">{{ accessPeriod.num_ui }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
          
          <el-col :span="12">
            <el-card shadow="hover">
              <h4>操作成功率</h4>
              <el-descriptions column="2">
                <el-descriptions-item label="访问成功">{{ accessSuccess.num_as }}</el-descriptions-item>
                <el-descriptions-item label="访问失败">{{ accessSuccess.num_af }}</el-descriptions-item>
                <el-descriptions-item label="成功率" :span="2">
                  <span class="success-rate">{{ ((accessSuccess.num_as / (accessSuccess.num_as + accessSuccess.num_af || 1)) * 100).toFixed(1) }}%</span>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
          
          <el-col :span="12">
            <el-card shadow="hover">
              <h4>数据敏感度操作</h4>
              <el-descriptions column="2">
                <el-descriptions-item label="等级1(低)">{{ dataSensitivity.num1 }}</el-descriptions-item>
                <el-descriptions-item label="等级2">{{ dataSensitivity.num2 }}</el-descriptions-item>
                <el-descriptions-item label="等级3">{{ dataSensitivity.num3 }}</el-descriptions-item>
                <el-descriptions-item label="等级4(高)">{{ dataSensitivity.num4 }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
          
          <el-col :span="12">
            <el-card shadow="hover">
              <h4>近期操作行为</h4>
              <el-descriptions column="2">
                <el-descriptions-item label="查看">{{ operationBehavior.num_view }}</el-descriptions-item>
                <el-descriptions-item label="修改">{{ operationBehavior.num_revise }}</el-descriptions-item>
                <el-descriptions-item label="下载">{{ operationBehavior.num_download }}</el-descriptions-item>
                <el-descriptions-item label="添加">{{ operationBehavior.num_add }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getTrustValue } from '@/api/doctor/doctor';
import { TrustValueResponse } from '@/api/doctor/types';
import { ElMessage } from 'element-plus';

// 状态管理
const loading = ref<boolean>(true);
const btnLoading = ref<boolean>(false);
const trustValue = ref<number>(0);

// 患者信息（从路由状态获取）
const patientId = ref<string>('');
const patientName = ref<string>('');
const medicalRecordNum = ref<string>('');

// 信任值统计数据
const accessLocation = ref({ num_ad: 0, num_nd: 0 });
const accessPeriod = ref({ num_ni: 0, num_ui: 0 });
const accessSuccess = ref({ num_af: 0, num_as: 0 });
const dataSensitivity = ref({ num1: 0, num2: 0, num3: 0, num4: 0 });
const operationBehavior = ref({
  num_add: 0,
  num_copy: 0,
  num_delete: 0,
  num_download: 0,
  num_revise: 0,
  num_view: 0
});

// 路由实例
const router = useRouter();

// 信任值样式类
const trustValueClass = computed(() => {
  return trustValue.value > 0.5 ? 'positive' : 'negative';
});

// 格式化日期
const formatDate = (date: Date) => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 返回上一页
const handleBack = () => {
  router.back();
};

// 查看患者完整记录（信任值达标时）
const handleViewRecords = async () => {
  if (!patientId.value) {
    ElMessage.error('患者ID不存在');
    return;
  }
  
  try {
    btnLoading.value = true;
    // 跳转到患者完整记录页面
    router.push({
      name: 'Patient_detail',
      state: { 
        patientId: patientId.value,
        patientName: patientName.value
      }
    });
  } catch (error) {
    ElMessage.error('跳转失败，请重试');
    console.error('页面跳转错误:', error);
  } finally {
    btnLoading.value = false;
  }
};

// 获取医生信任值数据
const fetchTrustValueData = async () => {
  try {
    loading.value = true;
    const response: TrustValueResponse = await getTrustValue();
    
    // 更新信任值数据
    trustValue.value = response.Trustvalue;
    accessLocation.value = response.access_location;
    accessPeriod.value = response.access_period;
    accessSuccess.value = response.access_success;
    dataSensitivity.value = response.data_sensitivity;
    operationBehavior.value = response.operation_behavior;
    
    // 信任值判断提示
    if (trustValue.value > 0.5) {
      ElMessage.success('信任值达标，可查看患者完整记录');
    } else {
      ElMessage.warning('信任值不足，无法查看完整记录');
    }
  } catch (error) {
    console.error('获取信任值数据失败:', error);
    ElMessage.error('信任值计算失败，请刷新页面重试');
    trustValue.value = 0; // 出错时默认信任值为0
  } finally {
    loading.value = false;
  }
};

// 页面初始化
onMounted(() => {
  // 从路由状态获取患者信息
  const routeState = history.state;
  if (routeState && routeState.patientId) {
    patientId.value = routeState.patientId;
    patientName.value = routeState.patientName || '未知患者';
    medicalRecordNum.value = routeState.medicalRecordNum || '未知病历号';
    
    // 获取信任值数据
    fetchTrustValueData();
  } else {
    ElMessage.error('未获取到患者信息');
    // 延迟跳转，确保错误提示能显示
    setTimeout(() => {
      router.push('/patient-list');
    }, 1500);
  }
});
</script>

<style scoped>
.trust-value-container {
  padding: 20px;
}

.patient-info, .trust-value-result, .statistics-section {
  margin-bottom: 25px;
}

h3 {
  margin-bottom: 15px;
  color: #1f2329;
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

h4 {
  margin-bottom: 10px;
  color: #4b5563;
  font-size: 14px;
}

/* 信任值展示区域 */
.trust-value-display {
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 6px;
}

.trust-value {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.trust-value .label {
  font-size: 16px;
  margin-right: 10px;
  color: #4b5563;
}

.trust-value .value {
  font-size: 28px;
  font-weight: bold;
  letter-spacing: 1px;
}

/* 信任值状态样式 */
.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}

.trust-status {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.status-valid {
  background-color: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-invalid {
  background-color: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* 统计数据区域 */
.statistics-section {
  margin-top: 30px;
}

.success-rate {
  color: #10b981;
  font-weight: 600;
}
</style>
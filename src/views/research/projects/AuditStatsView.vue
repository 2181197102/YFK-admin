<template>
  <div class="result-container">
    <!-- 页面标题 -->
    <el-page-header 
      @back="handleBack"
      content="统计结果展示"
      class="page-header"
    />

    <!-- 选择信息展示 -->
    <el-card class="selection-info" v-if="selectedCodes.length > 0">
      <div class="info-content">
        <span class="info-label">已选病种代码：</span>
        <span class="info-value">{{ selectedLabels }}</span>
      </div>
    </el-card>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button 
        type="primary" 
        @click="refreshData"
        :loading="isLoading"
      >
        <el-icon v-if="isLoading"><Loading /></el-icon>
        <span v-else>刷新数据</span>
      </el-button>
      <el-button 
        type="default" 
        @click="handleBack"
      >
        <el-icon><ArrowLeft /></el-icon> 返回选择
      </el-button>
    </div>

    <!-- 错误提示 -->
    <el-alert 
      v-if="errorMessage" 
      type="error" 
      :message="errorMessage" 
      show-icon 
      closable
      @close="errorMessage = ''"
      style="margin: 16px 0;"
    />

    <!-- 加载状态 -->
    <el-loading 
      v-if="isLoading"
      target=".result-content"
      text="数据加载中..."
    />

    <!-- 结果内容区域 -->
    <div class="result-content" v-if="!isLoading && !errorMessage">
      <!-- 当没有数据时显示空状态 -->
      <el-empty 
        v-if="!auditStats" 
        description="请点击刷新按钮获取数据"
        class="empty-state"
      />

      <!-- 当有审计数据时显示 -->
      <div v-if="auditStats">
        <!-- 信任值展示 -->
        <el-card class="trust-card" :class="trustValueClass">
          <div class="trust-info">
            <span class="trust-label">信任值：</span>
            <span class="trust-value">{{ auditStats.Trustvalue.toFixed(2) }}</span>
            <el-progress 
              :percentage="auditStats.Trustvalue * 100" 
              :stroke-color="trustValueColor"
              stroke-width="6"
              class="trust-progress"
            />
            <div class="trust-status">
              {{ auditStats.Trustvalue > 0.5 ? '信任值达标，可查看病历数据' : '信任值未达标，无法查看病历数据' }}
            </div>
          </div>
        </el-card>

        <!-- 访问位置统计 -->
        <el-card class="stats-card">
          <div slot="header">访问位置统计</div>
          <el-table :data="accessLocationData" border>
            <el-table-column prop="name" label="类型" width="200" />
            <el-table-column prop="value" label="数量" />
          </el-table>
        </el-card>

        <!-- 访问时段统计 -->
        <el-card class="stats-card">
          <div slot="header">访问时段统计</div>
          <el-table :data="accessPeriodData" border>
            <el-table-column prop="name" label="类型" width="200" />
            <el-table-column prop="value" label="数量" />
          </el-table>
        </el-card>

        <!-- 访问成功统计 -->
        <el-card class="stats-card">
          <div slot="header">访问成功统计</div>
          <el-table :data="accessSuccessData" border>
            <el-table-column prop="name" label="类型" width="200" />
            <el-table-column prop="value" label="数量" />
          </el-table>
        </el-card>

        <!-- 数据敏感度统计 -->
        <el-card class="stats-card">
          <div slot="header">数据敏感度统计</div>
          <el-table :data="dataSensitivityData" border>
            <el-table-column prop="name" label="敏感度级别" width="200" />
            <el-table-column prop="value" label="访问次数" />
          </el-table>
        </el-card>

        <!-- 操作行为统计 -->
        <el-card class="stats-card">
          <div slot="header">操作行为统计</div>
          <el-table :data="operationBehaviorData" border>
            <el-table-column prop="name" label="操作类型" width="200" />
            <el-table-column prop="value" label="次数" />
          </el-table>
        </el-card>

        <!-- 用户ID展示 -->
        <el-card class="stats-card">
          <div slot="header">用户信息</div>
          <div class="user-info">
            <span class="user-label">用户ID：</span>
            <span class="user-value">{{ auditStats.user_id }}</span>
          </div>
        </el-card>

        <!-- 下一步按钮 -->
        <div class="next-step-container">
          <el-button 
            type="success" 
            size="large"
            @click="fetchMedicalRecords"
            :loading="medicalRecordsLoading"
            :disabled="auditStats.Trustvalue <= 0.5"
          >
            <span>查看病历数据</span>
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <p class="button-hint" v-if="auditStats.Trustvalue <= 0.5">
            提示：信任值需大于0.5才能查看病历数据
          </p>
        </div>

        <!-- 病历数据展示 -->
        <el-card 
          class="stats-card" 
          v-if="medicalRecords && medicalRecords.data.length > 0"
        >
          <div slot="header">
            病历数据 
            <span class="record-count">(共 {{ medicalRecords.data_count }} 条，匹配 {{ medicalRecords.matched_medical_record_count }} 条)</span>
          </div>
          <el-table :data="medicalRecords.data" border>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="medical_record_num" label="病历编号" width="120" />
            <el-table-column prop="created_time" label="创建时间" width="180" />
            <el-table-column prop="updated_time" label="更新时间" width="180" />
            <el-table-column prop="data_code1" label="数据代码1" width="100" />
            <el-table-column prop="data_code2" label="数据代码2" width="100" />
            <el-table-column prop="data_code3" label="数据代码3" width="100" />
            <el-table-column prop="data_code4" label="数据代码4" width="100" />
            <el-table-column prop="data_code5" label="数据代码5" width="100" />
            <el-table-column prop="data_code6" label="数据代码6" width="100" />
            <el-table-column prop="data_code7" label="数据代码7" width="100" />
            <el-table-column prop="data_code8" label="数据代码8" width="100" />
            <el-table-column prop="data_code9" label="数据代码9" width="100" />
          </el-table>
        </el-card>

        <!-- 病历数据加载状态 -->
        <el-loading 
          v-if="medicalRecordsLoading && auditStats.Trustvalue > 0.5"
          target=".next-step-container"
          text="加载病历数据中..."
        />

        <!-- 无病历数据提示 -->
        <el-empty 
          v-if="!medicalRecordsLoading && medicalRecords && medicalRecords.data.length === 0"
          description="没有找到相关病历数据"
          style="margin: 20px 0;"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft, ArrowRight, Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getAuditStats, getMedicalRecords } from '@/api/researchers/researchers';
import { AuditStats, MedicalRecordResponse } from '@/api/researchers/types';

// 路由实例
const router = useRouter();
const route = useRoute();

// 选中的病种代码和标签
const selectedCodes = ref<string[]>([]);
const selectedLabels = ref('');

// 数据状态
const auditStats = ref<AuditStats | null>(null);
const medicalRecords = ref<MedicalRecordResponse | null>(null);
const isLoading = ref(false);
const medicalRecordsLoading = ref(false);
const errorMessage = ref('');

// 初始化
onMounted(() => {
  // 解析路由参数
  const codes = route.query.codes as string;
  const labels = route.query.labels as string;
  
  if (codes) {
    selectedCodes.value = codes.split(',');
  }
  if (labels) {
    selectedLabels.value = labels;
  }
  
  // 如果有选中的代码，自动加载数据
  if (selectedCodes.value.length > 0) {
    refreshData();
  }
});

// 刷新审计统计数据
const refreshData = async () => {
  if (selectedCodes.value.length === 0) {
    errorMessage.value = '请先选择病种代码';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  medicalRecords.value = null; // 重置病历数据

  try {
    const response = await getAuditStats(selectedCodes.value);
    
    if (response.error) {
      errorMessage.value = response.error;
      ElMessage.error(response.error);
    } else if (response.data) {
      auditStats.value = response.data;
      ElMessage.success('统计数据加载成功');
    }
  } catch (error) {
    errorMessage.value = '加载统计数据失败';
    console.error('加载统计数据错误:', error);
  } finally {
    isLoading.value = false;
  }
};

// 获取病历数据
const fetchMedicalRecords = async () => {
  if (!auditStats.value || auditStats.value.Trustvalue <= 0.5) {
    ElMessage.error('信任值不足');
    return;
  }

  medicalRecordsLoading.value = true;
  
  try {
    const response = await getMedicalRecords(selectedCodes.value);
    
    if (response.error) {
      ElMessage.error(`获取病历数据失败: ${response.error}`);
    } else if (response.data) {
      medicalRecords.value = response.data;
      ElMessage.success(`成功加载 ${response.data.data_count} 条病历数据`);
    }
  } catch (error) {
    console.error('获取病历数据失败:', error);
    ElMessage.error('获取病历数据失败');
  } finally {
    medicalRecordsLoading.value = false;
  }
};

// 返回选择页面
const handleBack = () => {
  router.push({ name: 'DiseaseSelection' });
};

// 信任值样式计算
const trustValueColor = computed(() => {
  return auditStats.value?.Trustvalue > 0.5 ? '#52c41a' : '#faad14';
});

const trustValueClass = computed(() => {
  return auditStats.value?.Trustvalue > 0.5 
    ? 'trust-accepted' 
    : 'trust-pending';
});

// 表格数据转换
const accessLocationData = computed(() => {
  if (!auditStats.value) return [];
  return [
    { name: '正常地点访问', value: auditStats.value.access_location.num_nd },
    { name: '异常地点访问', value: auditStats.value.access_location.num_ad }
  ];
});

const accessPeriodData = computed(() => {
  if (!auditStats.value) return [];
  return [
    { name: '正常时段访问', value: auditStats.value.access_period.num_ni },
    { name: '异常时段访问', value: auditStats.value.access_period.num_ui }
  ];
});

const accessSuccessData = computed(() => {
  if (!auditStats.value) return [];
  return [
    { name: '访问成功', value: auditStats.value.access_success.num_as },
    { name: '访问失败', value: auditStats.value.access_success.num_af }
  ];
});

const dataSensitivityData = computed(() => {
  if (!auditStats.value) return [];
  return [
    { name: '级别1', value: auditStats.value.data_sensitivity.num1 },
    { name: '级别2', value: auditStats.value.data_sensitivity.num2 },
    { name: '级别3', value: auditStats.value.data_sensitivity.num3 },
    { name: '级别4', value: auditStats.value.data_sensitivity.num4 }
  ];
});

const operationBehaviorData = computed(() => {
  if (!auditStats.value) return [];
  const behavior = auditStats.value.operation_behavior;
  return [
    { name: '查看', value: behavior.num_view },
    { name: '复制', value: behavior.num_copy },
    { name: '下载', value: behavior.num_download },
    { name: '添加', value: behavior.num_add },
    { name: '修改', value: behavior.num_revise },
    { name: '删除', value: behavior.num_delete }
  ];
});
</script>

<style scoped>
.result-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 16px;
}

/* 选择信息样式 */
.selection-info {
  margin-bottom: 20px;
  background-color: #f5f7fa;
}

.info-content {
  padding: 12px 16px;
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: 500;
  margin-right: 10px;
  color: #666;
}

.info-value {
  color: #333;
  flex: 1;
}

.action-buttons {
  margin-bottom: 20px;
}

/* 信任值卡片样式 */
.trust-card {
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.trust-accepted {
  border: 1px solid #b7eb8f;
  background-color: #f6ffed;
}

.trust-pending {
  border: 1px solid #fff3cd;
  background-color: #fffbe6;
}

.trust-info {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.trust-label {
  font-size: 16px;
  color: #666;
}

.trust-value {
  font-size: 28px;
  font-weight: bold;
  margin: 0 10px;
}

.trust-progress {
  margin: 15px 0 10px 0;
}

.trust-status {
  font-size: 14px;
  color: #666;
}

/* 统计卡片样式 */
.stats-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.stats-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* 用户信息样式 */
.user-info {
  padding: 10px 0;
}

.user-label {
  font-weight: 500;
  color: #666;
  margin-right: 10px;
}

.user-value {
  color: #333;
}

/* 下一步按钮样式 */
.next-step-container {
  text-align: center;
  margin: 30px 0;
}

.button-hint {
  margin: 10px 0 0 0;
  color: #888;
  font-size: 14px;
}

/* 病历数据样式 */
.record-count {
  font-size: 14px;
  color: #666;
  font-weight: normal;
  margin-left: 10px;
}

.empty-state {
  margin: 100px 0;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .info-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-label {
    margin-bottom: 5px;
  }
  
  .trust-value {
    font-size: 22px;
  }
}
</style>

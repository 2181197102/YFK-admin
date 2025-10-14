<template>
  <div class="medical-data-container">
    <el-page-header 
      @back="handleBack"
      content="医疗数据查询结果"
    />

    <el-card class="data-card">
      <!-- 查询条件概览 -->
      <div class="query-summary">
        <div class="summary-item">
          <span class="summary-label">选中机构：</span>
          <span class="summary-value">{{ getInstitutionNames().join(', ') }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">选中病种：</span>
          <span class="summary-value">{{ getDiseaseNames().join(', ') }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">选中字段：</span>
          <span class="summary-value">{{ queryParams.data_code?.join(', ') }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">请求数据量：</span>
          <span class="summary-value">{{ queryParams.nums }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">实际返回数据量：</span>
          <span class="summary-value">{{ medicalData?.total_count || 0 }}</span>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="data-table-section">
        <el-table
          v-if="medicalData && medicalData.results.length > 0"
          :data="medicalData.results"
          border
          style="width: 100%"
          :header-cell-style="{ 'background-color': '#f5f7fa' }"
        >
          <el-table-column
            prop="medical_record_num"
            label="病历编号"
            align="center"
            min-width="120"
          />
          <el-table-column
            prop="institution"
            label="机构"
            align="center"
            min-width="80"
          />
          <el-table-column
            v-for="field in queryParams.data_code"
            :key="field"
            :prop="field"
            :label="field"
            align="center"
            min-width="100"
          />
        </el-table>

        <!-- 无数据状态 -->
        <div v-else-if="!loading && (!medicalData || medicalData.results.length === 0)" class="empty-state">
          <el-empty description="未查询到相关数据" />
        </div>

        <!-- 加载状态 -->
        <div v-else class="loading-state">
          <el-loading indicator-center>
            <template #indicator>
              <el-icon size="30"><Loading /></el-icon>
              <p>正在加载数据...</p>
            </template>
          </el-loading>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="data-actions">
        <el-button 
          type="default" 
          @click="handleBack"
          :disabled="loading"
        >
          返回
        </el-button>
        <el-button 
          type="primary" 
          @click="handleExportData"
          :disabled="loading || (!medicalData || medicalData.results.length === 0)"
          :loading="exporting"
        >
          <el-icon v-if="exporting"><Loading /></el-icon>
          <el-icon v-else><Download /></el-icon>
          <span>导出数据</span>
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Loading, Download } from '@element-plus/icons-vue';
import { QueryParams, Institution, Disease, MedicalDataResponse } from '@/api/researchers/types';
import { getMedicalRecords, add_ob_num_download } from '@/api/researchers/researchers';

// 路由实例
const router = useRouter();
const route = useRoute();

// 状态管理
const loading = ref(true);
const exporting = ref(false);
const medicalData = ref<MedicalDataResponse | null>(null);

// 解析路由参数
const queryParams: QueryParams = JSON.parse(route.query.params as string);

// 机构数据（与选择界面保持一致）
const institutions: Institution[] = [
  { id: 1, name: '机构1' },
  { id: 2, name: '机构2' },
  { id: 3, name: '机构3' }
];

// 病种数据（与选择界面保持一致）
const diseases: Disease[] = [
  { code: 'I10', name: '高血压' },
  { code: 'I25.1', name: '冠心病' },
  { code: 'E10', name: '糖尿病' },
  { code: 'J44', name: '慢阻肺' }
];

// 获取选中机构的名称
const getInstitutionNames = () => {
  return queryParams.ins_codes.map(insId => {
    const ins = institutions.find(item => item.id === insId);
    return ins ? ins.name : `机构${insId}`;
  });
};

// 获取选中病种的名称
const getDiseaseNames = () => {
  return queryParams.disease_codes.map(code => {
    const disease = diseases.find(item => item.code === code);
    return disease ? `${disease.code}(${disease.name})` : code;
  });
};

// 页面加载时获取医疗数据
onMounted(async () => {
  try {
    const data = await getMedicalRecords(queryParams);
    medicalData.value = data;
    // ElMessage.error(medicalData.value.data_codes);
  } catch (error: any) {
    ElMessage.error(`加载数据失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
});

// 导出数据
const handleExportData = async () => {
  if (!medicalData.value) return;
  
  exporting.value = true;
  add_ob_num_download();
  try {
    // 这里只是模拟导出，实际项目中应调用后端导出接口
    setTimeout(() => {
      ElMessage.success('数据导出成功');
    }, 1000);
  } catch (error: any) {
    ElMessage.error(`导出失败: ${error.message}`);
  } finally {
    exporting.value = false;
  }
};

// 返回上一页
const handleBack = () => {
  router.back();
};
</script>

<style scoped>
.medical-data-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.data-card {
  margin-top: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

/* 查询条件概览样式 */
.query-summary {
  padding: 15px;
  background-color: #f9fafb;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px 30px;
}

.summary-item {
  display: flex;
  align-items: center;
}

.summary-label {
  font-weight: 500;
  color: #666;
  margin-right: 8px;
}

.summary-value {
  color: #333;
}

/* 数据表格区域样式 */
.data-table-section {
  margin-bottom: 20px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.empty-state {
  padding: 50px 0;
  text-align: center;
}

.loading-state {
  padding: 50px 0;
  text-align: center;
}

/* 操作按钮样式 */
.data-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 15px;
  border-top: 1px solid #f0f0f0;
}
</style>

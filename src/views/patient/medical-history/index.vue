<template>
  <div class="medical-record-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>我的病历数据</h2>
    </div>

    <!-- 错误提示 -->
    <el-alert 
      v-if="errorMsg" 
      type="error" 
      closable 
      @close="errorMsg = ''"
      style="margin-bottom: 16px;"
    >
      {{ errorMsg }}
    </el-alert>

    <!-- 加载状态 -->
    <el-loading 
      v-if="isLoading" 
      text="正在加载病历数据..." 
      fullscreen
    ></el-loading>

    <!-- 内容区域（加载完成后显示） -->
    <div v-else class="content-wrapper">
      <!-- 1. 用户信息卡片 -->
      <el-card shadow="hover" style="margin-bottom: 20px;">
        <template #header>
          <span class="card-title">个人信息</span>
        </template>
        <div class="user-info-grid">
          <div class="info-item">
            <span class="info-label">用户ID：</span>
            <span class="info-value">{{ userInfo?.user_id || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">姓名：</span>
            <span class="info-value">{{ userInfo?.user_name || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">身份证号：</span>
            <span class="info-value">{{ formatIdCard(userInfo?.id_card) || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">账号状态：</span>
            <span class="info-value">
              <el-tag :type="userInfo?.enable ? 'success' : 'danger'">
                {{ userInfo?.enable ? '正常' : '禁用' }}
              </el-tag>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">总病历数：</span>
            <span class="info-value">{{ totalRecordCount || 0 }} 条</span>
          </div>
        </div>
      </el-card>

      <!-- 2. 机构标签页 + 病历表格 -->
      <el-tabs v-model="activeTab" type="card" style="margin-bottom: 20px;">
        <!-- 动态生成机构标签 -->
        <el-tab-pane 
          v-for="group in groupRecords" 
          :key="group.group_id"
          :label="`${group.institution_name}（${group.record_data_count}条）`"
        >
          <!-- 机构病历表格 -->
          <el-table
            :data="group.record_data"
            border
            stripe
            style="width: 100%"
            empty-text="该机构暂无您的病历数据"
            :header-cell-style="{ background: '#f8fafc', fontWeight: '500' }"
          >
            <el-table-column 
              prop="medical_record_num" 
              label="病历编号" 
              align="center" 
              width="140"
            ></el-table-column>
            <el-table-column 
              prop="diagnosis_name_code" 
              label="诊断结果" 
              align="center"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column 
              prop="sitting_standing_blood_pressure" 
              label="坐位血压" 
              align="center" 
              width="140"
            ></el-table-column>
            <el-table-column 
              prop="bmi" 
              label="BMI指数" 
              align="center" 
              width="100"
              :formatter="formatNumber"
            ></el-table-column>
            <el-table-column 
              prop="drug_name" 
              label="用药名称" 
              align="center"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column 
              prop="created_time" 
              label="创建时间" 
              align="center" 
              width="180"
              :formatter="formatDateTime"
            ></el-table-column>
            <el-table-column 
              label="操作" 
              align="center" 
              width="120"
            >
              <template #default="scope">
                <el-button 
                  type="text" 
                  size="small" 
                  @click="viewRecordDetail(scope.row)"
                >
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getMyMedicalRecords } from '@/api/patient/patient';
import type { 
  GetMyMedicalRecordResponse, 
  UserInfo, 
  GroupRecord, 
  MedicalRecordItem 
} from '@/api/patient/types';

// 状态管理
const isLoading = ref<boolean>(true);
const errorMsg = ref<string>('');
const userInfo = ref<UserInfo | null>(null);
const groupRecords = ref<GroupRecord[]>([]);
const totalRecordCount = ref<number>(0);
const activeTab = ref<string>('0'); // 默认选中第一个标签

// 页面加载时获取数据
onMounted(async () => {
  try {
    isLoading.value = true;
    const response: GetMyMedicalRecordResponse = await getMyMedicalRecords();
    // 赋值数据
    userInfo.value = response.data.user_info;
    groupRecords.value = response.data.group_records;
    totalRecordCount.value = response.data.total_record_data_count;
    // 默认选中第一个机构标签
    if (groupRecords.value.length > 0) {
      activeTab.value = groupRecords.value[0].group_id.toString();
    }
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : '加载失败，请刷新页面重试';
  } finally {
    isLoading.value = false;
  }
});

/** 工具函数：格式化身份证号（中间隐藏） */
const formatIdCard = (idCard?: string): string | undefined => {
  if (!idCard) return undefined;
  return idCard.replace(/^(\d{6})(\d{8})(\d{4})$/, '$1********$3');
};

/** 工具函数：格式化日期（UTC转本地时间） */
const formatDateTime = (utcTime?: string): string => {
  if (!utcTime) return '-';
  const date = new Date(utcTime);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/** 工具函数：格式化数值（保留2位小数） */
const formatNumber = (row: MedicalRecordItem, column: any, value: string): string => {
  if (!value || isNaN(Number(value))) return value;
  return Number(value).toFixed(2);
};

/** 查看病历详情（可扩展弹窗展示完整字段） */
const viewRecordDetail = (record: MedicalRecordItem) => {
  // 此处可扩展：打开弹窗展示所有病历字段
  ElMessage.info(`已选中病历编号：${record.medical_record_num}（详情功能待扩展）`);
  console.log('病历详情数据：', record);
};
</script>

<style scoped lang="scss">
.medical-record-page {
  padding: 24px;
  max-width: 1800px;
  margin: 0 auto;
  background-color: #f9fafb;
  min-height: 100vh;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 28px;
  h2 {
    color: #1f2937;
    font-size: 20px;
    font-weight: 600;
  }
}

.content-wrapper {
  gap: 20px;
  display: flex;
  flex-direction: column;
}

.user-info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 48px;
  padding: 16px 0;
  .info-item {
    display: flex;
    align-items: center;
    .info-label {
      color: #6b7280;
      width: 100px;
      font-size: 14px;
    }
    .info-value {
      color: #1f2937;
      font-size: 14px;
      max-width: 220px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .medical-record-page {
    padding: 16px;
  }
  .user-info-grid {
    gap: 16px 32px;
  }
}

@media (max-width: 768px) {
  .user-info-grid {
    flex-direction: column;
    gap: 12px 0;
    .info-item {
      flex-direction: column;
      align-items: flex-start;
      .info-label {
        margin-bottom: 4px;
      }
    }
  }
}
</style>
<template>
  <!-- 模板部分不变，保持原结构 -->
  <div class="patient-record-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>患者病历管理系统</h2>
    </div>

    <!-- 全局加载遮罩 -->
    <el-loading v-if="globalLoading" fullscreen text="正在加载所有病历数据..."></el-loading>

    <!-- 错误提示 -->
    <el-alert
      v-else-if="errorMsg"
      type="error"
      :message="errorMsg"
      show-icon
      style="margin-bottom: 16px"
      @close="errorMsg = ''"
    ></el-alert>

    <!-- 数据为空提示（新增：明确告知后端无返回数据） -->
    <el-alert
      v-else-if="allRawRecords.length === 0 && !errorMsg"
      type="info"
      message="后端未返回任何病历数据，请检查接口或数据"
      show-icon
      style="margin-bottom: 16px"
    ></el-alert>

    <div v-else class="page-content">
      <!-- 1. 用户基础信息卡片 -->
      <el-card class="user-info-card" shadow="hover" style="margin-bottom: 20px">
        <template #header>
          <span class="card-title">当前登录用户信息</span>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">用户ID：</span>
            <span class="info-value">{{ userInfo?.user_id || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">用户名：</span>
            <span class="info-value">{{ userInfo?.user_name || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">身份证号：</span>
            <span class="info-value">{{ userInfo?.id_card || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">关联机构组：</span>
            <span class="info-value">{{ relatedGroupIds?.join('、') || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">当前筛选后总病历数：</span>
            <span class="info-value">{{ filteredRecords.length }} 条</span>
          </div>
        </div>
      </el-card>

      <!-- 2. 搜索功能区 -->
      <div class="search-section" style="margin-bottom: 20px">
        <el-input
          v-model="searchName"
          placeholder="请输入患者姓名搜索（支持模糊匹配）"
          clearable
          style="width: 380px; margin-right: 16px"
          @keyup.enter="handleSearch"
          :disabled="isProcessing"
          prefix-icon="Search"
        ></el-input>
        <el-button
          type="primary"
          @click="handleSearch"
          :loading="isProcessing"
        >
          搜索病历
        </el-button>
        <el-button
          type="default"
          @click="handleReset"
          style="margin-left: 8px"
          :loading="isProcessing"
        >
          重置筛选
        </el-button>
      </div>

      <!-- 3. 病历数据表格 -->
      <el-table
        :data="medicalRecords"
        border
        stripe
        style="width: 100%"
        :loading="isProcessing"
        empty-text="暂无匹配的患者病历记录"
        row-key="id"
        :header-cell-style="{ background: '#f8fafc', fontWeight: '500' }"
      >
        <el-table-column
          prop="id"
          label="记录ID"
          align="center"
          width="80"
        ></el-table-column>
        <el-table-column
          prop="patient_name"
          label="患者姓名"
          align="center"
          width="120"
          :cell-style="({ row }) => searchName && row.patient_name.includes(searchName) 
            ? { color: '#165DFF', fontWeight: '500' } 
            : {}"
        ></el-table-column>
        <el-table-column
          prop="patient_id_num"
          label="患者身份证号"
          align="center"
          width="180"
        ></el-table-column>
        <el-table-column
          prop="medical_record_num"
          label="病历编号"
          align="center"
          width="140"
        ></el-table-column>
        <el-table-column
          prop="doctor_name"
          label="接诊医生"
          align="center"
          width="120"
        ></el-table-column>
        <el-table-column
          prop="doctor_code"
          label="医生编号"
          align="center"
          width="180"
        ></el-table-column>
        <el-table-column
          prop="created_time"
          label="创建时间"
          align="center"
          width="180"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.created_time) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="updated_time"
          label="更新时间"
          align="center"
          width="180"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.updated_time) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="220"
          fixed="right"
        >
          <template #default="scope">

            <el-button
              type="success"
              link
              size="small"
              @click="handleViewAllRecords(scope.row)"
              :disabled="isProcessing"
            >
              查看全部病历
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 4. 分页控件（前端计算分页） -->
      <div class="pagination-section" style="margin-top: 20px; text-align: right">
        <el-pagination
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
          :current-page="pagination.pageNum"
          :page-sizes="[20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredRecords.length"
          :disabled="filteredRecords.length === 0 || isProcessing"
          background
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElAlert } from 'element-plus';
import { getPatientMedicalRecords } from '@/api/doctor/doctor'; // 替换为你的API导入路径
import type { MedicalRecord, UserInfo, PatientApiResponse } from '@/api/doctor/types'; // 替换为你的类型导入路径

// 路由实例
const router = useRouter();

// -------------------------- 1. 状态管理 --------------------------
const globalLoading = ref<boolean>(true);
const isProcessing = ref<boolean>(false);
const errorMsg = ref<string>('');
const searchName = ref<string>('');

// 分页配置（默认50条/页）
const pagination = reactive({
  pageNum: 1,
  pageSize: 50,
});

// 数据存储（allRawRecords：后端返回的所有原始数据，必须确保正确赋值）
const allRawRecords = ref<MedicalRecord[]>([]);
const userInfo = ref<UserInfo | null>(null);
const relatedGroupIds = ref<number[]>([]);

// -------------------------- 2. 计算属性（前端筛选+分页） --------------------------
const filteredRecords = computed<MedicalRecord[]>(() => {
  if (!allRawRecords.value.length) return [];
  // 模糊匹配（不区分大小写）
  const keyword = searchName.value.toLowerCase().trim();
  return allRawRecords.value.filter(record => 
    record.patient_name.toLowerCase().includes(keyword)
  );
});

const medicalRecords = computed<MedicalRecord[]>(() => {
  if (!filteredRecords.value.length) return [];
  const startIndex = (pagination.pageNum - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  return filteredRecords.value.slice(startIndex, endIndex);
});

// -------------------------- 3. 工具函数 --------------------------
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

// -------------------------- 4. 核心修复：API请求（适配后端“无输入”） --------------------------
/**
 * 初始化加载：后端无需输入参数，直接请求所有数据
 */
const initLoadData = async () => {
  try {
    globalLoading.value = true;
    console.log('开始请求后端数据：无输入参数'); // 调试：确认请求触发

    // 关键修复：后端无需输入，传入空的分页参数
    const response: PatientApiResponse = await getPatientMedicalRecords({
      pageNum: 1,
      pageSize: 1000
    }); 
    console.log('后端返回原始数据：', response); // 调试：查看后端实际返回结构

    // 验证后端返回格式（核心：确保code=200且有data字段）
    if (response?.code === 200 && response.data) {
      const { data } = response;
      
      // 1. 赋值病历数据（关键：确保medical_records键名与后端一致）
      allRawRecords.value = data.medical_records || []; 
      console.log('赋值后所有病历数据：', allRawRecords.value); // 调试：确认数据是否存入

      // 2. 赋值用户信息（同理：确保键名与后端一致）
      userInfo.value = data.user_info || null;
      // 3. 赋值关联组ID
      relatedGroupIds.value = data.related_group_ids || [];

      // 提示反馈
      if (allRawRecords.value.length > 0) {
        ElMessage.success(`成功加载${allRawRecords.value.length}条病历数据`);
      } else {
        ElMessage.info('后端返回数据为空，暂无病历记录');
      }
    } else {
      // 后端返回格式异常
      errorMsg.value = `后端响应异常：${response?.msg || '无响应信息'}`;
      ElMessage.error(errorMsg.value);
    }
  } catch (err) {
    // 捕获网络错误或API调用错误
    const error = err as Error;
    errorMsg.value = `请求失败：${error.message}`;
    ElMessage.error(errorMsg.value);
    console.error('请求错误详情：', error.stack); // 调试：查看错误堆栈
  } finally {
    globalLoading.value = false;
  }
};

// -------------------------- 5. 其他交互逻辑（不变） --------------------------
const handleSearch = () => {
  if (isProcessing.value) return;
  isProcessing.value = true;
  try {
    pagination.pageNum = 1;
    const matchCount = filteredRecords.value.length;
    ElMessage.info(`搜索完成，找到${matchCount}条匹配的病历记录`);
  } catch (err) {
    ElMessage.error(`搜索失败：${(err as Error).message}`);
  } finally {
    isProcessing.value = false;
  }
};

const handleReset = () => {
  if (isProcessing.value) return;
  isProcessing.value = true;
  try {
    searchName.value = '';
    pagination.pageNum = 1;
    pagination.pageSize = 50;
    ElMessage.success('已重置筛选条件');
  } catch (err) {
    ElMessage.error(`重置失败：${(err as Error).message}`);
  } finally {
    isProcessing.value = false;
  }
};

const handlePageChange = (page: number) => {
  if (isProcessing.value || page < 1) return;
  pagination.pageNum = page;
};

const handlePageSizeChange = (size: number) => {
  if (isProcessing.value) return;
  pagination.pageSize = size;
  pagination.pageNum = 1;
};

// 查看详情
const handleViewDetail = (row: MedicalRecord) => {
  if (isProcessing.value) return;
  
  console.log('===== 点击查看详情 =====');
  console.log('病历记录：', row);
  console.log('病历号：', row.medical_record_num);
  console.log('患者姓名：', row.patient_name);
  console.log('身份证号：', row.patient_id_num);
  
  const targetPath = `/doctor/family-patients/detail/${row.medical_record_num}`;
  console.log('目标路径：', targetPath);
  
  // 跳转到详情页，传递患者姓名、身份证号和病历号
  router.push({
    path: targetPath,
    query: {
      patientName: row.patient_name,
      patientIdCard: row.patient_id_num // 保存身份证号用于页面显示
    }
  }).then(() => {
    console.log('路由跳转成功');
  }).catch((err) => {
    console.error('路由跳转失败：', err);
  });
};

// 查看全部病历
const handleViewAllRecords = (row: MedicalRecord) => {
  if (isProcessing.value) return;
  
  console.log('===== 点击查看全部病历 =====');
  console.log('患者姓名：', row.patient_name);
  console.log('身份证号：', row.patient_id_num);
  
  const targetPath = `/doctor/family-patients/all-records/${row.patient_id_num}`;
  console.log('目标路径：', targetPath);
  
  // 跳转到全病历页面，传递患者姓名和身份证号
  router.push({
    path: targetPath,
    query: {
      patientName: row.patient_name
    }
  }).then(() => {
    console.log('全病历页面跳转成功');
  }).catch((err) => {
    console.error('全病历页面跳转失败：', err);
  });
};

// -------------------------- 6. 页面初始化 --------------------------
onMounted(() => {
  initLoadData(); // 页面加载时触发请求
});
</script>

<style scoped lang="scss">
/* 样式部分不变，保持原设计 */
.patient-record-page {
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

.user-info-card {
  .card-title {
    font-size: 16px;
    color: #374151;
    font-weight: 500;
  }
  .info-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 48px;
    padding: 16px 0;
    .info-item {
      display: flex;
      align-items: center;
      .info-label {
        color: #6b7280;
        width: 120px;
        font-size: 14px;
      }
      .info-value {
        color: #1f2937;
        font-size: 14px;
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

.search-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 0;
}

.pagination-section {
  .el-pagination {
    .el-pagination__total {
      color: #6b7280;
      margin-right: 8px;
    }
  }
}

@media (max-width: 1200px) {
  .patient-record-page {
    padding: 16px;
  }
  .user-info-card .info-grid {
    gap: 16px 32px;
  }
  .search-section {
    flex-direction: column;
    align-items: flex-start;
    .el-input {
      width: 100% !important;
      margin-right: 0 !important;
      margin-bottom: 8px;
    }
  }
}
</style>
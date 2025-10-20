<template>
  <div class="patient-detail-container">
    <el-page-header @back="handleBack" content="患者完整记录"></el-page-header>
    
    <el-card class="detail-card" shadow="hover" v-loading="loading">
      <div class="patient-summary">
        <h3>患者概要</h3>
        <el-descriptions column="2" border>
          <el-descriptions-item label="姓名">{{ patientName }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ patientIdCard }}</el-descriptions-item>
          <el-descriptions-item label="涉及机构数">{{ totalInstitutions }}</el-descriptions-item>
          <el-descriptions-item label="总记录数">{{ totalRecords }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div class="institution-records">
        <h3>机构记录详情</h3>
        <el-collapse v-model="activeInstitution" border>
          <el-collapse-item 
            :title="`机构 ${item.institution_id} (${item.institution_name}) - ${item.record_count} 条记录`" 
            :name="index"
            v-for="(item, index) in institutionRecords" 
            :key="index"
          >
            <el-table 
              :data="item.records" 
              border 
              style="width: 100%; margin-top: 10px"
              size="small"
            >
              <el-table-column prop="medical_record_num" label="病历号" width="120"></el-table-column>
              <el-table-column label="患者信息">
                <template #default="scope">
                  <el-descriptions column="1" size="small">
                    <el-descriptions-item label="姓名">{{ scope.row.patient_basic.name }}</el-descriptions-item>
                    <el-descriptions-item label="年龄">{{ scope.row.patient_basic.age }}</el-descriptions-item>
                    <el-descriptions-item label="性别">{{ scope.row.patient_basic.gender }}</el-descriptions-item>
                    <el-descriptions-item label="医生编码">{{ scope.row.patient_basic.doctor_code }}</el-descriptions-item>
                  </el-descriptions>
                </template>
              </el-table-column>
              <el-table-column label="疾病信息">
                <template #default="scope">
                  <el-descriptions column="1" size="small">
                    <el-descriptions-item label="疾病代码">{{ scope.row.disease_info.disease_code }}</el-descriptions-item>
                    <el-descriptions-item label="创建时间">{{ formatDate(scope.row.disease_info.created_time) }}</el-descriptions-item>
                    <el-descriptions-item label="更新时间">{{ formatDate(scope.row.disease_info.updated_time) }}</el-descriptions-item>
                  </el-descriptions>
                </template>
              </el-table-column>
              <el-table-column label="主治医生">
                <template #default="scope">
                  <el-descriptions column="1" size="small">
                    <el-descriptions-item label="姓名">{{ scope.row.doctor_info.doctor_name }}</el-descriptions-item>
                    <el-descriptions-item label="编码">{{ scope.row.doctor_info.doctor_code }}</el-descriptions-item>
                  </el-descriptions>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button 
                    type="text" 
                    size="small" 
                    @click="handleViewFullData(scope.row)"
                  >
                    查看完整数据
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>
    
    <!-- 完整数据弹窗（已移除相关数据项编码） -->
    <el-dialog 
      v-model="fullDataVisible" 
      title="完整数据项" 
      :width="fullWidth"
    >
      <el-descriptions column="2" border v-if="currentRecord">
        <el-descriptions-item label="病历号">{{ currentRecord.medical_record_num }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentRecord.record_time.created_time) }}</el-descriptions-item>
        
        <el-descriptions-item label="data_code1" :span="2">{{ currentRecord.data_info.data_code1 }}</el-descriptions-item>
        <el-descriptions-item label="data_code2" :span="2">{{ currentRecord.data_info.data_code2 }}</el-descriptions-item>
        <el-descriptions-item label="data_code3" :span="2">{{ currentRecord.data_info.data_code3 }}</el-descriptions-item>
        <el-descriptions-item label="data_code4" :span="2">{{ currentRecord.data_info.data_code4 }}</el-descriptions-item>
        <el-descriptions-item label="data_code5" :span="2">{{ currentRecord.data_info.data_code5 }}</el-descriptions-item>
        <el-descriptions-item label="data_code6" :span="2">{{ currentRecord.data_info.data_code6 }}</el-descriptions-item>
        <el-descriptions-item label="data_code7" :span="2">{{ currentRecord.data_info.data_code7 }}</el-descriptions-item>
        <el-descriptions-item label="data_code8" :span="2">{{ currentRecord.data_info.data_code8 }}</el-descriptions-item>
        <el-descriptions-item label="data_code9" :span="2">{{ currentRecord.data_info.data_code9 }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="fullDataVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getPatientDetail } from '@/api/doctor/doctor';
import { PatientDetailResponse, InstitutionRecords, InstitutionRecordItem } from '@/api/doctor/types';
import { ElMessage } from 'element-plus';

// 状态管理
const loading = ref<boolean>(true);
const patientIdCard = ref<string>('');
const patientName = ref<string>('');
const totalInstitutions = ref<number>(0);
const totalRecords = ref<number>(0);
const institutionRecords = ref<InstitutionRecords[]>([]);
const activeInstitution = ref<string | number>('0');
const fullDataVisible = ref<boolean>(false);
const currentRecord = ref<InstitutionRecordItem | null>(null);

// 响应式窗口宽度
const fullWidth = computed(() => {
  return window.innerWidth > 900 ? '80%' : '95%';
});

// 路由
const router = useRouter();

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 返回上一页
const handleBack = () => {
  router.back();
};

// 查看完整数据
const handleViewFullData = (record: InstitutionRecordItem) => {
  currentRecord.value = record;
  fullDataVisible.value = true;
};

// 获取患者详细信息
const fetchPatientDetail = async (patientId: string) => {
  try {
    loading.value = true;
    const response: PatientDetailResponse = await getPatientDetail(patientId);
    if (response.code === 200) {
      const data = response.data;
      patientIdCard.value = data.patient_id_card;
      totalInstitutions.value = data.total_institutions;
      totalRecords.value = data.total_records;
      institutionRecords.value = data.institution_records;
    } else {
      ElMessage.error('获取患者详情失败');
    }
  } catch (error) {
    console.error('获取患者详情错误:', error);
    ElMessage.error('获取患者详情时发生错误');
  } finally {
    loading.value = false;
  }
};

// 页面挂载时获取数据
onMounted(() => {
  // 从路由状态获取患者ID
  const routeState = history.state;
  if (routeState && routeState.patientId) {
    patientIdCard.value = routeState.patientId;
    patientName.value = routeState.patientName || '';
    fetchPatientDetail(routeState.patientId);
  } else {
    ElMessage.error('未找到患者ID');
    router.push('/patient-list');
  }
});
</script>

<style scoped>
.patient-detail-container {
  padding: 20px;
}

.patient-summary, .institution-records {
  margin-bottom: 25px;
}

h3 {
  margin-bottom: 15px;
  color: #1f2329;
  font-size: 16px;
  font-weight: 600;
}

.el-collapse {
  margin-top: 10px;
}

.el-collapse-item__content {
  padding-top: 15px !important;
}
</style>
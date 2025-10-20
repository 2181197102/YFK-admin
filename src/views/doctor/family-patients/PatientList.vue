<template>
  <div class="patient-list-page">
    <!-- 页面标题 -->
    <el-page-header 
      @back="handleBack" 
      content="当前机构患者列表"
    ></el-page-header>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="hover">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input 
            v-model="filter.name" 
            placeholder="搜索患者姓名" 
            prefix-icon="Search"
            clearable
          ></el-input>
        </el-col>
        <el-col :span="6">
          <el-input 
            v-model="filter.idCard" 
            placeholder="搜索身份证号" 
            prefix-icon="Document"
            clearable
          ></el-input>
        </el-col>
        <el-col :span="6">
          <el-select 
            v-model="filter.diseaseCode" 
            placeholder="筛选疾病代码"
            clearable
          >
            <el-option 
              v-for="code in diseaseCodeList" 
              :key="code" 
              :label="code" 
              :value="code"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button 
            type="primary" 
            @click="resetFilter"
          >
            重置筛选
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 患者列表 -->
    <el-card class="patient-table-card" shadow="hover" v-loading="loading">
      <div class="table-header">
        <h2>患者信息列表</h2>
        <div class="summary-tags">
          <el-tag type="info">当前机构: {{ institutionName }}</el-tag>
          <el-tag type="success">主治医生: {{ doctorName }}</el-tag>
          <el-tag type="warning">患者总数: {{ totalCount }}</el-tag>
        </div>
      </div>

      <!-- 患者表格 -->
      <el-table 
        :data="filteredPatients" 
        border 
        stripe
        size="mini"
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="patient_name" label="患者姓名" width="120"></el-table-column>
        <el-table-column label="基本信息">
          <template #default="scope">
            <div class="basic-info">
              <p>年龄: {{ scope.row.basic_info.age }}岁</p>
              <p>性别: {{ scope.row.basic_info.gender }}</p>
              <p>医生编码: {{ scope.row.basic_info.doctor_code }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="patient_id_num" label="身份证号" width="180"></el-table-column>
        <el-table-column prop="medical_record_num" label="病历号" width="100"></el-table-column>
        <el-table-column prop="disease_code" label="疾病代码" width="100">
          <template #default="scope">
            <el-tag :type="getDiseaseTagType(scope.row.disease_code)">
              {{ scope.row.disease_code }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="record_timestamps.created_time" label="创建时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.record_timestamps.created_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              icon="Scale"
              @click="goToTrustValue(scope.row)"
            >
              信任值计算
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <div v-if="!loading && filteredPatients.length === 0" class="empty-state">
        <el-empty description="暂无患者数据"></el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getMyPatients } from '@/api/doctor/doctor';
import { PatientsResponse, PatientItem, FilterParams } from '@/api/doctor/types';
import { ElMessage } from 'element-plus';

// 状态管理
const loading = ref<boolean>(false);
const doctorName = ref<string>('');
const institutionId = ref<number>(0);
const institutionName = ref<string>('');
const totalCount = ref<number>(0);
const patients = ref<PatientItem[]>([]);
const diseaseCodeList = ref<string[]>([]);

// 筛选条件
const filter = ref<FilterParams>({
  name: '',
  idCard: '',
  diseaseCode: ''
});

// 路由实例
const router = useRouter();

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 根据疾病代码获取标签类型
const getDiseaseTagType = (code: string) => {
  const typeMap: Record<string, string> = {
    'E': 'warning',
    'I': 'danger',
    'J': 'info',
    'M': 'success'
  };
  return typeMap[code.charAt(0)] || 'primary';
};

// 筛选患者
const filteredPatients = computed<PatientItem[]>(() => {
  return patients.value.filter(item => {
    const matchName = item.patient_name.toLowerCase().includes(filter.value.name.toLowerCase());
    const matchId = item.patient_id_num.includes(filter.value.idCard);
    const matchDisease = !filter.value.diseaseCode || item.disease_code === filter.value.diseaseCode;
    return matchName && matchId && matchDisease;
  });
});

// 重置筛选条件
const resetFilter = () => {
  filter.value = {
    name: '',
    idCard: '',
    diseaseCode: ''
  };
};

// 跳转到信任值计算页面
const goToTrustValue = (patient: PatientItem) => {
  router.push({
    name: 'TrustValue',
    state: {
      patientId: patient.patient_id_num,
      patientName: patient.patient_name,
      medicalRecordNum: patient.medical_record_num
    }
  });
};

// 返回上一页
const handleBack = () => {
  router.back();
};

// 获取患者列表数据
const loadPatientData = async () => {
  try {
    loading.value = true;
    const response: PatientsResponse = await getMyPatients();
    
    if (response.code === 200 && response.data) {
      const { doctor_name, institution_id, patient_count, patients: patientList } = response.data;
      
      // 更新页面数据
      doctorName.value = doctor_name;
      institutionId.value = institution_id;
      institutionName.value = `机构${institution_id}`;
      totalCount.value = patient_count;
      patients.value = patientList || [];
      
      // 提取疾病代码列表
      const codes = Array.from(new Set(patientList.map(item => item.disease_code)));
      diseaseCodeList.value = codes;
    } else {
      ElMessage.error(response.msg || '获取患者列表失败');
    }
  } catch (error) {
    console.error('加载患者数据失败:', error);
    ElMessage.error('加载患者数据时发生错误');
  } finally {
    loading.value = false;
  }
};

// 页面挂载时加载数据
onMounted(() => {
  loadPatientData();
});
</script>

<style scoped>
.patient-list-page {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
  padding: 15px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.summary-tags {
  display: flex;
  gap: 10px;
}

.basic-info {
  line-height: 1.5;
}

.empty-state {
  margin: 60px 0;
  text-align: center;
}

h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
</style>
<template>
  <div class="query-container">
    <el-card class="main-card">
      <div slot="header" class="card-header">
        <h2>医疗数据查询条件选择</h2>
        <p>请选择需要查询的机构、病种和数据项</p>
      </div>

      <el-form 
        ref="formRef" 
        :model="queryParams" 
        class="query-form"
      >
        <!-- 机构选择 -->
        <el-form-item 
          label="选择机构" 
          class="form-item"
          :error="insError"
        >
          <el-checkbox-group 
            v-model="queryParams.ins_codes" 
            class="checkbox-group"
            @change="validateInsSelection"
          >
            <el-checkbox 
              v-for="ins in institutions" 
              :key="ins.id" 
              :label="ins.id"
              class="checkbox-item"
            >
              {{ ins.name }} (ID: {{ ins.id }})
            </el-checkbox>
          </el-checkbox-group>
          <div class="form-hint">可多选，支持机构1-3</div>
        </el-form-item>

        <!-- 病种选择 -->
        <el-form-item 
          label="选择病种代码" 
          class="form-item"
          :error="diseaseError"
        >
          <el-checkbox-group 
            v-model="queryParams.disease_codes" 
            class="checkbox-group"
            @change="handleDiseaseChange"
          >
            <el-checkbox 
              v-for="disease in diseases" 
              :key="disease.code" 
              :label="disease.code"
              class="checkbox-item"
            >
              <span class="code">{{ disease.code }}</span>
              <span class="name">{{ disease.name }}</span>
            </el-checkbox>
          </el-checkbox-group>
          <div class="form-hint">可多选，选择需要查询的病种</div>
        </el-form-item>

        <!-- 数据项选择（根据选中的病种动态显示） -->
        <el-form-item 
          label="选择数据项" 
          class="form-item"
          :error="fieldError"
          v-if="showFieldSelection"
        >
          <el-checkbox-group 
            v-model="queryParams.data_code" 
            class="checkbox-group"
            @change="validateFieldSelection"
          >
            <el-checkbox 
              v-for="field in availableFields" 
              :key="field" 
              :label="field"
              class="checkbox-item"
            >
              {{ field }}
            </el-checkbox>
          </el-checkbox-group>
          <div class="form-hint">可多选，选择需要查询的数据项</div>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item class="form-actions">
          <el-button 
            type="primary" 
            @click="submitQuery"
            :loading="loading"
            :disabled="!isValid"
          >
            <el-icon v-if="loading"><Loading /></el-icon>
            <span>提交查询</span>
          </el-button>
          <el-button 
            type="default" 
            @click="resetForm"
            :disabled="loading"
          >
            重置选择
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { QueryParams, Institution, Disease, DiseaseDataCodeResponse } from '@/api/researchers/types';
import { checkTrustValue, getDiseaseDataCodes } from '@/api/researchers/researchers';

// 路由实例
const router = useRouter();

// 机构数据
const institutions: Institution[] = [
  { id: 1, name: '机构1' },
  { id: 2, name: '机构2' },
  { id: 3, name: '机构3' }
];

// 病种数据
const diseases: Disease[] = [
  { code: 'I10', name: '高血压' },
  { code: 'I25.1', name: '冠心病' },
  { code: 'E10', name: '糖尿病' },
  { code: 'J44', name: '慢阻肺' }
];

// 所有病种对应的数据项
const diseaseDataCodes = ref<Record<string, string[]>>({});

// 查询参数
const queryParams = reactive<QueryParams>({
  ins_codes: [],
  disease_codes: [],
  data_code: []
});

// 错误提示
const insError = ref('');
const diseaseError = ref('');
const fieldError = ref('');

// 状态管理
const loading = ref(false);
const loadingFields = ref(false);

// 表单验证
const validateInsSelection = () => {
  insError.value = queryParams.ins_codes.length > 0 ? '' : '请至少选择一个机构';
};

const validateDiseaseSelection = () => {
  diseaseError.value = queryParams.disease_codes.length > 0 ? '' : '请至少选择一个病种';
};

const validateFieldSelection = () => {
  fieldError.value = queryParams.data_code?.length ? '' : '请至少选择一个数据项';
};

// 检查表单是否有效
const isValid = computed(() => {
  return queryParams.ins_codes.length > 0 && 
         queryParams.disease_codes.length > 0 && 
         (queryParams.data_code?.length || 0) > 0;
});

// 显示数据项选择区域
const showFieldSelection = computed(() => {
  return queryParams.disease_codes.length > 0 && Object.keys(diseaseDataCodes.value).length > 0;
});

// 获取当前可选的数据项（所有选中病种的数据项并集）
const availableFields = computed(() => {
  if (!queryParams.disease_codes.length) return [];
  
  const fieldsSet = new Set<string>();
  queryParams.disease_codes.forEach(code => {
    if (diseaseDataCodes.value[code]) {
      diseaseDataCodes.value[code].forEach(field => fieldsSet.add(field));
    }
  });
  
  return Array.from(fieldsSet).sort();
});

// 加载病种数据项映射
const loadDiseaseDataCodes = async () => {
  try {
    loadingFields.value = true;
    const response: DiseaseDataCodeResponse = await getDiseaseDataCodes();
    if (response.status === 'success') {
      diseaseDataCodes.value = response.data;
    } else {
      ElMessage.warning(response.message || '获取病种数据项失败');
    }
  } catch (error: any) {
    ElMessage.error(`加载数据项失败: ${error.message}`);
  } finally {
    loadingFields.value = false;
  }
};

// 当病种选择变化时
const handleDiseaseChange = () => {
  validateDiseaseSelection();
  // 重置已选数据项
  queryParams.data_code = [];
  fieldError.value = '';
};

// 提交查询
const submitQuery = async () => {
  // 验证表单
  validateInsSelection();
  validateDiseaseSelection();
  validateFieldSelection();
  
  if (!isValid.value) return;
  
  loading.value = true;
  try {
    // 调用API检查信任值
    // ElMessage.error(queryParams.data_code?.join(','));
    // ElMessage.error(queryParams.disease_codes?.join(','));
    const trustValueData = await checkTrustValue(queryParams);
    
    // 导航到信任值展示页面
    router.push({
      name: 'ProjectStats',
      query: {
        params: JSON.stringify(queryParams),
        trustData: JSON.stringify(trustValueData)
      }
    });
    
  } catch (error: any) {
    ElMessage.error(`查询失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  queryParams.ins_codes = [];
  queryParams.disease_codes = [];
  queryParams.data_code = [];
  insError.value = '';
  diseaseError.value = '';
  fieldError.value = '';
};

// 页面加载时获取病种数据项映射
onMounted(() => {
  loadDiseaseDataCodes();
});
</script>

<style scoped>
.query-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

.main-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.card-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.query-form {
  margin-top: 20px;
}

.form-item {
  margin-bottom: 24px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 8px;
}

.checkbox-item {
  margin: 0 !important;
}

.code {
  font-weight: 500;
  margin-right: 8px;
}

.name {
  color: #666;
  font-size: 14px;
}

.form-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}
</style>

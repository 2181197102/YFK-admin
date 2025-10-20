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
        <!-- 机构选择（保留原逻辑） -->
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

        <!-- 病种选择（改为动态加载，显示病种名称） -->
        <el-form-item 
          label="选择病种代码" 
          class="form-item"
          :error="diseaseError"
          :loading="loadingDiseases"
        >
          <el-checkbox-group 
            v-model="queryParams.disease_codes" 
            class="checkbox-group"
            @change="handleDiseaseChange"
            v-if="Object.keys(diseaseList).length > 0"
          >
            <el-checkbox 
              v-for="(diseaseInfo, code) in diseaseList" 
              :key="code" 
              :label="code"
              class="checkbox-item"
            >
              <span class="code">{{ code }}</span>
              <span class="name">({{ diseaseInfo.diseaseName }})</span>
            </el-checkbox>
          </el-checkbox-group>
          <!-- 病种加载中提示 -->
          <div class="loading-tip" v-else-if="loadingDiseases">
            <el-icon size="16"><Loading /></el-icon>
            <span>正在加载病种数据...</span>
          </div>
          <!-- 病种加载失败提示 -->
          <div class="error-tip" v-else>
            <el-icon size="16" color="#F56C6C"><CircleClose /></el-icon>
            <span>病种数据加载失败，请刷新页面重试</span>
          </div>
          <div class="form-hint">可多选，选择需要查询的病种</div>
        </el-form-item>

        <!-- 数据项选择（带备注显示：data_code(remark)） -->
        <el-form-item 
          label="选择数据项" 
          class="form-item"
          :error="fieldError"
          v-if="showFieldSelection"
          :loading="loadingFields"
        >
          <el-checkbox-group 
            v-model="queryParams.data_code" 
            class="checkbox-group"
            @change="validateFieldSelection"
            v-if="availableFields.length > 0"
          >
            <el-checkbox 
              v-for="field in availableFields" 
              :key="field.data_code" 
              :label="field.data_code"
              class="checkbox-item"
            >
              <span class="code">{{ field.data_code }}</span>
              <span class="remark">({{ field.remark }})</span>
            </el-checkbox>
          </el-checkbox-group>
          <!-- 数据项加载中提示 -->
          <div class="loading-tip" v-else-if="loadingFields">
            <el-icon size="16"><Loading /></el-icon>
            <span>正在加载数据项...</span>
          </div>
          <!-- 无数据项提示 -->
          <div class="empty-tip" v-else>
            <el-icon size="16" color="#909399"><InfoFilled /></el-icon>
            <span>当前选中病种无匹配数据项</span>
          </div>
          <div class="form-hint">可多选，选择需要查询的数据项（格式：数据编码(备注)）</div>
        </el-form-item>

        <!-- 操作按钮（保留原逻辑） -->
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
import { Loading, CircleClose, InfoFilled } from '@element-plus/icons-vue';
// 导入类型（若有需要，可根据实际项目调整）
import { QueryParams, Institution } from '@/api/researchers/types';
import { checkTrustValue, getDiseaseDataCodes } from '@/api/researchers/researchers';

// 路由实例
const router = useRouter();

// 机构数据（保留原数据，若需动态加载可参考病种逻辑）
const institutions: Institution[] = [
  { id: 1, name: '机构1' },
  { id: 2, name: '机构2' },
  { id: 3, name: '机构3' }
];

// 新增：病种相关状态
const diseaseList = ref<Record<string, { diseaseName: string }>>({}); // 动态加载的病种列表（code: {名称}）
const loadingDiseases = ref(false); // 病种加载状态
const diseaseDataMap = ref<Record<string, Array<{ data_code: string; remark: string }>>>({}); // 病种-数据项映射（含备注）

// 查询参数（保留原结构）
const queryParams = reactive<QueryParams>({
  ins_codes: [],
  disease_codes: [],
  data_code: [],
  data_type: [],        // data_type数组（可选）
  security_category: [],// 安全类别数组（可选）
  security_level: [],   // security_level数组（可选）
  Trustvalue: 0 // 补充Trustvalue默认值，避免类型报错
});

// 错误提示（保留原逻辑）
const insError = ref('');
const diseaseError = ref('');
const fieldError = ref('');

// 状态管理（保留原逻辑，新增数据项加载状态）
const loading = ref(false);
const loadingFields = ref(false);

// 表单验证（保留原逻辑）
const validateInsSelection = () => {
  insError.value = queryParams.ins_codes.length > 0 ? '' : '请至少选择一个机构';
};

const validateDiseaseSelection = () => {
  diseaseError.value = queryParams.disease_codes.length > 0 ? '' : '请至少选择一个病种';
};

const validateFieldSelection = () => {
  fieldError.value = queryParams.data_code?.length ? '' : '请至少选择一个数据项';
};

// 检查表单是否有效（保留原逻辑）
const isValid = computed(() => {
  return queryParams.ins_codes.length > 0 && 
         queryParams.disease_codes.length > 0 && 
         (queryParams.data_code?.length || 0) > 0;
});

// 显示数据项选择区域（保留原逻辑）
const showFieldSelection = computed(() => {
  return queryParams.disease_codes.length > 0 && Object.keys(diseaseDataMap.value).length > 0;
});

// 核心优化：获取当前可选的数据项（带备注，去重）
const availableFields = computed(() => {
  if (!queryParams.disease_codes.length) return [];
  
  const uniqueFields = new Map<string, { data_code: string; remark: string }>();
  // 遍历选中的病种，收集对应的所有数据项（含备注）
  queryParams.disease_codes.forEach(code => {
    const fields = diseaseDataMap.value[code] || [];
    fields.forEach(field => {
      // 用data_code作为key去重，避免不同病种的相同数据项重复显示
      if (!uniqueFields.has(field.data_code)) {
        uniqueFields.set(field.data_code, field);
      }
    });
  });
  
  // 转为数组并按data_code排序，保证显示顺序一致
  return Array.from(uniqueFields.values()).sort((a, b) => a.data_code.localeCompare(b.data_code));
});

// 核心优化1：动态加载病种列表和病种-数据项映射
const loadDiseaseAndData = async () => {
  try {
    loadingDiseases.value = true;
    // 1. 请求接口获取完整的病种数据（含数据项和备注）
    // ElMessage.error(`222222222222`);
    const response = await getDiseaseDataCodes();
    if (response.status !== 'success') {
      // ElMessage.error(`3333333333`);
      throw new Error(response.message || '病种数据请求失败');
    }
    // ElMessage.error(`111111111`);
    // 2. 处理病种列表：提取所有disease_code，并自定义病种名称（若接口返回名称可直接用，这里示例用"病种+code"）
    const diseaseCodes = Object.keys(response.data);
    // ElMessage.error(diseaseCodes.data.value);
    const tempDiseaseList: Record<string, { diseaseName: string }> = {};
    diseaseCodes.forEach(code => {
      // 示例：若接口未返回病种名称，可按规则生成（如"高血压(I10)"），若接口有名称则替换为response.data[code][0].disease_name
      tempDiseaseList[code] = { diseaseName: `病种${code}` };
    });
    diseaseList.value = tempDiseaseList;

    // 3. 处理病种-数据项映射：提取每个病种的data_code和remark
    const tempDataMap: Record<string, Array<{ data_code: string; remark: string}>> = {};
    diseaseCodes.forEach(code => {
      // 从接口返回的该病种数据中，提取data_code和remark字段
      tempDataMap[code] = response.data[code].map(item => ({
        data_code: item.data_code,
        remark: item.remark || '无备注' // 处理备注为空的情况
      }));
    });
    diseaseDataMap.value = tempDataMap;

  } catch (error: any) {
    ElMessage.error(`病种数据加载失败: ${error.message}`);
    diseaseList.value = {};
    diseaseDataMap.value = {};
  } finally {
    loadingDiseases.value = false;
  }
};

// 病种选择变化时的处理（保留原逻辑，优化数据项加载状态）
const handleDiseaseChange = () => {
  validateDiseaseSelection();
  // 重置已选数据项
  queryParams.data_code = [];
  fieldError.value = '';
  // 若有选中病种，标记数据项加载中（提升用户感知）
  if (queryParams.disease_codes.length > 0) {
    loadingFields.value = true;
    // 延迟关闭加载状态（模拟加载过程，避免闪烁）
    setTimeout(() => loadingFields.value = false, 300);
  }
};

// 提交查询（保留原逻辑，无修改）
const submitQuery = async () => {
  // 验证表单
  validateInsSelection();
  validateDiseaseSelection();
  validateFieldSelection();
  
  if (!isValid.value) return;
  
  loading.value = true;
  try {
    // 调用API检查信任值
    const trustValueData = await checkTrustValue(queryParams);
    queryParams.Trustvalue = trustValueData.Trustvalue;
    
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

// 重置表单（保留原逻辑，新增重置数据项映射相关状态）
const resetForm = () => {
  queryParams.ins_codes = [];
  queryParams.disease_codes = [];
  queryParams.data_code = [];
  insError.value = '';
  diseaseError.value = '';
  fieldError.value = '';
};

// 页面加载时：动态加载病种和数据项（替换原loadDiseaseDataCodes）
onMounted(() => {
  loadDiseaseAndData();
});
</script>

<style scoped>
/* 保留原样式，新增加载/错误提示样式 */
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
  white-space: nowrap; /* 防止数据项名称换行 */
}

.code {
  font-weight: 500;
  margin-right: 4px;
}

.name {
  color: #666;
  font-size: 14px;
}

/* 新增：备注样式 */
.remark {
  color: #909399;
  font-size: 13px;
  margin-left: 4px;
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

/* 新增：加载提示样式 */
.loading-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: #606266;
  font-size: 14px;
}

/* 新增：错误提示样式 */
.error-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: #F56C6C;
  font-size: 14px;
}

/* 新增：空数据提示样式 */
.empty-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: #909399;
  font-size: 14px;
}
</style>
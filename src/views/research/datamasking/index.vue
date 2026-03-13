<template>
  <div class="data-masking-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-page-header 
        @back="handleBack"
        content="数据脱敏处理"
      />
      <div class="page-subtitle">
        基于信任值计算结果，对医疗数据进行安全脱敏处理
      </div>
    </div>

    <!-- 查询信息展示 -->
    <div class="query-info" v-if="queryInfo">
      <h3 class="query-title">
        <el-icon><Search /></el-icon>
        查询信息
      </h3>
      <div class="query-details">
        <div class="detail-item">
          <span class="label">机构：</span>
          <span class="value">{{ queryInfo.institutionNames }}</span>
        </div>
        <div class="detail-item">
          <span class="label">病种：</span>
          <span class="value">{{ queryInfo.diseaseNames }}</span>
        </div>
        <div class="detail-item">
          <span class="label">数据项：</span>
          <span class="value">{{ queryInfo.dataCodes.join(', ') }}</span>
        </div>
        <div class="detail-item">
          <span class="label">数据量：</span>
          <span class="value">{{ queryInfo.dataCount }} 条</span>
        </div>
      </div>
    </div>

    <!-- 信任值结果展示 -->
    <div class="trust-result" v-if="trustValueData">
      <el-alert
        :title="`信任值计算结果: ${trustValueData.Trustvalue}`"
        :type="trustValueData.Trustvalue >= 0.7 ? 'success' : trustValueData.Trustvalue >= 0.4 ? 'warning' : 'error'"
        :description="getTrustDescription(trustValueData.Trustvalue)"
        show-icon
        :closable="false"
        class="trust-alert"
      />
    </div>

    <el-form 
      ref="configFormRef" 
      :model="configForm" 
      label-width="120px"
      class="config-form"
    >
      <!-- 字段选择 -->
      <el-form-item label="脱敏字段" required>
        <div class="field-selection">
          <div class="select-all">
            <el-checkbox 
              v-model="selectAll" 
              @change="handleSelectAll"
            >
              全选/取消全选
            </el-checkbox>
          </div>
          <div class="checkbox-grid">
            <el-checkbox-group v-model="configForm.selected_headers">
              <el-checkbox 
                v-for="header in queryInfo?.dataCodes || []" 
                :key="header" 
                :label="header"
                class="checkbox-item"
              >
                {{ header }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </el-form-item>

      <!-- 记录数量 -->
      <el-form-item label="记录数量" required>
        <el-input-number
          v-model="configForm.record_count"
          :min="1"
          :max="1000"
          :step="10"
          :disabled="true"
          controls-position="right"
          placeholder="请输入记录数量"
        />
        <div class="form-hint">
          数据量已从信任值检查界面传入，不可修改
        </div>
      </el-form-item>

      <!-- 应用场景 -->
      <el-form-item label="应用场景" required>
        <div class="scenario-selection">
          <el-checkbox-group v-model="configForm.scenario" class="scenario-grid">
            <el-checkbox 
              v-for="scenario in scenarioOptions" 
              :key="scenario.value" 
              :label="scenario.value"
              class="scenario-item"
            >
              <div class="scenario-content">
                <div class="scenario-icon">{{ scenario.icon }}</div>
                <div class="scenario-info">
                  <div class="scenario-name">{{ scenario.label }}</div>
                  <div class="scenario-desc">{{ scenario.description }}</div>
                </div>
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </el-form-item>

      <!-- 脱敏方法 -->
      <el-form-item label="脱敏方法" required>
        <div class="method-selection">
          <el-radio-group v-model="configForm.method" class="method-grid">
            <el-radio 
              v-for="method in methodOptions" 
              :key="method.value" 
              :label="method.value"
              :class="['method-item', { 'smart-choice': method.value === '智能选择' }]"
            >
              <div class="method-content">
                <div class="method-icon">{{ method.icon }}</div>
                <div class="method-info">
                  <div class="method-name">{{ method.label }}</div>
                  <div class="method-desc">{{ method.description }}</div>
                  <div class="method-features">
                    <el-tag 
                      v-for="feature in method.features" 
                      :key="feature"
                      size="small"
                      type="info"
                      class="feature-tag"
                    >
                      {{ feature }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-radio>
          </el-radio-group>
        </div>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <div class="form-actions">
          <el-button 
            type="primary" 
            @click="handleProcess"
            :loading="processing"
            :disabled="!isFormValid"
          >
            <el-icon v-if="!processing"><Star /></el-icon>
            <span>{{ processing ? '处理中...' : '开始脱敏处理' }}</span>
          </el-button>
          
          <el-button @click="resetProcess">
            重置
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <!-- 处理结果 -->
    <div v-if="currentStep === 2" class="result-container">
      <el-card class="result-card">
        <template #header>
          <div class="result-header">
            <el-icon class="success-icon"><Check /></el-icon>
            <h3>脱敏处理完成</h3>
          </div>
        </template>

        <div class="safety-score">
          安全评分: <span class="score-value">{{ safetyScore }}</span>
        </div>

        <el-tabs v-model="activeTab" class="result-tabs">
          <el-tab-pane label="数据效用评估" name="utility">
            <div class="table-container" v-html="evalTable"></div>
          </el-tab-pane>
          <el-tab-pane label="隐私保护评估" name="privacy">
            <div class="table-container" v-html="privacyTable"></div>
          </el-tab-pane>
        </el-tabs>

        <div class="result-actions">
          <el-button type="success" @click="viewOriginalData">
            查看原始数据
          </el-button>
          <el-button type="primary" @click="viewMaskedData">
            查看脱敏数据
          </el-button>
          <el-button type="warning" @click="handleDownloadMaskedFile">
            下载脱敏文件
          </el-button>
        </div>
        
        <!-- 预览对话框 -->
        <el-dialog
          v-model="previewDialogVisible"
          :title="previewTitle"
          width="70%"
          top="8vh"
          class="preview-left-dialog"
        >
          <div v-if="previewRows.length === 0">暂无数据</div>
          <div v-else class="table-wrapper">
            <table class="preview-table">
              <thead>
                <tr>
                  <th v-for="h in previewHeaders" :key="h">{{ h }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in previewRows" :key="idx">
                  <td v-for="h in previewHeaders" :key="h">{{ row?.[h] ?? '' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <template #footer>
            <el-button @click="previewDialogVisible = false">关闭</el-button>
          </template>
        </el-dialog>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Star, Check } from '@element-plus/icons-vue';
import { 
  processDataMasking, 
  downloadMaskedFile,
  getMedicalRecords
} from '@/api/researchers/researchers';
import { 
  DataMaskingRequest,
  DataMaskingResponse,
  DataMaskingMethod,
  DataMaskingScenario,
  TrustValueResponse,
  DataCodeDetail,
  QueryParams
} from '@/api/researchers/types';

// 路由实例
const route = useRoute();

// 机构数据映射
const institutions = [
  { id: 1, name: '机构1' },
  { id: 2, name: '机构2' },
  { id: 3, name: '机构3' }
];

// 应用场景选项
const scenarioOptions = [
  {
    value: '决策',
    label: '决策支持',
    icon: '🎯',
    description: '用于医疗决策和诊断支持'
  },
  {
    value: '展示',
    label: '数据展示',
    icon: '📊',
    description: '用于数据可视化和报告展示'
  },
  {
    value: '分析',
    label: '数据分析',
    icon: '🔍',
    description: '用于统计分析和趋势研究'
  },
  {
    value: '预测',
    label: '预测建模',
    icon: '🔮',
    description: '用于机器学习预测模型'
  }
];

// 脱敏方法选项
const methodOptions = [
  {
    value: '智能选择',
    label: '智能选择脱敏策略',
    icon: '🧠',
    description: 'AI智能分析数据特征，自动选择最优脱敏策略',
    features: ['AI分析', '自动选择', '最优策略']
  },
  {
    value: 'k-匿名',
    label: 'K-匿名',
    icon: '🛡️',
    description: '通过泛化和抑制实现k-匿名保护',
    features: ['泛化', '抑制', 'k值控制']
  },
  {
    value: '差分隐私',
    label: '差分隐私',
    icon: '🔒',
    description: '添加噪声保护个体隐私',
    features: ['噪声注入', '隐私预算', 'ε-差分隐私']
  },
  {
    value: '对抗生成网络',
    label: '对抗生成网络',
    icon: '🤖',
    description: '使用GAN生成合成数据',
    features: ['生成对抗', '合成数据', '隐私保护']
  }
];

// 响应式数据
const currentStep = ref(1);
const processing = ref(false);
const safetyScore = ref(0);
const evalTable = ref('');
const privacyTable = ref('');
const activeTab = ref('utility');
const taskId = ref<number | null>(null);

// 预览对话框
const previewDialogVisible = ref(false);
const previewTitle = ref('数据预览');
const previewRows = ref<any[]>([]);
const previewHeaders = ref<string[]>([]);

// 脱敏响应缓存（一次响应完成渲染）
const originalPreviewRows = ref<any[]>([]);
const maskedPreviewRows = ref<any[]>([]);
const maskedFullRows = ref<any[]>([]);
const selectedMethod = ref<string>('');
const privacyRiskScore = ref<number>(0);

// 查询信息
const queryInfo = ref<{
  institutionNames: string;
  diseaseNames: string;
  dataCodes: string[];
  dataCount: number;
} | null>(null);

// 信任值数据
const trustValueData = ref<TrustValueResponse | null>(null);

// 数据项详细信息
const dataCodeDetails = ref<Record<string, DataCodeDetail>>({});

// 医疗数据结果
const medicalResults = ref<Array<{
  [key: string]: any;
  medical_record_num: string;
  institution: string;
}>>([]);

// 配置表单
const configForm = reactive<{
  selected_headers: string[];
  record_count: number;
  scenario: string[];
  method: string;
}>({
  selected_headers: [],
  record_count: 100,
  scenario: [],
  method: ''
});

// 表单验证
const isFormValid = computed(() => {
  return configForm.selected_headers.length > 0 && 
         configForm.record_count > 0 &&
         configForm.scenario.length > 0 &&
         configForm.method !== '';
});

// 全选状态
const selectAll = computed({
  get: () => {
    if (!queryInfo.value?.dataCodes) return false;
    return configForm.selected_headers.length === queryInfo.value.dataCodes.length;
  },
  set: (value: boolean) => {
    if (value) {
      configForm.selected_headers = [...(queryInfo.value?.dataCodes || [])];
    } else {
      configForm.selected_headers = [];
    }
  }
});

// 处理全选
const handleSelectAll = (checked: boolean) => {
  if (checked) {
    configForm.selected_headers = [...(queryInfo.value?.dataCodes || [])];
  } else {
    configForm.selected_headers = [];
  }
};

// 获取信任值描述
const getTrustDescription = (trustValue: number) => {
  if (trustValue >= 0.8) return '信任值优秀，可以进行数据脱敏处理';
  if (trustValue >= 0.6) return '信任值良好，建议谨慎进行数据脱敏';
  if (trustValue >= 0.4) return '信任值一般，需要严格的数据脱敏';
  return '信任值较低，不建议进行数据脱敏处理';
};

// 处理脱敏
const handleProcess = async () => {
  if (!isFormValid.value) {
    ElMessage.warning('请完善所有必填项');
    return;
  }

  processing.value = true;
  
  try {
    // 准备请求数据（包含所有必要字段）
    const requestData: DataMaskingRequest = {
      selected_headers: configForm.selected_headers,  // 数据字段
      record_count: configForm.record_count,          // 记录数量
      scenario: configForm.scenario[0] as DataMaskingScenario,  // 应用场景
      method: configForm.method as DataMaskingMethod,  // 脱敏方法
      data_code_details: dataCodeDetails.value,        // 数据项详细信息
      results: medicalResults.value                    // 医疗数据结果
    };
    
    console.log('发送到后端的完整请求数据:', requestData);
    
    const response: DataMaskingResponse = await processDataMasking(requestData);
    
    if (response.status === 'ok') {
      // 保存任务ID
      taskId.value = response.result.task_id;
      
      // 新增：直接使用一次响应中的结果渲染
      const res: any = (response as any).result || {};
      // 概览
      privacyRiskScore.value = res.privacy_risk_score ?? 0;
      selectedMethod.value = res.selected_method ?? '';
      safetyScore.value = res.privacy_risk_score ?? 0;
      
      // 预览与完整数据
      originalPreviewRows.value = Array.isArray(res.original_preview) ? res.original_preview : [];
      maskedPreviewRows.value = Array.isArray(res.masked_preview) ? res.masked_preview : [];
      maskedFullRows.value = Array.isArray(res.masked_data) ? res.masked_data : maskedPreviewRows.value;
      
      // 评估表（将数组渲染为简单表格HTML）
      const buildTable = (rows: any[]): string => {
        if (!Array.isArray(rows) || rows.length === 0) return '<div>无评估结果</div>';
        const headers = Object.keys(rows[0] ?? {});
        const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
        const tbody = `<tbody>${rows.map(r => `<tr>${headers.map(h => `<td>${r?.[h] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>`;
        return `<table border="1" cellspacing="0" cellpadding="6">${thead}${tbody}</table>`;
      };
      // utility_metrics 专用渲染（列顺序固定：model, Acc, AUC, F1_Score）
      const buildUtilityTable = (rows: any[]): string => {
        if (!Array.isArray(rows) || rows.length === 0) return '<div>无评估结果</div>';
        const preferred = ['model', 'Acc', 'AUC', 'F1_Score'];
        const hasAllPreferred = preferred.every(h => Object.prototype.hasOwnProperty.call(rows[0] ?? {}, h));
        const headers = hasAllPreferred ? preferred : Object.keys(rows[0] ?? {});
        const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
        const tbody = `<tbody>${rows.map(r => {
          return `<tr>${headers.map(h => {
            const v = r?.[h];
            // 已由后端保留6位小数；这里仅透传显示
            return `<td>${v ?? ''}</td>`;
          }).join('')}</tr>`;
        }).join('')}</tbody>`;
        return `<table border="1" cellspacing="0" cellpadding="6">${thead}${tbody}</table>`;
      };
      evalTable.value = buildUtilityTable(Array.isArray(res.utility_metrics) ? res.utility_metrics : []);
      // privacy_metrics 使用后端提供的 privacy_columns 固定顺序渲染
      const buildPrivacyTable = (rows: any[], columns: string[] | undefined): string => {
        const headers = Array.isArray(columns) && columns.length > 0
          ? columns
          : (Array.isArray(rows) && rows.length > 0 ? Object.keys(rows[0] ?? {}) : []);
        if (!Array.isArray(rows) || rows.length === 0 || headers.length === 0) {
          return '<div>无评估结果</div>';
        }
        const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
        const tbody = `<tbody>${rows.map(r => `<tr>${headers.map(h => `<td>${r?.[h] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>`;
        return `<table border="1" cellspacing="0" cellpadding="6">${thead}${tbody}</table>`;
      };
      privacyTable.value = buildPrivacyTable(
        Array.isArray(res.privacy_metrics) ? res.privacy_metrics : [],
        Array.isArray(res.privacy_columns) ? res.privacy_columns : undefined
      );
      
      // 更新步骤并提示
      currentStep.value = 2;
      ElMessage.success('数据脱敏处理完成');
    } else {
      ElMessage.error(response.message || '脱敏处理失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '脱敏处理失败');
  } finally {
    processing.value = false;
  }
};

// 查看原始数据
const viewOriginalData = async () => {
  // 直接使用一次响应中的 original_preview
  const preview = originalPreviewRows.value || [];
  previewRows.value = preview;
  previewHeaders.value = preview.length ? Object.keys(preview[0]) : [];
  previewTitle.value = '原始数据预览（前10行）';
  previewDialogVisible.value = true;
};

// 查看脱敏数据
const viewMaskedData = async () => {
  // 优先展示 masked_preview；如无则展示 masked_data 的前10行
  const rows = maskedPreviewRows.value?.length ? maskedPreviewRows.value : (maskedFullRows.value || []);
  const preview = rows.slice(0, 10);
  previewRows.value = preview;
  previewHeaders.value = preview.length ? Object.keys(preview[0]) : [];
  previewTitle.value = '脱敏数据预览（前10行）';
  previewDialogVisible.value = true;
};


// 下载脱敏文件
const handleDownloadMaskedFile = async () => {
  // 优先使用前端已有的脱敏完整数据生成CSV下载；若无则回退调用后端
  const rows = maskedFullRows.value?.length ? maskedFullRows.value : (maskedPreviewRows.value || []);
  if (rows && rows.length > 0) {
    try {
      // 1) 组装表头（所有键的合集，保持第一个对象的键顺序为主）
      const headerSet = new Set<string>(Object.keys(rows[0] ?? {}));
      rows.forEach(r => Object.keys(r ?? {}).forEach(k => headerSet.add(k)));
      const headers = Array.from(headerSet);
      // 2) 转 CSV
      const escapeCell = (value: any): string => {
        if (value === null || value === undefined) return '';
        const s = String(value);
        // 若包含逗号、双引号或换行，则用双引号包裹，并转义双引号
        if (/[",\n]/.test(s)) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };
      const lines: string[] = [];
      lines.push(headers.join(','));
      rows.forEach(row => {
        const line = headers.map(h => escapeCell((row as any)?.[h])).join(',');
        lines.push(line);
      });
      const csvContent = '\uFEFF' + lines.join('\n'); // 加 BOM 兼容 Excel
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'masked_data.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      ElMessage.success('文件下载成功');
      return;
    } catch (err: any) {
      // 继续尝试后端下载
      console.error('前端生成CSV失败，回退到后端下载:', err);
    }
  }

  // 回退：调用后端下载
  if (!taskId.value) {
    ElMessage.warning('任务ID不存在，无法下载文件');
    return;
  }
  try {
    const blob = await downloadMaskedFile(taskId.value);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'masked_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    ElMessage.success('文件下载成功');
  } catch (error: any) {
    ElMessage.error(error.message || '文件下载失败');
  }
};

// 重新开始
const resetProcess = () => {
  ElMessageBox.confirm('确定要重新开始吗？当前进度将被重置。', '确认重置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    currentStep.value = 1;
    configForm.selected_headers = [];
    configForm.record_count = 100;
    configForm.scenario = [];
    configForm.method = '';
    safetyScore.value = 0;
    evalTable.value = '';
    privacyTable.value = '';
    activeTab.value = 'utility';
  }).catch(() => {
    // 用户取消
  });
};

// 初始化查询信息
const initializeQueryInfo = async () => {
  const maskingParams = route.query.maskingParams;
  if (maskingParams) {
    try {
      const params = JSON.parse(maskingParams as string);
      const { queryParams, trustData, dataCount } = params;
      
      console.log('接收到的查询参数:', queryParams);
      console.log('信任值数据:', trustData);
      
      // 设置信任值数据
      trustValueData.value = trustData;
      
      // 生成机构名称
      const institutionNames = queryParams.ins_codes?.map((id: number) => {
        const institution = institutions.find(ins => ins.id === id);
        return institution ? institution.name : `机构${id}`;
      }).join(', ') || '未知机构';
      
      // 生成病种名称
      const diseaseNames = queryParams.disease_codes?.map((code: string) => `病种${code}`).join(', ') || '未知病种';
      
      console.log('生成的机构名称:', institutionNames);
      console.log('生成的病种名称:', diseaseNames);
      
      // 设置查询信息
      queryInfo.value = {
        institutionNames: institutionNames,
        diseaseNames: diseaseNames,
        dataCodes: queryParams.data_code || [],
        dataCount: dataCount || 100
      };
      
      // 设置脱敏参数
      configForm.record_count = dataCount || 100;
      configForm.selected_headers = queryParams.data_code || [];
      
      // 调用接口获取 data_code_details（数据从后端传递，不是从数据库查询）
      try {
        const finalParams: QueryParams = {
          ...queryParams,
          nums: dataCount || 100,
          Trustvalue: trustData.Trustvalue,
          sensitive: trustData.sensitive,
        };
        
        const medicalData = await getMedicalRecords(finalParams);
        // 设置数据项详细信息
        dataCodeDetails.value = medicalData.data_code_details || {};
        // 保存医疗数据结果
        medicalResults.value = medicalData.results || [];
        console.log('获取到的数据项详细信息:', dataCodeDetails.value);
        console.log('获取到的医疗数据结果:', medicalResults.value);
      } catch (error: any) {
        console.error('获取数据项详细信息失败:', error);
        ElMessage.warning('获取数据项详细信息失败，但可以继续使用');
      }
      
    } catch (error) {
      console.error('解析查询参数失败:', error);
      ElMessage.error('查询参数解析失败');
    }
  } else {
    console.warn('未找到maskingParams参数');
    ElMessage.warning('未找到查询参数，请从信任值计算页面重新进入');
  }
};

// 页面加载时初始化
onMounted(() => {
  initializeQueryInfo();
});

// 返回上一页
const handleBack = () => {
  window.history.back();
};
</script>

<style scoped>
.data-masking-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  
  .page-title {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .page-subtitle {
    margin: 0;
    color: #7f8c8d;
    font-size: 16px;
  }
}

.step-container {
  padding: 20px 0;
}

.query-info {
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: #fff;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  
  .query-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 600;
    color: #fff;
  }
  
  .query-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    
    .detail-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      backdrop-filter: blur(10px);
      
      .label {
        font-weight: 500;
        color: rgba(255, 255, 255, 0.8);
        margin-right: 8px;
        min-width: 60px;
      }
      
      .value {
        color: #fff;
        font-weight: 600;
      }
    }
  }
}

.trust-result {
  margin-bottom: 24px;
  
  .trust-alert {
    border-radius: 8px;
  }
}

.config-form {
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  .field-selection {
    .select-all {
      margin-bottom: 16px;
      
      :deep(.el-checkbox) {
        font-weight: 600;
        color: #4CAF50;
      }
    }
    
    .checkbox-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      
      .checkbox-item {
        padding: 8px 12px;
        background: #f8f9fa;
        border-radius: 6px;
        transition: all 0.3s ease;
        
        &:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }
      }
    }
  }
  
  .scenario-selection, .method-selection {
    .scenario-grid, .method-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 12px;
      padding: 0 20px;
    }
    
    .scenario-item, .method-item {
      border: 2px solid #e4e7ed;
      border-radius: 16px;
      padding: 0;
      transition: all 0.3s ease;
      background: #fff;
      min-height: 120px;
      min-width: 300px;
      width: 100%;
      position: relative;
      
      &:hover {
        border-color: #409eff;
        box-shadow: 0 6px 20px rgba(64, 158, 255, 0.15);
        transform: translateY(-3px);
      }
      
      &.is-checked {
        border-color: #409eff;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        box-shadow: 0 6px 24px rgba(64, 158, 255, 0.25);
      }
      
      :deep(.el-checkbox__input) {
        position: absolute;
        top: 16px;
        right: 16px;
        z-index: 1;
      }
      
      :deep(.el-checkbox__label) {
        width: 100%;
        padding: 20px;
        padding-right: 50px;
        min-height: 120px;
        display: flex;
        align-items: center;
      }
      
      /* 单选框样式 */
      :deep(.el-radio__input) {
        position: absolute;
        top: 16px;
        right: 16px;
        z-index: 1;
      }
      
      :deep(.el-radio__label) {
        width: 100%;
        padding: 20px;
        padding-right: 50px;
        min-height: 120px;
        display: flex;
        align-items: center;
      }
    }
    
    .scenario-content, .method-content {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      width: 100%;
      
      .scenario-icon, .method-icon {
        font-size: 32px;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(64, 158, 255, 0.1);
        border-radius: 12px;
        flex-shrink: 0;
      }
      
      .scenario-info, .method-info {
        flex: 1;
        
        .scenario-name, .method-name {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 6px;
          line-height: 1.3;
        }
        
        .scenario-desc, .method-desc {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
          margin-bottom: 10px;
        }
        
        .method-features {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          
          .feature-tag {
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 6px;
            background: rgba(64, 158, 255, 0.1);
            color: #409eff;
            font-weight: 500;
          }
        }
      }
    }
  }
  
  /* 智能选择特殊样式 */
  .smart-choice {
    .method-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: #fff !important;
    }
    
    &.is-checked {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
      border-color: #667eea !important;
    }
    
    &:hover {
      border-color: #667eea !important;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2) !important;
    }
  }
  
  .form-hint {
    margin-top: 8px;
    font-size: 12px;
    color: #999;
  }
  
  .form-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-top: 24px;
    
    .el-button {
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 8px;
      
      &.el-button--primary {
        background: linear-gradient(135deg, #409eff 0%, #36a3f7 100%);
        border: none;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
        }
      }
    }
  }
}

.result-container {
  margin-top: 32px;
}

.result-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  :deep(.el-card__header) {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: #fff;
    padding: 20px 24px;
  }
  
  .result-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .success-icon {
    font-size: 48px;
    color: #67c23a;
    margin-bottom: 16px;
  }
  
  h3 {
    margin: 0 0 16px 0;
    font-size: 24px;
    color: #fff;
    font-weight: 600;
  }
  
  .safety-score {
    font-size: 18px;
    color: #2c3e50;
    margin: 20px 0;
    padding: 16px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    border-radius: 12px;
    color: #fff;
    text-align: center;
    
    .score-value {
      font-weight: 600;
      color: #fff;
      font-size: 28px;
    }
  }
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 24px 0;
  padding: 20px;
  
  .el-button {
    padding: 12px 24px;
    font-size: 16px;
    border-radius: 8px;
    font-weight: 500;
    
    &.el-button--success {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(17, 153, 142, 0.4);
      }
    }
    
    &.el-button--primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
      }
    }
    
    &.el-button--warning {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(240, 147, 251, 0.4);
      }
    }
  }
}

.result-tabs {
  margin-top: 24px;
}

.table-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  
  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e4e7ed;
    }
    
    th {
      background-color: #f5f7fa;
      font-weight: 600;
    }
    
    tr:hover {
      background-color: #f5f7fa;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .scenario-selection, .method-selection {
    .scenario-grid, .method-grid {
      grid-template-columns: 1fr;
      gap: 16px;
      padding: 0 16px;
    }
    
    .scenario-item, .method-item {
      min-width: 280px;
    }
  }
  
  .config-form {
    padding: 16px;
  }
  
  .query-info {
    padding: 16px;
    
    .query-details {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }
}

@media (max-width: 480px) {
  .data-masking-container {
    padding: 10px;
  }
  
  .scenario-item, .method-item {
    min-height: 100px;
    min-width: 260px;
    
    :deep(.el-checkbox__label) {
      padding: 16px;
      padding-right: 40px;
      min-height: 100px;
    }
    
    :deep(.el-radio__label) {
      padding: 16px;
      padding-right: 40px;
      min-height: 100px;
    }
  }
  
  .scenario-icon, .method-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
  }
  
  .scenario-name, .method-name {
    font-size: 16px;
  }
  
  .scenario-desc, .method-desc {
    font-size: 13px;
  }
}
</style>
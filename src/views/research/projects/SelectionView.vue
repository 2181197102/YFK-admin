<template>
  <div class="selection-container">
    <el-card class="main-card">
      <div slot="header" class="card-header">
        <h2>病种代码选择</h2>
        <p>请选择需要查询的病种代码（支持多选）</p>
      </div>

      <el-form :model="form" class="selection-form">
        <!-- 病种代码选择 -->
        <el-form-item 
          label="病种代码" 
          :error="errorMessage"
          required
        >
          <el-select
            v-model="form.diseaseCodes"
            placeholder="请选择病种代码"
            multiple
            clearable
            collapse-tags
            style="width: 100%;"
            @change="validateSelection"
          >
            <el-option
              v-for="item in diseaseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <div class="select-hint">可选代码：a, b, c</div>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item class="form-actions">
          <el-button 
            type="primary" 
            @click="handleSubmit"
            :loading="isSubmitting"
          >
            <el-icon v-if="isSubmitting" size="16"><Loading /></el-icon>
            <span v-if="isSubmitting">查询中...</span>
            <span v-else>查询统计数据</span>
          </el-button>
          <el-button 
            type="default" 
            @click="handleReset"
            style="margin-left: 10px;"
          >
            重置选择
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { DiseaseCodeOption } from '@/api/researchers/types';
// 路由实例
const router = useRouter();

// 病种代码选项
const diseaseOptions: DiseaseCodeOption[] = [
  { label: '病种代码 A', value: 'a' },
  { label: '病种代码 B', value: 'b' },
  { label: '病种代码 C', value: 'c' },
];

// 表单数据
const form = reactive({
  diseaseCodes: [] as string[],
});

// 状态管理
const errorMessage = ref('');
const isSubmitting = ref(false);

// 验证选择
const validateSelection = () => {
  errorMessage.value = form.diseaseCodes.length > 0 
    ? '' 
    : '请至少选择一个病种代码';
};

// 提交选择
const handleSubmit = () => {
  // 验证选择
  validateSelection();
  if (errorMessage.value) {
    ElMessage.warning(errorMessage.value);
    return;
  }

  isSubmitting.value = true;

  try {
    // 获取选中的标签文本
    const selectedLabels = form.diseaseCodes
      .map(code => {
        const option = diseaseOptions.find(item => item.value === code);
        return option ? option.label : code;
      })
      .join('、');

    // 跳转到结果页面，传递选择的参数
    router.push({
      name: 'ProjectStats',
      query: {
        codes: form.diseaseCodes.join(','),
        labels: selectedLabels
      }
    });
  } catch (error) {
    ElMessage.error('跳转失败，请重试');
    console.error('跳转错误:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// 重置选择
const handleReset = () => {
  form.diseaseCodes = [];
  errorMessage.value = '';
};
</script>

<style scoped>
.selection-container {
  padding: 30px;
  max-width: 600px;
  margin: 50px auto;
}

.main-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  text-align: center;
  padding: 20px 0;
}

.card-header h2 {
  margin: 0 0 10px 0;
  color: #1f2329;
}

.card-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.selection-form {
  padding: 20px 30px;
}

.select-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #888;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>

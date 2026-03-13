<template>
  <div class="trust-value-container">
    <el-page-header 
      @back="handleBack"
      content="信任值检查结果"
    />

    <el-card class="trust-card">
      <!-- 信任值概览 -->
      <div class="trust-overview">
        <div class="trust-score">
          <div class="score-label">当前信任值</div>
          <div class="score-value" :class="scoreClass">
            {{ trustData.Trustvalue.toFixed(2) }}
          </div>
          <el-tag 
            :type="trustData.Trustvalue >= trustData.sensitive ? 'success' : 'danger'"
            class="trust-tag"
          >
            {{ trustData.Trustvalue >= trustData.sensitive ? '验证通过' : '验证未通过' }}
          </el-tag>
        </div>
        
        <div class="sensitivity-info">
          <span class="sensitivity-label">数据敏感度阈值：</span>
          <span class="sensitivity-value">{{ trustData.sensitive.toFixed(2) }}</span>
        </div>
        
        <div class="score-description">
          {{ getScoreDescription() }}
        </div>
      </div>

      <!-- 数据量选择区域 -->
      <el-form-item 
        label="选择数据量" 
        class="data-count-selector"
        v-if="canProceed"
      >
        <el-input-number
          v-model="dataCount"
          :min="0"
          :max="maxDataCount"
          :step="10"
          :disabled="loading"
          controls-position="right"
          placeholder="请输入数据量"
        />
        <div class="form-hint">
          {{ dataCountHint }}
        </div>
      </el-form-item>

      <!-- 信任值详情 -->
      <el-collapse 
        v-model="activePanels" 
        class="trust-details"
        border
      >
        <el-collapse-item title="访问位置统计" name="location">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="异常位置访问">
              <span class="stat-value">{{ Number(trustData.access_location.num_ad) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="正常位置访问">
              <span class="stat-value">{{ Number(trustData.access_location.num_nd) }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>
        
        <el-collapse-item title="访问时段统计" name="period">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="正常时段访问">
              <span class="stat-value">{{ Number(trustData.access_period.num_ni) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="异常时段访问">
              <span class="stat-value">{{ Number(trustData.access_period.num_ui) }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>
        
        <el-collapse-item title="操作行为统计" name="behavior">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="添加">{{ Number(trustData.operation_behavior.num_add) }}</el-descriptions-item>
            <el-descriptions-item label="复制">{{ Number(trustData.operation_behavior.num_copy) }}</el-descriptions-item>
            <el-descriptions-item label="删除">{{ Number(trustData.operation_behavior.num_delete) }}</el-descriptions-item>
            <el-descriptions-item label="下载">{{ Number(trustData.operation_behavior.num_download) }}</el-descriptions-item>
            <el-descriptions-item label="修改">{{ Number(trustData.operation_behavior.num_revise) }}</el-descriptions-item>
            <el-descriptions-item label="查看">{{ Number(trustData.operation_behavior.num_view) }}</el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>
        
        <el-collapse-item title="数据敏感度统计" name="sensitivity">
          <el-descriptions :column="4" border>
            <el-descriptions-item label="级别1">{{ Number(trustData.data_sensitivity.num1) }}</el-descriptions-item>
            <el-descriptions-item label="级别2">{{ Number(trustData.data_sensitivity.num2) }}</el-descriptions-item>
            <el-descriptions-item label="级别3">{{ Number(trustData.data_sensitivity.num3) }}</el-descriptions-item>
            <el-descriptions-item label="级别4">{{ Number(trustData.data_sensitivity.num4) }}</el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>
      </el-collapse>

      <!-- 操作按钮 -->
      <div class="trust-actions">
        <el-button 
          type="default" 
          @click="handleBack"
          :disabled="loading"
        >
          返回修改
        </el-button>
        
        <el-button 
          type="primary" 
          @click="handleGetMedicalData"
          :disabled="!canProceed || !isDataCountValid || loading"
          :loading="loading"
        >
          <el-icon v-if="loading"><Loading /></el-icon>
          <span>获取医疗数据</span>
        </el-button>
        
        <el-button 
          type="success" 
          @click="handleDataMasking"
          :disabled="!canProceed || loading"
          :loading="loading"
        >
          <el-icon><Lock /></el-icon>
          <span>数据脱敏</span>
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Loading, Lock } from '@element-plus/icons-vue';
import { TrustValueResponse, QueryParams } from '@/api/researchers/types';

// 路由实例
const router = useRouter();
const route = useRoute();

// 解析路由参数
const queryParams: QueryParams = JSON.parse(route.query.params as string);
const trustData: TrustValueResponse = JSON.parse(route.query.trustData as string);

// 状态管理
const loading = ref(false);
const activePanels = ref<string[]>(['location']);
const dataCount = ref(10); // 默认数据量

// 判断是否可以继续（信任值 > 敏感度）
const canProceed = computed(() => {
  return trustData.Trustvalue > trustData.sensitive;
});

// 最大数据量限制
const maxDataCount = computed(() => {
  const score = trustData.Trustvalue;
  if (score < 0.5) return 200;
  if (score < 0.8) return 500;
  return Infinity; // 不限制
});

// 数据量提示信息
const dataCountHint = computed(() => {
  const score = trustData.Trustvalue;
  if (score < 0.5) return '信任值<0.5，数据量限制：0-200条';
  if (score < 0.8) return '信任值0.5-0.8，数据量限制：0-500条';
  return '信任值>0.8，数据量无限制';
});

// 验证数据量是否有效
const isDataCountValid = computed(() => {
  return dataCount.value >= 0 && dataCount.value <= maxDataCount.value;
});

// 信任值样式类
const scoreClass = ref<string>(
  trustData.Trustvalue >= 0.8 ? 'high' : 
  trustData.Trustvalue >= 0.5 ? 'medium' : 'low'
);

// 获取信任值描述
const getScoreDescription = () => {
  const score = trustData.Trustvalue;
  const sensitive = trustData.sensitive;
  
  if (score > sensitive) {
    if (score >= 0.8) return '信任值优秀，超过敏感度阈值，可访问所有级别的医疗数据';
    if (score >= 0.5) return '信任值良好，超过敏感度阈值，可以访问医疗数据';
    return '信任值较低但超过敏感度阈值，有限制地访问医疗数据';
  } else {
    return `信任值(${score.toFixed(2)})低于敏感度阈值(${sensitive.toFixed(2)})，无法访问医疗数据`;
  }
};

// 获取医疗数据
const handleGetMedicalData = async () => {
  if (!canProceed.value) {
    ElMessage.warning('信任值不足，无法获取医疗数据');
    return;
  }
  
  if (!isDataCountValid.value) {
    ElMessage.warning(`数据量超出限制范围，请输入${dataCountHint.value}`);
    return;
  }
  
  loading.value = true;
  
  try {
    // 准备最终查询参数（添加数据量）
    const finalParams = {
      ...queryParams,
      nums: dataCount.value,
      Trustvalue: trustData.Trustvalue,
      sensitive: trustData.sensitive,
    };
    
    // 导航到医疗数据展示页面
    router.push({
      name: 'MedicaData',
      query: {
        params: JSON.stringify(finalParams)
      }
    });
    
  } catch (error: any) {
    ElMessage.error(`获取数据失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

// 数据脱敏处理
const handleDataMasking = () => {
  if (!canProceed.value) {
    ElMessage.warning('信任值不足，无法进行数据脱敏');
    return;
  }
  
  if (!isDataCountValid.value) {
    ElMessage.warning(`数据量超出限制范围，请输入${dataCountHint.value}`);
    return;
  }
  
  // 准备脱敏参数（直接传递用户选择的数据量）
  const maskingParams = {
    queryParams: queryParams,
    trustData: trustData,
    dataCount: dataCount.value
  };
  
  // 跳转到数据脱敏页面
  router.push({
    path: '/research/datamasking',
    query: {
      maskingParams: JSON.stringify(maskingParams)
    }
  });
};

// 返回上一页
const handleBack = () => {
  router.back();
};
</script>

<style scoped>
.trust-value-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
}

.trust-card {
  margin-top: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.trust-overview {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 20px;
}

.trust-score {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.score-label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.score-value {
  font-size: 32px;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 4px;
}

.score-value.high {
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
}

.score-value.medium {
  color: #f59e0b;
  background-color: rgba(245, 158, 11, 0.1);
}

.score-value.low {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.trust-tag {
  margin-left: 10px;
}

.sensitivity-info {
  margin-bottom: 12px;
  font-size: 14px;
}

.sensitivity-label {
  color: #666;
  margin-right: 8px;
}

.sensitivity-value {
  font-weight: 500;
  color: #165DFF;
}

.score-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.data-count-selector {
  margin: 20px 0;
}

.trust-details {
  margin-bottom: 20px;
}

.stat-value {
  font-weight: 500;
  color: #165DFF;
}

.trust-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 15px;
  border-top: 1px solid #f0f0f0;
}
</style>
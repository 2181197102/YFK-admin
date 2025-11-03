<!-- src/components/InstitutionAccessDialog/InstitutionAccessDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    title="查看其他机构病历 - 权限验证"
    width="500px"
    class="institution-access-dialog"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <el-alert
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <template #title>
        <span style="font-size: 14px">
          查看其他机构病历需要向患者手机发送验证码进行身份验证
        </span>
      </template>
    </el-alert>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="90px" @submit.prevent>
      <el-form-item label="患者姓名">
        <el-input :value="patientName" disabled />
      </el-form-item>

      <el-form-item label="患者手机号">
        <el-input :value="patientPhone" disabled />
      </el-form-item>
      <el-form-item label="验证码" prop="code">
        <div class="code-row">
          <el-input
            v-model="form.code"
            placeholder="请输入6位验证码"
            maxlength="6"
            clearable
            @keyup.enter="handleVerify"
            :disabled="verifying"
          />
          <el-button
            type="primary"
            class="send-btn"
            :disabled="countdown > 0 || sending"
            :loading="sending"
            @click="handleSendCode"
          >
            {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>

      <el-form-item v-if="errorMsg" style="margin-bottom: 0">
        <el-alert
          type="error"
          :closable="false"
          show-icon
        >
          {{ errorMsg }}
        </el-alert>
      </el-form-item>

      <el-form-item v-if="successMsg" style="margin-bottom: 0">
        <el-alert
          type="success"
          :closable="false"
          show-icon
        >
          {{ successMsg }}
        </el-alert>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel" :disabled="verifying">
        取消
      </el-button>
      <el-button
        type="primary"
        :loading="verifying"
        @click="handleVerify"
      >
        确认验证
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { 
  generateInstitutionAccessCode, 
  verifyInstitutionAccessCode 
} from '@/api/doctor/doctor';

// Props 和 Emits
const props = defineProps<{ 
  modelValue: boolean;
  patientName: string;  // 患者姓名
  patientPhone: string; // 患者手机号
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'verified'): void;
}>();

// 响应式状态
const visible = ref(props.modelValue);
watch(() => props.modelValue, val => (visible.value = val));
watch(visible, val => emits('update:modelValue', val));

// 表单数据
const form = reactive({ 
  code: '' 
});

// 表单引用
const formRef = ref<FormInstance>();

// 表单验证规则
const rules: FormRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 6, max: 6, message: '验证码为6位数字', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码必须为6位数字', trigger: 'blur' }
  ]
};

// 状态管理
const countdown = ref(0);
const sending = ref(false);
const verifying = ref(false);
const errorMsg = ref('');
const successMsg = ref('');
let timer: any = null;

/**
 * 发送验证码
 */
const handleSendCode = async () => {
  // 验证患者手机号
  if (!props.patientPhone) {
    ElMessage.error('患者手机号不存在，无法发送验证码');
    return;
  }
  
  sending.value = true;
  errorMsg.value = '';
  successMsg.value = '';
  
  try {
    console.log('开始发送验证码到患者手机：', props.patientPhone);
    const response = await generateInstitutionAccessCode(props.patientPhone);
    console.log('生成验证码响应：', response);
    
    if (response?.code === 200) {
      successMsg.value = `验证码已发送至患者手机 ${maskPhone(props.patientPhone)}`;
      ElMessage.success({
        message: `验证码已发送至患者手机，有效期10分钟`,
        duration: 5000
      });
      startCountdown();
    } else {
      errorMsg.value = response?.msg || '发送验证码失败';
      ElMessage.error(errorMsg.value);
    }
  } catch (err: any) {
    const errorMessage = err?.message || '发送验证码失败，请稍后重试';
    errorMsg.value = errorMessage;
    ElMessage.error(errorMessage);
    console.error('发送验证码错误：', err);
  } finally {
    sending.value = false;
  }
};

/**
 * 启动倒计时
 */
const startCountdown = () => {
  countdown.value = 60;
  if (timer) clearInterval(timer);
  
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      timer = null;
    }
  }, 1000);
};

/**
 * 验证验证码
 */
const handleVerify = async () => {
  if (!formRef.value) return;
  
  // 验证患者手机号
  if (!props.patientPhone) {
    ElMessage.error('患者手机号不存在，无法验证');
    return;
  }
  
  try {
    // 验证表单
    await formRef.value.validate();
    
    verifying.value = true;
    errorMsg.value = '';
    successMsg.value = '';
    
    console.log('开始验证验证码，患者手机：', props.patientPhone, '验证码：', form.code);
    const response = await verifyInstitutionAccessCode(props.patientPhone, form.code);
    console.log('验证响应：', response);
    
    if (response?.code === 200) {
      ElMessage.success('验证成功，已解锁其他机构病历查看权限');
      emits('verified');
      visible.value = false;
      
      // 重置表单
      resetForm();
    } else {
      errorMsg.value = response?.msg || '验证码错误或已过期';
      ElMessage.error(errorMsg.value);
    }
  } catch (error: any) {
    if (error?.message) {
      errorMsg.value = error.message;
      ElMessage.error(error.message);
    }
    console.error('验证失败：', error);
  } finally {
    verifying.value = false;
  }
};

/**
 * 取消操作
 */
const handleCancel = () => {
  visible.value = false;
  resetForm();
};

/**
 * 重置表单
 */
const resetForm = () => {
  form.code = '';
  errorMsg.value = '';
  successMsg.value = '';
  if (formRef.value) {
    formRef.value.clearValidate();
  }
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  countdown.value = 0;
};

/**
 * 隐藏手机号中间4位
 */
const maskPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

// 组件销毁时清理定时器
import { onUnmounted } from 'vue';
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<style scoped lang="scss">
.institution-access-dialog {
  .code-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .send-btn {
    white-space: nowrap;
    min-width: 110px;
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }

  :deep(.el-input) {
    flex: 1;
  }

  :deep(.el-alert) {
    margin-bottom: 0;
  }
}
</style>


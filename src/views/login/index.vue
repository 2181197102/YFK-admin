<!-- ============================================================================
     登录页面 - src/views/login/index.vue
     ============================================================================ -->
<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>用户登录</h1>
        <p>欢迎使用医疗管理系统</p>
      </div>

      <el-form
          ref="formRef"
          :model="loginForm"
          :rules="rules"
          label-width="0px"
          size="large"
      >
        <el-form-item prop="account">
          <el-input
              v-model="loginForm.account"
              placeholder="请输入用户名或身份证号"
              :prefix-icon="User"
              clearable
              @blur="onAccountBlur"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              clearable
              @keyup.enter="handleLoginClick"
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="login-button"
              @click="handleLoginClick"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <el-divider>
          <span class="divider-text">或</span>
        </el-divider>

        <div class="footer-buttons">
          <el-button type="text" @click="goToRegister">
            还没有账号？立即注册
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/modules/user';

const router = useRouter();
const userStore = useUserStore();

// 表单数据
const loginForm = reactive({
  account: '',
  password: '',
});

// 身份证号验证函数
const validateIdCard = (idCard: string): boolean => {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return reg.test(idCard);
};

// 表单验证规则
const rules = reactive<FormRules>({
  account: [
    { required: true, message: '请输入用户名或身份证号', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (!value) {
          callback(new Error('请输入用户名或身份证号'));
          return;
        }
        // 如果输入的是身份证号格式，进行身份证号验证
        if (value.length >= 15 && /^\d/.test(value)) {
          if (!validateIdCard(value)) {
            callback(new Error('身份证号格式不正确'));
            return;
          }
        } else if (value.length < 3) {
          callback(new Error('用户名至少3个字符'));
          return;
        }
        callback();
      },
      trigger: 'blur'
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' },
  ],
});

// 响应式变量
const formRef = ref<FormInstance>();
const loading = ref(false);

// 账号失焦事件
const onAccountBlur = () => {
  const account = loginForm.account.trim();
  if (account && account.length >= 15 && /^\d/.test(account)) {
    if (!validateIdCard(account)) {
      ElMessage.warning('身份证号格式不正确');
    }
  }
};

// 登录处理
const handleLogin = async () => {
  const account = loginForm.account.trim();
  const password = loginForm.password.trim();

  if (!account) {
    ElMessage.warning('请输入用户名或身份证号码');
    return;
  }

  if (!password) {
    ElMessage.warning('请输入密码');
    return;
  }

  loading.value = true;

  try {
    await userStore.login(account, password);
    ElMessage.success('登录成功');
    await nextTick();
    router.push('/dashboard');
  } catch (error: any) {
    // const errorMessage = error?.response?.data?.error || error?.message || '登录失败，请重试';
    // ElMessage.error(errorMessage);
  } finally {
    loading.value = false;
  }
};

// 登录按钮点击处理
const handleLoginClick = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    await handleLogin();
  } catch (error) {
    ElMessage.warning('请检查输入内容');
  }
};

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px 30px;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;

  h1 {
    font-size: 28px;
    color: #303133;
    margin-bottom: 8px;
    font-weight: 600;
  }

  p {
    color: #909399;
    font-size: 14px;
    margin: 0;
  }
}

.login-footer {
  margin-top: 20px;
  text-align: center;

  .divider-text {
    font-size: 12px;
    color: #c0c4cc;
  }

  .footer-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;

    :deep(.el-button--text) {
      font-size: 14px;
      padding: 4px 8px;
    }
  }
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  border: none;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #337ecc 0%, #409eff 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

// Element Plus 组件样式定制
:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input) {
  .el-input__wrapper {
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      border-color: #409eff;
    }

    &.is-focus {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }
  }
}

:deep(.el-divider) {
  margin: 16px 0;
}

// 响应式设计
@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }

  .login-box {
    padding: 30px 20px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .footer-buttons {
    :deep(.el-button--text) {
      font-size: 12px;
    }
  }
}
</style>
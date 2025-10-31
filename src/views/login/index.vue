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

      <!-- 登录方式切换 -->
      <div class="login-tabs">
        <div
            :class="['tab-item', { active: loginType === 'password' }]"
            @click="switchLoginType('password')"
        >
          <Lock class="tab-icon" />
          <span>密码登录</span>
        </div>
        <div
            :class="['tab-item', { active: loginType === 'code' }]"
            @click="switchLoginType('code')"
        >
          <Message class="tab-icon" />
          <span>验证码登录</span>
        </div>
      </div>

      <!-- 密码登录表单 -->
      <el-form
          v-if="loginType === 'password'"
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="0px"
          size="large"
      >
        <el-form-item prop="account">
          <el-input
              v-model="passwordForm.account"
              placeholder="请输入用户名或身份证号"
              :prefix-icon="User"
              clearable
              @blur="onPasswordAccountBlur"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="passwordForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              clearable
              @keyup.enter="handlePasswordLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              size="large"
              :loading="passwordLoading"
              class="login-button"
              @click="handlePasswordLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 验证码登录表单 -->
      <el-form
          v-else
          ref="codeFormRef"
          :model="codeForm"
          :rules="codeRules"
          label-width="0px"
          size="large"
      >
        <el-form-item prop="phone">
          <el-input
              v-model="codeForm.phone"
              placeholder="请输入手机号"
              :prefix-icon="Iphone"
              maxlength="11"
              clearable
              @blur="onCodePhoneBlur"
          />
        </el-form-item>

        <el-form-item prop="code">
          <el-input
              v-model="codeForm.code"
              placeholder="请输入6位验证码"
              :prefix-icon="Message"
              maxlength="6"
              clearable
              @keyup.enter="handleCodeLogin"
          >
            <template #suffix>
              <el-button
                  type="primary"
                  link
                  :disabled="countdown > 0 || sendingCode"
                  @click="handleSendCode"
                  class="send-code-btn"
              >
                {{ countdownText }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              size="large"
              :loading="codeLoading"
              class="login-button"
              @click="handleCodeLogin"
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
import { reactive, ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { User, Lock, Message, Iphone } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/modules/user';
import { generateLoginCode } from '@/api/auth/auth';

const router = useRouter();
const userStore = useUserStore();

// ==================== 登录方式切换 ====================
type LoginType = 'password' | 'code';
const loginType = ref<LoginType>('password');

const switchLoginType = (type: LoginType) => {
  loginType.value = type;
  // 切换时清空表单
  if (type === 'password') {
    passwordForm.account = '';
    passwordForm.password = '';
  } else {
    codeForm.phone = '';
    codeForm.code = '';
    countdown.value = 0;
  }
};

// ==================== 工具函数 ====================

// 身份证号验证函数
const validateIdCard = (idCard: string): boolean => {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return reg.test(idCard);
};

// 手机号验证函数
const validatePhone = (phone: string): boolean => {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
};

// 判断输入是否为身份证号
const isIdCard = (value: string): boolean => {
  return value.length >= 15 && /^\d/.test(value);
};

// ==================== 密码登录相关 ====================

const passwordForm = reactive({
  account: '',
  password: '',
});

const passwordRules = reactive<FormRules>({
  account: [
    { required: true, message: '请输入用户名或身份证号', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (!value) {
          callback(new Error('请输入用户名或身份证号'));
          return;
        }
        // 如果输入的是身份证号格式，进行身份证号验证
        if (isIdCard(value)) {
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

const passwordFormRef = ref<FormInstance>();
const passwordLoading = ref(false);

// 密码登录 - 账号失焦事件
const onPasswordAccountBlur = () => {
  const account = passwordForm.account.trim();
  if (account && isIdCard(account)) {
    if (!validateIdCard(account)) {
      ElMessage.warning('身份证号格式不正确');
    }
  }
};

// 密码登录处理
const handlePasswordLogin = async () => {
  if (!passwordFormRef.value) return;

  try {
    await passwordFormRef.value.validate();
  } catch (error) {
    ElMessage.warning('请检查输入内容');
    return;
  }

  const account = passwordForm.account.trim();
  const password = passwordForm.password.trim();

  passwordLoading.value = true;

  try {
    await userStore.login(account, password);
    ElMessage.success('登录成功');
    await nextTick();
    router.push('/dashboard');
  } catch (error: any) {
    // 错误已在 axios 拦截器中处理
  } finally {
    passwordLoading.value = false;
  }
};

// ==================== 验证码登录相关 ====================

const codeForm = reactive({
  phone: '',
  code: '',
});

const codeRules = reactive<FormRules>({
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (!value) {
          callback(new Error('请输入手机号'));
          return;
        }
        if (!validatePhone(value)) {
          callback(new Error('手机号格式不正确'));
          return;
        }
        callback();
      },
      trigger: 'blur'
    },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '请输入6位验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码必须是6位数字', trigger: 'blur' },
  ],
});

const codeFormRef = ref<FormInstance>();
const codeLoading = ref(false);
const sendingCode = ref(false);
const countdown = ref(0);

// 倒计时文本
const countdownText = computed(() => {
  if (sendingCode.value) {
    return '发送中...';
  }
  if (countdown.value > 0) {
    return `${countdown.value}秒后重发`;
  }
  return '获取验证码';
});

// 验证码登录 - 手机号失焦事件
const onCodePhoneBlur = () => {
  const phone = codeForm.phone.trim();
  if (phone && !validatePhone(phone)) {
    ElMessage.warning('手机号格式不正确');
  }
};

// 发送验证码
const handleSendCode = async () => {
  // 先验证手机号字段
  if (!codeFormRef.value) return;

  try {
    await codeFormRef.value.validateField('phone');
  } catch (error) {
    return;
  }

  const phone = codeForm.phone.trim();

  try {
    sendingCode.value = true;
    await generateLoginCode(phone);

    // 发送成功提示
    ElMessage.success('验证码发送成功');

    // 开始倒计时
    startCountdown();
  } catch (error: any) {
    // 错误已在 axios 拦截器中处理
  } finally {
    sendingCode.value = false;
  }
};

// 开始倒计时（60秒）
const startCountdown = () => {
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

// 验证码登录处理
const handleCodeLogin = async () => {
  if (!codeFormRef.value) return;

  try {
    await codeFormRef.value.validate();
  } catch (error) {
    ElMessage.warning('请检查输入内容');
    return;
  }

  const phone = codeForm.phone.trim();
  const code = codeForm.code.trim();

  codeLoading.value = true;

  try {
    await userStore.loginWithCode(phone, code);
    ElMessage.success('登录成功');
    await nextTick();
    router.push('/dashboard');
  } catch (error: any) {
    // 错误已在 axios 拦截器中处理
  } finally {
    codeLoading.value = false;
  }
};

// ==================== 其他功能 ====================

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

// 登录方式切换标签
.login-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: #f5f7fa;
  padding: 4px;
  border-radius: 8px;

  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    color: #606266;

    .tab-icon {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: rgba(64, 158, 255, 0.1);
      color: #409eff;
    }

    &.active {
      background: white;
      color: #409eff;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }
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
  margin-bottom: 20px;
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

  .el-input__suffix {
    .send-code-btn {
      font-size: 13px;
      font-weight: 500;
      padding: 0 8px;
      min-width: 90px;
      text-align: right;

      &:not(:disabled) {
        color: #409eff;
        cursor: pointer;

        &:hover {
          color: #337ecc;
        }
      }

      &:disabled {
        color: #c0c4cc;
        cursor: not-allowed;
      }
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

  .login-tabs {
    .tab-item {
      font-size: 13px;
      padding: 8px 12px;

      .tab-icon {
        width: 14px;
        height: 14px;
      }
    }
  }

  .footer-buttons {
    :deep(.el-button--text) {
      font-size: 12px;
    }
  }
}
</style>
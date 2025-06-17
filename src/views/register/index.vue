<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h1>用户注册</h1>
        <p>创建您的账号</p>
      </div>

      <a-form
          ref="formRef"
          :model="registerForm"
          :rules="rules"
          layout="vertical"
          @submit="handleRegister"
      >
        <a-form-item field="username" label="用户名">
          <a-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              size="large"
          />
        </a-form-item>

        <a-form-item field="password" label="密码">
          <a-input-password
              v-model="registerForm.password"
              placeholder="请输入密码"
              size="large"
          />
        </a-form-item>

        <a-form-item field="confirmPassword" label="确认密码">
          <a-input-password
              v-model="registerForm.confirmPassword"
              placeholder="请再次输入密码"
              size="large"
          />
        </a-form-item>

        <a-form-item field="name" label="姓名">
          <a-input
              v-model="registerForm.name"
              placeholder="请输入真实姓名"
              size="large"
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="age" label="年龄">
              <a-input-number
                  v-model="registerForm.age"
                  placeholder="年龄"
                  size="large"
                  :min="1"
                  :max="120"
                  style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="gender" label="性别">
              <a-select
                  v-model="registerForm.gender"
                  placeholder="请选择性别"
                  size="large"
              >
                <a-option value="男">男</a-option>
                <a-option value="女">女</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item field="role" label="角色">
          <a-select
              v-model="registerForm.role"
              placeholder="请选择角色"
              size="large"
          >
            <a-option value="PATIENT">患者</a-option>
            <a-option value="DOCTOR">医生</a-option>
            <a-option value="NURSE">护士</a-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-button
              type="primary"
              html-type="submit"
              size="large"
              long
              :loading="loading"
          >
            注册
          </a-button>
        </a-form-item>
      </a-form>

      <div class="register-footer">
        <a-divider>或</a-divider>
        <a-button type="text" @click="goToLogin">
          已有账号？立即登录
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { register } from '@/api/auth/auth';
import type { RegisterRequest } from '@/api/auth/types';

const router = useRouter();

// 表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  age: undefined as number | undefined,
  gender: '',
  role: '',
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { minLength: 3, message: '用户名至少3个字符' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { minLength: 6, message: '密码至少6个字符' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码' },
    {
      validator: (value: string, callback: Function) => {
        if (value !== registerForm.password) {
          callback('两次输入的密码不一致');
        } else {
          callback();
        }
      },
    },
  ],
  name: [
    { required: true, message: '请输入姓名' },
    { minLength: 2, message: '姓名至少2个字符' },
  ],
  age: [
    { required: true, message: '请输入年龄' },
    { type: 'number', min: 1, max: 120, message: '年龄必须在1-120之间' },
  ],
  gender: [
    { required: true, message: '请选择性别' },
  ],
  role: [
    { required: true, message: '请选择角色' },
  ],
};

const formRef = ref();
const loading = ref(false);

// 注册处理
const handleRegister = async ({ errors }: { errors: any }) => {
  if (errors) return;

  loading.value = true;
  try {
    const registerData: RegisterRequest = {
      username: registerForm.username,
      password: registerForm.password,
      name: registerForm.name,
      age: registerForm.age!,
      gender: registerForm.gender,
      role: registerForm.role,
    };

    await register(registerData);
    Message.success('注册成功，请登录');

    // 跳转到登录页面
    router.push('/login');
  } catch (error: any) {
    console.error('Register error:', error);
    Message.error(error.response?.data?.error || '注册失败');
  } finally {
    loading.value = false;
  }
};

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped lang="less">
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
  padding: 20px;
}

.register-box {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px 30px;
  backdrop-filter: blur(10px);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;

  h1 {
    font-size: 28px;
    color: #2c3e50;
    margin-bottom: 8px;
    font-weight: 600;
  }

  p {
    color: #7f8c8d;
    font-size: 14px;
    margin: 0;
  }
}

.register-footer {
  margin-top: 20px;
  text-align: center;

  .arco-divider {
    margin: 16px 0;
    font-size: 12px;
    color: #bdc3c7;
  }
}

:deep(.arco-form-item-label) {
  font-weight: 500;
  color: #2c3e50;
}

:deep(.arco-input-wrapper),
:deep(.arco-select-view-single) {
  border-radius: 8px;
}

:deep(.arco-btn-primary) {
  border-radius: 8px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
  border: none;

  &:hover {
    background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  }
}
</style>
<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h1>用户注册</h1>
        <p>创建您的账号</p>
      </div>

      <el-form
          ref="formRef"
          :model="registerForm"
          :rules="rules"
          label-position="top"
          size="large"
          @submit.prevent="handleRegister"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              clearable
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              clearable
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              show-password
              clearable
          />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input
              v-model="registerForm.name"
              placeholder="请输入真实姓名"
              clearable
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number
                  v-model="registerForm.age"
                  placeholder="年龄"
                  :min="1"
                  :max="120"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select
                  v-model="registerForm.gender"
                  placeholder="请选择性别"
                  clearable
                  style="width: 100%"
              >
                <el-option label="男" value="M" />
                <el-option label="女" value="F" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="角色" prop="role">
          <el-select
              v-model="registerForm.role"
              placeholder="请选择角色"
              :loading="rolesLoading"
              clearable
              style="width: 100%"
              @change="handleRoleChange"
          >
            <el-option
                v-for="role in filteredRoles"
                :key="role.id"
                :value="role.role_name"
                :label="role.role_name"
            >
              <span>{{ role.role_name }}</span>
              <span class="role-description">{{ role.role_code }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 授权密码字段，只有非患者角色才显示 -->
        <el-form-item
            v-if="showAuthPassword"
            label="授权密码"
            prop="authPassword"
        >
          <el-input
              v-model="registerForm.authPassword"
              type="password"
              placeholder="请输入授权密码"
              show-password
              clearable
          />
          <div class="auth-password-tip">
            <el-text size="small" type="info">
              * 选择非患者角色需要输入授权密码
            </el-text>
          </div>
        </el-form-item>

        <el-form-item label="所属组织" prop="group">
          <el-select
              v-model="registerForm.group"
              placeholder="请选择组织"
              :loading="groupsLoading"
              clearable
              style="width: 100%"
          >
            <el-option
                v-for="group in groups"
                :key="group.id"
                :value="group.group_name"
                :label="group.group_name"
            >
              <span>{{ group.group_name }}</span>
              <span class="group-user-count">{{ group.user_count }}人</span>
            </el-option>
            <template #empty>
              <div class="empty-result">
                <el-empty description="暂无数据" />
              </div>
            </template>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              size="large"
              style="width: 100%"
              :loading="loading"
              @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-footer">
        <el-divider>或</el-divider>
        <el-button type="text" @click="goToLogin">
          已有账号？立即登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { register, getRoleList, getGroupList } from '@/api/auth/auth'
import type { RegisterRequest, Role, Group } from '@/api/auth/types'

const router = useRouter()

// 从环境变量中获取授权密码
const AUTH_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD

// 表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  age: undefined as number | undefined,
  gender: '',
  role: '',
  group: '',
  authPassword: '', // 新增授权密码字段
})

// 角色和组织数据
const roles = ref<Role[]>([])
const groups = ref<Group[]>([])
const rolesLoading = ref(false)
const groupsLoading = ref(false)

// 计算属性：过滤掉管理员角色
const filteredRoles = computed(() => {
  return roles.value.filter(role =>
      role.role_name !== '管理员' &&
      role.role_code !== 'admin' &&
      role.role_code !== 'ADMIN'
  )
})

// 计算属性：判断是否显示授权密码字段
const showAuthPassword = computed(() => {
  return registerForm.role && registerForm.role !== '患者'
})

// 自定义验证器：授权密码验证
const validateAuthPassword = (rule: any, value: string, callback: Function) => {
  if (showAuthPassword.value) {
    if (!value) {
      callback(new Error('请输入授权密码'))
    } else if (value !== AUTH_PASSWORD) {
      callback(new Error('授权密码错误'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 表单验证规则
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少3个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, message: '姓名至少2个字符', trigger: 'blur' },
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number', min: 1, max: 120, message: '年龄必须在1-120之间', trigger: 'blur' },
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' },
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
  group: [
    { required: true, message: '请选择组织', trigger: 'change' },
  ],
  authPassword: [
    { validator: validateAuthPassword, trigger: 'blur' },
  ],
})

const formRef = ref<FormInstance>()
const loading = ref(false)

// 处理角色变化
const handleRoleChange = (value: string) => {
  // 当角色改变时，清空授权密码
  registerForm.authPassword = ''

  // 重新验证授权密码字段
  if (formRef.value) {
    formRef.value.clearValidate('authPassword')
  }
}

// 获取角色列表
const fetchRoles = async () => {
  rolesLoading.value = true
  try {
    const response = await getRoleList()
    roles.value = response.roles
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  } finally {
    rolesLoading.value = false
  }
}

// 获取组织列表
const fetchGroups = async () => {
  groupsLoading.value = true
  try {
    const response = await getGroupList()
    groups.value = response.groups
  } catch (error) {
    console.error('获取组织列表失败:', error)
    ElMessage.error('获取组织列表失败')
  } finally {
    groupsLoading.value = false
  }
}

// 注册处理
const handleRegister = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid: boolean) => {
    if (!valid) return

    submitRegister()
  })
}

const submitRegister = async () => {
  loading.value = true
  try {
    const registerData: RegisterRequest = {
      username: registerForm.username,
      password: registerForm.password,
      name: registerForm.name,
      age: registerForm.age!,
      gender: registerForm.gender,
      role: registerForm.role,
      group: registerForm.group,
    }

    await register(registerData)
    ElMessage.success('注册成功，请登录')

    // 跳转到登录页面
    router.push('/login')
  } catch (error: any) {
    console.error('Register error:', error)
    ElMessage.error(error.response?.data?.message || error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchRoles()
  fetchGroups()
})
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

  .el-divider {
    margin: 16px 0;
    font-size: 12px;
    color: #bdc3c7;
  }
}

.role-description {
  font-size: 12px;
  color: #86909c;
  margin-left: 8px;
}

.group-user-count {
  font-size: 12px;
  color: #86909c;
  margin-left: 8px;
}

.empty-result {
  padding: 20px;
  text-align: center;
}

.auth-password-tip {
  margin-top: 4px;

  .el-text {
    font-size: 12px;
    color: #909399;
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #2c3e50;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-select) {
  .el-input__wrapper {
    border-radius: 8px;
  }
}

:deep(.el-button--primary) {
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

:deep(.el-select-dropdown__item) {
  padding: 8px 12px;

  &:hover {
    background-color: #f2f3f5;
  }
}

:deep(.el-button--text) {
  color: #6c5ce7;

  &:hover {
    color: #a29bfe;
  }
}
</style>
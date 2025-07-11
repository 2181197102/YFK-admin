<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h1>用户注册</h1>
        <p>创建您的账号</p>
      </div>

      <!-- 移除 @submit.prevent，避免表单自动提交导致的重复触发 -->
      <el-form
          ref="formRef"
          :model="registerForm"
          :rules="rules"
          label-position="top"
          size="large"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" clearable />
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
          <el-input v-model="registerForm.name" placeholder="请输入真实姓名" clearable />
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
        <el-form-item v-if="showAuthPassword" label="授权密码" prop="authPassword">
          <el-input
              v-model="registerForm.authPassword"
              type="password"
              placeholder="请输入授权密码"
              show-password
              clearable
          />
          <div class="auth-password-tip">
            <el-text size="small" type="info">* 选择非患者角色需要输入授权密码</el-text>
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
        <el-button type="text" @click="goToLogin">已有账号？立即登录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { debounce } from 'lodash-es'
import { register, getRoleList, getGroupList, verifyAuthPassword } from '@/api/auth/auth'
import type { RegisterRequest, Role, Group } from '@/api/auth/types'

const router = useRouter()

/* ------------------------- 表单数据 ------------------------- */
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  age: undefined as number | undefined,
  gender: '',
  role: '',
  group: '',
  authPassword: '',
})

/* ------------------------- 列表数据 ------------------------- */
const roles = ref<Role[]>([])
const groups = ref<Group[]>([])
const rolesLoading = ref(false)
const groupsLoading = ref(false)

/* ------------------------- 计算属性 ------------------------- */
const filteredRoles = computed(() =>
    roles.value.filter(
        role =>
            role.role_name !== '管理员' &&
            role.role_code.toLowerCase() !== 'admin'
    )
)

const showAuthPassword = computed(() => registerForm.role && registerForm.role !== '患者')

/* ------------------------- 表单规则 ------------------------- */
const validateAuthPassword = (rule: any, value: string, callback: Function) => {
  if (showAuthPassword.value && !value) {
    callback(new Error('请输入授权密码'))
  } else {
    callback()
  }
}

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
    { type: 'number', min: 1, max: 120, message: '年龄必须在1‑120之间', trigger: 'blur' },
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  group: [{ required: true, message: '请选择组织', trigger: 'change' }],
  authPassword: [{ validator: validateAuthPassword, trigger: 'blur' }],
})

/* ------------------------- refs ------------------------- */
const formRef = ref<FormInstance>()
const loading = ref(false)

/* ------------------------- 事件 ------------------------- */
const handleRoleChange = () => {
  registerForm.authPassword = ''
  formRef.value?.clearValidate('authPassword')
}

/* ------------------------- API 调用 ------------------------- */
const fetchRoles = async () => {
  rolesLoading.value = true
  try {
    const { roles: roleList } = await getRoleList()
    roles.value = roleList
  } catch (error) {
    ElMessage.error('获取角色列表失败')
  } finally {
    rolesLoading.value = false
  }
}

const fetchGroups = async () => {
  groupsLoading.value = true
  try {
    const { groups: groupList } = await getGroupList()
    groups.value = groupList
  } catch (error) {
    ElMessage.error('获取组织列表失败')
  } finally {
    groupsLoading.value = false
  }
}

const validateAuthPasswordApi = async (password: string) => {
  try {
    await verifyAuthPassword(password)
    return true
  } catch {
    return false
  }
}

/* ------------------------- 注册处理（带防抖） ------------------------- */
const handleRegister = debounce(async () => {
  if (!formRef.value) return

  loading.value = true
  // console.log("开始时的：",loading.value)
  try {
    const valid = await formRef.value.validate()
    if (!valid) {
      loading.value = false
      return
    }

    if (showAuthPassword.value) {
      const ok = await validateAuthPasswordApi(registerForm.authPassword)
      // console.log("授权密码验证完：",loading.value)
      if (!ok) {
        // console.log("授权密码错误前：",loading.value)
        // ElMessage.error('授权密码错误2222')
        // console.log("授权密码错误后：",loading.value)
        loading.value = false
        // console.log("授权密码错误后，状态重置：",loading.value)
        return
      }
    }

    const data: RegisterRequest = {
      username: registerForm.username,
      password: registerForm.password,
      name: registerForm.name,
      age: registerForm.age!,
      gender: registerForm.gender,
      role: registerForm.role,
      group: registerForm.group,
    }

    await register(data)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error: any) {
    // ElMessage.error(error.response?.data?.message || error.message || '注册失败，请完善注册信息！')
  } finally {
    loading.value = false
  }
}, 800, { leading: true, trailing: false })

/* ------------------------- 其他 ------------------------- */
const goToLogin = () => router.push('/login')

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
.role-description,
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

/* Element Plus 深度样式 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #2c3e50;
}
:deep(.el-input__wrapper) {
  border-radius: 8px;
}
:deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
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

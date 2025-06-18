<template>
  <div class="profile-container min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">个人信息</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">管理你的个人资料和账户设置</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧个人信息卡片 -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
            <!-- 头像区域 -->
            <div class="relative inline-block mb-6">
              <div class="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {{ getAvatarText() }}
              </div>
              <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                <el-icon class="text-white text-sm">
                  <Check />
                </el-icon>
              </div>
            </div>

            <!-- 用户基本信息 -->
            <div class="space-y-2">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ userInfo?.name }}</h2>
              <p class="text-gray-600 dark:text-gray-400">@{{ userInfo?.username }}</p>
              <div class="flex items-center justify-center space-x-2">
                <el-tag :type="getRoleTagType()" size="small" class="px-3 py-1">
                  {{ userInfo?.role_name }}
                </el-tag>
              </div>
            </div>

            <!-- 用户统计信息 -->
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div class="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ userInfo?.id }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">用户ID</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ getJoinDays() }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">加入天数</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧详细信息区域 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 基本信息卡片 -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <el-icon class="mr-2 text-blue-500">
                  <User />
                </el-icon>
                基本信息
              </h3>
              <el-button
                  type="primary"
                  size="small"
                  :icon="Edit"
                  @click="isEditing = !isEditing"
                  class="rounded-full"
              >
                {{ isEditing ? '取消' : '编辑' }}
              </el-button>
            </div>

            <el-form
                :model="editForm"
                label-width="100px"
                class="space-y-4"
                :disabled="!isEditing"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <el-form-item label="姓名">
                  <el-input
                      v-model="editForm.name"
                      :readonly="!isEditing"
                      class="rounded-lg"
                  />
                </el-form-item>

                <el-form-item label="用户名">
                  <el-input
                      v-model="editForm.username"
                      :readonly="!isEditing"
                      class="rounded-lg"
                  />
                </el-form-item>

                <el-form-item label="年龄">
                  <el-input-number
                      v-model="editForm.age"
                      :min="1"
                      :max="120"
                      :readonly="!isEditing"
                      class="w-full"
                  />
                </el-form-item>

                <el-form-item label="性别">
                  <el-select
                      v-model="editForm.gender"
                      placeholder="请选择性别"
                      :disabled="!isEditing"
                      class="w-full"
                  >
                    <el-option label="男" value="男" />
                    <el-option label="女" value="女" />
                    <el-option label="其他" value="其他" />
                  </el-select>
                </el-form-item>
              </div>

              <div v-if="isEditing" class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <el-button @click="cancelEdit" class="rounded-full">
                  取消
                </el-button>
                <el-button
                    type="primary"
                    @click="saveChanges"
                    :loading="saving"
                    class="rounded-full"
                >
                  保存修改
                </el-button>
              </div>
            </el-form>
          </div>

          <!-- 系统信息卡片 -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-6">
              <el-icon class="mr-2 text-purple-500">
                <Setting />
              </el-icon>
              系统信息
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-400">角色</span>
                  <el-tag :type="getRoleTagType()" size="small">
                    {{ userInfo?.role_name }}
                  </el-tag>
                </div>

                <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-400">角色代码</span>
                  <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                    {{ userInfo?.role_code }}
                  </code>
                </div>

                <div class="flex items-center justify-between py-3">
                  <span class="text-gray-600 dark:text-gray-400">账户状态</span>
                  <el-tag :type="userInfo?.enable ? 'danger' : 'success'" size="small">
                    {{ userInfo?.enable ? '禁用' : '启用' }}
                  </el-tag>
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-400">用户组</span>
                  <span class="text-gray-900 dark:text-white">
                    {{ userInfo?.group_name || '暂无分组' }}
                  </span>
                </div>

                <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-400">创建时间</span>
                  <span class="text-gray-900 dark:text-white text-sm">
                    {{ formatDate(userInfo?.created_time) }}
                  </span>
                </div>

                <div class="flex items-center justify-between py-3">
                  <span class="text-gray-600 dark:text-gray-400">用户ID</span>
                  <span class="text-gray-900 dark:text-white font-mono">
                    #{{ userInfo?.id }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store';
import { User, Edit, Setting, Check } from '@element-plus/icons-vue';
import type { UserInfo } from '@/store/modules/user/types';

const userStore = useUserStore();
const isEditing = ref(false);
const saving = ref(false);

// 用户信息
const userInfo = computed(() => {
  if (userStore.userInfo) {
    return userStore.userInfo;
  }

  const cached = localStorage.getItem('userInfo');
  if (cached) {
    try {
      return JSON.parse(cached) as UserInfo;
    } catch (error) {
      console.error('解析用户信息失败:', error);
      return null;
    }
  }
  return null;
});

// 编辑表单
const editForm = ref<Partial<UserInfo>>({});

// 初始化编辑表单
const initEditForm = () => {
  if (userInfo.value) {
    editForm.value = {
      name: userInfo.value.name,
      username: userInfo.value.username,
      age: userInfo.value.age,
      gender: userInfo.value.gender,
    };
  }
};

// 获取头像文字
const getAvatarText = () => {
  if (!userInfo.value?.name) return 'U';

  // 根据角色设置不同的头像样式
  const roleCode = userInfo.value.role_code;
  if (roleCode === 'admin') return '管';
  if (roleCode === 'doctor') return '医';
  if (roleCode === 'nurse') return '护';
  if (roleCode === 'patient') return '患';

  // 默认使用姓名首字符
  return userInfo.value.name.charAt(0).toUpperCase();
};

// 获取角色标签类型
const getRoleTagType = () => {
  const roleCode = userInfo.value?.role_code;
  switch (roleCode) {
    case 'admin': return 'danger';
    case 'doctor': return 'primary';
    case 'nurse': return 'success';
    case 'patient': return 'info';
    default: return 'info';
  }
};

// 计算加入天数
const getJoinDays = () => {
  if (!userInfo.value?.created_time) return 0;

  const createdDate = new Date(userInfo.value.created_time);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知';

  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false;
  initEditForm();
};

// 保存修改
const saveChanges = async () => {
  try {
    saving.value = true;

    // 这里应该调用API更新用户信息
    // await updateUserProfile(editForm.value);

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 更新本地存储的用户信息
    if (userInfo.value) {
      const updatedUserInfo = {
        ...userInfo.value,
        ...editForm.value
      };

      // 更新store和localStorage
      userStore.userInfo = updatedUserInfo;
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
    }

    isEditing.value = false;
    ElMessage.success('个人信息更新成功！');

  } catch (error) {
    console.error('更新个人信息失败:', error);
    ElMessage.error('更新失败，请稍后重试');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  initEditForm();
});
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

:deep(.dark .el-form-item__label) {
  color: #d1d5db;
}

:deep(.el-input__wrapper) {
  border-radius: 0.5rem;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 0.5rem;
}

:deep(.el-input-number .el-input__wrapper) {
  border-radius: 0.5rem;
}

/* 头像渐变背景 */
.profile-container .bg-gradient-to-br {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
}

/* 卡片悬浮效果 */
.profile-container .bg-white,
.profile-container .dark\\:bg-gray-800 {
  transition: all 0.3s ease;
}

.profile-container .bg-white:hover,
.profile-container .dark\\:bg-gray-800:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }

  .profile-container .grid {
    grid-template-columns: 1fr;
  }
}
</style>
<!-- src/views/profile/index.vue -->
<template>
  <div class="common-layout">
    <div class="user-profile-container">
      <!-- 头像与基础信息 -->
      <div class="profile-header">
        <el-card class="header-card gradient-bg" shadow="hover">
          <div class="header-content">
            <!-- 头像 -->
            <div class="avatar-section">
              <el-avatar :size="80" :src="avatarUrl" class="user-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
            </div>

            <!-- 基本信息 -->
            <div class="user-info">
              <div class="username">{{ userStore.userProfile?.username || '加载中...' }}</div>
              <div class="role-name">{{ userStore.userProfile?.role_name || '角色加载中...' }}</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 详细信息 -->
      <div class="profile-details">
        <el-card class="details-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>个人详细信息</span>
              <el-button type="primary" size="small" disabled>
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
            </div>
          </template>

          <div class="details-content">
            <!-- 下面所有 el-row / el-col 与原代码一致，可按需增删字段 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <label class="info-label">用户ID：</label>
                  <span class="info-value">{{ userStore.userProfile?.id || '-' }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <label class="info-label">姓名：</label>
                  <span class="info-value">{{ userStore.userProfile?.name || '-' }}</span>
                </div>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <label class="info-label">年龄：</label>
                  <span class="info-value">
                    {{ userStore.userProfile?.age ? userStore.userProfile.age + ' 岁' : '-' }}
                  </span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <label class="info-label">性别：</label>
                  <span class="info-value">
                    {{
                      userStore.userProfile?.gender === 'M'
                          ? '男'
                          : userStore.userProfile?.gender === 'F'
                              ? '女'
                              : '-'
                    }}
                  </span>
                </div>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <label class="info-label">账户状态：</label>
                  <el-tag :type="userStore.userProfile?.enable ? 'success' : 'danger'">
                    {{ userStore.userProfile?.enable ? '启用' : '禁用' }}
                  </el-tag>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <label class="info-label">角色代码：</label>
                  <span class="info-value">{{ userStore.userProfile?.role_code || '-' }}</span>
                </div>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <label class="info-label">所属组织：</label>
                  <span class="info-value">{{ userStore.userProfile?.group_name || '暂无' }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <label class="info-label">创建时间：</label>
                  <span class="info-value">{{ formatDate(userStore.userProfile?.created_time) || '-' }}</span>
                </div>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <label class="info-label">当前登录IP：</label>
                  <el-tag type="success">{{ loginMeta?.current_login_ip || '-' }}</el-tag>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <label class="info-label">上次登录IP：</label>
                  <el-tag>{{ loginMeta?.last_login_ip || '-' }}</el-tag>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Edit } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/modules/user';
import { getGeneralRoleFromToken } from '@/utils/auth';

// 使用 store
const userStore = useUserStore();
const loading = ref(false);
const loginMetaRaw = localStorage.getItem('loginMeta');
const loginMeta = loginMetaRaw ? JSON.parse(loginMetaRaw) : null;

// 用户头像
const avatarUrl = computed(() => {
  const roleCode = getGeneralRoleFromToken();
  return `/images/default-avatar-${roleCode}.svg` || '';
});

// 获取用户信息
const fetchUserProfile = async () => {
  loading.value = true;
  try {
    await userStore.fetchUserProfile();
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped lang="scss">
/* —— 通用布局 —— */
.common-layout {
  height: 100%;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

/* —— 页面内容 —— */
.user-profile-container {
  width: 100%;
  max-width: 1200px;
}

.profile-header {
  margin-bottom: 20px; // 与下面个人详细信息卡片的间距
  margin-top: -15px; // 与页面顶部(Header bar)的间距

  .gradient-bg {
    background: linear-gradient(135deg, #409eff, #ffffff);
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  }

  .header-card {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;

    .header-content {
      display: flex;
      gap: 20px;

      .avatar-section {
        .user-avatar {
          border: 2px solid #e4e7ed;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }

      .user-info {
        flex: 1;

        .username {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 8px;
        }

        .role-name {
          font-size: 16px;
          color: #f5f7fa;
          background: #409eff;
          padding: 4px 12px;
          border-radius: 4px;
          display: inline-block;
        }
      }
    }
  }
}

.profile-details {
  .details-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-size: medium;
        font-weight: 700;
        color: #303133;
      }
    }

    .details-content {
      .el-row {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .info-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f2f5;

        .info-label {
          font-weight: 600;
          font-size: small;
          color: black;
          width: 100px;
          flex-shrink: 0;
        }

        .info-value {
          color: #303133;
          flex: 1;
          font-weight: 500;
          font-size: small;
          word-break: break-word;
        }
      }
    }
  }
}

/* —— 响应式 —— */
@media (max-width: 768px) {
  .common-layout {
    padding: 10px;
  }

  .profile-header {
    .header-card {
      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 15px;

        .user-info {
          .username {
            font-size: 20px;
          }

          .role-name {
            font-size: 14px;
          }
        }
      }
    }
  }

  .profile-details {
    .details-content {
      .el-row {
        .el-col {
          span: 24 !important;
        }
      }
    }
  }
}
</style>

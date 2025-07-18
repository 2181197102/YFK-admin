<!--src/components/Header/index.vue-->
<template>
  <header
      class="antialiased text-slate-500 dark:text-slate-400 header-container"
      :style="headerStyle"
  >
    <div
        class="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] supports-backdrop-blur:bg-white/60 dark:bg-transparent"
        :style="headerContainerStyle"
    >
      <div class="mx-auto max-w-8xl">
        <div
            class="px-4 py-4 border-b border-slate-900/10 lg:px-8 lg:border-0 dark:border-slate-300/10"
        >
          <div
              class="relative flex items-center justify-between text-2xl sm:text-2xl font-blimone"
          >
            <!-- 左侧区域 -->
            <div class="flex items-center space-x-4">
              <!-- 折叠控制按钮 -->
              <el-tooltip
                  :content="collapsedState ? '展开侧边栏' : '折叠侧边栏'"
                  placement="bottom"
                  :show-after="500"
              >
                <el-button
                    class="nav-btn collapse-btn"
                    text
                    size="large"
                    @click="toggleLayout"
                    :style="iconButtonStyle"
                >
                  <el-icon
                      size="20"
                      :style="iconButtonStyle"
                      class="collapse-icon"
                  >
                    <Expand v-if="collapsedState" />
                    <Fold v-else />
                  </el-icon>
                </el-button>
              </el-tooltip>

              <!-- Logo -->
              <router-link
                  to="/"
                  class="flex-none w-[2.0625rem] md:w-auto leading-6 dark:text-slate-200 logo-container"
              >
                <img src="/images/YFK-Logo.svg" alt="Logo" class="logo-image" />
                <span class="logo-text">医防康</span>
              </router-link>
            </div>

            <!-- 右侧功能区 -->
            <div class="flex items-center space-x-4">
              <!-- 主题切换按钮 -->
              <el-tooltip
                  :content="theme === 'light' ? '设置暗黑主题' : '设置明亮主题'"
                  placement="bottom"
                  :show-after="500"
              >
                <el-button
                    class="nav-btn theme-btn"
                    text
                    size="large"
                    @click="toggleTheme()"
                    :style="iconButtonStyle"
                >
                  <el-icon
                      size="20"
                      :style="iconButtonStyle"
                      class="theme-icon"
                  >
                    <Sunny v-if="theme === 'dark'" />
                    <Moon v-else />
                  </el-icon>
                </el-button>
              </el-tooltip>

              <el-dropdown @command="handleCommand" trigger="click">
                <div
                    class="user-dropdown-trigger"
                >
                  <el-avatar
                      :size="32"
                      :src="userAvatar"
                      class="user-avatar"
                  >
                    <el-icon><User /></el-icon>
                  </el-avatar>
                  <span class="user-name">
                    {{ userName }}
                  </span>
                  <el-icon class="dropdown-arrow">
                    <ArrowDown />
                  </el-icon>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">
                      <el-icon class="mr-2"><User /></el-icon>
                      个人信息
                    </el-dropdown-item>
                    <el-dropdown-item command="logout" divided>
                      <el-icon class="mr-2"><SwitchButton /></el-icon>
                      退出登录
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDark, useToggle } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAppStore, useUserStore } from '@/store';
import {
  Sunny,
  Moon,
  User,
  ArrowDown,
  SwitchButton,
  Expand,
  Fold,
} from '@element-plus/icons-vue';
import {
  getUsernameFromToken,
  getGeneralRoleFromToken,
} from '@/utils/auth';

const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();

// 接收父组件传入的折叠状态
const props = defineProps<{
  collapsedState: boolean;
}>();

// 定义emit事件
const emit = defineEmits<{
  toggleLayout: [collapsed: boolean];
}>();

// 切换布局折叠状态
const toggleLayout = () => {
  // 直接通过 emit 告诉父组件新的折叠状态
  emit('toggleLayout', !props.collapsedState);
};

// 主题相关
const theme = computed(() => appStore.theme);

// Header背景色
const headerStyle = computed(() => ({
  backgroundColor: theme.value === 'dark' ? '#0f172a' : '#dbeafe',
  transition: 'background-color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
}));

// Header容器背景色（含透明度）
const headerContainerStyle = computed(() => ({
  backgroundColor: theme.value === 'dark' ? '#18203AE5' : '#dbeafeE5',
  backdropFilter: 'blur(8px)',
  transition: 'background-color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
}));

// 图标按钮颜色跟随主题
const iconColor = computed(() =>
    theme.value === 'dark' ? '#e2e8f0' : '#1e40af',
);
const iconButtonStyle = computed(() => ({ color: iconColor.value }));

// 暗黑切换
const isDark = useDark({
  selector: 'body',
  onChanged(dark: boolean) {
    appStore.toggleTheme(dark);
  },
});
const toggleTheme = useToggle(isDark);

// 用户头像
const userAvatar = computed(() => {
  const roleCode = getGeneralRoleFromToken();
  return `/images/default-avatar-${roleCode}.svg`;
});

// 用户名
const userName = computed(() => getUsernameFromToken());

// 下拉菜单操作
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      await router.push('/profile');
      break;
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出医防康系统吗？', '退出确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true,
          customClass: 'logout-confirm-box',
          showClose: true,
          closeOnClickModal: true,
          closeOnPressEscape: true,
          lockScroll: true,
        });
        await userStore.logout();
        ElMessage.success('退出登录成功');
        await router.push('/login');
      } catch (error) {
        if (error !== 'cancel') {
          console.error('退出登录失败:', error);
          ElMessage.error('退出登录失败');
        }
      }
      break;
  }
};
</script>

<style lang="less" scoped>
.header-container {
  position: relative;
  z-index: 100;
}

html.dark {
  a {
    color: white !important;
  }
}

html {
  a {
    color: black !important;
  }
}

/* 按钮通用动画优化 */
.nav-btn {
  position: relative;
  border-radius: 8px;
  padding: 8px;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    transition: all 0.1s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
}

/* 主题切换按钮动画 */
.theme-btn {
  .theme-icon {
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }

  &:hover .theme-icon {
    transform: rotate(180deg) scale(1.1);
  }
}

/* Logo区域优化 */
.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

  &:hover {
    transform: translateY(-1px);
  }

  .logo-image {
    height: 24px;
    width: auto;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }

  .logo-text {
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
}

/* 用户下拉菜单优化 */
.user-dropdown-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }

  .user-avatar {
    border: 2px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

    &:hover {
      transform: scale(1.05);
      border-color: rgba(255, 255, 255, 0.4);
    }
  }

  .user-name {
    margin-left: 8px;
    margin-right: 4px;
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

    @media (max-width: 640px) {
      display: none;
    }
  }

  .dropdown-arrow {
    font-size: 12px;
    color: #94a3b8;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }

  &:hover .dropdown-arrow {
    transform: translateY(1px);
  }
}

/* 下拉菜单样式优化 */
:deep(.el-dropdown-menu) {
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;

  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

    &:hover {
      background-color: rgba(59, 130, 246, 0.1);
      transform: translateX(4px);
    }

    .el-icon {
      font-size: 16px;
      margin-right: 8px;
    }
  }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .nav-btn {
    padding: 6px;
  }

  .logo-container {
    .logo-text {
      font-size: 18px;
    }
  }
}

/* 暗黑模式下的特殊样式 */
html.dark {
  .user-dropdown-trigger {
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .user-name {
      color: #cbd5e1;
    }

    .dropdown-arrow {
      color: #94a3b8;
    }
  }

  :deep(.el-dropdown-menu__item) {
    &:hover {
      background-color: rgba(59, 130, 246, 0.2);
    }
  }
}
</style>
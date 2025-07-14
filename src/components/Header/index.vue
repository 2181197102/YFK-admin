<!--src/components/Header/index.vue-->
<template>
  <header
      class="antialiased text-slate-500 dark:text-slate-400"
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
                  :content="isLayoutCollapsed ? '展开侧边栏' : '折叠侧边栏'"
              >
                <el-button
                    class="nav-btn"
                    text
                    size="large"
                    @click="toggleLayout"
                    :style="iconButtonStyle"
                >
                  <el-icon size="20" :style="iconButtonStyle">
                    <Expand v-if="isLayoutCollapsed" />
                    <Fold v-else />
                  </el-icon>
                </el-button>
              </el-tooltip>

              <!-- Logo -->
              <router-link
                  to="/"
                  class="flex-none w-[2.0625rem] md:w-auto leading-6 dark:text-slate-200"
              >
                <img src="/images/YFK-Logo.svg" alt="Logo" class="h-6 w-auto" />
                医防康
              </router-link>
            </div>

            <!-- 右侧功能区 -->
            <div class="flex items-center space-x-4">
              <!-- 主题切换按钮 -->
              <el-tooltip
                  :content="theme === 'light' ? '设置暗黑主题' : '设置明亮主题'"
              >
                <el-button
                    class="nav-btn"
                    text
                    size="large"
                    @click="toggleTheme()"
                    :style="iconButtonStyle"
                >
                  <el-icon size="20" :style="iconButtonStyle">
                    <Sunny v-if="theme === 'dark'" />
                    <Moon v-else />
                  </el-icon>
                </el-button>
              </el-tooltip>

              <!-- 用户头像下拉菜单 -->
              <el-dropdown @command="handleCommand" trigger="click">
                <div
                    class="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <el-avatar
                      :size="32"
                      :src="userAvatar"
                      class="border border-slate-200 dark:border-slate-700"
                  >
                    <el-icon><User /></el-icon>
                  </el-avatar>
                  <span
                      class="ml-2 text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block"
                  >
                    {{ userName }}
                  </span>
                  <el-icon class="ml-1 text-slate-400">
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
import { computed, ref } from 'vue';
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

// 左侧布局折叠状态
const isLayoutCollapsed = ref(false);

// 定义emit事件
const emit = defineEmits<{
  toggleLayout: [collapsed: boolean];
}>();

// 切换布局折叠状态
const toggleLayout = () => {
  isLayoutCollapsed.value = !isLayoutCollapsed.value;
  emit('toggleLayout', isLayoutCollapsed.value);
};

// 主题相关
const theme = computed(() => appStore.theme);

// Header背景色
const headerStyle = computed(() => ({
  backgroundColor: theme.value === 'dark' ? '#1e3a8a' : '#dbeafe',
  transition: 'background-color 0.3s ease',
}));

// Header容器背景色（含透明度）
const headerContainerStyle = computed(() => ({
  backgroundColor: theme.value === 'dark' ? '#1e3a8aE5' : '#dbeafeE5', // 加透明度 0.9
  backdropFilter: 'blur(8px)',
  transition: 'background-color 0.3s ease',
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

/* 按钮通用动画 */
.nav-btn {
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.1);
  }
}

/* 头像下拉菜单样式优化 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  .el-icon {
    font-size: 14px;
  }
}

/* 头像 hover 效果 */
.el-avatar {
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.05);
  }
}
</style>

<!--src/components/Header/index.vue-->
<template>
  <header class="antialiased bg-white text-slate-500 dark:text-slate-400 dark:bg-slate-900">
    <div
        class="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white/95 supports-backdrop-blur:bg-white/60 dark:bg-transparent"
    >
      <div class="mx-auto max-w-8xl">
        <div class="px-4 py-4 border-b border-slate-900/10 lg:px-8 lg:border-0 dark:border-slate-300/10">
          <div class="relative flex items-center justify-between text-2xl sm:text-2xl font-blimone">
            <!-- 左侧Logo -->
            <router-link to="/" class="flex-none w-[2.0625rem] md:w-auto leading-6 dark:text-slate-200">
              <img src="/images/YFK-Logo.svg" alt="Logo" class="h-6 w-auto" />
              医防康
            </router-link>

            <!-- 右侧功能区 -->
            <div class="flex items-center space-x-4">
              <!-- 主题切换按钮 -->
              <el-tooltip :content="theme === 'light' ? '设置暗黑主题' : '设置明亮主题'">
                <el-button
                    class="nav-btn"
                    :shape="'circle'"
                    type="info"
                    plain
                    :icon="theme === 'dark' ? Sunny : Moon"
                    circle
                    size="small"
                    @click="toggleTheme()"
                />
              </el-tooltip>

              <!-- 用户头像下拉菜单 -->
              <el-dropdown @command="handleCommand" trigger="click">
                <div class="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                  <el-avatar
                      :size="32"
                      :src="userAvatar"
                      class="border border-slate-200 dark:border-slate-700"
                  >
                    <el-icon><User /></el-icon>
                  </el-avatar>
                  <span class="ml-2 text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">
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
import { computed } from 'vue';
import { useDark, useToggle } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAppStore, useUserStore } from '@/store';
import { Sunny, Moon, User, ArrowDown, SwitchButton } from '@element-plus/icons-vue';

const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();

// 主题相关
const theme = computed(() => {
  return appStore.theme;
});

const isDark = useDark({
  selector: 'body',
  onChanged(dark: boolean) {
    appStore.toggleTheme(dark);
  },
});

const toggleTheme = useToggle(isDark);

// 用户信息相关
const userInfo = computed(() => {
  // 优先从store获取，如果没有则从localStorage获取
  if (userStore.loginMeta) {
    return userStore.loginMeta;
  }

  const cached = localStorage.getItem('userInfo');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (error) {
      console.error('解析用户信息失败:', error);
      return null;
    }
  }
  return null;
});

// 用户头像 - 可以根据实际字段调整
const userAvatar = computed(() => {
  return userInfo.value?.avatar || '/images/default-avatar.svg';
});

// 用户名称 - 可以根据实际字段调整
function getUsernameFromToken(): string {
  const token = localStorage.getItem('access_token');
  if (!token) return '用户';

  try {
    const payload = token.split('.')[1]; // 获取中间段
    const decoded = JSON.parse(atob(payload));
    return decoded.username || '用户';
  } catch (e) {
    return '用户';
  }
}

const userName = computed(() => {
  return getUsernameFromToken();
});

// 下拉菜单点击处理
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      // 跳转到个人信息页面
      await router.push('/profile');
      break;
    case 'logout':
      // 退出登录确认
      try {
        await ElMessageBox.confirm(
            '确定要退出医防康系统吗？',
            '退出确认',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
              center: true,
              // 修改这里：不指定appendTo，让它使用默认的body
              // appendTo: 'body',
              customClass: 'logout-confirm-box',
              // 添加这些属性确保正确居中
              showClose: true,
              closeOnClickModal: true,
              closeOnPressEscape: true,
              lockScroll: true,
            }
        );

        // 执行退出登录
        await userStore.logout();
        ElMessage.success('退出登录成功');

        // 跳转到登录页面
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

// 头像下拉菜单样式优化
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  padding: 8px 16px;

  .el-icon {
    font-size: 14px;
  }
}

// 头像hover效果
.el-avatar {
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}
</style>

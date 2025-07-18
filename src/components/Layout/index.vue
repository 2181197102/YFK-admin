<!--src/components/Layout/index.vue-->
<template>
  <div class="layout-wrapper" :class="{ 'is-collapsed': isCollapse }">
    <el-menu
        :default-active="$route.path"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        @open="handleOpen"
        @close="handleClose"
        router
        :background-color="theme === 'dark' ? '#0f172a' : '#dbeafe'"
        :text-color="theme === 'dark' ? '#e2e8f0' : '#1e40af'"
        active-text-color="#fbbf24"
        :collapse-transition="true"
    >
      <!-- 将渲染导航每一项传给子组件渲染，item代表要渲染每一项 -->
      <SubAside
          :isCollapse="isCollapse"
          v-for="item in filteredNavs"
          :key="item.path"
          :menu="item"
          :index="item.path"
      />
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import SubAside from './subAside.vue';
import { useAppStore } from '@/store/modules/app';
import { getUserMenus } from '@/utils/menu';
import { getGeneralRoleFromToken } from '@/utils/auth';

// 定义props来接收折叠状态
const props = defineProps<{
  collapsed?: boolean
}>();

const isCollapse = ref(false);
const appStore = useAppStore();
const userRole = ref('');
const filteredNavs = ref<any[]>([]);

// 监听props变化，更新折叠状态
watch(
    () => props.collapsed,
    async (newVal) => {
      if (newVal !== undefined) {
        // 使用 nextTick 确保DOM更新完成
        await nextTick();
        isCollapse.value = newVal;
      }
    },
    { immediate: true }
);

const theme = computed(() => {
  return appStore.theme;
});

// 初始化菜单
const initializeMenus = () => {
  userRole.value = getGeneralRoleFromToken();

  if (!userRole.value) {
    console.warn('用户未登录或角色获取失败');
    filteredNavs.value = [];
    return;
  }

  // 直接调用 getUserMenus()，不需要传递参数
  filteredNavs.value = getUserMenus();

  // console.log('用户角色:', userRole.value);
  // console.log('过滤后的菜单:', filteredNavs.value);
};

onMounted(() => {
  initializeMenus();
});

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};

const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};

// 暴露刷新菜单的方法，用于角色变更后重新加载菜单
const refreshMenus = () => {
  initializeMenus();
};

// 暴露设置折叠状态的方法
const setCollapse = (collapsed: boolean) => {
  isCollapse.value = collapsed;
};

defineExpose({
  refreshMenus,
  setCollapse,
  isCollapse
});
</script>

<style lang="less" scoped>
.layout-wrapper {
  height: 100%;
  position: relative;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

  &.is-collapsed {
    .el-menu-vertical-demo {
      :deep(.el-menu-item),
      :deep(.el-sub-menu__title) {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
    }
  }
}

.el-menu-vertical-demo {
  height: 100%;
  border-right: none;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

  // 优化菜单项的过渡效果
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    overflow: hidden;
    white-space: nowrap;
  }

  // 优化子菜单的过渡效果
  :deep(.el-sub-menu) {
    .el-sub-menu__title {
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    }

    .el-menu {
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
  }

  // 折叠时的图标居中
  &.el-menu--collapse {
    :deep(.el-menu-item) {
      text-align: center;

      .el-icon {
        margin-right: 0;
      }
    }

    :deep(.el-sub-menu__title) {
      text-align: center;

      .el-icon {
        margin-right: 0;
      }
    }
  }

  // 优化激活状态的过渡
  :deep(.el-menu-item.is-active) {
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }

  // 优化 hover 效果
  :deep(.el-menu-item:hover),
  :deep(.el-sub-menu__title:hover) {
    transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
}

// 响应式优化
@media (max-width: 768px) {
  .layout-wrapper {
    transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
}
</style>
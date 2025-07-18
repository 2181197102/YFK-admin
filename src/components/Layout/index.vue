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
  collapsed?: boolean; // 允许从父组件传入初始折叠状态
}>();

const isCollapse = ref(props.collapsed !== undefined ? props.collapsed : false); // 根据props初始化
const appStore = useAppStore();
const userRole = ref('');
const filteredNavs = ref<any[]>([]);

// 监听props变化，更新折叠状态
watch(
    () => props.collapsed,
    async (newVal) => {
      // 只有当传入的 collapsed 值发生变化时才更新 isCollapse
      if (newVal !== undefined && newVal !== isCollapse.value) {
        await nextTick(); // 确保DOM更新完成
        isCollapse.value = newVal;
      }
    },
    { immediate: true } // 立即执行一次，确保初始同步
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
};

onMounted(() => {
  initializeMenus();
});

const handleOpen = (key: string, keyPath: string[]) => {
  // console.log(key, keyPath);
};

const handleClose = (key: string, keyPath: string[]) => {
  // console.log(key, keyPath);
};

// 暴露刷新菜单的方法，用于角色变更后重新加载菜单
const refreshMenus = () => {
  initializeMenus();
};

// 暴露设置折叠状态的方法，供外部调用以改变侧边栏折叠状态
const setCollapse = (collapsed: boolean) => {
  isCollapse.value = collapsed;
};

defineExpose({
  refreshMenus,
  setCollapse,
  isCollapse, // 暴露 isCollapse 状态，方便父组件获取当前状态
});
</script>

<style lang="less" scoped>
.layout-wrapper {
  height: 100%;
  position: relative;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  // 新增样式：允许内部内容滚动
  overflow-y: auto; // 确保在内容超出时显示垂直滚动条
  overflow-x: hidden; // 隐藏水平滚动条

  &.is-collapsed {
    .el-menu-vertical-demo {
      :deep(.el-menu-item),
      :deep(.el-sub-menu__title) {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
    }
  }

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px; // 滚动条宽度
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9; // 滚动条轨道背景色
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1; // 滚动条滑块背景色
    border-radius: 3px;
    transition: background 0.3s ease;

    &:hover {
      background: #94a3b8; // 鼠标悬停时滑块背景色
    }
  }
}

.el-menu-vertical-demo {
  height: 100%; // 确保菜单占据父容器的全部高度
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
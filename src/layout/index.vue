<!-- src/layout/index.vue -->
<template>
  <div class="app-layout">
    <el-container class="layout-container">
      <!-- 侧边栏 - 支持折叠 -->
      <el-aside
          :width="sidebarWidth"
          class="sidebar-container"
          :class="{ 'is-collapsed': isLayoutCollapsed }"
      >
        <div class="sidebar-content">
          <Layout :collapsed="isLayoutCollapsed" ref="layoutRef" />
        </div>
      </el-aside>

      <!-- 右侧：头部 + 主体内容 -->
      <el-container class="main-container">
        <el-header class="header-container">
          <Header :collapsedState="isLayoutCollapsed" @toggle-layout="handleToggleLayout" />
        </el-header>

        <el-main class="main-content">
          <!-- 路由出口 - 只有这里的内容会根据路由变化 -->
          <div class="content-wrapper">
            <router-view v-slot="{ Component }">
              <transition
                  name="fade-slide"
                  mode="out-in"
                  appear
              >
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Header from '@/components/Header/index.vue';
import Layout from '@/components/Layout/index.vue';

// 布局折叠状态，默认展开
const isLayoutCollapsed = ref(false);
const layoutRef = ref();

// 计算侧边栏宽度
const sidebarWidth = computed(() => {
  return isLayoutCollapsed.value ? '64px' : '200px';
});

// 处理Header发出的切换事件
const handleToggleLayout = (collapsed: boolean) => {
  isLayoutCollapsed.value = collapsed;
  // 通过 ref 调用 Layout 组件的 setCollapse 方法来同步其状态
  if (layoutRef.value) {
    layoutRef.value.setCollapse(collapsed);
  }
};

// 响应式处理
const handleResize = () => {
  const width = window.innerWidth;
  if (width < 768 && !isLayoutCollapsed.value) {
    // 移动设备自动折叠
    isLayoutCollapsed.value = true;
    // 同时也更新 Layout 组件的状态
    if (layoutRef.value) {
      layoutRef.value.setCollapse(true);
    }
  } else if (width >= 768 && isLayoutCollapsed.value && window.localStorage.getItem('isCollapsedOnMobile') !== 'true') {
    // 在桌面端自动展开，但如果用户在移动端手动折叠了，则不自动展开
    // 这里可以根据实际需求调整自动展开的逻辑
    isLayoutCollapsed.value = false;
    if (layoutRef.value) {
      layoutRef.value.setCollapse(false);
    }
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  handleResize(); // 初始化检查
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="less" scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #dbeafe 0%, #dbeafe 100%);

  .layout-container {
    height: 100%;
    position: relative;
  }

  .sidebar-container {
    position: relative;
    z-index: 50;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    overflow: hidden;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

    &.is-collapsed {
      .sidebar-content {
        :deep(.el-menu-item span),
        :deep(.el-sub-menu__title span) {
          opacity: 0;
          transform: translateX(-10px);
        }
      }
    }

    .sidebar-content {
      height: 100%;
      position: relative;
      background: inherit;

      :deep(.el-menu-item span),
      :deep(.el-sub-menu__title span) {
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        opacity: 1;
        transform: translateX(0);
      }
    }
  }

  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; // 防止flex布局溢出
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }

  .header-container {
    padding: 0;
    height: 64px;
    line-height: 64px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 40;
  }

  .main-content {
    flex: 1;
    padding: 0;
    overflow: hidden;
    background: #f8fafc;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

    .content-wrapper {
      height: 100%;
      padding: 24px;
      overflow-y: auto;
      overflow-x: hidden;

      // 自定义滚动条
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
        transition: background 0.3s ease;

        &:hover {
          background: #94a3b8;
        }
      }
    }
  }
}

// 页面切换动画
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// 响应式布局
@media (max-width: 768px) {
  .app-layout {
    .sidebar-container {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      z-index: 999;
      transform: translateX(0);

      &.is-collapsed {
        transform: translateX(-100%);
      }
    }

    .main-container {
      margin-left: 0;
    }

    .main-content {
      .content-wrapper {
        padding: 16px;
      }
    }
  }
}

@media (max-width: 480px) {
  .app-layout {
    .main-content {
      .content-wrapper {
        padding: 12px;
      }
    }
  }
}

// 暗黑模式支持
html.dark {
  .app-layout {
    background: linear-gradient(135deg, #0f172a 0%, #0f172a 100%);

    .main-content {
      background: #f1f5f9; // 浅灰色，接近 Tailwind 的 slate-100

      .content-wrapper {
        &::-webkit-scrollbar-track {
          background: #e2e8f0; // 浅灰轨道（slate-200）
        }

        &::-webkit-scrollbar-thumb {
          background: #cbd5e1; // 滚动条拖动条（slate-300）

          &:hover {
            background: #94a3b8; // 悬浮时更深一点（slate-400）
          }
        }
      }
    }
  }
}

// 高性能动画优化
.sidebar-container,
.main-container {
  will-change: transform, width;
}

// 减少重绘
.sidebar-container {
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>
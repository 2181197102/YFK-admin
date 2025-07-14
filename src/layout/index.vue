<!-- src/layout/index.vue -->
<template>
  <div class="app-layout">
    <el-container>
      <!-- 侧边栏 - 支持折叠 -->
      <el-aside :width="isLayoutCollapsed ? '64px' : '180px'" class="sidebar-container">
        <Layout :collapsed="isLayoutCollapsed" />
      </el-aside>

      <!-- 右侧：头部 + 主体内容 -->
      <el-container>
        <el-header>
          <Header @toggle-layout="handleToggleLayout" />
        </el-header>

        <el-main>
          <!-- 路由出口 - 只有这里的内容会根据路由变化 -->
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Header from '@/components/Header/index.vue';
import Layout from '@/components/Layout/index.vue';

// 布局折叠状态，默认展开
const isLayoutCollapsed = ref(false);

// 处理Header发出的切换事件
const handleToggleLayout = (collapsed: boolean) => {
  isLayoutCollapsed.value = collapsed;
};
</script>

<style lang="less" scoped>
.app-layout {
  height: 100vh;

  .el-container {
    height: 100%;
  }

  .el-header {
    padding: 0;
  }

  .el-main {
    padding: 20px;
  }

  .sidebar-container {
    transition: width 0.3s ease;
    overflow: hidden;
  }
}
</style>
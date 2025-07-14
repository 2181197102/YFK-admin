<!-- 1. 创建统一的布局组件 src/layout/index.vue -->
<template>
  <div class="app-layout">
    <el-container>
      <!-- 侧边栏 - 只会初始化一次 -->
      <el-aside width="180px">
        <Layout />
      </el-aside>

      <!-- 右侧：头部 + 主体内容 -->
      <el-container>
        <el-header>
          <Header />
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
import Header from '@/components/Header/index.vue';
import Layout from '@/components/Layout/index.vue';
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
}
</style>
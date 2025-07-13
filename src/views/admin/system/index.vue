<template>
  <div class="common-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="180px">
        <Layout />
      </el-aside>

      <!-- 右侧：头部 + 主体 -->
      <el-container>
        <el-header>
          <Header />
        </el-header>

        <el-main>
          <!-- TODO 占位区 -->
          <div class="todo-wrapper">
            <el-card shadow="hover" class="todo-card">
              <p class="todo-text">这里是 admin/system/index.vue 系统设置 页面占位</p>
            </el-card>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
// 头部与侧边栏组件
import Header from '@/components/Header/index.vue';
import Layout from '@/components/Layout/index.vue';

// 此处未来可引入 Pinia、VueUse 等库来管理 todo 数据
</script>

<style scoped lang="less">
.common-layout {
  height: 100%;

  .el-container {
    height: 100%;
  }

  .el-header {
    padding: 0;
  }
}

/* 居中卡片 */
.todo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.todo-card {
  padding: 24px 48px;
  border-radius: 16px;
}

.todo-text {
  font-size: 1.25rem; // text‑xl
  font-weight: 600;   // font‑semibold
  margin: 0;
  text-align: center;
}
</style>

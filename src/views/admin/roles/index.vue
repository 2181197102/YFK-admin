<!-- src/views/admin/roles/index.vue -->
<template>
  <div class="common-layout">
    <el-card shadow="hover" class="todo-card">
      <p class="todo-text">这里是 /admin/roles/index.vue 角色管理 页面占位</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 不再需要引入 Header 和 Layout 组件
</script>

<style scoped lang="less">
.common-layout {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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
<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-white text-gray-700">
    <h1 class="text-7xl font-bold text-blue-500">404</h1>
    <h2 class="text-2xl mt-4 font-semibold">页面未找到</h2>
    <p class="mt-2 text-gray-500">你访问的页面不存在或已被删除。</p>
    <router-link
        to="/"
        class="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
    >
      返回首页
    </router-link>
  </div>
</template>

<script setup>
// 无需逻辑处理
</script>

<style scoped>
/* 可选自定义样式 */
</style>

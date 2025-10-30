<!-- src/views/common/SmsAuthDialog/index.vue -->
<template>
  <div class="demo-page">
    <el-card class="demo-card" shadow="hover">
      <template #header>
        <h2>📱 身份验证模块演示</h2>
      </template>

      <p>本示例演示 <code>SmsAuthDialog</code> 模块的引入与使用。</p>
      <p>点击下方按钮打开验证弹窗，输入手机号后获取验证码并验证。</p>

      <el-button type="primary" size="large" @click="showDialog = true">
        打开身份验证弹窗
      </el-button>
    </el-card>

    <!-- 引入可插拔组件 -->
    <SmsAuthDialog
        v-model="showDialog"
        @verified="handleVerified"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import SmsAuthDialog from './SmsAuthDialog.vue'

const showDialog = ref(false)

const handleVerified = (phone: string) => {
  ElMessage.success(`手机号 ${phone} 验证成功，可以访问患者数据`)
  // TODO: 这里可以调用接口获取患者信息
}
</script>

<style scoped lang="less">
.demo-page {
  padding: 40px;
  display: flex;
  justify-content: center;
}
.demo-card {
  max-width: 600px;
  width: 100%;
  text-align: center;
  line-height: 1.8;
}
</style>

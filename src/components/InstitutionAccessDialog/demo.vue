<!-- src/components/InstitutionAccessDialog/demo.vue -->
<!-- 验证码对话框组件使用示例 -->
<template>
  <div class="demo-page">
    <el-card class="demo-card" shadow="hover">
      <template #header>
        <h2>🔐 机构病历访问权限验证</h2>
      </template>

      <div class="demo-content">
        <p>本示例演示 <code>InstitutionAccessDialog</code> 组件的使用。</p>
        <p>点击下方按钮打开验证弹窗，获取验证码后输入验证。</p>
        
        <el-divider></el-divider>
        
        <div class="demo-info">
          <h3>功能说明：</h3>
          <ul>
            <li>✅ 点击"获取验证码"按钮生成6位数字验证码</li>
            <li>✅ 验证码存储在 Redis 中，有效期5分钟</li>
            <li>✅ 60秒倒计时防止重复发送</li>
            <li>✅ 支持回车键快速提交</li>
            <li>✅ 验证成功后解锁权限</li>
          </ul>
        </div>

        <el-button 
          type="primary" 
          size="large" 
          @click="showDialog = true"
          style="margin-top: 20px"
        >
          打开验证码弹窗
        </el-button>

        <el-divider></el-divider>

        <div v-if="accessGranted" class="success-info">
          <el-alert
            type="success"
            :closable="false"
            show-icon
          >
            <template #title>
              <span style="font-size: 15px; font-weight: 500;">
                ✅ 验证成功！已获得查看其他机构病历的权限
              </span>
            </template>
          </el-alert>
          
          <el-button
            type="default"
            size="small"
            @click="handleReset"
            style="margin-top: 16px"
          >
            重置状态
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 引入验证码对话框组件 -->
    <InstitutionAccessDialog
      v-model="showDialog"
      @verified="handleVerified"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import InstitutionAccessDialog from './InstitutionAccessDialog.vue';

const showDialog = ref(false);
const accessGranted = ref(false);

const handleVerified = () => {
  accessGranted.value = true;
  ElMessage.success('验证成功！已解锁其他机构病历查看权限');
  console.log('✅ 验证成功，可以访问其他机构病历');
};

const handleReset = () => {
  accessGranted.value = false;
  showDialog.value = false;
  ElMessage.info('状态已重置');
};
</script>

<style scoped lang="scss">
.demo-page {
  padding: 40px;
  display: flex;
  justify-content: center;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.demo-card {
  max-width: 700px;
  width: 100%;
}

.demo-content {
  line-height: 1.8;

  p {
    margin-bottom: 12px;
    color: #606266;
  }

  code {
    padding: 2px 8px;
    background-color: #f4f4f5;
    border-radius: 4px;
    color: #e6a23c;
    font-family: 'Courier New', monospace;
  }
}

.demo-info {
  background-color: #f0f9ff;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #409eff;

  h3 {
    margin: 0 0 12px 0;
    color: #303133;
    font-size: 16px;
  }

  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      margin-bottom: 8px;
      color: #606266;
    }
  }
}

.success-info {
  margin-top: 20px;
}
</style>


<!-- src/views/common/SmsAuthDialog/SmsAuthDialog.vue -->
<template>
  <el-dialog
      v-model="visible"
      title="身份验证"
      width="400px"
      class="sms-auth-dialog"
      :close-on-click-modal="false"
      :destroy-on-close="true"
  >
    <el-form :model="form" label-width="80px" @submit.prevent>
      <el-form-item label="手机号">
        <el-input
            v-model="form.phone"
            placeholder="请输入患者手机号"
            maxlength="11"
            clearable
        />
      </el-form-item>

      <el-form-item label="验证码">
        <div class="code-row">
          <el-input
              v-model="form.code"
              placeholder="请输入验证码"
              maxlength="6"
              clearable
          />
          <el-button
              type="primary"
              class="send-btn"
              :disabled="countdown > 0 || sending"
              @click="handleSendCode"
          >
            {{ countdown > 0 ? `${countdown}s后重试` : '发送验证码' }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="verifying" @click="handleVerify">
        确认验证
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { generateAuthCode, verifyAuthCode } from '@/api/auth/auth'

const props = defineProps<{ modelValue: boolean }>()
const emits = defineEmits(['update:modelValue', 'verified'])

const visible = ref(props.modelValue)
watch(() => props.modelValue, val => (visible.value = val))
watch(visible, val => emits('update:modelValue', val))

const form = reactive({ phone: '', code: '' })
const countdown = ref(0)
const sending = ref(false)
const verifying = ref(false)
let timer: any = null

const handleSendCode = async () => {
  if (!form.phone) return ElMessage.warning('请输入手机号')
  sending.value = true
  try {
    await generateAuthCode(form.phone)
    ElMessage.success('验证码已发送，请查收短信')
    startCountdown()
  } catch (err: any) {
    ElMessage.error(err?.message || '发送验证码失败')
  } finally {
    sending.value = false
  }
}

const startCountdown = () => {
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
}

const handleVerify = async () => {
  if (!form.phone || !form.code) return ElMessage.warning('请输入手机号和验证码')
  verifying.value = true
  try {
    await verifyAuthCode(form.phone, form.code)
    ElMessage.success('身份验证成功')
    emits('verified', form.phone)
    visible.value = false
  } catch (err: any) {
    ElMessage.error(err?.message || '验证失败，请重试')
  } finally {
    verifying.value = false
  }
}

const handleCancel = () => (visible.value = false)
</script>

<style scoped lang="less">
.sms-auth-dialog {
  .code-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .send-btn {
    white-space: nowrap;
  }
}
</style>

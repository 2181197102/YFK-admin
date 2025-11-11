<template>
  <div class="medical-record-form">
    <h2 class="form-title">病历信息提交</h2>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="error-alert">{{ errorMsg }}</div>

    <!-- 表单内容（加载完成后显示） -->
    <el-form
      v-else
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="150px"
      class="form-container"
    >
      <!-- 固定基本信息区域 -->
      <el-card shadow="hover" class="form-card">
        <template #header>
          <h3 class="card-title">基本信息（必填）</h3>
        </template>

        <el-form-item label="用户ID" prop="user_id">
          <el-input
            v-model.number="form.user_id"
            placeholder="请输入用户ID（如：1001）"
            type="number"
          />
        </el-form-item>

        <el-form-item label="患者姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入患者姓名" />
        </el-form-item>

        <el-form-item label="患者年龄" prop="age">
          <el-input
            v-model.number="form.age"
            placeholder="请输入患者年龄"
            type="number"
            min="0"
            max="120"
          />
        </el-form-item>

        <el-form-item label="患者性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择患者性别">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="身份证号" prop="id_card">
          <el-input
            v-model="form.id_card"
            placeholder="请输入18位身份证号"
            maxlength="18"
          />
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入联系电话"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item label="医生姓名" prop="doctor_name">
          <el-input v-model="form.doctor_name" placeholder="请输入医生姓名" />
        </el-form-item>

        <el-form-item label="疾病类型" prop="disease_code">
          <el-select
            v-model="form.disease_code"
            placeholder="请选择疾病类型"
            @change="handleDiseaseChange"
          >
            <el-option
              v-for="(code, index) in diseaseCodeList"
              :key="index"
              :label="`${code}（${diseaseData[code]?.length || 0}项数据）`"
              :value="code"
            />
          </el-select>
        </el-form-item>
      </el-card>

      <!-- 动态疾病数据项区域 -->
      <el-card
        v-if="selectedDiseaseData.length > 0"
        shadow="hover"
        class="form-card mt-4"
      >
        <template #header>
          <h3 class="card-title">
            疾病相关数据（{{ selectedDiseaseData.length }}项）
          </h3>
        </template>

        <el-form-item
          v-for="item in selectedDiseaseData"
          :key="item.id"
          :label="item.remark"
          :prop="item.data_code"
        >
          <el-input
            v-model="form[item.data_code]"
            :placeholder="`请输入${item.remark}（${item.data_type === 1 ? '数值型' : '文本型'}）`"
            :type="item.data_type === 1 ? 'number' : 'text'"
          />
        </el-form-item>
      </el-card>

      <!-- 提交按钮 -->
      <div class="form-footer">
        <el-button type="primary" @click="handleSubmit">提交病历</el-button>
        <el-button type="default" @click="handleReset" class="ml-2">重置表单</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { ElMessage, ElForm } from "element-plus";
import { fetchDiseaseDataCodes, submitMedicalRecord } from "@/api/doctor/doctor";
import {
  DiseaseDataItem,
  MedicalRecordForm,
} from "@/api/doctor/types";

// 表单引用
const formRef = ref<InstanceType<typeof ElForm>>();

// 状态管理
const loading = ref(true);
const errorMsg = ref("");
const diseaseData = ref<Record<string, DiseaseDataItem[]>>({}); // 所有疾病数据
const diseaseCodeList = ref<string[]>([]); // 疾病编码列表
const selectedDiseaseData = ref<DiseaseDataItem[]>([]); // 选中疾病的data_code列表

// 表单数据
const form = reactive<MedicalRecordForm>({
  user_id: 1001, // 默认值，可修改
  name: "",
  age: 0,
  gender: "男", // 默认值
  id_card: "",
  phone: "",
  doctor_name: "",
  disease_code: "",
});

// 表单校验规则
const formRules = reactive({
  user_id: [{ required: true, message: "请输入用户ID", trigger: "blur" }],
  name: [{ required: true, message: "请输入患者姓名", trigger: "blur" }],
  age: [{ required: true, message: "请输入患者年龄", trigger: "blur" }],
  gender: [{ required: true, message: "请选择患者性别", trigger: "change" }],
  id_card: [
    { required: true, message: "请输入身份证号", trigger: "blur" },
    { min: 18, max: 18, message: "身份证号必须为18位", trigger: "blur" },
  ],
  phone: [
    { required: true, message: "请输入联系电话", trigger: "blur" },
    { min: 11, max: 11, message: "手机号必须为11位", trigger: "blur" },
  ],
  doctor_name: [{ required: true, message: "请输入医生姓名", trigger: "blur" }],
  disease_code: [{ required: true, message: "请选择疾病类型", trigger: "change" }],
});

// 初始化：获取疾病数据
onMounted(async () => {
  try {
    const res = await fetchDiseaseDataCodes();
    diseaseData.value = res.data;
    diseaseCodeList.value = Object.keys(res.data); // 提取疾病编码列表
  } catch (err: any) {
    errorMsg.value = err.message || "获取疾病数据失败，请刷新重试";
  } finally {
    loading.value = false;
  }
});

// 切换疾病类型：更新动态表单字段
const handleDiseaseChange = (code: string) => {
  selectedDiseaseData.value = diseaseData.value[code] || [];
  // 重置动态字段值
  selectedDiseaseData.value.forEach((item) => {
    form[item.data_code] = "";
  });
};

// 提交表单
const handleSubmit = async () => {
  try {
    // 表单校验
    await formRef.value?.validate();
    // 提交接口
    const res = await submitMedicalRecord(form);
    if (res.code === 200) {
      ElMessage.success("病历提交成功！");
      handleReset(); // 重置表单
    } else {
      ElMessage.error(`提交失败：${res.msg}`);
    }
  } catch (err: any) {
    ElMessage.error(`提交失败：${err.message || "网络异常"}`);
  }
};

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields();
  selectedDiseaseData.value = [];
  form.disease_code = "";
  // 保留默认值
  form.user_id = 1001;
  form.gender = "男";
};
</script>

<style scoped>
.medical-record-form {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.form-title {
  text-align: center;
  margin-bottom: 30px;
  color: #1989fa;
  font-size: 24px;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

.error-alert {
  text-align: center;
  padding: 20px;
  background-color: #fef0f0;
  color: #dc3545;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-container {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.form-card {
  border-radius: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.form-footer {
  margin-top: 30px;
  text-align: center;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input,
.el-select {
  width: 100%;
  max-width: 600px;
}
</style>
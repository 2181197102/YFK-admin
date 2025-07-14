<template>
  <div class="role-list">
    <el-card shadow="never">
      <template #header>
        <span>角色列表</span>
      </template>

      <!-- 角色表格 -->
      <el-table :data="roles" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="role_code" label="角色代码" />
        <el-table-column prop="role_name" label="角色名称" />
        <el-table-column prop="description" label="说明" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default>
            <el-button type="primary" text size="small" disabled>编辑</el-button>
            <el-button type="danger" text size="small" disabled>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <!--
      <el-pagination
        class="mt-4"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="roles.length"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
      -->
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getRoleList } from '@/api/auth/auth';
import type { Role } from '@/api/auth/types';

const roles = ref<Role[]>([]);
const loading = ref(false);

// 分页
// const currentPage = ref(1);
// const pageSize = ref(10);

// const paginatedRoles = computed(() => {
//   const start = (currentPage.value - 1) * pageSize.value;
//   const end = start + pageSize.value;
//   return roles.value.slice(start, end);
// });

const fetchRoles = async () => {
  loading.value = true;
  try {
    const res = await getRoleList();
    roles.value = res.roles;
  } catch (err: any) {
    ElMessage.error(err?.message || '获取角色列表失败');
  } finally {
    loading.value = false;
  }
};

// const handlePageChange = (page: number) => {
//   currentPage.value = page;
// };

onMounted(() => {
  fetchRoles();
});
</script>

<style scoped>
.role-list {
  padding: 16px;
}
</style>

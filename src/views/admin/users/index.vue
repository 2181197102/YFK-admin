<template>
  <div class="user-list">
    <el-card shadow="never">
      <template #header>
        <span>用户列表</span>
      </template>

      <!-- 用户表格 -->
      <el-table :data="users" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <span>{{ row.gender === 'M' ? '男' : '女' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="roles" label="角色">
          <template #default="{ row }">
            <el-tag v-for="role in row.roles" :key="role.id" class="mr-1">
              {{ role.role_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="groups" label="所属机构">
          <template #default="{ row }">
            <el-tag v-for="group in row.groups" :key="group.id" class="mr-1">
              {{ group.group_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default>
            <el-button type="primary" text size="small" disabled>编辑</el-button>
            <el-button type="danger" text size="small" disabled>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          class="mt-4"
          :current-page="pagination.page"
          :page-size="pagination.per_page"
          :total="pagination.total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getUserList } from '@/api/admin/users/users';
import type { User, Pagination } from '@/api/admin/users/types';

const users = ref<User[]>([]);
const loading = ref(false);

const pagination = reactive<Pagination>({
  page: 1,
  per_page: 10,
  pages: 0,
  total: 0,
  has_next: false,
  has_prev: false,
});

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await getUserList({
      page: pagination.page,
      per_page: pagination.per_page,
    });
    // console.log("res",res);
    users.value = res.users;
    Object.assign(pagination, res.pagination);
  } catch (err: any) {
    ElMessage.error(err?.message || '获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchUsers();
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.user-list .mr-1 {
  margin-right: 4px;
}
</style>

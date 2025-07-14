<template>
  <!-- 有子菜单 -->
  <el-sub-menu :index="menu.path" v-if="hasChildren">
    <template #title>
      <!-- 显示路由 meta.icon -->
      <SvgIcon
          v-if="menu.meta?.icon"
          :name="menu.meta.icon"
          size="small"
          class="menu-icon"
      />
      <span>{{ menu.meta.title }}</span>
    </template>

    <!-- 递归渲染子节点 -->
    <SubAside
        v-for="item in menu.children"
        :key="item.path"
        :menu="item"
        :isCollapse="isCollapse"
    />
  </el-sub-menu>

  <!-- 无子菜单 -->
  <el-menu-item v-else :index="menu.path">
    <SvgIcon
        v-if="menu.meta?.icon"
        :name="menu.meta.icon"
        size="small"
        class="menu-icon"
    />
    <span>{{ menu.meta.title }}</span>
  </el-menu-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SvgIcon from '@/components/SvgIcon/index.vue'
import SubAside from './subAside.vue'

interface MenuItem {
  path: string
  meta?: {
    title?: string
    icon?: string
  }
  children?: MenuItem[]
}

const props = defineProps<{
  isCollapse: boolean
  menu: MenuItem
}>()

/* 是否存在子菜单 */
const hasChildren = computed(
    () => Array.isArray(props.menu.children) && props.menu.children.length > 0
)
</script>

<style scoped lang="scss">
.menu-icon {
  margin-right: 8px;
  vertical-align: middle;
}
</style>

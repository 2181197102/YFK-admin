<!-- 3. 简化后的页面组件 src/views/dashboard/index.vue -->
<template>
  <div class="dashboard-container">
    <!-- 图表区域 -->
    <div class="echart">
      <div id="my-echartsbar"></div>
      <div id="my-echartsline"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import echarts from '../../common/echarts'; // 路径比原来少一层

/* 柱状图 */
const initBar = (el: HTMLElement) => {
  const chart = echarts.init(el);
  chart.setOption({
    xAxis: { data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: {},
    series: [{ type: 'bar', data: [23, 24, 18, 25, 27, 28, 25] }],
  });
  window.addEventListener('resize', () => chart.resize());
};

/* 折线图 */
const initLine = (el: HTMLElement) => {
  const chart = echarts.init(el);
  chart.setOption({
    xAxis: { data: ['A', 'B', 'C', 'D', 'E'] },
    yAxis: {},
    series: [
      { type: 'line', stack: 'x', data: [10, 22, 28, 43, 49] },
      { type: 'line', stack: 'x', data: [5, 4, 3, 5, 10] },
    ],
  });
  window.addEventListener('resize', () => chart.resize());
};

onMounted(() => {
  const bar = document.getElementById('my-echartsbar') as HTMLElement | null;
  const line = document.getElementById('my-echartsline') as HTMLElement | null;
  if (bar) initBar(bar);
  if (line) initLine(line);
});
</script>

<style lang="less" scoped>
.dashboard-container {
  height: 100%;
}

.echart {
  #my-echartsbar,
  #my-echartsline {
    height: 300px;
  }
}
</style>
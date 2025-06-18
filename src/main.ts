// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import piniaStore from './store';

import '@/styles/index.less';
import '@/styles/reset.less';

// 支持SVG
import 'virtual:svg-icons-register';
import '@arco-design/web-vue/dist/arco.css';

import 'virtual:uno.css';

// DevUI
import 'vue-devui/style.css';
import '@devui-design/icons/icomoon/devui-icon.css';
import 'element-plus/dist/index.css'

import { ThemeServiceInit, devuiDarkTheme } from 'devui-theme';

const themeService = ThemeServiceInit({ devuiDarkTheme }, 'infinityTheme');
themeService?.applyTheme(devuiDarkTheme);

// 创建Vue应用实例
const app = createApp(App);

// 注册插件
app.use(piniaStore);
app.use(router);

// 挂载应用
app.mount('#app');
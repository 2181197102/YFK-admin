# 后端端口号配置更新完成

## 🎯 更新目标

根据用户反馈，后端端口号是7878，需要更新前端配置以匹配正确的后端端口。

## 🔧 配置更新

### 1. **API目标URL更新**

#### 修改前
```typescript
// build/constant.ts
export const API_TARGET_URL = 'http://127.0.0.1:5000';
```

#### 修改后
```typescript
// build/constant.ts
export const API_TARGET_URL = 'http://127.0.0.1:7878';
```

**更新说明：**
- 将API目标URL从5000端口更新为7878端口
- 确保前端请求能正确代理到后端服务

### 2. **代理配置确认**

#### 代理配置
```typescript
// build/vite/proxy.ts
const init: ProxyTargetList = {
  [API_BASE_URL]: {
    target: API_TARGET_URL,  // 现在指向 http://127.0.0.1:7878
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${API_BASE_URL}`), ''),
  },
};
```

**配置说明：**
- 代理配置使用`API_TARGET_URL`变量
- 所有以`/api`开头的请求都会被代理到`http://127.0.0.1:7878`
- `changeOrigin: true`确保请求头正确设置

### 3. **API调用路径确认**

#### 数据脱敏相关API
```typescript
// src/api/researchers/researchers.ts

// 启动脱敏任务
export const processDataMasking = async (params: DataMaskingRequest) => {
  const response = await api.post('/api/datamasking/start', requestData);
  return response.data;
};

// 获取任务详情
export const getMaskingTaskDetail = async (taskId: number) => {
  const response = await api.get(`/api/datamasking/tasks/${taskId}`);
  return response.data;
};

// 下载脱敏文件
export const downloadMaskedFile = async (taskId: number) => {
  const response = await api.get(`/api/datamasking/tasks/${taskId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};
```

**路径说明：**
- 使用相对路径（如`/api/datamasking/start`）
- 通过Vite代理转发到后端7878端口
- 无需修改API调用代码，只需更新代理目标

## 🔄 请求流程

### 1. **前端请求流程**
```
前端组件 → API调用(/api/datamasking/start) → Vite代理 → 后端(127.0.0.1:7878)
```

### 2. **代理重写规则**
```
/api/datamasking/start → http://127.0.0.1:7878/datamasking/start
/api/datamasking/tasks/123 → http://127.0.0.1:7878/datamasking/tasks/123
```

## ✅ 更新结果

1. ✅ **端口号正确**: API_TARGET_URL已更新为7878端口
2. ✅ **代理配置**: Vite代理会自动将请求转发到正确的后端端口
3. ✅ **API调用**: 无需修改API调用代码，使用相对路径即可
4. ✅ **请求流程**: 前端请求现在会正确代理到后端7878端口

## 🚀 验证方法

### 1. **启动后端服务**
确保后端服务运行在7878端口：
```bash
# 后端服务应该监听在 127.0.0.1:7878
```

### 2. **启动前端服务**
```bash
npm run dev
# 或
yarn dev
```

### 3. **测试API调用**
- 访问脱敏页面
- 选择应用场景和脱敏方法
- 点击"开始脱敏处理"
- 检查网络请求是否发送到正确的端口

现在前端配置已经更新为正确的后端端口7878，所有API请求都会正确代理到后端服务！


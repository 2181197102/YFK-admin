# YFK项目前后端衔接分析

## 🏗 项目架构概览

### 前端项目：YFK-admin
- **技术栈**：Vue3 + TypeScript + Element Plus + Vite
- **路径**：`E:\YFK\YFK-admin`
- **端口**：3000

### 后端项目：YFK-master  
- **技术栈**：Flask + SQLAlchemy + JWT + MySQL
- **路径**：`E:\YFK\YFK-master`
- **端口**：7878

## 🔗 前后端衔接方式

### 1. 代理配置

#### 前端代理设置 (`build/vite/proxy.ts`)
```typescript
const init: ProxyTargetList = {
  // API代理
  [API_BASE_URL]: {
    target: API_TARGET_URL,  // http://localhost:3000
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${API_BASE_URL}`), ''),
  },
  // Mock代理
  [MOCK_API_BASE_URL]: {
    target: MOCK_API_TARGET_URL,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${MOCK_API_BASE_URL}`), '/api'),
  },
};
```

#### 常量配置 (`build/constant.ts`)
```typescript
export const API_PREFIX = '/api';
export const API_BASE_URL = '/api';
export const API_TARGET_URL = 'http://localhost:3000';  // ❌ 这里有问题！
```

**⚠️ 问题发现**：前端代理配置中的`API_TARGET_URL`设置为`http://localhost:3000`，这会导致前端请求自己，而不是后端！

### 2. 后端CORS配置

#### Flask CORS设置 (`config.py`)
```python
CORS_ORIGINS = [
    'http://localhost:3000',      # 前端地址
    'https://localhost:3000',
    'http://127.0.0.1:3000',
    'https://127.0.0.1:3000'
]
```

#### Flask应用初始化 (`app.py`)
```python
CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
```

### 3. API接口映射

#### 后端路由结构
```python
# 主要蓝图注册
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_mgmt_bp, url_prefix='/api/user_management')
app.register_blueprint(data_mgmt_bp, url_prefix='/api/data_management')
app.register_blueprint(audit_bp, url_prefix='/api/audit')
app.register_blueprint(sys_cfg_bp, url_prefix='/api/system_config')
app.register_blueprint(medical_record_bp, url_prefix='/api/medical_record')
app.register_blueprint(whitelist_bp, url_prefix='/api/whitelist')
```

#### 前端API调用
```typescript
// 研究人员相关API
const api = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

// 实际调用的接口
export const getDiseaseDataCodes = async (): Promise<DiseaseDataCodeResponse> => {
  const response = await api.get<DiseaseDataCodeResponse>(
    'http://127.0.0.1:7878/api/medical_record/disease-data-codes'
  );
  return response.data;
};
```

## 🚨 发现的问题

### 1. 代理配置错误
**问题**：前端代理配置中的`API_TARGET_URL`设置为`http://localhost:3000`，应该设置为后端地址。

**修复方案**：
```typescript
// build/constant.ts
export const API_TARGET_URL = 'http://127.0.0.1:7878';  // 后端地址
```

### 2. API调用不一致
**问题**：前端API调用中直接使用`http://127.0.0.1:7878`，没有使用代理。

**修复方案**：
```typescript
// 使用代理路径而不是直接地址
export const getDiseaseDataCodes = async (): Promise<DiseaseDataCodeResponse> => {
  const response = await api.get<DiseaseDataCodeResponse>(
    '/api/medical_record/disease-data-codes'  // 使用代理路径
  );
  return response.data;
};
```

## 🔧 正确的衔接方式

### 1. 修复代理配置
```typescript
// build/constant.ts
export const API_TARGET_URL = 'http://127.0.0.1:7878';  // 后端地址
```

### 2. 统一API调用方式
```typescript
// 所有API调用都使用相对路径，通过代理转发
const response = await api.get('/api/medical_record/disease-data-codes');
```

### 3. 启动顺序
1. **启动后端**：`python app.py` (端口7878)
2. **启动前端**：`npm run dev` (端口3000)
3. **访问前端**：`http://localhost:3000`

## 📋 数据脱敏功能衔接

### 脱敏服务集成
- **Flask脱敏服务**：`E:\datamasking\flaskweb` (端口5000)
- **YFK后端服务**：`E:\YFK\YFK-master` (端口7878)
- **前端服务**：`E:\YFK\YFK-admin` (端口3000)

### 数据流程
1. **信任值计算**：前端 → YFK后端 (7878)
2. **数据脱敏**：前端 → Flask脱敏服务 (5000)
3. **数据查询**：前端 → YFK后端 (7878)

## 🛠 建议的修复步骤

1. **修复代理配置**：
   ```typescript
   // build/constant.ts
   export const API_TARGET_URL = 'http://127.0.0.1:7878';
   ```

2. **统一API调用**：
   ```typescript
   // 所有API调用使用相对路径
   const response = await api.get('/api/medical_record/disease-data-codes');
   ```

3. **添加环境变量**：
   ```bash
   # .env.development
   VITE_API_BASE_URL=http://127.0.0.1:7878
   ```

4. **测试连接**：
   - 后端健康检查：`http://127.0.0.1:7878/health`
   - 前端代理测试：`http://localhost:3000/api/health`

这样修复后，前后端就能正确衔接了！

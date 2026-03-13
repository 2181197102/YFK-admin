# 脱敏方法改为单选框完成

## ✨ 主要改进

### 1. **组件类型变更**
- **从**: `el-checkbox-group` + `el-checkbox`
- **到**: `el-radio-group` + `el-radio`
- **效果**: 用户只能选择一个脱敏方法

### 2. **数据结构调整**
```typescript
// 修改前
method: string[]  // 数组，支持多选

// 修改后  
method: string     // 字符串，单选
```

### 3. **表单验证更新**
```typescript
// 修改前
configForm.method.length > 0

// 修改后
configForm.method !== ''
```

## 🎯 功能特性

### 单选行为
- **互斥选择**: 选择新方法时自动取消之前的选择
- **必选验证**: 必须选择一个脱敏方法才能提交
- **默认状态**: 初始状态为空，需要用户主动选择

### 视觉一致性
- **保持样式**: 单选框使用与复选框相同的卡片样式
- **选中效果**: 相同的渐变背景和边框效果
- **悬停动画**: 相同的悬停和选中动画

## 🔧 技术实现

### HTML结构
```vue
<el-radio-group v-model="configForm.method" class="method-grid">
  <el-radio 
    v-for="method in methodOptions" 
    :key="method.value" 
    :label="method.value"
    :class="['method-item', { 'smart-choice': method.value === '智能选择' }]"
  >
    <!-- 卡片内容 -->
  </el-radio>
</el-radio-group>
```

### CSS样式
```css
/* 单选框样式 */
:deep(.el-radio__input) {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
}

:deep(.el-radio__label) {
  width: 100%;
  padding: 20px;
  padding-right: 50px;
  min-height: 120px;
  display: flex;
  align-items: center;
}
```

### 数据处理
```typescript
// 处理脱敏时直接使用字符串值
const requestData: DataMaskingRequest = {
  selected_headers: configForm.selected_headers,
  record_count: configForm.record_count,
  scenario: configForm.scenario[0] as DataMaskingScenario,
  method: configForm.method as DataMaskingMethod  // 直接使用字符串
};
```

## 🎨 用户体验

### 1. **选择逻辑**
- **单选限制**: 确保用户只能选择一种脱敏方法
- **清晰反馈**: 选中状态明确，避免混淆
- **智能选择**: 智能选择选项仍然有特殊样式

### 2. **视觉反馈**
- **选中状态**: 蓝色边框 + 渐变背景
- **悬停效果**: 边框变色 + 阴影增强
- **智能选择**: 紫色渐变图标背景

### 3. **交互体验**
- **点击选择**: 点击卡片任意位置即可选择
- **自动取消**: 选择新方法时自动取消之前的选择
- **表单验证**: 未选择时显示验证错误

## 📱 响应式支持

- **桌面端**: 2列布局，完整卡片样式
- **平板端**: 单列布局，保持间距
- **手机端**: 单列布局，紧凑尺寸

## 🚀 优势

### 1. **逻辑清晰**
- 脱敏方法互斥，避免冲突
- 用户选择更明确
- 减少配置错误

### 2. **界面一致**
- 保持原有的美观设计
- 相同的交互体验
- 统一的视觉语言

### 3. **功能完整**
- 支持所有脱敏方法
- 智能选择特殊处理
- 完整的表单验证

现在脱敏方法改为单选框，用户只能选择一个脱敏方法，逻辑更加清晰明确！



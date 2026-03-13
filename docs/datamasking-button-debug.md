# 数据脱敏按钮无法点击问题诊断

## 🔍 问题分析

"开始脱敏处理"按钮被禁用的条件是：
```typescript
:disabled="!isFormValid || processing"
```

### 表单验证条件
`isFormValid` 需要满足以下所有条件：
1. ✅ `selected_headers.length > 0` - 至少选择一个字段
2. ✅ `record_count > 0` - 记录数大于0  
3. ❌ `scenario.length > 0` - 至少选择一个应用场景
4. ❌ `method !== ''` - 选择脱敏方法

## 🐛 可能的原因

### 1. **应用场景未选择**
- 用户需要至少选择一个应用场景（决策、展示、分析、预测）
- 当前 `configForm.scenario` 为空数组

### 2. **脱敏方法未选择**
- 用户需要选择一个脱敏方法
- 当前 `configForm.method` 为空字符串

### 3. **查询参数未正确传递**
- 从信任值计算页面跳转时，`maskingParams` 参数可能未正确传递
- 导致 `queryInfo` 和 `configForm.selected_headers` 为空

## 🔧 调试功能

### 添加了调试按钮
- 点击"调试表单"按钮可以查看当前表单状态
- 控制台会输出详细的调试信息

### 调试信息包括
```typescript
console.log('=== 调试表单状态 ===');
console.log('queryInfo:', queryInfo.value);
console.log('configForm:', configForm);
console.log('isFormValid:', isFormValid.value);
console.log('processing:', processing.value);
console.log('currentStep:', currentStep.value);
```

## 🚀 解决步骤

### 1. **检查控制台输出**
- 打开浏览器开发者工具
- 查看控制台中的调试信息
- 确认哪些验证条件未满足

### 2. **检查路由参数**
- 确认从信任值计算页面跳转时是否正确传递了 `maskingParams`
- 检查 `queryParams.data_code` 是否有值

### 3. **手动选择选项**
- 确保至少选择一个应用场景
- 确保选择一个脱敏方法
- 检查字段选择是否正确

## 📋 常见问题

### 问题1: 查询参数为空
```typescript
// 检查路由参数
const maskingParams = route.query.maskingParams;
if (!maskingParams) {
  console.warn('未找到maskingParams参数');
  // 需要从信任值计算页面重新进入
}
```

### 问题2: 字段选择为空
```typescript
// 检查字段选择
configForm.selected_headers = queryParams.data_code || [];
if (configForm.selected_headers.length === 0) {
  console.warn('没有可选择的字段');
}
```

### 问题3: 用户未选择选项
- 应用场景和脱敏方法需要用户手动选择
- 这些选项不会自动填充

## 🎯 快速修复

如果确认是用户未选择选项导致的问题，可以临时修改验证逻辑：

```typescript
// 临时放宽验证条件（仅用于测试）
const isFormValid = computed(() => {
  return configForm.selected_headers.length > 0 && 
         configForm.record_count > 0;
  // 暂时注释掉场景和方法验证
  // configForm.scenario.length > 0 &&
  // configForm.method !== '';
});
```

## 📝 下一步

1. **使用调试按钮**: 点击"调试表单"查看具体状态
2. **检查控制台**: 查看详细的调试信息
3. **确认问题**: 根据调试信息确定具体原因
4. **修复问题**: 根据问题类型进行相应修复

现在请点击"调试表单"按钮，查看控制台输出，然后告诉我具体的调试信息！



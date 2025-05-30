# LightweightCharts 单元测试

## 📋 测试概述

本目录包含了 LightweightCharts 多图表系统的完整单元测试套件，按类分别组织测试文件。

## 🗂️ 测试文件结构

```
tests/
├── ChartConfig.test.js        # 图表配置类测试
├── ChartUtils.test.js         # 工具类测试
├── EventEmitter.test.js       # 事件发射器测试
├── SharedTimeScale.test.js    # 共享时间刻度测试
├── package.json              # 测试依赖配置
├── jest.setup.js             # Jest 环境设置
└── README.md                # 测试说明文档
```

## 🚀 运行测试

### 安装依赖
```bash
cd tests
npm install
```

### 运行所有测试
```bash
npm test
```

### 运行特定测试文件
```bash
npm test ChartConfig.test.js
npm test SharedTimeScale.test.js
```

### 监视模式运行测试
```bash
npm run test:watch
```

### 生成覆盖率报告
```bash
npm run test:coverage
```

### 详细输出模式
```bash
npm run test:verbose
```

## 📊 测试覆盖范围

### ChartConfig 测试
- ✅ 默认配置验证
- ✅ 图表类型配置
- ✅ 配置合并逻辑
- ✅ 时间刻度配置

### ChartUtils 测试
- ✅ 防抖和节流函数
- ✅ 时间转换工具
- ✅ 数据验证和过滤
- ✅ ID生成器
- ✅ 成交量数据处理

### EventEmitter 测试
- ✅ 事件监听和发射
- ✅ 一次性事件监听
- ✅ 事件移除
- ✅ 错误处理

### SharedTimeScale 测试
- ✅ 图表注册和注销
- ✅ 主图监听器设置
- ✅ 时间轴同步机制
- ✅ 强制同步功能
- ✅ 错误处理和边界情况

## 🔧 测试配置

### Jest 配置特点
- **ES模块支持**: 使用现代JavaScript模块语法
- **JSDOM环境**: 模拟浏览器DOM环境
- **自动Mock**: 预配置LightweightCharts库Mock
- **覆盖率报告**: 支持多种格式的覆盖率报告

### Mock 对象
- **LightweightCharts**: 完整的图表库Mock
- **DOM API**: 浏览器DOM接口Mock
- **Fetch API**: 网络请求Mock
- **Console**: 控制台输出Mock

## 📈 测试用例示例

### 基础功能测试
```javascript
describe('ChartConfig', () => {
    it('should have correct default options', () => {
        expect(ChartConfig.DEFAULT_OPTIONS.width).toBe(1000);
        expect(ChartConfig.DEFAULT_OPTIONS.height).toBe(400);
    });
});
```

### 异步操作测试
```javascript
describe('SharedTimeScale', () => {
    it('should sync all secondary charts', () => {
        sharedTimeScale.syncAllCharts();
        expect(secondaryTimeScale.setVisibleRange).toHaveBeenCalled();
    });
});
```

### 错误处理测试
```javascript
describe('EventEmitter', () => {
    it('should handle errors in listeners gracefully', () => {
        const errorCallback = jest.fn(() => { throw new Error('Test error'); });
        emitter.on('test', errorCallback);
        expect(() => emitter.emit('test')).not.toThrow();
    });
});
```

## 🎯 测试最佳实践

### 1. 测试命名
- 使用描述性的测试名称
- 采用 `should + 预期行为` 的格式

### 2. 测试组织
- 按功能模块分组测试
- 使用 `describe` 嵌套组织测试结构

### 3. Mock 使用
- 合理使用Mock避免外部依赖
- 在 `beforeEach` 中重置Mock状态

### 4. 断言明确
- 使用具体的断言方法
- 测试边界情况和错误场景

## 🐛 调试测试

### 查看详细输出
```bash
npm run test:verbose
```

### 单独运行失败的测试
```bash
npm test -- --testNamePattern="specific test name"
```

### 启用Jest调试
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📝 添加新测试

### 1. 创建测试文件
```javascript
// tests/NewClass.test.js
import { describe, it, expect } from '@jest/globals';
import { NewClass } from '../static/lightweight-charts.js';

describe('NewClass', () => {
    // 测试用例
});
```

### 2. 更新覆盖率配置
在 `package.json` 中的 `collectCoverageFrom` 数组中添加新文件路径。

### 3. 运行测试验证
```bash
npm test NewClass.test.js
```

## 🔍 持续集成

这些测试可以轻松集成到CI/CD流水线中：

```yaml
# GitHub Actions 示例
- name: Run Tests
  run: |
    cd tests
    npm install
    npm run test:coverage
```

## 📚 相关资源

- [Jest 官方文档](https://jestjs.io/docs/getting-started)
- [LightweightCharts 文档](https://tradingview.github.io/lightweight-charts/)
- [设计文档](../docs/LightweightCharts-Design-Document.md) 
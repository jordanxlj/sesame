# LightweightCharts 测试系统

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

### 已完成的测试文件

1. **ChartConfig.test.js** (12个测试)
   - 默认配置验证
   - 颜色方案配置
   - 图表类型常量

2. **ChartUtils.test.js** (23个测试)
   - 时间转换函数
   - 数据处理工具
   - 成交量格式化

3. **EventEmitter.test.js** (17个测试)
   - 事件监听和触发
   - 一次性事件处理
   - 事件清理机制

4. **SharedTimeScale.test.js** (23个测试)
   - 图表注册和管理
   - 时间范围同步
   - 主从图表关系

5. **BaseChart.test.js** (46个测试)
   - 基础图表功能
   - 系列管理
   - 错误处理机制

6. **MainChart.test.js** (70+个测试)
   - 主图表完整功能
   - 数据加载和处理
   - 归一化系统
   - 子图表管理
   - 时间轴同步
   - 高级方法测试

## MainChart 高级方法测试覆盖

### 归一化相关方法
- ✅ `applyNormalization()` - 价格数据归一化应用
- ✅ `applyIndicatorNormalization()` - 指标数据归一化
- ✅ `enableNormalization()` - 启用归一化（包括边界情况）
- ✅ `disableNormalization()` - 禁用归一化
- ✅ `shouldEnableNormalization()` - 归一化条件判断

### 时间轴管理方法
- ✅ `adjustTimeRangeToVisibleStocks()` - 调整时间范围到可见股票
- ✅ `syncTimeRangeToVolumeChart()` - 同步时间范围到成交量图
- ✅ `forceTimeAxisAlignment()` - 强制时间轴对齐
- ✅ `verifyTimeAxisAlignment()` - 验证时间轴对齐

### 逻辑范围修复方法
- ✅ `fixNegativeLogicalRangeImmediate()` - 立即修复负数逻辑范围
- ✅ `checkAndFixNegativeLogicalRange()` - 检查并修复负数逻辑范围

### 异常和边界情况测试

#### 已覆盖的异常情况
- ✅ 空数据数组处理
- ✅ 无效 OHLC 数据过滤（NaN、null、空值）
- ✅ 缺失股票信息处理
- ✅ 网络错误处理
- ✅ 服务器错误响应处理
- ✅ 无效 JSON 响应处理
- ✅ 归一化时缺失 close 字段
- ✅ NaN 或无穷大的归一化比例
- ✅ 时间轴同步失败
- ✅ 对齐失败或子图不存在
- ✅ 无效时间数据处理
- ✅ 图表不存在时的方法调用
- ✅ 成交量图不存在时的同步操作

#### 特殊测试场景
- ✅ 所有股票隐藏时的时间范围调整
- ✅ 无效索引的股票可见性切换
- ✅ 子图销毁时容器不存在的情况
- ✅ 逻辑范围为正数时的修复跳过
- ✅ 时间轴对齐验证（对齐和不对齐情况）

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
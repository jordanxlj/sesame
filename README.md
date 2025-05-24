# 股票指标可视化系统

基于 Flask + LightWeight Charts 的股票技术分析可视化工具，支持多种技术指标和实时K线数据展示。

## 🚀 功能特性

### 📊 图表功能
- **K线图表**：支持蜡烛图显示，包含开盘价、最高价、最低价、收盘价
- **成交量图表**：底部独立显示成交量柱状图
- **实时信息栏**：鼠标悬停显示详细OHLC数据和涨跌幅
- **多股票叠加**：支持同时显示多只股票的K线数据

### 📈 技术指标
- **SuperTrend 指标**：
  - 趋势线显示（绿色上涨趋势，红色下跌趋势）
  - 买卖信号标记（绿色向上箭头买入，红色向下箭头卖出）
- **移动平均线**：
  - MA5（5日移动平均线）- 蓝色
  - MA10（10日移动平均线）- 橙色

### 🎯 交互功能
- **股票搜索**：支持代码/名称模糊搜索
- **指标切换**：可选择性开启/关闭各种技术指标
- **实时更新**：鼠标移动实时显示对应时间点的数据

## 🛠️ 技术栈

- **后端**：Flask (Python)
- **前端**：LightWeight Charts + jQuery + Select2
- **数据处理**：Pandas, NumPy
- **技术指标计算**：自定义算法实现

## 📦 安装部署

### 环境要求
- Python 3.7+
- pip

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd sesame
```

2. **安装依赖**
```bash
# 方法1：使用 requirements.txt（推荐）
pip install -r requirements.txt

# 方法2：手动安装
pip install flask pandas numpy
```

3. **启动服务**
```bash
python app.py
```

4. **访问应用**
```
http://localhost:5000
```

### 数据准备

项目需要CSV格式的股票数据文件，放置在 `indicator/` 目录下：

**文件命名规则：**
- `<股票代码>.csv`（如：`HK.09660.csv`）
- `<股票代码>_daily.csv`（如：`HK_09660_daily.csv`）

**CSV文件格式：**
```csv
time_key,open_price,high_price,low_price,close_price,volume
2025-01-01,100.0,105.0,98.0,103.0,1000000
2025-01-02,103.0,108.0,101.0,106.0,1200000
```

**支持的列名：**
- 时间：`time_key` 或 `time`
- 价格：`open_price`/`open`, `high_price`/`high`, `low_price`/`low`, `close_price`/`close`
- 成交量：`volume`

## 📁 项目结构

```
sesame/
├── app.py                          # Flask 主应用
├── requirements.txt                # Python 依赖包列表
├── indicator/
│   └── tech_analysis_web.py        # 技术指标计算模块
├── templates/
│   └── index.html                  # 前端页面
├── static/
│   └── lightweight-charts.standalone.production.js  # 图表库
├── mmar/                           # 数据处理模块
├── server/                         # 服务器相关
├── client/                         # 客户端相关
├── config/                         # 配置文件
└── README.md                       # 项目说明
```

## 🔧 API 接口

### 获取K线数据
```
GET /api/kline?code=<股票代码>
```

**响应格式：**
```json
[
  {
    "time": "2025-01-01",
    "open": 100.0,
    "high": 105.0,
    "low": 98.0,
    "close": 103.0,
    "volume": 1000000
  }
]
```

### 获取技术指标
```
GET /api/indicator?code=<股票代码>&type=<指标类型>
```

**支持的指标类型：**
- `supertrend`：SuperTrend指标
- `ma5`：5日移动平均线
- `ma10`：10日移动平均线

## 🎮 使用说明

### 基本操作

1. **选择股票**：
   - 点击股票代码下拉框
   - 输入股票代码或名称进行搜索
   - 支持多选（可同时查看多只股票）

2. **选择指标**：
   - 勾选需要显示的技术指标
   - SuperTrend：显示趋势线和买卖信号
   - MA5/MA10：显示移动平均线

3. **查看数据**：
   - 点击"查询"按钮加载图表
   - 鼠标悬停在K线上查看详细信息
   - 信息栏显示：开盘价、最高价、最低价、收盘价、涨跌额、涨跌幅

### 图表说明

- **K线颜色**：绿色（上涨）、红色（下跌）
- **SuperTrend线**：绿色（看涨）、红色（看跌）
- **买卖信号**：
  - 🔺 绿色向上箭头：买入信号
  - 🔻 红色向下箭头：卖出信号
- **成交量**：底部柱状图，颜色与K线对应

## 🔍 SuperTrend 指标说明

SuperTrend 是一个趋势跟踪指标，基于平均真实波幅（ATR）计算：

- **计算方法**：
  - 基础线 = (最高价 + 最低价) / 2
  - 上轨 = 基础线 + (倍数 × ATR)
  - 下轨 = 基础线 - (倍数 × ATR)

- **信号解读**：
  - 价格突破上轨：买入信号
  - 价格跌破下轨：卖出信号
  - 趋势线颜色变化：趋势转换信号

## 🚧 开发计划

- [ ] 添加更多技术指标（MACD、RSI、布林带等）
- [ ] 支持更多时间周期（分钟、小时、周、月）
- [ ] 添加股票基本面数据
- [ ] 实现数据导出功能
- [ ] 添加自定义指标参数设置
- [ ] 支持实时数据推送

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件: jordanxlj@vip.sina.com
- 微信群讨论

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！

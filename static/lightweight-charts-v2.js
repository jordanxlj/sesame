/**
 * LightWeight Charts - Refactored Version 2.1.0
 * 重构版本：核心BaseChart和配置系统
 */

// ================================
// Core Configuration and Constants
// ================================
const ChartConfig = {
    // 默认图表配置
    DEFAULT_OPTIONS: {
        width: 1000,
        height: 400,
        rightPriceScale: { 
            visible: true,
            borderVisible: true,
            scaleMargins: { top: 0.1, bottom: 0.1 },
            mode: 0, // Normal mode
            autoScale: true,
            alignLabels: true,
            borderColor: '#e0e0e0',
            textColor: '#333333',
            minimumWidth: 80
        },
        leftPriceScale: { visible: false },
        timeScale: { 
            visible: true,
            timeVisible: true,
            secondsVisible: false,
            borderVisible: true,
            rightOffset: 12,
            barSpacing: 6,
            fixLeftEdge: false,
            fixRightEdge: false,
            lockVisibleTimeRangeOnResize: true,
            shiftVisibleRangeOnNewBar: false,
            borderColor: '#e0e0e0',
            rightBarStaysOnScroll: true
        },
        layout: {
            backgroundColor: 'transparent',
            textColor: '#333'
        },
        grid: {
            vertLines: { color: '#e1e1e1' },
            horzLines: { color: '#e1e1e1' }
        },
        crosshair: {
            mode: 1, // Normal crosshair mode
            vertLine: {
                width: 1,
                color: '#758696',
                style: 0
            },
            horzLine: {
                width: 1,
                color: '#758696',
                style: 0
            }
        }
    },
    
    // 主图配置
    MAIN_CHART: {
        height: 400,
        chartType: 'main',
        timeScale: {
            visible: true,
            timeVisible: true,
            secondsVisible: false,
            borderVisible: true,
            rightOffset: 12,
            barSpacing: 6,
            fixLeftEdge: false,
            fixRightEdge: false,
            lockVisibleTimeRangeOnResize: true,
            autoFitContent: true
        },
        priceScale: {
            scaleMargins: { top: 0.05, bottom: 0.35 }, // 主图占顶部65%
            alignLabels: true,
            borderVisible: true,
            autoScale: true
        }
    },
    
    // 成交量图配置
    VOLUME_CHART: {
        height: 120,
        chartType: 'volume',
        timeScale: {
            visible: false,
            timeVisible: false,
            secondsVisible: false,
            borderVisible: false,
            rightOffset: 12,
            barSpacing: 6,
            fixLeftEdge: false,
            fixRightEdge: false,
            lockVisibleTimeRangeOnResize: true
        },
        priceScale: {
            scaleMargins: { top: 0.65, bottom: 0.2 }, // 成交量占中间15%
            alignLabels: true,
            borderVisible: true,
            autoScale: true,
            borderColor: '#D0D0D0'
        }
    },
    
    // 指标图配置
    INDICATOR_CHART: {
        height: 150,
        chartType: 'indicator',
        timeScale: {
            visible: true,
            timeVisible: true,
            secondsVisible: false,
            borderVisible: true,
            rightOffset: 12,
            barSpacing: 6,
            fixLeftEdge: false,
            fixRightEdge: false,
            lockVisibleTimeRangeOnResize: true
        },
        priceScale: {
            scaleMargins: { top: 0.8, bottom: 0.0 }, // 指标占底部20%
            alignLabels: true,
            borderVisible: true,
            autoScale: true,
            borderColor: '#D0D0D0'
        }
    },
    
    // 颜色主题
    COLORS: {
        UP: '#26a69a',
        DOWN: '#ef5350',
        VOLUME: '#26a69a',
        MA5: '#ff9800',
        MA10: '#9c27b0',
        ZERO_LINE: '#666666',
        
        // 多股票颜色方案
        MULTI_STOCK: [
            {
                name: '主股票',
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderUpColor: '#26a69a',
                borderDownColor: '#ef5350',
                wickUpColor: '#26a69a',
                wickDownColor: '#ef5350',
                opacity: 1.0
            },
            {
                name: '对比股票1',
                upColor: '#2196f3',
                downColor: '#9c27b0',
                borderUpColor: '#1976d2',
                borderDownColor: '#7b1fa2',
                wickUpColor: '#1976d2',
                wickDownColor: '#7b1fa2',
                opacity: 0.8
            },
            {
                name: '对比股票2',
                upColor: '#ff9800',
                downColor: '#f44336',
                borderUpColor: '#f57c00',
                borderDownColor: '#d32f2f',
                wickUpColor: '#f57c00',
                wickDownColor: '#d32f2f',
                opacity: 0.7
            }
        ],
        
        // Squeeze指标颜色
        SQUEEZE: {
            LIME: '#00ff00',
            GREEN: '#008000',
            RED: '#ff0000',
            MAROON: '#800000',
            BLACK: '#000000',
            GRAY: '#808080',
            BLUE: '#0000ff'
        },
        
        // 买卖信号颜色
        SIGNALS: {
            BUY: '#00ff00',
            SELL: '#ff0000',
            BUY_ALT: '#32cd32',
            SELL_ALT: '#dc143c'
        }
    },
    
    // 同步配置
    SYNC: {
        THROTTLE_DELAY: 150,
        DEBOUNCE_DELAY: 30,
        TIME_DIFF_THRESHOLD: 1800, // 30分钟
        ZOOM_THRESHOLD: {
            IN: 0.95,
            OUT: 1.05
        }
    },
    
    // 验证配置完整性
    validate() {
        const requiredFields = ['DEFAULT_OPTIONS', 'MAIN_CHART', 'VOLUME_CHART', 'INDICATOR_CHART', 'COLORS'];
        const isValid = requiredFields.every(field => this[field]);
        if (!isValid) {
            console.error('ChartConfig validation failed: missing required fields');
        }
        return isValid;
    },
    
    // 获取特定图表类型的完整配置
    getChartConfig(chartType) {
        const baseConfig = { ...this.DEFAULT_OPTIONS };
        const typeConfig = this[`${chartType.toUpperCase()}_CHART`] || {};
        
        return {
            ...baseConfig,
            height: typeConfig.height || baseConfig.height,
            timeScale: { ...baseConfig.timeScale, ...typeConfig.timeScale },
            rightPriceScale: { ...baseConfig.rightPriceScale, ...typeConfig.priceScale }
        };
    }
};

// ================================
// Utility Functions
// ================================
const ChartUtils = {
    /**
     * 防抖函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * 节流函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * 时间转换为数字
     */
    convertTimeToNumber(time) {
        if (typeof time === 'number') return time;
        if (typeof time === 'string') {
            const date = new Date(time);
            return isNaN(date.getTime()) ? NaN : date.getTime() / 1000;
        }
        if (time instanceof Date) {
            return time.getTime() / 1000;
        }
        return NaN;
    },
    
    /**
     * 计算时间差
     */
    calculateTimeDiff(range1, range2) {
        const from1 = this.convertTimeToNumber(range1.from);
        const to1 = this.convertTimeToNumber(range1.to);
        const from2 = this.convertTimeToNumber(range2.from);
        const to2 = this.convertTimeToNumber(range2.to);
        
        if (isNaN(from1) || isNaN(to1) || isNaN(from2) || isNaN(to2)) {
            return Infinity;
        }
        
        return Math.abs(from1 - from2) + Math.abs(to1 - to2);
    },
    
    /**
     * 过滤有效数据
     */
    filterValidData(data) {
        if (!Array.isArray(data)) {
            console.warn('filterValidData: 输入不是数组', typeof data);
            return [];
        }
        
        return data.filter(item => {
            if (!item || typeof item !== 'object') return false;
            
            // 检查必需字段
            const hasTime = item.time !== undefined && item.time !== null;
            const hasOHLC = item.open !== undefined && item.high !== undefined && 
                           item.low !== undefined && item.close !== undefined;
            
            if (!hasTime) return false;
            
            // 对于OHLC数据，检查价格字段
            if (hasOHLC) {
                const prices = [item.open, item.high, item.low, item.close];
                return prices.every(price => typeof price === 'number' && !isNaN(price) && price > 0);
            }
            
            // 对于其他类型的数据（如成交量、指标），检查value字段
            if (item.value !== undefined) {
                return typeof item.value === 'number' && !isNaN(item.value);
            }
            
            return true;
        });
    },
    
    /**
     * 验证时间范围
     */
    isValidTimeRange(timeRange) {
        if (!timeRange || typeof timeRange !== 'object') return false;
        
        const from = this.convertTimeToNumber(timeRange.from);
        const to = this.convertTimeToNumber(timeRange.to);
        
        return !isNaN(from) && !isNaN(to) && from < to;
    },
    
    /**
     * 生成唯一ID
     */
    generateId(prefix = 'chart') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};

// ================================
// Event System
// ================================
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return this; // 支持链式调用
    }
    
    off(event, callback) {
        if (!this.events[event]) return this;
        
        if (callback) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        } else {
            delete this.events[event];
        }
        return this;
    }
    
    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Event handler error for '${event}':`, error);
                }
            });
        }
        return this;
    }
    
    once(event, callback) {
        const onceWrapper = (...args) => {
            callback(...args);
            this.off(event, onceWrapper);
        };
        return this.on(event, onceWrapper);
    }
}

// ================================
// Chart Registry
// ================================
class ChartRegistry {
    static charts = new Map();
    static mainChart = null;
    
    static register(id, chart, isMain = false) {
        this.charts.set(id, chart);
        if (isMain) {
            this.mainChart = chart;
        }
        console.log(`📊 图表已注册: ${id} ${isMain ? '(主图)' : ''}`);
    }
    
    static unregister(id) {
        const chart = this.charts.get(id);
        if (chart === this.mainChart) {
            this.mainChart = null;
        }
        this.charts.delete(id);
        console.log(`📊 图表已注销: ${id}`);
    }
    
    static getMainChart() {
        return this.mainChart;
    }
    
    static getAllCharts() {
        return Array.from(this.charts.values());
    }
    
    static getChart(id) {
        return this.charts.get(id);
    }
    
    static clear() {
        this.charts.clear();
        this.mainChart = null;
        console.log('📊 所有图表已清空');
    }
    
    static getChartCount() {
        return this.charts.size;
    }
}

// ================================
// Base Chart Class
// ================================
class BaseChart extends EventEmitter {
    constructor(container, options = {}) {
        super();
        
        this.id = ChartUtils.generateId('chart');
        this.container = container;
        this.chart = null;
        this.series = [];
        this.options = options;
        
        // 状态管理
        this.state = {
            isLoading: false,
            isDataLoaded: false,
            isAligned: false,
            hasError: false,
            errorMessage: null
        };
        
        // 数据相关
        this.retryCount = 0;
        this.timeRangeRetryCount = 0;
        
        // 注册到全局注册器
        ChartRegistry.register(this.id, this);
        
        console.log(`🎯 BaseChart创建: ${this.id}`);
    }
    
    /**
     * 创建图表
     */
    create() {
        if (this.chart) {
            this.destroy();
        }
        
        try {
            // 检查LightweightCharts是否可用
            if (!window.LightweightCharts) {
                throw new Error('LightweightCharts库未加载');
            }
            
            // 检查容器是否有效
            if (!this.container) {
                throw new Error('图表容器无效');
            }
            
            // 获取完整配置
            const chartType = this.options.chartType || 'main';
            const fullConfig = ChartConfig.getChartConfig(chartType);
            
            // 合并用户自定义配置
            const finalConfig = { ...fullConfig, ...this.options };
            
            console.log(`🎯 创建图表: ${this.id}, 类型: ${chartType}`, finalConfig);
            
            this.chart = LightweightCharts.createChart(this.container, finalConfig);
            this.setState({ hasError: false, errorMessage: null });
            
            // 设置无留白模式
            this.setupNoWhitespaceMode();
            
            // 调用子类的创建完成回调
            this.onCreated();
            
            this.emit('created', this);
            console.log(`✅ 图表创建成功: ${this.id}`);
            
            return this.chart;
        } catch (error) {
            this.setState({ hasError: true, errorMessage: error.message });
            this.emit('error', error);
            console.error(`❌ 图表创建失败: ${this.id}`, error);
            throw error;
        }
    }
    
    /**
     * 设置无留白模式
     */
    setupNoWhitespaceMode() {
        if (!this.chart) return;
        
        try {
            this.chart.timeScale().applyOptions({
                rightOffset: 12,
                barSpacing: 6,
                fixLeftEdge: false,
                fixRightEdge: false
            });
            console.log(`📐 无留白模式已设置: ${this.id}`);
        } catch (error) {
            console.warn(`设置无留白模式失败: ${this.id}`, error);
        }
    }
    
    /**
     * 销毁图表
     */
    destroy() {
        if (this.chart) {
            // 移除所有系列
            this.series.forEach(series => {
                try {
                    this.chart.removeSeries(series);
                } catch (e) {
                    console.warn(`移除系列时出错: ${this.id}`, e);
                }
            });
            this.series = [];
            
            // 移除图表
            this.chart.remove();
            this.chart = null;
            
            this.emit('destroyed', this);
        }
        
        // 从注册器中移除
        ChartRegistry.unregister(this.id);
        
        // 清理事件监听器
        this.events = {};
        
        console.log(`🗑️ 图表已销毁: ${this.id}`);
    }
    
    /**
     * 添加系列
     */
    addSeries(type, options = {}) {
        if (!this.chart) {
            console.error(`无法添加系列，图表未创建: ${this.id}`);
            return null;
        }
        
        console.log(`🔧 添加系列: ${this.id}, 类型: ${type}`, options);
        console.log(`🔍 图表实例检查:`, {
            chartExists: !!this.chart,
            chartType: typeof this.chart,
            addCandlestickSeries: typeof this.chart.addCandlestickSeries,
            addLineSeries: typeof this.chart.addLineSeries,
            addHistogramSeries: typeof this.chart.addHistogramSeries
        });
        
        let series;
        try {
            switch (type.toLowerCase()) {
                case 'candlestick':
                    series = this.chart.addCandlestickSeries(options);
                    break;
                case 'line':
                    series = this.chart.addLineSeries(options);
                    break;
                case 'histogram':
                    series = this.chart.addHistogramSeries(options);
                    break;
                case 'area':
                    series = this.chart.addAreaSeries(options);
                    break;
                case 'baseline':
                    series = this.chart.addBaselineSeries(options);
                    break;
                default:
                    console.warn(`未知的系列类型: ${type}`);
                    return null;
            }
            
            this.series.push(series);
            
            // 为主要系列添加数据设置监听
            if (series && series.setData && ['candlestick', 'histogram'].includes(type.toLowerCase())) {
                const originalSetData = series.setData.bind(series);
                series.setData = (data) => {
                    originalSetData(data);
                    this.setState({ isDataLoaded: true });
                    this.emit('dataLoaded', data);
                };
            }
            
            this.emit('seriesAdded', { type, series, options });
            console.log(`📈 系列已添加: ${this.id} (${type})`);
            
            return series;
        } catch (error) {
            console.error(`添加系列失败: ${this.id} (${type})`, error);
            this.emit('error', error);
            return null;
        }
    }
    
    /**
     * 设置时间范围
     */
    setTimeRange(timeRange) {
        if (!this.chart) {
            console.warn(`图表未创建，无法设置时间范围: ${this.id}`);
            return;
        }
        
        if (!ChartUtils.isValidTimeRange(timeRange)) {
            console.warn(`时间范围无效: ${this.id}`, timeRange);
            return;
        }
        
        try {
            // 检查图表是否有数据系列
            if (this.series.length === 0) {
                if (!this.timeRangeRetryCount) {
                    this.timeRangeRetryCount = 0;
                    console.warn(`图表暂无数据系列，延迟设置时间范围: ${this.id}`);
                }
                this.timeRangeRetryCount++;
                
                if (this.timeRangeRetryCount < 5) {
                    setTimeout(() => {
                        this.setTimeRange(timeRange);
                    }, 150);
                } else {
                    this.timeRangeRetryCount = 0;
                }
                return;
            }
            
            // 重置重试计数器
            if (this.timeRangeRetryCount > 0) {
                this.timeRangeRetryCount = 0;
            }
            
            // 转换时间格式
            const convertedTimeRange = {
                from: ChartUtils.convertTimeToNumber(timeRange.from),
                to: ChartUtils.convertTimeToNumber(timeRange.to)
            };
            
            if (isNaN(convertedTimeRange.from) || isNaN(convertedTimeRange.to)) {
                console.warn(`时间转换失败: ${this.id}`, { original: timeRange, converted: convertedTimeRange });
                return;
            }
            
            this.chart.timeScale().setVisibleRange(convertedTimeRange);
            this.emit('timeRangeChanged', timeRange);
            console.log(`⏰ 时间范围设置成功: ${this.id}`, timeRange);
            
        } catch (error) {
            console.error(`设置时间范围失败: ${this.id}`, error);
            
            // 处理"Value is null"错误
            if (error.message && error.message.includes('Value is null')) {
                if (!this.retryCount) this.retryCount = 0;
                if (this.retryCount < 2) {
                    this.retryCount++;
                    if (this.retryCount === 1) {
                        console.log(`检测到null值错误，将延迟重试: ${this.id} (第${this.retryCount}次)`);
                    }
                    setTimeout(() => {
                        if (this.retryCount === 1) {
                            console.log(`重试设置时间范围: ${this.id}`);
                        }
                        this.setTimeRange(timeRange);
                    }, 300 * this.retryCount);
                } else {
                    this.retryCount = 0;
                }
            }
            
            this.emit('error', error);
        }
    }
    
    /**
     * 获取时间范围
     */
    getTimeRange() {
        if (!this.chart) return null;
        
        try {
            const range = this.chart.timeScale().getVisibleRange();
            return ChartUtils.isValidTimeRange(range) ? range : null;
        } catch (error) {
            console.error(`获取时间范围失败: ${this.id}`, error);
            return null;
        }
    }
    
    /**
     * 订阅时间范围变化
     */
    subscribeTimeRangeChange(handler) {
        if (this.chart) {
            this.chart.timeScale().subscribeVisibleTimeRangeChange(handler);
        }
    }
    
    /**
     * 订阅十字线移动
     */
    subscribeCrosshairMove(handler) {
        if (this.chart) {
            this.chart.subscribeCrosshairMove(handler);
        }
    }
    
    /**
     * 适配内容到数据范围
     */
    fitContentToData() {
        if (this.chart) {
            try {
                this.chart.timeScale().fitContent();
                this.emit('contentFitted');
                console.log(`📏 内容已适配到数据范围: ${this.id}`);
            } catch (error) {
                console.error(`适配内容失败: ${this.id}`, error);
            }
        }
    }
    
    /**
     * 设置状态
     */
    setState(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };
        this.emit('stateChange', { oldState, newState: this.state });
    }
    
    /**
     * 获取状态
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * 获取源名称（用于同步识别）
     */
    getSourceName() {
        return this.constructor.name.toLowerCase();
    }
    
    /**
     * 创建完成后的回调（子类可重写）
     */
    onCreated() {
        // 子类可以重写此方法
    }
    
    /**
     * 获取图表信息
     */
    getInfo() {
        return {
            id: this.id,
            type: this.getSourceName(),
            state: this.getState(),
            seriesCount: this.series.length,
            hasChart: !!this.chart
        };
    }
}

// ================================
// Main Chart Class
// ================================
class MainChart extends BaseChart {
        constructor(container) {
        super(container, ChartConfig.getChartConfig('main'));
        
        // 主图特有属性
        this.volumeSeries = null;
        this.candleSeries = [];
        this.indicatorSeries = [];
        this.currentOhlcData = null;
        this.subCharts = [];
        this.stockInfos = []; // 存储股票信息
        this.normalizationEnabled = false; // 价格归一化状态
        this.basePrice = null; // 基准价格
        this.originalStockData = []; // 存储原始股票数据，用于归一化恢复
        
        // 注册为主图
        ChartRegistry.register(this.id, this, true);
        
        console.log(`📊 MainChart 已创建: ${this.id}`);
    }
    
    onCreated() {
        console.log('🚀 MainChart.onCreated() 开始初始化...');
        
        // 首先配置所有价格轴
        this.setupPriceScales();
        // 然后创建成交量系列
        this.setupVolumeSeries();
        // 最后设置事件监听器
        this.setupEventListeners();
        
        console.log('✅ MainChart 初始化完成');
    }
    
    /**
     * 设置成交量系列
     */
    setupVolumeSeries() {
        try {
            this.volumeSeries = this.addSeries('histogram', {
                priceScaleId: 'volume',
                priceFormat: { type: 'volume' },
                color: '#26a69a'
            });
            
            console.log('📊 成交量系列创建完成，使用价格轴: volume');
        } catch (error) {
            console.error('❌ 成交量系列创建失败:', error);
        }
    }
    
    /**
     * 预先配置所有价格轴
     */
    setupPriceScales() {
        try {
            // 主价格轴 - K线和价格指标 (顶部65%)
            this.chart.priceScale('right').applyOptions({
                scaleMargins: { top: 0.05, bottom: 0.35 },  // 主图占顶部65%
                alignLabels: true,
                borderVisible: true,
                autoScale: true
            });
            
            // 成交量价格轴 - 中间区域 (中间15%)
            this.chart.priceScale('volume').applyOptions({
                scaleMargins: { top: 0.65, bottom: 0.2 },   // 成交量占中间15%
                alignLabels: true,
                borderVisible: true,
                autoScale: true,
                borderColor: '#D0D0D0'  // 添加边框颜色便于区分
            });
            
            // Squeeze指标价格轴 - 底部区域 (底部20%)
            this.chart.priceScale('squeeze').applyOptions({
                scaleMargins: { top: 0.8, bottom: 0.0 },   // Squeeze占底部20%
                alignLabels: true,
                borderVisible: true,
                borderColor: '#B0B0B0',  // 更深的边框颜色
                autoScale: true,
                mode: 0
            });
            
            console.log('✅ 所有价格轴已预先配置完成');
            console.log('📊 价格轴布局: 主图(5-65%) + 成交量(65-80%) + Squeeze(80-100%)');
        } catch (error) {
            console.error('❌ 价格轴配置失败:', error);
        }
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        try {
            // 监听时间轴变化
            this.subscribeTimeRangeChange((timeRange) => {
                this.handleTimeRangeChange(timeRange);
            });
            
            // 监听十字线移动
            this.subscribeCrosshairMove((param) => {
                this.handleCrosshairMove(param);
            });
            
            console.log('✅ MainChart 事件监听器设置完成');
        } catch (error) {
            console.error('❌ 事件监听器设置失败:', error);
        }
    }
    
    /**
     * 处理时间轴变化
     */
    handleTimeRangeChange(timeRange) {
        // 发送时间轴变化事件
        this.emit('timeRangeChanged', {
            source: this.getSourceName(),
            timeRange: timeRange,
            chartId: this.id
        });
    }
    
    /**
     * 处理十字线移动
     */
    handleCrosshairMove(param) {
        // 发送十字线移动事件
        this.emit('crosshairMove', {
            source: this.getSourceName(),
            param: param,
            chartId: this.id
        });
        
        // 更新信息栏
        this.updateInfoBar(param);
    }
    
    /**
     * 更新信息栏
     */
    updateInfoBar(param) {
        // TODO: 实现信息栏更新逻辑
        console.log('📊 更新信息栏:', param);
    }
    
    /**
     * 添加子图
     */
    addSubChart(subChart) {
        this.subCharts.push(subChart);
        console.log(`📊 子图已添加到主图: ${subChart.id}`);
    }
    
    /**
     * 加载股票数据
     */
    async loadData(codes, selectedIndicators = []) {
        console.log(`🚀 MainChart 开始加载数据:`, { codes, selectedIndicators });
        
        try {
            // 清空现有数据
            this.clearData();
            
            // 准备数据加载
            this.prepareForDataLoad();
            
            // 并行加载所有股票数据
            const promises = codes.map((code, idx) => 
                this.loadStockData(code, idx, selectedIndicators)
            );
            
            await Promise.all(promises);
            
            // 完成数据加载
            setTimeout(() => {
                this.finalizeDataLoad();
                console.log('✅ MainChart 数据加载完成');
            }, 50);
            
        } catch (error) {
            console.error('❌ MainChart 数据加载失败:', error);
            throw error;
        }
    }
    
    /**
     * 加载单个股票数据
     */
    async loadStockData(code, index, selectedIndicators) {
        try {
            console.log(`📈 加载股票数据: ${code} (索引${index})`);
            
            // 获取K线数据
            const response = await fetch(`/api/kline?code=${code}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const ohlc = await response.json();
            
            if (!ohlc || !Array.isArray(ohlc) || ohlc.length === 0) {
                console.error(`❌ ${code}: API返回的数据无效`);
                return;
            }
            
            // 存储股票信息
            this.storeStockInfo(code, index, ohlc);
            
            // 创建K线系列
            await this.createCandlestickSeries(ohlc, index);
            
            // 创建成交量数据
            if (index === 0) { // 只为主股票创建成交量
                this.createVolumeData(ohlc);
            }
            
            // 加载指标
            await this.loadIndicatorsForStock(code, selectedIndicators, index);
            
            console.log(`✅ 股票 ${code} 数据加载完成`);
            
        } catch (error) {
            console.error(`❌ 加载股票 ${code} 数据失败:`, error);
        }
    }
    
    /**
     * 存储股票信息
     */
    storeStockInfo(code, index, ohlc) {
        // 获取颜色方案
        const colorSchemes = [
            { upColor: '#26a69a', downColor: '#ef5350', borderUpColor: '#26a69a', borderDownColor: '#ef5350', wickUpColor: '#26a69a', wickDownColor: '#ef5350' },
            { upColor: '#2196f3', downColor: '#ff9800', borderUpColor: '#2196f3', borderDownColor: '#ff9800', wickUpColor: '#2196f3', wickDownColor: '#ff9800' },
            { upColor: '#9c27b0', downColor: '#4caf50', borderUpColor: '#9c27b0', borderDownColor: '#4caf50', wickUpColor: '#9c27b0', wickDownColor: '#4caf50' }
        ];
        
        const colorScheme = colorSchemes[index] || colorSchemes[0];
        
        this.originalStockData[index] = JSON.parse(JSON.stringify(ohlc));
        this.stockInfos[index] = {
            code: code,
            name: this.extractStockName(code),
            colorScheme: colorScheme,
            data: ohlc,
            isMain: index === 0
        };
        
        console.log(`📊 股票信息已存储: ${code}`);
    }
    
    /**
     * 提取股票名称
     */
    extractStockName(code) {
        // 简单的股票名称提取逻辑
        return `股票${code}`;
    }
    
    /**
     * 创建K线系列
     */
    async createCandlestickSeries(ohlc, index) {
        try {
            const stockInfo = this.stockInfos[index];
            if (!stockInfo) {
                console.error(`❌ 股票信息不存在: 索引${index}`);
                return null;
            }
            
            // 过滤有效数据
            const validData = this.filterValidOHLCData(ohlc);
            if (validData.length === 0) {
                console.error(`❌ 股票${index}: 没有有效的K线数据`);
                return null;
            }
            
            // 创建K线系列
            const candleSeries = this.addSeries('candlestick', {
                priceScaleId: 'right',
                upColor: stockInfo.colorScheme.upColor,
                downColor: stockInfo.colorScheme.downColor,
                borderUpColor: stockInfo.colorScheme.borderUpColor,
                borderDownColor: stockInfo.colorScheme.borderDownColor,
                wickUpColor: stockInfo.colorScheme.wickUpColor,
                wickDownColor: stockInfo.colorScheme.wickDownColor,
                priceLineVisible: index === 0, // 只有主股票显示价格线
                lastValueVisible: index === 0  // 只有主股票显示最后价格
            });
            
            if (!candleSeries) {
                console.error(`❌ 股票${index}: K线系列创建失败`);
                return null;
            }
            
            // 设置数据
            candleSeries.setData(validData);
            this.candleSeries[index] = candleSeries;
            
            console.log(`✅ 股票${index} K线系列创建完成，数据点: ${validData.length}`);
            return candleSeries;
            
        } catch (error) {
            console.error(`❌ 创建K线系列失败 (股票${index}):`, error);
            return null;
        }
    }
    
    /**
     * 过滤有效的OHLC数据
     */
    filterValidOHLCData(data) {
        return data.filter(item => {
            return item && 
                   item.time &&
                   typeof item.open === 'number' && isFinite(item.open) &&
                   typeof item.high === 'number' && isFinite(item.high) &&
                   typeof item.low === 'number' && isFinite(item.low) &&
                   typeof item.close === 'number' && isFinite(item.close) &&
                   item.high >= item.low &&
                   item.high >= Math.max(item.open, item.close) &&
                   item.low <= Math.min(item.open, item.close);
        });
    }
    
    /**
     * 创建成交量数据
     */
    createVolumeData(ohlc) {
        try {
            if (!this.volumeSeries) {
                console.error('❌ 成交量系列未初始化');
                return;
            }
            
            const volumeData = ohlc
                .filter(bar => bar && bar.time && bar.volume && isFinite(bar.volume) && bar.volume > 0)
                .map(bar => ({
                    time: bar.time,
                    value: bar.volume,
                    color: bar.close >= bar.open ? '#26a69a80' : '#ef535080' // 添加透明度
                }));
            
            if (volumeData.length > 0) {
                this.volumeSeries.setData(volumeData);
                console.log(`✅ 成交量数据设置完成，数据点: ${volumeData.length}`);
            } else {
                console.warn('⚠️ 没有有效的成交量数据');
            }
            
        } catch (error) {
            console.error('❌ 创建成交量数据失败:', error);
        }
    }
    
    /**
     * 为股票加载指标
     */
    async loadIndicatorsForStock(code, selectedIndicators, stockIndex) {
        const promises = selectedIndicators.map(indicator => {
            return this.loadIndicatorForStock(code, indicator, stockIndex);
        });
        
        await Promise.all(promises);
    }
    
    /**
     * 为股票加载单个指标
     */
    async loadIndicatorForStock(code, indicator, stockIndex) {
        try {
            console.log(`📊 加载指标: ${indicator} for ${code} (股票${stockIndex})`);
            
            const response = await fetch(`/api/indicator?code=${code}&type=${indicator}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data || !Array.isArray(data) || data.length === 0) {
                console.warn(`⚠️ ${code}: ${indicator} 指标数据为空`);
                return;
            }
            
            // 根据指标类型处理数据
            switch (indicator) {
                case 'supertrend':
                    this.addSupertrendIndicator(data, stockIndex);
                    break;
                case 'ma5':
                case 'ma10':
                    this.addMAIndicator(data, indicator, stockIndex);
                    break;
                case 'squeeze_momentum':
                    if (stockIndex === 0) { // 只为主股票添加
                        this.addSqueezeIndicator(data);
                    }
                    break;
                default:
                    console.warn(`⚠️ 未知指标类型: ${indicator}`);
            }
            
        } catch (error) {
            console.error(`❌ 加载指标 ${indicator} 失败:`, error);
        }
    }
    
    /**
     * 添加SuperTrend指标
     */
    addSupertrendIndicator(data, stockIndex) {
        try {
            const stockInfo = this.stockInfos[stockIndex];
            if (!stockInfo) return;
            
            // 处理SuperTrend数据
            const processedData = this.processSupertrendData(data);
            
            // 创建上升趋势线
            const uptrendSeries = this.addSeries('line', {
                priceScaleId: 'right',
                color: stockInfo.colorScheme.upColor,
                lineWidth: 2,
                title: `${stockInfo.code} SuperTrend Up`
            });
            
            // 创建下降趋势线
            const downtrendSeries = this.addSeries('line', {
                priceScaleId: 'right',
                color: stockInfo.colorScheme.downColor,
                lineWidth: 2,
                title: `${stockInfo.code} SuperTrend Down`
            });
            
            // 设置数据
            uptrendSeries.setData(processedData.uptrend);
            downtrendSeries.setData(processedData.downtrend);
            
            console.log(`✅ SuperTrend指标已添加 (股票${stockIndex})`);
            
        } catch (error) {
            console.error(`❌ 添加SuperTrend指标失败 (股票${stockIndex}):`, error);
        }
    }
    
    /**
     * 处理SuperTrend数据
     */
    processSupertrendData(data) {
        const uptrend = [];
        const downtrend = [];
        
        data.forEach(item => {
            if (item && item.time) {
                if (item.supertrend_direction === 1 && item.supertrend !== null) {
                    uptrend.push({ time: item.time, value: item.supertrend });
                    downtrend.push({ time: item.time, value: null });
                } else if (item.supertrend_direction === -1 && item.supertrend !== null) {
                    downtrend.push({ time: item.time, value: item.supertrend });
                    uptrend.push({ time: item.time, value: null });
                } else {
                    uptrend.push({ time: item.time, value: null });
                    downtrend.push({ time: item.time, value: null });
                }
            }
        });
        
        return { uptrend, downtrend };
    }
    
    /**
     * 添加移动平均线指标
     */
    addMAIndicator(data, indicator, stockIndex) {
        try {
            const stockInfo = this.stockInfos[stockIndex];
            if (!stockInfo) return;
            
            const maData = data
                .filter(item => item && item.time && item.ma !== null && isFinite(item.ma))
                .map(item => ({ time: item.time, value: item.ma }));
            
            if (maData.length === 0) {
                console.warn(`⚠️ ${indicator} 没有有效数据 (股票${stockIndex})`);
                return;
            }
            
            const maSeries = this.addSeries('line', {
                priceScaleId: 'right',
                color: indicator === 'ma5' ? '#ff6b6b' : '#4ecdc4',
                lineWidth: 1,
                title: `${stockInfo.code} ${indicator.toUpperCase()}`
            });
            
            maSeries.setData(maData);
            
            console.log(`✅ ${indicator} 指标已添加 (股票${stockIndex}), 数据点: ${maData.length}`);
            
        } catch (error) {
            console.error(`❌ 添加${indicator}指标失败 (股票${stockIndex}):`, error);
        }
    }
    
    /**
     * 添加Squeeze指标
     */
    addSqueezeIndicator(data) {
        try {
            // 创建动量柱状图
            const momentumSeries = this.addSeries('histogram', {
                priceScaleId: 'squeeze',
                priceFormat: { type: 'price', precision: 4, minMove: 0.0001 }
            });
            
            // 创建零线
            const zeroLineSeries = this.addSeries('line', {
                priceScaleId: 'squeeze',
                color: '#808080',
                lineWidth: 1
            });
            
            // 处理数据
            const momentumData = [];
            const zeroLineData = [];
            
            data.forEach(item => {
                if (item && item.time) {
                    // 动量数据
                    if (item.momentum !== null && isFinite(item.momentum)) {
                        momentumData.push({
                            time: item.time,
                            value: item.momentum,
                            color: item.momentum >= 0 ? '#26a69a' : '#ef5350'
                        });
                    }
                    
                    // 零线数据
                    zeroLineData.push({ time: item.time, value: 0 });
                }
            });
            
            // 设置数据
            if (momentumData.length > 0) {
                momentumSeries.setData(momentumData);
                console.log(`✅ Squeeze动量数据已设置, 数据点: ${momentumData.length}`);
            }
            
            if (zeroLineData.length > 0) {
                zeroLineSeries.setData(zeroLineData);
            }
            
            console.log('✅ Squeeze指标已添加到主图');
            
        } catch (error) {
            console.error('❌ 添加Squeeze指标失败:', error);
        }
    }
    
    /**
     * 准备数据加载
     */
    prepareForDataLoad() {
        this.setState({ isLoading: true, isDataLoaded: false });
        console.log('📊 MainChart 准备数据加载');
    }
    
    /**
     * 完成数据加载
     */
    finalizeDataLoad() {
        this.setState({ isLoading: false, isDataLoaded: true });
        
        // 适配内容到数据范围
        if (this.chart) {
            try {
                this.chart.timeScale().fitContent();
                console.log('📊 MainChart 数据加载完成，已适配内容');
            } catch (error) {
                console.warn('适配内容失败:', error);
            }
        }
    }
    
    /**
     * 清空数据
     */
    clearData() {
        try {
            // 清空所有系列
            this.candleSeries = [];
            this.indicatorSeries = [];
            
            // 清空股票信息
            this.stockInfos = [];
            this.originalStockData = [];
            this.currentOhlcData = null;
            
            // 重置状态
            this.normalizationEnabled = false;
            this.basePrice = null;
            
            // 清空图表数据
            if (this.chart) {
                // 移除所有系列（使用BaseChart的series数组）
                this.series.forEach(series => {
                    try {
                        this.chart.removeSeries(series);
                    } catch (e) {
                        console.warn('移除系列时出错:', e);
                    }
                });
                
                // 清空系列数组
                this.series = [];
                
                // 重新创建成交量系列
                this.setupVolumeSeries();
            }
            
            console.log('✅ MainChart 数据已清空');
            
        } catch (error) {
            console.error('❌ 清空数据失败:', error);
        }
    }
    
    /**
     * 获取源名称
     */
    getSourceName() {
        return 'main';
    }
    
    /**
     * 销毁图表
     */
    destroy() {
        try {
            // 注销图表
            ChartRegistry.unregister(this.id);
            
            // 清空子图
            this.subCharts = [];
            
            // 调用父类销毁方法
            super.destroy();
            
            console.log(`📊 MainChart 已销毁: ${this.id}`);
            
        } catch (error) {
            console.error('❌ MainChart 销毁失败:', error);
        }
    }
}

// ================================
// 导出和全局注册
// ================================

// 验证配置
if (!ChartConfig.validate()) {
    throw new Error('ChartConfig validation failed');
}

// 全局导出
window.ChartConfigV2 = ChartConfig;
window.ChartUtilsV2 = ChartUtils;
window.EventEmitter = EventEmitter;
window.ChartRegistry = ChartRegistry;
window.BaseChart = BaseChart;
window.MainChart = MainChart;

console.log('🚀 LightWeight Charts V2.1.0 - 核心系统已加载');
console.log('📊 可用组件:', {
    ChartConfig: '配置管理',
    ChartUtils: '工具函数',
    EventEmitter: '事件系统',
    ChartRegistry: '图表注册器',
    BaseChart: '基础图表类'
}); 
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
            minimumWidth: 80  // 统一最小宽度，确保对齐
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
            lockVisibleTimeRangeOnResize: false,
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
            lockVisibleTimeRangeOnResize: false,
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
        handleScroll: false,        // 禁用滚动
        handleScale: false,         // 禁用缩放
        kineticScrollEnabled: false, // 禁用惯性滚动
        timeScale: {
            visible: false,
            timeVisible: false,
            secondsVisible: false,
            borderVisible: false,
            rightOffset: 12,
            barSpacing: 6,
            fixLeftEdge: false,
            fixRightEdge: false,
            lockVisibleTimeRangeOnResize: false
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
        handleScroll: false,        // 禁用滚动
        handleScale: false,         // 禁用缩放
        kineticScrollEnabled: false, // 禁用惯性滚动
        timeScale: {
            visible: true,
            timeVisible: true,
            secondsVisible: false,
            borderVisible: true,
            rightOffset: 12,
            barSpacing: 6,
            fixLeftEdge: false,
            fixRightEdge: false,
            lockVisibleTimeRangeOnResize: false
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
            
            console.log(`🎯 创建图表: ${this.id}, 类型: ${chartType}`);
            console.log(`🔧 [DEBUG] 图表配置:`, finalConfig);
            console.log(`🔍 [DEBUG] 时间轴配置:`, finalConfig.timeScale);
            
            this.chart = LightweightCharts.createChart(this.container, finalConfig);
            
            // 创建后立即检查时间轴配置
            const createdTimeScaleOptions = this.chart.timeScale().options();
            console.log(`🔍 [DEBUG] 图表创建后的时间轴配置:`, {
                fixLeftEdge: createdTimeScaleOptions.fixLeftEdge,
                fixRightEdge: createdTimeScaleOptions.fixRightEdge,
                lockVisibleTimeRangeOnResize: createdTimeScaleOptions.lockVisibleTimeRangeOnResize,
                barSpacing: createdTimeScaleOptions.barSpacing
            });
            
            // 检查图表的交互配置
            console.log(`🔍 [DEBUG] 图表交互配置:`, {
                handleScroll: finalConfig.handleScroll,
                handleScale: finalConfig.handleScale,
                kineticScrollEnabled: finalConfig.kineticScrollEnabled
            });
            
            // 对于子图，禁用独立的缩放和滚动
            if (chartType === 'volume' || chartType === 'indicator') {
                console.log(`🔧 [DEBUG] 子图 ${chartType} 已禁用独立缩放和滚动`);
            } else {
                console.log('🔧 [DEBUG] 使用LightweightCharts默认交互配置');
            }
            
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
            const timeScaleOptions = {
                rightOffset: 12,
                barSpacing: 6,
                fixLeftEdge: false,
                fixRightEdge: false,
                lockVisibleTimeRangeOnResize: false
            };
            
            console.log(`🔧 [DEBUG] 应用时间轴配置: ${this.id}`, timeScaleOptions);
            this.chart.timeScale().applyOptions(timeScaleOptions);
            
            // 获取当前时间轴配置进行验证
            const currentOptions = this.chart.timeScale().options();
            console.log(`🔍 [DEBUG] 当前时间轴配置: ${this.id}`, {
                fixLeftEdge: currentOptions.fixLeftEdge,
                fixRightEdge: currentOptions.fixRightEdge,
                lockVisibleTimeRangeOnResize: currentOptions.lockVisibleTimeRangeOnResize,
                barSpacing: currentOptions.barSpacing,
                rightOffset: currentOptions.rightOffset
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
    
    /**
     * 禁用独立交互功能（用于子图）
     * 主图不应该调用此方法
     */
    disableIndependentInteractions() {
        try {
            if (this.container) {
                // 添加全面的事件阻止
                const blockAllEvents = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                };
                
                // 阻止所有可能触发缩放的事件
                this.container.addEventListener('wheel', blockAllEvents, { passive: false, capture: true });
                this.container.addEventListener('mousedown', blockAllEvents, { passive: false, capture: true });
                this.container.addEventListener('keydown', blockAllEvents, { passive: false, capture: true });
                this.container.addEventListener('touchstart', blockAllEvents, { passive: false, capture: true });
                this.container.addEventListener('touchmove', blockAllEvents, { passive: false, capture: true });
                
                // 禁用拖拽和选择
                this.container.addEventListener('mousemove', (e) => {
                    if (e.buttons > 0) { // 如果有按钮被按下
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }, { passive: false, capture: true });
                
                // 设置样式禁用选择和拖拽
                this.container.style.userSelect = 'none';
                this.container.style.pointerEvents = 'none';
                this.container.style.webkitUserSelect = 'none';
                this.container.style.mozUserSelect = 'none';
                this.container.style.msUserSelect = 'none';
                
                // 重新启用仅查看功能（十字线）
                setTimeout(() => {
                    if (this.container) {
                        this.container.style.pointerEvents = 'auto';
                        
                        // 只允许鼠标移动事件（用于十字线），禁用其他所有交互
                        this.container.addEventListener('mousemove', (e) => {
                            if (e.buttons === 0) { // 只有在没有按钮被按下时才允许
                                return true;
                            }
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }, { passive: false });
                    }
                }, 100);
                
                console.log(`✅ ${this.getSourceName()}子图独立交互已完全禁用`);
            }
        } catch (error) {
            console.error(`❌ 禁用${this.getSourceName()}子图独立交互失败:`, error);
        }
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
        this.stockIndicatorSeries = []; // 存储每只股票的指标系列
        this.originalIndicatorData = []; // 存储原始指标数据，用于归一化恢复
        this.currentOhlcData = null;
        this.subCharts = [];
        this.stockInfos = []; // 存储股票信息
        this.normalizationEnabled = false; // 价格归一化状态
        this.normalizationRatios = []; // 存储每只股票的归一化比例
        this.originalStockData = []; // 存储原始股票数据，用于归一化恢复
        this.stockVisibility = []; // 股票可见性状态
        this.legendContainer = null; // 图例容器
        
        // 成交量子图相关
        this.volumeChart = null;
        this.volumeContainer = null;
        
        // Squeeze子图相关
        this.squeezeChart = null;
        this.squeezeContainer = null;
        
        // 注册为主图
        ChartRegistry.register(this.id, this, true);
        
        console.log(`📊 MainChart 已创建: ${this.id}`);
    }
    
    onCreated() {
        console.log('🚀 MainChart.onCreated() 开始初始化...');
        
        // 首先配置所有价格轴
        this.setupPriceScales();
        // 设置事件监听器
        this.setupEventListeners();
        
        console.log('✅ MainChart 初始化完成');
    }
    
    /**
     * 设置成交量系列（已移除，成交量将作为独立子图显示）
     */
    setupVolumeSeries() {
        // 成交量已从主图中移除，将作为独立的子图显示
        console.log('📊 成交量系列已从主图中移除');
    }
    
    /**
     * 预先配置所有价格轴
     */
    setupPriceScales() {
        try {
            // 主价格轴配置
            const rightPriceScaleOptions = {
                scaleMargins: { top: 0.08, bottom: 0.08 },  // 上下各留8%空间，居中显示
                alignLabels: true,
                borderVisible: true,
                autoScale: true,
                mode: 1,  // 使用正常模式，自动调整范围
                entireTextOnly: false,  // 允许部分文本显示
                minimumWidth: 80  // 统一最小宽度
            };
            
            console.log('🔧 [DEBUG] 配置主价格轴:', rightPriceScaleOptions);
            this.chart.priceScale('right').applyOptions(rightPriceScaleOptions);
            
            // Squeeze指标价格轴配置
            const squeezePriceScaleOptions = {
                scaleMargins: { top: 0.82, bottom: 0.0 },   // Squeeze占底部18%
                alignLabels: true,
                borderVisible: true,
                borderColor: '#B0B0B0',  // 更深的边框颜色
                autoScale: true,
                mode: 0,
                minimumWidth: 80  // 统一最小宽度
            };
            
            console.log('🔧 [DEBUG] 配置Squeeze价格轴:', squeezePriceScaleOptions);
            this.chart.priceScale('squeeze').applyOptions(squeezePriceScaleOptions);
            
            // 再次检查时间轴配置
            const timeScaleOptions = this.chart.timeScale().options();
            console.log('🔍 [DEBUG] 价格轴配置后的时间轴状态:', {
                fixLeftEdge: timeScaleOptions.fixLeftEdge,
                fixRightEdge: timeScaleOptions.fixRightEdge,
                lockVisibleTimeRangeOnResize: timeScaleOptions.lockVisibleTimeRangeOnResize
            });
            
            console.log('✅ 所有价格轴已预先配置完成');
            console.log('📊 价格轴布局: 主图(8-82%居中) + Squeeze(82-100%)');
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
                // 只在数据加载完成后才优化价格范围，避免干扰用户缩放操作
                if (this.getState().isDataLoaded && !this._userIsZooming) {
                    setTimeout(() => {
                        this.optimizePriceRange();
                    }, 150);
                }
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
        
        // 同步时间轴到成交量子图
        this.syncTimeRangeToVolumeChart(timeRange);
        
        // 同步时间轴到Squeeze子图
        this.syncTimeRangeToSqueezeChart(timeRange);
    }
    
    /**
     * 处理十字线移动
     */
    handleCrosshairMove(param) {
        try {
            // 发送十字线移动事件
            this.emit('crosshairMove', {
                source: this.getSourceName(),
                param: param,
                chartId: this.id
            });
            
            // 更新信息栏
            this.updateInfoBar(param);
        } catch (error) {
            console.error('❌ 处理十字线移动失败:', error);
            // 如果出错，显示最新数据
            this.updateInfoBarWithLatestData();
        }
    }
    
    /**
     * 创建股票图例（已废弃，功能已合并到价格信息栏）
     */
    createStockLegend() {
        // 功能已合并到价格信息栏，此方法保留用于兼容性
        return null;
    }
    
    /**
     * 更新股票图例（已废弃，功能已合并到价格信息栏）
     */
    updateStockLegend() {
        // 功能已合并到价格信息栏，无需独立更新
        // 图例信息会在信息栏更新时一并更新
    }
    
    /**
     * 切换股票显示状态
     */
    toggleStockVisibility(index) {
        if (index < 0 || index >= this.stockInfos.length) return;
        
        // 切换可见性状态
        this.stockVisibility[index] = this.stockVisibility[index] !== false ? false : true;
        
        // 更新K线系列可见性
        if (this.candleSeries[index]) {
            this.candleSeries[index].applyOptions({
                visible: this.stockVisibility[index]
            });
        }
        
        // 更新该股票的所有指标系列可见性
        if (this.stockIndicatorSeries[index]) {
            this.stockIndicatorSeries[index].forEach(indicatorInfo => {
                const series = indicatorInfo.series || indicatorInfo; // 兼容旧格式
                if (series && series.applyOptions) {
                    series.applyOptions({
                        visible: this.stockVisibility[index]
                    });
                }
            });
        }
        
        // 动态调整时间轴到所有可见股票的范围
        setTimeout(() => {
            this.adjustTimeRangeToVisibleStocks();
        }, 100);
        
        // 更新信息栏（股票列表会自动刷新）
        this.updateInfoBarWithLatestData();
        
        console.log(`📊 股票 ${this.stockInfos[index].code} 可见性已切换为: ${this.stockVisibility[index]} (包含${this.stockIndicatorSeries[index]?.length || 0}个指标系列)`);
    }
    
    /**
     * 动态调整时间轴到所有可见股票的范围
     */
    adjustTimeRangeToVisibleStocks() {
        if (!this.chart) return;
        
        try {
            // 获取所有可见股票的数据范围
            let minTime = Infinity;
            let maxTime = -Infinity;
            let hasVisibleData = false;
            
            this.stockInfos.forEach((stockInfo, index) => {
                if (this.stockVisibility[index] !== false && stockInfo && stockInfo.data && stockInfo.data.length > 0) {
                    hasVisibleData = true;
                    const times = stockInfo.data.map(item => ChartUtils.convertTimeToNumber(item.time)).filter(t => !isNaN(t));
                    if (times.length > 0) {
                        const stockMinTime = Math.min(...times);
                        const stockMaxTime = Math.max(...times);
                        minTime = Math.min(minTime, stockMinTime);
                        maxTime = Math.max(maxTime, stockMaxTime);
                        
                        console.log(`📊 股票 ${stockInfo.code} 时间范围: ${new Date(stockMinTime * 1000).toISOString().split('T')[0]} - ${new Date(stockMaxTime * 1000).toISOString().split('T')[0]}`);
                    }
                }
            });
            
            if (!hasVisibleData || minTime === Infinity || maxTime === -Infinity) {
                console.warn('⚠️ 没有可见股票数据，无法调整时间范围');
                return;
            }
            
            // 添加一些边距
            const timeRange = maxTime - minTime;
            const margin = timeRange * 0.02; // 2%的边距
            const adjustedRange = {
                from: minTime - margin,
                to: maxTime + margin
            };
            
            // 设置时间范围
            this.chart.timeScale().setVisibleRange(adjustedRange);
            
            console.log(`⏰ 时间轴已调整到可见股票范围: ${new Date(adjustedRange.from * 1000).toISOString().split('T')[0]} - ${new Date(adjustedRange.to * 1000).toISOString().split('T')[0]}`);
            
        } catch (error) {
            console.error('❌ 调整时间轴范围失败:', error);
        }
    }
    
    /**
     * 手动切换价格归一化（强制模式，忽略智能检查）
     */
    manualToggleNormalization() {
        this.normalizationEnabled = !this.normalizationEnabled;
        
        if (this.normalizationEnabled) {
            this.enableNormalization();
        } else {
            this.disableNormalization();
        }
        
        this.updateInfoBarWithLatestData();
        console.log(`📊 手动归一化：已${this.normalizationEnabled ? '启用' : '禁用'}`);
    }
    
    /**
     * 切换价格归一化（保持向后兼容）
     */
    toggleNormalization() {
        return this.smartToggleNormalization();
    }
    
    /**
     * 启用价格归一化
     */
    enableNormalization() {
        if (this.stockInfos.length === 0) return;
        
        // 使用第一只股票的第一个价格作为基准
        const baseStock = this.stockInfos[0];
        if (!baseStock || !baseStock.data || baseStock.data.length === 0) return;
        
        const basePrice = baseStock.data[0].close;
        
        // 计算并存储每只股票的归一化比例
        this.normalizationRatios = this.stockInfos.map(stockInfo => {
            if (!stockInfo || !stockInfo.data || stockInfo.data.length === 0) return 1;
            const firstPrice = stockInfo.data[0].close;
            return basePrice / firstPrice;
        });
        
        // 应用归一化
        this.applyNormalization();
        
        console.log(`📊 价格归一化已启用，基准价格: ${basePrice}，比例:`, this.normalizationRatios);
    }
    
    /**
     * 应用归一化到所有数据
     */
    applyNormalization() {
        this.stockInfos.forEach((stockInfo, index) => {
            if (!stockInfo || !stockInfo.data) return;
            
            const ratio = this.normalizationRatios[index] || 1;
            
            // 归一化K线数据
            const normalizedData = this.originalStockData[index].map(item => ({
                ...item,
                open: item.open * ratio,
                high: item.high * ratio,
                low: item.low * ratio,
                close: item.close * ratio
            }));
            
            // 更新K线系列数据
            if (this.candleSeries[index]) {
                this.candleSeries[index].setData(normalizedData);
            }
            
            // 归一化该股票的所有指标数据
            this.applyIndicatorNormalization(index, ratio);
        });
    }
    
    /**
     * 应用指标归一化
     */
    applyIndicatorNormalization(stockIndex, ratio) {
        if (!this.stockIndicatorSeries[stockIndex]) return;
        
        this.stockIndicatorSeries[stockIndex].forEach(indicatorInfo => {
            const series = indicatorInfo.series || indicatorInfo; // 兼容旧格式
            const type = indicatorInfo.type;
            const originalData = indicatorInfo.originalData;
            
            if (!series || !originalData) return;
            
            try {
                if (type && (type.includes('supertrend') || type === 'ma5' || type === 'ma10')) {
                    // 动态计算归一化后的指标数据
                    const normalizedData = originalData.map(item => ({
                        ...item,
                        value: item.value * ratio
                    }));
                    series.setData(normalizedData);
                }
                // 其他类型的指标（如Squeeze momentum）不需要归一化
                
            } catch (error) {
                console.warn(`归一化指标失败 (股票${stockIndex}, 类型${type}):`, error);
            }
        });
        
        // 买卖信号标记会自动跟随K线位置，无需手动调整
        if (this.originalIndicatorData[stockIndex] && this.originalIndicatorData[stockIndex].markers && this.candleSeries[stockIndex]) {
            this.candleSeries[stockIndex].setMarkers(this.originalIndicatorData[stockIndex].markers);
        }
    }
    
    /**
     * 禁用价格归一化
     */
    disableNormalization() {
        // 恢复原始数据
        this.stockInfos.forEach((stockInfo, index) => {
            if (!stockInfo || !this.originalStockData[index]) return;
            
            // 恢复原始K线数据
            if (this.candleSeries[index]) {
                this.candleSeries[index].setData(this.originalStockData[index]);
            }
            
            // 恢复原始指标数据
            this.restoreOriginalIndicators(index);
        });
        
        // 清空归一化比例
        this.normalizationRatios = [];
        console.log('📊 价格归一化已禁用，已恢复原始价格和指标');
    }
    
    /**
     * 恢复原始指标数据
     */
    restoreOriginalIndicators(stockIndex) {
        if (!this.stockIndicatorSeries[stockIndex]) return;
        
        this.stockIndicatorSeries[stockIndex].forEach(indicatorInfo => {
            const series = indicatorInfo.series || indicatorInfo; // 兼容旧格式
            const type = indicatorInfo.type;
            const originalData = indicatorInfo.originalData;
            
            if (!series || !originalData) return;
            
            try {
                if (type && (type.includes('supertrend') || type === 'ma5' || type === 'ma10')) {
                    // 恢复价格相关的指标原始数据
                    series.setData(originalData);
                }
                // 其他类型的指标（如Squeeze momentum）不需要恢复
                
            } catch (error) {
                console.warn(`恢复指标失败 (股票${stockIndex}, 类型${type}):`, error);
            }
        });
        
        // 恢复原始买卖信号标记
        if (this.originalIndicatorData[stockIndex] && this.originalIndicatorData[stockIndex].markers && this.candleSeries[stockIndex]) {
            this.candleSeries[stockIndex].setMarkers(this.originalIndicatorData[stockIndex].markers);
        }
    }
    
    /**
     * 创建合并的价格信息栏（包含股票列表）
     */
    createInfoBar() {
        // 检查是否已存在信息栏
        let infoBar = document.getElementById('price-info-bar');
        if (infoBar) {
            return infoBar;
        }
        
        // 创建信息栏容器
        infoBar = document.createElement('div');
        infoBar.id = 'price-info-bar';
        infoBar.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 8px 12px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.3;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            max-width: 95%;
            overflow: hidden;
        `;
        
        // 添加到图表容器
        this.container.style.position = 'relative';
        this.container.appendChild(infoBar);
        
        return infoBar;
    }
    
    /**
     * 更新信息栏 - 增强版本
     */
    updateInfoBar(param) {
        const infoBar = this.createInfoBar();
        
        if (!param || !param.time) {
            // 显示最新数据
            this.updateInfoBarWithLatestData();
            return;
        }
        
        // 增强的时间转换逻辑
        let timeStr = '';
        let paramTimeNum = null;
        
        try {
            console.log(`🔍 [DEBUG] 处理时间参数:`, param.time, typeof param.time);
            
            if (typeof param.time === 'number' && isFinite(param.time) && param.time > 0) {
                // 时间戳格式
                paramTimeNum = param.time;
                const date = new Date(param.time * 1000);
                if (!isNaN(date.getTime())) {
                    timeStr = date.toISOString().split('T')[0];
                } else {
                    throw new Error('Invalid date from param.time');
                }
            } else if (typeof param.time === 'string' && param.time.length > 0) {
                // 字符串格式的日期
                timeStr = param.time;
                paramTimeNum = ChartUtils.convertTimeToNumber(param.time);
                if (isNaN(paramTimeNum)) {
                    // 尝试直接解析日期字符串
                    const date = new Date(param.time);
                    if (!isNaN(date.getTime())) {
                        paramTimeNum = date.getTime() / 1000;
                        timeStr = date.toISOString().split('T')[0];
                    } else {
                        throw new Error('Cannot parse string time');
                    }
                }
            } else {
                throw new Error('Invalid param.time format');
            }
            
            console.log(`✅ [DEBUG] 时间转换成功: timeStr=${timeStr}, paramTimeNum=${paramTimeNum}`);
            
        } catch (error) {
            console.error('❌ [DEBUG] 时间转换失败:', error, 'param.time:', param.time);
            this.updateInfoBarWithLatestData();
            return;
        }
        
        // 收集所有股票的数据 - 只显示可见股票的价格数据
        const allStockData = [];
        this.stockInfos.forEach((stockInfo, index) => {
            // 只处理可见的股票
            if (stockInfo && stockInfo.data && this.stockVisibility[index] !== false) {
                console.log(`🔍 [DEBUG] 查找可见股票 ${stockInfo.code} 的数据...`);
                const stockOhlcData = this.findStockDataAtTime(stockInfo.data, paramTimeNum, timeStr);
                if (stockOhlcData) {
                    allStockData.push({
                        ...stockOhlcData,
                        stockInfo: stockInfo,
                        index: index
                    });
                    console.log(`✅ [DEBUG] 可见股票 ${stockInfo.code} 找到数据:`, stockOhlcData.close);
                } else {
                    console.log(`❌ [DEBUG] 可见股票 ${stockInfo.code} 未找到数据`);
                }
            } else if (stockInfo && this.stockVisibility[index] === false) {
                console.log(`⚪ [DEBUG] 跳过隐藏股票 ${stockInfo.code}`);
            }
        });
        
        console.log(`📊 [DEBUG] 总共找到 ${allStockData.length} 只股票的数据`);
        
        // 获取指标数据
        let indicators = {};
        if (param.seriesData) {
            param.seriesData.forEach((seriesData, index) => {
                if (seriesData && this.series[index]) {
                    const seriesTitle = this.series[index].options?.title || `Series ${index}`;
                    if (seriesTitle.includes('SuperTrend')) {
                        indicators[seriesTitle] = seriesData.value;
                    } else if (seriesTitle.includes('MA')) {
                        indicators[seriesTitle] = seriesData.value;
                    }
                }
            });
        }
        
        // 渲染信息栏
        if (allStockData.length > 0) {
            this.renderMultiStockInfoBar(infoBar, allStockData, indicators, timeStr);
        } else {
            // 即使没有找到数据，也要显示股票列表
            let html = this.renderStockListWithControls();
            html += `
                <div style="color: #666; margin-top: 6px; font-size: 11px;">
                    <span style="font-weight: bold;">${timeStr}</span> - 暂无数据
                </div>
            `;
            infoBar.innerHTML = html;
        }
    }
    
    /**
     * 渲染股票列表部分（仅控制部分，用于无数据时）- 只显示可见股票
     */
    renderStockListWithControls() {
        if (this.stockInfos.length === 0) {
            return '<div style="color: #666; font-size: 11px;">暂无股票</div>';
        }
        
        let html = '<div style="margin-bottom: 4px;">';
        
        // 渲染股票列表 - 只显示可见股票的详细信息
        this.stockInfos.forEach((stockInfo, index) => {
            if (!stockInfo) return;
            
            const isVisible = this.stockVisibility[index] !== false;
            const opacity = isVisible ? '1' : '0.5';
            const textDecoration = isVisible ? 'none' : 'line-through';
            
            html += `
                <div style="display: flex; align-items: center; margin-bottom: 3px; cursor: pointer; opacity: ${opacity}; text-decoration: ${textDecoration};" 
                     onclick="window.toggleStock(${index})" title="点击切换显示/隐藏">
                    <div style="width: 8px; height: 8px; background: ${stockInfo.colorScheme.upColor}; margin-right: 4px; border-radius: 2px; flex-shrink: 0;"></div>
                    <span style="color: #333; font-weight: ${stockInfo.isMain ? 'bold' : 'normal'}; font-size: 10px;">
                        ${stockInfo.code}${stockInfo.isMain ? ' (主)' : ''}
                    </span>
            `;
            
            // 隐藏的股票显示"已隐藏"提示
            if (!isVisible) {
                html += `<span style="font-size: 9px; color: #999; margin-left: 8px;">已隐藏</span>`;
            }
            
            html += `</div>`;
        });
        
        html += '</div>';
        return html;
    }
    
    /**
     * 渲染股票列表和价格信息在同一行 - 增强版本
     */
    renderStockListWithPrices(ohlcData, timeStr) {
        if (this.stockInfos.length === 0) {
            return '<div style="color: #666; font-size: 11px;">暂无股票</div>';
        }
        
        let html = '<div>';
        
        // 如果只有一只股票，显示股票名称和价格信息在同一行
        if (this.stockInfos.length === 1) {
            const stockInfo = this.stockInfos[0];
            const isVisible = this.stockVisibility[0] !== false;
            const opacity = isVisible ? '1' : '0.5';
            const textDecoration = isVisible ? 'none' : 'line-through';
            
            const change = ohlcData.close - ohlcData.open;
            const changePercent = ((change / ohlcData.open) * 100);
            const changeColor = change >= 0 ? '#26a69a' : '#ef5350';
            const changeSign = change >= 0 ? '+' : '';
            
            html += `
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 4px;">
                    <div style="display: flex; align-items: center; cursor: pointer; opacity: ${opacity}; text-decoration: ${textDecoration};" 
                         onclick="window.toggleStock(0)" title="点击切换显示/隐藏">
                        <div style="width: 8px; height: 8px; background: ${stockInfo.colorScheme.upColor}; margin-right: 4px; border-radius: 2px; flex-shrink: 0;"></div>
                        <span style="color: #333; font-weight: bold; font-size: 11px; margin-right: 8px;">
                            ${stockInfo.code}
                        </span>
                    </div>
                    <span style="color: #666; font-size: 10px; margin-right: 8px;">${timeStr}</span>
                    <span style="font-size: 10px;">开: <strong>${ohlcData.open.toFixed(2)}</strong></span>
                    <span style="font-size: 10px;">高: <strong style="color: #26a69a;">${ohlcData.high.toFixed(2)}</strong></span>
                    <span style="font-size: 10px;">低: <strong style="color: #ef5350;">${ohlcData.low.toFixed(2)}</strong></span>
                    <span style="font-size: 10px;">收: <strong>${ohlcData.close.toFixed(2)}</strong></span>
                    <span style="color: ${changeColor}; font-size: 10px;">
                        <strong>${changeSign}${change.toFixed(2)} (${changeSign}${changePercent.toFixed(2)}%)</strong>
                    </span>
            `;
            
            // 添加换手率信息
            if (ohlcData.turnover_rate) {
                html += `<span style="color: #666; font-size: 10px;">换手率: ${(ohlcData.turnover_rate * 100).toFixed(2)}%</span>`;
            }
            
            html += `</div>`;
        } else {
            // 多只股票时，先显示时间，然后只显示可见股票的价格信息
            html += `<div style="margin-bottom: 6px; font-size: 10px; color: #666; font-weight: bold;">${timeStr}</div>`;
            
            this.stockInfos.forEach((stockInfo, index) => {
                if (!stockInfo) return;
                
                const isVisible = this.stockVisibility[index] !== false;
                const opacity = isVisible ? '1' : '0.5';
                const textDecoration = isVisible ? 'none' : 'line-through';
                
                html += `
                    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 3px; opacity: ${opacity}; text-decoration: ${textDecoration};">
                        <div style="display: flex; align-items: center; cursor: pointer; min-width: 80px;" 
                             onclick="window.toggleStock(${index})" title="点击切换显示/隐藏">
                            <div style="width: 6px; height: 6px; background: ${stockInfo.colorScheme.upColor}; margin-right: 3px; border-radius: 2px; flex-shrink: 0;"></div>
                            <span style="color: #333; font-weight: ${stockInfo.isMain ? 'bold' : 'normal'}; font-size: 9px;">
                                ${stockInfo.code}${stockInfo.isMain ? ' (主)' : ''}
                            </span>
                        </div>
                `;
                
                // 只显示可见股票的价格数据
                if (isVisible) {
                    // 查找对应的价格数据 - 增强查找逻辑
                    let stockOhlcData = null;
                    if (stockInfo.data) {
                        // 如果传入的是单个股票数据，检查是否匹配当前股票
                        if (ohlcData && this.stockInfos.length > 1) {
                            // 多股票模式下，需要为每只股票单独查找数据
                            const paramTimeNum = ChartUtils.convertTimeToNumber(timeStr);
                            stockOhlcData = this.findStockDataAtTime(stockInfo.data, paramTimeNum, timeStr);
                        } else if (ohlcData && index === 0) {
                            // 单股票模式或主股票数据
                            stockOhlcData = ohlcData;
                        } else {
                            // 其他情况，使用查找方法
                            const paramTimeNum = ChartUtils.convertTimeToNumber(timeStr);
                            stockOhlcData = this.findStockDataAtTime(stockInfo.data, paramTimeNum, timeStr);
                        }
                    }
                    
                    if (stockOhlcData) {
                        const change = stockOhlcData.close - stockOhlcData.open;
                        const changePercent = ((change / stockOhlcData.open) * 100);
                        const changeColor = change >= 0 ? stockInfo.colorScheme.upColor : stockInfo.colorScheme.downColor;
                        const changeSign = change >= 0 ? '+' : '';
                        
                        html += `
                            <span style="font-size: 9px;">开: <strong>${stockOhlcData.open.toFixed(2)}</strong></span>
                            <span style="font-size: 9px;">高: <strong style="color: ${stockInfo.colorScheme.upColor};">${stockOhlcData.high.toFixed(2)}</strong></span>
                            <span style="font-size: 9px;">低: <strong style="color: ${stockInfo.colorScheme.downColor};">${stockOhlcData.low.toFixed(2)}</strong></span>
                            <span style="font-size: 9px;">收: <strong>${stockOhlcData.close.toFixed(2)}</strong></span>
                            <span style="color: ${changeColor}; font-size: 9px;">
                                <strong>${changeSign}${change.toFixed(2)} (${changeSign}${changePercent.toFixed(2)}%)</strong>
                            </span>
                        `;
                        
                        // 添加换手率信息
                        if (stockOhlcData.turnover_rate) {
                            html += `<span style="color: #666; font-size: 9px;">换手率: ${(stockOhlcData.turnover_rate * 100).toFixed(2)}%</span>`;
                        }
                    } else {
                        html += `<span style="font-size: 9px; color: #999;">无数据</span>`;
                    }
                } else {
                    // 隐藏的股票只显示"已隐藏"提示
                    html += `<span style="font-size: 9px; color: #999; margin-left: 8px;">已隐藏</span>`;
                }
                
                html += `</div>`;
            });
        }
        
        html += '</div>';
        return html;
    }
    
    /**
     * 渲染多股票信息栏内容 - 增强版本
     */
    renderMultiStockInfoBar(infoBar, allStockData, indicators, timeStr) {
        if (!allStockData || allStockData.length === 0) {
            let html = this.renderStockListWithControls();
            html += `
                <div style="color: #666; margin-top: 6px; font-size: 11px;">
                    <span style="font-weight: bold;">${timeStr || '当前'}</span> - 暂无数据
                </div>
            `;
            infoBar.innerHTML = html;
            return;
        }
        
        console.log(`📊 [DEBUG] 渲染多股票信息栏，股票数量: ${allStockData.length}`);
        
        // 使用增强的渲染方法，传入第一只股票的数据作为参考
        const firstStockData = allStockData[0];
        let html = this.renderStockListWithPrices(firstStockData, timeStr);
        
        // 添加价格归一化控制 - 智能版本
        const shouldNormalize = this.shouldEnableNormalization();
        const isDisabled = !shouldNormalize;
        const disabledStyle = isDisabled ? 'opacity: 0.5; cursor: not-allowed;' : 'cursor: pointer;';
        const tooltipText = isDisabled ? '价格差异小于30%，无需归一化' : '切换价格归一化显示';
        
        html += `
            <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #eee;">
                <label style="display: flex; align-items: center; ${disabledStyle} font-size: 10px;" title="${tooltipText}">
                    <input type="checkbox" ${this.normalizationEnabled ? 'checked' : ''} 
                           ${isDisabled ? 'disabled' : ''}
                           onchange="window.toggleNormalization()" style="margin-right: 4px; transform: scale(0.8);">
                    <span style="color: ${isDisabled ? '#999' : '#666'};">
                        价格归一化 ${isDisabled ? '(无需归一化)' : ''}
                    </span>
                </label>
            </div>
        `;
        
        // 添加指标信息
        if (Object.keys(indicators).length > 0) {
            html += `<div style="margin-top: 4px; display: flex; gap: 8px; flex-wrap: wrap; font-size: 10px;">`;
            for (const [name, value] of Object.entries(indicators)) {
                if (value !== null && value !== undefined) {
                    const color = name.includes('Up') ? '#26a69a' : name.includes('Down') ? '#ef5350' : '#666';
                    const shortName = name.replace(/HK\.\d+\s/, ''); // 简化指标名称
                    html += `<span style="color: ${color};">${shortName}: ${value.toFixed(2)}</span>`;
                }
            }
            html += `</div>`;
        }
        
        infoBar.innerHTML = html;
        console.log(`✅ [DEBUG] 多股票信息栏渲染完成`);
    }
    
    /**
     * 格式化成交量显示
     */
    formatVolume(volume) {
        if (volume >= 1e8) {
            return (volume / 1e8).toFixed(2) + '亿';
        } else if (volume >= 1e4) {
            return (volume / 1e4).toFixed(2) + '万';
        } else {
            return volume.toString();
        }
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
        
        // 初始化可见性状态
        this.stockVisibility[index] = true;
        
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
     * 创建成交量数据（已移除，成交量将作为独立子图显示）
     */
    createVolumeData(ohlc) {
        // 成交量已从主图中移除，将作为独立的子图显示
        console.log('📊 成交量数据创建已跳过（已从主图移除）');
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
            
            console.log(`🔍 ${indicator} API返回数据:`, {
                length: data?.length,
                sample: data?.slice(0, 3),
                lastItem: data?.[data.length - 1]
            });
            
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
                    // Squeeze Momentum 指标只在子图中显示，主图不处理
                    console.log(`📊 Squeeze Momentum 指标将在子图中显示 (股票${stockIndex})`);
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
            
            // 初始化该股票的指标系列数组
            if (!this.stockIndicatorSeries[stockIndex]) {
                this.stockIndicatorSeries[stockIndex] = [];
            }
            
            // 初始化原始指标数据存储
            if (!this.originalIndicatorData[stockIndex]) {
                this.originalIndicatorData[stockIndex] = {};
            }
            
            // 存储原始SuperTrend数据
            this.originalIndicatorData[stockIndex].supertrend = JSON.parse(JSON.stringify(data));
            
            // 处理SuperTrend数据，获取分段数据和信号点
            const processedData = this.processSupertrendDataAdvanced(data);
            
            // 存储处理后的原始数据
            this.originalIndicatorData[stockIndex].processedSupertrend = JSON.parse(JSON.stringify(processedData));
            
            // 创建多段上升趋势线
            processedData.uptrendSegments.forEach((segment, index) => {
                if (segment.length > 0) {
                    const uptrendSeries = this.addSeries('line', {
                        priceScaleId: 'right',
                        color: stockInfo.colorScheme.upColor, // 使用股票的上涨颜色
                        lineWidth: 3,
                        lastValueVisible: false,
                        priceLineVisible: false,
                        visible: this.stockVisibility[stockIndex] !== false
                    });
                    uptrendSeries.setData(segment);
                    // 记录到该股票的指标系列中，并标记类型
                    this.stockIndicatorSeries[stockIndex].push({
                        series: uptrendSeries,
                        type: 'supertrend_up',
                        originalData: segment
                    });
                }
            });
            
            // 创建多段下降趋势线
            processedData.downtrendSegments.forEach((segment, index) => {
                if (segment.length > 0) {
                    const downtrendSeries = this.addSeries('line', {
                        priceScaleId: 'right',
                        color: stockInfo.colorScheme.downColor, // 使用股票的下跌颜色
                        lineWidth: 3,
                        lastValueVisible: false,
                        priceLineVisible: false,
                        visible: this.stockVisibility[stockIndex] !== false
                    });
                    downtrendSeries.setData(segment);
                    // 记录到该股票的指标系列中，并标记类型
                    this.stockIndicatorSeries[stockIndex].push({
                        series: downtrendSeries,
                        type: 'supertrend_down',
                        originalData: segment
                    });
                }
            });
            
            // 合并买入和卖出信号标记
            const allMarkers = [];
            
            // 添加买入信号标记
            if (processedData.buySignals.length > 0) {
                const buyMarkers = processedData.buySignals.map(signal => ({
                    time: signal.time,
                    position: 'belowBar',
                    color: stockInfo.colorScheme.upColor, // 使用股票的上涨颜色
                    shape: 'arrowUp',
                    text: 'BUY',
                    size: 2
                }));
                allMarkers.push(...buyMarkers);
            }
            
            // 添加卖出信号标记
            if (processedData.sellSignals.length > 0) {
                const sellMarkers = processedData.sellSignals.map(signal => ({
                    time: signal.time,
                    position: 'aboveBar',
                    color: stockInfo.colorScheme.downColor, // 使用股票的下跌颜色
                    shape: 'arrowDown',
                    text: 'SELL',
                    size: 2
                }));
                allMarkers.push(...sellMarkers);
            }
            
            // 按时间排序并设置标记
            if (allMarkers.length > 0 && this.candleSeries[stockIndex]) {
                allMarkers.sort((a, b) => {
                    const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time * 1000;
                    const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time * 1000;
                    return timeA - timeB;
                });
                this.candleSeries[stockIndex].setMarkers(allMarkers);
                
                // 存储原始标记数据
                this.originalIndicatorData[stockIndex].markers = JSON.parse(JSON.stringify(allMarkers));
            }
            
            console.log(`✅ SuperTrend指标已添加 (股票${stockIndex}): ${processedData.uptrendSegments.length}个上升段, ${processedData.downtrendSegments.length}个下降段, ${processedData.buySignals.length}个买入信号, ${processedData.sellSignals.length}个卖出信号`);
            
        } catch (error) {
            console.error(`❌ 添加SuperTrend指标失败 (股票${stockIndex}):`, error);
        }
    }
    
    /**
     * 高级处理SuperTrend数据，生成分段线条和信号点
     */
    processSupertrendDataAdvanced(data) {
        const uptrendSegments = [];
        const downtrendSegments = [];
        const buySignals = [];
        const sellSignals = [];
        
        let currentUptrendSegment = [];
        let currentDowntrendSegment = [];
        let lastDirection = null;
        
        console.log('🔍 SuperTrend高级处理数据样本:', data.slice(0, 3));
        
        data.forEach((item, index) => {
            if (!item || !item.time) return;
            
            // 兼容不同的字段名：trend 或 supertrend_direction
            const direction = item.trend || item.supertrend_direction;
            const value = item.supertrend;
            
            // 跳过无效数据
            if (!isFinite(value) || value <= 0) return;
            
            const dataPoint = { time: item.time, value: value };
            
            // 使用API提供的买卖信号
            if (item.buy === 1) {
                buySignals.push({ time: item.time, value: value });
            }
            if (item.sell === 1) {
                sellSignals.push({ time: item.time, value: value });
            }
            
            // 处理趋势段
            if (direction === 1) {
                // 上升趋势
                if (lastDirection === -1) {
                    // 从下降趋势转为上升趋势，结束下降段
                    if (currentDowntrendSegment.length > 0) {
                        downtrendSegments.push([...currentDowntrendSegment]);
                        currentDowntrendSegment = [];
                    }
                }
                currentUptrendSegment.push(dataPoint);
            } else if (direction === -1) {
                // 下降趋势
                if (lastDirection === 1) {
                    // 从上升趋势转为下降趋势，结束上升段
                    if (currentUptrendSegment.length > 0) {
                        uptrendSegments.push([...currentUptrendSegment]);
                        currentUptrendSegment = [];
                    }
                }
                currentDowntrendSegment.push(dataPoint);
            }
            
            lastDirection = direction;
        });
        
        // 添加最后的段
        if (currentUptrendSegment.length > 0) {
            uptrendSegments.push(currentUptrendSegment);
        }
        if (currentDowntrendSegment.length > 0) {
            downtrendSegments.push(currentDowntrendSegment);
        }
        
        console.log(`📊 SuperTrend高级处理结果: ${uptrendSegments.length}个上升段, ${downtrendSegments.length}个下降段, ${buySignals.length}个买入信号, ${sellSignals.length}个卖出信号`);
        
        return {
            uptrendSegments,
            downtrendSegments,
            buySignals,
            sellSignals
        };
    }
    
    /**
     * 处理SuperTrend数据（保留原方法作为备用）
     */
    processSupertrendData(data) {
        const uptrend = [];
        const downtrend = [];
        
        console.log('🔍 SuperTrend数据样本:', data.slice(0, 3)); // 调试日志
        
        data.forEach(item => {
            if (item && item.time) {
                // 兼容不同的字段名：trend 或 supertrend_direction
                const direction = item.trend || item.supertrend_direction;
                const value = item.supertrend;
                
                // 过滤掉值为0或无效的数据点
                if (direction === 1 && value !== null && isFinite(value) && value > 0) {
                    uptrend.push({ time: item.time, value: value });
                    downtrend.push({ time: item.time, value: null });
                } else if (direction === -1 && value !== null && isFinite(value) && value > 0) {
                    downtrend.push({ time: item.time, value: value });
                    uptrend.push({ time: item.time, value: null });
                } else {
                    // 对于无效值（包括0值），不显示任何线条
                    uptrend.push({ time: item.time, value: null });
                    downtrend.push({ time: item.time, value: null });
                }
            }
        });
        
        console.log(`📊 SuperTrend处理结果: 上升趋势${uptrend.filter(d => d.value !== null && d.value > 0).length}点, 下降趋势${downtrend.filter(d => d.value !== null && d.value > 0).length}点`);
        
        return { uptrend, downtrend };
    }
    
    /**
     * 添加移动平均线指标
     */
    addMAIndicator(data, indicator, stockIndex) {
        try {
            const stockInfo = this.stockInfos[stockIndex];
            if (!stockInfo) return;
            
            // 初始化该股票的指标系列数组
            if (!this.stockIndicatorSeries[stockIndex]) {
                this.stockIndicatorSeries[stockIndex] = [];
            }
            
            // 初始化原始指标数据存储
            if (!this.originalIndicatorData[stockIndex]) {
                this.originalIndicatorData[stockIndex] = {};
            }
            
            const maData = data
                .filter(item => item && item.time && item.ma !== null && isFinite(item.ma))
                .map(item => ({ time: item.time, value: item.ma }));
            
            if (maData.length === 0) {
                console.warn(`⚠️ ${indicator} 没有有效数据 (股票${stockIndex})`);
                return;
            }
            
            // 存储原始MA数据
            this.originalIndicatorData[stockIndex][indicator] = JSON.parse(JSON.stringify(maData));
            
            const maSeries = this.addSeries('line', {
                priceScaleId: 'right',
                color: indicator === 'ma5' ? '#ff6b6b' : '#4ecdc4',
                lineWidth: 1,
                lastValueVisible: false,
                priceLineVisible: false,
                visible: this.stockVisibility[stockIndex] !== false
            });
            
            maSeries.setData(maData);
            
            // 记录到该股票的指标系列中，并标记类型
            this.stockIndicatorSeries[stockIndex].push({
                series: maSeries,
                type: indicator,
                originalData: maData
            });
            
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
        
        // 智能检查是否需要归一化
        const shouldNormalize = this.shouldEnableNormalization();
        if (!shouldNormalize && this.normalizationEnabled) {
            // 如果当前启用了归一化但实际不需要，自动禁用
            this.normalizationEnabled = false;
            this.disableNormalization();
            console.log(`📊 数据加载完成：自动禁用归一化（价格差异小于30%）`);
        }
        
        // 适配内容到数据范围（仅在首次加载时）
        if (this.chart && !this._hasInitialFit) {
            try {
                // 首先使用默认的fitContent
                this.chart.timeScale().fitContent();
                
                // 然后调整到可见股票的范围
                setTimeout(() => {
                    this.adjustTimeRangeToVisibleStocks();
                }, 100);
                
                this._hasInitialFit = true;
                console.log('📊 MainChart 数据加载完成，已适配内容');
            } catch (error) {
                console.warn('适配内容失败:', error);
            }
        }
        
        // 诊断时间轴配置
        this.diagnoseTimeScale();
        
        // 优化价格范围显示
        setTimeout(() => {
            this.optimizePriceRange();
        }, 200);
        
        // 初始化价格信息栏（已包含股票列表）
        setTimeout(() => {
            this.updateInfoBarWithLatestData();
        }, 100);
        
        // 加载成交量数据到子图
        setTimeout(() => {
            this.loadVolumeDataToSubChart();
        }, 200);
        
        // 加载Squeeze数据到子图
        setTimeout(() => {
            this.loadSqueezeDataToSubChart();
        }, 250);
    }
    
    /**
     * 诊断时间轴配置
     */
    diagnoseTimeScale() {
        if (!this.chart) return;
        
        try {
            const timeScaleOptions = this.chart.timeScale().options();
            console.log('🔍 [DIAGNOSIS] 时间轴完整配置:', timeScaleOptions);
            
            // 检查关键配置项
            const criticalOptions = {
                fixLeftEdge: timeScaleOptions.fixLeftEdge,
                fixRightEdge: timeScaleOptions.fixRightEdge,
                lockVisibleTimeRangeOnResize: timeScaleOptions.lockVisibleTimeRangeOnResize,
                barSpacing: timeScaleOptions.barSpacing,
                rightOffset: timeScaleOptions.rightOffset,
                visible: timeScaleOptions.visible,
                minBarSpacing: timeScaleOptions.minBarSpacing
            };
            
            console.log('🔍 [DIAGNOSIS] 关键时间轴配置:', criticalOptions);
            
            // 检查是否有配置阻止缩放
            const blockingZoom = [];
            if (timeScaleOptions.fixLeftEdge) blockingZoom.push('fixLeftEdge=true');
            if (timeScaleOptions.fixRightEdge) blockingZoom.push('fixRightEdge=true');
            if (timeScaleOptions.lockVisibleTimeRangeOnResize) blockingZoom.push('lockVisibleTimeRangeOnResize=true');
            
            if (blockingZoom.length > 0) {
                console.warn('⚠️ [DIAGNOSIS] 发现可能阻止缩放的配置:', blockingZoom);
                
                // 尝试强制修复
                console.log('🔧 [DIAGNOSIS] 尝试强制修复时间轴配置...');
                this.chart.timeScale().applyOptions({
                    fixLeftEdge: false,
                    fixRightEdge: false,
                    lockVisibleTimeRangeOnResize: false
                });
                
                // 再次检查
                const fixedOptions = this.chart.timeScale().options();
                console.log('🔍 [DIAGNOSIS] 修复后的配置:', {
                    fixLeftEdge: fixedOptions.fixLeftEdge,
                    fixRightEdge: fixedOptions.fixRightEdge,
                    lockVisibleTimeRangeOnResize: fixedOptions.lockVisibleTimeRangeOnResize
                });
            } else {
                console.log('✅ [DIAGNOSIS] 时间轴配置正常，应该可以缩放');
                
                // 添加鼠标事件监听来调试缩放问题
                this.addZoomDebugListeners();
            }
            
        } catch (error) {
            console.error('❌ [DIAGNOSIS] 时间轴诊断失败:', error);
        }
    }
    
    /**
     * 添加缩放调试监听器
     */
    addZoomDebugListeners() {
        if (!this.container) return;
        
        console.log('🔧 [DEBUG] 添加缩放调试监听器...');
        
        // 监听鼠标滚轮事件
        this.container.addEventListener('wheel', (event) => {
            console.log('🖱️ [DEBUG] 检测到滚轮事件:', {
                deltaY: event.deltaY,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                target: event.target.tagName,
                defaultPrevented: event.defaultPrevented
            });
            
            // 如果事件被阻止，尝试手动处理缩放
            if (event.defaultPrevented) {
                this.handleManualZoom(event);
                
                // 只在第一次显示提示
                if (!this._zoomTipShown) {
                    console.log('✅ [INFO] 缩放功能已通过手动实现恢复，可以正常使用鼠标滚轮缩放');
                    this._zoomTipShown = true;
                }
            }
        }, { passive: true });
        
        // 监听键盘事件
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.shiftKey) {
                console.log('⌨️ [DEBUG] 检测到修饰键:', {
                    key: event.key,
                    ctrlKey: event.ctrlKey,
                    shiftKey: event.shiftKey
                });
            }
        });
        
        // 尝试手动测试缩放功能
        setTimeout(() => {
            this.testZoomFunctionality();
        }, 1000);
    }
    
    /**
     * 测试缩放功能
     */
    testZoomFunctionality() {
        if (!this.chart) return;
        
        try {
            console.log('🧪 [TEST] 测试时间轴缩放功能...');
            
            // 获取当前可见范围
            const currentRange = this.chart.timeScale().getVisibleRange();
            console.log('🔍 [TEST] 当前可见范围:', currentRange);
            
            // 尝试程序化缩放
            if (currentRange) {
                // 转换时间格式为数字
                let fromTime, toTime;
                
                if (typeof currentRange.from === 'string') {
                    fromTime = ChartUtils.convertTimeToNumber(currentRange.from);
                    toTime = ChartUtils.convertTimeToNumber(currentRange.to);
                } else {
                    fromTime = currentRange.from;
                    toTime = currentRange.to;
                }
                
                console.log('🔍 [TEST] 转换后的时间:', { fromTime, toTime });
                
                if (!isNaN(fromTime) && !isNaN(toTime)) {
                    const duration = toTime - fromTime;
                    const newRange = {
                        from: fromTime + duration * 0.1,
                        to: toTime - duration * 0.1
                    };
                    
                    console.log('🔧 [TEST] 尝试程序化缩放到:', newRange);
                    this.chart.timeScale().setVisibleRange(newRange);
                    
                    // 检查是否成功
                    setTimeout(() => {
                        const afterRange = this.chart.timeScale().getVisibleRange();
                        console.log('🔍 [TEST] 缩放后的范围:', afterRange);
                        
                        const afterFromTime = typeof afterRange.from === 'string' ? 
                            ChartUtils.convertTimeToNumber(afterRange.from) : afterRange.from;
                        const afterToTime = typeof afterRange.to === 'string' ? 
                            ChartUtils.convertTimeToNumber(afterRange.to) : afterRange.to;
                        
                        // 检查时间范围是否发生了变化（不需要精确匹配）
                        const originalDuration = toTime - fromTime;
                        const newDuration = afterToTime - afterFromTime;
                        const durationChanged = Math.abs(newDuration - originalDuration) > originalDuration * 0.05; // 5%的变化
                        
                        if (afterRange && durationChanged) {
                            console.log('✅ [TEST] 程序化缩放成功！时间轴缩放功能正常');
                            console.log('🔍 [TEST] 原始时长:', originalDuration, '新时长:', newDuration);
                        } else {
                            console.log('❌ [TEST] 程序化缩放失败，时间范围没有明显变化');
                            console.log('🔍 [TEST] 原始时长:', originalDuration, '新时长:', newDuration);
                        }
                    }, 100);
                } else {
                    console.log('❌ [TEST] 时间转换失败');
                }
            }
            
        } catch (error) {
            console.error('❌ [TEST] 缩放功能测试失败:', error);
        }
    }
    
    /**
     * 手动处理缩放
     */
    handleManualZoom(event) {
        if (!this.chart) return;
        
        try {
            // 标记用户正在缩放，避免价格范围优化干扰
            this._userIsZooming = true;
            
            // 获取当前可见范围
            const currentRange = this.chart.timeScale().getVisibleRange();
            if (!currentRange) return;
            
            // 转换时间格式
            let fromTime, toTime;
            if (typeof currentRange.from === 'string') {
                fromTime = ChartUtils.convertTimeToNumber(currentRange.from);
                toTime = ChartUtils.convertTimeToNumber(currentRange.to);
            } else {
                fromTime = currentRange.from;
                toTime = currentRange.to;
            }
            
            if (isNaN(fromTime) || isNaN(toTime)) return;
            
            // 计算缩放因子 - 增加缩放幅度让效果更明显
            const zoomFactor = event.deltaY > 0 ? 1.2 : 0.8; // 向下滚动放大，向上滚动缩小
            const duration = toTime - fromTime;
            const center = (fromTime + toTime) / 2;
            const newDuration = duration * zoomFactor;
            
            // 计算新的时间范围
            const newRange = {
                from: center - newDuration / 2,
                to: center + newDuration / 2
            };
            
            // 简化日志输出，只在调试模式下显示详细信息
            if (window.DEBUG_ZOOM) {
                console.log('🔧 [MANUAL] 手动缩放:', {
                    direction: event.deltaY > 0 ? 'zoom out' : 'zoom in',
                    zoomFactor,
                    oldRange: { from: fromTime, to: toTime },
                    newRange
                });
            } else {
                // 简化输出，只显示缩放方向
                console.log(`🔧 [ZOOM] ${event.deltaY > 0 ? '放大' : '缩小'} (${zoomFactor}x)`);
            }
            
            // 应用新的时间范围
            this.chart.timeScale().setVisibleRange(newRange);
            
            // 延迟清除缩放标记
            setTimeout(() => {
                this._userIsZooming = false;
            }, 500);
            
        } catch (error) {
            console.error('❌ [MANUAL] 手动缩放失败:', error);
            this._userIsZooming = false;
        }
    }
    
    /**
     * 优化价格范围显示，确保价格数据居中，减少下方空白
     */
    optimizePriceRange() {
        try {
            if (!this.chart || !this.candleSeries[0]) {
                console.log('⚠️ 没有图表或K线系列，跳过价格范围优化');
                return;
            }
            
            // 重新配置主价格轴，使价格数据居中显示
            this.chart.priceScale('right').applyOptions({
                scaleMargins: { top: 0.08, bottom: 0.08 },  // 上下各留8%空间，居中显示
                alignLabels: true,
                borderVisible: true,
                autoScale: true,
                mode: 1,  // 正常模式
                entireTextOnly: false,  // 允许部分文本显示
                minimumWidth: 60  // 最小宽度
            });
            
            // 调整Squeeze指标的位置，给主图更多空间
            this.chart.priceScale('squeeze').applyOptions({
                scaleMargins: { top: 0.82, bottom: 0.0 },   // Squeeze占底部18%
                alignLabels: true,
                borderVisible: true,
                borderColor: '#B0B0B0',
                autoScale: true,
                mode: 0
            });
            
            // 强制重新计算价格范围（但不影响时间轴）
            setTimeout(() => {
                try {
                    // 不使用fitContent，避免覆盖用户的缩放操作
                    // 只重新计算价格轴的自动缩放
                    if (this.candleSeries[0]) {
                        // 触发价格轴的自动缩放重新计算
                        this.chart.priceScale('right').applyOptions({ autoScale: true });
                        this.chart.priceScale('squeeze').applyOptions({ autoScale: true });
                    }
                    console.log('✅ 价格范围已优化，主图(8-82%)，Squeeze(82-100%)');
                } catch (error) {
                    console.error('❌ 强制重新计算价格范围失败:', error);
                }
            }, 50);
            
        } catch (error) {
            console.error('❌ 优化价格范围失败:', error);
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
        this.stockIndicatorSeries = [];
        this.originalIndicatorData = [];
        
        // 清空股票信息
        this.stockInfos = [];
        this.originalStockData = [];
        this.currentOhlcData = null;
        
        // 重置状态
        this.normalizationEnabled = false;
        this.normalizationRatios = [];
            
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
        
        // 清理价格信息栏（包含股票列表）
        const infoBar = document.getElementById('price-info-bar');
        if (infoBar) {
            infoBar.remove();
        }
        
        // 清理可能存在的独立股票图例
        const legend = document.getElementById('stock-legend');
        if (legend) {
            legend.remove();
        }
        this.legendContainer = null;
        
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
            // 销毁成交量子图
            this.destroyVolumeSubChart();
            
            // 销毁Squeeze子图
            this.destroySqueezeSubChart();
            
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
    
    /**
     * 使用最新数据更新信息栏
     */
    updateInfoBarWithLatestData() {
        const infoBar = this.createInfoBar();
        
        if (this.stockInfos.length === 0 || !this.stockInfos[0].data) {
            infoBar.innerHTML = '<div style="color: #666;">暂无数据</div>';
            return;
        }
        
        const latestData = this.stockInfos[0].data[this.stockInfos[0].data.length - 1];
        this.renderInfoBar(infoBar, latestData, {}, latestData.time);
    }
    
    /**
     * 渲染信息栏内容（股票列表和价格信息在同一行）
     */
    renderInfoBar(infoBar, ohlcData, indicators, timeStr) {
        if (!ohlcData) {
            let html = this.renderStockListWithControls();
            html += `
                <div style="color: #666; margin-top: 6px; font-size: 11px;">
                    <span style="font-weight: bold;">${timeStr || '当前'}</span> - 暂无数据
                </div>
            `;
            infoBar.innerHTML = html;
            return;
        }
        
        // 计算涨跌幅
        const change = ohlcData.close - ohlcData.open;
        const changePercent = ((change / ohlcData.open) * 100);
        const changeColor = change >= 0 ? '#26a69a' : '#ef5350';
        const changeSign = change >= 0 ? '+' : '';
        
        // 渲染股票列表和价格信息在同一行
        let html = this.renderStockListWithPrices(ohlcData, timeStr);
        
        // 添加价格归一化控制 - 智能版本
        const shouldNormalize = this.shouldEnableNormalization();
        const isDisabled = !shouldNormalize;
        const disabledStyle = isDisabled ? 'opacity: 0.5; cursor: not-allowed;' : 'cursor: pointer;';
        const tooltipText = isDisabled ? '价格差异小于30%，无需归一化' : '切换价格归一化显示';
        
        html += `
            <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #eee;">
                <label style="display: flex; align-items: center; ${disabledStyle} font-size: 10px;" title="${tooltipText}">
                    <input type="checkbox" ${this.normalizationEnabled ? 'checked' : ''} 
                           ${isDisabled ? 'disabled' : ''}
                           onchange="window.toggleNormalization()" style="margin-right: 4px; transform: scale(0.8);">
                    <span style="color: ${isDisabled ? '#999' : '#666'};">
                        价格归一化 ${isDisabled ? '(无需归一化)' : ''}
                    </span>
                </label>
            </div>
        `;
        
        // 添加指标信息
        if (Object.keys(indicators).length > 0) {
            html += `<div style="margin-top: 4px; display: flex; gap: 8px; flex-wrap: wrap; font-size: 10px;">`;
            for (const [name, value] of Object.entries(indicators)) {
                if (value !== null && value !== undefined) {
                    const color = name.includes('Up') ? '#26a69a' : name.includes('Down') ? '#ef5350' : '#666';
                    const shortName = name.replace(/HK\.\d+\s/, ''); // 简化指标名称
                    html += `<span style="color: ${color};">${shortName}: ${value.toFixed(2)}</span>`;
                }
            }
            html += `</div>`;
        }
        
        infoBar.innerHTML = html;
    }
    
    /**
     * 在股票数据中查找指定时间的数据 - 增强版本
     */
    findStockDataAtTime(stockData, paramTimeNum, timeStr) {
        if (!stockData || !Array.isArray(stockData) || stockData.length === 0) {
            return null;
        }
        
        console.log(`🔍 [DEBUG] 查找数据: paramTimeNum=${paramTimeNum}, timeStr=${timeStr}, 数据长度=${stockData.length}`);
        
        // 方法1: 精确时间戳匹配（扩大容差到30秒）
        let stockOhlcData = stockData.find(item => {
            const itemTimeNum = ChartUtils.convertTimeToNumber(item.time);
            const diff = Math.abs(itemTimeNum - paramTimeNum);
            return diff < 30; // 30秒容差
        });
        
        if (stockOhlcData) {
            console.log(`✅ [DEBUG] 精确匹配成功`);
            return stockOhlcData;
        }
        
        // 方法2: 字符串时间匹配
        stockOhlcData = stockData.find(item => {
            if (typeof item.time === 'string') {
                return item.time === timeStr || item.time.startsWith(timeStr);
            }
            return false;
        });
        
        if (stockOhlcData) {
            console.log(`✅ [DEBUG] 字符串匹配成功`);
            return stockOhlcData;
        }
        
        // 方法3: 日期字符串匹配（处理时间戳转换）
        stockOhlcData = stockData.find(item => {
            const itemTimeNum = ChartUtils.convertTimeToNumber(item.time);
            if (!isNaN(itemTimeNum)) {
                const itemDateStr = new Date(itemTimeNum * 1000).toISOString().split('T')[0];
                return itemDateStr === timeStr;
            }
            return false;
        });
        
        if (stockOhlcData) {
            console.log(`✅ [DEBUG] 日期字符串匹配成功`);
            return stockOhlcData;
        }
        
        // 方法4: 最接近时间点匹配（扩大到3天容差）
        let closestData = null;
        let minDiff = Infinity;
        
        stockData.forEach(item => {
            const itemTimeNum = ChartUtils.convertTimeToNumber(item.time);
            if (!isNaN(itemTimeNum)) {
                const diff = Math.abs(itemTimeNum - paramTimeNum);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestData = item;
                }
            }
        });
        
        // 只有时间差在3天内才使用
        if (closestData && minDiff <= 259200) { // 259200秒 = 3天
            console.log(`✅ [DEBUG] 最接近匹配成功，时间差: ${minDiff}秒`);
            return closestData;
        }
        
        console.log(`❌ [DEBUG] 所有匹配方法都失败`);
        return null;
    }
    
    /**
     * 检查是否需要价格归一化
     * 只检查可见股票与主股票的价格相差是否小于30%
     */
    shouldEnableNormalization() {
        if (this.stockInfos.length <= 1) {
            return false; // 单股票不需要归一化
        }
        
        // 找到第一个可见的股票作为主股票
        let mainStock = null;
        let mainStockIndex = -1;
        for (let i = 0; i < this.stockInfos.length; i++) {
            if (this.stockVisibility[i] !== false && this.stockInfos[i] && this.stockInfos[i].data && this.stockInfos[i].data.length > 0) {
                mainStock = this.stockInfos[i];
                mainStockIndex = i;
                break;
            }
        }
        
        if (!mainStock) {
            return false; // 没有可见股票
        }
        
        // 获取主股票的最新价格作为参考
        const mainPrice = mainStock.data[mainStock.data.length - 1].close;
        
        console.log(`📊 [归一化检查] 主股票 ${mainStock.code} 参考价格: ${mainPrice} (可见股票)`);
        
        // 检查其他可见股票与主股票的价格差异
        let visibleStockCount = 0;
        for (let i = 0; i < this.stockInfos.length; i++) {
            // 跳过隐藏的股票和主股票本身
            if (i === mainStockIndex || this.stockVisibility[i] === false) {
                if (this.stockVisibility[i] === false) {
                    console.log(`⚪ [归一化检查] 跳过隐藏股票 ${this.stockInfos[i]?.code}`);
                }
                continue;
            }
            
            const stock = this.stockInfos[i];
            if (!stock || !stock.data || stock.data.length === 0) {
                continue;
            }
            
            visibleStockCount++;
            const stockPrice = stock.data[stock.data.length - 1].close;
            const priceDiff = Math.abs(stockPrice - mainPrice) / mainPrice;
            
            console.log(`📊 [归一化检查] 可见股票 ${stock.code} 价格: ${stockPrice}, 与主股票差异: ${(priceDiff * 100).toFixed(2)}%`);
            
            // 如果任何一只可见股票与主股票价格相差超过30%，则需要归一化
            if (priceDiff > 0.3) {
                console.log(`✅ [归一化检查] 需要归一化：${stock.code} 与主股票价格差异超过30%`);
                return true;
            }
        }
        
        if (visibleStockCount === 0) {
            console.log(`⚪ [归一化检查] 只有一只可见股票，不需要归一化`);
            return false;
        }
        
        console.log(`⚪ [归一化检查] 不需要归一化：所有可见股票价格差异都小于30%`);
        return false;
    }
    
    /**
     * 智能切换价格归一化
     */
    smartToggleNormalization() {
        // 检查是否需要归一化
        const shouldNormalize = this.shouldEnableNormalization();
        
        if (!shouldNormalize) {
            // 如果不需要归一化，强制禁用
            if (this.normalizationEnabled) {
                this.normalizationEnabled = false;
                this.disableNormalization();
                console.log(`📊 智能归一化：已自动禁用（价格差异小于30%）`);
            }
            return false; // 返回false表示不允许手动启用
        }
        
        // 如果需要归一化，允许手动切换
        this.normalizationEnabled = !this.normalizationEnabled;
        
        if (this.normalizationEnabled) {
            this.enableNormalization();
        } else {
            this.disableNormalization();
        }
        
        this.updateInfoBarWithLatestData();
        console.log(`📊 智能归一化：已${this.normalizationEnabled ? '启用' : '禁用'}`);
        return true; // 返回true表示成功切换
    }
    
    /**
     * 创建成交量子图
     */
    createVolumeSubChart(parentContainer) {
        try {
            // 创建成交量容器
            this.volumeContainer = document.createElement('div');
            this.volumeContainer.id = 'volume-chart-container';
            this.volumeContainer.style.cssText = `
                width: 100%;
                height: 150px;
                margin-top: 2px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: white;
                box-sizing: border-box;
            `;
            
            // 添加标题
            const titleDiv = document.createElement('div');
            titleDiv.style.cssText = `
                padding: 3px 10px;
                background: #f8f9fa;
                border-bottom: 1px solid #ddd;
                font-size: 11px;
                font-weight: bold;
                color: #666;
                height: 20px;
                line-height: 14px;
                box-sizing: border-box;
            `;
            titleDiv.textContent = '成交量';
            this.volumeContainer.appendChild(titleDiv);
            
            // 创建图表容器
            const chartDiv = document.createElement('div');
            chartDiv.style.cssText = `
                width: 100%;
                height: 128px;
                box-sizing: border-box;
            `;
            this.volumeContainer.appendChild(chartDiv);
            
            // 添加到父容器
            parentContainer.appendChild(this.volumeContainer);
            
            // 创建成交量图表
            this.volumeChart = new VolumeChart(chartDiv);
            this.volumeChart.create();
            
            // 添加到子图列表
            this.addSubChart(this.volumeChart);
            
            console.log('✅ 成交量子图创建完成');
            return this.volumeChart;
            
        } catch (error) {
            console.error('❌ 创建成交量子图失败:', error);
            return null;
        }
    }
    
    /**
     * 加载主股票的成交量数据到子图
     */
    async loadVolumeDataToSubChart() {
        if (!this.volumeChart || this.stockInfos.length === 0) {
            console.warn('⚠️ 成交量子图未创建或无股票数据');
            return;
        }
        
        try {
            // 获取主股票（第一只股票）的代码
            const mainStockCode = this.stockInfos[0].code;
            
            // 加载成交量数据
            await this.volumeChart.loadVolumeData(mainStockCode);
            
            console.log(`✅ 主股票 ${mainStockCode} 成交量数据已加载到子图`);
            
        } catch (error) {
            console.error('❌ 加载成交量数据到子图失败:', error);
        }
    }
    
    /**
     * 同步时间轴到成交量子图
     */
    syncTimeRangeToVolumeChart(timeRange) {
        if (this.volumeChart && timeRange) {
            // 检查成交量子图是否有数据系列，避免不必要的警告
            if (this.volumeChart.series && this.volumeChart.series.length > 0) {
                this.volumeChart.setTimeRange(timeRange);
            } else {
                // 如果成交量子图还没有数据系列，延迟同步
                setTimeout(() => {
                    if (this.volumeChart && this.volumeChart.series && this.volumeChart.series.length > 0) {
                        this.volumeChart.setTimeRange(timeRange);
                    }
                }, 100);
            }
        }
    }
    
    /**
     * 销毁成交量子图
     */
    destroyVolumeSubChart() {
        try {
            if (this.volumeChart) {
                this.volumeChart.destroy();
                this.volumeChart = null;
            }
            
            if (this.volumeContainer && this.volumeContainer.parentNode) {
                this.volumeContainer.parentNode.removeChild(this.volumeContainer);
                this.volumeContainer = null;
            }
            
            console.log('✅ 成交量子图已销毁');
            
        } catch (error) {
            console.error('❌ 销毁成交量子图失败:', error);
        }
    }
    
    /**
     * 创建Squeeze子图
     */
    createSqueezeSubChart(parentContainer) {
        try {
            // 创建Squeeze容器
            this.squeezeContainer = document.createElement('div');
            this.squeezeContainer.id = 'squeeze-chart-container';
            this.squeezeContainer.style.cssText = `
                width: 100%;
                height: 150px;
                margin-top: 2px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: white;
                box-sizing: border-box;
            `;
            
            // 添加标题
            const titleDiv = document.createElement('div');
            titleDiv.style.cssText = `
                padding: 3px 10px;
                background: #f8f9fa;
                border-bottom: 1px solid #ddd;
                font-size: 11px;
                font-weight: bold;
                color: #666;
                height: 20px;
                line-height: 14px;
                box-sizing: border-box;
            `;
            titleDiv.textContent = 'Squeeze Momentum';
            this.squeezeContainer.appendChild(titleDiv);
            
            // 创建图表容器
            const chartDiv = document.createElement('div');
            chartDiv.style.cssText = `
                width: 100%;
                height: 128px;
                box-sizing: border-box;
            `;
            this.squeezeContainer.appendChild(chartDiv);
            
            // 添加到父容器
            parentContainer.appendChild(this.squeezeContainer);
            
            // 创建Squeeze图表
            this.squeezeChart = new SqueezeChart(chartDiv);
            this.squeezeChart.create();
            
            // 添加到子图列表
            this.addSubChart(this.squeezeChart);
            
            console.log('✅ Squeeze子图创建完成');
            return this.squeezeChart;
            
        } catch (error) {
            console.error('❌ 创建Squeeze子图失败:', error);
            return null;
        }
    }
    
    /**
     * 加载主股票的Squeeze数据到子图
     */
    async loadSqueezeDataToSubChart() {
        if (!this.squeezeChart || this.stockInfos.length === 0) {
            console.warn('⚠️ Squeeze子图未创建或无股票数据');
            return;
        }
        
        try {
            // 获取主股票（第一只股票）的代码
            const mainStockCode = this.stockInfos[0].code;
            
            // 加载Squeeze数据
            await this.squeezeChart.loadSqueezeData(mainStockCode);
            
            console.log(`✅ 主股票 ${mainStockCode} Squeeze数据已加载到子图`);
            
        } catch (error) {
            console.error('❌ 加载Squeeze数据到子图失败:', error);
        }
    }
    
    /**
     * 同步时间轴到Squeeze子图
     */
    syncTimeRangeToSqueezeChart(timeRange) {
        if (this.squeezeChart && timeRange) {
            // 检查Squeeze子图是否有数据系列，避免不必要的警告
            if (this.squeezeChart.series && this.squeezeChart.series.length > 0) {
                this.squeezeChart.setTimeRange(timeRange);
            } else {
                // 如果Squeeze子图还没有数据系列，延迟同步
                setTimeout(() => {
                    if (this.squeezeChart && this.squeezeChart.series && this.squeezeChart.series.length > 0) {
                        this.squeezeChart.setTimeRange(timeRange);
                    }
                }, 100);
            }
        }
    }
    
    /**
     * 销毁Squeeze子图
     */
    destroySqueezeSubChart() {
        try {
            if (this.squeezeChart) {
                this.squeezeChart.destroy();
                this.squeezeChart = null;
            }
            
            if (this.squeezeContainer && this.squeezeContainer.parentNode) {
                this.squeezeContainer.parentNode.removeChild(this.squeezeContainer);
                this.squeezeContainer = null;
            }
            
            console.log('✅ Squeeze子图已销毁');
            
        } catch (error) {
            console.error('❌ 销毁Squeeze子图失败:', error);
        }
    }
}

// ================================
// Volume Chart Class
// ================================
class VolumeChart extends BaseChart {
    constructor(container) {
        super(container, ChartConfig.getChartConfig('volume'));
        
        // 成交量图特有属性
        this.volumeSeries = null;
        this.mainStockData = null;
        
        console.log(`📊 VolumeChart 已创建: ${this.id}`);
    }
    
    onCreated() {
        console.log('🚀 VolumeChart.onCreated() 开始初始化...');
        
        // 设置成交量图的价格轴配置
        this.setupVolumeScale();
        
        // 禁用子图的独立缩放和滚动
        this.disableIndependentInteractions();
        
        console.log('✅ VolumeChart 初始化完成');
    }
    
    /**
     * 设置成交量价格轴
     */
    setupVolumeScale() {
        try {
            const volumePriceScaleOptions = {
                scaleMargins: { top: 0.05, bottom: 0.05 },
                alignLabels: true,
                borderVisible: true,
                autoScale: true,
                mode: 0, // 正常模式
                minimumWidth: 80, // 与主图保持一致的最小宽度
                entireTextOnly: false,
                priceFormat: {
                    type: 'volume'
                }
            };
            
            console.log('🔧 [DEBUG] 配置成交量价格轴:', volumePriceScaleOptions);
            this.chart.priceScale('right').applyOptions(volumePriceScaleOptions);
            
            // 确保时间轴配置与主图一致
            this.chart.timeScale().applyOptions({
                rightOffset: 12,
                barSpacing: 6,
                fixLeftEdge: false,
                fixRightEdge: false,
                lockVisibleTimeRangeOnResize: false
            });
            
            console.log('✅ 成交量价格轴已配置完成');
        } catch (error) {
            console.error('❌ 成交量价格轴配置失败:', error);
        }
    }
    
    /**
     * 加载主股票的成交量数据
     */
    async loadVolumeData(stockCode) {
        try {
            console.log(`📊 开始加载成交量数据: ${stockCode}`);
            
            // 获取K线数据（包含成交量）
            const response = await fetch(`/api/kline?code=${stockCode}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const ohlcData = await response.json();
            
            if (!ohlcData || !Array.isArray(ohlcData) || ohlcData.length === 0) {
                console.error(`❌ ${stockCode}: 成交量数据无效`);
                return;
            }
            
            // 存储主股票数据
            this.mainStockData = ohlcData;
            
            // 创建成交量系列
            this.createVolumeSeries(ohlcData);
            
            console.log(`✅ 成交量数据加载完成: ${stockCode}`);
            
        } catch (error) {
            console.error(`❌ 加载成交量数据失败: ${stockCode}`, error);
            throw error;
        }
    }
    
    /**
     * 创建成交量系列
     */
    createVolumeSeries(ohlcData) {
        try {
            // 处理成交量数据
            const volumeData = this.processVolumeData(ohlcData);
            
            if (volumeData.length === 0) {
                console.warn('⚠️ 没有有效的成交量数据');
                return;
            }
            
            // 创建成交量柱状图系列
            this.volumeSeries = this.addSeries('histogram', {
                priceScaleId: 'right',
                priceFormat: {
                    type: 'volume'
                },
                color: '#26a69a',
                priceLineVisible: false,
                lastValueVisible: true
            });
            
            if (!this.volumeSeries) {
                console.error('❌ 成交量系列创建失败');
                return;
            }
            
            // 设置成交量数据
            this.volumeSeries.setData(volumeData);
            
            console.log(`✅ 成交量系列创建完成，数据点: ${volumeData.length}`);
            
        } catch (error) {
            console.error('❌ 创建成交量系列失败:', error);
        }
    }
    
    /**
     * 处理成交量数据
     */
    processVolumeData(ohlcData) {
        const volumeData = [];
        
        ohlcData.forEach(item => {
            if (item && item.time && item.volume !== undefined && item.volume !== null) {
                // 根据涨跌情况设置颜色
                const color = item.close >= item.open ? '#26a69a' : '#ef5350';
                
                volumeData.push({
                    time: item.time,
                    value: item.volume,
                    color: color
                });
            }
        });
        
        console.log(`📊 成交量数据处理完成: ${volumeData.length} 个数据点`);
        return volumeData;
    }
    
    /**
     * 更新成交量数据
     */
    updateVolumeData(newData) {
        if (this.volumeSeries && newData) {
            const volumeData = this.processVolumeData(newData);
            this.volumeSeries.setData(volumeData);
            console.log('📊 成交量数据已更新');
        }
    }
    
    /**
     * 清空成交量数据
     */
    clearVolumeData() {
        if (this.volumeSeries) {
            this.volumeSeries.setData([]);
        }
        this.mainStockData = null;
        console.log('📊 成交量数据已清空');
    }
    
    /**
     * 获取源名称
     */
    getSourceName() {
        return 'volume';
    }
    
    /**
     * 销毁图表
     */
    destroy() {
        try {
            this.volumeSeries = null;
            this.mainStockData = null;
            
            // 调用父类销毁方法
            super.destroy();
            
            console.log(`📊 VolumeChart 已销毁: ${this.id}`);
            
        } catch (error) {
            console.error('❌ VolumeChart 销毁失败:', error);
        }
    }
}

// ================================
// Squeeze Chart Class
// ================================
class SqueezeChart extends BaseChart {
    constructor(container) {
        super(container, ChartConfig.getChartConfig('indicator'));
        
        // Squeeze图特有属性
        this.momentumSeries = null;
        this.zeroLineSeries = null;
        this.mainStockData = null;
        
        console.log(`📊 SqueezeChart 已创建: ${this.id}`);
    }
    
    onCreated() {
        console.log('🚀 SqueezeChart.onCreated() 开始初始化...');
        
        // 设置Squeeze图的价格轴配置
        this.setupSqueezeScale();
        
        // 禁用子图的独立缩放和滚动
        this.disableIndependentInteractions();
        
        console.log('✅ SqueezeChart 初始化完成');
    }

    
    /**
     * 设置Squeeze价格轴
     */
    setupSqueezeScale() {
        try {
            const squeezePriceScaleOptions = {
                scaleMargins: { top: 0.05, bottom: 0.05 },
                alignLabels: true,
                borderVisible: true,
                autoScale: true,
                mode: 0, // 正常模式
                minimumWidth: 80, // 与主图保持一致的最小宽度
                entireTextOnly: false,
                priceFormat: {
                    type: 'price',
                    precision: 4,
                    minMove: 0.0001
                }
            };
            
            console.log('🔧 [DEBUG] 配置Squeeze价格轴:', squeezePriceScaleOptions);
            this.chart.priceScale('right').applyOptions(squeezePriceScaleOptions);
            
            // 确保时间轴配置与主图一致
            this.chart.timeScale().applyOptions({
                rightOffset: 12,
                barSpacing: 6,
                fixLeftEdge: false,
                fixRightEdge: false,
                lockVisibleTimeRangeOnResize: false
            });
            
            console.log('✅ Squeeze价格轴已配置完成');
        } catch (error) {
            console.error('❌ Squeeze价格轴配置失败:', error);
        }
    }
    
    /**
     * 加载主股票的Squeeze Momentum数据
     */
    async loadSqueezeData(stockCode) {
        try {
            console.log(`📊 开始加载Squeeze Momentum数据: ${stockCode}`);
            
            // 获取Squeeze指标数据
            const response = await fetch(`/api/indicator?code=${stockCode}&type=squeeze_momentum`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const squeezeData = await response.json();
            
            if (!squeezeData || !Array.isArray(squeezeData) || squeezeData.length === 0) {
                console.error(`❌ ${stockCode}: Squeeze数据无效`);
                return;
            }
            
            // 存储主股票数据
            this.mainStockData = squeezeData;
            
            // 创建Squeeze系列
            this.createSqueezeSeries(squeezeData);
            
            console.log(`✅ Squeeze Momentum数据加载完成: ${stockCode}`);
            
        } catch (error) {
            console.error(`❌ 加载Squeeze Momentum数据失败: ${stockCode}`, error);
            throw error;
        }
    }
    
    /**
     * 创建Squeeze系列
     */
    createSqueezeSeries(squeezeData) {
        try {
            // 处理Squeeze数据
            const processedData = this.processSqueezeData(squeezeData);
            
            if (processedData.momentumData.length === 0) {
                console.warn('⚠️ 没有有效的Squeeze Momentum数据');
                return;
            }
            
            // 创建动量柱状图系列
            this.momentumSeries = this.addSeries('histogram', {
                priceScaleId: 'right',
                priceFormat: {
                    type: 'price',
                    precision: 4,
                    minMove: 0.0001
                },
                priceLineVisible: false,
                lastValueVisible: true
            });
            
            // 创建零线系列
            this.zeroLineSeries = this.addSeries('line', {
                priceScaleId: 'right',
                color: '#808080',
                lineWidth: 1,
                priceLineVisible: false,
                lastValueVisible: false
            });
            
            if (!this.momentumSeries || !this.zeroLineSeries) {
                console.error('❌ Squeeze系列创建失败');
                return;
            }
            
            // 设置数据
            this.momentumSeries.setData(processedData.momentumData);
            this.zeroLineSeries.setData(processedData.zeroLineData);
            
            console.log(`✅ Squeeze系列创建完成，动量数据点: ${processedData.momentumData.length}`);
            
        } catch (error) {
            console.error('❌ 创建Squeeze系列失败:', error);
        }
    }
    
    /**
     * 处理Squeeze数据
     */
    processSqueezeData(squeezeData) {
        const momentumData = [];
        const zeroLineData = [];
        
        squeezeData.forEach(item => {
            if (item && item.time) {
                // 动量数据 - 根据正负值设置颜色
                if (item.momentum !== null && item.momentum !== undefined && isFinite(item.momentum)) {
                    // 根据动量值的正负和变化趋势设置颜色
                    let color = '#808080'; // 默认灰色
                    
                    if (item.momentum > 0) {
                        // 正值：绿色系
                        color = item.momentum_increasing ? '#00ff00' : '#008000'; // 亮绿/暗绿
                    } else if (item.momentum < 0) {
                        // 负值：红色系
                        color = item.momentum_increasing ? '#ff6b6b' : '#dc143c'; // 亮红/暗红
                    }
                    
                    momentumData.push({
                        time: item.time,
                        value: item.momentum,
                        color: color
                    });
                }
                
                // 零线数据
                zeroLineData.push({ 
                    time: item.time, 
                    value: 0 
                });
            }
        });
        
        console.log(`📊 Squeeze数据处理完成: ${momentumData.length} 个动量数据点`);
        return { momentumData, zeroLineData };
    }
    
    /**
     * 更新Squeeze数据
     */
    updateSqueezeData(newData) {
        if (this.momentumSeries && this.zeroLineSeries && newData) {
            const processedData = this.processSqueezeData(newData);
            this.momentumSeries.setData(processedData.momentumData);
            this.zeroLineSeries.setData(processedData.zeroLineData);
            console.log('📊 Squeeze数据已更新');
        }
    }
    
    /**
     * 清空Squeeze数据
     */
    clearSqueezeData() {
        if (this.momentumSeries) {
            this.momentumSeries.setData([]);
        }
        if (this.zeroLineSeries) {
            this.zeroLineSeries.setData([]);
        }
        this.mainStockData = null;
        console.log('📊 Squeeze数据已清空');
    }
    
    /**
     * 获取源名称
     */
    getSourceName() {
        return 'squeeze';
    }
    
    /**
     * 销毁图表
     */
    destroy() {
        try {
            this.momentumSeries = null;
            this.zeroLineSeries = null;
            this.mainStockData = null;
            
            // 调用父类销毁方法
            super.destroy();
            
            console.log(`📊 SqueezeChart 已销毁: ${this.id}`);
            
        } catch (error) {
            console.error('❌ SqueezeChart 销毁失败:', error);
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
window.VolumeChart = VolumeChart;
window.SqueezeChart = SqueezeChart;

// 全局回调函数，用于图例交互
window.toggleStock = function(index) {
    const mainChart = ChartRegistry.getMainChart();
    if (mainChart && mainChart.toggleStockVisibility) {
        mainChart.toggleStockVisibility(index);
    }
};

window.toggleNormalization = function() {
    const mainChart = ChartRegistry.getMainChart();
    if (mainChart && mainChart.smartToggleNormalization) {
        const success = mainChart.smartToggleNormalization();
        if (!success) {
            // 如果无法切换归一化，显示提示
            console.log('💡 提示：当前股票价格差异小于30%，无需使用归一化功能');
            
            // 可以在这里添加用户界面提示，比如弹出消息
            if (typeof window.showToast === 'function') {
                window.showToast('股票价格差异小于30%，无需归一化', 'info');
            }
        }
    }
};

console.log('🚀 LightWeight Charts V2.1.0 - 核心系统已加载');
console.log('📊 可用组件:', {
    ChartConfig: '配置管理',
    ChartUtils: '工具函数',
    EventEmitter: '事件系统',
    ChartRegistry: '图表注册器',
    BaseChart: '基础图表类'
});
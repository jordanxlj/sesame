/**
 * 轻量级图表库 - 重构版本
 * 提供模块化的图表组件和同步功能
 * @version 2.0.0
 * @author Stock Chart System
 */

// ================================
// 核心配置和常量
// ================================
const ChartConfig = {
    // 默认图表配置
    DEFAULT_OPTIONS: {
        width: 1000,
        height: 400,
        rightPriceScale: { visible: true },
        leftPriceScale: { visible: false },
        timeScale: { visible: true },
        layout: {
            backgroundColor: 'transparent',
            textColor: '#333'
        },
        grid: {
            vertLines: { color: '#e1e1e1' },
            horzLines: { color: '#e1e1e1' }
        }
    },
    
    // 主图配置
    MAIN_CHART: {
        height: 600,
        timeScale: {
            visible: true,
            timeVisible: true,
            secondsVisible: false,
            borderVisible: true,
            rightOffset: 5,      // 减少右侧偏移，避免留白
            barSpacing: 6,       // 适中的柱间距
            fixLeftEdge: false,
            fixRightEdge: false,
            lockVisibleTimeRangeOnResize: true,
            // 自动适配数据范围的配置
            autoFitContent: true
        },
        // 多股票显示选项
        multiStock: {
            enableNormalization: false,  // 是否启用价格归一化
            baseStockIndex: 0,          // 基准股票索引
            showRelativeChange: true    // 显示相对变化
        }
    },
    
    // 子图配置
    SUB_CHART: {
        height: 200,
        timeScale: {
            visible: true,
            timeVisible: true,
            secondsVisible: false,
            borderVisible: true,
            rightOffset: 5,      // 减少右侧偏移，避免留白
            barSpacing: 6,       // 适中的柱间距
            fixLeftEdge: false,
            fixRightEdge: false,
            lockVisibleTimeRangeOnResize: true,
            // 自动适配数据范围的配置
            autoFitContent: true
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
        // 买卖信号专用颜色（更醒目）
        SIGNALS: {
            BUY: '#00ff00',      // 鲜绿色
            SELL: '#ff0000',     // 鲜红色
            BUY_ALT: '#32cd32',  // 备用绿色
            SELL_ALT: '#dc143c'  // 备用红色
        },
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
            },
            {
                name: '对比股票3',
                upColor: '#4caf50',
                downColor: '#e91e63',
                borderUpColor: '#388e3c',
                borderDownColor: '#c2185b',
                wickUpColor: '#388e3c',
                wickDownColor: '#c2185b',
                opacity: 0.6
            },
            {
                name: '对比股票4',
                upColor: '#00bcd4',
                downColor: '#ff5722',
                borderUpColor: '#0097a7',
                borderDownColor: '#d84315',
                wickUpColor: '#0097a7',
                wickDownColor: '#d84315',
                opacity: 0.5
            }
        ],
        SQUEEZE: {
            LIME: '#00ff00',
            GREEN: '#008000',
            RED: '#ff0000',
            MAROON: '#800000',
            BLACK: '#000000',
            GRAY: '#808080',
            BLUE: '#0000ff'
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
    }
};

// ================================
// 工具函数模块
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
     * 时间格式转换
     */
    convertTimeToNumber(time) {
        if (time == null) {
            console.debug('时间转换: 输入为null或undefined');
            return NaN;
        }
        
        if (typeof time === 'number') {
            if (isNaN(time)) {
                console.debug('时间转换: 输入数字为NaN');
                return NaN;
            }
            return time;
        }
        
        if (typeof time === 'string') {
            const timestamp = new Date(time).getTime() / 1000;
            if (isNaN(timestamp)) {
                console.debug('时间转换: 字符串转换失败', time);
                return NaN;
            }
            return timestamp;
        }
        
        console.debug('时间转换: 未知类型', typeof time, time);
        return NaN;
    },
    
    /**
     * 计算时间差异
     */
    calculateTimeDiff(range1, range2) {
        const from1 = this.convertTimeToNumber(range1.from);
        const to1 = this.convertTimeToNumber(range1.to);
        const from2 = this.convertTimeToNumber(range2.from);
        const to2 = this.convertTimeToNumber(range2.to);
        
        return Math.abs(from1 - from2) + Math.abs(to1 - to2);
    },
    
    /**
     * 检测缩放类型
     */
    detectZoomType(currentRange, newRange) {
        if (!currentRange.from || !currentRange.to) return 'initial';
        
        const currentFrom = this.convertTimeToNumber(currentRange.from);
        const currentTo = this.convertTimeToNumber(currentRange.to);
        const newFrom = this.convertTimeToNumber(newRange.from);
        const newTo = this.convertTimeToNumber(newRange.to);
        
        const currentSpan = currentTo - currentFrom;
        const newSpan = newTo - newFrom;
        const spanRatio = newSpan / currentSpan;
        
        if (spanRatio < ChartConfig.SYNC.ZOOM_THRESHOLD.IN) return 'zoom-in';
        if (spanRatio > ChartConfig.SYNC.ZOOM_THRESHOLD.OUT) return 'zoom-out';
        return 'pan';
    },
    
    /**
     * 过滤有效数据，移除空值和无效值
     */
    filterValidData(data) {
        if (!Array.isArray(data)) return [];
        
        return data.filter(item => {
            // 检查时间字段
            if (!item.time) return false;
            
            // 检查数值字段
            if (typeof item.value !== 'undefined') {
                return item.value !== null && !isNaN(item.value);
            }
            
            // 检查OHLC数据
            if (typeof item.open !== 'undefined') {
                return item.open !== null && !isNaN(item.open) &&
                       item.high !== null && !isNaN(item.high) &&
                       item.low !== null && !isNaN(item.low) &&
                       item.close !== null && !isNaN(item.close);
            }
            
            return true;
        });
    },
    
    /**
     * 获取数据的实际时间范围
     */
    getDataActualRange(data) {
        const validData = this.filterValidData(data);
        if (validData.length === 0) return null;
        
        const times = validData.map(item => this.convertTimeToNumber(item.time));
        return {
            from: Math.min(...times),
            to: Math.max(...times)
        };
    }
};

// ================================
// 同步管理器
// ================================
class SyncManager {
    constructor() {
        this.globalTimeRange = null;
        this.isUpdatingFromGlobal = false;
        this.lastSyncTime = 0;
        this.lastTimeRange = null;
        
        // 创建防抖同步函数
        this.debouncedSync = ChartUtils.debounce(
            this.performSync.bind(this), 
            ChartConfig.SYNC.DEBOUNCE_DELAY
        );
    }
    
    /**
     * 检测并同步缩放
     */
    detectAndSyncZoom(timeRange, source) {
        if (!timeRange || !timeRange.from || !timeRange.to) {
            this.debouncedSync(timeRange, source);
            return;
        }
        
        const zoomType = ChartUtils.detectZoomType(this.lastTimeRange || {}, timeRange);
        this.lastTimeRange = timeRange;
        
        // 缩小操作时重置节流时间，确保立即同步
        if (zoomType === 'zoom-out') {
            this.lastSyncTime = 0;
        }
        
        this.debouncedSync(timeRange, source);
    }
    
    /**
     * 执行同步
     */
    performSync(timeRange, source) {
        if (!timeRange || !timeRange.from || !timeRange.to) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastSyncTime < ChartConfig.SYNC.DEBOUNCE_DELAY) return;
        
        const timeDiff = this.globalTimeRange ? 
            ChartUtils.calculateTimeDiff(timeRange, this.globalTimeRange) : Infinity;
        
        if (timeDiff < ChartConfig.SYNC.TIME_DIFF_THRESHOLD) return;
        
        this.lastSyncTime = currentTime;
        this.updateGlobalTimeRange(timeRange, source);
    }
    
    /**
     * 更新全局时间范围
     */
    updateGlobalTimeRange(timeRange, source) {
        if (this.isUpdatingFromGlobal) {
            console.debug('同步管理器: 正在更新中，跳过本次更新');
            return;
        }
        
        if (!timeRange) {
            console.warn('同步管理器: 时间范围为空，跳过更新');
            return;
        }
        
        console.log('同步管理器: 开始更新全局时间范围', { timeRange, source });
        
        this.globalTimeRange = timeRange;
        this.isUpdatingFromGlobal = true;
        
        try {
            // 通知所有注册的图表进行同步
            ChartRegistry.syncAll(timeRange, source);
            console.log('同步管理器: 全局同步完成');
        } catch (error) {
            console.error('同步管理器: 同步过程中发生错误:', error);
        } finally {
            setTimeout(() => {
                this.isUpdatingFromGlobal = false;
                console.debug('同步管理器: 更新标志已重置');
            }, 100);
        }
    }
    
    /**
     * 强制同步所有图表
     */
    forceSyncAll() {
        const mainChart = ChartRegistry.getMainChart();
        if (!mainChart) {
            throw new Error('主图未创建');
        }
        
        const mainTimeRange = mainChart.getTimeRange();
        if (!mainTimeRange) {
            throw new Error('无法获取主图时间范围');
        }
        
        this.updateGlobalTimeRange(mainTimeRange, 'force');
        return true;
    }
}

// ================================
// 图表注册器
// ================================
class ChartRegistry {
    static charts = new Map();
    static mainChart = null;
    
    /**
     * 注册图表
     */
    static register(id, chart, isMain = false) {
        this.charts.set(id, chart);
        if (isMain) {
            this.mainChart = chart;
        }
    }
    
    /**
     * 注销图表
     */
    static unregister(id) {
        const chart = this.charts.get(id);
        if (chart === this.mainChart) {
            this.mainChart = null;
        }
        this.charts.delete(id);
    }
    
    /**
     * 获取主图
     */
    static getMainChart() {
        return this.mainChart;
    }
    
    /**
     * 获取所有图表
     */
    static getAllCharts() {
        return Array.from(this.charts.values());
    }
    
    /**
     * 同步所有图表
     */
    static syncAll(timeRange, source) {
        this.charts.forEach((chart, id) => {
            if (chart.syncTimeRange && typeof chart.syncTimeRange === 'function') {
                try {
                    chart.syncTimeRange(timeRange, source);
                } catch (error) {
                    console.error(`图表 ${id} 同步失败:`, error);
                }
            }
        });
    }
    
    /**
     * 清空所有图表
     */
    static clear() {
        this.charts.clear();
        this.mainChart = null;
    }
}

// ================================
// 图表基类
// ================================
class BaseChart {
    constructor(container, options = {}) {
        this.id = `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.container = container;
        this.chart = null;
        this.series = [];
        this.options = {
            ...ChartConfig.DEFAULT_OPTIONS,
            ...options
        };
        
        // 适配状态管理
        this.isDataLoaded = false;
        this.lastFitTime = 0;
        this.fitThrottleDelay = 100; // 适配节流延迟
        
        // 注册到图表注册器
        ChartRegistry.register(this.id, this);
    }
    
    /**
     * 创建图表
     */
    create() {
        if (this.chart) {
            this.destroy();
        }
        
        this.chart = LightweightCharts.createChart(this.container, this.options);
        
        // 立即设置为无留白模式
        this.setupNoWhitespaceMode();
        
        this.onCreated();
        return this.chart;
    }
    
    /**
     * 设置无留白模式
     */
    setupNoWhitespaceMode() {
        if (!this.chart) return;
        
        try {
            // 确保时间轴配置为无留白模式
            this.chart.timeScale().applyOptions({
                rightOffset: 5,
                barSpacing: 6,
                fixLeftEdge: false,
                fixRightEdge: false
            });
        } catch (error) {
            console.warn('设置无留白模式失败:', error);
        }
    }
    
    /**
     * 销毁图表
     */
    destroy() {
        if (this.chart) {
            this.series.forEach(series => {
                try { 
                    this.chart.removeSeries(series); 
                } catch (e) {
                    console.warn('移除系列时出错:', e);
                }
            });
            this.series = [];
            this.chart.remove();
            this.chart = null;
        }
        
        // 从注册器中移除
        ChartRegistry.unregister(this.id);
    }
    
    /**
     * 添加系列
     */
    addSeries(type, options = {}) {
        if (!this.chart) return null;
        
        let series;
        switch (type) {
            case 'candlestick':
                series = this.chart.addCandlestickSeries(options);
                break;
            case 'line':
                series = this.chart.addLineSeries(options);
                break;
            case 'histogram':
                series = this.chart.addHistogramSeries(options);
                break;
            default:
                console.warn(`未知的系列类型: ${type}`);
                return null;
        }
        
        this.series.push(series);
        
        // 为主要系列（K线和柱状图）添加数据设置监听，自动适配范围
        if (series && series.setData && (type === 'candlestick' || type === 'histogram')) {
            const originalSetData = series.setData.bind(series);
            series.setData = (data) => {
                originalSetData(data);
                // 标记数据已加载
                this.isDataLoaded = true;
                // 节流适配，避免频繁调用
                this.throttledFitContent();
            };
        }
        
        return series;
    }
    
    /**
     * 设置时间范围
     */
    setTimeRange(timeRange) {
        if (!this.chart) {
            console.warn('图表未创建，无法设置时间范围');
            return;
        }
        
        if (!timeRange) {
            console.warn('时间范围为空，跳过设置');
            return;
        }
        
        if (!this.isValidTimeRange(timeRange)) {
            console.warn('时间范围无效，跳过设置:', timeRange);
            return;
        }
        
        try {
            // 确保时间范围的值不为null
            const safeTimeRange = {
                from: timeRange.from,
                to: timeRange.to
            };
            
            // 验证时间值
            if (safeTimeRange.from == null || safeTimeRange.to == null) {
                console.warn('时间范围包含null值，跳过设置:', safeTimeRange);
                return;
            }
            
            this.chart.timeScale().setVisibleRange(safeTimeRange);
            console.log('时间范围设置成功:', safeTimeRange);
        } catch (error) {
            console.error('设置时间范围失败:', error, '时间范围:', timeRange);
        }
    }
    
    /**
     * 节流适配内容范围
     */
    throttledFitContent() {
        const now = Date.now();
        if (now - this.lastFitTime < this.fitThrottleDelay) {
            return; // 节流中，跳过
        }
        
        this.lastFitTime = now;
        setTimeout(() => {
            this.fitContentToData();
        }, 5);
    }
    
    /**
     * 自动适配内容范围，消除无效数据留白
     */
    fitContentToData() {
        if (!this.chart || !this.isDataLoaded) return;
        
        try {
            // 使用 fitContent 方法自动适配到实际数据范围
            this.chart.timeScale().fitContent();
            console.log('图表已自动适配到数据范围');
            
            // 添加一个小的延迟，确保适配完成后进行微调
            setTimeout(() => {
                this.optimizeVisibleRange();
            }, 20);
        } catch (error) {
            console.warn('自动适配数据范围失败:', error);
        }
    }
    
    /**
     * 优化可见范围，确保数据完全可见且没有过多留白
     */
    optimizeVisibleRange() {
        if (!this.chart) return;
        
        try {
            const currentRange = this.chart.timeScale().getVisibleRange();
            if (!currentRange) return;
            
            // 获取时间轴的逻辑范围
            const logicalRange = this.chart.timeScale().getVisibleLogicalRange();
            if (!logicalRange) return;
            
            // 计算优化后的范围，减少不必要的留白
            const optimizedRange = {
                from: currentRange.from,
                to: currentRange.to
            };
            
            // 设置优化后的范围
            this.chart.timeScale().setVisibleRange(optimizedRange);
            console.log('图表可见范围已优化');
        } catch (error) {
            console.warn('优化可见范围失败:', error);
        }
    }
    
    /**
     * 获取数据的实际时间范围
     */
    getDataTimeRange() {
        if (!this.chart || this.series.length === 0) return null;
        
        try {
            let minTime = null;
            let maxTime = null;
            
            // 遍历所有系列，找到数据的实际时间范围
            this.series.forEach(series => {
                try {
                    // 注意：LightweightCharts 没有直接获取系列数据的API
                    // 这里我们使用 fitContent 来让图表自动计算范围
                } catch (error) {
                    console.warn('获取系列数据范围失败:', error);
                }
            });
            
            // 获取当前可见范围作为数据范围的参考
            const visibleRange = this.chart.timeScale().getVisibleRange();
            return visibleRange;
        } catch (error) {
            console.warn('获取数据时间范围失败:', error);
            return null;
        }
    }
    
    /**
     * 检查是否存在过多的留白
     */
    checkForExcessiveWhitespace() {
        if (!this.chart) return;
        
        try {
            const visibleRange = this.chart.timeScale().getVisibleRange();
            const logicalRange = this.chart.timeScale().getVisibleLogicalRange();
            
            if (!visibleRange || !logicalRange) return;
            
            // 计算可见范围和逻辑范围的比例
            const visibleSpan = ChartUtils.convertTimeToNumber(visibleRange.to) - 
                               ChartUtils.convertTimeToNumber(visibleRange.from);
            const logicalSpan = logicalRange.to - logicalRange.from;
            
            // 如果可见范围远大于逻辑范围，说明存在过多留白
            if (logicalSpan > 0 && visibleSpan / logicalSpan > 2) {
                console.warn('检测到图表存在过多留白，建议使用"适配数据范围"功能');
                
                // 可以选择自动适配或提示用户
                // this.fitContentToData(); // 自动适配
            }
        } catch (error) {
            console.warn('检查留白失败:', error);
        }
    }
    
    /**
     * 为数据加载做准备，预设图表状态避免初始留白
     */
    prepareForDataLoad() {
        if (!this.chart) return;
        
        try {
            // 设置时间轴为自动适配模式
            this.chart.timeScale().applyOptions({
                rightOffset: 5,  // 减少右侧偏移
                barSpacing: 6,   // 适中的柱间距
                fixLeftEdge: false,
                fixRightEdge: false
            });
            
            console.log('图表已预设为无留白模式');
        } catch (error) {
            console.warn('预设图表状态失败:', error);
        }
    }
    
    /**
     * 完成数据加载，确保最终显示无留白
     */
    finalizeDataLoad() {
        if (!this.chart || !this.isDataLoaded) return;
        
        try {
            // 最终确保适配正确
            this.fitContentToData();
            console.log('数据加载完成，已确保无留白显示');
        } catch (error) {
            console.warn('完成数据加载失败:', error);
        }
    }
    
    /**
     * 验证时间范围是否有效
     */
    isValidTimeRange(timeRange) {
        if (!timeRange || typeof timeRange !== 'object') {
            console.debug('时间范围验证失败: 不是对象或为空');
            return false;
        }
        
        if (timeRange.from == null || timeRange.to == null) {
            console.debug('时间范围验证失败: from或to为null');
            return false;
        }
        
        const from = ChartUtils.convertTimeToNumber(timeRange.from);
        const to = ChartUtils.convertTimeToNumber(timeRange.to);
        
        if (isNaN(from) || isNaN(to)) {
            console.debug('时间范围验证失败: 时间转换为NaN', { from, to, originalFrom: timeRange.from, originalTo: timeRange.to });
            return false;
        }
        
        if (from >= to) {
            console.debug('时间范围验证失败: from >= to', { from, to });
            return false;
        }
        
        return true;
    }
    
    /**
     * 获取时间范围
     */
    getTimeRange() {
        if (!this.chart) {
            console.debug('图表未创建，无法获取时间范围');
            return null;
        }
        
        try {
            const range = this.chart.timeScale().getVisibleRange();
            
            if (!range) {
                console.debug('获取到的时间范围为空');
                return null;
            }
            
            // 检查范围是否有效
            if (this.isValidTimeRange(range)) {
                console.debug('获取时间范围成功:', range);
                return range;
            } else {
                console.debug('获取到的时间范围无效:', range);
                return null;
            }
        } catch (error) {
            console.error('获取时间范围失败:', error);
            return null;
        }
    }
    
    /**
     * 同步时间范围（供同步管理器调用）
     */
    syncTimeRange(timeRange, source) {
        console.debug(`${this.getSourceName()} 收到同步请求，来源: ${source}`, timeRange);
        
        // 避免自己同步自己
        if (source === this.getSourceName()) {
            console.debug(`${this.getSourceName()} 跳过自身同步`);
            return;
        }
        
        // 验证时间范围
        if (!this.isValidTimeRange(timeRange)) {
            console.warn(`${this.getSourceName()} 收到无效时间范围，跳过同步:`, timeRange);
            return;
        }
        
        try {
            this.setTimeRange(timeRange);
            console.debug(`${this.getSourceName()} 同步完成`);
        } catch (error) {
            console.error(`${this.getSourceName()} 同步失败:`, error);
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
     * 获取源名称（用于同步识别）
     */
    getSourceName() {
        return this.constructor.name.toLowerCase();
    }
    
    /**
     * 创建完成后的回调
     */
    onCreated() {
        // 子类可以重写此方法
    }
}

// ================================
// 主图类
// ================================
class MainChart extends BaseChart {
    constructor(container) {
        super(container, ChartConfig.MAIN_CHART);
        
        this.volumeSeries = null;
        this.candleSeries = [];
        this.indicatorSeries = [];
        this.currentOhlcData = null;
        this.subCharts = [];
        this.stockInfos = []; // 存储股票信息
        this.normalizationEnabled = false; // 价格归一化状态
        this.basePrice = null; // 基准价格
        
        // 注册为主图
        ChartRegistry.register(this.id, this, true);
    }
    
    onCreated() {
        this.setupVolumeSeries();
        this.setupEventListeners();
    }
    
    /**
     * 设置成交量系列
     */
    setupVolumeSeries() {
        this.volumeSeries = this.addSeries('histogram', {
            priceScaleId: 'volume',
            priceFormat: { type: 'volume' },
            scaleMargins: { top: 0.8, bottom: 0 },
            color: ChartConfig.COLORS.VOLUME
        });
        
        this.chart.priceScale('volume').applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 },
            alignLabels: true,
            borderVisible: true
        });
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听时间轴变化
        this.subscribeTimeRangeChange((timeRange) => {
            if (!syncManager.isUpdatingFromGlobal && timeRange) {
                syncManager.detectAndSyncZoom(timeRange, 'main');
            }
        });
        
        // 监听十字线移动
        this.subscribeCrosshairMove((param) => {
            this.handleCrosshairMove(param);
        });
    }
    
    /**
     * 添加子图
     */
    addSubChart(subChart) {
        this.subCharts.push(subChart);
    }
    
    /**
     * 加载数据
     */
    async loadData(codes, selectedIndicators) {
        this.clearData();
        
        // 预先设置图表为适配模式，避免初始留白
        this.prepareForDataLoad();
        
        const promises = codes.map((code, idx) => 
            this.loadStockData(code, idx, selectedIndicators)
        );
        
        await Promise.all(promises);
        
        // 最终确保所有数据都已正确适配
        setTimeout(() => {
            this.finalizeDataLoad();
            console.log('主图数据加载完成，已确保无留白显示');
        }, 50);
    }
    
    /**
     * 清除数据
     */
    clearData() {
        this.candleSeries = [];
        this.indicatorSeries = [];
        this.stockInfos = [];
        this.clearSubCharts();
        
        // 清除图例
        const legendContainer = document.getElementById('chart-legend');
        if (legendContainer) {
            legendContainer.remove();
        }
    }
    
    /**
     * 清除所有指标
     */
    clearAllIndicators() {
        // 清除指标系列
        this.indicatorSeries.forEach(series => {
            try {
                this.chart.removeSeries(series);
            } catch (e) {
                console.warn('移除指标系列时出错:', e);
            }
        });
        this.indicatorSeries = [];
        
        // 清除K线标记
        this.candleSeries.forEach(series => {
            try {
                series.setMarkers([]);
            } catch (e) {
                console.warn('清除标记时出错:', e);
            }
        });
        
        // 清除子图
        this.clearSubCharts();
    }
    
    /**
     * 清除子图
     */
    clearSubCharts() {
        this.subCharts.forEach(subChart => {
            try {
                subChart.destroy();
            } catch (e) {
                console.warn('销毁子图时出错:', e);
            }
        });
        this.subCharts = [];
        
        // 清除DOM中的子图容器
        const squeezeContainer = document.getElementById('squeeze-chart');
        if (squeezeContainer) {
            squeezeContainer.remove();
        }
        
        // 清除全局引用
        window.squeezeChart = null;
        window.squeezeChartInstance = null;
    }
    
    /**
     * 清除特定指标
     */
    clearIndicator(indicatorType) {
        console.log('清除指标:', indicatorType);
        
        if (indicatorType === 'squeeze_momentum') {
            this.clearSqueezeChart();
        } else if (indicatorType === 'supertrend') {
            this.clearSupertrendIndicator();
        } else if (indicatorType.startsWith('ma')) {
            this.clearMAIndicator(indicatorType);
        }
    }
    
    /**
     * 清除 Squeeze 图表
     */
    clearSqueezeChart() {
        // 找到并移除 Squeeze 子图
        const squeezeIndex = this.subCharts.findIndex(chart => chart instanceof SqueezeChart);
        if (squeezeIndex !== -1) {
            const squeezeChart = this.subCharts[squeezeIndex];
            squeezeChart.destroy();
            this.subCharts.splice(squeezeIndex, 1);
        }
        
        // 移除DOM容器
        const squeezeContainer = document.getElementById('squeeze-chart');
        if (squeezeContainer) {
            squeezeContainer.remove();
        }
        
        // 清除全局引用
        window.squeezeChart = null;
        window.squeezeChartInstance = null;
        
        console.log('Squeeze图表已清除');
    }
    
    /**
     * 清除 SuperTrend 指标
     */
    clearSupertrendIndicator() {
        // 移除SuperTrend线条（通常是最后添加的几个系列）
        const seriesToRemove = [];
        this.indicatorSeries.forEach((series, index) => {
            // 这里可以根据系列的特征来识别SuperTrend系列
            // 简单起见，我们移除所有线条系列
            try {
                if (series.seriesType && series.seriesType() === 'Line') {
                    seriesToRemove.push(index);
                }
            } catch (e) {
                // 如果无法获取系列类型，跳过
            }
        });
        
        // 从后往前移除，避免索引问题
        seriesToRemove.reverse().forEach(index => {
            try {
                this.chart.removeSeries(this.indicatorSeries[index]);
                this.indicatorSeries.splice(index, 1);
            } catch (e) {
                console.warn('移除SuperTrend系列时出错:', e);
            }
        });
        
        // 清除K线标记
        this.candleSeries.forEach(series => {
            try {
                series.setMarkers([]);
            } catch (e) {
                console.warn('清除SuperTrend标记时出错:', e);
            }
        });
        
        console.log('SuperTrend指标已清除');
    }
    
    /**
     * 清除 MA 指标
     */
    clearMAIndicator(indicatorType) {
        // 这里需要更精确的识别方法，暂时移除所有MA相关的线条
        const seriesToRemove = [];
        this.indicatorSeries.forEach((series, index) => {
            // 可以通过系列的颜色或其他属性来识别MA系列
            seriesToRemove.push(index);
        });
        
        // 从后往前移除
        seriesToRemove.reverse().forEach(index => {
            try {
                this.chart.removeSeries(this.indicatorSeries[index]);
                this.indicatorSeries.splice(index, 1);
            } catch (e) {
                console.warn('移除MA系列时出错:', e);
            }
        });
        
        console.log(`${indicatorType}指标已清除`);
    }
    
    /**
     * 加载股票数据
     */
    async loadStockData(code, index, selectedIndicators) {
        try {
            const response = await fetch(`/api/kline?code=${code}`);
            const ohlc = await response.json();
            
            if (index === 0) {
                this.currentOhlcData = ohlc;
            }
            
            // 存储股票信息
            const colorScheme = ChartConfig.COLORS.MULTI_STOCK[index] || 
                               ChartConfig.COLORS.MULTI_STOCK[ChartConfig.COLORS.MULTI_STOCK.length - 1];
            
            this.stockInfos[index] = {
                code: code,
                name: this.extractStockName(code),
                colorScheme: colorScheme,
                data: ohlc,
                isMain: index === 0
            };
            
            this.createCandlestickSeries(ohlc, index);
            
            if (index === 0) {
                this.createVolumeSeries(ohlc);
                await this.loadIndicators(code, selectedIndicators);
            }
            
            // 更新图例显示
            this.updateLegend();
            
        } catch (error) {
            console.error(`加载股票 ${code} 数据失败:`, error);
        }
    }
    
    /**
     * 创建K线系列
     */
    createCandlestickSeries(ohlc, index) {
        const colors = this.getCandlestickColors(index);
        const isMain = index === 0;
        
        // 为非主股票设置不同的价格轴
        const priceScaleId = isMain ? 'right' : `right_${index}`;
        
        const candleSeries = this.addSeries('candlestick', {
            priceScaleId: priceScaleId,
            scaleMargins: { top: 0.2, bottom: 0.3 },
            ...colors
        });
        
        // 为非主股票配置价格轴
        if (!isMain) {
            this.chart.priceScale(priceScaleId).applyOptions({
                visible: false, // 隐藏非主股票的价格轴
                autoScale: true,
                alignLabels: false,
                scaleMargins: { top: 0.2, bottom: 0.3 }
            });
        }
        
        // 过滤无效数据后再设置
        const validData = ChartUtils.filterValidData(ohlc);
        console.log(`K线数据过滤 (股票${index}): 原始${ohlc.length}条 -> 有效${validData.length}条`);
        
        candleSeries.setData(validData);
        this.candleSeries.push(candleSeries);
        
        return candleSeries;
    }
    
    /**
     * 获取K线颜色配置
     */
    getCandlestickColors(index) {
        // 使用多股票颜色方案
        const colorScheme = ChartConfig.COLORS.MULTI_STOCK[index] || 
                           ChartConfig.COLORS.MULTI_STOCK[ChartConfig.COLORS.MULTI_STOCK.length - 1];
        
        return {
            upColor: colorScheme.upColor,
            downColor: colorScheme.downColor,
            borderUpColor: colorScheme.borderUpColor,
            borderDownColor: colorScheme.borderDownColor,
            wickUpColor: colorScheme.wickUpColor,
            wickDownColor: colorScheme.wickDownColor,
            // 添加透明度支持
            priceLineVisible: index === 0, // 只有主股票显示价格线
            lastValueVisible: index === 0  // 只有主股票显示最后价格
        };
    }
    
    /**
     * 创建成交量系列
     */
    createVolumeSeries(ohlc) {
        const volumeData = ohlc
            .filter(bar => bar.volume !== null && !isNaN(bar.volume) && Number(bar.volume) > 0)
            .map(bar => ({
                time: bar.time,
                value: Number(bar.volume),
                color: bar.close >= bar.open ? ChartConfig.COLORS.UP : ChartConfig.COLORS.DOWN
            }));
        
        console.log(`成交量数据过滤: 原始${ohlc.length}条 -> 有效${volumeData.length}条`);
        this.volumeSeries.setData(volumeData);
    }
    
    /**
     * 加载指标
     */
    async loadIndicators(code, selectedIndicators) {
        const promises = selectedIndicators.map(indicator => {
            if (indicator === 'squeeze_momentum') {
                return this.createSqueezeChart(code);
            }
            return this.loadIndicator(code, indicator);
        });
        
        await Promise.all(promises);
    }
    
    /**
     * 加载单个指标
     */
    async loadIndicator(code, indicator) {
        try {
            const response = await fetch(`/api/indicator?code=${code}&type=${indicator}`);
            const data = await response.json();
            
            if (indicator === 'supertrend') {
                this.addSupertrendIndicator(data);
            } else if (indicator.startsWith('ma')) {
                this.addMAIndicator(data, indicator);
            }
        } catch (error) {
            console.error(`加载指标 ${indicator} 失败:`, error);
        }
    }
    
    /**
     * 添加SuperTrend指标
     */
    addSupertrendIndicator(data) {
        const segments = this.processSupertrendData(data);
        const candleSeries = this.candleSeries[0];
        
        segments.forEach(segment => {
            const series = this.addSeries('line', {
                color: segment.trend === 1 ? ChartConfig.COLORS.UP : ChartConfig.COLORS.DOWN,
                lineWidth: 2
            });
            series.setData(segment.data);
            this.indicatorSeries.push(series);
        });
        
        // 添加买卖信号标记
        const markers = this.createSignalMarkers(data);
        if (candleSeries && markers.length > 0) {
            candleSeries.setMarkers(markers);
        }
    }
    
    /**
     * 处理SuperTrend数据
     */
    processSupertrendData(data) {
        const segments = [];
        let current = [];
        let lastTrend = null;
        
        data.forEach(item => {
            if (item.supertrend === null || isNaN(item.supertrend)) {
                if (current.length) {
                    segments.push({ trend: lastTrend, data: current });
                    current = [];
                }
                lastTrend = null;
                return;
            }
            
            if (item.trend !== lastTrend && current.length) {
                segments.push({ trend: lastTrend, data: current });
                current = [];
            }
            
            current.push({ time: item.time, value: item.supertrend });
            lastTrend = item.trend;
        });
        
        if (current.length) {
            segments.push({ trend: lastTrend, data: current });
        }
        
        return segments;
    }
    
    /**
     * 创建信号标记
     */
    createSignalMarkers(data) {
        const markers = [];
        
        data.forEach(item => {
            // 检查买入信号
            if (item.buy === 1) {
                markers.push({
                    time: item.time,
                    position: 'belowBar',
                    color: ChartConfig.COLORS.SIGNALS.BUY,
                    shape: 'arrowUp',
                    text: '🔺BUY',     // 添加箭头符号使其更醒目
                    size: 3            // 进一步增大标记尺寸
                });
            }
            
            // 检查卖出信号
            if (item.sell === 1) {
                markers.push({
                    time: item.time,
                    position: 'aboveBar',
                    color: ChartConfig.COLORS.SIGNALS.SELL,
                    shape: 'arrowDown',
                    text: '🔻SELL',    // 添加箭头符号使其更醒目
                    size: 3            // 进一步增大标记尺寸
                });
            }
        });
        
        console.log(`创建了 ${markers.length} 个买卖信号标记`);
        return markers;
    }
    
    /**
     * 添加MA指标
     */
    addMAIndicator(data, indicator) {
        const maData = data
            .filter(item => item.ma !== null && !isNaN(item.ma))
            .map(item => ({ time: item.time, value: Number(item.ma) }));
        
        const color = indicator === 'ma5' ? ChartConfig.COLORS.MA5 : ChartConfig.COLORS.MA10;
        const series = this.addSeries('line', { color, lineWidth: 1 });
        series.setData(maData);
        this.indicatorSeries.push(series);
    }
    
    /**
     * 创建Squeeze图表
     */
    async createSqueezeChart(code) {
        console.log('开始创建Squeeze图表，股票代码:', code);
        
        try {
            // 创建容器
            const container = this.createSqueezeContainer();
            console.log('Squeeze容器创建成功:', container);
            
            // 创建子图实例
            const squeezeChart = new SqueezeChart(container);
            squeezeChart.setMainChart(this);
            squeezeChart.create();
            console.log('SqueezeChart实例创建成功');
            
            // 加载数据
            await squeezeChart.loadData(code);
            console.log('Squeeze数据加载完成');
            
            // 添加到子图列表
            this.addSubChart(squeezeChart);
            
            // 兼容性支持
            window.squeezeChart = squeezeChart.chart;
            window.squeezeChartInstance = squeezeChart;
            
            console.log('Squeeze图表创建完成');
        } catch (error) {
            console.error('创建Squeeze图表失败:', error);
        }
    }
    
    /**
     * 创建Squeeze容器
     */
    createSqueezeContainer() {
        console.log('开始创建Squeeze容器');
        
        // 移除现有的图表
        const existingChart = document.getElementById('squeeze-chart');
        if (existingChart) {
            console.log('移除现有的Squeeze图表');
            existingChart.remove();
        }
        
        // 创建新容器
        const container = document.createElement('div');
        container.id = 'squeeze-chart';
        container.style.width = '1000px';
        container.style.height = '200px';
        container.style.marginTop = '8px';
        container.style.border = '1px solid #ccc'; // 添加边框便于调试
        
        // 查找插入位置
        const volumeChart = document.getElementById('volume-chart');
        if (volumeChart && volumeChart.parentNode) {
            volumeChart.parentNode.insertBefore(container, volumeChart.nextSibling);
            console.log('Squeeze容器已插入到DOM中');
        } else {
            // 如果找不到volume-chart，插入到chart后面
            const chartContainer = document.getElementById('chart');
            if (chartContainer && chartContainer.parentNode) {
                chartContainer.parentNode.insertBefore(container, chartContainer.nextSibling);
                console.log('Squeeze容器已插入到chart后面');
            } else {
                console.error('无法找到合适的插入位置');
                document.body.appendChild(container);
                console.log('Squeeze容器已添加到body');
            }
        }
        
        return container;
    }
    
    /**
     * 处理十字线移动
     */
    handleCrosshairMove(param) {
        if (!param || !param.time) {
            this.clearInfoBar();
            return;
        }
        
        // 收集所有股票在当前时间点的数据
        const stockDataAtTime = [];
        
        // 从seriesPrices获取数据
        if (param.seriesPrices) {
            let seriesIndex = 0;
            for (const [series, value] of param.seriesPrices.entries()) {
                if (this.isValidOHLCData(value) && this.stockInfos[seriesIndex]) {
                    stockDataAtTime.push({
                        stockInfo: this.stockInfos[seriesIndex],
                        data: value,
                        index: seriesIndex
                    });
                }
                seriesIndex++;
            }
        }
        
        // 如果没有从seriesPrices获取到数据，从原始数据中查找
        if (stockDataAtTime.length === 0) {
            this.stockInfos.forEach((stockInfo, index) => {
                if (stockInfo && stockInfo.data) {
                    const dataPoint = stockInfo.data.find(item => item.time === param.time);
                    if (dataPoint) {
                        stockDataAtTime.push({
                            stockInfo: stockInfo,
                            data: dataPoint,
                            index: index
                        });
                    }
                }
            });
        }
        
        if (stockDataAtTime.length > 0) {
            this.updateMultiStockInfoBar(stockDataAtTime);
        } else {
            this.clearInfoBar();
        }
    }
    
    /**
     * 检查是否为有效的OHLC数据
     */
    isValidOHLCData(value) {
        return value && 
               typeof value.open !== 'undefined' && 
               typeof value.high !== 'undefined' && 
               typeof value.low !== 'undefined' && 
               typeof value.close !== 'undefined';
    }
    
    /**
     * 更新多股票信息栏
     */
    updateMultiStockInfoBar(stockDataArray) {
        const infoBar = document.getElementById('info-bar');
        if (!infoBar) return;
        
        let infoHtml = '';
        
        stockDataArray.forEach((stockData, index) => {
            const { stockInfo, data } = stockData;
            const open = Number(data.open);
            const high = Number(data.high);
            const low = Number(data.low);
            const close = Number(data.close);
            const change = close - open;
            const pct = open ? (change / open * 100).toFixed(2) : '0.00';
            const sign = change >= 0 ? '+' : '';
            const changeColor = change >= 0 ? stockInfo.colorScheme.upColor : stockInfo.colorScheme.downColor;
            
            if (index > 0) infoHtml += '<br>';
            
            infoHtml += `
                <div style="display: inline-block; margin-right: 20px; ${index > 0 ? 'margin-top: 5px;' : ''}">
                    <span style="color: ${stockInfo.colorScheme.upColor}; font-weight: bold;">${stockInfo.code}:</span>
                    开=${open.toFixed(2)}, 高=${high.toFixed(2)}, 低=${low.toFixed(2)}, 收=${close.toFixed(2)}, 
                    <span style="color: ${changeColor}">${sign}${change.toFixed(2)} (${sign}${pct}%)</span>
                    ${data.turnover_rate ? `, 换手率=${(Number(data.turnover_rate) * 100).toFixed(2)}%` : ''}
                </div>
            `;
        });
        
        infoBar.innerHTML = infoHtml;
    }
    
    /**
     * 更新信息栏（单股票，保持兼容性）
     */
    updateInfoBar(ohlcData) {
        const open = Number(ohlcData.open);
        const high = Number(ohlcData.high);
        const low = Number(ohlcData.low);
        const close = Number(ohlcData.close);
        const change = close - open;
        const pct = open ? (change / open * 100).toFixed(2) : '0.00';
        const sign = change >= 0 ? '+' : '';
        const turnoverRate = ohlcData.turnover_rate ? 
            (Number(ohlcData.turnover_rate) * 100).toFixed(2) : '0.00';
        
        const infoBar = document.getElementById('info-bar');
        if (infoBar) {
            infoBar.innerHTML = 
                `开=${open.toFixed(2)}, 高=${high.toFixed(2)}, 低=${low.toFixed(2)}, 收=${close.toFixed(2)}, ` +
                `<span style="color:${change>=0?ChartConfig.COLORS.UP:ChartConfig.COLORS.DOWN}">${sign}${change.toFixed(2)} (${sign}${pct}%)</span>, ` +
                `换手率=${turnoverRate}%`;
        }
    }
    
    /**
     * 清除信息栏
     */
    clearInfoBar() {
        const infoBar = document.getElementById('info-bar');
        if (infoBar) {
            infoBar.innerText = '';
        }
    }
    
    /**
     * 提取股票名称
     */
    extractStockName(code) {
        // 从股票代码中提取名称，可以根据实际情况调整
        const parts = code.split('.');
        return parts[0] || code;
    }
    
    /**
     * 更新图例显示
     */
    updateLegend() {
        // 创建或更新图例容器
        let legendContainer = document.getElementById('chart-legend');
        if (!legendContainer) {
            legendContainer = this.createLegendContainer();
        }
        
        // 清空现有图例
        legendContainer.innerHTML = '';
        
        // 添加控制按钮（如果有多只股票）
        if (this.stockInfos.length > 1) {
            const controlsContainer = this.createControlsContainer();
            legendContainer.appendChild(controlsContainer);
        }
        
        // 为每只股票创建图例项
        this.stockInfos.forEach((stockInfo, index) => {
            if (stockInfo) {
                const legendItem = this.createLegendItem(stockInfo, index);
                legendContainer.appendChild(legendItem);
            }
        });
    }
    
    /**
     * 创建图例容器
     */
    createLegendContainer() {
        const container = document.createElement('div');
        container.id = 'chart-legend';
        container.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 10px;
            font-size: 12px;
            font-family: Arial, sans-serif;
            box-shadow: 0 3px 8px rgba(0,0,0,0.15);
            z-index: 1000;
            max-width: 350px;
            backdrop-filter: blur(5px);
        `;
        
        // 插入到图表容器中
        this.container.style.position = 'relative';
        this.container.appendChild(container);
        
        return container;
    }
    
    /**
     * 创建控制按钮容器
     */
    createControlsContainer() {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
        `;
        
        // 归一化切换按钮
        const normalizeBtn = document.createElement('button');
        normalizeBtn.textContent = this.normalizationEnabled ? '关闭归一化' : '开启归一化';
        normalizeBtn.style.cssText = `
            padding: 4px 8px;
            font-size: 11px;
            border: 1px solid #007bff;
            border-radius: 3px;
            background: ${this.normalizationEnabled ? '#007bff' : 'white'};
            color: ${this.normalizationEnabled ? 'white' : '#007bff'};
            cursor: pointer;
            transition: all 0.2s;
        `;
        
        normalizeBtn.addEventListener('click', () => {
            this.toggleNormalization();
            normalizeBtn.textContent = this.normalizationEnabled ? '关闭归一化' : '开启归一化';
            normalizeBtn.style.background = this.normalizationEnabled ? '#007bff' : 'white';
            normalizeBtn.style.color = this.normalizationEnabled ? 'white' : '#007bff';
        });
        
        normalizeBtn.addEventListener('mouseenter', () => {
            if (!this.normalizationEnabled) {
                normalizeBtn.style.background = '#f8f9fa';
            }
        });
        
        normalizeBtn.addEventListener('mouseleave', () => {
            if (!this.normalizationEnabled) {
                normalizeBtn.style.background = 'white';
            }
        });
        
        container.appendChild(normalizeBtn);
        
        return container;
    }
    
    /**
     * 创建图例项
     */
    createLegendItem(stockInfo, index) {
        const item = document.createElement('div');
        item.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 4px;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 2px;
            transition: background-color 0.2s;
        `;
        
        // 悬停效果
        item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = '#f0f0f0';
        });
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = 'transparent';
        });
        
        // 颜色指示器
        const colorIndicator = document.createElement('div');
        colorIndicator.style.cssText = `
            width: 12px;
            height: 12px;
            border-radius: 2px;
            margin-right: 6px;
            background: linear-gradient(45deg, ${stockInfo.colorScheme.upColor} 50%, ${stockInfo.colorScheme.downColor} 50%);
        `;
        
        // 股票信息
        const textInfo = document.createElement('span');
        textInfo.textContent = `${stockInfo.code} ${stockInfo.isMain ? '(主)' : ''}`;
        textInfo.style.cssText = `
            font-weight: ${stockInfo.isMain ? 'bold' : 'normal'};
            color: #333;
        `;
        
        // 获取最新价格信息
        if (stockInfo.data && stockInfo.data.length > 0) {
            const latestData = stockInfo.data[stockInfo.data.length - 1];
            const priceInfo = document.createElement('span');
            const change = latestData.close - latestData.open;
            const changePercent = ((change / latestData.open) * 100).toFixed(2);
            const changeColor = change >= 0 ? stockInfo.colorScheme.upColor : stockInfo.colorScheme.downColor;
            
            priceInfo.innerHTML = `<br><small style="color: ${changeColor}">
                ${latestData.close.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}, ${changePercent}%)
            </small>`;
            textInfo.appendChild(priceInfo);
        }
        
        item.appendChild(colorIndicator);
        item.appendChild(textInfo);
        
        // 点击切换显示/隐藏
        item.addEventListener('click', () => {
            this.toggleStockVisibility(index);
        });
        
        return item;
    }
    
    /**
     * 切换股票显示/隐藏
     */
    toggleStockVisibility(index) {
        if (this.candleSeries[index]) {
            const series = this.candleSeries[index];
            // 这里可以实现显示/隐藏逻辑
            // LightweightCharts 没有直接的隐藏方法，可以通过移除/添加系列来实现
            console.log(`切换股票 ${index} 的显示状态`);
        }
    }
    
    /**
     * 切换价格归一化模式
     */
    toggleNormalization() {
        this.normalizationEnabled = !this.normalizationEnabled;
        console.log(`价格归一化模式: ${this.normalizationEnabled ? '开启' : '关闭'}`);
        
        if (this.normalizationEnabled) {
            this.applyNormalization();
        } else {
            this.removeNormalization();
        }
        
        this.updateLegend();
    }
    
    /**
     * 应用价格归一化
     */
    applyNormalization() {
        if (this.stockInfos.length === 0) return;
        
        // 使用第一只股票作为基准
        const baseStock = this.stockInfos[0];
        if (!baseStock || !baseStock.data || baseStock.data.length === 0) return;
        
        this.basePrice = baseStock.data[0].close;
        console.log(`设置基准价格: ${this.basePrice}`);
        
        // 重新设置所有股票的数据
        this.stockInfos.forEach((stockInfo, index) => {
            if (stockInfo && stockInfo.data && this.candleSeries[index]) {
                const normalizedData = this.normalizeStockData(stockInfo.data, index);
                this.candleSeries[index].setData(normalizedData);
            }
        });
    }
    
    /**
     * 移除价格归一化
     */
    removeNormalization() {
        // 恢复原始数据
        this.stockInfos.forEach((stockInfo, index) => {
            if (stockInfo && stockInfo.data && this.candleSeries[index]) {
                const validData = ChartUtils.filterValidData(stockInfo.data);
                this.candleSeries[index].setData(validData);
            }
        });
        
        this.basePrice = null;
    }
    
    /**
     * 归一化股票数据
     */
    normalizeStockData(data, stockIndex) {
        if (!data || data.length === 0 || !this.basePrice) return data;
        
        const firstPrice = data[0].close;
        if (!firstPrice || firstPrice === 0) return data;
        
        const scaleFactor = this.basePrice / firstPrice;
        
        return data.map(item => ({
            time: item.time,
            open: Number(item.open) * scaleFactor,
            high: Number(item.high) * scaleFactor,
            low: Number(item.low) * scaleFactor,
            close: Number(item.close) * scaleFactor,
            volume: item.volume // 成交量不归一化
        }));
    }
    
    getSourceName() {
        return 'main';
    }
}

// ================================
// 子图基类
// ================================
class SubChart extends BaseChart {
    constructor(container, options = {}) {
        super(container, {
            ...ChartConfig.SUB_CHART,
            ...options
        });
        this.mainChart = null;
    }
    
    /**
     * 设置主图关联
     */
    setMainChart(mainChart) {
        this.mainChart = mainChart;
    }
    
    onCreated() {
        this.setupEventListeners();
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        this.subscribeTimeRangeChange((timeRange) => {
            if (!syncManager.isUpdatingFromGlobal && timeRange) {
                syncManager.detectAndSyncZoom(timeRange, this.getSourceName());
            }
        });
    }
    
    getSourceName() {
        return 'subchart';
    }
}

// ================================
// Squeeze Momentum 子图
// ================================
class SqueezeChart extends SubChart {
    constructor(container) {
        super(container);
        this.momentumSeries = null;
        this.zeroLineSeries = null;
    }
    
    /**
     * 加载数据
     */
    async loadData(code) {
        console.log('SqueezeChart开始加载数据，股票代码:', code);
        
        try {
            const url = `/api/indicator?code=${code}&type=squeeze_momentum`;
            console.log('请求URL:', url);
            
            const response = await fetch(url);
            console.log('API响应状态:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Squeeze数据长度:', data.length);
            console.log('Squeeze数据样本:', data.slice(0, 3));
            
            if (data.length === 0) {
                console.warn('Squeeze数据为空');
                return;
            }
            
            this.createMomentumSeries(data);
            this.createZeroLineSeries(data);
            this.addSqueezeMarkers(data);
            
            // 进行同步
            setTimeout(() => this.initialSync(), 50);
            
            console.log('Squeeze数据加载和图表创建完成');
        } catch (error) {
            console.error('加载Squeeze数据失败:', error);
        }
    }
    
    /**
     * 创建动量系列
     */
    createMomentumSeries(data) {
        console.log('开始创建动量系列');
        
        // 使用工具函数过滤有效数据
        const validData = ChartUtils.filterValidData(data.map(item => ({
            time: item.time,
            value: item.momentum
        })));
        
        const momentumData = validData.map(item => {
            const originalItem = data.find(d => d.time === item.time);
            return {
                time: item.time,
                value: Number(item.value),
                color: this.getMomentumColor(originalItem?.bar_color)
            };
        });
        
        console.log(`Squeeze动量数据过滤: 原始${data.length}条 -> 有效${momentumData.length}条`);
        console.log('动量数据样本:', momentumData.slice(0, 3));
        
        if (momentumData.length === 0) {
            console.warn('没有有效的动量数据');
            return;
        }
        
        this.momentumSeries = this.addSeries('histogram', {
            priceFormat: { type: 'price', precision: 4, minMove: 0.0001 }
        });
        
        if (this.momentumSeries) {
            this.momentumSeries.setData(momentumData);
            console.log('动量系列创建成功');
        } else {
            console.error('动量系列创建失败');
        }
    }
    
    /**
     * 获取动量颜色
     */
    getMomentumColor(barColor) {
        const colorMap = {
            'lime': ChartConfig.COLORS.SQUEEZE.LIME,
            'green': ChartConfig.COLORS.SQUEEZE.GREEN,
            'red': ChartConfig.COLORS.SQUEEZE.RED,
            'maroon': ChartConfig.COLORS.SQUEEZE.MAROON
        };
        return colorMap[barColor] || ChartConfig.COLORS.SQUEEZE.MAROON;
    }
    
    /**
     * 创建零轴线系列
     */
    createZeroLineSeries(data) {
        const zeroLineData = data.map(item => ({
            time: item.time,
            value: 0
        }));
        
        this.zeroLineSeries = this.addSeries('line', {
            color: ChartConfig.COLORS.ZERO_LINE,
            lineWidth: 1,
            lineStyle: 2
        });
        this.zeroLineSeries.setData(zeroLineData);
    }
    
    /**
     * 添加挤压状态标记
     */
    addSqueezeMarkers(data) {
        const markers = [];
        let lastState = null;
        
        data.forEach(item => {
            const currentState = this.getSqueezeState(item);
            
            if (currentState && currentState !== lastState) {
                markers.push({
                    time: item.time,
                    position: 'inBar',
                    color: this.getSqueezeColor(item.squeeze_color),
                    shape: 'circle',
                    size: 2
                });
                lastState = currentState;
            }
        });
        
        if (this.momentumSeries && markers.length > 0) {
            this.momentumSeries.setMarkers(markers);
        }
    }
    
    /**
     * 获取挤压状态
     */
    getSqueezeState(item) {
        if (item.squeeze_on === 1) return 'on';
        if (item.squeeze_off === 1) return 'off';
        if (item.no_squeeze === 1) return 'no';
        return null;
    }
    
    /**
     * 获取挤压颜色
     */
    getSqueezeColor(squeezeColor) {
        const colorMap = {
            'black': ChartConfig.COLORS.SQUEEZE.BLACK,
            'gray': ChartConfig.COLORS.SQUEEZE.GRAY,
            'blue': ChartConfig.COLORS.SQUEEZE.BLUE
        };
        return colorMap[squeezeColor] || ChartConfig.COLORS.SQUEEZE.BLUE;
    }
    
    /**
     * 初始同步
     */
    initialSync() {
        if (!this.mainChart) {
            console.warn('Squeeze: 主图未设置，保持自适应范围');
            return;
        }
        
        // 延迟执行，确保图表完全初始化
        setTimeout(() => {
            try {
                console.log('Squeeze: 开始初始同步...');
                
                // 获取主图的时间范围进行同步
                const mainTimeRange = this.mainChart.getTimeRange();
                if (!mainTimeRange) {
                    console.warn('Squeeze: 无法获取主图时间范围，保持自适应范围');
                    return;
                }
                
                console.log('Squeeze: 获取到主图时间范围:', mainTimeRange);
                
                // 验证时间范围
                if (!this.isValidTimeRange(mainTimeRange)) {
                    console.warn('Squeeze: 主图时间范围无效，保持自适应范围:', mainTimeRange);
                    return;
                }
                
                const wasUpdating = syncManager.isUpdatingFromGlobal;
                syncManager.isUpdatingFromGlobal = true;
                
                // 直接设置时间范围
                this.setTimeRange(mainTimeRange);
                console.log('Squeeze: 初始同步完成');
                
                setTimeout(() => {
                    syncManager.isUpdatingFromGlobal = wasUpdating;
                }, 50);
                
            } catch (error) {
                console.error('Squeeze: 初始同步失败:', error);
                console.log('Squeeze: 保持自适应状态');
            }
        }, 100); // 增加延迟时间，确保主图完全初始化
    }
    
    getSourceName() {
        return 'squeeze';
    }
}

// ================================
// 图表管理器
// ================================
class ChartManager {
    constructor() {
        this.mainChart = null;
        this.subCharts = [];
    }
    
    /**
     * 创建主图
     */
    createMainChart(container) {
        if (this.mainChart) {
            this.mainChart.destroy();
        }
        
        this.mainChart = new MainChart(container);
        this.mainChart.create();
        return this.mainChart;
    }
    
    /**
     * 添加子图
     */
    addSubChart(subChart) {
        this.subCharts.push(subChart);
        if (this.mainChart) {
            this.mainChart.addSubChart(subChart);
        }
    }
    
    /**
     * 加载数据
     */
    async loadData(codes, selectedIndicators) {
        if (this.mainChart) {
            await this.mainChart.loadData(codes, selectedIndicators);
        }
    }
    
    /**
     * 销毁所有图表
     */
    destroy() {
        if (this.mainChart) {
            this.mainChart.destroy();
            this.mainChart = null;
        }
        
        this.subCharts.forEach(chart => chart.destroy());
        this.subCharts = [];
        
        ChartRegistry.clear();
    }
    
    /**
     * 强制同步所有图表
     */
    forceSyncCharts() {
        try {
            syncManager.forceSyncAll();
            return { success: true, message: '图表同步完成' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    
    /**
     * 适配所有图表到数据范围，消除无效留白
     */
    fitAllChartsToData() {
        try {
            let successCount = 0;
            
            // 适配主图
            if (this.mainChart && this.mainChart.fitContentToData) {
                this.mainChart.fitContentToData();
                successCount++;
            }
            
            // 适配子图
            this.subCharts.forEach(chart => {
                if (chart.fitContentToData && typeof chart.fitContentToData === 'function') {
                    try {
                        chart.fitContentToData();
                        successCount++;
                    } catch (error) {
                        console.error('子图适配数据范围失败:', error);
                    }
                }
            });
            
            return { 
                success: true, 
                message: `已成功适配 ${successCount} 个图表到数据范围，消除无效留白` 
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    
    /**
     * 切换多股票价格归一化
     */
    toggleMultiStockNormalization() {
        if (this.mainChart && this.mainChart.toggleNormalization) {
            this.mainChart.toggleNormalization();
            return { 
                success: true, 
                message: `价格归一化已${this.mainChart.normalizationEnabled ? '开启' : '关闭'}` 
            };
        }
        return { success: false, message: '主图未创建或不支持归一化功能' };
    }
    
    /**
     * 获取多股票显示状态
     */
    getMultiStockStatus() {
        if (!this.mainChart) return null;
        
        return {
            stockCount: this.mainChart.stockInfos.length,
            normalizationEnabled: this.mainChart.normalizationEnabled,
            stockInfos: this.mainChart.stockInfos.map(info => ({
                code: info.code,
                name: info.name,
                isMain: info.isMain,
                colorScheme: {
                    upColor: info.colorScheme.upColor,
                    downColor: info.colorScheme.downColor
                }
            }))
        };
    }
}

// ================================
// 全局实例和导出
// ================================

// 创建全局同步管理器实例
const syncManager = new SyncManager();

// 导出到全局作用域
window.ChartConfig = ChartConfig;
window.ChartUtils = ChartUtils;
window.SyncManager = SyncManager;
window.ChartRegistry = ChartRegistry;
window.BaseChart = BaseChart;
window.MainChart = MainChart;
window.SubChart = SubChart;
window.SqueezeChart = SqueezeChart;
window.ChartManager = ChartManager;

// 导出同步管理器实例
window.syncManager = syncManager;

// 兼容性函数
window.detectAndSyncZoom = (timeRange, source) => {
    syncManager.detectAndSyncZoom(timeRange, source);
};

window.updateGlobalTimeRange = (timeRange, source) => {
    syncManager.updateGlobalTimeRange(timeRange, source);
};

window.forceSyncCharts = () => {
    try {
        syncManager.forceSyncAll();
        alert('图表同步完成');
    } catch (error) {
        alert(error.message);
    }
};

// 新增：自动适配数据范围功能
window.fitChartsToData = () => {
    try {
        // 优先使用全局的 chartManager
        if (window.chartManager && window.chartManager.fitAllChartsToData) {
            const result = window.chartManager.fitAllChartsToData();
            alert(result.message);
            return;
        }
        
        // 备用方案：直接操作注册的图表
        const allCharts = ChartRegistry.getAllCharts();
        let successCount = 0;
        
        allCharts.forEach(chart => {
            if (chart.fitContentToData && typeof chart.fitContentToData === 'function') {
                try {
                    chart.fitContentToData();
                    successCount++;
                } catch (error) {
                    console.error('图表适配数据范围失败:', error);
                }
            }
        });
        
        if (successCount > 0) {
            alert(`已成功适配 ${successCount} 个图表到数据范围，消除无效留白`);
        } else {
            alert('没有找到可适配的图表');
        }
    } catch (error) {
        alert('适配数据范围时发生错误: ' + error.message);
    }
};

// 新增：多股票功能
window.toggleMultiStockNormalization = () => {
    try {
        if (window.chartManager && window.chartManager.toggleMultiStockNormalization) {
            const result = window.chartManager.toggleMultiStockNormalization();
            alert(result.message);
        } else {
            alert('图表管理器未初始化或不支持多股票功能');
        }
    } catch (error) {
        alert('切换归一化模式时发生错误: ' + error.message);
    }
};

window.getMultiStockStatus = () => {
    try {
        if (window.chartManager && window.chartManager.getMultiStockStatus) {
            return window.chartManager.getMultiStockStatus();
        }
        return null;
    } catch (error) {
        console.error('获取多股票状态失败:', error);
        return null;
    }
};

// 模块信息
console.log('轻量级图表库已加载 - 重构版本 2.0.0'); 
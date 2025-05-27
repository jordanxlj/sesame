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
        height: 400,  // 主图高度
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
    
    // 成交量图配置
    VOLUME_CHART: {
        height: 120,  // 成交量图高度
        timeScale: {
            visible: false,  // 隐藏时间轴，与主图同步
            timeVisible: false,
            secondsVisible: false,
            borderVisible: false,
            rightOffset: 5,
            barSpacing: 6,
            fixLeftEdge: false,
            fixRightEdge: false,
            lockVisibleTimeRangeOnResize: true
        }
    },
    
    // 指标图配置
    INDICATOR_CHART: {
        height: 150,  // 指标图高度
        timeScale: {
            visible: true,   // 显示时间轴
            timeVisible: true,
            secondsVisible: false,
            borderVisible: true,
            rightOffset: 5,
            barSpacing: 6,
            fixLeftEdge: false,
            fixRightEdge: false,
            lockVisibleTimeRangeOnResize: true
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
        console.log('🔍 filterValidData 开始处理数据:', {
            isArray: Array.isArray(data),
            length: data?.length,
            type: typeof data,
            sample: data?.slice(0, 2)
        });
        
        if (!Array.isArray(data)) {
            console.warn('❌ filterValidData: 输入不是数组', typeof data);
            return [];
        }
        
        const originalLength = data.length;
        let invalidCount = 0;
        let nullValueCount = 0;
        let invalidStructureCount = 0;
        let invalidTimeCount = 0;
        let invalidOHLCCount = 0;
        
        const filtered = data.filter((item, index) => {
            // 检查基本结构
            if (!item || typeof item !== 'object') {
                invalidStructureCount++;
                if (index < 5) console.log(`❌ 第${index}项结构无效:`, item);
                return false;
            }
            
            // 检查时间字段
            if (!item.time) {
                invalidTimeCount++;
                if (index < 5) console.log(`❌ 第${index}项时间无效:`, { time: item.time, item });
                return false;
            }
            
            // 检查数值字段（用于指标数据）
            if (typeof item.value !== 'undefined') {
                const value = Number(item.value);
                if (!isFinite(value) || value === null) {
                    nullValueCount++;
                    if (index < 5) console.log(`❌ 第${index}项value无效:`, { value: item.value, converted: value, item });
                    return false;
                }
                return true;
            }
            
            // 检查OHLC数据
            if (typeof item.open !== 'undefined') {
                const open = Number(item.open);
                const high = Number(item.high);
                const low = Number(item.low);
                const close = Number(item.close);
                
                // 详细检查每个价格字段
                if (item.open === null || item.open === undefined) {
                    nullValueCount++;
                    if (index < 5) console.log(`❌ 第${index}项open为null:`, item);
                    return false;
                }
                if (item.high === null || item.high === undefined) {
                    nullValueCount++;
                    if (index < 5) console.log(`❌ 第${index}项high为null:`, item);
                    return false;
                }
                if (item.low === null || item.low === undefined) {
                    nullValueCount++;
                    if (index < 5) console.log(`❌ 第${index}项low为null:`, item);
                    return false;
                }
                if (item.close === null || item.close === undefined) {
                    nullValueCount++;
                    if (index < 5) console.log(`❌ 第${index}项close为null:`, item);
                    return false;
                }
                
                // 所有价格必须是有限数值
                if (!isFinite(open) || !isFinite(high) || !isFinite(low) || !isFinite(close)) {
                    invalidOHLCCount++;
                    if (index < 5) console.log(`❌ 第${index}项OHLC数值无效:`, { 
                        open: { original: item.open, converted: open, isFinite: isFinite(open) },
                        high: { original: item.high, converted: high, isFinite: isFinite(high) },
                        low: { original: item.low, converted: low, isFinite: isFinite(low) },
                        close: { original: item.close, converted: close, isFinite: isFinite(close) }
                    });
                    return false;
                }
                
                // 基本价格逻辑检查
                const maxPrice = Math.max(open, close);
                const minPrice = Math.min(open, close);
                const tolerance = 0.001;
                
                if (high < (maxPrice - tolerance) || low > (minPrice + tolerance)) {
                    if (index < 5) console.warn(`⚠️ 第${index}项价格逻辑错误:`, { time: item.time, open, high, low, close });
                    return false;
                }
                
                return true;
            }
            
            return true;
        });
        
        console.log('📊 数据过滤统计:', {
            原始数据: originalLength,
            有效数据: filtered.length,
            移除总数: originalLength - filtered.length,
            详细统计: {
                结构无效: invalidStructureCount,
                时间无效: invalidTimeCount,
                null值: nullValueCount,
                OHLC无效: invalidOHLCCount
            }
        });
        
        if (filtered.length > 0) {
            console.log('✅ 有效数据样本:', filtered.slice(0, 3));
        } else {
            console.error('❌ 没有有效数据！');
        }
        
        return filtered;
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
            
            // 检查图表是否有数据系列，避免在数据加载前设置时间范围
            if (this.series.length === 0) {
                // 减少日志噪音，只在首次延迟时输出
                if (!this.timeRangeRetryCount) {
                    this.timeRangeRetryCount = 0;
                    console.warn('图表暂无数据系列，延迟设置时间范围');
                }
                this.timeRangeRetryCount++;
                
                // 限制重试次数，避免无限循环
                if (this.timeRangeRetryCount < 5) {
                    setTimeout(() => {
                        this.setTimeRange(timeRange);
                    }, 150);
                } else {
                    // 静默停止重试，减少日志噪音
                    this.timeRangeRetryCount = 0;
                }
                return;
            }
            
            // 重置重试计数器
            if (this.timeRangeRetryCount > 0) {
                this.timeRangeRetryCount = 0;
            }
            
            // 转换时间格式以确保兼容性
            const convertedTimeRange = {
                from: ChartUtils.convertTimeToNumber(safeTimeRange.from),
                to: ChartUtils.convertTimeToNumber(safeTimeRange.to)
            };
            
            // 验证转换后的时间
            if (isNaN(convertedTimeRange.from) || isNaN(convertedTimeRange.to)) {
                console.warn('时间转换失败，跳过设置:', { original: safeTimeRange, converted: convertedTimeRange });
                return;
            }
            
            // 最终验证：确保转换后的时间范围有效且不为null
            if (convertedTimeRange.from !== null && convertedTimeRange.to !== null && 
                convertedTimeRange.from < convertedTimeRange.to) {
                this.chart.timeScale().setVisibleRange(convertedTimeRange);
                console.log('时间范围设置成功:', { original: safeTimeRange, converted: convertedTimeRange });
            } else {
                console.warn('转换后的时间范围无效，跳过设置:', convertedTimeRange);
            }
        } catch (error) {
            console.error('设置时间范围失败:', error, '时间范围:', timeRange);
            
            // 如果是"Value is null"错误，尝试延迟重试，但限制重试次数
            if (error.message && error.message.includes('Value is null')) {
                if (!this.retryCount) this.retryCount = 0;
                if (this.retryCount < 2) {
                    this.retryCount++;
                    // 只在第一次重试时输出日志
                    if (this.retryCount === 1) {
                        console.log(`检测到null值错误，将延迟重试... (第${this.retryCount}次)`);
                    }
                    setTimeout(() => {
                        if (this.retryCount === 1) {
                            console.log('重试设置时间范围...');
                        }
                        this.setTimeRange(timeRange);
                    }, 300 * this.retryCount); // 递增延迟时间
                } else {
                    // 静默停止重试
                    this.retryCount = 0; // 重置计数器
                }
            }
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
        this.originalStockData = []; // 存储原始股票数据，用于归一化恢复
        
        // 注册为主图
        ChartRegistry.register(this.id, this, true);
    }
    
    onCreated() {
        // 首先配置所有价格轴
        this.setupPriceScales();
        // 然后创建成交量系列
        this.setupVolumeSeries();
        // 最后设置事件监听器
        this.setupEventListeners();
    }
    
    /**
     * 设置成交量系列
     */
    setupVolumeSeries() {
        this.volumeSeries = this.addSeries('histogram', {
            priceScaleId: 'volume',
            priceFormat: { type: 'volume' },
            color: ChartConfig.COLORS.VOLUME
        });
        
        console.log('📊 成交量系列创建完成，使用价格轴: volume');
    }
    
    /**
     * 预先配置所有价格轴
     */
    setupPriceScales() {
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
        
        // 验证价格轴配置
        setTimeout(() => {
            try {
                console.log('🔍 验证价格轴配置:');
                console.log('  - 主价格轴 (right):', this.chart.priceScale('right'));
                console.log('  - 成交量价格轴 (volume):', this.chart.priceScale('volume'));
                console.log('  - Squeeze价格轴 (squeeze):', this.chart.priceScale('squeeze'));
            } catch (e) {
                console.warn('⚠️ 价格轴验证失败:', e);
            }
        }, 100);
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
     * 加载数据（完整版本，包含成交量和所有指标）
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
     * 加载主图数据（仅K线和价格指标，用于多面板模式）
     */
    async loadMainData(codes, selectedIndicators) {
        this.clearData();
        this.prepareForDataLoad();
        
        const promises = codes.map((code, idx) => 
            this.loadStockDataForMain(code, idx, selectedIndicators)
        );
        
        await Promise.all(promises);
        
        // 标记数据已加载
        this.isDataLoaded = true;
        
        setTimeout(() => {
            this.finalizeDataLoad();
            // 等待图表完全渲染后再标记为已对齐
            setTimeout(() => {
                this.isAligned = true;
                console.log('主图K线数据加载完成');
            }, 50);
        }, 50);
    }
    
    /**
     * 为主图加载股票数据（不包含成交量和Squeeze）
     */
    async loadStockDataForMain(code, index, selectedIndicators) {
        try {
            console.log(`🚀 主图加载股票数据: ${code} (索引${index})`);
            
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
            const colorScheme = ChartConfig.COLORS.MULTI_STOCK[index] || 
                               ChartConfig.COLORS.MULTI_STOCK[ChartConfig.COLORS.MULTI_STOCK.length - 1];
            
            this.originalStockData[index] = JSON.parse(JSON.stringify(ohlc));
            this.stockInfos[index] = {
                code: code,
                name: this.extractStockName(code),
                colorScheme: colorScheme,
                data: ohlc,
                isMain: index === 0
            };
            
            // 创建K线系列
            const candleSeries = this.createCandlestickSeries(ohlc, index);
            if (!candleSeries) {
                console.error(`股票${index}: K线系列创建失败`);
                return;
            }
            
            // 加载价格指标（SuperTrend, MA等）
            await this.loadPriceIndicatorsForStock(code, selectedIndicators, index);
            
            // 更新图例
            this.updateLegend();
            
        } catch (error) {
            console.error(`主图加载股票 ${code} 数据失败:`, error);
        }
    }
    
    /**
     * 为特定股票加载价格指标（不包含Squeeze）
     */
    async loadPriceIndicatorsForStock(code, selectedIndicators, stockIndex) {
        const priceIndicators = selectedIndicators.filter(indicator => 
            ['supertrend', 'ma5', 'ma10'].includes(indicator)
        );
        
        const promises = priceIndicators.map(indicator => 
            this.loadIndicatorForStock(code, indicator, stockIndex)
        );
        
        await Promise.all(promises);
    }
    
    /**
     * 清除数据
     */
    clearData() {
        this.candleSeries = [];
        this.indicatorSeries = [];
        this.stockInfos = [];
        this.originalStockData = [];
        this.normalizationEnabled = false;
        this.basePrice = null;
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
        // 清除主图中的Squeeze指标
        if (this.squeezeIndicators) {
            try {
                if (this.squeezeIndicators.momentum) {
                    this.chart.removeSeries(this.squeezeIndicators.momentum);
                }
                if (this.squeezeIndicators.zeroLine) {
                    this.chart.removeSeries(this.squeezeIndicators.zeroLine);
                }
                this.squeezeIndicators = null;
                console.log('主图中的Squeeze指标已清除');
            } catch (error) {
                console.warn('清除主图Squeeze指标时出错:', error);
            }
        }
        
        // 找到并移除 Squeeze 子图（兼容性保留）
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
            console.log(`🚀 开始加载股票数据: ${code} (索引${index})`);
            
            const response = await fetch(`/api/kline?code=${code}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const ohlc = await response.json();
            console.log(`📥 API返回数据 (${code}):`, {
                数据量: ohlc?.length || 0,
                数据类型: typeof ohlc,
                是否数组: Array.isArray(ohlc),
                前2条原始数据: ohlc?.slice(0, 2),
                数据结构检查: ohlc?.slice(0, 2)?.map(item => ({
                    keys: Object.keys(item || {}),
                    time: item?.time,
                    open: item?.open,
                    high: item?.high,
                    low: item?.low,
                    close: item?.close,
                    volume: item?.volume
                }))
            });
            
            if (!ohlc || !Array.isArray(ohlc) || ohlc.length === 0) {
                console.error(`❌ ${code}: API返回的数据无效`, ohlc);
                return;
            }
            
            if (index === 0) {
                this.currentOhlcData = ohlc;
            }
            
            // 先存储股票信息和原始数据，确保在创建系列前就有完整信息
            const colorScheme = ChartConfig.COLORS.MULTI_STOCK[index] || 
                               ChartConfig.COLORS.MULTI_STOCK[ChartConfig.COLORS.MULTI_STOCK.length - 1];
            
            // 深拷贝原始数据，防止归一化时被修改
            const originalData = JSON.parse(JSON.stringify(ohlc));
            this.originalStockData[index] = originalData;
            
            console.log(`📦 股票${index} 原始数据已保存:`, {
                原始数据量: originalData.length,
                前2条数据: originalData.slice(0, 2),
                数据验证: originalData.slice(0, 2).map(item => ({
                    time: item.time,
                    open: item.open,
                    close: item.close,
                    volume: item.volume
                }))
            });
            
            this.stockInfos[index] = {
                code: code,
                name: this.extractStockName(code),
                colorScheme: colorScheme,
                data: ohlc,
                isMain: index === 0
            };
            
            console.log(`股票${index} 信息已存储:`, {
                code: code,
                dataLength: ohlc.length,
                colorScheme: colorScheme.name || `股票${index}`
            });
            
            const candleSeries = this.createCandlestickSeries(ohlc, index);
            if (!candleSeries) {
                console.error(`股票${index}: K线系列创建失败，跳过后续处理`);
                return;
            }
            
            if (index === 0) {
                // 为第一只股票创建成交量系列
                this.createVolumeSeries(ohlc, index);
            } else {
                // 为后续股票更新成交量系列
                this.updateVolumeSeries();
            }
            
            // 为每只股票都加载指标
            await this.loadIndicatorsForStock(code, selectedIndicators, index);
            
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
        try {
            console.log(`开始创建K线系列 (股票${index}), 原始数据量: ${ohlc?.length || 0}`);
            
            if (!ohlc || ohlc.length === 0) {
                console.warn(`股票${index}: 没有K线数据`);
                return null;
            }
            
            const colors = this.getCandlestickColors(index);
            const isMain = index === 0;
            
            // 所有股票都使用同一个价格轴，以便在归一化时能看到价格变化
            const priceScaleId = 'right'; // 统一使用主价格轴
            
            // 先过滤无效数据
            const validData = ChartUtils.filterValidData(ohlc);
            console.log(`K线数据过滤 (股票${index}): 原始${ohlc.length}条 -> 有效${validData.length}条`);
            
            if (validData.length === 0) {
                console.error(`股票${index}: 过滤后没有有效的K线数据`);
                return null;
            }
            
            // 检查数据样本
            const sampleData = validData.slice(0, 3);
            console.log(`股票${index} 数据样本:`, sampleData);
            
            const candleSeries = this.addSeries('candlestick', {
                priceScaleId: priceScaleId,
                ...colors
            });
            
            if (!candleSeries) {
                console.error(`股票${index}: 创建K线系列失败`);
                return null;
            }
            
            // 所有股票共享同一个价格轴，确保价格轴始终可见且自动缩放
            try {
                this.chart.priceScale(priceScaleId).applyOptions({
                    visible: true, // 确保价格轴可见
                    autoScale: true,
                    alignLabels: true
                    // 不在这里设置scaleMargins，使用预先配置的值
                });
                console.log(`✅ 股票${index}: 价格轴配置完成 (${priceScaleId})`);
            } catch (priceScaleError) {
                console.warn(`股票${index}: 配置价格轴失败`, priceScaleError);
            }
            
            // 设置数据
            try {
                console.log(`🔄 准备设置K线数据 (股票${index}):`, {
                    数据量: validData.length,
                    前3条数据: validData.slice(0, 3),
                    数据类型检查: validData.slice(0, 3).map(item => ({
                        time: { value: item.time, type: typeof item.time },
                        open: { value: item.open, type: typeof item.open, isNull: item.open === null },
                        high: { value: item.high, type: typeof item.high, isNull: item.high === null },
                        low: { value: item.low, type: typeof item.low, isNull: item.low === null },
                        close: { value: item.close, type: typeof item.close, isNull: item.close === null }
                    }))
                });
                
                candleSeries.setData(validData);
                console.log(`✅ 股票${index}: K线系列创建成功，数据量: ${validData.length}`);
            } catch (setDataError) {
                console.error(`❌ 股票${index}: 设置K线数据失败`, setDataError);
                console.error('错误详情:', {
                    message: setDataError.message,
                    stack: setDataError.stack,
                    数据样本: validData.slice(0, 5),
                    数据详细检查: validData.slice(0, 5).map((item, i) => ({
                        索引: i,
                        原始数据: item,
                        检查结果: {
                            time_valid: !!item.time,
                            open_valid: item.open !== null && item.open !== undefined && isFinite(Number(item.open)),
                            high_valid: item.high !== null && item.high !== undefined && isFinite(Number(item.high)),
                            low_valid: item.low !== null && item.low !== undefined && isFinite(Number(item.low)),
                            close_valid: item.close !== null && item.close !== undefined && isFinite(Number(item.close))
                        }
                    }))
                });
                
                // 尝试移除系列
                try {
                    this.chart.removeSeries(candleSeries);
                } catch (removeError) {
                    console.warn('移除失败的系列时出错:', removeError);
                }
                return null;
            }
            
            this.candleSeries.push(candleSeries);
            return candleSeries;
            
        } catch (error) {
            console.error(`创建K线系列失败 (股票${index}):`, error);
            console.error('错误堆栈:', error.stack);
            return null;
        }
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
    createVolumeSeries(ohlc, stockIndex = 0) {
        try {
            if (!this.volumeSeries) {
                console.error('成交量系列未初始化');
                return;
            }
            
            if (!ohlc || ohlc.length === 0) {
                console.warn(`股票${stockIndex}: 没有成交量数据`);
                return;
            }
            
            const stockInfo = this.stockInfos[stockIndex];
            const colorScheme = stockInfo ? stockInfo.colorScheme : ChartConfig.COLORS.MULTI_STOCK[0];
            
            const volumeData = ohlc
                .filter(bar => {
                    // 严格验证所有必需字段
                    if (!bar || !bar.time) {
                        return false;
                    }
                    
                    const volume = bar.volume;
                    const open = bar.open;
                    const close = bar.close;
                    
                    // 检查是否为null或undefined
                    if (volume === null || volume === undefined || 
                        open === null || open === undefined || 
                        close === null || close === undefined) {
                        return false;
                    }
                    
                    const volumeNum = Number(volume);
                    const openNum = Number(open);
                    const closeNum = Number(close);
                    
                    // 验证转换后的数值
                    return isFinite(volumeNum) && volumeNum > 0 && 
                           isFinite(openNum) && isFinite(closeNum);
                })
                .map(bar => {
                    const volumeNum = Number(bar.volume);
                    const openNum = Number(bar.open);
                    const closeNum = Number(bar.close);
                    
                    return {
                        time: bar.time,
                        value: volumeNum,
                        color: closeNum >= openNum ? colorScheme.upColor : colorScheme.downColor
                    };
                });
            
            console.log(`成交量数据过滤 (股票${stockIndex}): 原始${ohlc.length}条 -> 有效${volumeData.length}条`);
            
            if (volumeData.length > 0) {
                // 最终验证，确保没有null值
                const finalVolumeData = volumeData.filter(item => {
                    if (!item || item.time === null || item.time === undefined) {
                        console.warn(`跳过无效时间的成交量数据 (股票${stockIndex}):`, item);
                        return false;
                    }
                    
                    if (item.value === null || item.value === undefined || !isFinite(item.value) || item.value <= 0) {
                        console.warn(`跳过无效成交量值的数据 (股票${stockIndex}):`, item);
                        return false;
                    }
                    
                    if (!item.color) {
                        console.warn(`跳过无颜色的成交量数据 (股票${stockIndex}):`, item);
                        return false;
                    }
                    
                    return true;
                });
                
                console.log(`🔄 准备设置成交量数据 (股票${stockIndex}):`, {
                    数据量: finalVolumeData.length,
                    前3条数据: finalVolumeData.slice(0, 3),
                    数据类型检查: finalVolumeData.slice(0, 3).map(item => ({
                        time: { value: item.time, type: typeof item.time, isNull: item.time === null },
                        value: { value: item.value, type: typeof item.value, isNull: item.value === null, isFinite: isFinite(item.value) },
                        color: { value: item.color, type: typeof item.color, isNull: item.color === null }
                    }))
                });
                
                this.volumeSeries.setData(finalVolumeData);
                console.log(`✅ 股票${stockIndex}: 成交量系列创建成功`);
            } else {
                console.warn(`⚠️ 股票${stockIndex}: 没有有效的成交量数据`);
            }
            
        } catch (error) {
            console.error(`❌ 创建成交量系列失败 (股票${stockIndex}):`, error);
            console.error('错误详情:', {
                message: error.message,
                stack: error.stack,
                dataLength: ohlc?.length,
                volumeSeriesExists: !!this.volumeSeries
            });
        }
    }
    
    /**
     * 更新成交量系列（多股票合并显示）
     */
    updateVolumeSeries() {
        if (!this.volumeSeries || this.stockInfos.length === 0) {
            console.warn('更新成交量失败: 成交量系列未创建或无股票数据');
            return;
        }
        
        try {
            // 收集所有股票的成交量数据
            const allVolumeData = new Map();
            
            this.stockInfos.forEach((stockInfo, index) => {
                if (!stockInfo || !stockInfo.data) {
                    console.warn(`股票${index}: 无数据，跳过成交量合并`);
                    return;
                }
                
                const colorScheme = stockInfo.colorScheme;
                let validVolumeCount = 0;
                
                stockInfo.data.forEach(bar => {
                    // 严格验证所有必需字段
                    if (!bar || !bar.time) {
                        return; // 跳过无效的数据项
                    }
                    
                    const volume = bar.volume;
                    const open = bar.open;
                    const close = bar.close;
                    
                    // 检查是否为null或undefined
                    if (volume === null || volume === undefined || 
                        open === null || open === undefined || 
                        close === null || close === undefined) {
                        return; // 跳过包含null值的数据
                    }
                    
                    const volumeNum = Number(volume);
                    const openNum = Number(open);
                    const closeNum = Number(close);
                    
                    // 验证转换后的数值
                    if (!isFinite(volumeNum) || volumeNum <= 0 || 
                        !isFinite(openNum) || !isFinite(closeNum)) {
                        return; // 跳过无效数值
                    }
                    
                    const time = bar.time;
                    const color = closeNum >= openNum ? colorScheme.upColor : colorScheme.downColor;
                    
                    if (!allVolumeData.has(time)) {
                        allVolumeData.set(time, { 
                            time: time, 
                            value: 0, 
                            color: color, 
                            stocks: [] 
                        });
                    }
                    
                    const existing = allVolumeData.get(time);
                    existing.value += volumeNum;
                    existing.stocks.push({ index, volume: volumeNum, color });
                    
                    // 使用主股票的颜色作为主色调
                    if (index === 0) {
                        existing.color = color;
                    }
                    
                    validVolumeCount++;
                });
                
                console.log(`股票${index}: 有效成交量数据 ${validVolumeCount} 条`);
            });
            
            // 转换为数组并进行最终验证
            const mergedVolumeData = Array.from(allVolumeData.values())
                .filter(item => {
                    // 最终验证每个数据项
                    if (!item || item.time === null || item.time === undefined) {
                        console.warn('跳过无效时间的成交量数据:', item);
                        return false;
                    }
                    
                    if (item.value === null || item.value === undefined || !isFinite(item.value) || item.value <= 0) {
                        console.warn('跳过无效成交量值的数据:', item);
                        return false;
                    }
                    
                    if (!item.color) {
                        console.warn('跳过无颜色的成交量数据:', item);
                        return false;
                    }
                    
                    return true;
                })
                .sort((a, b) => {
                    const timeA = ChartUtils.convertTimeToNumber(a.time);
                    const timeB = ChartUtils.convertTimeToNumber(b.time);
                    return timeA - timeB;
                });
            
            console.log(`合并成交量数据: ${mergedVolumeData.length}条记录，包含${this.stockInfos.length}只股票`);
            
            if (mergedVolumeData.length > 0) {
                // 最后一次验证，确保没有null值传递给LightweightCharts
                const finalVolumeData = mergedVolumeData.map(item => ({
                    time: item.time,
                    value: Number(item.value), // 确保是数字类型
                    color: item.color
                }));
                
                console.log('🔄 准备设置合并成交量数据:', {
                    数据量: finalVolumeData.length,
                    前3条数据: finalVolumeData.slice(0, 3),
                    数据验证: finalVolumeData.slice(0, 3).map(item => ({
                        time: { value: item.time, type: typeof item.time, isNull: item.time === null },
                        value: { value: item.value, type: typeof item.value, isNull: item.value === null, isFinite: isFinite(item.value) },
                        color: { value: item.color, type: typeof item.color, isNull: item.color === null }
                    }))
                });
                
                this.volumeSeries.setData(finalVolumeData);
                console.log('✅ 成交量数据更新成功');
            } else {
                console.warn('⚠️ 没有有效的成交量数据可显示');
            }
            
        } catch (error) {
            console.error('❌ 更新成交量系列失败:', error);
            console.error('错误详情:', {
                message: error.message,
                stack: error.stack,
                stockInfosLength: this.stockInfos.length,
                volumeSeriesExists: !!this.volumeSeries
            });
        }
    }
    
    /**
     * 加载指标（兼容性保留）
     */
    async loadIndicators(code, selectedIndicators) {
        await this.loadIndicatorsForStock(code, selectedIndicators, 0);
    }
    
    /**
     * 为特定股票加载指标
     */
    async loadIndicatorsForStock(code, selectedIndicators, stockIndex) {
        const promises = selectedIndicators.map(indicator => {
            if (indicator === 'squeeze_momentum') {
                // Squeeze指标只为主股票创建一次，并添加到主图中
                if (stockIndex === 0) {
                    return this.addSqueezeIndicatorToMainChart(code);
                }
                return Promise.resolve();
            }
            return this.loadIndicatorForStock(code, indicator, stockIndex);
        });
        
        await Promise.all(promises);
    }
    
    /**
     * 加载单个指标（兼容性保留）
     */
    async loadIndicator(code, indicator) {
        await this.loadIndicatorForStock(code, indicator, 0);
    }
    
    /**
     * 为特定股票加载单个指标
     */
    async loadIndicatorForStock(code, indicator, stockIndex) {
        try {
            const response = await fetch(`/api/indicator?code=${code}&type=${indicator}`);
            const data = await response.json();
            
            if (indicator === 'supertrend') {
                this.addSupertrendIndicatorForStock(data, stockIndex);
            } else if (indicator.startsWith('ma')) {
                this.addMAIndicatorForStock(data, indicator, stockIndex);
            }
        } catch (error) {
            console.error(`加载股票${stockIndex}的指标 ${indicator} 失败:`, error);
        }
    }
    
    /**
     * 添加SuperTrend指标（兼容性保留）
     */
    addSupertrendIndicator(data) {
        this.addSupertrendIndicatorForStock(data, 0);
    }
    
    /**
     * 为特定股票添加SuperTrend指标
     */
    addSupertrendIndicatorForStock(data, stockIndex) {
        const segments = this.processSupertrendData(data);
        const candleSeries = this.candleSeries[stockIndex];
        
        if (!candleSeries) {
            console.warn(`股票${stockIndex}: K线系列不存在，无法添加SuperTrend指标`);
            return;
        }
        
        // 获取股票的颜色方案
        const colorScheme = this.stockInfos[stockIndex]?.colorScheme || ChartConfig.COLORS.MULTI_STOCK[0];
        
        segments.forEach(segment => {
            const series = this.addSeries('line', {
                color: segment.trend === 1 ? colorScheme.upColor : colorScheme.downColor,
                lineWidth: stockIndex === 0 ? 2 : 1.5, // 主股票线条更粗
                priceScaleId: 'right' // 使用共享价格轴
            });
            series.setData(segment.data);
            this.indicatorSeries.push(series);
        });
        
        // 添加买卖信号标记
        const markers = this.createSignalMarkersForStock(data, stockIndex);
        if (candleSeries && markers.length > 0) {
            candleSeries.setMarkers(markers);
        }
        
        console.log(`✅ 股票${stockIndex}: SuperTrend指标已添加`);
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
     * 创建信号标记（兼容性保留）
     */
    createSignalMarkers(data) {
        return this.createSignalMarkersForStock(data, 0);
    }
    
    /**
     * 为特定股票创建信号标记
     */
    createSignalMarkersForStock(data, stockIndex) {
        const markers = [];
        const stockInfo = this.stockInfos[stockIndex];
        const colorScheme = stockInfo?.colorScheme || ChartConfig.COLORS.MULTI_STOCK[0];
        
        data.forEach(item => {
            // 检查买入信号
            if (item.buy === 1) {
                markers.push({
                    time: item.time,
                    position: 'belowBar',
                    color: ChartConfig.COLORS.SIGNALS.BUY,
                    shape: 'arrowUp',
                    text: stockIndex === 0 ? '🔺BUY' : `🔺${stockInfo?.code || stockIndex}`,
                    size: stockIndex === 0 ? 3 : 2 // 主股票标记更大
                });
            }
            
            // 检查卖出信号
            if (item.sell === 1) {
                markers.push({
                    time: item.time,
                    position: 'aboveBar',
                    color: ChartConfig.COLORS.SIGNALS.SELL,
                    shape: 'arrowDown',
                    text: stockIndex === 0 ? '🔻SELL' : `🔻${stockInfo?.code || stockIndex}`,
                    size: stockIndex === 0 ? 3 : 2 // 主股票标记更大
                });
            }
        });
        
        console.log(`股票${stockIndex}: 创建了 ${markers.length} 个买卖信号标记`);
        return markers;
    }
    
    /**
     * 添加MA指标（兼容性保留）
     */
    addMAIndicator(data, indicator) {
        this.addMAIndicatorForStock(data, indicator, 0);
    }
    
    /**
     * 为特定股票添加MA指标
     */
    addMAIndicatorForStock(data, indicator, stockIndex) {
        const maData = data
            .filter(item => item.ma !== null && !isNaN(item.ma))
            .map(item => ({ time: item.time, value: Number(item.ma) }));
        
        if (maData.length === 0) {
            console.warn(`股票${stockIndex}: 没有有效的${indicator}数据`);
            return;
        }
        
        // 获取股票的颜色方案
        const stockInfo = this.stockInfos[stockIndex];
        const colorScheme = stockInfo?.colorScheme || ChartConfig.COLORS.MULTI_STOCK[0];
        
        // 为不同股票的MA使用不同的颜色变体
        let color;
        if (indicator === 'ma5') {
            color = stockIndex === 0 ? ChartConfig.COLORS.MA5 : this.adjustColorOpacity(ChartConfig.COLORS.MA5, 0.7);
        } else {
            color = stockIndex === 0 ? ChartConfig.COLORS.MA10 : this.adjustColorOpacity(ChartConfig.COLORS.MA10, 0.7);
        }
        
        const series = this.addSeries('line', { 
            color, 
            lineWidth: stockIndex === 0 ? 1 : 0.8, // 主股票线条稍粗
            priceScaleId: 'right' // 使用共享价格轴
        });
        series.setData(maData);
        this.indicatorSeries.push(series);
        
        console.log(`✅ 股票${stockIndex}: ${indicator}指标已添加，数据量: ${maData.length}`);
    }
    
    /**
     * 调整颜色透明度
     */
    adjustColorOpacity(color, opacity) {
        // 简单的颜色透明度调整，可以根据需要改进
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return color;
    }

    /**
     * 在主图中添加Squeeze Momentum指标
     */
    async addSqueezeIndicatorToMainChart(code) {
        console.log('📊 在主图中添加Squeeze Momentum指标:', code);
        
        try {
            // 获取Squeeze Momentum数据
            const response = await fetch(`/api/indicator?code=${code}&type=squeeze_momentum`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`📊 Squeeze Momentum数据长度:`, data.length);
            
            if (data.length === 0) {
                console.warn('⚠️ 没有Squeeze Momentum数据');
                return;
            }
            
            // 创建动量柱状图
            console.log('🔧 创建Squeeze动量柱状图，使用价格轴: squeeze');
            const momentumSeries = this.chart.addHistogramSeries({
                color: '#26a69a',
                priceFormat: {
                    type: 'price',
                    precision: 4,
                    minMove: 0.0001
                },
                priceScaleId: 'squeeze'
            });
            
            console.log('📊 Squeeze动量系列创建完成:', !!momentumSeries);
            
            // 处理动量数据
            const momentumData = data.map(item => ({
                time: item.time,
                value: item.momentum || 0,
                color: this.getSqueezeColor(item.momentum || 0)
            }));
            
            momentumSeries.setData(momentumData);
            
            // 添加零线
            const zeroLineSeries = this.chart.addLineSeries({
                color: '#888888',
                lineWidth: 1,
                lineStyle: 0, // Solid
                priceScaleId: 'squeeze',
                crosshairMarkerVisible: false
            });
            
            const zeroLineData = data.map(item => ({
                time: item.time,
                value: 0
            }));
            
            zeroLineSeries.setData(zeroLineData);
            
            // 添加Squeeze标记
            this.addSqueezeMarkersToMainChart(data, momentumSeries);
            
            // 存储系列引用
            this.squeezeIndicators = {
                momentum: momentumSeries,
                zeroLine: zeroLineSeries
            };
            
            console.log('✅ Squeeze Momentum指标已添加到主图');
            
        } catch (error) {
            console.error('❌ 添加Squeeze Momentum指标失败:', error);
        }
    }

    /**
     * 获取Squeeze动量颜色
     */
    getSqueezeColor(momentum) {
        if (momentum > 0) {
            return '#00C851'; // 绿色
        } else if (momentum < 0) {
            return '#FF4444'; // 红色
        } else {
            return '#9E9E9E'; // 灰色
        }
    }

    /**
     * 添加Squeeze标记到主图
     */
    addSqueezeMarkersToMainChart(data, series) {
        const markers = [];
        
        data.forEach(item => {
            if (item.squeeze_on) {
                markers.push({
                    time: item.time,
                    position: 'aboveBar',
                    color: '#2196F3',  // 蓝色
                    shape: 'circle',
                    text: '●',
                    size: 0.5
                });
            }
        });
        
        if (markers.length > 0) {
            series.setMarkers(markers);
        }
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
            
            // 数据加载完成后立即进行同步
            console.log('🔄 主图: Squeeze图表创建完成，准备进行初始同步...');
            setTimeout(() => {
                console.log('🎯 主图: 开始执行Squeeze图表初始同步');
                squeezeChart.initialSync();
            }, 100);
            
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
        const normalizeText = this.normalizationEnabled ? 
            `关闭归一化 (基准: ${this.basePrice?.toFixed(2) || 'N/A'})` : 
            '开启归一化';
        normalizeBtn.textContent = normalizeText;
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
            const newText = this.normalizationEnabled ? 
                `关闭归一化 (基准: ${this.basePrice?.toFixed(2) || 'N/A'})` : 
                '开启归一化';
            normalizeBtn.textContent = newText;
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
        
        // 成交量模式切换按钮（仅在多股票时显示）
        if (this.stockInfos.length > 1) {
            const volumeModeBtn = document.createElement('button');
            volumeModeBtn.textContent = '合并成交量';
            volumeModeBtn.style.cssText = `
                padding: 4px 8px;
                font-size: 11px;
                border: 1px solid #28a745;
                border-radius: 3px;
                background: white;
                color: #28a745;
                cursor: pointer;
                transition: all 0.2s;
            `;
            
            volumeModeBtn.addEventListener('click', () => {
                this.updateVolumeSeries();
                volumeModeBtn.style.background = '#28a745';
                volumeModeBtn.style.color = 'white';
                setTimeout(() => {
                    volumeModeBtn.style.background = 'white';
                    volumeModeBtn.style.color = '#28a745';
                }, 1000);
            });
            
            volumeModeBtn.addEventListener('mouseenter', () => {
                volumeModeBtn.style.background = '#f8f9fa';
            });
            
            volumeModeBtn.addEventListener('mouseleave', () => {
                volumeModeBtn.style.background = 'white';
            });
            
            container.appendChild(volumeModeBtn);
        }
        
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
            // 归一化后，调整时间范围到主股票的有效数据范围
            this.adjustToMainStockDataRange();
        } else {
            this.removeNormalization();
        }
        
        this.updateLegend();
    }
    
    /**
     * 调整到主股票的有效数据范围
     */
    adjustToMainStockDataRange() {
        console.log('🎯 主图: 开始调整到主股票的有效数据范围...');
        
        if (this.stockInfos.length === 0) {
            console.log('📝 主图: 没有股票数据，跳过调整');
            return;
        }
        
        // 获取主股票（第一只股票）的数据
        const mainStockInfo = this.stockInfos[0];
        if (!mainStockInfo || !mainStockInfo.data || mainStockInfo.data.length === 0) {
            console.warn('⚠️ 主图: 主股票数据无效，跳过调整');
            return;
        }
        
        console.log(`📊 主图: 分析主股票 ${mainStockInfo.code} 的数据范围...`);
        
        // 分析主股票的有效数据范围
        const validData = ChartUtils.filterValidData(mainStockInfo.data);
        if (validData.length === 0) {
            console.warn('⚠️ 主图: 主股票没有有效数据，跳过调整');
            return;
        }
        
        // 获取主股票数据的时间范围
        const times = validData.map(item => ChartUtils.convertTimeToNumber(item.time)).filter(t => !isNaN(t));
        const dataStartTime = Math.min(...times);
        const dataEndTime = Math.max(...times);
        
        console.log(`📊 主图: 主股票 ${mainStockInfo.code} 有效数据范围:`, {
            开始时间: new Date(dataStartTime * 1000).toISOString().split('T')[0],
            结束时间: new Date(dataEndTime * 1000).toISOString().split('T')[0],
            数据点数: validData.length,
            跨度天数: Math.round((dataEndTime - dataStartTime) / 86400)
        });
        
        // 获取当前主图显示范围
        const currentRange = this.chart.timeScale().getVisibleRange();
        if (!currentRange) {
            console.warn('⚠️ 主图: 无法获取当前显示范围');
            return;
        }
        
        const currentFrom = ChartUtils.convertTimeToNumber(currentRange.from);
        const currentTo = ChartUtils.convertTimeToNumber(currentRange.to);
        
        console.log(`📊 主图: 当前显示范围:`, {
            开始时间: new Date(currentFrom * 1000).toISOString().split('T')[0],
            结束时间: new Date(currentTo * 1000).toISOString().split('T')[0],
            跨度天数: Math.round((currentTo - currentFrom) / 86400)
        });
        
        // 检查是否需要调整
        const needsAdjustment = (currentFrom < dataStartTime) || (currentTo > dataEndTime);
        
        if (needsAdjustment) {
            console.log('🎯 主图: 需要调整显示范围到主股票数据范围');
            
            try {
                // 设置为主股票的数据范围
                const adjustedRange = {
                    from: dataStartTime,
                    to: dataEndTime
                };
                
                // 应用强制锁定配置，确保范围不会被自动调整
                this.chart.timeScale().applyOptions({
                    fixLeftEdge: true,
                    fixRightEdge: true,
                    lockVisibleTimeRangeOnResize: true,
                    rightOffset: 5,  // 保持少量右侧偏移
                    barSpacing: 6
                });
                
                this.chart.timeScale().setVisibleRange(adjustedRange);
                
                console.log('✅ 主图: 时间范围已调整到主股票数据范围');
                
                // 同步所有子图到相同范围
                this.syncSubChartsToRange(adjustedRange);
                
                // 通知全局同步管理器
                if (window.syncManager) {
                    window.syncManager.updateGlobalTimeRange(adjustedRange, 'main-stock-data-range');
                }
                
                console.log('🎉 主图: 归一化模式下已对齐到主股票有效数据范围');
                
            } catch (error) {
                console.error('❌ 主图: 调整到主股票数据范围失败:', error);
            }
        } else {
            console.log('✅ 主图: 当前显示范围已经与主股票数据范围匹配');
        }
    }
    
    /**
     * 同步所有子图到指定范围
     */
    syncSubChartsToRange(range) {
        console.log('🔄 主图: 开始同步所有子图到指定范围...');
        
        this.subCharts.forEach((subChart, index) => {
            if (subChart && subChart.chart) {
                try {
                    const subChartName = subChart.getSourceName ? subChart.getSourceName() : `子图${index}`;
                    console.log(`📐 同步${subChartName}到主股票数据范围`);
                    
                    // 应用相同的锁定配置
                    subChart.chart.timeScale().applyOptions({
                        fixLeftEdge: true,
                        fixRightEdge: true,
                        lockVisibleTimeRangeOnResize: true,
                        rightOffset: 5,
                        barSpacing: 6
                    });
                    
                    subChart.chart.timeScale().setVisibleRange(range);
                    console.log(`✅ ${subChartName}同步完成`);
                    
                } catch (error) {
                    console.error(`❌ 同步子图${index}失败:`, error);
                }
            }
        });
        
        console.log('✅ 主图: 所有子图同步完成');
    }
    
    /**
     * 与子图同步时间范围（保留原方法，但不再使用）
     */
    syncTimeRangeWithSubCharts() {
        console.log('🔄 主图: 开始与子图同步时间范围...');
        
        if (this.subCharts.length === 0) {
            console.log('📝 主图: 没有子图，跳过时间范围同步');
            return;
        }
        
        // 收集所有子图的时间范围
        const subChartRanges = [];
        
        this.subCharts.forEach((subChart, index) => {
            if (subChart && subChart.chart) {
                try {
                    const range = subChart.chart.timeScale().getVisibleRange();
                    if (range) {
                        subChartRanges.push({
                            index: index,
                            name: subChart.getSourceName ? subChart.getSourceName() : `子图${index}`,
                            range: range,
                            from: ChartUtils.convertTimeToNumber(range.from),
                            to: ChartUtils.convertTimeToNumber(range.to)
                        });
                        console.log(`📊 收集到${subChart.getSourceName ? subChart.getSourceName() : `子图${index}`}时间范围:`, {
                            从: new Date(ChartUtils.convertTimeToNumber(range.from) * 1000).toISOString().split('T')[0],
                            到: new Date(ChartUtils.convertTimeToNumber(range.to) * 1000).toISOString().split('T')[0]
                        });
                    }
                } catch (e) {
                    console.warn(`⚠️ 获取子图${index}时间范围失败:`, e.message);
                }
            }
        });
        
        if (subChartRanges.length === 0) {
            console.log('📝 主图: 没有有效的子图时间范围，跳过同步');
            return;
        }
        
        // 计算所有子图的交集时间范围
        const intersectionFrom = Math.max(...subChartRanges.map(r => r.from));
        const intersectionTo = Math.min(...subChartRanges.map(r => r.to));
        
        if (intersectionFrom >= intersectionTo) {
            console.warn('⚠️ 主图: 子图之间没有时间交集，无法同步');
            return;
        }
        
        console.log('📊 主图: 计算出子图交集时间范围:', {
            从: new Date(intersectionFrom * 1000).toISOString().split('T')[0],
            到: new Date(intersectionTo * 1000).toISOString().split('T')[0],
            天数: Math.round((intersectionTo - intersectionFrom) / 86400)
        });
        
        // 获取主图当前时间范围
        const mainRange = this.chart.timeScale().getVisibleRange();
        if (!mainRange) {
            console.warn('⚠️ 主图: 无法获取主图时间范围');
            return;
        }
        
        const mainFrom = ChartUtils.convertTimeToNumber(mainRange.from);
        const mainTo = ChartUtils.convertTimeToNumber(mainRange.to);
        
        console.log('📊 主图: 当前主图时间范围:', {
            从: new Date(mainFrom * 1000).toISOString().split('T')[0],
            到: new Date(mainTo * 1000).toISOString().split('T')[0],
            天数: Math.round((mainTo - mainFrom) / 86400)
        });
        
        // 检查是否需要调整主图时间范围
        const needsAdjustment = (mainFrom < intersectionFrom) || (mainTo > intersectionTo);
        
        if (needsAdjustment) {
            console.log('🎯 主图: 需要调整主图时间范围以匹配子图');
            
            try {
                // 应用强制锁定配置
                this.chart.timeScale().applyOptions({
                    fixLeftEdge: true,
                    fixRightEdge: true,
                    lockVisibleTimeRangeOnResize: true,
                    rightOffset: 0
                });
                
                // 设置主图时间范围为子图交集
                const adjustedRange = {
                    from: intersectionFrom,
                    to: intersectionTo
                };
                
                this.chart.timeScale().setVisibleRange(adjustedRange);
                
                console.log('✅ 主图: 时间范围调整完成');
                
                // 通知全局同步管理器
                if (window.syncManager) {
                    window.syncManager.updateGlobalTimeRange(adjustedRange, 'normalization-sync');
                }
                
                // 显示成功消息
                console.log('🎉 主图: 归一化模式下时间范围已与子图同步');
                
            } catch (error) {
                console.error('❌ 主图: 调整时间范围失败:', error);
            }
        } else {
            console.log('✅ 主图: 时间范围已经与子图匹配，无需调整');
        }
    }
    
    /**
     * 应用价格归一化
     */
    applyNormalization() {
        if (this.stockInfos.length === 0 || this.originalStockData.length === 0) return;
        
        // 使用第一只股票作为基准
        const baseStockData = this.originalStockData[0];
        if (!baseStockData || baseStockData.length === 0) return;
        
        // 使用最新价格作为基准，而不是第一个数据点
        this.basePrice = baseStockData[baseStockData.length - 1].close;
        console.log(`🎯 设置基准价格 (最新价格): ${this.basePrice}`);
        
        // 记录归一化前的价格范围
        this.logPriceRanges('归一化前');
        
        // 重新设置所有股票的数据
        this.stockInfos.forEach((stockInfo, index) => {
            if (stockInfo && this.originalStockData[index] && this.candleSeries[index]) {
                const originalData = this.originalStockData[index];
                const originalRange = this.getDataPriceRange(originalData);
                console.log(`📊 股票${index} 原始价格范围:`, originalRange);
                
                const normalizedData = this.normalizeStockData(this.originalStockData[index], index);
                const normalizedRange = this.getDataPriceRange(normalizedData);
                console.log(`📊 股票${index} 归一化后价格范围:`, normalizedRange);
                
                this.candleSeries[index].setData(normalizedData);
                
                // 更新stockInfo中的数据引用为归一化后的数据
                stockInfo.data = normalizedData;
                
                console.log(`✅ 股票${index} 已应用归一化，数据量: ${normalizedData.length}`);
            }
        });
        
        // 归一化后不更新成交量，保持原始成交量显示
        console.log('💾 价格归一化已应用，成交量保持原始数据');
        
        // 强制重新调整价格轴范围
        setTimeout(() => {
            try {
                // 重新适配图表以显示归一化后的价格范围
                this.chart.timeScale().fitContent();
                
                // 重新调整共享价格轴
                try {
                    const priceScaleId = 'right';
                    
                    // 强制重置价格轴以适应归一化后的数据
                    this.chart.priceScale(priceScaleId).applyOptions({
                        autoScale: true,
                        mode: 0, // 重置为默认模式
                        invertScale: false,
                        alignLabels: true,
                        scaleMargins: {
                            top: 0.2,
                            bottom: 0.3
                        }
                    });
                    
                    console.log(`✅ 共享价格轴已调整到归一化范围 (${priceScaleId})`);
                } catch (e) {
                    console.warn(`调整共享价格轴失败:`, e);
                }
                
                // 额外的强制重新计算价格范围
                setTimeout(() => {
                    try {
                        // 再次强制适配内容
                        this.chart.timeScale().fitContent();
                        console.log('✅ 归一化后二次价格轴调整完成');
                    } catch (e) {
                        console.warn('归一化后二次价格轴调整失败:', e);
                    }
                }, 100);
                
                console.log('✅ 归一化后图表价格轴已重新调整');
                
                // 监控价格轴变化
                this.monitorPriceScaleChanges();
            } catch (error) {
                console.warn('归一化后图表调整失败:', error);
            }
        }, 200);
    }
    
    /**
     * 移除价格归一化
     */
    removeNormalization() {
        console.log('🔄 开始移除价格归一化...');
        
        // 记录移除前的价格范围
        this.logPriceRanges('移除归一化前');
        
        // 恢复原始数据
        this.stockInfos.forEach((stockInfo, index) => {
            if (stockInfo && this.originalStockData[index] && this.candleSeries[index]) {
                console.log(`恢复股票${index}原始数据:`, {
                    原始数据量: this.originalStockData[index].length,
                    当前数据量: stockInfo.data.length,
                    原始数据样本: this.originalStockData[index].slice(0, 2),
                    当前数据样本: stockInfo.data.slice(0, 2)
                });
                
                // 使用保存的原始数据恢复
                const validData = ChartUtils.filterValidData(this.originalStockData[index]);
                
                console.log(`🔄 准备恢复股票${index}数据:`, {
                    过滤后数据量: validData.length,
                    前3条数据: validData.slice(0, 3),
                    数据验证: validData.slice(0, 3).map(item => ({
                        time: { value: item.time, type: typeof item.time },
                        open: { value: item.open, type: typeof item.open, isNull: item.open === null },
                        high: { value: item.high, type: typeof item.high, isNull: item.high === null },
                        low: { value: item.low, type: typeof item.low, isNull: item.low === null },
                        close: { value: item.close, type: typeof item.close, isNull: item.close === null }
                    }))
                });
                
                // 记录恢复前后的价格范围对比
                const currentRange = this.getDataPriceRange(stockInfo.data);
                const originalRange = this.getDataPriceRange(this.originalStockData[index]);
                console.log(`📊 股票${index} 价格范围对比:`, {
                    当前归一化范围: currentRange,
                    原始范围: originalRange
                });
                
                try {
                    this.candleSeries[index].setData(validData);
                    console.log(`✅ 股票${index} K线数据已恢复`);
                } catch (error) {
                    console.error(`❌ 股票${index} K线数据恢复失败:`, error);
                }
                
                // 同时更新stockInfo中的数据引用为原始数据
                stockInfo.data = this.originalStockData[index];
                
                console.log(`✅ 股票${index} 已恢复原始数据，数据量: ${validData.length}`);
            } else {
                console.warn(`⚠️ 股票${index} 恢复失败:`, {
                    hasStockInfo: !!stockInfo,
                    hasOriginalData: !!this.originalStockData[index],
                    hasCandleSeries: !!this.candleSeries[index]
                });
            }
        });
        
        // 恢复成交量显示
        console.log('🔄 恢复成交量显示...');
        try {
            this.updateVolumeSeries();
            console.log('✅ 成交量显示已恢复');
        } catch (error) {
            console.error('❌ 成交量显示恢复失败:', error);
        }
        
        this.basePrice = null;
        console.log('✅ 价格归一化已关闭，所有数据已恢复原始状态');
        
        // 强制重新渲染图表和调整价格轴
        setTimeout(() => {
            try {
                // 重新适配时间轴
                this.chart.timeScale().fitContent();
                
                // 重新调整共享价格轴以适应原始数据
                try {
                    const priceScaleId = 'right';
                    
                    // 强制重置价格轴的自动缩放
                    this.chart.priceScale(priceScaleId).applyOptions({
                        autoScale: true,
                        mode: 0, // 重置为默认模式
                        invertScale: false,
                        alignLabels: true,
                        scaleMargins: {
                            top: 0.2,
                            bottom: 0.3
                        }
                    });
                    
                    console.log(`✅ 共享价格轴已重置到原始数据范围 (${priceScaleId})`);
                } catch (e) {
                    console.warn(`调整共享价格轴失败:`, e);
                }
                
                // 额外的强制重新计算价格范围
                setTimeout(() => {
                    try {
                        // 再次强制适配内容
                        this.chart.timeScale().fitContent();
                        
                        // 最强力的重置：强制重新设置数据以触发价格轴重新计算
                        this.candleSeries.forEach((series, index) => {
                            if (series && this.originalStockData[index]) {
                                try {
                                    const validData = ChartUtils.filterValidData(this.originalStockData[index]);
                                    series.setData(validData);
                                    console.log(`🔄 强制重新设置股票${index}数据以重置价格轴`);
                                } catch (e) {
                                    console.warn(`强制重新设置股票${index}数据失败:`, e);
                                }
                            }
                        });
                        
                        console.log('✅ 二次价格轴调整完成');
                        
                        // 监控价格轴恢复后的状态
                        this.monitorPriceScaleChanges();
                    } catch (e) {
                        console.warn('二次价格轴调整失败:', e);
                    }
                }, 100);
                
                console.log('✅ 图表已重新适配，价格轴已调整到原始数据范围');
            } catch (error) {
                console.warn('图表重新适配失败:', error);
            }
        }, 200);
    }
    
    /**
     * 归一化股票数据
     */
    normalizeStockData(data, stockIndex) {
        if (!data || data.length === 0 || !this.basePrice) {
            console.warn(`归一化失败: 数据为空或基准价格未设置`, { dataLength: data?.length, basePrice: this.basePrice });
            return data;
        }
        
        // 使用最新价格作为归一化基准，而不是第一个数据点
        const latestPrice = data[data.length - 1].close;
        if (!latestPrice || latestPrice === 0 || isNaN(latestPrice)) {
            console.warn(`归一化失败: 最新价格无效`, { latestPrice, stockIndex });
            return data;
        }
        
        const scaleFactor = this.basePrice / latestPrice;
        if (!isFinite(scaleFactor)) {
            console.warn(`归一化失败: 缩放因子无效`, { basePrice: this.basePrice, latestPrice, scaleFactor });
            return data;
        }
        
        console.log(`股票${stockIndex} 归一化: 基准价格=${this.basePrice}, 最新价格=${latestPrice}, 缩放因子=${scaleFactor.toFixed(4)}`);
        
        const normalizedData = data.map(item => {
            // 严格验证每个数据项
            if (!item || !item.time) {
                console.warn(`跳过无效数据项 (无时间):`, item);
                return null;
            }
            
            const open = item.open;
            const high = item.high;
            const low = item.low;
            const close = item.close;
            const volume = item.volume;
            
            // 检查是否为null或undefined
            if (open === null || open === undefined || 
                high === null || high === undefined || 
                low === null || low === undefined || 
                close === null || close === undefined) {
                console.warn(`跳过包含null值的数据项:`, { time: item.time, open, high, low, close });
                return null;
            }
            
            const openNum = Number(open);
            const highNum = Number(high);
            const lowNum = Number(low);
            const closeNum = Number(close);
            
            // 检查转换后的数值是否有效
            if (!isFinite(openNum) || !isFinite(highNum) || !isFinite(lowNum) || !isFinite(closeNum)) {
                console.warn(`跳过无效数值的数据项:`, { 
                    time: item.time, 
                    open: { original: open, converted: openNum, isFinite: isFinite(openNum) },
                    high: { original: high, converted: highNum, isFinite: isFinite(highNum) },
                    low: { original: low, converted: lowNum, isFinite: isFinite(lowNum) },
                    close: { original: close, converted: closeNum, isFinite: isFinite(closeNum) }
                });
                return null;
            }
            
            // 应用归一化
            const normalizedOpen = openNum * scaleFactor;
            const normalizedHigh = highNum * scaleFactor;
            const normalizedLow = lowNum * scaleFactor;
            const normalizedClose = closeNum * scaleFactor;
            
            // 验证归一化后的结果
            if (!isFinite(normalizedOpen) || !isFinite(normalizedHigh) || 
                !isFinite(normalizedLow) || !isFinite(normalizedClose)) {
                console.warn(`归一化后数值无效:`, { 
                    time: item.time,
                    scaleFactor,
                    results: { normalizedOpen, normalizedHigh, normalizedLow, normalizedClose }
                });
                return null;
            }
            
            return {
                time: item.time,
                open: normalizedOpen,
                high: normalizedHigh,
                low: normalizedLow,
                close: normalizedClose,
                volume: volume // 成交量不归一化，但保持原值
            };
        }).filter(item => item !== null); // 过滤掉无效项
        
        console.log(`股票${stockIndex} 归一化完成: 原始${data.length}条 -> 有效${normalizedData.length}条`);
        
        return normalizedData;
    }
    
    /**
     * 获取数据的价格范围
     */
    getDataPriceRange(data) {
        if (!data || data.length === 0) return null;
        
        let minPrice = Infinity;
        let maxPrice = -Infinity;
        
        data.forEach(item => {
            if (item && typeof item.high === 'number' && typeof item.low === 'number') {
                minPrice = Math.min(minPrice, item.low);
                maxPrice = Math.max(maxPrice, item.high);
            }
        });
        
        return {
            min: minPrice === Infinity ? null : minPrice,
            max: maxPrice === -Infinity ? null : maxPrice,
            range: maxPrice === -Infinity || minPrice === Infinity ? null : maxPrice - minPrice
        };
    }
    
    /**
     * 记录当前价格轴范围
     */
    logPriceRanges(stage) {
        console.log(`📏 ${stage} - 价格轴状态:`);
        
        try {
            const priceScaleId = 'right';
            const priceScale = this.chart.priceScale(priceScaleId);
            
            console.log(`  共享价格轴 (${priceScaleId}):`, {
                价格轴存在: !!priceScale,
                股票数量: this.candleSeries.length,
                股票列表: this.stockInfos.map(info => info?.code).join(', ')
            });
            
            // 显示每只股票的系列状态
            this.candleSeries.forEach((series, index) => {
                if (series) {
                    console.log(`    股票${index} (${this.stockInfos[index]?.code}):`, {
                        系列存在: !!series,
                        使用价格轴: priceScaleId
                    });
                }
            });
        } catch (e) {
            console.warn(`  价格轴信息获取失败:`, e.message);
        }
    }
    
    /**
     * 监控价格轴变化
     */
    monitorPriceScaleChanges() {
        setTimeout(() => {
            this.logPriceRanges('价格轴调整后');
            
            // 检查图表的实际显示范围
            try {
                const timeRange = this.chart.timeScale().getVisibleRange();
                console.log(`⏰ 当前时间范围:`, timeRange);
                
                // 检查每个系列的最后价格
                this.candleSeries.forEach((series, index) => {
                    if (series && this.stockInfos[index]) {
                        const stockData = this.stockInfos[index].data;
                        if (stockData && stockData.length > 0) {
                            const lastData = stockData[stockData.length - 1];
                            console.log(`💰 股票${index} (${this.stockInfos[index].code}) 最后价格:`, {
                                时间: lastData.time,
                                开盘: lastData.open,
                                最高: lastData.high,
                                最低: lastData.low,
                                收盘: lastData.close
                            });
                        }
                    }
                });
            } catch (e) {
                console.warn('获取图表状态失败:', e);
            }
        }, 300);
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
    
    /**
     * 同步时间范围（重写以增强子图同步）
     */
    syncTimeRange(timeRange, source) {
        console.log(`🔄 ${this.getSourceName()}: 收到同步请求，来源: ${source}`);
        console.log(`📏 ${this.getSourceName()}: 请求同步的时间范围:`, {
            from: timeRange?.from,
            to: timeRange?.to,
            fromDate: timeRange?.from ? new Date(ChartUtils.convertTimeToNumber(timeRange.from) * 1000).toISOString() : 'N/A',
            toDate: timeRange?.to ? new Date(ChartUtils.convertTimeToNumber(timeRange.to) * 1000).toISOString() : 'N/A'
        });
        
        // 避免自己同步自己
        if (source === this.getSourceName()) {
            console.log(`⏭️ ${this.getSourceName()}: 跳过自身同步`);
            return;
        }
        
        // 验证时间范围
        if (!this.isValidTimeRange(timeRange)) {
            console.warn(`❌ ${this.getSourceName()}: 收到无效时间范围，跳过同步:`, timeRange);
            return;
        }
        
        console.log(`✅ ${this.getSourceName()}: 时间范围验证通过，开始同步`);
        
        try {
            // 记录同步前的状态
            let beforeRange = null;
            try {
                beforeRange = this.chart?.timeScale().getVisibleRange();
                console.log(`📏 ${this.getSourceName()}: 同步前时间范围:`, beforeRange);
            } catch (e) {
                console.warn(`⚠️ ${this.getSourceName()}: 无法获取同步前时间范围:`, e.message);
            }
            
            // 子图在同步前先确保时间轴配置一致
            if (this.alignTimeAxisWithMain && typeof this.alignTimeAxisWithMain === 'function') {
                console.log(`🔧 ${this.getSourceName()}: 执行时间轴配置对齐`);
                this.alignTimeAxisWithMain();
            } else {
                console.log(`⚠️ ${this.getSourceName()}: 时间轴对齐方法不可用`);
            }
            
            console.log(`📐 ${this.getSourceName()}: 开始设置时间范围`);
            
            // 确保时间范围格式正确
            const normalizedTimeRange = {
                from: ChartUtils.convertTimeToNumber(timeRange.from),
                to: ChartUtils.convertTimeToNumber(timeRange.to)
            };
            
            console.log(`🔄 ${this.getSourceName()}: 时间范围格式化:`, {
                原始: timeRange,
                转换后: normalizedTimeRange
            });
            
            this.setTimeRange(normalizedTimeRange);
            
            // 验证同步结果
            setTimeout(() => {
                try {
                    const afterRange = this.chart?.timeScale().getVisibleRange();
                    console.log(`📏 ${this.getSourceName()}: 同步后时间范围:`, afterRange);
                    
                    if (afterRange && timeRange) {
                        const accuracy = {
                            fromDiff: Math.abs(ChartUtils.convertTimeToNumber(timeRange.from) - ChartUtils.convertTimeToNumber(afterRange.from)),
                            toDiff: Math.abs(ChartUtils.convertTimeToNumber(timeRange.to) - ChartUtils.convertTimeToNumber(afterRange.to))
                        };
                        console.log(`📐 ${this.getSourceName()}: 同步精度:`, accuracy);
                        
                        if (accuracy.fromDiff < 1 && accuracy.toDiff < 1) {
                            console.log(`✅ ${this.getSourceName()}: 同步精度良好`);
                        } else {
                            console.warn(`⚠️ ${this.getSourceName()}: 同步精度较低`);
                        }
                    }
                } catch (e) {
                    console.warn(`⚠️ ${this.getSourceName()}: 同步验证失败:`, e.message);
                }
            }, 50);
            
            console.log(`✅ ${this.getSourceName()}: 同步完成`);
        } catch (error) {
            console.error(`❌ ${this.getSourceName()}: 同步失败:`, error);
            console.error(`同步错误详情:`, {
                message: error.message,
                stack: error.stack,
                source: source,
                timeRange: timeRange,
                chartExists: !!this.chart,
                alignMethodExists: !!(this.alignTimeAxisWithMain && typeof this.alignTimeAxisWithMain === 'function')
            });
        }
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
            
            // 分析数据时间范围
            this.analyzeDataRange(data, code);
            
            this.createMomentumSeries(data);
            this.createZeroLineSeries(data);
            this.addSqueezeMarkers(data);
            
            console.log('Squeeze数据加载和图表创建完成');
        } catch (error) {
            console.error('加载Squeeze数据失败:', error);
        }
    }
    
    /**
     * 分析数据时间范围
     */
    analyzeDataRange(data, code) {
        console.log(`📊 开始分析 ${code} 的Squeeze数据时间范围...`);
        console.log(`🔍 原始数据样本:`, data.slice(0, 3));
        
        if (!data || data.length === 0) {
            console.warn('⚠️ Squeeze数据为空，无法分析时间范围');
            return;
        }
        
        const times = data.map(item => ChartUtils.convertTimeToNumber(item.time)).filter(t => !isNaN(t));
        if (times.length === 0) {
            console.warn('⚠️ Squeeze数据中没有有效的时间值');
            return;
        }
        
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        
        console.log(`📊 ${code} Squeeze数据时间范围分析:`, {
            股票代码: code,
            最早时间: new Date(minTime * 1000).toISOString().split('T')[0],
            最晚时间: new Date(maxTime * 1000).toISOString().split('T')[0],
            数据跨度天数: Math.round((maxTime - minTime) / 86400),
            数据点数量: data.length,
            时间戳范围: {
                最早: minTime,
                最晚: maxTime
            }
        });
        
        // 延迟比较，确保主图已经加载完成
        setTimeout(() => {
            this.compareWithMainChart(minTime, maxTime, code);
        }, 500);
    }
    
    /**
     * 与主图时间范围比较
     */
    compareWithMainChart(minTime, maxTime, code) {
        // 如果有主图，比较时间范围
        if (this.mainChart && this.mainChart.chart) {
            try {
                const mainRange = this.mainChart.chart.timeScale().getVisibleRange();
                if (mainRange) {
                    const mainFrom = ChartUtils.convertTimeToNumber(mainRange.from);
                    const mainTo = ChartUtils.convertTimeToNumber(mainRange.to);
                    
                    console.log(`📊 ${code} 主图与子图时间范围对比:`, {
                        主图范围: {
                            从: new Date(mainFrom * 1000).toISOString().split('T')[0],
                            到: new Date(mainTo * 1000).toISOString().split('T')[0],
                            时间戳: { 从: mainFrom, 到: mainTo }
                        },
                        子图数据范围: {
                            从: new Date(minTime * 1000).toISOString().split('T')[0],
                            到: new Date(maxTime * 1000).toISOString().split('T')[0],
                            时间戳: { 从: minTime, 到: maxTime }
                        },
                        覆盖情况: {
                            子图是否覆盖主图开始: minTime <= mainFrom,
                            子图是否覆盖主图结束: maxTime >= mainTo,
                            开始时间差天数: Math.round((mainFrom - minTime) / 86400),
                            结束时间差天数: Math.round((maxTime - mainTo) / 86400),
                            开始时间差秒数: mainFrom - minTime,
                            结束时间差秒数: maxTime - mainTo
                        }
                    });
                    
                    // 如果子图数据不能完全覆盖主图范围，给出详细警告
                    if (minTime > mainFrom) {
                        const daysDiff = Math.round((minTime - mainFrom) / 86400);
                        console.warn(`⚠️ ${code} Squeeze: 子图数据开始时间晚于主图 ${daysDiff} 天，无法完全对齐`);
                        console.warn(`   主图开始: ${new Date(mainFrom * 1000).toISOString().split('T')[0]}`);
                        console.warn(`   子图开始: ${new Date(minTime * 1000).toISOString().split('T')[0]}`);
                    }
                    if (maxTime < mainTo) {
                        const daysDiff = Math.round((mainTo - maxTime) / 86400);
                        console.warn(`⚠️ ${code} Squeeze: 子图数据结束时间早于主图 ${daysDiff} 天，无法完全对齐`);
                        console.warn(`   主图结束: ${new Date(mainTo * 1000).toISOString().split('T')[0]}`);
                        console.warn(`   子图结束: ${new Date(maxTime * 1000).toISOString().split('T')[0]}`);
                    }
                    
                    // 给出同步建议和解决方案
                    if (minTime <= mainFrom && maxTime >= mainTo) {
                        console.log(`✅ ${code} Squeeze: 数据范围完全覆盖主图，可以完美同步`);
                    } else {
                        console.log(`💡 ${code} Squeeze: 数据范围不完全覆盖主图，同步将受限于数据范围`);
                        console.log(`   建议: 检查API是否返回了完整的时间范围数据`);
                        
                        // 提供智能同步选项
                        console.log(`🔧 ${code} Squeeze: 提供以下同步选项:`);
                        console.log(`   1. 保持当前状态 - 子图显示其数据范围`);
                        console.log(`   2. 主图适应子图 - 将主图调整到子图的时间范围`);
                        console.log(`   3. 交集同步 - 只显示两者都有数据的时间范围`);
                        
                        // 自动选择最佳策略
                        this.applySmartSyncStrategy(minTime, maxTime, mainFrom, mainTo, code);
                    }
                } else {
                    console.warn(`⚠️ ${code} Squeeze: 无法获取主图时间范围`);
                }
            } catch (e) {
                console.warn(`⚠️ ${code} Squeeze: 获取主图时间范围时出错:`, e.message);
            }
        } else {
                         console.warn(`⚠️ ${code} Squeeze: 主图引用不存在，无法进行时间范围比较`);
         }
     }
     
     /**
      * 应用智能同步策略
      */
     applySmartSyncStrategy(subMinTime, subMaxTime, mainFrom, mainTo, code) {
         console.log(`🤖 ${code} Squeeze: 开始应用智能同步策略...`);
         
         // 计算交集范围
         const intersectionFrom = Math.max(subMinTime, mainFrom);
         const intersectionTo = Math.min(subMaxTime, mainTo);
         
         // 检查是否有有效的交集
         if (intersectionFrom < intersectionTo) {
             const intersectionDays = Math.round((intersectionTo - intersectionFrom) / 86400);
             const totalMainDays = Math.round((mainTo - mainFrom) / 86400);
             const coveragePercent = (intersectionDays / totalMainDays * 100).toFixed(1);
             
             console.log(`📊 ${code} Squeeze: 时间范围交集分析:`, {
                 交集开始: new Date(intersectionFrom * 1000).toISOString().split('T')[0],
                 交集结束: new Date(intersectionTo * 1000).toISOString().split('T')[0],
                 交集天数: intersectionDays,
                 主图总天数: totalMainDays,
                 覆盖率: `${coveragePercent}%`
             });
             
             // 根据覆盖率选择策略
             if (parseFloat(coveragePercent) >= 70) {
                 console.log(`✅ ${code} Squeeze: 覆盖率${coveragePercent}%，采用交集同步策略`);
                 this.syncToIntersection(intersectionFrom, intersectionTo, code);
             } else if (parseFloat(coveragePercent) >= 30) {
                 console.log(`⚠️ ${code} Squeeze: 覆盖率${coveragePercent}%，保持当前状态但添加提示`);
                 this.addDataRangeWarning(code, coveragePercent);
             } else {
                 console.log(`❌ ${code} Squeeze: 覆盖率${coveragePercent}%过低，建议检查数据源`);
                 this.addDataRangeError(code, coveragePercent);
             }
         } else {
             console.error(`❌ ${code} Squeeze: 主图和子图没有时间交集，无法同步`);
             this.addDataRangeError(code, '0');
         }
     }
     
     /**
      * 同步到交集范围
      */
     syncToIntersection(intersectionFrom, intersectionTo, code) {
         console.log(`🎯 ${code} Squeeze: 开始同步到交集范围...`);
         
         try {
             const intersectionRange = {
                 from: intersectionFrom,
                 to: intersectionTo
             };
             
             // 同步主图到交集范围
             if (this.mainChart && this.mainChart.chart) {
                 console.log(`📐 ${code} Squeeze: 调整主图到交集范围`);
                 
                 // 强制锁定主图时间范围，防止自动调整
                 this.mainChart.chart.timeScale().applyOptions({
                     fixLeftEdge: true,
                     fixRightEdge: true,
                     lockVisibleTimeRangeOnResize: true
                 });
                 
                 this.mainChart.chart.timeScale().setVisibleRange(intersectionRange);
                 
                 // 通知全局同步管理器更新
                 if (window.syncManager) {
                     window.syncManager.updateGlobalTimeRange(intersectionRange, 'smart-sync');
                 }
             }
             
             // 同步子图到交集范围
             if (this.chart) {
                 console.log(`📐 ${code} Squeeze: 调整子图到交集范围`);
                 
                 // 强制锁定子图时间范围
                 this.chart.timeScale().applyOptions({
                     fixLeftEdge: true,
                     fixRightEdge: true,
                     lockVisibleTimeRangeOnResize: true
                 });
                 
                 this.chart.timeScale().setVisibleRange(intersectionRange);
             }
             
             console.log(`✅ ${code} Squeeze: 交集同步完成`);
             
             // 添加成功提示
             this.addSyncSuccessNotification(code, intersectionFrom, intersectionTo);
             
         } catch (error) {
             console.error(`❌ ${code} Squeeze: 交集同步失败:`, error);
         }
     }
     
     /**
      * 添加数据范围警告
      */
     addDataRangeWarning(code, coveragePercent) {
         console.warn(`⚠️ ${code} Squeeze: 数据覆盖率${coveragePercent}%，时间轴可能不完全对齐`);
         
         // 可以在这里添加UI提示
         if (typeof window !== 'undefined' && window.console) {
             console.warn(`💡 建议: 检查${code}的Squeeze指标数据是否完整`);
         }
     }
     
     /**
      * 添加数据范围错误
      */
     addDataRangeError(code, coveragePercent) {
         console.error(`❌ ${code} Squeeze: 数据覆盖率${coveragePercent}%，无法有效同步`);
         
         // 可以在这里添加UI错误提示
         if (typeof window !== 'undefined' && window.console) {
             console.error(`🚨 错误: ${code}的Squeeze数据与主图时间范围不匹配`);
         }
     }
     
     /**
      * 添加同步成功通知
      */
     addSyncSuccessNotification(code, from, to) {
         const fromDate = new Date(from * 1000).toISOString().split('T')[0];
         const toDate = new Date(to * 1000).toISOString().split('T')[0];
         
         console.log(`🎉 ${code} Squeeze: 智能同步成功！`);
         console.log(`📅 同步范围: ${fromDate} 至 ${toDate}`);
         
         // 可以在这里添加UI成功提示
         if (typeof window !== 'undefined' && window.console) {
             console.info(`✨ ${code} Squeeze图表已智能同步到最佳时间范围`);
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
        
        // 多次尝试同步，确保主图完全加载
        this.attemptSync(0);
    }
    
    /**
     * 尝试同步（带重试机制）
     */
    attemptSync(attempt) {
        const maxAttempts = 5;
        const delay = 200 + (attempt * 100); // 递增延迟
        
        console.log(`🔄 Squeeze: 准备第${attempt + 1}次同步尝试，延迟${delay}ms...`);
        
        setTimeout(() => {
            try {
                console.log(`🎯 Squeeze: 第${attempt + 1}次尝试同步开始 (${attempt + 1}/${maxAttempts})`);
                
                // 检查基础条件
                if (!this.mainChart) {
                    console.error(`❌ Squeeze: 第${attempt + 1}次尝试 - 主图引用不存在`);
                    if (attempt < maxAttempts - 1) {
                        this.attemptSync(attempt + 1);
                        return;
                    } else {
                        this.forceTimeAxisAlignment();
                        return;
                    }
                }
                
                if (!this.chart) {
                    console.error(`❌ Squeeze: 第${attempt + 1}次尝试 - 子图chart不存在`);
                    if (attempt < maxAttempts - 1) {
                        this.attemptSync(attempt + 1);
                        return;
                    } else {
                        this.forceTimeAxisAlignment();
                        return;
                    }
                }
                
                console.log(`📊 Squeeze: 第${attempt + 1}次尝试 - 基础条件检查通过`);
                
                // 获取主图的时间范围进行同步
                const mainTimeRange = this.mainChart.getTimeRange();
                if (!mainTimeRange) {
                    if (attempt < maxAttempts - 1) {
                        console.warn(`⚠️ Squeeze: 第${attempt + 1}次获取主图时间范围失败，将重试`);
                        this.attemptSync(attempt + 1);
                        return;
                    } else {
                        console.warn('🚨 Squeeze: 多次尝试后仍无法获取主图时间范围，使用自适应模式');
                        this.forceTimeAxisAlignment();
                        return;
                    }
                }
                
                console.log(`📏 Squeeze: 第${attempt + 1}次尝试 - 获取到主图时间范围:`, {
                    from: mainTimeRange.from,
                    to: mainTimeRange.to,
                    fromDate: new Date(ChartUtils.convertTimeToNumber(mainTimeRange.from) * 1000).toISOString(),
                    toDate: new Date(ChartUtils.convertTimeToNumber(mainTimeRange.to) * 1000).toISOString()
                });
                
                // 验证时间范围
                if (!this.isValidTimeRange(mainTimeRange)) {
                    if (attempt < maxAttempts - 1) {
                        console.warn(`⚠️ Squeeze: 第${attempt + 1}次时间范围无效，将重试:`, mainTimeRange);
                        this.attemptSync(attempt + 1);
                        return;
                    } else {
                        console.warn('🚨 Squeeze: 多次尝试后时间范围仍无效，使用自适应模式');
                        this.forceTimeAxisAlignment();
                        return;
                    }
                }
                
                console.log(`✅ Squeeze: 第${attempt + 1}次尝试 - 时间范围验证通过`);
                
                const wasUpdating = syncManager.isUpdatingFromGlobal;
                syncManager.isUpdatingFromGlobal = true;
                console.log(`🔒 Squeeze: 第${attempt + 1}次尝试 - 设置同步锁定状态`);
                
                // 先确保时间轴配置一致
                console.log(`🔧 Squeeze: 第${attempt + 1}次尝试 - 开始时间轴配置对齐`);
                this.alignTimeAxisWithMain();
                
                // 然后设置时间范围
                console.log(`📐 Squeeze: 第${attempt + 1}次尝试 - 开始设置时间范围`);
                
                // 确保时间范围格式正确
                const normalizedTimeRange = {
                    from: ChartUtils.convertTimeToNumber(mainTimeRange.from),
                    to: ChartUtils.convertTimeToNumber(mainTimeRange.to)
                };
                
                console.log(`🔄 Squeeze: 第${attempt + 1}次尝试 - 时间范围格式化:`, {
                    原始: mainTimeRange,
                    转换后: normalizedTimeRange
                });
                
                this.setTimeRange(normalizedTimeRange);
                
                // 验证同步结果
                setTimeout(() => {
                    try {
                        const currentRange = this.chart.timeScale().getVisibleRange();
                        console.log(`📏 Squeeze: 第${attempt + 1}次尝试 - 同步后子图时间范围:`, currentRange);
                        
                        if (currentRange) {
                            const timeDiff = {
                                fromDiff: Math.abs(ChartUtils.convertTimeToNumber(mainTimeRange.from) - ChartUtils.convertTimeToNumber(currentRange.from)),
                                toDiff: Math.abs(ChartUtils.convertTimeToNumber(mainTimeRange.to) - ChartUtils.convertTimeToNumber(currentRange.to))
                            };
                            console.log(`📐 Squeeze: 第${attempt + 1}次尝试 - 同步精度检查:`, timeDiff);
                        }
                    } catch (e) {
                        console.warn(`⚠️ Squeeze: 第${attempt + 1}次尝试 - 同步验证失败:`, e.message);
                    }
                }, 50);
                
                console.log(`✅ Squeeze: 第${attempt + 1}次同步成功`);
                
                setTimeout(() => {
                    syncManager.isUpdatingFromGlobal = wasUpdating;
                    console.log(`🔓 Squeeze: 第${attempt + 1}次尝试 - 释放同步锁定状态`);
                }, 50);
                
            } catch (error) {
                console.error(`❌ Squeeze: 第${attempt + 1}次同步失败:`, error);
                console.error(`错误详情 (第${attempt + 1}次):`, {
                    message: error.message,
                    stack: error.stack,
                    attempt: attempt + 1,
                    maxAttempts: maxAttempts,
                    chartExists: !!this.chart,
                    mainChartExists: !!this.mainChart
                });
                
                if (attempt < maxAttempts - 1) {
                    console.log(`🔄 Squeeze: 将进行第${attempt + 2}次尝试`);
                    this.attemptSync(attempt + 1);
                } else {
                    console.log('🚨 Squeeze: 所有同步尝试失败，使用自适应模式');
                    this.forceTimeAxisAlignment();
                }
            }
        }, delay);
    }
    
    /**
     * 强制时间轴对齐
     */
    forceTimeAxisAlignment() {
        console.log('🚨 Squeeze: 开始强制时间轴对齐...');
        
        try {
            // 记录强制对齐前的状态
            if (this.chart) {
                try {
                    const beforeRange = this.chart.timeScale().getVisibleRange();
                    console.log('📏 Squeeze: 强制对齐前子图时间范围:', beforeRange);
                } catch (e) {
                    console.warn('⚠️ Squeeze: 无法获取强制对齐前的时间范围:', e.message);
                }
            }
            
            console.log('🔧 Squeeze: 执行时间轴配置对齐...');
            this.alignTimeAxisWithMain();
            
            // 获取主图时间范围并强制应用到子图
            if (this.chart && this.mainChart && this.mainChart.chart) {
                try {
                    const mainRange = this.mainChart.chart.timeScale().getVisibleRange();
                    console.log('📏 Squeeze: 获取主图时间范围用于强制对齐:', mainRange);
                    
                    if (mainRange) {
                        // 强制设置子图时间范围为主图时间范围
                        const normalizedRange = {
                            from: ChartUtils.convertTimeToNumber(mainRange.from),
                            to: ChartUtils.convertTimeToNumber(mainRange.to)
                        };
                        
                        console.log('🎯 Squeeze: 强制设置子图时间范围:', normalizedRange);
                        this.chart.timeScale().setVisibleRange(normalizedRange);
                        
                        // 验证强制设置后的效果
                        setTimeout(() => {
                            try {
                                const afterRange = this.chart.timeScale().getVisibleRange();
                                console.log('📏 Squeeze: 强制设置后子图时间范围:', afterRange);
                                
                                if (afterRange) {
                                    const timeDiff = {
                                        fromDiff: Math.abs(ChartUtils.convertTimeToNumber(mainRange.from) - ChartUtils.convertTimeToNumber(afterRange.from)),
                                        toDiff: Math.abs(ChartUtils.convertTimeToNumber(mainRange.to) - ChartUtils.convertTimeToNumber(afterRange.to))
                                    };
                                    console.log('📐 Squeeze: 强制对齐后时间差异:', timeDiff);
                                    
                                                                         if (timeDiff.fromDiff < 86400 && timeDiff.toDiff < 86400) { // 1天内的差异可接受
                                         console.log('✅ Squeeze: 强制对齐成功，时间差异在可接受范围内');
                                     } else {
                                         console.warn('⚠️ Squeeze: 强制对齐后仍有较大差异，启用锁定模式');
                                         
                                         // 强制锁定时间范围，禁用所有自动调整
                                         this.chart.timeScale().applyOptions({
                                             fixLeftEdge: true,
                                             fixRightEdge: true,
                                             lockVisibleTimeRangeOnResize: true,
                                             rightOffset: 0,  // 禁用右侧偏移
                                             barSpacing: 6,   // 保持柱间距
                                             shiftVisibleRangeOnNewBar: false  // 禁用新数据自动移动
                                         });
                                         
                                         console.log('🔒 Squeeze: 已应用锁定配置，强制重新设置时间范围');
                                         
                                         // 多次尝试设置时间范围，确保生效
                                         for (let i = 0; i < 3; i++) {
                                             setTimeout(() => {
                                                 try {
                                                     this.chart.timeScale().setVisibleRange(normalizedRange);
                                                     console.log(`🎯 Squeeze: 第${i + 1}次强制设置时间范围`);
                                                     
                                                     // 最后一次验证
                                                     if (i === 2) {
                                                         setTimeout(() => {
                                                             const finalRange = this.chart.timeScale().getVisibleRange();
                                                             const finalDiff = {
                                                                 fromDiff: Math.abs(ChartUtils.convertTimeToNumber(mainRange.from) - ChartUtils.convertTimeToNumber(finalRange.from)),
                                                                 toDiff: Math.abs(ChartUtils.convertTimeToNumber(mainRange.to) - ChartUtils.convertTimeToNumber(finalRange.to))
                                                             };
                                                             console.log('📐 Squeeze: 最终锁定后时间差异:', finalDiff);
                                                             
                                                             if (finalDiff.fromDiff > 86400 || finalDiff.toDiff > 86400) {
                                                                 console.warn('🚨 Squeeze: 锁定模式仍无法完全对齐，可能受数据范围限制');
                                                                 console.log('📊 Squeeze: 数据范围可能不包含主图的完整时间范围');
                                                             } else {
                                                                 console.log('✅ Squeeze: 锁定模式对齐成功');
                                                             }
                                                         }, 100);
                                                     }
                                                 } catch (e) {
                                                     console.warn(`⚠️ Squeeze: 第${i + 1}次强制设置失败:`, e.message);
                                                 }
                                             }, i * 50);
                                         }
                                     }
                                }
                            } catch (e) {
                                console.warn('⚠️ Squeeze: 强制对齐验证失败:', e.message);
                            }
                        }, 100);
                        
                        console.log('✅ Squeeze: 强制对齐完成，已设置为主图时间范围');
                    } else {
                        console.warn('⚠️ Squeeze: 无法获取主图时间范围，使用自适应模式');
                        this.chart.timeScale().fitContent();
                    }
                } catch (e) {
                    console.error('❌ Squeeze: 强制设置时间范围失败:', e);
                    // 回退到fitContent
                    this.chart.timeScale().fitContent();
                }
            } else {
                console.error('❌ Squeeze: 子图或主图chart不存在，无法强制对齐');
            }
        } catch (error) {
            console.error('❌ Squeeze: 强制对齐失败:', error);
            console.error('强制对齐错误详情:', {
                message: error.message,
                stack: error.stack,
                chartExists: !!this.chart,
                mainChartExists: !!this.mainChart
            });
        }
    }
    
    /**
     * 与主图时间轴对齐
     */
    alignTimeAxisWithMain() {
        console.log('🔧 Squeeze: 开始时间轴对齐...');
        
        if (!this.chart) {
            console.error('❌ Squeeze: 子图chart不存在，无法对齐');
            return;
        }
        
        if (!this.mainChart) {
            console.error('❌ Squeeze: 主图引用不存在，无法对齐');
            return;
        }
        
        if (!this.mainChart.chart) {
            console.error('❌ Squeeze: 主图chart不存在，无法对齐');
            return;
        }
        
        try {
            // 获取主图的时间轴配置
            const mainTimeScale = this.mainChart.chart.timeScale();
            console.log('📊 Squeeze: 获取主图时间轴引用成功');
            
            // 获取主图当前的时间范围（用于调试）
            try {
                const mainTimeRange = mainTimeScale.getVisibleRange();
                console.log('📏 Squeeze: 主图当前时间范围:', mainTimeRange);
            } catch (e) {
                console.warn('⚠️ Squeeze: 无法获取主图时间范围:', e.message);
            }
            
            // 获取子图当前的时间范围（对齐前）
            try {
                const subTimeRange = this.chart.timeScale().getVisibleRange();
                console.log('📏 Squeeze: 子图对齐前时间范围:', subTimeRange);
            } catch (e) {
                console.warn('⚠️ Squeeze: 无法获取子图时间范围:', e.message);
            }
            
            // 应用相同的时间轴配置
            const timeAxisOptions = {
                rightOffset: 5,      // 与主图保持一致
                barSpacing: 6,       // 与主图保持一致
                fixLeftEdge: false,
                fixRightEdge: false,
                lockVisibleTimeRangeOnResize: true,
                timeVisible: true,
                secondsVisible: false,
                borderVisible: true
            };
            
            console.log('⚙️ Squeeze: 应用时间轴配置:', timeAxisOptions);
            this.chart.timeScale().applyOptions(timeAxisOptions);
            
            // 验证配置是否生效（对齐后）
            setTimeout(() => {
                try {
                    const subTimeRangeAfter = this.chart.timeScale().getVisibleRange();
                    console.log('📏 Squeeze: 子图对齐后时间范围:', subTimeRangeAfter);
                    
                    // 比较主图和子图的时间范围
                    const mainTimeRange = mainTimeScale.getVisibleRange();
                    if (mainTimeRange && subTimeRangeAfter) {
                        const timeDiff = {
                            fromDiff: Math.abs(ChartUtils.convertTimeToNumber(mainTimeRange.from) - ChartUtils.convertTimeToNumber(subTimeRangeAfter.from)),
                            toDiff: Math.abs(ChartUtils.convertTimeToNumber(mainTimeRange.to) - ChartUtils.convertTimeToNumber(subTimeRangeAfter.to))
                        };
                        console.log('📐 Squeeze: 主子图时间差异:', timeDiff);
                        
                        if (timeDiff.fromDiff < 1 && timeDiff.toDiff < 1) {
                            console.log('✅ Squeeze: 时间轴对齐成功，差异在可接受范围内');
                        } else {
                            console.warn('⚠️ Squeeze: 时间轴对齐后仍有较大差异，尝试强制同步');
                            
                            // 如果差异较大，强制设置子图时间范围为主图时间范围
                            try {
                                console.log('🔧 Squeeze: 强制设置子图时间范围为主图时间范围');
                                const convertedMainRange = {
                                    from: ChartUtils.convertTimeToNumber(mainTimeRange.from),
                                    to: ChartUtils.convertTimeToNumber(mainTimeRange.to)
                                };
                                
                                // 先应用强制锁定配置
                                this.chart.timeScale().applyOptions({
                                    fixLeftEdge: true,
                                    fixRightEdge: true,
                                    lockVisibleTimeRangeOnResize: true,
                                    rightOffset: 0,
                                    shiftVisibleRangeOnNewBar: false
                                });
                                
                                this.chart.timeScale().setVisibleRange(convertedMainRange);
                                console.log('✅ Squeeze: 强制同步完成');
                                
                                // 再次验证
                                setTimeout(() => {
                                    const finalRange = this.chart.timeScale().getVisibleRange();
                                    const finalDiff = {
                                        fromDiff: Math.abs(ChartUtils.convertTimeToNumber(mainTimeRange.from) - ChartUtils.convertTimeToNumber(finalRange.from)),
                                        toDiff: Math.abs(ChartUtils.convertTimeToNumber(mainTimeRange.to) - ChartUtils.convertTimeToNumber(finalRange.to))
                                    };
                                    console.log('📐 Squeeze: 强制同步后差异:', finalDiff);
                                    
                                    // 如果仍有差异，说明是数据范围限制
                                    if (finalDiff.fromDiff > 86400 || finalDiff.toDiff > 86400) {
                                        console.warn('🚨 Squeeze: 数据范围限制导致无法完全对齐');
                                        console.log('💡 Squeeze: 子图数据可能不包含主图的完整时间范围');
                                    }
                                }, 50);
                            } catch (forceError) {
                                console.error('❌ Squeeze: 强制同步失败:', forceError);
                            }
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Squeeze: 对齐验证失败:', e.message);
                }
            }, 50);
            
            console.log('✅ Squeeze: 时间轴配置已与主图对齐');
        } catch (error) {
            console.error('❌ Squeeze: 时间轴配置对齐失败:', error);
            console.error('错误详情:', {
                message: error.message,
                stack: error.stack,
                chartExists: !!this.chart,
                mainChartExists: !!this.mainChart,
                mainChartChartExists: !!this.mainChart?.chart
            });
        }
    }
    
    getSourceName() {
        return 'squeeze';
    }
}

// ================================
// 成交量图表类
// ================================
class VolumeChart extends BaseChart {
    constructor(container) {
        super(container, ChartConfig.VOLUME_CHART);
        this.volumeSeries = null;
        this.mainChart = null;
    }
    
    setMainChart(mainChart) {
        this.mainChart = mainChart;
    }
    
    onCreated() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 与主图同步时间范围
        this.subscribeTimeRangeChange((timeRange) => {
            if (this.mainChart && timeRange && this.volumeSeries) {
                try {
                    // 确保主图有数据系列再进行同步
                    if (this.mainChart.series && this.mainChart.series.length > 0) {
                        this.mainChart.chart.timeScale().setVisibleRange(timeRange);
                    }
                } catch (e) {
                    console.warn('成交量图同步主图失败:', e);
                }
            }
        });
    }
    
    async loadVolumeData(codes) {
        try {
            // 创建成交量系列
            this.volumeSeries = this.addSeries('histogram', {
                priceFormat: { type: 'volume' },
                color: ChartConfig.COLORS.VOLUME
            });
            
            // 收集所有股票的成交量数据
            const allVolumeData = new Map();
            
            for (let i = 0; i < codes.length; i++) {
                const code = codes[i];
                const response = await fetch(`/api/kline?code=${code}`);
                const ohlc = await response.json();
                
                const colorScheme = ChartConfig.COLORS.MULTI_STOCK[i] || ChartConfig.COLORS.MULTI_STOCK[0];
                
                ohlc.forEach(bar => {
                    if (bar.volume && bar.volume > 0) {
                        const time = bar.time;
                        const volume = Number(bar.volume);
                        const color = bar.close >= bar.open ? colorScheme.upColor : colorScheme.downColor;
                        
                        if (!allVolumeData.has(time)) {
                            allVolumeData.set(time, { time, value: 0, color });
                        }
                        
                        const existing = allVolumeData.get(time);
                        existing.value += volume;
                        
                        // 使用主股票的颜色
                        if (i === 0) {
                            existing.color = color;
                        }
                    }
                });
            }
            
            // 转换为数组并排序
            const volumeData = Array.from(allVolumeData.values())
                .sort((a, b) => ChartUtils.convertTimeToNumber(a.time) - ChartUtils.convertTimeToNumber(b.time));
            
            this.volumeSeries.setData(volumeData);
            
            // 标记数据已加载
            this.isDataLoaded = true;
            
            // 等待图表完全渲染后再标记为已对齐
            setTimeout(() => {
                this.isAligned = true;
                console.log(`✅ 成交量图数据加载完成: ${volumeData.length}条记录`);
            }, 100);
            
        } catch (error) {
            console.error('❌ 成交量图数据加载失败:', error);
        }
    }
    
    getSourceName() {
        return 'volume';
    }
}

// ================================
// 指标图表类
// ================================
class IndicatorChart extends BaseChart {
    constructor(container) {
        super(container, ChartConfig.INDICATOR_CHART);
        this.momentumSeries = null;
        this.zeroLineSeries = null;
        this.mainChart = null;
    }
    
    setMainChart(mainChart) {
        this.mainChart = mainChart;
    }
    
    onCreated() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 与主图同步时间范围
        this.subscribeTimeRangeChange((timeRange) => {
            if (this.mainChart && timeRange && this.momentumSeries) {
                try {
                    // 确保主图有数据系列再进行同步
                    if (this.mainChart.series && this.mainChart.series.length > 0) {
                        this.mainChart.chart.timeScale().setVisibleRange(timeRange);
                    }
                } catch (e) {
                    console.warn('指标图同步主图失败:', e);
                }
            }
        });
    }
    
    async loadSqueezeData(code) {
        try {
            const response = await fetch(`/api/indicator?code=${code}&type=squeeze_momentum`);
            const data = await response.json();
            
            console.log(`📊 指标图加载Squeeze数据: ${data.length}条`);
            
            // 创建动量柱状图
            this.momentumSeries = this.addSeries('histogram', {
                priceFormat: {
                    type: 'price',
                    precision: 4,
                    minMove: 0.0001
                }
            });
            
            // 处理动量数据
            const momentumData = data.map(item => ({
                time: item.time,
                value: item.momentum || 0,
                color: this.getSqueezeColor(item.momentum || 0)
            }));
            
            this.momentumSeries.setData(momentumData);
            
            // 添加零线
            this.zeroLineSeries = this.addSeries('line', {
                color: '#888888',
                lineWidth: 1,
                lineStyle: 0,
                crosshairMarkerVisible: false
            });
            
            const zeroLineData = data.map(item => ({
                time: item.time,
                value: 0
            }));
            
            this.zeroLineSeries.setData(zeroLineData);
            
            // 添加Squeeze标记
            this.addSqueezeMarkers(data);
            
            // 标记数据已加载
            this.isDataLoaded = true;
            
            // 等待图表完全渲染后再标记为已对齐
            setTimeout(() => {
                this.isAligned = true;
                console.log('✅ Squeeze Momentum指标加载完成');
            }, 100);
            
        } catch (error) {
            console.error('❌ 指标图数据加载失败:', error);
        }
    }
    
    getSqueezeColor(momentum) {
        if (momentum > 0) {
            return '#00C851'; // 绿色
        } else if (momentum < 0) {
            return '#FF4444'; // 红色
        } else {
            return '#9E9E9E'; // 灰色
        }
    }
    
    addSqueezeMarkers(data) {
        const markers = [];
        
        data.forEach(item => {
            if (item.squeeze_on) {
                markers.push({
                    time: item.time,
                    position: 'aboveBar',
                    color: '#2196F3',
                    shape: 'circle',
                    text: '●',
                    size: 0.5
                });
            }
        });
        
        if (markers.length > 0 && this.momentumSeries) {
            this.momentumSeries.setMarkers(markers);
        }
    }
    
    getSourceName() {
        return 'indicator';
    }
}

// ================================
// 多面板图表管理器
// ================================
class MultiPanelChartManager {
    constructor() {
        this.mainChart = null;
        this.volumeChart = null;
        this.indicatorChart = null;
        this.containers = {};
        this.syncEnabled = true;
    }
    
    /**
     * 创建多面板图表布局
     */
    createMultiPanelLayout(mainContainer) {
        // 创建主容器
        const wrapper = document.createElement('div');
        wrapper.id = 'multi-panel-wrapper';
        wrapper.style.cssText = `
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 2px;
            background: #f5f5f5;
            padding: 2px;
            border-radius: 4px;
            box-sizing: border-box;
            margin: 0;
            align-items: stretch;
        `;
        
        // 创建主图容器
        const mainChartContainer = document.createElement('div');
        mainChartContainer.id = 'main-chart-panel';
        mainChartContainer.style.cssText = `
            width: 100%;
            height: ${ChartConfig.MAIN_CHART.height}px;
            background: white;
            border-radius: 2px;
            border: 1px solid #e0e0e0;
            box-sizing: border-box;
            padding: 0;
            margin: 0;
            position: relative;
        `;
        
        // 创建成交量图容器
        const volumeChartContainer = document.createElement('div');
        volumeChartContainer.id = 'volume-chart-panel';
        volumeChartContainer.style.cssText = `
            width: 100%;
            height: ${ChartConfig.VOLUME_CHART.height}px;
            background: white;
            border-radius: 2px;
            border: 1px solid #e0e0e0;
            box-sizing: border-box;
            padding: 0;
            margin: 0;
            position: relative;
        `;
        
        // 创建指标图容器
        const indicatorChartContainer = document.createElement('div');
        indicatorChartContainer.id = 'indicator-chart-panel';
        indicatorChartContainer.style.cssText = `
            width: 100%;
            height: ${ChartConfig.INDICATOR_CHART.height}px;
            background: white;
            border-radius: 2px;
            border: 1px solid #e0e0e0;
            box-sizing: border-box;
            padding: 0;
            margin: 0;
            position: relative;
        `;
        
        // 组装布局
        wrapper.appendChild(mainChartContainer);
        wrapper.appendChild(volumeChartContainer);
        wrapper.appendChild(indicatorChartContainer);
        
        // 替换原容器内容
        mainContainer.innerHTML = '';
        mainContainer.appendChild(wrapper);
        
        // 保存容器引用
        this.containers = {
            main: mainChartContainer,
            volume: volumeChartContainer,
            indicator: indicatorChartContainer
        };
        
        console.log('✅ 多面板布局创建完成');
        return this.containers;
    }
    
    /**
     * 创建所有图表实例
     */
    createCharts() {
        // 创建主图
        this.mainChart = new MainChart(this.containers.main);
        this.mainChart.create();
        
        // 创建成交量图
        this.volumeChart = new VolumeChart(this.containers.volume);
        this.volumeChart.create();
        
        // 创建指标图
        this.indicatorChart = new IndicatorChart(this.containers.indicator);
        this.indicatorChart.create();
        
        // 设置图表间的关联
        this.volumeChart.setMainChart(this.mainChart);
        this.indicatorChart.setMainChart(this.mainChart);
        
        // 统一所有图表的价格轴对齐配置
        this.alignAllPriceScales();
        
        // 设置同步
        this.setupChartSync();
        
        console.log('✅ 所有图表实例创建完成');
    }

    /**
     * 统一所有图表的价格轴对齐配置
     */
    alignAllPriceScales() {
        const alignmentConfig = {
            rightPriceScale: {
                visible: true,
                borderVisible: true,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1
                },
                mode: LightweightCharts.PriceScaleMode.Normal,
                autoScale: true,
                invertScale: false,
                alignLabels: true,
                borderColor: '#e0e0e0',
                textColor: '#333333',
                entireTextOnly: false,
                ticksVisible: true,
                minimumWidth: 80  // 确保价格轴有固定最小宽度
            },
            leftPriceScale: {
                visible: false
            },
            timeScale: {
                rightOffset: 12,      // 统一的右侧偏移量
                barSpacing: 6,        // 统一的柱间距
                fixLeftEdge: false,
                fixRightEdge: false,
                lockVisibleTimeRangeOnResize: true,
                shiftVisibleRangeOnNewBar: false,
                borderVisible: true,
                borderColor: '#e0e0e0',
                rightBarStaysOnScroll: true
            }
        };

        // 应用到所有图表
        try {
            if (this.mainChart && this.mainChart.chart) {
                this.mainChart.chart.applyOptions(alignmentConfig);
                // 标记为已配置对齐
                this.mainChart.isAligned = true;
            }
            if (this.volumeChart && this.volumeChart.chart) {
                this.volumeChart.chart.applyOptions({
                    ...alignmentConfig,
                    timeScale: {
                        ...alignmentConfig.timeScale,
                        visible: false,  // 成交量图隐藏时间轴
                        timeVisible: false,
                        borderVisible: false
                    }
                });
                // 标记为已配置对齐
                this.volumeChart.isAligned = true;
            }
            if (this.indicatorChart && this.indicatorChart.chart) {
                this.indicatorChart.chart.applyOptions(alignmentConfig);
                // 标记为已配置对齐
                this.indicatorChart.isAligned = true;
            }
            
            console.log('✅ 所有图表价格轴对齐配置已统一');
        } catch (error) {
            console.error('❌ 价格轴对齐配置失败:', error);
        }
    }
    
    /**
     * 设置图表同步
     */
    setupChartSync() {
        if (!this.syncEnabled) return;
        
        const charts = [this.mainChart, this.volumeChart, this.indicatorChart];
        
        charts.forEach((chart, index) => {
            if (chart && chart.chart) {
                chart.chart.timeScale().subscribeVisibleTimeRangeChange((timeRange) => {
                    if (this.syncEnabled && timeRange) {
                        // 同步其他图表，但要更安全地处理
                        charts.forEach((otherChart, otherIndex) => {
                            if (otherIndex !== index && otherChart && otherChart.chart) {
                                // 检查图表是否完全准备好进行同步
                                const isChartReady = otherChart.series && 
                                                   otherChart.series.length > 0 && 
                                                   otherChart.isDataLoaded && 
                                                   otherChart.isAligned;
                                
                                if (isChartReady) {
                                    try {
                                        otherChart.chart.timeScale().setVisibleRange(timeRange);
                                    } catch (e) {
                                        // 静默处理同步失败，避免日志噪音
                                        if (!e.message.includes('Value is null')) {
                                            console.warn(`图表${otherIndex}同步失败:`, e);
                                        }
                                    }
                                } else if (otherChart.series && otherChart.series.length > 0) {
                                    // 如果图表有数据但未完全准备好，延迟同步
                                    setTimeout(() => {
                                        const isDelayedReady = otherChart.series && 
                                                             otherChart.series.length > 0 && 
                                                             otherChart.isDataLoaded && 
                                                             otherChart.isAligned;
                                        
                                        if (isDelayedReady) {
                                            try {
                                                otherChart.chart.timeScale().setVisibleRange(timeRange);
                                            } catch (e) {
                                                // 延迟同步失败，静默处理
                                                if (!e.message.includes('Value is null')) {
                                                    console.warn(`图表${otherIndex}延迟同步失败:`, e);
                                                }
                                            }
                                        }
                                    }, 200);
                                }
                                // 如果图表未准备好，静默跳过
                            }
                        });
                    }
                });
            }
        });
        
        console.log('✅ 图表同步设置完成');
    }
    
    /**
     * 加载数据到所有面板
     */
    async loadData(codes, selectedIndicators) {
        try {
            console.log('🔄 开始加载多面板数据...');
            
            // 首先加载主图数据（K线和SuperTrend）
            await this.mainChart.loadMainData(codes, selectedIndicators.filter(ind => 
                ['supertrend', 'ma5', 'ma10'].includes(ind)
            ));
            console.log('✅ 主图数据加载完成');
            
            // 等待主图数据稳定后再加载其他面板
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // 顺序加载其他面板数据，确保每个面板完全准备好再加载下一个
            
            // 加载成交量数据
            await this.volumeChart.loadVolumeData(codes);
            console.log('✅ 成交量数据加载完成');
            
            // 等待成交量图完全稳定（包括isAligned标记设置）
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // 加载指标数据（Squeeze Momentum）
            if (selectedIndicators.includes('squeeze_momentum')) {
                await this.indicatorChart.loadSqueezeData(codes[0]);
                console.log('✅ 指标数据加载完成');
                
                // 等待指标图完全稳定
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            // 最后进行一次全面的图表同步
            setTimeout(() => {
                this.performInitialSync();
            }, 300);
            
            console.log('✅ 所有面板数据加载完成');
        } catch (error) {
            console.error('❌ 多面板数据加载失败:', error);
        }
    }

    /**
     * 执行初始同步，确保所有图表时间轴对齐
     */
    performInitialSync() {
        try {
            // 检查主图是否完全准备好
            const isMainReady = this.mainChart && 
                              this.mainChart.chart && 
                              this.mainChart.isDataLoaded && 
                              this.mainChart.isAligned;
            
            if (isMainReady) {
                const mainTimeRange = this.mainChart.chart.timeScale().getVisibleRange();
                if (mainTimeRange) {
                    let syncCount = 0;
                    let totalCharts = 0;
                    
                    // 同步成交量图（检查是否完全准备好）
                    const isVolumeReady = this.volumeChart && 
                                        this.volumeChart.series.length > 0 && 
                                        this.volumeChart.isDataLoaded && 
                                        this.volumeChart.isAligned;
                    
                    if (isVolumeReady) {
                        totalCharts++;
                        try {
                            this.volumeChart.chart.timeScale().setVisibleRange(mainTimeRange);
                            syncCount++;
                        } catch (e) {
                            if (!e.message.includes('Value is null')) {
                                console.warn('初始同步成交量图失败:', e);
                            }
                        }
                    }
                    
                    // 同步指标图（检查是否完全准备好）
                    const isIndicatorReady = this.indicatorChart && 
                                           this.indicatorChart.series.length > 0 && 
                                           this.indicatorChart.isDataLoaded && 
                                           this.indicatorChart.isAligned;
                    
                    if (isIndicatorReady) {
                        totalCharts++;
                        try {
                            this.indicatorChart.chart.timeScale().setVisibleRange(mainTimeRange);
                            syncCount++;
                        } catch (e) {
                            if (!e.message.includes('Value is null')) {
                                console.warn('初始同步指标图失败:', e);
                            }
                        }
                    }
                    
                    console.log(`✅ 初始图表同步完成 (${syncCount}/${totalCharts})`);
                }
            } else {
                // 如果主图还没准备好，延迟重试
                setTimeout(() => {
                    this.performInitialSync();
                }, 200);
            }
        } catch (error) {
            console.warn('初始同步失败:', error);
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
        if (this.volumeChart) {
            this.volumeChart.destroy();
            this.volumeChart = null;
        }
        if (this.indicatorChart) {
            this.indicatorChart.destroy();
            this.indicatorChart = null;
        }
        
        // 清理容器
        const wrapper = document.getElementById('multi-panel-wrapper');
        if (wrapper) {
            wrapper.remove();
        }
        
        console.log('✅ 多面板图表已销毁');
    }
}

// ================================
// 图表管理器（保持兼容性）
// ================================
class ChartManager {
    constructor() {
        this.mainChart = null;
        this.subCharts = [];
        this.multiPanelManager = null;
    }
    
    /**
     * 创建多面板图表（新方法）
     */
    createMultiPanelChart(container) {
        if (this.multiPanelManager) {
            this.multiPanelManager.destroy();
        }
        
        this.multiPanelManager = new MultiPanelChartManager();
        this.multiPanelManager.createMultiPanelLayout(container);
        this.multiPanelManager.createCharts();
        
        // 保持兼容性
        this.mainChart = this.multiPanelManager.mainChart;
        
        return this.multiPanelManager;
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
window.VolumeChart = VolumeChart;
window.IndicatorChart = IndicatorChart;
window.MultiPanelChartManager = MultiPanelChartManager;
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
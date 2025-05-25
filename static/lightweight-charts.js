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
            rightOffset: 12,
            barSpacing: 3,
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
            rightOffset: 12,
            barSpacing: 3,
            fixLeftEdge: false,
            fixRightEdge: false,
            lockVisibleTimeRangeOnResize: true
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
        if (typeof time === 'number') return time;
        if (typeof time === 'string') return new Date(time).getTime() / 1000;
        return time;
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
        if (this.isUpdatingFromGlobal) return;
        
        this.globalTimeRange = timeRange;
        this.isUpdatingFromGlobal = true;
        
        try {
            // 通知所有注册的图表进行同步
            ChartRegistry.syncAll(timeRange, source);
        } catch (error) {
            console.error('同步过程中发生错误:', error);
        } finally {
            setTimeout(() => {
                this.isUpdatingFromGlobal = false;
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
        this.onCreated();
        return this.chart;
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
        return series;
    }
    
    /**
     * 设置时间范围
     */
    setTimeRange(timeRange) {
        if (this.chart && timeRange && this.isValidTimeRange(timeRange)) {
            try {
                this.chart.timeScale().setVisibleRange(timeRange);
            } catch (error) {
                console.warn('设置时间范围失败:', error, '时间范围:', timeRange);
            }
        }
    }
    
    /**
     * 验证时间范围是否有效
     */
    isValidTimeRange(timeRange) {
        if (!timeRange || typeof timeRange !== 'object') return false;
        if (!timeRange.from || !timeRange.to) return false;
        
        const from = ChartUtils.convertTimeToNumber(timeRange.from);
        const to = ChartUtils.convertTimeToNumber(timeRange.to);
        
        return !isNaN(from) && !isNaN(to) && from < to;
    }
    
    /**
     * 获取时间范围
     */
    getTimeRange() {
        if (!this.chart) return null;
        
        try {
            const range = this.chart.timeScale().getVisibleRange();
            return this.isValidTimeRange(range) ? range : null;
        } catch (error) {
            console.warn('获取时间范围失败:', error);
            return null;
        }
    }
    
    /**
     * 同步时间范围（供同步管理器调用）
     */
    syncTimeRange(timeRange, source) {
        if (source !== this.getSourceName() && this.isValidTimeRange(timeRange)) {
            this.setTimeRange(timeRange);
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
        
        const promises = codes.map((code, idx) => 
            this.loadStockData(code, idx, selectedIndicators)
        );
        
        await Promise.all(promises);
    }
    
    /**
     * 清除数据
     */
    clearData() {
        this.candleSeries = [];
        this.indicatorSeries = [];
        this.clearSubCharts();
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
            
            this.createCandlestickSeries(ohlc, index);
            
            if (index === 0) {
                this.createVolumeSeries(ohlc);
                await this.loadIndicators(code, selectedIndicators);
            }
        } catch (error) {
            console.error(`加载股票 ${code} 数据失败:`, error);
        }
    }
    
    /**
     * 创建K线系列
     */
    createCandlestickSeries(ohlc, index) {
        const colors = this.getCandlestickColors(index);
        const candleSeries = this.addSeries('candlestick', {
            priceScaleId: 'right',
            scaleMargins: { top: 0.2, bottom: 0.3 },
            ...colors
        });
        
        candleSeries.setData(ohlc);
        this.candleSeries.push(candleSeries);
        
        return candleSeries;
    }
    
    /**
     * 获取K线颜色配置
     */
    getCandlestickColors(index) {
        const isMain = index === 0;
        return {
            upColor: isMain ? ChartConfig.COLORS.UP : '#2196f3',
            downColor: isMain ? ChartConfig.COLORS.DOWN : '#9c27b0',
            borderUpColor: isMain ? ChartConfig.COLORS.UP : '#2196f3',
            borderDownColor: isMain ? ChartConfig.COLORS.DOWN : '#9c27b0',
            wickUpColor: isMain ? ChartConfig.COLORS.UP : '#2196f3',
            wickDownColor: isMain ? ChartConfig.COLORS.DOWN : '#9c27b0'
        };
    }
    
    /**
     * 创建成交量系列
     */
    createVolumeSeries(ohlc) {
        const volumeData = ohlc.map(bar => ({
            time: bar.time,
            value: Number(bar.volume),
            color: bar.close >= bar.open ? ChartConfig.COLORS.UP : ChartConfig.COLORS.DOWN
        }));
        
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
        return data.filter(item => item.signal).map(item => ({
            time: item.time,
            position: item.signal === 'buy' ? 'belowBar' : 'aboveBar',
            color: item.signal === 'buy' ? ChartConfig.COLORS.UP : ChartConfig.COLORS.DOWN,
            shape: item.signal === 'buy' ? 'arrowUp' : 'arrowDown',
            text: item.signal === 'buy' ? 'B' : 'S'
        }));
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
        
        // 优先使用seriesPrices获取数据
        if (param.seriesPrices) {
            for (const value of param.seriesPrices.values()) {
                if (this.isValidOHLCData(value)) {
                    this.updateInfoBar(value);
                    return;
                }
            }
        }
        
        // 备用方法：从原始数据中查找
        if (this.currentOhlcData) {
            const dataPoint = this.currentOhlcData.find(item => item.time === param.time);
            if (dataPoint) {
                this.updateInfoBar(dataPoint);
                return;
            }
        }
        
        this.clearInfoBar();
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
     * 更新信息栏
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
            
            // 初始同步
            setTimeout(() => this.initialSync(), 300);
            
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
        
        const momentumData = data
            .filter(item => item.momentum !== null && !isNaN(item.momentum))
            .map(item => ({
                time: item.time,
                value: Number(item.momentum),
                color: this.getMomentumColor(item.bar_color)
            }));
        
        console.log('过滤后的动量数据长度:', momentumData.length);
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
            console.warn('主图未设置，跳过初始同步');
            return;
        }
        
        // 延迟执行，确保图表完全初始化
        setTimeout(() => {
            try {
                const mainTimeRange = this.mainChart.getTimeRange();
                if (!mainTimeRange) {
                    console.warn('无法获取主图时间范围，跳过同步');
                    return;
                }
                
                console.log('开始Squeeze初始同步，主图时间范围:', mainTimeRange);
                
                const wasUpdating = syncManager.isUpdatingFromGlobal;
                syncManager.isUpdatingFromGlobal = true;
                
                this.setTimeRange(mainTimeRange);
                console.log('Squeeze初始同步完成');
                
                setTimeout(() => {
                    syncManager.isUpdatingFromGlobal = wasUpdating;
                }, 100);
                
            } catch (error) {
                console.error('Squeeze初始同步失败:', error);
                // 重试一次
                setTimeout(() => {
                    console.log('重试Squeeze同步...');
                    this.initialSync();
                }, 1000);
            }
        }, 500);
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

// 模块信息
console.log('轻量级图表库已加载 - 重构版本 2.0.0'); 
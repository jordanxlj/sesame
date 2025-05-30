// BaseChart 单元测试
const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const { BaseChart, ChartConfig, ChartUtils, ChartRegistry } = require('../static/lightweight-charts.js');

describe('BaseChart', () => {
    let baseChart;
    let mockContainer;

    beforeEach(() => {
        // 创建模拟容器
        mockContainer = {
            style: {},
            appendChild: jest.fn(),
            removeChild: jest.fn(),
            getBoundingClientRect: jest.fn().mockReturnValue({
                width: 1000,
                height: 400
            })
        };

        // 确保LightweightCharts在window对象上可用
        global.window.LightweightCharts = global.LightweightCharts;

        // 重置ChartRegistry
        ChartRegistry.clear();
    });

    afterEach(() => {
        if (baseChart) {
            try {
                baseChart.destroy();
            } catch (e) {
                // Ignore cleanup errors
            }
            baseChart = null;
        }
        ChartRegistry.clear();
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            baseChart = new BaseChart(mockContainer);
            
            expect(baseChart.container).toBe(mockContainer);
            expect(baseChart.chart).toBeNull();
            expect(baseChart.series).toEqual([]);
            expect(baseChart.options).toEqual({});
            expect(baseChart.id).toMatch(/^chart_/);
        });

        it('should initialize with custom options', () => {
            const options = { width: 800, height: 300, chartType: 'volume' };
            baseChart = new BaseChart(mockContainer, options);
            
            expect(baseChart.options).toEqual(options);
        });

        it('should initialize state correctly', () => {
            baseChart = new BaseChart(mockContainer);
            
            expect(baseChart.state).toEqual({
                isLoading: false,
                isDataLoaded: false,
                isAligned: false,
                hasError: false,
                errorMessage: null
            });
        });

        it('should register itself in ChartRegistry', () => {
            baseChart = new BaseChart(mockContainer);
            
            expect(ChartRegistry.getChart(baseChart.id)).toBe(baseChart);
        });

        it('should extend EventEmitter', () => {
            baseChart = new BaseChart(mockContainer);
            
            expect(typeof baseChart.on).toBe('function');
            expect(typeof baseChart.emit).toBe('function');
            expect(typeof baseChart.off).toBe('function');
        });
    });

    describe('create()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
        });

        it('should create chart successfully', () => {
            const chart = baseChart.create();
            
            expect(chart).toBeDefined();
            expect(baseChart.chart).toBe(chart);
            expect(baseChart.state.hasError).toBe(false);
            expect(baseChart.state.errorMessage).toBeNull();
        });

        it('should use chart configuration', () => {
            const options = { chartType: 'volume' };
            baseChart.options = options;
            
            baseChart.create();
            
            expect(global.LightweightCharts.createChart).toHaveBeenCalledWith(
                mockContainer,
                expect.objectContaining({
                    height: expect.any(Number)
                })
            );
        });

        it('should emit created event', () => {
            const createdHandler = jest.fn();
            baseChart.on('created', createdHandler);
            
            baseChart.create();
            
            expect(createdHandler).toHaveBeenCalledWith(baseChart);
        });

        it('should call onCreated callback', () => {
            const onCreatedSpy = jest.spyOn(baseChart, 'onCreated');
            
            baseChart.create();
            
            expect(onCreatedSpy).toHaveBeenCalled();
        });

        it('should throw error if LightweightCharts is not available', () => {
            const originalLightweightCharts = global.window.LightweightCharts;
            global.window.LightweightCharts = undefined;
            
            expect(() => baseChart.create()).toThrow('LightweightCharts库未加载');
            expect(baseChart.state.hasError).toBe(true);
            expect(baseChart.state.errorMessage).toBe('LightweightCharts库未加载');
            
            // 恢复LightweightCharts
            global.window.LightweightCharts = originalLightweightCharts;
        });

        it('should throw error if container is invalid', () => {
            baseChart.container = null;
            
            expect(() => baseChart.create()).toThrow('图表容器无效');
        });

        it('should destroy existing chart before creating new one', () => {
            baseChart.create();
            const firstChart = baseChart.chart;
            const destroySpy = jest.spyOn(baseChart, 'destroy');
            
            baseChart.create();
            
            expect(destroySpy).toHaveBeenCalled();
        });
    });

    describe('destroy()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
            baseChart.create();
        });

        it('should remove all series', () => {
            // 模拟添加系列
            const mockSeries = { id: 'test-series' };
            baseChart.series.push(mockSeries);
            
            // 捕获chart方法调用
            const removeSeriesSpy = baseChart.chart.removeSeries;
            
            baseChart.destroy();
            
            expect(removeSeriesSpy).toHaveBeenCalledWith(mockSeries);
            expect(baseChart.series).toEqual([]);
        });

        it('should remove chart', () => {
            // 捕获chart方法调用
            const removeSpy = baseChart.chart.remove;
            
            baseChart.destroy();
            
            expect(removeSpy).toHaveBeenCalled();
            expect(baseChart.chart).toBeNull();
        });

        it('should emit destroyed event', () => {
            const destroyedHandler = jest.fn();
            baseChart.on('destroyed', destroyedHandler);
            
            baseChart.destroy();
            
            expect(destroyedHandler).toHaveBeenCalledWith(baseChart);
        });

        it('should unregister from ChartRegistry', () => {
            const chartId = baseChart.id;
            
            baseChart.destroy();
            
            expect(ChartRegistry.getChart(chartId)).toBeUndefined();
        });

        it('should clear event listeners', () => {
            baseChart.on('test', jest.fn());
            
            baseChart.destroy();
            
            expect(baseChart.events).toEqual({});
        });

        it('should handle missing chart gracefully', () => {
            baseChart.chart = null;
            
            expect(() => baseChart.destroy()).not.toThrow();
        });
    });

    describe('addSeries()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
            baseChart.create();
        });

        it('should add candlestick series', () => {
            const options = { upColor: '#26a69a', downColor: '#ef5350' };
            const series = baseChart.addSeries('candlestick', options);
            
            expect(baseChart.chart.addCandlestickSeries).toHaveBeenCalledWith(options);
            expect(series).toBeDefined();
            expect(baseChart.series).toContain(series);
        });

        it('should add line series', () => {
            const options = { color: '#2196f3', lineWidth: 2 };
            const series = baseChart.addSeries('line', options);
            
            expect(baseChart.chart.addLineSeries).toHaveBeenCalledWith(options);
            expect(series).toBeDefined();
            expect(baseChart.series).toContain(series);
        });

        it('should add histogram series', () => {
            const options = { color: '#26a69a' };
            const series = baseChart.addSeries('histogram', options);
            
            expect(baseChart.chart.addHistogramSeries).toHaveBeenCalledWith(options);
            expect(series).toBeDefined();
            expect(baseChart.series).toContain(series);
        });

        it('should emit seriesAdded event', () => {
            const seriesAddedHandler = jest.fn();
            baseChart.on('seriesAdded', seriesAddedHandler);
            
            const series = baseChart.addSeries('line');
            
            expect(seriesAddedHandler).toHaveBeenCalledWith({
                type: 'line',
                series,
                options: {}
            });
        });

        it('should return null if chart not created', () => {
            baseChart.chart = null;
            
            const series = baseChart.addSeries('line');
            
            expect(series).toBeNull();
        });

        it('should handle unknown series type', () => {
            const series = baseChart.addSeries('unknown');
            
            expect(series).toBeNull();
        });

        it('should handle series creation error', () => {
            baseChart.chart.addLineSeries.mockImplementation(() => {
                throw new Error('Series creation failed');
            });
            
            const errorHandler = jest.fn();
            baseChart.on('error', errorHandler);
            
            const series = baseChart.addSeries('line');
            
            expect(series).toBeNull();
            expect(errorHandler).toHaveBeenCalled();
        });
    });

    describe('setTimeRange()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
            baseChart.create();
            // 模拟有数据系列
            baseChart.series.push({ id: 'test-series' });
        });

        it('should set valid time range', () => {
            const timeRange = { from: '2023-01-01', to: '2023-12-31' };
            
            baseChart.setTimeRange(timeRange);
            
            expect(baseChart.chart.timeScale().setVisibleRange).toHaveBeenCalledWith({
                from: expect.any(Number),
                to: expect.any(Number)
            });
        });

        it('should emit timeRangeChanged event', () => {
            const timeRangeHandler = jest.fn();
            baseChart.on('timeRangeChanged', timeRangeHandler);
            const timeRange = { from: '2023-01-01', to: '2023-12-31' };
            
            baseChart.setTimeRange(timeRange);
            
            expect(timeRangeHandler).toHaveBeenCalledWith(timeRange);
        });

        it('should handle invalid time range', () => {
            const invalidRange = { from: '2023-12-31', to: '2023-01-01' };
            
            baseChart.setTimeRange(invalidRange);
            
            expect(baseChart.chart.timeScale().setVisibleRange).not.toHaveBeenCalled();
        });

        it('should return early if chart not created', () => {
            baseChart.chart = null;
            
            baseChart.setTimeRange({ from: '2023-01-01', to: '2023-12-31' });
            
            // Should not throw
            expect(true).toBe(true);
        });

        it('should retry if no data series available', () => {
            baseChart.series = [];
            baseChart.timeRangeRetryCount = 0;
            
            // Mock setTimeout to capture the call
            const originalSetTimeout = global.setTimeout;
            const setTimeoutSpy = jest.fn();
            global.setTimeout = setTimeoutSpy;
            
            baseChart.setTimeRange({ from: '2023-01-01', to: '2023-12-31' });
            
            // Verify retry logic was triggered
            expect(baseChart.timeRangeRetryCount).toBe(1);
            expect(setTimeoutSpy).toHaveBeenCalled();
            expect(baseChart.chart.timeScale().setVisibleRange).not.toHaveBeenCalled();
            
            // Restore original setTimeout
            global.setTimeout = originalSetTimeout;
        });
    });

    describe('getTimeRange()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
            baseChart.create();
        });

        it('should return time range from chart', () => {
            const mockRange = { from: 1672531200, to: 1704067199 };
            baseChart.chart.timeScale().getVisibleRange.mockReturnValue(mockRange);
            
            const result = baseChart.getTimeRange();
            
            expect(result).toEqual(mockRange);
        });

        it('should return null if chart not created', () => {
            baseChart.chart = null;
            
            const result = baseChart.getTimeRange();
            
            expect(result).toBeNull();
        });

        it('should return null for invalid range', () => {
            const invalidRange = { from: NaN, to: NaN };
            baseChart.chart.timeScale().getVisibleRange.mockReturnValue(invalidRange);
            
            const result = baseChart.getTimeRange();
            
            expect(result).toBeNull();
        });
    });

    describe('subscribeTimeRangeChange()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
            baseChart.create();
        });

        it('should subscribe to time range changes', () => {
            const handler = jest.fn();
            
            baseChart.subscribeTimeRangeChange(handler);
            
            expect(baseChart.chart.timeScale().subscribeVisibleTimeRangeChange).toHaveBeenCalledWith(handler);
        });

        it('should handle missing chart', () => {
            baseChart.chart = null;
            
            expect(() => baseChart.subscribeTimeRangeChange(jest.fn())).not.toThrow();
        });
    });

    describe('subscribeCrosshairMove()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
            baseChart.create();
        });

        it('should subscribe to crosshair move', () => {
            const handler = jest.fn();
            
            baseChart.subscribeCrosshairMove(handler);
            
            expect(baseChart.chart.subscribeCrosshairMove).toHaveBeenCalledWith(handler);
        });

        it('should handle missing chart', () => {
            baseChart.chart = null;
            
            expect(() => baseChart.subscribeCrosshairMove(jest.fn())).not.toThrow();
        });
    });

    describe('fitContentToData()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
            baseChart.create();
        });

        it('should fit content to data', () => {
            const contentFittedHandler = jest.fn();
            baseChart.on('contentFitted', contentFittedHandler);
            
            baseChart.fitContentToData();
            
            expect(baseChart.chart.timeScale().fitContent).toHaveBeenCalled();
            expect(contentFittedHandler).toHaveBeenCalled();
        });

        it('should handle missing chart', () => {
            baseChart.chart = null;
            
            expect(() => baseChart.fitContentToData()).not.toThrow();
        });
    });

    describe('setState()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
        });

        it('should update state', () => {
            const newState = { isLoading: true, isDataLoaded: true };
            
            baseChart.setState(newState);
            
            expect(baseChart.state.isLoading).toBe(true);
            expect(baseChart.state.isDataLoaded).toBe(true);
            expect(baseChart.state.hasError).toBe(false); // unchanged
        });

        it('should emit stateChange event', () => {
            const stateChangeHandler = jest.fn();
            baseChart.on('stateChange', stateChangeHandler);
            const newState = { isLoading: true };
            
            baseChart.setState(newState);
            
            expect(stateChangeHandler).toHaveBeenCalledWith({
                oldState: expect.objectContaining({ isLoading: false }),
                newState: expect.objectContaining({ isLoading: true })
            });
        });
    });

    describe('getState()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
        });

        it('should return copy of state', () => {
            const state = baseChart.getState();
            
            expect(state).toEqual(baseChart.state);
            expect(state).not.toBe(baseChart.state); // should be a copy
        });
    });

    describe('getSourceName()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
        });

        it('should return lowercase class name', () => {
            const sourceName = baseChart.getSourceName();
            
            expect(sourceName).toBe('basechart');
        });
    });

    describe('getInfo()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
        });

        it('should return chart information', () => {
            baseChart.create();
            baseChart.series.push({ id: 'test' });
            
            const info = baseChart.getInfo();
            
            expect(info).toEqual({
                id: baseChart.id,
                type: 'basechart',
                state: baseChart.state,
                seriesCount: 1,
                hasChart: true
            });
        });
    });

    describe('onCreated()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
        });

        it('should be called during chart creation', () => {
            const onCreatedSpy = jest.spyOn(baseChart, 'onCreated');
            
            baseChart.create();
            
            expect(onCreatedSpy).toHaveBeenCalled();
        });

        it('should be overridable by subclasses', () => {
            baseChart.onCreated = jest.fn();
            
            baseChart.create();
            
            expect(baseChart.onCreated).toHaveBeenCalled();
        });
    });
}); 
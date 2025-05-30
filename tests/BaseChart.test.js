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
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
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
            
            // Mock ChartConfig.getChartConfig to return specific config
            const mockChartConfig = {
                width: 1000,
                height: 400,
                layout: { backgroundColor: '#ffffff' },
                grid: { vertLines: { visible: false } }
            };
            const getChartConfigSpy = jest.spyOn(ChartConfig, 'getChartConfig')
                .mockReturnValue(mockChartConfig);
            
            baseChart.create();
            
            expect(getChartConfigSpy).toHaveBeenCalledWith('volume');
            expect(global.LightweightCharts.createChart).toHaveBeenCalledWith(
                mockContainer,
                expect.objectContaining({
                    width: 1000,
                    height: 400,
                    layout: { backgroundColor: '#ffffff' },
                    grid: { vertLines: { visible: false } }
                })
            );
            
            getChartConfigSpy.mockRestore();
        });

        it('should merge custom options with chart config', () => {
            baseChart.options = { width: 800, chartType: 'main' };
            
            // Mock ChartConfig.getChartConfig
            const mockChartConfig = { height: 400, layout: { backgroundColor: '#ffffff' } };
            const getChartConfigSpy = jest.spyOn(ChartConfig, 'getChartConfig')
                .mockReturnValue(mockChartConfig);
            
            baseChart.create();
            
            expect(global.LightweightCharts.createChart).toHaveBeenCalledWith(
                mockContainer,
                expect.objectContaining({
                    width: 800,  // custom option should override
                    height: 400, // from chart config
                    layout: { backgroundColor: '#ffffff' }
                })
            );
            
            getChartConfigSpy.mockRestore();
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
            
            const mockSeries = {
                setData: jest.fn(),
                applyOptions: jest.fn(),
                priceFormatter: jest.fn()
            };
            baseChart.chart.addCandlestickSeries.mockReturnValue(mockSeries);
            
            const series = baseChart.addSeries('candlestick', options);
            
            expect(baseChart.chart.addCandlestickSeries).toHaveBeenCalledWith(options);
            expect(series).toBe(mockSeries);
            expect(baseChart.series).toContain(series);
            
            // BaseChart doesn't call applyOptions directly - it's handled by LightweightCharts
            // The options are passed to addCandlestickSeries which handles them internally
        });

        it('should add line series with correct options', () => {
            const options = { color: '#2196f3', lineWidth: 2 };
            
            const mockSeries = {
                setData: jest.fn(),
                applyOptions: jest.fn()
            };
            baseChart.chart.addLineSeries.mockReturnValue(mockSeries);
            
            const series = baseChart.addSeries('line', options);
            
            expect(baseChart.chart.addLineSeries).toHaveBeenCalledWith(options);
            expect(series).toBe(mockSeries);
            expect(baseChart.series).toContain(series);
        });

        it('should add histogram series with correct options', () => {
            const options = { color: '#26a69a', priceFormat: { type: 'volume' } };
            
            const mockSeries = {
                setData: jest.fn(),
                applyOptions: jest.fn()
            };
            baseChart.chart.addHistogramSeries.mockReturnValue(mockSeries);
            
            const series = baseChart.addSeries('histogram', options);
            
            expect(baseChart.chart.addHistogramSeries).toHaveBeenCalledWith(options);
            expect(series).toBe(mockSeries);
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

        it('should handle series creation with specific errors', () => {
            baseChart.chart.addLineSeries.mockImplementation(() => {
                throw new Error('Insufficient memory for series creation');
            });
            
            const errorHandler = jest.fn();
            baseChart.on('error', errorHandler);
            
            const series = baseChart.addSeries('line');
            
            expect(series).toBeNull();
            expect(errorHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Insufficient memory for series creation'
                })
            );
        });

        it('should handle invalid series options gracefully', () => {
            const invalidOptions = { color: null, lineWidth: -1 };
            
            const series = baseChart.addSeries('line', invalidOptions);
            
            expect(baseChart.chart.addLineSeries).toHaveBeenCalledWith(invalidOptions);
            expect(series).toBeDefined();
        });

        it('should handle series creation when chart is destroyed during process', () => {
            // Simulate chart being destroyed during series creation
            baseChart.chart.addLineSeries.mockImplementation(() => {
                baseChart.chart = null;
                return { setData: jest.fn(), applyOptions: jest.fn() };
            });
            
            const series = baseChart.addSeries('line');
            
            expect(series).toBeDefined();
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
            
            // Mock ChartUtils.convertTimeToNumber
            const convertTimeToNumberSpy = jest.spyOn(ChartUtils, 'convertTimeToNumber')
                .mockImplementation((time) => {
                    if (time === '2023-01-01') return 1672531200; // Unix timestamp
                    if (time === '2023-12-31') return 1704067199;
                    return 0;
                });
            
            baseChart.setTimeRange(timeRange);
            
            expect(convertTimeToNumberSpy).toHaveBeenCalledWith('2023-01-01');
            expect(convertTimeToNumberSpy).toHaveBeenCalledWith('2023-12-31');
            expect(baseChart.chart.timeScale().setVisibleRange).toHaveBeenCalledWith({
                from: 1672531200,
                to: 1704067199
            });
            
            convertTimeToNumberSpy.mockRestore();
        });

        it('should handle time conversion failure', () => {
            const timeRange = { from: 'invalid-date', to: '2023-12-31' };
            
            // Mock ChartUtils.convertTimeToNumber to return NaN
            const convertTimeToNumberSpy = jest.spyOn(ChartUtils, 'convertTimeToNumber')
                .mockImplementation((time) => {
                    if (time === 'invalid-date') return NaN;
                    if (time === '2023-12-31') return 1704067199;
                    return 0;
                });
            
            baseChart.setTimeRange(timeRange);
            
            expect(convertTimeToNumberSpy).toHaveBeenCalledWith('invalid-date');
            expect(baseChart.chart.timeScale().setVisibleRange).not.toHaveBeenCalled();
            
            convertTimeToNumberSpy.mockRestore();
        });

        it('should validate time range before conversion', () => {
            const invalidRange = { from: '2023-12-31', to: '2023-01-01' }; // reversed range
            
            // Mock ChartUtils.isValidTimeRange to return false
            const isValidTimeRangeSpy = jest.spyOn(ChartUtils, 'isValidTimeRange')
                .mockReturnValue(false);
            
            baseChart.setTimeRange(invalidRange);
            
            expect(isValidTimeRangeSpy).toHaveBeenCalledWith(invalidRange);
            expect(baseChart.chart.timeScale().setVisibleRange).not.toHaveBeenCalled();
            
            isValidTimeRangeSpy.mockRestore();
        });

        it('should emit timeRangeChanged event', () => {
            const timeRangeHandler = jest.fn();
            baseChart.on('timeRangeChanged', timeRangeHandler);
            const timeRange = { from: '2023-01-01', to: '2023-12-31' };
            
            baseChart.setTimeRange(timeRange);
            
            expect(timeRangeHandler).toHaveBeenCalledWith(timeRange);
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
            
            expect(baseChart.chart.timeScale().getVisibleRange).toHaveBeenCalled();
            expect(result).toEqual(mockRange);
        });

        it('should return null if chart not created', () => {
            baseChart.chart = null;
            
            const result = baseChart.getTimeRange();
            
            expect(result).toBeNull();
        });

        it('should return null for invalid range with NaN values', () => {
            const invalidRange = { from: NaN, to: NaN };
            baseChart.chart.timeScale().getVisibleRange.mockReturnValue(invalidRange);
            
            const result = baseChart.getTimeRange();
            
            expect(result).toBeNull();
        });

        it('should return null for invalid range with negative values', () => {
            const invalidRange = { from: -1, to: -1 };
            baseChart.chart.timeScale().getVisibleRange.mockReturnValue(invalidRange);
            
            const result = baseChart.getTimeRange();
            
            expect(result).toBeNull();
        });

        it('should handle boundary timestamp values', () => {
            const boundaryRange = { from: 0, to: 2147483647 }; // Unix timestamp boundaries
            baseChart.chart.timeScale().getVisibleRange.mockReturnValue(boundaryRange);
            
            const result = baseChart.getTimeRange();
            
            expect(result).toEqual(boundaryRange);
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

        it('should trigger handler when time range changes', () => {
            const handler = jest.fn();
            let registeredHandler;
            
            // Capture the handler passed to the subscription
            baseChart.chart.timeScale().subscribeVisibleTimeRangeChange.mockImplementation((h) => {
                registeredHandler = h;
            });
            
            baseChart.subscribeTimeRangeChange(handler);
            
            // Simulate time range change event
            const mockTimeRange = { from: 1672531200, to: 1704067199 };
            registeredHandler(mockTimeRange);
            
            expect(handler).toHaveBeenCalledWith(mockTimeRange);
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

        it('should trigger handler when crosshair moves', () => {
            const handler = jest.fn();
            let registeredHandler;
            
            // Capture the handler passed to the subscription
            baseChart.chart.subscribeCrosshairMove.mockImplementation((h) => {
                registeredHandler = h;
            });
            
            baseChart.subscribeCrosshairMove(handler);
            
            // Simulate crosshair move event
            const mockParam = {
                time: 1672531200,
                point: { x: 100, y: 200 },
                seriesData: new Map()
            };
            registeredHandler(mockParam);
            
            expect(handler).toHaveBeenCalledWith(mockParam);
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

        it('should handle fitting content when no data series exist', () => {
            baseChart.series = []; // No series
            const contentFittedHandler = jest.fn();
            baseChart.on('contentFitted', contentFittedHandler);
            
            baseChart.fitContentToData();
            
            expect(baseChart.chart.timeScale().fitContent).toHaveBeenCalled();
            expect(contentFittedHandler).toHaveBeenCalled();
        });

        it('should handle fitContent throwing error', () => {
            baseChart.chart.timeScale().fitContent.mockImplementation(() => {
                throw new Error('No data to fit');
            });
            
            const errorHandler = jest.fn();
            baseChart.on('error', errorHandler);
            
            expect(() => baseChart.fitContentToData()).not.toThrow();
            // Error should be caught and handled gracefully
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

    describe('setupNoWhitespaceMode()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
            baseChart.create();
        });

        it('should configure time scale with unified options', () => {
            const mockUnifiedConfig = {
                rightOffset: 12,
                barSpacing: 6,
                fixLeftEdge: false,
                fixRightEdge: false,
                lockVisibleTimeRangeOnResize: false
            };
            
            // Mock ChartConfig.getUnifiedTimeScale
            const getUnifiedTimeScaleSpy = jest.spyOn(ChartConfig, 'getUnifiedTimeScale')
                .mockReturnValue(mockUnifiedConfig);
            
            baseChart.setupNoWhitespaceMode();
            
            expect(getUnifiedTimeScaleSpy).toHaveBeenCalled();
            expect(baseChart.chart.timeScale().applyOptions).toHaveBeenCalledWith(mockUnifiedConfig);
            
            getUnifiedTimeScaleSpy.mockRestore();
        });

        it('should handle missing chart gracefully', () => {
            baseChart.chart = null;
            
            expect(() => baseChart.setupNoWhitespaceMode()).not.toThrow();
        });
    });

    describe('checkAndFixNegativeLogicalRange()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
            baseChart.create();
        });

        it('should detect and attempt to fix negative logical range', () => {
            const beforeRange = { from: 10, to: 20 };
            const afterRange = { from: -5, to: 5 }; // negative range
            const seriesType = 'candlestick';
            
            const fitContentSpy = baseChart.chart.timeScale().fitContent;
            
            baseChart.checkAndFixNegativeLogicalRange(beforeRange, afterRange, seriesType);
            
            // Should call fitContent to try to fix the range
            expect(fitContentSpy).toHaveBeenCalled();
        });

        it('should not attempt fix for valid logical range', () => {
            const beforeRange = { from: 10, to: 20 };
            const afterRange = { from: 15, to: 25 }; // valid range
            const seriesType = 'candlestick';
            
            const fitContentSpy = baseChart.chart.timeScale().fitContent;
            fitContentSpy.mockClear();
            
            baseChart.checkAndFixNegativeLogicalRange(beforeRange, afterRange, seriesType);
            
            // Should not call fitContent for valid range
            expect(fitContentSpy).not.toHaveBeenCalled();
        });

        it('should handle null ranges gracefully', () => {
            expect(() => {
                baseChart.checkAndFixNegativeLogicalRange(null, null, 'candlestick');
            }).not.toThrow();
        });

        it('should handle missing chart gracefully', () => {
            baseChart.chart = null;
            
            expect(() => {
                baseChart.checkAndFixNegativeLogicalRange({ from: -5, to: 5 }, { from: -5, to: 5 }, 'candlestick');
            }).not.toThrow();
        });
    });

    describe('disableIndependentInteractions()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
            baseChart.create();
        });

        it('should disable chart interactions by adding event listeners', () => {
            const addEventListenerSpy = mockContainer.addEventListener;
            
            baseChart.disableIndependentInteractions();
            
            // Should add event listeners to block interactions
            expect(addEventListenerSpy).toHaveBeenCalledWith('wheel', expect.any(Function), { passive: false, capture: true });
            expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), { passive: false, capture: true });
            expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), { passive: false, capture: true });
            expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: false, capture: true });
            expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false, capture: true });
            expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function), { passive: false, capture: true });
            
            // Should also modify container styles
            expect(mockContainer.style.userSelect).toBe('none');
            expect(mockContainer.style.pointerEvents).toBe('none');
        });

        it('should add event listeners regardless of chart type', () => {
            baseChart.isPrimaryChart = true;
            
            const addEventListenerSpy = mockContainer.addEventListener;
            addEventListenerSpy.mockClear();
            
            baseChart.disableIndependentInteractions();
            
            // Should still add event listeners even for primary chart
            expect(addEventListenerSpy).toHaveBeenCalled();
            expect(addEventListenerSpy.mock.calls.length).toBeGreaterThan(0);
        });

        it('should handle missing container gracefully', () => {
            baseChart.container = null;
            
            expect(() => baseChart.disableIndependentInteractions()).not.toThrow();
        });
    });

    describe('manuallyFixLogicalRange()', () => {
        beforeEach(() => {
            baseChart = new BaseChart(mockContainer);
            baseChart.create();
        });

        it('should fix negative logical range', () => {
            const problematicRange = { from: -10, to: 5 };
            const rangeWidth = problematicRange.to - problematicRange.from; // 15
            const expectedTo = Math.max(rangeWidth, 50); // Math.max(15, 50) = 50
            
            baseChart.manuallyFixLogicalRange(problematicRange);
            
            expect(baseChart.chart.timeScale().setVisibleLogicalRange).toHaveBeenCalledWith({
                from: 0,
                to: expectedTo // 50, not 15
            });
        });

        it('should handle missing chart gracefully', () => {
            baseChart.chart = null;
            const problematicRange = { from: -10, to: 5 };
            
            expect(() => baseChart.manuallyFixLogicalRange(problematicRange)).not.toThrow();
        });
    });
}); 
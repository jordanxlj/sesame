// SharedTimeScale 单元测试
const { describe, it, expect, jest, beforeEach } = require('@jest/globals');
const { SharedTimeScale } = require('../static/lightweight-charts.js');

describe('SharedTimeScale', () => {
    let sharedTimeScale;
    let mockPrimaryChart;
    let mockSecondaryChart;
    let mockTimeScale;

    beforeEach(() => {
        // Mock timeScale
        mockTimeScale = {
            subscribeVisibleTimeRangeChange: jest.fn(),
            subscribeVisibleLogicalRangeChange: jest.fn(),
            getVisibleRange: jest.fn().mockReturnValue({ from: 0, to: 100 }),
            getVisibleLogicalRange: jest.fn().mockReturnValue({ from: 0, to: 50 }),
            setVisibleRange: jest.fn(),
            setVisibleLogicalRange: jest.fn(),
            applyOptions: jest.fn(),
            options: jest.fn().mockReturnValue({ 
                barSpacing: 6, 
                rightOffset: 12 
            })
        };

        // Mock primary chart
        mockPrimaryChart = {
            chart: {
                timeScale: jest.fn().mockReturnValue(mockTimeScale)
            }
        };

        // Mock secondary chart
        mockSecondaryChart = {
            chart: {
                timeScale: jest.fn().mockReturnValue({
                    setVisibleRange: jest.fn(),
                    setVisibleLogicalRange: jest.fn(),
                    applyOptions: jest.fn()
                })
            }
        };

        sharedTimeScale = new SharedTimeScale();
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            expect(sharedTimeScale.currentDomain).toBeNull();
            expect(sharedTimeScale.currentLogicalRange).toBeNull();
            expect(sharedTimeScale.currentBarSpacing).toBeNull();
            expect(sharedTimeScale.currentRightOffset).toBe(12);
            expect(sharedTimeScale.charts.size).toBe(0);
            expect(sharedTimeScale.isUpdating).toBe(false);
        });

        it('should be an instance of EventEmitter', () => {
            expect(sharedTimeScale.events).toBeDefined();
            expect(typeof sharedTimeScale.on).toBe('function');
            expect(typeof sharedTimeScale.emit).toBe('function');
        });
    });

    describe('registerChart()', () => {
        it('should register primary chart', () => {
            sharedTimeScale.registerChart('primary', mockPrimaryChart, true);
            
            expect(sharedTimeScale.charts.has('primary')).toBe(true);
            const chartInfo = sharedTimeScale.charts.get('primary');
            expect(chartInfo.instance).toBe(mockPrimaryChart);
            expect(chartInfo.isPrimary).toBe(true);
        });

        it('should register secondary chart', () => {
            sharedTimeScale.registerChart('secondary', mockSecondaryChart, false);
            
            expect(sharedTimeScale.charts.has('secondary')).toBe(true);
            const chartInfo = sharedTimeScale.charts.get('secondary');
            expect(chartInfo.instance).toBe(mockSecondaryChart);
            expect(chartInfo.isPrimary).toBe(false);
        });

        it('should setup listeners for primary chart', () => {
            sharedTimeScale.registerChart('primary', mockPrimaryChart, true);
            
            expect(mockTimeScale.subscribeVisibleTimeRangeChange).toHaveBeenCalled();
            expect(mockTimeScale.subscribeVisibleLogicalRangeChange).toHaveBeenCalled();
        });

        it('should not setup listeners for secondary chart', () => {
            sharedTimeScale.registerChart('secondary', mockSecondaryChart, false);
            
            expect(mockSecondaryChart.chart.timeScale().subscribeVisibleTimeRangeChange).toBeUndefined();
        });
    });

    describe('setupPrimaryChartListeners()', () => {
        it('should setup time range change listener', () => {
            sharedTimeScale.setupPrimaryChartListeners(mockPrimaryChart.chart);
            
            expect(mockTimeScale.subscribeVisibleTimeRangeChange).toHaveBeenCalled();
            
            // Simulate time range change
            const timeRangeCallback = mockTimeScale.subscribeVisibleTimeRangeChange.mock.calls[0][0];
            const newTimeRange = { from: 10, to: 110 };
            
            const updateDomainSpy = jest.spyOn(sharedTimeScale, 'updateDomain');
            timeRangeCallback(newTimeRange);
            
            expect(updateDomainSpy).toHaveBeenCalledWith(newTimeRange);
        });

        it('should setup logical range change listener', () => {
            sharedTimeScale.setupPrimaryChartListeners(mockPrimaryChart.chart);
            
            expect(mockTimeScale.subscribeVisibleLogicalRangeChange).toHaveBeenCalled();
            
            // Simulate logical range change
            const logicalRangeCallback = mockTimeScale.subscribeVisibleLogicalRangeChange.mock.calls[0][0];
            const newLogicalRange = { from: 5, to: 55 };
            
            const updateLogicalRangeSpy = jest.spyOn(sharedTimeScale, 'updateLogicalRange');
            logicalRangeCallback(newLogicalRange);
            
            expect(updateLogicalRangeSpy).toHaveBeenCalledWith(newLogicalRange);
        });

        it('should not trigger updates when isUpdating is true', () => {
            sharedTimeScale.isUpdating = true;
            sharedTimeScale.setupPrimaryChartListeners(mockPrimaryChart.chart);
            
            const timeRangeCallback = mockTimeScale.subscribeVisibleTimeRangeChange.mock.calls[0][0];
            const updateDomainSpy = jest.spyOn(sharedTimeScale, 'updateDomain');
            
            timeRangeCallback({ from: 10, to: 110 });
            expect(updateDomainSpy).not.toHaveBeenCalled();
        });
    });

    describe('updateDomain()', () => {
        it('should update current domain and sync charts', () => {
            const newDomain = { from: 10, to: 110 };
            const syncAllChartsSpy = jest.spyOn(sharedTimeScale, 'syncAllCharts').mockImplementation();
            
            sharedTimeScale.updateDomain(newDomain);
            
            expect(sharedTimeScale.currentDomain).toBe(newDomain);
            expect(syncAllChartsSpy).toHaveBeenCalled();
        });
    });

    describe('updateLogicalRange()', () => {
        it('should update current logical range and sync charts', () => {
            const newLogicalRange = { from: 5, to: 55 };
            const syncAllChartsSpy = jest.spyOn(sharedTimeScale, 'syncAllCharts').mockImplementation();
            
            sharedTimeScale.updateLogicalRange(newLogicalRange);
            
            expect(sharedTimeScale.currentLogicalRange).toBe(newLogicalRange);
            expect(syncAllChartsSpy).toHaveBeenCalled();
        });
    });

    describe('syncAllCharts()', () => {
        beforeEach(() => {
            sharedTimeScale.registerChart('primary', mockPrimaryChart, true);
            sharedTimeScale.registerChart('secondary', mockSecondaryChart, false);
            
            sharedTimeScale.currentDomain = { from: 10, to: 110 };
            sharedTimeScale.currentLogicalRange = { from: 5, to: 55 };
            sharedTimeScale.currentBarSpacing = 8;
            sharedTimeScale.currentRightOffset = 16;
        });

        it('should sync all secondary charts', () => {
            sharedTimeScale.syncAllCharts();
            
            const secondaryTimeScale = mockSecondaryChart.chart.timeScale();
            expect(secondaryTimeScale.setVisibleRange).toHaveBeenCalledWith({ from: 10, to: 110 });
            expect(secondaryTimeScale.setVisibleLogicalRange).toHaveBeenCalledWith({ from: 5, to: 55 });
            expect(secondaryTimeScale.applyOptions).toHaveBeenCalledWith({
                barSpacing: 8,
                rightOffset: 16
            });
        });

        it('should not sync primary chart', () => {
            sharedTimeScale.syncAllCharts();
            
            expect(mockTimeScale.setVisibleRange).not.toHaveBeenCalled();
            expect(mockTimeScale.setVisibleLogicalRange).not.toHaveBeenCalled();
        });

        it('should handle errors gracefully', () => {
            const errorSecondaryChart = {
                chart: {
                    timeScale: jest.fn().mockReturnValue({
                        setVisibleRange: jest.fn(() => { throw new Error('Test error'); }),
                        setVisibleLogicalRange: jest.fn(),
                        applyOptions: jest.fn()
                    })
                }
            };
            
            sharedTimeScale.registerChart('error', errorSecondaryChart, false);
            
            expect(() => sharedTimeScale.syncAllCharts()).not.toThrow();
        });

        it('should skip if isUpdating is true', () => {
            sharedTimeScale.isUpdating = true;
            sharedTimeScale.syncAllCharts();
            
            const secondaryTimeScale = mockSecondaryChart.chart.timeScale();
            expect(secondaryTimeScale.setVisibleRange).not.toHaveBeenCalled();
        });

        it('should set and reset isUpdating flag', () => {
            expect(sharedTimeScale.isUpdating).toBe(false);
            
            sharedTimeScale.syncAllCharts();
            
            expect(sharedTimeScale.isUpdating).toBe(false); // Reset after completion
        });
    });

    describe('unregisterChart()', () => {
        it('should remove chart from registry', () => {
            sharedTimeScale.registerChart('test', mockSecondaryChart, false);
            expect(sharedTimeScale.charts.has('test')).toBe(true);
            
            sharedTimeScale.unregisterChart('test');
            expect(sharedTimeScale.charts.has('test')).toBe(false);
        });

        it('should handle unregistering non-existent chart', () => {
            expect(() => sharedTimeScale.unregisterChart('nonexistent')).not.toThrow();
        });
    });

    describe('forceSync()', () => {
        beforeEach(() => {
            sharedTimeScale.registerChart('primary', mockPrimaryChart, true);
            sharedTimeScale.registerChart('secondary', mockSecondaryChart, false);
        });

        it('should get primary chart state and sync all charts', () => {
            const syncAllChartsSpy = jest.spyOn(sharedTimeScale, 'syncAllCharts').mockImplementation();
            
            sharedTimeScale.forceSync();
            
            expect(mockTimeScale.getVisibleRange).toHaveBeenCalled();
            expect(mockTimeScale.getVisibleLogicalRange).toHaveBeenCalled();
            expect(mockTimeScale.options).toHaveBeenCalled();
            expect(syncAllChartsSpy).toHaveBeenCalled();
        });

        it('should update current state from primary chart', () => {
            mockTimeScale.getVisibleRange.mockReturnValue({ from: 20, to: 120 });
            mockTimeScale.getVisibleLogicalRange.mockReturnValue({ from: 10, to: 60 });
            mockTimeScale.options.mockReturnValue({ barSpacing: 8, rightOffset: 16 });
            
            sharedTimeScale.forceSync();
            
            expect(sharedTimeScale.currentDomain).toEqual({ from: 20, to: 120 });
            expect(sharedTimeScale.currentLogicalRange).toEqual({ from: 10, to: 60 });
            expect(sharedTimeScale.currentBarSpacing).toBe(8);
            expect(sharedTimeScale.currentRightOffset).toBe(16);
        });

        it('should handle case when no primary chart exists', () => {
            sharedTimeScale.unregisterChart('primary');
            
            expect(() => sharedTimeScale.forceSync()).not.toThrow();
        });
    });

    describe('getPrimaryChart()', () => {
        it('should return primary chart instance', () => {
            sharedTimeScale.registerChart('primary', mockPrimaryChart, true);
            sharedTimeScale.registerChart('secondary', mockSecondaryChart, false);
            
            const primaryChart = sharedTimeScale.getPrimaryChart();
            expect(primaryChart).toBe(mockPrimaryChart);
        });

        it('should return null when no primary chart exists', () => {
            sharedTimeScale.registerChart('secondary', mockSecondaryChart, false);
            
            const primaryChart = sharedTimeScale.getPrimaryChart();
            expect(primaryChart).toBeNull();
        });
    });
}); 
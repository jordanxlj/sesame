// ChartUtils 单元测试
const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const { ChartUtils } = require('../static/lightweight-charts.js');

describe('ChartUtils', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('debounce()', () => {
        it('should delay function execution', () => {
            const func = jest.fn();
            const debouncedFunc = ChartUtils.debounce(func, 100);
            
            debouncedFunc('arg1');
            expect(func).not.toHaveBeenCalled();
            
            jest.advanceTimersByTime(50);
            expect(func).not.toHaveBeenCalled();
            
            jest.advanceTimersByTime(50);
            expect(func).toHaveBeenCalledWith('arg1');
            expect(func).toHaveBeenCalledTimes(1);
        });

        it('should reset timer on multiple calls', () => {
            const func = jest.fn();
            const debouncedFunc = ChartUtils.debounce(func, 100);
            
            debouncedFunc('arg1');
            jest.advanceTimersByTime(50);
            debouncedFunc('arg2');
            jest.advanceTimersByTime(50);
            expect(func).not.toHaveBeenCalled();
            
            jest.advanceTimersByTime(50);
            expect(func).toHaveBeenCalledWith('arg2');
            expect(func).toHaveBeenCalledTimes(1);
        });
    });

    describe('throttle()', () => {
        it('should limit function calls', () => {
            const func = jest.fn();
            const throttledFunc = ChartUtils.throttle(func, 100);
            
            throttledFunc('arg1');
            expect(func).toHaveBeenCalledWith('arg1');
            
            throttledFunc('arg2');
            expect(func).toHaveBeenCalledTimes(1);
            
            jest.advanceTimersByTime(100);
            throttledFunc('arg3');
            expect(func).toHaveBeenCalledWith('arg3');
            expect(func).toHaveBeenCalledTimes(2);
        });
    });

    describe('convertTimeToNumber()', () => {
        it('should convert date string to timestamp', () => {
            const result = ChartUtils.convertTimeToNumber('2023-01-01');
            const expected = new Date('2023-01-01').getTime() / 1000;
            expect(result).toBe(expected);
        });

        it('should return number as is', () => {
            const timestamp = 1672531200;
            const result = ChartUtils.convertTimeToNumber(timestamp);
            expect(result).toBe(timestamp);
        });

        it('should convert Date object to timestamp', () => {
            const date = new Date('2023-01-01');
            const result = ChartUtils.convertTimeToNumber(date);
            const expected = date.getTime() / 1000;
            expect(result).toBe(expected);
        });

        it('should return null for invalid input', () => {
            expect(ChartUtils.convertTimeToNumber(null)).toBeNaN();
            expect(ChartUtils.convertTimeToNumber(undefined)).toBeNaN();
            expect(ChartUtils.convertTimeToNumber('invalid')).toBeNaN();
        });
    });

    describe('calculateTimeDiff()', () => {
        it('should calculate time difference', () => {
            const range1 = { from: '2023-01-01', to: '2023-01-03' };
            const range2 = { from: '2023-01-02', to: '2023-01-04' };
            const diff = ChartUtils.calculateTimeDiff(range1, range2);
            expect(diff).toBeGreaterThan(0);
        });

        it('should return 0 for identical ranges', () => {
            const range = { from: '2023-01-01', to: '2023-01-02' };
            const diff = ChartUtils.calculateTimeDiff(range, range);
            expect(diff).toBe(0);
        });

        it('should handle null ranges', () => {
            const range = { from: '2023-01-01', to: '2023-01-02' };
            expect(() => ChartUtils.calculateTimeDiff(null, range)).toThrow();
            expect(() => ChartUtils.calculateTimeDiff(range, null)).toThrow();
        });
    });

    describe('filterValidData()', () => {
        it('should filter out invalid OHLC data', () => {
            const data = [
                { time: '2023-01-01', open: 100, high: 110, low: 90, close: 105 },
                { time: '2023-01-02', open: null, high: 110, low: 90, close: 105 },
                { time: '2023-01-03', open: 100, high: null, low: 90, close: 105 },
                { time: '2023-01-04', open: 100, high: 110, low: 90, close: 105 }
            ];
            
            const filtered = ChartUtils.filterValidData(data);
            expect(filtered).toHaveLength(2);
            expect(filtered[0].time).toBe('2023-01-01');
            expect(filtered[1].time).toBe('2023-01-04');
        });

        it('should filter out invalid value data', () => {
            const data = [
                { time: '2023-01-01', value: 100 },
                { time: '2023-01-02', value: null },
                { time: '2023-01-03', value: 150 }
            ];
            
            const filtered = ChartUtils.filterValidData(data);
            expect(filtered).toHaveLength(2);
            expect(filtered[0].time).toBe('2023-01-01');
            expect(filtered[1].time).toBe('2023-01-03');
        });

        it('should filter out data without time', () => {
            const data = [
                { time: '2023-01-01', value: 100 },
                { value: 150 },
                { time: '2023-01-03', value: 200 }
            ];
            
            const filtered = ChartUtils.filterValidData(data);
            expect(filtered).toHaveLength(2);
            expect(filtered[0].time).toBe('2023-01-01');
            expect(filtered[1].time).toBe('2023-01-03');
        });
    });

    describe('isValidTimeRange()', () => {
        it('should validate correct time range', () => {
            const range = { from: '2023-01-01', to: '2023-01-02' };
            expect(ChartUtils.isValidTimeRange(range)).toBe(true);
        });

        it('should reject invalid time range', () => {
            const range = { from: '2023-01-02', to: '2023-01-01' };
            expect(ChartUtils.isValidTimeRange(range)).toBe(false);
        });

        it('should reject null or undefined range', () => {
            expect(ChartUtils.isValidTimeRange(null)).toBe(false);
            expect(ChartUtils.isValidTimeRange(undefined)).toBe(false);
            expect(ChartUtils.isValidTimeRange({})).toBe(false);
        });

        it('should reject range without from or to', () => {
            expect(ChartUtils.isValidTimeRange({ from: '2023-01-01' })).toBe(false);
            expect(ChartUtils.isValidTimeRange({ to: '2023-01-02' })).toBe(false);
        });
    });

    describe('generateId()', () => {
        it('should generate unique IDs', () => {
            const id1 = ChartUtils.generateId();
            const id2 = ChartUtils.generateId();
            expect(id1).not.toBe(id2);
        });

        it('should use provided prefix', () => {
            const id = ChartUtils.generateId('test');
            expect(id).toMatch(/^test_\d+_\w+$/);
        });

        it('should use default prefix', () => {
            const id = ChartUtils.generateId();
            expect(id).toMatch(/^chart_\d+_\w+$/);
        });
    });

    describe('processVolumeData()', () => {
        it('should process OHLC data to volume data', () => {
            const ohlcData = [
                { time: '2023-01-01', open: 100, high: 110, low: 90, close: 105, volume: 1000 },
                { time: '2023-01-02', open: 105, high: 115, low: 95, close: 110, volume: 1500 }
            ];
            
            const volumeData = ChartUtils.processVolumeData(ohlcData);
            expect(volumeData).toHaveLength(2);
            
            expect(volumeData[0]).toEqual({
                time: '2023-01-01',
                value: 1000,
                color: '#26a69a'
            });
            
            expect(volumeData[1]).toEqual({
                time: '2023-01-02',
                value: 1500,
                color: '#26a69a'
            });
        });

        it('should apply colors based on price change', () => {
            const ohlcData = [
                { time: '2023-01-01', open: 100, high: 110, low: 90, close: 105, volume: 1000 }, // green
                { time: '2023-01-02', open: 105, high: 115, low: 95, close: 100, volume: 1500 }  // red
            ];
            
            const volumeData = ChartUtils.processVolumeData(ohlcData);
            expect(volumeData[0].color).toBe('#26a69a'); // green
            expect(volumeData[1].color).toBe('#ef5350'); // red
        });

        it('should handle missing volume data', () => {
            const ohlcData = [
                { time: '2023-01-01', open: 100, high: 110, low: 90, close: 105 }
            ];
            
            const volumeData = ChartUtils.processVolumeData(ohlcData);
            expect(volumeData).toHaveLength(1);
            expect(volumeData[0].value).toBe(0);
            expect(volumeData[0].color).toBe('rgba(0,0,0,0)');
        });
    });
}); 
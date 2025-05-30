// ChartConfig 单元测试
const { describe, it, expect } = require('@jest/globals');
const { ChartConfig } = require('../static/lightweight-charts.js');

describe('ChartConfig', () => {
    describe('DEFAULT_OPTIONS', () => {
        it('should have correct default options', () => {
            expect(ChartConfig.DEFAULT_OPTIONS).toBeDefined();
            expect(ChartConfig.DEFAULT_OPTIONS.width).toBe(1000);
            expect(ChartConfig.DEFAULT_OPTIONS.height).toBe(400);
            expect(ChartConfig.DEFAULT_OPTIONS.layout.background.color).toBe('#ffffff');
            expect(ChartConfig.DEFAULT_OPTIONS.layout.textColor).toBe('#333');
        });

        it('should have correct grid configuration', () => {
            const grid = ChartConfig.DEFAULT_OPTIONS.grid;
            expect(grid.vertLines.color).toBe('#e0e0e0');
            expect(grid.horzLines.color).toBe('#e0e0e0');
        });

        it('should have correct timeScale configuration', () => {
            const timeScale = ChartConfig.DEFAULT_OPTIONS.timeScale;
            expect(timeScale.timeVisible).toBe(true);
            expect(timeScale.secondsVisible).toBe(false);
            expect(timeScale.barSpacing).toBe(6);
            expect(timeScale.rightOffset).toBe(12);
        });
    });

    describe('CHART_TYPES', () => {
        it('should define all chart types', () => {
            expect(ChartConfig.CHART_TYPES.main).toBeDefined();
            expect(ChartConfig.CHART_TYPES.volume).toBeDefined();
            expect(ChartConfig.CHART_TYPES.indicator).toBeDefined();
        });

        it('should have correct main chart configuration', () => {
            const mainConfig = ChartConfig.CHART_TYPES.main;
            expect(mainConfig.height).toBe(400);
            expect(mainConfig.rightPriceScale.scaleMargins.top).toBe(0.05);
            expect(mainConfig.rightPriceScale.scaleMargins.bottom).toBe(0.35);
        });

        it('should have correct volume chart configuration', () => {
            const volumeConfig = ChartConfig.CHART_TYPES.volume;
            expect(volumeConfig.height).toBe(150);
            expect(volumeConfig.timeScale.timeVisible).toBe(false);
            expect(volumeConfig.rightPriceScale.scaleMargins.top).toBe(0.1);
        });
    });

    describe('validate()', () => {
        it('should return true for valid configuration', () => {
            expect(ChartConfig.validate()).toBe(true);
        });

        it('should validate with custom options', () => {
            const customOptions = { width: 800, height: 300 };
            expect(ChartConfig.validate(customOptions)).toBe(true);
        });
    });

    describe('getChartConfig()', () => {
        it('should return main chart config', () => {
            const config = ChartConfig.getChartConfig('main');
            expect(config.height).toBe(400);
            expect(config.timeScale.timeVisible).toBe(true);
            expect(config.rightPriceScale.scaleMargins.bottom).toBe(0.35);
        });

        it('should return volume chart config', () => {
            const config = ChartConfig.getChartConfig('volume');
            expect(config.height).toBe(150);
            expect(config.timeScale.timeVisible).toBe(false);
            expect(config.rightPriceScale.scaleMargins.top).toBe(0.1);
        });

        it('should return indicator chart config', () => {
            const config = ChartConfig.getChartConfig('indicator');
            expect(config.height).toBe(120);
            expect(config.timeScale.timeVisible).toBe(false);
            expect(config.rightPriceScale.scaleMargins.top).toBe(0.1);
        });

        it('should return default config for unknown type', () => {
            const config = ChartConfig.getChartConfig('unknown');
            expect(config.width).toBe(1000);
            expect(config.height).toBe(400);
        });

        it('should merge custom options', () => {
            const customOptions = { width: 1200 };
            const config = ChartConfig.getChartConfig('main', customOptions);
            expect(config.width).toBe(1200);
            expect(config.height).toBe(400);
        });
    });

    describe('getUnifiedTimeScale()', () => {
        it('should return unified time scale options', () => {
            const timeScale = ChartConfig.getUnifiedTimeScale();
            expect(timeScale.barSpacing).toBe(6);
            expect(timeScale.rightOffset).toBe(12);
            expect(timeScale.fixLeftEdge).toBe(false);
            expect(timeScale.fixRightEdge).toBe(false);
        });

        it('should override with custom options', () => {
            const customOptions = { barSpacing: 8, rightOffset: 16 };
            const timeScale = ChartConfig.getUnifiedTimeScale(customOptions);
            expect(timeScale.barSpacing).toBe(8);
            expect(timeScale.rightOffset).toBe(16);
        });
    });
}); 
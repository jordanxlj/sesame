// ChartConfig 单元测试
const { describe, it, expect } = require('@jest/globals');
const { ChartConfig } = require('../static/lightweight-charts.js');

describe('ChartConfig', () => {
    describe('DEFAULT_OPTIONS', () => {
        it('should have correct default options', () => {
            expect(ChartConfig.DEFAULT_OPTIONS).toBeDefined();
            expect(ChartConfig.DEFAULT_OPTIONS.width).toBe(1000);
            expect(ChartConfig.DEFAULT_OPTIONS.height).toBe(400);
            expect(ChartConfig.DEFAULT_OPTIONS.layout.backgroundColor).toBe('transparent');
            expect(ChartConfig.DEFAULT_OPTIONS.layout.textColor).toBe('#333');
        });

        it('should have correct grid configuration', () => {
            const grid = ChartConfig.DEFAULT_OPTIONS.grid;
            expect(grid.vertLines.color).toBe('#e1e1e1');
            expect(grid.horzLines.color).toBe('#e1e1e1');
        });

        it('should have correct timeScale configuration', () => {
            const timeScale = ChartConfig.DEFAULT_OPTIONS.timeScale;
            expect(timeScale.timeVisible).toBe(true);
            expect(timeScale.secondsVisible).toBe(false);
            expect(timeScale.barSpacing).toBe(6);
            expect(timeScale.rightOffset).toBe(12);
        });
    });

    describe('Chart configurations', () => {
        it('should define main chart configuration', () => {
            expect(ChartConfig.MAIN_CHART).toBeDefined();
            expect(ChartConfig.MAIN_CHART.height).toBe(400);
            expect(ChartConfig.MAIN_CHART.priceScale.scaleMargins.top).toBe(0.05);
            expect(ChartConfig.MAIN_CHART.priceScale.scaleMargins.bottom).toBe(0.35);
        });

        it('should define volume chart configuration', () => {
            expect(ChartConfig.VOLUME_CHART).toBeDefined();
            expect(ChartConfig.VOLUME_CHART.height).toBe(120);
            expect(ChartConfig.VOLUME_CHART.timeScale.timeVisible).toBe(false);
            expect(ChartConfig.VOLUME_CHART.priceScale.scaleMargins.top).toBe(0.65);
        });

        it('should define indicator chart configuration', () => {
            expect(ChartConfig.INDICATOR_CHART).toBeDefined();
            expect(ChartConfig.INDICATOR_CHART.height).toBe(150);
            expect(ChartConfig.INDICATOR_CHART.timeScale.timeVisible).toBe(true);
            expect(ChartConfig.INDICATOR_CHART.priceScale.scaleMargins.top).toBe(0.8);
        });
    });

    describe('validate()', () => {
        it('should return true for valid configuration', () => {
            expect(ChartConfig.validate()).toBe(true);
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
            expect(config.height).toBe(120);
            expect(config.timeScale.timeVisible).toBe(false);
            expect(config.rightPriceScale.scaleMargins.top).toBe(0.65);
        });

        it('should return indicator chart config', () => {
            const config = ChartConfig.getChartConfig('indicator');
            expect(config.height).toBe(150);
            expect(config.timeScale.timeVisible).toBe(true);
            expect(config.rightPriceScale.scaleMargins.top).toBe(0.8);
        });

        it('should return default config for unknown type', () => {
            const config = ChartConfig.getChartConfig('unknown');
            expect(config.width).toBe(1000);
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
    });
}); 